'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { User } from '@supabase/supabase-js';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="text-xl font-bold text-indigo-600">ジョブポスティング</Link>
              </div>
            </div>
            <div className="flex items-center">
              {!isLoading && (
                user ? (
                  <Link href="/mypage" className="text-indigo-600 hover:text-indigo-500 font-medium">
                    マイページ
                  </Link>
                ) : (
                  <Link href="/login" className="text-indigo-600 hover:text-indigo-500 font-medium">
                    ログイン
                  </Link>
                )
              )}
            </div>
          </div>
        </div>
      </header>
      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-t border-gray-200 py-8 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} ジョブポスティングサイト. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
} 