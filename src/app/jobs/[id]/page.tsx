'use client';

import { useState, useEffect } from 'react';
import { getJobById, updateJob } from '@/lib/cms';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { JobPosting } from '@/schema/jobSchema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User } from '@supabase/supabase-js';
import Image from 'next/image';
import FavoriteButton from '@/components/FavoriteButton';
import ApplyButton from '@/components/ApplyButton';

// Edge Runtime設定
export const runtime = 'edge';

// デフォルトの画像URL
const DEFAULT_IMAGE_URL = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3";

interface JobDetailProps {
  params: Promise<{
    id: string;
  }>;
}

export default function JobDetail({ params }: JobDetailProps) {
  const [job, setJob] = useState<JobPosting | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  
  // 編集用のフォームデータ
  const [editData, setEditData] = useState({
    title: '',
    summary: '',
    tags: '',
    imageurl: '',
    content: ''
  });

  useEffect(() => {
    async function initializeParams() {
      try {
        const resolvedParams = await params;
        setJobId(resolvedParams.id);
      } catch (error) {
        console.error('パラメータ取得エラー:', error);
        setError('ページの読み込みに失敗しました');
        setIsLoading(false);
      }
    }

    initializeParams();
  }, [params]);

  useEffect(() => {
    if (!jobId) return;

    async function loadJobAndUser() {
      try {
        setIsLoading(true);
        
        // 求人情報を取得（jobIdのnullチェック）
        if (!jobId) {
          setError('求人IDが見つかりません');
          return;
        }
        
        const jobData = await getJobById(jobId);
        if (!jobData) {
          setError('求人が見つかりません');
          return;
        }
        
        setJob(jobData);
        setEditData({
          title: jobData.title,
          summary: jobData.summary,
          tags: jobData.tags.join(', '),
          imageurl: jobData.imageurl,
          content: jobData.content
        });

        // ユーザー情報と管理者権限を確認
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        
        if (currentUser) {
          const adminStatus = await isAdmin();
          setIsAdminUser(adminStatus);
        }
        
      } catch (err) {
        console.error('データ読み込みエラー:', err);
        setError('データの読み込みに失敗しました');
      } finally {
        setIsLoading(false);
      }
    }

    loadJobAndUser();
  }, [jobId]);

  const handleEdit = () => {
    setIsEditing(true);
    setError(null);
    setSuccess(null);
  };

  const handleCancel = () => {
    if (!job) return;
    
    setIsEditing(false);
    setEditData({
      title: job.title,
      summary: job.summary,
      tags: job.tags.join(', '),
      imageurl: job.imageurl,
      content: job.content
    });
    setError(null);
    setSuccess(null);
  };

  const handleSave = async () => {
    if (!job) return;
    
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const updatedJob: Partial<JobPosting> = {
        title: editData.title,
        summary: editData.summary,
        tags: editData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
        imageurl: editData.imageurl,
        content: editData.content
      };

      const result = await updateJob(job.id, updatedJob);
      
      if (result.error) {
        throw new Error(result.error.message || '更新に失敗しました');
      }

      if (result.data) {
        setJob(result.data);
      }
      setIsEditing(false);
      setSuccess('求人情報が正常に更新されました！');
      
      // 3秒後に成功メッセージを消す
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('更新エラー:', err);
      setError(err instanceof Error ? err.message : '更新に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof typeof editData, value: string) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-center items-center min-h-64">
          <div className="text-center">
            <div className="text-xl mb-4">読み込み中...</div>
            <div className="text-sm text-gray-500">求人情報を取得しています</div>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold mb-4">求人が見つかりません</h1>
          <p className="text-gray-600">指定された求人情報は存在しません</p>
        </div>
      </div>
    );
  }

  // 画像URLが空の場合はデフォルトの画像を使用
  const imgSrc = job.imageurl || DEFAULT_IMAGE_URL;

  return (
    <article className="max-w-4xl mx-auto">
      <div className="space-y-8">
        {/* 管理者編集ボタン */}
        {isAdminUser && (
          <div className="flex justify-end space-x-2">
            {!isEditing ? (
              <Button 
                onClick={handleEdit}
                className="border-2 rounded-md transition-all duration-200 hover:shadow-md active:scale-95 active:shadow-sm"
              >
                📝 編集
              </Button>
            ) : (
              <>
                <Button 
                  onClick={handleCancel}
                  variant="outline"
                  className="border-2 rounded-md transition-all duration-200 hover:shadow-md active:scale-95 active:shadow-sm"
                >
                  キャンセル
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="border-2 rounded-md transition-all duration-200 hover:shadow-md active:scale-95 active:shadow-sm"
                >
                  {isSaving ? '保存中...' : '💾 保存'}
                </Button>
              </>
            )}
          </div>
        )}

        {/* エラー・成功メッセージ */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        <div className="mb-8">
          {/* タイトル */}
          {isEditing ? (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                求人タイトル
              </label>
              <Input
                value={editData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="text-2xl font-bold"
                placeholder="求人タイトルを入力"
              />
            </div>
          ) : (
            <h1 className="text-3xl font-bold mb-4">{job.title}</h1>
          )}

          {/* タグ */}
          {isEditing ? (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                タグ（カンマ区切り）
              </label>
              <Input
                value={editData.tags}
                onChange={(e) => handleInputChange('tags', e.target.value)}
                placeholder="React, Node.js, TypeScript"
              />
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 mb-4">
              {job.tags.map((tag: string) => (
                <span 
                  key={tag} 
                  className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* 概要 */}
          {isEditing ? (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                概要
              </label>
              <Input
                value={editData.summary}
                onChange={(e) => handleInputChange('summary', e.target.value)}
                placeholder="求人の概要を入力"
              />
            </div>
          ) : (
            <p className="text-lg text-gray-600">{job.summary}</p>
          )}
        </div>

        {/* 画像URL編集 */}
        {isEditing && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              画像URL
            </label>
            <Input
              value={editData.imageurl}
              onChange={(e) => handleInputChange('imageurl', e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>
        )}
        
        {/* 画像 */}
        <div className="rounded-lg overflow-hidden mb-8 relative h-64">
          <Image 
            src={isEditing ? (editData.imageurl || DEFAULT_IMAGE_URL) : imgSrc} 
            alt={isEditing ? editData.title : job.title} 
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
        </div>

        {/* アクションボタン（非編集時のみ表示） */}
        {!isEditing && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-gray-50 rounded-lg mb-8">
            <div className="flex items-center space-x-4">
              <FavoriteButton 
                jobId={job.id} 
                size="lg"
                className="shadow-md"
              />
              <div className="text-sm text-gray-600">
                <p>気になったらお気に入りに保存</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <ApplyButton 
                jobId={job.id}
                jobTitle={job.title}
                className="w-full sm:w-auto"
              />
              <div className="text-sm text-gray-600 text-center sm:text-left">
                <p>応募状況は<br className="sm:hidden" />マイページで確認</p>
              </div>
            </div>
          </div>
        )}

        {/* 詳細内容 */}
        {isEditing ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              詳細内容
            </label>
            <textarea
              value={editData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              rows={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="求人の詳細内容を入力してください..."
            />
          </div>
        ) : (
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap">{job.content}</div>
          </div>
        )}
      </div>
    </article>
  );
} 