'use client';

import { useState, useMemo } from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import Slider from 'rc-slider';

// --- SVG waveform helpers ---

/** Generate baseband envelope: slow-varying, smooth shape */
function basebandEnvelope(t: number): number {
  return (
    0.6 * Math.sin(2 * Math.PI * 0.8 * t) +
    0.3 * Math.sin(2 * Math.PI * 1.6 * t + 0.7) +
    0.1 * Math.cos(2 * Math.PI * 2.4 * t + 1.2)
  );
}

/** Passband waveform: envelope modulated onto carrier */
function passbandWaveform(t: number, carrierCycles: number): number {
  const envelope = basebandEnvelope(t);
  return envelope * Math.cos(2 * Math.PI * carrierCycles * t);
}

/** Build an SVG path from sampled points */
function buildPath(
  points: { x: number; y: number }[],
  width: number,
  height: number,
  padding: number,
): string {
  if (points.length === 0) return '';
  const xMin = points[0].x;
  const xMax = points[points.length - 1].x;
  const xRange = xMax - xMin || 1;
  const yMax = Math.max(...points.map((p) => Math.abs(p.y)), 0.01);

  return points
    .map((p, i) => {
      const sx = padding + ((p.x - xMin) / xRange) * (width - 2 * padding);
      const sy = height / 2 - (p.y / yMax) * ((height - 2 * padding) / 2);
      return `${i === 0 ? 'M' : 'L'}${sx.toFixed(2)},${sy.toFixed(2)}`;
    })
    .join(' ');
}

// --- Signal flow diagram arrow marker id (unique per component instance) ---
const ARROW_ID = 'bb-arrow';

interface WaveformPanelProps {
  title: string;
  subtitle: string;
  path: string;
  color: string;
  width: number;
  height: number;
  envelopePath?: string;
  envelopeNegPath?: string;
}

function WaveformPanel({
  title,
  subtitle,
  path,
  color,
  width,
  height,
  envelopePath,
  envelopeNegPath,
}: WaveformPanelProps) {
  return (
    <div className="bg-white rounded-xl p-3 border border-slate-200">
      <div className="text-xs font-semibold text-slate-700 mb-1">{title}</div>
      <div className="text-[10px] text-slate-400 mb-2">{subtitle}</div>
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="overflow-visible"
      >
        {/* zero line */}
        <line
          x1={8}
          y1={height / 2}
          x2={width - 8}
          y2={height / 2}
          stroke="#cbd5e1"
          strokeWidth={0.5}
          strokeDasharray="3,3"
        />
        {/* envelope guides (passband only) */}
        {envelopePath && (
          <path
            d={envelopePath}
            fill="none"
            stroke={color}
            strokeWidth={1.2}
            strokeDasharray="4,3"
            opacity={0.35}
          />
        )}
        {envelopeNegPath && (
          <path
            d={envelopeNegPath}
            fill="none"
            stroke={color}
            strokeWidth={1.2}
            strokeDasharray="4,3"
            opacity={0.35}
          />
        )}
        {/* main waveform */}
        <path d={path} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      </svg>
    </div>
  );
}

