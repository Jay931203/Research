'use client';

import { useState, useMemo } from 'react';

const GRID_N = 8; // 8×8 delay-angular grid (simplified from actual N_a×N_t)

// Precomputed channel examples
// Sparse: single dominant path at delay=2, angle=4
// Dense: multiple paths spread across delay-angular plane
function generateChannel(type: 'sparse' | 'moderate' | 'dense'): number[][] {
  const grid: number[][] = Array.from({ length: GRID_N }, () => Array(GRID_N).fill(0));

  if (type === 'sparse') {
    // One dominant path, off-grid leakage
    const centerD = 2, centerA = 4;
    for (let d = 0; d < GRID_N; d++) {
      for (let a = 0; a < GRID_N; a++) {
        const distD = Math.abs(d - centerD);
        const distA = Math.abs(a - centerA);
        // Main path
        const main = Math.exp(-0.5 * (distD * distD + distA * distA));
        // Off-grid leakage in angular direction: 1/(1+|a-centerA|)
        const leakage = 0.15 / (1 + distA) * Math.exp(-distD * 0.8);
        grid[d][a] = Math.max(main, leakage);
      }
    }
  } else if (type === 'moderate') {
    // Two paths
    const paths = [
      { d: 1, a: 2, strength: 1.0 },
      { d: 3, a: 6, strength: 0.6 },
    ];
    for (const { d: pd, a: pa, strength } of paths) {
      for (let d = 0; d < GRID_N; d++) {
        for (let a = 0; a < GRID_N; a++) {
          const dist = Math.abs(d - pd) + Math.abs(a - pa);
          grid[d][a] = Math.max(grid[d][a], strength * Math.exp(-0.4 * dist));
        }
      }
    }
  } else {
    // Dense: many paths
    const paths = [
      { d: 0, a: 1, strength: 0.9 },
      { d: 1, a: 3, strength: 0.7 },
      { d: 2, a: 5, strength: 0.8 },
      { d: 3, a: 7, strength: 0.6 },
      { d: 4, a: 2, strength: 0.5 },
      { d: 5, a: 6, strength: 0.4 },
    ];
    for (const { d: pd, a: pa, strength } of paths) {
      for (let d = 0; d < GRID_N; d++) {
        for (let a = 0; a < GRID_N; a++) {
          const dist = Math.abs(d - pd) + Math.abs(a - pa);
          grid[d][a] = Math.max(grid[d][a], strength * Math.exp(-0.3 * dist));
        }
      }
    }
  }

  // Normalize
  const maxVal = Math.max(...grid.flat());
  return grid.map((row) => row.map((v) => v / maxVal));
}

// Hoyer's measure: (√N - ||v||₁/||v||₂) / (√N - 1)
function hoyer(grid: number[][]): number {
  const v = grid.flat();
  const N = v.length;
  const l1 = v.reduce((s, x) => s + Math.abs(x), 0);
  const l2 = Math.sqrt(v.reduce((s, x) => s + x * x, 0));
  if (l2 < 1e-10) return 0;
  return (Math.sqrt(N) - l1 / l2) / (Math.sqrt(N) - 1);
}

function getHeatmapColor(v: number): string {
  // Black → Dark Blue → Cyan → Yellow → White
  if (v < 0.25) {
    const t = v / 0.25;
    const r = Math.round(0 * (1 - t) + 0 * t);
    const g = Math.round(0 * (1 - t) + 30 * t);
    const b = Math.round(0 * (1 - t) + 100 * t);
    return `rgb(${r},${g},${b})`;
  } else if (v < 0.5) {
    const t = (v - 0.25) / 0.25;
    const r = Math.round(0 + 0 * t);
    const g = Math.round(30 + 130 * t);
    const b = Math.round(100 + 130 * t);
    return `rgb(${r},${g},${b})`;
  } else if (v < 0.75) {
    const t = (v - 0.5) / 0.25;
    const r = Math.round(0 + 255 * t);
    const g = Math.round(160 + 60 * t);
    const b = Math.round(230 - 230 * t);
    return `rgb(${r},${g},${b})`;
  } else {
    const t = (v - 0.75) / 0.25;
    const r = Math.round(255);
    const g = Math.round(220 + 35 * t);
    const b = Math.round(0 + 255 * t);
    return `rgb(${r},${g},${b})`;
  }
}

type ChannelType = 'sparse' | 'moderate' | 'dense';

const CHANNEL_LABELS: Record<ChannelType, string> = {
  sparse: '희소 채널 (단일 경로)',
  moderate: '중간 채널 (2개 경로)',
  dense: '밀집 채널 (다중 경로)',
};

const WEIGHT_ALPHA = 2.0;

