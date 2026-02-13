import { Star, ExternalLink, Code } from 'lucide-react';
import type { PaperWithNote } from '@/types';

interface PaperCardProps {
  paper: PaperWithNote;
  isSelected?: boolean;
  onClick?: () => void;
}

// 익숙함 레벨 색상 매핑
const familiarityColors = {
  not_started: 'bg-gray-200 text-gray-700',
  difficult: 'bg-red-100 text-red-700',
  moderate: 'bg-yellow-100 text-yellow-700',
  familiar: 'bg-green-100 text-green-700',
  expert: 'bg-blue-100 text-blue-700',
};

const familiarityLabels = {
  not_started: '미시작',
  difficult: '어려움',
  moderate: '보통',
  familiar: '익숙',
  expert: '전문가',
};

export default function PaperCard({ paper, isSelected, onClick }: PaperCardProps) {
  return (
    <div
      className={`p-4 border rounded-lg cursor-pointer transition hover:shadow-md ${
        isSelected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 hover:border-gray-300'
      }`}
      onClick={onClick}
    >
      {/* 헤더: 제목 + 즐겨찾기 */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-sm line-clamp-2 flex-1">
          {paper.title}
        </h3>
        {paper.is_favorite && (
          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
        )}
      </div>

      {/* 저자 및 연도 */}
      <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
        <span className="font-medium">{paper.authors[0]}</span>
        {paper.authors.length > 1 && ` 외 ${paper.authors.length - 1}명`}
        <span className="mx-2">•</span>
        <span>{paper.year}</span>
        {paper.venue && (
          <>
            <span className="mx-2">•</span>
            <span className="italic">{paper.venue}</span>
          </>
        )}
      </div>

      {/* 카테고리 및 익숙함 레벨 */}
      <div className="flex items-center gap-2 flex-wrap mb-2">
        <span
          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium"
          style={{ backgroundColor: paper.color_hex + '20', color: paper.color_hex }}
        >
          {paper.category}
        </span>

        {paper.familiarity_level && (
          <span
            className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
              familiarityColors[paper.familiarity_level]
            }`}
          >
            {familiarityLabels[paper.familiarity_level]}
          </span>
        )}
      </div>

      {/* 태그 */}
      {paper.tags && paper.tags.length > 0 && (
        <div className="flex items-center gap-1 flex-wrap mb-2">
          {paper.tags.slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
            >
              {tag}
            </span>
          ))}
          {paper.tags.length > 3 && (
            <span className="text-xs text-gray-500">+{paper.tags.length - 3}</span>
          )}
        </div>
      )}

      {/* 링크 */}
      <div className="flex items-center gap-2 mt-2 pt-2 border-t">
        {paper.pdf_url && (
          <a
            href={paper.pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
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
            className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <Code className="h-3 w-3" />
            Code
          </a>
        )}
      </div>
    </div>
  );
}
