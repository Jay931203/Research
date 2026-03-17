'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  BarChart2,
  BrainCircuit,
  ChevronDown,
  Cpu,
  GraduationCap,
  Hash,
  Network,
  AlertTriangle,
  DollarSign,
} from 'lucide-react';
import katex from 'katex';

/* ── helpers ─────────────────────────────────────────────────── */

function Eq({ latex }: { latex: string }) {
  const html = useMemo(() => {
    try { return katex.renderToString(latex, { throwOnError: false, displayMode: true }); }
    catch { return null; }
  }, [latex]);
  if (!html) return <code className="block text-center text-sm text-red-400">{latex}</code>;
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

function Card({ children, cls = '' }: { children: React.ReactNode; cls?: string }) {
  return <div className={`rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900 dark:ring-1 dark:ring-gray-800 ${cls}`}>{children}</div>;
}

function SH({ icon, title, collapsed, onToggle }: { icon: React.ReactNode; title: string; collapsed?: boolean; onToggle?: () => void }) {
  return (
    <button onClick={onToggle} className="mb-3 flex w-full items-center gap-2.5 text-left">
      <span className="text-gray-500 dark:text-gray-400">{icon}</span>
      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">{title}</h3>
      {onToggle && <ChevronDown className={`ml-auto h-5 w-5 text-gray-400 transition-transform ${collapsed ? '-rotate-90' : ''}`} />}
    </button>
  );
}

function Sub({ n, title }: { n: string; title: string }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">{n}</span>
      <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">{title}</h4>
    </div>
  );
}

