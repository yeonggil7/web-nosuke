'use client';

import React, { useState, useEffect } from 'react';
import { searchJobs, getAllTags } from '@/lib/cms';
import { JobPosting } from '@/schema/jobSchema';
import JobCard from '@/components/JobCard';
import FavoriteButton from '@/components/FavoriteButton';
import Link from 'next/link';
import Image from 'next/image';

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  // 初期データの読み込み
  useEffect(() => {
    async function loadInitialData() {
      setIsLoading(true);
      try {
        const [jobsData, tagsData] = await Promise.all([
          searchJobs(), // 全求人を取得
          getAllTags()
        ]);
        setJobs(jobsData);
        setAllTags(tagsData);
      } catch (error) {
        console.error('初期データの読み込みに失敗しました:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadInitialData();
  }, []);

  // 検索実行
  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const results = await searchJobs(
        searchQuery || undefined,
        selectedTags.length > 0 ? selectedTags : undefined
      );
      setJobs(results);
    } catch (error) {
      console.error('検索に失敗しました:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // 検索リセット
  const handleReset = async () => {
    setSearchQuery('');
    setSelectedTags([]);
    setIsSearching(true);
    try {
      const results = await searchJobs();
      setJobs(results);
    } catch (error) {
      console.error('リセットに失敗しました:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // タグの選択/選択解除
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  // エンターキーでの検索
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">求人情報を読み込んでいます...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダーセクション */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">求人検索</h1>
            <p className="text-xl text-gray-600">あなたにぴったりの求人を見つけよう</p>
          </div>

          {/* 検索フォーム */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-6 border">
              <div className="flex flex-col lg:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                    キーワード検索
                  </label>
                  <div className="relative">
                    <input
                      id="search"
                      type="text"
                      placeholder="職種、技術、会社名などで検索..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <svg 
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSearching ? '検索中...' : '検索'}
                  </button>
                  <button
                    onClick={handleReset}
                    disabled={isSearching}
                    className="bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    リセット
                  </button>
                </div>
              </div>

              {/* タグフィルター */}
              {allTags.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    技術・スキルで絞り込み
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                          selectedTags.includes(tag)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 検索結果 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 結果ヘッダー */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              検索結果
            </h2>
            <p className="text-gray-600 mt-1">
              {jobs.length}件の求人が見つかりました
              {(searchQuery || selectedTags.length > 0) && (
                <span className="ml-2">
                  {searchQuery && `"${searchQuery}"`}
                  {selectedTags.length > 0 && (
                    <span className="ml-2">
                      [{selectedTags.join(', ')}]
                    </span>
                  )}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* 求人一覧 */}
        {isSearching ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">検索中...</p>
          </div>
        ) : jobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {jobs.map((job) => (
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
                      <p className="text-sm text-gray-500">テクノロジー企業</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4 line-clamp-2">{job.summary}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                        {tag}
                      </span>
                    ))}
                    {job.tags.length > 3 && (
                      <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-sm">
                        +{job.tags.length - 3}
                      </span>
                    )}
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
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">求人が見つかりませんでした</h3>
            <p className="text-gray-600 mb-6">
              検索条件を変更して再度お試しください
            </p>
            <button
              onClick={handleReset}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
            >
              すべての求人を表示
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 