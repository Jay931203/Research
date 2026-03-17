'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  BarChart2,
  BrainCircuit,
  ChevronDown,
  Cpu,
  GraduationCap,
  Hash,
  Map,
  Network,
  AlertTriangle,
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
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">{n}</span>
      <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">{title}</h4>
    </div>
  );
}

function EqCard({ idx, name, latex, desc, color = 'sky' }: { idx: number; name: string; latex: string; desc: string; color?: string }) {
  const [open, setOpen] = useState(false);
  const cm: Record<string, string> = { sky: 'bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800', indigo: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800', amber: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800', green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' };
  const bm: Record<string, string> = { sky: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300', indigo: 'bg-indigo-100 text-indigo-700', amber: 'bg-amber-100 text-amber-700', green: 'bg-green-100 text-green-700' };
  return (
    <div className="cursor-pointer rounded-xl border border-gray-200 bg-gray-50/50 p-4 transition hover:border-sky-300 dark:border-gray-700 dark:bg-gray-800" onClick={() => setOpen(v => !v)}>
      <div className="mb-2 flex items-center gap-2">
        <span className={`rounded px-2 py-0.5 text-xs font-bold ${bm[color] ?? bm.sky}`}>Eq.{idx}</span>
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{name}</span>
        <ChevronDown className={`ml-auto h-4 w-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </div>
      <div className="overflow-x-auto py-2"><Eq latex={latex} /></div>
      {open ? <div className={`mt-3 rounded-lg border px-4 py-3 ${cm[color] ?? cm.sky}`}><p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">{desc}</p></div> : <p className="mt-1 text-xs text-gray-400">클릭하여 상세 설명 보기</p>}
    </div>
  );
}

/* ── Interactive: Coordination Taxonomy Explorer ──────────────── */

function TaxonomyExplorer() {
  const [selected, setSelected] = useState<string | null>(null);
  const taxonomy = [
    { id: 'what', q: 'What: 조율이란?', desc: '다수의 에이전트가 활동 간 의존성을 관리하여 전체 시스템 성능을 향상시키는 과정. 태스크 분배, 자원 할당, 충돌 해결 등을 포함.', color: 'bg-sky-100 border-sky-300 text-sky-800 dark:bg-sky-900/30 dark:border-sky-700 dark:text-sky-300' },
    { id: 'why', q: 'Why: 왜 조율이 필요?', desc: '단일 에이전트의 능력 한계 극복, 복잡한 태스크의 분해/병렬 처리, 환경 불확실성 대처, 장애 복원력 확보.', color: 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300' },
    { id: 'who', q: 'Who: 누구와 조율?', desc: '동질적 vs 이질적 에이전트, 협력적 vs 경쟁적 관계, 고정 팀 vs 동적 연합, 통신 토폴로지(중앙/분산/계층).', color: 'bg-indigo-100 border-indigo-300 text-indigo-800 dark:bg-indigo-900/30 dark:border-indigo-700 dark:text-indigo-300' },
    { id: 'how', q: 'How: 어떻게 조율?', desc: '규칙 기반, 옥션/마켓, 합의 프로토콜, 강화학습(MARL), LLM 기반 토론/투표/협상.', color: 'bg-purple-100 border-purple-300 text-purple-800 dark:bg-purple-900/30 dark:border-purple-700 dark:text-purple-300' },
  ];

  return (
    <div className="rounded-xl border border-sky-200 bg-sky-50/50 p-4 dark:border-sky-800 dark:bg-sky-900/10">
      <p className="mb-3 text-sm font-bold text-sky-700 dark:text-sky-300">4가지 조율 질문 탐색기</p>
      <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {taxonomy.map(t => (
          <button key={t.id} onClick={() => setSelected(selected === t.id ? null : t.id)}
            className={`rounded-lg border p-2 text-xs font-bold transition ${selected === t.id ? t.color : 'bg-white border-gray-200 text-gray-500 dark:bg-gray-800 dark:border-gray-700'}`}>
            {t.q.split(':')[0]}
          </button>
        ))}
      </div>
      {selected && (
        <div className={`rounded-lg border p-3 ${taxonomy.find(t => t.id === selected)!.color}`}>
          <p className="text-xs font-bold">{taxonomy.find(t => t.id === selected)!.q}</p>
          <p className="mt-1 text-xs leading-relaxed">{taxonomy.find(t => t.id === selected)!.desc}</p>
        </div>
      )}
      <p className="mt-2 text-xs italic text-gray-500">각 버튼을 클릭하여 조율의 4가지 근본 질문을 탐색하세요</p>
    </div>
  );
}

/* ── Interactive: Application Domain Map ──────────────────────── */

function DomainMap() {
  const [active, setActive] = useState<number | null>(null);
  const domains = [
    { name: '수색 구조 (SAR)', agents: '드론 + 지상 로봇', coord: '분산 탐색, 피해자 발견 시 집결', challenge: '통신 단절, 동적 환경' },
    { name: '물류 자동화', agents: 'AGV + 피킹 로봇', coord: '경로 계획, 충돌 회피, 작업 할당', challenge: '실시간 최적화, 확장성' },
    { name: '자율 교통', agents: '자율 차량 + 인프라', coord: '교차로 협상, 군집 주행, V2X', challenge: '안전 보장, 지연 시간' },
    { name: '스마트 그리드', agents: '발전기 + 저장장치 + 소비자', coord: '수요/공급 균형, 피크 관리', challenge: '분산 의사결정, 프라이버시' },
    { name: '로봇 축구', agents: '동질적 로봇 팀', coord: '역할 배정, 포메이션, 패스', challenge: '실시간 반응, 적대적 환경' },
    { name: '분산 센싱', agents: '센서 노드 + 처리기', coord: '커버리지 최적화, 데이터 융합', challenge: '에너지 제한, 대역폭' },
  ];

  return (
    <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 dark:border-indigo-800 dark:bg-indigo-900/10">
      <p className="mb-3 text-sm font-bold text-indigo-700 dark:text-indigo-300">MAS 응용 도메인 맵</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {domains.map((d, i) => (
          <button key={i} onClick={() => setActive(active === i ? null : i)}
            className={`rounded-lg border p-2 text-left text-xs transition ${active === i ? 'border-indigo-400 bg-indigo-100 dark:bg-indigo-900/30' : 'border-gray-200 bg-white hover:border-indigo-200 dark:border-gray-700 dark:bg-gray-800'}`}>
            <p className="font-bold text-gray-700 dark:text-gray-300">{d.name}</p>
          </button>
        ))}
      </div>
      {active !== null && (
        <div className="mt-3 rounded-lg border border-indigo-300 bg-white p-3 dark:border-indigo-700 dark:bg-gray-800">
          <p className="text-xs font-bold text-indigo-700 dark:text-indigo-300">{domains[active].name}</p>
          <div className="mt-2 space-y-1 text-xs text-gray-600 dark:text-gray-400">
            <p><strong>에이전트:</strong> {domains[active].agents}</p>
            <p><strong>조율 방식:</strong> {domains[active].coord}</p>
            <p><strong>핵심 과제:</strong> {domains[active].challenge}</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Quiz ─────────────────────────────────────────────────────── */

function Quiz() {
  const qs = [
    { q: '이 서베이의 4가지 근본 질문에 포함되지 않는 것은?', opts: ['What', 'When', 'Who', 'How'], ans: 1 },
    { q: '물류 자동화에서 MAS의 주요 조율 과제는?', opts: ['안전 보장', '실시간 최적화 + 확장성', '프라이버시', '에너지 제한'], ans: 1 },
    { q: '이질적 에이전트 MAS의 특징은?', opts: ['모든 에이전트가 동일한 능력', '에이전트마다 다른 역할/능력 보유', '중앙 제어기 필수', '통신 불필요'], ans: 1 },
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
                className={`w-full rounded px-3 py-1.5 text-left text-xs transition ${sel[i] === j ? (show ? (j === q.ans ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800') : 'bg-sky-100 text-sky-800') : 'bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400'}`}>
                {o}
              </button>
            ))}
          </div>
        </div>
      ))}
      <button onClick={() => setShow(true)} className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-bold text-white hover:bg-sky-700">정답 확인</button>
      {show && <p className="text-sm font-bold text-sky-700">점수: {sel.filter((s, i) => s === qs[i].ans).length}/{qs.length}</p>}
    </div>
  );
}

