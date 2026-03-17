'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  BarChart2,
  BrainCircuit,
  ChevronDown,
  Cpu,
  GraduationCap,
  Hash,
  Target,
  Wifi,
  Layers,
  AlertTriangle,
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
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">{n}</span>
      <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">{title}</h4>
    </div>
  );
}

function EqCard({ idx, name, latex, desc, color = 'blue' }: { idx: number; name: string; latex: string; desc: string; color?: string }) {
  const [open, setOpen] = useState(false);
  const cm: Record<string, string> = { blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800', indigo: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800', amber: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800', green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' };
  const bm: Record<string, string> = { blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300', indigo: 'bg-indigo-100 text-indigo-700', amber: 'bg-amber-100 text-amber-700', green: 'bg-green-100 text-green-700' };
  return (
    <div className="cursor-pointer rounded-xl border border-gray-200 bg-gray-50/50 p-4 transition hover:border-blue-300 dark:border-gray-700 dark:bg-gray-800" onClick={() => setOpen(v => !v)}>
      <div className="mb-2 flex items-center gap-2">
        <span className={`rounded px-2 py-0.5 text-xs font-bold ${bm[color] ?? bm.blue}`}>Eq.{idx}</span>
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{name}</span>
        <ChevronDown className={`ml-auto h-4 w-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </div>
      <div className="overflow-x-auto py-2"><Eq latex={latex} /></div>
      {open ? <div className={`mt-3 rounded-lg border px-4 py-3 ${cm[color] ?? cm.blue}`}><p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">{desc}</p></div> : <p className="mt-1 text-xs text-gray-400">클릭하여 상세 설명 보기</p>}
    </div>
  );
}

/* ── Interactive: Communication Paradigm Comparison ───────────── */

function ParadigmCompare() {
  const [paradigm, setParadigm] = useState<'traditional' | 'semantic' | 'goal'>('traditional');
  const data: Record<string, { name: string; focus: string; metric: string; overhead: string; diagram: string }> = {
    traditional: { name: '전통적 통신', focus: '비트 수준 정확한 전송', metric: 'BER, SNR, Throughput', overhead: '높음 (모든 비트 전송)', diagram: 'Src → Encoder → Channel → Decoder → Dst\n(모든 비트를 정확히 복원)' },
    semantic: { name: '의미 통신', focus: '의미(semantic) 보존', metric: 'Semantic Similarity', overhead: '중간 (의미만 전달)', diagram: 'Src → Semantic Enc → Channel → Semantic Dec → Dst\n(의미적으로 동등한 복원)' },
    goal: { name: '목표 지향 통신', focus: '태스크 목표 달성', metric: 'Task Success Rate', overhead: '최소 (목표 관련 정보만)', diagram: 'Src → Goal Filter → Min Encoding → Channel → Action\n(목표 달성에 필요한 정보만 전달)' },
  };
  const cur = data[paradigm];

  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-800 dark:bg-blue-900/10">
      <p className="mb-3 text-sm font-bold text-blue-700 dark:text-blue-300">통신 패러다임 비교</p>
      <div className="mb-3 flex gap-2">
        {(['traditional', 'semantic', 'goal'] as const).map(p => (
          <button key={p} onClick={() => setParadigm(p)}
            className={`rounded px-3 py-1 text-xs font-bold ${paradigm === p ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 dark:bg-gray-800'}`}>
            {data[p].name}
          </button>
        ))}
      </div>
      <div className="rounded-lg bg-white p-3 dark:bg-gray-800">
        <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{cur.name}</p>
        <div className="mt-2 space-y-1 text-xs text-gray-600 dark:text-gray-400">
          <p><strong>초점:</strong> {cur.focus}</p>
          <p><strong>평가 지표:</strong> {cur.metric}</p>
          <p><strong>통신 오버헤드:</strong> {cur.overhead}</p>
        </div>
        <pre className="mt-2 text-xs font-mono text-blue-600 dark:text-blue-400 whitespace-pre-wrap">{cur.diagram}</pre>
      </div>
      <p className="mt-2 text-xs italic text-gray-500">각 패러다임을 클릭하여 통신 방식의 진화를 확인하세요</p>
    </div>
  );
}

/* ── Interactive: Resource-Constrained Comm Viz ───────────────── */

