// 機能フラグ管理
export const FEATURE_FLAGS = {
  // 基本機能（無料プランで利用可能）
  USER_AUTHENTICATION: true,
  JOB_LISTING: true,
  JOB_SEARCH: true,
  BASIC_PROFILE: true,
  
  // 中級機能（ユーザー数に応じて有効化）
  JOB_FAVORITES: true,
  JOB_APPLICATIONS: false, // 初期は無効
  PROFILE_IMAGES: false,   // ストレージ使用量を抑制
  
  // 高級機能（有料プラン移行後）
  FILE_UPLOADS: false,     // 履歴書アップロード
  REAL_TIME_NOTIFICATIONS: false,
  ADVANCED_ANALYTICS: false,
  EMAIL_NOTIFICATIONS: false,
} as const;

// 環境変数で機能を制御
export function isFeatureEnabled(feature: keyof typeof FEATURE_FLAGS): boolean {
  // 環境変数で個別に制御可能
  const envFlag = process.env[`NEXT_PUBLIC_FEATURE_${feature}`];
  if (envFlag !== undefined) {
    return envFlag === 'true';
  }
  
  return FEATURE_FLAGS[feature];
}

// ユーザー数に基づく動的な機能制御
export async function getDynamicFeatureFlags() {
  // 実際の実装では、ユーザー数やストレージ使用量をチェック
  const userCount = await getUserCount();
  const storageUsage = await getStorageUsage();
  
  return {
    ...FEATURE_FLAGS,
    PROFILE_IMAGES: userCount < 200 && storageUsage < 800, // 800MB未満
    FILE_UPLOADS: userCount < 100 && storageUsage < 500,   // 500MB未満
  };
}

// モック関数（実際の実装では Supabase から取得）
async function getUserCount(): Promise<number> {
  // return await supabase.from('user_profiles').select('count');
  return 0; // 初期値
}

async function getStorageUsage(): Promise<number> {
  // return await supabase.storage.getBucketUsage();
  return 0; // 初期値（MB）
} 