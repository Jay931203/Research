import Link from 'next/link';
import { ArrowRight, Database, GitBranch, NotebookPen } from 'lucide-react';

const cards = [
  {
    href: '/dashboard',
    title: '연구 대시보드',
    description: '논문 핵심 요약과 관계 그래프를 한 화면에서 탐색합니다.',
    icon: <GitBranch className="h-6 w-6 text-blue-600" />,
  },
  {
    href: '/import',
    title: '데이터 가져오기',
    description: '논문/관계 데이터를 안전하게 병합하고 상태를 확인합니다.',
    icon: <Database className="h-6 w-6 text-emerald-600" />,
  },
  {
    href: '/test',
    title: '시스템 점검',
    description: 'Supabase 연결과 테이블 상태를 빠르게 점검합니다.',
    icon: <NotebookPen className="h-6 w-6 text-violet-600" />,
  },
];

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_15%_20%,#dbeafe_0%,transparent_45%),radial-gradient(circle_at_85%_15%,#cffafe_0%,transparent_40%),linear-gradient(135deg,#f8fafc_0%,#eef2ff_45%,#ecfeff_100%)] px-4 py-16 dark:bg-[radial-gradient(circle_at_20%_20%,#172554_0%,transparent_45%),radial-gradient(circle_at_80%_10%,#083344_0%,transparent_42%),linear-gradient(135deg,#020617_0%,#0f172a_50%,#111827_100%)] sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl space-y-10">
        <section className="space-y-4 text-center">
          <p className="inline-flex rounded-full border border-blue-200 bg-white/80 px-3 py-1 text-xs font-semibold tracking-[0.14em] text-blue-700 backdrop-blur dark:border-blue-800 dark:bg-slate-900/70 dark:text-blue-200">
            CSI AUTOENCODER RESEARCH WORKSPACE
          </p>
          <h1 className="mx-auto max-w-4xl text-4xl font-black leading-tight text-slate-900 dark:text-slate-100 sm:text-5xl lg:text-6xl">
            논문 핵심을 빠르게 기억하고
            <br />
            연계 흐름을 한 번에 읽는 연구 그래프
          </h1>
          <p className="mx-auto max-w-2xl text-sm text-slate-600 dark:text-slate-300 sm:text-base">
            단순 마인드맵이 아니라, 논문별 리마인드 카드와 관계 추천을 중심으로
            연구 맥락을 추적합니다.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500"
            >
              대시보드 열기
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/import"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white/80 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-white dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              데이터 관리
            </Link>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group rounded-2xl border border-white/60 bg-white/85 p-5 shadow-[0_10px_40px_-22px_rgba(15,23,42,0.35)] backdrop-blur transition hover:-translate-y-0.5 hover:shadow-[0_18px_45px_-22px_rgba(37,99,235,0.35)] dark:border-slate-700 dark:bg-slate-900/70"
            >
              <div className="mb-3 inline-flex rounded-xl bg-slate-100 p-2.5 dark:bg-slate-800">
                {card.icon}
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{card.title}</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{card.description}</p>
              <p className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-300">
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