function EqCard({ idx, name, latex, desc, color = 'emerald' }: { idx: number; name: string; latex: string; desc: string; color?: string }) {
  const [open, setOpen] = useState(false);
  const cm: Record<string, string> = { emerald: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800', indigo: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800', amber: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800', purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800' };
  const bm: Record<string, string> = { emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300', indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300', amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300', purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' };
  return (
    <div className="cursor-pointer rounded-xl border border-gray-200 bg-gray-50/50 p-4 transition hover:border-emerald-300 dark:border-gray-700 dark:bg-gray-800" onClick={() => setOpen(v => !v)}>
      <div className="mb-2 flex items-center gap-2">
        <span className={`rounded px-2 py-0.5 text-xs font-bold ${bm[color] ?? bm.emerald}`}>Eq.{idx}</span>
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{name}</span>
        <ChevronDown className={`ml-auto h-4 w-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </div>
      <div className="overflow-x-auto py-2"><Eq latex={latex} /></div>
      {open ? <div className={`mt-3 rounded-lg border px-4 py-3 ${cm[color] ?? cm.emerald}`}><p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">{desc}</p></div> : <p className="mt-1 text-xs text-gray-400">클릭하여 상세 설명 보기</p>}
    </div>
  );
}

/* ── Interactive: Cost-Performance Tradeoff ───────────────────── */

function CostPerformanceViz() {
  const [costWeight, setCostWeight] = useState(50);
  const perfWeight = 100 - costWeight;
  const mmluGain = (perfWeight / 100 * 3.35).toFixed(2);
  const costReduction = (costWeight / 100 * 15.38).toFixed(1);
  const mbppGain = (perfWeight / 100 * 3.53).toFixed(2);
  const mbppCostRed = (costWeight / 100 * 12.13).toFixed(1);

  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-800 dark:bg-emerald-900/10">
      <p className="mb-3 text-sm font-bold text-emerald-700 dark:text-emerald-300">비용-성능 트레이드오프 시뮬레이터</p>
      <label className="mb-3 block text-xs text-gray-600 dark:text-gray-400">
        비용 절감 가중치: <span className="font-bold text-emerald-700 dark:text-emerald-300">{costWeight}%</span> vs 성능 가중치: <span className="font-bold text-blue-700 dark:text-blue-300">{perfWeight}%</span>
        <input type="range" min={0} max={100} value={costWeight} onChange={e => setCostWeight(+e.target.value)} className="mt-1 w-full" />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-white p-3 dark:bg-gray-800">
          <p className="text-xs font-bold text-gray-500">MMLU</p>
          <p className="text-lg font-bold text-blue-600">+{mmluGain}%</p>
          <p className="text-xs text-gray-400">정확도 향상</p>
        </div>
        <div className="rounded-lg bg-white p-3 dark:bg-gray-800">
          <p className="text-xs font-bold text-gray-500">MMLU 비용</p>
          <p className="text-lg font-bold text-emerald-600">-{costReduction}%</p>
          <p className="text-xs text-gray-400">추론 비용 절감</p>
        </div>
        <div className="rounded-lg bg-white p-3 dark:bg-gray-800">
          <p className="text-xs font-bold text-gray-500">MBPP</p>
          <p className="text-lg font-bold text-blue-600">+{mbppGain}%</p>
          <p className="text-xs text-gray-400">정확도 향상</p>
        </div>
        <div className="rounded-lg bg-white p-3 dark:bg-gray-800">
          <p className="text-xs font-bold text-gray-500">MBPP 비용</p>
          <p className="text-lg font-bold text-emerald-600">-{mbppCostRed}%</p>
          <p className="text-xs text-gray-400">추론 비용 절감</p>
        </div>
      </div>
    </div>
  );
}

/* ── Interactive: Graph Builder ───────────────────────────────── */

function GraphBuilder() {
  const [agents, setAgents] = useState(['Planner', 'Coder', 'Reviewer']);
  const [edges, setEdges] = useState([{ from: 0, to: 1, strategy: 'debate' }, { from: 1, to: 2, strategy: 'review' }]);
  const strategies = ['debate', 'review', 'vote', 'delegate', 'negotiate'];

  return (
    <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-4 dark:border-purple-800 dark:bg-purple-900/10">
      <p className="mb-3 text-sm font-bold text-purple-700 dark:text-purple-300">MAS 그래프 시각화</p>
      <div className="mb-3 flex flex-wrap gap-2">
        {agents.map((a, i) => (
          <div key={i} className="rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
            {a}
          </div>
        ))}
      </div>
      <div className="space-y-1">
        {edges.map((e, i) => (
          <div key={i} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <span className="font-mono font-bold">{agents[e.from]}</span>
            <span className="text-purple-400">--[{e.strategy}]--&gt;</span>
            <span className="font-mono font-bold">{agents[e.to]}</span>
            <select value={e.strategy} onChange={ev => { const n = [...edges]; n[i] = { ...n[i], strategy: ev.target.value }; setEdges(n); }}
              className="ml-2 rounded bg-white px-1 py-0.5 text-xs dark:bg-gray-800">
              {strategies.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs italic text-gray-500">각 엣지의 협업 전략을 변경하여 이기종 협업 패턴을 탐색하세요</p>
    </div>
  );
}

/* ── Quiz ─────────────────────────────────────────────────────── */

function Quiz() {
  const qs = [
    { q: 'SC-MAS가 영감을 받은 이론은?', opts: ['Game Theory', 'Social Capital Theory', 'Information Theory', 'Control Theory'], ans: 1 },
    { q: 'SC-MAS의 3단계 구축 과정에서 두 번째 단계는?', opts: ['역할 선택', '엣지 수준 협업 전략 수립', 'LLM 백본 할당', '쿼리 분석'], ans: 1 },
    { q: 'MMLU에서 SC-MAS의 비용 절감률은?', opts: ['5%', '10%', '15.38%', '20%'], ans: 2 },
  ];
  const [sel, setSel] = useState<(number | null)[]>(qs.map(() => null));
  const [show, setShow] = useState(false);

  return (
    <div className="space-y-4">
      {qs.map((q, i) => (
        <div key={i} className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
          <p className="mb-2 text-sm font-bold text-gray-700 dark:text-gray-300">Q{i + 1}. {q.q}</p>
          <div className="space-y-1">
            {q.opts.map((o, j) => (
              <button key={j} onClick={() => { const n = [...sel]; n[i] = j; setSel(n); }}
                className={`w-full rounded px-3 py-1.5 text-left text-xs transition ${sel[i] === j ? (show ? (j === q.ans ? 'bg-green-100 text-green-800 dark:bg-green-900/30' : 'bg-red-100 text-red-800 dark:bg-red-900/30') : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30') : 'bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400'}`}>
                {o}
              </button>
            ))}
          </div>
        </div>
      ))}
      <button onClick={() => setShow(true)} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700">정답 확인</button>
      {show && <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">점수: {sel.filter((s, i) => s === qs[i].ans).length}/{qs.length}</p>}
    </div>
  );
}

/* ── Main ─────────────────────────────────────────────────────── */

