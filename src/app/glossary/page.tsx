'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Cpu,
  Filter,
  GitBranch,
  Layers,
  Search,
  Tag,
  Zap,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import MarkdownContent from '@/components/common/MarkdownContent';
import { useGlossary } from '@/hooks/useGlossary';
import { usePapersWithNotes } from '@/hooks/useNotes';
import type { GlossaryStudyAxis, GlossaryTerm } from '@/types';

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

const STUDY_AXIS_META: Record<GlossaryStudyAxis, { label: string; color: string }> = {
  optimization: { label: '최적화 기법', color: '#0ea5e9' },
  quantization_module: { label: '양자화 모듈', color: '#ef4444' },
  learning_flow: { label: '학습 흐름', color: '#16a34a' },
};

const ALL_STUDY_AXES = Object.keys(STUDY_AXIS_META) as GlossaryStudyAxis[];

const TERM_SET_LABELS: Record<string, string> = {
  csi_core: 'CSI 핵심',
  csi_quantization: 'CSI 양자화',
  quantization_foundation: '양자화 이론',
  optimization_foundation: '최적화 이론',
  representation_learning: '표현학습',
  contrastive_ssl: '대조학습 SSL',
  reconstruction_ssl: '재구성 SSL',
  transformer_pretraining: 'Transformer 사전학습',
};

const TERM_SET_COLORS = [
  '#2563eb',
  '#0ea5e9',
  '#7c3aed',
  '#db2777',
  '#ea580c',
  '#16a34a',
  '#0891b2',
  '#4f46e5',
];

