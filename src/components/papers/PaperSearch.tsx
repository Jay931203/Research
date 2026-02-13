'use client';

import { Search, Filter, X } from 'lucide-react';
import { useState } from 'react';

interface PaperSearchProps {
  filters: {
    searchText: string;
    categories: string[];
    yearRange: [number, number];
    familiarityLevels: string[];
  };
  onFilterChange: (filters: PaperSearchProps['filters']) => void;
}

const CATEGORIES = [
  { value: 'csi_compression', label: 'CSI Compression' },
  { value: 'autoencoder', label: 'AutoEncoder' },
  { value: 'quantization', label: 'Quantization' },
  { value: 'transformer', label: 'Transformer' },
  { value: 'cnn', label: 'CNN' },
  { value: 'other', label: 'Other' },
];

const FAMILIARITY_LEVELS = [
  { value: 'not_started', label: '미시작' },
  { value: 'difficult', label: '어려움' },
  { value: 'moderate', label: '보통' },
  { value: 'familiar', label: '익숙' },
  { value: 'expert', label: '전문가' },
];

export default function PaperSearch({ filters, onFilterChange }: PaperSearchProps) {
  const [showFilters, setShowFilters] = useState(false);

  const handleSearchChange = (text: string) => {
    onFilterChange({ ...filters, searchText: text });
  };

  const handleCategoryToggle = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];
    onFilterChange({ ...filters, categories: newCategories });
  };

  const handleFamiliarityToggle = (level: string) => {
    const newLevels = filters.familiarityLevels.includes(level)
      ? filters.familiarityLevels.filter((l) => l !== level)
      : [...filters.familiarityLevels, level];
    onFilterChange({ ...filters, familiarityLevels: newLevels });
  };

  const handleYearChange = (index: 0 | 1, value: number) => {
    const newRange: [number, number] = [...filters.yearRange];
    newRange[index] = value;
    onFilterChange({ ...filters, yearRange: newRange });
  };

  const clearFilters = () => {
    onFilterChange({
      searchText: '',
      categories: [],
      yearRange: [2018, 2026],
      familiarityLevels: [],
    });
  };

  const hasActiveFilters =
    filters.searchText ||
    filters.categories.length > 0 ||
    filters.familiarityLevels.length > 0 ||
    filters.yearRange[0] !== 2018 ||
    filters.yearRange[1] !== 2026;

  return (
    <div className="space-y-3">
      {/* 검색 바 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={filters.searchText}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="논문 검색..."
          className="w-full pl-10 pr-10 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
        />
        {filters.searchText && (
          <button
            onClick={() => handleSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* 필터 토글 버튼 */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <Filter className="h-4 w-4" />
          <span>필터</span>
          {hasActiveFilters && (
            <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
              {[
                filters.categories.length,
                filters.familiarityLevels.length,
                filters.searchText ? 1 : 0,
              ]
                .filter(Boolean)
                .reduce((a, b) => a + b, 0)}
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-blue-500 hover:text-blue-700"
          >
            초기화
          </button>
        )}
      </div>

      {/* 필터 패널 */}
      {showFilters && (
        <div className="space-y-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border">
          {/* 카테고리 */}
          <div>
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              카테고리
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => handleCategoryToggle(cat.value)}
                  className={`px-3 py-1 text-xs rounded-full border transition ${
                    filters.categories.includes(cat.value)
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* 익숙함 레벨 */}
          <div>
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              익숙함 레벨
            </label>
            <div className="flex flex-wrap gap-2">
              {FAMILIARITY_LEVELS.map((level) => (
                <button
                  key={level.value}
                  onClick={() => handleFamiliarityToggle(level.value)}
                  className={`px-3 py-1 text-xs rounded-full border transition ${
                    filters.familiarityLevels.includes(level.value)
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
                  }`}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>

          {/* 연도 범위 */}
          <div>
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              연도: {filters.yearRange[0]} - {filters.yearRange[1]}
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={2010}
                max={2026}
                value={filters.yearRange[0]}
                onChange={(e) => handleYearChange(0, parseInt(e.target.value))}
                className="flex-1"
              />
              <input
                type="range"
                min={2010}
                max={2026}
                value={filters.yearRange[1]}
                onChange={(e) => handleYearChange(1, parseInt(e.target.value))}
                className="flex-1"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
