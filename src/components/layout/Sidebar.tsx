'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import PaperSearch from '@/components/papers/PaperSearch';
import PaperList from '@/components/papers/PaperList';
import PaperFormModal from '@/components/papers/PaperFormModal';
import { usePapersWithNotes } from '@/hooks/useNotes';
import { filterPapersBySearchFilters, type PaperSearchFilters } from '@/lib/papers/filtering';
import { RELATIONSHIP_STYLES } from '@/lib/visualization/graphUtils';
import {
  CORE_RELATIONSHIP_TYPES,
  DEFAULT_GRAPH_FILTER_SETTINGS,
  type GraphFilterSettings,
  useAppStore,
} from '@/store/useAppStore';
import type { FamiliarityLevel, RelationshipType } from '@/types';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onPaperClick?: (paperId: string) => void;
}

const SIDEBAR_FILTERS_STORAGE_KEY = 'sidebar-paper-search-filters-v1';
const ALL_RELATIONSHIP_TYPES = Object.keys(RELATIONSHIP_STYLES) as RelationshipType[];

function normalizeGraphFilterSettings(
  input: Partial<GraphFilterSettings> | undefined
): GraphFilterSettings {
  if (!input) return DEFAULT_GRAPH_FILTER_SETTINGS;

  const normalizedTypes = Array.isArray(input.enabledRelationshipTypes)
    ? Array.from(
        new Set(
          input.enabledRelationshipTypes.filter((type): type is RelationshipType =>
            ALL_RELATIONSHIP_TYPES.includes(type)
          )
        )
      )
    : DEFAULT_GRAPH_FILTER_SETTINGS.enabledRelationshipTypes;

  return {
    minStrength:
      typeof input.minStrength === 'number' && Number.isFinite(input.minStrength)
        ? Math.max(1, Math.min(10, Math.round(input.minStrength)))
        : DEFAULT_GRAPH_FILTER_SETTINGS.minStrength,
    enabledRelationshipTypes:
      normalizedTypes.length > 0 ? normalizedTypes : CORE_RELATIONSHIP_TYPES,
    useFamiliarityOpacity:
      typeof input.useFamiliarityOpacity === 'boolean'
        ? input.useFamiliarityOpacity
        : DEFAULT_GRAPH_FILTER_SETTINGS.useFamiliarityOpacity,
  };
}

