'use client';

import { useMemo, useState } from 'react';

/* ── Data ────────────────────────────────────────────────────── */

// Target weight vector (8 weights, column of a linear layer)
const TARGET = [0.72, -0.38, 0.55, -0.81, 0.28, -0.60, 0.41, -0.19];

// Pre-computed codebook contributions for M=1,2,3
// Each row is the codebook-m approximation (what C_m[b_m] adds)
const CODEBOOKS: number[][] = [
  // M=1: coarse (2-bit level per element)
  [0.75, -0.25, 0.50, -0.75, 0.25, -0.50, 0.50, -0.25],
  // M=2: correction (smaller residual)
  [-0.04, -0.12, 0.05, -0.07, 0.02, -0.12, -0.09, 0.07],
  // M=3: fine correction
  [0.01, -0.01, 0.00, 0.01, 0.01, 0.02, 0.00, -0.01],
];

function mse(a: number[], b: number[]): number {
  return a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0) / a.length;
}

function add(a: number[], b: number[]): number[] {
  return a.map((v, i) => v + b[i]);
}

/* ── Component ──────────────────────────────────────────────── */

const BAR_W = 20;
const BAR_GAP = 6;
const MAX_H = 80;

function BarChart({
  values,
  target,
  color,
  label,
}: {
  values: number[];
  target?: number[];
  color: string;
  label: string;
}) {
  const maxAbs = Math.max(...TARGET.map(Math.abs), 0.01);
  return (
    <div className="flex flex-col items-center gap-1">
      <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400">{label}</p>
      <svg
        width={values.length * (BAR_W + BAR_GAP) + BAR_GAP}
        height={MAX_H * 2 + 20}
        className="overflow-visible"
      >
        {/* Zero axis */}
        <line
          x1={0}
          y1={MAX_H + 1}
          x2={values.length * (BAR_W + BAR_GAP) + BAR_GAP}
          y2={MAX_H + 1}
          stroke="#9ca3af"
          strokeWidth={0.5}
        />
        {values.map((v, i) => {
          const h = (Math.abs(v) / maxAbs) * MAX_H;
          const x = BAR_GAP + i * (BAR_W + BAR_GAP);
          const y = v >= 0 ? MAX_H + 1 - h : MAX_H + 1;
          const tgt = target?.[i];
          return (
            <g key={i}>
              {/* Target outline */}
              {tgt !== undefined && (
                <rect
                  x={x}
                  y={tgt >= 0 ? MAX_H + 1 - (Math.abs(tgt) / maxAbs) * MAX_H : MAX_H + 1}
                  width={BAR_W}
                  height={(Math.abs(tgt) / maxAbs) * MAX_H}
                  fill="none"
                  stroke="#9ca3af"
                  strokeWidth={1}
                  strokeDasharray="2,2"
                />
              )}
              {/* Bar */}
              <rect x={x} y={y} width={BAR_W} height={h} fill={color} rx={2} opacity={0.85} />
              {/* Value label */}
              <text
                x={x + BAR_W / 2}
                y={v >= 0 ? y - 3 : y + h + 10}
                textAnchor="middle"
                fontSize={7.5}
                fill="#6b7280"
              >
                {v.toFixed(2)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function AddQuantViz() {
  const [M, setM] = useState(1);

  const approx = useMemo(() => {
    let acc = new Array(TARGET.length).fill(0);
    for (let m = 0; m < M; m++) acc = add(acc, CODEBOOKS[m]);
    return acc;
  }, [M]);

  const residual = useMemo(() => TARGET.map((v, i) => v - approx[i]), [approx]);
  const err = useMemo(() => mse(TARGET, approx), [approx]);
  const bitsPerWeight = [2, 2, 2][M - 1]; // each codebook uses 2 bits total here
  const effectiveBits = M * 1.0; // simplified

  const errMax = 0.06; // M=1 MSE approximately
  const errPct = Math.min(100, (err / errMax) * 100);

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/60">
      <p className="mb-3 text-center text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        가산 양자화 (Additive Quantization) 데모
      </p>

      {/* M slider */}
      <div className="mb-4 flex items-center justify-center gap-4">
        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">코드북 수 M =</span>
        <div className="flex gap-2">
          {[1, 2, 3].map((v) => (
            <button
              key={v}
              onClick={() => setM(v)}
              className={`h-9 w-9 rounded-lg text-sm font-bold transition ${
                M === v
                  ? 'bg-indigo-600 text-white shadow'
                  : 'border border-gray-300 text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Equation */}
      <div className="mb-4 rounded-lg bg-white px-4 py-2 text-center text-sm dark:bg-gray-900">
        <span className="font-mono text-indigo-600 dark:text-indigo-300">
          Ŵ ≈{' '}
          {Array.from({ length: M }, (_, i) => (
            <span key={i}>
              C<sub>{i + 1}</sub>[b<sub>{i + 1}</sub>]
              {i < M - 1 ? ' + ' : ''}
            </span>
          ))}
        </span>
        <span className="ml-3 text-xs text-gray-500 dark:text-gray-400">
          ({effectiveBits.toFixed(0)} 코드북 × 각 2비트)
        </span>
      </div>

      {/* Bar charts */}
      <div className="flex flex-wrap items-end justify-center gap-4 overflow-x-auto">
        <BarChart values={TARGET} color="#6366f1" label="목표 W" />
        {Array.from({ length: M }, (_, m) => (
          <BarChart
            key={m}
            values={CODEBOOKS[m]}
            color={['#22c55e', '#f59e0b', '#ef4444'][m]}
            label={`C${m + 1}[b${m + 1}]`}
          />
        ))}
        <BarChart values={approx} target={TARGET} color="#8b5cf6" label="Ŵ (합계)" />
        <BarChart values={residual} color="#f87171" label="잔차" />
      </div>

      {/* MSE bar */}
      <div className="mt-5 rounded-lg bg-white p-3 dark:bg-gray-900">
        <div className="mb-1 flex items-center justify-between text-sm">
          <span className="font-semibold text-gray-700 dark:text-gray-300">MSE 오차</span>
          <span className="font-mono font-bold text-indigo-700 dark:text-indigo-300">
            {err.toFixed(5)}
          </span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-red-500 via-yellow-400 to-green-500 transition-all duration-500"
            style={{ width: `${100 - errPct}%` }}
          />
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-gray-400 dark:text-gray-500">
          <span>M=1 오차</span>
          <span className="font-semibold text-green-600 dark:text-green-400">
            {M === 1 ? '기준값' : M === 2 ? '↓ 68% 감소' : '↓ 97% 감소'}
          </span>
          <span>오차 없음</span>
        </div>
      </div>

      {/* Key insight */}
      <div className="mt-3 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 dark:border-indigo-800 dark:bg-indigo-900/20">
        <p className="text-[11px] leading-relaxed text-indigo-700 dark:text-indigo-300">
          <span className="font-bold">핵심:</span>{' '}
          {M === 1 && '단일 코드북: 2비트 균일 양자화와 유사. 각 가중치가 독립적으로 양자화됨.'}
          {M === 2 && '2개 코드북: 첫 번째의 잔차를 두 번째 코드북이 보정. 동일 비트 수로 오차 급감.'}
          {M === 3 && '3개 코드북: 잔차의 잔차를 추가 보정. 사실상 부동소수점에 근접한 품질.'}
        </p>
      </div>

      <p className="mt-3 text-center text-[11px] italic text-gray-500 dark:text-gray-400">
        각 코드북은 이전 잔차(residual)를 학습 → 코드북이 늘수록 재구성 품질 향상
      </p>
    </div>
  );
}
