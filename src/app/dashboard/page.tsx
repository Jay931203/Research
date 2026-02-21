'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  ExternalLink,
  Maximize2,
  Minimize2,
  Plus,
  Redo2,
  Undo2,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import MarkdownContent from '@/components/common/MarkdownContent';
import PaperEquations from '@/components/papers/PaperEquation';
import { SkeletonBlock } from '@/components/common/Skeleton';
import { useMapSelectionSync } from '@/hooks/useMapSelectionSync';
import { usePapersWithNotes } from '@/hooks/useNotes';
import { useRelationships } from '@/hooks/useRelationships';
import { getPaperCategoryLabel } from '@/lib/visualization/graphUtils';
import { useAppStore } from '@/store/useAppStore';

const MindMap = dynamic(() => import('@/components/visualization/MindMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[560px] items-center justify-center text-sm text-gray-500">
      연구 관계 맵을 불러오는 중입니다...
    </div>
  ),
});

export default function DashboardPage() {
  const router = useRouter();
  const { papers, isLoading: papersLoading } = usePapersWithNotes();
  const { relationships, isLoading: relationshipsLoading } = useRelationships();
  const graphFilterSettings = useAppStore((state) => state.graphFilterSettings);
  const mapPaperIds = useAppStore((state) => state.mapPaperIds);
  const setMapPaperIds = useAppStore((state) => state.setMapPaperIds);
  const addMapPaper = useAppStore((state) => state.addMapPaper);
  const removeMapPaper = useAppStore((state) => state.removeMapPaper);
  const undoMapSelection = useAppStore((state) => state.undoMapSelection);
  const redoMapSelection = useAppStore((state) => state.redoMapSelection);
  const canUndoMapSelection = useAppStore((state) => state.canUndoMapSelection);
  const canRedoMapSelection = useAppStore((state) => state.canRedoMapSelection);

  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const [selectedFullscreenPaperId, setSelectedFullscreenPaperId] = useState<string | null>(null);
  const [focusTarget, setFocusTarget] = useState<{ paperId: string } | null>(null);

  useMapSelectionSync(papers);

  const availablePaperIds = useMemo(() => papers.map((paper) => paper.id), [papers]);
  const availablePaperIdSet = useMemo(
    () => new Set(availablePaperIds),
    [availablePaperIds]
  );

  const mapPaperIdSet = useMemo(
    () =>
      mapPaperIds === null
        ? null
        : new Set(mapPaperIds.filter((paperId) => availablePaperIdSet.has(paperId))),
    [mapPaperIds, availablePaperIdSet]
  );

  const mapPapers = useMemo(
    () => (mapPaperIdSet ? papers.filter((paper) => mapPaperIdSet.has(paper.id)) : papers),
    [papers, mapPaperIdSet]
  );

  const mapRelationships = useMemo(
    () =>
      mapPaperIdSet
        ? relationships.filter(
            (relationship) =>
              mapPaperIdSet.has(relationship.from_paper_id) &&
              mapPaperIdSet.has(relationship.to_paper_id)
          )
        : relationships,
    [relationships, mapPaperIdSet]
  );

  useEffect(() => {
    document.body.style.overflow = isMapFullscreen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMapFullscreen]);

  const handleNodeClick = useCallback(
    (paperId: string) => {
      setSelectedFullscreenPaperId(paperId);
    },
    []
  );

  const handleSidebarPaperClick = useCallback(
    (paperId: string) => {
      // Add to map if it has a specific selection and doesn't include this paper
      if (mapPaperIds !== null && !mapPaperIdSet?.has(paperId)) {
        addMapPaper(paperId);
      }
      setSelectedFullscreenPaperId(paperId);
      setFocusTarget({ paperId });
    },
    [mapPaperIds, mapPaperIdSet, addMapPaper]
  );

  const handleRemovePaperFromMap = useCallback(
    (paperId: string) => {
      if (!paperId) return;
      if (mapPaperIds === null) {
        const next = availablePaperIds.filter((id) => id !== paperId);
        setMapPaperIds(next);
      } else {
        removeMapPaper(paperId);
      }
      setSelectedFullscreenPaperId((current) => (current === paperId ? null : current));
    },
    [mapPaperIds, availablePaperIds, removeMapPaper, setMapPaperIds]
  );

  const selectedFullscreenPaper = useMemo(
    () => mapPapers.find((paper) => paper.id === selectedFullscreenPaperId) ?? null,
    [mapPapers, selectedFullscreenPaperId]
  );

  if (papersLoading || relationshipsLoading) {
    return (
      <MainLayout>
        <SkeletonBlock className="h-[560px]" />
      </MainLayout>
    );
  }

  return (
    <MainLayout onSidebarPaperClick={handleSidebarPaperClick}>
      <ErrorBoundary>
        {!isMapFullscreen && (
          <div>
            {papers.length === 0 && (
              <div className="animate-fade-in rounded-lg bg-white p-8 text-center shadow dark:bg-gray-800">
                <BookOpen className="mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
                <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">
                  아직 등록된 논문이 없습니다.
                </h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Import 페이지에서 논문 데이터를 불러오면 연구 관계 맵을 바로 확인할 수 있습니다.
                </p>
                <Link
                  href="/import"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  Import 페이지로 이동
                </Link>
                <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
                  논문을 추가하면 맵에서도 자동으로 연결 관계를 분석합니다.
                </p>
              </div>
            )}

            <div className="overflow-hidden rounded-lg bg-white shadow-lg dark:bg-gray-800">
              <div className="flex items-center justify-between gap-4 border-b border-gray-200 px-4 py-2.5 dark:border-gray-700">
                <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100">연구 관계 맵</h2>
                <div className="flex items-center gap-3">
                  <span className="hidden text-xs text-gray-500 dark:text-gray-400 lg:block">
                    맵 포함: {mapPapers.length}/{papers.length}
                  </span>
                  <button
                    onClick={undoMapSelection}
                    disabled={!canUndoMapSelection}
                    className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-xs font-semibold hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:hover:bg-gray-700"
                  >
                    <Undo2 className="h-3.5 w-3.5" />
                    되돌리기
                  </button>
                  <button
                    onClick={redoMapSelection}
                    disabled={!canRedoMapSelection}
                    className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-xs font-semibold hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:hover:bg-gray-700"
                  >
                    <Redo2 className="h-3.5 w-3.5" />
                    다시 실행
                  </button>
                  <button
                    onClick={() => setMapPaperIds(availablePaperIds)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-xs font-semibold hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
                  >
                    전체 복원
                  </button>
                  <button
                    onClick={() => {
                      setSelectedFullscreenPaperId(null);
                      setIsMapFullscreen(true);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-xs font-semibold hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
                  >
                    <Maximize2 className="h-3.5 w-3.5" />
                    전체화면
                  </button>
                </div>
              </div>
              <div className="flex" style={{ height: 'calc(100vh - 156px)', minHeight: '560px' }}>
                <div className="relative min-w-0 flex-1">
                  <MindMap
                    papers={mapPapers}
                    relationships={mapRelationships}
                    graphFilterSettings={graphFilterSettings}
                    onNodeClick={handleNodeClick}
                    onRemovePaper={handleRemovePaperFromMap}
                    focusTarget={focusTarget}
                  />
                </div>
                {selectedFullscreenPaper && (
                  <aside className="flex h-full w-[380px] shrink-0 flex-col overflow-hidden border-l border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
                    <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/95 px-4 py-4 backdrop-blur dark:border-gray-700 dark:bg-gray-900/95">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">선택된 논문</p>
                        <button
                          onClick={() => setSelectedFullscreenPaperId(null)}
                          className="rounded-md border border-gray-200 p-1 text-gray-400 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-500 dark:hover:bg-gray-800"
                          aria-label="패널 닫기"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <h3 className="line-clamp-3 text-sm font-bold leading-5 text-gray-900 dark:text-white">
                        {selectedFullscreenPaper.title}
                      </h3>
                      <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                        {selectedFullscreenPaper.year}{selectedFullscreenPaper.venue ? ` · ${selectedFullscreenPaper.venue}` : ''}
                      </p>
                      <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                        {(selectedFullscreenPaper.authors ?? []).slice(0, 2).join(', ')}{(selectedFullscreenPaper.authors?.length ?? 0) > 2 ? ' 외' : ''}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                          style={{
                            backgroundColor: `${selectedFullscreenPaper.color_hex}25`,
                            color: selectedFullscreenPaper.color_hex,
                          }}
                        >
                          {getPaperCategoryLabel(selectedFullscreenPaper)}
                        </span>
                        {(selectedFullscreenPaper.tags ?? []).slice(0, 2).map((tag) => (
                          <span
                            key={`nonfs-tag-${tag}`}
                            className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <Link
                        href={`/paper/${selectedFullscreenPaper.id}`}
                        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
                      >
                        논문 상세 페이지 열기
                      </Link>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                      <div className="space-y-5 p-4">
                        {selectedFullscreenPaper.abstract && (
                          <section>
                            <h4 className="mb-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300">초록</h4>
                            <MarkdownContent
                              content={selectedFullscreenPaper.abstract}
                              className="text-sm leading-6 text-gray-700 dark:text-gray-200"
                            />
                          </section>
                        )}
                        {!!selectedFullscreenPaper.key_contributions?.length && (
                          <section>
                            <h4 className="mb-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300">핵심 기여</h4>
                            <ul className="space-y-1.5 text-sm text-gray-700 dark:text-gray-200">
                              {selectedFullscreenPaper.key_contributions.map((item, idx) => (
                                <li key={`nonfs-contribution-${idx}`} className="flex gap-2">
                                  <span className="mt-[7px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-400" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </section>
                        )}
                        {!!selectedFullscreenPaper.algorithms?.length && (
                          <section>
                            <h4 className="mb-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300">알고리즘</h4>
                            <ul className="space-y-1.5 text-sm text-gray-700 dark:text-gray-200">
                              {selectedFullscreenPaper.algorithms.map((item, idx) => (
                                <li key={`nonfs-algorithm-${idx}`} className="flex gap-2">
                                  <span className="mt-[7px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-violet-400" />
                                  <div className="min-w-0 flex-1">
                                    <MarkdownContent
                                      content={item}
                                      className="text-sm leading-6 text-gray-700 dark:text-gray-200"
                                    />
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </section>
                        )}
                        {!!selectedFullscreenPaper.architecture_detail && (
                          <section>
                            <h4 className="mb-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300">아키텍처 상세</h4>
                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/60">
                              <MarkdownContent
                                content={selectedFullscreenPaper.architecture_detail}
                                className="text-sm leading-6 text-gray-800 dark:text-gray-100"
                              />
                            </div>
                          </section>
                        )}
                        {!!selectedFullscreenPaper.key_equations?.length && (
                          <section>
                            <h4 className="mb-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300">핵심 수식</h4>
                            <PaperEquations equations={selectedFullscreenPaper.key_equations as any} />
                          </section>
                        )}
                        {(selectedFullscreenPaper.difficulty_level ||
                          selectedFullscreenPaper.prerequisites?.length ||
                          selectedFullscreenPaper.learning_objectives?.length ||
                          selectedFullscreenPaper.self_check_questions?.length) && (
                          <section className="space-y-3">
                            <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-300">학습 가이드</h4>
                            {selectedFullscreenPaper.difficulty_level && (
                              <p className="text-sm text-gray-700 dark:text-gray-200">
                                난이도: <span className="font-semibold">{selectedFullscreenPaper.difficulty_level}</span>
                              </p>
                            )}
                            {!!selectedFullscreenPaper.prerequisites?.length && (
                              <div>
                                <p className="mb-1 text-xs font-semibold text-gray-500 dark:text-gray-400">선행 지식</p>
                                <ul className="space-y-1.5 text-sm text-gray-700 dark:text-gray-200">
                                  {selectedFullscreenPaper.prerequisites.map((item, idx) => (
                                    <li key={`nonfs-prereq-${idx}`} className="flex gap-2">
                                      <span className="mt-[7px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400" />
                                      <span>{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {!!selectedFullscreenPaper.learning_objectives?.length && (
                              <div>
                                <p className="mb-1 text-xs font-semibold text-gray-500 dark:text-gray-400">학습 목표</p>
                                <ul className="space-y-1.5 text-sm text-gray-700 dark:text-gray-200">
                                  {selectedFullscreenPaper.learning_objectives.map((item, idx) => (
                                    <li key={`nonfs-objective-${idx}`} className="flex gap-2">
                                      <span className="mt-[7px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-cyan-400" />
                                      <span>{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {!!selectedFullscreenPaper.self_check_questions?.length && (
                              <div>
                                <p className="mb-1 text-xs font-semibold text-gray-500 dark:text-gray-400">셀프 체크 질문</p>
                                <ul className="space-y-1.5 text-sm text-gray-700 dark:text-gray-200">
                                  {selectedFullscreenPaper.self_check_questions.map((item, idx) => (
                                    <li key={`nonfs-check-${idx}`} className="flex gap-2">
                                      <span className="mt-[7px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400" />
                                      <span>{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </section>
                        )}
                        {!!selectedFullscreenPaper.note_content && (
                          <section>
                            <h4 className="mb-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300">노트</h4>
                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/70">
                              <MarkdownContent
                                content={selectedFullscreenPaper.note_content}
                                className="text-sm leading-6 text-gray-700 dark:text-gray-200"
                              />
                            </div>
                          </section>
                        )}
                        <section className="pt-1">
                          <div className="flex gap-2">
                            {selectedFullscreenPaper.pdf_url && (
                              <a
                                href={selectedFullscreenPaper.pdf_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                                PDF
                              </a>
                            )}
                            {selectedFullscreenPaper.code_url && (
                              <a
                                href={selectedFullscreenPaper.code_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                                Code
                              </a>
                            )}
                          </div>
                        </section>
                      </div>
                    </div>
                  </aside>
                )}
              </div>
            </div>
          </div>
        )}

        {isMapFullscreen && (
          <div className="fixed bottom-0 left-0 right-0 top-16 z-40 bg-white dark:bg-gray-950">
            <div className="flex h-12 items-center justify-between border-b border-gray-200 bg-white/95 px-4 dark:border-gray-700 dark:bg-gray-900/95">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">연구 관계 맵 (노드 클릭 시 우측 패널 표시)</p>
              <button
                onClick={() => {
                  setSelectedFullscreenPaperId(null);
                  setIsMapFullscreen(false);
                }}
                className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                <Minimize2 className="h-3.5 w-3.5" />
                축소
              </button>
            </div>
            <div className="flex h-[calc(100%-48px)] min-h-0">
              <div className="relative min-w-0 flex-1">
                <MindMap
                  papers={mapPapers}
                  relationships={mapRelationships}
                  graphFilterSettings={graphFilterSettings}
                  onNodeClick={handleNodeClick}
                  onRemovePaper={handleRemovePaperFromMap}
                  focusTarget={focusTarget}
                />
                {!selectedFullscreenPaper && (
                  <div className="pointer-events-none absolute bottom-4 right-4 rounded-lg border border-gray-200 bg-white/90 px-3 py-2 text-xs text-gray-600 shadow-lg dark:border-gray-700 dark:bg-gray-900/90 dark:text-gray-300">
                    노드를 클릭하면 우측에 논문 세부 정보가 표시됩니다.
                  </div>
                )}
              </div>

              {selectedFullscreenPaper && (
                <aside className="h-full w-[420px] shrink-0 overflow-y-auto border-l border-gray-200 bg-white text-gray-900 dark:border-gray-700 dark:bg-gray-900/95 dark:text-gray-100">
                  <div className="sticky top-0 border-b border-gray-200 bg-white/95 px-4 py-4 backdrop-blur dark:border-gray-700 dark:bg-gray-900/95">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">선택된 논문</p>
                      <button
                        onClick={() => setSelectedFullscreenPaperId(null)}
                        className="rounded-md border border-gray-200 p-1 text-gray-400 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                        aria-label="패널 닫기"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <h3 className="line-clamp-3 text-sm font-bold leading-5 text-gray-900 dark:text-white">
                      {selectedFullscreenPaper.title}
                    </h3>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      {selectedFullscreenPaper.authors?.join(', ') || '저자 정보 없음'}
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {selectedFullscreenPaper.year}
                      {selectedFullscreenPaper.venue ? ` · ${selectedFullscreenPaper.venue}` : ''}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        style={{
                          backgroundColor: `${selectedFullscreenPaper.color_hex}33`,
                          color: selectedFullscreenPaper.color_hex,
                        }}
                      >
                        {getPaperCategoryLabel(selectedFullscreenPaper)}
                      </span>
                      {(selectedFullscreenPaper.tags ?? []).slice(0, 3).map((tag) => (
                        <span
                          key={`fullscreen-tag-${tag}`}
                          className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500 dark:bg-gray-800 dark:text-gray-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <Link
                      href={`/paper/${selectedFullscreenPaper.id}`}
                      className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
                    >
                      논문 상세 페이지 열기
                    </Link>
                  </div>

                  <div className="space-y-5 p-4">
                    {selectedFullscreenPaper.abstract && (
                      <section>
                        <h4 className="mb-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300">초록</h4>
                        <MarkdownContent
                          content={selectedFullscreenPaper.abstract}
                          className="text-sm leading-6 text-gray-700 dark:text-gray-200"
                        />
                      </section>
                    )}

                    {!!selectedFullscreenPaper.key_contributions?.length && (
                      <section>
                        <h4 className="mb-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300">핵심 기여</h4>
                        <ul className="space-y-1.5 text-sm text-gray-700 dark:text-gray-200">
                          {selectedFullscreenPaper.key_contributions.map((item, idx) => (
                            <li key={`fullscreen-contribution-${idx}`} className="flex gap-2">
                              <span className="mt-[7px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-400" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </section>
                    )}

                    {!!selectedFullscreenPaper.algorithms?.length && (
                      <section>
                        <h4 className="mb-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300">알고리즘</h4>
                        <ul className="space-y-1.5 text-sm text-gray-700 dark:text-gray-200">
                          {selectedFullscreenPaper.algorithms.map((item, idx) => (
                            <li key={`fullscreen-algorithm-${idx}`} className="flex gap-2">
                              <span className="mt-[7px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-violet-400" />
                              <div className="min-w-0 flex-1">
                                <MarkdownContent
                                  content={item}
                                  className="text-sm leading-6 text-gray-700 dark:text-gray-200"
                                />
                              </div>
                            </li>
                          ))}
                        </ul>
                      </section>
                    )}

                    {!!selectedFullscreenPaper.architecture_detail && (
                      <section>
                        <h4 className="mb-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300">아키텍처 상세</h4>
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/60">
                          <MarkdownContent
                            content={selectedFullscreenPaper.architecture_detail}
                            className="text-sm leading-6 text-gray-800 dark:text-gray-100"
                          />
                        </div>
                      </section>
                    )}

                    {!!selectedFullscreenPaper.key_equations?.length && (
                      <section>
                        <h4 className="mb-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300">핵심 수식</h4>
                        <PaperEquations equations={selectedFullscreenPaper.key_equations as any} />
                      </section>
                    )}

                    {(selectedFullscreenPaper.difficulty_level ||
                      selectedFullscreenPaper.prerequisites?.length ||
                      selectedFullscreenPaper.learning_objectives?.length ||
                      selectedFullscreenPaper.self_check_questions?.length) && (
                      <section className="space-y-3">
                        <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-300">학습 가이드</h4>

                        {selectedFullscreenPaper.difficulty_level && (
                          <p className="text-sm text-gray-700 dark:text-gray-200">
                            난이도: <span className="font-semibold">{selectedFullscreenPaper.difficulty_level}</span>
                          </p>
                        )}

                        {!!selectedFullscreenPaper.prerequisites?.length && (
                          <div>
                            <p className="mb-1 text-xs font-semibold text-gray-500 dark:text-gray-400">선행 지식</p>
                            <ul className="space-y-1.5 text-sm text-gray-700 dark:text-gray-200">
                              {selectedFullscreenPaper.prerequisites.map((item, idx) => (
                                <li key={`fullscreen-prereq-${idx}`} className="flex gap-2">
                                  <span className="mt-[7px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {!!selectedFullscreenPaper.learning_objectives?.length && (
                          <div>
                            <p className="mb-1 text-xs font-semibold text-gray-500 dark:text-gray-400">학습 목표</p>
                            <ul className="space-y-1.5 text-sm text-gray-700 dark:text-gray-200">
                              {selectedFullscreenPaper.learning_objectives.map((item, idx) => (
                                <li key={`fullscreen-objective-${idx}`} className="flex gap-2">
                                  <span className="mt-[7px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-cyan-400" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {!!selectedFullscreenPaper.self_check_questions?.length && (
                          <div>
                            <p className="mb-1 text-xs font-semibold text-gray-500 dark:text-gray-400">셀프 체크 질문</p>
                            <ul className="space-y-1.5 text-sm text-gray-700 dark:text-gray-200">
                              {selectedFullscreenPaper.self_check_questions.map((item, idx) => (
                                <li key={`fullscreen-check-${idx}`} className="flex gap-2">
                                  <span className="mt-[7px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </section>
                    )}

                    {!!selectedFullscreenPaper.note_content && (
                      <section>
                        <h4 className="mb-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300">노트</h4>
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/70">
                          <MarkdownContent
                            content={selectedFullscreenPaper.note_content}
                            className="text-sm leading-6 text-gray-700 dark:text-gray-200"
                          />
                        </div>
                      </section>
                    )}

                    <section className="pt-1">
                      <div className="flex gap-2">
                        {selectedFullscreenPaper.pdf_url && (
                          <a
                            href={selectedFullscreenPaper.pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            PDF
                          </a>
                        )}
                        {selectedFullscreenPaper.code_url && (
                          <a
                            href={selectedFullscreenPaper.code_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            Code
                          </a>
                        )}
                      </div>
                    </section>
                  </div>
                </aside>
              )}
            </div>
          </div>
        )}

      </ErrorBoundary>
    </MainLayout>
  );
}
