'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import MathBlock from '../MathBlock';
import type { StudyTopic } from '../TopicStudyCard';

interface Props {
  topic: StudyTopic;
}

/* ── Growth rate functions ── */
function computeGrowth(n: number) {
  return [
    { name: '1',       value: 1,                    color: 'bg-emerald-500' },
    { name: 'log n',   value: Math.log2(n + 1),      color: 'bg-teal-500'   },
    { name: 'n',       value: n,                     color: 'bg-blue-500'   },
    { name: 'n log n', value: n * Math.log2(n + 1),  color: 'bg-indigo-500' },
    { name: 'n²',      value: n * n,                 color: 'bg-amber-500'  },
    { name: '2ⁿ',      value: Math.min(2 ** n, 1e9), color: 'bg-red-500'    },
  ];
}

/* ── Big-O notation definitions ── */
const notations = [
  {
    symbol: 'O',
    name: 'Big-O (상한)',
    borderColor: 'border-blue-400',
    headerBg: 'bg-blue-50 dark:bg-blue-900/30',
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200',
    latex: 'f(n) = O(g(n)) \\iff \\exists\\, c > 0,\\, n_0 : \\forall n \\ge n_0,\\; f(n) \\le c \\cdot g(n)',
    example: 'T(n) = 3n² + 5 → O(n²)',
    desc: '최악의 경우 상한. "이보다 빠르거나 같다".',
  },
  {
    symbol: 'Ω',
    name: 'Big-Omega (하한)',
    borderColor: 'border-emerald-400',
    headerBg: 'bg-emerald-50 dark:bg-emerald-900/30',
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200',
    latex: 'f(n) = \\Omega(g(n)) \\iff \\exists\\, c > 0,\\, n_0 : \\forall n \\ge n_0,\\; f(n) \\ge c \\cdot g(n)',
    example: 'T(n) = 3n² + 5 → Ω(n²)',
    desc: '최선의 경우 하한. "이보다 느리거나 같다".',
  },
  {
    symbol: 'Θ',
    name: 'Big-Theta (정확한 점근)',
    borderColor: 'border-purple-400',
    headerBg: 'bg-purple-50 dark:bg-purple-900/30',
    badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200',
    latex: 'f(n) = \\Theta(g(n)) \\iff f(n) = O(g(n)) \\text{ and } f(n) = \\Omega(g(n))',
    example: 'T(n) = 3n² + 5 → Θ(n²)',
    desc: '상한 = 하한. 정확한 성장률.',
  },
  {
    symbol: 'o',
    name: 'Little-o (strict 상한)',
    borderColor: 'border-orange-400',
    headerBg: 'bg-orange-50 dark:bg-orange-900/30',
    badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900/60 dark:text-orange-200',
    latex: 'f(n) = o(g(n)) \\iff \\lim_{n \\to \\infty} \\frac{f(n)}{g(n)} = 0',
    example: 'n = o(n²)',
    desc: '엄격한 상한. f가 g보다 진짜로 더 빠름.',
  },
  {
    symbol: 'ω',
    name: 'Little-omega (strict 하한)',
    borderColor: 'border-rose-400',
    headerBg: 'bg-rose-50 dark:bg-rose-900/30',
    badge: 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200',
    latex: 'f(n) = \\omega(g(n)) \\iff \\lim_{n \\to \\infty} \\frac{f(n)}{g(n)} = \\infty',
    example: 'n² = ω(n)',
    desc: '엄격한 하한. f가 g보다 진짜로 더 느림.',
  },
];

/* ── Key properties ── */
const properties = [
  { rule: '전이성',         latex: 'f = O(g),\\; g = O(h) \\Rightarrow f = O(h)' },
  { rule: '합의 법칙',      latex: 'O(f) + O(g) = O(\\max(f, g))' },
  { rule: '곱의 법칙',      latex: 'O(f) \\cdot O(g) = O(f \\cdot g)' },
  { rule: '다항식',         latex: 'a_k n^k + \\cdots + a_0 = O(n^k)' },
  { rule: '로그 밑 변환',   latex: '\\log_a n = \\Theta(\\log_b n)' },
  { rule: '지수 > 다항',    latex: 'n^k = o(2^n) \\text{ for any fixed } k' },
];

const difficultyLabel = { basic: '기초', intermediate: '중급', advanced: '고급' };
const difficultyColor = {
  basic: 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300',
  intermediate: 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-300',
  advanced: 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-300',
};

