'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  BarChart2,
  BrainCircuit,
  ChevronDown,
  Cpu,
  GraduationCap,
  Hash,
  Layers,
  AlertTriangle,
  Zap,
  HelpCircle,
} from 'lucide-react';
import katex from 'katex';
import GlossaryText from '@/components/glossary/GlossaryText';

/* ── helpers ─────────────────────────────────────────────────── */

function EquationRenderer({ latex }: { latex: string }) {
  const html = useMemo(() => {
    try { return katex.renderToString(latex, { throwOnError: false, displayMode: true }); }
    catch { return null; }
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

function SectionHeading({ icon, title, collapsed, onToggle }: {
  icon: React.ReactNode; title: string; collapsed?: boolean; onToggle?: () => void;
}) {
  return (
    <button onClick={onToggle} className="mb-3 flex w-full items-center gap-2.5 text-left">
      <span className="text-gray-500 dark:text-gray-400">{icon}</span>
      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">{title}</h3>
      {onToggle && (
        <ChevronDown className={`ml-auto h-5 w-5 text-gray-400 transition-transform dark:text-gray-500 ${collapsed ? '-rotate-90' : ''}`} />
      )}
    </button>
  );
}

function SubSectionHeading({ number, title }: { number: string; title: string }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">{number}</span>
      <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">{title}</h4>
    </div>
  );
}

function EqCard({ idx, name, latex, description, color = 'indigo' }: {
  idx: number; name: string; latex: string; description: string; color?: string;
}) {
  const [open, setOpen] = useState(false);
  const colorMap: Record<string, string> = {
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800',
    purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
    amber:  'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
    green:  'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    teal:   'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800',
  };
  const badgeMap: Record<string, string> = {
    indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    amber:  'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    green:  'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    teal:   'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
  };
  return (
    <div className="cursor-pointer rounded-xl border border-gray-200 bg-gray-50/50 p-4 transition hover:border-indigo-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-indigo-700" onClick={() => setOpen(v => !v)}>
      <div className="mb-2 flex items-center gap-2">
        <span className={`rounded px-2 py-0.5 text-xs font-bold ${badgeMap[color] ?? badgeMap.indigo}`}>Eq. {idx}</span>
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{name}</span>
        <ChevronDown className={`ml-auto h-4 w-4 text-gray-400 transition-transform dark:text-gray-500 ${open ? 'rotate-180' : ''}`} />
      </div>
      <div className="overflow-x-auto py-2 text-gray-900 dark:text-gray-100"><EquationRenderer latex={latex} /></div>
      {open ? (
        <div className={`mt-3 rounded-lg border px-4 py-3 ${colorMap[color] ?? colorMap.indigo}`}>
          <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">{description}</p>
        </div>
      ) : (
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">클릭하여 상세 설명 보기</p>
      )}
    </div>
  );
}

/* ── Interactive: Dynamic Depth Visualization ────────────────── */

function DepthViz() {
  const [step, setStep] = useState(0);
  const tokens = ['The', 'cat', 'sat', 'on', 'the', 'mat', 'because', 'it', 'was', 'tired'];
  // Simulated router scores per thinking step (higher = more important)
  const scores: number[][] = [
    [0.2, 0.8, 0.5, 0.1, 0.2, 0.4, 0.9, 0.7, 0.3, 0.6],  // step 1
    [0.1, 0.6, 0.3, 0.1, 0.1, 0.2, 0.95, 0.85, 0.2, 0.7], // step 2
    [0.1, 0.4, 0.2, 0.05, 0.1, 0.1, 0.92, 0.9, 0.15, 0.8], // step 3
  ];
  const threshold = 0.5;
  const currentScores = scores[step];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold text-gray-600 dark:text-gray-400">Thinking Step:</span>
        {[0, 1, 2].map(s => (
          <button
            key={s}
            onClick={() => setStep(s)}
            className={`rounded-full px-3 py-1 text-xs font-bold transition ${
              step === s
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            t={s + 1}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-10 gap-1.5">
        {tokens.map((tok, i) => {
          const score = currentScores[i];
          const selected = score > threshold;
          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <div
                className={`flex h-10 w-full items-center justify-center rounded-lg border-2 text-xs font-bold transition-all duration-300 ${
                  selected
                    ? 'border-indigo-500 bg-indigo-100 text-indigo-800 dark:border-indigo-400 dark:bg-indigo-900/40 dark:text-indigo-200 scale-105'
                    : 'border-gray-200 bg-gray-50 text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500'
                }`}
              >
                {tok}
              </div>
              {/* Score bar */}
              <div className="h-16 w-3 rounded-full bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
                <div
                  className={`absolute bottom-0 w-full rounded-full transition-all duration-500 ${
                    selected ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                  style={{ height: `${score * 100}%` }}
                />
              </div>
              <span className={`text-[10px] font-mono ${selected ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-gray-400'}`}>
                {score.toFixed(2)}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded border-2 border-indigo-500 bg-indigo-100" />
          선택됨 (score &gt; {threshold})
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded border-2 border-gray-200 bg-gray-50" />
          패스 (이전 표현 유지)
        </span>
        <span className="ml-auto font-semibold">
          선택된 토큰: {currentScores.filter(s => s > threshold).length}/{tokens.length}
        </span>
      </div>

      <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-3 dark:border-indigo-800 dark:bg-indigo-900/20">
        <p className="text-xs leading-relaxed text-indigo-700 dark:text-indigo-300">
          <strong>관찰:</strong> &quot;because&quot;(인과 접속사)와 &quot;it&quot;(대용어), &quot;tired&quot;(의미 핵심어)는 매 스텝 선택됩니다.
          반면 &quot;The&quot;, &quot;on&quot;, &quot;the&quot; 같은 기능어는 추가 연산 없이 통과합니다.
          스텝이 진행될수록 핵심 토큰에 연산이 집중되는 패턴이 관찰됩니다.
        </p>
      </div>
    </div>
  );
}

/* ── Architecture Diagram ────────────────────────────────────── */

function ArchitectureDiagram() {
  return (
    <div className="space-y-3">
      {/* Main flow */}
      <div className="flex items-stretch gap-2 overflow-x-auto">
        {/* Input */}
        <div className="flex min-w-[80px] flex-col items-center justify-center rounded-lg border-2 border-gray-300 bg-gray-50 p-2 dark:border-gray-600 dark:bg-gray-800">
          <span className="text-[10px] font-bold text-gray-500">Input</span>
          <span className="text-xs font-mono text-gray-700 dark:text-gray-300">X</span>
        </div>

        <div className="flex items-center text-gray-400">&#8594;</div>

        {/* Base Forward */}
        <div className="flex min-w-[100px] flex-col items-center justify-center rounded-lg border-2 border-blue-400 bg-blue-50 p-2 dark:border-blue-600 dark:bg-blue-900/30">
          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-300">Base Pass</span>
          <span className="text-xs font-mono text-blue-700 dark:text-blue-200">f(X)</span>
          <span className="text-[9px] text-blue-500">Y^(0)</span>
        </div>

        <div className="flex items-center text-gray-400">&#8594;</div>

        {/* Router */}
        <div className="flex min-w-[90px] flex-col items-center justify-center rounded-lg border-2 border-amber-400 bg-amber-50 p-2 dark:border-amber-600 dark:bg-amber-900/30">
          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-300">Router</span>
          <span className="text-xs font-mono text-amber-700 dark:text-amber-200">R(Y)</span>
          <span className="text-[9px] text-amber-500">Top-K 선택</span>
        </div>

        <div className="flex items-center text-gray-400">&#8594;</div>

        {/* Thinking Steps (stacked) */}
        <div className="flex flex-col gap-1 min-w-[120px]">
          {[1, 2, 3].map(t => (
            <div key={t} className={`flex items-center justify-center rounded-lg border-2 p-1.5 ${
              t === 1 ? 'border-indigo-400 bg-indigo-50 dark:border-indigo-600 dark:bg-indigo-900/30'
              : t === 2 ? 'border-purple-400 bg-purple-50 dark:border-purple-600 dark:bg-purple-900/30'
              : 'border-violet-400 bg-violet-50 dark:border-violet-600 dark:bg-violet-900/30'
            }`}>
              <span className="text-[10px] font-bold" style={{ color: t === 1 ? '#4f46e5' : t === 2 ? '#7c3aed' : '#6d28d9' }}>
                Think t={t}: f(Y) * phi({t}) * w
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center text-gray-400">&#8594;</div>

        {/* Accumulate (RTC) */}
        <div className="flex min-w-[100px] flex-col items-center justify-center rounded-lg border-2 border-green-400 bg-green-50 p-2 dark:border-green-600 dark:bg-green-900/30">
          <span className="text-[10px] font-bold text-green-600 dark:text-green-300">RTC 누적</span>
          <span className="text-[9px] font-mono text-green-700 dark:text-green-200">Y^(0)*phi^(0)</span>
          <span className="text-[9px] font-mono text-green-700 dark:text-green-200">+ SUM(Y&apos;*phi)</span>
        </div>

        <div className="flex items-center text-gray-400">&#8594;</div>

        {/* Output */}
        <div className="flex min-w-[80px] flex-col items-center justify-center rounded-lg border-2 border-gray-300 bg-gray-50 p-2 dark:border-gray-600 dark:bg-gray-800">
          <span className="text-[10px] font-bold text-gray-500">Output</span>
          <span className="text-xs font-mono text-gray-700 dark:text-gray-300">Y^(T)</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-[10px]">
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-blue-400" /> Base Forward</span>
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-amber-400" /> Adaptive Token Routing</span>
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-indigo-400" /> Thinking Steps</span>
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-green-400" /> Residual Thinking Connection</span>
      </div>
    </div>
  );
}

/* ── Quiz Component ──────────────────────────────────────────── */

function Quiz() {
  const questions = [
    {
      q: 'ITT에서 토큰별로 연산량이 달라지는 핵심 메커니즘은?',
      options: ['Attention Masking', 'Adaptive Token Routing', 'Dropout', 'Mixture of Experts'],
      answer: 1,
      explanation: 'Adaptive Token Routing(ATR)이 각 thinking step에서 라우터 점수가 threshold를 넘는 토큰만 선별하여 추가 연산을 수행합니다.',
    },
    {
      q: 'ITT x4-162M이 LLaMA2-466M 성능의 몇 %를 달성하는가?',
      options: ['85.0%', '90.2%', '96.5%', '99.1%'],
      answer: 2,
      explanation: '162M 파라미터로 466M 모델 성능의 96.5%를 달성합니다. 파라미터 확장 없이 depth scaling으로 효율을 극대화한 결과입니다.',
    },
    {
      q: 'Ablation에서 가장 큰 성능 하락을 유발하는 컴포넌트 제거는?',
      options: ['Thinking Step Encoding 제거', 'Adaptive Token Routing 제거', 'Residual Thinking Connection 제거', 'Router Sigmoid 대신 Tanh'],
      answer: 2,
      explanation: 'RTC 제거 시 PPL이 +0.77 증가하여 가장 큰 성능 하락을 보입니다. RTC는 각 thinking step의 결과를 누적하는 핵심 메커니즘입니다.',
    },
    {
      q: 'ITT가 Loop Transformer 대비 FLOPs 효율이 높은 이유는?',
      options: [
        '파라미터 수가 적어서',
        'Attention을 사용하지 않아서',
        '모든 토큰이 아닌 선택된 토큰만 추가 연산하므로',
        'KV 캐시를 공유하므로',
      ],
      answer: 2,
      explanation: 'ATR이 상위 rho% 토큰만 선택하므로, Loop처럼 전체 시퀀스를 반복하지 않습니다. ITT x4는 Loop x4 FLOPs의 약 70%만 사용합니다.',
    },
    {
      q: '논문에서 "gradient spike"가 의미하는 현상은?',
      options: [
        '학습률이 너무 높을 때 발생하는 발산',
        '어려운 토큰에서 특정 레이어의 gradient nuclear norm이 급증하는 현상',
        'Batch normalization 실패',
        '과적합으로 인한 loss 급증',
      ],
      answer: 1,
      explanation: '어려운 샘플(오답 예측)에서 중간 레이어(L3, L5, L7, L9)의 attention gradient nuclear norm이 급격히 증가합니다. 이는 아키텍처의 깊이 부족으로 인한 최적화 스트레스를 나타냅니다.',
    },
  ];

  const [selected, setSelected] = useState<(number | null)[]>(Array(questions.length).fill(null));
  const [revealed, setRevealed] = useState<boolean[]>(Array(questions.length).fill(false));

  return (
    <div className="space-y-4">
      {questions.map((qq, qi) => (
        <div key={qi} className="rounded-lg border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="mb-3 text-sm font-semibold text-gray-800 dark:text-gray-200">Q{qi + 1}. {qq.q}</p>
          <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {qq.options.map((opt, oi) => {
              const isSelected = selected[qi] === oi;
              const isCorrect = oi === qq.answer;
              const showResult = revealed[qi];
              let cls = 'border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-700 hover:border-indigo-300';
              if (showResult && isCorrect) cls = 'border-green-500 bg-green-50 dark:border-green-400 dark:bg-green-900/30';
              else if (showResult && isSelected && !isCorrect) cls = 'border-red-500 bg-red-50 dark:border-red-400 dark:bg-red-900/30';
              else if (isSelected) cls = 'border-indigo-500 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-900/30';

              return (
                <button
                  key={oi}
                  onClick={() => {
                    if (revealed[qi]) return;
                    const ns = [...selected]; ns[qi] = oi; setSelected(ns);
                  }}
                  className={`rounded-lg border-2 px-3 py-2 text-left text-xs transition ${cls}`}
                >
                  <span className="font-mono font-bold text-gray-400 mr-1">{String.fromCharCode(65 + oi)}.</span>
                  <span className="text-gray-700 dark:text-gray-300">{opt}</span>
                </button>
              );
            })}
          </div>
          {selected[qi] !== null && !revealed[qi] && (
            <button
              onClick={() => { const nr = [...revealed]; nr[qi] = true; setRevealed(nr); }}
              className="rounded bg-indigo-600 px-3 py-1 text-xs font-bold text-white hover:bg-indigo-700"
            >
              정답 확인
            </button>
          )}
          {revealed[qi] && (
            <div className={`mt-2 rounded-lg border px-3 py-2 ${
              selected[qi] === qq.answer
                ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
            }`}>
              <p className="text-xs font-bold mb-1" style={{ color: selected[qi] === qq.answer ? '#15803d' : '#dc2626' }}>
                {selected[qi] === qq.answer ? 'Correct!' : `오답 - 정답: ${String.fromCharCode(65 + qq.answer)}`}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">{qq.explanation}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────── */

export default function InnerThinkingStudyFull() {
  const [col, setCol] = useState<Record<string, boolean>>({});
  const toggle = useCallback((id: string) => setCol(c => ({ ...c, [id]: !c[id] })), []);

  return (
    <GlossaryText>
    <div className="space-y-6">

      {/* ── Overview ─────────────────────────────────────────── */}
      <section id="itt-overview" className="scroll-mt-20">
        <div className="overflow-hidden rounded-xl shadow-sm">
          <div className="bg-gradient-to-br from-violet-700 via-indigo-700 to-blue-700 p-6 pb-8">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">arXiv 2502.13842</span>
              <span className="rounded-full bg-yellow-400/90 px-3 py-1 text-xs font-bold text-yellow-900">Baidu Inc. / 2025</span>
            </div>
            <h2 className="text-xl font-bold leading-snug text-white sm:text-2xl">
              Inner Thinking Transformer: 동적 깊이 스케일링을 통한 적응적 내부 사고
            </h2>
            <p className="mt-3 text-sm text-indigo-200">
              Yilong Chen, Junyuan Shang, Zhenyu Zhang et al. (Baidu) -- Feb 2025
            </p>
          </div>
          <div className="bg-white p-6 dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
            <p className="leading-relaxed text-gray-700 dark:text-gray-300">
              트랜스포머의 각 레이어를 하나의 <span className="font-semibold text-indigo-700 dark:text-indigo-300">&quot;사고 단계(thinking step)&quot;</span>로 재해석합니다.
              핵심 관찰: 어려운 토큰은 중간 레이어에서 <em>gradient spike</em>를 유발하며, 이는 아키텍처 깊이의 부족을 나타냅니다.
              ITT는 <strong>파라미터 확장 없이</strong> 토큰별로 동적으로 연산 깊이를 조절하여,
              162M 모델로 466M 모델 성능의 <span className="font-semibold text-indigo-700 dark:text-indigo-300">96.5%</span>를 달성합니다.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {['Dynamic Depth', 'Adaptive Token Routing', 'Residual Thinking', 'Parameter-Efficient', '11 Benchmarks'].map(tag => (
                <span key={tag} className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Core Idea ────────────────────────────────────────── */}
      <section id="itt-core-idea" className="scroll-mt-20">
        <SectionHeading icon={<BrainCircuit className="h-5 w-5" />} title="핵심 아이디어: 왜 동적 깊이가 필요한가?" collapsed={!!col['itt-core-idea']} onToggle={() => toggle('itt-core-idea')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['itt-core-idea'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="1.1" title="Gradient Spike 현상" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              GPT-2로 수학 추론 데이터(AQuA)를 학습시킨 뒤, 쉬운 샘플(정답 예측)과 어려운 샘플(오답 예측)의
              attention gradient nuclear norm(GNN)을 레이어별로 측정합니다.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900/40 dark:bg-green-900/10">
                <p className="mb-1 text-xs font-bold text-green-700 dark:text-green-300">쉬운 샘플</p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  GNN이 초기 레이어에서 빠르게 감소<br/>
                  중간 레이어(L3~L10)에서 3 이하로 안정<br/>
                  모델이 충분한 깊이로 처리 완료
                </p>
              </div>
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-900/10">
                <p className="mb-1 text-xs font-bold text-red-700 dark:text-red-300">어려운 샘플</p>
                <p className="text-xs text-red-600 dark:text-red-400">
                  GNN이 전 레이어에 걸쳐 진동<br/>
                  L3, L5, L7, L9에서 <strong>급격한 spike</strong><br/>
                  아키텍처 깊이 부족 = 최적화 스트레스
                </p>
              </div>
            </div>

            <div className="mt-5">
              <SubSectionHeading number="1.2" title="핵심 통찰: 레이어 = 사고 단계" />
              <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                각 트랜스포머 레이어의 hidden state 변환을 하나의 &quot;사고 단계&quot;로 재해석합니다:
              </p>
              <div className="mb-3 overflow-x-auto rounded-lg bg-indigo-50 p-3 dark:bg-indigo-900/20">
                <EquationRenderer latex={String.raw`x^{(0)} \xrightarrow{f} x^{(1)} \xrightarrow{f} x^{(2)} \xrightarrow{f} \cdots \xrightarrow{f} x^{(T)}`} />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
                  <p className="text-xs font-bold text-blue-700 dark:text-blue-300">Early Exit 가능</p>
                  <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                    쉬운 토큰: t=1에서 충분 &rarr; 추가 연산 불필요
                  </p>
                </div>
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20">
                  <p className="text-xs font-bold text-amber-700 dark:text-amber-300">심화 사고 필요</p>
                  <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                    어려운 토큰: t=T까지 반복 연산 필요
                  </p>
                </div>
                <div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20">
                  <p className="text-xs font-bold text-green-700 dark:text-green-300">파라미터 공유</p>
                  <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                    같은 f를 T번 반복 &rarr; 파라미터 증가 없음
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5">
              <SubSectionHeading number="1.3" title="ITT vs 기존 접근법" />
              <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                <table className="w-full text-xs">
                  <thead><tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">방법</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">토큰별 깊이</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">파라미터 효율</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">연산 효율</th>
                  </tr></thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {[
                      { m: 'Standard Transformer', d: 'X (고정)', p: 'X (레이어 증가=파라미터 증가)', c: '고정' },
                      { m: 'Loop Transformer', d: 'X (전체 반복)', p: 'O (파라미터 공유)', c: '비효율 (전체 토큰 반복)' },
                      { m: 'Early Exit', d: 'O (레이어 수준)', p: 'X', c: 'O' },
                      { m: 'ITT', d: 'O (토큰 수준)', p: 'O (파라미터 공유)', c: 'O (선택적 연산)' },
                    ].map((r, i) => (
                      <tr key={i} className={i === 3 ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}>
                        <td className={`px-3 py-2 font-medium ${i === 3 ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'}`}>{r.m}</td>
                        <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">{r.d}</td>
                        <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">{r.p}</td>
                        <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">{r.c}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Architecture ─────────────────────────────────────── */}
      <section id="itt-architecture" className="scroll-mt-20">
        <SectionHeading icon={<Layers className="h-5 w-5" />} title="아키텍처: ITT의 세 가지 핵심 컴포넌트" collapsed={!!col['itt-architecture']} onToggle={() => toggle('itt-architecture')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['itt-architecture'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="2.1" title="전체 구조 다이어그램" />
            <ArchitectureDiagram />

            <div className="mt-5">
              <SubSectionHeading number="2.2" title="Adaptive Token Routing (ATR)" />
              <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                각 thinking step마다 경량 라우터가 토큰의 중요도를 평가하고, 상위 토큰만 추가 연산에 투입합니다:
              </p>
              <div className="mb-3 overflow-x-auto rounded-lg bg-amber-50 p-3 dark:bg-amber-900/20">
                <EquationRenderer latex={String.raw`w^{(t)} = \mathcal{R}^{(t)}(Y^{(t-1)}) \in \mathbb{R}^n, \quad \mathcal{R}^{(t)} \in \mathbb{R}^{d \times 1}`} />
              </div>
              <div className="mb-4 overflow-x-auto rounded-lg bg-amber-50 p-3 dark:bg-amber-900/20">
                <EquationRenderer latex={String.raw`Y_i^{(t)\prime} = \begin{cases} \alpha^{(t)}\, w_i^{(t)}\, f(Y_i^{(t-1)}) & \text{if } w_i^{(t)} > P_\rho(w^{(t)}) \\ Y_i^{(t-1)} & \text{otherwise} \end{cases}`} />
              </div>
              <div className="space-y-2 mb-4">
                {[
                  { label: 'R^(t)', desc: '경량 선형 라우터 (d x 1). 각 토큰에 스칼라 중요도 점수 할당' },
                  { label: 'P_rho', desc: 'rho-th 백분위수 threshold. 기본 rho=70% (상위 70% 토큰 선택)' },
                  { label: 'alpha^(t)', desc: 'step별 스케일링 하이퍼파라미터' },
                  { label: '비선택 토큰', desc: '이전 표현 Y^(t-1)을 그대로 유지 (연산 비용 0)' },
                ].map(({ label, desc }) => (
                  <div key={label} className="flex gap-2 text-xs">
                    <span className="shrink-0 font-mono font-bold text-amber-600 dark:text-amber-400">{label}</span>
                    <span className="text-gray-600 dark:text-gray-400">{desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <SubSectionHeading number="2.3" title="Residual Thinking Connection (RTC)" />
              <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                단순 루프와의 핵심 차이: 각 step의 결과를 <strong>누적 합산</strong>합니다. 이전 step의 기여가 보존됩니다:
              </p>
              <div className="mb-4 overflow-x-auto rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
                <EquationRenderer latex={String.raw`Y^{(t)} = Y^{(0)} \odot \phi^{(0)} + \sum_{i=1}^{t} \left( Y_i^{(i)\prime} \odot \phi^{(i)} \right)`} />
              </div>
              <div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20">
                <p className="text-xs font-bold text-green-700 dark:text-green-300">Loop vs RTC 차이</p>
                <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                  Loop: Y^(t) = f(Y^(t-1)) -- 이전 결과를 덮어씀, step 간 정보 손실 가능<br/>
                  RTC: Y^(t) = base + sum(step별 delta) -- 모든 step의 기여가 누적, elastic inference 가능
                </p>
              </div>
            </div>

            <div className="mt-5">
              <SubSectionHeading number="2.4" title="Thinking Step Encoding" />
              <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
                학습 가능한 벡터 phi^(t)가 각 step의 출력에 element-wise 곱으로 적용되어,
                모델이 초기 step과 후기 step의 역할을 구분할 수 있게 합니다:
              </p>
              <div className="mb-3 overflow-x-auto rounded-lg bg-purple-50 p-3 dark:bg-purple-900/20">
                <EquationRenderer latex={String.raw`\phi^{(t)} \in \mathbb{R}^d, \quad Y^{(t)\prime}_\text{scaled} = Y^{(t)\prime} \odot \phi^{(t)}`} />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                실험적으로 초기 step에 높은 가중치, 후기 step에서는 선택적으로 높은 가중치를 부여하는 패턴이 관찰됩니다.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Interactive Viz ───────────────────────────────────── */}
      <section id="itt-viz" className="scroll-mt-20">
        <SectionHeading icon={<Zap className="h-5 w-5" />} title="인터랙티브: 토큰별 동적 깊이 시각화" collapsed={!!col['itt-viz']} onToggle={() => toggle('itt-viz')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['itt-viz'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              아래 시각화는 각 thinking step에서 라우터가 어떤 토큰을 선택하는지 보여줍니다.
              step 버튼을 클릭하여 스텝별 라우팅 패턴을 비교해 보세요.
            </p>
            <DepthViz />
          </Card>
        </div>
      </section>

      {/* ── Key Equations ────────────────────────────────────── */}
      <section id="itt-equations" className="scroll-mt-20">
        <SectionHeading icon={<Hash className="h-5 w-5" />} title="핵심 수식 모음" collapsed={!!col['itt-equations']} onToggle={() => toggle('itt-equations')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['itt-equations'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="space-y-3">
              <EqCard idx={1} name="Inner Thinking Step 정의" color="indigo"
                latex={String.raw`X^{(t)} = f^{(t)}(X^{(t-1)}), \quad t = 1, 2, \ldots, T`}
                description="각 레이어 내에서 같은 함수 f를 T번 반복 적용합니다. 파라미터 공유 덕분에 T를 늘려도 모델 크기는 증가하지 않습니다. T가 클수록 더 깊은 사고가 가능하지만 연산량은 증가합니다." />

              <EqCard idx={2} name="Adaptive Token Routing (ATR)" color="amber"
                latex={String.raw`Y_i^{(t)\prime} = \begin{cases} \alpha^{(t)}\, w_i^{(t)}\, f(Y_i^{(t-1)}) & w_i^{(t)} > P_\rho(w^{(t)}) \\ Y_i^{(t-1)} & \text{otherwise} \end{cases}`}
                description="라우터 R^(t)가 각 토큰의 중요도 w를 계산하고, rho 백분위수를 넘는 토큰만 추가 forward pass를 수행합니다. 나머지 토큰은 이전 표현을 유지하여 연산을 절약합니다. 이것이 ITT가 Loop보다 FLOPs 효율이 높은 핵심 이유입니다." />

              <EqCard idx={3} name="Residual Thinking Connection (RTC)" color="green"
                latex={String.raw`Y^{(t)} = Y^{(0)} \odot \phi^{(0)} + \sum_{i=1}^{t} \left( Y_i^{(i)\prime} \odot \phi^{(i)} \right)`}
                description="각 thinking step의 출력을 누적 합산합니다. phi^(t)는 학습 가능한 step encoding으로, 각 step의 기여도를 조절합니다. 이 누적 구조 덕분에 inference 시 step을 자유롭게 추가/제거할 수 있습니다 (elastic thinking)." />

              <EqCard idx={4} name="Gradient 흐름 (이론적 분석)" color="purple"
                latex={String.raw`\frac{\partial \mathcal{L}}{\partial \theta} = \frac{\partial \mathcal{L}}{\partial Y^{(T)}} \cdot \prod_{j=1}^{T} \left[ I + \frac{\partial \Delta_j}{\partial Y^{(j)}} \right] \cdot \frac{\partial \Delta_k}{\partial \theta}`}
                description="RTC의 잔차 구조 덕분에 gradient가 identity 경로를 통해 안정적으로 전파됩니다. 각 step의 보정 Delta가 작으면 곱 항이 I에 가까워져 gradient vanishing이 억제됩니다. ResNet의 skip connection과 유사한 원리입니다." />

              <EqCard idx={5} name="학습 손실 함수" color="teal"
                latex={String.raw`\mathcal{L} = \mathcal{L}_{\text{CE}} = -\sum_{n=1}^{N} \log P(y_n \mid y_{<n}, x)`}
                description="표준 cross-entropy loss를 사용합니다. 라우터 가중치도 이 loss로 end-to-end 학습됩니다. 별도의 라우팅 보조 손실(auxiliary loss)은 사용하지 않습니다." />

              <EqCard idx={6} name="FLOPs 복잡도" color="indigo"
                latex={String.raw`\text{FLOPs}_{\text{extra}} = O\!\left(\frac{k \cdot T}{S}\right), \quad k = \lfloor \rho \cdot S \rfloor`}
                description="추가 FLOPs는 선택된 토큰 수 k, thinking step 수 T, 전체 시퀀스 길이 S에 비례합니다. rho=70%, T=3일 때 Loop 대비 약 70%의 FLOPs만 사용합니다." />
            </div>
          </Card>
        </div>
      </section>

      {/* ── Results ──────────────────────────────────────────── */}
      <section id="itt-results" className="scroll-mt-20">
        <SectionHeading icon={<BarChart2 className="h-5 w-5" />} title="실험 결과" collapsed={!!col['itt-results']} onToggle={() => toggle('itt-results')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['itt-results'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="5.1" title="11개 벤치마크 결과 (핵심 비교)" />
            <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">162M 스케일 / 50B 토큰 학습 / 평균 정확도 (높을수록 좋음)</p>
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-400">모델</th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-gray-400">FLOPs (E18)</th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-gray-400">SciQ</th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-gray-400">ARC-E</th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-gray-400">BoolQ</th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-gray-400">LAMBADA</th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-gray-400">Avg</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { m: 'LLaMA2-162M',   f: '1.88', s: '72.0', a: '41.7', b: '50.3', l: '28.6', avg: '40.4', hi: false },
                    { m: 'Loop x4-162M',   f: '4.70', s: '72.8', a: '41.8', b: '49.9', l: '30.1', avg: '40.7', hi: false },
                    { m: 'ITT x4-162M',    f: '3.29', s: '72.4', a: '43.4', b: '56.8', l: '33.9', avg: '42.1', hi: true  },
                    { m: 'LLaMA2-230M',    f: '2.87', s: '72.8', a: '44.0', b: '60.2', l: '31.7', avg: '41.8', hi: false },
                    { m: 'LLaMA2-466M',    f: '4.92', s: '75.5', a: '45.2', b: '62.6', l: '36.6', avg: '43.6', hi: false },
                  ].map((r, i) => (
                    <tr key={i} className={r.hi ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}>
                      <td className={`px-3 py-2 font-medium ${r.hi ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'}`}>{r.m}</td>
                      <td className="px-3 py-2 text-center font-mono text-gray-500 dark:text-gray-400">{r.f}</td>
                      {[r.s, r.a, r.b, r.l, r.avg].map((v, j) => (
                        <td key={j} className={`px-3 py-2 text-center font-mono font-semibold ${r.hi ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400'}`}>{v}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 dark:border-indigo-800 dark:bg-indigo-900/20">
                <p className="text-lg font-bold text-indigo-700 dark:text-indigo-300">96.5%</p>
                <p className="text-xs text-indigo-600 dark:text-indigo-400">162M으로 466M 성능 달성</p>
              </div>
              <div className="rounded-lg border border-purple-200 bg-purple-50 px-4 py-3 dark:border-purple-800 dark:bg-purple-900/20">
                <p className="text-lg font-bold text-purple-700 dark:text-purple-300">70%</p>
                <p className="text-xs text-purple-600 dark:text-purple-400">Loop x4 대비 FLOPs 절감</p>
              </div>
              <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 dark:border-green-800 dark:bg-green-900/20">
                <p className="text-lg font-bold text-green-700 dark:text-green-300">43.2%</p>
                <p className="text-xs text-green-600 dark:text-green-400">학습 데이터 절감 (동일 성능)</p>
              </div>
            </div>

            <div className="mt-5">
              <SubSectionHeading number="5.2" title="Ablation Study (ITT x4-162M)" />
              <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                <table className="w-full text-xs">
                  <thead><tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">설정</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">PPL</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">Delta</th>
                    <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">영향</th>
                  </tr></thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {[
                      { cfg: 'ITT x4 (Full)',                  ppl: '10.25', d: '--',    note: '기준', hi: true },
                      { cfg: 'w/o RTC (Residual Thinking)',     ppl: '11.02', d: '+0.77', note: '가장 큰 하락', hi: false },
                      { cfg: 'w/o Thinking Position Encoding',  ppl: '10.56', d: '+0.31', note: 'step 구분 불가', hi: false },
                      { cfg: 'w/o ATR (Token Routing)',         ppl: '10.44', d: '+0.19', note: 'FLOPs 43% 증가', hi: false },
                      { cfg: 'Router: Tanh (vs Sigmoid)',       ppl: '10.38', d: '+0.13', note: '음수값이 RTC 교란', hi: false },
                      { cfg: 'Reweighting: Symmetric',          ppl: '10.41', d: '+0.16', note: '불필요한 토큰도 가중', hi: false },
                      { cfg: 'LLaMA2-162M (baseline)',          ppl: '11.13', d: '+0.88', note: '참조', hi: false },
                    ].map((r, i) => (
                      <tr key={i} className={r.hi ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}>
                        <td className={`px-3 py-2 font-medium ${r.hi ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'}`}>{r.cfg}</td>
                        <td className={`px-3 py-2 text-center font-mono font-semibold ${r.hi ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400'}`}>{r.ppl}</td>
                        <td className="px-3 py-2 text-center font-mono text-gray-500 dark:text-gray-400">{r.d}</td>
                        <td className="px-3 py-2 text-gray-500 dark:text-gray-400">{r.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-5">
              <SubSectionHeading number="5.3" title="Elastic Thinking (추론 시 유연한 깊이 조절)" />
              <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
                학습 시 70% 라우팅으로 훈련한 모델을, 추론 시 다른 비율로 사용할 수 있습니다:
              </p>
              <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                <table className="w-full text-xs">
                  <thead><tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">Routing 비율 (step1, step2, step3)</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">FLOPs</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">PPL</th>
                  </tr></thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {[
                      { cfg: '90%, 90%, 90% (최대 성능)',  f: '4.42', p: '10.27' },
                      { cfg: '70%, 70%, 70% (학습 설정)',  f: '3.85', p: '10.52' },
                      { cfg: '50%, 50%, 50% (절약 모드)',  f: '3.29', p: '10.47' },
                      { cfg: '90%, 0%, 90% (step2 스킵)',  f: '3.57', p: '10.36' },
                      { cfg: '0%, 90%, 90% (step1 스킵)',  f: '3.57', p: '10.56' },
                    ].map((r, i) => (
                      <tr key={i} className={i === 0 ? 'bg-green-50 dark:bg-green-900/10' : i === 1 ? 'bg-indigo-50 dark:bg-indigo-900/10' : ''}>
                        <td className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">{r.cfg}</td>
                        <td className="px-3 py-2 text-center font-mono text-gray-500 dark:text-gray-400">{r.f}</td>
                        <td className="px-3 py-2 text-center font-mono font-semibold text-gray-600 dark:text-gray-400">{r.p}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20">
                <p className="text-xs text-green-700 dark:text-green-300">
                  <strong>핵심 관찰:</strong> 50% 모드에서도 PPL 10.47로, LLaMA2 baseline(11.13) 대비 -0.66 개선.
                  step을 완전히 스킵해도 성능 유지 가능 -- RTC의 누적 구조 덕분입니다.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Limitations ──────────────────────────────────────── */}
      <section id="itt-limits" className="scroll-mt-20">
        <SectionHeading icon={<AlertTriangle className="h-5 w-5" />} title="한계 및 향후 방향" collapsed={!!col['itt-limits']} onToggle={() => toggle('itt-limits')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['itt-limits'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-3 text-sm font-bold text-red-700 dark:text-red-300">한계</p>
                <div className="space-y-2">
                  {[
                    { t: '소규모 모델만 검증', d: '최대 466M 파라미터. 7B+ 대규모 모델에서의 효과는 미확인.' },
                    { t: '추론 지연 증가', d: 'thinking step만큼 레이어를 반복하므로 wall-clock 추론 시간 증가. batch 처리 시 비균일 토큰 수로 인한 비효율.' },
                    { t: 'KV 캐시 중복', d: '같은 레이어를 T번 반복하면서 KV 캐시를 매번 재사용/갱신해야 하는 구현 복잡성.' },
                    { t: '고정된 T', d: 'thinking step 수 T가 하이퍼파라미터. 동적 T 결정은 미래 과제.' },
                  ].map(({ t, d }) => (
                    <div key={t} className="rounded-lg border border-red-100 bg-red-50 p-3 dark:border-red-900/30 dark:bg-red-900/10">
                      <p className="text-xs font-bold text-red-700 dark:text-red-300">{t}</p>
                      <p className="mt-0.5 text-xs text-red-600 dark:text-red-400">{d}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-3 text-sm font-bold text-green-700 dark:text-green-300">향후 가능성</p>
                <div className="space-y-2">
                  {[
                    { t: '대규모 모델 적용', d: '7B/13B 모델에서 ITT 적용 시 gradient spike 문제 해결 효과 기대.' },
                    { t: 'MoE와의 결합', d: 'Mixture of Experts의 expert 선택 + ITT의 depth 선택을 통합하면 width+depth 동시 적응 가능.' },
                    { t: 'Token-Adaptive T', d: '토큰별로 T를 동적으로 결정하는 learned halting mechanism (Universal Transformer 영감).' },
                    { t: 'Speculative Decoding 호환', d: 'Elastic thinking을 활용한 draft model 가속 가능성.' },
                  ].map(({ t, d }) => (
                    <div key={t} className="rounded-lg border border-green-100 bg-green-50 p-3 dark:border-green-900/30 dark:bg-green-900/10">
                      <p className="text-xs font-bold text-green-700 dark:text-green-300">{t}</p>
                      <p className="mt-0.5 text-xs text-green-600 dark:text-green-400">{d}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Summary Cards ────────────────────────────────────── */}
      <section id="itt-summary" className="scroll-mt-20">
        <SectionHeading icon={<GraduationCap className="h-5 w-5" />} title="한줄 요약 카드" collapsed={!!col['itt-summary']} onToggle={() => toggle('itt-summary')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['itt-summary'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              { title: '문제', text: '어려운 토큰에서 gradient spike 발생 -- 고정 깊이 아키텍처의 한계', color: 'red' },
              { title: '핵심 아이디어', text: '레이어를 "사고 단계"로 재해석. 토큰별로 사고 깊이를 동적 조절', color: 'indigo' },
              { title: '세 가지 메커니즘', text: 'ATR(토큰 선택) + RTC(결과 누적) + TSE(step 구분)', color: 'purple' },
              { title: '핵심 결과', text: '162M 모델이 466M의 96.5% 성능. Loop 대비 FLOPs 30% 절감', color: 'green' },
              { title: '독창성', text: 'Loop(전체 반복)도 Early Exit(레이어 수준)도 아닌, 토큰 수준 동적 깊이', color: 'amber' },
              { title: '실용성', text: 'Elastic thinking으로 추론 시 연산량 자유 조절 가능', color: 'teal' },
            ].map(({ title, text, color }) => (
              <Card key={title}>
                <p className={`text-sm font-bold text-${color}-700 dark:text-${color}-300`}>{title}</p>
                <p className="mt-1 text-xs leading-relaxed text-gray-600 dark:text-gray-400">{text}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Quiz ─────────────────────────────────────────────── */}
      <section id="itt-quiz" className="scroll-mt-20">
        <SectionHeading icon={<HelpCircle className="h-5 w-5" />} title="자기 점검 퀴즈" collapsed={!!col['itt-quiz']} onToggle={() => toggle('itt-quiz')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['itt-quiz'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              논문의 핵심 내용을 이해했는지 확인해 보세요. 각 문항을 클릭한 후 &quot;정답 확인&quot;을 누르세요.
            </p>
            <Quiz />
          </Card>
        </div>
      </section>

    </div>
    </GlossaryText>
  );
}
