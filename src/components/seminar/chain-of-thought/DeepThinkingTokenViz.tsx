'use client';

import { useState, useMemo } from 'react';

const TOKENS = ['Let', 'me', 'think', 'step', 'by', 'step', ':', '2+3=5'];
const NUM_LAYERS = 8;

// JSD values per token per layer: [token][layer]
// Higher JSD = prediction still changing at that layer = deeper thinking
const PRESETS = {
  simple: {
    label: 'Simple Question',
    labelKo: '쉬운 질문',
    data: [
      [0.05, 0.03, 0.02, 0.01, 0.01, 0.01, 0.01, 0.01], // Let
      [0.04, 0.02, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01], // me
      [0.08, 0.05, 0.03, 0.02, 0.01, 0.01, 0.01, 0.01], // think
      [0.06, 0.04, 0.02, 0.01, 0.01, 0.01, 0.01, 0.01], // step
      [0.03, 0.02, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01], // by
      [0.05, 0.03, 0.02, 0.01, 0.01, 0.01, 0.01, 0.01], // step
      [0.02, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01], // :
      [0.15, 0.10, 0.06, 0.03, 0.02, 0.01, 0.01, 0.01], // 2+3=5
    ],
  },
  hard: {
    label: 'Hard Question',
    labelKo: '어려운 질문',
    data: [
      [0.12, 0.10, 0.08, 0.05, 0.03, 0.02, 0.01, 0.01], // Let
      [0.06, 0.04, 0.03, 0.02, 0.01, 0.01, 0.01, 0.01], // me
      [0.45, 0.38, 0.30, 0.22, 0.15, 0.10, 0.06, 0.03], // think
      [0.35, 0.30, 0.25, 0.20, 0.14, 0.09, 0.05, 0.02], // step
      [0.08, 0.05, 0.03, 0.02, 0.01, 0.01, 0.01, 0.01], // by
      [0.30, 0.25, 0.20, 0.16, 0.12, 0.08, 0.04, 0.02], // step
      [0.04, 0.03, 0.02, 0.01, 0.01, 0.01, 0.01, 0.01], // :
      [0.55, 0.48, 0.40, 0.32, 0.25, 0.18, 0.12, 0.06], // 2+3=5
    ],
  },
};

function getJsdColor(jsd: number): string {
  if (jsd < 0.05) return '#e2e8f0'; // slate-200
  if (jsd < 0.10) return '#cbd5e1'; // slate-300
  if (jsd < 0.15) return '#93c5fd'; // blue-300
  if (jsd < 0.20) return '#fcd34d'; // amber-300
  if (jsd < 0.30) return '#fbbf24'; // amber-400
  if (jsd < 0.40) return '#f97316'; // orange-500
  return '#ea580c'; // orange-600
}

function getJsdColorDark(jsd: number): string {
  if (jsd < 0.05) return '#334155'; // slate-700
  if (jsd < 0.10) return '#475569'; // slate-600
  if (jsd < 0.15) return '#1e40af'; // blue-800
  if (jsd < 0.20) return '#92400e'; // amber-800
  if (jsd < 0.30) return '#b45309'; // amber-700
  if (jsd < 0.40) return '#c2410c'; // orange-700
  return '#ea580c'; // orange-600
}

function getTextColor(jsd: number): string {
  return jsd >= 0.20 ? '#ffffff' : '#475569';
}

function getTextColorDark(jsd: number): string {
  return jsd >= 0.20 ? '#ffffff' : '#cbd5e1';
}

