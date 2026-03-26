'use client';

import { useState } from 'react';

/**
 * Interactive 1D → 2D → 4D extension diagram showing
 * how the parameter space grows from line spectrum to ISAC.
 */
export default function DimensionExtensionDiagram() {
  const [activePanel, setActivePanel] = useState<'1d' | '2d' | '4d'>('1d');

  const panels = {
    '1d': {
      title: '1D: Frequency',
      subtitle: 'Tang et al. (2013)',
      color: '#6366f1',
      bgClass: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800',
      btnClass: 'border-indigo-300 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300',
      desc: '주파수(frequency) 하나만 추정합니다. 파라미터 공간은 1차원 직선 [0, 1)입니다. Toeplitz 행렬로 SDP를 구성합니다.',
      params: ['Frequency (delay)'],
      sdp: 'Toeplitz matrix',
      atom: 'a(τ)',
    },
    '2d': {
      title: '2D: Delay-Doppler',
      subtitle: 'Sedighi et al. (2021)',
      color: '#10b981',
      bgClass: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
      btnClass: 'border-emerald-300 dark:border-emerald-600 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
      desc: '지연(delay)과 도플러(Doppler)를 동시에 추정합니다. 파라미터 공간은 2차원 평면 [0,1) x [0,1)입니다. Block Toeplitz 행렬로 SDP를 구성합니다.',
      params: ['Delay', 'Doppler'],
      sdp: 'Block Toeplitz matrix',
      atom: 'g(ψ)* ⊗ b(φ)',
    },
    '4d': {
      title: '4D: Delay-Doppler-AoD-AoA',
      subtitle: 'Kim et al. (2024)',
      color: '#f59e0b',
      bgClass: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
      btnClass: 'border-amber-300 dark:border-amber-600 bg-amber-50 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
      desc: '4개의 파라미터를 동시에 추정합니다. 직접적인 ANM 적용이 불가하여 lifting 기법으로 비선형 구조를 선형화한 후 LANM으로 풀어냅니다.',
      params: ['Delay', 'Doppler', 'AoD', 'AoA'],
      sdp: 'Lifting + LANM (SDP)',
      atom: 'h_k · a(τ_k)^H',
    },
  };

  const current = panels[activePanel];

  // SVG dimensions
  const svgW = 700;
  const svgH = 220;

  return (
    <div className="concept-card mb-6">
      <div className="text-xs font-semibold text-violet-600 dark:text-violet-400 mb-1">Interactive Diagram</div>
      <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">1D &rarr; 2D &rarr; 4D 확장 과정</h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
        세 논문이 파라미터 공간을 점진적으로 확장하는 과정을 보여줍니다.
        각 단계를 클릭하여 세부 내용을 확인하세요.
      </p>

      {/* Dimension tabs */}
      <div className="flex gap-2 mb-5">
        {(Object.keys(panels) as Array<keyof typeof panels>).map((key) => (
          <button
            key={key}
            onClick={() => setActivePanel(key)}
            className={`px-4 py-2 text-xs font-medium rounded-lg border transition-all ${
              activePanel === key
                ? panels[key].btnClass + ' shadow-sm'
                : 'border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            {panels[key].title}
          </button>
        ))}
      </div>

      {/* SVG Visualization */}
      <div className="overflow-x-auto mb-4">
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full min-w-[500px] h-auto">
          {/* 1D Panel */}
          <g>
            <rect x={20} y={30} width={190} height={160} rx={12}
              fill={activePanel === '1d' ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.04)'}
              stroke={activePanel === '1d' ? '#6366f1' : '#cbd5e1'}
              strokeWidth={activePanel === '1d' ? 2 : 1}
              style={{ transition: 'all 0.3s ease', cursor: 'pointer' }}
              onClick={() => setActivePanel('1d')}
            />
            <text x={115} y={55} textAnchor="middle" className="text-[12px] font-bold"
              fill={activePanel === '1d' ? '#6366f1' : '#94a3b8'}>1D</text>

            {/* Line representing frequency axis */}
            <line x1={50} y1={120} x2={195} y2={120} stroke="#6366f1" strokeWidth={2} />
            {/* Dots on line */}
            {[0.15, 0.35, 0.65, 0.85].map((p, i) => (
              <circle key={i} cx={50 + p * 145} cy={120} r={4} fill="#6366f1" />
            ))}
            <text x={115} y={155} textAnchor="middle" className="text-[10px]" fill="#64748b">frequency axis</text>
            <text x={115} y={170} textAnchor="middle" className="text-[9px]" fill="#94a3b8">Toeplitz SDP</text>
          </g>

          {/* Arrow 1D→2D */}
          <g>
            <line x1={218} y1={110} x2={248} y2={110} stroke="#94a3b8" strokeWidth={1.5} markerEnd="url(#dimArrow)" />
            <text x={233} y={100} textAnchor="middle" className="text-[9px]" fill="#94a3b8">+Doppler</text>
          </g>

          {/* 2D Panel */}
          <g>
            <rect x={255} y={30} width={190} height={160} rx={12}
              fill={activePanel === '2d' ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.04)'}
              stroke={activePanel === '2d' ? '#10b981' : '#cbd5e1'}
              strokeWidth={activePanel === '2d' ? 2 : 1}
              style={{ transition: 'all 0.3s ease', cursor: 'pointer' }}
              onClick={() => setActivePanel('2d')}
            />
            <text x={350} y={55} textAnchor="middle" className="text-[12px] font-bold"
              fill={activePanel === '2d' ? '#10b981' : '#94a3b8'}>2D</text>

            {/* Plane with dots */}
            <rect x={280} y={70} width={140} height={90} rx={4}
              fill="none" stroke="#10b981" strokeWidth={1} strokeDasharray="4 3" />
            {[[0.2, 0.3], [0.5, 0.7], [0.7, 0.2], [0.3, 0.8], [0.8, 0.6]].map(([px, py], i) => (
              <circle key={i} cx={280 + px * 140} cy={70 + py * 90} r={3.5} fill="#10b981" />
            ))}
            <text x={350} y={175} textAnchor="middle" className="text-[10px]" fill="#64748b">delay x Doppler</text>
            <text x={350} y={188} textAnchor="middle" className="text-[9px]" fill="#94a3b8">Block Toeplitz SDP</text>
          </g>

          {/* Arrow 2D→4D */}
          <g>
            <line x1={453} y1={110} x2={483} y2={110} stroke="#94a3b8" strokeWidth={1.5} markerEnd="url(#dimArrow)" />
            <text x={468} y={96} textAnchor="middle" className="text-[9px]" fill="#94a3b8">+AoD</text>
            <text x={468} y={106} textAnchor="middle" className="text-[9px]" fill="#94a3b8">+AoA</text>
          </g>

          {/* 4D Panel */}
          <g>
            <rect x={490} y={30} width={190} height={160} rx={12}
              fill={activePanel === '4d' ? 'rgba(245,158,11,0.12)' : 'rgba(245,158,11,0.04)'}
              stroke={activePanel === '4d' ? '#f59e0b' : '#cbd5e1'}
              strokeWidth={activePanel === '4d' ? 2 : 1}
              style={{ transition: 'all 0.3s ease', cursor: 'pointer' }}
              onClick={() => setActivePanel('4d')}
            />
            <text x={585} y={55} textAnchor="middle" className="text-[12px] font-bold"
              fill={activePanel === '4d' ? '#f59e0b' : '#94a3b8'}>4D</text>

            {/* Hypercube representation */}
            {/* Front face */}
            <rect x={520} y={80} width={70} height={55} rx={2}
              fill="none" stroke="#f59e0b" strokeWidth={1.2} />
            {/* Back face (offset) */}
            <rect x={545} y={65} width={70} height={55} rx={2}
              fill="none" stroke="#f59e0b" strokeWidth={0.8} opacity={0.5} />
            {/* Connecting edges */}
            <line x1={520} y1={80} x2={545} y2={65} stroke="#f59e0b" strokeWidth={0.6} opacity={0.4} />
            <line x1={590} y1={80} x2={615} y2={65} stroke="#f59e0b" strokeWidth={0.6} opacity={0.4} />
            <line x1={520} y1={135} x2={545} y2={120} stroke="#f59e0b" strokeWidth={0.6} opacity={0.4} />
            <line x1={590} y1={135} x2={615} y2={120} stroke="#f59e0b" strokeWidth={0.6} opacity={0.4} />
            {/* Dots inside */}
            {[[0.3, 0.4], [0.6, 0.7], [0.5, 0.2]].map(([px, py], i) => (
              <circle key={i} cx={530 + px * 50} cy={85 + py * 40} r={3} fill="#f59e0b" />
            ))}
            <text x={585} y={155} textAnchor="middle" className="text-[8px]" fill="#64748b">delay x Doppler</text>
            <text x={585} y={165} textAnchor="middle" className="text-[8px]" fill="#64748b">x AoD x AoA</text>
            <text x={585} y={188} textAnchor="middle" className="text-[9px]" fill="#94a3b8">Lifting + LANM</text>
          </g>

          {/* Arrow marker definition */}
          <defs>
            <marker id="dimArrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
            </marker>
          </defs>
        </svg>
      </div>

      {/* Detail panel */}
      <div className={`rounded-lg border p-5 transition-all ${current.bgClass}`}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: current.color + '20', color: current.color }}>
            {current.subtitle}
          </span>
          <h4 className="font-bold text-slate-800 dark:text-slate-200">{current.title}</h4>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{current.desc}</p>
        <div className="grid sm:grid-cols-3 gap-3 text-xs">
          <div className="p-2 bg-white/60 dark:bg-slate-800/40 rounded border border-slate-200 dark:border-slate-600">
            <div className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Parameters</div>
            <div className="flex flex-wrap gap-1">
              {current.params.map((p) => (
                <span key={p} className="px-1.5 py-0.5 rounded text-[10px]"
                  style={{ backgroundColor: current.color + '15', color: current.color }}>
                  {p}
                </span>
              ))}
            </div>
          </div>
          <div className="p-2 bg-white/60 dark:bg-slate-800/40 rounded border border-slate-200 dark:border-slate-600">
            <div className="font-semibold text-slate-700 dark:text-slate-300 mb-1">SDP Structure</div>
            <span className="text-slate-600 dark:text-slate-400">{current.sdp}</span>
          </div>
          <div className="p-2 bg-white/60 dark:bg-slate-800/40 rounded border border-slate-200 dark:border-slate-600">
            <div className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Atom</div>
            <span className="font-mono text-slate-600 dark:text-slate-400">{current.atom}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
