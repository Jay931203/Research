'use client';

import { useState } from 'react';

// Budget levels: average encoder BOP saving vs FP32
const SAVINGS = [0.75, 0.80, 0.85, 0.88, 0.90, 0.92, 0.93, 0.94, 0.95];

// Synthetic outage probability curves for γ=0.99
// Uniform INT4/8/16 blends (uniform precision for each BOP saving)
// Static Mixed: offline only, no online adaptation
// RP-MPQ: online, reliability-aware
const CURVE_DATA: Record<string, Record<string, number[]>> = {
  '0.99': {
    uniform:     [0.16, 0.19, 0.23, 0.27, 0.30, 0.33, 0.35, 0.38, 0.42],
    staticMixed: [0.10, 0.12, 0.15, 0.17, 0.19, 0.21, 0.23, 0.26, 0.30],
    rpMpq:       [0.04, 0.05, 0.06, 0.07, 0.08, 0.09, 0.10, 0.11, 0.13],
  },
  '0.98': {
    uniform:     [0.09, 0.11, 0.14, 0.17, 0.20, 0.22, 0.25, 0.28, 0.33],
    staticMixed: [0.05, 0.07, 0.09, 0.11, 0.13, 0.15, 0.17, 0.20, 0.24],
    rpMpq:       [0.02, 0.03, 0.04, 0.04, 0.05, 0.06, 0.07, 0.08, 0.09],
  },
  '0.95': {
    uniform:     [0.03, 0.05, 0.07, 0.09, 0.11, 0.13, 0.15, 0.17, 0.21],
    staticMixed: [0.02, 0.03, 0.04, 0.05, 0.07, 0.08, 0.10, 0.12, 0.15],
    rpMpq:       [0.005, 0.01, 0.01, 0.02, 0.02, 0.03, 0.03, 0.04, 0.05],
  },
};

type GammaKey = '0.99' | '0.98' | '0.95';

const POLICIES = [
  { key: 'uniform', label: 'Uniform 양자화', color: '#ef4444', dash: '' },
  { key: 'staticMixed', label: 'Static Mixed', color: '#f59e0b', dash: '4,2' },
  { key: 'rpMpq', label: 'RP-MPQ (제안)', color: '#10b981', dash: '' },
] as const;

