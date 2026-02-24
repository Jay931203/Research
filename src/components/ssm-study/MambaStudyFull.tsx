'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  BookOpen,
  BrainCircuit,
  ChevronDown,
  Cpu,
  FlaskConical,
  GraduationCap,
  Hash,
  Layers,
  Zap,
} from 'lucide-react';
import katex from 'katex';
import GlossaryText from '@/components/glossary/GlossaryText';
import MambaSSMCoreViz from '@/components/my-research/infographics/MambaSSMCoreViz';
import CnnVsSsmViz from '@/components/my-research/infographics/CnnVsSsmViz';
import SSMExponentialModeViz from '@/components/my-research/infographics/SSMExponentialModeViz';

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
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">{number}</span>
      <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">{title}</h4>
    </div>
  );
}

function EqCard({ idx, name, latex, description, color = 'emerald' }: {
  idx: number; name: string; latex: string; description: string; color?: string;
}) {
  const [open, setOpen] = useState(false);
  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
    green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    teal: 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800',
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800',
    amber: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
  };
  const badgeMap: Record<string, string> = {
    emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    green: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    teal: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
    indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  };
  return (
    <div className="cursor-pointer rounded-xl border border-gray-200 bg-gray-50/50 p-4 transition hover:border-emerald-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-emerald-700" onClick={() => setOpen(v => !v)}>
      <div className="mb-2 flex items-center gap-2">
        <span className={`rounded px-2 py-0.5 text-xs font-bold ${badgeMap[color] ?? badgeMap.emerald}`}>Eq. {idx}</span>
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{name}</span>
        <ChevronDown className={`ml-auto h-4 w-4 text-gray-400 transition-transform dark:text-gray-500 ${open ? 'rotate-180' : ''}`} />
      </div>
      <div className="overflow-x-auto py-2 text-gray-900 dark:text-gray-100"><EquationRenderer latex={latex} /></div>
      {open ? (
        <div className={`mt-3 rounded-lg border px-4 py-3 ${colorMap[color] ?? colorMap.emerald}`}>
          <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">{description}</p>
        </div>
      ) : (
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">클릭하여 상세 설명 보기</p>
      )}
    </div>
  );
}

