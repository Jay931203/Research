'use client';

import { useState, useMemo } from 'react';

/**
 * Interactive L1/L2/Linf norm ball comparison in 2D.
 * Shows how the geometry of different unit balls differs,
 * and why L1 promotes sparsity (corners touching axes).
 */
export default function NormBallComparison() {
  const [activeNorm, setActiveNorm] = useState<'l1' | 'l2' | 'linf' | 'atomic'>('l1');

  const cx = 200;
  const cy = 200;
  const s = 120; // scale

  // L1 ball (diamond)
  const l1Points = [
    `${cx},${cy - s}`,
    `${cx + s},${cy}`,
    `${cx},${cy + s}`,
    `${cx - s},${cy}`,
  ].join(' ');

  // Linf ball (square)
  const linfPoints = [
    `${cx - s},${cy - s}`,
    `${cx + s},${cy - s}`,
    `${cx + s},${cy + s}`,
    `${cx - s},${cy + s}`,
  ].join(' ');

  // L2 ball (circle) — SVG circle element
  // Atomic norm ball — irregular polygon (convex hull of ~8 atoms at varying angles)
  const atomicAtoms = useMemo(() => {
    const angles = [0.15, 0.55, 1.1, 1.7, 2.4, 3.1, 3.8, 4.6, 5.3];
    return angles.map((a) => ({
      x: cx + Math.cos(a) * s * (0.7 + 0.3 * Math.abs(Math.sin(a * 2.3))),
      y: cy - Math.sin(a) * s * (0.7 + 0.3 * Math.abs(Math.cos(a * 1.7))),
    }));
  }, []);

  const atomicPoints = atomicAtoms.map((p) => `${p.x},${p.y}`).join(' ');

  // Sparse solution point on L1 corner
  const sparsePoint = { x: cx + s, y: cy }; // (1,0) on L1 corner

  // Sample constraint line passing through L1 corner
  const lineY1 = cy - s * 1.4;
  const lineY2 = cy + s * 1.4;
  const lineX1 = sparsePoint.x + (lineY1 - sparsePoint.y) * 0.5;
  const lineX2 = sparsePoint.x + (lineY2 - sparsePoint.y) * 0.5;

  const normConfig = {
    l1: {
      label: 'L1 Norm (Diamond)',
      color: '#6366f1',
      fill: 'rgba(99,102,241,0.12)',
      desc: 'L1 unit ball은 다이아몬드 모양입니다. 꼭짓점이 좌표축 위에 있어서, 제약 조건(직선)과 만나는 점이 축 위 — 즉 sparse한 해 — 가 될 확률이 높습니다.',
    },
    l2: {
      label: 'L2 Norm (Circle)',
      color: '#10b981',
      fill: 'rgba(16,185,129,0.12)',
      desc: 'L2 unit ball은 원입니다. 어디서든 매끄럽게 만나므로, 제약 조건과의 접점이 특별히 sparse하지 않습니다. 에너지를 고르게 분배하는 경향이 있습니다.',
    },
    linf: {
      label: 'L-inf Norm (Square)',
      color: '#f59e0b',
      fill: 'rgba(245,158,11,0.12)',
      desc: 'L-inf unit ball은 정사각형입니다. 변이 축에 평행하여, 해가 모든 성분의 최대 크기를 제한하는 방식으로 동작합니다. Sparsity를 유도하지 않습니다.',
    },
    atomic: {
      label: 'Atomic Norm (Convex Hull)',
      color: '#8b5cf6',
      fill: 'rgba(139,92,246,0.12)',
      desc: 'Atomic norm의 unit ball은 atom들의 convex hull입니다. 모양이 불규칙하며, atom의 배치에 따라 결정됩니다. L1과 유사하게 "뾰족한" 부분에서 sparse 해를 찾습니다.',
    },
  };

  const current = normConfig[activeNorm];

  return (
    <div className="concept-card mb-6">
      <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">Interactive Demo</div>
      <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Norm Ball Geometry 비교</h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
        서로 다른 norm의 unit ball(단위 공) 모양을 비교합니다.
        Norm의 기하학적 형태가 최적화 문제의 해에 어떤 영향을 주는지 확인하세요.
      </p>

      {/* Toggle buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {(Object.keys(normConfig) as Array<keyof typeof normConfig>).map((key) => (
          <button
            key={key}
            onClick={() => setActiveNorm(key)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              activeNorm === key
                ? 'border-indigo-300 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 shadow-sm'
                : 'border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            {key === 'l1' ? 'L1' : key === 'l2' ? 'L2' : key === 'linf' ? 'L-inf' : 'Atomic'}
          </button>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* SVG */}
        <div className="flex-1 flex justify-center">
          <svg
            viewBox="0 0 400 400"
            className="w-full max-w-[360px] h-auto border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800"
          >
            {/* Grid */}
            <line x1={cx} y1={30} x2={cx} y2={370} stroke="#e2e8f0" strokeWidth={0.5} />
            <line x1={30} y1={cy} x2={370} y2={cy} stroke="#e2e8f0" strokeWidth={0.5} />
            <text x={cx + 4} y={cy + 14} className="text-[10px]" fill="#94a3b8">0</text>
            <text x={cx + s + 4} y={cy + 14} className="text-[10px]" fill="#94a3b8">1</text>
            <text x={cx + 4} y={cy - s + 4} className="text-[10px]" fill="#94a3b8">1</text>

            {/* Constraint line (shown for L1) */}
            {activeNorm === 'l1' && (
              <>
                <line x1={lineX1} y1={lineY1} x2={lineX2} y2={lineY2}
                  stroke="#ef4444" strokeWidth={1.5} strokeDasharray="6 4" opacity={0.6} />
                <text x={lineX1 + 8} y={lineY1 + 10} className="text-[10px]" fill="#ef4444">
                  constraint
                </text>
              </>
            )}

            {/* Norm ball */}
            {activeNorm === 'l2' ? (
              <circle cx={cx} cy={cy} r={s} fill={current.fill} stroke={current.color} strokeWidth={2}
                style={{ transition: 'all 0.3s ease' }} />
            ) : activeNorm === 'atomic' ? (
              <polygon points={atomicPoints} fill={current.fill} stroke={current.color} strokeWidth={2}
                style={{ transition: 'all 0.3s ease' }} />
            ) : activeNorm === 'linf' ? (
              <polygon points={linfPoints} fill={current.fill} stroke={current.color} strokeWidth={2}
                style={{ transition: 'all 0.3s ease' }} />
            ) : (
              <polygon points={l1Points} fill={current.fill} stroke={current.color} strokeWidth={2}
                style={{ transition: 'all 0.3s ease' }} />
            )}

            {/* Sparse point on L1 */}
            {activeNorm === 'l1' && (
              <>
                <circle cx={sparsePoint.x} cy={sparsePoint.y} r={6}
                  fill="#22c55e" stroke="white" strokeWidth={2} />
                <text x={sparsePoint.x + 10} y={sparsePoint.y - 8} className="text-[10px] font-bold" fill="#22c55e">
                  sparse!
                </text>
              </>
            )}

            {/* Atomic norm atoms */}
            {activeNorm === 'atomic' && atomicAtoms.map((a, i) => (
              <circle key={i} cx={a.x} cy={a.y} r={3.5} fill="#8b5cf6" stroke="white" strokeWidth={1} />
            ))}

            {/* Label */}
            <text x={20} y={24} className="text-[11px] font-medium" fill={current.color}>
              {current.label}
            </text>
          </svg>
        </div>

        {/* Description */}
        <div className="flex-1 flex flex-col justify-center">
          <div className={`rounded-lg border p-4 text-sm transition-all ${
            activeNorm === 'l1' ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800'
              : activeNorm === 'l2' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
              : activeNorm === 'linf' ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
              : 'bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800'
          }`}>
            <strong className="text-slate-800 dark:text-slate-200 block mb-2">{current.label}</strong>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{current.desc}</p>
          </div>

          {activeNorm === 'l1' && (
            <div className="mt-3 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-3 text-xs text-slate-600 dark:text-slate-400">
              <strong className="text-green-800 dark:text-green-300">Sparsity 직관:</strong>{' '}
              다이아몬드의 뾰족한 꼭짓점이 좌표축 위에 있기 때문에, 제약 조건(빨간 점선)이 L1 ball과 만나는 점은 축 위가 될 가능성이 높습니다.
              축 위의 점 = 나머지 좌표가 0 = sparse한 해입니다.
            </div>
          )}

          {activeNorm === 'atomic' && (
            <div className="mt-3 rounded-lg border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-900/20 p-3 text-xs text-slate-600 dark:text-slate-400">
              <strong className="text-violet-800 dark:text-violet-300">Atomic norm은 L1의 일반화:</strong>{' '}
              표준 기저 대신 임의의 atom 집합을 사용합니다. Atom들의 convex hull이 unit ball이 되며,
              L1에서 standard basis를 atom으로 쓰면 동일한 diamond가 됩니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
