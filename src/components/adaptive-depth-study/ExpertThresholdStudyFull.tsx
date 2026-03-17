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

/* ── Notation Table ──────────────────────────────────────────── */

function NotationTable() {
  const rows = [
    { sym: 'x', desc: '입력 토큰의 hidden state (d차원)' },
    { sym: 'N', desc: '전체 expert 수' },
    { sym: 'W_g', desc: '라우터 게이팅 가중치 행렬 (d x N)' },
    { sym: 's_i(x)', desc: 'expert i에 대한 토큰 x의 어피니티 점수 (softmax 출력)' },
    { sym: 'tau_i', desc: 'expert i의 EMA 기반 라우팅 임계값' },
    { sym: 'alpha', desc: 'EMA 감쇠 계수 (0 < alpha < 1, 보통 0.99)' },
    { sym: 'p_target', desc: '목표 활성화 비율 (예: 1/N, top-k와 동일한 평균 활성)' },
    { sym: 'E_i(x)', desc: 'expert i의 FFN 출력' },
    { sym: 'y(x)', desc: '토큰 x에 대한 MoE 레이어의 최종 출력' },
    { sym: 'k', desc: 'TC-MoE에서 고정된 활성 expert 수 (top-k)' },
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
              <td className="px-4 py-2 font-mono text-teal-600 dark:text-teal-400 whitespace-nowrap">{sym}</td>
              <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Interactive Threshold Viz ───────────────────────────────── */

function ThresholdRoutingViz() {
  const [threshold, setThreshold] = useState(0.15);
  const NUM_EXPERTS = 8;

  /* 토큰별 expert 점수 시뮬레이션 (고정 시드 느낌) */
  const tokens = useMemo(() => [
    { name: '"the"',     type: '기능어',   scores: [0.05, 0.08, 0.22, 0.04, 0.31, 0.06, 0.12, 0.12] },
    { name: '"quantum"', type: '전문용어', scores: [0.28, 0.03, 0.07, 0.25, 0.05, 0.19, 0.04, 0.09] },
    { name: '"is"',      type: '기능어',   scores: [0.06, 0.11, 0.18, 0.07, 0.24, 0.09, 0.14, 0.11] },
    { name: '"entangled"', type: '전문용어', scores: [0.31, 0.04, 0.06, 0.22, 0.03, 0.21, 0.08, 0.05] },
    { name: '"with"',    type: '기능어',   scores: [0.04, 0.09, 0.19, 0.05, 0.28, 0.07, 0.16, 0.12] },
  ], []);

  const expertColors = [
    'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400',
    'bg-teal-400', 'bg-blue-400', 'bg-indigo-400', 'bg-purple-400',
  ];

  const avgActive = useMemo(() => {
    let total = 0;
    tokens.forEach(t => t.scores.forEach(s => { if (s >= threshold) total++; }));
    return (total / tokens.length).toFixed(1);
  }, [tokens, threshold]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          임계값 (tau): <span className="font-mono text-teal-600 dark:text-teal-400">{threshold.toFixed(2)}</span>
        </label>
        <input
          type="range" min={0.02} max={0.35} step={0.01}
          value={threshold}
          onChange={e => setThreshold(parseFloat(e.target.value))}
          className="h-2 flex-1 cursor-pointer appearance-none rounded-lg bg-gray-200 accent-teal-600 dark:bg-gray-700"
        />
        <span className="text-xs text-gray-500 dark:text-gray-400">
          평균 활성 expert: <strong className="text-teal-600 dark:text-teal-400">{avgActive}개</strong>
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800">
              <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">토큰</th>
              <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">유형</th>
              {Array.from({ length: NUM_EXPERTS }, (_, i) => (
                <th key={i} className="px-2 py-2 text-center text-gray-600 dark:text-gray-400">E{i+1}</th>
              ))}
              <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">활성</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {tokens.map((tok, ti) => {
              const activeCount = tok.scores.filter(s => s >= threshold).length;
              return (
                <tr key={ti} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-3 py-2 font-mono font-semibold text-gray-800 dark:text-gray-200">{tok.name}</td>
                  <td className="px-3 py-2 text-gray-500 dark:text-gray-400">{tok.type}</td>
                  {tok.scores.map((s, ei) => {
                    const active = s >= threshold;
                    return (
                      <td key={ei} className="px-1 py-2 text-center">
                        <div className={`mx-auto flex h-7 w-10 items-center justify-center rounded text-[10px] font-bold transition-all ${
                          active
                            ? `${expertColors[ei]} text-white shadow-sm scale-105`
                            : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                        }`}>
                          {s.toFixed(2)}
                        </div>
                      </td>
                    );
                  })}
                  <td className="px-3 py-2 text-center">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                      activeCount === 0
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        : activeCount <= 2
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>{activeCount}개</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 dark:border-teal-800 dark:bg-teal-900/20">
          <p className="text-xs text-teal-700 dark:text-teal-300">
            <strong>낮은 임계값</strong> (0.05~0.10): 많은 expert가 활성화 -- 표현력 증가, 연산량 증가
          </p>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-800 dark:bg-amber-900/20">
          <p className="text-xs text-amber-700 dark:text-amber-300">
            <strong>높은 임계값</strong> (0.25~0.35): 소수 expert만 활성 -- 연산 절약, 간단한 토큰에 적합
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Quiz ─────────────────────────────────────────────────────── */

const quizData = [
  {
    q: 'ET 라우팅에서 토큰이 활성화할 expert 수는 어떻게 결정되는가?',
    opts: [
      'A. 고정된 top-k 값으로 결정',
      'B. 각 expert의 임계값을 초과하는 점수의 수로 동적 결정',
      'C. 배치 내 다른 토큰과의 상대적 비교',
      'D. 랜덤하게 결정',
    ],
    ans: 1,
    explanation: 'ET 라우팅의 핵심: 각 expert마다 EMA 기반 임계값 tau_i가 있고, s_i(x) >= tau_i인 expert만 활성화됩니다. 따라서 토큰마다 활성 expert 수가 달라집니다.',
  },
  {
    q: 'ET 라우팅이 보조 손실(auxiliary loss) 없이 로드 밸런싱을 달성하는 원리는?',
    opts: [
      'A. expert를 무작위로 선택하여 균등 분배',
      'B. EMA 임계값이 과부하 expert의 tau를 자동으로 높여 진입 장벽 형성',
      'C. 용량 인자(capacity factor)로 토큰을 드롭',
      'D. 별도의 밸런싱 네트워크가 분배 조정',
    ],
    ans: 1,
    explanation: 'Expert i가 과부하되면 높은 점수가 많이 유입 -> EMA가 tau_i를 높임 -> 진입 기준 상승 -> 자연스럽게 부하 감소. 보조 손실 없이 자기조절 피드백 루프가 형성됩니다.',
  },
  {
    q: 'TC-MoE (top-k) 대비 ET 라우팅의 가장 큰 장점은?',
    opts: [
      'A. 항상 더 적은 expert를 사용하여 연산 절약',
      'B. 어려운 토큰에 더 많은 expert를, 쉬운 토큰에 더 적은 expert를 할당하는 동적 연산',
      'C. 학습 속도가 항상 빠름',
      'D. 모델 크기가 더 작음',
    ],
    ans: 1,
    explanation: '"quantum", "entangled" 같은 전문 용어는 여러 expert의 조합이 필요하고, "the", "is" 같은 기능어는 소수 expert로 충분합니다. ET는 이를 자동으로 구현합니다.',
  },
  {
    q: 'ET 라우팅이 autoregressive 생성에 적합한 이유는?',
    opts: [
      'A. 병렬 디코딩이 가능하기 때문',
      'B. 라우팅 결정이 배치 내 다른 토큰에 의존하지 않는 완전 인과적(causal) 메커니즘',
      'C. KV 캐시를 사용하지 않기 때문',
      'D. 모든 expert가 항상 활성화되기 때문',
    ],
    ans: 1,
    explanation: 'TC-MoE의 top-k는 배치 내 상대적 순서에 의존할 수 있지만, ET는 각 토큰의 점수와 고정 임계값만 비교하므로 완전히 인과적입니다. 추론 시 토큰 단위 생성에 자연스럽게 호환됩니다.',
  },
  {
    q: 'EMA 감쇠 계수 alpha가 1에 가까울 때 어떤 특성을 보이는가?',
    opts: [
      'A. 임계값이 빠르게 변화하여 불안정',
      'B. 임계값이 천천히 변화하여 안정적이지만 적응이 느림',
      'C. 모든 expert의 임계값이 동일해짐',
      'D. 보조 손실이 필요해짐',
    ],
    ans: 1,
    explanation: 'alpha가 1에 가까우면 tau_i <- alpha * tau_i + (1-alpha) * new에서 기존 값의 비중이 크므로 임계값이 안정적이나 분포 변화에 대한 적응이 느립니다. 논문에서는 alpha = 0.99 근처를 사용합니다.',
  },
];

function QuizSection() {
  const [selected, setSelected] = useState<Record<number, number>>({});
  const [showResult, setShowResult] = useState<Record<number, boolean>>({});

  return (
    <div className="space-y-4">
      {quizData.map((q, qi) => {
        const answered = showResult[qi];
        const correct = selected[qi] === q.ans;
        return (
          <div key={qi} className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-700 dark:bg-gray-800">
            <p className="mb-3 text-sm font-semibold text-gray-800 dark:text-gray-200">
              Q{qi + 1}. {q.q}
            </p>
            <div className="mb-3 space-y-1.5">
              {q.opts.map((opt, oi) => {
                const isSelected = selected[qi] === oi;
                const isCorrect = oi === q.ans;
                let optStyle = 'border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-700';
                if (answered) {
                  if (isCorrect) optStyle = 'border-green-400 bg-green-50 dark:border-green-600 dark:bg-green-900/30';
                  else if (isSelected && !correct) optStyle = 'border-red-400 bg-red-50 dark:border-red-600 dark:bg-red-900/30';
                } else if (isSelected) {
                  optStyle = 'border-teal-400 bg-teal-50 dark:border-teal-600 dark:bg-teal-900/20';
                }
                return (
                  <button
                    key={oi}
                    onClick={() => { if (!answered) setSelected(s => ({ ...s, [qi]: oi })); }}
                    className={`w-full rounded-lg border px-3 py-2 text-left text-xs transition ${optStyle}`}
                  >
                    <span className="text-gray-700 dark:text-gray-300">{opt}</span>
                  </button>
                );
              })}
            </div>
            {selected[qi] !== undefined && !answered && (
              <button
                onClick={() => setShowResult(s => ({ ...s, [qi]: true }))}
                className="rounded-lg bg-teal-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-teal-700"
              >
                정답 확인
              </button>
            )}
            {answered && (
              <div className={`mt-2 rounded-lg px-3 py-2 text-xs ${correct ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'}`}>
                <p className="font-bold">{correct ? '정답!' : '오답!'}</p>
                <p className="mt-1 leading-relaxed">{q.explanation}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────── */

export default function ExpertThresholdStudyFull() {
  const [col, setCol] = useState<Record<string, boolean>>({});
  const toggle = useCallback((id: string) => setCol(c => ({ ...c, [id]: !c[id] })), []);

  return (
    <div className="space-y-6">

      {/* ── Overview ─────────────────────────────────────────── */}
      <section id="et-overview" className="scroll-mt-20">
        <div className="overflow-hidden rounded-xl shadow-sm">
          <div className="bg-gradient-to-br from-teal-700 via-cyan-700 to-blue-700 p-6 pb-8">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">arXiv 2603.11535</span>
              <span className="rounded-full bg-yellow-400/90 px-3 py-1 text-xs font-bold text-yellow-900">MoE 라우팅 혁신</span>
            </div>
            <h2 className="text-xl font-bold leading-snug text-white sm:text-2xl">
              Expert Threshold Routing for Autoregressive Language Modeling with Dynamic Computation Allocation and Load Balancing
            </h2>
            <p className="mt-3 text-sm text-teal-200">
              Sun, Liu, Wu, Sun -- 2026.03 (cs.AI, cs.CL)
            </p>
          </div>
          <div className="bg-white p-6 dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
            <p className="leading-relaxed text-gray-700 dark:text-gray-300">
              기존 Token-choice MoE(TC-MoE)는 모든 토큰이 <strong>고정된 k개의 expert</strong>를 사용하도록 강제합니다.
              이는 간단한 토큰에도 불필요한 연산을 할당하고, 어려운 토큰에는 부족한 연산을 배정하는 비효율을 낳습니다.
              또한 로드 밸런싱을 위해 <span className="font-semibold text-teal-700 dark:text-teal-300">보조 손실(auxiliary loss)</span>이 필수적이어서 학습이 복잡해집니다.
            </p>
            <p className="mt-3 leading-relaxed text-gray-700 dark:text-gray-300">
              본 논문의 <span className="font-semibold text-teal-700 dark:text-teal-300">Expert Threshold (ET) 라우팅</span>은
              각 expert에 EMA 기반 임계값을 부여하여, 토큰의 어피니티 점수가 임계값을 초과하는 expert만 활성화합니다.
              이로써 <strong>동적 연산 할당</strong>과 <strong>보조 손실 없는 로드 밸런싱</strong>을 동시에 달성합니다.
              2.4B 파라미터 모델에서 TC-MoE 대비 <span className="font-mono font-bold text-teal-700 dark:text-teal-300">0.067 낮은 cross-entropy loss</span>를 기록,
              이는 1.6배 적은 토큰으로 동일 성능에 도달하는 것과 동등합니다.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {['Threshold Routing', 'EMA 기반 임계값', 'Dynamic Computation', 'Auxiliary-Loss-Free', 'Causal MoE'].map(tag => (
                <span key={tag} className="rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Background ────────────────────────────────────────── */}
      <section id="et-background" className="scroll-mt-20">
        <SectionHeading icon={<BrainCircuit className="h-5 w-5" />} title="배경: MoE 라우팅의 문제점" collapsed={!!col['et-bg']} onToggle={() => toggle('et-bg')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['et-bg'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="1.1" title="Mixture-of-Experts (MoE) 기본 구조" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              MoE 레이어는 N개의 FFN expert와 하나의 라우터(gating network)로 구성됩니다.
              라우터는 입력 토큰 x에 대해 각 expert의 어피니티 점수를 계산하고, 일부 expert만 활성화하여 연산량을 제어합니다.
            </p>
            <div className="mb-5 overflow-x-auto rounded-lg bg-teal-50 p-3 dark:bg-teal-900/20">
              <EquationRenderer latex={String.raw`y(x) = \sum_{i=1}^{N} g_i(x) \cdot E_i(x), \quad g_i(x) = \begin{cases} s_i(x) & \text{if } i \in \text{TopK}(s(x), k) \\ 0 & \text{otherwise} \end{cases}`} />
            </div>

            <SubSectionHeading number="1.2" title="Top-k 라우팅(TC-MoE)의 한계" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-900/10">
                <p className="mb-1 text-xs font-bold text-red-700 dark:text-red-300">고정 연산량 문제</p>
                <p className="text-xs text-red-600 dark:text-red-400">
                  모든 토큰이 정확히 k개의 expert를 사용.<br/>
                  "the" 같은 기능어도, "quantum" 같은 전문용어도 동일한 연산량 소비.<br/>
                  간단한 토큰에는 낭비, 어려운 토큰에는 부족.
                </p>
              </div>
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-900/10">
                <p className="mb-1 text-xs font-bold text-red-700 dark:text-red-300">보조 손실 의존</p>
                <p className="text-xs text-red-600 dark:text-red-400">
                  Top-k는 인기 expert에 토큰이 집중 (rich-get-richer).<br/>
                  Switch, GShard 등은 별도의 보조 손실로 강제 분배.<br/>
                  하이퍼파라미터 튜닝 복잡 + 본 학습 목적과 충돌 가능.
                </p>
              </div>
            </div>

            <div className="mt-5">
              <SubSectionHeading number="1.3" title="기존 MoE 라우팅 방법 비교" />
              <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                <table className="w-full text-xs">
                  <thead><tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">방법</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">라우팅 유형</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">Expert 수/토큰</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">밸런싱</th>
                    <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">한계</th>
                  </tr></thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {[
                      { m: 'Switch Transformer', rt: 'Top-1', k: '1 (고정)', bl: '보조 손실', lim: '표현력 제한, 토큰 드롭' },
                      { m: 'GShard', rt: 'Top-2', k: '2 (고정)', bl: '보조 손실 + 용량인자', lim: '과적재 시 토큰 드롭' },
                      { m: 'Expert Choice', rt: 'Expert-side', k: '가변', bl: '용량인자', lim: '비인과적 (autoregressive 비호환)' },
                      { m: 'Aux-loss-free', rt: 'Top-k + bias', k: 'k (고정)', bl: 'Bias 보정', lim: '여전히 고정 k' },
                      { m: 'ET (본 논문)', rt: '임계값 기반', k: '가변 (동적)', bl: 'EMA 자기조절', lim: '(이 논문에서 해결)' },
                    ].map((r, i) => (
                      <tr key={i} className={i === 4 ? 'bg-teal-50 dark:bg-teal-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}>
                        <td className={`px-3 py-2 font-medium ${i === 4 ? 'text-teal-700 dark:text-teal-300' : 'text-gray-700 dark:text-gray-300'}`}>{r.m}</td>
                        <td className="px-3 py-2 text-center text-gray-500 dark:text-gray-400">{r.rt}</td>
                        <td className={`px-3 py-2 text-center font-mono ${i === 4 ? 'font-bold text-teal-700 dark:text-teal-300' : 'text-gray-500 dark:text-gray-400'}`}>{r.k}</td>
                        <td className="px-3 py-2 text-center text-gray-500 dark:text-gray-400">{r.bl}</td>
                        <td className="px-3 py-2 text-gray-500 dark:text-gray-400">{r.lim}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Core Mechanism ────────────────────────────────────── */}
      <section id="et-mechanism" className="scroll-mt-20">
        <SectionHeading icon={<Cpu className="h-5 w-5" />} title="핵심 메커니즘: Expert Threshold 라우팅" collapsed={!!col['et-mech']} onToggle={() => toggle('et-mech')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['et-mech'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="2.1" title="라우팅 결정 규칙" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              Top-k가 &ldquo;점수 상위 k개 expert 선택&rdquo;이라면, ET는 &ldquo;임계값을 넘는 모든 expert 선택&rdquo;입니다:
            </p>
            <div className="mb-4 overflow-x-auto rounded-lg bg-teal-50 p-3 dark:bg-teal-900/20">
              <EquationRenderer latex={String.raw`g_i(x) = \begin{cases} s_i(x) & \text{if } s_i(x) \geq \tau_i \\ 0 & \text{otherwise} \end{cases}, \quad s(x) = \text{softmax}(W_g \cdot x)`} />
            </div>
            <p className="mb-5 text-sm text-gray-600 dark:text-gray-400">
              결정적 차이: 토큰마다 활성화되는 expert의 수가 0개부터 N개까지 가변적입니다.
              이것이 &ldquo;동적 연산 할당(dynamic computation allocation)&rdquo;의 핵심입니다.
            </p>

            <SubSectionHeading number="2.2" title="EMA 기반 임계값 업데이트" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              각 expert i의 임계값 tau_i는 학습 중 EMA로 갱신됩니다. 목표 활성화 비율 p_target에 해당하는 점수의 퍼센타일을 추적합니다:
            </p>
            <div className="mb-4 overflow-x-auto rounded-lg bg-purple-50 p-3 dark:bg-purple-900/20">
              <EquationRenderer latex={String.raw`\tau_i \leftarrow \alpha \cdot \tau_i + (1 - \alpha) \cdot \text{Percentile}_{p_\text{target}}\!\left(s_i(\mathcal{B})\right)`} />
            </div>
            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-purple-200 bg-purple-50 p-3 dark:border-purple-800 dark:bg-purple-900/20">
                <p className="text-xs font-bold text-purple-700 dark:text-purple-300">alpha (감쇠 계수)</p>
                <p className="mt-1 text-xs text-purple-600 dark:text-purple-400">
                  0.99 근처. 높을수록 임계값 변화가 느리고 안정적. 낮을수록 빠른 적응.
                </p>
              </div>
              <div className="rounded-lg border border-purple-200 bg-purple-50 p-3 dark:border-purple-800 dark:bg-purple-900/20">
                <p className="text-xs font-bold text-purple-700 dark:text-purple-300">p_target</p>
                <p className="mt-1 text-xs text-purple-600 dark:text-purple-400">
                  목표 활성화 비율. 1/N 설정 시 평균적으로 top-1과 동일한 총 연산량이지만 분배가 가변적.
                </p>
              </div>
              <div className="rounded-lg border border-purple-200 bg-purple-50 p-3 dark:border-purple-800 dark:bg-purple-900/20">
                <p className="text-xs font-bold text-purple-700 dark:text-purple-300">Percentile</p>
                <p className="mt-1 text-xs text-purple-600 dark:text-purple-400">
                  현재 배치 B에서 expert i에 대한 점수 분포의 p_target 퍼센타일 값.
                </p>
              </div>
            </div>

            <SubSectionHeading number="2.3" title="자기조절 로드 밸런싱 (Self-Regulating Feedback Loop)" />
            <div className="space-y-2">
              {[
                { step: '1', title: 'Expert i가 인기 상승', desc: '많은 토큰이 expert i에 높은 점수 부여 -> 점수 분포가 전체적으로 상승', color: 'text-red-700 dark:text-red-300' },
                { step: '2', title: '임계값 자동 상승', desc: 'EMA가 높아진 퍼센타일을 반영 -> tau_i 상승', color: 'text-amber-700 dark:text-amber-300' },
                { step: '3', title: '진입 장벽 형성', desc: '더 높은 tau_i를 초과해야 활성화 -> expert i로의 라우팅 감소', color: 'text-blue-700 dark:text-blue-300' },
                { step: '4', title: '부하 균형 복원', desc: '과부하 해소 -> 점수 분포 정상화 -> tau_i 안정화', color: 'text-green-700 dark:text-green-300' },
              ].map(({ step, title, desc, color }) => (
                <div key={step} className="flex gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white">{step}</span>
                  <div>
                    <p className={`text-xs font-bold ${color}`}>{title}</p>
                    <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5">
              <SubSectionHeading number="2.4" title="완전 인과적(Causal) 메커니즘" />
              <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 dark:border-green-800 dark:bg-green-900/20">
                <p className="text-xs font-semibold text-green-700 dark:text-green-300">Autoregressive 생성과의 호환성</p>
                <p className="mt-1 text-xs leading-relaxed text-green-600 dark:text-green-400">
                  ET의 라우팅 결정: s_i(x) vs tau_i 비교. 여기서 tau_i는 학습 중 고정된 EMA 값이고, s_i(x)는 현재 토큰만의 함수입니다.
                  배치 내 다른 토큰의 정보가 필요 없으므로 추론 시 토큰을 한 개씩 생성하는 autoregressive 디코딩에 완벽 호환됩니다.
                  반면 Expert Choice 라우팅은 expert가 배치 전체에서 토큰을 선택하므로, 배치 크기 1인 추론 시 의미를 잃습니다.
                </p>
              </div>
            </div>

            <div className="mt-5">
              <SubSectionHeading number="2.5" title="기호 참조" />
              <NotationTable />
            </div>
          </Card>
        </div>
      </section>

      {/* ── Architecture ─────────────────────────────────────── */}
      <section id="et-arch" className="scroll-mt-20">
        <SectionHeading icon={<Layers className="h-5 w-5" />} title="아키텍처: Top-k vs Threshold 라우팅" collapsed={!!col['et-arch']} onToggle={() => toggle('et-arch')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['et-arch'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="3.1" title="TC-MoE (Top-k) 흐름" />
            <div className="mb-5 overflow-x-auto rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/10">
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-red-700 dark:text-red-300">
                <span className="rounded bg-red-200 px-2 py-1 dark:bg-red-800">x (토큰)</span>
                <span>-&gt;</span>
                <span className="rounded bg-red-200 px-2 py-1 dark:bg-red-800">Router: s = softmax(W_g x)</span>
                <span>-&gt;</span>
                <span className="rounded bg-red-200 px-2 py-1 dark:bg-red-800">TopK(s, k=2)</span>
                <span>-&gt;</span>
                <span className="rounded bg-red-200 px-2 py-1 dark:bg-red-800">항상 2개 Expert</span>
                <span>-&gt;</span>
                <span className="rounded bg-red-200 px-2 py-1 dark:bg-red-800">가중합 출력</span>
              </div>
              <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                모든 토큰이 정확히 k개 expert를 사용. 보조 손실로 로드 밸런싱 강제.
              </p>
            </div>

            <SubSectionHeading number="3.2" title="ET (Threshold) 흐름" />
            <div className="mb-5 overflow-x-auto rounded-lg border border-teal-200 bg-teal-50 p-4 dark:border-teal-800 dark:bg-teal-900/10">
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-teal-700 dark:text-teal-300">
                <span className="rounded bg-teal-200 px-2 py-1 dark:bg-teal-800">x (토큰)</span>
                <span>-&gt;</span>
                <span className="rounded bg-teal-200 px-2 py-1 dark:bg-teal-800">Router: s = softmax(W_g x)</span>
                <span>-&gt;</span>
                <span className="rounded bg-teal-200 px-2 py-1 dark:bg-teal-800">s_i &gt;= tau_i ?</span>
                <span>-&gt;</span>
                <span className="rounded bg-teal-200 px-2 py-1 dark:bg-teal-800">0~N개 Expert (가변)</span>
                <span>-&gt;</span>
                <span className="rounded bg-teal-200 px-2 py-1 dark:bg-teal-800">가중합 출력</span>
              </div>
              <p className="mt-2 text-xs text-teal-600 dark:text-teal-400">
                토큰마다 활성 expert 수가 다름. EMA 임계값이 자동으로 로드 밸런싱.
              </p>
            </div>

            <SubSectionHeading number="3.3" title="동적 연산 할당 예시" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                <p className="mb-2 text-xs font-bold text-gray-700 dark:text-gray-300">&ldquo;The cat sat on the mat&rdquo;</p>
                <div className="space-y-1">
                  {[
                    { tok: 'The', n: 1, bar: 'w-[12%]' },
                    { tok: 'cat', n: 3, bar: 'w-[38%]' },
                    { tok: 'sat', n: 2, bar: 'w-[25%]' },
                    { tok: 'on', n: 1, bar: 'w-[12%]' },
                    { tok: 'the', n: 1, bar: 'w-[12%]' },
                    { tok: 'mat', n: 2, bar: 'w-[25%]' },
                  ].map(({ tok, n, bar }) => (
                    <div key={tok} className="flex items-center gap-2">
                      <span className="w-8 text-right font-mono text-[10px] text-gray-500">{tok}</span>
                      <div className={`h-3 rounded ${bar} bg-teal-400 dark:bg-teal-500`} />
                      <span className="text-[10px] text-gray-400">{n}개</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                <p className="mb-2 text-xs font-bold text-gray-700 dark:text-gray-300">&ldquo;Quantum entanglement enables teleportation&rdquo;</p>
                <div className="space-y-1">
                  {[
                    { tok: 'Quantum', n: 4, bar: 'w-[50%]' },
                    { tok: 'entangle..', n: 5, bar: 'w-[63%]' },
                    { tok: 'enables', n: 2, bar: 'w-[25%]' },
                    { tok: 'teleport..', n: 4, bar: 'w-[50%]' },
                  ].map(({ tok, n, bar }) => (
                    <div key={tok} className="flex items-center gap-2">
                      <span className="w-16 truncate text-right font-mono text-[10px] text-gray-500">{tok}</span>
                      <div className={`h-3 rounded ${bar} bg-purple-400 dark:bg-purple-500`} />
                      <span className="text-[10px] text-gray-400">{n}개</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <Caption>전문 용어는 더 많은 expert를 활성화하고, 기능어는 최소한의 expert만 사용합니다.</Caption>
          </Card>
        </div>
      </section>

      {/* ── Interactive Visualization ─────────────────────────── */}
      <section id="et-interactive" className="scroll-mt-20">
        <SectionHeading icon={<Zap className="h-5 w-5" />} title="인터랙티브: 임계값에 따른 Expert 활성화" collapsed={!!col['et-viz']} onToggle={() => toggle('et-viz')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['et-viz'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <p className="mb-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              아래 슬라이더로 임계값(tau)을 조절하며, 각 토큰이 어떤 expert를 활성화하는지 관찰하세요.
              색이 들어간 셀은 해당 expert가 활성화되었음을 의미합니다.
            </p>
            <ThresholdRoutingViz />
            <Caption>
              기능어(&ldquo;the&rdquo;, &ldquo;is&rdquo;, &ldquo;with&rdquo;)는 낮은 임계값에서도 소수 expert만 활성.
              전문용어(&ldquo;quantum&rdquo;, &ldquo;entangled&rdquo;)는 여러 expert에 높은 점수를 보여 더 많이 활성화됩니다.
            </Caption>
          </Card>
        </div>
      </section>

      {/* ── Key Equations ─────────────────────────────────────── */}
      <section id="et-equations" className="scroll-mt-20">
        <SectionHeading icon={<Hash className="h-5 w-5" />} title="핵심 수식 모음" collapsed={!!col['et-eq']} onToggle={() => toggle('et-eq')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['et-eq'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="space-y-3">
              <EqCard idx={1} name="라우터 점수 계산 (Gating)" color="teal"
                latex={String.raw`s(x) = \text{softmax}(W_g \cdot x), \quad s_i(x) \in [0, 1], \quad \sum_{i=1}^{N} s_i(x) = 1`}
                description="라우터(gating network)는 선형 변환 + softmax로 각 expert에 대한 확률 분포를 생성합니다. W_g는 d x N 가중치 행렬이며, 출력 s_i(x)는 토큰 x가 expert i에 얼마나 관련 있는지를 나타냅니다." />

              <EqCard idx={2} name="임계값 기반 라우팅 결정" color="teal"
                latex={String.raw`g_i(x) = s_i(x) \cdot \mathbf{1}\!\left[s_i(x) \geq \tau_i\right]`}
                description="핵심 수식. 토큰 x의 expert i에 대한 게이팅 가중치는 점수 s_i(x)가 임계값 tau_i 이상일 때만 활성화됩니다. 이는 top-k와 달리 토큰마다 활성 expert 수가 달라지는 가변적 라우팅을 가능하게 합니다." />

              <EqCard idx={3} name="EMA 임계값 업데이트" color="purple"
                latex={String.raw`\tau_i \leftarrow \alpha \cdot \tau_i + (1 - \alpha) \cdot \text{Percentile}_{p_\text{target}}\!\left(\{s_i(x) : x \in \mathcal{B}\}\right)`}
                description="매 학습 스텝마다 배치 B의 점수 분포에서 p_target 퍼센타일을 계산하고, EMA로 부드럽게 업데이트합니다. alpha가 높으면(~0.99) 안정적, 낮으면 빠른 적응. p_target = 1/N 설정 시 평균적으로 top-1과 동일한 총 활성 비율." />

              <EqCard idx={4} name="MoE 레이어 출력" color="blue"
                latex={String.raw`y(x) = \sum_{i=1}^{N} g_i(x) \cdot E_i(x) = \sum_{i:\,s_i(x)\,\geq\,\tau_i} s_i(x) \cdot E_i(x)`}
                description="활성화된 expert(s_i >= tau_i)의 출력만 가중합하여 최종 결과를 생성합니다. 비활성 expert의 FFN은 아예 연산하지 않으므로, 활성 expert가 적을수록 실제 FLOPs가 줄어듭니다." />

              <EqCard idx={5} name="TC-MoE 보조 손실 (비교 대상)" color="amber"
                latex={String.raw`\mathcal{L}_\text{aux} = \lambda \cdot N \sum_{i=1}^{N} f_i \cdot P_i, \quad f_i = \frac{|\{x : i \in \text{TopK}(s(x))\}|}{|\mathcal{B}|}, \quad P_i = \frac{1}{|\mathcal{B}|}\sum_{x \in \mathcal{B}} s_i(x)`}
                description="Switch/GShard의 보조 손실: f_i(expert i를 선택한 토큰 비율)와 P_i(평균 게이팅 확률)의 곱을 최소화. 이상적으로 f_i = P_i = 1/N (균등 분배). ET는 이 보조 손실이 불필요하며, EMA 임계값이 자연스럽게 같은 역할을 수행합니다." />
            </div>
          </Card>
        </div>
      </section>

      {/* ── Results ───────────────────────────────────────────── */}
      <section id="et-results" className="scroll-mt-20">
        <SectionHeading icon={<BarChart2 className="h-5 w-5" />} title="실험 결과" collapsed={!!col['et-res']} onToggle={() => toggle('et-res')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['et-res'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="5.1" title="메인 결과: FineWeb-Edu 사전학습" />
            <p className="mb-3 text-sm font-semibold text-gray-600 dark:text-gray-400">Cross-Entropy Eval Loss (낮을수록 좋음)</p>
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-400">방법</th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-gray-400">파라미터</th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-gray-400">활성 파라미터</th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-gray-400">Eval Loss</th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-gray-400">vs Dense</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { m: 'Dense Baseline', p: '~600M', ap: '~600M', loss: '--',    vs: '--',      hi: false },
                    { m: 'TC-MoE (Top-2)', p: '2.4B',  ap: '~600M', loss: 'L_tc',  vs: 'baseline', hi: false },
                    { m: 'ET (Threshold)',  p: '2.4B',  ap: '~600M (avg)', loss: 'L_tc - 0.067', vs: '-0.067', hi: true },
                  ].map((r, i) => (
                    <tr key={i} className={r.hi ? 'bg-teal-50 dark:bg-teal-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}>
                      <td className={`px-3 py-2 font-medium ${r.hi ? 'text-teal-700 dark:text-teal-300' : 'text-gray-700 dark:text-gray-300'}`}>{r.m}</td>
                      <td className="px-3 py-2 text-center font-mono text-gray-500 dark:text-gray-400">{r.p}</td>
                      <td className="px-3 py-2 text-center font-mono text-gray-500 dark:text-gray-400">{r.ap}</td>
                      <td className={`px-3 py-2 text-center font-mono font-semibold ${r.hi ? 'text-teal-700 dark:text-teal-300' : 'text-gray-600 dark:text-gray-400'}`}>{r.loss}</td>
                      <td className={`px-3 py-2 text-center font-mono font-semibold ${r.hi ? 'text-teal-700 dark:text-teal-300' : 'text-gray-500 dark:text-gray-400'}`}>{r.vs}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 dark:border-teal-800 dark:bg-teal-900/20">
                <p className="text-xs font-semibold text-teal-700 dark:text-teal-300">핵심 결과</p>
                <p className="mt-1 text-xs text-teal-600 dark:text-teal-400">
                  ET 라우팅이 TC-MoE 대비 0.067 낮은 cross-entropy loss 달성.
                  이는 동일 성능에 도달하기까지 <strong>1.6배 적은 학습 토큰</strong>이 필요하다는 것과 동등합니다.
                </p>
              </div>
              <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-800 dark:bg-blue-900/20">
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">토큰 효율성</p>
                <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                  1.6x 토큰 효율성 개선은 대규모 사전학습에서 엄청난 비용 절감을 의미합니다.
                  같은 GPU 시간으로 더 좋은 모델을 얻거나, 같은 모델을 더 저렴하게 학습할 수 있습니다.
                </p>
              </div>
            </div>

            <div className="mt-5">
              <SubSectionHeading number="5.2" title="보조 손실 제거 효과" />
              <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                <table className="w-full text-xs">
                  <thead><tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">설정</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">보조 손실</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">로드 밸런싱</th>
                    <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">비고</th>
                  </tr></thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {[
                      { cfg: 'TC-MoE + aux loss', aux: 'O (필수)', lb: '강제 분배', note: '하이퍼파라미터 lambda 민감, 본 목적과 충돌 가능' },
                      { cfg: 'TC-MoE - aux loss', aux: 'X', lb: '붕괴 (collapse)', note: '1~2개 expert에 토큰 집중, 나머지 미사용' },
                      { cfg: 'ET (본 논문)', aux: 'X (불필요)', lb: 'EMA 자기조절', note: '보조 손실 없이 자연스러운 균형 달성' },
                    ].map((r, i) => (
                      <tr key={i} className={i === 2 ? 'bg-teal-50 dark:bg-teal-900/20' : ''}>
                        <td className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">{r.cfg}</td>
                        <td className={`px-3 py-2 text-center font-semibold ${i === 2 ? 'text-green-600 dark:text-green-400' : i === 1 ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>{r.aux}</td>
                        <td className="px-3 py-2 text-center text-gray-500 dark:text-gray-400">{r.lb}</td>
                        <td className="px-3 py-2 text-gray-500 dark:text-gray-400">{r.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-5">
              <SubSectionHeading number="5.3" title="다운스트림 태스크 성능" />
              <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                GSM8K (수학 추론), HumanEval (코드 생성) 등 다운스트림 벤치마크에서도 ET가 TC-MoE를 일관되게 상회합니다.
                동적 연산 할당이 복잡한 추론 토큰에 더 많은 표현력을 부여하기 때문입니다.
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-300">사전학습 Loss</p>
                  <p className="mt-1 text-lg font-bold text-teal-600 dark:text-teal-400">-0.067</p>
                  <p className="text-[10px] text-gray-500">vs TC-MoE (CE loss)</p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-300">토큰 효율성</p>
                  <p className="mt-1 text-lg font-bold text-teal-600 dark:text-teal-400">1.6x</p>
                  <p className="text-[10px] text-gray-500">동일 성능 도달 속도</p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-300">보조 손실</p>
                  <p className="mt-1 text-lg font-bold text-green-600 dark:text-green-400">불필요</p>
                  <p className="text-[10px] text-gray-500">EMA 자기조절</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Limitations & Future ──────────────────────────────── */}
      <section id="et-limits" className="scroll-mt-20">
        <SectionHeading icon={<AlertTriangle className="h-5 w-5" />} title="한계 및 후속 연구 방향" collapsed={!!col['et-lim']} onToggle={() => toggle('et-lim')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['et-lim'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-3 text-sm font-bold text-red-700 dark:text-red-300">ET 라우팅의 한계</p>
                <div className="space-y-2">
                  {[
                    { t: '연산량 예측 어려움', d: '토큰마다 활성 expert 수가 달라 GPU 활용률 예측이 어려움. 배치 내 연산 불균형으로 하드웨어 효율 저하 가능.' },
                    { t: '실험 규모 제한', d: '2.4B 파라미터까지 검증. 수백B~조 규모의 초대형 모델에서의 효과는 미검증.' },
                    { t: 'EMA 초기화 민감도', d: '학습 초기 EMA 임계값이 수렴하기 전의 불안정 구간 존재. 워밍업 전략 필요.' },
                    { t: '0개 expert 활성화 가능', d: '모든 expert의 임계값을 넘지 못하는 토큰이 발생할 수 있음. Fallback 메커니즘 필요.' },
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
                    { t: '대규모 모델 검증', d: '7B, 13B, 70B+ 규모에서 ET의 스케일링 법칙 검증. MoE 모델이 커질수록 동적 라우팅의 이점 확대 예상.' },
                    { t: '하드웨어 최적화', d: '가변 expert 수에 대한 커널 최적화. Megablocks 등 sparse 연산 프레임워크와 통합.' },
                    { t: '적응형 alpha 스케줄링', d: '학습 단계에 따라 EMA 감쇠 계수를 동적으로 조절. 초기에는 빠른 적응, 후기에는 안정성.' },
                    { t: 'Expert Choice + ET 결합', d: '토큰-side와 expert-side 라우팅의 장점을 결합한 하이브리드 라우팅.' },
                  ].map(({ t, d }) => (
                    <div key={t} className="rounded-lg border border-green-100 bg-green-50 p-3 dark:border-green-900/30 dark:bg-green-900/10">
                      <p className="text-xs font-bold text-green-700 dark:text-green-300">{t}</p>
                      <p className="mt-0.5 text-xs text-green-600 dark:text-green-400">{d}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-900/20">
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">연구 관점의 의의</p>
              <p className="mt-1 text-xs leading-relaxed text-amber-600 dark:text-amber-400">
                ET 라우팅은 MoE의 두 가지 근본 문제 -- 고정 연산량과 보조 손실 의존 -- 를 하나의 메커니즘(EMA 임계값)으로 동시에 해결합니다.
                &ldquo;간단한 토큰은 적은 연산, 복잡한 토큰은 많은 연산&rdquo;이라는 직관을 수학적으로 우아하게 구현한 점에서
                Early Exit, Adaptive Depth 등 동적 연산 연구의 MoE 버전으로 볼 수 있습니다.
                향후 초대형 MoE 모델(GPT-4 MoE, Mixtral 등)의 효율 개선에 중요한 방향이 될 것입니다.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Quiz ──────────────────────────────────────────────── */}
      <section id="et-quiz" className="scroll-mt-20">
        <SectionHeading icon={<GraduationCap className="h-5 w-5" />} title="이해도 점검 퀴즈" collapsed={!!col['et-quiz']} onToggle={() => toggle('et-quiz')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['et-quiz'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              ET 라우팅의 핵심 개념을 점검하는 5문항입니다. 각 문항에서 답을 선택한 후 &ldquo;정답 확인&rdquo;을 누르세요.
            </p>
            <QuizSection />
          </Card>
        </div>
      </section>

    </div>
  );
}
