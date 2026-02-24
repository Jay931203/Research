'use client';

import { useState, useEffect } from 'react';

// CSI angle-domain: 10 coefficients — 2 dominant paths (k=2, k=6) + noise/leakage
const INPUT_SEQ = [0.08, 0.13, 0.91, 0.10, 0.06, 0.09, 0.87, 0.11, 0.07, 0.10];
const N = INPUT_SEQ.length;
const D = 5; // state dimension (visualized)

// SSM parameters: A diagonal (negative = stable), B/C weight vectors
const A_D = [-0.85, -1.20, -1.05, -1.50, -0.92];
const B_W = [0.85, 0.72, 0.91, 0.78, 0.83];
const C_W = [0.76, 0.68, 0.82, 0.71, 0.74];

const DELTA_FIXED = 0.5;

type StepResult = { h: number[]; delta: number; aBar: number[]; y: number };

function buildTrace(mode: 'fixed' | 'selective'): StepResult[] {
  let h = Array(D).fill(0) as number[];
  return INPUT_SEQ.map((x) => {
    const delta = mode === 'fixed' ? DELTA_FIXED : Math.max(0.05, x * 2.0);
    const aBar = A_D.map((a) => Math.exp(delta * a));
    const newH = h.map((hd, d) => aBar[d] * hd + delta * B_W[d] * x);
    const y = C_W.reduce((sum, c, d) => sum + c * newH[d], 0) / D;
    h = newH;
    return { h: [...newH], delta, aBar, y };
  });
}

const FIXED_TRACE = buildTrace('fixed');
const SELECTIVE_TRACE = buildTrace('selective');

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function stateColor(pct: number, highlight: boolean): string {
  const r = Math.round(lerp(highlight ? 99 : 107, highlight ? 79 : 129, pct));
  const g = Math.round(lerp(highlight ? 102 : 114, highlight ? 70 : 246, pct));
  const b = Math.round(lerp(highlight ? 241 : 246, highlight ? 229 : 255, pct));
  return `rgb(${r},${g},${b})`;
}

