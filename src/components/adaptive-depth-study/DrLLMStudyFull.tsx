'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  BarChart2,
  BrainCircuit,
  ChevronDown,
  Cpu,
  GraduationCap,
  Hash,
  Layers,
  AlertTriangle,
  Zap,
  HelpCircle,
} from 'lucide-react';
import katex from 'katex';

/* ── helpers ─────────────────────────────────────────────────── */

function EquationRenderer({ latex }: { latex: string }) {
  const html = useMemo(() => {
    try { return katex.renderToString(latex, { throwOnError: false, displayMode: true }); }
    catch { return null; }
  }, [latex]);
  if (!html) return <code className="block text-center text-sm text-red-400">{latex}</code>;
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900 dark:ring-1 dark:ring-gray-800 ${className}`}>
      {children}
    </div>
  );
}

function SectionHeading({ icon, title, collapsed, onToggle }: {
  icon: React.ReactNode; title: string; collapsed?: boolean; onToggle?: () => void;
}) {
  return (
    <button onClick={onToggle} className="mb-3 flex w-full items-center gap-2.5 text-left">
      <span className="text-gray-500 dark:text-gray-400">{icon}</span>
      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">{title}</h3>
      {onToggle && (
        <ChevronDown className={`ml-auto h-5 w-5 text-gray-400 transition-transform dark:text-gray-500 ${collapsed ? '-rotate-90' : ''}`} />
      )}
    </button>
  );
}

function SubSectionHeading({ number, title }: { number: string; title: string }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">{number}</span>
      <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">{title}</h4>
    </div>
  );
}

function Caption({ children }: { children: React.ReactNode }) {
  return <p className="mt-2 text-center text-xs italic text-gray-500 dark:text-gray-400">{children}</p>;
}

function EqCard({ idx, name, latex, description, color = 'teal' }: {
  idx: number; name: string; latex: string; description: string; color?: string;
}) {
  const [open, setOpen] = useState(false);
  const colorMap: Record<string, string> = {
    teal:   'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800',
    purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
    amber:  'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
    green:  'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    blue:   'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
  };
  const badgeMap: Record<string, string> = {
    teal:   'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    amber:  'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    green:  'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    blue:   'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  };
  return (
    <div className="cursor-pointer rounded-xl border border-gray-200 bg-gray-50/50 p-4 transition hover:border-teal-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-teal-700" onClick={() => setOpen(v => !v)}>
      <div className="mb-2 flex items-center gap-2">
        <span className={`rounded px-2 py-0.5 text-xs font-bold ${badgeMap[color] ?? badgeMap.teal}`}>Eq. {idx}</span>
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{name}</span>
        <ChevronDown className={`ml-auto h-4 w-4 text-gray-400 transition-transform dark:text-gray-500 ${open ? 'rotate-180' : ''}`} />
      </div>
      <div className="overflow-x-auto py-2 text-gray-900 dark:text-gray-100"><EquationRenderer latex={latex} /></div>
      {open ? (
        <div className={`mt-3 rounded-lg border px-4 py-3 ${colorMap[color] ?? colorMap.teal}`}>
          <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">{description}</p>
        </div>
      ) : (
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">클릭하여 상세 설명 보기</p>
      )}
    </div>
  );
}


/* ── Interactive Layer Routing Visualization ─────────────────── */

const LAYER_COUNT = 32;
const PRESETS: Record<string, { name: string; desc: string; pattern: number[] }> = {
  simple: {
    name: '간단한 질문',
    desc: '"프랑스의 수도는?" - 사실 회상, 깊은 추론 불필요',
    pattern: [1,1,1,1,0,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,1,1,1,1,1],
  },
  medium: {
    name: '중간 난이도',
    desc: '"이차방정식 풀이를 설명해줘" - 구조적 추론 필요',
    pattern: [1,1,1,1,1,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,1,1,0,1,1,1,1,1,1,1],
  },
  hard: {
    name: '어려운 추론',
    desc: '"AIME 수학 경시 문제" - 모든 레이어가 거의 필요',
    pattern: [1,1,1,1,1,1,1,1,1,1,1,1,2,1,1,1,2,1,1,1,1,2,1,1,1,1,1,1,1,1,1,1],
  },
  code: {
    name: '코드 생성',
    desc: '"퀵소트 구현해줘" - 중간 레이어에 집중',
    pattern: [1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,0,1,1,1,1],
  },
};

function LayerRoutingViz() {
  const [preset, setPreset] = useState<string>('simple');
  const [hoveredLayer, setHoveredLayer] = useState<number | null>(null);
  const current = PRESETS[preset];
  const activeCount = current.pattern.filter(v => v >= 1).length;
  const repeatCount = current.pattern.filter(v => v === 2).length;
  const skipCount = current.pattern.filter(v => v === 0).length;
  const effectiveLayers = activeCount + repeatCount;

  const actionColor = (v: number) => {
    if (v === 0) return 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600';
    if (v === 2) return 'bg-amber-400 dark:bg-amber-600 border-amber-500 dark:border-amber-500';
    return 'bg-teal-400 dark:bg-teal-600 border-teal-500 dark:border-teal-500';
  };
  const actionLabel = (v: number) => v === 0 ? 'Skip' : v === 2 ? 'Repeat' : 'Exec';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {Object.entries(PRESETS).map(([key, { name }]) => (
          <button
            key={key}
            onClick={() => setPreset(key)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
              preset === key
                ? 'bg-teal-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
        <p className="text-xs font-medium text-gray-600 dark:text-gray-400">{current.desc}</p>
      </div>

      {/* Layer grid */}
      <div className="flex flex-wrap gap-1">
        {current.pattern.map((v, i) => (
          <div
            key={i}
            onMouseEnter={() => setHoveredLayer(i)}
            onMouseLeave={() => setHoveredLayer(null)}
            style={{ width: 'calc(6.25% - 3px)' }}
            className={`relative flex h-10 items-center justify-center rounded border text-[9px] font-bold transition-all ${actionColor(v)} ${
              hoveredLayer === i ? 'scale-110 shadow-lg z-10' : ''
            } ${v === 0 ? 'opacity-40 text-gray-500 dark:text-gray-400' : 'text-white'}`}
          >
            {hoveredLayer === i ? (
              <span className="text-[8px]">{actionLabel(v)}</span>
            ) : (
              <span>{i + 1}</span>
            )}
          </div>
        ))}
      </div>
      <Caption>32개 레이어 라우팅 패턴. 입력 난이도에 따라 Skip/Execute/Repeat이 동적으로 결정됩니다.</Caption>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-teal-200 bg-teal-50 p-3 text-center dark:border-teal-800 dark:bg-teal-900/20">
          <p className="text-lg font-bold text-teal-700 dark:text-teal-300">{activeCount}</p>
          <p className="text-xs text-teal-600 dark:text-teal-400">실행 레이어</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-center dark:border-gray-700 dark:bg-gray-800">
          <p className="text-lg font-bold text-gray-500 dark:text-gray-400">{skipCount}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">스킵 레이어</p>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-center dark:border-amber-800 dark:bg-amber-900/20">
          <p className="text-lg font-bold text-amber-700 dark:text-amber-300">{repeatCount}</p>
          <p className="text-xs text-amber-600 dark:text-amber-400">반복 레이어</p>
        </div>
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-800 dark:bg-blue-900/20">
        <p className="text-xs text-blue-700 dark:text-blue-300">
          <span className="font-bold">유효 연산량:</span> {effectiveLayers}/{LAYER_COUNT} 레이어
          ({Math.round((1 - effectiveLayers / LAYER_COUNT) * 100)}% 연산 절감)
          {repeatCount > 0 && ` | 반복 레이어 ${repeatCount}개로 어려운 부분 강화`}
        </p>
      </div>
    </div>
  );
}


/* ── Speedup vs Accuracy Tradeoff Viz ────────────────────────── */

function SpeedupAccuracyViz() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const methods = [
    { name: 'Dr.LLM', acc: 96.5, layers: 27, color: 'bg-teal-500', ring: 'ring-teal-300', ours: true },
    { name: 'LayerSkip', acc: 88.8, layers: 24, color: 'bg-red-400', ring: 'ring-red-300', ours: false },
    { name: 'LITE', acc: 91.2, layers: 26, color: 'bg-orange-400', ring: 'ring-orange-300', ours: false },
    { name: 'MindSkip', acc: 90.1, layers: 25, color: 'bg-purple-400', ring: 'ring-purple-300', ours: false },
    { name: 'ShortGPT', acc: 85.3, layers: 22, color: 'bg-gray-400', ring: 'ring-gray-300', ours: false },
    { name: 'FlexiDepth', acc: 89.5, layers: 25, color: 'bg-blue-400', ring: 'ring-blue-300', ours: false },
    { name: '풀 모델', acc: 93.1, layers: 32, color: 'bg-gray-300', ring: 'ring-gray-200', ours: false },
  ];

  const maxAcc = 100;
  const minAcc = 80;
  const maxLayers = 33;

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">ARC-Challenge 정확도 vs 사용 레이어 수 (Llama-3-8B)</p>
      <div className="relative h-64 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
        {/* Y axis label */}
        <span className="absolute -left-1 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] text-gray-400">정확도 (%)</span>
        {/* X axis label */}
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[10px] text-gray-400">평균 사용 레이어</span>

        {/* Grid lines */}
        {[85, 90, 95].map(v => (
          <div
            key={v}
            className="absolute left-8 right-4 border-t border-dashed border-gray-200 dark:border-gray-700"
            style={{ bottom: `${((v - minAcc) / (maxAcc - minAcc)) * 85 + 10}%` }}
          >
            <span className="absolute -left-6 -top-2 text-[9px] text-gray-400">{v}</span>
          </div>
        ))}

        {/* Points */}
        {methods.map((m, i) => {
          const x = (m.layers / maxLayers) * 80 + 10;
          const y = ((m.acc - minAcc) / (maxAcc - minAcc)) * 85 + 10;
          return (
            <div
              key={m.name}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={`absolute flex h-5 w-5 items-center justify-center rounded-full transition-all ${m.color} ${
                hoveredIdx === i ? `scale-150 ring-2 ${m.ring} shadow-lg z-20` : m.ours ? 'ring-2 ring-teal-300 shadow-md z-10' : ''
              }`}
              style={{ left: `${x}%`, bottom: `${y}%`, transform: 'translate(-50%, 50%)' }}
            >
              {hoveredIdx === i && (
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-[10px] text-white shadow-lg dark:bg-gray-100 dark:text-gray-900">
                  <span className="font-bold">{m.name}</span>: {m.acc}% / {m.layers}L
                </div>
              )}
            </div>
          );
        })}

        {/* Legend */}
        <div className="absolute right-3 top-2 space-y-1">
          {methods.map(m => (
            <div key={m.name} className="flex items-center gap-1.5">
              <div className={`h-2.5 w-2.5 rounded-full ${m.color}`} />
              <span className={`text-[9px] ${m.ours ? 'font-bold text-teal-700 dark:text-teal-300' : 'text-gray-500 dark:text-gray-400'}`}>{m.name}</span>
            </div>
          ))}
        </div>
      </div>
      <Caption>Dr.LLM은 더 적은 레이어로 풀 모델보다 높은 정확도를 달성합니다 (MCTS 기반 Repeat 효과).</Caption>
    </div>
  );
}


/* ── Notation Table ──────────────────────────────────────────── */

function NotationTable() {
  const rows = [
    { sym: 'h_l', desc: 'l번째 레이어의 hidden state 출력' },
    { sym: 'R_l(\\cdot)', desc: 'l번째 레이어의 라우터 (bottleneck MLP)' },
    { sym: 'a_l \\in \\{0,1,2\\}', desc: '라우팅 결정: 0=Skip, 1=Execute, 2=Repeat' },
    { sym: 'F_l(\\cdot)', desc: 'l번째 Transformer 블록 (Self-Attention + FFN)' },
    { sym: 'B', desc: '연산 예산 (최대 실행 레이어 수)' },
    { sym: 'W_p \\in \\mathbb{R}^{d \\times k}', desc: '라우터 bottleneck projection (d: hidden dim, k: bottleneck dim)' },
    { sym: '\\alpha_t, \\gamma', desc: 'Focal Loss 파라미터 (클래스 가중치, focusing 파라미터)' },
    { sym: 'w', desc: 'Windowed pooling 윈도우 크기' },
  ];
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-teal-50 dark:bg-teal-900/20">
            <th className="px-4 py-2 text-left font-bold text-teal-700 dark:text-teal-300">기호</th>
            <th className="px-4 py-2 text-left font-bold text-teal-700 dark:text-teal-300">의미</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {rows.map(({ sym, desc }) => (
            <tr key={sym} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td className="px-4 py-2 font-mono text-teal-600 dark:text-teal-400 whitespace-nowrap">
                <EquationRenderer latex={sym} />
              </td>
              <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


/* ── Quiz Section ────────────────────────────────────────────── */

function Quiz() {
  const questions = [
    {
      q: 'Dr.LLM 라우터가 각 레이어에서 결정할 수 있는 3가지 액션은?',
      options: ['Skip, Execute, Repeat', 'Add, Remove, Merge', 'Prune, Keep, Double', 'Forward, Backward, Skip'],
      answer: 0,
    },
    {
      q: 'Dr.LLM이 라우터 학습 데이터를 생성하기 위해 사용하는 탐색 알고리즘은?',
      options: ['Beam Search', 'Greedy Search', 'Monte Carlo Tree Search (MCTS)', 'Genetic Algorithm'],
      answer: 2,
    },
    {
      q: 'Dr.LLM 라우터 학습에 사용되는 예제 수는?',
      options: ['100개', '1,000개', '4,000개', '100,000개'],
      answer: 2,
    },
    {
      q: 'Focal Loss를 사용하는 이유는?',
      options: [
        '학습 속도를 높이기 위해',
        'Skip/Execute/Repeat 간 클래스 불균형 문제를 해결하기 위해',
        '메모리 사용량을 줄이기 위해',
        '모델 가중치를 업데이트하기 위해',
      ],
      answer: 1,
    },
    {
      q: 'Dr.LLM이 풀 모델 대비 Out-of-Domain 태스크에서 보이는 평균 정확도 하락은?',
      options: ['5.2%', '2.1%', '0.85%', '10.3%'],
      answer: 2,
    },
  ];

  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  return (
    <div className="space-y-4">
      {questions.map((q, qi) => (
        <div key={qi} className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
            <span className="mr-2 text-teal-600 dark:text-teal-400">Q{qi + 1}.</span>{q.q}
          </p>
          <div className="space-y-2">
            {q.options.map((opt, oi) => {
              const selected = answers[qi] === oi;
              const isCorrect = showResults && oi === q.answer;
              const isWrong = showResults && selected && oi !== q.answer;
              return (
                <button
                  key={oi}
                  onClick={() => !showResults && setAnswers(a => ({ ...a, [qi]: oi }))}
                  className={`w-full rounded-lg border px-4 py-2 text-left text-xs transition ${
                    isCorrect
                      ? 'border-green-400 bg-green-50 text-green-700 dark:border-green-600 dark:bg-green-900/20 dark:text-green-300'
                      : isWrong
                      ? 'border-red-400 bg-red-50 text-red-700 dark:border-red-600 dark:bg-red-900/20 dark:text-red-300'
                      : selected
                      ? 'border-teal-400 bg-teal-50 text-teal-700 dark:border-teal-600 dark:bg-teal-900/20 dark:text-teal-300'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-400 dark:hover:border-gray-500'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <button
        onClick={() => setShowResults(true)}
        disabled={Object.keys(answers).length < questions.length}
        className="w-full rounded-lg bg-teal-600 py-2.5 text-sm font-bold text-white transition hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {showResults
          ? `결과: ${questions.filter((q, i) => answers[i] === q.answer).length}/${questions.length} 정답`
          : '채점하기'}
      </button>
      {showResults && (
        <button
          onClick={() => { setAnswers({}); setShowResults(false); }}
          className="w-full rounded-lg border border-gray-300 py-2 text-xs text-gray-500 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          다시 풀기
        </button>
      )}
    </div>
  );
}


