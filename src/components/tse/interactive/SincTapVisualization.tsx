'use client';

import { useState, useMemo, useCallback } from 'react';
import Slider from 'rc-slider';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

// ── helpers ────────────────────────────────────────────────────────────
function sinc(x: number): number {
  if (Math.abs(x) < 1e-12) return 1;
  return Math.sin(Math.PI * x) / (Math.PI * x);
}

/** Deterministic per-path colour palette (blue/indigo scheme) */
const PATH_COLORS = [
  '#3b82f6', // blue-500
  '#6366f1', // indigo-500
  '#8b5cf6', // violet-500
  '#0ea5e9', // sky-500
  '#14b8a6', // teal-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#ec4899', // pink-500
];

interface PathInfo {
  delay: number;   // τ_i in μs
  amplitude: number; // |a_i|  (normalised 0–1)
}

// ── component ──────────────────────────────────────────────────────────
export default function SincTapVisualization() {
  const [numPaths, setNumPaths] = useState(4);
  const [bandwidth, setBandwidth] = useState(5); // MHz

  // Generate deterministic paths spread across delay range
  const paths: PathInfo[] = useMemo(() => {
    const maxDelay = 3; // μs  (fixed for illustrative range)
    return Array.from({ length: numPaths }, (_, i) => ({
      delay: i === 0 ? 0.15 : maxDelay * ((i + 0.3) / numPaths),
      amplitude: 1 - i * 0.08,
    }));
  }, [numPaths]);

  const W = bandwidth; // MHz
  const tapSpacing = 1 / W; // μs  (= 1/W)
  const maxDelay = Math.max(...paths.map((p) => p.delay));
  const numTaps = Math.ceil(maxDelay * W) + 1;

  // Compute sinc contribution matrix: how much each path contributes to each tap
  const contributions = useMemo(() => {
    // contributions[tap][path] = sinc(W * τ_i - ℓ)
    const mat: number[][] = [];
    for (let l = 0; l < numTaps; l++) {
      const row: number[] = [];
      for (let i = 0; i < paths.length; i++) {
        row.push(sinc(W * paths[i].delay - l));
      }
      mat.push(row);
    }
    return mat;
  }, [paths, W, numTaps]);

  // Compute composite tap values |h_ℓ|
  const tapValues = useMemo(() => {
    return contributions.map((row, l) => {
      let re = 0;
      let im = 0;
      for (let i = 0; i < paths.length; i++) {
        // Use deterministic phase e^{-j 2π f_c τ_i} ≈ rotate by path index
        const phase = (2 * Math.PI * i * 0.37); // golden-ratio-like spacing
        re += paths[i].amplitude * row[i] * Math.cos(phase);
        im += paths[i].amplitude * row[i] * Math.sin(phase);
      }
      return Math.sqrt(re * re + im * im);
    });
  }, [contributions, paths]);

  const maxTapValue = Math.max(...tapValues, 0.01);

  // ── SVG layout constants ─────────────────────────────────────────────
  const svgW = 760;
  const svgH = 480;
  const margin = { top: 45, right: 30, bottom: 30, left: 55 };
  const plotW = svgW - margin.left - margin.right;
  const plotH = svgH - margin.top - margin.bottom;

  // Continuous axis spans the full delay range with padding
  const axisMax = Math.max(maxDelay * 1.15, (numTaps - 1) * tapSpacing * 1.15);

  // Coordinate transforms
  const xScale = useCallback(
    (delay: number) => margin.left + (delay / axisMax) * plotW,
    [axisMax, plotW, margin.left],
  );
  const yTop = margin.top; // continuous paths drawn here
  const yMid = margin.top + plotH * 0.42; // separator line
  const yBot = margin.top + plotH * 0.58; // discrete taps drawn here
  const yBotBase = margin.top + plotH; // bottom baseline

  // Sinc curve sample points for one path contribution to the tap grid
  const sincCurvePoints = useCallback(
    (pathDelay: number) => {
      const pts: { x: number; y: number }[] = [];
      const steps = 200;
      for (let s = 0; s <= steps; s++) {
        const tau = (s / steps) * axisMax;
        const val = sinc(W * pathDelay - W * tau);
        // Map value to vertical position in bottom region
        const yVal = yMid + 15 + (yBotBase - yMid - 25) * 0.5 * (1 - val);
        pts.push({ x: xScale(tau), y: yVal });
      }
      return pts;
    },
    [axisMax, W, xScale, yMid, yBotBase],
  );

  // For the selected sinc overlay (show dominant path only to avoid clutter)
  const [hoveredPath, setHoveredPath] = useState<number | null>(null);

  return (
    <div className="my-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-indigo-950 border border-blue-200 dark:border-indigo-700 rounded-xl">
      {/* ── Title ─────────────────────────────────────────────────── */}
      <h3 className="text-xl font-bold text-blue-800 dark:text-blue-300 mb-1">
        Sinc-Tap Mapping Visualizer
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
        Tse 2.2.3 &mdash; 연속 다중경로 지연이 sinc 가중합으로 이산 탭에 매핑되는 과정을 관찰하세요.
      </p>

      {/* ── Sliders ───────────────────────────────────────────────── */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-slate-700 p-3 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            경로 수 (paths):{' '}
            <span className="text-blue-600 dark:text-blue-400 font-bold">{numPaths}</span>
          </label>
          <Slider
            min={2}
            max={8}
            step={1}
            value={numPaths}
            onChange={(v) => setNumPaths(v as number)}
            trackStyle={{ backgroundColor: '#4f46e5' }}
            handleStyle={{ borderColor: '#4f46e5' }}
          />
          <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mt-1">
            <span>2</span>
            <span>5</span>
            <span>8</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-700 p-3 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            대역폭 W:{' '}
            <span className="text-blue-600 dark:text-blue-400 font-bold">{bandwidth} MHz</span>
            &nbsp;
            <span className="text-xs text-gray-400">
              (1/W = {tapSpacing.toFixed(3)} &mu;s)
            </span>
          </label>
          <Slider
            min={1}
            max={20}
            step={0.5}
            value={bandwidth}
            onChange={(v) => setBandwidth(v as number)}
            trackStyle={{ backgroundColor: '#4f46e5' }}
            handleStyle={{ borderColor: '#4f46e5' }}
          />
          <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mt-1">
            <span>1 MHz</span>
            <span>10 MHz</span>
            <span>20 MHz</span>
          </div>
        </div>
      </div>

      {/* ── Computed Parameters ────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white dark:bg-slate-700 p-3 rounded-lg shadow-sm text-center border border-blue-200 dark:border-blue-600">
          <div className="text-xs text-gray-500 dark:text-gray-400">탭 수 L</div>
          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{numTaps}</div>
          <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            <InlineMath math={String.raw`\lceil T_d \cdot W \rceil + 1`} />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-700 p-3 rounded-lg shadow-sm text-center border border-indigo-200 dark:border-indigo-600">
          <div className="text-xs text-gray-500 dark:text-gray-400">탭 간격 1/W</div>
          <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
            {tapSpacing.toFixed(3)} &mu;s
          </div>
          <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            = {(tapSpacing * 1000).toFixed(1)} ns
          </div>
        </div>
        <div className="bg-white dark:bg-slate-700 p-3 rounded-lg shadow-sm text-center border border-violet-200 dark:border-violet-600">
          <div className="text-xs text-gray-500 dark:text-gray-400">최대 지연 T_d</div>
          <div className="text-lg font-bold text-violet-600 dark:text-violet-400">
            {maxDelay.toFixed(2)} &mu;s
          </div>
        </div>
      </div>

      {/* ── SVG Visualization ─────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 mb-6 overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          className="w-full"
          style={{ minWidth: 500 }}
        >
          {/* ---- Axis labels ---- */}
          <text
            x={margin.left - 8}
            y={yTop - 8}
            textAnchor="end"
            fontSize={11}
            fontWeight={600}
            className="fill-gray-600 dark:fill-gray-300"
          >
            연속 경로
          </text>
          <text
            x={margin.left - 8}
            y={yBot - 8}
            textAnchor="end"
            fontSize={11}
            fontWeight={600}
            className="fill-gray-600 dark:fill-gray-300"
          >
            이산 탭
          </text>

          {/* ---- Continuous delay axis (top) ---- */}
          <line
            x1={margin.left}
            y1={yTop + 80}
            x2={svgW - margin.right}
            y2={yTop + 80}
            stroke="#94a3b8"
            strokeWidth={1}
          />
          {/* Tick marks on continuous axis */}
          {Array.from({ length: Math.floor(axisMax * 4) + 1 }, (_, i) => i * 0.25).map(
            (t) =>
              t <= axisMax && (
                <g key={`ctick-${t}`}>
                  <line
                    x1={xScale(t)}
                    y1={yTop + 78}
                    x2={xScale(t)}
                    y2={yTop + 82}
                    stroke="#94a3b8"
                    strokeWidth={1}
                  />
                  {t % 0.5 === 0 && (
                    <text
                      x={xScale(t)}
                      y={yTop + 95}
                      textAnchor="middle"
                      fontSize={9}
                      className="fill-gray-500 dark:fill-gray-400"
                    >
                      {t.toFixed(1)}
                    </text>
                  )}
                </g>
              ),
          )}
          <text
            x={svgW - margin.right + 5}
            y={yTop + 84}
            fontSize={10}
            className="fill-gray-500 dark:fill-gray-400"
          >
            &tau; (&mu;s)
          </text>

          {/* ---- Path arrows (top section) ---- */}
          {paths.map((p, i) => {
            const x = xScale(p.delay);
            const arrowH = 20 + p.amplitude * 40;
            const color = PATH_COLORS[i % PATH_COLORS.length];
            return (
              <g
                key={`path-${i}`}
                onMouseEnter={() => setHoveredPath(i)}
                onMouseLeave={() => setHoveredPath(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* arrow shaft */}
                <line
                  x1={x}
                  y1={yTop + 80}
                  x2={x}
                  y2={yTop + 80 - arrowH}
                  stroke={color}
                  strokeWidth={3}
                  strokeLinecap="round"
                />
                {/* arrowhead */}
                <polygon
                  points={`${x},${yTop + 80 - arrowH - 6} ${x - 4},${yTop + 80 - arrowH + 2} ${x + 4},${yTop + 80 - arrowH + 2}`}
                  fill={color}
                />
                {/* label */}
                <text
                  x={x}
                  y={yTop + 80 - arrowH - 12}
                  textAnchor="middle"
                  fontSize={10}
                  fontWeight={600}
                  fill={color}
                >
                  a_{i === 0 ? '₀' : i === 1 ? '₁' : i === 2 ? '₂' : i === 3 ? '₃' : i === 4 ? '₄' : i === 5 ? '₅' : i === 6 ? '₆' : '₇'}
                </text>
                {/* delay label below axis */}
                <text
                  x={x}
                  y={yTop + 108}
                  textAnchor="middle"
                  fontSize={8}
                  fill={color}
                >
                  {p.delay.toFixed(2)}
                </text>
              </g>
            );
          })}

          {/* ---- Separator ---- */}
          <line
            x1={margin.left}
            y1={yMid}
            x2={svgW - margin.right}
            y2={yMid}
            stroke="#cbd5e1"
            strokeWidth={1}
            strokeDasharray="6,4"
          />
          <text
            x={svgW / 2}
            y={yMid + 14}
            textAnchor="middle"
            fontSize={10}
            fontStyle="italic"
            className="fill-indigo-500 dark:fill-indigo-400"
          >
            sinc(W&tau;_i &minus; &ell;) 매핑
          </text>

          {/* ---- Sinc curves (connection lines from paths to taps) ---- */}
          {/* Show sinc envelope for hovered path, or the first path by default */}
          {(() => {
            const showIdx = hoveredPath ?? 0;
            const pts = sincCurvePoints(paths[showIdx].delay);
            const color = PATH_COLORS[showIdx % PATH_COLORS.length];
            const d = pts.map((pt, j) => `${j === 0 ? 'M' : 'L'}${pt.x.toFixed(1)},${pt.y.toFixed(1)}`).join(' ');
            return (
              <path
                d={d}
                fill="none"
                stroke={color}
                strokeWidth={1.5}
                strokeDasharray="4,3"
                opacity={0.5}
              />
            );
          })()}

          {/* ---- Connection lines: path → contributing taps ---- */}
          {paths.map((p, i) => {
            const color = PATH_COLORS[i % PATH_COLORS.length];
            const isActive = hoveredPath === null || hoveredPath === i;
            return contributions.map((row, l) => {
              const weight = Math.abs(row[i]);
              if (weight < 0.05) return null;
              const x1 = xScale(p.delay);
              const x2 = xScale(l * tapSpacing);
              return (
                <line
                  key={`conn-${i}-${l}`}
                  x1={x1}
                  y1={yTop + 80}
                  x2={x2}
                  y2={yBot + 20}
                  stroke={color}
                  strokeWidth={weight * 2.5}
                  opacity={isActive ? weight * 0.45 : 0.08}
                  strokeDasharray="3,3"
                />
              );
            });
          })}

          {/* ---- Discrete tap axis (bottom) ---- */}
          <line
            x1={margin.left}
            y1={yBotBase}
            x2={svgW - margin.right}
            y2={yBotBase}
            stroke="#94a3b8"
            strokeWidth={1}
          />

          {/* ---- Tap bars ---- */}
          {tapValues.map((val, l) => {
            const x = xScale(l * tapSpacing);
            const barH = (val / maxTapValue) * (yBotBase - yBot - 30);

            // Determine dominant path for this tap (for colouring)
            const absContribs = contributions[l].map((c, i) => ({
              weight: Math.abs(c) * paths[i].amplitude,
              idx: i,
            }));
            absContribs.sort((a, b) => b.weight - a.weight);
            const dominantIdx = absContribs[0]?.idx ?? 0;
            const color = PATH_COLORS[dominantIdx % PATH_COLORS.length];

            // Build a stacked colour gradient for the bar
            const totalWeight = absContribs.reduce((s, a) => s + a.weight, 0);

            return (
              <g key={`tap-${l}`}>
                {/* tap grid line */}
                <line
                  x1={x}
                  y1={yBot + 20}
                  x2={x}
                  y2={yBotBase}
                  stroke="#e2e8f0"
                  strokeWidth={1}
                  strokeDasharray="2,3"
                />
                {/* bar */}
                <rect
                  x={x - 8}
                  y={yBotBase - barH}
                  width={16}
                  height={barH}
                  rx={2}
                  fill={color}
                  opacity={0.75}
                />
                {/* colour segments showing contributions */}
                {(() => {
                  let cumY = yBotBase;
                  return absContribs
                    .filter((a) => a.weight > 0.02)
                    .map((a) => {
                      const segH = totalWeight > 0 ? (a.weight / totalWeight) * barH : 0;
                      cumY -= segH;
                      return (
                        <rect
                          key={`seg-${l}-${a.idx}`}
                          x={x - 8}
                          y={cumY}
                          width={16}
                          height={segH}
                          rx={2}
                          fill={PATH_COLORS[a.idx % PATH_COLORS.length]}
                          opacity={0.8}
                        />
                      );
                    });
                })()}
                {/* tap index label */}
                <text
                  x={x}
                  y={yBotBase + 14}
                  textAnchor="middle"
                  fontSize={9}
                  fontWeight={600}
                  className="fill-gray-600 dark:fill-gray-300"
                >
                  h_{l === 0 ? '₀' : l === 1 ? '₁' : l === 2 ? '₂' : l === 3 ? '₃' : l === 4 ? '₄' : l === 5 ? '₅' : l === 6 ? '₆' : l === 7 ? '₇' : l === 8 ? '₈' : l === 9 ? '₉' : `[${l}]`}
                </text>
                {/* value label */}
                <text
                  x={x}
                  y={yBotBase - barH - 5}
                  textAnchor="middle"
                  fontSize={8}
                  className="fill-gray-500 dark:fill-gray-400"
                >
                  {val.toFixed(2)}
                </text>
              </g>
            );
          })}

          {/* ---- Legend ---- */}
          {paths.map((p, i) => (
            <g
              key={`leg-${i}`}
              onMouseEnter={() => setHoveredPath(i)}
              onMouseLeave={() => setHoveredPath(null)}
              style={{ cursor: 'pointer' }}
            >
              <rect
                x={margin.left + i * 90}
                y={svgH - 20}
                width={10}
                height={10}
                rx={2}
                fill={PATH_COLORS[i % PATH_COLORS.length]}
              />
              <text
                x={margin.left + i * 90 + 14}
                y={svgH - 11}
                fontSize={9}
                className="fill-gray-600 dark:fill-gray-300"
              >
                Path {i} (&tau;={p.delay.toFixed(2)}&mu;s)
              </text>
            </g>
          ))}
        </svg>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
          경로에 마우스를 올리면 해당 경로의 sinc 기여도를 강조합니다. 탭 막대의 색상은 지배적 경로를 나타냅니다.
        </p>
      </div>

      {/* ── Key Formulas ──────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-700 rounded-xl p-5 mb-6 border border-blue-100 dark:border-indigo-600">
        <h4 className="text-sm font-bold text-indigo-700 dark:text-indigo-300 mb-3">
          핵심 수식
        </h4>
        <div className="space-y-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              이산 채널 탭 계수 (baseband equivalent):
            </p>
            <div className="overflow-x-auto">
              <BlockMath
                math={String.raw`h_\ell[m] = \sum_i a_i(mT_s)\, e^{-j2\pi f_c \tau_i}\, \operatorname{sinc}(W\tau_i - \ell)`}
              />
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              필요한 탭 수:
            </p>
            <div className="overflow-x-auto">
              <BlockMath
                math={String.raw`L \approx \lceil T_d \cdot W \rceil + 1`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Contribution Matrix Table ─────────────────────────────── */}
      <div className="bg-white dark:bg-slate-700 rounded-xl p-4 mb-6 border border-blue-100 dark:border-indigo-600 overflow-x-auto">
        <h4 className="text-sm font-bold text-indigo-700 dark:text-indigo-300 mb-3">
          sinc 가중치 행렬{' '}
          <InlineMath math={String.raw`\operatorname{sinc}(W\tau_i - \ell)`} />
        </h4>
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr>
              <th className="border border-gray-200 dark:border-gray-600 px-2 py-1 bg-gray-50 dark:bg-slate-600 text-gray-600 dark:text-gray-300">
                &nbsp;
              </th>
              {tapValues.map((_, l) => (
                <th
                  key={l}
                  className="border border-gray-200 dark:border-gray-600 px-2 py-1 bg-gray-50 dark:bg-slate-600 text-gray-600 dark:text-gray-300"
                >
                  Tap {l}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paths.map((p, i) => (
              <tr
                key={i}
                onMouseEnter={() => setHoveredPath(i)}
                onMouseLeave={() => setHoveredPath(null)}
                className="hover:bg-blue-50 dark:hover:bg-slate-600 cursor-pointer transition-colors"
              >
                <td
                  className="border border-gray-200 dark:border-gray-600 px-2 py-1 font-semibold whitespace-nowrap"
                  style={{ color: PATH_COLORS[i] }}
                >
                  Path {i} (&tau;={p.delay.toFixed(2)})
                </td>
                {contributions.map((row, l) => {
                  const val = row[i];
                  const absVal = Math.abs(val);
                  const bgOpacity = absVal * 0.3;
                  return (
                    <td
                      key={l}
                      className="border border-gray-200 dark:border-gray-600 px-2 py-1 text-center font-mono"
                      style={{
                        backgroundColor: `rgba(79, 70, 229, ${bgOpacity})`,
                        color: absVal > 0.5 ? '#fff' : undefined,
                      }}
                    >
                      {val.toFixed(3)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
          각 셀은 해당 경로가 해당 탭에 기여하는 sinc 가중치입니다. 색이 진할수록 기여도가 큽니다.
        </p>
      </div>

      {/* ── Insight Boxes ─────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-start gap-3 p-4 bg-blue-100 dark:bg-indigo-900/40 border-l-4 border-blue-500 dark:border-blue-400 rounded-r-lg">
          <span className="text-xl mt-0.5 flex-shrink-0" aria-hidden="true">1</span>
          <div>
            <p className="font-bold text-blue-800 dark:text-blue-300 text-sm mb-1">
              1 Tap &#8800; 1 Path
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-200">
              각 탭은 sinc 함수로 가중된 <strong>여러 경로의 합</strong>입니다.
              하나의 탭에 하나의 물리적 경로가 대응하는 것이 아니라,
              인접한 모든 경로가 sinc 가중치를 통해 기여합니다.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 bg-indigo-100 dark:bg-indigo-900/40 border-l-4 border-indigo-500 dark:border-indigo-400 rounded-r-lg">
          <span className="text-xl mt-0.5 flex-shrink-0" aria-hidden="true">2</span>
          <div>
            <p className="font-bold text-indigo-800 dark:text-indigo-300 text-sm mb-1">
              Main Lobe 지배
            </p>
            <p className="text-sm text-indigo-700 dark:text-indigo-200">
              sinc의 <strong>주엽(main lobe)</strong>이 지배적이므로
              가장 가까운 탭에 대부분의 에너지가 집중됩니다.
              위 행렬에서 대각 근처의 값이 가장 큰 것을 확인하세요.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 bg-violet-100 dark:bg-violet-900/40 border-l-4 border-violet-500 dark:border-violet-400 rounded-r-lg">
          <span className="text-xl mt-0.5 flex-shrink-0" aria-hidden="true">3</span>
          <div>
            <p className="font-bold text-violet-800 dark:text-violet-300 text-sm mb-1">
              나이퀴스트 레이트 샘플링
            </p>
            <p className="text-sm text-violet-700 dark:text-violet-200">
              나이퀴스트 레이트(<InlineMath math="W" />)로 샘플링하면
              <strong> 정보 손실 없이 이산화</strong>가 가능합니다.
              대역폭 W를 높이면 탭 간격 1/W가 좁아지고
              탭 수 L이 증가하여 더 세밀한 해상도를 얻습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
