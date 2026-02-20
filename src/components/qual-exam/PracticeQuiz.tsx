'use client';

import { useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp, HelpCircle, XCircle } from 'lucide-react';

export interface QuizQuestion {
  id: string;
  type: 'true-false' | 'multiple-choice' | 'fill-blank' | 'short-answer';
  question: string;
  options?: string[];
  answer: string | number | boolean;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  tags?: string[];
}

interface PracticeQuizProps {
  questions: QuizQuestion[];
  title?: string;
}

const difficultyLabel: Record<string, string> = { easy: '쉬움', medium: '보통', hard: '어려움' };
const difficultyColor: Record<string, string> = {
  easy: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300',
  medium: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300',
  hard: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300',
};

export default function PracticeQuiz({ questions, title = '연습 문제' }: PracticeQuizProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | number | boolean | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [filterTopic, setFilterTopic] = useState<string>('all');
  const [mode, setMode] = useState<'sequential' | 'random'>('sequential');

  const topics = Array.from(new Set(questions.map(q => q.topic)));

  const filtered = questions.filter(q => {
    if (filterDifficulty !== 'all' && q.difficulty !== filterDifficulty) return false;
    if (filterTopic !== 'all' && q.topic !== filterTopic) return false;
    return true;
  });

  const current = filtered[currentIdx % filtered.length];
  if (!current) return <div className="text-center text-sm text-slate-400 py-8">문제가 없습니다.</div>;

  const isCorrect = (sel: string | number | boolean | null): boolean => {
    if (sel === null) return false;
    if (current.type === 'multiple-choice') return Number(sel) === Number(current.answer);
    if (current.type === 'true-false') return String(sel) === String(current.answer);
    return String(sel).trim().toLowerCase() === String(current.answer).trim().toLowerCase();
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    setAnswered(true);
    setShowExplanation(true);
    if (isCorrect(selectedAnswer)) {
      if (!completedIds.has(current.id)) {
        setScore(s => s + 1);
        setCompletedIds(prev => new Set(Array.from(prev).concat(current.id)));
      }
    }
  };

  const handleNext = () => {
    if (mode === 'random') {
      const next = Math.floor(Math.random() * filtered.length);
      setCurrentIdx(next);
    } else {
      setCurrentIdx(i => (i + 1) % filtered.length);
    }
    setSelectedAnswer(null);
    setAnswered(false);
    setShowExplanation(false);
  };

  return (
    <div className="space-y-4">
      {/* Header + Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{title}</h3>
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
            {score}/{filtered.length} 정답
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <select
            value={filterDifficulty}
            onChange={e => { setFilterDifficulty(e.target.value); setCurrentIdx(0); setSelectedAnswer(null); setAnswered(false); setShowExplanation(false); }}
            className="rounded border border-slate-200 bg-white px-2 py-1 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="all">전체 난이도</option>
            <option value="easy">쉬움</option>
            <option value="medium">보통</option>
            <option value="hard">어려움</option>
          </select>
          <select
            value={filterTopic}
            onChange={e => { setFilterTopic(e.target.value); setCurrentIdx(0); setSelectedAnswer(null); setAnswered(false); setShowExplanation(false); }}
            className="rounded border border-slate-200 bg-white px-2 py-1 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="all">전체 토픽</option>
            {topics.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <button
            onClick={() => setMode(m => m === 'sequential' ? 'random' : 'sequential')}
            className="rounded border border-slate-200 bg-white px-2 py-1 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
          >
            {mode === 'sequential' ? '순서대로' : '랜덤'}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className="h-full rounded-full bg-blue-500 transition-all duration-500"
          style={{ width: `${(completedIds.size / filtered.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        {/* Meta */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${difficultyColor[current.difficulty]}`}>
              {difficultyLabel[current.difficulty]}
            </span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {current.topic}
            </span>
            <span className="text-[10px] text-slate-400">
              {current.type === 'true-false' ? 'T/F' : current.type === 'multiple-choice' ? '객관식' : current.type === 'fill-blank' ? '빈칸' : '주관식'}
            </span>
          </div>
          <span className="text-xs text-slate-400">{(currentIdx % filtered.length) + 1} / {filtered.length}</span>
        </div>

        {/* Question text */}
        <pre className="mb-4 whitespace-pre-wrap font-sans text-sm font-medium leading-relaxed text-slate-800 dark:text-slate-100">
          {current.question}
        </pre>

        {/* Answer UI */}
        {current.type === 'true-false' && (
          <div className="flex gap-3">
            {['true', 'false'].map(val => (
              <button
                key={val}
                disabled={answered}
                onClick={() => setSelectedAnswer(val)}
                className={`flex-1 rounded-lg border-2 py-2.5 text-sm font-semibold transition
                  ${selectedAnswer === val
                    ? answered
                      ? isCorrect(val) ? 'border-emerald-400 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300'
                                       : 'border-red-400 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'
                      : 'border-blue-400 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800'
                  }
                  ${answered && String(current.answer) === val ? 'border-emerald-400' : ''}
                `}
              >
                {val === 'true' ? '✓ True (참)' : '✗ False (거짓)'}
              </button>
            ))}
          </div>
        )}

        {current.type === 'multiple-choice' && current.options && (
          <div className="space-y-2">
            {current.options.map((opt, i) => (
              <button
                key={i}
                disabled={answered}
                onClick={() => setSelectedAnswer(i)}
                className={`w-full rounded-lg border px-4 py-2.5 text-left text-sm transition
                  ${selectedAnswer === i
                    ? answered
                      ? isCorrect(i) ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
                                     : 'border-red-400 bg-red-50 dark:bg-red-900/20'
                      : 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 dark:border-slate-700 dark:hover:bg-slate-800'
                  }
                  ${answered && Number(current.answer) === i ? '!border-emerald-400 !bg-emerald-50 dark:!bg-emerald-900/20' : ''}
                `}
              >
                <span className="mr-2 font-mono font-bold text-slate-400">
                  {['①', '②', '③', '④', '⑤'][i]}
                </span>
                {opt}
              </button>
            ))}
          </div>
        )}

        {(current.type === 'fill-blank' || current.type === 'short-answer') && (
          <div className="space-y-2">
            <input
              disabled={answered}
              value={selectedAnswer?.toString() ?? ''}
              onChange={e => setSelectedAnswer(e.target.value)}
              placeholder={current.type === 'fill-blank' ? '빈칸에 들어갈 답을 입력하세요' : '답을 입력하세요'}
              className={`w-full rounded-lg border px-3 py-2.5 font-mono text-sm outline-none transition
                ${answered ? isCorrect(selectedAnswer) ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' : 'border-red-400 bg-red-50 dark:bg-red-900/20'
                            : 'border-slate-300 focus:border-blue-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100'}
              `}
            />
            {answered && !isCorrect(selectedAnswer) && (
              <p className="text-sm text-emerald-700 dark:text-emerald-300">
                <span className="font-semibold">정답:</span> {String(current.answer)}
              </p>
            )}
          </div>
        )}

        {/* Submit / Next */}
        <div className="mt-4 flex items-center gap-3">
          {!answered ? (
            <button
              onClick={handleSubmit}
              disabled={selectedAnswer === null}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              제출
            </button>
          ) : (
            <>
              <div className={`flex items-center gap-1.5 text-sm font-semibold ${isCorrect(selectedAnswer) ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {isCorrect(selectedAnswer) ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                {isCorrect(selectedAnswer) ? '정답!' : '오답'}
              </div>
              <button onClick={handleNext} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white">
                다음 문제 →
              </button>
            </>
          )}
          <button
            onClick={() => setShowExplanation(e => !e)}
            className="ml-auto flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            해설
            {showExplanation ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        </div>

        {/* Explanation */}
        {showExplanation && (
          <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50 p-3 dark:border-blue-900/30 dark:bg-blue-950/30">
            <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">해설</p>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{current.explanation}</p>
          </div>
        )}
      </div>
    </div>
  );
}
