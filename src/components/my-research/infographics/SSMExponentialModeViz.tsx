'use client';

import { useMemo, useState } from 'react';

export default function SSMExponentialModeViz() {
  const [numModes, setNumModes] = useState(3);
  const T = 24; // show d = 0 … T

  // Modes: evenly-spaced decay rates α_1 < α_2 < … < α_M
  // Weights: equal 1/M each (simplified; in a real SSM they come from C, B)
  const modes = useMemo(() => {
    const result: { alpha: number; weight: number }[] = [];
    for (let i = 0; i < numModes; i++) {
      const alpha = 0.1 + (i * 1.4) / Math.max(numModes - 1, 1);
      result.push({ alpha, weight: 1.0 / numModes });
    }
    return result;
  }, [numModes]);

  const rows = useMemo(() => {
    const r: { d: number; target: number; approx: number; modes: number[] }[] = [];
    for (let d = 0; d <= T; d++) {
      const target = 1.0 / (1.0 + d);
      let approx = 0;
      const modeVals = modes.map(({ alpha, weight }) => {
        const v = weight * Math.exp(-alpha * d);
        approx += v;
        return v;
      });
      r.push({ d, target, approx, modes: modeVals });
    }
    return r;
  }, [modes]);

  const chartW = 460;
  const chartH = 110;
  const padL = 30;
  const padT = 10;
  const xScale = chartW / T;

  // Helpers to map value → SVG y
  const vy = (v: number) => padT + (1 - v) * chartH;
  const vx = (d: number) => padL + d * xScale;

  const modeColors = ['#60a5fa', '#a78bfa', '#34d399', '#f87171', '#fbbf24', '#f472b6', '#38bdf8', '#a3e635'];

  return (
    <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-800 dark:bg-indigo-950/20">
      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-indigo-700 dark:text-indigo-300">
        인터랙티브 ❷ — SSM = 지수 모드의 합 (다항 포락선 근사)
      </p>
      <p className="mb-3 text-xs leading-relaxed text-indigo-700 dark:text-indigo-400">
        각 지수 모드 e^(-α_i·d)가 점선으로 표시됩니다. 모드 수를 늘릴수록 합(파랑)이 목표 1/(1+d)(주황)에 가까워집니다.
        이것이 &ldquo;다항 감쇠 = 지수 모드의 Laplace 혼합&rdquo; 수식의 직관입니다.
      </p>

      {/* Slider */}
      <div className="mb-3 flex items-center gap-3">
        <span className="w-24 shrink-0 text-xs text-indigo-600 dark:text-indigo-400">지수 모드 수 M</span>
        <input
          type="range"
          min={1}
          max={8}
          step={1}
          value={numModes}
          onChange={(e) => setNumModes(parseInt(e.target.value))}
          className="flex-1 accent-indigo-500"
        />
        <span className="w-8 shrink-0 text-right font-mono text-xs font-bold text-indigo-700 dark:text-indigo-300">
          {numModes}
        </span>
      </div>

      {/* Mode info */}
      <div className="mb-3 flex flex-wrap gap-1.5">
        {modes.map(({ alpha }, i) => (
          <span
            key={i}
            className="rounded px-1.5 py-0.5 text-[10px] font-mono"
            style={{ background: modeColors[i] + '30', color: modeColors[i], border: `1px solid ${modeColors[i]}80` }}
          >
            e^(-{alpha.toFixed(2)}·d)
          </span>
        ))}
      </div>

      {/* Chart */}
      <svg
        viewBox={`0 0 ${chartW + padL + 20} ${chartH + padT + 30}`}
        width="100%"
        height={chartH + padT + 30}
        className="block"
      >
        {/* Grid lines (horizontal) */}
        {[0.25, 0.5, 0.75, 1.0].map((v) => (
          <line
            key={v}
            x1={padL}
            y1={vy(v)}
            x2={padL + chartW}
            y2={vy(v)}
            stroke="#d1d5db"
            strokeWidth={0.4}
            strokeDasharray="4,3"
          />
        ))}

        {/* Axes */}
        <line x1={padL} y1={padT} x2={padL} y2={padT + chartH} stroke="#9ca3af" strokeWidth={0.7} />
        <line x1={padL} y1={padT + chartH} x2={padL + chartW} y2={padT + chartH} stroke="#9ca3af" strokeWidth={0.7} />
        <text x={padL + chartW + 10} y={padT + chartH + 3} fontSize={7} fill="#9ca3af">
          d
        </text>
        <text x={padL + 3} y={padT + 5} fontSize={7} fill="#9ca3af">
          크기
        </text>

        {/* y-axis labels */}
        {[0.25, 0.5, 1.0].map((v) => (
          <text key={v} x={padL - 4} y={vy(v) + 2} textAnchor="end" fontSize={6} fill="#9ca3af">
            {v}
          </text>
        ))}

        {/* x-axis labels */}
        {[0, 4, 8, 12, 16, 20, 24].map((d) => (
          <text key={d} x={vx(d)} y={padT + chartH + 11} textAnchor="middle" fontSize={6} fill="#9ca3af">
            {d}
          </text>
        ))}

        {/* Individual exponential mode curves */}
        {modes.map(({ alpha, weight }, mi) => {
          const pts = rows
            .map(({ d }) => {
              const v = weight * Math.exp(-alpha * d);
              return `${vx(d)},${vy(v)}`;
            })
            .join(' ');
          return (
            <polyline
              key={mi}
              points={pts}
              fill="none"
              stroke={modeColors[mi]}
              strokeWidth={1.0}
              strokeDasharray="3,2"
              opacity={0.7}
            />
          );
        })}

        {/* Target: 1/(1+d) */}
        {(() => {
          const pts = rows.map(({ d, target }) => `${vx(d)},${vy(target)}`).join(' ');
          return <polyline points={pts} fill="none" stroke="#f97316" strokeWidth={2} />;
        })()}

        {/* Sum approximation */}
        {(() => {
          const pts = rows.map(({ d, approx }) => `${vx(d)},${vy(approx)}`).join(' ');
          return <polyline points={pts} fill="none" stroke="#6366f1" strokeWidth={2} />;
        })()}

        {/* Legend */}
        <line x1={padL + 10} y1={padT + chartH - 24} x2={padL + 28} y2={padT + chartH - 24} stroke="#f97316" strokeWidth={2} />
        <text x={padL + 32} y={padT + chartH - 21} fontSize={6.5} fill="#9ca3af">
          목표: 1/(1+d)
        </text>
        <line x1={padL + 10} y1={padT + chartH - 12} x2={padL + 28} y2={padT + chartH - 12} stroke="#6366f1" strokeWidth={2} />
        <text x={padL + 32} y={padT + chartH - 9} fontSize={6.5} fill="#9ca3af">
          SSM 합 (M={numModes}개 모드)
        </text>
      </svg>

      <p className="mt-1 text-xs italic text-indigo-600 dark:text-indigo-400">
        M이 클수록 더 넓은 지수 스펙트럼을 포착하여 다항 감쇠 근사가 개선됩니다.
        실제 SSM에서 M은 상태 차원이고, 각 모드는 행렬 A의 고유값에 해당합니다.
      </p>
    </div>
  );
}
