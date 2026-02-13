'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Github, Settings, Download, FileJson, FileText, Sun, Moon, Monitor } from 'lucide-react';
import { usePapersWithNotes } from '@/hooks/useNotes';
import { useRelationships } from '@/hooks/useRelationships';
import { exportToMarkdown, exportToJSON } from '@/lib/utils/export';
import { useThemeStore } from '@/hooks/useDarkMode';

export default function Header() {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);
  const { papers } = usePapersWithNotes();
  const { relationships } = useRelationships();

  // 외부 클릭 시 메뉴 닫기
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-gray-900/95 dark:supports-[backdrop-filter]:bg-gray-900/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* 로고 및 제목 */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <BookOpen className="h-6 w-6 text-blue-500" />
            <div className="flex flex-col">
              <h1 className="text-lg font-bold leading-tight">CSI AutoEncoder</h1>
              <p className="text-xs text-gray-500">연구 시각화</p>
            </div>
          </Link>
        </div>

        {/* 네비게이션 */}
        <nav className="flex items-center gap-2">
          <Link
            href="/test"
            className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800"
          >
            연결 테스트
          </Link>
          <Link
            href="/import"
            className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800"
          >
            Import
          </Link>

          {/* Export 드롭다운 */}
          <div className="relative" ref={exportRef}>
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition flex items-center gap-1 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
            {showExportMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                <button
                  onClick={() => { exportToMarkdown(papers, relationships); setShowExportMenu(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <FileText className="h-4 w-4" />
                  Markdown (.md)
                </button>
                <button
                  onClick={() => { exportToJSON(papers, relationships); setShowExportMenu(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <FileJson className="h-4 w-4" />
                  JSON (.json)
                </button>
              </div>
            )}
          </div>

          {/* 추가 액션 버튼들 */}
          <div className="flex items-center gap-1 ml-2 border-l pl-2">
            <ThemeToggle />
            <button
              className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800"
              title="설정"
            >
              <Settings className="h-4 w-4" />
            </button>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800"
              title="GitHub"
            >
              <Github className="h-4 w-4" />
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useThemeStore();

  const next = () => {
    const cycle = { light: 'dark' as const, dark: 'system' as const, system: 'light' as const };
    setTheme(cycle[theme]);
  };

  const icon =
    theme === 'dark' ? <Moon className="h-4 w-4" /> :
    theme === 'light' ? <Sun className="h-4 w-4" /> :
    <Monitor className="h-4 w-4" />;

  const label = { light: '라이트', dark: '다크', system: '시스템' }[theme];

  return (
    <button
      onClick={next}
      className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800"
      title={`테마: ${label}`}
    >
      {icon}
    </button>
  );
}
