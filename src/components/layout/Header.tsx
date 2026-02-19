'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  Download,
  FileJson,
  FileText,
  Github,
  Menu,
  Monitor,
  Moon,
  Search,
  Sun,
  X,
} from 'lucide-react';
import { usePapersWithNotes } from '@/hooks/useNotes';
import { useRelationships } from '@/hooks/useRelationships';
import { exportToJSON, exportToMarkdown } from '@/lib/utils/export';
import { useThemeStore } from '@/hooks/useDarkMode';

const REPO_URL = 'https://github.com/Jay931203/Research';

interface HeaderProps {
  onSearchClick?: () => void;
}

export default function Header({ onSearchClick }: HeaderProps = {}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();
  const { papers } = usePapersWithNotes();
  const { relationships } = useRelationships();

  useEffect(() => {
    if (!showExportMenu) return;
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (target && exportRef.current?.contains(target)) return;
      setShowExportMenu(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [showExportMenu]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:border-gray-700 dark:bg-gray-900/95 dark:supports-[backdrop-filter]:bg-gray-900/70">
      <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center justify-between px-3 sm:px-4">
        <Link href="/" className="flex items-center gap-2 transition hover:opacity-85">
          <BookOpen className="h-6 w-6 text-blue-600" />
          <div className="flex flex-col">
            <p className="text-lg font-bold leading-tight">Research Graph</p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              논문 학습 맵 & 관계 탐색
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
          <HeaderLink
            href="/dashboard"
            active={pathname === '/dashboard' || pathname.startsWith('/paper/')}
          >
            대시보드
          </HeaderLink>
          <HeaderLink href="/glossary" active={pathname === '/glossary'}>
            용어집
          </HeaderLink>

          {onSearchClick && (
            <button
              onClick={onSearchClick}
              className="inline-flex items-center gap-2 rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-500 transition hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:bg-gray-800"
              aria-label="논문 검색"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="hidden text-xs lg:inline">검색</span>
              <kbd className="rounded border border-gray-300 bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold dark:border-gray-600 dark:bg-gray-700">
                Ctrl+K
              </kbd>
            </button>
          )}

          <div className="relative" ref={exportRef}>
            <button
              onClick={() => setShowExportMenu((prev) => !prev)}
              className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              <Download className="h-4 w-4" />
              내보내기
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
            <MobileHeaderLink
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              active={pathname === '/dashboard' || pathname.startsWith('/paper/')}
            >
              대시보드
            </MobileHeaderLink>
            <MobileHeaderLink
              href="/glossary"
              onClick={() => setMobileMenuOpen(false)}
              active={pathname === '/glossary'}
            >
              용어집
            </MobileHeaderLink>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              GitHub 저장소
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

function HeaderLink({
  href,
  children,
  active,
}: {
  href: string;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`rounded-md px-3 py-2 text-sm font-medium transition ${
        active
          ? 'bg-blue-50 font-bold text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
      }`}
    >
      {children}
    </Link>
  );
}

function MobileHeaderLink({
  href,
  children,
  onClick,
  active,
}: {
  href: string;
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`rounded-md px-3 py-2 text-sm font-medium transition ${
        active
          ? 'bg-blue-50 font-bold text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
      }`}
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
      aria-label={`테마 변경, 현재 ${label}`}
    >
      {icon}
    </button>
  );
}
