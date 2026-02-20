'use client';

import { useState } from 'react';

const NODES = [
  {
    id: 'ptq',
    x: 300, y: 30,
    width: 160, height: 56,
    color: '#6b7280', bg: '#f3f4f6', darkBg: '#374151', border: '#9ca3af',
    label: 'PTQ 도전과제',
    sub: '2비트 → 성능 붕괴',
    badge: '',
  },
  {
    id: 'quip',
    x: 140, y: 160,
    width: 200, height: 72,
    color: '#4f46e5', bg: '#eef2ff', darkBg: '#3730a3', border: '#818cf8',
    label: 'QuIP',
    sub: '비간섭 처리 + LDLQ',
    badge: 'NeurIPS 2024',
    ppl: '6.4',
  },
  {
    id: 'quipsharp',
    x: 140, y: 310,
    width: 200, height: 72,
    color: '#7c3aed', bg: '#f5f3ff', darkBg: '#5b21b6', border: '#a78bfa',
    label: 'QuIP#',
    sub: 'Hadamard + E8 격자',
    badge: 'ICML 2024',
    ppl: '5.6',
  },
  {
    id: 'aqlm',
    x: 420, y: 240,
    width: 200, height: 72,
    color: '#059669', bg: '#ecfdf5', darkBg: '#065f46', border: '#34d399',
    label: 'AQLM',
    sub: '가산 양자화 (M 코드북)',
    badge: 'ICML 2024',
    ppl: '5.07',
  },
] as const;

const EDGES = [
  { from: 'ptq', to: 'quip', label: '해결책 ①', dx: -30 },
  { from: 'ptq', to: 'aqlm', label: '해결책 ②', dx: 30 },
  { from: 'quip', to: 'quipsharp', label: '개선', dx: 0 },
];

function getCenter(id: string): [number, number] {
  const n = NODES.find((x) => x.id === id)!;
  return [n.x + n.width / 2, n.y + n.height / 2];
}