export default function SparsityViz() {
  const [selected, setSelected] = useState<ChannelType>('sparse');

  const channels = useMemo(() => ({
    sparse: generateChannel('sparse'),
    moderate: generateChannel('moderate'),
    dense: generateChannel('dense'),
  }), []);

  const hoyerValues = useMemo(() => ({
    sparse: hoyer(channels.sparse),
    moderate: hoyer(channels.moderate),
    dense: hoyer(channels.dense),
  }), [channels]);

  const selectedChannel = channels[selected];
  const s_t = hoyerValues[selected];
  const w_t = 1 + WEIGHT_ALPHA * s_t;

  const cellSize = 36;
  const gridPx = GRID_N * cellSize;

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-md w-full">
      <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
        채널 희소성 (Hoyer 측도) 시각화
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        지연-각도 도메인 CSI의 희소성에 따라 온라인 선택 가중치 w_t가 달라집니다.
        희소한 채널일수록 양자화 오차에 민감하므로 더 높은 신뢰성 비용을 부여합니다.
      </p>

      {/* Channel type selector */}
      <div className="flex flex-wrap gap-2 mb-5">
        {(['sparse', 'moderate', 'dense'] as ChannelType[]).map((type) => (
          <button
            key={type}
            onClick={() => setSelected(type)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
              selected === type
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {CHANNEL_LABELS[type]}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        {/* Heatmap */}
        <div className="flex-shrink-0">
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 text-center">
            지연-각도 도메인 |X[ℓ, a]|
          </p>
          <div className="inline-block">
            {/* Column labels */}
            <div className="flex" style={{ marginLeft: 28 }}>
              {Array.from({ length: GRID_N }, (_, a) => (
                <div key={a} className="text-[9px] text-gray-400 text-center" style={{ width: cellSize }}>
                  {a}
                </div>
              ))}
            </div>
            {selectedChannel.map((row, d) => (
              <div key={d} className="flex items-center">
                <div className="text-[9px] text-gray-400 text-right pr-1" style={{ width: 24 }}>
                  {d}
                </div>
                {row.map((val, a) => (
                  <div
                    key={a}
                    className="border border-gray-800/10 dark:border-gray-700/30 transition-all duration-300"
                    style={{
                      width: cellSize,
                      height: cellSize,
                      backgroundColor: getHeatmapColor(val),
                    }}
                    title={`지연 탭 ℓ=${d}, 각도 빈 a=${a}: |X|=${val.toFixed(2)}`}
                  />
                ))}
              </div>
            ))}
            <div className="flex justify-between mt-1" style={{ marginLeft: 28 }}>
              <span className="text-[9px] text-gray-400">← 각도 도메인 →</span>
            </div>
            <div className="mt-1 flex items-center gap-2" style={{ marginLeft: 28 }}>
              <span className="text-[9px] text-gray-400">0</span>
              <div className="h-2.5 flex-1 rounded" style={{
                background: 'linear-gradient(to right, rgb(0,0,0), rgb(0,30,100), rgb(0,160,230), rgb(255,220,0), white)'
              }} />
              <span className="text-[9px] text-gray-400">1</span>
            </div>
            <div className="mt-0.5 flex gap-2 text-[9px] text-gray-400 justify-between" style={{ marginLeft: 28, marginRight: 16 }}>
              <span>지연 지수: 0 (좌측)</span>
            </div>
          </div>
        </div>

        {/* Metrics panel */}
        <div className="flex-1 space-y-4">
          <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 px-4 py-4">
            <p className="text-xs font-bold text-blue-700 dark:text-blue-300 mb-3">채널 희소성 지표</p>

            {/* Hoyer bars for all three types */}
            {(['sparse', 'moderate', 'dense'] as ChannelType[]).map((type) => {
              const h = hoyerValues[type];
              const isSelected = type === selected;
              return (
                <div key={type} className={`mb-3 last:mb-0 transition-all duration-200 ${isSelected ? 'opacity-100' : 'opacity-50'}`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-700 dark:text-gray-300">{CHANNEL_LABELS[type]}</span>
                    <span className="text-xs font-mono font-bold text-blue-700 dark:text-blue-300">
                      s_t = {h.toFixed(3)}
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${h * 100}%`,
                        background: isSelected
                          ? 'linear-gradient(to right, #6366f1, #818cf8)'
                          : '#9ca3af',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sparsity weight */}
          <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 px-4 py-4">
            <p className="text-xs font-bold text-amber-700 dark:text-amber-300 mb-2">
              온라인 적응형 가중치
            </p>
            <div className="font-mono text-sm text-amber-800 dark:text-amber-200 mb-2">
              w_t = 1 + α·s_t = 1 + {WEIGHT_ALPHA}×{s_t.toFixed(3)} ={' '}
              <span className="font-bold text-lg">{w_t.toFixed(3)}</span>
            </div>
            <p className="text-xs text-amber-700 dark:text-amber-400">
              {selected === 'sparse'
                ? `희소 채널 → w_t = ${w_t.toFixed(2)}로 높음. 양자화 오차에 민감하므로 신뢰성 비용을 ${w_t.toFixed(2)}배 강조.`
                : selected === 'dense'
                ? `밀집 채널 → w_t = ${w_t.toFixed(2)}로 낮음. 에너지 분산으로 상대적으로 견고함.`
                : `중간 채널 → w_t = ${w_t.toFixed(2)}. 희소성에 비례한 신뢰성 강조.`
              }
            </p>
          </div>

          <div className="rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-3">
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              <span className="font-semibold text-gray-800 dark:text-gray-200">Hoyer 측도:</span>{' '}
              s_t ∈ [0,1], 1에 가까울수록 에너지가 소수 계수에 집중 (희소). 0에 가까울수록 에너지가 고르게 분산.
              희소한 채널은 양자화로 인해 지배적 경로 정보가 손실될 위험이 커서 높은 w_t를 부여합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