/* ── Main ─────────────────────────────────────────────────────── */

export default function MASCoordSurveyStudyFull() {
  const [col, setCol] = useState<Record<string, boolean>>({});
  const toggle = useCallback((id: string) => setCol(c => ({ ...c, [id]: !c[id] })), []);

  return (
    <div className="space-y-6">
      {/* Overview */}
      <section className="scroll-mt-20">
        <div className="overflow-hidden rounded-xl shadow-sm">
          <div className="bg-gradient-to-br from-sky-700 via-blue-700 to-indigo-700 p-6 pb-8">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white">arXiv 2502.14743</span>
              <span className="rounded-full bg-yellow-400/90 px-3 py-1 text-xs font-bold text-yellow-900">Comprehensive Survey</span>
            </div>
            <h2 className="text-xl font-bold leading-snug text-white sm:text-2xl">Multi-Agent Coordination across Diverse Applications: A Survey</h2>
            <p className="mt-3 text-sm text-sky-200">Lijun Sun, Yijun Yang, Qiqi Duan et al. · February 2025</p>
          </div>
          <div className="bg-white p-6 dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
            <p className="leading-relaxed text-gray-700 dark:text-gray-300">
              다양한 MAS 응용 분야를 아우르는 <span className="font-semibold text-sky-700 dark:text-sky-300">통합 조율 프레임워크</span> 서베이.
              조율(coordination)의 4가지 근본 질문 - <strong>What, Why, Who, How</strong> - 을 중심으로
              수색구조, 물류, 교통, 에너지 등 다양한 도메인의 조율 연구를 체계적으로 분류합니다.
              기존 아이디어의 연결고리를 발굴하고, 신흥 연구 방향을 제시합니다.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {['Coordination Taxonomy', 'Cross-Domain Survey', 'MARL', 'Task Allocation', 'Consensus'].map(t => (
                <span key={t} className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700 dark:bg-sky-900/30 dark:text-sky-300">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4 Questions */}
      <section className="scroll-mt-20">
        <SH icon={<BrainCircuit className="h-5 w-5" />} title="조율의 4가지 근본 질문" collapsed={!!col['4q']} onToggle={() => toggle('4q')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['4q'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <TaxonomyExplorer />
          </Card>
        </div>
      </section>

      {/* Coordination Mechanisms */}
      <section className="scroll-mt-20">
        <SH icon={<Cpu className="h-5 w-5" />} title="조율 메커니즘 분류" collapsed={!!col['mech']} onToggle={() => toggle('mech')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['mech'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead><tr className="bg-sky-50 dark:bg-sky-900/20">
                  <th className="px-3 py-2 text-left font-bold text-sky-700 dark:text-sky-300">메커니즘</th>
                  <th className="px-3 py-2 text-left font-bold text-sky-700 dark:text-sky-300">원리</th>
                  <th className="px-3 py-2 text-left font-bold text-sky-700 dark:text-sky-300">장점</th>
                  <th className="px-3 py-2 text-left font-bold text-sky-700 dark:text-sky-300">적용 도메인</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { m: '옥션/마켓', p: '경매로 자원/태스크 할당', a: '효율적 자원 배분', d: '물류, 클라우드' },
                    { m: '합의 프로토콜', p: '에이전트 간 상태 합의', a: '일관성 보장', d: '로봇 군집, 블록체인' },
                    { m: 'MARL', p: '강화학습 기반 정책 학습', a: '적응적 행동', d: '게임, 교통' },
                    { m: '계약망 (CNP)', p: '태스크 공고-입찰-낙찰', a: '유연한 태스크 분배', d: '제조, 물류' },
                    { m: '팀 형성', p: '동적 연합 구성', a: '상황 적응', d: 'SAR, 군사' },
                    { m: 'LLM 기반', p: '자연어 토론/투표/협상', a: '유연성, 해석 가능', d: 'SW 개발, 연구' },
                  ].map((r, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">{r.m}</td>
                      <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{r.p}</td>
                      <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{r.a}</td>
                      <td className="px-3 py-2 text-gray-500 dark:text-gray-400">{r.d}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </section>

      {/* Applications */}
      <section className="scroll-mt-20">
        <SH icon={<Map className="h-5 w-5" />} title="응용 도메인 탐색" collapsed={!!col['app']} onToggle={() => toggle('app')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['app'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card><DomainMap /></Card>
        </div>
      </section>

      {/* Equations */}
      <section className="scroll-mt-20">
        <SH icon={<Hash className="h-5 w-5" />} title="핵심 수식" collapsed={!!col['eq']} onToggle={() => toggle('eq')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['eq'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="space-y-3">
              <EqCard idx={1} name="조율 문제 정의" latex={String.raw`\max_{\pi_1,\ldots,\pi_n} J(\pi_1,\ldots,\pi_n) = \mathbb{E}\!\left[\sum_{t=0}^{T}\gamma^t r(s_t, a_1^t,\ldots,a_n^t)\right]`} desc="n개 에이전트의 공동 정책을 최적화. gamma는 할인율, r은 공동 보상 함수. 전역 상태 s에서 각 에이전트가 행동 a를 선택하여 누적 보상 최대화." color="sky" />
              <EqCard idx={2} name="합의 프로토콜" latex={String.raw`x_i(t+1) = x_i(t) + \epsilon \sum_{j \in \mathcal{N}_i} w_{ij}\bigl(x_j(t) - x_i(t)\bigr)`} desc="에이전트 i가 이웃 N_i의 상태를 가중 평균하여 자신의 상태를 업데이트. epsilon은 학습률, w_ij는 연결 가중치. 반복하면 모든 에이전트가 공통 값에 수렴." color="indigo" />
              <EqCard idx={3} name="태스크 할당 (옥션)" latex={String.raw`a^* = \arg\max_{a_i \in \mathcal{A}} \bigl(v_i(\tau) - c_i(\tau)\bigr), \quad \tau \in \mathcal{T}`} desc="태스크 tau에 대해 가치 v에서 비용 c를 뺀 순이익이 최대인 에이전트 a*에 할당. 분산 옥션 방식으로 글로벌 최적에 근접." color="amber" />
              <EqCard idx={4} name="커버리지 최적화" latex={String.raw`\max_{\{p_i\}} \;\left|\bigcup_{i=1}^{n} \mathcal{C}(p_i, r)\right|, \quad \text{s.t. } \|p_i - p_j\| \geq d_{\min}`} desc="각 에이전트의 위치 p_i를 최적화하여 센싱 범위 C의 합집합(커버리지)을 최대화. 에이전트 간 최소 거리 d_min 유지." color="green" />
            </div>
          </Card>
        </div>
      </section>

      {/* Coordination Challenges */}
      <section className="scroll-mt-20">
        <SH icon={<AlertTriangle className="h-5 w-5" />} title="조율 핵심 과제 분석" collapsed={!!col['chal']} onToggle={() => toggle('chal')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['chal'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <Sub n="1" title="일반적 조율 문제" />
            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                { t: '태스크 할당 (MRTA)', d: 'Multi-Robot Task Allocation: 최적 에이전트-태스크 매핑을 NP-hard 환경에서 해결. 옥션, 헝가리안 알고리즘, 유전 알고리즘 등 활용. 동적 환경에서 재할당 필요.', c: 'sky' },
                { t: '경로 계획 (MAPF)', d: 'Multi-Agent Path Finding: 다수 에이전트가 충돌 없이 목적지에 도달하는 경로 산출. CBS(Conflict-Based Search), ECBS 등. 물류창고 AGV에서 핵심.', c: 'blue' },
                { t: '합의 형성', d: '분산 환경에서 에이전트들이 공통 값(위치, 속도, 의견)에 수렴. Raft, Paxos(분산 시스템), Average Consensus(로봇). Byzantine 장애 대응 필요.', c: 'indigo' },
                { t: '팀 형성/연합', d: '태스크에 적합한 에이전트 조합을 동적으로 구성. 개별 능력 보완, 자원 효율 극대화. Coalition Formation Game으로 모델링.', c: 'purple' },
              ].map(({ t, d, c }) => (
                <div key={t} className={`rounded-lg border border-${c}-200 bg-${c}-50 p-4 dark:border-${c}-900/40 dark:bg-${c}-900/10`}>
                  <p className={`text-xs font-bold text-${c}-700 dark:text-${c}-300`}>{t}</p>
                  <p className={`mt-1 text-xs leading-relaxed text-${c}-600 dark:text-${c}-400`}>{d}</p>
                </div>
              ))}
            </div>

            <Sub n="2" title="도메인별 특화 과제" />
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead><tr className="bg-gray-50 dark:bg-gray-800">
                  <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">도메인</th>
                  <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">특화 과제</th>
                  <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">조율 난이도</th>
                  <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">핵심 제약</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { d: '수색 구조', c: '생존자 발견 시 집결 + 통신 단절 대처', diff: '매우 높음', con: '통신 범위, 동적 환경' },
                    { d: '물류', c: '재고 관리 + 주문 우선순위 + 충돌 회피', diff: '높음', con: '실시간성, 처리량' },
                    { d: '자율 주행', c: '교차로 협상 + 긴급 차량 우선순위', diff: '매우 높음', con: '안전성, 지연 <100ms' },
                    { d: '스마트 그리드', c: '수요 응답 + 피크 관리 + 분산 발전', diff: '중간', con: '프라이버시, 안정성' },
                    { d: 'LLM MAS', c: '환각 방지 + 토큰 비용 + 수렴 보장', diff: '높음', con: 'API 비용, 지연' },
                  ].map((r, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">{r.d}</td>
                      <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{r.c}</td>
                      <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{r.diff}</td>
                      <td className="px-3 py-2 text-gray-500 dark:text-gray-400">{r.con}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-5">
              <Sub n="3" title="미래 연구 방향" />
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {[
                  { t: '크로스 도메인 전이', d: '한 도메인(예: 물류)에서 학습한 조율 전략을 다른 도메인(예: 교통)에 적용. 범용 조율 프레임워크 개발 필요.' },
                  { t: 'LLM + MARL 통합', d: 'LLM의 자연어 추론 능력과 MARL의 최적 정책 학습을 결합. 해석 가능하고 최적에 가까운 조율.' },
                  { t: '대규모 MAS 확장', d: '수천~수만 에이전트의 조율. 현재 대부분 100 이하. 계층적 추상화와 지역 자율성 필수.' },
                  { t: '인간-에이전트 혼합팀', d: '인간과 AI 에이전트가 동일 팀에서 협업. 인간의 직관과 AI의 계산 능력 상호 보완.' },
                ].map(({ t, d }) => (
                  <div key={t} className="rounded-lg border border-green-100 bg-green-50 p-3 dark:border-green-900/30 dark:bg-green-900/10">
                    <p className="text-xs font-bold text-green-700 dark:text-green-300">{t}</p>
                    <p className="mt-0.5 text-xs text-green-600 dark:text-green-400">{d}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="scroll-mt-20">
        <SH icon={<BarChart2 className="h-5 w-5" />} title="조율 방법론 종합 비교" collapsed={!!col['comp']} onToggle={() => toggle('comp')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['comp'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead><tr className="bg-sky-50 dark:bg-sky-900/20">
                  <th className="px-3 py-2 text-left font-bold text-sky-700">방법론</th>
                  <th className="px-3 py-2 text-center font-bold text-sky-700">확장성</th>
                  <th className="px-3 py-2 text-center font-bold text-sky-700">적응성</th>
                  <th className="px-3 py-2 text-center font-bold text-sky-700">통신 비용</th>
                  <th className="px-3 py-2 text-center font-bold text-sky-700">최적성 보장</th>
                  <th className="px-3 py-2 text-center font-bold text-sky-700">해석 가능</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { m: '규칙 기반', sc: '중', ad: '하', cc: '하', op: '없음', ex: '상' },
                    { m: '옥션/마켓', sc: '상', ad: '중', cc: '중', op: '근사', ex: '상' },
                    { m: '합의 프로토콜', sc: '중', ad: '하', cc: '상', op: '수렴 보장', ex: '상' },
                    { m: 'MARL', sc: '중', ad: '상', cc: '하~중', op: 'Nash 근사', ex: '하' },
                    { m: 'LLM 기반', sc: '하', ad: '상', cc: '상', op: '없음', ex: '상' },
                    { m: '하이브리드', sc: '상', ad: '상', cc: '중', op: '설계 의존', ex: '중' },
                  ].map((r, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">{r.m}</td>
                      <td className="px-3 py-2 text-center text-gray-600">{r.sc}</td>
                      <td className="px-3 py-2 text-center text-gray-600">{r.ad}</td>
                      <td className="px-3 py-2 text-center text-gray-600">{r.cc}</td>
                      <td className="px-3 py-2 text-center text-gray-600">{r.op}</td>
                      <td className="px-3 py-2 text-center text-gray-600">{r.ex}</td>
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
