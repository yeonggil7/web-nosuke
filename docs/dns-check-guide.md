# 🔍 DNS レコード確認ガイド

## 📋 確認すべきタイミング

1. **設定前確認** - ドメインがまだ設定されていないことを確認
2. **設定後確認** - Cloudflareで設定完了後の動作確認
3. **トラブル時確認** - 問題が発生した時の診断

## 🛠 確認方法

### 1. コマンドライン確認（推奨）

#### macOS/Linux の場合

```bash
# 基本的なAレコード確認
dig rootscareer.jp

# より詳細な情報
dig rootscareer.jp A

# ネームサーバー確認
dig rootscareer.jp NS

# すべてのレコード確認
dig rootscareer.jp ANY
```

#### Windowsの場合

```cmd
# 基本確認
nslookup rootscareer.jp

# ネームサーバー確認
nslookup -type=NS rootscareer.jp
```

### 2. オンラインツール確認

以下のウェブサイトでも確認できます：

1. **DNSチェッカー**
   - https://dnschecker.org/
   - ドメイン名：`rootscareer.jp` を入力

2. **What's My DNS**
   - https://www.whatsmydns.net/
   - 世界各地からの DNS伝播状況を確認

3. **DNS Lookup**
   - https://www.nslookup.io/
   - 詳細なDNS情報を確認

## 📖 結果の読み方

### ✅ 正常な状態（設定完了後）

```bash
$ dig rootscareer.jp

;; ANSWER SECTION:
rootscareer.jp.     300    IN    A    104.21.x.x
rootscareer.jp.     300    IN    A    172.67.x.x
```

**意味：**
- `A` レコードが存在し、CloudflareのIPアドレスが設定されている
- TTL（300秒）でキャッシュされる

### ❌ 未設定状態（現在の状態）

```bash
$ dig rootscareer.jp

;; ->>HEADER<<- opcode: QUERY, status: NXDOMAIN
```

**意味：**
- `NXDOMAIN` = ドメインが存在しない
- まだCloudflareにドメインを追加していない状態

### 🔄 移行中状態

```bash
$ dig rootscareer.jp NS

;; ANSWER SECTION:
rootscareer.jp.     86400   IN    NS    ns1.cloudflare.com.
rootscareer.jp.     86400   IN    NS    ns2.cloudflare.com.
```

**意味：**
- ネームサーバーがCloudflareに移行済み
- DNS設定の伝播中

## 🕒 設定手順とタイミング

### ステップ1: 設定前確認
```bash
# 現在の状態を確認（NXDOMAIN が正常）
dig rootscareer.jp
```

### ステップ2: Cloudflare設定後
```bash
# ネームサーバーが変更されているか確認
dig rootscareer.jp NS
```

### ステップ3: DNS伝播確認
```bash
# Aレコードが設定されているか確認
dig rootscareer.jp A

# www版も確認
dig www.rootscareer.jp
```

### ステップ4: 完全動作確認
```bash
# 最終確認
curl -I https://rootscareer.jp
```

## ⏰ DNS伝播時間

- **ネームサーバー変更**: 数時間〜48時間
- **レコード追加/変更**: 数分〜数時間
- **キャッシュクリア**: TTL時間依存（通常5分〜1時間）

## 🚨 トラブルシューティング

### 問題1: NXDOMAIN が続く

**確認点：**
```bash
# ネームサーバーを確認
dig rootscareer.jp NS

# ドメインレジストラの設定を確認
whois rootscareer.jp
```

**解決策：**
- ドメインレジストラでネームサーバーが正しく設定されているか確認
- DNS伝播を待つ（最大48時間）

### 問題2: 古いIPアドレスが表示される

**確認点：**
```bash
# DNSキャッシュをクリア（macOS）
sudo dscacheutil -flushcache

# 直接CloudflareのDNSに問い合わせ
dig @1.1.1.1 rootscareer.jp
```

### 問題3: www版が動作しない

**確認点：**
```bash
# www版のCNAMEレコード確認
dig www.rootscareer.jp CNAME
```

**設定すべきレコード：**
```
www.rootscareer.jp  CNAME  rootscareer.jp
```

## 📱 モバイルでの確認

### iOS (Shortcuts アプリ)
1. App Store から「Network Analyzer」をダウンロード
2. DNS Lookup でドメインを確認

### Android
1. Google Play から「DNS Lookup」アプリをダウンロード
2. ドメイン名を入力して確認

## 🔧 高度な確認方法

### CloudflareのAPI確認
```bash
# Cloudflareアカウントのゾーン確認
curl -X GET "https://api.cloudflare.com/client/v4/zones" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

### 複数地点からの確認
```bash
# 複数のDNSサーバーから確認
for dns in 8.8.8.8 1.1.1.1 208.67.222.222; do
  echo "=== $dns ==="
  dig @$dns rootscareer.jp
done
```

## 🎯 最終確認チェックリスト

設定完了後、以下すべてが成功すれば完了：

```bash
# 1. Aレコード確認
dig rootscareer.jp A
# → CloudflareのIPアドレスが返される

# 2. NSレコード確認  
dig rootscareer.jp NS
# → Cloudflareのネームサーバーが返される

# 3. HTTPS接続確認
curl -I https://rootscareer.jp
# → HTTP/2 200 が返される

# 4. www版確認
curl -I https://www.rootscareer.jp
# → リダイレクトまたは正常レスポンス
```

## 📞 サポートが必要な場合

1. **ドメインレジストラのサポート**
   - ネームサーバー設定の問題
   - ドメイン管理の問題

2. **Cloudflareサポート**
   - DNS設定の問題
   - SSL証明書の問題

3. **コミュニティフォーラム**
   - Stack Overflow
   - Cloudflare Community 