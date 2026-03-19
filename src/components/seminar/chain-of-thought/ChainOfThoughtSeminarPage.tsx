'use client';

import { useCallback, useState, useEffect } from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import { TableOfContents, type TocItem } from '@/components/tse/navigation';

/* ------------------------------------------------------------------ */
/*  Table of Contents                                                  */
/* ------------------------------------------------------------------ */
const tocItems: TocItem[] = [
  { id: 'intro', label: '1. Chain-of-Thought란?', level: 1 },
  { id: 'intro-definition', label: 'CoT 정의', level: 2 },
  { id: 'intro-observations', label: '핵심 관찰', level: 2 },

  { id: 'length', label: '2. CoT 길이의 최적화', level: 1 },
  { id: 'length-inverted-u', label: 'Inverted U-Shaped Curve', level: 2 },
  { id: 'length-factors', label: '난이도 vs 모델 능력', level: 2 },
  { id: 'length-rl', label: 'RL 관점', level: 2 },

  { id: 'effort', label: '3. 추론 노력 측정', level: 1 },
  { id: 'effort-deep-tokens', label: 'Deep-Thinking Tokens', level: 2 },
  { id: 'effort-dtr', label: 'DTR 메트릭', level: 2 },
  { id: 'effort-scaling', label: 'Test-Time Scaling', level: 2 },

  { id: 'stop', label: '4. 언제 생각을 멈출까', level: 1 },
  { id: 'stop-redundancy', label: '중복 추론 문제', level: 2 },
  { id: 'stop-scoring', label: 'Scoring Function', level: 2 },
  { id: 'stop-termination', label: 'Exploration Termination', level: 2 },

  { id: 'topology', label: '5. Long CoT의 위상 구조', level: 1 },
  { id: 'topology-bonds', label: '세 가지 Bond 유형', level: 2 },
  { id: 'topology-molesyn', label: 'Mole-Syn 방법', level: 2 },

  { id: 'conclusion', label: '6. 종합 정리', level: 1 },
];

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */
export default function ChainOfThoughtSeminarPage() {
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
      el.classList.add('ring-2', 'ring-amber-400', 'ring-offset-4');
      setTimeout(() => el.classList.remove('ring-2', 'ring-amber-400', 'ring-offset-4'), 2000);
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
          className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-[width] duration-150"
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
                  className="h-full bg-amber-500 rounded-full transition-[width] duration-150"
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
          <div className="mb-8 p-8 bg-gradient-to-br from-amber-600 to-orange-700 rounded-2xl text-white">
            <div className="text-amber-200 text-sm font-medium mb-2">Paper Seminar &middot; 2026.03.19</div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">
              Chain-of-Thought Reasoning
            </h1>
            <p className="text-amber-100 text-lg leading-relaxed max-w-2xl">
              LLM의 추론 능력을 끌어내는 Chain-of-Thought의 원리부터
              최적 길이, 추론 노력 측정, 조기 종료, 그리고 Long CoT의 위상 구조까지
              최신 연구들을 체계적으로 정리합니다.
            </p>
            <div className="flex flex-wrap gap-3 mt-5">
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">CoT Prompting</span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Optimal Length</span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">DTR Metric</span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Early Stopping</span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Topology</span>
            </div>
            <div className="mt-4 text-sm text-amber-200/80">
              발표자: Jiyoung Yun
            </div>
          </div>

          <div className="space-y-8">
            {/* ============================================= */}
            {/* Section 1: Chain-of-Thought란?                 */}
            {/* ============================================= */}
            <section id="intro" className="section-card transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <span className="badge badge-amber">Foundation</span>
                <span className="text-sm text-slate-400">Section 1</span>
              </div>

              <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">1. Chain-of-Thought란?</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 italic">
                Wei et al., &ldquo;Chain-of-Thought Prompting Elicits Reasoning in Large Language Models,&rdquo; NeurIPS, 2022.
              </p>
              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                Chain-of-Thought(CoT)는 LLM이 최종 답변에 도달하기 전에
                <strong> 중간 추론 단계를 자연어로 생성</strong>하는 기법입니다.
                사람이 복잡한 문제를 풀 때 단계별로 생각하는 과정을 모방합니다.
              </p>

              <div id="intro-definition" className="concept-card mb-6">
                <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">Definition</div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">CoT의 정의</h3>
                <blockquote className="border-l-4 border-amber-400 pl-4 py-2 bg-amber-50 dark:bg-amber-900/20 rounded-r-lg text-sm text-slate-700 dark:text-slate-300 italic mb-3">
                  &ldquo;A coherent series of intermediate natural language reasoning steps
                  that lead to the final output.&rdquo;
                </blockquote>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  CoT는 test-time에 추가 연산 자원을 할당하는 효과를 가집니다.
                  모델이 더 많은 토큰을 생성하면서 &ldquo;생각&rdquo;하는 시간을 확보합니다.
                </p>
              </div>

              <div id="intro-observations" className="concept-card mb-6">
                <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">Key Observations</div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">핵심 관찰 결과</h3>
                <div className="grid gap-3 text-sm">
                  <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40 text-xs font-bold text-amber-700 dark:text-amber-300">1</span>
                    <div>
                      <strong className="text-slate-800 dark:text-slate-200">스케일 의존적</strong>
                      <p className="text-slate-600 dark:text-slate-400 mt-0.5">작은 모델에서는 효과 미미, 큰 모델에서 강한 이득</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40 text-xs font-bold text-amber-700 dark:text-amber-300">2</span>
                    <div>
                      <strong className="text-slate-800 dark:text-slate-200">난이도 비례</strong>
                      <p className="text-slate-600 dark:text-slate-400 mt-0.5">다단계 추론이 필요한 어려운 문제일수록 CoT의 효과가 큼</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40 text-xs font-bold text-amber-700 dark:text-amber-300">3</span>
                    <div>
                      <strong className="text-slate-800 dark:text-slate-200">Fine-tuning 경쟁력</strong>
                      <p className="text-slate-600 dark:text-slate-400 mt-0.5">task-specific fine-tuning 없이도 경쟁력 있는 성능 달성</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40 text-xs font-bold text-amber-700 dark:text-amber-300">4</span>
                    <div>
                      <strong className="text-slate-800 dark:text-slate-200">구조가 핵심</strong>
                      <p className="text-slate-600 dark:text-slate-400 mt-0.5">단순히 긴 생성이 아니라, 구조화된 추론이 성능의 원인</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="insight">
                <div className="insight-title">Key Insight</div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  CoT의 핵심은 &ldquo;더 많이 생각하게 하는 것&rdquo;이 아니라
                  &ldquo;<strong>구조적으로 생각하게 하는 것</strong>&rdquo;입니다.
                  이후 섹션에서 &ldquo;얼마나&rdquo;, &ldquo;어떻게&rdquo;, &ldquo;언제까지&rdquo; 생각할지를 다룹니다.
                </p>
              </div>
            </section>

            {/* ============================================= */}
            {/* Section 2: CoT 길이의 최적화                    */}
            {/* ============================================= */}
            <section id="length" className="section-card transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <span className="badge badge-blue">Analysis</span>
                <span className="text-sm text-slate-400">Section 2</span>
              </div>

              <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">2. CoT 길이의 최적화</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 italic">
                Wu et al., &ldquo;When More is Less: Understanding Chain-of-Thought Length in LLMs,&rdquo; arXiv:2502.07266, 2025.
              </p>
              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                &ldquo;길게 생각하면 더 잘 풀까?&rdquo; &mdash; 답은 <strong>항상 그렇지는 않다</strong>입니다.
                CoT 길이와 정확도의 관계는 역 U자 곡선을 따릅니다.
              </p>

              <div id="length-inverted-u" className="concept-card mb-6">
                <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">Core Finding</div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-3">Inverted U-Shaped Curve</h3>

                {/* ASCII visualization of the inverted U curve */}
                <div className="p-4 bg-slate-900 dark:bg-slate-950 rounded-lg font-mono text-xs text-slate-300 mb-4 overflow-x-auto">
                  <pre>{`  정확도
  ▲
  │        ╭──────╮
  │      ╱          ╲
  │    ╱              ╲        ← 최적 길이 초과: 오류 누적
  │  ╱                  ╲
  │╱                      ╲
  ├─────────────────────────→ CoT 길이
  짧음     최적점      길음

  ▸ 너무 짧으면: 추론 단계 부족
  ▸ 적정 길이: 최고 정확도
  ▸ 너무 길면: 중간 단계 오류 누적`}</pre>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-400">
                  CoT가 길어지면 각 중간 단계에서 오류가 발생할 확률이 누적됩니다.
                  일정 길이를 넘으면 오히려 정확도가 떨어집니다.
                </p>
              </div>

              <div id="length-factors" className="concept-card mb-6">
                <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">Factors</div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-3">최적 길이를 결정하는 두 요인</h3>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <strong className="text-red-800 dark:text-red-300">Task Difficulty</strong>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                      어려운 문제 = 더 긴 최적 CoT.
                      산술 과제에서 총 연산자 수(operator count)가 난이도의 proxy입니다.
                    </p>
                    <div className="mt-2 p-2 bg-white dark:bg-slate-800 rounded text-xs font-mono text-center">
                      어려운 문제 → 최적 CoT 길이 ↑
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <strong className="text-blue-800 dark:text-blue-300">Model Capability</strong>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                      강한 모델 = 더 짧은 최적 CoT.
                      한 단계에서 더 많은 연산자를 처리할 수 있기 때문입니다.
                    </p>
                    <div className="mt-2 p-2 bg-white dark:bg-slate-800 rounded text-xs font-mono text-center">
                      강한 모델 → 최적 CoT 길이 ↓
                    </div>
                  </div>
                </div>
              </div>

              <div className="formula-block mb-6">
                <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-3">모델 능력 정의</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  모델 능력 <InlineMath math="M" />은 모델이 한 추론 단계에서 직접 풀 수 있는
                  최대 연산자(operator) 수로 정의됩니다.
                </p>
                <BlockMath math={String.raw`M = \max\{k : \text{모델이 } k\text{개 연산자를 단일 단계로 처리 가능}\}`} />
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">
                  서브질문 정확도의 오류율은 총 연산자 수와 양의 상관관계를 가지며,
                  서브답변 정확도 <InlineMath math="a" />는 이전 추론 이력과 독립입니다.
                </p>
              </div>

              <div id="length-rl" className="concept-card mb-6">
                <div className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1">RL Perspective</div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">강화학습 관점</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  RL 학습 과정에서 모델은 자연스럽게 <strong>더 짧은 CoT</strong>로 수렴합니다.
                  이는 &ldquo;Simplicity Bias&rdquo; 현상으로, RL이 정확성을 최적화하면
                  불필요한 추론 단계가 자연스럽게 제거됩니다.
                </p>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="grid grid-cols-3 gap-3 text-center text-sm">
                    <div>
                      <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">Pre-RL</div>
                      <div className="text-slate-500 dark:text-slate-400 mt-1">긴 CoT, 불필요한 단계 포함</div>
                    </div>
                    <div className="flex items-center justify-center">
                      <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">Post-RL</div>
                      <div className="text-slate-500 dark:text-slate-400 mt-1">짧은 CoT, 높은 정확도</div>
                    </div>
                  </div>
                  <p className="text-center text-xs text-purple-600 dark:text-purple-400 mt-3 font-medium">
                    &ldquo;Better models think less, but better&rdquo;
                  </p>
                </div>
              </div>

              <div className="insight">
                <div className="insight-title">Key Insight</div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  CoT 길이는 &ldquo;더 길수록 좋다&rdquo;가 아닙니다.
                  <strong> 문제 난이도에 맞는 적정 길이</strong>가 존재하며,
                  강한 모델일수록 짧은 추론으로 같은 결과를 달성합니다.
                </p>
              </div>
            </section>

            {/* ============================================= */}
            {/* Section 3: 추론 노력 측정                       */}
            {/* ============================================= */}
            <section id="effort" className="section-card transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <span className="badge badge-green">Metric</span>
                <span className="text-sm text-slate-400">Section 3</span>
              </div>

              <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">3. 추론 노력 측정</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 italic">
                Chen, W.-L. et al., &ldquo;Think Deep, Not Just Long: Measuring LLM Reasoning Effort via Deep-Thinking Tokens,&rdquo; arXiv:2602.13517, 2026.
              </p>
              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                토큰 수로 추론 노력을 측정하는 것은 부정확합니다.
                진정한 &ldquo;깊은 사고&rdquo;를 정량화하기 위해
                <strong> Deep-Thinking Token</strong>이라는 새로운 개념이 도입됩니다.
              </p>

              <div id="effort-deep-tokens" className="concept-card mb-6">
                <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">Core Concept</div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-3">Deep-Thinking Tokens</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  각 토큰이 생성될 때, 중간 레이어의 예측 분포가 최종 레이어까지
                  얼마나 오래 변하는지를 추적합니다.
                </p>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <strong className="text-green-800 dark:text-green-300">Shallow Token</strong>
                    <div className="mt-2 font-mono text-xs text-slate-500 dark:text-slate-400">
                      Layer 1 → 2 → 3 → ... → L<br />
                      분포: [확정] [확정] [확정] ... [확정]
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                      이른 레이어에서 이미 예측이 안정화. 모델이 &ldquo;쉽게&rdquo; 생성.
                    </p>
                  </div>
                  <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <strong className="text-orange-800 dark:text-orange-300">Deep-Thinking Token</strong>
                    <div className="mt-2 font-mono text-xs text-slate-500 dark:text-slate-400">
                      Layer 1 → 2 → 3 → ... → L<br />
                      분포: [변화] [변화] [변화] ... [확정]
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                      늦은 레이어까지 분포가 계속 변함. 모델이 &ldquo;깊이 사고&rdquo;.
                    </p>
                  </div>
                </div>
              </div>

              <div id="effort-dtr" className="formula-block mb-6">
                <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-3">DTR (Deep-Thinking Token Ratio)</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  중간 레이어 예측과 최종 레이어 예측 간의 <strong>Jensen-Shannon divergence</strong>로
                  각 토큰의 &ldquo;깊이&rdquo;를 정량화합니다.
                </p>
                <BlockMath math={String.raw`\text{JSD}(P_l \| P_L) = \frac{1}{2} D_{\text{KL}}(P_l \| M) + \frac{1}{2} D_{\text{KL}}(P_L \| M), \quad M = \frac{P_l + P_L}{2}`} />
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 mb-3">
                  여기서 <InlineMath math="P_l" />은 레이어 <InlineMath math="l" />의 예측 분포,
                  <InlineMath math="P_L" />은 최종 레이어의 예측 분포입니다.
                  DTR은 deep-thinking token의 비율로 정의됩니다:
                </p>
                <BlockMath math={String.raw`\text{DTR} = \frac{\text{deep-thinking tokens 수}}{\text{전체 토큰 수}}`} />
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">
                  DTR이 높을수록 모델이 더 많은 내부 연산을 수행한 것이며,
                  이는 단순한 토큰 수보다 실제 추론 노력을 더 정확하게 반영합니다.
                </p>
              </div>

              <div id="effort-scaling" className="concept-card mb-6">
                <div className="text-xs font-semibold text-teal-600 dark:text-teal-400 mb-1">Application</div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Efficient Test-Time Scaling</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  DTR을 활용한 효율적 test-time scaling 전략:
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-3 p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-200 dark:border-teal-800">
                    <span className="text-teal-600 dark:text-teal-400 font-bold shrink-0">Step 1</span>
                    <p className="text-slate-600 dark:text-slate-400">여러 후보 응답을 반복 샘플링 (repeated sampling)</p>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-200 dark:border-teal-800">
                    <span className="text-teal-600 dark:text-teal-400 font-bold shrink-0">Step 2</span>
                    <p className="text-slate-600 dark:text-slate-400">DTR이 낮은 응답은 조기 기각 (early rejection) &mdash; 얕은 사고로 생성된 답변 배제</p>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-200 dark:border-teal-800">
                    <span className="text-teal-600 dark:text-teal-400 font-bold shrink-0">Step 3</span>
                    <p className="text-slate-600 dark:text-slate-400">DTR이 높은 응답 중에서 최종 선택 (sample selection)</p>
                  </div>
                </div>
              </div>

              <div className="concept-card mb-6">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Comparison</div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-3">기존 Baseline 비교</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700">
                        <th className="text-left py-2 px-3 text-slate-600 dark:text-slate-400 font-semibold">메트릭</th>
                        <th className="text-left py-2 px-3 text-slate-600 dark:text-slate-400 font-semibold">측정 방식</th>
                        <th className="text-left py-2 px-3 text-slate-600 dark:text-slate-400 font-semibold">한계</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-600 dark:text-slate-400">
                      <tr className="border-b border-slate-100 dark:border-slate-800">
                        <td className="py-2 px-3 font-medium">Token count</td>
                        <td className="py-2 px-3">생성된 토큰 수</td>
                        <td className="py-2 px-3 text-red-500 dark:text-red-400">길이 ≠ 깊이</td>
                      </tr>
                      <tr className="border-b border-slate-100 dark:border-slate-800">
                        <td className="py-2 px-3 font-medium">Log probability</td>
                        <td className="py-2 px-3"><InlineMath math={String.raw`\sum \log p(y)`} /></td>
                        <td className="py-2 px-3 text-red-500 dark:text-red-400">확신 ≠ 정확</td>
                      </tr>
                      <tr className="border-b border-slate-100 dark:border-slate-800">
                        <td className="py-2 px-3 font-medium">Neg. perplexity</td>
                        <td className="py-2 px-3"><InlineMath math={String.raw`-\exp(-\frac{1}{n}\sum \log p)`} /></td>
                        <td className="py-2 px-3 text-red-500 dark:text-red-400">평균 기반, 토큰별 차이 무시</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-medium text-emerald-700 dark:text-emerald-400">DTR</td>
                        <td className="py-2 px-3">deep-thinking token 비율</td>
                        <td className="py-2 px-3 text-emerald-600 dark:text-emerald-400">내부 연산 깊이 직접 측정</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="insight">
                <div className="insight-title">Key Insight</div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  토큰 수는 추론 노력의 잘못된 proxy입니다.
                  <strong> DTR은 모델 내부에서 실제로 얼마나 &ldquo;고민&rdquo;했는지</strong>를 정량화하여,
                  test-time scaling의 효율성을 크게 높일 수 있습니다.
                </p>
              </div>
            </section>

            {/* ============================================= */}
            {/* Section 4: 언제 생각을 멈출까                   */}
            {/* ============================================= */}
            <section id="stop" className="section-card transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <span className="badge badge-purple">Strategy</span>
                <span className="text-sm text-slate-400">Section 4</span>
              </div>

              <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">4. 언제 생각을 멈출까</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 italic">
                Huang et al., &ldquo;Does Your Reasoning Model Implicitly Know When to Stop Thinking?,&rdquo; arXiv:2602.08354, 2026.
              </p>
              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                정답이 이미 나왔는데도 계속 추론하는 것은 낭비입니다.
                <strong> 조기 종료(early stopping)</strong> 전략으로 추론 효율을 높이는 방법을 다룹니다.
              </p>

              <div id="stop-redundancy" className="concept-card mb-6">
                <div className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1">Problem</div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-3">중복 추론 문제</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  정답이 처음 등장한 이후의 추론 단계는 대부분 불필요합니다.
                </p>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="font-semibold text-purple-800 dark:text-purple-300 text-sm mb-2">
                    Ratio of First Correct Step
                  </div>
                  <BlockMath math={String.raw`r_{\text{first}} = \frac{\text{정답이 처음 등장한 step index}}{\text{전체 추론 step 수}}`} />
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                    이 비율이 낮을수록, 모델이 정답을 찾은 후에도 불필요하게 오래 추론한 것입니다.
                    많은 경우 정답은 추론 초반에 이미 등장합니다.
                  </p>
                </div>
              </div>

              <div id="stop-scoring" className="formula-block mb-6">
                <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-3">Scoring Function</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  토큰별 추론 경로를 평가하는 scoring function을 정의하여,
                  높은 확신도의 경로를 빠르게 식별합니다.
                </p>
                <BlockMath math={String.raw`\Phi(y) = \sum_{i} \phi(y_i; y_{<i})`} />
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">
                  상위 <InlineMath math="m" />개의 후보 시퀀스를 유지하면서
                  토큰 단위로 탐색합니다. 높은 확신도의 분기는 더 짧고 효과적입니다.
                </p>
              </div>

              <div id="stop-termination" className="concept-card mb-6">
                <div className="text-xs font-semibold text-rose-600 dark:text-rose-400 mb-1">Mechanism</div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-3">Exploration Termination</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs">&lt;/think&gt;</code> 토큰의
                  랭킹 위치에 따라 탐색 종료를 결정합니다.
                </p>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <span className="px-2 py-0.5 bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 rounded text-xs font-bold shrink-0">Top-h</span>
                    <p className="text-slate-600 dark:text-slate-400">
                      <code>&lt;/think&gt;</code>가 상위 <InlineMath math="h" />개 안에 있으면 → 완료 후보에 추가
                    </p>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <span className="px-2 py-0.5 bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 rounded text-xs font-bold shrink-0">Top-2m</span>
                    <p className="text-slate-600 dark:text-slate-400">
                      <code>&lt;/think&gt;</code>가 상위 <InlineMath math="2m" /> 안이지만 <InlineMath math="h" /> 밖이면 → 폐기
                    </p>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <span className="px-2 py-0.5 bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded text-xs font-bold shrink-0">|O| ≥ r</span>
                    <p className="text-slate-600 dark:text-slate-400">
                      완료 후보가 <InlineMath math="r" />개 이상이면 → 탐색 종료, greedy로 최종 답변 생성
                    </p>
                  </div>
                </div>
              </div>

              <div className="concept-card mb-6">
                <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">RL Integration</div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">RL 학습과의 통합</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  <InlineMath math="r" />개의 응답은 위 방법으로 생성하고,
                  나머지 <InlineMath math="G - r" />개의 응답은 기존 random sampling으로 생성하여
                  RL 학습에 활용합니다. 이를 통해 효율적 탐색과 다양성을 동시에 확보합니다.
                </p>
              </div>

              <div className="insight">
                <div className="insight-title">Key Insight</div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  모델이 이미 답을 알고 있다면 계속 &ldquo;생각&rdquo;하게 하는 것은 비효율적입니다.
                  <strong> <code>&lt;/think&gt;</code> 토큰의 랭킹</strong>을 모니터링하여
                  추론을 조기 종료하면 품질 손실 없이 연산을 크게 절약할 수 있습니다.
                </p>
              </div>
            </section>

            {/* ============================================= */}
            {/* Section 5: Long CoT의 위상 구조                */}
            {/* ============================================= */}
            <section id="topology" className="section-card transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <span className="badge badge-rose">Structure</span>
                <span className="text-sm text-slate-400">Section 5</span>
              </div>

              <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">5. Long CoT의 위상 구조</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 italic">
                Chen, Q. et al., &ldquo;The Molecular Structure of Thought: Mapping the Topology of Long CoT Reasoning,&rdquo; arXiv:2601.06002, 2026.
              </p>
              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                Long CoT는 단순한 선형 체인이 아닙니다. 성공적인 추론에는
                <strong> 세 가지 유형의 구조적 결합(bond)</strong>이 존재하며,
                이 위상(topology)이 추론 성패를 결정합니다.
              </p>

              <div id="topology-bonds" className="concept-card mb-6">
                <div className="text-xs font-semibold text-rose-600 dark:text-rose-400 mb-1">Three Bond Types</div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-3">세 가지 Bond 유형</h3>
                <div className="grid gap-4 text-sm">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded text-xs font-bold">Deep Reasoning</span>
                      <span className="text-slate-400 dark:text-slate-500 text-xs">핵심 논리 골격</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">
                      단계 간 강한 의존성을 가진 핵심 논리적 추론 체인입니다.
                      이전 단계의 결론이 다음 단계의 전제가 되는 연쇄 구조를 형성합니다.
                    </p>
                    <div className="mt-2 font-mono text-xs text-blue-600 dark:text-blue-400">
                      Step A → Step B → Step C (강한 의존)
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border-l-4 border-amber-500">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 rounded text-xs font-bold">Self-Reflection</span>
                      <span className="text-slate-400 dark:text-slate-500 text-xs">자기 검증</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">
                      이전 단계를 재방문하여 추론을 검증하거나 수정합니다.
                      &ldquo;잠깐, 이게 맞나?&rdquo; 같은 자기 점검 과정입니다.
                    </p>
                    <div className="mt-2 font-mono text-xs text-amber-600 dark:text-amber-400">
                      Step D → [재검토: Step B] → Step E (수정된 추론)
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border-l-4 border-emerald-500">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200 rounded text-xs font-bold">Self-Exploration</span>
                      <span className="text-slate-400 dark:text-slate-500 text-xs">대안 탐색</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">
                      대안적 경로를 탐색하고 먼 아이디어를 연결합니다.
                      &ldquo;다른 접근법으로도 생각해보면...&rdquo; 같은 발산적 사고입니다.
                    </p>
                    <div className="mt-2 font-mono text-xs text-emerald-600 dark:text-emerald-400">
                      Step F → [대안: Step G&apos;] → 비교 → Step H (최선 선택)
                    </div>
                  </div>
                </div>
              </div>

              <div className="concept-card mb-6">
                <div className="text-xs font-semibold text-violet-600 dark:text-violet-400 mb-1">Key Finding</div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">구조가 성패를 결정한다</h3>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <strong className="text-green-800 dark:text-green-300">성공적 추론</strong>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                      세 bond 유형의 균형 잡힌 분포. Deep Reasoning이 골격이 되고,
                      Self-Reflection과 Self-Exploration이 보완.
                    </p>
                  </div>
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <strong className="text-red-800 dark:text-red-300">실패한 추론</strong>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                      bond 구조의 불균형. Deep Reasoning 없이 Self-Exploration만 반복하거나,
                      Self-Reflection 없이 오류가 누적.
                    </p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">
                  다른 모델들도 같은 유형의 task에서 유사한 추론 topology를 보입니다.
                  <strong> 추론의 성패는 표면적 키워드가 아닌 bond 구조에 의해 결정</strong>됩니다.
                </p>
              </div>

              <div id="topology-molesyn" className="concept-card mb-6">
                <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">Mole-Syn</div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Mole-Syn: 합성 데이터 생성</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  강한 추론 LLM의 <strong>transition probability graph</strong>에서
                  random walk를 수행하여 추론 토폴로지를 합성합니다.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-200 dark:bg-indigo-800 text-xs font-bold text-indigo-700 dark:text-indigo-300">1</span>
                    <p className="text-slate-600 dark:text-slate-400">
                      강한 LLM의 추론 trace에서 behavior transition graph 구축
                    </p>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-200 dark:bg-indigo-800 text-xs font-bold text-indigo-700 dark:text-indigo-300">2</span>
                    <p className="text-slate-600 dark:text-slate-400">
                      Random walk로 behavior sequence 샘플링 (behavior-specific prompts 활용)
                    </p>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-200 dark:bg-indigo-800 text-xs font-bold text-indigo-700 dark:text-indigo-300">3</span>
                    <p className="text-slate-600 dark:text-slate-400">
                      Distillation에 근접한 성능을 낮은 비용으로 달성
                    </p>
                  </div>
                </div>
              </div>

              <div className="insight">
                <div className="insight-title">Key Insight</div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Long CoT의 품질은 길이가 아니라 <strong>위상 구조</strong>에 달려있습니다.
                  Deep Reasoning, Self-Reflection, Self-Exploration의 세 bond가
                  균형 있게 배합될 때 강한 추론이 가능하며, SFT는 표면이 아닌 이 구조를 학습합니다.
                </p>
              </div>
            </section>

            {/* ============================================= */}
            {/* Section 6: 종합 정리                           */}
            {/* ============================================= */}
            <section id="conclusion" className="section-card transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <span className="badge badge-amber">Summary</span>
                <span className="text-sm text-slate-400">Section 6</span>
              </div>

              <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">6. 종합 정리</h2>

              <div className="overflow-x-auto mb-6">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-300 dark:border-slate-600">
                      <th className="text-left py-3 px-3 text-slate-700 dark:text-slate-300 font-bold">주제</th>
                      <th className="text-left py-3 px-3 text-slate-700 dark:text-slate-300 font-bold">핵심 질문</th>
                      <th className="text-left py-3 px-3 text-slate-700 dark:text-slate-300 font-bold">핵심 답변</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-600 dark:text-slate-400">
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <td className="py-3 px-3 font-medium text-amber-700 dark:text-amber-400">CoT 길이</td>
                      <td className="py-3 px-3">얼마나 길게?</td>
                      <td className="py-3 px-3">역 U자 곡선 &mdash; 난이도별 최적 길이 존재</td>
                    </tr>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <td className="py-3 px-3 font-medium text-emerald-700 dark:text-emerald-400">추론 노력</td>
                      <td className="py-3 px-3">진짜 생각하는가?</td>
                      <td className="py-3 px-3">DTR로 deep-thinking 비율 측정</td>
                    </tr>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <td className="py-3 px-3 font-medium text-purple-700 dark:text-purple-400">조기 종료</td>
                      <td className="py-3 px-3">언제 멈출까?</td>
                      <td className="py-3 px-3">&lt;/think&gt; 토큰 랭킹으로 탐색 종료</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3 font-medium text-rose-700 dark:text-rose-400">위상 구조</td>
                      <td className="py-3 px-3">어떤 구조인가?</td>
                      <td className="py-3 px-3">3 bond (Deep/Reflection/Exploration) 균형</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                <h3 className="font-bold text-amber-800 dark:text-amber-300 mb-3">Takeaway</h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  CoT reasoning의 연구는 &ldquo;LLM에게 생각하게 만들기&rdquo;에서
                  &ldquo;<strong>효율적으로, 적절한 깊이로, 올바른 구조로</strong> 생각하게 만들기&rdquo;로 진화하고 있습니다.
                  단순히 CoT를 유도하는 것을 넘어, 최적 길이 제어, 내부 연산 깊이 측정,
                  조기 종료, 구조적 위상 학습까지 &mdash; 이 모든 것이 LLM 추론의 실용적 배포를 위한
                  핵심 연구 방향입니다.
                </p>
              </div>
            </section>
          </div>

          {/* Back to top */}
          {showBackToTop && (
            <button
              onClick={scrollToTop}
              className="fixed bottom-8 right-8 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-amber-600 text-white shadow-lg hover:bg-amber-700 transition"
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
