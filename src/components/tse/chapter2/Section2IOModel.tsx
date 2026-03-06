'use client';

import { BlockMath, InlineMath } from 'react-katex';
import { useState } from 'react';

interface Section2IOModelProps {
  onNavigate: (id: string) => void;
}

export default function Section2IOModel({ onNavigate }: Section2IOModelProps) {
  const [mode, setMode] = useState<'flat' | 'selective'>('flat');

  return (
    <section id="io-model" className="section-card transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <span className="badge badge-blue">Intermediate</span>
        <span className="text-sm text-slate-400">Section 2</span>
      </div>

      <h2 className="text-3xl font-bold text-slate-900 mb-4">2.2 Input/Output Model of the Wireless Channel</h2>

      <p className="text-lg text-slate-600 leading-relaxed mb-6">
        앞에서 본 물리 현상을 그대로 두면 수신기 설계가 어렵습니다.
        이 섹션에서는 복잡한 전파를 <strong>"입력 → 채널 → 출력"</strong>이라는
        수학 모델로 정리합니다. passband 신호를 복소 baseband LTV 시스템으로 추상화하면,
        이후 등화·검출·추정 알고리즘을 체계적으로 설계할 수 있습니다.
      </p>

      <div className="formula-block mb-6" id="ltv-model">
        <h4 className="font-semibold text-blue-800 mb-3">2.2.1 Wireless channel as LTV system</h4>
        <BlockMath math={String.raw`y(t)=\int h(t,\tau)x(t-\tau)\,d\tau + w(t)`} />
        <div className="grid md:grid-cols-3 gap-3 mt-3 text-sm text-slate-600">
          <div><InlineMath math={String.raw`h(t,\tau)`} />: 시간가변 임펄스 응답</div>
          <div><InlineMath math="t" />: 관측 시각</div>
          <div><InlineMath math={String.raw`\tau`} />: 경로 지연</div>
        </div>
        <p className="text-sm text-slate-600 mt-3">
          일반적인 LTI 시스템과 달리, 무선 채널은 이동에 의해 임펄스 응답 자체가 시간에 따라 변합니다.
          이 <strong>LTV(Linear Time-Varying)</strong> 특성이 도플러 효과와 시간 선택적 페이딩의 수학적 표현이며,
          유선 채널에는 없는 무선만의 핵심 난이도입니다.
        </p>
      </div>

      <div className="formula-block mb-6" id="baseband-model">
        <h4 className="font-semibold text-blue-800 mb-3">2.2.2 Complex baseband equivalent</h4>
        <BlockMath math={String.raw`y_b(t)=\sum_i a_i(t)e^{-j2\pi f_c\tau_i(t)}x_b(t-\tau_i(t))`} />
        <p className="text-sm text-slate-600 mt-2">
          실제 전파는 GHz 대역 반송파 위에 실려 있지만, 이 빠른 진동을 직접 다루면 불필요하게 복잡해집니다.
          반송파를 제거하고 <strong>복소 baseband</strong>로 변환하면,
          각 경로의 위상 회전이 복소 계수로 흡수되어 다중경로 구조를 간결하게 다룰 수 있습니다.
        </p>
      </div>

      <div className="formula-block mb-6" id="discrete-model">
        <h4 className="font-semibold text-blue-800 mb-3">2.2.3 Discrete-time baseband model</h4>
        <BlockMath math={String.raw`y[m]=\sum_{\ell=0}^{L-1}h_\ell[m]x[m-\ell]+w[m]`} />
        <p className="text-sm text-slate-600 mt-2">
          연속 시간 모델을 대역폭 <InlineMath math="W" />의 나이퀴스트 레이트로 샘플링하면,
          채널은 <strong>몇 개의 탭(tap)</strong>으로 요약되는 FIR 필터가 됩니다.
          탭 수 <InlineMath math={String.raw`L \approx \lceil T_d \cdot W \rceil + 1`} />은 delay spread와 대역폭이 결정하며,
          이 이산 시간 구조가 디지털 수신기 설계의 직접적 출발점입니다.
        </p>
      </div>

      <div className="concept-card mb-6" id="dof-discussion">
        <h3 className="font-bold text-lg text-slate-800 mb-3">Discussion 2.1: Degrees of Freedom</h3>
        <p className="text-sm text-slate-600 mb-2">
          채널이 시간과 주파수에서 독립적으로 변할 수 있는 단위 블록(코히런스 블록)의 개수가
          <strong>유효 자유도(DoF)</strong>를 결정합니다.
        </p>
        <p className="text-sm text-slate-600">
          대역폭 <InlineMath math="W" />, 전송 시간 <InlineMath math="T" />인 시스템에서
          자유도는 대략 <InlineMath math={String.raw`N \approx W \cdot T`} />개입니다.
          이 자유도를 어떻게 활용하느냐가 다이버시티 이득과 멀티플렉싱 이득의 상한을 결정하며,
          이것이 Chapter 2 전체를 관통하는 핵심 개념입니다.
        </p>
      </div>

      <div className="concept-card mb-6" id="awgn-model">
        <h3 className="font-bold text-lg text-slate-800 mb-3">2.2.4 Additive white noise baseline</h3>
        <BlockMath math={String.raw`w[m]\sim\mathcal{CN}(0,N_0)`} />
        <p className="text-sm text-slate-600 mt-2">
          열잡음(thermal noise)은 원형대칭 복소 가우시안으로 모델링합니다.
          "White"는 주파수에 걸쳐 전력밀도가 균일함을, "Additive"는 신호와 독립적으로 더해진다는 뜻입니다.
          단순하지만 실제 시스템을 잘 근사하는 이 모델이{' '}
          <button onClick={() => onNavigate('appendix-a')} className="cross-ref !text-xs">Appendix A</button>
          의 검출/추정 이론과 모든 SNR 분석의 기준선이 됩니다.
        </p>
      </div>

      <div className="concept-card mb-6">
        <h3 className="font-bold text-lg text-slate-800 mb-3">빠른 판정: Flat vs Frequency-selective</h3>
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setMode('flat')}
            className={`px-3 py-1.5 rounded-lg text-sm border ${mode === 'flat' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-300'}`}
          >
            Flat (W {'<'} B_c)
          </button>
          <button
            onClick={() => setMode('selective')}
            className={`px-3 py-1.5 rounded-lg text-sm border ${mode === 'selective' ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-slate-600 border-slate-300'}`}
          >
            Selective (W {'>'} B_c)
          </button>
        </div>
        {mode === 'flat' ? (
          <div className="p-3 rounded-lg bg-blue-50 text-sm text-blue-900">
            <div className="font-semibold mb-1">Flat fading (<InlineMath math={String.raw`W \ll W_c`} />)</div>
            <div>
              대역폭 내 채널 이득이 거의 일정하여 탭이 1개(<InlineMath math="L=1" />)로 근사됩니다.
              수신기 구조가 단순해지며, 채널은 단일 복소 스칼라 곱으로 표현됩니다:
              <InlineMath math={String.raw`y[m] = h[m] \cdot x[m] + w[m]`} />.
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-violet-50 text-sm text-violet-900">
            <div className="font-semibold mb-1">Frequency-selective fading (<InlineMath math={String.raw`W \gg W_c`} />)</div>
            <div>
              여러 탭에 의해 심볼 간 간섭(ISI)이 발생합니다.
              이를 해결하기 위해 OFDM(주파수 영역 분할), 등화기(시간 영역 보상),
              또는 RAKE 수신기 등의 구조가 필요하며, 채널 추정 복잡도도 증가합니다.
            </div>
          </div>
        )}
      </div>

      <div className="insight">
        <div className="insight-title">학습 연결</div>
        <p className="text-amber-900">
          채널을 수학 모델로 바꿀 수 있게 되었으니, 다음 질문은 "이 채널이 flat인지 selective인지,
          빠르게 변하는지 느린지"를 어떻게 판정하느냐입니다.
          <button onClick={() => onNavigate('parameters')} className="cross-ref !text-xs ml-1">2.3 Coherence 파라미터</button>
          에서 그 정량 기준을 확인합니다.
        </p>
      </div>
    </section>
  );
}
