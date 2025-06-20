'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { JobPosting } from "@/schema/jobSchema";
import { getCurrentUser, isAdmin } from '@/lib/auth';
import Link from "next/link";
import Image from "next/image";
import { Button } from '@/components/ui/button';

// デフォルトの画像URL
const DEFAULT_IMAGE_URL = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3";

export default function JobCard({ id, title, summary, tags, imageurl }: JobPosting) {
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAdminStatus() {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          const adminStatus = await isAdmin();
          setIsAdminUser(adminStatus);
        }
      } catch (error) {
        console.error('管理者権限確認エラー:', error);
      } finally {
        setIsLoading(false);
      }
    }

    checkAdminStatus();
  }, []);

  // 画像URLが空の場合はデフォルトの画像を使用
  const imgSrc = imageurl || DEFAULT_IMAGE_URL;
  
  return (
    <div className="relative">
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
      
      {/* 管理者用編集ボタン */}
      {!isLoading && isAdminUser && (
        <div className="absolute top-2 right-2">
          <Link href={`/jobs/${id}`}>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white border-2 rounded-md transition-all duration-200 hover:shadow-md active:scale-95 active:shadow-sm"
              onClick={(e) => e.stopPropagation()}
            >
              📝
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
} 