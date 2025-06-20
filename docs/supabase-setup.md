# Supabaseセットアップ手順

## 1. 基本テーブル作成

### jobsテーブル（既存）
```sql
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  tags TEXT[] NOT NULL,
  imageurl TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 2. マイページ機能用テーブル

以下のSQLを順番に実行してください：

### user_profilesテーブル
```sql
-- ユーザープロフィールテーブル
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 基本情報
  display_name TEXT,
  full_name TEXT, -- 氏名（フルネーム）
  full_name_kana TEXT, -- フリガナ
  bio TEXT,
  avatar_url TEXT,
  location TEXT,
  website TEXT,
  organization TEXT, -- 所属（学校名または会社名）
  
  -- 職歴・スキル情報
  skills TEXT[],
  experience_years INTEGER,
  
  -- 活動希望エリア（複数選択可）
  preferred_areas TEXT[], -- ['全国', 'オンライン', '東京都', 'その他：○○']
  
  -- 興味のある分野（複数選択可）
  interested_fields TEXT[], -- ['地方創生', 'スタートアップ', '自己成長したい']
  
  -- 自己PR
  self_promotion TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);
```

### その他のテーブル（お気に入り、応募履歴等）
```sql
-- お気に入り求人テーブル
CREATE TABLE IF NOT EXISTS user_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, job_id)
);

-- 求人応募テーブル
CREATE TABLE IF NOT EXISTS job_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected')) DEFAULT 'pending',
  cover_letter TEXT,
  resume_url TEXT,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ユーザー設定テーブル
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT true,
  job_alerts BOOLEAN DEFAULT true,
  preferred_job_types TEXT[],
  preferred_locations TEXT[],
  salary_range_min INTEGER,
  salary_range_max INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ユーザーアクティビティテーブル
CREATE TABLE IF NOT EXISTS user_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('job_view', 'job_favorite', 'job_apply', 'profile_update')),
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 3. Row Level Security (RLS) の設定

```sql
-- ユーザープロフィールのRLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- お気に入りのRLS
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorites" ON user_favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites" ON user_favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON user_favorites
  FOR DELETE USING (auth.uid() = user_id);

-- 求人応募のRLS
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own applications" ON job_applications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own applications" ON job_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own applications" ON job_applications
  FOR UPDATE USING (auth.uid() = user_id);

-- ユーザー設定のRLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON user_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- アクティビティのRLS
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activities" ON user_activities
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activities" ON user_activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## 4. インデックスの作成

```sql
-- パフォーマンス向上のためのインデックス
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_job_id ON user_favorites(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_user_id ON job_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status);
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON user_activities(created_at);
```

## 5. トリガー関数の作成

```sql
-- プロフィール更新時のタイムスタンプ更新
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- トリガーの作成
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_applications_updated_at 
  BEFORE UPDATE ON job_applications 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at 
  BEFORE UPDATE ON user_settings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 6. サンプルデータの挿入（任意）

```sql
-- サンプル求人データ
INSERT INTO jobs (title, summary, tags, imageurl, content)
VALUES 
  ('フロントエンドエンジニア', 'React、Next.js、TypeScriptを使用したWebアプリケーション開発', ARRAY['React', 'Next.js', 'TypeScript'], 'https://images.unsplash.com/photo-1498050108023-c5249f4df085', 'フロントエンドエンジニアとして、当社のWebアプリケーション開発に参加していただきます。React、Next.js、TypeScriptを使用した開発経験がある方を求めています。'),
  ('バックエンドエンジニア', 'Node.js、Express、PostgreSQLを使用したAPI開発', ARRAY['Node.js', 'Express', 'PostgreSQL'], 'https://images.unsplash.com/photo-1555066931-4365d14bab8c', 'バックエンドエンジニアとして、当社のAPIサーバー開発に参加していただきます。Node.js、Express、PostgreSQLを使用した開発経験がある方を求めています。'),
  ('フルスタックエンジニア', 'フロントエンドからバックエンドまで幅広い開発', ARRAY['React', 'Node.js', 'MongoDB'], 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97', 'フルスタックエンジニアとして、当社のWebアプリケーション開発に参加していただきます。フロントエンドからバックエンドまで幅広い開発経験がある方を求めています。');
```

## 注意事項

1. **環境変数の設定**: `.env.local`ファイルにSupabaseの接続情報を設定してください
2. **Auth設定**: Supabaseダッシュボードで認証プロバイダーを有効にしてください
3. **テストデータ**: 開発環境では、必要に応じてサンプルデータを追加してください
4. **セキュリティ**: 本番環境では、RLSポリシーを適切に設定してください 