export default function MambaSSMCoreViz() {
  const [step, setStep] = useState<number>(-1);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    if (step >= N - 1) { setPlaying(false); return; }
    const t = setTimeout(() => setStep((s) => s + 1), 750);
    return () => clearTimeout(t);
  }, [playing, step]);

  function handlePlay() {
    if (step >= N - 1) { setStep(0); setPlaying(true); return; }
    setPlaying((p) => !p);
  }

  const stepIdx = Math.max(0, step);
  const xVal = INPUT_SEQ[stepIdx];
  const isDominant = xVal > 0.5;
  const fixedData = step >= 0 ? FIXED_TRACE[stepIdx] : null;
  const selData = step >= 0 ? SELECTIVE_TRACE[stepIdx] : null;

  const aBarFixed = fixedData?.aBar[0] ?? Math.exp(DELTA_FIXED * A_D[0]);
  const aBarSel = selData?.aBar[0] ?? 0;

  function StateViz({
    data,
    highlight,
  }: {
    data: StepResult | null;
    highlight: boolean;
  }) {
    const h = data?.h ?? Array(D).fill(0);
    const maxH = Math.max(...h.map(Math.abs), 0.01);
    return (
      <div className="flex gap-1 items-end" style={{ height: 90 }}>
        {h.map((v, d) => {
          const pct = Math.abs(v) / maxH;
          return (
            <div key={d} className="flex-1 flex flex-col items-center justify-end gap-0.5">
              <div
                className="w-full rounded-t-sm transition-all duration-400"
                style={{
                  height: `${Math.max(4, pct * 70)}px`,
                  backgroundColor: stateColor(pct, highlight),
                  opacity: data ? 0.6 + pct * 0.4 : 0.2,
                }}
                title={`h${d + 1}=${v.toFixed(3)}`}
              />
              <span className="text-xs text-gray-400">h{d + 1}</span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-md w-full">
      <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
        Mamba 선택적 스캔 메커니즘
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        입력 의존적 Δ_t로 지배 경로를 선택적으로 기억하고 잡음·누설을 억제합니다.
        고정 Δ 방식(S4)과 비교하며 차이를 확인하세요.
      </p>

      {/* State equation */}
      <div className="mb-5 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 px-4 py-3">
        <div className="flex flex-wrap gap-x-4 gap-y-1 items-center">
          <span className="text-xs font-mono text-indigo-800 dark:text-indigo-200 font-bold">이산화 SSM:</span>
          <span className="text-xs font-mono text-indigo-700 dark:text-indigo-300">
            h_k = diag(Ā_k) · h_&#123;k-1&#125; + Δ_k · B · x_k
          </span>
          <span className="text-xs font-mono text-indigo-700 dark:text-indigo-300">
            y_k = C · h_k
          </span>
        </div>
        <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1.5">
          <span className="font-semibold">Mamba 선택성:</span>{' '}
          Ā_k = exp(Δ_k · A). 큰 x_k → 큰 Δ_k → Ā_k ≈ 0 (과거 망각, 현재 입력 집중)
        </p>
      </div>

      {/* Input sequence */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
          입력 시퀀스: CSI 각도-지연 도메인 계수 (지배 경로: k=2, k=6)
        </p>
        <div
          className="flex gap-1 items-end rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 pt-3 pb-2"
          style={{ height: 120 }}
        >
          {INPUT_SEQ.map((x, i) => {
            const isCurrent = step >= 0 && i === stepIdx;
            const isPast = step >= 0 && i < stepIdx;
            const isDom = x > 0.5;
            return (
              <div key={i} className="flex-1 flex flex-col items-center justify-end gap-0.5">
                {isCurrent && (
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 leading-none">▼</span>
                )}
                <div
                  className={`w-full rounded-t-sm transition-all duration-300 ${
                    isCurrent ? 'ring-2 ring-indigo-400 ring-offset-1 ring-offset-gray-50 dark:ring-offset-gray-800' : ''
                  }`}
                  style={{
                    height: `${Math.max(4, x * 80)}px`,
                    backgroundColor: isDom ? '#6366f1' : '#9ca3af',
                    opacity: isCurrent ? 1 : isPast ? 0.4 : 0.8,
                  }}
                  title={`x[${i}] = ${x}`}
                />
                <span className="text-xs text-gray-400">{i}</span>
              </div>
            );
          })}
        </div>
        <div className="flex gap-4 mt-1.5">
          <div className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-sm bg-indigo-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400">지배 경로 (高 에너지)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-sm bg-gray-400" />
            <span className="text-xs text-gray-500 dark:text-gray-400">잡음/off-grid 누설 (低 에너지)</span>
          </div>
        </div>
      </div>

      {/* Side-by-side Fixed vs Selective */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {/* Fixed */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">고정 스캔 (S4)</span>
              <p className="text-xs text-gray-500 mt-0.5">Δ 고정 = 0.50</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Ā = exp(0.5·A₁)</p>
              <span className="text-xs font-mono font-bold text-gray-600 dark:text-gray-300">
                ≈ {aBarFixed.toFixed(3)}
              </span>
            </div>
          </div>
          <StateViz data={fixedData} highlight={false} />
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-gray-500">출력 y_k =</span>
            <span className="font-mono font-bold text-gray-600 dark:text-gray-300">
              {fixedData?.y.toFixed(4) ?? '—'}
            </span>
          </div>
        </div>

        {/* Selective */}
        <div
          className={`rounded-xl border p-4 transition-all duration-300 ${
            step >= 0 && isDominant
              ? 'border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-950/40 shadow-md'
              : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <span
                className={`text-sm font-bold ${
                  step >= 0 && isDominant
                    ? 'text-indigo-700 dark:text-indigo-300'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                선택적 스캔 (Mamba)
              </span>
              <p className="text-xs text-gray-500 mt-0.5">Δ_k = f(x_k)</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">
                Δ_k = {selData?.delta.toFixed(2) ?? '—'}
              </p>
              <span
                className={`text-xs font-mono font-bold transition-all duration-300 ${
                  step >= 0 && isDominant
                    ? 'text-indigo-600 dark:text-indigo-300'
                    : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                Ā ≈ {aBarSel > 0 ? aBarSel.toFixed(3) : '—'}
              </span>
            </div>
          </div>
          <StateViz data={selData} highlight={step >= 0 && isDominant} />
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-gray-500">출력 y_k =</span>
            <span
              className={`font-mono font-bold ${
                step >= 0 && isDominant
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              {selData?.y.toFixed(4) ?? '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Δ comparison bar */}
      {step >= 0 && (
        <div className="mb-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3">
          <div className="flex items-center gap-3 mb-1.5">
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 w-24 shrink-0">고정 Δ=0.50</span>
            <div className="flex-1 h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gray-400 transition-all duration-300"
                style={{ width: `${(DELTA_FIXED / 2.0) * 100}%` }}
              />
            </div>
            <span className="text-xs font-mono text-gray-500 w-12 text-right">Ā={aBarFixed.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 w-24 shrink-0">
              선택 Δ={(selData?.delta ?? 0).toFixed(2)}
            </span>
            <div className="flex-1 h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, ((selData?.delta ?? 0) / 2.0) * 100)}%`,
                  backgroundColor: isDominant ? '#6366f1' : '#9ca3af',
                }}
              />
            </div>
            <span
              className={`text-xs font-mono w-12 text-right ${
                isDominant ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-gray-500'
              }`}
            >
              Ā={aBarSel > 0 ? aBarSel.toFixed(2) : '—'}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1.5 text-right">* Ā = exp(Δ·A₁), A₁={A_D[0]}</p>
        </div>
      )}

      {/* Insight text */}
      {step >= 0 && (
        <div
          className={`rounded-lg px-4 py-2.5 mb-4 text-xs transition-all duration-300 ${
            isDominant
              ? 'bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800'
              : 'bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800'
          }`}
        >
          {isDominant ? (
            <span className="text-indigo-700 dark:text-indigo-300 leading-relaxed">
              <span className="font-bold">⭐ k={stepIdx}: 지배 경로 (x={xVal.toFixed(2)})</span>{' '}
              — 선택적 Δ={selData?.delta.toFixed(2)} (큼) → Ā≈{aBarSel.toFixed(2)} (작음).
              상태가 현재 입력을 강하게 포착합니다.
              고정 스캔(Ā≈{aBarFixed.toFixed(2)})보다 현재 입력에 더 집중합니다.
            </span>
          ) : (
            <span className="text-amber-700 dark:text-amber-300 leading-relaxed">
              <span className="font-semibold">k={stepIdx}: 잡음/누설 (x={xVal.toFixed(2)})</span>{' '}
              — 선택적 Δ={selData?.delta.toFixed(2)} (작음) → Ā≈{aBarSel.toFixed(2)} (큼).
              상태가 거의 변하지 않고 이전 기억을 유지합니다.
              고정 스캔과 달리 잡음을 억제합니다.
            </span>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <button
          onClick={handlePlay}
          className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors"
        >
          {playing ? '⏸ 일시정지' : step < 0 ? '▶ 시작' : step >= N - 1 ? '↺ 다시 재생' : '▶ 재생'}
        </button>
        <button
          onClick={() => {
            setPlaying(false);
            if (step < N - 1) setStep((s) => s + 1);
          }}
          disabled={step >= N - 1}
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm disabled:opacity-40 transition-colors"
        >
          다음 스텝 →
        </button>
        {step >= 0 && (
          <button
            onClick={() => { setStep(-1); setPlaying(false); }}
            className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm transition-colors"
          >
            초기화
          </button>
        )}
        {step >= 0 && (
          <span className="text-sm text-gray-400 dark:text-gray-500 ml-auto">
            k = {stepIdx} / {N - 1}
          </span>
        )}
      </div>

      {/* Theory note */}
      <div className="rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-3">
        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
          <span className="font-semibold text-gray-800 dark:text-gray-200">CSI에서 Mamba가 유리한 이유:</span>{' '}
          각도-지연 도메인 CSI는 소수의 지배 경로에 에너지가 집중된 <strong>희소 구조</strong>입니다.
          Mamba의 선택적 Δ_k는 고에너지 계수에서 크게 반응해 상태를 갱신하고,
          저에너지 잡음·off-grid 누설에서는 작아서 과거 기억을 유지합니다.
          고정 Δ(S4)는 모든 입력을 동일하게 처리하므로 잡음이 상태를 오염시킵니다.
          이것이 Mamba-Transformer AE가 동일 FLOPs에서 더 낮은 정보 하한을 달성하는 핵심 원리입니다.
        </p>
      </div>
    </div>
  );
}
