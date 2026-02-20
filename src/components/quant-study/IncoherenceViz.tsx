'use client';

import { useCallback, useMemo, useState } from 'react';

/* ── Matrix helpers ─────────────────────────────────────────── */

type Mat = number[][];

// Initial "coherent" 6×6 weight matrix – a few dominant entries
const INIT_W: Mat = [
  [0.84, 0.21, -0.09, 0.04, 0.16, -0.06],
  [0.03, -0.73, 0.13, -0.28, 0.08, 0.22],
  [-0.11, 0.07, 0.68, 0.17, -0.36, 0.09],
  [0.31, -0.13, 0.06, -0.61, 0.20, -0.03],
  [0.08, 0.24, -0.41, 0.12, 0.76, -0.19],
  [-0.15, 0.37, 0.10, -0.07, -0.24, 0.69],
];

// Apply one random Givens column-rotation  W' = W G^T
function applyGivens(W: Mat, seed: number): Mat {
  const n = W.length;
  const m = W[0].length;
  // Pseudo-random indices from seed
  const i = seed % m;
  const j = (seed * 7 + 3) % (m - 1) >= i ? (seed * 7 + 3) % (m - 1) + 1 : (seed * 7 + 3) % (m - 1);
  const theta = ((seed * 37 + 11) % 628) / 100 - Math.PI; // angle in [-π, π]

  const W2 = W.map((row) => [...row]);
  const c = Math.cos(theta);
  const s = Math.sin(theta);
  for (let r = 0; r < n; r++) {
    const wi = W2[r][i];
    const wj = W2[r][j];
    W2[r][i] = c * wi - s * wj;
    W2[r][j] = s * wi + c * wj;
  }
  return W2;
}

function coherence(W: Mat): number {
  const n = W.length;
  const m = W[0].length;
  let maxAbs = 0;
  let frobSq = 0;
  for (const row of W) {
    for (const v of row) {
      if (Math.abs(v) > maxAbs) maxAbs = Math.abs(v);
      frobSq += v * v;
    }
  }
  return (maxAbs / Math.sqrt(frobSq)) * Math.sqrt(n * m);
}

function maxAbsEntry(W: Mat): number {
  return Math.max(...W.flatMap((r) => r.map(Math.abs)));
}

function cellColor(v: number, maxAbs: number): string {
  const t = maxAbs === 0 ? 0 : v / maxAbs; // -1 to 1
  if (t >= 0) {
    const lo = [249, 250, 251]; // gray-50
    const hi = [220, 38, 38]; // red-600
    return `rgb(${Math.round(lo[0] + (hi[0] - lo[0]) * t)},${Math.round(lo[1] + (hi[1] - lo[1]) * t)},${Math.round(lo[2] + (hi[2] - lo[2]) * t)})`;
  } else {
    const lo = [249, 250, 251];
    const hi = [37, 99, 235]; // blue-600
    const u = -t;
    return `rgb(${Math.round(lo[0] + (hi[0] - lo[0]) * u)},${Math.round(lo[1] + (hi[1] - lo[1]) * u)},${Math.round(lo[2] + (hi[2] - lo[2]) * u)})`;
  }
}

/* ── Component ──────────────────────────────────────────────── */

