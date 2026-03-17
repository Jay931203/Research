'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  BrainCircuit, ChevronDown, Cpu, Layers, Zap,
  GraduationCap, BarChart2, ArrowRightLeft, Network,
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
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-100 text-xs font-bold text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300">{n}</span>
      <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">{title}</h4>
    </div>
  );
}

/* ── Interactive LASCO Pipeline ──────────────────────────── */

function LASCOPipeline() {
  const [step, setStep] = useState(0);
  const steps = [
    { title: 'Pre-training (LAM + Ref SAM)', desc: 'LAM (20-block Transformer, d=512)과 Reference SAM (2-block, d=64)을 동일한 혼합 데이터셋으로 학습. 500 epochs, cosine LR decay.', color: 'blue' },
    { title: 'Environment Adaptation', desc: 'Proxy SAM을 Reference SAM 가중치로 초기화 후, 타겟 환경 데이터로만 fine-tuning. LAM과 Ref SAM은 완전 동결.', color: 'indigo' },
    { title: 'Collaborative Inference', desc: 'H_hat = f_base(H_in) + alpha * (f_proxy(H_in) - f_ref(H_in)). LAM 출력에 환경별 보정값(shift)을 더함.', color: 'violet' },
    { title: 'E-LASCO (Enhanced)', desc: 'alpha를 환경별로 학습 가능한 파라미터로 만들어 최적화. 환경 101에서는 alpha~0.9, 환경 104에서는 alpha~0.3.', color: 'purple' },
  ];

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {steps.map((s, i) => (
          <button key={i} onClick={() => setStep(i)}
            className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-bold transition ${step === i ? `bg-${s.color}-500 text-white` : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
            Step {i + 1}
          </button>
        ))}
      </div>
      <div className={`rounded-lg border border-${steps[step].color}-200 bg-${steps[step].color}-50 p-4 dark:border-${steps[step].color}-800 dark:bg-${steps[step].color}-900/20`}>
        <p className={`text-sm font-bold text-${steps[step].color}-700 dark:text-${steps[step].color}-300`}>{steps[step].title}</p>
        <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{steps[step].desc}</p>
      </div>
    </div>
  );
}

/* ── Quiz ──────────────────────────────────────────────────── */

const quizData = [
  { q: 'LASCO에서 LAM의 파라미터는 adaptation 시 어떻게 되는가?', opts: ['Fine-tuning됨', '완전 동결 (frozen)', '일부 레이어만 학습', '삭제됨'], ans: 1 },
  { q: 'Reference SAM의 역할은?', opts: ['환경 적응', 'Pre-trained LAM의 출력 분포를 모방', '데이터 수집', '모델 압축'], ans: 1 },
  { q: 'LASCO의 핵심 아이디어 "environment-induced reconstruction shift"란?', opts: ['모델 크기 변화', 'LAM fine-tuning 시 발생할 출력 분포 변화를 SAM으로 근사', '데이터 이동', '환경 온도 변화'], ans: 1 },
  { q: 'E-LASCO에서 alpha의 역할은?', opts: ['학습률', 'LAM과 SAM shift의 결합 비율 (환경별 최적화)', '양자화 비트수', '배치 크기'], ans: 1 },
  { q: 'Dual-SAM 구조의 장점은?', opts: ['복잡도 감소', 'Proxy SAM이 원래 복원 목적 함수를 유지하여 지식 전이 가능', '모델 크기 증가', '학습 속도 감소'], ans: 1 },
];

