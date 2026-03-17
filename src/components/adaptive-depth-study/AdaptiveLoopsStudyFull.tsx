'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  BarChart2,
  BrainCircuit,
  ChevronDown,
  Cpu,
  Hash,
  Layers,
  AlertTriangle,
  HelpCircle,
  Repeat,
  Database,
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
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">{number}</span>
      <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">{title}</h4>
    </div>
  );
}

function Caption({ children }: { children: React.ReactNode }) {
  return <p className="mt-2 text-center text-xs italic text-gray-500 dark:text-gray-400">{children}</p>;
}

function EqCard({ idx, name, latex, description, color = 'violet' }: {
  idx: number; name: string; latex: string; description: string; color?: string;
}) {
  const [open, setOpen] = useState(false);
  const colorMap: Record<string, string> = {
    violet: 'bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800',
    blue:   'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    amber:  'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
    green:  'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    rose:   'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800',
  };
  const badgeMap: Record<string, string> = {
    violet: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
    blue:   'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    amber:  'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    green:  'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    rose:   'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  };
  return (
    <div className="cursor-pointer rounded-xl border border-gray-200 bg-gray-50/50 p-4 transition hover:border-violet-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-violet-700" onClick={() => setOpen(v => !v)}>
      <div className="mb-2 flex items-center gap-2">
        <span className={`rounded px-2 py-0.5 text-xs font-bold ${badgeMap[color] ?? badgeMap.violet}`}>Eq. {idx}</span>
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{name}</span>
        <ChevronDown className={`ml-auto h-4 w-4 text-gray-400 transition-transform dark:text-gray-500 ${open ? 'rotate-180' : ''}`} />
      </div>
      <div className="overflow-x-auto py-2 text-gray-900 dark:text-gray-100"><EquationRenderer latex={latex} /></div>
      {open ? (
        <div className={`mt-3 rounded-lg border px-4 py-3 ${colorMap[color] ?? colorMap.violet}`}>
          <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">{description}</p>
        </div>
      ) : (
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">클릭하여 상세 설명 보기</p>
      )}
    </div>
  );
}


/* ── Interactive: Think Harder vs Know More ───────────────────── */

function ThinkVsKnowSlider() {
  const [ratio, setRatio] = useState(50);
  const loopWeight = ratio;
  const memWeight = 100 - ratio;

  const mathBpb = useMemo(() => {
    const loopOnly = 1.687;
    const memOnly = 1.616;
    const base = 2.163;
    const t = loopWeight / 100;
    const m = memWeight / 100;
    return Math.max(memOnly, base - (base - loopOnly) * t * 1.1 - (base - memOnly) * m * 0.6);
  }, [loopWeight, memWeight]);

  const csBpb = useMemo(() => {
    const loopOnly = 0.813;
    const memOnly = 0.794;
    const base = 0.859;
    const t = loopWeight / 100;
    const m = memWeight / 100;
    return Math.max(memOnly * 0.98, base - (base - loopOnly) * t * 0.6 - (base - memOnly) * m * 1.1);
  }, [loopWeight, memWeight]);

  const avgLoops = useMemo(() => (1.0 + (loopWeight / 100) * 2.0).toFixed(1), [loopWeight]);
  const gateAct = useMemo(() => (0.05 + (memWeight / 100) * 0.90).toFixed(2), [memWeight]);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-center">
          <Repeat className="h-5 w-5 text-violet-500" />
          <span className="mt-1 text-xs font-bold text-violet-600 dark:text-violet-400">Think Harder</span>
          <span className="text-lg font-black text-violet-700 dark:text-violet-300">{loopWeight}%</span>
        </div>
        <div className="flex-1">
          <input
            type="range" min={0} max={100} value={ratio}
            onChange={e => setRatio(Number(e.target.value))}
            className="w-full accent-violet-600"
          />
          <div className="mt-1 flex justify-between text-[10px] text-gray-400">
            <span>더 많은 반복 (Loops)</span>
            <span>더 많은 기억 (Memory)</span>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <Database className="h-5 w-5 text-emerald-500" />
          <span className="mt-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">Know More</span>
          <span className="text-lg font-black text-emerald-700 dark:text-emerald-300">{memWeight}%</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-violet-200 bg-violet-50 p-3 text-center dark:border-violet-800 dark:bg-violet-900/20">
          <p className="text-[10px] font-semibold text-violet-500">평균 루프 수</p>
          <p className="text-xl font-black text-violet-700 dark:text-violet-300">{avgLoops}</p>
        </div>
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-center dark:border-emerald-800 dark:bg-emerald-900/20">
          <p className="text-[10px] font-semibold text-emerald-500">메모리 게이트</p>
          <p className="text-xl font-black text-emerald-700 dark:text-emerald-300">{gateAct}</p>
        </div>
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-center dark:border-blue-800 dark:bg-blue-900/20">
          <p className="text-[10px] font-semibold text-blue-500">수학 BPB</p>
          <p className="text-xl font-black text-blue-700 dark:text-blue-300">{mathBpb.toFixed(3)}</p>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-center dark:border-amber-800 dark:bg-amber-900/20">
          <p className="text-[10px] font-semibold text-amber-500">상식 BPB</p>
          <p className="text-xl font-black text-amber-700 dark:text-amber-300">{csBpb.toFixed(3)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-violet-200 bg-violet-50 p-3 dark:border-violet-800 dark:bg-violet-900/15">
          <p className="text-xs font-bold text-violet-700 dark:text-violet-300">Think Harder 해석</p>
          <p className="mt-1 text-xs text-violet-600 dark:text-violet-400">
            {loopWeight >= 70
              ? '루프 집중 모드: 수학적 추론이 극대화되지만, 상식 지식 저장 용량이 부족하여 사실 기반 태스크에서 약세입니다.'
              : loopWeight >= 40
                ? '균형 모드: 루프가 반복 정제를 수행하면서도 메모리가 사실 저장을 보완합니다. 논문의 최적 조합에 가깝습니다.'
                : '루프 최소화: 반복 정제가 거의 없어 복잡한 다단계 추론에서 성능이 떨어집니다.'}
          </p>
        </div>
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800 dark:bg-emerald-900/15">
          <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">Know More 해석</p>
          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
            {memWeight >= 70
              ? '메모리 집중 모드: 풍부한 사실 저장이 상식 태스크를 강화하지만, 반복 정제 없이는 수학 추론 개선이 제한적입니다.'
              : memWeight >= 40
                ? '균형 모드: 메모리 뱅크가 루프의 파라미터 공유 손실을 보상합니다. 상식+수학 모두에서 안정적 성능입니다.'
                : '메모리 최소화: 가중치 공유 모델의 저장 용량 한계가 사실 기반 태스크에서 직접 드러납니다.'}
          </p>
        </div>
      </div>

      <Caption>
        슬라이더로 &ldquo;더 깊이 생각 (Loops)&rdquo;과 &ldquo;더 많이 기억 (Memory)&rdquo; 사이의 트레이드오프를 탐색합니다.
        수치는 논문의 실제 결과를 기반으로 보간한 근사치입니다.
      </Caption>
    </div>
  );
}

