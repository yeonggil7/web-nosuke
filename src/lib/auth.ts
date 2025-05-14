import { supabase } from './supabaseClient';
import { type User } from '@supabase/supabase-js';

// ログイン（メールとパスワード）
export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  return { data, error };
}

// サインアップ（メールとパスワード）
export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password
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
  const { data: { user } } = await supabase.auth.getUser();
  return user;
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