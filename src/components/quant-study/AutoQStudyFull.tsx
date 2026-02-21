'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  BarChart2,
  BrainCircuit,
  ChevronDown,
  Cpu,
  FlaskConical,
  GraduationCap,
  Hash,
  Layers,
  AlertTriangle,
  Database,
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
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-pink-100 text-xs font-bold text-pink-700 dark:bg-pink-900/40 dark:text-pink-300">{number}</span>
      <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">{title}</h4>
    </div>
  );
}

function EqCard({ idx, name, latex, description, color = 'pink' }: {
  idx: number; name: string; latex: string; description: string; color?: string;
}) {
  const [open, setOpen] = useState(false);
  const colorMap: Record<string, string> = {
    pink:   'bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800',
    rose:   'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800',
    amber:  'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
    green:  'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
  };
  const badgeMap: Record<string, string> = {
    pink:   'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
    rose:   'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
    amber:  'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    green:  'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  };
  return (
    <div className="cursor-pointer rounded-xl border border-gray-200 bg-gray-50/50 p-4 transition hover:border-pink-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-pink-700" onClick={() => setOpen(v => !v)}>
      <div className="mb-2 flex items-center gap-2">
        <span className={`rounded px-2 py-0.5 text-xs font-bold ${badgeMap[color] ?? badgeMap.pink}`}>Eq. {idx}</span>
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{name}</span>
        <ChevronDown className={`ml-auto h-4 w-4 text-gray-400 transition-transform dark:text-gray-500 ${open ? 'rotate-180' : ''}`} />
      </div>
      <div className="overflow-x-auto py-2 text-gray-900 dark:text-gray-100"><EquationRenderer latex={latex} /></div>
      {open ? (
        <div className={`mt-3 rounded-lg border px-4 py-3 ${colorMap[color] ?? colorMap.pink}`}>
          <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">{description}</p>
        </div>
      ) : (
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">클릭하여 상세 설명 보기</p>
      )}
    </div>
  );
}

