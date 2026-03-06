'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/layout/Header';
import CommandPalette from '@/components/common/CommandPalette';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useGlossary } from '@/hooks/useGlossary';
import { GlossaryTermsContext } from '@/components/glossary/GlossaryContext';
import GlossaryHighlighter from '@/components/glossary/GlossaryHighlighter';
import { ArrowLeft, ArrowRight, Beaker, BookOpen, Search, X } from 'lucide-react';
import Link from 'next/link';

/* ------------------------------------------------------------------ */
/*  Artifact metadata type                                             */
/* ------------------------------------------------------------------ */

interface ArtifactMeta {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  color: string; // tailwind color name like 'emerald', 'blue', 'purple'
  relatedArtifacts?: string[]; // other artifact IDs
  relatedPapers?: Array<{ title: string; paperId: string }>; // links to paper study pages
}

/* ------------------------------------------------------------------ */
/*  Category definitions                                               */
/* ------------------------------------------------------------------ */

const ARTIFACT_CATEGORIES = [
  { id: 'sparsity-norms', label: '희소성 & 노름', color: 'emerald' },
  { id: 'metrics', label: '성능 지표', color: 'amber' },
  { id: 'optimization', label: '최적화', color: 'amber' },
] as const;

/* ------------------------------------------------------------------ */
/*  Artifact registry                                                  */
/* ------------------------------------------------------------------ */

const ARTIFACTS: ArtifactMeta[] = [
  {
    id: 'hoyer-sparsity',
    title: 'Hoyer Sparsity',
    description:
      'L1/L2 노름 비율로 벡터의 희소성을 측정하는 Hoyer 지표를 직접 조작하며 이해합니다.',
    category: 'sparsity-norms',
    tags: ['L1', 'L2', '희소성', 'LASSO', 'CSI 압축'],
    color: 'emerald',
    relatedArtifacts: ['nmse-limitation'],
    relatedPapers: [],
  },
  {
    id: 'nmse-limitation',
    title: 'NMSE의 한계',
    description:
      'NMSE가 진폭·방향 오차를 동일하게 취급하는 문제를 2D 벡터 비교로 확인합니다.',
    category: 'metrics',
    tags: ['NMSE', 'Cosine Similarity', 'Beamforming Gain', 'CSI 피드백'],
    color: 'amber',
    relatedArtifacts: ['hoyer-sparsity'],
    relatedPapers: [
      { title: 'CsiFBNet', paperId: '502d012f-9270-4f91-9d04-b32f8bf179a2' },
      { title: 'Carpi (Precoding-Oriented)', paperId: 'c30301c0-da07-4000-8945-b65cd0891f65' },
    ],
  },
  {
    id: 'hessian-curvature',
    title: 'Hessian 곡률과 양자화',
    description:
      'Hessian 행렬의 고유값이 파라미터별 민감도를 결정하는 원리를 확인합니다.',
    category: 'optimization',
    tags: ['Hessian', '곡률', '양자화', 'Mixed-Precision', 'BRECQ'],
    color: 'amber',
    relatedArtifacts: ['hoyer-sparsity'],
    relatedPapers: [],
  },
];

/* ------------------------------------------------------------------ */
/*  Lazy-loaded artifact components                                    */
/* ------------------------------------------------------------------ */

const ARTIFACT_COMPONENTS: Record<string, React.ComponentType> = {
  'hoyer-sparsity': dynamic(
    () => import('@/components/artifacts/HoyerSparsityViz'),
    {
      ssr: false,
      loading: () => (
        <div className="flex h-64 items-center justify-center text-gray-400 dark:text-gray-500">
          로딩 중...
        </div>
      ),
    },
  ),
  'nmse-limitation': dynamic(
    () => import('@/components/artifacts/NmseLimitationViz'),
    {
      ssr: false,
      loading: () => (
        <div className="flex h-64 items-center justify-center text-gray-400 dark:text-gray-500">
          로딩 중...
        </div>
      ),
    },
  ),
  'hessian-curvature': dynamic(
    () => import('@/components/my-research/infographics/HessianCurvatureViz'),
    { ssr: false, loading: () => <div className="flex h-64 items-center justify-center text-gray-400 dark:text-gray-500">로딩 중...</div> },
  ),
};

