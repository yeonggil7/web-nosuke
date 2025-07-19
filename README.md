# FindOut Career - キャリア発見プラットフォーム

## 🌐 本番サイト

**https://findout-career.com**

## 🚨 緊急: AuthSessionMissingError解決方法

**画像アップロード時に「AuthSessionMissingError: Auth session missing!」エラーが発生している場合:**

### 🔧 即座に実行すべき手順

1. **Supabaseダッシュボードでストレージバケット作成**
   - [https://app.supabase.com](https://app.supabase.com) にログイン
   - プロジェクト「web-nosuke」を選択
   - 左メニュー「Storage」→「Create a new bucket」
   - バケット名: `job-images`
   - Public bucket: ✅ **必ずチェック**
   - 「Create bucket」をクリック

2. **RLSポリシー設定**
   - 左メニュー「SQL Editor」→「New query」
   - 以下のSQLを実行:

```sql
-- 認証済みユーザーのアップロード許可
CREATE POLICY "Authenticated upload access for job images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'job-images' 
  AND auth.role() = 'authenticated'
);

-- パブリック読み込み許可
CREATE POLICY "Public read access for job images" ON storage.objects
FOR SELECT USING (bucket_id = 'job-images');
```

3. **管理者アカウントでログイン確認**
   - `https://findout-career.com/login` でログイン
   - `/admin` ページにアクセスできることを確認

4. **開発サーバー再起動**
```bash
# 現在のサーバーを停止
Ctrl + C

# 再起動
npm run dev
```

### ✅ 解決確認
- 管理者でログイン → `/admin/jobs/new` → 画像アップロードテスト
- エラーが解消されていれば成功！

---

## 📋 プロジェクト概要

**FindOut Career** は、あなたのキャリアを発見し、理想の未来を実現するためのプラットフォームです。

Next.js + Cloudflare Pages + Functions + Supabase + Cursor AIを使用したモダンなジョブポスティングサイトです。

## ✨ 主な機能

- 🔍 **求人検索・一覧表示** - 高度な検索機能とフィルタリング
- 📄 **求人詳細表示** - 詳細な求人情報と応募機能
- 👤 **ユーザー認証** - セキュアなログイン・サインアップ
- 📊 **マイページ** - プロフィール管理と応募履歴
- ⚙️ **管理者機能** - 求人編集・管理者管理・応募管理
- 📱 **レスポンシブデザイン** - あらゆるデバイスに対応

## 🛠 技術スタック

- **フロントエンド**: Next.js 15, TypeScript, Tailwind CSS
- **バックエンド**: Supabase（認証・データベース・ストレージ）
- **デプロイ**: Cloudflare Pages & Functions
- **開発支援**: Cursor AI

## 🚀 セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local`ファイルを作成し、以下の環境変数を設定します：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=https://findout-career.com
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
   - Site URL: `https://findout-career.com`
   - Redirect URLs: 
     - `https://findout-career.com/login`
     - `https://findout-career.com/auth/callback`

### 4. 管理者アカウントの作成

管理者機能を使用するには、管理者アカウントを作成する必要があります。

#### 方法1: 既存ユーザーを管理者に昇格（推奨）

1. 通常通りアカウントを作成してログイン
2. `src/lib/auth.ts` ファイルの `ADMIN_EMAILS` 配列に自分のメールアドレスを追加：

```typescript
const ADMIN_EMAILS = [
  'admin@findout-career.com',
  'your-email@example.com'  // ここに追加
];
```

3. 開発サーバーを再起動

#### 方法2: 管理者ページから追加

1. 既存の管理者アカウントでログイン
2. `/admin` ページにアクセス
3. 「新しい管理者を追加」フォームを使用
4. 表示された手順に従って設定

### 5. 開発サーバーの起動

```bash
npm run dev
```

ローカル環境: http://localhost:3000

## 🔧 管理者機能

管理者アカウントでログインすると、以下の機能が利用できます：

- **🎯 求人編集**: 求人カードの編集ボタン（📝）から直接編集
- **📝 求人詳細編集**: 求人詳細ページでインライン編集
- **🏠 管理者ページ**: `/admin` でダッシュボードと管理機能にアクセス
- **📋 応募管理**: `/admin/applications` で全応募データの管理・確認
- **👥 管理者権限管理**: 他のユーザーを管理者に昇格
- **📷 画像アップロード**: 求人作成・編集時に画像ファイルを直接アップロード

## 🌐 ドメイン設定

### 🎯 本番環境

**https://findout-career.com**

### 📋 ドメイン設定手順

詳細な設定手順は `docs/domain-setup-guide.md` をご参照ください。

#### 主要な設定項目

1. **Cloudflareドメイン設定**
   - ネームサーバー変更
   - SSL証明書設定

2. **Cloudflare Pages設定**
   - カスタムドメイン追加
   - 環境変数設定

3. **Supabase認証設定**
   - Site URL: `https://findout-career.com`
   - Redirect URLs設定

## 🚀 デプロイ

### Cloudflare Pages

1. GitHubリポジトリに接続
2. ビルド設定:
   - Framework preset: Next.js
   - Build command: `npm run build`
   - Build output directory: `.next`
3. 環境変数の設定:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL=https://findout-career.com`

詳細な本番環境設定は `docs/production-env-vars.md` をご参照ください。

## 📞 サポート・お問い合わせ

- **メール**: info@findout-career.com
- **サポート**: support@findout-career.com
- **ウェブサイト**: https://findout-career.com

## 📄 ライセンス

This project is developed with Next.js.

---

**FindOut Career** - あなたのキャリアを発見し、理想の未来を実現するプラットフォーム。
