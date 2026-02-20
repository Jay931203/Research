'use client';

import { useCallback, useMemo, useState } from 'react';

/* ── Lattice helpers ─────────────────────────────────────────── */

// Regular 4×4 square grid in [-1, 1]² → 16 points (2-bit scalar in each dim)
const SQUARE_GRID: [number, number][] = [];
for (let i = 0; i < 4; i++)
  for (let j = 0; j < 4; j++)
    SQUARE_GRID.push([(-1.5 + i) * (2 / 3), (-1.5 + j) * (2 / 3)]);

// Hexagonal lattice (2D analog of E8) – 16 representative points
// a1 = (2/3, 0), a2 = (1/3, 1/√3·2/3)
const HEX_GRID: [number, number][] = [];
{
  const a = 0.67; // lattice constant
  const b = a * 0.866; // √3/2 * a
  for (let i = -2; i <= 2; i++) {
    for (let j = -2; j <= 2; j++) {
      const x = i * a + (j % 2 === 0 ? 0 : a / 2);
      const y = j * b;
      if (Math.abs(x) < 1.35 && Math.abs(y) < 1.35) HEX_GRID.push([x, y]);
    }
  }
}

function nearest(pt: [number, number], grid: [number, number][]): [number, number] {
  let best = grid[0];
  let bestDist = Infinity;
  for (const p of grid) {
    const d = (pt[0] - p[0]) ** 2 + (pt[1] - p[1]) ** 2;
    if (d < bestDist) { bestDist = d; best = p; }
  }
  return best;
}

function dist(a: [number, number], b: [number, number]): number {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2);
}

// SVG helpers: map from data coords [-1.5,1.5] to svg coords [10,190]
const SZ = 200;
const PAD = 12;
const scale = (v: number) => PAD + ((v + 1.4) / 2.8) * (SZ - 2 * PAD);

/* ── Component ──────────────────────────────────────────────── */

