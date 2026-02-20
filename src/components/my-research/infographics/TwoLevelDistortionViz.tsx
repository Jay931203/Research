'use client';

import { useState } from 'react';

// Real NMSE data from the paper (dB)
// Positive value = bad (NMSE > 0 dB means reconstruction worse than trivial)
const PAPER_DATA = {
  CsiNet: {
    FP32: -8.95,
    INT16: -8.95,
    INT8: 0.68,
    INT4: 17.35,
  },
  Mamba: {
    FP32: -15.34,
    INT16: -15.34,
    INT8: -15.12,
    INT4: 0.04,
  },
} as const;

type ModelKey = 'CsiNet' | 'Mamba';
type PrecKey = 'INT16' | 'INT8' | 'INT4';

// Normalize to display range: map dB to 0-1 "badness" score
// -15.34 dB = best, 17.35 dB = worst
const BEST = -15.34;
const WORST = 20.0;
function toDisplay(nmse: number): number {
  return Math.max(0, Math.min(1, (nmse - BEST) / (WORST - BEST)));
}

const PRECISIONS: PrecKey[] = ['INT16', 'INT8', 'INT4'];
const PREC_LABELS: Record<PrecKey, string> = {
  INT16: 'INT16 (75% 절약)',
  INT8: 'INT8 (87.5% 절약)',
  INT4: 'INT4 (93.75% 절약)',
};

const MODEL_COLORS = {
  CsiNet: { floor: '#f87171', op: '#fca5a5', label: 'CsiNet (기존)' },
  Mamba: { floor: '#6366f1', op: '#a5b4fc', label: 'Mamba-Transformer (제안)' },
};

