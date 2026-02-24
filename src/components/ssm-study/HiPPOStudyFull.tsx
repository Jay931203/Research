'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  BrainCircuit,
  ChevronDown,
  FlaskConical,
  GraduationCap,
  Hash,
  Layers,
  Zap,
} from 'lucide-react';
import katex from 'katex';
import GlossaryText from '@/components/glossary/GlossaryText';
import HiPPOMeasureViz from '@/components/my-research/infographics/HiPPOMeasureViz';

/* ── helpers ─────────────────────────────────────────────────── */

function EquationRenderer({ latex }: { latex: string }) {
  const html = useMemo(() => {
    try { return katex.renderToString(latex, { throwOnError: false, displayMode: true }); }
    catch { return null; }
  }, [latex]);
  if (!html) return <code className="block text-center text-sm text-red-400">{latex}</code>;
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900 dark:ring-1 dark:ring-gray-800 ${className}`}>
      {children}
    </div>
  );
}

function SectionHeading({ icon, title, collapsed, onToggle }: {
  icon: React.ReactNode; title: string; collapsed?: boolean; onToggle?: () => void;
}) {
  return (
    <button onClick={onToggle} className="mb-3 flex w-full items-center gap-2.5 text-left">
      <span className="text-gray-500 dark:text-gray-400">{icon}</span>
      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">{title}</h3>
      {onToggle && (
        <ChevronDown className={`ml-auto h-5 w-5 text-gray-400 transition-transform dark:text-gray-500 ${collapsed ? '-rotate-90' : ''}`} />
      )}
    </button>
  );
}

function SubSectionHeading({ number, title }: { number: string; title: string }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">{number}</span>
      <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">{title}</h4>
    </div>
  );
}

function EqCard({ idx, name, latex, description, color = 'purple' }: {
  idx: number; name: string; latex: string; description: string; color?: string;
}) {
  const [open, setOpen] = useState(false);
  const colorMap: Record<string, string> = {
    amber:  'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
    orange: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800',
    green:  'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
  };
  const badgeMap: Record<string, string> = {
    amber:  'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
    indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
    green:  'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  };
  return (
    <div className="cursor-pointer rounded-xl border border-gray-200 bg-gray-50/50 p-4 transition hover:border-purple-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-purple-700" onClick={() => setOpen(v => !v)}>
      <div className="mb-2 flex items-center gap-2">
        <span className={`rounded px-2 py-0.5 text-xs font-bold ${badgeMap[color] ?? badgeMap.purple}`}>Eq. {idx}</span>
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{name}</span>
        <ChevronDown className={`ml-auto h-4 w-4 text-gray-400 transition-transform dark:text-gray-500 ${open ? 'rotate-180' : ''}`} />
      </div>
      <div className="overflow-x-auto py-2 text-gray-900 dark:text-gray-100"><EquationRenderer latex={latex} /></div>
      {open ? (
        <div className={`mt-3 rounded-lg border px-4 py-3 ${colorMap[color] ?? colorMap.purple}`}>
          <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">{description}</p>
        </div>
      ) : (
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">클릭하여 상세 설명 보기</p>
      )}
    </div>
  );
}

function QuizSection({ questions, color = 'purple' }: { questions: { q: string; a: string }[]; color?: string }) {
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const toggle = (i: number) => setRevealed(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; });
  const bgMap: Record<string, string> = {
    purple: 'border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/20',
    amber: 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20',
  };
  return (
    <div className="space-y-3">
      {questions.map(({ q, a }, i) => (
        <div key={i} className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
          <button onClick={() => toggle(i)} className="flex w-full items-start gap-3 p-4 text-left">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600 dark:bg-gray-800 dark:text-gray-400">Q{i + 1}</span>
            <span className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">{q}</span>
            <ChevronDown className={`h-4 w-4 flex-shrink-0 text-gray-400 transition-transform ${revealed.has(i) ? 'rotate-180' : ''}`} />
          </button>
          {revealed.has(i) && (
            <div className={`mx-4 mb-4 rounded-lg border px-4 py-3 ${bgMap[color] ?? bgMap.purple}`}>
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                <span className="mr-1 font-bold text-green-600 dark:text-green-400">A:</span>{a}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────── */

export default function HiPPOStudyFull() {
  const [col, setCol] = useState<Record<string, boolean>>({});
  const toggle = useCallback((id: string) => setCol(c => ({ ...c, [id]: !c[id] })), []);

  return (
    <GlossaryText>
    <div className="space-y-6">

      {/* ── 1. Overview ────────────────────────────────────────── */}
      <section id="hippo-overview" className="scroll-mt-20">
        <div className="overflow-hidden rounded-xl shadow-sm">
          <div className="bg-gradient-to-br from-violet-700 via-purple-600 to-indigo-600 p-6 pb-8">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">NeurIPS 2020</span>
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">arXiv 2008.07669</span>
              <span className="rounded-full bg-purple-300/90 px-3 py-1 text-xs font-bold text-purple-900">상태공간 메모리 이론</span>
            </div>
            <h2 className="text-xl font-bold leading-snug text-white sm:text-2xl">
              HiPPO: Recurrent Memory with Optimal Polynomial Projections
            </h2>
            <p className="mt-3 text-sm text-purple-200">
              Gu, Dao, Ermon, Rudra, Re (Stanford) · NeurIPS 2020
            </p>
          </div>
          <div className="bg-white p-6 dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
            <p className="leading-relaxed text-gray-700 dark:text-gray-300">
              연속 시간 함수 근사 이론에서 출발하여 RNN의 메모리 문제를 해결한 논문입니다.
              <span className="font-semibold text-purple-700 dark:text-purple-300"> &ldquo;과거를 어떻게 기억할 것인가?&rdquo;</span>를
              측도(measure)로 수학적으로 정의하고, 이 선택이 전이행렬 A를 유일하게 결정함을 증명합니다.
            </p>
            <p className="mt-3 leading-relaxed text-gray-700 dark:text-gray-300">
              특히 HiPPO-LegS는
              <span className="font-semibold text-purple-700 dark:text-purple-300"> 시간 척도 등변성(timescale equivariance)</span>을
              만족하는 유일한 해로, S4/Mamba의 이론적 초석이 됩니다.
              그래디언트가 지수적으로 소실되는 기존 RNN과 달리,
              HiPPO의 다항식 감쇠 보장은 초장거리 시퀀스에서의 학습을 가능케 합니다.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {['직교 다항식', '측도 이론', '상태공간 모델', '장거리 의존성', '그래디언트 보존'].map(tag => (
                <span key={tag} className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Background: 왜 RNN은 장거리 의존성에 실패하는가? ── */}
      <section id="hippo-problem" className="scroll-mt-20">
        <SectionHeading icon={<BrainCircuit className="h-5 w-5" />} title="왜 RNN은 장거리 의존성에 실패하는가?" collapsed={!!col['hippo-problem']} onToggle={() => toggle('hippo-problem')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['hippo-problem'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="1.1" title="그래디언트 소실 문제" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              RNN의 역전파에서 시점 0의 은닉 상태에 대한 시점 t의 그래디언트는 가중치 행렬의 연쇄 곱으로 결정됩니다.
              이 곱은 행렬의 고유값에 의해 지수적으로 소실하거나 폭발합니다:
            </p>
            <div className="mb-4 overflow-x-auto rounded-lg bg-purple-50 p-3 dark:bg-purple-900/20">
              <EquationRenderer latex={String.raw`\frac{\partial h_t}{\partial h_0} = \prod_{k=1}^{t} W_h \;\;\Longrightarrow\;\; \|W_h^t\| \sim |\lambda_{\max}|^t`} />
            </div>
            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-900/10">
                <p className="mb-1 text-xs font-bold text-red-700 dark:text-red-300">지수 소실 (기존 RNN)</p>
                <p className="text-xs text-red-600 dark:text-red-400">
                  |lambda| &lt; 1이면 lambda^t가 지수적으로 0에 수렴<br/>
                  lambda = 0.95, t = 100이면 약 0.006<br/>
                  lambda = 0.99, t = 1000이면 약 4.3 x 10^-5<br/>
                  사실상 과거 정보에 대한 학습 불가
                </p>
              </div>
              <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-900/40 dark:bg-orange-900/10">
                <p className="mb-1 text-xs font-bold text-orange-700 dark:text-orange-300">LSTM/GRU 게이팅</p>
                <p className="text-xs text-orange-600 dark:text-orange-400">
                  게이트 메커니즘으로 그래디언트 경로 추가<br/>
                  부분적으로 소실 완화하지만 근본 해결 X<br/>
                  이론적 보장 없이 휴리스틱에 의존<br/>
                  수백~수천 스텝이 실질적 한계
                </p>
              </div>
            </div>
            <div className="mb-5 rounded-lg border border-violet-200 bg-violet-50 px-4 py-3 dark:border-violet-800 dark:bg-violet-900/20">
              <p className="text-xs leading-relaxed text-violet-800 dark:text-violet-200">
                <span className="font-bold">핵심 질문:</span> 학습 가능한 메모리 구조를
                이론적으로 설계할 수 있는가? 즉, 그래디언트 소실을 구조적으로 방지하면서도
                효율적인 순환 연산을 유지하는 상태 전이 행렬 A를 수학적으로 유도할 수 있는가?
                이것이 HiPPO가 답하려는 질문입니다.
              </p>
            </div>

            <SubSectionHeading number="1.2" title="기존 접근의 한계" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              장기 기억 문제에 대한 기존 해법들은 각각 근본적인 제약을 가지고 있습니다.
              HiPPO는 이 모든 한계를 측도 이론 프레임워크로 통합 해결합니다:
            </p>
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">접근</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">메모리 방식</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">그래디언트 감쇠</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">시간 복잡도</th>
                    <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">핵심 한계</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { m: 'LSTM', mem: '학습된 게이팅', grad: 'lambda^t (완화됨)', tc: 'O(1)/스텝', lim: '이론적 보장 없음, 수천 스텝이 실질적 한계', hi: false },
                    { m: 'Transformer', mem: '전체 어텐션 O(N^2)', grad: '상수 (직접 접근)', tc: 'O(T^2)', lim: '메모리/시간 이차적 증가, 추론 비효율', hi: false },
                    { m: 'LMU', mem: '르장드르 다항식', grad: '윈도우 내 보존', tc: 'O(N)/스텝', lim: '슬라이딩 윈도우 크기 theta 고정 필요', hi: false },
                    { m: 'HiPPO', mem: '최적 다항식 투영', grad: 'Theta(1/t)', tc: 'O(N)/스텝', lim: '측도 선택이 곧 설계 자유도 (통합 프레임워크)', hi: true },
                  ].map((r, i) => (
                    <tr key={i} className={r.hi ? 'bg-purple-50 dark:bg-purple-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}>
                      <td className={`px-3 py-2 font-medium ${r.hi ? 'text-purple-700 dark:text-purple-300' : 'text-gray-700 dark:text-gray-300'}`}>{r.m}</td>
                      <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">{r.mem}</td>
                      <td className={`px-3 py-2 text-center font-mono ${r.hi ? 'font-semibold text-purple-700 dark:text-purple-300' : 'text-gray-600 dark:text-gray-400'}`}>{r.grad}</td>
                      <td className="px-3 py-2 text-center font-mono text-gray-600 dark:text-gray-400">{r.tc}</td>
                      <td className="px-3 py-2 text-gray-500 dark:text-gray-400">{r.lim}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </section>

      {/* ── 3. 핵심 아이디어: 측도 기반 최적 투영 ──────────── */}
      <section id="hippo-core" className="scroll-mt-20">
        <SectionHeading icon={<GraduationCap className="h-5 w-5" />} title="핵심 아이디어: 측도 기반 최적 투영" collapsed={!!col['hippo-core']} onToggle={() => toggle('hippo-core')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['hippo-core'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="2.1" title={'"과거를 어떻게 기억할 것인가?" = 측도 선택'} />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              HiPPO의 핵심 전환은 이것입니다: 메모리를 &ldquo;무엇을 저장하느냐&rdquo;가 아니라
              <span className="font-semibold text-purple-700 dark:text-purple-300"> &ldquo;과거 입력 함수 f(s)를 N개 직교 다항식으로 얼마나 잘 근사하느냐&rdquo;</span>로 재정의합니다.
              측도 mu(t)는 &ldquo;어떤 시점의 정보가 중요한가?&rdquo;를 수학적으로 정의하며,
              이 선택이 직교 기저를 결정하고, 나아가 전이행렬 A를 완전히 결정합니다.
            </p>
            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {/* LegS */}
              <div className="rounded-lg border-2 border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-800 dark:bg-indigo-900/20">
                <p className="mb-1 text-sm font-bold text-indigo-700 dark:text-indigo-300">HiPPO-LegS</p>
                <p className="mb-2 text-xs font-semibold text-indigo-500 dark:text-indigo-400">전 이력 균일 측도</p>
                <div className="mb-2 overflow-x-auto rounded bg-white/60 px-2 py-1 dark:bg-gray-800/60">
                  <EquationRenderer latex={String.raw`\mu^{(t)}(x) = \frac{1}{t}\,\mathbb{1}_{[0,t]}(x)`} />
                </div>
                <ul className="space-y-1 text-xs text-indigo-600 dark:text-indigo-400">
                  <li className="flex items-start gap-1.5"><span className="mt-0.5 flex-shrink-0">*</span>전체 [0, t] 균일 기억</li>
                  <li className="flex items-start gap-1.5"><span className="mt-0.5 flex-shrink-0">*</span>시간 척도 등변성 보장</li>
                  <li className="flex items-start gap-1.5"><span className="mt-0.5 flex-shrink-0">*</span><span className="font-semibold">S4, Mamba 초기화에 채택</span></li>
                </ul>
              </div>
              {/* LegT */}
              <div className="rounded-lg border-2 border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-900/20">
                <p className="mb-1 text-sm font-bold text-emerald-700 dark:text-emerald-300">HiPPO-LegT</p>
                <p className="mb-2 text-xs font-semibold text-emerald-500 dark:text-emerald-400">슬라이딩 윈도우 측도</p>
                <div className="mb-2 overflow-x-auto rounded bg-white/60 px-2 py-1 dark:bg-gray-800/60">
                  <EquationRenderer latex={String.raw`\mu^{(t)}(x) = \frac{1}{\theta}\,\mathbb{1}_{[t-\theta,\,t]}(x)`} />
                </div>
                <ul className="space-y-1 text-xs text-emerald-600 dark:text-emerald-400">
                  <li className="flex items-start gap-1.5"><span className="mt-0.5 flex-shrink-0">*</span>최근 theta만 기억, 나머지 망각</li>
                  <li className="flex items-start gap-1.5"><span className="mt-0.5 flex-shrink-0">*</span>A 행렬이 시간 불변</li>
                  <li className="flex items-start gap-1.5"><span className="mt-0.5 flex-shrink-0">*</span><span className="font-semibold">LMU와 수학적으로 동치</span></li>
                </ul>
              </div>
              {/* LagT */}
              <div className="rounded-lg border-2 border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
                <p className="mb-1 text-sm font-bold text-amber-700 dark:text-amber-300">HiPPO-LagT</p>
                <p className="mb-2 text-xs font-semibold text-amber-500 dark:text-amber-400">지수 감쇠 측도</p>
                <div className="mb-2 overflow-x-auto rounded bg-white/60 px-2 py-1 dark:bg-gray-800/60">
                  <EquationRenderer latex={String.raw`\mu^{(t)}(x) = e^{-(t-x)}`} />
                </div>
                <ul className="space-y-1 text-xs text-amber-600 dark:text-amber-400">
                  <li className="flex items-start gap-1.5"><span className="mt-0.5 flex-shrink-0">*</span>최근 입력에 높은 가중치</li>
                  <li className="flex items-start gap-1.5"><span className="mt-0.5 flex-shrink-0">*</span>라게르 다항식 기저 사용</li>
                  <li className="flex items-start gap-1.5"><span className="mt-0.5 flex-shrink-0">*</span><span className="font-semibold">N=1이면 GRU 게이팅과 동치</span></li>
                </ul>
              </div>
            </div>

            <SubSectionHeading number="2.2" title="측도에서 ODE로: 메모리 동역학의 유도" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              HiPPO 프레임워크의 핵심 파이프라인은 다음과 같습니다:
              측도 선택이 직교 다항식 기저를 결정하고, 이 기저에 대한 투영 계수 c(t)의
              시간 발전이 ODE로 기술됩니다.
            </p>
            <div className="mb-4 overflow-x-auto rounded-lg bg-purple-50 p-3 dark:bg-purple-900/20">
              <EquationRenderer latex={String.raw`\frac{d}{dt}\,c(t) = A(t)\,c(t) + B(t)\,f(t)`} />
            </div>
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              여기서 A(t)는 기존 계수를 갱신하는 전이 행렬, B(t)는 새 입력 f(t)를 반영하는 입력 행렬입니다.
              결정적으로, A와 B는 측도 mu와 직교 기저에 의해 유일하게 결정됩니다.
            </p>
            <div className="mb-5 rounded-lg border border-purple-200 bg-purple-50 px-4 py-3 dark:border-purple-800 dark:bg-purple-900/20">
              <p className="text-xs leading-relaxed text-purple-800 dark:text-purple-200">
                <span className="font-bold">핵심 통찰:</span> &ldquo;측도만 바꾸면 전이행렬 A가 자동으로 결정된다&rdquo; —
                이것이 HiPPO의 가장 중요한 기여입니다. 기존에는 A 행렬을 학습하거나 휴리스틱으로 설계했지만,
                HiPPO는 &ldquo;어떤 과거가 중요한가?&rdquo;라는 고수준 질문에 답하는 것만으로
                최적의 A를 수학적으로 유도합니다. 마치 물리학에서 라그랑지안을 정의하면 운동 방정식이
                자동으로 따라오는 것과 유사합니다.
              </p>
            </div>

            <SubSectionHeading number="2.3" title="왜 LegS가 특별한가?" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              세 가지 측도 중 LegS만이 가지는 특별한 성질이 있습니다: 바로
              <span className="font-semibold text-purple-700 dark:text-purple-300"> 시간 척도 등변성(timescale equivariance)</span>입니다.
              입력 함수 f(t)를 f(alpha * t)로 시간 축 스케일링해도 출력이 동일하게 스케일링됩니다.
            </p>
            <div className="mb-4 overflow-x-auto rounded-lg bg-indigo-50 p-3 dark:bg-indigo-900/20">
              <EquationRenderer latex={String.raw`\textbf{Theorem: } \mu^{(t)}(x) = \frac{1}{t}\,\mathbb{1}_{[0,t]}(x) \text{ 는 시간 척도 등변성을 만족하는 유일한 측도}`} />
            </div>
            <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-violet-200 bg-violet-50 p-3 dark:border-violet-800 dark:bg-violet-900/20">
                <p className="mb-1 text-xs font-bold text-violet-700 dark:text-violet-300">시간 하이퍼파라미터 불필요</p>
                <p className="text-xs text-violet-600 dark:text-violet-400">
                  LegT의 theta나 LagT의 감쇠율 같은 시간 관련 하이퍼파라미터가 필요 없습니다.
                </p>
              </div>
              <div className="rounded-lg border border-violet-200 bg-violet-50 p-3 dark:border-violet-800 dark:bg-violet-900/20">
                <p className="mb-1 text-xs font-bold text-violet-700 dark:text-violet-300">길이 일반화</p>
                <p className="text-xs text-violet-600 dark:text-violet-400">
                  짧은 시퀀스로 훈련하고 긴 시퀀스에 일반화(length generalization)할 수 있습니다.
                </p>
              </div>
              <div className="rounded-lg border border-violet-200 bg-violet-50 p-3 dark:border-violet-800 dark:bg-violet-900/20">
                <p className="mb-1 text-xs font-bold text-violet-700 dark:text-violet-300">다중 시간 스케일 적응</p>
                <p className="text-xs text-violet-600 dark:text-violet-400">
                  다양한 시간 스케일의 패턴이 혼합된 시퀀스에서도 하나의 모델로 포착 가능합니다.
                </p>
              </div>
            </div>
            <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 dark:border-indigo-800 dark:bg-indigo-900/20">
              <p className="text-xs leading-relaxed text-indigo-800 dark:text-indigo-200">
                <span className="font-bold">직관적 이해:</span> 음성 인식 모델을 16kHz로 학습했는데 추론 시 8kHz 데이터가 들어온다고 합시다.
                LegT/LagT는 윈도우 크기나 감쇠율이 고정되어 시간 스케일 변화에 취약합니다.
                반면 LegS의 1/t 균일 측도는 시간을 2배로 늘려도 &ldquo;전체 이력의 균일 근사&rdquo;를 유지합니다.
                이것이 LegS가 S4와 Mamba의 A 초기화로 채택된 결정적 이유입니다.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* ── 4. 인터랙티브 시각화 ────────────────────────────── */}
      <section id="hippo-viz" className="scroll-mt-20">
        <SectionHeading icon={<Layers className="h-5 w-5" />} title="인터랙티브 시각화" collapsed={!!col['hippo-viz']} onToggle={() => toggle('hippo-viz')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['hippo-viz'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <p className="mb-4 text-sm text-gray-700 dark:text-gray-300">
              아래 인터랙티브 시각화에서 세 가지 측도의 형태와 그래디언트 감쇠를 직접 비교해 보세요.
              슬라이더를 조절하면 시간 t, 윈도우 크기 theta, 시퀀스 길이 T, RNN 감쇠율 lambda를 실시간으로 변경할 수 있습니다.
            </p>
            <HiPPOMeasureViz />
            <div className="mt-4 rounded-lg border border-purple-200 bg-purple-50 px-4 py-3 dark:border-purple-800 dark:bg-purple-900/20">
              <p className="text-xs font-semibold text-purple-700 dark:text-purple-300">관찰 가이드</p>
              <ul className="mt-2 space-y-1.5 text-xs text-purple-600 dark:text-purple-400">
                <li className="flex items-start gap-1.5">
                  <span className="mt-0.5 flex-shrink-0 font-bold">1.</span>
                  <span><span className="font-semibold">측도 형태 비교:</span> LegS는 시간에 따라 높이가 1/t로 낮아지지만 범위가 [0, t] 전체로 넓어집니다. LegT는 동일한 높이 1/theta를 유지하되 윈도우만 이동합니다. LagT는 현재 근처에서 피크를 보이고 급격히 감쇠합니다.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="mt-0.5 flex-shrink-0 font-bold">2.</span>
                  <span><span className="font-semibold">시퀀스 길이를 1000까지 늘려 보세요:</span> lambda = 0.99인 &ldquo;좋은&rdquo; RNN도 그래디언트가 사실상 0이 되지만, HiPPO는 여전히 학습 가능한 크기를 유지합니다.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="mt-0.5 flex-shrink-0 font-bold">3.</span>
                  <span><span className="font-semibold">lambda 슬라이더 실험:</span> lambda를 0.999로 올려도 T=1000에서 RNN 그래디언트는 약 0.37인 반면, T=5000이면 다시 0.007로 급락합니다. 다항식 감쇠의 안정성과 대비됩니다.</span>
                </li>
              </ul>
            </div>
          </Card>
        </div>
      </section>

      {/* ── 5. 핵심 수식 모음 ───────────────────────────────── */}
      <section id="hippo-equations" className="scroll-mt-20">
        <SectionHeading icon={<Hash className="h-5 w-5" />} title="핵심 수식 모음" collapsed={!!col['hippo-equations']} onToggle={() => toggle('hippo-equations')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['hippo-equations'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="space-y-3">
              <EqCard idx={1} name="최적 투영 정의" color="purple"
                latex={String.raw`c_n(t) = \left\langle f_{\leq t},\, g_n \right\rangle_{\mu^{(t)}} = \int f(x)\,g_n(x)\,d\mu^{(t)}(x)`}
                description="입력 함수 f를 측도 mu(t) 하에서 n번째 직교 다항식 g_n에 투영한 계수입니다. 상태 벡터 c(t)의 n번째 원소가 곧 이 투영 계수이며, N개의 계수가 과거 이력 f(s)의 최적 N차 다항식 근사를 구성합니다. 힐베르트 공간 이론에 의해 직교 투영이 L2 노름을 최소화하는 최적 근사임이 보장됩니다." />

              <EqCard idx={2} name="HiPPO ODE (일반형)" color="indigo"
                latex={String.raw`\frac{d}{dt}\,c(t) = A(t)\,c(t) + B(t)\,f(t)`}
                description="투영 계수 c(t)의 시간 발전을 기술하는 연립 ODE입니다. A(t)는 기존 계수를 갱신하는 N x N 전이 행렬, B(t)는 새 입력 f(t)를 반영하는 N x 1 입력 벡터입니다. 이 두 행렬은 측도 mu(t)와 직교 다항식 기저에 의해 유일하게 결정됩니다. 즉, 측도 선택이 곧 메모리 동역학(A 행렬)을 결정합니다." />

              <EqCard idx={3} name="HiPPO-LegS 전이행렬 A" color="green"
                latex={String.raw`A_{nk} = -\begin{cases} (2n+1)^{1/2}(2k+1)^{1/2} & \text{if } n > k \\ n+1 & \text{if } n = k \\ 0 & \text{if } n < k \end{cases}`}
                description="LegS 측도에서 유도된 A 행렬의 원소 공식입니다. 하삼각(lower triangular) + 대각 구조를 가지며, n번째 계수가 자기보다 낮은 차수의 계수에만 의존함을 의미합니다. 대각 원소 -(n+1)은 각 계수의 감쇠율을, 비대각 원소는 계수 간 결합을 결정합니다. 이 특정 A 행렬이 S4의 HiPPO 초기화에 직접 사용됩니다." />

              <EqCard idx={4} name="그래디언트 바운드: 다항식 vs. 지수" color="amber"
                latex={String.raw`\left\|\frac{\partial c(t)}{\partial f(s)}\right\| = \Theta\!\left(\frac{1}{t}\right) \quad\text{vs.}\quad \left\|\frac{\partial h_t}{\partial h_s}\right\|_{\text{RNN}} = O(\lambda^{t-s})`}
                description="HiPPO 프레임워크의 가장 중요한 이론적 결과입니다. HiPPO-LegS의 그래디언트는 다항식 Theta(1/t)로 감쇠하여, 아무리 먼 과거의 입력이라도 학습 신호가 도달합니다. 반면 기존 RNN은 |lambda| < 1이면 지수적으로 소실됩니다. t=1000에서 RNN(lambda=0.95)은 10^{-22}이지만 HiPPO는 10^{-3}입니다. 이 차이가 장거리 벤치마크에서 HiPPO 기반 모델의 성공을 설명합니다." />
            </div>
          </Card>
        </div>
      </section>

      {/* ── 6. 후속 연구에 미친 영향 ───────────────────────── */}
      <section id="hippo-impact" className="scroll-mt-20">
        <SectionHeading icon={<Zap className="h-5 w-5" />} title="후속 연구에 미친 영향" collapsed={!!col['hippo-impact']} onToggle={() => toggle('hippo-impact')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['hippo-impact'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              HiPPO는 단독 논문으로서도 의미가 크지만, 진정한 영향력은 이후 상태 공간 모델(SSM)
              혁명의 수학적 토대가 되었다는 점입니다. 아래 표에서 HiPPO의 A 행렬이 어떻게 계승되었는지를 확인하세요:
            </p>
            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-800 dark:bg-indigo-900/20">
                <p className="mb-1 text-xs font-bold text-indigo-700 dark:text-indigo-300">S4 (Structured State Spaces)</p>
                <p className="text-xs text-indigo-600 dark:text-indigo-400">
                  HiPPO-LegS A 행렬 + NPLR(Normal Plus Low-Rank) 분해로 O(N log N) 병렬 컨볼루션 구현.
                  Sequential MNIST에서 60% (랜덤 A) → 98% (HiPPO A)로 도약.
                  Long Range Arena에서 Transformer를 처음으로 압도.
                </p>
              </div>
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
                <p className="mb-1 text-xs font-bold text-green-700 dark:text-green-300">Mamba (Selective SSM)</p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  선택적 상태 공간 모델의 A 초기화 = HiPPO-LegS.
                  입력 의존적 B, C, Delta로 확장하되, A의 구조적 귀납적 편향은 HiPPO에서 계승.
                  Transformer 대비 5배 빠른 추론, GPT-3 수준 언어 모델링 달성.
                </p>
              </div>
            </div>

            <p className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">HiPPO에서 시작된 SSM 계보</p>
            <div className="mb-5 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">연도</th>
                    <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">모델</th>
                    <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">학회</th>
                    <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">HiPPO와의 관계</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { y: '2020', m: 'HiPPO', v: 'NeurIPS 2020', rel: '최적 다항식 투영, A 행렬 유도, 그래디언트 바운드 증명', hi: true },
                    { y: '2021', m: 'LSSL', v: 'NeurIPS 2021', rel: 'HiPPO ODE를 SSM 레이어로 구현, 딥러닝 통합 시작', hi: false },
                    { y: '2022', m: 'S4', v: 'ICLR 2022', rel: 'HiPPO-LegS A + NPLR 분해로 효율적 장거리 모델', hi: true },
                    { y: '2022', m: 'S4D / DSS', v: 'ICML 2022', rel: 'HiPPO A의 대각 근사, 구현 단순화', hi: false },
                    { y: '2023', m: 'H3', v: 'ICLR 2023', rel: 'SSM + 어텐션 하이브리드, 언어 모델링 확장', hi: false },
                    { y: '2023', m: 'Mamba (S6)', v: 'arXiv 2023', rel: 'HiPPO A 초기화 + 입력 의존 선택 메커니즘', hi: true },
                  ].map((r, i) => (
                    <tr key={i} className={r.hi ? 'bg-purple-50 dark:bg-purple-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}>
                      <td className="px-3 py-2 text-center font-mono font-semibold text-gray-600 dark:text-gray-400">{r.y}</td>
                      <td className={`px-3 py-2 font-medium ${r.hi ? 'text-purple-700 dark:text-purple-300' : 'text-gray-700 dark:text-gray-300'}`}>{r.m}</td>
                      <td className="px-3 py-2 text-gray-500 dark:text-gray-400">{r.v}</td>
                      <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{r.rel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rounded-lg border border-purple-200 bg-purple-50 px-4 py-3 dark:border-purple-800 dark:bg-purple-900/20">
              <p className="text-xs font-semibold text-purple-700 dark:text-purple-300">핵심 관찰: A 초기화의 결정적 중요성</p>
              <p className="mt-1 text-xs leading-relaxed text-purple-600 dark:text-purple-400">
                S4 논문에서 가장 극적인 실험은 A 행렬만 HiPPO-LegS로 교체한 것입니다.
                랜덤 초기화 A로는 Sequential MNIST에서 ~60%에 그치지만,
                HiPPO-LegS A로 초기화하면 98%를 달성합니다.
                모델 구조는 동일하고 A의 초기값만 바꿨을 뿐인데 38% 포인트 향상.
                이는 HiPPO의 수학적 구조가 얼마나 강력한 귀납적 편향을 제공하는지를 보여줍니다.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* ── 7. 자기 점검 ───────────────────────────────────── */}
      <section id="hippo-quiz" className="scroll-mt-20">
        <SectionHeading icon={<FlaskConical className="h-5 w-5" />} title="자기 점검 (연구자 수준)" />
        <Card>
          <QuizSection color="purple" questions={[
            {
              q: 'HiPPO가 "과거를 어떻게 기억할 것인가?"를 수학적으로 어떻게 정의하며, 이것이 전이행렬 A를 어떻게 결정하는지 설명하라.',
              a: 'HiPPO는 측도 mu(t)(x)로 "시점 x의 과거 정보가 현재 t에서 얼마나 중요한가"를 정의합니다. 입력 함수 f를 이 측도 하에서 N개 직교 다항식 {g_n}에 투영하면, 투영 계수 c(t)의 시간 발전이 ODE dc/dt = A(t)c(t) + B(t)f(t)로 기술됩니다. 여기서 A(t)와 B(t)는 측도 mu(t)와 직교 다항식 기저에 의해 유일하게 결정됩니다. 즉, 측도 선택이 곧 메모리 동역학(A 행렬)을 결정합니다.',
            },
            {
              q: 'HiPPO-LegS의 시간 척도 등변성(timescale equivariance)이란 무엇이며, 왜 이것이 실용적으로 중요한가?',
              a: '시간 척도 등변성은 입력 함수 f(t)를 f(alpha*t)로 시간 축 스케일링하면 출력 계수도 동일하게 스케일링되는 성질입니다. 수학적으로 mu(t) = 1/t * 1_{[0,t]}가 이 성질을 만족하는 유일한 측도입니다. 실용적 중요성: (1) 시간 윈도우 theta 같은 하이퍼파라미터가 불필요, (2) 짧은 시퀀스로 훈련하고 긴 시퀀스에 일반화 가능(length generalization), (3) 다양한 시간 스케일의 패턴을 하나의 모델로 포착 가능.',
            },
            {
              q: 'HiPPO-LegS의 그래디언트가 Theta(1/t)로 다항식 감쇠하는 것이, 기존 RNN의 lambda^t 지수 감쇠와 비교하여 장거리 의존성 학습에 미치는 구체적 차이는?',
              a: 'RNN에서 lambda < 1이면 그래디언트가 lambda^t로 지수 소실하여 t=100만 되어도 0.95^100 = 0.006으로 사실상 학습 불가합니다. 반면 HiPPO-LegS는 1/t이므로 t=100에서도 0.01로 여전히 유의미한 기울기가 전달됩니다. t=1000에서 RNN은 10^{-22}이지만 HiPPO는 10^{-3}입니다. 이 차이가 Sequential MNIST(784 스텝), PathX(16384 스텝) 등 장거리 벤치마크에서 HiPPO 기반 모델의 성공을 설명합니다.',
            },
            {
              q: 'LegT 측도(슬라이딩 윈도우)가 LMU(Legendre Memory Unit)와 동치임을 설명하고, LagT에서 N=1이면 GRU 게이팅과 동치가 되는 이유를 설명하라.',
              a: 'LegT는 mu(t) = 1/theta * 1_{[t-theta, t]}로 최근 theta 시간만 균일 기억합니다. 이 측도에서 유도한 A, B 행렬이 Legendre Memory Unit(Voelker et al., 2019)의 상태 전이 행렬과 정확히 일치합니다. LagT는 mu(t) = e^{-(t-x)}로 지수 감쇠 가중이며, N=1(상태 1개)로 축소하면 dc/dt = -c + f(t)가 됩니다. 이를 이산화하면 c_t = (1-alpha)c_{t-1} + alpha*f_t 형태로, GRU의 업데이트 게이트 z_t와 동일한 지수 이동 평균 구조가 됩니다.',
            },
          ]} />
        </Card>
      </section>

    </div>
    </GlossaryText>
  );
}
