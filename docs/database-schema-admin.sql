-- 管理者用応募管理機能のためのデータベース設定
-- 既存のRLSポリシーに管理者権限を追加

-- ===== メールアドレス取得用のRPC関数 =====

-- ユーザーのメールアドレスを取得するRPC関数（管理者のみ）
CREATE OR REPLACE FUNCTION get_user_email(user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_email TEXT;
  current_user_email TEXT;
BEGIN
  -- 現在のユーザーのメールアドレスを取得
  SELECT email INTO current_user_email 
  FROM auth.users 
  WHERE id = auth.uid();
  
  -- 管理者権限をチェック
  IF current_user_email NOT IN (
    'admin@example.com',
    'shinjirutaro@gmail.com',
    'testuser001@gmail.com'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;
  
  -- 指定されたユーザーのメールアドレスを取得
  SELECT email INTO user_email 
  FROM auth.users 
  WHERE id = user_id;
  
  RETURN COALESCE(user_email, '不明');
END;
$$;

-- ===== 管理者用ポリシーの追加 =====

-- 管理者は全ての応募データを閲覧可能
CREATE POLICY "Admins can view all applications" ON job_applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email IN (
        'admin@example.com',
        'shinjirutaro@gmail.com',
        'testuser001@gmail.com'
      )
    )
  );

-- 管理者は全ての応募データを更新可能
CREATE POLICY "Admins can update all applications" ON job_applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email IN (
        'admin@example.com',
        'shinjirutaro@gmail.com',
        'testuser001@gmail.com'
      )
    )
  );

-- 管理者は全ての応募データを削除可能
CREATE POLICY "Admins can delete all applications" ON job_applications
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email IN (
        'admin@example.com',
        'shinjirutaro@gmail.com',
        'testuser001@gmail.com'
      )
    )
  );

-- 管理者は全てのユーザープロフィールを閲覧可能
CREATE POLICY "Admins can view all profiles" ON user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email IN (
        'admin@example.com',
        'shinjirutaro@gmail.com',
        'testuser001@gmail.com'
      )
    )
  );

-- ===== 応募統計用のビューを作成 =====

-- 応募統計ビュー（管理者のみアクセス可能）
CREATE OR REPLACE VIEW admin_application_stats AS
SELECT 
  COUNT(*) as total_applications,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
  COUNT(CASE WHEN status = 'reviewed' THEN 1 END) as reviewed_count,
  COUNT(CASE WHEN status = 'accepted' THEN 1 END) as accepted_count,
  COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_count,
  COUNT(CASE WHEN applied_at >= NOW() - INTERVAL '7 days' THEN 1 END) as this_week_count,
  COUNT(CASE WHEN applied_at >= NOW() - INTERVAL '30 days' THEN 1 END) as this_month_count
FROM job_applications;

-- ビューへのアクセス権限を管理者のみに制限
ALTER VIEW admin_application_stats OWNER TO postgres;

-- ===== 管理者用の便利な関数 =====

-- 応募者の詳細情報を取得する関数
CREATE OR REPLACE FUNCTION get_applicant_summary(user_id_param UUID)
RETURNS TABLE (
  user_email TEXT,
  display_name TEXT,
  full_name TEXT,
  total_applications BIGINT,
  latest_application_date TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.email as user_email,
    up.display_name,
    up.full_name,
    COUNT(ja.id) as total_applications,
    MAX(ja.applied_at) as latest_application_date
  FROM auth.users au
  LEFT JOIN user_profiles up ON au.id = up.user_id
  LEFT JOIN job_applications ja ON au.id = ja.user_id
  WHERE au.id = user_id_param
  GROUP BY au.email, up.display_name, up.full_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 求人別応募統計を取得する関数
CREATE OR REPLACE FUNCTION get_job_application_stats(job_id_param UUID)
RETURNS TABLE (
  job_title TEXT,
  total_applications BIGINT,
  pending_count BIGINT,
  reviewed_count BIGINT,
  accepted_count BIGINT,
  rejected_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    j.title as job_title,
    COUNT(ja.id) as total_applications,
    COUNT(CASE WHEN ja.status = 'pending' THEN 1 END) as pending_count,
    COUNT(CASE WHEN ja.status = 'reviewed' THEN 1 END) as reviewed_count,
    COUNT(CASE WHEN ja.status = 'accepted' THEN 1 END) as accepted_count,
    COUNT(CASE WHEN ja.status = 'rejected' THEN 1 END) as rejected_count
  FROM jobs j
  LEFT JOIN job_applications ja ON j.id = ja.job_id
  WHERE j.id = job_id_param
  GROUP BY j.title;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===== インデックスの追加（パフォーマンス向上） =====

-- 応募管理でよく使用される検索条件用のインデックス
CREATE INDEX IF NOT EXISTS idx_job_applications_status_applied_at ON job_applications(status, applied_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id_status ON job_applications(job_id, status);
CREATE INDEX IF NOT EXISTS idx_job_applications_user_id_applied_at ON job_applications(user_id, applied_at DESC);

-- ===== job_applicationsテーブルにメールアドレス追加 =====

-- 応募者のメールアドレスを保存するカラムを追加
ALTER TABLE job_applications 
ADD COLUMN IF NOT EXISTS applicant_email TEXT;

-- 既存の応募データにメールアドレスを更新（一回限りの処理）
CREATE OR REPLACE FUNCTION update_existing_application_emails()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  app_record RECORD;
  user_email TEXT;
BEGIN
  -- 既存の応募データをループして、メールアドレスが空の場合に更新
  FOR app_record IN 
    SELECT id, user_id 
    FROM job_applications 
    WHERE applicant_email IS NULL OR applicant_email = ''
  LOOP
    -- auth.usersテーブルからメールアドレスを取得
    SELECT email INTO user_email 
    FROM auth.users 
    WHERE id = app_record.user_id;
    
    -- 取得できた場合は更新
    IF user_email IS NOT NULL THEN
      UPDATE job_applications 
      SET applicant_email = user_email 
      WHERE id = app_record.id;
    END IF;
  END LOOP;
END;
$$;

-- 関数を実行して既存データを更新
SELECT update_existing_application_emails();

-- 関数を削除（一回限りの処理なので）
DROP FUNCTION update_existing_application_emails();

-- ===== 確認メッセージ =====
SELECT 'Admin application management policies and functions created successfully!' as result; 