export default function TwoLevelDistortionViz() {
  const [hoveredBar, setHoveredBar] = useState<{ model: ModelKey; prec: PrecKey } | null>(null);
  const [highlight, setHighlight] = useState<ModelKey | null>(null);

  const MODELS: ModelKey[] = ['CsiNet', 'Mamba'];

  // Bar widths (SVG)
  const svgH = 260;
  const svgW = 560;
  const padL = 60;
  const padR = 20;
  const padT = 20;
  const padB = 50;
  const plotH = svgH - padT - padB;
  const plotW = svgW - padL - padR;

  const numBars = PRECISIONS.length * MODELS.length; // 3 * 2 = 6
  const groupW = plotW / PRECISIONS.length;
  const barW = groupW * 0.3;
  const barGap = groupW * 0.05;

  function barX(precIdx: number, modelIdx: number) {
    const groupLeft = padL + precIdx * groupW;
    const barOffset = (groupW - (MODELS.length * barW + barGap)) / 2;
    return groupLeft + barOffset + modelIdx * (barW + barGap);
  }

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-md w-full">
      <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
        두 단계 왜곡 분해 (논문 핵심 기여)
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
        전체 왜곡 = <span className="font-semibold text-indigo-600 dark:text-indigo-400">인코더 정보 하한 (floor)</span> +{' '}
        <span className="font-semibold text-orange-600 dark:text-orange-400">운영적 열화 (operational)</span>.
        양자화 정밀도를 낮춰도 floor는 고정되고, operational만 증가합니다.
      </p>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-4">
        {MODELS.map((m) => {
          const c = MODEL_COLORS[m];
          return (
            <button
              key={m}
              onClick={() => setHighlight(highlight === m ? null : m)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${
                highlight === null || highlight === m
                  ? 'opacity-100'
                  : 'opacity-40'
              } ${
                m === 'Mamba'
                  ? 'border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300'
                  : 'border-red-300 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-950/30 dark:text-red-300'
              }`}
            >
              <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: c.floor }} />
              {c.label}
            </button>
          );
        })}
        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm inline-block bg-indigo-500 opacity-60" />
            인코더 하한 (floor)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm inline-block bg-orange-400" />
            운영적 열화 (quantization)
          </span>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${svgW} ${svgH}`} width="100%" height={svgH} className="block">
          {/* Y-axis grid lines */}
          {[0, 0.25, 0.5, 0.75, 1.0].map((v) => {
            const y = padT + (1 - v) * plotH;
            // Map back to NMSE dB for labels
            const nmseLabel = (BEST + v * (WORST - BEST)).toFixed(0);
            return (
              <g key={v}>
                <line x1={padL} y1={y} x2={svgW - padR} y2={y}
                  stroke="#e5e7eb" strokeWidth={0.5} strokeDasharray="4,3"
                  className="dark:stroke-gray-700"
                />
                <text x={padL - 5} y={y + 3} textAnchor="end" fontSize={8} fill="#9ca3af">
                  {v === 0 ? '좋음' : v === 1 ? '나쁨' : `${nmseLabel}dB`}
                </text>
              </g>
            );
          })}

          {/* X-axis */}
          <line x1={padL} y1={padT + plotH} x2={svgW - padR} y2={padT + plotH}
            stroke="#9ca3af" strokeWidth={0.5} />

          {/* Bars */}
          {PRECISIONS.map((prec, pi) => {
            const groupCenterX = padL + (pi + 0.5) * groupW;
            return (
              <g key={prec}>
                {/* Group label */}
                <text x={groupCenterX} y={svgH - 5} textAnchor="middle" fontSize={9} fill="#6b7280" fontWeight="bold">
                  {prec}
                </text>
                <text x={groupCenterX} y={svgH - 16} textAnchor="middle" fontSize={7} fill="#9ca3af">
                  {prec === 'INT16' ? '75%' : prec === 'INT8' ? '87.5%' : '93.75%'} BOP 절약
                </text>

                {MODELS.map((model, mi) => {
                  const c = MODEL_COLORS[model];
                  const fp32NMSE = PAPER_DATA[model].FP32;
                  const precNMSE = PAPER_DATA[model][prec];

                  // floor = FP32 value mapped to display
                  const floorDisplay = toDisplay(fp32NMSE);
                  // total = precision value mapped to display
                  const totalDisplay = toDisplay(precNMSE);
                  // operational = total - floor (capped at 0)
                  const opDisplay = Math.max(0, totalDisplay - floorDisplay);

                  const x = barX(pi, mi);
                  const isHovered = hoveredBar?.model === model && hoveredBar?.prec === prec;
                  const isDimmed = highlight !== null && highlight !== model;

                  const totalBarH = totalDisplay * plotH;
                  const floorBarH = floorDisplay * plotH;
                  const opBarH = opDisplay * plotH;

                  const totalY = padT + plotH - totalBarH;
                  const floorY = padT + plotH - floorBarH;

                  return (
                    <g
                      key={model}
                      opacity={isDimmed ? 0.25 : 1}
                      onMouseEnter={() => setHoveredBar({ model, prec })}
                      onMouseLeave={() => setHoveredBar(null)}
                      className="cursor-pointer transition-opacity duration-200"
                    >
                      {/* Operational part (top, orange) */}
                      {opBarH > 0.5 && (
                        <rect
                          x={x} y={totalY}
                          width={barW} height={opBarH}
                          rx={opBarH < 3 ? 0 : 2}
                          fill="#fb923c"
                          opacity={isHovered ? 1 : 0.85}
                        >
                          <title>{model} {prec} 운영적 열화: +{(precNMSE - fp32NMSE).toFixed(1)} dB</title>
                        </rect>
                      )}
                      {/* Floor part (bottom, model color) */}
                      <rect
                        x={x} y={floorY}
                        width={barW} height={floorBarH}
                        rx={2}
                        fill={c.floor}
                        opacity={isHovered ? 1 : 0.85}
                      >
                        <title>{model} 정보 하한: {fp32NMSE} dB</title>
                      </rect>

                      {/* Value label on top */}
                      <text
                        x={x + barW / 2} y={totalY - 3}
                        textAnchor="middle" fontSize={7.5}
                        fill={precNMSE > 5 ? '#ef4444' : '#6b7280'}
                        fontWeight={isHovered ? 'bold' : 'normal'}
                      >
                        {precNMSE.toFixed(1)}
                      </text>
                    </g>
                  );
                })}

                {/* Group divider */}
                {pi < PRECISIONS.length - 1 && (
                  <line
                    x1={padL + (pi + 1) * groupW} y1={padT}
                    x2={padL + (pi + 1) * groupW} y2={padT + plotH}
                    stroke="#f3f4f6" strokeWidth={1}
                    className="dark:stroke-gray-800"
                  />
                )}
              </g>
            );
          })}

          {/* Y-axis label */}
          <text x={10} y={padT + plotH / 2} textAnchor="middle" fontSize={8} fill="#9ca3af"
            transform={`rotate(-90, 10, ${padT + plotH / 2})`}>
            NMSE (dB) / 왜곡 (높을수록 나쁨)
          </text>
        </svg>
      </div>

      {/* Hover tooltip */}
      {hoveredBar && (
        <div className="mt-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 px-4 py-2 text-xs">
          <span className="font-semibold text-indigo-700 dark:text-indigo-300">
            {hoveredBar.model} @ {hoveredBar.prec}:
          </span>{' '}
          <span className="text-indigo-600 dark:text-indigo-400">
            FP32 하한 {PAPER_DATA[hoveredBar.model].FP32} dB,{' '}
            {hoveredBar.prec} 실제 {PAPER_DATA[hoveredBar.model][hoveredBar.prec]} dB
            {PAPER_DATA[hoveredBar.model][hoveredBar.prec] > PAPER_DATA[hoveredBar.model].FP32 + 0.5
              ? ` (+${(PAPER_DATA[hoveredBar.model][hoveredBar.prec] - PAPER_DATA[hoveredBar.model].FP32).toFixed(1)} dB 운영적 열화)`
              : ' → 하한에 근접 (양자화 내성 우수)'}
          </span>
        </div>
      )}

      {/* Insight box */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 px-4 py-3">
          <p className="text-xs font-bold text-red-700 dark:text-red-300 mb-1">CsiNet (기존)</p>
          <p className="text-xs text-red-600 dark:text-red-400 leading-relaxed">
            INT8에서 이미 NMSE가 0.68 dB로 급등. <strong>운영적 열화가 지배적</strong>.
            낮은 비트폭에서 floor 위로 급격한 왜곡이 추가됩니다.
          </p>
        </div>
        <div className="rounded-lg bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 px-4 py-3">
          <p className="text-xs font-bold text-indigo-700 dark:text-indigo-300 mb-1">Mamba-Transformer (제안)</p>
          <p className="text-xs text-indigo-600 dark:text-indigo-400 leading-relaxed">
            INT8에서도 -15.12 dB 유지. <strong>낮은 floor + 강한 양자화 내성</strong>.
            운영적 열화가 INT4에 이르러서야 의미 있게 나타납니다.
          </p>
        </div>
      </div>
    </div>
  );
}
