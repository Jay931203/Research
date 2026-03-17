'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  Radio, ChevronDown, Cpu, Layers, Target,
  Zap, GraduationCap, BarChart2, Clock,
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
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">{n}</span>
      <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">{title}</h4>
    </div>
  );
}

/* ── Interactive Beam Sweep Viz ──────────────────────────── */

function BeamSweepViz() {
  const [mode, setMode] = useState<'exhaustive' | 'ai'>('exhaustive');
  const totalBeams = 64;
  const aiBeams = 8;
  const measured = mode === 'exhaustive' ? totalBeams : aiBeams;

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button onClick={() => setMode('exhaustive')} className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${mode === 'exhaustive' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>기존 Exhaustive Sweep</button>
        <button onClick={() => setMode('ai')} className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${mode === 'ai' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>AI Beam Prediction</button>
      </div>
      <div className="grid grid-cols-16 gap-0.5">
        {Array.from({ length: totalBeams }, (_, i) => {
          const isActive = mode === 'exhaustive' || i < aiBeams || i === 42;
          const isBest = i === 42;
          return (
            <div key={i} className={`h-6 rounded-sm transition-all ${isBest ? 'bg-yellow-400 ring-2 ring-yellow-600' : isActive ? (mode === 'exhaustive' ? 'bg-red-300 dark:bg-red-700' : 'bg-emerald-300 dark:bg-emerald-700') : 'bg-gray-100 dark:bg-gray-800'}`} />
          );
        })}
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-gray-500">측정 빔 수: <span className={`font-bold ${mode === 'ai' ? 'text-emerald-600' : 'text-red-600'}`}>{measured}/{totalBeams}</span></span>
        <span className="text-gray-500">오버헤드 감소: <span className="font-bold text-emerald-600">{mode === 'ai' ? '87.5%' : '0%'}</span></span>
      </div>
      <p className="text-xs italic text-gray-400">{mode === 'exhaustive' ? '모든 64개 빔을 순차 측정 (높은 지연)' : 'Wide beam 8개만 측정 후 AI가 최적 narrow beam(노란색) 예측'}</p>
    </div>
  );
}

/* ── Quiz ──────────────────────────────────────────────────── */

const quizData = [
  { q: 'BM-Case1 (Spatial prediction)의 입력은?', opts: ['과거 narrow beam 이력', 'Wide beam 측정값', 'CSI 행렬', 'UE 위치 좌표'], ans: 1 },
  { q: 'BM-Case2 (Temporal prediction)의 주요 특징은?', opts: ['공간 도메인 활용', '시간 이력 기반 예측', '주파수 도메인 분석', '코드북 설계'], ans: 1 },
  { q: 'AI beam prediction의 가장 큰 이점은?', opts: ['빔 품질 향상', '측정 오버헤드 감소', '전력 증가', '대역폭 확장'], ans: 1 },
  { q: 'mmWave 빔 관리가 어려운 이유는?', opts: ['낮은 주파수', '넓은 빔폭', '좁은 빔 + 높은 경로 손실', '낮은 데이터율'], ans: 2 },
];

function Quiz() {
  const [cur, setCur] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const check = (i: number) => { if (sel !== null) return; setSel(i); if (i === quizData[cur].ans) setScore(s => s + 1); };
  const next = () => { if (cur + 1 >= quizData.length) { setDone(true); return; } setCur(c => c + 1); setSel(null); };

  if (done) return (
    <div className="rounded-xl border-2 border-orange-300 bg-orange-50 p-6 text-center dark:border-orange-700 dark:bg-orange-900/20">
      <p className="text-lg font-bold text-orange-700 dark:text-orange-300">결과: {score}/{quizData.length}</p>
      <button onClick={() => { setCur(0); setSel(null); setScore(0); setDone(false); }} className="mt-3 rounded-lg bg-orange-600 px-4 py-2 text-sm font-bold text-white">다시 풀기</button>
    </div>
  );
  const q = quizData[cur];
  return (
    <div className="space-y-3">
      <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Q{cur + 1}. {q.q}</p>
      {q.opts.map((o, i) => (
        <button key={i} onClick={() => check(i)} className={`w-full rounded-lg border p-3 text-left text-sm transition ${sel === null ? 'border-gray-200 hover:border-orange-400 dark:border-gray-700' : i === q.ans ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : i === sel ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 opacity-50 dark:border-gray-700'}`}>{o}</button>
      ))}
      {sel !== null && <button onClick={next} className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-bold text-white">{cur + 1 < quizData.length ? '다음' : '결과'}</button>}
    </div>
  );
}

/* ── Main ──────────────────────────────────────────────────── */

export default function BeamManagementStudyFull() {
  const [col, setCol] = useState<Record<string, boolean>>({});
  const toggle = useCallback((id: string) => setCol(c => ({ ...c, [id]: !c[id] })), []);

  return (
    <div className="space-y-6">

      {/* Hero */}
      <section className="scroll-mt-20">
        <div className="overflow-hidden rounded-xl shadow-sm">
          <div className="bg-gradient-to-br from-orange-600 via-amber-600 to-yellow-600 p-6 pb-8">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white">5G-Advanced</span>
              <span className="rounded-full bg-red-400/90 px-3 py-1 text-xs font-bold text-red-900">Beam Management</span>
            </div>
            <h2 className="text-xl font-bold leading-snug text-white sm:text-2xl">
              AI/ML for Beam Management in 5G-Advanced
            </h2>
            <p className="mt-3 text-sm text-orange-200">빔 예측, 시공간 특성, 표준화 관점의 종합 분석</p>
          </div>
          <div className="bg-white p-6 dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
            <p className="leading-relaxed text-gray-700 dark:text-gray-300">
              mmWave/sub-THz 통신에서 <span className="font-semibold text-orange-700 dark:text-orange-300">빔 스위핑 오버헤드</span>는 시스템 효율의 주요 병목입니다.
              AI/ML 기반 빔 예측은 과거 측정값의 <span className="font-semibold text-amber-700 dark:text-amber-300">시공간 상관관계</span>를 학습하여
              전체 빔 스캔 없이 최적 빔을 예측함으로써 오버헤드를 40-85% 감소시킬 수 있습니다.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {['Beam Prediction', 'Spatial-Temporal', 'Overhead Reduction', 'mmWave', '3GPP Rel-18/19'].map(tag => (
                <span key={tag} className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="scroll-mt-20">
        <SH icon={<Radio className="h-5 w-5" />} title="문제: 빔 스위핑 오버헤드" collapsed={!!col['problem']} onToggle={() => toggle('problem')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['problem'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <Sub n="1" title="mmWave 빔 관리의 도전" />
            <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
              mmWave (28/39 GHz) 및 sub-THz (&gt;100 GHz) 대역에서는 높은 경로 손실을 보상하기 위해
              좁은 빔(narrow beam)으로 에너지를 집중해야 합니다. 빔이 좁을수록 정확한 방향 정렬이 필요하고,
              이를 위한 빔 스위핑(beam sweeping)에 많은 시간과 자원이 소모됩니다.
            </p>

            <Sub n="2" title="오버헤드 분석" />
            <div className="mb-4 overflow-x-auto rounded-lg bg-red-50 p-3 dark:bg-red-900/10">
              <Eq latex={String.raw`T_{\text{sweep}} = N_{\text{Tx}} \times N_{\text{Rx}} \times T_{\text{slot}} \quad \text{(exhaustive search)}`} />
            </div>
            <p className="mb-4 text-xs text-gray-500">
              Tx 64빔 x Rx 4빔 = 256 측정 슬롯. 0.5ms/슬롯 기준 128ms 소요.
              이 기간 동안 데이터 전송 불가 → 처리량(throughput) 직접 감소.
            </p>

            <Sub n="3" title="인터랙티브: Exhaustive vs AI Beam Prediction" />
            <BeamSweepViz />
          </Card>
        </div>
      </section>

      {/* Spatial-Temporal Features */}
      <section className="scroll-mt-20">
        <SH icon={<Layers className="h-5 w-5" />} title="시공간 특성(Spatial-Temporal Features)" collapsed={!!col['spatiotemporal']} onToggle={() => toggle('spatiotemporal')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['spatiotemporal'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <Sub n="1" title="공간 도메인 특성" />
            <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
              Wide beam과 narrow beam 사이에는 계층적 공간 상관관계가 존재합니다.
              Wide beam의 RSRP 패턴으로 해당 영역 내 narrow beam의 최적 후보를 좁힐 수 있습니다.
            </p>
            <div className="mb-4 overflow-x-auto rounded-lg bg-orange-50 p-3 dark:bg-orange-900/20">
              <Eq latex={String.raw`P_{\text{narrow}}^{(i)} \approx g_\theta\!\left(\{P_{\text{wide}}^{(j)}\}_{j \in \mathcal{N}(i)}\right)`} />
            </div>

            <Sub n="2" title="시간 도메인 특성" />
            <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
              UE 이동에 따른 빔 변화는 시간적 상관관계를 가집니다. UE 속도와 방향에 따라
              빔 전환 패턴을 예측할 수 있으며, 이는 Doppler 정보와 밀접하게 연결됩니다.
            </p>
            <div className="mb-4 overflow-x-auto rounded-lg bg-amber-50 p-3 dark:bg-amber-900/20">
              <Eq latex={String.raw`\hat{b}_{t+\Delta} = f_\theta\!\left(b_t, b_{t-1}, \ldots, b_{t-K}, \; P_t, P_{t-1}, \ldots, P_{t-K}\right)`} />
            </div>

            <Sub n="3" title="Joint Spatial-Temporal" />
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 dark:border-green-800 dark:bg-green-900/20">
              <p className="text-xs font-semibold text-green-700 dark:text-green-300">시공간 결합 예측의 이점</p>
              <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                공간 정보(wide beam RSRP)와 시간 이력(과거 빔 인덱스)을 결합하면 단일 도메인 대비
                예측 정확도가 5-10% 향상됩니다. Transformer 기반 모델이 이 결합에 특히 효과적이며,
                self-attention이 시공간 상관관계를 동시에 포착합니다.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* AI Architectures */}
      <section className="scroll-mt-20">
        <SH icon={<Cpu className="h-5 w-5" />} title="AI 모델 아키텍처" collapsed={!!col['arch']} onToggle={() => toggle('arch')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['arch'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-orange-50 dark:bg-orange-900/20">
                    <th className="px-3 py-2 text-left font-bold text-orange-700 dark:text-orange-300">아키텍처</th>
                    <th className="px-3 py-2 text-left font-bold text-orange-700 dark:text-orange-300">적합 시나리오</th>
                    <th className="px-3 py-2 text-center font-bold text-orange-700 dark:text-orange-300">복잡도</th>
                    <th className="px-3 py-2 text-left font-bold text-orange-700 dark:text-orange-300">특징</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { arch: 'MLP (Fully Connected)', scen: 'Spatial prediction (BM-Case1)', comp: '낮음', feat: '빠른 추론, 간단한 구조. Wide→Narrow 매핑에 적합.' },
                    { arch: 'LSTM/GRU', scen: 'Temporal prediction (BM-Case2)', comp: '중간', feat: '시계열 패턴 학습. 순차적 빔 변화 포착.' },
                    { arch: 'Transformer', scen: 'Joint spatial-temporal', comp: '높음', feat: 'Self-attention으로 장기 의존성 포착. 병렬 처리 가능.' },
                    { arch: 'CNN (1D/2D)', scen: 'RSRP 패턴 분석', comp: '중간', feat: '빔 인덱스별 RSRP를 이미지처럼 처리. 공간 패턴 추출.' },
                    { arch: 'GNN (Graph NN)', scen: '다중 TRP 협력', comp: '높음', feat: 'TRP 간 관계를 그래프로 모델링. 간섭 인지 예측.' },
                  ].map((r, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-3 py-2 font-semibold text-gray-700 dark:text-gray-300">{r.arch}</td>
                      <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{r.scen}</td>
                      <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">{r.comp}</td>
                      <td className="px-3 py-2 text-gray-500 dark:text-gray-400">{r.feat}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4">
              <Sub n="2" title="손실 함수" />
              <div className="space-y-2">
                <div className="overflow-x-auto rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                  <p className="mb-1 text-xs font-bold text-gray-600">Top-1 Accuracy (분류 기반)</p>
                  <Eq latex={String.raw`\mathcal{L}_{\text{CE}} = -\sum_{b=1}^{|\mathcal{B}|} y_b \log \hat{p}_b`} />
                </div>
                <div className="overflow-x-auto rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                  <p className="mb-1 text-xs font-bold text-gray-600">Throughput 기반 (회귀)</p>
                  <Eq latex={String.raw`\mathcal{L}_{\text{rate}} = -\mathbb{E}\!\left[\log_2\!\left(1 + \text{SINR}(\hat{b})\right)\right]`} />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Performance Results */}
      <section className="scroll-mt-20">
        <SH icon={<BarChart2 className="h-5 w-5" />} title="성능 결과 및 비교" collapsed={!!col['results']} onToggle={() => toggle('results')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['results'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <Sub n="1" title="3GPP 평가 결과 요약" />
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead><tr className="bg-gray-50 dark:bg-gray-800">
                  <th className="px-3 py-2 text-left text-gray-600">시나리오</th>
                  <th className="px-3 py-2 text-center text-gray-600">Top-1 정확도</th>
                  <th className="px-3 py-2 text-center text-gray-600">Top-3 정확도</th>
                  <th className="px-3 py-2 text-center text-gray-600">오버헤드 감소</th>
                  <th className="px-3 py-2 text-center text-gray-600">Throughput 손실</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { sc: 'BM-Case1 (Spatial)', t1: '78-85%', t3: '92-96%', oh: '75%', tp: '<3%' },
                    { sc: 'BM-Case2 (Temporal)', t1: '72-80%', t3: '88-94%', oh: '60%', tp: '<5%' },
                    { sc: 'Joint (Case1+2)', t1: '85-92%', t3: '95-98%', oh: '85%', tp: '<2%' },
                  ].map((r, i) => (
                    <tr key={i} className={i === 2 ? 'bg-orange-50 dark:bg-orange-900/20' : ''}>
                      <td className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">{r.sc}</td>
                      <td className="px-3 py-2 text-center font-mono text-gray-600 dark:text-gray-400">{r.t1}</td>
                      <td className="px-3 py-2 text-center font-mono text-gray-600 dark:text-gray-400">{r.t3}</td>
                      <td className="px-3 py-2 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">{r.oh}</td>
                      <td className="px-3 py-2 text-center font-mono text-gray-600 dark:text-gray-400">{r.tp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800 dark:bg-emerald-900/20">
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">핵심 발견</p>
                <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                  Top-3 정확도 기준 95% 이상 달성 가능. 이는 3개 빔 후보만 정밀 측정하면 최적 빔을 찾을 수 있음을 의미.
                  64빔 → 3빔으로 95% 이상 오버헤드 감소.
                </p>
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-900/20">
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">UE 속도 영향</p>
                <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                  저속(3 km/h): temporal prediction 유리 (느린 변화, 긴 예측 가능).
                  고속(120 km/h): spatial prediction 상대적 유리 (빠른 변화에 덜 민감).
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Standardization */}
      <section className="scroll-mt-20">
        <SH icon={<Clock className="h-5 w-5" />} title="표준화 현황 및 전망" collapsed={!!col['std']} onToggle={() => toggle('std')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['std'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="space-y-3">
              {[
                { phase: 'Rel-18 SI', status: '완료', items: ['BM-Case1/Case2 타당성 확인', '오버헤드 감소 이득 검증', '모델 복잡도 분석'], color: 'blue' },
                { phase: 'Rel-19 WI', status: '진행중', items: ['Beam prediction 절차 규격화', '모델 모니터링 기준 정의', 'Fallback 메커니즘 설계', 'UE capability signaling'], color: 'indigo' },
                { phase: 'Rel-20 전망', status: '계획', items: ['다중 TRP 협력 빔 예측', 'Sensing-assisted beam management', 'AI-native beam tracking'], color: 'purple' },
              ].map(({ phase, status, items, color }) => (
                <div key={phase} className={`rounded-lg border border-${color}-200 bg-${color}-50/70 p-4 dark:border-${color}-900/40 dark:bg-${color}-900/10`}>
                  <div className="mb-2 flex items-center gap-2">
                    <span className={`rounded-full bg-${color}-100 px-2 py-0.5 text-xs font-bold text-${color}-700 dark:bg-${color}-900/40 dark:text-${color}-300`}>{phase}</span>
                    <span className="text-xs text-gray-500">{status}</span>
                  </div>
                  <ul className="space-y-1">
                    {items.map(it => <li key={it} className="text-xs text-gray-600 dark:text-gray-400">- {it}</li>)}
                  </ul>
                </div>
              ))}
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
