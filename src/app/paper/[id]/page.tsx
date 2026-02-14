'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Code,
  Cpu,
  ExternalLink,
  FileText,
  GraduationCap,
  Hash,
  Layers,
  Link2,
  List,
  Sparkles,
  Star,
  Zap,
} from 'lucide-react';
import { usePapersWithNotes } from '@/hooks/useNotes';
import { useRelationships } from '@/hooks/useRelationships';
import {
  buildBridgeRecommendations,
  buildPaperConnections,
  buildPaperCoreSnapshot,
  summarizeRelationship,
} from '@/lib/papers/insights';
import {
  FAMILIARITY_LABELS,
  FAMILIARITY_COLORS,
  RELATIONSHIP_STYLES,
} from '@/lib/visualization/graphUtils';
import EquationPreviewCard from '@/components/papers/EquationPreviewCard';
import PaperEquations from '@/components/papers/PaperEquation';
import NoteEditor from '@/components/notes/NoteEditor';
import { useGlossary, getTermsForPaper } from '@/hooks/useGlossary';
import katex from 'katex';

/* ------------------------------------------------------------------ */
/*  ToC Sections config                                                */
/* ------------------------------------------------------------------ */

const TOC_SECTIONS = [
  { id: 'section-overview', label: '개요', icon: BookOpen },
  { id: 'section-learning-guide', label: '학습 안내', icon: GraduationCap },
  { id: 'section-abstract', label: '초록', icon: FileText },
  { id: 'section-contributions', label: '주요 기여', icon: List },
  { id: 'section-reminder', label: '핵심 리마인드', icon: Sparkles },
  { id: 'section-architecture', label: '아키텍처', icon: Cpu },
  { id: 'section-equations', label: '핵심 수식', icon: Hash },
  { id: 'section-shared-techniques', label: '공통 기술', icon: Zap },
  { id: 'section-related', label: '연계 논문', icon: Link2 },
  { id: 'section-self-check', label: '셀프 체크', icon: CheckCircle2 },
  { id: 'section-notes', label: '학습 노트', icon: Layers },
] as const;

/* ------------------------------------------------------------------ */
/*  Architecture helpers                                               */
/* ------------------------------------------------------------------ */

const ARCH_KEYWORDS = [
  'cnn',
  'conv',
  'transformer',
  'lstm',
  'attention',
  'encoder',
  'decoder',
  'autoencoder',
  'residual',
  'resnet',
  'unet',
  'gan',
  'vae',
  'fc',
  'dense',
  'pooling',
  'batch norm',
  'dropout',
  'softmax',
  'relu',
  'gelu',
  'sigmoid',
];

function hasArchKeyword(text: string): boolean {
  const lower = text.toLowerCase();
  return ARCH_KEYWORDS.some((kw) => lower.includes(kw));
}

/* ================================================================== */
/*  Page Component                                                     */
/* ================================================================== */

