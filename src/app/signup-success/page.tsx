'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function SignupSuccessPage() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState<string>('');

  useEffect(() => {
    // URLパラメータからメールアドレスを取得
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {/* アイコン */}
          <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
            <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          {/* メインメッセージ */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            アカウント作成完了！
          </h1>
          
          <p className="text-lg text-gray-600 mb-6">
            確認メールを送信しました
          </p>

          {/* メールアドレス表示 */}
          {email && (
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800 font-medium mb-1">送信先メールアドレス</p>
              <p className="text-blue-900 font-semibold">{email}</p>
            </div>
          )}

          {/* 手順説明 */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6 text-left">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">次のステップ</h2>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <p className="text-gray-700">受信したメールを確認してください</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <p className="text-gray-700">メール内の「メールアドレスを確認」ボタンをクリック</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <p className="text-gray-700">確認が完了すると、マイページにアクセスできます</p>
              </div>
            </div>
          </div>

          {/* 注意事項 */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>メールが届かない場合：</strong><br />
                  迷惑メールフォルダもご確認ください。数分経ってもメールが届かない場合は、お問い合わせください。
                </p>
              </div>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              📧 メールを再送信する
            </button>
            
            <Link
              href="/"
              className="block w-full border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              ホームページに戻る
            </Link>
            
            <Link
              href="/contact"
              className="block text-blue-600 hover:text-blue-800 font-medium text-sm"
            >
              メールが届かない場合はお問い合わせ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 