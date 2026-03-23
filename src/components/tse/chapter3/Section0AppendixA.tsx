'use client';

import { BlockMath, InlineMath } from 'react-katex';
import { useState, useMemo, useCallback } from 'react';

interface Section0Props {
  onNavigate: (id: string) => void;
}

/* ─────────────── Scalar Detection Visualizer ─────────────── */
function ScalarDetectionVisualizer() {
  const [distance, setDistance] = useState(3);
  const N0_2 = 1; // N_0/2 = 1 (fixed noise variance)
  const sigma = Math.sqrt(N0_2);

  const uA = -distance / 2;
  const uB = distance / 2;

  // Q-function approximation (non-recursive to satisfy TS)
  const qFunc = useCallback((x: number): number => {
    const ax = Math.abs(x);
    const t = 1 / (1 + 0.2316419 * ax);
    const d = 0.3989422804014327; // 1/sqrt(2*pi)
    const poly = t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
    const val = d * Math.exp(-0.5 * ax * ax) * poly;
    return x < 0 ? 1 - val : val;
  }, []);

  const pe = qFunc(distance / (2 * sigma));

  // Gaussian PDF
  const gaussian = useCallback((x: number, mu: number, sig: number) => {
    return (1 / (sig * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * ((x - mu) / sig) ** 2);
  }, []);

  // SVG dimensions
  const W = 500, H = 280;
  const margin = { top: 20, right: 20, bottom: 40, left: 20 };
  const pw = W - margin.left - margin.right;
  const ph = H - margin.top - margin.bottom;

  const xMin = -6, xMax = 6;
  const xScale = (x: number) => margin.left + ((x - xMin) / (xMax - xMin)) * pw;
  const yMax = 0.5;
  const yScale = (y: number) => margin.top + ph - (y / yMax) * ph;

  // Generate paths
  const nPts = 200;
  const xs = Array.from({ length: nPts }, (_, i) => xMin + (i / (nPts - 1)) * (xMax - xMin));

  const pathA = xs.map((x, i) => {
    const y = gaussian(x, uA, sigma);
    return `${i === 0 ? 'M' : 'L'}${xScale(x).toFixed(1)},${yScale(y).toFixed(1)}`;
  }).join(' ');

  const pathB = xs.map((x, i) => {
    const y = gaussian(x, uB, sigma);
    return `${i === 0 ? 'M' : 'L'}${xScale(x).toFixed(1)},${yScale(y).toFixed(1)}`;
  }).join(' ');

  // Error region: area of A's PDF to the right of decision boundary (midpoint = 0)
  const threshold = (uA + uB) / 2; // = 0
  const errorPts = xs.filter(x => x >= threshold);
  const errorFill = errorPts.length > 0
    ? `M${xScale(threshold).toFixed(1)},${yScale(0).toFixed(1)} ` +
      errorPts.map(x => `L${xScale(x).toFixed(1)},${yScale(gaussian(x, uA, sigma)).toFixed(1)}`).join(' ') +
      ` L${xScale(errorPts[errorPts.length - 1]).toFixed(1)},${yScale(0).toFixed(1)} Z`
    : '';

  // Also shade error from B's side (left of threshold)
  const errorPtsB = xs.filter(x => x <= threshold);
  const errorFillB = errorPtsB.length > 0
    ? `M${xScale(errorPtsB[0]).toFixed(1)},${yScale(0).toFixed(1)} ` +
      errorPtsB.map(x => `L${xScale(x).toFixed(1)},${yScale(gaussian(x, uB, sigma)).toFixed(1)}`).join(' ') +
      ` L${xScale(threshold).toFixed(1)},${yScale(0).toFixed(1)} Z`
    : '';

  return (
    <div className="concept-card mb-6" id="scalar-detection-viz">
      <h4 className="font-semibold text-slate-800 mb-2">Interactive: 스칼라 검출 시각화</h4>
      <p className="text-sm text-slate-600 mb-3">
        두 가설의 가우시안 PDF를 관찰합니다. 거리가 멀어지면 오류 영역(빗금)이 줄어듭니다.
      </p>

      <div className="mb-3">
        <label className="block text-xs font-medium text-slate-600 mb-1">
          신호 간 거리 <InlineMath math="|u_A - u_B|" />: <span className="text-emerald-700 font-bold">{distance.toFixed(1)}</span>
        </label>
        <input
          type="range"
          min={0.5}
          max={6}
          step={0.1}
          value={distance}
          onChange={(e) => setDistance(parseFloat(e.target.value))}
          className="w-full accent-emerald-600"
          aria-label="Signal distance"
        />
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[500px] mx-auto bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
        {/* Error regions */}
        <path d={errorFill} fill="rgba(239,68,68,0.25)" />
        <path d={errorFillB} fill="rgba(239,68,68,0.25)" />

        {/* PDFs */}
        <path d={pathA} fill="none" stroke="#2563eb" strokeWidth="2" />
        <path d={pathB} fill="none" stroke="#059669" strokeWidth="2" />

        {/* Decision boundary */}
        <line
          x1={xScale(threshold)} y1={margin.top}
          x2={xScale(threshold)} y2={margin.top + ph}
          stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4,3"
        />

        {/* Axis */}
        <line x1={margin.left} y1={margin.top + ph} x2={W - margin.right} y2={margin.top + ph} stroke="#94a3b8" strokeWidth="1" />

        {/* Labels */}
        <text x={xScale(uA)} y={margin.top + ph + 18} textAnchor="middle" className="text-xs fill-blue-600" fontSize="11">u_A</text>
        <text x={xScale(uB)} y={margin.top + ph + 18} textAnchor="middle" className="text-xs fill-emerald-600" fontSize="11">u_B</text>
        <text x={xScale(threshold)} y={margin.top + ph + 30} textAnchor="middle" className="text-xs fill-slate-500" fontSize="10">판정 경계</text>

        {/* Legend */}
        <rect x={W - 140} y={10} width={130} height={42} rx={4} fill="white" fillOpacity={0.9} stroke="#e2e8f0" />
        <line x1={W - 130} y1={22} x2={W - 110} y2={22} stroke="#2563eb" strokeWidth="2" />
        <text x={W - 105} y={26} fontSize="10" className="fill-slate-700">p(y|u_A)</text>
        <line x1={W - 130} y1={38} x2={W - 110} y2={38} stroke="#059669" strokeWidth="2" />
        <text x={W - 105} y={42} fontSize="10" className="fill-slate-700">p(y|u_B)</text>
      </svg>

      <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-sm">
        <InlineMath math={`p_e = Q\\left(\\frac{${distance.toFixed(1)}}{${(2 * sigma).toFixed(2)}}\\right) = ${pe.toExponential(3)}`} />
      </div>
    </div>
  );
}

/* ─────────────── Vector-to-Scalar Projection Demo ─────────────── */
function VectorProjectionDemo() {
  const [yAngle, setYAngle] = useState(45); // degrees, angle of y from origin

  const W = 400, H = 350;
  const cx = W / 2, cy = H / 2;
  const scale = 60;

  // Fixed constellation points
  const uA = { x: -1.5, y: 0.8 };
  const uB = { x: 1.5, y: -0.5 };

  // Direction vector v = (uA - uB) / ||uA - uB||
  const dx = uA.x - uB.x;
  const dy = uA.y - uB.y;
  const norm = Math.sqrt(dx * dx + dy * dy);
  const v = { x: dx / norm, y: dy / norm };

  // y point on a circle
  const yRad = (yAngle / 180) * Math.PI;
  const yRadius = 2.0;
  const yPt = { x: yRadius * Math.cos(yRad), y: yRadius * Math.sin(yRad) };

  // Projection of y onto v
  const projScalar = yPt.x * v.x + yPt.y * v.y;
  const projPt = { x: projScalar * v.x, y: projScalar * v.y };

  const toSvg = (p: { x: number; y: number }) => ({
    x: cx + p.x * scale,
    y: cy - p.y * scale, // flip y
  });

  const svgUA = toSvg(uA);
  const svgUB = toSvg(uB);
  const svgY = toSvg(yPt);
  const svgProj = toSvg(projPt);

  // Draw projection line (extended)
  const lineExtend = 3.5;
  const lineStart = toSvg({ x: -v.x * lineExtend, y: -v.y * lineExtend });
  const lineEnd = toSvg({ x: v.x * lineExtend, y: v.y * lineExtend });

  return (
    <div className="concept-card mb-6" id="vector-projection-demo">
      <h4 className="font-semibold text-slate-800 mb-2">Interactive: 벡터 → 스칼라 사영</h4>
      <p className="text-sm text-slate-600 mb-3">
        2D 공간에서 수신 벡터 <InlineMath math="\mathbf{y}" />를{' '}
        <InlineMath math="\mathbf{v} = (\mathbf{u}_A - \mathbf{u}_B)/\|\mathbf{u}_A - \mathbf{u}_B\|" /> 방향으로 사영하면
        스칼라 충분통계량이 됩니다. 슬라이더로 <InlineMath math="\mathbf{y}" />를 움직여 보세요.
      </p>

      <div className="mb-3">
        <label className="block text-xs font-medium text-slate-600 mb-1">
          y 위치 (각도): <span className="text-emerald-700 font-bold">{yAngle}°</span>
        </label>
        <input
          type="range"
          min={0}
          max={359}
          step={1}
          value={yAngle}
          onChange={(e) => setYAngle(parseInt(e.target.value))}
          className="w-full accent-emerald-600"
          aria-label="y vector angle"
        />
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[400px] mx-auto bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
        {/* Grid */}
        <line x1={0} y1={cy} x2={W} y2={cy} stroke="#e2e8f0" strokeWidth="0.5" />
        <line x1={cx} y1={0} x2={cx} y2={H} stroke="#e2e8f0" strokeWidth="0.5" />

        {/* Projection direction line */}
        <line x1={lineStart.x} y1={lineStart.y} x2={lineEnd.x} y2={lineEnd.y}
          stroke="#94a3b8" strokeWidth="1" strokeDasharray="5,3" />

        {/* Projection dashed line from y to proj */}
        <line x1={svgY.x} y1={svgY.y} x2={svgProj.x} y2={svgProj.y}
          stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3,3" />

        {/* Points */}
        <circle cx={svgUA.x} cy={svgUA.y} r={7} fill="#2563eb" />
        <text x={svgUA.x + 10} y={svgUA.y - 8} fontSize="12" className="fill-blue-600 font-semibold">u_A</text>

        <circle cx={svgUB.x} cy={svgUB.y} r={7} fill="#059669" />
        <text x={svgUB.x + 10} y={svgUB.y - 8} fontSize="12" className="fill-emerald-600 font-semibold">u_B</text>

        <circle cx={svgY.x} cy={svgY.y} r={6} fill="#f59e0b" />
        <text x={svgY.x + 10} y={svgY.y - 8} fontSize="12" className="fill-amber-600 font-semibold">y</text>

        {/* Projected point */}
        <circle cx={svgProj.x} cy={svgProj.y} r={5} fill="#ef4444" />
        <text x={svgProj.x + 10} y={svgProj.y + 14} fontSize="10" className="fill-red-600">proj</text>

        {/* Direction label */}
        <text x={lineEnd.x + 5} y={lineEnd.y} fontSize="10" className="fill-slate-500">v</text>

        {/* Legend */}
        <rect x={5} y={5} width={110} height={68} rx={4} fill="white" fillOpacity={0.9} stroke="#e2e8f0" />
        <circle cx={15} cy={18} r={4} fill="#2563eb" />
        <text x={25} y={22} fontSize="10" className="fill-slate-700">u_A (가설 A)</text>
        <circle cx={15} cy={35} r={4} fill="#059669" />
        <text x={25} y={39} fontSize="10" className="fill-slate-700">u_B (가설 B)</text>
        <circle cx={15} cy={52} r={4} fill="#f59e0b" />
        <text x={25} y={56} fontSize="10" className="fill-slate-700">y (수신 벡터)</text>
        <circle cx={15} cy={67} r={4} fill="#ef4444" />
        <text x={25} y={71} fontSize="10" className="fill-slate-700">사영 (충분통계량)</text>
      </svg>

      <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300">
        사영 스칼라값 <InlineMath math={`\\tilde{y} = \\mathbf{v}^T \\mathbf{y} = ${projScalar.toFixed(3)}`} /> — 이 값만으로 ML 판정이 가능합니다.
      </div>
    </div>
  );
}

/* ─────────────── Main Section Component ─────────────── */
export default function Section0AppendixA({ onNavigate }: Section0Props) {
  return (
    <section id="appendix-a" className="section-card transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <span className="badge badge-blue">Foundation</span>
        <span className="text-sm text-slate-400">Appendix A.2~A.3</span>
      </div>

      <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
        Appendix A: 가우시안 잡음에서의 검출과 추정
      </h2>
      <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
        Chapter 3의 검출·추정 논의를 위한 수학적 기초입니다.
        가우시안 잡음 하에서 ML 검출 규칙과 MMSE 추정 공식을 스칼라에서 벡터, 복소수까지 단계적으로 확장합니다.
        이 결과들이{' '}
        <button onClick={() => onNavigate('detection')} className="cross-ref !text-xs">
          3.1 Detection
        </button>
        의 페이딩 검출과{' '}
        <button onClick={() => onNavigate('pilot-estimation')} className="cross-ref !text-xs">
          3.5 채널 추정
        </button>
        의 기반이 됩니다.
      </p>

      {/* ═══════════════════ A.2 Detection ═══════════════════ */}
      <div id="appendix-a2" className="mb-10">
        <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6 border-b border-slate-200 dark:border-slate-700 pb-2">
          A.2 가우시안 잡음에서의 검출 (Detection)
        </h3>

        {/* ─── A.2.1 Scalar Detection ─── */}
        <div id="appendix-a2-1" className="concept-card mb-6">
          <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">A.2.1</div>
          <h4 className="font-bold text-xl text-slate-800 dark:text-slate-200 mb-3">스칼라 검출 (Scalar Detection)</h4>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            가장 단순한 설정입니다. 실수 스칼라 채널에서 두 가설 중 하나를 판정합니다.
          </p>

          <div className="formula-block mb-4">
            <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">채널 모델</h5>
            <BlockMath math={String.raw`y = u + w, \quad w \sim \mathcal{N}(0, N_0/2)`} />
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              <InlineMath math="u" />는 두 가설 중 하나(<InlineMath math="u_A" /> 또는 <InlineMath math="u_B" />)이고,
              <InlineMath math="w" />는 분산 <InlineMath math="N_0/2" />인 가우시안 잡음입니다.
            </p>
          </div>

          <div className="formula-block mb-4">
            <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">ML 검출: 최근접 이웃 규칙</h5>
            <BlockMath math={String.raw`\hat{u}_{\text{ML}} = \arg\min_{u \in \{u_A, u_B\}} |y - u|`} />
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              가우시안 잡음 하에서 likelihood를 최대화하면 유클리드 거리 최소화와 동치입니다.
              두 가설이면 단순히 가까운 쪽을 선택하는 nearest neighbor rule이 됩니다.
            </p>
          </div>

          <div className="formula-block mb-4">
            <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">오류 확률</h5>
            <BlockMath math={String.raw`p_e = Q\!\left(\frac{|u_A - u_B|}{2\sqrt{N_0/2}}\right) = Q\!\left(\frac{|u_A - u_B|}{\sqrt{2N_0}}\right)`} />
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              오류 확률은 신호 간 거리 대 잡음 표준편차의 비율로 결정됩니다.
              거리가 넓을수록, 잡음이 작을수록 <InlineMath math="Q" />-함수의 인수가 커져 오류가 줄어듭니다.
            </p>
          </div>

          <div className="concept-card !bg-blue-50 dark:!bg-blue-900/20 !border-blue-200 dark:!border-blue-800 mb-4">
            <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Q-함수란?</h5>
            <BlockMath math={String.raw`Q(x) = \frac{1}{\sqrt{2\pi}} \int_x^{\infty} e^{-t^2/2}\,dt`} />
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              표준 가우시안 분포의 우측 꼬리 확률입니다.
              <InlineMath math="Q(x)" />는 <InlineMath math="x" />가 커지면 지수적으로 감소하며,
              대략 <InlineMath math={String.raw`Q(x) \approx \frac{1}{\sqrt{2\pi} x} e^{-x^2/2}`} />로 근사합니다.
              디지털 통신에서 오류 확률을 표현하는 표준 함수입니다.
            </p>
          </div>
        </div>

        {/* Interactive: Scalar Detection Visualizer */}
        <ScalarDetectionVisualizer />

        {/* ─── A.2.2 Vector Detection ─── */}
        <div id="appendix-a2-2" className="concept-card mb-6">
          <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">A.2.2</div>
          <h4 className="font-bold text-xl text-slate-800 dark:text-slate-200 mb-3">벡터 검출 (Vector Detection)</h4>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            스칼라 결과를 다차원으로 확장합니다.
            핵심은 벡터 공간에서도 ML 규칙이 유클리드 거리 최소화이며,
            사영(projection)을 통해 스칼라 문제로 환원할 수 있다는 것입니다.
          </p>

          <div className="formula-block mb-4">
            <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">벡터 채널 모델</h5>
            <BlockMath math={String.raw`\mathbf{y} = \mathbf{u} + \mathbf{w}, \quad \mathbf{w} \sim \mathcal{N}(\mathbf{0}, \tfrac{N_0}{2}\mathbf{I})`} />
          </div>

          <div className="formula-block mb-4">
            <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">ML 규칙 (벡터)</h5>
            <BlockMath math={String.raw`\hat{\mathbf{u}}_{\text{ML}} = \arg\min_{\mathbf{u} \in \{\mathbf{u}_A, \mathbf{u}_B\}} \|\mathbf{y} - \mathbf{u}\|^2`} />
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              잡음이 각 차원에 독립이므로, 벡터 ML도 유클리드 노름 최소화입니다.
              오류 확률은 오직 두 가설 사이의 유클리드 거리에만 의존합니다.
            </p>
          </div>

          <div className="formula-block mb-4">
            <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">스칼라로 사영: 충분통계량과 정합 필터</h5>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
              방향 벡터 <InlineMath math={String.raw`\mathbf{v} = \frac{\mathbf{u}_A - \mathbf{u}_B}{\|\mathbf{u}_A - \mathbf{u}_B\|}`} />로 사영하면
              차원에 관계없이 스칼라 검출 문제로 환원됩니다.
            </p>
            <BlockMath math={String.raw`\tilde{y} = \mathbf{v}^T \mathbf{y} \quad \text{(sufficient statistic)}`} />
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              이것이 정합 필터(matched filter)의 핵심입니다.
              <InlineMath math={String.raw`\mathbf{v}`} /> 방향 이외의 성분은 두 가설을 구별하는 데 아무 정보를 주지 않습니다.
            </p>
          </div>

          <div className="formula-block mb-4">
            <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">벡터 검출의 오류 확률</h5>
            <BlockMath math={String.raw`p_e = Q\!\left(\frac{\|\mathbf{u}_A - \mathbf{u}_B\|}{2\sqrt{N_0/2}}\right) = Q\!\left(\frac{\|\mathbf{u}_A - \mathbf{u}_B\|}{\sqrt{2N_0}}\right)`} />
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              스칼라 공식에서 <InlineMath math="|u_A - u_B|" />가{' '}
              <InlineMath math={String.raw`\|\mathbf{u}_A - \mathbf{u}_B\|`} />로 바뀔 뿐, 구조는 동일합니다.
              차원이 높아져도 오류 확률은 거리에만 의존합니다.
            </p>
          </div>
        </div>

        {/* Interactive: Vector Projection Demo */}
        <VectorProjectionDemo />

        {/* ─── A.2.3 Complex Vector Detection ─── */}
        <div id="appendix-a2-3" className="concept-card mb-6">
          <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">A.2.3</div>
          <h4 className="font-bold text-xl text-slate-800 dark:text-slate-200 mb-3">복소 벡터 검출 (Complex Vector Detection)</h4>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            무선 통신에서 기저대역 신호는 복소수입니다.
            실수 벡터 결과를 복소수로 확장하면 I/Q 두 실수 차원을 하나의 복소 차원으로 묶어 표기합니다.
          </p>

          <div className="formula-block mb-4">
            <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">복소 채널 모델</h5>
            <BlockMath math={String.raw`\mathbf{y} = \mathbf{u} + \mathbf{w}, \quad \mathbf{w} \sim \mathcal{CN}(\mathbf{0}, N_0 \mathbf{I})`} />
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              <InlineMath math={String.raw`\mathcal{CN}(0, N_0)`} />는 실수부와 허수부가 각각{' '}
              <InlineMath math={String.raw`\mathcal{N}(0, N_0/2)`} />인 circularly symmetric 복소 가우시안입니다.
            </p>
          </div>

          <div className="formula-block mb-4">
            <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">복소 충분통계량</h5>
            <BlockMath math={String.raw`\tilde{y} = \frac{\mathbf{v}^H \mathbf{y}}{\|\mathbf{v}\|}`} />
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              정합 필터가 <InlineMath math={String.raw`\mathbf{v}^T`} />에서{' '}
              <InlineMath math={String.raw`\mathbf{v}^H`} /> (Hermitian transpose)로 바뀝니다.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
              <div className="font-bold text-indigo-700 dark:text-indigo-300 mb-1">
                <InlineMath math={String.raw`\text{Re}[\mathbf{h}^* y]`} />가 충분한 경우
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                BPSK처럼 실수 성상도를 사용할 때, 실수부만으로 판정이 충분합니다.
                허수부에는 두 가설에 대한 판별 정보가 없습니다.
              </p>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="font-bold text-amber-700 dark:text-amber-300 mb-1">
                복소 충분통계량이 필요한 경우
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                QPSK/QAM처럼 I와 Q 모두에 정보가 실려 있으면,
                복소 전체 충분통계량 <InlineMath math={String.raw`\mathbf{v}^H \mathbf{y}`} />가 필요합니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════ A.3 Estimation ═══════════════════ */}
      <div id="appendix-a3" className="mb-8">
        <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6 border-b border-slate-200 dark:border-slate-700 pb-2">
          A.3 가우시안 잡음에서의 추정 (Estimation)
        </h3>

        {/* ─── A.3.1 Scalar Estimation ─── */}
        <div id="appendix-a3-1" className="concept-card mb-6">
          <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">A.3.1</div>
          <h4 className="font-bold text-xl text-slate-800 dark:text-slate-200 mb-3">스칼라 추정 (Scalar Estimation)</h4>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            검출이 이산 가설 선택이라면, 추정은 연속값 복원 문제입니다.
            MSE를 최소화하는 최적 추정기와 그 구조를 정리합니다.
          </p>

          <div className="formula-block mb-4">
            <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">관측 모델</h5>
            <BlockMath math={String.raw`y = x + w, \quad w \sim \mathcal{N}(0, N_0/2), \quad x \sim \mathcal{N}(0, \sigma_x^2)`} />
          </div>

          <div className="formula-block mb-4">
            <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">MMSE 추정기</h5>
            <BlockMath math={String.raw`\hat{x}_{\text{MMSE}} = \mathbb{E}[x|y] = c \cdot y, \quad c = \frac{\sigma_x^2}{\sigma_x^2 + N_0/2}`} />
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              가우시안 사전분포 하에서 MMSE 추정기는 관측의 선형 스케일링입니다.
              계수 <InlineMath math="c" />는 SNR이 높으면 1에 가까워지고 (관측 신뢰),
              낮으면 0에 가까워집니다 (사전 정보에 의존).
            </p>
          </div>

          <div className="formula-block mb-4">
            <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">직교성 원리 (Orthogonality Principle)</h5>
            <BlockMath math={String.raw`\mathbb{E}[(\hat{x} - x) \cdot y] = 0`} />
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              최적 추정의 오차는 관측과 직교해야 합니다.
              직관적으로, 오차에 <InlineMath math="y" />와 상관된 성분이 남아 있다면
              그것을 활용해 추정을 더 개선할 수 있으므로 아직 최적이 아닙니다.
              이 원리는 선형 추정기 설계의 핵심 도구입니다.
            </p>
          </div>

          <div className="formula-block mb-4">
            <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">MMSE (최소 평균제곱오차)</h5>
            <BlockMath math={String.raw`\text{MMSE} = \sigma_x^2 - \frac{\sigma_x^4}{\sigma_x^2 + N_0/2} = \frac{\sigma_x^2 \cdot N_0/2}{\sigma_x^2 + N_0/2}`} />
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              SNR이 높을수록 MMSE가 감소하지만, 영(0)으로 가려면 SNR이 무한대여야 합니다.
            </p>
          </div>
        </div>

        {/* ─── A.3.2 Vector Estimation ─── */}
        <div id="appendix-a3-2" className="concept-card mb-6">
          <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">A.3.2</div>
          <h4 className="font-bold text-xl text-slate-800 dark:text-slate-200 mb-3">벡터 추정 (Vector Estimation)</h4>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            채널 벡터 <InlineMath math="\mathbf{h}" />를 통해 관측하는 경우로 확장합니다.
            정합 필터가 다시 등장하며, Cauchy-Schwarz 부등식이 최적성을 보장합니다.
          </p>

          <div className="formula-block mb-4">
            <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">관측 모델</h5>
            <BlockMath math={String.raw`\mathbf{y} = \mathbf{h}\,x + \mathbf{w}, \quad \mathbf{w} \sim \mathcal{N}(\mathbf{0}, \tfrac{N_0}{2}\mathbf{I})`} />
          </div>

          <div className="formula-block mb-4">
            <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">충분통계량</h5>
            <BlockMath math={String.raw`\tilde{y} = \frac{\mathbf{h}^T \mathbf{y}}{\|\mathbf{h}\|^2} = x + \frac{\mathbf{h}^T \mathbf{w}}{\|\mathbf{h}\|^2}`} />
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              벡터 관측을 <InlineMath math="\mathbf{h}" /> 방향으로 사영하면 스칼라 충분통계량이 됩니다.
              사영 후 잡음 분산은 <InlineMath math={String.raw`N_0/(2\|\mathbf{h}\|^2)`} />로 줄어듭니다.
            </p>
          </div>

          <div className="formula-block mb-4">
            <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">최적 선형 추정</h5>
            <BlockMath math={String.raw`\hat{x} = \frac{\sigma_x^2 \|\mathbf{h}\|^2}{\sigma_x^2 \|\mathbf{h}\|^2 + N_0/2} \cdot \tilde{y}`} />
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              스칼라 MMSE 공식에서 잡음이 <InlineMath math={String.raw`N_0/(2\|\mathbf{h}\|^2)`} />로 교체된 형태입니다.
              채널 이득 <InlineMath math={String.raw`\|\mathbf{h}\|^2`} />이 클수록 유효 SNR이 높아져 추정 정밀도가 올라갑니다.
            </p>
          </div>

          <div className="concept-card !bg-emerald-50 dark:!bg-emerald-900/20 !border-emerald-200 dark:!border-emerald-800 mb-4">
            <h5 className="font-semibold text-emerald-800 dark:text-emerald-300 mb-2">정합 필터가 SNR을 최대화하는 이유</h5>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
              임의의 가중 벡터 <InlineMath math="\mathbf{a}" />로 <InlineMath math={String.raw`\mathbf{a}^T \mathbf{y}`} />를 구성하면,
              출력 SNR은 다음으로 상계됩니다:
            </p>
            <BlockMath math={String.raw`\text{SNR}_{\text{out}} = \frac{(\mathbf{a}^T \mathbf{h})^2 \sigma_x^2}{\|\mathbf{a}\|^2 N_0/2} \le \frac{\|\mathbf{h}\|^2 \sigma_x^2}{N_0/2}`} />
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              등호 조건은 <InlineMath math={String.raw`\mathbf{a} \propto \mathbf{h}`} /> (Cauchy-Schwarz 등호)입니다.
              이것이 정합 필터(matched filter)이며, 이후{' '}
              <button onClick={() => onNavigate('simo')} className="cross-ref !text-xs">
                3.3 MRC
              </button>
              에서 다중 안테나 결합으로 재등장합니다.
            </p>
          </div>
        </div>

        {/* ─── A.3.3 Complex Estimation ─── */}
        <div id="appendix-a3-3" className="concept-card mb-6">
          <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">A.3.3</div>
          <h4 className="font-bold text-xl text-slate-800 dark:text-slate-200 mb-3">복소 추정 (Complex Estimation)</h4>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            실수 추정 결과를 복소수로 확장합니다.
            핵심 구조는 동일하며, transpose가 Hermitian transpose로 바뀝니다.
          </p>

          <div className="formula-block mb-4">
            <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">복소 MMSE 추정</h5>
            <BlockMath math={String.raw`\hat{x} = \frac{\sigma_x^2 \|\mathbf{h}\|^2}{\sigma_x^2 \|\mathbf{h}\|^2 + N_0} \cdot \frac{\mathbf{h}^H \mathbf{y}}{\|\mathbf{h}\|^2}`} />
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              복소 모델에서 잡음 분산이 <InlineMath math="N_0" /> (실수부·허수부 합)이므로 분모 항이 달라집니다.
              사영 연산에서 <InlineMath math={String.raw`\mathbf{h}^T`} />가{' '}
              <InlineMath math={String.raw`\mathbf{h}^H`} />로 바뀝니다.
            </p>
          </div>

          <div className="formula-block mb-4">
            <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">복소 직교성 원리</h5>
            <BlockMath math={String.raw`\mathbb{E}[(\hat{x} - x) \cdot y^*] = 0`} />
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              복소수에서는 켤레(conjugate)가 내적의 역할을 합니다.
              실수 직교성 원리의 자연스러운 복소 확장입니다.
            </p>
          </div>
        </div>
      </div>

      {/* ─── A.2~A.3 통합 요약 ─── */}
      <div className="concept-card mb-6">
        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 mb-3">A.2~A.3 통합 요약</h3>
        <div className="compare-grid mb-4">
          <div className="compare-item border-blue-200 bg-blue-50/40 dark:bg-blue-900/10 dark:border-blue-800">
            <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-2">A.2 검출</h4>
            <ul className="text-sm text-slate-600 dark:text-slate-400 list-disc list-inside space-y-1">
              <li>이산 가설 선택 (ML = 최소 거리)</li>
              <li>사영 → 스칼라 충분통계량</li>
              <li>정합 필터 = 최적 사영 방향</li>
              <li><InlineMath math={String.raw`p_e = Q(d / \sqrt{2N_0})`} /></li>
            </ul>
          </div>
          <div className="compare-item border-emerald-200 bg-emerald-50/40 dark:bg-emerald-900/10 dark:border-emerald-800">
            <h4 className="font-bold text-emerald-800 dark:text-emerald-300 mb-2">A.3 추정</h4>
            <ul className="text-sm text-slate-600 dark:text-slate-400 list-disc list-inside space-y-1">
              <li>연속값 복원 (MMSE = 조건부 기대값)</li>
              <li>직교성 원리 = 최적 조건</li>
              <li>정합 필터 = SNR 최대화</li>
              <li>Cauchy-Schwarz → MRC로 확장</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ─── Insight ─── */}
      <div className="insight mb-0">
        <div className="insight-title">검출·추정에서 Chapter 3으로</div>
        <p className="text-sm text-amber-900 dark:text-amber-200">
          Appendix A의 AWGN 결과가 "알려진 채널"에 대한 기준선이라면,
          Chapter 3의 핵심 질문은 "채널 자체가 랜덤일 때 이 결과가 어떻게 바뀌는가"입니다.{' '}
          <button onClick={() => onNavigate('detection')} className="cross-ref !text-xs">
            3.1 Detection
          </button>
          에서 바로 이 전환이 일어납니다. 정합 필터와 Q-함수 표현은 유지되지만,
          채널 이득 <InlineMath math="h" />의 랜덤성이 오류 확률의 감소 속도를 근본적으로 바꿉니다.
        </p>
      </div>
    </section>
  );
}
