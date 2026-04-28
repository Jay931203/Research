'use client';

import Link from 'next/link';
import { useCallback, useState, useEffect } from 'react';
import { TableOfContents, type TocItem } from '@/components/tse/navigation';
import Section1AWGNCapacity from './Section1AWGNCapacity';
import Section2Resources from './Section2Resources';
import Section3LTIChannels from './Section3LTIChannels';
import Section4FadingCapacity from './Section4FadingCapacity';
import Section5MainPlot from './Section5MainPlot';
import Section6AppendixC from './Section6AppendixC';

const tocItems: TocItem[] = [
  { id: 'awgn-capacity', label: '5.1 AWGN Channel Capacity', level: 1 },
  { id: 'repetition-coding-cap', label: 'Repetition Coding', level: 2 },
  { id: 'sphere-packing-cap', label: 'Sphere Packing Argument', level: 2 },
  { id: 'capacity-achieving-codes', label: 'Capacity-Achieving Codes', level: 2 },
  { id: 'reliable-rate-summary', label: 'Reliable Rate Summary', level: 2 },
  { id: 'capacity-calculator', label: 'Capacity Calculator', level: 2 },
  { id: 'resources', label: '5.2 Resources of AWGN Channel', level: 1 },
  { id: 'continuous-time', label: 'Continuous-time AWGN', level: 2 },
  { id: 'power-bandwidth', label: 'Power & Bandwidth', level: 2 },
  { id: 'bandwidth-reuse', label: 'Bandwidth Reuse Example', level: 2 },
  { id: 'regime-toggle', label: 'Regime Toggle', level: 2 },
  { id: 'lti-channels', label: '5.3 LTI Gaussian Channels', level: 1 },
  { id: 'simo-capacity', label: 'SIMO Channel', level: 2 },
  { id: 'simo-sufficient-statistics', label: 'SIMO Sufficient Statistics', level: 2 },
  { id: 'miso-capacity', label: 'MISO Channel', level: 2 },
  { id: 'miso-scalar-reduction', label: 'MISO Scalar Reduction', level: 2 },
  { id: 'freq-selective-capacity', label: 'Frequency-Selective', level: 2 },
  { id: 'waterfilling', label: 'Waterfilling', level: 2 },
  { id: 'fading-capacity', label: '5.4 Capacity of Fading Channels', level: 1 },
  { id: 'slow-fading', label: 'Slow Fading', level: 2 },
  { id: 'fast-fading', label: 'Fast Fading', level: 2 },
  { id: 'tx-side-info', label: 'Transmitter Side Info', level: 2 },
  { id: 'fading-diversity', label: 'Diversity & Capacity', level: 2 },
  { id: 'ch5-main-plot', label: '5.5 Chapter 5 Main Plot', level: 1 },
  { id: 'capacity-design-chain', label: 'Capacity Design Chain', level: 2 },
  { id: 'ch5-completion-check', label: 'Completion Check', level: 2 },
  { id: 'appendix-c', label: 'Appendix C', level: 1 },
  { id: 'appendix-c1', label: 'C.1 Waterfilling Derivation', level: 2 },
  { id: 'appendix-c2', label: 'C.2 Outage vs Ergodic', level: 2 },
  { id: 'appendix-c3', label: 'C.3 Channel Inversion', level: 2 },
];

