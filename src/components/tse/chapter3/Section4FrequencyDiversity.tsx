'use client';

import { BlockMath, InlineMath } from 'react-katex';
import { useState } from 'react';
import MultipathVisualizer from '@/components/tse/interactive/MultipathVisualizer';
import ChannelParameterExplorer from '@/components/tse/interactive/ChannelParameterExplorer';

interface Section4Props {
  onNavigate: (id: string) => void;
}

export default function Section4FrequencyDiversity({ onNavigate }: Section4Props) {
  const [eqMode, setEqMode] = useState<'sc-eq' | 'ofdm'>('sc-eq');

  return (
    <section id="frequency-diversity" className="section-card transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <span className="badge badge-red">Advanced</span>
        <span className="text-sm text-slate-400">Section 4</span>
      </div>

      <h2 className="text-3xl font-bold text-slate-900 mb-4">3.4 Frequency Diversity</h2>
      <p className="text-lg text-slate-600 leading-relaxed mb-6">
        신호 대역폭이 코히어런스 대역폭보다 커지면, 채널은 주파수에 따라 다르게 반응합니다.
        Chapter 2에서 이를 주파수 선택적 페이딩이라 했다면,
        Chapter 3에서는 그 <strong>구조 자체를 다이버시티 자원</strong>으로 해석합니다.
        등화, 확산, OFDM 세 가지 접근을 비교합니다.
      </p>

      <div className="formula-block mb-6" id="freq-selective-model">
        <h4 className="font-semibold text-blue-800 mb-3">3.4.1 주파수 선택적 채널 모델</h4>
        <BlockMath math={String.raw`y[m] = \sum_{\ell=0}^{L-1} h_\ell[m]\, x[m-\ell] + w[m]`} />
        <div className="text-sm text-slate-600 mt-2">
          해상 가능한 탭 수 <InlineMath math="L" />이 커질수록 잠재 다이버시티 차수도 커집니다.
          탭 수는{' '}
          <InlineMath math={String.raw`L \approx \lceil T_d \cdot W \rceil + 1`} />로 근사되며,
          이 값은{' '}
          <button onClick={() => onNavigate('parameters')} className="cross-ref !text-xs">
            Ch.2 코히어런스 파라미터
          </button>
          에서 결정됩니다.
        </div>
      </div>

      <div className="concept-card mb-6" id="equalization">
        <h4 className="font-semibold text-slate-800 mb-2">3.4.2 단일반송파 + 등화</h4>
        <p className="text-sm text-slate-600 mb-3">
          주파수 선택적 채널에서 단일반송파 전송을 하면, 여러 탭에 의한
          심볼 간 간섭(ISI)이 발생합니다. 시간 영역에서 보면, 현재 심볼의 수신 신호에
          이전 심볼들의 에코가 겹쳐 있는 상태입니다. 등화기는 이 에코를 제거하면서
          유효 신호 성분을 보존하는 역할을 합니다.
        </p>
        <p className="text-sm text-slate-600 mb-3">
          물리적 직관은 다음과 같습니다. 다중경로 때문에 송신 심볼 하나가 수신기에
          여러 시점에 걸쳐 도착합니다. 탭이 <InlineMath math="L" />개이면
          현재 수신 샘플에 <InlineMath math="L" />개 심볼의 정보가 섞여 있으며,
          등화기는 이 혼합을 분리해야 합니다.
          복잡도와 성능 사이의 트레이드오프가 핵심입니다.
        </p>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 text-sm">
            <div className="font-bold text-blue-700 mb-1">선형 등화 (MMSE-LE)</div>
            <div className="text-slate-600">
              복잡도 <InlineMath math="O(L)" />. 잡음 증폭이 발생할 수 있어 성능 한계가 존재합니다.
            </div>
          </div>
          <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100 text-sm">
            <div className="font-bold text-indigo-700 mb-1">MLSE / Viterbi</div>
            <div className="text-slate-600">
              최적 성능이지만, 복잡도 <InlineMath math={String.raw`O(|\mathcal{X}|^L)`} />로 탭 수에 지수적 증가.
            </div>
          </div>
        </div>
      </div>

      <div className="concept-card mb-6" id="dsss">
        <h4 className="font-semibold text-slate-800 mb-2">3.4.3 확산 시스템 (DS-SS)</h4>
        <p className="text-sm text-slate-600 mb-2">
          직접확산(DS-SS)은 심볼율 대비 훨씬 넓은 대역폭을 사용합니다.
          칩율이 높아지면 더 많은 해상 가능한 경로를 분리할 수 있어 다이버시티가 증가합니다.
          다만 단일 사용자 스펙트럼 효율과 다중 접속 구조 사이에서 트레이드오프가 발생합니다.
        </p>
      </div>

      <div className="concept-card mb-6" id="rake-receiver">
        <div className="text-xs font-semibold text-violet-600 mb-1">DS-SS / CDMA 수신 구조</div>
        <h4 className="font-semibold text-slate-800 mb-2">3.4.3+ Rake 수신기</h4>
        <p className="text-sm text-slate-600 mb-3">
          DS-SS 시스템에서는 해상 가능한 경로(<InlineMath math="L" />개)를 <strong>각각 별도로 역확산</strong>한 후
          MRC로 결합합니다. 이 구조를 Rake 수신기라 하며, 빗(rake)의 각 이빨이 각 경로의 지연에 정렬됩니다.
        </p>
        <div className="formula-block !my-4 !p-4">
          <h4 className="font-semibold text-blue-800 mb-2">Rake 결합 SNR (MRC 동치)</h4>
          <BlockMath math={String.raw`\text{SNR}_{\text{rake}} = \left(\sum_{\ell=0}^{L-1} |h_\ell|^2\right)\text{SNR}_{\text{chip}}`} />
          <p className="text-sm text-slate-600 mt-2">
            MRC와 동일한 구조입니다. 다중경로를 방해 요소로 보는 대신,
            <InlineMath math="L" />개 독립 페이드의 합을 활용하여 diversity order <InlineMath math="L" />을 달성합니다.
            고 SNR에서 <InlineMath math={String.raw`P_e \approx \bigl(\tfrac{1}{4\,\text{SNR}}\bigr)^L`} />입니다.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-3 mt-2 text-sm">
          <div className="p-3 bg-violet-50 rounded-lg border border-violet-100">
            <div className="font-bold text-violet-700 mb-1">이득</div>
            <div className="text-slate-600">
              다중경로를 다이버시티 자원으로 전환.
              탭 수 <InlineMath math={String.raw`L \approx \lceil T_d W \rceil`} />이 클수록 diversity 증가.
            </div>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
            <div className="font-bold text-amber-700 mb-1">전제 조건</div>
            <div className="text-slate-600">
              칩율(chip rate)이 <InlineMath math="1/T_d" /> 이상이어야 경로를 해상하고 분리할 수 있습니다.
            </div>
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          3G CDMA(IS-2000, WCDMA)의 핵심 수신 구조입니다.{' '}
          <button onClick={() => onNavigate('parameters')} className="cross-ref !text-xs">Ch.2 지연 확산 Td</button>
          가 클수록 더 많은 Rake 경로를 분리하여 다이버시티가 증가합니다.
        </p>
      </div>

      <div className="concept-card mb-6" id="ofdm-diversity">
        <h4 className="font-semibold text-slate-800 mb-2">3.4.4 OFDM: 주파수 영역 분리</h4>
        <p className="text-sm text-slate-600 mb-3">
          CP(Cyclic Prefix) 조건이 만족되면,
          시간 영역의 컨볼루션 채널이 주파수 영역에서 곱셈으로 분리됩니다.
          각 부반송파가 flat fading을 경험하게 되어, ISI 문제가 해소됩니다.
        </p>
        <div className="formula-block !my-4 !p-4">
          <h4 className="font-semibold text-blue-800 mb-2">OFDM 주파수 영역 모델</h4>
          <BlockMath math={String.raw`Y[k] = H[k]\, X[k] + W[k], \quad k = 0, 1, \dots, N-1`} />
          <p className="text-sm text-slate-600 mt-2">
            각 부반송파 <InlineMath math="k" />에서 독립적인 flat fading 채널로 분리됩니다.
            이후 부반송파 간 코딩과 인터리빙으로 주파수 다이버시티를 수확합니다.
          </p>
        </div>
      </div>

      {/* Inline toggle: SC+EQ vs OFDM */}
      <div className="concept-card mb-6">
        <h3 className="font-bold text-lg text-slate-800 mb-3">빠른 판정: 단일반송파+등화 vs OFDM</h3>
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setEqMode('sc-eq')}
            aria-pressed={eqMode === 'sc-eq'}
            className={`px-3 py-1.5 rounded-lg text-sm border ${eqMode === 'sc-eq' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-300'}`}
          >
            SC + 등화
          </button>
          <button
            onClick={() => setEqMode('ofdm')}
            aria-pressed={eqMode === 'ofdm'}
            className={`px-3 py-1.5 rounded-lg text-sm border ${eqMode === 'ofdm' ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-600 border-slate-300'}`}
          >
            OFDM
          </button>
        </div>
        {eqMode === 'sc-eq' ? (
          <div className="p-3 rounded-lg bg-emerald-50 text-sm text-emerald-900">
            <div className="font-semibold mb-1">단일반송파 + 등화 (SC-FDE / MLSE)</div>
            <div className="mb-2">
              시간 영역에서 ISI를 직접 처리합니다. 탭 수 <InlineMath math="L" />이 적을 때는
              MLSE가 최적이고, <InlineMath math="L" />이 커지면 MMSE-LE나 SC-FDE(주파수 영역 등화)로 전환합니다.
              PAPR이 낮아 전력 효율이 좋고, 업링크에 적합합니다.
            </div>
            <div className="grid md:grid-cols-2 gap-2">
              <div className="p-2 bg-white/70 rounded text-xs text-slate-600">장점: 낮은 PAPR, 단순 송신기</div>
              <div className="p-2 bg-white/70 rounded text-xs text-slate-600">단점: 등화 복잡도가 탭 수에 민감</div>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-teal-50 text-sm text-teal-900">
            <div className="font-semibold mb-1">OFDM (Orthogonal Frequency-Division Multiplexing)</div>
            <div className="mb-2">
              주파수 영역에서 각 부반송파를 flat channel로 분리합니다.
              CP 조건만 만족하면 ISI가 완전히 제거되어, 탭 수와 무관하게 부반송파별 단일 탭 등화로 충분합니다.
              주파수 다이버시티는 부반송파 간 코딩으로 확보합니다.
            </div>
            <div className="grid md:grid-cols-2 gap-2">
              <div className="p-2 bg-white/70 rounded text-xs text-slate-600">장점: 등화 복잡도 <InlineMath math="O(1)" />/부반송파</div>
              <div className="p-2 bg-white/70 rounded text-xs text-slate-600">단점: 높은 PAPR, CP 오버헤드</div>
            </div>
          </div>
        )}
      </div>

      <MultipathVisualizer />

      <ChannelParameterExplorer />

      <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 mb-6">
        <p className="text-sm text-amber-900 font-semibold mb-2">권장 실험</p>
        <ol className="text-sm text-amber-900 list-decimal list-inside space-y-1">
          <li>Multipath Visualizer에서 delay spread를 바꾸며 해상 가능 탭 수 변화를 확인합니다.</li>
          <li>Channel Parameter Explorer에서 대역폭을 올려 <InlineMath math="W > W_c" /> 조건이 되는 시점을 찾습니다.</li>
          <li>그 시점에서 단일반송파 등화와 OFDM 중 어떤 접근이 적합한지 위 토글로 비교합니다.</li>
        </ol>
      </div>

      <div className="concept-card mb-6" id="diversity-combination">
        <h4 className="font-semibold text-slate-800 mb-2">3.4.5 다이버시티 조합 설계</h4>
        <p className="text-sm text-slate-600 mb-2">
          시간, 공간, 주파수 다이버시티는 대체 관계가 아니라 <strong>조합 자원</strong>입니다.
          실제 시스템은 지연, 하드웨어, 대역폭 제약을 동시에 보면서 세 축을 배분합니다.
        </p>
        <div className="grid md:grid-cols-3 gap-3 mt-3 text-sm">
          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
            <div className="font-bold text-emerald-700">시간</div>
            <div className="text-slate-600">비용: 지연 증가</div>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div className="font-bold text-blue-700">공간</div>
            <div className="text-slate-600">비용: 안테나·RF 체인</div>
          </div>
          <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
            <div className="font-bold text-indigo-700">주파수</div>
            <div className="text-slate-600">비용: 대역폭 + 등화 복잡도</div>
          </div>
        </div>
      </div>

      <div className="insight">
        <div className="insight-title">채널 지식의 문제로</div>
        <p className="text-sm text-amber-900">
          세 가지 다이버시티 축을 모두 살펴봤습니다. 그런데 앞선 분석은 모두 채널 이득{' '}
          <InlineMath math="h" />를 정확히 안다는 가정 위에 있습니다.
          현실에서는 채널 추정이 불완전하고, 그 오차가 성능을 깎습니다.{' '}
          <button onClick={() => onNavigate('channel-uncertainty')} className="cross-ref !text-xs">
            3.5 채널 불확실성
          </button>
          에서 이를 정량화합니다.
        </p>
      </div>
    </section>
  );
}
