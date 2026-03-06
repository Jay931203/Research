'use client';

import Link from 'next/link';
import Header from '@/components/layout/Header';
import CommandPalette from '@/components/common/CommandPalette';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

const chapters = [
  {
    id: 2,
    title: 'The Wireless Channel',
    subtitle: '7 sections / 11 interactive labs',
    color: 'blue',
    gradient: 'from-blue-500 to-indigo-600',
    hoverBorder: 'hover:border-blue-300 dark:hover:border-blue-600',
    linkColor: 'text-blue-600',
    topics: [
      { color: 'bg-cyan-400', label: '물리 전파 모델링과 Two-Ray 지면 반사' },
      { color: 'bg-blue-400', label: '입출력 기저대역 모델과 자유도' },
      { color: 'bg-purple-400', label: '다중경로 페이딩과 도플러 확산' },
      { color: 'bg-emerald-400', label: '코히어런스 파라미터와 Underspread 조건' },
      { color: 'bg-red-400', label: 'Rayleigh/Rician 분포와 Clarke/Jakes 모델' },
      { color: 'bg-amber-400', label: 'Appendix A 검출과 추정 이론' },
    ],
  },
  {
    id: 3,
    title: 'Point-to-Point Communication',
    subtitle: '11 sections / Detection & Diversity',
    color: 'emerald',
    gradient: 'from-emerald-500 to-teal-600',
    hoverBorder: 'hover:border-emerald-300 dark:hover:border-emerald-600',
    linkColor: 'text-emerald-600',
    topics: [
      { color: 'bg-emerald-400', label: 'Rayleigh 채널에서의 Coherent/Noncoherent 검출' },
      { color: 'bg-teal-400', label: '시간/공간/주파수 다이버시티 설계' },
      { color: 'bg-cyan-400', label: '채널 불확실성과 Effective SNR' },
      { color: 'bg-sky-400', label: 'Appendix B.1~B.5 정보이론 기초' },
    ],
  },
  {
    id: 5,
    title: 'Capacity of Wireless Channels',
    subtitle: '6 sections / Capacity & Waterfilling',
    color: 'purple',
    gradient: 'from-purple-500 to-violet-600',
    hoverBorder: 'hover:border-purple-300 dark:hover:border-purple-600',
    linkColor: 'text-purple-600',
    topics: [
      { color: 'bg-purple-400', label: 'AWGN 채널 용량과 Shannon 한계' },
      { color: 'bg-violet-400', label: '전력-대역폭 트레이드오프' },
      { color: 'bg-fuchsia-400', label: 'SIMO/MISO 채널과 워터필링' },
      { color: 'bg-pink-400', label: '페이딩 채널 용량: Outage vs Ergodic' },
    ],
  },
];

export default function TseSeminarPage() {
  const { isCommandPaletteOpen, openCommandPalette, closeCommandPalette } = useKeyboardShortcuts();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <Header onSearchClick={openCommandPalette} />

      <main className="flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          {/* Hero */}
          <div className="mb-12 text-center">
            <p className="mb-3 inline-flex rounded-full border border-indigo-200/80 bg-white/90 px-3 py-1 text-xs font-semibold tracking-[0.14em] text-indigo-600 shadow-sm backdrop-blur dark:border-indigo-800 dark:bg-slate-900/70 dark:text-indigo-300">
              TSE SEMINAR
            </p>
            <h1 className="text-3xl font-black leading-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
              Tse 세미나
            </h1>
            <p className="mt-2 text-base text-slate-500 dark:text-slate-400">
              David Tse &mdash; Fundamentals of Wireless Communication
            </p>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              무선 채널 모델링부터 점대점 통신, 채널 용량까지 &mdash;
              무선통신의 핵심 이론을 인터랙티브 시각화와 함께 학습합니다.
              각 챕터는 수식 유도, 직관적 설명, 실시간 파라미터 조작 실험을 포함합니다.
            </p>
          </div>

          {/* Chapter cards */}
          <div className="grid gap-6 md:grid-cols-3">
            {chapters.map((ch) => (
              <Link
                key={ch.id}
                href={`/tse/${ch.id}`}
                className={`group block rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl dark:border-slate-700 dark:bg-slate-800 ${ch.hoverBorder}`}
              >
                <div className="mb-5 flex items-center gap-3">
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${ch.gradient} text-lg font-bold text-white shadow-sm`}
                  >
                    {ch.id}
                  </span>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 transition-colors group-hover:text-blue-700 dark:text-slate-100 dark:group-hover:text-blue-400">
                      {ch.title}
                    </h2>
                    <p className="text-sm text-slate-400 dark:text-slate-500">{ch.subtitle}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                  {ch.topics.map((topic, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className={`h-1.5 w-1.5 rounded-full ${topic.color}`} />
                      {topic.label}
                    </div>
                  ))}
                </div>

                <div
                  className={`mt-6 inline-flex items-center gap-1 text-sm font-medium ${ch.linkColor} transition-transform group-hover:translate-x-1 dark:text-blue-400`}
                >
                  학습 시작
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <CommandPalette isOpen={isCommandPaletteOpen} onClose={closeCommandPalette} />
    </div>
  );
}
