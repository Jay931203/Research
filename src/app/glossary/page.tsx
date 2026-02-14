'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Cpu,
  Filter,
  Layers,
  Search,
  Tag,
  Zap,
} from 'lucide-react';
import { useGlossary } from '@/hooks/useGlossary';
import { usePapersWithNotes } from '@/hooks/useNotes';
import type { GlossaryTerm } from '@/types';

/* ------------------------------------------------------------------ */
/*  Category config                                                     */
/* ------------------------------------------------------------------ */

const CATEGORY_META: Record<
  GlossaryTerm['category'],
  { label: string; color: string; icon: typeof Cpu }
> = {
  architecture: { label: '아키텍처', color: '#3b82f6', icon: Cpu },
  technique: { label: '기법', color: '#8b5cf6', icon: Zap },
  metric: { label: '지표', color: '#10b981', icon: Tag },
  domain: { label: '도메인', color: '#f59e0b', icon: Layers },
  training: { label: '학습', color: '#ef4444', icon: BookOpen },
};

const ALL_CATEGORIES = Object.keys(CATEGORY_META) as GlossaryTerm['category'][];

/* ================================================================== */
/*  Page Component                                                     */
/* ================================================================== */

export default function GlossaryPage() {
  const { terms, isLoading } = useGlossary();
  const { papers } = usePapersWithNotes();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<GlossaryTerm['category'] | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  /* ---------- filtering ---------- */

  const filtered = useMemo(() => {
    let result = terms;

    if (selectedCategory !== 'all') {
      result = result.filter((t) => t.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.aliases.some((a) => a.toLowerCase().includes(q)) ||
          t.description.toLowerCase().includes(q)
      );
    }

    return result;
  }, [terms, selectedCategory, searchQuery]);

  /* ---------- paper lookup ---------- */

  const paperByTitle = useMemo(() => {
    const map = new Map<string, { id: string; title: string; color_hex: string }>();
    for (const p of papers) {
      map.set(p.title.toLowerCase(), { id: p.id, title: p.title, color_hex: p.color_hex });
    }
    return map;
  }, [papers]);

  /* ---------- category counts ---------- */

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: terms.length };
    for (const cat of ALL_CATEGORIES) {
      counts[cat] = terms.filter((t) => t.category === cat).length;
    }
    return counts;
  }, [terms]);

  /* ---------- loading ---------- */

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <nav className="fixed left-0 right-0 top-0 z-40 flex h-14 items-center border-b border-gray-200 bg-white/95 px-4 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/95">
          <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        </nav>
        <main className="mx-auto max-w-4xl space-y-4 px-4 pt-20">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-white dark:bg-gray-900" />
          ))}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* -------- Top Navigation -------- */}
      <nav className="fixed left-0 right-0 top-0 z-40 flex h-14 items-center justify-between border-b border-gray-200 bg-white/95 px-4 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/95">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">대시보드</span>
        </Link>
        <h1 className="text-sm font-bold text-gray-800 dark:text-gray-200">
          용어집 (Glossary)
        </h1>
        <div className="w-20" />
      </nav>

      {/* -------- Main Content -------- */}
      <main className="mx-auto max-w-4xl px-4 pt-20 pb-16 sm:px-6 lg:px-8">
        {/* Search + Filter bar */}
        <div className="mb-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="용어 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-800 placeholder-gray-400 transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:placeholder-gray-500 dark:focus:border-blue-600 dark:focus:ring-blue-900/30"
            />
          </div>

          {/* Category filter chips */}
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <button
              onClick={() => setSelectedCategory('all')}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                selectedCategory === 'all'
                  ? 'bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
              }`}
            >
              전체 ({categoryCounts.all})
            </button>
            {ALL_CATEGORIES.map((cat) => {
              const meta = CATEGORY_META[cat];
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(isActive ? 'all' : cat)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                    isActive
                      ? 'text-white'
                      : 'hover:opacity-80'
                  }`}
                  style={{
                    backgroundColor: isActive ? meta.color : `${meta.color}15`,
                    color: isActive ? '#fff' : meta.color,
                  }}
                >
                  {meta.label} ({categoryCounts[cat] ?? 0})
                </button>
              );
            })}
          </div>
        </div>

        {/* Results count */}
        <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
          {filtered.length}개 용어 표시 중
        </p>

        {/* Term cards */}
        <div className="space-y-3">
          {filtered.map((term) => {
            const meta = CATEGORY_META[term.category];
            const Icon = meta.icon;
            const isExpanded = expandedId === term.id;

            return (
              <div
                key={term.id}
                className="rounded-xl bg-white shadow-sm transition dark:bg-gray-900 dark:shadow-none dark:ring-1 dark:ring-gray-800"
              >
                {/* Header */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : term.id)}
                  className="flex w-full items-center gap-3 p-4 text-left"
                >
                  <div
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${meta.color}15` }}
                  >
                    <Icon className="h-4 w-4" style={{ color: meta.color }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">
                        {term.name}
                      </h3>
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        style={{ backgroundColor: `${meta.color}15`, color: meta.color }}
                      >
                        {meta.label}
                      </span>
                    </div>
                    {term.aliases.length > 0 && (
                      <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
                        {term.aliases.join(' · ')}
                      </p>
                    )}
                  </div>
                  <span className="flex-shrink-0 text-xs text-gray-400 dark:text-gray-500">
                    {term.related_paper_titles.length}편
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 flex-shrink-0 text-gray-400 transition-transform dark:text-gray-500 ${isExpanded ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="border-t border-gray-100 px-4 pb-4 pt-3 dark:border-gray-800">
                    {/* Description */}
                    <p className="mb-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                      {term.description}
                    </p>

                    {/* Related papers */}
                    <div>
                      <p className="mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                        관련 논문 ({term.related_paper_titles.length}편)
                      </p>
                      <div className="space-y-1.5">
                        {term.related_paper_titles.map((title) => {
                          const paper = paperByTitle.get(title.toLowerCase());
                          if (paper) {
                            return (
                              <Link
                                key={title}
                                href={`/paper/${paper.id}`}
                                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                              >
                                <span
                                  className="h-2 w-2 flex-shrink-0 rounded-full"
                                  style={{ backgroundColor: paper.color_hex }}
                                />
                                <span className="line-clamp-1">{paper.title}</span>
                                <ChevronRight className="ml-auto h-3 w-3 flex-shrink-0 text-gray-400" />
                              </Link>
                            );
                          }
                          return (
                            <p
                              key={title}
                              className="px-3 py-2 text-xs text-gray-400 dark:text-gray-500"
                            >
                              {title}
                            </p>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <Search className="mb-3 h-8 w-8 text-gray-300 dark:text-gray-600" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                검색 결과가 없습니다.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
