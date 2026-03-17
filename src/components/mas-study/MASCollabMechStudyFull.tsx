'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  BarChart2,
  BrainCircuit,
  ChevronDown,
  Cpu,
  GraduationCap,
  Hash,
  Users,
  Network,
  Layers,
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
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">{n}</span>
      <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">{title}</h4>
    </div>
  );
}

function EqCard({ idx, name, latex, desc, color = 'orange' }: { idx: number; name: string; latex: string; desc: string; color?: string }) {
  const [open, setOpen] = useState(false);
  const cm: Record<string, string> = { orange: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800', indigo: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800', purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800', green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' };
  const bm: Record<string, string> = { orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300', indigo: 'bg-indigo-100 text-indigo-700', purple: 'bg-purple-100 text-purple-700', green: 'bg-green-100 text-green-700' };
  return (
    <div className="cursor-pointer rounded-xl border border-gray-200 bg-gray-50/50 p-4 transition hover:border-orange-300 dark:border-gray-700 dark:bg-gray-800" onClick={() => setOpen(v => !v)}>
      <div className="mb-2 flex items-center gap-2">
        <span className={`rounded px-2 py-0.5 text-xs font-bold ${bm[color] ?? bm.orange}`}>Eq.{idx}</span>
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{name}</span>
        <ChevronDown className={`ml-auto h-4 w-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </div>
      <div className="overflow-x-auto py-2"><Eq latex={latex} /></div>
      {open ? <div className={`mt-3 rounded-lg border px-4 py-3 ${cm[color] ?? cm.orange}`}><p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">{desc}</p></div> : <p className="mt-1 text-xs text-gray-400">클릭하여 상세 설명 보기</p>}
    </div>
  );
}

/* ── Interactive: Collaboration Mechanism Simulator ───────────── */

function CollabSimulator() {
  const [mechanism, setMechanism] = useState<'debate' | 'vote' | 'negotiate' | 'role'>('debate');
  const [round, setRound] = useState(1);

  const simData: Record<string, { agents: string[]; rounds: { desc: string; state: string }[] }> = {
    debate: {
      agents: ['Agent-Pro', 'Agent-Con', 'Judge'],
      rounds: [
        { desc: 'Pro가 초기 주장을 제시합니다.', state: 'Pro: "이 접근은 효율적입니다" | Con: (대기) | Judge: (관찰)' },
        { desc: 'Con이 반론을 제기합니다.', state: 'Pro: 방어 준비 | Con: "확장성 문제가 있습니다" | Judge: (기록)' },
        { desc: 'Judge가 최종 판정을 내립니다.', state: 'Judge: "Con의 확장성 우려를 반영한 수정안 채택"' },
      ],
    },
    vote: {
      agents: ['Agent-1', 'Agent-2', 'Agent-3', 'Aggregator'],
      rounds: [
        { desc: '각 에이전트가 독립적으로 답변을 생성합니다.', state: 'A1: "답 A" | A2: "답 B" | A3: "답 A"' },
        { desc: 'Aggregator가 투표를 집계합니다.', state: '답 A: 2표 | 답 B: 1표 → "답 A" 채택 (다수결)' },
      ],
    },
    negotiate: {
      agents: ['Buyer-Agent', 'Seller-Agent'],
      rounds: [
        { desc: 'Buyer가 초기 제안을 합니다.', state: 'Buyer: "$50 제안" | Seller: (검토 중)' },
        { desc: 'Seller가 역제안합니다.', state: 'Buyer: (검토 중) | Seller: "$80 역제안"' },
        { desc: '타협점에 도달합니다.', state: 'Buyer: "동의" ← $65 합의 → Seller: "동의"' },
      ],
    },
    role: {
      agents: ['Planner', 'Coder', 'Tester', 'Reviewer'],
      rounds: [
        { desc: 'Planner가 태스크를 분해합니다.', state: 'Planner → Coder: "함수 X 구현해주세요"' },
        { desc: 'Coder가 구현하고 Tester에게 전달합니다.', state: 'Coder → Tester: "코드 완료, 테스트 요청"' },
        { desc: 'Tester가 검증하고 Reviewer가 최종 확인합니다.', state: 'Tester → Reviewer: "테스트 통과" → Reviewer: "승인"' },
      ],
    },
  };

  const data = simData[mechanism];
  const maxRound = data.rounds.length;
  const curRound = Math.min(round, maxRound) - 1;

  return (
    <div className="rounded-xl border border-orange-200 bg-orange-50/50 p-4 dark:border-orange-800 dark:bg-orange-900/10">
      <p className="mb-3 text-sm font-bold text-orange-700 dark:text-orange-300">협업 메커니즘 시뮬레이터</p>
      <div className="mb-3 flex flex-wrap gap-2">
        {(['debate', 'vote', 'negotiate', 'role'] as const).map(m => (
          <button key={m} onClick={() => { setMechanism(m); setRound(1); }}
            className={`rounded px-3 py-1 text-xs font-bold capitalize ${mechanism === m ? 'bg-orange-600 text-white' : 'bg-white text-gray-500 dark:bg-gray-800'}`}>
            {m === 'debate' ? '토론' : m === 'vote' ? '투표' : m === 'negotiate' ? '협상' : '역할 기반'}
          </button>
        ))}
      </div>
      <div className="mb-3 flex flex-wrap gap-2">
        {data.agents.map(a => (
          <span key={a} className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-bold text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">{a}</span>
        ))}
      </div>
      <div className="mb-3 flex items-center gap-2">
        <span className="text-xs text-gray-500">라운드:</span>
        {data.rounds.map((_, i) => (
          <button key={i} onClick={() => setRound(i + 1)}
            className={`h-7 w-7 rounded text-xs font-bold ${i === curRound ? 'bg-orange-600 text-white' : 'bg-white text-gray-500 dark:bg-gray-800'}`}>
            {i + 1}
          </button>
        ))}
      </div>
      <div className="rounded-lg bg-white p-3 dark:bg-gray-800">
        <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{data.rounds[curRound].desc}</p>
        <p className="mt-2 text-xs font-mono text-orange-600 dark:text-orange-400">{data.rounds[curRound].state}</p>
      </div>
      <p className="mt-2 text-xs italic text-gray-500">메커니즘과 라운드를 변경하여 협업 과정을 관찰하세요</p>
    </div>
  );
}

/* ── Quiz ─────────────────────────────────────────────────────── */

function Quiz() {
  const qs = [
    { q: '협업 메커니즘 분류 프레임워크의 핵심 차원이 아닌 것은?', opts: ['Actors (행위자)', 'Types (유형)', 'Latency (지연시간)', 'Strategies (전략)'], ans: 2 },
    { q: 'Coopetition이란?', opts: ['협력만', '경쟁만', '협력과 경쟁의 혼합', '독립 행동'], ans: 2 },
    { q: '역할 기반 전략의 대표적 시스템은?', opts: ['GPT-4 single', 'MetaGPT', 'BERT', 'Word2Vec'], ans: 1 },
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
                className={`w-full rounded px-3 py-1.5 text-left text-xs transition ${sel[i] === j ? (show ? (j === q.ans ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800') : 'bg-orange-100 text-orange-800') : 'bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400'}`}>
                {o}
              </button>
            ))}
          </div>
        </div>
      ))}
      <button onClick={() => setShow(true)} className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-bold text-white hover:bg-orange-700">정답 확인</button>
      {show && <p className="text-sm font-bold text-orange-700">점수: {sel.filter((s, i) => s === qs[i].ans).length}/{qs.length}</p>}
    </div>
  );
}

