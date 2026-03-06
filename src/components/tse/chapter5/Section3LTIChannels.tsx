'use client';

import { BlockMath, InlineMath } from 'react-katex';
import { useState } from 'react';

interface Section3Props {
  onNavigate: (id: string) => void;
}

export default function Section3LTIChannels({ onNavigate }: Section3Props) {
  const [antennaMode, setAntennaMode] = useState<'simo' | 'miso' | 'mimo'>('simo');
  const [powerMode, setPowerMode] = useState<'waterfilling' | 'equal'>('waterfilling');

  return (
    <section id="lti-channels" className="section-card transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <span className="badge badge-red">Advanced</span>
        <span className="text-sm text-slate-400">Section 3</span>
      </div>

      <h2 className="text-3xl font-bold text-slate-900 mb-4">
        5.3 Linear Time-Invariant Gaussian Channels
      </h2>
      <p className="text-lg text-slate-600 leading-relaxed mb-6">
        실제 무선 채널은 다중 안테나나 주파수 선택성으로 인해 단순 AWGN보다 복잡한 구조를 가집니다.
        이 절에서는 SIMO, MISO, 주파수 선택적 채널의 용량을 분석하고,
        워터필링 최적 전력 배분을 다룹니다.
      </p>

      {/* 5.3.1 SIMO Channel */}
      <div className="concept-card mb-6" id="simo-capacity">
        <div className="text-xs font-semibold text-purple-600 mb-1">SIMO: Single Input Multiple Output</div>
        <h4 className="font-semibold text-slate-800 mb-2">5.3.1 SIMO 채널 (Single Input Multiple Output)</h4>
        <p className="text-sm text-slate-600 mb-3">
          수신 안테나 <InlineMath math="L" />개, 송신 안테나 1개 구성에서
          MRC(Maximal Ratio Combining) 수신으로 각 안테나의 SNR을 합산합니다.
          수신 안테나 수에 비례하여 SNR이 증가하며, 이는 array gain에 해당합니다.
        </p>
        <div className="formula-block !my-4 !p-4">
          <h4 className="font-semibold text-purple-800 mb-2">SIMO 채널 용량</h4>
          <BlockMath math={String.raw`C_{\text{SIMO}} = W \log_2\!\left(1 + \|h\|^2 \cdot \text{SNR}\right)`} />
          <div className="mt-2 text-sm text-slate-600">
            여기서 <InlineMath math={String.raw`\|h\|^2 = \sum_{l=1}^{L} |h_l|^2`} /> 입니다.
          </div>
        </div>
        <p className="text-xs text-slate-500">
          수신 안테나를 추가하면 하드웨어 비용이 증가하지만,
          송신 전력을 올리지 않고도 SNR을 개선할 수 있습니다.
        </p>
      </div>

      {/* 5.3.2 MISO Channel */}
      <div className="concept-card mb-6" id="miso-capacity">
        <div className="text-xs font-semibold text-purple-600 mb-1">MISO: Multiple Input Single Output</div>
        <h4 className="font-semibold text-slate-800 mb-2">5.3.2 MISO 채널 (Multiple Input Single Output)</h4>
        <p className="text-sm text-slate-600 mb-3">
          송신 안테나 <InlineMath math="M" />개, 수신 안테나 1개 구성입니다.
          CSI(Channel State Information) 유무에 따라 전략이 달라집니다.
          송신기가 채널을 알면 빔포밍으로 array gain을 얻고,
          모르면 Alamouti 등으로 diversity gain만 확보합니다.
        </p>
        <div className="grid md:grid-cols-2 gap-3 mt-3">
          <div className="p-3 bg-purple-50 rounded-lg border border-purple-100 text-sm">
            <div className="font-bold text-purple-700 mb-1">With CSI: Beamforming</div>
            <div className="text-slate-600 mb-2">
              채널 방향으로 빔을 집중하여 array gain 확보
            </div>
            <BlockMath math={String.raw`C = W \log_2(1 + M \cdot \text{SNR})`} />
          </div>
          <div className="p-3 bg-violet-50 rounded-lg border border-violet-100 text-sm">
            <div className="font-bold text-violet-700 mb-1">Without CSI</div>
            <div className="text-slate-600 mb-2">
              Array gain 없이 diversity gain만 확보
            </div>
            <BlockMath math={String.raw`C = W \log_2(1 + \text{SNR})`} />
          </div>
        </div>
      </div>

      {/* Inline Interactive: SIMO/MISO/MIMO Toggle */}
      <div className="my-6 p-5 bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200 rounded-xl" id="antenna-toggle">
        <h4 className="font-semibold text-purple-800 mb-3">다중 안테나 구성 비교</h4>
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setAntennaMode('simo')}
            aria-pressed={antennaMode === 'simo'}
            className={`px-3 py-1.5 rounded-lg text-sm border transition ${
              antennaMode === 'simo'
                ? 'bg-purple-600 text-white border-purple-600'
                : 'bg-white text-slate-600 border-slate-300'
            }`}
          >
            SIMO
          </button>
          <button
            onClick={() => setAntennaMode('miso')}
            aria-pressed={antennaMode === 'miso'}
            className={`px-3 py-1.5 rounded-lg text-sm border transition ${
              antennaMode === 'miso'
                ? 'bg-purple-600 text-white border-purple-600'
                : 'bg-white text-slate-600 border-slate-300'
            }`}
          >
            MISO
          </button>
          <button
            onClick={() => setAntennaMode('mimo')}
            aria-pressed={antennaMode === 'mimo'}
            className={`px-3 py-1.5 rounded-lg text-sm border transition ${
              antennaMode === 'mimo'
                ? 'bg-purple-600 text-white border-purple-600'
                : 'bg-white text-slate-600 border-slate-300'
            }`}
          >
            MIMO
          </button>
        </div>

        {antennaMode === 'simo' && (
          <div className="concept-card !bg-white/80">
            <div className="font-semibold text-purple-800 mb-1">SIMO: 수신 다중 안테나</div>
            <p className="text-sm text-slate-600 mb-3">
              수신 안테나 <InlineMath math="L" />개가 독립적으로 신호를 수신하고,
              MRC 결합으로 전체 SNR을 합산합니다.
              Array gain과 diversity gain을 동시에 얻습니다.
            </p>
            <div className="formula-block !my-3 !p-3">
              <BlockMath math={String.raw`C = W \log_2\!\left(1 + L \cdot \text{SNR}\right)`} />
            </div>
            <div className="p-2 bg-purple-50 rounded text-xs text-purple-800">
              핵심 이점: Array gain + Diversity gain
            </div>
          </div>
        )}

        {antennaMode === 'miso' && (
          <div className="concept-card !bg-white/80">
            <div className="font-semibold text-purple-800 mb-1">MISO: 송신 다중 안테나</div>
            <p className="text-sm text-slate-600 mb-3">
              송신 안테나 <InlineMath math="M" />개를 사용하며,
              CSI가 있을 때 빔포밍으로 에너지를 수신기 방향에 집중합니다.
              CSI가 없으면 공간-시간 코드(예: Alamouti)로 diversity만 확보합니다.
            </p>
            <div className="formula-block !my-3 !p-3">
              <BlockMath math={String.raw`C = W \log_2\!\left(1 + M \cdot \text{SNR}\right) \quad \text{(with CSI)}`} />
            </div>
            <div className="p-2 bg-purple-50 rounded text-xs text-purple-800">
              핵심 이점: Beamforming gain (CSI 필요)
            </div>
          </div>
        )}

        {antennaMode === 'mimo' && (
          <div className="concept-card !bg-white/80">
            <div className="font-semibold text-purple-800 mb-1">MIMO: 양방향 다중 안테나</div>
            <p className="text-sm text-slate-600 mb-3">
              송수신 모두 다중 안테나를 사용하면 공간 멀티플렉싱이 가능합니다.
              채널 행렬의 고유값 <InlineMath math={String.raw`\lambda_i`} />에 따라
              독립적인 공간 채널이 형성되며, 각 채널이 별도의 데이터 스트림을 전달합니다.
            </p>
            <div className="formula-block !my-3 !p-3">
              <BlockMath math={String.raw`C = \sum_{i} W \log_2\!\left(1 + \lambda_i \cdot \frac{\text{SNR}}{M}\right)`} />
            </div>
            <div className="p-2 bg-purple-50 rounded text-xs text-purple-800">
              핵심 이점: Spatial multiplexing (용량의 선형 증가)
            </div>
          </div>
        )}
      </div>

      {/* 5.3.3 Frequency-Selective Channel */}
      <div className="concept-card mb-6" id="freq-selective-capacity">
        <h4 className="font-semibold text-slate-800 mb-2">5.3.3 주파수 선택적 채널</h4>
        <p className="text-sm text-slate-600 mb-3">
          주파수 선택적 채널은 병렬 채널(parallel channel)로 분해할 수 있습니다.
          각 서브채널은 독립적인 이득 <InlineMath math={String.raw`h_i`} />를 가지며,
          전체 용량은 개별 서브채널 용량의 합입니다.
        </p>
        <BlockMath math={String.raw`y_i = h_i\, x_i + w_i, \quad i = 1, \dots, N`} />
        <div className="formula-block !my-4 !p-4">
          <h4 className="font-semibold text-purple-800 mb-2">전체 채널 용량</h4>
          <BlockMath math={String.raw`C = \sum_{i=1}^{N} W_i \log_2\!\left(1 + \frac{|h_i|^2\, P_i}{N_0\, W_i}\right)`} />
          <p className="text-sm text-slate-600 mt-2">
            각 서브채널에 배분하는 전력 <InlineMath math={String.raw`P_i`} />를
            어떻게 설정하느냐가 용량을 결정합니다.
            총 전력 제약 <InlineMath math={String.raw`\sum_i P_i = P_{\text{total}}`} /> 하에서
            최적 배분이 워터필링입니다.
          </p>
        </div>
      </div>

      {/* Waterfilling Formula Block */}
      <div className="formula-block mb-6" id="waterfilling">
        <h4 className="font-semibold text-purple-800 mb-3">워터필링 (Waterfilling) 전력 배분</h4>
        <BlockMath math={String.raw`P_i = \left(\mu - \frac{N_0}{|h_i|^2}\right)^+`} />
        <div className="mt-3 text-sm text-slate-600">
          여기서 <InlineMath math={String.raw`(x)^+ = \max(0, x)`} />이며,
          수위 상수 <InlineMath math={String.raw`\mu`} />는
          총 전력 제약 <InlineMath math={String.raw`\sum_i P_i = P_{\text{total}}`} />을
          만족하도록 결정됩니다.
        </div>
        <p className="text-sm text-slate-600 mt-3">
          채널 이득이 좋은 서브채널에 더 많은 전력을 할당하고,
          이득이 너무 나쁜 서브채널은 사용하지 않는 것이 최적입니다.
          이름은 물통에 물을 채우는 것에서 유래합니다.
          바닥이 높은(채널이 나쁜) 곳에는 물이 적게 차고,
          바닥이 낮은(채널이 좋은) 곳에는 물이 많이 찹니다.
        </p>
      </div>

      {/* Inline Interactive: Waterfilling vs Equal Power Toggle */}
      <div className="my-6 p-5 bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200 rounded-xl" id="waterfilling-toggle">
        <h4 className="font-semibold text-purple-800 mb-3">전력 배분 전략 비교</h4>
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setPowerMode('waterfilling')}
            aria-pressed={powerMode === 'waterfilling'}
            className={`px-3 py-1.5 rounded-lg text-sm border transition ${
              powerMode === 'waterfilling'
                ? 'bg-purple-600 text-white border-purple-600'
                : 'bg-white text-slate-600 border-slate-300'
            }`}
          >
            워터필링
          </button>
          <button
            onClick={() => setPowerMode('equal')}
            aria-pressed={powerMode === 'equal'}
            className={`px-3 py-1.5 rounded-lg text-sm border transition ${
              powerMode === 'equal'
                ? 'bg-purple-600 text-white border-purple-600'
                : 'bg-white text-slate-600 border-slate-300'
            }`}
          >
            균등 배분
          </button>
        </div>

        {powerMode === 'waterfilling' ? (
          <div className="compare-grid">
            <div className="p-4 bg-white/80 rounded-lg border border-purple-200">
              <div className="font-semibold text-purple-800 mb-2">워터필링 전력 배분</div>
              <p className="text-sm text-slate-600 mb-3">
                채널 이득에 따라 최적으로 전력을 배분합니다.
                이득이 충분히 좋은 서브채널에만 전력을 할당하고,
                너무 나쁜 서브채널에는 전력을 할당하지 않습니다.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-purple-500 mt-0.5 shrink-0">&#10003;</span>
                  <span className="text-slate-700">채널 용량을 최대화하는 이론적 최적해</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-purple-500 mt-0.5 shrink-0">&#10003;</span>
                  <span className="text-slate-700">약한 서브채널의 전력 낭비를 방지</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5 shrink-0">&#9888;</span>
                  <span className="text-slate-700">CSI가 정확해야 구현 가능</span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-white/80 rounded-lg border border-slate-200">
              <div className="font-semibold text-slate-600 mb-2">균등 배분과의 차이</div>
              <p className="text-sm text-slate-600 mb-3">
                고SNR에서는 워터필링과 균등 배분의 차이가 줄어들지만,
                저SNR에서는 워터필링의 이득이 큽니다.
                특히 채널 이득의 편차가 클수록 워터필링의 이점이 두드러집니다.
              </p>
              <div className="p-2 bg-purple-50 rounded text-xs text-purple-800">
                핵심: 저SNR, 높은 채널 이득 편차일수록 워터필링 이득 증가
              </div>
            </div>
          </div>
        ) : (
          <div className="compare-grid">
            <div className="p-4 bg-white/80 rounded-lg border border-slate-200">
              <div className="font-semibold text-slate-700 mb-2">균등 전력 배분</div>
              <p className="text-sm text-slate-600 mb-3">
                모든 서브채널에 동일한 전력 <InlineMath math={String.raw`P_i = P_{\text{total}} / N`} />을
                할당합니다.
                채널 이득이 나쁜 서브채널에도 같은 전력이 배분되어 전력이 낭비됩니다.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5 shrink-0">&#10003;</span>
                  <span className="text-slate-700">CSI 불필요, 구현이 단순</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5 shrink-0">&#10003;</span>
                  <span className="text-slate-700">고SNR에서 워터필링과 성능 유사</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5 shrink-0">&#10007;</span>
                  <span className="text-slate-700">약한 서브채널에서 전력 낭비 발생</span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-white/80 rounded-lg border border-slate-200">
              <div className="font-semibold text-slate-600 mb-2">워터필링과의 차이</div>
              <p className="text-sm text-slate-600 mb-3">
                균등 배분은 구현이 간단하지만, 채널 구조를 전혀 활용하지 않습니다.
                특히 저SNR 환경에서 채널 이득이 나쁜 서브채널에
                전력을 배분하는 것은 비효율적입니다.
              </p>
              <div className="p-2 bg-amber-50 rounded text-xs text-amber-800">
                주의: 저SNR, 높은 채널 이득 편차에서 성능 열화가 큼
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Experiment Suggestion */}
      <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 mb-6">
        <p className="text-sm text-amber-900 font-semibold mb-2">권장 실험</p>
        <p className="text-sm text-amber-900">
          수신 안테나 수를 1에서 4로 늘릴 때 SIMO 용량 변화를 확인합니다.
          안테나 수의 로그 비례로 용량이 증가하는 것을 관찰할 수 있습니다.
        </p>
      </div>

      {/* Insight */}
      <div className="insight">
        <div className="insight-title">채널 구조 활용에서 페이딩 대응으로</div>
        <p className="text-sm text-amber-900">
          LTI 채널의 구조를 알면 워터필링으로 최적 자원 배분이 가능합니다.
          하지만 무선 채널은 시변(time-varying)이므로,
          다음 절에서는 페이딩이 있는 채널의 용량을 다룹니다.{' '}
          <button onClick={() => onNavigate('fading-capacity')} className="cross-ref !text-xs">
            5.4 페이딩 채널 용량
          </button>
          {' '}과{' '}
          <button onClick={() => onNavigate('antenna-diversity')} className="cross-ref !text-xs">
            Ch.3 3.3 안테나 다이버시티
          </button>
          에서 관련 내용을 다룹니다.
        </p>
      </div>
    </section>
  );
}
