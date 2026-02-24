'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import katex from 'katex';
import { ChevronDown, ChevronsUpDown } from 'lucide-react';

const DirichletKernelViz = dynamic(
  () => import('./infographics/DirichletKernelViz'),
  { ssr: false },
);
const SSMExponentialModeViz = dynamic(
  () => import('./infographics/SSMExponentialModeViz'),
  { ssr: false },
);
const ULASpatialFreqViz = dynamic(
  () => import('./infographics/ULASpatialFreqViz'),
  { ssr: false },
);

/* ---------- KaTeX helpers ---------- */
function Eq({ latex }: { latex: string }) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(latex, { throwOnError: false, displayMode: true });
    } catch {
      return null;
    }
  }, [latex]);
  if (!html) return <code className="text-sm">{latex}</code>;
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
  if (!html) return <code className="text-sm">{latex}</code>;
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

/* ---------- Concept card ---------- */
function ConceptCard({
  badge,
  badgeColor,
  title,
  subtitle,
  children,
  open,
  onToggle,
}: {
  badge: string;
  badgeColor: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start gap-3 px-5 py-4 text-left transition hover:bg-gray-50 dark:hover:bg-gray-800"
      >
        <span className={`mt-0.5 shrink-0 rounded px-2 py-0.5 text-xs font-black ${badgeColor}`}>{badge}</span>
        <div className="min-w-0 flex-1">
          <p className="text-base font-bold text-gray-800 dark:text-gray-100">{title}</p>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
        </div>
        <ChevronDown
          className={`mt-1 h-5 w-5 shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="border-t border-gray-100 px-5 py-5 dark:border-gray-800">
          {children}
        </div>
      )}
    </div>
  );
}

/* ---------- Proof step component ---------- */
function ProofStep({
  step,
  label,
  children,
}: {
  step: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-black text-white">
          {step}
        </span>
        <div className="mt-1 w-px flex-1 bg-indigo-200 dark:bg-indigo-800" />
      </div>
      <div className="min-w-0 flex-1 pb-4">
        <p className="mb-1 text-xs font-bold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">{label}</p>
        {children}
      </div>
    </div>
  );
}

/* ---------- SVG: Lipschitz slope cone ---------- */
function LipschitzSVG() {
  return (
    <svg viewBox="0 0 480 160" width="100%" height={160} className="block">
      <defs>
        <marker id="axArrow" markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto">
          <path d="M0,0 L0,7 L7,3.5 z" fill="#9ca3af" />
        </marker>
        <marker id="orangeArrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="#f97316" />
        </marker>
        <marker id="greenArrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="#16a34a" />
        </marker>
      </defs>

      {/* Panel 1: Lipschitz continuous (bounded slope) */}
      <text x={100} y={14} textAnchor="middle" fontSize={9} fill="#6366f1" fontWeight="bold">Lipschitz 연속 (L &lt; ∞)</text>
      <line x1={20} y1={130} x2={185} y2={130} stroke="#9ca3af" strokeWidth={0.7} markerEnd="url(#axArrow)" />
      <line x1={25} y1={135} x2={25} y2={20} stroke="#9ca3af" strokeWidth={0.7} markerEnd="url(#axArrow)" />
      <text x={188} y={133} fontSize={7} fill="#9ca3af">x</text>
      <text x={27} y={18} fontSize={7} fill="#9ca3af">f(x)</text>
      {/* Smooth bounded curve */}
      <path d="M 35,120 C 60,100 90,70 115,55 C 140,40 160,35 175,30" fill="none" stroke="#6366f1" strokeWidth={2} />
      {/* Two points */}
      <circle cx={65} cy={93} r={3} fill="#6366f1" />
      <circle cx={145} cy={42} r={3} fill="#6366f1" />
      {/* Horizontal bracket */}
      <line x1={65} y1={130} x2={65} y2={93} stroke="#9ca3af" strokeWidth={0.5} strokeDasharray="2,2" />
      <line x1={145} y1={130} x2={145} y2={42} stroke="#9ca3af" strokeWidth={0.5} strokeDasharray="2,2" />
      <line x1={65} y1={143} x2={145} y2={143} stroke="#f97316" strokeWidth={1.5} markerEnd="url(#orangeArrow)" />
      <text x={105} y={153} textAnchor="middle" fontSize={7} fill="#f97316">‖x − x′‖</text>
      {/* Vertical bracket */}
      <line x1={157} y1={93} x2={157} y2={42} stroke="#16a34a" strokeWidth={1.5} markerEnd="url(#greenArrow)" />
      <text x={168} y={72} fontSize={7} fill="#16a34a">‖f(x)−f(x′)‖</text>
      <text x={168} y={82} fontSize={7} fill="#16a34a">≤ L·‖x−x′‖</text>

      {/* Divider */}
      <line x1={240} y1={15} x2={240} y2={145} stroke="#e5e7eb" strokeWidth={0.5} strokeDasharray="3,3" />

      {/* Panel 2: NOT Lipschitz (vertical tangent / unbounded slope) */}
      <text x={360} y={14} textAnchor="middle" fontSize={9} fill="#dc2626" fontWeight="bold">Lipschitz 불연속 (L → ∞)</text>
      <line x1={260} y1={130} x2={465} y2={130} stroke="#9ca3af" strokeWidth={0.7} markerEnd="url(#axArrow)" />
      <line x1={265} y1={135} x2={265} y2={20} stroke="#9ca3af" strokeWidth={0.7} markerEnd="url(#axArrow)" />
      {/* Steep spike — vertical tangent at one point */}
      <path d="M 275,120 C 290,115 330,110 355,115 C 360,50 362,25 365,20 C 368,25 370,50 375,115 C 400,110 430,115 445,120" fill="none" stroke="#dc2626" strokeWidth={2} />
      <text x={360} y={155} textAnchor="middle" fontSize={7} fill="#dc2626">수직 접선 구간: 작은 Δx에도 Δf → ∞</text>
    </svg>
  );
}

/* ---------- SVG: contraction shrinking ---------- */
function ContractionSVG() {
  const steps = [
    { t: 0, d: 40, label: 'e₀ = 0' },
    { t: 1, d: 24, label: `e₁ ≤ ρε` },
    { t: 2, d: 14, label: `e₂ ≤ ρ²ε` },
    { t: 3, d: 8, label: `e₃ ≤ ρ³ε` },
    { t: 4, d: 5, label: '→ 0' },
  ];
  const cx = (t: number) => 60 + t * 90;
  return (
    <svg viewBox="0 0 480 110" width="100%" height={110} className="block">
      <defs>
        <marker id="cArrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="#9ca3af" />
        </marker>
      </defs>
      {/* time axis */}
      <line x1={30} y1={55} x2={460} y2={55} stroke="#e5e7eb" strokeWidth={0.5} />
      {steps.map(({ t, d, label }, i) => {
        const x = cx(t);
        return (
          <g key={t}>
            {/* two dots representing s_t and ŝ_t */}
            <circle cx={x} cy={55 - d / 2} r={4} fill="#6366f1" opacity={0.9} />
            <circle cx={x} cy={55 + d / 2} r={4} fill="#f97316" opacity={0.9} />
            {/* gap bar */}
            <line x1={x} y1={55 - d / 2 + 4} x2={x} y2={55 + d / 2 - 4} stroke="#9ca3af" strokeWidth={1.5} strokeDasharray="2,1" />
            {/* t label */}
            <text x={x} y={100} textAnchor="middle" fontSize={7} fill="#9ca3af">t={t}</text>
            <text x={x} y={110} textAnchor="middle" fontSize={6.5} fill="#6366f1">{label}</text>
            {/* arrow to next */}
            {i < steps.length - 1 && (
              <path
                d={`M ${x + 12},55 Q ${x + 45},38 ${cx(t + 1) - 12},55`}
                fill="none"
                stroke="#9ca3af"
                strokeWidth={0.8}
                markerEnd="url(#cArrow)"
              />
            )}
          </g>
        );
      })}
      <text x={55} y={10} fontSize={7} fill="#6366f1">s_t</text>
      <text x={55} y={22} fontSize={7} fill="#f97316">ŝ_t (양자화)</text>
      <text x={55} y={34} fontSize={7} fill="#9ca3af">갭 = e_t</text>
    </svg>
  );
}

/* ================================================================ */
/*  Main export                                                       */
/* ================================================================ */
export default function ConceptsSection() {
  const TOTAL = 8;
  const [openCards, setOpenCards] = useState<boolean[]>(() => Array(TOTAL).fill(false));
  const toggleCard = (i: number) =>
    setOpenCards((prev) => { const n = [...prev]; n[i] = !n[i]; return n; });
  const anyOpen = openCards.some((v) => v);

  return (
    <div className="space-y-3">
      {/* 전체 접기/펼치기 */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setOpenCards(Array(TOTAL).fill(anyOpen ? false : true))}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <ChevronsUpDown className="h-4 w-4" />
          {anyOpen ? '전체 접기' : '전체 펼치기'}
        </button>
      </div>

      {/* ─── 개념 0: ULA & 공간 주파수 ─── */}
      <ConceptCard
        badge="개념 0"
        badgeColor="bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300"
        title="ULA와 공간 주파수 — u = d·sin(θ)/λ 는 어디서 나오는가?"
        subtitle="안테나 간 경로차 → 위상차 → 공간 주파수 → DFT와 연결되는 물리적 기원"
        open={openCards[0]}
        onToggle={() => toggleCard(0)}
      >
        <div className="space-y-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          <p>
            채널 모델에서 빔 공간(beam domain)으로 변환할 때 핵심이 되는 <strong>공간 주파수</strong>{' '}
            <EqI latex="u = \frac{d}{\lambda}\sin\theta" /> 가 왜 그 형태인지 기하학적으로 유도합니다.
          </p>

          {/* 물리 유도 */}
          <div className="rounded-lg bg-sky-50 px-4 py-3 dark:bg-sky-900/20">
            <p className="mb-3 font-bold text-sky-700 dark:text-sky-300">경로차 → 위상차 → 공간 주파수</p>

            <ProofStep step="1" label="기하학 — 안테나 간 경로차">
              <p className="mb-1">
                N개 안테나가 간격 <EqI latex="d" />로 일렬로 놓여 있고, 평면파가 각도 <EqI latex="\theta" /> 로 입사합니다.
                인접 두 안테나에 대해 직각삼각형을 그리면, 안테나 0과 1 사이의
                경로차(path difference)는 기하학적으로:
              </p>
              <Eq latex={String.raw`\Delta r = d \sin\theta`} />
              <p>
                이 <EqI latex="\Delta r" />만큼 신호가 더 이동하기 때문에 안테나 1의 수신 신호는
                안테나 0보다 위상이 지연됩니다.
              </p>
            </ProofStep>

            <ProofStep step="2" label="경로차 → 위상차">
              <p className="mb-1">
                파장 <EqI latex="\lambda" />의 신호가 거리 <EqI latex="\Delta r" />를 더 이동하면 위상은{' '}
                <EqI latex="2\pi/\lambda" />배만큼 돌아갑니다 (한 파장 이동 = <EqI latex="2\pi" /> rad):
              </p>
              <Eq latex={String.raw`\Delta\phi = \frac{2\pi}{\lambda}\,\Delta r = \frac{2\pi d\sin\theta}{\lambda}`} />
            </ProofStep>

            <ProofStep step="3" label="공간 주파수 정의">
              <p className="mb-1">
                위상 증분 <EqI latex="\Delta\phi" />를 <EqI latex="2\pi" />로 나눈 값이 바로 공간 주파수입니다.
                이 표현에서 <EqI latex="1/\lambda" />가 &ldquo;공간에서의 샘플링 주파수&rdquo; 역할을 하고,{' '}
                <EqI latex="d" />는 안테나 간격(샘플링 간격)입니다:
              </p>
              <Eq latex={String.raw`u \;\triangleq\; \frac{\Delta\phi}{2\pi} = \frac{d}{\lambda}\sin\theta \;\in\; \left[-\tfrac{d}{\lambda},\, \tfrac{d}{\lambda}\right]`} />
            </ProofStep>

            <ProofStep step="4" label="DFT와의 연결 — Nyquist 조건">
              <p className="mb-1">
                N개 안테나에 DFT를 적용하면 공간 주파수 <EqI latex="u" />에 해당하는 복소 지수{' '}
                <EqI latex="e^{j2\pi u n},\; n=0,\ldots,N-1" />를 분석하는 것과 같습니다.
                <strong>반파장 간격</strong> <EqI latex="d = \lambda/2" />를 택하면{' '}
                <EqI latex="u \in [-1/2, 1/2]" />, 즉 DFT의 Nyquist 범위에 딱 맞아{' '}
                aliasing 없이 모든 방향을 구별할 수 있습니다.
              </p>
              <Eq latex={String.raw`d = \frac{\lambda}{2} \;\Rightarrow\; u = \frac{1}{2}\sin\theta \;\in\; \left[-\tfrac{1}{2},\, \tfrac{1}{2}\right]`} />
              <p>
                DoA <EqI latex="\theta" />가 정수 격자{' '}
                <EqI latex="u = k/N" />에 딱 떨어지지 않으면 <strong>off-grid</strong> 상황이 되고,
                바로 아래 개념 1에서 설명하는 Dirichlet 커널 누설이 발생합니다.
              </p>
            </ProofStep>
          </div>

          {/* 인터랙티브 시각화 */}
          <ULASpatialFreqViz />
        </div>
      </ConceptCard>

      {/* ─── 도메인 변환: H에 DFT를 곱하면 왜 각도/지연 도메인이 되는가 ─── */}
      <ConceptCard
        badge="도메인"
        badgeColor="bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300"
        title="CSI 도메인 변환 — H에 DFT를 곱하면 왜 angular-delay가 되는가?"
        subtitle="Antenna-Frequency → Angular-Frequency → Angular-Delay: 각 변환의 물리적 의미와 DFT 행렬의 역할"
        open={openCards[1]}
        onToggle={() => toggleCard(1)}
      >
        <div className="space-y-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          <p>
            OFDM 시스템에서 측정한 채널 행렬 <EqI latex={String.raw`\mathbf{H}\in\mathbb{C}^{N_a\times N_f}`} />의 두 축은
            <strong>안테나 인덱스 n</strong>과 <strong>부반송파 인덱스 k</strong>입니다.
            이 행렬에 DFT/IDFT 행렬을 곱하면 각각의 축이 물리적으로 다른 도메인으로 변환됩니다.
          </p>

          {/* 4-domain grid */}
          <div className="rounded-xl border border-cyan-200 bg-cyan-50/50 p-4 dark:border-cyan-800 dark:bg-cyan-950/20">
            <p className="mb-3 text-center font-bold text-cyan-700 dark:text-cyan-300">CSI 채널 행렬의 4가지 도메인</p>

            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-x-2 gap-y-1">
              {/* Row 1 */}
              <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2.5 text-center dark:border-indigo-800 dark:bg-indigo-950/30">
                <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Antenna &times; Frequency</p>
                <p className="mt-0.5 font-mono text-sm font-bold text-indigo-700 dark:text-indigo-300">H[n, k]</p>
                <p className="mt-0.5 text-xs text-indigo-500 dark:text-indigo-400">원본 측정값</p>
              </div>
              <div className="flex flex-col items-center px-1">
                <span className="text-lg text-gray-400">&rarr;</span>
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">F<sub>a</sub>&middot;</span>
              </div>
              <div className="rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-2.5 text-center dark:border-cyan-800 dark:bg-cyan-950/30">
                <p className="text-xs font-bold text-cyan-600 dark:text-cyan-400">Angular &times; Frequency</p>
                <p className="mt-0.5 font-mono text-sm font-bold text-cyan-700 dark:text-cyan-300">F<sub>a</sub>&middot;H</p>
                <p className="mt-0.5 text-xs text-cyan-500 dark:text-cyan-400">빔 도메인</p>
              </div>

              {/* Vertical arrows */}
              <div className="flex flex-col items-center py-0.5">
                <span className="text-lg text-gray-400">&darr;</span>
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">&middot;F<sub>f</sub><sup>H</sup></span>
              </div>
              <div />
              <div className="flex flex-col items-center py-0.5">
                <span className="text-lg text-gray-400">&darr;</span>
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">&middot;F<sub>f</sub><sup>H</sup></span>
              </div>

              {/* Row 2 */}
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-center dark:border-amber-800 dark:bg-amber-950/30">
                <p className="text-xs font-bold text-amber-600 dark:text-amber-400">Antenna &times; Delay</p>
                <p className="mt-0.5 font-mono text-sm font-bold text-amber-700 dark:text-amber-300">H&middot;F<sub>f</sub><sup>H</sup></p>
                <p className="mt-0.5 text-xs text-amber-500 dark:text-amber-400">임펄스 응답</p>
              </div>
              <div className="flex flex-col items-center px-1">
                <span className="text-lg text-gray-400">&rarr;</span>
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">F<sub>a</sub>&middot;</span>
              </div>
              <div className="rounded-lg border-2 border-emerald-400 bg-emerald-50 px-3 py-2.5 text-center dark:border-emerald-600 dark:bg-emerald-950/30">
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Angular &times; Delay</p>
                <p className="mt-0.5 font-mono text-sm font-bold text-emerald-700 dark:text-emerald-300">F<sub>a</sub>&middot;H&middot;F<sub>f</sub><sup>H</sup></p>
                <p className="mt-0.5 text-xs text-emerald-500 dark:text-emerald-400">가장 희소 &mdash; 압축에 최적</p>
              </div>
            </div>
          </div>

          {/* 왜 DFT가 도메인을 바꾸는가 */}
          <div className="rounded-lg bg-cyan-50 px-4 py-3 dark:bg-cyan-900/20">
            <p className="mb-2 font-bold text-cyan-700 dark:text-cyan-300">왜 DFT를 곱하면 도메인이 바뀌는가?</p>

            <ProofStep step="1" label="안테나 축: 왼쪽에서 F_a 곱하기 → 각도 도메인">
              <p className="mb-1">
                개념 0에서 보았듯이 ULA의 각 안테나 n이 수신하는 신호는 평면파의 위상 지연{' '}
                <EqI latex="e^{j2\pi u \cdot n}" />을 포함합니다.
                H의 열 하나(고정 부반송파 k)를 보면:
              </p>
              <Eq latex={String.raw`\mathbf{h}_k = [h_0, h_1, \ldots, h_{N_a-1}]^T = \sum_{\ell}\alpha_\ell\,\mathbf{a}(u_\ell)\,\cdot\, (\text{freq.\ response at }k)`} />
              <p className="mb-1">
                여기서 <EqI latex="\mathbf{a}(u) = [1,\, e^{j2\pi u},\, \ldots,\, e^{j2\pi u(N_a-1)}]^T" />는
                <strong>어레이 응답 벡터</strong>(steering vector)입니다.
                이것은 주파수 <EqI latex="u" />의 복소 지수 &mdash; 즉 DFT 기저 벡터와 같은 형태입니다.
              </p>
              <p>
                따라서 왼쪽에서 <EqI latex="\mathbf{F}_{N_a}" /> (DFT 행렬)를 곱하면, 안테나 축의
                복소 지수 성분을 각 주파수 빈으로 분리합니다.
                결과 행렬의 m번째 행은 공간 주파수 <EqI latex="u = m/N_a" />에 대응하는
                <strong>각도(빔) 성분</strong>이 됩니다:
              </p>
              <Eq latex={String.raw`[\mathbf{F}_{N_a}\mathbf{H}]_{m,k} = \sum_{n=0}^{N_a-1}H[n,k]\,e^{-j2\pi mn/N_a}`} />
            </ProofStep>

            <ProofStep step="2" label="주파수 축: 오른쪽에서 F_f^H 곱하기 → 지연 도메인">
              <p className="mb-1">
                OFDM에서 부반송파 k는 주파수 <EqI latex="f_k = f_0 + k\Delta f" />입니다.
                다중 경로 채널의 주파수 응답은:
              </p>
              <Eq latex={String.raw`H[n,k] = \sum_{\ell}\alpha_\ell\,e^{-j2\pi f_k\tau_\ell}\,e^{j2\pi u_\ell n}`} />
              <p className="mb-1">
                고정 안테나 n에서 H의 행 하나를 보면, <EqI latex="e^{-j2\pi k\Delta f\,\tau_\ell}" /> 형태의
                복소 지수들의 합입니다. 이것은 지연 <EqI latex="\tau_\ell" />에 대한 <strong>주파수 도메인 표현</strong>이므로,
                IDFT(<EqI latex="\mathbf{F}_{N_f}^H" />)를 오른쪽에 곱하면 시간(지연) 도메인으로 복원됩니다:
              </p>
              <Eq latex={String.raw`[\mathbf{H}\mathbf{F}_{N_f}^H]_{n,d} = \sum_{k=0}^{N_f-1}H[n,k]\,e^{j2\pi kd/N_f}`} />
            </ProofStep>

            <ProofStep step="3" label="양쪽 모두: Angular-Delay 도메인">
              <p className="mb-1">
                두 변환을 동시에 적용하면:
              </p>
              <Eq latex={String.raw`\mathbf{H}_{\text{ad}} = \mathbf{F}_{N_a}\,\mathbf{H}\,\mathbf{F}_{N_f}^H`} />
              <p className="mb-1">
                이 행렬의 (m, d) 원소는 <strong>각도 빈 m, 지연 탭 d</strong>에 해당하는 채널 계수입니다.
                물리적으로 각 비영(non-zero) 원소는 특정 (도래각 θ, 지연 τ) 쌍의 전파 경로에 대응합니다.
              </p>
              <p>
                실제 무선 채널은 소수의 산란체/반사체만 존재하므로, angular-delay 도메인에서
                H<sub>ad</sub>는 <strong>매우 희소</strong>(sparse)합니다 &mdash; 대부분의 원소가 거의 0.
                이것이 CSI 압축의 핵심 동기입니다.
              </p>
            </ProofStep>
          </div>

          {/* 핵심 정리 */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2.5 dark:border-indigo-800 dark:bg-indigo-950/20">
              <p className="mb-1 font-bold text-indigo-700 dark:text-indigo-300">왼쪽 곱 F<sub>a</sub>&middot;H</p>
              <p className="text-sm text-indigo-600 dark:text-indigo-400">
                안테나 축(행)에 DFT &rarr; 공간 주파수 분해.
                각 행이 하나의 빔 방향(각도 빈)에 대응.
              </p>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 dark:border-amber-800 dark:bg-amber-950/20">
              <p className="mb-1 font-bold text-amber-700 dark:text-amber-300">오른쪽 곱 H&middot;F<sub>f</sub><sup>H</sup></p>
              <p className="text-sm text-amber-600 dark:text-amber-400">
                주파수 축(열)에 IDFT &rarr; 임펄스 응답 복원.
                각 열이 하나의 지연 탭에 대응.
              </p>
            </div>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            요약: DFT 행렬은 단순히 기저(basis)를 바꾸는 유니터리 변환입니다.
            안테나 축의 기저를 {'{'}e<sub>n</sub>{'}'} &rarr; {'{'}a(u<sub>m</sub>){'}'} (빔)으로,
            주파수 축의 기저를 {'{'}e<sub>k</sub>{'}'} &rarr; {'{'}p(τ<sub>d</sub>){'}'} (지연 탭)으로 바꿉니다.
            채널의 물리적 희소성이 이 기저에서 드러나기 때문에 angular-delay 표현이 압축에 유리합니다.
          </p>
        </div>
      </ConceptCard>

      {/* ─── 개념 1: DFT & Dirichlet ─── */}
      <ConceptCard
        badge="개념 1"
        badgeColor="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
        title="DFT와 Dirichlet 커널 — off-grid 누설의 기원"
        subtitle="유한 N점 DFT를 비격자 주파수에 적용하면 왜 모든 빈에 에너지가 퍼지는가"
        open={openCards[2]}
        onToggle={() => toggleCard(2)}
      >
        <div className="space-y-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">

          {/* 유도 */}
          <div className="rounded-lg bg-orange-50 px-4 py-3 dark:bg-orange-900/20">
            <p className="mb-2 font-bold text-orange-700 dark:text-orange-300">유도</p>
            <p className="mb-2">
              신호 <EqI latex="x[n] = e^{j2\pi(f_0+\delta)n/N}" />을 N점 DFT하면 k번째 출력은:
            </p>
            <Eq latex={String.raw`X[k] = \sum_{n=0}^{N-1} e^{j2\pi(f_0+\delta)n/N}\cdot e^{-j2\pi kn/N} = \sum_{n=0}^{N-1} e^{j2\pi(\delta - d)n/N}`} />
            <p className="mb-2">여기서 <EqI latex="d \triangleq k - f_0" /> (가장 가까운 격자 빈으로부터의 정수 거리). 등비급수를 닫힌 형태로 쓰면:</p>
            <Eq latex={String.raw`X[f_0+d] = \frac{1 - e^{j2\pi(\delta-d)}}{1 - e^{j2\pi(\delta-d)/N}}`} />
            <p className="mb-2">크기를 취하면 (오일러 공식 이용):</p>
            <Eq latex={String.raw`|X[f_0+d]| = \frac{\bigl|\sin\!\bigl(\pi(\delta-d)\bigr)\bigr|}{\bigl|\sin\!\bigl(\tfrac{\pi(\delta-d)}{N}\bigr)\bigr|}`} />
            <p className="mb-1 font-semibold text-orange-700 dark:text-orange-300">이것이 Dirichlet 커널입니다.</p>
            <p>
              δ=0(on-grid): 분자 = 0 except d=0, 분모 → 0 동시에 → L&rsquo;Hôpital → N. 결과: |X|=N이 d=0에만.
              δ≠0(off-grid): 모든 d≠round(δ)에서 분자≠0 → 에너지 누설.
            </p>
          </div>

          {/* 포락선 유도 */}
          <div className="rounded-lg bg-orange-50 px-4 py-3 dark:bg-orange-900/20">
            <p className="mb-2 font-bold text-orange-700 dark:text-orange-300">왜 포락선이 1/(1+|d|) 꼴인가?</p>
            <p className="mb-2">
              |d| ≫ 1, N ≫ 1인 경우 sin의 소각도 근사: <EqI latex="\sin(\pi(\delta-d)/N) \approx \pi(\delta-d)/N" />.
            </p>
            <Eq latex={String.raw`|X[f_0+d]|\;\lesssim\;\frac{|\sin(\pi(\delta-d))|}{\pi|\delta-d|/N}\cdot\frac{1}{N} = \frac{|\sin(\pi(\delta-d))|}{\pi|\delta-d|} \le \frac{1}{\pi|d-\delta|} \;\lesssim\; \frac{c_0}{1+|d|}`} />
            <p>마지막 단계: δ ∈ (-½, ½)이므로 |d-δ| ≥ |d|-½ ≥ (|d|+1)/2 (|d|≥1일 때), 따라서 1/|d-δ| = O(1/|d|).</p>
          </div>

          <DirichletKernelViz />

          <p className="text-sm text-gray-500 dark:text-gray-400">
            논문의 식 (3.4)~(3.5): 각도 도메인 CSI 계수의 포락선이 정확히 이 형태를 가집니다.
            비격자(off-grid) 도래각을 가진 경로가 DFT 각도 격자와 정렬되지 않으면 같은 누설이 발생합니다.
          </p>
        </div>
      </ConceptCard>

      {/* ─── 개념 2: CNN 하드 절단 ─── */}
      <ConceptCard
        badge="개념 2"
        badgeColor="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
        title="CNN 하드 절단 손실 — O(L⁻¹) 수렴의 함의"
        subtitle="수용장 L을 두 배 늘려도 절단 에너지가 절반밖에 안 줄어든다"
        open={openCards[3]}
        onToggle={() => toggleCard(3)}
      >
        <div className="space-y-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          <p>
            CNN 인코더의 수용장 반경을 L이라 하면, 인덱스 i₀ 기준 |i-i₀|&gt;L인 계수는 완전히 버려집니다.
            개념 1의 포락선 <EqI latex="|x_i| \le c_0/(1+|i-i_0|)" />을 사용하면:
          </p>
          <div className="rounded-lg bg-red-50 px-4 py-3 dark:bg-red-900/20">
            <Eq latex={String.raw`E_{\mathrm{hard}}(L) \triangleq \sum_{|i-i_0|>L}|x_i|^2 \;\le\; c_0^2\sum_{d=L+1}^{\infty}\frac{1}{(1+d)^2} \;\le\; \frac{c_0^2}{1+L} \;=\; \mathcal{O}(L^{-1})`} />
            <p className="mt-1 text-xs text-red-500 dark:text-red-400">
              마지막 부등호: <EqI latex="\sum_{d=L+1}^\infty 1/(1+d)^2 \le \int_L^\infty dx/(1+x)^2 = 1/(1+L)" />
            </p>
          </div>
          <p>
            <strong>핵심:</strong> E_hard는 L에 대해 다항 감쇠(1/L). L을 두 배로 늘려도 손실이 절반으로만 줍니다.
            반면 더 많은 컨볼루션 레이어 = 지연·연산량 증가. UE 환경에서 이 트레이드오프는 치명적입니다.
          </p>

          <div className="overflow-x-auto rounded-lg border border-red-200 dark:border-red-800">
            <table className="w-full text-center text-xs">
              <thead>
                <tr className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300">
                  <th className="px-4 py-2 text-left">L</th>
                  <th className="px-4 py-2">CNN 절단 손실 ≤</th>
                  <th className="px-4 py-2">SSM 소프트 잔여 (α=0.3)</th>
                  <th className="px-4 py-2">개선 배수</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-100 dark:divide-red-900/20">
                {[4, 8, 16, 32, 64].map((L) => {
                  const cnn = 1 / (1 + L);
                  const ssm = Math.exp(-0.3 * L) / (1 + L);
                  return (
                    <tr key={L}>
                      <td className="px-4 py-1.5 text-left font-mono font-semibold">{L}</td>
                      <td className="px-4 py-1.5 font-mono text-red-600 dark:text-red-400">{cnn.toFixed(4)}</td>
                      <td className="px-4 py-1.5 font-mono text-green-600 dark:text-green-400">{ssm.toExponential(2)}</td>
                      <td className="px-4 py-1.5 font-mono text-indigo-600 dark:text-indigo-400">×{(cnn / ssm).toFixed(0)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </ConceptCard>

      {/* ─── 개념 3: SSM = 지수 모드 ─── */}
      <ConceptCard
        badge="개념 3"
        badgeColor="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
        title="SSM 컨볼루션 커널 = 지수 모드들의 합"
        subtitle="상태 방정식을 반복 대입하면 y_k = Σ_d (CA^dB) u_{k-d}, 그리고 A의 스펙트럼이 모드를 결정한다"
        open={openCards[4]}
        onToggle={() => toggleCard(4)}
      >
        <div className="space-y-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">

          <div className="space-y-3">
            <ProofStep step="1" label="상태 방정식 반복 대입">
              <p>
                <EqI latex="\mathbf{s}_0 = \mathbf{0}" /> 으로 시작하면:
              </p>
              <div className="mt-1 space-y-1">
                <Eq latex={String.raw`\mathbf{s}_1 = \mathbf{B}\mathbf{u}_0`} />
                <Eq latex={String.raw`\mathbf{s}_2 = \mathbf{A}\mathbf{B}\mathbf{u}_0 + \mathbf{B}\mathbf{u}_1`} />
                <Eq latex={String.raw`\mathbf{s}_k = \sum_{d=0}^{k-1}\mathbf{A}^{d}\mathbf{B}\,\mathbf{u}_{k-1-d}`} />
              </div>
            </ProofStep>

            <ProofStep step="2" label="출력 = 컨볼루션">
              <p><EqI latex="\mathbf{y}_k = \mathbf{C}\mathbf{s}_k" />에 대입하면:</p>
              <Eq latex={String.raw`\mathbf{y}_k = \sum_{d=0}^{k-1}\underbrace{\mathbf{C}\mathbf{A}^{d}\mathbf{B}}_{\triangleq\, K_d}\,\mathbf{u}_{k-1-d} \quad\text{(안정 SSM: }k\to\infty\text{도 수렴)}`} />
              <p>커널의 d번째 원소는 <EqI latex="K_d = \mathbf{C}\mathbf{A}^d\mathbf{B}" />.  즉 출력은 과거 입력과의 컨볼루션.</p>
            </ProofStep>

            <ProofStep step="3" label="고유값 분해 → 지수 모드">
              <p>
                <EqI latex="\mathbf{A} = \mathbf{U}\boldsymbol{\Lambda}\mathbf{U}^{-1}" />
                (A가 대각화 가능하다고 가정, 실제로는 Jordan form 가능하지만 결론 동일).
                그러면 <EqI latex="\mathbf{A}^d = \mathbf{U}\boldsymbol{\Lambda}^d\mathbf{U}^{-1}" />.
              </p>
              <Eq latex={String.raw`K_d = \mathbf{C}\mathbf{U}\boldsymbol{\Lambda}^d\mathbf{U}^{-1}\mathbf{B} = \sum_{m=1}^{M}\underbrace{(\mathbf{C}\mathbf{U})_m}_{c_m}\,\lambda_m^d\,\underbrace{(\mathbf{U}^{-1}\mathbf{B})_m}_{b_m} = \sum_{m=1}^{M}w_m\,\lambda_m^d`} />
              <p>안정 조건 <EqI latex="|\lambda_m| < 1" /> 하에서 <EqI latex="\lambda_m = e^{-\alpha_m}" /> (α_m &gt; 0)으로 쓰면:</p>
              <Eq latex={String.raw`K_d = \sum_{m=1}^{M}w_m\, e^{-\alpha_m d}`} />
              <p>각 고유값 하나 = 하나의 지수 감쇠 모드. <strong>상태 차원 M = 동시에 유지되는 모드 수</strong>.</p>
            </ProofStep>

            <ProofStep step="4" label="||A^d|| ≤ c₁e^{-αd} 경계">
              <p>행렬 노름의 경우 스펙트럼 반지름 ρ(A) &lt; 1이면:</p>
              <Eq latex={String.raw`\|\mathbf{A}^d\| \;\le\; c_1\,e^{-\alpha d}, \quad \alpha = -\log\rho(\mathbf{A}) > 0`} />
              <p>따라서 <EqI latex="\|K_d\| = \|\mathbf{C}\mathbf{A}^d\mathbf{B}\| \le \|\mathbf{C}\|\|\mathbf{A}^d\|\|\mathbf{B}\| \le c_3\,e^{-\alpha d}" />.
                커널 자체가 지수 감쇠합니다.
              </p>
            </ProofStep>
          </div>

          <SSMExponentialModeViz />
        </div>
      </ConceptCard>

      {/* ─── 개념 4: Laplace 혼합 ─── */}
      <ConceptCard
        badge="개념 4"
        badgeColor="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
        title="다항 감쇠 = 지수 모드의 Laplace 혼합"
        subtitle="1/(d+1) = ∫₀^∞ e^{-αd} e^{-α} dα — SSM이 Dirichlet 포락선을 구조적으로 근사하는 이유"
        open={openCards[5]}
        onToggle={() => toggleCard(5)}
      >
        <div className="space-y-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">

          <div className="rounded-xl border border-purple-200 bg-purple-50 px-4 py-3 dark:border-purple-800 dark:bg-purple-950/20">
            <p className="mb-2 font-bold text-purple-700 dark:text-purple-300">정확한 항등식 (논문 Remark 1)</p>
            <Eq latex={String.raw`\frac{1}{d+1} = \int_{0}^{\infty} e^{-(d+1)\alpha}\,d\alpha = \int_{0}^{\infty} e^{-\alpha}\cdot e^{-\alpha d}\,d\alpha`} />
            <p className="mt-2 text-sm text-purple-700 dark:text-purple-400">
              <strong>유도:</strong>{' '}
              <EqI latex="\int_0^\infty e^{-(d+1)\alpha}\,d\alpha = \Bigl[-\tfrac{1}{d+1}e^{-(d+1)\alpha}\Bigr]_0^\infty = \tfrac{1}{d+1}" />.
              이는 d≥0인 정수에서 정확히 성립하는 항등식입니다.
            </p>
          </div>

          <p>
            <strong>해석:</strong> 다항 포락선 1/(d+1)은 지수 모드 <EqI latex="e^{-\alpha d}" />를
            가중치 <EqI latex="e^{-\alpha}" />로 α∈[0,∞) 전 구간에 대해 적분한 결과입니다.
            즉 다항 감쇠는 <em>모든 감쇠율의 지수 모드를 균등하게 혼합한 것</em>입니다.
          </p>

          <div className="rounded-lg bg-gray-50 px-4 py-3 dark:bg-gray-800">
            <p className="mb-2 font-semibold text-gray-700 dark:text-gray-300">유한 SSM의 이산 근사</p>
            <Eq latex={String.raw`\frac{1}{d+1} = \int_0^\infty e^{-\alpha}\,e^{-\alpha d}\,d\alpha \;\approx\; \sum_{m=1}^{M}w_m\,e^{-\alpha_m d} = K_d`} />
            <p className="mt-1">
              M개의 이산 α값 (= A의 M개 고유값의 로그)으로 연속 혼합을 근사합니다.
              M이 클수록 α 샘플 밀도가 높아져 근사 정확도가 향상됩니다 (개념 3의 그래프 참조).
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 dark:border-red-800 dark:bg-red-950/20">
              <p className="mb-1 font-bold text-red-700 dark:text-red-300">CNN</p>
              <p className="text-sm text-red-600 dark:text-red-400">
                유한 서포트 커널 → L 바깥 계수를 표현할 수 없음.
                잔여: <EqI latex="\mathcal{O}(L^{-1})" /> (다항 감쇠)
              </p>
            </div>
            <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2.5 dark:border-green-800 dark:bg-green-950/20">
              <p className="mb-1 font-bold text-green-700 dark:text-green-300">SSM</p>
              <p className="text-sm text-green-600 dark:text-green-400">
                지수 모드의 합 → 다항 포락선을 구조적으로 근사.
                잔여: <EqI latex="\mathcal{O}(e^{-\alpha L}/L)" /> (지수 × 다항)
              </p>
            </div>
          </div>
        </div>
      </ConceptCard>

      {/* ─── 개념 5: Lipschitz ─── */}
      <ConceptCard
        badge="개념 5"
        badgeColor="bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300"
        title="Lipschitz 연속성과 수축 사상"
        subtitle="함수의 '기울기 상한' — ρ<1이면 반복 적용할수록 두 점이 가까워진다"
        open={openCards[6]}
        onToggle={() => toggleCard(6)}
      >
        <div className="space-y-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">

          <div className="rounded-lg bg-teal-50 px-4 py-3 dark:bg-teal-900/20">
            <p className="mb-1 font-bold text-teal-700 dark:text-teal-300">정의</p>
            <Eq latex={String.raw`f: \mathcal{X}\to\mathcal{Y}\text{ 가 }L\text{-Lipschitz}\;\;\Longleftrightarrow\;\;\|f(x)-f(x')\|\le L\|x-x'\|\;\;\forall\,x,x'\in\mathcal{X}`} />
            <p className="mt-1">
              L이 Lipschitz 상수입니다. 기하학적으로 f의 기울기(도함수 노름)가 L로 전역 유계됨을 뜻합니다.
            </p>
          </div>

          <LipschitzSVG />

          <p>
            <strong>수축 사상(Contraction Mapping):</strong> L = ρ &lt; 1인 경우.
            두 점 x, x&prime;을 f에 반복 통과시키면 그 차이가 매 스텝 ρ 배로 줄어들어 지수 수렴합니다.
          </p>

          <div className="overflow-x-auto rounded-lg border border-teal-200 dark:border-teal-800">
            <table className="w-full text-center text-xs">
              <thead>
                <tr className="bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300">
                  <th className="px-3 py-2 text-left">상수</th>
                  <th className="px-3 py-2">유형</th>
                  <th className="px-3 py-2">반복 적용 효과</th>
                  <th className="px-3 py-2">논문에서</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-teal-100 dark:divide-teal-900/20 text-sm">
                {[
                  { c: 'L = 0', type: '상수 사상', eff: '‖f(x)-f(x′)‖ = 0', role: '—' },
                  { c: '0 < ρ < 1', type: '수축 사상', eff: '두 궤적이 지수 수렴', role: 'Φ_t의 상태 Lipschitz 상수' },
                  { c: 'L = 1', type: '등거리 사상', eff: '차이 불변', role: '—' },
                  { c: 'L > 1', type: '팽창 사상', eff: '차이 발산 가능', role: 'RNN 그래디언트 폭발' },
                ].map((r, i) => (
                  <tr key={i} className={r.c === '0 < ρ < 1' ? 'bg-teal-50 dark:bg-teal-900/10' : ''}>
                    <td className="px-3 py-2 text-left font-mono font-semibold">{r.c}</td>
                    <td className="px-3 py-2">{r.type}</td>
                    <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{r.eff}</td>
                    <td className="px-3 py-2 text-indigo-600 dark:text-indigo-400">{r.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p>
            논문 명제의 가정 (3.13):
            <EqI latex="\|\Phi_t(\mathbf{s},\mathbf{u};\boldsymbol{\theta})-\Phi_t(\mathbf{s}',\mathbf{u};\boldsymbol{\theta})\|\le\rho\|\mathbf{s}-\mathbf{s}'\|" />,
            ρ∈[0,1).
            이것이 상태 전이가 수축 사상임을 의미하며, 추후 양자화 오차 한계에 핵심 역할을 합니다.
          </p>
        </div>
      </ConceptCard>

      {/* ─── 개념 6: 양자화 내성 증명 ─── */}
      <ConceptCard
        badge="개념 6"
        badgeColor="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
        title="수축 SSM의 양자화 내성 — 명제 전체 증명"
        subtitle="삼각 부등식 + 수축 조건 → 오차 상한이 토큰 길이 t에 독립적"
        open={openCards[7]}
        onToggle={() => toggleCard(7)}
      >
        <div className="space-y-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">

          <p>
            양자화된 파라미터 <EqI latex="\hat{\boldsymbol{\theta}}=\boldsymbol{\theta}+\Delta\boldsymbol{\theta}" />와
            원본 파라미터 θ로 각각 실행한 SSM의 상태를 <EqI latex="\mathbf{s}_t, \hat{\mathbf{s}}_t" />라 하고
            <EqI latex="e_t \triangleq \|\mathbf{s}_t - \hat{\mathbf{s}}_t\|" />.
            초기화 동일: <EqI latex="e_0 = 0" />.
          </p>

          <div className="space-y-0">
            <ProofStep step="1" label="삼각 부등식으로 e_{t+1} 전개">
              <Eq latex={String.raw`e_{t+1} = \|\Phi_t(\mathbf{s}_t,\mathbf{u}_t;\boldsymbol{\theta}) - \Phi_t(\hat{\mathbf{s}}_t,\mathbf{u}_t;\hat{\boldsymbol{\theta}})\|`} />
              <p>중간점 <EqI latex="\Phi_t(\hat{\mathbf{s}}_t,\mathbf{u}_t;\boldsymbol{\theta})" />를 더하고 빼서 삼각 부등식 적용:</p>
              <Eq latex={String.raw`\le\;\underbrace{\|\Phi_t(\mathbf{s}_t,\mathbf{u}_t;\boldsymbol{\theta})-\Phi_t(\hat{\mathbf{s}}_t,\mathbf{u}_t;\boldsymbol{\theta})\|}_{\le\,\rho\,e_t\;\text{(가정 3.13)}} + \underbrace{\|\Phi_t(\hat{\mathbf{s}}_t,\mathbf{u}_t;\boldsymbol{\theta})-\Phi_t(\hat{\mathbf{s}}_t,\mathbf{u}_t;\hat{\boldsymbol{\theta}})\|}_{\le\,L_{\Phi,\theta}\|\Delta\boldsymbol{\theta}\|\;\text{(가정 3.14)}}`} />
              <Eq latex={String.raw`e_{t+1} \;\le\; \rho\,e_t + L_{\Phi,\theta}\|\Delta\boldsymbol{\theta}\|`} />
            </ProofStep>

            <ProofStep step="2" label="반복 전개 (e₀=0)">
              <Eq latex={String.raw`e_t \;\le\; \sum_{k=0}^{t-1}\rho^{t-1-k}\,L_{\Phi,\theta}\|\Delta\boldsymbol{\theta}\| = L_{\Phi,\theta}\|\Delta\boldsymbol{\theta}\|\sum_{j=0}^{t-1}\rho^j`} />
              <p>ρ∈[0,1)이므로 등비급수 합이 수렴:</p>
              <Eq latex={String.raw`\sum_{j=0}^{t-1}\rho^j = \frac{1-\rho^t}{1-\rho} \;\le\; \frac{1}{1-\rho}`} />
              <div className="rounded-lg border border-green-300 bg-green-50 px-3 py-2 dark:border-green-800 dark:bg-green-900/20">
                <Eq latex={String.raw`\therefore\quad e_t \;\le\; \frac{L_{\Phi,\theta}}{1-\rho}\,\|\Delta\boldsymbol{\theta}\| \quad \forall\,t\ge 0`} />
              </div>
              <p>우변에 t가 없습니다. 시퀀스 길이에 무관하게 유계.</p>
            </ProofStep>

            <ProofStep step="3" label="출력 편차 경계">
              <Eq latex={String.raw`\|\mathbf{y}_t-\hat{\mathbf{y}}_t\| \le \underbrace{\|\Psi_t(\mathbf{s}_t;\boldsymbol{\theta})-\Psi_t(\hat{\mathbf{s}}_t;\boldsymbol{\theta})\|}_{\le\,L_\Psi\,e_t} + \underbrace{\|\Psi_t(\hat{\mathbf{s}}_t;\boldsymbol{\theta})-\Psi_t(\hat{\mathbf{s}}_t;\hat{\boldsymbol{\theta}})\|}_{\le\,L_{\Psi,\theta}\|\Delta\boldsymbol{\theta}\|}`} />
              <div className="rounded-xl border-2 border-green-400 bg-green-50 px-4 py-2 dark:border-green-700 dark:bg-green-900/20">
                <Eq latex={String.raw`\|\mathbf{y}_t-\hat{\mathbf{y}}_t\| \;\le\; \left(\frac{L_\Psi L_{\Phi,\theta}}{1-\rho}+L_{\Psi,\theta}\right)\|\Delta\boldsymbol{\theta}\|`} />
              </div>
              <p>이것이 논문 명제 1의 최종 경계입니다. □</p>
            </ProofStep>
          </div>

          <ContractionSVG />

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 dark:border-red-800 dark:bg-red-950/20">
              <p className="mb-1 font-bold text-red-700 dark:text-red-300">ρ ≥ 1이면?</p>
              <p className="text-sm text-red-600 dark:text-red-400">
                e_{'{t+1}'} ≥ e_t + Δ. 오차가 t와 함께 선형 또는 지수적으로 누적.
                시퀀스가 길면 양자화 노이즈가 압도적이 됩니다 (RNN 그래디언트 폭발과 동일 구조).
              </p>
            </div>
            <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2.5 dark:border-green-800 dark:bg-green-950/20">
              <p className="mb-1 font-bold text-green-700 dark:text-green-300">ρ &lt; 1이면?</p>
              <p className="text-sm text-green-600 dark:text-green-400">
                1/(1-ρ)가 상수 증폭 인자. 오차가 ‖Δθ‖에 선형이고 t에 무관하게 유계.
                이것이 INT8에서도 NMSE -15dB가 유지되는 이론적 보장입니다.
              </p>
            </div>
          </div>
        </div>
      </ConceptCard>

    </div>
  );
}
