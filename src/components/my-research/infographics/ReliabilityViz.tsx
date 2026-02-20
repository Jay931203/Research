'use client';

import { useState, useMemo } from 'react';

type GammaKey = '0.99' | '0.98' | '0.95';

const NUM_SAMPLES = 20;

// Synthetic data: reference rates vary, reconstruction slightly below
const REF_RATES = [
  0.82, 0.91, 0.75, 0.88, 0.95, 0.70, 0.93, 0.85, 0.79, 0.97,
  0.72, 0.90, 0.84, 0.68, 0.96, 0.88, 0.77, 0.93, 0.80, 0.91,
];
const HAT_RATES = [
  0.79, 0.89, 0.71, 0.85, 0.94, 0.65, 0.91, 0.83, 0.75, 0.96,
  0.68, 0.88, 0.81, 0.63, 0.95, 0.86, 0.73, 0.91, 0.77, 0.89,
];

const OUTAGE_DATA: Record<GammaKey, { uniform: number; staticMixed: number; rpMpq: number }> = {
  '0.99': { uniform: 0.32, staticMixed: 0.18, rpMpq: 0.07 },
  '0.98': { uniform: 0.21, staticMixed: 0.12, rpMpq: 0.04 },
  '0.95': { uniform: 0.09, staticMixed: 0.05, rpMpq: 0.01 },
};

const GAMMA_VALUES: GammaKey[] = ['0.99', '0.98', '0.95'];

const CHART_POLICIES = [
  { key: 'uniform', label: 'Uniform INT4', color: '#ef4444' },
  { key: 'staticMixed', label: 'Static Mixed', color: '#f59e0b' },
  { key: 'rpMpq', label: 'RP-MPQ Online', color: '#10b981' },
];

