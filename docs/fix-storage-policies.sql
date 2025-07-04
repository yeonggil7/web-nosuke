-- ストレージポリシーエラー修正用SQL
-- 「policy already exists」エラーが発生した場合に実行してください

-- 1. 既存のポリシーをすべて削除
DROP POLICY IF EXISTS "Public read access for job images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload access for job images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update access for job images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete access for job images" ON storage.objects;
DROP POLICY IF EXISTS "Admin upload access for job images" ON storage.objects;
DROP POLICY IF EXISTS "Admin update access for job images" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete access for job images" ON storage.objects;

-- 2. バケットが存在しない場合は作成
INSERT INTO storage.buckets (id, name, public)
VALUES ('job-images', 'job-images', true)
ON CONFLICT (id) DO NOTHING;

-- 3. 新しいポリシーを作成

-- パブリック読み込み
CREATE POLICY "Public read access for job images" ON storage.objects
FOR SELECT USING (bucket_id = 'job-images');

-- 認証済みユーザーのアップロード
CREATE POLICY "Authenticated upload access for job images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'job-images' 
  AND auth.role() = 'authenticated'
);

-- 認証済みユーザーの更新
CREATE POLICY "Authenticated update access for job images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'job-images' 
  AND auth.role() = 'authenticated'
);

-- 認証済みユーザーの削除
CREATE POLICY "Authenticated delete access for job images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'job-images' 
  AND auth.role() = 'authenticated'
);

-- 4. 結果確認
SELECT 'ポリシー修正完了' as message;

SELECT 
  policyname,
  cmd as operation,
  qual as condition
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%job images%'; 