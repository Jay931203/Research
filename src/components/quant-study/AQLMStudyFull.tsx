'use client';

import { useCallback, useMemo, useState } from 'react';
import { BarChart2, BrainCircuit, ChevronDown, Cpu, FlaskConical, Hash } from 'lucide-react';
import katex from 'katex';
import AddQuantViz from './AddQuantViz';

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
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">{number}</span>
      <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">{title}</h4>
    </div>
  );
}

function Caption({ children }: { children: React.ReactNode }) {
  return <p className="mt-2 text-center text-xs italic text-gray-500 dark:text-gray-400">{children}</p>;
}

function EqCard({ idx, name, latex, description }: {
  idx: number; name: string; latex: string; description: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="cursor-pointer rounded-xl border border-gray-200 bg-gray-50/50 p-4 transition hover:border-emerald-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-emerald-700" onClick={() => setOpen(v => !v)}>
      <div className="mb-2 flex items-center gap-2">
        <span className="rounded px-2 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">Eq. {idx}</span>
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{name}</span>
        <ChevronDown className={`ml-auto h-4 w-4 text-gray-400 transition-transform dark:text-gray-500 ${open ? 'rotate-180' : ''}`} />
      </div>
      <div className="overflow-x-auto py-2 text-gray-900 dark:text-gray-100"><EquationRenderer latex={latex} /></div>
      {open ? (
        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800 dark:bg-emerald-900/20">
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
            <div className="mx-4 mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800 dark:bg-emerald-900/20">
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

export default function AQLMStudyFull() {
  const [col, setCol] = useState<Record<string, boolean>>({});
  const toggle = useCallback((id: string) => setCol(c => ({ ...c, [id]: !c[id] })), []);

  return (
    <div className="space-y-6">
      {/* Overview */}
      <section id="aqlm-overview" className="scroll-mt-20">
        <div className="overflow-hidden rounded-xl shadow-sm">
          <div className="bg-gradient-to-br from-emerald-700 via-teal-700 to-cyan-700 p-6 pb-8">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">ICML 2024 (Best Paper 후보)</span>
              <span className="rounded-full bg-yellow-400/90 px-3 py-1 text-xs font-bold text-yellow-900">가산 양자화</span>
            </div>
            <h2 className="text-xl font-bold leading-snug text-white sm:text-2xl">
              AQLM: Extreme Compression of Large Language Models via Additive Quantization
            </h2>
            <p className="mt-3 text-sm text-emerald-200">Vage Egiazarian, Andrei Panferov, Denis Kuznedelev 외 (IST Austria, Yandex) · ICML 2024</p>
          </div>
          <div className="bg-white p-6 dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
            <p className="leading-relaxed text-gray-700 dark:text-gray-300">
              음성/이미지 압축에서 검증된{' '}
              <span className="font-semibold text-emerald-700 dark:text-emerald-300">가산 양자화(Additive Quantization, AQ)</span> 기법을 LLM 가중치 압축에 적용합니다.
              각 가중치 열(column)을 M개 코드북의 합으로 표현해, 동일 비트 수에서 단순 스칼라 양자화보다 훨씬 풍부한 표현 공간을 사용합니다.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {['M개 코드북', '빔 서치 최적화', '전역 SGD 미세조정', '1~2비트 SOTA'].map(tag => (
                <span key={tag} className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Core Idea */}
      <section id="aqlm-idea" className="scroll-mt-20">
        <SectionHeading icon={<BrainCircuit className="h-5 w-5" />} title="핵심 아이디어: 가산 양자화" collapsed={!!col['aqlm-idea']} onToggle={() => toggle('aqlm-idea')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['aqlm-idea'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="1.1" title="기본 표현" />
            <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">각 가중치 열 w ∈ ℝᵈ를 M개 코드북의 합으로 표현합니다:</p>
            <div className="mb-4 overflow-x-auto rounded-lg bg-emerald-50 p-3 dark:bg-emerald-900/20">
              <EquationRenderer latex={String.raw`\hat{w}_j = \sum_{m=1}^{M} C_m[\, b_{j,m}\,], \quad C_m \in \mathbb{R}^{d \times K},\; b_{j,m} \in [K]`} />
            </div>
            <p className="mb-5 text-sm text-gray-600 dark:text-gray-400">
              C_m은 m번째 코드북 (d×K 행렬, K = 2^k 코드워드), b_&#123;j,m&#125;은 j번째 열의 m번째 코드북 인덱스. 유효 비트 수 = M·k/d 비트/가중치.
            </p>
            <SubSectionHeading number="1.2" title="인터랙티브 데모" />
            <AddQuantViz />
            <Caption>코드북을 하나씩 추가할수록 잔차(residual)가 줄어드는 과정을 확인하세요.</Caption>
            <div className="mt-5">
              <SubSectionHeading number="1.3" title="스칼라 양자화 vs 가산 양자화" />
              <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                <table className="w-full text-xs">
                  <thead><tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">특성</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">스칼라 (GPTQ)</th>
                    <th className="px-3 py-2 text-center text-emerald-600 dark:text-emerald-400">가산 (AQLM)</th>
                  </tr></thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {[
                      { prop: '코드북 크기', scalar: 'K (단일)', aqlm: 'K^M (효과적)' },
                      { prop: '가중치 간 의존성', scalar: '없음', aqlm: '공유 코드북으로 포착' },
                      { prop: '2비트 레벨 수 (d=8)', scalar: '4', aqlm: '최대 4^M' },
                      { prop: '최적화 방법', scalar: '그리디 (GPTQ)', aqlm: '빔 서치 + SGD' },
                    ].map(r => (
                      <tr key={r.prop} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">{r.prop}</td>
                        <td className="px-3 py-2 text-center text-gray-500 dark:text-gray-400">{r.scalar}</td>
                        <td className="px-3 py-2 text-center font-semibold text-emerald-600 dark:text-emerald-400">{r.aqlm}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Algorithm */}
      <section id="aqlm-algorithm" className="scroll-mt-20">
        <SectionHeading icon={<Cpu className="h-5 w-5" />} title="알고리즘: 빔 서치 + 전역 SGD" collapsed={!!col['aqlm-algorithm']} onToggle={() => toggle('aqlm-algorithm')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['aqlm-algorithm'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">이산 코드 B와 연속 코드북 C를 동시에 최적화하는 교대 최적화 방식입니다:</p>
            <div className="space-y-4">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-900/20">
                <p className="mb-2 text-sm font-bold text-emerald-700 dark:text-emerald-300">Phase 1: 코드 탐색 (빔 서치)</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">C 고정 → B 최적화. 단순 그리디는 전역 최적을 보장하지 않으므로 빔 폭 B의 빔 서치로 탐색. 시간 복잡도: O(K × B × M)</p>
              </div>
              <div className="rounded-xl border border-teal-200 bg-teal-50 p-4 dark:border-teal-800 dark:bg-teal-900/20">
                <p className="mb-2 text-sm font-bold text-teal-700 dark:text-teal-300">Phase 2: 코드북 업데이트 (SGD)</p>
                <p className="text-xs text-teal-600 dark:text-teal-400">B 고정 → C 최적화. 코드 인덱스를 고정한 채 코드북 원소를 SGD로 업데이트합니다. 목적 함수: min_C ‖WX - ΣC_m[B_m]X‖²_F</p>
              </div>
              <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-4 dark:border-cyan-800 dark:bg-cyan-900/20">
                <p className="mb-2 text-sm font-bold text-cyan-700 dark:text-cyan-300">Phase 3: 전역 미세조정 (STE)</p>
                <p className="text-xs text-cyan-600 dark:text-cyan-400">전체 모델을 소규모 보정 데이터로 end-to-end 미세조정. 이산 B의 기울기는 Straight-Through Estimator(STE)로 근사합니다: ∂L/∂b ≈ ∂L/∂Ĉ[b]</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Equations */}
      <section id="aqlm-equations" className="scroll-mt-20">
        <SectionHeading icon={<Hash className="h-5 w-5" />} title="핵심 수식" collapsed={!!col['aqlm-equations']} onToggle={() => toggle('aqlm-equations')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['aqlm-equations'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="space-y-3">
              <EqCard idx={1} name="가산 양자화 표현"
                latex={String.raw`\hat{W}_{:,j} = \sum_{m=1}^{M} C_m\!\left[\, b_{j,m} \,\right], \quad C_m \in \mathbb{R}^{d \times K}`}
                description="j번째 가중치 열을 M개 코드북 조회의 합으로 표현합니다. C_m은 d×K 코드북 행렬이고, b_{j,m}은 [1, K] 범위의 정수 인덱스입니다." />
              <EqCard idx={2} name="효과적 비트 수"
                latex={String.raw`\text{bits/weight} = \frac{M \cdot \log_2 K}{d} = \frac{M \cdot k}{d}`}
                description="d차원 가중치 열에 M개 코드북, 각 크기 K = 2^k를 사용하면 열 당 M·k 비트가 필요합니다. d=8, M=2, k=8이면 2·8/8 = 2 비트/가중치." />
              <EqCard idx={3} name="AQLM 전체 목적 함수"
                latex={String.raw`\min_{\{C_m\}, \{B\}} \sum_{\ell=1}^{L} \left\| W^{(\ell)} X^{(\ell)} - \hat{W}^{(\ell)} X^{(\ell)} \right\|_F^2`}
                description="모든 레이어 ℓ에 걸쳐 입력 X^(ℓ)에서의 출력 오차를 최소화합니다. 전역 목적함수를 사용하므로 레이어 간 오차 보상이 가능합니다." />
              <EqCard idx={4} name="빔 서치 코드 탐색"
                latex={String.raw`b_{j,1:M}^{\star} = \mathop{\arg\min}_{b_1,\ldots,b_M \in [K]^M} \left\| w_j - \sum_{m=1}^{M} C_m[b_m] \right\|_2^2`}
                description="각 열 j에 대해 M개 코드 인덱스의 최적 조합을 찾습니다. K^M 가지를 모두 탐색하는 대신 빔 서치로 빔 폭 B × K 후보만 유지합니다." />
            </div>
          </Card>
        </div>
      </section>

      {/* Results */}
      <section id="aqlm-results" className="scroll-mt-20">
        <SectionHeading icon={<BarChart2 className="h-5 w-5" />} title="실험 결과" collapsed={!!col['aqlm-results']} onToggle={() => toggle('aqlm-results')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['aqlm-results'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead><tr className="bg-gray-50 dark:bg-gray-800">
                  <th className="px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-400">방법</th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-gray-400">비트</th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-gray-400">7B PPL</th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-gray-400">13B PPL</th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-gray-400">설정</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { m: 'FP16', b: '16', p7: '5.47', p13: '4.88', cfg: '—', hi: false },
                    { m: 'QuIP#', b: '2', p7: '5.57', p13: '4.95', cfg: 'E8', hi: false },
                    { m: 'AQLM (M=1)', b: '2', p7: '5.92', p13: '5.15', cfg: 'K=65536', hi: false },
                    { m: 'AQLM (M=2)', b: '2', p7: '5.22', p13: '4.72', cfg: 'K=256, d=8', hi: true },
                    { m: 'AQLM (M=1)', b: '1', p7: '7.35', p13: '6.12', cfg: 'K=65536', hi: false },
                  ].map((r, i) => (
                    <tr key={i} className={r.hi ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}>
                      <td className={`px-3 py-2 font-medium ${r.hi ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-700 dark:text-gray-300'}`}>{r.hi && '★ '}{r.m}</td>
                      <td className="px-3 py-2 text-center font-mono text-gray-500 dark:text-gray-400">{r.b}</td>
                      <td className={`px-3 py-2 text-center font-mono font-semibold ${r.hi ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-600 dark:text-gray-400'}`}>{r.p7}</td>
                      <td className={`px-3 py-2 text-center font-mono font-semibold ${r.hi ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-600 dark:text-gray-400'}`}>{r.p13}</td>
                      <td className="px-3 py-2 text-center text-gray-500 dark:text-gray-400">{r.cfg}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800 dark:bg-emerald-900/20">
              <p className="text-xs text-emerald-700 dark:text-emerald-300">
                <span className="font-bold">핵심 관찰:</span> AQLM M=2가 2비트에서 PPL 5.22로 QuIP#(5.57)를 크게 뛰어넘습니다. 전역 SGD 미세조정이 약 0.3 PPL을 추가로 개선합니다.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Quiz */}
      <section id="aqlm-quiz" className="scroll-mt-20">
        <SectionHeading icon={<FlaskConical className="h-5 w-5" />} title="자기 점검" />
        <Card>
          <QuizSection questions={[
            { q: 'AQLM의 "가산" 구조가 단순 코드북 크기 증가보다 나은 이유는?', a: '단일 코드북으로 K=65536을 사용하면 코드북 자체가 너무 커서 학습이 어렵습니다. M=2개 코드북 각각 K=256이면 512개 코드워드만 학습하면 되는데, 조합으로 65536가지 표현이 가능합니다.' },
            { q: '빔 서치가 그리디 탐색보다 필요한 이유는?', a: 'M=2일 때 m=1 코드를 먼저 최적화하고 m=2를 최적화하는 그리디 방식은 전역 최적을 놓칩니다. 빔 서치는 빔 폭 B만큼의 유망한 m=1 코드를 유지하면서 m=2까지 함께 탐색합니다.' },
            { q: 'STE(Straight-Through Estimator)가 전역 미세조정에 필요한 이유는?', a: '이산 인덱스 b는 불연속 함수여서 역전파가 불가능합니다. STE는 순전파에서는 실제 양자화된 값을 사용하되, 역전파에서는 기울기를 그대로 통과시킵니다.' },
          ]} />
        </Card>
      </section>
    </div>
  );
}
