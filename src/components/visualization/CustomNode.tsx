'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import type { PaperNodeData } from '@/types';
import { FAMILIARITY_COLORS, FAMILIARITY_LABELS } from '@/lib/visualization/graphUtils';
import { Star, BookOpen } from 'lucide-react';

function CustomNodeComponent({ data, selected }: NodeProps<PaperNodeData>) {
  const { paper, familiarity_level, is_favorite } = data;

  const familiarityColor = familiarity_level
    ? FAMILIARITY_COLORS[familiarity_level]
    : FAMILIARITY_COLORS.not_started;
  const familiarityLabel = familiarity_level
    ? FAMILIARITY_LABELS[familiarity_level]
    : FAMILIARITY_LABELS.not_started;

  // 논문 제목 줄이기
  const shortTitle =
    paper.title.length > 40 ? paper.title.substring(0, 37) + '...' : paper.title;

  return (
    <div
      className={`
        relative px-4 py-3 rounded-xl shadow-lg border-2 transition-all duration-200
        bg-white dark:bg-gray-800 min-w-[220px] max-w-[260px]
        ${selected ? 'ring-2 ring-blue-400 scale-105' : 'hover:shadow-xl hover:scale-[1.02]'}
      `}
      style={{ borderColor: paper.color_hex }}
    >
      {/* 상단 핸들 (입력) */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !border-2 !border-white"
        style={{ background: paper.color_hex }}
      />

      {/* 카테고리 바 */}
      <div
        className="absolute top-0 left-4 right-4 h-1 rounded-b-full"
        style={{ backgroundColor: paper.color_hex }}
      />

      {/* 헤더: 연도 + 즐겨찾기 */}
      <div className="flex items-center justify-between mb-1.5 mt-1">
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full text-white"
          style={{ backgroundColor: paper.color_hex }}
        >
          {paper.year}
        </span>
        <div className="flex items-center gap-1">
          {is_favorite && (
            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
          )}
          <BookOpen className="w-3.5 h-3.5 text-gray-400" />
        </div>
      </div>

      {/* 제목 */}
      <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 leading-tight mb-2">
        {shortTitle}
      </h3>

      {/* 저자 */}
      <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate mb-2">
        {paper.authors[0]}
        {paper.authors.length > 1 && ` +${paper.authors.length - 1}`}
      </p>

      {/* 하단: 익숙함 레벨 */}
      <div className="flex items-center gap-1.5">
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: familiarityColor }}
        />
        <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
          {familiarityLabel}
        </span>
        {paper.tags && paper.tags.length > 0 && (
          <span className="text-[10px] text-gray-400 ml-auto">
            #{paper.tags[0]}
          </span>
        )}
      </div>

      {/* 하단 핸들 (출력) */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !border-2 !border-white"
        style={{ background: paper.color_hex }}
      />
    </div>
  );
}

export default memo(CustomNodeComponent);
