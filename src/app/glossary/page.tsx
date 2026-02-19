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

function collectTermSignals(term: GlossaryTerm): Set<string> {
  const signals = new Set<string>();
  signals.add(`category:${term.category}`);
  if (term.term_set) signals.add(`term_set:${term.term_set}`);

  for (const depth of term.hierarchy ?? []) {
    const value = depth.trim().toLowerCase();
    if (value) signals.add(`hierarchy:${value}`);
  }

  for (const axis of ALL_STUDY_AXES) {
    const values = term.study_classification?.[axis] ?? [];
    for (const value of values) {
      const normalized = value.trim().toLowerCase();
      if (normalized) signals.add(`study:${axis}:${normalized}`);
    }
  }

  return signals;
}

function scoreTermSimilarity(baseTerm: GlossaryTerm, candidateTerm: GlossaryTerm): number {
  let score = 0;

  if (baseTerm.category === candidateTerm.category) score += 2;
  if (baseTerm.term_set && baseTerm.term_set === candidateTerm.term_set) score += 4;

  const baseSignals = collectTermSignals(baseTerm);
  const candidateSignals = collectTermSignals(candidateTerm);
  let overlapCount = 0;
  for (const signal of Array.from(baseSignals)) {
    if (candidateSignals.has(signal)) overlapCount += 1;
  }
  score += Math.min(overlapCount, 8);

  const basePapers = new Set(baseTerm.related_paper_titles.map((title) => title.toLowerCase()));
  let sharedPaperCount = 0;
  for (const title of candidateTerm.related_paper_titles) {
    if (basePapers.has(title.toLowerCase())) sharedPaperCount += 1;
  }
  score += Math.min(sharedPaperCount, 2) * 2;

  return score;
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
  const [selectedTermId, setSelectedTermId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

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
      setExpandedIds([]);
      return;
    }

    setSelectedCategory(matched.category);
    setSelectedTermSet(matched.term_set ?? 'all');
    setSelectedTermId(matched.id);
    setExpandedIds((prev) => (prev.includes(matched.id) ? prev : [...prev, matched.id]));

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

  const filteredSorted = useMemo(
    () => [...filtered].sort((a, b) => a.name.localeCompare(b.name, 'ko-KR')),
    [filtered]
  );

  useEffect(() => {
    if (!filteredSorted.length) {
      setSelectedTermId(null);
      return;
    }

    if (!selectedTermId || !filteredSorted.some((term) => term.id === selectedTermId)) {
      setSelectedTermId(filteredSorted[0].id);
    }
  }, [filteredSorted, selectedTermId]);

  const selectedTerm = useMemo(
    () => filteredSorted.find((term) => term.id === selectedTermId) ?? null,
    [filteredSorted, selectedTermId]
  );

  const relatedTerms = useMemo(() => {
    if (!selectedTerm) return [];

    const scored = terms
      .filter((term) => term.id !== selectedTerm.id)
      .map((term) => ({ term, score: scoreTermSimilarity(selectedTerm, term) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || a.term.name.localeCompare(b.term.name, 'ko-KR'))
      .slice(0, 12)
      .map((item) => item.term);

    if (scored.length > 0) return scored;

    return terms
      .filter((term) => term.id !== selectedTerm.id && term.category === selectedTerm.category)
      .slice(0, 12);
  }, [terms, selectedTerm]);

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

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const focusTerm = (
    id: string,
    options: {
      open?: boolean;
      resetFilters?: boolean;
      scroll?: boolean;
    } = {}
  ) => {
    if (options.resetFilters) {
      setSearchQuery('');
      setSelectedCategory('all');
      setSelectedTermSet('all');
      setSelectedStudyAxis('all');
      setSelectedStudyTag('all');
    }

    setSelectedTermId(id);

    if (options.open) {
      setExpandedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    }

    if (options.scroll !== false) {
      setTimeout(() => {
        document.getElementById(`glossary-term-${id}`)?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 90);
    }
  };

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

      <main className="mx-auto max-w-[1600px] px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <h1 className="mb-2 text-xl font-bold text-gray-800 dark:text-gray-200">용어집</h1>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          논문 페이지에서 클릭한 용어는 여기에서 상세 정의와 관련 논문으로 이어집니다.
        </p>

        <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)_320px] xl:gap-5">
          <aside className="space-y-4 lg:sticky lg:top-24 lg:h-[calc(100vh-7rem)] lg:overflow-y-auto lg:pr-1">
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
          <div className="space-y-2 rounded-xl border border-gray-200 bg-white/80 p-3 dark:border-gray-700 dark:bg-gray-900/70">
            <p className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">
              백과사전 네비게이션 ({filteredSorted.length})
            </p>
            <div className="max-h-72 space-y-1 overflow-y-auto pr-1">
              {filteredSorted.map((term) => (
                <button
                  key={`nav-${term.id}`}
                  onClick={() => focusTerm(term.id, { open: true })}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition ${
                    selectedTermId === term.id
                      ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:ring-blue-800/60'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                  }`}
                >
                  <span className="line-clamp-1">{term.name}</span>
                  <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
                </button>
              ))}
              {filteredSorted.length === 0 && (
                <p className="px-2 py-6 text-center text-xs text-gray-400 dark:text-gray-500">
                  조건에 맞는 용어가 없습니다.
                </p>
              )}
            </div>
          </div>
          </aside>

          <section className="min-w-0">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {filteredSorted.length}개 용어 표시 중
              </p>
              <button
                onClick={() => setExpandedIds(filteredSorted.map((term) => term.id))}
                className="rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                전체 펼치기
              </button>
              <button
                onClick={() => setExpandedIds([])}
                className="rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                전체 접기
              </button>
            </div>

            <div className="space-y-3">
              {filteredSorted.map((term) => {
            const meta = CATEGORY_META[term.category];
            const Icon = meta.icon;
            const isExpanded = expandedIds.includes(term.id);
            const isSelected = selectedTermId === term.id;

            return (
              <div
                id={`glossary-term-${term.id}`}
                key={term.id}
                className={`rounded-xl bg-white shadow-sm transition dark:bg-gray-900 dark:shadow-none dark:ring-1 dark:ring-gray-800 ${
                  isSelected ? 'ring-2 ring-blue-200 dark:ring-blue-800/70' : ''
                }`}
              >
                <button
                  onClick={() => {
                    setSelectedTermId(term.id);
                    toggleExpanded(term.id);
                  }}
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
                  </div>
                )}
              </div>
            );
          })}

              {filteredSorted.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16">
                  <Search className="mb-3 h-8 w-8 text-gray-300 dark:text-gray-600" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">검색 결과가 없습니다.</p>
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-3 lg:sticky lg:top-24 lg:h-[calc(100vh-7rem)] lg:overflow-y-auto lg:pl-1">
            {selectedTerm && (
              <div className="rounded-xl border border-gray-200 bg-white/90 p-4 dark:border-gray-700 dark:bg-gray-900/80">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Similar Terms
                </p>
                <div className="space-y-1.5">
                  {relatedTerms.map((term) => {
                    const meta = CATEGORY_META[term.category];
                    return (
                      <button
                        key={`related-${term.id}`}
                        onClick={() => focusTerm(term.id, { resetFilters: true, open: true })}
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
                      >
                        <span
                          className="h-2 w-2 flex-shrink-0 rounded-full"
                          style={{ backgroundColor: meta.color }}
                        />
                        <span className="line-clamp-1 flex-1">{term.name}</span>
                        <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
                      </button>
                    );
                  })}
                  {relatedTerms.length === 0 && (
                    <p className="text-xs text-gray-400 dark:text-gray-500">유사 용어가 아직 없습니다.</p>
                  )}
                </div>
              </div>
            )}

            {selectedTerm && (
              <div className="rounded-xl border border-gray-200 bg-white/90 p-4 dark:border-gray-700 dark:bg-gray-900/80">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Related Papers
                </p>
                <div className="space-y-1.5">
                  {selectedTerm.related_paper_titles.map((title) => {
                    const paper = paperByTitle.get(title.toLowerCase());
                    if (!paper) {
                      return (
                        <p key={`side-${title}`} className="px-2 py-1.5 text-xs text-gray-400 dark:text-gray-500">
                          {title}
                        </p>
                      );
                    }

                    return (
                      <Link
                        key={`side-${title}`}
                        href={`/paper/${paper.id}`}
                        className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-gray-700 transition hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
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
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}
