import { supabase } from './supabaseClient';
import { type User } from '@supabase/supabase-js';

// 管理者メールアドレスのリスト
const ADMIN_EMAILS = [
  'admin@example.com', // デフォルトの管理者アカウント
  'shinjirutaro@gmail.com', // メインユーザーを管理者に設定
  'testuser001@gmail.com' // テストユーザーも管理者に設定（開発用）
]; // 実際の管理者メールアドレスに変更してください

// ログイン（メールとパスワード）
export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  return { data, error };
}

// サインアップ（メールとパスワード）
export async function signUpWithEmail(email: string, password: string, agreeToPrivacy: boolean = false) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        agreed_to_privacy_policy: agreeToPrivacy,
        privacy_policy_agreed_at: agreeToPrivacy ? new Date().toISOString() : null
      }
    }
  });
  
  return { data, error };
}

// ログアウト
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

// 現在のユーザー情報を取得
export async function getCurrentUser(): Promise<User | null> {
  try {
    console.log('🔐 getCurrentUser: セッション確認開始');
    
    // セッション情報を取得
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    console.log('📋 セッション情報:', {
      hasSession: !!sessionData?.session,
      sessionId: sessionData?.session?.access_token ? 'あり' : 'なし',
      sessionError: sessionError?.message || 'なし'
    });
    
    // ユーザー情報を取得
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log('👤 ユーザー情報:', {
      hasUser: !!user,
      userId: user?.id || 'なし',
      email: user?.email || 'なし',
      emailConfirmed: user?.email_confirmed_at || 'なし',
      userError: userError?.message || 'なし'
    });
    
    if (userError) {
      console.error('❌ ユーザー取得エラー:', userError);
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('💥 getCurrentUser で予期しないエラー:', error);
    return null;
  }
}

// セッション情報を取得
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  return { data, error };
}

// パスワードリセットのメール送信
export async function resetPassword(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  
  return { data, error };
}

// 管理者かどうかをチェック（クライアントサイド用）
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user || !user.email) return false;
  
  return ADMIN_EMAILS.includes(user.email);
}

// ユーザーの管理者権限を設定するためのデータベース関数
export async function setAdminStatus(userId: string, isAdmin: boolean) {
  const { data, error } = await supabase
    .from('user_roles')
    .upsert({ 
      user_id: userId, 
      role: isAdmin ? 'admin' : 'user',
      updated_at: new Date().toISOString()
    });
  
  return { data, error };
}

// 開発用：ユーザーのメール確認状態を手動で有効化
export async function confirmUserEmailManually(userId: string) {
  try {
    // Supabase Admin APIを使用してユーザーのメール確認状態を更新
    // 注意：これは開発環境でのみ使用してください
    const { data, error } = await supabase.auth.admin.updateUserById(
      userId,
      { email_confirm: true }
    );
    
    return { data, error };
  } catch (error) {
    console.error('Manual email confirmation failed:', error);
    return { data: null, error };
  }
}

// 開発用：すべての未確認ユーザーを取得
export async function getUnconfirmedUsers() {
  try {
    const { data, error } = await supabase.auth.admin.listUsers();
    
    if (error) throw error;
    
    // メール未確認のユーザーをフィルタリング
    const unconfirmedUsers = data.users?.filter(user => !user.email_confirmed_at) || [];
    
    return { data: unconfirmedUsers, error: null };
  } catch (error) {
    console.error('Failed to get unconfirmed users:', error);
    return { data: [], error };
  }
} 