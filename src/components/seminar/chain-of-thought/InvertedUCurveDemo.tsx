'use client';

import { useState, useMemo } from 'react';

export default function InvertedUCurveDemo() {
  const [difficulty, setDifficulty] = useState(5);
  const [modelCapability, setModelCapability] = useState(5);

  const { curvePoints, optimalLength, peakAccuracy, spread } = useMemo(() => {
    const M = modelCapability;
    const D = difficulty;
    const optimal = (D * 2) / (M * 1.5);
    const clampedOptimal = Math.max(1, Math.min(20, optimal));
    const peak = Math.min(100, 60 + D * 3 + M * 1.5);
    const s = 2 + D * 0.3;

    const points: { x: number; y: number }[] = [];
    for (let x = 1; x <= 20; x += 0.5) {
      const acc = peak * Math.exp(-0.5 * Math.pow((x - clampedOptimal) / s, 2));
      points.push({ x, y: Math.max(0, Math.min(100, acc)) });
    }

    return {
      curvePoints: points,
      optimalLength: clampedOptimal,
      peakAccuracy: peak,
      spread: s,
    };
  }, [difficulty, modelCapability]);

  // SVG dimensions
  const svgWidth = 660;
  const svgHeight = 320;
  const padding = { top: 30, right: 30, bottom: 50, left: 55 };
  const chartWidth = svgWidth - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;

  const xScale = (x: number) => padding.left + ((x - 1) / 19) * chartWidth;
  const yScale = (y: number) => padding.top + chartHeight - (y / 100) * chartHeight;

  const pathD = curvePoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(p.x).toFixed(1)} ${yScale(p.y).toFixed(1)}`)
    .join(' ');

  // Fill area under curve
  const areaD =
    pathD +
    ` L ${xScale(20).toFixed(1)} ${yScale(0).toFixed(1)}` +
    ` L ${xScale(1).toFixed(1)} ${yScale(0).toFixed(1)} Z`;

  return (
    <div className="concept-card mb-6">
      <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">Interactive</div>
      <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4">
        Inverted U-Shaped Curve: CoT 길이 vs 정확도
      </h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
        CoT 길이와 정확도는 역 U자 관계를 따릅니다.
        난이도와 모델 능력 슬라이더를 조절하면서 최적 길이가 어떻게 변하는지 확인하세요.
      </p>

      {/* Controls */}
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
            Task Difficulty (난이도): <strong className="text-amber-600 dark:text-amber-400">{difficulty}</strong>
          </label>
          <input
            type="range"
            min={1}
            max={10}
            step={1}
            value={difficulty}
            onChange={(e) => setDifficulty(Number(e.target.value))}
            className="w-full accent-amber-500"
          />
          <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500 mt-1">
            <span>1 (쉬움)</span>
            <span>10 (어려움)</span>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
            Model Capability M: <strong className="text-orange-600 dark:text-orange-400">{modelCapability}</strong>
          </label>
          <input
            type="range"
            min={1}
            max={10}
            step={1}
            value={modelCapability}
            onChange={(e) => setModelCapability(Number(e.target.value))}
            className="w-full accent-orange-500"
          />
          <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500 mt-1">
            <span>1 (약한 모델)</span>
            <span>10 (강한 모델)</span>
          </div>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full max-w-[660px]"
          role="img"
          aria-label="Inverted U-shaped curve: CoT length vs accuracy"
        >
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((val) => {
            const y = yScale(val);
            return (
              <g key={val}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + chartWidth}
                  y2={y}
                  stroke="currentColor"
                  className="text-slate-200 dark:text-slate-700"
                  strokeDasharray={val === 0 ? 'none' : '3,3'}
                  strokeWidth={0.5}
                />
                <text
                  x={padding.left - 8}
                  y={y + 3}
                  textAnchor="end"
                  fontSize={10}
                  className="fill-slate-400 dark:fill-slate-500"
                >
                  {val}%
                </text>
              </g>
            );
          })}

          {/* X-axis labels */}
          {[1, 5, 10, 15, 20].map((val) => (
            <text
              key={val}
              x={xScale(val)}
              y={padding.top + chartHeight + 20}
              textAnchor="middle"
              fontSize={10}
              className="fill-slate-400 dark:fill-slate-500"
            >
              {val}
            </text>
          ))}

          {/* Axis labels */}
          <text
            x={padding.left + chartWidth / 2}
            y={svgHeight - 5}
            textAnchor="middle"
            fontSize={11}
            className="fill-slate-500 dark:fill-slate-400"
          >
            CoT Length (reasoning steps)
          </text>
          <text
            x={14}
            y={padding.top + chartHeight / 2}
            textAnchor="middle"
            fontSize={11}
            className="fill-slate-500 dark:fill-slate-400"
            transform={`rotate(-90, 14, ${padding.top + chartHeight / 2})`}
          >
            Accuracy (%)
          </text>

          {/* Area fill */}
          <path d={areaD} fill="#f59e0b" opacity={0.1} />

          {/* Curve */}
          <path d={pathD} fill="none" stroke="#f59e0b" strokeWidth={2.5} opacity={0.9} />

          {/* Optimal vertical dashed line */}
          <line
            x1={xScale(optimalLength)}
            y1={padding.top}
            x2={xScale(optimalLength)}
            y2={yScale(0)}
            stroke="#ea580c"
            strokeWidth={1.5}
            strokeDasharray="6,4"
            opacity={0.7}
          />

          {/* Optimal point dot */}
          <circle
            cx={xScale(optimalLength)}
            cy={yScale(peakAccuracy)}
            r={5}
            fill="#ea580c"
            stroke="white"
            strokeWidth={2}
          />

          {/* Optimal point label */}
          <text
            x={xScale(optimalLength)}
            y={yScale(peakAccuracy) - 12}
            textAnchor="middle"
            fontSize={10}
            fontWeight={600}
            className="fill-orange-700 dark:fill-orange-300"
          >
            Peak: {peakAccuracy.toFixed(1)}%
          </text>

          {/* Axes */}
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={yScale(0)}
            stroke="currentColor"
            className="text-slate-300 dark:text-slate-600"
            strokeWidth={1}
          />
          <line
            x1={padding.left}
            y1={yScale(0)}
            x2={padding.left + chartWidth}
            y2={yScale(0)}
            stroke="currentColor"
            className="text-slate-300 dark:text-slate-600"
            strokeWidth={1}
          />
        </svg>
      </div>

      {/* Optimal length annotation */}
      <div className="text-center mt-2 mb-4">
        <span className="text-sm font-semibold text-orange-700 dark:text-orange-300">
          최적 CoT 길이: {optimalLength.toFixed(1)} steps
        </span>
      </div>

      {/* Info box */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
          <div className="text-xl font-bold text-amber-700 dark:text-amber-300">
            {optimalLength.toFixed(1)}
          </div>
          <div className="text-xs text-amber-600 dark:text-amber-400">최적 길이</div>
        </div>
        <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
          <div className="text-xl font-bold text-orange-700 dark:text-orange-300">
            {peakAccuracy.toFixed(1)}%
          </div>
          <div className="text-xs text-orange-600 dark:text-orange-400">Peak 정확도</div>
        </div>
        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <div className="text-xl font-bold text-red-700 dark:text-red-300">{difficulty}</div>
          <div className="text-xs text-red-600 dark:text-red-400">난이도</div>
        </div>
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="text-xl font-bold text-blue-700 dark:text-blue-300">{modelCapability}</div>
          <div className="text-xs text-blue-600 dark:text-blue-400">모델 능력 M</div>
        </div>
      </div>

      <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">
        난이도를 높이면 최적 길이가 오른쪽으로, 모델 능력을 높이면 최적 길이가 왼쪽으로 이동합니다.
        spread = {spread.toFixed(1)}로 곡선의 폭이 결정됩니다.
      </p>
    </div>
  );
}
