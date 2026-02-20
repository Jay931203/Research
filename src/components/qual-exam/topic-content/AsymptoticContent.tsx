'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, FileText } from 'lucide-react';
import MathBlock from '../MathBlock';
import type { StudyTopic } from '../TopicStudyCard';
import type { ExamProblem } from '../ExamProblemCard';

interface Props {
  topic: StudyTopic;
  relatedExams: ExamProblem[];
  onExamClick?: (exam: ExamProblem) => void;
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
    color: 'border-blue-400',
    headerBg: 'bg-blue-50 dark:bg-blue-950/40',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    latex: 'f(n) = O(g(n)) \\iff \\exists\\, c > 0,\\, n_0 : \\forall n \\ge n_0,\\; f(n) \\le c \\cdot g(n)',
    example: 'T(n) = 3n² + 5 → O(n²)',
    desc: '최악의 경우 상한을 표현. "이 속도보다 빠르다".',
  },
  {
    symbol: 'Ω',
    name: 'Big-Omega (하한)',
    color: 'border-emerald-400',
    headerBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    latex: 'f(n) = \\Omega(g(n)) \\iff \\exists\\, c > 0,\\, n_0 : \\forall n \\ge n_0,\\; f(n) \\ge c \\cdot g(n)',
    example: 'T(n) = 3n² + 5 → Ω(n²)',
    desc: '최선의 경우 하한을 표현. "이 속도보다 느리다".',
  },
  {
    symbol: 'Θ',
    name: 'Big-Theta (정확한 점근)',
    color: 'border-purple-400',
    headerBg: 'bg-purple-50 dark:bg-purple-950/40',
    badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    latex: 'f(n) = \\Theta(g(n)) \\iff f(n) = O(g(n)) \\text{ and } f(n) = \\Omega(g(n))',
    example: 'T(n) = 3n² + 5 → Θ(n²)',
    desc: '상한과 하한이 같을 때. 알고리즘의 정확한 성장률.',
  },
  {
    symbol: 'o',
    name: 'Little-o (strict 상한)',
    color: 'border-orange-400',
    headerBg: 'bg-orange-50 dark:bg-orange-950/40',
    badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
    latex: 'f(n) = o(g(n)) \\iff \\lim_{n \\to \\infty} \\frac{f(n)}{g(n)} = 0',
    example: 'n = o(n²), 2n = o(n²)',
    desc: '엄격한 상한. f가 g보다 진짜로 더 빠름 (같은 속도 X).',
  },
  {
    symbol: 'ω',
    name: 'Little-omega (strict 하한)',
    color: 'border-rose-400',
    headerBg: 'bg-rose-50 dark:bg-rose-950/40',
    badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
    latex: 'f(n) = \\omega(g(n)) \\iff \\lim_{n \\to \\infty} \\frac{f(n)}{g(n)} = \\infty',
    example: 'n² = ω(n), n³ = ω(n²)',
    desc: '엄격한 하한. f가 g보다 진짜로 더 느림 (같은 속도 X).',
  },
];

/* ── Key properties ── */
const properties = [
  { rule: '전이성 (Transitivity)',   latex: 'f = O(g),\\; g = O(h) \\Rightarrow f = O(h)' },
  { rule: '합의 법칙 (Sum Rule)',    latex: 'O(f) + O(g) = O(\\max(f, g))' },
  { rule: '곱의 법칙 (Product)',     latex: 'O(f) \\cdot O(g) = O(f \\cdot g)' },
  { rule: '다항식 (Polynomial)',     latex: 'a_k n^k + \\cdots + a_0 = O(n^k)' },
  { rule: '로그 법칙 (Log base)',    latex: '\\log_a n = \\Theta(\\log_b n)' },
  { rule: '지수 vs 다항 (Exp>Poly)', latex: 'n^k = o(2^n) \\text{ for any fixed } k' },
];

const difficultyLabel = { basic: '기초', intermediate: '중급', advanced: '고급' };
const difficultyColor = {
  basic: 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300',
  intermediate: 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-300',
  advanced: 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-300',
};

