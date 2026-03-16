'use client';

import { BlockMath, InlineMath } from 'react-katex';
import { useState } from 'react';
import dynamic from 'next/dynamic';

const BasebandConversionLab = dynamic(() => import('@/components/tse/interactive/BasebandConversionLab'), { ssr: false });
const SincTapVisualization = dynamic(() => import('@/components/tse/interactive/SincTapVisualization'), { ssr: false });
const DegreesOfFreedomLab = dynamic(() => import('@/components/tse/interactive/DegreesOfFreedomLab'), { ssr: false });

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
        <h4 className="font-semibold text-blue-800 dark:text-blue-400 mb-3">2.2.1 Wireless channel as LTV system</h4>
        <BlockMath math={String.raw`y(t)=\int h(t,\tau)x(t-\tau)\,d\tau + w(t)`} />
        <div className="grid md:grid-cols-3 gap-3 mt-3 text-sm text-slate-600 dark:text-slate-400">
          <div><InlineMath math={String.raw`h(t,\tau)`} />: 시간가변 임펄스 응답</div>
          <div><InlineMath math="t" />: 관측 시각</div>
          <div><InlineMath math={String.raw`\tau`} />: 경로 지연</div>
        </div>

        {/* 왜 컨볼루션인가 */}
        <div className="mt-4 p-4 bg-blue-50/60 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
          <h5 className="font-semibold text-blue-800 dark:text-blue-300 text-sm mb-2">왜 컨볼루션(적분) 형태인가?</h5>
          <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
            전자파는 <strong>선형 매질</strong>(공기)을 통과합니다. 선형성(superposition)이 보장되므로,
            입력 신호를 임펄스들의 합으로 분해하고 각 임펄스에 대한 응답을 합치면 전체 출력을 얻습니다.
            이것이 바로 컨볼루션 적분입니다:
          </p>
          <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1 ml-4">
            <p><strong>Step 1.</strong> 입력 <InlineMath math={String.raw`x(t)`} />를 무수히 많은 임펄스의 합으로 분해</p>
            <p><strong>Step 2.</strong> 각 임펄스 <InlineMath math={String.raw`x(\tau)\delta(t-\tau)`} />에 대한 채널 응답 = <InlineMath math={String.raw`h(t,\tau)`} /></p>
            <p><strong>Step 3.</strong> 선형성으로 전체 응답 = 모든 <InlineMath math={String.raw`\tau`} />에 대해 합산 → 적분</p>
          </div>
        </div>

        {/* h(t,τ)의 두 변수 의미 */}
        <div className="mt-4 p-4 bg-indigo-50/60 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
          <h5 className="font-semibold text-indigo-800 dark:text-indigo-300 text-sm mb-2">
            <InlineMath math={String.raw`h(t,\tau)`} />의 두 변수가 각각 의미하는 것
          </h5>
          <div className="grid md:grid-cols-2 gap-4 mt-2">
            <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-indigo-100 dark:border-indigo-700">
              <div className="font-semibold text-indigo-700 dark:text-indigo-400 text-xs mb-1">
                <InlineMath math={String.raw`\tau`} /> (경로 지연) — 주파수 선택성의 원인
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                "시각 <InlineMath math="t" />에 관측했을 때, <InlineMath math={String.raw`\tau`} />초 전에 보낸 신호가
                얼마나 기여하는가". 여러 경로가 서로 다른 <InlineMath math={String.raw`\tau`} />에 도착하면,
                주파수 영역에서 채널 이득이 주파수마다 달라집니다 → <strong>주파수 선택적 페이딩</strong>.
              </p>
            </div>
            <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-indigo-100 dark:border-indigo-700">
              <div className="font-semibold text-indigo-700 dark:text-indigo-400 text-xs mb-1">
                <InlineMath math="t" /> (관측 시각) — 시간 선택성의 원인
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                송수신기나 산란체가 움직이면 각 경로의 감쇠·지연·위상이 시간에 따라 변합니다.
                같은 <InlineMath math={String.raw`\tau`} />에 대한 채널 값이 <InlineMath math="t" />마다 다르므로
                → <strong>시간 선택적 페이딩 (도플러)</strong>.
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
            유선 채널은 <InlineMath math={String.raw`h(\tau)`} />로 충분합니다 — 케이블은 움직이지 않으니 <InlineMath math="t" /> 의존성이 없습니다.
            무선에서 <InlineMath math="t" />가 추가되는 것이 핵심 차이이며, 이것이 모든 무선 통신 문제의 시작점입니다.
          </p>
        </div>

        {/* LTI vs LTV 비교 */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-700">
                <th className="border border-slate-200 dark:border-slate-600 px-3 py-2 text-left text-slate-700 dark:text-slate-300"></th>
                <th className="border border-slate-200 dark:border-slate-600 px-3 py-2 text-slate-700 dark:text-slate-300">LTI (유선, 고정 무선)</th>
                <th className="border border-slate-200 dark:border-slate-600 px-3 py-2 text-slate-700 dark:text-slate-300">LTV (이동 무선)</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              <tr>
                <td className="border border-slate-200 dark:border-slate-600 px-3 py-2 font-semibold">임펄스 응답</td>
                <td className="border border-slate-200 dark:border-slate-600 px-3 py-2"><InlineMath math={String.raw`h(\tau)`} /> — 시간에 불변</td>
                <td className="border border-slate-200 dark:border-slate-600 px-3 py-2"><InlineMath math={String.raw`h(t,\tau)`} /> — 시간에 따라 변화</td>
              </tr>
              <tr>
                <td className="border border-slate-200 dark:border-slate-600 px-3 py-2 font-semibold">주파수 응답</td>
                <td className="border border-slate-200 dark:border-slate-600 px-3 py-2"><InlineMath math={String.raw`H(f)`} /> 고정</td>
                <td className="border border-slate-200 dark:border-slate-600 px-3 py-2"><InlineMath math={String.raw`H(f;t)`} /> 시간에 따라 변화</td>
              </tr>
              <tr>
                <td className="border border-slate-200 dark:border-slate-600 px-3 py-2 font-semibold">수신기 설계</td>
                <td className="border border-slate-200 dark:border-slate-600 px-3 py-2">한 번 추정하면 계속 사용</td>
                <td className="border border-slate-200 dark:border-slate-600 px-3 py-2">주기적으로 재추정 필요 (파일럿)</td>
              </tr>
              <tr>
                <td className="border border-slate-200 dark:border-slate-600 px-3 py-2 font-semibold">예시</td>
                <td className="border border-slate-200 dark:border-slate-600 px-3 py-2">동축 케이블, 광섬유</td>
                <td className="border border-slate-200 dark:border-slate-600 px-3 py-2">셀룰러, WiFi (이동 중)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="grid md:grid-cols-2 gap-3 mt-4">
          <div className="p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg border border-cyan-100 dark:border-cyan-800">
            <div className="text-xs font-semibold text-cyan-700 dark:text-cyan-400 mb-1">Narrowband 조건</div>
            <BlockMath math={String.raw`W \ll f_c`} />
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              협대역 조건에서는 감쇠와 전파 지연이 <strong>주파수에 무관</strong>해집니다.
              직관적으로, 신호 대역폭 <InlineMath math="W" />가 반송파 <InlineMath math="f_c" />에 비해 극히 좁으면
              대역 내 모든 주파수 성분이 거의 같은 경로 감쇠와 위상 회전을 경험합니다.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              예: LTE는 <InlineMath math={String.raw`W = 20\,\text{MHz}`} />, <InlineMath math={String.raw`f_c = 2\,\text{GHz}`} />
              → <InlineMath math={String.raw`W/f_c = 0.01`} /> (1%). 이 조건은 대부분의 셀룰러/WiFi에서 만족됩니다.
            </p>
          </div>
          <div className="p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-100 dark:border-teal-800">
            <div className="text-xs font-semibold text-teal-700 dark:text-teal-400 mb-1">Underspread 채널</div>
            <BlockMath math={String.raw`T_d \ll T_c \quad\Leftrightarrow\quad T_d \cdot D_s \ll 1`} />
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              delay spread(<InlineMath math="T_d" />)가 coherence time(<InlineMath math="T_c" />)보다 훨씬 작으면,
              채널이 자신의 "메모리 길이" 동안은 거의 변하지 않습니다.
              이때 각 심볼 구간에서 <strong>quasi-LTI</strong>로 근사하여 기존의 등화/검출 알고리즘을 적용할 수 있습니다.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              예: 도시 채널 <InlineMath math={String.raw`T_d \approx 1\,\mu\text{s}`} />,
              <InlineMath math={String.raw`T_c \approx 2.5\,\text{ms}`} />
              → 비율 = 0.0004. 실용 채널은 거의 항상 underspread입니다.
            </p>
          </div>
        </div>
      </div>

      <div className="formula-block mb-6" id="baseband-model">
        <h4 className="font-semibold text-blue-800 dark:text-blue-400 mb-3">2.2.2 Complex baseband equivalent</h4>

        {/* 왜 복소 baseband가 필요한가 */}
        <div className="p-4 bg-amber-50/60 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800 mb-4">
          <h5 className="font-semibold text-amber-800 dark:text-amber-300 text-sm mb-2">왜 복소 기저대역이 필요한가?</h5>
          <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
            실제 전파는 <InlineMath math={String.raw`f_c = 2\,\text{GHz}`} />의 반송파 위에 실립니다.
            이 빠른 진동(초당 20억 번!)을 디지털로 직접 처리하려면 샘플링 레이트가 최소 4 GHz 이상이어야 합니다.
            <strong>그런데 우리가 관심 있는 정보는 반송파 자체가 아니라, 그 위에 실린 느린 변조 신호</strong>입니다.
          </p>
          <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1 ml-4">
            <p><strong>핵심 아이디어:</strong> 반송파를 제거하면 대역폭 <InlineMath math="W" /> (수십 MHz)만큼의
            저속 신호만 남습니다. 이 신호는 <InlineMath math="W" /> 레이트로 샘플링하면 되므로
            처리 속도가 수백 배 줄어듭니다.</p>
            <p><strong>왜 "복소"인가:</strong> 실수 passband 신호에는 I(in-phase)와 Q(quadrature) 두 성분의 정보가 들어 있습니다.
            하나의 복소수 <InlineMath math={String.raw`x_b = x_I + jx_Q`} />로 이 두 성분을 한번에 표현하면
            수식이 간결해지고, 위상 회전이 단순한 복소수 곱셈이 됩니다.</p>
          </div>
        </div>

        {/* Upconversion / Downconversion flow */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-100 dark:border-blue-800 mb-4">
          <div className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-3 text-center">Passband ↔ Baseband 변환 흐름</div>
          <div className="flex flex-col md:flex-row items-center justify-center gap-2 text-xs text-slate-700 dark:text-slate-300">
            <div className="px-3 py-2 bg-white dark:bg-slate-800 rounded-lg border shadow-sm text-center">
              <div className="font-semibold text-blue-600 dark:text-blue-400">Baseband</div>
              <InlineMath math="x_b(t)" />
            </div>
            <div className="text-slate-400">→ <InlineMath math={String.raw`\times\, e^{j2\pi f_c t}`} /> →</div>
            <div className="px-3 py-2 bg-white dark:bg-slate-800 rounded-lg border shadow-sm text-center">
              <div className="font-semibold text-green-600 dark:text-green-400">Passband</div>
              <InlineMath math={String.raw`x_p(t) = \text{Re}[\cdot]`} />
            </div>
            <div className="text-slate-400">→ 채널 →</div>
            <div className="px-3 py-2 bg-white dark:bg-slate-800 rounded-lg border shadow-sm text-center">
              <div className="font-semibold text-orange-600 dark:text-orange-400">수신 Passband</div>
              <InlineMath math="y_p(t)" />
            </div>
            <div className="text-slate-400">→ <InlineMath math={String.raw`\times\, e^{-j2\pi f_c t}`} /> →</div>
            <div className="px-3 py-2 bg-white dark:bg-slate-800 rounded-lg border shadow-sm text-center">
              <div className="font-semibold text-purple-600 dark:text-purple-400">수신 Baseband</div>
              <InlineMath math="y_b(t)" />
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 text-center">
            각 단계의 수학적 의미: upconversion = 스펙트럼을 <InlineMath math="f_c" />로 이동,
            downconversion = 스펙트럼을 원점으로 복원, LPF = 2배 주파수 성분 제거
          </p>
        </div>

        <BlockMath math={String.raw`y_b(t)=\sum_i a_i(t)e^{-j2\pi f_c\tau_i(t)}x_b(t-\tau_i(t))`} />

        {/* 위상 항의 물리적 의미 — 페이딩의 핵심 */}
        <div className="mt-4 p-4 bg-rose-50/60 dark:bg-rose-900/20 rounded-xl border-2 border-rose-200 dark:border-rose-700">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 bg-rose-600 text-white text-xs font-bold rounded">페이딩의 핵심</span>
            <span className="font-bold text-rose-800 dark:text-rose-300 text-sm">
              위상 항 <InlineMath math={String.raw`e^{-j2\pi f_c \tau_i(t)}`} />가 결정하는 것
            </span>
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
            이 항이 <strong>무선 채널 페이딩의 근본 원인</strong>입니다.
            반송파 주파수 <InlineMath math="f_c" />가 매우 크므로 (GHz),
            경로 지연 <InlineMath math={String.raw`\tau_i`} />의 아주 작은 변화도 큰 위상 변화를 만듭니다:
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-rose-100 dark:border-rose-700">
              <div className="font-semibold text-rose-700 dark:text-rose-400 text-xs mb-1">구체적 계산 예시</div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                <InlineMath math={String.raw`f_c = 2\,\text{GHz}`} />일 때,
                경로 길이가 <strong>7.5 cm</strong> (= <InlineMath math={String.raw`\lambda/2`} />) 변하면
                <InlineMath math={String.raw`\tau_i`} />가 0.25 ns 변하고,
                위상이 <InlineMath math={String.raw`2\pi f_c \times 0.25\,\text{ns} = \pi`} /> 즉 <strong>180° 회전</strong>합니다.
                완전 보강 → 완전 소거 간섭으로 전환됩니다!
              </p>
            </div>
            <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-rose-100 dark:border-rose-700">
              <div className="font-semibold text-rose-700 dark:text-rose-400 text-xs mb-1">왜 이것이 중요한가</div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                여러 경로의 신호가 수신기에서 합쳐질 때, 각 경로의 위상이 어떤 값이냐에 따라
                신호들이 <strong>보강적으로 더해지거나(constructive) 소거적으로 상쇄</strong>(destructive)됩니다.
                수신기가 반 파장만 이동해도 결과가 완전히 달라집니다 — 이것이 small-scale fading입니다.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
          <div className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1">1:1 재구성 가능 — 왜 baseband 분석으로 충분한가</div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
            Baseband ↔ passband 간 <strong>정보 손실이 전혀 없습니다</strong>.
            복소 baseband 신호에서 원래 passband 신호를 완벽히 복원할 수 있으므로,
            모든 신호 처리를 baseband에서 수행해도 동일한 결과를 얻습니다.
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            <strong>수학적 근거:</strong> 실수 passband 신호 <InlineMath math={String.raw`x_p(t)`} />는
            복소 baseband <InlineMath math={String.raw`x_b(t)`} />의 실수부를 취한 것이고,
            <InlineMath math={String.raw`x_b(t)`} />는 <InlineMath math={String.raw`x_p(t)`} />의 해석 신호(analytic signal)에서
            유일하게 복원됩니다. 따라서 Tse 교재는 이후 모든 장에서 baseband equivalent로 분석합니다.
          </p>
        </div>
      </div>

      <BasebandConversionLab />

      <div className="formula-block mb-6" id="discrete-model">
        <h4 className="font-semibold text-blue-800 dark:text-blue-400 mb-3">2.2.3 Discrete-time baseband model</h4>
        <BlockMath math={String.raw`y[m]=\sum_{\ell=0}^{L-1}h_\ell[m]x[m-\ell]+w[m]`} />

        {/* 연속 → 이산 단계별 유도 */}
        <div className="mt-3 p-4 bg-blue-50/60 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 mb-4">
          <h5 className="font-semibold text-blue-800 dark:text-blue-300 text-sm mb-2">연속 → 이산: 어떻게 FIR 필터가 되는가?</h5>
          <div className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
            <p>
              <strong>Step 1. 샘플링:</strong> 연속 baseband 신호를 나이퀴스트 레이트
              <InlineMath math={String.raw`T_s = 1/W`} />로 샘플링합니다:
              <InlineMath math={String.raw`x[m] = x_b(m/W)`} />, <InlineMath math={String.raw`y[m] = y_b(m/W)`} />.
              Shannon의 샘플링 정리에 의해, 대역폭 <InlineMath math="W" /> 신호는 이 레이트로 <strong>완벽히 복원</strong> 가능합니다.
            </p>
            <p>
              <strong>Step 2. 적분 → 합:</strong> 연속 컨볼루션 적분이 이산 합으로 바뀝니다.
              연속 지연 축 <InlineMath math={String.raw`\tau`} />를 <InlineMath math={String.raw`1/W`} /> 간격으로 이산화하면,
              유한 개의 탭 계수 <InlineMath math={String.raw`h_0, h_1, \ldots, h_{L-1}`} />만으로 채널을 표현할 수 있습니다.
            </p>
            <p>
              <strong>Step 3. 도플러 무시 조건:</strong> <InlineMath math={String.raw`D_s \ll W`} />
              (도플러 확산이 대역폭보다 훨씬 작음)이면, 샘플링 시간 <InlineMath math={String.raw`1/W`} /> 동안
              채널이 거의 변하지 않으므로 샘플 단위에서 시간 불변으로 취급할 수 있습니다.
              실제로 <InlineMath math={String.raw`D_s`} />는 수백 Hz, <InlineMath math="W" />는 수십 MHz이므로 항상 만족됩니다.
            </p>
          </div>
        </div>

        <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-xl border-2 border-rose-200 dark:border-rose-700 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 bg-rose-600 text-white text-xs font-bold rounded">핵심</span>
            <span className="font-bold text-rose-800 dark:text-rose-300 text-sm">1 Tap ≠ 1 Path</span>
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
            각 탭은 하나의 물리 경로가 <strong>아닙니다</strong>.
            연속 지연을 이산 격자에 매핑할 때, 각 탭은 <strong>sinc 함수로 가중된 여러 경로의 합</strong>입니다:
          </p>
          <BlockMath math={String.raw`h_\ell[m] = \sum_i a_i\!\left(\frac{m}{W}\right) e^{-j2\pi f_c \tau_i}\,\text{sinc}(W\tau_i - \ell)`} />
          <div className="grid md:grid-cols-2 gap-3 mt-3 text-xs text-slate-600 dark:text-slate-400">
            <div className="p-2 bg-white dark:bg-slate-800 rounded border">
              <strong className="text-rose-700 dark:text-rose-400">직관적 이해:</strong>{' '}
              sinc 함수는 <InlineMath math={String.raw`\tau_i = \ell/W`} />일 때 정확히 1이고 다른 정수 격자점에서 0입니다.
              따라서 경로 지연이 정확히 탭 간격의 정수배이면 그 탭에만 기여합니다.
              실제로는 지연이 격자 사이에 있으므로 인접 탭들에 분산됩니다 — 하지만 <strong>주엽이 지배적</strong>이라 가장 가까운 탭에 대부분의 에너지가 집중됩니다.
            </div>
            <div className="p-2 bg-white dark:bg-slate-800 rounded border">
              <strong className="text-rose-700 dark:text-rose-400">나이퀴스트 펄스의 역할:</strong>{' '}
              sinc는 이상적 나이퀴스트 펄스로, 정수 격자점에서 직교합니다.
              실제 시스템에서는 구현 가능한 <strong>raised cosine</strong> 등의 펄스로 대체하지만,
              동일한 직교 성질(<InlineMath math={String.raw`p(nT_s) = \delta[n]`} />)을 유지합니다.
              이 직교성이 탭 간 간섭 없이 각 탭의 채널 값을 분리할 수 있게 해줍니다.
            </div>
          </div>
        </div>

        {/* 탭 수 L의 의미와 계산 예시 */}
        <div className="p-4 bg-violet-50/60 dark:bg-violet-900/20 rounded-xl border border-violet-100 dark:border-violet-800">
          <h5 className="font-semibold text-violet-800 dark:text-violet-300 text-sm mb-2">
            탭 수 <InlineMath math="L" />: 채널의 "복잡도"를 결정하는 숫자
          </h5>
          <BlockMath math={String.raw`L \approx \lceil T_d \cdot W \rceil + 1`} />
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
            <InlineMath math="L" />은 delay spread <InlineMath math="T_d" />와 대역폭 <InlineMath math="W" />의 곱으로 결정됩니다.
            물리적으로, <InlineMath math="W" />가 클수록 시간 해상도(<InlineMath math="1/W" />)가 미세해져서
            더 많은 경로를 구분할 수 있고, <InlineMath math="T_d" />가 클수록 경로 간 지연 차이가 커서 더 많은 탭이 필요합니다.
          </p>
          <div className="grid md:grid-cols-3 gap-3 text-xs">
            <div className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-violet-100 dark:border-violet-700 text-center">
              <div className="font-semibold text-violet-700 dark:text-violet-400 mb-1">실내 WiFi</div>
              <div className="text-slate-600 dark:text-slate-400">
                <InlineMath math={String.raw`T_d \approx 50\,\text{ns}`} />, <InlineMath math={String.raw`W = 20\,\text{MHz}`} />
              </div>
              <div className="font-bold text-violet-600 dark:text-violet-400 mt-1">L = 2</div>
              <div className="text-slate-500">거의 flat → 단순 수신기</div>
            </div>
            <div className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-violet-100 dark:border-violet-700 text-center">
              <div className="font-semibold text-violet-700 dark:text-violet-400 mb-1">도시 LTE</div>
              <div className="text-slate-600 dark:text-slate-400">
                <InlineMath math={String.raw`T_d \approx 1\,\mu\text{s}`} />, <InlineMath math={String.raw`W = 20\,\text{MHz}`} />
              </div>
              <div className="font-bold text-violet-600 dark:text-violet-400 mt-1">L = 21</div>
              <div className="text-slate-500">주파수 선택적 → OFDM 필요</div>
            </div>
            <div className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-violet-100 dark:border-violet-700 text-center">
              <div className="font-semibold text-violet-700 dark:text-violet-400 mb-1">5G NR mmWave</div>
              <div className="text-slate-600 dark:text-slate-400">
                <InlineMath math={String.raw`T_d \approx 100\,\text{ns}`} />, <InlineMath math={String.raw`W = 400\,\text{MHz}`} />
              </div>
              <div className="font-bold text-violet-600 dark:text-violet-400 mt-1">L = 41</div>
              <div className="text-slate-500">광대역 → 많은 탭, 높은 다이버시티</div>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
            <strong>설계 관점:</strong> <InlineMath math="L = 1" />이면 채널이 단순 곱셈(<InlineMath math={String.raw`y = hx + w`} />),
            <InlineMath math="L > 1" />이면 ISI가 발생하여 OFDM이나 등화기가 필요합니다.
            한편, <InlineMath math="L" />이 클수록 독립적인 다이버시티 가지가 많아져 페이딩에 대한 내성이 높아집니다
            — 복잡도와 다이버시티의 트레이드오프입니다.
          </p>
        </div>
      </div>

      <SincTapVisualization />

      <div className="concept-card mb-6" id="dof-discussion">
        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 mb-3">Discussion 2.1: Degrees of Freedom</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
          대역폭 <InlineMath math="W" />, 전송 시간 <InlineMath math="T" />인 시스템에서의 핵심 질문:
          <strong>"몇 개의 독립 신호를 실어 보낼 수 있는가?"</strong>
        </p>

        {/* 왜 DoF = W·T인가? 직관적 유도 */}
        <div className="p-4 bg-blue-50/60 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 mb-4">
          <h5 className="font-semibold text-blue-800 dark:text-blue-300 text-sm mb-2">왜 DoF = W × T인가? (직관적 유도)</h5>
          <div className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
            <p>
              <strong>Shannon의 샘플링 정리</strong>가 핵심입니다.
              대역폭 <InlineMath math="W" /> Hz인 신호는 초당 <InlineMath math="W" />개의 샘플로 완벽히 복원됩니다.
            </p>
            <p>
              <strong>Step 1.</strong> 대역폭 <InlineMath math="W" /> 신호를 <InlineMath math="T" />초 동안 전송하면,
              필요한 샘플 수 = <InlineMath math={String.raw`W \times T`} />개
            </p>
            <p>
              <strong>Step 2.</strong> 각 샘플은 하나의 <strong>복소수</strong>입니다
              (I/Q 두 성분을 가짐). 이 복소수가 바로 하나의 "자유도"입니다.
            </p>
            <p>
              <strong>Step 3.</strong> 따라서 시스템이 실어 보낼 수 있는 독립적인 복소 심볼의 수
              = <InlineMath math={String.raw`\text{DoF} = W \cdot T`} />
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-3 mb-4 text-sm">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
            <div className="font-semibold text-blue-700 dark:text-blue-400 mb-1">샘플링 정리</div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              초당 <InlineMath math="W" />개 복소 샘플 → 시간 <InlineMath math="T" /> 동안
              총 <InlineMath math={String.raw`m = \lfloor WT \rfloor`} />개 샘플.
              이보다 적게 샘플링하면 에일리어싱으로 정보가 손실되고,
              더 많이 해도 새로운 정보가 추가되지 않습니다.
            </p>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800">
            <div className="font-semibold text-indigo-700 dark:text-indigo-400 mb-1">1 복소 심볼 = 1 DoF</div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              하나의 복소 심볼 <InlineMath math={String.raw`x = x_I + jx_Q`} />는
              신호 공간에서 <strong>하나의 차원(dimension)</strong>에 해당합니다.
              직관적으로, 그 심볼 자리에 실을 수 있는 정보의 양은
              <InlineMath math={String.raw`\log_2(1 + \text{SNR})`} /> bits입니다.
            </p>
          </div>
          <div className="p-3 bg-violet-50 dark:bg-violet-900/20 rounded-lg border border-violet-100 dark:border-violet-800">
            <div className="font-semibold text-violet-700 dark:text-violet-400 mb-1">용량과의 연결</div>
            <BlockMath math={String.raw`C = W\!\cdot\!T \times \log_2(1+\text{SNR})`} />
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              AWGN 채널 용량 = DoF × 심볼당 비트 수.
              <strong>DoF는 대역폭과 시간이 주는 "빈 칸의 수"</strong>이고,
              SNR은 각 칸에 얼마나 정밀한 값을 적을 수 있는지를 결정합니다.
            </p>
          </div>
        </div>

        {/* 자유도의 활용: 다이버시티 vs 멀티플렉싱 */}
        <div className="p-4 bg-emerald-50/60 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800 mb-4">
          <h5 className="font-semibold text-emerald-800 dark:text-emerald-300 text-sm mb-2">
            자유도를 어떻게 쓸 것인가 — 이것이 Chapter 전체의 핵심 질문
          </h5>
          <div className="grid md:grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-400">
            <div className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-emerald-100 dark:border-emerald-700">
              <div className="font-semibold text-emerald-700 dark:text-emerald-400 mb-1">다이버시티로 사용</div>
              <p>
                같은 정보를 여러 자유도에 <strong>반복</strong> 전송하면,
                한 자유도가 deep fade에 빠져도 다른 자유도에서 복원할 수 있습니다.
                전송률은 낮아지지만 <strong>신뢰성(error probability)</strong>이 높아집니다.
              </p>
            </div>
            <div className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-emerald-100 dark:border-emerald-700">
              <div className="font-semibold text-emerald-700 dark:text-emerald-400 mb-1">멀티플렉싱으로 사용</div>
              <p>
                각 자유도에 <strong>서로 다른 정보</strong>를 실어 보내면 전송률이 극대화됩니다.
                MIMO에서 공간 자유도를 추가하면 <InlineMath math={String.raw`\min(n_t, n_r)`} />배의
                멀티플렉싱 이득을 얻을 수 있습니다 (Ch 3-4).
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            한정된 DoF를 다이버시티와 멀티플렉싱에 어떻게 배분하느냐가
            <strong> diversity-multiplexing tradeoff</strong> (Chapter 9)의 본질입니다.
          </p>
        </div>

        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800 mb-3">
          <div className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">수신 측 Signal Space가 더 중요한 이유</div>
          <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
            <li>채널은 선형 매핑이므로 수신 측 DoF도 <InlineMath math="WT" />로 상한됩니다</li>
            <li>도플러에 의해 수신 대역이 <InlineMath math="W/2" />보다 약간 커지지만, 유효 DoF에는 큰 영향 없음</li>
            <li><strong>구분 가능한 신호 수</strong>를 결정하는 것은 수신 측 signal space의 차원입니다 — 송신기가 아무리 복잡한 신호를 보내도 수신기가 구분할 수 없으면 의미가 없습니다</li>
          </ul>
        </div>
      </div>

      <DegreesOfFreedomLab />

      <div className="concept-card mb-6" id="awgn-model">
        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 mb-3">2.2.4 Additive white noise baseline</h3>
        <BlockMath math={String.raw`w[m]\sim\mathcal{CN}(0,N_0)`} />

        {/* 왜 가우시안? 물리적 근원 */}
        <div className="p-4 bg-blue-50/60 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 mt-3 mb-4">
          <h5 className="font-semibold text-blue-800 dark:text-blue-300 text-sm mb-2">왜 가우시안이고, 왜 white인가?</h5>
          <div className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
            <p>
              <strong>물리적 기원:</strong> 수신기 전자 소자 내부에서 전자들의 <strong>열적 랜덤 운동</strong>(Brownian motion)이
              잡음 전류를 만듭니다. 수많은 독립적인 전자 운동의 합이므로,
              <strong>중심극한정리(CLT)</strong>에 의해 가우시안 분포를 따릅니다.
            </p>
            <p>
              <strong>"White"인 이유:</strong> 열잡음의 전력 스펙트럼 밀도(PSD)는
              <InlineMath math={String.raw`S_w(f) = N_0/2`} /> [W/Hz]로, 관심 대역 내에서 <strong>주파수에 무관하게 균일</strong>합니다.
              이는 잡음의 자기상관이 <InlineMath math={String.raw`R_w(\tau) = (N_0/2)\delta(\tau)`} />임을 의미하며,
              서로 다른 시각의 잡음 샘플이 <strong>완전히 무상관</strong>입니다.
            </p>
            <p>
              <strong>"Additive"인 이유:</strong> 열잡음은 송신 신호와 <strong>무관하게</strong> 수신기 내부에서 발생합니다.
              신호가 있든 없든 동일한 잡음이 더해집니다 — 이것이 "additive"의 의미입니다.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-3 mb-4 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="font-semibold text-slate-700 dark:text-slate-300 mb-1">White → 샘플 간 독립</div>
            <p className="text-slate-600 dark:text-slate-400">
              나이퀴스트 레이트로 샘플링하면 <InlineMath math={String.raw`w[m]`} />과 <InlineMath math={String.raw`w[n]`} />
              (<InlineMath math={String.raw`m \neq n`} />)은 <strong>통계적으로 독립</strong>입니다.
              이 독립성이 있어야 최적 수신기(matched filter, ML detector)의 수학이 깔끔해집니다.
            </p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="font-semibold text-slate-700 dark:text-slate-300 mb-1">I/Q 독립 + 분산 N₀/2</div>
            <p className="text-slate-600 dark:text-slate-400">
              <InlineMath math={String.raw`w = w_I + jw_Q`} />에서
              <InlineMath math={String.raw`w_I, w_Q \sim \mathcal{N}(0, N_0/2)`} />이고 서로 독립.
              <strong>복소 분산</strong> <InlineMath math={String.raw`\text{Var}(w) = E[|w|^2] = N_0`} />.
              I와 Q에 잡음이 균등하게 나뉘는 것이 복소 모델의 자연스러운 결과입니다.
            </p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="font-semibold text-slate-700 dark:text-slate-300 mb-1">원형 대칭 — 위상에 무관</div>
            <p className="text-slate-600 dark:text-slate-400">
              <InlineMath math={String.raw`w`} />에 임의의 위상 <InlineMath math={String.raw`e^{j\theta}`} />를 곱해도 분포가 변하지 않습니다.
              복소 평면에서 원형으로 퍼져 있어 <strong>어떤 방향으로도 편향이 없습니다</strong>.
              이 대칭성이 passband와 baseband에서 잡음 통계가 동일한 이유입니다.
            </p>
          </div>
        </div>

        {/* SNR 정의 */}
        <div className="p-4 bg-indigo-50/60 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800 mb-3">
          <h5 className="font-semibold text-indigo-800 dark:text-indigo-300 text-sm mb-2">SNR: 이 모델에서 정의되는 성능 척도</h5>
          <BlockMath math={String.raw`\text{SNR} = \frac{E_s}{N_0} = \frac{\text{수신 신호 전력}}{\text{잡음 전력}}`} />
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
            AWGN 채널에서 <InlineMath math={String.raw`y = hx + w`} />일 때,
            SNR = <InlineMath math={String.raw`|h|^2 P / N_0`} />. 페이딩 채널에서는 <InlineMath math={String.raw`|h|^2`} />가
            랜덤이므로 SNR 자체가 확률변수가 됩니다 — 이것이 Appendix A의
            outage/error 분석으로 이어집니다. <strong>AWGN은 페이딩이 없는 이상적 기준선</strong>이며,
            모든 페이딩 채널의 성능은 이 기준 대비 얼마나 손해를 보는지로 평가됩니다.
          </p>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-400">
          단순하지만 실제 시스템을 잘 근사하는 이 모델이{' '}
          <button onClick={() => onNavigate('appendix-a')} className="cross-ref !text-xs">Appendix A</button>
          의 검출/추정 이론과 모든 SNR 분석의 기준선이 됩니다.
        </p>
      </div>

      <div className="concept-card mb-6">
        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 mb-3">빠른 판정: Flat vs Frequency-selective</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
          I/O 모델의 핵심 결과: 채널이 flat인지 selective인지에 따라 수신기 구조가 완전히 달라집니다.
          아래 버튼을 눌러 두 경우를 비교하세요.
        </p>
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setMode('flat')}
            className={`px-3 py-1.5 rounded-lg text-sm border ${mode === 'flat' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600'}`}
          >
            Flat (W {'<'} W_c)
          </button>
          <button
            onClick={() => setMode('selective')}
            className={`px-3 py-1.5 rounded-lg text-sm border ${mode === 'selective' ? 'bg-violet-600 text-white border-violet-600' : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600'}`}
          >
            Selective (W {'>'} W_c)
          </button>
        </div>
        {mode === 'flat' ? (
          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700">
            <div className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
              Flat fading (<InlineMath math={String.raw`W \ll W_c`} />)
            </div>
            <BlockMath math={String.raw`y[m] = h[m] \cdot x[m] + w[m]`} />
            <div className="grid md:grid-cols-2 gap-3 mt-3 text-sm text-blue-900 dark:text-blue-200">
              <div>
                <div className="font-semibold text-xs text-blue-700 dark:text-blue-400 mb-1">주파수 영역에서 보면</div>
                <p className="text-xs">
                  신호 대역폭이 coherence bandwidth보다 좁으므로,
                  대역 내 모든 주파수 성분이 <strong>동일한 이득</strong>을 경험합니다.
                  <InlineMath math={String.raw`H(f)`} />가 대역 내에서 "평평"(flat)합니다.
                </p>
              </div>
              <div>
                <div className="font-semibold text-xs text-blue-700 dark:text-blue-400 mb-1">시간 영역에서 보면</div>
                <p className="text-xs">
                  탭이 1개(<InlineMath math="L=1" />)이므로 채널은 단순 <strong>복소 스칼라 곱</strong>입니다.
                  ISI가 없어 등화기가 불필요하며, 채널 추정도 <InlineMath math="h" /> 하나만 추정하면 됩니다.
                </p>
              </div>
            </div>
            <div className="mt-3 p-2 bg-blue-100/60 dark:bg-blue-800/30 rounded-lg text-xs text-blue-800 dark:text-blue-300">
              <strong>실제 예:</strong> LTE 좁은 대역(1.4 MHz)에서 도시 채널(<InlineMath math={String.raw`W_c \approx 1\,\text{MHz}`} />)이면
              경계에 있지만 거의 flat. 실내 WiFi 20 MHz에서 실내 채널(<InlineMath math={String.raw`W_c \approx 20\,\text{MHz}`} />)은 flat.
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-700">
            <div className="font-semibold text-violet-900 dark:text-violet-300 mb-2">
              Frequency-selective fading (<InlineMath math={String.raw`W \gg W_c`} />)
            </div>
            <BlockMath math={String.raw`y[m] = \sum_{\ell=0}^{L-1} h_\ell[m]\,x[m-\ell] + w[m]`} />
            <div className="grid md:grid-cols-2 gap-3 mt-3 text-sm text-violet-900 dark:text-violet-200">
              <div>
                <div className="font-semibold text-xs text-violet-700 dark:text-violet-400 mb-1">주파수 영역에서 보면</div>
                <p className="text-xs">
                  <InlineMath math={String.raw`H(f)`} />가 대역 내에서 크게 변동합니다.
                  어떤 주파수에서는 deep fade, 어떤 주파수에서는 이득이 큽니다.
                  OFDM은 이를 이용하여 <strong>각 서브캐리어를 flat 채널로 변환</strong>합니다.
                </p>
              </div>
              <div>
                <div className="font-semibold text-xs text-violet-700 dark:text-violet-400 mb-1">시간 영역에서 보면</div>
                <p className="text-xs">
                  <InlineMath math="L > 1" /> 탭으로 <strong>ISI(심볼 간 간섭)</strong>가 발생합니다.
                  이전 심볼의 잔향이 현재 심볼과 겹치므로,
                  OFDM, RAKE 수신기, 또는 시간 영역 등화기로 처리해야 합니다.
                </p>
              </div>
            </div>
            <div className="mt-3 p-2 bg-violet-100/60 dark:bg-violet-800/30 rounded-lg text-xs text-violet-800 dark:text-violet-300">
              <strong>실제 예:</strong> LTE 20 MHz에서 도시 채널(<InlineMath math={String.raw`T_d \approx 1\,\mu\text{s}`} />,
              <InlineMath math={String.raw`W_c \approx 1\,\text{MHz}`} />)
              → <InlineMath math={String.raw`W/W_c = 20`} />, 약 21개 탭. 전형적 frequency-selective.
              이것이 LTE가 OFDM을 채택한 이유입니다.
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
