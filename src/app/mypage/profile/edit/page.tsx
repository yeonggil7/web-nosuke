'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getUserProfile, upsertUserProfile } from '@/lib/userDatabase';
import { UserProfile } from '@/schema/userSchema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';

// 都道府県リスト
const PREFECTURES = [
  '全国（どこでもOK）', 'オンライン', '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県', '静岡県', '愛知県',
  '三重県', '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県',
  '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県',
  '福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
];

// 興味のある分野（カテゴリ別）
const INTEREST_CATEGORIES = {
  social: {
    title: '🌱 社会・地域貢献系',
    fields: [
      '地方創生',
      '教育',
      'ボランティア',
      '福祉・子ども支援',
      '環境・SDGs'
    ]
  },
  business: {
    title: '💼 実務・スキル系',
    fields: [
      'スタートアップ',
      '起業・経営',
      'マーケティング・SNS運用',
      'デザイン',
      'プログラミング・開発',
      '動画制作・編集',
      'イベント企画',
      '営業・広報',
      '海外ビジネス'
    ]
  },
  personal: {
    title: '💡 志向・目的',
    fields: [
      '自己成長したい',
      '自分の適性を知りたい',
      '友達や仲間を作りたい',
      '留学・国際交流に興味がある'
    ]
  }
};

interface FormData {
  display_name: string;
  full_name: string;
  full_name_kana: string;
  bio: string;
  location: string;
  website: string;
  organization: string;
  skills: string[];
  experience_years: number | undefined;
  preferred_areas: string[];
  interested_fields: string[];
  self_promotion: string;
}

