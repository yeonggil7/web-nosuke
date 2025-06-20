-- job_applicationsテーブルにメールアドレスカラムを追加し、既存データを更新

-- 1. applicant_emailカラムを追加
ALTER TABLE job_applications 
ADD COLUMN IF NOT EXISTS applicant_email TEXT;

-- 2. 既存の応募データにメールアドレスを更新
-- （これは既存のデータがある場合の処理）
UPDATE job_applications 
SET applicant_email = (
  SELECT email 
  FROM auth.users 
  WHERE auth.users.id = job_applications.user_id
)
WHERE applicant_email IS NULL OR applicant_email = '';

-- 3. 今後の応募データでは、自動的にメールアドレスが保存されるように
-- アプリケーション側のapplyToJob関数で処理

-- 確認: 更新されたデータをチェック
SELECT 
  ja.id,
  ja.user_id,
  ja.applicant_email,
  ja.applied_at,
  j.title as job_title,
  up.display_name
FROM job_applications ja
LEFT JOIN jobs j ON ja.job_id = j.id
LEFT JOIN user_profiles up ON ja.user_id = up.user_id
ORDER BY ja.applied_at DESC
LIMIT 10; 