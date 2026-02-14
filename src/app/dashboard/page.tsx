'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { BookOpen, CheckCircle, GraduationCap, Link2, Maximize2, Minimize2, Plus, Star } from 'lucide-react';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { SkeletonCard, SkeletonBlock, SkeletonText } from '@/components/common/Skeleton';
import EquationPreviewCard from '@/components/papers/EquationPreviewCard';
import { usePapersWithNotes } from '@/hooks/useNotes';
import { useRelationships } from '@/hooks/useRelationships';
import {
  buildPaperConnections,
  buildPaperCoreSnapshot,
  buildReviewQueue,
  countPapersNeedingReview,
  countRecentPapers,
  getMostConnectedPaper,
  getRelationshipTypeCount,
} from '@/lib/papers/insights';
import { FAMILIARITY_LABELS, RELATIONSHIP_STYLES } from '@/lib/visualization/graphUtils';
import { useAppStore } from '@/store/useAppStore';

const MindMap = dynamic(() => import('@/components/visualization/MindMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[560px] items-center justify-center text-sm text-gray-500">
      관계 맵을 불러오는 중...
    </div>
  ),
});

const PaperDetailModal = dynamic(() => import('@/components/papers/PaperDetailModal'), {
  ssr: false,
});

export default function DashboardPage() {
  const { papers, isLoading: papersLoading, refresh: refreshPapers } = usePapersWithNotes();
  const { relationships, isLoading: relationshipsLoading } = useRelationships();
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);

  const { selectedPaperId, isDetailModalOpen, openPaperDetail, closePaperDetail } =
    useAppStore();

  useEffect(() => {
    document.body.style.overflow = isMapFullscreen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMapFullscreen]);

  const handleNodeClick = useCallback(
    (paperId: string) => {
      openPaperDetail(paperId);
    },
    [openPaperDetail]
  );

  const selectedPaper = useMemo(() => {
    if (selectedPaperId) {
      return papers.find((paper) => paper.id === selectedPaperId) ?? null;
    }
    return getMostConnectedPaper(papers, relationships);
  }, [selectedPaperId, papers, relationships]);

  const selectedSnapshot = useMemo(() => {
    if (!selectedPaper) return null;
    return buildPaperCoreSnapshot(selectedPaper);
  }, [selectedPaper]);

  const selectedConnections = useMemo(() => {
    if (!selectedPaper) return [];
    return buildPaperConnections(selectedPaper.id, papers, relationships).slice(0, 6);
  }, [selectedPaper, papers, relationships]);

  const reviewQueue = useMemo(() => buildReviewQueue(papers, 7), [papers]);
  const relationshipTypeCount = useMemo(
    () => getRelationshipTypeCount(relationships),
    [relationships]
  );

  const stats = useMemo(() => {
    return [
      {
        key: 'papers',
        label: '논문',
        value: papers.length,
        icon: <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
        iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      },
      {
        key: 'relationships',
        label: '관계',
        value: relationships.length,
        icon: <Link2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />,
        iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
      },
      {
        key: 'favorites',
        label: '즐겨찾기',
        value: papers.filter((paper) => paper.is_favorite).length,
        icon: <Star className="h-5 w-5 text-amber-500 dark:text-amber-400" />,
        iconBg: 'bg-amber-100 dark:bg-amber-900/30',
      },
      {
        key: 'review',
        label: '복습 필요',
        value: countPapersNeedingReview(papers),
        icon: <BookOpen className="h-5 w-5 text-rose-600 dark:text-rose-400" />,
        iconBg: 'bg-rose-100 dark:bg-rose-900/30',
      },
      {
        key: 'recent',
        label: '최근 2년',
        value: countRecentPapers(papers, 2),
        icon: <Link2 className="h-5 w-5 text-violet-600 dark:text-violet-400" />,
        iconBg: 'bg-violet-100 dark:bg-violet-900/30',
      },
    ];
  }, [papers, relationships]);

  if (papersLoading || relationshipsLoading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
          <SkeletonBlock className="h-[560px]" />
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <div className="space-y-3 rounded-lg bg-white p-4 shadow xl:col-span-2 dark:bg-gray-800">
              <SkeletonText width="w-24" />
              <SkeletonText />
              <SkeletonText width="w-3/4" />
              <SkeletonBlock className="h-20" />
            </div>
            <div className="space-y-3 rounded-lg bg-white p-4 shadow dark:bg-gray-800">
              <SkeletonText width="w-20" />
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonBlock key={i} className="h-12" />
              ))}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <ErrorBoundary>
        {!isMapFullscreen && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
              {stats.map((stat, index) => (
                <div
                  key={stat.key}
                  className="animate-slide-up rounded-lg bg-white p-4 shadow dark:bg-gray-800"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`rounded-lg p-2.5 ${stat.iconBg}`}>{stat.icon}</div>
                    <div>
                      <p className="text-xl font-bold">{stat.value}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{stat.label}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {papers.length === 0 && (
              <div className="animate-fade-in rounded-lg bg-white p-8 text-center shadow dark:bg-gray-800">
                <BookOpen className="mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
                <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">
                  아직 등록된 논문이 없습니다
                </h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  논문을 추가하면 관계 맵과 복습 큐가 자동으로 구성됩니다.
                </p>
                <Link
                  href="/import"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  논문 가져오기
                </Link>
                <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
                  또는 사이드바에서 직접 추가할 수 있습니다
                </p>
              </div>
            )}

            <div className="overflow-hidden rounded-lg bg-white shadow-lg dark:bg-gray-800">
              <div className="flex items-center justify-between gap-4 border-b border-gray-200 px-4 py-3 dark:border-gray-700">
                <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100">연구 관계 맵</h2>
                <div className="flex items-center gap-3">
                  <span className="hidden text-xs text-gray-500 dark:text-gray-400 lg:block">
                    그래프/리스트를 전환해 관계를 해석하세요.
                  </span>
                  <button
                    onClick={() => setIsMapFullscreen(true)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-xs font-semibold hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
                  >
                    <Maximize2 className="h-3.5 w-3.5" />
                    전체화면
                  </button>
                </div>
              </div>
              <div style={{ height: 'calc(100vh - 260px)', minHeight: '560px' }}>
                <MindMap papers={papers} relationships={relationships} onNodeClick={handleNodeClick} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
              <div className="rounded-lg bg-white p-4 shadow xl:col-span-2 dark:bg-gray-800">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">핵심 리마인드</h3>
                  {selectedPaper && (
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/paper/${selectedPaper.id}`}
                        className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-indigo-700"
                      >
                        <GraduationCap className="h-3.5 w-3.5" />
                        학습 페이지
                      </Link>
                      <button
                        onClick={() => openPaperDetail(selectedPaper.id)}
                        className="rounded-md border border-gray-300 px-2.5 py-1 text-xs font-semibold hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
                      >
                        상세 열기
                      </button>
                    </div>
                  )}
                </div>

                {!selectedPaper || !selectedSnapshot ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <BookOpen className="mb-3 h-8 w-8 text-gray-300 dark:text-gray-600" />
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      맵에서 논문을 선택하면 핵심 리마인드 카드가 표시됩니다.
                    </p>
                    <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                      노드를 클릭해 논문 정보를 확인하세요
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-blue-600">{selectedPaper.year}</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                        {selectedPaper.title}
                      </p>
                    </div>
                    <p className="rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-900 dark:bg-blue-900/20 dark:text-blue-100">
                      {selectedSnapshot.oneLiner}
                    </p>

                    {!!selectedSnapshot.rememberPoints.length && (
                      <div>
                        <p className="mb-2 text-xs font-semibold text-gray-600 dark:text-gray-300">
                          리마인드 체크포인트
                        </p>
                        <ul className="space-y-1.5">
                          {selectedSnapshot.rememberPoints.map((item) => (
                            <li
                              key={item}
                              className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
                            >
                              <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-indigo-500" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {!!selectedSnapshot.expectedOutcomes.length && (
                      <div>
                        <p className="mb-2 text-xs font-semibold text-gray-600 dark:text-gray-300">
                          기대 기여/결과
                        </p>
                        <ul className="space-y-1.5">
                          {selectedSnapshot.expectedOutcomes.map((item) => (
                            <li
                              key={item}
                              className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
                            >
                              <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-blue-500" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {!!selectedSnapshot.equationPreviews.length && (
                      <div>
                        <p className="mb-2 text-xs font-semibold text-gray-600 dark:text-gray-300">
                          핵심 수식
                        </p>
                        <div className="grid gap-2 md:grid-cols-2">
                          {selectedSnapshot.equationPreviews.slice(0, 2).map((equation) => (
                            <EquationPreviewCard key={equation.name} equation={equation} />
                          ))}
                        </div>
                      </div>
                    )}

                    {!!selectedConnections.length && (
                      <div>
                        <p className="mb-2 text-xs font-semibold text-gray-600 dark:text-gray-300">
                          연결된 논문
                        </p>
                        <div className="space-y-2">
                          {selectedConnections.map((connection) => {
                            const style =
                              RELATIONSHIP_STYLES[connection.relationship.relationship_type];
                            return (
                              <button
                                key={connection.relationship.id}
                                onClick={() => openPaperDetail(connection.otherPaper.id)}
                                className="flex w-full items-center justify-between rounded-md border border-gray-200 px-2.5 py-2 text-left hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
                              >
                                <span className="line-clamp-1 pr-2 text-sm text-gray-700 dark:text-gray-200">
                                  {connection.otherPaper.title}
                                </span>
                                <span
                                  className="whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-semibold"
                                  style={{ backgroundColor: `${style.color}20`, color: style.color }}
                                >
                                  {style.label} {connection.relationship.strength}/10
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
                <h3 className="mb-3 text-sm font-bold text-gray-800 dark:text-gray-100">복습 큐</h3>
                {reviewQueue.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <CheckCircle className="mb-3 h-8 w-8 text-emerald-400 dark:text-emerald-500" />
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      모든 논문을 복습했습니다!
                    </p>
                    <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                      잘 하고 있어요. 새 논문을 추가해 보세요.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {reviewQueue.map((paper, index) => (
                      <div
                        key={paper.id}
                        className="animate-slide-up flex items-center gap-2 rounded-md border border-gray-200 px-2.5 py-2 dark:border-gray-700"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <button
                          onClick={() => openPaperDetail(paper.id)}
                          className="min-w-0 flex-1 text-left hover:opacity-80"
                        >
                          <p className="line-clamp-1 text-sm font-medium text-gray-800 dark:text-gray-200">
                            {paper.title}
                          </p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400">
                            {paper.year} · {FAMILIARITY_LABELS[paper.familiarity_level ?? 'not_started']}
                            {paper.importance_rating ? ` · 중요도 ${paper.importance_rating}` : ''}
                          </p>
                        </button>
                        <Link
                          href={`/paper/${paper.id}`}
                          className="flex-shrink-0 rounded-md p-1.5 text-gray-400 transition hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/30"
                          title="학습 페이지로 이동"
                        >
                          <GraduationCap className="h-4 w-4" />
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
              <h3 className="mb-3 text-sm font-bold text-gray-800 dark:text-gray-100">
                관계 타입 분포
              </h3>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-8">
                {Object.entries(relationshipTypeCount).map(([type, count]) => {
                  const style = RELATIONSHIP_STYLES[type as keyof typeof RELATIONSHIP_STYLES];
                  return (
                    <div
                      key={type}
                      className="rounded-md border border-gray-200 px-2 py-2 text-center dark:border-gray-700"
                    >
                      <p className="text-xs font-semibold" style={{ color: style.color }}>
                        {style.label}
                      </p>
                      <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{count}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {isMapFullscreen && (
          <div className="fixed bottom-0 left-0 right-0 top-16 z-40 bg-gray-950">
            <div className="flex h-12 items-center justify-between border-b border-gray-700 bg-gray-900/95 px-4">
              <p className="text-sm font-semibold text-gray-100">연구 관계 맵 (몰입 모드)</p>
              <button
                onClick={() => setIsMapFullscreen(false)}
                className="inline-flex items-center gap-1.5 rounded-md border border-gray-600 px-3 py-1.5 text-xs font-semibold text-gray-200 hover:bg-gray-800"
              >
                <Minimize2 className="h-3.5 w-3.5" />
                닫기
              </button>
            </div>
            <div className="h-[calc(100%-48px)]">
              <MindMap papers={papers} relationships={relationships} onNodeClick={handleNodeClick} />
            </div>
          </div>
        )}

        <PaperDetailModal
          paper={selectedPaper}
          isOpen={isDetailModalOpen}
          onClose={closePaperDetail}
          relationships={relationships}
          allPapers={papers}
          onPaperSelect={openPaperDetail}
          onDataChange={refreshPapers}
        />
      </ErrorBoundary>
    </MainLayout>
  );
}
