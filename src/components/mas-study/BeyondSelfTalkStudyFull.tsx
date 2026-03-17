'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  BarChart2,
  BrainCircuit,
  ChevronDown,
  GraduationCap,
  Hash,
  MessageSquare,
  Network,
  Shield,
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
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-100 text-xs font-bold text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">{n}</span>
      <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">{title}</h4>
    </div>
  );
}

function EqCard({ idx, name, latex, desc, color = 'rose' }: { idx: number; name: string; latex: string; desc: string; color?: string }) {
  const [open, setOpen] = useState(false);
  const cm: Record<string, string> = { rose: 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800', indigo: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800', amber: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800', cyan: 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800' };
  const bm: Record<string, string> = { rose: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300', indigo: 'bg-indigo-100 text-indigo-700', amber: 'bg-amber-100 text-amber-700', cyan: 'bg-cyan-100 text-cyan-700' };
  return (
    <div className="cursor-pointer rounded-xl border border-gray-200 bg-gray-50/50 p-4 transition hover:border-rose-300 dark:border-gray-700 dark:bg-gray-800" onClick={() => setOpen(v => !v)}>
      <div className="mb-2 flex items-center gap-2">
        <span className={`rounded px-2 py-0.5 text-xs font-bold ${bm[color] ?? bm.rose}`}>Eq.{idx}</span>
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{name}</span>
        <ChevronDown className={`ml-auto h-4 w-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </div>
      <div className="overflow-x-auto py-2"><Eq latex={latex} /></div>
      {open ? <div className={`mt-3 rounded-lg border px-4 py-3 ${cm[color] ?? cm.rose}`}><p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">{desc}</p></div> : <p className="mt-1 text-xs text-gray-400">클릭하여 상세 설명 보기</p>}
    </div>
  );
}

/* ── Interactive: Two-Level Framework Viz ─────────────────────── */

function TwoLevelViz() {
  const [level, setLevel] = useState<'system' | 'internal'>('system');
  const systemItems = [
    { name: '아키텍처 설계', desc: '중앙집중/분산/계층/동적 - 에이전트 간 통신 토폴로지 결정' },
    { name: '통신 목표', desc: '협력(공동 목표 달성), 경쟁(제한된 자원 쟁탈), 혼합(협쟁)' },
    { name: '통신 프로토콜', desc: '메시지 형식, 라우팅 규칙, 턴 관리, 종료 조건' },
  ];
  const internalItems = [
    { name: '통신 전략', desc: 'When: 언제 통신할지 결정 (이벤트/주기/조건부)' },
    { name: '통신 패러다임', desc: 'How: 토론, 협상, 투표, 피드백, 공유 메모리 등' },
    { name: '통신 대상', desc: 'Who: 브로드캐스트, 유니캐스트, 그룹캐스트' },
    { name: '통신 내용', desc: 'What: 텍스트, 코드, 구조화 데이터, 멀티모달' },
  ];
  const items = level === 'system' ? systemItems : internalItems;

  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4 dark:border-rose-800 dark:bg-rose-900/10">
      <p className="mb-3 text-sm font-bold text-rose-700 dark:text-rose-300">2-Level 분석 프레임워크</p>
      <div className="mb-3 flex gap-2">
        <button onClick={() => setLevel('system')} className={`rounded px-3 py-1 text-xs font-bold ${level === 'system' ? 'bg-rose-600 text-white' : 'bg-white text-gray-500 dark:bg-gray-800'}`}>System-Level</button>
        <button onClick={() => setLevel('internal')} className={`rounded px-3 py-1 text-xs font-bold ${level === 'internal' ? 'bg-rose-600 text-white' : 'bg-white text-gray-500 dark:bg-gray-800'}`}>System-Internal</button>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="rounded-lg bg-white p-3 dark:bg-gray-800">
            <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{item.name}</p>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs italic text-gray-500">탭을 전환하여 시스템 레벨과 내부 통신 요소를 비교하세요</p>
    </div>
  );
}

/* ── Interactive: Architecture Comparison ─────────────────────── */

function ArchitectureViz() {
  const [arch, setArch] = useState(0);
  const archs = [
    { name: '중앙집중', desc: '하나의 중앙 에이전트가 모든 통신을 제어. 일관성 높지만 단일 장애점.', pattern: 'Hub(중앙) → A, B, C, D', pros: '단순, 일관성', cons: '병목, SPOF' },
    { name: '분산', desc: '모든 에이전트가 동등하게 P2P 통신. 장애 복원력 높지만 합의 비용.', pattern: 'A ↔ B ↔ C ↔ D ↔ A', pros: '복원력, 확장성', cons: '합의 비용, 복잡' },
    { name: '계층적', desc: '에이전트가 계층 구조로 조직. 상위 에이전트가 하위를 관리.', pattern: 'Manager → [Team1, Team2] → [Workers]', pros: '확장성, 분업', cons: '경직, 지연' },
    { name: '동적', desc: '태스크에 따라 실시간으로 토폴로지 변경. 가장 유연하지만 구현 복잡.', pattern: '상황에 따라 변동', pros: '적응성 최고', cons: '오버헤드, 구현 난이도' },
  ];
  const cur = archs[arch];

  return (
    <div className="rounded-xl border border-cyan-200 bg-cyan-50/50 p-4 dark:border-cyan-800 dark:bg-cyan-900/10">
      <p className="mb-3 text-sm font-bold text-cyan-700 dark:text-cyan-300">통신 아키텍처 비교기</p>
      <div className="mb-3 flex flex-wrap gap-2">
        {archs.map((a, i) => (
          <button key={i} onClick={() => setArch(i)}
            className={`rounded px-3 py-1 text-xs font-bold ${i === arch ? 'bg-cyan-600 text-white' : 'bg-white text-gray-500 dark:bg-gray-800'}`}>
            {a.name}
          </button>
        ))}
      </div>
      <div className="rounded-lg bg-white p-3 dark:bg-gray-800">
        <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{cur.name} 아키텍처</p>
        <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{cur.desc}</p>
        <p className="mt-2 text-xs font-mono text-cyan-600 dark:text-cyan-400">{cur.pattern}</p>
        <div className="mt-2 flex gap-4">
          <div><span className="text-xs font-bold text-green-600">장점:</span> <span className="text-xs text-gray-500">{cur.pros}</span></div>
          <div><span className="text-xs font-bold text-red-600">단점:</span> <span className="text-xs text-gray-500">{cur.cons}</span></div>
        </div>
      </div>
    </div>
  );
}

/* ── Quiz ─────────────────────────────────────────────────────── */

function Quiz() {
  const qs = [
    { q: '이 서베이의 분석 관점은?', opts: ['응용 도메인 중심', '아키텍처 중심', '통신 중심(Communication-Centric)', '성능 중심'], ans: 2 },
    { q: 'System-Internal 통신 요소가 아닌 것은?', opts: ['통신 전략', '통신 패러다임', '통신 아키텍처', '통신 대상'], ans: 2 },
    { q: 'LLM-MAS의 통신 보안 위협으로 언급된 것은?', opts: ['DDoS 공격만', 'Prompt injection, 정보 유출', 'SQL injection', '물리적 파괴'], ans: 1 },
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
                className={`w-full rounded px-3 py-1.5 text-left text-xs transition ${sel[i] === j ? (show ? (j === q.ans ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800') : 'bg-rose-100 text-rose-800') : 'bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400'}`}>
                {o}
              </button>
            ))}
          </div>
        </div>
      ))}
      <button onClick={() => setShow(true)} className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-bold text-white hover:bg-rose-700">정답 확인</button>
      {show && <p className="text-sm font-bold text-rose-700">점수: {sel.filter((s, i) => s === qs[i].ans).length}/{qs.length}</p>}
    </div>
  );
}

