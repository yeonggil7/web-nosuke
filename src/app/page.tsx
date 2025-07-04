import { getAllJobs } from '@/lib/cms';
import JobCard from '@/components/JobCard';
import FavoriteButton from '@/components/FavoriteButton';
// import SupabaseStatus from '@/components/SupabaseStatus';
import Link from 'next/link';
import Image from 'next/image';

export const revalidate = 0; // ISRを無効にして常に最新データを取得

export default async function Home() {
  const jobs = await getAllJobs();
  
  return (
    <div className="min-h-screen bg-white">
      {/* メインビジュアル */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              あなたのキャリアを
              <br />
              <span className="text-blue-300">根付かせよう</span>
            </h1>
            <p className="text-xl lg:text-2xl mb-4 text-blue-100">
              Roots Career で見つける、理想の未来
            </p>
            <p className="text-lg mb-8 text-blue-200">
              あなたの可能性を最大限に引き出すキャリア支援プラットフォーム
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/mypage" className="bg-white text-blue-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-all duration-200 hover:shadow-lg active:scale-95">
                キャリアを始める
              </Link>
              <Link href="/jobs" className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-900 transition-all duration-200 active:scale-95">
                求人を探す
              </Link>
            </div>
          </div>
        </div>
        {/* 装飾的な要素 */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600 rounded-full opacity-10 -translate-y-48 translate-x-48"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400 rounded-full opacity-10 translate-y-32 -translate-x-32"></div>
      </section>

      {/* 企業ロゴセクション */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4 text-gray-800">
            限定特別ルート公開中
          </h2>
          <p className="text-center text-gray-600 mb-12">
            難関大手・配属確約・選考免除
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center">
            {/* 企業ロゴのプレースホルダー */}
            <div className="bg-white p-6 rounded-lg shadow-sm border w-full h-20 flex items-center justify-center">
              <span className="text-gray-600 font-semibold">NTT DATA</span>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border w-full h-20 flex items-center justify-center">
              <span className="text-gray-600 font-semibold">DeNA</span>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border w-full h-20 flex items-center justify-center">
              <span className="text-gray-600 font-semibold">McKinsey</span>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border w-full h-20 flex items-center justify-center">
              <span className="text-gray-600 font-semibold">DMM.com</span>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <Link href="/special-routes" className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold">
              特設ページを確認する
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* 新着エントリーセクション */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800">注目の求人</h2>
            <Link href="/jobs" className="text-blue-600 hover:text-blue-800 font-semibold flex items-center">
              すべて見る
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {jobs.slice(0, 6).map(job => (
              <div key={job.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden group">
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={job.imageurl || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43'}
                    alt={job.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute top-4 right-4">
                    <FavoriteButton 
                      jobId={job.id} 
                      size="md"
                      className="shadow-lg"
                    />
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {new Date(job.created_at || '').toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-sm font-semibold text-gray-600">
                        {job.title.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{job.title}</h3>
                      <p className="text-sm text-gray-500">優良企業</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4 line-clamp-2">{job.summary}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <Link 
                    href={`/jobs/${job.id}`}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 text-center block"
                  >
                    詳細を見る
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTAセクション */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            あなたの理想のキャリアを
            <br />
            今すぐ始めませんか？
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Roots Career で新しい可能性を発見しよう
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/mypage" className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all duration-200 hover:shadow-lg active:scale-95">
              今すぐ登録
            </Link>
            <Link href="/about" className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-200 active:scale-95">
              サービス詳細
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
