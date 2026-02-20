'use client';

import { useState, useMemo } from 'react';

function computeDFT(freq: number): number[] {
  const N = 16;
  const magnitudes: number[] = [];

  for (let k = 0; k < N; k++) {
    let re = 0;
    let im = 0;
    for (let n = 0; n < N; n++) {
      const xn = Math.cos((2 * Math.PI * freq * n) / N);
      const angle = (2 * Math.PI * k * n) / N;
      re += xn * Math.cos(angle);
      im -= xn * Math.sin(angle);
    }
    magnitudes.push(Math.sqrt(re * re + im * im));
  }
  return magnitudes;
}

export default function OffGridDFTViz() {
  const [freq, setFreq] = useState(2.0);

  const isOnGrid = useMemo(() => {
    return Math.abs(freq - Math.round(freq)) < 0.05;
  }, [freq]);

  const magnitudes = useMemo(() => computeDFT(freq), [freq]);

  const maxMag = useMemo(() => Math.max(...magnitudes, 1), [magnitudes]);

  // Energy leakage analysis
  const nearestBin = useMemo(() => Math.round(freq) % 16, [freq]);
  const { mainPct, leakagePct } = useMemo(() => {
    const totalE = magnitudes.reduce((s, m) => s + m * m, 0);
    const mainE = magnitudes[nearestBin] * magnitudes[nearestBin];
    const main = totalE > 0 ? (mainE / totalE) * 100 : 100;
    return { mainPct: main, leakagePct: 100 - main };
  }, [magnitudes, nearestBin]);

  // Polynomial decay bound: c₀/(1+|k-nearestBin|)
  const decayRef = useMemo(() => {
    const c0 = magnitudes[nearestBin];
    return magnitudes.map((_, k) => c0 / (1 + Math.abs(k - nearestBin)));
  }, [magnitudes, nearestBin]);

  const svgHeight = 200;
  const svgWidth = 560;
  const barAreaHeight = 160;
  const barAreaTop = 20;
  const barWidth = Math.floor(svgWidth / 16) - 2;
  const barSpacing = Math.floor(svgWidth / 16);

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-md w-full">
      <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
        DFT 스펙트럼 누설 시각화
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        슬라이더를 조절하여 격자점 내/외 주파수에서의 DFT 응답을 확인하세요.
      </p>

      {/* Slider */}
      <div className="flex items-center gap-4 mb-3">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
          주파수 (frequency)
        </label>
        <input
          type="range"
          min={0.5}
          max={5.5}
          step={0.1}
          value={freq}
          onChange={(e) => setFreq(parseFloat(e.target.value))}
          className="flex-1 accent-blue-500"
        />
        <span className="text-sm font-mono text-blue-600 dark:text-blue-400 w-10 text-right">
          {freq.toFixed(1)}
        </span>
      </div>

      {/* Status label */}
      <div
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mb-4 transition-all duration-300 ${
          isOnGrid
            ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
            : 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300'
        }`}
      >
        <span
          className={`w-2 h-2 rounded-full ${isOnGrid ? 'bg-blue-500' : 'bg-orange-500'}`}
        />
        주파수 = {freq.toFixed(1)} →{' '}
        {isOnGrid ? '격자점 위 (깨끗한 스펙트럼)' : '격자점 밖 (누설 발생)'}
      </div>

      {/* SVG Bar Chart */}
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          width="100%"
          height={svgHeight}
          className="block"
        >
          {/* Y-axis label */}
          <text
            x={4}
            y={barAreaTop - 4}
            fontSize={10}
            fill="currentColor"
            className="text-gray-500 dark:text-gray-400"
          >
            |X[k]|
          </text>

          {/* Baseline */}
          <line
            x1={0}
            y1={barAreaTop + barAreaHeight}
            x2={svgWidth}
            y2={barAreaTop + barAreaHeight}
            stroke="#9ca3af"
            strokeWidth={1}
          />

          {magnitudes.map((mag, k) => {
            const barH = (mag / maxMag) * barAreaHeight;
            const x = k * barSpacing + 2;
            const y = barAreaTop + barAreaHeight - barH;
            const barColor = isOnGrid ? '#3b82f6' : '#f97316';
            const barColorDark = isOnGrid ? '#60a5fa' : '#fb923c';

            return (
              <g key={k}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barH}
                  rx={2}
                  fill={barColor}
                  className="dark:fill-current"
                  style={{
                    fill: barColor,
                    transition: 'height 0.2s ease, y 0.2s ease',
                  }}
                >
                  <title>k={k}, |X[k]|={mag.toFixed(2)}</title>
                </rect>
                {/* k label */}
                <text
                  x={x + barWidth / 2}
                  y={barAreaTop + barAreaHeight + 12}
                  textAnchor="middle"
                  fontSize={9}
                  fill="#6b7280"
                >
                  {k}
                </text>
              </g>
            );
          })}

          {/* Polynomial decay reference line (off-grid only) */}
          {!isOnGrid && decayRef.map((d, k) => {
            const x1 = k * barSpacing + 2 + barWidth / 2;
            if (k === 0) return null;
            const x0 = (k - 1) * barSpacing + 2 + barWidth / 2;
            const y1 = barAreaTop + barAreaHeight - (d / maxMag) * barAreaHeight;
            const y0 = barAreaTop + barAreaHeight - (decayRef[k - 1] / maxMag) * barAreaHeight;
            return (
              <line key={k} x1={x0} y1={y0} x2={x1} y2={y1}
                stroke="#9ca3af" strokeWidth={1} strokeDasharray="3,2" opacity={0.6}
              />
            );
          })}

          {/* Main bin highlight */}
          {!isOnGrid && (
            <rect
              x={nearestBin * barSpacing + 1}
              y={barAreaTop - 2}
              width={barWidth + 2}
              height={barAreaHeight + 2}
              fill="none"
              stroke="#9ca3af"
              strokeWidth={1}
              strokeDasharray="3,2"
              opacity={0.5}
              rx={2}
            />
          )}

          {/* X-axis label */}
          <text
            x={svgWidth / 2}
            y={svgHeight - 2}
            textAnchor="middle"
            fontSize={10}
            fill="#6b7280"
          >
            주파수 빈 k (0 ~ 15)
          </text>
        </svg>
      </div>

      {/* Energy leakage gauge */}
      <div className="mt-3 mb-1">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="font-medium text-gray-600 dark:text-gray-400">에너지 분포</span>
          <span className={`font-mono ${isOnGrid ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>
            주빈 {mainPct.toFixed(1)}% / 누설 {leakagePct.toFixed(1)}%
          </span>
        </div>
        <div className="h-4 w-full bg-orange-200 dark:bg-orange-900/40 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${mainPct}%`,
              backgroundColor: isOnGrid ? '#3b82f6' : '#f97316',
            }}
          />
        </div>
        <div className="flex justify-between text-[9px] text-gray-400 mt-0.5">
          <span>← 주 빈 에너지</span>
          <span>누설 에너지 →</span>
        </div>
      </div>
      {!isOnGrid && (
        <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-2">
          회색 점선: 다항식 감쇠 경계 c₀/(1+|k−k₀|). Off-grid 채널의 CSI 코드북 표현 오차 원인.
        </p>
      )}

      {/* Legend */}
      <div className="flex gap-4 mt-2 mb-3">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-blue-500 inline-block" />
          <span className="text-xs text-gray-600 dark:text-gray-400">격자점 위 (정수 주파수)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-orange-500 inline-block" />
          <span className="text-xs text-gray-600 dark:text-gray-400">격자점 밖 (누설)</span>
        </div>
      </div>

      {/* Explanation note */}
      <div className="rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-3">
        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
          <span className="font-semibold text-gray-800 dark:text-gray-200">원리:</span>{' '}
          DFT는 정수 주파수만 정확히 표현합니다. 비정수 주파수이면 에너지가 여러 빈에 퍼지는{' '}
          <span className="font-semibold text-orange-600 dark:text-orange-400">스펙트럼 누설(spectral leakage)</span>이 발생합니다.
          CSI 피드백에서 비정수 지연·각도를 DFT 기반 코드북으로 표현하면 동일한 문제가 생깁니다.
        </p>
      </div>
    </div>
  );
}
