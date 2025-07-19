import { NextRequest, NextResponse } from 'next/server';

// Edge Runtime設定
export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, category, subject, message } = body;

    // バリデーション
    if (!name || !email || !category || !subject || !message) {
      return NextResponse.json(
        { error: '必須項目が入力されていません' },
        { status: 400 }
      );
    }

    // メールアドレスの形式チェック
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '正しいメールアドレスを入力してください' },
        { status: 400 }
      );
    }

    // 簡易レスポンス（Edge Runtimeでは限定的なSupabase操作）
    return NextResponse.json(
      { 
        success: true, 
        message: 'お問い合わせを受け付けました',
        data: { name, email, category, subject }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Contact API error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
} 