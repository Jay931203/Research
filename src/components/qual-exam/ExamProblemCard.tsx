'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle, XCircle } from 'lucide-react';

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
  hint?: string;           // kept for data compatibility — not rendered
  tags: string[];
}

interface ExamProblemCardProps {
  problem: ExamProblem;
  defaultExpanded?: boolean;
}

/* ── Category colours ── */
const categoryColor: Record<string, string> = {
  '점근 분석':       'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300',
  '그래프 알고리즘': 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300',
  '힙':              'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300',
  '힙 & 정렬':       'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300',
  '정렬':            'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300',
  '정렬 & MST':      'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300',
  'BST':             'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/20 dark:text-teal-300',
  '동적 프로그래밍': 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-300',
  '점화식 & DP':     'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-300',
  '허프만 코딩':     'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300',
  '복잡도':          'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300',
  '가상 함수':       'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/20 dark:text-violet-300',
  '복사 생성자':     'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-900/20 dark:text-pink-300',
  '포인터':          'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300',
  '연결 리스트':     'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-300',
  '템플릿':          'bg-lime-50 text-lime-700 border-lime-200 dark:bg-lime-900/20 dark:text-lime-300',
  '다형성':          'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/20 dark:text-violet-300',
  '메모리 관리':     'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300',
  '스택/큐':         'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/20 dark:text-sky-300',
  'MST & 트리 순회 & TSP': 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300',
};

