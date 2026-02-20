'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  BarChart2,
  BrainCircuit,
  ChevronDown,
  FlaskConical,
  GraduationCap,
  Hash,
  Layers,
  Zap,
} from 'lucide-react';
import katex from 'katex';
import E8LatticeViz from './E8LatticeViz';
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
      {onToggle && <ChevronDown className={`ml-auto h-5 w-5 text-gray-400 transition-transform dark:text-gray-500 ${collapsed ? '-rotate-90' : ''}`} />}
    </button>
  );
}

function SubSectionHeading({ number, title }: { number: string; title: string }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">{number}</span>
      <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">{title}</h4>
    </div>
  );
}

function Caption({ children }: { children: React.ReactNode }) {
  return <p className="mt-2 text-center text-xs italic text-gray-500 dark:text-gray-400">{children}</p>;
}

function EqCard({ idx, name, latex, description, color = 'purple' }: {
  idx: number; name: string; latex: string; description: string; color?: string;
}) {
  const [open, setOpen] = useState(false);
  const colorMap: Record<string, string> = {
    purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800',
    amber:  'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
    green:  'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
  };
  const badgeMap: Record<string, string> = {
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
    amber:  'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    green:  'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  };
  return (
    <div className="cursor-pointer rounded-xl border border-gray-200 bg-gray-50/50 p-4 transition hover:border-purple-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-purple-700" onClick={() => setOpen(v => !v)}>
      <div className="mb-2 flex items-center gap-2">
        <span className={`rounded px-2 py-0.5 text-xs font-bold ${badgeMap[color] ?? badgeMap.purple}`}>Eq. {idx}</span>
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{name}</span>
        <ChevronDown className={`ml-auto h-4 w-4 text-gray-400 transition-transform dark:text-gray-500 ${open ? 'rotate-180' : ''}`} />
      </div>
      <div className="overflow-x-auto py-2 text-gray-900 dark:text-gray-100"><EquationRenderer latex={latex} /></div>
      {open ? (
        <div className={`mt-3 rounded-lg border px-4 py-3 ${colorMap[color] ?? colorMap.purple}`}>
          <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">{description}</p>
        </div>
      ) : (
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">클릭하여 상세 설명 보기</p>
      )}
    </div>
  );
}

function QuizSection({ questions }: { questions: { q: string; a: string }[] }) {
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const toggle = (i: number) => setRevealed(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; });
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
            <div className="mx-4 mb-4 rounded-lg border border-purple-200 bg-purple-50 px-4 py-3 dark:border-purple-800 dark:bg-purple-900/20">
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

// Hadamard bit-parity helper
function bin(n: number): number { return n; }

/* ── Main component ──────────────────────────────────────────── */

