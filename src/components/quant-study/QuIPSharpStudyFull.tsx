'use client';

import { useCallback, useMemo, useState } from 'react';
import { BarChart2, BrainCircuit, ChevronDown, FlaskConical, Hash, Layers, Zap } from 'lucide-react';
import katex from 'katex';
import E8LatticeViz from './E8LatticeViz';

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
  };
  const badgeMap: Record<string, string> = {
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
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
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">클릭하여 한국어 설명 보기</p>
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
    <div className="space-y-6">
      {/* Overview */}
      <section id="qs-overview" className="scroll-mt-20">
        <div className="overflow-hidden rounded-xl shadow-sm">
          <div className="bg-gradient-to-br from-purple-700 via-violet-700 to-indigo-700 p-6 pb-8">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">ICML 2024</span>
              <span className="rounded-full bg-green-400/90 px-3 py-1 text-xs font-bold text-green-900">Near Float16 @ 2-bit</span>
            </div>
            <h2 className="text-xl font-bold leading-snug text-white sm:text-2xl">
              QuIP#: Even Better LLM Quantization with Hadamard Incoherence and Lattice Codebooks
            </h2>
            <p className="mt-3 text-sm text-purple-200">Albert Tseng, Jerry Chee, Qingyao Sun 외 (Cornell 대학교) · ICML 2024</p>
          </div>
          <div className="bg-white p-6 dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
            <p className="leading-relaxed text-gray-700 dark:text-gray-300">
              QuIP의 두 가지 한계를 극복한 개선 버전.
              랜덤 직교 행렬을 <span className="font-semibold text-purple-700 dark:text-purple-300">Walsh-Hadamard 변환</span>으로 교체(O(n log n)),
              스칼라 양자화를 <span className="font-semibold text-purple-700 dark:text-purple-300">E8 격자 코드북</span>으로 교체합니다.
              Llama-2-7B에서 2비트 PPL 5.57로 FP16(5.47)에 거의 손실 없는 성능을 달성합니다.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {['Hadamard 비간섭', 'E8 격자 코드북', 'O(n log n) 변환', '준손실없는 2비트'].map(tag => (
                <span key={tag} className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* QuIP limits */}
      <section id="qs-quip-limits" className="scroll-mt-20">
        <SectionHeading icon={<BrainCircuit className="h-5 w-5" />} title="QuIP의 한계" collapsed={!!col['qs-quip-limits']} onToggle={() => toggle('qs-quip-limits')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['qs-quip-limits'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-900/10">
                <p className="mb-2 text-sm font-bold text-red-700 dark:text-red-300">한계 ① 속도</p>
                <p className="text-xs text-red-600 dark:text-red-400">랜덤 직교 행렬 Q ∈ ℝⁿˣⁿ 생성: <span className="font-mono font-bold">O(n²)</span> 저장 + <span className="font-mono font-bold">O(n³)</span> QR 분해. Llama 7B의 레이어(4096×4096)에서 매우 느림.</p>
              </div>
              <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 dark:border-orange-900/40 dark:bg-orange-900/10">
                <p className="mb-2 text-sm font-bold text-orange-700 dark:text-orange-300">한계 ② 정밀도</p>
                <p className="text-xs text-orange-600 dark:text-orange-400">스칼라 양자화는 각 가중치를 독립적으로 처리 → 2비트에서 4개 레벨만 사용 가능 (매우 거침).</p>
              </div>
            </div>
            <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead><tr className="bg-gray-50 dark:bg-gray-800">
                  <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">방법</th>
                  <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">변환 복잡도</th>
                  <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">양자화 효율</th>
                </tr></thead>
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
        <SectionHeading icon={<Zap className="h-5 w-5" />} title="개선 ① Hadamard 비간섭" collapsed={!!col['qs-hadamard']} onToggle={() => toggle('qs-hadamard')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['qs-hadamard'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="3.1" title="Walsh-Hadamard 변환" />
            <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">n×n Hadamard 행렬은 고정된 직교 행렬입니다:</p>
            <div className="mb-3 overflow-x-auto rounded-lg bg-purple-50 p-3 dark:bg-purple-900/20">
              <EquationRenderer latex={String.raw`H_n = \frac{1}{\sqrt{n}}\begin{bmatrix} H_{n/2} & H_{n/2} \\ H_{n/2} & -H_{n/2} \end{bmatrix}, \quad H_1 = [1]`} />
            </div>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">WHT는 O(n log n)으로 계산 가능. 완전 랜덤성을 위해 대각 랜덤 부호 행렬을 곱합니다:</p>
            <div className="mb-5 overflow-x-auto rounded-lg bg-purple-50 p-3 dark:bg-purple-900/20">
              <EquationRenderer latex={String.raw`Q = \frac{1}{\sqrt{n}} H_n \cdot \text{diag}(d), \quad d_i \overset{\text{i.i.d.}}{\sim} \text{Uniform}(\{+1, -1\})`} />
            </div>
            <SubSectionHeading number="3.2" title="Hadamard 행렬 구조 (8×8)" />
            <div className="mb-4 overflow-x-auto rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
              <p className="mb-2 text-center text-xs text-gray-500 dark:text-gray-400">체커보드 패턴 (흰색=+1, 검정=-1)</p>
              <svg width="160" height="160" viewBox="0 0 160 160" className="mx-auto block">
                {Array.from({ length: 8 }, (_, r) =>
                  Array.from({ length: 8 }, (_, c) => {
                    const val = (bin(r) & bin(c)) % 2 === 0 ? 1 : -1;
                    return <rect key={`${r}-${c}`} x={c * 20} y={r * 20} width={19} height={19} fill={val === 1 ? '#e0e7ff' : '#4f46e5'} rx={1} />;
                  })
                )}
              </svg>
              <p className="mt-2 text-center text-[10px] text-gray-500 dark:text-gray-400">H[r,c] = (-1)^popcount(r AND c) / √8</p>
            </div>
            <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/20">
              <p className="text-xs text-purple-700 dark:text-purple-300">
                <span className="font-bold">왜 동작하는가?</span> Hadamard 변환은 입력을 &quot;스프레드&quot;합니다.
                큰 원소 하나가 변환 후 모든 n개 원소에 ±1/√n씩 기여하므로, 어떤 원소도 특별히 크거나 작지 않게 됩니다.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* E8 Lattice */}
      <section id="qs-e8" className="scroll-mt-20">
        <SectionHeading icon={<Layers className="h-5 w-5" />} title="개선 ② E8 격자 코드북" collapsed={!!col['qs-e8']} onToggle={() => toggle('qs-e8')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['qs-e8'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="4.1" title="E8 격자란?" />
            <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
              E8은 8차원 공간에서 <span className="font-semibold text-purple-700 dark:text-purple-300">최적 구체 패킹(optimal sphere packing)</span>을 달성하는 격자입니다.
            </p>
            <div className="mb-4 overflow-x-auto rounded-lg bg-purple-50 p-3 dark:bg-purple-900/20">
              <EquationRenderer latex={String.raw`E_8 = \left\{ x \in \mathbb{Z}^8 \cup \left(\mathbb{Z}+\tfrac{1}{2}\right)^8 : \sum x_i \equiv 0 \pmod{2} \right\}`} />
            </div>
            <E8LatticeViz />
            <Caption>2D 유추: 헥사고널 격자(E8 유추)는 동일 밀도에서 스칼라 격자보다 평균 양자화 오차가 15~20% 낮습니다.</Caption>
            <div className="mt-4">
              <SubSectionHeading number="4.2" title="E8 격자 양자화의 핵심 이점" />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  { title: '레벨 수', scalar: '4 (2비트)', e8: '256 (8D, 2비트)' },
                  { title: '상관 활용', scalar: '없음', e8: '8D 동시 최적화' },
                  { title: '패킹 효율', scalar: 'π/4 ≈ 78.5%', e8: '≈ 99%+ (8D)' },
                ].map(({ title, scalar, e8 }) => (
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
        <SectionHeading icon={<Hash className="h-5 w-5" />} title="핵심 수식" collapsed={!!col['qs-equations']} onToggle={() => toggle('qs-equations')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['qs-equations'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="space-y-3">
              <EqCard idx={1} name="랜덤 Hadamard 변환" color="purple"
                latex={String.raw`Q = \frac{1}{\sqrt{n}} H_n \cdot \text{diag}(d_1, \ldots, d_n), \quad d_i \sim \pm 1`}
                description="Hadamard 행렬에 랜덤 부호 대각 행렬을 곱하면 완전한 무작위 직교 행렬과 동일한 비간섭 효과를 O(n log n)으로 달성합니다." />
              <EqCard idx={2} name="E8 격자 정의" color="purple"
                latex={String.raw`E_8 = \left\{ x \in \mathbb{R}^8 : x \in \mathbb{Z}^8 \text{ or } x \in (\mathbb{Z}+\tfrac{1}{2})^8,\; \sum_{i=1}^8 x_i \equiv 0 \pmod 2 \right\}`}
                description="E8은 8차원 정수 격자와 반정수 격자의 합집합에서 원소 합이 짝수인 것들. 240개 최소 벡터(거리 √2)가 있으며 8D 공간에서 최적 구체 패킹을 실현합니다." />
              <EqCard idx={3} name="E8 격자 양자화" color="purple"
                latex={String.raw`\hat{w} = \mathop{\arg\min}_{v \in \alpha \cdot E_8} \|w - v\|_2^2`}
                description="8개 가중치 벡터 w를 스케일 α로 조정된 E8 격자점 중 가장 가까운 점으로 양자화합니다." />
              <EqCard idx={4} name="전체 QuIP# 파이프라인" color="purple"
                latex={String.raw`\hat{W} = Q^{\top} \text{E8-quant}\!\left( Q_R \cdot (Q_L W Q_R^{\top}) \cdot Q_C \right) Q_C^{\top} Q_L`}
                description="QuIP#는 4개 Hadamard 변환을 적용합니다: 행렬 전처리용 Q_L, Q_R과 코드북 정렬을 위한 추가 변환. 각 변환이 다른 측면의 비간섭을 개선합니다." />
            </div>
          </Card>
        </div>
      </section>

      {/* Results */}
      <section id="qs-results" className="scroll-mt-20">
        <SectionHeading icon={<BarChart2 className="h-5 w-5" />} title="실험 결과" collapsed={!!col['qs-results']} onToggle={() => toggle('qs-results')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['qs-results'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <p className="mb-3 text-sm font-semibold text-gray-600 dark:text-gray-400">Llama-2 모델 · WikiText-2 Perplexity</p>
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
                    { m: 'FP16', b: '16', p7: '5.47', p13: '4.88', p70: '3.32', hi: false },
                    { m: 'GPTQ', b: '4', p7: '5.63', p13: '4.97', p70: '3.38', hi: false },
                    { m: 'QuIP', b: '2', p7: '6.44', p13: '5.55', p70: '3.97', hi: false },
                    { m: 'QuIP# (스칼라만)', b: '2', p7: '5.97', p13: '5.18', p70: '3.66', hi: false },
                    { m: 'QuIP# (E8 격자)', b: '2', p7: '5.57', p13: '4.95', p70: '3.46', hi: true },
                  ].map((r, i) => (
                    <tr key={i} className={r.hi ? 'bg-purple-50 dark:bg-purple-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}>
                      <td className={`px-3 py-2 font-medium ${r.hi ? 'text-purple-700 dark:text-purple-300' : 'text-gray-700 dark:text-gray-300'}`}>{r.hi && '★ '}{r.m}</td>
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
                <span className="font-bold">핵심 관찰:</span> QuIP# (E8)은 2비트에서 7B PPL 5.57 달성. 4비트 GPTQ(5.63)보다 낮고, 70B에서는 FP16 3.32 vs 2비트 3.46으로 거의 손실 없음.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Quiz */}
      <section id="qs-quiz" className="scroll-mt-20">
        <SectionHeading icon={<FlaskConical className="h-5 w-5" />} title="자기 점검" />
        <Card>
          <QuizSection questions={[
            { q: 'Hadamard 변환이 랜덤 직교 행렬보다 빠른 이유는? 왜 동일한 비간섭 효과를 달성할 수 있나요?', a: 'Hadamard 변환은 재귀적 나비(butterfly) 구조로 O(n log n) 복잡도를 가집니다. 비간섭 효과는 랜덤 부호 벡터 d ∈ {±1}^n를 곱해 달성합니다: H_n·diag(d)의 각 원소는 ±1/√n이고, 원본의 어떤 패턴도 특정 위치에 집중되지 않습니다.' },
            { q: 'E8 격자가 스칼라 2비트 양자화보다 우수한 구체적인 이유는?', a: '스칼라 2비트는 각 차원에서 독립적으로 4개 레벨만 사용합니다. E8은 8차원 공간에서 가중치들을 함께 고려하므로 8D 최적 구체 패킹으로 평균 양자화 오차가 수학적으로 최소화됩니다.' },
            { q: 'QuIP#가 70B 모델에서 특히 효과적인 이유는?', a: '모델이 클수록 가중치가 더 잘 분산되어 비간섭 변환 효과가 크고, 레이어 수가 많아 양자화 오차가 평균화됩니다. 70B Llama-2에서 2비트 PPL 3.46 vs FP16 3.32는 불과 4% 열화로, 8비트 저장 대비 4배 메모리 절약이 가능합니다.' },
          ]} />
        </Card>
      </section>
    </div>
  );
}
