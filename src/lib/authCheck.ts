import { supabase } from './supabaseClient';

export interface AuthCheckResult {
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: any;
  session: any;
  error?: string;
  debugInfo: {
    hasSession: boolean;
    hasAccessToken: boolean;
    hasUser: boolean;
    userEmail?: string;
    tokenLength?: number;
  };
}

// 管理者メールアドレス一覧
const ADMIN_EMAILS = [
  'admin@example.com',
  'shinjirutaro@gmail.com',
  'testuser001@gmail.com'
];

export async function checkAuthStatus(): Promise<AuthCheckResult> {
  try {
    console.log('🔍 認証状態チェック開始...');
    
    // セッション取得
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    const debugInfo = {
      hasSession: !!session,
      hasAccessToken: !!session?.access_token,
      hasUser: !!session?.user,
      userEmail: session?.user?.email,
      tokenLength: session?.access_token?.length
    };
    
    console.log('📊 認証デバッグ情報:', debugInfo);
    
    if (sessionError) {
      console.error('❌ セッション取得エラー:', sessionError);
      return {
        isAuthenticated: false,
        isAdmin: false,
        user: null,
        session: null,
        error: `セッション取得エラー: ${sessionError.message}`,
        debugInfo
      };
    }
    
    if (!session) {
      console.log('❌ セッションが存在しません');
      return {
        isAuthenticated: false,
        isAdmin: false,
        user: null,
        session: null,
        error: 'セッションが存在しません',
        debugInfo
      };
    }
    
    if (!session.access_token) {
      console.log('❌ アクセストークンが存在しません');
      return {
        isAuthenticated: false,
        isAdmin: false,
        user: session.user,
        session,
        error: 'アクセストークンが存在しません',
        debugInfo
      };
    }
    
    if (!session.user) {
      console.log('❌ ユーザー情報が存在しません');
      return {
        isAuthenticated: false,
        isAdmin: false,
        user: null,
        session,
        error: 'ユーザー情報が存在しません',
        debugInfo
      };
    }
    
    // 管理者権限チェック
    const isAdmin = ADMIN_EMAILS.includes(session.user.email || '');
    
    console.log('✅ 認証チェック完了:', {
      email: session.user.email,
      isAdmin,
      userId: session.user.id
    });
    
    return {
      isAuthenticated: true,
      isAdmin,
      user: session.user,
      session,
      debugInfo
    };
    
  } catch (error) {
    console.error('❌ 認証チェック中にエラー:', error);
    return {
      isAuthenticated: false,
      isAdmin: false,
      user: null,
      session: null,
      error: `認証チェック中にエラー: ${error instanceof Error ? error.message : '不明なエラー'}`,
      debugInfo: {
        hasSession: false,
        hasAccessToken: false,
        hasUser: false
      }
    };
  }
}

// 管理者権限が必要な処理用のヘルパー
export async function requireAdminAuth(): Promise<AuthCheckResult> {
  const authResult = await checkAuthStatus();
  
  if (!authResult.isAuthenticated) {
    throw new Error('ログインが必要です');
  }
  
  if (!authResult.isAdmin) {
    throw new Error('管理者権限が必要です');
  }
  
  return authResult;
}

// アクセストークンを安全に取得
export async function getAccessToken(): Promise<string | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  } catch (error) {
    console.error('❌ アクセストークン取得エラー:', error);
    return null;
  }
} 