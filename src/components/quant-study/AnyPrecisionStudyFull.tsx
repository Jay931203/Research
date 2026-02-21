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
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">{number}</span>
      <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">{title}</h4>
    </div>
  );
}

function EqCard({ idx, name, latex, description, color = 'emerald' }: {
  idx: number; name: string; latex: string; description: string; color?: string;
}) {
  const [open, setOpen] = useState(false);
  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
    green:   'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    teal:    'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800',
    amber:   'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
  };
  const badgeMap: Record<string, string> = {
    emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    green:   'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    teal:    'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
    amber:   'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  };
  return (
    <div className="cursor-pointer rounded-xl border border-gray-200 bg-gray-50/50 p-4 transition hover:border-emerald-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-emerald-700" onClick={() => setOpen(v => !v)}>
      <div className="mb-2 flex items-center gap-2">
        <span className={`rounded px-2 py-0.5 text-xs font-bold ${badgeMap[color] ?? badgeMap.emerald}`}>Eq. {idx}</span>
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{name}</span>
        <ChevronDown className={`ml-auto h-4 w-4 text-gray-400 transition-transform dark:text-gray-500 ${open ? 'rotate-180' : ''}`} />
      </div>
      <div className="overflow-x-auto py-2 text-gray-900 dark:text-gray-100"><EquationRenderer latex={latex} /></div>
      {open ? (
        <div className={`mt-3 rounded-lg border px-4 py-3 ${colorMap[color] ?? colorMap.emerald}`}>
          <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">{description}</p>
        </div>
      ) : (
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">클릭하여 상세 설명 보기</p>
      )}
    </div>
  );
}

