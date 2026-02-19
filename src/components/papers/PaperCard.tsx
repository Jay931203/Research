import { Code, ExternalLink, Star } from 'lucide-react';
import type { FamiliarityLevel, PaperWithNote } from '@/types';
import {
  FAMILIARITY_LABELS,
  FAMILIARITY_SELECTABLE_LEVELS,
  getPaperCategoryLabel,
} from '@/lib/visualization/graphUtils';

interface PaperCardProps {
  paper: PaperWithNote;
  isSelected?: boolean;
  onClick?: () => void;
  onFavoriteToggle?: (paper: PaperWithNote) => void;
  onFamiliarityChange?: (paper: PaperWithNote, level: FamiliarityLevel) => void;
  isSaving?: boolean;
}

const familiarityStyles: Record<string, string> = {
  not_started: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200',
  difficult: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  moderate: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
  familiar: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  expert: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
};

const QUICK_FAMILIARITY_LEVELS: FamiliarityLevel[] = FAMILIARITY_SELECTABLE_LEVELS;

export default function PaperCard({
  paper,
  isSelected,
  onClick,
  onFavoriteToggle,
  onFamiliarityChange,
  isSaving = false,
}: PaperCardProps) {
  const familiarity = paper.familiarity_level ?? 'not_started';
  const normalizedFamiliarity: FamiliarityLevel =
    familiarity === 'expert' ? 'familiar' : familiarity;

  return (
    <article
      className={`cursor-pointer rounded-lg border p-4 transition hover:shadow-md ${
        isSelected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800'
      }`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick?.();
        }
      }}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="line-clamp-2 flex-1 text-sm font-semibold">{paper.title}</h3>
        <button
          type="button"
          aria-label={paper.is_favorite ? '즐겨찾기 해제' : '즐겨찾기'}
          title={paper.is_favorite ? '즐겨찾기 해제' : '즐겨찾기'}
          disabled={isSaving || !onFavoriteToggle}
          onClick={(event) => {
            event.stopPropagation();
            if (!onFavoriteToggle || isSaving) return;
            onFavoriteToggle(paper);
          }}
          className={`rounded p-0.5 transition ${
            isSaving || !onFavoriteToggle
              ? 'cursor-not-allowed opacity-60'
              : 'hover:bg-amber-50 dark:hover:bg-amber-900/20'
          }`}
        >
          <Star
            className={`h-4 w-4 flex-shrink-0 ${
              paper.is_favorite ? 'fill-yellow-500 text-yellow-500' : 'text-gray-400'
            }`}
          />
        </button>
      </div>

      <div className="mb-2 text-xs text-gray-600 dark:text-gray-400">
        <span className="font-medium">{paper.authors[0]}</span>
        {paper.authors.length > 1 && ` 외 ${paper.authors.length - 1}명`}
        <span className="mx-2">•</span>
        <span>{paper.year}</span>
        {paper.venue ? (
          <>
            <span className="mx-2">•</span>
            <span className="italic">{paper.venue}</span>
          </>
        ) : null}
      </div>

      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span
          className="inline-flex items-center rounded px-2 py-1 text-xs font-medium"
          style={{ backgroundColor: `${paper.color_hex}20`, color: paper.color_hex }}
        >
          {getPaperCategoryLabel(paper)}
        </span>

        <span
          className={`inline-flex items-center rounded px-2 py-1 text-xs font-medium ${
            familiarityStyles[familiarity] ?? familiarityStyles.not_started
          }`}
        >
          {FAMILIARITY_LABELS[familiarity] ?? familiarity}
        </span>
      </div>

      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        {QUICK_FAMILIARITY_LEVELS.map((level, idx) => {
          const active = normalizedFamiliarity === level;
          return (
            <button
              key={level}
              type="button"
              disabled={isSaving || !onFamiliarityChange}
              title={`익숙도 ${idx}단계 저장`}
              onClick={(event) => {
                event.stopPropagation();
                if (!onFamiliarityChange || isSaving) return;
                onFamiliarityChange(paper, level);
              }}
              className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold transition ${
                active
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-gray-300 bg-white text-gray-600 hover:border-blue-400 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300'
              } ${isSaving || !onFamiliarityChange ? 'cursor-not-allowed opacity-60' : ''}`}
            >
              ★{idx}
            </button>
          );
        })}
        {isSaving && (
          <span className="text-[10px] font-medium text-blue-600 dark:text-blue-300">저장 중...</span>
        )}
      </div>

      {!!paper.tags?.length && (
        <div className="mb-2 flex flex-wrap items-center gap-1">
          {paper.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-300"
            >
              {tag}
            </span>
          ))}
          {paper.tags.length > 3 && (
            <span className="text-xs text-gray-500">+{paper.tags.length - 3}</span>
          )}
        </div>
      )}

      <div className="mt-2 flex items-center gap-3 border-t pt-2 dark:border-gray-700">
        {paper.pdf_url && (
          <a
            href={paper.pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-blue-600 transition hover:text-blue-800"
            onClick={(event) => event.stopPropagation()}
          >
            <ExternalLink className="h-3 w-3" />
            PDF
          </a>
        )}
        {paper.code_url && (
          <a
            href={paper.code_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-blue-600 transition hover:text-blue-800"
            onClick={(event) => event.stopPropagation()}
          >
            <Code className="h-3 w-3" />
            Code
          </a>
        )}
      </div>
    </article>
  );
}
