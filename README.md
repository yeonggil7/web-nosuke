# ジョブポスティングサイト

Next.js + Cloudflare Pages + Functions + Supabase + Cursol AIを使用したジョブポスティングサイトです。

## 機能

- 求人一覧表示
- 求人詳細表示
- ユーザー認証（ログイン・サインアップ）
- マイページ

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

### 4. 開発サーバーの起動

```bash
npm run dev
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
