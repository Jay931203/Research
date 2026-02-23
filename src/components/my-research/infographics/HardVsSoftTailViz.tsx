'use client';

import { useState, useMemo } from 'react';

/* Interactive comparison: hard-locality O(L^{-1}) vs SSM soft tail O(e^{-αL}/(1+L)) */
export default function HardVsSoftTailViz() {
  const [L, setL] = useState(5);
  const [alpha, setAlpha] = useState(0.5);

  // 수치 계산
  const hardTail = useMemo(() => 1 / (1 + L), [L]);
  const softTail = useMemo(() => Math.exp(-alpha * L) / (1 + L), [L, alpha]);
  const ratio = useMemo(() => (softTail > 0 ? hardTail / softTail : Infinity), [hardTail, softTail]);

  // 플롯 데이터: L = 0 ~ 20
  const LMAX = 20;
  const points = useMemo(() => {
    return Array.from({ length: LMAX + 1 }, (_, l) => ({
      l,
      hard: 1 / (1 + l),
      soft: Math.exp(-alpha * l) / (1 + l),
    }));
  }, [alpha]);

  const W = 460, H = 180, PAD = { t: 10, r: 10, b: 30, l: 42 };
  const plotW = W - PAD.l - PAD.r;
  const plotH = H - PAD.t - PAD.b;

  // y scale (log): 1/(1+0) = 1 at top, down to ~0.001
  const yMin = 0.001;
  const yMax = 1.05;
  function yPx(v: number) {
    const clamped = Math.max(v, yMin);
    return PAD.t + plotH * (1 - (Math.log(clamped) - Math.log(yMin)) / (Math.log(yMax) - Math.log(yMin)));
  }
  function xPx(l: number) { return PAD.l + (l / LMAX) * plotW; }

  function makePath(key: 'hard' | 'soft') {
    return points
      .filter((p) => p[key] >= yMin)
      .map((p, i) => `${i === 0 ? 'M' : 'L'}${xPx(p.l).toFixed(1)},${yPx(p[key]).toFixed(1)}`)
      .join(' ');
  }

  const gridYs = [1, 0.1, 0.01, 0.001];

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
      <p className="mb-4 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        하드 vs 소프트 테일 잔여 에너지 비교 (로그 스케일)
      </p>

      {/* Sliders */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs">
        <div className="flex items-center gap-3">
          <label className="w-28 font-semibold text-slate-600 dark:text-slate-300 flex-shrink-0">
            수용장 반경 L = <span className="font-mono text-blue-600 dark:text-blue-400">{L}</span>
          </label>
          <input
            type="range" min={0} max={LMAX} value={L}
            onChange={(e) => setL(Number(e.target.value))}
            className="flex-1 accent-blue-600"
          />
        </div>
        <div className="flex items-center gap-3">
          <label className="w-28 font-semibold text-slate-600 dark:text-slate-300 flex-shrink-0">
            SSM 감쇠 α = <span className="font-mono text-orange-600 dark:text-orange-400">{alpha.toFixed(2)}</span>
          </label>
          <input
            type="range" min={0.1} max={1.5} step={0.05} value={alpha}
            onChange={(e) => setAlpha(Number(e.target.value))}
            className="flex-1 accent-orange-500"
          />
        </div>
      </div>

      {/* Chart */}
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" className="block overflow-visible">
        {/* Grid */}
        {gridYs.map((y) => (
          <g key={y}>
            <line x1={PAD.l} y1={yPx(y)} x2={W - PAD.r} y2={yPx(y)}
              stroke="#e2e8f0" strokeWidth={0.5} strokeDasharray="3,3" />
            <text x={PAD.l - 4} y={yPx(y) + 3} textAnchor="end" fontSize={7} fill="#94a3b8">{y}</text>
          </g>
        ))}
        {/* Axes */}
        <line x1={PAD.l} y1={PAD.t} x2={PAD.l} y2={H - PAD.b} stroke="#94a3b8" strokeWidth={0.7} />
        <line x1={PAD.l} y1={H - PAD.b} x2={W - PAD.r} y2={H - PAD.b} stroke="#94a3b8" strokeWidth={0.7} />
        <text x={W / 2} y={H - 2} textAnchor="middle" fontSize={8} fill="#94a3b8">수용장 / 지평선 L</text>

        {/* Curves */}
        <path d={makePath('hard')} fill="none" stroke="#3b82f6" strokeWidth={2} />
        <path d={makePath('soft')} fill="none" stroke="#f97316" strokeWidth={2} />

        {/* Current L markers */}
        <circle cx={xPx(L)} cy={yPx(hardTail)} r={4} fill="#3b82f6" />
        <circle cx={xPx(L)} cy={yPx(Math.max(softTail, yMin))} r={4} fill="#f97316" />

        {/* X ticks */}
        {[0, 5, 10, 15, 20].map((v) => (
          <text key={v} x={xPx(v)} y={H - PAD.b + 10} textAnchor="middle" fontSize={7} fill="#94a3b8">{v}</text>
        ))}
      </svg>

      {/* Legend & live values */}
      <div className="mt-3 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-6 rounded bg-blue-500" />
          <span className="text-slate-600 dark:text-slate-300">
            하드 (CNN) <span className="font-mono text-blue-600 dark:text-blue-400">= O(L⁻¹)</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-6 rounded bg-orange-500" />
          <span className="text-slate-600 dark:text-slate-300">
            소프트 (SSM) <span className="font-mono text-orange-600 dark:text-orange-400">= O(e^{'{'}−αL{'}'} / (1+L))</span>
          </span>
        </div>
      </div>

      {/* Numerical comparison */}
      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 px-2 py-2">
          <p className="text-[10px] text-blue-500 mb-0.5">하드 테일 잔여</p>
          <p className="font-mono font-bold text-blue-700 dark:text-blue-300">{hardTail.toExponential(2)}</p>
        </div>
        <div className="rounded-lg bg-orange-50 dark:bg-orange-950/30 border border-orange-100 dark:border-orange-900/40 px-2 py-2">
          <p className="text-[10px] text-orange-500 mb-0.5">소프트 테일 잔여</p>
          <p className="font-mono font-bold text-orange-700 dark:text-orange-300">
            {softTail < 1e-6 ? '< 10⁻⁶' : softTail.toExponential(2)}
          </p>
        </div>
        <div className="rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900/40 px-2 py-2">
          <p className="text-[10px] text-green-500 mb-0.5">하드/소프트 배율</p>
          <p className="font-mono font-bold text-green-700 dark:text-green-300">
            {ratio > 1e6 ? '> 10⁶×' : `${ratio.toFixed(1)}×`}
          </p>
        </div>
      </div>

      <p className="mt-2 text-[10px] text-slate-400 dark:text-slate-500">
        α가 클수록 SSM 지수 감쇠가 빨라집니다. 같은 L에서 소프트 테일 잔여가 지수 배율로 더 작습니다.
      </p>
    </div>
  );
}
