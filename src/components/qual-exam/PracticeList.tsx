'use client';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export interface QuizQuestion {
  id: string;
  type: 'true-false' | 'multiple-choice' | 'fill-blank' | 'short-answer' | 'code-fill';
  question: string;
  codeSnippet?: string;         // code shown above question
  blanks?: string[];            // for code-fill: blank ids in order
  options?: string[];
  answer: string | number | boolean;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  tags?: string[];
}

const diffColor = {
  easy: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300',
  medium: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300',
  hard: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300',
};
const diffLabel = { easy: '쉬움', medium: '보통', hard: '어려움' };
const typeLabel: Record<string, string> = {
  'true-false': 'T/F', 'multiple-choice': '객관식',
  'fill-blank': '빈칸', 'short-answer': '주관식', 'code-fill': '코드 빈칸',
};

interface QuestionItemProps { q: QuizQuestion; idx: number }
function QuestionItem({ q, idx }: QuestionItemProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-start gap-3 p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
      >
        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-500 flex items-center justify-center mt-0.5">
          {idx + 1}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 mb-1">
            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${diffColor[q.difficulty]}`}>
              {diffLabel[q.difficulty]}
            </span>
            <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-400">
              {typeLabel[q.type]}
            </span>
            <span className="text-[10px] text-slate-400">{q.topic}</span>
          </div>
          <pre className="whitespace-pre-wrap font-sans text-sm text-slate-800 dark:text-slate-100 leading-relaxed">
            {q.question}
          </pre>
          {q.codeSnippet && (
            <pre className="mt-2 overflow-x-auto rounded-lg bg-slate-950 p-3 text-xs leading-relaxed text-slate-200">
              <code>{q.codeSnippet}</code>
            </pre>
          )}
          {q.type === 'multiple-choice' && q.options && (
            <ol className="mt-2 space-y-1">
              {q.options.map((opt, i) => (
                <li key={i} className="flex gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <span className="font-mono font-bold">{'①②③④⑤'[i]}</span> {opt}
                </li>
              ))}
            </ol>
          )}
        </div>
        {open ? <ChevronUp className="h-4 w-4 flex-shrink-0 text-slate-400 mt-0.5" />
               : <ChevronDown className="h-4 w-4 flex-shrink-0 text-slate-400 mt-0.5" />}
      </button>

      {open && (
        <div className="border-t border-slate-100 dark:border-slate-800 px-4 pb-4 pt-3 space-y-3">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800 dark:bg-emerald-900/20">
            <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 mb-1">정답</p>
            <pre className="whitespace-pre-wrap font-mono text-sm text-emerald-800 dark:text-emerald-300">
              {q.type === 'multiple-choice' && typeof q.answer === 'number'
                ? `${['①','②','③','④','⑤'][q.answer as number]} ${q.options?.[q.answer as number] ?? ''}`
                : q.type === 'true-false'
                  ? String(q.answer) === 'true' ? '✓ True (참)' : '✗ False (거짓)'
                  : String(q.answer)}
            </pre>
          </div>
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 dark:border-blue-900/30 dark:bg-blue-950/30">
            <p className="text-[11px] font-bold text-blue-700 dark:text-blue-300 mb-1">해설</p>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {q.explanation}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

interface Props {
  questions: QuizQuestion[];
  filterByTopic?: string;
}

export default function PracticeList({ questions, filterByTopic }: Props) {
  const [filterDiff, setFilterDiff] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const filtered = questions.filter(q => {
    if (filterByTopic && q.topic !== filterByTopic) return false;
    if (filterDiff !== 'all' && q.difficulty !== filterDiff) return false;
    if (filterType !== 'all' && q.type !== filterType) return false;
    return true;
  });

  const types = Array.from(new Set(questions.map(q => q.type)));

  return (
    <div className="space-y-3">
      {/* Filters */}
      <div className="flex flex-wrap gap-2 text-xs">
        <select
          value={filterDiff}
          onChange={e => setFilterDiff(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          <option value="all">전체 난이도</option>
          <option value="easy">쉬움</option>
          <option value="medium">보통</option>
          <option value="hard">어려움</option>
        </select>
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          <option value="all">전체 유형</option>
          {types.map(t => <option key={t} value={t}>{typeLabel[t]}</option>)}
        </select>
        <span className="ml-auto self-center text-slate-400">
          {filtered.length}문제
        </span>
      </div>

      {/* Question List */}
      {filtered.length === 0 ? (
        <p className="text-center py-8 text-sm text-slate-400">조건에 맞는 문제가 없습니다.</p>
      ) : (
        filtered.map((q, i) => <QuestionItem key={q.id} q={q} idx={i} />)
      )}
    </div>
  );
}