/* ── Main ─────────────────────────────────────────────────────── */

export default function BeyondSelfTalkStudyFull() {
  const [col, setCol] = useState<Record<string, boolean>>({});
  const toggle = useCallback((id: string) => setCol(c => ({ ...c, [id]: !c[id] })), []);

  return (
    <div className="space-y-6">
      {/* Overview */}
      <section className="scroll-mt-20">
        <div className="overflow-hidden rounded-xl shadow-sm">
          <div className="bg-gradient-to-br from-rose-700 via-pink-700 to-fuchsia-700 p-6 pb-8">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white">arXiv 2502.14321</span>
              <span className="rounded-full bg-yellow-400/90 px-3 py-1 text-xs font-bold text-yellow-900">Communication-Centric</span>
            </div>
            <h2 className="text-xl font-bold leading-snug text-white sm:text-2xl">Beyond Self-Talk: A Communication-Centric Survey of LLM-Based Multi-Agent Systems</h2>
            <p className="mt-3 text-sm text-rose-200">Bingyu Yan, Xiaoming Zhang et al. · February 2025</p>
          </div>
          <div className="bg-white p-6 dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
            <p className="leading-relaxed text-gray-700 dark:text-gray-300">
              LLM-MAS를 <span className="font-semibold text-rose-700 dark:text-rose-300">통신 중심 관점</span>에서 분석하는 최초의 종합 서베이.
              기존 서베이가 응용 도메인이나 아키텍처에 초점을 맞춘 것과 달리,
              에이전트 행동 조율에서 <strong>통신의 중심적 역할</strong>을 조명합니다.
              <strong>System-Level</strong>(아키텍처, 목표, 프로토콜)과 <strong>System-Internal</strong>(전략, 패러다임, 대상, 내용)의
              2-Level 프레임워크를 제안합니다.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {['Communication-Centric', '2-Level Framework', 'Architecture Design', 'Security', 'Scalability'].map(t => (
                <span key={t} className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2-Level Framework */}
      <section className="scroll-mt-20">
        <SH icon={<Layers className="h-5 w-5" />} title="2-Level 분석 프레임워크" collapsed={!!col['fw']} onToggle={() => toggle('fw')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['fw'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card><TwoLevelViz /></Card>
        </div>
      </section>

      {/* Architecture */}
      <section className="scroll-mt-20">
        <SH icon={<Network className="h-5 w-5" />} title="통신 아키텍처 비교" collapsed={!!col['arch']} onToggle={() => toggle('arch')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['arch'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card><ArchitectureViz /></Card>
        </div>
      </section>

      {/* Communication Paradigms */}
      <section className="scroll-mt-20">
        <SH icon={<MessageSquare className="h-5 w-5" />} title="통신 패러다임 분류" collapsed={!!col['para']} onToggle={() => toggle('para')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['para'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead><tr className="bg-rose-50 dark:bg-rose-900/20">
                  <th className="px-3 py-2 text-left font-bold text-rose-700">패러다임</th>
                  <th className="px-3 py-2 text-left font-bold text-rose-700">설명</th>
                  <th className="px-3 py-2 text-left font-bold text-rose-700">대표 시스템</th>
                  <th className="px-3 py-2 text-center font-bold text-rose-700">확장성</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { p: '토론 (Debate)', d: '에이전트가 주장과 반론을 교환하여 결론 도출', s: 'MAD, ChatEval', sc: '중' },
                    { p: '투표 (Voting)', d: '다수결 또는 가중 투표로 집단 의사결정', s: 'LLM-Debate, AutoGen', sc: '상' },
                    { p: '협상 (Negotiation)', d: '이해관계가 다른 에이전트 간 타협점 도출', s: 'CAMEL, NegotiAgent', sc: '하' },
                    { p: '피드백 (Feedback)', d: '한 에이전트가 다른 에이전트의 출력을 평가/개선', s: 'TalkHier, MetaGPT', sc: '상' },
                    { p: '공유 메모리', d: '공통 메모리 공간을 통한 비동기 정보 교환', s: 'Voyager, Generative Agents', sc: '상' },
                    { p: '멀티모달', d: '텍스트 외에 이미지/코드/구조화 데이터 교환', s: 'Visual ChatGPT', sc: '중' },
                  ].map((r, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">{r.p}</td>
                      <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{r.d}</td>
                      <td className="px-3 py-2 text-gray-500 dark:text-gray-400">{r.s}</td>
                      <td className="px-3 py-2 text-center text-gray-500">{r.sc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
              <EqCard idx={1} name="통신 효율성" latex={String.raw`\eta_{\text{comm}} = \frac{\Delta \text{Perf}}{C_{\text{msg}} \cdot N_{\text{rounds}}}`} desc="성능 향상분을 통신 비용(메시지 수 x 라운드 수)으로 나눈 통신 효율성. 높을수록 적은 통신으로 많은 성능 향상을 달성." color="rose" />
              <EqCard idx={2} name="토론 수렴 조건" latex={String.raw`\|o_i^{(t)} - o_i^{(t-1)}\| < \epsilon, \quad \forall i \in V, \quad t \geq T_{\text{conv}}`} desc="모든 에이전트의 출력 변화량이 epsilon 미만이면 토론이 수렴한 것으로 판단. T_conv는 수렴까지의 라운드 수." color="indigo" />
              <EqCard idx={3} name="가중 투표" latex={String.raw`d^* = \arg\max_{d \in \mathcal{D}} \sum_{i=1}^{n} w_i \cdot \mathbb{1}[v_i = d], \quad \sum_i w_i = 1`} desc="각 에이전트의 투표에 신뢰도 가중치 w_i를 부여. 전문성이 높은 에이전트의 의견에 더 큰 가중치." color="amber" />
              <EqCard idx={4} name="공유 메모리 읽기/쓰기" latex={String.raw`\mathcal{M}^{(t+1)} = \mathcal{M}^{(t)} \cup \{(k_i, v_i, t, a_i)\}, \quad v_i = f_{\text{LLM}}(\mathcal{M}^{(t)}, q_i)`} desc="공유 메모리 M에 (키, 값, 타임스탬프, 에이전트 ID) 튜플을 추가. 각 에이전트는 메모리를 읽고 자신의 출력을 생성하여 다시 기록." color="cyan" />
            </div>
          </Card>
        </div>
      </section>

      {/* Challenges */}
      <section className="scroll-mt-20">
        <SH icon={<Shield className="h-5 w-5" />} title="도전 과제 및 미래 방향" collapsed={!!col['ch']} onToggle={() => toggle('ch')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['ch'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                { t: '통신 효율성', d: '라운드 수 증가 시 토큰 비용 폭증. 의미 압축, 조기 종료, 선택적 통신 필요.', c: 'rose' },
                { t: '보안 취약성', d: 'Prompt injection, 정보 유출, 적대적 에이전트. 통신 레벨에서의 방어 메커니즘 미비.', c: 'red' },
                { t: '벤치마크 부재', d: '통신 품질을 정량적으로 평가하는 표준 벤치마크 부재. 응용별 평가만 존재.', c: 'orange' },
                { t: '확장성', d: '에이전트 수 증가 시 통신 복잡도 O(n^2). 계층적/토픽 기반 라우팅 필요.', c: 'amber' },
                { t: '하이브리드 아키텍처', d: '단일 토폴로지의 한계. 태스크 단계별로 아키텍처를 동적 전환하는 연구 필요.', c: 'blue' },
                { t: '멀티모달 통합', d: '텍스트 외 이미지, 코드, 구조화 데이터를 통합하는 통신 프로토콜 미성숙.', c: 'purple' },
              ].map(({ t, d, c }) => (
                <div key={t} className={`rounded-lg border border-${c}-200 bg-${c}-50 p-3 dark:border-${c}-900/30 dark:bg-${c}-900/10`}>
                  <p className={`text-xs font-bold text-${c}-700 dark:text-${c}-300`}>{t}</p>
                  <p className={`mt-1 text-xs text-${c}-600 dark:text-${c}-400`}>{d}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* Key Insights */}
      <section className="scroll-mt-20">
        <SH icon={<BrainCircuit className="h-5 w-5" />} title="핵심 인사이트: 통신이 왜 중심인가" collapsed={!!col['insight']} onToggle={() => toggle('insight')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['insight'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <Sub n="1" title="기존 서베이와의 차별점" />
            <div className="mb-4 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead><tr className="bg-rose-50 dark:bg-rose-900/20">
                  <th className="px-3 py-2 text-left font-bold text-rose-700">서베이</th>
                  <th className="px-3 py-2 text-center font-bold text-rose-700">분류 축</th>
                  <th className="px-3 py-2 text-center font-bold text-rose-700">통신 분석</th>
                  <th className="px-3 py-2 text-center font-bold text-rose-700">보안 논의</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { s: 'Guo et al. (IJCAI 2024)', ax: '응용 도메인', comm: '표면적', sec: 'X' },
                    { s: 'Tran et al. (2025)', ax: '협업 메커니즘', comm: '중간', sec: '부분' },
                    { s: 'Li et al. (2024)', ax: '워크플로우', comm: '중간', sec: 'X' },
                    { s: 'Beyond Self-Talk', ax: '통신 중심 2-Level', comm: '심층', sec: 'O', hi: true },
                  ].map((r, i) => (
                    <tr key={i} className={r.hi ? 'bg-rose-50 dark:bg-rose-900/20' : ''}>
                      <td className={`px-3 py-2 font-medium ${r.hi ? 'text-rose-700 dark:text-rose-300' : 'text-gray-700 dark:text-gray-300'}`}>{r.s}</td>
                      <td className="px-3 py-2 text-center text-gray-600">{r.ax}</td>
                      <td className="px-3 py-2 text-center text-gray-600">{r.comm}</td>
                      <td className="px-3 py-2 text-center text-gray-600">{r.sec}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Sub n="2" title="통신이 성패를 결정하는 이유" />
            <div className="space-y-2">
              {[
                { t: '정보 병목', d: 'LLM의 컨텍스트 윈도우가 유한하므로, 무엇을 전달할지 선택이 성능을 좌우. 불필요한 메시지는 중요한 맥락을 밀어냄.' },
                { t: '환각 증폭 경로', d: '잘못된 정보가 통신을 통해 다른 에이전트로 전파. 통신 프로토콜에 검증 단계가 없으면 오류가 기하급수적으로 확산.' },
                { t: '비용 지배', d: 'MAS의 LLM API 비용 중 60-80%가 에이전트 간 통신(서로의 메시지 읽기)에서 발생. 효율적 통신 = 비용 절감.' },
                { t: '수렴 결정', d: '토론/피드백 기반 MAS에서 통신 프로토콜이 수렴 속도와 최종 품질을 결정. 나쁜 프로토콜 → 무한 루프.' },
              ].map(({ t, d }) => (
                <div key={t} className="rounded-lg border border-rose-100 bg-rose-50 p-3 dark:border-rose-900/30 dark:bg-rose-900/10">
                  <p className="text-xs font-bold text-rose-700 dark:text-rose-300">{t}</p>
                  <p className="mt-0.5 text-xs text-rose-600 dark:text-rose-400">{d}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-900/20">
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">실무 시사점</p>
              <p className="mt-1 text-xs leading-relaxed text-amber-600 dark:text-amber-400">
                MAS를 설계할 때, 에이전트 능력(LLM 선택)보다 통신 프로토콜 설계가 더 큰 영향을 미칠 수 있습니다.
                동일한 GPT-4 에이전트라도, 비구조화된 자유 토론 vs 구조화된 피드백 프로토콜은 성능 차이가 20-40%에 달합니다.
                이 서베이는 "좋은 LLM을 쓰는 것"보다 "좋은 통신을 설계하는 것"이 우선임을 강조합니다.
              </p>
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
