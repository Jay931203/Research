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
  Minus,
  Plus,
  Star,
  Zap,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import { usePapersWithNotes } from '@/hooks/useNotes';
import { useRelationships } from '@/hooks/useRelationships';
import {
  buildBridgeRecommendations,
  buildPaperConnections,
  summarizeRelationship,
} from '@/lib/papers/insights';
import {
  FAMILIARITY_LABELS,
  FAMILIARITY_COLORS,
  getPaperCategoryLabel,
  inferResearchTopic,
  RELATIONSHIP_STYLES,
} from '@/lib/visualization/graphUtils';
import PaperEquations from '@/components/papers/PaperEquation';
import NoteEditor from '@/components/notes/NoteEditor';
import MarkdownContent from '@/components/common/MarkdownContent';
import { useGlossary, getTermsForPaper } from '@/hooks/useGlossary';
import GlossaryHighlighter from '@/components/glossary/GlossaryHighlighter';
import { useAppStore } from '@/store/useAppStore';
import katex from 'katex';

/* ------------------------------------------------------------------ */
/*  ToC Sections config                                                */
/* ------------------------------------------------------------------ */

const TOC_SECTIONS = [
  { id: 'section-overview', label: '개요', icon: BookOpen },
  { id: 'section-learning-guide', label: '학습 안내', icon: GraduationCap },
  { id: 'section-abstract', label: '초록', icon: FileText },
  { id: 'section-contributions', label: '주요 기여', icon: List },
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
  'cnn', 'conv', 'transformer', 'lstm', 'attention', 'encoder', 'decoder',
  'autoencoder', 'residual', 'resnet', 'unet', 'gan', 'vae', 'fc', 'dense',
  'pooling', 'batch norm', 'dropout', 'softmax', 'relu', 'gelu', 'sigmoid',
];

const OPTIMIZATION_TERM_IDS = new Set([
  'monotone-convergence-theorem',
  'alternating-optimization',
  'rate-distortion-optimization',
  'lagrangian-relaxation',
  'kkt-conditions',
  'bit-allocation-optimization',
]);

const CATEGORY_ARCH_HINTS: Record<string, string> = {
  autoencoder: 'Encoder -> Latent Space -> Decoder 구조',
  transformer: 'Self-Attention 기반 구조',
  cnn: 'Convolutional Neural Network 구조',
  csi_compression: 'CSI 피드백 압축/복원 파이프라인',
  representation_learning: '표현 학습 기반 사전학습/자기지도 파이프라인',
};

type AlgorithmStepCardData = {
  id: string;
  title: string;
  detail: string | null;
  keywords: string[];
  isArchitectureElement: boolean;
};

type ArchitectureCardData = {
  id: string;
  title: string;
  body: string;
  stepLabel: string | null;
};

const ALGO_LIST_PREFIX_PATTERN = /^\s*(?:step\s*)?\d+\s*[)\].:-]\s*/i;
const ALGO_SEPARATOR_PATTERN = /:\s+|\s+[-–—]\s+/;
const ALGO_KEYWORD_PATTERN =
  /\b(Eq\.\(\d+\)|Eq\.\d+|Stage\s*[A-Z]|K-means|STE|Lagrangian|Monotone Convergence Theorem|Alternating Optimization)\b/gi;

function hasArchKeyword(text: string): boolean {
  const lower = text.toLowerCase();
  return ARCH_KEYWORDS.some((kw) => lower.includes(kw));
}

function parseAlgorithmStep(text: string, idx: number): AlgorithmStepCardData {
  const compact = text.replace(/\s+/g, ' ').trim();
  const normalized = compact.replace(ALGO_LIST_PREFIX_PATTERN, '');

  let title = normalized;
  let detail: string | null = null;

  const separatorMatch = normalized.match(ALGO_SEPARATOR_PATTERN);
  if (separatorMatch && separatorMatch.index !== undefined) {
    const splitAt = separatorMatch.index;
    title = normalized.slice(0, splitAt).trim();
    detail = normalized.slice(splitAt + separatorMatch[0].length).trim() || null;
  }

  if (!detail && title.length > 72) {
    const lastSpace = title.lastIndexOf(' ', 72);
    if (lastSpace > 36) {
      detail = title.slice(lastSpace + 1).trim();
      title = title.slice(0, lastSpace).trim();
    }
  }

  if (detail && detail.length > 170) {
    detail = `${detail.slice(0, 167).trim()}...`;
  }

  const keywords = Array.from(
    new Set((normalized.match(ALGO_KEYWORD_PATTERN) ?? []).map((token) => token.trim())),
  ).slice(0, 3);

  return {
    id: `algo-step-${idx}`,
    title: title || `Step ${idx + 1}`,
    detail,
    keywords,
    isArchitectureElement: hasArchKeyword(normalized),
  };
}

