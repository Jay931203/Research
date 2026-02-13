'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { usePapersWithNotes } from '@/hooks/useNotes';
import PaperCard from './PaperCard';
import { useAppStore } from '@/store/useAppStore';

interface PaperListProps {
  filters: {
    searchText: string;
    categories: string[];
    yearRange: [number, number];
    familiarityLevels: string[];
  };
}

export default function PaperList({ filters }: PaperListProps) {
  const { papers, isLoading, isError } = usePapersWithNotes();
  const { selectedPaperId, openPaperDetail } = useAppStore();

  const filteredPapers = useMemo(() => {
    let result = papers;

    if (filters.searchText.trim()) {
      const query = filters.searchText.toLowerCase().trim();
      result = result.filter((paper) => {
        return (
          paper.title.toLowerCase().includes(query) ||
          paper.authors.some((author) => author.toLowerCase().includes(query)) ||
          paper.tags?.some((tag) => tag.toLowerCase().includes(query))
        );
      });
    }

    if (filters.categories.length) {
      result = result.filter((paper) => filters.categories.includes(paper.category));
    }

    result = result.filter(
      (paper) => paper.year >= filters.yearRange[0] && paper.year <= filters.yearRange[1]
    );

    if (filters.familiarityLevels.length) {
      result = result.filter((paper) => {
        const level = paper.familiarity_level ?? 'not_started';
        return filters.familiarityLevels.includes(level);
      });
    }

    return [...result].sort((a, b) => b.year - a.year);
  }, [papers, filters]);

  if (isLoading) {
    return (
      <div className="p-4 text-center text-gray-500">
        <div className="mx-auto mb-2 h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        <p className="text-sm">논문 목록 로딩 중...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 text-center text-red-500">
        <p className="text-sm">논문 데이터를 불러오지 못했습니다.</p>
        <p className="mt-1 text-xs">Supabase 연결 상태를 확인해주세요.</p>
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
            에서 데이터를 먼저 불러오세요.
          </p>
        ) : (
          <p className="mt-1 text-xs">필터 조건을 조정해보세요.</p>
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
          isSelected={selectedPaperId === paper.id}
          onClick={() => openPaperDetail(paper.id)}
        />
      ))}
    </div>
  );
}

