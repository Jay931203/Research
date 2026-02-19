'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import type { PaperNodeData } from '@/types';
import {
  colorWithAlpha,
  getFamiliarityBackgroundIntensity,
  FAMILIARITY_COLORS,
  FAMILIARITY_LABELS,
  RESEARCH_TOPIC_LABELS,
  getFamiliarityOpacity,
  inferResearchTopic,
} from '@/lib/visualization/graphUtils';
import { Star, BookOpen } from 'lucide-react';

function CustomNodeComponent({ data, selected }: NodeProps<PaperNodeData>) {
  const { paper, familiarity_level, is_favorite, apply_familiarity_opacity } = data;

  const familiarityColor = familiarity_level
    ? FAMILIARITY_COLORS[familiarity_level]
    : FAMILIARITY_COLORS.not_started;
  const familiarityLabel = familiarity_level
    ? FAMILIARITY_LABELS[familiarity_level]
    : FAMILIARITY_LABELS.not_started;
  const familiarityOpacity = getFamiliarityOpacity(familiarity_level);
  const familiarityBackgroundIntensity = getFamiliarityBackgroundIntensity(familiarity_level);
  const emphasizedBackground = colorWithAlpha(familiarityColor, familiarityBackgroundIntensity);
  const researchTopic = inferResearchTopic(paper);
  const researchTopicLabel = RESEARCH_TOPIC_LABELS[researchTopic];

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
      style={{
        borderColor: paper.color_hex,
        opacity: selected ? 1 : apply_familiarity_opacity ? familiarityOpacity : 1,
        backgroundColor:
          apply_familiarity_opacity && !selected ? emphasizedBackground : undefined,
        boxShadow:
          apply_familiarity_opacity && !selected
            ? `0 8px 22px ${colorWithAlpha(familiarityColor, 0.18)}`
            : undefined,
      }}
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

      {/* 헤더: 연도 + 주제 + 즐겨찾기 */}
      <div className="flex items-center justify-between mb-1.5 mt-1">
        <div className="flex items-center gap-1">
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full text-white"
            style={{ backgroundColor: paper.color_hex }}
          >
            {paper.year}
          </span>
          <span className="max-w-[120px] truncate rounded-full border border-gray-200 px-1.5 py-0.5 text-[9px] font-semibold text-gray-600 dark:border-gray-700 dark:text-gray-300">
            {researchTopicLabel}
          </span>
        </div>
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