/* ── Answer renderer ── */
function AnswerBlock({ text }: { text: string }) {
  const trimmed = text.trim();

  // T/F 답변 특별 처리
  if (/^(TRUE|FALSE)\b/.test(trimmed)) {
    const isTrue = trimmed.startsWith('TRUE');
    // "TRUE\n\n해설: ..." 또는 "TRUE\n해설: ..." 형식에서 해설 추출
    const explanationMatch = trimmed.replace(/^(TRUE|FALSE)\s*/, '').trim();

    return (
      <div className="mt-2 space-y-2">
        <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-black ${
          isTrue
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
            : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
        }`}>
          {isTrue
            ? <CheckCircle className="h-3.5 w-3.5" />
            : <XCircle className="h-3.5 w-3.5" />}
          {isTrue ? 'TRUE' : 'FALSE'}
        </div>
        {explanationMatch && (
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
            {explanationMatch}
          </p>
        )}
      </div>
    );
  }

  // 일반 답변: 첫 단락(핵심 답)과 나머지(해설) 분리
  const firstBreak = trimmed.indexOf('\n\n');
  const corePart  = firstBreak >= 0 ? trimmed.slice(0, firstBreak).trim() : trimmed;
  const restPart  = firstBreak >= 0 ? trimmed.slice(firstBreak + 2).trim() : null;

  return (
    <div className="mt-2 space-y-2">
      <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/15 border border-emerald-200 dark:border-emerald-800/50 px-3 py-2">
        <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200 whitespace-pre-wrap leading-relaxed">
          {corePart}
        </p>
      </div>
      {restPart && (
        <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap leading-relaxed px-0.5">
          {restPart}
        </p>
      )}
    </div>
  );
}

/* ── Sub-question item ── */
function SubItem({
  sq, idx, forceShow,
}: {
  sq: NonNullable<ExamProblem['subQuestions']>[0];
  idx: number;
  forceShow: boolean;
}) {
  const [open, setOpen] = useState(false);
  const visible = forceShow || open;

  return (
    <div className="rounded-xl border border-slate-150 dark:border-slate-700/60 bg-white dark:bg-slate-900 overflow-hidden">
      {/* Question */}
      <div className="px-3.5 pt-3 pb-2.5">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="rounded-md bg-slate-900 dark:bg-slate-100 px-2 py-0.5 text-[11px] font-black text-white dark:text-slate-900">
            ({sq.label})
          </span>
          <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
            {sq.points}점
          </span>
        </div>
        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
          {sq.text}
        </p>
      </div>

      {/* Answer toggle + reveal */}
      {sq.answer && (
        <div className="border-t border-slate-100 dark:border-slate-800 px-3.5 pb-3">
          {!visible ? (
            <button
              onClick={() => setOpen(true)}
              className="mt-2 flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              정답 보기
            </button>
          ) : (
            <>
              <AnswerBlock text={sq.answer} />
              {!forceShow && (
                <button
                  onClick={() => setOpen(false)}
                  className="mt-2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  숨기기
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Main component ── */
export default function ExamProblemCard({ problem, defaultExpanded = false }: ExamProblemCardProps) {
  const [expanded,      setExpanded]      = useState(defaultExpanded);
  const [showAllAnswers, setShowAllAnswers] = useState(false);

  const catColor   = categoryColor[problem.category] ?? 'bg-slate-100 text-slate-600 border-slate-200';
  const hasSubs    = (problem.subQuestions?.length ?? 0) > 0;
  const totalSubPts = problem.subQuestions?.reduce((s, q) => s + q.points, 0) ?? 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden dark:border-slate-700 dark:bg-slate-900 shadow-sm">

      {/* ── Header ── */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-start justify-between gap-3 px-4 py-3.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
      >
        <div className="flex items-start gap-3 min-w-0">
          <span className="flex-shrink-0 rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-black text-white dark:bg-slate-100 dark:text-slate-900 whitespace-nowrap">
            {problem.year}·{problem.semester === '1' ? '1학기' : '2학기'}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${catColor}`}>
                {problem.category}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                문제 {problem.problemNumber} · {problem.totalPoints}점
              </span>
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">{problem.title}</p>
          </div>
        </div>
        {expanded
          ? <ChevronUp   className="h-4 w-4 flex-shrink-0 text-slate-400 mt-1" />
          : <ChevronDown className="h-4 w-4 flex-shrink-0 text-slate-400 mt-1" />}
      </button>

      {/* ── Body ── */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-slate-800">

          {hasSubs ? (
            /* ── Split layout: description LEFT | sub-questions RIGHT ── */
            <div className="flex flex-col lg:flex-row">

              {/* LEFT — context (code + description) */}
              <div className="lg:w-[44%] flex-shrink-0 p-4 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800 lg:sticky lg:top-0 lg:self-start lg:max-h-[80vh] lg:overflow-y-auto">
                {problem.codeBlock && (
                  <pre className="mb-4 overflow-x-auto rounded-lg bg-slate-950 px-4 py-3 text-xs leading-relaxed text-slate-200 font-mono">
                    <code>{problem.codeBlock}</code>
                  </pre>
                )}
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {problem.description}
                </p>

                {/* Tags (in left panel, understated) */}
                {problem.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1">
                    {problem.tags.slice(0, 5).map(tag => (
                      <span key={tag} className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400 dark:text-slate-500">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* RIGHT — sub-questions */}
              <div className="flex-1 p-4 space-y-2.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                    소문항 {problem.subQuestions!.length}개 · {totalSubPts}점
                  </span>
                  <button
                    onClick={() => setShowAllAnswers(a => !a)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                      showAllAnswers
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-300'
                    }`}
                  >
                    {showAllAnswers ? '정답 모두 숨기기' : '정답 모두 보기'}
                  </button>
                </div>

                {problem.subQuestions!.map((sq, i) => (
                  <SubItem key={i} sq={sq} idx={i} forceShow={showAllAnswers} />
                ))}
              </div>
            </div>

          ) : (
            /* ── Single-column layout (no sub-questions) ── */
            <div className="p-4 space-y-3">
              {problem.codeBlock && (
                <pre className="overflow-x-auto rounded-lg bg-slate-950 px-4 py-3 text-xs leading-relaxed text-slate-200 font-mono">
                  <code>{problem.codeBlock}</code>
                </pre>
              )}
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {problem.description}
              </p>
              {problem.answer && (
                <div>
                  <button
                    onClick={() => setShowAllAnswers(a => !a)}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
                  >
                    {showAllAnswers ? '정답 숨기기' : '정답 보기'}
                  </button>
                  {showAllAnswers && <AnswerBlock text={problem.answer} />}
                </div>
              )}
              {problem.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {problem.tags.map(tag => (
                    <span key={tag} className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400 dark:text-slate-500">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
