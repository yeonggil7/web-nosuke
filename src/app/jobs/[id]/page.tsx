import { getJobById } from '@/lib/cms';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Metadata, ResolvingMetadata } from 'next';

// デフォルトの画像URL
const DEFAULT_IMAGE_URL = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3";

export const revalidate = 3600; // 1時間ごとに再検証

interface JobDetailProps {
  params: {
    id: string;
  };
}

export async function generateMetadata(
  props: JobDetailProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // paramsを明示的に待機
  const params = await Promise.resolve(props.params);
  const id = params.id;
  const job = await getJobById(id);
  
  if (!job) {
    return {
      title: '求人が見つかりません',
      description: '指定された求人情報は存在しません'
    };
  }
  
  return {
    title: job.title,
    description: job.summary,
    openGraph: {
      title: job.title,
      description: job.summary,
      images: [{ url: job.imageurl || DEFAULT_IMAGE_URL }],
    },
  };
}

export default async function JobDetail(props: JobDetailProps) {
  // paramsを明示的に待機
  const params = await Promise.resolve(props.params);
  const id = params.id;
  const job = await getJobById(id);
  
  if (!job) {
    notFound();
  }
  
  // 画像URLが空の場合はデフォルトの画像を使用
  const imgSrc = job.imageurl || DEFAULT_IMAGE_URL;
  
  return (
    <article className="max-w-4xl mx-auto">
      <div className="space-y-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">{job.title}</h1>
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
          <p className="text-lg text-gray-600">{job.summary}</p>
        </div>
        
        <div className="rounded-lg overflow-hidden mb-8 relative h-64">
          <Image 
            src={imgSrc} 
            alt={job.title} 
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
        </div>
        
        <div className="prose max-w-none">
          {job.content}
        </div>
      </div>
    </article>
  );
} 