'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  onImageUrl: (url: string) => void;
  currentImageUrl?: string;
  uploading?: boolean;
}

export default function ImageUpload({ 
  onImageSelect, 
  onImageUrl, 
  currentImageUrl, 
  uploading = false 
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [imageUrl, setImageUrl] = useState(currentImageUrl || '');
  const [useUrl, setUseUrl] = useState(!!currentImageUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onImageSelect(file);
        setUseUrl(false);
      }
    }
  }, [onImageSelect]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        onImageSelect(file);
        setUseUrl(false);
      }
    }
  };

  const handleUrlSubmit = () => {
    if (imageUrl.trim()) {
      onImageUrl(imageUrl.trim());
      setUseUrl(true);
    }
  };

  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* モード切り替え */}
      <div className="flex gap-4">
        <Button
          type="button"
          variant={!useUrl ? "default" : "outline"}
          onClick={() => setUseUrl(false)}
          className="flex-1"
        >
          📁 ファイルアップロード
        </Button>
        <Button
          type="button"
          variant={useUrl ? "default" : "outline"}
          onClick={() => setUseUrl(true)}
          className="flex-1"
        >
          🔗 URL指定
        </Button>
      </div>

      {!useUrl ? (
        /* ファイルアップロードモード */
        <div className="space-y-4">
          <div
            className={`
              border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
              ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
              ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400'}
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={openFileSelector}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              disabled={uploading}
            />
            
            {uploading ? (
              <div className="text-blue-600">
                <svg className="mx-auto h-12 w-12 mb-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <p className="text-sm">アップロード中...</p>
              </div>
            ) : (
              <div className="text-gray-600">
                <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                <p className="text-sm">
                  <span className="font-medium">クリックして画像を選択</span>
                  <br />
                  またはドラッグ&ドロップ
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  JPEG, PNG, GIF, WebP (最大10MB)
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* URL指定モード */
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              画像URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <Button
                type="button"
                onClick={handleUrlSubmit}
                disabled={!imageUrl.trim()}
              >
                設定
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Unsplash、Pixabay、Pexelsなどの無料画像サイトのURLを使用できます
            </p>
          </div>
        </div>
      )}

      {/* プレビュー */}
      {(currentImageUrl || imageUrl) && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            プレビュー
          </label>
          <div className="relative w-full h-48 rounded-lg overflow-hidden border">
            <Image
              src={currentImageUrl || imageUrl}
              alt="プレビュー"
              fill
              className="object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
} 