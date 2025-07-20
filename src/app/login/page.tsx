'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { signInWithEmail, signUpWithEmail } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [agreeToPrivacy, setAgreeToPrivacy] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === 'login') {
        const { error } = await signInWithEmail(email, password);
        if (error) {
          // Email not confirmedエラーの場合
          if (error.message.includes('Email not confirmed')) {
            throw new Error('メールアドレスが確認されていません。管理者にお問い合わせください。');
          }
          throw error;
        }
        router.push('/mypage');
      } else {
        // サインアップ時の個人情報同意チェック
        if (!agreeToPrivacy) {
          throw new Error('個人情報の取扱いに同意いただく必要があります。');
        }

        const { data, error } = await signUpWithEmail(email, password, agreeToPrivacy);
        if (error) {
          throw error;
        }
        
        // サインアップ成功時の処理
        if (data?.user) {
          if (data.user.email_confirmed_at) {
            // メール確認が不要な場合、そのままログイン
            setSuccess('アカウントが作成されました。マイページに移動します...');
            setTimeout(() => router.push('/mypage'), 2000);
          } else {
            // メール確認が必要な場合
            setSuccess(`アカウントが作成されました！\n\n${email} に確認メールを送信しました。\nメール内のリンクをクリックして、メールアドレスを確認してください。`);
          }
        }
      }
    } catch (err: any) {
      console.error('認証エラー:', err);
      setError(err.message || 'エラーが発生しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">{mode === 'login' ? 'ログイン' : '新規登録'}</h1>
          <p className="mt-2 text-sm text-gray-600">
            {mode === 'login' ? 'アカウントにログインしてください' : '新しいアカウントを作成してください'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                メールアドレス
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                パスワード
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
                placeholder="********"
              />
              {mode === 'signup' && (
                <p className="text-xs text-gray-500 mt-1">
                  8文字以上で設定してください
                </p>
              )}
            </div>

            {/* 個人情報同意チェックボックス（サインアップ時のみ表示） */}
            {mode === 'signup' && (
              <div className="border-t pt-4 mt-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-900">個人情報の取扱いについて</h3>
                  
                  {/* 個人情報取扱い同意書の概要 */}
                  <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700">
                    <p className="font-medium mb-2">当サイトでは以下の目的で個人情報を利用いたします：</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>会員登録および会員管理</li>
                      <li>求人情報の提供およびマッチングサービス</li>
                      <li>求人応募の処理および採用活動のサポート</li>
                      <li>お客様からのお問い合わせへの対応</li>
                      <li>サービス改善のための統計分析</li>
                    </ul>
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <Link 
                        href="/privacy-policy" 
                        target="_blank"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        → 個人情報取扱同意書の全文を確認する
                      </Link>
                    </div>
                  </div>

                  {/* 同意チェックボックス */}
                  <div className="flex items-start space-x-3">
                    <input
                      id="agree-privacy"
                      type="checkbox"
                      checked={agreeToPrivacy}
                      onChange={(e) => setAgreeToPrivacy(e.target.checked)}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      required
                    />
                    <label htmlFor="agree-privacy" className="text-sm text-gray-700">
                      <span className="font-medium text-red-600">【必須】</span>
                      上記の個人情報取扱いについて同意します
                    </label>
                  </div>

                  {/* 注意事項 */}
                  <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded">
                    <p className="font-medium text-blue-800 mb-1">ご注意：</p>
                    <p>
                      会員登録後は、個人情報取扱いポリシーに基づいて情報を管理いたします。
                      同意いただけない場合は、サービスをご利用いただけません。
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <Button
              type="submit"
              className="w-full border-2 rounded-md transition-all duration-200 hover:shadow-md active:scale-95 active:shadow-sm"
              disabled={isLoading || (mode === 'signup' && !agreeToPrivacy)}
            >
              {isLoading ? '処理中...' : mode === 'login' ? 'ログイン' : '登録'}
            </Button>
          </div>
        </form>

        <div className="text-center mt-4">
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setError(null);
              setSuccess(null);
              setAgreeToPrivacy(false);
            }}
            className="text-indigo-600 hover:text-indigo-500 text-sm font-medium transition-all duration-200 hover:shadow-sm active:scale-95"
          >
            {mode === 'login' ? 'アカウントをお持ちでない方はこちら' : 'すでにアカウントをお持ちの方はこちら'}
          </button>
        </div>

        <div className="text-center mt-4">
          <Link href="/" className="text-indigo-600 hover:text-indigo-500 text-sm font-medium transition-all duration-200 hover:shadow-sm active:scale-95">
            ホームに戻る
          </Link>
        </div>
      </div>
    </div>
  );
} 