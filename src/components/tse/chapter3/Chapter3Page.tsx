'use client';

import { useCallback, useState, useEffect } from 'react';
import { TableOfContents, type TocItem } from '@/components/tse/navigation';
import Section0AppendixA from './Section0AppendixA';
import Section1Detection from './Section1Detection';
import Section2TimeDiversity from './Section2TimeDiversity';
import Section3AntennaDiversity from './Section3AntennaDiversity';
import Section4FrequencyDiversity from './Section4FrequencyDiversity';
import Section5ChannelUncertainty from './Section5ChannelUncertainty';
import Section6MainPlot from './Section6MainPlot';
import Section7AppendixB from './Section7AppendixB';

const tocItems: TocItem[] = [
  { id: 'appendix-a', label: 'Appendix A.2~A.3', level: 1 },
  { id: 'appendix-a2', label: 'A.2 Detection (Gaussian)', level: 2 },
  { id: 'appendix-a2-1', label: 'A.2.1 Scalar Detection', level: 2 },
  { id: 'appendix-a2-2', label: 'A.2.2 Vector Detection', level: 2 },
  { id: 'appendix-a2-3', label: 'A.2.3 Complex Vector', level: 2 },
  { id: 'appendix-a3', label: 'A.3 Estimation (Gaussian)', level: 2 },
  { id: 'appendix-a3-1', label: 'A.3.1 Scalar Estimation', level: 2 },
  { id: 'appendix-a3-2', label: 'A.3.2 Vector Estimation', level: 2 },
  { id: 'appendix-a3-3', label: 'A.3.3 Complex Estimation', level: 2 },
  { id: 'detection', label: '3.1 Detection in Fading', level: 1 },
  { id: 'noncoherent-detection', label: '3.1.1 Noncoherent', level: 2 },
  { id: 'coherent-ml', label: '3.1.2 Coherent Detection', level: 2 },
  { id: 'bpsk-qpsk', label: '3.1.3 BPSK → QPSK', level: 2 },
  { id: 'diversity-motivation', label: '3.1.4 Diversity Motivation', level: 2 },
  { id: 'awgn-fading-pe-chart', label: 'Pe Comparison (Interactive)', level: 2 },
  { id: 'deep-fade-calculator', label: 'Deep Fade Calculator', level: 2 },
  { id: 'rayleigh-pe-formulas', label: 'Pe Formulas & Chart', level: 2 },
  { id: 'diversity-order-calculator', label: 'Diversity Order Calculator', level: 2 },
  { id: 'time-diversity', label: '3.2 Time Diversity', level: 1 },
  { id: 'repetition-coding', label: 'Repetition & MRC', level: 2 },
  { id: 'coding-beyond-repetition', label: 'Coding Beyond Repetition', level: 2 },
  { id: 'rotation-code', label: 'Rotation Code', level: 2 },
  { id: 'interleaving', label: 'Interleaving', level: 2 },
  { id: 'antenna-diversity', label: '3.3 Antenna Diversity', level: 1 },
  { id: 'simo', label: 'SIMO & MRC', level: 2 },
  { id: 'alamouti', label: 'Alamouti (MISO)', level: 2 },
  { id: 'mimo-preview', label: '2×2 MIMO Preview', level: 2 },
  { id: 'frequency-diversity', label: '3.4 Frequency Diversity', level: 1 },
  { id: 'freq-selective-model', label: 'Freq-Selective Model', level: 2 },
  { id: 'equalization', label: 'Equalization', level: 2 },
  { id: 'rake-receiver', label: 'Rake Receiver', level: 2 },
  { id: 'ofdm-diversity', label: 'OFDM', level: 2 },
  { id: 'channel-uncertainty', label: '3.5 Channel Uncertainty', level: 1 },
  { id: 'pilot-estimation', label: 'Pilot Estimation', level: 2 },
  { id: 'effective-snr', label: 'Effective SNR', level: 2 },
  { id: 'coherent-vs-noncoherent', label: 'Coherent vs Noncoherent', level: 2 },
  { id: 'ch3-main-plot', label: '3.6 Chapter 3 Main Plot', level: 1 },
  { id: 'five-step-chain', label: '5-Step Design Chain', level: 2 },
  { id: 'design-chain-synthesizer', label: 'Design Chain Synthesizer', level: 2 },
  { id: 'ch3-completion-check', label: 'Completion Check', level: 2 },
  { id: 'appendix-b', label: 'Appendix B.1~B.5', level: 1 },
  { id: 'appendix-b1', label: 'B.1 DMC', level: 2 },
  { id: 'appendix-b2', label: 'B.2 Entropy & MI', level: 2 },
  { id: 'appendix-b3', label: 'B.3 Coding Theorem', level: 2 },
  { id: 'appendix-b4', label: 'B.4 AWGN Capacity', level: 2 },
  { id: 'appendix-b5', label: 'B.5 Sphere Packing', level: 2 },
];

export default function Chapter3Page() {
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
      el.classList.add('ring-2', 'ring-emerald-400', 'ring-offset-2');
      setTimeout(() => {
        el.classList.remove('ring-2', 'ring-emerald-400', 'ring-offset-2');
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
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-[width] duration-150"
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
                  className="h-full bg-emerald-500 rounded-full transition-[width] duration-150"
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
          <div className="mb-8 p-8 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl text-white">
            <div className="text-emerald-200 text-sm font-medium mb-2">Chapter 3</div>
            <h1 className="text-4xl font-bold mb-3">Point-to-Point Communication</h1>
            <p className="text-emerald-100 text-lg leading-relaxed max-w-2xl">
              페이딩 채널에서 어떻게 신뢰할 수 있는 통신을 만드는지 다룹니다.
              검출 기초에서 출발해 시간/공간/주파수 다이버시티를 설계하고,
              채널 불확실성까지 고려한 실전 체크리스트를 완성합니다.
            </p>
            <div className="flex flex-wrap gap-3 mt-5">
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Detection</span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Time Diversity</span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Antenna Diversity</span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Frequency Diversity</span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Channel Uncertainty</span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Appendix A Detection & Estimation</span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Appendix B Info Theory</span>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-8">
            <Section0AppendixA onNavigate={handleNavigate} />
            <Section1Detection onNavigate={handleNavigate} />
            <Section2TimeDiversity onNavigate={handleNavigate} />
            <Section3AntennaDiversity onNavigate={handleNavigate} />
            <Section4FrequencyDiversity onNavigate={handleNavigate} />
            <Section5ChannelUncertainty onNavigate={handleNavigate} />
            <Section6MainPlot onNavigate={handleNavigate} />
            <Section7AppendixB onNavigate={handleNavigate} />
          </div>

        </div>
      </main>

      {/* Back to top button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
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
