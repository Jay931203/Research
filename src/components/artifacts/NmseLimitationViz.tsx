'use client';

import { useState, useMemo, useCallback } from 'react';
import katex from 'katex';

// ---------------------------------------------------------------------------
// Math Helpers
// ---------------------------------------------------------------------------

/** Degrees to radians */
function deg2rad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Radians to degrees */
function rad2deg(rad: number): number {
  return (rad * 180) / Math.PI;
}

/** 2D vector type */
interface Vec2 {
  x: number;
  y: number;
}

function vecFromPolar(magnitude: number, angleDeg: number): Vec2 {
  const rad = deg2rad(angleDeg);
  return { x: magnitude * Math.cos(rad), y: magnitude * Math.sin(rad) };
}

function vecNorm(v: Vec2): number {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

function vecDot(a: Vec2, b: Vec2): number {
  return a.x * b.x + a.y * b.y;
}

function vecSub(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x - b.x, y: a.y - b.y };
}

function vecScale(v: Vec2, s: number): Vec2 {
  return { x: v.x * s, y: v.y * s };
}

function vecUnit(v: Vec2): Vec2 {
  const n = vecNorm(v);
  if (n === 0) return { x: 0, y: 0 };
  return { x: v.x / n, y: v.y / n };
}

/** NMSE = ||h - h_hat||^2 / ||h||^2 */
function computeNmse(h: Vec2, hHat: Vec2): number {
  const diff = vecSub(h, hHat);
  const normH = vecNorm(h);
  if (normH === 0) return 0;
  return (diff.x * diff.x + diff.y * diff.y) / (normH * normH);
}

/** Cosine similarity = |h . h_hat| / (||h|| ||h_hat||) */
function computeCosineSim(h: Vec2, hHat: Vec2): number {
  const normH = vecNorm(h);
  const normHHat = vecNorm(hHat);
  if (normH === 0 || normHHat === 0) return 0;
  return Math.abs(vecDot(h, hHat)) / (normH * normHHat);
}

/** Beamforming gain ratio = |h . w|^2 / ||h||^2 where w = h_hat / ||h_hat|| */
function computeBeamformingGain(h: Vec2, hHat: Vec2): number {
  const normH = vecNorm(h);
  const normHHat = vecNorm(hHat);
  if (normH === 0 || normHHat === 0) return 0;
  const w = vecUnit(hHat);
  const proj = vecDot(h, w);
  return (proj * proj) / (normH * normH);
}

function fmt(n: number, digits = 4): string {
  return n.toFixed(digits);
}

function renderKatex(tex: string, displayMode = true): string {
  return katex.renderToString(tex, { throwOnError: false, displayMode });
}

function renderKatexInline(tex: string): string {
  return katex.renderToString(tex, { throwOnError: false, displayMode: false });
}

// ---------------------------------------------------------------------------
// SVG Vector Diagram
// ---------------------------------------------------------------------------

const SVG_SIZE = 400;
const SVG_CENTER = SVG_SIZE / 2;
const ARROW_SCALE = 120; // pixels per unit magnitude

interface ArrowProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  color: string;
  strokeWidth: number;
  label?: string;
  labelOffset?: { dx: number; dy: number };
  dashed?: boolean;
  opacity?: number;
}

function Arrow({ from, to, color, strokeWidth, label, labelOffset, dashed, opacity = 1 }: ArrowProps) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 1) return null;

  const headLen = Math.min(12, len * 0.2);
  const angle = Math.atan2(dy, dx);
  const ha1 = angle + Math.PI * 0.85;
  const ha2 = angle - Math.PI * 0.85;

  const headX1 = to.x + headLen * Math.cos(ha1);
  const headY1 = to.y + headLen * Math.sin(ha1);
  const headX2 = to.x + headLen * Math.cos(ha2);
  const headY2 = to.y + headLen * Math.sin(ha2);

  return (
    <g opacity={opacity}>
      <line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={dashed ? '6 4' : undefined}
      />
      <polygon
        points={`${to.x},${to.y} ${headX1},${headY1} ${headX2},${headY2}`}
        fill={color}
      />
      {label && (
        <text
          x={(from.x + to.x) / 2 + (labelOffset?.dx ?? 0)}
          y={(from.y + to.y) / 2 + (labelOffset?.dy ?? 0)}
          fill={color}
          fontSize={13}
          fontWeight={600}
          fontFamily="JetBrains Mono, monospace"
          textAnchor="middle"
        >
          {label}
        </text>
      )}
    </g>
  );
}