export default function QuIPSharpStudyFull() {
  const [col, setCol] = useState<Record<string, boolean>>({});
  const toggle = useCallback((id: string) => setCol(c => ({ ...c, [id]: !c[id] })), []);

  return (
    <GlossaryText>
    <div className="space-y-6">

      {/* ── Overview ─────────────────────────────────────────── */}
      <section id="qs-overview" className="scroll-mt-20">
        <div className="overflow-hidden rounded-xl shadow-sm">
          <div className="bg-gradient-to-br from-purple-700 via-violet-700 to-indigo-700 p-6 pb-8">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">ICML 2024</span>
              <span className="rounded-full bg-green-400/90 px-3 py-1 text-xs font-bold text-green-900">Near FP16 @ 2-bit</span>
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
              QuIP의 두 한계(랜덤 직교 변환의 O(n³) 비용, 스칼라 양자화의 낮은 표현 효율)를 동시에 극복.
              <span className="font-semibold text-purple-700 dark:text-purple-300"> Walsh-Hadamard 변환(WHT)</span>으로 비간섭 처리를 O(n log n)으로 가속하고,
              <span className="font-semibold text-purple-700 dark:text-purple-300"> E8 격자 코드북</span>으로 8차원 공동 양자화를 통해 동일 비트 수에서 표현 공간을 64배 확장합니다.
            </p>
            <p className="mt-3 leading-relaxed text-gray-700 dark:text-gray-300">
              결과: Llama-2-7B에서 2비트 PPL <strong>5.57</strong> — FP16(5.47)와의 차이가 불과 0.1.
              QuIP(6.44) 대비 0.87 개선. 4비트 GPTQ(5.63)와 동등한 수준을 2비트로 달성합니다.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {['Walsh-Hadamard 비간섭', 'E8 격자 코드북', 'O(n log n) 변환', '256레벨 8D 양자화', 'Near-lossless 2비트'].map(tag => (
                <span key={tag} className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── QuIP Limits ──────────────────────────────────────── */}
      <section id="qs-quip-limits" className="scroll-mt-20">
        <SectionHeading icon={<BrainCircuit className="h-5 w-5" />} title="QuIP의 두 한계와 QuIP#의 해법" collapsed={!!col['qs-quip-limits']} onToggle={() => toggle('qs-quip-limits')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['qs-quip-limits'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-900/10">
                <p className="mb-2 text-sm font-bold text-red-700 dark:text-red-300">한계 ① 속도: O(n³) QR 분해</p>
                <p className="text-xs text-red-600 dark:text-red-400">
                  랜덤 직교 행렬 Q ∈ ℝ^(n×n) 생성: n×n 가우시안 행렬의 QR 분해가 O(n³) 필요.
                  Llama-2-7B의 최대 레이어(n=4096)에서 레이어당 약 40초, 전체 양자화 수 시간 소요.
                  실용적 배포에 심각한 장벽.
                </p>
                <div className="mt-2 rounded border border-red-300 bg-white/60 p-2 dark:bg-red-950/30">
                  <p className="font-mono text-xs font-bold text-red-700 dark:text-red-300">복잡도: O(n³) 시간, O(n²) 메모리</p>
                </div>
              </div>
              <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 dark:border-orange-900/40 dark:bg-orange-900/10">
                <p className="mb-2 text-sm font-bold text-orange-700 dark:text-orange-300">한계 ② 표현력: 스칼라 양자화</p>
                <p className="text-xs text-orange-600 dark:text-orange-400">
                  2비트 스칼라 양자화 = 4개 레벨만 사용 가능 (예: {'{-3, -1, +1, +3}'}).
                  각 원소를 독립적으로 양자화하므로 원소 간의 상관관계, 공분산 구조를 완전히 무시.
                  낮은 표현 다양성이 2비트 성능의 천장이 됨.
                </p>
                <div className="mt-2 rounded border border-orange-300 bg-white/60 p-2 dark:bg-orange-950/30">
                  <p className="font-mono text-xs font-bold text-orange-700 dark:text-orange-300">1D: 4 레벨 | 8D: 최대 2^16 레벨</p>
                </div>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead><tr className="bg-gray-50 dark:bg-gray-800">
                  <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">속성</th>
                  <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">QuIP (랜덤 직교)</th>
                  <th className="px-3 py-2 text-center text-purple-600 dark:text-purple-400">QuIP# (Hadamard + E8)</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { attr: '비간섭 변환 복잡도', q: 'O(n³) QR 분해', qs: 'O(n log n) WHT' },
                    { attr: '변환 저장 크기', q: 'O(n²) 행렬 저장 필요', qs: 'O(n) 랜덤 부호 벡터만' },
                    { attr: '양자화 단위', q: '1차원 스칼라', qs: '8차원 벡터 (E8 격자)' },
                    { attr: '유효 레벨 수 (2비트)', q: '4 (2² = 4)', qs: '256 (2^8 / 8차원)' },
                    { attr: '7B Llama-2 PPL', q: '6.44', qs: '5.57 (▼ 0.87)' },
                  ].map((r, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">{r.attr}</td>
                      <td className="px-3 py-2 text-center text-red-600 dark:text-red-400">{r.q}</td>
                      <td className="px-3 py-2 text-center font-semibold text-green-600 dark:text-green-400">{r.qs}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Hadamard Incoherence ──────────────────────────────── */}
      <section id="qs-hadamard" className="scroll-mt-20">
        <SectionHeading icon={<Zap className="h-5 w-5" />} title="개선 ① Walsh-Hadamard 비간섭 처리" collapsed={!!col['qs-hadamard']} onToggle={() => toggle('qs-hadamard')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['qs-hadamard'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="3.1" title="랜덤화된 Hadamard 변환 (RHT)" />
            <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
              n×n Hadamard 행렬 H_n에 랜덤 부호 대각 행렬 diag(d)를 곱합니다:
            </p>
            <div className="mb-3 overflow-x-auto rounded-lg bg-purple-50 p-3 dark:bg-purple-900/20">
              <EquationRenderer latex={String.raw`Q = \frac{1}{\sqrt{n}} H_n \cdot \text{diag}(d_1, \ldots, d_n), \quad d_i \overset{\text{i.i.d.}}{\sim} \text{Uniform}(\{+1, -1\})`} />
            </div>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              이 Q는 직교 행렬이며(QQ^T = I), 랜덤 직교 행렬과 동일한 비간섭 효과를 O(n log n)으로 달성합니다.
              저장 비용도 O(n²) 행렬 → O(n) 부호 벡터 d로 감소합니다.
            </p>

            <SubSectionHeading number="3.2" title="Hadamard 행렬 구조" />
            <div className="mb-4 overflow-x-auto rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
              <p className="mb-2 text-center text-xs text-gray-500 dark:text-gray-400">8×8 Hadamard 행렬 (흰색=+1/√8, 남색=-1/√8)</p>
              <svg width="160" height="160" viewBox="0 0 160 160" className="mx-auto block">
                {Array.from({ length: 8 }, (_, r) =>
                  Array.from({ length: 8 }, (_, c) => {
                    const val = (bin(r) & bin(c)) % 2 === 0 ? 1 : -1;
                    return <rect key={`${r}-${c}`} x={c * 20} y={r * 20} width={19} height={19} fill={val === 1 ? '#e0e7ff' : '#4f46e5'} rx={1} />;
                  })
                )}
              </svg>
              <p className="mt-2 text-center text-[10px] text-gray-500 dark:text-gray-400">H[r,c] = (-1)^popcount(r AND c) / √8 · 재귀 나비(butterfly) 구조 → O(n log n)</p>
            </div>

            <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/20">
              <p className="text-xs font-semibold text-purple-700 dark:text-purple-300">왜 동작하는가?</p>
              <p className="mt-1 text-xs leading-relaxed text-purple-600 dark:text-purple-400">
                Hadamard 변환은 입력 벡터의 에너지를 균등하게 &quot;스프레드&quot;합니다.
                어떤 원소 w_i가 크더라도, 변환 후에는 모든 n개 원소에 ±w_i/√n씩 기여합니다.
                랜덤 부호 d_i를 곱하면 상쇄 패턴이 랜덤화되어 특정 원소로의 집중이 방지됩니다.
                수식으로: (Qw)_j = (1/√n) Σ_i d_i H_ji w_i → 각 원소는 전체의 가중합.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Hadamard Theory ───────────────────────────────────── */}
      <section id="qs-hadamard-theory" className="scroll-mt-20">
        <SectionHeading icon={<GraduationCap className="h-5 w-5" />} title="Hadamard 비간섭의 이론적 분석" collapsed={!!col['qs-hadamard-theory']} onToggle={() => toggle('qs-hadamard-theory')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['qs-hadamard-theory'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="3.3" title="집중 부등식 (Concentration Inequality)" />
            <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
              랜덤화된 Hadamard 변환 Q 적용 후 행렬 W′ = Q_L W Q_R^T의 최대 원소에 대한 확률 경계:
            </p>
            <div className="mb-4 overflow-x-auto rounded-lg bg-purple-50 p-3 dark:bg-purple-900/20">
              <EquationRenderer latex={String.raw`\Pr\!\left[\max_{i,j} |W'_{ij}| \geq t\right] \;\leq\; 2mn \cdot \exp\!\left(-\frac{n t^2}{2\,\max_r \|W_{r,:}\|^2}\right)`} />
            </div>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              이 부등식에서 t = O(sqrt(log(mn) · max_r ‖W_r‖² / n))으로 설정하면 확률이 1/poly(mn)이 됩니다.
              즉, 높은 확률로 비간섭 지수 μ(W′) = O(sqrt(log(mn)/n)) = O(1)이 달성됩니다.
            </p>

            <SubSectionHeading number="3.4" title="Kashin 표현과의 연결" />
            <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
              Kashin (1977): 임의의 n-차원 벡터를 2n-차원으로 embed하면 ℓ∞/ℓ₂ 비율이 O(1/sqrt(n))이 됩니다.
              QuIP의 비간섭 처리는 Kashin 표현의 계산 가능한 근사입니다:
            </p>
            <div className="mb-3 overflow-x-auto rounded-lg bg-indigo-50 p-3 dark:bg-indigo-900/20">
              <EquationRenderer latex={String.raw`\frac{\|Qw\|_\infty}{\|Qw\|_2} \;\leq\; \frac{C\sqrt{\log n}}{\sqrt{n}} \;\xrightarrow{n\to\infty}\; 0`} />
            </div>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              이 비율이 작을수록 균일 양자화의 오차가 고르게 분산됩니다.
              랜덤 직교 행렬과 WHT 모두 이 비율을 O(sqrt(log n / n))으로 달성하지만,
              WHT는 butterfly 구조로 O(n log n) 계산만 필요합니다.
            </p>

            <SubSectionHeading number="3.5" title="랜덤 직교 vs WHT: 비간섭 효과 비교" />
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead><tr className="bg-gray-50 dark:bg-gray-800">
                  <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">속성</th>
                  <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">랜덤 직교 (Haar)</th>
                  <th className="px-3 py-2 text-center text-purple-600 dark:text-purple-400">랜덤화된 WHT</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { attr: '비간섭 달성 확률', h: 'Θ(1)', wht: 'Θ(1) (동일)' },
                    { attr: 'μ 기댓값 (O 표기)', h: 'O(√(log n / n))', wht: 'O(√(log n / n)) (동일)' },
                    { attr: '변환 시간', h: 'O(n³) QR 분해', wht: 'O(n log n) 나비 구조' },
                    { attr: '저장 크기', h: 'O(n²) 행렬', wht: 'O(n) 부호 벡터' },
                    { attr: '수치적 안정성', h: '높음', wht: '매우 높음 (±1/√n만 사용)' },
                  ].map((r, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">{r.attr}</td>
                      <td className="px-3 py-2 text-center text-gray-500 dark:text-gray-400">{r.h}</td>
                      <td className="px-3 py-2 text-center font-semibold text-purple-600 dark:text-purple-400">{r.wht}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </section>

      {/* ── E8 Lattice ───────────────────────────────────────── */}
      <section id="qs-e8" className="scroll-mt-20">
        <SectionHeading icon={<Layers className="h-5 w-5" />} title="개선 ② E8 격자 코드북 (Lattice Quantization)" collapsed={!!col['qs-e8']} onToggle={() => toggle('qs-e8')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['qs-e8'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="4.1" title="E8 격자: 8차원 최적 구체 패킹" />
            <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
              E8은 8차원 유클리드 공간에서 가장 조밀한 구체 패킹(sphere packing)을 달성하는 격자입니다.
              2022년 Viazovska의 Fields Medal 수상 연구에서 E8의 최적성이 엄밀히 증명되었습니다.
            </p>
            <div className="mb-4 overflow-x-auto rounded-lg bg-purple-50 p-3 dark:bg-purple-900/20">
              <EquationRenderer latex={String.raw`E_8 = \left\{ x \in \mathbb{Z}^8 \cup \left(\mathbb{Z}+\tfrac{1}{2}\right)^8 \;\middle|\; \sum_{i=1}^8 x_i \equiv 0 \pmod{2} \right\}`} />
            </div>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              구성: 8차원 정수 격자와 반정수({'{...,-1/2, 1/2, 3/2,...}'}^8) 격자의 합집합에서,
              원소 합이 짝수인 것들. 최소 벡터 240개, 최소 거리 √2.
            </p>

            <E8LatticeViz />
            <Caption>2D 유추: E8은 헥사고널 격자처럼 8D에서 가장 효율적인 패킹을 실현합니다.</Caption>

            <div className="mt-5">
              <SubSectionHeading number="4.2" title="E8 격자 양자화의 이점" />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  {
                    title: '유효 레벨 수',
                    before: '스칼라 2비트: 4 레벨',
                    after: 'E8 2비트/원소: 256 코드워드 (8D)',
                    note: '동일 비트 수에서 표현 공간 64배',
                  },
                  {
                    title: '원소 간 상관관계',
                    before: '스칼라: 각 원소 독립 양자화',
                    after: 'E8: 8개 원소 공동 최적화',
                    note: '가중치 공분산 구조 활용',
                  },
                  {
                    title: '구체 패킹 효율',
                    before: 'Z^8: NSM ≈ 0.0833',
                    after: 'E8: NSM ≈ 0.0717 (14% 개선)',
                    note: '양자화 오차 수학적 최소화',
                  },
                ].map(({ title, before, after, note }) => (
                  <div key={title} className="rounded-lg border border-purple-100 bg-purple-50 p-3 dark:border-purple-900/30 dark:bg-purple-900/10">
                    <p className="mb-2 text-xs font-bold text-purple-700 dark:text-purple-300">{title}</p>
                    <p className="text-xs text-red-500 line-through">{before}</p>
                    <p className="text-xs font-semibold text-green-600 dark:text-green-400">{after}</p>
                    <p className="mt-1 text-[10px] text-gray-500 dark:text-gray-400">{note}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <SubSectionHeading number="4.3" title="E8 격자 양자화 연산" />
              <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
                8개 가중치 벡터 w ∈ ℝ^8을 스케일 α로 조정된 E8 격자에서 가장 가까운 점으로 양자화:
              </p>
              <div className="mb-4 overflow-x-auto rounded-lg bg-purple-50 p-3 dark:bg-purple-900/20">
                <EquationRenderer latex={String.raw`\hat{w} = \alpha \cdot \mathop{\arg\min}_{v \in E_8} \left\| \frac{w}{\alpha} - v \right\|_2^2`} />
              </div>
              <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                최근접 E8 격자점 탐색(nearest neighbor in E8)은 특수한 decoding 알고리즘으로 O(1) 시간에 수행 가능합니다.
                E8의 구조(정수 격자 + 반정수 격자, 홀짝 조건)를 이용해 lookup table 기반 O(1) decoding이 가능합니다.
              </p>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20">
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">구현 세부사항</p>
                <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                  실제 구현에서 E8은 스케일 α와 함께 정규화되어 사용됩니다.
                  8D 코드워드를 8개의 2비트 = 16비트 인덱스로 저장. lookup table 크기: 2^16 × 8 = 512KB.
                  CUDA 커널에서 shared memory에 올려 빠른 디코딩 가능.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Lattice Quantization Theory ───────────────────────── */}
      <section id="qs-lattice-theory" className="scroll-mt-20">
        <SectionHeading icon={<Hash className="h-5 w-5" />} title="격자 양자화 이론 (Lattice Quantization Theory)" collapsed={!!col['qs-lattice-theory']} onToggle={() => toggle('qs-lattice-theory')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['qs-lattice-theory'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="5.1" title="정규화 이차 모멘트 (Normalized Second Moment, NSM)" />
            <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
              격자 Λ의 양자화 효율을 평가하는 핵심 지표. 단위 체적당 평균 양자화 오차를 측정합니다:
            </p>
            <div className="mb-4 overflow-x-auto rounded-lg bg-purple-50 p-3 dark:bg-purple-900/20">
              <EquationRenderer latex={String.raw`G(\Lambda) \;\triangleq\; \frac{\sigma_q^2(\Lambda)}{V(\Lambda)^{2/n}} \;=\; \frac{\frac{1}{n}\int_{\mathcal{V}(\Lambda)} \|x\|^2 \,dx}{V(\Lambda)^{1+2/n}}`} />
            </div>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              V(Λ): 기본 도메인(Voronoi cell) 체적. σ²_q: 평균 양자화 오차(second moment per dimension).
              G(Λ)가 작을수록 동일한 비트 수에서 오차가 작음.
            </p>

            <SubSectionHeading number="5.2" title="주요 격자의 NSM 비교" />
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 mb-4">
              <table className="w-full text-xs">
                <thead><tr className="bg-gray-50 dark:bg-gray-800">
                  <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">격자</th>
                  <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">차원</th>
                  <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">NSM G(Λ)</th>
                  <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">구체 패킹 밀도</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { lat: '스칼라 (ℤ¹)', dim: '1', nsm: '1/12 ≈ 0.0833', pack: 'π/4 ≈ 78.5%', hi: false },
                    { lat: '헥사고널 (A₂)', dim: '2', nsm: '√3/6π ≈ 0.0802', pack: 'π/(2√3) ≈ 90.7%', hi: false },
                    { lat: 'D₄', dim: '4', nsm: '~0.0766', pack: 'π²/16 ≈ 61.7%', hi: false },
                    { lat: 'E₈', dim: '8', nsm: '~0.0717', pack: 'π⁴/384 ≈ 25.4%', hi: true },
                    { lat: 'Z^n (n→∞ 이론한)', dim: 'n', nsm: '1/(2πe) ≈ 0.0585 (하한)', pack: '감소', hi: false },
                  ].map((r, i) => (
                    <tr key={i} className={r.hi ? 'bg-purple-50 dark:bg-purple-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}>
                      <td className={`px-3 py-2 font-medium ${r.hi ? 'text-purple-700 dark:text-purple-300' : 'text-gray-700 dark:text-gray-300'}`}>{r.hi && '★ '}{r.lat}</td>
                      <td className="px-3 py-2 text-center text-gray-500 dark:text-gray-400">{r.dim}</td>
                      <td className={`px-3 py-2 text-center font-mono font-semibold ${r.hi ? 'text-purple-700 dark:text-purple-300' : 'text-gray-600 dark:text-gray-400'}`}>{r.nsm}</td>
                      <td className="px-3 py-2 text-center text-gray-500 dark:text-gray-400">{r.pack}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <SubSectionHeading number="5.3" title="양자화 이득 (Quantization Gain)" />
            <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
              E8의 양자화 이득: 스칼라(Z^1) 대비 얼마나 오차가 작은가?
            </p>
            <div className="mb-4 overflow-x-auto rounded-lg bg-purple-50 p-3 dark:bg-purple-900/20">
              <EquationRenderer latex={String.raw`\text{Gain}(E_8\text{ vs }Z^1) = \frac{G(Z^1)}{G(E_8)} = \frac{0.0833}{0.0717} \approx 1.16 \quad(\approx 0.64\,\text{dB})`} />
            </div>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              0.64 dB의 양자화 이득은 이론적으로는 작아 보이지만, 2비트 초저비트 환경에서는
              perplexity로 0.87 개선(6.44→5.57)에 해당하는 실질적 차이를 만듭니다.
              이는 E8의 우수한 Voronoi 셀 형태(구에 가까운 형태)가 균일 입력 분포에서 최소 평균 오차를 달성하기 때문입니다.
            </p>

            <SubSectionHeading number="5.4" title="왜 8차원인가?" />
            <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/20">
              <p className="text-xs font-semibold text-purple-700 dark:text-purple-300">8의 의미</p>
              <p className="mt-1 text-xs leading-relaxed text-purple-600 dark:text-purple-400">
                1. <strong>E8은 8D에서만 존재</strong>: E8은 8차원에 특유한 격자 (±1/2 좌표의 패리티 제약은 8D에서만 정수 격자와 상보 관계).
                2. <strong>실용적 트레이드오프</strong>: 차원이 높을수록 NSM이 작아지나, lookup table 크기가 지수적으로 증가. 8D: 2^16 = 64K 코드워드로 관리 가능.
                3. <strong>LLM 가중치와의 호환</strong>: 8개 가중치 단위로 블록화하면 대부분 레이어(d = 4096, 8192 등)에서 자연스럽게 분할됨.
                4. <strong>Hadamard와의 시너지</strong>: Hadamard 변환 후 가중치가 iid 가우시안에 가까워지면, E8이 가우시안 분포에 최적 격자임이 알려져 있음.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Key Equations ─────────────────────────────────────── */}
      <section id="qs-equations" className="scroll-mt-20">
        <SectionHeading icon={<Hash className="h-5 w-5" />} title="핵심 수식 모음" collapsed={!!col['qs-equations']} onToggle={() => toggle('qs-equations')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['qs-equations'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="space-y-3">
              <EqCard idx={1} name="랜덤화된 Hadamard 변환" color="purple"
                latex={String.raw`Q = \frac{1}{\sqrt{n}} H_n \cdot \text{diag}(d_1, \ldots, d_n), \quad d_i \sim \text{Unif}(\{+1,-1\})`}
                description="Hadamard 행렬에 랜덤 부호 대각 행렬을 곱. 완전 랜덤 직교 행렬과 동일한 비간섭 효과를 O(n log n)으로 달성. 저장: O(n) 부호 벡터만 필요." />

              <EqCard idx={2} name="비간섭 집중 부등식" color="indigo"
                latex={String.raw`\Pr\!\left[\max_{i,j}|(Q_L W Q_R^\top)_{ij}| \geq t\right] \leq 2mn\exp\!\left(-\frac{nt^2}{2\max_r\|W_{r,:}\|^2}\right)`}
                description="WHT 적용 후 최대 원소가 t보다 클 확률의 상한. t = O(sqrt(log(mn)/n))·‖W‖_F/√m 설정 시 1/poly(mn)으로 감소 → 높은 확률로 비간섭 달성." />

              <EqCard idx={3} name="E8 격자 정의" color="purple"
                latex={String.raw`E_8 = \left\{ x \in \mathbb{R}^8 : x \in \mathbb{Z}^8 \text{ or } x \in \!\left(\mathbb{Z}+\tfrac{1}{2}\right)^8\!,\; \textstyle\sum_{i=1}^8 x_i \equiv 0 \!\pmod{2} \right\}`}
                description="정수 격자와 반정수 격자의 합집합 중 원소 합이 짝수인 것. 240개 최소 벡터(거리 √2). 8D 공간에서 수학적으로 최적의 구체 패킹을 실현 (Viazovska 2022, Fields Medal)." />

              <EqCard idx={4} name="E8 격자 양자화" color="purple"
                latex={String.raw`\hat{w} = \alpha \cdot \mathop{\arg\min}_{v \in E_8} \|w/\alpha - v\|_2^2`}
                description="스케일 α로 정규화된 E8 격자점 중 최근접 이웃. α는 그룹별 RMS로 결정. E8 decoding은 정수/반정수 격자를 각각 탐색 후 패리티 조건으로 최종 선택 → O(1) 시간." />

              <EqCard idx={5} name="E8 NSM (Normalized Second Moment)" color="indigo"
                latex={String.raw`G(E_8) \;\approx\; 0.0717, \quad G(Z^1) = \frac{1}{12} \approx 0.0833`}
                description="NSM이 작을수록 동일 비트에서 오차가 작음. E8의 양자화 이득 = 0.0833/0.0717 ≈ 1.16 (14% 오차 감소, ≈0.64 dB). 8D 격자 중 이론적 최솟값에 가장 근접." />

              <EqCard idx={6} name="전체 QuIP# 파이프라인" color="purple"
                latex={String.raw`\hat{W} = Q_L^\top \cdot \text{E8-Quant}\!\left(Q_L W Q_R^\top\right) \cdot Q_R`}
                description="Q_L, Q_R: 랜덤화된 WHT. 비간섭 변환 후 8D 블록 단위로 E8 격자 양자화. 역변환 후 Ŵ만 저장. 추론 시 Q 불필요. 실제 구현에서는 행과 열 방향으로 각각 WHT 적용." />
            </div>
          </Card>
        </div>
      </section>

      {/* ── Results ──────────────────────────────────────────── */}
      <section id="qs-results" className="scroll-mt-20">
        <SectionHeading icon={<BarChart2 className="h-5 w-5" />} title="실험 결과" collapsed={!!col['qs-results']} onToggle={() => toggle('qs-results')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['qs-results'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <p className="mb-3 text-sm font-semibold text-gray-600 dark:text-gray-400">Llama-2 모델 · WikiText-2 Perplexity ↓</p>
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead><tr className="bg-gray-50 dark:bg-gray-800">
                  <th className="px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-400">방법</th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-gray-400">비트</th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-gray-400">7B</th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-gray-400">13B</th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-gray-400">70B</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { m: 'FP16',                b: '16', p7: '5.47', p13: '4.88', p70: '3.32', hi: false },
                    { m: 'GPTQ',                b: '4',  p7: '5.63', p13: '4.97', p70: '3.38', hi: false },
                    { m: 'QuIP',                b: '2',  p7: '6.44', p13: '5.55', p70: '3.97', hi: false },
                    { m: 'QuIP# (스칼라만)',    b: '2',  p7: '5.97', p13: '5.18', p70: '3.66', hi: false },
                    { m: 'QuIP# (E8 격자) ★',  b: '2',  p7: '5.57', p13: '4.95', p70: '3.46', hi: true  },
                  ].map((r, i) => (
                    <tr key={i} className={r.hi ? 'bg-purple-50 dark:bg-purple-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}>
                      <td className={`px-3 py-2 font-medium ${r.hi ? 'text-purple-700 dark:text-purple-300' : 'text-gray-700 dark:text-gray-300'}`}>{r.m}</td>
                      <td className="px-3 py-2 text-center font-mono text-gray-500 dark:text-gray-400">{r.b}</td>
                      {[r.p7, r.p13, r.p70].map((v, j) => (
                        <td key={j} className={`px-3 py-2 text-center font-mono font-semibold ${r.hi ? 'text-purple-700 dark:text-purple-300' : 'text-gray-600 dark:text-gray-400'}`}>{v}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { title: 'Ablation: Hadamard 효과', desc: 'QuIP(6.44) → QuIP#-스칼라(5.97): Hadamard+스칼라만으로 0.47 PPL 개선. 속도 가속이 주 효과.' },
                { title: 'Ablation: E8 효과', desc: 'QuIP#-스칼라(5.97) → QuIP#-E8(5.57): E8 격자만으로 0.40 PPL 추가 개선. 표현력 향상이 주 효과.' },
                { title: '70B 스케일링', desc: 'Llama-2-70B 2비트 3.46 vs FP16 3.32: 불과 4% 열화로 8B→2B 메모리 절약. 대형 모델에서 비간섭 변환 더욱 효과적.' },
              ].map(({ title, desc }) => (
                <div key={title} className="rounded-lg border border-purple-200 bg-purple-50 px-3 py-3 dark:border-purple-800 dark:bg-purple-900/20">
                  <p className="text-xs font-semibold text-purple-700 dark:text-purple-300">{title}</p>
                  <p className="mt-1 text-xs text-purple-600 dark:text-purple-400">{desc}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* ── Quiz ─────────────────────────────────────────────── */}
      <section id="qs-quiz" className="scroll-mt-20">
        <SectionHeading icon={<FlaskConical className="h-5 w-5" />} title="자기 점검 (연구자 수준)" />
        <Card>
          <QuizSection questions={[
            {
              q: 'Hadamard 변환이 랜덤 직교 행렬과 동일한 비간섭 효과를 내는 수학적 이유는?',
              a: '(Q_L W Q_R^T)_{ij} = (1/n) Σ_k Σ_l d_k^L H_{ik}^n W_{kl} d_l^R H_{jl}^n. 각 d_i ~ ±1 iid이므로 교차항의 기댓값은 0, 분산은 ‖W‖²_F/(mn). 즉 각 원소는 평균 0, 분산 ‖W‖²_F/(mn)인 독립 분포를 따름 — 랜덤 직교 행렬의 경우와 동일. 집중 부등식으로 max 원소가 O(sqrt(log(mn)‖W‖²_F/(mn)))임을 보일 수 있음.',
            },
            {
              q: 'E8 격자의 NSM이 Z^8보다 작은 직관적 이유는? 양자화 이론에서 NSM이 중요한 이유는?',
              a: 'NSM은 격자의 Voronoi 셀 모양이 구(sphere)에 얼마나 가까운지 측정합니다. 구가 가장 이상적인 Voronoi 셀 (등방성 오차). E8의 Voronoi 셀은 Z^8의 초입방체보다 구에 훨씬 가깝습니다 — 240개 최소 벡터가 만드는 대칭성 덕분. NSM이 중요한 이유: 균일 입력 분포에서 평균 양자화 오차 = G(Λ) · V(Λ)^{2/n} · n. 따라서 G(Λ)를 줄이면 동일 비트 수에서 오차가 줄어듭니다.',
            },
            {
              q: 'QuIP#에서 "E8 격자 코드북"이 학습된 VQ 코드북과 근본적으로 다른 점은?',
              a: 'VQ 코드북(LBG, k-means 등): 특정 데이터 분포에 맞게 학습. 일반화 어려움, 데이터 의존적. E8: 수학적으로 고정된 격자, 데이터 독립적. 균일 분포(비간섭 처리 후 WHT 출력은 거의 균일)에서 E8이 이론적 최솟값에 가까운 NSM을 가짐. 또한 E8 decoding이 O(1)인 반면, k-means 코드북의 nearest neighbor 탐색은 O(K).',
            },
            {
              q: '8차원 E8 양자화 인덱스를 저장할 때 실제 비트 수 계산 방법은?',
              a: 'E8 격자의 각 Voronoi 셀 코드워드 수: 2^16 = 65536개의 서로 다른 8D 격자점을 2비트/원소로 커버. 즉 8개 원소에 대해 16비트(= 8 × 2비트) 인덱스를 사용. 이 16비트 인덱스가 E8 격자의 어떤 점인지 lookup table로 복원. 실제 저장: 원소당 2비트. 단, 스케일 α는 별도 저장(FP16 또는 FP8).',
            },
            {
              q: 'QuIP#의 접근이 CSI 피드백 압축에 주는 시사점을 구체적으로 논하라.',
              a: 'CSI 피드백에서도 두 가지 개선이 가능합니다. ① WHT 비간섭: 채널 행렬 H_c에 Hadamard 전처리를 적용하면 O(n log n)으로 비간섭 상태로 변환 가능. 수신기에서 미리 약속된 Hadamard 행렬만 사용하므로 오버헤드 없음. ② 격자 코드북: CSI 양자화에서 스칼라 코드북 대신 E8 등 고차원 격자를 사용하면 동일 피드백 비트에서 채널 복원 오차를 14% 줄일 수 있음. 특히 massive MIMO에서 수백 개 안테나 계수를 함께 양자화하면 시너지 극대화.',
            },
          ]} />
        </Card>
      </section>
    </div>
    </GlossaryText>
  );
}
