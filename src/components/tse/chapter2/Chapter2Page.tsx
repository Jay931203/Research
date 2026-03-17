'use client';

import { useCallback, useState, useEffect } from 'react';
import { TableOfContents, type TocItem } from '@/components/tse/navigation';
import Section1Introduction from './Section1Introduction';
import Section2IOModel from './Section2IOModel';
import Section2Multipath from './Section2Multipath';
import Section3Parameters from './Section3Parameters';
import Section4Statistical from './Section4Statistical';
import Section5Capacity from './Section5Capacity';
import Section6AppendixA from './Section6AppendixA';

const tocItems: TocItem[] = [
  { id: 'intro', label: '2.1 Physical Modeling', level: 1 },
  { id: 'free-space-model', label: 'Free-space & Friis', level: 2 },
  { id: 'moving-antenna-model', label: 'Moving Antenna & Doppler', level: 2 },
  { id: 'wall-reflection-model', label: 'Reflecting Wall', level: 2 },
  { id: 'shadowing-model', label: 'Distance Decay & Shadowing', level: 2 },
  { id: 'io-model', label: '2.2 입력-출력(I/O) 모델', level: 1 },
  { id: 'ltv-model', label: 'LTV Model', level: 2 },
  { id: 'baseband-model', label: 'Baseband Equivalent', level: 2 },
  { id: 'discrete-model', label: 'Discrete-Time Model', level: 2 },
  { id: 'awgn-model', label: 'AWGN Baseline', level: 2 },
  { id: 'multipath', label: '2.2+ Multipath & Doppler Intuition', level: 1 },
  { id: 'doppler', label: 'Doppler Spread Intuition', level: 2 },
  { id: 'parameters', label: '2.3 Time/Frequency Coherence', level: 1 },
  { id: 'delay-spread', label: 'Delay Spread Td', level: 2 },
  { id: 'coherence-bw', label: 'Coherence BW', level: 2 },
  { id: 'doppler-spread', label: 'Doppler Spread', level: 2 },
  { id: 'coherence-time', label: 'Coherence Time', level: 2 },
  { id: 'underspread', label: 'Underspread', level: 2 },
  { id: 'lte-example', label: 'LTE Check Example', level: 2 },
  { id: 'statistical', label: '2.4 Statistical Models', level: 1 },
  { id: 'k-factor', label: 'K-Factor', level: 2 },
  { id: 'tap-autocorr', label: 'Tap Autocorrelation', level: 2 },
  { id: 'outage-prob', label: 'Outage Probability', level: 2 },
  { id: 'main-plot', label: '2.5 Chapter 2 Main Plot', level: 1 },
  { id: 'main-plot-lab', label: 'Main Plot Synthesizer', level: 2 },
  { id: 'appendix-a', label: 'Appendix A.1~A.3', level: 1 },
  { id: 'appendix-a1', label: 'A.1 Gaussian', level: 2 },
  { id: 'appendix-a2', label: 'A.2 Detection', level: 2 },
  { id: 'appendix-a3', label: 'A.3 Estimation', level: 2 },
];

export default function Chapter2Page() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  // Scroll progress tracking
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
      el.classList.add('ring-2', 'ring-blue-400', 'ring-offset-2');
      setTimeout(() => {
        el.classList.remove('ring-2', 'ring-blue-400', 'ring-offset-2');
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
          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-[width] duration-150"
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
            {/* Progress indicator */}
            <div className="mt-6 px-3">
              <div className="text-xs text-slate-400 dark:text-slate-500 mb-1">{Math.round(scrollProgress)}% complete</div>
              <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-[width] duration-150"
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
          <div className="mb-8 p-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl text-white">
            <div className="text-blue-200 text-sm font-medium mb-2">Chapter 2</div>
            <h1 className="text-4xl font-bold mb-3">The Wireless Channel</h1>
            <p className="text-blue-100 text-lg leading-relaxed max-w-2xl">
              무선 채널이 왜 복잡한지, 그리고 그 복잡함을 어떻게 다루는지 함께 살펴봅니다.
              물리 현상에서 출발해 수신기 이론까지, 각 단계를 따라가면 전체 그림이 자연스럽게 연결됩니다.
            </p>
            <div className="flex flex-wrap gap-3 mt-5">
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Physical Propagation</span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">LTV/Baseband I-O</span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Coherence Parameters</span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Statistical Fading</span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Chapter 2 Main Plot</span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Appendix Detection/Estimation</span>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-8">
            <Section1Introduction onNavigate={handleNavigate} />
            <Section2IOModel onNavigate={handleNavigate} />
            <Section2Multipath onNavigate={handleNavigate} />
            <Section3Parameters onNavigate={handleNavigate} />
            <Section4Statistical onNavigate={handleNavigate} />
            <Section5Capacity onNavigate={handleNavigate} />
            <Section6AppendixA onNavigate={handleNavigate} />
          </div>
        </div>
      </main>

      {/* Back to top button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
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
