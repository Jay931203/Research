'use client';

import { useState } from 'react';
import katex from 'katex';
import { useMemo } from 'react';

function InlineMath({ latex }: { latex: string }) {
  const html = useMemo(() => {
    try { return katex.renderToString(latex, { throwOnError: false, displayMode: false }); }
    catch { return latex; }
  }, [latex]);
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

function BlockMath({ latex }: { latex: string }) {
  const html = useMemo(() => {
    try { return katex.renderToString(latex, { throwOnError: false, displayMode: true }); }
    catch { return latex; }
  }, [latex]);
  return <div className="overflow-x-auto py-1" dangerouslySetInnerHTML={{ __html: html }} />;
}

const PROOF_STEPS = [
  {
    title: '오차 정의',
    tag: 'Step 1',
    color: { border: 'border-blue-300 dark:border-blue-700', bg: 'bg-blue-50 dark:bg-blue-950/30', badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200' },
    body: (
      <>
        <p className="mb-2 text-sm text-slate-700 dark:text-slate-300">상태 오차를 정의합니다:</p>
        <BlockMath latex={String.raw`e_t \triangleq \|\mathbf{s}_t - \hat{\mathbf{s}}_t\|`} />
        <p className="text-sm text-slate-600 dark:text-slate-400">초기 조건 <InlineMath latex="e_0 = 0" />이 주어집니다 (동일한 초기화 가정).</p>
      </>
    ),
  },
  {
    title: '삼각 부등식 적용',
    tag: 'Step 2',
    color: { border: 'border-purple-300 dark:border-purple-700', bg: 'bg-purple-50 dark:bg-purple-950/30', badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200' },
    body: (
      <>
        <p className="mb-2 text-sm text-slate-700 dark:text-slate-300">
          <InlineMath latex="e_{t+1}" />에 삼각 부등식을 적용하고 중간 항을 끼워 넣습니다:
        </p>
        <BlockMath latex={String.raw`e_{t+1} \le \underbrace{\|\Phi_t(\mathbf{s}_t,\cdot;\boldsymbol{\theta}) - \Phi_t(\hat{\mathbf{s}}_t,\cdot;\boldsymbol{\theta})\|}_{\le\, \rho\, e_t \;(\text{수축성})} + \underbrace{\|\Phi_t(\hat{\mathbf{s}}_t,\cdot;\boldsymbol{\theta}) - \Phi_t(\hat{\mathbf{s}}_t,\cdot;\hat{\boldsymbol{\theta}})\|}_{\le\, L_{\Phi,\theta}\|\Delta\boldsymbol{\theta}\| \;(\text{Lipschitz})}`} />
        <p className="text-sm text-slate-600 dark:text-slate-400">
          따라서 <InlineMath latex="e_{t+1} \le \rho\, e_t + L_{\Phi,\theta}\|\Delta\boldsymbol{\theta}\|" />.
        </p>
      </>
    ),
  },
  {
    title: '점화식 전개 (Unrolling)',
    tag: 'Step 3',
    color: { border: 'border-amber-300 dark:border-amber-700', bg: 'bg-amber-50 dark:bg-amber-950/30', badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200' },
    body: (
      <>
        <p className="mb-2 text-sm text-slate-700 dark:text-slate-300">
          <InlineMath latex="e_0 = 0" />에서 시작해 점화식을 전개하면:
        </p>
        <BlockMath latex={String.raw`e_t \le L_{\Phi,\theta}\|\Delta\boldsymbol{\theta}\|\sum_{k=0}^{t-1}\rho^k \le \frac{L_{\Phi,\theta}}{1-\rho}\|\Delta\boldsymbol{\theta}\|`} />
        <p className="text-sm text-slate-600 dark:text-slate-400">
          <InlineMath latex="\rho < 1" />이므로 기하급수 <InlineMath latex="\sum_{k=0}^\infty \rho^k = 1/(1-\rho)" />로 수렴.
          상태 오차가 토큰 길이 t와 무관하게 균일하게 유계됩니다.
        </p>
      </>
    ),
  },
  {
    title: '출력 오차 한계 도출',
    tag: 'Step 4',
    color: { border: 'border-green-300 dark:border-green-700', bg: 'bg-green-50 dark:bg-green-950/30', badge: 'bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-200' },
    body: (
      <>
        <p className="mb-2 text-sm text-slate-700 dark:text-slate-300">
          출력 함수 <InlineMath latex="\Psi_t" />에 삼각 부등식을 적용합니다:
        </p>
        <BlockMath latex={String.raw`\|\mathbf{y}_t - \hat{\mathbf{y}}_t\| \le L_\Psi\, e_t + L_{\Psi,\theta}\|\Delta\boldsymbol{\theta}\| \le \left(\frac{L_\Psi L_{\Phi,\theta}}{1-\rho} + L_{\Psi,\theta}\right)\|\Delta\boldsymbol{\theta}\|`} />
        <p className="text-sm text-slate-600 dark:text-slate-400">
          이 한계는 t에 의존하지 않습니다. 양자화 오차 <InlineMath latex="\|\Delta\boldsymbol{\theta}\|" />의 선형 배수로 출력 편차가 균일하게 유계됩니다. □
        </p>
      </>
    ),
  },
];

/* Interactive slider for bound visualization */
function BoundSlider() {
  const [rho, setRho] = useState(0.6);
  const [deltaTheta, setDeltaTheta] = useState(0.1);
  const LPhiTheta = 1.0, LPsi = 1.0, LPsiTheta = 0.5;

  const stateBound = (LPhiTheta / (1 - rho)) * deltaTheta;
  const outputBound = (LPsi * LPhiTheta / (1 - rho) + LPsiTheta) * deltaTheta;

  return (
    <div className="mt-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-4">
      <p className="mb-3 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
        명제 한계 계산기 (L_Φ=1, L_Ψ=1, L_{'{'}Ψ,θ{'}'}=0.5 고정)
      </p>
      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-3 text-sm">
          <label className="w-36 flex-shrink-0 text-slate-600 dark:text-slate-300">
            수축률 ρ = <span className="font-mono text-indigo-600 dark:text-indigo-400">{rho.toFixed(2)}</span>
          </label>
          <input type="range" min={0.0} max={0.99} step={0.01} value={rho}
            onChange={(e) => setRho(Number(e.target.value))}
            className="flex-1 accent-indigo-600" />
        </div>
        <div className="flex items-center gap-3 text-sm">
          <label className="w-36 flex-shrink-0 text-slate-600 dark:text-slate-300">
            ‖Δθ‖ = <span className="font-mono text-rose-600 dark:text-rose-400">{deltaTheta.toFixed(3)}</span>
          </label>
          <input type="range" min={0.001} max={0.5} step={0.001} value={deltaTheta}
            onChange={(e) => setDeltaTheta(Number(e.target.value))}
            className="flex-1 accent-rose-500" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-center text-xs">
        <div className="rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 px-3 py-2">
          <p className="text-xs text-indigo-500 mb-0.5">상태 오차 상한 e_t ≤</p>
          <p className="font-mono font-bold text-indigo-700 dark:text-indigo-300">{stateBound.toFixed(4)}</p>
          <p className="text-xs text-indigo-400">1/(1-ρ) 발산 → ρ=1에서 무한대</p>
        </div>
        <div className="rounded-lg bg-green-50 dark:bg-green-950/40 border border-green-100 dark:border-green-900/40 px-3 py-2">
          <p className="text-xs text-green-500 mb-0.5">출력 오차 상한 ‖y_t − ŷ_t‖ ≤</p>
          <p className="font-mono font-bold text-green-700 dark:text-green-300">{outputBound.toFixed(4)}</p>
          <p className="text-xs text-green-400">토큰 길이 t와 무관!</p>
        </div>
      </div>
    </div>
  );
}

export default function QuantRobustProofViz() {
  const [step, setStep] = useState(0);

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
      <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        명제 증명 단계별 전개
      </p>
      <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
        버튼을 클릭하여 증명 단계를 순서대로 확인하세요.
      </p>

      {/* Step buttons */}
      <div className="mb-4 flex flex-wrap gap-2">
        {PROOF_STEPS.map((s, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            className={`rounded-lg px-3 py-1.5 text-sm font-bold transition ${
              step === i
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            {s.tag}
          </button>
        ))}
      </div>

      {/* Active step */}
      {PROOF_STEPS.map((s, i) => (
        <div
          key={i}
          className={`rounded-xl border-2 overflow-hidden transition-all duration-300 ${s.color.border} ${
            step === i ? 'opacity-100' : 'hidden'
          }`}
        >
          <div className={`${s.color.bg} px-4 py-2.5 flex items-center gap-2`}>
            <span className={`rounded-md px-2.5 py-0.5 text-xs font-black ${s.color.badge}`}>{s.tag}</span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{s.title}</span>
          </div>
          <div className="px-4 py-3 text-slate-800 dark:text-slate-100">
            {s.body}
          </div>
        </div>
      ))}

      {/* Progress */}
      <div className="mt-3 flex items-center justify-between">
        <button
          onClick={() => setStep((prev) => Math.max(0, prev - 1))}
          disabled={step === 0}
          className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 transition"
        >
          ← 이전
        </button>
        <span className="text-sm text-slate-400">{step + 1} / {PROOF_STEPS.length}</span>
        <button
          onClick={() => setStep((prev) => Math.min(PROOF_STEPS.length - 1, prev + 1))}
          disabled={step === PROOF_STEPS.length - 1}
          className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 transition"
        >
          다음 →
        </button>
      </div>

      {/* Interactive bound calculator (always visible) */}
      <BoundSlider />
    </div>
  );
}
