'use client';

import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePapersWithNotes } from '@/hooks/useNotes';
import { filterPapersBySearchFilters, type PaperSearchFilters } from '@/lib/papers/filtering';
import { upsertNote } from '@/lib/supabase/notes';
import { useToastStore } from '@/store/useToastStore';
import type { FamiliarityLevel, PaperWithNote } from '@/types';
import PaperCard from './PaperCard';

interface PaperListProps {
  filters: PaperSearchFilters;
}

export default function PaperList({ filters }: PaperListProps) {
  const { papers, isLoading, isError, refresh } = usePapersWithNotes();
  const router = useRouter();
  const addToast = useToastStore((state) => state.addToast);
  const [savingByPaperId, setSavingByPaperId] = useState<Record<string, boolean>>({});

  const handleQuickSave = useCallback(
    async (paperId: string, patch: Record<string, unknown>, successMessage: string) => {
      if (savingByPaperId[paperId]) return;
      setSavingByPaperId((prev) => ({ ...prev, [paperId]: true }));

      try {
        await upsertNote(paperId, patch);

        try {
          await Promise.resolve(refresh());
        } catch (refreshError) {
          console.warn('Quick save succeeded but refresh failed:', refreshError);
        }

        addToast('success', successMessage);
      } catch (error) {
        console.error('Quick save error:', error);
        addToast('error', '저장 실패, 다시 시도해주세요');
      } finally {
        setSavingByPaperId((prev) => {
          const next = { ...prev };
          delete next[paperId];
          return next;
        });
      }
    },
    [addToast, refresh, savingByPaperId]
  );

  const handleFavoriteToggle = useCallback(
    async (paper: PaperWithNote) => {
      await handleQuickSave(paper.id, { is_favorite: !paper.is_favorite }, '즐겨찾기를 저장했습니다');
    },
    [handleQuickSave]
  );

  const handleFamiliarityChange = useCallback(
    async (paper: PaperWithNote, level: FamiliarityLevel) => {
      await handleQuickSave(
        paper.id,
        {
          familiarity_level: level,
          last_read_at: new Date().toISOString(),
        },
        '익숙도 변경을 저장했습니다'
      );
    },
    [handleQuickSave]
  );

  const filteredPapers = useMemo(
    () =>
      [...filterPapersBySearchFilters(papers, filters)].sort((a, b) => b.year - a.year),
    [papers, filters]
  );

  if (isLoading) {
    return (
      <div className="p-4 text-center text-gray-500">
        <div className="mx-auto mb-2 h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        <p className="text-sm">논문 목록을 불러오는 중입니다...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 text-center text-red-500">
        <p className="text-sm">논문 데이터를 불러오지 못했습니다.</p>
        <p className="mt-1 text-xs">Supabase 연결 상태를 확인해 주세요.</p>
      </div>
    );
  }

  if (!filteredPapers.length) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p className="text-sm">조건에 맞는 논문이 없습니다.</p>
        {papers.length === 0 ? (
          <p className="mt-1 text-xs">
            <Link href="/import" className="text-blue-600 hover:underline">
              Import 페이지
            </Link>{' '}
            에서 데이터를 먼저 불러와 주세요.
          </p>
        ) : (
          <p className="mt-1 text-xs">필터 조건을 조정해 보세요.</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4">
      <div className="mb-2 text-xs text-gray-500">총 {filteredPapers.length}개 논문</div>
      {filteredPapers.map((paper) => (
        <PaperCard
          key={paper.id}
          paper={paper}
          onClick={() => router.push(`/paper/${paper.id}`)}
          onFavoriteToggle={handleFavoriteToggle}
          onFamiliarityChange={handleFamiliarityChange}
          isSaving={!!savingByPaperId[paper.id]}
        />
      ))}
    </div>
  );
}
