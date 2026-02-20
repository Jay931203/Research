'use client';
import { useEffect } from 'react';
import { X } from 'lucide-react';
import ExamProblemCard, { type ExamProblem } from './ExamProblemCard';

interface Props {
  problem: ExamProblem | null;
  onClose: () => void;
}

export default function ExamProblemModal({ problem, onClose }: Props) {
  useEffect(() => {
    if (!problem) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [problem, onClose]);

  if (!problem) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 p-4 sm:p-8 overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-2.5">
            <span className="rounded-lg bg-slate-900 dark:bg-slate-100 px-2.5 py-1 text-xs font-black text-white dark:text-slate-900">
              {problem.year}-{problem.semester === '1' ? '1학기' : '2학기'}
            </span>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate max-w-xs">
              {problem.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-2 flex-shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200 transition"
            aria-label="닫기"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Card content — always expanded */}
        <div className="p-4">
          <ExamProblemCard problem={problem} defaultExpanded />
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-100 dark:bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            닫기 (ESC)
          </button>
        </div>
      </div>
    </div>
  );
}
