import { supabase } from './supabaseClient';

// 管理者用の応募データ型定義
export interface AdminJobApplication {
  id: string;
  user_id: string;
  job_id: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  cover_letter?: string;
  resume_url?: string;
  applicant_email?: string;
  applied_at: string;
  updated_at: string;
  // ユーザー情報
  user_email: string;
  user_profile?: {
    display_name?: string;
    full_name?: string;
    location?: string;
    organization?: string;
  };
  // 求人情報
  job: {
    id: string;
    title: string;
    summary: string;
    tags: string[];
    imageurl: string;
  };
}

export interface ApplicationStats {
  total: number;
  pending: number;
  reviewed: number;
  accepted: number;
  rejected: number;
  thisWeek: number;
  thisMonth: number;
}

// ===== 管理者用応募管理機能 =====

// 全ての応募データを取得（管理者のみ）
export async function getAllApplicationsForAdmin(): Promise<AdminJobApplication[]> {
  try {
    const { data, error } = await supabase
      .from('job_applications')
      .select(`
        *,
        jobs!inner (
          id,
          title,
          summary,
          tags,
          imageurl
        ),
        user_profiles (
          display_name,
          full_name,
          location,
          organization
        )
      `)
      .order('applied_at', { ascending: false });

    if (error) {
      console.error('応募データ取得エラー:', error);
      return [];
    }

    // データを変換してメールアドレスを設定
    const applicationsWithUserInfo = (data || []).map((app) => {
      // applicant_emailが利用可能な場合はそれを使用
      let userEmail = app.applicant_email || 'メールアドレス未取得';
      
      // 古いデータでメールアドレスがない場合のメッセージ
      if (!app.applicant_email) {
        userEmail = '※データベース更新が必要';
      }

      return {
        ...app,
        user_email: userEmail,
        user_profile: app.user_profiles || undefined,
        job: app.jobs
      };
    });

    return applicationsWithUserInfo;
  } catch (error) {
    console.error('応募データ処理エラー:', error);
    return [];
  }
}

// 応募ステータスを更新（管理者のみ）
export async function updateApplicationStatus(
  applicationId: string, 
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected'
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('job_applications')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', applicationId);

    if (error) {
      console.error('ステータス更新エラー:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('ステータス更新処理エラー:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '不明なエラー' 
    };
  }
}

// 応募統計情報を取得（管理者のみ）
export async function getApplicationStats(): Promise<ApplicationStats> {
  try {
    // 全体統計
    const { data: allApplications, error: allError } = await supabase
      .from('job_applications')
      .select('status, applied_at');

    if (allError) {
      console.error('統計データ取得エラー:', allError);
      return {
        total: 0,
        pending: 0,
        reviewed: 0,
        accepted: 0,
        rejected: 0,
        thisWeek: 0,
        thisMonth: 0
      };
    }

    const applications = allApplications || [];
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const stats: ApplicationStats = {
      total: applications.length,
      pending: applications.filter(app => app.status === 'pending').length,
      reviewed: applications.filter(app => app.status === 'reviewed').length,
      accepted: applications.filter(app => app.status === 'accepted').length,
      rejected: applications.filter(app => app.status === 'rejected').length,
      thisWeek: applications.filter(app => new Date(app.applied_at) >= oneWeekAgo).length,
      thisMonth: applications.filter(app => new Date(app.applied_at) >= oneMonthAgo).length,
    };

    return stats;
  } catch (error) {
    console.error('統計情報処理エラー:', error);
    return {
      total: 0,
      pending: 0,
      reviewed: 0,
      accepted: 0,
      rejected: 0,
      thisWeek: 0,
      thisMonth: 0
    };
  }
}

// 特定の求人への応募一覧を取得（管理者のみ）
export async function getApplicationsByJobId(jobId: string): Promise<AdminJobApplication[]> {
  try {
    const { data, error } = await supabase
      .from('job_applications')
      .select(`
        *,
        jobs!inner (
          id,
          title,
          summary,
          tags,
          imageurl
        ),
        user_profiles (
          display_name,
          full_name,
          location,
          organization
        )
      `)
      .eq('job_id', jobId)
      .order('applied_at', { ascending: false });

    if (error) {
      console.error('求人別応募データ取得エラー:', error);
      return [];
    }

    // データを変換してメールアドレスを設定
    const applicationsWithUserInfo = (data || []).map((app) => {
      // applicant_emailが利用可能な場合はそれを使用
      let userEmail = app.applicant_email || 'メールアドレス未取得';
      
      // 古いデータでメールアドレスがない場合のメッセージ
      if (!app.applicant_email) {
        userEmail = '※データベース更新が必要';
      }

      return {
        ...app,
        user_email: userEmail,
        user_profile: app.user_profiles || undefined,
        job: app.jobs
      };
    });

    return applicationsWithUserInfo;
  } catch (error) {
    console.error('求人別応募データ処理エラー:', error);
    return [];
  }
}

// 応募者の詳細情報を取得（管理者のみ）
export async function getApplicantDetails(userId: string): Promise<{
  user: any;
  profile: any;
  applications: AdminJobApplication[];
} | null> {
  try {
    // ユーザー基本情報
    const { data: userData } = await supabase.auth.admin.getUserById(userId);
    
    // プロフィール情報
    const { data: profileData } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    // 応募履歴
    const { data: applicationsData } = await supabase
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

    const applications = (applicationsData || []).map(app => ({
      ...app,
      user_email: userData?.user?.email || '不明',
      user_profile: profileData || undefined,
      job: app.jobs
    }));

    return {
      user: userData?.user || null,
      profile: profileData || null,
      applications
    };
  } catch (error) {
    console.error('応募者詳細取得エラー:', error);
    return null;
  }
}

// 応募データを削除（管理者のみ）
export async function deleteApplication(applicationId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('job_applications')
      .delete()
      .eq('id', applicationId);

    if (error) {
      console.error('応募データ削除エラー:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('応募データ削除処理エラー:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '不明なエラー' 
    };
  }
} 