function Quiz() {
  const [cur, setCur] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const check = (i: number) => { if (sel !== null) return; setSel(i); if (i === quizData[cur].ans) setScore(s => s + 1); };
  const next = () => { if (cur + 1 >= quizData.length) { setDone(true); return; } setCur(c => c + 1); setSel(null); };

  if (done) return (
    <div className="rounded-xl border-2 border-cyan-300 bg-cyan-50 p-6 text-center dark:border-cyan-700 dark:bg-cyan-900/20">
      <p className="text-lg font-bold text-cyan-700 dark:text-cyan-300">결과: {score}/{quizData.length}</p>
      <button onClick={() => { setCur(0); setSel(null); setScore(0); setDone(false); }} className="mt-3 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-bold text-white">다시 풀기</button>
    </div>
  );
  const q = quizData[cur];
  return (
    <div className="space-y-3">
      <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Q{cur + 1}. {q.q}</p>
      {q.opts.map((o, i) => (
        <button key={i} onClick={() => check(i)} className={`w-full rounded-lg border p-3 text-left text-sm transition ${sel === null ? 'border-gray-200 hover:border-cyan-400 dark:border-gray-700' : i === q.ans ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : i === sel ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 opacity-50 dark:border-gray-700'}`}>{o}</button>
      ))}
      {sel !== null && <button onClick={next} className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-bold text-white">{cur + 1 < quizData.length ? '다음' : '결과'}</button>}
    </div>
  );
}

/* ── Main ──────────────────────────────────────────────────── */

export default function LargeSmallModelStudyFull() {
  const [col, setCol] = useState<Record<string, boolean>>({});
  const toggle = useCallback((id: string) => setCol(c => ({ ...c, [id]: !c[id] })), []);

  return (
    <div className="space-y-6">

      {/* Hero */}
      <section className="scroll-mt-20">
        <div className="overflow-hidden rounded-xl shadow-sm">
          <div className="bg-gradient-to-br from-cyan-700 via-blue-700 to-indigo-700 p-6 pb-8">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white">arXiv: 2512.12170</span>
              <span className="rounded-full bg-yellow-400/90 px-3 py-1 text-xs font-bold text-yellow-900">LASCO Framework</span>
            </div>
            <h2 className="text-xl font-bold leading-snug text-white sm:text-2xl">
              Large and Small Model Collaboration for Air Interface
            </h2>
            <p className="mt-3 text-sm text-cyan-200">Cui, Guo, Li, Wen, Jin (2025) - LAM + SAM 협력 프레임워크</p>
          </div>
          <div className="bg-white p-6 dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
            <p className="leading-relaxed text-gray-700 dark:text-gray-300">
              대규모 AI 모델(LAM)의 범용적 채널 지식과 소규모 AI 모델(SAM)의 환경 특화 적응력을 결합하는
              <span className="font-semibold text-cyan-700 dark:text-cyan-300"> LASCO</span> 프레임워크를 제안합니다.
              LAM 파라미터를 직접 수정하지 않고, dual-SAM 구조로
              <span className="font-semibold text-blue-700 dark:text-blue-300"> 환경 유발 복원 시프트(environment-induced reconstruction shift)</span>를
              학습하여 적응합니다.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {['LAM (Large AI Model)', 'SAM (Small AI Model)', 'Environment Adaptation', 'CSI Feedback', 'Knowledge Transfer'].map(tag => (
                <span key={tag} className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="scroll-mt-20">
        <SH icon={<BrainCircuit className="h-5 w-5" />} title="문제: LAM의 환경 적응 딜레마" collapsed={!!col['problem']} onToggle={() => toggle('problem')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['problem'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <Sub n="1" title="기존 접근의 한계" />
            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                { title: 'Direct Fine-tuning', issues: ['높은 학습 비용 (20-block Transformer)', '다중 사용자 시 추론 비효율', 'Catastrophic forgetting 위험', 'LAM 파라미터 접근 불가 (상용 모델)'], color: 'red' },
                { title: 'Pre-trained Only', issues: ['환경 특화 성능 부족', '일반화 vs 특화 트레이드오프', '채널 분포 변화에 취약', '특정 환경 최적화 불가'], color: 'orange' },
              ].map(({ title, issues, color }) => (
                <div key={title} className={`rounded-lg border border-${color}-200 bg-${color}-50 p-4 dark:border-${color}-900/40 dark:bg-${color}-900/10`}>
                  <p className={`mb-2 text-xs font-bold text-${color}-700 dark:text-${color}-300`}>{title}</p>
                  <ul className="space-y-1">
                    {issues.map(is => <li key={is} className={`text-xs text-${color}-600 dark:text-${color}-400`}>- {is}</li>)}
                  </ul>
                </div>
              ))}
            </div>

            <Sub n="2" title="LASCO의 해결 전략" />
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 dark:border-green-800 dark:bg-green-900/20">
              <p className="text-xs font-semibold text-green-700 dark:text-green-300">핵심 아이디어</p>
              <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                LAM을 &quot;범용 채널 지식 베이스&quot;로 동결하고, SAM을 &quot;환경 특화 경량 플러그인&quot;으로 사용.
                Reference SAM (pre-trained)과 Proxy SAM (fine-tuned)의 출력 차이가
                LAM의 fine-tuning 효과를 근사합니다. 이는 상용/독점 LAM에도 적용 가능합니다.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Architecture */}
      <section className="scroll-mt-20">
        <SH icon={<Network className="h-5 w-5" />} title="LASCO 아키텍처 상세" collapsed={!!col['arch']} onToggle={() => toggle('arch')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['arch'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <Sub n="1" title="모델 구성" />
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead><tr className="bg-cyan-50 dark:bg-cyan-900/20">
                  <th className="px-3 py-2 text-left font-bold text-cyan-700 dark:text-cyan-300">모델</th>
                  <th className="px-3 py-2 text-left font-bold text-cyan-700 dark:text-cyan-300">역할</th>
                  <th className="px-3 py-2 text-center font-bold text-cyan-700 dark:text-cyan-300">구조</th>
                  <th className="px-3 py-2 text-center font-bold text-cyan-700 dark:text-cyan-300">Adaptation 시</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { m: 'Base LAM', r: '범용 채널 지식 베이스', s: '20 blocks, d=512, FFN=2048', a: 'Frozen' },
                    { m: 'Reference SAM', r: 'Pre-trained LAM 출력 분포 모방', s: '2 blocks, d=64, FFN=256', a: 'Frozen' },
                    { m: 'Proxy SAM', r: '환경 적응 후 LAM 출력 근사', s: '2 blocks, d=64, FFN=256', a: 'Trainable' },
                  ].map((row, i) => (
                    <tr key={i} className={i === 2 ? 'bg-cyan-50 dark:bg-cyan-900/10' : ''}>
                      <td className="px-3 py-2 font-semibold text-gray-700 dark:text-gray-300">{row.m}</td>
                      <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{row.r}</td>
                      <td className="px-3 py-2 text-center font-mono text-gray-500">{row.s}</td>
                      <td className={`px-3 py-2 text-center font-bold ${row.a === 'Trainable' ? 'text-cyan-600' : 'text-gray-400'}`}>{row.a}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4">
              <Sub n="2" title="인터랙티브 파이프라인" />
              <LASCOPipeline />
            </div>
          </Card>
        </div>
      </section>

      {/* Key Equations */}
      <section className="scroll-mt-20">
        <SH icon={<Cpu className="h-5 w-5" />} title="핵심 수식" collapsed={!!col['eq']} onToggle={() => toggle('eq')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['eq'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="space-y-4">
              <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <p className="mb-2 text-xs font-bold text-cyan-700 dark:text-cyan-300">CSI 압축 파이프라인</p>
                <Eq latex={String.raw`\mathbf{s} = \mathbf{A}\,\text{vec}(\mathbf{H}), \quad \gamma = \frac{2N_t N_c}{M}`} />
                <p className="mt-1 text-xs text-gray-500">랜덤 선형 프로젝션으로 CSI를 codeword s로 압축. gamma = 압축률.</p>
              </div>

              <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <p className="mb-2 text-xs font-bold text-cyan-700 dark:text-cyan-300">LASCO 추론 공식</p>
                <Eq latex={String.raw`\hat{\mathbf{H}} = f_{\text{base}}(\mathbf{H}_{\text{in}}) + \underbrace{f_{\text{proxy}}(\mathbf{H}_{\text{in}}) - f_{\text{ref}}(\mathbf{H}_{\text{in}})}_{\text{environment-specific shift}}`} />
                <p className="mt-1 text-xs text-gray-500">Proxy SAM과 Reference SAM의 출력 차이가 환경 적응 보정값.</p>
              </div>

              <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <p className="mb-2 text-xs font-bold text-cyan-700 dark:text-cyan-300">alpha 도입 (LASCO with coefficient)</p>
                <Eq latex={String.raw`\hat{\mathbf{H}} = f_{\text{proxy}}(\mathbf{H}_{\text{in}}) + \alpha\!\left(f_{\text{base}}(\mathbf{H}_{\text{in}}) - f_{\text{ref}}(\mathbf{H}_{\text{in}})\right)`} />
                <p className="mt-1 text-xs text-gray-500">alpha가 LAM 기여도를 조절. alpha가 클수록 LAM의 범용 지식 비중 증가.</p>
              </div>

              <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <p className="mb-2 text-xs font-bold text-cyan-700 dark:text-cyan-300">E-LASCO 손실 함수</p>
                <Eq latex={String.raw`\min_{f_{\text{proxy}},\,\alpha} \left\|\mathbf{H} - \left(f_{\text{proxy}}(\mathbf{H}_{\text{in}}) + \alpha\left(f_{\text{base}}(\mathbf{H}_{\text{in}}) - f_{\text{ref}}(\mathbf{H}_{\text{in}})\right)\right)\right\|_2^2`} />
                <p className="mt-1 text-xs text-gray-500">Proxy SAM 파라미터와 alpha를 동시 최적화.</p>
              </div>

              <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <p className="mb-2 text-xs font-bold text-cyan-700 dark:text-cyan-300">GCS (Generalized Cosine Similarity)</p>
                <Eq latex={String.raw`\text{GCS} = \frac{1}{N_c}\sum_{i=1}^{N_c} \frac{|\hat{\mathbf{h}}_i^H \mathbf{h}_i|}{\|\hat{\mathbf{h}}_i\|_2 \|\mathbf{h}_i\|_2}`} />
                <p className="mt-1 text-xs text-gray-500">서브캐리어별 빔포밍 정렬도. 1에 가까울수록 정확한 CSI 복원.</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Results */}
      <section className="scroll-mt-20">
        <SH icon={<BarChart2 className="h-5 w-5" />} title="성능 분석 및 비교" collapsed={!!col['results']} onToggle={() => toggle('results')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['results'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <Sub n="1" title="방법별 비교" />
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead><tr className="bg-gray-50 dark:bg-gray-800">
                  <th className="px-3 py-2 text-left text-gray-600">방법</th>
                  <th className="px-3 py-2 text-left text-gray-600">특징</th>
                  <th className="px-3 py-2 text-center text-gray-600">학습 비용</th>
                  <th className="px-3 py-2 text-center text-gray-600">데이터 요구</th>
                  <th className="px-3 py-2 text-center text-gray-600">성능</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { m: 'Pre-trained LAM', f: '적응 없이 범용 모델 사용', c: '없음', d: '없음', p: '기준선' },
                    { m: 'Pre-trained SAM', f: '소형 모델, 범용', c: '없음', d: '없음', p: 'LAM 미만' },
                    { m: 'Fine-tuned SAM', f: 'SAM만 환경 적응', c: '낮음', d: '소량', p: '보통' },
                    { m: 'Baseline A', f: 'LAM+SAM 병렬, 처음부터 학습', c: '높음', d: '다량', p: '수렴 실패 (1000 samples)' },
                    { m: 'LASCO', f: 'Dual-SAM shift 학습', c: '낮음', d: '소량', p: '우수' },
                    { m: 'E-LASCO', f: 'Learnable alpha + LASCO', c: '낮음', d: '소량', p: '최우수' },
                  ].map((r, i) => (
                    <tr key={i} className={i >= 4 ? 'bg-cyan-50 dark:bg-cyan-900/10' : ''}>
                      <td className="px-3 py-2 font-semibold text-gray-700 dark:text-gray-300">{r.m}</td>
                      <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{r.f}</td>
                      <td className="px-3 py-2 text-center text-gray-500">{r.c}</td>
                      <td className="px-3 py-2 text-center text-gray-500">{r.d}</td>
                      <td className={`px-3 py-2 text-center font-bold ${i >= 4 ? 'text-cyan-600 dark:text-cyan-400' : 'text-gray-500'}`}>{r.p}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 dark:border-cyan-800 dark:bg-cyan-900/20">
                <p className="text-xs font-semibold text-cyan-700 dark:text-cyan-300">alpha 값의 환경 의존성</p>
                <p className="mt-1 text-xs text-cyan-600 dark:text-cyan-400">
                  평균 최적 alpha ~0.7이지만 환경별 편차 큼.
                  Env 101: alpha~0.9 (LAM 기여 높음), Env 104: alpha~0.3 (SAM 기여 높음).
                  E-LASCO가 이를 자동 조정하여 모든 환경에서 최적 성능.
                </p>
              </div>
              <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-800 dark:bg-blue-900/20">
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">수렴 속도</p>
                <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                  LASCO/E-LASCO는 ~50% 케이스에서 Baseline A 대비 빠른 수렴.
                  특히 소량 데이터(1000 samples)에서 Baseline A가 수렴 실패하는 반면
                  LASCO는 안정적으로 학습 완료.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Why Dual SAM */}
      <section className="scroll-mt-20">
        <SH icon={<ArrowRightLeft className="h-5 w-5" />} title="왜 Dual-SAM인가?" collapsed={!!col['dual']} onToggle={() => toggle('dual')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['dual'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-900/10">
                <p className="mb-2 text-xs font-bold text-red-700 dark:text-red-300">단일 SAM 접근 (Residual Learning)</p>
                <p className="text-xs text-red-600 dark:text-red-400">
                  SAM이 (Ground Truth - LAM output) 잔차만 학습.
                  CSI 복원과 다른 목적 함수 → pre-trained 지식 전이 불가.
                  학습 비효율, 수렴 느림.
                </p>
              </div>
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900/40 dark:bg-green-900/10">
                <p className="mb-2 text-xs font-bold text-green-700 dark:text-green-300">Dual-SAM 접근 (LASCO)</p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  Proxy SAM이 원래 CSI 복원 목적 함수 유지.
                  Reference SAM으로부터 초기화 → pre-trained 지식 상속.
                  빠른 수렴 + 안정적 성능.
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-purple-200 bg-purple-50 px-4 py-3 dark:border-purple-800 dark:bg-purple-900/20">
              <p className="text-xs font-semibold text-purple-700 dark:text-purple-300">상용 모델 호환성</p>
              <p className="mt-1 text-xs text-purple-600 dark:text-purple-400">
                LASCO는 LAM의 가중치에 접근할 필요가 없습니다. LAM을 블랙박스로 취급하고
                입출력만으로 SAM을 학습합니다. 이는 상용 또는 독점 AI 모델에도 적용 가능한
                실용적 장점을 제공합니다.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* System Setup */}
      <section className="scroll-mt-20">
        <SH icon={<Layers className="h-5 w-5" />} title="시스템 설정 및 학습 상세" collapsed={!!col['sys']} onToggle={() => toggle('sys')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['sys'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead><tr className="bg-gray-50 dark:bg-gray-800">
                  <th className="px-3 py-2 text-left text-gray-600">파라미터</th>
                  <th className="px-3 py-2 text-left text-gray-600">값</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { p: '안테나 구성', v: 'ULA, N_t=32, N_c=32 서브캐리어' },
                    { p: '대역폭', v: '70 MHz' },
                    { p: '캐리어 주파수', v: '2.655 GHz' },
                    { p: 'Pre-training 데이터', v: '100개 sub-dataset 혼합, 8:1:1 split' },
                    { p: 'Pre-training 설정', v: '500 epochs, 5% warmup, cosine LR (1e-3→1e-5), AdamW, batch=256' },
                    { p: 'Adaptation 설정', v: 'LR=1e-3 고정, early stopping (patience=20), max 100 epochs' },
                    { p: '초기 복원', v: 'Moore-Penrose pseudo-inverse: H_in = devec(A^+ s)' },
                  ].map((r, i) => (
                    <tr key={i}><td className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">{r.p}</td>
                      <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{r.v}</td></tr>
                  ))}
                </tbody>
              </table>
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
