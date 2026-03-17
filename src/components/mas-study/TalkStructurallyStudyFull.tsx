'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  BarChart2,
  BrainCircuit,
  ChevronDown,
  Cpu,
  GraduationCap,
  Hash,
  MessageSquare,
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
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">{n}</span>
      <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">{title}</h4>
    </div>
  );
}

function EqCard({ idx, name, latex, desc, color = 'violet' }: { idx: number; name: string; latex: string; desc: string; color?: string }) {
  const [open, setOpen] = useState(false);
  const cm: Record<string, string> = { violet: 'bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800', indigo: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800', amber: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800', blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' };
  const bm: Record<string, string> = { violet: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300', indigo: 'bg-indigo-100 text-indigo-700', amber: 'bg-amber-100 text-amber-700', blue: 'bg-blue-100 text-blue-700' };
  return (
    <div className="cursor-pointer rounded-xl border border-gray-200 bg-gray-50/50 p-4 transition hover:border-violet-300 dark:border-gray-700 dark:bg-gray-800" onClick={() => setOpen(v => !v)}>
      <div className="mb-2 flex items-center gap-2">
        <span className={`rounded px-2 py-0.5 text-xs font-bold ${bm[color] ?? bm.violet}`}>Eq.{idx}</span>
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{name}</span>
        <ChevronDown className={`ml-auto h-4 w-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </div>
      <div className="overflow-x-auto py-2"><Eq latex={latex} /></div>
      {open ? <div className={`mt-3 rounded-lg border px-4 py-3 ${cm[color] ?? cm.violet}`}><p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">{desc}</p></div> : <p className="mt-1 text-xs text-gray-400">클릭하여 상세 설명 보기</p>}
    </div>
  );
}

/* ── Interactive: Structured Protocol Viz ─────────────────────── */

function StructuredProtocolViz() {
  const [step, setStep] = useState(0);
  const steps = [
    { label: '1. 태스크 수신', desc: '사용자 쿼리가 시스템에 입력됩니다.', agents: ['Manager'], active: [0] },
    { label: '2. 구조화된 메시지 생성', desc: 'Manager가 구조화된 프로토콜로 태스크를 분해하여 하위 에이전트에 전달합니다.', agents: ['Manager', 'Worker-A', 'Worker-B'], active: [0] },
    { label: '3. 병렬 실행', desc: '각 Worker가 독립적으로 서브태스크를 실행합니다.', agents: ['Manager', 'Worker-A', 'Worker-B'], active: [1, 2] },
    { label: '4. 계층적 정제', desc: 'Evaluator가 결과를 검증하고, 필요시 상위 레벨로 에스컬레이션합니다.', agents: ['Manager', 'Worker-A', 'Worker-B', 'Evaluator'], active: [3] },
    { label: '5. 최종 출력', desc: '정제된 결과가 사용자에게 반환됩니다.', agents: ['Manager', 'Worker-A', 'Worker-B', 'Evaluator'], active: [0] },
  ];
  const cur = steps[step];

  return (
    <div className="rounded-xl border border-violet-200 bg-violet-50/50 p-4 dark:border-violet-800 dark:bg-violet-900/10">
      <p className="mb-3 text-sm font-bold text-violet-700 dark:text-violet-300">TalkHier 워크플로우 시뮬레이터</p>
      <div className="mb-4 flex gap-2">
        {steps.map((s, i) => (
          <button key={i} onClick={() => setStep(i)}
            className={`rounded px-2 py-1 text-xs font-bold transition ${i === step ? 'bg-violet-600 text-white' : 'bg-white text-gray-500 hover:bg-violet-100 dark:bg-gray-800'}`}>
            {i + 1}
          </button>
        ))}
      </div>
      <div className="mb-3">
        <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{cur.label}</p>
        <p className="text-xs text-gray-600 dark:text-gray-400">{cur.desc}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {cur.agents.map((a, i) => (
          <div key={a} className={`rounded-lg px-3 py-2 text-xs font-bold transition-all ${cur.active.includes(i) ? 'bg-violet-600 text-white scale-110' : 'bg-white text-gray-500 dark:bg-gray-800'}`}>
            {a}
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs italic text-gray-500">번호 버튼을 클릭하여 단계별 워크플로우를 확인하세요</p>
    </div>
  );
}

/* ── Interactive: Communication Format ────────────────────────── */

function CommFormatViz() {
  const [format, setFormat] = useState<'unstructured' | 'structured'>('unstructured');

  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-800 dark:bg-blue-900/10">
      <p className="mb-3 text-sm font-bold text-blue-700 dark:text-blue-300">통신 형식 비교</p>
      <div className="mb-3 flex gap-2">
        <button onClick={() => setFormat('unstructured')} className={`rounded px-3 py-1 text-xs font-bold ${format === 'unstructured' ? 'bg-red-500 text-white' : 'bg-white text-gray-500 dark:bg-gray-800'}`}>비구조화 (기존)</button>
        <button onClick={() => setFormat('structured')} className={`rounded px-3 py-1 text-xs font-bold ${format === 'structured' ? 'bg-violet-600 text-white' : 'bg-white text-gray-500 dark:bg-gray-800'}`}>구조화 (TalkHier)</button>
      </div>
      <div className="rounded-lg bg-white p-3 dark:bg-gray-800">
        {format === 'unstructured' ? (
          <pre className="text-xs text-red-600 dark:text-red-400 whitespace-pre-wrap">{`"Hey, can you help me solve this math problem?
It's about calculus and I need the derivative of
x^3 + 2x. Also check if my previous answer was
correct. The context is..."

[길고 비구조화된 자연어 텍스트]
→ 파싱 어려움, 맥락 손실, 모호성`}</pre>
        ) : (
          <pre className="text-xs text-violet-600 dark:text-violet-400 whitespace-pre-wrap">{`{
  "task_id": "T-042",
  "sender": "Manager",
  "receiver": "Math-Worker",
  "context": {
    "domain": "calculus",
    "prior_results": ["3x^2 + 2"],
    "constraints": ["verify_step_by_step"]
  },
  "instruction": "Compute derivative of x^3 + 2x",
  "expected_format": "LaTeX expression",
  "priority": "high"
}

[구조화된 JSON 프로토콜]
→ 명확한 파싱, 맥락 보존, 검증 가능`}</pre>
        )}
      </div>
    </div>
  );
}

/* ── Quiz ─────────────────────────────────────────────────────── */

function Quiz() {
  const qs = [
    { q: 'TalkHier의 두 핵심 기둥은?', opts: ['속도와 정확도', '구조화된 통신과 계층적 정제', '분산 학습과 중앙 제어', '강화학습과 지도학습'], ans: 1 },
    { q: 'TalkHier가 능가한 추론 스케일링 모델은?', opts: ['GPT-3', 'OpenAI o1', 'BERT', 'T5'], ans: 1 },
    { q: 'MAS를 수학적으로 어떻게 표현하나?', opts: ['행렬', '그래프 G=(V,E)', '트리', '큐'], ans: 1 },
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
                className={`w-full rounded px-3 py-1.5 text-left text-xs transition ${sel[i] === j ? (show ? (j === q.ans ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800') : 'bg-violet-100 text-violet-800') : 'bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400'}`}>
                {o}
              </button>
            ))}
          </div>
        </div>
      ))}
      <button onClick={() => setShow(true)} className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-bold text-white hover:bg-violet-700">정답 확인</button>
      {show && <p className="text-sm font-bold text-violet-700">점수: {sel.filter((s, i) => s === qs[i].ans).length}/{qs.length}</p>}
    </div>
  );
}

