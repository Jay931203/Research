import Link from 'next/link';
import { ArrowRight, BookOpen, GitBranch, GraduationCap, Layers } from 'lucide-react';

const cards = [
  {
    href: '/dashboard',
    title: '연구 대시보드',
    description: '논문 관계 그래프를 탐색하고 각 논문의 학습 페이지로 이동합니다.',
    icon: <GitBranch className="h-6 w-6 text-blue-600" />,
    accent: 'hover:ring-blue-200/50 dark:hover:ring-blue-500/20',
    tag: '논문 탐색',
  },
  {
    href: '/my-research',
    title: '내 연구',
    description: 'CSI AutoEncoder 압축 연구의 흐름과 핵심 논문을 정리한 페이지입니다.',
    icon: <BookOpen className="h-6 w-6 text-violet-600" />,
    accent: 'hover:ring-violet-200/50 dark:hover:ring-violet-500/20',
    tag: '연구 정리',
  },
  {
    href: '/qual-exam',
    title: '논자시',
    description: '자료구조·알고리즘 & 프로그래밍 기초 기출문제와 인터랙티브 학습 자료.',
    icon: <GraduationCap className="h-6 w-6 text-orange-600" />,
    accent: 'hover:ring-orange-200/50 dark:hover:ring-orange-500/20',
    tag: '시험 준비',
  },
  {
    href: '/coursework',
    title: '코스웍',
    description: '수강 과목 목록.',
    icon: <Layers className="h-6 w-6 text-teal-600" />,
    accent: 'hover:ring-teal-200/50 dark:hover:ring-teal-500/20',
    tag: '과목 정리',
  },
];

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_10%_15%,#dbeafe_0%,transparent_50%),radial-gradient(circle_at_90%_10%,#e0e7ff_0%,transparent_45%),radial-gradient(circle_at_50%_80%,#cffafe_0%,transparent_40%),linear-gradient(160deg,#f8fafc_0%,#eef2ff_35%,#f0f9ff_65%,#fafbfd_100%)] px-4 py-16 dark:bg-[radial-gradient(circle_at_20%_20%,#172554_0%,transparent_45%),radial-gradient(circle_at_80%_10%,#083344_0%,transparent_42%),linear-gradient(135deg,#020617_0%,#0f172a_50%,#111827_100%)] sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-4xl space-y-10">
        <section className="space-y-5 text-center">
          <p className="inline-flex rounded-full border border-blue-200/80 bg-white/90 px-3 py-1 text-xs font-semibold tracking-[0.14em] text-blue-600 shadow-sm backdrop-blur dark:border-blue-800 dark:bg-slate-900/70 dark:text-blue-200">
            RESEARCH GRAPH WORKSPACE
          </p>
          <h1 className="text-4xl font-black leading-tight text-slate-900 dark:text-slate-100 sm:text-5xl">
            개인 연구 허브
          </h1>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-600/25 transition hover:bg-blue-500"
          >
            대시보드 열기
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className={`group rounded-2xl border ${card.highlight ? 'border-orange-200/70 bg-orange-50/90 dark:border-orange-800/50 dark:bg-orange-950/30' : 'border-slate-200/70 bg-white/90 dark:border-slate-700 dark:bg-slate-900/70'} p-5 shadow-sm ring-1 ${card.highlight ? 'ring-orange-100 dark:ring-orange-900/30' : 'ring-slate-100 dark:ring-slate-800'} backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md ${card.accent}`}
            >
              <div className="mb-3 flex items-start justify-between">
                <div className={`inline-flex rounded-xl ${card.highlight ? 'bg-orange-100 ring-1 ring-orange-200/60 dark:bg-orange-900/40 dark:ring-orange-700/40' : 'bg-slate-50 ring-1 ring-slate-100 dark:bg-slate-800 dark:ring-slate-700'} p-2.5`}>
                  {card.icon}
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${card.highlight ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                  {card.tag}
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{card.title}</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{card.description}</p>
              <p className={`mt-4 inline-flex items-center gap-1 text-xs font-semibold ${card.highlight ? 'text-orange-600 dark:text-orange-300' : 'text-blue-600 dark:text-blue-300'}`}>
                바로 이동
                <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
              </p>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