/** Convert world coords to SVG coords (y-axis flip) */
function toSvg(v: Vec2): { x: number; y: number } {
  return {
    x: SVG_CENTER + v.x * ARROW_SCALE,
    y: SVG_CENTER - v.y * ARROW_SCALE,
  };
}

function ArcAngle({
  center,
  startAngleDeg,
  endAngleDeg,
  radius,
  color,
}: {
  center: { x: number; y: number };
  startAngleDeg: number;
  endAngleDeg: number;
  radius: number;
  color: string;
}) {
  // Draw arc in SVG coords (y flipped, so negate angles)
  const start = -deg2rad(startAngleDeg);
  const end = -deg2rad(endAngleDeg);

  const x1 = center.x + radius * Math.cos(start);
  const y1 = center.y + radius * Math.sin(start);
  const x2 = center.x + radius * Math.cos(end);
  const y2 = center.y + radius * Math.sin(end);

  const angleDiff = Math.abs(endAngleDeg - startAngleDeg);
  const largeArc = angleDiff > 180 ? 1 : 0;
  // Determine sweep direction based on angle direction in SVG space
  const sweep = endAngleDeg > startAngleDeg ? 0 : 1;

  return (
    <path
      d={`M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} ${sweep} ${x2} ${y2}`}
      fill="none"
      stroke={color}
      strokeWidth={1.5}
      strokeDasharray="3 2"
      opacity={0.7}
    />
  );
}

