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
  Zap,
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
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">{number}</span>
      <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">{title}</h4>
    </div>
  );
}

function EqCard({ idx, name, latex, description, color = 'blue' }: {
  idx: number; name: string; latex: string; description: string; color?: string;
}) {
  const [open, setOpen] = useState(false);
  const colorMap: Record<string, string> = {
    blue:   'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
    amber:  'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
    green:  'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
  };
  const badgeMap: Record<string, string> = {
    blue:   'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    amber:  'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    green:  'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  };
  return (
    <div className="cursor-pointer rounded-xl border border-gray-200 bg-gray-50/50 p-4 transition hover:border-blue-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-700" onClick={() => setOpen(v => !v)}>
      <div className="mb-2 flex items-center gap-2">
        <span className={`rounded px-2 py-0.5 text-xs font-bold ${badgeMap[color] ?? badgeMap.blue}`}>Eq. {idx}</span>
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{name}</span>
        <ChevronDown className={`ml-auto h-4 w-4 text-gray-400 transition-transform dark:text-gray-500 ${open ? 'rotate-180' : ''}`} />
      </div>
      <div className="overflow-x-auto py-2 text-gray-900 dark:text-gray-100"><EquationRenderer latex={latex} /></div>
      {open ? (
        <div className={`mt-3 rounded-lg border px-4 py-3 ${colorMap[color] ?? colorMap.blue}`}>
          <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">{description}</p>
        </div>
      ) : (
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">클릭하여 상세 설명 보기</p>
      )}
    </div>
  );
}

function QuizSection({ questions, color = 'blue' }: { questions: { q: string; a: string }[]; color?: string }) {
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const toggle = (i: number) => setRevealed(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; });
  const bgMap: Record<string, string> = {
    blue: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20',
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
            <div className={`mx-4 mb-4 rounded-lg border px-4 py-3 ${bgMap[color] ?? bgMap.blue}`}>
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

/* ── BlockGranularityViz ─────────────────────────────────────── */

type GranularityKey = 'layer' | 'block' | 'stage' | 'network';

interface GranularityInfo {
  key: GranularityKey;
  label: string;
  sublabel: string;
  icon: string;
  dependency: string;
  generalization: string;
  risk: string;
  tradeoff: string;
  acc: string;
  dotX: number;
  dotY: number;
}

const GRANULARITIES: GranularityInfo[] = [
  {
    key: 'layer',
    label: '레이어',
    sublabel: 'Layer-wise',
    icon: '①',
    dependency: '낮음',
    generalization: '낮음',
    risk: '언더피팅',
    tradeoff: '레이어 단위 재구성은 레이어 간 의존성을 무시합니다. 각 레이어의 양자화 오차가 독립적으로 누적되어 전체 네트워크 출력 복원력이 부족합니다.',
    acc: '74.10%',
    dotX: 12,
    dotY: 15,
  },
  {
    key: 'block',
    label: '블록',
    sublabel: 'Block-wise (최적)',
    icon: '②',
    dependency: '균형',
    generalization: '균형',
    risk: '최적 PTQ',
    tradeoff: 'ResNet의 Residual Block이나 Transformer Block처럼 설계상 독립 단위로 묶인 레이어들을 함께 최적화합니다. 레이어 간 의존성을 충분히 포착하면서 보정 데이터 과적합을 피할 수 있는 최적 균형점입니다.',
    acc: '76.29%',
    dotX: 48,
    dotY: 42,
  },
  {
    key: 'stage',
    label: '스테이지',
    sublabel: 'Stage-wise',
    icon: '③',
    dependency: '높음',
    generalization: '높음',
    risk: '일반화 오차 위험',
    tradeoff: '여러 블록을 묶어 최적화하면 더 넓은 의존성을 포착하지만, 보정 데이터 수가 제한적일 때 일반화 오차가 커집니다. 최적화 공간이 너무 넓어 과적합 위험이 증가합니다.',
    acc: '75.80%',
    dotX: 72,
    dotY: 68,
  },
  {
    key: 'network',
    label: '네트워크',
    sublabel: 'Network-wide',
    icon: '④',
    dependency: '최대',
    generalization: '최대',
    risk: '보정 데이터 과적합',
    tradeoff: '전체 네트워크를 한꺼번에 최적화하면 모든 레이어 간 의존성을 포착할 수 있지만, 보정 데이터(128~1024장)에 심각하게 과적합됩니다. 새로운 입력에서 성능이 크게 떨어집니다.',
    acc: '73.20%',
    dotX: 88,
    dotY: 88,
  },
];

function BlockGranularityViz() {
  const [selected, setSelected] = useState<GranularityKey>('block');
  const sel = GRANULARITIES.find(g => g.key === selected)!;

  return (
    <div className="space-y-4">
      {/* 4-card row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {GRANULARITIES.map(g => {
          const isSelected = g.key === selected;
          return (
            <button
              key={g.key}
              onClick={() => setSelected(g.key)}
              className={`rounded-xl border-2 p-4 text-left transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 shadow-md dark:border-blue-400 dark:bg-blue-900/30'
                  : 'border-gray-200 bg-gray-50 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600'
              }`}
            >
              <div className={`mb-2 flex h-9 w-9 items-center justify-center rounded-full text-base font-bold ${
                isSelected
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
              }`}>
                {g.icon}
              </div>
              <p className={`text-sm font-bold ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}>
                {g.label}
              </p>
              <p className={`text-xs ${isSelected ? 'text-blue-500 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}>
                {g.sublabel}
              </p>
              <div className="mt-2 space-y-0.5">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  의존성: <span className={`font-semibold ${isSelected ? 'text-blue-600 dark:text-blue-400' : ''}`}>{g.dependency}</span>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  일반화: <span className={`font-semibold ${isSelected ? 'text-blue-600 dark:text-blue-400' : ''}`}>{g.generalization}</span>
                </p>
              </div>
              <div className={`mt-2 rounded px-2 py-0.5 text-center text-xs font-bold ${
                g.key === 'block'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                  : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
              }`}>
                {g.acc}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected granularity detail */}
      <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
        <div className="mb-2 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">{sel.icon}</span>
          <p className="text-sm font-bold text-blue-800 dark:text-blue-200">{sel.label} 단위 재구성 — {sel.risk}</p>
        </div>
        <p className="text-xs leading-relaxed text-blue-700 dark:text-blue-300">{sel.tradeoff}</p>
      </div>

      {/* Trade-off diagram (SVG) */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
        <p className="mb-3 text-xs font-bold text-gray-600 dark:text-gray-400">재구성 세분화 수준 vs. 트레이드오프</p>
        <div className="relative mx-auto" style={{ width: '100%', maxWidth: 480, height: 220 }}>
          <svg viewBox="0 0 480 220" className="w-full h-full">
            {/* Axes */}
            <line x1="48" y1="180" x2="440" y2="180" stroke="#9CA3AF" strokeWidth="1.5" />
            <line x1="48" y1="180" x2="48" y2="20" stroke="#9CA3AF" strokeWidth="1.5" />

            {/* Axis labels */}
            <text x="244" y="215" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400" fontSize="10">레이어 간 의존성 포착도 →</text>
            <text x="14" y="100" textAnchor="middle" transform="rotate(-90,14,100)" className="fill-gray-500 dark:fill-gray-400" fontSize="10">일반화 오차 →</text>

            {/* Trade-off curve */}
            <path
              d="M 60 165 C 120 155, 175 120, 220 100 C 265 80, 310 75, 355 85 C 390 92, 415 115, 430 145"
              fill="none"
              stroke="#D1D5DB"
              strokeWidth="2"
              strokeDasharray="6 3"
            />

            {/* Dots for each granularity */}
            {GRANULARITIES.map(g => {
              const cx = 60 + g.dotX * 3.7;
              const cy = 170 - g.dotY * 1.5;
              const isActive = g.key === selected;
              return (
                <g key={g.key}>
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isActive ? 9 : 6}
                    fill={isActive ? '#1D4ED8' : '#9CA3AF'}
                    stroke={isActive ? '#1E40AF' : '#6B7280'}
                    strokeWidth={isActive ? 2 : 1}
                    className="cursor-pointer transition-all"
                    onClick={() => setSelected(g.key)}
                  />
                  <text
                    x={cx}
                    y={cy - 13}
                    textAnchor="middle"
                    fontSize="9"
                    fill={isActive ? '#1D4ED8' : '#6B7280'}
                    fontWeight={isActive ? 'bold' : 'normal'}
                  >
                    {g.label}
                  </text>
                  <text
                    x={cx}
                    y={cy + 3}
                    textAnchor="middle"
                    fontSize="7"
                    fill={isActive ? 'white' : '#E5E7EB'}
                    fontWeight="bold"
                  >
                    {g.icon}
                  </text>
                </g>
              );
            })}

            {/* Optimal zone indicator */}
            <rect x="160" y="82" width="100" height="44" rx="6" fill="#EFF6FF" stroke="#93C5FD" strokeWidth="1.5" fillOpacity="0.6" />
            <text x="210" y="100" textAnchor="middle" fontSize="8" fill="#1D4ED8" fontWeight="bold">최적 균형점</text>
            <text x="210" y="115" textAnchor="middle" fontSize="7" fill="#3B82F6">(블록 단위)</text>
          </svg>
        </div>
        <p className="mt-2 text-center text-xs italic text-gray-500 dark:text-gray-400">
          ResNet-50 INT4 Top-1 정확도: 레이어 74.10% / 블록 76.29% / 스테이지 75.80% / 네트워크 73.20%
        </p>
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────── */

export default function BRECQStudyFull() {
  const [col, setCol] = useState<Record<string, boolean>>({});
  const toggle = useCallback((id: string) => setCol(c => ({ ...c, [id]: !c[id] })), []);

  return (
    <GlossaryText>
    <div className="space-y-6">

      {/* ── Overview ─────────────────────────────────────────── */}
      <section id="brecq-overview" className="scroll-mt-20">
        <div className="overflow-hidden rounded-xl shadow-sm">
          <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-600 p-6 pb-8">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">ICLR 2021</span>
              <span className="rounded-full bg-yellow-400/90 px-3 py-1 text-xs font-bold text-yellow-900">최초 INT2 PTQ</span>
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">arXiv 2102.05426</span>
            </div>
            <h2 className="text-xl font-bold leading-snug text-white sm:text-2xl">
              BRECQ: Pushing the Limit of Post-Training Quantization by Block Reconstruction
            </h2>
            <p className="mt-3 text-sm text-blue-200">
              Yuhang Li et al. (Nanyang Technological University) · ICLR 2021
            </p>
          </div>
          <div className="bg-white p-6 dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
            <p className="leading-relaxed text-gray-700 dark:text-gray-300">
              <span className="font-semibold text-blue-700 dark:text-blue-300">블록 재구성(Block Reconstruction)</span>을 통해 재학습(retraining) 없이 INT2 양자화를 처음으로 달성한 PTQ 프레임워크.
              핵심 아이디어: 2차 테일러 전개를 기반으로 양자화 손실을 분석하고, 레이어보다 크고 네트워크보다 작은 블록 단위로 출력 오차를 최소화함으로써
              레이어 간 의존성 포착과 보정 데이터 일반화 오차 사이의 최적 균형점을 찾아냅니다.
            </p>
            <p className="mt-3 leading-relaxed text-gray-700 dark:text-gray-300">
              Fisher 정보 대각 근사로 Hessian을 효율적으로 계산하고, 유전 알고리즘으로 혼합 정밀도(Mixed Precision) 비트 배정을 자동화합니다.
              ResNet-50 W4에서 <span className="font-semibold text-blue-700 dark:text-blue-300">76.29% (QAT 76.31% 대비 0.02% 차이)</span>,
              ResNet-18 W2에서 66.30%를 달성합니다.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {['블록 재구성', 'Fisher 정보 근사', 'INT2 PTQ', '혼합 정밀도', '2차 테일러 전개'].map(tag => (
                <span key={tag} className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Background ────────────────────────────────────────── */}
      <section id="brecq-background" className="scroll-mt-20">
        <SectionHeading icon={<BrainCircuit className="h-5 w-5" />} title="배경: PTQ vs QAT, 그리고 INT4의 벽" collapsed={!!col['brecq-background']} onToggle={() => toggle('brecq-background')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['brecq-background'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="1.1" title="PTQ vs QAT 비교" />
            <div className="mb-5 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">항목</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">PTQ (Post-Training)</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">QAT (Quantization-Aware)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { item: '학습 데이터 필요', ptq: '불필요 (보정 데이터 소량)', qat: '전체 학습 데이터 필요' },
                    { item: '학습 시간', ptq: '수 분~수 시간', qat: '수 일~수 주 (FP32 대비)' },
                    { item: 'GPU 메모리', ptq: '소량', qat: 'FP32 학습과 동일' },
                    { item: 'INT4 성능', ptq: '기존: FP32 대비 1~2% 하락', qat: 'FP32 수준 유지 가능' },
                    { item: 'INT2 성능', ptq: 'BRECQ 이전: 불가능', qat: '가능하나 매우 어려움' },
                    { item: '데이터 프라이버시', ptq: '유리 (보정 데이터 소량)', qat: '전체 학습 데이터 노출' },
                  ].map((r, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">{r.item}</td>
                      <td className="px-3 py-2 text-center text-blue-600 dark:text-blue-400">{r.ptq}</td>
                      <td className="px-3 py-2 text-center text-gray-500 dark:text-gray-400">{r.qat}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <SubSectionHeading number="1.2" title="INT4가 어려운 이유와 BRECQ의 목표" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              4비트 균일 양자화는 16개 레벨에 불과합니다. 2비트(4 레벨)로 가면 표현 공간이
              <span className="font-mono font-bold text-red-600 dark:text-red-400"> 4배 </span>
              더 줄어듭니다. 레이어 단위 재구성(layer-wise reconstruction)만으로는 레이어 간 양자화 오차가 누적되는 문제를 해결할 수 없습니다.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-900/10">
                <p className="mb-1 text-xs font-bold text-red-700 dark:text-red-300">기존 PTQ의 문제</p>
                <p className="text-xs text-red-600 dark:text-red-400">
                  레이어별 독립 최적화<br/>
                  → 레이어 간 오차 상관관계 무시<br/>
                  → INT2에서 성능 붕괴<br/>
                  → 전체 네트워크 최적화는 과적합
                </p>
              </div>
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/40 dark:bg-blue-900/10">
                <p className="mb-1 text-xs font-bold text-blue-700 dark:text-blue-300">BRECQ의 해법</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  블록 단위 출력 오차 최소화<br/>
                  → 레이어 간 의존성 포착<br/>
                  → 2차 테일러 + Fisher 근사<br/>
                  → INT2 PTQ 최초 달성
                </p>
              </div>
            </div>

            <div className="mt-5">
              <SubSectionHeading number="1.3" title="기존 PTQ 방법 비교" />
              <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                <table className="w-full text-xs">
                  <thead><tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">방법</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">재구성 단위</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">Hessian 활용</th>
                    <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">한계</th>
                  </tr></thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {[
                      { m: 'PTQ (기본 RTN)', u: '없음', h: 'X', lim: '레이어 간 오차 누적 완전 무시' },
                      { m: 'ACIQ', u: '레이어', h: '△ (분석적)', lim: '클리핑 범위만 최적화, INT4 이하 불가' },
                      { m: 'AdaQuant', u: '레이어', h: 'X', lim: '독립 레이어 최적화, 의존성 무시' },
                      { m: 'GPTQ', u: '레이어 (행 단위)', h: 'O (Hessian)', lim: '언어 모델 특화, 비전 모델 INT2 미달성' },
                      { m: 'BRECQ ★', u: '블록', h: 'O (Fisher 근사)', lim: '(최신) INT2 PTQ 최초 달성' },
                    ].map((r, i) => (
                      <tr key={i} className={i === 4 ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}>
                        <td className={`px-3 py-2 font-medium ${i === 4 ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}>{r.m}</td>
                        <td className="px-3 py-2 text-center text-gray-500 dark:text-gray-400">{r.u}</td>
                        <td className="px-3 py-2 text-center text-gray-500 dark:text-gray-400">{r.h}</td>
                        <td className="px-3 py-2 text-gray-500 dark:text-gray-400">{r.lim}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Theory ────────────────────────────────────────────── */}
      <section id="brecq-theory" className="scroll-mt-20">
        <SectionHeading icon={<GraduationCap className="h-5 w-5" />} title="이론적 분석 (2차 테일러 전개 & 재구성 세분화)" collapsed={!!col['brecq-theory']} onToggle={() => toggle('brecq-theory')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['brecq-theory'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="2.1" title="양자화 손실의 2차 테일러 전개" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              가중치 w에서 양자화된 가중치 w + Δw로 이동할 때의 손실 변화를 테일러 전개합니다:
            </p>
            <div className="mb-4 overflow-x-auto rounded-lg bg-blue-50 p-3 dark:bg-blue-900/10">
              <EquationRenderer latex={String.raw`\mathbb{E}[L(w + \Delta w)] - \mathbb{E}[L(w)] \;\approx\; \Delta w^\top \bar{g}(w) + \frac{1}{2}\Delta w^\top \bar{H}(w) \Delta w`} />
            </div>
            <p className="mb-4 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              여기서 g̅(w)는 기댓값 그래디언트, H̄(w)는 기댓값 Hessian입니다.
              사전학습 완료 모델에서는 <span className="font-semibold text-blue-700 dark:text-blue-300">g̅(w) ≈ 0</span>이므로
              (수렴점에서 그래디언트 소실), 손실 변화는 2차 항이 지배합니다.
            </p>

            <SubSectionHeading number="2.2" title="그래디언트가 0인 이유: 사전학습 수렴 가정" />
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-900/20">
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">핵심 가정</p>
              <p className="mt-1 text-xs leading-relaxed text-amber-600 dark:text-amber-400">
                PTQ는 이미 충분히 학습된(수렴한) 모델에 적용합니다. 수렴점에서는 1차 최적성 조건인 ∇L(w) = 0이 성립합니다(정확히는 기댓값 그래디언트).
                따라서 테일러 전개의 1차 항이 사라지고, 손실 변화를 결정하는 것은 Hessian H̄과 가중치 변화 Δw의 2차 형식입니다.
                이것이 BRECQ가 Hessian 정보를 중심에 두는 이론적 근거입니다.
              </p>
            </div>

            <SubSectionHeading number="2.3" title="4가지 재구성 세분화 수준과 이론적 분석" />
            <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
              양자화 손실은 다음 두 항으로 분해됩니다:
            </p>
            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900/40 dark:bg-red-900/10">
                <p className="mb-1 text-xs font-bold text-red-700 dark:text-red-300">레이어 간 의존성 오차</p>
                <p className="text-xs text-red-600 dark:text-red-400">
                  블록 내 레이어들의 양자화 오차가 서로 영향을 미치는 정도.
                  재구성 단위가 클수록 이 항이 작아집니다(의존성 포착).
                </p>
              </div>
              <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 dark:border-orange-900/40 dark:bg-orange-900/10">
                <p className="mb-1 text-xs font-bold text-orange-700 dark:text-orange-300">일반화 오차</p>
                <p className="text-xs text-orange-600 dark:text-orange-400">
                  보정 데이터(calibration data)에 과적합되는 정도.
                  재구성 단위가 클수록 최적화 공간이 커져 이 항이 커집니다.
                </p>
              </div>
            </div>
            <div className="space-y-2">
              {[
                { g: '레이어 단위', dep: '높음 (의존성 무시)', gen: '낮음', verdict: '언더피팅: 레이어 간 오차 상관관계 미반영', color: 'red' },
                { g: '블록 단위 (BRECQ)', dep: '균형 (의존성 포착)', gen: '균형', verdict: '최적: 두 오차의 합이 최소', color: 'blue' },
                { g: '스테이지 단위', dep: '낮음', gen: '높음 (과적합 위험)', verdict: '일반화 오차 증가 시작', color: 'orange' },
                { g: '전체 네트워크', dep: '없음', gen: '매우 높음', verdict: '보정 데이터에 심각한 과적합', color: 'red' },
              ].map(({ g, dep, gen, verdict, color }) => (
                <div key={g} className={`flex items-start gap-3 rounded-lg border p-3 ${
                  color === 'blue'
                    ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'
                    : color === 'orange'
                    ? 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20'
                    : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                }`}>
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-bold ${color === 'blue' ? 'text-blue-700 dark:text-blue-300' : color === 'orange' ? 'text-orange-700 dark:text-orange-300' : 'text-red-700 dark:text-red-300'}`}>{g}</p>
                    <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">의존성 포착: {dep} | 일반화 오차: {gen}</p>
                    <p className={`mt-0.5 text-xs ${color === 'blue' ? 'text-blue-600 dark:text-blue-400' : color === 'orange' ? 'text-orange-600 dark:text-orange-400' : 'text-red-600 dark:text-red-400'}`}>{verdict}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* ── Visualization ─────────────────────────────────────── */}
      <section id="brecq-viz" className="scroll-mt-20">
        <SectionHeading icon={<Layers className="h-5 w-5" />} title="인터랙티브: 재구성 세분화 비교" collapsed={!!col['brecq-viz']} onToggle={() => toggle('brecq-viz')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['brecq-viz'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              각 카드를 클릭하여 재구성 세분화 수준별 트레이드오프를 확인하세요.
            </p>
            <BlockGranularityViz />
          </Card>
        </div>
      </section>

      {/* ── Fisher Information ────────────────────────────────── */}
      <section id="brecq-fisher" className="scroll-mt-20">
        <SectionHeading icon={<Cpu className="h-5 w-5" />} title="Fisher 정보 근사 & 혼합 정밀도" collapsed={!!col['brecq-fisher']} onToggle={() => toggle('brecq-fisher')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['brecq-fisher'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="4.1" title="Hessian을 Fisher 정보로 근사하는 이유" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              블록 단위 최적화에서 Hessian H(z^(ℓ))을 직접 계산하면 출력 차원 d에 대해 O(d²) 공간이 필요합니다.
              ResNet 블록의 d ~ 수천이면 GB 단위 메모리가 필요합니다. BRECQ는 이를 Fisher 정보 대각 근사로 해결합니다:
            </p>
            <div className="mb-4 overflow-x-auto rounded-lg bg-blue-50 p-3 dark:bg-blue-900/10">
              <EquationRenderer latex={String.raw`H_i \;\approx\; \mathbb{E}\!\left[\left(\frac{\partial L}{\partial z_i}\right)^{\!2}\right]`} />
            </div>
            <div className="mb-5 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-800 dark:bg-blue-900/20">
              <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">왜 그래디언트 제곱이 감도(sensitivity)인가?</p>
              <p className="mt-1 text-xs leading-relaxed text-blue-600 dark:text-blue-400">
                Fisher 정보 행렬 F = E[(∂ log p(x|θ)/∂θ)(∂ log p(x|θ)/∂θ)^T]. 손실 L이 negative log-likelihood이면 F = E[(∂L/∂θ)(∂L/∂θ)^T]가 Hessian의 기댓값과 일치합니다(Bartlett 항등식).
                대각 근사 F_ii = E[(∂L/∂z_i)²]는 i번째 출력 뉴런이 최종 손실에 얼마나 민감한지를 측정합니다.
                백프롭으로 한 번의 순전파 + 역전파로 계산 가능하므로 계산 비용이 O(d)에 불과합니다.
              </p>
            </div>

            <SubSectionHeading number="4.2" title="효율적 계산 파이프라인" />
            <div className="space-y-2">
              {[
                { step: '①', text: '보정 데이터(1024장) 순전파 → 블록 출력 z^(ℓ) 저장' },
                { step: '②', text: '역전파로 ∂L/∂z_i 계산 (전체 네트워크 그래디언트)' },
                { step: '③', text: 'Fisher 대각: F_i = E[(∂L/∂z_i)²] — 보정 데이터 평균' },
                { step: '④', text: 'F_i를 Hessian 대각 원소로 사용하여 블록 재구성 손실 구성' },
                { step: '⑤', text: '양자화 파라미터(scale, zero-point) Adam 최적화로 갱신' },
              ].map(({ step, text }) => (
                <div key={step} className="flex gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">{step}</span>
                  <p className="text-xs text-gray-700 dark:text-gray-300">{text}</p>
                </div>
              ))}
            </div>

            <div className="mt-5">
              <SubSectionHeading number="4.3" title="유전 알고리즘 기반 혼합 정밀도 탐색" />
              <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
                Fisher 감도를 블록별 비트 배정의 우선순위로 활용합니다. 비트폭 조합 c ∈ {'{2, 4, 8}'}^n의 탐색 공간이 기하급수적이므로
                유전 알고리즘(Genetic Algorithm)으로 효율적 탐색을 수행합니다:
              </p>
              <div className="mb-4 overflow-x-auto rounded-lg bg-purple-50 p-3 dark:bg-purple-900/10">
                <EquationRenderer latex={String.raw`\min_{\mathbf{c}} L(\hat{w}, \mathbf{c}) \;\text{ s.t. } H(\mathbf{c}) \leq \delta, \; \mathbf{c} \in \{2,4,8\}^n`} />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  { t: '초기화', d: '랜덤 비트 배정 집단 생성 (하드웨어 제약 δ 만족)' },
                  { t: '적합도 평가', d: 'Fisher 감도 기반 추정 손실로 각 개체 평가' },
                  { t: '선택·교차·변이', d: '우수 개체 선택 후 교차·변이로 새 집단 생성, 수렴까지 반복' },
                ].map(({ t, d }) => (
                  <div key={t} className="rounded-lg border border-purple-200 bg-purple-50 p-3 dark:border-purple-800 dark:bg-purple-900/20">
                    <p className="text-xs font-bold text-purple-700 dark:text-purple-300">{t}</p>
                    <p className="mt-0.5 text-xs text-purple-600 dark:text-purple-400">{d}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                비트 배정 감도가 높은 블록(Fisher 값 큰 곳)은 자동으로 높은 비트(8비트)를, 감도 낮은 블록은 낮은 비트(2비트)를 할당받습니다.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Key Equations ─────────────────────────────────────── */}
      <section id="brecq-equations" className="scroll-mt-20">
        <SectionHeading icon={<Hash className="h-5 w-5" />} title="핵심 수식 모음" collapsed={!!col['brecq-equations']} onToggle={() => toggle('brecq-equations')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['brecq-equations'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="space-y-3">
              <EqCard idx={1} name="양자화 손실 2차 테일러 전개" color="blue"
                latex={String.raw`\mathbb{E}[L(w + \Delta w)] - \mathbb{E}[L(w)] \;\approx\; \Delta w^\top \bar{g}(w) + \frac{1}{2}\Delta w^\top \bar{H}(w)\,\Delta w`}
                description="양자화로 인한 가중치 변화 Δw = ŵ - w에 의한 손실 증가를 2차 전개로 근사합니다. 사전학습 수렴점에서 g̅(w) ≈ 0이므로 Hessian 2차 항이 지배적이 됩니다. 이것이 BRECQ가 Hessian(또는 그 근사)을 최적화 기준으로 삼는 이론적 근거입니다." />

              <EqCard idx={2} name="블록 재구성 최적화 목적 함수" color="blue"
                latex={String.raw`\min_{\Delta\tilde{\theta}} \;\mathbb{E}\!\left[\Delta z^{(\ell)\top} H(z^{(\ell)})\,\Delta z^{(\ell)}\right]`}
                description="ℓ번째 블록의 양자화된 가중치 변화 Δθ̃로 인한 블록 출력 변화 Δz^(ℓ)를 Hessian H(z^(ℓ))로 가중한 오차를 최소화합니다. 레이어 단위가 아닌 블록 단위이므로 블록 내 레이어 간 의존성이 자동으로 포착됩니다." />

              <EqCard idx={3} name="Fisher 정보 대각 근사" color="purple"
                latex={String.raw`\min_{\hat{w}} \;\mathbb{E}\!\left[\Delta z^{(\ell)\top} \operatorname{diag}\!\left(\!\left(\frac{\partial L}{\partial z_1}\right)^{\!2},\!\ldots,\!\left(\frac{\partial L}{\partial z_d}\right)^{\!2}\right) \Delta z^{(\ell)}\right]`}
                description="Hessian H(z^(ℓ))를 Fisher 정보 대각 행렬로 근사합니다. i번째 원소는 E[(∂L/∂z_i)²]로, 해당 뉴런의 출력이 최종 손실에 얼마나 민감한지를 나타냅니다. 완전 Hessian 대비 O(d²) → O(d)로 메모리가 줄어 실용적인 대규모 모델 적용이 가능합니다." />

              <EqCard idx={4} name="혼합 정밀도 최적화" color="amber"
                latex={String.raw`\min_{\mathbf{c}} L(\hat{w}, \mathbf{c}) \;\text{ s.t. } H(\mathbf{c}) \leq \delta,\; \mathbf{c} \in \{2,4,8\}^n`}
                description="n개 블록의 비트폭 조합 c ∈ {2,4,8}^n을 하드웨어 제약 H(c) ≤ δ (예: 모델 크기 또는 Bit-Operations) 하에서 최적화합니다. 탐색 공간이 3^n이므로 유전 알고리즘으로 효율적으로 해결합니다. Fisher 감도를 적합도 함수로 활용해 탐색을 가이드합니다." />
            </div>
          </Card>
        </div>
      </section>

      {/* ── Results ───────────────────────────────────────────── */}
      <section id="brecq-results" className="scroll-mt-20">
        <SectionHeading icon={<BarChart2 className="h-5 w-5" />} title="실험 결과" collapsed={!!col['brecq-results']} onToggle={() => toggle('brecq-results')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['brecq-results'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="5.1" title="ImageNet Top-1 정확도 비교 (↑ 높을수록 좋음)" />
            <div className="mb-4 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-400">방법</th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-gray-400">비트 (W/A)</th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-gray-400">ResNet-18</th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-gray-400">ResNet-50</th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-gray-400">MobileNetV2</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { m: 'FP32 기준',        b: '32/32', r18: '71.08%', r50: '76.63%', mv2: '72.19%', hi: false, ref: true },
                    { m: 'QAT (참고)',        b: '4/4',   r18: '71.61%', r50: '76.31%', mv2: '71.90%', hi: false, ref: true },
                    { m: 'ACIQ',             b: '4/4',   r18: '70.13%', r50: '74.22%', mv2: '—',       hi: false, ref: false },
                    { m: 'AdaQuant',         b: '4/4',   r18: '70.27%', r50: '74.56%', mv2: '—',       hi: false, ref: false },
                    { m: 'BRECQ ★',          b: '4/32',  r18: '71.56%', r50: '76.29%', mv2: '72.44%', hi: true,  ref: false },
                    { m: 'BRECQ ★',          b: '4/4',   r18: '70.70%', r50: '75.05%', mv2: '69.36%', hi: true,  ref: false },
                    { m: 'QAT (참고)',        b: '2/32',  r18: '68.02%', r50: '76.28%', mv2: '—',       hi: false, ref: true },
                    { m: 'BRECQ ★',          b: '2/32',  r18: '66.30%', r50: '72.42%', mv2: '59.55%', hi: true,  ref: false },
                  ].map((r, i) => (
                    <tr key={i} className={r.hi ? 'bg-blue-50 dark:bg-blue-900/20' : r.ref ? 'bg-gray-50/50 dark:bg-gray-800/30' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}>
                      <td className={`px-3 py-2 font-medium ${r.hi ? 'text-blue-700 dark:text-blue-300' : r.ref ? 'text-gray-400 dark:text-gray-500 italic' : 'text-gray-700 dark:text-gray-300'}`}>{r.m}</td>
                      <td className="px-3 py-2 text-center font-mono text-gray-500 dark:text-gray-400">{r.b}</td>
                      {[r.r18, r.r50, r.mv2].map((v, j) => (
                        <td key={j} className={`px-3 py-2 text-center font-mono font-semibold ${r.hi ? 'text-blue-700 dark:text-blue-300' : r.ref ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-400'}`}>{v}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-800 dark:bg-blue-900/20">
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">핵심 관찰 ① ResNet-50 W4</p>
                <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                  BRECQ 76.29% vs QAT 76.31%: 단 0.02% 차이. 재학습 없이 QAT와 사실상 동등한 성능 달성.
                  QAT 대비 학습 시간 <span className="font-bold">240배 빠름</span>.
                </p>
              </div>
              <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 dark:border-green-800 dark:bg-green-900/20">
                <p className="text-xs font-semibold text-green-700 dark:text-green-300">핵심 관찰 ② ResNet-18 W2</p>
                <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                  BRECQ 66.30%: PTQ에서 처음으로 달성한 INT2 비전 모델 성능.
                  기존 PTQ 방법들은 INT2에서 사실상 발산하거나 기준치를 크게 하회합니다.
                </p>
              </div>
            </div>

            <div className="mt-4">
              <SubSectionHeading number="5.2" title="블록 단위 재구성 효과 (Ablation: ResNet-50 INT4)" />
              <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                <table className="w-full text-xs">
                  <thead><tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">재구성 단위</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">Top-1 정확도</th>
                    <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">비고</th>
                  </tr></thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {[
                      { u: '레이어 (Layer)',   acc: '74.10%', note: '레이어 간 의존성 미포착, 언더피팅' },
                      { u: '블록 (Block) ★',  acc: '76.29%', note: '최적 균형점, BRECQ의 핵심 선택' },
                      { u: '스테이지 (Stage)', acc: '75.80%', note: '일반화 오차 증가 시작' },
                      { u: '네트워크 전체',   acc: '73.20%', note: '보정 데이터 과적합, 최악 성능' },
                    ].map((r, i) => (
                      <tr key={i} className={i === 1 ? 'bg-blue-50 dark:bg-blue-900/20' : ''}>
                        <td className={`px-3 py-2 font-medium ${i === 1 ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}>{r.u}</td>
                        <td className={`px-3 py-2 text-center font-mono font-semibold ${i === 1 ? 'text-blue-700 dark:text-blue-300' : i === 3 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>{r.acc}</td>
                        <td className="px-3 py-2 text-gray-500 dark:text-gray-400">{r.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Quiz ─────────────────────────────────────────────── */}
      <section id="brecq-quiz" className="scroll-mt-20">
        <SectionHeading icon={<FlaskConical className="h-5 w-5" />} title="자기 점검 (연구자 수준)" />
        <Card>
          <QuizSection color="blue" questions={[
            {
              q: 'PTQ에서 그래디언트가 0에 가깝다는 가정이 왜 성립하며, 이것이 BRECQ 이론에서 어떤 역할을 하는가?',
              a: 'PTQ는 이미 수렴한(사전학습 완료된) 모델에 적용합니다. 경사 하강법이 수렴했다면 1차 최적성 조건 E[∇L(w)] ≈ 0이 성립합니다(정확히는 기댓값 그래디언트, 미니배치 노이즈로 정확히 0은 아니지만 충분히 작음). 테일러 전개에서 g̅(w) ≈ 0이면 1차 항이 소멸하고 2차 항 (1/2)Δw^T H̄ Δw만 남습니다. 이 덕분에 BRECQ는 "Hessian 2차 항을 최소화 = 양자화 손실 최소화"라는 이론적으로 깔끔한 목적 함수를 도출할 수 있습니다. 만약 파인튜닝 중인 모델처럼 g̅ ≠ 0이면 1차 항도 고려해야 하므로 이 단순화가 성립하지 않습니다.',
            },
            {
              q: '왜 블록 단위 재구성이 레이어 단위나 네트워크 전체보다 우수한가? 이론적 이유와 실험적 근거를 함께 설명하라.',
              a: '이론적으로: 양자화 손실은 "레이어 간 의존성 포착 오차"와 "일반화 오차"의 합으로 분해됩니다. 레이어 단위는 의존성을 무시해 첫 번째 항이 크고, 네트워크 전체는 보정 데이터(수백~천 장)에 과적합돼 두 번째 항이 커집니다. 블록 단위는 ResNet의 Residual Block처럼 설계상 독립 단위를 기준으로 최적화하므로 두 오차 모두 균형을 이룹니다. 실험적으로: ResNet-50 INT4에서 레이어 74.10%, 블록 76.29%, 스테이지 75.80%, 전체 네트워크 73.20%로 블록이 명확히 최고 성능을 보입니다.',
            },
            {
              q: 'Fisher 정보 대각 근사가 전체 Hessian 대비 어떤 한계가 있으며, BRECQ에서 이 근사가 그럼에도 잘 작동하는 이유는?',
              a: '한계: (1) 비대각 원소(off-diagonal) 무시 → 출력 뉴런 간 상관관계 미반영. (2) Fisher = Hessian 동치는 손실이 negative log-likelihood일 때만 정확 (cross-entropy 등). (3) 대각 근사는 뉴런 간 양자화 오차 상호작용을 포착 못함. 그럼에도 잘 작동하는 이유: (1) PTQ에서의 목표는 "절대 최적"이 아닌 "충분히 좋은" 양자화이며, 대각 근사도 중요한 뉴런(큰 Fisher 값)을 잘 식별합니다. (2) 블록 단위 재구성이 이미 공간 내 최적화를 수행하므로 Hessian 근사 오차를 일부 보상합니다. (3) 실제로 대부분의 신경망에서 Hessian이 대각 지배적(diagonally dominant)이어서 비대각 항 무시의 영향이 작습니다.',
            },
            {
              q: 'BRECQ를 트랜스포머 모델(BERT, ViT 등)에 적용할 때 예상되는 어려움과 연구 방향은?',
              a: '어려움: (1) 트랜스포머 블록은 Multi-head Attention + FFN으로 구성되며, Attention의 softmax가 비선형 상호작용을 만들어 2차 테일러 근사의 정확도가 떨어질 수 있습니다. (2) KV 캐시의 동적 활성화 값이 입력에 따라 크게 변동해 보정 데이터 의존성이 높아집니다. (3) LLM은 파라미터 수가 수십억이어서 Fisher 계산 비용도 증가합니다. (4) 트랜스포머의 Attention 가중치 행렬은 특이값이 급격히 감소하는 low-rank 구조로 coherent하여 균일 양자화에 불리합니다. 연구 방향: (1) Attention 특화 블록 정의 (예: Head 단위), (2) GPTQ/QuIP처럼 Hessian 기반 순차 양자화와 결합, (3) SmoothQuant처럼 활성화 이상치 사전 처리 후 BRECQ 적용.',
            },
          ]} />
        </Card>
      </section>

    </div>
    </GlossaryText>
  );
}
