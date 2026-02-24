'use client';

import { useState } from 'react';

// Real data from paper (Table 1 & 2) + RP-MPQ frontier estimates
const ALL_POINTS = [
  // CsiNet (red)
  { id: 'csinet-fp32',  model: 'CsiNet',  prec: 'FP32',   nmse: -8.95,  bop: 0,      shape: 'circle'   },
  { id: 'csinet-int16', model: 'CsiNet',  prec: 'INT16',  nmse: -8.95,  bop: 75,     shape: 'square'   },
  { id: 'csinet-int8',  model: 'CsiNet',  prec: 'INT8',   nmse: 0.68,   bop: 87.5,   shape: 'triangle' },
  { id: 'csinet-int4',  model: 'CsiNet',  prec: 'INT4',   nmse: 17.35,  bop: 93.75,  shape: 'diamond'  },
  // Mamba-Transformer AE (indigo)
  { id: 'mamba-fp32',   model: 'Mamba',   prec: 'FP32',   nmse: -15.34, bop: 0,      shape: 'circle'   },
  { id: 'mamba-int16',  model: 'Mamba',   prec: 'INT16',  nmse: -15.34, bop: 75,     shape: 'square'   },
  { id: 'mamba-int8',   model: 'Mamba',   prec: 'INT8',   nmse: -15.12, bop: 87.5,   shape: 'triangle' },
  { id: 'mamba-int4',   model: 'Mamba',   prec: 'INT4',   nmse: 0.04,   bop: 93.75,  shape: 'diamond'  },
  // RP-MPQ frontier (green) — mixed precision, better than uniform at same budget
  { id: 'rpmpq-75',     model: 'RP-MPQ',  prec: 'c=75%',  nmse: -15.34, bop: 75,     shape: 'star'     },
  { id: 'rpmpq-875',    model: 'RP-MPQ',  prec: 'c=87.5%',nmse: -14.72, bop: 87.5,   shape: 'star'     },
  { id: 'rpmpq-9375',   model: 'RP-MPQ',  prec: 'c=93.75%',nmse:-13.18, bop: 93.75,  shape: 'star'     },
] as const;

type Point = typeof ALL_POINTS[number];

const MODEL_COLORS: Record<string, string> = {
  CsiNet: '#ef4444',
  Mamba:  '#6366f1',
  'RP-MPQ': '#10b981',
};

const MODEL_BG: Record<string, string> = {
  CsiNet: 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
  Mamba:  'bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
  'RP-MPQ': 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
};

// Chart dimensions
const svgW = 540;
const svgH = 340;
const padL = 56;
const padR = 24;
const padT = 28;
const padB = 46;
const plotW = svgW - padL - padR;
const plotH = svgH - padT - padB;

// Axis ranges — two zoom levels
const FULL_RANGE  = { xMin: -5, xMax: 100, yMin: -17, yMax: 21 };
const DETAIL_RANGE = { xMin: -5, xMax: 100, yMin: -17, yMax: 3 };

function xPos(bop: number, range: typeof FULL_RANGE) {
  return padL + ((bop - range.xMin) / (range.xMax - range.xMin)) * plotW;
}
function yPos(nmse: number, range: typeof FULL_RANGE) {
  // Lower NMSE (better) → higher on chart
  return padT + plotH - ((nmse - range.yMin) / (range.yMax - range.yMin)) * plotH;
}

function ShapeMark({
  cx, cy, shape, color, r = 7, hovered,
}: {
  cx: number; cy: number; shape: string; color: string; r?: number; hovered: boolean;
}) {
  const sr = hovered ? r * 1.5 : r;
  const opacity = hovered ? 1 : 0.85;
  const stroke = hovered ? 'white' : 'none';
  const strokeW = hovered ? 1.5 : 0;
  const props = { fill: color, opacity, stroke, strokeWidth: strokeW };

  switch (shape) {
    case 'circle':
      return <circle cx={cx} cy={cy} r={sr} {...props} />;
    case 'square':
      return <rect x={cx - sr} y={cy - sr} width={sr * 2} height={sr * 2} rx={1} {...props} />;
    case 'triangle':
      return (
        <polygon
          points={`${cx},${cy - sr} ${cx - sr},${cy + sr * 0.8} ${cx + sr},${cy + sr * 0.8}`}
          {...props}
        />
      );
    case 'diamond':
      return (
        <polygon
          points={`${cx},${cy - sr} ${cx + sr},${cy} ${cx},${cy + sr} ${cx - sr},${cy}`}
          {...props}
        />
      );
    case 'star':
      // 5-pointed star
      const pts: string[] = [];
      for (let i = 0; i < 10; i++) {
        const angle = (i * Math.PI) / 5 - Math.PI / 2;
        const rad = i % 2 === 0 ? sr * 1.2 : sr * 0.5;
        pts.push(`${(cx + Math.cos(angle) * rad).toFixed(1)},${(cy + Math.sin(angle) * rad).toFixed(1)}`);
      }
      return <polygon points={pts.join(' ')} {...props} />;
    default:
      return <circle cx={cx} cy={cy} r={sr} {...props} />;
  }
}

