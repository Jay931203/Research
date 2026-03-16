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
        <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <p className="text-xs font-semibold text-slate-700 mb-1">왜 모델이 필요한가?</p>
          <p className="text-xs text-slate-600">
            모델 없이는 경험에만 의존하여 설계해야 합니다 — 창의적인 시스템 설계가 불가능합니다.
            통계 모델은 <strong>필터 탭 계수</strong>를 모델링합니다: 각 탭에 충분히 많은 경로가 합산되므로,
            개별 경로 대신 탭 단위의 통계적 모델링이 충분한 경로 집계(수십~수백 경로 → 하나의 탭)가 자연스럽게 성립합니다.
          </p>
        </div>
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
          <div className="formula-block !my-2 !p-3">
            <h4 className="font-semibold text-blue-700 text-xs mb-1">탭 전력: 지수분포</h4>
            <BlockMath math={String.raw`|h_\\ell[m]|^2 \\sim \\text{Exp}(1/\\sigma_\\ell^2): \\quad f(x) = \\frac{1}{\\sigma_\\ell^2} e^{-x/\\sigma_\\ell^2}, \\quad x \\ge 0`} />
            <p className="text-xs text-slate-500 mt-1">
              Rayleigh envelope의 제곱(전력)은 지수분포를 따릅니다. 이 덕분에 outage probability를 닫힌 형태(closed-form)로 계산할 수 있습니다.
            </p>
          </div>
          <div className="text-sm text-slate-600 mt-2 space-y-2">
            <p>
              <strong className="text-blue-700 dark:text-blue-400">σ²의 의미:</strong>{' '}
              σ²은 총 산란 전력의 절반입니다. I/Q 각 성분이{' '}
              <InlineMath math={String.raw`\mathcal{N}(0,\sigma^2)`} />을 따르므로,
              envelope의 평균 전력은{' '}
              <InlineMath math={String.raw`\mathbb{E}[R^2]=2\sigma^2`} />입니다.
            </p>
            <p>
              <strong className="text-blue-700 dark:text-blue-400">물리적 직관:</strong>{' '}
              σ가 클수록 평균 수신 전력이 크지만, deep fade의 절대 깊이도 커집니다.
            </p>
            <p>
              <strong className="text-blue-700 dark:text-blue-400">PDF 형태:</strong>{' '}
              Rayleigh PDF는{' '}
              <InlineMath math={String.raw`r=\sigma`} />에서 최댓값을 가지고,{' '}
              <InlineMath math={String.raw`r\to0`} />으로 갈수록 0이지만,
              r이 매우 작은 구간의 누적 확률(CDF)이 상당히 커서 deep fade가 잦습니다.
            </p>
          </div>
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
            <BlockMath math={String.raw`K=\frac{s^2}{2\sigma^2}=\frac{\text{LOS power}}{\text{NLOS power}}`} />
          </div>
          <div className="formula-block !my-2 !p-3">
            <BlockMath math={String.raw`f_R(r)=\frac{r}{\sigma^2}\exp\!\Bigl(-\frac{r^2+s^2}{2\sigma^2}\Bigr)\,I_0\!\Bigl(\frac{rs}{\sigma^2}\Bigr),\quad r\ge0`} />
          </div>
          <div className="formula-block !my-2 !p-3">
            <h4 className="font-semibold text-red-700 text-xs mb-1">κ-parameterization (탭 모델)</h4>
            <BlockMath math={String.raw`h_\\ell[m] = \\sqrt{\\frac{\\kappa}{\\kappa+1}} \\sigma_\\ell , e^{j\\theta} + \\sqrt{\\frac{1}{\\kappa+1}} \\mathcal{CN}(0, \\sigma_\\ell^2)`} />
            <div className="grid md:grid-cols-2 gap-2 mt-2 text-xs">
              <div className="p-2 bg-white rounded border border-red-100">
                <span className="font-semibold text-red-700">첫번째 항:</span> LOS 경로 (고정 위상 <InlineMath math="e^{j\theta}" />)
              </div>
              <div className="p-2 bg-white rounded border border-red-100">
                <span className="font-semibold text-red-700">두번째 항:</span> 산란 경로 집합체 (<InlineMath math="\mathcal{CN}" />)
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              <InlineMath math="\kappa" /> = specular path 에너지 / scattered paths 에너지 (K-factor).
              <InlineMath math="\kappa = 0" />이면 Rayleigh, <InlineMath math="\kappa \to \infty" />이면 비페이딩.
            </p>
          </div>
          <div className="text-sm text-slate-600 mt-2 space-y-2">
            <p>
              <strong className="text-red-700 dark:text-red-400">각 항의 의미:</strong>{' '}
              <InlineMath math={String.raw`s`} />는 LOS 성분의 크기,{' '}
              <InlineMath math={String.raw`\sigma^2`} />은 산란 성분 전력의 절반(Rayleigh와 동일),{' '}
              <InlineMath math={String.raw`\exp(\cdot)`} />항은 총 전력에 의한 감쇠입니다.
            </p>
            <p>
              <strong className="text-red-700 dark:text-red-400">
                <InlineMath math={String.raw`I_0`} /> (0차 변형 베셀 함수):
              </strong>{' '}
              LOS와 산란 성분이 간섭하는 정도를 나타냅니다.{' '}
              <InlineMath math={String.raw`I_0(x)`} />는 항상 양수이고{' '}
              <InlineMath math={String.raw`x`} />가 커지면 지수적으로 증가하여,
              LOS가 강할수록 분포를 평균 쪽으로 집중시킵니다.
            </p>
            <p>
              <strong className="text-red-700 dark:text-red-400">직관:</strong>{' '}
              K가 크면 평균 주위로 집중된 분포(deep fade 드물),{' '}
              <InlineMath math={String.raw`K=0`} />{' '}
              <InlineMath math={String.raw`(s=0)`} />이면{' '}
              <InlineMath math={String.raw`I_0(0)=1`} />이 되어 Rayleigh로 환원됩니다.
            </p>
          </div>
        </div>
      </div>

      <div className="concept-card mb-8" id="k-factor">
        <h3 className="font-bold text-lg text-slate-800 mb-3">2.4.2 Rayleigh/Rician의 연결</h3>
        <div className="grid md:grid-cols-3 gap-3 text-sm">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
            <div className="font-bold text-blue-700 dark:text-blue-400">K = 0</div>
            <div className="text-slate-600 dark:text-slate-400">순수 Rayleigh</div>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-900/30 rounded-lg border border-amber-100 dark:border-amber-800">
            <div className="font-bold text-amber-700 dark:text-amber-400">K = 5~10 dB</div>
            <div className="text-slate-600 dark:text-slate-400">일반적 Rician</div>
          </div>
          <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-100 dark:border-green-800">
            <div className="font-bold text-green-700 dark:text-green-400">K → ∞</div>
            <div className="text-slate-600 dark:text-slate-400">거의 비페이딩</div>
          </div>
        </div>
        <div className="mt-4 text-sm text-slate-600 dark:text-slate-400 space-y-2">
          <p>
            <strong className="text-slate-800 dark:text-slate-200">K 증가의 효과:</strong>{' '}
            K=0(Rayleigh)에서 K→∞(비페이딩)으로 갈수록 분포가 평균 주위로 집중됩니다.
            경험적으로, K가 10 dB 증가할 때마다 outage probability가 대략 한 자릿수(10배) 개선됩니다.
          </p>
          <p>
            <strong className="text-slate-800 dark:text-slate-200">실제 환경 예시:</strong>
          </p>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li>도심 NLOS (건물 사이): <InlineMath math={String.raw`K \approx 0`} /> (Rayleigh)</li>
            <li>실내 LOS 복도: <InlineMath math={String.raw`K \approx 6\text{-}10\;\text{dB}`} /></li>
            <li>교외 / 개활지 LOS: <InlineMath math={String.raw`K \approx 10\text{-}15\;\text{dB}`} /></li>
            <li>위성 통신: <InlineMath math={String.raw`K \approx 15\text{-}20\;\text{dB}`} /> (거의 비페이딩)</li>
          </ul>
        </div>
      </div>

      <FadingDistribution />

      <div className="concept-card mt-8 mb-8" id="tap-autocorr">
        <h3 className="font-bold text-lg text-slate-800 mb-3">2.4.3 Tap gain autocorrelation (Clarke/Jakes)</h3>
        <BlockMath math={String.raw`R_{h_\ell}[\Delta m]=\mathbb{E}[h_\ell[m]h_\ell^*[m+\Delta m]]`} />
        <BlockMath math={String.raw`R_{h_\ell}(\Delta t)\propto J_0(2\pi f_D\Delta t)`} />
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
          Clarke/Jakes 모델은 도래각이 수평면에서 균일하게 분포한다고 가정할 때의 시간 상관함수입니다.
        </p>
        <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <p className="text-xs font-semibold text-slate-700 mb-2">탭 상관함수의 핵심 성질</p>
          <ul className="text-xs text-slate-600 list-disc list-inside space-y-1">
            <li><strong>WSS 가정:</strong> 상관함수 <InlineMath math="R_\ell[n]" />가 시간 <InlineMath math="m" />의 함수가 아닌 시간차 <InlineMath math="n" />만의 함수 (Wide-Sense Stationary)</li>
            <li><strong>탭 간 독립:</strong> <InlineMath math={String.raw`h_\\ell[m]`} />과 <InlineMath math={String.raw`h_{\\ell'}[m']`} />는 <InlineMath math={String.raw`\\ell \\neq \\ell'`} />이면 독립 (Uncorrelated Scattering)</li>
            <li><strong>에너지 프로파일:</strong> <InlineMath math={String.raw`R_\\ell[0] = \\sigma_\\ell^2`} />는 <InlineMath math="\ell" />-번째 탭의 평균 에너지에 비례</li>
          </ul>
        </div>
        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs font-semibold text-amber-800 mb-1">대역틭 증가의 효과</p>
          <p className="text-xs text-slate-600">
            대역틭 <InlineMath math="W" />가 커지면: (1) 탭 간격 <InlineMath math="1/W" />가 좁아져 각 탭에 포함되는 경로 수가 줄어들고,
            Rayleigh 근사가 덜 정확해집니다. (2) sinc 커널이 좁아져 에너지 프로파일 <InlineMath math={String.raw`R_\\ell[0]`} />이 더 세밀한(fine-grained) 정보를 담게 됩니다.
          </p>
        </div>
        <div className="mt-3 text-sm text-slate-600 dark:text-slate-400 space-y-2">
          <p>
            <strong className="text-slate-800 dark:text-slate-200">
              <InlineMath math={String.raw`J_0`} />의 직관:
            </strong>{' '}
            <InlineMath math={String.raw`J_0(x)`} />는{' '}
            <InlineMath math={String.raw`x=0`} />에서 1이고,{' '}
            <InlineMath math={String.raw`x`} />가 커지면 0을 중심으로 진동하며 감쇠하는 함수입니다.
            물리적으로는 시간이 멀어질수록 상관이 줄면서 진동하는 패턴을 나타냅니다.
          </p>
          <p>
            <strong className="text-slate-800 dark:text-slate-200">수식의 의미:</strong>{' '}
            <InlineMath math={String.raw`\Delta t=0`} />이면 상관=1(자기 자신과의 상관),{' '}
            <InlineMath math={String.raw`\Delta t`} />가{' '}
            <InlineMath math={String.raw`1/(2f_D)`} />를 넘으면 상관이 크게 줄어
            채널이 사실상 &apos;새로운&apos; 독립적 값이 됩니다.
            이 상관함수의 폭이 곧 채널 예측 가능 시간이며, <strong>파일럿 재전송 주기</strong>를 결정합니다.
          </p>
          <p>
            <strong className="text-slate-800 dark:text-slate-200">파일럿 설계 기준:</strong>{' '}
            <InlineMath math={String.raw`J_0`} />의 첫 번째 영점이{' '}
            <InlineMath math={String.raw`\Delta t \approx 0.4/f_D`} />에서 발생합니다.
            이 시간 내에 파일럿을 보내야 유효한 채널 추정이 가능하므로,
            파일럿 간격의 상한이 됩니다.
          </p>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
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
        <div className="mt-3 text-sm text-slate-600 dark:text-slate-400 space-y-2">
          <p>
            <strong className="text-slate-800 dark:text-slate-200">Rayleigh 채널의 유도:</strong>{' '}
            Rayleigh 페이딩에서{' '}
            <InlineMath math={String.raw`|h|^2 \sim \text{Exp}(1)`} /> (지수 분포)이므로,
            CDF를 직접 계산할 수 있습니다:
          </p>
          <div className="formula-block !my-2 !p-3">
            <BlockMath math={String.raw`P_{out} = 1 - \exp\!\Bigl(-\frac{\gamma_{th}}{\text{SNR}}\Bigr) \;\approx\; \frac{\gamma_{th}}{\text{SNR}} \quad (\text{high SNR})`} />
          </div>
          <p>
            <strong className="text-slate-800 dark:text-slate-200">
              왜 <InlineMath math={String.raw`1/\text{SNR}`} />에 비례하는가:
            </strong>{' '}
            높은 SNR 근사에서{' '}
            <InlineMath math={String.raw`P_{out} \approx \gamma_{th}/\text{SNR}`} />이므로,
            SNR을 10배 올려도 outage는 10배만 줄어듭니다.
            이는 AWGN 채널에서 오류 확률이 SNR에 대해 지수적으로 감소하는 것과 대비됩니다.
          </p>
          <p className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded border border-amber-200 dark:border-amber-800">
            <strong className="text-amber-800 dark:text-amber-400">다이버시티의 동기:</strong>{' '}
            1개 안테나의 근본적 한계가 바로 이{' '}
            <InlineMath math={String.raw`1/\text{SNR}`} /> 비례 관계입니다.
            L개의 독립 다이버시티 경로가 있으면{' '}
            <InlineMath math={String.raw`P_{out} \propto (1/\text{SNR})^L`} />로 개선되어,
            SNR 10배 증가 시 outage가{' '}
            <InlineMath math={String.raw`10^L`} />배 줄어듭니다.
          </p>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
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
