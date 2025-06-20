'use client';

import React, { useState, useEffect } from 'react';
import { getUserFavorites } from '@/lib/userDatabase';
import { getCurrentUser } from '@/lib/auth';
import FavoriteButton from '@/components/FavoriteButton';
import Link from 'next/link';
import Image from 'next/image';

// getUserFavoritesの戻り値に合わせた型定義
interface FavoriteWithJob {
  id: string;
  user_id: string;
  job_id: string;
  created_at: string;
  jobs: {
    id: string;
    title: string;
    summary: string;
    tags: string[];
    imageurl: string;
  };
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteWithJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function loadFavorites() {
      setIsLoading(true);
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          const favoritesData = await getUserFavorites(currentUser.id);
          // 型アサーションで正しい型として扱う
          setFavorites(favoritesData as FavoriteWithJob[]);
        }
      } catch (error) {
        console.error('お気に入り読み込みエラー:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadFavorites();
  }, []);

  // お気に入りが削除された時の処理
  const handleFavoriteToggle = (jobId: string, isFavorited: boolean) => {
    if (!isFavorited) {
      // お気に入りから削除された場合、リストから除外
      setFavorites(prev => prev.filter(fav => fav.job_id !== jobId));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">お気に入りを読み込んでいます...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">ログインが必要です</h2>
          <p className="text-gray-600 mb-6">お気に入り機能を使用するにはログインしてください。</p>
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
            <span className="text-gray-900">お気に入り</span>
          </nav>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">お気に入り求人</h1>
              <p className="text-gray-600 mt-2">
                保存した求人一覧 ({favorites.length}件)
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

        {/* お気に入り一覧 */}
        {favorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {favorites.map((favorite) => (
              <div key={favorite.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden group">
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={favorite.jobs.imageurl || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43'}
                    alt={favorite.jobs.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute top-4 right-4">
                    <FavoriteButton 
                      jobId={favorite.job_id} 
                      size="md"
                      className="shadow-lg"
                      onToggle={(isFavorited) => handleFavoriteToggle(favorite.job_id, isFavorited)}
                    />
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {new Date(favorite.created_at).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-sm font-semibold text-gray-600">
                        {favorite.jobs.title.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{favorite.jobs.title}</h3>
                      <p className="text-sm text-gray-500">テクノロジー企業</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4 line-clamp-2">{favorite.jobs.summary}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {favorite.jobs.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                        {tag}
                      </span>
                    ))}
                    {favorite.jobs.tags.length > 3 && (
                      <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-sm">
                        +{favorite.jobs.tags.length - 3}
                      </span>
                    )}
                  </div>
                  
                  <Link 
                    href={`/jobs/${favorite.job_id}`}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 text-center block"
                  >
                    詳細を見る
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">お気に入りがありません</h3>
            <p className="text-gray-600 mb-6">
              気になる求人をお気に入りに追加して、後で確認できます
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