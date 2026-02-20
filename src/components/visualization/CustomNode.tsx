'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { BookOpen, Star, X } from 'lucide-react';
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

function CustomNodeComponent({ data, selected }: NodeProps<PaperNodeData>) {
  const { paper, familiarity_level, is_favorite, apply_familiarity_opacity, on_remove_paper } = data;

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
  const shortTitle = paper.title.length > 40 ? `${paper.title.substring(0, 37)}...` : paper.title;

  return (
    <div
      className={`
        relative rounded-xl border-2 px-4 py-3 shadow-lg transition-all duration-200
        min-w-[220px] max-w-[260px] bg-white dark:bg-gray-800
        ${selected ? 'scale-105 ring-2 ring-blue-400' : 'hover:scale-[1.02] hover:shadow-xl'}
      `}
      style={{
        borderColor: paper.color_hex,
        opacity: selected ? 1 : apply_familiarity_opacity ? familiarityOpacity : 1,
        backgroundColor: apply_familiarity_opacity && !selected ? emphasizedBackground : undefined,
        boxShadow:
          apply_familiarity_opacity && !selected
            ? `0 8px 22px ${colorWithAlpha(familiarityColor, 0.18)}`
            : undefined,
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!h-3 !w-3 !border-2 !border-white"
        style={{ background: paper.color_hex }}
      />

      <div
        className="absolute left-4 right-4 top-0 h-1 rounded-b-full"
        style={{ backgroundColor: paper.color_hex }}
      />

      {on_remove_paper && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            on_remove_paper(paper.id);
          }}
          className="absolute right-2 top-2 rounded-md border border-gray-200 bg-white/95 p-1 text-gray-500 transition hover:bg-red-50 hover:text-red-600 dark:border-gray-700 dark:bg-gray-900/95 dark:text-gray-300 dark:hover:bg-red-900/30 dark:hover:text-red-300"
          title="맵에서 제거"
          aria-label="맵에서 제거"
        >
          <X className="h-3 w-3" />
        </button>
      )}

      <div className="mb-1.5 mt-1 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span
            className="rounded-full px-2 py-0.5 text-xs font-semibold text-white"
            style={{ backgroundColor: paper.color_hex }}
          >
            {paper.year}
          </span>
          <span className="max-w-[120px] truncate rounded-full border border-gray-200 px-1.5 py-0.5 text-[9px] font-semibold text-gray-600 dark:border-gray-700 dark:text-gray-300">
            {researchTopicLabel}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {is_favorite && <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />}
          <BookOpen className="h-3.5 w-3.5 text-gray-400" />
        </div>
      </div>

      <h3 className="mb-2 text-sm font-bold leading-tight text-gray-800 dark:text-gray-100">{shortTitle}</h3>

      <p className="mb-2 truncate text-[10px] text-gray-500 dark:text-gray-400">
        {paper.authors[0]}
        {paper.authors.length > 1 && ` +${paper.authors.length - 1}`}
      </p>

      <div className="flex items-center gap-1.5">
        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: familiarityColor }} />
        <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">{familiarityLabel}</span>
        {paper.tags && paper.tags.length > 0 && (
          <span className="ml-auto text-[10px] text-gray-400">#{paper.tags[0]}</span>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-3 !w-3 !border-2 !border-white"
        style={{ background: paper.color_hex }}
      />
    </div>
  );
}

export default memo(CustomNodeComponent);
