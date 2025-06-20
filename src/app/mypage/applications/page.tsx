'use client';

import React, { useState, useEffect } from 'react';
import { getUserApplications } from '@/lib/userDatabase';
import { getCurrentUser } from '@/lib/auth';
import Link from 'next/link';
import Image from 'next/image';

// getUserApplicationsの戻り値に合わせた型定義
interface ApplicationWithJob {
  id: string;
  user_id: string;
  job_id: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  cover_letter?: string;
  resume_url?: string;
  applied_at: string;
  updated_at: string;
  jobs: {
    id: string;
    title: string;
    summary: string;
    tags: string[];
    imageurl: string;
  };
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationWithJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    async function loadApplications() {
      setIsLoading(true);
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          const applicationsData = await getUserApplications(currentUser.id);
          setApplications(applicationsData as ApplicationWithJob[]);
        }
      } catch (error) {
        console.error('応募履歴読み込みエラー:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadApplications();
  }, []);

  // ステータスでフィルタリング
  const filteredApplications = applications.filter(app => 
    selectedStatus === 'all' || app.status === selectedStatus
  );

  // ステータス表示用の設定
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return { 
          label: '選考中', 
          color: 'bg-yellow-100 text-yellow-800',
          icon: '⏳'
        };
      case 'reviewed':
        return { 
          label: '書類選考中', 
          color: 'bg-blue-100 text-blue-800',
          icon: '📋'
        };
      case 'accepted':
        return { 
          label: '内定', 
          color: 'bg-green-100 text-green-800',
          icon: '🎉'
        };
      case 'rejected':
        return { 
          label: '不採用', 
          color: 'bg-red-100 text-red-800',
          icon: '❌'
        };
      default:
        return { 
          label: '不明', 
          color: 'bg-gray-100 text-gray-800',
          icon: '❓'
        };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">応募履歴を読み込んでいます...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">ログインが必要です</h2>
          <p className="text-gray-600 mb-6">応募履歴を確認するにはログインしてください。</p>
          <Link 
            href="/login" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            ログイン
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
            <Link href="/mypage" className="hover:text-blue-600">マイページ</Link>
            <span>/</span>
            <span className="text-gray-900">応募履歴</span>
          </nav>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">応募履歴</h1>
              <p className="text-gray-600 mt-2">
                応募した求人の状況確認 ({applications.length}件)
              </p>
            </div>
            
            <Link
              href="/jobs"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              求人を探す
            </Link>
          </div>
        </div>

        {/* フィルター */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedStatus === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              すべて ({applications.length})
            </button>
            <button
              onClick={() => setSelectedStatus('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedStatus === 'pending'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              選考中 ({applications.filter(app => app.status === 'pending').length})
            </button>
            <button
              onClick={() => setSelectedStatus('reviewed')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedStatus === 'reviewed'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              書類選考中 ({applications.filter(app => app.status === 'reviewed').length})
            </button>
            <button
              onClick={() => setSelectedStatus('accepted')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedStatus === 'accepted'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              内定 ({applications.filter(app => app.status === 'accepted').length})
            </button>
            <button
              onClick={() => setSelectedStatus('rejected')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedStatus === 'rejected'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              不採用 ({applications.filter(app => app.status === 'rejected').length})
            </button>
          </div>
        </div>

        {/* 応募履歴一覧 */}
        {filteredApplications.length > 0 ? (
          <div className="space-y-6">
            {filteredApplications.map((application) => {
              const statusConfig = getStatusConfig(application.status);
              return (
                <div key={application.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
                  <div className="flex flex-col lg:flex-row">
                    {/* 求人画像 */}
                    <div className="lg:w-48 h-48 lg:h-auto relative">
                      <Image
                        src={application.jobs.imageurl || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43'}
                        alt={application.jobs.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 192px"
                      />
                    </div>
                    
                    {/* 求人情報 */}
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {application.jobs.title}
                          </h3>
                          <p className="text-gray-600 mb-3 line-clamp-2">
                            {application.jobs.summary}
                          </p>
                        </div>
                        
                        <div className="flex flex-col items-end space-y-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color}`}>
                            <span className="mr-1">{statusConfig.icon}</span>
                            {statusConfig.label}
                          </span>
                        </div>
                      </div>
                      
                      {/* タグ */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {application.jobs.tags.slice(0, 4).map((tag) => (
                          <span key={tag} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                            {tag}
                          </span>
                        ))}
                        {application.jobs.tags.length > 4 && (
                          <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-sm">
                            +{application.jobs.tags.length - 4}
                          </span>
                        )}
                      </div>
                      
                      {/* 応募情報 */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">応募日:</span>
                          <span className="ml-2">
                            {new Date(application.applied_at).toLocaleDateString('ja-JP')}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">最終更新:</span>
                          <span className="ml-2">
                            {new Date(application.updated_at).toLocaleDateString('ja-JP')}
                          </span>
                        </div>
                      </div>
                      
                      {/* 志望動機（表示がある場合） */}
                      {application.cover_letter && (
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-900 mb-2">志望動機</h4>
                          <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg line-clamp-3">
                            {application.cover_letter}
                          </p>
                        </div>
                      )}
                      
                      {/* アクション */}
                      <div className="flex items-center space-x-3">
                        <Link
                          href={`/jobs/${application.job_id}`}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        >
                          求人詳細を見る
                        </Link>
                        {application.resume_url && (
                          <a
                            href={application.resume_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                          >
                            履歴書を確認
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {selectedStatus === 'all' ? '応募履歴がありません' : `${getStatusConfig(selectedStatus).label}の応募がありません`}
            </h3>
            <p className="text-gray-600 mb-6">
              気になる求人に応募して、キャリアをスタートしましょう
            </p>
            <Link
              href="/jobs"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              求人を探す
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 