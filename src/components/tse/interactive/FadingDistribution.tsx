'use client';

import { useState, useMemo } from 'react';
import Slider from 'rc-slider';
import PlotlyChart from './PlotlyChart';

// Approximation of I0 (Modified Bessel function of first kind, order 0)
function besselI0(x: number): number {
  let sum = 1;
  let term = 1;
  for (let k = 1; k <= 25; k++) {
    term *= (x * x) / (4 * k * k);
    sum += term;
  }
  return sum;
}

export default function FadingDistribution() {
  const [sigma, setSigma] = useState(1);
  const [kFactor, setKFactor] = useState(3); // dB

  const data = useMemo(() => {
    const kLinear = Math.pow(10, kFactor / 10);
    const A = Math.sqrt(2 * sigma * sigma * kLinear);
    const rMax = 5 * sigma;
    const r: number[] = [];
    const rayleighPdf: number[] = [];
    const ricianPdf: number[] = [];
    const rayleighCdf: number[] = [];
    const ricianCdf: number[] = [];

    let ricianCdfAccum = 0;
    const dr = rMax / 300;

    for (let i = 0; i <= 300; i++) {
      const ri = (i / 300) * rMax;
      r.push(ri);

      // Rayleigh PDF
      const rayPdf = ri > 0 ? (ri / (sigma * sigma)) * Math.exp(-ri * ri / (2 * sigma * sigma)) : 0;
      rayleighPdf.push(rayPdf);

      // Rayleigh CDF
      rayleighCdf.push(ri > 0 ? 1 - Math.exp(-ri * ri / (2 * sigma * sigma)) : 0);

      // Rician PDF
      const ricPdf = ri > 0
        ? (ri / (sigma * sigma)) * Math.exp(-(ri * ri + A * A) / (2 * sigma * sigma)) * besselI0(ri * A / (sigma * sigma))
        : 0;
      ricianPdf.push(ricPdf);

      // Rician CDF (numerical integration)
      ricianCdfAccum += ricPdf * dr;
      ricianCdf.push(ricianCdfAccum);
    }

    // Outage probability calculation
    const threshold = 0.5 * sigma;
    const rayleighOutage = 1 - Math.exp(-threshold * threshold / (2 * sigma * sigma));

    return { r, rayleighPdf, ricianPdf, rayleighCdf, ricianCdf, A, kLinear, rayleighOutage, threshold };
  }, [sigma, kFactor]);

  return (
    <div className="my-8 p-6 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl">
      <h3 className="text-xl font-bold text-purple-800 mb-4">Rayleigh vs Rician Fading Distribution</h3>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            σ (Scatter power): <span className="text-purple-600 font-bold">{sigma.toFixed(1)}</span>
          </label>
          <Slider
            min={0.3}
            max={3}
            step={0.1}
            value={sigma}
            onChange={(v) => setSigma(v as number)}
            trackStyle={{ backgroundColor: '#7c3aed' }}
            handleStyle={{ borderColor: '#7c3aed' }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rician K-factor: <span className="text-purple-600 font-bold">{kFactor} dB</span> (K = {Math.pow(10, kFactor / 10).toFixed(1)})
          </label>
          <Slider
            min={-10}
            max={20}
            step={1}
            value={kFactor}
            onChange={(v) => setKFactor(v as number)}
            trackStyle={{ backgroundColor: '#7c3aed' }}
            handleStyle={{ borderColor: '#7c3aed' }}
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>≈Rayleigh</span>
            <span>Typical</span>
            <span>Strong LOS</span>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white p-3 rounded-lg shadow-sm text-center">
          <div className="text-xs text-gray-500">Rayleigh Mean</div>
          <div className="text-lg font-bold text-blue-600">{(sigma * Math.sqrt(Math.PI / 2)).toFixed(2)}</div>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm text-center">
          <div className="text-xs text-gray-500">LOS Amplitude (A)</div>
          <div className="text-lg font-bold text-red-600">{data.A.toFixed(2)}</div>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm text-center">
          <div className="text-xs text-gray-500">Rayleigh Outage (r &lt; 0.5σ)</div>
          <div className="text-lg font-bold text-orange-600">{(data.rayleighOutage * 100).toFixed(1)}%</div>
        </div>
      </div>

      {/* PDF Plot */}
      <PlotlyChart
        data={[
          {
            x: data.r,
            y: data.rayleighPdf,
            type: 'scatter',
            mode: 'lines',
            name: 'Rayleigh PDF',
            line: { color: '#3b82f6', width: 2.5 },
          },
          {
            x: data.r,
            y: data.ricianPdf,
            type: 'scatter',
            mode: 'lines',
            name: `Rician PDF (K=${kFactor}dB)`,
            line: { color: '#ef4444', width: 2.5 },
          },
        ]}
        layout={{
          title: { text: 'Probability Density Function (PDF)', font: { size: 14 } },
          xaxis: { title: 'Amplitude (r)' },
          yaxis: { title: 'f(r)' },
          height: 300,
          margin: { t: 40, b: 50, l: 60, r: 20 },
          legend: { x: 0.6, y: 0.95 },
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'rgba(255,255,255,0.8)',
        }}
        config={{ responsive: true, displayModeBar: false }}
        style={{ width: '100%' }}
      />

      {/* CDF Plot */}
      <PlotlyChart
        data={[
          {
            x: data.r,
            y: data.rayleighCdf,
            type: 'scatter',
            mode: 'lines',
            name: 'Rayleigh CDF',
            line: { color: '#3b82f6', width: 2 },
          },
          {
            x: data.r,
            y: data.ricianCdf,
            type: 'scatter',
            mode: 'lines',
            name: `Rician CDF (K=${kFactor}dB)`,
            line: { color: '#ef4444', width: 2 },
          },
        ]}
        layout={{
          title: { text: 'Cumulative Distribution Function (CDF) - Outage Probability', font: { size: 14 } },
          xaxis: { title: 'Threshold (r)' },
          yaxis: { title: 'P(R ≤ r)' },
          height: 300,
          margin: { t: 40, b: 50, l: 60, r: 20 },
          legend: { x: 0.6, y: 0.3 },
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'rgba(255,255,255,0.8)',
        }}
        config={{ responsive: true, displayModeBar: false }}
        style={{ width: '100%' }}
      />
    </div>
  );
}
