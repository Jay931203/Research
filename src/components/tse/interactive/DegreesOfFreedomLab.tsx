'use client';

import { useState, useMemo, useCallback } from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import Slider from 'rc-slider';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Map a linear slider value [0,1] to a logarithmic value in [lo, hi]. */
function logScale(t: number, lo: number, hi: number) {
  const logLo = Math.log10(lo);
  const logHi = Math.log10(hi);
  return Math.pow(10, logLo + t * (logHi - logLo));
}

/** Inverse of logScale: value -> [0,1] */
function invLogScale(v: number, lo: number, hi: number) {
  const logLo = Math.log10(lo);
  const logHi = Math.log10(hi);
  return (Math.log10(v) - logLo) / (logHi - logLo);
}

function formatHz(hz: number): string {
  if (hz >= 1e9) return `${(hz / 1e9).toFixed(1)} GHz`;
  if (hz >= 1e6) return `${(hz / 1e6).toFixed(2)} MHz`;
  if (hz >= 1e3) return `${(hz / 1e3).toFixed(1)} kHz`;
  return `${hz.toFixed(0)} Hz`;
}

function formatTime(s: number): string {
  if (s >= 1) return `${s.toFixed(2)} s`;
  if (s >= 1e-3) return `${(s * 1e3).toFixed(3)} ms`;
  if (s >= 1e-6) return `${(s * 1e6).toFixed(2)} us`;
  return `${(s * 1e9).toFixed(1)} ns`;
}