function ResourceViz() {
  const [bandwidth, setBandwidth] = useState(50);
  const [agents, setAgents] = useState(10);
  const bitsPerAgent = Math.max(1, Math.floor(bandwidth / agents));
  const traditionalSuccess = Math.min(100, bandwidth / (agents * 10) * 100);
  const goalSuccess = Math.min(100, bandwidth / (agents * 3) * 100);

  return (
    <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 dark:border-indigo-800 dark:bg-indigo-900/10">
      <p className="mb-3 text-sm font-bold text-indigo-700 dark:text-indigo-300">자원 제한 하 통신 효과 시뮬레이터</p>
      <div className="mb-4 grid grid-cols-2 gap-4">
        <label className="text-xs text-gray-600 dark:text-gray-400">
          대역폭: <span className="font-bold text-indigo-700">{bandwidth} kbps</span>
          <input type="range" min={10} max={200} value={bandwidth} onChange={e => setBandwidth(+e.target.value)} className="mt-1 w-full" />
        </label>
        <label className="text-xs text-gray-600 dark:text-gray-400">
          에이전트 수: <span className="font-bold text-indigo-700">{agents}</span>
          <input type="range" min={2} max={50} value={agents} onChange={e => setAgents(+e.target.value)} className="mt-1 w-full" />
        </label>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-white p-3 text-center dark:bg-gray-800">
          <p className="text-lg font-bold text-gray-500">{bitsPerAgent}</p>
          <p className="text-xs text-gray-400">bits/agent</p>
        </div>
        <div className="rounded-lg bg-white p-3 text-center dark:bg-gray-800">
          <p className="text-lg font-bold text-red-500">{traditionalSuccess.toFixed(0)}%</p>
          <p className="text-xs text-gray-400">전통적 통신 성공률</p>
        </div>
        <div className="rounded-lg bg-white p-3 text-center dark:bg-gray-800">
          <p className="text-lg font-bold text-blue-600">{goalSuccess.toFixed(0)}%</p>
          <p className="text-xs text-gray-400">목표지향 통신 성공률</p>
        </div>
      </div>
    </div>
  );
}

/* ── Quiz ─────────────────────────────────────────────────────── */

function Quiz() {
  const qs = [
    { q: '목표 지향 통신의 핵심 평가 지표는?', opts: ['BER (Bit Error Rate)', 'SNR', 'Task Success Rate', 'Throughput'], ans: 2 },
    { q: '전통적 통신과 목표 지향 통신의 가장 큰 차이는?', opts: ['인코딩 방식', '전송 매체', '태스크 관련성 기반 정보 필터링', '안테나 수'], ans: 2 },
    { q: '이 논문이 다루는 응용 분야가 아닌 것은?', opts: ['군집 로봇', '연합 학습', '엣지 컴퓨팅', '양자 컴퓨팅'], ans: 3 },
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
                className={`w-full rounded px-3 py-1.5 text-left text-xs transition ${sel[i] === j ? (show ? (j === q.ans ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800') : 'bg-blue-100 text-blue-800') : 'bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400'}`}>
                {o}
              </button>
            ))}
          </div>
        </div>
      ))}
      <button onClick={() => setShow(true)} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700">정답 확인</button>
      {show && <p className="text-sm font-bold text-blue-700">점수: {sel.filter((s, i) => s === qs[i].ans).length}/{qs.length}</p>}
    </div>
  );
}

/* ── Main ─────────────────────────────────────────────────────── */

