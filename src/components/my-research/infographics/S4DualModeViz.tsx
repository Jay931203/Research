'use client';

import { useMemo, useState } from 'react';
import katex from 'katex';

function InlineMath({ latex }: { latex: string }) {
  const html = useMemo(() => {
    try { return katex.renderToString(latex, { throwOnError: false, displayMode: false }); }
    catch { return latex; }
  }, [latex]);
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

function BlockMath({ latex }: { latex: string }) {
  const html = useMemo(() => {
    try { return katex.renderToString(latex, { throwOnError: false, displayMode: true }); }
    catch { return latex; }
  }, [latex]);
  return <div className="overflow-x-auto py-1" dangerouslySetInnerHTML={{ __html: html }} />;
}

type ViewMode = 'continuous' | 'recurrence' | 'convolution';

interface ViewInfo {
  label: string;
  shortLabel: string;
  color: string;
  bgColor: string;
  borderColor: string;
  badgeColor: string;
  equation: string;
  useCase: string;
  complexity: string;
}

const VIEWS: Record<ViewMode, ViewInfo> = {
  continuous: {
    label: '연속 시간 ODE',
    shortLabel: 'ODE',
    color: '#8b5cf6',
    bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    borderColor: 'border-purple-300 dark:border-purple-700',
    badgeColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    equation: String.raw`x'(t) = \mathbf{A}\,x(t) + \mathbf{B}\,u(t), \quad y(t) = \mathbf{C}\,x(t)`,
    useCase: '이론적 기반. 연속 시간 동역학 시스템으로 정의.',
    complexity: 'N/A (연속)',
  },
  recurrence: {
    label: '이산 순환 (추론)',
    shortLabel: '순환',
    color: '#059669',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
    borderColor: 'border-emerald-300 dark:border-emerald-700',
    badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    equation: String.raw`x_k = \bar{\mathbf{A}}\,x_{k-1} + \bar{\mathbf{B}}\,u_k, \quad y_k = \bar{\mathbf{C}}\,x_k`,
    useCase: '자기회귀 생성. 스텝당 O(N) — Transformer 대비 60배 빠른 추론.',
    complexity: 'O(N) / step',
  },
  convolution: {
    label: '전역 합성곱 (학습)',
    shortLabel: '합성곱',
    color: '#2563eb',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    borderColor: 'border-blue-300 dark:border-blue-700',
    badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    equation: String.raw`y = \bar{\mathbf{K}} \ast u, \quad \bar{\mathbf{K}} = (\bar{\mathbf{C}}\bar{\mathbf{B}},\; \bar{\mathbf{C}}\bar{\mathbf{A}}\bar{\mathbf{B}},\; \ldots,\; \bar{\mathbf{C}}\bar{\mathbf{A}}^{L-1}\bar{\mathbf{B}})`,
    useCase: 'FFT 기반 병렬 학습. O(L log L) — CNN처럼 전체 시퀀스를 한번에.',
    complexity: 'O(L log L)',
  },
};

const VIEW_KEYS: ViewMode[] = ['continuous', 'recurrence', 'convolution'];

/* SSM Kernel visualization */
const W = 480, H = 150, PAD_L = 40, PAD_R = 20, PAD_T = 10, PAD_B = 30;
const CW = W - PAD_L - PAD_R;
const CH = H - PAD_T - PAD_B;
const L_STEPS = 64;

function KernelChart({ delta, eigenval }: { delta: number; eigenval: number }) {
  const kernel = useMemo(() => {
    const aBar = Math.exp(delta * eigenval);
    const bBar = delta;
    const cVal = 1.0;
    return Array.from({ length: L_STEPS }, (_, i) => ({
      k: i,
      val: cVal * Math.pow(aBar, i) * bBar,
    }));
  }, [delta, eigenval]);

  const maxVal = Math.max(...kernel.map((p) => Math.abs(p.val)), 0.001);
  const barW = CW / L_STEPS;
  const vx = (k: number) => PAD_L + k * barW;
  const vy = (v: number) => PAD_T + CH / 2 - (v / (maxVal * 1.2)) * (CH / 2);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} className="block">
      <rect x={0} y={0} width={W} height={H} className="fill-gray-50 dark:fill-gray-800" rx={8} />
      {/* Zero line */}
      <line x1={PAD_L} y1={vy(0)} x2={W - PAD_R} y2={vy(0)} stroke="#9ca3af" strokeWidth={0.8} />
      {/* Bars */}
      {kernel.map(({ k, val }) => {
        const y = vy(val);
        const y0 = vy(0);
        const h = Math.abs(y - y0);
        return (
          <rect key={k} x={vx(k) + 0.5} y={Math.min(y, y0)} width={Math.max(barW - 1, 1)} height={h}
            fill={val >= 0 ? '#2563eb' : '#ef4444'} opacity={0.7} rx={1} />
        );
      })}
      {/* Envelope curve */}
      {(() => {
        const pts = kernel.map(({ k, val }) => `${vx(k) + barW / 2},${vy(val)}`).join(' ');
        return <polyline points={pts} fill="none" stroke="#6366f1" strokeWidth={1.5} opacity={0.6} />;
      })()}
      {/* Labels */}
      <text x={PAD_L - 4} y={vy(maxVal) + 3} textAnchor="end" fontSize={9} className="fill-gray-400">
        {maxVal.toFixed(2)}
      </text>
      <text x={vx(0)} y={H - 5} textAnchor="middle" fontSize={9} className="fill-gray-400">0</text>
      <text x={vx(L_STEPS - 1)} y={H - 5} textAnchor="middle" fontSize={9} className="fill-gray-400">{L_STEPS - 1}</text>
      <text x={W - PAD_R + 2} y={vy(0) + 3} fontSize={9} className="fill-gray-400">k</text>
      <text x={PAD_L + 5} y={PAD_T + 3} fontSize={9} className="fill-gray-400">K̄[k]</text>
    </svg>
  );
}

