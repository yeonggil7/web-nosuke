-- ストレージ設定完全リセット用SQL
-- Supabaseダッシュボードの「SQL Editor」で実行してください

-- ========================================
-- ステップ1: 既存のポリシーを完全削除
-- ========================================

-- 既存のjob-images関連ポリシーをすべて削除
DROP POLICY IF EXISTS "Public read access for job images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload access for job images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update access for job images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete access for job images" ON storage.objects;
DROP POLICY IF EXISTS "Admin upload access for job images" ON storage.objects;
DROP POLICY IF EXISTS "Admin update access for job images" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete access for job images" ON storage.objects;

-- その他の可能性のあるポリシー名も削除
DROP POLICY IF EXISTS "job-images-read" ON storage.objects;
DROP POLICY IF EXISTS "job-images-upload" ON storage.objects;
DROP POLICY IF EXISTS "job-images-update" ON storage.objects;
DROP POLICY IF EXISTS "job-images-delete" ON storage.objects;

-- ========================================
-- ステップ2: 既存のバケットを削除（ファイルも一緒に削除される）
-- ========================================

-- job-imagesバケット内のファイルをすべて削除
DELETE FROM storage.objects WHERE bucket_id = 'job-images';

-- job-imagesバケットを削除
DELETE FROM storage.buckets WHERE id = 'job-images';

-- ========================================
-- ステップ3: クリーンな状態を確認
-- ========================================

-- バケット一覧確認（job-imagesが無いことを確認）
SELECT 'バケット一覧' as check_type, id, name, public 
FROM storage.buckets;

-- ポリシー一覧確認（job images関連が無いことを確認）
SELECT 'ポリシー一覧' as check_type, policyname, cmd as operation
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%job%';

-- 完了メッセージ
SELECT '🧹 ストレージ設定が完全にリセットされました' as status; 