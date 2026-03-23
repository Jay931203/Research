'use client';

import { BlockMath, InlineMath } from 'react-katex';
import { useState, useMemo, useCallback } from 'react';
import Slider from 'rc-slider';
import GaussianDetectionEstimationLab from '@/components/tse/interactive/GaussianDetectionEstimationLab';
import PlotlyChart from '@/components/tse/interactive/PlotlyChart';

interface Section1Props {
  onNavigate: (id: string) => void;
}

/* ─────────────── AWGN vs Fading Pe Comparison (SVG) ─────────────── */
function PeComparisonChart() {
  const [snrMax, setSnrMax] = useState(30);

  // Q-function approximation (non-recursive to satisfy TS)
  const qFunc = useCallback((x: number): number => {
    if (x === 0) return 0.5;
    const ax = Math.abs(x);
    const t = 1 / (1 + 0.2316419 * ax);
    const d = 0.3989422804014327;
    const poly = t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
    const val = d * Math.exp(-0.5 * ax * ax) * poly;
    return x < 0 ? 1 - val : val;
  }, []);

  const W = 520, H = 320;
  const margin = { top: 30, right: 20, bottom: 50, left: 60 };
  const pw = W - margin.left - margin.right;
  const ph = H - margin.top - margin.bottom;

  // Generate data points
  const nPts = 100;
  const snrDbArr = Array.from({ length: nPts }, (_, i) => 1 + (i / (nPts - 1)) * (snrMax - 1));

  const logPeMin = -8;
  const logPeMax = 0;

  const xScale = (snr: number) => margin.left + ((snr - 1) / (snrMax - 1)) * pw;
  const yScale = (logPe: number) => margin.top + ((logPeMax - logPe) / (logPeMax - logPeMin)) * ph;

  // Three curves
  const curves = useMemo(() => {
    return snrDbArr.map(snrDb => {
      const snrLin = Math.pow(10, snrDb / 10);
      const peAwgn = qFunc(Math.sqrt(2 * snrLin));
      const peCoh = 0.5 * (1 - Math.sqrt(snrLin / (1 + snrLin)));
      const peNc = 1 / (2 * (1 + snrLin));
      return {
        snrDb,
        logAwgn: Math.max(Math.log10(Math.max(peAwgn, 1e-12)), logPeMin),
        logCoh: Math.max(Math.log10(Math.max(peCoh, 1e-12)), logPeMin),
        logNc: Math.max(Math.log10(Math.max(peNc, 1e-12)), logPeMin),
      };
    });
  }, [snrDbArr, qFunc, snrMax, logPeMin]);

  const pathAwgn = curves.map((c, i) => `${i === 0 ? 'M' : 'L'}${xScale(c.snrDb).toFixed(1)},${yScale(c.logAwgn).toFixed(1)}`).join(' ');
  const pathCoh = curves.map((c, i) => `${i === 0 ? 'M' : 'L'}${xScale(c.snrDb).toFixed(1)},${yScale(c.logCoh).toFixed(1)}`).join(' ');
  const pathNc = curves.map((c, i) => `${i === 0 ? 'M' : 'L'}${xScale(c.snrDb).toFixed(1)},${yScale(c.logNc).toFixed(1)}`).join(' ');

  // Horizontal line at pe=10^-3
  const pe3Y = yScale(-3);

  // Grid lines
  const yGridValues = [-1, -2, -3, -4, -5, -6, -7];
  const xGridValues = [5, 10, 15, 20, 25, 30].filter(v => v <= snrMax);

  return (
    <div className="concept-card mb-6" id="awgn-fading-pe-chart">
      <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Interactive: AWGN vs Fading Pe 비교</h4>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
        세 가지 검출 방식의 오류 확률을 비교합니다.
        페이딩 채널에서는 AWGN 대비 약 20 dB 이상의 SNR 손실이 발생합니다.
      </p>

      <div className="mb-3">
        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
          SNR 범위: 1 ~ <span className="text-emerald-700 dark:text-emerald-400 font-bold">{snrMax} dB</span>
        </label>
        <input
          type="range"
          min={15}
          max={40}
          step={1}
          value={snrMax}
          onChange={(e) => setSnrMax(parseInt(e.target.value))}
          className="w-full accent-emerald-600"
          aria-label="SNR range maximum"
        />
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[520px] mx-auto bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
        {/* Y grid */}
        {yGridValues.map(v => (
          <g key={`yg-${v}`}>
            <line x1={margin.left} y1={yScale(v)} x2={W - margin.right} y2={yScale(v)}
              stroke="#e2e8f0" strokeWidth="0.5" />
            <text x={margin.left - 5} y={yScale(v) + 3} textAnchor="end" fontSize="9" className="fill-slate-500">
              10^{v}
            </text>
          </g>
        ))}

        {/* X grid */}
        {xGridValues.map(v => (
          <g key={`xg-${v}`}>
            <line x1={xScale(v)} y1={margin.top} x2={xScale(v)} y2={margin.top + ph}
              stroke="#e2e8f0" strokeWidth="0.5" />
            <text x={xScale(v)} y={margin.top + ph + 15} textAnchor="middle" fontSize="9" className="fill-slate-500">
              {v}
            </text>
          </g>
        ))}

        {/* Pe = 10^-3 reference */}
        <line x1={margin.left} y1={pe3Y} x2={W - margin.right} y2={pe3Y}
          stroke="#f59e0b" strokeWidth="1" strokeDasharray="4,3" />
        <text x={W - margin.right + 2} y={pe3Y + 3} fontSize="8" className="fill-amber-600">10^-3</text>

        {/* Curves */}
        <path d={pathAwgn} fill="none" stroke="#1d4ed8" strokeWidth="2.5" />
        <path d={pathCoh} fill="none" stroke="#dc2626" strokeWidth="2" />
        <path d={pathNc} fill="none" stroke="#9333ea" strokeWidth="2" strokeDasharray="5,3" />

        {/* Axes */}
        <line x1={margin.left} y1={margin.top + ph} x2={W - margin.right} y2={margin.top + ph} stroke="#64748b" strokeWidth="1" />
        <line x1={margin.left} y1={margin.top} x2={margin.left} y2={margin.top + ph} stroke="#64748b" strokeWidth="1" />

        {/* Axis labels */}
        <text x={margin.left + pw / 2} y={H - 5} textAnchor="middle" fontSize="11" className="fill-slate-600 dark:fill-slate-400">SNR (dB)</text>
        <text x={12} y={margin.top + ph / 2} textAnchor="middle" fontSize="11" className="fill-slate-600 dark:fill-slate-400"
          transform={`rotate(-90, 12, ${margin.top + ph / 2})`}>Pe (log scale)</text>

        {/* Legend */}
        <rect x={margin.left + 10} y={margin.top + 5} width={175} height={55} rx={4} fill="white" fillOpacity={0.9} stroke="#e2e8f0" />
        <line x1={margin.left + 18} y1={margin.top + 18} x2={margin.left + 38} y2={margin.top + 18} stroke="#1d4ed8" strokeWidth="2.5" />
        <text x={margin.left + 43} y={margin.top + 22} fontSize="10" className="fill-slate-700">AWGN BPSK</text>
        <line x1={margin.left + 18} y1={margin.top + 33} x2={margin.left + 38} y2={margin.top + 33} stroke="#dc2626" strokeWidth="2" />
        <text x={margin.left + 43} y={margin.top + 37} fontSize="10" className="fill-slate-700">Coherent fading</text>
        <line x1={margin.left + 18} y1={margin.top + 48} x2={margin.left + 38} y2={margin.top + 48} stroke="#9333ea" strokeWidth="2" strokeDasharray="5,3" />
        <text x={margin.left + 43} y={margin.top + 52} fontSize="10" className="fill-slate-700">Noncoherent</text>
      </svg>

      <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 text-sm text-amber-900 dark:text-amber-200">
        <InlineMath math="p_e = 10^{-3}" /> 기준: AWGN은 약 7 dB, Coherent fading은 약 27 dB가 필요합니다.
        이 <strong>약 20 dB 격차</strong>가 다이버시티의 동기가 됩니다.
      </div>
    </div>
  );
}

