import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// 管理者メールアドレス一覧
const ADMIN_EMAILS = [
  'admin@example.com',
  'shinjirutaro@gmail.com',
  'testuser001@gmail.com'
];

export async function POST(request: NextRequest) {
  try {
    console.log('📁 アップロードAPIが呼び出されました');
    
    // Supabaseクライアント作成
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );
    
    // 認証ヘッダーの確認
    const authHeader = request.headers.get('Authorization');
    console.log('🔑 認証ヘッダー:', {
      hasHeader: !!authHeader,
      headerType: authHeader?.startsWith('Bearer ') ? 'Bearer' : 'Other',
      tokenLength: authHeader?.replace('Bearer ', '').length
    });

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('❌ 認証ヘッダーが不正です');
      return NextResponse.json(
        { error: '認証ヘッダーが必要です' },
        { status: 401 }
      );
    }

    // アクセストークンを取得
    const accessToken = authHeader.replace('Bearer ', '');
    
    // セッション確認（トークンを使用）
    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);
    
    console.log('👤 ユーザー認証結果:', {
      hasUser: !!user,
      userEmail: user?.email,
      userId: user?.id,
      userError: userError?.message
    });

    if (userError) {
      console.error('❌ ユーザー認証エラー:', userError);
      return NextResponse.json(
        { error: `認証エラー: ${userError.message}` },
        { status: 401 }
      );
    }

    if (!user) {
      console.error('❌ ユーザーが見つかりません');
      return NextResponse.json(
        { error: 'ユーザーが見つかりません。再度ログインしてください。' },
        { status: 401 }
      );
    }

    // 管理者権限チェック
    const isAdmin = ADMIN_EMAILS.includes(user.email || '');
    console.log('🔐 管理者権限チェック:', {
      userEmail: user.email,
      isAdmin,
      adminEmails: ADMIN_EMAILS
    });

    if (!isAdmin) {
      console.error('❌ 管理者権限がありません');
      return NextResponse.json(
        { error: '管理者権限が必要です' },
        { status: 403 }
      );
    }

    // ストレージバケット確認
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    console.log('📦 バケット確認:', {
      bucketsCount: buckets?.length || 0,
      bucketNames: buckets?.map((b: any) => b.name) || [],
      bucketError: bucketError?.message
    });

    if (bucketError) {
      console.error('❌ バケット確認エラー:', bucketError);
      return NextResponse.json(
        { 
          error: 'ストレージ設定エラー',
          details: bucketError.message,
          solution: 'Supabaseダッシュボードでjob-imagesバケットを作成してください'
        },
        { status: 500 }
      );
    }

    const hasJobImagesbucket = buckets?.some((b: any) => b.name === 'job-images');
    if (!hasJobImagesbucket) {
      console.error('❌ job-imagesバケットが存在しません');
      return NextResponse.json(
        { 
          error: 'job-imagesバケットが存在しません',
          solution: 'Supabaseダッシュボードでjob-imagesバケットを作成してください'
        },
        { status: 500 }
      );
    }

    // フォームデータ取得
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      console.error('❌ ファイルが見つかりません');
      return NextResponse.json(
        { error: 'ファイルが見つかりません' },
        { status: 400 }
      );
    }

    console.log('📄 受信ファイル情報:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      hasFile: true
    });

    // ファイルサイズとタイプのチェック
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'ファイルサイズが大きすぎます（最大10MB）' },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'サポートされていないファイル形式です' },
        { status: 400 }
      );
    }

    // ファイル名生成
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const fileName = `${timestamp}-${randomString}.${fileExtension}`;

    console.log('📝 生成されたファイル名:', fileName);

    // ファイルをバッファに変換
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    console.log('🔄 Supabase Storageにアップロード開始...');
    console.log('📦 アップロード設定:', {
      bucket: 'job-images',
      fileName,
      contentType: file.type,
      bufferSize: buffer.length
    });

    // Supabase Storageにアップロード
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('job-images')
      .upload(fileName, buffer, {
        contentType: file.type,
      });

    console.log('📤 アップロード結果:', {
      uploadData,
      uploadError: uploadError ? {
        message: uploadError.message,
        cause: uploadError.cause
      } : null
    });

    if (uploadError) {
      console.error('❌ Supabase upload error:', {
        message: uploadError.message,
        cause: uploadError.cause
      });
      
      if (uploadError.message?.includes('row-level security policy')) {
        return NextResponse.json(
          { 
            error: 'ストレージのアクセス権限エラー',
            details: 'RLSポリシーの設定に問題があります',
            solution: 'docs/fix-storage-policies.sql を実行してください'
          },
          { status: 403 }
        );
      }
      
      return NextResponse.json(
        { 
          error: 'ファイルアップロードに失敗しました',
          details: uploadError.message 
        },
        { status: 500 }
      );
    }

    // パブリックURLを取得
    const { data: { publicUrl } } = supabase.storage
      .from('job-images')
      .getPublicUrl(fileName);

    console.log('✅ アップロード成功:', {
      fileName,
      publicUrl,
      uploadPath: uploadData?.path
    });

    return NextResponse.json({
      imageUrl: publicUrl,
      fileName: fileName,
      message: 'アップロード成功'
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