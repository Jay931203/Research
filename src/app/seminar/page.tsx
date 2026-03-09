'use client';

import Link from 'next/link';
import Header from '@/components/layout/Header';
import CommandPalette from '@/components/common/CommandPalette';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

const seminars = [
  {
    id: 'kv-cache',
    title: 'KV-Cache Communication for Multi-Agent Systems',
    subtitle: '4 main papers / 3 interactive demos',
    color: 'teal',
    gradient: 'from-teal-500 to-cyan-600',
    hoverBorder: 'hover:border-teal-300 dark:hover:border-teal-600',
    linkColor: 'text-teal-600',
    date: '2025',
    topics: [
      { color: 'bg-blue-400', label: 'Latent MAS: KV cache로 에이전트 간 소통' },
      { color: 'bg-amber-400', label: 'KVComm: 효율적인 layer 선택' },
      { color: 'bg-red-400', label: 'Cache-2-Cache: 이기종 모델 간 KV 변환' },
      { color: 'bg-emerald-400', label: 'SnapKV: KV cache 압축' },
      { color: 'bg-violet-400', label: 'BERT structure & FF as KV memory (참고)' },
    ],
  },
];

export default function SeminarListPage() {
  const { isCommandPaletteOpen, openCommandPalette, closeCommandPalette } = useKeyboardShortcuts();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <Header onSearchClick={openCommandPalette} />

      <main className="flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          {/* Hero */}
          <div className="mb-12 text-center">
            <p className="mb-3 inline-flex rounded-full border border-teal-200/80 bg-white/90 px-3 py-1 text-xs font-semibold tracking-[0.14em] text-teal-600 shadow-sm backdrop-blur dark:border-teal-800 dark:bg-slate-900/70 dark:text-teal-300">
              PAPER SEMINARS
            </p>
            <h1 className="text-3xl font-black leading-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
              논문 세미나
            </h1>
            <p className="mt-2 text-base text-slate-500 dark:text-slate-400">
              연구 세미나에서 다룬 논문들을 정리합니다.
            </p>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              각 세미나별로 핵심 논문의 motivation, 방법론, 실험 결과를 인터랙티브 시각화와 함께 학습합니다.
              수식 유도, 직관적 설명, 논문 간 관계를 한 곳에서 확인할 수 있습니다.
            </p>
          </div>

          {/* Seminar cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {seminars.map((sem) => (
              <Link
                key={sem.id}
                href={`/seminar/${sem.id}`}
                className={`group block rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl dark:border-slate-700 dark:bg-slate-800 ${sem.hoverBorder}`}
              >
                <div className="mb-5 flex items-center gap-3">
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${sem.gradient} text-lg font-bold text-white shadow-sm`}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                  </span>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800 transition-colors group-hover:text-teal-700 dark:text-slate-100 dark:group-hover:text-teal-400">
                      {sem.title}
                    </h2>
                    <p className="text-sm text-slate-400 dark:text-slate-500">{sem.subtitle}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                  {sem.topics.map((topic, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className={`h-1.5 w-1.5 rounded-full ${topic.color}`} />
                      {topic.label}
                    </div>
                  ))}
                </div>

                <div
                  className={`mt-6 inline-flex items-center gap-1 text-sm font-medium ${sem.linkColor} transition-transform group-hover:translate-x-1 dark:text-teal-400`}
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

            {/* Placeholder for future seminars */}
            <div className="flex items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-8 dark:border-slate-700 dark:bg-slate-800/30">
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700">
                  <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-slate-400 dark:text-slate-500">
                  다음 세미나 준비 중
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <CommandPalette isOpen={isCommandPaletteOpen} onClose={closeCommandPalette} />
    </div>
  );
}
