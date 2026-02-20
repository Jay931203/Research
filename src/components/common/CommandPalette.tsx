'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, FileText, Search } from 'lucide-react';
import { usePapersWithNotes } from '@/hooks/useNotes';
import { useGlossary } from '@/hooks/useGlossary';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

type ResultItem =
  | { kind: 'paper'; id: string; title: string; sub: string }
  | { kind: 'term'; id: string; title: string; sub: string };

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const { papers } = usePapersWithNotes();
  const { terms } = useGlossary();
  const router = useRouter();

  const results = useMemo<ResultItem[]>(() => {
    const lower = query.trim().toLowerCase();

    const paperResults: ResultItem[] = (
      lower
        ? papers.filter(
            (p) =>
              p.title.toLowerCase().includes(lower) ||
              p.authors.some((a) => a.toLowerCase().includes(lower)) ||
              p.category.toLowerCase().includes(lower) ||
              (p.tags ?? []).some((tag) => tag.toLowerCase().includes(lower))
          )
        : papers.slice(0, 8)
    )
      .slice(0, 8)
      .map((p) => ({
        kind: 'paper' as const,
        id: p.id,
        title: p.title,
        sub: `${p.year} · ${p.authors.slice(0, 2).join(', ')}${p.authors.length > 2 ? ' 외' : ''}`,
      }));

    if (!lower) return paperResults;

    const termResults: ResultItem[] = terms
      .filter(
        (t) =>
          t.name.toLowerCase().includes(lower) ||
          t.aliases.some((a) => a.toLowerCase().includes(lower)) ||
          t.description.toLowerCase().includes(lower)
      )
      .slice(0, 5)
      .map((t) => ({
        kind: 'term' as const,
        id: t.id,
        title: t.name,
        sub: t.aliases.length ? t.aliases.join(' · ') : t.description.slice(0, 60),
      }));

    return [...paperResults, ...termResults];
  }, [papers, terms, query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen, onClose]);

  const selectItem = useCallback(
    (item: ResultItem) => {
      if (item.kind === 'paper') {
        router.push(`/paper/${item.id}`);
      } else {
        router.push(`/glossary?q=${encodeURIComponent(item.title)}`);
      }
      onClose();
    },
    [router, onClose]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
      } else if (e.key === 'Enter' && results[activeIndex]) {
        e.preventDefault();
        selectItem(results[activeIndex]);
      }
    },
    [results, activeIndex, selectItem]
  );

  useEffect(() => {
    if (!listRef.current) return;
    const activeEl = listRef.current.children[activeIndex] as HTMLElement | undefined;
    activeEl?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/40 pt-[15vh]">
      <div
        ref={panelRef}
        role="dialog"
        aria-label="검색"
        className="mx-4 flex w-full max-w-lg flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800"
      >
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-3 dark:border-gray-700">
          <Search className="h-5 w-5 shrink-0 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="논문 또는 용어 검색..."
            className="w-full bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none dark:text-gray-100 dark:placeholder-gray-500"
            aria-label="검색"
          />
          <kbd className="hidden shrink-0 rounded border border-gray-300 bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-500 sm:inline-block dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400">
            Esc
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[360px] overflow-y-auto py-2" role="listbox">
          {results.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
              검색 결과가 없습니다
            </p>
          ) : (
            results.map((item, index) => (
              <button
                key={`${item.kind}-${item.id}`}
                role="option"
                aria-selected={index === activeIndex}
                onClick={() => selectItem(item)}
                onMouseEnter={() => setActiveIndex(index)}
                className={`flex w-full items-start gap-3 px-4 py-2.5 text-left transition ${
                  index === activeIndex
                    ? 'bg-blue-50 dark:bg-blue-900/20'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                {item.kind === 'paper' ? (
                  <FileText className="mt-0.5 h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500" />
                ) : (
                  <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-violet-400 dark:text-violet-500" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                    {item.title}
                  </p>
                  <p className="line-clamp-1 text-xs text-gray-500 dark:text-gray-400">
                    {item.kind === 'paper' ? item.sub : `용어집 · ${item.sub}`}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer hints */}
        <div className="flex items-center gap-4 border-t border-gray-200 px-4 py-2 dark:border-gray-700">
          <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
            <kbd className="rounded border border-gray-300 bg-gray-100 px-1 py-0.5 text-[10px] dark:border-gray-600 dark:bg-gray-700">
              ↑↓
            </kbd>
            탐색
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
            <kbd className="rounded border border-gray-300 bg-gray-100 px-1 py-0.5 text-[10px] dark:border-gray-600 dark:bg-gray-700">
              Enter
            </kbd>
            열기
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
            <kbd className="rounded border border-gray-300 bg-gray-100 px-1 py-0.5 text-[10px] dark:border-gray-600 dark:bg-gray-700">
              Esc
            </kbd>
            닫기
          </span>
          <span className="ml-auto flex items-center gap-2 text-[10px] text-gray-400 dark:text-gray-500">
            <span className="flex items-center gap-1"><FileText className="h-3 w-3" /> 논문</span>
            <span className="flex items-center gap-1"><BookOpen className="h-3 w-3 text-violet-400" /> 용어</span>
          </span>
        </div>
      </div>
    </div>
  );
}
