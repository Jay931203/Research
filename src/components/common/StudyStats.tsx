'use client';

import { usePapersWithNotes } from '@/hooks/useNotes';
import { useRelationships } from '@/hooks/useRelationships';

export default function StudyStats() {
  const { papers, isLoading } = usePapersWithNotes();
  const { relationships } = useRelationships();

  if (isLoading || !papers.length) return null;

  const total = papers.length;
  const studied = papers.filter(p => {
    const level = p.familiarity_level ?? 'not_started';
    return level !== 'not_started';
  }).length;
  const relationCount = relationships.length;

  return (
    <div className="flex items-center justify-center gap-3 text-xs text-gray-500 dark:text-gray-400">
      <span>논문 <span className="font-semibold text-gray-700 dark:text-gray-200">{total}</span>개</span>
      <span className="text-gray-300 dark:text-gray-600">&middot;</span>
      <span>학습 시작 <span className="font-semibold text-gray-700 dark:text-gray-200">{studied}</span>개</span>
      <span className="text-gray-300 dark:text-gray-600">&middot;</span>
      <span>관계 <span className="font-semibold text-gray-700 dark:text-gray-200">{relationCount}</span>개</span>
    </div>
  );
}
