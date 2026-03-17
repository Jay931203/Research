'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  TrendingUp, ChevronDown, Cpu, Layers, Radio,
  Clock, GraduationCap, BarChart2, ArrowRightLeft,
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
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">{n}</span>
      <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">{title}</h4>
    </div>
  );
}

/* ── Interactive Prediction Horizon ──────────────────────── */

function PredictionHorizonViz() {
  const [horizon, setHorizon] = useState(5);
  const sgcsValues: Record<number, number> = { 5: 0.989, 10: 0.906, 15: 0.806, 20: 0.720, 30: 0.610 };
  const horizons = [5, 10, 15, 20, 30];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {horizons.map(h => (
          <button key={h} onClick={() => setHorizon(h)}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${horizon === h ? 'bg-violet-500 text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
            {h}ms
          </button>
        ))}
      </div>
      <div className="rounded-lg border border-violet-200 bg-violet-50 p-4 dark:border-violet-800 dark:bg-violet-900/20">
        <div className="flex items-end gap-1" style={{ height: 120 }}>
          {horizons.map(h => {
            const val = sgcsValues[h];
            const height = val * 100;
            return (
              <div key={h} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-xs font-mono text-gray-500">{val.toFixed(3)}</span>
                <div className={`w-full rounded-t transition-all ${h === horizon ? 'bg-violet-500' : 'bg-violet-200 dark:bg-violet-800'}`}
                  style={{ height: `${height}%` }} />
                <span className="text-xs text-gray-500">{h}ms</span>
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-center text-xs text-violet-600 dark:text-violet-400">
          예측 구간 {horizon}ms: SGCS = <span className="font-bold">{sgcsValues[horizon].toFixed(3)}</span>
          {horizon <= 10 ? ' (실용적 범위)' : horizon <= 20 ? ' (성능 저하 시작)' : ' (한계 도달)'}
        </p>
      </div>
    </div>
  );
}

/* ── Quiz ──────────────────────────────────────────────────── */

const quizData = [
  { q: 'CSI prediction과 CSI feedback의 근본적 차이는?', opts: ['같은 기능', 'Prediction은 미래 예측, Feedback은 현재 압축', 'Feedback이 더 정확', 'Prediction은 gNB 전용'], ans: 1 },
  { q: 'Channel aging 문제란?', opts: ['채널 대역폭 감소', '피드백 지연으로 CSI가 outdated됨', '안테나 노후화', '주파수 변경'], ans: 1 },
  { q: 'gNB-side prediction의 장점은?', opts: ['UE 연산 증가', '피드백 슬롯 자체를 생략 가능', 'UE 복잡도 증가', '정확도가 항상 높음'], ans: 1 },
  { q: 'SGCS 메트릭이 측정하는 것은?', opts: ['전력 효율', '빔포밍 정렬 정확도', '데이터 전송률', '지연 시간'], ans: 1 },
  { q: 'CSI prediction + feedback 결합 설계의 이득은?', opts: ['복잡도 감소', '6-10% 정확도 향상', '대역폭 2배', '안테나 수 감소'], ans: 1 },
];

function Quiz() {
  const [cur, setCur] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const check = (i: number) => { if (sel !== null) return; setSel(i); if (i === quizData[cur].ans) setScore(s => s + 1); };
  const next = () => { if (cur + 1 >= quizData.length) { setDone(true); return; } setCur(c => c + 1); setSel(null); };

  if (done) return (
    <div className="rounded-xl border-2 border-violet-300 bg-violet-50 p-6 text-center dark:border-violet-700 dark:bg-violet-900/20">
      <p className="text-lg font-bold text-violet-700 dark:text-violet-300">결과: {score}/{quizData.length}</p>
      <button onClick={() => { setCur(0); setSel(null); setScore(0); setDone(false); }} className="mt-3 rounded-lg bg-violet-600 px-4 py-2 text-sm font-bold text-white">다시 풀기</button>
    </div>
  );
  const q = quizData[cur];
  return (
    <div className="space-y-3">
      <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Q{cur + 1}. {q.q}</p>
      {q.opts.map((o, i) => (
        <button key={i} onClick={() => check(i)} className={`w-full rounded-lg border p-3 text-left text-sm transition ${sel === null ? 'border-gray-200 hover:border-violet-400 dark:border-gray-700' : i === q.ans ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : i === sel ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 opacity-50 dark:border-gray-700'}`}>{o}</button>
      ))}
      {sel !== null && <button onClick={next} className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-bold text-white">{cur + 1 < quizData.length ? '다음' : '결과'}</button>}
    </div>
  );
}

/* ── Main ──────────────────────────────────────────────────── */

export default function CSIPredictionStudyFull() {
  const [col, setCol] = useState<Record<string, boolean>>({});
  const toggle = useCallback((id: string) => setCol(c => ({ ...c, [id]: !c[id] })), []);

  return (
    <div className="space-y-6">

      {/* Hero */}
      <section className="scroll-mt-20">
        <div className="overflow-hidden rounded-xl shadow-sm">
          <div className="bg-gradient-to-br from-violet-700 via-purple-700 to-fuchsia-700 p-6 pb-8">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white">arXiv: 2504.12571</span>
              <span className="rounded-full bg-yellow-400/90 px-3 py-1 text-xs font-bold text-yellow-900">Survey Paper</span>
            </div>
            <h2 className="text-xl font-bold leading-snug text-white sm:text-2xl">
              AI for CSI Prediction in 5G-Advanced and Beyond
            </h2>
            <p className="mt-3 text-sm text-violet-200">Jiang, Guo, Li, Jin, Zhang (2025) - CSI 예측 기법 종합 서베이</p>
          </div>
          <div className="bg-white p-6 dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
            <p className="leading-relaxed text-gray-700 dark:text-gray-300">
              CSI prediction은 과거 채널 측정값의 시간적 상관관계를 활용하여
              <span className="font-semibold text-violet-700 dark:text-violet-300"> 미래 CSI를 예측</span>함으로써
              channel aging 문제를 해결합니다. 이 서베이는 정확도, 일반화, 복잡도 3가지 관점에서
              AI 기반 CSI 예측 기법을 분류하고, 3GPP 표준화 현황과 미래 방향을 제시합니다.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {['Temporal Prediction', 'Eigenvector Prediction', 'Channel Matrix', 'UE-side / gNB-side', '3GPP Rel-19'].map(tag => (
                <span key={tag} className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CSI Prediction vs Feedback */}
      <section className="scroll-mt-20">
        <SH icon={<ArrowRightLeft className="h-5 w-5" />} title="CSI Prediction vs CSI Feedback" collapsed={!!col['vs']} onToggle={() => toggle('vs')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['vs'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead><tr className="bg-violet-50 dark:bg-violet-900/20">
                  <th className="px-3 py-2 text-left font-bold text-violet-700 dark:text-violet-300">차원</th>
                  <th className="px-3 py-2 text-left font-bold text-violet-700 dark:text-violet-300">CSI Feedback (압축)</th>
                  <th className="px-3 py-2 text-left font-bold text-violet-700 dark:text-violet-300">CSI Prediction (예측)</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { d: '메커니즘', fb: '현재 CSI를 압축하여 전송', pred: '과거 CSI로 미래 CSI 예측' },
                    { d: '해결 문제', fb: '피드백 오버헤드', pred: 'Channel aging / 지연 보상' },
                    { d: '오버헤드', fb: '슬롯마다 피드백 필요', pred: 'gNB측은 피드백 슬롯 생략 가능' },
                    { d: '3GPP sub-use case', fb: 'Two-sided model (Rel-18)', pred: 'UE-side prediction (Rel-18/19)' },
                    { d: '결합 가능성', fb: '시공간 주파수 압축 가능', pred: '6-10% 정확도 추가 이득' },
                    { d: '정확도 저하 요인', fb: '높은 압축률 (CR)', pred: '긴 예측 구간 (horizon)' },
                  ].map((r, i) => (
                    <tr key={i}>
                      <td className="px-3 py-2 font-semibold text-gray-700 dark:text-gray-300">{r.d}</td>
                      <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{r.fb}</td>
                      <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{r.pred}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 rounded-lg border border-purple-200 bg-purple-50 px-4 py-3 dark:border-purple-800 dark:bg-purple-900/20">
              <p className="text-xs font-semibold text-purple-700 dark:text-purple-300">통합 설계 인사이트</p>
              <p className="mt-1 text-xs text-purple-600 dark:text-purple-400">
                gNB-side prediction이 성능 임계값 이상이면 피드백 생략, 임계값 미달 시 feedback으로 전환하는
                적응적 스위칭 메커니즘이 가능합니다. 또한 UE-side 다단계 예측은 시간-공간-주파수 결합 압축으로
                피드백 오버헤드를 추가 절감할 수 있습니다.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Prediction Methods */}
      <section className="scroll-mt-20">
        <SH icon={<Cpu className="h-5 w-5" />} title="예측 방법론 분류" collapsed={!!col['methods']} onToggle={() => toggle('methods')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['methods'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <Sub n="1" title="예측 대상: 채널 행렬 vs 고유벡터" />
            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                <p className="mb-2 text-xs font-bold text-blue-700 dark:text-blue-300">채널 행렬 예측 (Channel Matrix)</p>
                <div className="mb-2 overflow-x-auto">
                  <Eq latex={String.raw`\{\mathbf{H}_{m-k}, \ldots, \mathbf{H}_m\} \;\to\; \{\hat{\mathbf{H}}_{m+1}, \ldots, \hat{\mathbf{H}}_{m+n}\}`} />
                </div>
                <ul className="space-y-1 text-xs text-blue-600 dark:text-blue-400">
                  <li>- SVD 이전의 풍부한 정보 활용</li>
                  <li>- 더 높은 SGCS 달성 (5ms: 0.989)</li>
                  <li>- 행렬 크기가 커 복잡도 높음</li>
                </ul>
              </div>
              <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-800 dark:bg-indigo-900/20">
                <p className="mb-2 text-xs font-bold text-indigo-700 dark:text-indigo-300">고유벡터 예측 (Eigenvector)</p>
                <div className="mb-2 overflow-x-auto">
                  <Eq latex={String.raw`\{\mathbf{v}_{m-k}, \ldots, \mathbf{v}_m\} \;\to\; \{\hat{\mathbf{v}}_{m+1}, \ldots, \hat{\mathbf{v}}_{m+n}\}`} />
                </div>
                <ul className="space-y-1 text-xs text-indigo-600 dark:text-indigo-400">
                  <li>- 빔포밍에 직접 사용 가능</li>
                  <li>- 차원 축소로 낮은 복잡도</li>
                  <li>- SVD로 정보 손실 발생 (5ms: 0.844)</li>
                </ul>
              </div>
            </div>

            <Sub n="2" title="배치 시나리오 (Deployment)" />
            <div className="space-y-3">
              {[
                { title: 'Framework (a): UE-side 고유벡터 예측', desc: 'UE가 SVD → 미래 고유벡터 예측 → 압축 → gNB 피드백. UE 연산 부담.', color: 'violet' },
                { title: 'Framework (b): UE-side 채널 행렬 예측', desc: 'UE가 채널 행렬 직접 예측 → SVD → 압축 피드백. 가장 높은 정확도.', color: 'purple' },
                { title: 'Framework (c): gNB-side 예측', desc: 'UE가 과거 CSI 피드백 → gNB가 미래 예측. 피드백 슬롯 생략 가능. 압축 정보 손실 존재.', color: 'fuchsia' },
              ].map(({ title, desc, color }) => (
                <div key={title} className={`rounded-lg border border-${color}-200 bg-${color}-50/70 p-4 dark:border-${color}-900/40 dark:bg-${color}-900/10`}>
                  <p className={`text-xs font-bold text-${color}-700 dark:text-${color}-300`}>{title}</p>
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <Sub n="3" title="NN 아키텍처 비교" />
              <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                <table className="w-full text-xs">
                  <thead><tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="px-3 py-2 text-left text-gray-600">아키텍처</th>
                    <th className="px-3 py-2 text-left text-gray-600">적용 사례</th>
                    <th className="px-3 py-2 text-left text-gray-600">특징</th>
                  </tr></thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {[
                      { a: 'Transformer', app: '병렬 CSI 예측, pilot-to-precoder', f: 'Self-attention으로 장기 시간 의존성 포착' },
                      { a: 'MLP (Dense)', app: 'UE/gNB 기본 비교 시뮬레이션', f: '4-layer, 가벼운 구조, 기준 성능' },
                      { a: 'MLP-Mixer', app: 'UE 속도 일반화', f: '채널/토큰 혼합으로 다양한 속도 적응' },
                      { a: 'ResNet', app: '고유벡터 vs 채널행렬 비교', f: '잔차 연결로 학습 안정성' },
                      { a: 'Hypernetwork', app: '비정상(non-stationary) 채널', f: 'NN 파라미터를 동적 생성하여 환경 적응' },
                      { a: 'RL Agent', app: 'CSI 예측 + 빔포밍 결합', f: '다중 사용자 최적화, joint 설계' },
                    ].map((r, i) => (
                      <tr key={i}><td className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">{r.a}</td>
                        <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{r.app}</td>
                        <td className="px-3 py-2 text-gray-500 dark:text-gray-400">{r.f}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Key Equations */}
      <section className="scroll-mt-20">
        <SH icon={<TrendingUp className="h-5 w-5" />} title="핵심 수식" collapsed={!!col['eq']} onToggle={() => toggle('eq')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['eq'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="space-y-4">
              <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <p className="mb-2 text-xs font-bold text-violet-700 dark:text-violet-300">SVD 기반 고유벡터 추출</p>
                <Eq latex={String.raw`\mathbf{H}_k = \mathbf{U}_k \boldsymbol{\Sigma}_k \mathbf{V}_k^H \;\Rightarrow\; \mathbf{v}_k = \mathbf{V}_k(:, 1:L)`} />
                <p className="mt-1 text-xs text-gray-500">서브캐리어 k의 채널 행렬에서 상위 L개 고유벡터 추출</p>
              </div>

              <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <p className="mb-2 text-xs font-bold text-violet-700 dark:text-violet-300">NMSE (정규화 평균 제곱 오차)</p>
                <Eq latex={String.raw`\text{NMSE} = \mathbb{E}\!\left[\frac{\|\mathbf{H} - \hat{\mathbf{H}}\|_F^2}{\|\mathbf{H}\|_F^2}\right]`} />
                <p className="mt-1 text-xs text-gray-500">채널 행렬 예측 정확도의 중간 지표</p>
              </div>

              <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <p className="mb-2 text-xs font-bold text-violet-700 dark:text-violet-300">SGCS (빔포밍 정렬도)</p>
                <Eq latex={String.raw`\text{SGCS} = \frac{1}{N_{sb}}\sum_{k=1}^{N_{sb}} \frac{|\hat{\mathbf{v}}_k^H \mathbf{v}_k|^2}{\|\hat{\mathbf{v}}_k\|^2 \|\mathbf{v}_k\|^2}`} />
                <p className="mt-1 text-xs text-gray-500">예측 고유벡터와 실제 고유벡터의 빔 방향 일치도. 1에 가까울수록 좋음.</p>
              </div>

              <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <p className="mb-2 text-xs font-bold text-violet-700 dark:text-violet-300">gNB-side 예측 (압축된 입력)</p>
                <Eq latex={String.raw`\{\hat{\mathbf{v}}_{m-k}, \ldots, \hat{\mathbf{v}}_m\} \;\xrightarrow{f_\theta}\; \{\hat{\mathbf{v}}_{m+1}, \ldots, \hat{\mathbf{v}}_{m+n}\}`} />
                <p className="mt-1 text-xs text-gray-500">gNB는 압축/복원된 고유벡터를 입력으로 사용 → 압축률이 높을수록 예측 정확도 저하</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Performance */}
      <section className="scroll-mt-20">
        <SH icon={<BarChart2 className="h-5 w-5" />} title="성능 분석" collapsed={!!col['perf']} onToggle={() => toggle('perf')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['perf'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <Sub n="1" title="예측 구간별 성능 (인터랙티브)" />
            <PredictionHorizonViz />

            <div className="mt-5">
              <Sub n="2" title="채널 행렬 vs 고유벡터 예측 비교 (SGCS)" />
              <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                <table className="w-full text-xs">
                  <thead><tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="px-3 py-2 text-left text-gray-600">예측 구간</th>
                    <th className="px-3 py-2 text-center text-gray-600">채널 행렬 예측</th>
                    <th className="px-3 py-2 text-center text-gray-600">고유벡터 예측</th>
                    <th className="px-3 py-2 text-center text-gray-600">차이</th>
                  </tr></thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {[
                      { t: '5 ms', cm: '0.989', ev: '0.844', d: '+0.145' },
                      { t: '10 ms', cm: '0.906', ev: '0.768', d: '+0.138' },
                      { t: '15 ms', cm: '0.806', ev: '0.746', d: '+0.060' },
                    ].map((r, i) => (
                      <tr key={i} className={i === 0 ? 'bg-violet-50 dark:bg-violet-900/20' : ''}>
                        <td className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">{r.t}</td>
                        <td className="px-3 py-2 text-center font-mono font-bold text-violet-600 dark:text-violet-400">{r.cm}</td>
                        <td className="px-3 py-2 text-center font-mono text-gray-600 dark:text-gray-400">{r.ev}</td>
                        <td className="px-3 py-2 text-center font-mono text-emerald-600 dark:text-emerald-400">{r.d}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-4">
              <Sub n="3" title="AI vs Non-AI 비교" />
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800 dark:bg-emerald-900/20">
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">핵심 발견 (32Tx, 4Rx, 30km/h, outdoor)</p>
                <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                  AI 기반 예측이 AR 모델 및 no-prediction 대비 유의미한 성능 이득을 보여줌.
                  단, AI 복잡도는 non-AI 방식의 약 13배. 이 복잡도-성능 트레이드오프가
                  3GPP 복잡도 비교 프레임워크 제정의 배경.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* 3GPP Standardization */}
      <section className="scroll-mt-20">
        <SH icon={<Clock className="h-5 w-5" />} title="3GPP 표준화 현황" collapsed={!!col['std']} onToggle={() => toggle('std')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['std'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="space-y-3">
              {[
                { ev: '2022.11', desc: '3GPP, CSI prediction을 CSI feedback enhancement의 sub-use case로 승인' },
                { ev: 'Rel-18', desc: 'eType II codebook을 feedback 기준선(baseline)으로 확립' },
                { ev: 'Rel-19 (RP-234039)', desc: 'CSI prediction 규격화 WI 승인. UE-side prediction 우선 규격화.' },
                { ev: 'Rel-19 진행중', desc: '복잡도 비교, 모델 학습/모니터링/데이터수집 절차 규격화' },
                { ev: '향후 예상', desc: 'gNB-side prediction 추가 연구. Joint prediction+feedback 통합 설계.' },
              ].map(({ ev, desc }, i) => (
                <div key={i} className="flex gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
                  <span className="flex h-6 min-w-[4rem] items-center justify-center rounded bg-violet-100 px-2 text-xs font-bold text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">{ev}</span>
                  <p className="text-xs text-gray-700 dark:text-gray-300">{desc}</p>
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