export default function E8LatticeViz() {
  const [testPt, setTestPt] = useState<[number, number]>([0.3, 0.6]);
  const [count, setCount] = useState(0);

  // Random test point (visual demo)
  const randomize = useCallback(() => {
    const x = (Math.random() - 0.5) * 2.2;
    const y = (Math.random() - 0.5) * 2.2;
    const clamp = (v: number) => Math.max(-1.3, Math.min(1.3, v));
    setTestPt([clamp(x), clamp(y)]);
    setCount((c) => c + 1);
  }, []);

  const sqNear = useMemo(() => nearest(testPt, SQUARE_GRID), [testPt]);
  const hexNear = useMemo(() => nearest(testPt, HEX_GRID), [testPt]);
  const sqErr = useMemo(() => dist(testPt, sqNear), [testPt, sqNear]);
  const hexErr = useMemo(() => dist(testPt, hexNear), [testPt, hexNear]);

  const Panel = ({
    title,
    color,
    grid,
    near,
    err,
    badge,
  }: {
    title: string;
    color: string;
    grid: [number, number][];
    near: [number, number];
    err: number;
    badge?: string;
  }) => (
    <div className="flex flex-col items-center gap-1">
      <p className={`text-[11px] font-bold ${color}`}>{title}</p>
      <svg width={SZ} height={SZ} className="rounded-lg border border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-900">
        {/* Voronoi-like cells (approximate: draw grid lines) */}
        {title.includes('스칼라') &&
          [-1, -0.333, 0.333, 1, 1.67].map((v) => (
            <line
              key={`h${v}`}
              x1={PAD}
              y1={scale(v - 0.333)}
              x2={SZ - PAD}
              y2={scale(v - 0.333)}
              stroke="#e5e7eb"
              strokeWidth={0.5}
            />
          ))}

        {/* Quantization cells highlight for nearest */}
        {title.includes('스칼라') && (
          <rect
            x={scale(near[0] - 0.333)}
            y={scale(near[1] + 0.333)}
            width={(SZ - 2 * PAD) * 0.238}
            height={(SZ - 2 * PAD) * 0.238}
            fill="#fef3c7"
            stroke="#f59e0b"
            strokeWidth={1}
          />
        )}
        {title.includes('헥사') && (
          <polygon
            points={hexNear
              ? [0, 1, 2, 3, 4, 5]
                  .map((i) => {
                    const angle = (Math.PI / 3) * i + Math.PI / 6;
                    const r = 0.38;
                    const px = scale(hexNear[0] + r * Math.cos(angle));
                    const py = scale(hexNear[1] + r * Math.sin(angle));
                    return `${px},${py}`;
                  })
                  .join(' ')
              : ''}
            fill="#fef3c7"
            stroke="#f59e0b"
            strokeWidth={1}
          />
        )}

        {/* Error line */}
        <line
          x1={scale(testPt[0])}
          y1={scale(testPt[1])}
          x2={scale(near[0])}
          y2={scale(near[1])}
          stroke="#ef4444"
          strokeWidth={1.5}
          strokeDasharray="3,2"
        />

        {/* Lattice points */}
        {grid.map(([x, y], i) => {
          const isNearest = x === near[0] && y === near[1];
          return (
            <circle
              key={i}
              cx={scale(x)}
              cy={scale(y)}
              r={isNearest ? 6 : 3.5}
              fill={isNearest ? '#f59e0b' : '#6366f1'}
              opacity={isNearest ? 1 : 0.75}
            />
          );
        })}

        {/* Test point */}
        <circle cx={scale(testPt[0])} cy={scale(testPt[1])} r={6} fill="#ef4444" stroke="#fff" strokeWidth={2} />
        <text x={scale(testPt[0]) + 8} y={scale(testPt[1]) - 6} fontSize={9} fill="#ef4444" fontWeight="bold">
          w
        </text>
      </svg>

      {/* Error metric */}
      <div className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-xs ${
        badge === 'better' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-100 dark:bg-gray-800'
      }`}>
        <span className="text-gray-600 dark:text-gray-400">양자화 오차</span>
        <span className={`font-mono font-bold ${badge === 'better' ? 'text-green-700 dark:text-green-300' : 'text-red-600 dark:text-red-400'}`}>
          {err.toFixed(3)}
          {badge === 'better' && ' ✓'}
        </span>
      </div>
    </div>
  );

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/60">
      <p className="mb-3 text-center text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        E8 격자 vs 스칼라 양자화 비교 (2D 유추)
      </p>

      <div className="flex flex-col items-start justify-center gap-6 sm:flex-row">
        <Panel
          title="스칼라 양자화 (2비트/차원)"
          color="text-red-600 dark:text-red-400"
          grid={SQUARE_GRID}
          near={sqNear}
          err={sqErr}
          badge={sqErr < hexErr ? 'better' : undefined}
        />

        <Panel
          title="헥사고널 격자 (E8 유추, 2비트)"
          color="text-green-600 dark:text-green-400"
          grid={HEX_GRID}
          near={hexNear}
          err={hexErr}
          badge={hexErr <= sqErr ? 'better' : undefined}
        />
      </div>

      {/* Improvement summary */}
      <div className="mt-4 rounded-lg bg-white p-3 dark:bg-gray-900">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">스칼라 오차</span>
          <span className="font-mono text-red-600 dark:text-red-400">{sqErr.toFixed(3)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">격자 오차</span>
          <span className="font-mono text-green-600 dark:text-green-400">{hexErr.toFixed(3)}</span>
        </div>
        <div className="mt-2 h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className="h-1.5 rounded-full bg-green-500 transition-all duration-500"
            style={{ width: `${Math.min(100, (1 - hexErr / Math.max(sqErr, 0.001)) * 100 + 50)}%` }}
          />
        </div>
        <p className="mt-1 text-center text-[11px] text-gray-500 dark:text-gray-400">
          {hexErr < sqErr
            ? `격자 코드북이 ${((1 - hexErr / sqErr) * 100).toFixed(0)}% 오차 감소`
            : '이 점에서는 격자 이점이 작음 (전체 평균은 격자 우위)'}
        </p>
      </div>

      <div className="mt-3 flex justify-center">
        <button
          onClick={randomize}
          className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-700 active:scale-95"
        >
          랜덤 테스트 포인트 ({count + 1}번째)
        </button>
      </div>

      <p className="mt-3 text-center text-[11px] italic text-gray-500 dark:text-gray-400">
        E8 격자는 8차원에서 최적 구체 패킹 → 동일 비트 수로 더 낮은 평균 왜곡
      </p>
    </div>
  );
}
