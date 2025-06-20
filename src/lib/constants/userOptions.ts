// ユーザー設定の選択肢定義

// 活動希望エリア
export const PREFERRED_AREAS = [
  { value: '全国', label: '全国（どこでもOK）' },
  { value: 'オンライン', label: 'オンライン' },
  { value: '北海道', label: '北海道' },
  { value: '青森県', label: '青森県' },
  { value: '岩手県', label: '岩手県' },
  { value: '宮城県', label: '宮城県' },
  { value: '秋田県', label: '秋田県' },
  { value: '山形県', label: '山形県' },
  { value: '福島県', label: '福島県' },
  { value: '茨城県', label: '茨城県' },
  { value: '栃木県', label: '栃木県' },
  { value: '群馬県', label: '群馬県' },
  { value: '埼玉県', label: '埼玉県' },
  { value: '千葉県', label: '千葉県' },
  { value: '東京都', label: '東京都' },
  { value: '神奈川県', label: '神奈川県' },
  { value: '新潟県', label: '新潟県' },
  { value: '富山県', label: '富山県' },
  { value: '石川県', label: '石川県' },
  { value: '福井県', label: '福井県' },
  { value: '山梨県', label: '山梨県' },
  { value: '長野県', label: '長野県' },
  { value: '岐阜県', label: '岐阜県' },
  { value: '静岡県', label: '静岡県' },
  { value: '愛知県', label: '愛知県' },
  { value: '三重県', label: '三重県' },
  { value: '滋賀県', label: '滋賀県' },
  { value: '京都府', label: '京都府' },
  { value: '大阪府', label: '大阪府' },
  { value: '兵庫県', label: '兵庫県' },
  { value: '奈良県', label: '奈良県' },
  { value: '和歌山県', label: '和歌山県' },
  { value: '鳥取県', label: '鳥取県' },
  { value: '島根県', label: '島根県' },
  { value: '岡山県', label: '岡山県' },
  { value: '広島県', label: '広島県' },
  { value: '山口県', label: '山口県' },
  { value: '徳島県', label: '徳島県' },
  { value: '香川県', label: '香川県' },
  { value: '愛媛県', label: '愛媛県' },
  { value: '高知県', label: '高知県' },
  { value: '福岡県', label: '福岡県' },
  { value: '佐賀県', label: '佐賀県' },
  { value: '長崎県', label: '長崎県' },
  { value: '熊本県', label: '熊本県' },
  { value: '大分県', label: '大分県' },
  { value: '宮崎県', label: '宮崎県' },
  { value: '鹿児島県', label: '鹿児島県' },
  { value: '沖縄県', label: '沖縄県' }
] as const;

// 興味のある分野
export const INTERESTED_FIELDS = {
  // 社会・地域貢献系
  social: {
    category: '🌱 社会・地域貢献系',
    options: [
      { value: '地方創生', label: '地方創生' },
      { value: '教育', label: '教育' },
      { value: 'ボランティア', label: 'ボランティア' },
      { value: '福祉・子ども支援', label: '福祉・子ども支援' },
      { value: '環境・SDGs', label: '環境・SDGs' }
    ]
  },
  // 実務・スキル系
  business: {
    category: '💼 実務・スキル系',
    options: [
      { value: 'スタートアップ', label: 'スタートアップ' },
      { value: '起業・経営', label: '起業・経営' },
      { value: 'マーケティング・SNS運用', label: 'マーケティング・SNS運用' },
      { value: 'デザイン', label: 'デザイン' },
      { value: 'プログラミング・開発', label: 'プログラミング・開発' },
      { value: '動画制作・編集', label: '動画制作・編集' },
      { value: 'イベント企画', label: 'イベント企画' },
      { value: '営業・広報', label: '営業・広報' },
      { value: '海外ビジネス', label: '海外ビジネス' }
    ]
  },
  // 志向・目的
  personal: {
    category: '💡 志向・目的',
    options: [
      { value: '自己成長したい', label: '自己成長したい' },
      { value: '自分の適性を知りたい', label: '自分の適性を知りたい' },
      { value: '友達や仲間を作りたい', label: '友達や仲間を作りたい' },
      { value: '留学・国際交流に興味がある', label: '留学・国際交流に興味がある' }
    ]
  }
} as const;

// 全ての興味分野をフラットなリストにする
export const ALL_INTERESTED_FIELDS = [
  ...INTERESTED_FIELDS.social.options,
  ...INTERESTED_FIELDS.business.options,
  ...INTERESTED_FIELDS.personal.options
] as const; 