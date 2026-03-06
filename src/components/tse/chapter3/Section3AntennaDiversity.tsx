'use client';

import { BlockMath, InlineMath } from 'react-katex';
import FadingDistribution from '@/components/tse/interactive/FadingDistribution';
import FadingSimulator from '@/components/tse/interactive/FadingSimulator';

interface Section3Props {
  onNavigate: (id: string) => void;
}

export default function Section3AntennaDiversity({ onNavigate }: Section3Props) {
  return (
    <section id="antenna-diversity" className="section-card transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <span className="badge badge-red">Advanced</span>
        <span className="text-sm text-slate-400">Section 3</span>
      </div>

      <h2 className="text-3xl font-bold text-slate-900 mb-4">3.3 Antenna (Space) Diversity</h2>
      <p className="text-lg text-slate-600 leading-relaxed mb-6">
        공간 다이버시티는 시간 지연을 늘리지 않고 독립 페이드 가지를 확보하는 방법입니다.
        물리적으로 떨어진 안테나들이 독립적인 페이딩을 경험하므로,
        추가 지연이나 대역폭 없이 다이버시티를 얻을 수 있습니다.
        대가는 하드웨어(안테나·RF 체인)입니다.
      </p>

      <div className="concept-card mb-6" id="simo">
        <div className="text-xs font-semibold text-blue-600 mb-1">SIMO: Single-Input Multiple-Output</div>
        <h4 className="font-semibold text-slate-800 mb-2">3.3.1 수신 다이버시티</h4>
        <p className="text-sm text-slate-600 mb-3">
          송신 안테나 1개, 수신 안테나 <InlineMath math="L" />개 구성에서
          각 수신 안테나가 독립 페이딩을 경험하면, MRC 결합으로 두 가지 이득을 동시에 얻습니다.
          이 두 가지 이득 — <strong>array gain</strong>과 <strong>diversity gain</strong> — 은 성격이 다릅니다.
        </p>
        <p className="text-sm text-slate-600 mb-3">
          Array gain은 여러 안테나가 수집하는 에너지를 합산하여 평균 SNR 자체를 올리는 효과입니다.
          단일 안테나 대비 <InlineMath math="L" />배의 전력 이득이며, 페이딩이 없는 AWGN에서도 존재합니다.
          반면 diversity gain은 deep fade 확률을 줄이는 효과로, 오류 확률의 <strong>SNR 기울기</strong>를 바꿉니다.
          Array gain이 곡선을 왼쪽으로 이동시킨다면, diversity gain은 곡선의 기울기를 가파르게 만듭니다.
        </p>
        <BlockMath math={String.raw`y_\ell = h_\ell x + w_\ell, \quad \ell = 1, \dots, L`} />
        <div className="formula-block !my-4 !p-4">
          <h4 className="font-semibold text-blue-800 mb-2">MRC 결합 결과</h4>
          <BlockMath math={String.raw`\text{SNR}_{\text{out}} = \left(\sum_{\ell=1}^{L} |h_\ell|^2\right) \text{SNR}`} />
        </div>
        <div className="grid md:grid-cols-2 gap-3 mt-3">
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 text-sm">
            <div className="font-bold text-blue-700 mb-1">Array Gain</div>
            <div className="text-slate-600">
              평균 SNR이 <InlineMath math="L" />배 증가. 가지 수에 비례하는 전력 이득.
            </div>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100 text-sm">
            <div className="font-bold text-emerald-700 mb-1">Diversity Gain</div>
            <div className="text-slate-600">
              deep fade 확률이 <InlineMath math={String.raw`P_e \propto \text{SNR}^{-L}`} />로 개선.
            </div>
          </div>
        </div>
      </div>

      <div className="concept-card mb-6" id="alamouti">
        <div className="text-xs font-semibold text-red-600 mb-1">MISO: Multiple-Input Single-Output</div>
        <h4 className="font-semibold text-slate-800 mb-2">3.3.2 송신 다이버시티 (Alamouti Code)</h4>
        <p className="text-sm text-slate-600 mb-3">
          수신 다이버시티는 수신 측에 안테나를 추가해야 하지만,
          송신 다이버시티는 기지국(인프라)에 안테나를 추가하여 단말 복잡도를 유지할 수 있습니다.
          Alamouti 코드는 2개 송신 안테나로 full diversity를 얻는 대표적 직교 설계입니다.
        </p>
        <div className="formula-block !my-4 !p-4">
          <h4 className="font-semibold text-blue-800 mb-2">Alamouti 2x1 코드 행렬</h4>
          <BlockMath math={String.raw`\mathbf{X} = \begin{bmatrix} x_1 & -x_2^* \\ x_2 & x_1^* \end{bmatrix}`} />
          <p className="text-sm text-slate-600 mt-2">
            2개 타임슬롯에 걸쳐 2개 심볼을 전송합니다.
            직교 구조 덕분에 수신기에서 간단한 선형 처리로 심볼을 분리할 수 있으며,
            full transmit diversity order 2를 달성합니다.
          </p>
        </div>
        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <h4 className="font-semibold text-blue-800 mb-2 text-sm">Alamouti 수신기 선형 결합 (1 수신 안테나)</h4>
          <p className="text-xs text-slate-600 mb-2">
            2 타임슬롯 수신값 <InlineMath math="(y_1, y_2)" />와 채널 추정값 <InlineMath math="(h_1, h_2)" />로 심볼을 복구합니다.
          </p>
          <BlockMath math={String.raw`\tilde{x}_1 = h_1^* y_1 + h_2 y_2^*, \quad \tilde{x}_2 = h_2^* y_1 - h_1 y_2^*`} />
          <p className="text-xs text-slate-600 mt-1">
            이 선형 처리 후 각 심볼이 간섭 없이 분리되며, 등가 SNR은
            <InlineMath math={String.raw`(|h_1|^2 + |h_2|^2)\,\text{SNR}`} />이 됩니다.
            2 수신 안테나 MRC와 동일한 diversity 2를 단 <strong>1개 수신 안테나</strong>로 달성합니다.
          </p>
        </div>
      </div>

      <div className="concept-card mb-6" id="mimo-preview">
        <h4 className="font-semibold text-slate-800 mb-2">3.3.3 2x2 MIMO: 다이버시티 vs 멀티플렉싱</h4>
        <p className="text-sm text-slate-600 mb-3">
          다중 안테나는 신뢰도(다이버시티)와 전송률(공간 멀티플렉싱) 두 가지 자원을 동시에 제공합니다.
          <InlineMath math={String.raw`n_t`} />개 송신, <InlineMath math={String.raw`n_r`} />개 수신 안테나에서
          이론적 용량은 다음과 같습니다.
        </p>
        <BlockMath math={String.raw`R = \log_2 \det\!\left(\mathbf{I} + \frac{\rho}{n_t} \mathbf{H}\mathbf{H}^\dagger\right)`} />
        <p className="text-sm text-slate-600 mt-2">
          설계는 "신뢰도 우선(다이버시티 배분)"과 "전송률 우선(멀티플렉싱 배분)" 사이의 운영점 선택입니다.
          이 트레이드오프는 Chapter 5 MIMO에서 본격적으로 다룹니다.
        </p>
      </div>

      <FadingDistribution />

      <FadingSimulator />

      <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 mb-6">
        <p className="text-sm text-amber-900 font-semibold mb-2">권장 실험</p>
        <ol className="text-sm text-amber-900 list-decimal list-inside space-y-1">
          <li>Fading Distribution에서 Rayleigh(K=0)과 Rician(K=5)의 PDF 형태를 비교합니다.</li>
          <li>안테나 수(L)를 바꾸며 Rayleigh 환경의 deep fade 확률 변화를 관찰합니다.</li>
          <li>Fading Simulator에서 시간 축 페이딩 궤적이 L에 따라 어떻게 안정화되는지 확인합니다.</li>
        </ol>
      </div>

      <div className="concept-card mb-6" id="space-rules">
        <h4 className="font-semibold text-slate-800 mb-2">3.3.4 실무 설계 규칙</h4>
        <div className="grid md:grid-cols-2 gap-3 text-sm">
          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
            <div className="font-bold text-emerald-700 mb-1">규칙 1: 신뢰도 우선</div>
            <div className="text-slate-600">
              링크 신뢰도가 핵심이면, 먼저 공간 자유도를 다이버시티에 배분합니다.
            </div>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div className="font-bold text-blue-700 mb-1">규칙 2: 조건부 전환</div>
            <div className="text-slate-600">
              SNR/CSI 조건이 안정적이면, 일부 자유도를 멀티플렉싱으로 전환합니다.
            </div>
          </div>
        </div>
      </div>

      <div className="insight">
        <div className="insight-title">주파수 축으로</div>
        <p className="text-sm text-amber-900">
          시간과 공간 다이버시티를 살펴봤습니다. 마지막 축은 주파수입니다.
          Chapter 2에서 다룬 multipath에 의한 주파수 선택성이 곧 다이버시티 자원이 됩니다.{' '}
          <button onClick={() => onNavigate('frequency-diversity')} className="cross-ref !text-xs">
            3.4 주파수 다이버시티
          </button>
          에서 이를 구체화합니다.
        </p>
      </div>
    </section>
  );
}
