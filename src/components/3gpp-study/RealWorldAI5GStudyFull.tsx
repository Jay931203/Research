'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  Radio, ChevronDown, Cpu, Globe, Layers,
  GraduationCap, BarChart2, Server, Wifi,
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
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">{n}</span>
      <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">{title}</h4>
    </div>
  );
}

/* ── Interactive Control Loop ──────────────────────────────── */

function ControlLoopViz() {
  const [activeLoop, setActiveLoop] = useState<'fast' | 'slow'>('fast');
  const loops = {
    fast: { title: 'Fast Loop (Edge)', latency: '<10ms', location: '기지국 엣지', functions: ['스케줄링 최적화', '전력 제어', 'HARQ 적응', '빔 추적'], color: 'emerald' },
    slow: { title: 'Slow Loop (Cloud)', latency: '분~시간', location: '클라우드/중앙', functions: ['커버리지 최적화', '안테나 틸트 조정', '네트워크 재구성', '에너지 절감 정책'], color: 'blue' },
  };
  const l = loops[activeLoop];

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button onClick={() => setActiveLoop('fast')} className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold transition ${activeLoop === 'fast' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-800'}`}>Fast Loop (Edge)</button>
        <button onClick={() => setActiveLoop('slow')} className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold transition ${activeLoop === 'slow' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-800'}`}>Slow Loop (Cloud)</button>
      </div>
      <div className={`rounded-lg border border-${l.color}-200 bg-${l.color}-50 p-4 dark:border-${l.color}-800 dark:bg-${l.color}-900/20`}>
        <div className="mb-2 flex items-center gap-3">
          <span className={`text-sm font-bold text-${l.color}-700 dark:text-${l.color}-300`}>{l.title}</span>
          <span className={`rounded bg-${l.color}-100 px-2 py-0.5 text-xs font-mono text-${l.color}-700 dark:bg-${l.color}-900/40`}>{l.latency}</span>
        </div>
        <p className="mb-2 text-xs text-gray-600 dark:text-gray-400">실행 위치: {l.location}</p>
        <div className="grid grid-cols-2 gap-2">
          {l.functions.map(f => (
            <div key={f} className={`rounded border border-${l.color}-200 bg-white px-2 py-1.5 text-xs text-${l.color}-700 dark:border-${l.color}-800 dark:bg-gray-900 dark:text-${l.color}-300`}>{f}</div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
        <span>텔레메트리 수집</span> <span>→</span> <span>AI 분석</span> <span>→</span> <span>정책 생성</span> <span>→</span> <span>디지털 트윈 검증</span> <span>→</span> <span>배포</span>
      </div>
    </div>
  );
}

/* ── Quiz ──────────────────────────────────────────────────── */

const quizData = [
  { q: 'Edge-hosted AI의 주요 장점은?', opts: ['클라우드 비용 증가', '백홀 의존도 감소 + 저지연 추론', '전력 소비 증가', '대역폭 확대'], ans: 1 },
  { q: 'Digital twin의 역할은?', opts: ['데이터 삭제', '실제 네트워크 영향 없이 정책 사전 검증', '모델 학습 불필요', '안테나 교체'], ans: 1 },
  { q: 'RL 기반 RAN 튜닝에서 reward signal에 포함되는 것은?', opts: ['모델 크기', '스펙트럼 효율, 지연, 공정성, 에너지', '코드 라인 수', '사용자 수만'], ans: 1 },
  { q: 'Bentocell 플랫폼의 특징은?', opts: ['소프트웨어 전용', 'RF+기저대역+CPU/GPU 통합 + Docker 컨테이너', '위성 전용', '코어 네트워크만'], ans: 1 },
];

function Quiz() {
  const [cur, setCur] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const check = (i: number) => { if (sel !== null) return; setSel(i); if (i === quizData[cur].ans) setScore(s => s + 1); };
  const next = () => { if (cur + 1 >= quizData.length) { setDone(true); return; } setCur(c => c + 1); setSel(null); };

  if (done) return (
    <div className="rounded-xl border-2 border-teal-300 bg-teal-50 p-6 text-center dark:border-teal-700 dark:bg-teal-900/20">
      <p className="text-lg font-bold text-teal-700 dark:text-teal-300">결과: {score}/{quizData.length}</p>
      <button onClick={() => { setCur(0); setSel(null); setScore(0); setDone(false); }} className="mt-3 rounded-lg bg-teal-600 px-4 py-2 text-sm font-bold text-white">다시 풀기</button>
    </div>
  );
  const q = quizData[cur];
  return (
    <div className="space-y-3">
      <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Q{cur + 1}. {q.q}</p>
      {q.opts.map((o, i) => (
        <button key={i} onClick={() => check(i)} className={`w-full rounded-lg border p-3 text-left text-sm transition ${sel === null ? 'border-gray-200 hover:border-teal-400 dark:border-gray-700' : i === q.ans ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : i === sel ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 opacity-50 dark:border-gray-700'}`}>{o}</button>
      ))}
      {sel !== null && <button onClick={next} className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-bold text-white">{cur + 1 < quizData.length ? '다음' : '결과'}</button>}
    </div>
  );
}

/* ── Main ──────────────────────────────────────────────────── */

export default function RealWorldAI5GStudyFull() {
  const [col, setCol] = useState<Record<string, boolean>>({});
  const toggle = useCallback((id: string) => setCol(c => ({ ...c, [id]: !c[id] })), []);

  return (
    <div className="space-y-6">

      {/* Hero */}
      <section className="scroll-mt-20">
        <div className="overflow-hidden rounded-xl shadow-sm">
          <div className="bg-gradient-to-br from-teal-700 via-emerald-700 to-green-700 p-6 pb-8">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white">arXiv: 2602.02787</span>
              <span className="rounded-full bg-yellow-400/90 px-3 py-1 text-xs font-bold text-yellow-900">Real-World Deployment</span>
            </div>
            <h2 className="text-xl font-bold leading-snug text-white sm:text-2xl">
              Real-World Applications of AI in LTE and 5G-NR Networks
            </h2>
            <p className="mt-3 text-sm text-teal-200">Saxena, Kovesdy (2026) - 실제 네트워크 AI 적용 사례</p>
          </div>
          <div className="bg-white p-6 dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
            <p className="leading-relaxed text-gray-700 dark:text-gray-300">
              대부분의 LTE/5G-NR 네트워크가 정적 수동 설정에 의존하는 현실에서,
              <span className="font-semibold text-teal-700 dark:text-teal-300"> AI 기반 적응형 네트워크 최적화</span>의 실제 배포 사례를 분석합니다.
              강화학습 기반 RAN 자동 튜닝, 디지털 트윈 사전 검증,
              <span className="font-semibold text-emerald-700 dark:text-emerald-300"> 엣지 호스팅 AI 아키텍처</span>를 통한
              농촌/원격지 네트워크 최적화 방안을 제시합니다.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {['RL-based RAN Tuning', 'Digital Twin', 'Edge AI', 'Network Planning', 'Rural Connectivity'].map(tag => (
                <span key={tag} className="rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* AI Methods */}
      <section className="scroll-mt-20">
        <SH icon={<Cpu className="h-5 w-5" />} title="AI 기반 네트워크 최적화 기법" collapsed={!!col['methods']} onToggle={() => toggle('methods')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['methods'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead><tr className="bg-teal-50 dark:bg-teal-900/20">
                  <th className="px-3 py-2 text-left font-bold text-teal-700 dark:text-teal-300">기법</th>
                  <th className="px-3 py-2 text-left font-bold text-teal-700 dark:text-teal-300">설명</th>
                  <th className="px-3 py-2 text-left font-bold text-teal-700 dark:text-teal-300">적용 대상</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { m: 'Graph Neural Networks', d: 'RAN을 그래프로 모델링 (노드=기지국, 엣지=간섭)', a: '커버리지 경계 예측, 중첩 영역 식별' },
                    { m: 'Reinforcement Learning', d: '순차적 의사결정으로 RAN 파라미터 자동 조정', a: '안테나 틸트, 전력, 핸드오버, 스케줄링' },
                    { m: 'Clustering (비지도)', d: '시공간 사용자 행동 패턴 추출', a: '트래픽 예측, 용량 계획' },
                    { m: 'Digital Twin', d: '실시간 텔레메트리 기반 가상 RAN 복제', a: '정책 사전 검증, 안전한 탐색' },
                  ].map((r, i) => (
                    <tr key={i}><td className="px-3 py-2 font-semibold text-gray-700 dark:text-gray-300">{r.m}</td>
                      <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{r.d}</td>
                      <td className="px-3 py-2 text-gray-500 dark:text-gray-400">{r.a}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </section>

      {/* RL for RAN */}
      <section className="scroll-mt-20">
        <SH icon={<Radio className="h-5 w-5" />} title="RL 기반 RAN 자동 튜닝" collapsed={!!col['rl']} onToggle={() => toggle('rl')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['rl'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <Sub n="1" title="MDP 모델링" />
            <div className="mb-4 overflow-x-auto rounded-lg bg-teal-50 p-3 dark:bg-teal-900/20">
              <Eq latex={String.raw`\pi^* = \arg\max_\pi \;\mathbb{E}\!\left[\sum_{t=0}^{\infty} \gamma^t \, r(s_t, a_t)\right]`} />
            </div>

            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
                <p className="mb-1 text-xs font-bold text-blue-700 dark:text-blue-300">State (관측)</p>
                <ul className="space-y-0.5 text-xs text-blue-600 dark:text-blue-400">
                  <li>- RSRP / SINR 분포</li>
                  <li>- HARQ 피드백 통계</li>
                  <li>- CQI (채널 품질)</li>
                  <li>- 버퍼 점유율</li>
                </ul>
              </div>
              <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-3 dark:border-indigo-800 dark:bg-indigo-900/20">
                <p className="mb-1 text-xs font-bold text-indigo-700 dark:text-indigo-300">Action (조정)</p>
                <ul className="space-y-0.5 text-xs text-indigo-600 dark:text-indigo-400">
                  <li>- 안테나 틸트/전력</li>
                  <li>- 핸드오버 임계값</li>
                  <li>- 서브밴드 스케줄링 (DQN)</li>
                  <li>- 전력 제어 (Actor-Critic)</li>
                </ul>
              </div>
              <div className="rounded-lg border border-purple-200 bg-purple-50 p-3 dark:border-purple-800 dark:bg-purple-900/20">
                <p className="mb-1 text-xs font-bold text-purple-700 dark:text-purple-300">Reward (보상)</p>
                <ul className="space-y-0.5 text-xs text-purple-600 dark:text-purple-400">
                  <li>- 스펙트럼 효율</li>
                  <li>- 지연 시간</li>
                  <li>- 공정성 (fairness)</li>
                  <li>- 에너지 소비</li>
                </ul>
              </div>
            </div>

            <Sub n="2" title="분산 RL 아키텍처" />
            <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
              이산 제어(서브밴드 스케줄링)에는 Deep Q-Learning, 연속 제어(전력)에는 Actor-Critic을 결합한
              분산 심층 강화학습 구조를 사용합니다. 기존 중앙집중식 fractional programming 접근을 대체하며,
              밀집(dense) 간섭 제한 환경에서 특히 효과적입니다.
            </p>
          </Card>
        </div>
      </section>

      {/* Edge AI */}
      <section className="scroll-mt-20">
        <SH icon={<Server className="h-5 w-5" />} title="엣지 호스팅 AI 아키텍처" collapsed={!!col['edge']} onToggle={() => toggle('edge')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['edge'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <Sub n="1" title="Bentocell 플랫폼" />
            <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
              RF, 기저대역(CU/DU), CPU/GPU/NPU를 통합한 소형 기지국 플랫폼으로
              Docker 컨테이너를 통해 AI 애플리케이션을 직접 실행합니다.
            </p>
            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { cat: 'Femtocell', power: '0.25W', range: '실내 50m', use: '가정/소규모 사무실' },
                { cat: 'Microcell', power: '1-5W', range: '200-500m', use: '캠퍼스, 쇼핑몰' },
                { cat: 'Macrocell', power: '50W+', range: '수 km', use: '광역 커버리지' },
              ].map(({ cat, power, range, use }) => (
                <div key={cat} className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
                  <p className="mb-1 text-xs font-bold text-teal-700 dark:text-teal-300">{cat}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">출력: {power}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">범위: {range}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">용도: {use}</p>
                </div>
              ))}
            </div>

            <Sub n="2" title="엣지 AI 배포 사례" />
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead><tr className="bg-teal-50 dark:bg-teal-900/20">
                  <th className="px-3 py-2 text-left font-bold text-teal-700">사례</th>
                  <th className="px-3 py-2 text-center font-bold text-teal-700">백홀 절감</th>
                  <th className="px-3 py-2 text-left font-bold text-teal-700">핵심 이점</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { case: 'IoT 보안 카메라 분석', save: '>100Mbps → ~0', benefit: '이벤트 기반만 외부 전송. 실시간 로컬 분석.' },
                    { case: '의료 진단 (X-ray/CT AI)', save: '재해시에도 서비스 유지', benefit: '백홀 단절에도 독립 동작. 원격지 의료 접근성.' },
                    { case: '교육 콘텐츠 캐싱', save: '비피크시만 동기화', benefit: '수백 명 동시 서비스. 오프라인 시간에 콘텐츠 사전 배포.' },
                  ].map((r, i) => (
                    <tr key={i}><td className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">{r.case}</td>
                      <td className="px-3 py-2 text-center font-bold text-emerald-600">{r.save}</td>
                      <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{r.benefit}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </section>

      {/* Control Loop */}
      <section className="scroll-mt-20">
        <SH icon={<Wifi className="h-5 w-5" />} title="제어 루프 아키텍처 (인터랙티브)" collapsed={!!col['loop']} onToggle={() => toggle('loop')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['loop'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card><ControlLoopViz /></Card>
        </div>
      </section>

      {/* Digital Twin */}
      <section className="scroll-mt-20">
        <SH icon={<Globe className="h-5 w-5" />} title="디지털 트윈 & 네트워크 계획" collapsed={!!col['twin']} onToggle={() => toggle('twin')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['twin'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <Sub n="1" title="디지털 트윈 역할" />
            <div className="mb-4 space-y-2">
              {[
                { step: '1', title: '텔레메트리 수집', desc: '실시간 RSRP, SINR, 트래픽 데이터를 수집하여 가상 환경 업데이트.', color: 'teal' },
                { step: '2', title: '정책 시뮬레이션', desc: 'RL 에이전트가 생성한 설정 변경안을 가상 환경에서 테스트.', color: 'emerald' },
                { step: '3', title: '안전성 검증', desc: '실제 네트워크 영향 없이 간섭, 트래픽, 전파 시뮬레이션으로 검증.', color: 'green' },
                { step: '4', title: '배포/롤백', desc: '검증 통과 시 실제 배포. 성능 저하 감지 시 이전 설정으로 롤백.', color: 'lime' },
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

            <Sub n="2" title="AI 기반 네트워크 계획" />
            <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
              농촌 100-기지국 배포 시나리오에서 ML 모델이 지형, 이동 패턴, 간섭 특성을 학습하여
              최적 송신 전력, 안테나 방향, 빔 패턴, 채널 할당을 추론합니다.
              기존 규칙 기반 도구(Planet, Atoll) 대비 데이터 축적에 따라 반복적으로 개선됩니다.
            </p>

            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-900/20">
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">ETSI ENI 정렬</p>
              <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                ETSI ENI (Experiential Networked Intelligence) 프레임워크의 감독형 자율성(supervised autonomy) 권고와 일치.
                AI가 제안 → 디지털 트윈 검증 → 운영자 승인 → 배포의 단계적 자율화.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Global Context */}
      <section className="scroll-mt-20">
        <SH icon={<BarChart2 className="h-5 w-5" />} title="글로벌 배경 및 시사점" collapsed={!!col['global']} onToggle={() => toggle('global')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['global'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead><tr className="bg-gray-50 dark:bg-gray-800">
                  <th className="px-3 py-2 text-left text-gray-600">지표 (ITU 데이터)</th>
                  <th className="px-3 py-2 text-left text-gray-600">현황</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { i: '농촌 4G 인구 커버리지', v: '많은 국가에서 60% 미만' },
                    { i: '모바일 기기 소유율', v: '85% 이상 (커버리지 gap 존재)' },
                    { i: '모바일 브로드밴드 가입', v: '100인당 110회선 초과 (멀티SIM)' },
                    { i: '모바일 데이터 트래픽 성장', v: '연 20-30% CAGR' },
                    { i: '2GB 모바일 요금 적정성', v: '개발도상국에서 적정 임계값 초과' },
                  ].map((r, i) => (
                    <tr key={i}><td className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">{r.i}</td>
                      <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{r.v}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 dark:border-green-800 dark:bg-green-900/20">
              <p className="text-xs font-semibold text-green-700 dark:text-green-300">시사점</p>
              <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                AI 기반 네트워크 최적화는 단순한 성능 향상을 넘어, 농촌/원격지 커버리지 확대,
                운영 비용 절감, 에너지 효율 개선을 통해 &quot;지속 가능하고 포용적인 네트워크 개발&quot;에 기여합니다.
                엣지 AI는 백홀 인프라가 취약한 지역에서 특히 중요합니다.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Quiz */}
      <section className="scroll-mt-20">
        <SH icon={<GraduationCap className="h-5 w-5" />} title="이해도 점검" collapsed={!!col['quiz']} onToggle={() => toggle('quiz')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['quiz'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card><Quiz /></Card>
        </div>
      </section>

    </div>
  );
}
