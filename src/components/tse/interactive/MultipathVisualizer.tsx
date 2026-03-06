'use client';

import { useState, useMemo } from 'react';
import Slider from 'rc-slider';
import PlotlyChart from './PlotlyChart';

export default function MultipathVisualizer() {
  const [numPaths, setNumPaths] = useState(4);
  const [maxDelay, setMaxDelay] = useState(5); // μs

  const data = useMemo(() => {
    // Generate deterministic paths
    const paths = [];
    for (let i = 0; i < numPaths; i++) {
      const delay = i === 0 ? 0 : (maxDelay * (i / (numPaths - 1 || 1)));
      const power = Math.pow(10, -(i * 3) / 10); // 3dB decay per path
      const phase = (i * 137.5) % 360; // Golden angle spacing
      paths.push({ delay, power, phase, powerDb: -i * 3 });
    }

    // Power delay profile
    const delays = paths.map(p => p.delay);
    const powers = paths.map(p => p.powerDb);

    // RMS delay spread calculation
    const totalPower = paths.reduce((s, p) => s + p.power, 0);
    const meanDelay = paths.reduce((s, p) => s + p.power * p.delay, 0) / totalPower;
    const meanDelaySq = paths.reduce((s, p) => s + p.power * p.delay * p.delay, 0) / totalPower;
    const rmsDelaySpread = Math.sqrt(meanDelaySq - meanDelay * meanDelay);
    const coherenceBw = rmsDelaySpread > 0 ? 1 / (5 * rmsDelaySpread * 1e-6) : Infinity;

    // Channel frequency response
    const freqs: number[] = [];
    const freqResponse: number[] = [];
    const numFreqs = 500;
    const maxFreq = 10e6; // 10 MHz

    for (let i = 0; i < numFreqs; i++) {
      const f = (i / numFreqs) * maxFreq;
      freqs.push(f / 1e6); // MHz

      let re = 0, im = 0;
      for (const path of paths) {
        const phaseShift = 2 * Math.PI * f * path.delay * 1e-6 + (path.phase * Math.PI / 180);
        re += Math.sqrt(path.power) * Math.cos(phaseShift);
        im += Math.sqrt(path.power) * Math.sin(phaseShift);
      }
      freqResponse.push(20 * Math.log10(Math.sqrt(re * re + im * im) + 1e-10));
    }

    return { paths, delays, powers, rmsDelaySpread, coherenceBw, freqs, freqResponse, meanDelay };
  }, [numPaths, maxDelay]);

  return (
    <div className="my-8 p-6 bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200 rounded-xl">
      <h3 className="text-xl font-bold text-cyan-800 mb-4">Multipath Channel Visualizer</h3>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            경로 수: <span className="text-cyan-600 font-bold">{numPaths}</span>
          </label>
          <Slider
            min={2} max={10} value={numPaths}
            onChange={(v) => setNumPaths(v as number)}
            trackStyle={{ backgroundColor: '#0891b2' }}
            handleStyle={{ borderColor: '#0891b2' }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            최대 지연: <span className="text-cyan-600 font-bold">{maxDelay} μs</span>
          </label>
          <Slider
            min={0.1} max={20} step={0.1} value={maxDelay}
            onChange={(v) => setMaxDelay(v as number)}
            trackStyle={{ backgroundColor: '#0891b2' }}
            handleStyle={{ borderColor: '#0891b2' }}
          />
        </div>
      </div>

      {/* Key Parameters */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white p-3 rounded-lg shadow-sm text-center">
          <div className="text-xs text-gray-500">RMS Delay Spread</div>
          <div className="text-lg font-bold text-cyan-600">{data.rmsDelaySpread.toFixed(2)} μs</div>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm text-center">
          <div className="text-xs text-gray-500">Mean Delay</div>
          <div className="text-lg font-bold text-blue-600">{data.meanDelay.toFixed(2)} μs</div>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm text-center">
          <div className="text-xs text-gray-500">Coherence BW</div>
          <div className="text-lg font-bold text-green-600">
            {data.coherenceBw < 1e9 ? `${(data.coherenceBw / 1e3).toFixed(0)} kHz` : '∞'}
          </div>
        </div>
      </div>

      {/* Power Delay Profile */}
      <PlotlyChart
        data={[{
          x: data.delays,
          y: data.powers,
          type: 'bar',
          name: 'Path Power',
          marker: { color: data.delays.map((_, i) => `hsl(${190 + i * 20}, 70%, 50%)`) },
          width: 0.15,
        }]}
        layout={{
          title: { text: 'Power Delay Profile', font: { size: 14 } },
          xaxis: { title: 'Delay (μs)' },
          yaxis: { title: 'Power (dB)' },
          height: 250,
          margin: { t: 40, b: 50, l: 60, r: 20 },
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'rgba(255,255,255,0.8)',
        }}
        config={{ responsive: true, displayModeBar: false }}
        style={{ width: '100%' }}
      />

      {/* Frequency Response */}
      <PlotlyChart
        data={[{
          x: data.freqs,
          y: data.freqResponse,
          type: 'scatter',
          mode: 'lines',
          name: '|H(f)|',
          line: { color: '#0891b2', width: 1.5 },
        }]}
        layout={{
          title: { text: 'Channel Frequency Response |H(f)|', font: { size: 14 } },
          xaxis: { title: 'Frequency (MHz)' },
          yaxis: { title: 'Gain (dB)' },
          height: 250,
          margin: { t: 40, b: 50, l: 60, r: 20 },
          shapes: data.coherenceBw < 1e9 ? [{
            type: 'rect',
            x0: 0, x1: data.coherenceBw / 1e6,
            y0: -50, y1: 10,
            fillcolor: 'rgba(16, 185, 129, 0.1)',
            line: { color: '#10b981', width: 1, dash: 'dash' },
          }] : [],
          annotations: data.coherenceBw < 1e9 ? [{
            x: Math.min(data.coherenceBw / 1e6, 5),
            y: 5,
            text: `B_c ≈ ${(data.coherenceBw / 1e3).toFixed(0)} kHz`,
            showarrow: true,
            arrowhead: 2,
            font: { size: 10, color: '#10b981' },
          }] : [],
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'rgba(255,255,255,0.8)',
        }}
        config={{ responsive: true, displayModeBar: false }}
        style={{ width: '100%' }}
      />
    </div>
  );
}
