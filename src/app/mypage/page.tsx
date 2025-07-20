'use client';

import { useEffect, useState } from 'react';
import { getCurrentUser, signOut, isAdmin } from '@/lib/auth';
import { getUserProfile } from '@/lib/userDatabase';
import { UserProfile } from '@/schema/userSchema';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';
// import SupabaseStatus from '@/components/SupabaseStatus';

interface DebugInfo {
  hasUser: boolean;
  userId: string;
  email: string;
  emailConfirmed: string;
  hasProfile?: boolean;
  profileData?: string;
  isAdmin?: boolean;
  error?: string;
  authSessionExists?: boolean;
}

export default function MyPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function loadUser() {
      try {
        console.log('🚀 マイページ: ユーザー読み込み開始');
        setAuthError(null);
        
        const currentUser = await getCurrentUser();
        console.log('👤 現在のユーザー:', currentUser ? {
          id: currentUser.id,
          email: currentUser.email,
          emailConfirmed: currentUser.email_confirmed_at
        } : 'ログインしていません');
        
        // 基本的なデバッグ情報を設定
        const baseDebugInfo: DebugInfo = {
          hasUser: !!currentUser,
          userId: currentUser?.id || 'なし',
          email: currentUser?.email || 'なし',
          emailConfirmed: currentUser?.email_confirmed_at || 'なし',
          authSessionExists: !!currentUser
        };
        
        setDebugInfo(baseDebugInfo);

        if (!currentUser) {
          // ユーザーがログインしていない場合
          console.log('🔄 ログインしていないためリダイレクト');
          setAuthError('ログインセッションが見つかりません。再度ログインしてください。');
          setIsLoading(false);
          
          // 3秒後にリダイレクト
          setTimeout(() => {
            router.push('/login');
          }, 3000);
          return;
        }

        setUser(currentUser);

        // プロフィール取得
        console.log('📄 プロフィール取得中...');
        try {
          const userProfile = await getUserProfile(currentUser.id);
          setProfile(userProfile);
          
          // 管理者権限確認
          const adminStatus = await isAdmin();
          setIsAdminUser(adminStatus);
          
          setDebugInfo(prev => ({
            ...baseDebugInfo,
            hasProfile: !!userProfile,
            profileData: userProfile ? '設定済み' : '未設定',
            isAdmin: adminStatus
          }));
          
          console.log('✅ ユーザーデータ読み込み完了');
        } catch (profileError) {
          console.error('💥 プロフィール取得エラー:', profileError);
          setDebugInfo(prev => ({
            ...baseDebugInfo,
            hasProfile: false,
            profileData: '取得エラー',
            error: profileError instanceof Error ? profileError.message : '不明なエラー'
          }));
        }
      } catch (error) {
        console.error('💥 ユーザー読み込みエラー:', error);
        setAuthError(error instanceof Error ? error.message : '不明なエラーが発生しました');
        setDebugInfo(prev => ({
          hasUser: false,
          userId: 'なし',
          email: 'なし',
          emailConfirmed: 'なし',
          authSessionExists: false,
          hasProfile: prev?.hasProfile,
          profileData: prev?.profileData,
          isAdmin: prev?.isAdmin,
          error: error instanceof Error ? error.message : '不明なエラー'
        }));
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, [router]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  };

  // ローディング画面
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="text-xl mb-4">読み込み中...</div>
            <div className="text-sm text-gray-500">ユーザー情報を確認しています</div>
          </div>
        </div>
      </div>
    );
  }

  // 認証エラー画面
  if (authError && !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-4 text-red-600">認証エラー</h1>
          <p className="text-gray-700 mb-6">{authError}</p>
          <div className="space-y-4">
            <Link href="/login">
              <Button className="w-full border-2 rounded-md transition-all duration-200 hover:shadow-md active:scale-95 active:shadow-sm">
                ログインページへ
              </Button>
            </Link>
            <button 
              onClick={() => window.location.reload()} 
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-md hover:bg-gray-50 transition-all duration-200 hover:shadow-md active:scale-95 active:shadow-sm"
            >
              ページを再読み込み
            </button>
          </div>
          
          {/* デバッグ情報 */}
          {debugInfo && (
            <div className="mt-6 p-4 bg-gray-100 rounded-lg text-left">
              <h3 className="font-bold mb-2">🔍 デバッグ情報</h3>
              <pre className="text-xs bg-white p-2 rounded overflow-auto">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ログインしていない場合（念のため）
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">ログインが必要です</h1>
          <Link href="/login">
            <Button className="border-2 rounded-md transition-all duration-200 hover:shadow-md active:scale-95 active:shadow-sm">
              ログインページへ
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Supabase接続状況 */}
      {/* <div className="mb-6">
        <SupabaseStatus />
      </div> */}

      {/* デバッグ情報 */}
      {/* <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-bold mb-2">🔍 デバッグ情報</h3>
        <pre className="text-sm bg-white p-2 rounded overflow-auto">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </div> */}

      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">マイページ</h1>
          <div className="space-x-2">
            {isAdminUser && (
              <Link href="/admin">
                <Button 
                  variant="outline"
                  className="border-2 rounded-md transition-all duration-200 hover:shadow-md active:scale-95 active:shadow-sm"
                >
                  管理画面
                </Button>
              </Link>
            )}
            <Button 
              onClick={handleSignOut} 
              variant="outline"
              className="border-2 rounded-md transition-all duration-200 hover:shadow-md active:scale-95 active:shadow-sm"
            >
              ログアウト
            </Button>
          </div>
        </div>

        {/* ユーザー情報 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">ユーザー情報</h2>
          <div className="space-y-2">
            <p><span className="font-medium">メールアドレス:</span> {user.email}</p>
            <p><span className="font-medium">ユーザーID:</span> {user.id}</p>
            <p><span className="font-medium">登録日:</span> {user.created_at ? new Date(user.created_at).toLocaleDateString('ja-JP') : '不明'}</p>
          </div>
        </div>

        {/* プロフィール情報 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">プロフィール</h2>
            <Link href="/mypage/profile/edit">
              <Button className="border-2 rounded-md transition-all duration-200 hover:shadow-md active:scale-95 active:shadow-sm">
                プロフィール編集
              </Button>
            </Link>
          </div>
          
          {profile ? (
            <div className="space-y-6">
              {/* 基本情報 */}
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-3">基本情報</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium text-gray-700">表示名</p>
                    <p>{profile.display_name || '未設定'}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">氏名（フルネーム）</p>
                    <p>{profile.full_name || '未設定'}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">フリガナ</p>
                    <p>{profile.full_name_kana || '未設定'}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">所属</p>
                    <p>{profile.organization || '未設定'}</p>
                  </div>
                  {profile.website && (
                    <div>
                      <p className="font-medium text-gray-700">ウェブサイト</p>
                      <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {profile.website}
                      </a>
                    </div>
                  )}
                  {profile.experience_years && (
                    <div>
                      <p className="font-medium text-gray-700">経験年数</p>
                      <p>{profile.experience_years}年</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 自己PR */}
              {profile.self_promotion && (
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-3">自己PR</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="whitespace-pre-wrap">{profile.self_promotion}</p>
                  </div>
                </div>
              )}
              
              {/* スキル */}
              {profile.skills && profile.skills.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-3">スキル・資格</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* 活動希望エリア */}
              {profile.preferred_areas && profile.preferred_areas.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-3">活動希望エリア</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.preferred_areas.map((area, index) => (
                      <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* 興味のある分野 */}
              {profile.interested_fields && profile.interested_fields.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-3">興味のある分野</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.interested_fields.map((field, index) => (
                      <span key={index} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                        {field}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="mb-4">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">プロフィールが設定されていません</h3>
              <p className="text-gray-500 mb-4">プロフィールを作成して、あなたの情報を登録しましょう</p>
              <Link href="/mypage/profile/edit">
                <Button className="border-2 rounded-md transition-all duration-200 hover:shadow-md active:scale-95 active:shadow-sm">
                  プロフィールを作成
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* クイックアクション */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">クイックアクション</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/jobs" className="block">
              <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <h3 className="font-medium">求人を探す</h3>
                <p className="text-sm text-gray-600">最新の求人情報をチェック</p>
              </div>
            </Link>
            <Link href="/mypage/favorites" className="block">
              <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <h3 className="font-medium">お気に入り</h3>
                <p className="text-sm text-gray-600">保存した求人を確認</p>
              </div>
            </Link>
            <Link href="/mypage/applications" className="block">
              <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <h3 className="font-medium">応募履歴</h3>
                <p className="text-sm text-gray-600">応募した求人の状況確認</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 