-- お問い合わせテーブルの作成
CREATE TABLE contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('account', 'job', 'technical', 'feature', 'business', 'other')),
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'closed')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックスの作成
CREATE INDEX idx_contact_messages_status ON contact_messages(status);
CREATE INDEX idx_contact_messages_category ON contact_messages(category);
CREATE INDEX idx_contact_messages_created_at ON contact_messages(created_at);
CREATE INDEX idx_contact_messages_email ON contact_messages(email);

-- RLSポリシーの設定
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- 管理者のみ全てのお問い合わせを閲覧・編集可能
CREATE POLICY "管理者はお問い合わせを全て閲覧可能" ON contact_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email IN (
        'admin@example.com',
        'shin@example.com'
      )
    )
  );

CREATE POLICY "管理者はお問い合わせを更新可能" ON contact_messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email IN (
        'admin@example.com',
        'shin@example.com'
      )
    )
  );

-- 一般ユーザーは自分のお問い合わせのみ閲覧可能（将来的な拡張用）
CREATE POLICY "ユーザーは自分のお問い合わせを閲覧可能" ON contact_messages
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND 
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- 全ユーザーがお問い合わせを作成可能
CREATE POLICY "誰でもお問い合わせを作成可能" ON contact_messages
  FOR INSERT WITH CHECK (true);

-- 更新日時の自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_contact_messages_updated_at 
  BEFORE UPDATE ON contact_messages 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 初期データの挿入（テスト用）
INSERT INTO contact_messages (name, email, category, subject, message, status) VALUES
  ('山田太郎', 'yamada@example.com', 'account', 'ログインできません', 'パスワードを忘れてしまい、ログインできない状況です。リセット方法を教えてください。', 'new'),
  ('佐藤花子', 'sato@example.com', 'job', '求人応募について', '応募した求人の選考状況を確認したいのですが、どこで確認できますか？', 'in_progress'),
  ('田中一郎', 'tanaka@example.com', 'technical', 'サイトエラー', 'ページを開こうとすると500エラーが表示されます。', 'resolved'); 