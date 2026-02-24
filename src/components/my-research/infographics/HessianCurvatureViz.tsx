'use client';

import { useState } from 'react';

const H_MATRIX = [
  [12.5, 0.3, -0.2],
  [0.3, 0.8, 0.1],
  [-0.2, 0.1, 4.2],
];

const PARAM_LABELS = ['θ₁', 'θ₂', 'θ₃'];
const TRACE = 12.5 + 0.8 + 4.2;

const BLOCKS = [
  { name: 'Block A', trace: 17.5, bitWidth: 16, color: 'red' },
  { name: 'Block B', trace: 2.1, bitWidth: 4, color: 'green' },
  { name: 'Block C', trace: 8.4, bitWidth: 8, color: 'yellow' },
];

const MAX_TRACE = Math.max(...BLOCKS.map((b) => b.trace));

function getHeatColor(value: number, maxVal: number): string {
  const t = Math.abs(value) / maxVal;
  // Blue (low) → White → Red (high)
  if (t < 0.5) {
    const s = t * 2;
    const r = Math.round(lerp(59, 255, s));
    const g = Math.round(lerp(130, 255, s));
    const b = Math.round(lerp(246, 255, s));
    return `rgb(${r},${g},${b})`;
  } else {
    const s = (t - 0.5) * 2;
    const r = Math.round(lerp(255, 220, s));
    const g = Math.round(lerp(255, 38, s));
    const b = Math.round(lerp(255, 38, s));
    return `rgb(${r},${g},${b})`;
  }
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function getBlockBarColor(color: string): { bar: string; text: string; badge: string } {
  switch (color) {
    case 'red':
      return {
        bar: 'bg-red-500',
        text: 'text-red-700 dark:text-red-300',
        badge: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300',
      };
    case 'green':
      return {
        bar: 'bg-emerald-500',
        text: 'text-emerald-700 dark:text-emerald-300',
        badge: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
      };
    case 'yellow':
      return {
        bar: 'bg-amber-500',
        text: 'text-amber-700 dark:text-amber-300',
        badge: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
      };
    default:
      return { bar: 'bg-gray-500', text: 'text-gray-700', badge: 'bg-gray-100 text-gray-700' };
  }
}

export default function HessianCurvatureViz() {
  const [hoveredCell, setHoveredCell] = useState<{ r: number; c: number } | null>(null);
  const maxAbsVal = 12.5;

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-md w-full">
      <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
        Hessian 곡률과 민감도 기반 양자화
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        손실 함수의 2차 도함수(Hessian)를 통해 파라미터 민감도를 측정하고, 블록별 비트폭을 결정합니다.
      </p>

      {/* Section 1: Hessian Matrix */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold">1</span>
          Hessian 행렬 시각화
        </h3>

        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Matrix grid */}
          <div className="flex-shrink-0">
            <div className="inline-grid gap-0.5" style={{ gridTemplateColumns: `32px repeat(3, 64px)` }}>
              {/* Header row */}
              <div />
              {PARAM_LABELS.map((l) => (
                <div
                  key={l}
                  className="h-8 flex items-center justify-center text-xs font-semibold text-gray-500 dark:text-gray-400"
                >
                  {l}
                </div>
              ))}

              {/* Data rows */}
              {H_MATRIX.map((row, r) => (
                <>
                  <div
                    key={`label-${r}`}
                    className="w-8 flex items-center justify-center text-xs font-semibold text-gray-500 dark:text-gray-400"
                  >
                    {PARAM_LABELS[r]}
                  </div>
                  {row.map((val, c) => {
                    const bgColor = getHeatColor(val, maxAbsVal);
                    const isDark = Math.abs(val) / maxAbsVal > 0.6;
                    const isHovered = hoveredCell?.r === r && hoveredCell?.c === c;
                    const isDiag = r === c;
                    return (
                      <div
                        key={`cell-${r}-${c}`}
                        className={`h-14 flex items-center justify-center text-xs font-mono rounded cursor-pointer transition-all duration-150 border-2 ${
                          isDiag ? 'border-gray-400 dark:border-gray-500' : 'border-transparent'
                        } ${isHovered ? 'scale-105 shadow-lg z-10 relative' : ''}`}
                        style={{ backgroundColor: bgColor }}
                        onMouseEnter={() => setHoveredCell({ r, c })}
                        onMouseLeave={() => setHoveredCell(null)}
                        title={`H[${PARAM_LABELS[r]},${PARAM_LABELS[c]}] = ${val}`}
                      >
                        <span
                          className="font-semibold dark:text-gray-100"
                          style={{ color: isDark ? '#f8fafc' : '#1e293b' }}
                        >
                          {val > 0 ? '' : ''}
                          {val.toFixed(1)}
                        </span>
                      </div>
                    );
                  })}
                </>
              ))}
            </div>

            {/* Color scale */}
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-gray-400">낮음</span>
              <div
                className="h-4 w-32 rounded"
                style={{
                  background: 'linear-gradient(to right, rgb(59,130,246), white, rgb(220,38,38))',
                }}
              />
              <span className="text-xs text-gray-400">높음</span>
            </div>
          </div>

          {/* Explanation */}
          <div className="flex-1 space-y-3">
            {/* Tooltip display */}
            <div
              className={`rounded-lg border px-3 py-2 text-xs transition-all duration-200 ${
                hoveredCell
                  ? 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/30'
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
              }`}
            >
              {hoveredCell ? (
                <span className="text-blue-700 dark:text-blue-300 font-mono">
                  H[{PARAM_LABELS[hoveredCell.r]},{PARAM_LABELS[hoveredCell.c]}] ={' '}
                  {H_MATRIX[hoveredCell.r][hoveredCell.c]}
                  {hoveredCell.r === hoveredCell.c ? ' (대각원소 → 민감도 직접 기여)' : ' (상호 연관 항)'}
                </span>
              ) : (
                <span className="text-gray-400">셀에 마우스를 올려 값을 확인하세요</span>
              )}
            </div>

            {/* Trace info */}
            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-3 py-3">
              <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 mb-1">
                대각원소 합산 (Trace):
              </p>
              <p className="text-xs font-mono text-amber-700 dark:text-amber-400">
                Tr(H) = 12.5 + 0.8 + 4.2 = <span className="font-bold text-amber-900 dark:text-amber-200">{TRACE.toFixed(1)}</span>
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                → 이 블록의 민감도 지표
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-3">
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                <span className="font-semibold text-gray-800 dark:text-gray-200">해석:</span>{' '}
                Tr(H)가 클수록 손실이 파라미터 변화에 민감합니다.
                민감한 블록은 낮은 비트폭 양자화 시 성능 저하가 커지므로 높은 비트폭을 할당해야 합니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Per-block sensitivity */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold">2</span>
          블록별 Hessian 민감도 → 적응형 비트폭 할당
        </h3>

        <div className="space-y-3">
          {BLOCKS.map((block) => {
            const pct = (block.trace / MAX_TRACE) * 100;
            const colors = getBlockBarColor(block.color);
            return (
              <div key={block.name} className="rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    {block.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                      Tr(H) = {block.trace}
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${colors.badge}`}
                    >
                      → {block.bitWidth}bit
                    </span>
                  </div>
                </div>
                <div className="w-full h-5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${colors.bar}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-400">0</span>
                  <span className={`text-xs font-medium ${colors.text}`}>
                    {block.color === 'red'
                      ? '높은 민감도 → 고비트폭 필요'
                      : block.color === 'green'
                      ? '낮은 민감도 → 공격적 압축 가능'
                      : '중간 민감도 → 균형 선택'}
                  </span>
                  <span className="text-xs text-gray-400">{MAX_TRACE}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-3">
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
            <span className="font-semibold text-gray-800 dark:text-gray-200">SliM-LLM / SBA 원리:</span>{' '}
            Hessian 대각 근사를 이용해 각 블록의 민감도를 빠르게 추정하고,
            민감도에 반비례하여 비트폭을 할당합니다 (Tr(H) ∝ 1/비트수 역수).
            이를 통해 동일한 평균 비트폭 예산으로 더 높은 정확도를 달성합니다.
          </p>
        </div>
      </div>
    </div>
  );
}