export default function PaperStudyPage() {
  const router = useRouter();
  const params = useParams();
  const paperId = params.id as string;

  const { papers, isLoading: papersLoading, refresh: refreshPapers } = usePapersWithNotes();
  const { relationships, isLoading: relsLoading } = useRelationships();
  const { terms: glossaryTerms } = useGlossary();

  /* ---------- derived data ---------- */

  const paper = useMemo(
    () => papers.find((p) => p.id === paperId) ?? null,
    [papers, paperId],
  );

  const sortedPapers = useMemo(
    () => [...papers].sort((a, b) => b.year - a.year || a.title.localeCompare(b.title)),
    [papers],
  );

  const currentIndex = useMemo(
    () => sortedPapers.findIndex((p) => p.id === paperId),
    [sortedPapers, paperId],
  );

  const prevPaper = currentIndex > 0 ? sortedPapers[currentIndex - 1] : null;
  const nextPaper = currentIndex >= 0 && currentIndex < sortedPapers.length - 1
    ? sortedPapers[currentIndex + 1]
    : null;

  const snapshot = useMemo(() => {
    if (!paper) return null;
    return buildPaperCoreSnapshot(paper);
  }, [paper]);

  const connections = useMemo(() => {
    if (!paper) return [];
    return buildPaperConnections(paper.id, papers, relationships);
  }, [paper, papers, relationships]);

  const outgoingConnections = useMemo(
    () => connections.filter((c) => c.direction === 'outgoing'),
    [connections],
  );

  const incomingConnections = useMemo(
    () => connections.filter((c) => c.direction === 'incoming'),
    [connections],
  );

  const bridgeRecommendations = useMemo(() => {
    if (!paper) return [];
    return buildBridgeRecommendations(paper.id, papers, relationships, 4);
  }, [paper, papers, relationships]);

  const paperTerms = useMemo(() => {
    if (!paper) return [];
    return getTermsForPaper(glossaryTerms, paper.title);
  }, [paper, glossaryTerms]);

  /* ---------- IntersectionObserver for ToC highlight ---------- */

  const [activeSection, setActiveSection] = useState<string>(TOC_SECTIONS[0].id);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current?.disconnect();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0.1 },
    );

    for (const section of TOC_SECTIONS) {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    }

    observerRef.current = observer;
    return () => observer.disconnect();
  }, [paper]);

  /* ---------- keyboard shortcuts ---------- */

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ignore shortcuts when user is typing in an input/textarea
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.key === 'ArrowLeft' && prevPaper) {
        router.push(`/paper/${prevPaper.id}`);
      } else if (e.key === 'ArrowRight' && nextPaper) {
        router.push(`/paper/${nextPaper.id}`);
      } else if (e.key === 'Escape') {
        router.push('/dashboard');
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [router, prevPaper, nextPaper]);

  /* ---------- reading progress bar ---------- */

  const [scrollProgress, setScrollProgress] = useState(0);
  useEffect(() => {
    const handler = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  /* ---------- collapsible sections ---------- */

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const toggleSection = useCallback((sectionId: string) => {
    setCollapsed((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  }, []);

  /* ---------- equation expand ---------- */

  const [expandedEqs, setExpandedEqs] = useState<Set<number>>(new Set());
  const toggleEq = useCallback((idx: number) => {
    setExpandedEqs((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }, []);

  /* ---------- related paper hover preview ---------- */

  const [hoveredPaperId, setHoveredPaperId] = useState<string | null>(null);

  /* ---------- scroll helper ---------- */

  const scrollToSection = useCallback((sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  /* ---------- loading / not found ---------- */

  if (papersLoading || relsLoading) {
    return <LoadingSkeleton />;
  }

  if (!paper || !snapshot) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-950">
        <BookOpen className="mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
        <h2 className="text-lg font-bold text-gray-700 dark:text-gray-300">논문을 찾을 수 없습니다</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">ID: {paperId}</p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />
          대시보드로 돌아가기
        </Link>
      </div>
    );
  }

  const familiarityLevel = paper.familiarity_level ?? 'not_started';
  const familiarityColor = FAMILIARITY_COLORS[familiarityLevel] ?? '#9ca3af';
  const algorithms = paper.algorithms ?? [];
  const archTags = (paper.tags ?? []).filter(hasArchKeyword);

  /* ================================================================ */
  /*  Render                                                           */
  /* ================================================================ */

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* -------- Top Navigation Bar -------- */}
      <nav className="fixed left-0 right-0 top-0 z-40 flex h-14 items-center justify-between border-b border-gray-200 bg-white/95 px-4 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/95">
        <button
          onClick={() => router.push('/dashboard')}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">대시보드</span>
        </button>

        <h1 className="max-w-md truncate text-sm font-bold text-gray-800 lg:max-w-xl dark:text-gray-200">
          {paper.title}
        </h1>

        <div className="flex items-center gap-1">
          <button
            onClick={() => prevPaper && router.push(`/paper/${prevPaper.id}`)}
            disabled={!prevPaper}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 disabled:opacity-30 dark:text-gray-400 dark:hover:bg-gray-800"
            title={prevPaper ? `이전: ${prevPaper.title}` : '이전 논문 없음'}
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => nextPaper && router.push(`/paper/${nextPaper.id}`)}
            disabled={!nextPaper}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 disabled:opacity-30 dark:text-gray-400 dark:hover:bg-gray-800"
            title={nextPaper ? `다음: ${nextPaper.title}` : '다음 논문 없음'}
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </nav>

      {/* -------- Reading Progress Bar -------- */}
      <div className="fixed left-0 top-14 z-50 h-0.5 bg-blue-500 transition-all" style={{ width: `${scrollProgress}%` }} />

      {/* -------- Left ToC Sidebar -------- */}
      <aside className="fixed left-0 top-14 hidden h-[calc(100vh-3.5rem)] w-64 overflow-y-auto border-r border-gray-200 bg-gray-50 p-4 lg:block dark:border-gray-800 dark:bg-gray-900">
        <p className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">목차</p>
        <nav className="space-y-1">
          {TOC_SECTIONS.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition ${
                  isActive
                    ? 'border-l-2 border-blue-600 bg-blue-50 font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                }`}
              >
                <Icon className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`} />
                {section.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* -------- Main Content -------- */}
      <main className="pt-14 lg:ml-64">
        <div className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">

          {/* ===== Section 1: Overview ===== */}
          <section id="section-overview" className="scroll-mt-20">
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900 dark:shadow-none dark:ring-1 dark:ring-gray-800">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span
                  className="rounded-full px-3 py-1 text-xs font-bold text-white"
                  style={{ backgroundColor: paper.color_hex }}
                >
                  {paper.year}
                </span>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                  {paper.category}
                </span>
                <span
                  className="rounded-full px-3 py-1 text-xs font-semibold"
                  style={{
                    backgroundColor: `${familiarityColor}18`,
                    color: familiarityColor,
                  }}
                >
                  {FAMILIARITY_LABELS[familiarityLevel]}
                </span>
                {paper.is_favorite && (
                  <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                )}
              </div>

              <h2 className="text-2xl font-bold leading-tight text-gray-900 dark:text-gray-100">
                {paper.title}
              </h2>

              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {paper.authors.join(', ')}
              </p>
              {paper.venue && (
                <p className="mt-1 text-sm italic text-gray-500 dark:text-gray-400">{paper.venue}</p>
              )}

              {!!paper.tags?.length && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {paper.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                      style={{
                        backgroundColor: `${paper.color_hex}15`,
                        color: paper.color_hex,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {(paper.pdf_url || paper.code_url) && (
                <div className="mt-5 flex items-center gap-3">
                  {paper.pdf_url && (
                    <a
                      href={paper.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      PDF
                    </a>
                  )}
                  {paper.code_url && (
                    <a
                      href={paper.code_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-gray-700 px-4 py-2 text-xs font-semibold text-white transition hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500"
                    >
                      <Code className="h-3.5 w-3.5" />
                      Code
                    </a>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* ===== Section: Learning Guide ===== */}
          {(paper.difficulty_level || paper.prerequisites?.length || paper.learning_objectives?.length) && (
          <section id="section-learning-guide" className="scroll-mt-20">
            <SectionHeading icon={<GraduationCap className="h-5 w-5" />} title="학습 안내" collapsed={!!collapsed['section-learning-guide']} onToggle={() => toggleSection('section-learning-guide')} />
            <div className={`overflow-hidden transition-all duration-300 ${collapsed['section-learning-guide'] ? 'max-h-0' : 'max-h-[2000px]'}`}>
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900 dark:shadow-none dark:ring-1 dark:ring-gray-800">
              {/* Difficulty badge */}
              {paper.difficulty_level && (
                <div className="mb-4">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                    paper.difficulty_level === 'beginner'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                      : paper.difficulty_level === 'intermediate'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                  }`}>
                    {paper.difficulty_level === 'beginner' ? '입문' : paper.difficulty_level === 'intermediate' ? '중급' : '고급'}
                  </span>
                </div>
              )}

              {/* Prerequisites */}
              {!!paper.prerequisites?.length && (
                <div className="mb-5">
                  <p className="mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400">선행 지식</p>
                  <ul className="space-y-1.5">
                    {paper.prerequisites.map((prereq, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400" />
                        {prereq}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Learning objectives */}
              {!!paper.learning_objectives?.length && (
                <div>
                  <p className="mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400">학습 목표</p>
                  <ul className="space-y-1.5">
                    {paper.learning_objectives.map((obj, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                        {obj}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            </div>
          </section>
          )}

          {/* ===== Section 2: Abstract ===== */}
          <section id="section-abstract" className="scroll-mt-20">
            <SectionHeading icon={<FileText className="h-5 w-5" />} title="초록" collapsed={!!collapsed['section-abstract']} onToggle={() => toggleSection('section-abstract')} />
            <div className={`overflow-hidden transition-all duration-300 ${collapsed['section-abstract'] ? 'max-h-0' : 'max-h-[2000px]'}`}>
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900 dark:shadow-none dark:ring-1 dark:ring-gray-800">
              {paper.abstract ? (
                <p className="whitespace-pre-wrap text-base leading-relaxed text-gray-700 dark:text-gray-300">
                  {paper.abstract}
                </p>
              ) : (
                <p className="text-sm text-gray-400 dark:text-gray-500">초록이 등록되지 않았습니다.</p>
              )}
            </div>
            </div>
          </section>

          {
/* ===== Section 3: Key Contributions ===== */}
          <section id="section-contributions" className="scroll-mt-20">
            <SectionHeading icon={<BookOpen className="h-5 w-5" />} title="주요 기여" collapsed={!!collapsed['section-contributions']} onToggle={() => toggleSection('section-contributions')} />
            <div className={`overflow-hidden transition-all duration-300 ${collapsed['section-contributions'] ? 'max-h-0' : 'max-h-[2000px]'}`}>
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900 dark:shadow-none dark:ring-1 dark:ring-gray-800">
              {paper.key_contributions?.length ? (
                <div className="space-y-3">
                  {paper.key_contributions.map((contribution, idx) => (
                    <div
                      key={idx}
                      className="flex gap-4 rounded-lg border border-gray-100 bg-gray-50/60 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/60"
                    >
                      <span
                        className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                        style={{ backgroundColor: paper.color_hex }}
                      >
                        {idx + 1}
                      </span>
                      <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">{contribution}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 dark:text-gray-500">등록된 기여 정보가 없습니다.</p>
              )}
            </div>
            </div>
          </section>

          {
/* ===== Section 4: Core Reminder ===== */}
          <section id="section-reminder" className="scroll-mt-20">
            <SectionHeading icon={<Sparkles className="h-5 w-5" />} title="핵심 리마인드" collapsed={!!collapsed['section-reminder']} onToggle={() => toggleSection('section-reminder')} />
            <div className={`overflow-hidden transition-all duration-300 ${collapsed['section-reminder'] ? 'max-h-0' : 'max-h-[2000px]'}`}>
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900 dark:shadow-none dark:ring-1 dark:ring-gray-800">
              <p className="rounded-lg bg-blue-50 px-4 py-3 text-sm font-medium leading-relaxed text-blue-900 dark:bg-blue-900/20 dark:text-blue-100">
                {snapshot.oneLiner}
              </p>

              {!!snapshot.methods.length && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {snapshot.methods.map((method) => (
                    <span
                      key={method}
                      className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-200"
                    >
                      {method}
                    </span>
                  ))}
                </div>
              )}

              {!!snapshot.rememberPoints.length && (
                <div className="mt-5">
                  <p className="mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400">리마인드 체크포인트</p>
                  <ul className="space-y-2">
                    {snapshot.rememberPoints.map((point) => (
                      <li key={point} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                        <span className="mt-[7px] h-2 w-2 flex-shrink-0 rounded-full bg-indigo-500" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {!!snapshot.expectedOutcomes.length && (
                <div className="mt-5">
                  <p className="mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400">기대 기여/결과</p>
                  <ul className="space-y-2">
                    {snapshot.expectedOutcomes.map((outcome) => (
                      <li key={outcome} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                        <span className="mt-[7px] h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
                        {outcome}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {!!snapshot.equationPreviews.length && (
                <div className="mt-5">
                  <p className="mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400">핵심 수식</p>
                  <div className="grid gap-3 md:grid-cols-2">
                    {snapshot.equationPreviews.slice(0, 2).map((eq) => (
                      <EquationPreviewCard key={eq.name} equation={eq} />
                    ))}
                  </div>
                </div>
              )}
            </div>
            </div>
          </section>

          {
/* ===== Section 5: Architecture ===== */}
          <section id="section-architecture" className="scroll-mt-20">
            <SectionHeading icon={<Cpu className="h-5 w-5" />} title="아키텍처 & 모델 구조" collapsed={!!collapsed['section-architecture']} onToggle={() => toggleSection('section-architecture')} />
            <div className={`overflow-hidden transition-all duration-300 ${collapsed['section-architecture'] ? 'max-h-0' : 'max-h-[2000px]'}`}>
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900 dark:shadow-none dark:ring-1 dark:ring-gray-800">
              {/* Architecture Detail Description */}
              {paper.architecture_detail && (
                <div className="mb-5 rounded-lg bg-indigo-50/70 px-5 py-4 dark:bg-indigo-900/20">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                    {paper.architecture_detail}
                  </p>
                </div>
              )}

              {algorithms.length > 0 ? (
                <>
                  {/* Pipeline flow visualization */}
                  <p className="mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400">처리 파이프라인</p>
                  <div className="flex flex-wrap items-center gap-3">
                    {algorithms.map((algo, idx) => (
                      <div key={algo} className="flex items-center gap-3">
                        <div
                          className="cursor-pointer rounded-lg border-2 px-4 py-3 text-center transition-transform hover:scale-105"
                          style={{
                            borderColor: paper.color_hex,
                            backgroundColor: `${paper.color_hex}08`,
                          }}
                        >
                          <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{algo}</p>
                          {hasArchKeyword(algo) && (
                            <p
                              className="mt-0.5 text-[10px] font-medium"
                              style={{ color: paper.color_hex }}
                            >
                              핵심 구성요소
                            </p>
                          )}
                        </div>
                        {idx < algorithms.length - 1 && (
                          <ChevronRight
                            className="h-5 w-5 flex-shrink-0"
                            style={{ color: paper.color_hex }}
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Architecture-highlighted tags */}
                  {archTags.length > 0 && (
                    <div className="mt-5">
                      <p className="mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400">관련 아키텍처 태그</p>
                      <div className="flex flex-wrap gap-2">
                        {archTags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border px-3 py-1 text-xs font-semibold"
                            style={{
                              borderColor: paper.color_hex,
                              color: paper.color_hex,
                              backgroundColor: `${paper.color_hex}10`,
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Category context hint */}
                  <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">
                    카테고리: {paper.category}
                    {paper.category === 'autoencoder' && ' — Encoder → Latent Space → Decoder 구조'}
                    {paper.category === 'transformer' && ' — Self-Attention 기반 구조'}
                    {paper.category === 'cnn' && ' — Convolutional Neural Network 구조'}
                    {paper.category === 'csi_compression' && ' — CSI 피드백 압축/복원 파이프라인'}
                  </p>
                </>
              ) : !paper.architecture_detail ? (
                <p className="text-sm text-gray-400 dark:text-gray-500">등록된 알고리즘 정보가 없습니다.</p>
              ) : null}
            </div>
            </div>
          </section>

          {
/* ===== Section 6: Equations ===== */}
          <section id="section-equations" className="scroll-mt-20">
            <SectionHeading
              icon={<span className="text-base font-bold text-gray-500 dark:text-gray-400">f(x)</span>}
              title="핵심 수식"
              collapsed={!!collapsed['section-equations']}
              onToggle={() => toggleSection('section-equations')}
            />
            <div className={`overflow-hidden transition-all duration-300 ${collapsed['section-equations'] ? 'max-h-0' : 'max-h-[2000px]'}`}>
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900 dark:shadow-none dark:ring-1 dark:ring-gray-800">
              {paper.key_equations?.length ? (
                <div className="space-y-4">
                  {paper.key_equations.map((eq, idx) => (
                    <div
                      key={idx}
                      className="cursor-pointer rounded-xl border border-gray-200 bg-gray-50/50 p-5 transition-colors hover:border-blue-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-700"
                      onClick={() => toggleEq(idx)}
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                          Eq. {idx + 1}
                        </span>
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {eq.name}
                        </span>
                        <ChevronDown className={`ml-auto h-4 w-4 text-gray-400 transition-transform dark:text-gray-500 ${expandedEqs.has(idx) ? 'rotate-180' : ''}`} />
                      </div>
                      <div className="overflow-x-auto py-2 text-gray-900 dark:text-gray-100">
                        <EquationRenderer latex={eq.latex} />
                      </div>
                      {expandedEqs.has(idx) && eq.description && (
                        <div className="mt-3 rounded-lg bg-blue-50 px-4 py-3 dark:bg-blue-900/20">
                          <p className="text-sm leading-relaxed text-blue-900 dark:text-blue-100">
                            {eq.description}
                          </p>
                          {eq.description.match(/[A-Z_\\]/) && (
                            <p className="mt-2 text-xs text-blue-700 dark:text-blue-300">
                              수식에서 사용되는 변수들을 확인하세요.
                            </p>
                          )}
                        </div>
                      )}
                      {!expandedEqs.has(idx) && eq.description && (
                        <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">클릭하여 상세 설명 보기</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 dark:text-gray-500">등록된 수식이 없습니다.</p>
              )}
            </div>
            </div>
          </section>

          {/* ===== Section: Shared Techniques ===== */}
          {paperTerms.length > 0 && (
          <section id="section-shared-techniques" className="scroll-mt-20">
            <SectionHeading icon={<Zap className="h-5 w-5" />} title="공통 기술" collapsed={!!collapsed['section-shared-techniques']} onToggle={() => toggleSection('section-shared-techniques')} />
            <div className={`overflow-hidden transition-all duration-300 ${collapsed['section-shared-techniques'] ? 'max-h-0' : 'max-h-[3000px]'}`}>
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900 dark:shadow-none dark:ring-1 dark:ring-gray-800">
              <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
                이 논문에서 사용된 핵심 기술 · 다른 논문과의 연결 고리를 확인하세요
              </p>
              <div className="space-y-4">
                {paperTerms.map((term) => (
                  <div key={term.id} className="rounded-lg border border-gray-100 bg-gray-50/60 p-4 dark:border-gray-700 dark:bg-gray-800/60">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{term.name}</span>
                      {term.aliases.length > 0 && (
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          ({term.aliases.slice(0, 2).join(', ')})
                        </span>
                      )}
                    </div>
                    <p className="mb-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                      {term.description}
                    </p>
                    {/* Other papers using this technique */}
                    {term.related_paper_titles.filter(
                      (t) => t.toLowerCase() !== paper.title.toLowerCase()
                    ).length > 0 && (
                      <div>
                        <p className="mb-1 text-[11px] font-semibold text-gray-400 dark:text-gray-500">
                          같은 기술을 사용하는 다른 논문
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {term.related_paper_titles
                            .filter((t) => t.toLowerCase() !== paper.title.toLowerCase())
                            .slice(0, 5)
                            .map((title) => {
                              const related = papers.find(
                                (p) => p.title.toLowerCase() === title.toLowerCase()
                              );
                              if (related) {
                                return (
                                  <Link
                                    key={title}
                                    href={`/paper/${related.id}`}
                                    className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-600 transition hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                                  >
                                    <span
                                      className="h-1.5 w-1.5 rounded-full"
                                      style={{ backgroundColor: related.color_hex }}
                                    />
                                    <span className="max-w-[160px] truncate">{related.title}</span>
                                  </Link>
                                );
                              }
                              return null;
                            })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <Link
                href="/glossary"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 transition hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                전체 용어집 보기
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            </div>
          </section>
          )}

          {/* ===== Section 7: Related Papers ===== */}
          <section id="section-related" className="scroll-mt-20">
            <SectionHeading icon={<Link2 className="h-5 w-5" />} title="연계 논문" collapsed={!!collapsed['section-related']} onToggle={() => toggleSection('section-related')} />
            <div className={`overflow-hidden transition-all duration-300 ${collapsed['section-related'] ? 'max-h-0' : 'max-h-[2000px]'}`}>
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900 dark:shadow-none dark:ring-1 dark:ring-gray-800">
              {/* Outgoing */}
              <ConnectionList
                title="이 논문이 참조한 방향"
                items={outgoingConnections}
                hoveredPaperId={hoveredPaperId}
                onHover={setHoveredPaperId}
                allPapers={papers}
              />

              {/* Incoming */}
              <ConnectionList
                title="이 논문을 참조한 방향"
                items={incomingConnections}
                hoveredPaperId={hoveredPaperId}
                onHover={setHoveredPaperId}
                allPapers={papers}
              />

              {/* Bridge recommendations */}
              {!!bridgeRecommendations.length && (
                <div className="mt-5 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                  <p className="mb-3 text-xs font-semibold text-gray-500 dark:text-gray-400">2-hop 추천 논문</p>
                  <div className="space-y-2">
                    {bridgeRecommendations.map((rec) => (
                      <Link
                        key={rec.paper.id}
                        href={`/paper/${rec.paper.id}`}
                        className="flex w-full items-center justify-between rounded-lg border border-gray-200 px-3 py-2.5 transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                      >
                        <div className="min-w-0 flex-1 pr-3">
                          <p className="line-clamp-1 text-sm font-medium text-gray-800 dark:text-gray-200">
                            {rec.paper.title}
                          </p>
                          <p className="line-clamp-1 text-[11px] text-gray-500 dark:text-gray-400">
                            점수 {rec.score} · {rec.reasons.join(' / ')}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {!outgoingConnections.length && !incomingConnections.length && !bridgeRecommendations.length && (
                <p className="text-sm text-gray-400 dark:text-gray-500">연결된 논문이 없습니다.</p>
              )}
            </div>
            </div>
          </section>

          {/* ===== Section: Self Check ===== */}
          {!!paper.self_check_questions?.length && (
          <section id="section-self-check" className="scroll-mt-20">
            <SectionHeading icon={<CheckCircle2 className="h-5 w-5" />} title="셀프 체크" collapsed={!!collapsed['section-self-check']} onToggle={() => toggleSection('section-self-check')} />
            <div className={`overflow-hidden transition-all duration-300 ${collapsed['section-self-check'] ? 'max-h-0' : 'max-h-[2000px]'}`}>
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900 dark:shadow-none dark:ring-1 dark:ring-gray-800">
              <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
                이 논문을 충분히 이해했는지 스스로 확인해 보세요
              </p>
              <div className="space-y-3">
                {paper.self_check_questions.map((question, idx) => (
                  <div
                    key={idx}
                    className="flex gap-3 rounded-lg border border-gray-100 bg-gray-50/60 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/60"
                  >
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300">
                      Q{idx + 1}
                    </span>
                    <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">{question}</p>
                  </div>
                ))}
              </div>
            </div>
            </div>
          </section>
          )}

          {/* ===== Section 8: Notes ===== */}
          <section id="section-notes" className="scroll-mt-20">
            <SectionHeading icon={<Layers className="h-5 w-5" />} title="학습 노트" collapsed={!!collapsed['section-notes']} onToggle={() => toggleSection('section-notes')} />
            <div className={`overflow-hidden transition-all duration-300 ${collapsed['section-notes'] ? 'max-h-0' : 'max-h-[2000px]'}`}>
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900 dark:shadow-none dark:ring-1 dark:ring-gray-800">
              <NoteEditor
                paperId={paper.id}
                initialContent={paper.note_content || ''}
                initialFamiliarity={paper.familiarity_level || 'not_started'}
                initialFavorite={paper.is_favorite || false}
                initialImportance={paper.importance_rating || 0}
                initialTags={paper.personal_tags || []}
                onSave={refreshPapers}
              />
            </div>
            </div>
          </section>

          {/* Bottom spacer */}
          <div className="h-16" />
        </div>
      </main>
    </div>
  );
}

/* ================================================================== */
/*  Sub-components                                                     */
/* ================================================================== */

function SectionHeading({ icon, title, collapsed, onToggle }: { icon: React.ReactNode; title: string; collapsed?: boolean; onToggle?: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="mb-3 flex w-full items-center gap-2.5 text-left"
    >
      <span className="text-gray-500 dark:text-gray-400">{icon}</span>
      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">{title}</h3>
      {onToggle && (
        <ChevronDown className={`ml-auto h-5 w-5 text-gray-400 transition-transform dark:text-gray-500 ${collapsed ? '-rotate-90' : ''}`} />
      )}
    </button>
  );
}

function EquationRenderer({ latex }: { latex: string }) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(latex, {
        throwOnError: false,
        displayMode: true,
        trust: true,
      });
    } catch {
      return null;
    }
  }, [latex]);

  if (!html) {
    return (
      <code className="block text-center text-sm text-red-500">{latex}</code>
    );
  }

  return (
    <div
      className="text-center text-gray-900 dark:text-gray-100"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function ConnectionList({
  title,
  items,
  hoveredPaperId,
  onHover,
  allPapers,
}: {
  title: string;
  items: ReturnType<typeof buildPaperConnections>;
  hoveredPaperId?: string | null;
  onHover?: (id: string | null) => void;
  allPapers?: ReturnType<typeof buildPaperConnections>[0]['otherPaper'][];
}) {
  if (!items.length) return null;

  return (
    <div className="mb-5">
      <p className="mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400">{title}</p>
      <div className="space-y-2">
        {items.slice(0, 8).map((item) => {
          const style = RELATIONSHIP_STYLES[item.relationship.relationship_type];
          const isHovered = hoveredPaperId === item.otherPaper.id;
          return (
            <div key={item.relationship.id} className="relative">
              <Link
                href={`/paper/${item.otherPaper.id}`}
                className="flex w-full items-center gap-3 rounded-lg border border-gray-200 p-3 transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                onMouseEnter={() => onHover?.(item.otherPaper.id)}
                onMouseLeave={() => onHover?.(null)}
              >
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-medium text-gray-800 dark:text-gray-200">
                    {item.otherPaper.title}
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    {item.otherPaper.year} ·{' '}
                    {summarizeRelationship(item.relationship.relationship_type, item.direction)}
                  </p>
                </div>
                <span
                  className="whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-semibold"
                  style={{ backgroundColor: `${style.color}20`, color: style.color }}
                >
                  {style.label} {item.relationship.strength}/10
                </span>
                <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500" />
              </Link>
              {/* Hover preview popover */}
              {isHovered && (
                <div className="absolute left-0 top-full z-30 mt-1 w-72 rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    {item.otherPaper.year} · {item.otherPaper.category}
                  </p>
                  {item.otherPaper.key_contributions?.[0] && (
                    <p className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
                      {item.otherPaper.key_contributions[0]}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="fixed left-0 right-0 top-0 z-40 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-4 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      </div>
      <main className="pt-14 lg:ml-64">
        <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900 dark:shadow-none dark:ring-1 dark:ring-gray-800">
              <div className="mb-3 h-5 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-4 w-full animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
              <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
              <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