function QuizSection({ questions, color = 'emerald' }: { questions: { q: string; a: string }[]; color?: string }) {
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const toggle = (i: number) => setRevealed(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; });
  const bgMap: Record<string, string> = {
    emerald: 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20',
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
            <div className={`mx-4 mb-4 rounded-lg border px-4 py-3 ${bgMap[color] ?? bgMap.emerald}`}>
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                <span className="mr-1 font-bold text-emerald-600 dark:text-emerald-400">A:</span>{a}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── BitTruncationViz ─────────────────────────────────────────── */

const AP_DATA: Record<number, { ap: number; dedicated: number }> = {
  1: { ap: 63.18, dedicated: 61.08 },
  2: { ap: 67.5,  dedicated: 65.2  },
  3: { ap: 71.3,  dedicated: 70.1  },
  4: { ap: 74.75, dedicated: 71.24 },
  5: { ap: 75.1,  dedicated: 74.5  },
  6: { ap: 75.2,  dedicated: 75.0  },
  7: { ap: 75.2,  dedicated: 75.0  },
  8: { ap: 74.91, dedicated: 74.71 },
};

function BitTruncationViz() {
  const [bits, setBits] = useState(4);

  const data = AP_DATA[bits];
  const diff = (data.ap - data.dedicated).toFixed(2);
  const diffPositive = data.ap >= data.dedicated;

  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-5 dark:border-emerald-900/40 dark:bg-emerald-900/10">
      <p className="mb-4 text-sm font-bold text-emerald-800 dark:text-emerald-200">비트 정밀도 선택 (8비트 저장, 상위 N비트만 사용)</p>

      {/* Bit selector */}
      <div className="mb-5 flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8].map(b => (
          <button
            key={b}
            onClick={() => setBits(b)}
            className={`h-9 w-9 rounded-lg text-sm font-bold transition-all ${
              bits === b
                ? 'bg-emerald-700 text-white shadow-md scale-110'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-emerald-400 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
            }`}
          >
            {b}
          </button>
        ))}
        <span className="flex items-center text-xs text-gray-500 dark:text-gray-400 ml-1">비트</span>
      </div>

      {/* 8-bit storage visualization */}
      <div className="mb-5">
        <p className="mb-2 text-xs font-semibold text-gray-600 dark:text-gray-400">8비트 정수 저장 구조 (MSB → LSB)</p>
        <div className="flex items-center gap-1">
          {Array.from({ length: 8 }, (_, i) => {
            const bitPosition = 8 - i; // 8 down to 1
            const isActive = bitPosition > (8 - bits);
            return (
              <div key={i} className="flex flex-col items-center gap-1 flex-1">
                <svg width="100%" viewBox="0 0 40 48" className="overflow-visible">
                  <rect
                    x="2" y="2" width="36" height="36" rx="4"
                    fill={isActive ? '#047857' : '#d1d5db'}
                    stroke={isActive ? '#065f46' : '#9ca3af'}
                    strokeWidth="1.5"
                    className="transition-all duration-300"
                  />
                  <text
                    x="20" y="24"
                    textAnchor="middle" dominantBaseline="middle"
                    fontSize="13" fontWeight="bold"
                    fill={isActive ? '#ffffff' : '#6b7280'}
                  >
                    {isActive ? '1' : '0'}
                  </text>
                  {!isActive && (
                    <>
                      <line x1="4" y1="4" x2="38" y2="38" stroke="#9ca3af" strokeWidth="1.5" />
                      <line x1="38" y1="4" x2="4" y2="38" stroke="#9ca3af" strokeWidth="1.5" />
                    </>
                  )}
                </svg>
                <span className={`text-xs font-mono ${isActive ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-400'}`}>
                  b{bitPosition}
                </span>
              </div>
            );
          })}
        </div>
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded bg-emerald-700"></span>
            <span className="text-emerald-700 dark:text-emerald-300 font-semibold">상위 {bits}비트 사용 (정밀도)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded bg-gray-300"></span>
            <span className="text-gray-500 dark:text-gray-400">하위 {8 - bits}비트 잘라냄 (추론 시 무시)</span>
          </span>
        </div>
        <p className="mt-2 text-xs italic text-gray-500 dark:text-gray-400">
          tanh 정규화로 상위 비트가 항상 가장 중요한 정보를 담고 있어 하위 비트 제거가 안전합니다.
        </p>
      </div>

      {/* Accuracy comparison */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-emerald-300 bg-white p-3 dark:border-emerald-800 dark:bg-gray-900">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Any-Precision 단일 모델</p>
          <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">{data.ap}%</p>
          <p className="text-xs text-gray-400">Top-1 정확도 ({bits}비트)</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">전용 {bits}비트 모델</p>
          <p className="text-xl font-bold text-gray-600 dark:text-gray-300">{data.dedicated}%</p>
          <p className="text-xs text-gray-400">Top-1 정확도 ({bits}비트)</p>
        </div>
        <div className={`rounded-lg border p-3 ${diffPositive ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/40 dark:bg-emerald-900/10' : 'border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-900/10'}`}>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">차이 (단일 - 전용)</p>
          <p className={`text-xl font-bold ${diffPositive ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-600 dark:text-red-400'}`}>
            {diffPositive ? '+' : ''}{diff}%
          </p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">단일 모델이 우세!</p>
        </div>
      </div>

      {/* Model size comparison */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20">
        <p className="text-xs font-bold text-amber-700 dark:text-amber-300 mb-2">모델 크기 비교 (ResNet-50 기준)</p>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold">Any-Precision 단일 모델</span>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">104 MB</span>
            </div>
            <div className="h-4 rounded-full bg-emerald-200 dark:bg-emerald-900/40 overflow-hidden">
              <div className="h-full rounded-full bg-emerald-600" style={{ width: `${(104/220)*100}%` }} />
            </div>
          </div>
          <span className="text-xs text-gray-400">vs</span>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-600 dark:text-gray-300 font-semibold">전용 5개 모델 합계</span>
              <span className="text-xs font-bold text-gray-600 dark:text-gray-300">220 MB</span>
            </div>
            <div className="h-4 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
              <div className="h-full rounded-full bg-gray-500" style={{ width: '100%' }} />
            </div>
          </div>
        </div>
        <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
          단일 모델이 5개 전용 모델보다 <span className="font-bold">2.1배 작으면서도</span> 모든 정밀도에서 더 높은 정확도를 달성합니다.
        </p>
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────── */

export default function AnyPrecisionStudyFull() {
  const [col, setCol] = useState<Record<string, boolean>>({});
  const toggle = useCallback((id: string) => setCol(c => ({ ...c, [id]: !c[id] })), []);

  return (
    <GlossaryText>
    <div className="space-y-6">

      {/* ── Overview ─────────────────────────────────────────── */}
      <section id="ap-overview" className="scroll-mt-20">
        <div className="overflow-hidden rounded-xl shadow-sm">
          <div className="bg-gradient-to-br from-emerald-700 via-green-700 to-teal-700 p-6 pb-8">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">AAAI 2021</span>
              <span className="rounded-full bg-emerald-300/90 px-3 py-1 text-xs font-bold text-emerald-900">단일 모델 다중 정밀도</span>
              <span className="rounded-full bg-yellow-400/90 px-3 py-1 text-xs font-bold text-yellow-900">arXiv 1911.07346</span>
            </div>
            <h2 className="text-xl font-bold leading-snug text-white sm:text-2xl">
              Any-Precision Deep Neural Networks
            </h2>
            <p className="mt-3 text-sm text-emerald-200">
              Yuhang Li et al. · AAAI 2021
            </p>
          </div>
          <div className="bg-white p-6 dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
            <p className="leading-relaxed text-gray-700 dark:text-gray-300">
              <span className="font-semibold text-emerald-700 dark:text-emerald-300">단 하나의 모델</span>로 1비트부터 8비트까지의 모든 정밀도를 런타임에 지원하는 양자화 학습 프레임워크.
              핵심 아이디어: 8비트 정수에 가중치를 저장하되, 추론 시에는 <em>상위 N비트만 읽어서</em> N비트 정밀도로 동작합니다.
              tanh 정규화로 상위 비트에 항상 중요한 정보가 집중되도록 보장하며,
              Dynamic BatchNorm과 커리큘럼 지식 증류(Curriculum KD)를 통해 단일 모델이 각 정밀도별 전용 모델보다
              <span className="font-semibold text-emerald-700 dark:text-emerald-300"> 높은 정확도</span>를 달성합니다.
            </p>
            <p className="mt-3 leading-relaxed text-gray-700 dark:text-gray-300">
              ResNet-50 기준: 단일 모델(104 MB)이 5개 전용 모델(220 MB 합계)을 <em>모든 비트폭에서 능가</em>합니다.
              예시: 4비트에서 74.75% vs 전용 모델 71.24% (+3.51%p).
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {['비트 절삭(Bit Truncation)', 'tanh 정규화', 'Dynamic BatchNorm', '커리큘럼 KD', 'PTQ+QAT'].map(tag => (
                <span key={tag} className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Key Idea ─────────────────────────────────────────── */}
      <section id="ap-idea" className="scroll-mt-20">
        <SectionHeading icon={<BrainCircuit className="h-5 w-5" />} title="핵심 아이디어: 비트 절삭과 상위 비트 우선성" collapsed={!!col['ap-idea']} onToggle={() => toggle('ap-idea')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['ap-idea'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="1.1" title="8비트 저장, N비트 추론" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              8비트 정수 w는 상위 비트부터 하위 비트로 갈수록 정밀도 기여가 감소합니다.
              만약 상위 N비트만 사용한다면, 이것은 곧 N비트 양자화된 가중치와 동일합니다.
              즉, <span className="font-semibold text-emerald-700 dark:text-emerald-300">하나의 8비트 모델 파일</span>에서 런타임에 정밀도를 자유롭게 선택할 수 있습니다.
            </p>
            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/40 dark:bg-emerald-900/10">
                <p className="mb-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">비트 절삭의 원리</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                  8비트 정수 w_Q에서 상위 N비트만 읽기:<br/>
                  w_N = w_Q &gt;&gt; (8-N) (우측 시프트)<br/>
                  → 이것이 N비트 양자화 결과와 동일<br/>
                  → 추가 연산 없이 즉시 전환 가능
                </p>
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
                <p className="mb-1 text-xs font-bold text-amber-700 dark:text-amber-300">핵심 전제 조건</p>
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  상위 비트에 중요한 정보가 집중되어야 함<br/>
                  → tanh 정규화로 가중치를 [0, 1]에 매핑<br/>
                  → 균일 분포로 상위 비트가 항상 유효<br/>
                  → 하위 비트 제거 시 오차가 작음
                </p>
              </div>
            </div>

            <SubSectionHeading number="1.2" title="왜 tanh 정규화가 필요한가?" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              일반 가중치는 정규분포(대부분 0 근처, 극소수의 아웃라이어)를 따릅니다.
              이를 직접 양자화하면 상위 비트가 대부분 0이 되어 정보가 하위 비트에 몰리게 됩니다.
              tanh 함수는 가중치를 <span className="font-semibold text-emerald-700 dark:text-emerald-300">(-1, +1) 범위로 압축</span>하고 0.5를 더해 [0, 1]로 이동시켜,
              8비트 정수 전체 범위를 고르게 활용하도록 만듭니다.
            </p>
            <div className="mb-4 overflow-x-auto rounded-lg bg-emerald-50 p-3 dark:bg-emerald-900/20">
              <EquationRenderer latex={String.raw`w' = \frac{\tanh(w)}{2 \cdot \max|\tanh(w)|} + 0.5 \;\in\; [0,\, 1]`} />
            </div>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              정규화 후 w′ ∈ [0, 1]을 M_N = 2^N - 1 단계로 균일 양자화하면,
              상위 비트가 항상 실제 값의 크기를 결정하며 하위 비트는 미세 보정 역할만 담당합니다.
            </p>

            <SubSectionHeading number="1.3" title="메모리 이점: 단일 모델의 경제성" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                <p className="text-xs font-bold text-gray-600 dark:text-gray-300">전용 모델 방식</p>
                <p className="mt-1 text-2xl font-bold text-red-600 dark:text-red-400">220 MB</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">1, 2, 4, 6, 8비트 각 전용 모델 합산</p>
              </div>
              <div className="flex items-center justify-center">
                <span className="text-2xl text-gray-300 dark:text-gray-600">vs</span>
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/40 dark:bg-emerald-900/10">
                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">Any-Precision 단일 모델</p>
                <p className="mt-1 text-2xl font-bold text-emerald-700 dark:text-emerald-300">104 MB</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">모든 정밀도 지원, 2.1배 작음</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Quantization ─────────────────────────────────────── */}
      <section id="ap-quantization" className="scroll-mt-20">
        <SectionHeading icon={<Cpu className="h-5 w-5" />} title="양자화 기법: tanh 정규화 & 비트 절삭" collapsed={!!col['ap-quantization']} onToggle={() => toggle('ap-quantization')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['ap-quantization'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="2.1" title="가중치 tanh 정규화 및 정수 변환" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              원본 가중치 w를 tanh로 비선형 압축한 뒤 [0, 1]로 이동시킵니다.
              이후 M_N = 2^N - 1을 곱해 N비트 정수로 변환합니다:
            </p>
            <div className="mb-4 grid grid-cols-1 gap-3">
              <div className="overflow-x-auto rounded-lg bg-emerald-50 p-3 dark:bg-emerald-900/20">
                <EquationRenderer latex={String.raw`w' = \frac{\tanh(w)}{2\cdot\max|\tanh(w)|} + 0.5, \quad w'_{Q} = \operatorname{INT}\!\left(\operatorname{round}\!\left(w' \cdot M_N\right)\right)`} />
              </div>
            </div>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              여기서 M_N = 2^N − 1 (N=8이면 255). INT()는 정수 캐스팅. round()는 가장 가까운 정수로 반올림.
              8비트로 저장된 w_Q′에서 N비트 추론 시 상위 N비트만 읽으면 됩니다.
            </p>

            <SubSectionHeading number="2.2" title="활성화 양자화 (클리핑 + 균일 양자화)" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              활성화는 ReLU 이후 범위가 불확실하므로 클리핑(clipping) 후 균일 양자화합니다.
              학습 가능한 클리핑 상한을 통해 각 레이어에 최적화됩니다:
            </p>
            <div className="mb-4 overflow-x-auto rounded-lg bg-teal-50 p-3 dark:bg-teal-900/20">
              <EquationRenderer latex={String.raw`y'_c = \operatorname{clip}(y',\,0,\,1), \quad y_Q = \operatorname{INT}\!\left(\operatorname{round}(y'_c \cdot M_N)\right) \cdot \frac{1}{M_N}`} />
            </div>

            <SubSectionHeading number="2.3" title="추론 시 비트 절삭 동작 방식" />
            <div className="space-y-2">
              {[
                { step: '①', text: '모델은 항상 8비트 정수 w_Q′로 저장됨 (104 MB 고정)' },
                { step: '②', text: 'N비트 추론 요청 시: w_N = w_Q′ >> (8-N) (비트 우측 시프트)' },
                { step: '③', text: '결과 w_N은 N비트 균일 양자화와 동일한 값 — 추가 연산 없음' },
                { step: '④', text: 'Dynamic BN에서 해당 비트폭 k에 맞는 γ_k, β_k 파라미터 선택' },
                { step: '⑤', text: '정밀도 전환은 BN 파라미터 인덱스 변경만으로 즉시 실현됨' },
              ].map(({ step, text }) => (
                <div key={step} className="flex gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-700 text-xs font-bold text-white">{step}</span>
                  <p className="text-xs text-gray-700 dark:text-gray-300">{text}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* ── Dynamic BN ───────────────────────────────────────── */}
      <section id="ap-dynamic-bn" className="scroll-mt-20">
        <SectionHeading icon={<Layers className="h-5 w-5" />} title="Dynamic BatchNorm: 정밀도별 정규화" collapsed={!!col['ap-dynamic-bn']} onToggle={() => toggle('ap-dynamic-bn')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['ap-dynamic-bn'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="3.1" title="문제: 정밀도에 따른 활성화 분포 차이" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              1비트 양자화된 가중치와 8비트 양자화된 가중치는 레이어 출력(활성화)의 통계적 분포가
              <span className="font-semibold text-red-600 dark:text-red-400"> 근본적으로 다릅니다.</span>
              1비트는 표현 범위가 극히 제한적이고, 8비트는 연속값에 가깝습니다.
              하나의 BatchNorm 파라미터(γ, β)로 모든 정밀도를 공유하면, 낮은 비트폭의 분포가 높은 비트폭 훈련을 방해합니다.
            </p>
            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-900/10">
                <p className="mb-1 text-xs font-bold text-red-700 dark:text-red-300">공유 BN의 문제</p>
                <p className="text-xs text-red-600 dark:text-red-400">
                  1비트 활성화: 분산이 매우 작음<br/>
                  8비트 활성화: 분산이 상대적으로 큼<br/>
                  → 같은 μ, σ로 정규화하면 둘 다 왜곡<br/>
                  → 공동 학습 시 성능 저하 및 발산
                </p>
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/40 dark:bg-emerald-900/10">
                <p className="mb-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">Dynamic BN의 해결책</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                  정밀도 k마다 독립적인 {'{'}γ_k, β_k, μ_k, σ_k{'}'}<br/>
                  → 각 비트폭의 활성화 분포에 최적화<br/>
                  → 런타임에 k 인덱스만 바꾸면 즉시 전환<br/>
                  → 파라미터 오버헤드: 모델 전체의 &lt; 1%
                </p>
              </div>
            </div>

            <SubSectionHeading number="3.2" title="Dynamic BN 수식" />
            <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
              비트폭 k ∈ {'{'}1, 2, 4, 8, 32{'}'}에 대해 각각 독립적인 BN 파라미터를 유지합니다:
            </p>
            <div className="mb-4 overflow-x-auto rounded-lg bg-emerald-50 p-3 dark:bg-emerald-900/20">
              <EquationRenderer latex={String.raw`\hat{y}_k = \frac{x - \mu_k}{\sigma_k}, \quad y_k = \gamma_k \hat{y}_k + \beta_k, \quad k \in \{1,\,2,\,4,\,8,\,32\}`} />
            </div>

            <SubSectionHeading number="3.3" title="파라미터 오버헤드 분석" />
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 mb-2">ResNet-50 기준 오버헤드 계산</p>
              <div className="space-y-1 text-xs text-amber-700 dark:text-amber-300">
                <p>BN 레이어 수: ~53개 × 각 레이어 채널 수 × 5가지 정밀도</p>
                <p>추가 파라미터: 약 53 × 256(평균) × 5 = ~68K 파라미터</p>
                <p>전체 모델 파라미터: ~25.6M</p>
                <p className="font-bold">오버헤드: 68K / 25.6M ≈ 0.27% — 사실상 무시 가능</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Curriculum KD ────────────────────────────────────── */}
      <section id="ap-curriculum" className="scroll-mt-20">
        <SectionHeading icon={<GraduationCap className="h-5 w-5" />} title="커리큘럼 지식 증류 (Curriculum Knowledge Distillation)" collapsed={!!col['ap-curriculum']} onToggle={() => toggle('ap-curriculum')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['ap-curriculum'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="4.1" title="공동 학습의 문제점" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              단순히 모든 비트폭을 동시에 학습(joint training)하면,
              <span className="font-semibold text-red-600 dark:text-red-400"> 저비트(1~2비트)의 거친 그래디언트가 고비트(6~8비트)의 섬세한 수렴을 방해</span>합니다.
              낮은 비트폭은 높은 양자화 오차를 가지므로, 이것이 공유 가중치에 잡음으로 작용합니다.
            </p>
            <div className="mb-4 rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-900/40 dark:bg-orange-900/10">
              <p className="text-xs font-bold text-orange-700 dark:text-orange-300 mb-1">문제 시나리오</p>
              <p className="text-xs text-orange-600 dark:text-orange-400">
                1비트로 인한 ±large 그래디언트 → 8비트 최적점 주변을 진동시킴<br/>
                결과: 어느 정밀도에서도 최적 성능 달성 불가 → 전용 모델보다 성능 열등
              </p>
            </div>

            <SubSectionHeading number="4.2" title="커리큘럼 순서: 32비트 → 8 → 4 → 2 → 1비트" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              높은 정밀도에서 낮은 정밀도 순으로 순차 학습합니다.
              각 단계에서 바로 위 정밀도의 출력을 <em>교사(teacher)</em>로 삼아 지식 증류를 적용합니다:
            </p>
            <div className="mb-4 flex items-center justify-between overflow-x-auto rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800 gap-1">
              {['FP32\n(교사)', '8비트\n(학생→교사)', '4비트\n(학생→교사)', '2비트\n(학생→교사)', '1비트\n(학생)'].map((label, i) => (
                <div key={i} className="flex items-center gap-1">
                  <div className={`flex flex-col items-center justify-center rounded-lg px-2 py-2 text-center ${i === 0 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' : i === 4 ? 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'} text-xs font-semibold min-w-[60px]`}>
                    {label.split('\n').map((l, j) => <span key={j} className="block">{l}</span>)}
                  </div>
                  {i < 4 && <span className="text-gray-400 text-sm flex-shrink-0">→</span>}
                </div>
              ))}
            </div>

            <SubSectionHeading number="4.3" title="지식 증류 손실 함수" />
            <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
              각 단계에서 교사(높은 정밀도)의 softmax 출력을 soft target으로 사용하는 KL 발산 손실:
            </p>
            <div className="mb-4 overflow-x-auto rounded-lg bg-emerald-50 p-3 dark:bg-emerald-900/20">
              <EquationRenderer latex={String.raw`\mathcal{L}_{\text{distill}} = \mathrm{KL}\!\left(p_{\text{teacher}}\!\left(\frac{x}{T}\right) \;\Big\|\; p_{\text{student}}\!\left(\frac{x}{T}\right)\right)`} />
            </div>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              T는 온도(temperature) 파라미터. T가 크면 softmax가 부드러워져 클래스 간 유사도 정보가 더 풍부하게 전달됩니다.
              최종 손실 = α × CE(hard label) + (1-α) × T² × KL(soft label).
            </p>

            <SubSectionHeading number="4.4" title="커리큘럼 학습의 효과" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900/40 dark:bg-emerald-900/10">
                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300 mb-1">왜 이 순서인가?</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                  고정밀도 모델이 먼저 수렴 → 저정밀도의 믿을 수 있는 교사가 됨.
                  각 단계의 교사는 바로 위 정밀도이므로 지식 격차가 작아 효율적 전달 가능.
                </p>
              </div>
              <div className="rounded-lg border border-teal-200 bg-teal-50 p-3 dark:border-teal-900/40 dark:bg-teal-900/10">
                <p className="text-xs font-bold text-teal-700 dark:text-teal-300 mb-1">단일 모델이 전용 모델 능가하는 이유</p>
                <p className="text-xs text-teal-600 dark:text-teal-400">
                  각 정밀도의 교사 신호가 동일 가중치를 여러 각도로 정규화.
                  낮은 비트 정밀도 학습이 일종의 강력한 정규화로 작용 → 고비트 성능도 향상.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Interactive Viz ───────────────────────────────────── */}
      <section id="ap-viz" className="scroll-mt-20">
        <SectionHeading icon={<BarChart2 className="h-5 w-5" />} title="인터랙티브 시각화: 비트 절삭 효과" collapsed={!!col['ap-viz']} onToggle={() => toggle('ap-viz')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['ap-viz'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <p className="mb-4 text-sm text-gray-700 dark:text-gray-300">
              아래에서 정밀도(비트 수)를 직접 선택하여 비트 절삭 원리와 정확도 비교를 확인하세요.
              8비트 저장 구조에서 선택한 N비트만 활성화(초록색)되고 나머지는 잘라냅니다.
            </p>
            <BitTruncationViz />
          </Card>
        </div>
      </section>

      {/* ── Key Equations ─────────────────────────────────────── */}
      <section id="ap-equations" className="scroll-mt-20">
        <SectionHeading icon={<Hash className="h-5 w-5" />} title="핵심 수식 모음" collapsed={!!col['ap-equations']} onToggle={() => toggle('ap-equations')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['ap-equations'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="space-y-3">
              <EqCard idx={1} name="가중치 tanh 정규화 및 정수 변환" color="emerald"
                latex={String.raw`w' = \frac{\tanh(w)}{2\cdot\max|\tanh(w)|} + 0.5,\quad w'_Q = \operatorname{INT}\!\left(\operatorname{round}(w' \cdot M_N)\right)`}
                description="tanh로 가중치를 비선형 압축하여 (-1,+1)로 제한한 뒤 0.5를 더해 [0,1]로 이동. M_N = 2^N-1을 곱해 N비트 정수로 변환. 이 과정이 상위 비트에 중요한 정보를 집중시켜 하위 비트 절삭을 안전하게 만드는 핵심 단계입니다." />

              <EqCard idx={2} name="활성화 양자화 (클리핑 + 균일 양자화)" color="teal"
                latex={String.raw`y'_c = \operatorname{clip}(y',\,0,\,1),\quad y_Q = \operatorname{INT}\!\left(\operatorname{round}(y'_c \cdot M_N)\right) \cdot \frac{1}{M_N}`}
                description="활성화를 [0,1] 범위로 클리핑 후 M_N 단계의 균일 양자화 적용. 마지막에 1/M_N을 곱해 역정규화. 클리핑 상한은 학습 가능 파라미터로 레이어별 최적화. 전방 pass에서는 양자화된 값 사용, 역방 pass에서는 STE(Straight-Through Estimator)로 그래디언트 통과." />

              <EqCard idx={3} name="Dynamic BatchNorm (정밀도별 독립 파라미터)" color="emerald"
                latex={String.raw`\hat{y}_k = \frac{x - \mu_k}{\sigma_k},\quad y_k = \gamma_k \hat{y}_k + \beta_k,\quad k \in \{1,\,2,\,4,\,8,\,32\}`}
                description="비트폭 k마다 독립적인 BN 통계(μ_k, σ_k)와 학습 가능 파라미터(γ_k, β_k)를 유지. 추론 시 현재 비트폭에 해당하는 k를 선택해 적용. 전체 모델 파라미터의 1% 미만 오버헤드로 서로 다른 활성화 분포를 각각 최적화." />

              <EqCard idx={4} name="커리큘럼 지식 증류 손실" color="amber"
                latex={String.raw`\mathcal{L}_{\text{distill}} = \mathrm{KL}\!\left(p_{\mathrm{teacher}}\!\left(\tfrac{x}{T}\right) \,\Big\|\, p_{\mathrm{student}}\!\left(\tfrac{x}{T}\right)\right)`}
                description="교사(고정밀도) 모델의 부드러운 확률 분포를 목표로 학생(저정밀도) 모델을 학습. 온도 T가 클수록 softmax가 균일해져 클래스 간 유사도 정보가 더 많이 전달됨. 커리큘럼 순서 FP32→8→4→2→1비트로 순차 적용하여 간격이 큰 증류의 어려움을 완화." />
            </div>
          </Card>
        </div>
      </section>

      {/* ── Results ───────────────────────────────────────────── */}
      <section id="ap-results" className="scroll-mt-20">
        <SectionHeading icon={<BarChart2 className="h-5 w-5" />} title="실험 결과" collapsed={!!col['ap-results']} onToggle={() => toggle('ap-results')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['ap-results'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="6.1" title="ResNet-50, ImageNet Top-1 정확도 (%)" />
            <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">높을수록 좋음. Any-Precision 단일 모델 vs 각 비트폭 전용 모델.</p>
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-400">비트폭</th>
                    <th className="px-3 py-2 text-center font-semibold text-emerald-700 dark:text-emerald-300">Any-Precision (단일)</th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-gray-400">전용 모델</th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-gray-400">차이 (AP-전용)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { bits: '1비트', ap: 63.18, ded: 61.08 },
                    { bits: '2비트', ap: 67.5,  ded: 65.2  },
                    { bits: '3비트', ap: 71.3,  ded: 70.1  },
                    { bits: '4비트', ap: 74.75, ded: 71.24 },
                    { bits: '5비트', ap: 75.1,  ded: 74.5  },
                    { bits: '6비트', ap: 75.2,  ded: 75.0  },
                    { bits: '8비트', ap: 74.91, ded: 74.71 },
                  ].map(({ bits, ap, ded }, i) => {
                    const diff = (ap - ded).toFixed(2);
                    const isHighlight = [0, 3, 6].includes(i);
                    return (
                      <tr key={bits} className={isHighlight ? 'bg-emerald-50 dark:bg-emerald-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}>
                        <td className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">{bits}</td>
                        <td className="px-3 py-2 text-center font-mono font-bold text-emerald-700 dark:text-emerald-300">{ap}%</td>
                        <td className="px-3 py-2 text-center font-mono text-gray-600 dark:text-gray-400">{ded}%</td>
                        <td className="px-3 py-2 text-center font-mono font-semibold text-emerald-600 dark:text-emerald-400">+{diff}%p</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800 dark:bg-emerald-900/20">
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">핵심 관찰 ①</p>
                <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                  Any-Precision 단일 모델이 <strong>모든 비트폭에서</strong> 전용 모델보다 높은 정확도 달성.
                  커리큘럼 KD의 다중 정밀도 정규화 효과가 전용 모델의 단일 목적 학습을 능가.
                </p>
              </div>
              <div className="rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 dark:border-teal-800 dark:bg-teal-900/20">
                <p className="text-xs font-semibold text-teal-700 dark:text-teal-300">핵심 관찰 ②</p>
                <p className="mt-1 text-xs text-teal-600 dark:text-teal-400">
                  1비트에서 차이 +2.1%p, 4비트에서 차이 +3.51%p로 저비트일수록 단일 모델의 우위가 더 두드러짐.
                  커리큘럼 KD가 저비트 학습에서 특히 효과적임을 보여줌.
                </p>
              </div>
            </div>

            <div className="mt-4">
              <SubSectionHeading number="6.2" title="모델 크기 및 저장 효율성" />
              <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                <table className="w-full text-xs">
                  <thead><tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">방식</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">크기</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">지원 정밀도</th>
                    <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">비고</th>
                  </tr></thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {[
                      { method: 'FP32 단일 모델', size: '102 MB', prec: 'FP32만', note: '기준선' },
                      { method: '전용 8비트 모델', size: '~26 MB', prec: '8비트만', note: '단일 정밀도' },
                      { method: '전용 5개 모델 (1/2/4/6/8비트)', size: '220 MB', prec: '5가지 정밀도', note: '5배 복잡한 배포' },
                      { method: 'Any-Precision (★)', size: '104 MB', prec: '1~8비트 모두', note: '단일 배포 파일' },
                    ].map((r, i) => (
                      <tr key={i} className={i === 3 ? 'bg-emerald-50 dark:bg-emerald-900/10' : ''}>
                        <td className={`px-3 py-2 font-medium ${i === 3 ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-700 dark:text-gray-300'}`}>{r.method}</td>
                        <td className={`px-3 py-2 text-center font-mono font-semibold ${i === 3 ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-600 dark:text-gray-400'}`}>{r.size}</td>
                        <td className="px-3 py-2 text-center text-gray-500 dark:text-gray-400">{r.prec}</td>
                        <td className="px-3 py-2 text-gray-500 dark:text-gray-400">{r.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-900/20">
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">런타임 정밀도 전환 시나리오</p>
              <p className="mt-1 text-xs leading-relaxed text-amber-600 dark:text-amber-400">
                엣지 디바이스에서 배터리 잔량에 따라 정밀도를 동적으로 조절 가능:
                충전 중 → 8비트(최고 정확도 74.91%), 배터리 저하 → 4비트(74.75%), 절전 모드 → 2비트(67.5%).
                모델 파일 교체 없이 소프트웨어 설정 변경만으로 즉시 전환됩니다.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Quiz ─────────────────────────────────────────────── */}
      <section id="ap-quiz" className="scroll-mt-20">
        <SectionHeading icon={<FlaskConical className="h-5 w-5" />} title="자기 점검 (연구자 수준)" />
        <Card>
          <QuizSection color="emerald" questions={[
            {
              q: 'tanh 정규화가 없다면 비트 절삭이 왜 실패하는가? 정보 이론적 관점으로 설명하라.',
              a: 'tanh 없이 정규분포 가중치를 직접 N비트 균일 양자화하면, 대부분의 가중치(분포의 중심 부근)가 정수 표현의 중간 값에 몰립니다. 즉, 8비트로 저장할 때 상위 비트는 거의 항상 0이 됩니다. 예: 대부분의 가중치가 [-0.1, 0.1] 범위에 있다면 상위 6비트는 전부 0. 이 상태에서 하위 비트를 절삭하면 사실상 모든 정보를 잃습니다. tanh는 이 분포를 거의 균일분포로 변환하므로, 비트별로 정보량이 균등해져 상위 N비트가 의미 있는 정보를 담게 됩니다.',
            },
            {
              q: 'Dynamic BatchNorm이 없으면 단일 모델의 공동 학습이 왜 어려운가? 구체적으로 어떤 충돌이 발생하는가?',
              a: '1비트 가중치는 표현 공간이 {-1, +1} 두 값뿐이므로, BN 입력의 분산이 매우 작고 특정 패턴에 편향됩니다. 8비트는 연속값에 가까워 분산이 큽니다. 공유 BN이 8비트 활성화 분포에 맞게 μ, σ를 학습하면 1비트는 올바르게 정규화되지 않고, 반대로 1비트에 맞추면 8비트가 망가집니다. 또한 1비트 학습 그래디언트가 γ, β를 1비트에 특화된 방향으로 당기면서 8비트 최적화를 방해합니다. Dynamic BN은 이 충돌을 정밀도별 독립 파라미터로 완전히 해소합니다.',
            },
            {
              q: '커리큘럼 순서가 왜 FP32→8→4→2→1비트여야 하는가? 역순(1→2→4→8)이나 동시 학습과 비교하여 설명하라.',
              a: '고정밀도 먼저 학습하는 이유: ①교사 품질 보장 - FP32가 먼저 수렴해야 8비트의 믿을 만한 soft label을 제공. ②지식 격차 최소화 - 인접한 정밀도 간 증류(8→4, 4→2, 2→1)가 멀리 떨어진 정밀도 간(FP32→1)보다 효율적. ③간섭 최소화 - 고정밀도가 안정화된 후 저정밀도를 추가하므로 역방향 간섭이 없음. 역순(1→8)의 경우 1비트의 거친 표현이 먼저 가중치를 왜곡하여 고비트 수렴을 어렵게 만듭니다. 동시 학습은 모든 정밀도의 그래디언트가 충돌하여 어느 정밀도에서도 최적 수렴이 어렵습니다.',
            },
            {
              q: '단일 Any-Precision 모델이 전용 모델을 능가하는 현상의 이론적 해석은? 이것이 앙상블과 어떻게 다른가?',
              a: '단일 모델 우위의 이론적 해석: 다중 정밀도 커리큘럼 KD가 강력한 정규화 효과를 냅니다. 저비트 학습은 가중치에 "robust한 특징만 보존하라"는 압력을 가하고, 이것이 고비트 모델에서도 일반화(generalization) 향상으로 이어집니다. 이는 dropout이나 knowledge distillation의 정규화 효과와 유사한 원리입니다. 앙상블과의 차이: 앙상블은 N개 독립 모델의 예측을 평균하는 것으로, 추론 시 N배 연산이 필요합니다. Any-Precision은 N개 정밀도를 하나의 모델로 처리하며, 어느 하나의 정밀도만 선택해 단일 모델 비용으로 추론합니다. 성능 향상은 앙상블 효과가 아닌 다중 작업 학습(multi-task learning)의 정규화 효과에 기인합니다.',
            },
          ]} />
        </Card>
      </section>

    </div>
    </GlossaryText>
  );
}
