#!/bin/bash

echo "🚀 Roots Career デプロイ前チェックリスト"
echo "========================================="

# 色の設定
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# チェック関数
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅ $1 が存在します${NC}"
        return 0
    else
        echo -e "${RED}❌ $1 が見つかりません${NC}"
        return 1
    fi
}

check_env_var() {
    if grep -q "$1" .env.local 2>/dev/null; then
        echo -e "${GREEN}✅ $1 が設定されています${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  $1 が .env.local で設定されていません${NC}"
        return 1
    fi
}

# 基本ファイルチェック
echo "📋 基本ファイルのチェック..."
check_file "package.json"
check_file "next.config.ts"
check_file "tailwind.config.ts"
check_file "public/robots.txt"

# 環境変数チェック
echo ""
echo "🔧 環境変数のチェック..."
check_env_var "NEXT_PUBLIC_SUPABASE_URL"
check_env_var "NEXT_PUBLIC_SUPABASE_ANON_KEY"

# ドキュメントファイルチェック
echo ""
echo "📚 ドキュメントのチェック..."
check_file "docs/domain-setup-guide.md"
check_file "docs/production-env-vars.md"

# ビルドテスト
echo ""
echo "🔨 ビルドテスト..."
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ ビルドが成功しました${NC}"
else
    echo -e "${RED}❌ ビルドに失敗しました${NC}"
    echo "エラーの詳細を確認してください:"
    npm run build
    exit 1
fi

# 型チェック
echo ""
echo "🎯 TypeScript型チェック..."
if npx tsc --noEmit > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 型チェックが成功しました${NC}"
else
    echo -e "${RED}❌ 型エラーがあります${NC}"
    npx tsc --noEmit
    exit 1
fi

# リントチェック
echo ""
echo "🧹 Lintチェック..."
if npm run lint > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Lintチェックが成功しました${NC}"
else
    echo -e "${YELLOW}⚠️  Lintの警告があります${NC}"
    npm run lint
fi

echo ""
echo "🎉 デプロイ前チェック完了！"
echo ""
echo "次のステップ:"
echo "1. Cloudflare Pages で環境変数を設定"
echo "2. Supabase で認証URL設定を更新"
echo "3. ドメイン設定を確認"
echo "4. docs/domain-setup-guide.md の手順に従って設定"
echo ""
echo "🌐 本番環境: https://rootscareer.jp" 