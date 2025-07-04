import { supabase } from './supabaseClient';
import { checkAuthStatus } from './authCheck';

export interface UploadResult {
  success: boolean;
  imageUrl?: string;
  fileName?: string;
  error?: string;
}

export async function uploadImage(file: File): Promise<UploadResult> {
  try {
    console.log('🔄 アップロード開始:', { fileName: file.name, size: file.size, type: file.type });
    
    // 新しい認証チェック機能を使用
    const authResult = await checkAuthStatus();
    
    console.log('🔐 認証チェック結果:', {
      isAuthenticated: authResult.isAuthenticated,
      isAdmin: authResult.isAdmin,
      debugInfo: authResult.debugInfo,
      error: authResult.error
    });
    
    if (!authResult.isAuthenticated) {
      console.error('❌ 認証エラー:', authResult.error);
      return {
        success: false,
        error: authResult.error || 'ログインが必要です。再度ログインしてください。'
      };
    }
    
    if (!authResult.isAdmin) {
      console.error('❌ 権限エラー: 管理者権限が必要です');
      return {
        success: false,
        error: '管理者権限が必要です。管理者アカウントでログインしてください。'
      };
    }
    
    if (!authResult.session?.access_token) {
      console.error('❌ アクセストークンが見つかりません');
      return {
        success: false,
        error: 'アクセストークンが取得できません。再度ログインしてください。'
      };
    }

    const formData = new FormData();
    formData.append('file', file);

    console.log('📤 API呼び出し開始:', {
      endpoint: '/api/upload',
      hasAuthHeader: true,
      tokenLength: authResult.session.access_token.length,
      userEmail: authResult.user?.email
    });

    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authResult.session.access_token}`
      },
      body: formData,
    });

    const result = await response.json();
    
    console.log('📥 API応答:', {
      status: response.status,
      ok: response.ok,
      result
    });

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
    console.error('❌ Upload error:', error);
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