export default function GoalOrientedMASStudyFull() {
  const [col, setCol] = useState<Record<string, boolean>>({});
  const toggle = useCallback((id: string) => setCol(c => ({ ...c, [id]: !c[id] })), []);

  return (
    <div className="space-y-6">
      {/* Overview */}
      <section className="scroll-mt-20">
        <div className="overflow-hidden rounded-xl shadow-sm">
          <div className="bg-gradient-to-br from-blue-700 via-indigo-700 to-violet-700 p-6 pb-8">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white">arXiv 2508.07720</span>
              <span className="rounded-full bg-yellow-400/90 px-3 py-1 text-xs font-bold text-yellow-900">Goal-Oriented Comm</span>
            </div>
            <h2 className="text-xl font-bold leading-snug text-white sm:text-2xl">Toward Goal-Oriented Communication in Multi-Agent Systems: An Overview</h2>
            <p className="mt-3 text-sm text-blue-200">Themistoklis Charalambous et al. (Aalto University) · August 2025</p>
          </div>
          <div className="bg-white p-6 dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
            <p className="leading-relaxed text-gray-700 dark:text-gray-300">
              자원 제한 환경에서 MAS의 효율적 통신을 위한 <span className="font-semibold text-blue-700 dark:text-blue-300">목표 지향 통신(Goal-Oriented Communication)</span> 종합 서베이.
              전통적 통신이 메시지 충실도나 대역폭 최적화에 집중하는 반면, 목표 지향 통신은
              <strong>에이전트의 공유 목표에 대한 정보의 중요도</strong>를 우선시합니다.
              정보 이론, 통신 이론, 기계학습의 관점을 통합하여 조율 메커니즘을 분석합니다.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {['Goal-Oriented', 'Semantic Communication', 'Resource Constraints', 'Swarm Robotics', 'Federated Learning', 'Edge Computing'].map(t => (
                <span key={t} className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Paradigm Evolution */}
      <section className="scroll-mt-20">
        <SH icon={<Wifi className="h-5 w-5" />} title="통신 패러다임의 진화" collapsed={!!col['evo']} onToggle={() => toggle('evo')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['evo'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <ParadigmCompare />

            <div className="mt-5">
              <Sub n="*" title="3단계 진화 경로" />
              <div className="space-y-2">
                {[
                  { level: 'Level A: 기술적', desc: '심볼을 얼마나 정확하게 전송하는가? (Shannon)', color: 'gray' },
                  { level: 'Level B: 의미적', desc: '전송된 심볼이 원래 의미를 얼마나 보존하는가? (Semantic)', color: 'blue' },
                  { level: 'Level C: 효과적', desc: '수신된 의미가 원하는 행동/목표에 얼마나 기여하는가? (Goal-Oriented)', color: 'indigo' },
                ].map(({ level, desc, color }) => (
                  <div key={level} className={`rounded-lg border border-${color}-200 bg-${color}-50 p-3 dark:border-${color}-800 dark:bg-${color}-900/10`}>
                    <p className={`text-xs font-bold text-${color}-700 dark:text-${color}-300`}>{level}</p>
                    <p className={`mt-0.5 text-xs text-${color}-600 dark:text-${color}-400`}>{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Key Approaches */}
      <section className="scroll-mt-20">
        <SH icon={<BrainCircuit className="h-5 w-5" />} title="핵심 접근법" collapsed={!!col['app']} onToggle={() => toggle('app')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['app'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead><tr className="bg-blue-50 dark:bg-blue-900/20">
                  <th className="px-3 py-2 text-left font-bold text-blue-700">접근법</th>
                  <th className="px-3 py-2 text-left font-bold text-blue-700">핵심 아이디어</th>
                  <th className="px-3 py-2 text-left font-bold text-blue-700">장점</th>
                  <th className="px-3 py-2 text-left font-bold text-blue-700">한계</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { a: '정보 이론적', i: 'Rate-Distortion 최적화로 목표 관련 정보만 인코딩', p: '이론적 하한 제공', l: '실제 구현 복잡' },
                    { a: '학습 기반', i: 'MARL로 what/when/how to communicate 학습', p: '적응적, 태스크 특화', l: '샘플 효율성 낮음' },
                    { a: '창발적 프로토콜', i: '에이전트가 자체 통신 언어를 발전', p: '최소 사전 지식', l: '해석 불가능, 수렴 느림' },
                    { a: '이벤트 트리거', i: '유의미한 변화 시에만 통신 트리거', p: '통신량 대폭 절감', l: '지연 발생 가능' },
                    { a: 'AoI 기반', i: 'Age of Information으로 정보 신선도 관리', p: '시의성 보장', l: '태스크 무관 정보도 전송 가능' },
                  ].map((r, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">{r.a}</td>
                      <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{r.i}</td>
                      <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{r.p}</td>
                      <td className="px-3 py-2 text-gray-500 dark:text-gray-400">{r.l}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </section>

      {/* Resource Sim */}
      <section className="scroll-mt-20">
        <SH icon={<Target className="h-5 w-5" />} title="자원 제한 시뮬레이션" collapsed={!!col['rsim']} onToggle={() => toggle('rsim')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['rsim'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card><ResourceViz /></Card>
        </div>
      </section>

      {/* Equations */}
      <section className="scroll-mt-20">
        <SH icon={<Hash className="h-5 w-5" />} title="핵심 수식" collapsed={!!col['eq']} onToggle={() => toggle('eq')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['eq'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="space-y-3">
              <EqCard idx={1} name="Goal-Oriented Rate-Distortion" latex={String.raw`\min_{p(\hat{s}|s)} I(S; \hat{S}) \quad \text{s.t.} \quad \mathbb{E}[d_{\text{task}}(S, \hat{S})] \leq D_{\text{max}}`} desc="목표 달성에 필요한 최소 통신량(mutual information)을 구하는 최적화. 태스크 특화 왜곡 함수 d_task로 목표 관련 정보만 보존." color="blue" />
              <EqCard idx={2} name="Value of Information (VoI)" latex={String.raw`\text{VoI}(m_i) = J(\pi^*(s \cup m_i)) - J(\pi^*(s))`} desc="메시지 m_i가 추가됨으로써 얻는 정책 성능 향상. VoI가 임계값 이상인 메시지만 전송하여 통신 효율화." color="indigo" />
              <EqCard idx={3} name="이벤트 트리거 조건" latex={String.raw`\text{Send}(t) = \mathbb{1}\!\left[\|x_i(t) - \hat{x}_i(t_{\text{last}})\| > \delta_i\right]`} desc="에이전트 상태 변화가 임계값 delta를 초과할 때만 통신. 통신량을 주기적 전송 대비 70-90% 절감 가능." color="amber" />
              <EqCard idx={4} name="Age of Information" latex={String.raw`\Delta_i(t) = t - t_{\text{last\_received}}^{(i)}`} desc="에이전트 i의 정보 나이: 현재 시각과 최근 수신 시각의 차이. 목표 지향 확장: AoI에 태스크 중요도 가중치를 곱한 Weighted AoI." color="green" />
            </div>
          </Card>
        </div>
      </section>

      {/* Applications */}
      <section className="scroll-mt-20">
        <SH icon={<Layers className="h-5 w-5" />} title="응용 분야 심층 분석" collapsed={!!col['apps']} onToggle={() => toggle('apps')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['apps'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/10">
                <p className="text-sm font-bold text-blue-700 dark:text-blue-300">군집 로봇 (Swarm)</p>
                <p className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                  수백~수천 로봇이 제한된 통신 대역폭으로 협업. 목표 지향 통신이 가장 효과적인 도메인.
                  각 로봇이 목표(탐색, 운반, 방어)에 직접 기여하는 정보만 전달하여 대역폭 90% 절감 가능.
                </p>
                <div className="mt-2 space-y-1">
                  {['탐색 커버리지', '형태 형성', '집단 운반', '방어 대형'].map(t => (
                    <span key={t} className="mr-1 inline-block rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/40">{t}</span>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-800 dark:bg-indigo-900/10">
                <p className="text-sm font-bold text-indigo-700 dark:text-indigo-300">연합 학습 (FL)</p>
                <p className="mt-2 text-xs text-indigo-600 dark:text-indigo-400">
                  분산된 디바이스가 모델을 공동 학습. 그래디언트를 전부 전송하는 대신,
                  목표(모델 수렴)에 가장 기여하는 그래디언트 성분만 선택적으로 전송.
                  통신 라운드당 데이터량 80% 절감하면서 수렴 속도 유지.
                </p>
                <div className="mt-2 space-y-1">
                  {['Gradient Compression', 'Quantized FL', 'Selective Aggregation'].map(t => (
                    <span key={t} className="mr-1 inline-block rounded bg-indigo-100 px-2 py-0.5 text-xs text-indigo-700 dark:bg-indigo-900/40">{t}</span>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/10">
                <p className="text-sm font-bold text-green-700 dark:text-green-300">엣지 컴퓨팅</p>
                <p className="mt-2 text-xs text-green-600 dark:text-green-400">
                  엣지 디바이스와 클라우드 간 통신 최적화. 원시 데이터 대신 태스크 관련 특징(features)만 전송.
                  추론 결과의 신뢰도가 낮을 때만 클라우드에 쿼리하여 통신 비용 절감.
                </p>
                <div className="mt-2 space-y-1">
                  {['Feature Offloading', 'Confidence-based Routing', 'Task-aware Coding'].map(t => (
                    <span key={t} className="mr-1 inline-block rounded bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900/40">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Limitations */}
      <section className="scroll-mt-20">
        <SH icon={<AlertTriangle className="h-5 w-5" />} title="한계 및 열린 문제" collapsed={!!col['lim']} onToggle={() => toggle('lim')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['lim'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                { t: '목표 정의의 모호성', d: '목표를 수학적으로 정확히 정의하기 어려운 태스크 존재. 특히 LLM 기반 MAS에서 "좋은 답변"의 형식화가 난제.', c: 'red' },
                { t: '동적 목표 변경', d: '실행 중 목표가 변경될 때 통신 전략을 실시간으로 재조정하는 메커니즘 미비.', c: 'red' },
                { t: '다목적 에이전트', d: '각 에이전트가 여러 목표를 동시에 추구할 때 VoI 계산이 복잡해지고 트레이드오프 발생.', c: 'orange' },
                { t: 'LLM과의 접점', d: '전통적 목표 지향 통신(신호 처리)과 LLM 기반 MAS(자연어)의 이론적 통합이 미진.', c: 'orange' },
                { t: '학습 효율성', d: '창발적 프로토콜 학습에 수백만 에피소드 필요. 실제 배포 전 사전학습 비용 높음.', c: 'amber' },
                { t: '해석 가능성', d: '학습된 통신 프로토콜이 블랙박스. 디버깅과 안전성 검증 어려움.', c: 'amber' },
              ].map(({ t, d, c }) => (
                <div key={t} className={`rounded-lg border border-${c}-200 bg-${c}-50 p-3 dark:border-${c}-900/30 dark:bg-${c}-900/10`}>
                  <p className={`text-xs font-bold text-${c}-700 dark:text-${c}-300`}>{t}</p>
                  <p className={`mt-0.5 text-xs text-${c}-600 dark:text-${c}-400`}>{d}</p>
                </div>
              ))}
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
