'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { BookOpen, ChevronDown, GraduationCap, X } from 'lucide-react';
import { usePapersWithNotes } from '@/hooks/useNotes';
import { buildReviewQueue } from '@/lib/papers/insights';
import {
  FAMILIARITY_COLORS,
  FAMILIARITY_LABELS,
  FAMILIARITY_SELECTABLE_LEVELS,
} from '@/lib/visualization/graphUtils';
import { upsertNote } from '@/lib/supabase/notes';
import { useAppStore } from '@/store/useAppStore';
import type { FamiliarityLevel } from '@/types';

const FAMILIARITY_LEVELS: FamiliarityLevel[] = FAMILIARITY_SELECTABLE_LEVELS;

export default function ReviewQueue() {
  const { papers, refresh } = usePapersWithNotes();
  const { isReviewQueueOpen, toggleReviewQueue } = useAppStore();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const reviewQueue = useMemo(() => buildReviewQueue(papers, 10), [papers]);

  const handleFamiliarityChange = useCallback(
    async (paperId: string, level: FamiliarityLevel) => {
      setUpdatingId(paperId);
      try {
        await upsertNote(paperId, { familiarity_level: level });
        await refresh();
      } catch {
        // silently fail
      } finally {
        setUpdatingId(null);
      }
    },
    [refresh]
  );

  if (!reviewQueue.length) return null;

  return (
    <>
      {/* Floating button */}
      <button
        onClick={toggleReviewQueue}
        className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-rose-600 text-white shadow-lg transition hover:bg-rose-700 hover:shadow-xl active:scale-95"
        title="복습 큐 열기"
      >
        <BookOpen className="h-5 w-5" />
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-rose-600 shadow">
          {reviewQueue.length}
        </span>
      </button>

      {/* Slide-up panel */}
      {isReviewQueueOpen && (
        <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
          <div className="mx-auto max-w-2xl rounded-t-2xl border border-b-0 border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900" style={{ maxHeight: '50vh' }}>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-rose-500" />
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">
                  복습 큐
                </h3>
                <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-600 dark:bg-rose-900/30 dark:text-rose-300">
                  {reviewQueue.length}건
                </span>
              </div>
              <button
                onClick={toggleReviewQueue}
                className="rounded-md p-1.5 text-gray-400 transition hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* List */}
            <div className="overflow-y-auto p-3" style={{ maxHeight: 'calc(50vh - 52px)' }}>
              <div className="space-y-2">
                {reviewQueue.map(({ paper, reason }) => {
                  const level = paper.familiarity_level ?? 'not_started';
                  const normalizedLevel = level === 'expert' ? 'familiar' : level;
                  const color = FAMILIARITY_COLORS[level] ?? '#9ca3af';
                  const isUpdating = updatingId === paper.id;

                  return (
                    <div
                      key={paper.id}
                      className="rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                    >
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-1 text-sm font-medium text-gray-800 dark:text-gray-200">
                            {paper.title}
                          </p>
                          <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">
                            {paper.year}
                            {paper.importance_rating ? ` · 중요도 ${paper.importance_rating}` : ''}
                            {' · '}
                            <span style={{ color }}>{reason}</span>
                          </p>
                        </div>
                        <Link
                          href={`/paper/${paper.id}`}
                          onClick={toggleReviewQueue}
                          className="flex-shrink-0 inline-flex items-center gap-1 rounded-md bg-indigo-600 px-2.5 py-1 text-[11px] font-semibold text-white transition hover:bg-indigo-700"
                        >
                          <GraduationCap className="h-3 w-3" />
                          학습 시작
                        </Link>
                      </div>

                      {/* Quick familiarity update */}
                      <div className="flex flex-wrap gap-1">
                        {FAMILIARITY_LEVELS.map((fl) => {
                          const isSelected = normalizedLevel === fl;
                          const flColor = FAMILIARITY_COLORS[fl];
                          return (
                            <button
                              key={fl}
                              onClick={() => handleFamiliarityChange(paper.id, fl)}
                              disabled={isUpdating}
                              className={`rounded-full px-2 py-0.5 text-[10px] font-medium border transition ${
                                isUpdating ? 'opacity-50' : 'hover:scale-105'
                              }`}
                              style={
                                isSelected
                                  ? { backgroundColor: flColor, color: '#fff', borderColor: flColor }
                                  : { borderColor: `${flColor}60`, color: flColor }
                              }
                            >
                              {FAMILIARITY_LABELS[fl]}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
