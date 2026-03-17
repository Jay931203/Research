'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  BarChart2,
  BrainCircuit,
  ChevronDown,
  Cpu,
  GraduationCap,
  Hash,
  Shuffle,
  AlertTriangle,
  Network,
  Shield,
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
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">{n}</span>
      <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">{title}</h4>
    </div>
  );
}

function EqCard({ idx, name, latex, desc, color = 'teal' }: { idx: number; name: string; latex: string; desc: string; color?: string }) {
  const [open, setOpen] = useState(false);
  const cm: Record<string, string> = { teal: 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800', indigo: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800', amber: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' };
  const bm: Record<string, string> = { teal: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300', indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300', amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' };
  return (
    <div className="cursor-pointer rounded-xl border border-gray-200 bg-gray-50/50 p-4 transition hover:border-teal-300 dark:border-gray-700 dark:bg-gray-800" onClick={() => setOpen(v => !v)}>
      <div className="mb-2 flex items-center gap-2">
        <span className={`rounded px-2 py-0.5 text-xs font-bold ${bm[color] ?? bm.teal}`}>Eq.{idx}</span>
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{name}</span>
        <ChevronDown className={`ml-auto h-4 w-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </div>
      <div className="overflow-x-auto py-2"><Eq latex={latex} /></div>
      {open ? <div className={`mt-3 rounded-lg border px-4 py-3 ${cm[color] ?? cm.teal}`}><p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">{desc}</p></div> : <p className="mt-1 text-xs text-gray-400">클릭하여 상세 설명 보기</p>}
    </div>
  );
}

/* ── Interactive: Cloud-Edge Flow Viz ─────────────────────────── */

function CloudEdgeFlowViz() {
  const [failRate, setFailRate] = useState(10);
  const [agents, setAgents] = useState(100);
  const mttr = Math.min(2.3 + (failRate - 10) * 0.9, 30);
  const successRate = Math.max(96, 100 - failRate * 0.15);
  const throughputDev = Math.min(failRate * 0.27, 8);

  return (
    <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-4 dark:border-teal-800 dark:bg-teal-900/10">
      <p className="mb-3 text-sm font-bold text-teal-700 dark:text-teal-300">AgentFlow 복원력 시뮬레이터</p>
      <div className="mb-4 grid grid-cols-2 gap-4">
        <label className="text-xs text-gray-600 dark:text-gray-400">
          노드 장애율: <span className="font-bold text-teal-700 dark:text-teal-300">{failRate}%</span>
          <input type="range" min={5} max={50} value={failRate} onChange={e => setFailRate(+e.target.value)} className="mt-1 w-full" />
        </label>
        <label className="text-xs text-gray-600 dark:text-gray-400">
          에이전트 수: <span className="font-bold text-teal-700 dark:text-teal-300">{agents}</span>
          <input type="range" min={10} max={500} step={10} value={agents} onChange={e => setAgents(+e.target.value)} className="mt-1 w-full" />
        </label>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-white p-3 text-center dark:bg-gray-800">
          <p className="text-2xl font-bold text-teal-600">{mttr.toFixed(1)}s</p>
          <p className="text-xs text-gray-500">MTTR</p>
        </div>
        <div className="rounded-lg bg-white p-3 text-center dark:bg-gray-800">
          <p className="text-2xl font-bold text-green-600">{successRate.toFixed(1)}%</p>
          <p className="text-xs text-gray-500">태스크 재할당 성공률</p>
        </div>
        <div className="rounded-lg bg-white p-3 text-center dark:bg-gray-800">
          <p className="text-2xl font-bold text-blue-600">{throughputDev.toFixed(1)}%</p>
          <p className="text-xs text-gray-500">처리량 편차</p>
        </div>
      </div>
      <p className="mt-2 text-center text-xs italic text-gray-500">슬라이더를 조절하여 장애 복원력 변화를 관찰하세요</p>
    </div>
  );
}

/* ── Quiz ─────────────────────────────────────────────────────── */

function Quiz() {
  const qs = [
    { q: 'AgentFlow의 메시징 패러다임은?', opts: ['Request-Response', 'Publish-Subscribe', 'Polling', 'Shared Memory'], ans: 1 },
    { q: 'AgentFlow의 에이전트 조직 모델은?', opts: ['Flat peer-to-peer', 'Holonic (계층적 홀론)', 'Star topology', 'Ring topology'], ans: 1 },
    { q: '500 에이전트, 1000+ tasks/min에서 처리량 편차는?', opts: ['<1%', '<8%', '<20%', '<50%'], ans: 1 },
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
                className={`w-full rounded px-3 py-1.5 text-left text-xs transition ${sel[i] === j ? (show ? (j === q.ans ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300') : 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300') : 'bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400'}`}>
                {o}
              </button>
            ))}
          </div>
        </div>
      ))}
      <button onClick={() => setShow(true)} className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-bold text-white hover:bg-teal-700">정답 확인</button>
      {show && <p className="text-sm font-bold text-teal-700 dark:text-teal-300">점수: {sel.filter((s, i) => s === qs[i].ans).length}/{qs.length}</p>}
    </div>
  );
}

/* ── Main ─────────────────────────────────────────────────────── */

export default function AgentFlowStudyFull() {
  const [col, setCol] = useState<Record<string, boolean>>({});
  const toggle = useCallback((id: string) => setCol(c => ({ ...c, [id]: !c[id] })), []);

  return (
    <div className="space-y-6">
      {/* Overview */}
      <section className="scroll-mt-20">
        <div className="overflow-hidden rounded-xl shadow-sm">
          <div className="bg-gradient-to-br from-teal-700 via-cyan-700 to-blue-700 p-6 pb-8">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white">arXiv 2505.07603</span>
              <span className="rounded-full bg-yellow-400/90 px-3 py-1 text-xs font-bold text-yellow-900">Cloud-Edge MAS</span>
            </div>
            <h2 className="text-xl font-bold leading-snug text-white sm:text-2xl">AgentFlow: Resilient Adaptive Cloud-Edge Framework for Multi-Agent Coordination</h2>
            <p className="mt-3 text-sm text-teal-200">Ching Han Chen, Ming Fang Shiu · May 2025</p>
          </div>
          <div className="bg-white p-6 dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
            <p className="leading-relaxed text-gray-700 dark:text-gray-300">
              이기종 클라우드-엣지 환경에서 <span className="font-semibold text-teal-700 dark:text-teal-300">프로그래머블 분산 시스템</span>을 위한 MAS 프레임워크.
              <strong>홀로닉(Holonic) 멀티에이전트 시스템</strong>으로 계층적 에이전트 조직을 구성하고,
              <strong>Publish-Subscribe 메시징</strong>과 <strong>다대다 서비스 선출</strong>을 통해 중앙 서버 없이 의사결정을 조율합니다.
              플러그앤플레이 노드 발견, 유연한 태스크 재조직, 고도의 장애 허용 메커니즘을 제공합니다.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {['Holonic MAS', 'Pub-Sub Messaging', 'Fault Tolerance', 'Cloud-Edge', 'Service Election'].map(t => (
                <span key={t} className="rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section className="scroll-mt-20">
        <SH icon={<Network className="h-5 w-5" />} title="계층적 아키텍처 (Holonic MAS)" collapsed={!!col['arch']} onToggle={() => toggle('arch')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['arch'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <Sub n="1" title="3-Layer 아키텍처" />
            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { name: 'Orchestration Layer', desc: '태스크 분해, 서비스 플로우 관리, 글로벌 정책 조율', color: 'bg-blue-50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-800' },
                { name: 'Agent Layer', desc: '홀론 단위 에이전트 인스턴스화, 역할 할당, 상태 관리', color: 'bg-teal-50 border-teal-200 dark:bg-teal-900/10 dark:border-teal-800' },
                { name: 'Communication Layer', desc: 'Pub-Sub 메시징, 이벤트 버스, 노드 발견 프로토콜', color: 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800' },
              ].map(l => (
                <div key={l.name} className={`rounded-lg border p-4 ${l.color}`}>
                  <p className="text-xs font-bold text-gray-800 dark:text-gray-200">{l.name}</p>
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{l.desc}</p>
                </div>
              ))}
            </div>

            <Sub n="2" title="홀론(Holon) 구조" />
            <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
              홀론은 자율적이면서 동시에 상위 시스템의 부분인 재귀적 단위입니다.
              각 홀론은 자체 에이전트 집합을 포함하고, 상위 홀론의 지시를 받으면서도 독립적 의사결정이 가능합니다.
            </p>
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
              <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-x-auto">{`
  [Mission Holon]
      ├── [Task Holon A]
      │     ├── Agent-1 (Edge Node)
      │     ├── Agent-2 (Edge Node)
      │     └── Agent-3 (Cloud)
      └── [Task Holon B]
            ├── Agent-4 (Edge Node)
            └── Agent-5 (Cloud)
              `}</pre>
            </div>

            <div className="mt-4">
              <Sub n="3" title="Publish-Subscribe 메시징" />
              <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
                중앙 브로커 없이 토픽 기반 Pub-Sub로 에이전트 간 비동기 통신을 수행합니다.
                에이전트가 특정 토픽을 구독하면, 해당 토픽으로 발행된 메시지를 자동 수신합니다.
                이로써 <strong>다대다(many-to-many) 서비스 선출</strong>이 가능합니다.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Resilience */}
      <section className="scroll-mt-20">
        <SH icon={<Shield className="h-5 w-5" />} title="장애 복원력 메커니즘" collapsed={!!col['res']} onToggle={() => toggle('res')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['res'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <Sub n="1" title="핵심 복원력 패턴" />
            <div className="mb-4 space-y-2">
              {[
                { t: '플러그앤플레이 노드 발견', d: '새 노드가 네트워크에 참여하면 자동 등록 및 역할 할당. 이탈 시 자동 감지 및 태스크 재분배.' },
                { t: '태스크 재할당 (Task Reassignment)', d: '장애 노드의 태스크를 건강한 노드로 자동 이전. 96%+ 재할당 성공률 달성.' },
                { t: '서비스 대체 (Substitution)', d: '동일 기능을 제공하는 대체 에이전트를 서비스 레지스트리에서 탐색하여 즉시 교체.' },
                { t: '그레이스풀 디그레이데이션', d: '일부 노드 장애 시 전체 시스템이 아닌 해당 기능만 성능 저하. 미션 연속성 보장.' },
              ].map(({ t, d }) => (
                <div key={t} className="rounded-lg border border-teal-100 bg-teal-50 p-3 dark:border-teal-900/30 dark:bg-teal-900/10">
                  <p className="text-xs font-bold text-teal-700 dark:text-teal-300">{t}</p>
                  <p className="mt-0.5 text-xs text-teal-600 dark:text-teal-400">{d}</p>
                </div>
              ))}
            </div>

            <Sub n="2" title="복원력 시뮬레이션" />
            <CloudEdgeFlowViz />
          </Card>
        </div>
      </section>

      {/* Equations */}
      <section className="scroll-mt-20">
        <SH icon={<Hash className="h-5 w-5" />} title="핵심 수식" collapsed={!!col['eq']} onToggle={() => toggle('eq')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['eq'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="space-y-3">
              <EqCard idx={1} name="태스크 성공률" latex={String.raw`R_{\text{success}} = \frac{|\{t \in T : \text{completed}(t)\}|}{|T|} \geq 0.95`} desc="전체 태스크 중 완료된 태스크의 비율. 10~30% 노드 장애 하에서도 95% 이상 유지." color="teal" />
              <EqCard idx={2} name="평균 복구 시간 (MTTR)" latex={String.raw`\text{MTTR} = \frac{1}{|F|}\sum_{f \in F}(t_{\text{recover}}(f) - t_{\text{detect}}(f)) < 2.3\text{s}`} desc="장애 감지부터 복구 완료까지의 평균 시간. 장애 감지(heartbeat timeout) + 태스크 재할당 + 서비스 대체까지 포함." color="teal" />
              <EqCard idx={3} name="처리량 안정성" latex={String.raw`\text{Dev}(\Theta) = \frac{|\Theta_{\text{actual}} - \Theta_{\text{expected}}|}{\Theta_{\text{expected}}} \times 100\% < 8\%`} desc="500 에이전트, 1000+ tasks/min 환경에서 실제 처리량과 기대 처리량의 편차. 8% 미만으로 확장성 확인." color="amber" />
              <EqCard idx={4} name="서비스 선출 스코어" latex={String.raw`S_{\text{elect}}(a) = \alpha \cdot \text{Cap}(a) + \beta \cdot \text{Load}^{-1}(a) + \gamma \cdot \text{Prox}(a)`} desc="에이전트 a의 서비스 선출 점수. 능력(Capability), 현재 부하의 역수, 물리적 근접성의 가중합으로 결정." color="indigo" />
            </div>
          </Card>
        </div>
      </section>

      {/* Results */}
      <section className="scroll-mt-20">
        <SH icon={<BarChart2 className="h-5 w-5" />} title="실험 결과 비교" collapsed={!!col['res2']} onToggle={() => toggle('res2')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['res2'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead><tr className="bg-gray-50 dark:bg-gray-800">
                  <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">프레임워크</th>
                  <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">태스크 성공률</th>
                  <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">MTTR</th>
                  <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">확장성</th>
                  <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">분산형</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { m: 'AgentFlow', s: '>95%', mt: '<2.3s', sc: '500+ agents', dec: 'O', hi: true },
                    { m: 'JADE', s: '~85%', mt: '~10s', sc: '~100 agents', dec: 'O', hi: false },
                    { m: 'ROS2 (centralized)', s: '~90%', mt: '~5s', sc: '~50 nodes', dec: 'X', hi: false },
                    { m: 'FIPA-ACL based', s: '~80%', mt: '~15s', sc: '~200 agents', dec: 'O', hi: false },
                  ].map((r, i) => (
                    <tr key={i} className={r.hi ? 'bg-teal-50 dark:bg-teal-900/20' : ''}>
                      <td className={`px-3 py-2 font-medium ${r.hi ? 'text-teal-700 dark:text-teal-300' : 'text-gray-700 dark:text-gray-300'}`}>{r.m}</td>
                      <td className={`px-3 py-2 text-center font-mono ${r.hi ? 'font-bold text-teal-700 dark:text-teal-300' : 'text-gray-600 dark:text-gray-400'}`}>{r.s}</td>
                      <td className="px-3 py-2 text-center font-mono text-gray-600 dark:text-gray-400">{r.mt}</td>
                      <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">{r.sc}</td>
                      <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">{r.dec}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </section>

      {/* Design Decisions */}
      <section className="scroll-mt-20">
        <SH icon={<BrainCircuit className="h-5 w-5" />} title="설계 결정 및 기존 방법 비교" collapsed={!!col['design']} onToggle={() => toggle('design')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['design'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <Sub n="1" title="왜 홀로닉 구조인가?" />
            <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
              기존 MAS 프레임워크는 대부분 flat peer-to-peer 또는 rigid 계층 구조를 사용합니다.
              AgentFlow는 <strong>홀로닉 구조</strong>를 선택하여 두 극단의 장점을 결합합니다:
            </p>
            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900/30 dark:bg-red-900/10">
                <p className="text-xs font-bold text-red-700 dark:text-red-300">Flat P2P 한계</p>
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">O(n^2) 통신 복잡도, 글로벌 합의 어려움, 대규모에서 확장 불가</p>
              </div>
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900/30 dark:bg-red-900/10">
                <p className="text-xs font-bold text-red-700 dark:text-red-300">Rigid 계층 한계</p>
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">상위 노드 장애 시 하위 전체 마비, 유연한 재조직 불가</p>
              </div>
              <div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-900/30 dark:bg-green-900/10">
                <p className="text-xs font-bold text-green-700 dark:text-green-300">홀로닉 장점</p>
                <p className="mt-1 text-xs text-green-600 dark:text-green-400">자율+협력 동시, 동적 재조직, 부분 장애 격리, 재귀적 확장</p>
              </div>
            </div>

            <Sub n="2" title="Pub-Sub vs Request-Response" />
            <div className="mb-4 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead><tr className="bg-gray-50 dark:bg-gray-800">
                  <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">특성</th>
                  <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">Pub-Sub (AgentFlow)</th>
                  <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">Request-Response</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { f: '결합도', ps: '느슨 (토픽 기반)', rr: '강함 (직접 호출)' },
                    { f: '확장성', ps: '높음 (구독자 추가 용이)', rr: '중간 (호출 대상 변경 필요)' },
                    { f: '장애 격리', ps: '우수 (발행자 무관)', rr: '취약 (호출 대상 장애 → 호출자 영향)' },
                    { f: '다대다 통신', ps: '네이티브 지원', rr: '별도 구현 필요' },
                    { f: '지연시간', ps: '비동기 (약간 높음)', rr: '동기 (낮음)' },
                  ].map((r, i) => (
                    <tr key={i}>
                      <td className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">{r.f}</td>
                      <td className="px-3 py-2 text-center text-teal-600 dark:text-teal-400">{r.ps}</td>
                      <td className="px-3 py-2 text-center text-gray-500">{r.rr}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Sub n="3" title="실제 적용 시나리오" />
            <div className="space-y-2">
              {[
                { scenario: '군사 정찰 미션', desc: '드론 홀론이 정찰 구역을 분담하고, 적 발견 시 Pub-Sub로 전체 팀에 즉시 알림. 피격 드론의 태스크는 자동 재할당.', icon: '🎯' },
                { scenario: '스마트 팩토리', desc: '생산 라인별 홀론이 자율 운영. 기계 고장 시 대체 라인 홀론에 태스크 이전. MTTR < 3초로 생산 중단 최소화.', icon: '🏭' },
                { scenario: '재난 대응', desc: '소방/의료/구조 홀론이 독립 운영하면서 토픽 기반으로 상황 공유. 통신 기지국 파괴에도 로컬 메쉬로 동작 지속.', icon: '🚨' },
              ].map(({ scenario, desc, icon }) => (
                <div key={scenario} className="rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{icon} {scenario}</p>
                  <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">{desc}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* Limitations */}
      <section className="scroll-mt-20">
        <SH icon={<AlertTriangle className="h-5 w-5" />} title="한계 및 향후 방향" collapsed={!!col['lim']} onToggle={() => toggle('lim')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['lim'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-sm font-bold text-red-700 dark:text-red-300">한계</p>
                <div className="space-y-2">
                  {[
                    { t: '시뮬레이션 기반 검증', d: '실제 물리 환경(드론, 로봇)에서의 검증 미비. 네트워크 지연, 패킷 손실 등 실제 조건 미반영 가능.' },
                    { t: 'LLM 미통합', d: '전통적 규칙 기반 에이전트 중심. LLM 기반 에이전트의 유연한 추론 능력 미활용.' },
                    { t: '보안 미고려', d: '악의적 에이전트 참여 시 서비스 선출 조작, 토픽 스푸핑 등 공격 벡터 미분석.' },
                  ].map(({ t, d }) => (
                    <div key={t} className="rounded-lg border border-red-100 bg-red-50 p-3 dark:border-red-900/30 dark:bg-red-900/10">
                      <p className="text-xs font-bold text-red-700 dark:text-red-300">{t}</p>
                      <p className="mt-0.5 text-xs text-red-600 dark:text-red-400">{d}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-bold text-green-700 dark:text-green-300">향후 방향</p>
                <div className="space-y-2">
                  {[
                    { t: 'LLM 에이전트 통합', d: 'GPT/Claude 기반 에이전트를 홀론에 배치. 자연어 기반 태스크 이해와 실행.' },
                    { t: '실세계 배포', d: '물리적 로봇/드론에 AgentFlow를 배포하여 실환경 복원력 검증.' },
                    { t: '적응형 토폴로지', d: '네트워크 상태에 따라 홀론 구조를 동적으로 재구성하는 메타 조율 레이어 추가.' },
                  ].map(({ t, d }) => (
                    <div key={t} className="rounded-lg border border-green-100 bg-green-50 p-3 dark:border-green-900/30 dark:bg-green-900/10">
                      <p className="text-xs font-bold text-green-700 dark:text-green-300">{t}</p>
                      <p className="mt-0.5 text-xs text-green-600 dark:text-green-400">{d}</p>
                    </div>
                  ))}
                </div>
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
