'use client';

import { BlockMath, InlineMath } from 'react-katex';
import { useState, useMemo } from 'react';
import Slider from 'rc-slider';
import GaussianDetectionEstimationLab from '@/components/tse/interactive/GaussianDetectionEstimationLab';
import PlotlyChart from '@/components/tse/interactive/PlotlyChart';

interface Section1Props {
  onNavigate: (id: string) => void;
}

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

      <h2 className="text-3xl font-bold text-slate-900 mb-4">3.1 Detection in Fading Channels</h2>
      <p className="text-lg text-slate-600 leading-relaxed mb-6">
        Chapter 3의 출발점은 간단합니다.
        채널 이득 자체가 랜덤일 때, 수신기가 심볼을 어떻게 결정할 것인가입니다.
        Chapter 2에서 채널 모델을 정리했다면, 여기서는 그 채널 위에서 <strong>실제 복조</strong>를 수행하는 문제로 전환합니다.
        핵심 구분은 수신기가 채널 위상을 알고 있는지 여부입니다.
      </p>

      <div className="grid md:grid-cols-2 gap-4 mb-7">
        <div className="concept-card">
          <div className="text-xs font-semibold text-emerald-600 mb-1">Noncoherent Detection</div>
          <h3 className="font-bold text-slate-800 mb-2">비코히어런트 검출: 에너지 기반</h3>
          <p className="text-sm text-slate-600 mb-2">
            수신기가 채널 위상을 모르면, 위상 정보를 버리고 에너지(크기) 기반으로 판정합니다.
            구현이 단순하지만, 위상이 가진 정보를 활용하지 못하므로 성능 손실이 발생합니다.
          </p>
          <BlockMath math={String.raw`r = |y|^2 \mathop{\gtrless}_{\mathcal{H}_0}^{\mathcal{H}_1} \eta`} />
        </div>
        <div className="concept-card">
          <div className="text-xs font-semibold text-blue-600 mb-1">Coherent Detection</div>
          <h3 className="font-bold text-slate-800 mb-2">코히어런트 검출: 거리 기반</h3>
          <p className="text-sm text-slate-600 mb-2">
            채널 이득 <InlineMath math="h" />를 정확히 알면, 수신 신호를 채널 보정 후
            심볼 공간에서 최소 거리 규칙(ML)으로 판정할 수 있습니다.
            위상 정보까지 활용하므로 비코히어런트 대비 성능이 우수합니다.
          </p>
          <BlockMath math={String.raw`\hat{x} = \arg\min_{x_i \in \mathcal{X}} |y - h x_i|^2`} />
        </div>
      </div>

      <div className="formula-block mb-6" id="coherent-ml">
        <h4 className="font-semibold text-blue-800 mb-3">3.1.1 Flat Rayleigh 채널의 ML 검출</h4>
        <BlockMath math={String.raw`y = hx + w, \quad h \sim \mathcal{CN}(0,1),\; w \sim \mathcal{CN}(0, N_0)`} />
        <div className="text-sm text-slate-600 mt-2">
          Flat fading 채널에서 수신 신호는 채널 이득, 송신 심볼, 잡음의 곱과 합으로 표현됩니다.
          <InlineMath math="h" />를 알면 ML 규칙은 유클리드 거리 최소화로 귀결되고,
          모르면 에너지 기반 통계량으로 전환해야 합니다.
          이 차이가 코히어런트/비코히어런트 검출의 핵심 갈림길입니다.
        </div>
      </div>

      <div className="concept-card mb-6" id="bpsk-qpsk">
        <h4 className="font-semibold text-slate-800 mb-2">3.1.2 BPSK에서 QPSK로: I/Q 자유도 활용</h4>
        <p className="text-sm text-slate-600 mb-2">
          코히어런트 검출이 가능하면 복소 평면의 I/Q 두 축을 독립적으로 활용할 수 있습니다.
          BPSK가 실수축만 사용한다면, QPSK는 같은 대역폭에서 I와 Q 각각에 독립 비트를 실어
          전송률을 두 배로 올립니다.
        </p>
        <div className="grid md:grid-cols-2 gap-3 mt-3">
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 text-sm">
            <div className="font-bold text-blue-700 mb-1">BPSK</div>
            <div className="text-slate-600">1 bit/symbol, 실수축 판정</div>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100 text-sm">
            <div className="font-bold text-emerald-700 mb-1">QPSK</div>
            <div className="text-slate-600">2 bits/symbol, I/Q 독립 판정</div>
          </div>
        </div>
      </div>

      <div className="concept-card mb-6" id="diversity-motivation">
        <h4 className="font-semibold text-slate-800 mb-2">3.1.3 왜 다이버시티가 필요한가</h4>
        <p className="text-sm text-slate-600 mb-3">
          페이딩 채널에서는 드문 deep fade가 전체 오류율을 지배합니다.
          AWGN 채널에서 오류 확률이 <InlineMath math={String.raw`e^{-\text{SNR}}`} /> 속도로 떨어지는 반면,
          Rayleigh 채널에서는 <InlineMath math={String.raw`1/\text{SNR}`} /> 속도로만 감소합니다.
          이 극적인 차이를 극복하려면 <strong>독립적인 관측 가지(branch)</strong>를 확보해야 합니다.
        </p>
        <BlockMath math={String.raw`P_e \propto \text{SNR}^{-L}, \quad L = \text{diversity order}`} />
        <p className="text-xs text-slate-500 mt-2">
          독립 가지 수 <InlineMath math="L" />이 증가하면 고 SNR 영역의 오류 감소 기울기가 가팔라집니다.
          이후 3.2~3.4에서 시간, 공간, 주파수 축을 통해 <InlineMath math="L" />을 만드는 구체적 방법을 다룹니다.
        </p>
      </div>

      <div className="compare-grid mb-6">
        <div className="compare-item border-slate-200 bg-slate-50">
          <h3 className="font-bold text-lg text-slate-800 mb-2">AWGN (페이딩 없음)</h3>
          <BlockMath math={String.raw`P_e \sim e^{-c \cdot \text{SNR}}`} />
          <p className="text-sm text-slate-600 mt-2">
            SNR이 조금만 올라도 오류 확률이 지수적으로 감소합니다.
          </p>
        </div>
        <div className="compare-item border-red-200 bg-red-50/50">
          <h3 className="font-bold text-lg text-red-800 mb-2">Rayleigh (L=1)</h3>
          <BlockMath math={String.raw`P_e \sim \frac{1}{\text{SNR}}`} />
          <p className="text-sm text-slate-600 mt-2">
            deep fade 확률이 오류율을 지배하여, SNR을 올려도 개선이 느립니다.
          </p>
        </div>
      </div>

      {/* Pe formulas + Chapter 3 Main Plot chart */}
      <div className="formula-block mb-6" id="rayleigh-pe-formulas">
        <h4 className="font-semibold text-blue-800 mb-3">Rayleigh 페이딩에서의 오류 확률 (BPSK, 고 SNR 근사)</h4>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-xs text-slate-500 mb-1">비코히어런트 (eq. 3.8)</div>
            <BlockMath math={String.raw`P_e^{\text{NC}} \approx \frac{1}{2\,\overline{\text{SNR}}}`} />
          </div>
          <div>
            <div className="text-xs text-slate-500 mb-1">코히어런트 (eq. 3.13)</div>
            <BlockMath math={String.raw`P_e^{\text{coh}} \approx \frac{1}{4\,\overline{\text{SNR}}}`} />
          </div>
        </div>
        <p className="text-sm text-slate-600 mb-2">
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
        <h3 className="font-bold text-lg text-slate-800 mb-4">Diversity Order Calculator: L이 오류율 기울기를 바꾸는 과정</h3>
        <p className="text-sm text-slate-600 mb-4">
          독립 가지 수 <InlineMath math="L" />을 올리면 고 SNR 영역의 오류 확률 감소 기울기가 가팔라집니다.
          슬라이더로 직접 확인하세요.
        </p>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="bg-white p-3 rounded-lg">
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Diversity order <InlineMath math="L" />: <span className="text-emerald-700 font-bold">{diversityL}</span>
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
          <div className="bg-white p-3 rounded-lg">
            <label className="block text-xs font-medium text-slate-600 mb-1">
              SNR: <span className="text-emerald-700 font-bold">{snrDb} dB</span>
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
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div className="text-slate-500">AWGN (no fading)</div>
            <div className="text-lg font-bold text-slate-700">{peData.peAwgn.toExponential(2)}</div>
          </div>
          <div className="p-3 rounded-lg bg-red-50 border border-red-200">
            <div className="text-slate-500">Rayleigh L=1</div>
            <div className="text-lg font-bold text-red-700">{peData.peFading.toExponential(2)}</div>
          </div>
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
            <div className="text-slate-500">Diversity L={diversityL}</div>
            <div className="text-lg font-bold text-emerald-700">{peData.peDiv.toExponential(2)}</div>
          </div>
        </div>

        <div className="p-2 rounded bg-slate-50 border border-slate-200 text-sm text-slate-700">
          고 SNR 기울기: <InlineMath math={String.raw`P_e \propto \text{SNR}^{-${diversityL}}`} /> — {peData.slopeLabel}
        </div>
      </div>

      <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 mb-6">
        <p className="text-sm text-amber-900">
          <strong>권장 실험:</strong> L=1에서 L=4로 올릴 때 오류 확률이 몇 자릿수 차이 나는지 확인합니다.
          SNR 20 dB 기준, L=1은 약 <InlineMath math="10^{-2}" />, L=4는 약 <InlineMath math="10^{-8}" /> 수준으로 달라집니다.
        </p>
      </div>

      <GaussianDetectionEstimationLab />

      <div className="insight mt-8">
        <div className="insight-title">검출에서 다이버시티로</div>
        <p className="text-sm text-amber-900">
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
