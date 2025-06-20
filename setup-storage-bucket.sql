-- 1. job-imagesバケットの作成（もし存在しない場合）
INSERT INTO storage.buckets (id, name, public)
VALUES ('job-images', 'job-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. 既存のポリシーがある場合は削除
DROP POLICY IF EXISTS "Public read access for job images" ON storage.objects;
DROP POLICY IF EXISTS "Admin upload access for job images" ON storage.objects;
DROP POLICY IF EXISTS "Admin update access for job images" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete access for job images" ON storage.objects;

-- 3. 新しいポリシーを作成

-- 全員が画像を閲覧可能（パブリック読み込み）
CREATE POLICY "Public read access for job images" ON storage.objects
FOR SELECT USING (bucket_id = 'job-images');

-- 認証済みユーザーが画像をアップロード可能（管理者チェックを削除）
CREATE POLICY "Authenticated upload access for job images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'job-images' 
  AND auth.role() = 'authenticated'
);

-- 認証済みユーザーが画像を更新可能
CREATE POLICY "Authenticated update access for job images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'job-images' 
  AND auth.role() = 'authenticated'
);

-- 認証済みユーザーが画像を削除可能
CREATE POLICY "Authenticated delete access for job images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'job-images' 
  AND auth.role() = 'authenticated'
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
