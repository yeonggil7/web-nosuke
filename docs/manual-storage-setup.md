# Supabaseストレージ手動設定ガイド

## 🚨 AuthSessionMissingError解決方法

### ステップ1: Supabaseダッシュボードでストレージ設定

1. **Supabaseダッシュボードにアクセス**
   - [https://app.supabase.com](https://app.supabase.com) にログイン
   - プロジェクト「web-nosuke」を選択

2. **ストレージ設定**
   - 左メニューから「Storage」をクリック
   - 「Create a new bucket」ボタンをクリック
   - バケット名: `job-images`
   - Public bucket: ✅ チェックを入れる
   - 「Create bucket」をクリック

3. **SQL Editorでポリシー設定**
   - 左メニューから「SQL Editor」をクリック
   - 「New query」をクリック
   - 以下のSQLを貼り付けて実行：

```sql
-- 既存ポリシーの削除（エラーが出ても問題なし）
DROP POLICY IF EXISTS "Public read access for job images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload access for job images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update access for job images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete access for job images" ON storage.objects;

-- 新しいポリシーの作成
CREATE POLICY "Public read access for job images" ON storage.objects
FOR SELECT USING (bucket_id = 'job-images');

CREATE POLICY "Authenticated upload access for job images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'job-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated update access for job images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'job-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated delete access for job images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'job-images' 
  AND auth.role() = 'authenticated'
);
```

4. **設定確認**
   - 以下のSQLで確認：

```sql
-- バケット確認
SELECT id, name, public FROM storage.buckets WHERE id = 'job-images';

-- ポリシー確認
SELECT policyname, cmd FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage'
AND policyname LIKE '%job images%';
```

### ステップ2: 認証状態の確認

1. **管理者アカウントでログイン**
   - ブラウザで `http://localhost:3000/login` にアクセス
   - 管理者メールアドレスでログイン
   - ログイン後、`/admin` ページにアクセスできることを確認

2. **ブラウザのセッション確認**
   - F12でデベロッパーツールを開く
   - Application/Storage タブ
   - Local Storage → `http://localhost:3000`
   - `sb-baktuzfzixpnkftajmfz-auth-token` が存在することを確認

### ステップ3: アプリケーション再起動

```bash
# 開発サーバー再起動
npm run dev
```

### ステップ4: 動作確認

1. 管理者でログイン
2. `/admin/jobs/new` にアクセス
3. 画像アップロード機能をテスト

## トラブルシューティング

### 問題1: バケットが作成されない
- Supabaseダッシュボードで手動作成
- プロジェクトの権限を確認

### 問題2: ポリシーエラー
- 既存ポリシーを手動削除
- SQLエディターで一つずつ実行

### 問題3: 認証エラーが続く
- ブラウザのキャッシュクリア
- ログアウト→再ログイン
- 開発サーバー再起動

### 問題4: 管理者権限がない
- `src/lib/auth.ts`の`ADMIN_EMAILS`を確認
- 自分のメールアドレスが含まれているか確認

## 確認コマンド

```bash
# ストレージバケット確認
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://baktuzfzixpnkftajmfz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJha3R1emZ6aXhwbmtmdGFqbWZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzMTQ3MjIsImV4cCI6MjA2NTg5MDcyMn0.DTMwTRXX73BPOptjkGQGFFwsSOXhMG22w3SPc9AKoQ0'
);
supabase.storage.listBuckets().then(({data, error}) => {
  console.log('バケット:', data?.map(b => b.name) || 'なし');
  console.log('エラー:', error?.message || 'なし');
});
"
``` 