export default function NmseVsBopScatterViz() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [zoom, setZoom] = useState<'full' | 'detail'>('full');

  const range = zoom === 'full' ? FULL_RANGE : DETAIL_RANGE;
  const hoveredPt = hoveredId ? ALL_POINTS.find((p) => p.id === hoveredId) : null;

  // Y-axis tick values
  const yTicks = zoom === 'full' ? [-16, -8, 0, 8, 16] : [-16, -14, -12, -10, -8, -6, -4, -2, 0, 2];
  const xTicks = [0, 25, 50, 75, 93.75];

  // RP-MPQ frontier line points
  const rpmpqPts = ALL_POINTS.filter((p) => p.model === 'RP-MPQ');

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-md w-full">
      <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
        NMSE-BOP 효율 프론티어
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        동일한 BOP 절약에서 각 방식의 NMSE를 비교합니다. 오른쪽 아래가 최적 (高 절약 + 低 NMSE).
        RP-MPQ는 균일 양자화 대비 동일 예산에서 더 낮은 NMSE를 달성합니다.
      </p>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">보기 범위:</span>
        {(['full', 'detail'] as const).map((z) => (
          <button
            key={z}
            onClick={() => setZoom(z)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
              zoom === z
                ? 'bg-indigo-500 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {z === 'full' ? '전체 (INT4 포함)' : '상세 (-17 ~ +3 dB)'}
          </button>
        ))}
      </div>

      {/* Scatter plot */}
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          width="100%"
          height={svgH}
          className="block cursor-crosshair"
        >
          {/* "Ideal zone" annotation */}
          <rect
            x={xPos(70, range)}
            y={padT}
            width={xPos(100, range) - xPos(70, range)}
            height={yPos(-13, range) - padT}
            fill="#10b981"
            fillOpacity={0.05}
            rx={4}
          />
          <text
            x={xPos(82, range)}
            y={padT + 14}
            textAnchor="middle"
            fontSize={10}
            fill="#10b981"
            opacity={0.7}
          >
            이상적 영역 ↗
          </text>

          {/* Grid */}
          {yTicks.map((v) => (
            <g key={v}>
              <line
                x1={padL} y1={yPos(v, range)} x2={svgW - padR} y2={yPos(v, range)}
                stroke="#e5e7eb" strokeWidth={0.5} strokeDasharray="4,3"
                className="dark:stroke-gray-700"
              />
              <text x={padL - 4} y={yPos(v, range) + 3} textAnchor="end" fontSize={10} fill="#9ca3af">
                {v}
              </text>
            </g>
          ))}
          {xTicks.map((v) => (
            <g key={v}>
              <line
                x1={xPos(v, range)} y1={padT} x2={xPos(v, range)} y2={padT + plotH}
                stroke="#f3f4f6" strokeWidth={0.5}
                className="dark:stroke-gray-800"
              />
              <text
                x={xPos(v, range)} y={padT + plotH + 14}
                textAnchor="middle" fontSize={10} fill="#9ca3af"
              >
                {v === 93.75 ? '93.75%' : v === 0 ? 'FP32' : `${v}%`}
              </text>
            </g>
          ))}

          {/* Axes */}
          <line x1={padL} y1={padT + plotH} x2={svgW - padR} y2={padT + plotH} stroke="#9ca3af" strokeWidth={0.8} />
          <line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke="#9ca3af" strokeWidth={0.8} />

          {/* NMSE=0 dB reference line */}
          {range.yMin < 0 && range.yMax > 0 && (
            <line
              x1={padL} y1={yPos(0, range)} x2={svgW - padR} y2={yPos(0, range)}
              stroke="#ef4444" strokeWidth={0.8} strokeDasharray="6,3" opacity={0.4}
            />
          )}
          {range.yMax > 0 && (
            <text x={svgW - padR + 2} y={yPos(0, range) + 3} fontSize={10} fill="#ef4444" opacity={0.6}>
              0dB
            </text>
          )}

          {/* RP-MPQ frontier line */}
          {rpmpqPts.length >= 2 && (
            <polyline
              points={rpmpqPts.map((p) => `${xPos(p.bop, range)},${yPos(p.nmse, range)}`).join(' ')}
              fill="none"
              stroke="#10b981"
              strokeWidth={1.5}
              strokeDasharray="5,3"
              opacity={0.6}
            />
          )}

          {/* Data points */}
          {ALL_POINTS.map((pt) => {
            const cx = xPos(pt.bop, range);
            const cy = yPos(pt.nmse, range);
            const isOut = cy < padT || cy > padT + plotH;
            if (isOut) return null;
            const hovered = hoveredId === pt.id;
            const color = MODEL_COLORS[pt.model];
            return (
              <g
                key={pt.id}
                onMouseEnter={() => setHoveredId(pt.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="cursor-pointer"
              >
                <circle cx={cx} cy={cy} r={14} fill="transparent" />
                <ShapeMark cx={cx} cy={cy} shape={pt.shape} color={color} r={9} hovered={hovered} />
                {hovered && (
                  <text x={cx} y={cy - 14} textAnchor="middle" fontSize={11} fill={color} fontWeight="bold">
                    {pt.nmse.toFixed(1)} dB
                  </text>
                )}
              </g>
            );
          })}

          {/* Axis labels */}
          <text x={padL + plotW / 2} y={svgH - 4} textAnchor="middle" fontSize={11} fill="#9ca3af">
            BOP 절약 (%) →
          </text>
          <text
            x={10} y={padT + plotH / 2} textAnchor="middle" fontSize={11} fill="#9ca3af"
            transform={`rotate(-90, 10, ${padT + plotH / 2})`}
          >
            NMSE (dB) — 낮을수록 좋음 ↓
          </text>

          {/* Out-of-range indicator for full view */}
          {zoom === 'detail' &&
            ALL_POINTS.filter((p) => p.nmse > DETAIL_RANGE.yMax).map((pt) => (
              <g key={`oor-${pt.id}`}>
                <text
                  x={xPos(pt.bop, range)}
                  y={padT + plotH + 28}
                  textAnchor="middle"
                  fontSize={10}
                  fill={MODEL_COLORS[pt.model]}
                  opacity={0.7}
                >
                  ↓{pt.nmse.toFixed(0)}dB
                </text>
              </g>
            ))}
        </svg>
      </div>

      {/* Tooltip */}
      {hoveredPt && (
        <div
          className={`mt-2 rounded-lg border px-4 py-2 text-xs ${MODEL_BG[hoveredPt.model]}`}
        >
          <span className="font-bold">{hoveredPt.model} {hoveredPt.prec}: </span>
          NMSE = {hoveredPt.nmse.toFixed(2)} dB,{'  '}BOP 절약 = {hoveredPt.bop}%
          {hoveredPt.model === 'RP-MPQ' && (
            <span className="ml-2 font-medium">
              (혼합 정밀도 — 균일 양자화 대비 동일 예산에서 우수)
            </span>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">모델 (색상)</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {Object.entries(MODEL_COLORS).map(([model, color]) => (
              <div key={model} className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: color }} />
                <span className="text-xs text-gray-600 dark:text-gray-400">{model}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">정밀도 (모양)</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {[['FP32','●'],['INT16','■'],['INT8','▲'],['INT4','◆'],['RP-MPQ','★']].map(([label, sym]) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-gray-500">{sym}</span>
                <span className="text-xs text-gray-600 dark:text-gray-400">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key insights */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 px-3 py-2.5">
          <p className="text-xs font-bold text-red-700 dark:text-red-300 mb-1">CsiNet의 절벽</p>
          <p className="text-xs text-red-600 dark:text-red-400 leading-relaxed">
            INT8에서 NMSE +9.63 dB 급등. 양자화 민감도 높은 구조.
          </p>
        </div>
        <div className="rounded-lg bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 px-3 py-2.5">
          <p className="text-xs font-bold text-indigo-700 dark:text-indigo-300 mb-1">Mamba의 내성</p>
          <p className="text-xs text-indigo-600 dark:text-indigo-400 leading-relaxed">
            INT8에서 0.22 dB만 저하. 구조적 양자화 내성 우수.
          </p>
        </div>
        <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 px-3 py-2.5">
          <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300 mb-1">RP-MPQ 프론티어</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 leading-relaxed">
            93.75% 절약에서도 -13.18 dB. 균일 INT4(+0.04 dB) 대비 압도적 우위.
          </p>
        </div>
      </div>
    </div>
  );
}
