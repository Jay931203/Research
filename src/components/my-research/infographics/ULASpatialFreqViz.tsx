'use client';

import { useMemo, useState } from 'react';

const N = 8;
const D_OVER_LAMBDA = 0.5; // half-wavelength spacing

// Dirichlet kernel magnitude (normalized to 1 at peak)
function dirichlet(u: number, uk: number): number {
  const eps = u - uk;
  if (Math.abs(eps) < 1e-8) return 1;
  return (
    Math.abs(Math.sin(Math.PI * N * eps)) /
    (N * Math.abs(Math.sin(Math.PI * eps)))
  );
}

export default function ULASpatialFreqViz() {
  const [thetaDeg, setThetaDeg] = useState(22);

  const theta = (thetaDeg * Math.PI) / 180;
  const u = D_OVER_LAMBDA * Math.sin(theta); // u = (d/λ)·sin(θ)
  const isOnGrid = Math.abs((u * N) - Math.round(u * N)) < 0.06;

  // Beam pattern: bins k = -N/2 ... N/2-1
  const beamPattern = useMemo(() => {
    return Array.from({ length: N }, (_, i) => {
      const k = i - N / 2;
      const uk = k / N;
      return { k, uk, mag: dirichlet(u, uk) };
    });
  }, [u]);

  /* ── Geometry SVG constants ── */
  const GW = 460; const GH = 195;
  const ANT_Y = 155;
  const ANT_X0 = 52;
  const ANT_SP = 50;          // px per antenna (d in px)
  const LAMBDA_PX = 100;      // 1 λ = 100 px → d = 50 px = λ/2 ✓
  const wfDx = Math.cos(theta);
  const wfDy = -Math.sin(theta); // SVG y is downward → flip sign

  // 4 wavefront lines, stepping upstream by 1 λ from ant 0
  const wavefronts = [0, 1, 2, 3].map((k) => {
    const ox = ANT_X0 + k * LAMBDA_PX * Math.sin(theta);
    const oy = ANT_Y  - k * LAMBDA_PX * Math.cos(theta);
    const half = 260;
    return {
      x1: ox - half * wfDx, y1: oy - half * wfDy,
      x2: ox + half * wfDx, y2: oy + half * wfDy,
      first: k === 0,
    };
  });

  // Foot of perpendicular from ant1 to wavefront through ant0
  // foot = ant0 + (ant0→ant1 · wfDir) * wfDir
  const dot = ANT_SP * wfDx; // (ANT_SP,0)·(wfDx,wfDy)
  const footX = ANT_X0 + dot * wfDx;
  const footY = ANT_Y  + dot * wfDy;
  const showPath = Math.abs(thetaDeg) > 3;

  /* ── Beam pattern SVG constants ── */
  const BW = 460; const BH = 90;
  const bPad = 26; const bInner = BW - bPad * 2;
  const barW = bInner / N * 0.55;
  const bxOf = (uk: number) => bPad + (uk + 0.5) * bInner; // uk ∈ [-0.5, 0.5)

  /* ── spatial-freq number line ── */
  const nlY = 36;

  return (
    <div className="space-y-3 rounded-xl border border-sky-200 bg-sky-50 p-4 dark:border-sky-800 dark:bg-sky-950/20">
      <p className="text-xs font-bold uppercase tracking-wide text-sky-700 dark:text-sky-300">
        인터랙티브 — ULA 기하학 · 공간 주파수 · Dirichlet 빔 패턴
      </p>

      {/* Slider */}
      <div className="flex items-center gap-3">
        <span className="w-20 shrink-0 text-xs text-sky-600 dark:text-sky-400">도래각 θ</span>
        <input
          type="range" min={-60} max={60} step={1} value={thetaDeg}
          onChange={(e) => setThetaDeg(parseInt(e.target.value))}
          className="flex-1 accent-sky-500"
        />
        <span className="w-14 shrink-0 text-right font-mono text-xs font-bold text-sky-700 dark:text-sky-300">
          {thetaDeg > 0 ? '+' : ''}{thetaDeg}°
        </span>
      </div>

      {/* Key values row */}
      <div className="flex flex-wrap gap-2 font-mono text-xs">
        <span className="rounded bg-white px-2 py-0.5 dark:bg-gray-800">
          sin(θ)={Math.sin(theta).toFixed(3)}
        </span>
        <span className="rounded bg-white px-2 py-0.5 dark:bg-gray-800">
          u = ½·sin(θ) = <strong>{u.toFixed(3)}</strong>
        </span>
        <span className="rounded bg-white px-2 py-0.5 dark:bg-gray-800">
          u·N = {(u * N).toFixed(2)}
        </span>
        <span
          className={`rounded px-2 py-0.5 font-bold ${
            isOnGrid
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
          }`}
        >
          {isOnGrid ? 'On-grid' : 'Off-grid — Dirichlet 누설'}
        </span>
      </div>

      {/* ── Panel A: ULA Geometry ── */}
      <div>
        <p className="mb-1 text-xs font-semibold text-gray-500 dark:text-gray-400">
          A. ULA 기하학: 왜 경로차 = d·sin(θ) 인가?
        </p>
        <svg viewBox={`0 0 ${GW} ${GH}`} width="100%" height={GH} className="block rounded-lg bg-gray-950">

          <defs>
            <marker id="ula-arr-y" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
              <path d="M0,0 L0,6 L6,3 z" fill="#fbbf24" />
            </marker>
            <marker id="ula-arr-r" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
              <path d="M0,0 L0,6 L6,3 z" fill="#f87171" />
            </marker>
          </defs>

          {/* ── Wavefronts ── */}
          {wavefronts.map((wf, i) => (
            <line
              key={i}
              x1={wf.x1} y1={wf.y1} x2={wf.x2} y2={wf.y2}
              stroke="#38bdf8"
              strokeWidth={wf.first ? 1.8 : 1}
              strokeDasharray={wf.first ? undefined : '5,3'}
              opacity={0.7 - i * 0.12}
            />
          ))}
          <text x={GW - 10} y={12} textAnchor="end" fontSize={7} fill="#38bdf8">파면 (wavefront)</text>
          <text x={GW - 10} y={22} textAnchor="end" fontSize={6.5} fill="#4b5563">λ 간격마다 반복</text>

          {/* ── Direction arrow ── */}
          {(() => {
            const cx = ANT_X0 + 3.5 * ANT_SP;
            const ay1 = ANT_Y - 110;
            const ax1 = cx - 80 * Math.sin(theta);
            const ay2 = ANT_Y - 18;
            const ax2 = cx;
            return (
              <line x1={ax1} y1={ay1} x2={ax2} y2={ay2}
                stroke="#fbbf24" strokeWidth={2} markerEnd="url(#ula-arr-y)" />
            );
          })()}

          {/* ── Normal (broadside) dashed line at ant 0 ── */}
          <line x1={ANT_X0} y1={ANT_Y - 55} x2={ANT_X0} y2={ANT_Y - 8}
            stroke="#4b5563" strokeWidth={0.8} strokeDasharray="2,2" />

          {/* ── Theta arc ── */}
          {thetaDeg !== 0 && (() => {
            const r = 28;
            const a1 = -Math.PI / 2; // pointing up = broadside
            const a2 = -Math.PI / 2 + theta;
            const sweepFlag = theta > 0 ? 1 : 0;
            const x1 = ANT_X0 + r * Math.cos(a1);
            const y1 = ANT_Y - 8 + r * Math.sin(a1);
            const x2 = ANT_X0 + r * Math.cos(a2);
            const y2 = ANT_Y - 8 + r * Math.sin(a2);
            return (
              <g>
                <path d={`M ${x1} ${y1} A ${r} ${r} 0 0 ${sweepFlag} ${x2} ${y2}`}
                  fill="none" stroke="#fbbf24" strokeWidth={1.2} />
                <text
                  x={ANT_X0 + 34 * Math.cos(-Math.PI / 2 + theta / 2)}
                  y={ANT_Y - 8 + 34 * Math.sin(-Math.PI / 2 + theta / 2)}
                  fontSize={9} fill="#fbbf24" fontStyle="italic" textAnchor="middle"
                >θ</text>
              </g>
            );
          })()}

          {/* ── Path difference: ant1 → foot ── */}
          {showPath && (
            <g>
              {/* Foot point on wavefront */}
              <circle cx={footX} cy={footY} r={3} fill="#f87171" />
              {/* Red dashed line: extra path that wave travels to reach ant1 */}
              <line x1={ANT_X0 + ANT_SP} y1={ANT_Y - 8} x2={footX} y2={footY}
                stroke="#f87171" strokeWidth={2} strokeDasharray="3,2"
                markerEnd="url(#ula-arr-r)" />
              {/* Label */}
              <text
                x={(ANT_X0 + ANT_SP + footX) / 2 + (theta > 0 ? 8 : -8)}
                y={(ANT_Y - 8 + footY) / 2 - 6}
                fontSize={7} fill="#f87171" fontWeight="bold"
                textAnchor={theta > 0 ? 'start' : 'end'}
              >
                d·sin θ = {(D_OVER_LAMBDA * Math.abs(Math.sin(theta))).toFixed(3)}λ
              </text>
            </g>
          )}

          {/* ── Right-angle mark at foot ── */}
          {showPath && (() => {
            const s = 6;
            // foot perpendicular: direction from ant1 to foot = (footX-ant1x, footY-ant1y), normalized
            const dx = footX - (ANT_X0 + ANT_SP);
            const dy = footY - (ANT_Y - 8);
            const len = Math.sqrt(dx * dx + dy * dy) || 1;
            const nx = dx / len; const ny = dy / len;
            // perpendicular to that: wavefront direction
            const px = wfDx; const py = wfDy;
            const cx = footX - nx * s; const cy = footY - ny * s;
            return (
              <path
                d={`M ${cx} ${cy} L ${cx + px * s} ${cy + py * s} L ${footX + px * s} ${footY + py * s}`}
                fill="none" stroke="#f87171" strokeWidth={0.8}
              />
            );
          })()}

          {/* ── Antennas ── */}
          {Array.from({ length: N }, (_, n) => {
            const ax = ANT_X0 + n * ANT_SP;
            return (
              <g key={n}>
                <line x1={ax} y1={ANT_Y + 2} x2={ax} y2={ANT_Y + 16} stroke="#6b7280" strokeWidth={1} />
                <rect x={ax - 7} y={ANT_Y - 9} width={14} height={11} rx={1.5}
                  fill={n < 2 ? '#818cf8' : '#374151'}
                  stroke={n < 2 ? '#a78bfa' : '#4b5563'} strokeWidth={0.8}
                />
                <text x={ax} y={ANT_Y + 27} textAnchor="middle" fontSize={6.5} fill="#6b7280">{n}</text>
              </g>
            );
          })}

          {/* ── d bracket ant0 ↔ ant1 ── */}
          {[0, 1].map((side) => (
            <line key={side}
              x1={ANT_X0 + side * ANT_SP} y1={ANT_Y + 32}
              x2={ANT_X0 + side * ANT_SP} y2={ANT_Y + 36}
              stroke="#a78bfa" strokeWidth={1}
            />
          ))}
          <line x1={ANT_X0} y1={ANT_Y + 34} x2={ANT_X0 + ANT_SP} y2={ANT_Y + 34}
            stroke="#a78bfa" strokeWidth={1} />
          <text x={ANT_X0 + ANT_SP / 2} y={ANT_Y + 47} textAnchor="middle" fontSize={7} fill="#a78bfa">
            d = λ/2
          </text>

          {/* ── Phase shift label ── */}
          <text x={GW / 2} y={GH - 4} textAnchor="middle" fontSize={7} fill="#4b5563">
            {showPath
              ? `ant 0 → ant n 위상차: exp(j·2π·n·u) = exp(j·2π·n·${u.toFixed(3)})`
              : 'θ=0 (정면): 모든 안테나에 동시 도달 → 위상차 = 0'}
          </text>
        </svg>
      </div>

      {/* ── Panel B: Spatial-freq number line + beam pattern ── */}
      <div>
        <p className="mb-1 text-xs font-semibold text-gray-500 dark:text-gray-400">
          B. 공간 주파수 u의 위치와 DFT 빔 패턴
        </p>
        <svg viewBox={`0 0 ${BW} ${BH + 20}`} width="100%" height={BH + 20} className="block rounded-lg bg-gray-950">

          {/* ── Number line ── */}
          <line x1={bPad} y1={nlY} x2={BW - bPad} y2={nlY} stroke="#4b5563" strokeWidth={0.7} />
          {[-0.5, -0.375, -0.25, -0.125, 0, 0.125, 0.25, 0.375].map((v) => {
            const x = bxOf(v);
            const isBin = beamPattern.some((b) => Math.abs(b.uk - v) < 0.001);
            return (
              <g key={v}>
                <line x1={x} y1={nlY - 4} x2={x} y2={nlY + 4}
                  stroke={isBin ? '#818cf8' : '#374151'} strokeWidth={isBin ? 1.5 : 0.8} />
                {isBin && <circle cx={x} cy={nlY} r={3} fill="#818cf8" opacity={0.4} />}
                {[-0.5, -0.25, 0, 0.25].includes(v) && (
                  <text x={x} y={nlY + 13} textAnchor="middle" fontSize={6} fill="#6b7280">{v}</text>
                )}
              </g>
            );
          })}
          {/* u marker */}
          <line x1={bxOf(u)} y1={nlY - 10} x2={bxOf(u)} y2={nlY + 10}
            stroke={isOnGrid ? '#4ade80' : '#f87171'} strokeWidth={2.5} />
          <text x={bxOf(u)} y={nlY - 14} textAnchor="middle" fontSize={7}
            fill={isOnGrid ? '#4ade80' : '#f87171'} fontWeight="bold">u</text>
          <text x={bPad} y={nlY - 14} fontSize={6.5} fill="#4b5563">DFT 빈 k/N:</text>

          {/* ── Beam pattern bars ── */}
          {beamPattern.map(({ uk, mag }) => {
            const bx = bxOf(uk) - barW / 2;
            const barH = mag * (BH - nlY - 12);
            const by = BH - barH;
            return (
              <rect
                key={uk}
                x={bx} y={by} width={barW} height={barH} rx={1.5}
                fill={isOnGrid && mag > 0.95 ? '#4ade80' : '#60a5fa'}
                opacity={0.85}
              >
                <title>u_k={uk.toFixed(3)}, |A(k)|={mag.toFixed(3)}</title>
              </rect>
            );
          })}

          {/* axis */}
          <line x1={bPad} y1={BH} x2={BW - bPad} y2={BH} stroke="#4b5563" strokeWidth={0.5} />
          <text x={BW - bPad + 2} y={BH + 3} fontSize={6} fill="#4b5563">u</text>
          <text x={bPad - 2} y={nlY + (BH - nlY) / 2 + 2} fontSize={6} fill="#4b5563" textAnchor="end">|A|</text>
        </svg>
      </div>

      {/* Derivation callout */}
      <div className="rounded-lg bg-white px-3 py-2.5 text-sm text-gray-700 dark:bg-gray-900 dark:text-gray-300">
        <p className="mb-1 font-bold">왜 u = d·sin(θ)/λ ?</p>
        <p>
          안테나 n은 안테나 0보다 <strong>d·sin(θ)</strong> 더 먼 경로를 통해 파면을 수신합니다 (그림 A의 빨간 선).
          이 경로차가 파장 λ의 몇 배인지가 위상차: <strong>2π·(d·sin(θ)/λ)</strong>.
          n번째 안테나의 수신 신호에 이 위상이 n번 누적되면
          → 스티어링 벡터 <em>a(θ)</em> = [1, e^(j·2π·u), e^(j·4π·u), …] where{' '}
          <strong>u ≡ d·sin(θ)/λ</strong>.
          이 벡터는 공간 주파수 u인 복소 지수입니다.
          DFT가 시간 주파수를 분해하듯, 공간 DFT(= F_t)가{' '}
          <strong>u가 격자 k/N에 정확히 떨어지면 하나의 빔 빈에만</strong>,
          그렇지 않으면 Dirichlet 패턴으로 모든 빈에 에너지를 분산시킵니다 (그림 B).
        </p>
      </div>
    </div>
  );
}
