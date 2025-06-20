'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { 
  getAllApplicationsForAdmin, 
  updateApplicationStatus, 
  getApplicationStats,
  deleteApplication,
  type AdminJobApplication,
  type ApplicationStats
} from '@/lib/adminDatabase';
import Link from 'next/link';
import Image from 'next/image';

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<AdminJobApplication[]>([]);
  const [stats, setStats] = useState<ApplicationStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'applied_at' | 'status' | 'job_title'>('applied_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function initializeData() {
      try {
        // 管理者権限確認
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          router.push('/login');
          return;
        }

        const adminStatus = await isAdmin();
        if (!adminStatus) {
          router.push('/');
          return;
        }

        setIsAuthorized(true);

        // データ読み込み
        await loadApplicationsData();
      } catch (error) {
        console.error('初期化エラー:', error);
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    }

    initializeData();
  }, [router]);

  const loadApplicationsData = async () => {
    try {
      const [applicationsData, statsData] = await Promise.all([
        getAllApplicationsForAdmin(),
        getApplicationStats()
      ]);

      setApplications(applicationsData);
      setStats(statsData);
    } catch (error) {
      console.error('データ読み込みエラー:', error);
      setMessage({ type: 'error', text: 'データの読み込みに失敗しました' });
    }
  };

  const handleStatusUpdate = async (applicationId: string, newStatus: 'pending' | 'reviewed' | 'accepted' | 'rejected') => {
    try {
      const result = await updateApplicationStatus(applicationId, newStatus);
      
      if (result.success) {
        setMessage({ type: 'success', text: 'ステータスを更新しました' });
        await loadApplicationsData(); // データを再読み込み
      } else {
        setMessage({ type: 'error', text: result.error || 'ステータス更新に失敗しました' });
      }
    } catch (error) {
      console.error('ステータス更新エラー:', error);
      setMessage({ type: 'error', text: 'ステータス更新中にエラーが発生しました' });
    }
  };

  const handleDeleteApplication = async (applicationId: string) => {
    if (!confirm('この応募データを削除してもよろしいですか？')) {
      return;
    }

    try {
      const result = await deleteApplication(applicationId);
      
      if (result.success) {
        setMessage({ type: 'success', text: '応募データを削除しました' });
        await loadApplicationsData();
      } else {
        setMessage({ type: 'error', text: result.error || '削除に失敗しました' });
      }
    } catch (error) {
      console.error('削除エラー:', error);
      setMessage({ type: 'error', text: '削除中にエラーが発生しました' });
    }
  };

  // フィルタリングとソート
  const filteredAndSortedApplications = React.useMemo(() => {
    let filtered = applications.filter(app => {
      const statusMatch = selectedStatus === 'all' || app.status === selectedStatus;
      const searchMatch = searchTerm === '' || 
        app.job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (app.user_profile?.display_name && app.user_profile.display_name.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return statusMatch && searchMatch;
    });

    // ソート
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'applied_at':
          aValue = new Date(a.applied_at).getTime();
          bValue = new Date(b.applied_at).getTime();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'job_title':
          aValue = a.job.title;
          bValue = b.job.title;
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [applications, selectedStatus, searchTerm, sortBy, sortOrder]);

  // ステータス表示設定
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return { 
          label: '選考中', 
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: '⏳'
        };
      case 'reviewed':
        return { 
          label: '書類選考中', 
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: '📋'
        };
      case 'accepted':
        return { 
          label: '内定', 
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: '🎉'
        };
      case 'rejected':
        return { 
          label: '不採用', 
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: '❌'
        };
      default:
        return { 
          label: '不明', 
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: '❓'
        };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl mb-4">読み込み中...</div>
          <div className="text-sm text-gray-500">管理者権限を確認しています</div>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">アクセス権限がありません</h1>
          <p className="text-gray-600 mb-4">この機能は管理者のみ利用できます</p>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            ホームに戻る
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
            <Link href="/admin" className="hover:text-blue-600">管理者ページ</Link>
            <span>/</span>
            <span className="text-gray-900">応募管理</span>
          </nav>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">応募管理</h1>
              <p className="text-gray-600 mt-2">
                全ての応募情報を管理・確認できます
              </p>
            </div>
            
            <Link
              href="/admin"
              className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
            >
              管理者ページに戻る
            </Link>
          </div>
        </div>

        {/* メッセージ表示 */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-100 border border-green-400 text-green-700' 
              : 'bg-red-100 border border-red-400 text-red-700'
          }`}>
            {message.text}
            <button
              onClick={() => setMessage(null)}
              className="ml-4 text-sm underline"
            >
              閉じる
            </button>
          </div>
        )}

        {/* 統計情報 */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">総応募数</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-gray-600">選考中</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.reviewed}</div>
              <div className="text-sm text-gray-600">書類選考中</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-green-600">{stats.accepted}</div>
              <div className="text-sm text-gray-600">内定</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
              <div className="text-sm text-gray-600">不採用</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-purple-600">{stats.thisWeek}</div>
              <div className="text-sm text-gray-600">今週の応募</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-indigo-600">{stats.thisMonth}</div>
              <div className="text-sm text-gray-600">今月の応募</div>
            </div>
          </div>
        )}

        {/* フィルター・検索・ソート */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* ステータスフィルター */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ステータス
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">全て</option>
                <option value="pending">選考中</option>
                <option value="reviewed">書類選考中</option>
                <option value="accepted">内定</option>
                <option value="rejected">不採用</option>
              </select>
            </div>

            {/* 検索 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                検索
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="求人名、応募者名、メールアドレス"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* ソート項目 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ソート項目
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'applied_at' | 'status' | 'job_title')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="applied_at">応募日時</option>
                <option value="status">ステータス</option>
                <option value="job_title">求人名</option>
              </select>
            </div>

            {/* ソート順 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ソート順
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="desc">降順</option>
                <option value="asc">昇順</option>
              </select>
            </div>
          </div>
        </div>

        {/* 応募一覧 */}
        <div className="space-y-4">
          {filteredAndSortedApplications.length > 0 ? (
            filteredAndSortedApplications.map((application) => {
              const statusConfig = getStatusConfig(application.status);
              
              return (
                <div key={application.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* 求人画像 */}
                      <div className="lg:w-48 h-32 lg:h-auto relative flex-shrink-0">
                        <Image
                          src={application.job.imageurl || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43'}
                          alt={application.job.title}
                          fill
                          className="object-cover rounded-lg"
                          sizes="(max-width: 1024px) 100vw, 192px"
                        />
                      </div>
                      
                      {/* 応募情報 */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                              {application.job.title}
                            </h3>
                            <p className="text-gray-600 mb-3 line-clamp-2">
                              {application.job.summary}
                            </p>
                          </div>
                          
                          <div className="flex flex-col items-end space-y-2 ml-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusConfig.color}`}>
                              <span className="mr-1">{statusConfig.icon}</span>
                              {statusConfig.label}
                            </span>
                          </div>
                        </div>

                        {/* 応募者情報 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">応募者:</span>
                            <span className="ml-2 text-gray-900">
                              {application.user_profile?.display_name || application.user_profile?.full_name || '名前未設定'}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">メール:</span>
                            <span className="ml-2 text-gray-900">{application.user_email}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">応募日:</span>
                            <span className="ml-2 text-gray-900">
                              {new Date(application.applied_at).toLocaleDateString('ja-JP', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">最終更新:</span>
                            <span className="ml-2 text-gray-900">
                              {new Date(application.updated_at).toLocaleDateString('ja-JP', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>

                        {/* 志望動機 */}
                        {application.cover_letter && (
                          <div className="mb-4">
                            <h4 className="font-medium text-gray-900 mb-2">志望動機</h4>
                            <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg line-clamp-3">
                              {application.cover_letter}
                            </p>
                          </div>
                        )}

                        {/* アクション */}
                        <div className="flex flex-wrap items-center gap-3">
                          {/* ステータス更新 */}
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-700">ステータス変更:</span>
                            <select
                              value={application.status}
                              onChange={(e) => handleStatusUpdate(application.id, e.target.value as any)}
                              className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="pending">選考中</option>
                              <option value="reviewed">書類選考中</option>
                              <option value="accepted">内定</option>
                              <option value="rejected">不採用</option>
                            </select>
                          </div>

                          {/* 求人詳細リンク */}
                          <Link
                            href={`/jobs/${application.job_id}`}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
                          >
                            求人詳細
                          </Link>

                          {/* 履歴書リンク */}
                          {application.resume_url && (
                            <a
                              href={application.resume_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-green-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-green-700 transition-colors"
                            >
                              履歴書
                            </a>
                          )}

                          {/* 削除ボタン */}
                          <button
                            onClick={() => handleDeleteApplication(application.id)}
                            className="bg-red-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-red-700 transition-colors"
                          >
                            削除
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="text-gray-500 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">応募データがありません</h3>
              <p className="text-gray-500">
                {selectedStatus !== 'all' || searchTerm !== '' 
                  ? 'フィルター条件に一致する応募がありません' 
                  : 'まだ応募が届いていません'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 