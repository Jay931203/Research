'use client';

import { BlockMath, InlineMath } from 'react-katex';
import CapacityComparison from '@/components/tse/interactive/CapacityComparison';

interface Section6Props {
  onNavigate: (id: string) => void;
}

export default function Section6AppendixC({ onNavigate }: Section6Props) {
  return (
    <section id="appendix-c" className="section-card transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <span className="badge badge-red">Advanced</span>
        <span className="text-sm text-slate-400">Appendix</span>
      </div>

      <h2 className="text-3xl font-bold text-slate-900 mb-4">
        Appendix C: 채널 용량 보충 자료
      </h2>
      <p className="text-lg text-slate-600 leading-relaxed mb-8">
        Chapter 5의 핵심 수학적 도출과 심화 주제를 다룹니다.
        워터필링의 최적성 유도, outage와 ergodic 용량의 비교,
        채널 반전 기법의 분석을 통해 용량 이론의 깊이를 더합니다.
      </p>

      {/* ───────── C.1 Waterfilling Derivation ───────── */}
      <div id="appendix-c1" className="concept-card mb-8">
        <div className="text-xs font-semibold text-purple-600 mb-1">Appendix C.1</div>
        <h3 className="font-bold text-xl text-slate-800 mb-3">
          워터필링 유도 (Waterfilling Derivation)
        </h3>
        <p className="text-sm text-slate-600 mb-4">
          KKT(Karush-Kuhn-Tucker) 조건을 이용하여 병렬 채널에서의 최적 전력 배분 문제를 정형화합니다.
          전력 제약 하에서 총 용량을 최대화하는 문제는 볼록 최적화로 귀결됩니다.
        </p>

        <div className="formula-block mb-4">
          <h4 className="font-semibold text-blue-800 mb-2">최적화 문제</h4>
          <BlockMath math={String.raw`\max_{\{P_i\}} \sum_i \log_2\!\left(1 + \frac{|h_i|^2 P_i}{N_0}\right) \quad \text{s.t.} \quad \sum_i P_i \le P, \;\; P_i \ge 0`} />
          <p className="text-sm text-slate-600 mt-2">
            각 서브채널 <InlineMath math="i" />에 할당하는 전력 <InlineMath math="P_i" />를
            총 전력 제약 <InlineMath math="P" /> 하에서 최적화합니다.
          </p>
        </div>

        <div className="formula-block mb-4">
          <h4 className="font-semibold text-blue-800 mb-2">Lagrangian</h4>
          <BlockMath math={String.raw`\mathcal{L} = \sum_i \log_2\!\left(1 + \frac{|h_i|^2 P_i}{N_0}\right) - \lambda\!\left(\sum_i P_i - P\right)`} />
          <p className="text-sm text-slate-600 mt-2">
            라그랑주 승수 <InlineMath math="\lambda" />는 전력 제약의 그림자 가격(shadow price)을 나타냅니다.
          </p>
        </div>

        <div className="formula-block mb-4">
          <h4 className="font-semibold text-blue-800 mb-2">KKT 조건으로부터의 해</h4>
          <BlockMath math={String.raw`P_i = \left(\mu - \frac{N_0}{|h_i|^2}\right)^{\!+}`} />
          <p className="text-sm text-slate-600 mt-2">
            여기서 <InlineMath math="(\cdot)^+ = \max(\cdot, 0)" />이며,
            <InlineMath math="\mu" />는 <InlineMath math="\sum_i P_i = P" />를 만족하도록 결정되는 수면 높이(water level)입니다.
          </p>
        </div>

        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 mb-4">
          <h4 className="font-semibold text-purple-800 mb-2">물통 비유 (Water-filling Analogy)</h4>
          <p className="text-sm text-slate-600 mb-2">
            각 서브채널을 용기로 생각합니다.
            바닥 높이는 <InlineMath math="N_0 / |h_i|^2" />(채널이 나쁠수록 바닥이 높음)이고,
            수면 높이 <InlineMath math="\mu" />까지 물(전력)을 채웁니다.
          </p>
          <div className="grid md:grid-cols-3 gap-3 mt-3">
            <div className="p-3 bg-white rounded-lg border border-purple-100 text-sm">
              <div className="font-bold text-purple-700 mb-1">좋은 채널</div>
              <div className="text-slate-600">바닥이 낮아 많은 전력 할당</div>
            </div>
            <div className="p-3 bg-white rounded-lg border border-purple-100 text-sm">
              <div className="font-bold text-purple-700 mb-1">나쁜 채널</div>
              <div className="text-slate-600">바닥이 높아 적은 전력 할당</div>
            </div>
            <div className="p-3 bg-white rounded-lg border border-purple-100 text-sm">
              <div className="font-bold text-purple-700 mb-1">매우 나쁜 채널</div>
              <div className="text-slate-600">바닥이 수면 위 &rarr; 전력 0</div>
            </div>
          </div>
        </div>
      </div>

      {/* ───────── C.2 Outage vs Ergodic ───────── */}
      <div id="appendix-c2" className="concept-card mb-8">
        <div className="text-xs font-semibold text-violet-600 mb-1">Appendix C.2</div>
        <h3 className="font-bold text-xl text-slate-800 mb-3">
          Outage vs Ergodic 용량 비교
        </h3>
        <p className="text-sm text-slate-600 mb-4">
          두 가지 용량 정의는 페이딩 채널에서 서로 다른 설계 철학을 반영합니다.
          느린 페이딩에서는 outage가, 빠른 페이딩에서는 ergodic 용량이 적합한 지표입니다.
        </p>

        <div className="formula-block mb-4">
          <h4 className="font-semibold text-blue-800 mb-2">Outage Capacity의 CDF 해석</h4>
          <BlockMath math={String.raw`P_{\text{out}}(\epsilon) = P\!\left(\log_2(1 + \text{SNR}\,|h|^2) < R\right) = \epsilon`} />
          <p className="text-sm text-slate-600 mt-2">
            outage capacity <InlineMath math="C_\epsilon" />는 outage 확률이 <InlineMath math="\epsilon" />일 때
            달성 가능한 최대 전송률입니다.
            이는 순시 용량의 CDF에서 <InlineMath math="\epsilon" />-분위수에 해당합니다.
          </p>
        </div>

        <div className="formula-block mb-4">
          <h4 className="font-semibold text-blue-800 mb-2">Ergodic Capacity와 Jensen 부등식</h4>
          <BlockMath math={String.raw`C_{\text{erg}} = \mathbb{E}\!\left[\log_2(1 + \text{SNR}\,|h|^2)\right] \le \log_2\!\left(1 + \text{SNR}\,\mathbb{E}[|h|^2]\right) = C_{\text{AWGN}}`} />
          <p className="text-sm text-slate-600 mt-2">
            <InlineMath math="\log" /> 함수의 오목성(concavity)과 Jensen 부등식에 의해,
            ergodic capacity는 같은 평균 SNR에서의 AWGN capacity보다 항상 작거나 같습니다.
            페이딩 자체가 용량을 감소시킨다는 의미입니다.
          </p>
        </div>

        <div className="formula-block mb-4">
          <h4 className="font-semibold text-blue-800 mb-2">Diversity Order와 Outage Probability</h4>
          <BlockMath math={String.raw`P_{\text{out}} \propto \text{SNR}^{-L}`} />
          <p className="text-sm text-slate-600 mt-2">
            다이버시티 차수 <InlineMath math="L" />이 클수록 outage 확률이 SNR에 대해
            더 급격히 감소합니다.
            이는 Chapter 3의 다이버시티 이론과 직접 연결됩니다.
          </p>
        </div>

        {/* Compare grid: Outage vs Ergodic */}
        <div className="compare-grid mb-4">
          <div className="compare-item border-purple-200 bg-purple-50/40">
            <h4 className="font-bold text-purple-800 mb-2">Outage Capacity</h4>
            <ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
              <li>느린 페이딩에 적합</li>
              <li>확률적 보장 (예: 99% 신뢰도)</li>
              <li>보수적 전송률 설정</li>
              <li>지연 민감 서비스에 적합</li>
              <li>다이버시티로 개선 가능</li>
            </ul>
          </div>
          <div className="compare-item border-violet-200 bg-violet-50/40">
            <h4 className="font-bold text-violet-800 mb-2">Ergodic Capacity</h4>
            <ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
              <li>빠른 페이딩에 적합</li>
              <li>장기 평균 전송률</li>
              <li>인터리빙+코딩으로 달성</li>
              <li>지연 허용 서비스에 적합</li>
              <li>항상 AWGN 용량 이하</li>
            </ul>
          </div>
        </div>

        <CapacityComparison />
      </div>

      {/* ───────── C.3 Channel Inversion ───────── */}
      <div id="appendix-c3" className="concept-card mb-8">
        <div className="text-xs font-semibold text-purple-600 mb-1">Appendix C.3</div>
        <h3 className="font-bold text-xl text-slate-800 mb-3">
          채널 반전 (Channel Inversion) 분석
        </h3>
        <p className="text-sm text-slate-600 mb-4">
          일정한 전송률을 유지하기 위해 채널 상태에 반비례하여 전력을 조절하는 기법입니다.
          구현이 단순하지만, 깊은 페이딩에서 과도한 전력을 소모하는 단점이 있습니다.
        </p>

        <div className="formula-block mb-4">
          <h4 className="font-semibold text-blue-800 mb-2">전력 제어 법칙</h4>
          <BlockMath math={String.raw`P(h) = \frac{(2^{R/W} - 1) \cdot N_0}{|h|^2}`} />
          <p className="text-sm text-slate-600 mt-2">
            채널 이득 <InlineMath math="|h|^2" />이 작을수록 더 많은 전력을 투입하여
            수신 SNR을 일정하게 유지합니다.
            이를 통해 전송률 <InlineMath math="R" />을 시간에 따라 일정하게 만듭니다.
          </p>
        </div>

        <div className="formula-block mb-4">
          <h4 className="font-semibold text-blue-800 mb-2">평균 전력 제약</h4>
          <BlockMath math={String.raw`\mathbb{E}[P(h)] = (2^{R/W} - 1) \cdot N_0 \cdot \mathbb{E}\!\left[\frac{1}{|h|^2}\right] \le P`} />
          <p className="text-sm text-slate-600 mt-2">
            평균 전력이 제약 <InlineMath math="P" />를 만족해야 하므로,
            <InlineMath math={String.raw`\mathbb{E}[1/|h|^2]`} />의 값이 달성 가능한 전송률을 결정합니다.
          </p>
        </div>

        <div className="p-4 bg-red-50 rounded-lg border border-red-200 mb-4">
          <h4 className="font-semibold text-red-800 mb-2">Rayleigh 페이딩에서의 발산 문제</h4>
          <p className="text-sm text-slate-600 mb-2">
            Rayleigh 페이딩에서 <InlineMath math="|h|^2" />는 지수 분포를 따르며,
            <InlineMath math={String.raw`\mathbb{E}[1/|h|^2]`} />가 발산합니다.
            이는 깊은 페이딩 구간에서 무한한 전력이 필요함을 의미하므로,
            채널 이득이 임계값 이하인 경우 전송을 중단하는 truncated channel inversion이 필요합니다.
          </p>
        </div>

        <div className="formula-block mb-4">
          <h4 className="font-semibold text-blue-800 mb-2">채널 반전 용량</h4>
          <BlockMath math={String.raw`C_{\text{inv}} = W \log_2\!\left(1 + \frac{1}{\mathbb{E}[1/|h|^2] \cdot N_0}\right)`} />
          <p className="text-sm text-slate-600 mt-2">
            채널 반전의 용량은 <InlineMath math={String.raw`\mathbb{E}[1/|h|^2]`} />에 의해 제한됩니다.
            이 값은 일반적으로 ergodic capacity보다 작으며,
            채널 상태가 나쁜 순간에 과도한 전력을 투입하는 비효율성을 반영합니다.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
            <div className="font-bold text-purple-700 mb-1">장점</div>
            <p className="text-xs text-slate-600">
              일정한 전송률 보장으로 QoS 관리가 단순합니다.
              수신기에서 적응형 복호가 필요하지 않습니다.
            </p>
          </div>
          <div className="p-4 bg-violet-50 rounded-lg border border-violet-100">
            <div className="font-bold text-violet-700 mb-1">단점</div>
            <p className="text-xs text-slate-600">
              전력 효율이 낮으며, 워터필링 대비 용량 손실이 큽니다.
              Rayleigh 채널에서는 truncation 없이 사용이 불가능합니다.
            </p>
          </div>
        </div>
      </div>

      {/* ───────── Integration Summary ───────── */}
      <div className="concept-card mb-8">
        <h3 className="font-bold text-lg text-slate-800 mb-3">Appendix C 통합 요약</h3>
        <p className="text-sm text-slate-600 mb-4">
          세 가지 심화 주제는 Chapter 5의 용량 이론을 실전 설계로 연결하는 다리 역할을 합니다.
        </p>
        <div className="compare-grid mb-4">
          <div className="compare-item border-purple-200 bg-purple-50/40">
            <h4 className="font-bold text-purple-800 mb-2">이론 &rarr; 실전</h4>
            <ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
              <li>워터필링: 최적 전력 배분</li>
              <li>Outage/Ergodic: 설계 기준 선택</li>
              <li>채널 반전: 일정 QoS 보장</li>
            </ul>
          </div>
          <div className="compare-item border-violet-200 bg-violet-50/40">
            <h4 className="font-bold text-violet-800 mb-2">Chapter 5 &rarr; Chapter 3 연결</h4>
            <ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
              <li>용량 한계가 다이버시티 설계의 근거</li>
              <li>Outage 분석이 코딩 전략을 결정</li>
              <li>CSI 품질이 적응형 전략의 전제 조건</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ───────── Connection Chain ───────── */}
      <div className="concept-card mb-6">
        <h3 className="font-bold text-lg text-slate-800 mb-3">Chapter 5 전체 연결 체인</h3>
        <p className="text-sm text-slate-600 mb-4">
          Chapter 5의 학습 경로가 완성됩니다. 각 단계가 이전 단계의 결과에 의존하며 하나의 흐름을 이룹니다.
        </p>
        <div className="flex flex-wrap items-center gap-1 text-sm text-slate-700">
          <button onClick={() => onNavigate('awgn-capacity')} className="cross-ref !text-xs">
            5.1 AWGN
          </button>
          <span>&rarr;</span>
          <button onClick={() => onNavigate('resources')} className="cross-ref !text-xs">
            5.2 Resources
          </button>
          <span>&rarr;</span>
          <button onClick={() => onNavigate('lti-channels')} className="cross-ref !text-xs">
            5.3 LTI
          </button>
          <span>&rarr;</span>
          <button onClick={() => onNavigate('fading-capacity')} className="cross-ref !text-xs">
            5.4 Fading
          </button>
          <span>&rarr;</span>
          <button onClick={() => onNavigate('ch5-main-plot')} className="cross-ref !text-xs">
            5.5 Main Plot
          </button>
          <span>&rarr;</span>
          <span className="font-bold text-purple-700">Appendix C</span>
          <span>&rarr;</span>
          <button onClick={() => onNavigate('appendix-b')} className="cross-ref !text-xs">
            Ch.3 Appendix B
          </button>
        </div>
      </div>

      {/* ───────── Final Insight ───────── */}
      <div className="insight mb-0">
        <div className="insight-title">정보이론의 교훈</div>
        <p className="text-sm text-amber-900 mb-2">
          채널 용량은 달성 가능한 전송률의 상한선이자, 시스템 설계의 나침반입니다.
          Chapter 3의 다이버시티 기법과 Chapter 5의 용량 분석을 결합하면,
          이론과 실전 사이의 간극을 체계적으로 줄일 수 있습니다.
        </p>
        <p className="text-sm text-amber-900">
          정보이론 기초를 복습하려면{' '}
          <button onClick={() => onNavigate('appendix-b')} className="cross-ref !text-xs">
            Ch.3 Appendix B
          </button>{' '}
          를, 채널 모델의 기초로 돌아가려면{' '}
          <button onClick={() => onNavigate('main-plot')} className="cross-ref !text-xs">
            Ch.2 Main Plot
          </button>{' '}
          을 참조합니다.
        </p>
      </div>
    </section>
  );
}
