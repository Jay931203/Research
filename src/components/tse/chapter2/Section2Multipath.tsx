'use client';

import { BlockMath, InlineMath } from 'react-katex';
import MultipathVisualizer from '@/components/tse/interactive/MultipathVisualizer';
import DopplerCalculator from '@/components/tse/interactive/DopplerCalculator';
import PhasorVisualizer from '@/components/tse/interactive/PhasorVisualizer';

interface Section2Props {
  onNavigate: (id: string) => void;
}

export default function Section2Multipath({ onNavigate }: Section2Props) {
  return (
    <section id="multipath" className="section-card transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <span className="badge badge-blue">Intermediate</span>
        <span className="text-sm text-slate-400">Section 3</span>
      </div>

      <h2 className="text-3xl font-bold text-slate-900 mb-4">Multipath와 Doppler의 시간 변화 직관</h2>

      <p className="text-lg text-slate-600 leading-relaxed mb-6">
        I/O 모델이 채널을 수학적으로 표현했다면, 이 섹션에서는 그 모델 뒤의 <strong>물리적 직관</strong>을 다룹니다.
        여러 경로의 신호가 합쳐질 때 왜 deep fade가 발생하는지,
        이동 속도가 채널 변화 속도를 어떻게 결정하는지를 Phasor 시각화로 직접 확인할 수 있습니다.
      </p>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <div className="concept-card">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            <h4 className="font-bold text-emerald-800">LOS (Line of Sight)</h4>
          </div>
          <p className="text-sm text-slate-600 mb-2">
            송신기에서 수신기까지 장애물 없이 직선으로 도달하는 경로입니다.
            예를 들어, 넓은 들판에서 기지국 안테나가 보이는 위치에 있을 때,
            신호는 감쇠만 겪고 거의 왜곡 없이 도착합니다.
          </p>
          <div className="text-sm text-slate-600 mb-2">
            <strong>신호 특성:</strong> 진폭이 가장 크고 안정적이며, 위상은 전파 거리에 비례하여 선형적으로 변합니다.
            다른 경로 성분 대비 압도적으로 강하면 <InlineMath math="K" />-factor가 커집니다.
          </div>
          <div className="text-xs p-2 bg-emerald-50 rounded-lg border border-emerald-100 text-emerald-800">
            <strong>설계 영향:</strong> LOS 존재 여부가 Rician vs Rayleigh 모델 선택을 결정합니다.
            LOS가 강하면 deep fade 확률이 낮아져 링크 마진을 줄일 수 있고,
            빔포밍 이득도 예측 가능해져 mmWave 시스템에서 특히 중요합니다.
          </div>
        </div>

        <div className="concept-card">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
            <h4 className="font-bold text-blue-800">Reflection (반사)</h4>
          </div>
          <p className="text-sm text-slate-600 mb-2">
            도심의 건물 외벽, 유리창, 지면 등 전파 파장보다 훨씬 큰 평탄한 면에서
            전파가 거울처럼 반사됩니다.
            예: 고층 빌딩 유리면에서 반사된 신호가 골목 안의 수신기에 도달하는 경우.
          </p>
          <div className="text-sm text-slate-600 mb-2">
            <strong>신호 특성:</strong> 반사 시 재질에 따른 진폭 감쇠(반사 계수 <InlineMath math={String.raw`|\Gamma| < 1`} />)와
            위상 반전(<InlineMath math={String.raw`\pi`} /> 위상 점프)이 발생합니다.
            LOS와 반사파의 경로차가 <InlineMath math={String.raw`\lambda/2`} />의 정수배이면 상쇄 간섭으로 deep null이 형성됩니다.
          </div>
          <div className="text-xs p-2 bg-blue-50 rounded-lg border border-blue-100 text-blue-800">
            <strong>설계 영향:</strong> 2-ray ground reflection 모델의 근거이며,
            실내 환경에서 벽면 반사에 의한 주기적 null 패턴은
            안테나 다이버시티 간격(<InlineMath math={String.raw`\lambda/2`} />) 설계의 기준이 됩니다.
          </div>
        </div>

        <div className="concept-card">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-500"></span>
            <h4 className="font-bold text-amber-800">Diffraction (회절)</h4>
          </div>
          <p className="text-sm text-slate-600 mb-2">
            건물 모서리, 옥상 가장자리, 언덕 능선 등 날카로운 경계에서
            전파가 그림자 영역으로 &quot;휘어져&quot; 전파됩니다.
            예: 기지국이 건물 뒤에 가려져 보이지 않지만, 옥상 모서리에서 회절된 신호가 도달하는 경우.
          </p>
          <div className="text-sm text-slate-600 mb-2">
            <strong>신호 특성:</strong> 회절파는 직접파보다 상당히 약하며(10~25 dB 감쇠),
            위상이 주파수에 따라 달라집니다. 그림자 영역 깊숙이 들어갈수록 급격히 약해지지만,
            완전한 사각지대를 방지하는 역할을 합니다.
          </div>
          <div className="text-xs p-2 bg-amber-50 rounded-lg border border-amber-100 text-amber-800">
            <strong>설계 영향:</strong> NLOS 커버리지 예측의 핵심이며,
            셀 반경 결정 시 회절 손실을 고려해야 합니다. 주파수가 높을수록
            (mmWave 등) 회절 효과가 약해져 커버리지 홀이 커지므로,
            dense small cell 배치나 RIS(반사 지능형 표면) 도입이 필요해집니다.
          </div>
        </div>

        <div className="concept-card">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-block w-2 h-2 rounded-full bg-rose-500"></span>
            <h4 className="font-bold text-rose-800">Scattering (산란)</h4>
          </div>
          <p className="text-sm text-slate-600 mb-2">
            가로수 잎사귀, 가로등 기둥, 차량 사이드미러 등 전파 파장과 비슷하거나
            작은 물체에 부딪혀 사방으로 흩어지는 현상입니다.
            예: 도심 거리의 수많은 차량과 표지판에서 동시에 산란된 신호들이 합성되는 경우.
          </p>
          <div className="text-sm text-slate-600 mb-2">
            <strong>신호 특성:</strong> 각 산란체마다 랜덤한 진폭과 위상을 가진 성분을 만들어냅니다.
            산란 경로가 매우 많아지면 CLT(중심극한정리)에 의해 합성 신호의 I/Q 성분이
            가우시안 분포를 따르게 되고, 그 크기가 Rayleigh 분포를 형성합니다.
          </div>
          <div className="text-xs p-2 bg-rose-50 rounded-lg border border-rose-100 text-rose-800">
            <strong>설계 영향:</strong> Rayleigh 페이딩의 물리적 원인으로,
            deep fade 발생 확률을 결정합니다. 다수 산란체 환경에서
            MIMO는 이 산란을 오히려 활용하여 공간 다중화 이득을 얻습니다 --
            산란이 풍부할수록 채널 행렬의 랭크가 높아져 용량이 증가합니다.
          </div>
        </div>
      </div>

      <div className="formula-block">
        <h4 className="font-semibold text-blue-800 mb-3">Multipath 합성 채널</h4>
        <BlockMath math={String.raw`h(t,\tau)=\sum_{k=0}^{L-1} a_k(t)e^{j\phi_k(t)}\delta(\tau-\tau_k)`} />
        <div className="grid grid-cols-2 gap-2 mt-4 text-sm text-slate-600">
          <div><InlineMath math="a_k(t)" />: 시간가변 진폭</div>
          <div><InlineMath math={String.raw`\phi_k(t)`} />: 시간가변 위상</div>
          <div><InlineMath math={String.raw`\tau_k`} />: 경로 지연</div>
          <div><InlineMath math="L" />: 경로 개수</div>
        </div>
        <p className="text-sm text-slate-600 mt-3">
          각 경로는 고유한 지연 <InlineMath math={String.raw`\tau_k`} />를 가지며, 이동에 의해 진폭과 위상이 시간에 따라 변합니다.
          이 경로들의 <strong>복소 합</strong>이 수신 신호를 결정하며, 위상이 동일 방향이면 보강,
          반대 방향이면 상쇄 간섭이 발생합니다. 아래 Phasor Visualizer에서 이 복소 벡터 합성을 직접 확인할 수 있습니다.
        </p>
      </div>

      <PhasorVisualizer />

      <MultipathVisualizer />

      <h3 className="text-xl font-bold text-slate-800 mb-3 mt-10" id="doppler">
        2.3.1 Doppler Spread의 물리적 의미
      </h3>

      <p className="text-slate-600 mb-4">
        수신기가 이동하면 각 경로마다 도래각이 다르므로 서로 다른 도플러 시프트가 발생합니다.
        이 시프트들의 <strong>최대 폭</strong>이 채널 시간변화 속도를 결정하며,
        이것을 정량화한 것이{' '}
        <button onClick={() => onNavigate('doppler-spread')} className="cross-ref">
          Doppler spread <InlineMath math="D_s" />
        </button>
        입니다. 도플러 폭이 클수록 채널이 빠르게 변하여 추정과 추적이 어려워집니다.
      </p>

      <div className="formula-block">
        <h4 className="font-semibold text-blue-800 mb-3">Doppler Shift 공식</h4>
        <BlockMath math={String.raw`f_D = \frac{v}{\lambda}\cos\theta = \frac{v f_c}{c}\cos\theta`} />
        <div className="grid grid-cols-2 gap-2 mt-4 text-sm text-slate-600">
          <div><InlineMath math="v" />: 이동 속도 (m/s)</div>
          <div><InlineMath math="f_c" />: 반송파 주파수 (Hz)</div>
          <div><InlineMath math={String.raw`\theta`} />: 이동 방향과 전파 도래 방향 사이의 각도</div>
          <div><InlineMath math="c" />: 광속 (<InlineMath math="3 \times 10^8" /> m/s)</div>
        </div>

        <div className="mt-5 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
          <h5 className="font-semibold text-indigo-800 text-sm mb-3">직관적 이해: 왜 <InlineMath math={String.raw`\cos\theta`} />가 나오는가?</h5>

          <div className="space-y-3 text-sm text-slate-600">
            <p>
              구급차가 다가올 때 사이렌 소리가 높아지고, 멀어질 때 낮아지는 것과 같은 원리입니다.
              전파도 마찬가지로, 수신기가 전파 방향으로 이동하면 파동의 마루를
              더 자주 만나게 되어 주파수가 증가합니다.
            </p>

            <div className="grid md:grid-cols-3 gap-2">
              <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-100 text-center">
                <div className="font-semibold text-emerald-800 text-xs mb-1">
                  <InlineMath math={String.raw`\theta = 0`} /> (정면 접근)
                </div>
                <div className="text-xs text-slate-600">
                  이동 방향과 전파 방향이 같으면 파장이 압축되어{' '}
                  <strong>주파수 최대 증가</strong>
                </div>
                <div className="text-xs font-mono text-emerald-700 mt-1">
                  <InlineMath math={String.raw`f_D = +f_D^{max}`} />
                </div>
              </div>
              <div className="p-2 bg-slate-100 rounded-lg border border-slate-200 text-center">
                <div className="font-semibold text-slate-700 text-xs mb-1">
                  <InlineMath math={String.raw`\theta = \pi/2`} /> (수직)
                </div>
                <div className="text-xs text-slate-600">
                  이동 방향이 전파와 수직이면 도플러 시프트 없음
                </div>
                <div className="text-xs font-mono text-slate-600 mt-1">
                  <InlineMath math={String.raw`f_D = 0`} />
                </div>
              </div>
              <div className="p-2 bg-rose-50 rounded-lg border border-rose-100 text-center">
                <div className="font-semibold text-rose-800 text-xs mb-1">
                  <InlineMath math={String.raw`\theta = \pi`} /> (후방 이탈)
                </div>
                <div className="text-xs text-slate-600">
                  전파 반대 방향으로 이동하면 파장이 늘어나{' '}
                  <strong>주파수 최대 감소</strong>
                </div>
                <div className="text-xs font-mono text-rose-700 mt-1">
                  <InlineMath math={String.raw`f_D = -f_D^{max}`} />
                </div>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
              <div className="font-semibold text-amber-800 text-xs mb-1">
                핵심: 다방향 산란 환경에서의 도플러 확산
              </div>
              <p className="text-xs text-slate-600">
                실제 도시 환경에서는 건물, 차량, 지면 등에서 산란된 전파가
                <strong> 모든 방향</strong>에서 동시에 도착합니다.
                각 경로마다 도래각 <InlineMath math={String.raw`\theta`} />가 다르므로,
                한 경로는 <InlineMath math={String.raw`+f_D^{max}`} />에 가까운 시프트를,
                다른 경로는 <InlineMath math={String.raw`-f_D^{max}`} />에 가까운 시프트를 겪습니다.
                이 모든 시프트가 합쳐진 <strong>폭</strong>이 바로 Doppler spread{' '}
                <InlineMath math={String.raw`D_s`} />이며,
                이것이 채널이 시간에 따라 얼마나 빠르게 변하는지를 결정합니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="concept-card mb-6">
        <h4 className="font-bold text-lg text-slate-800 mb-3">예제: 차량 100 km/h, 반송파 2 GHz</h4>

        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 mb-4">
          <h5 className="font-semibold text-blue-800 text-sm mb-2">단계별 계산</h5>
          <div className="space-y-2 text-sm text-slate-600">
            <div>
              <strong>Step 1.</strong> 속도 단위 변환: km/h를 m/s로
              <BlockMath math={String.raw`v = \frac{100\ \text{km/h}}{3.6} = 27.78\ \text{m/s}`} />
            </div>
            <div>
              <strong>Step 2.</strong> 최대 도플러 시프트 공식에 대입 (<InlineMath math={String.raw`\theta = 0`} />일 때 최대):
              <BlockMath math={String.raw`f_D^{max} = \frac{v \cdot f_c}{c} = \frac{27.78 \times 2 \times 10^9}{3 \times 10^8}`} />
            </div>
            <div>
              <strong>Step 3.</strong> 분자/분모 계산:
              <BlockMath math={String.raw`= \frac{5.556 \times 10^{10}}{3 \times 10^8} = 185.2\ \text{Hz}`} />
            </div>
          </div>
        </div>

        <div className="p-4 bg-amber-50 rounded-lg border border-amber-100 mb-4">
          <h5 className="font-semibold text-amber-800 text-sm mb-2">185 Hz가 실제로 의미하는 것</h5>
          <p className="text-sm text-slate-600">
            채널의 코히런스 타임은 대략 <InlineMath math={String.raw`T_c \approx 1/(4 D_s) \approx 1/(4 \times 2 \times 185) \approx 0.68`} /> ms입니다.
            이는 <strong>약 0.7ms 안에 채널이 의미 있게 변한다</strong>는 뜻입니다.
            LTE의 서브프레임(1ms)보다 짧으므로, 하나의 서브프레임 안에서도 채널 추정을
            갱신해야 할 수 있습니다. 파일럿 심볼 배치, 채널 추정 알고리즘 복잡도,
            링크 적응 속도 등 시스템 전반에 영향을 미칩니다.
          </p>
        </div>

        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
          <h5 className="font-semibold text-slate-800 text-sm mb-3">속도별 비교: 도플러와 코히런스 타임</h5>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-left border-b-2 border-slate-300">
                  <th className="py-2 pr-4 text-slate-700">시나리오</th>
                  <th className="py-2 pr-4 text-slate-700">속도</th>
                  <th className="py-2 pr-4 text-slate-700"><InlineMath math={String.raw`f_D^{max}`} /></th>
                  <th className="py-2 pr-4 text-slate-700"><InlineMath math={String.raw`T_c`} /> (근사)</th>
                  <th className="py-2 text-slate-700">의미</th>
                </tr>
              </thead>
              <tbody className="text-slate-600">
                <tr className="border-b border-slate-200">
                  <td className="py-2 pr-4 font-medium">보행자</td>
                  <td className="py-2 pr-4">5 km/h</td>
                  <td className="py-2 pr-4"><InlineMath math={String.raw`\approx 9\ \text{Hz}`} /></td>
                  <td className="py-2 pr-4"><InlineMath math={String.raw`\approx 14\ \text{ms}`} /></td>
                  <td className="py-2 text-xs">채널이 매우 느리게 변함. 파일럿 오버헤드 최소화 가능</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-2 pr-4 font-medium">도시 차량</td>
                  <td className="py-2 pr-4">60 km/h</td>
                  <td className="py-2 pr-4"><InlineMath math={String.raw`\approx 111\ \text{Hz}`} /></td>
                  <td className="py-2 pr-4"><InlineMath math={String.raw`\approx 1.1\ \text{ms}`} /></td>
                  <td className="py-2 text-xs">LTE 서브프레임과 비슷한 수준. 적응형 변조 필요</td>
                </tr>
                <tr className="border-b border-slate-200 bg-blue-50/50">
                  <td className="py-2 pr-4 font-medium">고속도로</td>
                  <td className="py-2 pr-4">100 km/h</td>
                  <td className="py-2 pr-4"><InlineMath math={String.raw`\approx 185\ \text{Hz}`} /></td>
                  <td className="py-2 pr-4"><InlineMath math={String.raw`\approx 0.68\ \text{ms}`} /></td>
                  <td className="py-2 text-xs">서브프레임 내에서도 채널 변동. 빠른 추적 필수</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-medium">KTX</td>
                  <td className="py-2 pr-4">300 km/h</td>
                  <td className="py-2 pr-4"><InlineMath math={String.raw`\approx 556\ \text{Hz}`} /></td>
                  <td className="py-2 pr-4"><InlineMath math={String.raw`\approx 0.23\ \text{ms}`} /></td>
                  <td className="py-2 text-xs">극단적으로 빠른 변화. 고속 이동 특화 파일럿 설계 필요</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-500 mt-3">
            위 값은 <InlineMath math={String.raw`f_c = 2`} /> GHz 기준이며,
            5G NR의 3.5 GHz에서는 도플러 값이 약 1.75배,
            mmWave 28 GHz에서는 약 14배 더 커집니다.
            주파수가 높아질수록 같은 이동 속도에서도 채널 추적이 훨씬 어려워지는 이유입니다.
          </p>
        </div>
      </div>

      <DopplerCalculator />

      <div className="insight mt-8">
        <div className="insight-title">물리 직관에서 설계 기준으로</div>
        <p className="text-amber-900 text-sm">
          다중경로 합성이 deep fade를 만들고, 이동 속도가 채널 변화 속도를 결정한다는 직관을 확인했습니다.
          다음 단계에서는 이 직관을{' '}
          <InlineMath math={String.raw`T_d, W_c, D_s, T_c`} /> 네 개의 정량 파라미터로 공식화하여,
          OFDM 부반송파 간격이나 파일럿 밀도 같은 실제 설계 기준으로 변환합니다.
          <button onClick={() => onNavigate('parameters')} className="cross-ref !text-xs ml-1">2.3 Coherence 파라미터</button>
        </p>
      </div>
    </section>
  );
}
