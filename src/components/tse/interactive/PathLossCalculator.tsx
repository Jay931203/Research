'use client';

import { useState, useMemo } from 'react';
import Slider from 'rc-slider';
import PlotlyChart from './PlotlyChart';

export default function PathLossCalculator() {
  const [txPower, setTxPower] = useState(43); // dBm (typical LTE eNodeB)
  const [frequency, setFrequency] = useState(2); // GHz
  const [gainTx, setGainTx] = useState(15); // dBi
  const [gainRx, setGainRx] = useState(0); // dBi

  const results = useMemo(() => {
    const fc = frequency * 1e9;
    const c = 3e8;
    const lambda = c / fc;

    // Free-space path loss vs distance
    const distances: number[] = [];
    const rxPowers: number[] = [];
    const pathLosses: number[] = [];

    for (let d = 10; d <= 10000; d *= 1.05) {
      distances.push(d);
      const plDb = 20 * Math.log10((4 * Math.PI * d) / lambda);
      pathLosses.push(plDb);
      const prDbm = txPower + gainTx + gainRx - plDb;
      rxPowers.push(prDbm);
    }

    // Key distances
    const keyDistances = [100, 500, 1000, 5000];
    const keyResults = keyDistances.map(d => {
      const pl = 20 * Math.log10((4 * Math.PI * d) / lambda);
      const pr = txPower + gainTx + gainRx - pl;
      return { d, pl: pl.toFixed(1), pr: pr.toFixed(1) };
    });

    return { distances, rxPowers, pathLosses, lambda, keyResults };
  }, [txPower, frequency, gainTx, gainRx]);

  return (
    <div className="my-8 p-6 bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200 rounded-xl">
      <h3 className="text-xl font-bold text-cyan-800 mb-4">Free-Space Path Loss Calculator</h3>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-3 rounded-lg">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            송신 전력: <span className="text-cyan-600 font-bold">{txPower} dBm</span>
          </label>
          <Slider min={0} max={50} step={1} value={txPower}
            onChange={(v) => setTxPower(v as number)}
            trackStyle={{ backgroundColor: '#0891b2' }}
            handleStyle={{ borderColor: '#0891b2' }}
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>WiFi (20)</span><span>LTE (43)</span><span>50</span>
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            주파수: <span className="text-cyan-600 font-bold">{frequency} GHz</span>
          </label>
          <Slider min={0.7} max={28} step={0.1} value={frequency}
            onChange={(v) => setFrequency(v as number)}
            trackStyle={{ backgroundColor: '#0891b2' }}
            handleStyle={{ borderColor: '#0891b2' }}
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>LTE (0.7)</span><span>5G (3.5)</span><span>mmW (28)</span>
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Tx 안테나 이득: <span className="text-cyan-600 font-bold">{gainTx} dBi</span>
          </label>
          <Slider min={0} max={30} step={1} value={gainTx}
            onChange={(v) => setGainTx(v as number)}
            trackStyle={{ backgroundColor: '#0891b2' }}
            handleStyle={{ borderColor: '#0891b2' }}
          />
        </div>

        <div className="bg-white p-3 rounded-lg">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Rx 안테나 이득: <span className="text-cyan-600 font-bold">{gainRx} dBi</span>
          </label>
          <Slider min={-5} max={15} step={1} value={gainRx}
            onChange={(v) => setGainRx(v as number)}
            trackStyle={{ backgroundColor: '#0891b2' }}
            handleStyle={{ borderColor: '#0891b2' }}
          />
        </div>
      </div>

      {/* Key distance results */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {results.keyResults.map(r => (
          <div key={r.d} className="bg-white p-2 rounded-lg text-center shadow-sm">
            <div className="text-xs text-gray-500">{r.d >= 1000 ? `${r.d/1000} km` : `${r.d} m`}</div>
            <div className={`text-lg font-bold ${parseFloat(r.pr) > -80 ? 'text-green-600' : parseFloat(r.pr) > -100 ? 'text-amber-600' : 'text-red-600'}`}>
              {r.pr} dBm
            </div>
            <div className="text-xs text-gray-400">PL: {r.pl} dB</div>
          </div>
        ))}
      </div>

      <div className="text-xs text-center text-gray-500 mb-2">
        파장: {(results.lambda * 100).toFixed(2)} cm |
        색상: <span className="text-green-600 font-medium">&gt;-80 dBm</span> (양호) /
        <span className="text-amber-600 font-medium">-80~-100</span> (약함) /
        <span className="text-red-600 font-medium">&lt;-100</span> (통신 불가)
      </div>

      <PlotlyChart
        data={[{
          x: results.distances,
          y: results.rxPowers,
          type: 'scatter',
          mode: 'lines',
          line: { color: '#0891b2', width: 2.5 },
          name: 'Received Power',
        }, {
          x: [10, 10000],
          y: [-80, -80],
          type: 'scatter',
          mode: 'lines',
          line: { color: '#f59e0b', width: 1, dash: 'dash' },
          name: '-80 dBm (약함)',
        }, {
          x: [10, 10000],
          y: [-100, -100],
          type: 'scatter',
          mode: 'lines',
          line: { color: '#ef4444', width: 1, dash: 'dash' },
          name: '-100 dBm (한계)',
        }]}
        layout={{
          title: { text: 'Received Power vs Distance (Free-Space)', font: { size: 14 } },
          xaxis: { title: 'Distance (m)', type: 'log', dtick: 1 },
          yaxis: { title: 'Received Power (dBm)', range: [-140, 20] },
          height: 340,
          margin: { t: 70, b: 50, l: 60, r: 20 },
          legend: { orientation: 'h' as const, x: 0.5, xanchor: 'center' as const, y: 1.15 },
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'rgba(255,255,255,0.8)',
        }}
        config={{ responsive: true, displayModeBar: false }}
        style={{ width: '100%' }}
      />
    </div>
  );
}
