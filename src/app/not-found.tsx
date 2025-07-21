import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center">
          {/* アイコン */}
          <div className="mx-auto w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mb-8">
            <svg className="w-12 h-12 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>

          {/* メインメッセージ */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ページが見つかりません
          </h1>
          <h2 className="text-xl text-gray-600 mb-8">
            このページは現在準備中です
          </h2>

          {/* 説明 */}
          <div className="max-w-2xl mx-auto mb-12">
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              申し訳ございません。お探しのページは現在準備中か、<br />
              一時的にご利用いただけない状態です。
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-left">
              <h3 className="font-semibold text-blue-900 mb-3">🚀 利用可能な機能</h3>
              <ul className="space-y-2 text-blue-800">
                <li>• 求人検索・閲覧</li>
                <li>• 求人への応募</li>
                <li>• お気に入り機能</li>
                <li>• プロフィール管理</li>
                <li>• 応募履歴確認</li>
              </ul>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/">
              <Button className="px-8 py-3 text-lg border-2 rounded-md transition-all duration-200 hover:shadow-md active:scale-95 active:shadow-sm">
                ホームに戻る
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
            <Link href="/contact">
              <Button 
                variant="outline"
                className="px-8 py-3 text-lg border-2 rounded-md transition-all duration-200 hover:shadow-md active:scale-95 active:shadow-sm"
              >
                お問い合わせ
              </Button>
            </Link>
          </div>

          {/* エラーコード */}
          <div className="text-gray-400 text-sm">
            <p>Error Code: 404 - Page Not Found</p>
          </div>
        </div>
      </div>
    </div>
  );
} 