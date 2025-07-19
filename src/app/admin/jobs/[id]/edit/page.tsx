'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getJobById, updateJob } from '@/lib/cms';
import { uploadImage } from '@/lib/imageUpload';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { JobPosting } from '@/schema/jobSchema';
import ImageUpload from '@/components/ImageUpload';
import Link from 'next/link';

// Edge Runtime設定
export const runtime = 'edge';

interface EditJobPageProps {
  params: {
    id: string;
  };
}

export default function EditJobPage({ params }: EditJobPageProps) {
  const router = useRouter();
  const [job, setJob] = useState<JobPosting | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    tags: '',
    imageurl: '',
    content: ''
  });
  
  useEffect(() => {
    async function loadJob() {
      try {
        const jobData = await getJobById(params.id);
        if (jobData) {
          setJob(jobData);
          setFormData({
            title: jobData.title,
            summary: jobData.summary,
            tags: jobData.tags.join(', '),
            imageurl: jobData.imageurl,
            content: jobData.content
          });
        } else {
          setError('求人が見つかりませんでした');
        }
      } catch (err: any) {
        setError('求人情報の取得に失敗しました');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    loadJob();
  }, [params.id]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageSelect = async (file: File) => {
    setUploading(true);
    setError(null);
    
    try {
      const result = await uploadImage(file);
      
      if (result.success && result.imageUrl) {
        setFormData(prev => ({ ...prev, imageurl: result.imageUrl! }));
      } else {
        setError(result.error || '画像のアップロードに失敗しました');
      }
    } catch (err) {
      console.error('Image upload error:', err);
      setError('画像のアップロードに失敗しました');
    } finally {
      setUploading(false);
    }
  };

  const handleImageUrl = (url: string) => {
    setFormData(prev => ({ ...prev, imageurl: url }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    
    try {
      // 画像URLの必須チェック
      if (!formData.imageurl) {
        setError('画像を選択するか、画像URLを入力してください');
        return;
      }

      // タグを配列に変換
      const tags = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      const { error } = await updateJob(params.id, {
        title: formData.title,
        summary: formData.summary,
        tags,
        imageurl: formData.imageurl,
        content: formData.content
      });
      
      if (error) throw error;
      
      // 成功したら求人管理ページにリダイレクト
      router.push('/admin/jobs');
      router.refresh(); // ページを更新して最新データを表示
    } catch (err: any) {
      setError(err.message || '求人の更新中にエラーが発生しました');
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }
  
  if (error && !job) {
    return (
      <div className="rounded-md bg-red-50 p-4 text-sm text-red-500">
        {error}
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">求人の編集</h2>
        <p className="text-muted-foreground">
          求人情報を編集して更新します。
        </p>
      </div>
      
      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-500">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-lg border bg-white p-6 shadow-sm space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              タイトル <span className="text-red-500">*</span>
            </label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="例：フロントエンドエンジニア"
            />
          </div>
          
          <div>
            <label htmlFor="summary" className="block text-sm font-medium mb-1">
              概要 <span className="text-red-500">*</span>
            </label>
            <Input
              id="summary"
              name="summary"
              value={formData.summary}
              onChange={handleChange}
              required
              placeholder="例：React、Next.js、TypeScriptを使用したWebアプリケーション開発"
            />
          </div>
          
          <div>
            <label htmlFor="tags" className="block text-sm font-medium mb-1">
              タグ（カンマ区切り） <span className="text-red-500">*</span>
            </label>
            <Input
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              required
              placeholder="例：React,Next.js,TypeScript"
            />
            <p className="text-xs text-gray-500 mt-1">
              複数のタグを追加する場合はカンマで区切ってください
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              画像 <span className="text-red-500">*</span>
            </label>
            <ImageUpload
              onImageSelect={handleImageSelect}
              onImageUrl={handleImageUrl}
              currentImageUrl={formData.imageurl}
              uploading={uploading}
            />
          </div>
          
          <div>
            <label htmlFor="content" className="block text-sm font-medium mb-1">
              詳細内容 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              rows={8}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="求人の詳細な説明を入力してください"
            ></textarea>
            <p className="text-xs text-gray-500 mt-1">
              改行は自動的に反映されます
            </p>
          </div>
        </div>
        
        <div className="flex justify-end gap-4">
          <Link href="/admin/jobs">
            <Button type="button" variant="outline">
              キャンセル
            </Button>
          </Link>
          <Button type="submit" disabled={saving || uploading}>
            {saving ? '更新中...' : uploading ? 'アップロード中...' : '更新する'}
          </Button>
        </div>
      </form>
    </div>
  );
} 