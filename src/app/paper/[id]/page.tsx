'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChevronRight,
  Code,
  Cpu,
  ExternalLink,
  FileText,
  Hash,
  Layers,
  Link2,
  List,
  Sparkles,
  Star,
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
import katex from 'katex';

/* ------------------------------------------------------------------ */
/*  ToC Sections config                                                */
/* ------------------------------------------------------------------ */

const TOC_SECTIONS = [
  { id: 'section-overview', label: '개요', icon: BookOpen },
  { id: 'section-reminder', label: '핵심 리마인드', icon: Sparkles },
  { id: 'section-architecture', label: '아키텍처', icon: Cpu },
  { id: 'section-equations', label: '핵심 수식', icon: Hash },
  { id: 'section-contributions', label: '주요 기여', icon: List },
  { id: 'section-abstract', label: '초록', icon: FileText },
  { id: 'section-related', label: '연계 논문', icon: Link2 },
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
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
        <BookOpen className="mb-4 h-12 w-12 text-gray-300" />
        <h2 className="text-lg font-bold text-gray-700">논문을 찾을 수 없습니다</h2>
        <p className="mt-1 text-sm text-gray-500">ID: {paperId}</p>
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
    <div className="min-h-screen bg-gray-50">
      {/* -------- Top Navigation Bar -------- */}
      <nav className="fixed left-0 right-0 top-0 z-40 flex h-14 items-center justify-between border-b border-gray-200 bg-white/95 px-4 backdrop-blur-sm">
        <button
          onClick={() => router.push('/dashboard')}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">대시보드</span>
        </button>

        <h1 className="max-w-md truncate text-sm font-bold text-gray-800 lg:max-w-xl">
          {paper.title}
        </h1>

        <div className="flex items-center gap-1">
          <button
            onClick={() => prevPaper && router.push(`/paper/${prevPaper.id}`)}
            disabled={!prevPaper}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 disabled:opacity-30"
            title={prevPaper ? `이전: ${prevPaper.title}` : '이전 논문 없음'}
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => nextPaper && router.push(`/paper/${nextPaper.id}`)}
            disabled={!nextPaper}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 disabled:opacity-30"
            title={nextPaper ? `다음: ${nextPaper.title}` : '다음 논문 없음'}
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </nav>

      {/* -------- Left ToC Sidebar -------- */}
      <aside className="fixed left-0 top-14 hidden h-[calc(100vh-3.5rem)] w-64 overflow-y-auto border-r border-gray-200 bg-gray-50 p-4 lg:block">
        <p className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-400">목차</p>
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
                    ? 'border-l-2 border-blue-600 bg-blue-50 font-semibold text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
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
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span
                  className="rounded-full px-3 py-1 text-xs font-bold text-white"
                  style={{ backgroundColor: paper.color_hex }}
                >
                  {paper.year}
                </span>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
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

              <h2 className="text-2xl font-bold leading-tight text-gray-900">
                {paper.title}
              </h2>

              <p className="mt-2 text-sm text-gray-600">
                {paper.authors.join(', ')}
              </p>
              {paper.venue && (
                <p className="mt-1 text-sm italic text-gray-500">{paper.venue}</p>
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
                      className="inline-flex items-center gap-1.5 rounded-lg bg-gray-700 px-4 py-2 text-xs font-semibold text-white transition hover:bg-gray-800"
                    >
                      <Code className="h-3.5 w-3.5" />
                      Code
                    </a>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* ===== Section 2: Core Reminder ===== */}
          <section id="section-reminder" className="scroll-mt-20">
            <SectionHeading icon={<Sparkles className="h-5 w-5" />} title="핵심 리마인드" />
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <p className="rounded-lg bg-blue-50 px-4 py-3 text-sm font-medium leading-relaxed text-blue-900">
                {snapshot.oneLiner}
              </p>

              {!!snapshot.methods.length && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {snapshot.methods.map((method) => (
                    <span
                      key={method}
                      className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700"
                    >
                      {method}
                    </span>
                  ))}
                </div>
              )}

              {!!snapshot.rememberPoints.length && (
                <div className="mt-5">
                  <p className="mb-2 text-xs font-semibold text-gray-500">리마인드 체크포인트</p>
                  <ul className="space-y-2">
                    {snapshot.rememberPoints.map((point) => (
                      <li key={point} className="flex items-start gap-2.5 text-sm text-gray-700">
                        <span className="mt-[7px] h-2 w-2 flex-shrink-0 rounded-full bg-indigo-500" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {!!snapshot.expectedOutcomes.length && (
                <div className="mt-5">
                  <p className="mb-2 text-xs font-semibold text-gray-500">기대 기여/결과</p>
                  <ul className="space-y-2">
                    {snapshot.expectedOutcomes.map((outcome) => (
                      <li key={outcome} className="flex items-start gap-2.5 text-sm text-gray-700">
                        <span className="mt-[7px] h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
                        {outcome}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {!!snapshot.equationPreviews.length && (
                <div className="mt-5">
                  <p className="mb-2 text-xs font-semibold text-gray-500">핵심 수식</p>
                  <div className="grid gap-3 md:grid-cols-2">
                    {snapshot.equationPreviews.slice(0, 2).map((eq) => (
                      <EquationPreviewCard key={eq.name} equation={eq} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ===== Section 3: Architecture ===== */}
          <section id="section-architecture" className="scroll-mt-20">
            <SectionHeading icon={<Cpu className="h-5 w-5" />} title="아키텍처 & 모델 구조" />
            <div className="rounded-xl bg-white p-6 shadow-sm">
              {algorithms.length > 0 ? (
                <>
                  {/* Pipeline flow visualization */}
                  <div className="flex flex-wrap items-center gap-3">
                    {algorithms.map((algo, idx) => (
                      <div key={algo} className="flex items-center gap-3">
                        <div
                          className="rounded-lg border-2 px-4 py-3 text-center"
                          style={{
                            borderColor: paper.color_hex,
                            backgroundColor: `${paper.color_hex}08`,
                          }}
                        >
                          <p className="text-sm font-bold text-gray-800">{algo}</p>
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
                      <p className="mb-2 text-xs font-semibold text-gray-500">관련 아키텍처 태그</p>
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
                  <p className="mt-4 text-xs text-gray-400">
                    카테고리: {paper.category}
                    {paper.category === 'autoencoder' && ' — Encoder → Latent Space → Decoder 구조'}
                    {paper.category === 'transformer' && ' — Self-Attention 기반 구조'}
                    {paper.category === 'cnn' && ' — Convolutional Neural Network 구조'}
                    {paper.category === 'csi_compression' && ' — CSI 피드백 압축/복원 파이프라인'}
                  </p>
                </>
              ) : (
                <p className="text-sm text-gray-400">등록된 알고리즘 정보가 없습니다.</p>
              )}
            </div>
          </section>

          {/* ===== Section 4: Equations ===== */}
          <section id="section-equations" className="scroll-mt-20">
            <SectionHeading
              icon={<span className="text-base font-bold text-gray-500">f(x)</span>}
              title="핵심 수식"
            />
            <div className="rounded-xl bg-white p-6 shadow-sm">
              {paper.key_equations?.length ? (
                <div className="space-y-4">
                  {paper.key_equations.map((eq, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-gray-200 bg-gray-50/50 p-5"
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">
                          Eq. {idx + 1}
                        </span>
                        <span className="text-sm font-semibold text-gray-700">
                          {eq.name}
                        </span>
                      </div>
                      <div className="overflow-x-auto py-2">
                        <EquationRenderer latex={eq.latex} />
                      </div>
                      {eq.description && (
                        <p className="mt-3 text-sm leading-relaxed text-gray-600">
                          {eq.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">등록된 수식이 없습니다.</p>
              )}
            </div>
          </section>

          {/* ===== Section 5: Key Contributions ===== */}
          <section id="section-contributions" className="scroll-mt-20">
            <SectionHeading icon={<BookOpen className="h-5 w-5" />} title="주요 기여" />
            <div className="rounded-xl bg-white p-6 shadow-sm">
              {paper.key_contributions?.length ? (
                <div className="space-y-3">
                  {paper.key_contributions.map((contribution, idx) => (
                    <div
                      key={idx}
                      className="flex gap-4 rounded-lg border border-gray-100 bg-gray-50/60 px-4 py-3"
                    >
                      <span
                        className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                        style={{ backgroundColor: paper.color_hex }}
                      >
                        {idx + 1}
                      </span>
                      <p className="text-sm leading-relaxed text-gray-700">{contribution}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">등록된 기여 정보가 없습니다.</p>
              )}
            </div>
          </section>

          {/* ===== Section 6: Abstract ===== */}
          <section id="section-abstract" className="scroll-mt-20">
            <SectionHeading icon={<FileText className="h-5 w-5" />} title="초록" />
            <div className="rounded-xl bg-white p-6 shadow-sm">
              {paper.abstract ? (
                <p className="whitespace-pre-wrap text-base leading-relaxed text-gray-700">
                  {paper.abstract}
                </p>
              ) : (
                <p className="text-sm text-gray-400">초록이 등록되지 않았습니다.</p>
              )}
            </div>
          </section>

          {/* ===== Section 7: Related Papers ===== */}
          <section id="section-related" className="scroll-mt-20">
            <SectionHeading icon={<Link2 className="h-5 w-5" />} title="연계 논문" />
            <div className="rounded-xl bg-white p-6 shadow-sm">
              {/* Outgoing */}
              <ConnectionList
                title="이 논문이 참조한 방향"
                items={outgoingConnections}
              />

              {/* Incoming */}
              <ConnectionList
                title="이 논문을 참조한 방향"
                items={incomingConnections}
              />

              {/* Bridge recommendations */}
              {!!bridgeRecommendations.length && (
                <div className="mt-5 rounded-lg border border-gray-200 p-4">
                  <p className="mb-3 text-xs font-semibold text-gray-500">2-hop 추천 논문</p>
                  <div className="space-y-2">
                    {bridgeRecommendations.map((rec) => (
                      <Link
                        key={rec.paper.id}
                        href={`/paper/${rec.paper.id}`}
                        className="flex w-full items-center justify-between rounded-lg border border-gray-200 px-3 py-2.5 transition hover:bg-gray-50"
                      >
                        <div className="min-w-0 flex-1 pr-3">
                          <p className="line-clamp-1 text-sm font-medium text-gray-800">
                            {rec.paper.title}
                          </p>
                          <p className="line-clamp-1 text-[11px] text-gray-500">
                            점수 {rec.score} · {rec.reasons.join(' / ')}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-400" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {!outgoingConnections.length && !incomingConnections.length && !bridgeRecommendations.length && (
                <p className="text-sm text-gray-400">연결된 논문이 없습니다.</p>
              )}
            </div>
          </section>

          {/* ===== Section 8: Notes ===== */}
          <section id="section-notes" className="scroll-mt-20">
            <SectionHeading icon={<Layers className="h-5 w-5" />} title="학습 노트" />
            <div className="rounded-xl bg-white p-6 shadow-sm">
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

function SectionHeading({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="mb-3 flex items-center gap-2.5">
      <span className="text-gray-500">{icon}</span>
      <h3 className="text-lg font-bold text-gray-800">{title}</h3>
    </div>
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
      className="text-center"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function ConnectionList({
  title,
  items,
}: {
  title: string;
  items: ReturnType<typeof buildPaperConnections>;
}) {
  if (!items.length) return null;

  return (
    <div className="mb-5">
      <p className="mb-2 text-xs font-semibold text-gray-500">{title}</p>
      <div className="space-y-2">
        {items.slice(0, 8).map((item) => {
          const style = RELATIONSHIP_STYLES[item.relationship.relationship_type];
          return (
            <Link
              key={item.relationship.id}
              href={`/paper/${item.otherPaper.id}`}
              className="flex w-full items-center gap-3 rounded-lg border border-gray-200 p-3 transition hover:bg-gray-50"
            >
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-sm font-medium text-gray-800">
                  {item.otherPaper.title}
                </p>
                <p className="text-[11px] text-gray-500">
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
              <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-400" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed left-0 right-0 top-0 z-40 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4">
        <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-48 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
      </div>
      <main className="pt-14 lg:ml-64">
        <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-white p-6 shadow-sm">
              <div className="mb-3 h-5 w-32 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
              <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-gray-100" />
              <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-gray-100" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
