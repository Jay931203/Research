'use client';

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

  // 필터링된 논문 목록
  const filteredPapers = useMemo(() => {
    let result = papers;

    // 검색 텍스트
    if (filters.searchText) {
      const search = filters.searchText.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(search) ||
          p.authors.some((a) => a.toLowerCase().includes(search)) ||
          p.tags?.some((t) => t.toLowerCase().includes(search))
      );
    }

    // 카테고리 필터
    if (filters.categories.length > 0) {
      result = result.filter((p) => filters.categories.includes(p.category));
    }

    // 연도 범위
    result = result.filter(
      (p) => p.year >= filters.yearRange[0] && p.year <= filters.yearRange[1]
    );

    // 익숙함 레벨
    if (filters.familiarityLevels.length > 0) {
      result = result.filter((p) =>
        p.familiarity_level
          ? filters.familiarityLevels.includes(p.familiarity_level)
          : filters.familiarityLevels.includes('not_started')
      );
    }

    return result;
  }, [papers, filters]);

  if (isLoading) {
    return (
      <div className="p-4 text-center text-gray-500">
        <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2" />
        <p className="text-sm">논문 로드 중...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 text-center text-red-500">
        <p className="text-sm">❌ 논문을 불러오는데 실패했습니다.</p>
        <p className="text-xs mt-1">Supabase 연결을 확인하세요.</p>
      </div>
    );
  }

  if (filteredPapers.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p className="text-sm">📭 논문이 없습니다.</p>
        {papers.length === 0 ? (
          <p className="text-xs mt-1">
            <a href="/import" className="text-blue-500 hover:underline">
              Import 페이지
            </a>
            에서 초기 데이터를 로드하세요.
          </p>
        ) : (
          <p className="text-xs mt-1">필터 조건을 변경해보세요.</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4">
      {/* 결과 카운트 */}
      <div className="text-xs text-gray-500 mb-2">
        총 {filteredPapers.length}개의 논문
      </div>

      {/* 논문 카드 리스트 */}
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
