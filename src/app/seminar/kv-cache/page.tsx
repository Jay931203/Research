'use client';

import dynamic from 'next/dynamic';
import Header from '@/components/layout/Header';
import CommandPalette from '@/components/common/CommandPalette';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

const KVCacheSeminarPage = dynamic(
  () => import('@/components/seminar/kv-cache/KVCacheSeminarPage'),
  { ssr: false }
);

export default function KVCacheSeminarRoute() {
  const { isCommandPaletteOpen, openCommandPalette, closeCommandPalette } = useKeyboardShortcuts();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <Header onSearchClick={openCommandPalette} />
      <main className="tse-content flex-1 overflow-y-auto">
        <KVCacheSeminarPage />
      </main>
      <CommandPalette isOpen={isCommandPaletteOpen} onClose={closeCommandPalette} />
    </div>
  );
}
