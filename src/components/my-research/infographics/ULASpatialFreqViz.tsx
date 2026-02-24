'use client';

import { useMemo, useState } from 'react';

const N = 8;
const D_OVER_LAMBDA = 0.5; // d/λ = half-wavelength

function dirichletMag(u: number, uk: number): number {
  const eps = u - uk;
  if (Math.abs(eps) < 1e-9) return 1;
  return (
    Math.abs(Math.sin(Math.PI * N * eps)) /
    (N * Math.abs(Math.sin(Math.PI * eps)))
  );
}

export default function ULASpatialFreqViz() {
  const [thetaDeg, setThetaDeg] = useState(22);

  const theta = (thetaDeg * Math.PI) / 180;
  const sinT = Math.sin(theta);
  const u = D_OVER_LAMBDA * sinT;
  const uN = u * N;
  const isOnGrid = Math.abs(uN - Math.round(uN)) < 0.07;

  const beamBins = useMemo(() => {
    return Array.from({ length: N }, (_, i) => {
      const k = i - N / 2; // k = -4 … 3
      const uk = k / N;
      return { k, uk, mag: dirichletMag(u, uk) };
    });
  }, [u]);

  /* ── Geometry SVG ── */
  const GW = 520, GH = 230;
  const antY = 168;
  const antX0 = 65;
  const antSp = 66;
  // wavefront direction perpendicular to ray (sinθ, cosθ) → wfDir = (cosθ, -sinθ)
  const wfDx = Math.cos(theta);
  const wfDy = -Math.sin(theta);
  const wavefronts = [0, 1, 2].map((k) => {
    const ox = antX0 - k * antSp * 2 * sinT;
    const oy = antY + k * antSp * 2 * Math.cos(theta);
    const half = 300;
    return {
      x1: ox - half * wfDx, y1: oy - half * wfDy,
      x2: ox + half * wfDx, y2: oy + half * wfDy,
      main: k === 0,
    };
  });

  // Foot of perpendicular from ant1 to wavefront at ant0
  const ant1X = antX0 + antSp;
  const ant1Y = antY - 6;
  const ant0Y2 = antY - 6;
  const dotProd = antSp * wfDx; // (antSp,0)·(wfDx,wfDy)
  const footX = antX0 + dotProd * wfDx;
  const footY = antY + dotProd * wfDy;
  const showPath = Math.abs(thetaDeg) > 3;

  /* ── Beam pattern SVG ── */
  const BW = 520, BH = 155;
  const bPL = 46, bPR = 12;
  const bInner = BW - bPL - bPR;
  const barW = (bInner / N) * 0.52;
  const bxOf = (uk: number) => bPL + (uk + 0.5) * bInner;

  return (
    <div className="space-y-4 rounded-xl border border-sky-200 bg-sky-50 p-4 dark:border-sky-800 dark:bg-sky-950/20">
      <p className="text-xs font-bold uppercase tracking-wide text-sky-700 dark:text-sky-300">
        인터랙티브 — ULA 기하학 · 공간 주파수 · 빔 패턴
      </p>

      {/* ── Slider ── */}
      <div className="flex items-center gap-3">
        <span className="w-24 shrink-0 text-sm font-semibold text-sky-700 dark:text-sky-300">도래각 θ</span>
        <input
          type="range" min={-60} max={60} step={1} value={thetaDeg}
          onChange={(e) => setThetaDeg(parseInt(e.target.value))}
          className="flex-1 accent-sky-500"
        />
        <span className="w-14 shrink-0 text-right font-mono text-base font-bold text-sky-700 dark:text-sky-300">
          {thetaDeg > 0 ? '+' : ''}{thetaDeg}°
        </span>
      </div>

      {/* ── Key values row ── */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="rounded-lg bg-white px-3 py-2.5 text-center shadow-sm dark:bg-gray-800">
          <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">sin(θ)</p>
          <p className="mt-0.5 font-mono text-lg font-bold text-gray-700 dark:text-gray-200">{sinT.toFixed(3)}</p>
        </div>
        <div className="rounded-lg bg-white px-3 py-2.5 text-center shadow-sm dark:bg-gray-800">
          <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">u = d/λ · sin θ</p>
          <p className="mt-0.5 font-mono text-lg font-bold text-sky-600 dark:text-sky-400">{u.toFixed(3)}</p>
        </div>
        <div className="rounded-lg bg-white px-3 py-2.5 text-center shadow-sm dark:bg-gray-800">
          <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">u · N (격자 좌표)</p>
          <p className="mt-0.5 font-mono text-lg font-bold text-violet-600 dark:text-violet-400">{uN.toFixed(2)}</p>
        </div>
        <div className={`rounded-lg px-3 py-2.5 text-center shadow-sm ${
          isOnGrid
            ? 'bg-green-50 dark:bg-green-900/30'
            : 'bg-red-50 dark:bg-red-900/20'
        }`}>
          <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">격자 위치</p>
          <p className={`mt-0.5 text-base font-bold ${
            isOnGrid
              ? 'text-green-700 dark:text-green-300'
              : 'text-red-600 dark:text-red-400'
          }`}>
            {isOnGrid ? '✓ On-grid' : '✕ Off-grid'}
          </p>
        </div>
      </div>

      {/* ── Panel A: Geometry ── */}
      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-100 bg-gray-50 px-4 py-2 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">
            A. 경로차 = d·sin(θ) — 기하학적 유도
          </p>
        </div>
        <svg viewBox={`0 0 ${GW} ${GH}`} width="100%" height={GH} className="block">

          {/* White SVG background */}
          <rect x={0} y={0} width={GW} height={GH} fill="#f8fafc" />

          <defs>
            <marker id="uv-yarr" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto">
              <path d="M0,0 L0,9 L9,4.5 z" fill="#d97706" />
            </marker>
            <marker id="uv-rarr" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto">
              <path d="M0,0 L0,9 L9,4.5 z" fill="#ef4444" />
            </marker>
          </defs>

          {/* ── Wavefronts ── */}
          {wavefronts.map((wf, i) => (
            <line key={i}
              x1={wf.x1} y1={wf.y1} x2={wf.x2} y2={wf.y2}
              stroke="#0ea5e9"
              strokeWidth={wf.main ? 2.5 : 1.2}
              strokeDasharray={wf.main ? undefined : '8,5'}
              opacity={1 - i * 0.3}
            />
          ))}
          <text x={GW - 8} y={18} textAnchor="end" fontSize={12} fill="#0369a1" fontWeight="600">
            파면 (wavefront)
          </text>
          <text x={GW - 8} y={32} textAnchor="end" fontSize={10} fill="#7dd3fc">
            λ 간격마다 반복
          </text>

          {/* ── Arrival direction arrow ── */}
          {(() => {
            const endX = antX0 + 2.4 * antSp;
            const endY = antY - 14;
            const len = 90;
            const sX = endX - len * sinT;
            const sY = endY - len * Math.cos(theta);
            return (
              <g>
                <line x1={sX} y1={sY} x2={endX} y2={endY}
                  stroke="#d97706" strokeWidth={3} markerEnd="url(#uv-yarr)" />
                <text
                  x={sX + (thetaDeg >= 0 ? 8 : -8)} y={sY - 6}
                  fontSize={12} fill="#d97706" fontWeight="700"
                  textAnchor={thetaDeg >= 0 ? 'start' : 'end'}>
                  입사 방향
                </text>
              </g>
            );
          })()}

          {/* ── Broadside reference (dashed vertical at ant0) ── */}
          <line x1={antX0} y1={ant0Y2 - 60} x2={antX0} y2={ant0Y2}
            stroke="#cbd5e1" strokeWidth={1} strokeDasharray="4,3" />

          {/* ── Theta arc ── */}
          {thetaDeg !== 0 && (() => {
            const r = 38;
            const a1 = -Math.PI / 2;
            const a2 = a1 + theta;
            const sf = theta > 0 ? 1 : 0;
            const x1a = antX0 + r * Math.cos(a1);
            const y1a = ant0Y2 + r * Math.sin(a1);
            const x2a = antX0 + r * Math.cos(a2);
            const y2a = ant0Y2 + r * Math.sin(a2);
            const midA = (a1 + a2) / 2;
            return (
              <g>
                <path d={`M ${x1a} ${y1a} A ${r} ${r} 0 0 ${sf} ${x2a} ${y2a}`}
                  fill="none" stroke="#d97706" strokeWidth={2} />
                <text
                  x={antX0 + 54 * Math.cos(midA)}
                  y={ant0Y2 + 54 * Math.sin(midA)}
                  fontSize={17} fill="#d97706" fontStyle="italic" fontWeight="800" textAnchor="middle">
                  θ
                </text>
              </g>
            );
          })()}

          {/* ── Path difference ── */}
          {showPath && (
            <g>
              {/* foot dot */}
              <circle cx={footX} cy={footY} r={5.5} fill="#ef4444" />
              {/* red dashed line */}
              <line x1={ant1X} y1={ant1Y} x2={footX} y2={footY}
                stroke="#ef4444" strokeWidth={3.5} strokeDasharray="6,3"
                markerEnd="url(#uv-rarr)" />
              {/* right-angle mark */}
              {(() => {
                const s = 10;
                const dx = footX - ant1X, dy = footY - ant1Y;
                const ln = Math.sqrt(dx * dx + dy * dy) || 1;
                const nx = dx / ln, ny = dy / ln;
                const cx2 = footX - nx * s, cy2 = footY - ny * s;
                return (
                  <path d={`M ${cx2} ${cy2} L ${cx2 + wfDx * s} ${cy2 + wfDy * s} L ${footX + wfDx * s} ${footY + wfDy * s}`}
                    fill="none" stroke="#ef4444" strokeWidth={1.4} />
                );
              })()}
              {/* bold label */}
              <text
                x={(ant1X + footX) / 2 + (thetaDeg > 0 ? 18 : -18)}
                y={(ant1Y + footY) / 2 - 10}
                fontSize={14} fill="#ef4444" fontWeight="800"
                textAnchor={thetaDeg > 0 ? 'start' : 'end'}>
                경로차 = d·sinθ = {(D_OVER_LAMBDA * Math.abs(sinT)).toFixed(3)}λ
              </text>
            </g>
          )}

          {/* ── Antennas ── */}
          {Array.from({ length: 5 }, (_, n) => {
            const ax = antX0 + n * antSp;
            const hi = n <= 1;
            return (
              <g key={n}>
                <line x1={ax} y1={antY + 2} x2={ax} y2={antY + 24}
                  stroke={hi ? '#6366f1' : '#94a3b8'} strokeWidth={hi ? 2.5 : 1.5} />
                <rect x={ax - 11} y={antY - 12} width={22} height={14} rx={3}
                  fill={hi ? '#4f46e5' : '#94a3b8'}
                  stroke={hi ? '#a5b4fc' : '#cbd5e1'} strokeWidth={1.2} />
                <text x={ax} y={antY + 38} textAnchor="middle" fontSize={11}
                  fill={hi ? '#6366f1' : '#94a3b8'} fontWeight={hi ? '700' : '400'}>
                  {n === 0 ? 'ant 0' : n === 1 ? 'ant 1' : `ant ${n}`}
                </text>
              </g>
            );
          })}

          {/* ── d bracket (ant0 ↔ ant1) ── */}
          <line x1={antX0}         y1={antY + 46} x2={antX0}         y2={antY + 50} stroke="#8b5cf6" strokeWidth={2} />
          <line x1={antX0 + antSp} y1={antY + 46} x2={antX0 + antSp} y2={antY + 50} stroke="#8b5cf6" strokeWidth={2} />
          <line x1={antX0}         y1={antY + 48} x2={antX0 + antSp} y2={antY + 48} stroke="#8b5cf6" strokeWidth={2} />
          <text x={antX0 + antSp / 2} y={antY + 63} textAnchor="middle" fontSize={12} fill="#8b5cf6" fontWeight="700">
            d = λ/2
          </text>

          {/* ── Bottom caption ── */}
          <text x={GW / 2} y={GH - 6} textAnchor="middle" fontSize={11} fill="#64748b">
            {showPath
              ? `ant n의 위상: exp(j·2π·n·u) = exp(j·2π·n·${u.toFixed(3)}),   u = d/λ · sinθ`
              : 'θ = 0° 정면 입사: 모든 안테나에 동시 도달 → 위상차 없음'}
          </text>
        </svg>
      </div>

      {/* ── Panel B: Beam Pattern ── */}
      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-100 bg-gray-50 px-4 py-2 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">
            B. 빔 패턴 — u = <span className="font-mono font-bold text-sky-600 dark:text-sky-400">{u.toFixed(3)}</span>
            &nbsp;이 DFT 격자 k/N 에 정확히 떨어지는가?
          </p>
        </div>
        <svg viewBox={`0 0 ${BW} ${BH + 42}`} width="100%" height={BH + 42} className="block">
          <rect x={0} y={0} width={BW} height={BH + 42} fill="#f8fafc" />

          {/* grid line at y=1 */}
          <line x1={bPL} y1={18} x2={BW - bPR} y2={18}
            stroke="#e2e8f0" strokeWidth={0.8} strokeDasharray="4,4" />
          <text x={bPL - 4} y={21} textAnchor="end" fontSize={9} fill="#94a3b8">1.0</text>

          {/* horizontal axis */}
          <line x1={bPL} y1={BH} x2={BW - bPR} y2={BH} stroke="#cbd5e1" strokeWidth={1} />
          <text x={bPL - 4} y={BH + 3} textAnchor="end" fontSize={9} fill="#94a3b8">0</text>

          {/* y-axis */}
          <line x1={bPL} y1={18} x2={bPL} y2={BH} stroke="#e2e8f0" strokeWidth={0.8} />
          <text x={bPL - 6} y={(BH + 18) / 2} textAnchor="end" fontSize={11} fill="#94a3b8">|A|</text>

          {/* bars */}
          {beamBins.map(({ k, uk, mag }) => {
            const cx = bxOf(uk);
            const barH = mag * (BH - 18);
            const byTop = BH - barH;
            const isPeak = mag > 0.9;
            const barColor = isOnGrid && isPeak ? '#16a34a'
              : !isOnGrid && isPeak ? '#ef4444'
              : '#60a5fa';
            return (
              <g key={k}>
                {/* bar */}
                <rect x={cx - barW / 2} y={byTop} width={barW} height={Math.max(barH, 1.5)} rx={2.5}
                  fill={barColor} opacity={0.88} />
                {/* magnitude label above bar */}
                {mag > 0.07 && (
                  <text x={cx} y={byTop - 5} textAnchor="middle" fontSize={9}
                    fill={isPeak ? barColor : '#94a3b8'} fontWeight={isPeak ? '800' : '400'}>
                    {mag.toFixed(2)}
                  </text>
                )}
                {/* k=... label */}
                <text x={cx} y={BH + 14} textAnchor="middle" fontSize={10}
                  fill={isPeak ? '#374151' : '#94a3b8'} fontWeight={isPeak ? '700' : '400'}>
                  k={k}
                </text>
                {/* uk value */}
                <text x={cx} y={BH + 27} textAnchor="middle" fontSize={8.5} fill="#94a3b8">
                  {uk.toFixed(3)}
                </text>
              </g>
            );
          })}

          {/* u marker */}
          {(() => {
            const mx = bxOf(u);
            const col = isOnGrid ? '#16a34a' : '#ef4444';
            return (
              <g>
                <line x1={mx} y1={14} x2={mx} y2={BH} stroke={col} strokeWidth={2.5} strokeDasharray="5,3" />
                <rect x={mx - 22} y={0} width={44} height={18} rx={4} fill={isOnGrid ? '#dcfce7' : '#fee2e2'} />
                <text x={mx} y={13} textAnchor="middle" fontSize={11} fill={col} fontWeight="900">
                  u={u.toFixed(2)}
                </text>
              </g>
            );
          })()}
        </svg>
        <div className={`px-4 py-2 text-sm font-semibold ${
          isOnGrid
            ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300'
            : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
        }`}>
          {isOnGrid
            ? '✓ On-grid: u·N = 정수 → 에너지가 단 하나의 빔 빈에 집중됩니다.'
            : `✕ Off-grid: u·N = ${uN.toFixed(2)} (비정수) → Dirichlet 커널로 에너지가 모든 빔 빈에 분산됩니다.`}
        </div>
      </div>
    </div>
  );
}
