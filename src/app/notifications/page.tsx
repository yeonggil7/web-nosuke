'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center">
          {/* アイコン */}
          <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-8">
            <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 7h16M4 12h16M4 17h7" />
            </svg>
          </div>

          {/* メインメッセージ */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            通知機能
          </h1>
          <h2 className="text-xl text-gray-600 mb-8">
            現在準備中です
          </h2>

          {/* 説明 */}
          <div className="max-w-2xl mx-auto mb-12">
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              通知機能は現在開発中です。<br />
              近日中にご利用いただけるよう準備を進めておりますので、今しばらくお待ちください。
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-left">
              <h3 className="font-semibold text-blue-900 mb-3">📢 予定している機能</h3>
              <ul className="space-y-2 text-blue-800">
                <li>• 応募状況の更新通知</li>
                <li>• 新着求人のお知らせ</li>
                <li>• お気に入り求人の情報更新通知</li>
                <li>• システムからの重要なお知らせ</li>
              </ul>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/mypage">
              <Button className="px-8 py-3 text-lg border-2 rounded-md transition-all duration-200 hover:shadow-md active:scale-95 active:shadow-sm">
                マイページに戻る
              </Button>
            </Link>
            <Link href="/jobs">
              <Button 
                variant="outline"
                className="px-8 py-3 text-lg border-2 rounded-md transition-all duration-200 hover:shadow-md active:scale-95 active:shadow-sm"
              >
                求人を探す
              </Button>
            </Link>
          </div>

          {/* 開発予定情報 */}
          <div className="mt-16 p-6 bg-white rounded-lg shadow-sm border">
            <div className="flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-lg font-semibold text-gray-900">開発状況</span>
            </div>
            <div className="text-gray-600">
              <p className="mb-2">🚧 <strong>現在の状況:</strong> 基本機能の実装中</p>
              <p className="mb-2">📅 <strong>予定リリース:</strong> 2025年1月下旬</p>
              <p>✨ <strong>次回更新:</strong> ベータ版の公開予定</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 