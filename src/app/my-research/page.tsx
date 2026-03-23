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
import { useGlossary } from '@/hooks/useGlossary';
import { GlossaryTermsContext } from '@/components/glossary/GlossaryContext';
import katex from 'katex';
import dynamic from 'next/dynamic';
import ConceptsSection from '@/components/my-research/ConceptsSection';

const CnnVsSsmViz = dynamic(
  () => import('@/components/my-research/infographics/CnnVsSsmViz'),
  { ssr: false },
);
const ReliabilityViz = dynamic(
  () => import('@/components/my-research/infographics/ReliabilityViz'),
  { ssr: false },
);
// TwoLevelDistortionViz removed -- no longer used after paper revision
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
// QuantRobustProofViz removed -- no longer used after paper revision

/* ------------------------------------------------------------------ */
/*  ToC                                                                 */
/* ------------------------------------------------------------------ */

const TOC_SECTIONS = [
  { id: 'section-overview', label: '연구 개요', icon: BookOpen },
  { id: 'section-concepts', label: '배경 개념 사전', icon: Hash },
  { id: 'section-system-model', label: '시스템 모델', icon: Cpu },
  { id: 'section-architecture', label: 'MT-AE 아키텍처', icon: Layers },
  { id: 'section-offline', label: 'Segment DP 오프라인', icon: HardDrive },
  { id: 'section-online', label: '온라인 배포', icon: Zap },
  { id: 'section-experiments', label: '실험 결과', icon: BarChart2 },
  { id: 'section-equations', label: '핵심 수식', icon: FileText },
  { id: 'section-notes', label: '연구 메모', icon: FileText },
] as const;

/* ------------------------------------------------------------------ */
/*  Equations data                                                      */
/* ------------------------------------------------------------------ */

