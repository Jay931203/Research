'use client';

import { useState, useMemo, useCallback } from 'react';
import katex from 'katex';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function l1Norm(v: number[]): number {
  return v.reduce((sum, x) => sum + Math.abs(x), 0);
}

function l2Norm(v: number[]): number {
  return Math.sqrt(v.reduce((sum, x) => sum + x * x, 0));
}

function hoyerSparsity(v: number[]): number | null {
  const n = v.length;
  const l2 = l2Norm(v);
  if (l2 === 0) return null; // undefined for zero vector
  const ratio = l1Norm(v) / l2;
  const sqrtN = Math.sqrt(n);
  if (sqrtN === 1) return 0;
  return (sqrtN - ratio) / (sqrtN - 1);
}

function renderKatex(tex: string): string {
  return katex.renderToString(tex, {
    throwOnError: false,
    displayMode: true,
  });
}

function fmt(n: number, digits = 3): string {
  return n.toFixed(digits);
}

// Color for bar magnitude: gray at 0, teal/emerald at 1
function barColor(value: number, max: number): string {
  if (max === 0) return '#6b7280'; // gray-500
  const t = value / max;
  // Interpolate from gray-400 to emerald-500
  const r = Math.round(156 + (16 - 156) * t);
  const g = Math.round(163 + (185 - 163) * t);
  const b = Math.round(175 + (129 - 175) * t);
  return `rgb(${r},${g},${b})`;
}

function barColorDark(value: number, max: number): string {
  if (max === 0) return '#4b5563'; // gray-600
  const t = value / max;
  const r = Math.round(75 + (52 - 75) * t);
  const g = Math.round(85 + (211 - 85) * t);
  const b = Math.round(99 + (153 - 99) * t);
  return `rgb(${r},${g},${b})`;
}

// ---------------------------------------------------------------------------
// Presets
// ---------------------------------------------------------------------------

const PRESETS: { label: string; description: string; values: number[] }[] = [
  {
    label: '균일 분포',
    description: 'Hoyer = 0',
    values: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
  },
  {
    label: '완전 희소',
    description: 'Hoyer = 1',
    values: [1.0, 0, 0, 0, 0, 0, 0, 0],
  },
  {
    label: '자연스러운 희소',
    description: '지수 감소',
    values: [1.0, 0.5, 0.25, 0.12, 0.06, 0.03, 0.01, 0.0],
  },
  {
    label: '랜덤',
    description: '무작위',
    values: [], // generated on click
  },
];

const N = 8;

// ---------------------------------------------------------------------------
// Subcomponents
// ---------------------------------------------------------------------------

