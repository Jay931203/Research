'use client';

import { useState, useMemo } from 'react';

type BondType = 'deep' | 'reflection' | 'exploration';

interface Bond {
  from: number;
  to: number;
  type: BondType;
}

const NUM_STEPS = 8;

const PRESETS: Record<string, { label: string; labelKo: string; bonds: Bond[] }> = {
  success: {
    label: 'Successful Reasoning',
    labelKo: '성공적 추론',
    bonds: [
      // Deep reasoning backbone (blue solid)
      { from: 1, to: 2, type: 'deep' },
      { from: 2, to: 3, type: 'deep' },
      { from: 3, to: 4, type: 'deep' },
      { from: 4, to: 5, type: 'deep' },
      { from: 5, to: 6, type: 'deep' },
      { from: 6, to: 7, type: 'deep' },
      { from: 7, to: 8, type: 'deep' },
      // Self-reflection (amber dashed, backward)
      { from: 4, to: 2, type: 'reflection' },
      { from: 6, to: 5, type: 'reflection' },
      // Self-exploration (emerald dotted, skip)
      { from: 3, to: 6, type: 'exploration' },
      { from: 5, to: 8, type: 'exploration' },
    ],
  },
  failure: {
    label: 'Failed Reasoning',
    labelKo: '실패한 추론',
    bonds: [
      // Weak deep reasoning backbone
      { from: 1, to: 2, type: 'deep' },
      { from: 2, to: 3, type: 'deep' },
      { from: 7, to: 8, type: 'deep' },
      // Excessive self-exploration (skip connections)
      { from: 2, to: 5, type: 'exploration' },
      { from: 3, to: 6, type: 'exploration' },
      { from: 3, to: 7, type: 'exploration' },
      { from: 4, to: 6, type: 'exploration' },
      { from: 4, to: 7, type: 'exploration' },
      { from: 5, to: 7, type: 'exploration' },
      { from: 5, to: 8, type: 'exploration' },
      // Minimal reflection
      { from: 6, to: 3, type: 'reflection' },
    ],
  },
};

const BOND_CONFIG: Record<BondType, {
  color: string;
  dasharray: string;
  labelEn: string;
  labelKo: string;
  bgClass: string;
  textClass: string;
}> = {
  deep: {
    color: '#3b82f6',
    dasharray: 'none',
    labelEn: 'Deep Reasoning',
    labelKo: '핵심 논리 골격',
    bgClass: 'bg-blue-100 dark:bg-blue-900/30',
    textClass: 'text-blue-700 dark:text-blue-300',
  },
  reflection: {
    color: '#f59e0b',
    dasharray: '8,4',
    labelEn: 'Self-Reflection',
    labelKo: '자기 검증 (backward)',
    bgClass: 'bg-amber-100 dark:bg-amber-900/30',
    textClass: 'text-amber-700 dark:text-amber-300',
  },
  exploration: {
    color: '#10b981',
    dasharray: '3,3',
    labelEn: 'Self-Exploration',
    labelKo: '대안 탐색 (skip)',
    bgClass: 'bg-emerald-100 dark:bg-emerald-900/30',
    textClass: 'text-emerald-700 dark:text-emerald-300',
  },
};

