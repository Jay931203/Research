'use client';

import { useState, useMemo } from 'react';
import Slider from 'rc-slider';
import PlotlyChart from './PlotlyChart';

// Numerical integration of ergodic capacity for Rayleigh fading
function ergodicCapacityRayleigh(snrAvgLinear: number, bandwidth: number): number {
  const N = 1000;
  const gammaMax = snrAvgLinear * 10;
  const dg = gammaMax / N;
  let capacity = 0;

  for (let i = 1; i <= N; i++) {
    const gamma = i * dg;
    const pdf = (1 / snrAvgLinear) * Math.exp(-gamma / snrAvgLinear);
    capacity += Math.log2(1 + gamma) * pdf * dg;
  }

  return capacity * bandwidth;
}

// Outage capacity for Rayleigh fading
function outageCapacityRayleigh(snrAvgLinear: number, bandwidth: number, epsilon: number): number {
  return bandwidth * Math.log2(1 - snrAvgLinear * Math.log(1 - epsilon));
}

export default function CapacityComparison() {
  const [snrDb, setSnrDb] = useState(15);
  const [bandwidth, setBandwidth] = useState(20); // MHz
  const [outageProb, setOutageProb] = useState(1); // percent

  const plotData = useMemo(() => {
    const snrRange: number[] = [];
    const awgnCap: number[] = [];
    const ergodicCap: number[] = [];
    const outageCap1: number[] = [];
    const outageCap10: number[] = [];

    for (let snr = 0; snr <= 30; snr += 0.5) {
      const snrLinear = Math.pow(10, snr / 10);
      snrRange.push(snr);
      awgnCap.push(Math.log2(1 + snrLinear));

      // Ergodic capacity (normalized by bandwidth)
      const erg = ergodicCapacityRayleigh(snrLinear, 1);
      ergodicCap.push(erg);

      // Outage capacities
      const oc1 = Math.max(0, Math.log2(1 - snrLinear * Math.log(1 - 0.01)));
      const oc10 = Math.max(0, Math.log2(1 - snrLinear * Math.log(1 - 0.10)));
      outageCap1.push(oc1);
      outageCap10.push(oc10);
    }

    return { snrRange, awgnCap, ergodicCap, outageCap1, outageCap10 };
  }, []);

  const results = useMemo(() => {
    const snrLinear = Math.pow(10, snrDb / 10);
    const bw = bandwidth * 1e6;
    const eps = outageProb / 100;

    const awgn = bw * Math.log2(1 + snrLinear) / 1e6;
    const ergodic = ergodicCapacityRayleigh(snrLinear, bw) / 1e6;
    const outage = Math.max(0, bw * Math.log2(1 - snrLinear * Math.log(1 - eps))) / 1e6;

    return { awgn, ergodic, outage };
  }, [snrDb, bandwidth, outageProb]);

  return (
    <div className="my-8 p-6 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl">
      <h3 className="text-xl font-bold text-green-800 mb-4">Channel Capacity: AWGN vs Fading</h3>

      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            평균 SNR: <span className="text-green-600 font-bold">{snrDb} dB</span>
          </label>
          <Slider
            min={0}
            max={30}
            step={1}
            value={snrDb}
            onChange={(v) => setSnrDb(v as number)}
            trackStyle={{ backgroundColor: '#059669' }}
            handleStyle={{ borderColor: '#059669' }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            대역폭: <span className="text-green-600 font-bold">{bandwidth} MHz</span>
          </label>
          <Slider
            min={1}
            max={100}
            step={1}
            value={bandwidth}
            onChange={(v) => setBandwidth(v as number)}
            trackStyle={{ backgroundColor: '#059669' }}
            handleStyle={{ borderColor: '#059669' }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Outage 확률: <span className="text-green-600 font-bold">{outageProb}%</span>
          </label>
          <Slider
            min={1}
            max={20}
            step={1}
            value={outageProb}
            onChange={(v) => setOutageProb(v as number)}
            trackStyle={{ backgroundColor: '#059669' }}
            handleStyle={{ borderColor: '#059669' }}
          />
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm text-center">
          <div className="text-xs text-gray-500">AWGN Capacity</div>
          <div className="text-2xl font-bold text-blue-600">{results.awgn.toFixed(1)}</div>
          <div className="text-xs text-gray-400">Mbps</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm text-center">
          <div className="text-xs text-gray-500">Ergodic Capacity</div>
          <div className="text-2xl font-bold text-green-600">{results.ergodic.toFixed(1)}</div>
          <div className="text-xs text-gray-400">Mbps</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm text-center">
          <div className="text-xs text-gray-500">{outageProb}%-Outage Capacity</div>
          <div className="text-2xl font-bold text-orange-600">{results.outage.toFixed(1)}</div>
          <div className="text-xs text-gray-400">Mbps</div>
        </div>
      </div>

      {/* Capacity vs SNR Plot */}
      <PlotlyChart
        data={[
          {
            x: plotData.snrRange,
            y: plotData.awgnCap,
            type: 'scatter',
            mode: 'lines',
            name: 'AWGN',
            line: { color: '#3b82f6', width: 2.5 },
          },
          {
            x: plotData.snrRange,
            y: plotData.ergodicCap,
            type: 'scatter',
            mode: 'lines',
            name: 'Ergodic (Rayleigh)',
            line: { color: '#059669', width: 2.5 },
          },
          {
            x: plotData.snrRange,
            y: plotData.outageCap1,
            type: 'scatter',
            mode: 'lines',
            name: '1%-Outage',
            line: { color: '#f97316', width: 2, dash: 'dash' },
          },
          {
            x: plotData.snrRange,
            y: plotData.outageCap10,
            type: 'scatter',
            mode: 'lines',
            name: '10%-Outage',
            line: { color: '#ef4444', width: 2, dash: 'dot' },
          },
          {
            x: [snrDb],
            y: [Math.log2(1 + Math.pow(10, snrDb / 10))],
            type: 'scatter',
            mode: 'markers',
            name: 'Current SNR',
            marker: { color: '#1f2937', size: 12, symbol: 'diamond' },
            showlegend: false,
          },
        ]}
        layout={{
          title: { text: 'Capacity vs SNR (bits/s/Hz)', font: { size: 14 } },
          xaxis: { title: 'Average SNR (dB)' },
          yaxis: { title: 'Spectral Efficiency (bits/s/Hz)' },
          height: 350,
          margin: { t: 40, b: 50, l: 60, r: 20 },
          legend: { x: 0.02, y: 0.98 },
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'rgba(255,255,255,0.8)',
        }}
        config={{ responsive: true, displayModeBar: false }}
        style={{ width: '100%' }}
      />
    </div>
  );
}
