'use client';

import dynamic from 'next/dynamic';
import Header from '@/components/layout/Header';

const QualExamMain = dynamic(() => import('@/components/qual-exam/QualExamMain'), { ssr: false });

export default function QualExamPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <Header />
      <main className="flex-1">
        <QualExamMain />
      </main>
    </div>
  );
}