export default function SCMASStudyFull() {
  const [col, setCol] = useState<Record<string, boolean>>({});
  const toggle = useCallback((id: string) => setCol(c => ({ ...c, [id]: !c[id] })), []);

  return (
    <div className="space-y-6">
      {/* Overview */}
      <section className="scroll-mt-20">
        <div className="overflow-hidden rounded-xl shadow-sm">
          <div className="bg-gradient-to-br from-emerald-700 via-green-700 to-teal-700 p-6 pb-8">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white">arXiv 2601.09434</span>
              <span className="rounded-full bg-yellow-400/90 px-3 py-1 text-xs font-bold text-yellow-900">Edge Heterogeneous MAS</span>
            </div>
            <h2 className="text-xl font-bold leading-snug text-white sm:text-2xl">SC-MAS: Cost-Efficient Multi-Agent Systems with Edge-Level Heterogeneous Collaboration</h2>
            <p className="mt-3 text-sm text-emerald-200">Di Zhao et al. (NUDT) · January 2026</p>
          </div>
          <div className="bg-white p-6 dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
            <p className="leading-relaxed text-gray-700 dark:text-gray-300">
              <span className="font-semibold text-emerald-700 dark:text-emerald-300">Social Capital Theory</span>에 기반하여
              MAS를 <strong>방향 그래프</strong>로 모델링하고, 엣지(edge)가 에이전트 쌍 간의 협업 전략을 명시적으로 표현합니다.
              기존의 동질적(homogeneous) 협업 모드를 넘어, 역할별로 최적화된 <strong>이기종(heterogeneous) 협업</strong>을 가능하게 합니다.
              MMLU에서 정확도 +3.35%, 비용 -15.38%를 동시에 달성합니다.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {['Social Capital Theory', 'Directed Graph MAS', 'Heterogeneous Collaboration', 'Cost Optimization', 'LLM Routing'].map(t => (
                <span key={t} className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3-Stage Pipeline */}
      <section className="scroll-mt-20">
        <SH icon={<Cpu className="h-5 w-5" />} title="3단계 MAS 구축 파이프라인" collapsed={!!col['pipe']} onToggle={() => toggle('pipe')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['pipe'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="space-y-3">
              {[
                { step: '1', title: '역할 선택 (Role Selection)', desc: '입력 쿼리에 적합한 에이전트 역할을 후보 풀에서 선택. Social Capital Theory의 "structural hole" 개념 적용 - 중복을 최소화하면서 다양한 전문성을 확보.', color: 'emerald' },
                { step: '2', title: '엣지 수준 협업 전략 (Edge-Level Strategy)', desc: '선택된 에이전트 쌍 간의 협업 방식을 개별적으로 결정. debate, review, delegate 등 다양한 전략을 쌍별로 독립 할당. 기존의 "모든 에이전트가 같은 방식으로 협업" 문제를 해결.', color: 'green' },
                { step: '3', title: 'LLM 백본 할당 (Backbone Assignment)', desc: '각 에이전트에 적합한 LLM을 할당. 역할과 협업 컨텍스트를 모두 고려하여 고성능 모델(GPT-4) vs 경량 모델(GPT-3.5)을 최적 배분. 비용과 성능의 균형.', color: 'teal' },
              ].map(({ step, title, desc, color }) => (
                <div key={step} className={`flex gap-3 rounded-lg border border-${color}-200 bg-${color}-50/70 p-4 dark:border-${color}-900/40 dark:bg-${color}-900/10`}>
                  <span className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-${color}-600 text-xs font-bold text-white`}>{step}</span>
                  <div>
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-gray-600 dark:text-gray-400">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5">
              <Sub n="*" title="이기종 협업 그래프 빌더" />
              <GraphBuilder />
            </div>
          </Card>
        </div>
      </section>

      {/* Social Capital Theory */}
      <section className="scroll-mt-20">
        <SH icon={<BrainCircuit className="h-5 w-5" />} title="Social Capital Theory 연결" collapsed={!!col['sct']} onToggle={() => toggle('sct')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['sct'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <p className="mb-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              Social Capital Theory (사회적 자본 이론)는 사회 네트워크에서 행위자 간 관계의 질과 구조가 성과에 미치는 영향을 연구합니다.
              SC-MAS는 이 이론의 세 가지 차원을 MAS에 직접 매핑합니다:
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { dim: 'Structural (구조적)', mas: '그래프 토폴로지', desc: '에이전트 간 연결 구조가 정보 흐름과 협업 효율성을 결정' },
                { dim: 'Relational (관계적)', mas: '엣지 수준 전략', desc: '에이전트 쌍 간의 신뢰, 협업 방식이 성과에 직접 영향' },
                { dim: 'Cognitive (인지적)', mas: 'LLM 백본 선택', desc: '공유 목표와 이해 수준이 협업의 질을 결정' },
              ].map(({ dim, mas, desc }) => (
                <div key={dim} className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-900/10">
                  <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">{dim}</p>
                  <p className="mt-1 text-xs font-semibold text-gray-700 dark:text-gray-300">{mas}</p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{desc}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* Equations */}
      <section className="scroll-mt-20">
        <SH icon={<Hash className="h-5 w-5" />} title="핵심 수식" collapsed={!!col['eq']} onToggle={() => toggle('eq')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['eq'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="space-y-3">
              <EqCard idx={1} name="MAS 그래프 모델" latex={String.raw`G = (V, E), \quad V = \{a_1, \ldots, a_n\}, \quad E \subseteq V \times V \times \mathcal{S}`} desc="MAS를 방향 그래프로 모델링. V는 에이전트(노드), E는 협업 관계(엣지). 각 엣지는 협업 전략 집합 S에서 선택된 전략을 포함." color="emerald" />
              <EqCard idx={2} name="비용-성능 공동 최적화" latex={String.raw`\min_{V, E, M} \; \lambda \cdot \text{Cost}(V, E, M) - (1 - \lambda) \cdot \text{Perf}(V, E, M)`} desc="에이전트 집합 V, 엣지 전략 E, 모델 할당 M을 동시에 최적화. lambda는 비용-성능 트레이드오프 파라미터." color="indigo" />
              <EqCard idx={3} name="이기종 협업 이점" latex={String.raw`\text{Gain}_{\text{hetero}} = \text{Perf}(G_{\text{hetero}}) - \text{Perf}(G_{\text{homo}}) > 0`} desc="동일 에이전트 구성에서 이기종(역할별 다른 전략) 협업이 동질적 협업보다 항상 성능이 높음을 실험적으로 검증." color="purple" />
              <EqCard idx={4} name="추론 비용 모델" latex={String.raw`\text{Cost}(G) = \sum_{a_i \in V} c(m_i) \cdot T_i + \sum_{(a_i, a_j) \in E} c_{\text{comm}}(s_{ij})`} desc="총 비용 = 각 에이전트의 (모델 비용 x 토큰 수) + 엣지별 통신 비용의 합. 경량 모델 할당과 효율적 통신 전략으로 비용 절감." color="amber" />
            </div>
          </Card>
        </div>
      </section>

      {/* Results */}
      <section className="scroll-mt-20">
        <SH icon={<BarChart2 className="h-5 w-5" />} title="실험 결과" collapsed={!!col['res']} onToggle={() => toggle('res')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['res'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <Sub n="1" title="비용-성능 트레이드오프 시뮬레이터" />
            <CostPerformanceViz />

            <div className="mt-5">
              <Sub n="2" title="벤치마크 비교" />
              <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                <table className="w-full text-xs">
                  <thead><tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">방법</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">MMLU Acc</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">MBPP Acc</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">비용 절감</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">이기종</th>
                  </tr></thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {[
                      { m: 'Single Agent (GPT-4)', a1: 'baseline', a2: 'baseline', c: '-', h: 'N/A', hi: false },
                      { m: 'Homogeneous MAS', a1: '+1.2%', a2: '+1.1%', c: '+40%', h: 'X', hi: false },
                      { m: 'Dynamic Routing', a1: '+2.1%', a2: '+2.0%', c: '-8%', h: 'X', hi: false },
                      { m: 'SC-MAS', a1: '+3.35%', a2: '+3.53%', c: '-15.38%', h: 'O', hi: true },
                    ].map((r, i) => (
                      <tr key={i} className={r.hi ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''}>
                        <td className={`px-3 py-2 font-medium ${r.hi ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-700 dark:text-gray-300'}`}>{r.m}</td>
                        <td className={`px-3 py-2 text-center font-mono ${r.hi ? 'font-bold text-emerald-700' : 'text-gray-600'}`}>{r.a1}</td>
                        <td className={`px-3 py-2 text-center font-mono ${r.hi ? 'font-bold text-emerald-700' : 'text-gray-600'}`}>{r.a2}</td>
                        <td className={`px-3 py-2 text-center font-mono ${r.hi ? 'font-bold text-emerald-700' : 'text-gray-600'}`}>{r.c}</td>
                        <td className="px-3 py-2 text-center text-gray-600">{r.h}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Quiz */}
      <section className="scroll-mt-20">
        <SH icon={<GraduationCap className="h-5 w-5" />} title="이해도 점검 퀴즈" collapsed={!!col['quiz']} onToggle={() => toggle('quiz')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['quiz'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card><Quiz /></Card>
        </div>
      </section>
    </div>
  );
}
