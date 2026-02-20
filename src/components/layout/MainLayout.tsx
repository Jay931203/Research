'use client';

import { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import CommandPalette from '@/components/common/CommandPalette';
import KeyboardShortcutsHelp from '@/components/common/KeyboardShortcutsHelp';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

interface MainLayoutProps {
  children: React.ReactNode;
  onSidebarPaperClick?: (paperId: string) => void;
}

export default function MainLayout({ children, onSidebarPaperClick }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const {
    isHelpOpen,
    isCommandPaletteOpen,
    closeHelp,
    openCommandPalette,
    closeCommandPalette,
  } = useKeyboardShortcuts();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header onSearchClick={openCommandPalette} />
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen((prev) => !prev)} onPaperClick={onSidebarPaperClick} />

      <main
        className={`pt-16 transition-all duration-300 ${
          sidebarOpen ? 'lg:ml-80' : 'lg:ml-0'
        }`}
      >
        <div className="mx-auto w-full max-w-[1600px] p-3 sm:p-4 lg:p-6">
          {children}
        </div>
      </main>
      <CommandPalette isOpen={isCommandPaletteOpen} onClose={closeCommandPalette} />
      <KeyboardShortcutsHelp isOpen={isHelpOpen} onClose={closeHelp} />
    </div>
  );
}
