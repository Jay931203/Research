'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';

export interface ExamProblem {
  id: string;
  year: string;
  semester: '1' | '2';
  subject: 'dsa' | 'prog';
  problemNumber: number;
  totalPoints: number;
  category: string;
  title: string;
  description: string;
  subQuestions?: {
    label: string;
    points: number;
    text: string;
    answer?: string;
  }[];
  answer?: string;
  codeBlock?: string;
  hint?: string;
  tags: string[];
}

interface ExamProblemCardProps {
  problem: ExamProblem;
  defaultExpanded?: boolean;
}

const categoryColor: Record<string, string> = {
  '점근 분석': 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300',
  '그래프 알고리즘': 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300',
  '힙': 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300',
  '정렬': 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300',
  'BST': 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/20 dark:text-teal-300',
  '동적 프로그래밍': 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-300',
  '허프만 코딩': 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300',
  '복잡도': 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300',
  '가상 함수': 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/20 dark:text-violet-300',
  '복사 생성자': 'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-900/20 dark:text-pink-300',
  '포인터': 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300',
  '연결 리스트': 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-300',
  '템플릿': 'bg-lime-50 text-lime-700 border-lime-200 dark:bg-lime-900/20 dark:text-lime-300',
  '다형성': 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/20 dark:text-violet-300',
  '메모리 관리': 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300',
  '스택/큐': 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/20 dark:text-sky-300',
};

export default function ExamProblemCard({ problem, defaultExpanded = false }: ExamProblemCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [showAnswers, setShowAnswers] = useState<Record<string, boolean>>({});
  const [showAllAnswers, setShowAllAnswers] = useState(false);

  const toggleAnswer = (key: string) => {
    setShowAnswers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const catColor = categoryColor[problem.category] ?? 'bg-slate-100 text-slate-600 border-slate-200';

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden dark:border-slate-700 dark:bg-slate-900">
      {/* Header */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-start justify-between gap-3 p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
      >
        <div className="flex items-start gap-3 min-w-0">
          <span className="flex-shrink-0 rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-bold text-white dark:bg-slate-100 dark:text-slate-900">
            {problem.year}-{problem.semester === '1' ? '1학기' : '2학기'}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-0.5">
              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${catColor}`}>
                {problem.category}
              </span>
              <span className="text-[10px] font-semibold text-slate-400">
                문제 {problem.problemNumber} · {problem.totalPoints}점
              </span>
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{problem.title}</p>
          </div>
        </div>
        {expanded ? <ChevronUp className="h-4 w-4 flex-shrink-0 text-slate-400 mt-1" /> : <ChevronDown className="h-4 w-4 flex-shrink-0 text-slate-400 mt-1" />}
      </button>

      {/* Body */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-slate-800 px-4 pb-4 pt-3 space-y-4">
          {/* Code block */}
          {problem.codeBlock && (
            <pre className="overflow-x-auto rounded-lg bg-slate-950 p-3 text-xs leading-relaxed text-slate-200">
              <code>{problem.codeBlock}</code>
            </pre>
          )}

          {/* Description */}
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
            {problem.description}
          </p>

          {/* Sub-questions */}
          {problem.subQuestions && problem.subQuestions.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">소문항</p>
                <button
                  onClick={() => setShowAllAnswers(a => !a)}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-500 dark:text-blue-400"
                >
                  {showAllAnswers ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  {showAllAnswers ? '답 숨기기' : '모든 답 보기'}
                </button>
              </div>
              {problem.subQuestions.map((sq, i) => {
                const key = `sq-${i}`;
                const visible = showAllAnswers || showAnswers[key];
                return (
                  <div key={i} className="rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <span className="font-mono text-xs font-bold text-slate-500 mr-2">({sq.label})</span>
                        <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">[{sq.points}점]</span>
                        <p className="mt-1 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{sq.text}</p>
                      </div>
                    </div>
                    {sq.answer && (
                      <div className="mt-2">
                        <button
                          onClick={() => toggleAnswer(key)}
                          className="text-xs text-blue-600 hover:underline dark:text-blue-400"
                        >
                          {visible ? '답 숨기기' : '답 보기'}
                        </button>
                        {visible && (
                          <div className="mt-2 rounded bg-emerald-50 border border-emerald-200 p-2 dark:bg-emerald-900/20 dark:border-emerald-800">
                            <pre className="text-xs text-emerald-800 dark:text-emerald-300 whitespace-pre-wrap font-mono">{sq.answer}</pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Overall answer */}
          {problem.answer && !problem.subQuestions?.length && (
            <div>
              <button
                onClick={() => setShowAnswers(prev => ({ ...prev, main: !prev['main'] }))}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-500 dark:text-blue-400"
              >
                {showAnswers['main'] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                {showAnswers['main'] ? '해답 숨기기' : '해답 보기'}
              </button>
              {showAnswers['main'] && (
                <div className="mt-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800 dark:bg-emerald-900/20">
                  <pre className="text-sm text-emerald-800 dark:text-emerald-300 whitespace-pre-wrap">{problem.answer}</pre>
                </div>
              )}
            </div>
          )}

          {/* Hint */}
          {problem.hint && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20">
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 mb-0.5">힌트</p>
              <p className="text-xs text-amber-700 dark:text-amber-300">{problem.hint}</p>
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {problem.tags.map(tag => (
              <span key={tag} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
