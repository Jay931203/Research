'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  BookOpen,
  BrainCircuit,
  ChevronDown,
  Cpu,
  GraduationCap,
  Hash,
  Layers,
  Zap,
} from 'lucide-react';
import katex from 'katex';
import GlossaryText from '@/components/glossary/GlossaryText';
import S4DualModeViz from '@/components/my-research/infographics/S4DualModeViz';

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
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">{number}</span>
      <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">{title}</h4>
    </div>
  );
}

function EqCard({ idx, name, latex, description, color = 'blue' }: {
  idx: number; name: string; latex: string; description: string; color?: string;
}) {
  const [open, setOpen] = useState(false);
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    sky: 'bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800',
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800',
    green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
  };
  const badgeMap: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    sky: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
    indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
    green: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  };
  return (
    <div className="cursor-pointer rounded-xl border border-gray-200 bg-gray-50/50 p-4 transition hover:border-blue-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-700" onClick={() => setOpen(v => !v)}>
      <div className="mb-2 flex items-center gap-2">
        <span className={`rounded px-2 py-0.5 text-xs font-bold ${badgeMap[color] ?? badgeMap.blue}`}>Eq. {idx}</span>
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{name}</span>
        <ChevronDown className={`ml-auto h-4 w-4 text-gray-400 transition-transform dark:text-gray-500 ${open ? 'rotate-180' : ''}`} />
      </div>
      <div className="overflow-x-auto py-2 text-gray-900 dark:text-gray-100"><EquationRenderer latex={latex} /></div>
      {open ? (
        <div className={`mt-3 rounded-lg border px-4 py-3 ${colorMap[color] ?? colorMap.blue}`}>
          <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">{description}</p>
        </div>
      ) : (
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">클릭하여 상세 설명 보기</p>
      )}
    </div>
  );
}