/* ── Main ─────────────────────────────────────────────────────── */

export default function TalkStructurallyStudyFull() {
  const [col, setCol] = useState<Record<string, boolean>>({});
  const toggle = useCallback((id: string) => setCol(c => ({ ...c, [id]: !c[id] })), []);

  return (
    <div className="space-y-6">
      {/* Overview */}
      <section className="scroll-mt-20">
        <div className="overflow-hidden rounded-xl shadow-sm">
          <div className="bg-gradient-to-br from-violet-700 via-purple-700 to-fuchsia-700 p-6 pb-8">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white">arXiv 2502.11098</span>
              <span className="rounded-full bg-yellow-400/90 px-3 py-1 text-xs font-bold text-yellow-900">Sony Research</span>
            </div>
            <h2 className="text-xl font-bold leading-snug text-white sm:text-2xl">Talk Structurally, Act Hierarchically: A Collaborative Framework for LLM Multi-Agent Systems</h2>
            <p className="mt-3 text-sm text-violet-200">Zhao Wang, Sota Moriyama, Wei-Yao Wang et al. · February 2025</p>
          </div>
          <div className="bg-white p-6 dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
            <p className="leading-relaxed text-gray-700 dark:text-gray-300">
              LLM 멀티에이전트 시스템에서 <span className="font-semibold text-violet-700 dark:text-violet-300">구조화된 통신 프로토콜</span>과
              <span className="font-semibold text-violet-700 dark:text-violet-300">계층적 정제 시스템</span>을 도입하는 TalkHier 프레임워크.
              에이전트 간 비구조화된 텍스트 교환으로 인한 맥락 손실, 환각, 편향 문제를 해결합니다.
              OpenAI o1, AgentVerse, GPT-4o 단일 에이전트 등 SOTA 시스템을 능가합니다.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {['Structured Communication', 'Hierarchical Refinement', 'LLM-MA', 'TalkHier', 'Context-Rich Protocol'].map(t => (
                <span key={t} className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="scroll-mt-20">
        <SH icon={<AlertTriangle className="h-5 w-5" />} title="기존 LLM-MA의 통신 문제" collapsed={!!col['prob']} onToggle={() => toggle('prob')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['prob'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                { t: '비구조화된 통신', d: '에이전트가 자연어로 자유롭게 소통 → 태스크 설명, 배경 맥락, 출력 형식이 뒤섞여 길고 비효율적인 대화', c: 'red' },
                { t: '맥락 손실', d: '긴 대화에서 초기 정보가 LLM 컨텍스트 윈도우 밖으로 밀려남 → 중요한 제약 조건 무시', c: 'red' },
                { t: '환각 전파', d: '한 에이전트의 환각이 다른 에이전트에 전파되어 증폭 → 디버깅 어려움', c: 'orange' },
                { t: '편향 고착', d: '초기 응답에 대한 앵커링 편향으로 정제 과정이 실질적 개선을 못 함', c: 'orange' },
              ].map(({ t, d, c }) => (
                <div key={t} className={`rounded-lg border border-${c}-200 bg-${c}-50 p-4 dark:border-${c}-900/40 dark:bg-${c}-900/10`}>
                  <p className={`text-xs font-bold text-${c}-700 dark:text-${c}-300`}>{t}</p>
                  <p className={`mt-1 text-xs text-${c}-600 dark:text-${c}-400`}>{d}</p>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <Sub n="*" title="통신 형식 비교" />
              <CommFormatViz />
            </div>
          </Card>
        </div>
      </section>

      {/* TalkHier Framework */}
      <section className="scroll-mt-20">
        <SH icon={<Layers className="h-5 w-5" />} title="TalkHier 프레임워크" collapsed={!!col['fw']} onToggle={() => toggle('fw')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['fw'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <Sub n="1" title="구조화된 통신 프로토콜" />
            <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
              에이전트 간 메시지를 정형화된 스키마로 구조화합니다. 각 메시지는 태스크 ID, 발신/수신자, 맥락 객체, 지시사항, 기대 출력 형식, 우선순위를 포함합니다.
              이로써 파싱이 용이하고, 맥락이 보존되며, 검증이 가능합니다.
            </p>

            <Sub n="2" title="계층적 정제 시스템" />
            <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
              Worker 에이전트의 출력을 Evaluator가 검증하고, 문제 발견 시 구체적인 피드백과 함께 재작업을 요청합니다.
              심각한 오류는 상위 Manager 레벨로 에스컬레이션되어 태스크 자체를 재분해합니다.
            </p>
            <div className="mb-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
              <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-x-auto">{`
  [Manager] ─── 구조화된 태스크 분해 ──→ [Worker-A]
      │                                      │
      │                                  실행 결과
      │                                      ↓
      │                               [Evaluator]
      │                                 │       │
      │                           통과 ←┘       └→ 피드백 → [Worker-A] (재시도)
      │                                               │
      └── 에스컬레이션 (심각한 오류) ←─────────────────┘
              `}</pre>
            </div>

            <Sub n="3" title="워크플로우 시뮬레이터" />
            <StructuredProtocolViz />
          </Card>
        </div>
      </section>

      {/* Equations */}
      <section className="scroll-mt-20">
        <SH icon={<Hash className="h-5 w-5" />} title="핵심 수식" collapsed={!!col['eq']} onToggle={() => toggle('eq')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['eq'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="space-y-3">
              <EqCard idx={1} name="MAS 그래프 표현" latex={String.raw`G = (V, E), \quad V = \{v_1, \ldots, v_n\},\quad E = \{(v_i, v_j) : \text{comm}(v_i, v_j)\}`} desc="LLM-MA 시스템을 그래프 G로 표현. V는 에이전트 집합, E는 통신 경로. 구조화된 프로토콜이 E를 통해 전달됩니다." color="violet" />
              <EqCard idx={2} name="구조화된 메시지" latex={String.raw`m_{ij} = \langle \text{id}, s_i, r_j, \mathcal{C}, \mathcal{I}, \mathcal{F}, p \rangle`} desc="에이전트 i에서 j로의 메시지. id=태스크 ID, s=발신자, r=수신자, C=맥락 객체(사전 결과/제약), I=지시사항, F=기대 출력 형식, p=우선순위." color="violet" />
              <EqCard idx={3} name="계층적 정제 함수" latex={String.raw`y^{(k+1)} = R(y^{(k)}, f_{\text{eval}}(y^{(k)})), \quad k = 0, 1, \ldots, K`} desc="k번째 정제 단계에서 Evaluator의 피드백 f_eval(y)을 반영하여 출력을 개선. K는 최대 정제 횟수. 수렴하지 않으면 에스컬레이션." color="blue" />
              <EqCard idx={4} name="에스컬레이션 조건" latex={String.raw`\text{Escalate}(y^{(K)}) = \mathbb{1}\!\left[\text{score}(y^{(K)}) < \tau_{\text{min}}\right]`} desc="K번 정제 후에도 품질 점수가 임계값 tau 미만이면 상위 Manager에게 에스컬레이션. 태스크 재분해 트리거." color="amber" />
            </div>
          </Card>
        </div>
      </section>

      {/* Results */}
      <section className="scroll-mt-20">
        <SH icon={<BarChart2 className="h-5 w-5" />} title="실험 결과 비교" collapsed={!!col['res']} onToggle={() => toggle('res')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['res'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead><tr className="bg-gray-50 dark:bg-gray-800">
                  <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">시스템</th>
                  <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">유형</th>
                  <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">구조화 통신</th>
                  <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">계층적 정제</th>
                  <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">주요 한계</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { m: 'GPT-4o (single)', ty: '단일 에이전트', sc: 'X', hr: 'X', lim: '복잡한 태스크에서 한계', hi: false },
                    { m: 'ReAct', ty: '단일 에이전트', sc: 'X', hr: 'X', lim: '도구 사용 중심, 협업 없음', hi: false },
                    { m: 'OpenAI o1', ty: '추론 스케일링', sc: 'X', hr: '부분적', lim: '단일 모델 내부 스케일링', hi: false },
                    { m: 'AgentVerse', ty: '멀티에이전트', sc: 'X', hr: 'X', lim: '비구조화된 토론 방식', hi: false },
                    { m: 'TalkHier', ty: '멀티에이전트', sc: 'O', hr: 'O', lim: '-', hi: true },
                  ].map((r, i) => (
                    <tr key={i} className={r.hi ? 'bg-violet-50 dark:bg-violet-900/20' : ''}>
                      <td className={`px-3 py-2 font-medium ${r.hi ? 'text-violet-700 dark:text-violet-300' : 'text-gray-700 dark:text-gray-300'}`}>{r.m}</td>
                      <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">{r.ty}</td>
                      <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">{r.sc}</td>
                      <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">{r.hr}</td>
                      <td className="px-3 py-2 text-gray-500 dark:text-gray-400">{r.lim}</td>
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
