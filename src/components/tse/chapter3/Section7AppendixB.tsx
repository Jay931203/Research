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
        Appendix B: Information Theory Background (B.1~B.5)
      </h2>

      <p className="text-lg text-slate-600 leading-relaxed mb-8">
        Appendix B는 Chapter 3의 coding, diversity, capacity 논의를 정보이론 언어로 받쳐 주는 부분입니다.
        DMC로 채널을 추상화하고, entropy와 mutual information으로 정보량을 재며,
        noisy channel coding theorem과 AWGN capacity, sphere-packing 직관으로
        "어떤 rate까지 reliable communication이 가능한가"를 정리합니다.
      </p>

      <div id="appendix-b1" className="concept-card mb-8">
        <div className="text-xs font-semibold text-emerald-600 mb-1">Appendix B.1</div>
        <h3 className="font-bold text-xl text-slate-800 mb-3">Discrete Memoryless Channels</h3>
        <p className="text-sm text-slate-600 mb-4">
          Discrete memoryless channel(DMC)은 입력과 출력 alphabet이 이산이고,
          각 channel use의 잡음이 과거 입력/출력에 의존하지 않는 모델입니다.
          물리 채널은 연속값이지만, coding theorem을 설명하는 가장 기본적인 추상화입니다.
        </p>

        <div className="formula-block mb-4">
          <h4 className="font-semibold text-blue-800 mb-2">DMC 법칙</h4>
          <BlockMath math={String.raw`X_i \in \mathcal{X},\quad Y_i \in \mathcal{Y},\qquad p(y^n|x^n)=\prod_{i=1}^{n}p(y_i|x_i)`} />
          <p className="text-sm text-slate-600 mt-2">
            Memoryless라는 말은 <InlineMath math="i" />번째 출력이 같은 시점의 입력
            <InlineMath math="x_i" />에만 통계적으로 의존한다는 뜻입니다.
            그래서 긴 block code의 분석을 single-letter mutual information으로 줄일 수 있습니다.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
            <div className="font-bold text-emerald-700 mb-1">Codebook</div>
            <BlockMath math={String.raw`\mathcal{C}=\{\mathbf{x}_1,\dots,\mathbf{x}_M\},\qquad R=\frac{1}{n}\log_2 M`} />
            <p className="text-xs text-slate-600">
              <InlineMath math="M" />개의 메시지를 길이 <InlineMath math="n" /> codeword로 표현하면,
              channel use당 rate는 <InlineMath math="R" /> bits/use입니다.
            </p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="font-bold text-blue-700 mb-1">Reliable Communication</div>
            <BlockMath math={String.raw`P_e = \mathbb{P}\{\hat M \ne M\}`} />
            <p className="text-xs text-slate-600">
              임의의 <InlineMath math={String.raw`\epsilon>0`} />에 대해 충분히 큰
              <InlineMath math="n" />에서 <InlineMath math={String.raw`P_e<\epsilon`} />을 만들 수 있으면
              해당 rate는 reliable합니다.
            </p>
          </div>
        </div>

        <div className="formula-block mb-4">
          <h4 className="font-semibold text-blue-800 mb-2">Capacity의 operational 정의</h4>
          <BlockMath math={String.raw`C = \sup\{R:\; \exists \text{ codes with } P_e^{(n)}\to 0\}`} />
          <p className="text-sm text-slate-600 mt-2">
            Capacity는 단순한 수식값이 아니라, 오류 확률을 임의로 작게 만들 수 있는 최대 통신 rate입니다.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="font-bold text-slate-700 mb-1">BSC</div>
            <BlockMath math={String.raw`C = 1-h_2(p),\qquad h_2(p)=-p\log_2p-(1-p)\log_2(1-p)`} />
            <p className="text-xs text-slate-600">
              각 bit가 확률 <InlineMath math="p" />로 뒤집히는 hard-decision 채널입니다.
            </p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="font-bold text-slate-700 mb-1">BEC</div>
            <BlockMath math={String.raw`C = 1-\epsilon`} />
            <p className="text-xs text-slate-600">
              수신기가 어떤 symbol이 지워졌는지 정확히 아는 erasure 채널입니다.
            </p>
          </div>
        </div>
      </div>

      <div id="appendix-b2" className="concept-card mb-8">
        <div className="text-xs font-semibold text-blue-600 mb-1">Appendix B.2</div>
        <h3 className="font-bold text-xl text-slate-800 mb-3">
          Entropy, Conditional Entropy, and Mutual Information
        </h3>
        <p className="text-sm text-slate-600 mb-4">
          Entropy는 불확실성의 양, conditional entropy는 관측 후 남는 불확실성,
          mutual information은 관측이 줄여 준 불확실성입니다.
          Coding theorem의 모든 rate 경계는 이 세 가지 양으로 표현됩니다.
        </p>

        <div className="formula-block mb-4">
          <h4 className="font-semibold text-blue-800 mb-2">Entropy와 Binary Entropy</h4>
          <BlockMath math={String.raw`H(X)=\sum_{x\in\mathcal{X}}p(x)\log_2\frac{1}{p(x)}=-\sum_x p(x)\log_2p(x)`} />
          <BlockMath math={String.raw`h_2(p)=-p\log_2p-(1-p)\log_2(1-p)`} />
          <p className="text-sm text-slate-600 mt-2">
            <InlineMath math="X" />가 deterministic이면 <InlineMath math={String.raw`H(X)=0`} />이고,
            같은 alphabet 크기에서는 uniform distribution이 entropy를 최대화합니다.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="font-bold text-blue-700 mb-2">Joint / Conditional Entropy</div>
            <BlockMath math={String.raw`H(X,Y)=\sum_{x,y}p(x,y)\log_2\frac{1}{p(x,y)}`} />
            <BlockMath math={String.raw`H(X|Y)=\sum_y p(y)H(X|Y=y)`} />
          </div>
          <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
            <div className="font-bold text-indigo-700 mb-2">Chain Rule</div>
            <BlockMath math={String.raw`H(X,Y)=H(X)+H(Y|X)=H(Y)+H(X|Y)`} />
            <BlockMath math={String.raw`I(X_1,X_2;Y)=I(X_1;Y)+I(X_2;Y|X_1)`} />
          </div>
        </div>

        <div className="formula-block mb-4">
          <h4 className="font-semibold text-blue-800 mb-2">Mutual Information</h4>
          <BlockMath math={String.raw`I(X;Y)=H(X)-H(X|Y)=H(Y)-H(Y|X)`} />
          <BlockMath math={String.raw`I(X;Y|Z)=H(X|Z)-H(X|Y,Z)`} />
          <p className="text-sm text-slate-600 mt-2">
            <InlineMath math={String.raw`I(X;Y)`} />는 수신 출력 <InlineMath math="Y" />가 입력
            <InlineMath math="X" />에 대해 제공하는 평균 정보량입니다.
            Capacity는 입력 분포를 최적화한 mutual information입니다.
          </p>
        </div>

        <div className="concept-card !bg-indigo-50 !border-indigo-200 mb-4">
          <h4 className="font-semibold text-indigo-800 mb-2">통신적 해석</h4>
          <p className="text-sm text-slate-600">
            <InlineMath math="H(M)" />은 송신 메시지의 불확실성,
            <InlineMath math={String.raw`H(M|Y^n)`} />은 수신 후에도 남은 불확실성입니다.
            Reliable communication에서는 <InlineMath math={String.raw`H(M|Y^n)`} />이 0에 가까워져야 하므로,
            수신 신호가 전달한 정보량 <InlineMath math={String.raw`I(M;Y^n)`} />이 거의
            <InlineMath math={String.raw`H(M)=nR`} />에 도달해야 합니다.
          </p>
        </div>
      </div>

      <div id="appendix-b3" className="concept-card mb-8">
        <div className="text-xs font-semibold text-red-600 mb-1">Appendix B.3</div>
        <h3 className="font-bold text-xl text-slate-800 mb-3">Noisy Channel Coding Theorem</h3>
        <p className="text-sm text-slate-600 mb-4">
          핵심 질문은 하나입니다. 잡음이 있는 DMC에서 block length를 충분히 키우면,
          오류 확률을 0에 가깝게 만들 수 있는 최대 rate는 어디까지인가?
        </p>

        <div className="formula-block mb-4">
          <h4 className="font-semibold text-blue-800 mb-2">Reliable communication과 조건부 entropy</h4>
          <BlockMath math={String.raw`H(M|Y^n)\approx 0 \quad \Rightarrow \quad nR=H(M)\approx I(M;Y^n)`} />
          <BlockMath math={String.raw`R \lesssim \frac{1}{n} I(X^n;Y^n)`} />
          <p className="text-sm text-slate-600 mt-2">
            수신 후 메시지 불확실성이 거의 없어야 하므로,
            codeword 전체가 채널을 통해 전달하는 mutual information이 rate를 상한합니다.
          </p>
        </div>

        <div className="formula-block mb-4">
          <h4 className="font-semibold text-blue-800 mb-2">Single-letter upper bound</h4>
          <BlockMath math={String.raw`\frac{1}{n}I(X^n;Y^n) \le \max_{p(x)} I(X;Y)`} />
          <p className="text-sm text-slate-600 mt-2">
            DMC에서는 memoryless 구조와 chain rule 덕분에 긴 block의 복잡한 최적화가
            single-symbol 입력 분포 최적화로 내려옵니다.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
            <div className="font-bold text-emerald-800 mb-2">Achievability</div>
            <p className="text-sm text-slate-600">
              <InlineMath math={String.raw`R<C`} />이면 충분히 큰
              <InlineMath math="n" />에서 <InlineMath math={String.raw`P_e^{(n)}\to0`} />인 code가 존재합니다.
              Shannon의 증명은 random coding으로 "좋은 code가 존재함"을 보입니다.
            </p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="font-bold text-red-800 mb-2">Converse</div>
            <p className="text-sm text-slate-600">
              <InlineMath math={String.raw`R>C`} />이면 어떤 code와 decoder도
              오류 확률을 0으로 보낼 수 없습니다.
              Capacity는 구현 방식의 문제가 아니라 정보이론적 경계입니다.
            </p>
          </div>
        </div>

        <div className="formula-block mb-4">
          <h4 className="font-semibold text-blue-800 mb-2">Noisy Channel Coding Theorem</h4>
          <BlockMath math={String.raw`C=\max_{p(x)}I(X;Y)`} />
          <p className="text-sm text-slate-600 mt-2">
            DMC의 capacity는 입력 분포를 최적으로 고른 single-letter mutual information입니다.
            이 정리는 BSC/BEC뿐 아니라 AWGN capacity 유도에도 같은 논리로 확장됩니다.
          </p>
        </div>

        <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 mb-4">
          <h4 className="font-semibold text-amber-800 mb-2">Operational Interpretation</h4>
          <p className="text-sm text-slate-700">
            입력 symbol을 i.i.d.로 보내는 것만으로 capacity가 달성되는 것은 아닙니다.
            Coding은 메시지를 긴 sequence 공간에 배치해서,
            잡음이 흔들어도 서로 다른 codeword의 typical output cloud가 겹치지 않게 만드는 작업입니다.
            이 관점은 B.5의 sphere-packing 그림으로 이어집니다.
          </p>
        </div>

        <div className="concept-card !bg-rose-50 !border-rose-200">
          <h4 className="font-semibold text-rose-800 mb-2">Chapter 3와의 연결</h4>
          <p className="text-sm text-slate-600">
            <button onClick={() => onNavigate('time-diversity')} className="cross-ref !text-xs">
              3.2 시간 다이버시티
            </button>
            에서 본 repetition, rotation, interleaving은 모두 channel coding theorem이 말하는
            "긴 block에서 오류 확률을 작게 만드는 구조"를 fading channel에 맞게 구체화한 예입니다.
          </p>
        </div>
      </div>

      <div id="appendix-b4" className="concept-card mb-8">
        <div className="text-xs font-semibold text-indigo-600 mb-1">Appendix B.4</div>
        <h3 className="font-bold text-xl text-slate-800 mb-3">Formal Derivation of AWGN Capacity</h3>
        <p className="text-sm text-slate-600 mb-4">
          AWGN 채널은 입력과 출력이 연속값이므로 entropy 대신 differential entropy를 씁니다.
          통신은 여전히 digital message를 보내는 문제이고, 연속값 채널은 가능한 constellation을 제한하지 않는 모델입니다.
        </p>

        <div className="formula-block mb-4">
          <h4 className="font-semibold text-blue-800 mb-2">Differential Entropy</h4>
          <BlockMath math={String.raw`h(X)=\int f_X(x)\log_2\frac{1}{f_X(x)}\,dx`} />
          <BlockMath math={String.raw`h(X|Y)=\int f_{X,Y}(x,y)\log_2\frac{1}{f_{X|Y}(x|y)}\,dx\,dy`} />
          <BlockMath math={String.raw`I(X;Y)=h(X)-h(X|Y)=h(Y)-h(Y|X)`} />
        </div>

        <div className="formula-block mb-4">
          <h4 className="font-semibold text-blue-800 mb-2">Real AWGN Channel</h4>
          <BlockMath math={String.raw`Y=X+W,\qquad W\sim\mathcal{N}(0,\sigma^2),\qquad \mathbb{E}[X^2]\le P`} />
          <BlockMath math={String.raw`h(Y|X)=h(W)=\frac{1}{2}\log_2(2\pi e\sigma^2)`} />
          <p className="text-sm text-slate-600 mt-2">
            전력 제약 때문에 <InlineMath math={String.raw`\mathrm{Var}(Y)\le P+\sigma^2`} />이고,
            같은 variance에서 differential entropy를 최대화하는 분포는 Gaussian입니다.
          </p>
          <BlockMath math={String.raw`h(Y)\le \frac{1}{2}\log_2(2\pi e(P+\sigma^2))`} />
          <BlockMath math={String.raw`C=\max_{f_X:\mathbb{E}[X^2]\le P}I(X;Y)=\frac{1}{2}\log_2\!\left(1+\frac{P}{\sigma^2}\right)`} />
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
            <div className="font-bold text-indigo-700 mb-1">Capacity-achieving input</div>
            <p className="text-sm text-slate-600">
              Codeword 성분을 i.i.d. <InlineMath math={String.raw`\mathcal{N}(0,P)`} />에서 뽑는 random coding이
              AWGN capacity를 달성하는 분포입니다.
            </p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="font-bold text-blue-700 mb-1">Complex AWGN</div>
            <BlockMath math={String.raw`Y=X+W,\quad W\sim\mathcal{CN}(0,N_0),\qquad C=\log_2\!\left(1+\frac{P}{N_0}\right)`} />
            <p className="text-xs text-slate-600">bits per complex dimension 기준입니다.</p>
          </div>
        </div>

        <div className="formula-block mb-4">
          <h4 className="font-semibold text-blue-800 mb-2">Bandlimited AWGN</h4>
          <BlockMath math={String.raw`C = W\log_2\!\left(1+\frac{P}{N_0W}\right)\quad \text{bits/s}`} />
          <p className="text-sm text-slate-600 mt-2">
            Chapter 5의 capacity 분석은 이 식을 fading, parallel channel, waterfilling으로 확장합니다.
          </p>
        </div>
      </div>

      <CapacityComparison />

      <div id="appendix-b5" className="concept-card mb-8">
        <div className="text-xs font-semibold text-slate-600 mb-1">Appendix B.5</div>
        <h3 className="font-bold text-xl text-slate-800 mb-3">Sphere-packing Interpretation</h3>
        <p className="text-sm text-slate-600 mb-4">
          AWGN capacity는 고차원 기하학으로도 볼 수 있습니다.
          길이 <InlineMath math="N" /> codeword를 <InlineMath math="N" />차원 공간의 점으로 생각하면,
          reliable decoding은 잡음으로 생기는 sphere들이 서로 거의 겹치지 않게 codeword를 배치하는 문제입니다.
        </p>

        <div className="grid md:grid-cols-3 gap-3 mb-4">
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 text-sm">
            <div className="font-bold text-blue-700 mb-1">x-sphere</div>
            <div className="text-slate-600">
              전력 제약 아래 codeword들이 놓이는 반지름 <InlineMath math={String.raw`\sqrt{NP}`} />의 영역
            </div>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 text-sm">
            <div className="font-bold text-amber-700 mb-1">noise sphere</div>
            <div className="text-slate-600">
              잡음 벡터가 전형적으로 놓이는 반지름 <InlineMath math={String.raw`\sqrt{N\sigma^2}`} />의 영역
            </div>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100 text-sm">
            <div className="font-bold text-emerald-700 mb-1">y-sphere</div>
            <div className="text-slate-600">
              수신 벡터가 놓이는 반지름 <InlineMath math={String.raw`\sqrt{N(P+\sigma^2)}`} />의 영역
            </div>
          </div>
        </div>

        <div className="formula-block mb-4">
          <h4 className="font-semibold text-blue-800 mb-2">Upper Bound: noise sphere를 y-sphere에 packing</h4>
          <BlockMath math={String.raw`M \cdot V_w \lesssim V_y`} />
          <BlockMath math={String.raw`\frac{1}{N}\log_2 M \lesssim \frac{1}{N}\log_2\frac{V_y}{V_w} \to \frac{1}{2}\log_2\!\left(1+\frac{P}{\sigma^2}\right)`} />
          <p className="text-sm text-slate-600 mt-2">
            수신 sphere 안에 서로 겹치지 않는 noise sphere를 몇 개 넣을 수 있는지가
            구별 가능한 codeword 수의 상한을 줍니다.
          </p>
        </div>

        <div className="formula-block mb-4">
          <h4 className="font-semibold text-blue-800 mb-2">Achievability: uncertainty sphere</h4>
          <BlockMath math={String.raw`\alpha=\frac{P}{P+\sigma^2},\qquad \hat{\mathbf{x}}=\alpha\mathbf{y}`} />
          <BlockMath math={String.raw`\mathbf{x}\mid\mathbf{y} \text{ is concentrated in a sphere of radius } \sqrt{N\frac{P\sigma^2}{P+\sigma^2}}`} />
          <BlockMath math={String.raw`p \approx \left(\frac{\sigma^2}{P+\sigma^2}\right)^{N/2}`} />
          <p className="text-sm text-slate-600 mt-2">
            다른 random codeword가 이 uncertainty sphere 안에 들어올 확률이 <InlineMath math="p" />이면,
            union bound로 오류 확률은 대략 <InlineMath math={String.raw`(M-1)p`} /> 이하입니다.
            <InlineMath math={String.raw`M\ll 1/p`} />가 되도록 rate를 고르면 reliable communication이 가능합니다.
          </p>
        </div>

        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 mb-4">
          <h4 className="font-semibold text-slate-800 mb-2">두 가지 sphere 해석의 같은 결론</h4>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="p-3 bg-white rounded-lg border border-slate-100">
              <div className="font-semibold text-slate-700 mb-1">y-sphere / noise sphere</div>
              <BlockMath math={String.raw`I(X;Y)=h(Y)-h(Y|X)`} />
            </div>
            <div className="p-3 bg-white rounded-lg border border-slate-100">
              <div className="font-semibold text-slate-700 mb-1">x-sphere / uncertainty sphere</div>
              <BlockMath math={String.raw`I(X;Y)=h(X)-h(X|Y)`} />
            </div>
          </div>
          <p className="text-sm text-slate-600 mt-3">
            하나는 수신 공간에서 noise cloud를 packing하는 관점이고,
            다른 하나는 수신값을 본 뒤 송신 codeword가 남아 있을 수 있는 uncertainty를 제거하는 관점입니다.
            둘 다 같은 mutual information 경계로 수렴합니다.
          </p>
        </div>
      </div>

      <div className="concept-card mb-8">
        <h3 className="font-bold text-lg text-slate-800 mb-3">B.1~B.5 통합: 정보이론 도구 체인</h3>
        <div className="compare-grid mb-4">
          <div className="compare-item border-emerald-200 bg-emerald-50/40">
            <h4 className="font-bold text-emerald-800 mb-2">추상화에서 정리까지</h4>
            <ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
              <li>B.1 DMC: 채널과 codebook을 수학적으로 모델링</li>
              <li>B.2 Entropy/MI: 불확실성과 정보량을 정량화</li>
              <li>B.3 Coding theorem: reliable rate의 경계를 증명</li>
            </ul>
          </div>
          <div className="compare-item border-blue-200 bg-blue-50/40">
            <h4 className="font-bold text-blue-800 mb-2">정리에서 AWGN 공학식까지</h4>
            <ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
              <li>B.4 AWGN capacity: Gaussian channel의 closed form 도출</li>
              <li>B.5 Sphere packing: capacity를 고차원 geometry로 해석</li>
              <li>최종: SNR, bandwidth, coding block length가 성능을 결정</li>
            </ul>
          </div>
        </div>
        <div className="p-4 bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-xl">
          <p className="text-sm text-slate-700">
            <strong>한 문장 요약:</strong>{' '}
            Appendix B는 "채널이 평균적으로 얼마나 많은 불확실성을 줄여 주는가"를
            <InlineMath math="I(X;Y)" />로 재고, 그 양만큼의 rate는 충분히 긴 coding으로 reliable하게 보낼 수 있으며,
            AWGN에서는 그 값이 <InlineMath math={String.raw`\frac{1}{2}\log_2(1+\mathrm{SNR})`} /> 또는
            <InlineMath math={String.raw`\log_2(1+\mathrm{SNR})`} />로 나타난다는 이야기입니다.
          </p>
        </div>
      </div>

      <div className="concept-card mb-6" id="appendix-b-check">
        <h3 className="font-bold text-lg text-slate-800 mb-3">Appendix B 완료 체크리스트</h3>
        <ul className="text-sm text-slate-700 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">&#10003;</span>
            <span>DMC의 memoryless 조건이 왜 single-letter capacity로 이어지는지 설명할 수 있는가</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">&#10003;</span>
            <span>Entropy, conditional entropy, mutual information의 operational 의미를 구분할 수 있는가</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">&#10003;</span>
            <span>Noisy channel coding theorem의 achievability와 converse를 말로 설명할 수 있는가</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">&#10003;</span>
            <span>AWGN capacity 유도에서 Gaussian input이 왜 최적인지 설명할 수 있는가</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">&#10003;</span>
            <span>Sphere-packing 해석이 capacity 식과 어떻게 같은 결론을 주는지 연결할 수 있는가</span>
          </li>
        </ul>
      </div>

      <div className="insight mb-0">
        <div className="insight-title">Chapter 3 전체 연결 체인</div>
        <p className="text-sm text-amber-900 mb-3">
          Chapter 3의 detection과 diversity는 오류 확률을 낮추는 구체적인 physical-layer 설계입니다.
          Appendix B는 그 설계들이 궁극적으로 capacity와 mutual information이라는 한계 안에서 움직인다는
          이론적 바닥을 제공합니다.
        </p>
        <div className="flex flex-wrap items-center gap-1 text-sm text-amber-900 mb-3">
          <button onClick={() => onNavigate('detection')} className="cross-ref !text-xs">3.1 Detection</button>
          <span>→</span>
          <button onClick={() => onNavigate('time-diversity')} className="cross-ref !text-xs">3.2 Time</button>
          <span>→</span>
          <button onClick={() => onNavigate('antenna-diversity')} className="cross-ref !text-xs">3.3 Antenna</button>
          <span>→</span>
          <button onClick={() => onNavigate('frequency-diversity')} className="cross-ref !text-xs">3.4 Frequency</button>
          <span>→</span>
          <button onClick={() => onNavigate('channel-uncertainty')} className="cross-ref !text-xs">3.5 CSI</button>
          <span>→</span>
          <button onClick={() => onNavigate('ch3-main-plot')} className="cross-ref !text-xs">3.6 Main Plot</button>
          <span>→</span>
          <span className="font-bold">Appendix B Info Theory</span>
        </div>
        <p className="text-sm text-amber-900">
          다시 전체 구조를 보고 싶으면{' '}
          <button onClick={() => onNavigate('ch3-main-plot')} className="cross-ref !text-xs">
            3.6 Main Plot
          </button>
          에서 설계 체인을 확인하고, 검출/추정 수학이 필요하면{' '}
          <button onClick={() => onNavigate('appendix-a')} className="cross-ref !text-xs">
            Appendix A
          </button>
          로 돌아가면 됩니다.
        </p>
      </div>
    </section>
  );
}