export default function DeepThinkingTokenViz() {
  const [preset, setPreset] = useState<'simple' | 'hard'>('hard');
  const [threshold, setThreshold] = useState(0.3);

  const data = PRESETS[preset].data;

  const { deepTokenIndices, deepCount, dtr } = useMemo(() => {
    const indices = new Set<number>();
    data.forEach((layerValues, tokenIdx) => {
      const maxJsd = Math.max(...layerValues);
      if (maxJsd >= threshold) {
        indices.add(tokenIdx);
      }
    });
    const count = indices.size;
    return {
      deepTokenIndices: indices,
      deepCount: count,
      dtr: (count / TOKENS.length) * 100,
    };
  }, [data, threshold]);

  // SVG dimensions for heatmap
  const cellW = 64;
  const cellH = 32;
  const labelW = 50;
  const labelH = 28;
  const svgWidth = labelW + TOKENS.length * cellW + 10;
  const svgHeight = labelH + NUM_LAYERS * cellH + 10;

  return (
    <div className="concept-card mb-6">
      <div className="text-xs font-semibold text-orange-600 dark:text-orange-400 mb-1">Interactive</div>
      <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4">
        Deep-Thinking Token Heatmap
      </h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
        각 토큰이 레이어별로 얼마나 깊이 사고하는지를 JSD 값으로 시각화합니다.
        질문 유형과 threshold를 변경하면서 deep-thinking token이 어떻게 변하는지 확인하세요.
      </p>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setPreset('simple')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              preset === 'simple'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            Simple Question
          </button>
          <button
            onClick={() => setPreset('hard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              preset === 'hard'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            Hard Question
          </button>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
            Deep threshold: <strong className="text-orange-600 dark:text-orange-400">{threshold.toFixed(2)}</strong>
          </label>
          <input
            type="range"
            min={0.05}
            max={0.6}
            step={0.05}
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="w-full max-w-xs accent-orange-500"
          />
        </div>
      </div>

      {/* Color scale legend */}
      <div className="flex items-center gap-2 mb-3 text-xs text-slate-500 dark:text-slate-400">
        <span>Low JSD</span>
        <div className="flex rounded overflow-hidden">
          {[0.02, 0.07, 0.12, 0.17, 0.25, 0.35, 0.45].map((v) => (
            <div
              key={v}
              className="w-6 h-4 dark:hidden"
              style={{ backgroundColor: getJsdColor(v) }}
            />
          ))}
          {[0.02, 0.07, 0.12, 0.17, 0.25, 0.35, 0.45].map((v) => (
            <div
              key={`dark-${v}`}
              className="w-6 h-4 hidden dark:block"
              style={{ backgroundColor: getJsdColorDark(v) }}
            />
          ))}
        </div>
        <span>High JSD</span>
      </div>

      {/* Heatmap SVG */}
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full max-w-[580px]"
          role="img"
          aria-label="Deep-thinking token heatmap"
        >
          {/* Token labels (top) */}
          {TOKENS.map((token, ti) => (
            <text
              key={`label-${ti}`}
              x={labelW + ti * cellW + cellW / 2}
              y={labelH - 6}
              textAnchor="middle"
              fontSize={11}
              fontWeight={deepTokenIndices.has(ti) ? 700 : 400}
              fill={deepTokenIndices.has(ti) ? '#ea580c' : '#64748b'}
            >
              {token}
            </text>
          ))}

          {/* Layer labels (left) */}
          {Array.from({ length: NUM_LAYERS }, (_, li) => (
            <text
              key={`layer-${li}`}
              x={labelW - 8}
              y={labelH + li * cellH + cellH / 2 + 4}
              textAnchor="end"
              fontSize={10}
              fill="#94a3b8"
            >
              L{li + 1}
            </text>
          ))}

          {/* Heatmap cells - light mode */}
          {data.map((layerValues, ti) =>
            layerValues.map((jsd, li) => {
              const x = labelW + ti * cellW;
              const y = labelH + li * cellH;
              const isDeep = deepTokenIndices.has(ti);

              return (
                <g key={`cell-${ti}-${li}`}>
                  <rect
                    x={x + 1}
                    y={y + 1}
                    width={cellW - 2}
                    height={cellH - 2}
                    rx={3}
                    fill={getJsdColor(jsd)}
                    stroke={isDeep ? '#ea580c' : 'none'}
                    strokeWidth={isDeep ? 1.5 : 0}
                  />
                  <text
                    x={x + cellW / 2}
                    y={y + cellH / 2 + 4}
                    textAnchor="middle"
                    fontSize={9}
                    fill={getTextColor(jsd)}
                  >
                    {jsd.toFixed(2)}
                  </text>
                </g>
              );
            })
          )}
        </svg>
      </div>

      {/* DTR calculation */}
      <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
          DTR (Deep-Thinking Token Ratio) 계산
        </div>
        <div className="font-mono text-sm text-slate-600 dark:text-slate-400">
          DTR = deep-thinking tokens / total ={' '}
          <strong className="text-orange-600 dark:text-orange-400">{deepCount}</strong> /{' '}
          {TOKENS.length} ={' '}
          <strong className="text-orange-600 dark:text-orange-400">{dtr.toFixed(1)}%</strong>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {TOKENS.map((token, i) => {
            const isDeep = deepTokenIndices.has(i);
            return (
              <span
                key={i}
                className={`inline-flex items-center px-2 py-1 rounded-md border text-xs font-mono transition-all duration-300 ${
                  isDeep
                    ? 'bg-orange-100 dark:bg-orange-900/30 border-orange-400 dark:border-orange-600 text-orange-800 dark:text-orange-300 font-bold'
                    : 'bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400'
                }`}
              >
                {token}
                {isDeep && (
                  <span className="ml-1 text-orange-500 dark:text-orange-400 text-[10px]">deep</span>
                )}
              </span>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mt-4 text-center">
        <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
          <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">{deepCount}</div>
          <div className="text-xs text-orange-600 dark:text-orange-400">Deep Tokens</div>
        </div>
        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="text-2xl font-bold text-slate-700 dark:text-slate-300">{TOKENS.length - deepCount}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Shallow Tokens</div>
        </div>
        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
          <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">{dtr.toFixed(1)}%</div>
          <div className="text-xs text-amber-600 dark:text-amber-400">DTR</div>
        </div>
      </div>

      <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">
        어려운 질문에서는 &ldquo;think&rdquo;, &ldquo;step&rdquo;, &ldquo;2+3=5&rdquo; 등 실제 추론 토큰의 JSD가
        높아지며, 이들이 deep-thinking token으로 분류됩니다.
        Threshold를 낮추면 더 많은 토큰이 deep으로 분류됩니다.
      </p>
    </div>
  );
}
