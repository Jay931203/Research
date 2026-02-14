'use client';

import { RefreshCw } from 'lucide-react';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
          <span className="text-xl">!</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          오류가 발생했습니다
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          페이지를 불러오는 중 문제가 발생했습니다.
        </p>
        <button
          onClick={reset}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
        >
          <RefreshCw className="h-4 w-4" />
          다시 시도
        </button>
      </div>
    </main>
  );
}
