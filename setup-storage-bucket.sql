-- ストレージバケット作成とポリシー設定（既存ポリシー対応版）
-- Supabaseダッシュボードの「SQL Editor」で実行してください

-- 1. job-imagesバケットの作成
INSERT INTO storage.buckets (id, name, public)
VALUES ('job-images', 'job-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. 既存のポリシーを確実に削除
DO $$
BEGIN
    -- 既存のポリシーを削除（エラーが出ても続行）
    DROP POLICY IF EXISTS "Public read access for job images" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated upload access for job images" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated update access for job images" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated delete access for job images" ON storage.objects;
    DROP POLICY IF EXISTS "Admin upload access for job images" ON storage.objects;
    DROP POLICY IF EXISTS "Admin update access for job images" ON storage.objects;
    DROP POLICY IF EXISTS "Admin delete access for job images" ON storage.objects;
    
    RAISE NOTICE '既存ポリシーの削除完了';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'ポリシー削除時にエラーが発生しましたが続行します: %', SQLERRM;
END $$;

-- 3. 新しいポリシーを作成

-- パブリック読み込み（全員が画像を閲覧可能）
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

-- 4. 確認クエリ
SELECT 
  'バケット作成完了' as status,
  id,
  name,
  public,
  created_at
FROM storage.buckets 
WHERE id = 'job-images';

-- 5. ポリシー確認
SELECT 
  'ポリシー作成完了' as status,
  policyname,
  cmd as operation
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%job images%';