function QuizSection({ questions, color = 'pink' }: { questions: { q: string; a: string }[]; color?: string }) {
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const toggle = (i: number) => setRevealed(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; });
  const bgMap: Record<string, string> = {
    pink: 'border-pink-200 bg-pink-50 dark:border-pink-800 dark:bg-pink-900/20',
  };
  return (
    <div className="space-y-3">
      {questions.map(({ q, a }, i) => (
        <div key={i} className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
          <button onClick={() => toggle(i)} className="flex w-full items-start gap-3 p-4 text-left">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600 dark:bg-gray-800 dark:text-gray-400">Q{i + 1}</span>
            <span className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">{q}</span>
            <ChevronDown className={`h-4 w-4 flex-shrink-0 text-gray-400 transition-transform ${revealed.has(i) ? 'rotate-180' : ''}`} />
          </button>
          {revealed.has(i) && (
            <div className={`mx-4 mb-4 rounded-lg border px-4 py-3 ${bgMap[color] ?? bgMap.pink}`}>
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                <span className="mr-1 font-bold text-green-600 dark:text-green-400">A:</span>{a}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── KernelVarianceViz ───────────────────────────────────────── */

type KernelInfo = {
  id: number;
  variance: number;
  optimalBits: number;
  label: string;
};

const KERNELS: KernelInfo[] = [
  { id:  0, variance: 1.15, optimalBits: 8, label: '고분산' },
  { id:  1, variance: 0.42, optimalBits: 4, label: '중분산' },
  { id:  2, variance: 0.09, optimalBits: 2, label: '저분산' },
  { id:  3, variance: 0.88, optimalBits: 6, label: '고분산' },
  { id:  4, variance: 0.35, optimalBits: 4, label: '중분산' },
  { id:  5, variance: 0.97, optimalBits: 6, label: '고분산' },
  { id:  6, variance: 0.51, optimalBits: 4, label: '중분산' },
  { id:  7, variance: 0.13, optimalBits: 2, label: '저분산' },
  { id:  8, variance: 0.44, optimalBits: 4, label: '중분산' },
  { id:  9, variance: 1.08, optimalBits: 8, label: '고분산' },
  { id: 10, variance: 0.06, optimalBits: 2, label: '저분산' },
  { id: 11, variance: 0.38, optimalBits: 4, label: '중분산' },
  { id: 12, variance: 0.55, optimalBits: 4, label: '중분산' },
  { id: 13, variance: 0.82, optimalBits: 6, label: '고분산' },
  { id: 14, variance: 0.11, optimalBits: 3, label: '저분산' },
  { id: 15, variance: 0.47, optimalBits: 4, label: '중분산' },
];

const LAYER_WISE_BITS = 4;

function kernelColor(variance: number): string {
  if (variance >= 0.8) return '#be123c'; // rose-700
  if (variance >= 0.5) return '#f97316'; // orange-500
  if (variance >= 0.3) return '#eab308'; // yellow-500
  if (variance >= 0.15) return '#60a5fa'; // blue-400
  return '#94a3b8'; // slate-400
}

function bitsBgClass(bits: number, layerWise: boolean): string {
  if (layerWise) return 'bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-200';
  if (bits >= 6) return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200';
  if (bits === 4) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200';
  return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200';
}

function KernelVarianceViz() {
  const [kernelWise, setKernelWise] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);

  const totalBitsLayerWise = LAYER_WISE_BITS * 16;
  const avgBitsKernelWise = (KERNELS.reduce((s, k) => s + k.optimalBits, 0) / 16).toFixed(1);

  const hoveredKernel = hovered !== null ? KERNELS[hovered] : null;

  return (
    <div className="rounded-xl border border-pink-200 bg-pink-50/40 p-4 dark:border-pink-900/40 dark:bg-pink-900/10">
      {/* 제목 및 토글 */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
          컨볼루션 레이어 내 커널별 분산 분포 (4×4 = 16 커널)
        </p>
        <div className="flex overflow-hidden rounded-lg border border-pink-300 dark:border-pink-700 text-xs font-semibold">
          <button
            onClick={() => setKernelWise(false)}
            className={`px-3 py-1.5 transition ${!kernelWise ? 'bg-pink-700 text-white' : 'bg-white text-pink-700 hover:bg-pink-50 dark:bg-gray-900 dark:text-pink-300 dark:hover:bg-gray-800'}`}
          >
            레이어별 할당 (기존)
          </button>
          <button
            onClick={() => setKernelWise(true)}
            className={`px-3 py-1.5 transition ${kernelWise ? 'bg-pink-700 text-white' : 'bg-white text-pink-700 hover:bg-pink-50 dark:bg-gray-900 dark:text-pink-300 dark:hover:bg-gray-800'}`}
          >
            커널별 할당 (AutoQ)
          </button>
        </div>
      </div>

      {/* 범례 */}
      <div className="mb-3 flex flex-wrap gap-3 text-xs">
        {[
          { color: '#be123c', label: '고분산 (0.8+)' },
          { color: '#f97316', label: '중-고분산 (0.5–0.8)' },
          { color: '#eab308', label: '중분산 (0.3–0.5)' },
          { color: '#60a5fa', label: '중-저분산 (0.15–0.3)' },
          { color: '#94a3b8', label: '저분산 (0–0.15)' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1">
            <span className="h-3 w-3 flex-shrink-0 rounded-sm" style={{ backgroundColor: color }} />
            <span className="text-gray-600 dark:text-gray-400">{label}</span>
          </div>
        ))}
      </div>

      {/* 커널 그리드 */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {KERNELS.map((k) => {
          const bits = kernelWise ? k.optimalBits : LAYER_WISE_BITS;
          const isUnder = !kernelWise && k.variance >= 0.8;
          const isOver  = !kernelWise && k.variance <= 0.15;
          return (
            <div
              key={k.id}
              className="relative flex cursor-pointer flex-col items-center gap-1"
              onMouseEnter={() => setHovered(k.id)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* 커널 사각형 */}
              <div
                className={`h-12 w-full rounded-lg transition-all sm:h-14 ${hovered === k.id ? 'scale-105 ring-2 ring-white dark:ring-gray-300' : ''} ${isUnder ? 'ring-2 ring-red-400 dark:ring-red-500' : ''} ${isOver ? 'ring-2 ring-blue-400 dark:ring-blue-500' : ''}`}
                style={{ backgroundColor: kernelColor(k.variance) }}
              />
              {/* 비트 배지 */}
              <span className={`rounded px-1.5 py-0.5 text-xs font-bold ${bitsBgClass(bits, !kernelWise)}`}>
                {bits}bit
              </span>
              {/* 불일치 경고 */}
              {isUnder && (
                <span className="text-center text-[9px] font-semibold leading-tight text-red-600 dark:text-red-400">부족</span>
              )}
              {isOver && (
                <span className="text-center text-[9px] font-semibold leading-tight text-blue-600 dark:text-blue-400">과잉</span>
              )}
            </div>
          );
        })}
      </div>

      {/* 호버 툴팁 */}
      <div className={`mt-3 rounded-lg border px-4 py-2 text-sm transition-all ${hoveredKernel ? 'border-pink-300 bg-white dark:border-pink-700 dark:bg-gray-800' : 'border-transparent bg-transparent'}`}>
        {hoveredKernel ? (
          <p className="text-gray-700 dark:text-gray-300">
            <span className="font-bold text-pink-700 dark:text-pink-300">커널 #{hoveredKernel.id}</span>
            {'  '}분산: <span className="font-mono font-semibold">{hoveredKernel.variance.toFixed(2)}</span>
            {'  '}({hoveredKernel.label})
            {'  '}할당 비트폭: <span className="font-mono font-semibold">{kernelWise ? hoveredKernel.optimalBits : LAYER_WISE_BITS}비트</span>
          </p>
        ) : (
          <p className="text-gray-400 dark:text-gray-500">커널 위에 마우스를 올리면 상세 정보가 표시됩니다.</p>
        )}
      </div>

      {/* 비트 예산 비교 */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className={`rounded-lg border px-4 py-3 transition-all ${!kernelWise ? 'border-pink-300 bg-pink-100 dark:border-pink-700 dark:bg-pink-900/30' : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'}`}>
          <p className="text-xs font-bold text-pink-700 dark:text-pink-300">레이어별 할당 (기존)</p>
          <p className="mt-1 font-mono text-sm font-semibold text-gray-800 dark:text-gray-200">
            {LAYER_WISE_BITS}비트 × 16 = {totalBitsLayerWise} 비트/레이어
          </p>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            고분산 커널: 정밀도 부족 → 오차 급증<br/>
            저분산 커널: 비트 낭비 → 비효율
          </p>
        </div>
        <div className={`rounded-lg border px-4 py-3 transition-all ${kernelWise ? 'border-green-300 bg-green-100 dark:border-green-700 dark:bg-green-900/30' : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'}`}>
          <p className="text-xs font-bold text-green-700 dark:text-green-300">커널별 할당 (AutoQ)</p>
          <p className="mt-1 font-mono text-sm font-semibold text-gray-800 dark:text-gray-200">
            평균 {avgBitsKernelWise}비트/커널 (동일 정확도)
          </p>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            고분산 커널: 6–8비트로 정밀도 확보<br/>
            저분산 커널: 2–3비트로 압축 극대화
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────── */

export default function AutoQStudyFull() {
  const [col, setCol] = useState<Record<string, boolean>>({});
  const toggle = useCallback((id: string) => setCol(c => ({ ...c, [id]: !c[id] })), []);

  return (
    <GlossaryText>
    <div className="space-y-6">

      {/* ── Overview ─────────────────────────────────────────── */}
      <section id="autoq-overview" className="scroll-mt-20">
        <div className="overflow-hidden rounded-xl shadow-sm">
          <div className="bg-gradient-to-br from-pink-700 via-rose-700 to-red-700 p-6 pb-8">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">ICLR 2020</span>
              <span className="rounded-full bg-yellow-400/90 px-3 py-1 text-xs font-bold text-yellow-900">커널별 자동 양자화</span>
            </div>
            <h2 className="text-xl font-bold leading-snug text-white sm:text-2xl">
              AutoQ: Automated Kernel-Wise Neural Network Quantization
            </h2>
            <p className="mt-3 text-sm text-pink-200">
              Lou et al. (Microsoft Research) · ICLR 2020 · arXiv:1902.05690
            </p>
          </div>
          <div className="bg-white p-6 dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
            <p className="leading-relaxed text-gray-700 dark:text-gray-300">
              기존 방법들이 레이어 단위로 비트폭을 결정하는 것에서 한발 더 나아가,
              <span className="font-semibold text-pink-700 dark:text-pink-300"> 커널(kernel) 단위</span>로 비트폭을 자동으로 결정하는 최초의 프레임워크.
              동일한 레이어 내에서도 커널마다 분산(variance)이 크게 다름을 이용하여 비트를 불균등하게 배분합니다.
            </p>
            <p className="mt-3 leading-relaxed text-gray-700 dark:text-gray-300">
              탐색 공간의 폭발적 증가 문제(33^Σc_out)를 해결하기 위해 <span className="font-semibold text-pink-700 dark:text-pink-300">HIRO 기반 2단계 계층적 강화학습</span>을 도입합니다.
              상위 컨트롤러(HLC)가 레이어별 목표 비트폭을 제시하고, 하위 컨트롤러(LLC)가 이를 커널 단위로 세분화합니다.
              ResNet-18에서 HAQ 대비 <strong>54% 지연 시간 감소</strong>, <strong>50% 에너지 소비 감소</strong>를 동일 정확도에서 달성합니다.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {['커널별 양자화', 'HIRO 계층적 RL', 'TD3 (Twin Delayed DDPG)', '하드웨어 인식', 'ResNet/MobileNet'].map(tag => (
                <span key={tag} className="rounded-full bg-pink-100 px-3 py-1 text-xs font-semibold text-pink-700 dark:bg-pink-900/30 dark:text-pink-300">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Motivation ───────────────────────────────────────── */}
      <section id="autoq-motivation" className="scroll-mt-20">
        <SectionHeading icon={<AlertTriangle className="h-5 w-5" />} title="동기: 왜 커널별 양자화인가?" collapsed={!!col['autoq-motivation']} onToggle={() => toggle('autoq-motivation')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['autoq-motivation'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="1.1" title="동일 레이어, 다른 커널 — 분산의 이질성" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              컨볼루션 레이어의 가중치 텐서 W ∈ ℝ^{'{c_out × c_in × k × k}'} 를 c_out개의 커널로 분리하면,
              각 커널의 가중치 분산이 최대 <span className="font-semibold text-pink-700 dark:text-pink-300">20배 이상</span> 차이가 납니다.
              분산이 큰 커널은 더 많은 비트가 필요하고, 분산이 작은 커널은 적은 비트로도 충분합니다.
            </p>
            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-900/10">
                <p className="mb-1 text-xs font-bold text-red-700 dark:text-red-300">레이어별 할당 (기존 HAQ 등)</p>
                <p className="text-xs text-red-600 dark:text-red-400">
                  레이어 내 모든 커널에 동일한 비트폭 적용<br/>
                  → 고분산 커널: 비트 부족 → 오차 급증<br/>
                  → 저분산 커널: 비트 낭비 → 비효율<br/>
                  → 정밀도·효율성 동시에 희생
                </p>
              </div>
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900/40 dark:bg-green-900/10">
                <p className="mb-1 text-xs font-bold text-green-700 dark:text-green-300">커널별 할당 (AutoQ)</p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  각 커널의 분산·중요도에 맞춰 비트폭 결정<br/>
                  → 고분산 커널: 6–8비트 정밀 표현<br/>
                  → 저분산 커널: 2–3비트 공격적 압축<br/>
                  → 동일 비트 예산으로 정확도 향상
                </p>
              </div>
            </div>

            <SubSectionHeading number="1.2" title="탐색 공간 폭발 문제" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              비트폭 후보를 {'{2,3,4,5,6,7,8}'}  (7가지)로 가정할 때, 레이어별 할당의 탐색 공간은
              <span className="font-mono font-bold text-orange-600 dark:text-orange-400"> 7^L</span> (L: 레이어 수)입니다.
              커널별 할당으로 확장하면 탐색 공간은 다음과 같이 폭발합니다:
            </p>
            <div className="mb-4 overflow-x-auto rounded-lg bg-orange-50 p-3 dark:bg-orange-900/10">
              <EquationRenderer latex={String.raw`\text{탐색 공간} = \prod_{l=1}^{L} |\mathcal{A}|^{c_{out}^{(l)}} \approx 7^{\sum_l c_{out}^{(l)}}`} />
            </div>
            <p className="mb-5 text-sm text-gray-600 dark:text-gray-400">
              ResNet-18의 경우 Σc_out ≈ 3,968이므로 7^3968 — 단순 탐색이나 단일 RL 에이전트로는 절대 불가능한 규모입니다.
            </p>

            <SubSectionHeading number="1.3" title="HAQ와의 비교" />
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">특성</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">HAQ</th>
                    <th className="px-3 py-2 text-center text-pink-700 dark:text-pink-300">AutoQ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { attr: '양자화 단위', haq: '레이어', autoq: '커널 (더 세밀)' },
                    { attr: 'RL 에이전트', haq: '단일 DDPG', autoq: '계층적 HIRO (HLC+LLC)' },
                    { attr: '탐색 공간', haq: '7^L', autoq: '분해된 2단계 탐색' },
                    { attr: '보상 설계', haq: '외부 보상만', autoq: '외부 + 내부 보상' },
                    { attr: 'ResNet-18 지연 시간', haq: '640+ ms', autoq: '286.3 ms (-54%)' },
                  ].map(({ attr, haq, autoq }, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">{attr}</td>
                      <td className="px-3 py-2 text-center text-gray-500 dark:text-gray-400">{haq}</td>
                      <td className="px-3 py-2 text-center font-semibold text-pink-700 dark:text-pink-300">{autoq}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </section>

      {/* ── HIRO Hierarchy ───────────────────────────────────── */}
      <section id="autoq-hierarchy" className="scroll-mt-20">
        <SectionHeading icon={<GraduationCap className="h-5 w-5" />} title="HIRO 계층적 강화학습 프레임워크" collapsed={!!col['autoq-hierarchy']} onToggle={() => toggle('autoq-hierarchy')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['autoq-hierarchy'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="2.1" title="2단계 계층 구조 개요" />
            <p className="mb-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              AutoQ는 <span className="font-semibold text-pink-700 dark:text-pink-300">HIRO (HIerarchical Reinforcement learning with Off-policy correction)</span>를 채택하여
              폭발적인 탐색 공간을 계층적으로 분해합니다. 상위 레벨은 큰 그림을, 하위 레벨은 세부 사항을 처리합니다.
            </p>

            {/* HLC 박스 */}
            <div className="mb-4 rounded-xl border-2 border-pink-300 bg-pink-50 p-4 dark:border-pink-700 dark:bg-pink-900/20">
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded bg-pink-700 px-2 py-0.5 text-xs font-bold text-white">HLC</span>
                <span className="text-sm font-bold text-pink-800 dark:text-pink-200">High-Level Controller — 레이어 목표 비트폭 결정</span>
              </div>
              <ul className="space-y-1 text-xs text-pink-700 dark:text-pink-300">
                <li><span className="font-semibold">알고리즘:</span> TD3 (Twin Delayed DDPG) — 오프-폴리시 업데이트</li>
                <li><span className="font-semibold">상태:</span> 레이어 인덱스, 레이어 정보(크기·타입·채널 수), 누적 비트 예산</li>
                <li><span className="font-semibold">행동:</span> 각 레이어에 대한 목표 평균 비트폭 g_Li (연속값)</li>
                <li><span className="font-semibold">업데이트 주기:</span> 하나의 에피소드(전체 네트워크 순회) 완료 후</li>
              </ul>
            </div>

            {/* 화살표 */}
            <div className="mb-4 flex justify-center">
              <div className="flex flex-col items-center gap-1">
                <div className="h-6 w-0.5 bg-gray-400" />
                <span className="rounded bg-gray-200 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                  목표 비트폭 g_Li 전달
                </span>
                <div className="h-6 w-0.5 bg-gray-400" />
              </div>
            </div>

            {/* LLC 박스 */}
            <div className="mb-5 rounded-xl border-2 border-rose-300 bg-rose-50 p-4 dark:border-rose-700 dark:bg-rose-900/20">
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded bg-rose-700 px-2 py-0.5 text-xs font-bold text-white">LLC</span>
                <span className="text-sm font-bold text-rose-800 dark:text-rose-200">Low-Level Controller — 커널별 비트폭 결정</span>
              </div>
              <ul className="space-y-1 text-xs text-rose-700 dark:text-rose-300">
                <li><span className="font-semibold">상태:</span> 커널 인덱스, 현재 레이어 누적 비트 할당량, 직전 커널 결정값</li>
                <li><span className="font-semibold">행동:</span> 각 커널 K_j에 대한 비트폭 a_{'{Li,Kj}'} (이산값 → 연속 근사)</li>
                <li><span className="font-semibold">제약:</span> Σ a_{'{Li,Kj}'} = g_Li × c_out (HLC 목표 달성)</li>
                <li><span className="font-semibold">업데이트 주기:</span> 레이어 내 모든 커널 처리 후</li>
              </ul>
            </div>

            <SubSectionHeading number="2.2" title="왜 2단계가 탐색 공간을 해결하는가?" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              2단계 계층 구조는 거대한 탐색 공간을 <span className="font-semibold text-pink-700 dark:text-pink-300">연속적으로 분해(hierarchical decomposition)</span>합니다.
              HLC는 L차원 연속 공간만 탐색하면 되고 (레이어 수만큼),
              LLC는 한 레이어의 c_out개 커널만 처리합니다. 두 단계 모두 관리 가능한 크기입니다.
            </p>
            <div className="overflow-x-auto rounded-lg bg-pink-50 p-3 dark:bg-pink-900/10">
              <EquationRenderer latex={String.raw`7^{\sum_l c_{out}^{(l)}} \;\longrightarrow\; \underbrace{\text{HLC: } \mathbb{R}^L}_{\text{연속 공간}} \;\times\; \underbrace{\text{LLC: 각 레이어 } c_{out} \text{개}}_{\text{분해된 소공간}}`} />
            </div>

            <div className="mt-4">
              <SubSectionHeading number="2.3" title="TD3의 역할" />
              <p className="mb-2 text-sm text-gray-700 dark:text-gray-300">
                HLC는 TD3(Twin Delayed DDPG)를 사용합니다. 기존 DDPG 대비 TD3의 핵심 개선점:
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {[
                  { title: 'Twin Critics', desc: '두 개의 Q-네트워크 중 최솟값 사용 → Q값 과대추정 방지' },
                  { title: 'Delayed Policy Update', desc: 'Actor 업데이트를 Critic보다 느리게 → 안정적 학습' },
                  { title: 'Target Policy Noise', desc: '타겟 액션에 노이즈 추가 → 과적합 방지' },
                ].map(({ title, desc }) => (
                  <div key={title} className="rounded-lg border border-pink-200 bg-pink-50/60 p-3 dark:border-pink-900/40 dark:bg-pink-900/10">
                    <p className="text-xs font-bold text-pink-700 dark:text-pink-300">{title}</p>
                    <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Rewards ──────────────────────────────────────────── */}
      <section id="autoq-rewards" className="scroll-mt-20">
        <SectionHeading icon={<BrainCircuit className="h-5 w-5" />} title="보상 함수 설계 (Extrinsic & Intrinsic)" collapsed={!!col['autoq-rewards']} onToggle={() => toggle('autoq-rewards')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['autoq-rewards'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="3.1" title="외부 보상 (Extrinsic Reward) — HLC" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              HLC는 전체 양자화 네트워크의 하드웨어 성능과 정확도를 균형 있게 최적화하는
              <span className="font-semibold text-pink-700 dark:text-pink-300"> 로그 가중 복합 보상</span>을 사용합니다:
            </p>
            <div className="mb-4 overflow-x-auto rounded-lg bg-pink-50 p-3 dark:bg-pink-900/10">
              <EquationRenderer latex={String.raw`eR_d = \log\!\left(\frac{\text{acc}^{\psi_{\text{acc}}}}{\text{lat}^{\psi_l} \cdot \text{en}^{\psi_e} \cdot \text{area}^{\psi_a}}\right)`} />
            </div>

            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-pink-200 bg-pink-50 p-4 dark:border-pink-800 dark:bg-pink-900/20">
                <p className="mb-2 text-xs font-bold text-pink-700 dark:text-pink-300">모드 ①: 자원 제약 (Resource-Constrained)</p>
                <p className="mb-1 font-mono text-xs text-gray-700 dark:text-gray-300">ψ_acc = 1, ψ_l = ψ_e = ψ_a = 0</p>
                <p className="font-mono text-xs font-semibold text-pink-700 dark:text-pink-300">eRd = log(acc)</p>
                <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                  주어진 하드웨어 제약(지연·에너지·면적 상한)을 만족하면서 정확도 최대화.
                  제약 위반 시 큰 음수 보상으로 패널티.
                </p>
              </div>
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 dark:border-rose-800 dark:bg-rose-900/20">
                <p className="mb-2 text-xs font-bold text-rose-700 dark:text-rose-300">모드 ②: 정확도 보장 (Accuracy-Guaranteed)</p>
                <p className="mb-1 font-mono text-xs text-gray-700 dark:text-gray-300">ψ_acc = 2, ψ_l, ψ_e, ψ_a &gt; 0</p>
                <p className="font-mono text-xs font-semibold text-rose-700 dark:text-rose-300">eRd = log(acc² / (lat^ψ_l · en^ψ_e))</p>
                <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                  목표 정확도 이상을 유지하면서 하드웨어 비용(지연·에너지) 최소화.
                  정확도 제곱 → 더 강한 정확도 우선순위 부여.
                </p>
              </div>
            </div>

            <SubSectionHeading number="3.2" title="내부 보상 (Intrinsic Reward) — LLC" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              LLC는 HLC의 목표 달성 여부와 실제 하드웨어 성능을 동시에 고려하는
              <span className="font-semibold text-pink-700 dark:text-pink-300"> 혼합 내부 보상</span>을 받습니다:
            </p>
            <div className="mb-4 overflow-x-auto rounded-lg bg-rose-50 p-3 dark:bg-rose-900/10">
              <EquationRenderer latex={String.raw`iR_{d,L_i} = (1-\zeta)\cdot\!\left(-\left\| g_{L_i} \cdot c_{out} - \sum_j a_{L_i,K_j} \right\|_2\right) + \zeta \cdot \sum_j eR_{d,L_i,K_j}`} />
            </div>

            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">각 항의 의미</p>
              <ul className="mt-2 space-y-1 text-xs text-amber-600 dark:text-amber-400">
                <li><span className="font-mono font-bold">-‖g_Li · c_out - Σa_{'{Li,Kj}'}‖₂</span>: 목표 비트 예산과 실제 할당의 차이 (목표 달성 오차). 값이 클수록 패널티.</li>
                <li><span className="font-mono font-bold">Σ eRd_{'{Li,Kj}'}</span>: 커널별 외부 보상 합산 (실제 하드웨어 성능).</li>
                <li><span className="font-mono font-bold">ζ</span>: 두 항의 가중치 균형 — 에피소드 진행에 따라 동적으로 증가.</li>
              </ul>
            </div>

            <SubSectionHeading number="3.3" title="동적 ζ 스케줄" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              ζ는 훈련 초기(목표 달성 우선)에서 후기(성능 최적화 우선)로 서서히 증가합니다:
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-800 dark:bg-blue-900/20">
                <p className="text-xs font-bold text-blue-700 dark:text-blue-300">초기 (ζ = 0.1)</p>
                <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                  HLC 목표 달성에 집중.<br/>
                  LLC가 먼저 비트 예산 맞추는 법을 학습.<br/>
                  성능보다 제약 준수가 우선.
                </p>
              </div>
              <div className="text-2xl text-gray-400 dark:text-gray-600">→</div>
              <div className="flex-1 rounded-lg border border-pink-200 bg-pink-50 px-4 py-3 dark:border-pink-800 dark:bg-pink-900/20">
                <p className="text-xs font-bold text-pink-700 dark:text-pink-300">후기 (ζ = 0.8)</p>
                <p className="mt-1 text-xs text-pink-600 dark:text-pink-400">
                  하드웨어 성능 최적화에 집중.<br/>
                  LLC가 비트 예산 내에서 최선 할당 탐색.<br/>
                  정확도·지연 트레이드오프 세밀 조정.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Visualization ─────────────────────────────────────── */}
      <section id="autoq-viz" className="scroll-mt-20">
        <SectionHeading icon={<Layers className="h-5 w-5" />} title="인터랙티브 시각화: 커널별 분산과 비트 할당" collapsed={!!col['autoq-viz']} onToggle={() => toggle('autoq-viz')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['autoq-viz'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              아래 인터랙티브 시각화로 레이어별 vs 커널별 비트 할당의 차이를 직접 확인하세요.
              커널 위에 마우스를 올리면 분산값과 할당 비트폭을 확인할 수 있습니다.
            </p>
            <KernelVarianceViz />
            <p className="mt-3 text-center text-xs italic text-gray-500 dark:text-gray-400">
              레이어별 모드에서 빨간 테두리=부족, 파란 테두리=과잉 할당 커널을 나타냅니다.
            </p>
          </Card>
        </div>
      </section>

      {/* ── Storage ──────────────────────────────────────────── */}
      <section id="autoq-storage" className="scroll-mt-20">
        <SectionHeading icon={<Database className="h-5 w-5" />} title="저장 공간 오버헤드 분석" collapsed={!!col['autoq-storage']} onToggle={() => toggle('autoq-storage')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['autoq-storage'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="5.1" title="QBN 인덱스: 커널별 비트폭 기록" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              커널별로 다른 비트폭을 사용하면, 각 커널의 비트폭 정보를 어딘가에 저장해야 합니다.
              AutoQ는 <span className="font-semibold text-pink-700 dark:text-pink-300">QBN(Quantization Bitwidth Number) 인덱스</span>를
              커널당 4비트로 저장합니다. 최대 16가지 비트폭 선택지를 구분하기에 충분합니다.
            </p>
            <div className="mb-4 overflow-x-auto rounded-lg bg-pink-50 p-3 dark:bg-pink-900/10">
              <EquationRenderer latex={String.raw`\text{QBN 오버헤드} = \frac{4 \cdot \sum_l c_{out}^{(l)}}{\sum_l c_{out}^{(l)} \cdot c_{in}^{(l)} \cdot k^2 \cdot \bar{b}_l}`} />
            </div>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              분자: 전체 커널 수 × 4비트 인덱스. 분모: 전체 가중치 비트 수. 비율이 매우 작습니다.
            </p>

            <SubSectionHeading number="5.2" title="실제 모델별 오버헤드" />
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-pink-50 dark:bg-pink-900/20">
                    <th className="px-4 py-2 text-left font-bold text-pink-700 dark:text-pink-300">모델</th>
                    <th className="px-4 py-2 text-center font-bold text-pink-700 dark:text-pink-300">총 커널 수</th>
                    <th className="px-4 py-2 text-center font-bold text-pink-700 dark:text-pink-300">QBN 인덱스 크기</th>
                    <th className="px-4 py-2 text-center font-bold text-pink-700 dark:text-pink-300">모델 대비 오버헤드</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { model: 'ResNet-18', kernels: '3,968', qbn: '15.9 KB', overhead: '0.07%' },
                    { model: 'ResNet-50', kernels: '10,240', qbn: '40.9 KB', overhead: '0.05%' },
                    { model: 'MobileNetV2', kernels: '2,816', qbn: '11.3 KB', overhead: '0.11%' },
                  ].map((r, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-2 font-medium text-gray-700 dark:text-gray-300">{r.model}</td>
                      <td className="px-4 py-2 text-center text-gray-600 dark:text-gray-400">{r.kernels}</td>
                      <td className="px-4 py-2 text-center font-mono text-gray-600 dark:text-gray-400">{r.qbn}</td>
                      <td className="px-4 py-2 text-center font-mono font-semibold text-green-600 dark:text-green-400">{r.overhead}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 dark:border-green-800 dark:bg-green-900/20">
              <p className="text-xs font-semibold text-green-700 dark:text-green-300">실용적 의의</p>
              <p className="mt-1 text-xs leading-relaxed text-green-600 dark:text-green-400">
                0.1% 미만의 저장 공간 오버헤드로 커널별 양자화가 가능합니다.
                하드웨어에서는 커널 처리 전 QBN 인덱스를 읽어 해당 비트폭의 양자화 파라미터를 로드하는 방식으로 구현됩니다.
                이는 커널별 양자화를 실제 배포 가능한 수준으로 만드는 핵심 기여입니다.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Key Equations ─────────────────────────────────────── */}
      <section id="autoq-equations" className="scroll-mt-20">
        <SectionHeading icon={<Hash className="h-5 w-5" />} title="핵심 수식 모음" collapsed={!!col['autoq-equations']} onToggle={() => toggle('autoq-equations')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['autoq-equations'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="space-y-3">
              <EqCard idx={1} name="외부 보상 (Extrinsic Reward)" color="pink"
                latex={String.raw`eR_d = \log\!\left(\frac{\text{acc}^{\psi_{\text{acc}}}}{\text{lat}^{\psi_l} \cdot \text{en}^{\psi_e} \cdot \text{area}^{\psi_a}}\right)`}
                description="HLC가 받는 외부 보상. 분자의 acc는 정확도, 분모는 지연(lat), 에너지(en), 면적(area). 각 ψ 파라미터로 상대적 중요도를 조절. 로그 스케일로 서로 다른 크기의 값들을 균형 있게 처리." />

              <EqCard idx={2} name="자원 제약 모드 (Resource-Constrained)" color="rose"
                latex={String.raw`\psi_{\text{acc}} = 1,\;\psi_l = \psi_e = \psi_a = 0 \;\Rightarrow\; eR_d = \log(\text{acc})`}
                description="하드웨어 제약(지연·에너지·면적 상한)이 고정된 경우, 보상은 정확도 로그값만 남습니다. 제약 위반 시 RL 에이전트는 큰 음수 보상을 받아 패널티가 발생합니다. HAQ도 이 모드와 유사한 방식을 사용합니다." />

              <EqCard idx={3} name="내부 보상 (Intrinsic Reward for LLC)" color="pink"
                latex={String.raw`iR_{d,L_i} = (1{-}\zeta)\!\left(-\left\|g_{L_i} c_{out} - \textstyle\sum_j a_{L_i,K_j}\right\|_2\right) + \zeta \sum_j eR_{d,L_i,K_j}`}
                description="LLC가 받는 내부 보상. 첫 항: HLC 목표(g_Li × c_out)와 실제 할당합(Σa)의 차이를 최소화. 둘째 항: 커널별 외부 보상(실제 하드웨어 성능). ζ로 두 목표의 비중을 동적으로 조절." />

              <EqCard idx={4} name="정확도 보장 모드 (Accuracy-Guaranteed)" color="rose"
                latex={String.raw`\psi_{\text{acc}} = 2,\;\psi_l,\psi_e > 0 \;\Rightarrow\; eR_d = \log\!\left(\frac{\text{acc}^2}{\text{lat}^{\psi_l} \cdot \text{en}^{\psi_e}}\right)`}
                description="목표 정확도를 반드시 달성하면서 하드웨어 비용을 최소화하는 모드. acc²으로 정확도에 더 강한 가중치를 부여. 정확도 미달 시 패널티가 매우 크게 작동하여 정확도 하한이 실질적으로 보장됩니다." />
            </div>
          </Card>
        </div>
      </section>

      {/* ── Results ───────────────────────────────────────────── */}
      <section id="autoq-results" className="scroll-mt-20">
        <SectionHeading icon={<BarChart2 className="h-5 w-5" />} title="실험 결과" collapsed={!!col['autoq-results']} onToggle={() => toggle('autoq-results')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['autoq-results'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="7.1" title="시간적 가속기 (Temporal Accelerator) — ResNet-18" />
            <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
              ImageNet Top-1 정확도 69.8% 유지 조건 하에서 지연 시간 비교 ↓ (낮을수록 좋음)
            </p>
            <div className="mb-5 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-400">방법</th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-gray-400">Top-1 (%)</th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-gray-400">지연 시간 (ms)</th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-gray-400">에너지 (mJ)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { m: 'FP32 기준',    acc: '69.8', lat: '1,200+', eng: '—',    hi: false, bad: false },
                    { m: 'HAQ (레이어별)', acc: '69.8', lat: '640+',   eng: '~90',  hi: false, bad: false },
                    { m: 'DDPG (단일 RL)', acc: '69.7', lat: '520',    eng: '72',   hi: false, bad: false },
                    { m: 'AutoQ ★',      acc: '69.9', lat: '286.3',  eng: '44.3', hi: true,  bad: false },
                  ].map((r, i) => (
                    <tr key={i} className={r.hi ? 'bg-pink-50 dark:bg-pink-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}>
                      <td className={`px-3 py-2 font-medium ${r.hi ? 'text-pink-700 dark:text-pink-300' : 'text-gray-700 dark:text-gray-300'}`}>{r.m}</td>
                      <td className={`px-3 py-2 text-center font-mono ${r.hi ? 'font-semibold text-pink-700 dark:text-pink-300' : 'text-gray-600 dark:text-gray-400'}`}>{r.acc}</td>
                      <td className={`px-3 py-2 text-center font-mono font-semibold ${r.hi ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>{r.lat}</td>
                      <td className={`px-3 py-2 text-center font-mono ${r.hi ? 'font-semibold text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>{r.eng}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <SubSectionHeading number="7.2" title="MobileNetV2 및 BitFusion 가속기" />
            <div className="mb-5 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-400">모델 / 가속기</th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-gray-400">방법</th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-gray-400">지연 시간 (ms)</th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-gray-400">감소율</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { model: 'MobileNetV2 / 시간 가속기', method: 'HAQ', lat: '23.9', red: '—' },
                    { model: 'MobileNetV2 / 시간 가속기', method: 'AutoQ ★', lat: '10.2', red: '-57.3%', hi: true },
                    { model: 'ResNet-18 / BitFusion (공간)', method: 'HAQ', lat: '기준', red: '—' },
                    { model: 'ResNet-18 / BitFusion (공간)', method: 'AutoQ ★', lat: '—', red: '-42.2%', hi: true },
                  ].map((r, i) => (
                    <tr key={i} className={(r as { hi?: boolean }).hi ? 'bg-pink-50 dark:bg-pink-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}>
                      <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{r.model}</td>
                      <td className={`px-3 py-2 text-center font-medium ${(r as { hi?: boolean }).hi ? 'text-pink-700 dark:text-pink-300' : 'text-gray-600 dark:text-gray-400'}`}>{r.method}</td>
                      <td className="px-3 py-2 text-center font-mono text-gray-600 dark:text-gray-400">{r.lat}</td>
                      <td className={`px-3 py-2 text-center font-mono font-semibold ${(r as { hi?: boolean }).hi ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-500'}`}>{r.red}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <SubSectionHeading number="7.3" title="수렴 속도" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { title: 'AutoQ (HIRO)', episodes: '200 에피소드', color: 'pink', desc: 'HIRO의 계층 분해로 탐색이 효율화되어 빠른 수렴' },
                { title: 'DDPG (단일 RL)', episodes: '250 에피소드', color: 'gray', desc: '단일 에이전트는 탐색 공간이 커서 수렴 느림' },
                { title: '감소 에피소드', episodes: '-50 에피소드', color: 'green', desc: '20% 빠른 수렴 → 계산 비용 절감' },
              ].map(({ title, episodes, color, desc }) => (
                <div key={title} className={`rounded-lg border p-3 ${color === 'pink' ? 'border-pink-200 bg-pink-50 dark:border-pink-800 dark:bg-pink-900/20' : color === 'green' ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20' : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'}`}>
                  <p className={`text-xs font-bold ${color === 'pink' ? 'text-pink-700 dark:text-pink-300' : color === 'green' ? 'text-green-700 dark:text-green-300' : 'text-gray-700 dark:text-gray-300'}`}>{title}</p>
                  <p className="mt-1 font-mono text-sm font-semibold text-gray-800 dark:text-gray-200">{episodes}</p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-pink-200 bg-pink-50 px-4 py-3 dark:border-pink-800 dark:bg-pink-900/20">
                <p className="text-xs font-semibold text-pink-700 dark:text-pink-300">핵심 관찰 ①: 커널별 vs 레이어별</p>
                <p className="mt-1 text-xs text-pink-600 dark:text-pink-400">
                  ResNet-18에서 HAQ(레이어별) 대비 AutoQ(커널별)가 지연 시간 54%, 에너지 50% 감소 —
                  동일 정확도에서. 커널 단위 세분화가 결정적으로 기여.
                </p>
              </div>
              <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-800 dark:bg-blue-900/20">
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">핵심 관찰 ②: 가속기 일반성</p>
                <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                  시간적 가속기(순차 처리)와 공간적 가속기(BitFusion 병렬 처리) 모두에서 일관된 성능 향상.
                  AutoQ의 보상 함수가 하드웨어 독립적으로 설계된 덕분.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Quiz ─────────────────────────────────────────────── */}
      <section id="autoq-quiz" className="scroll-mt-20">
        <SectionHeading icon={<FlaskConical className="h-5 w-5" />} title="자기 점검 (연구자 수준)" />
        <Card>
          <QuizSection color="pink" questions={[
            {
              q: 'AutoQ가 단일 RL 에이전트 대신 HIRO(계층적 RL)를 사용한 근본적인 이유는 무엇인가?',
              a: '커널별 양자화의 탐색 공간은 7^(Σc_out) ≈ 7^3968 (ResNet-18 기준)으로 단일 DDPG로는 탐색 자체가 불가능합니다. HIRO는 이를 HLC(레이어 목표, L차원 연속 공간)와 LLC(커널 할당, 각 레이어 c_out개)로 분해합니다. HLC가 제약 조건(목표 비트폭)을 제시하면 LLC는 그 안에서 훨씬 작은 공간을 탐색합니다. 결과적으로 200 에피소드(DDPG 250)에 수렴하며 20% 빠른 학습을 보입니다.',
            },
            {
              q: '내부 보상(Intrinsic Reward)과 외부 보상(Extrinsic Reward)의 역할이 어떻게 나뉘는가? 설계 원칙을 설명하라.',
              a: '외부 보상은 HLC가 받으며, 전체 네트워크의 정확도·지연·에너지를 종합 평가합니다 — "최종 성과" 신호입니다. 내부 보상은 LLC가 받으며, (1) HLC가 제시한 목표 비트 예산을 얼마나 정확히 달성했는지(목표 달성 오차)와 (2) 커널별 하드웨어 성능의 두 항으로 구성됩니다. 이 분리 설계의 핵심은 "보상 희소성(reward sparsity)" 해결입니다: 전체 네트워크를 평가한 후에야 보상이 오면 LLC는 신호를 늦게 받습니다. 내부 보상으로 각 레이어 처리 후 즉각 피드백을 주어 학습을 가속합니다.',
            },
            {
              q: 'ζ를 0.1에서 0.8로 동적으로 증가시키는 설계 근거는 무엇인가?',
              a: '훈련 초기(ζ=0.1)에는 LLC가 HLC 목표 달성(비트 예산 준수)에 집중해야 합니다. 목표조차 달성하지 못하는 상태에서 성능 최적화는 무의미하기 때문입니다. LLC가 제약 준수를 학습한 후, ζ를 높여 실제 하드웨어 성능 향상으로 초점을 이동합니다. 이는 커리큘럼 학습(Curriculum Learning)과 유사한 원리로, "쉬운 것 먼저 (목표 달성) → 어려운 것 나중에 (성능 최적화)" 순서로 학습 목표를 점진적으로 강화합니다.',
            },
            {
              q: 'QBN 인덱스(커널당 4비트) 저장이 실용적으로 타당한 이유를 수치로 설명하라.',
              a: 'ResNet-18을 예로 들면: 총 커널 수 Σc_out ≈ 3,968개. 커널당 4비트 인덱스 → 총 3,968 × 4 = 15,872 비트 ≈ 2KB. 모델 전체 가중치 크기(평균 4비트 기준) ≈ 11M 파라미터 × 4비트 = 44Mb ≈ 5.5MB. 따라서 오버헤드 = 2KB / 5.5MB ≈ 0.04% (논문 보고 0.07%는 실제 혼합 비트 기준). 하드웨어에서는 커널 처리 전 4비트 QBN 인덱스를 읽어 해당 스케일·오프셋 파라미터를 선택하는 간단한 MUX 회로로 구현 가능합니다. 이 무시할 수 있는 오버헤드가 커널별 양자화를 실제 배포 가능하게 만듭니다.',
            },
          ]} />
        </Card>
      </section>

    </div>
    </GlossaryText>
  );
}
