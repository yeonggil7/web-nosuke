'use client';

import React, { useState, useEffect } from 'react';
import { addToFavorites, removeFromFavorites, isJobFavorited } from '@/lib/userDatabase';
import { getCurrentUser } from '@/lib/auth';

interface FavoriteButtonProps {
  jobId: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  onToggle?: (isFavorited: boolean) => void;
}

export default function FavoriteButton({ 
  jobId, 
  className = '', 
  size = 'md',
  onToggle 
}: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // サイズ設定
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const buttonSizeClasses = {
    sm: 'p-1',
    md: 'p-2',
    lg: 'p-3'
  };

  // ユーザー情報とお気に入り状態の初期化
  useEffect(() => {
    async function initializeFavoriteState() {
      try {
        const user = await getCurrentUser();
        if (user) {
          setUserId(user.id);
          const favorited = await isJobFavorited(user.id, jobId);
          setIsFavorited(favorited);
        }
      } catch (error) {
        console.error('お気に入り状態の初期化に失敗しました:', error);
      }
    }

    initializeFavoriteState();
  }, [jobId]);

  // お気に入りトグル処理
  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!userId) {
      // ログインしていない場合はログインページにリダイレクト
      window.location.href = '/login';
      return;
    }

    setIsLoading(true);

    try {
      if (isFavorited) {
        // お気に入りから削除
        const { error } = await removeFromFavorites(userId, jobId);
        if (error) {
          console.error('お気に入り削除エラー:', error);
          return;
        }
        setIsFavorited(false);
        onToggle?.(false);
      } else {
        // お気に入りに追加
        const { error } = await addToFavorites(userId, jobId);
        if (error) {
          console.error('お気に入り追加エラー:', error);
          return;
        }
        setIsFavorited(true);
        onToggle?.(true);
      }
    } catch (error) {
      console.error('お気に入り操作エラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleFavorite}
      disabled={isLoading}
      className={`
        ${buttonSizeClasses[size]}
        bg-white rounded-full shadow-sm hover:shadow-md transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      title={isFavorited ? 'お気に入りから削除' : 'お気に入りに追加'}
    >
      {isLoading ? (
        <div className={`${sizeClasses[size]} animate-spin`}>
          <svg className="w-full h-full text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
      ) : (
        <svg 
          className={`${sizeClasses[size]} transition-colors duration-200 ${
            isFavorited 
              ? 'text-red-500 fill-current' 
              : 'text-gray-600 hover:text-red-500'
          }`} 
          fill={isFavorited ? 'currentColor' : 'none'} 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
          />
        </svg>
      )}
    </button>
  );
} 