/* Step-by-step recurrence animation */
function RecurrenceSteps() {
  const [step, setStep] = useState(0);
  const N = 5;
  const steps = [
    { label: 'k=0', desc: '입력 u₀ 도착 → 상태 x₀ = B̄·u₀', highlight: 0 },
    { label: 'k=1', desc: 'x₁ = Ā·x₀ + B̄·u₁ → 상태 회전 + 새 입력', highlight: 1 },
    { label: 'k=2', desc: 'x₂ = Ā·x₁ + B̄·u₂ → 과거 정보 압축 유지', highlight: 2 },
    { label: 'k=3', desc: 'x₃ = Ā·x₂ + B̄·u₃ → O(N) 연산으로 상수 시간', highlight: 3 },
    { label: 'k=4', desc: 'y₄ = C̄·x₄ → 최종 출력 생성', highlight: 4 },
  ];
  const cur = steps[step];

  return (
    <div className="mt-3 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 p-3">
      <div className="flex items-center gap-3 mb-2">
        <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">순환 모드 시뮬레이션</p>
        <div className="flex gap-1 ml-auto">
          {steps.map((s, i) => (
            <button key={i} onClick={() => setStep(i)}
              className={`w-6 h-6 rounded text-xs font-bold transition ${
                step === i ? 'bg-emerald-600 text-white' : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400'
              }`}>
              {i}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-1 items-end mb-2" style={{ height: 40 }}>
        {Array.from({ length: N }, (_, i) => (
          <div key={i} className="flex-1 flex flex-col items-center">
            <div className={`w-full rounded-t-sm transition-all duration-300 ${
              i <= cur.highlight ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'
            }`} style={{ height: i <= cur.highlight ? 28 : 12, opacity: i === cur.highlight ? 1 : i < cur.highlight ? 0.5 : 0.3 }} />
            <span className="text-xs text-gray-400 mt-0.5">u{i}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-emerald-700 dark:text-emerald-300">
        <span className="font-bold">{cur.label}:</span> {cur.desc}
      </p>
    </div>
  );
}

/* Convolution visualization */
function ConvolutionViz() {
  return (
    <div className="mt-3 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 p-3">
      <p className="text-xs font-bold text-blue-700 dark:text-blue-300 mb-2">합성곱 모드 흐름</p>
      <div className="flex items-center gap-2 text-xs">
        <div className="rounded-lg bg-blue-100 dark:bg-blue-900/40 px-3 py-2 text-center">
          <p className="font-bold text-blue-700 dark:text-blue-300">u</p>
          <p className="text-blue-500">입력</p>
        </div>
        <span className="text-blue-400">→</span>
        <div className="rounded-lg bg-blue-200 dark:bg-blue-800/60 px-3 py-2 text-center">
          <p className="font-bold text-blue-700 dark:text-blue-300">FFT</p>
          <p className="text-blue-500">O(L log L)</p>
        </div>
        <span className="text-blue-400">⊙</span>
        <div className="rounded-lg bg-indigo-200 dark:bg-indigo-800/60 px-3 py-2 text-center">
          <p className="font-bold text-indigo-700 dark:text-indigo-300">FFT(K̄)</p>
          <p className="text-indigo-500">커널</p>
        </div>
        <span className="text-blue-400">→</span>
        <div className="rounded-lg bg-blue-200 dark:bg-blue-800/60 px-3 py-2 text-center">
          <p className="font-bold text-blue-700 dark:text-blue-300">iFFT</p>
          <p className="text-blue-500">O(L log L)</p>
        </div>
        <span className="text-blue-400">→</span>
        <div className="rounded-lg bg-blue-100 dark:bg-blue-900/40 px-3 py-2 text-center">
          <p className="font-bold text-blue-700 dark:text-blue-300">y</p>
          <p className="text-blue-500">출력</p>
        </div>
      </div>
      <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
        전체 시퀀스를 <strong>한 번에 병렬 계산</strong> — CNN과 같은 학습 효율. GPU 친화적.
      </p>
    </div>
  );
}

export default function S4DualModeViz() {
  const [view, setView] = useState<ViewMode>('convolution');
  const [delta, setDelta] = useState(0.1);
  const [eigenval, setEigenval] = useState(-1.0);

  const info = VIEWS[view];

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-md space-y-6">
      {/* ── Section 1: Three Views ── */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
          S4의 세 가지 얼굴: 하나의 SSM, 세 가지 계산
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          동일한 파라미터 (A, B, C, Δ)가 세 가지 동치 표현을 가집니다.
          학습엔 합성곱, 추론엔 순환 — 두 세계의 장점을 모두 취합니다.
        </p>

        {/* View tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {VIEW_KEYS.map((key) => {
            const v = VIEWS[key];
            return (
              <button key={key} onClick={() => setView(key)}
                className={`rounded-lg px-3 py-1.5 text-sm font-bold transition ${
                  view === key
                    ? 'text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
                style={view === key ? { backgroundColor: v.color } : {}}>
                {v.shortLabel}
              </button>
            );
          })}
        </div>

        {/* Active view */}
        <div className={`rounded-xl border-2 overflow-hidden ${info.borderColor}`}>
          <div className={`${info.bgColor} px-4 py-2.5 flex items-center gap-2`}>
            <span className={`rounded-md px-2.5 py-0.5 text-xs font-black ${info.badgeColor}`}>
              {info.complexity}
            </span>
            <span className="text-sm font-bold text-gray-800 dark:text-gray-100">{info.label}</span>
          </div>
          <div className="px-4 py-3">
            <div className="mb-2"><BlockMath latex={info.equation} /></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{info.useCase}</p>
            {view === 'recurrence' && <RecurrenceSteps />}
            {view === 'convolution' && <ConvolutionViz />}
          </div>
        </div>

        {/* Mode comparison table */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20 p-3 text-center">
            <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300 mb-1">추론 모드 (순환)</p>
            <p className="text-2xl font-mono font-bold text-emerald-600">O(1)</p>
            <p className="text-xs text-emerald-500 mt-0.5">스텝당 상수 시간</p>
            <p className="text-xs text-emerald-400">Transformer 대비 <strong>60배</strong> 빠른 생성</p>
          </div>
          <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20 p-3 text-center">
            <p className="text-xs font-bold text-blue-700 dark:text-blue-300 mb-1">학습 모드 (합성곱)</p>
            <p className="text-2xl font-mono font-bold text-blue-600">O(L log L)</p>
            <p className="text-xs text-blue-500 mt-0.5">FFT 기반 병렬화</p>
            <p className="text-xs text-blue-400">CNN처럼 <strong>전체 시퀀스 한번에</strong></p>
          </div>
        </div>
      </div>

      {/* ── Section 2: Kernel Visualization ── */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-5">
        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1">
          SSM 커널 <InlineMath latex={String.raw`\bar{K}`} /> 시각화
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          합성곱 모드에서 사용되는 커널입니다.
          Δ를 줄이면 커널이 &ldquo;늘어나&rdquo; 고해상도 신호를 처리하고,
          키우면 &ldquo;압축&rdquo;되어 저해상도를 처리합니다 (해상도 적응).
        </p>

        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-3 text-sm">
            <label className="w-32 shrink-0 text-gray-600 dark:text-gray-300">
              스텝 사이즈 Δ = <span className="font-mono font-bold text-blue-600">{delta.toFixed(3)}</span>
            </label>
            <input type="range" min={0.01} max={0.5} step={0.005} value={delta}
              onChange={(e) => setDelta(Number(e.target.value))}
              className="flex-1 accent-blue-500" />
          </div>
          <div className="flex items-center gap-3 text-sm">
            <label className="w-32 shrink-0 text-gray-600 dark:text-gray-300">
              고유값 a = <span className="font-mono font-bold text-purple-600">{eigenval.toFixed(2)}</span>
            </label>
            <input type="range" min={-3.0} max={-0.1} step={0.05} value={eigenval}
              onChange={(e) => setEigenval(Number(e.target.value))}
              className="flex-1 accent-purple-500" />
          </div>
        </div>

        <KernelChart delta={delta} eigenval={eigenval} />

        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 px-2 py-2">
            <p className="text-blue-500 mb-0.5">이산화</p>
            <p className="font-mono font-bold text-blue-700 dark:text-blue-300">
              Ā = e<sup>Δa</sup> = {Math.exp(delta * eigenval).toFixed(4)}
            </p>
          </div>
          <div className="rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900 px-2 py-2">
            <p className="text-purple-500 mb-0.5">감쇠 반감기</p>
            <p className="font-mono font-bold text-purple-700 dark:text-purple-300">
              {(-Math.log(2) / (delta * eigenval)).toFixed(1)} steps
            </p>
          </div>
          <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 px-2 py-2">
            <p className="text-emerald-500 mb-0.5">유효 수용장</p>
            <p className="font-mono font-bold text-emerald-700 dark:text-emerald-300">
              ~{Math.round(-1 / (delta * eigenval) * 3)} tokens
            </p>
          </div>
        </div>
      </div>

      {/* Theory note */}
      <div className="rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-3">
        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
          <span className="font-semibold text-gray-800 dark:text-gray-200">S4의 핵심 혁신:</span>{' '}
          커널 <InlineMath latex={String.raw`\bar{K}`} /> 계산이 O(N²L)에서 Õ(N+L)로 환원됩니다.
          HiPPO 행렬의 NPLR 분해(A = VΛV* − PQ^T)와 Woodbury 항등식을 결합하면
          커널 생성 함수가 4개의 Cauchy 커널 곱으로 분해되어 효율적 계산이 가능해집니다.
          이 수학적 구조가 S4를 Path-X(시퀀스 16,384) 최초 해결 모델로 만든 핵심입니다.
        </p>
      </div>
    </div>
  );
}
