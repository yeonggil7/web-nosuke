import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { JobPosting } from "@/schema/jobSchema";
import Link from "next/link";
import Image from "next/image";

// デフォルトの画像URL
const DEFAULT_IMAGE_URL = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3";

export default function JobCard({ id, title, summary, tags, imageurl }: JobPosting) {
  // 画像URLが空の場合はデフォルトの画像を使用
  const imgSrc = imageurl || DEFAULT_IMAGE_URL;
  
  return (
    <Link href={`/jobs/${id}`} className="block">
      <Card className="h-full overflow-hidden transition-shadow hover:shadow-lg">
        <div className="h-40 w-full overflow-hidden relative">
          <Image 
            src={imgSrc} 
            alt={title} 
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
        </div>
        <CardHeader>
          <h3 className="text-xl font-semibold">{title}</h3>
          <div className="text-sm text-gray-500">{tags.join(' ・ ')}</div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">{summary}</p>
        </CardContent>
      </Card>
    </Link>
  );
} 