-- Supabase Storage設定: 画像アップロード機能
-- 管理者のみアップロード・削除可能、全員閲覧可能

-- 1. job-imagesバケットの作成（もし存在しない場合）
INSERT INTO storage.buckets (id, name, public)
VALUES ('job-images', 'job-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. ストレージポリシーの設定

-- 全員が画像を閲覧可能（パブリック読み込み）
CREATE POLICY "Public read access for job images" ON storage.objects
FOR SELECT USING (bucket_id = 'job-images');

-- 管理者のみが画像をアップロード可能
CREATE POLICY "Admin upload access for job images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'job-images' 
  AND auth.jwt() ->> 'email' IN (
    'admin@example.com',
    'shinjirutaro@gmail.com',
    'testuser001@gmail.com'
  )
);

-- 管理者のみが画像を更新可能
CREATE POLICY "Admin update access for job images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'job-images' 
  AND auth.jwt() ->> 'email' IN (
    'admin@example.com',
    'shinjirutaro@gmail.com',
    'testuser001@gmail.com'
  )
);

-- 管理者のみが画像を削除可能
CREATE POLICY "Admin delete access for job images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'job-images' 
  AND auth.jwt() ->> 'email' IN (
    'admin@example.com',
    'shinjirutaro@gmail.com',
    'testuser001@gmail.com'
  )
);

-- 確認: 作成されたバケットとポリシーをチェック
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'job-images';

-- ポリシーの確認
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%job images%'; 