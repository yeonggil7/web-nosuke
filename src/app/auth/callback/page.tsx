'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔄 Auth callback処理開始');
        
        // URLから認証コードを取得
        const code = searchParams.get('code');
        const error_code = searchParams.get('error');
        const error_description = searchParams.get('error_description');
        
        console.log('📋 URLパラメータ:', { code: !!code, error_code, error_description });
        
        if (error_code) {
          throw new Error(error_description || `認証エラー: ${error_code}`);
        }
        
        if (!code) {
          throw new Error('認証コードが見つかりません');
        }
        
        // Supabaseで認証コードを交換
        const { data, error: authError } = await supabase.auth.exchangeCodeForSession(code);
        
        if (authError) {
          console.error('❌ 認証コード交換エラー:', authError);
          throw authError;
        }
        
        if (data?.user) {
          console.log('✅ 認証成功:', { 
            email: data.user.email, 
            confirmed: !!data.user.email_confirmed_at 
          });
          
          setSuccess(true);
          
          // 3秒後にマイページへリダイレクト
          setTimeout(() => {
            router.push('/mypage');
          }, 3000);
        } else {
          throw new Error('ユーザー情報の取得に失敗しました');
        }
        
      } catch (err: any) {
        console.error('💥 Auth callback エラー:', err);
        setError(err.message || '認証処理中にエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [searchParams, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">認証処理中...</h1>
          <p className="text-gray-600">メールアドレスの確認を行っています</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">認証エラー</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <Link 
              href="/login"
              className="block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              ログインページに戻る
            </Link>
            <Link 
              href="/"
              className="block text-blue-600 hover:text-blue-800 font-medium"
            >
              ホームページに戻る
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">メール確認完了！</h1>
          <p className="text-gray-600 mb-6">
            メールアドレスの確認が完了しました。<br />
            マイページに移動します...
          </p>
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              3秒後に自動的にマイページに移動します
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
} 