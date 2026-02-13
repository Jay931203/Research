'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function TestPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [paperCount, setPaperCount] = useState<number>(0);

  useEffect(() => {
    void testConnection();
  }, []);

  async function testConnection() {
    setStatus('loading');
    setMessage('');

    try {
      const { count, error } = await supabase
        .from('papers')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;

      setPaperCount(count ?? 0);
      setStatus('success');
      setMessage(`Supabase 연결 정상\nPapers 테이블 레코드: ${count ?? 0}개`);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      setStatus('error');
      setMessage(`연결 실패\n${errorMessage}`);
      console.error('Connection error:', error);
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] p-4 sm:p-8">
      <div className="mx-auto w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
        <h1 className="mb-6 text-3xl font-bold">System Check</h1>

        <div
          className={`mb-6 rounded-lg p-5 ${
            status === 'loading'
              ? 'bg-blue-50 dark:bg-blue-900/20'
              : status === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-900/20'
                : 'bg-red-50 dark:bg-red-900/20'
          }`}
        >
          {status === 'loading' && (
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
              <span>Supabase 연결 확인 중...</span>
            </div>
          )}

          {status === 'success' && (
            <div>
              <p className="mb-2 text-2xl">정상</p>
              <pre className="whitespace-pre-wrap text-sm">{message}</pre>
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                현재 로드 가능한 논문 수: {paperCount}개
              </p>
            </div>
          )}

          {status === 'error' && (
            <div>
              <p className="mb-2 text-2xl">오류</p>
              <pre className="whitespace-pre-wrap text-sm text-red-600 dark:text-red-400">
                {message}
              </pre>
              <div className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                <p>1) `.env.local`의 Supabase URL/KEY 확인</p>
                <p>2) Supabase 프로젝트 활성 상태 확인</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <a
            href="/dashboard"
            className="rounded-lg bg-gray-200 px-4 py-2 transition hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
          >
            대시보드로
          </a>
          <button
            onClick={() => void testConnection()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
          >
            다시 점검
          </button>
        </div>
      </div>
    </div>
  );
}

