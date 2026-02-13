'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Download,
  FileJson,
  FileText,
  Github,
  Menu,
  Monitor,
  Moon,
  Sun,
  X,
} from 'lucide-react';
import { usePapersWithNotes } from '@/hooks/useNotes';
import { useRelationships } from '@/hooks/useRelationships';
import { exportToJSON, exportToMarkdown } from '@/lib/utils/export';
import { useThemeStore } from '@/hooks/useDarkMode';

const REPO_URL = 'https://github.com/Jay931203/Research';

export default function Header() {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  const { papers } = usePapersWithNotes();
  const { relationships } = useRelationships();

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!exportRef.current) return;
      if (exportRef.current.contains(event.target as Node)) return;
      setShowExportMenu(false);
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:border-gray-700 dark:bg-gray-900/95 dark:supports-[backdrop-filter]:bg-gray-900/70">
      <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center justify-between px-3 sm:px-4">
        <Link href="/" className="flex items-center gap-2 transition hover:opacity-85">
          <BookOpen className="h-6 w-6 text-blue-600" />
          <div className="flex flex-col">
            <p className="text-lg font-bold leading-tight">CSI Research Graph</p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              논문 핵심 리마인드 & 관계 탐색
            </p>
          </div>
        </Link>

        <button
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="rounded-md p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 md:hidden"
          aria-label="메뉴 열기"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <nav className="hidden items-center gap-2 md:flex">
          <HeaderLink href="/dashboard">Dashboard</HeaderLink>
          <HeaderLink href="/import">Import</HeaderLink>
          <HeaderLink href="/test">System Check</HeaderLink>

          <div className="relative" ref={exportRef}>
            <button
              onClick={() => setShowExportMenu((prev) => !prev)}
              className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
            {showExportMenu && (
              <div className="absolute right-0 z-50 mt-1 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                <button
                  onClick={() => {
                    exportToMarkdown(papers, relationships);
                    setShowExportMenu(false);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <FileText className="h-4 w-4" />
                  Markdown (.md)
                </button>
                <button
                  onClick={() => {
                    exportToJSON(papers, relationships);
                    setShowExportMenu(false);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <FileJson className="h-4 w-4" />
                  JSON (.json)
                </button>
              </div>
            )}
          </div>

          <div className="ml-2 flex items-center gap-1 border-l border-gray-200 pl-2 dark:border-gray-700">
            <ThemeToggle />
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
              title="GitHub 저장소"
            >
              <Github className="h-4 w-4" />
            </a>
          </div>
        </nav>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-gray-200 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-900 md:hidden">
          <div className="flex flex-col gap-1">
            <MobileHeaderLink href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
              Dashboard
            </MobileHeaderLink>
            <MobileHeaderLink href="/import" onClick={() => setMobileMenuOpen(false)}>
              Import
            </MobileHeaderLink>
            <MobileHeaderLink href="/test" onClick={() => setMobileMenuOpen(false)}>
              System Check
            </MobileHeaderLink>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              GitHub Repository
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

function HeaderLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
    >
      {children}
    </Link>
  );
}

function MobileHeaderLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
    >
      {children}
    </Link>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useThemeStore();

  const nextTheme = () => {
    const cycle: Record<typeof theme, typeof theme> = {
      light: 'dark',
      dark: 'system',
      system: 'light',
    };
    setTheme(cycle[theme]);
  };

  const icon =
    theme === 'dark' ? (
      <Moon className="h-4 w-4" />
    ) : theme === 'light' ? (
      <Sun className="h-4 w-4" />
    ) : (
      <Monitor className="h-4 w-4" />
    );

  const label = {
    light: '라이트',
    dark: '다크',
    system: '시스템',
  }[theme];

  return (
    <button
      onClick={nextTheme}
      className="rounded-md p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
      title={`테마: ${label}`}
      aria-label={`테마 변경: 현재 ${label}`}
    >
      {icon}
    </button>
  );
}

