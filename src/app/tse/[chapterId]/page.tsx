'use client';

import { use } from 'react';
import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import Header from '@/components/layout/Header';
import CommandPalette from '@/components/common/CommandPalette';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import 'rc-slider/assets/index.css';

const Chapter2Page = dynamic(() => import('@/components/tse/chapter2/Chapter2Page'), { ssr: false });
const Chapter3Page = dynamic(() => import('@/components/tse/chapter3/Chapter3Page'), { ssr: false });
const Chapter5Page = dynamic(() => import('@/components/tse/chapter5/Chapter5Page'), { ssr: false });

const chapterComponents: Record<number, React.ComponentType> = {
  2: Chapter2Page,
  3: Chapter3Page,
  5: Chapter5Page,
};

const chapterTitles: Record<number, string> = {
  2: 'The Wireless Channel',
  3: 'Point-to-Point Communication',
  5: 'Capacity of Wireless Channels',
};

interface TseChapterPageProps {
  params: Promise<{ chapterId: string }>;
}

export default function TseChapterPage({ params }: TseChapterPageProps) {
  const { chapterId: rawId } = use(params);
  const chapterId = Number.parseInt(rawId, 10);

  if (Number.isNaN(chapterId) || !chapterComponents[chapterId]) {
    notFound();
  }

  const ChapterComponent = chapterComponents[chapterId];
  const { isCommandPaletteOpen, openCommandPalette, closeCommandPalette } = useKeyboardShortcuts();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <Header onSearchClick={openCommandPalette} />
      <main className="tse-content flex-1 overflow-y-auto">
        <ChapterComponent />
      </main>
      <CommandPalette isOpen={isCommandPaletteOpen} onClose={closeCommandPalette} />
    </div>
  );
}
