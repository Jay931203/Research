'use client';

import { BlockMath, InlineMath } from 'react-katex';
import { useState } from 'react';
import DopplerCalculator from '@/components/tse/interactive/DopplerCalculator';

interface Section2Props {
  onNavigate: (id: string) => void;
}

export default function Section2TimeDiversity({ onNavigate }: Section2Props) {
  const [codingMode, setCodingMode] = useState<'repetition' | 'optimal'>('repetition');
  const [rotationView, setRotationView] = useState<'structure' | 'error' | 'comparison'>('structure');

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

      {/* Interleaving concept */}
      <div className="concept-card mb-6" id="interleaving-concept">
        <h4 className="font-semibold text-slate-800 mb-2">인터리빙을 통한 시간 다이버시티</h4>
        <p className="text-sm text-slate-600 mb-3">
          채널은 연속된 심볼 사이에서 높은 상관을 가집니다. 인터리빙은 코드워드의 심볼들을
          시간적으로 충분히 떨어뜨려 각 심볼이 <strong>독립적인 페이딩</strong>을 경험하도록 합니다.
        </p>
        <BlockMath math={String.raw`y_l = h_l x_l + w_l, \quad l = 1, \dots, L`} />
        <p className="text-sm text-slate-600 mb-2">
          이상적 인터리빙(ideal interleaving) 하에서 <InlineMath math="h_l" />들은 독립으로 가정할 수 있으며,
          코드워드 <InlineMath math={String.raw`\mathbf{x} = [x_1, \dots, x_L]^t`} />를 전송할 때
          <InlineMath math="L" />은 <strong>다이버시티 가지 수(diversity branches)</strong>가 됩니다.
        </p>
      </div>

      <div className="concept-card mb-6" id="repetition-coding">
        <h4 className="font-semibold text-slate-800 mb-2">3.2.1 반복 전송 (Repetition Coding)</h4>
        <p className="text-sm text-slate-600 mb-3">
          같은 심볼 <InlineMath math="x_1" />을 <InlineMath math="L" />번 반복하면,
          각 전송이 독립 페이드를 겪을 때 MRC(Maximal Ratio Combining)로 결합합니다.
        </p>
        <BlockMath math={String.raw`\mathbf{y} = \mathbf{h} x_1 + \mathbf{w}, \quad \mathbf{h} = [h_1, \dots, h_L]^t, \; \mathbf{w} = [w_1, \dots, w_L]^t`} />

        <div className="formula-block !my-4 !p-4">
          <h4 className="font-semibold text-blue-800 mb-2">MRC Sufficient Statistic (Coherent Detection)</h4>
          <BlockMath math={String.raw`\frac{\mathbf{h}^*}{\|\mathbf{h}\|} \mathbf{y} = \|\mathbf{h}\| x_1 + \frac{\mathbf{h}^*}{\|\mathbf{h}\|} \mathbf{w}`} />
          <p className="text-sm text-slate-600 mt-2">
            MRC는 각 가지의 신호 강도에 비례하여 가중치를 부여하고 위상을 정렬합니다.
            결합 후 등가 노이즈는 <InlineMath math={String.raw`\frac{\mathbf{h}^*}{\|\mathbf{h}\|}\mathbf{w} \sim \mathcal{CN}(0, N_0)`} />로
            스칼라 검출 문제와 동일해집니다.
          </p>
        </div>

        <div className="formula-block !my-4 !p-4">
          <h4 className="font-semibold text-blue-800 mb-2">BPSK 오류 확률 (Exact)</h4>
          <p className="text-sm text-slate-600 mb-2">
            <InlineMath math={String.raw`\|\mathbf{h}\|^2 = \sum_{l=1}^{L} |h_l|^2`} />이고,
            <InlineMath math={String.raw`h_l \sim_{\text{i.i.d.}} \mathcal{CN}(0,1)`} />이면
            <InlineMath math={String.raw`\|\mathbf{h}\|^2`} />은 자유도 2L인 카이제곱 분포를 따릅니다.
          </p>
          <BlockMath math={String.raw`f(x) = \frac{1}{(L-1)!} x^{L-1} e^{-x}, \quad x \ge 0`} />
          <BlockMath math={String.raw`p_e = \int_0^\infty Q\!\left(\sqrt{2x \cdot \text{SNR}}\right) f(x)\,dx = \left(\frac{1-\mu}{2}\right)^L \sum_{l=0}^{L-1} \binom{L-1+l}{l} \left(\frac{1+\mu}{2}\right)^l`} />
          <p className="text-sm text-slate-600 mt-1">
            여기서 <InlineMath math={String.raw`\mu := \sqrt{\frac{\text{SNR}}{1+\text{SNR}}}`} /> 입니다.
          </p>
        </div>

        <div className="formula-block !my-4 !p-4">
          <h4 className="font-semibold text-blue-800 mb-2">High SNR 근사와 Diversity Gain</h4>
          <p className="text-sm text-slate-600 mb-2">
            High SNR에서 <InlineMath math={String.raw`\frac{1+\mu}{2} \approx 1`} />,{' '}
            <InlineMath math={String.raw`\left(\frac{1-\mu}{2}\right)^L \approx \frac{1}{(4\text{SNR})^L}`} />{' '}
            (Taylor series)이므로:
          </p>
          <BlockMath math={String.raw`p_e \approx \binom{2L-1}{L} \frac{1}{(4\text{SNR})^L}`} />
          <p className="text-sm text-slate-600 mt-2">
            오류 확률이 SNR의 <InlineMath math="L" />승에 반비례하여 감소합니다.
            이 <InlineMath math="L" />이 곧 <strong className="text-red-600">다이버시티 이득(diversity gain)</strong>입니다.
          </p>
        </div>

        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 mb-3">
          <h4 className="font-semibold text-purple-800 mb-2 text-sm">Deep Fade 확률</h4>
          <p className="text-sm text-purple-900">
            High SNR에서 deep fade event의 확률:
          </p>
          <BlockMath math={String.raw`\mathbb{P}\!\left\{\|\mathbf{h}\|^2 < \frac{1}{\text{SNR}}\right\} \approx \frac{1}{L!} \cdot \frac{1}{\text{SNR}^L}`} />
          <p className="text-xs text-purple-700 mt-1">
            다이버시티 가지가 늘어날수록 전체 채널 이득이 동시에 작아질 확률이 지수적으로 감소합니다.
          </p>
        </div>

        <p className="text-xs text-slate-500">
          반복은 다이버시티를 쉽게 확보하지만,
          rate이 <InlineMath math="1/L" />로 줄어들어 자유도(degrees of freedom)를 활용하지 못합니다.
        </p>
      </div>

      <div className="concept-card mb-6" id="coding-beyond-repetition">
        <h4 className="font-semibold text-slate-800 mb-2">3.2.2 반복을 넘는 코딩 (Beyond Repetition Coding)</h4>
        <p className="text-sm text-slate-600 mb-3">
          반복 코드는 같은 심볼을 L번 반복하므로 자유도를 활용하지 못합니다.
          목표는 다이버시티 차수를 유지하면서 <strong>더 높은 rate</strong>와 <strong>코딩 이득</strong>을 추가하는 것입니다.
        </p>

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
      </div>

      <div className="concept-card mb-6" id="rotation-code">
        <h4 className="font-semibold text-slate-800 mb-2">3.2.2+ Rotation Code: 다이버시티 2를 rate 1로 달성</h4>
        <p className="text-sm text-slate-600 mb-3">
          L=2, BPSK인 경우: 2개의 BPSK 심볼을 2개 타임슬롯에 걸쳐 전송하면서 diversity gain을 확보합니다.
          회전 행렬 <InlineMath math={String.raw`\mathbf{R}`} />을 적용하여 코드워드를 구성합니다.
        </p>

        <div className="flex gap-2 mb-3 flex-wrap">
          <button
            onClick={() => setRotationView('structure')}
            className={`px-3 py-1.5 rounded-lg text-sm border ${rotationView === 'structure' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-300'}`}
          >
            코드 구조
          </button>
          <button
            onClick={() => setRotationView('error')}
            className={`px-3 py-1.5 rounded-lg text-sm border ${rotationView === 'error' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-300'}`}
          >
            오류 분석
          </button>
          <button
            onClick={() => setRotationView('comparison')}
            className={`px-3 py-1.5 rounded-lg text-sm border ${rotationView === 'comparison' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-300'}`}
          >
            반복 코딩 비교
          </button>
        </div>

        {rotationView === 'structure' && (
          <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
            <h5 className="font-semibold text-indigo-800 mb-2">코드 구조</h5>
            <p className="text-sm text-slate-600 mb-2">
              전송 벡터 <InlineMath math={String.raw`\mathbf{x} = \mathbf{R} \begin{bmatrix} u_1 \\ u_2 \end{bmatrix}`} />,{' '}
              <InlineMath math={String.raw`\mathbf{R} = \begin{bmatrix} \cos\theta & -\sin\theta \\ \sin\theta & \cos\theta \end{bmatrix}`} />,{' '}
              <InlineMath math={String.raw`\theta \in (0, 2\pi)`} />,{' '}
              <InlineMath math={String.raw`u_i = \pm a,\; i=1,2`} />
            </p>
            <p className="text-sm text-slate-600 mb-2">4개의 코드워드:</p>
            <BlockMath math={String.raw`\mathbf{x}_A = \mathbf{R}\begin{bmatrix}a\\a\end{bmatrix}, \; \mathbf{x}_B = \mathbf{R}\begin{bmatrix}-a\\a\end{bmatrix}, \; \mathbf{x}_C = \mathbf{R}\begin{bmatrix}-a\\-a\end{bmatrix}, \; \mathbf{x}_D = \mathbf{R}\begin{bmatrix}a\\-a\end{bmatrix}`} />
            <p className="text-sm text-slate-600">
              수신: <InlineMath math={String.raw`y_l = h_l x_l + w_l,\; (l=1,2)`} />.
              회전 덕분에 각 코드워드 차이의 모든 성분이 0이 아니므로 diversity 2를 달성합니다.
            </p>
          </div>
        )}

        {rotationView === 'error' && (
          <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
            <h5 className="font-semibold text-indigo-800 mb-2">Pairwise Error & Product Distance</h5>
            <p className="text-sm text-slate-600 mb-2">
              Union bound: <InlineMath math={String.raw`p_e \le \mathbb{P}\{\mathbf{x}_A \to \mathbf{x}_B\} + \mathbb{P}\{\mathbf{x}_A \to \mathbf{x}_C\} + \mathbb{P}\{\mathbf{x}_A \to \mathbf{x}_D\}`} />
            </p>
            <p className="text-sm text-slate-600 mb-2">
              정규화 차이 벡터 <InlineMath math={String.raw`\mathbf{d} := \frac{1}{a}(\mathbf{x}_A - \mathbf{x}_B) = \frac{1}{a}\mathbf{R}(\mathbf{u}_A - \mathbf{u}_B) = \begin{bmatrix}2\cos\theta \\ 2\sin\theta\end{bmatrix} = \begin{bmatrix}d_1 \\ d_2\end{bmatrix}`} />
            </p>
            <p className="text-sm text-slate-600 mb-2">
              독립 Rayleigh에서 평균:
            </p>
            <BlockMath math={String.raw`\mathbb{P}\{\mathbf{x}_A \to \mathbf{x}_B\} \le \frac{1}{\left(1 + \text{SNR}|d_1|^2/4\right)\left(1 + \text{SNR}|d_2|^2/4\right)}`} />
            <p className="text-sm text-slate-600 mb-2">
              <InlineMath math={String.raw`d_1 \ne 0`} />이고 <InlineMath math={String.raw`d_2 \ne 0`} />이면 diversity gain = 2.
              High SNR에서 <InlineMath math={String.raw`\mathbb{P}\{\mathbf{x}_A \to \mathbf{x}_B\} \le \frac{16}{|d_1 d_2|^2} \text{SNR}^{-2}`} />.
            </p>
            <div className="mt-3 p-3 bg-white rounded-lg text-sm">
              <strong className="text-indigo-700">Squared Product Distance:</strong>{' '}
              <InlineMath math={String.raw`\delta_{AB} := |d_1 d_2|^2`} />.
              코딩 이득은 <InlineMath math={String.raw`\min_{j=B,C,D} \delta_{Aj}`} />로 결정되며, <InlineMath math="\theta" />에 대해 최적화할 수 있습니다.
            </div>
            <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200 text-sm">
              <strong className="text-yellow-800">최적 θ:</strong>{' '}
              <InlineMath math={String.raw`\delta_{AB} = \delta_{AD} = 4\sin^2 2\theta`} />,{' '}
              <InlineMath math={String.raw`\delta_{AC} = 16\cos^2 2\theta`} />.{' '}
              <InlineMath math={String.raw`4\sin^2 2\theta = 16\cos^2 2\theta`} />일 때 최적:{' '}
              <InlineMath math={String.raw`\theta = \frac{1}{2}\tan^{-1} 2`} />,{' '}
              <InlineMath math={String.raw`\min \delta_{Aj} = 16/5`} />.
            </div>
          </div>
        )}

        {rotationView === 'comparison' && (
          <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
            <h5 className="font-semibold text-indigo-800 mb-2">Rotation Code vs 반복 코딩 (같은 bit rate)</h5>
            <p className="text-sm text-slate-600 mb-2">
              반복 코딩이 같은 bit rate를 유지하려면 4-PAM{' '}
              <InlineMath math={String.raw`\{-3b, -b, b, 3b\}`} />을 사용해야 합니다.
              평균 SNR = <InlineMath math={String.raw`5b^2/N_0`} />.
            </p>
            <div className="grid md:grid-cols-2 gap-3 mt-3">
              <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                <div className="font-bold text-red-700 mb-1">반복 + 4-PAM</div>
                <div className="text-sm text-slate-600 mb-1">
                  <InlineMath math={String.raw`d_1 = d_2 = 2b(1/\sqrt{5b^2}) = 2/\sqrt{5}`} />
                </div>
                <div className="text-sm text-slate-600">
                  <InlineMath math={String.raw`\min_{i \ne j} \delta_{ij} = |d_1|^2 |d_2|^2 = \mathbf{16/25}`} />
                </div>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                <div className="font-bold text-emerald-700 mb-1">Rotation + BPSK</div>
                <div className="text-sm text-slate-600">
                  <InlineMath math={String.raw`\min_{j} \delta_{Aj} = \mathbf{16/5}`} />
                </div>
              </div>
            </div>
            <p className="text-sm text-slate-600 mt-3">
              Product distance 비교: <InlineMath math={String.raw`16/5 \div 16/25 = 5`} />.{' '}
              <strong>Rotation code는 반복 대비 약 5배(7 dB)의 product distance 이득</strong>을 가집니다.
              같은 diversity order에서 반복이 자유도를 낭비하기 때문입니다.
            </p>
            <BlockMath math={String.raw`p_e \le \frac{48}{\min_{j} \delta_{Aj}} \text{SNR}^{-2} = 15 \cdot \text{SNR}^{-2} \quad \text{(rotation code)}`} />
          </div>
        )}
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
