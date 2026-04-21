'use client';

import { BlockMath, InlineMath } from 'react-katex';
import { useState } from 'react';
import FadingDistribution from '@/components/tse/interactive/FadingDistribution';
import FadingSimulator from '@/components/tse/interactive/FadingSimulator';

interface Section3Props {
  onNavigate: (id: string) => void;
}

export default function Section3AntennaDiversity({ onNavigate }: Section3Props) {
  const [mimoTab, setMimoTab] = useState<'dof' | 'vblast' | 'comparison' | 'decorrelator'>('dof');

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
        <h4 className="font-semibold text-slate-800 mb-2">3.3.1 수신 다이버시티 (Receive Diversity)</h4>
        <p className="text-sm text-slate-600 mb-3">
          1 Tx 안테나, <InlineMath math="L" /> Rx 안테나, flat fading 채널:
        </p>
        <BlockMath math={String.raw`y_l[m] = h_l[m]\,x[m] + w_l[m], \quad l = 1, \dots, L`} />
        <p className="text-sm text-slate-600 mb-3">
          안테나 간 충분한 간격으로 <InlineMath math={String.raw`h_l[1]`} />이 독립이면 diversity gain <InlineMath math="L" />.
          시간 다이버시티의 반복 코드와 <strong>동일한 detection 문제</strong>이지만,
          시간이 아닌 공간에서 독립 가지를 확보합니다.
        </p>

        <div className="formula-block !my-4 !p-4">
          <h4 className="font-semibold text-blue-800 mb-2">Power Gain vs Array Gain 분리</h4>
          <p className="text-sm text-slate-600 mb-2">
            BPSK 오류 확률: <InlineMath math={String.raw`Q\!\left(\sqrt{2\|\mathbf{h}\|^2 \text{SNR}}\right)`} />
          </p>
          <BlockMath math={String.raw`\|\mathbf{h}\|^2 \text{SNR} = \underbrace{L \cdot \text{SNR}}_{\text{power gain}} \cdot \underbrace{\frac{1}{L}\|\mathbf{h}\|^2}_{\text{array gain}}`} />
          <p className="text-sm text-slate-600 mt-2">
            <strong>Power gain</strong> (<InlineMath math="L \cdot \text{SNR}" />): 안테나가 수집하는 총 에너지가 L배.
            AWGN에서도 존재합니다.
            <strong> Array gain</strong> (<InlineMath math={String.raw`\frac{1}{L}\|\mathbf{h}\|^2`} />): 정규화된 채널 이득으로,
            deep fade 확률을 줄이는 diversity 효과를 담고 있습니다.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-3 mt-3">
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 text-sm">
            <div className="font-bold text-blue-700 mb-1">Array Gain (Power Gain)</div>
            <div className="text-slate-600">
              평균 SNR이 <InlineMath math="L" />배 증가. 오류율 곡선을 왼쪽으로 이동.
            </div>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100 text-sm">
            <div className="font-bold text-emerald-700 mb-1">Diversity Gain</div>
            <div className="text-slate-600">
              deep fade 확률이 <InlineMath math={String.raw`P_e \propto \text{SNR}^{-L}`} />로 개선.
              오류율 곡선의 기울기를 가파르게 만듦.
            </div>
          </div>
        </div>
      </div>

      <div className="concept-card mb-6" id="alamouti">
        <div className="text-xs font-semibold text-red-600 mb-1">MISO: Multiple-Input Single-Output</div>
        <h4 className="font-semibold text-slate-800 mb-2">3.3.2 송신 다이버시티: Space-Time Codes</h4>
        <p className="text-sm text-slate-600 mb-3">
          L Tx 안테나, 1 Rx 안테나. 반복 코드는 같은 심볼을 L개 안테나에서 L 타임슬롯에 걸쳐 전송하지만,
          자유도를 낭비합니다. Space-time code는 이를 개선합니다.
        </p>

        <div className="formula-block !my-4 !p-4">
          <h4 className="font-semibold text-blue-800 mb-2">Alamouti Scheme (2 Tx, 1 Rx)</h4>
          <p className="text-sm text-slate-600 mb-2">
            <strong>두 complex 심볼</strong> <InlineMath math={String.raw`u_1, u_2`} />를 2 타임슬롯에 전송:
          </p>
          <div className="grid md:grid-cols-2 gap-3 mb-3">
            <div className="p-2 bg-white rounded text-sm text-center">
              <div className="text-xs text-slate-500 mb-1">Time 1</div>
              <InlineMath math={String.raw`x_1[1] = u_1, \; x_2[1] = u_2`} />
            </div>
            <div className="p-2 bg-white rounded text-sm text-center">
              <div className="text-xs text-slate-500 mb-1">Time 2</div>
              <InlineMath math={String.raw`x_1[2] = -u_2^*, \; x_2[2] = u_1^*`} />
            </div>
          </div>
          <p className="text-sm text-slate-600 mb-2">
            채널이 2 타임슬롯 동안 일정하다고 가정: <InlineMath math={String.raw`h_1 = h_1[1] = h_1[2]`} />, <InlineMath math={String.raw`h_2 = h_2[1] = h_2[2]`} />
          </p>
          <BlockMath math={String.raw`\begin{bmatrix} y[1] \\ y[2]^* \end{bmatrix} = \begin{bmatrix} h_1 & h_2 \\ h_2^* & -h_1^* \end{bmatrix} \begin{bmatrix} u_1 \\ u_2 \end{bmatrix} + \begin{bmatrix} w[1] \\ w[2]^* \end{bmatrix}`} />
        </div>

        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <h4 className="font-semibold text-blue-800 mb-2 text-sm">직교 분해 → 두 개의 스칼라 문제</h4>
          <p className="text-xs text-slate-600 mb-2">
            행렬의 두 열 <InlineMath math={String.raw`\begin{bmatrix}h_1 \\ h_2^*\end{bmatrix}`} />와{' '}
            <InlineMath math={String.raw`\begin{bmatrix}h_2 \\ -h_1^*\end{bmatrix}`} />는 <strong>직교</strong>합니다.
            각 열에 투영하면:
          </p>
          <BlockMath math={String.raw`r_i = \|\mathbf{h}\| u_i + w_i, \quad (i=1,2), \quad \mathbf{h} = [h_1, h_2]^t`} />
          <p className="text-xs text-slate-600 mt-1">
            <InlineMath math={String.raw`w_i \sim \mathcal{CN}(0, N_0)`} />이고 <InlineMath math={String.raw`w_1, w_2`} />는 독립.
            <strong> Rate 1</strong> (2 심볼 / 2 타임슬롯)에서 <strong>diversity 2</strong>를 달성합니다.
          </p>
        </div>

        <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
          <h4 className="font-semibold text-amber-800 mb-2 text-sm">Alamouti vs 반복 비교</h4>
          <p className="text-xs text-slate-600">
            반복 코드가 같은 bit rate를 유지하려면 4-PAM을 사용해야 합니다.
            같은 minimum distance를 달성하려면 반복 방식이 <strong className="text-red-600">2.5배 더 많은 전력</strong>이 필요합니다
            (5배 에너지 per symbol for 4-PAM / 2 Tx for Alamouti = 2.5).
            반복 코드는 자유도를 비효율적으로 사용합니다.
          </p>
        </div>
      </div>

      <div className="concept-card mb-6" id="determinant-criterion">
        <h4 className="font-semibold text-slate-800 mb-2">3.3.2+ Determinant Criterion for Space-Time Code Design</h4>
        <p className="text-sm text-slate-600 mb-3">
          Space-time code를 코드워드 집합 <InlineMath math={String.raw`\{\mathbf{X}_i\}`} />로 일반화합니다.
          <InlineMath math={String.raw`\mathbf{X}_i \in \mathbb{R}^{L \times N}`} />, L: Tx 안테나 수, N: 블록 길이.
        </p>
        <BlockMath math={String.raw`\mathbf{y}^t = \mathbf{h}^* \mathbf{X} + \mathbf{w}^t, \quad \mathbf{h} := \begin{bmatrix}h_1^* \\ \vdots \\ h_L^*\end{bmatrix}, \; \mathbf{y} := \begin{bmatrix}y[1] \\ \vdots \\ y[N]\end{bmatrix}`} />

        <div className="formula-block !my-4 !p-4">
          <h4 className="font-semibold text-blue-800 mb-2">Singular Value 분해를 통한 오류 분석</h4>
          <p className="text-sm text-slate-600 mb-2">
            <InlineMath math={String.raw`(\mathbf{X}_A - \mathbf{X}_B)(\mathbf{X}_A - \mathbf{X}_B)^*`} />는 Hermitian이므로
            eigendecomposition <InlineMath math={String.raw`\mathbf{U}\boldsymbol{\Lambda}\mathbf{U}^*`} />가 가능합니다.
            <InlineMath math={String.raw`\boldsymbol{\Lambda} = \text{diag}\{\lambda_1^2, \dots, \lambda_L^2\}`} />,{' '}
            <InlineMath math={String.raw`\lambda_l`} />: <InlineMath math={String.raw`\mathbf{X}_A - \mathbf{X}_B`} />의 singular values.
          </p>
          <BlockMath math={String.raw`\mathbb{P}\{\mathbf{X}_A \to \mathbf{X}_B | \mathbf{h}\} = \mathbb{E}\!\left[Q\!\left(\sqrt{\frac{\text{SNR}\sum_{l=1}^{L} |\tilde{h}_l|^2 \lambda_l^2}{2}}\right)\right] \le \prod_{l=1}^{L} \frac{1}{1 + \text{SNR}\,\lambda_l^2/4}`} />
          <p className="text-sm text-slate-600 mt-2">
            여기서 <InlineMath math={String.raw`\tilde{\mathbf{h}} := \mathbf{U}^*\mathbf{h}`} />,{' '}
            <InlineMath math={String.raw`\tilde{h}_l \sim_{\text{i.i.d.}} \mathcal{CN}(0,1)`} /> (unitary 변환 보존).
          </p>
        </div>

        <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100 mb-3">
          <h4 className="font-semibold text-emerald-800 mb-2 text-sm">Full Diversity 조건</h4>
          <p className="text-sm text-slate-600">
            모든 <InlineMath math={String.raw`\lambda_l^2 > 0`} />이면 maximal diversity gain <InlineMath math="L" />을 달성합니다.
            이는 <InlineMath math={String.raw`N \ge L`} /> (블록 길이 ≥ Tx 안테나 수)일 때 가능합니다.
          </p>
        </div>

        <div className="formula-block !my-4 !p-4">
          <h4 className="font-semibold text-blue-800 mb-2">Determinant Criterion (High SNR)</h4>
          <BlockMath math={String.raw`\mathbb{P}\{\mathbf{X}_A \to \mathbf{X}_B\} \le \frac{4^L}{\text{SNR}^L \prod_{l=1}^{L} \lambda_l^2} = \frac{4^L}{\text{SNR}^L \det\!\left[(\mathbf{X}_A - \mathbf{X}_B)(\mathbf{X}_A - \mathbf{X}_B)^*\right]}`} />
          <p className="text-sm text-slate-600 mt-2">
            <strong>코딩 이득</strong>은 <InlineMath math={String.raw`\det[(\mathbf{X}_A - \mathbf{X}_B)(\mathbf{X}_A - \mathbf{X}_B)^*]`} />의 최솟값으로 결정됩니다.
            시간 다이버시티의 product distance <InlineMath math={String.raw`\delta_{ij} = |d_1 d_2|^2`} />가 이 determinant의 특수한 경우입니다.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-3 mt-3 text-sm">
          <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
            <div className="font-bold text-indigo-700 mb-1">Alamouti (BPSK)</div>
            <BlockMath math={String.raw`\min \det = (\Delta u_1^2 + \Delta u_2^2)^2`} />
            <div className="text-slate-600 text-xs">
              <InlineMath math={String.raw`= (0^2 + \sqrt{2}^2)^2 = \mathbf{4}`} />
            </div>
          </div>
          <div className="p-3 bg-red-50 rounded-lg border border-red-100">
            <div className="font-bold text-red-700 mb-1">반복 (4-PAM)</div>
            <BlockMath math={String.raw`\min \det = (\Delta u)^4`} />
            <div className="text-slate-600 text-xs">
              <InlineMath math={String.raw`= (2/\sqrt{5})^4 = \mathbf{16/25}`} />
            </div>
          </div>
        </div>
        <p className="text-sm text-slate-600 mt-2">
          Alamouti가 반복 대비 약 <strong>6배(4 ÷ 16/25 = 6.25)</strong>의 coding gain을 가집니다.
        </p>
      </div>

      <div className="concept-card mb-6" id="mimo-preview">
        <h4 className="font-semibold text-slate-800 mb-2">3.3.3 MIMO 2×2 예제</h4>
        <p className="text-sm text-slate-600 mb-3">
          2 Tx, 2 Rx 안테나에서 4개의 독립 페이딩 경로(안테나 간격 충분)가 존재합니다.
          최대 diversity gain은 4입니다. 이 자원을 어떻게 활용하느냐에 따라 다이버시티와 멀티플렉싱이 결정됩니다.
        </p>

        <div className="flex gap-2 mb-3 flex-wrap">
          <button
            onClick={() => setMimoTab('dof')}
            className={`px-3 py-1.5 rounded-lg text-sm border ${mimoTab === 'dof' ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-slate-600 border-slate-300'}`}
          >
            Degrees of Freedom
          </button>
          <button
            onClick={() => setMimoTab('vblast')}
            className={`px-3 py-1.5 rounded-lg text-sm border ${mimoTab === 'vblast' ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-slate-600 border-slate-300'}`}
          >
            V-BLAST
          </button>
          <button
            onClick={() => setMimoTab('comparison')}
            className={`px-3 py-1.5 rounded-lg text-sm border ${mimoTab === 'comparison' ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-slate-600 border-slate-300'}`}
          >
            Alamouti vs V-BLAST
          </button>
          <button
            onClick={() => setMimoTab('decorrelator')}
            className={`px-3 py-1.5 rounded-lg text-sm border ${mimoTab === 'decorrelator' ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-slate-600 border-slate-300'}`}
          >
            Decorrelator
          </button>
        </div>

        {mimoTab === 'dof' && (
          <div className="p-4 bg-violet-50 rounded-lg border border-violet-200">
            <h5 className="font-semibold text-violet-800 mb-2">Degrees of Freedom (자유도)</h5>
            <p className="text-sm text-slate-600 mb-2">
              채널의 자유도 = 수신 신호 공간의 차원입니다.
            </p>
            <div className="grid md:grid-cols-2 gap-3 mt-2">
              <div className="p-3 bg-white rounded-lg text-sm">
                <div className="font-bold text-slate-700 mb-1">1 Tx, 2 Rx (SIMO)</div>
                <BlockMath math={String.raw`\mathbf{y} = \mathbf{h}x + \mathbf{w}`} />
                <p className="text-xs text-slate-600">
                  신호 공간 차원 = 1 (<InlineMath math={String.raw`\mathbf{h}`} />가 span하는 1차원).
                  타임슬롯당 1 DoF.
                </p>
              </div>
              <div className="p-3 bg-white rounded-lg text-sm">
                <div className="font-bold text-slate-700 mb-1">2 Tx, 2 Rx (MIMO)</div>
                <BlockMath math={String.raw`\mathbf{y} = \mathbf{h}_1 x_1 + \mathbf{h}_2 x_2 + \mathbf{w}`} />
                <p className="text-xs text-slate-600">
                  <InlineMath math={String.raw`\mathbf{h}_1, \mathbf{h}_2`} />가 선형 독립이면 신호 공간 차원 = 2.
                  타임슬롯당 잠재적 2 DoF.
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-600 mt-3">
              반복 코드: 1 심볼을 2 타임슬롯에 전송 → diversity 4, DoF 활용 비효율적.{' '}
              Alamouti: 2 심볼을 2 타임슬롯에 전송 → diversity 4, 더 나은 DoF 활용.
            </p>
          </div>
        )}

        {mimoTab === 'vblast' && (
          <div className="p-4 bg-violet-50 rounded-lg border border-violet-200">
            <h5 className="font-semibold text-violet-800 mb-2">V-BLAST (Spatial Multiplexing)</h5>
            <p className="text-sm text-slate-600 mb-2">
              독립적인 uncoded 심볼을 각 안테나에서 동시에 전송합니다.
              시간이 아닌 <strong>공간에서 독립 데이터 스트림을 다중화</strong>합니다.
            </p>
            <p className="text-sm text-slate-600 mb-2">
              다중 수신 안테나(<InlineMath math="n_r" />)에서의 pairwise error probability:
            </p>
            <BlockMath math={String.raw`\mathbb{P}\{\mathbf{X}_A \to \mathbf{X}_B\} \le \left[\prod_{l=1}^{L} \frac{1}{1 + \text{SNR}\,\lambda_l^2/4}\right]^{n_r}`} />
            <p className="text-sm text-slate-600 mt-2">
              V-BLAST는 시간에 걸친 코딩을 하지 않으므로, space-time 행렬이 공간만의 벡터가 됩니다:
            </p>
            <BlockMath math={String.raw`\mathbb{P}\{\mathbf{x}_1 \to \mathbf{x}_2\} \le \left[\frac{1}{1 + \text{SNR}\|\mathbf{x}_1 - \mathbf{x}_2\|^2/4}\right]^2 \le \frac{16}{\text{SNR}^2 \|\mathbf{x}_1 - \mathbf{x}_2\|^4}`} />
            <p className="text-xs text-slate-500 mt-2">
              <InlineMath math={String.raw`\|\mathbf{x}_1 - \mathbf{x}_2\|^4`} />:
              시간 다이버시티의 determinant criterion에 대응하는 역할로 coding gain을 결정합니다.
            </p>
          </div>
        )}

        {mimoTab === 'comparison' && (
          <div className="p-4 bg-violet-50 rounded-lg border border-violet-200">
            <h5 className="font-semibold text-violet-800 mb-2">Alamouti vs V-BLAST (2×2, 같은 data rate)</h5>
            <p className="text-sm text-slate-600 mb-2">
              Alamouti: 4-PAM + BPSK, V-BLAST: BPSK. 같은 data rate에서 worst-case pairwise error:
            </p>
            <div className="grid md:grid-cols-2 gap-3 mt-2">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div className="font-bold text-blue-700 mb-1">V-BLAST</div>
                <BlockMath math={String.raw`\max_{i \ne j} \mathbb{P}\{\mathbf{x}_i \to \mathbf{x}_j\} \le 4 \cdot \text{SNR}^{-2}`} />
                <div className="text-xs text-slate-600">Diversity gain = <strong className="text-red-600">2</strong></div>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                <div className="font-bold text-emerald-700 mb-1">Alamouti</div>
                <BlockMath math={String.raw`\max_{i \ne j} \mathbb{P}\{\mathbf{x}_i \to \mathbf{x}_j\} \le 1600 \cdot \text{SNR}^{-4}`} />
                <div className="text-xs text-slate-600">Diversity gain = <strong className="text-emerald-600">4</strong></div>
              </div>
            </div>
            <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200 text-sm">
              <p className="text-slate-700">
                <strong>Diversity gain:</strong> Alamouti (4) {'>'} V-BLAST (2) — Alamouti가 더 가파른 SNR 기울기.
              </p>
              <p className="text-slate-700 mt-1">
                <strong>Coding gain:</strong> V-BLAST {'>'} Alamouti — V-BLAST는 전체 공간 자유도를 활용.
              </p>
              <p className="text-xs text-slate-500 mt-2">
                이것이 diversity-multiplexing tradeoff의 핵심입니다.
                High SNR에서는 diversity gain이 지배적이지만, moderate SNR에서는 coding gain이 중요할 수 있습니다.
              </p>
            </div>
          </div>
        )}

        {mimoTab === 'decorrelator' && (
          <div className="p-4 bg-violet-50 rounded-lg border border-violet-200">
            <h5 className="font-semibold text-violet-800 mb-2">Decorrelator (Zero-Forcing Detector)</h5>
            <p className="text-sm text-slate-600 mb-2">
              ML detection은 joint detection이 필요하여 안테나 수에 따라 복잡도가 지수적으로 증가합니다.
              Decorrelator는 채널 역행렬을 적용하여 심볼을 개별적으로 검출합니다.
            </p>
            <BlockMath math={String.raw`\mathbf{y} = \mathbf{H}\mathbf{x} + \mathbf{w} \;\;\Rightarrow\;\; \tilde{\mathbf{y}} = \mathbf{H}^{-1}\mathbf{y} = \mathbf{x} + \mathbf{H}^{-1}\mathbf{w} = \mathbf{x} + \tilde{\mathbf{w}}`} />
            <p className="text-sm text-slate-600 mb-2">
              <InlineMath math={String.raw`\mathbf{H} = [\mathbf{h}_1, \mathbf{h}_2] = \begin{bmatrix}h_{11} & h_{12} \\ h_{21} & h_{22}\end{bmatrix}`} />,{' '}
              <InlineMath math={String.raw`\mathbf{x} = [x_1, x_2]^t`} />
            </p>
            <p className="text-sm text-slate-600 mb-2">
              각 심볼에 대해:
            </p>
            <BlockMath math={String.raw`\tilde{y}_1 = x_1 + \frac{\sqrt{|h_{22}|^2 + |h_{12}|^2}}{|h_{11}h_{22} - h_{21}h_{12}|}\,z_1, \quad z_1 \sim \mathcal{CN}(0, N_0)`} />

            <div className="mt-3 p-3 bg-white rounded-lg">
              <h6 className="font-semibold text-slate-700 mb-2 text-sm">기하학적 해석</h6>
              <p className="text-xs text-slate-600 mb-2">
                <InlineMath math={String.raw`\mathbf{h}_j`} />: Tx 안테나 <InlineMath math="j" />의 신호 방향.{' '}
                <InlineMath math={String.raw`\boldsymbol{\phi}_j`} />: <InlineMath math={String.raw`\mathbf{h}_j`} />에 직교하는 방향.
              </p>
              <p className="text-xs text-slate-600 mb-2">
                <InlineMath math={String.raw`x_1`} /> 검출 시: <InlineMath math={String.raw`\boldsymbol{\phi}_2`} /> 방향으로 투영하여
                <InlineMath math={String.raw`\mathbf{h}_2 x_2`} /> 성분을 제거(nulling)합니다.
              </p>
              <p className="text-xs text-slate-600 mb-2">
                <InlineMath math={String.raw`\boldsymbol{\phi}_i = \frac{1}{\sqrt{|h_{2i}|^2 + |h_{1i}|^2}}[h_{2i}^*, -h_{1i}^*]^t`} />{' '}
                (<InlineMath math={String.raw`\mathbf{H}^{-1}`} />의 행 벡터를 정규화한 것)
              </p>
              <BlockMath math={String.raw`y_1' = (\boldsymbol{\phi}_2^* \mathbf{h}_1) x_1 + z_1 \;\;\Rightarrow\;\; \text{1×1 채널과 유사, diversity = \mathbf{1}만 획득}`} />
              <p className="text-xs text-slate-500 mt-2">
                Nulling 과정에서 차원을 소모하므로, 2×2에서 decorrelator는 각 스트림에 <strong>unit diversity</strong>만 제공합니다.
                이는 ML detection의 diversity 2보다 낮습니다.
              </p>
            </div>
          </div>
        )}
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
