'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  BarChart2,
  BrainCircuit,
  ChevronDown,
  Cpu,
  FlaskConical,
  GraduationCap,
  Hash,
  Layers,
  Zap,
} from 'lucide-react';
import katex from 'katex';
import GlossaryText from '@/components/glossary/GlossaryText';

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
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">{number}</span>
      <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">{title}</h4>
    </div>
  );
}

function EqCard({ idx, name, latex, description, color = 'amber' }: {
  idx: number; name: string; latex: string; description: string; color?: string;
}) {
  const [open, setOpen] = useState(false);
  const colorMap: Record<string, string> = {
    amber:  'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
    orange: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800',
    green:  'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
  };
  const badgeMap: Record<string, string> = {
    amber:  'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
    indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
    green:  'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  };
  return (
    <div className="cursor-pointer rounded-xl border border-gray-200 bg-gray-50/50 p-4 transition hover:border-amber-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-amber-700" onClick={() => setOpen(v => !v)}>
      <div className="mb-2 flex items-center gap-2">
        <span className={`rounded px-2 py-0.5 text-xs font-bold ${badgeMap[color] ?? badgeMap.amber}`}>Eq. {idx}</span>
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{name}</span>
        <ChevronDown className={`ml-auto h-4 w-4 text-gray-400 transition-transform dark:text-gray-500 ${open ? 'rotate-180' : ''}`} />
      </div>
      <div className="overflow-x-auto py-2 text-gray-900 dark:text-gray-100"><EquationRenderer latex={latex} /></div>
      {open ? (
        <div className={`mt-3 rounded-lg border px-4 py-3 ${colorMap[color] ?? colorMap.amber}`}>
          <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">{description}</p>
        </div>
      ) : (
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">클릭하여 상세 설명 보기</p>
      )}
    </div>
  );
}

function QuizSection({ questions, color = 'amber' }: { questions: { q: string; a: string }[]; color?: string }) {
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const toggle = (i: number) => setRevealed(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; });
  const bgMap: Record<string, string> = {
    amber: 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20',
  };
  return (
    <div className="space-y-3">
      {questions.map(({ q, a }, i) => (
        <div key={i} className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
          <button onClick={() => toggle(i)} className="flex w-full items-start gap-3 p-4 text-left">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600 dark:bg-gray-800 dark:text-gray-400">Q{i + 1}</span>
            <span className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">{q}</span>
            <ChevronDown className={`h-4 w-4 flex-shrink-0 text-gray-400 transition-transform ${revealed.has(i) ? 'rotate-180' : ''}`} />
          </button>
          {revealed.has(i) && (
            <div className={`mx-4 mb-4 rounded-lg border px-4 py-3 ${bgMap[color] ?? bgMap.amber}`}>
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                <span className="mr-1 font-bold text-green-600 dark:text-green-400">A:</span>{a}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── HAQ Policy Visualization ────────────────────────────────── */

const LAYER_LABELS = [
  'Conv1', 'DW2', 'PW3', 'DW4', 'PW5', 'DW6',
  'PW7', 'DW8', 'PW9', 'DW10', 'PW11', 'FC12',
];

// true = depthwise (memory-bound), false = pointwise/conv/fc (compute-bound)
const IS_DW = [false, true, false, true, false, true, false, true, false, true, false, false];

// Edge (BISMO Zynq-7020): DW layers get lower bits (memory-bound → bandwidth reduction helps more)
const EDGE_BITS =   [6, 2, 5, 2, 5, 3, 5, 2, 4, 3, 4, 6];
// Cloud (BISMO VU9P): DW layers get higher bits (compute-bound dominates, DW less critical)
const CLOUD_BITS =  [4, 5, 3, 6, 3, 5, 4, 4, 3, 5, 3, 4];

const BAR_MAX = 8;
const SVG_W = 560;
const SVG_H = 200;
const PAD_L = 32;
const PAD_R = 12;
const PAD_T = 12;
const PAD_B = 36;
const CHART_W = SVG_W - PAD_L - PAD_R;
const CHART_H = SVG_H - PAD_T - PAD_B;
const N = LAYER_LABELS.length;
const BAR_TOTAL = CHART_W / N;
const BAR_W = BAR_TOTAL * 0.6;
const BAR_OFFSET = (BAR_TOTAL - BAR_W) / 2;

function HAQPolicyViz() {
  const [activeTab, setActiveTab] = useState<'edge' | 'cloud'>('edge');
  const bits = activeTab === 'edge' ? EDGE_BITS : CLOUD_BITS;

  const barColor = (dw: boolean) =>
    dw
      ? (activeTab === 'edge' ? '#dc2626' : '#2563eb')   // red for edge DW, blue for cloud DW
      : (activeTab === 'edge' ? '#f59e0b' : '#7c3aed');  // amber for edge PW, purple for cloud PW

  const yScale = (b: number) => PAD_T + CHART_H - (b / BAR_MAX) * CHART_H;
  const barH = (b: number) => (b / BAR_MAX) * CHART_H;

  const avgBits = (bits.reduce((a, b) => a + b, 0) / bits.length).toFixed(1);

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/30 p-4 dark:border-amber-900/40 dark:bg-amber-900/5">
      {/* Tab switcher */}
      <div className="mb-4 flex gap-2">
        {[
          { key: 'edge' as const, label: '엣지 (BISMO Zynq-7020)', activeClass: 'bg-amber-600 text-white shadow-sm' },
          { key: 'cloud' as const, label: '클라우드 (BISMO VU9P)', activeClass: 'bg-blue-600 text-white shadow-sm' },
        ].map(({ key, label, activeClass }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-all duration-200 ${
              activeTab === key
                ? activeClass
                : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:ring-amber-300 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* SVG bar chart */}
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full min-w-[320px]" aria-label="HAQ 비트폭 정책 차트">
          {/* Y gridlines + labels */}
          {[2, 4, 6, 8].map(b => (
            <g key={b}>
              <line
                x1={PAD_L} y1={yScale(b)}
                x2={SVG_W - PAD_R} y2={yScale(b)}
                stroke="#e5e7eb" strokeWidth={1} strokeDasharray="4 3"
              />
              <text x={PAD_L - 4} y={yScale(b) + 4} textAnchor="end" fontSize={9} fill="#9ca3af">{b}</text>
            </g>
          ))}

          {/* Bars */}
          {bits.map((b, i) => {
            const x = PAD_L + i * BAR_TOTAL + BAR_OFFSET;
            const y = yScale(b);
            const h = barH(b);
            const dw = IS_DW[i];
            const fill = barColor(dw);
            return (
              <g key={i}>
                <rect
                  x={x} y={y}
                  width={BAR_W} height={h}
                  rx={3}
                  fill={fill}
                  opacity={0.85}
                />
                {/* Bit label on top of bar */}
                <text
                  x={x + BAR_W / 2}
                  y={y - 3}
                  textAnchor="middle"
                  fontSize={9}
                  fontWeight="bold"
                  fill={fill}
                >
                  {b}
                </text>
                {/* DW indicator dot */}
                {dw && (
                  <circle
                    cx={x + BAR_W / 2}
                    cy={y + h + 6}
                    r={3}
                    fill={fill}
                    opacity={0.7}
                  />
                )}
                {/* X axis labels */}
                <text
                  x={x + BAR_W / 2}
                  y={SVG_H - 4}
                  textAnchor="middle"
                  fontSize={8}
                  fill="#6b7280"
                >
                  {LAYER_LABELS[i]}
                </text>
              </g>
            );
          })}

          {/* Y axis line */}
          <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + CHART_H} stroke="#d1d5db" strokeWidth={1} />
          {/* X axis line */}
          <line x1={PAD_L} y1={PAD_T + CHART_H} x2={SVG_W - PAD_R} y2={PAD_T + CHART_H} stroke="#d1d5db" strokeWidth={1} />
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <span
            className="h-3 w-3 rounded-sm"
            style={{ backgroundColor: activeTab === 'edge' ? '#dc2626' : '#2563eb' }}
          />
          <span className="text-gray-600 dark:text-gray-400">메모리 바운드 레이어 (DW-Conv)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="h-3 w-3 rounded-sm"
            style={{ backgroundColor: activeTab === 'edge' ? '#f59e0b' : '#7c3aed' }}
          />
          <span className="text-gray-600 dark:text-gray-400">연산 바운드 레이어 (Conv/PW/FC)</span>
        </div>
        <div className="ml-auto font-semibold text-amber-700 dark:text-amber-300">
          평균 비트폭: {avgBits}bit
        </div>
      </div>

      {/* Roofline insight */}
      <div className={`mt-3 rounded-lg border px-4 py-3 transition-all duration-200 ${
        activeTab === 'edge'
          ? 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20'
          : 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'
      }`}>
        {activeTab === 'edge' ? (
          <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-200">
            <span className="font-bold">엣지(Zynq-7020) 루프라인 인사이트:</span> 소형 FPGA는 메모리 대역폭이 병목.
            DW-Conv는 파라미터 대비 연산이 적어 <span className="font-semibold">메모리 바운드</span> — 비트폭을 낮추면 대역폭이 줄어 직접적인 지연 감소 효과.
            반면 PW-Conv는 연산 집약적(compute-bound)이라 비트폭 절감의 지연 이득이 상대적으로 작음.
            HAQ는 이 차이를 루프라인 모델로 감지하여 DW 레이어에 2-3비트를 자동 할당.
          </p>
        ) : (
          <p className="text-xs leading-relaxed text-blue-800 dark:text-blue-200">
            <span className="font-bold">클라우드(VU9P) 루프라인 인사이트:</span> 대형 FPGA는 연산 자원이 풍부하고 메모리 대역폭도 넓음.
            DW-Conv가 <span className="font-semibold">연산 바운드</span> 영역으로 이동 — 비트폭을 낮춰도 지연 감소가 제한적.
            오히려 정확도 손실이 크므로 DW에 높은 비트폭(4-6비트)을 배정.
            엣지와 <span className="font-semibold">정반대의 최적 정책</span>이 나타남 — FLOPs만 보는 하드웨어-무관 접근은 이를 포착 불가.
          </p>
        )}
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────── */

export default function HAQStudyFull() {
  const [col, setCol] = useState<Record<string, boolean>>({});
  const toggle = useCallback((id: string) => setCol(c => ({ ...c, [id]: !c[id] })), []);

  return (
    <GlossaryText>
    <div className="space-y-6">

      {/* ── Overview ─────────────────────────────────────────── */}
      <section id="haq-overview" className="scroll-mt-20">
        <div className="overflow-hidden rounded-xl shadow-sm">
          <div className="bg-gradient-to-br from-amber-700 via-orange-600 to-yellow-600 p-6 pb-8">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">CVPR 2019</span>
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">arXiv 1811.08886</span>
              <span className="rounded-full bg-yellow-300/90 px-3 py-1 text-xs font-bold text-yellow-900">하드웨어 인식 혼합 정밀도</span>
            </div>
            <h2 className="text-xl font-bold leading-snug text-white sm:text-2xl">
              HAQ: Hardware-Aware Automated Quantization with Mixed Precision
            </h2>
            <p className="mt-3 text-sm text-amber-200">
              Wang et al. (MIT / MIT-IBM Watson AI Lab) · CVPR 2019
            </p>
          </div>
          <div className="bg-white p-6 dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
            <p className="leading-relaxed text-gray-700 dark:text-gray-300">
              강화학습(DDPG)으로 각 레이어별 비트폭을 자동 탐색하는 혼합 정밀도 양자화 프레임워크.
              핵심 통찰: <span className="font-semibold text-amber-700 dark:text-amber-300">FLOPs는 하드웨어 지연의 불충분한 대리 지표</span>이며,
              실제 하드웨어 시뮬레이터(BISMO, BitFusion)의 피드백을 강화학습 보상 신호로 직접 사용해야
              진정한 하드웨어 효율을 달성할 수 있습니다.
            </p>
            <p className="mt-3 leading-relaxed text-gray-700 dark:text-gray-300">
              특히 <span className="font-semibold text-amber-700 dark:text-amber-300">루프라인 모델 분석</span>으로,
              DW-Conv(메모리 바운드)와 일반 Conv(연산 바운드)에 최적 비트폭이 다름을 체계적으로 보임.
              MobileNetV1에서 8비트 균일 양자화 대비 지연 1.4~1.95배, 에너지 1.87배 절감 달성.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {['DDPG 강화학습', '혼합 정밀도', '루프라인 모델', '하드웨어 시뮬레이터', 'BISMO/BitFusion', 'MobileNetV1'].map(tag => (
                <span key={tag} className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Background ────────────────────────────────────────── */}
      <section id="haq-background" className="scroll-mt-20">
        <SectionHeading icon={<BrainCircuit className="h-5 w-5" />} title="배경: FLOPs는 왜 불충분한가?" collapsed={!!col['haq-background']} onToggle={() => toggle('haq-background')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['haq-background'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="1.1" title="FLOPs vs. 실제 하드웨어 지연" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              기존 양자화 연구의 대부분은 비트폭 감소가 FLOPs에 비례해 성능을 향상시킨다고 가정합니다.
              그러나 실제 하드웨어에서는 두 가지 근본적인 병목이 존재합니다:
            </p>
            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-900/10">
                <p className="mb-1 text-xs font-bold text-red-700 dark:text-red-300">메모리 바운드 (Memory-Bound)</p>
                <p className="text-xs text-red-600 dark:text-red-400">
                  연산량 &lt;&lt; 메모리 접근 비용<br/>
                  예: DW-Conv (파라미터 적음)<br/>
                  → 비트폭 ↓ = 대역폭 ↓ = 지연 직접 감소<br/>
                  → FLOPs 감소보다 대역폭 감소가 핵심
                </p>
              </div>
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/40 dark:bg-blue-900/10">
                <p className="mb-1 text-xs font-bold text-blue-700 dark:text-blue-300">연산 바운드 (Compute-Bound)</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  연산량 &gt;&gt; 메모리 접근 비용<br/>
                  예: PW-Conv, 첫 번째 Conv<br/>
                  → 비트폭 ↓ = 연산 처리량 ↑ = 지연 감소<br/>
                  → FLOPs 감소가 지연과 더 연관됨
                </p>
              </div>
            </div>

            <SubSectionHeading number="1.2" title="루프라인 모델 (Roofline Model)" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              루프라인 모델은 하드웨어의 최대 메모리 대역폭(BW)과 최대 연산 처리량(FLOP/s)을 두 지붕선으로 나타냅니다.
              레이어의 연산 집약도(Arithmetic Intensity) = FLOPs / Bytes가 Ridge Point보다 낮으면 메모리 바운드, 높으면 연산 바운드:
            </p>
            <div className="mb-4 rounded-lg bg-amber-50 px-4 py-3 dark:bg-amber-900/20">
              <div className="overflow-x-auto">
                <EquationRenderer latex={String.raw`\text{Achievable FLOP/s} = \min\!\left(\text{Peak FLOP/s},\; \text{BW} \times \frac{\text{FLOPs}}{\text{Bytes}}\right)`} />
              </div>
            </div>
            <p className="mb-5 text-sm text-gray-600 dark:text-gray-400">
              비트폭 b를 낮추면 Bytes가 줄어 Arithmetic Intensity가 올라가고,
              메모리 바운드 레이어는 루프라인 곡선을 따라 성능이 향상됩니다.
              반면 이미 연산 바운드 레이어는 비트폭 절감의 이득이 포화됩니다.
            </p>

            <SubSectionHeading number="1.3" title="FLOPs 기반 vs. 하드웨어 인식 결과 비교" />
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">방법</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">DW-Conv 비트</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">PW-Conv 비트</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">실제 지연 감소</th>
                    <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">비고</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { m: '균일 8비트', dw: '8', pw: '8', lat: '1.0× (기준)', note: 'FLOPs 최소지만 하드웨어 비효율' },
                    { m: 'FLOPs 기반 혼합', dw: '4', pw: '4', lat: '1.2×', note: 'DW/PW 구분 없이 균일 감소' },
                    { m: 'HAQ (엣지)', dw: '2-3', pw: '4-6', lat: '1.95×', note: '루프라인 인식, DW 우선 감소' },
                    { m: 'HAQ (클라우드)', dw: '4-6', pw: '3-4', lat: '1.4×', note: '하드웨어별 최적화 정책 상이' },
                  ].map((r, i) => (
                    <tr key={i} className={i >= 2 ? 'bg-amber-50 dark:bg-amber-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}>
                      <td className={`px-3 py-2 font-medium ${i >= 2 ? 'text-amber-700 dark:text-amber-300' : 'text-gray-700 dark:text-gray-300'}`}>{r.m}</td>
                      <td className="px-3 py-2 text-center font-mono text-gray-600 dark:text-gray-400">{r.dw}</td>
                      <td className="px-3 py-2 text-center font-mono text-gray-600 dark:text-gray-400">{r.pw}</td>
                      <td className={`px-3 py-2 text-center font-mono font-semibold ${i >= 2 ? 'text-amber-700 dark:text-amber-300' : 'text-gray-600 dark:text-gray-400'}`}>{r.lat}</td>
                      <td className="px-3 py-2 text-gray-500 dark:text-gray-400">{r.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </section>

      {/* ── RL Agent ─────────────────────────────────────────── */}
      <section id="haq-rl-agent" className="scroll-mt-20">
        <SectionHeading icon={<GraduationCap className="h-5 w-5" />} title="강화학습 에이전트 (DDPG)" collapsed={!!col['haq-rl-agent']} onToggle={() => toggle('haq-rl-agent')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['haq-rl-agent'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="2.1" title="왜 DDPG인가? (이산 vs. 연속 행동 공간)" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              레이어별 비트폭 탐색은 이산 조합 최적화 문제입니다(예: 12레이어 × {'{'}2,3,4,5,6,7,8{'}'} = 7¹² ≈ 13억 가지).
              DQN 등 이산 RL은 이 규모에서 탐색 비용이 폭증합니다.
              HAQ는 <span className="font-semibold text-amber-700 dark:text-amber-300">DDPG(Deep Deterministic Policy Gradient)</span>를 사용해
              연속 행동 공간 [0, 1]에서 탐색하고, 이후 이산 비트폭으로 매핑합니다.
            </p>
            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { title: 'Actor 네트워크', desc: '상태 o_k → 연속 행동 a_k ∈ [0,1]. 결정론적 정책 μ(o_k|θ^μ). FCNN 3층 구조.', color: 'amber' },
                { title: 'Critic 네트워크', desc: '(상태, 행동) 쌍 → Q값 추정 Q(o_k, a_k|θ^Q). TD 학습으로 갱신.', color: 'orange' },
                { title: '경험 리플레이', desc: '(o, a, r, o_next) 튜플을 버퍼에 저장. 미니배치 샘플링으로 상관 제거.', color: 'yellow' },
              ].map(({ title, desc, color }) => (
                <div key={title} className={`rounded-lg border border-${color}-200 bg-${color}-50 p-3 dark:border-${color}-800 dark:bg-${color}-900/20`}>
                  <p className={`mb-1 text-xs font-bold text-${color}-700 dark:text-${color}-300`}>{title}</p>
                  <p className={`text-xs text-${color}-600 dark:text-${color}-400`}>{desc}</p>
                </div>
              ))}
            </div>

            <SubSectionHeading number="2.2" title="상태 공간 (10차원 관측 벡터)" />
            <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
              에이전트는 k번째 레이어를 양자화할 때 다음 10차원 벡터를 관측합니다:
            </p>
            <div className="mb-5 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-amber-50 dark:bg-amber-900/20">
                    <th className="px-3 py-2 text-left font-bold text-amber-700 dark:text-amber-300">차원</th>
                    <th className="px-3 py-2 text-left font-bold text-amber-700 dark:text-amber-300">특징</th>
                    <th className="px-3 py-2 text-left font-bold text-amber-700 dark:text-amber-300">의미</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { dim: 'o₁', feat: 'layer_index', mean: '레이어 순번 (정규화)' },
                    { dim: 'o₂', feat: 'c_in', mean: '입력 채널 수' },
                    { dim: 'o₃', feat: 'c_out', mean: '출력 채널 수' },
                    { dim: 'o₄', feat: 'kernel_size', mean: '커널 크기 (예: 3, 1)' },
                    { dim: 'o₅', feat: 'stride', mean: '스트라이드' },
                    { dim: 'o₆', feat: 'feature_map_size', mean: '특징맵 공간 해상도' },
                    { dim: 'o₇', feat: 'num_params', mean: '레이어 파라미터 수 (정규화)' },
                    { dim: 'o₈', feat: 'is_depthwise', mean: 'DW-Conv 여부 (0 or 1)' },
                    { dim: 'o₉', feat: 'is_weight_or_act', mean: '가중치 양자화 vs. 활성화 양자화 (0 or 1)' },
                    { dim: 'o₁₀', feat: 'prev_action', mean: '직전 레이어에 할당된 비트폭 행동 a_{k-1}' },
                  ].map(({ dim, feat, mean }) => (
                    <tr key={dim} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-3 py-2 font-mono font-semibold text-amber-600 dark:text-amber-400">{dim}</td>
                      <td className="px-3 py-2 font-mono text-gray-700 dark:text-gray-300">{feat}</td>
                      <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{mean}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <SubSectionHeading number="2.3" title="행동 공간 및 보상 함수" />
            <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
              Actor가 출력하는 연속 행동 a_k ∈ [0, 1]은 다음 식으로 이산 비트폭 b_k로 변환됩니다:
            </p>
            <div className="mb-4 overflow-x-auto rounded-lg bg-amber-50 p-3 dark:bg-amber-900/20">
              <EquationRenderer latex={String.raw`b_k = \mathrm{round}\!\left(b_{\min} - 0.5 + a_k \cdot (b_{\max} - b_{\min} + 1)\right)`} />
            </div>
            <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
              예: b_min = 2, b_max = 8이면 a_k = 0 → b_k = 2, a_k = 1 → b_k = 8.
            </p>
            <div className="mb-4 rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-900/20">
              <p className="mb-2 text-xs font-bold text-orange-700 dark:text-orange-300">보상 함수 설계</p>
              <p className="mb-2 text-xs text-orange-600 dark:text-orange-400">
                에이전트가 전체 레이어의 비트폭을 순차 결정한 후, 에피소드 종료 시 한 번 보상이 주어집니다.
                하드웨어 제약(예산)을 만족하는 경우에만 정확도 보상이 부여됩니다:
              </p>
              <div className="overflow-x-auto">
                <EquationRenderer latex={String.raw`\mathcal{R} = \begin{cases} \lambda \cdot (\mathrm{acc}_{\mathrm{quant}} - \mathrm{acc}_{\mathrm{origin}}) & \text{if } C(\mathbf{b}) \leq C_{\max} \\ -1 & \text{otherwise} \end{cases}`} />
              </div>
              <p className="mt-2 text-xs text-orange-600 dark:text-orange-400">
                C(b): 비트폭 벡터 b에 대한 하드웨어 시뮬레이터 측정값 (지연/에너지/모델 크기 등).
                C_max: 목표 하드웨어 예산. λ: 보상 스케일링 계수.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Visualization ────────────────────────────────────── */}
      <section id="haq-viz" className="scroll-mt-20">
        <SectionHeading icon={<BarChart2 className="h-5 w-5" />} title="혼합 정밀도 정책 시각화 (엣지 vs. 클라우드)" collapsed={!!col['haq-viz']} onToggle={() => toggle('haq-viz')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['haq-viz'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <p className="mb-4 text-sm text-gray-700 dark:text-gray-300">
              동일한 MobileNetV1 모델에 HAQ를 적용해도 타겟 하드웨어에 따라 최적 비트폭 정책이 <span className="font-semibold text-amber-700 dark:text-amber-300">정반대</span>로 달라집니다.
              아래 차트에서 두 탭을 전환하며 엣지(Zynq-7020)와 클라우드(VU9P) 정책을 비교해 보세요:
            </p>
            <HAQPolicyViz />
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-900/20">
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">핵심 관찰</p>
              <p className="mt-1 text-xs leading-relaxed text-amber-600 dark:text-amber-400">
                엣지에서 DW-Conv 레이어는 2-3비트를 받지만, 클라우드에서는 4-6비트를 받습니다.
                이 차이는 FLOPs 기반 분석으로는 절대 탐지할 수 없습니다.
                HAQ의 강화학습 에이전트는 is_depthwise 특징(o₈)을 활용하여
                하드웨어 시뮬레이터 피드백으로부터 이 패턴을 자동 학습합니다.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Hardware ─────────────────────────────────────────── */}
      <section id="haq-hardware" className="scroll-mt-20">
        <SectionHeading icon={<Cpu className="h-5 w-5" />} title="하드웨어 시뮬레이터 피드백" collapsed={!!col['haq-hardware']} onToggle={() => toggle('haq-hardware')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['haq-hardware'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="4.1" title="지원 하드웨어 플랫폼" />
            <p className="mb-4 text-sm text-gray-700 dark:text-gray-300">
              HAQ는 세 가지 하드웨어 시뮬레이터를 강화학습 보상 계산에 통합합니다.
              각 시뮬레이터는 비트폭 벡터 b가 주어지면 지연/에너지를 반환합니다:
            </p>
            <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                {
                  name: 'BISMO (엣지)',
                  sub: 'Zynq-7020 FPGA',
                  color: 'amber',
                  points: [
                    '소형 FPGA, 제한된 DSP/BRAM',
                    '메모리 대역폭 병목이 지배적',
                    'DW-Conv: 메모리 바운드',
                    '비트폭 ↓ → 대역폭 ↓ → 지연 ↓',
                  ],
                },
                {
                  name: 'BISMO (클라우드)',
                  sub: 'Virtex UltraScale+ VU9P',
                  color: 'blue',
                  points: [
                    '대형 데이터센터 FPGA',
                    '연산 자원 풍부, 대역폭도 넓음',
                    'DW-Conv도 연산 바운드 가능',
                    '정책이 엣지와 반대로 나타남',
                  ],
                },
                {
                  name: 'BitFusion',
                  sub: '공간 아키텍처 가속기',
                  color: 'purple',
                  points: [
                    '비트 직렬 곱셈기 배열 구조',
                    '비트폭 b₁×b₂에 정확히 비례하는 에너지',
                    '에너지 1.87×, 면적 1.90× 절감',
                    '비트폭 감소 이득이 가장 직접적',
                  ],
                },
              ].map(({ name, sub, color, points }) => (
                <div key={name} className={`rounded-lg border border-${color}-200 bg-${color}-50 p-4 dark:border-${color}-800 dark:bg-${color}-900/20`}>
                  <p className={`text-sm font-bold text-${color}-700 dark:text-${color}-300`}>{name}</p>
                  <p className={`mb-2 text-xs text-${color}-500 dark:text-${color}-400`}>{sub}</p>
                  <ul className="space-y-1">
                    {points.map(p => (
                      <li key={p} className={`flex items-start gap-1.5 text-xs text-${color}-600 dark:text-${color}-400`}>
                        <span className="mt-0.5 flex-shrink-0">•</span>{p}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <SubSectionHeading number="4.2" title="핵심 인사이트: 하드웨어별 최적 정책의 상이" />
            <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-900/20">
              <p className="mb-2 text-xs font-bold text-orange-700 dark:text-orange-300">왜 하드웨어마다 최적 정책이 다른가?</p>
              <div className="space-y-2 text-xs text-orange-600 dark:text-orange-400">
                <p>
                  <span className="font-semibold">엣지 FPGA:</span> DRAM 대역폭이 병목. DW-Conv는 파라미터 수가 적어(3×3 커널 × 채널 vs. 1×1×c_in×c_out)
                  이미 연산이 빠르지만 가중치 로드가 느림 → 비트폭 ↓로 로드할 데이터 감소 → 직접적 지연 감소.
                </p>
                <p>
                  <span className="font-semibold">클라우드 FPGA:</span> 대역폭이 충분하여 DW-Conv도 연산 유닛이 포화됨.
                  DW-Conv 비트폭을 낮춰도 연산 유닛 활용률이 제한 요인이 아니라 지연 개선이 작음.
                  오히려 정확도 손실만 증가 → 높은 비트폭 유지가 유리.
                </p>
                <p>
                  <span className="font-semibold">일반화:</span> 이는 단일 고정 비트 할당 정책이 모든 하드웨어에 최적일 수 없음을 의미.
                  하드웨어 시뮬레이터를 보상 함수에 직접 통합하는 HAQ의 접근이 필수적.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Key Equations ─────────────────────────────────────── */}
      <section id="haq-equations" className="scroll-mt-20">
        <SectionHeading icon={<Hash className="h-5 w-5" />} title="핵심 수식 모음" collapsed={!!col['haq-equations']} onToggle={() => toggle('haq-equations')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['haq-equations'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="space-y-3">
              <EqCard idx={1} name="행동-비트폭 매핑" color="amber"
                latex={String.raw`b_k = \mathrm{round}\!\left(b_{\min} - 0.5 + a_k \cdot (b_{\max} - b_{\min} + 1)\right)`}
                description="Actor가 출력하는 연속 행동 a_k ∈ [0,1]을 이산 비트폭 b_k ∈ {b_min, ..., b_max}로 변환. b_min=2, b_max=8 설정 시 a_k=0 → 2비트, a_k=1 → 8비트. round()가 연속 → 이산 브릿지 역할. Straight-Through Estimator로 역전파 가능." />

              <EqCard idx={2} name="보상 함수" color="orange"
                latex={String.raw`\mathcal{R} = \lambda \cdot \left(\mathrm{acc}_{\mathrm{quant}} - \mathrm{acc}_{\mathrm{origin}}\right) \cdot \mathbf{1}[C(\mathbf{b}) \leq C_{\max}]`}
                description="하드웨어 제약 C(b) ≤ C_max를 만족하는 경우에만 양자화 정확도 손실(acc_quant - acc_origin)에 λ를 곱한 보상 지급. 제약 위반 시 -1. λ는 정확도 단위를 보상 스케일로 변환하는 계수. 단말 보상(terminal reward) 방식으로 에피소드 종료 시 1회 제공." />

              <EqCard idx={3} name="DDPG Critic 업데이트 (TD 타겟)" color="indigo"
                latex={String.raw`\hat{Q}_k = \mathcal{R}_k \cdot \mathbf{1}[\text{done}] + \gamma \cdot Q(o_{k+1},\, \mu(o_{k+1}|\theta^{\mu'})|\theta^{Q'})`}
                description="Bellman 방정식 기반 TD 타겟. done=True(마지막 레이어)이면 보상만, 아니면 타겟 네트워크(θ^Q', θ^μ')로 추정한 다음 Q값을 γ로 할인하여 합산. γ(할인율)은 미래 보상의 현재 가치 가중치. 타겟 네트워크는 소프트 업데이트: θ' ← τθ + (1-τ)θ'." />

              <EqCard idx={4} name="KL 클리핑 (최적 클리핑 범위)" color="green"
                latex={String.raw`c^* = \mathop{\arg\min}_{c}\; D_{\mathrm{KL}}\!\left(W_k \;\Big\|\; \mathrm{quantize}(W_k,\, a_k,\, c)\right)`}
                description="레이어별 최적 클리핑 범위 c를 KL 발산 최소화로 결정. quantize(W, a, c)는 [-c, c] 범위를 2^{a_k}개 구간으로 균일 분할. KL 최소화가 단순 MSE 최소화보다 분포의 꼬리 부분을 더 잘 처리. 실제로 비트폭이 낮을수록 최적 c가 작아져 아웃라이어를 잘라냄." />

              <EqCard idx={5} name="선형 양자화 스케일 팩터" color="amber"
                latex={String.raw`s = \frac{c}{2^{a_k - 1} - 1}, \quad \hat{w} = s \cdot \mathrm{round}\!\left(\frac{w}{s}\right)`}
                description="클리핑 범위 c와 비트폭 a_k로부터 양자화 스텝 크기 s를 계산. 2^{a_k-1}-1은 부호 있는 정수의 최대값(예: 8비트 → 127). w를 s로 나누고 반올림하여 정수 격자에 투영한 뒤 s를 다시 곱해 역양자화. HAQ는 레이어별로 이 s를 최적 c로부터 자동 결정." />
            </div>
          </Card>
        </div>
      </section>

      {/* ── Results ───────────────────────────────────────────── */}
      <section id="haq-results" className="scroll-mt-20">
        <SectionHeading icon={<Layers className="h-5 w-5" />} title="실험 결과" collapsed={!!col['haq-results']} onToggle={() => toggle('haq-results')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['haq-results'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="6.1" title="MobileNetV1 — 지연 및 에너지 절감" />
            <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
              8비트 균일 양자화를 기준(1.0×)으로 HAQ 혼합 정밀도의 하드웨어 지표 개선 (ImageNet Top-1 정확도 유지):
            </p>
            <div className="mb-5 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">방법</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">하드웨어</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">Top-1 Acc.</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">지연 감소</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">에너지 감소</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { m: '8비트 균일 (기준)',       hw: '—',          acc: '70.9%', lat: '1.0×',    eng: '1.0×',    hi: false },
                    { m: '4비트 균일',               hw: '—',          acc: '70.1%', lat: '~1.4×',   eng: '~1.6×',   hi: false },
                    { m: 'HAQ ★',                   hw: 'BISMO 엣지', acc: '70.5%', lat: '1.95×',   eng: '—',       hi: true  },
                    { m: 'HAQ ★',                   hw: 'BISMO 클라', acc: '70.4%', lat: '1.40×',   eng: '—',       hi: true  },
                    { m: 'HAQ ★',                   hw: 'BitFusion',  acc: '70.6%', lat: '—',        eng: '1.87×',   hi: true  },
                    { m: 'HNAS (FLOPs 기반)',        hw: '—',          acc: '70.2%', lat: '1.35×',   eng: '1.50×',   hi: false },
                  ].map((r, i) => (
                    <tr key={i} className={r.hi ? 'bg-amber-50 dark:bg-amber-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}>
                      <td className={`px-3 py-2 font-medium ${r.hi ? 'text-amber-700 dark:text-amber-300' : 'text-gray-700 dark:text-gray-300'}`}>{r.m}</td>
                      <td className="px-3 py-2 text-center text-gray-500 dark:text-gray-400">{r.hw}</td>
                      <td className="px-3 py-2 text-center font-mono text-gray-600 dark:text-gray-400">{r.acc}</td>
                      <td className={`px-3 py-2 text-center font-mono font-semibold ${r.hi ? 'text-amber-700 dark:text-amber-300' : 'text-gray-600 dark:text-gray-400'}`}>{r.lat}</td>
                      <td className={`px-3 py-2 text-center font-mono font-semibold ${r.hi ? 'text-amber-700 dark:text-amber-300' : 'text-gray-600 dark:text-gray-400'}`}>{r.eng}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <SubSectionHeading number="6.2" title="타 자동 양자화 방법과 비교" />
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">방법</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">탐색 방식</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">하드웨어 인식</th>
                    <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">한계</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { m: 'HAQ', search: 'DDPG (연속 RL)', hw: '직접 시뮬레이터', lim: '시뮬레이터 의존 (하드웨어별 재탐색 필요)' },
                    { m: 'AutoQ', search: 'Hierarchical RL', hw: 'FLOPs 기반', lim: '실제 하드웨어 이질성 미반영' },
                    { m: 'ENAS 기반 탐색', search: 'NAS + 양자화', hw: 'FLOP 제약', lim: '탐색 비용 매우 높음' },
                    { m: 'EBS (수동)', search: '전문가 휴리스틱', hw: '부분적 인식', lim: '확장성 없음, 레이어별 최적화 불가' },
                  ].map((r, i) => (
                    <tr key={i} className={i === 0 ? 'bg-amber-50 dark:bg-amber-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}>
                      <td className={`px-3 py-2 font-medium ${i === 0 ? 'text-amber-700 dark:text-amber-300' : 'text-gray-700 dark:text-gray-300'}`}>{r.m}</td>
                      <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">{r.search}</td>
                      <td className={`px-3 py-2 text-center font-semibold ${i === 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>{r.hw}</td>
                      <td className="px-3 py-2 text-gray-500 dark:text-gray-400">{r.lim}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-900/20">
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">핵심 관찰 ①</p>
                <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                  동일한 평균 비트폭(~4비트)에서도 하드웨어 인식 혼합 정밀도가 균일 양자화보다 지연을 최대 40% 추가 절감.
                  이는 레이어별 하드웨어 특성 차이 활용의 직접적 효과.
                </p>
              </div>
              <div className="rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 dark:border-orange-800 dark:bg-orange-900/20">
                <p className="text-xs font-semibold text-orange-700 dark:text-orange-300">핵심 관찰 ②</p>
                <p className="mt-1 text-xs text-orange-600 dark:text-orange-400">
                  BitFusion에서 에너지 1.87× 절감은 비트 직렬 구조 덕분에 비트폭에 정확히 비례하는 에너지 감소가 가능하기 때문.
                  하드웨어 아키텍처가 양자화 이득을 결정함을 다시 확인.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Quiz ─────────────────────────────────────────────── */}
      <section id="haq-quiz" className="scroll-mt-20">
        <SectionHeading icon={<FlaskConical className="h-5 w-5" />} title="자기 점검 (연구자 수준)" />
        <Card>
          <QuizSection color="amber" questions={[
            {
              q: 'FLOPs가 하드웨어 지연의 충분한 대리 지표가 아닌 이유를, DW-Conv를 예로 들어 루프라인 모델 관점에서 설명하라.',
              a: 'FLOPs는 연산량만 측정하고 메모리 접근 패턴을 무시합니다. 루프라인 모델에서 DW-Conv는 파라미터 수가 적어(3×3×c 대신 9×c) 연산 집약도(FLOPs/Bytes)가 낮습니다. 즉 메모리 바운드 영역에 위치합니다. 이 경우 FLOPs를 절반으로 줄여도 메모리 대역폭이 병목이므로 지연은 절반이 되지 않습니다. 반면 비트폭을 낮추면 Bytes가 직접 줄어 대역폭 병목이 완화됩니다. 엣지 FPGA에서 DW-Conv에 2비트를 할당하는 HAQ 정책이 FLOPs 기반 방법보다 실제로 훨씬 더 빠른 이유입니다.',
            },
            {
              q: 'HAQ가 DQN 등 이산 RL 대신 DDPG(연속 행동)를 선택한 이유는? 연속 → 이산 변환 과정에서 발생하는 문제와 해결책은?',
              a: '이산 조합 탐색 공간이 7^12 ≈ 13억으로 DQN의 Q-테이블이나 이산 행동 공간 탐색이 비현실적입니다. DDPG는 연속 공간 [0,1]에서 정책을 학습하므로 일반화가 용이하고 탐색 효율이 높습니다. 문제: 연속 → 이산 매핑(round 함수)이 미분 불가능하여 역전파가 끊깁니다. 해결: Critic은 TD 오차로 업데이트되고(미분 불필요), Actor는 Critic의 Q 기울기를 연속 행동 공간에서 역전파하므로 round 함수의 미분 불가능성이 Actor 학습에 직접 영향을 미치지 않습니다. 실제로 a_k ∈ [0,1]에서의 부드러운 Q 기울기로 Actor를 업데이트합니다.',
            },
            {
              q: '동일한 MobileNetV1 모델에 HAQ를 적용했을 때, 엣지(Zynq-7020)와 클라우드(VU9P)에서 최적 비트폭 정책이 정반대로 나타나는 근본 원인은?',
              a: '엣지 FPGA(Zynq-7020)는 DSP와 BRAM이 제한되어 메모리 대역폭이 병목입니다. DW-Conv는 메모리 바운드이므로 비트폭을 2-3비트로 낮추면 대역폭 절감 효과가 직접적입니다. 반면 클라우드 FPGA(VU9P)는 연산 자원과 대역폭 모두 넉넉하여 DW-Conv도 연산 유닛을 충분히 활용합니다. 이 경우 DW-Conv 비트폭을 낮춰도 지연 개선이 미미하고 정확도 손실만 커집니다. 따라서 하드웨어의 루프라인 Ridge Point 위치가 레이어별 최적 비트폭을 결정하며, 이것이 하드웨어마다 정책이 달라지는 근본 원인입니다.',
            },
            {
              q: '10차원 상태 벡터에서 prev_action(o₁₀)을 포함하는 이유는 무엇이며, is_depthwise(o₈)는 에이전트 학습에 어떤 역할을 하는가?',
              a: 'prev_action(o₁₀) 포함 이유: 각 레이어의 최적 비트폭이 인접 레이어의 비트폭에 의존합니다(정확도 관점: 인접 레이어 오차의 보상 효과). 또한 연속 에피소드에서 에이전트가 "지금까지 얼마나 예산을 소비했는가"를 추론하도록 돕습니다. Markovian 가정이 완전히 성립하도록 시퀀셜 컨텍스트를 제공. is_depthwise(o₈) 역할: 에이전트가 하드웨어 시뮬레이터 보상으로부터 "DW-Conv(is_dw=1) + 엣지 하드웨어 → 낮은 비트 = 높은 보상"이라는 규칙을 학습하게 합니다. 이 특징 없이는 에이전트가 레이어 구조와 하드웨어 이득의 연결 고리를 찾기 어렵습니다.',
            },
          ]} />
        </Card>
      </section>

    </div>
    </GlossaryText>
  );
}
