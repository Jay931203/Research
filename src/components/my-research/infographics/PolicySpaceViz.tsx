'use client';

import { useState, useEffect, useCallback } from 'react';

const TOTAL_SQUARES = 256;
const GRID_COLS = 16;

// Pseudo-random selected indices for the ILP-filtered candidates (K=12)
const ILP_SELECTED = [3, 17, 29, 45, 62, 81, 98, 112, 133, 154, 178, 203];

// Budget columns for KL refinement
const BUDGETS = [
  { label: 'c=0.25', val: 0.25 },
  { label: 'c=0.40', val: 0.40 },
  { label: 'c=0.55', val: 0.55 },
  { label: 'c=0.70', val: 0.70 },
  { label: 'c=0.85', val: 0.85 },
];

// Best candidate index per budget (from ILP_SELECTED)
const BEST_PER_BUDGET = [0, 2, 5, 8, 11];

// Actual bit-width assignments per budget (M=6 blocks)
// Block 5 (FC-z) has highest Hessian sensitivity → always gets higher bits
const BLOCK_NAMES = ['Conv', 'SSM-1', 'SSM-2', 'SSM-3', 'FC-z★', 'Proj'];
const POLICY_TABLE = [
  { label: 'c=75%',    bits: [4, 4, 4, 4, 8,  4],  avgBits: 4.67 },
  { label: 'c=80%',    bits: [4, 8, 4, 4, 8,  8],  avgBits: 6.00 },
  { label: 'c=87.5%',  bits: [8, 8, 4, 8, 16, 8],  avgBits: 8.67 },
  { label: 'c=90%',    bits: [8, 8, 8, 8, 16, 8],  avgBits: 9.33 },
  { label: 'c=93.75%', bits: [16,8, 8, 16,16, 16], avgBits: 13.33 },
] as const;

function bitColor(b: number) {
  if (b === 4)  return 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300';
  if (b === 8)  return 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300';
  if (b === 16) return 'bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300';
  return 'bg-gray-100 text-gray-600';
}

type Stage = 0 | 1 | 2;

// Gaussian PDF approximation for SVG curve
function gaussianPoints(cx: number, cy: number, w: number, h: number, sigma: number, n = 30): string {
  const points: string[] = [];
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * w;
    const x = cx - w / 2 + t;
    const z = (t - w / 2) / (sigma * w / 4);
    const val = Math.exp(-0.5 * z * z);
    const y = cy - val * h;
    points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return points.join(' ');
}

