'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  BookOpen, ChevronDown, Globe, Layers, Radio,
  Calendar, CheckCircle, Target, GraduationCap,
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

function SH({ icon, title, collapsed, onToggle }: {
  icon: React.ReactNode; title: string; collapsed?: boolean; onToggle?: () => void;
}) {
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

/* ── Quiz ──────────────────────────────────────────────────── */

const quizData = [
  { q: '3GPP에서 AI/ML for NR Air Interface 연구가 시작된 릴리스는?', opts: ['Release 16', 'Release 17', 'Release 18', 'Release 19'], ans: 1 },
  { q: 'Study Item(SI)과 Work Item(WI)의 차이점은?', opts: ['SI는 규격화, WI는 연구', 'SI는 연구/타당성, WI는 실제 규격화', 'SI와 WI는 동일', 'WI가 먼저 진행'], ans: 1 },
  { q: 'Release 18에서 선정된 AI/ML 3대 Use Case가 아닌 것은?', opts: ['CSI feedback', 'Beam management', 'Positioning', 'Interference cancellation'], ans: 3 },
  { q: 'TR 38.843은 어떤 그룹에서 작성했는가?', opts: ['SA5', 'RAN3', 'RAN1', 'CT1'], ans: 2 },
  { q: 'Release 19의 AI/ML 규격화에서 CSI 관련 핵심 변화는?', opts: ['CSI 폐지', 'Two-sided model 규격화', '8비트 양자화 도입', 'MIMO 삭제'], ans: 1 },
];

function Quiz() {
  const [cur, setCur] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const check = (i: number) => {
    if (sel !== null) return;
    setSel(i);
    if (i === quizData[cur].ans) setScore(s => s + 1);
  };
  const next = () => {
    if (cur + 1 >= quizData.length) { setDone(true); return; }
    setCur(c => c + 1); setSel(null);
  };

  if (done) return (
    <div className="rounded-xl border-2 border-blue-300 bg-blue-50 p-6 text-center dark:border-blue-700 dark:bg-blue-900/20">
      <p className="text-lg font-bold text-blue-700 dark:text-blue-300">퀴즈 완료: {score}/{quizData.length}</p>
      <button onClick={() => { setCur(0); setSel(null); setScore(0); setDone(false); }} className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700">다시 풀기</button>
    </div>
  );

  const q = quizData[cur];
  return (
    <div className="space-y-3">
      <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Q{cur + 1}. {q.q}</p>
      {q.opts.map((o, i) => (
        <button key={i} onClick={() => check(i)} className={`w-full rounded-lg border p-3 text-left text-sm transition ${sel === null ? 'border-gray-200 hover:border-blue-400 dark:border-gray-700' : i === q.ans ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : i === sel ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 opacity-50 dark:border-gray-700'}`}>
          {o}
        </button>
      ))}
      {sel !== null && <button onClick={next} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700">{cur + 1 < quizData.length ? '다음' : '결과 보기'}</button>}
    </div>
  );
}

/* ── Main ──────────────────────────────────────────────────── */

export default function ThreeGPPOverviewStudyFull() {
  const [col, setCol] = useState<Record<string, boolean>>({});
  const toggle = useCallback((id: string) => setCol(c => ({ ...c, [id]: !c[id] })), []);

  return (
    <div className="space-y-6">

      {/* Hero */}
      <section className="scroll-mt-20">
        <div className="overflow-hidden rounded-xl shadow-sm">
          <div className="bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-700 p-6 pb-8">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white">3GPP Standards</span>
              <span className="rounded-full bg-cyan-400/90 px-3 py-1 text-xs font-bold text-cyan-900">Release 18/19</span>
            </div>
            <h2 className="text-xl font-bold leading-snug text-white sm:text-2xl">
              An Overview of AI/ML in 3GPP: 표준화 동향과 로드맵
            </h2>
            <p className="mt-3 text-sm text-blue-200">3GPP RAN1/RAN3/SA5 AI/ML 표준화 종합 분석</p>
          </div>
          <div className="bg-white p-6 dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
            <p className="leading-relaxed text-gray-700 dark:text-gray-300">
              3GPP는 Release 17부터 AI/ML의 5G NR 적용을 체계적으로 연구해왔습니다.
              <span className="font-semibold text-blue-700 dark:text-blue-300"> Study Item(SI)</span>으로 타당성을 검증하고,
              <span className="font-semibold text-indigo-700 dark:text-indigo-300"> Work Item(WI)</span>으로 실제 규격에 반영하는 2단계 접근으로
              CSI feedback, beam management, positioning 3대 use case를 중심으로 표준화가 진행 중입니다.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {['Release 18 SI', 'Release 19 WI', 'CSI Feedback', 'Beam Management', 'Positioning', 'Model Management'].map(tag => (
                <span key={tag} className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="scroll-mt-20">
        <SH icon={<Calendar className="h-5 w-5" />} title="3GPP AI/ML 표준화 타임라인" collapsed={!!col['timeline']} onToggle={() => toggle('timeline')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['timeline'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="space-y-4">
              {[
                { year: '2020-2021', rel: 'Rel-17 SI', title: 'AI/ML for NR Air Interface Study 시작', desc: 'RP-213599: RAN1에서 AI/ML 적용 가능성 연구 승인. 3대 use case 선정 (CSI, beam, positioning). TR 38.843 작성 시작.', color: 'amber' },
                { year: '2022 Q1', rel: 'Rel-18 SI', title: 'Study Item 본격 진행', desc: 'AI/ML 모델 라이프사이클 정의: 학습(training), 추론(inference), 모니터링(monitoring). 평가 방법론 확립. 양면 모델(two-sided) vs 단면 모델(one-sided) 구분.', color: 'blue' },
                { year: '2022 Q4', rel: 'Rel-18 결론', title: 'SI 완료 및 결론 도출', desc: 'CSI feedback: two-sided model 기반 압축이 eType II 대비 유의미한 이득. Beam management: 시공간 예측으로 오버헤드 40-60% 감소. Positioning: AI로 3m→1m 정확도 향상.', color: 'indigo' },
                { year: '2023 Q1', rel: 'Rel-19 WI', title: 'Work Item 승인 (RP-234039)', desc: 'CSI feedback/prediction 규격화 시작. Two-sided model 표준 절차 정의. 모델 전달(model transfer), 모니터링, 데이터 수집 프레임워크 규격화.', color: 'purple' },
                { year: '2024-2025', rel: 'Rel-19 진행', title: '규격 완성 단계', desc: 'Beam management WI 병행. CSI prediction sub-use case 추가. 복잡도 비교 프레임워크 정의. 모델 관리 절차 규격 완성.', color: 'violet' },
                { year: '2026+', rel: 'Rel-20 전망', title: '6G 통합 AI/ML', desc: 'AI-native air interface 비전. Joint communication & sensing. Semantic communication 연구 예정.', color: 'rose' },
              ].map(({ year, rel, title, desc, color }) => (
                <div key={year} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-${color}-100 dark:bg-${color}-900/30`}>
                      <Calendar className={`h-5 w-5 text-${color}-600 dark:text-${color}-400`} />
                    </div>
                    <div className="mt-1 h-full w-px bg-gray-200 dark:bg-gray-700" />
                  </div>
                  <div className="pb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-500">{year}</span>
                      <span className={`rounded-full bg-${color}-100 px-2 py-0.5 text-xs font-bold text-${color}-700 dark:bg-${color}-900/30 dark:text-${color}-300`}>{rel}</span>
                    </div>
                    <p className="mt-1 text-sm font-bold text-gray-800 dark:text-gray-200">{title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-gray-600 dark:text-gray-400">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* SI vs WI */}
      <section className="scroll-mt-20">
        <SH icon={<Layers className="h-5 w-5" />} title="Study Item vs Work Item 프로세스" collapsed={!!col['siwi']} onToggle={() => toggle('siwi')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['siwi'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <Sub n="1" title="3GPP 표준화 2단계 구조" />
            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-900/10">
                <p className="mb-2 text-sm font-bold text-amber-700 dark:text-amber-300">Study Item (SI)</p>
                <ul className="space-y-1 text-xs text-amber-600 dark:text-amber-400">
                  <li>- 기술 타당성 검증 (feasibility study)</li>
                  <li>- Technical Report (TR) 작성</li>
                  <li>- 시뮬레이션 평가 및 비교</li>
                  <li>- 합의 도출, 결론 정리</li>
                  <li>- 규격 효력 없음 (normative 아님)</li>
                </ul>
              </div>
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/40 dark:bg-blue-900/10">
                <p className="mb-2 text-sm font-bold text-blue-700 dark:text-blue-300">Work Item (WI)</p>
                <ul className="space-y-1 text-xs text-blue-600 dark:text-blue-400">
                  <li>- 실제 규격(TS) 작성</li>
                  <li>- 프로토콜 절차 정의</li>
                  <li>- ASN.1 / RRC 메시지 설계</li>
                  <li>- 단말/기지국 구현 요구사항</li>
                  <li>- 상호운용성 보장 (normative)</li>
                </ul>
              </div>
            </div>

            <Sub n="2" title="AI/ML SI → WI 전환 흐름" />
            <div className="overflow-x-auto rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
              <div className="flex items-center gap-2 text-xs">
                {['RP 제안서', 'TSG 승인', 'SI 진행\n(TR 작성)', 'SI 결론', 'WI 제안서', 'TSG 승인', 'WI 진행\n(TS 작성)', '규격 동결'].map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className={`rounded-lg px-3 py-2 text-center font-bold whitespace-pre-line ${i < 4 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'}`}>
                      {s}
                    </div>
                    {i < 7 && <span className="text-gray-400">→</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 dark:border-green-800 dark:bg-green-900/20">
              <p className="text-xs font-semibold text-green-700 dark:text-green-300">핵심 포인트</p>
              <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                AI/ML for Air Interface는 Rel-17에서 SI 시작 → Rel-18에서 SI 완료 → Rel-19에서 WI로 전환.
                일반적으로 SI 1~2년, WI 1~2년이 소요되며, AI/ML은 빠른 편에 속합니다.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* 3 Use Cases */}
      <section className="scroll-mt-20">
        <SH icon={<Target className="h-5 w-5" />} title="3대 Use Case 상세" collapsed={!!col['usecases']} onToggle={() => toggle('usecases')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['usecases'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-blue-50 dark:bg-blue-900/20">
                    <th className="px-3 py-2 text-left font-bold text-blue-700 dark:text-blue-300">Use Case</th>
                    <th className="px-3 py-2 text-left font-bold text-blue-700 dark:text-blue-300">AI 적용 방식</th>
                    <th className="px-3 py-2 text-center font-bold text-blue-700 dark:text-blue-300">모델 위치</th>
                    <th className="px-3 py-2 text-center font-bold text-blue-700 dark:text-blue-300">SI 결론</th>
                    <th className="px-3 py-2 text-center font-bold text-blue-700 dark:text-blue-300">Rel-19 WI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { uc: 'CSI Feedback', how: 'Two-sided model로 CSI 압축/복원', loc: 'UE + gNB', si: 'eType II 대비 이득 확인', wi: 'O (규격화)' },
                    { uc: 'CSI Prediction', how: '시계열 CSI 예측으로 aging 보상', loc: 'UE / gNB', si: 'Sub-use case 승인', wi: 'O (추가)' },
                    { uc: 'Beam Management', how: '빔 예측으로 측정 오버헤드 감소', loc: 'gNB (주)', si: '40-60% 오버헤드 감소', wi: 'O (규격화)' },
                    { uc: 'Positioning', how: 'AI로 위치 정확도 향상', loc: 'UE / LMF', si: '3m→1m 이하', wi: '검토 중' },
                  ].map((r, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-3 py-2 font-semibold text-gray-700 dark:text-gray-300">{r.uc}</td>
                      <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{r.how}</td>
                      <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">{r.loc}</td>
                      <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">{r.si}</td>
                      <td className="px-3 py-2 text-center font-bold text-blue-600 dark:text-blue-400">{r.wi}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-5">
              <Sub n="2" title="워킹 그룹별 역할 분담" />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  { grp: 'RAN1', role: '물리 계층 AI/ML', items: ['CSI feedback 모델 구조', 'Beam prediction 알고리즘', '성능 평가 방법론', 'AI 복잡도 비교 프레임워크'] },
                  { grp: 'RAN3', role: '네트워크 AI/ML', items: ['SON (Self-Organizing Networks)', '부하 분산 최적화', '에너지 절감 AI', 'Mobility 최적화'] },
                  { grp: 'SA5', role: 'AI 관리 프레임워크', items: ['Model lifecycle management', 'NWDAF (Data Analytics)', 'AI/ML 모델 배포', '성능 모니터링 규격'] },
                ].map(({ grp, role, items }) => (
                  <div key={grp} className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                    <p className="mb-1 text-sm font-bold text-indigo-700 dark:text-indigo-300">{grp}</p>
                    <p className="mb-2 text-xs text-gray-500">{role}</p>
                    <ul className="space-y-1">
                      {items.map(it => <li key={it} className="text-xs text-gray-600 dark:text-gray-400">- {it}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Model Management */}
      <section className="scroll-mt-20">
        <SH icon={<Globe className="h-5 w-5" />} title="AI/ML 모델 관리 프레임워크" collapsed={!!col['mgmt']} onToggle={() => toggle('mgmt')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['mgmt'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <Sub n="1" title="모델 라이프사이클 (3GPP 정의)" />
            <div className="mb-4 space-y-2">
              {[
                { step: '1', title: 'Data Collection', desc: 'UE/gNB에서 학습/모니터링 데이터 수집. 데이터 유형, 양, 수집 주기 규격화.', color: 'blue' },
                { step: '2', title: 'Model Training', desc: '오프라인(서버측) 또는 온라인(기기측) 학습. gNB→UE 모델 전달 절차 포함.', color: 'indigo' },
                { step: '3', title: 'Model Inference', desc: 'UE측(CSI prediction) 또는 gNB측(beam management) 추론 수행.', color: 'purple' },
                { step: '4', title: 'Model Monitoring', desc: '모델 성능 지속 감시. 성능 메트릭 보고 및 열화 감지.', color: 'violet' },
                { step: '5', title: 'Model Update/Switching', desc: '성능 열화 시 모델 교체 또는 fallback. 기존 방식(non-AI)으로 전환 지원.', color: 'rose' },
              ].map(({ step, title, desc, color }) => (
                <div key={step} className={`flex gap-3 rounded-lg border border-${color}-200 bg-${color}-50/70 p-3 dark:border-${color}-900/40 dark:bg-${color}-900/10`}>
                  <span className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-${color}-600 text-xs font-bold text-white`}>{step}</span>
                  <div>
                    <p className={`text-sm font-bold text-${color}-800 dark:text-${color}-200`}>{title}</p>
                    <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <Sub n="2" title="Two-Sided Model 구조 (CSI Feedback)" />
            <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-800 dark:bg-indigo-900/20">
              <div className="overflow-x-auto">
                <Eq latex={String.raw`\text{UE: } \mathbf{s} = f_{\text{enc}}(\mathbf{H}) \;\xrightarrow{\text{feedback}}\; \text{gNB: } \hat{\mathbf{H}} = f_{\text{dec}}(\mathbf{s})`} />
              </div>
              <p className="mt-2 text-xs text-indigo-600 dark:text-indigo-400">
                UE에 encoder, gNB에 decoder를 배치하는 양면 모델. 3GPP에서 모델 호환성(interoperability) 보장이 핵심 과제.
                서로 다른 벤더의 UE와 gNB가 동일한 모델 구조/파라미터를 공유해야 함.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Key Decisions */}
      <section className="scroll-mt-20">
        <SH icon={<CheckCircle className="h-5 w-5" />} title="핵심 표준화 결정 사항" collapsed={!!col['decisions']} onToggle={() => toggle('decisions')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['decisions'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-400">결정 사항</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-400">내용</th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-gray-400">릴리스</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { d: 'AI 모델 구조 규격 불포함', c: '모델 아키텍처(CNN, Transformer 등)는 구현 자유. 입출력 인터페이스만 규격화.', r: '18' },
                    { d: 'Fallback to non-AI 필수', c: 'AI 모델 실패 시 기존 codebook 방식으로 전환하는 메커니즘 필수 지원.', r: '19' },
                    { d: 'One-sided vs Two-sided', c: 'CSI feedback: two-sided. CSI prediction: one-sided (UE). Beam: 양쪽 가능.', r: '18' },
                    { d: '모델 전달 (model transfer)', c: 'gNB → UE 방향 모델 전달 절차 규격화. 모델 식별자(ID) 체계 포함.', r: '19' },
                    { d: '복잡도 비교 프레임워크', c: 'AI vs non-AI 솔루션의 FLOPs, 파라미터 수, 메모리 비교 기준 정의.', r: '19' },
                    { d: 'NWDAF 연동', c: '코어 네트워크 NWDAF가 AI 분석 결과를 RAN에 전달하는 구조.', r: '18' },
                  ].map((r, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-3 py-2 font-semibold text-gray-700 dark:text-gray-300">{r.d}</td>
                      <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{r.c}</td>
                      <td className="px-3 py-2 text-center font-mono text-blue-600 dark:text-blue-400">Rel-{r.r}</td>
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
