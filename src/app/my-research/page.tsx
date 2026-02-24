'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BarChart2,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Cpu,
  FileText,
  Hash,
  HardDrive,
  Layers,
  Zap,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import CommandPalette from '@/components/common/CommandPalette';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import katex from 'katex';
import dynamic from 'next/dynamic';
import ConceptsSection from '@/components/my-research/ConceptsSection';

const OffGridDFTViz = dynamic(
  () => import('@/components/my-research/infographics/OffGridDFTViz'),
  { ssr: false },
);
const CnnVsSsmViz = dynamic(
  () => import('@/components/my-research/infographics/CnnVsSsmViz'),
  { ssr: false },
);
const HessianCurvatureViz = dynamic(
  () => import('@/components/my-research/infographics/HessianCurvatureViz'),
  { ssr: false },
);
const PolicySpaceViz = dynamic(
  () => import('@/components/my-research/infographics/PolicySpaceViz'),
  { ssr: false },
);
const ReliabilityViz = dynamic(
  () => import('@/components/my-research/infographics/ReliabilityViz'),
  { ssr: false },
);
const TwoLevelDistortionViz = dynamic(
  () => import('@/components/my-research/infographics/TwoLevelDistortionViz'),
  { ssr: false },
);
const SparsityViz = dynamic(
  () => import('@/components/my-research/infographics/SparsityViz'),
  { ssr: false },
);
const BudgetOutageViz = dynamic(
  () => import('@/components/my-research/infographics/BudgetOutageViz'),
  { ssr: false },
);
const MambaSSMCoreViz = dynamic(
  () => import('@/components/my-research/infographics/MambaSSMCoreViz'),
  { ssr: false },
);
const NmseVsBopScatterViz = dynamic(
  () => import('@/components/my-research/infographics/NmseVsBopScatterViz'),
  { ssr: false },
);
const HardVsSoftTailViz = dynamic(
  () => import('@/components/my-research/infographics/HardVsSoftTailViz'),
  { ssr: false },
);
const QuantRobustProofViz = dynamic(
  () => import('@/components/my-research/infographics/QuantRobustProofViz'),
  { ssr: false },
);

/* ------------------------------------------------------------------ */
/*  ToC                                                                 */
/* ------------------------------------------------------------------ */

const TOC_SECTIONS = [
  { id: 'section-overview', label: '연구 개요', icon: BookOpen },
  { id: 'section-concepts', label: '배경 개념 사전', icon: Hash },
  { id: 'section-system-model', label: '시스템 모델', icon: Cpu },
  { id: 'section-architecture', label: '비대칭 아키텍처', icon: Layers },
  { id: 'section-offline', label: 'RP-MPQ 오프라인', icon: HardDrive },
  { id: 'section-online', label: 'RP-MPQ 온라인', icon: Zap },
  { id: 'section-experiments', label: '실험 결과', icon: BarChart2 },
  { id: 'section-equations', label: '핵심 수식', icon: FileText },
  { id: 'section-notes', label: '연구 메모', icon: FileText },
] as const;

/* ------------------------------------------------------------------ */
/*  Equations data                                                      */
/* ------------------------------------------------------------------ */

const EQUATIONS = [
  {
    name: 'IDFT 지연 도메인 변환',
    latex: String.raw`\mathbf{H}_d[\ell] = \frac{1}{\sqrt{N_f}} \sum_{n=0}^{N_f-1} \mathbf{H}[n]\, e^{j 2\pi n\ell/N_f}`,
    description:
      'OFDM 채널 행렬 H[n]을 주파수 도메인에서 지연 도메인으로 변환합니다. 각 지연 탭 ℓ에 대해 모든 부반송파의 기여를 합산합니다.',
  },
  {
    name: '각도 도메인 변환',
    latex: String.raw`\mathbf{X}[\ell] = \mathbf{F}_r \mathbf{H}_d[\ell] \mathbf{F}_t^{\mathsf{H}}`,
    description:
      'DFT 행렬 F_r, F_t를 이용하여 지연 도메인 채널을 각도-지연 도메인으로 변환합니다. Off-grid 효과로 에너지가 여러 각도 빈에 퍼집니다.',
  },
  {
    name: '인코더 MSE 분해',
    latex: String.raw`\mathcal{L}(f_\theta, g_\phi) = \underbrace{\mathcal{I}(f_\theta)}_{\text{인코더 정보 하한}} + \underbrace{\mathcal{A}(g_\phi)}_{\text{디코더 근사 오차}}`,
    description:
      '전체 MSE 손실을 두 항으로 분해합니다. 첫 번째 항은 인코더 구조에 의해 결정되며, 두 번째 항은 디코더 용량을 늘려 줄일 수 있습니다.',
  },
  {
    name: 'SSM 소프트 테일 경계',
    latex: String.raw`R_{\mathrm{soft}}(L) \lesssim c_3\sum_{d=L+1}^{\infty}\frac{e^{-\alpha d}}{1+d} = \mathcal{O}\!\left(\frac{e^{-\alpha L}}{1+L}\right)`,
    description:
      '지평선 L 너머의 SSM 집약 기여. 지수 감쇠(e^{-αL})와 다항 감쇠(1/(1+L))의 곱으로, 하드 절단 O(L⁻¹)보다 지수 배율로 빠르게 감소합니다.',
  },
  {
    name: '하드 국소성 절단 손실',
    latex: String.raw`E_{\mathrm{hard}}(L) \lesssim c_0^2\sum_{d=L+1}^{\infty}\frac{1}{(1+d)^2} \le \frac{c_0^2}{1+L} = \mathcal{O}(L^{-1})`,
    description:
      'CNN 수용장 반경 L 바깥의 테일 에너지. 다항 감쇠 O(L⁻¹)이므로 절단 손실을 줄이려면 L을 크게 늘려야 합니다 → UE 연산량·지연 증가.',
  },
  {
    name: '양자화 내성 (명제)',
    latex: String.raw`\|\mathbf{y}_t - \hat{\mathbf{y}}_t\| \le \left(\frac{L_\Psi L_{\Phi,\theta}}{1-\rho} + L_{\Psi,\theta}\right)\|\Delta\boldsymbol{\theta}\|`,
    description:
      '수축적 SSM의 양자화 내성 경계. ρ<1이면 재귀를 통한 섭동 증폭이 없어, 출력 오차가 토큰 길이 t와 무관하게 ‖Δθ‖의 선형 배수로 균일 유계됩니다.',
  },
  {
    name: 'Hessian 민감도 대리 함수',
    latex: String.raw`\Omega_m(b) \triangleq \mathrm{Tr}(\mathbf{H}_m)\,\|\Delta\boldsymbol{\theta}_m^{(b)}\|_2^2`,
    description:
      '블록 m을 b비트로 양자화했을 때의 손실 증가를 근사합니다. Tr(H_m)은 Hessian 행렬의 대각합으로 민감도를 나타내고, ‖Δθ‖²는 양자화 오차의 크기입니다.',
  },
  {
    name: 'KL 정제 기준',
    latex: String.raw`J(\pi) = D_{\mathrm{KL}}\!\left(p_{\mathrm{enc}}^{(\pi)} \| p_{\mathrm{enc}}^{(\mathrm{FP32})}\right)`,
    description:
      '정책 π 하에서 인코더의 출력 분포가 FP32 기준 분포와 얼마나 다른지 측정합니다. KL 발산을 최소화하면 양자화로 인한 분포 이동이 최소화됩니다.',
  },
  {
    name: '신뢰성 위반 비용',
    latex: String.raw`V_{t,\pi} = \mathbf{1}\!\left[r_t(\pi) < \gamma r_{\mathrm{ref}}\right] + \beta \frac{\max(0,\, \gamma r_{\mathrm{ref}} - r_t(\pi))}{\gamma r_{\mathrm{ref}} + \varepsilon}`,
    description:
      '시간 t에 정책 π를 적용했을 때의 신뢰성 위반 비용입니다. 첫 번째 항은 아웃에이지 발생 여부(0/1)이고, 두 번째 항은 초과 위반 크기에 비례한 소프트 패널티입니다.',
  },
  {
    name: '온라인 정책 결정',
    latex: String.raw`\pi_t^\star = \mathop{\arg\min}_{\pi \in \Pi_{\mathcal{C}}} \left( w_t V_{t,\pi} + \lambda \kappa_\pi \right)`,
    description:
      '타임슬롯 t에서 후보 정책 집합 Π_C 중 신뢰성 비용과 연산 비용의 가중합을 최소화하는 정책을 선택합니다. w_t는 채널 희소성에 따른 적응형 가중치입니다.',
  },
] as const;

