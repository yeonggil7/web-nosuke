'use client';

import { useEffect, useState } from 'react';
import { getCurrentUser, signOut } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';

export default function MyPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadUser() {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('ユーザー情報の取得に失敗しました', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('ログアウトに失敗しました', error);
    }
  };

  // ログインしていない場合はログインページにリダイレクト
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p>読み込み中...</p>
      </div>
    );
  }

  if (!user) {
    return null; // リダイレクト中は何も表示しない
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold mb-6">マイページ</h1>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">アカウント情報</h2>
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">メールアドレス</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">ユーザーID</p>
                <p className="font-medium">{user.id}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">アクション</h2>
          <div className="flex flex-wrap gap-4">
            <Button onClick={handleSignOut} variant="outline">
              ログアウト
            </Button>
            <Link href="/">
              <Button variant="secondary">ホームに戻る</Button>
            </Link>
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">お気に入りの求人</h2>
        <p className="text-gray-500">お気に入りの求人はまだありません。</p>
        {/* お気に入りの求人リストをここに表示 */}
      </div>
    </div>
  );
} 