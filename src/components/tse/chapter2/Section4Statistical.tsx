'use client';

import { BlockMath, InlineMath } from 'react-katex';
import FadingDistribution from '@/components/tse/interactive/FadingDistribution';
import FadingSimulator from '@/components/tse/interactive/FadingSimulator';

interface Section4Props {
  onNavigate: (id: string) => void;
}

export default function Section4Statistical({ onNavigate }: Section4Props) {
  return (
    <section id="statistical" className="section-card transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <span className="badge badge-amber">Intermediate</span>
        <span className="text-sm text-slate-400">Section 5</span>
      </div>

      <h2 className="text-3xl font-bold text-slate-900 mb-4">2.4 Statistical Channel Models</h2>

      <p className="text-lg text-slate-600 leading-relaxed mb-6">
        채널 탭의 정확한 값을 매 순간 알 수는 없으므로, 확률과 상관함수로 모델링합니다.
        핵심 질문은 "채널이 얼마나 자주, 얼마나 심하게 나빠지는가"이며,
        이에 대한 답이 outage 분석과 링크 적응 설계를 가능하게 합니다.
        코히런스 파라미터가 채널의 선택성 구조를 정했다면,
        여기서는 각 탭의 <strong>분포</strong>와 <strong>시간 상관</strong>을 구체화합니다.
      </p>

      <div className="concept-card mb-8">
        <h3 className="font-bold text-lg text-slate-800 mb-2">2.4.1 Modeling philosophy</h3>
        <p className="text-sm text-slate-600 mb-3">
          다중경로 환경에서 수많은 산란 경로가 합성되면, 중심극한정리(CLT)에 의해
          각 탭의 복소 계수가 가우시안 분포에 수렴합니다.
          이것이 통계 모델링의 물리적 근거입니다.
        </p>
        <ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
          <li>탭 계수 <InlineMath math={String.raw`h_\ell[m]`} />를 <strong>원형대칭 복소 가우시안 과정</strong>으로 근사</li>
          <li>서로 다른 지연 빈의 탭은 독립으로, 같은 탭의 시간 상관은 도플러 스펙트럼으로 모델링</li>
          <li>목표: 개별 경로를 모르더라도 파일럿 설계, 링크 적응, outage 분석이 가능하도록 함</li>
        </ul>
      </div>

      <div className="compare-grid mb-8">
        <div className="compare-item border-blue-200 bg-blue-50/50">
          <h3 className="font-bold text-xl text-blue-800 mb-3">Rayleigh Fading</h3>
          <span className="badge badge-blue mb-3">NLOS 중심</span>
          <p className="text-sm text-slate-600 mb-3">
            지배적 LOS 성분이 없고 다수의 산란 경로가 독립적으로 합성되는 경우입니다.
            CLT에 의해 I/Q 성분이 각각 가우시안이 되고,
            그 크기(envelope)가 Rayleigh 분포를 따릅니다. deep fade가 빈번한 환경입니다.
          </p>
          <div className="formula-block !my-2 !p-3">
            <BlockMath math={String.raw`f_R(r)=\frac{r}{\sigma^2}e^{-r^2/(2\sigma^2)},\quad r\ge0`} />
          </div>
          <div className="text-xs text-slate-500">deep fade가 빈번해 outage 민감도가 큽니다.</div>
        </div>

        <div className="compare-item border-red-200 bg-red-50/50">
          <h3 className="font-bold text-xl text-red-800 mb-3">Rician Fading</h3>
          <span className="badge badge-green mb-3">LOS + NLOS</span>
          <p className="text-sm text-slate-600 mb-3">
            강한 LOS 성분과 산란 성분이 공존하는 경우입니다.
            LOS가 안정적인 기준 성분 역할을 하므로 페이딩 심도가 줄어들며,
            K-factor가 클수록 채널이 안정적입니다.
          </p>
          <div className="formula-block !my-2 !p-3">
            <BlockMath math={String.raw`K=\frac{\text{LOS power}}{\text{NLOS power}}`} />
          </div>
          <div className="text-xs text-slate-500">K가 커질수록 Rayleigh에서 AWGN에 가까워집니다.</div>
        </div>
      </div>

      <div className="concept-card mb-8" id="k-factor">
        <h3 className="font-bold text-lg text-slate-800 mb-3">2.4.2 Rayleigh/Rician의 연결</h3>
        <div className="grid md:grid-cols-3 gap-3 text-sm">
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div className="font-bold text-blue-700">K = 0</div>
            <div className="text-slate-600">순수 Rayleigh</div>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
            <div className="font-bold text-amber-700">K = 5~10 dB</div>
            <div className="text-slate-600">일반적 Rician</div>
          </div>
          <div className="p-3 bg-green-50 rounded-lg border border-green-100">
            <div className="font-bold text-green-700">K → ∞</div>
            <div className="text-slate-600">거의 비페이딩</div>
          </div>
        </div>
      </div>

      <FadingDistribution />

      <div className="concept-card mt-8 mb-8" id="tap-autocorr">
        <h3 className="font-bold text-lg text-slate-800 mb-3">2.4.3 Tap gain autocorrelation (Clarke/Jakes)</h3>
        <BlockMath math={String.raw`R_{h_\ell}[\Delta m]=\mathbb{E}[h_\ell[m]h_\ell^*[m+\Delta m]]`} />
        <BlockMath math={String.raw`R_{h_\ell}(\Delta t)\propto J_0(2\pi f_D\Delta t)`} />
        <p className="text-sm text-slate-600 mt-2">
          Clarke/Jakes 모델은 도래각이 수평면에서 균일하게 분포한다고 가정할 때의 시간 상관함수입니다.
          <InlineMath math={String.raw`J_0`} />는 0차 베셀 함수로, <InlineMath math={String.raw`\Delta t`} />가 커질수록
          상관이 감소하여 결국 0에 수렴합니다.
          이 상관함수의 폭이 곧 채널 예측 가능 시간이며, <strong>파일럿 재전송 주기</strong>를 결정합니다.
          아래 시뮬레이터에서 도플러에 따른 페이딩 시간 패턴을 직접 확인할 수 있습니다.
        </p>
      </div>

      <div className="concept-card mb-8" id="outage-prob">
        <h3 className="font-bold text-lg text-slate-800 mb-3">Outage 확률 관점</h3>
        <p className="text-sm text-slate-600 mb-3">
          페이딩 채널에서 수신 SNR이 임계값 이하로 떨어지면 통신이 끊기는데,
          이 사건이 발생할 확률이 <strong>outage probability</strong>입니다.
          링크 신뢰도의 핵심 지표이며, 코딩·전력 제어·다이버시티 설계의 목표 기준이 됩니다.
        </p>
        <BlockMath math={String.raw`P_{out}=P\{|h|^2 < \gamma_{th}/\text{SNR}\}`} />
        <p className="text-sm text-slate-600">
          Rayleigh 채널에서는 <InlineMath math={String.raw`|h|^2`} />가 지수 분포이므로
          outage가 높은 SNR에서도 <InlineMath math={String.raw`1/\text{SNR}`} />에만 비례하여 천천히 감소합니다.
          이 문제를 극복하는 것이 다이버시티 기법의 핵심 동기이며,
          <button onClick={() => onNavigate('appendix-a2')} className="cross-ref !text-xs ml-1">Appendix A.2</button>
          의 검출 오류 확률과 직접 연결됩니다.
        </p>
      </div>

      <h3 className="text-xl font-bold text-slate-800 mb-3">Example 2.2: Clarke/Jakes Simulator</h3>
      <p className="text-slate-600 mb-4">
        <button onClick={() => onNavigate('doppler')} className="cross-ref !text-xs">도플러 설정</button>
        을 바꿔가며 시간 페이딩 통계가 어떻게 달라지는지 확인해보세요.
      </p>
      <FadingSimulator />

      <div className="insight mt-8">
        <div className="insight-title">학습 연결</div>
        <p className="text-sm text-amber-900">
          통계 모델의 목적은 정확한 숫자 자체보다, 채널 위에서 어떤 설계가 필요한지 판단하는 데 있습니다.
          다음 섹션에서 지금까지의 내용을 하나의 종합 그림으로 정리합니다.
          <button onClick={() => onNavigate('main-plot')} className="cross-ref !text-xs ml-1">2.5 Main Plot</button>
        </p>
      </div>
    </section>
  );
}
