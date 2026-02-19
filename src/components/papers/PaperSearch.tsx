'use client';

import { useMemo, useState } from 'react';
import { Filter, Search, X } from 'lucide-react';
import type { PaperSearchFilters } from '@/lib/papers/filtering';
import type { FamiliarityLevel } from '@/types';
import {
  FAMILIARITY_LABELS,
  FAMILIARITY_SELECTABLE_LEVELS,
} from '@/lib/visualization/graphUtils';

interface PaperSearchProps {
  filters: PaperSearchFilters;
  onFilterChange: (filters: PaperSearchFilters) => void;
  yearBounds: [number, number];
}

const CATEGORIES = [
  { value: 'csi_compression', label: 'CSI Compression' },
  { value: 'autoencoder', label: 'AutoEncoder' },
  { value: 'quantization', label: 'Quantization' },
  { value: 'transformer', label: 'Transformer' },
  { value: 'cnn', label: 'CNN' },
  { value: 'representation_learning', label: 'Representation Learning' },
  { value: 'other', label: 'Other' },
];

const FAMILIARITY_LEVELS = FAMILIARITY_SELECTABLE_LEVELS.map((value) => ({
  value,
  label: FAMILIARITY_LABELS[value],
}));

const IMPORTANCE_LEVELS = [1, 2, 3, 4, 5] as const;

export default function PaperSearch({
  filters,
  onFilterChange,
  yearBounds,
}: PaperSearchProps) {
  const [showFilters, setShowFilters] = useState(false);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.searchText.trim()) count += 1;
    count += filters.categories.length;
    count += filters.familiarityLevels.length;
    count += filters.importanceRatings.length;
    if (
      filters.yearRange[0] !== yearBounds[0] ||
      filters.yearRange[1] !== yearBounds[1]
    ) {
      count += 1;
    }
    return count;
  }, [filters, yearBounds]);

  const hasActiveFilters = activeFilterCount > 0;

  const clearFilters = () => {
    onFilterChange({
      searchText: '',
      categories: [],
      yearRange: yearBounds,
      familiarityLevels: [],
      importanceRatings: [],
    });
  };

  const handleSearchChange = (searchText: string) => {
    onFilterChange({ ...filters, searchText });
  };

  const toggleCategory = (category: string) => {
    const categories = filters.categories.includes(category)
      ? filters.categories.filter((item) => item !== category)
      : [...filters.categories, category];
    onFilterChange({ ...filters, categories });
  };

  const toggleFamiliarity = (level: FamiliarityLevel) => {
    const familiarityLevels = filters.familiarityLevels.includes(level)
      ? filters.familiarityLevels.filter((item) => item !== level)
      : [...filters.familiarityLevels, level];
    onFilterChange({ ...filters, familiarityLevels });
  };

  const toggleImportance = (rating: number) => {
    const importanceRatings = filters.importanceRatings.includes(rating)
      ? filters.importanceRatings.filter((item) => item !== rating)
      : [...filters.importanceRatings, rating];
    onFilterChange({ ...filters, importanceRatings });
  };

  const handleYearRangeChange = (index: 0 | 1, value: number) => {
    const nextRange: [number, number] = [...filters.yearRange];
    nextRange[index] = value;

    if (nextRange[0] > nextRange[1]) {
      if (index === 0) nextRange[1] = value;
      if (index === 1) nextRange[0] = value;
    }

    onFilterChange({ ...filters, yearRange: nextRange });
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={filters.searchText}
          onChange={(event) => handleSearchChange(event.target.value)}
          placeholder="논문 제목, 저자, 태그 검색"
          className="input-base !pl-10 !pr-10"
        />
        {!!filters.searchText && (
          <button
            onClick={() => handleSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-600 dark:hover:text-gray-200"
            aria-label="검색어 지우기"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowFilters((prev) => !prev)}
          className="flex items-center gap-2 text-sm text-gray-600 transition hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
        >
          <Filter className="h-4 w-4" />
          <span>필터</span>
          {hasActiveFilters && (
            <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs font-semibold text-blue-600 transition hover:text-blue-700"
          >
            초기화
          </button>
        )}
      </div>

      {showFilters && (
        <div className="space-y-4 rounded-lg border bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50">
          <div>
            <label className="mb-2 block text-xs font-semibold text-gray-700 dark:text-gray-300">
              카테고리
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((category) => (
                <button
                  key={category.value}
                  onClick={() => toggleCategory(category.value)}
                  className={`rounded-full border px-3 py-1 text-xs transition ${
                    filters.categories.includes(category.value)
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-gray-700 dark:text-gray-300">
              익숙도
            </label>
            <div className="flex flex-wrap gap-2">
              {FAMILIARITY_LEVELS.map((level) => (
                <button
                  key={level.value}
                  onClick={() => toggleFamiliarity(level.value)}
                  className={`rounded-full border px-3 py-1 text-xs transition ${
                    filters.familiarityLevels.includes(level.value)
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200'
                  }`}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-gray-700 dark:text-gray-300">
              중요도
            </label>
            <div className="flex flex-wrap gap-2">
              {IMPORTANCE_LEVELS.map((level) => (
                <button
                  key={level}
                  onClick={() => toggleImportance(level)}
                  className={`rounded-full border px-3 py-1 text-xs transition ${
                    filters.importanceRatings.includes(level)
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-gray-700 dark:text-gray-300">
              연도 범위: {filters.yearRange[0]} - {filters.yearRange[1]}
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min={yearBounds[0]}
                max={yearBounds[1]}
                value={filters.yearRange[0]}
                onChange={(event) => handleYearRangeChange(0, Number(event.target.value))}
                className="w-full"
              />
              <input
                type="range"
                min={yearBounds[0]}
                max={yearBounds[1]}
                value={filters.yearRange[1]}
                onChange={(event) => handleYearRangeChange(1, Number(event.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
