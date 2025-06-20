import { supabase } from './supabaseClient';
import { UserProfile, UserFavorite, JobApplication, UserSettings, UserActivity } from '@/schema/userSchema';

// ===== ユーザープロフィール管理 =====

// プロフィール取得
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    console.log('🔍 プロフィール取得開始:', { userId });
    
    // 現在の認証状況を確認
    const { data: authData, error: authError } = await supabase.auth.getUser();
    console.log('🔐 認証状況:', { 
      authData: authData?.user?.id, 
      authError: authError?.message,
      requestedUserId: userId 
    });

    // まず、テーブルの存在確認を試みる
    console.log('📋 user_profilesテーブルの存在確認中...');
    const { data: testData, error: testError } = await supabase
      .from('user_profiles')
      .select('count', { count: 'exact', head: true });
    
    console.log('📊 テーブル存在確認結果:', { testData, testError });

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    console.log('📊 クエリ結果:', { 
      data, 
      error: error ? {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        full: error
      } : null 
    });
    
    if (error) {
      console.error('プロフィール取得エラー:', error);
      console.error('エラー詳細:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        fullError: JSON.stringify(error, null, 2)
      });
      
      // テーブルが存在しない場合の特別な処理
      if (error.code === 'PGRST116' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
        console.warn('⚠️ user_profilesテーブルが存在しません。データベーススキーマを実行してください。');
        return null;
      }
      
      // データが見つからない場合（正常なケース）
      if (error.code === 'PGRST116' || error.message?.includes('No rows found')) {
        console.info('ℹ️ ユーザープロフィールが見つかりません（新規ユーザー）');
        return null;
      }
      
      return null;
    }

    console.log('✅ プロフィール取得成功:', data);
    return data as UserProfile;
  } catch (err) {
    console.error('💥 プロフィール取得で予期しないエラー:', err);
    console.error('💥 エラー詳細:', {
      name: err instanceof Error ? err.name : 'Unknown',
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : 'No stack available'
    });
    return null;
  }
}

