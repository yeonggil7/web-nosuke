'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAdmin } from '@/lib/auth';

interface AdminProtectedProps {
  children: React.ReactNode;
}

export default function AdminProtected({ children }: AdminProtectedProps) {
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function checkAdminStatus() {
      try {
        const adminStatus = await isAdmin();
        setIsAuthorized(adminStatus);
        
        if (!adminStatus) {
          // 管理者でない場合はホームページにリダイレクト
          router.push('/');
        }
      } catch (error) {
        console.error('管理者権限の確認中にエラーが発生しました', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    }

    checkAdminStatus();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg">読み込み中...</p>
      </div>
    );
  }

  // 権限がない場合は何も表示しない（リダイレクト中）
  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
} 