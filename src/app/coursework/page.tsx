'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import Header from '@/components/layout/Header';
import CommandPalette from '@/components/common/CommandPalette';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

export default function CourseworkPage() {
  const { isCommandPaletteOpen, openCommandPalette, closeCommandPalette } = useKeyboardShortcuts();
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header onSearchClick={openCommandPalette} />
      <CommandPalette isOpen={isCommandPaletteOpen} onClose={closeCommandPalette} />
      <div className="border-b border-gray-200 bg-white px-4 py-2 dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex max-w-5xl items-center gap-2 text-sm">
          <Link href="/" className="text-gray-500 transition hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">
            홈
          </Link>
          <ChevronRight className="h-3 w-3 text-gray-400" />
          <span className="font-medium text-gray-800 dark:text-gray-200">코스웍</span>
        </div>
      </div>
      <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-sm text-gray-400 dark:text-gray-500">준비 중</p>
      </main>
    </div>
  );
}
