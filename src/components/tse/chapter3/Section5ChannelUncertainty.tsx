'use client';

import { BlockMath, InlineMath } from 'react-katex';
import GaussianDetectionEstimationLab from '@/components/tse/interactive/GaussianDetectionEstimationLab';

interface Section5Props {
  onNavigate: (id: string) => void;
}

export default function Section5ChannelUncertainty({ onNavigate }: Section5Props) {
  return (
    <section id="channel-uncertainty" className="section-card transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <span className="badge badge-red">Advanced</span>
        <span className="text-sm text-slate-400">Section 5</span>
      </div>

      <h2 className="text-3xl font-bold text-slate-900 mb-4">3.5 Impact of Channel Uncertainty</h2>
      <p className="text-lg text-slate-600 leading-relaxed mb-6">
        앞 절의 시간, 안테나, 주파수 다이버시티 분석은 수신기가 채널 계수
        <InlineMath math="h_l" />을 정확히 알고 있다는 coherent detection 가정에서 출발했습니다.
        실제 시스템에서는 채널을 추정해야 하고, 특히 wideband DS spread spectrum처럼 다이버시티 경로 수가
        커질수록 각 경로의 에너지가 작아져 채널 학습 자체가 어려워집니다.
      </p>

      <div className="concept-card mb-6" id="noncoherent-ds">
        <h4 className="font-semibold text-slate-800 mb-2">
          3.5.1 Noncoherent Detection for DS Spread Spectrum
        </h4>
        <p className="text-sm text-slate-600 mb-3">
          PDF의 case study는 <strong>direct-sequence spread spectrum</strong>에서
          두 개의 orthogonal binary waveform <InlineMath math={String.raw`\mathbf{x}_A, \mathbf{x}_B`} /> 중
          하나를 보내는 상황입니다. 수신기는 경로별 위상과 계수를 모르는 상태에서도 에너지 비교로 검출할 수 있습니다.
        </p>

        <div className="formula-block !my-4 !p-4">
          <h4 className="font-semibold text-blue-800 mb-2">Orthogonal PN 구조</h4>
          <BlockMath math={String.raw`\mathbf{x}_A^* \mathbf{x}_B = 0, \qquad \|\mathbf{x}_A\|^2 = \|\mathbf{x}_B\|^2 = E_b`} />
          <BlockMath math={String.raw`\langle \mathbf{x}_i^{(l)}, \mathbf{x}_j^{(k)} \rangle = 0 \quad \text{for } (i,l) \ne (j,k), \qquad i,j \in \{A,B\}`} />
          <p className="text-sm text-slate-600 mt-2">
            PN sequence의 서로 다른 지연 버전이 서로 직교한다고 이상화하면,
            multipath 채널의 각 delay tap이 독립적인 관측 차원으로 분리됩니다.
          </p>
        </div>

        <div className="formula-block !my-4 !p-4">
          <h4 className="font-semibold text-blue-800 mb-2">Multipath 수신 모델과 충분통계량</h4>
          <BlockMath math={String.raw`\mathbf{y} = \sum_{l=0}^{L-1} h_l \mathbf{x}_m^{(l)} + \mathbf{w}, \qquad m \in \{A,B\}`} />
          <BlockMath math={String.raw`r_A(l) = \langle \mathbf{y}, \mathbf{x}_A^{(l)}/\sqrt{E_b} \rangle,\qquad r_B(l) = \langle \mathbf{y}, \mathbf{x}_B^{(l)}/\sqrt{E_b} \rangle`} />
          <p className="text-sm text-slate-600 mt-2">
            예를 들어 <InlineMath math="A" />가 전송되면
            <InlineMath math={String.raw`r_A(l)=\sqrt{E_b}h_l+z_A(l)`} />,
            <InlineMath math={String.raw`r_B(l)=z_B(l)`} />가 되고,
            <InlineMath math={String.raw`z_A(l), z_B(l) \sim \mathcal{CN}(0,N_0)`} />입니다.
          </p>
        </div>

        <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200 mb-4">
          <h5 className="font-semibold text-indigo-800 mb-2">Square-law Detector</h5>
          <BlockMath math={String.raw`\sum_{l=0}^{L-1}|r_A(l)|^2 \mathop{\gtrless}_{B}^{A} \sum_{l=0}^{L-1}|r_B(l)|^2`} />
          <p className="text-sm text-slate-600">
            채널 위상을 맞추지 않고 각 후보 waveform에 투영된 에너지만 더합니다.
            그래서 coherent MRC보다 정보 손실이 있지만, 명시적인 채널 추정 없이 diversity를 일부 활용할 수 있습니다.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="font-bold text-blue-700 mb-1">Coherent Detection</div>
            <p className="text-sm text-slate-600">
              <InlineMath math="h_l" />을 알고 위상 정렬 후 결합합니다.
              <InlineMath math="L" />이 커질수록 성능은 단조 개선되고 AWGN 기준선에 접근합니다.
            </p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg border border-red-100">
            <div className="font-bold text-red-700 mb-1">Noncoherent Detection</div>
            <p className="text-sm text-slate-600">
              작은 <InlineMath math="L" />에서는 diversity 이득이 있지만,
              큰 <InlineMath math="L" />에서는 경로당 에너지
              <InlineMath math={String.raw`E_b/L`} />가 작아져 성능이 오히려 나빠질 수 있습니다.
            </p>
          </div>
        </div>

        <div className="insight mt-4">
          <div className="insight-title">핵심 메시지</div>
          <p className="text-sm text-amber-900">
            Wideband 시스템에서 대역폭을 키우면 더 많은 resolvable path를 얻지만,
            같은 총 에너지가 더 많은 tap으로 나뉩니다. 따라서
            <strong> 다이버시티 경로 수 증가</strong>와
            <strong> 경로별 채널 학습 가능성</strong>을 같이 봐야 합니다.
          </p>
        </div>
      </div>

      <div className="concept-card mb-6" id="pilot-estimation">
        <h4 className="font-semibold text-slate-800 mb-2">3.5.2 Channel Estimation</h4>
        <p className="text-sm text-slate-600 mb-3">
          채널을 coherent하게 쓰려면 pilot 또는 decision feedback으로
          <InlineMath math={String.raw`h_0,\dots,h_{L-1}`} />을 추정해야 합니다.
          PDF는 알려진 PN pilot을 <InlineMath math="K" /> 심볼 시간 동안 보내고 평균을 취하는 pilot-based scheme을 정리합니다.
        </p>

        <div className="formula-block !my-4 !p-4">
          <h4 className="font-semibold text-blue-800 mb-2">Pilot 관측 모델</h4>
          <BlockMath math={String.raw`\mathbf{y}_k = \sum_{l=0}^{L-1} h_l \mathbf{x}_p^{(l)} + \mathbf{w}_k, \qquad k=1,\dots,K`} />
          <BlockMath math={String.raw`r_{k,l} = \langle \mathbf{y}_k, \mathbf{x}_p^{(l)}/\sqrt{E} \rangle = \sqrt{E}h_l + z_{k,l}`} />
          <p className="text-sm text-slate-600 mt-2">
            <InlineMath math={String.raw`h_l \sim \mathcal{CN}(0,1/L)`} />로 정규화하면 전체 평균 채널 에너지는 1이고,
            평균 관측치 <InlineMath math={String.raw`\bar r_l = K^{-1}\sum_{k=1}^{K}r_{k,l}`} />의 잡음 분산은
            <InlineMath math={String.raw`N_0/K`} />로 줄어듭니다.
          </p>
        </div>

        <div className="formula-block !my-4 !p-4">
          <h4 className="font-semibold text-blue-800 mb-2">MMSE 추정기와 추정 SNR</h4>
          <BlockMath math={String.raw`\hat h_l = \frac{\sqrt{E}/L}{E/L + N_0/K}\,\bar r_l = \frac{K\sqrt{E}}{K E + L N_0}\,\bar r_l`} />
          <BlockMath math={String.raw`\mathrm{MSE}_l = \mathbb{E}[|h_l-\hat h_l|^2] = \frac{1}{L}\cdot\frac{1}{1+\mathrm{SNR}_{\mathrm{est}}}, \qquad \mathrm{SNR}_{\mathrm{est}} = \frac{K E}{L N_0}`} />
          <p className="text-sm text-slate-600 mt-2">
            <InlineMath math={String.raw`\mathrm{SNR}_{\mathrm{est}} \gg 1`} />이면 추정 오차가
            <InlineMath math={String.raw`1/L`} />보다 훨씬 작아 coherent 분석이 거의 유지됩니다.
            반대로 <InlineMath math={String.raw`\mathrm{SNR}_{\mathrm{est}} \ll 1`} />이면 MSE가
            <InlineMath math={String.raw`\mathrm{Var}(h_l)=1/L`} />에 가까워져 채널에 대해 거의 배운 것이 없습니다.
          </p>
        </div>

        <div className="formula-block !my-4 !p-4">
          <h4 className="font-semibold text-blue-800 mb-2">Effective SNR 관점</h4>
          <BlockMath math={String.raw`\gamma_{\mathrm{eff}} \approx \frac{\gamma_d}{1+\gamma_d\sigma_e^2}`} />
          <p className="text-sm text-slate-600 mt-2">
            데이터 구간의 nominal SNR <InlineMath math={String.raw`\gamma_d`} />가 커져도
            추정 오차 분산 <InlineMath math={String.raw`\sigma_e^2`} />가 남아 있으면 성능은
            <InlineMath math={String.raw`1/\sigma_e^2`} /> 근방에서 포화됩니다.
            즉, pilot 예산이 부족하면 전력을 더 올려도 검출 성능이 따라오지 않습니다.
          </p>
        </div>
      </div>

      <div className="concept-card mb-6" id="diversity-scenarios">
        <h4 className="font-semibold text-slate-800 mb-2">3.5.3 Other Diversity Scenarios</h4>
        <p className="text-sm text-slate-600 mb-3">
          같은 diversity order라도 채널을 학습하는 난이도는 시스템 구조에 따라 달라집니다.
          PDF의 비교 포인트는 "다이버시티 경로가 늘 때 경로당 에너지가 어떻게 변하는가"입니다.
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-red-50 rounded-lg border border-red-100">
            <div className="font-bold text-red-700 mb-1">DS Spread Spectrum</div>
            <p className="text-sm text-slate-600">
              경로 수 <InlineMath math="L" />은 bandwidth와 delay spread로 결정되어 설계자가 직접 통제하기 어렵습니다.
              <InlineMath math="L" />이 커지면 경로당 에너지는 대략 <InlineMath math="1/L" />로 줄어듭니다.
            </p>
          </div>
          <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
            <div className="font-bold text-emerald-700 mb-1">Receive Antenna Diversity</div>
            <p className="text-sm text-slate-600">
              수신 안테나를 늘려도 각 안테나가 받는 평균 에너지는 유지됩니다.
              그래서 SIMO MRC는 채널 추정 관점에서도 가장 깨끗한 diversity 확보 방식입니다.
            </p>
          </div>
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
            <div className="font-bold text-amber-700 mb-1">Transmit Antenna Diversity</div>
            <p className="text-sm text-slate-600">
              송신 안테나 수를 늘리면 총 전력이 여러 송신 경로로 나뉘므로
              수신기가 안정적으로 학습할 수 있는 안테나 수에 실질적인 제한이 생깁니다.
            </p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="font-bold text-blue-700 mb-1">OFDM / Frequency Hopping</div>
            <p className="text-sm text-slate-600">
              에너지를 퍼뜨릴 subcarrier 수를 설계자가 조절할 수 있습니다.
              coding across subcarriers and symbols를 함께 쓰면 최대 frequency diversity를 얻을 수 있습니다.
            </p>
          </div>
        </div>
      </div>

      <div className="compare-grid mb-6" id="coherent-vs-noncoherent">
        <div className="compare-item border-blue-200 bg-blue-50/50">
          <h3 className="font-bold text-lg text-blue-800 mb-2">Coherent 전략</h3>
          <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
            <li>채널 추정이 충분히 정확할 때 가장 높은 검출 성능을 냅니다.</li>
            <li>pilot overhead와 tracking cost가 반드시 필요합니다.</li>
            <li>안정적인 채널, 충분한 coherence time, 높은 pilot SNR에 적합합니다.</li>
          </ul>
        </div>
        <div className="compare-item border-emerald-200 bg-emerald-50/50">
          <h3 className="font-bold text-lg text-emerald-800 mb-2">Noncoherent 전략</h3>
          <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
            <li>명시적인 채널 추정 없이 에너지 기반으로 검출합니다.</li>
            <li>채널 위상 정보를 버리므로 coherent ML보다 성능 손실이 있습니다.</li>
            <li>빠르게 변하는 채널이나 pilot 예산이 부족한 경우의 기준선입니다.</li>
          </ul>
        </div>
      </div>

      <GaussianDetectionEstimationLab />

      <div className="insight mt-8 mb-6">
        <div className="insight-title">설계 체크포인트</div>
        <ol className="text-sm text-amber-900 list-decimal list-inside space-y-1">
          <li>얻고 싶은 diversity order만 보지 말고, 각 branch의 estimation SNR을 계산합니다.</li>
          <li>pilot overhead로 줄어드는 data rate와 coherent gain을 같이 비교합니다.</li>
          <li>경로 수를 통제할 수 없는 DS spread spectrum과 통제 가능한 OFDM을 구분합니다.</li>
          <li>채널 추정이 약하면 noncoherent 또는 differential 방식의 기준 성능을 확인합니다.</li>
        </ol>
      </div>

      <div className="insight">
        <div className="insight-title">Chapter 3 통합 관점</div>
        <p className="text-sm text-amber-900">
          3.2~3.4가 "어떻게 독립 fade를 많이 만들 것인가"를 다뤘다면,
          3.5는 "그 fade들을 실제로 배워서 쓸 수 있는가"를 묻습니다.{' '}
          <button onClick={() => onNavigate('ch3-main-plot')} className="cross-ref !text-xs">
            3.6 Main Plot
          </button>
          에서 detection, diversity, CSI uncertainty를 하나의 설계 체인으로 다시 묶습니다.
        </p>
      </div>
    </section>
  );
}
