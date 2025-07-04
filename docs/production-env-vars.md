# 本番環境用環境変数設定

## Cloudflare Pagesでの環境変数設定

以下の環境変数をCloudflare Pagesの「Settings」→「Environment variables」で設定してください：

### 必須設定

```bash
# サイトURL
NEXT_PUBLIC_SITE_URL=https://rootscareer.jp

# Supabase設定（Supabaseダッシュボードから取得）
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 機能フラグ（オプション）

```bash
# 高度な機能を有効化
NEXT_PUBLIC_FEATURE_FILE_UPLOADS=true
NEXT_PUBLIC_FEATURE_PROFILE_IMAGES=true
NEXT_PUBLIC_FEATURE_JOB_APPLICATIONS=true

# 統計情報
NEXT_PUBLIC_USER_COUNT=0
NEXT_PUBLIC_PAID_PLAN=false
```

### 追加設定（オプション）

```bash
# Google Analytics
NEXT_PUBLIC_GA_TRACKING_ID=GA_MEASUREMENT_ID

# 連絡先情報
NEXT_PUBLIC_CONTACT_EMAIL=info@rootscareer.jp
NEXT_PUBLIC_SUPPORT_EMAIL=support@rootscareer.jp

# ブランディング
NEXT_PUBLIC_COMPANY_NAME=Roots Career
NEXT_PUBLIC_SITE_DESCRIPTION=あなたの理想のキャリアを見つけよう
```

## 設定手順

1. [Cloudflare Pages ダッシュボード](https://dash.cloudflare.com/pages) にアクセス
2. `web-nosuke` プロジェクトを選択
3. 「Settings」タブをクリック
4. 「Environment variables」セクションを選択
5. 「Add variable」をクリックして各環境変数を追加
6. 「Production」環境を選択して保存
7. プロジェクトを再デプロイ

## 注意事項

- 機密情報（APIキー等）は絶対にコードに直接書かない
- 環境変数の値は適切にエスケープする
- 設定後は必ずテストを実行して動作確認を行う 