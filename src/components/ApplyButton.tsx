'use client';

import React, { useState, useEffect } from 'react';
import { applyToJob, getUserApplications } from '@/lib/userDatabase';
import { getCurrentUser } from '@/lib/auth';

interface ApplyButtonProps {
  jobId: string;
  jobTitle: string;
  className?: string;
  onApply?: () => void;
}

export default function ApplyButton({ 
  jobId, 
  jobTitle, 
  className = '',
  onApply 
}: ApplyButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // ユーザー情報と応募状態の初期化
  useEffect(() => {
    async function initializeApplicationState() {
      try {
        const user = await getCurrentUser();
        if (user) {
          setUserId(user.id);
          setIsLoggedIn(true);
          // 既に応募済みかチェック
          const applications = await getUserApplications(user.id);
          const hasAppliedToJob = applications.some(app => app.job_id === jobId);
          setHasApplied(hasAppliedToJob);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('応募状態の初期化に失敗しました:', error);
        setIsLoggedIn(false);
      } finally {
        setIsCheckingAuth(false);
      }
    }

    initializeApplicationState();
  }, [jobId]);

  // ログインページへのリダイレクト
  const handleLoginRedirect = () => {
    window.location.href = '/login';
  };

  // 応募処理
  const handleApply = async () => {
    if (!userId) {
      // ログインしていない場合はログインページにリダイレクト
      handleLoginRedirect();
      return;
    }

    if (!coverLetter.trim()) {
      alert('志望動機を入力してください');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await applyToJob({
        user_id: userId,
        job_id: jobId,
        status: 'pending',
        cover_letter: coverLetter.trim()
      });

      if (error) {
        console.error('応募エラー:', error);
        alert('応募に失敗しました。もう一度お試しください。');
        return;
      }

      setHasApplied(true);
      setIsModalOpen(false);
      setCoverLetter('');
      onApply?.();
      alert('応募が完了しました！応募履歴から状況を確認できます。');
    } catch (error) {
      console.error('応募処理エラー:', error);
      alert('応募に失敗しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  // モーダルを閉じる
  const handleCloseModal = () => {
    if (!isLoading) {
      setIsModalOpen(false);
      setCoverLetter('');
    }
  };

  // 認証チェック中
  if (isCheckingAuth) {
    return (
      <button
        disabled
        className={`
          bg-gray-300 text-gray-500 px-6 py-3 rounded-lg font-semibold cursor-not-allowed
          flex items-center justify-center
          ${className}
        `}
      >
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500 mr-2"></div>
        読み込み中...
      </button>
    );
  }

  // ログインしていない場合
  if (!isLoggedIn) {
    return (
      <div className={`space-y-3 ${className}`}>
        <button
          onClick={handleLoginRedirect}
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 
                     transition-colors duration-200 hover:shadow-lg active:scale-95
                     flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
          ログインして応募する
        </button>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div className="text-sm text-yellow-800">
              <p className="font-medium">ログインが必要です</p>
              <p>求人に応募するには、アカウントの作成またはログインが必要です。</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 応募済みの場合
  if (hasApplied) {
    return (
      <div className={`space-y-3 ${className}`}>
        <button
          disabled
          className="w-full bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold cursor-not-allowed
                     flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          応募済み
        </button>
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-green-800">
              <p className="font-medium">応募完了済み</p>
              <p>この求人への応募は完了しています。応募履歴で状況を確認できます。</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ログイン済み・未応募の場合（通常の応募ボタン）
  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`
          w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 
          transition-colors duration-200 hover:shadow-lg active:scale-95
          flex items-center justify-center
          ${className}
        `}
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        この求人に応募する
      </button>

      {/* 応募モーダル */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">求人に応募</h2>
                <button
                  onClick={handleCloseModal}
                  disabled={isLoading}
                  className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">応募求人</h3>
                <p className="text-gray-600">{jobTitle}</p>
              </div>

              <div className="mb-6">
                <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700 mb-2">
                  志望動機 <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="coverLetter"
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="この求人に応募する理由や志望動機を入力してください..."
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  disabled={isLoading}
                />
                <p className="text-sm text-gray-500 mt-1">
                  {coverLetter.length}/1000文字
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">応募前の確認事項</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>マイページでプロフィール情報を完成させておくことをお勧めします</li>
                      <li>応募後の状況は「応募履歴」ページで確認できます</li>
                      <li>企業からの連絡は登録メールアドレスに届きます</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleApply}
                  disabled={isLoading || !coverLetter.trim()}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      応募中...
                    </div>
                  ) : (
                    '応募する'
                  )}
                </button>
                <button
                  onClick={handleCloseModal}
                  disabled={isLoading}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 