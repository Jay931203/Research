'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  Sparkles, ChevronDown, Cpu, Globe, Layers,
  GraduationCap, Radio, Zap, Eye,
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
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-100 text-xs font-bold text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">{n}</span>
      <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">{title}</h4>
    </div>
  );
}

/* ── Interactive 6G Vision Radar ─────────────────────────── */

function SixGRadar() {
  const [active, setActive] = useState<number | null>(null);
  const pillars = [
    { name: 'AI-Native Air Interface', desc: 'AI가 물리계층의 핵심 구성요소. 채널 추정, 코딩, 변조를 End-to-End NN으로 대체. 기존 블록별 최적화 → 전체 시스템 동시 최적화.', icon: <Cpu className="h-4 w-4" /> },
    { name: 'Semantic Communication', desc: '비트 전송 → 의미(semantics) 전송. 송신측이 의도(intent)를 추출하여 전송, 수신측이 의미를 복원. Shannon 이론을 넘어서는 패러다임.', icon: <Sparkles className="h-4 w-4" /> },
    { name: 'ISAC (통신+센싱)', desc: 'Integrated Sensing and Communication. 동일 파형으로 통신과 레이더 센싱을 동시 수행. 자율주행, 환경 인식에 필수.', icon: <Radio className="h-4 w-4" /> },
    { name: 'Digital Twin Network', desc: '전체 네트워크의 실시간 디지털 복제. AI가 네트워크 상태를 지속 예측/최적화. Zero-touch 자율 운영의 기반.', icon: <Globe className="h-4 w-4" /> },
    { name: 'Sustainable Green AI', desc: '에너지 효율적 AI 설계. 모델 경량화, 하드웨어 최적화, 동적 모드 전환으로 탄소 배출 최소화.', icon: <Zap className="h-4 w-4" /> },
    { name: 'Trustworthy AI', desc: '설명 가능한 AI (XAI), 공정성, 프라이버시 보장. 안전성 검증 프레임워크. 규제 준수 AI.', icon: <Eye className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {pillars.map((p, i) => (
          <button key={i} onClick={() => setActive(active === i ? null : i)}
            className={`flex items-center gap-2 rounded-lg p-3 text-left text-xs font-bold transition ${active === i ? 'bg-rose-500 text-white ring-2 ring-rose-300' : 'bg-gray-50 text-gray-700 hover:bg-rose-50 dark:bg-gray-800 dark:text-gray-300'}`}>
            {p.icon} {p.name}
          </button>
        ))}
      </div>
      {active !== null && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 dark:border-rose-800 dark:bg-rose-900/20">
          <p className="text-sm font-bold text-rose-700 dark:text-rose-300">{pillars[active].name}</p>
          <p className="mt-1 text-xs leading-relaxed text-rose-600 dark:text-rose-400">{pillars[active].desc}</p>
        </div>
      )}
      <p className="text-center text-xs italic text-gray-400">각 항목을 클릭하여 상세 설명 보기</p>
    </div>
  );
}

/* ── Quiz ──────────────────────────────────────────────────── */

const quizData = [
  { q: '6G에서 "AI-native"의 의미는?', opts: ['AI를 선택적으로 사용', 'AI가 설계 단계부터 핵심 구성요소로 내장', 'AI 없이 동작', 'AI를 사후 최적화에만 사용'], ans: 1 },
  { q: 'Semantic communication이 전통 통신과 다른 점은?', opts: ['더 많은 비트 전송', '비트 대신 의미(semantics)를 전송', '더 높은 주파수 사용', '안테나 수 증가'], ans: 1 },
  { q: 'ISAC의 목적은?', opts: ['통신과 센싱을 분리', '동일 파형으로 통신과 레이더 센싱 동시 수행', '센싱만 수행', '통신 대역폭 감소'], ans: 1 },
  { q: 'End-to-End Autoencoder 통신의 장점은?', opts: ['블록별 개별 최적화', '송수신 전체를 하나의 최적화 문제로 해결', '수학적 모델만 사용', '하드웨어 불필요'], ans: 1 },
  { q: '6G에서 Trustworthy AI가 중요한 이유는?', opts: ['비용 절감', '안전성 검증, 설명 가능성, 프라이버시 보장 필요', '속도 향상', 'AI 사용 축소'], ans: 1 },
];

