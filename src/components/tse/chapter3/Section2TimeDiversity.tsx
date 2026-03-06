'use client';

import { BlockMath, InlineMath } from 'react-katex';
import { useState } from 'react';
import DopplerCalculator from '@/components/tse/interactive/DopplerCalculator';

interface Section2Props {
  onNavigate: (id: string) => void;
}

export default function Section2TimeDiversity({ onNavigate }: Section2Props) {
  const [codingMode, setCodingMode] = useState<'repetition' | 'optimal'>('repetition');

  return (
    <section id="time-diversity" className="section-card transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <span className="badge badge-amber">Intermediate</span>
        <span className="text-sm text-slate-400">Section 2</span>
      </div>

      <h2 className="text-3xl font-bold text-slate-900 mb-4">3.2 Time Diversity</h2>
      <p className="text-lg text-slate-600 leading-relaxed mb-6">
        시간 다이버시티의 핵심은 한 번의 페이드 결과를 그대로 믿지 않는 것입니다.
        같은 정보를 시간적으로 분산시켜 전송하면, 각 복사본이 독립적인 페이딩을 경험하게 되고,
        전체적으로 deep fade에 빠질 확률이 줄어듭니다.
        가장 단순한 반복 전송에서 시작해 코딩과 인터리빙까지 확장합니다.
      </p>

      <div className="concept-card mb-6" id="repetition-coding">
        <h4 className="font-semibold text-slate-800 mb-2">3.2.1 반복 전송 기준선</h4>
        <p className="text-sm text-slate-600 mb-3">
          같은 심볼 <InlineMath math="x" />를 <InlineMath math="L" />번 반복하면,
          각 전송이 독립 페이드를 겪을 때 MRC(Maximal Ratio Combining)로 결합합니다.
        </p>
        <BlockMath math={String.raw`y_\ell = h_\ell x + w_\ell, \quad \ell = 1, \dots, L`} />
        <div className="formula-block !my-4 !p-4">
          <h4 className="font-semibold text-blue-800 mb-2">MRC 결합 SNR</h4>
          <BlockMath math={String.raw`z = \sum_{\ell=1}^{L} h_\ell^* y_\ell, \quad \text{SNR}_{\text{out}} = \left(\sum_{\ell=1}^{L} |h_\ell|^2\right) \text{SNR}`} />
          <p className="text-sm text-slate-600 mt-2">
            MRC는 채널 이득이 강한 가지에 더 큰 가중치를 부여하는 최적 결합기입니다.
            결합 후 SNR은 각 가지 SNR의 합이 됩니다.
          </p>
        </div>
        <p className="text-xs text-slate-500">
          반복은 다이버시티를 쉽게 확보하지만,
          rate이 <InlineMath math="1/L" />로 줄어들어 자유도 효율이 낮습니다.
        </p>
      </div>

      <div className="concept-card mb-6" id="coding-beyond-repetition">
        <h4 className="font-semibold text-slate-800 mb-2">3.2.2 반복을 넘는 코딩</h4>
        <p className="text-sm text-slate-600 mb-3">
          시간 코딩의 목표는 다이버시티 차수를 유지하면서 코딩 이득을 추가하는 것입니다.
          반복은 가장 보수적인 전략이고, 잘 설계된 코드는 같은 다이버시티를 더 높은 rate에서 달성합니다.
        </p>
        <BlockMath math={String.raw`P_e \approx c \cdot \text{SNR}^{-d}, \quad d = \text{diversity order}`} />

        {/* Inline toggle: Repetition vs Optimal Coding */}
        <div className="mt-4 mb-3">
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setCodingMode('repetition')}
              aria-pressed={codingMode === 'repetition'}
              className={`px-3 py-1.5 rounded-lg text-sm border ${codingMode === 'repetition' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-300'}`}
            >
              반복 코딩
            </button>
            <button
              onClick={() => setCodingMode('optimal')}
              aria-pressed={codingMode === 'optimal'}
              className={`px-3 py-1.5 rounded-lg text-sm border ${codingMode === 'optimal' ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-600 border-slate-300'}`}
            >
              최적 코딩
            </button>
          </div>
          {codingMode === 'repetition' ? (
            <div className="p-3 rounded-lg bg-emerald-50 text-sm text-emerald-900">
              <div className="font-semibold mb-1">반복 코딩 (Repetition, rate = <InlineMath math="1/L" />)</div>
              <div className="mb-2">
                같은 심볼을 <InlineMath math="L" />번 반복하므로 구현이 단순합니다.
                MRC 결합으로 diversity order <InlineMath math="L" />을 확보하지만,
                전송률이 <InlineMath math="1/L" />로 줄어드는 것이 큰 비용입니다.
              </div>
              <div className="p-2 bg-white/70 rounded text-xs text-slate-600">
                예: L=4이면 diversity order 4를 얻지만, 원래 전송률의 25%만 남습니다.
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-teal-50 text-sm text-teal-900">
              <div className="font-semibold mb-1">최적 코딩 (Coded, rate {'>'} <InlineMath math="1/L" />)</div>
              <div className="mb-2">
                잘 설계된 코드(예: Turbo, LDPC)는 코드워드를 <InlineMath math="L" />개 코히어런스 블록에 분산시켜
                같은 diversity order를 유지하면서도 <strong>훨씬 높은 rate</strong>를 달성합니다.
                코딩 이득이 추가되어 같은 오류율을 더 낮은 SNR에서 만족시킵니다.
              </div>
              <div className="p-2 bg-white/70 rounded text-xs text-slate-600">
                예: Rate-1/2 LDPC + L=4 인터리빙이면, 원래 전송률의 50%를 유지하면서 diversity 4 + 코딩 이득 확보.
              </div>
            </div>
          )}
        </div>

        <p className="text-xs text-slate-500 mt-2">
          설계 질문은 단순합니다. <InlineMath math="d" />를 크게 유지하면서 rate를 얼마나 올릴 수 있는가입니다.
        </p>
      </div>

      <div className="concept-card mb-6" id="rotation-code">
        <h4 className="font-semibold text-slate-800 mb-2">3.2.2+ Rotation Code: 다이버시티 2를 rate 1로 달성</h4>
        <p className="text-sm text-slate-600 mb-3">
          반복보다 효율적인 코드의 구체적 예시로 TSE 교재의 <strong>rotation code</strong>가 있습니다.
          2개의 독립 BPSK 심볼 <InlineMath math={String.raw`(x_1, x_2)`} />를 2개 코히어런스 블록에 다음과 같이 매핑합니다.
        </p>
        <BlockMath math={String.raw`(u_1, u_2) = \frac{1}{\sqrt{2}}\bigl(x_1 + jx_2,\; x_1 - jx_2\bigr)`} />
        <p className="text-sm text-slate-600 mb-2">
          핵심 구조는, 두 코드워드 쌍의 성분 차이 벡터에서 <strong>모든 성분이 0이 아닌 것</strong>이 보장된다는 점입니다.
          한 코히어런스 블록이 깊은 페이드에 빠져도 다른 블록이 복호를 보완하여 diversity order 2를 달성합니다.
        </p>
        <div className="grid md:grid-cols-2 gap-3 mt-3">
          <div className="p-3 bg-red-50 rounded-lg border border-red-100 text-sm">
            <div className="font-bold text-red-700 mb-1">반복 코딩 (rate 1/2)</div>
            <div className="text-slate-600">
              <InlineMath math="(x, x)" /> — diversity 2 확보, 전송률 절반 손실
            </div>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100 text-sm">
            <div className="font-bold text-emerald-700 mb-1">Rotation code (rate 1)</div>
            <div className="text-slate-600">
              2개 독립 심볼을 2블록에 분산 — diversity 2를 rate 손실 없이 달성
            </div>
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          코딩 이득: 동일한 diversity order에서 반복 대비 3 dB 이상의 SNR 이득이 발생합니다.
          이것이 "잘 설계된 코드가 반복보다 우월하다"의 구체적 근거입니다.
        </p>
      </div>

      <div className="concept-card mb-6" id="interleaving">
        <h4 className="font-semibold text-slate-800 mb-2">3.2.3 인터리빙과 코히어런스 제약</h4>
        <p className="text-sm text-slate-600 mb-3">
          인터리빙 이득은 코드 심볼들이 충분히 다른 페이드를 겪을 때만 생깁니다.
          코히어런스 시간 <InlineMath math="T_c" /> 안에서 전송되는 심볼들은 비슷한 페이딩을 겪으므로,
          인터리버 깊이가 <InlineMath math="T_c" />보다 훨씬 커야 독립 페이드를 확보할 수 있습니다.
        </p>
        <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 mb-3">
          <p className="text-sm text-amber-900">
            <strong>핵심 제약:</strong> 코히어런스 시간 <InlineMath math="T_c" />는 시간 다이버시티의 상한을 직접 결정합니다.
            지연 제약 <InlineMath math="D" /> 안에서 얻을 수 있는 독립 페이드 수는 대략{' '}
            <InlineMath math={String.raw`L_{\text{time}} \approx D / T_c`} /> 입니다.
          </p>
        </div>
        <p className="text-xs text-slate-500">
          <button onClick={() => onNavigate('parameters')} className="cross-ref !text-xs">
            Ch.2 코히어런스 파라미터
          </button>
          에서 정리한 <InlineMath math="T_c \approx 1/D_s" /> 관계를 기억하세요.
          아래 도플러 계산기로 속도와 주파수에 따른 <InlineMath math="T_c" /> 변화를 확인할 수 있습니다.
        </p>
      </div>

      <DopplerCalculator />

      <div className="insight mt-8 mb-6">
        <div className="insight-title">권장 실험</div>
        <ol className="text-sm text-amber-900 list-decimal list-inside space-y-1">
          <li>속도와 반송파 주파수를 바꿔 코히어런스 시간 변화를 확인합니다.</li>
          <li>지연 예산 안에서 얻을 수 있는 독립 페이드 수를 추정합니다.</li>
          <li>그 수치로 인터리버 깊이 가능 범위를 잡아봅니다.</li>
        </ol>
      </div>

      <div className="concept-card mb-6" id="time-diversity-system">
        <h4 className="font-semibold text-slate-800 mb-2">3.2.4 시스템 관점</h4>
        <p className="text-sm text-slate-600 mb-2">
          시간 다이버시티는 강력하지만 <strong>지연 제약과 충돌</strong>하기 쉽습니다.
          실시간 음성이나 저지연 제어에서는 인터리빙 깊이를 충분히 확보할 수 없으며,
          채널이 느리게 변하는 환경(큰 <InlineMath math="T_c" />)에서도 시간 다이버시티만으로는 부족합니다.
        </p>
        <div className="grid md:grid-cols-3 gap-3 mt-3 text-sm">
          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
            <div className="font-bold text-emerald-700">적합한 경우</div>
            <div className="text-slate-600">고속 이동, 충분한 지연 허용</div>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
            <div className="font-bold text-amber-700">제한적</div>
            <div className="text-slate-600">저속 이동 + 지연 제약</div>
          </div>
          <div className="p-3 bg-red-50 rounded-lg border border-red-100">
            <div className="font-bold text-red-700">부적합</div>
            <div className="text-slate-600">정지 채널, 초저지연 요구</div>
          </div>
        </div>
      </div>

      <div className="insight">
        <div className="insight-title">다음 다이버시티 축으로</div>
        <p className="text-sm text-amber-900">
          시간 다이버시티의 한계는 지연과 채널 변화 속도입니다.
          이를 보완하려면 지연 없이 독립 가지를 확보할 수 있는{' '}
          <button onClick={() => onNavigate('antenna-diversity')} className="cross-ref !text-xs">
            3.3 안테나 다이버시티
          </button>
          로 넘어갑니다.
        </p>
      </div>
    </section>
  );
}