function QuizSection({ questions, color = 'blue' }: { questions: { q: string; a: string }[]; color?: string }) {
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const toggle = (i: number) => setRevealed(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; });
  const bgMap: Record<string, string> = {
    blue: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20',
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
            <div className={`mx-4 mb-4 rounded-lg border px-4 py-3 ${bgMap[color] ?? bgMap.blue}`}>
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

export default function S4StudyFull() {
  const [col, setCol] = useState<Record<string, boolean>>({});
  const toggle = useCallback((id: string) => setCol(c => ({ ...c, [id]: !c[id] })), []);

  return (
    <GlossaryText>
    <div className="space-y-6">

      {/* ── 1. Overview ──────────────────────────────────────── */}
      <section id="s4-overview" className="scroll-mt-20">
        <div className="overflow-hidden rounded-xl shadow-sm">
          <div className="bg-gradient-to-br from-blue-700 via-sky-600 to-cyan-600 p-6 pb-8">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">ICLR 2022</span>
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">arXiv 2111.00396</span>
              <span className="rounded-full bg-cyan-300/90 px-3 py-1 text-xs font-bold text-cyan-900">구조화된 상태공간 모델</span>
            </div>
            <h2 className="text-xl font-bold leading-snug text-white sm:text-2xl">
              Efficiently Modeling Long Sequences with Structured State Spaces
            </h2>
            <p className="mt-3 text-sm text-blue-200">
              Gu, Goel, Re (Stanford) · ICLR 2022
            </p>
          </div>
          <div className="bg-white p-6 dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
            <p className="leading-relaxed text-gray-700 dark:text-gray-300">
              HiPPO의 이론을 실용적 딥러닝 레이어로 전환한 획기적 연구. 핵심 혁신:
              (1) <span className="font-semibold text-blue-700 dark:text-blue-300">HiPPO 행렬 A를 정규-대각-플러스-저랭크(NPLR) 형태로 분해</span>하여
              O(N log N) 훈련 가능,
              (2) <span className="font-semibold text-sky-700 dark:text-sky-300">이산 순환(추론)과 컨볼루션(훈련) 모드를 자유롭게 전환하는 이중 계산 모드</span> 도입.
              Long Range Arena 벤치마크에서 Transformer를 압도하며 SSM 시대를 개막.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {['NPLR 분해', '이중 계산 모드', 'HiPPO 초기화', '장거리 벤치마크', 'PathX'].map(tag => (
                <span key={tag} className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. 배경: HiPPO만으로는 왜 부족한가? ─────────────── */}
      <section id="s4-challenge" className="scroll-mt-20">
        <SectionHeading icon={<Zap className="h-5 w-5" />} title="배경: HiPPO만으로는 왜 부족한가?" collapsed={!!col['s4-challenge']} onToggle={() => toggle('s4-challenge')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['s4-challenge'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="1.1" title="HiPPO의 계산 병목" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              HiPPO는 연속 신호를 직교 다항식 기저로 최적 압축하는 수학적으로 아름다운 프레임워크이지만,
              실용적 딥러닝 레이어로 사용하기엔 치명적 병목이 있습니다.
            </p>
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 dark:bg-red-900/20">
              <p className="text-sm font-semibold text-red-700 dark:text-red-300">핵심 병목</p>
              <ul className="mt-2 space-y-1.5 text-sm text-red-600 dark:text-red-400">
                <li className="flex items-start gap-1.5">
                  <span className="mt-0.5 flex-shrink-0">--</span>
                  HiPPO A 행렬은 N x N <span className="font-semibold">밀집 행렬</span> -- 상태 업데이트마다 O(N^2) 연산
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="mt-0.5 flex-shrink-0">--</span>
                  시퀀스 길이 L, 상태 차원 N이면 -- 전체 훈련 비용 <span className="font-semibold">O(LN^2)</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="mt-0.5 flex-shrink-0">--</span>
                  장거리 벤치마크(L=16,384)에서 N=64만 써도 비현실적인 계산량
                </li>
              </ul>
            </div>
            <div className="mb-5 rounded-lg bg-blue-50 px-4 py-3 dark:bg-blue-900/20">
              <EquationRenderer latex={String.raw`\text{Naive SSM: } \bar{K}_i = \mathbf{C}\bar{\mathbf{A}}^i\bar{\mathbf{B}} \implies O(N^2 L) \text{ 훈련 비용}`} />
            </div>

            <SubSectionHeading number="1.2" title="기존 선형 RNN의 한계" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              HiPPO의 계산 비용을 줄이기 위해 여러 접근이 시도되었지만, 각각 근본적 한계가 있었습니다.
            </p>
            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-900/10">
                <p className="mb-1 text-xs font-bold text-red-700 dark:text-red-300">밀집 SSM</p>
                <p className="text-lg font-mono font-bold text-red-600">O(LN^2)</p>
                <p className="text-xs text-red-500 dark:text-red-400">HiPPO 표현력 보존하지만 계산 비용이 비현실적.</p>
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-900/10">
                <p className="mb-1 text-xs font-bold text-amber-700 dark:text-amber-300">대각 SSM</p>
                <p className="text-lg font-mono font-bold text-amber-600">O(LN)</p>
                <p className="text-xs text-amber-500 dark:text-amber-400">빠르지만 HiPPO 구조를 근사 -- 표현력이 크게 저하됨.</p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                <p className="mb-1 text-xs font-bold text-gray-700 dark:text-gray-300">랜덤 초기화</p>
                <p className="text-lg font-mono font-bold text-gray-600">O(LN)</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">빠르지만 장거리 의존성을 전혀 포착하지 못함.</p>
              </div>
            </div>
            <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-800 dark:bg-blue-900/20">
              <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">S4의 접근</p>
              <p className="mt-1 text-xs leading-relaxed text-blue-600 dark:text-blue-400">
                <span className="font-bold">&quot;밀집 HiPPO 행렬을 빠르게 연산할 수 있는 구조를 찾자.&quot;</span>{' '}
                표현력을 유지하면서 계산 복잡도를 줄이는 대수적 구조(NPLR)를 발견한 것이 S4의 핵심 기여입니다.
              </p>
            </div>

            {/* 실험적 증거: 초기화의 중요성 */}
            <p className="mb-3 text-xs font-bold text-gray-700 dark:text-gray-300">실험적 증거: A 초기화의 결정적 영향</p>
            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-900/10">
                <p className="mb-1 text-xs font-bold text-red-700 dark:text-red-300">랜덤 A 초기화</p>
                <p className="text-2xl font-mono font-bold text-red-600">~60%</p>
                <p className="text-xs text-red-500 dark:text-red-400">Sequential CIFAR-10 정확도. 거의 랜덤 추측 수준.</p>
              </div>
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900/40 dark:bg-green-900/10">
                <p className="mb-1 text-xs font-bold text-green-700 dark:text-green-300">HiPPO A 초기화</p>
                <p className="text-2xl font-mono font-bold text-green-600">~91%</p>
                <p className="text-xs text-green-500 dark:text-green-400">같은 모델 아키텍처, 같은 학습 설정. 초기화만 다름.</p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">접근법</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">계산 복잡도</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">표현력</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">장거리 의존성</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { m: '밀집 SSM (HiPPO)', comp: 'O(N\u00B2L)', expr: 'O 최적', lr: 'O 가능', hi: false },
                    { m: '대각 SSM', comp: 'O(NL)', expr: 'X 근사', lr: 'X 제한적', hi: false },
                    { m: '랜덤 초기화 SSM', comp: 'O(NL)', expr: 'X 구조 없음', lr: 'X 불가', hi: false },
                    { m: 'S4 (NPLR)', comp: '\u00D5(N+L)', expr: 'O 보존', lr: 'O 최초 성공', hi: true },
                  ].map((r, i) => (
                    <tr key={i} className={r.hi ? 'bg-blue-50 dark:bg-blue-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}>
                      <td className={`px-3 py-2 font-medium ${r.hi ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}>{r.m}</td>
                      <td className={`px-3 py-2 text-center font-mono ${r.hi ? 'font-semibold text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400'}`}>{r.comp}</td>
                      <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">{r.expr}</td>
                      <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">{r.lr}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </section>

      {/* ── 3. 세 가지 계산 관점 ─────────────────────────────── */}
      <section id="s4-three-views" className="scroll-mt-20">
        <SectionHeading icon={<BookOpen className="h-5 w-5" />} title="핵심 아이디어: 세 가지 계산 관점" collapsed={!!col['s4-three-views']} onToggle={() => toggle('s4-three-views')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['s4-three-views'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <p className="mb-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              S4의 가장 직관적인 핵심 아이디어: 동일한 파라미터 (A, B, C, Delta)가{' '}
              <span className="font-semibold text-blue-700 dark:text-blue-300">세 가지 수학적으로 동치인 계산 형태</span>를 가집니다.
              &quot;같은 모델의 세 가지 등가 표현&quot; -- 이것이 S4의 핵심 이중성입니다.
            </p>

            <SubSectionHeading number="2.1" title="연속 --> 이산 --> 컨볼루션" />

            {/* 연속 ODE */}
            <p className="mb-2 text-xs font-bold text-purple-700 dark:text-purple-300">연속 ODE -- 이론적 정의</p>
            <div className="mb-3 rounded-lg bg-purple-50 px-4 py-3 dark:bg-purple-900/20">
              <EquationRenderer latex={String.raw`x'(t) = \mathbf{A}\,x(t) + \mathbf{B}\,u(t), \quad y(t) = \mathbf{C}\,x(t)`} />
            </div>
            <p className="mb-5 text-sm text-gray-600 dark:text-gray-400">
              연속 시간 동역학 시스템. 모델의 이론적 출발점이며, A 행렬에 HiPPO 초기화를 적용합니다.
              연속 정의 덕분에 불규칙 샘플링 데이터에도 자연스럽게 적용 가능합니다.
            </p>

            {/* 이산 순환 */}
            <p className="mb-2 text-xs font-bold text-emerald-700 dark:text-emerald-300">이산 순환 (RNN 모드) -- 자기회귀 추론에 적합</p>
            <div className="mb-3 rounded-lg bg-emerald-50 px-4 py-3 dark:bg-emerald-900/20">
              <EquationRenderer latex={String.raw`x_k = \bar{\mathbf{A}}\,x_{k-1} + \bar{\mathbf{B}}\,u_k, \quad y_k = \mathbf{C}\,x_k`} />
            </div>
            <p className="mb-5 text-sm text-gray-600 dark:text-gray-400">
              추론 시 사용. 스텝당 행렬-벡터 곱 한 번이면 끝(O(N)/step).
              이전 상태만 기억하면 되므로 메모리 O(N)으로 고정. 스트리밍 가능.
            </p>

            {/* 컨볼루션 */}
            <p className="mb-2 text-xs font-bold text-blue-700 dark:text-blue-300">컨볼루션 (CNN 모드) -- 병렬 훈련에 적합</p>
            <div className="mb-3 rounded-lg bg-blue-50 px-4 py-3 dark:bg-blue-900/20">
              <EquationRenderer latex={String.raw`y = \bar{\mathbf{K}} * u, \quad \bar{\mathbf{K}} = (\mathbf{C}\bar{\mathbf{B}},\;\mathbf{C}\bar{\mathbf{A}}\bar{\mathbf{B}},\;\mathbf{C}\bar{\mathbf{A}}^2\bar{\mathbf{B}},\;\ldots)`} />
            </div>
            <p className="mb-5 text-sm text-gray-600 dark:text-gray-400">
              훈련 시 사용. 커널 K를 미리 계산한 뒤 FFT로 합성곱하면 O(L log L).
              전체 시퀀스를 한 번에 병렬 처리 -- GPU 활용도가 극대화됩니다.
            </p>

            {/* 세 모드 비교 카드 */}
            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/20">
                <p className="mb-1 text-xs font-bold text-purple-700 dark:text-purple-300">연속 ODE</p>
                <p className="text-xs text-purple-600 dark:text-purple-400">
                  <span className="font-semibold">장점:</span> 이론적 기반, 불규칙 샘플링 지원<br/>
                  <span className="font-semibold">단점:</span> 직접 계산 불가 (이산화 필요)<br/>
                  <span className="font-semibold">용도:</span> 모델 정의 및 HiPPO 초기화
                </p>
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-900/20">
                <p className="mb-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">이산 순환 (RNN)</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                  <span className="font-semibold">장점:</span> O(1)/step 추론, 메모리 O(N) 고정<br/>
                  <span className="font-semibold">단점:</span> 순차 처리, 학습 시 GPU 비효율<br/>
                  <span className="font-semibold">용도:</span> 자기회귀 생성, 실시간 추론
                </p>
              </div>
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                <p className="mb-1 text-xs font-bold text-blue-700 dark:text-blue-300">전역 컨볼루션 (CNN)</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  <span className="font-semibold">장점:</span> O(L log L) 병렬 학습, GPU 최적<br/>
                  <span className="font-semibold">단점:</span> 커널 사전 계산 필요<br/>
                  <span className="font-semibold">용도:</span> 학습, 분류, 인코딩
                </p>
              </div>
            </div>

            <div className="mb-4 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 dark:border-sky-800 dark:bg-sky-900/20">
              <p className="text-xs font-semibold text-sky-700 dark:text-sky-300">핵심 통찰</p>
              <p className="mt-1 text-xs leading-relaxed text-sky-600 dark:text-sky-400">
                <span className="font-bold">&quot;훈련은 CNN처럼 빠르게, 추론은 RNN처럼 효율적으로&quot;</span>{' '}
                -- 같은 파라미터가 훈련 시에는 합성곱 커널로, 추론 시에는 순환 상태 업데이트로 동작합니다.
                이 이중성은 SSM의 수학적 구조에서 자연스럽게 도출되며,
                Transformer가 가질 수 없는 S4 고유의 강점입니다.
              </p>
            </div>

            <SubSectionHeading number="2.2" title="이산화 (ZOH: Zero-Order Hold)" />
            <div className="mb-3 rounded-lg bg-sky-50 px-4 py-3 dark:bg-sky-900/20">
              <EquationRenderer latex={String.raw`\bar{\mathbf{A}} = e^{\Delta \mathbf{A}}, \quad \bar{\mathbf{B}} = (\Delta \mathbf{A})^{-1}(e^{\Delta \mathbf{A}} - \mathbf{I}) \cdot \Delta \mathbf{B}`} />
            </div>
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              Delta는 이산화 스텝 크기로, 연속 시간과 이산 시간을 연결하는 핵심 하이퍼파라미터입니다.
              ZOH(영차 홀드)는 입력 u(t)가 각 스텝 구간에서 상수라고 가정하는 이산화 방법입니다.
            </p>
            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
                <p className="text-xs font-bold text-blue-700 dark:text-blue-300">Delta가 크면</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">시간 해상도가 낮아지지만 한 스텝이 넓은 시간 범위를 커버 -- 장거리 패턴 포착에 유리</p>
              </div>
              <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-3 dark:border-cyan-800 dark:bg-cyan-900/20">
                <p className="text-xs font-bold text-cyan-700 dark:text-cyan-300">Delta가 작으면</p>
                <p className="text-xs text-cyan-600 dark:text-cyan-400">미세한 시간 변화를 포착하지만 장거리 의존성 포착이 어려움 (많은 스텝 필요)</p>
              </div>
            </div>

            <SubSectionHeading number="2.3" title="컨볼루션 커널 K" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              이산 순환을 L 스텝 풀어쓰면 출력이 입력과 커널 K의 컨볼루션과 정확히 동치가 됩니다.
              이 사실이 두 가지 계산 모드의 전환을 가능하게 합니다.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
                <p className="text-xs font-bold text-blue-700 dark:text-blue-300">훈련 시 (컨볼루션)</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">전체 시퀀스를 한 번에 FFT 컨볼루션으로 처리 -- O(L log L). GPU 병렬성 최대 활용.</p>
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800 dark:bg-emerald-900/20">
                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">추론 시 (순환)</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">상태 순환으로 O(1) 메모리, 스트리밍 가능. 자기회귀 생성에서 Transformer 대비 60배 빠름.</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ── 4. 인터랙티브 시각화 ─────────────────────────────── */}
      <section id="s4-viz" className="scroll-mt-20">
        <SectionHeading icon={<Cpu className="h-5 w-5" />} title="인터랙티브 시각화: 이중 계산 모드" collapsed={!!col['s4-viz']} onToggle={() => toggle('s4-viz')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['s4-viz'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <p className="mb-4 text-sm text-gray-700 dark:text-gray-300">
              아래 인터랙티브 시각화에서 S4의 세 가지 계산 모드를 직접 전환해 보세요.
              특히 <span className="font-semibold text-blue-700 dark:text-blue-300">커널 시각화</span>에서
              스텝 사이즈 Delta와 고유값을 조절하며 다음을 관찰하세요:
            </p>
            <ul className="mb-4 space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-1.5">
                <span className="mt-0.5 flex-shrink-0 text-blue-500">--</span>
                Delta를 줄이면 커널이 길게 늘어나며 더 먼 과거를 볼 수 있습니다 (해상도 적응).
              </li>
              <li className="flex items-start gap-1.5">
                <span className="mt-0.5 flex-shrink-0 text-blue-500">--</span>
                고유값 |a|가 작으면 커널이 천천히 감쇠하여 장거리 의존성을 포착합니다.
              </li>
              <li className="flex items-start gap-1.5">
                <span className="mt-0.5 flex-shrink-0 text-blue-500">--</span>
                순환 모드 탭에서 스텝별 상태 업데이트 과정을 확인할 수 있습니다.
              </li>
            </ul>
            <S4DualModeViz />
            <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-800 dark:bg-blue-900/20">
              <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">관찰 포인트</p>
              <p className="mt-1 text-xs leading-relaxed text-blue-600 dark:text-blue-400">
                세 모드(연속 ODE, 이산 순환, 컨볼루션)가 동일한 입출력 관계를 표현합니다.
                Delta를 변경하면 이산화 해상도가 바뀌어 커널 형태가 달라지지만,
                모든 모드에서 동일한 변화가 반영됩니다.
                이것이 S4의 이중 계산 모드의 핵심: <span className="font-bold">파라미터 하나로 세 가지 연산을 자유롭게 전환</span>.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* ── 5. NPLR 분해 ────────────────────────────────────── */}
      <section id="s4-nplr" className="scroll-mt-20">
        <SectionHeading icon={<BrainCircuit className="h-5 w-5" />} title="NPLR 분해: HiPPO를 효율적으로 만드는 기법" collapsed={!!col['s4-nplr']} onToggle={() => toggle('s4-nplr')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['s4-nplr'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <p className="mb-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              S4의 핵심 기술적 기여: HiPPO 행렬 A의 특수한 대수적 구조를 이용하여
              커널 계산의 복잡도를 O(N^2 L)에서 O((N+L) log(N+L))로 환원합니다.
            </p>

            <SubSectionHeading number="4.1" title="왜 대각화가 불가능한가?" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              가장 간단한 효율화는 A를 대각화하는 것입니다. 대각 행렬이면 상태 업데이트가 원소별 곱셈 O(N)이 되기 때문입니다.
              하지만 HiPPO-LegS A 행렬에는 근본적 문제가 있습니다:
            </p>
            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-900/10">
                <p className="mb-1 text-xs font-bold text-red-700 dark:text-red-300">비정규(Non-Normal) 행렬</p>
                <p className="text-xs text-red-600 dark:text-red-400">
                  HiPPO-LegS A는 비정규 행렬이어서 직교 대각화가 불가능합니다.
                  고유값 분해의 조건수가 매우 나빠 수치적으로 불안정합니다.
                </p>
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-900/10">
                <p className="mb-1 text-xs font-bold text-amber-700 dark:text-amber-300">대각 근사(S4D)의 한계</p>
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  단순 대각화(후속 연구 S4D)는 근사이며, 비대각 성분이 인코딩하는 정보가 손실됩니다.
                  특히 가장 어려운 장거리 태스크에서 성능 차이가 발생합니다.
                </p>
              </div>
            </div>

            <SubSectionHeading number="4.2" title="NPLR (Normal Plus Low-Rank) 분해" />
            <div className="mb-3 rounded-lg bg-blue-50 px-4 py-3 dark:bg-blue-900/20">
              <EquationRenderer latex={String.raw`\mathbf{A} = \mathbf{V}\mathbf{\Lambda}\mathbf{V}^* - \mathbf{P}\mathbf{Q}^*`} />
            </div>
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              NPLR = Normal Plus Low-Rank.
              V Lambda V*는 정규 행렬의 스펙트럼 분해(대각화 가능), PQ*는 랭크-1 보정입니다.
              이 구조에서 컨볼루션 커널 계산을 <span className="font-semibold text-blue-700 dark:text-blue-300">Cauchy kernel</span>로 변환할 수 있습니다.
            </p>
            <div className="mb-3 rounded-lg bg-indigo-50 px-4 py-3 dark:bg-indigo-900/20">
              <EquationRenderer latex={String.raw`\tilde{K}(\omega) = \sum_{i=1}^{N} \frac{C_i \cdot \tilde{B}_i}{\omega - \lambda_i} \quad \text{(Cauchy kernel -- O(N) FFT 가능)}`} />
            </div>
            <p className="mb-5 text-sm text-gray-600 dark:text-gray-400">
              Cauchy kernel에는 분할정복 기반 O((N+L) log^2(N+L)) 알고리즘이 존재합니다.
              NPLR 구조가 이 알고리즘의 적용을 가능하게 하는 핵심 열쇠입니다.
            </p>

            <SubSectionHeading number="4.3" title="Woodbury 항등식과 Cauchy 환원" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              커널 생성 함수를 계산하려면 (I - Abar z)^(-1) 형태의 역행렬이 필요합니다.
              Abar가 NPLR 구조이므로, Woodbury 항등식으로 역행렬을 효율적으로 분해합니다:
            </p>
            <div className="mb-3 rounded-lg bg-sky-50 px-4 py-3 dark:bg-sky-900/20">
              <EquationRenderer latex={String.raw`(\mathbf{D} - \mathbf{U}\mathbf{V}^\top)^{-1} = \mathbf{D}^{-1} + \mathbf{D}^{-1}\mathbf{U}(\mathbf{I} - \mathbf{V}^\top\mathbf{D}^{-1}\mathbf{U})^{-1}\mathbf{V}^\top\mathbf{D}^{-1}`} />
            </div>
            <p className="mb-5 text-sm text-gray-600 dark:text-gray-400">
              D는 대각 행렬(빠른 역행렬 O(N)), UV^T는 랭크-1 보정(스칼라 나눗셈 하나).
              이 분해를 적용하면 생성 함수의 각 항이{' '}
              <span className="font-semibold text-blue-700 dark:text-blue-300">Cauchy dot-product</span>{' '}
              형태 Sigma v_i * w_i / (omega - lambda_i)로 귀결됩니다.
              Cauchy 행렬에는 분할정복 기반 O((N+L) log^2(N+L)) 알고리즘이 존재하여
              최종적으로 4개의 Cauchy 곱으로 분해됩니다.
            </p>

            <SubSectionHeading number="4.4" title="전체 파이프라인" />
            <div className="mb-4 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">단계</th>
                    <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">연산</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">복잡도</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { step: '1. HiPPO 초기화', op: 'A 행렬을 HiPPO-LegS로 설정', comp: 'O(N^2)' },
                    { step: '2. NPLR 분해', op: 'A = V Lambda V* - PQ*로 분해', comp: 'O(N^2) (1회)' },
                    { step: '3. Woodbury 적용', op: '(I - Abarz)^{-1}을 대각 + 저랭크로 분해', comp: 'O(N)' },
                    { step: '4. Cauchy kernel', op: 'L개 주파수에서 Cauchy dot-product 평가', comp: 'O((N+L) log^2)' },
                    { step: '5. iFFT', op: '주파수 도메인 커널을 시간 도메인으로 변환', comp: 'O(L log L)' },
                    { step: '6. 합성곱', op: '커널 K와 입력 u의 FFT 합성곱', comp: 'O(L log L)' },
                  ].map((r, i) => (
                    <tr key={i} className={i === 3 ? 'bg-blue-50 dark:bg-blue-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}>
                      <td className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">{r.step}</td>
                      <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{r.op}</td>
                      <td className={`px-3 py-2 text-center font-mono ${i === 3 ? 'font-semibold text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400'}`}>{r.comp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mb-3 text-xs font-bold text-gray-700 dark:text-gray-300">복잡도 환원 흐름</p>
            <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
              {[
                { label: 'HiPPO A', color: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300' },
                { label: 'NPLR 분해', color: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' },
                { label: 'DPLR 변환', color: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' },
                { label: 'Woodbury', color: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300' },
                { label: 'Cauchy (x4)', color: 'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300' },
                { label: 'iFFT', color: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' },
                { label: 'Kernel K', color: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300' },
              ].map(({ label, color }, i) => (
                <span key={label} className="flex items-center gap-1.5">
                  <span className={`rounded-md px-2.5 py-1 font-bold ${color}`}>{label}</span>
                  {i < 6 && <span className="text-gray-400">&rarr;</span>}
                </span>
              ))}
            </div>
            <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
              각 단계에서 복잡도가 감소합니다: O(N^2 L) &rarr; O(NL) &rarr; O((N+L) log^2(N+L)).
              NPLR이 Woodbury를 가능하게 하고, Woodbury가 Cauchy를 드러내며, Cauchy에 빠른 알고리즘이 존재합니다.
            </p>

            <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-800 dark:bg-blue-900/20">
              <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">최종 복잡도</p>
              <div className="mt-2 overflow-x-auto">
                <EquationRenderer latex={String.raw`\tilde{O}((N + L) \log (N + L)) \text{ per layer}`} />
              </div>
              <p className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                N=256, L=16,384일 때 naive O(N^2 L) = 10^12 대비 약 10^5 -- <span className="font-bold">10,000,000배 빠름</span>.
                이 극적인 복잡도 환원이 S4를 최초의 실용적 장거리 SSM으로 만들었습니다.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* ── 6. 핵심 수식 모음 ───────────────────────────────── */}
      <section id="s4-equations" className="scroll-mt-20">
        <SectionHeading icon={<Hash className="h-5 w-5" />} title="핵심 수식 모음" collapsed={!!col['s4-equations']} onToggle={() => toggle('s4-equations')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['s4-equations'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="space-y-3">
              <EqCard idx={1} name="상태공간 모델 ODE" color="blue"
                latex={String.raw`x'(t) = \mathbf{A}\,x(t) + \mathbf{B}\,u(t), \quad y(t) = \mathbf{C}\,x(t) + \mathbf{D}\,u(t)`}
                description="SSM의 출발점. 입력 u(t)가 상태 x(t)를 거쳐 출력 y(t)로 변환되는 연속 동역학 시스템. A in R^{NxN}은 상태 전이 행렬, B in R^{Nx1}은 입력 투영, C in R^{1xN}은 출력 투영, D는 직접 전달(skip connection). A의 고유값이 상태의 감쇠율과 진동 주파수를 결정합니다. HiPPO 행렬로 A를 초기화하면 과거 신호를 직교 다항식 기저로 최적 압축하는 동역학이 됩니다." />

              <EqCard idx={2} name="ZOH 이산화" color="sky"
                latex={String.raw`\bar{\mathbf{A}} = e^{\Delta \mathbf{A}}, \quad \bar{\mathbf{B}} = (\Delta \mathbf{A})^{-1}(e^{\Delta \mathbf{A}} - \mathbf{I}) \cdot \Delta \mathbf{B}`}
                description="연속 ODE를 이산 점화식으로 변환. Delta는 이산화 스텝 크기로, 연속 시간과 이산 시퀀스를 연결하는 핵심 파라미터. ZOH(Zero-Order Hold)는 입력이 각 구간에서 상수라고 가정하는 방법. Delta가 크면 시간 해상도가 낮아지지만 장거리 포착에 유리하고, Delta가 작으면 미세 변화를 포착합니다. Delta를 학습 가능 파라미터로 두면 각 채널이 최적 시간 스케일을 자동 학습합니다." />

              <EqCard idx={3} name="컨볼루션 커널" color="indigo"
                latex={String.raw`\bar{\mathbf{K}} \in \mathbb{R}^L, \quad \bar{\mathbf{K}}_i = \mathbf{C}\bar{\mathbf{A}}^i\bar{\mathbf{B}}, \quad y = \bar{\mathbf{K}} * u`}
                description="SSM의 임펄스 응답을 L 스텝까지 펼친 것이 컨볼루션 커널. y = K * u로 입력 시퀀스 전체를 한 번에 처리. 핵심 문제: naive 계산은 행렬 거듭제곱 A^i 때문에 O(N^2 L). S4는 NPLR 분해로 이를 O((N+L) log(N+L))까지 줄입니다. 커널이 계산되면 FFT로 O(L log L) 합성곱을 수행합니다." />

              <EqCard idx={4} name="NPLR Cauchy kernel" color="green"
                latex={String.raw`\tilde{K}(\omega) = \sum_{i=1}^{N} \frac{C_i \cdot \tilde{B}_i}{\omega - \lambda_i}, \quad \text{(주파수 도메인)}`}
                description="Woodbury 항등식 적용 후 생성 함수의 각 항이 이 Cauchy dot-product 형태로 귀결됩니다. omega_j는 L개의 평가 주파수(단위근), lambda_i는 A의 N개 고유값. Naive 계산은 O(NL)이지만, Cauchy 행렬에는 분할정복 기반 O((N+L) log^2(N+L)) 알고리즘이 존재합니다. 총 4개의 Cauchy 곱으로 분해되므로 최종 복잡도는 O-tilde(N+L). 이것이 S4의 핵심 계산 기여입니다." />

              <EqCard idx={5} name="HiPPO-LegS 초기화" color="purple"
                latex={String.raw`A_{nk} = -\begin{cases} (2n+1)^{1/2}(2k+1)^{1/2} & n > k \\ n+1 & n = k \\ 0 & n < k \end{cases}`}
                description="HiPPO-LegS 행렬의 정의. 연속 신호의 과거 이력을 Legendre 다항식 기저로 최적 압축하도록 유도된 하삼각 행렬. 대각 원소 -(n+1)은 각 다항식 계수의 감쇠율을 결정하고, 하삼각 원소는 다항식 간 결합을 인코딩합니다. 이 구조가 장거리 메모리를 위한 초기 조건을 제공하며, 랜덤 A 대비 Sequential CIFAR에서 60% --> 98% 성능 차이를 만듭니다." />
            </div>
          </Card>
        </div>
      </section>

      {/* ── 7. 실험 결과 ────────────────────────────────────── */}
      <section id="s4-results" className="scroll-mt-20">
        <SectionHeading icon={<Layers className="h-5 w-5" />} title="실험 결과" collapsed={!!col['s4-results']} onToggle={() => toggle('s4-results')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['s4-results'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="6.1" title="Long Range Arena (LRA) 벤치마크" />
            <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
              LRA는 장거리 의존성 모델링 능력을 측정하기 위해 설계된 벤치마크로,
              시퀀스 길이 1K--16K에 걸쳐 6개 태스크를 포함합니다.
              S4 평균 86.09% vs Transformer 61.41% -- <span className="font-semibold text-blue-700 dark:text-blue-300">24.68%p 차이</span>.
            </p>
            <div className="mb-5 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">모델</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">ListOps</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">Text</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">Retrieval</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">Image</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">Pathfinder</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">Path-X</th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-700 dark:text-gray-300">평균</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { m: 'Transformer', v: ['36.37', '64.27', '57.46', '42.44', '71.40', '50.00'], avg: '53.66', hi: false },
                    { m: 'FNet',        v: ['35.33', '65.11', '59.61', '38.67', '77.80', '50.00'], avg: '54.42', hi: false },
                    { m: 'Performers',  v: ['18.01', '65.40', '53.82', '42.77', '77.05', '50.00'], avg: '51.18', hi: false },
                    { m: 'S4',          v: ['58.35', '86.82', '87.09', '88.65', '94.20', '96.35'], avg: '86.09', hi: true },
                  ].map((r, i) => (
                    <tr key={i} className={r.hi ? 'bg-blue-50 dark:bg-blue-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}>
                      <td className={`px-3 py-2 font-medium ${r.hi ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}>{r.m}</td>
                      {r.v.map((val, j) => (
                        <td key={j} className={`px-3 py-2 text-center font-mono ${r.hi ? 'font-semibold text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400'}`}>{val}</td>
                      ))}
                      <td className={`px-3 py-2 text-center font-mono font-bold ${r.hi ? 'text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400'}`}>{r.avg}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mb-5 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 dark:border-sky-800 dark:bg-sky-900/20">
              <p className="text-xs font-semibold text-sky-700 dark:text-sky-300">Path-X 하이라이트 (시퀀스 길이 16,384)</p>
              <p className="mt-1 text-xs leading-relaxed text-sky-600 dark:text-sky-400">
                128x128 이미지를 1차원 시퀀스(16,384 토큰)로 펼쳐 두 점의 연결 여부를 판별하는 태스크.
                기존 모든 Transformer 변종은 <span className="font-bold">50%</span>(랜덤 수준)에 머물렀고,
                S4가 <span className="font-bold">96.35%</span>로 최초 해결.
                이 결과가 SSM을 장거리 모델링의 실질적 대안으로 인정받게 한 결정적 증거입니다.
              </p>
            </div>

            <SubSectionHeading number="6.2" title="시퀀스 모델링" />
            <div className="mb-5 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">태스크</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">이전 SOTA</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">S4</th>
                    <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">비고</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { task: 'Sequential CIFAR-10',    prev: '84.0% (LSTM)', s4: '91.13%', note: '픽셀 단위 순차 분류. LSTM 대비 +7%p' },
                    { task: 'Speech Commands',        prev: '96.0%',        s4: '98.32%', note: '원시 오디오 16K 길이 분류' },
                    { task: '자기회귀 생성 속도',      prev: '1.0x (Transformer)', s4: '60x', note: '순환 모드 O(1)/step 스트리밍' },
                  ].map((r, i) => (
                    <tr key={i} className={i < 2 ? 'bg-blue-50 dark:bg-blue-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}>
                      <td className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">{r.task}</td>
                      <td className="px-3 py-2 text-center font-mono text-gray-600 dark:text-gray-400">{r.prev}</td>
                      <td className={`px-3 py-2 text-center font-mono font-semibold ${i < 2 ? 'text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400'}`}>{r.s4}</td>
                      <td className="px-3 py-2 text-gray-500 dark:text-gray-400">{r.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <SubSectionHeading number="6.3" title="핵심 관찰" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-800 dark:bg-blue-900/20">
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">S4는 왜 Path-X에서 유일하게 성공하는가?</p>
                <p className="mt-1 text-xs leading-relaxed text-blue-600 dark:text-blue-400">
                  HiPPO 초기화의 다항식 그래디언트 보존과 NPLR의 효율적 연산이 결합된 결과입니다.
                  HiPPO가 16,384 스텝 전 정보를 상태에 보존하고,
                  NPLR이 이를 실용적 시간 내에 계산할 수 있게 합니다.
                  두 요소 중 하나라도 빠지면 Path-X는 해결 불가능합니다.
                </p>
              </div>
              <div className="rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 dark:border-cyan-800 dark:bg-cyan-900/20">
                <p className="text-xs font-semibold text-cyan-700 dark:text-cyan-300">훈련-추론 이중성의 실용적 가치</p>
                <p className="mt-1 text-xs leading-relaxed text-cyan-600 dark:text-cyan-400">
                  훈련 시: 컨볼루션 모드로 GPU 병렬성을 최대 활용 (Transformer와 동등한 훈련 속도).
                  추론 시: 순환 모드로 O(1) 메모리 스트리밍 (Transformer의 KV-cache O(L) 대비 극적 절감).
                  이 이중 계산 모드는 S4 이후 모든 SSM 후속 연구의 기본 전제가 됩니다.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ── 8. 자기 점검 ────────────────────────────────────── */}
      <section id="s4-quiz" className="scroll-mt-20">
        <SectionHeading icon={<GraduationCap className="h-5 w-5" />} title="자기 점검" />
        <Card>
          <QuizSection color="blue" questions={[
            {
              q: 'S4가 제안하는 "이중 계산 모드"(컨볼루션 훈련 + 순환 추론)의 원리와, 이것이 기존 Transformer 대비 어떤 실용적 이점을 제공하는지 설명하라.',
              a: 'S4의 상태공간 모델은 연속 ODE를 ZOH로 이산화하면 x_k = Abark x_{k-1} + Bbark u_k 형태의 선형 순환이 됩니다. 이 순환을 풀어쓰면 y_k = Sigma CAbari Bbar * u_{k-i}로 컨볼루션과 동치입니다. 따라서 동일한 파라미터(A, B, C, Delta)로 두 가지 연산이 가능합니다. 훈련 시: 컨볼루션 모드로 전체 시퀀스를 FFT로 O(L log L)에 병렬 처리. 추론 시: 순환 모드로 O(1) 메모리, 상수 시간 per step. 반면 Transformer는 훈련/추론 모두 O(L^2) 어텐션이 필요하고, KV-cache로도 추론 시 O(L) 메모리가 필요합니다.',
            },
            {
              q: 'NPLR 분해가 필요한 이유는 무엇이며, 왜 단순 대각화로는 HiPPO 행렬을 효율적으로 처리할 수 없는가?',
              a: 'HiPPO-LegS A 행렬은 비정규(non-normal) 행렬이어서 직교 대각화가 불가능합니다. 단순히 고유값 분해하면 조건수가 매우 나빠져 수치적으로 불안정하고, 대각 근사(S4D)는 정보를 손실합니다. NPLR 분해 A = V Lambda V* - PQ*는 "대각 + 저랭크 보정"으로 HiPPO의 구조를 정확히 보존하면서, 컨볼루션 커널 계산을 Cauchy kernel Sigma C_i/(omega-lambda_i)로 변환합니다. Cauchy kernel은 O(N) FFT로 계산 가능하므로, 전체 복잡도가 O((N+L)log(N+L))로 줄어듭니다.',
            },
            {
              q: 'S4가 Long Range Arena의 Path-X(16384 스텝)에서 유일하게 성공한 모델인 이유를 HiPPO 초기화와 NPLR의 관점에서 설명하라.',
              a: 'Path-X는 128x128 이미지를 1차원 시퀀스(16384 토큰)로 펼쳐 경로를 추적하는 태스크로, 시퀀스 처음과 끝의 장거리 의존성이 필수입니다. (1) HiPPO-LegS 초기화: 그래디언트가 Theta(1/t)로 다항식 감쇠하여 16384 스텝에서도 학습 신호가 전달됩니다. (2) NPLR 분해: O((N+L)logL) 복잡도로 L=16384도 실용적 훈련이 가능합니다. Transformer는 O(L^2)=O(2.7억) 어텐션으로 메모리/계산 모두 불가능하고, 게이트 RNN은 지수 그래디언트 소실로 16384 스텝의 의존성을 학습할 수 없습니다.',
            },
            {
              q: '이산화 스텝 크기 Delta가 S4 모델의 행동에 미치는 영향을 설명하고, Delta를 학습 가능 파라미터로 설정하는 것의 의미는?',
              a: 'Delta는 연속 시간 ODE를 이산 시퀀스로 변환하는 시간 해상도를 결정합니다. Delta가 작으면: 미세한 시간 변화를 포착하지만 장거리 의존성 포착이 어려움(많은 스텝 필요). Delta가 크면: 시간 해상도가 낮아지지만 한 스텝이 넓은 시간 범위를 커버하여 장거리 패턴 포착이 용이. Delta를 학습 가능하게 하면 각 채널/레이어가 자체적으로 최적 시간 스케일을 학습합니다. 이는 Multi-head attention이 다양한 패턴을 포착하는 것과 유사하게, 다양한 Delta 값이 다양한 시간 스케일의 특징을 포착합니다. Mamba는 이 아이디어를 더 발전시켜 Delta를 입력 의존적으로 만듭니다.',
            },
          ]} />
        </Card>
      </section>

    </div>
    </GlossaryText>
  );
}
