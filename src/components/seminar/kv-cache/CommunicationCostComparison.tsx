'use client';

import { useState } from 'react';

interface CommunicationMethod {
  label: string;
  tokens: number;
  latencyMs: number;
  color: string;
  description: string;
}

const methods: CommunicationMethod[] = [
  {
    label: 'TextMAS',
    tokens: 512,
    latencyMs: 2400,
    color: '#f87171', // red-400
    description: 'Text 기반: decode + re-encode',
  },
  {
    label: 'Latent MAS\n(All Layers)',
    tokens: 128,
    latencyMs: 800,
    color: '#60a5fa', // blue-400
    description: 'KV 전체 layer 전송',
  },
  {
    label: 'KVComm\n(Selected)',
    tokens: 48,
    latencyMs: 350,
    color: '#a78bfa', // violet-400
    description: 'KV 선택 layer만 전송',
  },
  {
    label: 'KVComm +\nSnapKV',
    tokens: 20,
    latencyMs: 180,
    color: '#34d399', // emerald-400
    description: 'Layer 선택 + cache 압축',
  },
];

export default function CommunicationCostComparison() {
  const [metric, setMetric] = useState<'tokens' | 'latency'>('tokens');

  const maxVal = Math.max(...methods.map((m) => (metric === 'tokens' ? m.tokens : m.latencyMs)));
  const unit = metric === 'tokens' ? 'tokens' : 'ms';

  // SVG dimensions
  const svgWidth = 600;
  const svgHeight = 220;
  const padding = { top: 20, right: 90, bottom: 30, left: 120 };
  const chartWidth = svgWidth - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;
  const barHeight = chartHeight / methods.length - 8;

  return (
    <div className="concept-card mb-6">
      <div className="text-xs font-semibold text-cyan-600 mb-1">Interactive</div>
      <h3 className="font-bold text-slate-800 mb-4">Communication Cost Comparison</h3>
      <p className="text-sm text-slate-600 mb-4">
        Text 기반과 KV cache 기반 소통의 비용을 비교합니다.
        Token 수와 latency 두 가지 관점으로 전환할 수 있습니다.
      </p>

      {/* Metric toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setMetric('tokens')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
            metric === 'tokens'
              ? 'bg-teal-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Token Count
        </button>
        <button
          onClick={() => setMetric('latency')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
            metric === 'latency'
              ? 'bg-teal-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Latency
        </button>
      </div>

      {/* SVG horizontal bar chart */}
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full max-w-[600px]"
          role="img"
          aria-label="Communication cost comparison chart"
        >
          {methods.map((method, i) => {
            const val = metric === 'tokens' ? method.tokens : method.latencyMs;
            const barW = maxVal > 0 ? (val / maxVal) * chartWidth : 0;
            const y = padding.top + (chartHeight / methods.length) * i + 4;

            return (
              <g key={method.label}>
                {/* Label */}
                <text
                  x={padding.left - 8}
                  y={y + barHeight / 2 + 4}
                  textAnchor="end"
                  fontSize={11}
                  fill="#475569"
                  fontWeight={500}
                >
                  {method.label.split('\n').map((line, li) => (
                    <tspan key={li} x={padding.left - 8} dy={li === 0 ? 0 : 13}>
                      {line}
                    </tspan>
                  ))}
                </text>

                {/* Bar */}
                <rect
                  x={padding.left}
                  y={y}
                  width={barW}
                  height={barHeight}
                  rx={4}
                  fill={method.color}
                  opacity={0.85}
                >
                  <animate
                    attributeName="width"
                    from="0"
                    to={barW}
                    dur="0.6s"
                    fill="freeze"
                  />
                </rect>

                {/* Value label */}
                <text
                  x={padding.left + barW + 6}
                  y={y + barHeight / 2 + 4}
                  fontSize={11}
                  fill="#64748b"
                  fontWeight={600}
                >
                  {val} {unit}
                </text>
              </g>
            );
          })}

          {/* Baseline reference line */}
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={padding.top + chartHeight}
            stroke="#cbd5e1"
            strokeWidth={1}
          />
        </svg>
      </div>

      {/* Description */}
      <div className="grid sm:grid-cols-2 gap-2 mt-3">
        {methods.map((method) => {
          const val = metric === 'tokens' ? method.tokens : method.latencyMs;
          const reduction = ((1 - val / (metric === 'tokens' ? methods[0].tokens : methods[0].latencyMs)) * 100);
          return (
            <div key={method.label} className="flex items-center gap-2 text-xs text-slate-500">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: method.color }}
              />
              <span>
                {method.description}
                {reduction > 0 && (
                  <span className="text-emerald-600 font-medium ml-1">
                    (-{reduction.toFixed(0)}%)
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-slate-400 mt-3">
        수치는 개념적 비교를 위한 추정치입니다.
        Layer 선택(KVComm) + cache 압축(SnapKV)을 결합하면 text 대비 최대 96%까지 통신 비용을 줄일 수 있습니다.
      </p>
    </div>
  );
}
