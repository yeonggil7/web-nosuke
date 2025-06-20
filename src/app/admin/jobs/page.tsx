'use client';

import { useEffect, useState } from 'react';
import { getAllJobs } from '@/lib/cms';
import { JobPosting } from '@/schema/jobSchema';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  
  // 全てのタグを取得
  const allTags = Array.from(new Set(jobs.flatMap(job => job.tags))).sort();
  
  useEffect(() => {
    async function loadJobs() {
      try {
        const jobsData = await getAllJobs();
        setJobs(jobsData);
        setFilteredJobs(jobsData);
      } catch (error) {
        console.error('求人データの取得に失敗しました:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadJobs();
  }, []);
  
  // 検索・フィルタリング
  useEffect(() => {
    let filtered = jobs;
    
    // 検索語でフィルタリング
    if (searchTerm) {
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // タグでフィルタリング
    if (selectedTag) {
      filtered = filtered.filter(job => job.tags.includes(selectedTag));
    }
    
    setFilteredJobs(filtered);
  }, [jobs, searchTerm, selectedTag]);
  
  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">求人管理</h2>
          <p className="text-muted-foreground">
            登録されている求人の管理、追加、編集、削除を行います。
          </p>
        </div>
        <Link href="/admin/jobs/new">
          <Button className="bg-green-600 hover:bg-green-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <path d="M5 12h14"></path>
              <path d="M12 5v14"></path>
            </svg>
            新規作成
          </Button>
        </Link>
      </div>
      
      {/* 検索・フィルタリング */}
      <div className="flex gap-4 items-center bg-white p-4 rounded-lg border shadow-sm">
        <div className="flex-1">
          <Input
            placeholder="求人タイトル、概要、内容で検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>
        <div>
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">全てのタグ</option>
            {allTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>
        {(searchTerm || selectedTag) && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchTerm('');
              setSelectedTag('');
            }}
          >
            クリア
          </Button>
        )}
      </div>
      
      {/* 統計情報 */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <p className="text-sm text-gray-500">総求人数</p>
          <p className="text-2xl font-bold">{jobs.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <p className="text-sm text-gray-500">表示中</p>
          <p className="text-2xl font-bold">{filteredJobs.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <p className="text-sm text-gray-500">タグ数</p>
          <p className="text-2xl font-bold">{allTags.length}</p>
        </div>
      </div>
      
      <div className="rounded-lg border bg-white shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="py-3 px-4 text-left font-medium">ID</th>
                <th className="py-3 px-4 text-left font-medium">タイトル</th>
                <th className="py-3 px-4 text-left font-medium">タグ</th>
                <th className="py-3 px-4 text-left font-medium">作成日</th>
                <th className="py-3 px-4 text-right font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map((job) => (
                <tr key={job.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 text-left">
                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                      {job.id.slice(0, 8)}...
                    </span>
                  </td>
                  <td className="py-3 px-4 text-left">
                    <div>
                      <p className="font-medium">{job.title}</p>
                      <p className="text-xs text-gray-500 truncate max-w-xs">
                        {job.summary}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-left">
                    <div className="flex flex-wrap gap-1">
                      {job.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="inline-block rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800"
                        >
                          {tag}
                        </span>
                      ))}
                      {job.tags.length > 2 && (
                        <span className="text-xs text-gray-500">+{job.tags.length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-left">
                    {job.created_at 
                      ? new Date(job.created_at).toLocaleDateString('ja-JP') 
                      : '-'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link 
                        href={`/jobs/${job.id}`}
                        target="_blank"
                        className="rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100"
                      >
                        表示
                      </Link>
                      <Link 
                        href={`/admin/jobs/${job.id}/edit`}
                        className="rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-100"
                      >
                        編集
                      </Link>
                      <Link 
                        href={`/admin/jobs/${job.id}/delete`}
                        className="rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-100"
                      >
                        削除
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              
              {filteredJobs.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    {searchTerm || selectedTag 
                      ? '検索条件に一致する求人はありません' 
                      : '登録されている求人はありません'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 