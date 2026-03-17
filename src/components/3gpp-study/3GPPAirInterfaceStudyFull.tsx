'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  Radio, ChevronDown, Cpu, Layers, Target,
  Zap, GraduationCap, BarChart2, Settings,
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
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">{n}</span>
      <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">{title}</h4>
    </div>
  );
}

/* ── Interactive Architecture Diagram ─────────────────────── */

function ArchDiagram() {
  const [active, setActive] = useState<string | null>(null);
  const blocks = [
    { id: 'ue-enc', label: 'UE Encoder', x: 0, y: 0, color: 'bg-blue-500', desc: 'CSI 행렬 H를 저차원 codeword s로 압축. UE 내 NN 추론.' },
    { id: 'feedback', label: 'Feedback\nChannel', x: 1, y: 0, color: 'bg-gray-400', desc: 'PUCCH/PUSCH를 통해 압축된 s를 gNB로 전송.' },
    { id: 'gnb-dec', label: 'gNB Decoder', x: 2, y: 0, color: 'bg-indigo-500', desc: '수신된 s에서 원래 CSI 행렬 H를 복원. gNB 내 NN 추론.' },
    { id: 'beam-pred', label: 'Beam\nPredictor', x: 0, y: 1, color: 'bg-emerald-500', desc: '과거 빔 측정값으로 미래 최적 빔을 예측. 측정 오버헤드 감소.' },
    { id: 'pos-ai', label: 'AI\nPositioning', x: 1, y: 1, color: 'bg-amber-500', desc: 'RSRP/ToA 측정값에서 UE 위치를 추정. NLOS 환경에서 특히 유리.' },
    { id: 'monitor', label: 'Model\nMonitor', x: 2, y: 1, color: 'bg-rose-500', desc: '추론 성능을 지속 감시. 열화 감지 시 fallback 또는 모델 교체 트리거.' },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        {blocks.map(b => (
          <button key={b.id} onClick={() => setActive(active === b.id ? null : b.id)}
            className={`rounded-lg p-3 text-center text-xs font-bold text-white transition-all whitespace-pre-line ${b.color} ${active === b.id ? 'ring-2 ring-offset-2 ring-blue-400 scale-105' : 'hover:scale-102'}`}>
            {b.label}
          </button>
        ))}
      </div>
      {active && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
          <p className="text-xs text-blue-700 dark:text-blue-300">{blocks.find(b => b.id === active)?.desc}</p>
        </div>
      )}
      <p className="text-center text-xs italic text-gray-400">블록을 클릭하여 상세 설명 보기</p>
    </div>
  );
}

/* ── Quiz ──────────────────────────────────────────────────── */

const quizData = [
  { q: 'TR 38.843의 주요 연구 대상은?', opts: ['Core network AI', 'Air interface AI/ML use cases', 'Cloud computing', 'Satellite communication'], ans: 1 },
  { q: 'CSI feedback에서 two-sided model이란?', opts: ['두 개의 기지국 사용', 'UE에 encoder, gNB에 decoder 배치', '2개 AI 모델 앙상블', '양방향 통신'], ans: 1 },
  { q: 'Beam management AI의 주요 이점은?', opts: ['전력 증가', '측정 오버헤드 감소', '주파수 대역 확장', '안테나 수 증가'], ans: 1 },
  { q: 'AI positioning이 기존 방식 대비 유리한 환경은?', opts: ['LOS 환경', 'NLOS(비가시선) 환경', '정적 환경', '저주파 환경'], ans: 1 },
];

