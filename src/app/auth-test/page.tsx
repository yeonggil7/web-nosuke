'use client';

import { useEffect, useState } from 'react';
import { getCurrentUser, signInWithEmail, signOut } from '@/lib/auth';
import { getUserProfile } from '@/lib/userDatabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User } from '@supabase/supabase-js';

export default function AuthTestPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [testEmail, setTestEmail] = useState('testuser001@gmail.com');
  const [testPassword, setTestPassword] = useState('password123');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev]);
    console.log(message);
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    setIsLoading(true);
    addLog('🔍 認証状況確認開始...');
    
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      
      if (currentUser) {
        addLog(`✅ ログイン済み: ${currentUser.email} (ID: ${currentUser.id})`);
        
        // プロフィール取得テスト
        addLog('📄 プロフィール取得テスト開始...');
        try {
          const profile = await getUserProfile(currentUser.id);
          addLog(`📄 プロフィール結果: ${profile ? '取得成功' : '未設定または取得失敗'}`);
        } catch (error) {
          addLog(`❌ プロフィール取得エラー: ${error}`);
        }
      } else {
        addLog('❌ 未ログイン');
      }
    } catch (error) {
      addLog(`💥 認証確認エラー: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    addLog(`🔐 ログイン試行: ${testEmail}`);
    try {
      const { data, error } = await signInWithEmail(testEmail, testPassword);
      if (error) {
        addLog(`❌ ログインエラー: ${error.message}`);
      } else {
        addLog('✅ ログイン成功');
        await checkAuthStatus();
      }
    } catch (error) {
      addLog(`💥 ログイン例外: ${error}`);
    }
  };

  const handleLogout = async () => {
    addLog('🚪 ログアウト試行...');
    try {
      await signOut();
      addLog('✅ ログアウト成功');
      setUser(null);
    } catch (error) {
      addLog(`❌ ログアウトエラー: ${error}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">認証テストページ</h1>
      
      {/* 現在の状況 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">現在の認証状況</h2>
        {isLoading ? (
          <p>確認中...</p>
        ) : (
          <div>
            <p className="mb-2">
              <span className="font-medium">ステータス:</span>{' '}
              {user ? (
                <span className="text-green-600">✅ ログイン済み</span>
              ) : (
                <span className="text-red-600">❌ 未ログイン</span>
              )}
            </p>
            {user && (
              <>
                <p className="mb-2">
                  <span className="font-medium">ユーザーID:</span> {user.id}
                </p>
                <p className="mb-2">
                  <span className="font-medium">メール:</span> {user.email}
                </p>
                <p className="mb-2">
                  <span className="font-medium">メール確認:</span>{' '}
                  {user.email_confirmed_at ? '✅ 確認済み' : '❌ 未確認'}
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {/* ログインテスト */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">ログインテスト</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">メールアドレス</label>
            <Input
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="test@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">パスワード</label>
            <Input
              type="password"
              value={testPassword}
              onChange={(e) => setTestPassword(e.target.value)}
              placeholder="password123"
            />
          </div>
          <div className="flex space-x-2">
            <Button onClick={handleLogin} disabled={isLoading}>
              ログイン
            </Button>
            <Button onClick={handleLogout} variant="outline" disabled={!user}>
              ログアウト
            </Button>
            <Button onClick={checkAuthStatus} variant="outline">
              状況再確認
            </Button>
          </div>
        </div>
      </div>

      {/* ログ表示 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">実行ログ</h2>
        <div className="bg-gray-100 p-4 rounded max-h-96 overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-gray-500">ログはまだありません</p>
          ) : (
            <div className="space-y-1">
              {logs.map((log, index) => (
                <div key={index} className="text-sm font-mono">
                  {log}
                </div>
              ))}
            </div>
          )}
        </div>
        <Button 
          onClick={() => setLogs([])} 
          variant="outline" 
          size="sm" 
          className="mt-2"
        >
          ログクリア
        </Button>
      </div>
    </div>
  );
} 