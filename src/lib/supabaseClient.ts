import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 環境変数の確認とログ出力
if (typeof window !== 'undefined') {
  console.log('⚠️ Supabase環境変数が設定されていません');
  console.log(`NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '設定済み' : '未設定'}`);
  console.log(`NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '設定済み' : '未設定'}`);
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.log('📝 設定方法:');
    console.log('1. プロジェクトルートに .env.local ファイルを作成');
    console.log('2. 以下の内容を追加:');
    console.log('   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co');
    console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key');
    console.log('3. 開発サーバーを再起動');
  }
}

if (!supabaseUrl) {
  throw new Error('supabaseUrl is required.');
}

if (!supabaseAnonKey) {
  throw new Error('supabaseKey is required.');
}

// Supabaseクライアントの作成（管理者機能用の設定を含む）
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  // RLS（Row Level Security）ポリシーを適用
  db: {
    schema: 'public',
  },
});

// 管理者用のSupabaseクライアント（サービスロール用）
// 注意: これは管理者機能でのみ使用し、クライアントサイドでは使用しない
export const supabaseAdmin = createClient(
  supabaseUrl, 
  supabaseAnonKey, // 実際の本番環境では SERVICE_ROLE_KEY を使用
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
); 