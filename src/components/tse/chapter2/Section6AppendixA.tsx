'use client';

import { BlockMath, InlineMath } from 'react-katex';
import GaussianDetectionEstimationLab from '@/components/tse/interactive/GaussianDetectionEstimationLab';

interface Section6AppendixAProps {
  onNavigate: (id: string) => void;
}

export default function Section6AppendixA({ onNavigate }: Section6AppendixAProps) {
  return (
    <section id="appendix-a" className="section-card transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <span className="badge badge-red">Advanced</span>
        <span className="text-sm text-slate-400">Section 7</span>
      </div>

      <h2 className="text-3xl font-bold text-slate-900 mb-4">
        Appendix A: Gaussian 확률변수와 검출·추정 이론
      </h2>

      <p className="text-lg text-slate-600 leading-relaxed mb-8">
        Appendix A는 Chapter 2를 수신기 관점에서 완성합니다.
        앞선 섹션들이 채널의 물리·통계 모델을 다루었다면, 여기서는 그 채널 위에서 실제로
        데이터를 복조(<strong>검출</strong>)하고 채널 상태를 복원(<strong>추정</strong>)하는 핵심 수학을 정리합니다.
        Gaussian 확률변수의 성질에서 출발해 최적 검출기와 추정기의 형태를 단계적으로 살펴봅니다.
      </p>

      {/* ───────── A.1 Gaussian Random Variables ───────── */}
      <div id="appendix-a1" className="concept-card mb-8">
        <div className="text-xs font-semibold text-red-600 mb-1">Appendix A.1</div>
        <h3 className="font-bold text-xl text-slate-800 mb-3">Gaussian Random Variables</h3>
        <p className="text-sm text-slate-600 mb-4">
          무선 채널 분석에서 가우시안 분포가 반복적으로 등장합니다 — 잡음도 가우시안, 채널 탭도 가우시안입니다.
          이 분포의 핵심 성질을 정리해두면 이후 검출·추정 분석이 자연스럽게 따라옵니다.
        </p>
        <div className="formula-block mb-4">
          <h4 className="font-semibold text-blue-800 mb-2">Real Gaussian PDF</h4>
          <BlockMath math={String.raw`f_X(x) = \frac{1}{\sqrt{2\pi\sigma^2}} \exp\!\left(-\frac{(x-\mu)^2}{2\sigma^2}\right)`} />
        </div>

        <p className="text-sm text-slate-600 mb-4">
          무선 채널에서는 I/Q 두 성분을 함께 다루기 위해 <strong>원형대칭 복소 가우시안(circularly-symmetric complex Gaussian)</strong>을 사용합니다.
          <InlineMath math="Z \sim \mathcal{CN}(0, \sigma^2)" />는 다음과 같이 정의됩니다.
        </p>
        <div className="formula-block mb-4">
          <h4 className="font-semibold text-blue-800 mb-2">Complex Circular-Symmetric Gaussian</h4>
          <BlockMath math={String.raw`Z = X + jY, \quad X, Y \overset{\text{iid}}{\sim} \mathcal{N}\!\left(0,\, \frac{\sigma^2}{2}\right)`} />
          <div className="text-sm text-slate-600 mt-2">
            실수부와 허수부가 독립이고 같은 분산을 가지므로, 위상이 균일하게 분포하여 "원형대칭"이 됩니다.
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
            <div className="font-bold text-blue-700 dark:text-blue-400 mb-1">Envelope: Rayleigh 분포</div>
            <BlockMath math={String.raw`|Z| \sim \text{Rayleigh}(\sigma/\sqrt{2})`} />
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              복소 가우시안의 크기가 Rayleigh 분포를 따릅니다.
              이것이{' '}
              <button onClick={() => onNavigate('statistical')} className="cross-ref !text-xs">
                Section 2.4
              </button>
              에서 본 Rayleigh fading의 수학적 유래입니다.
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              <strong>Deep fade</strong>란 envelope이 0에 가까워지는 사건으로,
              Rayleigh 분포에서는 이 확률이 무시할 수 없을 만큼 크기 때문에
              다이버시티나 코딩으로 대비해야 합니다.
            </p>
          </div>
          <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800">
            <div className="font-bold text-indigo-700 dark:text-indigo-400 mb-1">Power: Exponential 분포</div>
            <BlockMath math={String.raw`|Z|^2 \sim \text{Exponential}(1/\sigma^2)`} />
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              <InlineMath math="|Z|^2" />이 지수분포를 따르므로 수신 전력도 지수분포입니다.
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              이 덕분에 outage probability를 닫힌 형태로 계산할 수 있습니다:{' '}
              <InlineMath math={String.raw`P(|h|^2 < x) = 1 - e^{-x/\sigma^2}`} />.
              시스템 설계 시 목표 outage에 필요한 SNR 마진을 해석적으로 구할 수 있다는 것이 핵심입니다.
            </p>
          </div>
        </div>

        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg mb-4">
          <h4 className="font-semibold text-emerald-800 mb-2">Gaussian Closure Property</h4>
          <p className="text-sm text-slate-600 mb-2">
            가우시안 확률변수들의 선형결합은 다시 가우시안입니다.
            이 <strong>닫힘 성질(closure property)</strong> 덕분에, 다중경로 합성이나 AWGN 잡음 누적 후에도
            신호+잡음의 분포가 여전히 가우시안으로 유지됩니다.
          </p>
          <BlockMath math={String.raw`\sum_{i=1}^{N} a_i Z_i \sim \mathcal{CN}\!\left(\sum_i a_i \mu_i,\; \sum_i |a_i|^2 \sigma_i^2\right)`} />
        </div>

        <div className="formula-block mb-4">
          <h4 className="font-semibold text-blue-800 mb-2">Q-function</h4>
          <p className="text-sm text-slate-600 mb-2">
            표준 가우시안의 꼬리 확률을 나타내는 함수로, 검출 오류 확률 계산의 핵심입니다.
          </p>
          <BlockMath math={String.raw`Q(a) := P\{w > a\} = \frac{1}{\sqrt{2\pi}} \int_a^{\infty} e^{-t^2/2}\,dt`} />
          <p className="text-sm text-slate-600 mt-2 mb-2">
            <strong>지수적 감쇠 bounds:</strong> Q-function은 다음과 같이 상한과 하한으로 제한됩니다.
          </p>
          <BlockMath math={String.raw`\frac{1}{\sqrt{2\pi}a}\left(1-\frac{1}{a^2}\right)e^{-a^2/2} < Q(a) < e^{-a^2/2}`} />
          <p className="text-xs text-slate-500 mt-1">
            <InlineMath math="a" />가 커질수록 <InlineMath math="Q(a)" />는 <strong>지수적으로</strong> 빠르게 감소합니다.
            이것이 AWGN 채널에서 SNR 증가에 따른 BER 급감의 수학적 근거입니다.
          </p>
        </div>

        <div className="insight">
          <div className="insight-title">Section 2.4와의 연결</div>
          <p className="text-sm text-amber-900">
            이 결과가 바로{' '}
            <button onClick={() => onNavigate('statistical')} className="cross-ref !text-xs">
              Section 2.4 Statistical Models
            </button>
            에서 채널 탭을 <InlineMath math="\mathcal{CN}(0, \sigma_\ell^2)" />로 모델링하는 수학적 근거입니다.
            다수의 산란 경로가 합성되면 중심극한정리에 의해 탭 계수가 복소 가우시안에 수렴하고,
            그 envelope는 자연스럽게 Rayleigh 분포를 따릅니다.
            LOS 성분이 추가되면 Rician 분포가 됩니다.
          </p>
        </div>
      </div>

      {/* A.1.2 Real Gaussian Random Vectors */}
      <div id="appendix-a1-vectors" className="concept-card mb-8">
        <div className="text-xs font-semibold text-red-600 mb-1">Appendix A.1.2</div>
        <h3 className="font-bold text-xl text-slate-800 mb-3">Real Gaussian Random Vectors</h3>
        <p className="text-sm text-slate-600 mb-4">
          스칼라에서 벡터로 확장합니다.
          MIMO 채널, 빔포밍, 공분산 기반 추정 등 다차원 가우시안이 통신의 기본 도구입니다.
        </p>

        <div className="formula-block mb-4">
          <h4 className="font-semibold text-blue-800 mb-2">Standard Gaussian Random Vector</h4>
          <p className="text-sm text-slate-600 mb-2">
            <InlineMath math="n" />개의 i.i.d. 표준 가우시안 변수로 구성된 벡터{' '}
            <InlineMath math={String.raw`\mathbf{w} = (w_1, \ldots, w_n)^t`} />입니다.
          </p>
          <BlockMath math={String.raw`f(\mathbf{w}) = \frac{1}{(\sqrt{2\pi})^n} \exp\!\left(-\frac{\|\mathbf{w}\|^2}{2}\right), \quad \mathbf{w} \in \mathbb{R}^n`} />
          <p className="text-xs text-slate-500 mt-1">
            PDF가 <strong>크기(norm)</strong>에만 의존하고 방향에 무관합니다 -- 이것이 등방성(isotropic property)의 근거입니다.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="font-bold text-blue-700 mb-1">Isotropic Property</div>
            <p className="text-sm text-slate-600 mb-2">
              직교 변환 <InlineMath math="\mathbf{O}" />에 대해,{' '}
              <InlineMath math="\mathbf{w}" />가 표준 가우시안이면{' '}
              <InlineMath math="\mathbf{Ow}" />도 표준 가우시안입니다.
            </p>
            <p className="text-xs text-slate-500">
              어떤 직교 좌표계에서 보더라도 같은 분포 -- 방향 편향이 없는 완전한 대칭성입니다.
            </p>
          </div>
          <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
            <div className="font-bold text-indigo-700 mb-1">
              <InlineMath math={String.raw`\|\mathbf{w}\|^2`} />: Chi-squared Distribution
            </div>
            <p className="text-sm text-slate-600 mb-2">
              <InlineMath math={String.raw`\|\mathbf{w}\|^2 = \sum_{i=1}^n w_i^2`} />는{' '}
              자유도 <InlineMath math="n" />인 <InlineMath math="\chi^2" />-분포를 따릅니다.
            </p>
            <BlockMath math={String.raw`n=2: \quad f(a) = \frac{1}{2}\exp\!\left(-\frac{a}{2}\right), \; a \ge 0`} />
            <p className="text-xs text-slate-500">
              <InlineMath math="n=2" />이면 지수분포 -- Rayleigh 전력이 지수분포를 따르는 것과 연결됩니다.
            </p>
          </div>
        </div>

        <div className="formula-block mb-4">
          <h4 className="font-semibold text-blue-800 mb-2">
            General Gaussian Vector: <InlineMath math={String.raw`\mathbf{x} = \mathbf{A}\mathbf{w} + \boldsymbol{\mu}`} />
          </h4>
          <p className="text-sm text-slate-600 mb-2">
            표준 가우시안에 선형 변환과 평균 이동을 적용하면 일반 가우시안 벡터가 됩니다. A가 가역이면:
          </p>
          <BlockMath math={String.raw`f(\mathbf{x}) = \frac{1}{(\sqrt{2\pi})^n \sqrt{\det(\mathbf{A}\mathbf{A}^t)}} \exp\!\left(-\frac{1}{2}(\mathbf{x}-\boldsymbol{\mu})^t (\mathbf{A}\mathbf{A}^t)^{-1} (\mathbf{x}-\boldsymbol{\mu})\right)`} />
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="font-bold text-slate-700 mb-1">Covariance Matrix</div>
            <BlockMath math={String.raw`\mathbf{K} := \mathbb{E}\!\left[(\mathbf{x}-\boldsymbol{\mu})(\mathbf{x}-\boldsymbol{\mu})^t\right] = \mathbf{A}\mathbf{A}^t`} />
            <p className="text-xs text-slate-500 mt-1">
              평균과 공분산이 가우시안 벡터의 분포를 완전히 결정합니다.
            </p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="font-bold text-slate-700 mb-1">Properties</div>
            <ul className="text-xs text-slate-600 list-disc list-inside space-y-1">
              <li>임의의 선형결합도 가우시안</li>
              <li>등밀도 곡면이 타원체(ellipsoid)</li>
              <li>K가 대각이면 White Gaussian</li>
              <li>A가 비가역이면 저차원 부분공간에 국한</li>
            </ul>
          </div>
        </div>
      </div>

      {/* A.1.3 Complex Gaussian Vectors (enriched) */}
      <div id="appendix-a1-complex" className="concept-card mb-8">
        <div className="text-xs font-semibold text-red-600 mb-1">Appendix A.1.3</div>
        <h3 className="font-bold text-xl text-slate-800 mb-3">Complex Gaussian Random Vectors</h3>
        <p className="text-sm text-slate-600 mb-4">
          복소 가우시안 벡터 <InlineMath math={String.raw`\mathbf{x} = \mathbf{x}_R + j\mathbf{x}_I`} />는
          실수부와 허수부가 각각 실수 가우시안 벡터인 경우입니다.
        </p>

        <div className="formula-block mb-4">
          <h4 className="font-semibold text-blue-800 mb-2">Second-order Statistics</h4>
          <p className="text-sm text-slate-600 mb-2">
            복소 벡터는 공분산 행렬 <InlineMath math="\mathbf{K}" />와{' '}
            <strong>pseudo-covariance 행렬 <InlineMath math="\mathbf{J}" /></strong>로 특성화됩니다.
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
              <div className="font-semibold text-sm text-blue-700 mb-1">Covariance K</div>
              <BlockMath math={String.raw`\mathbf{K} := \mathbb{E}\!\left[(\mathbf{x}-\boldsymbol{\mu})(\mathbf{x}-\boldsymbol{\mu})^*\right]`} />
              <p className="text-xs text-slate-500"><InlineMath math="n^2" /> real parameters</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
              <div className="font-semibold text-sm text-purple-700 mb-1">Pseudo-covariance J</div>
              <BlockMath math={String.raw`\mathbf{J} := \mathbb{E}\!\left[(\mathbf{x}-\boldsymbol{\mu})(\mathbf{x}-\boldsymbol{\mu})^T\right]`} />
              <p className="text-xs text-slate-500"><InlineMath math="n^2 + n" /> real parameters</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            전체 2차 통계: <InlineMath math="n(2n+1)" /> real parameters.
          </p>
        </div>

        <div className="p-4 bg-violet-50 border border-violet-200 rounded-lg mb-4">
          <h4 className="font-semibold text-violet-800 mb-2">Circular Symmetry -- Definition A.17</h4>
          <p className="text-sm text-slate-600 mb-2">
            복소 벡터 <InlineMath math="\mathbf{x}" />가 <strong>circular symmetric</strong>이란,
            임의의 <InlineMath math="\theta" />에 대해{' '}
            <InlineMath math={String.raw`e^{j\theta}\mathbf{x}`} />가 같은 분포를 갖는 것입니다.
          </p>
          <div className="space-y-3 mt-3">
            <div className="p-3 bg-white rounded-lg border border-violet-100">
              <p className="text-xs font-semibold text-violet-700 mb-1">Zero Mean</p>
              <BlockMath math={String.raw`\mathbb{E}[\mathbf{x}] = e^{j\theta}\mathbb{E}[\mathbf{x}] \;\;\Rightarrow\;\; \mathbb{E}[\mathbf{x}] = \mathbf{0}`} />
            </div>
            <div className="p-3 bg-white rounded-lg border border-violet-100">
              <p className="text-xs font-semibold text-violet-700 mb-1">Zero Pseudo-covariance</p>
              <BlockMath math={String.raw`\mathbb{E}[\mathbf{x}\mathbf{x}^t] = e^{j2\theta}\mathbb{E}[\mathbf{x}\mathbf{x}^t] \;\;\Rightarrow\;\; \mathbf{J} = \mathbf{0}`} />
              <p className="text-xs text-slate-500">
                원형대칭이면 K 하나만으로 분포가 완전히 결정됩니다.
              </p>
            </div>
          </div>
        </div>

        <div className="formula-block mb-4">
          <h4 className="font-semibold text-blue-800 mb-2">Circular Symmetric Complex Gaussian Scalar</h4>
          <p className="text-sm text-slate-600 mb-2">
            <InlineMath math={String.raw`w = w_r + jw_i`} />에서 i.i.d. 영평균 가우시안이면,
            <InlineMath math={String.raw`\sigma^2 := \mathbb{E}[|w|^2]`} />로 완전히 지정됩니다.
          </p>
          <div className="grid md:grid-cols-3 gap-3 mt-2">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
              <div className="text-xs font-semibold text-slate-700 mb-1">Phase</div>
              <p className="text-xs text-slate-600">Uniform on <InlineMath math="[0, 2\pi]" /></p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
              <div className="text-xs font-semibold text-slate-700 mb-1">Magnitude</div>
              <p className="text-xs text-slate-600">Rayleigh distributed</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
              <div className="text-xs font-semibold text-slate-700 mb-1">Power</div>
              <p className="text-xs text-slate-600">Exponentially distributed</p>
            </div>
          </div>
        </div>
      </div>

      {/* ───────── A.2 Detection in Gaussian Noise ───────── */}
      <div id="appendix-a2" className="concept-card mb-8">
        <div className="text-xs font-semibold text-red-600 mb-1">Appendix A.2</div>
        <h3 className="font-bold text-xl text-slate-800 mb-3">Detection in Gaussian Noise</h3>
        <p className="text-sm text-slate-600 mb-4">
          검출 문제는 수신 신호 <InlineMath math="y" />로부터 송신 심볼 <InlineMath math="u" />를 판정하는 것입니다.
          AWGN 채널에서 이진 가설 검정(binary hypothesis testing)으로 정식화하며,
          오류 확률을 최소화하는 최적 판정 규칙을 도출합니다.
        </p>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="font-bold text-slate-700 mb-1"><InlineMath math="H_0" />: 가설 0</div>
            <BlockMath math={String.raw`y = u_0 + w, \quad w \sim \mathcal{CN}(0, N_0)`} />
          </div>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="font-bold text-slate-700 mb-1"><InlineMath math="H_1" />: 가설 1</div>
            <BlockMath math={String.raw`y = u_1 + w, \quad w \sim \mathcal{CN}(0, N_0)`} />
          </div>
        </div>

        <div className="formula-block mb-4">
          <h4 className="font-semibold text-blue-800 dark:text-blue-400 mb-2">Likelihood Ratio Test (LRT)</h4>
          <BlockMath math={String.raw`\Lambda(y) = \frac{p(y \mid H_1)}{p(y \mid H_0)} \underset{H_0}{\overset{H_1}{\gtrless}} \gamma`} />
          <div className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            우도비(likelihood ratio)를 임계값 <InlineMath math="\gamma" />와 비교하여 가설을 판정합니다.
          </div>
          <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg space-y-2">
            <p className="text-sm text-slate-700 dark:text-slate-300">
              <strong>직관:</strong> 두 가설 중 어느 것이 관측 <InlineMath math="y" />를 더 잘 설명하는지 비교합니다.
              우도비가 1보다 크면 <InlineMath math="H_1" />이 더 그럴듯하다는 뜻입니다.
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              <strong>가우시안 잡음에서의 단순화:</strong> log를 취하면 지수 부분이 이차식이 되어,
              결국 수신점과 각 가설 사이의 <em>거리 비교</em>로 환원됩니다.
            </p>
          </div>
        </div>

        <div className="compare-grid mb-4">
          <div className="compare-item border-blue-200 bg-blue-50/40 dark:bg-blue-900/20 dark:border-blue-700">
            <h4 className="font-bold text-blue-800 dark:text-blue-400 mb-2">MAP Rule</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
              사전확률 <InlineMath math="\pi_i = P(H_i)" />를 반영하여 사후확률을 최대화합니다.
            </p>
            <BlockMath math={String.raw`\hat{H}_{MAP} = \arg\max_i\; \pi_i \cdot p(y \mid H_i)`} />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              임계값: <InlineMath math="\gamma_{MAP} = \pi_0 / \pi_1" />
            </p>
            <div className="mt-3 p-2.5 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-slate-700 dark:text-slate-300">
                사전에 <InlineMath math="H_0" />이 <InlineMath math="H_1" />보다 10배 흔하다면,
                <InlineMath math="H_1" />이라고 판정하려면 그만큼 더 강한 증거가 필요합니다.
                사전확률 비율만큼 임계값이 이동합니다.
              </p>
            </div>
          </div>
          <div className="compare-item border-indigo-200 bg-indigo-50/40 dark:bg-indigo-900/20 dark:border-indigo-700">
            <h4 className="font-bold text-indigo-800 dark:text-indigo-400 mb-2">ML Rule</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
              사전확률이 같거나 미지일 때, 우도만으로 판정합니다.
            </p>
            <BlockMath math={String.raw`\hat{H}_{ML} = \arg\max_i\; p(y \mid H_i)`} />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              임계값: <InlineMath math="\gamma_{ML} = 1" /> (균등 사전확률)
            </p>
            <div className="mt-3 p-2.5 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 rounded-lg">
              <p className="text-sm text-slate-700 dark:text-slate-300">
                사전 정보 없이 순수하게 데이터만 보고 판단합니다.
                동전 던지기에서 앞뒤 확률을 모를 때의 접근과 같습니다.
              </p>
            </div>
          </div>
        </div>
        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-lg mb-4">
          <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1">언제 어떤 규칙을 쓰는가</div>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            통신에서는 보통 심볼이 균등분포(equiprobable)이므로 ML이 곧 MAP이 됩니다.
            레이더나 이상 탐지처럼 사건 발생 확률이 크게 다를 때만 MAP의 임계값 이동이 의미를 가집니다.
          </p>
        </div>

        <div className="formula-block mb-4">
          <h4 className="font-semibold text-blue-800 mb-2">ML 검출의 유클리드 거리 환원</h4>
          <p className="text-sm text-slate-600 mb-2">
            가우시안 잡음 아래 ML 규칙은 log-likelihood를 취하면 유클리드 거리 최소화로 단순화됩니다.
          </p>
          <BlockMath math={String.raw`\hat{u}_{ML} = \arg\min_{u_i} \|y - u_i\|^2`} />
          <div className="text-sm text-slate-600 mt-2">
            수신 벡터에서 가장 가까운 성상점(constellation point)을 고르는 것이 최적 검출입니다.
          </div>
        </div>

        <div className="formula-block mb-4">
          <h4 className="font-semibold text-blue-800 mb-2">Error Probability (이진 검출)</h4>
          <BlockMath math={String.raw`P_e = Q\!\left(\frac{d_{min}}{2\sqrt{N_0/2}}\right) = Q\!\left(\frac{\|u_1 - u_0\|}{\sqrt{2N_0}}\right)`} />
          <div className="text-sm text-slate-600 mt-2">
            여기서 <InlineMath math="Q(x) = \frac{1}{\sqrt{2\pi}}\int_x^\infty e^{-t^2/2}\,dt" />는 가우시안 꼬리 확률입니다.
            최소 거리 <InlineMath math="d_{min}" />이 클수록, 또는 잡음 전력 <InlineMath math="N_0" />가 작을수록
            오류 확률이 지수적으로 감소합니다.
          </div>
        </div>

        <div className="concept-card !bg-rose-50 dark:!bg-rose-900/30 !border-rose-200 dark:!border-rose-800 mb-4">
          <h4 className="font-semibold text-rose-800 mb-2">검출오차율과 링크 신뢰도의 직결</h4>
          <p className="text-sm text-slate-600">
            검출 오류 확률 <InlineMath math="P_e" />는 곧 링크의 BLER(Block Error Rate)과
            outage probability로 이어집니다.
            SNR이 높으면 <InlineMath math="d_{min}/\sqrt{N_0}" />가 커져 <InlineMath math="P_e" />가 급감하고,
            페이딩으로 SNR이 낮아지면 <InlineMath math="P_e" />가 급등합니다.
          </p>
        </div>

        <div className="insight">
          <div className="insight-title">Outage와의 연결</div>
          <p className="text-sm text-amber-900">
            <button onClick={() => onNavigate('statistical')} className="cross-ref !text-xs">
              Section 2.4
            </button>
            에서 정의한 outage probability <InlineMath math="P_{out} = P\{|h|^2 < \gamma_{th}\}" />는
            사실상 "페이딩으로 인해 <InlineMath math="P_e" />가 허용치를 초과하는 확률"입니다.
            검출 이론이 outage 분석의 수학적 기초를 제공합니다.
          </p>
        </div>
      </div>

      {/* ───────── A.3 Estimation in Gaussian Noise ───────── */}
      <div id="appendix-a3" className="concept-card mb-8">
        <div className="text-xs font-semibold text-red-600 mb-1">Appendix A.3</div>
        <h3 className="font-bold text-xl text-slate-800 mb-3">Estimation in Gaussian Noise</h3>
        <p className="text-sm text-slate-600 mb-4">
          추정 문제는 잡음이 섞인 관측 <InlineMath math="y" />로부터 연속값 파라미터
          <InlineMath math="x" />(예: 채널 계수 <InlineMath math="h" />)를 복원하는 것입니다.
          검출이 이산 심볼 판정이라면, 추정은 연속 파라미터 복원에 해당합니다.
        </p>

        <p className="text-sm text-slate-600 mb-4">
          스칼라 가우시안 관측 모델을 생각합니다.
        </p>
        <div className="formula-block mb-4">
          <h4 className="font-semibold text-blue-800 mb-2">Observation Model</h4>
          <BlockMath math={String.raw`y = x + w, \quad x \sim \mathcal{CN}(0, \sigma_x^2),\; w \sim \mathcal{CN}(0, N_0)`} />
          <div className="text-sm text-slate-600 mt-2">
            <InlineMath math="x" />는 추정 대상(채널 계수), <InlineMath math="w" />는 AWGN 잡음입니다.
          </div>
        </div>

        <div className="formula-block mb-4">
          <h4 className="font-semibold text-blue-800 mb-2">MMSE Estimator</h4>
          <p className="text-sm text-slate-600 mb-2">
            평균 제곱 오차(MSE)를 최소화하는 추정기는 조건부 기댓값입니다.
            가우시안 사전분포 아래서 닫힌 형태(closed-form)로 주어집니다.
          </p>
          <BlockMath math={String.raw`\hat{x}_{MMSE} = \mathbb{E}[x \mid y] = \frac{\sigma_x^2}{\sigma_x^2 + N_0} \cdot y`} />
          <div className="text-sm text-slate-600 mt-2">
            추정기 계수 <InlineMath math="\sigma_x^2 / (\sigma_x^2 + N_0)" />는 Wiener filter의 스칼라 버전입니다.
            SNR이 높으면 (<InlineMath math="\sigma_x^2 \gg N_0" />) 계수가 1에 가까워져 관측값을 그대로 쓰고,
            SNR이 낮으면 (<InlineMath math="\sigma_x^2 \ll N_0" />) 사전 평균(0)쪽으로 수축합니다.
          </div>
        </div>

        <div className="formula-block mb-4">
          <h4 className="font-semibold text-blue-800 mb-2">MMSE (최소 달성 오차)</h4>
          <p className="text-sm text-slate-600 mb-2">
            벡터 채널 <InlineMath math="h" />와 파일럿 관측이 포함된 일반적인 경우의 MMSE는 다음과 같습니다.
          </p>
          <BlockMath math={String.raw`\text{MMSE} = \frac{\sigma_x^2 \cdot N_0}{\sigma_x^2 \cdot \|h\|^2 + N_0}`} />
          <div className="text-sm text-slate-600 mt-2">
            채널 에너지 <InlineMath math="\|h\|^2" />가 크거나 잡음이 작을수록 추정 오차가 줄어듭니다.
          </div>
        </div>

        <div className="concept-card !bg-violet-50 dark:!bg-violet-900/30 !border-violet-200 dark:!border-violet-800 mb-4">
          <h4 className="font-semibold text-violet-800 mb-2">Pilot-Error vs Data-Efficiency Tradeoff</h4>
          <p className="text-sm text-slate-600 mb-2">
            채널 추정 품질을 높이려면 파일럿 심볼을 많이 보내야 하지만, 파일럿이 늘어나면
            데이터 전송에 쓸 수 있는 자원이 줄어듭니다.
          </p>
          <div className="grid md:grid-cols-2 gap-3 text-sm">
            <div className="p-3 bg-white rounded-lg border border-violet-100">
              <div className="font-bold text-violet-700 mb-1">파일럿 많음</div>
              <div className="text-slate-600">
                추정 오차 <InlineMath math="\downarrow" /> / 데이터 rate <InlineMath math="\downarrow" />
              </div>
            </div>
            <div className="p-3 bg-white rounded-lg border border-violet-100">
              <div className="font-bold text-violet-700 mb-1">파일럿 적음</div>
              <div className="text-slate-600">
                추정 오차 <InlineMath math="\uparrow" /> / 데이터 rate <InlineMath math="\uparrow" />
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            최적 파일럿 밀도는 코히런스 블록 크기 <InlineMath math="N_c = T_c \cdot W_c" />에 의해 결정됩니다.
          </p>
        </div>

        <div className="concept-card !bg-orange-50 dark:!bg-orange-900/30 !border-orange-200 dark:!border-orange-800 mb-4">
          <h4 className="font-semibold text-orange-800 mb-2">Effective SNR Degradation</h4>
          <p className="text-sm text-slate-600 mb-2">
            채널 추정 오차는 실효 SNR(effective SNR)을 감소시킵니다.
            완벽한 CSI를 가정한 이론적 SNR과 실제 달성 가능한 SNR의 차이가 추정 오차에 의해 결정됩니다.
          </p>
          <BlockMath math={String.raw`\text{SNR}_{eff} = \frac{|\hat{h}|^2 \cdot P}{|\hat{h} - h|^2 \cdot P + N_0} \;<\; \frac{|h|^2 \cdot P}{N_0} = \text{SNR}_{ideal}`} />
          <p className="text-xs text-slate-500 mt-2">
            추정 오차가 있으면 실효 SNR이 줄어들어 달성 가능한 throughput이 제한됩니다.
          </p>
        </div>

        <div className="insight">
          <div className="insight-title">코히런스 파라미터와 파일럿 설계의 연결</div>
          <p className="text-sm text-amber-900">
            <button onClick={() => onNavigate('parameters')} className="cross-ref !text-xs">
              Section 2.3 Coherence Parameters
            </button>
            에서 정의한 <InlineMath math="T_c" />와 <InlineMath math="W_c" />가 클수록
            코히런스 블록 내에 더 많은 파일럿을 배치할 수 있어 추정 품질이 향상됩니다.
            반대로 고속 이동 환경(<InlineMath math="T_c" /> 감소)에서는 파일럿 오버헤드가 증가하여
            throughput이 하락하며, 이것이 바로{' '}
            <button onClick={() => onNavigate('main-plot')} className="cross-ref !text-xs">
              2.5 Main Plot
            </button>
            에서 다루는 diversity-multiplexing tradeoff의 실질적 원인입니다.
          </p>
        </div>
      </div>

      {/* ───────── A.2/A.3 Integration ───────── */}
      <div className="concept-card mb-8">
        <h3 className="font-bold text-lg text-slate-800 mb-3">A.2/A.3 통합: Detection vs Estimation</h3>
        <p className="text-sm text-slate-600 mb-4">
          검출과 추정은 수신기의 두 가지 핵심 과제이며, 실제 시스템에서는 순차적으로 결합됩니다.
        </p>
        <div className="compare-grid mb-4">
          <div className="compare-item border-blue-200 bg-blue-50/40 dark:bg-blue-900/20 dark:border-blue-700">
            <h4 className="font-bold text-blue-800 mb-2">Detection 관점</h4>
            <ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
              <li>이산 심볼 판정 문제</li>
              <li>사전확률과 SNR에 따라 MAP 임계값이 이동</li>
              <li>오검출/미검출 비율이 바뀜</li>
              <li>성능 지표: <InlineMath math="P_e" />, BER, BLER</li>
            </ul>
          </div>
          <div className="compare-item border-indigo-200 bg-indigo-50/40 dark:bg-indigo-900/20 dark:border-indigo-700">
            <h4 className="font-bold text-indigo-800 mb-2">Estimation 관점</h4>
            <ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
              <li>연속 파라미터 복원 문제</li>
              <li>파일럿 수와 채널 에너지 <InlineMath math="\|h\|^2" />가 MMSE 결정</li>
              <li>추정 오차가 실효 SNR을 좌우</li>
              <li>성능 지표: MSE, 실효 SNR 손실</li>
            </ul>
          </div>
        </div>
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
          <p className="text-sm text-slate-700">
            <strong>실제 수신기 동작 순서:</strong>{' '}
            파일럿으로 채널 추정 (<InlineMath math="\hat{h}" />) →
            추정된 채널로 등화/검출 (<InlineMath math="\hat{u}" />) →
            검출 성능이 추정 품질에 종속.
            따라서 추정 오차가 곧 검출 오류의 floor를 결정합니다.
          </p>
        </div>
      </div>

      {/* ───────── Interactive Lab ───────── */}
      <h3 className="text-xl font-bold text-slate-800 mb-3">Interactive Lab: Detection & Estimation Explorer</h3>
      <p className="text-slate-600 mb-4">
        SNR, 사전확률, 파일럿 에너지를 조절하며 검출/추정 성능 변화를 직접 확인하세요.
        <button onClick={() => onNavigate('statistical')} className="cross-ref !text-xs ml-1">
          2.4 통계 모델
        </button>
        의 페이딩 분포와 비교해보면 더욱 효과적입니다.
      </p>

      <GaussianDetectionEstimationLab />

      {/* ───────── Final Insight ───────── */}
      <div className="insight mt-8">
        <div className="insight-title">Chapter 2 전체 연결 체인</div>
        <p className="text-sm text-amber-900 mb-3">
          Chapter 2의 학습 경로가 완성됩니다. 각 단계가 이전 단계의 결과에 의존하며 하나의 흐름을 이룹니다.
        </p>
        <div className="flex flex-wrap items-center gap-1 text-sm text-amber-900 mb-3">
          <button onClick={() => onNavigate('intro')} className="cross-ref !text-xs">
            2.1 물리 모델
          </button>
          <span>→</span>
          <button onClick={() => onNavigate('io-model')} className="cross-ref !text-xs">
            2.2 I/O 모델
          </button>
          <span>→</span>
          <button onClick={() => onNavigate('parameters')} className="cross-ref !text-xs">
            2.3 코히런스
          </button>
          <span>→</span>
          <button onClick={() => onNavigate('statistical')} className="cross-ref !text-xs">
            2.4 통계 모델
          </button>
          <span>→</span>
          <button onClick={() => onNavigate('main-plot')} className="cross-ref !text-xs">
            2.5 Main Plot
          </button>
          <span>→</span>
          <span className="font-bold">Appendix A 검출/추정</span>
        </div>
        <p className="text-sm text-amber-900">
          물리 모델이 I/O 모델의 파라미터를 결정하고, 코히런스가 통계 모델의 적용 범위를 한정하며,
          통계 모델이 검출/추정의 성능 한계를 규정합니다.
          이 전체 흐름이 체화되면 Chapter 3의 점대점 링크 설계를 탄탄하게 따라갈 수 있습니다.
        </p>
        <p className="text-sm text-amber-900 mt-2">
          다시 점검하고 싶다면{' '}
          <button onClick={() => onNavigate('main-plot')} className="cross-ref !text-xs">
            2.5 Main Plot
          </button>
          에서 파라미터를 직접 조정해보세요.
        </p>
      </div>
    </section>
  );
}
