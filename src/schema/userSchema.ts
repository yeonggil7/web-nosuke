// ユーザープロフィール情報
export interface UserProfile {
  id: string;
  user_id: string; // Supabase Auth User ID
  
  // 基本情報
  display_name?: string;
  full_name?: string; // 氏名（フルネーム）
  full_name_kana?: string; // フリガナ
  bio?: string;
  avatar_url?: string;
  location?: string;
  website?: string;
  organization?: string; // 所属（学校名または会社名）
  
  // 職歴・スキル情報
  skills?: string[];
  experience_years?: number;
  
  // 活動希望エリア（複数選択可）
  preferred_areas?: string[];
  
  // 興味のある分野（複数選択可）
  interested_fields?: string[];
  
  // 自己PR
  self_promotion?: string;
  
  created_at: string;
  updated_at: string;
}

// お気に入り求人
export interface UserFavorite {
  id: string;
  user_id: string;
  job_id: string;
  created_at: string;
}

// 求人応募履歴
export interface JobApplication {
  id: string;
  user_id: string;
  job_id: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  cover_letter?: string;
  resume_url?: string;
  applicant_email?: string; // 応募者のメールアドレス
  applied_at: string;
  updated_at: string;
}

// ユーザー設定
export interface UserSettings {
  id: string;
  user_id: string;
  email_notifications: boolean;
  job_alerts: boolean;
  preferred_job_types?: string[];
  preferred_locations?: string[];
  salary_range_min?: number;
  salary_range_max?: number;
  created_at: string;
  updated_at: string;
}

// ユーザーアクティビティログ
export interface UserActivity {
  id: string;
  user_id: string;
  activity_type: 'job_view' | 'job_favorite' | 'job_apply' | 'profile_update';
  job_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
} 