function Quiz() {
  const [cur, setCur] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const check = (i: number) => { if (sel !== null) return; setSel(i); if (i === quizData[cur].ans) setScore(s => s + 1); };
  const next = () => { if (cur + 1 >= quizData.length) { setDone(true); return; } setCur(c => c + 1); setSel(null); };

  if (done) return (
    <div className="rounded-xl border-2 border-emerald-300 bg-emerald-50 p-6 text-center dark:border-emerald-700 dark:bg-emerald-900/20">
      <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">결과: {score}/{quizData.length}</p>
      <button onClick={() => { setCur(0); setSel(null); setScore(0); setDone(false); }} className="mt-3 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white">다시 풀기</button>
    </div>
  );
  const q = quizData[cur];
  return (
    <div className="space-y-3">
      <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Q{cur + 1}. {q.q}</p>
      {q.opts.map((o, i) => (
        <button key={i} onClick={() => check(i)} className={`w-full rounded-lg border p-3 text-left text-sm transition ${sel === null ? 'border-gray-200 hover:border-emerald-400 dark:border-gray-700' : i === q.ans ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : i === sel ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 opacity-50 dark:border-gray-700'}`}>{o}</button>
      ))}
      {sel !== null && <button onClick={next} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white">{cur + 1 < quizData.length ? '다음' : '결과'}</button>}
    </div>
  );
}

/* ── Main ──────────────────────────────────────────────────── */

export default function ThreeGPPAirInterfaceStudyFull() {
  const [col, setCol] = useState<Record<string, boolean>>({});
  const toggle = useCallback((id: string) => setCol(c => ({ ...c, [id]: !c[id] })), []);

  return (
    <div className="space-y-6">

      {/* Hero */}
      <section className="scroll-mt-20">
        <div className="overflow-hidden rounded-xl shadow-sm">
          <div className="bg-gradient-to-br from-emerald-700 via-teal-700 to-cyan-700 p-6 pb-8">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white">TR 38.843</span>
              <span className="rounded-full bg-yellow-400/90 px-3 py-1 text-xs font-bold text-yellow-900">3GPP RAN1</span>
            </div>
            <h2 className="text-xl font-bold leading-snug text-white sm:text-2xl">
              Study on AI/ML for NR Air Interface
            </h2>
            <p className="mt-3 text-sm text-emerald-200">3GPP TR 38.843 - AI/ML 물리 계층 적용 연구 보고서</p>
          </div>
          <div className="bg-white p-6 dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
            <p className="leading-relaxed text-gray-700 dark:text-gray-300">
              TR 38.843은 5G NR 물리 계층(air interface)에 AI/ML을 적용하는 3가지 핵심 use case를 연구한 기술 보고서입니다.
              <span className="font-semibold text-emerald-700 dark:text-emerald-300"> CSI feedback 압축</span>,
              <span className="font-semibold text-teal-700 dark:text-teal-300"> beam management 예측</span>,
              <span className="font-semibold text-cyan-700 dark:text-cyan-300"> positioning 향상</span>에 대한
              시뮬레이션 평가 결과와 표준화 방향을 담고 있습니다.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {['CSI Compression', 'Beam Prediction', 'AI Positioning', 'Two-Sided Model', 'Model Lifecycle'].map(tag => (
                <span key={tag} className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Architecture Diagram */}
      <section className="scroll-mt-20">
        <SH icon={<Layers className="h-5 w-5" />} title="TR 38.843 구성 요소 (인터랙티브)" collapsed={!!col['arch']} onToggle={() => toggle('arch')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['arch'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card><ArchDiagram /></Card>
        </div>
      </section>

      {/* Use Case 1: CSI */}
      <section className="scroll-mt-20">
        <SH icon={<Radio className="h-5 w-5" />} title="Use Case 1: CSI Feedback 압축" collapsed={!!col['csi']} onToggle={() => toggle('csi')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['csi'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <Sub n="1" title="문제 정의" />
            <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
              Massive MIMO에서 UE가 측정한 CSI를 gNB에 피드백할 때, 채널 행렬 차원이 매우 크므로
              효율적인 압축이 필수적입니다. 기존 codebook(Type I/II, eType II) 방식은 선형 압축에 한정됩니다.
            </p>
            <div className="mb-4 overflow-x-auto rounded-lg bg-emerald-50 p-3 dark:bg-emerald-900/20">
              <Eq latex={String.raw`\mathbf{H} \in \mathbb{C}^{N_r \times N_t \times N_{sb}} \;\xrightarrow{f_{\text{enc}}}\; \mathbf{s} \in \mathbb{R}^M \;\xrightarrow{f_{\text{dec}}}\; \hat{\mathbf{H}}`} />
            </div>
            <p className="mb-3 text-xs text-gray-500">압축률: γ = 2N_t·N_sb / M. M이 작을수록 높은 압축.</p>

            <Sub n="2" title="Two-Sided Model 구조" />
            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
                <p className="mb-1 text-xs font-bold text-blue-700 dark:text-blue-300">UE측 (Encoder)</p>
                <ul className="space-y-1 text-xs text-blue-600 dark:text-blue-400">
                  <li>- CSI 행렬 → 저차원 잠재 벡터</li>
                  <li>- 경량 NN (CNN/MLP, ~100K params)</li>
                  <li>- 양자화 후 피드백 채널로 전송</li>
                  <li>- 전력/연산 제약 고려</li>
                </ul>
              </div>
              <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-3 dark:border-indigo-800 dark:bg-indigo-900/20">
                <p className="mb-1 text-xs font-bold text-indigo-700 dark:text-indigo-300">gNB측 (Decoder)</p>
                <ul className="space-y-1 text-xs text-indigo-600 dark:text-indigo-400">
                  <li>- 수신 codeword → CSI 복원</li>
                  <li>- 더 복잡한 NN 가능</li>
                  <li>- 복원 품질이 프리코딩 성능 결정</li>
                  <li>- 모델 학습 주도 가능</li>
                </ul>
              </div>
            </div>

            <Sub n="3" title="평가 메트릭" />
            <div className="space-y-2">
              <div className="overflow-x-auto rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                <Eq latex={String.raw`\text{NMSE} = \mathbb{E}\!\left[\frac{\|\mathbf{H} - \hat{\mathbf{H}}\|_F^2}{\|\mathbf{H}\|_F^2}\right]`} />
              </div>
              <div className="overflow-x-auto rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                <Eq latex={String.raw`\text{SGCS} = \mathbb{E}\!\left[\frac{1}{N_{sb}}\sum_{k=1}^{N_{sb}} \frac{|\hat{\mathbf{h}}_k^H \mathbf{h}_k|^2}{\|\hat{\mathbf{h}}_k\|^2 \|\mathbf{h}_k\|^2}\right]`} />
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 dark:border-green-800 dark:bg-green-900/20">
              <p className="text-xs font-semibold text-green-700 dark:text-green-300">SI 결론</p>
              <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                AI 기반 CSI 압축이 eType II codebook 대비 동일 오버헤드에서 5-15dB NMSE 개선,
                또는 동일 품질에서 50-70% 오버헤드 절감을 달성함을 확인. Rel-19 WI로 진행 결정.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Use Case 2: Beam */}
      <section className="scroll-mt-20">
        <SH icon={<Target className="h-5 w-5" />} title="Use Case 2: Beam Management" collapsed={!!col['beam']} onToggle={() => toggle('beam')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['beam'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <Sub n="1" title="빔 관리의 AI 적용" />
            <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
              mmWave/sub-THz 대역에서 좁은 빔(narrow beam)을 사용해야 하므로 빔 스위핑(beam sweeping)
              오버헤드가 큽니다. AI로 과거 측정값에서 최적 빔을 예측하면 측정 횟수를 줄일 수 있습니다.
            </p>

            <Sub n="2" title="예측 시나리오" />
            <div className="mb-4 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-emerald-50 dark:bg-emerald-900/20">
                    <th className="px-3 py-2 text-left font-bold text-emerald-700 dark:text-emerald-300">Sub-Use Case</th>
                    <th className="px-3 py-2 text-left font-bold text-emerald-700 dark:text-emerald-300">입력</th>
                    <th className="px-3 py-2 text-left font-bold text-emerald-700 dark:text-emerald-300">출력</th>
                    <th className="px-3 py-2 text-center font-bold text-emerald-700 dark:text-emerald-300">오버헤드 감소</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { suc: 'BM-Case1: Spatial prediction', inp: '넓은 빔(wide beam) 측정', out: '좁은 빔(narrow beam) 예측', oh: '~75%' },
                    { suc: 'BM-Case2: Temporal prediction', inp: '과거 빔 측정 이력', out: '미래 최적 빔 예측', oh: '~60%' },
                    { suc: 'BM-Case1+2: Joint', inp: '넓은빔 + 시간 이력', out: '미래 좁은빔 예측', oh: '~85%' },
                  ].map((r, i) => (
                    <tr key={i}>
                      <td className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">{r.suc}</td>
                      <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{r.inp}</td>
                      <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{r.out}</td>
                      <td className="px-3 py-2 text-center font-bold text-emerald-600 dark:text-emerald-400">{r.oh}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Sub n="3" title="빔 예측 수식" />
            <div className="overflow-x-auto rounded-lg bg-teal-50 p-3 dark:bg-teal-900/20">
              <Eq latex={String.raw`\hat{b}_{t+\Delta} = \arg\max_{b \in \mathcal{B}} \; f_\theta\!\left(\{P_{\text{RSRP}}^{(b')}\}_{b' \in \mathcal{B}_{\text{wide}},\, t' \leq t}\right)`} />
            </div>
            <p className="mt-2 text-xs text-gray-500">과거 wide beam RSRP 측정값으로 미래 시점의 최적 narrow beam index 예측.</p>
          </Card>
        </div>
      </section>

      {/* Use Case 3: Positioning */}
      <section className="scroll-mt-20">
        <SH icon={<Zap className="h-5 w-5" />} title="Use Case 3: AI Positioning" collapsed={!!col['pos']} onToggle={() => toggle('pos')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['pos'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <Sub n="1" title="위치 추정 AI 접근" />
            <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
              기존 위치 추정(OTDOA, UTDOA)은 NLOS(비가시선) 환경에서 정확도가 급격히 저하됩니다.
              AI 모델이 다중 기지국 측정값 패턴을 학습하면 NLOS 오차를 보상할 수 있습니다.
            </p>

            <Sub n="2" title="AI Positioning Sub-Use Cases" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                { title: 'Direct positioning', desc: 'PRS 측정값 → 좌표 직접 출력. End-to-end NN이 ToA/RSRP를 직접 좌표로 매핑.', color: 'amber' },
                { title: 'Indirect positioning', desc: 'AI로 ToA 추정 보정 → 기존 삼각측량 적용. AI가 NLOS bias를 학습하여 보정.', color: 'orange' },
              ].map(({ title, desc, color }) => (
                <div key={title} className={`rounded-lg border border-${color}-200 bg-${color}-50 p-4 dark:border-${color}-900/40 dark:bg-${color}-900/10`}>
                  <p className={`mb-1 text-xs font-bold text-${color}-700 dark:text-${color}-300`}>{title}</p>
                  <p className={`text-xs text-${color}-600 dark:text-${color}-400`}>{desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 overflow-x-auto rounded-lg bg-amber-50 p-3 dark:bg-amber-900/20">
              <Eq latex={String.raw`\hat{\mathbf{p}} = f_\theta\!\left(\{\tau_i, P_i, \phi_i\}_{i=1}^{N_{\text{TRP}}}\right) \in \mathbb{R}^3`} />
            </div>
            <p className="mt-2 text-xs text-gray-500">다중 TRP의 ToA(tau), RSRP(P), AoA(phi) 측정값으로 3D 위치 추정.</p>

            <div className="mt-4">
              <Sub n="3" title="성능 비교" />
              <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                <table className="w-full text-xs">
                  <thead><tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">방식</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">LOS 정확도</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">NLOS 정확도</th>
                  </tr></thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {[
                      { m: '기존 OTDOA', los: '~1m', nlos: '~5-10m' },
                      { m: 'AI Direct', los: '~0.5m', nlos: '~1-2m' },
                      { m: 'AI Indirect (보정)', los: '~0.8m', nlos: '~2-3m' },
                    ].map((r, i) => (
                      <tr key={i} className={i === 1 ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''}>
                        <td className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">{r.m}</td>
                        <td className="px-3 py-2 text-center font-mono text-gray-600 dark:text-gray-400">{r.los}</td>
                        <td className={`px-3 py-2 text-center font-mono font-semibold ${i === 1 ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-600 dark:text-gray-400'}`}>{r.nlos}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Evaluation Methodology */}
      <section className="scroll-mt-20">
        <SH icon={<BarChart2 className="h-5 w-5" />} title="평가 방법론 및 시뮬레이션 설정" collapsed={!!col['eval']} onToggle={() => toggle('eval')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['eval'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <Sub n="1" title="공통 시뮬레이션 파라미터" />
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead><tr className="bg-gray-50 dark:bg-gray-800">
                  <th className="px-3 py-2 text-left text-gray-600">파라미터</th>
                  <th className="px-3 py-2 text-left text-gray-600">CSI</th>
                  <th className="px-3 py-2 text-left text-gray-600">Beam</th>
                  <th className="px-3 py-2 text-left text-gray-600">Positioning</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { p: '주파수', csi: '3.5 GHz', beam: '28 GHz', pos: '3.5 GHz' },
                    { p: '대역폭', csi: '100 MHz', beam: '100 MHz', pos: '100 MHz' },
                    { p: '안테나 (gNB)', csi: '32T', beam: '64T (패널)', pos: '4T/8T' },
                    { p: '채널 모델', csi: 'CDL-A/C', beam: 'CDL + ray-tracing', pos: 'UMa/UMi' },
                    { p: 'UE 속도', csi: '3-30 km/h', beam: '30-120 km/h', pos: '정적/보행' },
                  ].map((r, i) => (
                    <tr key={i}>
                      <td className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">{r.p}</td>
                      <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{r.csi}</td>
                      <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{r.beam}</td>
                      <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{r.pos}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 dark:border-indigo-800 dark:bg-indigo-900/20">
              <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">복잡도 비교 기준</p>
              <p className="mt-1 text-xs text-indigo-600 dark:text-indigo-400">
                3GPP는 AI 솔루션과 non-AI 솔루션의 공정 비교를 위해 FLOPs(부동소수점 연산),
                파라미터 수, 메모리 사용량을 함께 보고하도록 요구합니다.
                Rel-19에서 이 복잡도 비교 프레임워크가 규격화되었습니다.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Model Management */}
      <section className="scroll-mt-20">
        <SH icon={<Settings className="h-5 w-5" />} title="모델 관리 표준화 이슈" collapsed={!!col['model']} onToggle={() => toggle('model')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['model'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-3 text-sm font-bold text-red-700 dark:text-red-300">표준화 챌린지</p>
                <div className="space-y-2">
                  {[
                    { t: 'Interoperability', d: 'UE 벤더 A의 encoder와 gNB 벤더 B의 decoder가 호환되어야 함.' },
                    { t: 'Model Transfer', d: 'gNB → UE 모델 전달 시 보안, 크기, 포맷 문제.' },
                    { t: 'Monitoring Metric', d: '성능 열화 감지 기준을 어떻게 정의할 것인가.' },
                    { t: 'Data Collection', d: 'UE가 수집해야 할 데이터 양과 주기의 부담.' },
                  ].map(({ t, d }) => (
                    <div key={t} className="rounded-lg border border-red-100 bg-red-50 p-3 dark:border-red-900/30 dark:bg-red-900/10">
                      <p className="text-xs font-bold text-red-700 dark:text-red-300">{t}</p>
                      <p className="mt-0.5 text-xs text-red-600 dark:text-red-400">{d}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-3 text-sm font-bold text-green-700 dark:text-green-300">Rel-19 해결 방향</p>
                <div className="space-y-2">
                  {[
                    { t: '모델 ID 체계', d: '모델 식별을 위한 ID 구조 정의. gNB가 UE에 적합한 모델 지정.' },
                    { t: 'Fallback 절차', d: 'AI 실패 시 eType II codebook으로 전환하는 RRC 시그널링 정의.' },
                    { t: 'Performance metric', d: 'SGCS 기반 모니터링 기준값 설정. UE→gNB 보고 절차.' },
                    { t: 'Capability signaling', d: 'UE가 지원하는 AI 기능(모델 크기, 추론 지연)을 gNB에 알림.' },
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
