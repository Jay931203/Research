'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  BarChart2,
  BrainCircuit,
  ChevronDown,
  Compass,
  GraduationCap,
  Hash,
  Layers,
  Target,
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

/* ── Direction Visualization ─────────────────────────────────── */

function DirectionRoutingViz() {
  const [activeExpert, setActiveExpert] = useState<number | null>(null);
  const [inputAngle, setInputAngle] = useState(45);

  const experts = [
    { id: 0, angle: 30,  label: 'Expert 0', color: '#0d9488', desc: '구문 분석 전문' },
    { id: 1, angle: 90,  label: 'Expert 1', color: '#7c3aed', desc: '의미 추론 전문' },
    { id: 2, angle: 150, label: 'Expert 2', color: '#d97706', desc: '수치 연산 전문' },
    { id: 3, angle: 210, label: 'Expert 3', color: '#dc2626', desc: '상식 추론 전문' },
    { id: 4, angle: 270, label: 'Expert 4', color: '#2563eb', desc: '코드 생성 전문' },
    { id: 5, angle: 330, label: 'Expert 5', color: '#059669', desc: '언어 번역 전문' },
  ];

  const cx = 160, cy = 160, r = 120;

  const toRad = (deg: number) => (deg - 90) * Math.PI / 180;
  const inputRad = toRad(inputAngle);
  const inputX = cx + r * 0.85 * Math.cos(inputRad);
  const inputY = cy + r * 0.85 * Math.sin(inputRad);

  const angularDist = (a: number, b: number) => {
    const diff = Math.abs(a - b) % 360;
    return diff > 180 ? 360 - diff : diff;
  };

  const distances = experts.map(e => ({
    ...e,
    dist: angularDist(inputAngle, e.angle),
    sim: Math.cos(angularDist(inputAngle, e.angle) * Math.PI / 180),
  }));
  const sorted = [...distances].sort((a, b) => a.dist - b.dist);
  const topK = sorted.slice(0, 2);
  const topIds = new Set(topK.map(e => e.id));

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <svg viewBox="0 0 320 320" className="h-64 w-64 flex-shrink-0">
          <circle cx={cx} cy={cy} r={r + 10} fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gray-200 dark:text-gray-700" />
          <circle cx={cx} cy={cy} r={r * 0.5} fill="none" stroke="currentColor" strokeWidth="0.3" strokeDasharray="4 4" className="text-gray-200 dark:text-gray-700" />

          {experts.map(e => {
            const rad = toRad(e.angle);
            const ex = cx + r * Math.cos(rad);
            const ey = cy + r * Math.sin(rad);
            const isTop = topIds.has(e.id);
            const isHov = activeExpert === e.id;
            return (
              <g key={e.id} onMouseEnter={() => setActiveExpert(e.id)} onMouseLeave={() => setActiveExpert(null)} className="cursor-pointer">
                <line x1={cx} y1={cy} x2={ex} y2={ey}
                  stroke={e.color} strokeWidth={isTop ? 2.5 : 1} strokeDasharray={isTop ? undefined : '4 4'} opacity={isTop ? 1 : 0.3} />
                <circle cx={ex} cy={ey} r={isHov ? 10 : 7} fill={e.color} opacity={isTop ? 1 : 0.4} />
                <text x={ex + (Math.cos(rad) > 0 ? 12 : -12)} y={ey + 4}
                  textAnchor={Math.cos(rad) > 0 ? 'start' : 'end'}
                  className="fill-gray-600 text-[9px] dark:fill-gray-400">{e.label}</text>
              </g>
            );
          })}

          <line x1={cx} y1={cy} x2={inputX} y2={inputY} stroke="#f43f5e" strokeWidth={3} markerEnd="url(#arrow)" />
          <defs>
            <marker id="arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <path d="M0,0 L8,3 L0,6 Z" fill="#f43f5e" />
            </marker>
          </defs>
          <circle cx={cx} cy={cy} r={3} className="fill-gray-400 dark:fill-gray-500" />

          <text x={cx} y={cy - r - 18} textAnchor="middle" className="fill-gray-500 text-[9px] dark:fill-gray-400">
            활성화 방향 공간
          </text>
        </svg>

        <div className="flex-1 space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">
              입력 활성화 방향: {inputAngle}도
            </label>
            <input type="range" min={0} max={359} value={inputAngle}
              onChange={e => setInputAngle(Number(e.target.value))}
              className="w-full accent-rose-500" />
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
            <p className="mb-2 text-xs font-bold text-gray-700 dark:text-gray-300">라우팅 결과 (Top-2)</p>
            {topK.map(e => (
              <div key={e.id} className="mb-1 flex items-center gap-2">
                <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: e.color }} />
                <span className="text-xs text-gray-700 dark:text-gray-300">{e.label}</span>
                <span className="ml-auto font-mono text-xs text-gray-500">cos = {e.sim.toFixed(3)}</span>
              </div>
            ))}
          </div>
          {activeExpert !== null && (
            <div className="rounded-lg border border-teal-200 bg-teal-50 p-3 dark:border-teal-800 dark:bg-teal-900/20">
              <p className="text-xs font-bold text-teal-700 dark:text-teal-300">{experts[activeExpert].label}</p>
              <p className="text-xs text-teal-600 dark:text-teal-400">{experts[activeExpert].desc}</p>
              <p className="mt-1 font-mono text-xs text-teal-500">
                방향각: {experts[activeExpert].angle}도 | 거리: {angularDist(inputAngle, experts[activeExpert].angle).toFixed(1)}도
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Notation Table ──────────────────────────────────────────── */

function NotationTable() {
  const rows = [
    { sym: 'h_l', desc: '레이어 l에서의 토큰 활성화 벡터 (hidden state)' },
    { sym: 'd_l = h_l / ||h_l||', desc: '정규화된 방향 벡터 (크기 제거, 순수 방향)' },
    { sym: 'c_i', desc: 'Expert i의 방향 중심 벡터 (학습 가능한 파라미터)' },
    { sym: 'theta(d, c_i)', desc: '입력 방향 d와 Expert i 중심 사이의 각도' },
    { sym: 'S_dir(h, i)', desc: '방향 라우팅 점수 (angular similarity 기반)' },
    { sym: 'g_i', desc: 'Expert i에 대한 게이트 가중치 (softmax 결과)' },
    { sym: 'E_i(h)', desc: 'Expert i의 FFN 출력' },
    { sym: 'K', desc: 'Top-K 라우팅에서 선택할 Expert 수' },
    { sym: 'tau', desc: '온도 파라미터 (방향 민감도 조절)' },
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

/* ── Quiz Component ──────────────────────────────────────────── */

function Quiz() {
  const questions = [
    {
      q: '방향 라우팅에서 활성화 벡터의 "크기(magnitude)"를 제거하는 이유는?',
      options: [
        '연산 비용을 줄이기 위해',
        '크기에 의한 편향 없이 의미적 방향만으로 Expert를 선택하기 위해',
        '기울기 소실 문제를 방지하기 위해',
        '메모리 사용량을 줄이기 위해',
      ],
      answer: 1,
      explanation: '크기가 큰 활성화가 항상 특정 Expert를 지배하는 문제(magnitude bias)를 제거하여, 토큰의 의미적 방향에 따라 적절한 Expert를 선택할 수 있습니다.',
    },
    {
      q: '기존 linear router (W_g * h)와 비교했을 때 방향 라우팅의 핵심 차이는?',
      options: [
        'Expert 수를 동적으로 변경 가능',
        '활성화의 크기가 아닌 방향(angle)으로 라우팅 결정',
        '학습률을 자동으로 조절',
        'Attention 메커니즘을 대체',
      ],
      answer: 1,
      explanation: 'Linear router는 h의 크기에 비례하는 점수를 산출하므로 magnitude bias가 발생합니다. 방향 라우팅은 cos(theta) 기반으로 순수한 각도 관계만 사용합니다.',
    },
    {
      q: '온도 파라미터 tau가 낮아지면 라우팅 분포에 어떤 변화가 생기나?',
      options: [
        '모든 Expert에 균등하게 분배',
        '가장 가까운 방향의 Expert에 집중 (sharper)',
        '라우팅이 완전히 랜덤화',
        '학습이 중단됨',
      ],
      answer: 1,
      explanation: 'tau가 작으면 softmax가 sharper해져서, 각도가 가장 가까운 Expert에 가중치가 집중됩니다. tau가 크면 uniform에 가까워집니다.',
    },
    {
      q: '방향 중심 벡터 c_i가 학습 과정에서 서로 가까워지면 어떤 문제가 발생하나?',
      options: [
        '추론 속도 저하',
        '메모리 오버플로우',
        'Expert 붕괴 (collapse): 여러 Expert가 같은 토큰을 처리',
        '기울기 폭발',
      ],
      answer: 2,
      explanation: '방향 중심이 겹치면 동일한 토큰이 같은 Expert 집합에 라우팅되어, Expert 다양성이 사라지고 capacity가 낭비됩니다. 이를 방지하기 위해 angular separation loss를 사용합니다.',
    },
    {
      q: '다음 중 방향 라우팅이 특히 유리한 시나리오는?',
      options: [
        '모든 토큰의 활성화 크기가 비슷한 경우',
        '활성화 크기의 분산이 크고 outlier 토큰이 많은 경우',
        '모델 크기가 매우 작은 경우',
        'Expert가 1개인 경우',
      ],
      answer: 1,
      explanation: '활성화 크기 분산이 클수록 linear router의 magnitude bias가 심해집니다. 방향 라우팅은 크기를 정규화하므로 outlier 토큰에도 안정적인 라우팅을 제공합니다.',
    },
  ];

  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  const score = Object.entries(answers).reduce((acc, [qi, ai]) =>
    acc + (ai === questions[Number(qi)].answer ? 1 : 0), 0);

  return (
    <div className="space-y-4">
      {questions.map((q, qi) => (
        <div key={qi} className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="mb-3 text-sm font-semibold text-gray-800 dark:text-gray-200">
            Q{qi + 1}. {q.q}
          </p>
          <div className="space-y-2">
            {q.options.map((opt, oi) => {
              const selected = answers[qi] === oi;
              const correct = showResults && oi === q.answer;
              const wrong = showResults && selected && oi !== q.answer;
              return (
                <button key={oi}
                  onClick={() => !showResults && setAnswers(a => ({ ...a, [qi]: oi }))}
                  className={`w-full rounded-lg border px-3 py-2 text-left text-xs transition
                    ${correct ? 'border-green-400 bg-green-50 text-green-800 dark:border-green-600 dark:bg-green-900/30 dark:text-green-300' : ''}
                    ${wrong ? 'border-red-400 bg-red-50 text-red-800 dark:border-red-600 dark:bg-red-900/30 dark:text-red-300' : ''}
                    ${!correct && !wrong && selected ? 'border-teal-400 bg-teal-50 dark:border-teal-600 dark:bg-teal-900/30' : ''}
                    ${!correct && !wrong && !selected ? 'border-gray-200 hover:border-teal-300 dark:border-gray-600 dark:hover:border-teal-700' : ''}
                  `}>
                  <span className="mr-2 font-mono text-gray-400">{String.fromCharCode(65 + oi)}.</span>
                  {opt}
                </button>
              );
            })}
          </div>
          {showResults && (
            <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
              <p className="text-xs leading-relaxed text-blue-700 dark:text-blue-300">{q.explanation}</p>
            </div>
          )}
        </div>
      ))}
      <div className="flex items-center gap-3">
        <button onClick={() => setShowResults(true)}
          disabled={Object.keys(answers).length < questions.length}
          className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-teal-700 disabled:opacity-40">
          결과 확인
        </button>
        {showResults && (
          <>
            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{score}/{questions.length}점</span>
            <button onClick={() => { setAnswers({}); setShowResults(false); }}
              className="rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800">
              다시 풀기
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────── */

export default function DirectionalRoutingStudyFull() {
  const [col, setCol] = useState<Record<string, boolean>>({});
  const toggle = useCallback((id: string) => setCol(c => ({ ...c, [id]: !c[id] })), []);

  return (
    <div className="space-y-6">

      {/* ── Overview ─────────────────────────────────────────── */}
      <section id="dr-overview" className="scroll-mt-20">
        <div className="overflow-hidden rounded-xl shadow-sm">
          <div className="bg-gradient-to-br from-teal-700 via-cyan-700 to-blue-700 p-6 pb-8">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">2026</span>
              <span className="rounded-full bg-yellow-400/90 px-3 py-1 text-xs font-bold text-yellow-900">방향 기반 MoE 라우팅</span>
            </div>
            <h2 className="text-xl font-bold leading-snug text-white sm:text-2xl">
              Directional Routing in Transformers
            </h2>
            <p className="mt-3 text-sm text-teal-200">
              Taylor (2026) -- 활성화 방향 기반 Expert 라우팅
            </p>
          </div>
          <div className="bg-white p-6 dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
            <p className="leading-relaxed text-gray-700 dark:text-gray-300">
              Mixture-of-Experts (MoE) 트랜스포머에서 기존 linear router는 활성화 벡터의
              <span className="font-semibold text-teal-700 dark:text-teal-300"> 크기(magnitude)</span>에 의존하여 Expert를 선택합니다.
              이로 인해 크기가 큰 활성화가 항상 동일한 Expert를 지배하는
              <span className="font-semibold text-red-600 dark:text-red-400"> magnitude bias</span> 문제가 발생합니다.
            </p>
            <p className="mt-3 leading-relaxed text-gray-700 dark:text-gray-300">
              Directional Routing은 활성화 벡터를 정규화하여 순수한
              <span className="font-semibold text-teal-700 dark:text-teal-300"> 방향(direction)</span>만으로 라우팅을 결정합니다.
              각 Expert에 학습 가능한 방향 중심 벡터(directional centroid)를 부여하고,
              입력 활성화의 방향과 Expert 중심 사이의
              <span className="font-semibold text-teal-700 dark:text-teal-300"> 각도 유사도(angular similarity)</span>로 라우팅 점수를 산출합니다.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {['Angular Similarity', 'Magnitude-Invariant', 'Directional Centroid', 'Expert Load Balancing', 'MoE Transformer'].map(tag => (
                <span key={tag} className="rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Core Idea ───────────────────────────────────────── */}
      <section id="dr-core" className="scroll-mt-20">
        <SectionHeading icon={<BrainCircuit className="h-5 w-5" />} title="핵심 아이디어: 방향 기반 라우팅" collapsed={!!col['dr-core']} onToggle={() => toggle('dr-core')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['dr-core'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="1.1" title="기존 라우팅의 문제: Magnitude Bias" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              표준 MoE 라우터는 선형 변환을 사용합니다: <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs dark:bg-gray-800">g = softmax(W_g * h)</code>.
              이 방식에서 라우팅 점수는 ||h||에 비례하므로, 활성화 크기가 큰 토큰이 항상 동일한 Expert를 선택합니다.
            </p>
            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-900/10">
                <p className="mb-1 text-xs font-bold text-red-700 dark:text-red-300">Linear Router (문제)</p>
                <p className="text-xs text-red-600 dark:text-red-400">
                  s_i = w_i^T h<br/>
                  = ||w_i|| ||h|| cos(theta)<br/>
                  → ||h||가 크면 점수도 커짐<br/>
                  → 크기가 큰 토큰이 특정 Expert 지배<br/>
                  → Expert 불균형 + 표현력 저하
                </p>
              </div>
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900/40 dark:bg-green-900/10">
                <p className="mb-1 text-xs font-bold text-green-700 dark:text-green-300">Directional Router (해결)</p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  d = h / ||h|| (방향 추출)<br/>
                  s_i = cos(d, c_i) / tau<br/>
                  → ||h||와 무관한 라우팅<br/>
                  → 의미적 방향만으로 Expert 선택<br/>
                  → 균형적 Expert 활용
                </p>
              </div>
            </div>

            <SubSectionHeading number="1.2" title="방향 = 의미, 크기 = 신뢰도" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              뉴럴 네트워크에서 활성화 벡터의 <strong>방향</strong>은 토큰의 의미적 특성(syntax, semantics, domain)을 인코딩하고,
              <strong>크기</strong>는 해당 표현의 확신도(confidence)를 나타냅니다.
              기존 라우터는 이 둘을 혼합하여 Expert를 선택하지만, 방향 라우팅은 의미적 방향만으로 결정합니다.
            </p>
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-900/20">
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">직관적 비유</p>
              <p className="mt-1 text-xs leading-relaxed text-amber-600 dark:text-amber-400">
                &ldquo;어디로 가느냐&rdquo;(방향)와 &ldquo;얼마나 빨리 가느냐&rdquo;(크기)를 분리합니다.
                도서관에서 책을 찾을 때, 어떤 분야(방향)인지가 어느 서가에 갈지를 결정하지,
                얼마나 급한지(크기)가 서가를 바꾸진 않습니다. 방향 라우팅은 이 원리를 Expert 선택에 적용합니다.
              </p>
            </div>

            <div className="mt-5">
              <SubSectionHeading number="1.3" title="방향 중심 벡터 (Directional Centroids)" />
              <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
                각 Expert i는 학습 가능한 단위 벡터 c_i를 보유합니다.
                이 벡터는 해당 Expert가 &ldquo;전문&rdquo;으로 처리하는 활성화 방향의 중심을 나타냅니다.
                학습이 진행되면서 각 c_i는 자연스럽게 서로 다른 방향으로 분산되어 입력 공간을 분할합니다.
              </p>
              <div className="space-y-2">
                {[
                  { step: '1', text: '각 Expert i에 방향 중심 c_i 초기화 (균등 분포 또는 k-means)' },
                  { step: '2', text: '입력 h를 정규화: d = h / ||h||' },
                  { step: '3', text: '모든 Expert에 대해 angular similarity 계산: cos(d, c_i)' },
                  { step: '4', text: 'Top-K Expert 선택 후 softmax로 가중치 산출' },
                  { step: '5', text: 'Expert 출력의 가중합으로 최종 결과 생성' },
                ].map(({ step, text }) => (
                  <div key={step} className="flex gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white">{step}</span>
                    <p className="text-xs text-gray-700 dark:text-gray-300">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Key Equations ─────────────────────────────────────── */}
      <section id="dr-equations" className="scroll-mt-20">
        <SectionHeading icon={<Hash className="h-5 w-5" />} title="핵심 수식" collapsed={!!col['dr-equations']} onToggle={() => toggle('dr-equations')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['dr-equations'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="space-y-3">
              <EqCard idx={1} name="방향 추출 (Direction Extraction)" color="teal"
                latex={String.raw`\mathbf{d}_l = \frac{\mathbf{h}_l}{\|\mathbf{h}_l\|_2}`}
                description="활성화 벡터 h_l을 L2 정규화하여 단위 벡터 d_l을 얻습니다. 이 과정에서 크기 정보가 제거되고 순수한 방향만 남습니다. 모든 토큰이 단위 초구면(unit hypersphere) 위의 점이 됩니다." />

              <EqCard idx={2} name="각도 유사도 (Angular Similarity)" color="blue"
                latex={String.raw`\text{sim}(\mathbf{d}, \mathbf{c}_i) = \cos\theta = \frac{\mathbf{d}^\top \mathbf{c}_i}{\|\mathbf{d}\|\,\|\mathbf{c}_i\|} = \mathbf{d}^\top \mathbf{c}_i`}
                description="입력 방향 d와 Expert i의 중심 c_i 사이의 코사인 유사도. 둘 다 단위 벡터이므로 내적이 곧 코사인 유사도입니다. 값은 [-1, 1] 범위이며, 1이면 완전히 같은 방향입니다." />

              <EqCard idx={3} name="방향 라우팅 점수 (Directional Routing Score)" color="teal"
                latex={String.raw`S_{\text{dir}}(\mathbf{h}, i) = \frac{\cos(\mathbf{d}_l,\, \mathbf{c}_i)}{\tau}`}
                description="온도 tau로 스케일링된 라우팅 점수. tau가 작으면 가장 가까운 Expert에 집중(hard routing에 근사), tau가 크면 균등 분배(soft routing)에 가까워집니다. 학습 초기에는 큰 tau로 시작하여 점진적으로 줄이는 annealing 전략이 효과적입니다." />

              <EqCard idx={4} name="게이트 가중치 (Gate Weights)" color="purple"
                latex={String.raw`g_i = \frac{\exp(S_{\text{dir}}(\mathbf{h}, i))}{\sum_{j \in \text{Top-K}} \exp(S_{\text{dir}}(\mathbf{h}, j))}`}
                description="Top-K Expert만 선택한 후 softmax를 적용하여 게이트 가중치를 산출합니다. Top-K 외의 Expert는 g_i = 0으로 설정되어 계산 비용이 절감됩니다." />

              <EqCard idx={5} name="MoE 출력 (Mixture Output)" color="green"
                latex={String.raw`\mathbf{y} = \sum_{i \in \text{Top-K}} g_i \cdot E_i(\mathbf{h})`}
                description="선택된 K개 Expert의 출력을 게이트 가중치로 가중합합니다. 각 E_i는 독립적인 FFN(Feed-Forward Network)이며, 방향 라우팅은 h의 방향에 맞는 전문 FFN을 선택합니다." />

              <EqCard idx={6} name="각도 분리 손실 (Angular Separation Loss)" color="amber"
                latex={String.raw`\mathcal{L}_{\text{sep}} = \frac{1}{N(N-1)} \sum_{i \neq j} \max\!\left(0,\; \mathbf{c}_i^\top \mathbf{c}_j - \cos\!\left(\frac{\pi}{N}\right)\right)^2`}
                description="Expert 중심 벡터들이 서로 충분히 떨어지도록 강제하는 정규화 손실. N개 Expert가 초구면 위에 균등 분포하는 이상적 각도(pi/N)보다 가까우면 페널티를 부과합니다. Expert collapse를 방지하는 핵심 메커니즘입니다." />
            </div>

            <div className="mt-5">
              <SubSectionHeading number="2.7" title="기호 참조" />
              <NotationTable />
            </div>
          </Card>
        </div>
      </section>

      {/* ── Architecture ──────────────────────────────────────── */}
      <section id="dr-arch" className="scroll-mt-20">
        <SectionHeading icon={<Layers className="h-5 w-5" />} title="아키텍처: 트랜스포머 레이어 내 방향 라우팅" collapsed={!!col['dr-arch']} onToggle={() => toggle('dr-arch')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['dr-arch'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="3.1" title="전체 파이프라인" />
            <div className="mb-5 space-y-3">
              {[
                { step: '1', title: 'Self-Attention', desc: 'Multi-Head Attention으로 토큰 간 관계를 인코딩하여 h_l을 생성합니다.', color: 'blue' },
                { step: '2', title: 'Direction Extraction', desc: 'd = h_l / ||h_l||로 방향 벡터를 추출합니다. LayerNorm 이후에 적용하면 더 안정적입니다.', color: 'teal' },
                { step: '3', title: 'Angular Scoring', desc: '모든 Expert 중심 c_i와의 코사인 유사도를 계산합니다. O(N * d_model) 연산.', color: 'cyan' },
                { step: '4', title: 'Top-K Selection', desc: '가장 높은 유사도를 가진 K개 Expert를 선택합니다. 보통 K=1 또는 K=2.', color: 'purple' },
                { step: '5', title: 'Expert Computation', desc: '선택된 Expert만 활성화하여 FFN 연산을 수행합니다. 비선택 Expert는 연산하지 않습니다.', color: 'amber' },
                { step: '6', title: 'Weighted Sum + Residual', desc: 'Expert 출력의 가중합에 잔차 연결을 더합니다: output = h_l + sum(g_i * E_i(h_l)).', color: 'green' },
              ].map(({ step, title, desc, color }) => (
                <div key={step} className="flex gap-3 rounded-lg border border-gray-200 bg-gray-50/70 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white">{step}</span>
                  <div>
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-gray-600 dark:text-gray-400">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <SubSectionHeading number="3.2" title="학습 시 손실 함수" />
            <div className="mb-4 overflow-x-auto rounded-lg bg-teal-50 p-3 dark:bg-teal-900/20">
              <EquationRenderer latex={String.raw`\mathcal{L} = \mathcal{L}_{\text{task}} + \alpha\,\mathcal{L}_{\text{balance}} + \beta\,\mathcal{L}_{\text{sep}}`} />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
                <p className="text-xs font-bold text-gray-700 dark:text-gray-300">L_task</p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">메인 태스크 손실 (LM: cross-entropy). 모델의 기본 성능을 학습합니다.</p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
                <p className="text-xs font-bold text-gray-700 dark:text-gray-300">L_balance</p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Expert 간 부하 균형 손실. 특정 Expert에 토큰이 집중되는 것을 방지합니다.</p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
                <p className="text-xs font-bold text-gray-700 dark:text-gray-300">L_sep</p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">각도 분리 손실. Expert 중심이 겹치지 않도록 방향 다양성을 보장합니다.</p>
              </div>
            </div>

            <div className="mt-5">
              <SubSectionHeading number="3.3" title="온도 어닐링 전략" />
              <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
                학습 단계에 따라 온도 tau를 조절하여 라우팅의 &ldquo;경직도&rdquo;를 제어합니다:
              </p>
              <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                <table className="w-full text-xs">
                  <thead><tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">단계</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">tau</th>
                    <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">라우팅 특성</th>
                    <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">목적</th>
                  </tr></thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {[
                      { phase: '초기 (0-20%)', tau: '1.0', char: 'Soft (균등 분배)', purpose: 'Expert 탐색, 다양한 방향 학습' },
                      { phase: '중기 (20-80%)', tau: '0.5', char: 'Mixed', purpose: '전문화 시작, 방향 분리' },
                      { phase: '후기 (80-100%)', tau: '0.1', char: 'Hard (집중)', purpose: '전문화 강화, 최종 성능 최적화' },
                    ].map((r, i) => (
                      <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">{r.phase}</td>
                        <td className="px-3 py-2 text-center font-mono text-teal-600 dark:text-teal-400">{r.tau}</td>
                        <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{r.char}</td>
                        <td className="px-3 py-2 text-gray-500 dark:text-gray-400">{r.purpose}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Interactive Visualization ─────────────────────────── */}
      <section id="dr-viz" className="scroll-mt-20">
        <SectionHeading icon={<Compass className="h-5 w-5" />} title="인터랙티브 시각화: 방향 라우팅" collapsed={!!col['dr-viz']} onToggle={() => toggle('dr-viz')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['dr-viz'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <p className="mb-4 text-sm text-gray-700 dark:text-gray-300">
              슬라이더로 입력 활성화의 방향을 변경하면서, 어떤 Expert가 선택되는지 확인하세요.
              빨간 화살표가 입력 방향, 원형 노드가 각 Expert의 방향 중심입니다.
              Top-2 방식으로 가장 가까운 2개 Expert가 선택됩니다.
            </p>
            <DirectionRoutingViz />
            <Caption>2D 투영된 방향 공간. 실제로는 d_model 차원 초구면 위에서 동작합니다.</Caption>
          </Card>
        </div>
      </section>

      {/* ── Results ───────────────────────────────────────────── */}
      <section id="dr-results" className="scroll-mt-20">
        <SectionHeading icon={<BarChart2 className="h-5 w-5" />} title="실험 결과" collapsed={!!col['dr-results']} onToggle={() => toggle('dr-results')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['dr-results'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="5.1" title="언어 모델 성능 (Perplexity)" />
            <p className="mb-3 text-sm font-semibold text-gray-600 dark:text-gray-400">MoE Transformer (8 Experts, Top-2) -- 다양한 라우팅 전략 비교</p>
            <div className="mb-5 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-400">라우팅 방식</th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-gray-400">PPL (1B)</th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-gray-400">PPL (7B)</th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-gray-400">Expert 활용률</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { m: 'Dense (Expert 없음)',      p1: '18.2', p7: '8.4',  util: '--',   hi: false },
                    { m: 'Hash Routing (랜덤)',       p1: '16.5', p7: '7.8',  util: '100%', hi: false },
                    { m: 'Linear Router (표준)',      p1: '15.1', p7: '7.1',  util: '72%',  hi: false },
                    { m: 'Token-Choice Routing',     p1: '14.8', p7: '6.9',  util: '81%',  hi: false },
                    { m: 'Expert-Choice Routing',    p1: '14.5', p7: '6.7',  util: '95%',  hi: false },
                    { m: 'Directional Routing',      p1: '14.0', p7: '6.4',  util: '94%',  hi: true  },
                  ].map((r, i) => (
                    <tr key={i} className={r.hi ? 'bg-teal-50 dark:bg-teal-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}>
                      <td className={`px-3 py-2 font-medium ${r.hi ? 'text-teal-700 dark:text-teal-300' : 'text-gray-700 dark:text-gray-300'}`}>{r.m}</td>
                      <td className={`px-3 py-2 text-center font-mono font-semibold ${r.hi ? 'text-teal-700 dark:text-teal-300' : 'text-gray-600 dark:text-gray-400'}`}>{r.p1}</td>
                      <td className={`px-3 py-2 text-center font-mono font-semibold ${r.hi ? 'text-teal-700 dark:text-teal-300' : 'text-gray-600 dark:text-gray-400'}`}>{r.p7}</td>
                      <td className={`px-3 py-2 text-center font-mono ${r.hi ? 'text-teal-600 dark:text-teal-400' : 'text-gray-500 dark:text-gray-400'}`}>{r.util}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 dark:border-teal-800 dark:bg-teal-900/20">
                <p className="text-xs font-semibold text-teal-700 dark:text-teal-300">핵심 관찰 1: 성능</p>
                <p className="mt-1 text-xs text-teal-600 dark:text-teal-400">
                  7B 규모에서 PPL 6.4로 Linear Router(7.1) 대비 9.9% 개선.
                  Expert-Choice(6.7)보다도 4.5% 우수. 방향 기반 라우팅이 의미적으로 더 적절한 Expert 선택을 수행함을 시사합니다.
                </p>
              </div>
              <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-800 dark:bg-blue-900/20">
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">핵심 관찰 2: Expert 활용률</p>
                <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                  94%의 Expert 활용률은 L_sep 없이는 ~65%로 하락.
                  각도 분리 손실이 Expert 다양성을 보장하는 핵심 요소임을 확인합니다.
                  Linear Router(72%)와의 격차가 크며 별도의 부하 균형 메커니즘 없이 달성됩니다.
                </p>
              </div>
            </div>

            <div className="mt-5">
              <SubSectionHeading number="5.2" title="Ablation: 구성 요소별 기여도" />
              <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                <table className="w-full text-xs">
                  <thead><tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">설정</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">PPL (1B)</th>
                    <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">비고</th>
                  </tr></thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {[
                      { cfg: 'Directional + L_sep + Annealing (Full)', ppl: '14.0', note: '최고 성능' },
                      { cfg: '- L_sep 제거', ppl: '14.9', note: 'Expert collapse 발생, 활용률 65%' },
                      { cfg: '- Annealing 제거 (tau=0.5 고정)', ppl: '14.4', note: '학습 초기 불안정' },
                      { cfg: '- Direction 제거 (cosine만 사용)', ppl: '14.6', note: 'Magnitude bias 부분 잔존' },
                      { cfg: 'Linear Router 기준선', ppl: '15.1', note: '방향 라우팅의 기여 확인' },
                    ].map((r, i) => (
                      <tr key={i} className={i === 0 ? 'bg-teal-50 dark:bg-teal-900/20' : ''}>
                        <td className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">{r.cfg}</td>
                        <td className={`px-3 py-2 text-center font-mono font-semibold ${i === 0 ? 'text-teal-700 dark:text-teal-300' : 'text-gray-600 dark:text-gray-400'}`}>{r.ppl}</td>
                        <td className="px-3 py-2 text-gray-500 dark:text-gray-400">{r.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-5">
              <SubSectionHeading number="5.3" title="다운스트림 태스크 성능" />
              <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                <table className="w-full text-xs">
                  <thead><tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">태스크</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">Linear</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">Expert-Choice</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">Directional</th>
                  </tr></thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {[
                      { task: 'HellaSwag (추론)', lin: '72.4', ec: '74.1', dir: '75.8' },
                      { task: 'MMLU (지식)', lin: '58.3', ec: '59.7', dir: '61.2' },
                      { task: 'GSM8K (수학)', lin: '34.1', ec: '36.8', dir: '39.5' },
                      { task: 'HumanEval (코드)', lin: '28.0', ec: '30.5', dir: '33.2' },
                    ].map((r, i) => (
                      <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">{r.task}</td>
                        <td className="px-3 py-2 text-center font-mono text-gray-600 dark:text-gray-400">{r.lin}</td>
                        <td className="px-3 py-2 text-center font-mono text-gray-600 dark:text-gray-400">{r.ec}</td>
                        <td className="px-3 py-2 text-center font-mono font-semibold text-teal-700 dark:text-teal-300">{r.dir}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                특히 GSM8K(+5.4pp), HumanEval(+5.2pp)에서 큰 폭의 개선.
                수학/코드처럼 특화된 능력이 필요한 태스크에서 방향 기반 전문화가 효과적임을 시사합니다.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Comparison ────────────────────────────────────────── */}
      <section id="dr-compare" className="scroll-mt-20">
        <SectionHeading icon={<Target className="h-5 w-5" />} title="기존 방법 비교" collapsed={!!col['dr-compare']} onToggle={() => toggle('dr-compare')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['dr-compare'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead><tr className="bg-gray-50 dark:bg-gray-800">
                  <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">특성</th>
                  <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">Linear Router</th>
                  <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">Top-K Token</th>
                  <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">Expert-Choice</th>
                  <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">Threshold</th>
                  <th className="px-3 py-2 text-center font-bold text-teal-700 dark:text-teal-300">Directional</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { feat: 'Magnitude 무관', v: ['No', 'No', 'Partial', 'No', 'Yes'] },
                    { feat: 'Expert 균형 보장', v: ['No', 'Aux Loss', 'Yes', 'No', 'L_sep'] },
                    { feat: '라우팅 해석성', v: ['Low', 'Low', 'Medium', 'Low', 'High'] },
                    { feat: '학습 안정성', v: ['Medium', 'Medium', 'High', 'Low', 'High'] },
                    { feat: '토큰 드롭 위험', v: ['Yes', 'Yes', 'No', 'Yes', 'No'] },
                    { feat: '추가 파라미터', v: ['W_g', 'W_g', 'W_g', 'W_g + theta', 'c_i + tau'] },
                    { feat: '연산 오버헤드', v: ['O(Nd)', 'O(Nd)', 'O(Nd)', 'O(Nd)', 'O(Nd)'] },
                  ].map((r, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">{r.feat}</td>
                      {r.v.map((v, j) => (
                        <td key={j} className={`px-3 py-2 text-center ${j === 4 ? 'font-semibold text-teal-700 dark:text-teal-300' : 'text-gray-600 dark:text-gray-400'}`}>{v}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-3 text-sm font-bold text-gray-700 dark:text-gray-300">각 라우팅 방식의 핵심 한계</p>
                <div className="space-y-2">
                  {[
                    { m: 'Linear Router', issue: '||h||에 비례하는 점수 -> magnitude bias. 크기가 큰 outlier 토큰이 특정 Expert를 지배.' },
                    { m: 'Top-K Token Choice', issue: '토큰이 Expert를 선택 -> 인기 Expert에 과부하, 비인기 Expert는 유휴. Auxiliary loss 필요.' },
                    { m: 'Expert-Choice', issue: 'Expert가 토큰을 선택 -> 인과적 추론에서 미래 토큰 참조 불가. 일부 토큰이 드롭될 수 있음.' },
                    { m: 'Threshold Routing', issue: '임계값 설정이 민감. 입력 분포 변화에 취약. 토큰당 활성 Expert 수가 불안정.' },
                  ].map(({ m, issue }) => (
                    <div key={m} className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
                      <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{m}</p>
                      <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{issue}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-3 text-sm font-bold text-teal-700 dark:text-teal-300">Directional Routing의 해결</p>
                <div className="space-y-2">
                  {[
                    { adv: 'Magnitude Invariance', desc: 'L2 정규화로 크기 정보를 완전히 제거. 모든 토큰이 동등한 조건에서 라우팅.' },
                    { adv: 'Angular Separation', desc: 'L_sep가 Expert 중심의 방향 다양성을 보장. Auxiliary loss 없이도 높은 활용률.' },
                    { adv: '해석 가능성', desc: 'Expert 중심 c_i를 시각화하면 각 Expert의 전문 분야를 직관적으로 파악 가능.' },
                    { adv: '드롭 없음', desc: '모든 토큰이 반드시 Top-K Expert에 라우팅됨. 정보 손실 없음.' },
                  ].map(({ adv, desc }) => (
                    <div key={adv} className="rounded-lg border border-teal-200 bg-teal-50 p-3 dark:border-teal-800 dark:bg-teal-900/20">
                      <p className="text-xs font-bold text-teal-700 dark:text-teal-300">{adv}</p>
                      <p className="mt-0.5 text-xs text-teal-600 dark:text-teal-400">{desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Quiz ──────────────────────────────────────────────── */}
      <section id="dr-quiz" className="scroll-mt-20">
        <SectionHeading icon={<HelpCircle className="h-5 w-5" />} title="이해도 점검 퀴즈" collapsed={!!col['dr-quiz']} onToggle={() => toggle('dr-quiz')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['dr-quiz'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <Quiz />
          </Card>
        </div>
      </section>
    </div>
  );
}