/** Bar chart + sliders for each vector component */
function VectorEditor({
  values,
  onChange,
}: {
  values: number[];
  onChange: (index: number, value: number) => void;
}) {
  const maxVal = Math.max(...values, 0.01);
  const barChartHeight = 180;
  const barWidth = 36;
  const gap = 8;
  const totalWidth = N * barWidth + (N - 1) * gap;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Bar chart (SVG) */}
      <svg
        width={totalWidth + 20}
        height={barChartHeight + 24}
        viewBox={`-10 -4 ${totalWidth + 20} ${barChartHeight + 28}`}
        className="select-none"
        aria-label="벡터 성분 막대 그래프"
      >
        {/* baseline */}
        <line
          x1={0}
          y1={barChartHeight}
          x2={totalWidth}
          y2={barChartHeight}
          className="stroke-gray-300 dark:stroke-gray-600"
          strokeWidth={1}
        />
        {values.map((v, i) => {
          const x = i * (barWidth + gap);
          const h = (v / 1.0) * barChartHeight;
          return (
            <g key={i}>
              {/* bar */}
              <rect
                x={x}
                y={barChartHeight - h}
                width={barWidth}
                height={h}
                rx={4}
                className="transition-all duration-150"
                fill={barColor(v, maxVal)}
                style={{ filter: 'none' }}
              />
              {/* dark mode overlay — uses CSS to show/hide */}
              <rect
                x={x}
                y={barChartHeight - h}
                width={barWidth}
                height={h}
                rx={4}
                className="hidden dark:block transition-all duration-150"
                fill={barColorDark(v, maxVal)}
              />
              {/* index label */}
              <text
                x={x + barWidth / 2}
                y={barChartHeight + 16}
                textAnchor="middle"
                className="fill-gray-500 dark:fill-gray-400"
                fontSize={11}
                fontFamily="JetBrains Mono, monospace"
              >
                x{i + 1}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Sliders row */}
      <div className="flex gap-1 items-end" style={{ width: totalWidth + 20 }}>
        {values.map((v, i) => (
          <div key={i} className="flex flex-col items-center" style={{ width: barWidth + gap }}>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={v}
              onChange={(e) => onChange(i, parseFloat(e.target.value))}
              className="w-full h-24 accent-emerald-500 cursor-pointer"
              style={{
                writingMode: 'vertical-lr' as React.CSSProperties['writingMode'],
                direction: 'rtl',
              }}
              aria-label={`x${i + 1} 값 조절`}
            />
            <span className="mt-1 text-xs font-mono text-gray-600 dark:text-gray-400 tabular-nums">
              {v.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Hoyer bar indicator 0..1 */
function HoyerBar({ value }: { value: number | null }) {
  const barWidth = 260;
  const barHeight = 20;
  const pos = value !== null ? Math.max(0, Math.min(1, value)) * barWidth : 0;

  return (
    <div className="flex flex-col gap-1">
      <svg
        width={barWidth + 8}
        height={barHeight + 20}
        viewBox={`-4 -2 ${barWidth + 8} ${barHeight + 22}`}
        aria-label={`Hoyer 스파시티: ${value !== null ? fmt(value) : 'N/A'}`}
      >
        {/* track */}
        <defs>
          <linearGradient id="hoyerGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#6b7280" />
            <stop offset="50%" stopColor="#14b8a6" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>
        <rect
          x={0}
          y={0}
          width={barWidth}
          height={barHeight}
          rx={10}
          fill="url(#hoyerGrad)"
          opacity={0.25}
        />
        {/* fill */}
        {value !== null && (
          <rect
            x={0}
            y={0}
            width={pos}
            height={barHeight}
            rx={10}
            fill="url(#hoyerGrad)"
            className="transition-all duration-200"
          />
        )}
        {/* marker */}
        {value !== null && (
          <circle
            cx={pos}
            cy={barHeight / 2}
            r={8}
            className="fill-emerald-500 stroke-white dark:stroke-gray-900"
            strokeWidth={2}
          />
        )}
        {/* labels */}
        <text x={0} y={barHeight + 14} fontSize={10} className="fill-gray-400">
          0
        </text>
        <text
          x={barWidth}
          y={barHeight + 14}
          textAnchor="end"
          fontSize={10}
          className="fill-gray-400"
        >
          1
        </text>
      </svg>
    </div>
  );
}

/** L1 vs L2 ball 2D visualization */
function NormBallViz({ x1, x2 }: { x1: number; x2: number }) {
  const size = 280;
  const half = size / 2;
  const scale = half * 0.8; // unit = 80% of half-width

  // L1 ball: |x1| + |x2| <= 1  (diamond)
  const l1Points = [
    [0, -scale],
    [scale, 0],
    [0, scale],
    [-scale, 0],
  ]
    .map(([px, py]) => `${half + px},${half + py}`)
    .join(' ');

  // Point position
  const px = half + x1 * scale;
  const py = half - x2 * scale; // y is inverted in SVG

  return (
    <div className="flex flex-col items-center gap-2">
      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
        L1 / L2 단위 구 (2D 단면)
      </h4>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700"
        aria-label="L1과 L2 단위 구 비교"
      >
        {/* Grid lines */}
        <line
          x1={half}
          y1={4}
          x2={half}
          y2={size - 4}
          className="stroke-gray-200 dark:stroke-gray-700"
          strokeWidth={1}
        />
        <line
          x1={4}
          y1={half}
          x2={size - 4}
          y2={half}
          className="stroke-gray-200 dark:stroke-gray-700"
          strokeWidth={1}
        />

        {/* L2 ball (circle) */}
        <circle
          cx={half}
          cy={half}
          r={scale}
          fill="none"
          className="stroke-blue-400 dark:stroke-blue-500"
          strokeWidth={2}
          strokeDasharray="6 3"
          opacity={0.7}
        />

        {/* L1 ball (diamond) */}
        <polygon
          points={l1Points}
          fill="none"
          className="stroke-emerald-500 dark:stroke-emerald-400"
          strokeWidth={2}
          opacity={0.8}
        />

        {/* Current point */}
        <circle
          cx={px}
          cy={py}
          r={6}
          className="fill-rose-500 dark:fill-rose-400 stroke-white dark:stroke-gray-900"
          strokeWidth={2}
        />

        {/* Axis labels */}
        <text
          x={size - 8}
          y={half - 6}
          textAnchor="end"
          fontSize={12}
          fontFamily="JetBrains Mono, monospace"
          className="fill-gray-500 dark:fill-gray-400"
        >
          x1
        </text>
        <text
          x={half + 8}
          y={14}
          fontSize={12}
          fontFamily="JetBrains Mono, monospace"
          className="fill-gray-500 dark:fill-gray-400"
        >
          x2
        </text>

        {/* Legend */}
        <line
          x1={12}
          y1={size - 30}
          x2={28}
          y2={size - 30}
          className="stroke-emerald-500"
          strokeWidth={2}
        />
        <text x={32} y={size - 26} fontSize={10} className="fill-gray-500 dark:fill-gray-400">
          L1 구
        </text>
        <line
          x1={12}
          y1={size - 14}
          x2={28}
          y2={size - 14}
          className="stroke-blue-400"
          strokeWidth={2}
          strokeDasharray="6 3"
        />
        <text x={32} y={size - 10} fontSize={10} className="fill-gray-500 dark:fill-gray-400">
          L2 구
        </text>
      </svg>
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center max-w-[280px] leading-relaxed">
        L1 구(마름모)의 꼭짓점이 축 위에 있어 희소 해를 유도합니다.
        빨간 점은 현재 벡터의 (x1, x2) 성분입니다.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function HoyerSparsityViz() {
  const [values, setValues] = useState<number[]>([0.9, 0.4, 0.2, 0.1, 0.05, 0.02, 0.01, 0.0]);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleSliderChange = useCallback((index: number, value: number) => {
    setValues((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }, []);

  const applyPreset = useCallback((preset: (typeof PRESETS)[number]) => {
    if (preset.values.length === 0) {
      // random
      setValues(Array.from({ length: N }, () => Math.round(Math.random() * 100) / 100));
    } else {
      setValues([...preset.values]);
    }
  }, []);

  const metrics = useMemo(() => {
    const l1 = l1Norm(values);
    const l2 = l2Norm(values);
    const ratio = l2 > 0 ? l1 / l2 : 0;
    const hoyer = hoyerSparsity(values);
    return { l1, l2, ratio, hoyer };
  }, [values]);

  const formulaHtml = useMemo(
    () =>
      renderKatex(
        String.raw`\text{Hoyer}(\mathbf{x}) = \frac{\sqrt{n} - \frac{\|\mathbf{x}\|_1}{\|\mathbf{x}\|_2}}{\sqrt{n} - 1}`
      ),
    []
  );

  return (
    <section className="w-full max-w-5xl mx-auto px-4 py-8">
      {/* Title */}
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-50 tracking-tight">
          Hoyer Sparsity &mdash; L1/L2 기반 희소성 측정
        </h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          벡터의 희소성(sparsity)을 L1과 L2 노름의 비율로 정량화합니다
        </p>
      </div>

      {/* KaTeX formula */}
      <div
        className="flex justify-center mb-6 overflow-x-auto"
        dangerouslySetInnerHTML={{ __html: formulaHtml }}
      />

      {/* Preset buttons */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            onClick={() => applyPreset(preset)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium
              bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300
              hover:bg-emerald-50 dark:hover:bg-emerald-900/30
              hover:text-emerald-700 dark:hover:text-emerald-300
              border border-gray-200 dark:border-gray-700
              hover:border-emerald-300 dark:hover:border-emerald-700
              transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          >
            <span>{preset.label}</span>
            <span className="text-xs text-gray-400 dark:text-gray-500">({preset.description})</span>
          </button>
        ))}
      </div>

      {/* Main content: bar chart + sliders | metrics + norm ball */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Left: Vector editor */}
        <div className="flex flex-col items-center">
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-4">
            벡터 편집기
          </h3>
          <VectorEditor values={values} onChange={handleSliderChange} />
        </div>

        {/* Right: Metrics + norm ball */}
        <div className="flex flex-col items-center gap-6">
          {/* Metrics panel */}
          <div
            className="w-full max-w-xs rounded-2xl p-5
            bg-white dark:bg-gray-800/80
            border border-gray-200 dark:border-gray-700
            shadow-sm"
          >
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-4 text-center">
              실시간 메트릭
            </h3>

            <div className="space-y-3 font-mono text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">
                  <span
                    dangerouslySetInnerHTML={{
                      __html: katex.renderToString(String.raw`\|\mathbf{x}\|_1`, {
                        throwOnError: false,
                      }),
                    }}
                  />
                </span>
                <span className="font-semibold text-gray-800 dark:text-gray-200 tabular-nums">
                  {fmt(metrics.l1)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">
                  <span
                    dangerouslySetInnerHTML={{
                      __html: katex.renderToString(String.raw`\|\mathbf{x}\|_2`, {
                        throwOnError: false,
                      }),
                    }}
                  />
                </span>
                <span className="font-semibold text-gray-800 dark:text-gray-200 tabular-nums">
                  {fmt(metrics.l2)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">L1/L2 비율</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200 tabular-nums">
                  {metrics.l2 > 0 ? fmt(metrics.ratio) : 'N/A'}
                </span>
              </div>

              <div className="border-t border-gray-100 dark:border-gray-700 my-2" />

              <div className="flex justify-between items-center">
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  Hoyer Sparsity
                </span>
                <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {metrics.hoyer !== null ? fmt(metrics.hoyer) : 'N/A'}
                </span>
              </div>
            </div>

            <div className="mt-4 flex justify-center">
              <HoyerBar value={metrics.hoyer} />
            </div>
          </div>

          {/* L1/L2 ball visualization */}
          <NormBallViz x1={values[0]} x2={values[1]} />
        </div>
      </div>

      {/* Explanation card (collapsible) */}
      <div
        className="rounded-2xl border border-gray-200 dark:border-gray-700
        bg-white dark:bg-gray-800/80 shadow-sm overflow-hidden"
      >
        <button
          onClick={() => setShowExplanation((prev) => !prev)}
          className="w-full px-6 py-4 flex items-center justify-between text-left
            hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150
            focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500/40"
          aria-expanded={showExplanation}
        >
          <span className="font-semibold text-gray-800 dark:text-gray-200">
            왜 L1/L2 비율이 희소성을 측정하는가?
          </span>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
              showExplanation ? 'rotate-180' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showExplanation && (
          <div className="px-6 pb-6 space-y-4 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            <div>
              <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-1">
                L1/L2 비율의 직관
              </h4>
              <p>
                L1 노름은 모든 성분의 절대값 합이고, L2 노름은 제곱합의 제곱근입니다.
                벡터의 에너지가 소수의 성분에 집중될수록(희소할수록) L1/L2 비율이 작아집니다.
                반대로 모든 성분이 균일하면 이 비율이 최대가 됩니다.
                Hoyer 지표는 이 비율을 [0, 1] 범위로 정규화한 것입니다.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-1">
                L1 정규화(LASSO)와의 관계
              </h4>
              <p>
                기계학습에서 L1 정규화(LASSO)는 손실 함수에 가중치 벡터의 L1 노름을 페널티로
                추가합니다. L1 단위 구의 기하학적 형태(마름모)는 꼭짓점이 좌표축 위에 있어서,
                최적해가 축 위에 놓일 확률이 높습니다. 이는 곧 많은 성분이 0이 되는 희소
                해(sparse solution)를 유도합니다.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-1">
                CSI 압축에서의 의미
              </h4>
              <p>
                CSI(Channel State Information) 피드백에서 오토인코더의 잠재 표현(latent
                representation)이 희소할수록 더 효율적인 양자화와 압축이 가능합니다.
                Hoyer 지표를 정규화 항으로 사용하면 인코더가 자연스럽게 희소한 잠재 벡터를
                생성하도록 유도할 수 있습니다. 이는 제한된 피드백 비트 수 내에서 채널 정보를
                최대한 보존하는 데 핵심적인 역할을 합니다.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