function normalizeArchitectureMath(markdown: string): string {
  let normalized = markdown
    .replace(/\r\n?/g, '\n')
    .replace(/\u00A0/g, ' ')
    .replace(/[\u200B-\u200D\uFEFF]/g, '');

  normalized = normalized
    .replace(/\\\(([\s\S]*?)\\\)/g, (_, expr: string) => `$${expr.trim()}$`)
    .replace(/\\\[([\s\S]*?)\\\]/g, (_, expr: string) => `$$\n${expr.trim()}\n$$`);

  // Convert likely escaped line breaks while preserving LaTeX commands such as \nu or \nabla.
  normalized = normalized.replace(/\\n(?=[^A-Za-z])/g, '\n');

  return normalized;
}

function isArchitectureHeadingLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;
  if (/^##\s+/.test(trimmed)) return true;
  if (/^\d+\)\s+\S/.test(trimmed)) return true;
  if (/^\d+\.\d+(?:\.\d+)?\s+\S/.test(trimmed)) return true;
  return false;
}

function extractArchitectureChunks(content: string): string[] {
  const lines = content.split('\n');
  const headingIndices = lines
    .map((line, idx) => (isArchitectureHeadingLine(line) ? idx : -1))
    .filter((idx) => idx >= 0);

  if (!headingIndices.length) {
    return [content.trim()].filter(Boolean);
  }

  const chunks: string[] = [];
  const prefix = lines.slice(0, headingIndices[0]).join('\n').trim();
  if (prefix) {
    chunks.push(`## 개요\n${prefix}`);
  }

  for (let i = 0; i < headingIndices.length; i += 1) {
    const start = headingIndices[i];
    const end = i + 1 < headingIndices.length ? headingIndices[i + 1] : lines.length;
    const chunk = lines.slice(start, end).join('\n').trim();
    if (chunk) chunks.push(chunk);
  }

  return chunks;
}

