'use client';

import { BlockMath, InlineMath } from 'react-katex';
import { useState } from 'react';

interface Section2Props {
  onNavigate: (id: string) => void;
}

export default function Section2Resources({ onNavigate }: Section2Props) {
  const [regimeMode, setRegimeMode] = useState<'power-limited' | 'bandwidth-limited'>('power-limited');

  return (
    <section id="resources" className="section-card transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <span className="badge badge-amber">Intermediate</span>
        <span className="text-sm text-slate-400">Section 2</span>
      </div>

      <h2 className="text-3xl font-bold text-slate-900 mb-4">
        5.2 Resources of the AWGN Channel
      </h2>
      <p className="text-lg text-slate-600 leading-relaxed mb-6">
        AWGN 채널의 용량은 두 가지 자원인 전력과 대역폭의 함수입니다.
        이 절에서는 연속시간 AWGN 채널에서 이산시간 모델로의 변환과,
        전력-대역폭 트레이드오프를 다룹니다.
      </p>

      {/* 5.2.1 연속시간 AWGN 채널 */}
      <div className="concept-card mb-6" id="continuous-time">
        <h4 className="font-semibold text-slate-800 mb-2">5.2.1 연속시간 AWGN 채널</h4>
        <p className="text-sm text-slate-600 mb-3">
          연속시간 채널을 Nyquist 정리를 통해 이산시간으로 변환합니다.
          대역폭 <InlineMath math="W" />인 채널에서 Nyquist rate에 따라
          초당 <InlineMath math="2W" />개의 독립 샘플을 얻습니다.
        </p>
        <div className="formula-block !my-4 !p-4">
          <h4 className="font-semibold text-blue-800 mb-2">Nyquist 샘플링</h4>
          <BlockMath math={String.raw`\text{Nyquist rate} = 2W \;\text{samples/s}`} />
          <p className="text-sm text-slate-600 mt-2">
            각 이산 샘플에서 독립적인 AWGN 채널이 생성됩니다.
          </p>
        </div>
        <BlockMath math={String.raw`y[n] = x[n] + w[n], \quad w[n] \sim \mathcal{N}(0,\, N_0/2)`} />
        <p className="text-xs text-slate-500 mt-2">
          이로써 연속시간 문제가 친숙한 이산시간 AWGN 채널의 병렬 집합으로 환원됩니다.
        </p>
      </div>

      <div className="formula-block mb-6">
        <h4 className="font-semibold text-blue-800 mb-3">Continuous-time capacity normalization</h4>
        <p className="text-sm text-slate-600 mb-3">
          원고에서는 passband 채널을 complex baseband로 바꾸어 한 complex symbol이 두 개의
          real dimension을 담는다고 정리합니다. 대역폭 <InlineMath math="W" /> Hz와 평균 전력{' '}
          <InlineMath math={String.raw`\bar P`} />가 주어지면 다음 식이 초당 bit rate가 됩니다.
        </p>
        <BlockMath math={String.raw`y[m]=x[m]+w[m], \qquad w[m]\sim \mathcal{CN}(0,N_0)`} />
        <BlockMath math={String.raw`C_{\text{real}}=\frac{1}{2}\log_2\!\left(1+\frac{\bar P}{N_0W}\right),
\quad
C_{\text{complex}}=\log_2\!\left(1+\frac{\bar P}{N_0W}\right)`} />
        <BlockMath math={String.raw`C_{\text{awgn}}(\bar P,W)=W\log_2\!\left(1+\frac{\bar P}{N_0W}\right)\;\text{bits/s}`} />
        <div className="text-sm text-slate-600 mt-2">
          따라서 <InlineMath math={String.raw`\text{SNR}:=\bar P/(N_0W)`} />이고,
          spectral efficiency는 <InlineMath math={String.raw`C/W=\log_2(1+\text{SNR})`} />입니다.
        </div>
      </div>

      {/* 5.2.2 전력과 대역폭 트레이드오프 */}
      <div className="concept-card mb-6" id="power-bandwidth">
        <h4 className="font-semibold text-slate-800 mb-2">5.2.2 전력과 대역폭 트레이드오프</h4>
        <p className="text-sm text-slate-600 mb-3">
          채널 용량은 전력 <InlineMath math="P" />와 대역폭 <InlineMath math="W" />의
          함수로, 두 자원의 상대적 크기에 따라 서로 다른 극한 regime이 나타납니다.
          SNR이 낮으면 전력이 병목이고, SNR이 높으면 대역폭이 병목입니다.
        </p>
      </div>

      <div className="concept-card mb-6">
        <h4 className="font-semibold text-slate-800 mb-3">Energy per bit 관점</h4>
        <p className="text-sm text-slate-600 mb-3">
          전력을 키우면 capacity는 증가하지만 로그 함수라 한계효용이 줄어듭니다.
          대역폭을 키우면 자유도는 늘지만 각 자유도당 SNR은 낮아집니다.
          그래서 5.2.2의 핵심 평가지표는 단순한 peak rate가 아니라 필요한
          <InlineMath math={String.raw`E_b/N_0`} />입니다.
        </p>
        <div className="formula-block !my-0 !p-4">
          <BlockMath math={String.raw`\frac{E_b}{N_0}
=\frac{\text{SNR}}{C/W}
=\frac{\text{SNR}}{\log_2(1+\text{SNR})}
\;\longrightarrow\; \ln 2 \;(-1.59\text{ dB})`} />
        </div>
        <p className="text-sm text-slate-600 mt-3">
          이 최소값은 <InlineMath math={String.raw`\text{SNR}\to 0`} />에서 접근하지만,
          그때 rate도 0에 가까워집니다. 즉 에너지 효율을 얻으려면 긴 지연과 넓은 자유도 사용을 감수해야 합니다.
        </p>
      </div>

      {/* Power-limited regime formula */}
      <div className="formula-block mb-6">
        <h4 className="font-semibold text-blue-800 mb-2">Power-limited regime (low SNR)</h4>
        <BlockMath math={String.raw`C \approx \frac{P}{N_0 \ln 2} \;\text{bits/s}`} />
        <p className="text-sm text-slate-600 mt-2">
          대역폭이 무한히 크면 용량은 전력에만 선형적으로 비례합니다.{' '}
          <InlineMath math="E_b/N_0" />의 최소값은{' '}
          <InlineMath math={String.raw`-1.59\;\text{dB}\;(\ln 2)`} />입니다.
        </p>
      </div>

      {/* Bandwidth-limited regime formula */}
      <div className="formula-block mb-6">
        <h4 className="font-semibold text-blue-800 mb-2">Bandwidth-limited regime (high SNR)</h4>
        <BlockMath math={String.raw`C \approx W \log_2(\text{SNR}) \;\text{bits/s}`} />
        <p className="text-sm text-slate-600 mt-2">
          전력이 충분하면 용량은 대역폭에 선형적으로 비례합니다.
          추가 대역폭이 직접적으로 용량 증가로 이어집니다.
        </p>
      </div>

      {/* Inline Interactive: Power/Bandwidth Regime Toggle */}
      <div className="concept-card mb-6" id="regime-toggle">
        <h4 className="font-semibold text-slate-800 mb-3">전력/대역폭 Regime 비교</h4>
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setRegimeMode('power-limited')}
            aria-pressed={regimeMode === 'power-limited'}
            className={`px-3 py-1.5 rounded-lg text-sm border ${
              regimeMode === 'power-limited'
                ? 'bg-purple-600 text-white border-purple-600'
                : 'bg-white text-slate-600 border-slate-300'
            }`}
          >
            Power-limited
          </button>
          <button
            onClick={() => setRegimeMode('bandwidth-limited')}
            aria-pressed={regimeMode === 'bandwidth-limited'}
            className={`px-3 py-1.5 rounded-lg text-sm border ${
              regimeMode === 'bandwidth-limited'
                ? 'bg-violet-600 text-white border-violet-600'
                : 'bg-white text-slate-600 border-slate-300'
            }`}
          >
            Bandwidth-limited
          </button>
        </div>

        {regimeMode === 'power-limited' ? (
          <div className="p-3 rounded-lg bg-purple-50 text-sm text-purple-900">
            <div className="font-semibold mb-1">Power-limited Regime</div>
            <div className="space-y-2 mb-3">
              <div>
                <span className="font-medium">조건:</span>{' '}
                <InlineMath math={String.raw`\text{SNR} \ll 1`} /> (저 SNR 영역)
              </div>
              <div>
                <span className="font-medium">핵심:</span> 대역폭 증가는 무비용, 전력이 유일한 제약
              </div>
              <div>
                <span className="font-medium">응용:</span> 전력 제한 센서 네트워크, 심우주 통신
              </div>
            </div>
            <div className="p-2 bg-white/70 rounded">
              <BlockMath math={String.raw`C \approx \frac{P}{N_0 \ln 2}`} />
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-violet-50 text-sm text-violet-900">
            <div className="font-semibold mb-1">Bandwidth-limited Regime</div>
            <div className="space-y-2 mb-3">
              <div>
                <span className="font-medium">조건:</span>{' '}
                <InlineMath math={String.raw`\text{SNR} \gg 1`} /> (고 SNR 영역)
              </div>
              <div>
                <span className="font-medium">핵심:</span> 추가 전력의 한계효용 감소, 대역폭이 핵심
              </div>
              <div>
                <span className="font-medium">응용:</span> 도시 셀룰러, Wi-Fi (대역폭 경쟁)
              </div>
            </div>
            <div className="p-2 bg-white/70 rounded">
              <BlockMath math={String.raw`C \approx W \log_2\!\left(\frac{P}{N_0 W}\right)`} />
            </div>
          </div>
        )}
      </div>

      <div className="concept-card mb-6" id="bandwidth-reuse">
        <div className="text-xs font-semibold text-purple-600 mb-1">Example 5.2</div>
        <h4 className="font-semibold text-slate-800 mb-3">Bandwidth reuse in cellular systems</h4>
        <p className="text-sm text-slate-600 mb-3">
          셀룰러 시스템에서는 각 셀이 전체 대역폭 <InlineMath math="W" /> 중
          <InlineMath math={String.raw`\rho W`} />만 쓰게 해서 같은 주파수 셀 간 간섭을 줄일 수 있습니다.
          원고의 tradeoff는 bandwidth를 줄여 간섭을 낮출지, bandwidth를 크게 써서 자유도를 늘릴지입니다.
        </p>
        <div className="formula-block !my-4 !p-4">
          <BlockMath math={String.raw`R_{\text{edge}}(\rho)
= \rho W \log_2\!\left(1+\frac{\text{SNR}}{1+f_\rho\text{SNR}}\right)`} />
          <BlockMath math={String.raw`f_\rho \approx \rho^\alpha\;\text{(linear array)}, \qquad
f_\rho \approx \rho^{\alpha/2}\;\text{(hexagonal array)}`} />
        </div>
        <div className="grid md:grid-cols-3 gap-3 text-sm">
          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <div className="font-semibold text-slate-700 mb-1">Low SNR</div>
            <p className="text-slate-600">
              Noise-limited라서 간섭 억제 효과가 작고, 작은 <InlineMath math={String.raw`\rho`} />의
              대역폭 손실이 더 크게 보입니다.
            </p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-purple-200">
            <div className="font-semibold text-purple-700 mb-1">High SNR</div>
            <p className="text-slate-600">
              Interference-limited가 되며 SINR은 대략 <InlineMath math={String.raw`1/f_\rho`} />에서
              포화됩니다.
            </p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-violet-200">
            <div className="font-semibold text-violet-700 mb-1">Design lesson</div>
            <p className="text-slate-600">
              너무 작은 reuse ratio는 간섭은 줄여도 자유도를 잃습니다. 셀 geometry와 path-loss exponent가
              최적 reuse를 결정합니다.
            </p>
          </div>
        </div>
      </div>

      {/* Compare grid: Cellular bandwidth reuse */}
      <div className="compare-grid mb-6">
        <div className="compare-item border-purple-200 bg-purple-50">
          <h4 className="font-bold text-purple-700 mb-2">좁은 대역 x 많은 셀</h4>
          <p className="text-sm text-slate-600">
            주파수 재사용으로 공간적 자원을 확보합니다.
            각 셀에 작은 대역폭을 할당하되, 충분히 떨어진 셀들이 같은 주파수를 재사용하여
            전체 시스템 용량을 높입니다.
          </p>
        </div>
        <div className="compare-item border-violet-200 bg-violet-50">
          <h4 className="font-bold text-violet-700 mb-2">넓은 대역 x 적은 셀</h4>
          <p className="text-sm text-slate-600">
            대역폭으로 직접 용량을 확보합니다.
            넓은 대역폭을 각 셀에 할당하여, 셀 수를 줄이더라도
            각 사용자가 높은 전송률을 달성할 수 있습니다.
          </p>
        </div>
      </div>

      {/* Experiment suggestion */}
      <div className="insight mt-8 mb-6">
        <div className="insight-title">권장 실험</div>
        <p className="text-sm text-amber-900">
          동일한 전력에서 대역폭을 2배로 늘리면 용량이 어떻게 변하는지{' '}
          <button onClick={() => onNavigate('awgn-capacity')} className="cross-ref !text-xs">
            5.1절의 Calculator
          </button>
          로 확인합니다. 고 SNR에서는 거의 2배, 저 SNR에서는 거의 변화 없음을 관찰할 수 있습니다.
        </p>
      </div>

      {/* Insight: transition to next section */}
      <div className="insight">
        <div className="insight-title">자원에서 채널 구조로</div>
        <p className="text-sm text-amber-900">
          전력과 대역폭이라는 두 자원을 이해했습니다. 다음 절에서는 채널이 주파수에 따라
          다른 이득을 가질 때, 이 자원을 어떻게 최적으로 배분하는지 다룹니다.{' '}
          <button onClick={() => onNavigate('lti-channels')} className="cross-ref !text-xs">
            5.3 LTI 가우시안 채널
          </button>
          에서 이어지며,{' '}
          <button onClick={() => onNavigate('awgn-capacity')} className="cross-ref !text-xs">
            5.1 AWGN 용량
          </button>
          의 기본 공식이 토대가 됩니다.
        </p>
      </div>
    </section>
  );
}
