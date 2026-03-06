'use client';

import { useState, useMemo, useCallback } from 'react';
import Slider from 'rc-slider';

export default function PhasorVisualizer() {
  const [numPaths, setNumPaths] = useState(4);
  const [phases, setPhases] = useState<number[]>(() =>
    Array.from({ length: 8 }, () => Math.random() * 2 * Math.PI)
  );
  const [amplitudes, setAmplitudes] = useState<number[]>(() =>
    Array.from({ length: 8 }, () => 0.5 + Math.random() * 0.5)
  );

  const randomize = useCallback(() => {
    setPhases(Array.from({ length: 8 }, () => Math.random() * 2 * Math.PI));
    setAmplitudes(Array.from({ length: 8 }, () => 0.3 + Math.random() * 0.7));
  }, []);

  const alignAll = useCallback(() => {
    setPhases(Array.from({ length: 8 }, () => 0));
    setAmplitudes(Array.from({ length: 8 }, () => 0.8));
  }, []);

  const opposeAll = useCallback(() => {
    setPhases(Array.from({ length: 8 }, (_, i) => (i % 2 === 0 ? 0 : Math.PI)));
    setAmplitudes(Array.from({ length: 8 }, () => 0.8));
  }, []);

  const result = useMemo(() => {
    let sumReal = 0;
    let sumImag = 0;
    const pathVectors: { x: number; y: number; endX: number; endY: number; amp: number; phase: number }[] = [];
    let cumX = 0;
    let cumY = 0;

    for (let i = 0; i < numPaths; i++) {
      const a = amplitudes[i];
      const phi = phases[i];
      const dx = a * Math.cos(phi);
      const dy = a * Math.sin(phi);
      pathVectors.push({ x: cumX, y: cumY, endX: cumX + dx, endY: cumY + dy, amp: a, phase: phi });
      cumX += dx;
      cumY += dy;
      sumReal += dx;
      sumImag += dy;
    }

    const magnitude = Math.sqrt(sumReal ** 2 + sumImag ** 2);
    const maxPossible = amplitudes.slice(0, numPaths).reduce((s, a) => s + a, 0);
    const ratio = maxPossible > 0 ? magnitude / maxPossible : 0;

    return { sumReal, sumImag, magnitude, maxPossible, ratio, pathVectors };
  }, [numPaths, phases, amplitudes]);

  // SVG rendering
  const svgSize = 300;
  const center = svgSize / 2;
  const scale = 80; // pixels per unit

  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

  return (
    <div className="my-8 p-6 bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200 rounded-xl">
      <h3 className="text-xl font-bold text-violet-800 mb-2">Phasor Addition Visualizer</h3>
      <p className="text-sm text-gray-600 mb-4">
        각 경로의 위상벡터(phasor)가 합쳐지는 과정을 관찰하세요.
        위상이 같으면 <strong>보강 간섭</strong>, 반대면 <strong>상쇄 간섭</strong> (Deep Fade)이 발생합니다.
      </p>

      <div className="flex flex-wrap gap-3 mb-4">
        <button onClick={randomize}
          className="px-3 py-1.5 bg-violet-600 text-white rounded-lg text-sm hover:bg-violet-700 transition">
          Random Phases
        </button>
        <button onClick={alignAll}
          className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition">
          Constructive (All Aligned)
        </button>
        <button onClick={opposeAll}
          className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition">
          Destructive (Opposing)
        </button>
      </div>

      <div className="mb-4 bg-white p-3 rounded-lg">
        <label className="block text-xs font-medium text-gray-600 mb-1">
          경로 수: <span className="text-violet-600 font-bold">{numPaths}</span>
        </label>
        <Slider min={2} max={8} step={1} value={numPaths}
          onChange={(v) => setNumPaths(v as number)}
          trackStyle={{ backgroundColor: '#7c3aed' }}
          handleStyle={{ borderColor: '#7c3aed' }}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* SVG Phasor Diagram */}
        <div className="bg-white rounded-xl p-4 flex justify-center">
          <svg width={svgSize} height={svgSize} className="overflow-visible">
            {/* Grid */}
            <circle cx={center} cy={center} r={scale} fill="none" stroke="#e2e8f0" strokeWidth={1} />
            <circle cx={center} cy={center} r={scale * 2} fill="none" stroke="#e2e8f0" strokeWidth={1} />
            <line x1={0} y1={center} x2={svgSize} y2={center} stroke="#e2e8f0" strokeWidth={1} />
            <line x1={center} y1={0} x2={center} y2={svgSize} stroke="#e2e8f0" strokeWidth={1} />

            {/* Individual phasors from origin (thin, dashed) */}
            {result.pathVectors.map((p, i) => {
              const dx = amplitudes[i] * Math.cos(phases[i]) * scale;
              const dy = -amplitudes[i] * Math.sin(phases[i]) * scale;
              return (
                <line key={`orig-${i}`}
                  x1={center} y1={center}
                  x2={center + dx} y2={center + dy}
                  stroke={colors[i]} strokeWidth={1.5} strokeDasharray="4,3" opacity={0.4}
                />
              );
            })}

            {/* Chain of phasors (head-to-tail) */}
            {result.pathVectors.map((p, i) => (
              <g key={`chain-${i}`}>
                <line
                  x1={center + p.x * scale} y1={center - p.y * scale}
                  x2={center + p.endX * scale} y2={center - p.endY * scale}
                  stroke={colors[i]} strokeWidth={2.5} strokeLinecap="round"
                />
                <circle
                  cx={center + p.endX * scale} cy={center - p.endY * scale}
                  r={3} fill={colors[i]}
                />
              </g>
            ))}

            {/* Resultant vector */}
            <line
              x1={center} y1={center}
              x2={center + result.sumReal * scale} y2={center - result.sumImag * scale}
              stroke="#1f2937" strokeWidth={3} strokeLinecap="round"
              markerEnd="url(#arrowhead)"
            />
            <defs>
              <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#1f2937" />
              </marker>
            </defs>

            {/* Labels */}
            <text x={center + result.sumReal * scale + 8} y={center - result.sumImag * scale}
              fontSize={12} fontWeight="bold" fill="#1f2937">
              |h| = {result.magnitude.toFixed(2)}
            </text>
          </svg>
        </div>

        {/* Results & Info */}
        <div className="space-y-3">
          {/* Magnitude indicator */}
          <div className={`p-4 rounded-xl border-2 ${
            result.ratio > 0.7 ? 'border-green-400 bg-green-50' :
            result.ratio > 0.3 ? 'border-amber-400 bg-amber-50' :
            'border-red-400 bg-red-50'
          }`}>
            <div className="text-sm font-medium text-gray-700 mb-1">합성 신호 크기</div>
            <div className="text-3xl font-bold mb-1">
              {result.magnitude.toFixed(3)}
            </div>
            <div className="text-xs text-gray-500">
              최대 가능: {result.maxPossible.toFixed(2)} | 비율: {(result.ratio * 100).toFixed(0)}%
            </div>
            <div className="mt-2 h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  result.ratio > 0.7 ? 'bg-green-500' :
                  result.ratio > 0.3 ? 'bg-amber-500' : 'bg-red-500'
                }`}
                style={{ width: `${result.ratio * 100}%` }}
              />
            </div>
            <div className="text-sm font-semibold mt-2">
              {result.ratio > 0.7 ? 'Constructive Interference' :
               result.ratio > 0.3 ? 'Partial Interference' :
               'Destructive Interference (Deep Fade)'}
            </div>
          </div>

          {/* Power in dB */}
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <div className="text-xs text-gray-500">수신 전력 (정규화)</div>
            <div className="text-xl font-bold text-gray-800">
              {result.magnitude > 0.001
                ? `${(20 * Math.log10(result.magnitude)).toFixed(1)} dB`
                : '-∞ dB'}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              = 20 log₁₀(|h|)
            </div>
          </div>

          {/* Path legend */}
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <div className="text-xs text-gray-500 mb-2">경로별 위상</div>
            <div className="grid grid-cols-4 gap-1">
              {Array.from({ length: numPaths }).map((_, i) => (
                <div key={i} className="text-center text-xs">
                  <div className="w-3 h-3 rounded-full mx-auto mb-0.5" style={{ backgroundColor: colors[i] }} />
                  <div className="font-mono">{(phases[i] * 180 / Math.PI).toFixed(0)}&deg;</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