export default function PaperEvolutionGraph() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/60">
      <p className="mb-3 text-center text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        논문 계보 & 성능 진화 (Llama-2-7B, WikiText-2 Perplexity @ 2-bit)
      </p>

      <div className="overflow-x-auto">
        <svg width="640" height="420" viewBox="0 0 640 420" className="mx-auto block">
          <defs>
            <marker id="arrowEvo" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
              <path d="M0,0 L0,8 L8,4 z" fill="#9ca3af" />
            </marker>
          </defs>

          {/* Edges */}
          {EDGES.map((e) => {
            const [x1, y1] = getCenter(e.from);
            const [x2, y2] = getCenter(e.to);
            const mx = (x1 + x2) / 2 + e.dx;
            const my = (y1 + y2) / 2;
            return (
              <g key={`${e.from}-${e.to}`}>
                <path
                  d={`M${x1},${y1} Q${mx},${my} ${x2},${y2}`}
                  fill="none"
                  stroke="#9ca3af"
                  strokeWidth={1.5}
                  markerEnd="url(#arrowEvo)"
                />
                <text
                  x={mx}
                  y={my - 5}
                  textAnchor="middle"
                  fontSize={10}
                  fill="#9ca3af"
                  fontStyle="italic"
                >
                  {e.label}
                </text>
              </g>
            );
          })}

          {/* Nodes */}
          {NODES.map((node) => {
            const isActive = active === node.id;
            return (
              <g
                key={node.id}
                onClick={() => setActive(isActive ? null : node.id)}
                style={{ cursor: 'pointer' }}
              >
                <rect
                  x={node.x}
                  y={node.y}
                  width={node.width}
                  height={node.height}
                  rx={12}
                  fill={node.bg}
                  stroke={node.border}
                  strokeWidth={isActive ? 2.5 : 1.5}
                  filter={isActive ? 'drop-shadow(0 2px 8px rgba(0,0,0,0.15))' : undefined}
                />

                {/* Badge */}
                {node.badge && (
                  <text
                    x={node.x + node.width / 2}
                    y={node.y + 17}
                    textAnchor="middle"
                    fontSize={8.5}
                    fill={node.color}
                    fontWeight="bold"
                    opacity={0.8}
                  >
                    {node.badge}
                  </text>
                )}

                {/* Label */}
                <text
                  x={node.x + node.width / 2}
                  y={node.y + (node.badge ? 33 : 26)}
                  textAnchor="middle"
                  fontSize={14}
                  fontWeight="bold"
                  fill={node.color}
                >
                  {node.label}
                </text>

                {/* Sub */}
                <text
                  x={node.x + node.width / 2}
                  y={node.y + (node.badge ? 48 : 42)}
                  textAnchor="middle"
                  fontSize={9}
                  fill={node.color}
                  opacity={0.8}
                >
                  {node.sub}
                </text>

                {/* PPL badge */}
                {'ppl' in node && node.ppl && (
                  <>
                    <rect
                      x={node.x + node.width - 44}
                      y={node.y + node.height - 22}
                      width={40}
                      height={16}
                      rx={8}
                      fill={node.color}
                      opacity={0.15}
                    />
                    <text
                      x={node.x + node.width - 24}
                      y={node.y + node.height - 11}
                      textAnchor="middle"
                      fontSize={8.5}
                      fontWeight="bold"
                      fill={node.color}
                    >
                      {node.ppl} ppl
                    </text>
                  </>
                )}
              </g>
            );
          })}

          {/* FP16 baseline reference */}
          <line x1={80} y1={380} x2={560} y2={380} stroke="#e5e7eb" strokeWidth={1} strokeDasharray="4,3" />
          <text x={82} y={376} fontSize={9} fill="#9ca3af">FP16 기준: 5.47 ppl</text>

          {/* Performance axis */}
          <g>
            {[
              { ppl: '6.4', y: 260, id: 'quip' },
              { ppl: '5.6', y: 310, id: 'quipsharp' },
              { ppl: '5.07', y: 345, id: 'aqlm' },
            ].map(({ ppl, y, id }) => (
              <g key={id}>
                <circle cx={570} cy={y} r={3} fill={NODES.find((n) => n.id === id)!.color} />
                <text x={578} y={y + 4} fontSize={9} fill={NODES.find((n) => n.id === id)!.color}>
                  {ppl}
                </text>
              </g>
            ))}
            <line x1={568} y1={250} x2={568} y2={390} stroke="#e5e7eb" strokeWidth={0.5} />
            <text x={565} y={240} textAnchor="middle" fontSize={8} fill="#9ca3af" transform="rotate(-90,565,240)">
              ppl ↓
            </text>
          </g>
        </svg>
      </div>

      {/* Details panel on click */}
      {active && (
        <div className="mt-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          {active === 'ptq' && (
            <>
              <p className="font-bold text-gray-700 dark:text-gray-300">PTQ 도전과제</p>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                표준 PTQ(Post-Training Quantization)는 4비트에서 잘 동작하지만, 2비트로 내려가면 성능이 급격히 붕괴됩니다.
                균일 양자화 오차는 비트 수 b에 대해 <span className="font-mono">∝ 1/4^b</span>로 증가하기 때문입니다.
              </p>
            </>
          )}
          {active === 'quip' && (
            <>
              <p className="font-bold text-indigo-600 dark:text-indigo-300">QuIP (2024 NeurIPS)</p>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                <strong>핵심 아이디어:</strong> 가중치 행렬에 랜덤 직교 변환(Q_L, Q_R)을 곱해 비간섭 상태로 만든 뒤 양자화.
                비간섭 조건에서 양자화 오차에 대한 수학적 보장을 제공합니다.
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Llama-2-7B @ 2bit: PPL ≈ 6.4 (FP16 5.47 대비 약 17% 열화)
              </p>
            </>
          )}
          {active === 'quipsharp' && (
            <>
              <p className="font-bold text-purple-600 dark:text-purple-300">QuIP# (2024 ICML)</p>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                <strong>개선 1 (속도):</strong> 랜덤 직교 행렬 → Walsh-Hadamard 변환으로 교체. O(n log n)으로 빠름.
                <br /><strong>개선 2 (정밀도):</strong> 스칼라 양자화 → E8 격자 코드북. 8차원 가중치를 동시 양자화해 왜곡 최소화.
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Llama-2-7B @ 2bit: PPL ≈ 5.6 (FP16에 거의 손실 없는 수준!)
              </p>
            </>
          )}
          {active === 'aqlm' && (
            <>
              <p className="font-bold text-emerald-600 dark:text-emerald-300">AQLM (2024 ICML)</p>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                <strong>핵심 아이디어:</strong> W ≈ Σ C_m[b_m] (여러 코드북의 합으로 가중치 표현).
                전역 최적화(빔 서치 + SGD)로 코드북과 인덱스를 동시 학습합니다.
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Llama-2-7B @ 2bit: PPL ≈ 5.07 (FP16보다 낮은 것처럼 보이는 이유: 약간의 regularization 효과)
              </p>
            </>
          )}
        </div>
      )}

      <p className="mt-3 text-center text-[11px] italic text-gray-500 dark:text-gray-400">
        노드를 클릭하면 상세 설명을 확인할 수 있습니다
      </p>
    </div>
  );
}
