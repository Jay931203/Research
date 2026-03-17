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
  Zap,
  HelpCircle,
} from 'lucide-react';
import katex from 'katex';

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

function Caption({ children }: { children: React.ReactNode }) {
  return <p className="mt-2 text-center text-xs italic text-gray-500 dark:text-gray-400">{children}</p>;
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
  };
  const badgeMap: Record<string, string> = {
    indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    amber:  'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    green:  'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
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

/* ── Notation Table ──────────────────────────────────────────── */

function NotationTable() {
  const rows = [
    { sym: 'L', desc: '전체 레이어 수 (예: 9, 12, 24)' },
    { sym: 'N_r', desc: '재귀(recursion) 반복 횟수. 같은 가중치 블록을 N_r번 반복 적용' },
    { sym: "\\Phi'", desc: '공유 파라미터 블록 (재귀에서 반복 사용되는 레이어 가중치)' },
    { sym: '\\mathcal{H}_t^r', desc: '토큰 t의 재귀 단계 r에서의 은닉 상태 (hidden state)' },
    { sym: 'g_t^r', desc: '토큰 t의 재귀 단계 r에서의 라우팅 점수 (0~1)' },
    { sym: 'P_\\beta(G^r)', desc: '단계 r에서 전체 점수의 beta-백분위 임계값' },
    { sym: '\\mathcal{G}', desc: '활성화 함수 (sigmoid 또는 tanh)' },
    { sym: '\\theta_r', desc: '단계 r의 라우터 파라미터 (학습 가능)' },
    { sym: 'k', desc: '선택된 토큰 수 (top-k)' },
    { sym: 'N_{\\text{ctx}}', desc: '컨텍스트 길이 (시퀀스 길이)' },
  ];
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-indigo-50 dark:bg-indigo-900/20">
            <th className="px-4 py-2 text-left font-bold text-indigo-700 dark:text-indigo-300">기호</th>
            <th className="px-4 py-2 text-left font-bold text-indigo-700 dark:text-indigo-300">의미</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {rows.map(({ sym, desc }) => {
            const html = katex.renderToString(sym, { throwOnError: false, displayMode: false });
            return (
              <tr key={sym} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-4 py-2 font-mono text-indigo-600 dark:text-indigo-400 whitespace-nowrap" dangerouslySetInnerHTML={{ __html: html }} />
                <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{desc}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ── Interactive Token Depth Visualization ───────────────────── */

function TokenDepthViz() {
  const [capacity, setCapacity] = useState(50);

  const tokens = useMemo(() => {
    const words = ['The', 'quantum', 'computer', 'solved', 'the', 'complex', 'optimization', 'problem', 'in', 'seconds', '.', 'This', 'represents', 'a', 'breakthrough', '.'];
    const baseDepths = [1, 3, 3, 2, 1, 3, 4, 2, 1, 2, 1, 1, 2, 1, 4, 1];
    const maxActive = Math.max(1, Math.round((capacity / 100) * 4));
    return words.map((w, i) => ({
      word: w,
      depth: Math.min(baseDepths[i], maxActive),
      maxDepth: baseDepths[i],
    }));
  }, [capacity]);

  const depthColors = ['bg-gray-200 dark:bg-gray-700', 'bg-blue-300 dark:bg-blue-700', 'bg-indigo-400 dark:bg-indigo-600', 'bg-purple-500 dark:bg-purple-500'];
  const depthTextColors = ['text-gray-600 dark:text-gray-300', 'text-blue-800 dark:text-blue-100', 'text-white', 'text-white'];

  const avgDepth = (tokens.reduce((s, t) => s + t.depth, 0) / tokens.length).toFixed(1);
  const totalFlops = tokens.reduce((s, t) => s + t.depth, 0);
  const maxFlops = tokens.length * 4;
  const savings = ((1 - totalFlops / maxFlops) * 100).toFixed(0);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap">연산 예산:</label>
        <input type="range" min={15} max={100} value={capacity} onChange={e => setCapacity(Number(e.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-indigo-600 dark:bg-gray-700" />
        <span className="min-w-[3rem] text-right text-xs font-bold text-indigo-700 dark:text-indigo-300">{capacity}%</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {tokens.map((t, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className="flex flex-col-reverse gap-0.5">
              {Array.from({ length: 4 }, (_, d) => (
                <div key={d} className={`h-4 w-12 rounded-sm transition-all duration-300 ${d < t.depth ? depthColors[d] : 'bg-gray-100 dark:bg-gray-800 opacity-30'}`} />
              ))}
            </div>
            <span className={`text-[10px] font-medium px-1 py-0.5 rounded ${depthColors[t.depth - 1]} ${depthTextColors[t.depth - 1]} transition-all duration-300`}>
              {t.word}
            </span>
            <span className="text-[9px] text-gray-400 dark:text-gray-500">d={t.depth}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <div className="flex-1 rounded-lg border border-indigo-200 bg-indigo-50 p-2 text-center dark:border-indigo-800 dark:bg-indigo-900/20">
          <p className="text-[10px] text-indigo-600 dark:text-indigo-400">평균 재귀 깊이</p>
          <p className="text-lg font-bold text-indigo-700 dark:text-indigo-300">{avgDepth}</p>
        </div>
        <div className="flex-1 rounded-lg border border-green-200 bg-green-50 p-2 text-center dark:border-green-800 dark:bg-green-900/20">
          <p className="text-[10px] text-green-600 dark:text-green-400">FLOPs 절감</p>
          <p className="text-lg font-bold text-green-700 dark:text-green-300">{savings}%</p>
        </div>
        <div className="flex-1 rounded-lg border border-purple-200 bg-purple-50 p-2 text-center dark:border-purple-800 dark:bg-purple-900/20">
          <p className="text-[10px] text-purple-600 dark:text-purple-400">활성 연산</p>
          <p className="text-lg font-bold text-purple-700 dark:text-purple-300">{totalFlops}/{maxFlops}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[10px] text-gray-500 dark:text-gray-400">
        <span className="font-semibold">깊이 범례:</span>
        {['1 (최소)', '2', '3', '4 (최대)'].map((label, i) => (
          <span key={i} className="flex items-center gap-1">
            <span className={`inline-block h-3 w-3 rounded-sm ${depthColors[i]}`} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Quiz Component ──────────────────────────────────────────── */

function QuizSection() {
  const questions = [
    {
      q: 'MoR에서 "재귀(recursion)"란 무엇을 의미하는가?',
      options: [
        '함수가 자기 자신을 호출하는 프로그래밍 패턴',
        '동일한 가중치 블록을 여러 번 반복 적용하는 것',
        '레이어 수를 2배로 늘리는 것',
        '역전파를 여러 번 수행하는 것',
      ],
      answer: 1,
      explanation: 'Recursive Transformer에서의 재귀는 동일한 공유 파라미터 블록을 N_r번 반복 적용하는 것을 의미합니다. 이를 통해 파라미터 수는 줄이면서 효과적인 깊이를 늘릴 수 있습니다.',
    },
    {
      q: 'Expert-Choice 라우팅과 Token-Choice 라우팅의 핵심 차이는?',
      options: [
        'Expert-Choice는 각 재귀 단계가 처리할 토큰을 선택하고, Token-Choice는 각 토큰이 자신의 재귀 깊이를 결정한다',
        'Expert-Choice는 더 느리고 Token-Choice는 더 빠르다',
        'Expert-Choice는 학습이 불가능하고 Token-Choice만 학습 가능하다',
        '둘 다 동일하며 이름만 다르다',
      ],
      answer: 0,
      explanation: 'Expert-Choice에서는 각 재귀 단계(expert)가 점수 기반으로 상위 k개 토큰을 선택합니다. Token-Choice에서는 각 토큰이 단일 라우팅 결정으로 자신의 전체 연산 경로를 결정합니다.',
    },
    {
      q: 'MoR이 기존 Early-Exit 방법 대비 가지는 핵심 장점은?',
      options: [
        '더 큰 모델을 사용한다',
        '라우터를 처음부터 end-to-end로 학습하여 별도의 post-hoc 단계가 불필요하다',
        '더 많은 GPU 메모리를 사용한다',
        'Attention 메커니즘을 사용하지 않는다',
      ],
      answer: 1,
      explanation: 'Early-Exit 방법들은 보통 모델을 먼저 학습한 뒤 별도의 라우터 학습 단계를 거칩니다. MoR은 라우터를 처음부터 모델과 함께 end-to-end로 학습하므로 성능 저하 없이 적응적 연산이 가능합니다.',
    },
    {
      q: 'MoR의 KV 캐싱 전략 중 "Recursion-wise Caching"의 특징은?',
      options: [
        '모든 토큰의 KV를 모든 재귀 단계에서 저장한다',
        '첫 번째 재귀 단계의 KV만 저장하고 이후 재사용한다',
        '각 재귀 단계에서 활성화된 토큰의 KV만 저장한다',
        'KV 캐시를 전혀 사용하지 않는다',
      ],
      answer: 2,
      explanation: 'Recursion-wise Caching은 각 재귀 단계에서 라우터가 선택한 활성 토큰의 KV 쌍만 저장합니다. 이를 통해 메모리 사용량을 (N_r+1)/(2*N_r)로 줄일 수 있습니다.',
    },
    {
      q: 'MoR에서 의미적으로 복잡한 토큰(content words)은 어떻게 처리되는가?',
      options: [
        '모든 토큰과 동일한 깊이로 처리된다',
        '더 얕은 재귀 깊이를 할당받는다',
        '더 깊은 재귀 깊이를 할당받아 더 많은 연산을 사용한다',
        '처리에서 제외된다',
      ],
      answer: 2,
      explanation: '실험 분석에서 "quantum", "optimization", "breakthrough" 같은 의미가 풍부한 토큰은 더 깊은 재귀를 할당받고, "the", "a", "." 같은 기능어는 얕은 재귀만 할당받는 것이 관찰되었습니다.',
    },
  ];

  const [selected, setSelected] = useState<Record<number, number>>({});
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});

  return (
    <div className="space-y-4">
      {questions.map((q, qi) => (
        <div key={qi} className="rounded-lg border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="mb-3 text-sm font-semibold text-gray-800 dark:text-gray-200">
            <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">{qi + 1}</span>
            {q.q}
          </p>
          <div className="mb-2 space-y-1.5">
            {q.options.map((opt, oi) => {
              const isSelected = selected[qi] === oi;
              const isCorrect = oi === q.answer;
              const isRevealed = revealed[qi];
              let cls = 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700';
              if (isRevealed && isCorrect) cls = 'border-green-400 bg-green-50 dark:border-green-600 dark:bg-green-900/20';
              else if (isRevealed && isSelected && !isCorrect) cls = 'border-red-400 bg-red-50 dark:border-red-600 dark:bg-red-900/20';
              else if (isSelected) cls = 'border-indigo-400 bg-indigo-50 dark:border-indigo-600 dark:bg-indigo-900/20';
              return (
                <button key={oi} onClick={() => { if (!isRevealed) setSelected(s => ({ ...s, [qi]: oi })); }}
                  className={`flex w-full items-center gap-2 rounded-lg border p-2.5 text-left text-xs transition ${cls}`}>
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gray-200 text-[10px] font-bold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                    {String.fromCharCode(65 + oi)}
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">{opt}</span>
                </button>
              );
            })}
          </div>
          {selected[qi] !== undefined && !revealed[qi] && (
            <button onClick={() => setRevealed(r => ({ ...r, [qi]: true }))}
              className="mt-2 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700">
              정답 확인
            </button>
          )}
          {revealed[qi] && (
            <div className={`mt-2 rounded-lg border px-3 py-2 text-xs leading-relaxed ${selected[qi] === q.answer ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300' : 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300'}`}>
              {selected[qi] === q.answer ? '정답입니다! ' : '오답입니다. '}{q.explanation}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Main Component ──────────────────────────────────────────── */

export default function MixtureRecursionsStudyFull() {
  const [col, setCol] = useState<Record<string, boolean>>({});
  const toggle = useCallback((id: string) => setCol(c => ({ ...c, [id]: !c[id] })), []);

  return (
    <div className="space-y-6">

      {/* ── Overview ─────────────────────────────────────────── */}
      <section id="mor-overview" className="scroll-mt-20">
        <div className="overflow-hidden rounded-xl shadow-sm">
          <div className="bg-gradient-to-br from-purple-700 via-indigo-700 to-blue-700 p-6 pb-8">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">NeurIPS 2025</span>
              <span className="rounded-full bg-yellow-400/90 px-3 py-1 text-xs font-bold text-yellow-900">토큰별 적응적 재귀 깊이</span>
            </div>
            <h2 className="text-xl font-bold leading-snug text-white sm:text-2xl">
              Mixture-of-Recursions: 적응적 토큰 수준 연산을 위한 동적 재귀 깊이 학습
            </h2>
            <p className="mt-3 text-sm text-indigo-200">
              Bae et al. (KAIST AI / Mila / Google DeepMind) &middot; arXiv 2507.10524
            </p>
          </div>
          <div className="bg-white p-6 dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
            <p className="leading-relaxed text-gray-700 dark:text-gray-300">
              Recursive Transformer(같은 레이어를 반복 적용)에 <span className="font-semibold text-indigo-700 dark:text-indigo-300">경량 라우터</span>를 추가하여,
              각 토큰이 <em>서로 다른 재귀 깊이</em>를 동적으로 할당받는 프레임워크입니다.
              &ldquo;the&rdquo;, &ldquo;a&rdquo; 같은 기능어는 얕게, &ldquo;quantum&rdquo;, &ldquo;optimization&rdquo; 같은 의미 단어는 깊게 처리하여
              불필요한 연산을 제거합니다.
            </p>
            <p className="mt-3 leading-relaxed text-gray-700 dark:text-gray-300">
              세 가지 효율성 축을 통합합니다: <strong>(i)</strong> 파라미터 공유로 모델 크기 축소,
              <strong>(ii)</strong> 토큰별 라우팅으로 FLOPs 절감,
              <strong>(iii)</strong> 재귀 단위 KV 캐싱으로 메모리 절감.
              결과적으로 동일 정확도에서 최대 <span className="font-bold text-green-700 dark:text-green-300">2.18배 추론 처리량</span> 향상을 달성합니다.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {['Recursive Transformer', '토큰별 적응적 연산', 'Expert/Token-Choice 라우팅', 'KV 캐시 최적화', 'Pareto 최적'].map(tag => (
                <span key={tag} className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Core Idea ────────────────────────────────────────── */}
      <section id="mor-core" className="scroll-mt-20">
        <SectionHeading icon={<BrainCircuit className="h-5 w-5" />} title="핵심 아이디어: 왜 토큰마다 다른 재귀 깊이가 필요한가?" collapsed={!!col['mor-core']} onToggle={() => toggle('mor-core')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['mor-core'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="1.1" title="Recursive Transformer의 기본 원리" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              일반 Transformer는 L개의 서로 다른 레이어를 순차 적용합니다.
              Recursive Transformer는 소수의 레이어 블록을 N_r번 반복 적용하여 <strong>파라미터를 공유</strong>합니다.
              이를 통해 모델 크기를 1/N_r로 줄이면서도 효과적인 깊이는 유지할 수 있습니다.
            </p>
            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                <p className="mb-1 text-xs font-bold text-gray-700 dark:text-gray-300">일반 Transformer</p>
                <div className="overflow-x-auto"><EquationRenderer latex={String.raw`\mathbf{h}_t^{\ell+1} = f(\mathbf{h}_t^{\ell};\, \Phi_\ell) \quad \text{(각 레이어 고유 가중치)}`} /></div>
              </div>
              <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-800 dark:bg-indigo-900/20">
                <p className="mb-1 text-xs font-bold text-indigo-700 dark:text-indigo-300">Recursive Transformer</p>
                <div className="overflow-x-auto"><EquationRenderer latex={String.raw`\mathbf{h}_t^{r+1} = f(\mathbf{h}_t^{r};\, \Phi') \quad \text{(공유 가중치 반복)}`} /></div>
              </div>
            </div>

            <SubSectionHeading number="1.2" title="문제점: 모든 토큰에 동일한 연산량" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              기존 Recursive Transformer(Universal Transformer 포함)는 <span className="font-semibold text-red-600 dark:text-red-400">모든 토큰에 동일한 N_r번의 재귀를 적용</span>합니다.
              하지만 실제로 토큰의 처리 난이도는 크게 다릅니다:
            </p>
            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20">
                <p className="mb-1 text-xs font-bold text-green-700 dark:text-green-300">쉬운 토큰 (깊이 1)</p>
                <p className="text-xs text-green-600 dark:text-green-400">&ldquo;the&rdquo;, &ldquo;a&rdquo;, &ldquo;.&rdquo;, &ldquo;and&rdquo;</p>
                <p className="mt-1 text-[10px] text-green-500 dark:text-green-500">기능어, 구두점 - 한 번이면 충분</p>
              </div>
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
                <p className="mb-1 text-xs font-bold text-blue-700 dark:text-blue-300">보통 토큰 (깊이 2-3)</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">&ldquo;solved&rdquo;, &ldquo;seconds&rdquo;, &ldquo;represents&rdquo;</p>
                <p className="mt-1 text-[10px] text-blue-500 dark:text-blue-500">일반 내용어 - 중간 수준 연산</p>
              </div>
              <div className="rounded-lg border border-purple-200 bg-purple-50 p-3 dark:border-purple-800 dark:bg-purple-900/20">
                <p className="mb-1 text-xs font-bold text-purple-700 dark:text-purple-300">어려운 토큰 (깊이 4)</p>
                <p className="text-xs text-purple-600 dark:text-purple-400">&ldquo;quantum&rdquo;, &ldquo;optimization&rdquo;, &ldquo;breakthrough&rdquo;</p>
                <p className="mt-1 text-[10px] text-purple-500 dark:text-purple-500">전문 용어, 핵심 개념 - 최대 연산 필요</p>
              </div>
            </div>

            <SubSectionHeading number="1.3" title="MoR의 해법: 라우터 기반 동적 할당" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              MoR은 각 재귀 단계에 <strong>경량 라우터</strong>(학습 가능한 linear/MLP)를 배치합니다.
              라우터는 토큰의 은닉 상태를 보고 &ldquo;이 토큰이 추가 연산이 필요한가?&rdquo;를 판단합니다.
              필요 없는 토큰은 해당 단계를 건너뛰고(skip), 은닉 상태를 그대로 유지합니다.
            </p>
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-900/20">
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">MoE(Mixture-of-Experts)와의 관계</p>
              <p className="mt-1 text-xs leading-relaxed text-amber-600 dark:text-amber-400">
                MoE는 &ldquo;어떤 전문가에게 보낼 것인가?&rdquo;(폭 방향 선택). MoR은 &ldquo;몇 번 더 처리할 것인가?&rdquo;(깊이 방향 선택).
                MoR의 각 재귀 단계를 하나의 &ldquo;깊이 전문가(depth expert)&rdquo;로 볼 수 있으며,
                라우팅 메커니즘도 Expert-Choice / Token-Choice로 MoE와 동일한 패러다임을 따릅니다.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Key Equations ─────────────────────────────────────── */}
      <section id="mor-equations" className="scroll-mt-20">
        <SectionHeading icon={<Hash className="h-5 w-5" />} title="핵심 수식" collapsed={!!col['mor-equations']} onToggle={() => toggle('mor-equations')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['mor-equations'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="mb-4"><NotationTable /></div>
            <div className="space-y-3">
              <EqCard idx={1} name="Expert-Choice 라우팅 (은닉 상태 업데이트)" color="indigo"
                latex={String.raw`\mathcal{H}_t^{r+1} = \begin{cases} g_t^r \cdot f(\mathcal{H}_t^r,\, \Phi') + \mathcal{H}_t^r & \text{if } g_t^r > P_\beta(G^r) \\ \mathcal{H}_t^r & \text{otherwise} \end{cases}`}
                description="각 재귀 단계 r에서 라우터 점수 g_t^r이 beta-백분위 임계값보다 높은 토큰만 추가 연산을 수행합니다. 선택되지 않은 토큰은 이전 은닉 상태를 그대로 유지합니다. g_t^r은 출력에 곱해져 부드러운 가중치 역할도 합니다." />

              <EqCard idx={2} name="라우터 점수 계산" color="purple"
                latex={String.raw`g_t^r = \mathcal{G}(\theta_r^\top \mathcal{H}_t^r), \quad \mathcal{G} \in \{\sigma,\, \tanh\}`}
                description="라우터는 학습 가능한 파라미터 theta_r과 현재 은닉 상태의 내적 후 활성화 함수를 적용합니다. Sigmoid가 Expert-Choice에서 최적 성능을 보였고, auxiliary loss와 결합 시 선택/비선택 토큰이 1.0/0.0 근처로 깨끗하게 분리됩니다." />

              <EqCard idx={3} name="Token-Choice 라우팅" color="amber"
                latex={String.raw`\mathcal{H}_t^{r+1} = \begin{cases} g_t^r \cdot f(\mathcal{H}_t^r,\, \Phi') + \mathcal{H}_t^1 & \text{if } r = i \\ g_t^r \cdot f(\mathcal{H}_t^r,\, \Phi') & \text{otherwise} \end{cases}`}
                description="Token-Choice에서는 첫 번째 재귀 단계에서 단일 라우팅 결정(i = argmax_j g_t^j)으로 해당 토큰의 최종 재귀 깊이를 결정합니다. r = i인 단계에서는 초기 은닉 상태를 더하는 residual connection이 추가됩니다." />

              <EqCard idx={4} name="계층적 토큰 용량 (Expert-Choice)" color="green"
                latex={String.raw`\text{Capacity}(r) = \frac{N_r - r + 1}{N_r} \cdot N_{\text{ctx}}, \quad r = 1, \ldots, N_r`}
                description="N_r=3인 경우: 1단계 3/3, 2단계 2/3, 3단계 1/3의 토큰이 처리됩니다. 깊은 단계일수록 더 적은 토큰만 선택되므로, 피라미드 형태의 연산 할당이 자연스럽게 형성됩니다." />

              <EqCard idx={5} name="KV 메모리 절감 (Recursion-wise)" color="purple"
                latex={String.raw`\text{KV Memory} = \frac{N_r + 1}{2 N_r} \quad \text{(상대적, vanilla = 1)}`}
                description="각 재귀 단계에서 활성 토큰의 KV만 저장합니다. N_r=3이면 (3+1)/(2x3) = 2/3, 즉 33% KV 메모리 절감. N_r=4이면 5/8 = 62.5%만 사용합니다." />

              <EqCard idx={6} name="KV 메모리 절감 (Recursive Sharing)" color="green"
                latex={String.raw`\text{KV Memory} = \frac{1}{N_r}, \quad \text{KV Cache IO} = 1`}
                description="첫 번째 재귀에서만 전체 KV를 저장하고 이후 재귀에서 재사용합니다. N_r=3이면 KV 메모리가 1/3로 감소하지만, 모든 단계에서 전체 시퀀스에 대해 attention을 수행하므로 Cache IO는 줄지 않습니다." />
            </div>
          </Card>
        </div>
      </section>

      {/* ── Architecture ──────────────────────────────────────── */}
      <section id="mor-arch" className="scroll-mt-20">
        <SectionHeading icon={<Layers className="h-5 w-5" />} title="아키텍처: 라우팅 메커니즘 상세" collapsed={!!col['mor-arch']} onToggle={() => toggle('mor-arch')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['mor-arch'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="3.1" title="파라미터 공유 전략" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              L=9 레이어, N_r=3 재귀일 때 네 가지 공유 전략을 비교합니다:
            </p>
            <div className="mb-4 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead><tr className="bg-gray-50 dark:bg-gray-800">
                  <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">전략</th>
                  <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">레이어 배치 (L=9, N_r=3)</th>
                  <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">특징</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { s: 'Cycle', l: '(0,1,2), (0,1,2), (0,1,2)', d: '교차 반복' },
                    { s: 'Sequence', l: '(0,0,0), (1,1,1), (2,2,2)', d: '연속 반복' },
                    { s: 'Middle-Cycle', l: '(U), (0,1,0,1,0,1,0), (U)', d: '첫/끝 고유 + 중간 교차 반복' },
                    { s: 'Middle-Sequence', l: '(U), (0,0,0,1,1,1,2,2,2), (U)', d: '첫/끝 고유 + 중간 연속 반복' },
                  ].map((r, i) => (
                    <tr key={i} className={i === 2 ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}>
                      <td className={`px-3 py-2 font-medium ${i === 2 ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'}`}>{r.s}</td>
                      <td className="px-3 py-2 font-mono text-gray-600 dark:text-gray-400">{r.l}</td>
                      <td className="px-3 py-2 text-gray-500 dark:text-gray-400">{r.d}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mb-5 text-sm text-gray-600 dark:text-gray-400">
              <strong>Middle-Cycle</strong>이 모든 실험에서 최저 검증 손실을 달성했습니다. 첫/끝 레이어를 고유하게 유지하면 입력 임베딩 처리와 출력 예측에 특화된 표현을 학습할 수 있기 때문입니다.
            </p>

            <SubSectionHeading number="3.2" title="Expert-Choice vs Token-Choice 라우팅" />
            <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-800 dark:bg-indigo-900/20">
                <p className="mb-2 text-xs font-bold text-indigo-700 dark:text-indigo-300">Expert-Choice (권장)</p>
                <div className="space-y-1.5 text-xs text-indigo-600 dark:text-indigo-400">
                  <p>1. 각 재귀 단계(expert)가 top-k 토큰을 선택</p>
                  <p>2. 계층적 필터링: r단계에서 선택된 토큰만 r+1에서 재평가</p>
                  <p>3. Sigmoid 활성화 + Auxiliary Loss가 최적</p>
                  <p>4. 학습-추론 행동 정렬 (NLL: 2.8667)</p>
                </div>
                <div className="mt-2 rounded bg-indigo-100 px-2 py-1 dark:bg-indigo-900/40">
                  <p className="text-[10px] text-indigo-700 dark:text-indigo-300">
                    <strong>주의:</strong> 학습 시 인과성 위반 가능 (미래 토큰 정보 사용). Auxiliary loss로 해결.
                  </p>
                </div>
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
                <p className="mb-2 text-xs font-bold text-amber-700 dark:text-amber-300">Token-Choice</p>
                <div className="space-y-1.5 text-xs text-amber-600 dark:text-amber-400">
                  <p>1. 각 토큰이 자신의 재귀 깊이를 결정</p>
                  <p>2. 첫 단계에서 단일 결정 (argmax)</p>
                  <p>3. Softmax 활성화 + Balancing Loss가 최적</p>
                  <p>4. 부하 불균형 문제 가능 (NLL: 2.9118)</p>
                </div>
                <div className="mt-2 rounded bg-amber-100 px-2 py-1 dark:bg-amber-900/40">
                  <p className="text-[10px] text-amber-700 dark:text-amber-300">
                    <strong>장점:</strong> 미래 토큰 정보 불필요. 인과성 자동 보장.
                  </p>
                </div>
              </div>
            </div>

            <SubSectionHeading number="3.3" title="KV 캐싱 전략 비교" />
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead><tr className="bg-gray-50 dark:bg-gray-800">
                  <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">지표</th>
                  <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">Recursion-wise Caching</th>
                  <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">Recursive Sharing</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { m: 'KV 메모리', rw: '(N_r+1) / 2N_r', rs: '1 / N_r' },
                    { m: 'KV Cache IO', rw: '(N_r+1) / 2N_r', rs: '1 (전체)' },
                    { m: 'Attention FLOPs', rw: 'k^2 / N_ctx^2 (감소)', rs: 'k / N_ctx (감소)' },
                    { m: 'Expert-Choice 호환', rw: '최적', rs: '성능 저하' },
                    { m: 'Token-Choice 호환', rw: '보통', rs: '좋음 (약한 라우팅 보완)' },
                  ].map((r, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">{r.m}</td>
                      <td className="px-3 py-2 text-center font-mono text-indigo-600 dark:text-indigo-400">{r.rw}</td>
                      <td className="px-3 py-2 text-center font-mono text-purple-600 dark:text-purple-400">{r.rs}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-5">
              <SubSectionHeading number="3.4" title="전체 학습 파이프라인" />
              <div className="space-y-2">
                {[
                  { step: '1', text: 'Llama 스타일 아키텍처에 Middle-Cycle 파라미터 공유 적용' },
                  { step: '2', text: '각 재귀 단계에 경량 라우터(Linear/MLP) 배치' },
                  { step: '3', text: '라우터를 모델과 함께 end-to-end로 처음부터 학습 (별도 단계 없음)' },
                  { step: '4', text: 'Expert-Choice: Auxiliary Loss로 학습-추론 행동 정렬' },
                  { step: '5', text: 'FSDP 분산 학습: 재귀 모델은 N_r번 iter/gather (통신 효율적)' },
                ].map(({ step, text }) => (
                  <div key={step} className="flex gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">{step}</span>
                    <p className="text-xs text-gray-700 dark:text-gray-300">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Interactive Viz ────────────────────────────────────── */}
      <section id="mor-viz" className="scroll-mt-20">
        <SectionHeading icon={<Cpu className="h-5 w-5" />} title="인터랙티브 시각화: 토큰별 연산 할당" collapsed={!!col['mor-viz']} onToggle={() => toggle('mor-viz')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['mor-viz'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <p className="mb-4 text-sm text-gray-700 dark:text-gray-300">
              슬라이더를 조절하여 연산 예산에 따라 각 토큰이 받는 재귀 깊이가 어떻게 변하는지 확인하세요.
              의미가 풍부한 토큰(&ldquo;quantum&rdquo;, &ldquo;optimization&rdquo;)은 예산이 줄어도 깊은 재귀를 유지합니다.
            </p>
            <TokenDepthViz />
            <Caption>
              각 토큰 위의 블록 수가 재귀 깊이를 나타냅니다. 연산 예산을 줄이면 쉬운 토큰부터 깊이가 감소합니다.
            </Caption>
          </Card>
        </div>
      </section>

      {/* ── Results ───────────────────────────────────────────── */}
      <section id="mor-results" className="scroll-mt-20">
        <SectionHeading icon={<BarChart2 className="h-5 w-5" />} title="실험 결과" collapsed={!!col['mor-results']} onToggle={() => toggle('mor-results')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['mor-results'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="5.1" title="IsoFLOP 비교 (16.5e18 FLOPs)" />
            <p className="mb-3 text-sm font-semibold text-gray-600 dark:text-gray-400">FineWeb-Edu NLL (낮을수록 좋음) + 평균 Few-shot 정확도 (높을수록 좋음)</p>
            <div className="mb-4 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead><tr className="bg-gray-50 dark:bg-gray-800">
                  <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">모델</th>
                  <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">N_r</th>
                  <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">파라미터</th>
                  <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">학습 토큰</th>
                  <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">NLL</th>
                  <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">Few-shot</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { m: 'Vanilla', nr: '-', p: '315M', t: '20B', nll: '2.7824', fs: '42.3%', hi: false },
                    { m: 'Recursive', nr: '2', p: '167M', t: '20B', nll: '2.8079', fs: '42.6%', hi: false },
                    { m: 'Recursive', nr: '3', p: '118M', t: '20B', nll: '2.8466', fs: '41.5%', hi: false },
                    { m: 'MoR (Expert)', nr: '2', p: '167M', t: '27B', nll: '2.7511', fs: '43.1%', hi: true },
                    { m: 'MoR (Expert)', nr: '3', p: '118M', t: '30B', nll: '2.7925', fs: '42.6%', hi: true },
                    { m: 'MoR (Expert)', nr: '4', p: '98M', t: '30B', nll: '2.8204', fs: '41.6%', hi: true },
                    { m: 'MoR (Token)', nr: '3', p: '118M', t: '30B', nll: '2.9163', fs: '40.0%', hi: false },
                  ].map((r, i) => (
                    <tr key={i} className={r.hi ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}>
                      <td className={`px-3 py-2 font-medium ${r.hi ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'}`}>{r.m}</td>
                      <td className="px-3 py-2 text-center font-mono text-gray-500 dark:text-gray-400">{r.nr}</td>
                      <td className="px-3 py-2 text-center font-mono text-gray-500 dark:text-gray-400">{r.p}</td>
                      <td className="px-3 py-2 text-center font-mono text-gray-500 dark:text-gray-400">{r.t}</td>
                      <td className={`px-3 py-2 text-center font-mono font-semibold ${r.hi ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400'}`}>{r.nll}</td>
                      <td className={`px-3 py-2 text-center font-mono font-semibold ${r.hi ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400'}`}>{r.fs}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 dark:border-green-800 dark:bg-green-900/20">
                <p className="text-xs font-semibold text-green-700 dark:text-green-300">학습 FLOPs 절감</p>
                <p className="mt-1 text-lg font-bold text-green-700 dark:text-green-300">-25%</p>
                <p className="text-[10px] text-green-600 dark:text-green-400">동일 정확도 기준, 고정 토큰(20B) 설정</p>
              </div>
              <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-800 dark:bg-blue-900/20">
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">피크 메모리 절감</p>
                <p className="mt-1 text-lg font-bold text-blue-700 dark:text-blue-300">-25%</p>
                <p className="text-[10px] text-blue-600 dark:text-blue-400">KV 캐시 + 파라미터 공유 효과</p>
              </div>
              <div className="rounded-lg border border-purple-200 bg-purple-50 px-4 py-3 dark:border-purple-800 dark:bg-purple-900/20">
                <p className="text-xs font-semibold text-purple-700 dark:text-purple-300">추론 처리량</p>
                <p className="mt-1 text-lg font-bold text-purple-700 dark:text-purple-300">2.18x</p>
                <p className="text-[10px] text-purple-600 dark:text-purple-400">MoR-4, 최대 배치 크기 기준</p>
              </div>
            </div>

            <SubSectionHeading number="5.2" title="IsoFLOP 스케일링 관찰" />
            <div className="mb-4 space-y-2">
              {[
                { scale: '135M', obs: 'MoR이 Vanilla보다 약간 열세 (재귀 용량 병목)', color: 'amber' },
                { scale: '360M+', obs: 'MoR이 Vanilla를 일관되게 초과. 모델이 클수록 이점 증가', color: 'green' },
                { scale: '1.7B', obs: 'MoR이 새로운 Pareto 프론티어 형성. 적은 파라미터로 더 높은 정확도', color: 'indigo' },
              ].map(({ scale, obs, color }) => (
                <div key={scale} className={`rounded-lg border border-${color}-200 bg-${color}-50 p-3 dark:border-${color}-800 dark:bg-${color}-900/20`}>
                  <span className={`text-xs font-bold text-${color}-700 dark:text-${color}-300`}>{scale}:</span>
                  <span className={`ml-2 text-xs text-${color}-600 dark:text-${color}-400`}>{obs}</span>
                </div>
              ))}
            </div>

            <SubSectionHeading number="5.3" title="처리량(Throughput) 개선" />
            <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
              MoR은 <strong>연속 깊이별 배칭(continuous depth-wise batching)</strong>으로 추론 처리량을 극대화합니다.
              각 재귀 단계에서 활성 토큰 수가 줄어들면, 비활성 토큰의 연산 자원을 새 요청에 할당합니다.
            </p>
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead><tr className="bg-gray-50 dark:bg-gray-800">
                  <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">모델 (360M)</th>
                  <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">배칭 방식</th>
                  <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">최대 처리량 향상</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { m: 'Vanilla', b: 'Sequence-wise', s: '1.00x (기준)' },
                    { m: 'MoR (N_r=2)', b: 'Depth-wise', s: '~1.4x' },
                    { m: 'MoR (N_r=3)', b: 'Depth-wise', s: '~1.7x' },
                    { m: 'MoR (N_r=4)', b: 'Depth-wise', s: '2.06x' },
                  ].map((r, i) => (
                    <tr key={i} className={i === 3 ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}>
                      <td className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">{r.m}</td>
                      <td className="px-3 py-2 text-center text-gray-500 dark:text-gray-400">{r.b}</td>
                      <td className={`px-3 py-2 text-center font-mono font-semibold ${i === 3 ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400'}`}>{r.s}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Comparison ────────────────────────────────────────── */}
      <section id="mor-compare" className="scroll-mt-20">
        <SectionHeading icon={<Zap className="h-5 w-5" />} title="기존 방법 비교" collapsed={!!col['mor-compare']} onToggle={() => toggle('mor-compare')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['mor-compare'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="mb-4 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead><tr className="bg-gray-50 dark:bg-gray-800">
                  <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">방법</th>
                  <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">파라미터 공유</th>
                  <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">적응적 깊이</th>
                  <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">KV 최적화</th>
                  <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">End-to-End 학습</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { m: 'Universal Transformer', ps: 'O', ad: 'X (고정)', kv: 'X', e2e: 'O' },
                    { m: 'Adaptive Comp. Time', ps: 'O', ad: 'O (halting)', kv: 'X', e2e: 'O (ponder cost)' },
                    { m: 'Early-Exit Methods', ps: 'X', ad: 'O (post-hoc)', kv: 'X', e2e: 'X (2단계)' },
                    { m: 'MoD (Mixture-of-Depths)', ps: 'X', ad: 'O (레이어별)', kv: 'X', e2e: 'O' },
                    { m: 'DART', ps: 'O', ad: 'O', kv: '제한적', e2e: '제한적' },
                    { m: 'MoR (본 논문)', ps: 'O', ad: 'O (토큰별)', kv: 'O', e2e: 'O' },
                  ].map((r, i) => {
                    const isLast = i === 5;
                    return (
                      <tr key={i} className={isLast ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}>
                        <td className={`px-3 py-2 font-medium ${isLast ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'}`}>{r.m}</td>
                        {[r.ps, r.ad, r.kv, r.e2e].map((v, j) => (
                          <td key={j} className={`px-3 py-2 text-center ${v === 'O' ? 'text-green-600 dark:text-green-400 font-bold' : v.startsWith('X') ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>{v}</td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                <p className="mb-2 text-xs font-bold text-red-700 dark:text-red-300">Universal Transformer의 한계</p>
                <p className="text-xs text-red-600 dark:text-red-400">
                  파라미터 공유는 하지만, 모든 토큰에 동일한 N_r번 재귀를 적용합니다.
                  쉬운 토큰에도 불필요한 연산이 발생하며, KV 캐시 최적화가 없습니다.
                  MoR 대비 같은 FLOPs에서 일관되게 낮은 성능을 보입니다.
                </p>
              </div>
              <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-900/20">
                <p className="mb-2 text-xs font-bold text-orange-700 dark:text-orange-300">Adaptive Computation Time의 한계</p>
                <p className="text-xs text-orange-600 dark:text-orange-400">
                  Halting probability로 적응적 깊이를 구현하지만, ponder cost를 objective에 추가해야 하므로
                  학습이 불안정할 수 있습니다. 또한 모든 토큰이 시퀀셜하게 halting을 결정하므로
                  배칭 효율이 떨어지고, MoR의 top-k 기반 병렬 선택보다 추론이 느립니다.
                </p>
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
                <p className="mb-2 text-xs font-bold text-amber-700 dark:text-amber-300">Early-Exit의 한계</p>
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  모델을 먼저 학습한 뒤 별도의 exit classifier를 학습하는 2단계 과정이 필요합니다.
                  Post-hoc 라우터는 원래 모델의 표현 공간에 맞지 않아 성능이 저하됩니다.
                  MoR은 처음부터 end-to-end로 학습하여 이 문제를 근본적으로 해결합니다.
                </p>
              </div>
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                <p className="mb-2 text-xs font-bold text-blue-700 dark:text-blue-300">MoD (Mixture-of-Depths)의 한계</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  각 개별 레이어에서 토큰을 건너뛰지만, 레이어들이 서로 다른 가중치를 가집니다.
                  파라미터 공유가 없으므로 모델 크기 절감 효과가 없습니다.
                  MoR은 공유 가중치의 반복 적용 위에 라우팅을 결합하여 두 이점을 모두 취합니다.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Quiz ──────────────────────────────────────────────── */}
      <section id="mor-quiz" className="scroll-mt-20">
        <SectionHeading icon={<HelpCircle className="h-5 w-5" />} title="자기 점검 퀴즈" collapsed={!!col['mor-quiz']} onToggle={() => toggle('mor-quiz')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['mor-quiz'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              논문의 핵심 개념을 이해했는지 확인하세요. 각 문제에서 하나를 선택한 뒤 &ldquo;정답 확인&rdquo;을 클릭하세요.
            </p>
            <QuizSection />
          </Card>
        </div>
      </section>

      {/* ── Limitations & Future ──────────────────────────────── */}
      <section id="mor-future" className="scroll-mt-20">
        <SectionHeading icon={<GraduationCap className="h-5 w-5" />} title="한계 및 향후 연구" collapsed={!!col['mor-future']} onToggle={() => toggle('mor-future')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['mor-future'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-3 text-sm font-bold text-red-700 dark:text-red-300">현재 한계</p>
                <div className="space-y-2">
                  {[
                    { t: '소규모 모델 효과 제한', d: '135M 이하에서는 재귀 용량 병목으로 Vanilla보다 열세. 360M 이상에서 효과 발현.' },
                    { t: 'Expert-Choice 인과성 문제', d: '학습 시 미래 토큰 정보가 라우팅에 영향. Auxiliary loss로 완화하지만 근본적 해결은 아님.' },
                    { t: 'Token-Choice 성능 격차', d: 'Token-Choice는 Expert-Choice 대비 NLL 0.05+ 열세. 부하 불균형이 원인.' },
                    { t: '추론 시 커스텀 커널 필요', d: '깊이별 배칭은 표준 프레임워크에서 미지원. 최적 처리량을 위해 전용 구현 필요.' },
                  ].map(({ t, d }) => (
                    <div key={t} className="rounded-lg border border-red-100 bg-red-50 p-3 dark:border-red-900/30 dark:bg-red-900/10">
                      <p className="text-xs font-bold text-red-700 dark:text-red-300">{t}</p>
                      <p className="mt-0.5 text-xs text-red-600 dark:text-red-400">{d}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-3 text-sm font-bold text-green-700 dark:text-green-300">향후 연구 방향</p>
                <div className="space-y-2">
                  {[
                    { t: 'CoT 추론과의 결합', d: '라우터가 추론 복잡도에 맞춰 재귀 깊이를 동적 조절. Chain-of-Thought 대체 가능성.' },
                    { t: 'Test-Time Scaling', d: '추론 시 N_r를 동적으로 증가하여 정확도-지연 트레이드오프 제어. 실험에서 이미 유효성 확인.' },
                    { t: '더 큰 스케일 검증', d: '7B, 70B 이상에서의 효과. 스케일링 법칙이 유리한 방향으로 작용할 것으로 예상.' },
                    { t: 'MoE와의 결합', d: '폭 방향(MoE) + 깊이 방향(MoR) 동시 적응. 두 차원의 동적 연산 할당.' },
                  ].map(({ t, d }) => (
                    <div key={t} className="rounded-lg border border-green-100 bg-green-50 p-3 dark:border-green-900/30 dark:bg-green-900/10">
                      <p className="text-xs font-bold text-green-700 dark:text-green-300">{t}</p>
                      <p className="mt-0.5 text-xs text-green-600 dark:text-green-400">{d}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-900/20">
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">핵심 기여 요약</p>
              <p className="mt-1 text-xs leading-relaxed text-amber-600 dark:text-amber-400">
                MoR은 파라미터 공유, 적응적 연산, KV 캐시 최적화를 최초로 통합한 프레임워크입니다.
                Recursive Transformer 위에 경량 라우터를 추가하는 단순한 설계로,
                동일 FLOPs에서 Vanilla Transformer를 초과하는 성능과 최대 2.18배 추론 처리량을 달성합니다.
                특히 end-to-end 라우터 학습이 기존 post-hoc 방식 대비 근본적인 장점을 제공하며,
                test-time scaling 가능성은 향후 추론 최적화의 중요한 방향을 제시합니다.
              </p>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
