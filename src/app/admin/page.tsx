'use client';

import { useState, useEffect } from 'react';
import { getAllJobs } from '@/lib/cms';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import SupabaseStatus from '@/components/SupabaseStatus';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { Input } from '@/components/ui/input';
import { JobPosting } from '@/schema/jobSchema';

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      try {
        // ユーザー情報と管理者権限を確認
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          router.push('/login');
          return;
        }
        
        setUser(currentUser);
        
        const adminStatus = await isAdmin();
        if (!adminStatus) {
          router.push('/');
          return;
        }
        
        setIsAdminUser(true);
        
        // 求人データを取得
        const jobsData = await getAllJobs();
        setJobs(jobsData);
        
      } catch (error) {
        console.error('データ読み込みエラー:', error);
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [router]);

  const handleAddAdmin = async () => {
    if (!newAdminEmail.trim()) {
      setMessage({ type: 'error', text: 'メールアドレスを入力してください' });
      return;
    }

    try {
      setMessage({ type: 'success', text: `${newAdminEmail} を管理者リストに追加する手順：\n\n1. src/lib/auth.ts ファイルを開く\n2. ADMIN_EMAILS 配列に '${newAdminEmail}' を追加\n3. サーバーを再起動` });
      setNewAdminEmail('');
    } catch (error) {
      setMessage({ type: 'error', text: '管理者追加に失敗しました' });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="text-xl mb-4">読み込み中...</div>
            <div className="text-sm text-gray-500">管理者権限を確認しています</div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdminUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">アクセス権限がありません</h1>
          <p className="text-gray-600 mb-4">この機能は管理者のみ利用できます</p>
          <Link href="/">
            <Button className="border-2 rounded-md transition-all duration-200 hover:shadow-md active:scale-95 active:shadow-sm">
              ホームに戻る
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // 最近作成された求人（最新5件）
  const recentJobs = jobs
    .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())
    .slice(0, 5);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">管理者ページ</h1>
          <Link href="/">
            <Button 
              variant="outline"
              className="border-2 rounded-md transition-all duration-200 hover:shadow-md active:scale-95 active:shadow-sm"
            >
              ホームに戻る
            </Button>
          </Link>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">ダッシュボード</h2>
            <p className="text-muted-foreground">
              サイトの概要とデータを確認できます。
            </p>
          </div>
          
          {/* Supabase設定状況 */}
          <SupabaseStatus />
          
          {/* クイックアクション */}
          <div className="flex gap-4">
            <Link href="/admin/jobs/new">
              <Button className="bg-green-600 hover:bg-green-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <path d="M5 12h14"></path>
                  <path d="M12 5v14"></path>
                </svg>
                新規求人作成
              </Button>
            </Link>
            <Link href="/admin/jobs">
              <Button variant="outline">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                </svg>
                求人管理
              </Button>
            </Link>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">登録求人数</p>
                  <h3 className="text-2xl font-bold">{jobs.length}</h3>
                </div>
                <div className="rounded-full bg-blue-100 p-3 text-blue-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">管理者</p>
                  <h3 className="text-lg font-bold truncate">{user?.email || 'ゲスト'}</h3>
                </div>
                <div className="rounded-full bg-green-100 p-3 text-green-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">今月の新規求人</p>
                  <h3 className="text-2xl font-bold">
                    {jobs.filter(job => {
                      if (!job.created_at) return false;
                      const jobDate = new Date(job.created_at);
                      const now = new Date();
                      return jobDate.getMonth() === now.getMonth() && 
                             jobDate.getFullYear() === now.getFullYear();
                    }).length}
                  </h3>
                </div>
                <div className="rounded-full bg-purple-100 p-3 text-purple-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="M8 2v4"></path>
                    <path d="M16 2v4"></path>
                    <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                    <path d="M3 10h18"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">最近の求人</h3>
              <Link href="/admin/jobs" className="text-sm text-blue-600 hover:text-blue-800">
                すべて見る →
              </Link>
            </div>
            
            {recentJobs.length > 0 ? (
              <div className="space-y-3">
                {recentJobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div className="flex-1">
                      <h4 className="font-medium">{job.title}</h4>
                      <p className="text-sm text-gray-500 truncate">{job.summary}</p>
                      <div className="flex gap-1 mt-1">
                        {job.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="inline-block rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800"
                          >
                            {tag}
                          </span>
                        ))}
                        {job.tags.length > 3 && (
                          <span className="text-xs text-gray-500">+{job.tags.length - 3}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Link 
                        href={`/admin/jobs/${job.id}/edit`}
                        className="rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-100"
                      >
                        編集
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">まだ求人が登録されていません。</p>
            )}
          </div>
        </div>

        {/* 管理者追加機能 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">新しい管理者を追加</h2>
          
          {message && (
            <div className={`p-4 rounded mb-4 ${
              message.type === 'success' 
                ? 'bg-green-100 border border-green-400 text-green-700' 
                : 'bg-red-100 border border-red-400 text-red-700'
            }`}>
              <pre className="whitespace-pre-wrap text-sm">{message.text}</pre>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                新しい管理者のメールアドレス
              </label>
              <Input
                type="email"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full"
              />
            </div>
            
            <Button 
              onClick={handleAddAdmin}
              className="border-2 rounded-md transition-all duration-200 hover:shadow-md active:scale-95 active:shadow-sm"
            >
              管理者として追加
            </Button>
          </div>
        </div>

        {/* 管理機能メニュー */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">管理機能</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <h3 className="font-medium mb-2">求人管理</h3>
              <p className="text-sm text-gray-600 mb-3">求人情報の編集・削除</p>
              <Link href="/">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-2 rounded-md transition-all duration-200 hover:shadow-md active:scale-95 active:shadow-sm"
                >
                  求人一覧へ
                </Button>
              </Link>
            </div>
            
            <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <h3 className="font-medium mb-2">応募管理</h3>
              <p className="text-sm text-gray-600 mb-3">応募者情報・ステータス管理</p>
              <Link href="/admin/applications">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-2 rounded-md transition-all duration-200 hover:shadow-md active:scale-95 active:shadow-sm"
                >
                  応募管理へ
                </Button>
              </Link>
            </div>
            
            <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <h3 className="font-medium mb-2">ユーザー管理</h3>
              <p className="text-sm text-gray-600 mb-3">ユーザープロフィール確認</p>
              <Button 
                variant="outline" 
                size="sm"
                disabled
                className="border-2 rounded-md transition-all duration-200"
              >
                開発中
              </Button>
            </div>
          </div>
        </div>

        {/* 管理者作成手順 */}
        <div className="bg-blue-50 rounded-lg p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-800">📋 管理者アカウント作成手順</h2>
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-medium text-blue-700">方法1: 既存ユーザーを管理者に昇格</h3>
              <ol className="list-decimal list-inside space-y-1 text-blue-600 mt-2">
                <li>上記の「新しい管理者を追加」フォームにメールアドレスを入力</li>
                <li>表示された手順に従って auth.ts ファイルを編集</li>
                <li>サーバーを再起動</li>
              </ol>
            </div>
            
            <div>
              <h3 className="font-medium text-blue-700">方法2: 新しい管理者アカウントを作成</h3>
              <ol className="list-decimal list-inside space-y-1 text-blue-600 mt-2">
                <li>ターミナルで `node create-admin-user.js` を実行</li>
                <li>作成されたアカウント情報を確認</li>
                <li>必要に応じてSupabaseでメール確認を有効化</li>
                <li>auth.ts ファイルに新しいメールアドレスを追加</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 