export default function Sidebar({ isOpen, onToggle, onPaperClick }: SidebarProps) {
  const currentYear = new Date().getFullYear();
  const [showAddModal, setShowAddModal] = useState(false);
  const { papers, refresh } = usePapersWithNotes();
  const setSidebarVisiblePaperIds = useAppStore((state) => state.setSidebarVisiblePaperIds);
  const graphFilterSettings = useAppStore((state) => state.graphFilterSettings);
  const setGraphFilterSettings = useAppStore((state) => state.setGraphFilterSettings);
  const resetGraphFilterSettings = useAppStore((state) => state.resetGraphFilterSettings);
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
        searchFilters: Partial<PaperSearchFilters>;
        graphFilterSettings: Partial<GraphFilterSettings>;
        searchText: string;
        categories: string[];
        yearRange: [number, number];
        familiarityLevels: string[];
        importanceRatings: number[];
      }>;

      const source = parsed.searchFilters ?? parsed;

      const nextSearchText = typeof source.searchText === 'string' ? source.searchText : '';
      const nextCategories = Array.isArray(source.categories)
        ? source.categories.filter((item): item is string => typeof item === 'string')
        : [];
      const nextYearRange =
        Array.isArray(source.yearRange) &&
        source.yearRange.length === 2 &&
        typeof source.yearRange[0] === 'number' &&
        typeof source.yearRange[1] === 'number'
          ? (source.yearRange as [number, number])
          : fallbackYearRange;
      const nextFamiliarityLevels = Array.isArray(source.familiarityLevels)
        ? Array.from(
            new Set(
              source.familiarityLevels
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
      const nextImportanceRatings = Array.isArray(source.importanceRatings)
        ? Array.from(
            new Set(
              source.importanceRatings.filter(
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

      setGraphFilterSettings(normalizeGraphFilterSettings(parsed.graphFilterSettings));
    } catch (error) {
      console.warn('Failed to restore sidebar filters:', error);
    } finally {
      setIsSearchFilterHydrated(true);
    }
  }, [setGraphFilterSettings]);

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
      localStorage.setItem(
        SIDEBAR_FILTERS_STORAGE_KEY,
        JSON.stringify({
          searchFilters,
          graphFilterSettings,
        })
      );
    } catch (error) {
      console.warn('Failed to persist sidebar filters:', error);
    }
  }, [searchFilters, graphFilterSettings, isSearchFilterHydrated]);

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

  const toggleRelationshipType = useCallback(
    (type: RelationshipType) => {
      const nextTypes = graphFilterSettings.enabledRelationshipTypes.includes(type)
        ? graphFilterSettings.enabledRelationshipTypes.filter((value) => value !== type)
        : [...graphFilterSettings.enabledRelationshipTypes, type];
      setGraphFilterSettings(
        normalizeGraphFilterSettings({
          ...graphFilterSettings,
          enabledRelationshipTypes: nextTypes,
        })
      );
    },
    [graphFilterSettings, setGraphFilterSettings]
  );

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

            <div className="mt-4 space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">그래프 필터</p>
                <button
                  onClick={resetGraphFilterSettings}
                  className="text-[10px] font-semibold text-blue-600 hover:text-blue-700"
                >
                  초기화
                </button>
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between text-[11px] text-gray-600 dark:text-gray-300">
                  <span>관계 최소 강도</span>
                  <span>{graphFilterSettings.minStrength}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={graphFilterSettings.minStrength}
                  onChange={(event) =>
                    setGraphFilterSettings({
                      ...graphFilterSettings,
                      minStrength: Number(event.target.value),
                    })
                  }
                  className="w-full"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() =>
                      setGraphFilterSettings({
                        ...graphFilterSettings,
                        enabledRelationshipTypes: CORE_RELATIONSHIP_TYPES,
                      })
                    }
                    className={`rounded-md px-2 py-1 text-[10px] font-semibold ${
                      graphFilterSettings.enabledRelationshipTypes.length <= CORE_RELATIONSHIP_TYPES.length
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
                    }`}
                  >
                    핵심 관계
                  </button>
                  <button
                    onClick={() =>
                      setGraphFilterSettings({
                        ...graphFilterSettings,
                        enabledRelationshipTypes: ALL_RELATIONSHIP_TYPES,
                      })
                    }
                    className={`rounded-md px-2 py-1 text-[10px] font-semibold ${
                      graphFilterSettings.enabledRelationshipTypes.length === ALL_RELATIONSHIP_TYPES.length
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
                    }`}
                  >
                    전체 관계
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {ALL_RELATIONSHIP_TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() => toggleRelationshipType(type)}
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                        graphFilterSettings.enabledRelationshipTypes.includes(type)
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-gray-300 bg-white text-gray-600 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300'
                      }`}
                    >
                      {RELATIONSHIP_STYLES[type].label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between rounded-md border border-gray-200 bg-white px-2 py-1.5 text-[11px] dark:border-gray-700 dark:bg-gray-900">
                <span className="text-gray-600 dark:text-gray-300">익숙도 불투명도 적용</span>
                <button
                  onClick={() =>
                    setGraphFilterSettings({
                      ...graphFilterSettings,
                      useFamiliarityOpacity: !graphFilterSettings.useFamiliarityOpacity,
                    })
                  }
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    graphFilterSettings.useFamiliarityOpacity
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
                  }`}
                >
                  {graphFilterSettings.useFamiliarityOpacity ? '켜짐' : '꺼짐'}
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <PaperList filters={searchFilters} onPaperClick={onPaperClick} />
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
