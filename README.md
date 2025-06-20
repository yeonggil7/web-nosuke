# ジョブポスティングサイト

Next.js + Cloudflare Pages + Functions + Supabase + Cursol AIを使用したジョブポスティングサイトです。

## 機能

- 求人一覧表示
- 求人詳細表示
- ユーザー認証（ログイン・サインアップ）
- マイページ
- **管理者機能（求人編集・管理者管理）**

## 技術スタック

- Next.js 15
- TypeScript
- Tailwind CSS
- Supabase（認証・データベース）
- Cloudflare Pages & Functions

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local`ファイルを作成し、以下の環境変数を設定します：

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Supabaseのセットアップ

#### データベース設定

以下のSQLを実行してテーブルを作成します：

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

-- サンプルデータを挿入
INSERT INTO jobs (title, summary, tags, imageurl, content)
VALUES 
  ('フロントエンドエンジニア', 'React、Next.js、TypeScriptを使用したWebアプリケーション開発', ARRAY['React', 'Next.js', 'TypeScript'], 'https://images.unsplash.com/photo-1498050108023-c5249f4df085', 'フロントエンドエンジニアとして、当社のWebアプリケーション開発に参加していただきます。React、Next.js、TypeScriptを使用した開発経験がある方を求めています。'),
  ('バックエンドエンジニア', 'Node.js、Express、PostgreSQLを使用したAPI開発', ARRAY['Node.js', 'Express', 'PostgreSQL'], 'https://images.unsplash.com/photo-1555066931-4365d14bab8c', 'バックエンドエンジニアとして、当社のAPIサーバー開発に参加していただきます。Node.js、Express、PostgreSQLを使用した開発経験がある方を求めています。'),
  ('フルスタックエンジニア', 'フロントエンドからバックエンドまで幅広い開発', ARRAY['React', 'Node.js', 'MongoDB'], 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97', 'フルスタックエンジニアとして、当社のWebアプリケーション開発に参加していただきます。フロントエンドからバックエンドまで幅広い開発経験がある方を求めています。');
```

#### 認証設定

1. Supabaseダッシュボードの「Authentication」メニューを開きます
2. 「Providers」タブで「Email」を有効にします
3. 「Settings」タブで以下の設定を行います：
   - Site URL: あなたのサイトのURL（ローカル開発の場合は `http://localhost:3000`）
   - Redirect URLs: `http://localhost:3000/login` を追加

### 4. 管理者アカウントの作成

管理者機能を使用するには、管理者アカウントを作成する必要があります。

#### 方法1: 既存ユーザーを管理者に昇格（推奨）

1. 通常通りアカウントを作成してログイン
2. `src/lib/auth.ts` ファイルの `ADMIN_EMAILS` 配列に自分のメールアドレスを追加：

```typescript
const ADMIN_EMAILS = [
  'admin@example.com',
  'your-email@example.com'  // ここに追加
];
```

3. 開発サーバーを再起動

#### 方法2: 新しい管理者アカウントを作成

1. プロジェクトルートで以下のコマンドを実行：

```bash
node create-admin-user.js
```

2. スクリプトの指示に従って設定
3. 必要に応じてSupabaseダッシュボードでメール確認を有効化
4. `src/lib/auth.ts` の `ADMIN_EMAILS` に新しいメールアドレスを追加

#### 方法3: 管理者ページから追加

1. 既存の管理者アカウントでログイン
2. `/admin` ページにアクセス
3. 「新しい管理者を追加」フォームを使用
4. 表示された手順に従って設定

### 5. 開発サーバーの起動

```bash
npm run dev
```

## 管理者機能

管理者アカウントでログインすると、以下の機能が利用できます：

- **求人編集**: 求人カードの編集ボタン（📝）から直接編集
- **求人詳細編集**: 求人詳細ページでインライン編集
- **管理者ページ**: `/admin` でダッシュボードと管理機能にアクセス
- **応募管理**: `/admin/applications` で全応募データの管理・確認
- **管理者権限管理**: 他のユーザーを管理者に昇格
- **画像アップロード**: 求人作成・編集時に画像ファイルを直接アップロード

### 画像アップロード機能

求人作成・編集時に以下の方法で画像を設定できます：

#### 📁 ファイルアップロード
- **対応形式**: JPEG, PNG, GIF, WebP
- **最大サイズ**: 10MB
- **操作方法**: 
  - ドラッグ&ドロップでファイルを選択
  - クリックしてファイル選択ダイアログを開く
- **保存先**: Supabase Storage (`job-images`バケット)

#### 🔗 URL指定
- **外部画像サイト**: Unsplash、Pixabay、Pexels等のURLを指定
- **プレビュー機能**: 設定前に画像をプレビュー表示

#### セキュリティ
- **アップロード権限**: 管理者のみ
- **削除権限**: 管理者のみ  
- **閲覧権限**: 全員（パブリック）

### Supabase Storage設定

画像アップロード機能を使用するには、Supabaseで以下の設定が必要です：

```sql
-- docs/supabase-storage-setup.sql の内容をSupabaseダッシュボードで実行
-- 1. job-imagesバケットの作成
-- 2. 管理者用アップロード・削除ポリシー
-- 3. パブリック読み込みポリシー
```

### 応募管理機能

応募管理ページ（`/admin/applications`）では以下の機能が利用できます：

- **統計ダッシュボード**: 応募総数、ステータス別集計、期間別集計
- **フィルタリング**: ステータス、検索、ソート機能
- **ステータス管理**: 応募ステータスの更新
- **応募者情報**: 名前、メールアドレス、志望動機の確認
- **データ削除**: 不要な応募データの削除

#### メールアドレス表示について

- **新規応募**: 今後の応募では自動的にメールアドレスが保存されます
- **既存応募**: データベース更新が必要な場合があります

既存の応募データでメールアドレスが表示されない場合は、以下のSQLを実行してください：

```sql
-- Supabaseダッシュボードで以下のSQLを実行
ALTER TABLE job_applications 
ADD COLUMN IF NOT EXISTS applicant_email TEXT;

UPDATE job_applications 
SET applicant_email = (
  SELECT email 
  FROM auth.users 
  WHERE auth.users.id = job_applications.user_id
)
WHERE applicant_email IS NULL OR applicant_email = '';
```

## デプロイ

### Cloudflare Pages

1. GitHubリポジトリに接続
2. ビルド設定:
   - Framework preset: Next.js
   - Build command: `npm run build`
   - Build output directory: `.next`
3. 環境変数の設定:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