const EQUATIONS = [
  {
    name: '지연 도메인 변환',
    latex: String.raw`\mathbf{H}_d[\ell] = \frac{1}{\sqrt{N_f}} \sum_{n=0}^{N_f-1} \mathbf{H}[n]\, e^{j 2\pi n\ell/N_f}`,
    description:
      '주파수 도메인 CSI를 IDFT로 지연 도메인 탭으로 변환합니다. 이후 각 탭을 각도 도메인으로 다시 변환하여 delay--angular 표현을 구성합니다.',
  },
  {
    name: '각도 도메인 변환',
    latex: String.raw`\mathbf{X}[\ell] = \mathbf{F}_r \mathbf{H}_d[\ell] \mathbf{F}_t^{\mathsf{H}}`,
    description:
      '지연 도메인 채널을 각도 도메인으로 사상합니다. off-grid 경로가 있을 때 에너지가 여러 각도 빈으로 퍼지며, 이것이 롱테일 구조와 soft locality 논의의 출발점입니다.',
  },
  {
    name: '절단 지연-각도 CSI',
    latex: String.raw`\mathbf{X}_a = [\mathbf{X}[0],\ldots,\mathbf{X}[N_a-1]]`,
    description:
      '지연 도메인에서 처음 N_a개의 유효 탭만 취하여 입력 차원을 줄입니다. 대부분의 채널 에너지가 앞쪽 탭에 집중되므로, 이 절단은 최소한의 정보 손실로 차원을 크게 줄여줍니다.',
  },
  {
    name: '압축비 (Compression Ratio)',
    latex: String.raw`\mathrm{CR} = \frac{D}{2\,N_a\,N_r\,N_t}`,
    description:
      'Autoencoder latent 차원 D를 원본 실수 차원 2·N_a·N_r·N_t으로 나눈 비율입니다. CR이 작을수록 더 공격적인 압축을 의미합니다.',
  },
  {
    name: 'SSM 재귀식',
    latex: String.raw`\mathbf{s}_{k+1} = \mathbf{A}\,\mathbf{s}_k + \mathbf{B}\,\mathbf{u}_k,\qquad \mathbf{y}_k = \mathbf{C}\,\mathbf{s}_k`,
    description:
      '선형 상태 공간 모델의 이산 시간 재귀식입니다. 상태 벡터 s가 입력 u를 순차적으로 집약하며, 안정적인 A에 대해 과거 입력의 기여가 지수적으로 감쇠합니다.',
  },
  {
    name: '하드 국소성 절단 손실',
    latex: String.raw`E_{\mathrm{hard}}(L) \lesssim c_0^2\sum_{d=L+1}^{\infty}\frac{1}{(1+d)^2} \le \frac{c_0^2}{1+L} = \mathcal{O}(L^{-1})`,
    description:
      'CNN 수용장 반경 L 바깥의 테일 에너지. 다항 감쇠 O(L⁻¹)이므로 절단 손실을 줄이려면 L을 크게 늘려야 합니다 → UE 연산량·지연 증가.',
  },
  {
    name: 'SSM 소프트 테일 기여',
    latex: String.raw`R_{\mathrm{soft}}(L) \lesssim c_3\sum_{d=L+1}^{\infty}\frac{e^{-\alpha d}}{1+d} = \mathcal{O}\!\left(\frac{e^{-\alpha L}}{1+L}\right)`,
    description:
      '안정적인 SSM이 먼 계수를 hard cutoff 없이 지수적으로 감쇠된 가중치로 집약하는 효과를 나타냅니다. 하드 절단보다 tail 기여가 훨씬 빠르게 감소합니다.',
  },
  {
    name: '에너지 맵',
    latex: String.raw`P_{ij} = \frac{|X_{ij}|^2}{\sum_{u,v}|X_{uv}|^2}`,
    description:
      '지연-각도 도메인 CSI의 정규화된 에너지 분포입니다. 이 맵을 기반으로 구조 기술자 ζ를 계산하여 현재 CSI가 compact한지 diffuse한지를 판별합니다.',
  },
  {
    name: '구조 기술자 (Structural Mismatch Index)',
    latex: String.raw`\zeta(\mathbf{X}_a) = 1 - \lambda_d\,c_d - \lambda_a\,c_a`,
    description:
      '현재 CSI가 얼마나 compact한지 혹은 diffuse한지를 요약하는 구조 상태입니다. c_d, c_a는 각각 지연축·각도축 per-axis compactness 점수이며, 작을수록 encoder-friendly한 국소 구조, 클수록 leakage tail이 강한 확산 구조를 의미합니다.',
  },
  {
    name: '정규화된 신뢰성 shortfall',
    latex: String.raw`V_i(\pi;\gamma) = \frac{[\gamma\, r_i^{\mathrm{ref}} - r_i(\pi)]_+}{\gamma\, r_i^{\mathrm{ref}} + \eta_r}`,
    description:
      '앵커 정책 대비 현재 정책이 rate reliability 목표를 얼마나 못 맞췄는지 정규화하여 측정합니다. NMSE가 아니라 전송률 기반 reliability shortfall을 직접 제어합니다.',
  },
  {
    name: '세그먼트 importance',
    latex: String.raw`\Omega_S(\boldsymbol{\xi};\,b) = \mathbb{E}\!\left[\Delta\ell_S(b)\,\middle|\,\boldsymbol{\xi}\right]`,
    description:
      '연속 세그먼트 S를 bit-width b로 설정했을 때의 기대 distortion 증가를 상태 ξ에 조건부로 평균낸 값입니다. Segment DP의 비용 함수를 구성하는 핵심 요소입니다.',
  },
  {
    name: 'Segment DP 재귀식',
    latex: String.raw`F(m,\,c) = \min_{l}\!\left[F(l,\,c-\kappa) + \Omega_{[l:m)}(\boldsymbol{\xi};\,b)\right]`,
    description:
      'm번째 파라미터까지 총 비용 c를 사용하여 최적 연속 세그먼트 분할을 찾는 동적 프로그래밍 재귀식입니다. 각 세그먼트는 동일 bit-width를 공유하므로 하드웨어 연속성이 보장됩니다.',
  },
  {
    name: 'Shrinkage 추정자',
    latex: String.raw`\hat{\Omega}^{(j,k)}(b) = \alpha\,\hat{\Omega}^{\mathrm{raw}} + (1-\alpha)\,\bar{\Omega}`,
    description:
      'Sample이 적은 state cell의 importance 추정치를 global mean으로 부분 수축시켜 과적합과 noisy estimate를 방지합니다. α는 cell 내 sample 수에 따라 결정됩니다.',
  },
  {
    name: '온라인 정책 조회',
    latex: String.raw`\boldsymbol{\xi}_t=(\rho_t,\zeta(\mathbf{X}_a)),\qquad \pi_t=\mu(\boldsymbol{\xi}_t),\qquad \tilde{\mathbf{z}}_t=f_\theta(\mathbf{X}_a;\pi_t)`,
    description:
      '온라인 단계에서는 현재 상태를 계산한 뒤 미리 구축한 state-to-policy map에서 정책을 한 번 조회하고, 그 정책으로 인코더를 실행합니다. 온라인 최적화는 존재하지 않습니다.',
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
  const { terms: glossaryTerms } = useGlossary();

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
    <GlossaryTermsContext.Provider value={glossaryTerms}>
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
                    Contiguous-Segment Mixed-Precision Quantization for Asymmetric CSI Feedback Autoencoders
                  </h1>
                  <p className="mt-3 text-sm text-indigo-200">
                    박현재, 최완 (서울대학교 전기정보공학부)
                  </p>
                  <p className="mt-1 text-xs italic text-indigo-300">Under submission · 2026</p>
                </div>

                {/* White body */}
                <div className="bg-white p-6 dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
                  <p className="leading-relaxed text-gray-700 dark:text-gray-300">
                    이 연구는 FDD massive MIMO에서{' '}
                    <span className="font-semibold text-indigo-700 dark:text-indigo-300">UE latency·energy·compute 제약</span> 아래
                    CSI feedback을 어떻게 신뢰성 있게 유지할지를 다룹니다. 핵심은 UE에는 경량 Mamba SSM encoder,
                    BS에는 고용량 Transformer decoder를 두는{' '}
                    <span className="font-semibold text-indigo-700 dark:text-indigo-300">MT-AE (Mamba-Transformer Autoencoder)</span>와,
                    그 위에서 동작하는{' '}
                    <span className="font-semibold text-emerald-700 dark:text-emerald-300">Contiguous-Segment Mixed-Precision Quantization</span>
                    입니다. 오프라인 Segment DP는 2차원 무선 상태 ξ=(ρ, ζ) 위에서 importance surface와 연속 세그먼트 분할을
                    동적 프로그래밍으로 최적화하고, Joint DP는 상태별 예산 배분을 추가하여 outage cliff를 더 높은 BOP 절약 구간으로 밀어냅니다.
                    온라인에서는 단 한 번의 O(1) table lookup만 수행합니다.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                      Segment DP + Joint DP
                    </span>
                    <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                      MT-AE (Mamba–Transformer)
                    </span>
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-300">
                      Offline LUT + Online O(1)
                    </span>
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                      ξ = (ρ, ζ) 2D 무선 상태
                    </span>
                    <span className="rounded-full border border-dashed border-gray-300 px-3 py-1 text-xs font-medium text-gray-500 dark:border-gray-600 dark:text-gray-400">
                      제출 준비 중
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {[
                      {
                        title: 'MT-AE Architecture',
                        body: 'UE는 수축적 상태 역학 기반의 경량 Mamba SSM encoder, BS는 고용량 Transformer decoder로 역할을 분리합니다.',
                      },
                      {
                        title: 'Segment DP (Offline)',
                        body: '2D 상태 ξ=(ρ, ζ) 위에서 contiguous-segment importance surface를 추정하고, DP 재귀로 최적 세그먼트 분할과 bit-width를 결정합니다. Joint DP는 상태별 예산 배분을 추가합니다.',
                      },
                      {
                        title: 'Online Deployment',
                        body: '현재 CSI에서 ζ를 O(1)로 계산하고 μ(ξ_t) table lookup으로 곧바로 mixed-precision policy를 적용합니다.',
                      },
                    ].map((item) => (
                      <div
                        key={item.title}
                        className="rounded-xl border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-800 dark:bg-gray-800/70"
                      >
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">
                          {item.title}
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                          {item.body}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* ===== Section: 배경 개념 사전 ===== */}
            <section id="section-concepts" className="scroll-mt-20">
              <SectionHeading
                icon={<Hash className="h-5 w-5" />}
                title="배경 개념 사전"
                collapsed={!!collapsed['section-concepts']}
                onToggle={() => toggleSection('section-concepts')}
              />
              <div
                className={`overflow-hidden transition-all duration-300 ${collapsed['section-concepts'] ? 'max-h-0' : 'max-h-[9999px]'}`}
              >
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


                  {/* 2.3 Truncated CSI & CR */}
                  <div className="mt-6">
                    <SubSectionHeading number="2.3" title="절단 지연-각도 CSI와 압축비" />
                    <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                      지연 도메인에서 에너지가 집중된 처음 N_a개의 유효 탭만 취하여 입력 차원을 줄입니다.
                      Autoencoder는 이 절단 CSI를 D차원 잠재 벡터로 압축하며, 압축비(CR)는 다음과 같이 정의됩니다.
                    </p>
                    <div className="mb-4 space-y-3">
                      <div className="rounded-lg bg-indigo-50 p-3 dark:bg-indigo-900/20">
                        <p className="mb-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300">절단 CSI:</p>
                        <div className="overflow-x-auto text-gray-900 dark:text-gray-100">
                          <EquationRenderer latex={String.raw`\mathbf{X}_a = [\mathbf{X}[0],\,\ldots,\,\mathbf{X}[N_a-1]]`} />
                        </div>
                      </div>
                      <div className="rounded-lg bg-indigo-50 p-3 dark:bg-indigo-900/20">
                        <p className="mb-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300">압축비 정의:</p>
                        <div className="overflow-x-auto text-gray-900 dark:text-gray-100">
                          <EquationRenderer latex={String.raw`\mathrm{CR} = \frac{D}{2\,N_a\,N_r\,N_t}`} />
                        </div>
                      </div>
                    </div>
                    <p className="mb-4 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                      본 연구에서는 N_a = 32, N_r = 1, N_t = 32를 사용하며, CR = 1/4일 때 D = 512입니다.
                    </p>
                  </div>

                  {/* 2.4 */}
                  <div className="mt-6">
                    <SubSectionHeading number="2.4" title="UE Constraints and Design Perspective" />
                    <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                      CSI feedback is constrained by UE-side latency, energy, and compute limits.
                      This motivates architectures with a lightweight UE-side encoder and a higher-capacity BS-side decoder.
                    </p>
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/40 dark:bg-blue-900/10">
                      <p className="mb-1 text-xs font-bold text-blue-700 dark:text-blue-300">UE-BS Asymmetry</p>
                      <p className="text-xs leading-relaxed text-blue-600 dark:text-blue-400">
                        UE는 전력, 지연, 연산 자원이 제한되어 경량 인코더가 필수적입니다.
                        반면 BS는 충분한 자원을 갖고 있으므로 고용량 디코더를 배치할 수 있습니다.
                        이러한 비대칭 구조는 제한된 UE 측 연산 자원 하에서 최대의 복원 품질을 달성하기 위한 설계 기반입니다.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </section>

            {/* ===== Section 3: Architecture ===== */}
            <section id="section-architecture" className="scroll-mt-20">
              <SectionHeading
                icon={<Layers className="h-5 w-5" />}
                title="MT-AE 비대칭 아키텍처 (§3)"
                collapsed={!!collapsed['section-architecture']}
                onToggle={() => toggleSection('section-architecture')}
              />
              <div
                className={`overflow-hidden transition-all duration-300 ${collapsed['section-architecture'] ? 'max-h-0' : 'max-h-[9999px]'}`}
              >
                <Card>
                  {/* 3.1 UE-BS 비대칭성 */}
                  <SubSectionHeading number="3.1" title="MT-AE: Mamba-Transformer Autoencoder" />
                  <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                    <span className="font-semibold text-indigo-700 dark:text-indigo-300">MT-AE</span>는
                    UE encoder로 Mamba SSM, BS decoder로 Transformer를 사용하는 비대칭 오토인코더입니다.
                    UE 측 인코더는 경량이어야 하지만, 지연-각도 도메인 CSI는 off-grid 경로로 인한
                    롱테일 구조를 가집니다. Mamba의 수축적 상태 역학(contractive state dynamics)이
                    양자화 내성을 보장하여, INT8에서도 거의 손실 없는 NMSE (-15.19 dB)를 달성합니다.
                    CNN 기반 인코더는 INT8에서 붕괴하는 것과 대조적입니다.
                  </p>

                  {/* 3.2 롱테일 특성 */}
                  <div className="mt-7">
                    <SubSectionHeading number="3.2" title="지연-각도 도메인 CSI의 롱테일 국소성" />
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
                    <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                      선형 SSM의 이산 시간 재귀식과 합성곱 표현을 보면, 안정적인 A에 대해 지수 감쇠 가중치를 가집니다:
                    </p>
                    <div className="mb-3 space-y-2">
                      <div className="overflow-x-auto rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                        <p className="mb-1 text-xs font-semibold text-slate-700 dark:text-slate-300">SSM 재귀식:</p>
                        <div className="text-gray-900 dark:text-gray-100">
                          <EquationRenderer latex={String.raw`\mathbf{s}_{k+1} = \mathbf{A}\,\mathbf{s}_k + \mathbf{B}\,\mathbf{u}_k,\qquad \mathbf{y}_k = \mathbf{C}\,\mathbf{s}_k`} />
                        </div>
                      </div>
                      <div className="overflow-x-auto rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                        <p className="mb-1 text-xs font-semibold text-slate-700 dark:text-slate-300">합성곱 표현 및 지수 감쇠:</p>
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

                    {/* Interactive tail comparison */}
                    <HardVsSoftTailViz />
                    <InfographicCaption>
                      슬라이더로 수용장 L과 SSM 감쇠율 α를 조절: 같은 L에서 소프트 테일 잔여가 지수 배율로 더 작습니다.
                    </InfographicCaption>
                  </div>

                  {/* 3.5 양자화 내성 */}
                  <div className="mt-7">
                    <SubSectionHeading number="3.5" title="수축적 상태 공간 인코더의 양자화 내성" />
                    <div className="mb-4 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/20 px-4 py-4">
                      <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 mb-3">
                        UE-side inference requires low-precision execution, and post-training quantization
                        introduces parameter perturbations{' '}
                        <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400">θ̂ = θ + Δθ</span>.
                      </p>
                      <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 mb-3">
                        In Mamba&apos;s parameterization, the discretized state matrix is diagonal with entries{' '}
                        <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400">
                          Ā{"_{t,ii}"} = exp(-Δ{"_{t,i}"}·softplus(A{"_{param,i}"}))
                        </span>.
                        Since both Δ_{"{t,i}"} &gt; 0 and softplus(·) &gt; 0, every entry satisfies{' '}
                        <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400">0 &lt; Ā_{"t,ii"} &lt; 1</span>,
                        making the state recursion inherently contractive for all inputs.
                      </p>
                      <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                        Unlike feedforward stacking where quantization errors accumulate with depth,
                        a contractive state recursion prevents perturbation amplification:
                        the output deviation converges to a finite steady-state bound independent of sequence length.
                      </p>
                    </div>
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
                          <p>• 양자화 내성: 출력 오차 균일 유계 (수축성 기반)</p>
                          <p>• 선택적 스캔: 지배 경로 집중 포착</p>
                        </div>
                      </div>
                      <div className="rounded-xl border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/20">
                        <p className="mb-1 text-xs font-bold uppercase tracking-wide text-purple-700 dark:text-purple-300">BS 디코더</p>
                        <p className="text-sm font-semibold text-purple-900 dark:text-purple-100">Transformer (TransNet 계열)</p>
                        <p className="mt-1 text-xs text-purple-600 dark:text-purple-400">고용량, 전역 어텐션, O(N²) 허용</p>
                        <div className="mt-3 space-y-1 text-[10px] text-purple-700 dark:text-purple-300">
                          <p>• 고용량 복원으로 BS-side 정확도 담당</p>
                          <p>• 충분한 연산 자원으로 복원 품질 최대화</p>
                          <p>• 인코더 설계와 독립적으로 확장 가능</p>
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
                            { label: '양자화 내성', cnn: '낮음', transformer: 'N/A (BS)', mamba: '균일 유계 (수축성)' },
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

            {/* ===== Section 4: Segment DP Offline ===== */}
            <section id="section-offline" className="scroll-mt-20">
              <SectionHeading
                icon={<HardDrive className="h-5 w-5" />}
                title="Segment DP 오프라인"
                collapsed={!!collapsed['section-offline']}
                onToggle={() => toggleSection('section-offline')}
              />
              <div
                className={`overflow-hidden transition-all duration-300 ${collapsed['section-offline'] ? 'max-h-0' : 'max-h-[9999px]'}`}
              >
                <Card>
                  <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-900/40 dark:bg-emerald-900/10">
                    <p className="text-sm leading-relaxed text-emerald-800 dark:text-emerald-200">
                      Segment DP의 오프라인 단계는{' '}
                      <span className="font-semibold">UE encoder weights에만 mixed precision</span>을 적용하고,
                      activations는 INT16, feedback latent quantization은 고정한 채 진행됩니다.
                      핵심은 Hessian-based block saliency가 아니라{' '}
                      <span className="font-semibold">2D 무선 상태 ξ=(ρ, ζ)에 조건부인 contiguous-segment importance surface</span>를
                      먼저 만들고, 동적 프로그래밍(DP) 재귀로 최적 세그먼트 분할과 bit-width를 결정합니다.
                      Joint DP 확장은 상태별 예산 배분을 outer DP로 추가 최적화하여 outage cliff를 더 높은 BOP 절약 구간으로 밀어냅니다.
                    </p>
                  </div>

                  <SubSectionHeading number="4.1" title="혼합 정밀도 정책 공간과 비용" />
                  <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                    UE-side encoder의 M개 블록에 대해 bit-width 집합 <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400">{'{'}16, 8, 4, 2{'}'}</span>
                    에서 하나씩 고르면 정책은 block-wise assignment가 됩니다. 정책 공간은 빠르게 폭발하므로, 각 정책을 직접 전수 평가하는 방식은 사용할 수 없습니다.
                  </p>
                  <div className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
                    <div className="overflow-x-auto rounded-lg bg-indigo-50 p-3 dark:bg-indigo-900/20">
                      <p className="mb-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300">정책 정의</p>
                      <div className="text-gray-900 dark:text-gray-100">
                        <EquationRenderer latex={String.raw`\pi \triangleq (b_1, b_2, \ldots, b_M), \qquad b_m \in \mathcal{B}`} />
                      </div>
                    </div>
                    <div className="overflow-x-auto rounded-lg bg-indigo-50 p-3 dark:bg-indigo-900/20">
                      <p className="mb-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300">정책 공간과 비용</p>
                      <div className="text-gray-900 dark:text-gray-100">
                        <EquationRenderer latex={String.raw`|\Pi| = |\mathcal{B}|^M,\qquad \kappa_{\pi} \triangleq \sum_{m=1}^{M}\kappa_m(b_m)`} />
                      </div>
                    </div>
                  </div>

                  <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/40 dark:bg-blue-900/10">
                      <p className="mb-1 text-xs font-bold text-blue-700 dark:text-blue-300">왜 어려운가?</p>
                      <p className="text-xs leading-relaxed text-blue-600 dark:text-blue-400">
                        정책 수가 bit-width 후보 수의 M제곱으로 증가하므로 moderate M에서도 brute-force가 불가능합니다.
                      </p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/80">
                      <p className="mb-1 text-xs font-bold text-slate-700 dark:text-slate-300">오프라인 목표</p>
                      <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                        모든 정책을 다 시험하는 대신, 상태마다 어떤 block-bit 조합이 reliability에 치명적인지 surface로 요약합니다.
                      </p>
                    </div>
                  </div>

                  <SubSectionHeading number="4.2" title="무선 상태와 구조 기술자" />
                  <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                    Segment DP는 현재 무선 환경을 단순한 SNR 하나가 아니라{' '}
                    <span className="font-semibold">수신 SNR ρ와 구조 불일치 지표(structural mismatch index) ζ</span>의 2차원 상태 ξ=(ρ, ζ)로 요약합니다.
                    ζ는 에너지 맵 P로부터 지연축·각도축 per-axis compactness 점수 c_d, c_a를 계산하여 도출됩니다.
                    작은 ζ는 compact/easy CSI, 큰 ζ는 diffuse/hard CSI를 의미합니다. 온라인에서 O(1)로 계산됩니다.
                  </p>
                  <div className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
                    <div className="overflow-x-auto rounded-lg bg-amber-50 p-3 dark:bg-amber-900/20">
                      <p className="mb-1 text-xs font-semibold text-amber-700 dark:text-amber-300">에너지 맵 P</p>
                      <div className="text-gray-900 dark:text-gray-100">
                        <EquationRenderer latex={String.raw`P_{ij} = \frac{|X_{ij}|^2}{\sum_{u,v}|X_{uv}|^2}`} />
                      </div>
                    </div>
                    <div className="overflow-x-auto rounded-lg bg-amber-50 p-3 dark:bg-amber-900/20">
                      <p className="mb-1 text-xs font-semibold text-amber-700 dark:text-amber-300">구조 불일치 지표 ζ</p>
                      <div className="text-gray-900 dark:text-gray-100">
                        <EquationRenderer latex={String.raw`\zeta(\mathbf{X}_a) = 1 - \lambda_d\,c_d - \lambda_a\,c_a`} />
                      </div>
                    </div>
                    <div className="overflow-x-auto rounded-lg bg-rose-50 p-3 dark:bg-rose-900/20">
                      <p className="mb-1 text-xs font-semibold text-rose-700 dark:text-rose-300">정규화 shortfall</p>
                      <div className="text-gray-900 dark:text-gray-100">
                        <EquationRenderer latex={String.raw`V_i(\pi;\gamma) = \frac{[\gamma\, r_i^{\mathrm{ref}} - r_i(\pi)]_+}{\gamma\, r_i^{\mathrm{ref}} + \eta_r}`} />
                      </div>
                    </div>
                  </div>

                  <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {[
                      ['ρ', '수신 SNR이 높을수록 같은 quantization error가 rate degradation으로 더 직접 연결됩니다.'],
                      ['ζ', '작으면 compact한 CSI, 크면 diffuse multipath / off-grid leakage가 강한 CSI입니다.'],
                      ['γ', 'reference rate 대비 어느 수준까지 보존할지를 정하는 reliability target입니다.'],
                    ].map(([label, body]) => (
                      <div
                        key={label}
                        className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/70"
                      >
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">{label}</p>
                        <p className="mt-2 text-xs leading-relaxed text-gray-700 dark:text-gray-300">{body}</p>
                      </div>
                    ))}
                  </div>

                  <SubSectionHeading number="4.3" title="Contiguous-segment importance surface 추정" />
                  <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                    연속 세그먼트 S를 bit-width b로 설정했을 때 distortion이 얼마나 늘어나는지를 상태 ξ에 조건부로 평균내어 importance surface를 만듭니다.
                    block 단위가 아닌 contiguous segment 단위로 perturbation을 측정하여 하드웨어 연속성을 보장합니다.
                  </p>
                  <div className="mb-4 overflow-x-auto rounded-lg bg-emerald-50 p-3 dark:bg-emerald-900/20">
                    <p className="mb-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">세그먼트 importance:</p>
                    <div className="text-gray-900 dark:text-gray-100">
                      <EquationRenderer latex={String.raw`\Omega_S(\boldsymbol{\xi};\,b) = \mathbb{E}\!\left[\Delta\ell_S(b)\,\middle|\,\boldsymbol{\xi}\right]`} />
                    </div>
                  </div>

                  <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-3">
                    <div className="rounded-lg border border-teal-200 bg-teal-50 p-4 dark:border-teal-900/40 dark:bg-teal-900/10">
                      <p className="mb-1 text-xs font-bold text-teal-700 dark:text-teal-300">Raw cell average</p>
                      <p className="text-xs leading-relaxed text-teal-600 dark:text-teal-400">
                        상태 공간 (ρ, ζ)을 quantile grid로 나눈 뒤, 각 cell에서 segment-bit marginal distortion을 평균냅니다.
                      </p>
                    </div>
                    <div className="rounded-lg border border-violet-200 bg-violet-50 p-4 dark:border-violet-900/40 dark:bg-violet-900/10">
                      <p className="mb-1 text-xs font-bold text-violet-700 dark:text-violet-300">Shrinkage 추정</p>
                      <p className="text-xs leading-relaxed text-violet-600 dark:text-violet-400">
                        sample이 적은 cell은 global mean으로 부분 수축: <span className="font-mono text-[10px]">Ω̂ = α·Ω̂_raw + (1-α)·Ω̄</span>
                      </p>
                    </div>
                    <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-900/40 dark:bg-orange-900/10">
                      <p className="mb-1 text-xs font-bold text-orange-700 dark:text-orange-300">Monotone calibration</p>
                      <p className="text-xs leading-relaxed text-orange-600 dark:text-orange-400">
                        high SNR에서 sensitivity가 줄고, diffuse CSI에서 sensitivity가 커지는 물리적 monotonicity를 isotonic하게 보정합니다.
                      </p>
                    </div>
                  </div>

                  <div className="mb-4 overflow-x-auto rounded-lg bg-violet-50 p-3 dark:bg-violet-900/20">
                    <p className="mb-1 text-xs font-semibold text-violet-700 dark:text-violet-300">Shrinkage 추정자:</p>
                    <div className="text-gray-900 dark:text-gray-100">
                      <EquationRenderer latex={String.raw`\hat{\Omega}^{(j,k)}(b) = \alpha\,\hat{\Omega}^{\mathrm{raw}} + (1-\alpha)\,\bar{\Omega}`} />
                    </div>
                  </div>

                  <SubSectionHeading number="4.4" title="Segment DP: 최적 연속 세그먼트 분할" />
                  <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                    importance surface가 준비되면, 동적 프로그래밍(DP) 재귀로 파라미터를 연속 세그먼트로 분할하고
                    각 세그먼트에 최적 bit-width를 할당합니다. 같은 세그먼트 내 파라미터는 동일한 bit-width를 공유하므로
                    하드웨어 구현에서의 연속성이 자동으로 보장됩니다.
                  </p>
                  <div className="mb-4 overflow-x-auto rounded-lg bg-sky-50 p-3 dark:bg-sky-900/20">
                    <p className="mb-1 text-xs font-semibold text-sky-700 dark:text-sky-300">Segment DP 재귀식:</p>
                    <div className="text-gray-900 dark:text-gray-100">
                      <EquationRenderer latex={String.raw`F(m,\,c) = \min_{l}\!\left[F(l,\,c-\kappa) + \Omega_{[l:m)}(\boldsymbol{\xi};\,b)\right]`} />
                    </div>
                  </div>
                  <p className="mb-4 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    F(m, c)는 m번째 파라미터까지 총 비용 c를 사용한 최소 distortion이며, traceback으로 최적 세그먼트 경계와 bit-width가 복원됩니다.
                  </p>

                  <SubSectionHeading number="4.5" title="Joint DP: 상태별 예산 배분" />
                  <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                    Joint DP는 Segment DP 위에 <span className="font-semibold">outer DP</span>를 추가합니다.
                    각 상태 cell (ρ, ζ)마다 독립적으로 동일한 예산을 쓰는 대신, outer DP가
                    채널 조건별 예산 배분을 최적화하여 어려운 상태(높은 ζ)에 더 많은 bit budget을 할당합니다.
                  </p>
                  <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-900/40 dark:bg-indigo-900/10">
                      <p className="mb-1 text-xs font-bold text-indigo-700 dark:text-indigo-300">Segment DP (inner)</p>
                      <p className="text-xs leading-relaxed text-indigo-600 dark:text-indigo-400">
                        주어진 예산 c 하에서 연속 세그먼트 분할과 bit-width를 최적화합니다.
                      </p>
                    </div>
                    <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-900/40 dark:bg-purple-900/10">
                      <p className="mb-1 text-xs font-bold text-purple-700 dark:text-purple-300">Joint DP (outer)</p>
                      <p className="text-xs leading-relaxed text-purple-600 dark:text-purple-400">
                        상태별 예산 배분을 최적화하여 outage cliff를 더 높은 BOP 절약 구간으로 이동시킵니다.
                        NMSE 비용 없이 outage probability를 개선합니다.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr]">
                    {[
                      ['Step 1', 'State binning', '(ρ, ζ) grid를 만들고 sample들을 상태별로 나눕니다.'],
                      ['Step 2', 'Importance estimation', '각 cell에서 contiguous-segment importance를 추정·shrinkage 보정합니다.'],
                      ['Step 3', 'Segment DP', '각 cell마다 DP 재귀로 최적 세그먼트 분할과 bit-width를 결정합니다.'],
                      ['Step 4', 'Joint DP', 'Outer DP로 상태별 예산 배분을 최적화합니다.'],
                    ].map((item, index) => (
                      <div key={item[0]} className="contents">
                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/70">
                          <p className="text-xs font-bold uppercase tracking-[0.14em] text-indigo-600 dark:text-indigo-300">{item[0]}</p>
                          <p className="mt-2 text-sm font-semibold text-gray-800 dark:text-gray-200">{item[1]}</p>
                          <p className="mt-2 text-xs leading-relaxed text-gray-600 dark:text-gray-400">{item[2]}</p>
                        </div>
                        {index < 3 && (
                          <div className="hidden items-center justify-center lg:flex">
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <InfographicCaption>
                    Segment DP 오프라인 단계: 상태 ξ마다 달라지는 contiguous-segment importance surface 위에서 DP 재귀로 최적 분할을 구하고, Joint DP가 상태별 예산 배분을 추가 최적화합니다.
                  </InfographicCaption>
                </Card>
              </div>
            </section>

            {/* ===== Section 5: Online Deployment ===== */}
            <section id="section-online" className="scroll-mt-20">
              <SectionHeading
                icon={<Zap className="h-5 w-5" />}
                title="온라인 배포"
                collapsed={!!collapsed['section-online']}
                onToggle={() => toggleSection('section-online')}
              />
              <div
                className={`overflow-hidden transition-all duration-300 ${collapsed['section-online'] ? 'max-h-0' : 'max-h-[9999px]'}`}
              >
                <Card>
                  <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-900/40 dark:bg-blue-900/10">
                    <p className="text-sm leading-relaxed text-blue-800 dark:text-blue-200">
                      온라인 배포의 핵심은{' '}
                      <span className="font-semibold">runtime optimization을 완전히 없애는 것</span>입니다.
                      오프라인 Segment DP (+ Joint DP)에서 이미 μ(ξ)를 완성했기 때문에,
                      실제 UE는 현재 CSI에서 ξ=(ρ, ζ)를 O(1)로 계산하고 즉시 table lookup으로 policy를 조회합니다 (Algorithm 1).
                    </p>
                  </div>

                  <SubSectionHeading number="5.1" title="온라인 의사결정 규칙" />
                  <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                    매 CSI realization마다 UE는 현재 SNR과 구조 상태 ζ만 계산하고, 그 상태에 맞는 mixed-precision policy를 표에서 꺼내 씁니다.
                    즉, 정책 선택은 search가 아니라 lookup입니다.
                  </p>
                  <div className="mb-4 overflow-x-auto rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
                    <div className="text-gray-900 dark:text-gray-100">
                      <EquationRenderer latex={String.raw`\boldsymbol{\xi}_t=(\rho_t,\zeta(\mathbf{X}_a)),\qquad \pi_t=\mu(\boldsymbol{\xi}_t),\qquad \tilde{\mathbf{z}}_t=f_\theta(\mathbf{X}_a;\pi_t)`} />
                    </div>
                  </div>

                  <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-4">
                    {[
                      ['1', 'State sensing', '현재 SNR ρ_t와 구조 상태 ζ(X_a)를 계산합니다.'],
                      ['2', 'Cell lookup', '오프라인에서 만든 μ(ξ)에서 해당 state cell의 policy를 꺼냅니다.'],
                      ['3', 'Mixed-precision encoding', '선택된 block-wise bit-width로 UE encoder를 실행합니다.'],
                      ['4', 'Feedback', '양자화된 latent를 BS에 전송하고, BS는 고용량 decoder로 복원합니다.'],
                    ].map(([step, title, body]) => (
                      <div
                        key={step}
                        className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/70"
                      >
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                            {step}
                          </span>
                          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{title}</p>
                        </div>
                        <p className="mt-2 text-xs leading-relaxed text-gray-600 dark:text-gray-400">{body}</p>
                      </div>
                    ))}
                  </div>

                  <SubSectionHeading number="5.2" title="O(1) 온라인 복잡도" />
                  <p className="mb-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                    온라인 비용은 구조 상태 ζ 계산(에너지 맵에서 compactness 점수 도출)과 table lookup뿐입니다.
                    두 연산 모두 O(1) 복잡도이므로 실제 overhead는 encoder inference에 비해 미미하고,
                    상태-적응형 mixed-precision을 적용하면서도 runtime optimization latency가 전혀 붙지 않습니다.
                  </p>
                  <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/80">
                      <p className="mb-1 text-xs font-bold text-slate-700 dark:text-slate-300">Offline</p>
                      <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                        importance surface 추정, λ 보정, state-wise policy optimization은 모두 배포 전에 한 번만 수행됩니다.
                      </p>
                    </div>
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/40 dark:bg-emerald-900/10">
                      <p className="mb-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">Online</p>
                      <p className="text-xs leading-relaxed text-emerald-600 dark:text-emerald-400">
                        UE는 ξ_t 계산 + μ(ξ_t) lookup + encoder 실행만 하면 됩니다. 온라인 최적화는 아예 존재하지 않습니다.
                      </p>
                    </div>
                  </div>

                  <BudgetOutageViz />
                  <InfographicCaption>
                    같은 평균 UE-side BOP 예산에서도, Joint DP의 state-conditioned budget allocation이 equal-budget Segment DP보다 outage cliff를 더 높은 절약 구간으로 이동시킵니다.
                  </InfographicCaption>

                  <SubSectionHeading number="5.3" title="동일 평균 예산에서의 reliability 개선" />
                  <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                    정적인 uniform precision이나 static mixed precision과 비교하면, Segment DP + Joint DP는 sample마다 다른 state를 반영하므로
                    같은 average cost에서도 reliability target을 더 자주 만족시킵니다. Joint DP는 outage cliff를 더 높은 BOP 절약 구간으로 이동시킵니다.
                  </p>
                  <ReliabilityViz />
                  <InfographicCaption>
                    동일한 평균 연산 예산 하에서 Segment DP + Joint DP 온라인 선택이 rate-based outage를 가장 크게 줄입니다.
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
                      실험 환경: COST 2100 outdoor, N_t=32, N_r=1, N_f=1024, N_a=32, CR=1/4, SNR = 10 / 20 / 30 dB
                    </p>
                  </div>

                  {/* Table 1 */}
                  <p className="mb-2 text-sm font-bold text-gray-800 dark:text-gray-200">
                    Table 1. FP32 baseline 구조 비교 (CR = 1/4)
                  </p>
                  <div className="mb-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800">
                          <th className="px-4 py-2 text-left font-semibold text-gray-600 dark:text-gray-400">모델</th>
                          <th className="px-4 py-2 text-center font-semibold text-gray-600 dark:text-gray-400">NMSE (dB)</th>
                          <th className="px-4 py-2 text-center font-semibold text-gray-600 dark:text-gray-400">인코더 FLOPs (M)</th>
                          <th className="px-4 py-2 text-center font-semibold text-gray-600 dark:text-gray-400">전체 FLOPs (M)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {[
                          { model: 'CsiNet', nmse: '-8.75', flops: '1.09', total: '5.41', highlight: false },
                          { model: 'CsiNet+', nmse: '-12.40', flops: '1.45', total: '24.57', highlight: false },
                          { model: 'CRNet', nmse: '-12.71', flops: '1.20', total: '5.12', highlight: false },
                          { model: 'CLNet', nmse: '-12.87', flops: '1.35', total: '4.05', highlight: false },
                          { model: 'TransNet', nmse: '-14.86', flops: '17.83', total: '35.72', highlight: false },
                          { model: 'MT-AE (Ours)', nmse: '-15.37', flops: '4.70', total: '22.53', highlight: true },
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
                            <td className={`px-4 py-2 text-center font-mono ${row.highlight ? 'font-bold text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400'}`}>
                              {row.total}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Table 2 */}
                  <p className="mb-2 text-sm font-bold text-gray-800 dark:text-gray-200">
                    Table 2. Uniform weight quantization (activations INT16 고정)
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
                          { model: 'CsiNet', prec: 'INT16', nmse: '-8.74', bop: '75%', highlight: false, bad: false },
                          { model: 'CsiNet', prec: 'INT8', nmse: '1.46†', bop: '87.5%', highlight: false, bad: true },
                          { model: 'CsiNet', prec: 'INT4', nmse: '19.40†', bop: '93.75%', highlight: false, bad: true },
                          { model: 'CRNet', prec: 'INT16', nmse: '-12.71', bop: '75%', highlight: false, bad: false },
                          { model: 'CRNet', prec: 'INT8', nmse: '-3.57', bop: '87.5%', highlight: false, bad: true },
                          { model: 'CRNet', prec: 'INT4', nmse: '-6.79', bop: '93.75%', highlight: false, bad: true },
                          { model: 'CLNet', prec: 'INT16', nmse: '-12.82', bop: '75%', highlight: false, bad: false },
                          { model: 'CLNet', prec: 'INT8', nmse: '0.15†', bop: '87.5%', highlight: false, bad: true },
                          { model: 'CLNet', prec: 'INT4', nmse: '23.36†', bop: '93.75%', highlight: false, bad: true },
                          { model: 'MT-AE (Ours)', prec: 'INT16', nmse: '-15.37', bop: '75%', highlight: true, bad: false },
                          { model: 'MT-AE (Ours)', prec: 'INT8', nmse: '-15.19', bop: '87.5%', highlight: true, bad: false },
                          { model: 'MT-AE (Ours)', prec: 'INT4', nmse: '-12.69', bop: '93.75%', highlight: true, bad: false },
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
                      <span className="font-bold">핵심 관찰:</span> MT-AE는 INT8 (87.5% BOP 절약)에서 -15.19 dB로 거의 무손실이지만,
                      CNN baselines는 INT8에서 붕괴합니다. INT4 (93% 절약)에서 MT-AE는 -12.69 dB이지만 CRNet은 -6.79 dB로
                      5.9 dB 격차가 발생합니다. 이 구조적 양자화 내성이 Segment DP를 aggressive saving 구간까지 밀어붙일 수 있게 해 주는 기반입니다.
                    </p>
                  </div>

                  {/* Segment DP vs HAWQ-ILP comparison */}
                  <p className="mb-2 text-sm font-bold text-gray-800 dark:text-gray-200">
                    Segment DP vs HAWQ-ILP 비교
                  </p>
                  <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                    Segment DP는 contiguous-segment 제약을 자연스럽게 만족하면서도
                    block-wise independent optimization (HAWQ-ILP) 대비 동일하거나 더 나은 NMSE를 달성합니다.
                    하드웨어 연속성을 보장하면서 성능 손실이 없는 것이 핵심입니다.
                  </p>

                  {/* Joint DP outage improvement */}
                  <p className="mb-2 text-sm font-bold text-gray-800 dark:text-gray-200">
                    Joint DP: Outage 개선
                  </p>
                  <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                    Joint DP는 equal-budget Segment DP 대비 outage cliff를 더 높은 BOP 절약 구간으로 이동시킵니다.
                    NMSE 비용 없이 outage probability를 개선하며, 어려운 채널 조건(높은 ζ)에 더 많은 bit budget을 할당합니다.
                  </p>

                  <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/40 dark:bg-emerald-900/10">
                      <p className="mb-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">Cross-Architecture Pareto Frontier</p>
                      <p className="text-xs leading-relaxed text-emerald-600 dark:text-emerald-400">
                        MT-AE + Segment DP 조합이 모든 BOP 절약 구간에서 CNN baseline + 균일 양자화 조합을 Pareto-dominate합니다.
                        아키텍처 내재적 양자화 내성과 상태 적응형 mixed-precision이 시너지를 형성합니다.
                      </p>
                    </div>
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-900/10">
                      <p className="mb-1 text-xs font-bold text-amber-700 dark:text-amber-300">Joint DP 효과</p>
                      <p className="text-xs leading-relaxed text-amber-600 dark:text-amber-400">
                        Outer DP가 상태별 예산 배분을 최적화하여 outage cliff를 더 높은 BOP 절약 구간으로 밀어냅니다.
                        Equal-budget 대비 동일 NMSE에서 outage probability가 개선됩니다.
                      </p>
                    </div>
                  </div>

                  <NmseVsBopScatterViz />
                  <InfographicCaption>
                    효율 프론티어: 오른쪽 아래가 최적 (高 BOP 절약 + 低 NMSE). Segment DP + Joint DP는 균일 양자화 대비 동일 예산에서 일관되게 우위.
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
    </GlossaryTermsContext.Provider>
  );
}