/* ── Main component ──────────────────────────────────────────── */

export default function DrLLMStudyFull() {
  const [col, setCol] = useState<Record<string, boolean>>({});
  const toggle = useCallback((id: string) => setCol(c => ({ ...c, [id]: !c[id] })), []);

  return (
    <div className="space-y-6">

      {/* ── Overview ─────────────────────────────────────────── */}
      <section id="drllm-overview" className="scroll-mt-20">
        <div className="overflow-hidden rounded-xl shadow-sm">
          <div className="bg-gradient-to-br from-teal-700 via-cyan-700 to-blue-700 p-6 pb-8">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">ICLR 2026 (Under Review)</span>
              <span className="rounded-full bg-yellow-400/90 px-3 py-1 text-xs font-bold text-yellow-900">Adaptive Depth</span>
            </div>
            <h2 className="text-xl font-bold leading-snug text-white sm:text-2xl">
              Dr.LLM: Dynamic Layer Routing in LLMs
            </h2>
            <p className="mt-3 text-sm text-teal-200">
              Heakl, Gubri, Khan, Yun, Oh (Parameter Lab / KAIST / MBZUAI) &middot; arXiv 2510.12773
            </p>
          </div>
          <div className="bg-white p-6 dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
            <p className="leading-relaxed text-gray-700 dark:text-gray-300">
              LLM은 모든 토큰을 <strong>모든 레이어</strong>에 통과시킵니다. 하지만 &ldquo;프랑스의 수도는?&rdquo;과 같은 간단한 질문에도 32개 레이어가 전부 필요할까요?
              Dr.LLM은 각 레이어에 경량 <span className="font-semibold text-teal-700 dark:text-teal-300">라우터(Router)</span>를 부착하여, 입력에 따라 레이어를
              <span className="font-semibold text-teal-700 dark:text-teal-300"> Skip(건너뛰기)</span>,
              <span className="font-semibold text-teal-700 dark:text-teal-300"> Execute(실행)</span>, 또는
              <span className="font-semibold text-teal-700 dark:text-teal-300"> Repeat(반복)</span>하도록 동적으로 결정합니다.
            </p>
            <p className="mt-3 leading-relaxed text-gray-700 dark:text-gray-300">
              핵심: <span className="font-semibold text-teal-700 dark:text-teal-300">MCTS(Monte Carlo Tree Search)</span>로 최적 레이어 구성을 탐색한 뒤,
              이를 지도 학습 데이터로 삼아 라우터를 훈련합니다. 단 <strong>4K개 예제</strong>만으로 라우터를 학습하며,
              원본 모델 가중치는 <strong>전혀 수정하지 않습니다</strong>.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {['Dynamic Layer Routing', 'MCTS Supervision', 'Skip/Execute/Repeat', 'Retrofittable', 'Budget-Aware'].map(tag => (
                <span key={tag} className="rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── One-liner Cards ─────────────────────────────────── */}
      <section id="drllm-oneliners" className="scroll-mt-20">
        <SectionHeading icon={<Zap className="h-5 w-5" />} title="한줄 요약 카드" collapsed={!!col['drllm-oneliners']} onToggle={() => toggle('drllm-oneliners')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['drllm-oneliners'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              { emoji: '1', title: '문제', text: 'LLM은 쉬운 입력에도 모든 레이어를 실행 → 불필요한 연산 낭비' },
              { emoji: '2', title: '해법', text: '레이어마다 경량 라우터가 Skip/Execute/Repeat 중 하나를 동적 결정' },
              { emoji: '3', title: '학습', text: 'MCTS로 최적 레이어 구성 탐색 → 4K개 예제로 라우터 지도 학습' },
              { emoji: '4', title: '장점', text: '원본 가중치 수정 없음 (retrofittable), 예산 제어 가능' },
              { emoji: '5', title: '성능', text: 'ARC/DART에서 정확도 +3.4%p, 평균 5개 레이어 절약' },
              { emoji: '6', title: '일반화', text: 'OOD 8개 벤치마크에서 정확도 하락 단 0.85%, 기존 방법 대비 +7.7%p' },
            ].map(c => (
              <div key={c.emoji} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                <div className="mb-2 flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">{c.emoji}</span>
                  <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{c.title}</span>
                </div>
                <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-400">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Core Idea ───────────────────────────────────────── */}
      <section id="drllm-core" className="scroll-mt-20">
        <SectionHeading icon={<BrainCircuit className="h-5 w-5" />} title="핵심 아이디어: 동적 레이어 라우팅" collapsed={!!col['drllm-core']} onToggle={() => toggle('drllm-core')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['drllm-core'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="1.1" title="왜 모든 레이어가 필요하지 않은가?" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              Transformer LLM의 각 레이어는 서로 다른 역할을 합니다. 초기 레이어는 토큰 임베딩 정제, 중간 레이어는 추론과 구문 분석,
              후반 레이어는 출력 분포 형성에 집중합니다. 간단한 사실 회상 질문에는 깊은 추론 레이어가 불필요합니다.
            </p>
            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-teal-200 bg-teal-50 p-3 dark:border-teal-800 dark:bg-teal-900/20">
                <p className="mb-1 text-xs font-bold text-teal-700 dark:text-teal-300">Skip (건너뛰기)</p>
                <p className="text-xs text-teal-600 dark:text-teal-400">
                  해당 레이어를 완전히 건너뜁니다. 입력을 그대로 다음 레이어로 전달합니다.
                  간단한 입력에서 불필요한 레이어를 비활성화하여 연산을 절감합니다.
                </p>
              </div>
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
                <p className="mb-1 text-xs font-bold text-blue-700 dark:text-blue-300">Execute (실행)</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  표준 Transformer 블록을 정상 실행합니다. 기본 동작이며,
                  대부분의 레이어는 Execute로 설정됩니다.
                </p>
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20">
                <p className="mb-1 text-xs font-bold text-amber-700 dark:text-amber-300">Repeat (반복)</p>
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  해당 레이어를 2회 실행합니다. 어려운 추론 문제에서 특정 레이어의 처리를 강화합니다.
                  기존 방법에는 없는 Dr.LLM만의 고유 기능입니다.
                </p>
              </div>
            </div>

            <SubSectionHeading number="1.2" title="기존 방법들의 한계" />
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead><tr className="bg-gray-50 dark:bg-gray-800">
                  <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">방법</th>
                  <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">액션</th>
                  <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">한계</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { m: 'LayerSkip', act: 'Skip만', lim: '정적 스킵 패턴, 입력 적응 없음' },
                    { m: 'ShortGPT', act: 'Skip만', lim: '레이어 제거는 비가역적, 정확도 급락' },
                    { m: 'LITE', act: 'Skip/Exec', lim: '추론 시 탐색 비용, Repeat 미지원' },
                    { m: 'MindSkip', act: 'Skip/Exec', lim: '아키텍처 변경 필요, 재학습 비용' },
                    { m: 'FlexiDepth', act: 'Skip/Exec', lim: '대규모 재학습 필요' },
                    { m: 'Dr.LLM', act: 'Skip/Exec/Repeat', lim: '가중치 변경 없음, 4K 예제로 학습' },
                  ].map((r, i) => (
                    <tr key={i} className={i === 5 ? 'bg-teal-50 dark:bg-teal-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}>
                      <td className={`px-3 py-2 font-medium ${i === 5 ? 'text-teal-700 dark:text-teal-300' : 'text-gray-700 dark:text-gray-300'}`}>{r.m}</td>
                      <td className="px-3 py-2 text-center text-gray-500 dark:text-gray-400">{r.act}</td>
                      <td className={`px-3 py-2 ${i === 5 ? 'text-teal-600 dark:text-teal-400 font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>{r.lim}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Key Equations ─────────────────────────────────────── */}
      <section id="drllm-equations" className="scroll-mt-20">
        <SectionHeading icon={<Hash className="h-5 w-5" />} title="핵심 수식" collapsed={!!col['drllm-equations']} onToggle={() => toggle('drllm-equations')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['drllm-equations'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="space-y-3">
              <EqCard idx={1} name="라우팅 결정 함수" color="teal"
                latex={String.raw`a_l = R_l\!\left(\text{Pool}_w(h_{l-1})\right) \in \{0, 1, 2\}`}
                description="l번째 레이어의 라우터 R_l이 이전 레이어의 hidden state h_{l-1}에 windowed pooling을 적용한 후, Skip(0), Execute(1), Repeat(2) 중 하나를 출력합니다. 각 라우터는 독립적으로 작동하는 3-class classifier입니다." />

              <EqCard idx={2} name="동적 레이어 실행" color="blue"
                latex={String.raw`h_l = \begin{cases} h_{l-1} & \text{if } a_l = 0 \;\text{(Skip)} \\ F_l(h_{l-1}) & \text{if } a_l = 1 \;\text{(Execute)} \\ F_l(F_l(h_{l-1})) & \text{if } a_l = 2 \;\text{(Repeat)} \end{cases}`}
                description="라우팅 결정에 따라 레이어 출력이 달라집니다. Skip이면 입력을 그대로 전달(residual), Execute이면 표준 Transformer 블록 1회 실행, Repeat이면 같은 블록을 2회 연속 실행하여 해당 레이어의 처리를 강화합니다." />

              <EqCard idx={3} name="Windowed Pooling" color="purple"
                latex={String.raw`\text{Pool}_w(h) = \frac{1}{w}\sum_{i=t-w+1}^{t} h_i \;\in\; \mathbb{R}^d`}
                description="시퀀스의 마지막 w개 토큰의 hidden state를 평균하여 라우터 입력으로 사용합니다. 단일 토큰 대신 윈도우 평균을 쓰면 노이즈에 강건하고, 시퀀스 길이에 무관한 안정적 라우팅이 가능합니다." />

              <EqCard idx={4} name="Bottleneck MLP 라우터" color="green"
                latex={String.raw`R_l(z) = \text{softmax}\!\left(W_2\,\sigma\!\left(W_1 z\right)\right), \quad W_1 \in \mathbb{R}^{k \times d},\; W_2 \in \mathbb{R}^{3 \times k}`}
                description="라우터는 2-layer bottleneck MLP입니다. d차원 hidden state를 k차원(k << d)으로 압축한 뒤 3-class 확률로 변환합니다. 예를 들어 Llama-3-8B에서 d=4096, k=64~128 정도로, 라우터 전체 파라미터가 원본 모델의 0.1% 미만입니다." />

              <EqCard idx={5} name="Focal Loss (클래스 불균형 해소)" color="amber"
                latex={String.raw`\mathcal{L}_{\text{focal}} = -\alpha_t\,(1 - p_t)^\gamma\,\log(p_t)`}
                description="Skip/Execute/Repeat의 비율이 불균형합니다(대부분 Execute). Focal Loss는 쉬운 예제(높은 p_t)의 가중치를 줄이고, 어려운 예제에 집중합니다. alpha_t는 클래스별 가중치, gamma(=2)는 focusing 강도를 제어합니다." />

              <EqCard idx={6} name="연산 예산 제약" color="blue"
                latex={String.raw`\sum_{l=1}^{L} \mathbb{1}[a_l \geq 1] + \mathbb{1}[a_l = 2] \;\leq\; B`}
                description="총 실행 레이어 수(Repeat은 2로 카운트)가 예산 B 이하가 되도록 합니다. MCTS 탐색 시 이 제약을 적용하여 예산 내에서 최대 정확도를 달성하는 레이어 구성을 찾습니다." />
            </div>

            <div className="mt-5">
              <SubSectionHeading number="E.0" title="기호 참조" />
              <NotationTable />
            </div>
          </Card>
        </div>
      </section>

      {/* ── Architecture ──────────────────────────────────────── */}
      <section id="drllm-arch" className="scroll-mt-20">
        <SectionHeading icon={<Layers className="h-5 w-5" />} title="아키텍처: MCTS 기반 라우터 학습" collapsed={!!col['drllm-arch']} onToggle={() => toggle('drllm-arch')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['drllm-arch'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="3.1" title="전체 파이프라인" />
            <div className="space-y-3">
              {[
                { step: '1', title: 'MCTS 탐색 (데이터 생성)', desc: '각 입력에 대해 MCTS로 최적 레이어 구성을 탐색합니다. 상태(state)는 현재까지의 라우팅 결정, 액션(action)은 다음 레이어의 Skip/Execute/Repeat, 보상(reward)은 정확도입니다. 예산 B 내에서 정확도를 최대화하는 경로를 찾습니다.', color: 'teal' },
                { step: '2', title: '학습 데이터 추출 (4K 예제)', desc: 'MCTS에서 정확도를 유지하거나 개선하는 레이어 구성만 선별합니다. 각 예제는 (hidden_state, optimal_action) 쌍으로, 레이어별 라우터의 지도 학습 데이터가 됩니다.', color: 'cyan' },
                { step: '3', title: '라우터 학습', desc: 'Focal Loss + AdamW로 각 레이어의 bottleneck MLP를 학습합니다. LR=1e-3, 25 에폭, bf16, 단일 A100에서 4시간 미만. 원본 모델 가중치는 완전히 동결(frozen)됩니다.', color: 'blue' },
                { step: '4', title: '추론 (Budget-Aware)', desc: '학습된 라우터가 실시간으로 각 레이어의 Skip/Execute/Repeat을 결정합니다. 연산 예산 B를 설정하여 속도-정확도 트레이드오프를 제어할 수 있습니다.', color: 'indigo' },
              ].map(({ step, title, desc, color }) => (
                <div key={step} className="flex gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                  <span className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-${color}-600 text-sm font-bold text-white`}>{step}</span>
                  <div>
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-gray-600 dark:text-gray-400">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5">
              <SubSectionHeading number="3.2" title="MCTS 상세: 트리 탐색 구조" />
              <div className="rounded-lg border border-teal-200 bg-teal-50 p-4 dark:border-teal-800 dark:bg-teal-900/20">
                <div className="space-y-2 text-xs leading-relaxed text-teal-700 dark:text-teal-300">
                  <p><span className="font-bold">State:</span> 현재까지의 라우팅 결정 시퀀스 [a_1, a_2, ..., a_l]</p>
                  <p><span className="font-bold">Action:</span> 다음 레이어 l+1에 대한 결정 (0=Skip, 1=Execute, 2=Repeat)</p>
                  <p><span className="font-bold">Reward:</span> 완성된 구성으로 모델을 실행한 후 태스크 정확도</p>
                  <p><span className="font-bold">Budget:</span> 총 실행 레이어 수 제약 (Repeat은 2로 카운트)</p>
                  <p><span className="font-bold">Length-Aware:</span> MCTS가 시퀀스 길이를 고려하여 탐색 효율을 높임</p>
                </div>
              </div>
            </div>

            <div className="mt-5">
              <SubSectionHeading number="3.3" title="라우터 설계의 핵심 결정" />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-purple-200 bg-purple-50 p-3 dark:border-purple-800 dark:bg-purple-900/20">
                  <p className="mb-1 text-xs font-bold text-purple-700 dark:text-purple-300">Windowed Pooling</p>
                  <p className="text-xs text-purple-600 dark:text-purple-400">
                    마지막 w개 토큰의 hidden state를 평균. 단일 토큰 대비 노이즈에 강건하며,
                    시퀀스 길이 변화에도 안정적으로 라우팅합니다.
                  </p>
                </div>
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20">
                  <p className="mb-1 text-xs font-bold text-amber-700 dark:text-amber-300">Focal Loss</p>
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    대부분 Execute(~80%)이므로 표준 CE Loss는 다수 클래스에 편향됩니다.
                    Focal Loss로 Skip/Repeat 같은 소수 클래스의 학습을 강화합니다.
                  </p>
                </div>
                <div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20">
                  <p className="mb-1 text-xs font-bold text-green-700 dark:text-green-300">Bottleneck MLP</p>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    d차원 → k차원 → 3 클래스. k를 작게 설정하여 라우터 자체의 연산 오버헤드를 최소화합니다.
                    전체 라우터 파라미터는 모델의 0.1% 미만입니다.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Interactive Visualization ─────────────────────────── */}
      <section id="drllm-viz" className="scroll-mt-20">
        <SectionHeading icon={<Cpu className="h-5 w-5" />} title="인터랙티브: 레이어 활성화 패턴" collapsed={!!col['drllm-viz']} onToggle={() => toggle('drllm-viz')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['drllm-viz'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <p className="mb-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              입력 난이도에 따라 Dr.LLM의 라우터가 어떤 레이어를 활성화하는지 시각화합니다.
              프리셋을 선택하여 다양한 입력 유형에 대한 라우팅 패턴을 비교하세요.
            </p>
            <LayerRoutingViz />
          </Card>
        </div>
      </section>

      {/* ── Experimental Results ──────────────────────────────── */}
      <section id="drllm-results" className="scroll-mt-20">
        <SectionHeading icon={<BarChart2 className="h-5 w-5" />} title="실험 결과" collapsed={!!col['drllm-results']} onToggle={() => toggle('drllm-results')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['drllm-results'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="5.1" title="In-Domain 결과 (ARC + DART)" />
            <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">Llama-3-8B-Instruct 기준. 라우터 학습에 사용된 태스크에서의 성능.</p>
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-400">방법</th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-gray-400">ARC-C (%)</th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-gray-400">DART-Math</th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-gray-400">평균 레이어</th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-gray-400">절감</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { m: '풀 모델 (32L)', arc: '93.1', dart: '82.4', layer: '32', save: '0%', hi: false },
                    { m: 'ShortGPT', arc: '85.3', dart: '74.1', layer: '22', save: '31%', hi: false },
                    { m: 'LayerSkip', arc: '88.8', dart: '77.2', layer: '24', save: '25%', hi: false },
                    { m: 'FlexiDepth', arc: '89.5', dart: '78.8', layer: '25', save: '22%', hi: false },
                    { m: 'MindSkip', arc: '90.1', dart: '79.5', layer: '25', save: '22%', hi: false },
                    { m: 'LITE', arc: '91.2', dart: '80.3', layer: '26', save: '19%', hi: false },
                    { m: 'Dr.LLM', arc: '96.5', dart: '85.1', layer: '27', save: '16%', hi: true },
                  ].map((r, i) => (
                    <tr key={i} className={r.hi ? 'bg-teal-50 dark:bg-teal-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}>
                      <td className={`px-3 py-2 font-medium ${r.hi ? 'text-teal-700 dark:text-teal-300 font-bold' : 'text-gray-700 dark:text-gray-300'}`}>{r.m}</td>
                      <td className={`px-3 py-2 text-center font-mono font-semibold ${r.hi ? 'text-teal-700 dark:text-teal-300' : 'text-gray-600 dark:text-gray-400'}`}>{r.arc}</td>
                      <td className={`px-3 py-2 text-center font-mono font-semibold ${r.hi ? 'text-teal-700 dark:text-teal-300' : 'text-gray-600 dark:text-gray-400'}`}>{r.dart}</td>
                      <td className="px-3 py-2 text-center font-mono text-gray-500 dark:text-gray-400">{r.layer}</td>
                      <td className="px-3 py-2 text-center font-mono text-gray-500 dark:text-gray-400">{r.save}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 dark:border-teal-800 dark:bg-teal-900/20">
                <p className="text-xs font-semibold text-teal-700 dark:text-teal-300">핵심 관찰 1: 풀 모델을 초과하는 정확도</p>
                <p className="mt-1 text-xs text-teal-600 dark:text-teal-400">
                  Dr.LLM은 레이어를 줄이면서도 풀 모델(93.1%)보다 높은 96.5%를 달성합니다.
                  이는 Repeat 메커니즘이 핵심 레이어를 강화하여 불필요한 레이어의 간섭(interference)을 줄이기 때문입니다.
                </p>
              </div>
              <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-800 dark:bg-blue-900/20">
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">핵심 관찰 2: Repeat의 효과</p>
                <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                  기존 방법은 Skip만 지원하므로 정확도-효율 트레이드오프가 일방향입니다.
                  Dr.LLM의 Repeat은 어려운 입력에서 특정 레이어를 강화하여 정확도를 개선합니다.
                </p>
              </div>
            </div>

            <div className="mt-5">
              <SubSectionHeading number="5.2" title="Out-of-Domain 일반화 (8개 벤치마크)" />
              <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">ARC/DART에서 학습한 라우터를 다른 태스크에 제로샷 적용한 결과.</p>
              <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800">
                      <th className="px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-400">벤치마크</th>
                      <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-gray-400">풀 모델</th>
                      <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-gray-400">Dr.LLM</th>
                      <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-gray-400">차이</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {[
                      { bench: 'MMLU', full: '67.2', dr: '66.8', diff: '-0.4' },
                      { bench: 'GSM8k', full: '76.5', dr: '75.8', diff: '-0.7' },
                      { bench: 'TruthfulQA', full: '51.3', dr: '50.5', diff: '-0.8' },
                      { bench: 'PIQA', full: '81.2', dr: '80.6', diff: '-0.6' },
                      { bench: 'AGIEval', full: '42.8', dr: '41.5', diff: '-1.3' },
                      { bench: 'SQuADv2', full: '73.4', dr: '72.1', diff: '-1.3' },
                      { bench: 'GPQA Diamond', full: '29.8', dr: '29.1', diff: '-0.7' },
                      { bench: 'AIME 2024', full: '13.3', dr: '12.4', diff: '-0.9' },
                    ].map((r, i) => (
                      <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">{r.bench}</td>
                        <td className="px-3 py-2 text-center font-mono text-gray-600 dark:text-gray-400">{r.full}</td>
                        <td className="px-3 py-2 text-center font-mono font-semibold text-teal-700 dark:text-teal-300">{r.dr}</td>
                        <td className="px-3 py-2 text-center font-mono text-amber-600 dark:text-amber-400">{r.diff}</td>
                      </tr>
                    ))}
                    <tr className="bg-teal-50 dark:bg-teal-900/20 font-bold">
                      <td className="px-3 py-2 text-teal-700 dark:text-teal-300">평균</td>
                      <td className="px-3 py-2 text-center font-mono text-gray-600 dark:text-gray-400">54.4</td>
                      <td className="px-3 py-2 text-center font-mono text-teal-700 dark:text-teal-300">53.6</td>
                      <td className="px-3 py-2 text-center font-mono text-amber-600 dark:text-amber-400">-0.85</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-5">
              <SubSectionHeading number="5.3" title="Speedup vs Accuracy 시각화" />
              <SpeedupAccuracyViz />
            </div>
          </Card>
        </div>
      </section>

      {/* ── Training Details ──────────────────────────────────── */}
      <section id="drllm-training" className="scroll-mt-20">
        <SectionHeading icon={<GraduationCap className="h-5 w-5" />} title="학습 상세 및 Ablation" collapsed={!!col['drllm-training']} onToggle={() => toggle('drllm-training')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['drllm-training'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="6.1" title="학습 설정" />
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-teal-50 dark:bg-teal-900/20">
                    <th className="px-4 py-2 text-left font-bold text-teal-700 dark:text-teal-300">항목</th>
                    <th className="px-4 py-2 text-left font-bold text-teal-700 dark:text-teal-300">설정</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { k: '옵티마이저', v: 'AdamW' },
                    { k: '학습률', v: '1e-3' },
                    { k: '에폭', v: '25' },
                    { k: '학습 데이터', v: '4,000 MCTS-derived 예제' },
                    { k: '손실 함수', v: 'Focal Loss (gamma=2, 클래스 가중치 적용)' },
                    { k: '정밀도', v: 'bf16' },
                    { k: '하드웨어', v: '단일 A100 GPU (40GB)' },
                    { k: '학습 시간', v: '< 4시간' },
                    { k: '베이스 모델', v: 'Llama-3-8B-Instruct (가중치 동결)' },
                    { k: '라우터 파라미터', v: '< 0.1% of base model' },
                  ].map(({ k, v }) => (
                    <tr key={k} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-2 font-medium text-gray-700 dark:text-gray-300">{k}</td>
                      <td className="px-4 py-2 font-mono text-gray-600 dark:text-gray-400">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-5">
              <SubSectionHeading number="6.2" title="Ablation 분석" />
              <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                <table className="w-full text-xs">
                  <thead><tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">변형</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">ARC-C (%)</th>
                    <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">비고</th>
                  </tr></thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {[
                      { cfg: 'Dr.LLM (풀 시스템)', acc: '96.5', note: 'MCTS + Focal + Windowed + Bottleneck' },
                      { cfg: 'CE Loss (Focal 제거)', acc: '93.8', note: 'Skip/Repeat 학습 열화' },
                      { cfg: 'Single-token (Windowed 제거)', acc: '94.1', note: '긴 시퀀스에서 불안정' },
                      { cfg: 'Skip/Execute만 (Repeat 제거)', acc: '93.4', note: '풀 모델 초과 불가' },
                      { cfg: 'Random supervision (MCTS 제거)', acc: '88.2', note: 'MCTS의 핵심 역할 확인' },
                    ].map((r, i) => (
                      <tr key={i} className={i === 0 ? 'bg-teal-50 dark:bg-teal-900/20' : ''}>
                        <td className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">{r.cfg}</td>
                        <td className={`px-3 py-2 text-center font-mono font-semibold ${i === 0 ? 'text-teal-700 dark:text-teal-300' : 'text-gray-600 dark:text-gray-400'}`}>{r.acc}</td>
                        <td className="px-3 py-2 text-gray-500 dark:text-gray-400">{r.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-900/20">
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">Ablation 핵심 인사이트</p>
              <p className="mt-1 text-xs leading-relaxed text-amber-600 dark:text-amber-400">
                MCTS supervision이 가장 큰 기여(+8.3%p). 랜덤 라벨로는 의미 있는 라우팅을 학습할 수 없습니다.
                Repeat 제거 시 풀 모델 수준(93.1%)까지만 도달하여, Repeat이 &ldquo;풀 모델 초과&rdquo;의 핵심 요인임을 확인합니다.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Limitations ───────────────────────────────────────── */}
      <section id="drllm-limits" className="scroll-mt-20">
        <SectionHeading icon={<AlertTriangle className="h-5 w-5" />} title="한계 및 향후 방향" collapsed={!!col['drllm-limits']} onToggle={() => toggle('drllm-limits')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['drllm-limits'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-3 text-sm font-bold text-red-700 dark:text-red-300">한계점</p>
                <div className="space-y-2">
                  {[
                    { t: 'MCTS 비용', d: '학습 데이터 생성에 MCTS 탐색이 필요하여, 새로운 모델에 적용할 때마다 탐색 비용이 발생합니다.' },
                    { t: '단일 모델 검증', d: 'Llama-3-8B에서만 실험. 더 큰 모델(70B+)이나 다른 아키텍처(Mixtral 등)에서의 효과는 미검증.' },
                    { t: '토큰 단위 라우팅 미지원', d: '현재 입력 전체에 대해 하나의 라우팅 결정. 토큰별로 다른 레이어를 활성화하는 세밀한 제어는 미구현.' },
                    { t: '실제 지연시간 측정 부재', d: '레이어 수 절감만 보고. GPU에서의 실제 wall-clock 속도 향상은 구현 의존적.' },
                  ].map(({ t, d }) => (
                    <div key={t} className="rounded-lg border border-red-100 bg-red-50 p-3 dark:border-red-900/30 dark:bg-red-900/10">
                      <p className="text-xs font-bold text-red-700 dark:text-red-300">{t}</p>
                      <p className="mt-0.5 text-xs text-red-600 dark:text-red-400">{d}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-3 text-sm font-bold text-green-700 dark:text-green-300">향후 연구 방향</p>
                <div className="space-y-2">
                  {[
                    { t: '토큰 레벨 라우팅', d: '각 토큰마다 다른 레이어 활성화 패턴. 더 세밀한 연산 최적화 가능.' },
                    { t: '대형 모델 확장', d: '70B/405B 모델에서의 효과 검증. 레이어 수가 많을수록 절감 잠재력이 큼.' },
                    { t: 'MoE와의 결합', d: 'Mixture of Experts + Layer Routing: 전문가 선택과 레이어 선택의 동시 최적화.' },
                    { t: '양자화와의 결합', d: 'Dr.LLM + 양자화(GPTQ, AWQ)로 레이어 수와 비트 수를 동시에 줄여 극한 경량화.' },
                  ].map(({ t, d }) => (
                    <div key={t} className="rounded-lg border border-green-100 bg-green-50 p-3 dark:border-green-900/30 dark:bg-green-900/10">
                      <p className="text-xs font-bold text-green-700 dark:text-green-300">{t}</p>
                      <p className="mt-0.5 text-xs text-green-600 dark:text-green-400">{d}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Quiz ──────────────────────────────────────────────── */}
      <section id="drllm-quiz" className="scroll-mt-20">
        <SectionHeading icon={<HelpCircle className="h-5 w-5" />} title="퀴즈: 이해도 점검" collapsed={!!col['drllm-quiz']} onToggle={() => toggle('drllm-quiz')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['drllm-quiz'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <Quiz />
          </Card>
        </div>
      </section>

    </div>
  );
}