export default function IncoherenceViz() {
  const [W, setW] = useState<Mat>(INIT_W);
  const [rotCount, setRotCount] = useState(0);
  const [history, setHistory] = useState<number[]>([coherence(INIT_W)]);

  const mu = useMemo(() => coherence(W), [W]);
  const maxAbs = useMemo(() => maxAbsEntry(W), [W]);

  // Find position of max-abs entry
  const maxPos = useMemo(() => {
    let best = { r: 0, c: 0, v: 0 };
    W.forEach((row, r) => row.forEach((v, c) => { if (Math.abs(v) > best.v) best = { r, c, v: Math.abs(v) }; }));
    return best;
  }, [W]);

  const applyRotation = useCallback(() => {
    setW((prev) => {
      const next = applyGivens(prev, rotCount * 13 + 7);
      const mu2 = coherence(next);
      setHistory((h) => [...h, mu2]);
      return next;
    });
    setRotCount((c) => c + 1);
  }, [rotCount]);

  const reset = useCallback(() => {
    setW(INIT_W);
    setRotCount(0);
    setHistory([coherence(INIT_W)]);
  }, []);

  const CELL = 42;
  const N = W.length;
  const muInit = coherence(INIT_W);
  const muPct = ((1 - mu / muInit) * 100).toFixed(0);

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/60">
      <p className="mb-3 text-center text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        비간섭 처리 (Incoherence Processing) 인터랙티브 데모
      </p>

      {/* Matrix heatmap + metrics */}
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:justify-center">
        {/* Heatmap */}
        <div>
          <p className="mb-1 text-center text-[11px] text-gray-500 dark:text-gray-400">
            가중치 행렬 W ({N}×{N})
          </p>
          <svg
            width={N * CELL + 2}
            height={N * CELL + 2}
            className="rounded border border-gray-200 dark:border-gray-600"
          >
            {W.map((row, r) =>
              row.map((v, c) => {
                const isMax = r === maxPos.r && c === maxPos.c;
                return (
                  <g key={`${r}-${c}`}>
                    <rect
                      x={1 + c * CELL}
                      y={1 + r * CELL}
                      width={CELL - 1}
                      height={CELL - 1}
                      fill={cellColor(v, maxAbs)}
                    />
                    {isMax && (
                      <rect
                        x={1 + c * CELL}
                        y={1 + r * CELL}
                        width={CELL - 1}
                        height={CELL - 1}
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth={2}
                      />
                    )}
                    <text
                      x={1 + c * CELL + CELL / 2}
                      y={1 + r * CELL + CELL / 2 + 4}
                      textAnchor="middle"
                      fontSize={9}
                      fill={Math.abs(v) > 0.4 ? '#fff' : '#374151'}
                      fontWeight={isMax ? 'bold' : 'normal'}
                    >
                      {v.toFixed(2)}
                    </text>
                  </g>
                );
              })
            )}
          </svg>
          <p className="mt-1 text-center text-[10px] text-amber-600 dark:text-amber-400">
            황색 테두리 = max|W<sub>ij</sub>|
          </p>
        </div>

        {/* Metrics */}
        <div className="flex flex-col gap-3">
          {/* Coherence gauge */}
          <div className="rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-600 dark:bg-gray-900">
            <p className="mb-1 text-xs font-semibold text-gray-600 dark:text-gray-400">
              간섭 지수 μ(W)
            </p>
            <p className="text-2xl font-mono font-bold text-gray-900 dark:text-gray-100">
              {mu.toFixed(3)}
            </p>
            <div className="mt-2 h-2 w-40 rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-green-400 to-red-500 transition-all"
                style={{ width: `${Math.min((mu / muInit) * 100, 100)}%` }}
              />
            </div>
            <p className="mt-1 text-[10px] text-gray-500 dark:text-gray-400">
              초기 대비 <span className="font-bold text-green-600 dark:text-green-400">-{muPct}%</span> 감소
            </p>
          </div>

          {/* Max entry */}
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20">
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">
              max|W<sub>ij</sub>|
            </p>
            <p className="text-xl font-mono font-bold text-amber-900 dark:text-amber-100">
              {maxAbs.toFixed(3)}
            </p>
            <p className="text-[10px] text-amber-600 dark:text-amber-400">
              Frobenius 기준 {((maxAbs / Math.sqrt(W.flat().reduce((s, v) => s + v * v, 0))) * 100).toFixed(1)}%
            </p>
          </div>

          {/* Rotation counter */}
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
            <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">적용된 회전 수</p>
            <p className="text-2xl font-mono font-bold text-blue-900 dark:text-blue-100">{rotCount}</p>
          </div>

          {/* Buttons */}
          <button
            onClick={applyRotation}
            className="w-40 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 active:scale-95"
          >
            랜덤 회전 적용
          </button>
          <button
            onClick={reset}
            className="w-40 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            초기화
          </button>
        </div>
      </div>

      {/* μ history sparkline */}
      {history.length > 1 && (
        <div className="mt-4">
          <p className="mb-1 text-center text-[11px] text-gray-500 dark:text-gray-400">
            μ(W) 변화 추이 (낮을수록 양자화 유리)
          </p>
          <svg width="100%" viewBox={`0 0 ${Math.max(history.length * 18, 200)} 48`} className="block">
            {history.map((v, i) => {
              const x = i * 18 + 9;
              const y = 44 - ((v - 0.6) / (muInit - 0.6)) * 36;
              return (
                <g key={i}>
                  {i > 0 && (
                    <line
                      x1={(i - 1) * 18 + 9}
                      y1={44 - ((history[i - 1] - 0.6) / (muInit - 0.6)) * 36}
                      x2={x}
                      y2={y}
                      stroke="#6366f1"
                      strokeWidth={1.5}
                    />
                  )}
                  <circle cx={x} cy={y} r={3} fill={i === history.length - 1 ? '#22c55e' : '#a5b4fc'} />
                </g>
              );
            })}
            <text x={9} y={10} fontSize={8} fill="#9ca3af">μ={muInit.toFixed(2)}</text>
            <text x={9} y={44} fontSize={8} fill="#22c55e">감소 →</text>
          </svg>
        </div>
      )}

      <p className="mt-3 text-center text-[11px] italic text-gray-500 dark:text-gray-400">
        회전 후 어떤 단일 항목도 행렬 전체를 지배하지 않게 됩니다 → 균일 양자화 오차 최소화
      </p>
    </div>
  );
}
