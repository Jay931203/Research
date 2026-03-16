'use client';

import { BlockMath, InlineMath } from 'react-katex';
import PathLossCalculator from '@/components/tse/interactive/PathLossCalculator';
import TwoRayGroundReflectionLab from '@/components/tse/interactive/TwoRayGroundReflectionLab';

interface Section1Props {
  onNavigate: (id: string) => void;
}

export default function Section1Introduction({ onNavigate }: Section1Props) {
  return (
    <section id="intro" className="section-card transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <span className="badge badge-blue">Beginner</span>
        <span className="text-sm text-slate-400">Section 1</span>
      </div>

      <h2 className="text-3xl font-bold text-slate-900 mb-4">2.1 Physical Modeling for Wireless Channels</h2>
      <p className="text-lg text-slate-600 leading-relaxed mb-6">
        무선 채널을 이해하려면, 전자기파가 공간을 통해 전파되면서 겪는 현상들을 구분하는 것에서 시작합니다.
        왜 유선보다 까다로운지는, 두 가지 스케일의 변동이 동시에 존재한다는 점에서 비롯됩니다.
        먼저 큰 그림부터 살펴보겠습니다.
      </p>

      <div className="grid md:grid-cols-2 gap-4 mb-7">
        <div className="concept-card">
          <div className="text-xs font-semibold text-blue-600 mb-1">Large-scale fading</div>
          <h3 className="font-bold text-slate-800 mb-2">거리·지형에 따른 평균 감쇠</h3>
          <p className="text-sm text-slate-600 mb-2">
            기지국에서 멀어질수록 신호가 약해지는 것은 직관적입니다.
            문제는 "얼마나 빨리 약해지느냐"인데, 이를 거리 지수 <InlineMath math="n" />으로 표현합니다.
            장애물이 많은 도심(n≈4)은 자유공간(n=2)보다 신호가 훨씬 빠르게 줄어듭니다.
          </p>
          <BlockMath math={String.raw`P_r \propto d^{-n},\quad n\in[2,4+]`} />
        </div>
        <div className="concept-card">
          <div className="text-xs font-semibold text-red-600 mb-1">Small-scale fading</div>
          <h3 className="font-bold text-slate-800 mb-2">파장 스케일의 빠른 변동</h3>
          <p className="text-sm text-slate-600 mb-2">
            다중경로로 들어온 신호들이 서로 상쇄하면서,
            불과 몇 cm 이동에도 수십 dB의 deep fade가 발생할 수 있습니다.
            이 빠른 변동이 링크 신뢰도의 핵심 위협이며,
            이를 다루기 위해 통계 모델과 다이버시티 기법이 필요해집니다.
          </p>
          <BlockMath math={String.raw`h(t,\tau)=\sum_i a_i(t)e^{j\phi_i(t)}\delta(\tau-\tau_i)`} />
        </div>
      </div>

      <div className="formula-block mb-6" id="free-space-model">
        <h4 className="font-semibold text-blue-800 mb-3">2.1.1 Free-space, fixed antennas (Friis)</h4>
        <p className="text-sm text-slate-600 mb-3">
          자유공간, 원거리장(far field), 시간조화(time-harmonic) 조건에서 수신 안테나의 반작용이 없다고 가정합니다.
          이 조건에서 전기장과 주파수 응답은:
        </p>
        <BlockMath math={String.raw`E(f,t,r,\theta,\psi) = \frac{\alpha(f,\theta,\psi)\cos\!\bigl(2\pi f(t - r/c)\bigr)}{r}`} />
        <div className="mt-2 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800">
          <div className="text-xs font-semibold text-indigo-700 dark:text-indigo-400 mb-1">주파수 응답 (Transfer Function)</div>
          <BlockMath math={String.raw`H(f) \;:=\; \frac{\alpha(f,\theta,\psi)\,e^{-j2\pi f r/c}}{r}`} />
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            이 시스템은 <strong>LTI(선형시불변)</strong>입니다 — 송수신기가 고정이므로 <InlineMath math="r" />이 상수.
            위상항 <InlineMath math="e^{-j2\pi fr/c}" />는 전파 지연을 나타내고, <InlineMath math="1/r" /> 감쇠가 곱해집니다.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-3 mt-3 text-sm text-slate-600 dark:text-slate-400">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-100 dark:border-blue-800">
            <div className="font-semibold text-blue-700 dark:text-blue-400">전기장 감쇠</div>
            <BlockMath math={String.raw`|E| \propto r^{-1},\quad |E|^2 \propto r^{-2}`} />
            <div className="text-xs">전기장은 거리에 반비례, 전력(|E|²)은 거리 제곱에 반비례</div>
          </div>
          <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-100 dark:border-green-800">
            <div className="font-semibold text-green-700 dark:text-green-400">Friis 수신 전력</div>
            <BlockMath math={String.raw`P_r = P_t G_t G_r\!\left(\frac{\lambda}{4\pi d}\right)^{\!2}`} />
            <div className="text-xs">안테나 이득을 포함한 실용 공식</div>
          </div>
        </div>
        <div className="text-sm text-slate-600 dark:text-slate-400 mt-3">
          장애물 없이 신호가 직진하는 이상적인 경우입니다.
          이때도 거리가 2배면 수신전력은 1/4로 줄어듭니다(<InlineMath math="d^{-2}" />).
          모든 경로손실 모델의 출발점이 되며,
          실제 환경에서는 반사·회절·산란이 더해져 감쇠가 더 커집니다.
        </div>
      </div>

      <div className="concept-card mb-6" id="moving-antenna-model">
        <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">2.1.2 Free-space, moving antenna</h4>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
          수신기가 속도 <InlineMath math="v" />로 이동하면, 시스템은 더 이상 LTI가 아닙니다.
          거리가 시간의 함수가 되면서 <strong>시변(time-variant)</strong> 특성이 나타납니다.
        </p>
        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 mb-3">
          <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">도플러 시프트 유도 과정</div>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="shrink-0 w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs flex items-center justify-center font-bold">1</span>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                이동 거리: <InlineMath math={String.raw`r(t) = r_0 + vt`} />
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="shrink-0 w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs flex items-center justify-center font-bold">2</span>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                수신 전기장에 대입:
              </div>
            </div>
          </div>
          <BlockMath math={String.raw`E = \frac{\alpha\cos\!\bigl(2\pi f\bigl[\bigl(1-\tfrac{v}{c}\bigr)t - \tfrac{r_0}{c}\bigr]\bigr)}{r_0 + vt}`} />
          <div className="flex items-start gap-2">
            <span className="shrink-0 w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs flex items-center justify-center font-bold">3</span>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              주파수가 <InlineMath math={String.raw`f \to (1 - v/c)f`} />로 변환됨 → 도플러 시프트:
            </div>
          </div>
          <BlockMath math={String.raw`D_1 = -\frac{fv}{c}`} />
        </div>
        <BlockMath math={String.raw`f_D = \frac{v f_c}{c}\cos\theta`} />
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
          전파 방향으로 접근하면(<InlineMath math={String.raw`\theta=0`} />) 최대 양의 시프트,
          멀어지면(<InlineMath math={String.raw`\theta=\pi`} />) 최대 음의 시프트가 발생합니다.
          직교 방향(<InlineMath math={String.raw`\theta=\pi/2`} />)에서는 도플러가 0입니다.
        </p>
      </div>

      <div className="concept-card mb-6" id="wall-reflection-model">
        <h4 className="font-semibold text-slate-800 mb-2">2.1.3/2.1.4 Reflecting wall (fixed/moving)</h4>
        <p className="text-sm text-slate-600 mb-2">
          반사면이 하나만 추가되어도 채널 특성이 크게 달라집니다.
          직접경로와 반사경로의 <strong>위상차</strong>에 따라
          보강 간섭(신호 증가)과 상쇄 간섭(deep fade)이 반복됩니다.
          이것이 multipath fading의 가장 기본적인 예시입니다.
        </p>
        <BlockMath math={String.raw`\Delta\theta = \frac{4\pi f}{c}(d - r) + \pi`} />
        <ul className="text-sm text-slate-600 space-y-1 mt-2 list-disc list-inside">
          <li>위상차가 <InlineMath math="2\pi" />의 정수배이면 보강 간섭 — 두 신호가 동위상으로 합산</li>
          <li>위상차가 <InlineMath math="\pi" />의 홀수배이면 상쇄 간섭 — deep fade 발생</li>
        </ul>
        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <div className="text-xs font-semibold text-blue-700 mb-1">Coherence Distance (eq. 2.8)</div>
          <BlockMath math={String.raw`\Delta x_c = \frac{\lambda}{4}`} />
          <p className="text-xs text-slate-600 mt-1">
            peak에서 valley까지의 공간 거리가 파장의 1/4입니다.
            900 MHz에서 λ ≈ 33 cm이므로 <strong>약 8 cm 이동</strong>에 peak→valley가 발생합니다.
            이것이 소형 기기가 불과 수 cm 위치 변화에도 신호가 크게 변하는 이유입니다.
          </p>
        </div>
        <div className="mt-2 p-3 bg-amber-50 rounded-lg border border-amber-100">
          <div className="text-xs font-semibold text-amber-700 mb-1">Delay Spread &amp; Coherence Bandwidth (eq. 2.10)</div>
          <BlockMath math={String.raw`T_d = \frac{2d-r}{c} - \frac{r}{c},\quad W_c \sim \frac{1}{T_d}`} />
          <p className="text-xs text-slate-600 mt-1">
            두 경로의 전파 지연 차이 <InlineMath math="T_d" />가 delay spread이며,
            이 값의 역수가 채널이 주파수에서 일정하다고 볼 수 있는 폭(coherence bandwidth)입니다.
          </p>
        </div>
        <div className="mt-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
          <div className="text-xs font-semibold text-purple-700 dark:text-purple-400 mb-1">2.1.4 이동 시: Doppler Spread &amp; Coherence Time</div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
            수신기가 이동하면 두 경로에 각각 다른 도플러 시프트가 적용됩니다:
          </p>
          <BlockMath math={String.raw`D_1 = -\frac{fv}{c},\quad D_2 = +\frac{fv}{c}`} />
          <BlockMath math={String.raw`D_s = D_2 - D_1 = \frac{2fv}{c}`} />
          <BlockMath math={String.raw`T_c = \frac{1}{2D_s} \quad\Leftarrow\quad \frac{4\pi f v}{c}\cdot\frac{c}{4fv} = \pi`} />
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            위상차가 <InlineMath math="\pi" /> 변하는 데 걸리는 시간이 coherence time이며,
            이 시간 내에서는 채널이 거의 일정하다고 볼 수 있습니다.
          </p>
        </div>
      </div>

      <div className="concept-card mb-6" id="ground-plane-model">
        <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">2.1.5 Reflection from a Ground Plane</h4>
        <div className="mb-2 p-2 bg-rose-50 dark:bg-rose-900/20 rounded border border-rose-100 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-300">
          <strong>조건:</strong> <InlineMath math={String.raw`r \gg h_s,\; h_r`} /> 이고 <InlineMath math={String.raw`r_1 - r_2 \ll \lambda`} /> — 반사 시 부호 반전(sign reversal)이 핵심
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
          송수신 안테나가 모두 지면 위에 있을 때, 수평 거리 <InlineMath math="r" />이 안테나 높이에 비해
          충분히 커지면 직접 경로와 지면 반사 경로의 <strong>경로 차이가 0에 수렴</strong>합니다.
          반사 시 부호가 반전되므로 두 경로가 거의 상쇄되며, 수신 전력은 예상보다 훨씬 빠르게 감소합니다.
        </p>
        <BlockMath math={String.raw`P_r \propto d^{-2}\;\xrightarrow{\;r \gg h_t, h_r\;}\; P_r \propto d^{-4}`} />
        <div className="grid md:grid-cols-2 gap-3 mt-2 text-sm text-slate-600">
          <div className="p-2 bg-sky-50 rounded border border-sky-100">
            <div className="font-semibold text-sky-700">교차 거리(crossover distance)</div>
            <BlockMath math={String.raw`d_c = \frac{4\pi h_t h_r}{\lambda}`} />
            <div className="text-xs text-slate-500">이 거리 이후부터 d⁻⁴ 영역이 됩니다</div>
          </div>
          <div className="p-2 bg-teal-50 rounded border border-teal-100">
            <div className="font-semibold text-teal-700">실용적 의미</div>
            <div className="text-xs mt-1">
              농촌/도로 환경에서 기지국이 도로변에 위치할 때 d⁻⁴ 감쇠가 지배적입니다.
              d⁻² 대비 coverage가 급격히 줄어들어 기지국 배치 간격에 직접 영향을 줍니다.
            </div>
          </div>
        </div>
      </div>

      <TwoRayGroundReflectionLab />

      <PathLossCalculator />

      <div className="concept-card mb-6" id="shadowing-model">
        <h4 className="font-semibold text-slate-800 mb-2">2.1.6 Power decay with distance and shadowing</h4>
        <BlockMath math={String.raw`PL(d)=PL(d_0)+10n\log_{10}(d/d_0)+X_{\sigma}`} />
        <p className="text-sm text-slate-600 mt-2">
          실제 환경에서는 건물, 언덕, 수목 등 장애물에 의한 차폐(shadowing) 효과가 추가됩니다.
          이 모델은 세 요소를 분리합니다:
        </p>
        <ul className="text-sm text-slate-600 list-disc list-inside space-y-1 mt-2">
          <li><strong>기준 손실</strong> <InlineMath math={String.raw`PL(d_0)`} />: 참조 거리에서의 측정/계산값</li>
          <li><strong>거리 감쇠</strong>: 지수 <InlineMath math="n" />이 환경을 반영 (자유공간 2, 도심 3~5)</li>
          <li><strong>섀도잉</strong> <InlineMath math="X_{\\sigma}" />: 로그정규 분포 <InlineMath math={String.raw`\sim\mathcal{N}(0,\sigma^2)`} />(dB 스케일)로 장소별 랜덤 변동을 포착</li>
        </ul>
        <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-100 dark:border-emerald-800">
          <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1">빠른 감쇠가 도움이 되는 이유</div>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            직관과 달리, 빠른 신호 감쇠는 셀룰러 시스템에서 <strong>이점</strong>이 됩니다.
            인접 셀 간 간섭이 줄어들어 주파수 재사용이 용이해지기 때문입니다.
            즉, 셀이 <strong>커버리지 제한</strong>이 아닌 <strong>용량 제한</strong> 상태가 되어
            전체 시스템 용량이 증가합니다.
          </p>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
          이 모델은 셀 커버리지 계획의 핵심 도구이며, <InlineMath math={String.raw`\sigma`} />는 보통 6~12 dB 범위입니다.
        </p>
      </div>

      <div className="insight" id="multi-reflector-model">
        <div className="insight-title">2.1.7 반사체가 수백 개라면? — 통계 모델이 필요한 이유</div>
        <p className="text-sm text-amber-900 dark:text-amber-200 mb-2">
          반사체가 하나일 때는 기하학적 해석이 가능하지만,
          실제 환경에서는 수십~수백 개의 산란체가 존재하여 개별 추적이 사실상 불가능합니다.
        </p>
        <div className="grid md:grid-cols-2 gap-3 mb-3">
          <div className="p-2 bg-amber-100/50 dark:bg-amber-900/30 rounded border border-amber-200 dark:border-amber-700 text-xs text-amber-900 dark:text-amber-200">
            <strong>선형성은 유지:</strong> 경로가 아무리 많아도 합의 원리는 성립합니다.
            다만 반사체 배치에 따라 경로 수식이 달라질 뿐입니다
            (예: <InlineMath math={String.raw`[d/(d-r)]^2`} /> vs <InlineMath math={String.raw`[2d-r]^2`} />).
          </div>
          <div className="p-2 bg-amber-100/50 dark:bg-amber-900/30 rounded border border-amber-200 dark:border-amber-700 text-xs text-amber-900 dark:text-amber-200">
            <strong>산란(scattering):</strong> 개별 경로 합 대신,
            무한히 작은 경로 차이를 갖는 <strong>적분</strong>으로 모델링하는 것이 현실적입니다.
          </div>
        </div>
        <p className="text-sm text-amber-900 dark:text-amber-200">
          이 복잡성을 다루기 위해 TSE는 두 가지 추상화를 도입합니다:
          (1) 연속 전파를 이산 탭으로 요약하는{' '}
          <button onClick={() => onNavigate('io-model')} className="cross-ref !text-xs">2.2 I/O 모델</button>,
          (2) 각 탭을 확률 과정으로 모델링하는{' '}
          <button onClick={() => onNavigate('statistical')} className="cross-ref !text-xs">2.4 통계 모델</button>.
          먼저{' '}
          <button onClick={() => onNavigate('multipath')} className="cross-ref !text-xs">Multipath 직관</button>
          에서 다중경로 합성이 어떤 물리적 효과를 만드는지 확인한 후 수학 모델로 넘어갑니다.
        </p>
      </div>
    </section>
  );
}
