'use client';

import { useCallback, useState, useEffect, useMemo } from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import { TableOfContents, type TocItem } from '@/components/tse/navigation';
import LayerImportanceVisualizer from './LayerImportanceVisualizer';
import CacheCompressionDemo from './CacheCompressionDemo';
import CommunicationCostComparison from './CommunicationCostComparison';

/* ------------------------------------------------------------------ */
/*  Table of Contents                                                  */
/* ------------------------------------------------------------------ */
const tocItems: TocItem[] = [
  { id: 'intro', label: '1. Introduction', level: 1 },
  { id: 'intro-multi-agent', label: 'Multi-Agent Systems', level: 2 },
  { id: 'intro-text-vs-hidden', label: 'Text vs Hidden Representation', level: 2 },

  { id: 'kv-basics', label: '2. KV Cache 기초', level: 1 },
  { id: 'kv-prefill-decode', label: 'Prefill / Decode', level: 2 },
  { id: 'kv-formula', label: 'KV Cache 수식', level: 2 },

  { id: 'latent-mas', label: '3. Latent MAS', level: 1 },
  { id: 'latent-mas-arch', label: 'Architecture', level: 2 },
  { id: 'latent-mas-projection', label: 'Projection Matrix', level: 2 },
  { id: 'latent-mas-exp', label: 'Experiments', level: 2 },

  { id: 'kvcomm', label: '4. KVComm', level: 1 },
  { id: 'kvcomm-hypothesis', label: 'Hypotheses', level: 2 },
  { id: 'kvcomm-selection', label: 'Layer Selection', level: 2 },
  { id: 'kvcomm-exp', label: 'Experiments', level: 2 },

  { id: 'c2c', label: '5. Cache-2-Cache', level: 1 },
  { id: 'c2c-fuser', label: 'MLP Fuser', level: 2 },
  { id: 'c2c-mapping', label: 'Layer Mapping', level: 2 },
  { id: 'c2c-exp', label: 'Experiments', level: 2 },

  { id: 'snapkv', label: '6. SnapKV', level: 1 },
  { id: 'snapkv-observation', label: 'Observation Window', level: 2 },
  { id: 'snapkv-voting', label: 'Voting Mechanism', level: 2 },
  { id: 'snapkv-exp', label: 'Experiments', level: 2 },

  { id: 'conclusion', label: '7. Conclusion', level: 1 },
  { id: 'open-problems', label: 'Open Problems', level: 2 },
];

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */
export default function KVCacheSeminarPage() {
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
      el.classList.add('ring-2', 'ring-blue-400', 'ring-offset-4');
      setTimeout(() => el.classList.remove('ring-2', 'ring-blue-400', 'ring-offset-4'), 2000);
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
          className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-[width] duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <div className="max-w-7xl mx-auto flex">
        {/* Sidebar open tab */}
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

        {/* TOC sidebar */}
        <aside className={sidebarOpen ? 'hidden lg:block w-64 shrink-0' : 'hidden'}>
          <div data-toc-scroll className="sticky top-16 pt-8 pb-8 pr-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="flex items-center justify-between px-3 mb-3">
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
            <div className="mt-6 px-3">
              <div className="text-xs text-slate-400 dark:text-slate-500 mb-1">{Math.round(scrollProgress)}% complete</div>
              <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-500 rounded-full transition-[width] duration-150"
                  style={{ width: `${scrollProgress}%` }}
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="tse-content flex-1 min-w-0 py-8 px-4 lg:px-8">
          {/* Hero */}
          <div className="mb-8 p-8 bg-gradient-to-br from-teal-600 to-cyan-700 rounded-2xl text-white">
            <div className="text-teal-200 text-sm font-medium mb-2">Paper Seminar</div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">
              KV-Cache Communication for Multi-Agent Systems
            </h1>
            <p className="text-teal-100 text-lg leading-relaxed max-w-2xl">
              LLM 기반 Multi-Agent 시스템에서 text 대신 KV cache를 공유하여 소통하는
              최신 연구들을 살펴봅니다. 효율적인 layer 선택, cross-model 변환,
              cache 압축까지 핵심 아이디어를 정리합니다.
            </p>
            <div className="flex flex-wrap gap-3 mt-5">
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Latent MAS</span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">KVComm</span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Cache-2-Cache</span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">SnapKV</span>
            </div>
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

              <h2 className="text-3xl font-bold text-slate-900 mb-4">1. Introduction</h2>
              <p className="text-lg text-slate-600 leading-relaxed mb-6">
                최근 LLM(Large Language Model)의 발전으로 단일 모델을 넘어
                여러 LLM 에이전트가 협력하는 <strong>Multi-Agent System</strong>이 주목받고 있습니다.
                이 세미나에서는 에이전트 간 소통 방식의 혁신 &mdash; text 기반에서 <strong>KV cache 기반</strong>으로의 전환을 다룹니다.
              </p>

              <div id="intro-multi-agent" className="concept-card mb-6">
                <div className="text-xs font-semibold text-teal-600 mb-1">Multi-Agent Systems</div>
                <h3 className="font-bold text-slate-800 mb-2">멀티에이전트 시스템이란?</h3>
                <p className="text-sm text-slate-600 mb-3">
                  복잡한 task를 여러 LLM 에이전트가 분업하여 해결하는 시스템입니다.
                  각 에이전트는 전문 역할(코딩, 검색, 검증 등)을 담당하며,
                  중간 결과를 다른 에이전트에게 전달합니다.
                </p>
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <strong className="text-blue-800">Sequential</strong>
                    <p className="text-slate-600 mt-1">Agent A의 출력이 Agent B의 입력으로 순차 전달</p>
                  </div>
                  <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                    <strong className="text-indigo-800">Hierarchical</strong>
                    <p className="text-slate-600 mt-1">Manager agent가 하위 agent들의 결과를 취합</p>
                  </div>
                </div>
              </div>

              <div id="intro-text-vs-hidden" className="concept-card mb-6">
                <div className="text-xs font-semibold text-cyan-600 mb-1">Communication Paradigm</div>
                <h3 className="font-bold text-slate-800 mb-2">Text vs Hidden Representation 소통</h3>
                <p className="text-sm text-slate-600 mb-3">
                  기존 멀티에이전트 시스템은 <strong>text(자연어)</strong>로 소통합니다.
                  하지만 이 과정에서 정보 손실이 불가피합니다 &mdash;
                  모델 내부의 풍부한 hidden representation이 text로 디코딩되면서 의미가 축소됩니다.
                </p>
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <div className="p-3 bg-rose-50 rounded-lg border border-rose-100">
                    <strong className="text-rose-800">Text-based (TextMAS)</strong>
                    <ul className="text-slate-600 mt-1 space-y-1 list-disc list-inside">
                      <li>Decoding + re-encoding 오버헤드</li>
                      <li>Information bottleneck 발생</li>
                      <li>높은 token 수 (latency 증가)</li>
                    </ul>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                    <strong className="text-emerald-800">KV Cache-based</strong>
                    <ul className="text-slate-600 mt-1 space-y-1 list-disc list-inside">
                      <li>Rich representation 직접 전달</li>
                      <li>Decoding 불필요</li>
                      <li>더 적은 통신 비용 가능</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Interactive: Communication Cost Comparison */}
              <CommunicationCostComparison />

              <div className="insight">
                <div className="insight-title">Key Insight</div>
                <p className="text-sm text-slate-600">
                  Text 기반 소통은 사람이 읽을 수 있다는 장점이 있지만,
                  LLM 내부 표현의 풍부함을 text로 압축하면서 정보 손실이 발생합니다.
                  KV cache를 직접 공유하면 이 bottleneck을 우회할 수 있습니다.
                </p>
              </div>
            </section>

            {/* ============================================= */}
            {/* Section 2: KV Cache 기초                       */}
            {/* ============================================= */}
            <section id="kv-basics" className="section-card transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <span className="badge badge-green">Foundation</span>
                <span className="text-sm text-slate-400">Section 2</span>
              </div>

              <h2 className="text-3xl font-bold text-slate-900 mb-4">2. KV Cache 기초</h2>
              <p className="text-lg text-slate-600 leading-relaxed mb-6">
                Transformer의 autoregressive generation에서 <strong>KV cache</strong>는 핵심적인 역할을 합니다.
                이미 계산된 Key와 Value를 저장해두면, 새 토큰 생성 시 이전 토큰들의 attention을
                재계산할 필요가 없습니다.
              </p>

              <div id="kv-prefill-decode" className="concept-card mb-6">
                <div className="text-xs font-semibold text-emerald-600 mb-1">Two Stages</div>
                <h3 className="font-bold text-slate-800 mb-2">Prefill과 Decode</h3>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <strong className="text-blue-800">Prefill Stage</strong>
                    <p className="text-slate-600 mt-1">
                      입력 프롬프트의 모든 토큰을 한 번에 처리합니다.
                      각 layer에서 Key와 Value를 계산하여 KV cache에 저장합니다.
                      이 단계는 병렬로 수행 가능합니다.
                    </p>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                    <strong className="text-emerald-800">Decode Stage</strong>
                    <p className="text-slate-600 mt-1">
                      토큰을 하나씩 생성합니다. 새 토큰의 Query가 저장된 KV cache와
                      attention을 수행하고, 새로 생성된 K, V는 cache에 추가됩니다.
                      이 단계는 순차적입니다.
                    </p>
                  </div>
                </div>
              </div>

              <div id="kv-formula" className="formula-block">
                <h4 className="font-semibold text-blue-800 mb-3">Attention과 KV Cache</h4>
                <p className="text-sm text-slate-600 mb-3">
                  Self-attention의 기본 연산에서 Key와 Value는 입력 시퀀스로부터 계산됩니다.
                </p>
                <BlockMath math={String.raw`\text{Attention}(Q, K, V) = \text{softmax}\!\left(\frac{QK^\top}{\sqrt{d_k}}\right)V`} />
                <p className="text-sm text-slate-600 mt-3 mb-3">
                  각 layer <InlineMath math="l" />에서의 KV cache는 다음과 같이 정의됩니다.
                </p>
                <BlockMath math={String.raw`K^{(l)} = W_K^{(l)} X, \quad V^{(l)} = W_V^{(l)} X`} />
                <p className="text-sm text-slate-600 mt-3">
                  여기서 <InlineMath math="X \in \mathbb{R}^{n \times d}" />는 입력 hidden states,
                  <InlineMath math={String.raw`W_K^{(l)}, W_V^{(l)} \in \mathbb{R}^{d \times d_k}`} />는 projection 행렬입니다.
                  Decode 시 새 토큰 <InlineMath math="x_t" />의 query <InlineMath math={String.raw`q_t = W_Q^{(l)} x_t`} />가
                  저장된 <InlineMath math={String.raw`K^{(l)}, V^{(l)}`} />와 attention을 수행합니다.
                </p>
              </div>

              <div className="insight">
                <div className="insight-title">Key Insight</div>
                <p className="text-sm text-slate-600">
                  KV cache는 단순한 속도 최적화가 아니라, 모델이 입력 시퀀스에 대해 학습한
                  <strong> 의미적 표현(semantic representation)</strong>을 담고 있습니다.
                  이 점에서 KV cache를 에이전트 간 &ldquo;지식 전달&rdquo; 매체로 활용하는 발상이 나옵니다.
                </p>
              </div>
            </section>

            {/* ============================================= */}
            {/* Section 3: Latent MAS                         */}
            {/* ============================================= */}
            <section id="latent-mas" className="section-card transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <span className="badge badge-blue">Paper 1</span>
                <span className="text-sm text-slate-400">Section 3</span>
              </div>

              <h2 className="text-3xl font-bold text-slate-900 mb-4">3. Latent MAS</h2>
              <p className="text-lg text-slate-600 leading-relaxed mb-4">
                Zou et al. (2025)은 Multi-Agent System에서 text 대신 KV cache로 소통하는
                <strong> Latent MAS</strong> 프레임워크를 제안합니다.
              </p>
              <p className="text-sm text-slate-500 mb-6 italic">
                &ldquo;Latent Collaboration in Multi-Agent Systems&rdquo; (arXiv:2511.20639)
              </p>

              <div id="latent-mas-arch" className="concept-card mb-6">
                <div className="text-xs font-semibold text-blue-600 mb-1">Architecture</div>
                <h3 className="font-bold text-slate-800 mb-2">Sequential & Hierarchical Communication</h3>
                <p className="text-sm text-slate-600 mb-3">
                  Latent MAS는 두 가지 멀티에이전트 토폴로지를 지원합니다.
                </p>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <strong className="text-blue-800">Sequential</strong>
                    <p className="text-slate-600 mt-2">
                      Agent 1이 query를 처리한 후, 그 KV cache를 Agent 2에게 전달합니다.
                      Agent 2는 받은 KV cache를 자신의 context에 prepend하여 처리합니다.
                      파이프라인처럼 순차적으로 지식이 전달됩니다.
                    </p>
                  </div>
                  <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                    <strong className="text-indigo-800">Hierarchical</strong>
                    <p className="text-slate-600 mt-2">
                      여러 하위 agent가 독립적으로 처리한 KV cache를 하나의 상위 agent에게 전달합니다.
                      상위 agent는 이를 concatenate하여 종합적인 판단을 내립니다.
                    </p>
                  </div>
                </div>
              </div>

              <div id="latent-mas-projection" className="formula-block mb-6">
                <h4 className="font-semibold text-blue-800 mb-3">Input-Output Distribution Alignment</h4>
                <p className="text-sm text-slate-600 mb-3">
                  핵심 문제: sender agent의 <strong>output</strong> 분포와 receiver agent의 <strong>input</strong> 분포가 다릅니다.
                  Latent MAS는 projection matrix <InlineMath math="W_a" />로 이를 정렬합니다.
                </p>
                <BlockMath math={String.raw`K_{\text{recv}}^{(l)} = W_a \cdot K_{\text{send}}^{(l)}, \quad V_{\text{recv}}^{(l)} = W_a \cdot V_{\text{send}}^{(l)}`} />
                <p className="text-sm text-slate-600 mt-3">
                  <InlineMath math={String.raw`W_a \in \mathbb{R}^{d \times d}`} />는 sender의 output hidden states와
                  receiver의 input embedding 사이의 분포 차이를 최소화하도록 학습됩니다.
                  이 alignment가 없으면 receiver는 sender의 KV cache를 올바르게 해석할 수 없습니다.
                </p>
              </div>

              <div id="latent-mas-exp" className="concept-card mb-6">
                <div className="text-xs font-semibold text-emerald-600 mb-1">Results</div>
                <h3 className="font-bold text-slate-800 mb-2">실험 결과</h3>
                <div className="text-sm text-slate-600 space-y-2">
                  <p>
                    <strong>ARC benchmark</strong>에서 TextMAS 대비 Latent MAS의 성능이 일관되게 향상되었습니다.
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Text 대비 <strong>더 적은 token 수</strong>로 소통 가능</li>
                    <li>Hidden representation이 text보다 <strong>더 풍부한 정보</strong>를 전달</li>
                    <li>Sequential과 Hierarchical 모두에서 개선 확인</li>
                  </ul>
                </div>
              </div>

              <div className="text-xs text-slate-400 mt-4 pt-4 border-t border-slate-200">
                Zou et al., &ldquo;Latent Collaboration in Multi-Agent Systems,&rdquo; arXiv:2511.20639, 2025.
              </div>
            </section>

            {/* ============================================= */}
            {/* Section 4: KVComm                             */}
            {/* ============================================= */}
            <section id="kvcomm" className="section-card transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <span className="badge badge-amber">Paper 2</span>
                <span className="text-sm text-slate-400">Section 4</span>
              </div>

              <h2 className="text-3xl font-bold text-slate-900 mb-4">4. KVComm</h2>
              <p className="text-lg text-slate-600 leading-relaxed mb-4">
                Shi et al. (ICLR 2026)은 <strong>어떤 layer의 KV를 공유할지</strong> 선택하는 문제를 다룹니다.
                모든 layer의 KV cache를 전송하면 비용이 크므로, 효율적인 subset 선택이 핵심입니다.
              </p>
              <p className="text-sm text-slate-500 mb-6 italic">
                &ldquo;KVComm: Enabling Efficient LLM Communication through Selective KV Sharing&rdquo; (ICLR 2026)
              </p>

              <div id="kvcomm-hypothesis" className="concept-card mb-6">
                <div className="text-xs font-semibold text-amber-600 mb-1">Core Hypotheses</div>
                <h3 className="font-bold text-slate-800 mb-2">두 가지 핵심 가설</h3>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <strong className="text-amber-800">H1: Middle Layers are Best</strong>
                    <p className="text-slate-600 mt-2">
                      초기 layer는 low-level 특징, 후기 layer는 task-specific 특징을 담습니다.
                      <strong> 중간 layer</strong>가 <strong>semantic knowledge</strong> 전달에 가장 효과적입니다.
                    </p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <strong className="text-orange-800">H2: Attention Importance</strong>
                    <p className="text-slate-600 mt-2">
                      Receiver의 attention score를 기반으로 sender의 어떤 layer가 중요한지 판별합니다.
                      Receiver가 더 많은 attention을 주는 layer의 KV가 더 유용합니다.
                    </p>
                  </div>
                </div>
              </div>

              <div id="kvcomm-selection" className="formula-block mb-6">
                <h4 className="font-semibold text-blue-800 mb-3">Layer Selection: Gaussian Prior + Attention Score</h4>
                <p className="text-sm text-slate-600 mb-3">
                  KVComm은 두 가지 시그널을 결합하여 layer를 선택합니다.
                </p>
                <p className="text-sm text-slate-600 mb-2">
                  1) <strong>Gaussian prior</strong>: 중간 layer에 높은 확률을 부여
                </p>
                <BlockMath math={String.raw`p_{\text{prior}}(l) = \frac{1}{\sigma\sqrt{2\pi}} \exp\!\left(-\frac{(l - \mu)^2}{2\sigma^2}\right)`} />
                <p className="text-sm text-slate-600 mt-3 mb-2">
                  2) <strong>Attention importance score</strong>: receiver가 sender의 각 layer KV에 부여하는 attention의 합
                </p>
                <BlockMath math={String.raw`s(l) = \sum_{i} \text{Attn}_{i}^{(l)}(\text{sender KV})`} />
                <p className="text-sm text-slate-600 mt-3 mb-2">
                  3) 최종 score는 두 시그널의 가중 결합입니다.
                </p>
                <BlockMath math={String.raw`\text{score}(l) = \alpha \cdot \hat{p}_{\text{prior}}(l) + (1-\alpha) \cdot \hat{s}(l)`} />
                <p className="text-sm text-slate-600 mt-3">
                  여기서 <InlineMath math="\alpha" />는 prior와 attention score의 균형을 조절하는 하이퍼파라미터이고,
                  hat 표기는 정규화된 값을 의미합니다.
                  상위 <InlineMath math="k" />개 layer가 선택되어 KV cache가 공유됩니다.
                </p>
              </div>

              {/* Interactive: Layer Importance Visualizer */}
              <LayerImportanceVisualizer />

              <div id="kvcomm-exp" className="concept-card mb-6">
                <div className="text-xs font-semibold text-emerald-600 mb-1">Results</div>
                <h3 className="font-bold text-slate-800 mb-2">실험 결과</h3>
                <div className="text-sm text-slate-600 space-y-2">
                  <ul className="list-disc list-inside space-y-1">
                    <li>전체 layer 공유 대비 <strong>30~50%의 layer만으로도 유사한 성능</strong> 달성</li>
                    <li>단 <strong>1개 샘플</strong>로도 robust한 layer selection이 가능</li>
                    <li>Gaussian prior가 없는 attention-only 선택보다 성능이 우수</li>
                  </ul>
                </div>
              </div>

              <div className="insight">
                <div className="insight-title">Key Insight</div>
                <p className="text-sm text-slate-600">
                  모든 layer의 KV cache가 동등하게 유용하지 않습니다.
                  중간 layer가 semantic knowledge 전달에 가장 효과적이며,
                  이 사전 지식(Gaussian prior)과 데이터 기반 시그널(attention score)을 결합하면
                  매우 적은 샘플로도 좋은 layer 선택이 가능합니다.
                </p>
              </div>

              <div className="text-xs text-slate-400 mt-4 pt-4 border-t border-slate-200">
                Shi et al., &ldquo;KVComm: Enabling Efficient LLM Communication through Selective KV Sharing,&rdquo; ICLR 2026.
              </div>
            </section>

            {/* ============================================= */}
            {/* Section 5: Cache-2-Cache                      */}
            {/* ============================================= */}
            <section id="c2c" className="section-card transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <span className="badge badge-red">Paper 3</span>
                <span className="text-sm text-slate-400">Section 5</span>
              </div>

              <h2 className="text-3xl font-bold text-slate-900 mb-4">5. Cache-2-Cache (C2C)</h2>
              <p className="text-lg text-slate-600 leading-relaxed mb-4">
                Fu et al. (ICLR 2026)은 <strong>서로 다른 LLM</strong> 간에 KV cache를 변환하는
                <strong> Cache-2-Cache</strong>를 제안합니다. 큰 모델의 지식을 작은 모델에서 활용할 수 있습니다.
              </p>
              <p className="text-sm text-slate-500 mb-6 italic">
                &ldquo;Cache-to-Cache: Direct Semantic Communication Between Large Language Models&rdquo; (ICLR 2026)
              </p>

              <div id="c2c-fuser" className="formula-block mb-6">
                <h4 className="font-semibold text-blue-800 mb-3">MLP Fuser</h4>
                <p className="text-sm text-slate-600 mb-3">
                  C2C의 핵심은 <strong>3-layer MLP fuser</strong>입니다.
                  Sharer(큰 모델)의 KV cache를 receiver(작은 모델)의 KV 공간으로 변환합니다.
                </p>
                <BlockMath math={String.raw`\tilde{K}_{\text{recv}}^{(l_r)} = f_\theta\!\left(K_{\text{share}}^{(l_s)}\right) = W_3 \cdot \text{ReLU}\!\left(W_2 \cdot \text{ReLU}\!\left(W_1 \cdot K_{\text{share}}^{(l_s)}\right)\right)`} />
                <p className="text-sm text-slate-600 mt-3">
                  Value에 대해서도 동일한 구조의 fuser가 별도로 학습됩니다.
                  입력 차원은 sharer의 <InlineMath math="d_s" />, 출력 차원은 receiver의 <InlineMath math="d_r" />이므로
                  cross-model transformation이 가능합니다.
                </p>
              </div>

              <div id="c2c-mapping" className="concept-card mb-6">
                <div className="text-xs font-semibold text-red-600 mb-1">Strategy</div>
                <h3 className="font-bold text-slate-800 mb-2">Layer Mapping + Terminal Alignment</h3>
                <p className="text-sm text-slate-600 mb-3">
                  Sharer와 receiver의 layer 수가 다를 수 있으므로, layer 간 매핑이 필요합니다.
                </p>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-rose-50 rounded-lg border border-rose-100">
                    <strong className="text-rose-800">Layer Mapping</strong>
                    <p className="text-slate-600 mt-1">
                      Sharer의 <InlineMath math="L_s" /> layer를 receiver의 <InlineMath math="L_r" /> layer에 균등 분배합니다.
                      예: 32-layer sharer의 layer [4, 12, 20, 28]을 8-layer receiver의 layer [1, 3, 5, 7]에 매핑.
                    </p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                    <strong className="text-orange-800">Terminal Alignment</strong>
                    <p className="text-slate-600 mt-1">
                      Receiver의 마지막 layer(들)에 sharer의 KV cache를 주입합니다.
                      나머지 초기 layer는 receiver 자체의 KV를 사용하여 context를 유지합니다.
                    </p>
                  </div>
                </div>
              </div>

              <div id="c2c-exp" className="concept-card mb-6">
                <div className="text-xs font-semibold text-emerald-600 mb-1">Results</div>
                <h3 className="font-bold text-slate-800 mb-2">실험 결과</h3>
                <div className="text-sm text-slate-600 space-y-2">
                  <ul className="list-disc list-inside space-y-1">
                    <li><strong>Qwen3-4B → Qwen3-0.6B</strong>: 작은 receiver가 큰 sharer의 지식 활용 가능</li>
                    <li>Fuser 파라미터는 전체 모델 대비 매우 작음 (~0.1%)</li>
                    <li>동일 모델 간에도 context length 확장 효과</li>
                    <li>Knowledge-intensive task에서 특히 큰 개선</li>
                  </ul>
                </div>
              </div>

              <div className="insight">
                <div className="insight-title">Key Insight</div>
                <p className="text-sm text-slate-600">
                  C2C는 &ldquo;서로 다른 언어를 쓰는&rdquo; 모델 간에도 KV cache를 통한 소통이 가능함을 보여줍니다.
                  가벼운 MLP fuser만으로 cross-model knowledge transfer가 가능하며,
                  이는 이기종 멀티에이전트 시스템의 가능성을 열어줍니다.
                </p>
              </div>

              <div className="text-xs text-slate-400 mt-4 pt-4 border-t border-slate-200">
                Fu et al., &ldquo;Cache-to-Cache: Direct Semantic Communication Between Large Language Models,&rdquo; ICLR 2026.
              </div>
            </section>

            {/* ============================================= */}
            {/* Section 6: SnapKV                             */}
            {/* ============================================= */}
            <section id="snapkv" className="section-card transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <span className="badge badge-green">Paper 4</span>
                <span className="text-sm text-slate-400">Section 6</span>
              </div>

              <h2 className="text-3xl font-bold text-slate-900 mb-4">6. SnapKV</h2>
              <p className="text-lg text-slate-600 leading-relaxed mb-4">
                Li et al. (NeurIPS 2024)은 KV cache를 <strong>압축</strong>하는 SnapKV를 제안합니다.
                프롬프트의 모든 토큰이 아닌, <strong>중요한 토큰의 KV만 유지</strong>하여 메모리를 절약합니다.
              </p>
              <p className="text-sm text-slate-500 mb-6 italic">
                &ldquo;SnapKV: LLM Knows What You Are Looking For Before Generation&rdquo; (NeurIPS 2024)
              </p>

              <div id="snapkv-observation" className="concept-card mb-6">
                <div className="text-xs font-semibold text-emerald-600 mb-1">Key Observation</div>
                <h3 className="font-bold text-slate-800 mb-2">Observation Window</h3>
                <p className="text-sm text-slate-600 mb-3">
                  SnapKV의 핵심 관찰: 프롬프트의 마지막 부분(observation window)에 있는 토큰들의
                  attention 패턴이 <strong>생성 중의 attention 패턴과 일치</strong>합니다.
                </p>
                <BlockMath math={String.raw`\text{ObsWindow} = \{x_{n-w+1}, x_{n-w+2}, \ldots, x_n\}`} />
                <p className="text-sm text-slate-600 mt-3">
                  여기서 <InlineMath math="w" />는 observation window 크기이고, <InlineMath math="n" />은 프롬프트 길이입니다.
                  이 window 내 토큰들이 나머지 프롬프트에 주는 attention을 분석하면,
                  생성 시 어떤 토큰이 중요할지 미리 알 수 있습니다.
                </p>
                <div className="mt-3 grid sm:grid-cols-2 gap-3 text-sm">
                  <div className="p-3 bg-teal-50 rounded-lg border border-teal-100">
                    <strong className="text-teal-800">Question Dependency</strong>
                    <p className="text-slate-600 mt-1">
                      선택되는 중요 토큰은 질문/instruction에 따라 달라집니다.
                      같은 문서라도 질문이 다르면 다른 토큰이 선택됩니다.
                    </p>
                  </div>
                  <div className="p-3 bg-cyan-50 rounded-lg border border-cyan-100">
                    <strong className="text-cyan-800">Position Invariance</strong>
                    <p className="text-slate-600 mt-1">
                      Instruction의 위치(앞/뒤)가 바뀌어도 선택 패턴은
                      유사하게 유지됩니다.
                    </p>
                  </div>
                </div>
              </div>

              <div id="snapkv-voting" className="formula-block mb-6">
                <h4 className="font-semibold text-blue-800 mb-3">Voting Mechanism</h4>
                <p className="text-sm text-slate-600 mb-3">
                  각 attention head가 observation window 내에서 중요하다고 판단하는 토큰에 &ldquo;투표&rdquo;합니다.
                </p>
                <BlockMath math={String.raw`\text{vote}(i) = \sum_{h=1}^{H} \sum_{t \in \text{ObsWindow}} \text{Attn}_{h,t}(i)`} />
                <p className="text-sm text-slate-600 mt-3 mb-3">
                  여기서 <InlineMath math={String.raw`\text{Attn}_{h,t}(i)`} />는 head <InlineMath math="h" />에서
                  observation window 토큰 <InlineMath math="t" />가 프롬프트 토큰 <InlineMath math="i" />에 주는 attention weight입니다.
                  상위 <InlineMath math="p\%" /> 투표를 받은 토큰의 KV만 유지합니다.
                </p>
                <BlockMath math={String.raw`\text{KV}_{\text{compressed}}^{(l)} = \text{TopK}\!\left(\text{vote}(i),\; k = \lfloor p \cdot n \rfloor\right)`} />
              </div>

              {/* Interactive: Cache Compression Demo */}
              <CacheCompressionDemo />

              <div id="snapkv-exp" className="concept-card mb-6">
                <div className="text-xs font-semibold text-emerald-600 mb-1">Results</div>
                <h3 className="font-bold text-slate-800 mb-2">실험 결과</h3>
                <div className="text-sm text-slate-600 space-y-2">
                  <ul className="list-disc list-inside space-y-1">
                    <li>16K context에서 <strong>3~4배 압축</strong>해도 성능 저하 거의 없음</li>
                    <li>패턴은 생성 전에 이미 식별 가능하고, 생성 중에도 consistent하게 유지</li>
                    <li>Window-based 선택으로 계산 오버헤드 최소화</li>
                    <li>Long-context retrieval, summarization 등 다양한 task에서 검증</li>
                  </ul>
                </div>
              </div>

              <div className="insight">
                <div className="insight-title">Key Insight</div>
                <p className="text-sm text-slate-600">
                  LLM은 생성을 시작하기 전에 이미 &ldquo;어디를 봐야 하는지&rdquo; 알고 있습니다.
                  이 사전 지식을 활용하면, KV cache의 대부분을 버려도 성능을 유지할 수 있습니다.
                  이는 KV cache 기반 에이전트 소통에서도 <strong>전송량을 줄이는 데 활용</strong>될 수 있습니다.
                </p>
              </div>

              <div className="text-xs text-slate-400 mt-4 pt-4 border-t border-slate-200">
                Li et al., &ldquo;SnapKV: LLM Knows What You Are Looking For Before Generation,&rdquo; NeurIPS 2024.
              </div>
            </section>

            {/* ============================================= */}
            {/* Section 7: Conclusion                         */}
            {/* ============================================= */}
            <section id="conclusion" className="section-card transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <span className="badge badge-amber">Wrap-up</span>
                <span className="text-sm text-slate-400">Section 7</span>
              </div>

              <h2 className="text-3xl font-bold text-slate-900 mb-4">7. Conclusion & Open Problems</h2>

              <div className="concept-card mb-6">
                <h3 className="font-bold text-slate-800 mb-3">논문 간 관계 정리</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b-2 border-slate-300">
                        <th className="text-left py-2 px-3 text-slate-700">논문</th>
                        <th className="text-left py-2 px-3 text-slate-700">핵심 질문</th>
                        <th className="text-left py-2 px-3 text-slate-700">해법</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-600">
                      <tr className="border-b border-slate-200">
                        <td className="py-2 px-3 font-medium">Latent MAS</td>
                        <td className="py-2 px-3">Text 대신 뭘로 소통?</td>
                        <td className="py-2 px-3">KV cache + projection alignment</td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="py-2 px-3 font-medium">KVComm</td>
                        <td className="py-2 px-3">어떤 layer의 KV를 보낼까?</td>
                        <td className="py-2 px-3">Gaussian prior + attention score</td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="py-2 px-3 font-medium">C2C</td>
                        <td className="py-2 px-3">다른 모델 간에도 가능?</td>
                        <td className="py-2 px-3">MLP fuser + layer mapping</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-medium">SnapKV</td>
                        <td className="py-2 px-3">KV cache를 줄일 수 있나?</td>
                        <td className="py-2 px-3">Observation window voting</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div id="open-problems" className="concept-card mb-6">
                <div className="text-xs font-semibold text-amber-600 mb-1">Future Directions</div>
                <h3 className="font-bold text-slate-800 mb-3">미해결 문제 & 향후 방향</h3>
                <div className="grid sm:grid-cols-2 gap-4 text-sm text-slate-600">
                  <div className="p-3 bg-violet-50 rounded-lg border border-violet-100">
                    <strong className="text-violet-800">1. Scalability</strong>
                    <p className="mt-1">
                      에이전트 수가 증가하면 KV cache 전송량도 증가합니다.
                      SnapKV 같은 압축 기법을 에이전트 소통에 어떻게 최적화할 수 있을까요?
                    </p>
                  </div>
                  <div className="p-3 bg-sky-50 rounded-lg border border-sky-100">
                    <strong className="text-sky-800">2. Heterogeneous Agents</strong>
                    <p className="mt-1">
                      C2C는 같은 계열(Qwen) 내에서만 검증되었습니다.
                      완전히 다른 아키텍처(GPT vs Llama) 간 변환은 아직 미탐색 영역입니다.
                    </p>
                  </div>
                  <div className="p-3 bg-pink-50 rounded-lg border border-pink-100">
                    <strong className="text-pink-800">3. Privacy & Security</strong>
                    <p className="mt-1">
                      KV cache를 직접 공유하면 모델 내부 표현이 노출됩니다.
                      프라이버시를 보장하면서 KV 소통하는 방법은?
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                    <strong className="text-green-800">4. Dynamic Selection</strong>
                    <p className="mt-1">
                      현재 layer 선택은 고정적입니다.
                      Query의 난이도나 내용에 따라 동적으로 layer를 선택하는 adaptive 방법이 가능할까요?
                    </p>
                  </div>
                </div>
              </div>


              <div className="insight">
                <div className="insight-title">Takeaway</div>
                <p className="text-sm text-slate-600">
                  KV cache 기반 소통은 Multi-Agent LLM 시스템의 새로운 패러다임입니다.
                  Text 대신 hidden representation을 직접 공유하면 정보 손실을 줄이고 통신 비용을 절감할 수 있습니다.
                  아직 초기 단계이지만, layer 선택 최적화, cross-model 변환, cache 압축 등의 기법이 빠르게 발전하고 있습니다.
                </p>
              </div>
            </section>
          </div>
        </main>
      </div>

      {/* Back to top button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-teal-600 hover:bg-teal-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
          aria-label="맨 위로"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      )}
    </div>
  );
}
