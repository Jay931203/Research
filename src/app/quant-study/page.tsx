'use client';

import { useCallback, useEffect, useMemo, useRef, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  BarChart2,
  BookOpen,
  BrainCircuit,
  ChevronDown,
  ChevronRight,
  Cpu,
  FileText,
  FlaskConical,
  GitCompare,
  Hash,
  Layers,
  Shuffle,
  Sparkles,
  Zap,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import katex from 'katex';
import Header from '@/components/layout/Header';

const IncoherenceViz = dynamic(
  () => import('@/components/quant-study/IncoherenceViz'),
  { ssr: false },
);
const E8LatticeViz = dynamic(
  () => import('@/components/quant-study/E8LatticeViz'),
  { ssr: false },
);
const AddQuantViz = dynamic(
  () => import('@/components/quant-study/AddQuantViz'),
  { ssr: false },
);
const PaperEvolutionGraph = dynamic(
  () => import('@/components/quant-study/PaperEvolutionGraph'),
  { ssr: false },
);

/* ───────────────────────────────────────────────────────────── */
/*  Types & Constants                                            */
/* ───────────────────────────────────────────────────────────── */

type PaperKey = 'quip' | 'quipsharp' | 'aqlm' | 'compare';

const PAPER_TABS: { key: PaperKey; label: string; color: string; short: string }[] = [
  { key: 'quip', label: 'QuIP', color: 'indigo', short: '랜덤 회전 + LDLQ' },
  { key: 'quipsharp', label: 'QuIP#', color: 'purple', short: 'Hadamard + E8' },
  { key: 'aqlm', label: 'AQLM', color: 'emerald', short: '가산 양자화' },
  { key: 'compare', label: '비교 분석', color: 'amber', short: '3편 종합 비교' },
];

const TOC: Record<PaperKey, { id: string; label: string; icon: React.ElementType }[]> = {
  quip: [
    { id: 'quip-overview', label: '개요', icon: BookOpen },
    { id: 'quip-background', label: '배경: 2비트의 어려움', icon: BrainCircuit },
    { id: 'quip-incoherence', label: '비간섭 처리', icon: Shuffle },
    { id: 'quip-ldlq', label: 'LDLQ 알고리즘', icon: Cpu },
    { id: 'quip-equations', label: '핵심 수식', icon: Hash },
    { id: 'quip-results', label: '실험 결과', icon: BarChart2 },
    { id: 'quip-quiz', label: '자기 점검', icon: FlaskConical },
  ],
  quipsharp: [
    { id: 'qs-overview', label: '개요', icon: BookOpen },
    { id: 'qs-quip-limits', label: 'QuIP의 한계', icon: BrainCircuit },
    { id: 'qs-hadamard', label: 'Hadamard 비간섭', icon: Zap },
    { id: 'qs-e8', label: 'E8 격자 코드북', icon: Layers },
    { id: 'qs-equations', label: '핵심 수식', icon: Hash },
    { id: 'qs-results', label: '실험 결과', icon: BarChart2 },
    { id: 'qs-quiz', label: '자기 점검', icon: FlaskConical },
  ],
  aqlm: [
    { id: 'aqlm-overview', label: '개요', icon: BookOpen },
    { id: 'aqlm-idea', label: '가산 양자화 아이디어', icon: BrainCircuit },
    { id: 'aqlm-algorithm', label: '알고리즘: 빔 서치 + SGD', icon: Cpu },
    { id: 'aqlm-equations', label: '핵심 수식', icon: Hash },
    { id: 'aqlm-results', label: '실험 결과', icon: BarChart2 },
    { id: 'aqlm-quiz', label: '자기 점검', icon: FlaskConical },
  ],
  compare: [
    { id: 'cmp-evolution', label: '논문 계보', icon: GitCompare },
    { id: 'cmp-performance', label: '성능 비교', icon: BarChart2 },
    { id: 'cmp-methodology', label: '방법론 비교', icon: Layers },
    { id: 'cmp-insights', label: '핵심 인사이트', icon: Sparkles },
    { id: 'cmp-notes', label: '학습 노트', icon: FileText },
  ],
};

/* ───────────────────────────────────────────────────────────── */
/*  Sub-components                                               */
/* ───────────────────────────────────────────────────────────── */

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

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900 dark:ring-1 dark:ring-gray-800 ${className}`}>
      {children}
    </div>
  );
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

function Caption({ children }: { children: React.ReactNode }) {
  return <p className="mt-2 text-center text-xs italic text-gray-500 dark:text-gray-400">{children}</p>;
}

function EqCard({
  idx,
  name,
  latex,
  description,
  color = 'indigo',
}: {
  idx: number;
  name: string;
  latex: string;
  description: string;
  color?: string;
}) {
  const [open, setOpen] = useState(false);
  const colorMap: Record<string, string> = {
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800',
    purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
    amber: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
  };
  const badgeMap: Record<string, string> = {
    indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  };
  return (
    <div
      className="cursor-pointer rounded-xl border border-gray-200 bg-gray-50/50 p-4 transition hover:border-blue-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-700"
      onClick={() => setOpen((v) => !v)}
    >
      <div className="mb-2 flex items-center gap-2">
        <span className={`rounded px-2 py-0.5 text-xs font-bold ${badgeMap[color] ?? badgeMap.indigo}`}>
          Eq. {idx}
        </span>
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{name}</span>
        <ChevronDown
          className={`ml-auto h-4 w-4 text-gray-400 transition-transform dark:text-gray-500 ${open ? 'rotate-180' : ''}`}
        />
      </div>
      <div className="overflow-x-auto py-2 text-gray-900 dark:text-gray-100">
        <EquationRenderer latex={latex} />
      </div>
      {open ? (
        <div className={`mt-3 rounded-lg border px-4 py-3 ${colorMap[color] ?? colorMap.indigo}`}>
          <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">{description}</p>
        </div>
      ) : (
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">클릭하여 한국어 설명 보기</p>
      )}
    </div>
  );
}

function QuizSection({
  questions,
  color = 'indigo',
}: {
  questions: { q: string; a: string }[];
  color?: string;
}) {
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const toggle = (i: number) =>
    setRevealed((prev) => {
      const n = new Set(prev);
      if (n.has(i)) n.delete(i);
      else n.add(i);
      return n;
    });
  const bgMap: Record<string, string> = {
    indigo: 'border-indigo-200 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-900/20',
    purple: 'border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/20',
    emerald: 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20',
  };
  return (
    <div className="space-y-3">
      {questions.map(({ q, a }, i) => (
        <div key={i} className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
          <button
            onClick={() => toggle(i)}
            className="flex w-full items-start gap-3 p-4 text-left"
          >
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600 dark:bg-gray-800 dark:text-gray-400">
              Q{i + 1}
            </span>
            <span className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">{q}</span>
            <ChevronDown
              className={`h-4 w-4 flex-shrink-0 text-gray-400 transition-transform ${revealed.has(i) ? 'rotate-180' : ''}`}
            />
          </button>
          {revealed.has(i) && (
            <div className={`mx-4 mb-4 rounded-lg border px-4 py-3 ${bgMap[color] ?? bgMap.indigo}`}>
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                <span className="mr-1 font-bold text-green-600 dark:text-green-400">A:</span>
                {a}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ───────────────────────────────────────────────────────────── */
/*  Paper content: QuIP                                          */
/* ───────────────────────────────────────────────────────────── */

function QuIPContent({ collapsed: col, toggle }: { collapsed: Record<string, boolean>; toggle: (id: string) => void }) {
  return (
    <>
      {/* Overview */}
      <section id="quip-overview" className="scroll-mt-20">
        <div className="overflow-hidden rounded-xl shadow-sm">
          <div className="bg-gradient-to-br from-indigo-700 via-blue-700 to-cyan-700 p-6 pb-8">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
                NeurIPS 2024
              </span>
              <span className="rounded-full bg-yellow-400/90 px-3 py-1 text-xs font-bold text-yellow-900">
                2비트 LLM 양자화
              </span>
            </div>
            <h2 className="text-xl font-bold leading-snug text-white sm:text-2xl">
              QuIP: 2-bit Quantization of Large Language Models with Guarantees
            </h2>
            <p className="mt-3 text-sm text-indigo-200">
              Tim Dettmers, Luke Zettlemoyer 외 (Washington 대학교) · NeurIPS 2024
            </p>
          </div>
          <div className="bg-white p-6 dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
            <p className="leading-relaxed text-gray-700 dark:text-gray-300">
              2비트 양자화에서 최초로 수학적 보장(guarantee)을 제공하는 PTQ 프레임워크.
              가중치 행렬에 <span className="font-semibold text-indigo-700 dark:text-indigo-300">랜덤 직교 변환</span>을 적용해
              비간섭(incoherence) 상태로 만든 뒤 양자화합니다.
              비간섭 조건 하에서 양자화 오차가 전 가중치에 균일하게 분산되어, 어느 단일 가중치도 결과를 지배하지 않게 됩니다.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {['비간섭 처리', 'LDLQ 알고리즘', '수학적 보장', '2비트 PTQ'].map((tag) => (
                <span key={tag} className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Background */}
      <section id="quip-background" className="scroll-mt-20">
        <SectionHeading
          icon={<BrainCircuit className="h-5 w-5" />}
          title="배경: 왜 2비트 양자화가 어려운가?"
          collapsed={!!col['quip-background']}
          onToggle={() => toggle('quip-background')}
        />
        <div className={`overflow-hidden transition-all duration-300 ${col['quip-background'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="1.1" title="균일 양자화 오차 스케일링" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              b비트 균일 양자화의 MSE는 다음과 같이 스케일됩니다:
            </p>
            <div className="mb-4 overflow-x-auto rounded-lg bg-red-50 p-3 dark:bg-red-900/10">
              <EquationRenderer latex={String.raw`\mathbb{E}[\|W - \hat{W}\|_F^2] \propto \frac{\sigma^2}{4^b}`} />
            </div>
            <p className="mb-5 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              4비트 → 2비트로 줄이면 오차가 <span className="font-mono font-bold text-red-600 dark:text-red-400">16배</span> 증가합니다.
              이것이 2비트 PTQ가 어려운 근본 이유입니다.
            </p>

            <SubSectionHeading number="1.2" title="간섭(Coherence) 문제" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              추가로, 실제 LLM 가중치 행렬은 <span className="font-semibold text-orange-600 dark:text-orange-400">간섭(coherent)</span>합니다.
              일부 가중치가 다른 것보다 훨씬 크면 균일 양자화 격자가 전체에 맞지 않습니다.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-900/10">
                <p className="mb-1 text-xs font-bold text-red-700 dark:text-red-300">간섭 행렬 (Coherent)</p>
                <p className="text-xs text-red-600 dark:text-red-400">
                  일부 원소가 매우 큼 → 양자화 격자를 키우면 작은 원소의 오차 증가.
                  작게 맞추면 큰 원소가 클리핑됨.
                </p>
              </div>
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900/40 dark:bg-green-900/10">
                <p className="mb-1 text-xs font-bold text-green-700 dark:text-green-300">비간섭 행렬 (Incoherent)</p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  모든 원소가 비슷한 크기 → 하나의 스케일로 전체 양자화 가능.
                  균일 오차 분포로 품질 보장 가능.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Incoherence */}
      <section id="quip-incoherence" className="scroll-mt-20">
        <SectionHeading
          icon={<Shuffle className="h-5 w-5" />}
          title="비간섭 처리 (Incoherence Processing)"
          collapsed={!!col['quip-incoherence']}
          onToggle={() => toggle('quip-incoherence')}
        />
        <div className={`overflow-hidden transition-all duration-300 ${col['quip-incoherence'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="2.1" title="핵심 아이디어" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              가중치 행렬 W에 랜덤 직교 행렬 Q를 곱해 비간섭 상태로 변환한 뒤 양자화합니다:
            </p>
            <div className="mb-4 overflow-x-auto rounded-lg bg-indigo-50 p-3 dark:bg-indigo-900/20">
              <EquationRenderer latex={String.raw`W' = Q_L W Q_R^{\top}, \quad \hat{W} = Q_L^{\top} \hat{W}' Q_R`} />
            </div>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              양자화 후 역변환하면 원래 공간에서 올바른 행렬을 얻습니다.
              정방 행렬 W에는 Q_L = Q_R = Q를 사용할 수도 있습니다.
            </p>

            <SubSectionHeading number="2.2" title="간섭 지수 (Coherence Measure)" />
            <div className="mb-4 overflow-x-auto rounded-lg bg-amber-50 p-3 dark:bg-amber-900/20">
              <EquationRenderer latex={String.raw`\mu(W) = \frac{\max_{i,j}|W_{ij}|}{\|W\|_F} \sqrt{mn}`} />
            </div>
            <p className="mb-5 text-sm text-gray-600 dark:text-gray-400">
              μ = 1이면 완전 비간섭(최적). μ가 클수록 일부 가중치가 Frobenius norm 대비 과도하게 큽니다.
              랜덤 직교 변환 후 μ는 1에 가까워집니다 (sub-Gaussian 분포 수렴).
            </p>

            <IncoherenceViz />
            <Caption>
              랜덤 회전을 반복할수록 max 원소가 줄어들어 비간섭 조건에 근접합니다.
              황색 테두리 = 최대 절대값 원소.
            </Caption>
          </Card>
        </div>
      </section>

      {/* LDLQ Algorithm */}
      <section id="quip-ldlq" className="scroll-mt-20">
        <SectionHeading
          icon={<Cpu className="h-5 w-5" />}
          title="LDLQ 알고리즘"
          collapsed={!!col['quip-ldlq']}
          onToggle={() => toggle('quip-ldlq')}
        />
        <div className={`overflow-hidden transition-all duration-300 ${col['quip-ldlq'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              LDLQ (Lattice Descent for LLM Quantization)는 Hessian 정보를 활용한 순차적 양자화 알고리즘입니다.
              GPTQ와 유사하지만 비간섭 전처리 후 적용됩니다.
            </p>
            <div className="space-y-3">
              {[
                {
                  step: '1',
                  title: '입력-Hessian 계산',
                  desc: '보정 데이터로 각 레이어의 입력 Hessian H = XX^T/N을 계산합니다.',
                  color: 'blue',
                },
                {
                  step: '2',
                  title: '비간섭 변환',
                  desc: 'Q = randn(d, d) → QR 분해 → Q_L, Q_R 생성. W\' = Q_L W Q_R^T로 변환합니다.',
                  color: 'indigo',
                },
                {
                  step: '3',
                  title: 'LDL^T 분해',
                  desc: 'Hessian을 LDL^T 분해. L의 구조를 이용해 순차 양자화 순서를 결정합니다.',
                  color: 'purple',
                },
                {
                  step: '4',
                  title: '순차 양자화 + 오차 보정',
                  desc: 'GPTQ와 동일한 방식으로 한 번에 하나씩 양자화하고 Hessian 가중 오차를 잔여 열에 전파합니다.',
                  color: 'violet',
                },
                {
                  step: '5',
                  title: '역변환',
                  desc: 'Ŵ = Q_L^T Ŵ\' Q_R로 원래 공간으로 복원합니다. 추론 시에는 원래 Q가 필요 없습니다.',
                  color: 'teal',
                },
              ].map(({ step, title, desc, color }) => (
                <div key={step} className={`flex gap-3 rounded-lg border border-${color}-200 bg-${color}-50 p-4 dark:border-${color}-900/40 dark:bg-${color}-900/10`}>
                  <span className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-${color}-600 text-xs font-bold text-white`}>
                    {step}
                  </span>
                  <div>
                    <p className={`text-sm font-bold text-${color}-800 dark:text-${color}-200`}>{title}</p>
                    <p className={`text-xs text-${color}-700 dark:text-${color}-300`}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* Equations */}
      <section id="quip-equations" className="scroll-mt-20">
        <SectionHeading
          icon={<Hash className="h-5 w-5" />}
          title="핵심 수식"
          collapsed={!!col['quip-equations']}
          onToggle={() => toggle('quip-equations')}
        />
        <div className={`overflow-hidden transition-all duration-300 ${col['quip-equations'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="space-y-3">
              <EqCard idx={1} name="균일 양자화 오차 스케일링" color="indigo"
                latex={String.raw`\mathbb{E}[\|W - \hat{W}\|_F^2] \propto \frac{\|W\|_F^2}{4^b}`}
                description="b비트 균일 양자화에서 Frobenius 오차는 4^b에 반비례합니다. 2비트 → 4비트는 16배 오차 감소. 이것이 비트 수의 결정적 중요성을 보여줍니다." />
              <EqCard idx={2} name="간섭 지수 (Coherence)" color="amber"
                latex={String.raw`\mu(W) \triangleq \frac{\max_{i,j}|W_{ij}|}{\|W\|_F} \cdot \sqrt{mn}`}
                description="W가 완전 비간섭이면 μ = 1. 간섭적일수록 μ가 큼. 랜덤 직교 변환 후 μ → 1 + O(log(mn)/sqrt(mn))으로 수렴합니다. 이 수렴이 QuIP의 보장의 핵심입니다." />
              <EqCard idx={3} name="비간섭 변환 전/후 비교" color="indigo"
                latex={String.raw`W' = Q_L W Q_R^{\top} \xrightarrow{\text{양자화}} \hat{W}' \xrightarrow{\text{역변환}} \hat{W} = Q_L^{\top} \hat{W}' Q_R`}
                description="전처리(비간섭 변환) → 양자화 → 후처리(역변환)의 3단계입니다. 추론 시에는 원래 Q를 저장할 필요 없이 역변환된 Ŵ만 사용합니다." />
              <EqCard idx={4} name="LDLQ 목적 함수" color="purple"
                latex={String.raw`\min_{\hat{W}} \|W - \hat{W}\|_{H}^2 = \min_{\hat{W}} \text{Tr}\big((W-\hat{W})H(W-\hat{W})^{\top}\big)`}
                description="단순 L2 최소화가 아닌 Hessian 가중 놈으로 오차를 측정합니다. H = E[xx^T]는 각 가중치가 출력에 미치는 영향을 반영하므로, 중요한 가중치를 더 정밀하게 양자화합니다." />
              <EqCard idx={5} name="비간섭 조건의 양자화 오차 상한" color="indigo"
                latex={String.raw`\mathbb{E}\!\left[\|W\hat{x} - \hat{W}\hat{x}\|^2\right] \leq \mu^2 \cdot \frac{\sigma_W^2 d}{4^b}`}
                description="비간섭(μ 작음) 조건에서 실제 추론 오차(Wx vs Ŵx)가 μ^2에 비례해 상한을 가집니다. μ → 1로 줄수록 보장이 강해집니다. 이것이 '보장(guarantees)'이라는 제목의 의미입니다." />
            </div>
          </Card>
        </div>
      </section>

      {/* Results */}
      <section id="quip-results" className="scroll-mt-20">
        <SectionHeading
          icon={<BarChart2 className="h-5 w-5" />}
          title="실험 결과"
          collapsed={!!col['quip-results']}
          onToggle={() => toggle('quip-results')}
        />
        <div className={`overflow-hidden transition-all duration-300 ${col['quip-results'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <p className="mb-3 text-sm font-semibold text-gray-600 dark:text-gray-400">
              Llama-2 모델 · WikiText-2 Perplexity (↓ 낮을수록 좋음)
            </p>
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-400">방법</th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-gray-400">비트</th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-gray-400">7B PPL</th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-gray-400">13B PPL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { method: 'FP16 기준', bits: '16', ppl7: '5.47', ppl13: '4.88', hi: false },
                    { method: 'GPTQ', bits: '4', ppl7: '5.63', ppl13: '4.97', hi: false },
                    { method: 'RTN (Round-to-Nearest)', bits: '2', ppl7: '1e4+', ppl13: '1e4+', hi: false, bad: true },
                    { method: 'GPTQ', bits: '2', ppl7: '25.5', ppl13: '18.3', hi: false, bad: true },
                    { method: 'QuIP', bits: '2', ppl7: '6.4', ppl13: '5.6', hi: true },
                  ].map((r, i) => (
                    <tr key={i} className={r.hi ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}>
                      <td className={`px-3 py-2 font-medium ${r.hi ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'}`}>
                        {r.hi && <span className="mr-1">★</span>}{r.method}
                      </td>
                      <td className="px-3 py-2 text-center font-mono text-gray-500 dark:text-gray-400">{r.bits}</td>
                      <td className={`px-3 py-2 text-center font-mono font-semibold ${(r as {bad?: boolean}).bad ? 'text-red-600 dark:text-red-400' : r.hi ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400'}`}>{r.ppl7}</td>
                      <td className={`px-3 py-2 text-center font-mono font-semibold ${(r as {bad?: boolean}).bad ? 'text-red-600 dark:text-red-400' : r.hi ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400'}`}>{r.ppl13}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 dark:border-indigo-800 dark:bg-indigo-900/20">
              <p className="text-xs text-indigo-700 dark:text-indigo-300">
                <span className="font-bold">핵심 관찰:</span> 기존 2비트 방법(GPTQ, RTN)이 완전히 실패(PPL 1만 이상)하는 반면,
                QuIP는 6.4로 사용 가능한 수준을 달성. 수학적 보장 덕분입니다.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Quiz */}
      <section id="quip-quiz" className="scroll-mt-20">
        <SectionHeading icon={<FlaskConical className="h-5 w-5" />} title="자기 점검" />
        <Card>
          <QuizSection color="indigo" questions={[
            {
              q: 'QuIP에서 "비간섭(incoherence)"이란 무엇이며, 왜 양자화에 유리한가요?',
              a: '비간섭이란 가중치 행렬의 모든 원소가 비슷한 크기를 가지는 상태를 말합니다 (간섭 지수 μ ≈ 1). 이 조건에서는 균일 양자화 격자 하나로 모든 가중치를 효율적으로 커버할 수 있어, 양자화 오차가 Frobenius 놈 대비 이론적으로 보장된 상한을 가집니다.',
            },
            {
              q: '랜덤 직교 변환 Q를 적용해도 추론 정확도가 유지되는 이유는?',
              a: 'W\'x\' = (Q_L W Q_R^T)(Q_R x) = Q_L (Wx)이므로, 입력을 Q_R로, 출력을 Q_L^T로 변환하면 원래 연산과 동일합니다. 실제로는 역변환된 Ŵ = Q_L^T Ŵ\' Q_R만 저장하므로 추론 시 추가 연산이 없습니다.',
            },
            {
              q: 'LDLQ가 단순한 round-to-nearest보다 나은 이유는?',
              a: 'LDLQ는 Hessian(입력 공분산) 가중 오차를 최소화하고, 이미 양자화된 가중치의 오차를 이후 가중치들의 업데이트에 반영합니다. 중요한 가중치(H의 대각 원소가 큰 것)를 더 정밀하게 양자화하며, 오차 전파로 전체 오차를 분산시킵니다.',
            },
          ]} />
        </Card>
      </section>
    </>
  );
}

/* ───────────────────────────────────────────────────────────── */
/*  Paper content: QuIP#                                         */
/* ───────────────────────────────────────────────────────────── */

function QuIPSharpContent({ collapsed: col, toggle }: { collapsed: Record<string, boolean>; toggle: (id: string) => void }) {
  return (
    <>
      {/* Overview */}
      <section id="qs-overview" className="scroll-mt-20">
        <div className="overflow-hidden rounded-xl shadow-sm">
          <div className="bg-gradient-to-br from-purple-700 via-violet-700 to-indigo-700 p-6 pb-8">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
                ICML 2024
              </span>
              <span className="rounded-full bg-green-400/90 px-3 py-1 text-xs font-bold text-green-900">
                Near Float16 @ 2-bit
              </span>
            </div>
            <h2 className="text-xl font-bold leading-snug text-white sm:text-2xl">
              QuIP#: Even Better LLM Quantization with Hadamard Incoherence and Lattice Codebooks
            </h2>
            <p className="mt-3 text-sm text-purple-200">
              Albert Tseng, Jerry Chee, Qingyao Sun 외 (Cornell 대학교) · ICML 2024
            </p>
          </div>
          <div className="bg-white p-6 dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
            <p className="leading-relaxed text-gray-700 dark:text-gray-300">
              QuIP의 두 가지 한계를 극복한 개선 버전.
              랜덤 직교 행렬을 <span className="font-semibold text-purple-700 dark:text-purple-300">Walsh-Hadamard 변환</span>으로 교체(O(n log n)),
              스칼라 양자화를 <span className="font-semibold text-purple-700 dark:text-purple-300">E8 격자 코드북</span>으로 교체합니다.
              Llama-2-7B에서 2비트 PPL 5.6으로 FP16(5.47)에 거의 손실 없는 성능을 달성합니다.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {['Hadamard 비간섭', 'E8 격자 코드북', 'O(n log n) 변환', '준손실없는 2비트'].map((tag) => (
                <span key={tag} className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* QuIP limits */}
      <section id="qs-quip-limits" className="scroll-mt-20">
        <SectionHeading
          icon={<BrainCircuit className="h-5 w-5" />}
          title="QuIP의 한계"
          collapsed={!!col['qs-quip-limits']}
          onToggle={() => toggle('qs-quip-limits')}
        />
        <div className={`overflow-hidden transition-all duration-300 ${col['qs-quip-limits'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-900/10">
                <p className="mb-2 text-sm font-bold text-red-700 dark:text-red-300">한계 ① 속도</p>
                <p className="text-xs text-red-600 dark:text-red-400">
                  랜덤 직교 행렬 Q ∈ ℝⁿˣⁿ 생성: <span className="font-mono font-bold">O(n²)</span> 저장 + <span className="font-mono font-bold">O(n³)</span> QR 분해.
                  Llama 7B의 레이어 크기(4096×4096)에서 매우 느림.
                </p>
              </div>
              <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 dark:border-orange-900/40 dark:bg-orange-900/10">
                <p className="mb-2 text-sm font-bold text-orange-700 dark:text-orange-300">한계 ② 정밀도</p>
                <p className="text-xs text-orange-600 dark:text-orange-400">
                  스칼라 양자화는 각 가중치를 독립적으로 처리 → 가중치 간 상관관계를 전혀 활용하지 못함.
                  2비트에서는 4개 레벨만 사용 가능 (매우 거침).
                </p>
              </div>
            </div>
            <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">방법</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">변환 복잡도</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">양자화 효율</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { m: 'QuIP (랜덤 직교)', comp: 'O(n³) QR', quant: '1D 스칼라 (4 레벨)' },
                    { m: 'QuIP# (Hadamard + E8)', comp: 'O(n log n) WHT', quant: '8D 격자 (256 레벨)' },
                  ].map((r, i) => (
                    <tr key={i} className={i === 1 ? 'bg-purple-50 dark:bg-purple-900/10' : ''}>
                      <td className={`px-3 py-2 font-medium ${i === 1 ? 'text-purple-700 dark:text-purple-300' : 'text-gray-700 dark:text-gray-300'}`}>{r.m}</td>
                      <td className={`px-3 py-2 text-center font-mono ${i === 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>{r.comp}</td>
                      <td className={`px-3 py-2 text-center ${i === 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>{r.quant}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </section>

      {/* Hadamard */}
      <section id="qs-hadamard" className="scroll-mt-20">
        <SectionHeading
          icon={<Zap className="h-5 w-5" />}
          title="개선 ① Hadamard 비간섭"
          collapsed={!!col['qs-hadamard']}
          onToggle={() => toggle('qs-hadamard')}
        />
        <div className={`overflow-hidden transition-all duration-300 ${col['qs-hadamard'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="3.1" title="Walsh-Hadamard 변환" />
            <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
              n×n Hadamard 행렬은 고정된(deterministic) 직교 행렬입니다:
            </p>
            <div className="mb-3 overflow-x-auto rounded-lg bg-purple-50 p-3 dark:bg-purple-900/20">
              <EquationRenderer latex={String.raw`H_n = \frac{1}{\sqrt{n}}\begin{bmatrix} H_{n/2} & H_{n/2} \\ H_{n/2} & -H_{n/2} \end{bmatrix}, \quad H_1 = [1]`} />
            </div>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              WHT는 O(n log n)으로 계산 가능 (FFT와 동일한 복잡도).
              완전 랜덤성을 위해 대각 랜덤 부호 행렬을 곱합니다:
            </p>
            <div className="mb-5 overflow-x-auto rounded-lg bg-purple-50 p-3 dark:bg-purple-900/20">
              <EquationRenderer latex={String.raw`Q = \frac{1}{\sqrt{n}} H_n \cdot \text{diag}(d), \quad d_i \overset{\text{i.i.d.}}{\sim} \text{Uniform}(\{+1, -1\})`} />
            </div>

            {/* Hadamard matrix visualization */}
            <SubSectionHeading number="3.2" title="Hadamard 행렬 구조 (8×8)" />
            <div className="mb-4 overflow-x-auto rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
              <p className="mb-2 text-center text-xs text-gray-500 dark:text-gray-400">체커보드 패턴 (흰색=+1, 검정=-1)</p>
              <svg width="160" height="160" viewBox="0 0 160 160" className="mx-auto block">
                {Array.from({ length: 8 }, (_, r) =>
                  Array.from({ length: 8 }, (_, c) => {
                    const val = (bin(r) & bin(c)) % 2 === 0 ? 1 : -1;
                    return (
                      <rect
                        key={`${r}-${c}`}
                        x={c * 20}
                        y={r * 20}
                        width={19}
                        height={19}
                        fill={val === 1 ? '#e0e7ff' : '#4f46e5'}
                        rx={1}
                      />
                    );
                  })
                )}
              </svg>
              <p className="mt-2 text-center text-[10px] text-gray-500 dark:text-gray-400">
                H[r,c] = (-1)^popcount(r AND c) / √8
              </p>
            </div>

            <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/20">
              <p className="text-xs text-purple-700 dark:text-purple-300">
                <span className="font-bold">왜 동작하는가?</span> Hadamard 변환은 입력을 {'"'}스프레드{'"'}합니다.
                큰 원소 하나가 변환 후 모든 n개 원소에 ±1/√n씩 기여하므로, 어떤 원소도 특별히 크거나 작지 않게 됩니다.
                이것이 비간섭 효과입니다.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* E8 Lattice */}
      <section id="qs-e8" className="scroll-mt-20">
        <SectionHeading
          icon={<Layers className="h-5 w-5" />}
          title="개선 ② E8 격자 코드북"
          collapsed={!!col['qs-e8']}
          onToggle={() => toggle('qs-e8')}
        />
        <div className={`overflow-hidden transition-all duration-300 ${col['qs-e8'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="4.1" title="E8 격자란?" />
            <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
              E8은 8차원 공간에서 <span className="font-semibold text-purple-700 dark:text-purple-300">최적 구체 패킹(optimal sphere packing)</span>을 달성하는 격자입니다.
              240개의 최소 벡터를 가지며, 격자 상수 밀도가 가장 높습니다.
            </p>
            <div className="mb-4 overflow-x-auto rounded-lg bg-purple-50 p-3 dark:bg-purple-900/20">
              <EquationRenderer latex={String.raw`E_8 = \left\{ x \in \mathbb{Z}^8 \cup \left(\mathbb{Z}+\tfrac{1}{2}\right)^8 : \sum x_i \equiv 0 \pmod{2} \right\}`} />
            </div>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              이 격자에 8개의 가중치를 동시에 가장 가까운 격자점으로 양자화합니다.
              스칼라 2비트(4 레벨)와 비교해 동일한 비트 예산에서 훨씬 더 많은 코드북 점을 사용합니다.
            </p>

            <E8LatticeViz />
            <Caption>
              2D 유추: 헥사고널 격자(E8 유추)는 동일 밀도에서 스칼라 격자보다 평균 양자화 오차가 15~20% 낮습니다.
              {'"'}랜덤 테스트 포인트{'"'} 버튼으로 여러 점에 대한 오차를 비교하세요.
            </Caption>

            <div className="mt-4">
              <SubSectionHeading number="4.2" title="E8 격자 양자화의 핵심 이점" />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  { title: '레벨 수', scalar: '4 (2비트)', e8: '256 (8D, 2비트)', better: true },
                  { title: '상관 활용', scalar: '없음', e8: '8D 동시 최적화', better: true },
                  { title: '패킹 효율', scalar: 'π/4 ≈ 78.5%', e8: '≈ 99%+ (8D)', better: true },
                ].map(({ title, scalar, e8, better }) => (
                  <div key={title} className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                    <p className="mb-1 text-xs font-bold text-gray-600 dark:text-gray-400">{title}</p>
                    <p className="text-xs text-red-500 line-through">{scalar}</p>
                    <p className="text-xs font-semibold text-green-600 dark:text-green-400">{e8}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Equations */}
      <section id="qs-equations" className="scroll-mt-20">
        <SectionHeading
          icon={<Hash className="h-5 w-5" />}
          title="핵심 수식"
          collapsed={!!col['qs-equations']}
          onToggle={() => toggle('qs-equations')}
        />
        <div className={`overflow-hidden transition-all duration-300 ${col['qs-equations'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="space-y-3">
              <EqCard idx={1} name="랜덤 Hadamard 변환" color="purple"
                latex={String.raw`Q = \frac{1}{\sqrt{n}} H_n \cdot \text{diag}(d_1, \ldots, d_n), \quad d_i \sim \pm 1`}
                description="Hadamard 행렬 H_n에 랜덤 부호 대각 행렬을 곱하면 완전한 무작위 직교 행렬과 동일한 비간섭 효과를 O(n log n)으로 달성합니다. n이 2의 거듭제곱이어야 하므로 padding을 사용합니다." />
              <EqCard idx={2} name="E8 격자 정의" color="purple"
                latex={String.raw`E_8 = \left\{ x \in \mathbb{R}^8 : x \in \mathbb{Z}^8 \text{ or } x \in (\mathbb{Z}+\tfrac{1}{2})^8,\; \sum_{i=1}^8 x_i \equiv 0 \pmod 2 \right\}`}
                description="E8은 8차원 정수 격자와 반정수 격자의 합집합에서 원소 합이 짝수인 것들로 구성됩니다. 240개의 최소 벡터(거리 √2)가 있으며, 8D 공간에서 최적 구체 패킹을 실현합니다." />
              <EqCard idx={3} name="E8 격자 양자화" color="purple"
                latex={String.raw`\hat{w} = \mathop{\arg\min}_{v \in \alpha \cdot E_8} \|w - v\|_2^2`}
                description="8개 가중치 벡터 w를 스케일 α로 조정된 E8 격자점 중 가장 가까운 점으로 양자화합니다. 스케일 α는 전체 가중치 통계에서 결정됩니다. nearest-neighbor 계산은 효율적인 디코딩 알고리즘으로 빠르게 수행됩니다." />
              <EqCard idx={4} name="전체 QuIP# 파이프라인" color="purple"
                latex={String.raw`\hat{W} = Q^{\top} \text{E8-quant}\!\left( Q_R \cdot (Q_L W Q_R^{\top}) \cdot Q_C \right) Q_C^{\top} Q_L`}
                description="QuIP#는 4개 Hadamard 변환(행/열/코드북)을 적용합니다: (1) 행렬 전처리용 Q_L, Q_R (2) 코드북 정렬을 위한 추가 변환. 각 변환이 다른 측면의 비간섭을 개선합니다." />
            </div>
          </Card>
        </div>
      </section>

      {/* Results */}
      <section id="qs-results" className="scroll-mt-20">
        <SectionHeading
          icon={<BarChart2 className="h-5 w-5" />}
          title="실험 결과"
          collapsed={!!col['qs-results']}
          onToggle={() => toggle('qs-results')}
        />
        <div className={`overflow-hidden transition-all duration-300 ${col['qs-results'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <p className="mb-3 text-sm font-semibold text-gray-600 dark:text-gray-400">
              Llama-2 모델 · WikiText-2 Perplexity (FP16 대비 overhead 최소화)
            </p>
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-400">방법</th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-gray-400">비트</th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-gray-400">7B</th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-gray-400">13B</th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-gray-400">70B</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { m: 'FP16', b: '16', p7: '5.47', p13: '4.88', p70: '3.32', hi: false },
                    { m: 'GPTQ', b: '4', p7: '5.63', p13: '4.97', p70: '3.38', hi: false },
                    { m: 'QuIP', b: '2', p7: '6.44', p13: '5.55', p70: '3.97', hi: false },
                    { m: 'QuIP# (스칼라만)', b: '2', p7: '5.97', p13: '5.18', p70: '3.66', hi: false },
                    { m: 'QuIP# (E8 격자)', b: '2', p7: '5.57', p13: '4.95', p70: '3.46', hi: true },
                  ].map((r, i) => (
                    <tr key={i} className={r.hi ? 'bg-purple-50 dark:bg-purple-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}>
                      <td className={`px-3 py-2 font-medium ${r.hi ? 'text-purple-700 dark:text-purple-300' : 'text-gray-700 dark:text-gray-300'}`}>
                        {r.hi && '★ '}{r.m}
                      </td>
                      <td className="px-3 py-2 text-center font-mono text-gray-500 dark:text-gray-400">{r.b}</td>
                      {[r.p7, r.p13, r.p70].map((v, j) => (
                        <td key={j} className={`px-3 py-2 text-center font-mono font-semibold ${r.hi ? 'text-purple-700 dark:text-purple-300' : 'text-gray-600 dark:text-gray-400'}`}>{v}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 rounded-lg border border-purple-200 bg-purple-50 px-4 py-3 dark:border-purple-800 dark:bg-purple-900/20">
              <p className="text-xs text-purple-700 dark:text-purple-300">
                <span className="font-bold">핵심 관찰:</span> QuIP# (E8)은 2비트에서 7B PPL 5.57 달성.
                4비트 GPTQ(5.63)보다 낮고, 70B 모델에서는 FP16 3.32 vs 2비트 3.46으로 거의 손실 없음.
                E8 격자 코드북이 0.4 PPL 이상 개선합니다.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Quiz */}
      <section id="qs-quiz" className="scroll-mt-20">
        <SectionHeading icon={<FlaskConical className="h-5 w-5" />} title="자기 점검" />
        <Card>
          <QuizSection color="purple" questions={[
            {
              q: 'Hadamard 변환이 랜덤 직교 행렬보다 빠른 이유는? 왜 동일한 비간섭 효과를 달성할 수 있나요?',
              a: 'Hadamard 변환은 재귀적 나비(butterfly) 구조로 O(n log n) 복잡도를 가집니다. 비간섭 효과는 랜덤 부호 벡터 d ∈ {±1}^n를 곱해 달성합니다: H_n·diag(d)의 각 원소는 ±1/√n이고, 원본의 어떤 패턴도 특정 위치에 집중되지 않습니다.',
            },
            {
              q: 'E8 격자가 스칼라 2비트 양자화보다 우수한 구체적인 이유는?',
              a: '스칼라 2비트는 각 차원에서 독립적으로 4개 레벨만 사용합니다. E8은 8차원 공간에서 가중치들을 함께 고려하므로 2^(8*2) = 65536가지 코드북 점을 사용하는 것과 유사한 효과입니다. 또한 8차원 최적 구체 패킹으로 평균 양자화 오차가 수학적으로 최소화됩니다.',
            },
            {
              q: 'QuIP#가 70B 모델에서 특히 효과적인 이유는?',
              a: '모델이 클수록 가중치가 더 잘 분산되어 비간섭 변환 효과가 크고, 레이어 수가 많아 양자화 오차가 평균화됩니다. 70B Llama-2에서 2비트 PPL 3.46 vs FP16 3.32는 불과 4% 열화로, 8비트 저장 대비 4배 메모리 절약이 가능합니다.',
            },
          ]} />
        </Card>
      </section>
    </>
  );
}

/* ───────────────────────────────────────────────────────────── */
/*  Paper content: AQLM                                          */
/* ───────────────────────────────────────────────────────────── */

function AQLMContent({ collapsed: col, toggle }: { collapsed: Record<string, boolean>; toggle: (id: string) => void }) {
  return (
    <>
      {/* Overview */}
      <section id="aqlm-overview" className="scroll-mt-20">
        <div className="overflow-hidden rounded-xl shadow-sm">
          <div className="bg-gradient-to-br from-emerald-700 via-teal-700 to-cyan-700 p-6 pb-8">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
                ICML 2024 (Best Paper 후보)
              </span>
              <span className="rounded-full bg-yellow-400/90 px-3 py-1 text-xs font-bold text-yellow-900">
                가산 양자화
              </span>
            </div>
            <h2 className="text-xl font-bold leading-snug text-white sm:text-2xl">
              AQLM: Extreme Compression of Large Language Models via Additive Quantization
            </h2>
            <p className="mt-3 text-sm text-emerald-200">
              Vage Egiazarian, Andrei Panferov, Denis Kuznedelev 외 (IST Austria, Yandex) · ICML 2024
            </p>
          </div>
          <div className="bg-white p-6 dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
            <p className="leading-relaxed text-gray-700 dark:text-gray-300">
              음성/이미지 압축에서 검증된{' '}
              <span className="font-semibold text-emerald-700 dark:text-emerald-300">가산 양자화(Additive Quantization, AQ)</span> 기법을
              LLM 가중치 압축에 적용합니다.
              각 가중치 열(column)을 M개 코드북의 합으로 표현해,
              동일 비트 수에서 단순 스칼라 양자화보다 훨씬 풍부한 표현 공간을 사용합니다.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {['M개 코드북', '빔 서치 최적화', '전역 SGD 미세조정', '1~2비트 SOTA'].map((tag) => (
                <span key={tag} className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Core Idea */}
      <section id="aqlm-idea" className="scroll-mt-20">
        <SectionHeading
          icon={<BrainCircuit className="h-5 w-5" />}
          title="핵심 아이디어: 가산 양자화"
          collapsed={!!col['aqlm-idea']}
          onToggle={() => toggle('aqlm-idea')}
        />
        <div className={`overflow-hidden transition-all duration-300 ${col['aqlm-idea'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="1.1" title="기본 표현" />
            <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
              각 가중치 열 w ∈ ℝᵈ를 M개 코드북의 합으로 표현합니다:
            </p>
            <div className="mb-4 overflow-x-auto rounded-lg bg-emerald-50 p-3 dark:bg-emerald-900/20">
              <EquationRenderer latex={String.raw`\hat{w}_j = \sum_{m=1}^{M} C_m[\, b_{j,m}\,], \quad C_m \in \mathbb{R}^{d \times K},\; b_{j,m} \in [K]`} />
            </div>
            <p className="mb-5 text-sm text-gray-600 dark:text-gray-400">
              C_m은 m번째 코드북 (d×K 행렬, K = 2^k 코드워드),
              b_&#123;j,m&#125;은 j번째 열에 대한 m번째 코드북 인덱스.
              유효 비트 수 = M·k/d 비트/가중치.
            </p>

            <SubSectionHeading number="1.2" title="인터랙티브 데모" />
            <AddQuantViz />
            <Caption>
              코드북을 하나씩 추가할수록 잔차(residual)가 줄어드는 과정을 확인하세요.
              같은 2비트에서 M=2는 M=1 대비 MSE를 ~68% 감소시킵니다.
            </Caption>

            <div className="mt-5">
              <SubSectionHeading number="1.3" title="스칼라 양자화 vs 가산 양자화" />
              <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800">
                      <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">특성</th>
                      <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">스칼라 (GPTQ)</th>
                      <th className="px-3 py-2 text-center text-emerald-600 dark:text-emerald-400">가산 (AQLM)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {[
                      { prop: '코드북 크기', scalar: 'K (단일)', aqlm: 'K^M (효과적)' },
                      { prop: '가중치 간 의존성', scalar: '없음', aqlm: '공유 코드북으로 포착' },
                      { prop: '2비트 레벨 수 (d=8)', scalar: '4', aqlm: '최대 4^M' },
                      { prop: '최적화 방법', scalar: '그리디 (GPTQ)', aqlm: '빔 서치 + SGD' },
                    ].map((r) => (
                      <tr key={r.prop} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">{r.prop}</td>
                        <td className="px-3 py-2 text-center text-gray-500 dark:text-gray-400">{r.scalar}</td>
                        <td className="px-3 py-2 text-center font-semibold text-emerald-600 dark:text-emerald-400">{r.aqlm}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Algorithm */}
      <section id="aqlm-algorithm" className="scroll-mt-20">
        <SectionHeading
          icon={<Cpu className="h-5 w-5" />}
          title="알고리즘: 빔 서치 + 전역 SGD"
          collapsed={!!col['aqlm-algorithm']}
          onToggle={() => toggle('aqlm-algorithm')}
        />
        <div className={`overflow-hidden transition-all duration-300 ${col['aqlm-algorithm'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              AQLM의 핵심 도전은 이산 코드 B = &#123;b_&#123;j,m&#125;&#125; 와 연속 코드북 C = &#123;C_m&#125;를 동시에 최적화하는 것입니다.
              이 문제를 교대 최적화로 해결합니다:
            </p>

            <div className="space-y-4">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-900/20">
                <p className="mb-2 text-sm font-bold text-emerald-700 dark:text-emerald-300">
                  Phase 1: 코드 탐색 (빔 서치)
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                  C 고정 → B 최적화. 각 열 j에 대해 M개 코드를 동시에 탐색합니다.
                  단순 그리디(m=1 최적, 다음 m=2 최적...)는 전역 최적을 보장하지 않으므로
                  빔 폭 B의 빔 서치로 (M이 작으면 정확히 탐색 가능).
                  시간 복잡도: O(K × B × M)
                </p>
              </div>

              <div className="rounded-xl border border-teal-200 bg-teal-50 p-4 dark:border-teal-800 dark:bg-teal-900/20">
                <p className="mb-2 text-sm font-bold text-teal-700 dark:text-teal-300">
                  Phase 2: 코드북 업데이트 (SGD)
                </p>
                <p className="text-xs text-teal-600 dark:text-teal-400">
                  B 고정 → C 최적화. 코드 인덱스를 고정한 채 코드북 원소를 SGD로 업데이트합니다.
                  목적 함수: min_C ‖WX - ΣC_m[B_m]X‖²_F.
                  이는 선형 최소제곱 문제이므로 효율적 풀이 가능.
                </p>
              </div>

              <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-4 dark:border-cyan-800 dark:bg-cyan-900/20">
                <p className="mb-2 text-sm font-bold text-cyan-700 dark:text-cyan-300">
                  Phase 3: 전역 미세조정 (STE)
                </p>
                <p className="text-xs text-cyan-600 dark:text-cyan-400">
                  전체 모델을 소규모 보정 데이터로 end-to-end 미세조정.
                  이산 B의 기울기는 Straight-Through Estimator(STE)로 근사합니다: ∂L/∂b ≈ ∂L/∂Ĉ[b].
                  이 단계가 레이어 간 상호작용을 고려한 최종 품질 향상의 핵심입니다.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Equations */}
      <section id="aqlm-equations" className="scroll-mt-20">
        <SectionHeading
          icon={<Hash className="h-5 w-5" />}
          title="핵심 수식"
          collapsed={!!col['aqlm-equations']}
          onToggle={() => toggle('aqlm-equations')}
        />
        <div className={`overflow-hidden transition-all duration-300 ${col['aqlm-equations'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="space-y-3">
              <EqCard idx={1} name="가산 양자화 표현" color="emerald"
                latex={String.raw`\hat{W}_{:,j} = \sum_{m=1}^{M} C_m\!\left[\, b_{j,m} \,\right], \quad C_m \in \mathbb{R}^{d \times K}`}
                description="j번째 가중치 열을 M개 코드북 조회의 합으로 표현합니다. C_m은 d×K 코드북 행렬이고, b_{j,m}은 [1, K] 범위의 정수 인덱스입니다. 각 코드북 항목은 d차원 벡터입니다." />
              <EqCard idx={2} name="효과적 비트 수" color="emerald"
                latex={String.raw`\text{bits/weight} = \frac{M \cdot \log_2 K}{d} = \frac{M \cdot k}{d}`}
                description="d차원 가중치 열에 M개 코드북, 각 크기 K = 2^k를 사용하면 열 당 M·k 비트가 필요합니다. d=8, M=2, k=8이면 2·8/8 = 2 비트/가중치." />
              <EqCard idx={3} name="AQLM 전체 목적 함수" color="emerald"
                latex={String.raw`\min_{\{C_m\}, \{B\}} \sum_{\ell=1}^{L} \left\| W^{(\ell)} X^{(\ell)} - \hat{W}^{(\ell)} X^{(\ell)} \right\|_F^2`}
                description="모든 레이어 ℓ에 걸쳐 입력 X^(ℓ)에서의 출력 오차를 최소화합니다. 레이어별 독립 최적화(GPTQ 방식)가 아닌 전역 목적함수를 사용하므로 레이어 간 오차 보상이 가능합니다." />
              <EqCard idx={4} name="빔 서치 코드 탐색" color="emerald"
                latex={String.raw`b_{j,1:M}^{\star} = \mathop{\arg\min}_{b_1,\ldots,b_M \in [K]^M} \left\| w_j - \sum_{m=1}^{M} C_m[b_m] \right\|_2^2`}
                description="각 열 j에 대해 M개 코드 인덱스의 최적 조합을 찾습니다. K^M 가지를 모두 탐색하는 대신, 빔 서치로 빔 폭 B × K 후보만 유지합니다. M=2, K=256이면 256² = 65536 후보를 빔 서치로 줄입니다." />
            </div>
          </Card>
        </div>
      </section>

      {/* Results */}
      <section id="aqlm-results" className="scroll-mt-20">
        <SectionHeading
          icon={<BarChart2 className="h-5 w-5" />}
          title="실험 결과"
          collapsed={!!col['aqlm-results']}
          onToggle={() => toggle('aqlm-results')}
        />
        <div className={`overflow-hidden transition-all duration-300 ${col['aqlm-results'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-400">방법</th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-gray-400">비트</th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-gray-400">7B PPL</th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-gray-400">13B PPL</th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-gray-400">설정</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { m: 'FP16', b: '16', p7: '5.47', p13: '4.88', cfg: '—', hi: false },
                    { m: 'QuIP#', b: '2', p7: '5.57', p13: '4.95', cfg: 'E8', hi: false },
                    { m: 'AQLM (M=1)', b: '2', p7: '5.92', p13: '5.15', cfg: 'K=65536', hi: false },
                    { m: 'AQLM (M=2)', b: '2', p7: '5.22', p13: '4.72', cfg: 'K=256, d=8', hi: true },
                    { m: 'AQLM (M=1)', b: '1', p7: '7.35', p13: '6.12', cfg: 'K=65536', hi: false },
                  ].map((r, i) => (
                    <tr key={i} className={r.hi ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}>
                      <td className={`px-3 py-2 font-medium ${r.hi ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-700 dark:text-gray-300'}`}>
                        {r.hi && '★ '}{r.m}
                      </td>
                      <td className="px-3 py-2 text-center font-mono text-gray-500 dark:text-gray-400">{r.b}</td>
                      <td className={`px-3 py-2 text-center font-mono font-semibold ${r.hi ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-600 dark:text-gray-400'}`}>{r.p7}</td>
                      <td className={`px-3 py-2 text-center font-mono font-semibold ${r.hi ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-600 dark:text-gray-400'}`}>{r.p13}</td>
                      <td className="px-3 py-2 text-center text-gray-500 dark:text-gray-400">{r.cfg}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800 dark:bg-emerald-900/20">
              <p className="text-xs text-emerald-700 dark:text-emerald-300">
                <span className="font-bold">핵심 관찰:</span> AQLM M=2 설정이 2비트에서 PPL 5.22를 달성하며
                QuIP#(5.57)를 크게 뛰어넘습니다. 코드북 수와 크기의 균형이 중요하며,
                전역 SGD 미세조정이 약 0.3 PPL을 추가로 개선합니다.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Quiz */}
      <section id="aqlm-quiz" className="scroll-mt-20">
        <SectionHeading icon={<FlaskConical className="h-5 w-5" />} title="자기 점검" />
        <Card>
          <QuizSection color="emerald" questions={[
            {
              q: 'AQLM의 "가산" 구조가 단순 코드북 크기 증가보다 나은 이유는?',
              a: '단일 코드북으로 K=65536 (16비트 인덱스)을 사용하면 저장 비용은 같지만 코드북 자체가 너무 커서 학습이 어렵습니다. M=2개 코드북 각각 K=256이면 총 512개 코드워드만 학습하면 되는데, 조합으로 256^2 = 65536가지 표현이 가능합니다. 또한 각 코드북이 다른 "주파수"의 정보를 캡처합니다.',
            },
            {
              q: '빔 서치가 그리디 탐색보다 필요한 이유는?',
              a: 'M=2일 때 m=1 코드를 먼저 최적화하고 m=2를 최적화하는 그리디 방식은 첫 단계에서 잔차를 고려하지 않아 전역 최적을 놓칩니다. 빔 서치는 빔 폭 B만큼의 유망한 m=1 코드를 유지하면서 m=2까지 함께 탐색하므로 더 좋은 조합을 찾습니다.',
            },
            {
              q: 'STE(Straight-Through Estimator)가 전역 미세조정에 필요한 이유는?',
              a: '이산 인덱스 b는 불연속 함수여서 역전파가 불가능합니다. STE는 순전파에서는 실제 양자화된 값을 사용하되, 역전파에서는 기울기를 그대로 통과시킵니다. 이로써 코드북 C와 이산 코드 B를 end-to-end로 학습할 수 있어 레이어 간 오차 보상이 가능합니다.',
            },
          ]} />
        </Card>
      </section>
    </>
  );
}

/* ───────────────────────────────────────────────────────────── */
/*  Compare tab                                                  */
/* ───────────────────────────────────────────────────────────── */

function CompareContent({ collapsed: col, toggle }: { collapsed: Record<string, boolean>; toggle: (id: string) => void }) {
  const [notes, setNotes] = useState(() => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('quant-study-notes') ?? '';
  });
  const [saved, setSaved] = useState(false);

  const saveNotes = () => {
    localStorage.setItem('quant-study-notes', notes);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      {/* Evolution graph */}
      <section id="cmp-evolution" className="scroll-mt-20">
        <SectionHeading icon={<GitCompare className="h-5 w-5" />} title="논문 계보 & 성능 진화" />
        <Card>
          <PaperEvolutionGraph />
          <Caption>노드를 클릭하면 각 논문의 핵심 기여와 성능 수치를 확인할 수 있습니다.</Caption>
        </Card>
      </section>

      {/* Performance */}
      <section id="cmp-performance" className="scroll-mt-20">
        <SectionHeading
          icon={<BarChart2 className="h-5 w-5" />}
          title="성능 비교"
          collapsed={!!col['cmp-performance']}
          onToggle={() => toggle('cmp-performance')}
        />
        <div className={`overflow-hidden transition-all duration-300 ${col['cmp-performance'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <p className="mb-3 text-xs font-semibold text-gray-500 dark:text-gray-400">
              Llama-2-7B · WikiText-2 Perplexity (낮을수록 좋음)
            </p>

            {/* Bar chart SVG */}
            <div className="mb-4 overflow-x-auto rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
              <svg viewBox="0 0 480 200" width="100%" height={200}>
                {[
                  { label: 'FP16', ppl: 5.47, color: '#9ca3af', bits: '16' },
                  { label: 'GPTQ 4bit', ppl: 5.63, color: '#f97316', bits: '4' },
                  { label: 'QuIP 2bit', ppl: 6.44, color: '#6366f1', bits: '2' },
                  { label: 'QuIP# 2bit', ppl: 5.57, color: '#8b5cf6', bits: '2' },
                  { label: 'AQLM M=2', ppl: 5.22, color: '#10b981', bits: '2' },
                ].map(({ label, ppl, color, bits }, i) => {
                  const minPPL = 5.0;
                  const maxPPL = 7.0;
                  const barH = ((ppl - minPPL) / (maxPPL - minPPL)) * 140;
                  const x = 30 + i * 88;
                  const y = 160 - barH;
                  return (
                    <g key={label}>
                      <rect x={x} y={y} width={65} height={barH} fill={color} rx={4} opacity={0.85} />
                      <text x={x + 32} y={y - 4} textAnchor="middle" fontSize={10} fontWeight="bold" fill={color}>
                        {ppl}
                      </text>
                      <text x={x + 32} y={175} textAnchor="middle" fontSize={8.5} fill="#6b7280">{label}</text>
                      <text x={x + 32} y={186} textAnchor="middle" fontSize={7.5} fill="#9ca3af">{bits}bit</text>
                    </g>
                  );
                })}
                {/* FP16 baseline */}
                <line x1={10} y1={160 - ((5.47 - 5.0) / 2.0) * 140} x2={470} y2={160 - ((5.47 - 5.0) / 2.0) * 140} stroke="#9ca3af" strokeWidth={0.5} strokeDasharray="4,3" />
                <text x={12} y={160 - ((5.47 - 5.0) / 2.0) * 140 - 3} fontSize={7.5} fill="#9ca3af">FP16 기준</text>
              </svg>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">논문</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">년도</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">2bit 7B PPL</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">FP16 대비</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">속도 (상대)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { p: 'QuIP', ppl: '6.44', delta: '+17.7%', speed: '보통', color: 'indigo' },
                    { p: 'QuIP#', ppl: '5.57', delta: '+1.8%', speed: '빠름', color: 'purple' },
                    { p: 'AQLM (M=2)', ppl: '5.22', delta: '-4.6%', speed: '느림', color: 'emerald' },
                  ].map((r) => (
                    <tr key={r.p} className={`bg-${r.color}-50/50 dark:bg-${r.color}-900/10`}>
                      <td className={`px-3 py-2 font-bold text-${r.color}-700 dark:text-${r.color}-300`}>{r.p}</td>
                      <td className="px-3 py-2 text-center font-mono text-gray-600 dark:text-gray-400">{r.ppl}</td>
                      <td className={`px-3 py-2 text-center font-mono font-semibold ${parseFloat(r.delta) <= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>{r.delta}</td>
                      <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">{r.speed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </section>

      {/* Methodology */}
      <section id="cmp-methodology" className="scroll-mt-20">
        <SectionHeading
          icon={<Layers className="h-5 w-5" />}
          title="방법론 비교"
          collapsed={!!col['cmp-methodology']}
          onToggle={() => toggle('cmp-methodology')}
        />
        <div className={`overflow-hidden transition-all duration-300 ${col['cmp-methodology'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">기준</th>
                    <th className="px-3 py-2 text-center text-indigo-600 dark:text-indigo-400">QuIP</th>
                    <th className="px-3 py-2 text-center text-purple-600 dark:text-purple-400">QuIP#</th>
                    <th className="px-3 py-2 text-center text-emerald-600 dark:text-emerald-400">AQLM</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { p: '비간섭 처리', q: '랜덤 직교 행렬', qs: 'Hadamard 변환', aq: '없음 (별도 전략)' },
                    { p: '변환 복잡도', q: 'O(n³)', qs: 'O(n log n)', aq: 'O(1)' },
                    { p: '코드북 유형', q: '스칼라 (1D)', qs: 'E8 격자 (8D)', aq: '학습 코드북 (dD)' },
                    { p: '최적화 방식', q: 'LDLQ (그리디)', qs: 'LDLQ + E8', aq: '빔 서치 + SGD' },
                    { p: '레이어 간 최적화', q: '없음', qs: '없음', aq: '있음 (전역 SGD)' },
                    { p: '이론적 보장', q: '있음', qs: '있음', aq: '없음 (경험적)' },
                    { p: '압축 비율 (7B)', q: '8x vs FP16', qs: '8x vs FP16', aq: '8x vs FP16' },
                  ].map((r) => (
                    <tr key={r.p} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">{r.p}</td>
                      <td className="px-3 py-2 text-center text-indigo-600 dark:text-indigo-400">{r.q}</td>
                      <td className="px-3 py-2 text-center text-purple-600 dark:text-purple-400">{r.qs}</td>
                      <td className="px-3 py-2 text-center text-emerald-600 dark:text-emerald-400">{r.aq}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </section>

      {/* Insights */}
      <section id="cmp-insights" className="scroll-mt-20">
        <SectionHeading icon={<Sparkles className="h-5 w-5" />} title="핵심 인사이트" />
        <Card>
          <div className="space-y-4">
            {[
              {
                icon: '🎯',
                title: '비간섭 처리는 2비트의 필수 조건',
                body: 'QuIP, QuIP# 모두 비간섭 처리 없이는 2비트에서 동작하지 않았습니다. 가중치 분포를 균일하게 만드는 것이 2비트 양자화의 선결 조건입니다.',
              },
              {
                icon: '🔢',
                title: '고차원 동시 최적화가 핵심',
                body: 'QuIP#의 E8(8D)과 AQLM의 가산 양자화 모두, 여러 가중치를 동시에 고려하는 고차원 코드북이 핵심 성능 향상의 원천입니다. 1D 스칼라 양자화의 한계를 벗어나야 합니다.',
              },
              {
                icon: '⚖️',
                title: '속도-품질 트레이드오프',
                body: 'QuIP#는 빠른 Hadamard 변환으로 QuIP의 성능을 크게 개선했습니다. AQLM은 더 좋은 품질을 달성하지만 빔 서치와 전역 SGD로 압축 시간이 훨씬 깁니다. 실용적 선택은 사용 사례에 따라 다릅니다.',
              },
              {
                icon: '📊',
                title: '모델 크기 효과',
                body: '70B 이상 큰 모델에서 모든 방법의 성능 열화가 줄어듭니다. 이는 큰 모델이 양자화 오차에 더 강건하다는 것을 의미하며, 실용적으로 큰 모델의 2비트 압축이 더 매력적입니다.',
              },
            ].map(({ icon, title, body }) => (
              <div key={title} className="flex gap-3 rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                <span className="text-xl">{icon}</span>
                <div>
                  <p className="mb-1 text-sm font-bold text-gray-800 dark:text-gray-200">{title}</p>
                  <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-400">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Notes */}
      <section id="cmp-notes" className="scroll-mt-20">
        <SectionHeading icon={<FileText className="h-5 w-5" />} title="학습 노트" />
        <Card>
          <p className="mb-2 text-sm font-bold text-gray-700 dark:text-gray-300">자유 메모</p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="퀵 메모: 질문, 아이디어, 헷갈리는 부분 등을 자유롭게 적어두세요..."
            rows={8}
            className="w-full resize-y rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:border-blue-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:placeholder-gray-600"
          />
          <div className="mt-3 flex items-center gap-3">
            <button
              onClick={saveNotes}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              저장
            </button>
            {saved && <span className="text-xs font-medium text-green-600 dark:text-green-400">저장됨 ✓</span>}
          </div>
        </Card>
      </section>
    </>
  );
}

/* ── popcount helper for Hadamard viz ─── */
function bin(n: number): number { return n; } // just used for & operator

/* ───────────────────────────────────────────────────────────── */
/*  Main Page                                                    */
/* ───────────────────────────────────────────────────────────── */

function QuantStudyPageInner() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') as PaperKey | null;
  const [activeTab, setActiveTab] = useState<PaperKey>(
    tabParam && ['quip', 'quipsharp', 'aqlm', 'compare'].includes(tabParam) ? tabParam : 'quip',
  );
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isTocCollapsed, setIsTocCollapsed] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [activeSection, setActiveSection] = useState<string>('');
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const handler = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

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
    const toc = TOC[activeTab];
    for (const s of toc) {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    }
    observerRef.current = observer;
    return () => observer.disconnect();
  }, [activeTab]);

  const toggle = useCallback((id: string) => {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const scrollToSection = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const tabColor: Record<PaperKey, string> = {
    quip: 'indigo',
    quipsharp: 'purple',
    aqlm: 'emerald',
    compare: 'amber',
  };

  const colorStyles: Record<string, { tab: string; tabActive: string; toc: string; tocActive: string }> = {
    indigo: {
      tab: 'text-gray-600 hover:bg-indigo-50 dark:text-gray-400',
      tabActive: 'bg-indigo-600 text-white shadow',
      toc: 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800',
      tocActive: 'border-l-2 border-indigo-600 bg-indigo-50 font-semibold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
    },
    purple: {
      tab: 'text-gray-600 hover:bg-purple-50 dark:text-gray-400',
      tabActive: 'bg-purple-600 text-white shadow',
      toc: 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800',
      tocActive: 'border-l-2 border-purple-600 bg-purple-50 font-semibold text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    },
    emerald: {
      tab: 'text-gray-600 hover:bg-emerald-50 dark:text-gray-400',
      tabActive: 'bg-emerald-600 text-white shadow',
      toc: 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800',
      tocActive: 'border-l-2 border-emerald-600 bg-emerald-50 font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    },
    amber: {
      tab: 'text-gray-600 hover:bg-amber-50 dark:text-gray-400',
      tabActive: 'bg-amber-500 text-white shadow',
      toc: 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800',
      tocActive: 'border-l-2 border-amber-500 bg-amber-50 font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    },
  };

  const currentColor = tabColor[activeTab];
  const styles = colorStyles[currentColor];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />

      {/* Reading progress bar */}
      <div
        className={`fixed left-0 top-16 z-40 h-0.5 transition-all ${
          { indigo: 'bg-indigo-500', purple: 'bg-purple-500', emerald: 'bg-emerald-500', amber: 'bg-amber-500' }[currentColor]
        }`}
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Breadcrumb */}
      <div className="border-b border-gray-200 bg-white px-4 py-2 dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex max-w-[calc(16rem+56rem)] items-center gap-2 text-sm">
          <span className="text-gray-500 dark:text-gray-400">공부</span>
          <ChevronRight className="h-3 w-3 text-gray-400" />
          <span className="font-medium text-gray-800 dark:text-gray-200">LLM 극단적 양자화 3편</span>
          <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
            2-bit 압축
          </span>
        </div>
      </div>

      {/* Paper tabs */}
      <div className="sticky top-16 z-30 border-b border-gray-200 bg-white/95 backdrop-blur dark:border-gray-800 dark:bg-gray-900/95">
        <div className="mx-auto flex max-w-[calc(16rem+56rem)] items-center gap-1 overflow-x-auto px-4 py-2">
          {PAPER_TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const c = colorStyles[tab.color];
            return (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`flex flex-shrink-0 flex-col items-center rounded-lg px-4 py-2 text-sm transition ${
                  isActive ? c.tabActive : c.tab
                }`}
              >
                <span className="font-bold">{tab.label}</span>
                <span className={`text-[10px] ${isActive ? 'text-white/80' : 'text-gray-400 dark:text-gray-500'}`}>
                  {tab.short}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Layout */}
      <div className="flex">
        {/* Sidebar ToC */}
        <aside
          className={`sticky top-32 hidden h-[calc(100vh-8rem)] flex-shrink-0 overflow-y-auto border-r border-gray-200 bg-gray-50/80 transition-all duration-200 lg:block dark:border-gray-800 dark:bg-gray-900/80 ${
            isTocCollapsed ? 'w-16 p-2' : 'w-56 p-4'
          }`}
        >
          <div className={`mb-3 flex items-center ${isTocCollapsed ? 'justify-center' : 'justify-between'}`}>
            {!isTocCollapsed && (
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">목차</p>
            )}
            <button
              onClick={() => setIsTocCollapsed((v) => !v)}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 text-gray-500 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
              title={isTocCollapsed ? '목차 펼치기' : '목차 접기'}
            >
              <ChevronRight className={`h-4 w-4 transition-transform ${isTocCollapsed ? '' : 'rotate-180'}`} />
            </button>
          </div>
          <nav className="space-y-1">
            {TOC[activeTab].map((s) => {
              const Icon = s.icon;
              const isActive = activeSection === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => scrollToSection(s.id)}
                  title={s.label}
                  className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-sm transition ${
                    isTocCollapsed ? 'justify-center px-2' : 'gap-2.5'
                  } ${isActive ? styles.tocActive : styles.toc}`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {!isTocCollapsed && s.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1">
          <div className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
            {activeTab === 'quip' && <QuIPContent collapsed={collapsed} toggle={toggle} />}
            {activeTab === 'quipsharp' && <QuIPSharpContent collapsed={collapsed} toggle={toggle} />}
            {activeTab === 'aqlm' && <AQLMContent collapsed={collapsed} toggle={toggle} />}
            {activeTab === 'compare' && <CompareContent collapsed={collapsed} toggle={toggle} />}
            <div className="h-16" />
          </div>
        </main>
      </div>
    </div>
  );
}

export default function QuantStudyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 dark:bg-gray-950" />}>
      <QuantStudyPageInner />
    </Suspense>
  );
}
