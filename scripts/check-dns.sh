#!/bin/bash

DOMAIN="findout-career.com"

echo "🔍 DNS設定確認ツール: $DOMAIN"
echo "==============================="

# 色の設定
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 基本確認
echo -e "${BLUE}📋 基本DNS確認${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo -e "${YELLOW}1. Aレコード確認:${NC}"
if dig +short $DOMAIN A > /dev/null 2>&1; then
    RESULT=$(dig +short $DOMAIN A)
    if [ -n "$RESULT" ]; then
        echo -e "${GREEN}✅ 設定済み:${NC} $RESULT"
    else
        echo -e "${RED}❌ Aレコードが見つかりません${NC}"
    fi
else
    echo -e "${RED}❌ ドメインが存在しません (NXDOMAIN)${NC}"
fi

echo ""
echo -e "${YELLOW}2. ネームサーバー確認:${NC}"
NS_RESULT=$(dig +short $DOMAIN NS 2>/dev/null)
if [ -n "$NS_RESULT" ]; then
    echo -e "${GREEN}✅ ネームサーバー設定済み:${NC}"
    echo "$NS_RESULT" | while read line; do
        echo "   - $line"
    done
    
    # Cloudflareかどうか確認
    if echo "$NS_RESULT" | grep -q "cloudflare"; then
        echo -e "${GREEN}✅ Cloudflareのネームサーバーを使用中${NC}"
    else
        echo -e "${YELLOW}⚠️  Cloudflare以外のネームサーバーを使用中${NC}"
    fi
else
    echo -e "${RED}❌ ネームサーバーが設定されていません${NC}"
fi

echo ""
echo -e "${YELLOW}3. www版確認:${NC}"
WWW_RESULT=$(dig +short www.$DOMAIN 2>/dev/null)
if [ -n "$WWW_RESULT" ]; then
    echo -e "${GREEN}✅ www版設定済み:${NC} $WWW_RESULT"
else
    echo -e "${YELLOW}⚠️  www版が設定されていません${NC}"
fi

# SSL/HTTPS確認
echo ""
echo -e "${BLUE}🔒 HTTPS接続確認${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if curl -I https://$DOMAIN --connect-timeout 10 --max-time 20 > /dev/null 2>&1; then
    STATUS=$(curl -I https://$DOMAIN --connect-timeout 10 --max-time 20 2>/dev/null | head -n 1)
    echo -e "${GREEN}✅ HTTPS接続成功:${NC} $STATUS"
else
    echo -e "${RED}❌ HTTPS接続失敗${NC}"
fi

# DNS伝播確認
echo ""
echo -e "${BLUE}🌍 DNS伝播確認${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

DNS_SERVERS=("8.8.8.8" "1.1.1.1" "208.67.222.222")
for dns in "${DNS_SERVERS[@]}"; do
    echo -e "${YELLOW}$dns での確認:${NC}"
    RESULT=$(dig @$dns +short $DOMAIN A 2>/dev/null)
    if [ -n "$RESULT" ]; then
        echo -e "  ${GREEN}✅ $RESULT${NC}"
    else
        echo -e "  ${RED}❌ 応答なし${NC}"
    fi
done

# まとめ
echo ""
echo -e "${BLUE}📊 設定状況まとめ${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

A_RECORD=$(dig +short $DOMAIN A 2>/dev/null)
NS_RECORD=$(dig +short $DOMAIN NS 2>/dev/null)

if [ -n "$A_RECORD" ] && [ -n "$NS_RECORD" ]; then
    echo -e "${GREEN}🎉 DNS設定が正常に完了しています！${NC}"
    echo ""
    echo "次のステップ:"
    echo "1. ブラウザで https://$DOMAIN にアクセス"
    echo "2. サイトが正常に表示されることを確認"
    echo "3. ユーザー登録・ログイン機能のテスト"
elif [ -n "$NS_RECORD" ]; then
    echo -e "${YELLOW}🔄 DNS設定が伝播中です${NC}"
    echo ""
    echo "現在の状況:"
    echo "- ネームサーバー: 設定済み"
    echo "- Aレコード: 伝播待ち"
    echo ""
    echo "対処法:"
    echo "1. 1-2時間待ってから再度確認"
    echo "2. Cloudflare Pagesでカスタムドメイン設定を確認"
else
    echo -e "${RED}❌ DNS設定が未完了です${NC}"
    echo ""
    echo "必要な作業:"
    echo "1. Cloudflareにドメインを追加"
    echo "2. ドメインレジストラでネームサーバーを変更"
    echo "3. docs/domain-setup-guide.md の手順を確認"
fi

echo ""
echo -e "${BLUE}🔧 参考コマンド${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "詳細確認: dig $DOMAIN"
echo "ネームサーバー確認: dig $DOMAIN NS"
echo "伝播状況確認: https://dnschecker.org/"
echo "ドメイン情報確認: whois $DOMAIN" 