/* ─────────────── Deep Fade Probability Calculator ─────────────── */
function DeepFadeCalculator() {
  const [snrDb, setSnrDb] = useState(15);
  const snrLin = Math.pow(10, snrDb / 10);
  const pDeepFade = Math.min(1 / snrLin, 1);
  const pGood = 1 - pDeepFade;
  const barWidth = 300;

  return (
    <div className="concept-card mb-6" id="deep-fade-calculator">
      <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Interactive: Deep Fade 확률 계산기</h4>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
        Rayleigh 페이딩에서 채널 이득이 임계값 이하로 떨어지는 확률(deep fade event)을 관찰합니다.
        <InlineMath math={String.raw`P\{|h|^2 < 1/\text{SNR}\} \approx 1/\text{SNR}`} />
      </p>

      <div className="mb-4">
        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
          SNR: <span className="text-emerald-700 dark:text-emerald-400 font-bold">{snrDb} dB</span>
          {' '}({snrLin.toFixed(1)} linear)
        </label>
        <input
          type="range"
          min={3}
          max={30}
          step={1}
          value={snrDb}
          onChange={(e) => setSnrDb(parseInt(e.target.value))}
          className="w-full accent-emerald-600"
          aria-label="SNR in dB for deep fade"
        />
      </div>

      {/* Stacked bar */}
      <div className="flex items-center gap-3 mb-3">
        <div className="text-xs text-slate-500 dark:text-slate-400 w-20 text-right">채널 상태</div>
        <div className="flex rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700" style={{ width: barWidth }}>
          <div
            className="h-8 bg-emerald-500 transition-all duration-300 flex items-center justify-center text-white text-xs font-bold"
            style={{ width: `${pGood * 100}%`, minWidth: pGood > 0.05 ? '30px' : '0' }}
          >
            {pGood > 0.1 ? `${(pGood * 100).toFixed(1)}%` : ''}
          </div>
          <div
            className="h-8 bg-red-500 transition-all duration-300 flex items-center justify-center text-white text-xs font-bold"
            style={{ width: `${pDeepFade * 100}%`, minWidth: pDeepFade > 0.01 ? '20px' : '2px' }}
          >
            {pDeepFade > 0.05 ? `${(pDeepFade * 100).toFixed(1)}%` : ''}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm mb-3">
        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
          <div className="text-emerald-700 dark:text-emerald-400 font-bold">Good Channel</div>
          <div className="text-slate-600 dark:text-slate-400">{(pGood * 100).toFixed(2)}%</div>
        </div>
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <div className="text-red-700 dark:text-red-400 font-bold">Deep Fade</div>
          <div className="text-slate-600 dark:text-slate-400">
            {pDeepFade < 0.01 ? pDeepFade.toExponential(2) : `${(pDeepFade * 100).toFixed(2)}%`}
          </div>
        </div>
      </div>

      <div className="p-2 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300">
        <InlineMath math={String.raw`P(\text{deep fade}) \approx 1/\text{SNR} = 1/${snrLin.toFixed(1)} = ${pDeepFade.toExponential(2)}`} />
        {' '} — 이 드문 이벤트가 전체 오류율을 지배합니다.
      </div>
    </div>
  );
}

