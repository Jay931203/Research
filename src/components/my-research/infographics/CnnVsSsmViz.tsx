'use client';

import { useState, useMemo } from 'react';

const N = 16;
const L = 3;
const ALPHA = 0.3;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function hexLerp(hex1: string, hex2: string, t: number): string {
  const r1 = parseInt(hex1.slice(1, 3), 16);
  const g1 = parseInt(hex1.slice(3, 5), 16);
  const b1 = parseInt(hex1.slice(5, 7), 16);
  const r2 = parseInt(hex2.slice(1, 3), 16);
  const g2 = parseInt(hex2.slice(3, 5), 16);
  const b2 = parseInt(hex2.slice(5, 7), 16);
  const r = Math.round(lerp(r1, r2, t));
  const g = Math.round(lerp(g1, g2, t));
  const b = Math.round(lerp(b1, b2, t));
  return `rgb(${r},${g},${b})`;
}

export default function CnnVsSsmViz() {
  const [position, setPosition] = useState(7);

  const cnnWeights = useMemo(
    () =>
      Array.from({ length: N }, (_, n) => (Math.abs(n - position) <= L ? 1.0 : 0.0)),
    [position]
  );

  const ssmWeights = useMemo(
    () =>
      Array.from({ length: N }, (_, n) =>
        Math.exp(-ALPHA * Math.abs(n - position))
      ),
    [position]
  );

  const boxSize = 28;
  const barMaxH = 60;
  const barW = 16;
  const barGap = 2;
  const svgW = N * (barW + barGap) + 8;
  const svgH = barMaxH + 24;

  function renderSequence(weights: number[], mode: 'cnn' | 'ssm') {
    return (
      <div className="flex gap-0.5 flex-wrap justify-center mb-3">
        {Array.from({ length: N }, (_, n) => {
          const w = weights[n];
          const dist = Math.abs(n - position);
          const isCenter = n === position;
          const inRange = mode === 'cnn' && dist <= L;
          const outRange = mode === 'cnn' && dist > L;

          let bg = '';
          let textCol = '';
          let border = '';

          if (isCenter) {
            bg = 'bg-blue-600';
            textCol = 'text-white';
            border = 'border-blue-400';
          } else if (mode === 'cnn') {
            if (inRange) {
              bg = 'bg-blue-400';
              textCol = 'text-white';
              border = 'border-blue-300';
            } else {
              bg = 'bg-gray-200 dark:bg-gray-700';
              textCol = 'text-gray-400 dark:text-gray-500';
              border = 'border-gray-300 dark:border-gray-600';
            }
          } else {
            // SSM: gradient
            const t = 1 - w;
            const opacity = Math.max(0.1, w);
            bg = '';
            textCol = w > 0.5 ? 'text-white' : 'text-blue-300';
            border = 'border-blue-500/30';
          }

          const ssmStyle =
            mode === 'ssm'
              ? {
                  backgroundColor: `rgba(59,130,246,${Math.max(0.08, w)})`,
                  borderColor: `rgba(59,130,246,${Math.max(0.2, w)})`,
                }
              : {};

          return (
            <div
              key={n}
              title={`n=${n}, w=${w.toFixed(3)}`}
              className={`flex flex-col items-center justify-center border rounded text-xs font-mono transition-all duration-200 ${bg} ${textCol} ${border}`}
              style={{ width: boxSize, height: boxSize, ...ssmStyle }}
            >
              <span className="text-[9px] leading-none">{n}</span>
              {mode === 'cnn' && outRange && (
                <span className="text-[8px] leading-none text-red-400">✗</span>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  function renderBarChart(weights: number[], color: string) {
    return (
      <svg viewBox={`0 0 ${svgW} ${svgH}`} width="100%" height={svgH} className="block">
        <line
          x1={4}
          y1={barMaxH}
          x2={svgW - 4}
          y2={barMaxH}
          stroke="#4b5563"
          strokeWidth={0.5}
        />
        {weights.map((w, n) => {
          const barH = w * barMaxH;
          const x = 4 + n * (barW + barGap);
          const y = barMaxH - barH;
          const isCenter = n === position;
          return (
            <g key={n}>
              <rect
                x={x}
                y={y}
                width={barW}
                height={barH}
                rx={2}
                fill={isCenter ? '#2563eb' : color}
                opacity={Math.max(0.15, w)}
                style={{ transition: 'height 0.2s, y 0.2s' }}
              />
              <text
                x={x + barW / 2}
                y={svgH - 4}
                textAnchor="middle"
                fontSize={7}
                fill="#9ca3af"
              >
                {n}
              </text>
            </g>
          );
        })}
      </svg>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-md w-full">
      <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
        CNN vs SSM 인코딩 비교
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        인코더 위치를 바꿔 각 모델이 시퀀스를 어떻게 바라보는지 비교하세요.
      </p>

      {/* Position slider */}
      <div className="flex items-center gap-3 mb-6">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
          인코더 위치 i
        </label>
        <input
          type="range"
          min={0}
          max={N - 1}
          step={1}
          value={position}
          onChange={(e) => setPosition(parseInt(e.target.value))}
          className="flex-1 accent-blue-500"
        />
        <span className="text-sm font-mono text-blue-600 dark:text-blue-400 w-6 text-right">
          {position}
        </span>
      </div>

      {/* Two-column cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CNN Card */}
        <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base font-bold text-blue-700 dark:text-blue-300">CNN</span>
            <span className="text-xs font-medium bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-full">
              하드 국소성
            </span>
          </div>
          {renderSequence(cnnWeights, 'cnn')}
          <p className="text-xs text-blue-700 dark:text-blue-400 mb-2">
            수용장 반경 L={L}. |n−i|&gt;{L}인 입력은 완전히 무시됨
          </p>
          {renderBarChart(cnnWeights, '#93c5fd')}
          <div className="mt-2 rounded-lg bg-blue-100 dark:bg-blue-900/40 px-3 py-2">
            <p className="text-xs font-mono text-blue-800 dark:text-blue-300">
              E<sub>hard</sub>(L) = O(L<sup>−1</sup>)
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-400 mt-0.5">
              범위 밖은 가중치 = 0 (완전 단절)
            </p>
          </div>
        </div>

        {/* SSM Card */}
        <div className="rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/30 p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base font-bold text-indigo-700 dark:text-indigo-300">SSM</span>
            <span className="text-xs font-medium bg-indigo-200 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200 px-2 py-0.5 rounded-full">
              소프트 메모리
            </span>
          </div>
          {renderSequence(ssmWeights, 'ssm')}
          <p className="text-xs text-indigo-700 dark:text-indigo-400 mb-2">
            지수 감쇠 메모리 w[n] = e<sup>−α|n−i|</sup>, α={ALPHA}. 멀어져도 완전히 사라지지 않음
          </p>
          {renderBarChart(ssmWeights, '#a5b4fc')}
          <div className="mt-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 px-3 py-2">
            <p className="text-xs font-mono text-indigo-800 dark:text-indigo-300">
              E<sub>soft</sub>(L) = O(e<sup>−αL</sup>)
            </p>
            <p className="text-xs text-indigo-700 dark:text-indigo-400 mt-0.5">
              모든 위치에 미약하게라도 영향 (글로벌 컨텍스트)
            </p>
          </div>
        </div>
      </div>

      {/* Comparison note */}
      <div className="mt-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-3">
        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
          <span className="font-semibold text-gray-800 dark:text-gray-200">핵심 차이:</span>{' '}
          CNN은 수용장 밖의 정보를 완전히 차단하여 연산 효율이 높지만 장거리 의존성을 포착할 수 없습니다.
          SSM(상태공간 모델)은 지수 감쇠를 통해 멀리 있는 입력에도 작은 가중치를 부여하여 장거리 의존성을 유지합니다.
        </p>
      </div>
    </div>
  );
}