export default function AsymptoticContent({ topic, relatedExams, onExamClick }: Props) {
  const [n, setN] = useState(10);
  const [openCard, setOpenCard] = useState<string | null>(null);

  const growthData = computeGrowth(n);
  const maxVal = Math.max(...growthData.map(d => d.value));

  return (
    <div className="max-w-3xl space-y-10 px-6 py-6">

      {/* ── Hero ─────────────────────────────────── */}
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

      {/* ── Motivating card ─────────────────────── */}
      <div className="rounded-xl border border-purple-200 bg-purple-50 px-5 py-4 dark:border-purple-800/40 dark:bg-purple-950/30">
        <p className="text-sm font-bold text-purple-800 dark:text-purple-200 mb-1">왜 점근 분석인가?</p>
        <p className="text-sm text-purple-700 dark:text-purple-300 leading-relaxed">
          알고리즘의 <strong>실행 시간을 정확히 계산하면 하드웨어·언어·상수에 의존</strong>하게 되어 비교가 어렵습니다.
          점근 분석은 입력 크기 n이 커질 때 <em>지배적인 항만 남겨</em> 알고리즘의 본질적인 효율성을 비교합니다.
        </p>
      </div>

      {/* ── Growth Rate Explorer ─────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">📈</span>
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">성장률 비교 (Growth Rate Explorer)</h2>
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
          {/* Slider */}
          <div className="flex items-center gap-4 mb-6">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-300 flex-shrink-0">
              n =
            </label>
            <input
              type="range"
              min={1}
              max={30}
              value={n}
              onChange={e => setN(Number(e.target.value))}
              className="flex-1 accent-blue-600"
            />
            <span className="w-8 text-center font-mono font-bold text-blue-600 dark:text-blue-400">{n}</span>
          </div>

          {/* Bar chart */}
          <div className="flex items-end gap-3 h-48">
            {growthData.map(d => {
              const heightPct = maxVal > 0 ? Math.max(2, (d.value / maxVal) * 100) : 2;
              return (
                <div key={d.name} className="flex flex-col items-center gap-1 flex-1 min-w-0">
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate">
                    {d.value >= 1e9 ? '>1B' : d.value >= 1e6 ? (d.value / 1e6).toFixed(1) + 'M' : d.value >= 1000 ? (d.value / 1000).toFixed(1) + 'K' : d.value.toFixed(d.value < 10 ? 2 : 0)}
                  </span>
                  <div className="relative w-full flex items-end" style={{ height: '160px' }}>
                    <div
                      className={`w-full rounded-t-md ${d.color} transition-all duration-300`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">{d.name}</span>
                </div>
              );
            })}
          </div>

          <p className="mt-3 text-xs text-slate-400 dark:text-slate-500 text-center">
            색상: <span className="text-emerald-500 font-semibold">녹색(빠름)</span> → <span className="text-red-500 font-semibold">빨강(느림)</span>
          </p>
        </div>
      </section>

      {/* ── Big-O 5종 카드 ──────────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">📐</span>
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">점근 표기법 5종</h2>
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="space-y-3">
          {notations.map(n => {
            const isOpen = openCard === n.symbol;
            return (
              <div
                key={n.symbol}
                className={`rounded-xl border-2 overflow-hidden transition-all ${n.color} bg-white dark:bg-slate-900`}
              >
                <button
                  onClick={() => setOpenCard(isOpen ? null : n.symbol)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left ${n.headerBg} hover:brightness-95 dark:hover:brightness-110 transition`}
                >
                  <span className={`rounded-lg px-2.5 py-1 text-base font-black font-mono ${n.badge} flex-shrink-0`}>
                    {n.symbol}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">{n.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{n.desc}</p>
                  </div>
                  {isOpen
                    ? <ChevronDown className="h-4 w-4 flex-shrink-0 text-slate-400" />
                    : <ChevronRight className="h-4 w-4 flex-shrink-0 text-slate-400" />
                  }
                </button>
                {isOpen && (
                  <div className="px-5 py-4 space-y-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="rounded-lg bg-slate-950 px-4 py-3 overflow-x-auto">
                      <MathBlock latex={n.latex} block />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-500">예시:</span>
                      <code className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-mono text-slate-700 dark:text-slate-200">
                        {n.example}
                      </code>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 핵심 성질 ─────────────────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">⚡</span>
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">핵심 성질</h2>
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="px-4 py-2.5 text-left text-xs font-bold text-slate-600 dark:text-slate-300">성질</th>
                <th className="px-4 py-2.5 text-left text-xs font-bold text-slate-600 dark:text-slate-300">수식</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((p, i) => (
                <tr key={i} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300 font-medium text-xs whitespace-nowrap">{p.rule}</td>
                  <td className="px-4 py-2.5 overflow-x-auto">
                    <MathBlock latex={p.latex} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── 기출 연결 ─────────────────────────────── */}
      {relatedExams.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <FileText className="h-4 w-4 text-slate-400" />
            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
              관련 기출문제 ({relatedExams.length})
            </h2>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
          </div>
          <div className="flex flex-wrap gap-2">
            {relatedExams.map(exam => (
              <button
                key={exam.id}
                onClick={() => onExamClick?.(exam)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-blue-700 dark:hover:bg-blue-950/30 px-3 py-2 text-left transition group"
              >
                <span className="rounded bg-slate-900 dark:bg-slate-100 px-2 py-0.5 text-[10px] font-black text-white dark:text-slate-900 flex-shrink-0">
                  {exam.year}-{exam.semester === '1' ? '1학기' : '2학기'}
                </span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 group-hover:text-blue-700 dark:group-hover:text-blue-300 truncate max-w-[200px]">
                  {exam.title}
                </span>
                <span className="text-[10px] text-slate-400 flex-shrink-0">팝업 보기 →</span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