function formatDoF(n: number): string {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}k`;
  return n.toFixed(0);
}

// ---------------------------------------------------------------------------
// Presets
// ---------------------------------------------------------------------------

interface Preset {
  label: string;
  bandwidthHz: number;
  durationS: number;
  description: string;
}

const PRESETS: Preset[] = [
  {
    label: 'LTE 20 MHz, 1 ms subframe',
    bandwidthHz: 20e6,
    durationS: 1e-3,
    description: 'LTE 한 서브프레임: 20,000 DoF',
  },
  {
    label: 'WiFi 20 MHz, 4 us symbol',
    bandwidthHz: 20e6,
    durationS: 4e-6,
    description: 'WiFi OFDM 심볼 하나: 80 DoF',
  },
  {
    label: '5G NR 100 MHz, 0.5 ms slot',
    bandwidthHz: 100e6,
    durationS: 0.5e-3,
    description: '5G NR 슬롯: 50,000 DoF',
  },
];

// ---------------------------------------------------------------------------
// SVG Grid Visualization
// ---------------------------------------------------------------------------

interface GridVisualizationProps {
  bandwidthHz: number;
  durationS: number;
  coherenceBwHz: number;
  coherenceTimeS: number;
}

function GridVisualization({
  bandwidthHz,
  durationS,
  coherenceBwHz,
  coherenceTimeS,
}: GridVisualizationProps) {
  const { cols, rows, displayCols, displayRows, clipped } = useMemo(() => {
    const rawCols = Math.max(1, Math.round(durationS / coherenceTimeS));
    const rawRows = Math.max(1, Math.round(bandwidthHz / coherenceBwHz));

    const MAX_DRAW = 20; // max blocks per axis for readability
    const dc = Math.min(rawCols, MAX_DRAW);
    const dr = Math.min(rawRows, MAX_DRAW);

    return {
      cols: rawCols,
      rows: rawRows,
      displayCols: dc,
      displayRows: dr,
      clipped: rawCols > MAX_DRAW || rawRows > MAX_DRAW,
    };
  }, [bandwidthHz, durationS, coherenceBwHz, coherenceTimeS]);

  const totalBlocks = cols * rows;

  // SVG dimensions
  const padding = { top: 32, right: 16, bottom: 44, left: 52 };
  const cellSize = Math.min(28, Math.max(14, 360 / Math.max(displayCols, displayRows)));
  const gridW = displayCols * cellSize;
  const gridH = displayRows * cellSize;
  const svgW = gridW + padding.left + padding.right + (clipped ? 30 : 0);
  const svgH = gridH + padding.top + padding.bottom + (clipped ? 24 : 0);

  // Color palette – alternating for visual distinction
  const getCellColor = (r: number, c: number) => {
    const colors = [
      'rgba(99,102,241,0.75)',   // indigo
      'rgba(59,130,246,0.65)',   // blue
      'rgba(139,92,246,0.60)',   // violet
      'rgba(79,70,229,0.70)',    // indigo-dark
    ];
    return colors[(r + c) % colors.length];
  };

  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        width={svgW}
        height={svgH}
        className="max-w-full"
        role="img"
        aria-label={`시간-주파수 그리드: ${cols}열 x ${rows}행, 총 ${totalBlocks}개 자유도`}
      >
        {/* Axis labels */}
        <text
          x={padding.left + gridW / 2}
          y={svgH - 4}
          textAnchor="middle"
          className="fill-slate-600 dark:fill-slate-400"
          fontSize={11}
          fontWeight={600}
        >
          시간 (T / T_c = {cols}블록)
        </text>
        <text
          x={12}
          y={padding.top + gridH / 2}
          textAnchor="middle"
          transform={`rotate(-90, 12, ${padding.top + gridH / 2})`}
          className="fill-slate-600 dark:fill-slate-400"
          fontSize={11}
          fontWeight={600}
        >
          주파수 (W / W_c = {rows}블록)
        </text>

        {/* Grid cells */}
        {Array.from({ length: displayRows }, (_, r) =>
          Array.from({ length: displayCols }, (_, c) => (
            <rect
              key={`${r}-${c}`}
              x={padding.left + c * cellSize}
              y={padding.top + r * cellSize}
              width={cellSize - 1.5}
              height={cellSize - 1.5}
              rx={2}
              fill={getCellColor(r, c)}
              stroke="rgba(255,255,255,0.4)"
              strokeWidth={0.5}
            >
              <title>
                블록 ({c + 1}, {r + 1}) — 1 복소 심볼 = 1 자유도
              </title>
            </rect>
          ))
        )}

        {/* Ellipsis indicators when clipped */}
        {clipped && cols > displayCols && (
          <text
            x={padding.left + gridW + 6}
            y={padding.top + gridH / 2}
            className="fill-slate-500 dark:fill-slate-400"
            fontSize={16}
            fontWeight={700}
          >
            ...
          </text>
        )}
        {clipped && rows > displayRows && (
          <text
            x={padding.left + gridW / 2}
            y={padding.top + gridH + 16}
            textAnchor="middle"
            className="fill-slate-500 dark:fill-slate-400"
            fontSize={16}
            fontWeight={700}
          >
            ...
          </text>
        )}

        {/* Dimension markers */}
        {/* Top bracket – T_c per cell */}
        <line
          x1={padding.left}
          y1={padding.top - 6}
          x2={padding.left + cellSize}
          y2={padding.top - 6}
          stroke="#6366f1"
          strokeWidth={1.5}
          markerEnd="url(#arrowR)"
          markerStart="url(#arrowL)"
        />
        <text
          x={padding.left + cellSize / 2}
          y={padding.top - 12}
          textAnchor="middle"
          className="fill-indigo-600 dark:fill-indigo-400"
          fontSize={9}
          fontWeight={600}
        >
          T_c
        </text>

        {/* Left bracket – W_c per cell */}
        <line
          x1={padding.left - 6}
          y1={padding.top}
          x2={padding.left - 6}
          y2={padding.top + cellSize}
          stroke="#6366f1"
          strokeWidth={1.5}
        />
        <text
          x={padding.left - 10}
          y={padding.top + cellSize / 2 + 3}
          textAnchor="end"
          className="fill-indigo-600 dark:fill-indigo-400"
          fontSize={9}
          fontWeight={600}
        >
          W_c
        </text>

        {/* Arrow defs */}
        <defs>
          <marker id="arrowR" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6" fill="none" stroke="#6366f1" strokeWidth="1" />
          </marker>
          <marker id="arrowL" markerWidth="6" markerHeight="6" refX="1" refY="3" orient="auto">
            <path d="M6,0 L0,3 L6,6" fill="none" stroke="#6366f1" strokeWidth="1" />
          </marker>
        </defs>
      </svg>

      {/* Legend below SVG */}
      <div className="mt-2 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
        <span className="inline-flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ background: 'rgba(99,102,241,0.75)' }} />
          1 블록 = 1 복소 심볼 = 1 자유도
        </span>
        <span>
          총 <strong className="text-indigo-600 dark:text-indigo-400">{totalBlocks.toLocaleString()}</strong>개 블록
        </span>
        {clipped && (
          <span className="text-amber-600 dark:text-amber-400">(일부만 표시)</span>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function DegreesOfFreedomLab() {
  // Bandwidth: 100 kHz .. 100 MHz (log slider 0..1)
  const BW_MIN = 100e3;
  const BW_MAX = 100e6;
  const [bwSlider, setBwSlider] = useState(() => invLogScale(20e6, BW_MIN, BW_MAX)); // default 20 MHz

  // Duration: 0.1 us .. 100 ms (log slider 0..1)
  // 4us is the WiFi preset minimum, but requirement says 0.1 ms .. 100 ms
  // extended range to cover WiFi preset (4us) — use 1 us .. 100 ms
  const DUR_MIN = 1e-6;   // 1 us
  const DUR_MAX = 100e-3;  // 100 ms
  const [durSlider, setDurSlider] = useState(() => invLogScale(1e-3, DUR_MIN, DUR_MAX)); // default 1 ms

  // Coherence parameters (for grid visualization)
  const [coherenceBwMHz, setCoherenceBwMHz] = useState(1); // MHz
  const [coherenceTimeMs, setCoherenceTimeMs] = useState(0.5); // ms

  const bandwidthHz = useMemo(() => logScale(bwSlider, BW_MIN, BW_MAX), [bwSlider]);
  const durationS = useMemo(() => logScale(durSlider, DUR_MIN, DUR_MAX), [durSlider]);

  const dof = useMemo(() => bandwidthHz * durationS, [bandwidthHz, durationS]);

  const applyPreset = useCallback(
    (preset: Preset) => {
      setBwSlider(invLogScale(preset.bandwidthHz, BW_MIN, BW_MAX));
      setDurSlider(invLogScale(preset.durationS, DUR_MIN, DUR_MAX));
    },
    [],
  );

  const coherenceBwHz = coherenceBwMHz * 1e6;
  const coherenceTimeS = coherenceTimeMs * 1e-3;

  return (
    <div className="my-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-indigo-950 border border-blue-200 dark:border-indigo-700 rounded-xl">
      {/* ---- Title ---- */}
      <h3 className="text-xl font-bold text-blue-800 dark:text-blue-300 mb-1">
        Degrees of Freedom (자유도) 계산기
      </h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-5">
        Tse Discussion 2.1 &mdash; 대역폭 <InlineMath math="W" />와 전송 시간 <InlineMath math="T" />를
        조절하여 시스템이 실어 보낼 수 있는 자유도(복소 심볼 수)를 확인하세요.
      </p>

      {/* ---- Presets ---- */}
      <div className="flex flex-wrap gap-2 mb-6">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => applyPreset(p)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border
              bg-white dark:bg-slate-700 border-blue-200 dark:border-indigo-600
              text-blue-700 dark:text-blue-300
              hover:bg-blue-100 dark:hover:bg-indigo-800 transition"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* ---- Sliders ---- */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Bandwidth */}
        <div className="bg-white dark:bg-slate-700/60 p-4 rounded-lg">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            대역폭 (W): <span className="text-blue-600 dark:text-blue-400 font-bold">{formatHz(bandwidthHz)}</span>
          </label>
          <Slider
            min={0}
            max={1}
            step={0.001}
            value={bwSlider}
            onChange={(v) => setBwSlider(v as number)}
            trackStyle={{ backgroundColor: '#3b82f6' }}
            handleStyle={{ borderColor: '#3b82f6' }}
          />
          <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500 mt-1">
            <span>100 kHz</span>
            <span>1 MHz</span>
            <span>10 MHz</span>
            <span>100 MHz</span>
          </div>
        </div>

        {/* Duration */}
        <div className="bg-white dark:bg-slate-700/60 p-4 rounded-lg">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            전송 시간 (T): <span className="text-blue-600 dark:text-blue-400 font-bold">{formatTime(durationS)}</span>
          </label>
          <Slider
            min={0}
            max={1}
            step={0.001}
            value={durSlider}
            onChange={(v) => setDurSlider(v as number)}
            trackStyle={{ backgroundColor: '#3b82f6' }}
            handleStyle={{ borderColor: '#3b82f6' }}
          />
          <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500 mt-1">
            <span>1 us</span>
            <span>100 us</span>
            <span>10 ms</span>
            <span>100 ms</span>
          </div>
        </div>
      </div>

      {/* ---- DoF Result ---- */}
      <div className="mb-6 p-5 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-700 text-center">
        <div className="text-sm text-indigo-700 dark:text-indigo-400 font-medium mb-1">
          자유도 (Degrees of Freedom)
        </div>
        <div className="text-4xl font-extrabold text-indigo-700 dark:text-indigo-300 mb-2">
          {formatDoF(dof)}
        </div>
        <div className="text-sm text-slate-600 dark:text-slate-400">
          <InlineMath math={`W \\times T = ${formatHz(bandwidthHz).replace(/ /g, '\\,')} \\times ${formatTime(durationS).replace(/ /g, '\\,')} = ${dof >= 1000 ? formatDoF(dof) : Math.round(dof)}`} />
        </div>
      </div>

      {/* ---- Coherence Parameter Controls for Grid ---- */}
      <div className="mb-4 p-4 bg-white dark:bg-slate-700/60 rounded-lg">
        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
          그리드 시각화 파라미터 (코히런스 블록 크기)
        </h4>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              코히런스 대역폭 (W_c): <span className="text-indigo-600 dark:text-indigo-400 font-bold">{coherenceBwMHz} MHz</span>
            </label>
            <Slider
              min={0.1}
              max={20}
              step={0.1}
              value={coherenceBwMHz}
              onChange={(v) => setCoherenceBwMHz(v as number)}
              trackStyle={{ backgroundColor: '#6366f1' }}
              handleStyle={{ borderColor: '#6366f1' }}
            />
            <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500 mt-1">
              <span>0.1 MHz</span>
              <span>10 MHz</span>
              <span>20 MHz</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              코히런스 시간 (T_c): <span className="text-indigo-600 dark:text-indigo-400 font-bold">{coherenceTimeMs} ms</span>
            </label>
            <Slider
              min={0.001}
              max={10}
              step={0.001}
              value={coherenceTimeMs}
              onChange={(v) => setCoherenceTimeMs(v as number)}
              trackStyle={{ backgroundColor: '#6366f1' }}
              handleStyle={{ borderColor: '#6366f1' }}
            />
            <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500 mt-1">
              <span>0.001 ms</span>
              <span>5 ms</span>
              <span>10 ms</span>
            </div>
          </div>
        </div>
      </div>

      {/* ---- SVG Grid ---- */}
      <div className="mb-6 p-4 bg-white dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700">
        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
          시간-주파수 그리드 (코히런스 블록)
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          전체 대역폭을 <InlineMath math="W_c" />씩, 전체 시간을 <InlineMath math="T_c" />씩 나누면
          각 블록 안에서 채널은 대략 일정합니다. 블록 하나 = 복소 심볼 하나를 전송할 수 있는 차원(dimension).
        </p>
        <GridVisualization
          bandwidthHz={bandwidthHz}
          durationS={durationS}
          coherenceBwHz={coherenceBwHz}
          coherenceTimeS={coherenceTimeS}
        />
      </div>

      {/* ---- Key Formulas ---- */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
        <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-3">
          핵심 공식
        </h4>
        <div className="space-y-3">
          <div>
            <BlockMath math={String.raw`\text{DoF} = W \cdot T`} />
            <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
              대역폭 <InlineMath math="W" />, 전송 시간 <InlineMath math="T" /> &rarr; <InlineMath math="WT" />개의
              복소 심볼을 실어 보낼 수 있음
            </p>
          </div>

          <div className="border-t border-blue-200 dark:border-blue-700 pt-3">
            <BlockMath math={String.raw`1\text{ complex symbol} = 1\text{ degree of freedom (dimension)}`} />
            <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
              각 자유도는 하나의 독립적인 복소수 값을 전달할 수 있는 차원에 해당
            </p>
          </div>

          <div className="border-t border-blue-200 dark:border-blue-700 pt-3">
            <BlockMath math={String.raw`\text{Coherence blocks} = \frac{W}{W_c} \times \frac{T}{T_c}`} />
            <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
              코히런스 대역폭 <InlineMath math="W_c" />와 코히런스 시간 <InlineMath math="T_c" />로
              시간-주파수 평면을 나누면, 각 블록 내에서 채널은 일정
            </p>
          </div>
        </div>
      </div>

      {/* ---- Insight Box ---- */}
      <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
        <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-2">
          추가 인사이트 (Discussion 2.1)
        </h4>
        <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
          <li className="flex items-start gap-2">
            <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-800 text-amber-700 dark:text-amber-300 text-xs flex items-center justify-center font-bold">
              1
            </span>
            <span>
              도플러에 의해 수신 대역이 <InlineMath math="W/2" />보다 약간 커지지만,
              유효 DoF에는 큰 영향이 없습니다. 송신 신호 공간의 차원이 곧 자유도를 결정합니다.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-800 text-amber-700 dark:text-amber-300 text-xs flex items-center justify-center font-bold">
              2
            </span>
            <span>
              수신 측 signal space가 더 중요합니다 &mdash; 수신기가 구분할 수 있는 신호의 수가
              실제 통신 가능한 자유도의 상한을 결정합니다.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-800 text-amber-700 dark:text-amber-300 text-xs flex items-center justify-center font-bold">
              3
            </span>
            <span>
              <InlineMath math="WT" />가 크면 Shannon 용량에 가까운 신뢰성 있는 통신이 가능하고,
              코딩 이론의 블록 길이가 충분해집니다.
            </span>
          </li>
        </ul>
      </div>

      {/* ---- Preset Comparison Table ---- */}
      <div className="p-4 bg-white dark:bg-slate-700/60 rounded-lg border border-slate-200 dark:border-slate-700">
        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
          실제 시스템 비교
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-600 text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-2 pr-4">시스템</th>
                <th className="py-2 pr-4">대역폭 (W)</th>
                <th className="py-2 pr-4">전송 시간 (T)</th>
                <th className="py-2 pr-4">DoF = W x T</th>
              </tr>
            </thead>
            <tbody className="text-slate-700 dark:text-slate-300">
              <tr className="border-b border-slate-100 dark:border-slate-600/50">
                <td className="py-2 pr-4 font-medium">LTE subframe</td>
                <td className="py-2 pr-4">20 MHz</td>
                <td className="py-2 pr-4">1 ms</td>
                <td className="py-2 pr-4 font-bold text-indigo-600 dark:text-indigo-400">20,000</td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-600/50">
                <td className="py-2 pr-4 font-medium">WiFi OFDM symbol</td>
                <td className="py-2 pr-4">20 MHz</td>
                <td className="py-2 pr-4">4 us</td>
                <td className="py-2 pr-4 font-bold text-indigo-600 dark:text-indigo-400">80</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-medium">5G NR slot</td>
                <td className="py-2 pr-4">100 MHz</td>
                <td className="py-2 pr-4">0.5 ms</td>
                <td className="py-2 pr-4 font-bold text-indigo-600 dark:text-indigo-400">50,000</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">
          WiFi는 심볼 하나 단위로 보면 자유도가 작지만, 다수의 심볼을 연속 전송하여 전체 DoF를 확보합니다.
          5G NR은 광대역 + 짧은 슬롯으로 한 슬롯에서도 높은 자유도를 달성합니다.
        </p>
      </div>
    </div>
  );
}
