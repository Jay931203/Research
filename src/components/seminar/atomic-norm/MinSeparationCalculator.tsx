'use client';

import { useState, useMemo } from 'react';
import Slider from 'rc-slider';
import { InlineMath, BlockMath } from 'react-katex';

/**
 * Interactive calculator showing the minimum separation condition
 * ΔT > 2.52/(n-1) and how many resolvable frequencies fit in [0,1).
 */
export default function MinSeparationCalculator() {
  const [n, setN] = useState(64);

  const deltaT = 2.52 / (n - 1);
  const rayleigh = 1 / n;
  const maxFreqs = Math.floor(1 / deltaT);

  // Generate tick marks for the number line
  const ticks = useMemo(() => {
    const result: number[] = [];
    let pos = 0;
    while (pos < 1) {
      result.push(pos);
      pos += deltaT;
    }
    return result;
  }, [deltaT]);

  // Width of the number line in SVG units
  const svgW = 760;
  const svgH = 100;
  const pad = 40;
  const lineW = svgW - 2 * pad;

  return (
    <div className="concept-card mb-6">
      <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">Interactive Calculator</div>
      <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Minimum Separation 계산기</h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
        신호 차원 <InlineMath math="n" />을 조절하면, ANM의 exact recovery를 보장하는 최소 주파수 간격{' '}
        <InlineMath math="\Delta T" />와 분해 가능한 최대 주파수 수가 변합니다.
      </p>

      {/* Slider */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-slate-600 dark:text-slate-400">
            Signal dimension{' '}
            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">n = {n}</span>
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500">16 ~ 256</span>
        </div>
        <Slider
          min={16}
          max={256}
          step={1}
          value={n}
          onChange={(v) => setN(v as number)}
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

      {/* Formula + computed values */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800 text-center">
          <div className="text-[10px] uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-semibold mb-1">
            Minimum Separation
          </div>
          <div className="text-2xl font-mono font-bold text-indigo-700 dark:text-indigo-300">
            {deltaT.toFixed(4)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            <InlineMath math={`\\Delta T = \\frac{2.52}{${n}-1} = ${deltaT.toFixed(4)}`} />
          </div>
        </div>

        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 text-center">
          <div className="text-[10px] uppercase tracking-wider text-amber-600 dark:text-amber-400 font-semibold mb-1">
            Rayleigh Limit
          </div>
          <div className="text-2xl font-mono font-bold text-amber-700 dark:text-amber-300">
            {rayleigh.toFixed(4)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            <InlineMath math={`RL = 1/${n} = ${rayleigh.toFixed(4)}`} />
          </div>
        </div>

        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800 text-center">
          <div className="text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-semibold mb-1">
            Resolvable Frequencies
          </div>
          <div className="text-2xl font-mono font-bold text-emerald-700 dark:text-emerald-300">
            {maxFreqs}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            <InlineMath math={`\\lfloor 1/\\Delta T \\rfloor = ${maxFreqs}`} />
          </div>
        </div>
      </div>

      {/* Number line visualization */}
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full min-w-[500px] h-auto">
          {/* Base line */}
          <line x1={pad} y1={50} x2={pad + lineW} y2={50}
            stroke="#94a3b8" strokeWidth={2} />

          {/* Start/end labels */}
          <text x={pad} y={80} textAnchor="middle" className="text-[11px]" fill="#64748b">0</text>
          <text x={pad + lineW} y={80} textAnchor="middle" className="text-[11px]" fill="#64748b">1</text>

          {/* Resolvable frequency ticks */}
          {ticks.map((pos, i) => {
            const x = pad + pos * lineW;
            return (
              <g key={i}>
                <line x1={x} y1={35} x2={x} y2={65}
                  stroke="#6366f1" strokeWidth={2} />
                <circle cx={x} cy={50} r={3} fill="#6366f1" />
                {(i < 5 || (i === ticks.length - 1 && ticks.length <= 20)) && (
                  <text x={x} y={26} textAnchor="middle" className="text-[9px]" fill="#6366f1">
                    {pos.toFixed(2)}
                  </text>
                )}
                {i === 5 && ticks.length > 7 && (
                  <text x={x} y={26} textAnchor="middle" className="text-[10px]" fill="#94a3b8">
                    ...
                  </text>
                )}
              </g>
            );
          })}

          {/* Delta T bracket between first two ticks */}
          {ticks.length >= 2 && (
            <>
              <line x1={pad} y1={88} x2={pad + deltaT * lineW} y2={88}
                stroke="#ef4444" strokeWidth={1.5} markerEnd="url(#arrowR)" markerStart="url(#arrowL)" />
              <text x={pad + (deltaT * lineW) / 2} y={98} textAnchor="middle"
                className="text-[10px] font-medium" fill="#ef4444">
                {'\u0394'}T = {deltaT.toFixed(4)}
              </text>
              <defs>
                <marker id="arrowR" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6" fill="none" stroke="#ef4444" strokeWidth="1" />
                </marker>
                <marker id="arrowL" markerWidth="6" markerHeight="6" refX="1" refY="3" orient="auto">
                  <path d="M6,0 L0,3 L6,6" fill="none" stroke="#ef4444" strokeWidth="1" />
                </marker>
              </defs>
            </>
          )}
        </svg>
      </div>

      <div className="mt-4 p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg text-xs text-slate-600 dark:text-slate-400">
        <strong className="text-slate-700 dark:text-slate-300">해석:</strong>{' '}
        n = {n}일 때, Rayleigh limit은 {rayleigh.toFixed(4)}이고 ANM의 minimum separation은 {deltaT.toFixed(4)}입니다 (약 {(deltaT / rayleigh).toFixed(1)}배).
        [0, 1) 구간에 최대 {maxFreqs}개의 주파수를 구분할 수 있습니다.
        {n >= 128 && ' n이 충분히 크므로 높은 해상도가 보장됩니다.'}
        {n < 32 && ' n이 작아 분해능이 제한적입니다. n을 키워 보세요.'}
      </div>
    </div>
  );
}