/* ------------------------------------------------------------------ */
/*  Color utility — maps category color names to Tailwind classes       */
/* ------------------------------------------------------------------ */

const COLOR_MAP: Record<string, { border: string; bg: string; text: string; badge: string }> = {
  emerald: {
    border: 'border-l-emerald-500 dark:border-l-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    text: 'text-emerald-700 dark:text-emerald-300',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
  },
  blue: {
    border: 'border-l-blue-500 dark:border-l-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    text: 'text-blue-700 dark:text-blue-300',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  },
  purple: {
    border: 'border-l-purple-500 dark:border-l-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    text: 'text-purple-700 dark:text-purple-300',
    badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
  },
  amber: {
    border: 'border-l-amber-500 dark:border-l-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    text: 'text-amber-700 dark:text-amber-300',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
  },
  rose: {
    border: 'border-l-rose-500 dark:border-l-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-950/30',
    text: 'text-rose-700 dark:text-rose-300',
    badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300',
  },
  sky: {
    border: 'border-l-sky-500 dark:border-l-sky-400',
    bg: 'bg-sky-50 dark:bg-sky-950/30',
    text: 'text-sky-700 dark:text-sky-300',
    badge: 'bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300',
  },
};

function getColorClasses(color: string) {
  return COLOR_MAP[color] ?? COLOR_MAP.emerald;
}

/* ================================================================== */
/*  Page Component                                                     */
/* ================================================================== */

export default function ArtifactsPage() {
  const { isCommandPaletteOpen, openCommandPalette, closeCommandPalette } =
    useKeyboardShortcuts();
  const { terms: glossaryTerms } = useGlossary();

  const [selectedArtifactId, setSelectedArtifactId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  /* ---------- Derived data ---------- */

  const selectedArtifact = useMemo(
    () => ARTIFACTS.find((a) => a.id === selectedArtifactId) ?? null,
    [selectedArtifactId],
  );

  const filteredArtifacts = useMemo(() => {
    if (!searchQuery.trim()) return ARTIFACTS;
    const q = searchQuery.toLowerCase();
    return ARTIFACTS.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }, [searchQuery]);

  const artifactsByCategory = useMemo(() => {
    const map = new Map<string, ArtifactMeta[]>();
    for (const cat of ARTIFACT_CATEGORIES) {
      map.set(cat.id, []);
    }
    for (const artifact of filteredArtifacts) {
      const list = map.get(artifact.category);
      if (list) list.push(artifact);
    }
    return map;
  }, [filteredArtifacts]);

  /* ---------- Render: Artifact detail view ---------- */

  if (selectedArtifact) {
    const ArtifactComponent = ARTIFACT_COMPONENTS[selectedArtifact.id];
    const colors = getColorClasses(selectedArtifact.color);
    const category = ARTIFACT_CATEGORIES.find((c) => c.id === selectedArtifact.category);
    const relatedArtifactItems = (selectedArtifact.relatedArtifacts ?? [])
      .map((id) => ARTIFACTS.find((a) => a.id === id))
      .filter(Boolean) as ArtifactMeta[];

    return (
      <GlossaryTermsContext.Provider value={glossaryTerms}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
          <Header onSearchClick={openCommandPalette} />
          <CommandPalette isOpen={isCommandPaletteOpen} onClose={closeCommandPalette} />

          <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
            {/* Back button */}
            <button
              type="button"
              onClick={() => setSelectedArtifactId(null)}
              className="mb-6 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
            >
              <ArrowLeft className="h-4 w-4" />
              아티팩트 갤러리
            </button>

            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 sm:text-3xl">
                {selectedArtifact.title}
              </h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                <GlossaryHighlighter text={selectedArtifact.description} terms={glossaryTerms} />
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {category && (
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${colors.badge}`}
                  >
                    {category.label}
                  </span>
                )}
                {selectedArtifact.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Artifact component */}
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
              {ArtifactComponent ? (
                <ArtifactComponent />
              ) : (
                <div className="flex h-64 items-center justify-center text-gray-400 dark:text-gray-500">
                  컴포넌트를 찾을 수 없습니다.
                </div>
              )}
            </div>

            {/* Cross-references: related artifacts + papers */}
            {(relatedArtifactItems.length > 0 || (selectedArtifact.relatedPapers ?? []).length > 0) && (
              <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  관련 자료
                </h3>
                <div className="flex flex-wrap gap-3">
                  {relatedArtifactItems.map((related) => {
                    const rc = getColorClasses(related.color);
                    return (
                      <button
                        key={related.id}
                        type="button"
                        onClick={() => setSelectedArtifactId(related.id)}
                        className={`inline-flex items-center gap-2 rounded-lg border border-l-4 ${rc.border} border-gray-200 bg-gray-50 px-3 py-2 text-left text-sm transition hover:-translate-y-0.5 hover:shadow dark:border-gray-700 dark:bg-gray-800`}
                      >
                        <Beaker className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                        <span className="font-medium text-gray-800 dark:text-gray-200">{related.title}</span>
                        <ArrowRight className="h-3 w-3 text-gray-400" />
                      </button>
                    );
                  })}
                  {(selectedArtifact.relatedPapers ?? []).map((paper) => (
                    <Link
                      key={paper.paperId}
                      href={`/paper/${paper.paperId}`}
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm transition hover:-translate-y-0.5 hover:shadow dark:border-gray-700 dark:bg-gray-800"
                    >
                      <BookOpen className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
                      <span className="font-medium text-gray-800 dark:text-gray-200">{paper.title}</span>
                      <ArrowRight className="h-3 w-3 text-gray-400" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>
      </GlossaryTermsContext.Provider>
    );
  }

  /* ---------- Render: Gallery view ---------- */

  return (
    <GlossaryTermsContext.Provider value={glossaryTerms}>
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header onSearchClick={openCommandPalette} />
      <CommandPalette isOpen={isCommandPaletteOpen} onClose={closeCommandPalette} />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="inline-flex rounded-xl bg-emerald-50 p-2.5 ring-1 ring-emerald-100 dark:bg-emerald-900/30 dark:ring-emerald-800/50">
              <Beaker className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 sm:text-3xl">
                아티팩트 갤러리
              </h1>
              <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                수학·공학 개념 인터랙티브 탐색
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative mt-5 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="아티팩트 검색 (제목, 태그...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-10 text-sm text-gray-700 placeholder-gray-400 shadow-sm transition focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:placeholder-gray-500 dark:focus:border-emerald-600 dark:focus:ring-emerald-900/30"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-gray-400 transition hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Categories + cards */}
        <div className="space-y-10">
          {ARTIFACT_CATEGORIES.map((category) => {
            const items = artifactsByCategory.get(category.id) ?? [];
            const colors = getColorClasses(category.color);

            return (
              <section key={category.id}>
                {/* Category header */}
                <div className="mb-4 flex items-center gap-2">
                  <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                    {category.label}
                  </h2>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                    {items.length}
                  </span>
                </div>

                {items.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-gray-200 px-4 py-6 text-center text-sm text-gray-400 dark:border-gray-800 dark:text-gray-600">
                    준비 중...
                  </p>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((artifact) => {
                      const ac = getColorClasses(artifact.color);
                      return (
                        <button
                          key={artifact.id}
                          type="button"
                          onClick={() => setSelectedArtifactId(artifact.id)}
                          className={`group cursor-pointer rounded-xl border border-gray-200 border-l-4 ${ac.border} bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800 dark:bg-gray-900`}
                        >
                          <h3 className="text-base font-bold text-gray-900 group-hover:text-emerald-600 dark:text-gray-100 dark:group-hover:text-emerald-400">
                            {artifact.title}
                          </h3>
                          <p className="mt-1.5 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                            <GlossaryHighlighter text={artifact.description} terms={glossaryTerms} />
                          </p>
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {artifact.tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>

        {/* Footer spacer */}
        <div className="h-16" />
      </main>
    </div>
    </GlossaryTermsContext.Provider>
  );
}
