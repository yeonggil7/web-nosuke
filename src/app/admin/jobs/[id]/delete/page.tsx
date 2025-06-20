'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getJobById, deleteJob } from '@/lib/cms';
import { Button } from '@/components/ui/button';
import { JobPosting } from '@/schema/jobSchema';
import Link from 'next/link';

interface DeleteJobPageProps {
  params: {
    id: string;
  };
}

export default function DeleteJobPage({ params }: DeleteJobPageProps) {
  const router = useRouter();
  const [job, setJob] = useState<JobPosting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  useEffect(() => {
    async function loadJob() {
      try {
        const jobData = await getJobById(params.id);
        setJob(jobData);
      } catch (err: any) {
        setError('求人情報の取得に失敗しました');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    loadJob();
  }, [params.id]);
  
  const handleDelete = async () => {
    if (!confirm('本当にこの求人を削除しますか？この操作は元に戻せません。')) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      const { error } = await deleteJob(params.id);
      
      if (error) throw error;
      
      // 成功したら求人管理ページにリダイレクト
      router.push('/admin/jobs');
      router.refresh(); // ページを更新して最新データを表示
    } catch (err: any) {
      setError(err.message || '求人の削除中にエラーが発生しました');
      setIsDeleting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4 text-sm text-red-500">
        {error}
      </div>
    );
  }
  
  if (!job) {
    return (
      <div className="rounded-md bg-yellow-50 p-4 text-sm text-yellow-700">
        求人が見つかりませんでした
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">求人の削除</h2>
        <p className="text-muted-foreground">
          以下の求人を削除しようとしています。この操作は元に戻せません。
        </p>
      </div>
      
      <div className="rounded-lg border bg-white p-6 shadow-sm space-y-4">
        <div className="border-b pb-4">
          <h3 className="text-xl font-bold">{job.title}</h3>
          <p className="text-gray-500 mt-1">{job.summary}</p>
        </div>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium">タグ</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {job.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-block rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium">ID</p>
            <p className="text-gray-700 mt-1">{job.id}</p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end gap-4">
        <Link href="/admin/jobs">
          <Button type="button" variant="outline">
            キャンセル
          </Button>
        </Link>
        <Button 
          onClick={handleDelete} 
          variant="destructive" 
          disabled={isDeleting}
        >
          {isDeleting ? '削除中...' : '削除する'}
        </Button>
      </div>
    </div>
  );
} 