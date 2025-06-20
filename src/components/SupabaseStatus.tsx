'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface TableStatus {
  name: string;
  exists: boolean;
  error?: string;
  count?: number;
}

export default function SupabaseStatus() {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [tableStatuses, setTableStatuses] = useState<TableStatus[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [authStatus, setAuthStatus] = useState<any>(null);

  const requiredTables = [
    'jobs',
    'user_profiles', 
    'user_favorites',
    'job_applications',
    'user_settings',
    'user_activities'
  ];

  useEffect(() => {
    async function checkSupabaseStatus() {
      try {
        console.log('🔍 Supabase接続状況をチェック中...');
        
        // 認証状況を確認
        const { data: authData, error: authError } = await supabase.auth.getUser();
        setAuthStatus({
          hasUser: !!authData?.user,
          userId: authData?.user?.id || null,
          email: authData?.user?.email || null,
          error: authError?.message || null
        });

        // 基本的な接続テスト
        const { data, error: connectionError } = await supabase
          .from('jobs')
          .select('id')
          .limit(1);

        if (connectionError) {
          console.error('❌ Supabase接続エラー:', connectionError);
          setConnectionStatus('error');
          setError(connectionError.message);
          return;
        }

        console.log('✅ Supabase基本接続成功');
        setConnectionStatus('connected');

        // 各テーブルの存在確認
        const tableChecks = await Promise.all(
          requiredTables.map(async (tableName): Promise<TableStatus> => {
            try {
              const { data: countData, error: tableError } = await supabase
                .from(tableName)
                .select('*', { count: 'exact', head: true });

              if (tableError) {
                console.error(`❌ テーブル ${tableName} エラー:`, tableError);
                return {
                  name: tableName,
                  exists: false,
                  error: tableError.message
                };
              }

              // 実際のデータも少し取得してみる
              const { data: sampleData, error: sampleError } = await supabase
                .from(tableName)
                .select('*')
                .limit(1);

              console.log(`✅ テーブル ${tableName} 存在確認成功`);
              return {
                name: tableName,
                exists: true,
                count: sampleData?.length || 0
              };
            } catch (err) {
              console.error(`💥 テーブル ${tableName} 予期しないエラー:`, err);
              return {
                name: tableName,
                exists: false,
                error: err instanceof Error ? err.message : String(err)
              };
            }
          })
        );

        setTableStatuses(tableChecks);
      } catch (err) {
        console.error('💥 Supabase状況チェックで予期しないエラー:', err);
        setConnectionStatus('error');
        setError(err instanceof Error ? err.message : String(err));
      }
    }

    checkSupabaseStatus();
  }, []);

  const hasRequiredTables = tableStatuses.every(table => table.exists);
  const missingTables = tableStatuses.filter(table => !table.exists);

  if (connectionStatus === 'checking') {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
        <p className="text-yellow-700">🔍 Supabase接続を確認中...</p>
      </div>
    );
  }

  if (connectionStatus === 'error') {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
        <h3 className="text-red-800 font-medium">❌ Supabase接続エラー</h3>
        <p className="text-red-700 text-sm mt-1">{error}</p>
        <div className="mt-2 text-red-700 text-sm">
          <p>📝 解決方法:</p>
          <ol className="list-decimal list-inside ml-4">
            <li>.env.localファイルの環境変数を確認</li>
            <li>NEXT_PUBLIC_SUPABASE_URLとNEXT_PUBLIC_SUPABASE_ANON_KEYが正しく設定されているか確認</li>
            <li>開発サーバーを再起動</li>
          </ol>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 mb-4">
      <div className="bg-green-50 border-l-4 border-green-500 p-4">
        <h3 className="text-green-800 font-medium">✅ Supabase接続成功</h3>
      </div>

      <div className={`border-l-4 p-4 ${hasRequiredTables ? 'bg-green-50 border-green-500' : 'bg-yellow-50 border-yellow-400'}`}>
        <h3 className={`font-medium ${hasRequiredTables ? 'text-green-800' : 'text-yellow-800'}`}>
          📊 データベーステーブル状況
        </h3>
        
        <div className="mt-2 space-y-1">
          {tableStatuses.map((table) => (
            <div key={table.name} className="flex items-center justify-between text-sm">
              <span className="font-mono">{table.name}</span>
              <span className={table.exists ? 'text-green-600' : 'text-red-600'}>
                {table.exists ? '✅ 存在' : '❌ なし'}
              </span>
            </div>
          ))}
        </div>

        {missingTables.length > 0 && (
          <div className="mt-4 p-3 bg-yellow-100 rounded">
            <p className="text-yellow-800 font-medium">⚠️ 不足しているテーブル: {missingTables.length}個</p>
            <p className="text-yellow-700 text-sm mt-1">📝 解決方法:</p>
            <ol className="list-decimal list-inside ml-4 text-yellow-700 text-sm">
              <li>Supabaseダッシュボードにアクセス</li>
              <li>SQL Editorを開く</li>
              <li>docs/database-schema.sqlの内容をコピー&ペースト</li>
              <li>実行してテーブルを作成</li>
              <li>ページを更新して確認</li>
            </ol>
          </div>
        )}
      </div>

      {/* 認証状況 */}
      {authStatus && (
        <div className="mt-4 p-3 bg-blue-50 rounded">
          <h4 className="font-semibold text-sm">認証状況</h4>
          <div className="text-xs">
            <div>ユーザー: {authStatus.hasUser ? '✅ ログイン済み' : '❌ 未ログイン'}</div>
            {authStatus.userId && <div>ユーザーID: {authStatus.userId}</div>}
            {authStatus.email && <div>メール: {authStatus.email}</div>}
            {authStatus.error && <div className="text-red-600">エラー: {authStatus.error}</div>}
          </div>
        </div>
      )}
    </div>
  );
} 