/* ------------------------------------------------------------------ */
/*  Sub-components                                                       */
/* ------------------------------------------------------------------ */

function EquationRenderer({ latex }: { latex: string }) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(latex, { throwOnError: false, displayMode: true });
    } catch {
      return null;
    }
  }, [latex]);
  if (!html) return <code className="block text-center text-sm text-red-400">{latex}</code>;
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

function SectionHeading({
  icon,
  title,
  collapsed,
  onToggle,
}: {
  icon: React.ReactNode;
  title: string;
  collapsed?: boolean;
  onToggle?: () => void;
}) {
  return (
    <button onClick={onToggle} className="mb-3 flex w-full items-center gap-2.5 text-left">
      <span className="text-gray-500 dark:text-gray-400">{icon}</span>
      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">{title}</h3>
      {onToggle && (
        <ChevronDown
          className={`ml-auto h-5 w-5 text-gray-400 transition-transform dark:text-gray-500 ${collapsed ? '-rotate-90' : ''}`}
        />
      )}
    </button>
  );
}

function SubSectionHeading({ number, title }: { number: string; title: string }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
        {number}
      </span>
      <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">{title}</h4>
    </div>
  );
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900 dark:shadow-none dark:ring-1 dark:ring-gray-800 ${className}`}
    >
      {children}
    </div>
  );
}

function InfographicCaption({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-2 text-center text-xs italic text-gray-500 dark:text-gray-400">{children}</p>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                            */
/* ------------------------------------------------------------------ */

export default function MyResearchPage() {
  const { isCommandPaletteOpen, openCommandPalette, closeCommandPalette } = useKeyboardShortcuts();

  /* ---------- reading progress ---------- */
  const [scrollProgress, setScrollProgress] = useState(0);
  useEffect(() => {
    const handler = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  /* ---------- active section ---------- */
  const [activeSection, setActiveSection] = useState<string>(TOC_SECTIONS[0].id);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current?.disconnect();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0.1 },
    );
    for (const section of TOC_SECTIONS) {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    }
    observerRef.current = observer;
    return () => observer.disconnect();
  }, []);

  /* ---------- ToC collapsed ---------- */
  const [isTocCollapsed, setIsTocCollapsed] = useState(false);

  /* ---------- section collapsed ---------- */
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const toggleSection = useCallback((id: string) => {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  /* ---------- equation expand ---------- */
  const [expandedEqs, setExpandedEqs] = useState<Set<number>>(new Set());
  const toggleEq = useCallback((idx: number) => {
    setExpandedEqs((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }, []);

  /* ---------- notes ---------- */
  const [notes, setNotes] = useState('');
  const [todos, setTodos] = useState([
    { id: 0, text: 'CR=1/8 실험 결과 채우기', done: false },
    { id: 1, text: 'FR1 TDL-A/B/C 일반화 실험', done: false },
    { id: 2, text: '실제 UE 기기 런타임 측정', done: false },
    { id: 3, text: '예산 일관성 검증 (Table 3 채우기)', done: false },
    { id: 4, text: '카메라 레디 버전 준비', done: false },
  ]);
  const [notesSaved, setNotesSaved] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('my-research-notes');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as { notes?: string; todos?: typeof todos };
        if (parsed.notes) setNotes(parsed.notes);
        if (parsed.todos) setTodos(parsed.todos);
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  const saveNotes = useCallback(() => {
    localStorage.setItem('my-research-notes', JSON.stringify({ notes, todos }));
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2000);
  }, [notes, todos]);

  const toggleTodo = useCallback((id: number) => {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }, []);

  /* ---------- scroll to section ---------- */
  const scrollToSection = useCallback((sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  /* ================================================================ */
  /*  Render                                                           */
  /* ================================================================ */

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header onSearchClick={openCommandPalette} />
      <CommandPalette isOpen={isCommandPaletteOpen} onClose={closeCommandPalette} />

      {/* Reading progress bar */}
      <div
        className="fixed left-0 top-16 z-40 h-0.5 bg-blue-500 transition-all"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Breadcrumb */}
      <div className="border-b border-gray-200 bg-white px-4 py-2 dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex max-w-[calc(16rem+64rem)] items-center gap-2 text-sm">
          <span className="text-gray-500 dark:text-gray-400">대시보드</span>
          <ChevronRight className="h-3 w-3 text-gray-400" />
          <span className="font-medium text-gray-800 dark:text-gray-200">내 연구 논문</span>
          <span className="ml-2 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-bold text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
            진행 중
          </span>
        </div>
      </div>

      {/* Layout */}
      <div className="flex">
        {/* Sidebar ToC */}
        <aside
          className={`sticky top-20 hidden h-[calc(100vh-5rem)] flex-shrink-0 overflow-y-auto border-r border-gray-200 bg-gray-50/80 transition-all duration-200 lg:block dark:border-gray-800 dark:bg-gray-900/80 ${
            isTocCollapsed ? 'w-16 p-2' : 'w-64 p-4'
          }`}
        >
          <div
            className={`mb-3 flex items-center ${isTocCollapsed ? 'justify-center' : 'justify-between'}`}
          >
            {!isTocCollapsed && (
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                목차
              </p>
            )}
            <button
              type="button"
              onClick={() => setIsTocCollapsed((prev) => !prev)}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 text-gray-500 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
              title={isTocCollapsed ? '목차 펼치기' : '목차 접기'}
            >
              <ChevronRight
                className={`h-4 w-4 transition-transform ${isTocCollapsed ? '' : 'rotate-180'}`}
              />
            </button>
          </div>
          <nav className="space-y-1">
            {TOC_SECTIONS.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  title={section.label}
                  aria-label={section.label}
                  className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-sm transition ${
                    isTocCollapsed ? 'justify-center px-2' : 'gap-2.5'
                  } ${
                    isActive
                      ? isTocCollapsed
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        : 'border-l-2 border-blue-600 bg-blue-50 font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}
                  />
                  {!isTocCollapsed && section.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1">
          <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">

            {/* ===== Section 1: Overview ===== */}
            <section id="section-overview" className="scroll-mt-20">
              <div className="overflow-hidden rounded-xl shadow-sm">
                {/* Gradient header */}
                <div className="bg-gradient-to-br from-purple-700 via-indigo-700 to-blue-700 p-6 pb-8">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
                      2026 · 서울대학교
                    </span>
                    <span className="rounded-full bg-yellow-400/90 px-3 py-1 text-xs font-bold text-yellow-900">
                      진행 중
                    </span>
                  </div>
                  <h1 className="text-xl font-bold leading-snug text-white sm:text-2xl">
                    Reliability-Preserving Mixed-Precision Quantization Scheduling for Asymmetric CSI Feedback Autoencoders
                  </h1>
                  <p className="mt-3 text-sm text-indigo-200">
                    박현재, 최완 (서울대학교 전기정보공학부)
                  </p>
                  <p className="mt-1 text-xs italic text-indigo-300">Under submission · 2026</p>
                </div>

                {/* White body */}
                <div className="bg-white p-6 dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
                  <p className="leading-relaxed text-gray-700 dark:text-gray-300">
                    FDD 대규모 MIMO 시스템에서 UE 측 추론 제약 하의 CSI 피드백을 신뢰성 관점에서 연구합니다.
                    UE에는 경량 SSM 기반 인코더(Mamba), BS에는 고용량 Transformer 디코더를 배치하는{' '}
                    <span className="font-semibold text-indigo-700 dark:text-indigo-300">비대칭 오토인코더</span>를 제안하고,
                    혼합 정밀도 양자화 스케줄링(RP-MPQ)으로 런타임에 신뢰성을 보존합니다.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                      신뢰성 기반 정식화
                    </span>
                    <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                      비대칭 오토인코더
                    </span>
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-300">
                      RP-MPQ 프레임워크
                    </span>
                    <span className="rounded-full border border-dashed border-gray-300 px-3 py-1 text-xs font-medium text-gray-500 dark:border-gray-600 dark:text-gray-400">
                      제출 준비 중
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* ===== Section: 배경 개념 사전 ===== */}
            <section id="section-concepts" className="scroll-mt-20">
              <SectionHeading
                icon={<Hash className="h-5 w-5" />}
                title="배경 개념 사전 — 처음 읽는 분을 위한 필수 개념 6가지"
                collapsed={!!collapsed['section-concepts']}
                onToggle={() => toggleSection('section-concepts')}
              />
              <div
                className={`overflow-hidden transition-all duration-300 ${collapsed['section-concepts'] ? 'max-h-0' : 'max-h-[9999px]'}`}
              >
                <div className="mb-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-700 dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-300">
                  💡 각 카드를 클릭하면 수식·그림과 함께 상세 설명이 펼쳐집니다.
                  이미 익숙한 개념은 건너뛰어도 됩니다.
                </div>
                <ConceptsSection />
              </div>
            </section>

            {/* ===== Section 2: System Model ===== */}
            <section id="section-system-model" className="scroll-mt-20">
              <SectionHeading
                icon={<Cpu className="h-5 w-5" />}
                title="시스템 모델"
                collapsed={!!collapsed['section-system-model']}
                onToggle={() => toggleSection('section-system-model')}
              />
              <div
                className={`overflow-hidden transition-all duration-300 ${collapsed['section-system-model'] ? 'max-h-0' : 'max-h-[9999px]'}`}
              >
                <Card>
                  {/* 2.1 FDD */}
                  <SubSectionHeading number="2.1" title="FDD 대규모 MIMO 시스템" />
                  <p className="mb-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                    N_t = 32 송신 안테나, N_r = 1 수신 안테나(UE), N_f 부반송파의 OFDM 시스템을 고려합니다.
                    FDD 방식이므로 UE는 다운링크 CSI를 추정한 후 BS에 피드백해야 합니다.
                  </p>

                  {/* System diagram SVG */}
                  <div className="mb-6 w-full overflow-x-auto rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                    <svg viewBox="0 0 600 200" width="100%" height={200} className="block">
                      {/* UE Box */}
                      <rect x={20} y={60} width={140} height={80} rx={10} fill="#dbeafe" stroke="#3b82f6" strokeWidth={1.5} />
                      <text x={90} y={88} textAnchor="middle" fontSize={12} fontWeight="bold" fill="#1d4ed8">UE</text>
                      <text x={90} y={104} textAnchor="middle" fontSize={9} fill="#3b82f6">(사용자 단말)</text>
                      <path d="M68,118 Q75,108 82,118 Q89,128 96,118 Q103,108 110,118" fill="none" stroke="#3b82f6" strokeWidth={1.5} />

                      {/* BS Box */}
                      <rect x={440} y={60} width={140} height={80} rx={10} fill="#dcfce7" stroke="#16a34a" strokeWidth={1.5} />
                      <text x={510} y={88} textAnchor="middle" fontSize={12} fontWeight="bold" fill="#15803d">BS</text>
                      <text x={510} y={104} textAnchor="middle" fontSize={9} fill="#16a34a">(기지국)</text>
                      <line x1={510} y1={118} x2={510} y2={130} stroke="#16a34a" strokeWidth={2} />
                      <line x1={504} y1={122} x2={516} y2={122} stroke="#16a34a" strokeWidth={1.5} />

                      {/* Arrows */}
                      <defs>
                        <marker id="arrowBlue" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
                          <path d="M0,0 L0,8 L8,4 z" fill="#3b82f6" />
                        </marker>
                        <marker id="arrowGreen" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
                          <path d="M0,0 L0,8 L8,4 z" fill="#16a34a" />
                        </marker>
                      </defs>
                      <line x1={162} y1={90} x2={438} y2={90} stroke="#3b82f6" strokeWidth={1.5} markerEnd="url(#arrowBlue)" />
                      <text x={300} y={80} textAnchor="middle" fontSize={9} fill="#2563eb" fontWeight="bold">
                        압축된 CSI 피드백 (D차원 잠재벡터)
                      </text>
                      <line x1={438} y1={115} x2={162} y2={115} stroke="#16a34a" strokeWidth={1.5} markerEnd="url(#arrowGreen)" />
                      <text x={300} y={133} textAnchor="middle" fontSize={9} fill="#15803d">
                        다운링크 전송
                      </text>

                      {/* Labels below boxes */}
                      <rect x={10} y={152} width={160} height={36} rx={6} fill="#eff6ff" stroke="#bfdbfe" strokeWidth={1} />
                      <text x={90} y={168} textAnchor="middle" fontSize={8.5} fill="#1e40af" fontWeight="bold">인코더 f_θ: X_a → z</text>
                      <text x={90} y={182} textAnchor="middle" fontSize={8} fill="#3b82f6">(경량화 필요)</text>

                      <rect x={430} y={152} width={160} height={36} rx={6} fill="#f0fdf4" stroke="#bbf7d0" strokeWidth={1} />
                      <text x={510} y={168} textAnchor="middle" fontSize={8.5} fill="#15803d" fontWeight="bold">디코더 g_φ: z̃ → X̂_a</text>
                      <text x={510} y={182} textAnchor="middle" fontSize={8} fill="#16a34a">(고용량 허용)</text>
                    </svg>
                  </div>

                  {/* 2.2 */}
                  <SubSectionHeading number="2.2" title="지연-각도 도메인 변환" />
                  <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                    OFDM 채널 행렬을 먼저 IDFT로 지연 도메인으로 변환한 뒤, DFT 행렬을 이용하여 각도 도메인으로 변환합니다.
                    실제 채널의 경로가 DFT 격자와 정렬되지 않으면{' '}
                    <span className="font-semibold text-orange-600 dark:text-orange-400">off-grid 효과</span>로 에너지가 여러 빈에 퍼집니다.
                  </p>

                  <div className="mb-4 space-y-3">
                    <div className="rounded-lg bg-indigo-50 p-3 dark:bg-indigo-900/20">
                      <p className="mb-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300">Eq. (1) 지연 도메인 변환:</p>
                      <div className="overflow-x-auto text-gray-900 dark:text-gray-100">
                        <EquationRenderer latex={String.raw`\mathbf{H}_d[\ell] = \frac{1}{\sqrt{N_f}} \sum_{n=0}^{N_f-1} \mathbf{H}[n]\, e^{j 2\pi n\ell/N_f}`} />
                      </div>
                    </div>
                    <div className="rounded-lg bg-indigo-50 p-3 dark:bg-indigo-900/20">
                      <p className="mb-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300">Eq. (2) 각도 도메인 변환:</p>
                      <div className="overflow-x-auto text-gray-900 dark:text-gray-100">
                        <EquationRenderer latex={String.raw`\mathbf{X}[\ell] = \mathbf{F}_r \mathbf{H}_d[\ell] \mathbf{F}_t^{\mathsf{H}}`} />
                      </div>
                    </div>
                  </div>

                  <OffGridDFTViz />
                  <InfographicCaption>
                    위 인터랙티브 예제: 슬라이더로 주파수를 조절하면 DFT 스펙트럼 누설을 확인할 수 있습니다.
                  </InfographicCaption>

                  {/* 2.3 */}
                  <div className="mt-6">
                    <SubSectionHeading number="2.3" title="UE 제약과 왜곡 분해" />
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-900/10">
                        <p className="mb-1 text-xs font-bold text-red-700 dark:text-red-300">구조적 왜곡 (인코더 정보 하한)</p>
                        <p className="text-xs leading-relaxed text-red-600 dark:text-red-400">
                          인코더가 X_a를 z로 압축할 때 버려지는 정보. 인코더 구조에 의해 하한이 결정됩니다.
                          디코더를 아무리 키워도 줄일 수 없는 성분입니다.
                        </p>
                      </div>
                      <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-900/40 dark:bg-orange-900/10">
                        <p className="mb-1 text-xs font-bold text-orange-700 dark:text-orange-300">운영적 열화 (정밀도 유발)</p>
                        <p className="text-xs leading-relaxed text-orange-600 dark:text-orange-400">
                          혼합 정밀도 추론으로 인한 추가 왜곡. 런타임 양자화 정책에 따라 동적으로 변화합니다.
                          RP-MPQ가 제어하는 대상입니다.
                        </p>
                      </div>
                    </div>
                  </div>

                  <TwoLevelDistortionViz />
                  <InfographicCaption>
                    실제 논문 NMSE 데이터 기반: 같은 양자화 정밀도에서도 모델 구조에 따라 운영적 열화 크기가 극적으로 다릅니다.
                  </InfographicCaption>
                </Card>
              </div>
            </section>

            {/* ===== Section 3: Architecture ===== */}
            <section id="section-architecture" className="scroll-mt-20">
              <SectionHeading
                icon={<Layers className="h-5 w-5" />}
                title="비대칭 아키텍처 (§3)"
                collapsed={!!collapsed['section-architecture']}
                onToggle={() => toggleSection('section-architecture')}
              />
              <div
                className={`overflow-hidden transition-all duration-300 ${collapsed['section-architecture'] ? 'max-h-0' : 'max-h-[9999px]'}`}
              >
                <Card>
                  {/* 3.1 인코더 유발 정보 하한 */}
                  <SubSectionHeading number="3.1" title="UE–BS 비대칭성과 인코더 유발 정보 하한" />
                  <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                    잠재 변수 <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400">Z := f_θ(X_a)</span>를 정의하면,
                    전체 MSE 손실은 조건부 기댓값의 직교 분해 성질에 의해 정확히 두 항으로 분리됩니다:
                  </p>
                  <div className="mb-3 overflow-x-auto rounded-lg bg-indigo-50 p-3 dark:bg-indigo-900/20">
                    <div className="text-gray-900 dark:text-gray-100">
                      <EquationRenderer latex={String.raw`\mathcal{L}(f_\theta, g_\phi) = \underbrace{\mathbb{E}\!\left[\|\mathbf{X}_a - \mathbb{E}[\mathbf{X}_a\mid\mathbf{Z}]\|_F^2\right]}_{\text{인코더 유발 정보 하한}} + \underbrace{\mathbb{E}\!\left[\|\mathbb{E}[\mathbf{X}_a\mid\mathbf{Z}] - g_\phi(\mathbf{Z})\|_F^2\right]}_{\text{디코더 근사 오차}}`} />
                    </div>
                  </div>
                  <div className="mb-5 grid grid-cols-1 gap-2 sm:grid-cols-2 text-xs">
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900/40 dark:bg-red-900/10">
                      <p className="mb-1 font-bold text-red-700 dark:text-red-300">인코더 정보 하한</p>
                      <p className="leading-relaxed text-red-600 dark:text-red-400">
                        이상적 디코더 하에서 최소 달성 가능 왜곡. Z에 보존된 정보량에만 의존.
                        <span className="font-semibold"> 인코더 구조가 결정 — BS 디코더를 키워도 줄일 수 없음.</span>
                      </p>
                    </div>
                    <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 dark:border-orange-900/40 dark:bg-orange-900/10">
                      <p className="mb-1 font-bold text-orange-700 dark:text-orange-300">디코더 근사 오차</p>
                      <p className="leading-relaxed text-orange-600 dark:text-orange-400">
                        비이상적 디코더로 인한 오차. BS 측 디코더 용량 증가로 줄일 수 있음.
                        <span className="font-semibold"> RP-MPQ의 조정 대상.</span>
                      </p>
                    </div>
                  </div>

                  <TwoLevelDistortionViz />
                  <InfographicCaption>
                    실제 논문 NMSE 데이터 기반: 같은 양자화 정밀도에서도 모델 구조에 따라 운영적 열화 크기가 극적으로 다릅니다.
                  </InfographicCaption>

                  {/* 3.2 롱테일 특성 */}
                  <div className="mt-7">
                    <SubSectionHeading number="3.2" title="지연-각도 도메인 CSI의 롱테일 국소성" />
                    <div className="mb-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs dark:border-amber-800 dark:bg-amber-950/20">
                      <span className="shrink-0 text-amber-500">💡</span>
                      <span className="text-amber-700 dark:text-amber-300">
                        <strong>처음 보는 분께:</strong> &ldquo;Dirichlet 커널&rdquo;이나 &ldquo;off-grid 누설&rdquo;이 낯설다면
                        위의 <strong>배경 개념 사전 → 개념 1, 2</strong>를 먼저 읽으세요.
                        아래 수식의 1/(1+d) 형태가 어디서 나오는지 이해하실 수 있습니다.
                      </span>
                    </div>
                    <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                      실제 채널 경로가 DFT 격자와 정렬되지 않으면 (off-grid), Dirichlet형 스펙트럼 누설로
                      진폭 포락선이 천천히 감쇠하는 진동 롱테일을 형성합니다:
                    </p>
                    <div className="mb-3 overflow-x-auto rounded-lg bg-orange-50 p-3 dark:bg-orange-900/20">
                      <div className="text-gray-900 dark:text-gray-100">
                        <EquationRenderer latex={String.raw`x_{i_0+d} \approx c_0\,\frac{\eta_d}{1+d}, \quad |\eta_d|\le 1`} />
                      </div>
                    </div>
                    <p className="mb-2 text-xs text-gray-600 dark:text-gray-400">
                      포락선 상한으로 정리하면:
                    </p>
                    <div className="mb-4 overflow-x-auto rounded-lg bg-orange-50 p-3 dark:bg-orange-900/20">
                      <div className="text-gray-900 dark:text-gray-100">
                        <EquationRenderer latex={String.raw`|x_i| \lesssim \frac{c_0}{1+|i-i_0|}`} />
                      </div>
                    </div>
                    <p className="mb-4 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                      이 다항식 감쇠는 멀리 있는 각도 계수가 여전히 비영(non-zero)임을 의미하므로,
                      하드 컷오프 방식 인코더는 되돌릴 수 없는 구조적 손실을 발생시킬 수 있습니다.
                    </p>

                    {/* Static energy bar chart */}
                    <div className="mb-5 w-full overflow-x-auto rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
                      <p className="mb-2 text-center text-xs font-semibold text-gray-500 dark:text-gray-400">
                        각도 인덱스별 에너지 분포 (off-grid 채널, Dirichlet 누설 모형)
                      </p>
                      <svg viewBox="0 0 500 130" width="100%" height={130} className="block">
                        <line x1={40} y1={10} x2={40} y2={100} stroke="#9ca3af" strokeWidth={0.5} />
                        <line x1={40} y1={100} x2={490} y2={100} stroke="#9ca3af" strokeWidth={0.5} />
                        <text x={265} y={120} textAnchor="middle" fontSize={9} fill="#9ca3af">각도 인덱스 오프셋 d (중심으로부터)</text>
                        <text x={10} y={55} textAnchor="middle" fontSize={9} fill="#9ca3af" transform="rotate(-90,10,55)">|크기|</text>
                        {[-7,-6,-5,-4,-3,-2,-1,0,1,2,3,4,5,6,7].map((offset, i) => {
                          const barH = (1 / (1 + Math.abs(offset) * 0.9)) * 80;
                          const x = 50 + i * 29;
                          const y = 100 - barH;
                          const isCenter = offset === 0;
                          return (
                            <g key={offset}>
                              <rect x={x} y={y} width={22} height={barH} rx={2}
                                fill={isCenter ? '#6366f1' : '#a5b4fc'}
                                opacity={isCenter ? 1 : 0.7}
                              >
                                <title>오프셋 {offset}: |x|≈{(1/(1+Math.abs(offset)*0.9)).toFixed(2)}</title>
                              </rect>
                              <text x={x+11} y={113} textAnchor="middle" fontSize={7} fill="#9ca3af">{offset}</text>
                            </g>
                          );
                        })}
                        <text x={360} y={25} fontSize={8} fill="#f97316">off-grid 측엽 에너지</text>
                        <text x={360} y={37} fontSize={8} fill="#f97316">멀리까지 비영(non-zero)</text>
                        <line x1={355} y1={30} x2={295} y2={62} stroke="#f97316" strokeWidth={0.8} markerEnd="url(#arrowOrange)" />
                        <defs>
                          <marker id="arrowOrange" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                            <path d="M0,0 L0,6 L6,3 z" fill="#f97316" />
                          </marker>
                        </defs>
                      </svg>
                    </div>
                  </div>

                  {/* 3.3 하드 국소성 */}
                  <div className="mt-2">
                    <SubSectionHeading number="3.3" title="하드 국소성 인코딩과 구조적 절단 손실" />
                    <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                      CNN 기반 인코더는 유한 수용장(receptive field) 반경 L만 처리합니다.
                      식 (3.2)의 포락선 하에서, 반경 L 바깥 테일 에너지는:
                    </p>
                    <div className="mb-3 overflow-x-auto rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                      <div className="text-gray-900 dark:text-gray-100">
                        <EquationRenderer latex={String.raw`E_{\mathrm{hard}}(L) \triangleq \sum_{|i-i_0|>L}|x_i|^2 \lesssim c_0^2\sum_{d=L+1}^{\infty}\frac{1}{(1+d)^2} \le \frac{c_0^2}{1+L} = \mathcal{O}(L^{-1})`} />
                      </div>
                    </div>
                    <p className="mb-4 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                      다항식 감쇠(O(L⁻¹))이므로, 절단 손실을 줄이려면 L을 크게 늘려야 합니다 → UE 연산량·지연 증가.
                    </p>
                    <CnnVsSsmViz />
                    <InfographicCaption>
                      CNN의 수용장(receptive field)은 하드 컷오프, SSM의 지수 감쇠 메모리는 멀리 있는 성분도 부드럽게 포함합니다.
                    </InfographicCaption>
                  </div>

                  {/* 3.4 소프트 국소성 */}
                  <div className="mt-7">
                    <SubSectionHeading number="3.4" title="상태 공간 집약에 의한 소프트 국소성" />
                    <div className="mb-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs dark:border-amber-800 dark:bg-amber-950/20">
                      <span className="shrink-0 text-amber-500">💡</span>
                      <span className="text-amber-700 dark:text-amber-300">
                        <strong>처음 보는 분께:</strong> &ldquo;SSM = 지수 모드의 합&rdquo;이 왜 성립하는지,
                        그리고 이게 Dirichlet 포락선과 왜 연결되는지는
                        <strong> 배경 개념 사전 → 개념 3, 4</strong>에서 수식·인터랙티브 그림으로 설명합니다.
                      </span>
                    </div>
                    <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                      선형 SSM은 합성곱 형태로 표현할 수 있으며, 안정적인 A에 대해 지수 감쇠 가중치를 가집니다:
                    </p>
                    <div className="mb-3 space-y-2">
                      <div className="overflow-x-auto rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                        <div className="text-gray-900 dark:text-gray-100">
                          <EquationRenderer latex={String.raw`\mathbf{y}_k = \mathbf{C}\sum_{d\ge 0}\mathbf{A}^{d}\mathbf{B}\,\mathbf{u}_{k-d}, \quad \|\mathbf{A}^d\| \le c_1 e^{-\alpha d}`} />
                        </div>
                      </div>
                    </div>
                    <p className="mb-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                      Dirichlet 포락선 <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400">‖u_{"{k−d}"}‖ ≲ c₀/(1+d)</span>를 적용하면,
                      지평선 L 너머의 집약 기여(soft tail)는:
                    </p>
                    <div className="mb-3 overflow-x-auto rounded-lg bg-emerald-50 p-3 dark:bg-emerald-900/20">
                      <div className="text-gray-900 dark:text-gray-100">
                        <EquationRenderer latex={String.raw`R_{\mathrm{soft}}(L) \lesssim c_3\sum_{d=L+1}^{\infty}\frac{e^{-\alpha d}}{1+d} = \mathcal{O}\!\left(\frac{e^{-\alpha L}}{1+L}\right)`} />
                      </div>
                    </div>
                    <p className="mb-4 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                      지수 감쇠 × 다항 감쇠의 곱이므로 하드 테일 O(L⁻¹)보다 훨씬 빠르게 감소합니다.
                      단, 원거리 계수는 완전히 버려지지 않고 재귀적으로 집약됩니다 (소프트 메모리).
                    </p>

                    {/* Remark: Laplace mixture */}
                    <div className="mb-4 rounded-xl border border-dashed border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-950/20 px-4 py-3">
                      <p className="mb-2 text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wide">
                        비고 — 다항 포락선의 Laplace 혼합 표현
                      </p>
                      <p className="mb-2 text-xs text-purple-700 dark:text-purple-400 leading-relaxed">
                        롱테일 다항 포락선은 지수 모드의 연속 혼합으로 정확히 표현됩니다:
                      </p>
                      <div className="overflow-x-auto rounded-lg bg-white dark:bg-slate-900 px-3 py-2">
                        <div className="text-gray-900 dark:text-gray-100">
                          <EquationRenderer latex={String.raw`\frac{1}{d+1} = \int_{0}^{\infty} e^{-(d+1)\alpha}\,d\alpha = \int_{0}^{\infty} e^{-\alpha}\, e^{-\alpha d}\,d\alpha`} />
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-purple-600 dark:text-purple-400 leading-relaxed">
                        따라서 느린 다항 감쇠 = 지수 감쇠 모드의 연속체. 유한 차원 SSM은 A의 고유구조를 통해
                        유한 개의 지수 모드를 실현하며, 제한된 UE 복잡도 하에서 롱테일 국소성을 위한 구조적 사전(prior)을 제공합니다.
                      </p>
                    </div>

                    {/* Interactive tail comparison */}
                    <HardVsSoftTailViz />
                    <InfographicCaption>
                      슬라이더로 수용장 L과 SSM 감쇠율 α를 조절: 같은 L에서 소프트 테일 잔여가 지수 배율로 더 작습니다.
                    </InfographicCaption>
                  </div>

                  {/* 3.5 양자화 내성 명제 */}
                  <div className="mt-7">
                    <SubSectionHeading number="3.5" title="수축적 상태 공간 인코더의 양자화 내성" />
                    <div className="mb-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs dark:border-amber-800 dark:bg-amber-950/20">
                      <span className="shrink-0 text-amber-500">💡</span>
                      <span className="text-amber-700 dark:text-amber-300">
                        <strong>Lipschitz 연속성, 수축 사상, 명제 증명 직관</strong>이 궁금하다면
                        <strong> 배경 개념 사전 → 개념 5, 6</strong>을 먼저 보세요.
                        ρ&lt;1이 왜 &ldquo;오차가 쌓이지 않음&rdquo;을 보장하는지
                        그림·수식으로 단계별 설명합니다.
                      </span>
                    </div>
                    <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                      UE 측 추론은 저정밀도 실행이 필요합니다. 훈련 후 가중치 양자화를
                      <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400 mx-1">θ̂ = θ + Δθ</span>
                      로 모델링하면, 아래 명제는 상태 재귀가 균일 수축적일 때 양자화 오차가
                      토큰 길이에 따라 증폭되지 않음을 형식화합니다.
                    </p>

                    {/* Proposition box */}
                    <div className="mb-4 rounded-xl border-2 border-indigo-300 dark:border-indigo-700 bg-white dark:bg-slate-900 overflow-hidden">
                      <div className="bg-indigo-50 dark:bg-indigo-950/30 px-4 py-2.5 flex items-center gap-2">
                        <span className="rounded-md bg-indigo-600 text-white px-2.5 py-0.5 text-xs font-black">명제</span>
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                          수축적 상태 공간 갱신의 섭동 내성
                        </span>
                      </div>
                      <div className="px-4 py-3 text-xs text-slate-700 dark:text-slate-300 space-y-2">
                        <p className="leading-relaxed">
                          선택적 SSM 인코더 블록을{' '}
                          <span className="font-mono text-indigo-600 dark:text-indigo-400">s_{'{t+1}'} = Φ_t(s_t, u_t; θ)</span>,{' '}
                          <span className="font-mono text-indigo-600 dark:text-indigo-400">y_t = Ψ_t(s_t; θ)</span>로 쓰고,
                          동일 입력·초기화 하에서 양자화 파라미터{' '}
                          <span className="font-mono text-indigo-600 dark:text-indigo-400">θ̂ = θ + Δθ</span>를 적용하자.
                          Φ_t가 상태에 대해 수축률 ρ∈[0,1)을 가지며 각 함수가 Lipschitz 연속이면,
                          출력 편차는 모든 t에 대해 균일하게:
                        </p>
                        <div className="overflow-x-auto rounded-lg bg-indigo-50 dark:bg-indigo-900/20 px-3 py-2">
                          <div className="text-gray-900 dark:text-gray-100">
                            <EquationRenderer latex={String.raw`\|\mathbf{y}_t - \hat{\mathbf{y}}_t\| \le \left(\frac{L_\Psi L_{\Phi,\theta}}{1-\rho} + L_{\Psi,\theta}\right)\|\Delta\boldsymbol{\theta}\|`} />
                          </div>
                        </div>
                        <p className="leading-relaxed text-slate-600 dark:text-slate-400">
                          <span className="font-bold text-slate-700 dark:text-slate-300">해석:</span>{' '}
                          한계가 t에 의존하지 않으므로, ρ&lt;1이 재귀를 통한 섭동 증폭을 방지합니다.
                          Mamba처럼 Φ_t가 입력 의존적인 선택적 SSM에서도,
                          운영 범위에서 균일 수축성이 성립하면 동일한 결론이 유효합니다.
                        </p>
                      </div>
                    </div>

                    {/* Interactive proof walkthrough */}
                    <QuantRobustProofViz />
                    <InfographicCaption>
                      증명 단계별 전개 + 수치 계산기: ρ와 ‖Δθ‖를 조절하여 한계가 토큰 길이 t와 무관함을 확인하세요.
                    </InfographicCaption>
                  </div>

                  {/* 3.6 Mamba 내부 메커니즘 */}
                  <div className="mt-7">
                    <SubSectionHeading number="3.6" title="Mamba 선택적 스캔: 핵심 메커니즘" />
                    <p className="mb-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                      Mamba의 핵심은 입력 의존적 파라미터 Δ_t입니다. 아래 애니메이션에서
                      CSI 각도 도메인 계수를 입력으로 받아 상태 벡터 h가 어떻게
                      지배 경로만 선택적으로 포착하는지 확인하세요.
                    </p>
                    <MambaSSMCoreViz />
                    <InfographicCaption>
                      고정 Δ(S4)와 선택적 Δ(Mamba) 비교: 지배 경로에서 Mamba가 상태를 크게 갱신하고, 잡음에서는 이전 기억을 유지합니다.
                    </InfographicCaption>
                  </div>

                  {/* 3.7 비대칭 구조 결론 */}
                  <div className="mt-7">
                    <SubSectionHeading number="3.7" title="비대칭 아키텍처 채택 근거 요약" />
                    <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                        <p className="mb-1 text-xs font-bold uppercase tracking-wide text-blue-700 dark:text-blue-300">UE 인코더</p>
                        <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">Mamba (SSM)</p>
                        <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">경량, 저지연, O(N) 복잡도</p>
                        <div className="mt-3 space-y-1 text-[10px] text-blue-700 dark:text-blue-300">
                          <p>• 소프트 메모리: O(e^{'{−αL}'}/(1+L)) 테일</p>
                          <p>• 양자화 내성: 출력 오차 균일 유계 (명제)</p>
                          <p>• 선택적 스캔: 지배 경로 집중 포착</p>
                        </div>
                      </div>
                      <div className="rounded-xl border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/20">
                        <p className="mb-1 text-xs font-bold uppercase tracking-wide text-purple-700 dark:text-purple-300">BS 디코더</p>
                        <p className="text-sm font-semibold text-purple-900 dark:text-purple-100">Transformer (TransNet 계열)</p>
                        <p className="mt-1 text-xs text-purple-600 dark:text-purple-400">고용량, 전역 어텐션, O(N²) 허용</p>
                        <div className="mt-3 space-y-1 text-[10px] text-purple-700 dark:text-purple-300">
                          <p>• 조건부 평균 E[X_a|Z] 근사 목표</p>
                          <p>• 디코더 근사 오차 최소화 담당</p>
                          <p>• 인코더 정보 하한에는 영향 없음</p>
                        </div>
                      </div>
                    </div>

                    {/* Comparison table */}
                    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-gray-50 dark:bg-gray-800">
                            <th className="px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-400">구분</th>
                            <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-gray-400">CNN</th>
                            <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-gray-400">Transformer</th>
                            <th className="px-3 py-2 text-center font-semibold text-indigo-600 dark:text-indigo-400">Mamba SSM</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                          {[
                            { label: 'UE 적합성', cnn: '보통', transformer: '낮음', mamba: '높음' },
                            { label: '테일 잔여 감쇠', cnn: 'O(L⁻¹)', transformer: 'O(N⁻²)', mamba: 'O(e⁻ᵅᴸ/L)' },
                            { label: '복잡도', cnn: 'O(L)', transformer: 'O(N²)', mamba: 'O(N)' },
                            { label: '메모리 유형', cnn: '하드 절단', transformer: 'Attention 소프트', mamba: '지수 감쇠 소프트' },
                            { label: '양자화 내성', cnn: '낮음', transformer: 'N/A (BS)', mamba: '균일 유계 (명제)' },
                          ].map((row) => (
                            <tr key={row.label} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                              <td className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">{row.label}</td>
                              <td className="px-3 py-2 text-center text-gray-500 dark:text-gray-400">{row.cnn}</td>
                              <td className="px-3 py-2 text-center text-gray-500 dark:text-gray-400">{row.transformer}</td>
                              <td className="px-3 py-2 text-center font-semibold text-green-600 dark:text-green-400">{row.mamba}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </Card>
              </div>
            </section>

            {/* ===== Section 4: RP-MPQ Offline ===== */}
            <section id="section-offline" className="scroll-mt-20">
              <SectionHeading
                icon={<HardDrive className="h-5 w-5" />}
                title="RP-MPQ 오프라인"
                collapsed={!!collapsed['section-offline']}
                onToggle={() => toggleSection('section-offline')}
              />
              <div
                className={`overflow-hidden transition-all duration-300 ${collapsed['section-offline'] ? 'max-h-0' : 'max-h-[9999px]'}`}
              >
                <Card>
                  {/* 4.1 */}
                  <SubSectionHeading number="4.1" title="혼합 정밀도 정책 공간" />
                  <p className="mb-5 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                    M개 블록 각각에 B = {'{'}2, 4, 8, 16{'}'} 비트 중 하나를 할당하면 정책 공간의 크기는{' '}
                    <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">|Π| = 4^M</span>
                    으로 지수적으로 증가합니다. M = 6이면 4096가지로 완전 탐색이 불가합니다.
                  </p>

                  {/* 4.2 */}
                  <SubSectionHeading number="4.2" title="Hessian 기반 민감도 대리 함수" />
                  <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                    블록 m을 b비트로 양자화했을 때의 손실 증가를 다음 대리 함수로 근사합니다:
                  </p>
                  <div className="mb-4 overflow-x-auto rounded-lg bg-amber-50 p-3 dark:bg-amber-900/20">
                    <div className="text-gray-900 dark:text-gray-100">
                      <EquationRenderer latex={String.raw`\Omega_m(b) \triangleq \mathrm{Tr}(\mathbf{H}_m)\,\|\Delta\boldsymbol{\theta}_m^{(b)}\|_2^2`} />
                    </div>
                  </div>

                  <HessianCurvatureViz />
                  <InfographicCaption>
                    Hessian의 대각 원소 합(Tr(H))이 클수록 해당 블록의 양자화 민감도가 높음을 나타냅니다.
                  </InfographicCaption>

                  {/* 4.3 */}
                  <div className="mt-6">
                    <SubSectionHeading number="4.3" title="ILP 기반 후보 생성 → KL 정제" />
                    <div className="mb-4 flex flex-wrap items-center gap-3">
                      <div className="flex flex-col items-center rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-800 dark:bg-blue-900/20">
                        <span className="text-xs font-bold text-blue-700 dark:text-blue-300">STEP 1</span>
                        <span className="mt-1 text-xs text-blue-600 dark:text-blue-400">ILP 후보 생성</span>
                        <span className="text-[10px] text-blue-500">4^M → K개</span>
                      </div>
                      <ChevronRight className="h-5 w-5 flex-shrink-0 text-gray-400" />
                      <div className="flex flex-col items-center rounded-lg border border-purple-200 bg-purple-50 px-4 py-3 dark:border-purple-800 dark:bg-purple-900/20">
                        <span className="text-xs font-bold text-purple-700 dark:text-purple-300">STEP 2</span>
                        <span className="mt-1 text-xs text-purple-600 dark:text-purple-400">KL 정제</span>
                        <span className="text-[10px] text-purple-500">K개 → Π_C</span>
                      </div>
                    </div>

                    <PolicySpaceViz />
                    <InfographicCaption>
                      ILP로 후보를 좁힌 후, KL 발산 기준으로 블록 간 상호작용까지 고려한 최적 정책을 선택합니다.
                    </InfographicCaption>
                  </div>
                </Card>
              </div>
            </section>

            {/* ===== Section 5: RP-MPQ Online ===== */}
            <section id="section-online" className="scroll-mt-20">
              <SectionHeading
                icon={<Zap className="h-5 w-5" />}
                title="RP-MPQ 온라인"
                collapsed={!!collapsed['section-online']}
                onToggle={() => toggleSection('section-online')}
              />
              <div
                className={`overflow-hidden transition-all duration-300 ${collapsed['section-online'] ? 'max-h-0' : 'max-h-[9999px]'}`}
              >
                <Card>
                  {/* 5.1 */}
                  <SubSectionHeading number="5.1" title="신뢰성 위반 비용" />
                  <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                    시간 t에서 정책 π를 적용했을 때의 신뢰성 위반 비용을 다음과 같이 정의합니다:
                  </p>
                  <div className="mb-3 overflow-x-auto rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
                    <div className="text-gray-900 dark:text-gray-100">
                      <EquationRenderer latex={String.raw`V_{t,\pi} = \mathbf{1}\!\left[r_t(\pi) < \gamma r_{\mathrm{ref}}\right] + \beta \frac{\max(0,\, \gamma r_{\mathrm{ref}} - r_t(\pi))}{\gamma r_{\mathrm{ref}} + \varepsilon}`} />
                    </div>
                  </div>
                  <p className="mb-4 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    희소성 가중치{' '}
                    <span className="font-mono text-xs text-gray-800 dark:text-gray-200">w_t = 1 + α · s_t</span>는
                    Hoyer 측도로 채널 행렬의 희소성 s_t를 측정합니다.
                    희소한 채널일수록 양자화 민감도가 커지므로 신뢰성 비용에 더 높은 가중치를 부여합니다.
                  </p>

                  <SparsityViz />
                  <InfographicCaption>
                    채널 유형별 지연-각도 도메인 에너지 분포와 Hoyer 측도: 희소 채널은 소수 계수에 에너지가 집중되어 양자화에 더 취약합니다.
                  </InfographicCaption>

                  {/* 5.2 */}
                  <SubSectionHeading number="5.2" title="온라인 의사결정 규칙" />
                  <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                    각 타임슬롯 t에서 후보 정책 집합 Π_C 중 최적 정책을 선택합니다:
                  </p>
                  <div className="mb-3 overflow-x-auto rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
                    <div className="text-gray-900 dark:text-gray-100">
                      <EquationRenderer latex={String.raw`\pi_t^\star = \mathop{\arg\min}_{\pi \in \Pi_{\mathcal{C}}} \left( w_t V_{t,\pi} + \lambda \kappa_\pi \right)`} />
                    </div>
                  </div>
                  <p className="mb-4 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    λ는 라그랑지안 이완으로 결정되며, 장기 연산 예산 제약을 만족하도록 온라인 업데이트됩니다.
                    κ_π는 정책 π의 연산 비용(BOP)입니다.
                  </p>

                  <BudgetOutageViz />
                  <InfographicCaption>
                    파레토 프론티어: 동일 예산(BOP 절약률)에서 RP-MPQ가 일관되게 가장 낮은 아웃에이지를 달성합니다.
                  </InfographicCaption>

                  {/* 5.3 */}
                  <SubSectionHeading number="5.3" title="신뢰성 보존 결과" />
                  <ReliabilityViz />
                  <InfographicCaption>
                    동일한 평균 연산 예산 하에서 RP-MPQ 온라인 선택이 아웃에이지(outage)를 크게 줄입니다.
                  </InfographicCaption>
                </Card>
              </div>
            </section>

            {/* ===== Section 6: Experiments ===== */}
            <section id="section-experiments" className="scroll-mt-20">
              <SectionHeading
                icon={<BarChart2 className="h-5 w-5" />}
                title="실험 결과"
                collapsed={!!collapsed['section-experiments']}
                onToggle={() => toggleSection('section-experiments')}
              />
              <div
                className={`overflow-hidden transition-all duration-300 ${collapsed['section-experiments'] ? 'max-h-0' : 'max-h-[9999px]'}`}
              >
                <Card>
                  <div className="mb-5 rounded-lg bg-gray-50 px-4 py-3 dark:bg-gray-800">
                    <p className="font-mono text-xs text-gray-600 dark:text-gray-400">
                      실험 환경: COST 2100 (실외, 5.3GHz), N_t=32, N_r=1, CR=1/4
                    </p>
                  </div>

                  {/* Table 1 */}
                  <p className="mb-2 text-sm font-bold text-gray-800 dark:text-gray-200">
                    Table 1. 구조적 성능 비교 (FP32)
                  </p>
                  <div className="mb-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800">
                          <th className="px-4 py-2 text-left font-semibold text-gray-600 dark:text-gray-400">모델</th>
                          <th className="px-4 py-2 text-center font-semibold text-gray-600 dark:text-gray-400">NMSE (dB)</th>
                          <th className="px-4 py-2 text-center font-semibold text-gray-600 dark:text-gray-400">인코더 FLOPs (M)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {[
                          { model: 'CsiNet', nmse: '-8.95', flops: '2.71', highlight: false },
                          { model: 'CsiNet+', nmse: '-12.40', flops: '12.29', highlight: false },
                          { model: 'TransNet', nmse: '-14.86', flops: '17.86', highlight: false },
                          { model: 'Mamba-Transformer AE (Ours)', nmse: '-15.34', flops: '4.87', highlight: true },
                        ].map((row) => (
                          <tr
                            key={row.model}
                            className={row.highlight ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}
                          >
                            <td className={`px-4 py-2 font-medium ${row.highlight ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'}`}>
                              {row.highlight && <span className="mr-1 text-indigo-500">★</span>}
                              {row.model}
                            </td>
                            <td className={`px-4 py-2 text-center font-mono ${row.highlight ? 'font-bold text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400'}`}>
                              {row.nmse}
                            </td>
                            <td className={`px-4 py-2 text-center font-mono ${row.highlight ? 'font-bold text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400'}`}>
                              {row.flops}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Table 2 */}
                  <p className="mb-2 text-sm font-bold text-gray-800 dark:text-gray-200">
                    Table 2. 균일 양자화 성능 비교
                  </p>
                  <div className="mb-4 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800">
                          <th className="px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-400">모델</th>
                          <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-gray-400">정밀도</th>
                          <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-gray-400">NMSE (dB)</th>
                          <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-gray-400">BOP 절약</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {[
                          { model: 'CsiNet', prec: 'INT16', nmse: '-8.95', bop: '75%', highlight: false, bad: false },
                          { model: 'CsiNet', prec: 'INT8', nmse: '0.68', bop: '87.5%', highlight: false, bad: true },
                          { model: 'CsiNet', prec: 'INT4', nmse: '17.35', bop: '93.75%', highlight: false, bad: true },
                          { model: 'Mamba-Transformer', prec: 'INT16', nmse: '-15.34', bop: '75%', highlight: true, bad: false },
                          { model: 'Mamba-Transformer', prec: 'INT8', nmse: '-15.12', bop: '87.5%', highlight: true, bad: false },
                          { model: 'Mamba-Transformer', prec: 'INT4', nmse: '0.04', bop: '93.75%', highlight: true, bad: false },
                        ].map((row, i) => (
                          <tr
                            key={i}
                            className={row.highlight ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}
                          >
                            <td className={`px-3 py-2 font-medium ${row.highlight ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'}`}>
                              {row.model}
                            </td>
                            <td className="px-3 py-2 text-center font-mono text-gray-600 dark:text-gray-400">{row.prec}</td>
                            <td className={`px-3 py-2 text-center font-mono font-semibold ${row.bad ? 'text-red-600 dark:text-red-400' : row.highlight ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400'}`}>
                              {row.nmse}
                            </td>
                            <td className="px-3 py-2 text-center font-mono text-gray-600 dark:text-gray-400">{row.bop}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 dark:border-indigo-800 dark:bg-indigo-900/20 mb-6">
                    <p className="text-xs leading-relaxed text-indigo-700 dark:text-indigo-300">
                      <span className="font-bold">핵심 관찰:</span> Mamba-Transformer는 INT8에서도 NMSE -15.12 dB를 유지하지만,
                      CsiNet은 INT8에서 이미 0.68 dB로 급격히 성능이 저하됩니다.
                      이는 Mamba 인코더의 양자화 내성이 현저히 높음을 보여줍니다.
                    </p>
                  </div>

                  <NmseVsBopScatterViz />
                  <InfographicCaption>
                    효율 프론티어: 오른쪽 아래가 최적 (高 BOP 절약 + 低 NMSE). RP-MPQ는 균일 양자화 대비 동일 예산에서 일관되게 우위.
                  </InfographicCaption>
                </Card>
              </div>
            </section>

            {/* ===== Section 7: Equations ===== */}
            <section id="section-equations" className="scroll-mt-20">
              <SectionHeading
                icon={<Hash className="h-5 w-5" />}
                title="핵심 수식"
                collapsed={!!collapsed['section-equations']}
                onToggle={() => toggleSection('section-equations')}
              />
              <div
                className={`overflow-hidden transition-all duration-300 ${collapsed['section-equations'] ? 'max-h-0' : 'max-h-[9999px]'}`}
              >
                <Card>
                  <div className="space-y-3">
                    {EQUATIONS.map((eq, idx) => (
                      <div
                        key={idx}
                        className="cursor-pointer rounded-xl border border-gray-200 bg-gray-50/50 p-5 transition-colors hover:border-blue-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-700"
                        onClick={() => toggleEq(idx)}
                      >
                        <div className="mb-2 flex items-center gap-2">
                          <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                            Eq. {idx + 1}
                          </span>
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            {eq.name}
                          </span>
                          <ChevronDown
                            className={`ml-auto h-4 w-4 text-gray-400 transition-transform dark:text-gray-500 ${expandedEqs.has(idx) ? 'rotate-180' : ''}`}
                          />
                        </div>
                        <div className="overflow-x-auto py-2 text-gray-900 dark:text-gray-100">
                          <EquationRenderer latex={eq.latex} />
                        </div>
                        {expandedEqs.has(idx) ? (
                          <div className="mt-3 rounded-lg bg-blue-50 px-4 py-3 dark:bg-blue-900/20">
                            <p className="text-sm leading-relaxed text-blue-900 dark:text-blue-100">
                              {eq.description}
                            </p>
                          </div>
                        ) : (
                          <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                            클릭하여 한국어 설명 보기
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </section>

            {/* ===== Section 8: Notes ===== */}
            <section id="section-notes" className="scroll-mt-20">
              <SectionHeading
                icon={<FileText className="h-5 w-5" />}
                title="연구 메모"
                collapsed={!!collapsed['section-notes']}
                onToggle={() => toggleSection('section-notes')}
              />
              <div
                className={`overflow-hidden transition-all duration-300 ${collapsed['section-notes'] ? 'max-h-0' : 'max-h-[9999px]'}`}
              >
                <Card>
                  {/* TODO list */}
                  <div className="mb-5">
                    <p className="mb-3 text-sm font-bold text-gray-700 dark:text-gray-300">TODO 리스트</p>
                    <div className="space-y-2">
                      {todos.map((todo) => (
                        <label
                          key={todo.id}
                          className="flex cursor-pointer items-start gap-3 rounded-lg px-3 py-2 transition hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <input
                            type="checkbox"
                            checked={todo.done}
                            onChange={() => toggleTodo(todo.id)}
                            className="mt-0.5 h-4 w-4 flex-shrink-0 rounded accent-blue-500"
                          />
                          <span
                            className={`text-sm ${todo.done ? 'text-gray-400 line-through dark:text-gray-600' : 'text-gray-700 dark:text-gray-300'}`}
                          >
                            {todo.text}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Free-form notes textarea */}
                  <div className="mb-4">
                    <p className="mb-2 text-sm font-bold text-gray-700 dark:text-gray-300">자유 메모</p>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="연구 아이디어, 리뷰어 예상 질문, 실험 계획 등을 자유롭게 적어주세요..."
                      rows={8}
                      className="w-full resize-y rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:border-blue-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:placeholder-gray-600 dark:focus:border-blue-600"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={saveNotes}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      저장 (localStorage)
                    </button>
                    {notesSaved && (
                      <span className="text-xs font-medium text-green-600 dark:text-green-400">
                        저장되었습니다.
                      </span>
                    )}
                  </div>
                </Card>
              </div>
            </section>

            <div className="h-16" />
          </div>
        </main>
      </div>
    </div>
  );
}