// プロフィール作成・更新
export async function upsertUserProfile(profile: Partial<UserProfile>): Promise<{ data: UserProfile | null; error: any }> {
  try {
    console.log('🔄 プロフィール保存開始:', {
      user_id: profile.user_id,
      display_name: profile.display_name,
      full_name: profile.full_name,
      organization: profile.organization,
      skills: profile.skills?.length || 0,
      preferred_areas: profile.preferred_areas?.length || 0,
      interested_fields: profile.interested_fields?.length || 0
    });

    // 現在の認証状況を確認
    const { data: authData, error: authError } = await supabase.auth.getUser();
    console.log('🔐 認証状況確認:', {
      hasUser: !!authData?.user,
      userId: authData?.user?.id,
      profileUserId: profile.user_id,
      authError: authError?.message
    });

    if (authError) {
      console.error('❌ 認証エラー:', authError);
      return { data: null, error: authError };
    }

    if (!authData?.user) {
      const noUserError = { message: '認証されていません', code: 'UNAUTHENTICATED' };
      console.error('❌ 未認証:', noUserError);
      return { data: null, error: noUserError };
    }

    // テーブルの存在確認
    console.log('📋 user_profilesテーブルの存在確認中...');
    const { error: tableError } = await supabase
      .from('user_profiles')
      .select('count', { count: 'exact', head: true });
    
    if (tableError) {
      console.error('❌ テーブル存在確認エラー:', tableError);
      return { data: null, error: tableError };
    }

    // まず既存のプロフィールがあるかチェック
    console.log('🔍 既存プロフィール確認中...');
    const { data: existingProfile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('id, user_id')
      .eq('user_id', profile.user_id)
      .single();

    console.log('📊 既存プロフィール確認結果:', {
      exists: !!existingProfile,
      profileId: existingProfile?.id,
      fetchError: fetchError?.code
    });

    let data, error;

    if (existingProfile) {
      // 既存プロフィールがある場合は更新
      console.log('🔄 既存プロフィールを更新中...');
      const updateResult = await supabase
        .from('user_profiles')
        .update({
          ...profile,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', profile.user_id)
        .select()
        .single();
      
      data = updateResult.data;
      error = updateResult.error;
    } else {
      // 新規プロフィールを作成
      console.log('📝 新規プロフィールを作成中...');
      const insertResult = await supabase
        .from('user_profiles')
        .insert({
          ...profile,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      data = insertResult.data;
      error = insertResult.error;
    }
    
    if (error) {
      console.error('❌ プロフィール保存エラー:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        fullError: JSON.stringify(error, null, 2)
      });
      return { data: null, error };
    }

    console.log('✅ プロフィール保存成功:', {
      id: data?.id,
      user_id: data?.user_id,
      display_name: data?.display_name
    });

    return { data, error: null };
  } catch (err) {
    console.error('💥 プロフィール保存で予期しないエラー:', err);
    const unexpectedError = {
      message: err instanceof Error ? err.message : String(err),
      code: 'UNEXPECTED_ERROR',
      originalError: err
    };
    return { data: null, error: unexpectedError };
  }
}

// ===== お気に入り求人管理 =====

// お気に入り求人一覧取得
export async function getUserFavorites(userId: string): Promise<UserFavorite[]> {
  const { data, error } = await supabase
    .from('user_favorites')
    .select(`
      *,
      jobs (
        id,
        title,
        summary,
        tags,
        imageurl
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('お気に入り取得エラー:', error);
    return [];
  }
  
  return data || [];
}

// お気に入り追加
export async function addToFavorites(userId: string, jobId: string): Promise<{ error: any }> {
  const { error } = await supabase
    .from('user_favorites')
    .insert({
      user_id: userId,
      job_id: jobId
    });
  
  return { error };
}

// お気に入り削除
export async function removeFromFavorites(userId: string, jobId: string): Promise<{ error: any }> {
  const { error } = await supabase
    .from('user_favorites')
    .delete()
    .eq('user_id', userId)
    .eq('job_id', jobId);
  
  return { error };
}

// お気に入りチェック
export async function isJobFavorited(userId: string, jobId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('user_favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('job_id', jobId)
    .single();
  
  if (error) return false;
  return !!data;
}

// ===== 求人応募管理 =====

// 応募履歴取得
export async function getUserApplications(userId: string): Promise<JobApplication[]> {
  const { data, error } = await supabase
    .from('job_applications')
    .select(`
      *,
      jobs (
        id,
        title,
        summary,
        tags,
        imageurl
      )
    `)
    .eq('user_id', userId)
    .order('applied_at', { ascending: false });
  
  if (error) {
    console.error('応募履歴取得エラー:', error);
    return [];
  }
  
  return data || [];
}

// 求人応募
export async function applyToJob(application: Omit<JobApplication, 'id' | 'applied_at' | 'updated_at'>): Promise<{ data: JobApplication | null; error: any }> {
  try {
    // 現在のユーザーの情報を取得
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { data: null, error: { message: 'ユーザーが認証されていません', code: 'AUTH_ERROR' } };
    }

    const { data, error } = await supabase
      .from('job_applications')
      .insert({
        ...application,
        applicant_email: user.email,
        applied_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    return { data, error };
  } catch (err) {
    console.error('応募処理エラー:', err);
    return { 
      data: null, 
      error: { 
        message: err instanceof Error ? err.message : '不明なエラー',
        code: 'APPLICATION_ERROR' 
      } 
    };
  }
}

// ===== ユーザー設定管理 =====

// 設定取得
export async function getUserSettings(userId: string): Promise<UserSettings | null> {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error) {
    console.error('設定取得エラー:', error);
    return null;
  }
  
  return data;
}

// 設定更新
export async function updateUserSettings(settings: Partial<UserSettings>): Promise<{ data: UserSettings | null; error: any }> {
  const { data, error } = await supabase
    .from('user_settings')
    .upsert({
      ...settings,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();
  
  return { data, error };
}

// ===== アクティビティログ =====

// アクティビティ記録
export async function logUserActivity(activity: Omit<UserActivity, 'id' | 'created_at'>): Promise<{ error: any }> {
  const { error } = await supabase
    .from('user_activities')
    .insert({
      ...activity,
      created_at: new Date().toISOString()
    });
  
  return { error };
}

// アクティビティ履歴取得
export async function getUserActivities(userId: string, limit: number = 50): Promise<UserActivity[]> {
  const { data, error } = await supabase
    .from('user_activities')
    .select(`
      *,
      jobs (
        id,
        title
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error('アクティビティ取得エラー:', error);
    return [];
  }
  
  return data || [];
}

// ===== 統計情報 =====

// ユーザー統計取得
export async function getUserStats(userId: string) {
  const [favorites, applications, activities] = await Promise.all([
    getUserFavorites(userId),
    getUserApplications(userId),
    getUserActivities(userId, 100)
  ]);
  
  return {
    favoriteCount: favorites.length,
    applicationCount: applications.length,
    recentActivityCount: activities.length,
    lastActivity: activities[0]?.created_at || null
  };
} 