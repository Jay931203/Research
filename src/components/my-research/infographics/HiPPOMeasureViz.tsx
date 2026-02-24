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

type MeasureKey = 'legs' | 'legt' | 'lagt';

interface MeasureInfo {
  label: string;
  badge: string;
  badgeColor: string;
  equation: string;
  description: string;
  color: string;
  gradient: string;
}

const MEASURES: Record<MeasureKey, MeasureInfo> = {
  legs: {
    label: 'HiPPO-LegS',
    badge: '전 이력 균일',
    badgeColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
    equation: String.raw`\mu^{(t)}(x) = \tfrac{1}{t}\,\mathbb{1}_{[0,t]}(x)`,
    description: '전체 이력 [0, t]에 균일 가중. 시간 척도 등변성 보장, 시간 하이퍼파라미터 불필요.',
    color: '#6366f1',
    gradient: 'from-indigo-500 to-indigo-600',
  },
  legt: {
    label: 'HiPPO-LegT',
    badge: '슬라이딩 윈도우',
    badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    equation: String.raw`\mu^{(t)}(x) = \tfrac{1}{\theta}\,\mathbb{1}_{[t-\theta,\,t]}(x)`,
    description: '최근 θ 시간만 기억. 윈도우 밖은 완전 망각. LMU(Legendre Memory Unit)와 동치.',
    color: '#10b981',
    gradient: 'from-emerald-500 to-emerald-600',
  },
  lagt: {
    label: 'HiPPO-LagT',
    badge: '지수 감쇠',
    badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    equation: String.raw`\mu^{(t)}(x) = e^{-(t-x)}`,
    description: '최근 입력에 높은 가중치, 과거로 지수 감쇠. N=1이면 GRU 게이팅과 동치.',
    color: '#f59e0b',
    gradient: 'from-amber-500 to-amber-600',
  },
};

const MEASURE_KEYS: MeasureKey[] = ['legs', 'legt', 'lagt'];

/* SVG chart dimensions */
const W = 480, H = 160, PAD_L = 40, PAD_R = 20, PAD_T = 10, PAD_B = 30;
const CW = W - PAD_L - PAD_R;
const CH = H - PAD_T - PAD_B;