export default function BudgetOutageViz() {
  const [gamma, setGamma] = useState<GammaKey>('0.99');
  const [hoveredX, setHoveredX] = useState<number | null>(null);

  const svgW = 540;
  const svgH = 280;
  const padL = 60;
  const padR = 20;
  const padT = 20;
  const padB = 48;
  const plotW = svgW - padL - padR;
  const plotH = svgH - padT - padB;

  const xMin = 0.75, xMax = 0.95;
  const yMin = 0, yMax = 0.45;

  function xPos(saving: number) {
    return padL + ((saving - xMin) / (xMax - xMin)) * plotW;
  }
  function yPos(p: number) {
    return padT + (1 - (p - yMin) / (yMax - yMin)) * plotH;
  }

  const curveData = CURVE_DATA[gamma];

  function polyPoints(key: string) {
    return SAVINGS.map((s, i) => `${xPos(s).toFixed(1)},${yPos(curveData[key][i]).toFixed(1)}`).join(' ');
  }

  // Hover interaction: find closest savings index
  const hoveredIdx = hoveredX !== null
    ? Math.round(((hoveredX - padL) / plotW) * (SAVINGS.length - 1))
    : null;
  const safeHoveredIdx = hoveredIdx !== null && hoveredIdx >= 0 && hoveredIdx < SAVINGS.length ? hoveredIdx : null;

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-md w-full">
      <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
        예산-아웃에이지 트레이드오프 (파레토 곡선)
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        동일한 평균 UE 연산 예산(BOP 절약)에서 방식별 아웃에이지 확률.
        RP-MPQ는 모든 예산 수준에서 일관되게 아웃에이지를 낮춥니다.
      </p>

      {/* Gamma selector */}
      <div className="flex items-center gap-3 mb-5">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">신뢰도 목표 γ:</span>
        {(['0.99', '0.98', '0.95'] as GammaKey[]).map((g) => (
          <button
            key={g}
            onClick={() => setGamma(g)}
            className={`px-3 py-1 rounded-full text-sm font-mono font-medium transition-all duration-200 ${
              gamma === g
                ? 'bg-indigo-500 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            γ={g}
          </button>
        ))}
      </div>

      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          width="100%"
          height={svgH}
          className="block cursor-crosshair"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const scale = svgW / rect.width;
            const rawX = (e.clientX - rect.left) * scale;
            if (rawX >= padL && rawX <= svgW - padR) {
              setHoveredX(rawX);
            }
          }}
          onMouseLeave={() => setHoveredX(null)}
        >
          {/* Grid lines */}
          {[0, 0.1, 0.2, 0.3, 0.4].map((v) => (
            <g key={v}>
              <line x1={padL} y1={yPos(v)} x2={svgW - padR} y2={yPos(v)}
                stroke="#e5e7eb" strokeWidth={0.5} strokeDasharray="4,3"
                className="dark:stroke-gray-700"
              />
              <text x={padL - 5} y={yPos(v) + 3} textAnchor="end" fontSize={10} fill="#9ca3af">
                {(v * 100).toFixed(0)}%
              </text>
            </g>
          ))}
          {SAVINGS.map((s) => (
            <line key={s} x1={xPos(s)} y1={padT} x2={xPos(s)} y2={padT + plotH}
              stroke="#f3f4f6" strokeWidth={0.5}
              className="dark:stroke-gray-800"
            />
          ))}

          {/* Axes */}
          <line x1={padL} y1={padT + plotH} x2={svgW - padR} y2={padT + plotH}
            stroke="#9ca3af" strokeWidth={0.8} />
          <line x1={padL} y1={padT} x2={padL} y2={padT + plotH}
            stroke="#9ca3af" strokeWidth={0.8} />

          {/* X-axis labels */}
          {SAVINGS.filter((_, i) => i % 2 === 0).map((s) => (
            <text key={s} x={xPos(s)} y={padT + plotH + 13} textAnchor="middle" fontSize={10} fill="#6b7280">
              {(s * 100).toFixed(0)}%
            </text>
          ))}

          {/* Axis labels */}
          <text x={padL + plotW / 2} y={svgH - 4} textAnchor="middle" fontSize={11} fill="#9ca3af">
            평균 BOP 절약 (vs FP32) →
          </text>
          <text x={10} y={padT + plotH / 2} textAnchor="middle" fontSize={11} fill="#9ca3af"
            transform={`rotate(-90, 10, ${padT + plotH / 2})`}>
            아웃에이지 확률
          </text>

          {/* Shaded improvement area between staticMixed and rpMpq */}
          <polygon
            points={[
              ...SAVINGS.map((s, i) => `${xPos(s).toFixed(1)},${yPos(curveData.staticMixed[i]).toFixed(1)}`),
              ...[...SAVINGS].reverse().map((s, i) => {
                const ri = SAVINGS.length - 1 - i;
                return `${xPos(s).toFixed(1)},${yPos(curveData.rpMpq[ri]).toFixed(1)}`;
              }),
            ].join(' ')}
            fill="#10b981"
            fillOpacity={0.08}
          />

          {/* Curves */}
          {POLICIES.map(({ key, color, dash }) => (
            <polyline
              key={key}
              points={polyPoints(key)}
              fill="none"
              stroke={color}
              strokeWidth={key === 'rpMpq' ? 2.5 : 1.8}
              strokeDasharray={dash || undefined}
              opacity={0.9}
            />
          ))}

          {/* Dots on curves */}
          {POLICIES.map(({ key, color }) =>
            SAVINGS.map((s, i) => (
              <circle
                key={`${key}-${i}`}
                cx={xPos(s)} cy={yPos(curveData[key][i])}
                r={safeHoveredIdx === i ? 6 : 4}
                fill={color}
                opacity={safeHoveredIdx === i ? 1 : 0.7}
                className="transition-all duration-100"
              >
                <title>
                  {key} @ {(s*100).toFixed(0)}% saving: {(curveData[key][i]*100).toFixed(1)}% outage
                </title>
              </circle>
            ))
          )}

          {/* Hover vertical line */}
          {hoveredX !== null && (
            <line x1={hoveredX} y1={padT} x2={hoveredX} y2={padT + plotH}
              stroke="#6b7280" strokeWidth={1} strokeDasharray="4,3" opacity={0.5} />
          )}

          {/* Legend */}
          <g transform={`translate(${padL + 8}, ${padT + 8})`}>
            {POLICIES.map(({ label, color, dash }, i) => (
              <g key={label} transform={`translate(0, ${i * 16})`}>
                <line x1={0} y1={6} x2={20} y2={6}
                  stroke={color} strokeWidth={2}
                  strokeDasharray={dash || undefined} />
                <text x={24} y={10} fontSize={10} fill={color} fontWeight="bold">{label}</text>
              </g>
            ))}
          </g>
        </svg>
      </div>

      {/* Hover tooltip */}
      {safeHoveredIdx !== null && (
        <div className="mt-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2">
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
            BOP 절약 {(SAVINGS[safeHoveredIdx] * 100).toFixed(0)}% @ γ={gamma}
          </p>
          <div className="flex flex-wrap gap-3">
            {POLICIES.map(({ key, label, color }) => (
              <span key={key} className="text-xs font-mono" style={{ color }}>
                {label}: {(curveData[key][safeHoveredIdx] * 100).toFixed(1)}%
              </span>
            ))}
          </div>
          {safeHoveredIdx !== null && (
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              RP-MPQ 개선: Uniform 대비{' '}
              {Math.round((1 - curveData.rpMpq[safeHoveredIdx] / curveData.uniform[safeHoveredIdx]) * 100)}% 낮은 아웃에이지
            </p>
          )}
        </div>
      )}

      {/* Insight note */}
      <div className="mt-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 px-4 py-3">
        <p className="text-xs text-green-700 dark:text-green-300 leading-relaxed">
          <span className="font-bold">핵심 관찰:</span>{' '}
          예산이 증가할수록(더 많이 절약) 아웃에이지가 높아지지만, RP-MPQ는 실시간 채널 상태에 따라
          적응적으로 정책을 선택하여 일관되게 낮은 아웃에이지를 유지합니다.
          곡선 간 간격은 고예산 영역에서 더 커지며, RP-MPQ의 이점이 극적화됩니다.
        </p>
      </div>
    </div>
  );
}
