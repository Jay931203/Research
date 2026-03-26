'use client';

import { useState, useMemo } from 'react';
import Slider from 'rc-slider';

/**
 * Interactive SVG visualization of the atomic norm "balloon" concept.
 *
 * Shows ~6 atoms on a unit circle forming conv(A).
 * A target point x sits outside, and a scaled convex hull t*conv(A)
 * expands via a slider.  When t = ||x||_A the balloon just touches x.
 */
export default function AtomicNormGeometryViz() {
  // The atomic norm value for the chosen target point
  const NORM_VALUE = 1.55;

  const [tValue, setTValue] = useState(1.0);

  // 6 atoms evenly spaced on unit circle
  const atoms = useMemo(() => {
    const n = 6;
    return Array.from({ length: n }, (_, i) => {
      const angle = (2 * Math.PI * i) / n - Math.PI / 2;
      return { x: Math.cos(angle), y: Math.sin(angle) };
    });
  }, []);

  // Target point x (placed outside the unit conv hull)
  const target = { x: 1.1, y: 0.7 };

  // SVG coordinate helpers — centre at (200, 200), scale 120px per unit
  const cx = 200;
  const cy = 200;
  const s = 120;
  const toSvg = (p: { x: number; y: number }, scale = 1) => ({
    sx: cx + p.x * s * scale,
    sy: cy - p.y * s * scale, // flip y
  });

  // Scaled hull polygon points
  const hullPoints = atoms
    .map((a) => {
      const { sx, sy } = toSvg(a, tValue);
      return `${sx},${sy}`;
    })
    .join(' ');

  // Original hull (t=1)
  const baseHullPoints = atoms
    .map((a) => {
      const { sx, sy } = toSvg(a, 1);
      return `${sx},${sy}`;
    })
    .join(' ');

  const targetSvg = toSvg(target);
  const isTouching = Math.abs(tValue - NORM_VALUE) < 0.06;
  const isInside = tValue > NORM_VALUE + 0.06;

  const fillColor = isTouching
    ? 'rgba(34,197,94,0.18)'
    : isInside
      ? 'rgba(99,102,241,0.12)'
      : 'rgba(99,102,241,0.08)';
  const strokeColor = isTouching ? '#22c55e' : '#6366f1';

  return (
    <div className="concept-card mb-6">
      <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
        Interactive Demo
      </div>
      <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-3">
        Atomic Norm Geometry
      </h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
        슬라이더로 <em>t</em> 값을 조절하여 <em>t</em>&middot;conv(A)가 목표점{' '}
        <strong>x</strong>에 닿는 순간을 확인하세요.
        그 순간의 <em>t</em> 값이 곧{' '}
        <span className="font-mono text-indigo-600 dark:text-indigo-400">
          ||x||<sub>A</sub>
        </span>{' '}
        입니다.
      </p>

      <div className="flex flex-col lg:flex-row gap-6 items-center">
        {/* SVG Canvas */}
        <div className="flex-1 flex justify-center">
          <svg
            viewBox="0 0 400 400"
            className="w-full max-w-[360px] h-auto border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800"
          >
            {/* Grid lines */}
            <line x1={cx} y1={40} x2={cx} y2={360} stroke="#e2e8f0" strokeWidth={0.5} />
            <line x1={40} y1={cy} x2={360} y2={cy} stroke="#e2e8f0" strokeWidth={0.5} />

            {/* Base conv(A) — dashed */}
            <polygon
              points={baseHullPoints}
              fill="none"
              stroke="#94a3b8"
              strokeWidth={1}
              strokeDasharray="4 3"
            />

            {/* Scaled t*conv(A) */}
            <polygon
              points={hullPoints}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={2}
              style={{ transition: 'all 0.15s ease' }}
            />

            {/* Atom dots */}
            {atoms.map((a, i) => {
              const { sx, sy } = toSvg(a, tValue);
              return (
                <circle
                  key={i}
                  cx={sx}
                  cy={sy}
                  r={4}
                  fill={strokeColor}
                  stroke="white"
                  strokeWidth={1.5}
                  style={{ transition: 'cx 0.15s ease, cy 0.15s ease' }}
                />
              );
            })}

            {/* Target point x */}
            <circle
              cx={targetSvg.sx}
              cy={targetSvg.sy}
              r={6}
              fill={isTouching ? '#22c55e' : '#ef4444'}
              stroke="white"
              strokeWidth={2}
            />
            <text
              x={targetSvg.sx + 12}
              y={targetSvg.sy + 4}
              className="text-xs font-bold"
              fill={isTouching ? '#22c55e' : '#ef4444'}
            >
              x
            </text>

            {/* Origin label */}
            <text x={cx + 6} y={cy + 14} className="text-[10px]" fill="#94a3b8">
              0
            </text>

            {/* Labels */}
            <text x={20} y={24} className="text-[11px] font-medium" fill="#6366f1">
              t&middot;conv(A)
            </text>
            <text x={20} y={40} className="text-[10px]" fill="#94a3b8">
              conv(A) dashed
            </text>
          </svg>
        </div>

        {/* Controls */}
        <div className="w-full lg:w-56 space-y-4">
          <div>
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
              <span>
                t ={' '}
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {tValue.toFixed(2)}
                </span>
              </span>
              <span className="text-[10px]">
                ||x||<sub>A</sub> = {NORM_VALUE.toFixed(2)}
              </span>
            </div>
            <Slider
              min={0.3}
              max={2.5}
              step={0.01}
              value={tValue}
              onChange={(v) => setTValue(v as number)}
              trackStyle={{ backgroundColor: '#6366f1', height: 6 }}
              handleStyle={{
                borderColor: '#6366f1',
                backgroundColor: '#fff',
                width: 18,
                height: 18,
                marginTop: -6,
              }}
              railStyle={{ backgroundColor: '#e2e8f0', height: 6 }}
            />
          </div>

          {/* Status indicator */}
          <div
            className={`text-center text-xs font-semibold rounded-lg px-3 py-2 transition-colors ${
              isTouching
                ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
                : isInside
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                  : 'bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600'
            }`}
          >
            {isTouching
              ? 't = ||x||_A  (hull이 x에 도달!)'
              : isInside
                ? 'x가 t*conv(A) 내부에 포함'
                : 't*conv(A)가 아직 x에 도달하지 못함'}
          </div>

          {/* Quick-set buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setTValue(1.0)}
              className="flex-1 px-2 py-1.5 text-[11px] font-medium rounded-md border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
            >
              t = 1.0
            </button>
            <button
              onClick={() => setTValue(NORM_VALUE)}
              className="flex-1 px-2 py-1.5 text-[11px] font-medium rounded-md border border-indigo-200 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition"
            >
              t = ||x||<sub>A</sub>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
