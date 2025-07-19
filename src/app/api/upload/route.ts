import { NextRequest, NextResponse } from 'next/server';

// Edge Runtime設定
export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    // Edge Runtimeでは制限的なファイル処理
    return NextResponse.json(
      { 
        error: '画像アップロード機能は準備中です',
        message: 'Edge Runtime環境での制限により、一時的に無効化されています'
      },
      { status: 501 }
    );

  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      { 
        error: 'サーバーエラーが発生しました',
        details: error instanceof Error ? error.message : '不明なエラー'
      },
      { status: 500 }
    );
  }
} 