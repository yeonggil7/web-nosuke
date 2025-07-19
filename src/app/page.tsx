import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Layout from '@/components/Layout';
import FavoriteButton from '@/components/FavoriteButton';
import { getAllJobs } from '@/lib/cms';

export const revalidate = 0; // ISRを無効にして常に最新データを取得

export default async function Home() {
  const jobs = await getAllJobs();
  
  return (
    <Layout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                あなたのキャリアを
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
                  見つけよう
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                FindOut Careerで理想の求人を発見し、新しいキャリアの扉を開きましょう
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/jobs"
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-200"
                >
                  キャリアを探す
                </Link>
                <Link
                  href="/about"
                  className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition duration-200"
                >
                  サービス詳細
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Jobs Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">注目のキャリア機会</h2>
              <p className="text-gray-600">あなたにぴったりの求人を見つけてください</p>
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
      </div>
    </Layout>
  );
}
