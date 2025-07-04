# 🌐 ドメイン設定ガイド: rootscareer.jp

## 📋 必要な作業一覧

### 1. Cloudflareでのドメイン管理設定

#### ステップ1: Cloudflareにドメインを追加
1. [Cloudflareダッシュボード](https://dash.cloudflare.com) にログイン
2. 「Add a Site」をクリック
3. `rootscareer.jp` を入力
4. プランを選択（Freeプランでも可能）
5. Cloudflareが提供するネームサーバーを確認

#### ステップ2: ドメインレジストラでネームサーバー変更
1. ドメインを取得したレジストラ（お名前.com、ムームードメイン等）にログイン
2. `rootscareer.jp` のネームサーバー設定を変更
3. Cloudflareが提供した2つのネームサーバーに変更：
   - `xxx.ns.cloudflare.com`
   - `yyy.ns.cloudflare.com`
4. 変更の反映を待つ（最大48時間、通常は1-2時間）

### 2. Cloudflare Pages プロジェクト設定

#### ステップ1: カスタムドメインの追加
1. [Cloudflare Pages ダッシュボード](https://dash.cloudflare.com/pages) にアクセス
2. `web-nosuke` プロジェクトを選択
3. 「Custom domains」タブを選択
4. 「Set up a custom domain」をクリック
5. `rootscareer.jp` を入力
6. DNS設定を確認・承認

#### ステップ2: SSL証明書の設定
- Cloudflareが自動的にSSL/TLS証明書を発行
- 「Always Use HTTPS」を有効化
- 「Automatic HTTPS Rewrites」を有効化

### 3. アプリケーション設定の更新

#### 環境変数の更新
以下の環境変数をCloudflare Pagesで設定：

```bash
# 本番環境用
NEXT_PUBLIC_SITE_URL=https://rootscareer.jp
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### Supabase認証設定の更新
1. [Supabaseダッシュボード](https://app.supabase.com) にログイン
2. プロジェクト「web-nosuke」を選択
3. 「Authentication」→「Settings」
4. 以下のURLを追加：
   - Site URL: `https://rootscareer.jp`
   - Redirect URLs: 
     - `https://rootscareer.jp/login`
     - `https://rootscareer.jp/auth/callback`

### 4. DNS設定の確認

以下のDNSレコードが正しく設定されていることを確認：

```
# Aレコード
rootscareer.jp → Cloudflare Pages IP (自動設定)

# CNAMEレコード
www.rootscareer.jp → rootscareer.jp

# TXTレコード（オプション）
rootscareer.jp → "v=spf1 include:_spf.google.com ~all" (メール設定用)
```

### 5. テスト手順

#### ステップ1: ドメインアクセステスト
1. ブラウザで `https://rootscareer.jp` にアクセス
2. サイトが正しく表示されることを確認
3. `https://www.rootscareer.jp` も確認

#### ステップ2: 機能テスト
1. ユーザー登録・ログイン機能
2. 管理者機能
3. 画像アップロード機能
4. 求人検索機能

### 6. SEO設定の更新

#### Google Search Console
1. [Google Search Console](https://search.google.com/search-console) に新しいドメインを追加
2. サイトマップを送信: `https://rootscareer.jp/sitemap.xml`

#### Google Analytics（オプション）
1. 新しいプロパティとして `rootscareer.jp` を追加
2. トラッキングコードを確認

### 7. リダイレクト設定（必要に応じて）

古いドメインから新しいドメインへのリダイレクトが必要な場合：

```javascript
// Cloudflare Pages _redirects ファイル
https://old-domain.com/* https://rootscareer.jp/:splat 301
```

## 🚨 注意事項

### セキュリティ
- HTTPS接続を必ず有効化
- HSTS（HTTP Strict Transport Security）の設定を推奨
- CSP（Content Security Policy）ヘッダーの設定

### パフォーマンス
- Cloudflareのキャッシュ設定を最適化
- 画像最適化の設定
- 圧縮設定の有効化

### バックアップ
- DNS設定の記録を保存
- 設定変更前の状態を記録

## 📞 トラブルシューティング

### よくある問題

#### 1. ドメインが反映されない
- DNS伝播に最大48時間かかる場合がある
- `dig rootscareer.jp` コマンドでDNS設定を確認

#### 2. SSL証明書エラー
- Cloudflareの「SSL/TLS」設定を「Full (strict)」に変更
- 証明書の発行に数分かかる場合がある

#### 3. 認証エラー
- Supabaseの「Redirect URLs」設定を確認
- ブラウザのキャッシュをクリア

#### 4. 画像が表示されない
- `next.config.ts` の `images.remotePatterns` を確認
- CloudflareのSecurity設定を確認

## 📋 完了チェックリスト

- [ ] Cloudflareにドメイン追加
- [ ] ネームサーバー変更
- [ ] Cloudflare Pagesにカスタムドメイン設定
- [ ] SSL証明書設定
- [ ] 環境変数更新
- [ ] Supabase認証設定更新
- [ ] アプリケーション設定更新
- [ ] DNS設定確認
- [ ] 機能テスト実行
- [ ] SEO設定更新
- [ ] パフォーマンステスト

## 🎯 完了後の確認項目

- [ ] `https://rootscareer.jp` でサイトアクセス可能
- [ ] `https://www.rootscareer.jp` でサイトアクセス可能
- [ ] ユーザー登録・ログイン正常動作
- [ ] 管理者機能正常動作
- [ ] 画像アップロード正常動作
- [ ] レスポンシブデザイン確認
- [ ] ページ読み込み速度確認 

# 現在の状態確認
./scripts/check-dns.sh 