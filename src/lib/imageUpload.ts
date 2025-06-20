import { supabase } from './supabaseClient';

export interface UploadResult {
  success: boolean;
  imageUrl?: string;
  fileName?: string;
  error?: string;
}

export async function uploadImage(file: File): Promise<UploadResult> {
  try {
    // 現在のユーザーのアクセストークンを取得
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.access_token) {
      return {
        success: false,
        error: 'ログインが必要です。再度ログインしてください。'
      };
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      },
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'アップロードに失敗しました'
      };
    }

    return {
      success: true,
      imageUrl: result.imageUrl,
      fileName: result.fileName
    };

  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: 'ネットワークエラーが発生しました'
    };
  }
}

export async function deleteImage(fileName: string): Promise<{ success: boolean; error?: string }> {
  try {
    // 現在のユーザーのアクセストークンを取得
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.access_token) {
      return {
        success: false,
        error: 'ログインが必要です。再度ログインしてください。'
      };
    }

    const response = await fetch(`/api/upload?fileName=${encodeURIComponent(fileName)}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      },
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || '削除に失敗しました'
      };
    }

    return { success: true };

  } catch (error) {
    console.error('Delete error:', error);
    return {
      success: false,
      error: 'ネットワークエラーが発生しました'
    };
  }
}

// 画像URLからファイル名を抽出する関数
export function extractFileNameFromUrl(imageUrl: string): string | null {
  try {
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
    // Supabase Storageの場合、最後の部分がファイル名
    const fileName = pathParts[pathParts.length - 1];
    if (fileName && fileName.includes('job-images/')) {
      return fileName;
    }
    // パス全体を確認（job-images/xxx-xxx.ext形式）
    const fullPath = url.pathname.split('/storage/v1/object/public/job-images/')[1];
    return fullPath ? `job-images/${fullPath}` : null;
  } catch {
    return null;
  }
} 