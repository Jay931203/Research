'use client';

import { BlockMath, InlineMath } from 'react-katex';
import ChannelParameterExplorer from '@/components/tse/interactive/ChannelParameterExplorer';

interface Section3Props {
  onNavigate: (id: string) => void;
}

export default function Section3Parameters({ onNavigate }: Section3Props) {
  return (
    <section id="parameters" className="section-card transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <span className="badge badge-amber">Intermediate</span>
        <span className="text-sm text-slate-400">Section 4</span>
      </div>

      <h2 className="text-3xl font-bold text-slate-900 mb-4">2.3 Time and Frequency Coherence</h2>

      <p className="text-lg text-slate-600 leading-relaxed mb-6">
        Multipath/Doppler 직관을 설계 기준으로 바꾸는 단계입니다.
        핵심 원리는 <strong>확산(spread)과 코히런스(coherence)의 역관계</strong>입니다 —
        시간 영역의 확산이 크면 주파수 코히런스가 좁아지고, 주파수 영역의 확산이 크면 시간 코히런스가 짧아집니다.
        이 네 파라미터(<InlineMath math={String.raw`T_d, W_c, D_s, T_c`} />)로 채널 선택성을 판정하고
        OFDM 부반송파 수, 파일럿 간격 등 실제 시스템 파라미터를 설계할 수 있습니다.
      </p>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div id="doppler-spread" className="concept-card">
          <h3 className="font-bold text-lg text-emerald-800 mb-2">2.3.1 Doppler Spread (<InlineMath math="D_s" />)</h3>
          <p className="text-sm text-slate-600 mb-2">
            경로별 도플러 이동의 폭으로, 채널 시간변화 속도를 결정합니다.
            도래각이 다양할수록 도플러 값이 넓게 퍼지며 채널이 빠르게 변합니다.
          </p>
          <BlockMath math={String.raw`D_s := \max_{i,j} f_c|\tau_i'(t) - \tau_j'(t)|`} />
          <p className="text-xs text-slate-500 mt-1">
            Clarke 모델처럼 도래각이 균일하면 <InlineMath math="D_s = 2f_D^{max} = 2vf_c/c" />입니다.
            차량 속도 <InlineMath math="v" />와 반송파 주파수 <InlineMath math="f_c" />에 비례하므로,
            고속 이동 + 고주파 환경에서 도플러 폭이 급격히 커집니다.
          </p>


          <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
            <p className="text-xs font-semibold text-emerald-800 mb-1">채널 탭의 세 가지 시간 스케일</p>
            <p className="text-xs text-slate-600 mb-2">
              이산 시간 채널 탭을 물리적 경로의 합으로 전개하면, 각 성분이 서로 다른 시간 스케일로 변합니다.
            </p>
            <BlockMath math={String.raw`h_\\ell[m] = \\sum_i \\underbrace{|a_i|\\!\\left(\\tfrac{m}{W}\\right)}_{\\text{seconds}} \\; \\underbrace{e^{-j2\\pi f_c \\tau_i(m/W)}}_{\\propto\\, f_c} \\; \\underbrace{\\operatorname{sinc}\\!\\bigl[\\ell - \\tau_i(m/W)W\\bigr]}_{\\propto\\, W}`} />
            <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
              <div className="p-1.5 bg-white rounded border border-emerald-100">
                <span className="font-semibold text-emerald-700">진폭 <InlineMath math="|a_i|" /></span>
                <div className="text-slate-500">수 초~수 분 (shadowing)</div>
              </div>
              <div className="p-1.5 bg-white rounded border border-emerald-100">
                <span className="font-semibold text-emerald-700">위상 <InlineMath math={String.raw`e^{-j2\\pi f_c\\tau_i}`} /></span>
                <div className="text-slate-500"><InlineMath math="f_c" />에 비례하여 빠르게 변화</div>
              </div>
              <div className="p-1.5 bg-white rounded border border-emerald-100">
                <span className="font-semibold text-emerald-700">sinc 커널</span>
                <div className="text-slate-500">대역틭 <InlineMath math="W" />에 비례</div>
              </div>
            </div>
          </div>
        </div>

        <div id="coherence-time" className="concept-card">
          <h3 className="font-bold text-lg text-orange-800 mb-2">Coherence Time (<InlineMath math="T_c" />)</h3>
          <p className="text-sm text-slate-600 mb-2">
            채널이 거의 일정하다고 볼 수 있는 시간 폭입니다.
            이 시간 내에서는 하나의 채널 추정값으로 데이터를 복조할 수 있으며,
            이 시간을 넘기면 채널을 다시 추정해야 합니다.
          </p>
          <BlockMath math={String.raw`T_c \approx \frac{1}{4 D_s}`} />
          <p className="text-xs text-slate-500 mt-1">
            교재(eq. 2.45)의 정의입니다. 핵심은 역비례 관계이며, 계수 4는 π/2 위상 변화를 기준으로 유도됩니다.
            문헌에 따라 계수가 다를 수 있으나(예: <InlineMath math="1/D_s" />), 역비례 구조는 항상 성립합니다.
            파일럿 재전송 주기는 <InlineMath math="T_c" /> 이내여야 합니다.
          </p>


          <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-xs font-semibold text-orange-800 mb-1">Fast vs Slow Fading의 운용적 의미</p>
            <div className="space-y-1.5 text-xs text-slate-600">
              <p>
                <strong className="text-red-700">Fast fading</strong> (<InlineMath math={String.raw`T_c \\ll`} /> delay requirement):
                코히런스 시간이 지연 요구사항보다 짧아서, 코딩된 심볼들이 <strong>여러 독립적인 fade를 경험</strong>합니다.
                채널 코딩으로 시간 다이버시티를 자연스럽게 확보할 수 있습니다.
              </p>
              <p>
                <strong className="text-emerald-700">Slow fading</strong> (<InlineMath math={String.raw`T_c \\gg`} /> delay requirement):
                코히런스 시간이 지연 요구사항보다 훨씬 길어서, 코드워드 전체가 <strong>하나의 fade 안에 갇힙니다</strong>.
                시간 다이버시티를 얻을 수 없으므로, 공간 다이버시티(MIMO)나 주파수 다이버시티(OFDM)에 의존해야 합니다.
              </p>
            </div>
          </div>
        </div>

        <div id="delay-spread" className="concept-card">
          <h3 className="font-bold text-lg text-blue-800 mb-2">2.3.2 Delay Spread (<InlineMath math="T_d" />)</h3>
          <p className="text-sm text-slate-600 mb-2">
            최장 경로와 최단 경로의 도착시간 차이입니다.
            이 값이 클수록 심볼 간 간섭(ISI)이 심해지며,
            OFDM의 CP 길이나 등화기 복잡도를 결정하는 핵심 파라미터입니다.
          </p>
          <BlockMath math={String.raw`T_d := \max_{i,j}|\tau_i(t) - \tau_j(t)|`} />
          <p className="text-xs text-slate-500 mt-1">
            실내: 수십 ns, 도시: 수 μs, 산악: 수십 μs까지 환경에 따라 크게 다릅니다.
            셀 크기가 작아질수록 경로 차이도 줄어들어 <InlineMath math="T_d" />도 감소합니다.
          </p>


          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs font-semibold text-blue-800 mb-1">주파수 응답과 선택적 페이딩의 원리</p>
            <p className="text-xs text-slate-600 mb-2">
              채널의 주파수 응답을 경로별로 전개하면, 경로 간 차별적 위상차(differential phase)가 선택적 페이딩을 일으키는 메커니즘이 드러납니다.
            </p>
            <BlockMath math={String.raw`H(f;\\,t) = \\sum_i a_i(t)\\, e^{-j2\\pi f \\tau_i(t)}`} />
            <p className="text-xs text-slate-500 mt-1">
              두 경로 <InlineMath math="i, k" /> 사이의 위상차 <InlineMath math={String.raw`2\\pi f(\\tau_i - \\tau_k)`} />가
              주파수 <InlineMath math="f" />에 따라 달라지면서 보강/상쇄 간섭이 반복됩니다.
              이 위상차가 <InlineMath math="\pi" />만큼 변하는 주파수 간격이 곧 코히런스 대역틭 <InlineMath math="W_c" />입니다.
            </p>
          </div>
        </div>

        <div id="coherence-bw" className="concept-card">
          <h3 className="font-bold text-lg text-violet-800 mb-2">Coherence Bandwidth (<InlineMath math="W_c" />)</h3>
          <p className="text-sm text-slate-600 mb-2">
            주파수 응답이 거의 일정하다고 볼 수 있는 대역폭입니다.
            OFDM 시스템에서 부반송파 간격을 이 폭 이내로 설정하면
            각 부반송파가 flat fading을 경험하여 간단한 1-tap 등화가 가능해집니다.
          </p>
          <BlockMath math={String.raw`W_c \approx \frac{1}{2 T_d}`} />
          <p className="text-xs text-slate-500 mt-1">
            교재(eq. 2.48)의 정의입니다. 계수 2는 두 경로 간 위상차 <InlineMath math="2\pi f T_d" />가
            <InlineMath math="\pi" />만큼 변할 때 coherence가 깨진다는 물리적 의미에서 유도됩니다.
            OFDM의 CP 길이 설계 시 <InlineMath math="T_d" />를 직접 사용합니다.
          </p>
        </div>
      </div>

            {/* KEY POINT: flat/selective is a relationship, not channel property */}
      <div className="concept-card mb-8" id="bw-vs-coherence">
        <h3 className="font-bold text-lg text-slate-800 mb-3">핵심: Flat vs Selective는 채널만의 성질이 아니다</h3>
        <p className="text-sm text-slate-600 mb-3">
          주파수 선택성은 <strong>채널 자체의 고유 성질이 아니라</strong>,
          신호 대역틭 <InlineMath math="W" />와 코히런스 대역틭 <InlineMath math="W_c" />의 <strong>상대적 관계</strong>에 의해 결정됩니다.
          동일한 채널(동일한 <InlineMath math="W_c" />)이라도 신호 대역틭이 달라지면 flat이 될 수도, selective가 될 수도 있습니다.
        </p>

        <div className="grid md:grid-cols-2 gap-4 mb-3">
          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
            <div className="font-semibold text-sm text-emerald-800 mb-1">
              같은 채널 + 좁은 대역틭 (예: 40 MHz)
            </div>
            <p className="text-xs text-slate-600">
              <InlineMath math={String.raw`W = 40\\,\\text{MHz}`} />,{' '}
              <InlineMath math={String.raw`W_c = 50\\,\\text{MHz}`} />{' '}
              <InlineMath math={String.raw`\\;\\Rightarrow\\; W < W_c`} />
            </p>
            <p className="text-xs text-emerald-700 font-medium mt-1">
              Flat fading — 단일 탭으로 모델링 가능, 간단한 등화
            </p>
          </div>
          <div className="p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="font-semibold text-sm text-red-800 mb-1">
              같은 채널 + 넓은 대역틭 (예: 200 MHz)
            </div>
            <p className="text-xs text-slate-600">
              <InlineMath math={String.raw`W = 200\\,\\text{MHz}`} />,{' '}
              <InlineMath math={String.raw`W_c = 50\\,\\text{MHz}`} />{' '}
              <InlineMath math={String.raw`\\;\\Rightarrow\\; W \\gg W_c`} />
            </p>
            <p className="text-xs text-red-700 font-medium mt-1">
              Frequency-selective — 다중 탭, OFDM이나 등화기 필수
            </p>
          </div>
        </div>
        <p className="text-xs text-slate-500">
          따라서 &quot;이 채널은 flat이다/selective이다&quot;라고 단정할 수 없고,
          항상 &quot;이 대역틭에서 이 채널은...&quot;이라고 표현해야 정확합니다.
          5G NR에서 같은 셀이라도 sub-6 GHz (좁은 BW)와 mmWave (넓은 BW)에서 선택성이 달라지는 것이 이 원리의 직접적 예시입니다.
        </p>
      </div>

      <div className="compare-grid mb-8">
        <div className="compare-item border-blue-200 bg-blue-50/40">
          <h4 className="font-bold text-blue-800 mb-3">주파수 선택성 판정</h4>

          <div className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-3 mb-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
              <span className="font-semibold text-sm text-emerald-800">
                <InlineMath math={String.raw`W \ll W_c`} />: Flat Fading
              </span>
              <span className="ml-auto text-xs font-medium text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">단순</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              신호 대역폭이 코히런스 대역폭보다 훨씬 좁아서, <strong>대역폭 내에서 채널 이득이 거의 일정</strong>합니다.
              모든 주파수 성분이 같은 감쇠와 위상을 겪기 때문에 심볼 파형이 보존되고 ISI가 발생하지 않습니다.
              수신기는 단일 곱셈(1-tap)으로 등화할 수 있어 구조가 매우 단순합니다.
            </p>
          </div>

          <div className="rounded-lg border border-red-200 bg-red-50/50 p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0" />
              <span className="font-semibold text-sm text-red-800">
                <InlineMath math={String.raw`W \gg W_c`} />: Frequency-Selective Fading
              </span>
              <span className="ml-auto text-xs font-medium text-red-600 bg-red-100 px-1.5 py-0.5 rounded">복잡</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              신호 대역폭이 코히런스 대역폭을 크게 초과하여, <strong>주파수에 따라 채널 이득이 달라집니다</strong>.
              서로 다른 주파수 성분이 다른 감쇠를 겪으므로 심볼이 왜곡(ISI)되며,
              OFDM으로 대역을 분할하거나 다중 탭 등화기(equalizer)가 필요합니다.
            </p>
          </div>

          <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <p className="text-xs text-slate-600">
              <strong>설계 시사점:</strong> Flat이면 수신기가 단순해지고, selective면 OFDM이나 등화기가 필수입니다.
              LTE/5G가 OFDM을 쓰는 근본 이유가 바로 광대역 채널의 frequency-selective 특성 때문입니다.
            </p>
          </div>
        </div>

        <div className="compare-item border-orange-200 bg-orange-50/40">
          <h4 className="font-bold text-orange-800 mb-3">시간 선택성 판정</h4>

          <div className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-3 mb-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
              <span className="font-semibold text-sm text-emerald-800">
                <InlineMath math={String.raw`T_s \ll T_c`} />: Slow Fading
              </span>
              <span className="ml-auto text-xs font-medium text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">단순</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              심볼 구간이 코히런스 시간보다 훨씬 짧아서, <strong>한 심볼 구간 내에서 채널이 거의 변하지 않습니다</strong>.
              한 번 채널을 추정하면 여러 심볼에 걸쳐 재사용할 수 있어 파일럿 오버헤드가 적고,
              코히런트 검파(coherent detection)가 안정적으로 동작합니다.
            </p>
          </div>

          <div className="rounded-lg border border-red-200 bg-red-50/50 p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0" />
              <span className="font-semibold text-sm text-red-800">
                <InlineMath math={String.raw`T_s \gtrsim T_c`} />: Fast Fading
              </span>
              <span className="ml-auto text-xs font-medium text-red-600 bg-red-100 px-1.5 py-0.5 rounded">복잡</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              심볼 구간 중간에도 채널이 변해버려서, <strong>매 심볼마다 채널을 다시 추정</strong>해야 합니다.
              파일럿 오버헤드가 크게 증가하며, 극단적인 경우 차등 변조(differential modulation)로
              채널 추정 없이 검파하거나, 인터리빙으로 시간 다이버시티를 확보해야 합니다.
            </p>
          </div>

          <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <p className="text-xs text-slate-600">
              <strong>설계 시사점:</strong> Slow면 파일럿 간격을 넓게 잡아 효율을 높이고,
              fast면 파일럿 밀도를 높이거나 차등 부호화를 고려해야 합니다.
              이동 속도가 빨라질수록 fast fading 영역에 가까워집니다.
            </p>
          </div>
        </div>
      </div>

      <div id="underspread" className="insight mb-8">
        <div className="insight-title">Underspread Channel (TSE Chapter 2 Main Plot)</div>
        <p className="text-sm text-amber-900 mb-3">
          실제 무선 채널은 보통 <InlineMath math={String.raw`T_d \ll T_c`} /> 조건을 만족하는 underspread 영역에 있습니다.
          이 성질 덕분에 탭 기반 모델과 파일럿 기반 추정이 실용적으로 작동합니다.
        </p>

        <div className="space-y-2.5">
          <div className="bg-amber-100/50 rounded-lg p-3 border border-amber-200">
            <p className="text-sm font-semibold text-amber-800 mb-1">왜 대부분의 실제 채널은 underspread인가?</p>
            <p className="text-xs text-amber-900 leading-relaxed">
              Delay spread(<InlineMath math="T_d" />)는 다중경로 도착 시간차로 보통 <strong>us 단위</strong>이고,
              coherence time(<InlineMath math="T_c" />)은 도플러에 의한 채널 변화 시간으로 보통 <strong>ms 단위</strong>입니다.
              두 값 사이에 3자리(1000배) 이상의 차이가 존재하기 때문에, <InlineMath math={String.raw`T_d/T_c \ll 1`} /> 조건이
              자연스럽게 성립합니다. 빛의 속도가 매우 빠르므로 경로 지연은 짧고, 이동체 속도가 빛보다 훨씬 느리므로 채널 변화는 상대적으로 느립니다.
            </p>
          </div>

          <div className="bg-amber-100/50 rounded-lg p-3 border border-amber-200">
            <p className="text-sm font-semibold text-amber-800 mb-1">만약 underspread가 아니라면?</p>
            <p className="text-xs text-amber-900 leading-relaxed">
              <InlineMath math={String.raw`T_d \gtrsim T_c`} />이면 채널이 <strong>자기 자신의 지연 구간 안에서도 변해버립니다</strong>.
              이 경우 탭 지연 모델(<InlineMath math={String.raw`h(t,\tau)=\sum a_k(t)\delta(\tau-\tau_k)`} />)의
              각 탭 계수 <InlineMath math="a_k(t)" />가 한 심볼 구간 내에서 급변하므로, 탭 모델 자체가 무의미해지고
              파일럿 기반 채널 추정도 불가능해집니다. 다행히 실제 통신 환경에서는 이런 극단적 상황이 거의 발생하지 않습니다.
            </p>
          </div>

          <div className="bg-amber-100/50 rounded-lg p-3 border border-amber-200">
            <p className="text-sm font-semibold text-amber-800 mb-1">구체적 수치 예시</p>
            <p className="text-xs text-amber-900 leading-relaxed">
              LTE 도시 환경: <InlineMath math={String.raw`T_d \approx 1\,\mu\text{s}`} />,{' '}
              <InlineMath math={String.raw`T_c \approx 2.5\,\text{ms}`} />{' '}
              <InlineMath math={String.raw`\;\Rightarrow\; T_d/T_c \approx 0.0004`} /> (매우 강한 underspread).
              즉, 채널이 변하기까지 걸리는 시간 안에 지연 확산의 2,500배에 달하는 시간이 있으므로,
              수천 개의 심볼을 하나의 채널 추정값으로 안전하게 복조할 수 있습니다.
            </p>
          </div>
        </div>
      </div>

      <ChannelParameterExplorer />

      <div className="concept-card mt-8 mb-6" id="table-2-1">
        <h3 className="font-bold text-lg text-slate-800 mb-3">Table 2.1 — 대표 파라미터 시나리오 (TSE 교재 기준)</h3>
        <p className="text-xs text-slate-500 mb-3">
          교재 Table 2.1의 기준 시나리오: <InlineMath math="f_c=1\text{ GHz}" />, <InlineMath math="W=1\text{ MHz}" />,
          {' '}<InlineMath math="d=1\text{ km}" />, <InlineMath math="v=64\text{ km/h}" />
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-100">
                <th className="text-left px-3 py-2 border border-slate-200 font-semibold text-slate-700">파라미터</th>
                <th className="text-left px-3 py-2 border border-slate-200 font-semibold text-slate-700">기호</th>
                <th className="text-right px-3 py-2 border border-slate-200 font-semibold text-blue-700">대표값</th>
                <th className="text-left px-3 py-2 border border-slate-200 font-semibold text-slate-700">의미</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: '반송파 주파수', sym: 'f_c', val: '1 GHz', note: '기준값' },
                { name: '통신 대역폭', sym: 'W', val: '1 MHz', note: '기준값' },
                { name: '이동 속도', sym: 'v', val: '64 km/h', note: '기준값' },
                { name: '경로 도플러 시프트', sym: 'D = f_c v/c', val: '~50 Hz', note: '단일 경로' },
                { name: '도플러 확산', sym: 'D_s', val: '~100 Hz', note: '두 경로 차이' },
                { name: '위상 변화 시간', sym: '1/(4D)', val: '~5 ms', note: 'π/2 위상 변화' },
                { name: '코히런스 시간', sym: 'T_c = 1/(4D_s)', val: '~2.5 ms', note: '채널 추정 유효 구간' },
                { name: '지연 확산', sym: 'T_d', val: '~1 μs', note: '도시 환경 대표값' },
                { name: '코히런스 대역폭', sym: 'W_c = 1/(2T_d)', val: '~500 kHz', note: '주파수 flat 구간' },
                { name: '경로 진폭 변화 시간', sym: 'd/v', val: '~1 분', note: '수 초~수 분 단위' },
              ].map((row, i) => (
                <tr key={row.sym} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="px-3 py-1.5 border border-slate-200 text-slate-700">{row.name}</td>
                  <td className="px-3 py-1.5 border border-slate-200 font-mono text-xs">
                    <InlineMath math={row.sym} />
                  </td>
                  <td className="px-3 py-1.5 border border-slate-200 text-right font-bold text-blue-700">{row.val}</td>
                  <td className="px-3 py-1.5 border border-slate-200 text-slate-500 text-xs">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          위 값들은 order-of-magnitude 추정치입니다. 실제 값은 환경에 따라 크게 다를 수 있습니다.
          아래 ChannelParameterExplorer와 LTE 예제에서 다른 시나리오를 직접 계산해보세요.
        </p>
      </div>

      <div className="concept-card mt-8" id="lte-example">
        <h3 className="font-bold text-lg text-slate-800 mb-4">실전 예: LTE 2 GHz, 120 km/h, 도시 채널</h3>

        <div className="space-y-4 mb-5">
          <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4">
            <h4 className="font-semibold text-sm text-blue-800 mb-2">Step 1: 도플러 계산</h4>
            <div className="text-sm text-slate-600 mb-2">
              이동 속도를 m/s로 변환: <InlineMath math={String.raw`v = 120\,\text{km/h} = \frac{120}{3.6} \approx 33.3\,\text{m/s}`} />
            </div>
            <BlockMath math={String.raw`f_D^{max} = \frac{v \cdot f_c}{c} = \frac{33.3 \times 2 \times 10^9}{3 \times 10^8} \approx 222\,\text{Hz}`} />
            <div className="text-sm text-slate-600 mt-2">
              Clarke 모델(균일 도래각) 가정 시: <InlineMath math={String.raw`D_s = 2 f_D^{max} \approx 444\,\text{Hz}`} />
            </div>
          </div>

          <div className="rounded-xl border border-orange-200 bg-orange-50/40 p-4">
            <h4 className="font-semibold text-sm text-orange-800 mb-2">Step 2: 코히런스 파라미터 산출</h4>
            <div className="grid md:grid-cols-2 gap-3 text-sm text-slate-600">
              <div>
                <div className="font-medium text-slate-700 mb-1">시간 코히런스:</div>
                <BlockMath math={String.raw`T_c = \frac{1}{4 D_s} = \frac{1}{4 \times 444} \approx 0.56\,\text{ms}`} />
                <p className="text-xs text-slate-500 mt-1">
                  교재 기준(eq 2.45). 문헌에 따라 <InlineMath math={String.raw`1/D_s \approx 2.25\,\text{ms}`} />로 쓰기도 합니다.
                </p>
              </div>
              <div>
                <div className="font-medium text-slate-700 mb-1">주파수 코히런스:</div>
                <BlockMath math={String.raw`W_c = \frac{1}{2 T_d} = \frac{1}{2 \times 10^{-6}} = 500\,\text{kHz}`} />
                <p className="text-xs text-slate-500 mt-1">
                  도시 환경 <InlineMath math={String.raw`T_d \approx 1\,\mu\text{s}`} /> 가정.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4">
            <h4 className="font-semibold text-sm text-emerald-800 mb-2">Step 3: 선택성 판정 및 설계 결정</h4>
            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex items-start gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                <p>
                  <strong>주파수:</strong> <InlineMath math={String.raw`W = 20\,\text{MHz} \gg W_c = 500\,\text{kHz}`} />{' '}
                  <span className="font-medium text-red-700">frequency-selective</span>. 단일 반송파로는 ISI가 심해 OFDM이 필수입니다.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                <p>
                  <strong>시간:</strong> LTE 심볼 길이 <InlineMath math={String.raw`T_s \approx 71.4\,\mu\text{s}`} /> (CP 포함){' '}
                  <InlineMath math={String.raw`\ll T_c \approx 0.56\text{-}2.25\,\text{ms}`} />{' '}
                  <span className="font-medium text-emerald-700">slow fading</span>. 한 슬롯(0.5ms) 내에서 채널이 거의 일정합니다.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                <p>
                  <strong>부반송파:</strong> LTE 부반송파 간격 <InlineMath math={String.raw`\Delta f = 15\,\text{kHz} \ll W_c = 500\,\text{kHz}`} />이므로,
                  각 부반송파는 <span className="font-medium text-blue-700">flat fading</span>을 경험합니다.
                  이것이 OFDM의 핵심 설계 원리입니다: 광대역 selective 채널을 좁은 flat 부채널들로 분할합니다.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-violet-200 bg-violet-50/40 p-4 mb-4">
          <h4 className="font-semibold text-sm text-violet-800 mb-2">시스템 비교: WiFi vs LTE vs 5G NR</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="text-left px-2.5 py-1.5 border border-slate-200 font-semibold text-slate-700">항목</th>
                  <th className="text-center px-2.5 py-1.5 border border-slate-200 font-semibold text-slate-700">WiFi 5 GHz</th>
                  <th className="text-center px-2.5 py-1.5 border border-slate-200 font-semibold text-blue-700">LTE 2 GHz</th>
                  <th className="text-center px-2.5 py-1.5 border border-slate-200 font-semibold text-slate-700">5G NR 28 GHz</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { item: '대역폭 W', wifi: '80 MHz', lte: '20 MHz', nr: '400 MHz' },
                  { item: '대표 속도 v', wifi: '~3 km/h (보행)', lte: '120 km/h', nr: '30 km/h' },
                  { item: 'f_D^{max}', wifi: '~14 Hz', lte: '~222 Hz', nr: '~778 Hz' },
                  { item: 'T_d (도시)', wifi: '~50 ns (실내)', lte: '~1 us', nr: '~100 ns' },
                  { item: 'W_c', wifi: '~10 MHz', lte: '~500 kHz', nr: '~5 MHz' },
                  { item: '부반송파 간격', wifi: '312.5 kHz', lte: '15 kHz', nr: '120 kHz' },
                  { item: '주파수 선택성', wifi: 'Selective', lte: 'Selective', nr: 'Selective' },
                ].map((row, i) => (
                  <tr key={row.item} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="px-2.5 py-1 border border-slate-200 text-slate-700 font-medium">
                      {row.item.includes('^') || row.item.includes('_') ? <InlineMath math={row.item} /> : row.item}
                    </td>
                    <td className="px-2.5 py-1 border border-slate-200 text-center text-slate-600">{row.wifi}</td>
                    <td className="px-2.5 py-1 border border-slate-200 text-center font-semibold text-blue-700">{row.lte}</td>
                    <td className="px-2.5 py-1 border border-slate-200 text-center text-slate-600">{row.nr}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            세 시스템 모두 광대역이라 frequency-selective이므로 OFDM을 사용합니다.
            5G NR은 mmWave 고주파 대역에서 도플러가 훨씬 커지므로 부반송파 간격을 120 kHz로 넓혀
            심볼 시간을 단축하고 도플러 내성을 확보합니다.
          </p>
        </div>

        <p className="text-xs text-slate-500">
          이 판정이 바로 OFDM 부반송파 수(1200개), 파일럿 밀도(시간/주파수 양 축), 등화기 복잡도 설계를 결정합니다.
          위 계산 과정을 ChannelParameterExplorer에서 슬라이더를 움직이며 직접 확인해 보세요.
        </p>
      </div>

      <div className="insight mt-8">
        <div className="insight-title">학습 연결</div>
        <p className="text-sm text-amber-900">
          코히런스 파라미터로 채널의 선택성을 판정할 수 있게 되었습니다.
          다음 단계에서는 탭 계수의 정확한 값 대신 <strong>확률 분포</strong>를 모델링합니다.
          Rayleigh/Rician 분포와 시간 상관함수가 링크 신뢰도 분석의 기초가 됩니다.
          <button onClick={() => onNavigate('statistical')} className="cross-ref !text-xs ml-1">2.4 Statistical Models</button>
        </p>
      </div>
    </section>
  );
}