function getTermSetLabel(termSet: string): string {
  if (TERM_SET_LABELS[termSet]) return TERM_SET_LABELS[termSet];

  return termSet
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function termMatches(term: GlossaryTerm, query: string): boolean {
  const q = query.toLowerCase();
  return (
    term.id.toLowerCase() === q ||
    term.name.toLowerCase() === q ||
    term.aliases.some((a) => a.toLowerCase() === q) ||
    term.id.toLowerCase().includes(q) ||
    term.name.toLowerCase().includes(q) ||
    term.aliases.some((a) => a.toLowerCase().includes(q))
  );
}

export default function GlossaryPage() {
  const { terms, isLoading } = useGlossary();
  const { papers } = usePapersWithNotes();

  const [queryFromUrl, setQueryFromUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<GlossaryTerm['category'] | 'all'>('all');
  const [selectedTermSet, setSelectedTermSet] = useState<string>('all');
  const [selectedStudyAxis, setSelectedStudyAxis] = useState<GlossaryStudyAxis | 'all'>('all');
  const [selectedStudyTag, setSelectedStudyTag] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const appliedQueryRef = useRef<string | null>(null);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('q')?.trim() ?? '';
    setQueryFromUrl(q);
  }, []);

  useEffect(() => {
    if (!queryFromUrl || !terms.length) return;
    if (appliedQueryRef.current === queryFromUrl) return;

    appliedQueryRef.current = queryFromUrl;
    setSearchQuery(queryFromUrl);

    const matched = terms.find((t) => termMatches(t, queryFromUrl));
    if (!matched) {
      setSelectedCategory('all');
      setExpandedId(null);
      return;
    }

    setSelectedCategory(matched.category);
    setSelectedTermSet(matched.term_set ?? 'all');
    setExpandedId(matched.id);

    setTimeout(() => {
      document.getElementById(`glossary-term-${matched.id}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }, 80);
  }, [queryFromUrl, terms]);

  const availableStudyTags = useMemo(() => {
    if (selectedStudyAxis === 'all') return [];
    const values = new Set<string>();
    for (const term of terms) {
      const axisValues = term.study_classification?.[selectedStudyAxis] ?? [];
      for (const value of axisValues) {
        if (value?.trim()) values.add(value.trim());
      }
    }
    return Array.from(values).sort((a, b) => a.localeCompare(b, 'ko-KR'));
  }, [terms, selectedStudyAxis]);

  const availableTermSets = useMemo(() => {
    const values = new Set<string>();
    for (const term of terms) {
      const value = term.term_set?.trim();
      if (value) values.add(value);
    }
    return Array.from(values).sort((a, b) => a.localeCompare(b, 'ko-KR'));
  }, [terms]);

  const termSetColorMap = useMemo(() => {
    const map = new Map<string, string>();
    availableTermSets.forEach((setName, idx) => {
      map.set(setName, TERM_SET_COLORS[idx % TERM_SET_COLORS.length]);
    });
    return map;
  }, [availableTermSets]);

  useEffect(() => {
    if (selectedTermSet === 'all') return;
    if (!availableTermSets.includes(selectedTermSet)) {
      setSelectedTermSet('all');
    }
  }, [selectedTermSet, availableTermSets]);

  useEffect(() => {
    if (selectedStudyAxis === 'all') {
      if (selectedStudyTag !== 'all') setSelectedStudyTag('all');
      return;
    }
    if (selectedStudyTag !== 'all' && !availableStudyTags.includes(selectedStudyTag)) {
      setSelectedStudyTag('all');
    }
  }, [selectedStudyAxis, selectedStudyTag, availableStudyTags]);

  const filtered = useMemo(() => {
    let result = terms;

    if (selectedCategory !== 'all') {
      result = result.filter((t) => t.category === selectedCategory);
    }

    if (selectedTermSet !== 'all') {
      result = result.filter((term) => term.term_set === selectedTermSet);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (t) =>
          t.id.toLowerCase().includes(q) ||
          t.name.toLowerCase().includes(q) ||
          t.aliases.some((a) => a.toLowerCase().includes(q)) ||
          t.description.toLowerCase().includes(q)
      );
    }

    if (selectedStudyAxis !== 'all') {
      result = result.filter((term) => {
        const values = term.study_classification?.[selectedStudyAxis] ?? [];
        if (!values.length) return false;
        if (selectedStudyTag === 'all') return true;
        return values.includes(selectedStudyTag);
      });
    }

    return result;
  }, [terms, selectedCategory, selectedTermSet, searchQuery, selectedStudyAxis, selectedStudyTag]);

  const paperByTitle = useMemo(() => {
    const map = new Map<string, { id: string; title: string; colorHex: string }>();
    for (const p of papers) {
      map.set(p.title.toLowerCase(), { id: p.id, title: p.title, colorHex: p.color_hex });
    }
    return map;
  }, [papers]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: terms.length };
    for (const cat of ALL_CATEGORIES) {
      counts[cat] = terms.filter((t) => t.category === cat).length;
    }
    return counts;
  }, [terms]);

  const termSetCounts = useMemo(() => {
    const counts: Record<string, number> = { all: terms.length };
    for (const setName of availableTermSets) {
      counts[setName] = terms.filter((term) => term.term_set === setName).length;
    }
    return counts;
  }, [terms, availableTermSets]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Header />
        <main className="mx-auto max-w-4xl space-y-4 px-4 pt-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-white dark:bg-gray-900" />
          ))}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />

      <main className="mx-auto max-w-4xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <h1 className="mb-2 text-xl font-bold text-gray-800 dark:text-gray-200">용어집</h1>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          논문 페이지에서 클릭한 용어는 여기에서 상세 정의와 관련 논문으로 이어집니다.
        </p>

        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="용어 검색 (예: Monotone Convergence Theorem)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-800 placeholder-gray-400 transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:placeholder-gray-500 dark:focus:border-blue-600 dark:focus:ring-blue-900/30"
            />
          </div>

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
                    isActive ? 'text-white' : 'hover:opacity-80'
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

          <div className="space-y-2 rounded-xl border border-gray-200 bg-white/80 p-3 dark:border-gray-700 dark:bg-gray-900/70">
            <p className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">
              용어 집합 필터
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setSelectedTermSet('all')}
                className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${
                  selectedTermSet === 'all'
                    ? 'bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                }`}
              >
                전체 ({termSetCounts.all})
              </button>

              {availableTermSets.map((setName) => {
                const color = termSetColorMap.get(setName) ?? '#2563eb';
                const isActive = selectedTermSet === setName;
                return (
                  <button
                    key={setName}
                    onClick={() => setSelectedTermSet(isActive ? 'all' : setName)}
                    className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${
                      isActive ? 'text-white' : 'hover:opacity-80'
                    }`}
                    style={{
                      backgroundColor: isActive ? color : `${color}15`,
                      color: isActive ? '#fff' : color,
                    }}
                  >
                    {getTermSetLabel(setName)} ({termSetCounts[setName] ?? 0})
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2 rounded-xl border border-gray-200 bg-white/80 p-3 dark:border-gray-700 dark:bg-gray-900/70">
            <p className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">
              학습 분류 필터
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  setSelectedStudyAxis('all');
                  setSelectedStudyTag('all');
                }}
                className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${
                  selectedStudyAxis === 'all'
                    ? 'bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                }`}
              >
                전체
              </button>
              {ALL_STUDY_AXES.map((axis) => {
                const meta = STUDY_AXIS_META[axis];
                const isActive = selectedStudyAxis === axis;
                return (
                  <button
                    key={axis}
                    onClick={() => {
                      setSelectedStudyAxis(isActive ? 'all' : axis);
                      setSelectedStudyTag('all');
                    }}
                    className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${
                      isActive ? 'text-white' : 'hover:opacity-80'
                    }`}
                    style={{
                      backgroundColor: isActive ? meta.color : `${meta.color}15`,
                      color: isActive ? '#fff' : meta.color,
                    }}
                  >
                    {meta.label}
                  </button>
                );
              })}
            </div>
            {selectedStudyAxis !== 'all' && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  onClick={() => setSelectedStudyTag('all')}
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${
                    selectedStudyTag === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50'
                  }`}
                >
                  전체 태그
                </button>
                {availableStudyTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedStudyTag(tag)}
                    className={`rounded-full border px-3 py-1 text-[11px] font-medium transition ${
                      selectedStudyTag === tag
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-gray-300 bg-white text-gray-600 hover:border-blue-400 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
                {availableStudyTags.length === 0 && (
                  <span className="text-[11px] text-gray-400 dark:text-gray-500">
                    분류 태그가 등록된 용어가 없습니다.
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
          {filtered.length}개 용어 표시 중
        </p>

        <div className="space-y-3">
          {filtered.map((term) => {
            const meta = CATEGORY_META[term.category];
            const Icon = meta.icon;
            const isExpanded = expandedId === term.id;

            return (
              <div
                id={`glossary-term-${term.id}`}
                key={term.id}
                className="rounded-xl bg-white shadow-sm transition dark:bg-gray-900 dark:shadow-none dark:ring-1 dark:ring-gray-800"
              >
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
                      <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">{term.name}</h3>
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        style={{ backgroundColor: `${meta.color}15`, color: meta.color }}
                      >
                        {meta.label}
                      </span>
                      {term.term_set && (
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                          style={{
                            backgroundColor: `${termSetColorMap.get(term.term_set) ?? '#2563eb'}20`,
                            color: termSetColorMap.get(term.term_set) ?? '#2563eb',
                          }}
                        >
                          {getTermSetLabel(term.term_set)}
                        </span>
                      )}
                    </div>
                    {term.aliases.length > 0 && (
                      <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
                        {term.aliases.join(' · ')}
                      </p>
                    )}
                    {term.hierarchy?.length ? (
                      <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
                        <GitBranch className="h-3 w-3" />
                        {term.hierarchy.join(' > ')}
                      </p>
                    ) : null}
                  </div>

                  <span className="flex-shrink-0 text-xs text-gray-400 dark:text-gray-500">
                    {term.related_paper_titles.length}편
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 flex-shrink-0 text-gray-400 transition-transform dark:text-gray-500 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-100 px-4 pb-4 pt-3 dark:border-gray-800">
                    <MarkdownContent
                      content={term.description}
                      className="mb-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300"
                      glossaryTerms={terms}
                    />

                    {term.details_markdown && (
                      <div className="mb-4 rounded-lg border border-blue-100 bg-blue-50/60 px-4 py-3 dark:border-blue-900/40 dark:bg-blue-900/20">
                        <p className="mb-2 text-xs font-semibold text-blue-700 dark:text-blue-300">
                          핵심 수식/학습 메모
                        </p>
                        <MarkdownContent
                          content={term.details_markdown}
                          className="text-sm leading-relaxed text-blue-950 dark:text-blue-100"
                          glossaryTerms={terms}
                        />
                      </div>
                    )}

                    {term.study_classification && (
                      <div className="mb-4 space-y-2 rounded-lg border border-gray-200 bg-gray-50/70 px-3 py-3 dark:border-gray-700 dark:bg-gray-800/50">
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                          분류 태그
                        </p>
                        {ALL_STUDY_AXES.map((axis) => {
                          const values = term.study_classification?.[axis] ?? [];
                          if (!values.length) return null;
                          const axisMeta = STUDY_AXIS_META[axis];
                          return (
                            <div key={`${term.id}-${axis}`}>
                              <p className="mb-1 text-[11px] font-semibold" style={{ color: axisMeta.color }}>
                                {axisMeta.label}
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {values.map((value) => (
                                  <span
                                    key={`${term.id}-${axis}-${value}`}
                                    className="rounded-full border px-2 py-0.5 text-[11px] font-medium"
                                    style={{
                                      borderColor: `${axisMeta.color}66`,
                                      backgroundColor: `${axisMeta.color}16`,
                                      color: axisMeta.color,
                                    }}
                                  >
                                    {value}
                                  </span>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div>
                      <p className="mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                        관련 논문 ({term.related_paper_titles.length}편)
                      </p>
                      <div className="space-y-1.5">
                        {term.related_paper_titles.map((title) => {
                          const paper = paperByTitle.get(title.toLowerCase());
                          if (!paper) {
                            return (
                              <p key={title} className="px-3 py-2 text-xs text-gray-400 dark:text-gray-500">
                                {title}
                              </p>
                            );
                          }

                          return (
                            <Link
                              key={title}
                              href={`/paper/${paper.id}`}
                              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                            >
                              <span
                                className="h-2 w-2 flex-shrink-0 rounded-full"
                                style={{ backgroundColor: paper.colorHex }}
                              />
                              <span className="line-clamp-1">{paper.title}</span>
                              <ChevronRight className="ml-auto h-3 w-3 flex-shrink-0 text-gray-400" />
                            </Link>
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
              <p className="text-sm text-gray-500 dark:text-gray-400">검색 결과가 없습니다.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
