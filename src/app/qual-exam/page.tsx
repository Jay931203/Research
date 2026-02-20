'use client';

import dynamic from 'next/dynamic';
import Header from '@/components/layout/Header';
import CommandPalette from '@/components/common/CommandPalette';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

const QualExamMain = dynamic(() => import('@/components/qual-exam/QualExamMain'), { ssr: false });

export default function QualExamPage() {
  const { isCommandPaletteOpen, openCommandPalette, closeCommandPalette } = useKeyboardShortcuts();

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Header onSearchClick={openCommandPalette} />
      <main className="flex-1 overflow-hidden">
        <QualExamMain />
      </main>
      <CommandPalette isOpen={isCommandPaletteOpen} onClose={closeCommandPalette} />
    </div>
  );
}