export default function Chapter5Page() {
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
      el.classList.add('ring-2', 'ring-purple-400', 'ring-offset-2');
      setTimeout(() => {
        el.classList.remove('ring-2', 'ring-purple-400', 'ring-offset-2');
      }, 2000);
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
          className="h-full bg-gradient-to-r from-purple-500 to-violet-500 transition-[width] duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Fixed TOC sidebar — completely independent from main content scroll */}
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
        <aside className="hidden lg:block fixed left-0 top-[4rem] w-64 h-[calc(100vh-4rem)] z-30 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 overflow-y-auto">
          <div className="pt-6 pb-8 px-2">
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
                  className="h-full bg-purple-500 rounded-full transition-[width] duration-150"
                  style={{ width: `${scrollProgress}%` }}
                />
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* Main content — offset by sidebar width, scrolls independently */}
      <main className={`tse-content min-h-screen py-8 px-4 lg:px-8 ${sidebarOpen ? 'lg:ml-64' : ''}`}>
        <div className="max-w-4xl mx-auto">
          {/* Chapter hero */}
          <div className="mb-8 p-8 bg-gradient-to-br from-purple-600 to-violet-700 rounded-2xl text-white">
            <div className="text-purple-200 text-sm font-medium mb-2">Chapter 5</div>
            <h1 className="text-4xl font-bold mb-3">Capacity of Wireless Channels</h1>
            <p className="text-purple-100 text-lg leading-relaxed max-w-2xl">
              AWGN 채널의 용량 개념에서 출발해 전력-대역폭 트레이드오프를 이해하고,
              주파수 선택적 채널의 워터필링 최적화를 거쳐 페이딩 채널의 다양한 용량 정의를 학습합니다.
            </p>
            <div className="flex flex-wrap gap-3 mt-5">
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">AWGN Capacity</span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Power-Bandwidth</span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Waterfilling</span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Slow Fading</span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Fast Fading</span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Appendix C</span>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-8">
            <Section1AWGNCapacity onNavigate={handleNavigate} />
            <Section2Resources onNavigate={handleNavigate} />
            <Section3LTIChannels onNavigate={handleNavigate} />
            <Section4FadingCapacity onNavigate={handleNavigate} />
            <Section5MainPlot onNavigate={handleNavigate} />
            <Section6AppendixC onNavigate={handleNavigate} />
          </div>

          {/* Chapter complete */}
          <div className="mt-12 p-8 bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-2xl">
            <h2 className="text-2xl font-bold text-purple-800 mb-2 text-center">Chapter 5 마무리</h2>
            <p className="text-purple-600 mb-6 text-center">
              AWGN 용량에서 페이딩 채널 용량까지, 무선 채널의 정보 이론적 한계를 학습했습니다.
              아래 체크리스트로 스스로 점검해보세요.
            </p>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white/70 rounded-xl p-4 border border-purple-200">
                <h3 className="font-bold text-purple-800 text-sm mb-3">학습 성과 체크리스트</h3>
                <ul className="text-sm text-slate-700 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-0.5">&#10003;</span>
                    <span>Shannon capacity 공식의 의미와 한계를 설명할 수 있다</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-0.5">&#10003;</span>
                    <span>Power-limited와 bandwidth-limited regime의 차이를 구분할 수 있다</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-0.5">&#10003;</span>
                    <span>워터필링 전력 배분의 원리를 설명할 수 있다</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-0.5">&#10003;</span>
                    <span>Outage capacity와 ergodic capacity의 차이를 설명할 수 있다</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-0.5">&#10003;</span>
                    <span>송신기 CSI가 용량에 미치는 영향을 정량화할 수 있다</span>
                  </li>
                </ul>
              </div>
              <div className="bg-white/70 rounded-xl p-4 border border-purple-200">
                <h3 className="font-bold text-purple-800 text-sm mb-3">핵심 수식 요약</h3>
                <div className="text-xs text-slate-600 space-y-2 font-mono">
                  <div className="p-2 bg-purple-50 rounded"><strong>Shannon:</strong> C = W log&#8322;(1 + P/N&#8320;W)</div>
                  <div className="p-2 bg-purple-50 rounded"><strong>Waterfilling:</strong> P&#7522; = (&mu; &minus; 1/|h&#7522;|&sup2;)&#8314;</div>
                  <div className="p-2 bg-purple-50 rounded"><strong>Outage:</strong> P(C &lt; R) = &epsilon;</div>
                  <div className="p-2 bg-purple-50 rounded"><strong>Ergodic:</strong> E[log(1 + SNR|h|&sup2;)]</div>
                  <div className="p-2 bg-purple-50 rounded"><strong>Ch. Inversion:</strong> E[1/|h|&sup2;]</div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <button onClick={() => handleNavigate('awgn-capacity')} className="px-4 py-2 bg-white border border-purple-300 rounded-lg text-purple-700 hover:bg-purple-50 transition text-sm">
                처음으로 돌아가기
              </button>
              <button onClick={() => handleNavigate('ch5-main-plot')} className="px-4 py-2 bg-white border border-purple-300 rounded-lg text-purple-700 hover:bg-purple-50 transition text-sm">
                Main Plot 다시 보기
              </button>
              <Link href="/tse/3" className="px-4 py-2 bg-white border border-emerald-300 rounded-lg text-emerald-700 hover:bg-emerald-50 transition text-sm">
                Chapter 3 복습하기
              </Link>
              <Link href="/tse/2" className="px-4 py-2 bg-white border border-blue-300 rounded-lg text-blue-700 hover:bg-blue-50 transition text-sm">
                Chapter 2 복습하기
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Back to top button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
          aria-label="Back to top"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      )}
    </div>
  );
}
