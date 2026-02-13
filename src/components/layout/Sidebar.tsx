'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import PaperSearch from '@/components/papers/PaperSearch';
import PaperList from '@/components/papers/PaperList';
import PaperFormModal from '@/components/papers/PaperFormModal';
import { usePapersWithNotes } from '@/hooks/useNotes';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const [searchFilters, setSearchFilters] = useState({
    searchText: '',
    categories: [] as string[],
    yearRange: [2018, 2026] as [number, number],
    familiarityLevels: [] as string[],
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const { refresh } = usePapersWithNotes();

  return (
    <>
      {/* 사이드바 */}
      <aside
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white dark:bg-gray-900 border-r transition-all duration-300 z-40 ${
          isOpen ? 'w-80' : 'w-0'
        } overflow-hidden`}
      >
        <div className="flex flex-col h-full">
          {/* 검색 및 필터 */}
          <div className="p-4 border-b">
            <PaperSearch
              filters={searchFilters}
              onFilterChange={setSearchFilters}
            />
          </div>

          {/* 논문 리스트 */}
          <div className="flex-1 overflow-y-auto">
            <PaperList filters={searchFilters} />
          </div>

          {/* 논문 추가 버튼 */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setShowAddModal(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition"
            >
              <Plus className="w-4 h-4" />
              논문 추가
            </button>
          </div>
        </div>
      </aside>

      {/* 토글 버튼 */}
      <button
        onClick={onToggle}
        className={`fixed top-20 z-50 bg-white dark:bg-gray-900 border rounded-r-md p-2 shadow-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-all ${
          isOpen ? 'left-80' : 'left-0'
        }`}
        title={isOpen ? '사이드바 닫기' : '사이드바 열기'}
      >
        {isOpen ? (
          <ChevronLeft className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </button>

      {/* 논문 추가 모달 */}
      <PaperFormModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSaved={refresh}
      />
    </>
  );
}