function splitArchitectureSections(content: string): ArchitectureCardData[] {
  const normalized = normalizeArchitectureMath(content).trim();
  if (!normalized) return [];

  const chunks = extractArchitectureChunks(normalized);

  return chunks.map((chunk, idx) => {
    const lines = chunk.split('\n');
    const firstLine = lines[0]?.trim() ?? '';
    const headingMatch = firstLine.match(/^##\s+(.+)$/);
    const hasHeadingLine = headingMatch || isArchitectureHeadingLine(firstLine);
    const rawTitle = hasHeadingLine
      ? (headingMatch ? headingMatch[1].trim() : firstLine)
      : `아키텍처 파트 ${idx + 1}`;
    const body = hasHeadingLine ? lines.slice(1).join('\n').trim() : chunk;

    const numberedMatch = rawTitle.match(/^(\d+(?:\.\d+)*)\)?\s*[:.)-]?\s*(.+)$/);
    const stepLabel = numberedMatch ? `STEP ${numberedMatch[1]}` : null;
    const title = numberedMatch ? numberedMatch[2].trim() : rawTitle;

    return {
      id: `arch-card-${idx}`,
      title: title || `아키텍처 파트 ${idx + 1}`,
      body,
      stepLabel,
    };
  });
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
  const mapPaperIds = useAppStore((state) => state.mapPaperIds);
  const mapSelectionHydrated = useAppStore((state) => state.mapSelectionHydrated);
  const setMapPaperIds = useAppStore((state) => state.setMapPaperIds);
  const addMapPaper = useAppStore((state) => state.addMapPaper);
  const removeMapPaper = useAppStore((state) => state.removeMapPaper);

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

  const optimizationTerms = useMemo(
    () => paperTerms.filter((term) => OPTIMIZATION_TERM_IDS.has(term.id)),
    [paperTerms],
  );
  const architectureCards = splitArchitectureSections(paper?.architecture_detail ?? '');
  const mapPaperIdSet = useMemo(() => new Set(mapPaperIds ?? []), [mapPaperIds]);

  useEffect(() => {
    if (!mapSelectionHydrated) return;
    if (mapPaperIds !== null) return;
    if (!papers.length) return;
    setMapPaperIds(papers.map((entry) => entry.id));
  }, [mapSelectionHydrated, mapPaperIds, papers, setMapPaperIds]);

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

  const handleMapToggle = useCallback(() => {
    if (!paper) return;
    if (mapPaperIds === null) {
      const fullSet = papers.map((entry) => entry.id);
      setMapPaperIds(fullSet.filter((id) => id !== paper.id));
      return;
    }
    if (mapPaperIdSet.has(paper.id)) {
      removeMapPaper(paper.id);
      return;
    }
    addMapPaper(paper.id);
  }, [paper, mapPaperIds, papers, setMapPaperIds, mapPaperIdSet, removeMapPaper, addMapPaper]);

  /* ---------- loading / not found ---------- */

  if (papersLoading || relsLoading) {
    return <LoadingSkeleton />;
  }

  if (!paper) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Header />
        <div className="flex flex-col items-center justify-center pt-32">
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
      </div>
    );
  }

  const familiarityLevel = paper.familiarity_level ?? 'not_started';
  const familiarityColor = FAMILIARITY_COLORS[familiarityLevel] ?? '#9ca3af';
  const isInMap = mapPaperIds === null || mapPaperIdSet.has(paper.id);
  const algorithms = paper.algorithms ?? [];
  const algorithmSteps = algorithms.map((algo, idx) => parseAlgorithmStep(algo, idx));
  const archTags = (paper.tags ?? []).filter(hasArchKeyword);
  const inferredResearchTopic = inferResearchTopic(paper);
  const categoryArchHint =
    CATEGORY_ARCH_HINTS[paper.category] ??
    (inferredResearchTopic === 'representation_learning'
      ? CATEGORY_ARCH_HINTS.representation_learning
      : undefined);

  /* ================================================================ */
  /*  Render                                                           */
  /* ================================================================ */

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* -------- Shared Header -------- */}
      <Header />

      {/* -------- Reading Progress Bar -------- */}
      <div className="fixed left-0 top-16 z-40 h-0.5 bg-blue-500 transition-all" style={{ width: `${scrollProgress}%` }} />

      {/* -------- Breadcrumb Bar -------- */}
      <div className="border-b border-gray-200 bg-white px-4 py-2 dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex max-w-[calc(16rem+56rem)] items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-2 text-sm">
            <Link
              href="/dashboard"
              className="flex-shrink-0 text-gray-500 transition hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
            >
              대시보드
            </Link>
            <ChevronRight className="h-3 w-3 flex-shrink-0 text-gray-400" />
            <span className="truncate font-medium text-gray-800 dark:text-gray-200">
              {paper.title}
            </span>
          </div>
          <div className="flex flex-shrink-0 items-center gap-1">
            <button
              onClick={() => prevPaper && router.push(`/paper/${prevPaper.id}`)}
              disabled={!prevPaper}
              className="rounded-lg p-1.5 text-gray-500 transition hover:bg-gray-100 disabled:opacity-30 dark:text-gray-400 dark:hover:bg-gray-800"
              title={prevPaper ? `이전: ${prevPaper.title}` : '이전 논문 없음'}
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => nextPaper && router.push(`/paper/${nextPaper.id}`)}
              disabled={!nextPaper}
              className="rounded-lg p-1.5 text-gray-500 transition hover:bg-gray-100 disabled:opacity-30 dark:text-gray-400 dark:hover:bg-gray-800"
              title={nextPaper ? `다음: ${nextPaper.title}` : '다음 논문 없음'}
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* -------- Content Area (ToC + Main) -------- */}
      <div className="flex">
        {/* -------- Left ToC Sidebar (sticky) -------- */}
        <aside className="sticky top-20 hidden h-[calc(100vh-5rem)] w-64 flex-shrink-0 overflow-y-auto border-r border-gray-200 bg-gray-50/80 p-4 lg:block dark:border-gray-800 dark:bg-gray-900/80">
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
        <main className="min-w-0 flex-1">
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
                    {getPaperCategoryLabel(paper)}
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

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleMapToggle}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition ${
                      isInMap
                        ? 'border border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/30'
                        : 'border border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/30'
                    }`}
                  >
                    {isInMap ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                    {isInMap ? '관계 맵에서 제거' : '관계 맵에 추가'}
                  </button>
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
              </div>
            </section>

            {/* ===== Section: Learning Guide ===== */}
            {(paper.difficulty_level || paper.prerequisites?.length || paper.learning_objectives?.length) && (
            <section id="section-learning-guide" className="scroll-mt-20">
              <SectionHeading icon={<GraduationCap className="h-5 w-5" />} title="학습 안내" collapsed={!!collapsed['section-learning-guide']} onToggle={() => toggleSection('section-learning-guide')} />
              <div className={`overflow-hidden transition-all duration-300 ${collapsed['section-learning-guide'] ? 'max-h-0' : 'max-h-[2000px]'}`}>
              <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900 dark:shadow-none dark:ring-1 dark:ring-gray-800">
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

            {/* ===== Section 2: Abstract (with glossary highlights) ===== */}
            <section id="section-abstract" className="scroll-mt-20">
              <SectionHeading icon={<FileText className="h-5 w-5" />} title="초록" collapsed={!!collapsed['section-abstract']} onToggle={() => toggleSection('section-abstract')} />
              <div className={`overflow-hidden transition-all duration-300 ${collapsed['section-abstract'] ? 'max-h-0' : 'max-h-[2000px]'}`}>
              <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900 dark:shadow-none dark:ring-1 dark:ring-gray-800">
                {paper.abstract ? (
                  <p className="whitespace-pre-wrap text-base leading-relaxed text-gray-700 dark:text-gray-300">
                    <GlossaryHighlighter text={paper.abstract} terms={glossaryTerms} />
                  </p>
                ) : (
                  <p className="text-sm text-gray-400 dark:text-gray-500">초록이 등록되지 않았습니다.</p>
                )}
              </div>
              </div>
            </section>

            {/* ===== Section 3: Key Contributions (with glossary highlights) ===== */}
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
                        <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                          <GlossaryHighlighter text={contribution} terms={glossaryTerms} />
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 dark:text-gray-500">등록된 기여 정보가 없습니다.</p>
                )}
              </div>
              </div>
            </section>

            {/* ===== Section 5: Architecture (with glossary highlights) ===== */}
            <section id="section-architecture" className="scroll-mt-20">
              <SectionHeading icon={<Cpu className="h-5 w-5" />} title="아키텍처 & 모델 구조" collapsed={!!collapsed['section-architecture']} onToggle={() => toggleSection('section-architecture')} />
              <div className={`overflow-hidden transition-all duration-300 ${collapsed['section-architecture'] ? 'max-h-0' : 'max-h-[12000px]'}`}>
              <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900 dark:shadow-none dark:ring-1 dark:ring-gray-800">
                {architectureCards.length > 0 && (
                  <div className="mb-5 space-y-3">
                    {architectureCards.map((card, idx) => (
                      <article
                        key={card.id}
                        className="rounded-xl border border-indigo-100 bg-indigo-50/60 px-5 py-4 dark:border-indigo-900/40 dark:bg-indigo-900/20"
                      >
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <span
                            className="rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide text-white"
                            style={{ backgroundColor: paper.color_hex }}
                          >
                            {card.stepLabel ?? `파트 ${idx + 1}`}
                          </span>
                          <h4 className="text-sm font-semibold text-indigo-900 dark:text-indigo-100">
                            {card.title}
                          </h4>
                        </div>
                        {card.body ? (
                          <MarkdownContent
                            content={card.body}
                            className="text-sm leading-relaxed text-gray-700 dark:text-gray-300"
                            glossaryTerms={paperTerms}
                          />
                        ) : (
                          <p className="text-sm text-gray-500 dark:text-gray-400">상세 내용이 없습니다.</p>
                        )}
                      </article>
                    ))}
                  </div>
                )}

                {optimizationTerms.length > 0 && (
                  <div className="mb-5 rounded-lg border border-blue-100 bg-blue-50/70 px-4 py-3 dark:border-blue-900/40 dark:bg-blue-900/20">
                    <p className="mb-2 text-xs font-semibold text-blue-700 dark:text-blue-300">
                      최적화 핵심 용어
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {optimizationTerms.map((term) => (
                        <Link
                          key={term.id}
                          href={`/glossary?q=${encodeURIComponent(term.name)}`}
                          className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-200 transition hover:bg-white dark:bg-slate-900/50 dark:text-blue-300 dark:ring-blue-800"
                        >
                          {term.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {algorithmSteps.length > 0 ? (
                  <>
                    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-800/40">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">알고리즘 흐름 요약</p>
                        <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-500 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700">
                          {algorithmSteps.length}단계
                        </span>
                      </div>

                      <div className="overflow-x-auto pb-1">
                        <ol className="flex min-w-max items-stretch gap-3">
                          {algorithmSteps.map((step, idx) => (
                            <li key={step.id} className="flex items-center gap-3">
                              <article
                                className="w-64 rounded-2xl border p-4 shadow-sm dark:shadow-none"
                                style={{
                                  borderColor: `${paper.color_hex}55`,
                                  backgroundColor: `${paper.color_hex}10`,
                                }}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span
                                    className="rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide text-white"
                                    style={{ backgroundColor: paper.color_hex }}
                                  >
                                    STEP {idx + 1}
                                  </span>
                                  <span className="rounded-full border border-white/70 bg-white/80 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:border-slate-600 dark:bg-slate-900/40 dark:text-slate-300">
                                    {step.isArchitectureElement ? '모델 구성' : '학습/최적화'}
                                  </span>
                                </div>

                                <p className="mt-2 text-sm font-semibold leading-snug text-gray-800 dark:text-gray-100">
                                  {step.title}
                                </p>

                                {step.detail && (
                                  <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-gray-600 dark:text-gray-300">
                                    {step.detail}
                                  </p>
                                )}

                                {step.keywords.length > 0 && (
                                  <div className="mt-3 flex flex-wrap gap-1.5">
                                    {step.keywords.map((keyword) => (
                                      <span
                                        key={`${step.id}-${keyword}`}
                                        className="rounded-full border border-slate-300/80 bg-white/80 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:border-slate-600 dark:bg-slate-900/30 dark:text-slate-300"
                                      >
                                        {keyword}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </article>

                              {idx < algorithmSteps.length - 1 && (
                                <ChevronRight className="h-5 w-5 flex-shrink-0 text-slate-400 dark:text-slate-500" />
                              )}
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>

                    {archTags.length > 0 && (
                      <div className="mt-4 rounded-xl border border-gray-200 bg-white/70 p-4 dark:border-gray-700 dark:bg-gray-800/40">
                        <p className="mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400">연관 아키텍처 태그</p>
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

                    <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                      카테고리: {getPaperCategoryLabel(paper)}
                      {categoryArchHint ? ` · ${categoryArchHint}` : ''}
                    </p>
                  </>
                ) : !paper.architecture_detail ? (
                  <p className="text-sm text-gray-400 dark:text-gray-500">등록된 알고리즘 정보가 없습니다.</p>
                ) : null}
              </div>
              </div>
            </section>

            {/* ===== Section 6: Equations ===== */}
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
                                수식에서 사용하는 변수들을 확인해 보세요
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

            {/* ===== Section: Shared Techniques (tag cloud) ===== */}
            {paperTerms.length > 0 && (
            <section id="section-shared-techniques" className="scroll-mt-20">
              <SectionHeading icon={<Zap className="h-5 w-5" />} title="공통 기술" collapsed={!!collapsed['section-shared-techniques']} onToggle={() => toggleSection('section-shared-techniques')} />
              <div className={`overflow-hidden transition-all duration-300 ${collapsed['section-shared-techniques'] ? 'max-h-0' : 'max-h-[3000px]'}`}>
              <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900 dark:shadow-none dark:ring-1 dark:ring-gray-800">
                <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
                  이 논문에서 사용하는 핵심 기술 및 용어를 클릭하면 정의를 확인할 수 있습니다.
                </p>
                <div className="flex flex-wrap gap-2">
                  {paperTerms.map((term) => {
                    const catColors: Record<string, string> = {
                      architecture: '#3b82f6',
                      technique: '#8b5cf6',
                      metric: '#10b981',
                      domain: '#f59e0b',
                      training: '#ef4444',
                    };
                    const color = catColors[term.category] ?? '#6b7280';
                    return (
                      <GlossaryHighlighter key={term.id} text={term.name} terms={[term]} />
                    );
                  })}
                </div>
                <Link
                  href={
                    paperTerms[0]
                      ? `/glossary?q=${encodeURIComponent(paperTerms[0].name)}`
                      : '/glossary'
                  }
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
                <ConnectionList
                  title="이 논문이 참조한 방향"
                  items={outgoingConnections}
                  hoveredPaperId={hoveredPaperId}
                  onHover={setHoveredPaperId}
                  allPapers={papers}
                />

                <ConnectionList
                  title="이 논문을 참조한 방향"
                  items={incomingConnections}
                  hoveredPaperId={hoveredPaperId}
                  onHover={setHoveredPaperId}
                  allPapers={papers}
                />

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
                  onSave={async () => {
                    await refreshPapers();
                  }}
                />
              </div>
              </div>
            </section>

            {/* Bottom spacer */}
            <div className="h-16" />
          </div>
        </main>
      </div>
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
              {isHovered && (
                <div className="absolute left-0 top-full z-30 mt-1 w-72 rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    {item.otherPaper.year} · {getPaperCategoryLabel(item.otherPaper)}
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
      <Header />
      <div className="border-b border-gray-200 bg-white px-4 py-2 dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex max-w-[calc(16rem+56rem)] items-center gap-4">
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
      <div className="flex">
        <aside className="hidden w-64 flex-shrink-0 border-r border-gray-200 p-4 lg:block dark:border-gray-800">
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-8 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
            ))}
          </div>
        </aside>
        <main className="flex-1">
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
    </div>
  );
}

