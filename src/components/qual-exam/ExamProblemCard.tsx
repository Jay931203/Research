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

/* ─────────────────────────────────────────────────────────────
   Detection heuristics
───────────────────────────────────────────────────────────── */

/** C/C++ source code */
function looksLikeCode(text: string): boolean {
  const firstLine = text.split('\n')[0].trim();
  return (
    /^(\/\/|void |int |bool |char |unsigned |template\s*<|class |struct |return |#include|#define|new |delete |auto )/.test(firstLine) ||
    (text.includes('{') && text.includes('}') && text.includes('\n')) ||
    firstLine.includes('::') ||
    firstLine.startsWith('->')
  );
}

/** Algorithm pseudocode / trace / ASCII art — needs monospace rendering */
function looksLikeFormatted(text: string): boolean {
  if (looksLikeCode(text)) return false;
  return (
    // 4+ leading spaces on any line → ASCII tree, indented pseudocode
    /^ {4,}\S/m.test(text) ||
    // Numbered steps "1:", "2:", … at line start (pseudocode / algorithm steps)
    /^\d+:/m.test(text) ||
    // Function definition "Name(args):" pattern (pseudocode header)
    /^[A-Za-z_][A-Za-z0-9_-]*\([^)]*\):/m.test(text) ||
    // "Step N" trace label
    /\bStep\s+\d/i.test(text) ||
    // Array literal at very start: [1, 3, 7, ...]
    /^\[[\d,\s]+\]/.test(text.trim())
  );
}

/* ─────────────────────────────────────────────────────────────
   Block components
───────────────────────────────────────────────────────────── */

/** Dark code block — for C/C++ source */
function CodeBlock({ text }: { text: string }) {
  return (
    <div className="rounded-lg overflow-hidden border border-slate-700/40">
      <div className="flex items-center px-4 py-1.5 bg-slate-800 border-b border-slate-700/40">
        <span className="text-[10px] font-mono font-semibold text-slate-400 tracking-wider">C++</span>
      </div>
      <pre className="overflow-x-auto bg-slate-950 px-4 py-3.5 text-xs leading-6 text-slate-200 font-mono whitespace-pre">
        <code>{text}</code>
      </pre>
    </div>
  );
}

/** Light trace block — for pseudocode, algorithm traces, ASCII diagrams */
function TraceBlock({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      <pre className="overflow-x-auto bg-slate-50 dark:bg-slate-800/50 px-4 py-3 text-xs font-mono leading-5 text-slate-700 dark:text-slate-300 whitespace-pre">
        {text}
      </pre>
    </div>
  );
}

