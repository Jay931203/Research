'use client';

import { BlockMath, InlineMath } from 'react-katex';
import CapacityComparison from '@/components/tse/interactive/CapacityComparison';

interface Section7Props {
  onNavigate: (id: string) => void;
}

export default function Section7AppendixB({ onNavigate }: Section7Props) {
  return (
    <section id="appendix-b" className="section-card transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <span className="badge badge-red">Advanced</span>
        <span className="text-sm text-slate-400">Section 7</span>
      </div>

      <h2 className="text-3xl font-bold text-slate-900 mb-4">
        Appendix B: 정보이론 기초 (B.1~B.5)
      </h2>

      <p className="text-lg text-slate-600 leading-relaxed mb-8">
        Appendix B는 정보이론 배경을 빠르게 맞추는 구간입니다.
        이산 무기억 채널(DMC)에서 출발해 엔트로피, 코딩 정리, AWGN 용량, 구면 패킹까지,
        이후 용량과 코딩 논의를 위한 핵심 문법을 단계적으로 정리합니다.
      </p>

      {/* ───────── B.1 DMC ───────── */}
      <div id="appendix-b1" className="concept-card mb-8">
        <div className="text-xs font-semibold text-emerald-600 mb-1">Appendix B.1</div>
        <h3 className="font-bold text-xl text-slate-800 mb-3">이산 무기억 채널 (DMC)</h3>
        <p className="text-sm text-slate-600 mb-4">
          각 채널 사용이 서로 독립인 가장 기본적인 추상화입니다.
          전이확률 <InlineMath math="p(y|x)" /> 행렬이 채널을 완전히 규정합니다.
          "무기억"이란 이전 전송 결과가 현재 전송에 영향을 주지 않는다는 뜻이며,
          이 가정 덕분에 코딩 정리의 수학적 유도가 가능해집니다.
        </p>
        <div className="formula-block mb-4">
          <h4 className="font-semibold text-blue-800 mb-2">DMC 채널 법칙</h4>
          <BlockMath math={String.raw`p(y^n | x^n) = \prod_{i=1}^{n} p(y_i | x_i)`} />
          <p className="text-sm text-slate-600 mt-2">
            <InlineMath math="n" />회 채널 사용의 결합확률이 개별 확률의 곱으로 분해됩니다.
            이 독립성이 대수의 법칙과 AEP(Asymptotic Equipartition Property)를 적용할 수 있게 하며,
            코딩 정리의 핵심 기반입니다.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="font-bold text-blue-700 mb-1">BSC (Binary Symmetric Channel)</div>
            <p className="text-xs text-slate-600 mb-1">
              비트가 확률 <InlineMath math="p" />로 뒤집힙니다.
              용량: <InlineMath math={String.raw`C = 1 - h_2(p)`} />
            </p>
            <p className="text-xs text-slate-500">
              실무 해석: 페이딩이 없는 이진 채널의 가장 단순한 모델. hard-decision 후의 디지털 채널에 해당.
            </p>
          </div>
          <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
            <div className="font-bold text-indigo-700 mb-1">BEC (Binary Erasure Channel)</div>
            <p className="text-xs text-slate-600 mb-1">
              비트가 확률 <InlineMath math={String.raw`\epsilon`} />로 소거됩니다.
              용량: <InlineMath math={String.raw`C = 1 - \epsilon`} />
            </p>
            <p className="text-xs text-slate-500">
              실무 해석: 패킷 손실 네트워크, deep fade로 데이터가 사라지는 상황의 추상화.
            </p>
          </div>
        </div>

        <div className="formula-block mb-4">
          <h4 className="font-semibold text-blue-800 mb-2">용량 정의</h4>
          <BlockMath math={String.raw`C = \max_{p(x)} I(X; Y)`} />
          <p className="text-sm text-slate-600 mt-2">
            최적 입력 분포에서 단위 채널 사용당 신뢰 가능 정보량의 상한입니다.
          </p>
        </div>

        <div className="insight">
          <div className="insight-title">DMC에서 AWGN으로의 연결</div>
          <p className="text-sm text-amber-900">
            DMC는 추상적 모델이지만, 이후 B.4의 AWGN 용량은 이 프레임워크를 연속 채널로 확장한 것입니다.
            DMC의 상호정보량 최대화 문법이 그대로 유지됩니다.
          </p>
        </div>
      </div>

      {/* ───────── B.2 Entropy & MI ───────── */}
      <div id="appendix-b2" className="concept-card mb-8">
        <div className="text-xs font-semibold text-blue-600 mb-1">Appendix B.2</div>
        <h3 className="font-bold text-xl text-slate-800 mb-3">엔트로피와 상호정보량</h3>
        <p className="text-sm text-slate-600 mb-4">
          코딩 정리와 용량 수식의 공통 문법을 맞추는 구간입니다.
          불확실성과 정보 감소량을 정량화하는 핵심 지표입니다.
        </p>

        <div className="formula-block mb-4">
          <h4 className="font-semibold text-blue-800 mb-2">엔트로피와 조건부 엔트로피</h4>
          <BlockMath math={String.raw`H(X) = -\sum_x p(x)\log_2 p(x), \quad H(X|Y) = \sum_y p(y) H(X|Y=y)`} />
          <p className="text-sm text-slate-600 mt-2">
            엔트로피는 불확실성의 크기, 조건부 엔트로피는 관측 후 남는 불확실성입니다.
          </p>
        </div>

        <div className="formula-block mb-4">
          <h4 className="font-semibold text-blue-800 mb-2">상호정보량</h4>
          <BlockMath math={String.raw`I(X;Y) = H(X) - H(X|Y) = H(Y) - H(Y|X)`} />
          <p className="text-sm text-slate-600 mt-2">
            관측 <InlineMath math="Y" />가 <InlineMath math="X" />에 대해 얼마나 불확실성을 줄여주는지를 측정합니다.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
            <div className="font-bold text-emerald-700 mb-1">이진 엔트로피 함수</div>
            <BlockMath math={String.raw`h_2(p) = -p\log_2 p - (1-p)\log_2(1-p)`} />
            <p className="text-xs text-slate-500 mt-1">BSC/BEC 용량 계산의 기본 함수입니다.</p>
          </div>
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
            <div className="font-bold text-amber-700 mb-1">데이터 처리 부등식</div>
            <BlockMath math={String.raw`X \to Y \to Z \;\Rightarrow\; I(X;Z) \le I(X;Y)`} />
            <p className="text-xs text-slate-500 mt-1">후처리는 새로운 정보를 만들지 못합니다.</p>
          </div>
        </div>

        <div className="concept-card !bg-indigo-50 !border-indigo-200 mb-4">
          <h4 className="font-semibold text-indigo-800 mb-2">실무 해석: 엔트로피와 코딩</h4>
          <p className="text-sm text-slate-600 mb-2">
            엔트로피 <InlineMath math="H(X)" />는 송신 측이 전달해야 할 정보량의 하한이며,
            조건부 엔트로피 <InlineMath math="H(X|Y)" />는 수신 측이 복호 후에도 남은 불확실성입니다.
            상호정보량 <InlineMath math="I(X;Y)" />는 채널이 전달에 성공한 정보량이며,
            이것의 최대값이 곧 채널 용량입니다.
          </p>
          <p className="text-sm text-slate-600">
            데이터 처리 부등식은 "수신기에서 아무리 정교한 후처리를 해도,
            채널이 전달하지 못한 정보를 만들어낼 수 없다"는 원리입니다.
            이것이{' '}
            <button onClick={() => onNavigate('channel-uncertainty')} className="cross-ref !text-xs">
              3.5 채널 불확실성
            </button>
            에서 추정 오차가 성능 상한을 결정하는 이유와 직결됩니다.
          </p>
        </div>
      </div>

      {/* ───────── B.3 Coding Theorem ───────── */}
      <div id="appendix-b3" className="concept-card mb-8">
        <div className="text-xs font-semibold text-red-600 mb-1">Appendix B.3</div>
        <h3 className="font-bold text-xl text-slate-800 mb-3">잡음 채널 코딩 정리</h3>
        <p className="text-sm text-slate-600 mb-4">
          핵심 질문은 하나입니다.
          오류확률을 임의로 작게 만들 수 있는 최대 rate가 어디까지인가입니다.
        </p>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
            <div className="font-bold text-emerald-800 mb-2">Achievability (R &lt; C)</div>
            <p className="text-sm text-slate-600">
              블록길이 <InlineMath math="n" /> 증가에 따라{' '}
              <InlineMath math={String.raw`P_e \to 0`} />인 코드가 존재합니다.
              랜덤 코딩 논증으로 증명됩니다.
            </p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="font-bold text-red-800 mb-2">Converse (R &gt; C)</div>
            <p className="text-sm text-slate-600">
              어떤 코드/복호기도 <InlineMath math={String.raw`P_e \to 0`} />을 달성할 수 없습니다.
              Fano 부등식이 이를 정식화합니다.
            </p>
          </div>
        </div>

        <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 mb-4">
          <p className="text-sm text-amber-900">
            <strong>운영적 해석:</strong> 용량 <InlineMath math="C" />는 단순 계산식이 아니라
            "신뢰 통신이 가능한 영역과 불가능한 영역"의 경계선입니다.
            모든 부호 설계와 성능 목표가 이 경계를 기준으로 정리됩니다.
          </p>
        </div>

        <div className="concept-card !bg-rose-50 !border-rose-200 mb-4">
          <h4 className="font-semibold text-rose-800 mb-2">코딩 정리와 다이버시티의 연결</h4>
          <p className="text-sm text-slate-600">
            코딩 정리는 "충분히 긴 코드"가 존재한다고 보장하지만, 실제로 그 코드를 효율적으로
            만들고 복호하는 것은 별도의 공학 문제입니다.{' '}
            <button onClick={() => onNavigate('time-diversity')} className="cross-ref !text-xs">
              3.2 시간 다이버시티
            </button>
            에서 다룬 코딩 이득은 바로 이 정리가 보장하는 영역 안에서 실제 코드가 얼마나
            용량에 가까이 다가가는지의 문제입니다.
            반복 코딩은 용량의 <InlineMath math="1/L" />만 활용하지만, Turbo/LDPC 코드는
            용량에 매우 근접하면서 다이버시티를 유지합니다.
          </p>
        </div>
      </div>

      {/* ───────── B.4 AWGN Capacity ───────── */}
      <div id="appendix-b4" className="concept-card mb-8">
        <div className="text-xs font-semibold text-indigo-600 mb-1">Appendix B.4</div>
        <h3 className="font-bold text-xl text-slate-800 mb-3">AWGN 용량</h3>
        <p className="text-sm text-slate-600 mb-4">
          코딩 정리의 문법을 가장 많이 쓰이는 공학 공식으로 연결하는 구간입니다.
          대역폭 <InlineMath math="W" />인 AWGN 채널은 초당 대략{' '}
          <InlineMath math="2W" />개의 실수 차원으로 근사할 수 있습니다.
        </p>

        <div className="formula-block mb-4">
          <h4 className="font-semibold text-blue-800 mb-2">AWGN 용량식</h4>
          <BlockMath math={String.raw`C = W \log_2\!\left(1 + \frac{P}{N_0 W}\right) \quad \text{bits/s}`} />
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="font-bold text-blue-700 mb-1">저 SNR 영역</div>
            <p className="text-xs text-slate-600">대역폭 확대의 선형 이득이 큽니다.</p>
          </div>
          <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
            <div className="font-bold text-indigo-700 mb-1">고 SNR / 고정 대역폭</div>
            <p className="text-xs text-slate-600">전력 증가 이득이 로그 형태로 점점 둔화됩니다.</p>
          </div>
        </div>

        <div className="formula-block mb-4">
          <h4 className="font-semibold text-blue-800 mb-2">에너지 효율 한계</h4>
          <BlockMath math={String.raw`\frac{E_b}{N_0} \ge \ln 2 \approx -1.59\;\text{dB}`} />
          <p className="text-sm text-slate-600 mt-2">
            매우 낮은 spectral efficiency에서의 최소 에너지 비트 한계입니다.
            구현 문제가 아니라 정보이론적 바닥입니다.
          </p>
        </div>

        <div className="formula-block mb-4">
          <h4 className="font-semibold text-blue-800 mb-2">병렬 채널 확장 (Waterfilling)</h4>
          <BlockMath math={String.raw`C = \sum_k \log_2\!\left(1 + \frac{P_k}{N_k}\right)`} />
          <p className="text-sm text-slate-600 mt-2">
            독립 부채널의 용량은 개별 용량의 합이며, 최적 전력 배분은 waterfilling으로 귀결됩니다.
          </p>
        </div>
      </div>

      <CapacityComparison />

      {/* ───────── B.5 Sphere Packing ───────── */}
      <div id="appendix-b5" className="concept-card mb-8">
        <div className="text-xs font-semibold text-slate-600 mb-1">Appendix B.5</div>
        <h3 className="font-bold text-xl text-slate-800 mb-3">구면 패킹 해석</h3>
        <p className="text-sm text-slate-600 mb-4">
          고차원에서 코딩 문제는 "얼마나 많은 잡음 구를 겹치지 않게 배치할 수 있는가"로 바뀝니다.
          같은 용량 결과를 기하학적 직관으로 다시 봅니다.
        </p>

        <div className="grid md:grid-cols-3 gap-3 mb-4">
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 text-sm">
            <div className="font-bold text-blue-700 mb-1">신호 구</div>
            <div className="text-slate-600">전력 제약 아래 코드워드가 존재하는 큰 구</div>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 text-sm">
            <div className="font-bold text-amber-700 mb-1">잡음 구</div>
            <div className="text-slate-600">각 코드워드 주변 AWGN 불확실성 영역</div>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100 text-sm">
            <div className="font-bold text-emerald-700 mb-1">신뢰 복호</div>
            <div className="text-slate-600">잡음 구 겹침이 매우 작아야 함</div>
          </div>
        </div>

        <div className="formula-block mb-4">
          <h4 className="font-semibold text-blue-800 mb-2">Converse 부피 비율 상계</h4>
          <BlockMath math={String.raw`M \lesssim \left(1 + \frac{P}{N_0}\right)^{n/2}`} />
          <p className="text-sm text-slate-600 mt-2">
            로그/차원 정규화하면 AWGN 용량 경계 <InlineMath math={String.raw`C = \frac{1}{2}\log(1+\text{SNR})`} />가 자연스럽게 나옵니다.
          </p>
        </div>

        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
          <h4 className="font-semibold text-slate-800 mb-2">실무 해석 3가지</h4>
          <ol className="text-sm text-slate-600 list-decimal list-inside space-y-1">
            <li>왜 rate가 <InlineMath math={String.raw`\log(1+\text{SNR})`} />로 증가하는가</li>
            <li>왜 블록길이가 길수록 신뢰도가 좋아지는가</li>
            <li>왜 용량 초과 rate는 디코더를 바꿔도 근본적으로 실패하는가</li>
          </ol>
        </div>
      </div>

      {/* ───────── B.1~B.5 통합 요약 ───────── */}
      <div className="concept-card mb-8">
        <h3 className="font-bold text-lg text-slate-800 mb-3">B.1~B.5 통합: 정보이론 도구 체인</h3>
        <p className="text-sm text-slate-600 mb-4">
          Appendix B의 다섯 가지 도구는 하나의 논리적 흐름을 이룹니다.
          각 단계가 다음 단계의 전제가 되며, 최종적으로 AWGN 용량이라는 공학적 결론에 도달합니다.
        </p>
        <div className="compare-grid mb-4">
          <div className="compare-item border-emerald-200 bg-emerald-50/40">
            <h4 className="font-bold text-emerald-800 mb-2">추상 → 구체</h4>
            <ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
              <li>B.1 DMC: 채널의 수학적 추상화</li>
              <li>B.2 엔트로피: 정보량의 정량화 문법</li>
              <li>B.3 코딩 정리: 신뢰 통신의 존재 보장</li>
            </ul>
          </div>
          <div className="compare-item border-blue-200 bg-blue-50/40">
            <h4 className="font-bold text-blue-800 mb-2">이론 → 공학</h4>
            <ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
              <li>B.4 AWGN 용량: 실제 채널의 성능 상한</li>
              <li>B.5 구면 패킹: 기하학적 직관</li>
              <li>최종: SNR과 대역폭으로 달성 가능한 rate 계산</li>
            </ul>
          </div>
        </div>
        <div className="p-4 bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-xl">
          <p className="text-sm text-slate-700">
            <strong>핵심 연결:</strong>{' '}
            DMC 문법(B.1) 위에 엔트로피(B.2)를 정의하고,
            코딩 정리(B.3)가 경계를 증명하며,
            AWGN(B.4)이 구체적 수치를 제공하고,
            구면 패킹(B.5)이 기하학적 이해를 완성합니다.
          </p>
        </div>
      </div>

      <div className="concept-card mb-6" id="appendix-b-check">
        <h3 className="font-bold text-lg text-slate-800 mb-3">Appendix B 완료 체크리스트</h3>
        <ul className="text-sm text-slate-700 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">&#10003;</span>
            <span>DMC 용량과 AWGN 용량을 같은 상호정보량 문법으로 설명할 수 있는가</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">&#10003;</span>
            <span>코딩 정리의 Achievability/Converse를 운영적으로 해석할 수 있는가</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">&#10003;</span>
            <span>구면 패킹과 코딩 정리를 같은 경계의 두 표현으로 연결할 수 있는가</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">&#10003;</span>
            <span>B.1~B.5의 흐름(추상→구체, 이론→공학)을 한 문장으로 설명할 수 있는가</span>
          </li>
        </ul>
      </div>

      {/* ───────── Final Insight with Connection Chain ───────── */}
      <div className="insight mb-0">
        <div className="insight-title">Chapter 3 전체 연결 체인</div>
        <p className="text-sm text-amber-900 mb-3">
          Chapter 3의 학습 경로가 완성됩니다. 각 단계가 이전 단계의 결과에 의존하며 하나의 흐름을 이룹니다.
        </p>
        <div className="flex flex-wrap items-center gap-1 text-sm text-amber-900 mb-3">
          <button onClick={() => onNavigate('detection')} className="cross-ref !text-xs">
            3.1 검출
          </button>
          <span>→</span>
          <button onClick={() => onNavigate('time-diversity')} className="cross-ref !text-xs">
            3.2 시간
          </button>
          <span>→</span>
          <button onClick={() => onNavigate('antenna-diversity')} className="cross-ref !text-xs">
            3.3 공간
          </button>
          <span>→</span>
          <button onClick={() => onNavigate('frequency-diversity')} className="cross-ref !text-xs">
            3.4 주파수
          </button>
          <span>→</span>
          <button onClick={() => onNavigate('channel-uncertainty')} className="cross-ref !text-xs">
            3.5 CSI
          </button>
          <span>→</span>
          <button onClick={() => onNavigate('ch3-main-plot')} className="cross-ref !text-xs">
            3.6 Main Plot
          </button>
          <span>→</span>
          <span className="font-bold">Appendix B 정보이론</span>
        </div>
        <p className="text-sm text-amber-900 mb-2">
          검출 한계가 다이버시티 필요성을 만들고, 세 축의 다이버시티가 신뢰도를 확보하며,
          CSI 불확실성이 실질 성능 상한을 결정합니다.
          Appendix B의 정보이론은 이 모든 과정의 이론적 바닥을 제공합니다.
        </p>
        <p className="text-sm text-amber-900">
          다시 점검하고 싶다면{' '}
          <button onClick={() => onNavigate('ch3-main-plot')} className="cross-ref !text-xs">
            3.6 Main Plot
          </button>
          에서 설계 체인을 직접 구성해보세요.
          Chapter 2의 기초가 필요하면{' '}
          <button onClick={() => onNavigate('appendix-a')} className="cross-ref !text-xs">
            Ch.2 Appendix A
          </button>
          의 검출·추정 내용과 교차 참조하세요.
        </p>
      </div>
    </section>
  );
}
