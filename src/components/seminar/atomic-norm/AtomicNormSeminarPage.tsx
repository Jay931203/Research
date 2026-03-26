'use client';

import { useCallback, useState, useEffect } from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import { TableOfContents, type TocItem } from '@/components/tse/navigation';
import AtomicNormGeometryViz from './AtomicNormGeometryViz';

/* ------------------------------------------------------------------ */
/*  Table of Contents                                                  */
/* ------------------------------------------------------------------ */
const tocItems: TocItem[] = [
  { id: 'intro', label: '1. Introduction', level: 1 },
  { id: 'intro-super-resolution', label: 'Super-resolution & Rayleigh Limit', level: 2 },
  { id: 'intro-other-methods', label: 'Other Methods & Limitations', level: 2 },
  { id: 'intro-atomic-norm', label: 'Atomic Norm Concept', level: 2 },

  { id: 'theory', label: '2. Atomic Norm Theory', level: 1 },
  { id: 'theory-atomic-set', label: 'Atomic Set & Norm Definition', level: 2 },
  { id: 'theory-line-spectrum', label: 'Line Spectrum Model', level: 2 },
  { id: 'theory-toeplitz', label: 'Toeplitz Lifting & SDP', level: 2 },
  { id: 'theory-duality', label: 'Duality & Dual Polynomial', level: 2 },
  { id: 'theory-recovery', label: 'Exact Recovery Guarantees', level: 2 },

  { id: 'ofdm-radar', label: '3. OFDM Passive Radar', level: 1 },
  { id: 'ofdm-signal', label: 'Signal Model', level: 2 },
  { id: 'ofdm-2d-anm', label: '2D ANM & Block Toeplitz', level: 2 },
  { id: 'ofdm-estimation', label: 'Delay-Doppler Estimation', level: 2 },

  { id: 'isac', label: '4. ISAC Super-resolution', level: 1 },
  { id: 'isac-signal', label: 'ISAC Signal Model', level: 2 },
  { id: 'isac-lifting', label: 'Lifting Technique', level: 2 },
  { id: 'isac-lanm', label: 'LANM Formulation', level: 2 },

  { id: 'conclusion', label: '5. Conclusion', level: 1 },
];

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */
export default function AtomicNormSeminarPage() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(progress);
      setShowBackToTop(scrollTop > 600);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavigate = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      el.classList.add('ring-2', 'ring-indigo-400', 'ring-offset-4');
      setTimeout(() => el.classList.remove('ring-2', 'ring-indigo-400', 'ring-offset-4'), 2000);
    }
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Scroll progress bar */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-1 bg-slate-200/50 dark:bg-slate-700/50">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-[width] duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Fixed TOC sidebar */}
      {!sidebarOpen && (
        <div className="hidden lg:block fixed left-0 top-1/2 -translate-y-1/2 z-40">
          <button
            onClick={() => setSidebarOpen(true)}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 border-l-0 rounded-r-lg px-1 py-4 shadow-md hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500 transition"
            aria-label="사이드바 보기"
            title="사이드바 보기"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      {sidebarOpen && (
        <aside className="hidden lg:block fixed left-0 top-[4rem] w-64 h-[calc(100vh-4rem)] z-30 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 overflow-y-auto" data-toc-scroll>
          <div className="pt-8 pb-8 px-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Contents
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500 transition"
                aria-label="사이드바 숨기기"
                title="사이드바 숨기기"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </div>
            <TableOfContents items={tocItems} onNavigate={handleNavigate} />
            <div className="mt-6">
              <div className="text-xs text-slate-400 dark:text-slate-500 mb-1">{Math.round(scrollProgress)}% complete</div>
              <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-[width] duration-150"
                  style={{ width: `${scrollProgress}%` }}
                />
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* Main content — offset by sidebar width */}
      <main className={`tse-content min-h-screen py-8 px-4 lg:px-8 ${sidebarOpen ? 'lg:ml-64' : ''}`}>
          {/* Hero */}
          <div className="mb-8 p-8 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl text-white">
            <div className="text-indigo-200 text-sm font-medium mb-2">Paper Seminar &middot; 2026.03.26</div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">
              Atomic Norm Minimization for Super-resolution
            </h1>
            <p className="text-indigo-100 text-lg leading-relaxed max-w-2xl">
              초해상도(super-resolution) 문제를 연속 영역에서 풀기 위한 Atomic Norm 프레임워크를 다룹니다.
              1D 선스펙트럼 추정부터 2D OFDM 패시브 레이더, 4D ISAC 수신기까지 세 논문을 통해 이론과 응용을 정리합니다.
            </p>
            <div className="flex flex-wrap gap-3 mt-5">
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Atomic Norm</span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Super-resolution</span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">SDP</span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Line Spectrum</span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Passive Radar</span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">ISAC</span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">LANM</span>
            </div>
          </div>

          {/* References */}
          <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">References</h2>
            <ol className="space-y-1.5 list-none">
              <li className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                <span className="font-semibold text-slate-700 dark:text-slate-300">[1]</span>{' '}
                Tang et al., &ldquo;Compressed Sensing off the Grid,&rdquo; <span className="italic">IEEE Trans. Info. Theory</span>, 2013.
              </li>
              <li className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                <span className="font-semibold text-slate-700 dark:text-slate-300">[2]</span>{' '}
                Sedighi et al., &ldquo;OFDM Passive Radar via ANM,&rdquo; <span className="italic">IEEE Trans. Signal Processing</span>, 2021.
              </li>
              <li className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                <span className="font-semibold text-slate-700 dark:text-slate-300">[3]</span>{' '}
                Kim et al., &ldquo;Super-resolution ISAC Receiver via LANM,&rdquo; <span className="italic">IEEE Trans. Wireless Comm.</span>, 2024.
              </li>
            </ol>
          </div>

          <div className="space-y-8">
            {/* ============================================= */}
            {/* Section 1: Introduction                       */}
            {/* ============================================= */}
            <section id="intro" className="section-card transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <span className="badge badge-blue">Overview</span>
                <span className="text-sm text-slate-400">Section 1</span>
              </div>

              <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">1. Introduction</h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                Super-resolution은 기존의 분해능 한계(Rayleigh limit)를 넘어
                신호의 파라미터를 추정하는 문제입니다.
                이 세미나에서는 <strong>Atomic Norm Minimization (ANM)</strong>이라는
                볼록 최적화 프레임워크를 통해 이 문제를 연속 영역에서 푸는 방법을 다룹니다.
              </p>

              {/* Super-resolution & Rayleigh Limit */}
              <div id="intro-super-resolution" className="concept-card mb-6">
                <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">Foundation</div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Super-resolution과 Rayleigh Limit</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  Rayleigh limit은 두 개의 신호원(point source)을 구분할 수 있는 최소 간격에 대한
                  경험적 기준입니다. 관측 대역폭(bandwidth)이나 배열 크기(aperture)에 의해 결정되며,
                  이 한계 이하에서는 두 신호원의 패턴이 사실상 구분 불가능합니다.
                </p>
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800 text-sm">
                  <strong className="text-indigo-800 dark:text-indigo-300">Rayleigh Limit</strong>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">
                    <InlineMath math="n" />개의 관측 샘플로 주파수를 추정할 때,
                    Rayleigh limit은 약 <InlineMath math="\Delta f \approx 1/n" />입니다.
                    즉 두 주파수의 간격이 <InlineMath math="1/n" /> 이하이면
                    DFT(이산 푸리에 변환)만으로는 구분이 불가능합니다.
                  </p>
                </div>
              </div>

              {/* Other Methods & Limitations */}
              <div id="intro-other-methods" className="concept-card mb-6">
                <div className="text-xs font-semibold text-violet-600 dark:text-violet-400 mb-1">Comparison</div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-3">기존 방법과 한계</h3>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <strong className="text-blue-800 dark:text-blue-300">MUSIC</strong>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                      Subspace 기반 방법으로 고해상도를 달성하지만,
                      많은 수의 snapshot이 필요하고 낮은 SNR에서 성능이 급격히 하락합니다.
                      Signal subspace 추정이 부정확하면 가짜 피크가 나타납니다.
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <strong className="text-purple-800 dark:text-purple-300">ESPRIT</strong>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                      MUSIC과 유사한 subspace 방법으로 회전 불변(shift-invariance) 구조를 이용합니다.
                      역시 다수의 snapshot이 필요하며, 모델 차수(signal 수)를 사전에 알아야 합니다.
                    </p>
                  </div>
                  <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-lg border border-rose-200 dark:border-rose-800">
                    <strong className="text-rose-800 dark:text-rose-300">Compressed Sensing (Grid-based)</strong>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                      파라미터 공간을 이산 그리드로 나누고{' '}
                      <InlineMath math="\min \|x\|_1 \;\text{s.t.}\; y = Ax" />를 풉니다.
                      그러나 실제 파라미터가 그리드 점과 일치하지 않으면{' '}
                      <strong>basis mismatch</strong>가 발생하여 추정 오차가 커집니다.
                    </p>
                  </div>
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <strong className="text-emerald-800 dark:text-emerald-300">Atomic Norm Minimization</strong>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                      그리드를 사용하지 않고 <strong>연속 영역</strong>에서 직접 최적화합니다.
                      Basis mismatch 문제가 원천적으로 없으며,
                      볼록 최적화(SDP)로 정확하게 풀 수 있습니다.
                    </p>
                  </div>
                </div>
              </div>

              {/* Atomic Norm Concept */}
              <div id="intro-atomic-norm" className="concept-card mb-6">
                <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">Key Idea</div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">
                  From <InlineMath math="\ell_1" /> to Atomic Norm
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  Compressed sensing에서 <InlineMath math="\ell_1" /> norm은 유한 차원 표준 기저(standard basis) 위의
                  희소성을 촉진합니다. 그런데 주파수 추정처럼 파라미터가 연속인 경우,
                  이산 그리드를 잡으면 그리드 간격보다 세밀한 위치를 놓치게 됩니다.
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  <strong>Atomic norm</strong>은 이 아이디어를 연속 영역으로 확장합니다.
                  유한 개의 기저 벡터 대신, 연속 파라미터로 인덱싱된 <strong>무한 개의 atom</strong>을 사용합니다.
                  Atom 집합의 볼록 껍질(convex hull)을 unit ball로 정의하면,
                  이에 대응하는 norm이 곧 atomic norm입니다.
                </p>
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800 text-sm">
                  <p className="text-slate-700 dark:text-slate-300">
                    <strong>핵심:</strong> CS가 이산 그리드 위에서{' '}
                    <InlineMath math="\ell_1" />을 쓰는 것과 달리,
                    ANM은 연속 도메인의 atom 집합 위에서 atomic norm을 최소화합니다.
                    따라서 <strong>basis mismatch가 없고</strong>, 이론적으로 정확한 복원이 가능합니다.
                  </p>
                </div>
              </div>

              <div className="insight">
                <div className="insight-title">Key Insight</div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Atomic norm minimization은{' '}
                  <InlineMath math="\ell_1" /> minimization의 자연스러운 연속 확장입니다.
                  이산 그리드에 의존하지 않으므로 basis mismatch 문제를 근본적으로 해결하며,
                  SDP(Semi-Definite Programming)를 통해 효율적으로 풀 수 있습니다.
                </p>
              </div>
            </section>

            {/* ============================================= */}
            {/* Section 2: Atomic Norm Theory                 */}
            {/* ============================================= */}
            <section id="theory" className="section-card transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <span className="badge badge-blue">Theory</span>
                <span className="text-sm text-slate-400">Section 2</span>
              </div>

              <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">2. Atomic Norm Theory</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 italic">
                Tang et al., &ldquo;Compressed Sensing off the Grid,&rdquo; IEEE Trans. Info. Theory, 2013.
              </p>
              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                Atomic norm의 수학적 정의부터 SDP 변환, 쌍대(dual) 문제, 그리고 정확 복원(exact recovery)
                조건까지 이론적 토대를 정리합니다.
              </p>

              {/* Atomic Set & Norm Definition */}
              <div id="theory-atomic-set" className="concept-card mb-6">
                <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">Definition</div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Atomic Set과 Norm 정의</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  Atom 집합 <InlineMath math="\mathcal{A} = \{a_i\}" />는 (무한) 기수를 가질 수 있는 기본 요소들의 집합입니다.
                  Atomic norm은 이 집합의 볼록 껍질을 unit ball로 사용하는 <strong>Minkowski functional</strong>로 정의됩니다.
                </p>
                <div className="formula-block">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-3">Atomic Norm (Minkowski Functional)</h4>
                  <BlockMath math={String.raw`\|x\|_{\mathcal{A}} = \inf\{t \geq 0 : x \in t \cdot \text{conv}(\mathcal{A})\}`} />
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">
                    직관적으로, <InlineMath math="t \cdot \text{conv}(\mathcal{A})" />라는 &ldquo;풍선&rdquo;을
                    점점 키워서 <InlineMath math="x" />에 처음 닿는 순간의{' '}
                    <InlineMath math="t" /> 값이 곧 atomic norm입니다.
                  </p>
                </div>
                <div className="formula-block mt-4">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-3">Atomic Decomposition</h4>
                  <BlockMath math={String.raw`\|x\|_{\mathcal{A}} = \inf\left\{\sum_i c_i \;:\; x = \sum_i c_i \, a_i,\; c_i > 0,\; a_i \in \mathcal{A}\right\}`} />
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">
                    신호 <InlineMath math="x" />를 atom들의 양의 결합으로 표현할 때,
                    계수의 합을 최소화하는 것이 atomic norm입니다.
                  </p>
                </div>
                <div className="p-3 bg-violet-50 dark:bg-violet-900/20 rounded-lg border border-violet-200 dark:border-violet-800 text-sm mt-4">
                  <strong className="text-violet-800 dark:text-violet-300">
                    Atomic norm은 <InlineMath math="\ell_1" /> norm을 포함합니다
                  </strong>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">
                    <InlineMath math="\mathcal{A}" />가 표준 기저{' '}
                    <InlineMath math="\{e_1, e_2, \ldots, e_n\}" />이면{' '}
                    <InlineMath math="\|x\|_{\mathcal{A}} = \|x\|_1" />이 됩니다.
                    Atomic norm은 <InlineMath math="\ell_1" /> norm의 일반화입니다.
                  </p>
                </div>
              </div>

              {/* Interactive: Atomic Norm Geometry */}
              <AtomicNormGeometryViz />

              {/* Line Spectrum Model */}
              <div id="theory-line-spectrum" className="concept-card mb-6">
                <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">Model</div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Line Spectrum Model</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  Line spectrum estimation에서 신호는 소수의 순수 주파수 성분(sinusoid)의 합으로 모델링됩니다.
                  연속 시간 영역에서 이를 표현하면:
                </p>
                <div className="formula-block">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-3">Signal Model</h4>
                  <BlockMath math={String.raw`x(t) = \sum_{k=1}^{K} c_k \, \delta(t - \tau_k)`} />
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 mb-3">
                    관측은 부분적이고 잡음이 포함됩니다:
                  </p>
                  <BlockMath math={String.raw`y = \text{diag}(g)\, x + \varepsilon`} />
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">
                    여기서 <InlineMath math="g" />는 관측 패턴(sampling mask),{' '}
                    <InlineMath math="\varepsilon" />는 잡음입니다.
                  </p>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">
                  이 모델에서 atom은 <strong>steering vector</strong>로 정의됩니다:
                </p>
                <div className="formula-block mt-3">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-3">Steering Vector Atom</h4>
                  <BlockMath math={String.raw`a(\tau) = \begin{bmatrix} 1 \\ e^{j2\pi\tau} \\ \vdots \\ e^{j2\pi(n-1)\tau} \end{bmatrix}`} />
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">
                    주파수 <InlineMath math="\tau \in [0, 1)" />로 파라미터화된 무한 개의 atom이
                    atomic set <InlineMath math="\mathcal{A}" />를 구성합니다.
                  </p>
                </div>
              </div>

              {/* Toeplitz Lifting & SDP */}
              <div id="theory-toeplitz" className="concept-card mb-6">
                <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">SDP Reformulation</div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Toeplitz Lifting과 SDP</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  Atomic norm을 직접 계산하는 것은 무한 차원 최적화입니다.
                  핵심 아이디어는 <strong>Toeplitz 행렬 lifting</strong>을 통해
                  유한 차원 SDP(Semi-Definite Program)로 변환하는 것입니다.
                </p>
                <div className="formula-block">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-3">Toeplitz Lifting</h4>
                  <BlockMath math={String.raw`\text{toep}(u) = \sum_{k} |c_k| \, a(\tau_k) \, a(\tau_k)^H`} />
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">
                    이 Toeplitz 행렬은 양의 준정부호(positive semidefinite)이며,
                    atom들의 외적(outer product) 합으로 분해됩니다.
                  </p>
                </div>
                <div className="formula-block mt-4">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-3">SDP Formulation</h4>
                  <BlockMath math={String.raw`\|x\|_{\mathcal{A}} = \inf_{u, t}\left\{\frac{1}{2n}\operatorname{Tr}(\text{toep}(u)) + \frac{t}{2} \;:\; \begin{bmatrix} \text{toep}(u) & x \\ x^H & t \end{bmatrix} \succeq 0 \right\}`} />
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">
                    이 SDP는 표준 SDP solver (예: CVX, SDPT3)로 다항 시간 내에 풀 수 있습니다.
                    무한 차원 문제가 <InlineMath math="O(n)" /> 크기의 행렬 변수를 가진 SDP로 축소됩니다.
                  </p>
                </div>
              </div>

              {/* Duality & Dual Polynomial */}
              <div id="theory-duality" className="concept-card mb-6">
                <div className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1">Dual Problem</div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Duality와 Dual Polynomial</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  Atomic norm minimization의 쌍대 문제(dual problem)는 정확 복원 조건을 이해하는 핵심 도구입니다.
                </p>
                <div className="formula-block">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-3">Primal-Dual Pair</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    <strong>Primal:</strong>
                  </p>
                  <BlockMath math={String.raw`\min_{z} \; \|z\|_{\mathcal{A}} \quad \text{s.t.} \; z = x`} />
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 mb-2">
                    <strong>Dual:</strong>
                  </p>
                  <BlockMath math={String.raw`\max_{p} \; \operatorname{Re}\langle x, p \rangle \quad \text{s.t.} \; \|p\|_{\mathcal{A}^*} \leq 1`} />
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-4 mb-3">
                  Dual 변수 <InlineMath math="p" />로부터 <strong>dual polynomial</strong>을 정의합니다:
                </p>
                <div className="formula-block">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-3">Dual Polynomial</h4>
                  <BlockMath math={String.raw`P(\tau) = \langle a(\tau), p \rangle = \sum_{l=0}^{n-1} p_l \, e^{-j2\pi l \tau}`} />
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">
                    이 다항식은 삼각 다항식(trigonometric polynomial)으로,
                    그 값이 atom 위치에서의 최적성 조건과 직결됩니다.
                  </p>
                </div>
              </div>

              {/* Exact Recovery Guarantees */}
              <div id="theory-recovery" className="concept-card mb-6">
                <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">Guarantees</div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">정확 복원 조건</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  ANM이 원래 신호를 정확히 복원하려면, dual certificate라 불리는 조건을 만족하는
                  dual polynomial <InlineMath math="P^*(\tau)" />가 존재해야 합니다.
                </p>
                <div className="formula-block">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-3">Dual Certificate 조건</h4>
                  <BlockMath math={String.raw`P^*(\tau_k) = \operatorname{sgn}(c_k), \quad |P^*(\tau)| < 1 \;\;\text{for}\;\; \tau \neq \tau_k`} />
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">
                    즉, dual polynomial이 참 주파수 위치에서만 크기 1에 도달하고
                    다른 곳에서는 엄격하게 1보다 작아야 합니다.
                  </p>
                </div>
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 text-sm mt-4">
                  <strong className="text-amber-800 dark:text-amber-300">Minimal Separation Condition</strong>
                  <p className="text-slate-600 dark:text-slate-400 mt-2">
                    이 dual certificate가 존재하기 위한 충분 조건은 주파수들 사이의 최소 간격입니다:
                  </p>
                  <div className="mt-2">
                    <BlockMath math={String.raw`\Delta T > \frac{2.52}{n - 1}`} />
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 mt-2">
                    <InlineMath math="n" />은 관측 샘플 수입니다.
                    이 조건이 만족되면 ANM은 주파수, 위상, 진폭을 모두 정확히 복원합니다.
                    특히 <InlineMath math="2.52/(n-1)" />는 Rayleigh limit{' '}
                    <InlineMath math="1/n" />의 약 2.5배로,
                    Rayleigh limit에 가까운 수준까지 복원이 보장됩니다.
                  </p>
                </div>
              </div>

              <div className="insight">
                <div className="insight-title">Key Insight</div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Atomic norm theory의 핵심은 <strong>Toeplitz lifting</strong>을 통해
                  무한 차원의 연속 최적화 문제를 유한 차원의 SDP로 변환하는 것입니다.
                  Dual polynomial이 exact recovery의 충분 조건(certificate)을 제공하며,
                  minimal separation 조건 <InlineMath math="\Delta T > 2.52/(n-1)" />이 이를 보장합니다.
                </p>
              </div>
            </section>

            {/* ============================================= */}
            {/* Section 3: OFDM Passive Radar                 */}
            {/* ============================================= */}
            <section id="ofdm-radar" className="section-card transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <span className="badge badge-green">Paper 2</span>
                <span className="text-sm text-slate-400">Section 3</span>
              </div>

              <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">3. OFDM Passive Radar</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 italic">
                Sedighi et al., &ldquo;OFDM Passive Radar via ANM,&rdquo; IEEE Trans. Signal Processing, 2021.
              </p>
              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                1D line spectrum 추정의 atomic norm을 <strong>2D delay-Doppler 추정</strong>으로 확장합니다.
                OFDM 기반 passive radar에서 target의 지연(delay)과 도플러(Doppler)를
                동시에 초해상도로 추정하는 프레임워크입니다.
              </p>

              {/* Signal Model */}
              <div id="ofdm-signal" className="concept-card mb-6">
                <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">Signal Model</div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">OFDM 수신 신호 모델</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  송신된 OFDM 신호가 <InlineMath math="K" />개의 target에 반사되어 수신됩니다.
                  각 target은 지연 <InlineMath math="\tau_k" />와 도플러 <InlineMath math="f_k" />를 갖습니다.
                </p>
                <div className="formula-block">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-3">정규화된 파라미터</h4>
                  <BlockMath math={String.raw`\psi_k = \Delta f \cdot \tau_k, \qquad \varphi_k = f_k \cdot \bar{T}`} />
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">
                    <InlineMath math="\Delta f" />는 subcarrier 간격,{' '}
                    <InlineMath math="\bar{T}" />는 OFDM 심볼 구간입니다.
                    정규화된 delay <InlineMath math="\psi_k \in [0, 1)" />와
                    Doppler <InlineMath math="\varphi_k \in [0, 1)" />를 추정하는 것이 목표입니다.
                  </p>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">
                  OFDM demodulation 후, reference signal을 제거하면 다음과 같은 모델을 얻습니다:
                </p>
                <div className="formula-block mt-3">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-3">Demodulated Signal</h4>
                  <BlockMath math={String.raw`Y = \sum_{k=1}^{K} \alpha_k \, b(\varphi_k) \, g(\psi_k)^T + E`} />
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">
                    <InlineMath math="\alpha_k" />는 복소 진폭,{' '}
                    <InlineMath math="b(\varphi)" />는 Doppler steering vector,{' '}
                    <InlineMath math="g(\psi)" />는 delay steering vector,{' '}
                    <InlineMath math="E" />는 잡음 행렬입니다.
                  </p>
                </div>
              </div>

              {/* 2D ANM & Block Toeplitz */}
              <div id="ofdm-2d-anm" className="concept-card mb-6">
                <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">Extension to 2D</div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">2D ANM과 Block Toeplitz</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  1D에서의 steering vector atom을 2D로 확장합니다.
                  2D atom은 delay와 Doppler steering vector의 <strong>Kronecker product</strong>입니다:
                </p>
                <div className="formula-block">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-3">2D Atom</h4>
                  <BlockMath math={String.raw`a(\varphi, \psi) = g(\psi)^* \otimes b(\varphi)`} />
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">
                    여기서 <InlineMath math="\otimes" />는 Kronecker product이며,
                    1D Toeplitz 행렬이 <strong>Block Toeplitz</strong> 행렬로 확장됩니다.
                  </p>
                </div>
                <div className="formula-block mt-4">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-3">2D SDP Formulation</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    2D atomic norm도 동일하게 SDP로 변환됩니다.
                    Block Toeplitz 구조를 활용하여:
                  </p>
                  <BlockMath math={String.raw`\min \; \frac{1}{2MN}\operatorname{Tr}(T) + \frac{1}{2}t \quad \text{s.t.} \quad \begin{bmatrix} T & \text{vec}(Y) \\ \text{vec}(Y)^H & t \end{bmatrix} \succeq 0`} />
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">
                    <InlineMath math="T" />는 Block Toeplitz 구조를 가진 양의 준정부호 행렬이며,
                    <InlineMath math="M" />은 subcarrier 수, <InlineMath math="N" />은 OFDM 심볼 수입니다.
                  </p>
                </div>
              </div>

              {/* Delay-Doppler Estimation */}
              <div id="ofdm-estimation" className="concept-card mb-6">
                <div className="text-xs font-semibold text-violet-600 dark:text-violet-400 mb-1">Estimation</div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Delay-Doppler 추정</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  SDP를 풀어 최적의 Block Toeplitz 행렬을 구한 후,
                  2D dual polynomial <InlineMath math="Q(\varphi, \psi)" />의 피크 위치에서 target 파라미터를 추정합니다.
                </p>
                <div className="formula-block">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-3">Recovery Condition</h4>
                  <BlockMath math={String.raw`Q(\hat{\varphi}_k, \hat{\psi}_k) = \lambda \cdot \operatorname{sgn}(\hat{\alpha}_k)`} />
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">
                    1D의 dual certificate와 동일한 구조입니다.
                    2D dual polynomial이 target 위치에서만 크기 <InlineMath math="\lambda" />에 도달하고,
                    다른 곳에서는 엄격하게 작습니다.
                  </p>
                </div>
              </div>

              <div className="insight">
                <div className="insight-title">Key Insight</div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  OFDM passive radar에서 2D ANM은 delay-Doppler 평면의 연속 영역에서
                  target 파라미터를 추정합니다. Kronecker 구조와 Block Toeplitz lifting을 통해
                  1D ANM의 이론적 프레임워크가 자연스럽게 2D로 확장됩니다.
                </p>
              </div>
            </section>

            {/* ============================================= */}
            {/* Section 4: ISAC Super-resolution              */}
            {/* ============================================= */}
            <section id="isac" className="section-card transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <span className="badge badge-amber">Paper 3</span>
                <span className="text-sm text-slate-400">Section 4</span>
              </div>

              <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">4. ISAC Super-resolution</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 italic">
                Kim et al., &ldquo;Super-resolution ISAC Receiver via LANM,&rdquo; IEEE Trans. Wireless Comm., 2024.
              </p>
              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                ISAC(Integrated Sensing and Communication) 시스템에서 <strong>4개의 연속 파라미터</strong>
                &mdash; delay, Doppler, AoD(Angle of Departure), AoA(Angle of Arrival) &mdash;를
                동시에 추정하는 문제에 ANM을 확장합니다.
              </p>

              {/* ISAC Signal Model */}
              <div id="isac-signal" className="concept-card mb-6">
                <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">Signal Model</div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">ISAC 신호 모델</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  ISAC 시스템에서 수신기는 통신 신호를 복조하는 동시에,
                  반사된 echo 신호로부터 target의 물리적 파라미터를 추정합니다.
                </p>
                <div className="grid sm:grid-cols-2 gap-3 text-sm mt-3">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <strong className="text-blue-800 dark:text-blue-300">4D Parameter Space</strong>
                    <ul className="text-slate-600 dark:text-slate-400 mt-1 space-y-1 list-disc list-inside">
                      <li>Delay <InlineMath math="\tau" /></li>
                      <li>Doppler <InlineMath math="v" /></li>
                      <li>AoD <InlineMath math="\theta" /> (송신 각도)</li>
                      <li>AoA <InlineMath math="\phi" /> (수신 각도)</li>
                    </ul>
                  </div>
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <strong className="text-amber-800 dark:text-amber-300">난점</strong>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                      4개 파라미터가 steering vector에 <strong>비선형적으로</strong> 결합되어 있어,
                      직접적인 atomic norm 적용이 불가능합니다.
                      이를 해결하기 위해 <strong>lifting</strong> 기법을 사용합니다.
                    </p>
                  </div>
                </div>
              </div>

              {/* Lifting Technique */}
              <div id="isac-lifting" className="concept-card mb-6">
                <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">Key Technique</div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Lifting Technique</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  Lifting은 비선형 문제를 더 높은 차원의 선형 문제로 변환하는 기법입니다.
                  원래의 파라미터 벡터를 행렬로 &ldquo;올려서(lift)&rdquo;
                  비선형 구조를 선형화합니다.
                </p>
                <div className="formula-block">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-3">Lifted Variable</h4>
                  <BlockMath math={String.raw`U = \sum_{k} |\alpha_k| \, h_k \, a(\tau_k)^H`} />
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">
                    여기서 <InlineMath math="h_k" />는 Doppler, AoD, AoA에 의존하는 벡터이고,
                    <InlineMath math="a(\tau_k)" />는 delay steering vector입니다.
                    벡터 <InlineMath math="h_k" />와 <InlineMath math="a(\tau_k)" />의 외적으로
                    행렬 <InlineMath math="U" />를 구성하면, 원래의 비선형 모델이 <InlineMath math="U" />에 대한
                    선형 모델이 됩니다.
                  </p>
                </div>
                <div className="formula-block mt-4">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-3">Linear Observation Operator</h4>
                  <BlockMath math={String.raw`[\mathcal{X}(U)]_j = \operatorname{Tr}(\tilde{D}_j \, U)`} />
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">
                    관측값 <InlineMath math="y" />와 lifted variable{' '}
                    <InlineMath math="U" /> 사이의 관계가 선형 연산자{' '}
                    <InlineMath math="\mathcal{X}" />로 표현됩니다.
                    <InlineMath math="\tilde{D}_j" />는 시스템 구조에 의해 결정되는 measurement 행렬입니다.
                  </p>
                </div>
              </div>

              {/* LANM Formulation */}
              <div id="isac-lanm" className="concept-card mb-6">
                <div className="text-xs font-semibold text-violet-600 dark:text-violet-400 mb-1">LANM</div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">LANM Formulation</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  Lifting 후, 행렬 <InlineMath math="U" />에 대해 atomic norm minimization을 적용합니다.
                  이를 <strong>LANM (Lifted Atomic Norm Minimization)</strong>이라 부릅니다.
                </p>
                <div className="formula-block">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-3">LANM Problem</h4>
                  <BlockMath math={String.raw`\min_{U} \; \|U\|_{\mathcal{A}} \quad \text{s.t.} \; y = \mathcal{X}(U)`} />
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">
                    이 문제는 lifted 도메인에서의 atomic norm을 최소화하며,
                    1D ANM과 동일한 SDP 구조로 변환됩니다.
                  </p>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-4 mb-3">
                  LANM의 dual 문제로부터 유일성(uniqueness) 조건을 도출할 수 있으며,
                  충분한 관측과 minimal separation 조건 하에서 4개 파라미터 모두의 정확한 복원이 보장됩니다.
                </p>
                <div className="p-4 bg-violet-50 dark:bg-violet-900/20 rounded-lg border border-violet-200 dark:border-violet-800 text-sm">
                  <strong className="text-violet-800 dark:text-violet-300">Lifting의 본질</strong>
                  <p className="text-slate-600 dark:text-slate-400 mt-2">
                    Lifting은 &ldquo;변수를 올려서 비선형을 선형으로&rdquo; 만드는 기법입니다.
                    벡터 변수 <InlineMath math="x" />를 행렬 변수{' '}
                    <InlineMath math="U = x \cdot a^H" />로 확장하면,
                    원래 비선형이었던 관측 모델이{' '}
                    <InlineMath math="U" />에 대해 선형이 됩니다.
                    차원이 증가하는 대가를 치르지만, 볼록 최적화가 가능해진다는 이점을 얻습니다.
                  </p>
                </div>
              </div>

              <div className="insight">
                <div className="insight-title">Key Insight</div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  ISAC 시스템의 4D 파라미터 추정 문제는 직접 ANM을 적용할 수 없을 만큼 복잡합니다.
                  LANM은 lifting을 통해 비선형 구조를 선형화한 후 atomic norm을 적용하여,
                  delay, Doppler, AoD, AoA를 동시에 초해상도로 추정합니다.
                </p>
              </div>
            </section>

            {/* ============================================= */}
            {/* Section 5: Conclusion                         */}
            {/* ============================================= */}
            <section id="conclusion" className="section-card transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <span className="badge badge-red">Summary</span>
                <span className="text-sm text-slate-400">Section 5</span>
              </div>

              <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">5. Conclusion</h2>

              {/* Summary table */}
              <div className="overflow-x-auto mb-6">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-300 dark:border-slate-600">
                      <th className="text-left py-3 px-3 text-slate-700 dark:text-slate-300 font-bold">논문</th>
                      <th className="text-left py-3 px-3 text-slate-700 dark:text-slate-300 font-bold">차원</th>
                      <th className="text-left py-3 px-3 text-slate-700 dark:text-slate-300 font-bold">핵심 기여</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-600 dark:text-slate-400">
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <td className="py-3 px-3 font-medium text-indigo-700 dark:text-indigo-400">Tang et al. (2013)</td>
                      <td className="py-3 px-3">1D (frequency)</td>
                      <td className="py-3 px-3">Atomic norm 이론 정립, Toeplitz SDP, dual certificate</td>
                    </tr>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <td className="py-3 px-3 font-medium text-emerald-700 dark:text-emerald-400">Sedighi et al. (2021)</td>
                      <td className="py-3 px-3">2D (delay-Doppler)</td>
                      <td className="py-3 px-3">2D ANM, Block Toeplitz, OFDM passive radar 적용</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3 font-medium text-amber-700 dark:text-amber-400">Kim et al. (2024)</td>
                      <td className="py-3 px-3">4D (delay-Doppler-AoD-AoA)</td>
                      <td className="py-3 px-3">Lifting + LANM, ISAC 수신기, 비선형 문제의 선형화</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* CS vs ANM vs MUSIC comparison */}
              <div className="concept-card mb-6">
                <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">Comparison</div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-3">CS vs ANM vs MUSIC</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b-2 border-slate-300 dark:border-slate-600">
                        <th className="text-left py-2 px-3 text-slate-700 dark:text-slate-300 font-bold">특성</th>
                        <th className="text-left py-2 px-3 text-slate-700 dark:text-slate-300 font-bold">MUSIC</th>
                        <th className="text-left py-2 px-3 text-slate-700 dark:text-slate-300 font-bold">CS (Grid)</th>
                        <th className="text-left py-2 px-3 text-slate-700 dark:text-slate-300 font-bold">ANM</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-600 dark:text-slate-400">
                      <tr className="border-b border-slate-200 dark:border-slate-700">
                        <td className="py-2 px-3 font-medium">도메인</td>
                        <td className="py-2 px-3">연속</td>
                        <td className="py-2 px-3">이산 (grid)</td>
                        <td className="py-2 px-3">연속</td>
                      </tr>
                      <tr className="border-b border-slate-200 dark:border-slate-700">
                        <td className="py-2 px-3 font-medium">Basis mismatch</td>
                        <td className="py-2 px-3">없음</td>
                        <td className="py-2 px-3 text-rose-600 dark:text-rose-400">있음</td>
                        <td className="py-2 px-3 text-emerald-600 dark:text-emerald-400">없음</td>
                      </tr>
                      <tr className="border-b border-slate-200 dark:border-slate-700">
                        <td className="py-2 px-3 font-medium">Snapshot 수</td>
                        <td className="py-2 px-3 text-rose-600 dark:text-rose-400">다수 필요</td>
                        <td className="py-2 px-3 text-emerald-600 dark:text-emerald-400">1개 가능</td>
                        <td className="py-2 px-3 text-emerald-600 dark:text-emerald-400">1개 가능</td>
                      </tr>
                      <tr className="border-b border-slate-200 dark:border-slate-700">
                        <td className="py-2 px-3 font-medium">계산 복잡도</td>
                        <td className="py-2 px-3">낮음</td>
                        <td className="py-2 px-3">중간 (LP)</td>
                        <td className="py-2 px-3 text-amber-600 dark:text-amber-400">높음 (SDP)</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-medium">이론적 보장</td>
                        <td className="py-2 px-3">점근적</td>
                        <td className="py-2 px-3">RIP 조건</td>
                        <td className="py-2 px-3 text-emerald-600 dark:text-emerald-400">Exact recovery</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Future Directions */}
              <div className="concept-card mb-6">
                <div className="text-xs font-semibold text-violet-600 dark:text-violet-400 mb-1">Future Directions</div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-3">향후 연구 방향</h3>
                <div className="grid sm:grid-cols-3 gap-4 text-sm">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                    <strong className="text-indigo-800 dark:text-indigo-300">Channel Estimation</strong>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                      ANM을 5G/6G MIMO 채널 추정에 적용하여
                      path delay, AoA/AoD를 초해상도로 추정하는 연구
                    </p>
                  </div>
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <strong className="text-purple-800 dark:text-purple-300">Resolution Limit Analysis</strong>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                      Minimal separation 조건을 더 정밀하게 분석하여
                      ANM의 이론적 한계를 규명하는 연구
                    </p>
                  </div>
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <strong className="text-emerald-800 dark:text-emerald-300">Computational Efficiency</strong>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                      SDP의 높은 계산 복잡도를 줄이기 위한
                      ADMM 기반 알고리즘, low-rank 근사 등의 연구
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800">
                <h3 className="font-bold text-indigo-800 dark:text-indigo-300 mb-3">Takeaway</h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  Atomic norm minimization은 super-resolution 문제를 연속 영역에서 풀 수 있는
                  강력한 볼록 최적화 프레임워크입니다.
                  1D 선스펙트럼 추정에서 출발하여, 2D delay-Doppler (passive radar),
                  4D ISAC (delay-Doppler-AoD-AoA)까지 확장되며,
                  lifting과 Block Toeplitz 구조가 핵심 도구입니다.
                  SDP의 계산 비용이 남아 있는 과제이지만,
                  basis mismatch 없는 이론적 정확성은 ANM의 가장 큰 강점입니다.
                </p>
              </div>
            </section>
          </div>

          {/* Back to top */}
          {showBackToTop && (
            <button
              onClick={scrollToTop}
              className="fixed bottom-8 right-8 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition"
              aria-label="맨 위로"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
              </svg>
            </button>
          )}
        </main>
    </div>
  );
}
