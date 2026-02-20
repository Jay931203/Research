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
  Shuffle,
  AlertTriangle,
} from 'lucide-react';
import katex from 'katex';
import IncoherenceViz from './IncoherenceViz';
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

function QuizSection({ questions, color = 'indigo' }: { questions: { q: string; a: string }[]; color?: string }) {
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const toggle = (i: number) => setRevealed(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; });
  const bgMap: Record<string, string> = {
    indigo: 'border-indigo-200 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-900/20',
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
            <div className={`mx-4 mb-4 rounded-lg border px-4 py-3 ${bgMap[color] ?? bgMap.indigo}`}>
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

/* ── Notation Table ──────────────────────────────────────────── */

function NotationTable() {
  const rows = [
    { sym: 'W ∈ ℝ^{m×n}', desc: '원본 가중치 행렬 (m: 출력 차원, n: 입력 차원)' },
    { sym: 'Ŵ', desc: '양자화된 가중치 행렬' },
    { sym: 'Q_L ∈ O(m), Q_R ∈ O(n)', desc: '비간섭 처리를 위한 랜덤 직교 행렬' },
    { sym: "W' = Q_L W Q_R^T", desc: '비간섭 변환 후 가중치 (양자화 대상)' },
    { sym: "Ŵ' = Quant(W')", desc: '변환 공간에서의 양자화 결과' },
    { sym: "Ŵ = Q_L^T Ŵ' Q_R", desc: '역변환 후 최종 저장 가중치' },
    { sym: 'μ(W)', desc: '비간섭 지수 (coherence measure). 1에 가까울수록 비간섭' },
    { sym: 'H = E[xx^T]', desc: '입력 Hessian (보정 데이터로 추정). LDLQ의 가중치' },
    { sym: 'b', desc: '목표 비트 수 (예: 2)' },
    { sym: 'σ²_W', desc: '가중치 분산' },
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
          {rows.map(({ sym, desc }) => (
            <tr key={sym} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td className="px-4 py-2 font-mono text-indigo-600 dark:text-indigo-400 whitespace-nowrap">{sym}</td>
              <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────── */

export default function QuIPStudyFull() {
  const [col, setCol] = useState<Record<string, boolean>>({});
  const toggle = useCallback((id: string) => setCol(c => ({ ...c, [id]: !c[id] })), []);

  return (
    <GlossaryText>
    <div className="space-y-6">

      {/* ── Overview ─────────────────────────────────────────── */}
      <section id="quip-overview" className="scroll-mt-20">
        <div className="overflow-hidden rounded-xl shadow-sm">
          <div className="bg-gradient-to-br from-indigo-700 via-blue-700 to-cyan-700 p-6 pb-8">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">NeurIPS 2023</span>
              <span className="rounded-full bg-yellow-400/90 px-3 py-1 text-xs font-bold text-yellow-900">최초 2비트 수학적 보장</span>
            </div>
            <h2 className="text-xl font-bold leading-snug text-white sm:text-2xl">
              QuIP: 2-bit Quantization of Large Language Models with Guarantees
            </h2>
            <p className="mt-3 text-sm text-indigo-200">
              Chee et al. (Cornell / Washington 대학교) · NeurIPS 2023
            </p>
          </div>
          <div className="bg-white p-6 dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
            <p className="leading-relaxed text-gray-700 dark:text-gray-300">
              2비트 양자화에서 최초로 수학적 <span className="font-semibold text-indigo-700 dark:text-indigo-300">출력 오차 상한(guarantee)</span>을 제공하는 PTQ 프레임워크.
              핵심 아이디어: 가중치 행렬이 <em>incoherent</em>(비간섭)하면, Frobenius 오차(proxy error)를 최소화하는 것이
              실제 추론 오차를 최소화하는 것과 거의 동치임을 이론으로 증명하고,
              랜덤 직교 변환으로 임의의 행렬을 비간섭 상태로 만들 수 있음을 보입니다.
            </p>
            <p className="mt-3 leading-relaxed text-gray-700 dark:text-gray-300">
              이를 토대로, Hessian 가중 오차를 최소화하는 <span className="font-semibold text-indigo-700 dark:text-indigo-300">LDLQ</span> 알고리즘을 설계하여
              Llama-2-7B에서 2비트 PPL 6.4를 달성합니다(기존 GPTQ 2비트: 25.5, RTN: 발산).
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {['Incoherence Processing', 'LDLQ 알고리즘', 'Proxy Error 이론', '2비트 LLM PTQ'].map(tag => (
                <span key={tag} className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Background ────────────────────────────────────────── */}
      <section id="quip-background" className="scroll-mt-20">
        <SectionHeading icon={<BrainCircuit className="h-5 w-5" />} title="배경: 왜 2비트 양자화가 어려운가?" collapsed={!!col['quip-background']} onToggle={() => toggle('quip-background')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['quip-background'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="1.1" title="균일 양자화 MSE 스케일링" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              b비트 균일 양자화(round-to-nearest)의 MSE는 다음과 같이 스케일됩니다:
            </p>
            <div className="mb-4 overflow-x-auto rounded-lg bg-red-50 p-3 dark:bg-red-900/10">
              <EquationRenderer latex={String.raw`\mathbb{E}[\|W - \hat{W}\|_F^2] \;\propto\; \frac{\|W\|_F^2}{4^b}`} />
            </div>
            <p className="mb-5 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              4비트 → 2비트로 줄이면 오차가 <span className="font-mono font-bold text-red-600 dark:text-red-400">16배</span> 증가합니다.
              이 관계는 가중치 분포가 균일할 때 tight하며, 실제 LLM 가중치는 더 나쁠 수 있습니다.
            </p>

            <SubSectionHeading number="1.2" title="Coherence(간섭) 문제와 아웃라이어" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              실제 LLM 가중치는 <span className="font-semibold text-orange-600 dark:text-orange-400">coherent</span>합니다.
              소수의 원소가 압도적으로 크면, 균일 격자의 step-size를 키워야 하는데, 그러면 나머지 작은 가중치들의 양자화 오차가 폭증합니다.
              이는 LLM.int8() 논문(Dettmers 2022)에서 관찰된 아웃라이어 현상과 같은 뿌리입니다.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-900/10">
                <p className="mb-1 text-xs font-bold text-red-700 dark:text-red-300">Coherent 행렬 (문제)</p>
                <p className="text-xs text-red-600 dark:text-red-400">
                  max|W_ij| ≫ avg|W_ij|<br/>
                  → 격자 범위를 크게 설정해야 함<br/>
                  → 작은 원소들의 상대적 오차 급증<br/>
                  → 2비트에서 사실상 발산
                </p>
              </div>
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900/40 dark:bg-green-900/10">
                <p className="mb-1 text-xs font-bold text-green-700 dark:text-green-300">Incoherent 행렬 (목표)</p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  모든 원소가 비슷한 크기<br/>
                  → 하나의 스케일로 전체 커버 가능<br/>
                  → 이론적 오차 상한 성립<br/>
                  → 2비트에서도 안정적
                </p>
              </div>
            </div>

            <div className="mt-5">
              <SubSectionHeading number="1.3" title="기존 방법들의 한계" />
              <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                <table className="w-full text-xs">
                  <thead><tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">방법</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">2비트 7B PPL</th>
                    <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">한계</th>
                  </tr></thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {[
                      { m: 'RTN (Round-to-Nearest)', ppl: '~10,000+', lim: 'Coherence 무시, 격자 범위 문제' },
                      { m: 'GPTQ (4비트)', ppl: '5.63', lim: '2비트에서는 25.5로 급격히 악화' },
                      { m: 'GPTQ (2비트)', ppl: '25.5', lim: '이론적 보장 없음, Coherence 처리 안 함' },
                      { m: 'SpQR', ppl: '~7.5', lim: '아웃라이어 별도 처리 (high-precision), 복잡한 구현' },
                    ].map((r, i) => (
                      <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">{r.m}</td>
                        <td className="px-3 py-2 text-center font-mono font-semibold text-red-600 dark:text-red-400">{r.ppl}</td>
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

      {/* ── Theoretical Guarantee ─────────────────────────────── */}
      <section id="quip-theory" className="scroll-mt-20">
        <SectionHeading icon={<GraduationCap className="h-5 w-5" />} title="이론적 보장 (Formal Guarantees)" collapsed={!!col['quip-theory']} onToggle={() => toggle('quip-theory')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['quip-theory'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="2.1" title="핵심 질문: Proxy Error → Actual Error?" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              양자화 연구의 근본 질문: <strong>가중치 공간 오차(proxy)를 최소화하면 실제 추론 오차도 줄어드는가?</strong>
              일반적으로는 No입니다. 특정 가중치가 출력에 훨씬 더 많은 영향을 미치기 때문입니다(≈ Hessian 대각 원소의 불균일).
            </p>
            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 dark:border-orange-900/40 dark:bg-orange-900/10">
                <p className="mb-1 text-xs font-bold text-orange-700 dark:text-orange-300">Proxy Error (최적화 대상)</p>
                <div className="overflow-x-auto">
                  <EquationRenderer latex={String.raw`E_P = \|W - \hat{W}\|_F^2`} />
                </div>
              </div>
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900/40 dark:bg-blue-900/10">
                <p className="mb-1 text-xs font-bold text-blue-700 dark:text-blue-300">Actual Error (진짜 관심사)</p>
                <div className="overflow-x-auto">
                  <EquationRenderer latex={String.raw`E_A = \|Wx - \hat{W}x\|^2`} />
                </div>
              </div>
            </div>

            <SubSectionHeading number="2.2" title="비간섭 지수 (Coherence Measure)" />
            <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
              행렬 W의 비간섭 정도를 정량화하는 μ:
            </p>
            <div className="mb-3 overflow-x-auto rounded-lg bg-amber-50 p-3 dark:bg-amber-900/20">
              <EquationRenderer latex={String.raw`\mu(W) \;\triangleq\; \frac{\max_{i,j} |W_{ij}|}{\|W\|_F} \cdot \sqrt{mn}`} />
            </div>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              μ = 1이면 완전 비간섭(모든 원소의 절댓값이 같음). 실제 LLM 가중치는 μ ≫ 1입니다.
              단순 균일 행렬(μ = 1)의 경우, max 원소는 ‖W‖_F / √(mn)이고 이것이 하한입니다.
            </p>

            <SubSectionHeading number="2.3" title="Proxy-to-Actual 오차 상한 (Main Theorem)" />
            <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
              W가 μ-비간섭이고 x가 iid σ²_x-isotropic 분포를 따를 때:
            </p>
            <div className="mb-4 overflow-x-auto rounded-lg bg-indigo-50 p-3 dark:bg-indigo-900/20">
              <EquationRenderer latex={String.raw`\mathbb{E}_x\!\left[\|Wx - \hat{W}x\|^2\right] \;\leq\; \frac{n\,\sigma_x^2\,\mu^2}{\|W\|_F^2} \cdot \|W - \hat{W}\|_F^2`} />
            </div>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              즉, μ가 작을수록 proxy error를 최소화하는 것이 actual error를 최소화하는 것에 가까워집니다.
              μ = O(1)이면 이 두 목적 함수가 사실상 동치가 됩니다.
            </p>
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 dark:border-green-800 dark:bg-green-900/20">
              <p className="text-xs font-semibold text-green-700 dark:text-green-300">증명 스케치 (Johnson-Lindenstrauss 유사 논증)</p>
              <p className="mt-1 text-xs leading-relaxed text-green-600 dark:text-green-400">
                (W - Ŵ)x = Σ_j (W_j - Ŵ_j) x_j. x_j ~ (0, σ²_x)가 독립이면 기댓값은 Σ_j ‖W_j - Ŵ_j‖² σ²_x.
                각 열의 오차 ‖W_j - Ŵ_j‖²는 W_ij의 크기에 비례 → max|W_ij|가 작을수록(비간섭) 오차가 고르게 분산.
                결국 max|W_ij| ≤ μ‖W‖_F/√(mn) 조건에서 위 부등식이 성립합니다.
              </p>
            </div>

            <div className="mt-5">
              <SubSectionHeading number="2.4" title="랜덤 직교 변환으로 μ → O(1) 달성" />
              <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
                Q_L ~ Haar(O(m)), Q_R ~ Haar(O(n)) 에서 독립 샘플링할 때, 변환 후 비간섭 지수의 기댓값:
              </p>
              <div className="mb-3 overflow-x-auto rounded-lg bg-indigo-50 p-3 dark:bg-indigo-900/20">
                <EquationRenderer latex={String.raw`\mathbb{E}[\mu(Q_L W Q_R^\top)] \;\approx\; O\!\left(\sqrt{\frac{1 + \ln(\max(m,n))}{\min(m,n)}}\right) \;\to\; O(1)\text{ as } m,n \to \infty`} />
              </div>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                이 결과의 핵심은, 랜덤 직교 변환이 원소의 에너지를 <em>고르게 분산</em>시킨다는 것입니다.
                어떤 특정 가중치도 다른 것보다 압도적으로 크지 않게 됩니다.
                이것이 QuIP의 &ldquo;guarantees&rdquo;의 수학적 근거이며, 어떤 행렬에도 적용 가능한 범용 접근입니다.
              </p>
              <div className="rounded-lg border border-purple-200 bg-purple-50 px-4 py-3 dark:border-purple-800 dark:bg-purple-900/20">
                <p className="text-xs font-semibold text-purple-700 dark:text-purple-300">압축 센싱(Compressed Sensing)과의 연결</p>
                <p className="mt-1 text-xs leading-relaxed text-purple-600 dark:text-purple-400">
                  비간섭 조건은 압축 센싱의 RIP(Restricted Isometry Property)와 유사한 역할을 합니다.
                  RIP: 희소 신호를 랜덤 행렬로 측정하면 복원 가능. QuIP: 비간섭 가중치는 균일 양자화로 복원 가능.
                  두 경우 모두 &ldquo;randomization → uniform spread → recovery guarantee&rdquo;의 패러다임을 따릅니다.
                </p>
              </div>
            </div>

            <div className="mt-5">
              <SubSectionHeading number="2.5" title="기호 참조" />
              <NotationTable />
            </div>
          </Card>
        </div>
      </section>

      {/* ── Incoherence Processing ────────────────────────────── */}
      <section id="quip-incoherence" className="scroll-mt-20">
        <SectionHeading icon={<Shuffle className="h-5 w-5" />} title="비간섭 처리 (Incoherence Processing)" collapsed={!!col['quip-incoherence']} onToggle={() => toggle('quip-incoherence')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['quip-incoherence'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="3.1" title="전처리/후처리 파이프라인" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              가중치 W에 랜덤 직교 행렬 Q_L, Q_R을 곱해 비간섭 상태로 변환한 뒤 양자화합니다:
            </p>
            <div className="mb-4 overflow-x-auto rounded-lg bg-indigo-50 p-3 dark:bg-indigo-900/20">
              <EquationRenderer latex={String.raw`W' = Q_L W Q_R^{\top} \;\xrightarrow{\text{양자화}}\; \hat{W}' \;\xrightarrow{\text{역변환}}\; \hat{W} = Q_L^{\top} \hat{W}' Q_R`} />
            </div>
            <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">핵심 관찰: 추론 시 Q 불필요</p>
              <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                역변환된 Ŵ = Q_L^T Ŵ′ Q_R만 저장하면 됩니다. Ŵx = Q_L^T(Q_L W Q_R^T · Q_R x) + 오차 = Wx + 오차.
                즉, 추론 시에는 Q_L, Q_R을 전혀 사용하지 않아 추론 지연(latency) 오버헤드가 없습니다.
                단, 양자화 시에는 Q_L, Q_R 생성에 O(n³) QR 분해가 필요합니다(→ QuIP#의 동기).
              </p>
            </div>

            <SubSectionHeading number="3.2" title="비간섭 지수 시각화" />
            <IncoherenceViz />
            <Caption>랜덤 직교 변환을 반복할수록 max 원소가 줄어들어 μ → 1에 수렴합니다.</Caption>

            <div className="mt-5">
              <SubSectionHeading number="3.3" title="실용적 구현" />
              <div className="space-y-2">
                {[
                  { step: '①', text: '균일 분포에서 랜덤 가우시안 행렬 G ∈ ℝ^{m×m}, G\' ∈ ℝ^{n×n} 생성' },
                  { step: '②', text: 'QR 분해: G = Q_L R, G\' = Q_R R\' → Q_L ∈ O(m), Q_R ∈ O(n)' },
                  { step: '③', text: 'W\' = Q_L W Q_R^T 계산 (matrix-matrix 곱, O(mn²) + O(m²n))' },
                  { step: '④', text: 'W\'에 대해 LDLQ 알고리즘 적용하여 Ŵ\' 획득' },
                  { step: '⑤', text: 'Ŵ = Q_L^T Ŵ\' Q_R 역변환 후 저장' },
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

      {/* ── LDLQ Algorithm ───────────────────────────────────── */}
      <section id="quip-ldlq" className="scroll-mt-20">
        <SectionHeading icon={<Cpu className="h-5 w-5" />} title="LDLQ 알고리즘 (Hessian 가중 최적 양자화)" collapsed={!!col['quip-ldlq']} onToggle={() => toggle('quip-ldlq')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['quip-ldlq'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="4.1" title="최적화 문제 정의" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              비간섭 변환 후, 단순한 Frobenius 오차(proxy)가 아닌 <strong>Hessian 가중 오차</strong>를 최소화합니다:
            </p>
            <div className="mb-4 overflow-x-auto rounded-lg bg-indigo-50 p-3 dark:bg-indigo-900/20">
              <EquationRenderer latex={String.raw`\min_{\hat{W}} \;\text{Tr}\!\left[(W - \hat{W})\, H\, (W - \hat{W})^\top\right], \quad H = \mathbb{E}[xx^\top]`} />
            </div>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              H는 레이어 입력의 공분산 행렬로, 보정 데이터(calibration data) 128~256개 샘플로 추정합니다.
              H_jj (대각 원소)가 클수록 j번째 가중치 열이 출력에 미치는 영향이 큽니다.
              이 가중치를 고려한 오차 최소화가 GPTQ 등 Hessian 기반 방법들의 핵심입니다.
            </p>

            <SubSectionHeading number="4.2" title="LDL^T 분해를 활용한 Sequential 양자화" />
            <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
              Hessian H를 LDL^T 분해합니다 (L: 단위 하삼각행렬, D: 양의 대각행렬):
            </p>
            <div className="mb-4 overflow-x-auto rounded-lg bg-purple-50 p-3 dark:bg-purple-900/20">
              <EquationRenderer latex={String.raw`H = L D L^\top, \quad L_{ii} = 1,\; L_{ij} = 0\; (j > i),\; D_{ii} > 0`} />
            </div>
            <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
              LDL^T 구조를 이용하면 최적화 문제가 순차적(sequential)으로 분해됩니다.
              i번째 열 Ŵ_i를 양자화한 후, 그 오차를 이후 열들에 전파합니다:
            </p>
            <div className="mb-5 overflow-x-auto rounded-lg bg-indigo-50 p-3 dark:bg-indigo-900/20">
              <EquationRenderer latex={String.raw`\hat{W}_{:,i} = Q\!\left(W'_{:,i} - \sum_{j > i} \frac{L_{ji}}{D_{ii}}\, e_{:,j}\right), \quad e_{:,j} = W_{:,j} - \hat{W}_{:,j}`} />
            </div>
            <div className="mb-5 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
              <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">GPTQ vs LDLQ 비교</p>
              <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                GPTQ (Frantar 2022): Cholesky 분해를 이용한 순차 양자화. 각 열 양자화 후 오차를 잔여 Hessian으로 업데이트.
                LDLQ: LDL^T 분해가 오차 전파 방향을 더 명확히 정의. 비간섭 전처리가 없으면 GPTQ ≈ LDLQ이나,
                비간섭 처리 후에는 LDLQ의 이론적 보장이 작동합니다.
              </p>
            </div>

            <SubSectionHeading number="4.3" title="전체 알고리즘 파이프라인" />
            <div className="space-y-3">
              {[
                { step: '1', title: 'Hessian 추정', desc: '보정 데이터 128~256 샘플로 H = ΣXX^T/N 계산. 수치 안정성을 위해 damping(λI) 추가: H_damp = H + λI.', color: 'blue' },
                { step: '2', title: '비간섭 변환', desc: 'Q_L, Q_R ← Haar 분포(QR 분해로 샘플링). W\' = Q_L W Q_R^T 계산. H도 같이 변환: H\' = Q_R H Q_R^T.', color: 'indigo' },
                { step: '3', title: "LDL^T 분해", desc: "Hessian H' = LDL^T 분해. L의 순서가 오차 전파 순서를 결정 (큰 D_ii 원소부터 우선 양자화).", color: 'purple' },
                { step: '4', title: '순차 양자화', desc: 'i = 1, ..., n 순서로 각 열을 양자화. 직전 양자화 오차를 e_{:,i}에 저장하고 L_{ji}/D_{ii}로 가중해 전파.', color: 'violet' },
                { step: '5', title: '역변환 & 저장', desc: "Ŵ = Q_L^T Ŵ' Q_R로 역변환. 2비트(4레벨) 그리드로 Ŵ를 저장 — Q_L, Q_R은 저장 불필요.", color: 'teal' },
              ].map(({ step, title, desc, color }) => (
                <div key={step} className={`flex gap-3 rounded-lg border border-${color}-200 bg-${color}-50/70 p-4 dark:border-${color}-900/40 dark:bg-${color}-900/10`}>
                  <span className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-${color}-600 text-xs font-bold text-white`}>{step}</span>
                  <div>
                    <p className={`text-sm font-bold text-${color}-800 dark:text-${color}-200`}>{title}</p>
                    <p className={`mt-0.5 text-xs leading-relaxed text-${color}-700 dark:text-${color}-300`}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* ── Key Equations ─────────────────────────────────────── */}
      <section id="quip-equations" className="scroll-mt-20">
        <SectionHeading icon={<Hash className="h-5 w-5" />} title="핵심 수식 모음" collapsed={!!col['quip-equations']} onToggle={() => toggle('quip-equations')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['quip-equations'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="space-y-3">
              <EqCard idx={1} name="균일 양자화 오차 스케일링" color="indigo"
                latex={String.raw`\mathbb{E}[\|W - \hat{W}\|_F^2] \;\propto\; \frac{\|W\|_F^2}{4^b}`}
                description="b비트 균일 양자화에서 Frobenius 오차는 4^b에 반비례. 4→2비트 전환 시 오차 16배 증가. 이 scaling law가 2비트 LLM 양자화의 어려움의 근원." />

              <EqCard idx={2} name="비간섭 지수" color="amber"
                latex={String.raw`\mu(W) \;\triangleq\; \frac{\max_{i,j} |W_{ij}|}{\|W\|_F} \cdot \sqrt{mn}`}
                description="W가 균일 행렬(모든 원소 같은 크기)이면 μ = 1 (최소, 최적). 실제 LLM 가중치는 μ ≫ 1. μ에 대한 하한은 1이므로, 랜덤 직교 변환 후 μ ≈ O(sqrt(log n / n)) + 1 → 1로 수렴." />

              <EqCard idx={3} name="Proxy-to-Actual 오차 상한" color="indigo"
                latex={String.raw`\mathbb{E}_x\!\left[\|Wx - \hat{W}x\|^2\right] \;\leq\; \frac{n\,\sigma_x^2}{\|W\|_F^2}\,\mu^2\,\|W - \hat{W}\|_F^2`}
                description="QuIP의 핵심 이론. μ = O(1)일 때 proxy error와 actual error는 상수 배수 차이로 연결됨. 즉 proxy를 최소화하면 actual error도 O(1)배 이내에서 최소화됨. 이것이 '보장(guarantee)'." />

              <EqCard idx={4} name="비간섭 변환 (Incoherence Processing)" color="purple"
                latex={String.raw`W' = Q_L W Q_R^{\top},\quad \hat{W} = Q_L^{\top}\,\text{Quant}(W')\,Q_R`}
                description="변환 W'은 비간섭(μ ≈ 1). 양자화 후 역변환 Ŵ를 저장. 추론 시에는 Ŵx = Q_L^T·Quant(Q_LWQ_R^T)·Q_R·x로 원래 연산과 등가 (Q 없이 Ŵ만으로 가능)." />

              <EqCard idx={5} name="LDLQ 목적 함수" color="purple"
                latex={String.raw`\min_{\hat{W}} \;\text{Tr}\!\left[(W - \hat{W})\,H\,(W - \hat{W})^\top\right], \quad H = \mathbb{E}[xx^\top]`}
                description="Hessian H로 가중된 오차. H_jj가 큰 j번째 열이 출력에 더 중요하므로, 해당 가중치를 더 정확하게 양자화해야 함. H = L D L^T 분해 후 순차 최적화." />

              <EqCard idx={6} name="LDLQ 열 업데이트" color="green"
                latex={String.raw`\hat{W}_{:,i} = Q\!\left(W_{:,i} - \sum_{j < i} \frac{L_{ij}}{D_{jj}}\,e_{:,j}\right), \;\; e_{:,j} = W_{:,j} - \hat{W}_{:,j}`}
                description="i번째 열을 양자화할 때, 이전에 양자화된 j < i 열들의 오차 e_{:,j}를 L_{ij}/D_{jj}로 가중하여 보정. 이전 오차가 누적되지 않도록 Hessian 구조로 분산시킴." />
            </div>
          </Card>
        </div>
      </section>

      {/* ── Results ───────────────────────────────────────────── */}
      <section id="quip-results" className="scroll-mt-20">
        <SectionHeading icon={<BarChart2 className="h-5 w-5" />} title="실험 결과" collapsed={!!col['quip-results']} onToggle={() => toggle('quip-results')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['quip-results'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <p className="mb-3 text-sm font-semibold text-gray-600 dark:text-gray-400">Llama-2 · WikiText-2 Perplexity ↓ (낮을수록 좋음)</p>
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
                    { m: 'FP16 기준',          b: '16', p7: '5.47',  p13: '4.88',  p70: '3.32',  hi: false, bad: false },
                    { m: 'GPTQ',               b: '4',  p7: '5.63',  p13: '4.97',  p70: '3.38',  hi: false, bad: false },
                    { m: 'RTN',                b: '2',  p7: '1e4+',  p13: '1e4+',  p70: '—',     hi: false, bad: true  },
                    { m: 'GPTQ',               b: '2',  p7: '25.54', p13: '18.29', p70: '9.29',  hi: false, bad: true  },
                    { m: 'SpQR (혼합 정밀도)', b: '≈3', p7: '7.52',  p13: '6.25',  p70: '—',     hi: false, bad: false },
                    { m: 'QuIP ★',             b: '2',  p7: '6.44',  p13: '5.55',  p70: '3.97',  hi: true,  bad: false },
                  ].map((r, i) => (
                    <tr key={i} className={r.hi ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}>
                      <td className={`px-3 py-2 font-medium ${r.hi ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'}`}>{r.m}</td>
                      <td className="px-3 py-2 text-center font-mono text-gray-500 dark:text-gray-400">{r.b}</td>
                      {[r.p7, r.p13, r.p70].map((v, j) => (
                        <td key={j} className={`px-3 py-2 text-center font-mono font-semibold ${r.bad ? 'text-red-600 dark:text-red-400' : r.hi ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400'}`}>{v}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 dark:border-indigo-800 dark:bg-indigo-900/20">
                <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">핵심 관찰 ①</p>
                <p className="mt-1 text-xs text-indigo-600 dark:text-indigo-400">
                  기존 2비트 방법(GPTQ 25.5, RTN 발산)이 완전히 실패하는 반면, QuIP는 6.44로 사용 가능한 수준 달성.
                  비간섭 처리가 결정적 역할.
                </p>
              </div>
              <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-800 dark:bg-blue-900/20">
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">핵심 관찰 ②</p>
                <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                  70B 모델에서 3.97 PPL: FP16(3.32) 대비 +0.65. 모델이 클수록 비간섭 변환 효과 증가 → 확장성 있는 접근.
                </p>
              </div>
            </div>

            <div className="mt-4">
              <SubSectionHeading number="5.1" title="Ablation: 비간섭 처리 효과" />
              <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                <table className="w-full text-xs">
                  <thead><tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">설정</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">7B PPL</th>
                    <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">비고</th>
                  </tr></thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {[
                      { cfg: 'LDLQ only (비간섭 없음)', ppl: '12.3',  note: 'GPTQ 수준, Coherence 문제 있음' },
                      { cfg: 'Incoherence only (RTN)', ppl: '8.1',   note: '비간섭이 먼저, 양자화는 단순' },
                      { cfg: 'QuIP (LDLQ + Incoherence)', ppl: '6.44', note: '두 기법의 시너지' },
                    ].map((r, i) => (
                      <tr key={i} className={i === 2 ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}>
                        <td className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">{r.cfg}</td>
                        <td className={`px-3 py-2 text-center font-mono font-semibold ${i === 2 ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400'}`}>{r.ppl}</td>
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

      {/* ── Limitations & Future ──────────────────────────────── */}
      <section id="quip-limits" className="scroll-mt-20">
        <SectionHeading icon={<AlertTriangle className="h-5 w-5" />} title="한계 및 후속 연구 방향" collapsed={!!col['quip-limits']} onToggle={() => toggle('quip-limits')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['quip-limits'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-3 text-sm font-bold text-red-700 dark:text-red-300">QuIP의 한계</p>
                <div className="space-y-2">
                  {[
                    { t: '랜덤 직교 변환 비용', d: 'O(n³) QR 분해가 필요. Llama-2-7B의 4096×4096 레이어에서 레이어당 수십 초 소요. 전체 양자화에 수 시간 필요.' },
                    { t: '스칼라 양자화의 한계', d: '각 원소를 독립적으로 2비트(4 레벨)로 양자화. 원소 간 상관관계를 활용하지 못함. → QuIP#의 E8 격자로 해결.' },
                    { t: '1비트 미지원', d: '이론적 보장은 2비트 이상에서 작동. 1비트에서는 AQLM 등 다른 접근 필요.' },
                    { t: 'KV 캐시 양자화 미적용', d: '가중치만 양자화. 실제 추론 시 KV 캐시도 메모리 병목 → 별도 접근 필요.' },
                  ].map(({ t, d }) => (
                    <div key={t} className="rounded-lg border border-red-100 bg-red-50 p-3 dark:border-red-900/30 dark:bg-red-900/10">
                      <p className="text-xs font-bold text-red-700 dark:text-red-300">{t}</p>
                      <p className="mt-0.5 text-xs text-red-600 dark:text-red-400">{d}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-3 text-sm font-bold text-green-700 dark:text-green-300">후속 연구 (QuIP → QuIP#)</p>
                <div className="space-y-2">
                  {[
                    { t: 'Hadamard 변환', d: 'O(n log n) Walsh-Hadamard 변환(WHT)으로 O(n³) QR 분해를 대체. 속도 수백 배 향상.' },
                    { t: 'E8 격자 코드북', d: '스칼라 4 레벨 → 8차원 E8 격자 256 레벨. 동일 비트 수에서 표현 공간 64배 확장.' },
                    { t: 'Near-lossless 2비트', d: 'QuIP#로 Llama-2-7B 2비트 PPL 5.57 달성 (FP16 5.47 대비 0.1 열화).' },
                    { t: 'Fine-tuning 추가 (AQLM)', d: '전역 SGD 미세조정으로 레이어 간 오차 보상. 2비트에서 PPL 5.22 달성.' },
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
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">연구 관점의 의의</p>
              <p className="mt-1 text-xs leading-relaxed text-amber-600 dark:text-amber-400">
                QuIP 이전에는 2비트 LLM 양자화에 이론적 근거가 없었습니다.
                &ldquo;비간섭 = 균일 양자화의 이론적 보장&rdquo;이라는 프레임은 이후 QuIP#, AQLM, QuaRot 등 후속 연구의 이론적 기반이 되었습니다.
                CSI 압축 맥락에서도 유사한 아이디어가 적용 가능합니다: 채널 행렬 H_채널이 coherent한 경우,
                랜덤 프리코딩 행렬로 비간섭 상태를 만들면 low-bit 피드백의 이론적 성능을 보장할 수 있습니다.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Quiz ─────────────────────────────────────────────── */}
      <section id="quip-quiz" className="scroll-mt-20">
        <SectionHeading icon={<FlaskConical className="h-5 w-5" />} title="자기 점검 (연구자 수준)" />
        <Card>
          <QuizSection color="indigo" questions={[
            {
              q: 'QuIP의 "guarantee"가 무엇이며, 이것이 기존 GPTQ와 근본적으로 다른 점은?',
              a: 'QuIP는 비간섭(μ ≈ 1) 조건 하에서 E_actual ≤ (nσ²_x/‖W‖²_F)μ²·E_proxy를 수학적으로 보장합니다. GPTQ는 Hessian 가중 최적화(LDLQ와 유사)를 쓰지만, 이론적 actual error bound를 제공하지 않습니다. 결정적 차이: QuIP는 비간섭 처리로 proxy error 최소화가 actual error 최소화를 보장하는 조건(μ = O(1))을 능동적으로 만들어냅니다.',
            },
            {
              q: 'LDL^T 분해가 Cholesky(GPTQ) 대비 이론적으로 어떤 이점을 제공하는가?',
              a: 'Cholesky: H = LL^T (L: 하삼각, 양의 정부호 필요). LDL^T: H = LDL^T (L: 단위 하삼각, D: 양의 대각). LDL^T는 H가 반정부호(semi-definite)인 경우에도 안정적이며, D의 대각 원소가 각 열의 "중요도"를 직접 인코딩합니다. 비간섭 전처리 후에는 H ≈ I (등방성)에 가까워지므로 LDL^T ≈ I·I·I가 되어 단순 RTN과 유사해지는데, 이것이 이론적으로 최적임을 QuIP는 증명합니다.',
            },
            {
              q: '추론 시 Q_L, Q_R을 저장하지 않아도 되는 이유를 수식으로 설명하라.',
              a: 'Ŵ = Q_L^T · Quant(Q_L W Q_R^T) · Q_R. 추론 시: Ŵx = Q_L^T · Q_L · W · Q_R^T · Q_R · x + 오차 = Wx + 오차. Q_L^T Q_L = I, Q_R^T Q_R = I (직교 행렬). 따라서 Ŵ 자체만 저장하면 됩니다. 이는 비간섭 처리가 "양자화 전처리"에만 영향을 미치고, 저장/추론 형식은 일반 행렬과 동일함을 의미합니다.',
            },
            {
              q: 'μ(W) = 1은 어떤 행렬인가? 실제 LLM에서 μ가 큰 이유는?',
              a: 'μ(W) = 1이면 max|W_ij| = ‖W‖_F/√(mn)이고, 이는 모든 원소의 절댓값이 동일한 경우입니다. 실제 LLM에서 μ가 큰 이유: (1) Attention의 softmax 포화 현상으로 특정 가중치가 극단적으로 커짐, (2) LayerNorm이 없는 구간에서 스케일이 누적됨, (3) FFN의 SiLU/GELU 비선형성이 특정 방향의 가중치를 증폭. 실제로 Llama-2의 일부 레이어에서 μ > 10이 관찰됩니다.',
            },
            {
              q: 'QuIP의 비간섭 처리가 CSI 압축 연구에 주는 시사점은?',
              a: '채널 행렬 H_c는 일반적으로 coherent합니다 (강한 LoS 성분, 상관 안테나 등). 만약 비간섭 프리코더 P를 적용해 PH_c가 비간섭이 되면, 각 채널 계수를 저비트로 균등하게 양자화해도 복원 오차의 이론적 상한이 성립합니다. 이는 CSI 피드백 비트 할당에서 "모든 채널에 동일 비트"가 최적임을 시사 — 현재의 비선형 비트 할당보다 단순하면서도 성능 보장 가능.',
            },
          ]} />
        </Card>
      </section>
    </div>
    </GlossaryText>
  );
}
