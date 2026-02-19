'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import PaperSearch from '@/components/papers/PaperSearch';
import PaperList from '@/components/papers/PaperList';
import PaperFormModal from '@/components/papers/PaperFormModal';
import { usePapersWithNotes } from '@/hooks/useNotes';
import { filterPapersBySearchFilters, type PaperSearchFilters } from '@/lib/papers/filtering';
import { useAppStore } from '@/store/useAppStore';
import type { FamiliarityLevel } from '@/types';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const SIDEBAR_FILTERS_STORAGE_KEY = 'sidebar-paper-search-filters-v1';

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const currentYear = new Date().getFullYear();
  const [showAddModal, setShowAddModal] = useState(false);
  const { papers, refresh } = usePapersWithNotes();
  const setSidebarVisiblePaperIds = useAppStore((state) => state.setSidebarVisiblePaperIds);
  const [isSearchFilterHydrated, setIsSearchFilterHydrated] = useState(false);

  const yearBounds = useMemo<[number, number]>(() => {
    if (!papers.length) return [2018, currentYear];
    const years = papers.map((paper) => paper.year).sort((a, b) => a - b);
    return [years[0], years[years.length - 1]];
  }, [papers, currentYear]);

  const [searchFilters, setSearchFilters] = useState<PaperSearchFilters>({
    searchText: '',
    categories: [] as string[],
    yearRange: yearBounds,
    familiarityLevels: [] as FamiliarityLevel[],
    importanceRatings: [] as number[],
  });

  useEffect(() => {
    try {
      const fallbackYearRange: [number, number] = [2018, new Date().getFullYear()];
      const raw = localStorage.getItem(SIDEBAR_FILTERS_STORAGE_KEY);
      if (!raw) {
        setIsSearchFilterHydrated(true);
        return;
      }

      const parsed = JSON.parse(raw) as Partial<{
        searchText: string;
        categories: string[];
        yearRange: [number, number];
        familiarityLevels: string[];
        importanceRatings: number[];
      }>;

      const nextSearchText = typeof parsed.searchText === 'string' ? parsed.searchText : '';
      const nextCategories = Array.isArray(parsed.categories)
        ? parsed.categories.filter((item): item is string => typeof item === 'string')
        : [];
      const nextYearRange =
        Array.isArray(parsed.yearRange) &&
        parsed.yearRange.length === 2 &&
        typeof parsed.yearRange[0] === 'number' &&
        typeof parsed.yearRange[1] === 'number'
          ? (parsed.yearRange as [number, number])
          : fallbackYearRange;
      const nextFamiliarityLevels = Array.isArray(parsed.familiarityLevels)
        ? Array.from(
            new Set(
              parsed.familiarityLevels
                .map((level) => (level === 'expert' ? 'familiar' : level))
                .filter(
                  (level): level is FamiliarityLevel =>
                    level === 'not_started' ||
                    level === 'difficult' ||
                    level === 'moderate' ||
                    level === 'familiar'
                )
            )
          )
        : [];
      const nextImportanceRatings = Array.isArray(parsed.importanceRatings)
        ? Array.from(
            new Set(
              parsed.importanceRatings.filter(
                (value): value is number =>
                  typeof value === 'number' && value >= 1 && value <= 5
              )
            )
          )
        : [];

      setSearchFilters({
        searchText: nextSearchText,
        categories: nextCategories,
        yearRange: nextYearRange,
        familiarityLevels: nextFamiliarityLevels,
        importanceRatings: nextImportanceRatings,
      });
    } catch (error) {
      console.warn('Failed to restore sidebar search filters:', error);
    } finally {
      setIsSearchFilterHydrated(true);
    }
  }, []);

  useEffect(() => {
    setSearchFilters((prev) => {
      const looksLikeInitialRange =
        prev.yearRange[0] === 2018 && prev.yearRange[1] === currentYear;
      if (looksLikeInitialRange) {
        return {
          ...prev,
          yearRange: yearBounds,
        };
      }

      const nextMin = Math.max(yearBounds[0], prev.yearRange[0]);
      const nextMax = Math.min(yearBounds[1], prev.yearRange[1]);
      const safeRange: [number, number] =
        nextMin <= nextMax ? [nextMin, nextMax] : yearBounds;

      return {
        ...prev,
        yearRange: safeRange,
      };
    });
  }, [yearBounds, currentYear]);

  useEffect(() => {
    if (!isSearchFilterHydrated) return;
    try {
      localStorage.setItem(SIDEBAR_FILTERS_STORAGE_KEY, JSON.stringify(searchFilters));
    } catch (error) {
      console.warn('Failed to persist sidebar search filters:', error);
    }
  }, [searchFilters, isSearchFilterHydrated]);

  const visiblePaperIds = useMemo(() => {
    if (!isSearchFilterHydrated) return null;
    return filterPapersBySearchFilters(papers, searchFilters).map((paper) => paper.id);
  }, [papers, searchFilters, isSearchFilterHydrated]);

  useEffect(() => {
    if (!isSearchFilterHydrated || visiblePaperIds === null) return;
    setSidebarVisiblePaperIds(visiblePaperIds);
  }, [isSearchFilterHydrated, visiblePaperIds, setSidebarVisiblePaperIds]);

  useEffect(() => {
    return () => {
      setSidebarVisiblePaperIds(null);
    };
  }, [setSidebarVisiblePaperIds]);

  return (
    <>
      {isOpen && (
        <button
          onClick={onToggle}
          className="fixed inset-0 top-16 z-30 bg-black/25 lg:hidden"
          aria-label="사이드바 닫기"
        />
      )}

      <aside
        className={`fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] border-r bg-white transition-transform duration-300 dark:border-gray-700 dark:bg-gray-900 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } w-[88vw] max-w-80 lg:w-80 lg:max-w-none`}
      >
        <div className="flex h-full flex-col">
          <div className="border-b p-4 dark:border-gray-700">
            <PaperSearch
              filters={searchFilters}
              onFilterChange={setSearchFilters}
              yearBounds={yearBounds}
            />
          </div>

          <div className="flex-1 overflow-y-auto">
            <PaperList filters={searchFilters} />
          </div>

          <div className="border-t border-gray-200 p-3 dark:border-gray-700">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              논문 추가
            </button>
          </div>
        </div>
      </aside>

      <button
        onClick={onToggle}
        className={`fixed top-[74px] z-50 rounded-r-md border bg-white p-3 shadow-md transition-all hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800 ${
          isOpen ? 'left-80 hidden lg:block' : 'left-0'
        }`}
        title={isOpen ? '사이드바 닫기' : '사이드바 열기'}
        aria-label={isOpen ? '사이드바 닫기' : '사이드바 열기'}
      >
        {isOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
      </button>

      <PaperFormModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSaved={refresh}
      />
    </>
  );
}
