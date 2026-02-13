import { Code, ExternalLink, Star } from 'lucide-react';
import type { PaperWithNote } from '@/types';
import { CATEGORY_LABELS, FAMILIARITY_LABELS } from '@/lib/visualization/graphUtils';

interface PaperCardProps {
  paper: PaperWithNote;
  isSelected?: boolean;
  onClick?: () => void;
}

const familiarityStyles: Record<string, string> = {
  not_started: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200',
  difficult: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  moderate: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  familiar: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  expert: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
};

export default function PaperCard({ paper, isSelected, onClick }: PaperCardProps) {
  const familiarity = paper.familiarity_level ?? 'not_started';

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
        {paper.is_favorite && <Star className="h-4 w-4 flex-shrink-0 fill-yellow-500 text-yellow-500" />}
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
          {CATEGORY_LABELS[paper.category] ?? paper.category}
        </span>

        <span
          className={`inline-flex items-center rounded px-2 py-1 text-xs font-medium ${
            familiarityStyles[familiarity] ?? familiarityStyles.not_started
          }`}
        >
          {FAMILIARITY_LABELS[familiarity] ?? familiarity}
        </span>
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