function MeasureChart({ measure, t, theta }: { measure: MeasureKey; t: number; theta: number }) {
  const points = useMemo(() => {
    const pts: { x: number; y: number }[] = [];
    const steps = 200;
    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * t;
      let w = 0;
      if (measure === 'legs') {
        w = 1 / t;
      } else if (measure === 'legt') {
        w = x >= t - theta ? 1 / theta : 0;
      } else {
        w = Math.exp(-(t - x));
      }
      pts.push({ x, y: w });
    }
    return pts;
  }, [measure, t, theta]);

  const maxY = Math.max(...points.map((p) => p.y), 0.01);
  const vx = (x: number) => PAD_L + (x / t) * CW;
  const vy = (y: number) => PAD_T + CH - (y / (maxY * 1.15)) * CH;

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${vx(p.x).toFixed(1)},${vy(p.y).toFixed(1)}`).join(' ');
  const fillD = pathD + ` L${vx(t).toFixed(1)},${vy(0).toFixed(1)} L${vx(0).toFixed(1)},${vy(0).toFixed(1)} Z`;
  const color = MEASURES[measure].color;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} className="block">
      <rect x={0} y={0} width={W} height={H} className="fill-gray-50 dark:fill-gray-800" rx={8} />
      {/* Grid */}
      {[0.25, 0.5, 0.75, 1.0].map((frac) => (
        <line key={frac} x1={PAD_L} y1={vy(maxY * 1.15 * frac)} x2={W - PAD_R} y2={vy(maxY * 1.15 * frac)}
          stroke="#d1d5db" strokeWidth={0.5} strokeDasharray="4,3" />
      ))}
      {/* Axes */}
      <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + CH} stroke="#9ca3af" strokeWidth={0.8} />
      <line x1={PAD_L} y1={PAD_T + CH} x2={W - PAD_R} y2={PAD_T + CH} stroke="#9ca3af" strokeWidth={0.8} />
      {/* Labels */}
      <text x={PAD_L - 4} y={vy(maxY) + 3} textAnchor="end" fontSize={9} className="fill-gray-400">
        {maxY.toFixed(2)}
      </text>
      <text x={PAD_L - 4} y={vy(0) + 3} textAnchor="end" fontSize={9} className="fill-gray-400">0</text>
      <text x={vx(0)} y={H - 5} textAnchor="middle" fontSize={9} className="fill-gray-400">0</text>
      <text x={vx(t)} y={H - 5} textAnchor="middle" fontSize={9} className="fill-gray-400">t={t}</text>
      <text x={W - PAD_R + 5} y={PAD_T + CH + 4} fontSize={9} className="fill-gray-400">시간</text>
      <text x={PAD_L + 5} y={PAD_T + 3} fontSize={9} className="fill-gray-400">μ(x)</text>
      {/* Fill area */}
      <path d={fillD} fill={color} opacity={0.15} />
      {/* Line */}
      <path d={pathD} fill="none" stroke={color} strokeWidth={2.5} />
      {/* Window markers for LegT */}
      {measure === 'legt' && t > theta && (
        <line x1={vx(t - theta)} y1={PAD_T} x2={vx(t - theta)} y2={PAD_T + CH}
          stroke={color} strokeWidth={1.5} strokeDasharray="5,3" />
      )}
      {measure === 'legt' && t > theta && (
        <text x={vx(t - theta)} y={H - 5} textAnchor="middle" fontSize={9} fill={color} fontWeight="bold">
          t-θ
        </text>
      )}
    </svg>
  );
}

/* Gradient Decay Comparison */
function GradientDecayChart({ maxT, lambda }: { maxT: number; lambda: number }) {
  const hippoPoints = useMemo(() =>
    Array.from({ length: 100 }, (_, i) => {
      const t = 1 + (i / 99) * (maxT - 1);
      return { t, val: 1 / t };
    }), [maxT]);
  const rnnPoints = useMemo(() =>
    Array.from({ length: 100 }, (_, i) => {
      const t = 1 + (i / 99) * (maxT - 1);
      return { t, val: Math.pow(lambda, t) };
    }), [maxT, lambda]);

  const vx = (t: number) => PAD_L + ((t - 1) / (maxT - 1)) * CW;
  const vy = (v: number) => PAD_T + CH * (1 - v);

  const hippoD = hippoPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${vx(p.t).toFixed(1)},${vy(p.val).toFixed(1)}`).join(' ');
  const rnnD = rnnPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${vx(p.t).toFixed(1)},${vy(p.val).toFixed(1)}`).join(' ');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} className="block">
      <rect x={0} y={0} width={W} height={H} className="fill-gray-50 dark:fill-gray-800" rx={8} />
      <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + CH} stroke="#9ca3af" strokeWidth={0.8} />
      <line x1={PAD_L} y1={PAD_T + CH} x2={W - PAD_R} y2={PAD_T + CH} stroke="#9ca3af" strokeWidth={0.8} />
      <text x={W - PAD_R + 5} y={PAD_T + CH + 4} fontSize={9} className="fill-gray-400">t</text>
      <text x={PAD_L + 5} y={PAD_T + 3} fontSize={9} className="fill-gray-400">‖∂c/∂f‖</text>
      {/* HiPPO: polynomial */}
      <path d={hippoD} fill="none" stroke="#6366f1" strokeWidth={2.5} />
      {/* RNN: exponential */}
      <path d={rnnD} fill="none" stroke="#ef4444" strokeWidth={2} strokeDasharray="6,3" />
      {/* Legend */}
      <line x1={PAD_L + 10} y1={PAD_T + 14} x2={PAD_L + 30} y2={PAD_T + 14} stroke="#6366f1" strokeWidth={2.5} />
      <text x={PAD_L + 34} y={PAD_T + 18} fontSize={10} className="fill-gray-500">HiPPO: Θ(1/t)</text>
      <line x1={PAD_L + 150} y1={PAD_T + 14} x2={PAD_L + 170} y2={PAD_T + 14} stroke="#ef4444" strokeWidth={2} strokeDasharray="6,3" />
      <text x={PAD_L + 174} y={PAD_T + 18} fontSize={10} className="fill-gray-500">RNN: λ^t (λ={lambda})</text>
      {/* Axis labels */}
      <text x={vx(1)} y={H - 5} textAnchor="middle" fontSize={9} className="fill-gray-400">1</text>
      <text x={vx(maxT)} y={H - 5} textAnchor="middle" fontSize={9} className="fill-gray-400">{maxT}</text>
    </svg>
  );
}

export default function HiPPOMeasureViz() {
  const [measure, setMeasure] = useState<MeasureKey>('legs');
  const [t, setT] = useState(8);
  const [theta, setTheta] = useState(4);
  const [maxT, setMaxT] = useState(100);
  const [lambda, setLambda] = useState(0.95);

  const info = MEASURES[measure];
  const hippoVal = (1 / maxT).toExponential(2);
  const rnnVal = Math.pow(lambda, maxT).toExponential(2);

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-md space-y-6">
      {/* ── Section 1: Measure Comparison ── */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
          HiPPO 측도 비교: 과거를 어떻게 기억할 것인가?
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          측도 μ<sup>(t)</sup>(x)는 &ldquo;시점 x의 과거 정보를 현재 t에서 얼마나 중요하게 볼 것인가&rdquo;를 정의합니다.
          탭을 전환하여 세 가지 측도의 차이를 비교하세요.
        </p>

        {/* Measure tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {MEASURE_KEYS.map((key) => (
            <button key={key} onClick={() => setMeasure(key)}
              className={`rounded-lg px-3 py-1.5 text-sm font-bold transition ${
                measure === key
                  ? `bg-gradient-to-r ${MEASURES[key].gradient} text-white shadow-sm`
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}>
              {MEASURES[key].label}
            </button>
          ))}
        </div>

        {/* Active measure info */}
        <div className="rounded-xl border-2 overflow-hidden mb-4"
          style={{ borderColor: `${info.color}40` }}>
          <div className="px-4 py-2.5 flex items-center gap-2" style={{ backgroundColor: `${info.color}10` }}>
            <span className={`rounded-md px-2.5 py-0.5 text-xs font-black ${info.badgeColor}`}>
              {info.badge}
            </span>
            <span className="text-sm font-bold text-gray-800 dark:text-gray-100">{info.label}</span>
          </div>
          <div className="px-4 py-3">
            <div className="mb-2"><InlineMath latex={info.equation} /></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{info.description}</p>
          </div>
        </div>

        {/* Sliders */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-3 text-sm">
            <label className="w-28 shrink-0 text-gray-600 dark:text-gray-300">
              현재 시간 t = <span className="font-mono font-bold" style={{ color: info.color }}>{t}</span>
            </label>
            <input type="range" min={2} max={20} step={1} value={t}
              onChange={(e) => setT(Number(e.target.value))}
              className="flex-1" style={{ accentColor: info.color }} />
          </div>
          {measure === 'legt' && (
            <div className="flex items-center gap-3 text-sm">
              <label className="w-28 shrink-0 text-gray-600 dark:text-gray-300">
                윈도우 θ = <span className="font-mono font-bold text-emerald-600">{theta}</span>
              </label>
              <input type="range" min={1} max={Math.max(1, t - 1)} step={1} value={Math.min(theta, t - 1)}
                onChange={(e) => setTheta(Number(e.target.value))}
                className="flex-1 accent-emerald-500" />
            </div>
          )}
        </div>

        {/* Chart */}
        <MeasureChart measure={measure} t={t} theta={theta} />

        {/* Quick comparison cards */}
        <div className="grid grid-cols-3 gap-2 mt-3">
          {MEASURE_KEYS.map((key) => {
            const m = MEASURES[key];
            const isActive = measure === key;
            return (
              <button key={key} onClick={() => setMeasure(key)}
                className={`rounded-lg border px-3 py-2 text-left transition text-xs ${
                  isActive
                    ? 'border-2 shadow-sm'
                    : 'border-gray-200 dark:border-gray-700 opacity-60 hover:opacity-100'
                }`}
                style={isActive ? { borderColor: m.color, backgroundColor: `${m.color}08` } : {}}>
                <p className="font-bold" style={{ color: m.color }}>{m.label}</p>
                <p className="text-gray-500 dark:text-gray-400 mt-0.5">
                  {key === 'legs' ? 'Θ(1/t) 감쇠' : key === 'legt' ? 'θ 윈도우 한정' : 'N=1 → GRU'}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Section 2: Gradient Decay ── */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-5">
        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1">
          그래디언트 감쇠 비교: 왜 HiPPO가 장거리 의존성에 유리한가?
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          HiPPO-LegS의 그래디언트는 <InlineMath latex={String.raw`\Theta(1/t)`} />로 다항식 감쇠하지만,
          기존 RNN은 <InlineMath latex={String.raw`\lambda^t`} />로 지수 소실됩니다.
          슬라이더를 조절하여 차이를 확인하세요.
        </p>

        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-3 text-sm">
            <label className="w-32 shrink-0 text-gray-600 dark:text-gray-300">
              시퀀스 길이 T = <span className="font-mono font-bold text-indigo-600">{maxT}</span>
            </label>
            <input type="range" min={10} max={1000} step={10} value={maxT}
              onChange={(e) => setMaxT(Number(e.target.value))}
              className="flex-1 accent-indigo-500" />
          </div>
          <div className="flex items-center gap-3 text-sm">
            <label className="w-32 shrink-0 text-gray-600 dark:text-gray-300">
              RNN 감쇠율 λ = <span className="font-mono font-bold text-red-500">{lambda.toFixed(2)}</span>
            </label>
            <input type="range" min={0.8} max={0.999} step={0.001} value={lambda}
              onChange={(e) => setLambda(Number(e.target.value))}
              className="flex-1 accent-red-500" />
          </div>
        </div>

        <GradientDecayChart maxT={maxT} lambda={lambda} />

        {/* Numeric comparison */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 px-4 py-3 text-center">
            <p className="text-xs text-indigo-500 mb-1">HiPPO (t={maxT})</p>
            <p className="font-mono font-bold text-lg text-indigo-700 dark:text-indigo-300">{hippoVal}</p>
            <p className="text-xs text-indigo-400 mt-0.5">다항식 감쇠 — 여전히 학습 가능</p>
          </div>
          <div className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 px-4 py-3 text-center">
            <p className="text-xs text-red-500 mb-1">RNN λ={lambda} (t={maxT})</p>
            <p className="font-mono font-bold text-lg text-red-700 dark:text-red-300">{rnnVal}</p>
            <p className="text-xs text-red-400 mt-0.5">
              {Math.pow(lambda, maxT) < 1e-10 ? '사실상 0 — 학습 불가' : '급속 감쇠 중'}
            </p>
          </div>
        </div>
      </div>

      {/* Theory note */}
      <div className="rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-3">
        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
          <span className="font-semibold text-gray-800 dark:text-gray-200">핵심 통찰:</span>{' '}
          HiPPO 프레임워크는 &ldquo;어떤 과거가 중요한가?&rdquo;를 측도로 수학적으로 정의합니다.
          이 선택이 전이행렬 A와 입력행렬 B를 유일하게 결정하며,
          결과적으로 메모리의 시간적 특성(감쇠율, 해상도, 시간 척도 불변성)을 완전히 규정합니다.
          HiPPO-LegS가 S4, Mamba 계열의 A 초기화로 채택된 이유는 바로 이 다항식 그래디언트 보장 덕분입니다.
        </p>
      </div>
    </div>
  );
}