/* ── Main ─────────────────────────────────────────────────────── */

export default function MASCollabMechStudyFull() {
  const [col, setCol] = useState<Record<string, boolean>>({});
  const toggle = useCallback((id: string) => setCol(c => ({ ...c, [id]: !c[id] })), []);

  return (
    <div className="space-y-6">
      {/* Overview */}
      <section className="scroll-mt-20">
        <div className="overflow-hidden rounded-xl shadow-sm">
          <div className="bg-gradient-to-br from-orange-700 via-amber-700 to-yellow-700 p-6 pb-8">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white">arXiv 2501.06322</span>
              <span className="rounded-full bg-yellow-400/90 px-3 py-1 text-xs font-bold text-yellow-900">Collaboration Survey</span>
            </div>
            <h2 className="text-xl font-bold leading-snug text-white sm:text-2xl">Multi-Agent Collaboration Mechanisms: A Survey of LLMs</h2>
            <p className="mt-3 text-sm text-orange-200">Khanh-Tung Tran et al. (University College Cork) · January 2025</p>
          </div>
          <div className="bg-white p-6 dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
            <p className="leading-relaxed text-gray-700 dark:text-gray-300">
              LLM 기반 MAS의 <span className="font-semibold text-orange-700 dark:text-orange-300">협업적 측면</span>을 심층 분석하는 서베이.
              협업 메커니즘을 <strong>행위자(actors)</strong>, <strong>유형(types)</strong>, <strong>구조(structures)</strong>,
              <strong>전략(strategies)</strong>, <strong>조율 프로토콜(coordination protocols)</strong>의
              5가지 핵심 차원으로 분류하는 확장 가능한 프레임워크를 제안합니다.
              고립된 단일 모델에서 <strong>인공 집단 지능(Artificial Collective Intelligence)</strong>으로의 전환을 다룹니다.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {['Collaboration Taxonomy', 'Debate/Vote/Negotiate', 'Cooperation/Competition/Coopetition', 'Role-based', 'Collective Intelligence'].map(t => (
                <span key={t} className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5-Dimension Framework */}
      <section className="scroll-mt-20">
        <SH icon={<Layers className="h-5 w-5" />} title="5차원 협업 프레임워크" collapsed={!!col['5d']} onToggle={() => toggle('5d')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['5d'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { dim: 'Actors (행위자)', desc: '참여 에이전트의 수, 역할 구성, 전문성 분포', examples: 'Coder+Tester, 다수 동질 에이전트' },
                { dim: 'Types (유형)', desc: '협력(Cooperation), 경쟁(Competition), 협쟁(Coopetition)', examples: 'co-writing vs debate vs market' },
                { dim: 'Structures (구조)', desc: 'P2P, 중앙집중, 분산, 계층, 동적', examples: 'star, mesh, tree topology' },
                { dim: 'Strategies (전략)', desc: '역할 기반, 모델 기반, 환경 기반', examples: 'MetaGPT roles, AutoGen model routing' },
                { dim: 'Protocols (프로토콜)', desc: '메시지 형식, 턴 관리, 종료 조건, 합의 규칙', examples: 'round-robin, event-driven, consensus' },
              ].map(({ dim, desc, examples }) => (
                <div key={dim} className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-900/10">
                  <p className="text-xs font-bold text-orange-700 dark:text-orange-300">{dim}</p>
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{desc}</p>
                  <p className="mt-1 text-xs italic text-gray-500">예: {examples}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* Collaboration Types */}
      <section className="scroll-mt-20">
        <SH icon={<Users className="h-5 w-5" />} title="협업 유형: 협력 / 경쟁 / 협쟁" collapsed={!!col['types']} onToggle={() => toggle('types')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['types'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/10">
                <p className="text-sm font-bold text-green-700 dark:text-green-300">Cooperation (협력)</p>
                <p className="mt-2 text-xs text-green-600 dark:text-green-400">공동 목표를 위해 에이전트가 협력. 정보 공유, 태스크 분담, 상호 보완.</p>
                <div className="mt-2 space-y-1">
                  {['공동 글쓰기', '소프트웨어 개발 파이프라인', '연구 협업'].map(e => (
                    <span key={e} className="mr-1 inline-block rounded bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900/40">{e}</span>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/10">
                <p className="text-sm font-bold text-red-700 dark:text-red-300">Competition (경쟁)</p>
                <p className="mt-2 text-xs text-red-600 dark:text-red-400">에이전트가 제한된 자원이나 최고 성과를 두고 경쟁. 결과 품질 향상 동기.</p>
                <div className="mt-2 space-y-1">
                  {['토론/디베이트', '코드 경진', '가격 경매'].map(e => (
                    <span key={e} className="mr-1 inline-block rounded bg-red-100 px-2 py-0.5 text-xs text-red-700 dark:bg-red-900/40">{e}</span>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/10">
                <p className="text-sm font-bold text-purple-700 dark:text-purple-300">Coopetition (협쟁)</p>
                <p className="mt-2 text-xs text-purple-600 dark:text-purple-400">협력과 경쟁이 혼재. 일부 목표는 공유하고 일부는 독립적으로 추구.</p>
                <div className="mt-2 space-y-1">
                  {['마켓 시뮬레이션', '연합 학습', '멀티플레이어 게임'].map(e => (
                    <span key={e} className="mr-1 inline-block rounded bg-purple-100 px-2 py-0.5 text-xs text-purple-700 dark:bg-purple-900/40">{e}</span>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Interactive Simulator */}
      <section className="scroll-mt-20">
        <SH icon={<BrainCircuit className="h-5 w-5" />} title="협업 메커니즘 시뮬레이터" collapsed={!!col['sim']} onToggle={() => toggle('sim')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['sim'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card><CollabSimulator /></Card>
        </div>
      </section>

      {/* Equations */}
      <section className="scroll-mt-20">
        <SH icon={<Hash className="h-5 w-5" />} title="핵심 수식" collapsed={!!col['eq']} onToggle={() => toggle('eq')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['eq'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="space-y-3">
              <EqCard idx={1} name="협력 목적 함수" latex={String.raw`J_{\text{coop}} = \sum_{i=1}^{n} \alpha_i \cdot u_i(\mathbf{a}), \quad \mathbf{a} = (a_1, \ldots, a_n)`} desc="n개 에이전트의 공동 목적 함수. alpha_i는 에이전트 i의 기여 가중치, u_i는 개별 효용. 전체 팀의 효용 합을 최대화." color="orange" />
              <EqCard idx={2} name="토론 기반 정제" latex={String.raw`o^{(t+1)} = \text{LLM}\!\left(o^{(t)},\; \{c_j^{(t)}\}_{j \neq i},\; \text{prompt}_{\text{refine}}\right)`} desc="t번째 라운드에서 에이전트 i의 출력을 다른 에이전트들의 비판 c_j를 반영하여 정제. 반복하여 품질 수렴." color="indigo" />
              <EqCard idx={3} name="다수결 투표" latex={String.raw`\hat{y} = \arg\max_{y \in \mathcal{Y}} \sum_{i=1}^{n} \mathbb{1}[f_i(x) = y]`} desc="n개 에이전트가 각각 답변 f_i(x)를 생성하고, 가장 많은 표를 받은 답변 y를 최종 선택. Self-consistency의 다에이전트 확장." color="purple" />
              <EqCard idx={4} name="내쉬 균형 (협상)" latex={String.raw`u_i(a_i^*, a_{-i}^*) \geq u_i(a_i, a_{-i}^*), \quad \forall a_i, \forall i`} desc="어떤 에이전트도 단독으로 전략을 변경하여 이득을 볼 수 없는 상태. 협상 기반 MAS의 수렴 목표." color="green" />
            </div>
          </Card>
        </div>
      </section>

      {/* Representative Systems */}
      <section className="scroll-mt-20">
        <SH icon={<BarChart2 className="h-5 w-5" />} title="대표 시스템 비교" collapsed={!!col['sys']} onToggle={() => toggle('sys')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['sys'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead><tr className="bg-orange-50 dark:bg-orange-900/20">
                  <th className="px-3 py-2 text-left font-bold text-orange-700">시스템</th>
                  <th className="px-3 py-2 text-center font-bold text-orange-700">유형</th>
                  <th className="px-3 py-2 text-center font-bold text-orange-700">구조</th>
                  <th className="px-3 py-2 text-center font-bold text-orange-700">메커니즘</th>
                  <th className="px-3 py-2 text-left font-bold text-orange-700">도메인</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { s: 'MetaGPT', ty: '협력', st: '계층', m: '역할 기반', d: 'SW 개발' },
                    { s: 'AutoGen', ty: '협력', st: '동적', m: '대화 기반', d: '범용' },
                    { s: 'CAMEL', ty: '협쟁', st: 'P2P', m: '역할놀이+협상', d: '연구' },
                    { s: 'MAD', ty: '경쟁', st: 'P2P', m: '토론', d: '추론' },
                    { s: 'ChatEval', ty: '경쟁', st: '중앙', m: '토론+투표', d: '평가' },
                    { s: 'CrewAI', ty: '협력', st: '계층', m: '역할 기반', d: '범용' },
                    { s: 'LangGraph', ty: '협력', st: '그래프', m: '상태 기반', d: '워크플로우' },
                  ].map((r, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">{r.s}</td>
                      <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">{r.ty}</td>
                      <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">{r.st}</td>
                      <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">{r.m}</td>
                      <td className="px-3 py-2 text-gray-500 dark:text-gray-400">{r.d}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
