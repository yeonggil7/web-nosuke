// ストレージ戦略の管理
export type StorageProvider = 'supabase' | 'cloudflare-r2' | 'external-url';

export interface StorageConfig {
  provider: StorageProvider;
  maxFileSize: number; // MB
  allowedTypes: readonly string[];
  compressionEnabled: boolean;
}

// 段階的なストレージ戦略
export const STORAGE_STRATEGIES = {
  // Phase 1: 外部URL参照のみ（ストレージ使用量ゼロ）
  EXTERNAL_ONLY: {
    provider: 'external-url' as StorageProvider,
    maxFileSize: 0,
    allowedTypes: [],
    compressionEnabled: false,
  },
  
  // Phase 2: 小さなファイルのみ（プロフィール画像）
  MINIMAL: {
    provider: 'supabase' as StorageProvider,
    maxFileSize: 0.5, // 500KB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    compressionEnabled: true,
  },
  
  // Phase 3: 制限付きファイルアップロード
  LIMITED: {
    provider: 'supabase' as StorageProvider,
    maxFileSize: 2, // 2MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    compressionEnabled: true,
  },
  
  // Phase 4: フルファイルサポート（有料プラン）
  FULL: {
    provider: 'cloudflare-r2' as StorageProvider,
    maxFileSize: 10, // 10MB
    allowedTypes: ['*'],
    compressionEnabled: true,
  },
} as const;

// 現在のストレージ戦略を取得
export function getCurrentStorageStrategy(): StorageConfig {
  const userCount = parseInt(process.env.NEXT_PUBLIC_USER_COUNT || '0');
  const isPaidPlan = process.env.NEXT_PUBLIC_PAID_PLAN === 'true';
  
  if (isPaidPlan) {
    return STORAGE_STRATEGIES.FULL;
  } else if (userCount > 200) {
    return STORAGE_STRATEGIES.EXTERNAL_ONLY;
  } else if (userCount > 100) {
    return STORAGE_STRATEGIES.MINIMAL;
  } else {
    return STORAGE_STRATEGIES.LIMITED;
  }
}

// ファイルアップロード前の検証
export function validateFileUpload(file: File): { valid: boolean; error?: string } {
  const strategy = getCurrentStorageStrategy();
  
  if (strategy.provider === 'external-url') {
    return { valid: false, error: 'ファイルアップロードは現在利用できません。外部URLを使用してください。' };
  }
  
  // ファイルサイズチェック
  const fileSizeMB = file.size / (1024 * 1024);
  if (fileSizeMB > strategy.maxFileSize) {
    return { valid: false, error: `ファイルサイズは${strategy.maxFileSize}MB以下にしてください。` };
  }
  
  // ファイルタイプチェック
  if (!strategy.allowedTypes.includes('*') && !strategy.allowedTypes.includes(file.type)) {
    return { valid: false, error: '許可されていないファイル形式です。' };
  }
  
  return { valid: true };
}

// 画像圧縮（クライアントサイド）
export async function compressImage(file: File, maxWidth: number = 800): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    
    img.onload = () => {
      // アスペクト比を保持してリサイズ
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        const compressedFile = new File([blob!], file.name, {
          type: 'image/jpeg',
          lastModified: Date.now(),
        });
        resolve(compressedFile);
      }, 'image/jpeg', 0.8);
    };
    
    img.src = URL.createObjectURL(file);
  });
} 