function VectorDiagram({
  hAngle,
  scaleFactor,
  angleOffset,
}: {
  hAngle: number;
  scaleFactor: number;
  angleOffset: number;
}) {
  const hMag = 1.0;
  const h = vecFromPolar(hMag, hAngle);
  const hHat1 = vecFromPolar(hMag * scaleFactor, hAngle);
  const hHat2 = vecFromPolar(hMag, hAngle + angleOffset);

  const origin = { x: SVG_CENTER, y: SVG_CENTER };
  const hSvg = toSvg(h);
  const h1Svg = toSvg(hHat1);
  const h2Svg = toSvg(hHat2);

  // Unit vector (beamforming direction) for each estimate
  const w1 = vecUnit(hHat1);
  const w2 = vecUnit(hHat2);
  const w1End = toSvg(vecScale(w1, 0.5));
  const w2End = toSvg(vecScale(w2, 0.5));

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
      className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700"
      aria-label="채널 벡터와 추정 벡터 비교 다이어그램"
    >
      {/* Grid */}
      <line
        x1={SVG_CENTER} y1={16} x2={SVG_CENTER} y2={SVG_SIZE - 16}
        className="stroke-gray-200 dark:stroke-gray-700" strokeWidth={1}
      />
      <line
        x1={16} y1={SVG_CENTER} x2={SVG_SIZE - 16} y2={SVG_CENTER}
        className="stroke-gray-200 dark:stroke-gray-700" strokeWidth={1}
      />

      {/* Unit circle (dashed) */}
      <circle
        cx={SVG_CENTER} cy={SVG_CENTER} r={ARROW_SCALE}
        fill="none"
        className="stroke-gray-200 dark:stroke-gray-700"
        strokeWidth={1}
        strokeDasharray="4 4"
        opacity={0.5}
      />

      {/* Angle arc for h_hat2 */}
      {Math.abs(angleOffset) > 0.5 && (
        <ArcAngle
          center={origin}
          startAngleDeg={hAngle}
          endAngleDeg={hAngle + angleOffset}
          radius={40}
          color="#ef4444"
        />
      )}

      {/* Beamforming direction arrows (thin, dashed) */}
      <Arrow
        from={origin}
        to={w1End}
        color="#3b82f6"
        strokeWidth={1.5}
        dashed
        opacity={0.5}
      />
      <Arrow
        from={origin}
        to={w2End}
        color="#ef4444"
        strokeWidth={1.5}
        dashed
        opacity={0.5}
      />

      {/* h vector (original) */}
      <Arrow
        from={origin}
        to={hSvg}
        color="#10b981"
        strokeWidth={3.5}
        label="h"
        labelOffset={{ dx: -14, dy: -10 }}
      />

      {/* h_hat_1 (amplitude error, blue) */}
      <Arrow
        from={origin}
        to={h1Svg}
        color="#3b82f6"
        strokeWidth={2.5}
        label={'\u0125\u2081'}
        labelOffset={{ dx: 16, dy: -8 }}
      />

      {/* h_hat_2 (direction error, red) */}
      <Arrow
        from={origin}
        to={h2Svg}
        color="#ef4444"
        strokeWidth={2.5}
        label={'\u0125\u2082'}
        labelOffset={{ dx: 14, dy: 12 }}
      />

      {/* Angle label */}
      {Math.abs(angleOffset) > 0.5 && (
        <text
          x={SVG_CENTER + 50 * Math.cos(-deg2rad(hAngle + angleOffset / 2))}
          y={SVG_CENTER + 50 * Math.sin(-deg2rad(hAngle + angleOffset / 2))}
          fill="#ef4444"
          fontSize={12}
          fontFamily="JetBrains Mono, monospace"
          textAnchor="middle"
        >
          {Math.abs(angleOffset).toFixed(1)}°
        </text>
      )}

      {/* Legend */}
      <g transform={`translate(12, ${SVG_SIZE - 76})`}>
        <rect
          x={0} y={0} width={160} height={68} rx={8}
          className="fill-white/80 dark:fill-gray-800/80"
          stroke="none"
        />
        <line x1={8} y1={14} x2={28} y2={14} stroke="#10b981" strokeWidth={3} />
        <text x={34} y={18} fontSize={11} className="fill-gray-600 dark:fill-gray-300">
          h (원래 채널)
        </text>
        <line x1={8} y1={34} x2={28} y2={34} stroke="#3b82f6" strokeWidth={2.5} />
        <text x={34} y={38} fontSize={11} className="fill-gray-600 dark:fill-gray-300">
          {'\u0125\u2081'} (진폭 오차)
        </text>
        <line x1={8} y1={54} x2={28} y2={54} stroke="#ef4444" strokeWidth={2.5} />
        <text x={34} y={58} fontSize={11} className="fill-gray-600 dark:fill-gray-300">
          {'\u0125\u2082'} (방향 오차)
        </text>
      </g>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Metrics Table
// ---------------------------------------------------------------------------

interface MetricsRow {
  nmse: number;
  cosineSim: number;
  beamGain: number;
}

function MetricsTable({
  hat1: m1,
  hat2: m2,
}: {
  hat1: MetricsRow;
  hat2: MetricsRow;
}) {
  // Highlight discrepancy: similar NMSE but different beamforming gain
  const nmseClose = Math.abs(m1.nmse - m2.nmse) < 0.05;
  const gainDiff = Math.abs(m1.beamGain - m2.beamGain);
  const showDiscrepancy = nmseClose && gainDiff > 0.05;

  const worse = m1.beamGain < m2.beamGain ? 1 : 2;

  const cellClass = (isWorse: boolean) =>
    isWorse && showDiscrepancy
      ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 font-bold'
      : '';

  const nmseCellClass = (idx: 1 | 2) =>
    nmseClose ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300' : '';

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="text-left py-2 px-3 font-semibold text-gray-600 dark:text-gray-400">
              지표
            </th>
            <th className="text-right py-2 px-3 font-semibold text-blue-600 dark:text-blue-400">
              <span dangerouslySetInnerHTML={{ __html: renderKatexInline(String.raw`\hat{\mathbf{h}}_1`) }} />
              <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">(진폭 오차)</span>
            </th>
            <th className="text-right py-2 px-3 font-semibold text-red-600 dark:text-red-400">
              <span dangerouslySetInnerHTML={{ __html: renderKatexInline(String.raw`\hat{\mathbf{h}}_2`) }} />
              <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">(방향 오차)</span>
            </th>
          </tr>
        </thead>
        <tbody className="font-mono tabular-nums">
          <tr className="border-b border-gray-100 dark:border-gray-800">
            <td className="py-2.5 px-3 text-gray-700 dark:text-gray-300">NMSE</td>
            <td className={`py-2.5 px-3 text-right ${nmseCellClass(1)}`}>{fmt(m1.nmse)}</td>
            <td className={`py-2.5 px-3 text-right ${nmseCellClass(2)}`}>{fmt(m2.nmse)}</td>
          </tr>
          <tr className="border-b border-gray-100 dark:border-gray-800">
            <td className="py-2.5 px-3 text-gray-700 dark:text-gray-300">Cosine Similarity</td>
            <td className="py-2.5 px-3 text-right">{fmt(m1.cosineSim)}</td>
            <td className="py-2.5 px-3 text-right">{fmt(m2.cosineSim)}</td>
          </tr>
          <tr>
            <td className="py-2.5 px-3 text-gray-700 dark:text-gray-300 font-semibold">
              Beamforming Gain
            </td>
            <td className={`py-2.5 px-3 text-right ${cellClass(worse === 1)}`}>
              {fmt(m1.beamGain)}
            </td>
            <td className={`py-2.5 px-3 text-right ${cellClass(worse === 2)}`}>
              {fmt(m2.beamGain)}
            </td>
          </tr>
        </tbody>
      </table>
      {showDiscrepancy && (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400 px-3">
          NMSE가 유사하지만 빔포밍 이득은 크게 다릅니다. 방향 오차가 실제 성능에 더 큰 영향을 미칩니다.
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function NmseLimitationViz() {
  const [hAngle, setHAngle] = useState(30);
  const [scaleFactor, setScaleFactor] = useState(1.4);
  const [angleOffset, setAngleOffset] = useState(15);
  const [showExplanation, setShowExplanation] = useState(false);

  const h = useMemo(() => vecFromPolar(1.0, hAngle), [hAngle]);
  const hHat1 = useMemo(() => vecFromPolar(scaleFactor, hAngle), [scaleFactor, hAngle]);
  const hHat2 = useMemo(() => vecFromPolar(1.0, hAngle + angleOffset), [hAngle, angleOffset]);

  const metrics1: MetricsRow = useMemo(() => ({
    nmse: computeNmse(h, hHat1),
    cosineSim: computeCosineSim(h, hHat1),
    beamGain: computeBeamformingGain(h, hHat1),
  }), [h, hHat1]);

  const metrics2: MetricsRow = useMemo(() => ({
    nmse: computeNmse(h, hHat2),
    cosineSim: computeCosineSim(h, hHat2),
    beamGain: computeBeamformingGain(h, hHat2),
  }), [h, hHat2]);

  /** Preset: find angle offset that gives same NMSE as current scale factor error */
  const applySameNmsePreset = useCallback(() => {
    // NMSE for amplitude error with scale s: (s-1)^2
    // NMSE for direction error with angle delta: 2(1 - cos(delta))
    // Set equal: (s-1)^2 = 2(1 - cos(delta))
    // => delta = acos(1 - (s-1)^2 / 2)
    const s = 1.5;
    const nmseAmp = (s - 1) * (s - 1);
    const cosVal = 1 - nmseAmp / 2;
    const deltaRad = Math.acos(Math.max(-1, Math.min(1, cosVal)));
    const deltaDeg = rad2deg(deltaRad);

    setScaleFactor(s);
    setAngleOffset(parseFloat(deltaDeg.toFixed(1)));
  }, []);

  const formulaHtml = useMemo(
    () =>
      renderKatex(
        String.raw`\text{NMSE} = \frac{\|\mathbf{h} - \hat{\mathbf{h}}\|_2^2}{\|\mathbf{h}\|_2^2}`
      ),
    []
  );

  const cosineFormulaHtml = useMemo(
    () =>
      renderKatex(
        String.raw`\cos\theta = \frac{|\mathbf{h}^H \hat{\mathbf{h}}|}{\|\mathbf{h}\| \cdot \|\hat{\mathbf{h}}\|}`,
      ),
    []
  );

  const beamFormulaHtml = useMemo(
    () =>
      renderKatex(
        String.raw`G = \frac{|\mathbf{h}^H \mathbf{w}|^2}{\|\mathbf{h}\|^2}, \quad \mathbf{w} = \frac{\hat{\mathbf{h}}}{\|\hat{\mathbf{h}}\|}`,
      ),
    []
  );

  return (
    <section className="w-full max-w-5xl mx-auto px-4 py-8">
      {/* Title */}
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-50 tracking-tight">
          NMSE의 한계 &mdash; 진폭 vs. 방향 오차
        </h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
          NMSE는 진폭 오차와 방향 오차를 동일하게 취급하지만,
          빔포밍 성능은 방향 정확도에 훨씬 더 민감합니다
        </p>
      </div>

      {/* KaTeX formula */}
      <div
        className="flex justify-center mb-6 overflow-x-auto"
        dangerouslySetInnerHTML={{ __html: formulaHtml }}
      />

      {/* Preset button */}
      <div className="flex justify-center mb-8">
        <button
          onClick={applySameNmsePreset}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium
            bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300
            hover:bg-indigo-100 dark:hover:bg-indigo-900/50
            border border-indigo-200 dark:border-indigo-700
            hover:border-indigo-300 dark:hover:border-indigo-600
            transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          동일 NMSE, 다른 성능 데모
        </button>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Left: Vector diagram */}
        <div className="flex flex-col items-center">
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-4">
            2D 벡터 비교
          </h3>
          <div className="w-full max-w-[400px] aspect-square">
            <VectorDiagram
              hAngle={hAngle}
              scaleFactor={scaleFactor}
              angleOffset={angleOffset}
            />
          </div>
        </div>

        {/* Right: Controls + Metrics */}
        <div className="flex flex-col gap-6">
          {/* Controls */}
          <div
            className="rounded-2xl p-5
              bg-white dark:bg-gray-800/80
              border border-gray-200 dark:border-gray-700
              shadow-sm"
          >
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-4">
              파라미터 조절
            </h3>

            <div className="space-y-5">
              {/* h angle */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">h</span> 방향
                  </label>
                  <span className="text-sm font-mono text-gray-500 dark:text-gray-400 tabular-nums">
                    {hAngle}°
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={360}
                  step={1}
                  value={hAngle}
                  onChange={(e) => setHAngle(parseInt(e.target.value))}
                  className="w-full h-2 accent-emerald-500 cursor-pointer"
                  aria-label="원래 채널 벡터 h의 방향"
                />
              </div>

              {/* Scale factor for h_hat_1 */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      {'\u0125\u2081'}
                    </span>{' '}
                    스케일 팩터
                  </label>
                  <span className="text-sm font-mono text-gray-500 dark:text-gray-400 tabular-nums">
                    {scaleFactor.toFixed(2)}x
                  </span>
                </div>
                <input
                  type="range"
                  min={0.2}
                  max={2.0}
                  step={0.01}
                  value={scaleFactor}
                  onChange={(e) => setScaleFactor(parseFloat(e.target.value))}
                  className="w-full h-2 accent-blue-500 cursor-pointer"
                  aria-label="추정 벡터 1의 스케일 팩터"
                />
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                  방향은 h와 동일, 크기만 변화
                </p>
              </div>

              {/* Angle offset for h_hat_2 */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-semibold text-red-600 dark:text-red-400">
                      {'\u0125\u2082'}
                    </span>{' '}
                    각도 오프셋
                  </label>
                  <span className="text-sm font-mono text-gray-500 dark:text-gray-400 tabular-nums">
                    {angleOffset.toFixed(1)}°
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={45}
                  step={0.5}
                  value={angleOffset}
                  onChange={(e) => setAngleOffset(parseFloat(e.target.value))}
                  className="w-full h-2 accent-red-500 cursor-pointer"
                  aria-label="추정 벡터 2의 각도 오프셋"
                />
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                  크기는 h와 동일, 방향만 변화
                </p>
              </div>
            </div>
          </div>

          {/* Metrics table */}
          <div
            className="rounded-2xl p-5
              bg-white dark:bg-gray-800/80
              border border-gray-200 dark:border-gray-700
              shadow-sm"
          >
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-4">
              실시간 지표 비교
            </h3>
            <MetricsTable hat1={metrics1} hat2={metrics2} />
          </div>
        </div>
      </div>

      {/* Metric formulas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div
          className="rounded-xl p-4 bg-white dark:bg-gray-800/80
            border border-gray-200 dark:border-gray-700 shadow-sm"
        >
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Cosine Similarity (방향만 측정)
          </h4>
          <div
            className="overflow-x-auto text-center"
            dangerouslySetInnerHTML={{ __html: cosineFormulaHtml }}
          />
        </div>
        <div
          className="rounded-xl p-4 bg-white dark:bg-gray-800/80
            border border-gray-200 dark:border-gray-700 shadow-sm"
        >
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Beamforming Gain (실제 성능 지표)
          </h4>
          <div
            className="overflow-x-auto text-center"
            dangerouslySetInnerHTML={{ __html: beamFormulaHtml }}
          />
        </div>
      </div>

      {/* Explanation card (collapsible) */}
      <div
        className="rounded-2xl border border-gray-200 dark:border-gray-700
          bg-white dark:bg-gray-800/80 shadow-sm overflow-hidden"
      >
        <button
          onClick={() => setShowExplanation((prev) => !prev)}
          className="w-full px-6 py-4 flex items-center justify-between text-left
            hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150
            focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500/40"
          aria-expanded={showExplanation}
        >
          <span className="font-semibold text-gray-800 dark:text-gray-200">
            NMSE는 왜 표준 지표가 되었고, 그 한계는 무엇인가?
          </span>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
              showExplanation ? 'rotate-180' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showExplanation && (
          <div className="px-6 pb-6 space-y-5 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            <div>
              <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-1.5">
                NMSE가 표준이 된 이유
              </h4>
              <p>
                MSE(Mean Squared Error)는 수학적으로 다루기 편리합니다. 미분 가능하고 볼록(convex)하며,
                가우시안 잡음 하에서 최대 우도 추정(MLE)의 최적 기준이 됩니다.
                NMSE는 이를 채널 전력으로 정규화하여 다른 채널 조건 간 비교를 가능하게 합니다.
                대부분의 딥러닝 기반 CSI 피드백 논문(CsiNet, CRNet, TransNet 등)이
                NMSE를 주요 성능 지표로 사용합니다.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-1.5">
                방향이 더 중요한 이유
              </h4>
              <p>
                빔포밍에서 기지국은 추정된 채널 방향으로 빔을 형성합니다. 빔포밍 이득은{' '}
                <span
                  dangerouslySetInnerHTML={{
                    __html: renderKatexInline(String.raw`G = \cos^2(\theta)`),
                  }}
                />{' '}
                로, 추정 벡터와 실제 채널 간의 각도에만 의존합니다.
                크기가 2배 잘못되어도 방향이 맞으면 이득은 1.0(최대)이지만,
                크기가 정확해도 30도 틀어지면 이득은 0.75로 떨어집니다.
                위 데모에서 직접 확인할 수 있습니다.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-1.5">
                수렴점은 같지만 경로가 다르다
              </h4>
              <p>
                완벽한 복원에서는 NMSE = 0, cosine similarity = 1, beamforming gain = 1로
                모든 지표가 일치합니다. 그러나 제한된 피드백 비트로 불완전한 복원을 할 때,
                MSE를 최소화하는 방향과 빔포밍 이득을 최대화하는 방향은 다른 우선순위를 가집니다.
                MSE는 진폭과 방향 오차에 동일한 가중치를 부여하지만,
                빔포밍 관점에서는 방향 정확도에 비트를 집중하는 것이 유리합니다.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-1.5">
                Task-Oriented CSI 피드백과의 연결
              </h4>
              <p>
                Carpi et al. (2023)은 CSI 피드백 네트워크의 손실 함수를 NMSE 대신
                다운스트림 태스크(빔포밍, 파워 할당 등)의 성능과 직접 연결하는
                task-oriented 접근을 제안했습니다.
                이는 NMSE의 한계를 정면으로 해결하려는 시도로,
                복원 정확도와 실제 시스템 성능 사이의 간극을 줄이는 방향입니다.
                이 접근에서는 채널 벡터의 방향 정보가 자연스럽게 더 높은 가중치를 받게 됩니다.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
