'use client';

import { useState, useMemo } from 'react';

const NUM_LAYERS = 32;

function gaussianPrior(layer: number, mu: number, sigma: number): number {
  return Math.exp(-0.5 * Math.pow((layer - mu) / sigma, 2)) / (sigma * Math.sqrt(2 * Math.PI));
}

function generateAttentionScores(numLayers: number, seed: number): number[] {
  // Deterministic pseudo-random scores with a pattern:
  // slight peak around middle layers, some noise
  const scores: number[] = [];
  for (let i = 0; i < numLayers; i++) {
    const base = 0.3 + 0.4 * Math.exp(-0.5 * Math.pow((i - numLayers * 0.55) / (numLayers * 0.25), 2));
    const noise = Math.sin(i * 7.3 + seed) * 0.15 + Math.cos(i * 3.1 + seed * 2) * 0.1;
    scores.push(Math.max(0, base + noise));
  }
  return scores;
}

function normalize(arr: number[]): number[] {
  const sum = arr.reduce((a, b) => a + b, 0);
  if (sum === 0) return arr.map(() => 1 / arr.length);
  return arr.map((v) => v / sum);
}

export default function LayerImportanceVisualizer() {
  const [mu, setMu] = useState(16);
  const [sigma, setSigma] = useState(6);
  const [alpha, setAlpha] = useState(0.5);
  const [numSelected, setNumSelected] = useState(8);

  const attentionScores = useMemo(() => generateAttentionScores(NUM_LAYERS, 42), []);

  const { priorNorm, attnNorm, combinedScores, selectedLayers } = useMemo(() => {
    const prior = Array.from({ length: NUM_LAYERS }, (_, i) => gaussianPrior(i, mu, sigma));
    const pNorm = normalize(prior);
    const aNorm = normalize(attentionScores);
    const combined = pNorm.map((p, i) => alpha * p + (1 - alpha) * aNorm[i]);

    // Select top-k layers
    const indexed = combined.map((score, i) => ({ score, index: i }));
    indexed.sort((a, b) => b.score - a.score);
    const selected = new Set(indexed.slice(0, numSelected).map((d) => d.index));

    return { priorNorm: pNorm, attnNorm: aNorm, combinedScores: combined, selectedLayers: selected };
  }, [mu, sigma, alpha, numSelected, attentionScores]);

  const maxCombined = Math.max(...combinedScores);

  // SVG dimensions
  const svgWidth = 700;
  const svgHeight = 300;
  const padding = { top: 30, right: 20, bottom: 50, left: 50 };
  const chartWidth = svgWidth - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;
  const barWidth = chartWidth / NUM_LAYERS - 2;

  return (
    <div className="concept-card mb-6">
      <div className="text-xs font-semibold text-blue-600 mb-1">Interactive</div>
      <h3 className="font-bold text-slate-800 mb-4">KV Cache Layer Importance Visualizer</h3>
      <p className="text-sm text-slate-600 mb-4">
        Gaussian prior(초록)와 attention importance score(파랑)를 결합하여 최종 layer score(보라)를 산출합니다.
        슬라이더로 파라미터를 조절하면서 어떤 layer가 선택되는지 확인하세요.
        선택된 layer는 하이라이트됩니다.
      </p>

      {/* Controls */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Center layer (mu): {mu}
          </label>
          <input
            type="range"
            min={0}
            max={NUM_LAYERS - 1}
            step={1}
            value={mu}
            onChange={(e) => setMu(Number(e.target.value))}
            className="w-full accent-emerald-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Spread (sigma): {sigma}
          </label>
          <input
            type="range"
            min={1}
            max={15}
            step={0.5}
            value={sigma}
            onChange={(e) => setSigma(Number(e.target.value))}
            className="w-full accent-emerald-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Balance (alpha): {alpha.toFixed(2)}
          </label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={alpha}
            onChange={(e) => setAlpha(Number(e.target.value))}
            className="w-full accent-violet-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Selected layers (k): {numSelected}
          </label>
          <input
            type="range"
            min={1}
            max={NUM_LAYERS}
            step={1}
            value={numSelected}
            onChange={(e) => setNumSelected(Number(e.target.value))}
            className="w-full accent-amber-500"
          />
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-3 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-emerald-400 opacity-60" /> Gaussian Prior
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-blue-400 opacity-60" /> Attention Score
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-violet-500" /> Combined Score
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-amber-400 border border-amber-500" /> Selected
        </span>
      </div>

      {/* SVG Chart */}
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full max-w-[700px]"
          role="img"
          aria-label="Layer importance bar chart"
        >
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
            const y = padding.top + chartHeight * (1 - frac);
            return (
              <g key={frac}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + chartWidth}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeDasharray={frac === 0 ? 'none' : '3,3'}
                  strokeWidth={0.5}
                />
                <text
                  x={padding.left - 8}
                  y={y + 3}
                  textAnchor="end"
                  fontSize={9}
                  fill="#94a3b8"
                >
                  {(frac * maxCombined).toFixed(3)}
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {combinedScores.map((score, i) => {
            const x = padding.left + (chartWidth / NUM_LAYERS) * i + 1;
            const barH = maxCombined > 0 ? (score / maxCombined) * chartHeight : 0;
            const y = padding.top + chartHeight - barH;
            const isSelected = selectedLayers.has(i);

            return (
              <g key={i}>
                {/* Combined bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barH}
                  rx={1}
                  fill={isSelected ? '#f59e0b' : '#8b5cf6'}
                  opacity={isSelected ? 0.9 : 0.7}
                  stroke={isSelected ? '#d97706' : 'none'}
                  strokeWidth={isSelected ? 1 : 0}
                />
                {/* Layer label */}
                {i % 4 === 0 && (
                  <text
                    x={x + barWidth / 2}
                    y={padding.top + chartHeight + 15}
                    textAnchor="middle"
                    fontSize={9}
                    fill="#94a3b8"
                  >
                    L{i}
                  </text>
                )}
              </g>
            );
          })}

          {/* Gaussian prior curve */}
          <path
            d={priorNorm
              .map((v, i) => {
                const x = padding.left + (chartWidth / NUM_LAYERS) * i + barWidth / 2 + 1;
                const y = padding.top + chartHeight - (maxCombined > 0 ? (v / maxCombined) * chartHeight : 0);
                return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
              })
              .join(' ')}
            fill="none"
            stroke="#34d399"
            strokeWidth={2}
            strokeDasharray="6,3"
            opacity={0.8}
          />

          {/* Attention score curve */}
          <path
            d={attnNorm
              .map((v, i) => {
                const x = padding.left + (chartWidth / NUM_LAYERS) * i + barWidth / 2 + 1;
                const y = padding.top + chartHeight - (maxCombined > 0 ? (v / maxCombined) * chartHeight : 0);
                return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
              })
              .join(' ')}
            fill="none"
            stroke="#60a5fa"
            strokeWidth={2}
            opacity={0.7}
          />

          {/* Axis label */}
          <text
            x={padding.left + chartWidth / 2}
            y={svgHeight - 5}
            textAnchor="middle"
            fontSize={11}
            fill="#64748b"
          >
            Layer Index
          </text>
        </svg>
      </div>

      <p className="text-xs text-slate-400 mt-3">
        alpha=1.0이면 Gaussian prior만, alpha=0.0이면 attention score만 사용합니다.
        중간값에서 두 시그널이 결합되어 더 robust한 선택이 가능합니다.
      </p>
    </div>
  );
}
