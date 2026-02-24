'use client';

import { useMemo, useState } from 'react';

export default function DirichletKernelViz() {
  const [delta, setDelta] = useState(0.0); // off-grid offset: 0 = perfectly on-grid
  const N = 32; // DFT length (model: N_f=32 delay taps)
  const D = 12; // bins to display on each side

  // Dirichlet kernel magnitude at integer bin offset d, given off-grid shift delta:
  //   |X[d]| = |sin(π(delta - d))| / |N · sin(π(delta - d)/N)|
  // At d == round(delta), numerator ≈ 0 and denominator ≈ 0; use L'Hopital → 1.
  const bins = useMemo(() => {
    const rows: { d: number; mag: number; env: number }[] = [];
    for (let d = -D; d <= D; d++) {
      const x = delta - d;
      let mag: number;
      if (Math.abs(x) < 1e-8) {
        mag = 1.0;
      } else {
        mag = Math.abs(Math.sin(Math.PI * x)) / (N * Math.abs(Math.sin((Math.PI * x) / N)));
      }
      const env = 1.0 / (1.0 + Math.abs(d));
      rows.push({ d, mag, env });
    }
    return rows;
  }, [delta]);

  const maxMag = Math.max(...bins.map((b) => b.mag));

  const chartW = 480;
  const chartH = 160;
  const padL = 36;
  const step = chartW / (2 * D + 1);

  return (
    <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-950/20">
      <p className="mb-2 text-sm font-bold uppercase tracking-wide text-orange-700 dark:text-orange-300">
        인터랙티브 ❶ — Dirichlet 커널 & Off-grid 스펙트럼 누설
      </p>
      <p className="mb-3 text-sm leading-relaxed text-orange-700 dark:text-orange-400">
        δ=0: 에너지가 d=0 빈 하나에만 집중 (on-grid). δ≠0: 모든 빈으로 누설 — Dirichlet 패턴.
        보라 점선은 논문의 포락선 1/(1+|d|).
      </p>

      {/* Slider */}
      <div className="mb-3 flex items-center gap-3">
        <span className="shrink-0 text-sm font-semibold text-orange-600 dark:text-orange-400">off-grid δ</span>
        <input
          type="range"
          min={-0.49}
          max={0.49}
          step={0.01}
          value={delta}
          onChange={(e) => setDelta(parseFloat(e.target.value))}
          className="flex-1 accent-orange-500"
        />
        <span className="w-16 shrink-0 text-right font-mono text-sm font-bold text-orange-700 dark:text-orange-300">
          δ = {delta.toFixed(2)}
        </span>
      </div>

      {/* Status badge */}
      <div className="mb-3 flex gap-2">
        {Math.abs(delta) < 0.02 ? (
          <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-700 dark:bg-green-900/30 dark:text-green-300">
            On-grid — 에너지 완전 집중
          </span>
        ) : (
          <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-bold text-red-700 dark:bg-red-900/30 dark:text-red-300">
            Off-grid (δ≠0) — Dirichlet 측엽 누설 발생
          </span>
        )}
      </div>

      {/* Chart */}
      <svg
        viewBox={`0 0 ${chartW + padL + 20} ${chartH + 28}`}
        width="100%"
        height={chartH + 28}
        className="block"
      >
        {/* Background */}
        <rect x={0} y={0} width={chartW + padL + 20} height={chartH + 28} fill="#f8fafc" />

        {/* Axes */}
        <line x1={padL} y1={chartH + 2} x2={chartW + padL} y2={chartH + 2} stroke="#9ca3af" strokeWidth={0.8} />
        <text x={chartW + padL + 18} y={chartH + 5} fontSize={10} fill="#9ca3af" textAnchor="end">
          d
        </text>
        <text x={padL + 2} y={12} fontSize={10} fill="#9ca3af">
          |X[d]|
        </text>

        {/* Bars */}
        {bins.map(({ d, mag }) => {
          const barH = (mag / (maxMag || 1)) * (chartH - 5);
          const cx = padL + (d + D + 0.5) * step;
          const bw = step * 0.75;
          const bx = cx - bw / 2;
          const by = chartH + 2 - barH;
          const isNearCenter = Math.abs(d) === 0;
          return (
            <g key={d}>
              <rect
                x={bx}
                y={by}
                width={bw}
                height={Math.max(barH, 0.5)}
                rx={1}
                fill={isNearCenter ? '#ea580c' : '#fb923c'}
                opacity={0.85}
              >
                <title>d={d}: |X|={mag.toFixed(3)}</title>
              </rect>
              {/* x label every 4 */}
              {d % 4 === 0 && (
                <text x={cx} y={chartH + 16} textAnchor="middle" fontSize={10} fill="#9ca3af">
                  {d}
                </text>
              )}
            </g>
          );
        })}

        {/* Envelope: 1/(1+|d|) */}
        {(() => {
          const pts = bins
            .map(({ d, env }) => {
              const cx = padL + (d + D + 0.5) * step;
              const cy = chartH + 2 - (env / (maxMag || 1)) * (chartH - 5);
              return `${cx},${cy}`;
            })
            .join(' ');
          return (
            <polyline points={pts} fill="none" stroke="#6366f1" strokeWidth={2} strokeDasharray="3,2" />
          );
        })()}

        {/* Legend */}
        <rect x={padL + 10} y={chartH - 34} width={12} height={10} fill="#fb923c" rx={1} />
        <text x={padL + 26} y={chartH - 25} fontSize={10} fill="#9ca3af">
          DFT 크기 |X[d]|
        </text>
        <line
          x1={padL + 10}
          y1={chartH - 14}
          x2={padL + 22}
          y2={chartH - 14}
          stroke="#6366f1"
          strokeWidth={2}
          strokeDasharray="3,2"
        />
        <text x={padL + 26} y={chartH - 9} fontSize={10} fill="#9ca3af">
          포락선 1/(1+|d|)
        </text>
      </svg>

      <p className="mt-1 text-sm italic text-orange-600 dark:text-orange-400">
        δ를 0에서 멀리 움직일수록 측엽이 커지고, 포락선(보라)이 측엽 크기의 상한을 따릅니다.
      </p>
    </div>
  );
}