export default function ReliabilityViz() {
  const [gammaKey, setGammaKey] = useState<GammaKey>('0.99');

  const gammaVal = parseFloat(gammaKey);

  // Determine outage events
  const outageFlags = useMemo(
    () => HAT_RATES.map((rhat, i) => rhat < parseFloat(gammaKey) * REF_RATES[i]),
    [gammaKey]
  );

  // SVG dimensions for rate chart
  const svgW = 560;
  const svgH = 180;
  const padL = 44;
  const padR = 12;
  const padT = 16;
  const padB = 32;
  const plotW = svgW - padL - padR;
  const plotH = svgH - padT - padB;

  function xPos(i: number) {
    return padL + (i / (NUM_SAMPLES - 1)) * plotW;
  }
  function yPos(val: number) {
    return padT + (1 - val) * plotH;
  }

  // Build polyline points
  const refPoints = REF_RATES.map((r, i) => `${xPos(i)},${yPos(r)}`).join(' ');
  const hatPoints = HAT_RATES.map((r, i) => `${xPos(i)},${yPos(r)}`).join(' ');

  // Gamma threshold: for each sample, threshold = gamma * r_ref
  const thresholdPoints = REF_RATES.map((r, i) => `${xPos(i)},${yPos(gammaVal * r)}`).join(' ');

  // Bar chart dimensions
  const barSvgW = 500;
  const barSvgH = 140;
  const barPadL = 120;
  const barPadR = 20;
  const barPadT = 16;
  const barPadB = 28;
  const barPlotW = barSvgW - barPadL - barPadR;
  const barPlotH = barSvgH - barPadT - barPadB;

  const outageData = OUTAGE_DATA[gammaKey];
  const barValues = [outageData.uniform, outageData.staticMixed, outageData.rpMpq];
  const maxBar = 0.4;

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-md w-full">
      <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
        신뢰도 (아웃에이지) 시각화
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        CSI 재구성 기반 전송률이 기준치 γ 아래로 떨어지는 아웃에이지 이벤트와 방식별 비교.
      </p>

      {/* Gamma toggle */}
      <div className="flex items-center gap-2 mb-5">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">신뢰도 임계값 γ:</span>
        {GAMMA_VALUES.map((g) => (
          <button
            key={g}
            onClick={() => setGammaKey(g)}
            className={`px-3 py-1 rounded-full text-sm font-mono font-medium transition-all duration-200 ${
              gammaKey === g
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            γ={g}
          </button>
        ))}
      </div>

      {/* Rate comparison chart */}
      <div className="mb-2">
        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
          CSI 실현 샘플별 달성 전송률
        </p>
        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${svgW} ${svgH}`}
            width="100%"
            height={svgH}
            className="block"
          >
            {/* Y-axis grid lines */}
            {[0.6, 0.7, 0.8, 0.9, 1.0].map((v) => (
              <g key={v}>
                <line
                  x1={padL}
                  y1={yPos(v)}
                  x2={svgW - padR}
                  y2={yPos(v)}
                  stroke="#e5e7eb"
                  strokeWidth={0.5}
                  strokeDasharray="4,3"
                  className="dark:stroke-gray-700"
                />
                <text
                  x={padL - 4}
                  y={yPos(v) + 3}
                  textAnchor="end"
                  fontSize={9}
                  fill="#9ca3af"
                >
                  {v.toFixed(1)}
                </text>
              </g>
            ))}

            {/* X-axis */}
            <line
              x1={padL}
              y1={padT + plotH}
              x2={svgW - padR}
              y2={padT + plotH}
              stroke="#9ca3af"
              strokeWidth={0.5}
            />

            {/* Gamma threshold curve (red dashed) */}
            <polyline
              points={thresholdPoints}
              fill="none"
              stroke="#ef4444"
              strokeWidth={1}
              strokeDasharray="4,3"
              opacity={0.7}
            />

            {/* r_ref line (gray dashed) */}
            <polyline
              points={refPoints}
              fill="none"
              stroke="#9ca3af"
              strokeWidth={1.5}
              strokeDasharray="5,3"
            />

            {/* r_hat line (blue) */}
            <polyline
              points={hatPoints}
              fill="none"
              stroke="#3b82f6"
              strokeWidth={2}
            />

            {/* Dots for r_hat, outage events highlighted red */}
            {HAT_RATES.map((r, i) => {
              const isOutage = outageFlags[i];
              return (
                <circle
                  key={i}
                  cx={xPos(i)}
                  cy={yPos(r)}
                  r={isOutage ? 5 : 3}
                  fill={isOutage ? '#ef4444' : '#3b82f6'}
                  stroke={isOutage ? '#dc2626' : '#2563eb'}
                  strokeWidth={isOutage ? 1.5 : 0}
                  className="transition-all duration-300"
                >
                  <title>
                    샘플 {i + 1}: r̂={r.toFixed(2)}, r_ref={REF_RATES[i].toFixed(2)}, γ*r_ref={(gammaVal * REF_RATES[i]).toFixed(2)}
                    {isOutage ? ' ⚠ 아웃에이지!' : ''}
                  </title>
                </circle>
              );
            })}

            {/* X-axis labels */}
            {[1, 5, 10, 15, 20].map((v) => (
              <text
                key={v}
                x={xPos(v - 1)}
                y={padT + plotH + 14}
                textAnchor="middle"
                fontSize={8}
                fill="#9ca3af"
              >
                {v}
              </text>
            ))}

            {/* Axis labels */}
            <text x={padL + plotW / 2} y={svgH - 2} textAnchor="middle" fontSize={9} fill="#9ca3af">
              CSI 실현 샘플 인덱스
            </text>
            <text
              x={8}
              y={padT + plotH / 2}
              textAnchor="middle"
              fontSize={9}
              fill="#9ca3af"
              transform={`rotate(-90, 8, ${padT + plotH / 2})`}
            >
              전송률
            </text>

            {/* Legend */}
            <g transform={`translate(${padL + 8}, ${padT + 6})`}>
              <line x1={0} y1={5} x2={18} y2={5} stroke="#9ca3af" strokeWidth={1.5} strokeDasharray="4,2" />
              <text x={22} y={9} fontSize={8} fill="#9ca3af">r_ref (기준)</text>
              <line x1={0} y1={18} x2={18} y2={18} stroke="#3b82f6" strokeWidth={2} />
              <text x={22} y={22} fontSize={8} fill="#3b82f6">r̂ (재구성)</text>
              <line x1={0} y1={31} x2={18} y2={31} stroke="#ef4444" strokeWidth={1} strokeDasharray="3,2" />
              <text x={22} y={35} fontSize={8} fill="#ef4444">γ·r_ref (임계값)</text>
              <circle cx={9} cy={43} r={4} fill="#ef4444" />
              <text x={22} y={47} fontSize={8} fill="#ef4444">아웃에이지 이벤트</text>
            </g>
          </svg>
        </div>

        {/* Outage count summary */}
        <div className="flex justify-end mt-1">
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full transition-all duration-300 ${
              outageFlags.filter(Boolean).length > 5
                ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
                : outageFlags.filter(Boolean).length > 2
                ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
                : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
            }`}
          >
            아웃에이지: {outageFlags.filter(Boolean).length}/{NUM_SAMPLES} 샘플 (γ={gammaKey})
          </span>
        </div>
      </div>

      {/* Policy comparison bar chart */}
      <div className="mt-4">
        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
          동일한 평균 UE 연산 예산 하에서 아웃에이지 확률 비교 (γ={gammaKey})
        </p>
        <div className="w-full overflow-x-auto">
          <svg viewBox={`0 0 ${barSvgW} ${barSvgH}`} width="100%" height={barSvgH} className="block">
            {/* Y-axis grid */}
            {[0, 0.1, 0.2, 0.3, 0.4].map((v) => (
              <g key={v}>
                <line
                  x1={barPadL}
                  y1={barPadT + (1 - v / maxBar) * barPlotH}
                  x2={barSvgW - barPadR}
                  y2={barPadT + (1 - v / maxBar) * barPlotH}
                  stroke="#e5e7eb"
                  strokeWidth={0.5}
                  strokeDasharray="3,2"
                  className="dark:stroke-gray-700"
                />
                <text
                  x={barPadL - 4}
                  y={barPadT + (1 - v / maxBar) * barPlotH + 3}
                  textAnchor="end"
                  fontSize={8}
                  fill="#9ca3af"
                >
                  {(v * 100).toFixed(0)}%
                </text>
              </g>
            ))}

            {/* X-axis */}
            <line
              x1={barPadL}
              y1={barPadT + barPlotH}
              x2={barSvgW - barPadR}
              y2={barPadT + barPlotH}
              stroke="#9ca3af"
              strokeWidth={0.5}
            />

            {/* Bars */}
            {CHART_POLICIES.map((policy, pi) => {
              const val = barValues[pi];
              const barH = (val / maxBar) * barPlotH;
              const totalBarW = (barPlotW - 40) / 3;
              const x = barPadL + 20 + pi * (totalBarW + 10);
              const y = barPadT + barPlotH - barH;

              return (
                <g key={policy.key}>
                  <rect
                    x={x}
                    y={y}
                    width={totalBarW}
                    height={barH}
                    rx={4}
                    fill={policy.color}
                    opacity={0.85}
                    className="transition-all duration-400"
                  >
                    <title>
                      {policy.label}: {(val * 100).toFixed(0)}% 아웃에이지
                    </title>
                  </rect>
                  {/* Value label above bar */}
                  <text
                    x={x + totalBarW / 2}
                    y={y - 4}
                    textAnchor="middle"
                    fontSize={9}
                    fill={policy.color}
                    fontWeight="bold"
                  >
                    {(val * 100).toFixed(0)}%
                  </text>
                  {/* Policy label below */}
                  <text
                    x={x + totalBarW / 2}
                    y={barPadT + barPlotH + 14}
                    textAnchor="middle"
                    fontSize={8}
                    fill="#6b7280"
                  >
                    {policy.label}
                  </text>
                </g>
              );
            })}

            {/* Y-axis label */}
            <text
              x={10}
              y={barPadT + barPlotH / 2}
              textAnchor="middle"
              fontSize={8}
              fill="#9ca3af"
              transform={`rotate(-90, 10, ${barPadT + barPlotH / 2})`}
            >
              아웃에이지 확률
            </text>
          </svg>
        </div>

        {/* Improvement note */}
        <div className="flex flex-wrap gap-3 mt-2 justify-center">
          {CHART_POLICIES.map((p, i) => (
            <div key={p.key} className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: p.color }} />
              <span className="text-xs text-gray-600 dark:text-gray-400">{p.label}</span>
              <span className="text-xs font-mono font-semibold" style={{ color: p.color }}>
                {(barValues[i] * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Explanation */}
      <div className="mt-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-3">
        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
          <span className="font-semibold text-gray-800 dark:text-gray-200">해석:</span>{' '}
          RP-MPQ 온라인 선택은 채널 실현에 따라 적응적으로 양자화 정책을 바꿔
          아웃에이지 확률을 크게 줄입니다. γ 임계값이 높을수록 (0.99) 더 엄격한 신뢰도 요건이며,
          RP-MPQ는 이 경우에도 Uniform INT4 대비 약 {Math.round((1 - OUTAGE_DATA[gammaKey].rpMpq / OUTAGE_DATA[gammaKey].uniform) * 100)}% 낮은 아웃에이지를 달성합니다.
        </p>
      </div>
    </div>
  );
}