export default function TopologyBondViz() {
  const [preset, setPreset] = useState<'success' | 'failure'>('success');

  const bonds = PRESETS[preset].bonds;

  const bondCounts = useMemo(() => {
    const counts: Record<BondType, number> = { deep: 0, reflection: 0, exploration: 0 };
    bonds.forEach((b) => counts[b.type]++);
    return counts;
  }, [bonds]);

  const totalBonds = bonds.length;
  const maxCount = Math.max(...Object.values(bondCounts), 1);

  // SVG layout
  const svgWidth = 700;
  const svgHeight = 220;
  const nodeRadius = 22;
  const nodeSpacing = 76;
  const nodeY = 100;
  const startX = 55;

  const nodeX = (step: number) => startX + (step - 1) * nodeSpacing;

  // Generate curved paths for bonds
  function bondPath(bond: Bond): string {
    const x1 = nodeX(bond.from);
    const x2 = nodeX(bond.to);

    if (bond.type === 'deep') {
      // Forward connections: straight line at node level
      return `M ${x1 + nodeRadius} ${nodeY} L ${x2 - nodeRadius} ${nodeY}`;
    }

    if (bond.type === 'reflection') {
      // Backward connections: arc above
      const midX = (x1 + x2) / 2;
      const dist = Math.abs(bond.from - bond.to);
      const curveY = nodeY - 30 - dist * 12;
      return `M ${x1} ${nodeY - nodeRadius} Q ${midX} ${curveY} ${x2} ${nodeY - nodeRadius}`;
    }

    // Exploration: skip connections arc below
    const midX = (x1 + x2) / 2;
    const dist = Math.abs(bond.to - bond.from);
    const curveY = nodeY + 30 + dist * 10;
    return `M ${x1} ${nodeY + nodeRadius} Q ${midX} ${curveY} ${x2} ${nodeY + nodeRadius}`;
  }

  // Mini bar chart dimensions
  const barChartWidth = 300;
  const barChartHeight = 80;
  const barPadLeft = 110;
  const barH = 18;
  const barGap = 6;

  return (
    <div className="concept-card mb-6">
      <div className="text-xs font-semibold text-rose-600 dark:text-rose-400 mb-1">Interactive</div>
      <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4">
        Reasoning Chain Topology: Bond Types
      </h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
        추론 체인의 위상 구조를 세 가지 bond 유형으로 시각화합니다.
        성공적 추론과 실패한 추론의 구조적 차이를 비교하세요.
      </p>

      {/* Preset toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setPreset('success')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
            preset === 'success'
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
          }`}
        >
          Successful Reasoning
        </button>
        <button
          onClick={() => setPreset('failure')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
            preset === 'failure'
              ? 'bg-red-600 text-white'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
          }`}
        >
          Failed Reasoning
        </button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-4 text-xs">
        {(['deep', 'reflection', 'exploration'] as BondType[]).map((type) => {
          const cfg = BOND_CONFIG[type];
          return (
            <div key={type} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg ${cfg.bgClass}`}>
              <svg width="24" height="4" className="shrink-0">
                <line
                  x1="0" y1="2" x2="24" y2="2"
                  stroke={cfg.color}
                  strokeWidth={2}
                  strokeDasharray={cfg.dasharray}
                />
              </svg>
              <span className={`font-medium ${cfg.textClass}`}>{cfg.labelEn}</span>
              <span className="text-slate-400 dark:text-slate-500">({cfg.labelKo})</span>
            </div>
          );
        })}
      </div>

      {/* Main topology SVG */}
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full max-w-[700px]"
          role="img"
          aria-label="Reasoning chain topology visualization"
        >
          <defs>
            {(['deep', 'reflection', 'exploration'] as BondType[]).map((type) => (
              <marker
                key={type}
                id={`topo-arrow-${type}`}
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill={BOND_CONFIG[type].color} />
              </marker>
            ))}
          </defs>

          {/* Bonds */}
          {bonds.map((bond, i) => {
            const cfg = BOND_CONFIG[bond.type];
            return (
              <path
                key={`bond-${i}`}
                d={bondPath(bond)}
                fill="none"
                stroke={cfg.color}
                strokeWidth={2}
                strokeDasharray={cfg.dasharray}
                opacity={0.75}
                markerEnd={`url(#topo-arrow-${bond.type})`}
              />
            );
          })}

          {/* Step nodes */}
          {Array.from({ length: NUM_STEPS }, (_, i) => {
            const step = i + 1;
            const x = nodeX(step);
            return (
              <g key={step}>
                <circle
                  cx={x}
                  cy={nodeY}
                  r={nodeRadius}
                  fill="white"
                  stroke="#94a3b8"
                  strokeWidth={2}
                  className="dark:fill-slate-800"
                />
                <text
                  x={x}
                  y={nodeY + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={13}
                  fontWeight={700}
                  className="fill-slate-700 dark:fill-slate-200"
                >
                  {step}
                </text>
                <text
                  x={x}
                  y={nodeY + nodeRadius + 16}
                  textAnchor="middle"
                  fontSize={9}
                  className="fill-slate-400 dark:fill-slate-500"
                >
                  Step {step}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Bond distribution mini bar chart */}
      <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
          Bond Type 분포
        </div>
        <svg
          viewBox={`0 0 ${barChartWidth} ${barChartHeight}`}
          className="w-full max-w-[300px]"
          role="img"
          aria-label="Bond type distribution chart"
        >
          {(['deep', 'reflection', 'exploration'] as BondType[]).map((type, i) => {
            const cfg = BOND_CONFIG[type];
            const count = bondCounts[type];
            const barW = maxCount > 0 ? (count / maxCount) * (barChartWidth - barPadLeft - 40) : 0;
            const y = i * (barH + barGap);

            return (
              <g key={type}>
                <text
                  x={barPadLeft - 8}
                  y={y + barH / 2 + 4}
                  textAnchor="end"
                  fontSize={10}
                  className="fill-slate-500 dark:fill-slate-400"
                >
                  {cfg.labelEn}
                </text>
                <rect
                  x={barPadLeft}
                  y={y}
                  width={barW}
                  height={barH}
                  rx={3}
                  fill={cfg.color}
                  opacity={0.8}
                />
                <text
                  x={barPadLeft + barW + 6}
                  y={y + barH / 2 + 4}
                  fontSize={10}
                  fontWeight={600}
                  className="fill-slate-600 dark:fill-slate-300"
                >
                  {count} ({totalBonds > 0 ? ((count / totalBonds) * 100).toFixed(0) : 0}%)
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3 mt-4 text-center">
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{bondCounts.deep}</div>
          <div className="text-xs text-blue-600 dark:text-blue-400">Deep Reasoning</div>
        </div>
        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
          <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">{bondCounts.reflection}</div>
          <div className="text-xs text-amber-600 dark:text-amber-400">Self-Reflection</div>
        </div>
        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
          <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{bondCounts.exploration}</div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400">Self-Exploration</div>
        </div>
      </div>

      <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">
        {preset === 'success'
          ? '성공적 추론은 Deep Reasoning이 강한 골격을 이루고, Self-Reflection과 Self-Exploration이 보완합니다.'
          : '실패한 추론은 Deep Reasoning 골격이 약하고 Self-Exploration만 과도하게 반복됩니다. 방향 없는 탐색이 오류를 누적시킵니다.'}
      </p>
    </div>
  );
}
