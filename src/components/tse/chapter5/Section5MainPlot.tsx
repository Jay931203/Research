'use client';

import { BlockMath, InlineMath } from 'react-katex';
import { useState, useMemo } from 'react';
import CapacityComparison from '@/components/tse/interactive/CapacityComparison';

interface Section5Props {
  onNavigate: (id: string) => void;
}

type ChannelType = 'awgn' | 'flat-fading' | 'freq-selective';
type FadingSpeed = 'slow' | 'fast';
type CsiAvailability = 'no-csi' | 'rx-only' | 'full-csi';

export default function Section5MainPlot({ onNavigate }: Section5Props) {
  const [channelType, setChannelType] = useState<ChannelType>('awgn');
  const [fadingSpeed, setFadingSpeed] = useState<FadingSpeed>('slow');
  const [csiAvailability, setCsiAvailability] = useState<CsiAvailability>('rx-only');

  const recommendation = useMemo(() => {
    if (channelType === 'awgn') {
      return {
        title: '기준선 시나리오',
        description: 'C = W log\u2082(1+SNR)으로 직접 계산합니다',
        detail: 'AWGN 채널은 페이딩이 없으므로 Shannon 용량 공식을 그대로 적용합니다. 전력과 대역폭의 트레이드오프만 고려하면 됩니다.',
        color: 'purple',
      };
    }

    if (channelType === 'freq-selective') {
      return {
        title: 'OFDM + 워터필링',
        description: '주파수 선택적 채널을 병렬 서브채널로 분해 후 최적 전력 배분합니다',
        detail: '광대역 채널의 주파수 선택성을 OFDM으로 병렬 평탄 서브채널로 변환하고, 각 서브채널에 워터필링으로 전력을 최적 배분하여 총 용량을 극대화합니다.',
        color: 'violet',
      };
    }

    // flat-fading cases
    if (csiAvailability === 'full-csi') {
      return {
        title: '워터필링',
        description: '채널 상태에 따른 전력/전송률 적응으로 최대 throughput을 달성합니다',
        detail: '송수신 양측에서 CSI를 활용하여, 채널 상태가 좋을 때 더 많은 전력과 높은 전송률을 할당하고, 나쁠 때는 전송을 줄이거나 중단하는 적응형 전략입니다.',
        color: 'purple',
      };
    }

    if (fadingSpeed === 'slow') {
      if (csiAvailability === 'no-csi') {
        return {
          title: 'Outage 설계',
          description: '목표 아웃에이지 확률에 맞춰 보수적 전송률을 설정합니다',
          detail: '느린 페이딩에서 CSI 없이 전송할 경우, 채널이 목표 전송률을 지원하지 못할 확률(outage probability)을 기준으로 설계합니다. 신뢰성과 전송률 사이의 트레이드오프가 핵심입니다.',
          color: 'violet',
        };
      }
      // rx-only
      return {
        title: '다이버시티 활용',
        description: '수신 다이버시티로 outage 확률을 낮춥니다',
        detail: '수신기에서 CSI를 활용하여 MRC 등의 결합 기법을 적용하고, 다이버시티 이득으로 outage 확률을 줄입니다. 송신기는 고정 전송률로 전송하되, 수신기가 채널 변동에 대응합니다.',
        color: 'purple',
      };
    }

    // fast fading + any CSI (no-csi or rx-only)
    return {
      title: 'Ergodic 설계',
      description: '인터리빙+코딩으로 채널 평균화하여 ergodic capacity에 접근합니다',
      detail: '빠른 페이딩에서는 충분히 긴 코드워드가 다양한 채널 상태를 경험하므로, 채널의 시간 평균적 용량(ergodic capacity)에 접근할 수 있습니다. 인터리빙이 채널 다이버시티를 코딩 이득으로 변환합니다.',
      color: 'violet',
    };
  }, [channelType, fadingSpeed, csiAvailability]);

  const colorMap: Record<string, { bg: string; border: string; text: string }> = {
    purple: { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-800' },
    violet: { bg: 'bg-violet-50', border: 'border-violet-300', text: 'text-violet-800' },
  };

  const recStyle = colorMap[recommendation.color];

  return (
    <section id="ch5-main-plot" className="section-card transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <span className="badge badge-red">Advanced</span>
        <span className="text-sm text-slate-400">Section 5</span>
      </div>

      <h2 className="text-3xl font-bold text-slate-900 mb-4">
        5.5 Chapter 5 Main Plot: 무선 채널 용량 설계 체인
      </h2>
      <p className="text-lg text-slate-600 leading-relaxed mb-6">
        Chapter 5에서 다룬 핵심 개념을 하나의 설계 체인으로 통합합니다.
        AWGN 기준선에서 출발해 채널 구조, 페이딩 유형, CSI 가용성에 따른
        용량 전략을 결정합니다.
      </p>

      {/* ───────── Design Chain Synthesizer ───────── */}
      <div className="concept-card mb-8" id="capacity-design-chain">
        <h3 className="font-bold text-lg text-slate-800 mb-4">
          Design Chain Synthesizer: 채널 시나리오에 따른 용량 전략 선택
        </h3>
        <p className="text-sm text-slate-600 mb-4">
          세 가지 조건을 선택하면, 해당 시나리오에 적합한 용량 전략이 자동으로 추천됩니다.
        </p>

        <div className="space-y-4 mb-4">
          {/* Control 1: Channel Type */}
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <label className="block text-xs font-medium text-slate-600 mb-2">
              채널 유형
            </label>
            <div className="flex flex-wrap gap-2">
              {([
                ['awgn', 'AWGN'],
                ['flat-fading', '평탄 페이딩'],
                ['freq-selective', '주파수 선택적'],
              ] as [ChannelType, string][]).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setChannelType(val)}
                  aria-pressed={channelType === val}
                  className={`px-3 py-1.5 rounded-lg text-sm border ${
                    channelType === val
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'bg-white text-slate-600 border-slate-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Control 2: Fading Speed */}
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <label className="block text-xs font-medium text-slate-600 mb-2">
              페이딩 속도
            </label>
            <div className="flex gap-2">
              {([
                ['slow', '느린 페이딩 (Slow)'],
                ['fast', '빠른 페이딩 (Fast)'],
              ] as [FadingSpeed, string][]).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setFadingSpeed(val)}
                  aria-pressed={fadingSpeed === val}
                  className={`px-3 py-1.5 rounded-lg text-sm border ${
                    fadingSpeed === val
                      ? 'bg-violet-600 text-white border-violet-600'
                      : 'bg-white text-slate-600 border-slate-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Control 3: CSI Availability */}
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <label className="block text-xs font-medium text-slate-600 mb-2">
              CSI 가용성
            </label>
            <div className="flex flex-wrap gap-2">
              {([
                ['no-csi', 'CSI 없음'],
                ['rx-only', '수신기만 CSI'],
                ['full-csi', '송수신 모두 CSI'],
              ] as [CsiAvailability, string][]).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setCsiAvailability(val)}
                  aria-pressed={csiAvailability === val}
                  className={`px-3 py-1.5 rounded-lg text-sm border ${
                    csiAvailability === val
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'bg-white text-slate-600 border-slate-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Recommendation */}
        <div
          role="status"
          className={`p-4 rounded-xl border-2 ${recStyle.bg} ${recStyle.border} transition-all duration-300`}
        >
          <div className={`font-bold text-lg ${recStyle.text} mb-1`}>
            {recommendation.title}
          </div>
          <p className="text-sm text-slate-700 font-medium mb-2">
            {recommendation.description}
          </p>
          <p className="text-sm text-slate-600">
            {recommendation.detail}
          </p>
        </div>
      </div>

      {/* ───────── Summary formulas ───────── */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <div className="concept-card">
          <h3 className="font-bold text-slate-800 mb-2">AWGN 기준선</h3>
          <BlockMath math={String.raw`C_{\text{AWGN}} = W \log_2(1 + \text{SNR})`} />
          <p className="text-sm text-slate-600 mt-2">
            페이딩 없는 이상적 채널의 용량입니다.
            모든 페이딩 채널 용량은 이 값을 상한으로 삼습니다.
          </p>
        </div>
        <div className="concept-card">
          <h3 className="font-bold text-slate-800 mb-2">페이딩 채널 용량 분류</h3>
          <BlockMath math={String.raw`C_{\text{erg}} = \mathbb{E}\!\left[\log_2(1 + \text{SNR}\,|h|^2)\right]`} />
          <p className="text-sm text-slate-600 mt-2">
            페이딩 유형과 CSI 가용성에 따라 outage capacity,
            ergodic capacity, 워터필링 capacity 등으로 분기됩니다.
          </p>
        </div>
      </div>

      {/* ───────── CapacityComparison interactive ───────── */}
      <CapacityComparison />

      {/* ───────── Completion Check ───────── */}
      <div className="concept-card mb-6 mt-8" id="ch5-completion-check">
        <h3 className="font-bold text-lg text-slate-800 mb-4">
          Chapter 5 설계 체인 요약: 5단계
        </h3>
        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
            <span className="w-7 h-7 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">1</span>
            <div>
              <div className="font-bold text-purple-800 text-sm">AWGN 기준선 확인</div>
              <div className="text-sm text-slate-600">
                <InlineMath math="C = W \log_2(1+\text{SNR})" />으로 이론적 상한을 먼저 파악합니다.
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-violet-50 rounded-lg border border-violet-200">
            <span className="w-7 h-7 bg-violet-600 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">2</span>
            <div>
              <div className="font-bold text-violet-800 text-sm">자원(전력/대역폭) 제약 분석</div>
              <div className="text-sm text-slate-600">
                Power-limited vs bandwidth-limited regime을 판별하여 자원 배분 방향을 결정합니다.
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
            <span className="w-7 h-7 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">3</span>
            <div>
              <div className="font-bold text-purple-800 text-sm">채널 구조 파악</div>
              <div className="text-sm text-slate-600">
                평탄 페이딩인지 주파수 선택적인지에 따라 OFDM/등화 구조를 결정합니다.
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-violet-50 rounded-lg border border-violet-200">
            <span className="w-7 h-7 bg-violet-600 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">4</span>
            <div>
              <div className="font-bold text-violet-800 text-sm">페이딩 유형 + CSI 전략 선택</div>
              <div className="text-sm text-slate-600">
                느린/빠른 페이딩과 CSI 가용성에 따라 outage, ergodic, 워터필링 전략을 결정합니다.
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
            <span className="w-7 h-7 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">5</span>
            <div>
              <div className="font-bold text-purple-800 text-sm">최종 용량 평가 및 검증</div>
              <div className="text-sm text-slate-600">
                선택한 전략의 달성 가능 전송률을 AWGN 기준선과 비교하여 설계를 검증합니다.
              </div>
            </div>
          </div>
        </div>

        {/* Cross-ref buttons to all previous sections */}
        <h4 className="font-semibold text-slate-700 text-sm mb-3">각 단계 상세 참조</h4>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => onNavigate('awgn-capacity')} className="cross-ref !text-xs">
            5.1 AWGN Capacity
          </button>
          <button onClick={() => onNavigate('resources')} className="cross-ref !text-xs">
            5.2 Resources
          </button>
          <button onClick={() => onNavigate('lti-channels')} className="cross-ref !text-xs">
            5.3 LTI Channels
          </button>
          <button onClick={() => onNavigate('fading-capacity')} className="cross-ref !text-xs">
            5.4 Fading Capacity
          </button>
          <button onClick={() => onNavigate('appendix-c')} className="cross-ref !text-xs">
            Appendix C
          </button>
        </div>
      </div>

      {/* ───────── Final Insight ───────── */}
      <div className="insight">
        <div className="insight-title">용량에서 실전으로</div>
        <p className="text-sm text-amber-900 mb-2">
          Chapter 5의 용량 분석은 이론적 한계를 제시하지만,
          실제 시스템에서 이 한계에 접근하려면 적절한 검출과 코딩 전략이 필요합니다.
        </p>
        <p className="text-sm text-amber-900">
          <button onClick={() => onNavigate('detection')} className="cross-ref !text-xs">
            Ch.3 검출 이론
          </button>{' '}
          에서 다룬 다이버시티 기법은 페이딩 채널에서 용량에 접근하기 위한 핵심 도구이며,{' '}
          <button onClick={() => onNavigate('io-model')} className="cross-ref !text-xs">
            Ch.2 I/O 모델
          </button>{' '}
          은 채널 구조를 수학적으로 추상화하는 출발점입니다.
          심화 수학적 도출은{' '}
          <button onClick={() => onNavigate('appendix-c')} className="cross-ref !text-xs">
            Appendix C
          </button>{' '}
          에서 이어집니다.
        </p>
      </div>
    </section>
  );
}