export default function AsymptoticContent({ topic }: Props) {
  const [n, setN] = useState(10);
  const [openCard, setOpenCard] = useState<string | null>(null);

  const growthData = computeGrowth(n);
  const maxVal = Math.max(...growthData.map(d => d.value));

  return (
    <div className="max-w-3xl space-y-10 px-6 py-6">

      {/* ── Hero ── */}
      <div className="flex items-start gap-4">
        <div className="relative flex-shrink-0">
          <span className="text-5xl leading-none">{topic.icon}</span>
          {topic.studyOrder != null && (
            <span className="absolute -top-1 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-black text-white shadow">
              {topic.studyOrder}
            </span>
          )}
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${difficultyColor[topic.difficulty]}`}>
              {difficultyLabel[topic.difficulty]}
            </span>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} className={`h-3.5 w-3.5 ${i < topic.examFrequency ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200 dark:fill-slate-700'}`} viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="ml-1 text-[10px] text-slate-400">출제빈도</span>
            </div>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">{topic.title}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{topic.titleEn}</p>
          {topic.summary && (
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{topic.summary}</p>
          )}
        </div>
      </div>

      {/* ── Growth Rate Explorer ── */}
      <section id={`${topic.id}-sec-growth`}>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">📈</span>
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">성장률 비교</h2>
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
          <div className="flex items-center gap-4 mb-6">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-300 flex-shrink-0 w-8">n =</label>
            <input
              type="range" min={1} max={30} value={n}
              onChange={e => setN(Number(e.target.value))}
              className="flex-1 accent-blue-600"
            />
            <span className="w-8 text-center font-mono font-bold text-blue-600 dark:text-blue-400">{n}</span>
          </div>

          <div className="flex items-end gap-3 h-48">
            {growthData.map(d => {
              const heightPct = maxVal > 0 ? Math.max(2, (d.value / maxVal) * 100) : 2;
              const display = d.value >= 1e9 ? '>1B'
                : d.value >= 1e6 ? (d.value / 1e6).toFixed(1) + 'M'
                : d.value >= 1000 ? (d.value / 1000).toFixed(1) + 'K'
                : d.value.toFixed(d.value < 10 ? 2 : 0);
              return (
                <div key={d.name} className="flex flex-col items-center gap-1 flex-1 min-w-0">
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate w-full text-center">{display}</span>
                  <div className="relative w-full" style={{ height: '160px', display: 'flex', alignItems: 'flex-end' }}>
                    <div className={`w-full rounded-t-md ${d.color} transition-all duration-300`} style={{ height: `${heightPct}%` }} />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 truncate w-full text-center">{d.name}</span>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-slate-400 text-center">
            <span className="text-emerald-500 font-semibold">녹색</span> (빠름) → <span className="text-red-500 font-semibold">빨강</span> (느림)
          </p>
        </div>
      </section>

      {/* ── Big-O 5종 ── */}
      <section id={`${topic.id}-sec-notations`}>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">📐</span>
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">점근 표기법 5종</h2>
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="space-y-2">
          {notations.map(nt => {
            const isOpen = openCard === nt.symbol;
            return (
              <div key={nt.symbol} className={`rounded-xl border-2 overflow-hidden ${nt.borderColor} bg-white dark:bg-slate-900`}>
                <button
                  onClick={() => setOpenCard(isOpen ? null : nt.symbol)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left ${nt.headerBg} transition`}
                >
                  <span className={`rounded-lg px-3 py-1 text-sm font-black font-mono ${nt.badge} flex-shrink-0`}>
                    {nt.symbol}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">{nt.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{nt.desc}</p>
                  </div>
                  {isOpen
                    ? <ChevronDown className="h-4 w-4 flex-shrink-0 text-slate-400" />
                    : <ChevronRight className="h-4 w-4 flex-shrink-0 text-slate-400" />
                  }
                </button>
                {isOpen && (
                  <div className="px-5 py-4 space-y-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                    {/* KaTeX on light bg so it's visible in both modes */}
                    <div className="rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 overflow-x-auto text-slate-900 dark:text-slate-100">
                      <MathBlock latex={nt.latex} block />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-500">예시:</span>
                      <code className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-mono text-slate-700 dark:text-slate-200">
                        {nt.example}
                      </code>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 핵심 성질 ── */}
      <section id={`${topic.id}-sec-properties`}>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">⚡</span>
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">핵심 성질</h2>
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="px-4 py-2.5 text-left text-xs font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap">성질</th>
                <th className="px-4 py-2.5 text-left text-xs font-bold text-slate-600 dark:text-slate-300">수식</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((p, i) => (
                <tr key={i} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300 font-medium text-xs whitespace-nowrap">{p.rule}</td>
                  <td className="px-4 py-2.5 text-slate-900 dark:text-slate-100 overflow-x-auto">
                    <MathBlock latex={p.latex} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