/** Mixed text + embedded code/trace renderer (splits on blank lines) */
function RichText({ text, className = '' }: { text: string; className?: string }) {
  const parts = text.split(/\n\n+/);
  if (parts.length === 1) {
    const t = text.trim();
    if (looksLikeCode(t))      return <CodeBlock text={t} />;
    if (looksLikeFormatted(t)) return <TraceBlock text={t} />;
    return <p className={`text-sm leading-7 whitespace-pre-wrap ${className}`}>{text}</p>;
  }
  return (
    <div className="space-y-3">
      {parts.map((part, i) => {
        const t = part.trim();
        if (!t) return null;
        if (looksLikeCode(t))      return <CodeBlock key={i} text={t} />;
        if (looksLikeFormatted(t)) return <TraceBlock key={i} text={t} />;
        return <p key={i} className={`text-sm leading-7 whitespace-pre-wrap ${className}`}>{t}</p>;
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Answer renderer
───────────────────────────────────────────────────────────── */
function AnswerBlock({ text }: { text: string }) {
  const trimmed = text.trim();

  // T/F 답변 특별 처리
  if (/^(TRUE|FALSE)\b/.test(trimmed)) {
    const isTrue = trimmed.startsWith('TRUE');
    const explanation = trimmed.replace(/^(TRUE|FALSE)\s*/, '').trim();
    return (
      <div className="mt-3 space-y-3">
        <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-black ${
          isTrue
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
            : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
        }`}>
          {isTrue ? <CheckCircle className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
          {isTrue ? 'TRUE' : 'FALSE'}
        </div>
        {explanation && (
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-7 whitespace-pre-wrap">
            {explanation}
          </p>
        )}
      </div>
    );
  }

  // 일반 답변: 첫 단락(핵심 답)과 나머지(해설/추가 정보) 분리
  const firstBreak = trimmed.indexOf('\n\n');
  const corePart = firstBreak >= 0 ? trimmed.slice(0, firstBreak).trim() : trimmed;
  const restPart = firstBreak >= 0 ? trimmed.slice(firstBreak + 2).trim() : null;

  const renderPart = (part: string, isCore: boolean) => {
    if (looksLikeCode(part))      return <CodeBlock text={part} />;
    if (looksLikeFormatted(part)) return <TraceBlock text={part} />;
    if (isCore) {
      return (
        <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/15 border border-emerald-200 dark:border-emerald-800/50 px-4 py-3">
          <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200 whitespace-pre-wrap leading-7">
            {part}
          </p>
        </div>
      );
    }
    return (
      <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap leading-7 px-0.5">
        {part}
      </p>
    );
  };

  return (
    <div className="mt-3 space-y-3">
      {renderPart(corePart, true)}
      {restPart && renderPart(restPart, false)}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Sub-question item
───────────────────────────────────────────────────────────── */
function SubItem({
  sq, forceShow,
}: {
  sq: NonNullable<ExamProblem['subQuestions']>[0];
  forceShow: boolean;
}) {
  const [open, setOpen] = useState(false);
  const visible = forceShow || open;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 overflow-hidden">
      {/* Question */}
      <div className="px-4 pt-4 pb-3.5">
        <div className="flex items-center gap-2 mb-2.5">
          <span className="rounded-md bg-slate-900 dark:bg-slate-100 px-2.5 py-0.5 text-[11px] font-black text-white dark:text-slate-900">
            ({sq.label})
          </span>
          <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
            {sq.points}점
          </span>
        </div>
        {/* sub-question text — may contain embedded pseudocode */}
        <RichText text={sq.text} className="text-slate-700 dark:text-slate-300" />
      </div>

      {/* Answer toggle + reveal */}
      {sq.answer && (
        <div className="border-t border-slate-100 dark:border-slate-800 px-4 pb-4">
          {!visible ? (
            <button
              onClick={() => setOpen(true)}
              className="mt-3 flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
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

/* ─────────────────────────────────────────────────────────────
   Main component
───────────────────────────────────────────────────────────── */
export default function ExamProblemCard({ problem, defaultExpanded = false }: ExamProblemCardProps) {
  const [expanded,       setExpanded]      = useState(defaultExpanded);
  const [showAllAnswers, setShowAllAnswers] = useState(false);

  const catColor    = categoryColor[problem.category] ?? 'bg-slate-100 text-slate-600 border-slate-200';
  const hasSubs     = (problem.subQuestions?.length ?? 0) > 0;
  const totalSubPts = problem.subQuestions?.reduce((s, q) => s + q.points, 0) ?? 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden dark:border-slate-700 dark:bg-slate-900 shadow-sm">

      {/* ── Header ── */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-start justify-between gap-3 px-5 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
      >
        <div className="flex items-start gap-3 min-w-0">
          <span className="flex-shrink-0 rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-black text-white dark:bg-slate-100 dark:text-slate-900 whitespace-nowrap">
            {problem.year}·{problem.semester === '1' ? '1학기' : '2학기'}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
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

              {/* LEFT — description first, then code (sticky while scrolling right) */}
              <div className="lg:w-[52%] flex-shrink-0 p-5 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800 lg:sticky lg:top-0 lg:self-start lg:max-h-[80vh] lg:overflow-y-auto space-y-4">
                {problem.description && (
                  <RichText
                    text={problem.description}
                    className="text-slate-700 dark:text-slate-300"
                  />
                )}
                {problem.codeBlock && (
                  <CodeBlock text={problem.codeBlock} />
                )}
                {problem.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {problem.tags.slice(0, 5).map(tag => (
                      <span key={tag} className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400 dark:text-slate-500">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* RIGHT — sub-questions */}
              <div className="flex-1 p-5 space-y-3">
                <div className="flex items-center justify-between mb-0.5">
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
                  <SubItem key={i} sq={sq} forceShow={showAllAnswers} />
                ))}
              </div>
            </div>

          ) : (
            /* ── Single-column layout (no sub-questions) ── */
            <div className="p-5 space-y-4">
              {problem.description && (
                <RichText
                  text={problem.description}
                  className="text-slate-700 dark:text-slate-300"
                />
              )}
              {problem.codeBlock && (
                <CodeBlock text={problem.codeBlock} />
              )}
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
