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

      <div className="grid md:grid-cols-4 gap-3 mb-8">
        {[
          { title: 'LOS', desc: '직접 경로로, 가장 강하고 안정적인 기준 성분. Rician 채널의 K-factor를 결정합니다.' },
          { title: 'Reflection', desc: '건물/지면 등 평탄한 면에서 반사. 경로차에 의한 간섭 패턴을 형성합니다.' },
          { title: 'Diffraction', desc: '건물 모서리나 언덕에서 회절. NLOS 영역에도 신호가 도달하게 합니다.' },
          { title: 'Scattering', desc: '파장 이하 크기의 물체에서 산란. 위상이 랜덤화되어 Rayleigh 페이딩의 원인이 됩니다.' },
        ].map((item, i) => (
          <div key={i} className="text-center p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="font-semibold text-sm text-slate-800">{item.title}</div>
            <div className="text-xs text-slate-500 mt-1">{item.desc}</div>
          </div>
        ))}
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
        <BlockMath math={String.raw`f_D = \frac{v}{\lambda}\cos\theta = \frac{v f_c}{c}\cos\theta`} />
        <div className="grid grid-cols-2 gap-2 mt-4 text-sm text-slate-600">
          <div><InlineMath math="v" />: 이동 속도</div>
          <div><InlineMath math="f_c" />: 반송파 주파수</div>
          <div><InlineMath math={String.raw`\theta`} />: 도래각</div>
          <div><InlineMath math="c" />: 광속</div>
        </div>
      </div>

      <div className="concept-card mb-6">
        <h4 className="font-semibold mb-2">예제: 차량 100 km/h, 2 GHz</h4>
        <BlockMath math={String.raw`f_D^{max}=\frac{(100/3.6)\times 2\times10^9}{3\times10^8}\approx 185\ \text{Hz}`} />
        <p className="text-sm text-slate-600 mt-2">
          수백 Hz 수준의 도플러 폭만으로도 복소 채널 계수는 ms 단위에서 크게 변할 수 있습니다.
        </p>
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
