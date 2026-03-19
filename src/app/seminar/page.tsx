'use client';

import Link from 'next/link';
import Header from '@/components/layout/Header';
import CommandPalette from '@/components/common/CommandPalette';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

interface PaperRef {
  authors: string;
  title: string;
  venue: string;
  year: number;
}

interface SeminarEntry {
  date: string;        // YYMMDD
  displayDate: string; // 표시용
  slug: string;        // URL path
  title: string;
  papers: number;
  demos: number;
  tags: string[];
  color: string;       // gradient
  references: PaperRef[];
}

const labSeminars: SeminarEntry[] = [
  {
    date: '260319',
    displayDate: '2026. 03. 19',
    slug: 'chain-of-thought',
    title: 'Chain-of-Thought Reasoning',
    papers: 5,
    demos: 0,
    tags: ['CoT Prompting', 'Optimal Length', 'DTR Metric', 'Early Stopping', 'Topology'],
    color: 'from-amber-500 to-orange-600',
    references: [
      { authors: 'Wei et al.', title: 'Chain-of-Thought Prompting Elicits Reasoning in Large Language Models', venue: 'NeurIPS', year: 2022 },
      { authors: 'Wu et al.', title: 'When More is Less: Understanding Chain-of-Thought Length in LLMs', venue: 'arXiv:2502.07266', year: 2025 },
      { authors: 'Chen, W.-L. et al.', title: 'Think Deep, Not Just Long: Measuring LLM Reasoning Effort via Deep-Thinking Tokens', venue: 'arXiv:2602.13517', year: 2026 },
      { authors: 'Huang et al.', title: 'Does Your Reasoning Model Implicitly Know When to Stop Thinking?', venue: 'arXiv:2602.08354', year: 2026 },
      { authors: 'Chen, Q. et al.', title: 'The Molecular Structure of Thought: Mapping the Topology of Long CoT Reasoning', venue: 'arXiv:2601.06002', year: 2026 },
    ],
  },
  {
    date: '260310',
    displayDate: '2026. 03. 10',
    slug: 'kv-cache',
    title: 'KV-Cache Communication for Multi-Agent Systems',
    papers: 4,
    demos: 3,
    tags: ['Latent MAS', 'KVComm', 'Cache-2-Cache', 'SnapKV'],
    color: 'from-teal-500 to-cyan-600',
    references: [
      { authors: 'Zou et al.', title: 'Latent Collaboration in Multi-Agent Systems', venue: 'arXiv:2511.20639', year: 2025 },
      { authors: 'Shi et al.', title: 'KVComm: Enabling Efficient LLM Communication through Selective KV Sharing', venue: 'ICLR', year: 2026 },
      { authors: 'Fu et al.', title: 'Cache-to-Cache: Direct Semantic Communication Between Large Language Models', venue: 'ICLR', year: 2026 },
      { authors: 'Li et al.', title: 'SnapKV: LLM Knows What You Are Looking For Before Generation', venue: 'NeurIPS', year: 2024 },
    ],
  },
];

function formatDateLabel(yymmdd: string) {
  const yy = yymmdd.slice(0, 2);
  const mm = yymmdd.slice(2, 4);
  const dd = yymmdd.slice(4, 6);
  return `${mm}.${dd}`;
}

export default function SeminarListPage() {
  const { isCommandPaletteOpen, openCommandPalette, closeCommandPalette } = useKeyboardShortcuts();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <Header onSearchClick={openCommandPalette} />

      <main className="flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Hero */}
          <div className="mb-12 text-center">
            <p className="mb-3 inline-flex rounded-full border border-teal-200/80 bg-white/90 px-3 py-1 text-xs font-semibold tracking-[0.14em] text-teal-600 shadow-sm backdrop-blur dark:border-teal-800 dark:bg-slate-900/70 dark:text-teal-300">
              SEMINARS
            </p>
            <h1 className="text-3xl font-black leading-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
              페이퍼 세미나
            </h1>
            <p className="mt-2 text-base text-slate-500 dark:text-slate-400">
              페이퍼 세미나에서 다룬 논문들을 인터랙티브하게 정리합니다.
            </p>
          </div>

          {/* 연구실 세미나 Section */}
          <section>
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-sm">
                <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">페이퍼 세미나</h2>
                <p className="text-sm text-slate-400 dark:text-slate-500">{labSeminars.length}개 세미나</p>
              </div>
            </div>

            {/* Timeline */}
            <div className="relative ml-4 border-l-2 border-slate-200 pl-8 dark:border-slate-700">
              {labSeminars.map((sem, idx) => (
                <div key={sem.slug} className={idx < labSeminars.length - 1 ? 'pb-8' : ''}>
                  {/* Timeline dot + date badge */}
                  <div className="absolute -left-[9px] flex items-center">
                    <span className="h-4 w-4 rounded-full border-2 border-teal-500 bg-white dark:border-teal-400 dark:bg-slate-950" />
                  </div>
                  <div className="mb-3 flex items-center gap-3">
                    <span className="inline-flex rounded-md bg-slate-100 px-2.5 py-1 font-mono text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {sem.date}
                    </span>
                    <span className="text-sm text-slate-400 dark:text-slate-500">{sem.displayDate}</span>
                  </div>

                  {/* Card */}
                  <Link
                    href={`/seminar/${sem.slug}`}
                    className="group block rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800 dark:hover:border-teal-600"
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-800 transition-colors group-hover:text-teal-700 dark:text-slate-100 dark:group-hover:text-teal-400">
                          {sem.title}
                        </h3>
                        <div className="mt-1.5 flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
                          <span className="flex items-center gap-1">
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            논문 {sem.papers}편
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            인터랙티브 {sem.demos}개
                          </span>
                        </div>
                      </div>
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${sem.color} text-white shadow-sm`}
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                      </span>
                    </div>

                    {/* References */}
                    <div className="mb-4 space-y-1.5">
                      {sem.references.map((ref, ri) => (
                        <p key={ri} className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          <span className="font-medium text-slate-600 dark:text-slate-300">[{ri + 1}]</span>{' '}
                          {ref.authors}, &ldquo;{ref.title},&rdquo; <span className="italic">{ref.venue}</span>, {ref.year}.
                        </p>
                      ))}
                    </div>

                    {/* Paper tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {sem.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-teal-600 transition-transform group-hover:translate-x-1 dark:text-teal-400">
                      학습하기
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </Link>
                </div>
              ))}

            </div>
          </section>
        </div>
      </main>

      <CommandPalette isOpen={isCommandPaletteOpen} onClose={closeCommandPalette} />
    </div>
  );
}