export default function ProfileEditPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    display_name: '',
    full_name: '',
    full_name_kana: '',
    bio: '',
    location: '',
    website: '',
    organization: '',
    skills: [],
    experience_years: undefined,
    preferred_areas: [],
    interested_fields: [],
    self_promotion: ''
  });
  const [skillsInput, setSkillsInput] = useState('');
  const [otherAreaInput, setOtherAreaInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const router = useRouter();

  useEffect(() => {
    async function loadUserAndProfile() {
      try {
        setError(null);
        
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          router.push('/login');
          return;
        }
        
        setUser(currentUser);
        
        // 既存プロフィールの取得を試行
        const existingProfile = await getUserProfile(currentUser.id);
        setProfile(existingProfile);
        
        if (existingProfile) {
          // 既存プロフィールがある場合はフォームに設定
          setFormData({
            display_name: existingProfile.display_name || '',
            full_name: existingProfile.full_name || '',
            full_name_kana: existingProfile.full_name_kana || '',
            bio: existingProfile.bio || '',
            location: existingProfile.location || '',
            website: existingProfile.website || '',
            organization: existingProfile.organization || '',
            skills: existingProfile.skills || [],
            experience_years: existingProfile.experience_years || undefined,
            preferred_areas: existingProfile.preferred_areas || [],
            interested_fields: existingProfile.interested_fields || [],
            self_promotion: existingProfile.self_promotion || ''
          });
          
          // スキルを文字列に変換
          setSkillsInput(existingProfile.skills?.join(', ') || '');
        }
        
      } catch (err) {
        console.error('ユーザー/プロフィール読み込みエラー:', err);
        setError('ユーザー情報の読み込みに失敗しました');
      } finally {
        setIsLoading(false);
      }
    }

    loadUserAndProfile();
  }, [router]);

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCheckboxChange = (field: 'preferred_areas' | 'interested_fields', value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('ユーザー情報が見つかりません');
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // その他エリアが入力されている場合は追加
      let finalPreferredAreas = [...formData.preferred_areas];
      if (otherAreaInput.trim()) {
        finalPreferredAreas.push(`その他: ${otherAreaInput.trim()}`);
      }

      const profileData = {
        user_id: user.id,
        ...formData,
        skills: skillsInput.split(',').map(item => item.trim()).filter(item => item.length > 0),
        preferred_areas: finalPreferredAreas,
      };

      console.log('🔄 プロフィール保存中:', profileData);

      const { data, error } = await upsertUserProfile(profileData);

      if (error) {
        console.error('プロフィール保存エラー:', error);
        console.error('エラー詳細:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          fullError: JSON.stringify(error, null, 2)
        });
        
        let errorMessage = 'プロフィールの保存に失敗しました';
        
        if (error.code === 'UNAUTHENTICATED') {
          errorMessage = '認証が切れています。再度ログインしてください。';
        } else if (error.code === '23505') {
          errorMessage = 'プロフィールの更新中にエラーが発生しました。ページを再読み込みして再試行してください。';
        } else if (error.message) {
          errorMessage += `: ${error.message}`;
        } else {
          errorMessage += `: ${JSON.stringify(error)}`;
        }
        
        setError(errorMessage);
        return;
      }

      console.log('✅ プロフィール保存成功:', data);
      setSuccess('プロフィールが正常に保存されました！');
      
      // 2秒後にマイページにリダイレクト
      setTimeout(() => {
        router.push('/mypage');
      }, 2000);

    } catch (err) {
      console.error('予期しないエラー:', err);
      console.error('エラー詳細:', {
        name: err instanceof Error ? err.name : 'Unknown',
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : 'No stack available'
      });
      setError('予期しないエラーが発生しました: ' + (err instanceof Error ? err.message : 'unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="text-xl mb-4">読み込み中...</div>
            <div className="text-sm text-gray-500">プロフィール情報を確認しています</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Link href="/mypage" className="mr-4">
            <Button variant="outline">← 戻る</Button>
          </Link>
          <h1 className="text-3xl font-bold">
            {profile ? 'プロフィール編集' : 'プロフィール作成'}
          </h1>
        </div>

        {/* エラー・成功メッセージ */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
          {/* ① メールアドレス（表示のみ） */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">① アカウント情報</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス
              </label>
              <Input
                type="email"
                value={user?.email || ''}
                disabled
                className="bg-gray-100"
              />
              <p className="text-xs text-gray-500 mt-1">メールアドレスは変更できません</p>
            </div>
          </div>

          {/* ③ 氏名（フルネーム）＋ フリガナ */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">③ 氏名・基本情報</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  表示名 *
                </label>
                <Input
                  type="text"
                  value={formData.display_name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('display_name', e.target.value)}
                  placeholder="例: 山田太郎"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  氏名（フルネーム） *
                </label>
                <Input
                  type="text"
                  value={formData.full_name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('full_name', e.target.value)}
                  placeholder="例: 山田 太郎"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  フリガナ *
                </label>
                <Input
                  type="text"
                  value={formData.full_name_kana}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('full_name_kana', e.target.value)}
                  placeholder="例: ヤマダ タロウ"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ウェブサイト
                </label>
                <Input
                  type="url"
                  value={formData.website}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('website', e.target.value)}
                  placeholder="例: https://example.com"
                />
              </div>
            </div>
          </div>

          {/* ④ 所属（学校名 または 会社名） */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">④ 所属</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                所属（学校名または会社名） *
              </label>
              <Input
                type="text"
                value={formData.organization}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('organization', e.target.value)}
                placeholder="例: 〇〇大学、株式会社〇〇"
                required
              />
              <p className="text-xs text-gray-500 mt-1">在籍先の把握（学生・社会人どちらも対応）</p>
            </div>
          </div>

          {/* ⑤ 自己PR（自由記述） */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">⑤ 自己PR</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                自己PR（自由記述）
              </label>
              <textarea
                value={formData.self_promotion}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('self_promotion', e.target.value)}
                placeholder="あなたの強みやアピールポイント、これまでの経験などを自由に記入してください..."
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* スキル・経験（追加情報） */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">スキル・経験（任意）</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  スキル・資格
                </label>
                <Input
                  type="text"
                  value={skillsInput}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSkillsInput(e.target.value)}
                  placeholder="例: JavaScript, TOEIC800点, 簿記2級"
                />
                <p className="text-xs text-gray-500 mt-1">カンマ区切りで入力してください</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  経験年数
                </label>
                <Input
                  type="number"
                  value={formData.experience_years !== undefined ? formData.experience_years.toString() : ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('experience_years', e.target.value ? parseInt(e.target.value) : 0)}
                  placeholder="例: 3"
                />
              </div>
            </div>
          </div>

          {/* ⑥ 活動希望エリア（複数選択可） */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">⑥ 活動希望エリア（複数選択可）</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {PREFECTURES.map((prefecture) => (
                <label key={prefecture} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.preferred_areas.includes(prefecture)}
                    onChange={(e) => handleCheckboxChange('preferred_areas', prefecture, e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">{prefecture}</span>
                </label>
              ))}
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                その他（自由入力）
              </label>
              <Input
                type="text"
                value={otherAreaInput}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOtherAreaInput(e.target.value)}
                placeholder="例: 関東圏、近畿圏など"
              />
            </div>
          </div>

          {/* ⑦ 興味のある分野（複数選択可） */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">⑦ 興味のある分野（複数選択可）</h2>
            {Object.entries(INTEREST_CATEGORIES).map(([key, category]) => (
              <div key={key} className="mb-6">
                <h3 className="text-lg font-medium mb-3">{category.title}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {category.fields.map((field) => (
                    <label key={field} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.interested_fields.includes(field)}
                        onChange={(e) => handleCheckboxChange('interested_fields', field, e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm">{field}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* 保存ボタン */}
          <div className="flex justify-end space-x-4">
            <Link href="/mypage">
              <Button 
                variant="outline" 
                type="button"
                className="border-2 rounded-md transition-all duration-200 hover:shadow-md active:scale-95 active:shadow-sm"
              >
                キャンセル
              </Button>
            </Link>
            <Button 
              type="submit" 
              disabled={isSaving}
              className="border-2 border-blue-600 rounded-md bg-blue-600 hover:bg-blue-700 transition-all duration-200 hover:shadow-md active:scale-95 active:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? '保存中...' : (profile ? '更新' : '作成')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 