export default function BasebandConversionLab() {
  const [carrierGHz, setCarrierGHz] = useState(2.4);
  const [activeStage, setActiveStage] = useState<
    'baseband' | 'upconv' | 'passband' | 'channel' | 'downconv' | 'recovered'
  >('passband');

  // Map carrier frequency to visual oscillation density (cycles shown in SVG window)
  const carrierCycles = useMemo(() => {
    // Scale: 900 MHz → 8 cycles, 5 GHz → 40 cycles within the time window
    return Math.round(8 + ((carrierGHz - 0.9) / (5 - 0.9)) * 32);
  }, [carrierGHz]);

  // Pre-compute waveform paths
  const waveforms = useMemo(() => {
    const W = 400;
    const H = 100;
    const PAD = 10;
    const N = 600;

    // Baseband points
    const bbPoints: { x: number; y: number }[] = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      bbPoints.push({ x: t, y: basebandEnvelope(t) });
    }

    // Passband points + envelope for guides
    const pbPoints: { x: number; y: number }[] = [];
    const envPoints: { x: number; y: number }[] = [];
    const envNegPoints: { x: number; y: number }[] = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      pbPoints.push({ x: t, y: passbandWaveform(t, carrierCycles) });
      envPoints.push({ x: t, y: basebandEnvelope(t) });
      envNegPoints.push({ x: t, y: -basebandEnvelope(t) });
    }

    // Recovered baseband (slightly attenuated + minor distortion to show channel effect)
    const recPoints: { x: number; y: number }[] = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      // Simulate channel attenuation and tiny phase shift
      const atten = 0.75;
      const phaseShift = 0.05;
      recPoints.push({
        x: t,
        y:
          atten *
          (0.6 * Math.sin(2 * Math.PI * 0.8 * t + phaseShift) +
            0.3 * Math.sin(2 * Math.PI * 1.6 * t + 0.7 + phaseShift) +
            0.1 * Math.cos(2 * Math.PI * 2.4 * t + 1.2 + phaseShift)),
      });
    }

    return {
      baseband: buildPath(bbPoints, W, H, PAD),
      passband: buildPath(pbPoints, W, H, PAD),
      envelope: buildPath(envPoints, W, H, PAD),
      envelopeNeg: buildPath(envNegPoints, W, H, PAD),
      recovered: buildPath(recPoints, W, H, PAD),
      W,
      H,
    };
  }, [carrierCycles]);

  // Frequency label
  const freqLabel = useMemo(() => {
    if (carrierGHz >= 1) return `${carrierGHz.toFixed(1)} GHz`;
    return `${(carrierGHz * 1000).toFixed(0)} MHz`;
  }, [carrierGHz]);

  // Wavelength
  const wavelength = useMemo(() => {
    const lambda = 3e8 / (carrierGHz * 1e9);
    if (lambda >= 0.01) return `${(lambda * 100).toFixed(1)} cm`;
    return `${(lambda * 1000).toFixed(1)} mm`;
  }, [carrierGHz]);

  // Signal flow stage metadata
  const stages = [
    { key: 'baseband' as const, label: 'x_b(t)', desc: 'Baseband 신호' },
    { key: 'upconv' as const, label: 'e^{j2\\pi f_c t}', desc: 'Up-conversion' },
    { key: 'passband' as const, label: 'x_p(t)', desc: 'Passband 신호' },
    { key: 'channel' as const, label: 'h(\\tau;t)', desc: 'Channel' },
    { key: 'downconv' as const, label: 'e^{-j2\\pi f_c t}', desc: 'Down-conversion' },
    { key: 'recovered' as const, label: 'y_b(t)', desc: 'Recovered Baseband' },
  ];

  return (
    <div className="my-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
      <h3 className="text-xl font-bold text-blue-800 mb-2">
        Baseband ↔ Passband Conversion Lab
      </h3>
      <p className="text-sm text-slate-600 mb-6">
        Tse Ch 2.2.2 — 기저대역(baseband) 신호를 반송파에 실어 보내고(upconversion),
        수신기에서 다시 기저대역으로 되돌리는(downconversion) 과정을 시각적으로 확인합니다.
        반송파 주파수를 바꿔 보면서 passband 신호의 진동 속도가 어떻게 변하는지 관찰하세요.
      </p>

      {/* ─── Signal Flow Diagram ─── */}
      <div className="bg-white rounded-xl p-5 mb-6 border border-slate-200 overflow-x-auto">
        <div className="text-xs font-semibold text-slate-500 mb-3">Signal Flow</div>
        <svg
          width="100%"
          height={72}
          viewBox="0 0 820 72"
          preserveAspectRatio="xMidYMid meet"
          className="min-w-[640px]"
        >
          <defs>
            <marker
              id={ARROW_ID}
              markerWidth="8"
              markerHeight="6"
              refX="8"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="#64748b" />
            </marker>
          </defs>

          {stages.map((stage, i) => {
            const x = 20 + i * 133;
            const isActive = activeStage === stage.key;
            const boxW = 110;
            const boxH = 44;
            const y = 14;

            return (
              <g key={stage.key}>
                {/* connecting arrow (except for first) */}
                {i > 0 && (
                  <line
                    x1={x - 23}
                    y1={y + boxH / 2}
                    x2={x - 3}
                    y2={y + boxH / 2}
                    stroke="#94a3b8"
                    strokeWidth={1.5}
                    markerEnd={`url(#${ARROW_ID})`}
                  />
                )}
                {/* box */}
                <rect
                  x={x}
                  y={y}
                  width={boxW}
                  height={boxH}
                  rx={8}
                  fill={isActive ? '#3b82f6' : '#f1f5f9'}
                  stroke={isActive ? '#2563eb' : '#cbd5e1'}
                  strokeWidth={isActive ? 2 : 1}
                  className="cursor-pointer transition-all duration-200"
                  onClick={() => setActiveStage(stage.key)}
                />
                {/* label (KaTeX can't render in SVG, so use text) */}
                <text
                  x={x + boxW / 2}
                  y={y + boxH / 2 - 4}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={11}
                  fontWeight={600}
                  fill={isActive ? '#fff' : '#334155'}
                  className="pointer-events-none select-none"
                >
                  {stage.desc}
                </text>
                <text
                  x={x + boxW / 2}
                  y={y + boxH / 2 + 10}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={9}
                  fontFamily="monospace"
                  fill={isActive ? '#bfdbfe' : '#94a3b8'}
                  className="pointer-events-none select-none"
                >
                  {stage.label.replace(/\\/g, '')}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* ─── Carrier Frequency Slider ─── */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            반송파 주파수 <InlineMath math="f_c" />:{' '}
            <span className="text-blue-600 font-bold">{freqLabel}</span>
          </label>
          <Slider
            min={0.9}
            max={5}
            step={0.1}
            value={carrierGHz}
            onChange={(v) => setCarrierGHz(v as number)}
            trackStyle={{ backgroundColor: '#3b82f6' }}
            handleStyle={{ borderColor: '#3b82f6' }}
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>900 MHz</span>
            <span>2.4 GHz</span>
            <span>3.5 GHz</span>
            <span>5 GHz</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
            <div className="text-xs text-slate-500">파장 &lambda;</div>
            <div className="text-lg font-bold text-blue-600">{wavelength}</div>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
            <div className="text-xs text-slate-500">표시 사이클 수</div>
            <div className="text-lg font-bold text-indigo-600">{carrierCycles}</div>
          </div>
        </div>
      </div>

      {/* ─── Waveform Visualizations ─── */}
      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <WaveformPanel
          title="1. Baseband  x_b(t)"
          subtitle="저주파 포락선 — 정보를 담고 있는 신호"
          path={waveforms.baseband}
          color="#3b82f6"
          width={waveforms.W}
          height={waveforms.H}
        />
        <WaveformPanel
          title={`2. Passband  x_p(t)  @  ${freqLabel}`}
          subtitle="반송파에 실린 신호 — 빠른 진동 + 포락선"
          path={waveforms.passband}
          color="#6366f1"
          width={waveforms.W}
          height={waveforms.H}
          envelopePath={waveforms.envelope}
          envelopeNegPath={waveforms.envelopeNeg}
        />
        <WaveformPanel
          title="3. Recovered  y_b(t)"
          subtitle="다운컨버전 후 복원된 기저대역 (채널 감쇠 반영)"
          path={waveforms.recovered}
          color="#10b981"
          width={waveforms.W}
          height={waveforms.H}
        />
      </div>

      {/* ─── Math Formulas ─── */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-6 overflow-x-auto">
        <h4 className="font-semibold text-blue-800 mb-4">핵심 수식</h4>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Upconversion */}
          <div>
            <div className="text-xs font-medium text-slate-500 mb-2">Upconversion (송신)</div>
            <BlockMath math={String.raw`x_p(t) = \text{Re}\!\left[x_b(t)\,e^{j2\pi f_c t}\right]`} />
            <p className="text-xs text-slate-500 mt-2">
              기저대역 복소 신호 <InlineMath math="x_b(t)" />를 반송파{' '}
              <InlineMath math={String.raw`e^{j2\pi f_c t}`} />에 곱한 뒤 실수부를 취하면
              passband 신호가 됩니다.
            </p>
          </div>

          {/* Downconversion */}
          <div>
            <div className="text-xs font-medium text-slate-500 mb-2">Downconversion (수신)</div>
            <BlockMath math={String.raw`y_b(t) = \text{LPF}\!\left[y_p(t)\cdot e^{-j2\pi f_c t}\right]`} />
            <p className="text-xs text-slate-500 mt-2">
              수신된 passband 신호에 <InlineMath math={String.raw`e^{-j2\pi f_c t}`} />를 곱하고
              저역통과필터(LPF)를 통과시키면 기저대역 신호를 복원합니다.
            </p>
          </div>
        </div>

        {/* Baseband equivalent channel */}
        <div className="mt-6 pt-4 border-t border-blue-200">
          <div className="text-xs font-medium text-slate-500 mb-2">
            Baseband Equivalent Channel (기저대역 등가 채널)
          </div>
          <BlockMath
            math={String.raw`h_b(\tau;\,t) = \sum_{i} a_i(t)\,e^{-j2\pi f_c \tau_i(t)}\,\delta\!\left(\tau - \tau_i(t)\right)`}
          />
          <p className="text-xs text-slate-500 mt-2">
            각 경로의 지연 <InlineMath math={String.raw`\tau_i`} />에 반송파 위상{' '}
            <InlineMath math={String.raw`e^{-j2\pi f_c \tau_i}`} />가 붙어, 반송파 주파수가
            높을수록 작은 지연 변화에도 위상이 크게 바뀝니다. 이것이 페이딩의 핵심 메커니즘입니다.
          </p>
        </div>
      </div>

      {/* ─── Key Insight Box ─── */}
      <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-xl p-5 mb-6">
        <div className="font-bold text-amber-800 mb-1">
          핵심 통찰: 1:1 재구성 가능
        </div>
        <p className="text-sm text-slate-700 leading-relaxed">
          <strong>Baseband ↔ Passband 간 정보 손실이 없습니다.</strong>{' '}
          복소 기저대역 표현 <InlineMath math="x_b(t)" />와 실수 passband 신호{' '}
          <InlineMath math="x_p(t)" /> 사이에는 일대일(1:1) 대응이 존재합니다. 따라서 모든 분석을
          저주파 기저대역 영역에서 수행해도 일반성을 잃지 않으며, 이것이 통신 시스템 분석을
          기저대역 등가 모델로 단순화하는 이론적 근거가 됩니다.
        </p>
        <p className="text-xs text-slate-500 mt-2">
          Tse 교재는 이 관계를 이용하여 이후 모든 장에서 passband가 아닌 baseband equivalent
          channel <InlineMath math={String.raw`h_b(\tau;t)`} />로 분석합니다.
        </p>
      </div>

      {/* ─── Conversion Process Detail ─── */}
      <div className="grid md:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-xl border border-blue-100 text-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
              1
            </span>
            <span className="font-semibold text-slate-700">Baseband 표현</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            복소 포락선 <InlineMath math="x_b(t) = x_I(t) + jx_Q(t)" />로 I/Q 두 성분에 정보를
            담습니다. 대역폭 <InlineMath math="W" /> Hz로 <InlineMath math="f_c" />보다 훨씬
            좁습니다.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-indigo-100 text-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
              2
            </span>
            <span className="font-semibold text-slate-700">Passband 전송</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            반송파 <InlineMath math={String.raw`f_c`} /> 주변 대역{' '}
            <InlineMath math={String.raw`[f_c - W, f_c + W]`} />에 신호가 위치합니다. 안테나는 이
            주파수 대역의 전자파를 방사합니다.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-100 text-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
              3
            </span>
            <span className="font-semibold text-slate-700">복원 (Downconversion)</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            수신기에서 동일한 <InlineMath math="f_c" />로 곱한 뒤 LPF를 거치면 원래 기저대역
            신호를 되찾습니다. 채널의 영향만 남아{' '}
            <InlineMath math="y_b(t) = (h_b * x_b)(t)" />의 관계가 성립합니다.
          </p>
        </div>
      </div>
    </div>
  );
}
