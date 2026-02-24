'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import katex from 'katex';
import { ChevronDown } from 'lucide-react';

const DirichletKernelViz = dynamic(
  () => import('./infographics/DirichletKernelViz'),
  { ssr: false },
);
const SSMExponentialModeViz = dynamic(
  () => import('./infographics/SSMExponentialModeViz'),
  { ssr: false },
);

/* ---------- tiny KaTeX helpers ---------- */
function Eq({ latex }: { latex: string }) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(latex, { throwOnError: false, displayMode: true });
    } catch {
      return null;
    }
  }, [latex]);
  if (!html) return <code className="text-xs">{latex}</code>;
  return (
    <div
      className="overflow-x-auto py-1 text-gray-900 dark:text-gray-100"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function EqI({ latex }: { latex: string }) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(latex, { throwOnError: false, displayMode: false });
    } catch {
      return null;
    }
  }, [latex]);
  if (!html) return <code className="text-xs">{latex}</code>;
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

/* ---------- Concept card ---------- */
interface ConceptCardProps {
  id: string;
  badge: string;
  badgeColor: string; // tailwind bg classes
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

function ConceptCard({ id, badge, badgeColor, title, subtitle, children }: ConceptCardProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-gray-50 dark:hover:bg-gray-800"
      >
        <span className={`mt-0.5 shrink-0 rounded px-2 py-0.5 text-xs font-bold ${badgeColor}`}>{badge}</span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{title}</p>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
        </div>
        <ChevronDown
          className={`mt-1 h-4 w-4 shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="border-t border-gray-100 px-4 py-4 dark:border-gray-800">
          {children}
        </div>
      )}
    </div>
  );
}

/* ---------- Inline SVG: Lipschitz ---------- */
function LipschitzSVG() {
  return (
    <svg viewBox="0 0 300 130" width="100%" height={130} className="block">
      {/* Axes */}
      <line x1={30} y1={10} x2={30} y2={110} stroke="#9ca3af" strokeWidth={0.7} />
      <line x1={30} y1={110} x2={290} y2={110} stroke="#9ca3af" strokeWidth={0.7} />
      <text x={292} y={112} fontSize={7} fill="#9ca3af">x</text>
      <text x={32} y={12} fontSize={7} fill="#9ca3af">f(x)</text>

      {/* A Lipschitz-continuous curve (moderate slope) */}
      <path d="M 50,95 C 80,75 120,50 160,40 C 200,30 230,28 260,25" fill="none" stroke="#6366f1" strokeWidth={2} />

      {/* Two points x1, x2 */}
      <circle cx={80} cy={76} r={3} fill="#6366f1" />
      <circle cx={200} cy={30} r={3} fill="#6366f1" />

      {/* Horizontal dist label */}
      <line x1={80} y1={110} x2={80} y2={76} stroke="#9ca3af" strokeWidth={0.5} strokeDasharray="2,2" />
      <line x1={200} y1={110} x2={200} y2={30} stroke="#9ca3af" strokeWidth={0.5} strokeDasharray="2,2" />
      <line x1={80} y1={118} x2={200} y2={118} stroke="#f97316" strokeWidth={1.5} markerEnd="url(#arrowLip)" />
      <text x={140} y={128} textAnchor="middle" fontSize={7} fill="#f97316">‖x - x′‖ = Δx</text>

      {/* Vertical dist label */}
      <line x1={210} y1={76} x2={210} y2={30} stroke="#16a34a" strokeWidth={1.5} markerEnd="url(#arrowLip2)" />
      <text x={240} y={55} fontSize={7} fill="#16a34a">‖f(x)−f(x′)‖</text>
      <text x={240} y={64} fontSize={7} fill="#16a34a">≤ L·Δx</text>

      {/* Slope cone illustration */}
      <path d="M 80,76 L 200,76 L 200,30" fill="none" stroke="#9ca3af" strokeWidth={0.5} strokeDasharray="2,2" />

      <defs>
        <marker id="arrowLip" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="#f97316" />
        </marker>
        <marker id="arrowLip2" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="#16a34a" />
        </marker>
      </defs>
    </svg>
  );
}

/* ---------- Inline SVG: contraction ---------- */
function ContractionSVG() {
  return (
    <svg viewBox="0 0 340 120" width="100%" height={120} className="block">
      {/* t=0 */}
      <text x={45} y={12} textAnchor="middle" fontSize={7} fill="#9ca3af">t = 0</text>
      <circle cx={30} cy={40} r={5} fill="#6366f1" />
      <circle cx={60} cy={40} r={5} fill="#f97316" />
      <line x1={35} y1={40} x2={55} y2={40} stroke="#e5e7eb" strokeWidth={1} />
      <text x={45} y={55} textAnchor="middle" fontSize={6.5} fill="#9ca3af">‖s₀ - ŝ₀‖ = ε</text>

      {/* Arrow */}
      <path d="M 75,40 Q 95,20 115,40" fill="none" stroke="#9ca3af" strokeWidth={1} markerEnd="url(#aContArrow)" />
      <text x={95} y={25} textAnchor="middle" fontSize={6.5} fill="#9ca3af">Φ_t (ρ&lt;1)</text>

      {/* t=1 */}
      <text x={145} y={12} textAnchor="middle" fontSize={7} fill="#9ca3af">t = 1</text>
      <circle cx={135} cy={40} r={5} fill="#6366f1" />
      <circle cx={155} cy={40} r={5} fill="#f97316" />
      <line x1={140} y1={40} x2={150} y2={40} stroke="#e5e7eb" strokeWidth={1} />
      <text x={145} y={55} textAnchor="middle" fontSize={6.5} fill="#9ca3af">‖s₁ - ŝ₁‖ ≤ ρε</text>

      {/* Arrow */}
      <path d="M 168,40 Q 188,20 208,40" fill="none" stroke="#9ca3af" strokeWidth={1} markerEnd="url(#aContArrow)" />
      <text x={188} y={25} textAnchor="middle" fontSize={6.5} fill="#9ca3af">Φ_t (ρ&lt;1)</text>

      {/* t=2 */}
      <text x={230} y={12} textAnchor="middle" fontSize={7} fill="#9ca3af">t = 2</text>
      <circle cx={224} cy={40} r={5} fill="#6366f1" />
      <circle cx={236} cy={40} r={5} fill="#f97316" />
      <line x1={229} y1={40} x2={231} y2={40} stroke="#e5e7eb" strokeWidth={1} />
      <text x={230} y={55} textAnchor="middle" fontSize={6.5} fill="#9ca3af">‖s₂ - ŝ₂‖ ≤ ρ²ε</text>

      <text x={270} y={42} fontSize={7} fill="#9ca3af">→ 0</text>
      <text x={270} y={52} fontSize={7} fill="#9ca3af">(t↑)</text>

      {/* Bottom label */}
      <text x={170} y={80} textAnchor="middle" fontSize={7} fill="#6366f1" fontWeight="bold">
        두 궤적이 지수적으로 수렴: 양자화 오차(Δθ)의 영향이 쌓이지 않음
      </text>

      <defs>
        <marker id="aContArrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="#9ca3af" />
        </marker>
      </defs>
    </svg>
  );
}

/* ================================================================ */
/*  Main component                                                    */
/* ================================================================ */
export default function ConceptsSection() {
  return (
    <div className="space-y-3">
      {/* ─── Card 0: 왜 이 개념들이 필요한가 ─── */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-800 dark:bg-blue-950/20">
        <p className="text-xs leading-relaxed text-blue-700 dark:text-blue-300">
          이 논문의 핵심 주장은 두 가지입니다:{' '}
          <span className="font-bold">(1) SSM 인코더가 CNN보다 구조적으로 손실이 적다</span>는 것과{' '}
          <span className="font-bold">(2) SSM이 양자화에 강건하다</span>는 것입니다.
          두 주장 모두를 이해하려면 DFT 누설(Dirichlet 커널), SSM의 지수 모드 구조, Lipschitz 연속성이라는
          세 가지 수학 배경이 필요합니다. 아래 카드를 순서대로 펼쳐보세요.
        </p>
      </div>

      {/* ─── Card 1: DFT 리뷰 ─── */}
      <ConceptCard
        id="dft"
        badge="개념 1"
        badgeColor="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
        title="DFT와 Dirichlet 커널이란?"
        subtitle="유한 DFT가 왜 스펙트럼 누설을 일으키는가"
      >
        <div className="space-y-3 text-xs leading-relaxed text-gray-700 dark:text-gray-300">
          <p>
            N점 DFT는 이산 신호 x[n]을 복소 지수 기저 e^{'{j2πkn/N}'}의 계수로 분해합니다.
            기저는 <strong>정수 주파수 격자</strong>에만 정의되어 있습니다.
          </p>

          {/* DFT formula */}
          <div className="rounded-lg bg-orange-50 p-2 dark:bg-orange-900/20">
            <p className="mb-1 font-semibold text-orange-700 dark:text-orange-300">N점 DFT:</p>
            <Eq latex={String.raw`X[k] = \sum_{n=0}^{N-1} x[n]\, e^{-j2\pi kn/N}, \quad k = 0,1,\ldots,N-1`} />
          </div>

          <p>
            만약 신호가 주파수 <EqI latex={String.raw`f_0 + \delta`} /> (단, δ≠0이면 격자 밖)에 있다면?
            DFT는 무한 길이 신호를 N점으로 <strong>잘라낸 후</strong> 분석합니다.
            이 &ldquo;자르기&rdquo;는 시간 도메인에서 직사각형 윈도우 곱셈이고,
            주파수 도메인에서는 <strong>Dirichlet 커널과의 컨볼루션</strong>이 됩니다.
          </p>

          {/* Dirichlet kernel */}
          <div className="rounded-lg bg-orange-50 p-2 dark:bg-orange-900/20">
            <p className="mb-1 font-semibold text-orange-700 dark:text-orange-300">Dirichlet 커널 크기 (bin d에서의 누설):</p>
            <Eq latex={String.raw`|X[d]|\;=\;\frac{\bigl|\sin\!\bigl(\pi({\delta-d})\bigr)\bigr|}{N\,\bigl|\sin\!\bigl(\tfrac{\pi(\delta-d)}{N}\bigr)\bigr|}`} />
            <p className="mt-1 text-orange-600 dark:text-orange-400">
              δ=0(on-grid)이면 d=0 에만 에너지가 있고, δ≠0(off-grid)이면 모든 d로 누설됩니다.
            </p>
          </div>

          <p>
            <strong>왜 1/(1+|d|) 포락선인가?</strong>{' '}
            d가 클 때 분모의 sin(π(δ-d)/N) ≈ π(δ-d)/N 이고 분자 |sin(π(δ-d))| ≤ 1이므로,
          </p>
          <div className="rounded-lg bg-orange-50 p-2 dark:bg-orange-900/20">
            <Eq latex={String.raw`|X[d]|\;\lesssim\;\frac{1}{N\cdot\pi\,\bigl|\delta-d\bigr|/N}\;=\;\frac{1}{\pi|\delta-d|}\;\sim\;\frac{c_0}{1+|d|}`} />
          </div>
          <p>
            즉 오프셋이 d빈 떨어진 곳의 누설 크기는 <em>다항식적으로(1/d 꼴로)</em> 감소합니다.
            이것이 논문 §3.2의 포락선 <EqI latex={String.raw`|x_i| \lesssim c_0/(1+|i-i_0|)`} /> 의 근거입니다.
          </p>

          {/* Interactive viz */}
          <DirichletKernelViz />
        </div>
      </ConceptCard>

      {/* ─── Card 2: 왜 1/(1+d) 포락선이 문제인가 ─── */}
      <ConceptCard
        id="logtail"
        badge="개념 2"
        badgeColor="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
        title="왜 1/(1+d) 감쇠가 CNN에게 문제인가?"
        subtitle="하드 절단 손실 = O(L⁻¹) — 수용장을 늘려도 천천히 줄어든다"
      >
        <div className="space-y-3 text-xs leading-relaxed text-gray-700 dark:text-gray-300">
          <p>
            CNN 인코더는 수용장(receptive field) 반경 <EqI latex="L" /> 내부만 처리하고,
            그 바깥의 계수는 완전히 버립니다 (<strong>하드 절단</strong>).
            Dirichlet 포락선에서 반경 L 바깥에 남은 에너지는:
          </p>
          <div className="rounded-lg bg-red-50 p-2 dark:bg-red-900/20">
            <Eq latex={String.raw`E_{\rm hard}(L) \;=\; \sum_{|i-i_0|>L}|x_i|^2 \;\le\; \frac{c_0^2}{1+L} \;=\; \mathcal{O}(L^{-1})`} />
          </div>
          <p>
            <strong>핵심 문제:</strong> 절단 손실이 다항식(1/L)으로 감소하므로, 손실을 절반으로 줄이려면
            L을 두 배 늘려야 합니다 → 인코더 연산량·지연이 두 배.
            UE 자원 예산이 타이트하면 이 확장은 실현 불가합니다.
          </p>

          {/* Simple number example */}
          <div className="overflow-x-auto rounded-lg border border-red-200 dark:border-red-800">
            <table className="w-full text-center text-[10px]">
              <thead>
                <tr className="bg-red-50 dark:bg-red-900/20">
                  <th className="px-3 py-1.5 text-left text-red-700 dark:text-red-300">수용장 L</th>
                  <th className="px-3 py-1.5 text-red-700 dark:text-red-300">하드 절단 손실 ∝</th>
                  <th className="px-3 py-1.5 text-red-700 dark:text-red-300">SSM 소프트 잔여 ∝</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-100 dark:divide-red-900/20">
                {[4, 8, 16, 32, 64].map((L) => (
                  <tr key={L} className="hover:bg-red-50/50 dark:hover:bg-red-900/10">
                    <td className="px-3 py-1.5 text-left font-mono">{L}</td>
                    <td className="px-3 py-1.5 font-mono text-red-600 dark:text-red-400">1/{L + 1} ≈ {(1 / (L + 1)).toFixed(3)}</td>
                    <td className="px-3 py-1.5 font-mono text-green-600 dark:text-green-400">e^(-{L}) ≈ {Math.exp(-L * 0.3).toExponential(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-gray-500 dark:text-gray-400 italic">
            (SSM의 감쇠율 α=0.3 가정. 같은 L에서 SSM 잔여가 지수 배율로 작음)
          </p>
        </div>
      </ConceptCard>

      {/* ─── Card 3: SSM = 지수 모드 커널 ─── */}
      <ConceptCard
        id="ssm-modes"
        badge="개념 3"
        badgeColor="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
        title="왜 SSM은 지수 모드 커널들의 합인가?"
        subtitle="상태 방정식을 풀면 y_k = Σ CA^d B · u_{k-d} 형태가 나온다"
      >
        <div className="space-y-3 text-xs leading-relaxed text-gray-700 dark:text-gray-300">
          <p>
            선형 SSM의 상태 방정식은:
          </p>
          <div className="rounded-lg bg-indigo-50 p-2 dark:bg-indigo-900/20">
            <Eq latex={String.raw`\mathbf{s}_{k+1} = \mathbf{A}\mathbf{s}_k + \mathbf{B}\mathbf{u}_k,\quad \mathbf{y}_k = \mathbf{C}\mathbf{s}_k`} />
          </div>
          <p>
            이 점화식을 반복 대입하면(<EqI latex="\mathbf{s}_0 = \mathbf{0}" /> 가정):
          </p>
          <div className="rounded-lg bg-indigo-50 p-2 dark:bg-indigo-900/20">
            <Eq latex={String.raw`\mathbf{s}_k = \sum_{d=0}^{k-1}\mathbf{A}^d \mathbf{B}\mathbf{u}_{k-1-d}\;\;\Rightarrow\;\; \mathbf{y}_k = \underbrace{\mathbf{C}\sum_{d\ge 0}\mathbf{A}^d\mathbf{B}}_{\text{컨볼루션 커널}}\mathbf{u}_{k-d}`} />
          </div>
          <p>
            즉 출력 <EqI latex="\mathbf{y}_k" />는 과거 입력 <EqI latex="\mathbf{u}_{k-d}" />와의 컨볼루션입니다.
            커널의 d번째 원소는 <EqI latex="\mathbf{C}\mathbf{A}^d\mathbf{B}" />.
          </p>

          <div className="rounded-xl border border-indigo-200 bg-white p-3 dark:border-indigo-800 dark:bg-indigo-950/30">
            <p className="mb-1.5 font-bold text-indigo-700 dark:text-indigo-300">왜 지수 감쇠인가?</p>
            <p>
              A를 고유값 분해하면 <EqI latex="\mathbf{A} = \mathbf{U}\boldsymbol{\Lambda}\mathbf{U}^{-1}" />이므로
              <EqI latex="\mathbf{A}^d = \mathbf{U}\boldsymbol{\Lambda}^d\mathbf{U}^{-1}" />.
              각 고유값 <EqI latex="\lambda_i = e^{-\alpha_i}" /> (<EqI latex="|\lambda_i| < 1" /> 안정 조건)에 대해
              <EqI latex="\lambda_i^d = e^{-\alpha_i d}" />.
              따라서 d번째 커널 원소는 <em>M개의 지수 함수 <EqI latex="e^{-\alpha_i d}" />의 선형 조합</em>:
            </p>
            <div className="mt-2 rounded bg-indigo-50 p-2 dark:bg-indigo-900/20">
              <Eq latex={String.raw`(\mathbf{C}\mathbf{A}^d\mathbf{B})_{ij} = \sum_{m=1}^{M} c_{im}\,\lambda_m^d\,b_{mj} = \sum_{m=1}^{M} w_m\,e^{-\alpha_m d}`} />
            </div>
            <p className="mt-1.5 text-gray-500 dark:text-gray-400">
              각 고유값 하나 = 하나의 지수 모드. 상태 차원 M = 모드 수.
            </p>
          </div>

          <SSMExponentialModeViz />
        </div>
      </ConceptCard>

      {/* ─── Card 4: 왜 SSM이 Dirichlet 표현에 효율적인가 ─── */}
      <ConceptCard
        id="laplace-mixture"
        badge="개념 4"
        badgeColor="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
        title="왜 SSM이 Dirichlet(다항 감쇠)을 효율적으로 표현하는가?"
        subtitle="1/(d+1) = 지수 모드의 Laplace 혼합 — 수학적 근거"
      >
        <div className="space-y-3 text-xs leading-relaxed text-gray-700 dark:text-gray-300">
          <p>
            개념 3에서 SSM 커널은 지수 함수들의 합임을 보였습니다.
            개념 1에서 Dirichlet 포락선은 1/(1+d) ∝ 1/d 형태의 다항 감쇠임을 보였습니다.
            <strong>이 두 가지가 어떻게 연결되는가?</strong>
          </p>

          <div className="rounded-xl border border-purple-200 bg-purple-50 p-3 dark:border-purple-800 dark:bg-purple-950/20">
            <p className="mb-1.5 font-bold text-purple-700 dark:text-purple-300">Laplace 혼합 표현 (논문 Remark 1)</p>
            <Eq latex={String.raw`\frac{1}{d+1} = \int_{0}^{\infty} e^{-(d+1)\alpha}\,d\alpha = \int_{0}^{\infty} e^{-\alpha}\cdot e^{-\alpha d}\,d\alpha`} />
            <p className="mt-2 text-purple-600 dark:text-purple-400">
              해석: 다항 감쇠 1/(d+1)는 <strong>모든 가능한 감쇠율 α에 대한 지수 모드 e^{'{-αd}'} 의 연속 혼합</strong>입니다.
            </p>
          </div>

          <p>
            <strong>유한 SSM의 근사:</strong> 연속 적분 대신, 유한 M개의 이산 α값으로 근사합니다.
            M이 클수록 더 많은 모드가 다양한 감쇠율을 포착하여 1/(1+d)에 가까워집니다.
            (개념 3의 인터랙티브 도표에서 직접 확인!)
          </p>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-red-200 bg-red-50 p-2 dark:border-red-800 dark:bg-red-950/20">
              <p className="mb-1 font-bold text-red-700 dark:text-red-300">CNN (하드 절단)</p>
              <p className="text-red-600 dark:text-red-400">
                반경 L 바깥 모든 계수 = 0. 다항 꼬리를 <em>표현할 수 없어</em> 잘라버림.
                잔여: <EqI latex="\mathcal{O}(L^{-1})" />
              </p>
            </div>
            <div className="rounded-lg border border-green-200 bg-green-50 p-2 dark:border-green-800 dark:bg-green-950/20">
              <p className="mb-1 font-bold text-green-700 dark:text-green-300">SSM (소프트 집약)</p>
              <p className="text-green-600 dark:text-green-400">
                지수 모드가 다항 꼬리를 근사 표현. 원거리 성분을 <em>감쇠시키되 유지</em>.
                잔여: <EqI latex="\mathcal{O}(e^{-\alpha L}/L)" />
              </p>
            </div>
          </div>

          <p>
            결론: SSM은 자신의 구조(지수 모드의 합)가 CSI의 Dirichlet 포락선 형태와
            <strong>수학적으로 정렬</strong>되어 있어, 같은 파라미터 수로 더 많은 CSI 에너지를 보존합니다.
          </p>
        </div>
      </ConceptCard>

      {/* ─── Card 5: Lipschitz 연속성이란 ─── */}
      <ConceptCard
        id="lipschitz"
        badge="개념 5"
        badgeColor="bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300"
        title="Lipschitz 연속성이란?"
        subtitle="함수가 '얼마나 급격히 변할 수 있는가'에 상한을 두는 조건"
      >
        <div className="space-y-3 text-xs leading-relaxed text-gray-700 dark:text-gray-300">
          <p>
            함수 <EqI latex="f: \mathcal{X} \to \mathcal{Y}" />가 Lipschitz 연속이라는 것은,
            어떤 상수 <EqI latex="L \ge 0" /> (Lipschitz 상수)이 존재하여:
          </p>
          <div className="rounded-lg bg-teal-50 p-2 dark:bg-teal-900/20">
            <Eq latex={String.raw`\|f(x) - f(x')\| \;\le\; L \cdot \|x - x'\| \quad \forall\, x, x' \in \mathcal{X}`} />
          </div>

          <p>
            <strong>직관:</strong> 입력이 ε만큼 변하면 출력은 <em>최대 L·ε만큼</em> 변합니다.
            L이 작을수록 함수가 더 안정적(변화에 둔감)입니다.
          </p>

          <LipschitzSVG />

          <div className="mt-1 grid grid-cols-3 gap-2 text-[10px]">
            <div className="rounded-lg border border-teal-200 bg-teal-50 p-2 dark:border-teal-800 dark:bg-teal-950/20">
              <p className="font-bold text-teal-700 dark:text-teal-300">L = 0</p>
              <p className="text-teal-600 dark:text-teal-400">상수 함수 (완전 불변)</p>
            </div>
            <div className="rounded-lg border border-teal-200 bg-teal-50 p-2 dark:border-teal-800 dark:bg-teal-950/20">
              <p className="font-bold text-teal-700 dark:text-teal-300">0 &lt; L &lt; 1</p>
              <p className="text-teal-600 dark:text-teal-400"><strong>수축 사상</strong> — 차이가 줄어듦</p>
            </div>
            <div className="rounded-lg border border-teal-200 bg-teal-50 p-2 dark:border-teal-800 dark:bg-teal-950/20">
              <p className="font-bold text-teal-700 dark:text-teal-300">L &gt; 1</p>
              <p className="text-teal-600 dark:text-teal-400">팽창 사상 — 차이가 늘 수 있음</p>
            </div>
          </div>

          <p>
            논문에서는 상태 전이 <EqI latex="\Phi_t(\mathbf{s}, \mathbf{u}; \boldsymbol{\theta})" />가
            상태 <EqI latex="\mathbf{s}" />에 대해 <EqI latex="\rho" />-Lipschitz (<EqI latex="\rho < 1" />)라고 가정합니다.
            즉 <EqI latex="\|\Phi_t(\mathbf{s},\cdot) - \Phi_t(\mathbf{s}',\cdot)\| \le \rho\|\mathbf{s}-\mathbf{s}'\|" />.
            이것이 <strong>&ldquo;수축 사상&rdquo;</strong> 조건이며, ρ&lt;1이면 두 궤적이 지수적으로 수렴합니다.
          </p>
        </div>
      </ConceptCard>

      {/* ─── Card 6: 왜 양자화에 강건한가 ─── */}
      <ConceptCard
        id="quant-robust"
        badge="개념 6"
        badgeColor="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
        title="왜 수축 SSM은 양자화에 강건한가?"
        subtitle="명제의 증명 직관 — ρ<1이면 오차가 시퀀스 길이에 따라 쌓이지 않는다"
      >
        <div className="space-y-3 text-xs leading-relaxed text-gray-700 dark:text-gray-300">
          <p>
            양자화 = 파라미터에 섭동 <EqI latex="\hat{\boldsymbol{\theta}} = \boldsymbol{\theta} + \Delta\boldsymbol{\theta}" /> 를 추가하는 것으로 모델링합니다.
            양자화된 인코더와 원본 인코더의 상태 차이 <EqI latex="e_t = \|\mathbf{s}_t - \hat{\mathbf{s}}_t\|" />가
            시간에 따라 어떻게 변하는지 추적합니다.
          </p>

          <div className="rounded-xl border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950/20">
            <p className="mb-1.5 font-bold text-green-700 dark:text-green-300">증명 핵심 (삼각 부등식 적용)</p>
            <Eq latex={String.raw`e_{t+1} \;\le\; \underbrace{\rho\, e_t}_{\text{수축 항}} + \underbrace{L_{\Phi,\theta}\|\Delta\boldsymbol{\theta}\|}_{\text{양자화 오차 주입}}`} />
            <p className="mt-2 text-green-600 dark:text-green-400">
              초기 조건 <EqI latex="e_0 = 0" />, ρ&lt;1이므로 반복하면:
            </p>
            <Eq latex={String.raw`e_t \;\le\; \frac{L_{\Phi,\theta}}{1-\rho}\|\Delta\boldsymbol{\theta}\| \quad \forall\, t`} />
          </div>

          <p>
            <strong>핵심:</strong> 우변에 <EqI latex="t" />가 없습니다.
            즉 시퀀스가 아무리 길어도 (t → ∞) 상태 오차가 유계됩니다.
            이것은 수축률 ρ&lt;1이 오차 증폭을 막기 때문입니다.
          </p>

          <ContractionSVG />

          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="rounded-lg border border-red-200 bg-red-50 p-2 dark:border-red-800 dark:bg-red-950/20">
              <p className="font-bold text-red-700 dark:text-red-300">수축 없이 (ρ≥1)</p>
              <p className="text-red-600 dark:text-red-400">
                오차가 t와 함께 <em>증폭</em>. 시퀀스가 길면 양자화 노이즈가 누적되어 출력이 파괴됨.
                (CNN 깊은 레이어 or RNN 그래디언트 폭발과 유사)
              </p>
            </div>
            <div className="rounded-lg border border-green-200 bg-green-50 p-2 dark:border-green-800 dark:bg-green-950/20">
              <p className="font-bold text-green-700 dark:text-green-300">수축 SSM (ρ&lt;1)</p>
              <p className="text-green-600 dark:text-green-400">
                오차가 <EqI latex="\|\Delta\theta\|" /> 에 선형이고 t에 무관하게 유계.
                INT8이어도 NMSE가 -15dB를 유지하는 실험 결과의 이론적 근거.
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-gray-100 p-2 dark:bg-gray-800">
            <p className="font-mono text-[10px] text-gray-500 dark:text-gray-400">
              최종 출력 경계 (Proposition 1):
            </p>
            <Eq latex={String.raw`\|\mathbf{y}_t - \hat{\mathbf{y}}_t\| \;\le\; \Bigl(\frac{L_\Psi L_{\Phi,\theta}}{1-\rho} + L_{\Psi,\theta}\Bigr)\|\Delta\boldsymbol{\theta}\|`} />
            <p className="text-[10px] text-gray-500 dark:text-gray-400">
              L_Ψ: 출력 함수 Lipschitz 상수 / L_{'{Φ,θ}'}: 전이 함수의 파라미터에 대한 Lipschitz 상수
            </p>
          </div>
        </div>
      </ConceptCard>
    </div>
  );
}