function QuizSection({ questions, color = 'emerald' }: { questions: { q: string; a: string }[]; color?: string }) {
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const toggle = (i: number) => setRevealed(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; });
  const bgMap: Record<string, string> = {
    emerald: 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20',
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
            <div className={`mx-4 mb-4 rounded-lg border px-4 py-3 ${bgMap[color] ?? bgMap.emerald}`}>
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

export default function MambaStudyFull() {
  const [col, setCol] = useState<Record<string, boolean>>({});
  const toggle = useCallback((id: string) => setCol(c => ({ ...c, [id]: !c[id] })), []);

  return (
    <GlossaryText>
    <div className="space-y-6">

      {/* ── 1. Overview ───────────────────────────────────────── */}
      <section id="mamba-overview" className="scroll-mt-20">
        <div className="overflow-hidden rounded-xl shadow-sm">
          <div className="bg-gradient-to-br from-emerald-700 via-green-600 to-teal-600 p-6 pb-8">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">arXiv 2312.00752</span>
              <span className="rounded-full bg-emerald-300/90 px-3 py-1 text-xs font-bold text-emerald-900">선택적 상태공간 모델</span>
              <span className="rounded-full bg-teal-300/90 px-3 py-1 text-xs font-bold text-teal-900">Linear-Time</span>
            </div>
            <h2 className="text-xl font-bold leading-snug text-white sm:text-2xl">
              Mamba: Linear-Time Sequence Modeling with Selective State Spaces
            </h2>
            <p className="mt-3 text-sm text-emerald-200">
              Gu, Dao (Carnegie Mellon / Princeton)
            </p>
          </div>
          <div className="bg-white p-6 dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
            <p className="leading-relaxed text-gray-700 dark:text-gray-300">
              S4의 시간 불변(LTI) 한계를 돌파한 <span className="font-semibold text-emerald-700 dark:text-emerald-300">선택적 상태공간 모델</span>.
              핵심 혁신: (1) <span className="font-semibold text-emerald-700 dark:text-emerald-300">{'\u0394'}, B, C를 입력 의존적으로 만들어</span> &quot;어떤 정보를 기억하고 잊을지&quot;를 동적으로 결정,
              (2) <span className="font-semibold text-emerald-700 dark:text-emerald-300">하드웨어 인식 병렬 스캔 알고리즘</span>으로 선택 메커니즘의 효율적 구현,
              (3) 간결한 아키텍처(SSM + MLP 융합)로 Transformer의 MHA+FFN 대체.
            </p>
            <p className="mt-3 leading-relaxed text-gray-700 dark:text-gray-300">
              GPT-3급 언어 모델링에서 Transformer와 동등한 성능을 <span className="font-semibold text-emerald-700 dark:text-emerald-300">O(L) 복잡도</span>로 달성.
              추론 시 5배 빠른 처리량, 메모리는 시퀀스 길이와 무관한 고정 크기.
              DNA, 오디오 등 다양한 모달리티에서도 SOTA 수준의 성능을 보입니다.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {['선택적 SSM', '하드웨어 인식 알고리즘', '입력 의존적 동역학', '병렬 스캔', 'Transformer 대체'].map(tag => (
                <span key={tag} className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Background: S4의 근본적 한계 ──────────────────── */}
      <section id="mamba-problem" className="scroll-mt-20">
        <SectionHeading icon={<BrainCircuit className="h-5 w-5" />} title="배경: S4의 근본적 한계" collapsed={!!col['mamba-problem']} onToggle={() => toggle('mamba-problem')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['mamba-problem'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="1.1" title="LTI(선형 시간 불변)의 한계" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              S4의 A, B, C, {'\u0394'}는 모든 입력에 대해 <span className="font-semibold text-red-600 dark:text-red-400">동일합니다</span>.
              학습이 끝나면 고정된 컨볼루션 커널로 동작합니다.
              이는 &quot;무엇이 중요한지&quot;를 입력 내용에 따라 판단할 수 없음을 의미합니다.
            </p>
            <div className="mb-4 overflow-x-auto rounded-lg bg-emerald-50 p-3 dark:bg-emerald-900/20">
              <EquationRenderer latex={String.raw`h_t = \bar{A}\, h_{t-1} + \bar{B}\, x_t, \quad y_t = C\, h_t \quad \text{(\(\bar{A}, \bar{B}, C\) 고정 — 입력 무관)}`} />
            </div>
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              예시를 들어보겠습니다: &quot;교수님이 말씀하셨다: [중요한 내용]. 시험에 나올까요?&quot;라는 문장에서,
              S4는 [중요한 내용] 부분을 특별히 기억할 메커니즘이 없습니다.
              모든 토큰이 동일한 가중치로 상태에 기록되고 동일한 비율로 감쇠합니다.
            </p>
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 dark:border-red-800 dark:bg-red-900/20">
              <p className="text-xs font-semibold text-red-700 dark:text-red-300">Selective Copying 태스크에서의 실패</p>
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                입력: &quot;A _ _ B _ _ C _ _&quot; (밑줄은 무시, A/B/C만 순서대로 출력).
                S4 정확도: <span className="font-bold">~18%</span> (거의 랜덤).
                Mamba 정확도: <span className="font-bold text-emerald-700 dark:text-emerald-300">&gt;97%</span>.
                고정 파라미터로는 &quot;이 토큰은 기억하고 저 토큰은 건너뛰자&quot;는 판단이 구조적으로 불가능합니다.
              </p>
            </div>

            <SubSectionHeading number="1.2" title="선택성 vs. 효율성 트레이드오프" />
            <p className="mb-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              기존 시퀀스 모델링은 선택성(표현력)과 효율성 사이에서 양자택일을 강요했습니다.
              Mamba의 핵심 질문: <span className="font-semibold text-emerald-700 dark:text-emerald-300">&quot;선택적이면서도 선형 시간을 유지할 수 있는가?&quot;</span>
            </p>
            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-900/10">
                <p className="mb-1 text-xs font-bold text-red-700 dark:text-red-300">Transformer</p>
                <p className="text-xs text-red-600 dark:text-red-400">
                  완전한 선택성 (어텐션)<br/>
                  모든 토큰 쌍을 명시적 비교<br/>
                  O(L&sup2;) 비용<br/>
                  긴 시퀀스에서 비실용적
                </p>
              </div>
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/40 dark:bg-blue-900/10">
                <p className="mb-1 text-xs font-bold text-blue-700 dark:text-blue-300">S4 (LTI SSM)</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  효율적: O(L)<br/>
                  FFT 컨볼루션 가능<br/>
                  선택성 없음 (고정 커널)<br/>
                  내용 기반 추론 불가
                </p>
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/40 dark:bg-emerald-900/10">
                <p className="mb-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">Mamba (선택적 SSM)</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                  선택성 + O(L) &mdash; &quot;두 마리 토끼&quot;<br/>
                  입력 의존적 파라미터<br/>
                  병렬 스캔으로 효율 확보<br/>
                  Transformer급 성능
                </p>
              </div>
            </div>
            <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800 dark:bg-emerald-900/20">
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Induction Heads 태스크</p>
              <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                &quot;A B ... A &rarr; ?&quot; 패턴에서 B를 예측하는 능력.
                이전에 A 다음에 나온 토큰을 기억하는 것으로, in-context learning의 핵심 메커니즘입니다.
                S4는 고정 파라미터로 &quot;A라는 특정 내용 뒤에 온 것&quot;을 조건부로 기억할 수 없습니다.
                Mamba는 A를 만나면 {'\u0394'}를 키워 상태를 갱신하고 B 정보를 기록하는 패턴을 자동으로 학습합니다.
              </p>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-900/20">
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">핵심 도전</p>
              <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                선택적이면서도 컨볼루션 커널을 유지할 수 있는가? 답: <span className="font-bold">불가능</span>.
                입력 의존적 파라미터는 커널이 매 입력마다 달라지므로 FFT 컨볼루션이 깨집니다.
                완전히 새로운 접근(병렬 스캔 + GPU 메모리 최적화)이 필요합니다.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* ── 3. 핵심 아이디어: 선택적 상태공간 모델 ────────────── */}
      <section id="mamba-selection" className="scroll-mt-20">
        <SectionHeading icon={<GraduationCap className="h-5 w-5" />} title="핵심 아이디어: 선택적 상태공간 모델" collapsed={!!col['mamba-selection']} onToggle={() => toggle('mamba-selection')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['mamba-selection'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="2.1" title="입력 의존적 파라미터" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              S4에서 {'\u0394'}, B, C는 고정 파라미터입니다.
              Mamba는 이를 <span className="font-semibold text-emerald-700 dark:text-emerald-300">입력 x의 함수</span>로 바꿉니다:
            </p>
            <div className="mb-3 overflow-x-auto rounded-lg bg-emerald-50 p-3 dark:bg-emerald-900/20">
              <EquationRenderer latex={String.raw`\Delta(x) = \mathrm{softplus}\!\left(\mathrm{Linear}(x)\right) \quad \text{— 입력에 따른 "시간 스케일" 조절}`} />
            </div>
            <div className="mb-3 overflow-x-auto rounded-lg bg-emerald-50 p-3 dark:bg-emerald-900/20">
              <EquationRenderer latex={String.raw`B(x) = \mathrm{Linear}(x) \quad \text{— "어떤 입력을 상태에 기록할지" 선택}`} />
            </div>
            <div className="mb-4 overflow-x-auto rounded-lg bg-emerald-50 p-3 dark:bg-emerald-900/20">
              <EquationRenderer latex={String.raw`C(x) = \mathrm{Linear}(x) \quad \text{— "상태의 어떤 부분을 출력할지" 선택}`} />
            </div>
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              이 세 파라미터가 입력에 의존적이 되면서, SSM은 더 이상 LTI가 아닙니다.
              매 시간 스텝마다 <span className="font-semibold text-emerald-700 dark:text-emerald-300">다른 동역학</span>으로 동작하여
              내용 기반 선택이 가능해집니다.
            </p>
            <div className="mb-5 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-emerald-50 dark:bg-emerald-900/20">
                    <th className="px-3 py-2 text-left font-bold text-emerald-700 dark:text-emerald-300">파라미터</th>
                    <th className="px-3 py-2 text-center font-bold text-emerald-700 dark:text-emerald-300">S4 (고정)</th>
                    <th className="px-3 py-2 text-center font-bold text-emerald-700 dark:text-emerald-300">Mamba (입력 의존)</th>
                    <th className="px-3 py-2 text-left font-bold text-emerald-700 dark:text-emerald-300">차원</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { param: '\u0394', s4: '(D,) 고정', mamba: 'softplus(Linear(x))', dim: '(B, L, D)' },
                    { param: 'B', s4: '(N,) 고정', mamba: 'Linear_N(x)', dim: '(B, L, N)' },
                    { param: 'C', s4: '(N,) 고정', mamba: 'Linear_N(x)', dim: '(B, L, N)' },
                    { param: 'A', s4: '(D, N) 고정', mamba: '(D, N) 고정 (HiPPO)', dim: '(D, N)' },
                  ].map((r, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-3 py-2 font-mono font-semibold text-emerald-600 dark:text-emerald-400">{r.param}</td>
                      <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">{r.s4}</td>
                      <td className="px-3 py-2 text-center font-semibold text-emerald-700 dark:text-emerald-300">{r.mamba}</td>
                      <td className="px-3 py-2 font-mono text-gray-500 dark:text-gray-400">{r.dim}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <SubSectionHeading number="2.2" title="선택 메커니즘의 직관" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              {'\u0394'}(x)는 이산화 스텝 크기이지만, 실질적으로 <span className="font-semibold text-emerald-700 dark:text-emerald-300">게이팅 메커니즘</span>입니다.
              연속 시간 동역학에서 자연스럽게 유도된다는 점이 기존 RNN 게이트와의 핵심 차이입니다:
            </p>
            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-900/20">
                <p className="mb-1 text-xs font-bold text-orange-700 dark:text-orange-300">{'\u0394'}가 클 때 (중요한 토큰)</p>
                <p className="text-xs text-orange-600 dark:text-orange-400">
                  exp({'\u0394'}*A) &rarr; 0 (A &lt; 0이므로)<br/>
                  과거 상태 h_{'{t-1}'} 거의 소멸<br/>
                  현재 입력을 상태에 <span className="font-semibold">강하게 기록</span><br/>
                  &quot;이 토큰은 중요하니 상태를 갱신하자&quot;
                </p>
              </div>
              <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-4 dark:border-cyan-800 dark:bg-cyan-900/20">
                <p className="mb-1 text-xs font-bold text-cyan-700 dark:text-cyan-300">{'\u0394'}가 작을 때 (패딩, 불필요한 토큰)</p>
                <p className="text-xs text-cyan-600 dark:text-cyan-400">
                  exp({'\u0394'}*A) &rarr; I (항등 행렬에 근접)<br/>
                  과거 상태 h_{'{t-1}'} 거의 보존<br/>
                  현재 입력을 <span className="font-semibold">무시</span><br/>
                  &quot;이 토큰은 노이즈니 건너뛰자&quot;
                </p>
              </div>
            </div>
            <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800 dark:bg-emerald-900/20">
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">LSTM forget gate와의 연결</p>
              <div className="mt-2 overflow-x-auto">
                <EquationRenderer latex={String.raw`\exp(-\Delta(x) \cdot a_i) \;\leftrightarrow\; f_{t,i} \quad \text{(forget gate per dimension)}`} />
              </div>
              <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">
                {'\u0394'}는 게이팅 메커니즘과 유사하지만, 연속 시간 동역학에서 유도됩니다.
                LSTM은 시그모이드 게이트를 수동 설계하지만, Mamba는 이산화 과정에서 자연스럽게 게이트가 나타납니다.
                HiPPO 초기화와 결합되어 장거리 의존성 학습이 더 안정적입니다.
              </p>
            </div>

            <SubSectionHeading number="2.3" title="컨볼루션 모드 포기" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              입력 의존적 파라미터는 결정적인 결과를 낳습니다:
              커널이 입력마다 달라지므로 <span className="font-semibold text-red-600 dark:text-red-400">FFT 컨볼루션이 불가능</span>합니다.
              S4의 핵심 효율성 전략이 깨지는 것입니다.
            </p>
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              대안: <span className="font-semibold text-emerald-700 dark:text-emerald-300">병렬 스캔(parallel scan)</span> 알고리즘.
              재귀를 결합적(associative) 연산의 prefix sum으로 변환합니다:
            </p>
            <div className="mb-4 overflow-x-auto rounded-lg bg-teal-50 p-3 dark:bg-teal-900/20">
              <EquationRenderer latex={String.raw`x_k = \bar{A}(x_k)\, x_{k-1} + \bar{B}(x_k)\, u_k \quad \Rightarrow \quad \text{prefix sum으로 병렬화}`} />
            </div>
            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              이 전환이 Mamba의 두 번째 핵심 혁신입니다.
              선택 메커니즘(첫 번째 혁신)을 효율적으로 구현할 수 있게 해주는 알고리즘적 돌파구입니다.
            </p>
          </Card>
        </div>
      </section>

      {/* ── 4. 인터랙티브 시각화 ─────────────────────────────── */}
      <section id="mamba-viz" className="scroll-mt-20">
        <SectionHeading icon={<Zap className="h-5 w-5" />} title="인터랙티브 시각화" collapsed={!!col['mamba-viz']} onToggle={() => toggle('mamba-viz')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['mamba-viz'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="space-y-6">
              <div>
                <h4 className="mb-2 text-sm font-bold text-gray-700 dark:text-gray-300">고정 vs. 선택적 {'\u0394'} 비교</h4>
                <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
                  S4(고정 {'\u0394'})와 Mamba(선택적 {'\u0394'})의 상태 갱신 과정을 비교합니다.
                  CSI 앵글 도메인 예시에서 선택 메커니즘이 중요 정보를 어떻게 구분하는지 확인하세요.
                </p>
                <MambaSSMCoreViz />
              </div>
              <div>
                <h4 className="mb-2 text-sm font-bold text-gray-700 dark:text-gray-300">CNN vs. SSM 메모리 특성</h4>
                <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
                  CNN의 하드 로컬리티(고정 수용 영역)와 SSM의 소프트 메모리(지수 감쇠)를 비교합니다.
                  위치 슬라이더를 움직여 두 모델의 정보 접근 범위 차이를 체험하세요.
                </p>
                <CnnVsSsmViz />
              </div>
              <div>
                <h4 className="mb-2 text-sm font-bold text-gray-700 dark:text-gray-300">지수 모드 분해</h4>
                <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
                  SSM 상태 행렬 A의 고유값이 결정하는 지수적 감쇠/진동 모드.
                  모드 수를 조절하며 근사 품질 변화를 관찰하세요.
                </p>
                <SSMExponentialModeViz />
              </div>
            </div>

            <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800 dark:bg-emerald-900/20">
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">관찰 노트</p>
              <p className="mt-1 text-xs leading-relaxed text-emerald-600 dark:text-emerald-400">
                세 시각화를 통해 Mamba의 핵심 구조를 직관적으로 이해할 수 있습니다:
                (1) 선택적 {'\u0394'}가 &quot;어떤 정보를 기억할지&quot;를 결정하는 게이팅 역할,
                (2) CNN과 달리 SSM은 이론적으로 무한한 컨텍스트를 고정 크기 상태에 압축,
                (3) HiPPO 초기화의 지수 모드가 장기 메모리를 가능하게 하는 수학적 기반.
                이 세 요소가 결합되어 Mamba의 선택적 시퀀스 모델링이 완성됩니다.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* ── 5. 하드웨어 인식 알고리즘 ────────────────────────── */}
      <section id="mamba-hardware" className="scroll-mt-20">
        <SectionHeading icon={<Cpu className="h-5 w-5" />} title="하드웨어 인식 알고리즘" collapsed={!!col['mamba-hardware']} onToggle={() => toggle('mamba-hardware')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['mamba-hardware'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="4.1" title="병렬 스캔 (Parallel Associative Scan)" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              순차 재귀 O(L)을 <span className="font-semibold text-emerald-700 dark:text-emerald-300">work O(L) + span O(log L)</span>의
              병렬 알고리즘으로 변환합니다. 재귀를 결합적(associative) 연산으로 정의하면
              prefix sum처럼 이진 트리 구조로 병렬 처리가 가능합니다.
            </p>
            <div className="mb-4 overflow-x-auto rounded-lg bg-emerald-50 p-3 dark:bg-emerald-900/20">
              <EquationRenderer latex={String.raw`(A_i, b_i) \bullet (A_j, b_j) = (A_j \cdot A_i,\; A_j \cdot b_i + b_j) \quad \text{(결합법칙 성립)}`} />
            </div>
            <p className="mb-5 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              GPU의 CUDA kernel로 구현하며, warp-level 병렬성을 활용합니다.
              P개 프로세서에서 O(L/P + log L) 시간에 처리됩니다.
              순차 재귀 대비 수십 배 속도 향상을 달성합니다.
            </p>

            <SubSectionHeading number="4.2" title="커널 퓨전 & SRAM 활용" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              <span className="font-semibold text-emerald-700 dark:text-emerald-300">FlashAttention의 아이디어</span>를 SSM에 적용합니다.
              GPU의 메모리 계층(HBM vs. SRAM)을 적극 활용하여 데이터 이동을 최소화합니다.
            </p>
            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800 dark:bg-emerald-900/20">
                <p className="mb-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">HBM &harr; SRAM IO 최소화</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                  이산화, 선택, 스캔을 하나의 커널에서 처리.
                  중간 상태(BLD&times;N)를 HBM에 쓰지 않음.
                </p>
              </div>
              <div className="rounded-lg border border-teal-200 bg-teal-50 p-3 dark:border-teal-800 dark:bg-teal-900/20">
                <p className="mb-1 text-xs font-bold text-teal-700 dark:text-teal-300">SRAM에서 직접 처리</p>
                <p className="text-xs text-teal-600 dark:text-teal-400">
                  선택적 스캔의 중간 상태를 SRAM에 유지.
                  메모리 대역폭 병목 해소.
                </p>
              </div>
              <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-3 dark:border-cyan-800 dark:bg-cyan-900/20">
                <p className="mb-1 text-xs font-bold text-cyan-700 dark:text-cyan-300">역전파 시 재계산</p>
                <p className="text-xs text-cyan-600 dark:text-cyan-400">
                  Forward의 중간 상태를 저장하지 않음.
                  Backward에서 재계산: 메모리 O(L) &rarr; O(1).
                </p>
              </div>
            </div>
            <p className="mb-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              이 전략은 FlashAttention의 recomputation과 동일한 철학입니다:
              연산을 반복하더라도 메모리 IO를 줄이는 것이 전체 처리량에 더 유리합니다.
              결과적으로 HBM IO가 O(BLD + DN)으로, 나이브 구현의 O(BLDN) 대비 N배 절감됩니다.
            </p>
            <div className="mb-5 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">지표</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">Mamba</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">Transformer (FlashAttention)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { met: 'FLOPs (학습)', mamba: 'O(BLDN)', tf: 'O(BL\u00B2D)' },
                    { met: 'HBM IO', mamba: 'O(BLD + DN)', tf: 'O(BL\u00B2 + BLD)' },
                    { met: '추론 스텝 복잡도', mamba: 'O(BD + DN)', tf: 'O(BLD) (KV cache)' },
                    { met: 'KV Cache 메모리', mamba: 'O(BDN) (고정)', tf: 'O(BLD) (시퀀스 비례 증가)' },
                  ].map((r, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">{r.met}</td>
                      <td className="px-3 py-2 text-center font-mono font-semibold text-emerald-700 dark:text-emerald-300">{r.mamba}</td>
                      <td className="px-3 py-2 text-center font-mono text-gray-600 dark:text-gray-400">{r.tf}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <SubSectionHeading number="4.3" title="Mamba 블록 아키텍처" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              Transformer는 MHA(Multi-Head Attention)와 FFN(Feed-Forward Network) 두 서브블록을 번갈아 쌓습니다.
              Mamba는 이를 <span className="font-semibold text-emerald-700 dark:text-emerald-300">하나의 블록으로 융합</span>합니다:
            </p>
            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                <p className="mb-2 text-xs font-bold text-gray-700 dark:text-gray-300">Transformer 블록</p>
                <div className="flex flex-wrap items-center gap-1 text-xs font-mono text-gray-500 dark:text-gray-400">
                  <span className="rounded bg-gray-200 px-1.5 py-0.5 dark:bg-gray-700">LayerNorm</span>
                  <span>&rarr;</span>
                  <span className="rounded bg-gray-200 px-1.5 py-0.5 dark:bg-gray-700">MHA</span>
                  <span>&rarr;</span>
                  <span className="rounded bg-gray-200 px-1.5 py-0.5 dark:bg-gray-700">Residual</span>
                  <span>&rarr;</span>
                  <span className="rounded bg-gray-200 px-1.5 py-0.5 dark:bg-gray-700">LayerNorm</span>
                  <span>&rarr;</span>
                  <span className="rounded bg-gray-200 px-1.5 py-0.5 dark:bg-gray-700">FFN</span>
                  <span>&rarr;</span>
                  <span className="rounded bg-gray-200 px-1.5 py-0.5 dark:bg-gray-700">Residual</span>
                </div>
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-900/20">
                <p className="mb-2 text-xs font-bold text-emerald-700 dark:text-emerald-300">Mamba 블록</p>
                <div className="flex flex-wrap items-center gap-1 text-xs font-mono text-emerald-600 dark:text-emerald-400">
                  <span className="rounded bg-emerald-100 px-1.5 py-0.5 dark:bg-emerald-900/40">LayerNorm</span>
                  <span>&rarr;</span>
                  <span className="rounded bg-emerald-100 px-1.5 py-0.5 dark:bg-emerald-900/40">Linear</span>
                  <span>&rarr;</span>
                  <span className="rounded bg-emerald-100 px-1.5 py-0.5 dark:bg-emerald-900/40">Conv1D</span>
                  <span>&rarr;</span>
                  <span className="rounded bg-teal-100 px-1.5 py-0.5 font-bold dark:bg-teal-900/40">SSM</span>
                  <span>&rarr;</span>
                  <span className="rounded bg-emerald-100 px-1.5 py-0.5 dark:bg-emerald-900/40">Linear</span>
                  <span>&rarr;</span>
                  <span className="rounded bg-emerald-100 px-1.5 py-0.5 dark:bg-emerald-900/40">Residual</span>
                </div>
              </div>
            </div>
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              MHA와 FFN을 하나의 블록으로 융합하여 파라미터 효율성이 크게 향상됩니다.
              게이트 분기(SiLU 활성화)로 비선형성을 도입합니다:
            </p>
            <div className="overflow-x-auto rounded-lg bg-emerald-50 p-3 dark:bg-emerald-900/20">
              <EquationRenderer latex={String.raw`h = \sigma(\mathrm{Linear}(x)) \odot \mathrm{SSM}(\mathrm{Conv1d}(\mathrm{Linear}(x)))`} />
            </div>
            <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              SSM 분기가 글로벌 시퀀스 의존성을 포착하고, SiLU 게이트 분기가 비선형 변환을 담당합니다.
              Conv1d는 짧은 로컬 패턴을 포착하여 SSM의 글로벌 뷰를 보완합니다.
              QKV 3개 투영이 1개로 통합되고, FFN의 4D 확장이 2D로 축소됩니다.
            </p>
          </Card>
        </div>
      </section>

      {/* ── 6. 핵심 수식 모음 ────────────────────────────────── */}
      <section id="mamba-equations" className="scroll-mt-20">
        <SectionHeading icon={<Hash className="h-5 w-5" />} title="핵심 수식 모음" collapsed={!!col['mamba-equations']} onToggle={() => toggle('mamba-equations')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['mamba-equations'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="space-y-3">
              <EqCard idx={1} name="선택적 상태공간 모델" color="emerald"
                latex={String.raw`x_k = \bar{A}(u_k)\, x_{k-1} + \bar{B}(u_k)\, u_k, \quad y_k = C(u_k)\, x_k`}
                description="S4와 동일한 구조이지만, A_bar, B_bar, C가 입력 u_k에 의존합니다. 매 스텝마다 다른 동역학으로 동작하여 내용 기반 선택이 가능합니다. 중요한 토큰에서는 A_bar ≈ 0으로 상태를 리셋하고 새 정보를 기록하며, 불필요한 토큰에서는 A_bar ≈ I로 과거 상태를 보존합니다." />

              <EqCard idx={2} name="선택적 이산화" color="green"
                latex={String.raw`\Delta(u_k) = \text{softplus}(\text{Linear}(u_k)), \quad \bar{A}(u_k) = \exp(\Delta(u_k) \cdot A)`}
                description="Delta(u_k)가 입력에 따라 달라져, 중요한 입력(큰 Delta)은 상태에 강하게 기록되고, 불필요한 입력(작은 Delta)은 무시됩니다. softplus(log(1+exp(x)))로 양수를 보장합니다. A는 HiPPO로 초기화된 대각 행렬(음수)이므로, 큰 Delta는 exp(Delta*A) -> 0을 만들어 과거를 망각합니다." />

              <EqCard idx={3} name="병렬 스캔" color="teal"
                latex={String.raw`x_k = a_k \cdot x_{k-1} + b_k \quad \Rightarrow \quad x = \text{scan}(\{(a_k, b_k)\}_{k=1}^{L})`}
                description="결합적(associative) 연산의 prefix sum으로 재귀를 병렬화합니다. GPU에서 O(L) work, O(log L) span. FlashAttention 스타일의 커널 퓨전으로 추가 가속합니다. 중간 상태를 SRAM에 유지하고, 역전파 시 재계산하여 메모리를 절약합니다." />

              <EqCard idx={4} name="LSTM 연결" color="amber"
                latex={String.raw`\exp(-\Delta(u_k) \cdot a_i) \;\leftrightarrow\; f_{t,i} \quad \text{(forget gate per dimension)}`}
                description="Mamba의 exp(-Delta*a)는 LSTM의 forget gate f_t와 수학적으로 유사합니다. 차이: Mamba는 연속 시간에서 유도되어 HiPPO 초기화와 자연스럽게 결합되고, 차원별(per-dimension) 게이팅을 수행합니다. LSTM은 시그모이드 게이트를 수동 설계하지만, Mamba는 이산화 과정에서 게이트가 자연 발생합니다." />

              <EqCard idx={5} name="Mamba 블록" color="indigo"
                latex={String.raw`h = \sigma(\text{Linear}(x)) \odot \text{SSM}(\text{Conv1d}(\text{Linear}(x)))`}
                description="SSM 분기와 게이트 분기를 요소별 곱셈(odot)으로 결합합니다. sigma=SiLU. Conv1d는 로컬 패턴 포착. Transformer의 MHA+FFN을 단일 블록으로 융합하여, QKV 투영 3개가 1개로, FFN 확장 4D가 2D로 축소됩니다. 결과: 동일 파라미터에서 더 많은 레이어를 쌓을 수 있습니다." />
            </div>
          </Card>
        </div>
      </section>

      {/* ── 7. 실험 결과 ────────────────────────────────────── */}
      <section id="mamba-results" className="scroll-mt-20">
        <SectionHeading icon={<Layers className="h-5 w-5" />} title="실험 결과" collapsed={!!col['mamba-results']} onToggle={() => toggle('mamba-results')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['mamba-results'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="6.1" title="언어 모델링" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              The Pile 데이터셋에서 Mamba의 성능입니다.
              동일 파라미터에서 Transformer를 능가하고, 추론 처리량은 5배 빠릅니다.
            </p>
            <div className="mb-5 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">모델</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">파라미터</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">Perplexity</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">추론 속도</th>
                    <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">비고</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { m: 'Transformer++', p: '1.3B', ppl: '~8.8', spd: '1x (기준)', note: 'GPT-3 스타일 기준선', hi: false },
                    { m: 'Mamba', p: '1.4B', ppl: '~8.3', spd: '~5x', note: '동일 규모에서 perplexity 우위', hi: true },
                    { m: 'Transformer++', p: '2.8B', ppl: '~8.1', spd: '0.5x', note: '2배 파라미터로도 Mamba-1.4B와 유사', hi: false },
                    { m: 'Mamba', p: '2.8B', ppl: '~7.8', spd: '~5x', note: 'GPT-3급, 3B 미만 최고 성능', hi: true },
                    { m: 'RWKV-4', p: '1.5B', ppl: '~9.5', spd: '~3x', note: 'RNN 계열, 선형 시간이지만 성능 열세', hi: false },
                    { m: 'RetNet', p: '1.3B', ppl: '~9.0', spd: '~3x', note: '리텐션 기반, Mamba보다 낮은 성능', hi: false },
                  ].map((r, i) => (
                    <tr key={i} className={r.hi ? 'bg-emerald-50 dark:bg-emerald-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}>
                      <td className={`px-3 py-2 font-medium ${r.hi ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-700 dark:text-gray-300'}`}>{r.m}</td>
                      <td className="px-3 py-2 text-center font-mono text-gray-600 dark:text-gray-400">{r.p}</td>
                      <td className={`px-3 py-2 text-center font-mono font-semibold ${r.hi ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-600 dark:text-gray-400'}`}>{r.ppl}</td>
                      <td className={`px-3 py-2 text-center font-mono font-semibold ${r.hi ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-600 dark:text-gray-400'}`}>{r.spd}</td>
                      <td className="px-3 py-2 text-gray-500 dark:text-gray-400">{r.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mb-5 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              Mamba-3B이 같은 파라미터의 Transformer와 동등하거나 우수한 성능을 보입니다.
              특히 512K 토큰에서 5배 빠른 throughput을 달성합니다.
              시퀀스 길이가 길어질수록 이점이 급격히 커지며, 128K 토큰까지 외삽이 가능합니다.
            </p>

            <div className="mb-5 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">지표</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">Mamba</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">Transformer</th>
                    <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">이점의 원인</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { met: '학습 시간 복잡도', mamba: 'O(L)', tf: 'O(L\u00B2)', why: 'Attention 제거, 선형 스캔' },
                    { met: '추론 스텝 복잡도', mamba: 'O(1) per step', tf: 'O(L) per step', why: '고정 크기 상태 vs. 전체 KV cache' },
                    { met: '메모리 (추론)', mamba: 'O(DN) 고정', tf: 'O(LD) 증가', why: '상태 크기가 시퀀스와 무관' },
                    { met: 'Perplexity (1.4B)', mamba: '~8.3', tf: '~8.8', why: '파라미터 효율이 더 높음' },
                    { met: '처리량 (추론)', mamba: '~5x', tf: '1x (기준)', why: '선형 시간 + 작은 상태' },
                    { met: '위치 인코딩', mamba: '불필요', tf: '필수 (RoPE)', why: 'SSM 재귀가 순서 자동 인코딩' },
                  ].map((r, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">{r.met}</td>
                      <td className="px-3 py-2 text-center font-mono font-semibold text-emerald-700 dark:text-emerald-300">{r.mamba}</td>
                      <td className="px-3 py-2 text-center font-mono text-gray-600 dark:text-gray-400">{r.tf}</td>
                      <td className="px-3 py-2 text-gray-500 dark:text-gray-400">{r.why}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <SubSectionHeading number="6.2" title="다른 모달리티" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              Mamba의 선택 메커니즘은 언어에만 유효한 것이 아닙니다.
              긴 시퀀스가 핵심인 도메인에서 특히 강점을 보입니다:
            </p>
            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-900/20">
                <p className="mb-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">오디오 (Speech Commands)</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                  분류 정확도: <span className="font-bold">98.7%</span><br/>
                  원시 파형 16kHz, 시퀀스 ~16000<br/>
                  SaShiMi(S4) 대비 개선<br/>
                  무음 구간 자동 건너뛰기
                </p>
              </div>
              <div className="rounded-lg border border-teal-200 bg-teal-50 p-4 dark:border-teal-800 dark:bg-teal-900/20">
                <p className="mb-1 text-xs font-bold text-teal-700 dark:text-teal-300">DNA 시퀀스 모델링</p>
                <p className="text-xs text-teal-600 dark:text-teal-400">
                  기존 모델 대비 SOTA<br/>
                  시퀀스 길이: 최대 1M 뉴클레오타이드<br/>
                  인핸서-프로모터 장거리 의존성 포착<br/>
                  HyenaDNA 대비 perplexity 대폭 개선
                </p>
              </div>
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
                <p className="mb-1 text-xs font-bold text-green-700 dark:text-green-300">길이 외삽</p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  4K 토큰으로 훈련 &rarr; 1M 추론 가능<br/>
                  고정 크기 상태 덕분에 길이 무제한<br/>
                  Transformer는 KV cache 폭발<br/>
                  SSM 재귀의 본질적 장점
                </p>
              </div>
            </div>

            <SubSectionHeading number="6.3" title="핵심 관찰" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800 dark:bg-emerald-900/20">
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">왜 Mamba가 언어에서 성공하는가?</p>
                <p className="mt-1 text-xs leading-relaxed text-emerald-600 dark:text-emerald-400">
                  선택 메커니즘이 Transformer 어텐션의 내용 기반 추론을 근사합니다.
                  고정 크기 상태(O(N))에 중요 정보를 압축하는 방식으로,
                  3B 스케일에서 어텐션 없이도 동등한 in-context learning 능력을 달성합니다.
                  Induction Heads 태스크에서 이를 실험적으로 확인했습니다.
                </p>
              </div>
              <div className="rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 dark:border-teal-800 dark:bg-teal-900/20">
                <p className="text-xs font-semibold text-teal-700 dark:text-teal-300">Transformer 대비 실용적 이점</p>
                <p className="mt-1 text-xs leading-relaxed text-teal-600 dark:text-teal-400">
                  O(L) 메모리로 임의 길이 시퀀스 처리 가능.
                  추론 속도 5배 (512K 토큰 기준).
                  KV cache 없이 고정 크기 상태만 유지.
                  위치 인코딩 불필요 (SSM 재귀가 순서 자동 인코딩).
                  4K 훈련으로 1M 추론까지 길이 외삽.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ── 8. 자기 점검 ────────────────────────────────────── */}
      <section id="mamba-quiz" className="scroll-mt-20">
        <SectionHeading icon={<FlaskConical className="h-5 w-5" />} title="자기 점검 (연구자 수준)" />
        <Card>
          <QuizSection color="emerald" questions={[
            {
              q: 'Mamba의 "선택적 메커니즘"이 S4의 LTI 한계를 어떻게 해결하며, 이것이 Transformer의 어텐션과 어떻게 비교되는지 설명하라.',
              a: 'S4는 A, B, C, Delta가 고정(LTI)이어서 입력 내용에 관계없이 동일한 커널로 처리합니다. 이는 "어떤 토큰이 중요한지" 판단이 불가능합니다. Mamba는 Delta(x), B(x), C(x)를 입력 x의 선형 투영으로 만들어 매 스텝 동역학이 달라집니다. 큰 Delta(x) -> exp(-Delta*a) ≈ 0으로 과거 상태 리셋하고 현재 입력 강하게 기록. 작은 Delta(x) -> 과거 상태 유지. Transformer 어텐션은 모든 토큰 쌍의 관계를 명시적으로 계산(O(L^2))하지만, Mamba는 고정 크기 상태(O(N))에 중요 정보를 압축합니다. 표현력은 제한적이지만, 실제 성능은 3B 스케일에서 Transformer와 동등하며 추론 효율은 5배 이상 빠릅니다.',
            },
            {
              q: 'Mamba가 S4의 효율적인 컨볼루션 모드를 포기하고 병렬 스캔으로 전환한 이유는? 병렬 스캔의 시간 복잡도와 한계를 설명하라.',
              a: 'S4의 컨볼루션 커널 K = (CB_bar, CA_bar*B_bar, CA_bar^2*B_bar, ...)는 A, B, C가 고정일 때만 미리 계산 가능합니다. Mamba에서는 A_bar(x_k), B_bar(x_k)가 입력마다 다르므로 커널이 고정되지 않아 FFT 컨볼루션이 불가능합니다. 대신 재귀 x_k = a_k*x_{k-1} + b_k를 결합적 연산의 prefix sum으로 병렬화합니다. 복잡도: work O(L), span O(log L)이므로 P개 프로세서에서 O(L/P + log L). 한계: (1) 완전한 O(1) per-step이 아니라 span이 O(log L)이므로 초장거리에서 상수 추론은 순환 모드가 필요, (2) GPU warp 크기(32)에 맞춘 구현이 필요하여 하드웨어 의존적, (3) 역전파 시 중간 상태 저장이 필요하지만 재계산으로 해결.',
            },
            {
              q: 'exp(-Delta(x)*a_i)가 LSTM의 forget gate와 수학적으로 유사하다는 것을 구체적으로 보이고, Mamba가 LSTM 대비 가지는 이점을 설명하라.',
              a: 'LSTM: h_t = f_t * h_{t-1} + i_t * g_t where f_t = sigma(W_f*[h_{t-1}, x_t]). Mamba: x_k^i = exp(-Delta(u_k)*a_i)*x_{k-1}^i + Delta(u_k)*b_i(u_k)*u_k. 둘 다 "과거 상태를 얼마나 유지할지"를 [0,1] 범위의 게이트로 결정합니다. exp(-Delta*a) <-> f_t. 차이점: (1) Mamba는 연속 시간에서 유도되어 HiPPO 초기화(다항식 그래디언트)와 자연 결합 -> LSTM보다 장거리 학습 우수. (2) 차원별(per-dimension) 독립 게이팅으로 상태 N이 커도 파라미터가 선형 증가. (3) 병렬 스캔으로 O(L) 훈련 가능 vs LSTM O(L) 순차. (4) 컨볼루션+SSM 융합 아키텍처로 로컬+글로벌 패턴 동시 포착.',
            },
            {
              q: 'Mamba 블록의 아키텍처(SSM + Conv1d + SiLU gate)가 Transformer의 MHA + FFN 구조와 비교하여 어떤 구조적 이점을 가지며, 이것이 파라미터 효율성에 미치는 영향을 설명하라.',
              a: 'Transformer: [LayerNorm -> QKV projection -> Attention O(L^2) -> Output projection -> Residual] + [LayerNorm -> Up projection -> Activation -> Down projection -> Residual]. 총 2개 서브레이어, 4개 행렬곱. Mamba: [LayerNorm -> Linear expand(2D) -> 분기: (Conv1d -> SiLU -> SSM) * (SiLU gate) -> Linear contract(D) -> Residual]. 1개 블록에 MHA(SSM=글로벌 의존성)와 FFN(gate=비선형 변환)을 융합. 파라미터 이점: (1) QKV 3개 투영이 1개로 통합, (2) FFN의 4D 확장이 2D로 축소, (3) KV-cache 불필요(상태 크기 O(N) 고정). 결과: 동일 파라미터 예산에서 더 많은 레이어를 쌓을 수 있어, Mamba-3B가 Transformer-3B와 동등한 성능을 달성하면서 추론 속도는 5배 빠릅니다.',
            },
          ]} />
        </Card>
      </section>

    </div>
    </GlossaryText>
  );
}