/* ─────────────── Main Section Component ─────────────── */
export default function Section1Detection({ onNavigate }: Section1Props) {
  const [diversityL, setDiversityL] = useState(1);
  const [snrDb, setSnrDb] = useState(15);

  const peData = useMemo(() => {
    const snrLin = Math.pow(10, snrDb / 10);
    const peAwgn = 0.5 * Math.exp(-snrLin / 2);
    const peFading = 1 / (2 * snrLin * diversityL);
    const peDiv = Math.pow(1 / (2 * snrLin), diversityL);
    const slopeLabel = diversityL === 1 ? '1/SNR (느림)' : `1/SNR^${diversityL} (가파름)`;
    return { peAwgn, peFading, peDiv, slopeLabel, snrLin };
  }, [diversityL, snrDb]);

  // Pe vs SNR chart data (고 SNR 근사: Pe_L ≈ C(2L-1,L-1)/(4·SNR)^L)
  const peChartData = useMemo(() => {
    const snrDbArr = Array.from({ length: 31 }, (_, i) => i);
    const snrLin = snrDbArr.map(s => Math.pow(10, s / 10));
    // AWGN BPSK: (1/2)exp(-SNR) approximation
    const awgn = snrLin.map(s => Math.max(0.5 * Math.exp(-s), 1e-10));
    // Rayleigh L 다이버시티: C(2L-1,L-1) / (4*SNR)^L
    // L=1: C(1,0)=1, L=2: C(3,1)=3, L=4: C(7,3)=35
    const rL1 = snrLin.map(s => Math.max(1 / (4 * s), 1e-10));
    const rL2 = snrLin.map(s => Math.max(3 / Math.pow(4 * s, 2), 1e-10));
    const rL4 = snrLin.map(s => Math.max(35 / Math.pow(4 * s, 4), 1e-10));
    return { snrDbArr, awgn, rL1, rL2, rL4 };
  }, []);

  return (
    <section id="detection" className="section-card transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <span className="badge badge-amber">Intermediate</span>
        <span className="text-sm text-slate-400">Section 1</span>
      </div>

      <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">3.1 Detection in Fading Channels</h2>
      <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
        Chapter 3의 출발점은 간단합니다.
        채널 이득 자체가 랜덤일 때, 수신기가 심볼을 어떻게 결정할 것인가입니다.
        Chapter 2에서 채널 모델을 정리했다면, 여기서는 그 채널 위에서 <strong>실제 복조</strong>를 수행하는 문제로 전환합니다.
        핵심 구분은 수신기가 채널 위상을 알고 있는지 여부입니다.
        먼저{' '}
        <button onClick={() => onNavigate('appendix-a')} className="cross-ref !text-xs">
          Appendix A
        </button>
        의 가우시안 검출 기초를 확인한 후 진행하면 더 명확합니다.
      </p>

      {/* ─── 3.1.1 Noncoherent Detection ─── */}
      <div className="concept-card mb-6" id="noncoherent-detection">
        <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">3.1.1</div>
        <h3 className="font-bold text-xl text-slate-800 dark:text-slate-200 mb-2">비코히어런트 검출 (Noncoherent Detection)</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
          수신기가 채널 위상을 모르면, 위상 정보를 버리고 에너지(크기) 기반으로 판정합니다.
          구현이 단순하지만, 위상이 가진 정보를 활용하지 못하므로 성능 손실이 발생합니다.
        </p>

        <div className="formula-block mb-4">
          <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">왜 BPSK가 실패하는가</h5>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
            BPSK는 <InlineMath math="x \in \{+\sqrt{E_s}, -\sqrt{E_s}\}" />로 위상 반전에 정보를 싣습니다.
            수신 신호 <InlineMath math="y = he^{j\theta}x + w" />에서 <InlineMath math="\theta" />를 모르면,
            <InlineMath math="+x" />와 <InlineMath math="-x" />가 랜덤 위상 회전 후 구별 불가능합니다.
          </p>
          <BlockMath math={String.raw`y = |h|e^{j\theta} x + w \;\Rightarrow\; \theta\text{를 모르면 } +x,\, -x \text{ 구별 불가}`} />
        </div>

        <div className="formula-block mb-4">
          <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">직교 신호 방식 (Orthogonal Signaling)</h5>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
            해결책은 에너지의 위치로 정보를 전달하는 것입니다.
            두 직교 슬롯 중 어디에 에너지를 넣었는지 비교합니다.
          </p>
          <BlockMath math={String.raw`\mathcal{H}_0: y[0] = hx + w[0],\; y[1] = w[1] \quad \text{vs} \quad \mathcal{H}_1: y[0] = w[0],\; y[1] = hx + w[1]`} />
          <BlockMath math={String.raw`\text{판정: } |y[0]|^2 \mathop{\gtrless}_{\mathcal{H}_1}^{\mathcal{H}_0} |y[1]|^2`} />
        </div>

        <div className="formula-block mb-4">
          <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">비코히어런트 오류 확률</h5>
          <BlockMath math={String.raw`p_e^{\text{NC}} = \frac{1}{2(1 + \text{SNR})}`} />
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            고 SNR에서 <InlineMath math={String.raw`p_e \approx 1/(2 \cdot \text{SNR})`} />로{' '}
            <InlineMath math={String.raw`1/\text{SNR}`} /> 감소입니다.
            <InlineMath math="p_e = 10^{-3}" />을 달성하려면 약 <strong>27 dB</strong>의 SNR이 필요합니다.
          </p>
        </div>
      </div>

      {/* ─── 3.1.2 Coherent Detection ─── */}
      <div className="formula-block mb-6" id="coherent-ml">
        <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">3.1.2</div>
        <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-3">코히어런트 검출 (Coherent Detection)</h4>
        <BlockMath math={String.raw`y = hx + w, \quad h \sim \mathcal{CN}(0,1),\; w \sim \mathcal{CN}(0, N_0)`} />
        <div className="text-sm text-slate-600 dark:text-slate-400 mt-2 mb-4">
          채널 이득 <InlineMath math="h" />를 알면 ML 규칙은 유클리드 거리 최소화로 귀결되고,
          모르면 에너지 기반 통계량으로 전환해야 합니다.
          이 차이가 코히어런트/비코히어런트 검출의 핵심 갈림길입니다.
        </div>

        <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">AWGN 기준선: BPSK</h5>
        <BlockMath math={String.raw`p_e^{\text{AWGN}} = Q\!\left(\sqrt{2\,\text{SNR}}\right) \;\sim\; e^{-\text{SNR}}`} />
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 mb-4">
          AWGN에서 BPSK의 오류 확률은 SNR에 대해 지수적으로 감소합니다. 이것이 기준선입니다.
        </p>

        <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Rayleigh 페이딩에서의 코히어런트 BPSK</h5>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
          <InlineMath math="h" />를 알면 실수 충분통계량 <InlineMath math={String.raw`r = \text{Re}\{(h/|h|)^* y\}`} />로 판정합니다.
          그러나 <InlineMath math="|h|^2" />가 랜덤이므로 평균 오류 확률이 달라집니다:
        </p>
        <BlockMath math={String.raw`p_e^{\text{coh}} = \frac{1}{2}\!\left(1 - \sqrt{\frac{\text{SNR}}{1+\text{SNR}}}\right) \;\approx\; \frac{1}{4\,\text{SNR}}`} />
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
          고 SNR 근사에서 오류 확률은 <InlineMath math={String.raw`1/(4\cdot\text{SNR})`} />로,
          AWGN의 지수적 감소 대비 <strong>역수(inverse) 감소</strong>입니다.
          이 극적인 차이의 원인은 deep fade event입니다.
        </p>
      </div>

      {/* Deep fade explanation */}
      <div className="concept-card !bg-red-50 dark:!bg-red-900/20 !border-red-200 dark:!border-red-800 mb-6" id="deep-fade-event">
        <h4 className="font-semibold text-red-800 dark:text-red-300 mb-2">Deep Fade Event</h4>
        <BlockMath math={String.raw`P\!\left\{|h|^2 < \frac{1}{\text{SNR}}\right\} \approx \frac{1}{\text{SNR}}`} />
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
          Rayleigh 페이딩에서 채널 이득 <InlineMath math="|h|^2" />가 매우 작아지면,
          아무리 SNR이 높아도 유효 수신 SNR <InlineMath math={String.raw`|h|^2 \cdot \text{SNR}`} />이 낮아져 오류가 발생합니다.
          이 deep fade의 확률 자체가 <InlineMath math={String.raw`1/\text{SNR}`} />이므로,
          전체 오류율이 <InlineMath math={String.raw`1/\text{SNR}`} />보다 빠르게 줄어들 수 없습니다.
        </p>
      </div>

      {/* Interactive: AWGN vs Fading Pe Comparison */}
      <PeComparisonChart />

      {/* Interactive: Deep Fade Calculator */}
      <DeepFadeCalculator />

      <div className="grid md:grid-cols-2 gap-4 mb-7">
        <div className="concept-card">
          <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">Noncoherent Detection</div>
          <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">비코히어런트 검출: 에너지 기반</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
            수신기가 채널 위상을 모르면, 위상 정보를 버리고 에너지(크기) 기반으로 판정합니다.
          </p>
          <BlockMath math={String.raw`r = |y|^2 \mathop{\gtrless}_{\mathcal{H}_0}^{\mathcal{H}_1} \eta`} />
        </div>
        <div className="concept-card">
          <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">Coherent Detection</div>
          <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">코히어런트 검출: 거리 기반</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
            채널 이득 <InlineMath math="h" />를 정확히 알면, 수신 신호를 채널 보정 후
            심볼 공간에서 최소 거리 규칙(ML)으로 판정할 수 있습니다.
          </p>
          <BlockMath math={String.raw`\hat{x} = \arg\min_{x_i \in \mathcal{X}} |y - h x_i|^2`} />
        </div>
      </div>

      {/* ─── 3.1.3 BPSK to QPSK ─── */}
      <div className="concept-card mb-6" id="bpsk-qpsk">
        <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">3.1.3</div>
        <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">BPSK에서 QPSK로: I/Q 자유도 활용</h4>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
          코히어런트 검출이 가능하면 복소 평면의 I/Q 두 축을 독립적으로 활용할 수 있습니다.
          BPSK가 실수축만 사용한다면, QPSK는 같은 대역폭에서 I와 Q 각각에 독립 비트를 실어
          전송률을 두 배로 올립니다.
        </p>

        <div className="grid md:grid-cols-3 gap-3 mt-3 mb-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800 text-sm">
            <div className="font-bold text-blue-700 dark:text-blue-300 mb-1">BPSK</div>
            <div className="text-slate-600 dark:text-slate-400">1 bit/symbol, 실수축 판정</div>
            <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">Spectral efficiency: 1 bps/Hz</div>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-100 dark:border-emerald-800 text-sm">
            <div className="font-bold text-emerald-700 dark:text-emerald-300 mb-1">QPSK</div>
            <div className="text-slate-600 dark:text-slate-400">2 bits/symbol, I/Q 독립 판정</div>
            <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">Spectral efficiency: 2 bps/Hz</div>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800 text-sm">
            <div className="font-bold text-amber-700 dark:text-amber-300 mb-1">4-PAM</div>
            <div className="text-slate-600 dark:text-slate-400">2 bits/symbol, 실수축만 사용</div>
            <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">QPSK 대비 4 dB 손해</div>
          </div>
        </div>

        <div className="formula-block mb-4">
          <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">QPSK의 핵심</h5>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
            QPSK는 I채널과 Q채널에 각각 독립 BPSK를 실어보냅니다.
            따라서 비트 오류율(BER)이 BPSK와 동일하면서 spectral efficiency가 2배입니다.
          </p>
          <BlockMath math={String.raw`\text{QPSK: } x = \frac{1}{\sqrt{2}}(b_I + jb_Q), \quad b_I, b_Q \in \{+1, -1\}`} />
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            반면 같은 2 bits/symbol인 4-PAM은 실수축에 4개 점을 배치하므로
            점 간 거리가 줄어들어 QPSK 대비 약 4 dB 에너지 손실이 발생합니다.
          </p>
        </div>

        <div className="concept-card !bg-slate-50 dark:!bg-slate-800 !border-slate-200 dark:!border-slate-700 mb-2">
          <h5 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">DBPSK (Differential BPSK)</h5>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            완전한 코히어런트 검출이 어려울 때, 이전 심볼과의 위상 차이로 정보를 전달하는 방식입니다.
            채널이 연속 심볼 간 거의 변하지 않으면 (<InlineMath math={String.raw`h[n] \approx h[n-1]`} />),
            이전 수신 심볼이 기준(reference)이 됩니다.
            코히어런트 BPSK 대비 약 3 dB 성능 손실이 있습니다.
          </p>
        </div>
      </div>

      {/* ─── 3.1.4 Diversity Motivation ─── */}
      <div className="concept-card mb-6" id="diversity-motivation">
        <div className="text-xs font-semibold text-red-600 dark:text-red-400 mb-1">3.1.4</div>
        <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">왜 다이버시티가 필요한가</h4>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
          페이딩 채널에서는 드문 deep fade가 전체 오류율을 지배합니다.
          AWGN 채널에서 오류 확률이 <InlineMath math={String.raw`e^{-\text{SNR}}`} /> 속도로 떨어지는 반면,
          Rayleigh 채널에서는 <InlineMath math={String.raw`1/\text{SNR}`} /> 속도로만 감소합니다.
          이 극적인 차이를 극복하려면 <strong>독립적인 관측 가지(branch)</strong>를 확보해야 합니다.
        </p>

        <div className="formula-block mb-4">
          <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">단일 경로의 한계</h5>
          <BlockMath math={String.raw`p_e \sim \frac{1}{\text{SNR}} \quad \text{(단일 경로, } L=1\text{)}`} />
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            단일 경로에서는 SNR을 10 dB 올려도 오류가 10배밖에 줄지 않습니다.
            AWGN에서는 같은 10 dB에 오류가 수만 배 줄어듭니다. 이 격차가 다이버시티의 동기입니다.
          </p>
        </div>

        <BlockMath math={String.raw`P_e \propto \text{SNR}^{-L}, \quad L = \text{diversity order}`} />
        <p className="text-xs text-slate-500 dark:text-slate-500 mt-2 mb-4">
          독립 가지 수 <InlineMath math="L" />이 증가하면 고 SNR 영역의 오류 감소 기울기가 가팔라집니다.
          이후 3.2~3.4에서 시간, 공간, 주파수 축을 통해 <InlineMath math="L" />을 만드는 구체적 방법을 다룹니다.
        </p>

        <div className="grid md:grid-cols-2 gap-3 mb-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800 text-sm text-center">
              <div className="font-bold text-blue-700 dark:text-blue-300 mb-1">Time</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">인터리빙으로 독립 페이드</div>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-100 dark:border-emerald-800 text-sm text-center">
              <div className="font-bold text-emerald-700 dark:text-emerald-300 mb-1">Antenna</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">다중 안테나 SIMO/MIMO</div>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800 text-sm text-center">
              <div className="font-bold text-amber-700 dark:text-amber-300 mb-1">Frequency</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">다중 경로 + OFDM</div>
            </div>
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800 text-sm text-center">
              <div className="font-bold text-red-700 dark:text-red-300 mb-1">Macro</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">다중 기지국 (셀 간)</div>
            </div>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-sm">
            <p className="text-slate-600 dark:text-slate-400">
              <strong>핵심 원리:</strong> 서로 독립인 <InlineMath math="L" />개 경로가 동시에 deep fade에 빠질 확률은{' '}
              <InlineMath math={String.raw`(1/\text{SNR})^L`} />로 급격히 줄어듭니다.
              어떤 축에서든 독립 경로를 확보하면 동일한 다이버시티 효과를 얻습니다.
            </p>
          </div>
        </div>
      </div>

      <div className="compare-grid mb-6">
        <div className="compare-item border-slate-200 bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700">
          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 mb-2">AWGN (페이딩 없음)</h3>
          <BlockMath math={String.raw`P_e \sim e^{-c \cdot \text{SNR}}`} />
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            SNR이 조금만 올라도 오류 확률이 지수적으로 감소합니다.
          </p>
        </div>
        <div className="compare-item border-red-200 bg-red-50/50 dark:bg-red-900/10 dark:border-red-800">
          <h3 className="font-bold text-lg text-red-800 dark:text-red-300 mb-2">Rayleigh (L=1)</h3>
          <BlockMath math={String.raw`P_e \sim \frac{1}{\text{SNR}}`} />
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            deep fade 확률이 오류율을 지배하여, SNR을 올려도 개선이 느립니다.
          </p>
        </div>
      </div>

      {/* Pe formulas + Chapter 3 Main Plot chart */}
      <div className="formula-block mb-6" id="rayleigh-pe-formulas">
        <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-3">Rayleigh 페이딩에서의 오류 확률 (BPSK, 고 SNR 근사)</h4>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-500 mb-1">비코히어런트 (eq. 3.8)</div>
            <BlockMath math={String.raw`P_e^{\text{NC}} \approx \frac{1}{2\,\overline{\text{SNR}}}`} />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-500 mb-1">코히어런트 (eq. 3.13)</div>
            <BlockMath math={String.raw`P_e^{\text{coh}} \approx \frac{1}{4\,\overline{\text{SNR}}}`} />
          </div>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
          두 식 모두 <InlineMath math={String.raw`1/\overline{\text{SNR}}`} />에 비례합니다 (AWGN의 지수 감소 대비 매우 느림).
          코히어런트 검출이 비코히어런트 대비 약 3 dB (상수 인수 2) 이득을 가집니다.
          <InlineMath math="L" />-다이버시티 적용 시 기울기가 <InlineMath math="L" />배 가팔라집니다:
        </p>
        <BlockMath math={String.raw`P_e(L) \approx \binom{2L-1}{L-1} \cdot \left(\frac{1}{4\,\overline{\text{SNR}}}\right)^L`} />
      </div>

      <PlotlyChart
        data={[
          {
            x: peChartData.snrDbArr, y: peChartData.awgn,
            type: 'scatter', mode: 'lines', name: 'AWGN',
            line: { color: '#1d4ed8', width: 2.5 },
          },
          {
            x: peChartData.snrDbArr, y: peChartData.rL1,
            type: 'scatter', mode: 'lines', name: 'Rayleigh L=1',
            line: { color: '#dc2626', width: 2 },
          },
          {
            x: peChartData.snrDbArr, y: peChartData.rL2,
            type: 'scatter', mode: 'lines', name: 'Diversity L=2',
            line: { color: '#ea580c', width: 2, dash: 'dash' },
          },
          {
            x: peChartData.snrDbArr, y: peChartData.rL4,
            type: 'scatter', mode: 'lines', name: 'Diversity L=4',
            line: { color: '#059669', width: 2, dash: 'dot' },
          },
        ]}
        layout={{
          title: { text: 'Pe vs SNR: Chapter 3 Main Plot (BPSK 코히어런트, Rayleigh)', font: { size: 14 } },
          xaxis: { title: 'SNR per branch (dB)', range: [0, 30] },
          yaxis: { title: 'Pe (오류 확률)', type: 'log', range: [-9, 0] },
          height: 320,
          margin: { t: 44, b: 50, l: 65, r: 20 },
          legend: { x: 0.62, y: 0.95 },
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'rgba(255,255,255,0.8)',
        }}
        config={{ responsive: true, displayModeBar: false }}
        style={{ width: '100%' }}
      />

      {/* Diversity Order Calculator - inline interactive */}
      <div className="concept-card mb-6" id="diversity-order-calculator">
        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 mb-4">Diversity Order Calculator: L이 오류율 기울기를 바꾸는 과정</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          독립 가지 수 <InlineMath math="L" />을 올리면 고 SNR 영역의 오류 확률 감소 기울기가 가팔라집니다.
          슬라이더로 직접 확인하세요.
        </p>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="bg-white dark:bg-slate-800 p-3 rounded-lg">
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Diversity order <InlineMath math="L" />: <span className="text-emerald-700 dark:text-emerald-400 font-bold">{diversityL}</span>
            </label>
            <Slider
              min={1}
              max={8}
              step={1}
              value={diversityL}
              onChange={(v) => setDiversityL(typeof v === 'number' ? v : v[0])}
              styles={{ track: { backgroundColor: '#059669' }, handle: { borderColor: '#059669' } }}
              aria-label="Diversity order L"
            />
          </div>
          <div className="bg-white dark:bg-slate-800 p-3 rounded-lg">
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              SNR: <span className="text-emerald-700 dark:text-emerald-400 font-bold">{snrDb} dB</span>
            </label>
            <Slider
              min={5}
              max={30}
              step={1}
              value={snrDb}
              onChange={(v) => setSnrDb(typeof v === 'number' ? v : v[0])}
              styles={{ track: { backgroundColor: '#059669' }, handle: { borderColor: '#059669' } }}
              aria-label="SNR in dB"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-3 text-sm mb-4">
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <div className="text-slate-500 dark:text-slate-400">AWGN (no fading)</div>
            <div className="text-lg font-bold text-slate-700 dark:text-slate-300">{peData.peAwgn.toExponential(2)}</div>
          </div>
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <div className="text-slate-500 dark:text-slate-400">Rayleigh L=1</div>
            <div className="text-lg font-bold text-red-700 dark:text-red-300">{peData.peFading.toExponential(2)}</div>
          </div>
          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
            <div className="text-slate-500 dark:text-slate-400">Diversity L={diversityL}</div>
            <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{peData.peDiv.toExponential(2)}</div>
          </div>
        </div>

        <div className="p-2 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300">
          고 SNR 기울기: <InlineMath math={String.raw`P_e \propto \text{SNR}^{-${diversityL}}`} /> — {peData.slopeLabel}
        </div>
      </div>

      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 mb-6">
        <p className="text-sm text-amber-900 dark:text-amber-200">
          <strong>권장 실험:</strong> L=1에서 L=4로 올릴 때 오류 확률이 몇 자릿수 차이 나는지 확인합니다.
          SNR 20 dB 기준, L=1은 약 <InlineMath math="10^{-2}" />, L=4는 약 <InlineMath math="10^{-8}" /> 수준으로 달라집니다.
        </p>
      </div>

      <GaussianDetectionEstimationLab />

      <div className="insight mt-8">
        <div className="insight-title">검출에서 다이버시티로</div>
        <p className="text-sm text-amber-900 dark:text-amber-200">
          단일 링크에서의 검출 한계를 확인했습니다. 핵심 메시지는 "SNR을 올리는 것만으로는 부족하다"입니다.
          이제{' '}
          <button onClick={() => onNavigate('time-diversity')} className="cross-ref !text-xs">
            3.2 시간 다이버시티
          </button>
          부터 시작해, 독립 페이드 가지를 확보하는 세 가지 방법을 순서대로 살펴봅니다.
        </p>
      </div>
    </section>
  );
}