function Quiz() {
  const [cur, setCur] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const check = (i: number) => { if (sel !== null) return; setSel(i); if (i === quizData[cur].ans) setScore(s => s + 1); };
  const next = () => { if (cur + 1 >= quizData.length) { setDone(true); return; } setCur(c => c + 1); setSel(null); };

  if (done) return (
    <div className="rounded-xl border-2 border-rose-300 bg-rose-50 p-6 text-center dark:border-rose-700 dark:bg-rose-900/20">
      <p className="text-lg font-bold text-rose-700 dark:text-rose-300">결과: {score}/{quizData.length}</p>
      <button onClick={() => { setCur(0); setSel(null); setScore(0); setDone(false); }} className="mt-3 rounded-lg bg-rose-600 px-4 py-2 text-sm font-bold text-white">다시 풀기</button>
    </div>
  );
  const q = quizData[cur];
  return (
    <div className="space-y-3">
      <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Q{cur + 1}. {q.q}</p>
      {q.opts.map((o, i) => (
        <button key={i} onClick={() => check(i)} className={`w-full rounded-lg border p-3 text-left text-sm transition ${sel === null ? 'border-gray-200 hover:border-rose-400 dark:border-gray-700' : i === q.ans ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : i === sel ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 opacity-50 dark:border-gray-700'}`}>{o}</button>
      ))}
      {sel !== null && <button onClick={next} className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-bold text-white">{cur + 1 < quizData.length ? '다음' : '결과'}</button>}
    </div>
  );
}

/* ── Main ──────────────────────────────────────────────────── */

export default function AI6GStudyFull() {
  const [col, setCol] = useState<Record<string, boolean>>({});
  const toggle = useCallback((id: string) => setCol(c => ({ ...c, [id]: !c[id] })), []);

  return (
    <div className="space-y-6">

      {/* Hero */}
      <section className="scroll-mt-20">
        <div className="overflow-hidden rounded-xl shadow-sm">
          <div className="bg-gradient-to-br from-rose-700 via-pink-700 to-fuchsia-700 p-6 pb-8">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white">6G Vision</span>
              <span className="rounded-full bg-yellow-400/90 px-3 py-1 text-xs font-bold text-yellow-900">AI-Native</span>
            </div>
            <h2 className="text-xl font-bold leading-snug text-white sm:text-2xl">
              AI for Next-Generation 6G Technologies
            </h2>
            <p className="mt-3 text-sm text-rose-200">AI-Native Air Interface, Semantic Communication, 6G 비전 종합</p>
          </div>
          <div className="bg-white p-6 dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
            <p className="leading-relaxed text-gray-700 dark:text-gray-300">
              6G는 AI를 선택적 최적화 도구가 아닌
              <span className="font-semibold text-rose-700 dark:text-rose-300"> 시스템 설계의 핵심 구성요소(AI-native)</span>로
              내장합니다. End-to-End 학습 기반 물리계층,
              <span className="font-semibold text-pink-700 dark:text-pink-300"> 시맨틱 통신</span>,
              통합 센싱-통신(ISAC), 디지털 트윈 네트워크가 6G의 핵심 기둥입니다.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {['AI-Native', 'Semantic Comm.', 'ISAC', 'E2E Autoencoder', 'Digital Twin', 'Green AI'].map(tag => (
                <span key={tag} className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6G Pillars Interactive */}
      <section className="scroll-mt-20">
        <SH icon={<Sparkles className="h-5 w-5" />} title="6G AI 핵심 기둥 (인터랙티브)" collapsed={!!col['pillars']} onToggle={() => toggle('pillars')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['pillars'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card><SixGRadar /></Card>
        </div>
      </section>

      {/* AI-Native Air Interface */}
      <section className="scroll-mt-20">
        <SH icon={<Cpu className="h-5 w-5" />} title="AI-Native Air Interface" collapsed={!!col['native']} onToggle={() => toggle('native')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['native'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <Sub n="1" title="기존 vs AI-Native 설계" />
            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                <p className="mb-2 text-xs font-bold text-gray-700 dark:text-gray-300">기존 블록별 설계 (5G)</p>
                <div className="flex flex-wrap items-center gap-1 text-xs">
                  {['Source Coding', 'Channel Coding', 'Modulation', 'OFDM', 'MIMO Precoding'].map((b, i) => (
                    <div key={b} className="flex items-center gap-1">
                      <span className="rounded bg-gray-200 px-2 py-1 dark:bg-gray-700">{b}</span>
                      {i < 4 && <span className="text-gray-400">→</span>}
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-xs text-gray-500">각 블록을 개별 최적화. 전체 최적성 보장 불가.</p>
              </div>
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 dark:border-rose-900/40 dark:bg-rose-900/10">
                <p className="mb-2 text-xs font-bold text-rose-700 dark:text-rose-300">AI-Native E2E 설계 (6G)</p>
                <div className="flex items-center gap-1 text-xs">
                  <span className="rounded bg-rose-200 px-3 py-1 font-bold text-rose-800 dark:bg-rose-900/40 dark:text-rose-300">Encoder NN</span>
                  <span className="text-gray-400">→ Channel →</span>
                  <span className="rounded bg-rose-200 px-3 py-1 font-bold text-rose-800 dark:bg-rose-900/40 dark:text-rose-300">Decoder NN</span>
                </div>
                <p className="mt-2 text-xs text-rose-600 dark:text-rose-400">전체 송수신 체인을 하나의 autoencoder로 학습. 전역 최적.</p>
              </div>
            </div>

            <Sub n="2" title="E2E Autoencoder 통신" />
            <div className="mb-3 overflow-x-auto rounded-lg bg-rose-50 p-3 dark:bg-rose-900/20">
              <Eq latex={String.raw`\mathbf{x} = f_{\text{enc}}(\mathbf{m};\, \theta_e), \quad \hat{\mathbf{m}} = f_{\text{dec}}(\mathbf{y};\, \theta_d), \quad \mathbf{y} = h(\mathbf{x}) + \mathbf{n}`} />
            </div>
            <p className="mb-3 text-xs text-gray-500">
              메시지 m → encoder가 전송 신호 x 생성 → 채널 통과 (y = h(x) + n) → decoder가 원본 복원.
            </p>
            <div className="mb-3 overflow-x-auto rounded-lg bg-rose-50 p-3 dark:bg-rose-900/20">
              <Eq latex={String.raw`\min_{\theta_e, \theta_d} \;\mathbb{E}\!\left[\mathcal{L}(\mathbf{m}, \hat{\mathbf{m}})\right] \quad \text{s.t.}\; \|\mathbf{x}\|^2 \leq P_{\max}`} />
            </div>

            <Sub n="3" title="채널 모델 학습 (미분불가 문제 해결)" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { method: 'Straight-Through Estimator', desc: '양자화 등 미분불가 연산을 근사 기울기로 대체.', color: 'violet' },
                { method: 'GAN 기반 채널 모델', desc: 'Generator가 채널 모델을 학습. 실제 채널 데이터로 학습.', color: 'purple' },
                { method: 'RL 기반 학습', desc: '채널을 환경으로 간주. 정책 기울기로 encoder 최적화.', color: 'fuchsia' },
              ].map(({ method, desc, color }) => (
                <div key={method} className={`rounded-lg border border-${color}-200 bg-${color}-50 p-3 dark:border-${color}-900/40 dark:bg-${color}-900/10`}>
                  <p className={`mb-1 text-xs font-bold text-${color}-700 dark:text-${color}-300`}>{method}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{desc}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* Semantic Communication */}
      <section className="scroll-mt-20">
        <SH icon={<Sparkles className="h-5 w-5" />} title="시맨틱 통신 (Semantic Communication)" collapsed={!!col['semantic']} onToggle={() => toggle('semantic')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['semantic'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <Sub n="1" title="Shannon vs Semantic" />
            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                <p className="mb-1 text-xs font-bold text-gray-700 dark:text-gray-300">Shannon 통신 (Level A)</p>
                <Eq latex={String.raw`C = B \log_2(1 + \text{SNR})`} />
                <p className="mt-1 text-xs text-gray-500">비트를 정확하게 전달하는 것이 목표. 의미 무관.</p>
              </div>
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 dark:border-rose-900/40 dark:bg-rose-900/10">
                <p className="mb-1 text-xs font-bold text-rose-700 dark:text-rose-300">Semantic 통신 (Level B/C)</p>
                <Eq latex={String.raw`\min \;\mathbb{E}[d_{\text{semantic}}(\mathbf{m}, \hat{\mathbf{m}})]`} />
                <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">의미(semantics)를 정확히 전달하는 것이 목표. 비트 오류 허용.</p>
              </div>
            </div>

            <Sub n="2" title="시맨틱 통신 프레임워크" />
            <div className="mb-4 space-y-2">
              {[
                { step: '1', title: 'Semantic Encoder (송신측)', desc: '입력 데이터에서 의미적 특성(semantic features)을 추출. NLP: 문장 임베딩, CV: 객체 특성.', color: 'rose' },
                { step: '2', title: 'Channel Coding + Transmission', desc: '시맨틱 특성을 채널 코딩하여 전송. Joint source-channel coding (JSCC).', color: 'pink' },
                { step: '3', title: 'Semantic Decoder (수신측)', desc: '수신된 특성에서 원래 의미를 복원. 비트 완벽 복원이 아닌 의미 동등성 추구.', color: 'fuchsia' },
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

            <Sub n="3" title="적용 시나리오" />
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead><tr className="bg-rose-50 dark:bg-rose-900/20">
                  <th className="px-3 py-2 text-left font-bold text-rose-700">시나리오</th>
                  <th className="px-3 py-2 text-left font-bold text-rose-700">시맨틱 접근</th>
                  <th className="px-3 py-2 text-center font-bold text-rose-700">대역폭 절감</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { sc: '텍스트 전송', ap: '문장 의미 임베딩만 전송 (DeepSC)', save: '~80%' },
                    { sc: '이미지 전송', ap: '객체/장면 특성만 전송, 수신측 생성 모델로 복원', save: '~90%' },
                    { sc: '비디오 스트리밍', ap: '키프레임 시맨틱 + 차분 전송', save: '~70%' },
                    { sc: 'IoT 센서 데이터', ap: '이상 탐지 결과만 전송 (task-oriented)', save: '~95%' },
                  ].map((r, i) => (
                    <tr key={i}><td className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">{r.sc}</td>
                      <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{r.ap}</td>
                      <td className="px-3 py-2 text-center font-bold text-rose-600">{r.save}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </section>

      {/* ISAC */}
      <section className="scroll-mt-20">
        <SH icon={<Radio className="h-5 w-5" />} title="ISAC: 통합 센싱-통신" collapsed={!!col['isac']} onToggle={() => toggle('isac')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['isac'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <Sub n="1" title="ISAC 개념" />
            <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
              동일한 주파수 자원과 하드웨어로 통신과 레이더 센싱을 동시에 수행합니다.
              5G의 mmWave 빔이 이미 높은 지향성을 가지므로, 이를 센싱에 활용하는 것이 자연스러운 확장입니다.
            </p>

            <Sub n="2" title="AI의 역할" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                { role: '파형 설계 최적화', desc: '통신 성능과 센싱 정확도의 트레이드오프를 AI가 동적 조정. DRL로 실시간 자원 배분.', color: 'rose' },
                { role: '센싱 데이터 → 통신 지원', desc: '센싱으로 획득한 환경 정보(물체 위치, 속도)를 빔 관리에 활용. Sensing-assisted beam tracking.', color: 'pink' },
                { role: '간섭 관리', desc: '통신 신호와 센싱 신호 간 상호 간섭을 AI가 캔슬. Self-interference cancellation NN.', color: 'fuchsia' },
                { role: '환경 재구성', desc: '레이더 반사 데이터로 3D 환경 모델 생성. Digital twin 자동 업데이트.', color: 'purple' },
              ].map(({ role, desc, color }) => (
                <div key={role} className={`rounded-lg border border-${color}-200 bg-${color}-50 p-3 dark:border-${color}-900/40 dark:bg-${color}-900/10`}>
                  <p className={`mb-1 text-xs font-bold text-${color}-700 dark:text-${color}-300`}>{role}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{desc}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* 5G vs 6G Comparison */}
      <section className="scroll-mt-20">
        <SH icon={<Layers className="h-5 w-5" />} title="5G vs 6G AI 비교" collapsed={!!col['compare']} onToggle={() => toggle('compare')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['compare'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead><tr className="bg-rose-50 dark:bg-rose-900/20">
                  <th className="px-3 py-2 text-left font-bold text-rose-700">차원</th>
                  <th className="px-3 py-2 text-left font-bold text-rose-700">5G (AI 선택적)</th>
                  <th className="px-3 py-2 text-left font-bold text-rose-700">6G (AI-Native)</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { d: 'AI 역할', a: '최적화 보조 도구', b: '핵심 설계 구성요소' },
                    { d: '물리 계층', a: '수학적 모델 기반 (블록별)', b: 'E2E 학습 (autoencoder)' },
                    { d: '통신 패러다임', a: 'Shannon: 비트 전달', b: 'Semantic: 의미 전달' },
                    { d: '센싱', a: '통신과 분리', b: 'ISAC: 통합' },
                    { d: '네트워크 관리', a: '반자동 (SON)', b: 'Zero-touch 자율 (AI-driven)' },
                    { d: '주파수', a: 'sub-6/mmWave', b: 'sub-THz (100-300 GHz) 추가' },
                    { d: 'AI 모델 위치', a: 'Cloud/Edge 서버', b: '기지국/단말 내장 (on-device)' },
                    { d: '에너지 효율', a: '최적화 대상', b: 'AI 자체의 에너지도 최적화' },
                    { d: '표준화', a: 'Rel-18/19 WI 진행', b: 'Rel-20+ 연구 시작' },
                  ].map((r, i) => (
                    <tr key={i}><td className="px-3 py-2 font-semibold text-gray-700 dark:text-gray-300">{r.d}</td>
                      <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{r.a}</td>
                      <td className="px-3 py-2 text-rose-600 dark:text-rose-400">{r.b}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </section>

      {/* Research Challenges */}
      <section className="scroll-mt-20">
        <SH icon={<Zap className="h-5 w-5" />} title="연구 과제 및 미래 방향" collapsed={!!col['challenges']} onToggle={() => toggle('challenges')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['challenges'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-3 text-sm font-bold text-red-700 dark:text-red-300">미해결 과제</p>
                <div className="space-y-2">
                  {[
                    { t: 'Channel Model Gap', d: 'E2E 학습에 미분 가능한 채널 모델 필요. 실제 채널은 수학적으로 완벽히 모델링 불가.' },
                    { t: 'On-Device AI 제약', d: '단말 내 NN 추론의 전력/지연/메모리 한계. 경량화+양자화 필수.' },
                    { t: '시맨틱 메트릭 부재', d: '"의미적 유사도"의 보편적 정량 지표 미확립. 태스크별 정의 필요.' },
                    { t: '표준화 미착수', d: '6G AI-native air interface는 연구 단계. 3GPP 표준화 Rel-20+ 예상.' },
                  ].map(({ t, d }) => (
                    <div key={t} className="rounded-lg border border-red-100 bg-red-50 p-3 dark:border-red-900/30 dark:bg-red-900/10">
                      <p className="text-xs font-bold text-red-700 dark:text-red-300">{t}</p>
                      <p className="mt-0.5 text-xs text-red-600 dark:text-red-400">{d}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-3 text-sm font-bold text-green-700 dark:text-green-300">유망 방향</p>
                <div className="space-y-2">
                  {[
                    { t: 'Foundation Models for Comm.', d: '대규모 채널 데이터로 사전학습된 기반 모델. 다양한 통신 태스크에 fine-tuning.' },
                    { t: 'Generative AI for 6G', d: 'Diffusion/GAN으로 채널 생성, 데이터 증강, 시뮬레이션 가속화.' },
                    { t: 'Neuromorphic Computing', d: '스파이킹 신경망(SNN)으로 초저전력 on-device AI 구현.' },
                    { t: 'Federated Learning', d: '프라이버시 보존하며 분산 학습. 기지국/단말 간 모델 협력 학습.' },
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
        <SH icon={<GraduationCap className="h-5 w-5" />} title="이해도 점검" collapsed={!!col['quiz']} onToggle={() => toggle('quiz')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['quiz'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card><Quiz /></Card>
        </div>
      </section>

    </div>
  );
}
