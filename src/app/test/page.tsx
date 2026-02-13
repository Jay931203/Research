'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function TestPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [tableCount, setTableCount] = useState<number>(0);

  useEffect(() => {
    testConnection();
  }, []);

  async function testConnection() {
    try {
      // 1. Papers 테이블 조회 테스트
      const { data: papers, error: papersError } = await supabase
        .from('papers')
        .select('*')
        .limit(1);

      if (papersError) throw papersError;

      // 2. 테이블 목록 확인
      const { data: tables, error: tablesError } = await supabase
        .from('papers')
        .select('count');

      setStatus('success');
      setMessage(`✅ Supabase 연결 성공!\n현재 Papers: ${papers?.length || 0}개`);
      setTableCount(papers?.length || 0);
    } catch (error: any) {
      setStatus('error');
      setMessage(`❌ 연결 실패: ${error.message}`);
      console.error('Connection error:', error);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
        <h1 className="text-3xl font-bold mb-6">🔌 Supabase 연결 테스트</h1>

        <div className={`p-6 rounded-lg mb-6 ${
          status === 'loading' ? 'bg-blue-50 dark:bg-blue-900/20' :
          status === 'success' ? 'bg-green-50 dark:bg-green-900/20' :
          'bg-red-50 dark:bg-red-900/20'
        }`}>
          {status === 'loading' && (
            <div className="flex items-center gap-3">
              <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full" />
              <span>연결 테스트 중...</span>
            </div>
          )}

          {status === 'success' && (
            <div>
              <div className="text-2xl mb-2">✅</div>
              <pre className="whitespace-pre-wrap text-sm">{message}</pre>
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                <p>✓ Papers 테이블 접근 가능</p>
                <p>✓ 데이터베이스 연결 정상</p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div>
              <div className="text-2xl mb-2">❌</div>
              <pre className="whitespace-pre-wrap text-sm text-red-600 dark:text-red-400">{message}</pre>
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                <p>💡 .env.local 파일을 확인하세요</p>
                <p>💡 Supabase 프로젝트가 활성화되어 있는지 확인하세요</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <a
            href="/"
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            ← 메인으로
          </a>
          <button
            onClick={testConnection}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            🔄 재테스트
          </button>
        </div>
      </div>
    </div>
  );
}
