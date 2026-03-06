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

      <div className="compare-grid mb-8">
        <div className="compare-item border-blue-200 bg-blue-50/40">
          <h4 className="font-bold text-blue-800 mb-2">주파수 선택성 판정</h4>
          <ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
            <li><InlineMath math={String.raw`W \ll W_c`} />: Flat fading</li>
            <li><InlineMath math={String.raw`W \gg W_c`} />: Frequency-selective fading</li>
          </ul>
        </div>
        <div className="compare-item border-orange-200 bg-orange-50/40">
          <h4 className="font-bold text-orange-800 mb-2">시간 선택성 판정</h4>
          <ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
            <li><InlineMath math={String.raw`T_s \ll T_c`} />: Slow fading</li>
            <li><InlineMath math={String.raw`T_s \gtrsim T_c`} />: Fast fading</li>
          </ul>
        </div>
      </div>

      <div id="underspread" className="insight mb-8">
        <div className="insight-title">Underspread Channel (TSE Chapter 2 Main Plot)</div>
        <p className="text-sm text-amber-900">
          실제 무선 채널은 보통 <InlineMath math={String.raw`T_d \ll T_c`} /> 조건을 만족하는 underspread 영역에 있습니다.
          이 성질 덕분에 탭 기반 모델과 파일럿 기반 추정이 실용적으로 작동합니다.
        </p>
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
        <h3 className="font-bold text-lg text-slate-800 mb-3">실전 예: LTE 2 GHz, 120 km/h, 도시 채널</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-slate-600">
          <div>
            <div><InlineMath math={String.raw`f_D^{max}`} /> ≈ 222 Hz, <InlineMath math={String.raw`D_s`} /> ≈ 444 Hz</div>
            <div><InlineMath math={String.raw`T_c`} /> ≈ 2.25 ms</div>
          </div>
          <div>
            <div><InlineMath math={String.raw`T_d`} /> ≈ 1 μs이면 <InlineMath math={String.raw`W_c`} /> ≈ 1 MHz</div>
            <div>20 MHz 시스템은 frequency-selective로 동작</div>
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-3">
          이 판정이 바로 OFDM 부반송파 수(1200개), 파일럿 밀도(시간·주파수 양 축), 등화기 복잡도 설계를 결정합니다.
          LTE의 부반송파 간격 15 kHz는 <InlineMath math={String.raw`W_c`} /> ≈ 1 MHz보다 훨씬 좁아 각 부반송파가 flat fading을 경험합니다.
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