export default function PolicySpaceViz() {
  const [stage, setStage] = useState<Stage>(0);
  const [animating, setAnimating] = useState(false);

  const advanceStage = useCallback(() => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setStage((s) => (s < 2 ? ((s + 1) as Stage) : s));
      setAnimating(false);
    }, 300);
  }, [animating]);

  const reset = () => {
    setStage(0);
  };

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-md w-full">
      <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
        RP-MPQ 정책 공간 탐색
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        지수적 정책 공간을 ILP + KL 정제로 단계적으로 압축하는 과정을 시각화합니다.
      </p>

      {/* Progress indicator */}
      <div className="flex items-center gap-2 mb-5">
        {(['전체 공간', 'ILP 필터링', 'KL 정제'] as const).map((label, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
                stage >= i
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  stage >= i ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                {i + 1}
              </span>
              {label}
            </div>
            {i < 2 && (
              <span className={`text-gray-300 dark:text-gray-600 ${stage > i ? 'text-blue-400' : ''}`}>→</span>
            )}
          </div>
        ))}
      </div>

      {/* STAGE 0 & 1: Policy space grid */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <div>
            {stage === 0 && (
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                전체 정책 공간: |B|<sup>M</sup> = 4<sup>6</sup> = 4096 가지
              </p>
            )}
            {stage >= 1 && (
              <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                ILP 필터링: K=12개로 축소
              </p>
            )}
          </div>
          {stage === 0 && (
            <span className="text-xs text-gray-400 dark:text-gray-500 italic">
              (256개 표시 = 전체 공간 축약)
            </span>
          )}
        </div>

        {/* Grid */}
        <div
          className="grid gap-0.5 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
          style={{ gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: TOTAL_SQUARES }, (_, i) => {
            const isSelected = ILP_SELECTED.includes(i);
            const showSelected = stage >= 1;

            let cellClass = '';
            if (showSelected) {
              if (isSelected) {
                cellClass =
                  'bg-blue-500 dark:bg-blue-500 shadow-sm scale-105 z-10 relative rounded-sm';
              } else {
                cellClass = 'bg-gray-100 dark:bg-gray-700/30 rounded-sm opacity-20';
              }
            } else {
              cellClass = 'bg-gray-300 dark:bg-gray-600 rounded-sm';
            }

            return (
              <div
                key={i}
                className={`aspect-square transition-all duration-300 ${cellClass}`}
                title={isSelected && showSelected ? `후보 정책 #${ILP_SELECTED.indexOf(i) + 1}` : `정책 #${i + 1}`}
              />
            );
          })}
        </div>

        {stage === 0 && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 text-center">
            M=6 블록, B=&#123;2,4,8,16&#125;비트 → 4096 가지 정책 (완전 탐색 불가)
          </p>
        )}
        {stage >= 1 && (
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1.5 text-center">
            민감도 기반 ILP: 4096 → K=12개 후보로 압축 (99.7% 감소)
          </p>
        )}
      </div>

      {/* STAGE 2: KL Refinement — bit-width assignment table */}
      {stage >= 2 && (
        <div className="mb-5 transition-all duration-500">
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 mb-1">
            KL 정제: 예산별 최적 비트폭 할당 (Π_C 결과)
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            ★ FC-z 블록은 Hessian Tr(H) 최고 → 모든 예산에서 항상 높은 비트폭 할당
          </p>
          <div className="overflow-x-auto rounded-xl border border-emerald-200 dark:border-emerald-800">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-emerald-50 dark:bg-emerald-950/30">
                  <th className="px-3 py-2 text-left font-semibold text-emerald-700 dark:text-emerald-300 border-b border-emerald-200 dark:border-emerald-800">
                    예산
                  </th>
                  {BLOCK_NAMES.map((name) => (
                    <th
                      key={name}
                      className={`px-2 py-2 text-center font-semibold border-b border-emerald-200 dark:border-emerald-800 ${
                        name === 'FC-z★'
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-emerald-700 dark:text-emerald-300'
                      }`}
                    >
                      {name}
                    </th>
                  ))}
                  <th className="px-3 py-2 text-center font-semibold text-emerald-700 dark:text-emerald-300 border-b border-emerald-200 dark:border-emerald-800">
                    평균 비트
                  </th>
                </tr>
              </thead>
              <tbody>
                {POLICY_TABLE.map((row, ri) => (
                  <tr
                    key={row.label}
                    className="border-b border-emerald-100 dark:border-emerald-900/40 last:border-0 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20"
                  >
                    <td className="px-3 py-2 font-mono font-semibold text-emerald-700 dark:text-emerald-300">
                      {row.label}
                    </td>
                    {row.bits.map((b, bi) => (
                      <td key={bi} className="px-2 py-1.5 text-center">
                        <span
                          className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold ${bitColor(b)}`}
                        >
                          INT{b}
                        </span>
                      </td>
                    ))}
                    <td className="px-3 py-2 text-center font-mono font-bold text-emerald-700 dark:text-emerald-300">
                      {row.avgBits.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap gap-3 mt-2">
            {[['INT4','bg-emerald-200 text-emerald-700','낮은 민감도 블록'],
              ['INT8','bg-amber-200 text-amber-700','중간 민감도'],
              ['INT16','bg-red-200 text-red-700','높은 민감도 (FC-z 등)']].map(([label, cls, desc]) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${cls}`}>{label}</span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400">{desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-3">
        {stage < 2 && (
          <button
            onClick={advanceStage}
            disabled={animating}
            className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white text-sm font-medium transition-colors"
          >
            {stage === 0 ? 'ILP 적용 →' : 'KL 정제 →'}
          </button>
        )}
        {stage > 0 && (
          <button
            onClick={reset}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium transition-colors"
          >
            처음으로
          </button>
        )}
        {stage === 2 && (
          <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
            완료: 예산별 최적 정책이 결정되었습니다.
          </span>
        )}
      </div>

      {/* Summary note */}
      <div className="mt-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-3">
        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
          <span className="font-semibold text-gray-800 dark:text-gray-200">RP-MPQ 오프라인 단계:</span>{' '}
          (1) ILP로 Hessian 민감도 조건을 만족하는 K개 후보 정책 선정,
          (2) 각 연산 예산 c에 대해 FP32 분포와의 KL 발산을 최소화하는 정책 선택.
          온라인 단계에서는 채널 상태에 따라 이 사전 계산된 정책 테이블에서 즉시 선택합니다.
        </p>
      </div>
    </div>
  );
}