/* ── Notation Table ──────────────────────────────────────────── */

function NotationTable() {
  const rows = [
    { sym: 'h \\in \\mathbb{R}^{B \\times T \\times D}', desc: '은닉 상태 텐서 (배치 x 시퀀스 x 차원)' },
    { sym: 'p_t', desc: '스텝 t에서의 정지 확률 (halting probability)' },
    { sym: 'N_{\\max}', desc: '최대 루프 반복 횟수 (3, 5, 7 중 선택)' },
    { sym: 'p_{\\text{halt}}^{(t)}', desc: '정확히 스텝 t에서 정지할 확률 (geometric 분포)' },
    { sym: '\\alpha_t', desc: '학습 가능한 루프 스케일 파라미터 (-7.0 초기화)' },
    { sym: 'K_\\ell, V_\\ell', desc: '레이어별 로컬 메모리 뱅크 (M_L = 1024 슬롯)' },
    { sym: 'K_G, V_G', desc: '전역 공유 메모리 뱅크 (M_G = 512 슬롯)' },
    { sym: 'g_L, g_G', desc: '로컬/전역 메모리 게이트 값 (시그모이드 출력)' },
    { sym: '\\lambda', desc: 'Ponder cost 계수 (기본 0, 루프 수 패널티 없음)' },
    { sym: '\\tilde{n}', desc: '정규화된 평균 루프 비용 (0~1 범위)' },
  ];
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-violet-50 dark:bg-violet-900/20">
            <th className="px-4 py-2 text-left font-bold text-violet-700 dark:text-violet-300">기호</th>
            <th className="px-4 py-2 text-left font-bold text-violet-700 dark:text-violet-300">의미</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {rows.map(({ sym, desc }) => (
            <tr key={sym} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td className="px-4 py-2 font-mono text-violet-600 dark:text-violet-400 whitespace-nowrap">
                <EquationRenderer latex={sym} />
              </td>
              <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


/* ── Quiz ─────────────────────────────────────────────────────── */

function Quiz() {
  const questions = [
    {
      q: 'Adaptive Looping이 가장 큰 성능 향상을 보이는 태스크는?',
      opts: ['상식 추론 (Commonsense)', '수학적 추론 (Math)', '언어 모델링 (Perplexity)', '코드 생성 (Code)'],
      ans: 1,
      explain: '논문의 핵심 발견: 루핑은 수학 BPB를 22% 개선하지만, 상식 태스크에서는 IsoFLOP 대비 뒤처집니다. 수학적 추론은 반복적 상태 정제(iterative refinement)의 혜택을 가장 많이 받습니다.',
    },
    {
      q: '메모리 뱅크의 주된 역할은?',
      opts: ['추론 속도 향상', 'KV 캐시 대체', '가중치 공유로 인한 저장 용량 손실 보상', '어텐션 헤드 수 증가'],
      ans: 2,
      explain: '루프 모델은 레이어 간 가중치를 공유하므로 고유 파라미터가 적습니다. 메모리 뱅크(로컬 1024 + 전역 512 슬롯)가 이 용량 손실을 보상하여 상식 태스크 성능을 회복합니다.',
    },
    {
      q: '정지 메커니즘(halting)의 확률 분포는?',
      opts: ['균등 분포', '포아송 분포', '기하 분포 (Geometric)', '정규 분포'],
      ans: 2,
      explain: 'p_halt^(t) = p_t * prod(1-p_i)로 정의되며, 이는 기하 분포의 형태입니다. 각 스텝에서 독립적으로 "정지할지" 결정하고, 처음 정지하는 스텝의 확률을 나타냅니다.',
    },
    {
      q: '루프 스케일 alpha_t의 초기값 -7.0의 의미는?',
      opts: ['루프를 매우 강하게 시작', '소프트플러스(-7) ≈ 0이므로 거의 항등 매핑으로 시작', '음의 학습률 적용', '역방향 그래디언트 활성화'],
      ans: 1,
      explain: 'softplus(-7.0) ≈ 0.0009로 거의 0입니다. 따라서 학습 초기에 루프 반복은 거의 아무 변화를 주지 않으며(항등 매핑), 학습이 진행되면서 점진적으로 루프의 기여가 커집니다.',
    },
    {
      q: '로컬 메모리와 전역 메모리의 핵심 차이점은?',
      opts: ['크기만 다름', '로컬은 레이어별, 전역은 모든 레이어가 공유', '전역이 학습 불가', '로컬은 어텐션, 전역은 FFN에 사용'],
      ans: 1,
      explain: '로컬 메모리(K_l, V_l)는 각 레이어에 고유하고(1024 슬롯), 전역 메모리(K_G, V_G)는 모든 레이어가 공유합니다(512 슬롯). 전역 메모리의 게이트 분산이 낮은 것은 모든 깊이에서 균일하게 활용됨을 의미합니다.',
    },
    {
      q: '루프 활용이 증가하기 시작하는 시점은?',
      opts: ['학습 시작부터 즉시', '검증 CE가 약 3.27 아래로 떨어진 후', '전체 학습의 50% 시점', 'Warmup 종료 후'],
      ans: 1,
      explain: '모델은 기본적인 언어 능력을 먼저 습득한 뒤에야 반복 정제를 활용합니다. 이 "위상 전이(phase transition)"는 검증 CE ≈ 3.27 ± 0.59에서 일관되게 관찰됩니다.',
    },
  ];

  const [selected, setSelected] = useState<Record<number, number>>({});
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});

  return (
    <div className="space-y-4">
      {questions.map((q, qi) => (
        <div key={qi} className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="mb-3 text-sm font-semibold text-gray-800 dark:text-gray-200">
            <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white">{qi + 1}</span>
            {q.q}
          </p>
          <div className="mb-3 space-y-2">
            {q.opts.map((opt, oi) => {
              const isSelected = selected[qi] === oi;
              const isCorrect = oi === q.ans;
              const isRevealed = revealed[qi];
              let cls = 'border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-700';
              if (isRevealed && isCorrect) cls = 'border-green-400 bg-green-50 dark:border-green-600 dark:bg-green-900/30';
              else if (isRevealed && isSelected && !isCorrect) cls = 'border-red-400 bg-red-50 dark:border-red-600 dark:bg-red-900/30';
              else if (isSelected) cls = 'border-violet-400 bg-violet-50 dark:border-violet-600 dark:bg-violet-900/30';
              return (
                <button
                  key={oi}
                  onClick={() => { if (!isRevealed) setSelected(s => ({ ...s, [qi]: oi })); }}
                  className={`w-full rounded-lg border p-2.5 text-left text-xs transition ${cls}`}
                >
                  <span className="font-mono font-bold text-gray-400 mr-2">{String.fromCharCode(65 + oi)}.</span>
                  <span className="text-gray-700 dark:text-gray-300">{opt}</span>
                </button>
              );
            })}
          </div>
          {selected[qi] !== undefined && !revealed[qi] && (
            <button
              onClick={() => setRevealed(r => ({ ...r, [qi]: true }))}
              className="rounded-lg bg-violet-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-violet-700"
            >
              정답 확인
            </button>
          )}
          {revealed[qi] && (
            <div className={`mt-2 rounded-lg border px-3 py-2 ${selected[qi] === q.ans ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20' : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'}`}>
              <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                {selected[qi] === q.ans ? '정답!' : `오답. 정답: ${String.fromCharCode(65 + q.ans)}`}
              </p>
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{q.explain}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}


/* ── Main component ──────────────────────────────────────────── */

export default function AdaptiveLoopsStudyFull() {
  const [col, setCol] = useState<Record<string, boolean>>({});
  const toggle = useCallback((id: string) => setCol(c => ({ ...c, [id]: !c[id] })), []);

  return (
    <div className="space-y-6">

      {/* ── Overview ─────────────────────────────────────────── */}
      <section id="aloop-overview" className="scroll-mt-20">
        <div className="overflow-hidden rounded-xl shadow-sm">
          <div className="bg-gradient-to-br from-violet-700 via-purple-700 to-fuchsia-700 p-6 pb-8">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">ICLR 2026 Workshop</span>
              <span className="rounded-full bg-yellow-400/90 px-3 py-1 text-xs font-bold text-yellow-900">Loops + Memory</span>
            </div>
            <h2 className="text-xl font-bold leading-snug text-white sm:text-2xl">
              Adaptive Loops and Memory in Transformers: Think Harder or Know More?
            </h2>
            <p className="mt-3 text-sm text-violet-200">
              Frey, Shomali, Bashir, Berghaus, Koehler, Ali -- Latent & Implicit Thinking Workshop @ ICLR 2026
            </p>
            <p className="mt-1 text-xs text-violet-300/80">arXiv: 2603.08391</p>
          </div>
          <div className="bg-white p-6 dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
            <p className="leading-relaxed text-gray-700 dark:text-gray-300">
              트랜스포머에 두 가지 메커니즘을 결합합니다:
              <span className="font-semibold text-violet-700 dark:text-violet-300"> 적응형 레이어별 루핑</span>(학습된 정지 메커니즘으로 은닉 상태를 반복 정제)과
              <span className="font-semibold text-emerald-700 dark:text-emerald-300"> 게이트 메모리 뱅크</span>(추가 학습 가능한 저장 용량 제공).
            </p>
            <p className="mt-3 leading-relaxed text-gray-700 dark:text-gray-300">
              핵심 발견: <strong>루핑은 수학적 추론을 주로 향상</strong>시키고,
              <strong>메모리 뱅크는 상식 태스크 성능을 회복</strong>합니다.
              결합 시, 3배 레이어를 가진 iso-FLOP 기준선을 수학 벤치마크에서 능가합니다.
              내부 분석에서 <strong>레이어 전문화</strong>가 관찰됩니다: 초기 레이어는 루프/메모리를 적게, 후기 레이어는 많이 사용합니다.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {['Adaptive Computation', 'Memory-Augmented Transformer', 'Looped Transformer', 'Knowledge vs Reasoning', 'Layer Specialization'].map(tag => (
                <span key={tag} className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Core Idea ────────────────────────────────────────── */}
      <section id="aloop-idea" className="scroll-mt-20">
        <SectionHeading icon={<BrainCircuit className="h-5 w-5" />} title="핵심 아이디어: Loops vs Memory 트레이드오프" collapsed={!!col['aloop-idea']} onToggle={() => toggle('aloop-idea')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['aloop-idea'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="1.1" title="문제 인식: 루프 트랜스포머의 딜레마" />
            <p className="mb-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              루프(Looped) 트랜스포머는 레이어 간 가중치를 공유하여 <strong>파라미터 효율성</strong>을 극대화합니다.
              하지만 가중치 공유는 곧 <strong>고유 파라미터 감소</strong>를 의미하며,
              이는 깊은 모델이 레이어별 고유 가중치로 저장하는 <strong>지식 용량(knowledge capacity)</strong>의 손실로 이어집니다.
            </p>
            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-violet-200 bg-violet-50 p-4 dark:border-violet-900/40 dark:bg-violet-900/10">
                <p className="mb-2 text-xs font-bold text-violet-700 dark:text-violet-300">Think Harder (루프)</p>
                <p className="text-xs text-violet-600 dark:text-violet-400">
                  같은 연산을 반복 적용하여 표현을 정제<br/>
                  = <strong>지식 조작(knowledge manipulation)</strong><br/>
                  + 수학적 추론, 다단계 논리에 강함<br/>
                  - 새로운 사실 저장 능력 부족
                </p>
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/40 dark:bg-emerald-900/10">
                <p className="mb-2 text-xs font-bold text-emerald-700 dark:text-emerald-300">Know More (메모리)</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                  학습 가능한 메모리 슬롯으로 저장 용량 확장<br/>
                  = <strong>지식 용량(knowledge capacity)</strong><br/>
                  + 사실 기반 상식 태스크에 강함<br/>
                  - 추론 깊이 자체는 향상 안 됨
                </p>
              </div>
            </div>

            <SubSectionHeading number="1.2" title="핵심 프레이밍: 조작 vs 저장" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              Geva et al. (2021)과 Meng et al. (2022)의 발견에 기반합니다:
              FFN 레이어는 사실상 <strong>key-value 메모리</strong>로 작동하며, 사실적 지식을 저장합니다.
              가중치를 공유하면 이 저장 공간이 줄어들지만, 반복 연산은 저장된 지식의 <strong>조합과 변환</strong>을 강화합니다.
            </p>
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-900/20">
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">논문의 핵심 질문</p>
              <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                &ldquo;제한된 연산 예산(FLOP) 내에서, 같은 연산을 더 반복하는 것(Think Harder)과
                더 많은 파라미터로 지식을 저장하는 것(Know More) 중 어느 전략이 언제 유리한가?&rdquo;
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Key Equations ─────────────────────────────────────── */}
      <section id="aloop-equations" className="scroll-mt-20">
        <SectionHeading icon={<Hash className="h-5 w-5" />} title="핵심 수식" collapsed={!!col['aloop-equations']} onToggle={() => toggle('aloop-equations')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['aloop-equations'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="space-y-3">
              <EqCard idx={1} name="트랜스포머 블록 (기본)" color="blue"
                latex={String.raw`\mathbf{h}'' = \left(\mathbf{h} + \text{Attn}(\text{LN}(\mathbf{h}))\right) + \text{FFN}\!\left(\text{LN}\!\left(\mathbf{h} + \text{Attn}(\text{LN}(\mathbf{h}))\right)\right)`}
                description="Pre-LN 표준 트랜스포머 블록. h는 (B, T, D) 형상의 은닉 상태. 어텐션과 FFN에 각각 잔차 연결(residual connection)이 적용됩니다. 루프 모델에서는 이 블록이 동일 가중치로 반복 적용됩니다." />

              <EqCard idx={3} name="정지 확률 (Halting Router)" color="violet"
                latex={String.raw`p_t = \sigma\!\left(\mathbf{W}_h\,[\,\mathbf{h}^{(t)};\; t / N_{\max}\,] + b_h\right)`}
                description="각 루프 스텝 t에서 정지할 확률을 계산합니다. 현재 은닉 상태 h^(t)와 정규화된 스텝 인덱스 t/N_max를 연결(concat)하여 시그모이드에 통과시킵니다. PonderNet(Banino et al., 2021)에서 영감을 받았습니다." />

              <EqCard idx={4} name="가중 출력 합성" color="violet"
                latex={String.raw`\mathbf{h}_{\text{out}} = \sum_{t=1}^{N_{\max}} p_{\text{halt}}^{(t)} \cdot \mathbf{h}^{(t)}, \quad p_{\text{halt}}^{(t)} = p_t \prod_{i=1}^{t-1}(1 - p_i)`}
                description="기하 분포 형태의 정지 확률로 각 스텝의 은닉 상태를 가중 합산합니다. 일찍 정지할수록 적은 연산, 늦게 정지할수록 많은 반복 정제를 의미합니다. 모든 p_halt^(t)의 합은 1입니다 (확률 분포)." />

              <EqCard idx={5} name="루프 스케일 (학습 가능)" color="violet"
                latex={String.raw`\mathbf{h}^{(t)} = \mathbf{h}^{(t-1)} + \text{softplus}(\alpha_t) \cdot f_\theta(\text{LN}(\mathbf{h}^{(t-1)}))`}
                description="alpha_t는 학습 가능한 스칼라로 -7.0으로 초기화됩니다. softplus(-7) ≈ 0.0009이므로, 학습 초기에 루프는 거의 항등 매핑(identity)입니다. 학습이 진행되면서 모델이 필요에 따라 루프의 기여도를 점진적으로 키웁니다." />

              <EqCard idx={6} name="로컬 메모리 검색" color="green"
                latex={String.raw`\mathbf{m}_{\text{local}} = \text{softmax}\!\left(\frac{\text{LN}_q(\mathbf{h}) \cdot \text{LN}_k(\mathbf{K}_\ell)^\top}{\sqrt{D}}\right)\mathbf{V}_\ell`}
                description="레이어별 고유한 로컬 메모리 (K_l, V_l)에서 어텐션 기반 검색을 수행합니다. M_L = 1024 슬롯. QK-정규화(Dehghani et al., 2023)를 사용하여 학습 안정성을 확보합니다. 학습된 파라미터이며 추론 시 고정됩니다." />

              <EqCard idx={7} name="전역 메모리 검색" color="green"
                latex={String.raw`\mathbf{m}_{\text{global}} = \text{softmax}\!\left(\frac{\text{LN}_q(\mathbf{h}) \cdot \text{LN}_k(\mathbf{K}_G)^\top}{\sqrt{D}}\right)\mathbf{V}_G`}
                description="모든 레이어가 공유하는 전역 메모리 (K_G, V_G), M_G = 512 슬롯. 전역 메모리의 게이트 활성화 분산이 낮아(0.30 +/- 0.03), 모든 깊이에서 균일하게 활용되는 '공유 지식 베이스' 역할을 합니다." />

              <EqCard idx={9} name="게이트 메모리 통합" color="amber"
                latex={String.raw`\mathbf{h}_{\text{mem}} = \mathbf{h} + \mathbf{g}_L \odot \mathbf{W}_L\,\mathbf{m}_{\text{local}} + \mathbf{g}_G \odot \mathbf{W}_G\,\mathbf{m}_{\text{global}}`}
                description="시그모이드 게이트 g = sigma(W_g h + b_g)로 메모리 기여도를 제어합니다. 게이트 바이어스 b_g 초기화가 중요: -3(거의 닫힘), 0(균형), 3(거의 열림). 논문에서 b_g=3 (열린 게이트)이 수학+상식 모두에서 최적이었습니다." />

              <EqCard idx={11} name="학습 손실 함수" color="rose"
                latex={String.raw`\mathcal{L} = \mathcal{L}_{\text{CE}} + \lambda \cdot \tilde{n}, \quad \tilde{n} = \frac{\bar{n} - 1}{N_{\max} - 1}`}
                description="교차 엔트로피 + 정규화된 ponder cost. lambda=0이면 루프 수에 패널티가 없어 모델이 자유롭게 반복 횟수를 결정합니다. n-bar는 전체 레이어의 평균 예상 루프 수이고, tilde-n은 이를 [0,1] 범위로 정규화합니다." />
            </div>

            <div className="mt-5">
              <SubSectionHeading number="2.1" title="기호 참조" />
              <NotationTable />
            </div>
          </Card>
        </div>
      </section>

      {/* ── Architecture ──────────────────────────────────────── */}
      <section id="aloop-arch" className="scroll-mt-20">
        <SectionHeading icon={<Layers className="h-5 w-5" />} title="아키텍처: 적응형 루프 + 메모리 뱅크" collapsed={!!col['aloop-arch']} onToggle={() => toggle('aloop-arch')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['aloop-arch'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="3.1" title="기본 모델 사양" />
            <div className="mb-5 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { k: '아키텍처', v: 'Decoder-only Transformer' },
                    { k: '레이어 수 (L)', v: '12' },
                    { k: '은닉 차원 (D)', v: '768' },
                    { k: '어텐션 헤드 (H)', v: '12' },
                    { k: 'FFN 은닉 차원', v: '3072 (4x)' },
                    { k: '파라미터', v: '~200M (기본), ~210M (메모리 포함)' },
                    { k: '어휘 크기', v: '50,304' },
                    { k: '학습 데이터', v: 'FineWeb-Edu (14B 토큰)' },
                  ].map(({ k, v }) => (
                    <tr key={k} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-2 font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap">{k}</td>
                      <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <SubSectionHeading number="3.2" title="적응형 루프 동작 흐름" />
            <div className="mb-5 space-y-2">
              {[
                { step: '1', title: '입력 진입', desc: '은닉 상태 h가 레이어 l에 진입. h^(0) = h_입력', color: 'gray' },
                { step: '2', title: '트랜스포머 블록 적용', desc: 'f_theta(LN(h^(t-1)))를 계산. 어텐션 + FFN을 1회 적용', color: 'blue' },
                { step: '3', title: '스케일 적용 & 잔차', desc: 'h^(t) = h^(t-1) + softplus(alpha_t) * f_theta(...). 루프의 기여도를 학습된 스케일로 조절', color: 'violet' },
                { step: '4', title: '정지 판단', desc: 'p_t = sigma(W_h [h^(t); t/N_max] + b_h). 현재 상태 + 스텝 인덱스로 정지 확률 계산', color: 'purple' },
                { step: '5', title: '반복 or 종료', desc: 't < N_max이면 스텝 2로. N_max 도달 시 강제 종료. 최종: h_out = sum(p_halt^(t) * h^(t))', color: 'fuchsia' },
              ].map(({ step, title, desc }) => (
                <div key={step} className="flex gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white">{step}</span>
                  <div>
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-gray-600 dark:text-gray-400">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <SubSectionHeading number="3.3" title="메모리 뱅크 구조" />
            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/40 dark:bg-emerald-900/10">
                <p className="mb-2 text-xs font-bold text-emerald-700 dark:text-emerald-300">로컬 메모리 (레이어별)</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                  (K_l, V_l) -- 1024 슬롯 x D 차원<br/>
                  각 레이어에 고유한 메모리<br/>
                  게이트 활성화: 0.42 +/- 0.13 (높은 분산)<br/>
                  레이어별 정보 필요량 차이를 반영
                </p>
              </div>
              <div className="rounded-lg border border-teal-200 bg-teal-50 p-4 dark:border-teal-900/40 dark:bg-teal-900/10">
                <p className="mb-2 text-xs font-bold text-teal-700 dark:text-teal-300">전역 메모리 (공유)</p>
                <p className="text-xs text-teal-600 dark:text-teal-400">
                  (K_G, V_G) -- 512 슬롯 x D 차원<br/>
                  모든 레이어가 공유<br/>
                  게이트 활성화: 0.30 +/- 0.03 (낮은 분산)<br/>
                  모든 깊이에서 균일한 &ldquo;공유 지식 베이스&rdquo;
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-900/20">
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">메모리 뱅크 vs KV 캐시</p>
              <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                메모리 뱅크는 학습 시 역전파로 업데이트되는 <strong>정적 학습 파라미터</strong>입니다.
                추론 시에는 고정되며, 동적으로 채워지는 KV 캐시와는 완전히 다릅니다.
                Neural Turing Machine(Graves et al., 2014)이나 Large Memory Layers(Lample et al., 2019)와 유사한 접근입니다.
              </p>
            </div>

            <div className="mt-5">
              <SubSectionHeading number="3.4" title="모델 변형 비교" />
              <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800">
                      <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">모델</th>
                      <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">루프</th>
                      <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">메모리</th>
                      <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">파라미터</th>
                      <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">설명</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {[
                      { m: 'Base (IsoPar)', loop: '-', mem: '-', p: '200M', d: '12 레이어, 파라미터 기준선' },
                      { m: 'Loop-3', loop: '3', mem: '-', p: '200M', d: 'N_max=3, 최대 3회 반복' },
                      { m: 'Loop-5', loop: '5', mem: '-', p: '200M', d: 'N_max=5, 최대 5회 반복' },
                      { m: 'Loop-7', loop: '7', mem: '-', p: '200M', d: 'N_max=7, 최대 7회 반복' },
                      { m: 'IsoFLOP', loop: '-', mem: '-', p: '332M', d: '36 레이어, FLOP 기준선' },
                      { m: 'Mem(g0)', loop: '3', mem: 'O', p: '210M', d: 'Loop-3 + 메모리 (다양한 게이트 초기화)' },
                      { m: 'IsoFLOP-M', loop: '-', mem: '-', p: '480M', d: '36 레이어 + 넓은 FFN' },
                    ].map((r, i) => (
                      <tr key={i} className={r.m.includes('Mem') ? 'bg-violet-50 dark:bg-violet-900/15' : ''}>
                        <td className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">{r.m}</td>
                        <td className="px-3 py-2 text-center font-mono text-gray-500 dark:text-gray-400">{r.loop}</td>
                        <td className="px-3 py-2 text-center font-mono text-gray-500 dark:text-gray-400">{r.mem}</td>
                        <td className="px-3 py-2 text-center font-mono text-gray-500 dark:text-gray-400">{r.p}</td>
                        <td className="px-3 py-2 text-gray-500 dark:text-gray-400">{r.d}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Interactive Viz ────────────────────────────────────── */}
      <section id="aloop-viz" className="scroll-mt-20">
        <SectionHeading icon={<Cpu className="h-5 w-5" />} title="인터랙티브: Think Harder vs Know More" collapsed={!!col['aloop-viz']} onToggle={() => toggle('aloop-viz')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['aloop-viz'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <p className="mb-4 text-sm text-gray-700 dark:text-gray-300">
              슬라이더를 움직여 연산 예산을 &ldquo;더 많은 반복 (Loops)&rdquo;과 &ldquo;더 많은 기억 (Memory)&rdquo; 사이에 배분해보세요.
              수학 BPB와 상식 BPB가 어떻게 변하는지 관찰하세요.
            </p>
            <ThinkVsKnowSlider />
          </Card>
        </div>
      </section>

      {/* ── Results ───────────────────────────────────────────── */}
      <section id="aloop-results" className="scroll-mt-20">
        <SectionHeading icon={<BarChart2 className="h-5 w-5" />} title="실험 결과" collapsed={!!col['aloop-results']} onToggle={() => toggle('aloop-results')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['aloop-results'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="5.1" title="수학 BPB (낮을수록 좋음)" />
            <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">MATH 데이터셋 (7개 하위 카테고리) 평균 Bits-Per-Byte</p>
            <div className="mb-5 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">모델</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">대수</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">기하</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">미적분전</th>
                    <th className="px-3 py-2 text-center font-bold text-gray-700 dark:text-gray-300">평균</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">vs Base</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { m: 'Base',     a: '2.267', g: '1.987', pc: '2.778', avg: '2.163', d: '-',     hi: false, bad: false },
                    { m: 'Loop-3',   a: '1.792', g: '1.638', pc: '1.924', avg: '1.687', d: '-22.0%', hi: true,  bad: false },
                    { m: 'Loop-7',   a: '1.766', g: '1.618', pc: '1.901', avg: '1.659', d: '-23.3%', hi: true,  bad: false },
                    { m: 'IsoFLOP',  a: '1.895', g: '1.717', pc: '2.165', avg: '1.801', d: '-16.7%', hi: false, bad: false },
                    { m: 'Mem(3)',   a: '1.717', g: '1.566', pc: '1.854', avg: '1.616', d: '-25.3%', hi: true,  bad: false },
                    { m: 'IsoFLOP-M', a: '1.867', g: '1.651', pc: '2.147', avg: '1.761', d: '-18.6%', hi: false, bad: false },
                  ].map((r, i) => (
                    <tr key={i} className={r.hi ? 'bg-violet-50 dark:bg-violet-900/15' : ''}>
                      <td className={`px-3 py-2 font-medium ${r.hi ? 'text-violet-700 dark:text-violet-300' : 'text-gray-700 dark:text-gray-300'}`}>{r.m}</td>
                      <td className="px-3 py-2 text-center font-mono text-gray-500 dark:text-gray-400">{r.a}</td>
                      <td className="px-3 py-2 text-center font-mono text-gray-500 dark:text-gray-400">{r.g}</td>
                      <td className="px-3 py-2 text-center font-mono text-gray-500 dark:text-gray-400">{r.pc}</td>
                      <td className={`px-3 py-2 text-center font-mono font-bold ${r.hi ? 'text-violet-700 dark:text-violet-300' : 'text-gray-600 dark:text-gray-400'}`}>{r.avg}</td>
                      <td className={`px-3 py-2 text-center font-mono text-xs ${r.d.startsWith('-') ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>{r.d}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <SubSectionHeading number="5.2" title="상식 정확도 (높을수록 좋음)" />
            <div className="mb-5 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">모델</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">ARC-E</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">HellaSwag</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">PIQA</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">Winogrande</th>
                    <th className="px-3 py-2 text-center font-bold text-gray-700 dark:text-gray-300">평균</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { m: 'Base',     ae: '.609', hs: '.445', pi: '.625', wg: '.531', avg: '.477', hi: false },
                    { m: 'Loop-3',   ae: '.672', hs: '.469', pi: '.602', wg: '.492', avg: '.501', hi: false },
                    { m: 'IsoFLOP',  ae: '.688', hs: '.508', pi: '.672', wg: '.555', avg: '.523', hi: false },
                    { m: 'Mem(3)',   ae: '.641', hs: '.461', pi: '.664', wg: '.594', avg: '.511', hi: true },
                    { m: 'IsoFLOP-M', ae: '.680', hs: '.508', pi: '.688', wg: '.555', avg: '.535', hi: false },
                  ].map((r, i) => (
                    <tr key={i} className={r.hi ? 'bg-emerald-50 dark:bg-emerald-900/15' : ''}>
                      <td className={`px-3 py-2 font-medium ${r.hi ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-700 dark:text-gray-300'}`}>{r.m}</td>
                      <td className="px-3 py-2 text-center font-mono text-gray-500 dark:text-gray-400">{r.ae}</td>
                      <td className="px-3 py-2 text-center font-mono text-gray-500 dark:text-gray-400">{r.hs}</td>
                      <td className="px-3 py-2 text-center font-mono text-gray-500 dark:text-gray-400">{r.pi}</td>
                      <td className="px-3 py-2 text-center font-mono text-gray-500 dark:text-gray-400">{r.wg}</td>
                      <td className={`px-3 py-2 text-center font-mono font-bold ${r.hi ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-600 dark:text-gray-400'}`}>{r.avg}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <SubSectionHeading number="5.3" title="핵심 발견 요약" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-violet-200 bg-violet-50 px-4 py-3 dark:border-violet-800 dark:bg-violet-900/20">
                <p className="text-xs font-semibold text-violet-700 dark:text-violet-300">발견 1: 루프 = 수학 추론</p>
                <p className="mt-1 text-xs text-violet-600 dark:text-violet-400">
                  Loop-3만으로 수학 BPB -22%. 3배 레이어의 IsoFLOP(36층)보다 6.4% 우수.
                  미적분전(Precalculus)에서 최대 -31% 개선.
                </p>
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800 dark:bg-emerald-900/20">
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">발견 2: 메모리 = 상식 회복</p>
                <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                  Loop만으로는 상식에서 IsoFLOP에 뒤처짐 (0.501 vs 0.523).
                  메모리 추가 시 0.511로 격차 축소 + 수학은 추가 -4.2% 개선.
                </p>
              </div>
              <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-800 dark:bg-blue-900/20">
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">발견 3: 레이어 전문화</p>
                <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                  초기 레이어: 루프 최소, 메모리 적게 사용.
                  후기 레이어: 루프 + 메모리 모두 집중적.
                  루프와 메모리는 보완재(complement), 대체재 아님.
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-900/20">
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">위상 전이 (Phase Transition)</p>
              <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                루프 활용은 학습 시작부터 증가하지 않습니다.
                검증 CE가 약 <strong>3.27 +/- 0.59</strong> 아래로 떨어져야 루프 활용이 증가합니다.
                해석: 모델이 기본적인 언어 능력을 먼저 습득한 뒤에야 반복 정제가 유용해집니다.
                이 임계값은 Loop-3, 5, 7 모두에서 일관되게 관찰됩니다.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Discussion ────────────────────────────────────────── */}
      <section id="aloop-discussion" className="scroll-mt-20">
        <SectionHeading icon={<AlertTriangle className="h-5 w-5" />} title="토론 포인트 및 연구 함의" collapsed={!!col['aloop-discussion']} onToggle={() => toggle('aloop-discussion')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['aloop-discussion'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-3 text-sm font-bold text-violet-700 dark:text-violet-300">연구 기여</p>
                <div className="space-y-2">
                  {[
                    { t: '조작 vs 저장 분리', d: '루핑 = 지식 조작, 메모리 = 지식 저장이라는 프레이밍을 실험적으로 검증. Zhu et al. (2025)의 이론적 주장에 실증적 근거 제공.' },
                    { t: '적응형 연산 할당', d: '모든 토큰에 균일한 연산이 아닌, 필요에 따라 레이어별로 다른 반복 횟수를 할당. Mixture-of-Depths(Raposo et al., 2024)와 상보적 접근.' },
                    { t: '파라미터 효율성', d: '200M 파라미터 루프 모델이 332M(3배 레이어) 기준선을 수학에서 능가. 효율적 스케일링의 새로운 방향.' },
                    { t: '레이어 전문화 발견', d: '초기=구문, 후기=의미/추론이라는 BERT 문헌(Tenney et al., 2019)의 관찰을 루프+메모리 맥락에서 재확인.' },
                  ].map(({ t, d }) => (
                    <div key={t} className="rounded-lg border border-violet-100 bg-violet-50 p-3 dark:border-violet-900/30 dark:bg-violet-900/10">
                      <p className="text-xs font-bold text-violet-700 dark:text-violet-300">{t}</p>
                      <p className="mt-0.5 text-xs text-violet-600 dark:text-violet-400">{d}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-3 text-sm font-bold text-amber-700 dark:text-amber-300">한계 및 열린 질문</p>
                <div className="space-y-2">
                  {[
                    { t: '소규모 실험', d: '200M 파라미터, 14B 토큰. 더 큰 모델(1B+)과 더 많은 데이터에서 동일한 패턴이 유지되는지 불확실.' },
                    { t: '추론 시 연산 비용', d: '루프는 FLOP을 증가시킴. 실시간 추론에서 가변적 레이턴시가 문제가 될 수 있음. 토큰별 연산 할당은 배치 처리를 복잡하게 만듦.' },
                    { t: '메모리 뱅크 크기 최적화', d: '로컬 1024, 전역 512는 경험적 선택. 최적 크기에 대한 체계적 탐색이 부족.' },
                    { t: '코드/언어 생성 미평가', d: '수학과 상식만 평가. 코드 생성, 번역, 요약 등 다른 태스크에서의 동작은 미확인.' },
                  ].map(({ t, d }) => (
                    <div key={t} className="rounded-lg border border-amber-100 bg-amber-50 p-3 dark:border-amber-900/30 dark:bg-amber-900/10">
                      <p className="text-xs font-bold text-amber-700 dark:text-amber-300">{t}</p>
                      <p className="mt-0.5 text-xs text-amber-600 dark:text-amber-400">{d}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-800 dark:bg-blue-900/20">
              <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">관련 연구와의 위치</p>
              <p className="mt-1 text-xs leading-relaxed text-blue-600 dark:text-blue-400">
                Universal Transformer(Dehghani, 2018)는 모든 레이어에 동일 가중치를 공유하고 ACT로 깊이를 조절했습니다.
                PonderNet(Banino, 2021)은 정지 메커니즘을 개선했습니다.
                본 논문은 여기에 <strong>메모리 뱅크</strong>를 결합하여, 가중치 공유의 용량 손실을 보상하는 최초의 체계적 연구입니다.
                Chain-of-Thought(Wei, 2022)와의 관계: CoT는 &ldquo;명시적&rdquo; 추론 단계를, 루프는 &ldquo;암묵적(latent)&rdquo; 추론 단계를 추가합니다.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Quiz ──────────────────────────────────────────────── */}
      <section id="aloop-quiz" className="scroll-mt-20">
        <SectionHeading icon={<HelpCircle className="h-5 w-5" />} title="이해도 점검 퀴즈" collapsed={!!col['aloop-quiz']} onToggle={() => toggle('aloop-quiz')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['aloop-quiz'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <Quiz />
          </Card>
        </div>
      </section>
    </div>
  );
}
