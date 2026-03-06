'use client';

import { BlockMath, InlineMath } from 'react-katex';
import { useState, useMemo } from 'react';
import Slider from 'rc-slider';
import CapacityComparison from '@/components/tse/interactive/CapacityComparison';
import DiversityGainVisualizer from '@/components/tse/interactive/DiversityGainVisualizer';

interface Section4Props {
  onNavigate: (id: string) => void;
}

export default function Section4FadingCapacity({ onNavigate }: Section4Props) {
  const [fadingMode, setFadingMode] = useState<'slow' | 'fast'>('slow');

  return (
    <section id="fading-capacity" className="section-card transition-all duration-300">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <span className="badge badge-purple">Advanced</span>
        <span className="text-sm text-slate-400">Section 4</span>
      </div>

      <h2 className="text-3xl font-bold text-slate-900 mb-4">
        5.4 Capacity of Fading Channels
      </h2>
      <p className="text-lg text-slate-600 leading-relaxed mb-6">
        AWGN과 달리 페이딩 채널에서는 채널 이득이 시간에 따라 변하므로,
        용량 정의가 하나가 아닙니다. 채널 변동의 시간 스케일에 따라
        느린 페이딩(outage)과 빠른 페이딩(ergodic) 용량으로 구분합니다.
      </p>

      {/* 5.4.1 Slow Fading */}
      <div className="concept-card mb-6" id="slow-fading">
        <div className="text-xs font-semibold text-purple-600 mb-1">5.4.1 Slow Fading</div>
        <h3 className="font-bold text-slate-800 mb-2">느린 페이딩 채널 (Slow Fading)</h3>
        <p className="text-sm text-slate-600 mb-3">
          채널이 통신 시간 동안 일정한 랜덤 값을 유지하는 경우, 용량 자체가 랜덤 변수가 됩니다.
          특정 코드워드 전송 동안 채널 이득 <InlineMath math="h" />가 고정되어 있으므로,
          해당 실현(realization)에서의 용량은 다음과 같습니다.
        </p>
        <BlockMath math={String.raw`C = W \log_2\!\left(1 + |h|^2 \,\text{SNR}\right)`} />
        <p className="text-sm text-slate-600 mb-3 mt-3">
          목표 전송률 <InlineMath math="R" />을 지원하지 못할 확률이
          아웃에이지 확률(outage probability)이며, 이것이 시스템 설계의 핵심 지표가 됩니다.
        </p>
        <BlockMath math={String.raw`P_{\text{out}}(R) = P(C < R)`} />
        <p className="text-sm text-slate-600 mb-3 mt-3">
          Rayleigh 페이딩에서 <InlineMath math="|h|^2 \sim \text{Exp}(1)" />일 때,
          아웃에이지 확률은 다음과 같이 폐쇄형으로 표현됩니다.
        </p>
        <BlockMath math={String.raw`P_{\text{out}}(R) = 1 - \exp\!\left(-\frac{2^{R/W} - 1}{\text{SNR}}\right)`} />
      </div>

      {/* 5.4.5 Fast Fading */}
      <div className="concept-card mb-6" id="fast-fading">
        <div className="text-xs font-semibold text-violet-600 mb-1">5.4.5 Fast Fading</div>
        <h3 className="font-bold text-slate-800 mb-2">빠른 페이딩 채널 (Fast Fading)</h3>
        <p className="text-sm text-slate-600 mb-3">
          채널이 코드워드 내에서 많이 변화하면, 코딩을 통해 채널 변동을 평균화할 수 있습니다.
          이 경우 ergodic capacity가 적용되며, 이는 순간 용량의 기댓값으로 정의됩니다.
        </p>
        <BlockMath math={String.raw`C_{\text{erg}} = \mathbb{E}\!\left[W \log_2\!\left(1 + |h|^2 \,\text{SNR}\right)\right]`} />
        <p className="text-sm text-slate-600 mb-3 mt-3">
          Rayleigh 페이딩에서는 적분을 통해 계산하며, AWGN 용량보다 낮지만
          outage가 발생하지 않는다는 장점이 있습니다.
          인터리빙(interleaving)은 독립적인 fading을 보장하여 ergodic 조건을 달성하는 핵심 기법입니다.
        </p>
      </div>

      {/* Inline Interactive: Slow/Fast Fading Toggle */}
      <div className="concept-card mb-6" id="fading-toggle">
        <h3 className="font-bold text-lg text-slate-800 mb-4">
          느린 페이딩 vs 빠른 페이딩 비교
        </h3>
        <p className="text-sm text-slate-600 mb-4">
          두 페이딩 모델의 용량 정의, 핵심 지표, 설계 전략, 적용 환경을 비교합니다.
        </p>

        <div className="flex gap-2 mb-5">
          <button
            onClick={() => setFadingMode('slow')}
            aria-pressed={fadingMode === 'slow'}
            className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
              fadingMode === 'slow'
                ? 'bg-purple-600 text-white border-purple-600'
                : 'bg-white text-slate-600 border-slate-300 hover:border-purple-300'
            }`}
          >
            Slow Fading
          </button>
          <button
            onClick={() => setFadingMode('fast')}
            aria-pressed={fadingMode === 'fast'}
            className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
              fadingMode === 'fast'
                ? 'bg-violet-600 text-white border-violet-600'
                : 'bg-white text-slate-600 border-slate-300 hover:border-violet-300'
            }`}
          >
            Fast Fading
          </button>
        </div>

        {fadingMode === 'slow' ? (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
              <div className="text-xs font-semibold text-purple-600 mb-1">용량 정의</div>
              <div className="text-sm text-slate-800 font-medium">
                Outage capacity <InlineMath math="C_\varepsilon" />
              </div>
            </div>
            <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
              <div className="text-xs font-semibold text-purple-600 mb-1">핵심 지표</div>
              <div className="text-sm text-slate-800 font-medium">
                <InlineMath math="P_{\text{out}}(R) = \varepsilon" />
              </div>
            </div>
            <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
              <div className="text-xs font-semibold text-purple-600 mb-1">설계 전략</div>
              <div className="text-sm text-slate-700">
                보수적 전송률 선택, 다이버시티로 outage 감소
              </div>
            </div>
            <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
              <div className="text-xs font-semibold text-purple-600 mb-1">적용 환경</div>
              <div className="text-sm text-slate-700">
                보행자 속도, 짧은 패킷
              </div>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-violet-50 border border-violet-200">
              <div className="text-xs font-semibold text-violet-600 mb-1">용량 정의</div>
              <div className="text-sm text-slate-800 font-medium">
                Ergodic capacity <InlineMath math="\mathbb{E}[C]" />
              </div>
            </div>
            <div className="p-4 rounded-lg bg-violet-50 border border-violet-200">
              <div className="text-xs font-semibold text-violet-600 mb-1">핵심 지표</div>
              <div className="text-sm text-slate-800 font-medium">
                평균 throughput
              </div>
            </div>
            <div className="p-4 rounded-lg bg-violet-50 border border-violet-200">
              <div className="text-xs font-semibold text-violet-600 mb-1">설계 전략</div>
              <div className="text-sm text-slate-700">
                코딩+인터리빙으로 fading 평균화
              </div>
            </div>
            <div className="p-4 rounded-lg bg-violet-50 border border-violet-200">
              <div className="text-xs font-semibold text-violet-600 mb-1">적용 환경</div>
              <div className="text-sm text-slate-700">
                차량 속도, 긴 스트림
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5.4.2-4 Diversity and Capacity */}
      <div className="concept-card mb-6" id="fading-diversity">
        <div className="text-xs font-semibold text-purple-600 mb-1">5.4.2-4 Diversity</div>
        <h3 className="font-bold text-slate-800 mb-2">다이버시티와 용량</h3>
        <p className="text-sm text-slate-600 mb-3">
          다이버시티 기법은 독립적인 페이딩 경로를 확보하여 outage probability를 크게 줄입니다.
          수신, 송신, 시간/주파수 다이버시티 각각이 용량에 미치는 영향을 살펴봅니다.
        </p>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <h4 className="text-sm font-bold text-purple-700 mb-1">Receive Diversity (SIMO)</h4>
            <p className="text-sm text-slate-600">
              다수의 수신 안테나를 통해 독립적인 채널 관측을 얻고,
              MRC(Maximum Ratio Combining)로 합성하여 outage probability를 감소시킵니다.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <h4 className="text-sm font-bold text-violet-700 mb-1">Transmit Diversity (Alamouti)</h4>
            <p className="text-sm text-slate-600">
              송신기에 CSI가 없어도 Alamouti 코드와 같은 space-time code를 통해
              다이버시티를 확보할 수 있습니다.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 md:col-span-2">
            <h4 className="text-sm font-bold text-purple-700 mb-1">Time/Frequency Diversity</h4>
            <p className="text-sm text-slate-600">
              인터리빙과 주파수 분산을 통해 병렬 채널을 형성하고,
              이에 대한 outage 분석을 수행합니다.
            </p>
          </div>
        </div>

        <div className="formula-block">
          <h4 className="font-semibold text-blue-800 mb-3">
            <InlineMath math="L" />-branch 다이버시티 Outage
          </h4>
          <BlockMath math={String.raw`P_{\text{out}} \propto \text{SNR}^{-L}`} />
          <div className="text-sm text-slate-600 mt-2">
            다이버시티 차수 <InlineMath math="L" />이 증가할수록 outage probability가
            SNR의 <InlineMath math="L" />제곱에 반비례하여 급격히 감소합니다.
          </div>
        </div>
      </div>

      {/* 5.4.6 Transmitter Side Information */}
      <div className="concept-card mb-6" id="tx-side-info">
        <div className="text-xs font-semibold text-violet-600 mb-1">5.4.6 Tx Side Info</div>
        <h3 className="font-bold text-slate-800 mb-2">송신기 부가정보 (Transmitter Side Information)</h3>
        <p className="text-sm text-slate-600 mb-3">
          송신기가 채널 상태 정보(CSI)를 알고 있을 때, 전력 할당을 최적화하여 용량을 높일 수 있습니다.
          대표적인 두 가지 전략을 비교합니다.
        </p>

        <div className="mb-4">
          <h4 className="text-sm font-bold text-purple-700 mb-1">Channel Inversion</h4>
          <p className="text-sm text-slate-600 mb-2">
            모든 채널 상태에서 일정한 전송률을 유지하기 위해,
            채널 이득에 반비례하는 전력을 할당합니다.
          </p>
          <BlockMath math={String.raw`P(h) = \frac{\mu}{|h|^2}`} />
        </div>

        <div className="mb-4">
          <h4 className="text-sm font-bold text-violet-700 mb-1">Waterfilling in Time</h4>
          <p className="text-sm text-slate-600">
            좋은 채널 상태에서 더 많은 데이터를 전송하고,
            나쁜 채널 상태에서는 전송을 대기합니다.
            시간 축에서의 waterfilling 원리를 적용하는 최적 전략입니다.
          </p>
        </div>

        {/* Compare Grid */}
        <div className="compare-grid">
          <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
            <h4 className="text-sm font-bold text-purple-700 mb-2">Channel Inversion</h4>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>일정 전송률 유지</li>
              <li>높은 전력 소모</li>
              <li>Rayleigh에서 무한 전력 필요할 수 있음</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg bg-violet-50 border border-violet-200">
            <h4 className="text-sm font-bold text-violet-700 mb-2">Waterfilling</h4>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>변동 전송률</li>
              <li>최적 전력 효율</li>
              <li>실제 구현에 버퍼 필요</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Interactive Labs */}
      <CapacityComparison />
      <DiversityGainVisualizer />

      {/* Experiment suggestion */}
      <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 mb-6">
        <p className="text-sm text-amber-900">
          <strong>권장 실험:</strong> CapacityComparison 랩에서 SNR을 변화시키며
          AWGN, Ergodic, Outage(1%), Outage(10%) 용량을 비교합니다.
          낮은 SNR에서 outage capacity가 음수가 되는 것은
          해당 전송률을 지원할 수 없다는 의미입니다.
        </p>
      </div>

      {/* Insight */}
      <div className="insight mt-8">
        <div className="insight-title">페이딩 채널 용량의 교훈</div>
        <p className="text-sm text-amber-900">
          페이딩은 반드시 나쁜 것만은 아닙니다. 빠른 페이딩에서 인터리빙과 코딩을 통해
          채널 변동을 평균화하면, 다이버시티 이득을 얻을 수 있습니다.{' '}
          <button onClick={() => onNavigate('ch5-main-plot')} className="cross-ref !text-xs">
            5.5 Main Plot
          </button>{' '}
          에서 전체 구조를 조망하고,{' '}
          <button onClick={() => onNavigate('detection')} className="cross-ref !text-xs">
            Ch.3 3.1 검출
          </button>{' '}
          과{' '}
          <button onClick={() => onNavigate('awgn-capacity')} className="cross-ref !text-xs">
            5.1 AWGN 용량
          </button>
          을 참고하여 기초 개념을 복습할 수 있습니다.
        </p>
      </div>
    </section>
  );
}
