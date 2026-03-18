'use client';

import dynamic from 'next/dynamic';
import Header from '@/components/layout/Header';
import CommandPalette from '@/components/common/CommandPalette';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

const ChainOfThoughtSeminarPage = dynamic(
  () => import('@/components/seminar/chain-of-thought/ChainOfThoughtSeminarPage'),
  { ssr: false }
);

export default function ChainOfThoughtSeminarRoute() {
  const { isCommandPaletteOpen, openCommandPalette, closeCommandPalette } = useKeyboardShortcuts();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <Header onSearchClick={openCommandPalette} />
      <main className="tse-content flex-1 overflow-y-auto">
        <ChainOfThoughtSeminarPage />
      </main>
      <CommandPalette isOpen={isCommandPaletteOpen} onClose={closeCommandPalette} />
    </div>
  );
}
