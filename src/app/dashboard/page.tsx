'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { BookOpen, Link2, Maximize2, Minimize2, Plus, Star, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { SkeletonCard, SkeletonBlock } from '@/components/common/Skeleton';
import { usePapersWithNotes } from '@/hooks/useNotes';
import { useRelationships } from '@/hooks/useRelationships';
import { countRecentPapers } from '@/lib/papers/insights';

const MindMap = dynamic(() => import('@/components/visualization/MindMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[560px] items-center justify-center text-sm text-gray-500">
      관계 맵을 불러오는 중...
    </div>
  ),
});

interface DashboardStat {
  key: string;
  label: string;
  value: number;
  icon: JSX.Element;
  iconBg: string;
  onClick?: () => void;
}

export default function DashboardPage() {
  const router = useRouter();
  const { papers, isLoading: papersLoading } = usePapersWithNotes();
  const { relationships, isLoading: relationshipsLoading } = useRelationships();

  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const [isFavoritesModalOpen, setIsFavoritesModalOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isMapFullscreen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMapFullscreen]);

  useEffect(() => {
    if (!isFavoritesModalOpen) return;
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsFavoritesModalOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isFavoritesModalOpen]);

  const handleNodeClick = useCallback(
    (paperId: string) => {
      router.push(`/paper/${paperId}`);
    },
    [router]
  );

  const favoritePapers = useMemo(
    () => papers.filter((paper) => paper.is_favorite),
    [papers]
  );

  const stats = useMemo<DashboardStat[]>(
    () => [
      {
        key: 'papers',
        label: '논문',
        value: papers.length,
        icon: <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />,
        iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      },
      {
        key: 'relationships',
        label: '관계',
        value: relationships.length,
        icon: <Link2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />,
        iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
      },
      {
        key: 'favorites',
        label: '즐겨찾기',
        value: favoritePapers.length,
        icon: <Star className="h-4 w-4 text-amber-500 dark:text-amber-400" />,
        iconBg: 'bg-amber-100 dark:bg-amber-900/30',
        onClick: () => setIsFavoritesModalOpen(true),
      },
      {
        key: 'recent',
        label: '최근 2주',
        value: countRecentPapers(papers, 2),
        icon: <Link2 className="h-4 w-4 text-violet-600 dark:text-violet-400" />,
        iconBg: 'bg-violet-100 dark:bg-violet-900/30',
      },
    ],
    [papers, relationships, favoritePapers.length]
  );

  if (papersLoading || relationshipsLoading) {
    return (
      <MainLayout>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
          <SkeletonBlock className="h-[560px]" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <ErrorBoundary>
        {!isMapFullscreen && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              {stats.map((stat) => (
                <div
                  key={stat.key}
                  role={stat.onClick ? 'button' : undefined}
                  tabIndex={stat.onClick ? 0 : undefined}
                  onClick={stat.onClick}
                  onKeyDown={(event) => {
                    if (!stat.onClick) return;
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      stat.onClick();
                    }
                  }}
                  className={`rounded-lg bg-white p-2.5 shadow dark:bg-gray-800 ${
                    stat.onClick
                      ? 'cursor-pointer transition hover:ring-2 hover:ring-amber-300 dark:hover:ring-amber-700'
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`rounded-md p-1.5 ${stat.iconBg}`}>{stat.icon}</div>
                    <div>
                      <p className="text-lg font-bold leading-tight">{stat.value}</p>
                      <p className="text-[11px] text-gray-600 dark:text-gray-400">{stat.label}</p>
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
              <div className="flex items-center justify-between gap-4 border-b border-gray-200 px-4 py-2.5 dark:border-gray-700">
                <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100">연구 관계 맵</h2>
                <div className="flex items-center gap-3">
                  <span className="hidden text-xs text-gray-500 dark:text-gray-400 lg:block">
                    필터 패널에서 원하는 논문만 선택해 관계선만 볼 수 있습니다.
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
              <div style={{ height: 'calc(100vh - 180px)', minHeight: '560px' }}>
                <MindMap papers={papers} relationships={relationships} onNodeClick={handleNodeClick} />
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

        {isFavoritesModalOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <button
              type="button"
              className="absolute inset-0 bg-black/45"
              aria-label="닫기"
              onClick={() => setIsFavoritesModalOpen(false)}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-label="즐겨찾기 논문 목록"
              className="relative max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900"
            >
              <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3 dark:border-gray-700">
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100">즐겨찾기 논문</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{favoritePapers.length}개</p>
                </div>
                <button
                  onClick={() => setIsFavoritesModalOpen(false)}
                  className="rounded-md border border-gray-300 p-1.5 text-gray-500 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="max-h-[calc(80vh-72px)] space-y-2 overflow-auto p-4">
                {favoritePapers.length === 0 ? (
                  <p className="rounded-lg bg-gray-50 px-4 py-6 text-center text-sm text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                    등록된 즐겨찾기 논문이 없습니다.
                  </p>
                ) : (
                  favoritePapers.map((paper) => (
                    <Link
                      key={paper.id}
                      href={`/paper/${paper.id}`}
                      onClick={() => setIsFavoritesModalOpen(false)}
                      className="block rounded-xl border border-gray-200 px-4 py-3 transition hover:border-amber-300 hover:bg-amber-50/70 dark:border-gray-700 dark:hover:border-amber-700 dark:hover:bg-amber-900/20"
                    >
                      <div className="mb-1 flex items-center gap-2">
                        <span
                          className="inline-block h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: paper.color_hex }}
                        />
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                          {paper.year} · {paper.category}
                        </span>
                      </div>
                      <p className="line-clamp-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {paper.title}
                      </p>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </ErrorBoundary>
    </MainLayout>
  );
}
