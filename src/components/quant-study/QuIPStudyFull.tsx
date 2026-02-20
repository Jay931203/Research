'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  BarChart2,
  BrainCircuit,
  ChevronDown,
  Cpu,
  FlaskConical,
  Hash,
  Shuffle,
} from 'lucide-react';
import katex from 'katex';
import IncoherenceViz from './IncoherenceViz';

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
    amber: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
  };
  const badgeMap: Record<string, string> = {
    indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  };
  return (
    <div className="cursor-pointer rounded-xl border border-gray-200 bg-gray-50/50 p-4 transition hover:border-blue-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-700" onClick={() => setOpen(v => !v)}>
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
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">클릭하여 한국어 설명 보기</p>
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

/* ── Main component ──────────────────────────────────────────── */

export default function QuIPStudyFull() {
  const [col, setCol] = useState<Record<string, boolean>>({});
  const toggle = useCallback((id: string) => setCol(c => ({ ...c, [id]: !c[id] })), []);

  return (
    <div className="space-y-6">
      {/* Overview */}
      <section id="quip-overview" className="scroll-mt-20">
        <div className="overflow-hidden rounded-xl shadow-sm">
          <div className="bg-gradient-to-br from-indigo-700 via-blue-700 to-cyan-700 p-6 pb-8">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">NeurIPS 2023</span>
              <span className="rounded-full bg-yellow-400/90 px-3 py-1 text-xs font-bold text-yellow-900">2비트 LLM 양자화</span>
            </div>
            <h2 className="text-xl font-bold leading-snug text-white sm:text-2xl">
              QuIP: 2-bit Quantization of Large Language Models with Guarantees
            </h2>
            <p className="mt-3 text-sm text-indigo-200">Tim Dettmers, Luke Zettlemoyer 외 (Washington 대학교) · NeurIPS 2023</p>
          </div>
          <div className="bg-white p-6 dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
            <p className="leading-relaxed text-gray-700 dark:text-gray-300">
              2비트 양자화에서 최초로 수학적 보장(guarantee)을 제공하는 PTQ 프레임워크.
              가중치 행렬에 <span className="font-semibold text-indigo-700 dark:text-indigo-300">랜덤 직교 변환</span>을 적용해
              비간섭(incoherence) 상태로 만든 뒤 양자화합니다.
              비간섭 조건 하에서 양자화 오차가 전 가중치에 균일하게 분산되어, 어느 단일 가중치도 결과를 지배하지 않게 됩니다.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {['비간섭 처리', 'LDLQ 알고리즘', '수학적 보장', '2비트 PTQ'].map(tag => (
                <span key={tag} className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Background */}
      <section id="quip-background" className="scroll-mt-20">
        <SectionHeading icon={<BrainCircuit className="h-5 w-5" />} title="배경: 왜 2비트 양자화가 어려운가?" collapsed={!!col['quip-background']} onToggle={() => toggle('quip-background')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['quip-background'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="1.1" title="균일 양자화 오차 스케일링" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">b비트 균일 양자화의 MSE는 다음과 같이 스케일됩니다:</p>
            <div className="mb-4 overflow-x-auto rounded-lg bg-red-50 p-3 dark:bg-red-900/10">
              <EquationRenderer latex={String.raw`\mathbb{E}[\|W - \hat{W}\|_F^2] \propto \frac{\sigma^2}{4^b}`} />
            </div>
            <p className="mb-5 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              4비트 → 2비트로 줄이면 오차가 <span className="font-mono font-bold text-red-600 dark:text-red-400">16배</span> 증가합니다.
            </p>
            <SubSectionHeading number="1.2" title="간섭(Coherence) 문제" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              실제 LLM 가중치 행렬은 <span className="font-semibold text-orange-600 dark:text-orange-400">간섭(coherent)</span>합니다.
              일부 가중치가 다른 것보다 훨씬 크면 균일 양자화 격자가 전체에 맞지 않습니다.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-900/10">
                <p className="mb-1 text-xs font-bold text-red-700 dark:text-red-300">간섭 행렬 (Coherent)</p>
                <p className="text-xs text-red-600 dark:text-red-400">일부 원소가 매우 큼 → 양자화 격자를 키우면 작은 원소의 오차 증가.</p>
              </div>
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900/40 dark:bg-green-900/10">
                <p className="mb-1 text-xs font-bold text-green-700 dark:text-green-300">비간섭 행렬 (Incoherent)</p>
                <p className="text-xs text-green-600 dark:text-green-400">모든 원소가 비슷한 크기 → 하나의 스케일로 전체 양자화 가능.</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Incoherence */}
      <section id="quip-incoherence" className="scroll-mt-20">
        <SectionHeading icon={<Shuffle className="h-5 w-5" />} title="비간섭 처리 (Incoherence Processing)" collapsed={!!col['quip-incoherence']} onToggle={() => toggle('quip-incoherence')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['quip-incoherence'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="2.1" title="핵심 아이디어" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">가중치 행렬 W에 랜덤 직교 행렬 Q를 곱해 비간섭 상태로 변환한 뒤 양자화합니다:</p>
            <div className="mb-4 overflow-x-auto rounded-lg bg-indigo-50 p-3 dark:bg-indigo-900/20">
              <EquationRenderer latex={String.raw`W' = Q_L W Q_R^{\top}, \quad \hat{W} = Q_L^{\top} \hat{W}' Q_R`} />
            </div>
            <SubSectionHeading number="2.2" title="간섭 지수 (Coherence Measure)" />
            <div className="mb-4 overflow-x-auto rounded-lg bg-amber-50 p-3 dark:bg-amber-900/20">
              <EquationRenderer latex={String.raw`\mu(W) = \frac{\max_{i,j}|W_{ij}|}{\|W\|_F} \sqrt{mn}`} />
            </div>
            <p className="mb-5 text-sm text-gray-600 dark:text-gray-400">
              μ = 1이면 완전 비간섭(최적). 랜덤 직교 변환 후 μ는 1에 가까워집니다.
            </p>
            <IncoherenceViz />
            <Caption>랜덤 회전을 반복할수록 max 원소가 줄어들어 비간섭 조건에 근접합니다.</Caption>
          </Card>
        </div>
      </section>

      {/* LDLQ */}
      <section id="quip-ldlq" className="scroll-mt-20">
        <SectionHeading icon={<Cpu className="h-5 w-5" />} title="LDLQ 알고리즘" collapsed={!!col['quip-ldlq']} onToggle={() => toggle('quip-ldlq')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['quip-ldlq'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">Hessian 정보를 활용한 순차적 양자화 알고리즘. GPTQ와 유사하지만 비간섭 전처리 후 적용됩니다.</p>
            <div className="space-y-3">
              {[
                { step: '1', title: '입력-Hessian 계산', desc: '보정 데이터로 각 레이어의 입력 Hessian H = XX^T/N을 계산합니다.', color: 'blue' },
                { step: '2', title: '비간섭 변환', desc: 'Q = randn(d, d) → QR 분해 → Q_L, Q_R 생성. W\' = Q_L W Q_R^T로 변환합니다.', color: 'indigo' },
                { step: '3', title: 'LDL^T 분해', desc: 'Hessian을 LDL^T 분해. L의 구조를 이용해 순차 양자화 순서를 결정합니다.', color: 'purple' },
                { step: '4', title: '순차 양자화 + 오차 보정', desc: 'GPTQ 방식으로 한 번에 하나씩 양자화하고 Hessian 가중 오차를 잔여 열에 전파합니다.', color: 'violet' },
                { step: '5', title: '역변환', desc: 'Ŵ = Q_L^T Ŵ\' Q_R로 원래 공간으로 복원합니다. 추론 시에는 Q가 필요 없습니다.', color: 'teal' },
              ].map(({ step, title, desc, color }) => (
                <div key={step} className={`flex gap-3 rounded-lg border border-${color}-200 bg-${color}-50 p-4 dark:border-${color}-900/40 dark:bg-${color}-900/10`}>
                  <span className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-${color}-600 text-xs font-bold text-white`}>{step}</span>
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
        <SectionHeading icon={<Hash className="h-5 w-5" />} title="핵심 수식" collapsed={!!col['quip-equations']} onToggle={() => toggle('quip-equations')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['quip-equations'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="space-y-3">
              <EqCard idx={1} name="균일 양자화 오차 스케일링" color="indigo"
                latex={String.raw`\mathbb{E}[\|W - \hat{W}\|_F^2] \propto \frac{\|W\|_F^2}{4^b}`}
                description="b비트 균일 양자화에서 Frobenius 오차는 4^b에 반비례합니다. 2비트 → 4비트는 16배 오차 감소." />
              <EqCard idx={2} name="간섭 지수 (Coherence)" color="amber"
                latex={String.raw`\mu(W) \triangleq \frac{\max_{i,j}|W_{ij}|}{\|W\|_F} \cdot \sqrt{mn}`}
                description="W가 완전 비간섭이면 μ = 1. 랜덤 직교 변환 후 μ → 1 + O(log(mn)/sqrt(mn))으로 수렴합니다." />
              <EqCard idx={3} name="비간섭 변환 전/후 비교" color="indigo"
                latex={String.raw`W' = Q_L W Q_R^{\top} \xrightarrow{\text{양자화}} \hat{W}' \xrightarrow{\text{역변환}} \hat{W} = Q_L^{\top} \hat{W}' Q_R`}
                description="전처리 → 양자화 → 후처리의 3단계. 추론 시에는 역변환된 Ŵ만 저장합니다." />
              <EqCard idx={4} name="LDLQ 목적 함수" color="purple"
                latex={String.raw`\min_{\hat{W}} \|W - \hat{W}\|_{H}^2 = \min_{\hat{W}} \text{Tr}\big((W-\hat{W})H(W-\hat{W})^{\top}\big)`}
                description="Hessian 가중 놈으로 오차를 측정. H = E[xx^T]는 각 가중치가 출력에 미치는 영향을 반영합니다." />
              <EqCard idx={5} name="비간섭 조건의 양자화 오차 상한" color="indigo"
                latex={String.raw`\mathbb{E}\!\left[\|W\hat{x} - \hat{W}\hat{x}\|^2\right] \leq \mu^2 \cdot \frac{\sigma_W^2 d}{4^b}`}
                description="비간섭(μ 작음) 조건에서 실제 추론 오차가 μ^2에 비례해 상한을 가집니다. 이것이 '보장(guarantees)'의 핵심입니다." />
            </div>
          </Card>
        </div>
      </section>

      {/* Results */}
      <section id="quip-results" className="scroll-mt-20">
        <SectionHeading icon={<BarChart2 className="h-5 w-5" />} title="실험 결과" collapsed={!!col['quip-results']} onToggle={() => toggle('quip-results')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['quip-results'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <p className="mb-3 text-sm font-semibold text-gray-600 dark:text-gray-400">Llama-2 모델 · WikiText-2 Perplexity (↓ 낮을수록 좋음)</p>
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
                <span className="font-bold">핵심 관찰:</span> 기존 2비트 방법(GPTQ, RTN)이 완전히 실패(PPL 1만 이상)하는 반면, QuIP는 6.4로 사용 가능한 수준을 달성.
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
            { q: 'QuIP에서 "비간섭(incoherence)"이란 무엇이며, 왜 양자화에 유리한가요?', a: '비간섭이란 가중치 행렬의 모든 원소가 비슷한 크기를 가지는 상태(간섭 지수 μ ≈ 1)입니다. 이 조건에서는 균일 양자화 격자 하나로 모든 가중치를 효율적으로 커버할 수 있어, 양자화 오차가 이론적으로 보장된 상한을 가집니다.' },
            { q: '랜덤 직교 변환 Q를 적용해도 추론 정확도가 유지되는 이유는?', a: 'W\'x\' = (Q_L W Q_R^T)(Q_R x) = Q_L (Wx)이므로 원래 연산과 동일합니다. 역변환된 Ŵ = Q_L^T Ŵ\' Q_R만 저장하므로 추론 시 추가 연산이 없습니다.' },
            { q: 'LDLQ가 단순한 round-to-nearest보다 나은 이유는?', a: 'LDLQ는 Hessian(입력 공분산) 가중 오차를 최소화하고, 이미 양자화된 가중치의 오차를 이후 가중치들의 업데이트에 반영합니다.' },
          ]} />
        </Card>
      </section>
    </div>
  );
}
