import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export async function POST(request: NextRequest) {
  console.log('📁 アップロードAPIが呼び出されました');
  
  try {
    // Authorizationヘッダーからアクセストークンを取得
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    console.log('🔑 認証ヘッダー確認:', {
      hasAuthHeader: !!authHeader,
      hasToken: !!token,
      tokenLength: token?.length || 0
    });

    if (!token) {
      console.log('❌ 認証エラー: アクセストークンが見つかりません');
      return NextResponse.json(
        { 
          error: 'ログインが必要です。管理者アカウントでログインしてください。',
          details: 'Authorization header missing'
        },
        { status: 401 }
      );
    }

    // Supabaseクライアントを作成し、トークンを設定
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // アクセストークンでセッションを設定
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    console.log('👤 認証状況:', {
      user: user ? { id: user.id, email: user.email } : undefined,
      authError: authError?.message || 'なし'
    });

    if (authError || !user) {
      console.log('❌ 認証エラー: 無効なトークンまたはユーザーが見つかりません');
      return NextResponse.json(
        { 
          error: 'ログインが必要です。管理者アカウントでログインしてください。',
          details: 'Invalid token or user not found',
          authError: authError?.message
        },
        { status: 401 }
      );
    }

    // 管理者権限チェック
    const ADMIN_EMAILS = [
      'admin@example.com',
      'shinjirutaro@gmail.com',
      'testuser001@gmail.com'
    ];

    if (!ADMIN_EMAILS.includes(user.email || '')) {
      console.log('❌ 権限エラー: 管理者権限が必要です');
      return NextResponse.json(
        { 
          error: '管理者権限が必要です。',
          details: 'Admin access required'
        },
        { status: 403 }
      );
    }

    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    console.log('📄 受信ファイル情報:', {
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      hasFile: !!file,
      userId: user.id,
      userEmail: user.email
    });

    if (!file) {
      console.log('❌ ファイルが選択されていません');
      return NextResponse.json(
        { error: 'ファイルが選択されていません' },
        { status: 400 }
      );
    }

    // ファイルサイズチェック
    if (file.size > MAX_FILE_SIZE) {
      console.log('❌ ファイルサイズエラー:', file.size, 'bytes > ', MAX_FILE_SIZE, 'bytes');
      return NextResponse.json(
        { error: 'ファイルサイズが大きすぎます（最大10MB）' },
        { status: 400 }
      );
    }

    // ファイルタイプチェック
    if (!ALLOWED_TYPES.includes(file.type)) {
      console.log('❌ ファイルタイプエラー:', file.type, '許可されているタイプ:', ALLOWED_TYPES);
      return NextResponse.json(
        { error: 'サポートされていないファイル形式です' },
        { status: 400 }
      );
    }

    // ファイル名を生成（タイムスタンプ + ランダム文字列）
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const fileName = `${timestamp}-${randomString}.${fileExtension}`;

    console.log('📝 生成されたファイル名:', fileName);

    // ファイルをArrayBufferに変換
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log('🔄 Supabase Storageにアップロード開始...');
    console.log('📦 アップロード設定:', {
      bucket: 'job-images',
      fileName,
      contentType: file.type,
      bufferSize: buffer.length
    });

    // Supabase Storageにアップロード（認証されたユーザーとして）
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('job-images')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      });

    console.log('📤 アップロード結果:', { uploadData, uploadError });

    if (uploadError) {
      console.error('❌ Supabase upload error:', uploadError);
      
      // バケットが存在しない場合の特別なエラーハンドリング
      if (uploadError.message?.includes('Bucket not found')) {
        return NextResponse.json(
          { 
            error: 'ストレージバケットが作成されていません。管理者にお問い合わせください。',
            details: 'job-images bucket not found',
            hint: 'Supabaseダッシュボードでストレージバケット「job-images」を作成してください。'
          },
          { status: 500 }
        );
      }

      // RLSポリシー違反の場合
      if (uploadError.message?.includes('row-level security policy')) {
        return NextResponse.json(
          { 
            error: 'ストレージのアクセス権限が設定されていません。管理者にお問い合わせください。',
            details: 'RLS policy violation',
            hint: 'job-imagesバケットに適切なRLSポリシーを設定してください。'
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { 
          error: 'ファイルのアップロードに失敗しました',
          details: uploadError.message,
          supabaseError: uploadError
        },
        { status: 500 }
      );
    }

    console.log('✅ アップロード成功:', uploadData);

    // 公開URLを取得
    const { data: publicUrlData } = supabase.storage
      .from('job-images')
      .getPublicUrl(fileName);

    console.log('🔗 公開URL生成:', publicUrlData);

    return NextResponse.json({
      success: true,
      imageUrl: publicUrlData.publicUrl,
      fileName: fileName
    });

  } catch (error) {
    console.error('❌ Upload API error:', error);
    return NextResponse.json(
      { 
        error: 'サーバーエラーが発生しました',
        details: error instanceof Error ? error.message : '不明なエラー'
      },
      { status: 500 }
    );
  }
}

// 画像削除用のDELETEエンドポイント
export async function DELETE(request: NextRequest) {
  try {
    // Authorizationヘッダーからアクセストークンを取得
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'ログインが必要です' },
        { status: 401 }
      );
    }

    // Supabaseクライアントを作成し、認証チェック
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'ログインが必要です' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('fileName');

    if (!fileName) {
      return NextResponse.json(
        { error: 'ファイル名が指定されていません' },
        { status: 400 }
      );
    }

    // Supabase Storageから削除
    const { error: deleteError } = await supabase.storage
      .from('job-images')
      .remove([fileName]);

    if (deleteError) {
      console.error('Supabase delete error:', deleteError);
      return NextResponse.json(
        { error: 'ファイルの削除に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '画像が削除されました'
    });

  } catch (error) {
    console.error('Delete API error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
} 