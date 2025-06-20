'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getUserProfile, upsertUserProfile, logUserActivity } from '@/lib/userDatabase';
import { UserProfile } from '@/schema/userSchema';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CheckboxGroup } from '@/components/ui/checkbox-group';
import { PREFERRED_AREAS, INTERESTED_FIELDS } from '@/lib/constants/userOptions';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

export default function ProfileEditPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    // 基本情報
    email: '',
    newPassword: '',
    confirmPassword: '',
    full_name: '',
    full_name_kana: '',
    organization: '',
    self_promotion: '',
    
    // 既存項目
    display_name: '',
    bio: '',
    avatar_url: '',
    location: '',
    website: '',
    skills: '',
    experience_years: '',
    
    // 新項目
    preferred_areas: [] as string[],
    interested_fields: [] as string[]
  });
  
  const [otherArea, setOtherArea] = useState('');
  
  useEffect(() => {
    async function loadData() {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          router.push('/login');
          return;
        }
        
        setUser(currentUser);
        
        // プロフィール情報を取得
        const userProfile = await getUserProfile(currentUser.id);
        if (userProfile) {
          setProfile(userProfile);
          setFormData({
            email: currentUser.email || '',
            newPassword: '',
            confirmPassword: '',
            full_name: userProfile.full_name || '',
            full_name_kana: userProfile.full_name_kana || '',
            organization: userProfile.organization || '',
            self_promotion: userProfile.self_promotion || '',
            display_name: userProfile.display_name || '',
            bio: userProfile.bio || '',
            avatar_url: userProfile.avatar_url || '',
            location: userProfile.location || '',
            website: userProfile.website || '',
            skills: userProfile.skills?.join(', ') || '',
            experience_years: userProfile.experience_years?.toString() || '',
            preferred_areas: userProfile.preferred_areas || [],
            interested_fields: userProfile.interested_fields || []
          });
          
          // その他エリアの値を抽出
          const otherAreaValue = userProfile.preferred_areas?.find(area => area.startsWith('その他：'));
          if (otherAreaValue) {
            setOtherArea(otherAreaValue.replace('その他：', ''));
          }
        } else {
          // 新規ユーザーの場合、メールアドレスのみ設定
          setFormData(prev => ({ ...prev, email: currentUser.email || '' }));
        }
      } catch (err) {
        console.error('データ読み込みエラー:', err);
        setError('データの読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [router]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const validatePassword = (password: string): boolean => {
    // 半角英数字8文字以上（記号含む推奨）
    return password.length >= 8 && /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/.test(password);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      // パスワード変更の場合はバリデーション
      if (formData.newPassword) {
        if (!validatePassword(formData.newPassword)) {
          throw new Error('パスワードは半角英数字8文字以上で入力してください（記号も使用可能）');
        }
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error('パスワードと確認用パスワードが一致しません');
        }
        
        // パスワード更新
        const { error: passwordError } = await supabase.auth.updateUser({
          password: formData.newPassword
        });
        if (passwordError) throw passwordError;
      }
      
      // メールアドレス変更
      if (formData.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: formData.email
        });
        if (emailError) throw emailError;
      }
      
      // スキルを配列に変換
      const skills = formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill);
      
      // プロフィール更新
      const { error } = await upsertUserProfile({
        user_id: user.id,
        full_name: formData.full_name,
        full_name_kana: formData.full_name_kana,
        organization: formData.organization,
        self_promotion: formData.self_promotion,
        display_name: formData.display_name,
        bio: formData.bio,
        avatar_url: formData.avatar_url,
        location: formData.location,
        website: formData.website,
        skills,
        experience_years: formData.experience_years ? parseInt(formData.experience_years) : undefined,
        preferred_areas: formData.preferred_areas,
        interested_fields: formData.interested_fields
      });
      
      if (error) throw error;
      
      // アクティビティを記録
      await logUserActivity({
        user_id: user.id,
        activity_type: 'profile_update',
        metadata: { updated_fields: Object.keys(formData) }
      });
      
      setSuccess('プロフィールを更新しました');
      
      // 3秒後にマイページに戻る
      setTimeout(() => {
        router.push('/mypage');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'プロフィールの更新に失敗しました');
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }
  
  if (!user) {
    return null;
  }
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">プロフィール設定</h1>
          <Link href="/mypage">
            <Button variant="outline">マイページに戻る</Button>
          </Link>
        </div>
        
        {error && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-500 mb-6">
            {error}
          </div>
        )}
        
        {success && (
          <div className="rounded-md bg-green-50 p-4 text-sm text-green-500 mb-6">
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* アカウント情報 */}
          <section>
            <h2 className="text-lg font-semibold mb-4">① アカウント情報</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  メールアドレス <span className="text-red-500">*</span>
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="sample@univ.jp"
                  required
                />
              </div>
            </div>
          </section>
          
          {/* パスワード変更 */}
          <section>
            <h2 className="text-lg font-semibold mb-4">② パスワード変更</h2>
            <p className="text-sm text-gray-600 mb-4">パスワードを変更する場合のみ入力してください</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium mb-1">
                  新しいパスワード
                </label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="半角英数字8文字以上（記号含む推奨）"
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
                  パスワード確認
                </label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="上記と同じパスワードを入力"
                />
              </div>
            </div>
          </section>
          
          {/* 基本情報 */}
          <section>
            <h2 className="text-lg font-semibold mb-4">③ 氏名・所属</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium mb-1">
                  氏名（フルネーム） <span className="text-red-500">*</span>
                </label>
                <Input
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="山田 太郎"
                  required
                />
              </div>
              <div>
                <label htmlFor="full_name_kana" className="block text-sm font-medium mb-1">
                  フリガナ <span className="text-red-500">*</span>
                </label>
                <Input
                  id="full_name_kana"
                  name="full_name_kana"
                  value={formData.full_name_kana}
                  onChange={handleChange}
                  placeholder="ヤマダ タロウ"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="organization" className="block text-sm font-medium mb-1">
                  所属（学校名 または 会社名） <span className="text-red-500">*</span>
                </label>
                <Input
                  id="organization"
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                  placeholder="○○大学 または ○○株式会社"
                  required
                />
              </div>
            </div>
          </section>
          
          {/* 自己PR */}
          <section>
            <h2 className="text-lg font-semibold mb-4">④ 自己PR</h2>
            <div>
              <label htmlFor="self_promotion" className="block text-sm font-medium mb-1">
                自己PR（自由記述）
              </label>
              <textarea
                id="self_promotion"
                name="self_promotion"
                value={formData.self_promotion}
                onChange={handleChange}
                rows={6}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="あなたの強みや経験、将来の目標などを自由に記述してください"
              ></textarea>
            </div>
          </section>
          
          {/* 活動希望エリア */}
          <section>
            <h2 className="text-lg font-semibold mb-4">⑤ 活動希望エリア（複数選択可）</h2>
            <CheckboxGroup
              options={PREFERRED_AREAS}
              value={formData.preferred_areas}
              onChange={(values) => setFormData(prev => ({ ...prev, preferred_areas: values }))}
              name="preferred_areas"
              showOther={true}
              otherValue={otherArea}
              onOtherChange={setOtherArea}
              className="max-h-60 overflow-y-auto border rounded-md p-4"
            />
          </section>
          
          {/* 興味のある分野 */}
          <section>
            <h2 className="text-lg font-semibold mb-4">⑥ 興味のある分野（複数選択可）</h2>
            <div className="space-y-6">
              {Object.entries(INTERESTED_FIELDS).map(([key, category]) => (
                <div key={key}>
                  <h3 className="text-md font-medium mb-3">{category.category}</h3>
                  <CheckboxGroup
                    options={category.options}
                    value={formData.interested_fields}
                    onChange={(values) => setFormData(prev => ({ ...prev, interested_fields: values }))}
                    name={`interested_fields_${key}`}
                    className="ml-4"
                  />
                </div>
              ))}
            </div>
          </section>
          
          {/* 追加情報（既存項目） */}
          <section>
            <h2 className="text-lg font-semibold mb-4">追加情報（任意）</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="display_name" className="block text-sm font-medium mb-1">
                  表示名
                </label>
                <Input
                  id="display_name"
                  name="display_name"
                  value={formData.display_name}
                  onChange={handleChange}
                  placeholder="ニックネーム等"
                />
              </div>
              <div>
                <label htmlFor="location" className="block text-sm font-medium mb-1">
                  現在地
                </label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="例：東京都渋谷区"
                />
              </div>
              <div>
                <label htmlFor="website" className="block text-sm font-medium mb-1">
                  ウェブサイト
                </label>
                <Input
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://example.com"
                  type="url"
                />
              </div>
              <div>
                <label htmlFor="experience_years" className="block text-sm font-medium mb-1">
                  経験年数
                </label>
                <Input
                  id="experience_years"
                  name="experience_years"
                  value={formData.experience_years}
                  onChange={handleChange}
                  placeholder="例：5"
                  type="number"
                  min="0"
                />
              </div>
            </div>
            
            <div className="mt-6">
              <label htmlFor="skills" className="block text-sm font-medium mb-1">
                スキル（カンマ区切り）
              </label>
              <Input
                id="skills"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                placeholder="例：JavaScript, React, TypeScript"
              />
            </div>
            
            <div className="mt-6">
              <label htmlFor="avatar_url" className="block text-sm font-medium mb-1">
                プロフィール画像URL
              </label>
              <Input
                id="avatar_url"
                name="avatar_url"
                value={formData.avatar_url}
                onChange={handleChange}
                placeholder="https://example.com/avatar.jpg"
              />
              {formData.avatar_url && (
                <div className="mt-2">
                  <img 
                    src={formData.avatar_url} 
                    alt="プレビュー" 
                    className="w-16 h-16 rounded-full object-cover border"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
            
            <div className="mt-6">
              <label htmlFor="bio" className="block text-sm font-medium mb-1">
                自己紹介
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="あなたの経歴や興味について書いてください"
              ></textarea>
            </div>
          </section>
          
          <div className="flex justify-end gap-4 pt-6 border-t">
            <Link href="/mypage">
              <Button type="button" variant="outline">
                キャンセル
              </Button>
            </Link>
            <Button type="submit" disabled={saving}>
              {saving ? '保存中...' : '保存する'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 