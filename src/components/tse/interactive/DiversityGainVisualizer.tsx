'use client';

import { useState, useMemo } from 'react';
import Slider from 'rc-slider';
import PlotlyChart from './PlotlyChart';

// Regularized incomplete gamma function P(a, x) = γ(a,x)/Γ(a)
// For integer a (our case), P(L, x) = 1 - e^{-x} * Σ_{k=0}^{L-1} x^k/k!
function outageProb(snrThLinear: number, snrAvgLinear: number, L: number): number {
  if (snrAvgLinear <= 0) return 1;
  const x = snrThLinear / snrAvgLinear;
  if (x > 100) return 1;

  let sum = 0;
  let term = 1; // x^0 / 0!
  for (let k = 0; k < L; k++) {
    if (k > 0) term *= x / k;
    sum += term;
  }
  return 1 - Math.exp(-x) * sum;
}

export default function DiversityGainVisualizer() {
  const [targetRate, setTargetRate] = useState(2); // bits/s/Hz
  const [numBranches, setNumBranches] = useState(4);

  const plotData = useMemo(() => {
    const snrRange: number[] = [];
    const branchCounts = [1, 2, numBranches];
    const curves: { snr: number[]; pout: number[] }[] = branchCounts.map(() => ({ snr: [], pout: [] }));

    const gammaThLinear = Math.pow(2, targetRate) - 1;

    for (let snrDb = 0; snrDb <= 30; snrDb += 0.5) {
      const snrLinear = Math.pow(10, snrDb / 10);
      snrRange.push(snrDb);

      branchCounts.forEach((L, idx) => {
        const pout = outageProb(gammaThLinear, snrLinear, L);
        curves[idx].snr.push(snrDb);
        curves[idx].pout.push(Math.max(pout, 1e-8));
      });
    }

    return { snrRange, curves, branchCounts, gammaThLinear };
  }, [targetRate, numBranches]);

  // Compute specific results at SNR=15dB
  const resultsAt15 = useMemo(() => {
    const snrLinear = Math.pow(10, 1.5); // 15 dB
    const gammaThLinear = Math.pow(2, targetRate) - 1;
    return [1, 2, numBranches].map(L => ({
      L,
      pout: outageProb(gammaThLinear, snrLinear, L),
      capacityOut: 20 * Math.log2(1 - snrLinear * Math.log(1 - Math.max(0.001, 1 - outageProb(gammaThLinear, snrLinear, L)))),
    }));
  }, [targetRate, numBranches]);

  const colors = ['#ef4444', '#f59e0b', '#10b981'];
  const names = ['L=1 (No diversity)', 'L=2', `L=${numBranches}`];

  return (
    <div className="my-8 p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl">
      <h3 className="text-xl font-bold text-emerald-800 mb-2">Diversity Gain Visualizer</h3>
      <p className="text-sm text-gray-600 mb-4">
        독립 Rayleigh 채널 L개를 MRC (Maximal Ratio Combining)로 결합할 때 outage 확률이 어떻게 감소하는지 확인하세요.
      </p>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-3 rounded-lg">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            목표 전송률: <span className="text-emerald-600 font-bold">{targetRate} bits/s/Hz</span>
          </label>
          <Slider min={0.5} max={6} step={0.5} value={targetRate}
            onChange={(v) => setTargetRate(v as number)}
            trackStyle={{ backgroundColor: '#059669' }}
            handleStyle={{ borderColor: '#059669' }}
          />
          <div className="text-xs text-gray-400 mt-1">
            필요 SNR threshold: {(10 * Math.log10(plotData.gammaThLinear)).toFixed(1)} dB
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Diversity 브랜치 수 (L): <span className="text-emerald-600 font-bold">{numBranches}</span>
          </label>
          <Slider min={2} max={8} step={1} value={numBranches}
            onChange={(v) => setNumBranches(v as number)}
            trackStyle={{ backgroundColor: '#059669' }}
            handleStyle={{ borderColor: '#059669' }}
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>2 (SIMO)</span><span>4 (2x2 MIMO)</span><span>8 (4x2 MIMO)</span>
          </div>
        </div>
      </div>

      {/* Results at SNR=15dB */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {resultsAt15.map((r, i) => (
          <div key={r.L} className="bg-white p-3 rounded-lg shadow-sm text-center" style={{ borderLeft: `4px solid ${colors[i]}` }}>
            <div className="text-xs text-gray-500">L={r.L} @ SNR=15dB</div>
            <div className="text-lg font-bold" style={{ color: colors[i] }}>
              {r.pout < 0.001 ? r.pout.toExponential(1) : (r.pout * 100).toFixed(2) + '%'}
            </div>
            <div className="text-xs text-gray-400">Outage Probability</div>
          </div>
        ))}
      </div>

      <PlotlyChart
        data={plotData.curves.map((curve, i) => ({
          x: curve.snr,
          y: curve.pout,
          type: 'scatter',
          mode: 'lines',
          name: names[i],
          line: { color: colors[i], width: 2.5, dash: i === 0 ? 'solid' : undefined },
        }))}
        layout={{
          title: { text: `Outage Probability vs SNR (R = ${targetRate} bits/s/Hz)`, font: { size: 14 } },
          xaxis: { title: 'Average SNR (dB)' },
          yaxis: {
            title: 'Outage Probability',
            type: 'log',
            range: [-5, 0],
            dtick: 1,
          },
          height: 350,
          margin: { t: 40, b: 50, l: 60, r: 20 },
          legend: { x: 0.6, y: 0.98 },
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'rgba(255,255,255,0.8)',
          shapes: [{
            type: 'line', x0: 0, x1: 30, y0: 0.01, y1: 0.01,
            line: { color: '#6b7280', width: 1, dash: 'dot' },
          }],
          annotations: [{
            x: 2, y: Math.log10(0.01), text: '1% target',
            showarrow: false, font: { size: 10, color: '#6b7280' },
          }],
        }}
        config={{ responsive: true, displayModeBar: false }}
        style={{ width: '100%' }}
      />

      <div className="mt-4 p-3 bg-white rounded-lg border border-emerald-200 text-sm text-gray-700">
        <strong>핵심:</strong> Diversity order L이 증가하면 outage 곡선의 <strong>기울기</strong>가 가팔라집니다
        (slope &asymp; -L on log scale). L=1에서 L={numBranches}로 늘리면 같은 outage 확률을 달성하는 데 필요한 SNR이{' '}
        <strong>수십 dB 감소</strong>합니다.
      </div>
    </div>
  );
}
