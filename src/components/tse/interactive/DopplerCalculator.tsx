'use client';

import { useState, useMemo } from 'react';
import Slider from 'rc-slider';
import PlotlyChart from './PlotlyChart';

export default function DopplerCalculator() {
  const [speed, setSpeed] = useState(100); // km/h
  const [frequency, setFrequency] = useState(2); // GHz

  const results = useMemo(() => {
    const v = speed / 3.6; // m/s
    const fc = frequency * 1e9; // Hz
    const c = 3e8; // m/s
    const lambda = c / fc;
    const fdMax = (v * fc) / c;
    const dopplerSpread = 2 * fdMax;
    const coherenceTime = 1 / dopplerSpread;

    // Doppler spectrum (Jakes/Clarke) - clamped to avoid singularity at ±fd
    const freqs: number[] = [];
    const spectrum: number[] = [];
    const nPoints = 300;
    const step = (fdMax * 2.4) / nPoints;
    for (let f = -fdMax * 1.2; f <= fdMax * 1.2; f += step) {
      freqs.push(f);
      const ratio = f / fdMax;
      if (Math.abs(ratio) < 0.98) {
        spectrum.push(1 / (Math.PI * fdMax * Math.sqrt(1 - ratio * ratio)));
      } else if (Math.abs(ratio) < 1.0) {
        // Clamp near singularity to keep plot readable
        spectrum.push(1 / (Math.PI * fdMax * Math.sqrt(1 - 0.98 * 0.98)));
      } else {
        spectrum.push(0);
      }
    }

    return { v, fc, lambda, fdMax, dopplerSpread, coherenceTime, freqs, spectrum };
  }, [speed, frequency]);

  return (
    <div className="my-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
      <h3 className="text-xl font-bold text-blue-800 mb-4">Doppler Effect Interactive Calculator</h3>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            이동 속도: <span className="text-blue-600 font-bold">{speed} km/h</span> ({(speed / 3.6).toFixed(1)} m/s)
          </label>
          <Slider
            min={1}
            max={500}
            value={speed}
            onChange={(v) => setSpeed(v as number)}
            trackStyle={{ backgroundColor: '#3b82f6' }}
            handleStyle={{ borderColor: '#3b82f6' }}
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>보행 (5)</span>
            <span>차량 (100)</span>
            <span>KTX (300)</span>
            <span>비행기 (500)</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            반송파 주파수: <span className="text-blue-600 font-bold">{frequency} GHz</span>
          </label>
          <Slider
            min={0.7}
            max={28}
            step={0.1}
            value={frequency}
            onChange={(v) => setFrequency(v as number)}
            trackStyle={{ backgroundColor: '#3b82f6' }}
            handleStyle={{ borderColor: '#3b82f6' }}
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>LTE (0.7)</span>
            <span>WiFi (2.4)</span>
            <span>5G sub6 (3.5)</span>
            <span>5G mmW (28)</span>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-white p-3 rounded-lg shadow-sm text-center">
          <div className="text-xs text-gray-500">Max Doppler</div>
          <div className="text-lg font-bold text-blue-600">{results.fdMax.toFixed(1)} Hz</div>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm text-center">
          <div className="text-xs text-gray-500">Doppler Spread</div>
          <div className="text-lg font-bold text-purple-600">{results.dopplerSpread.toFixed(1)} Hz</div>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm text-center">
          <div className="text-xs text-gray-500">Coherence Time</div>
          <div className="text-lg font-bold text-green-600">{(results.coherenceTime * 1000).toFixed(2)} ms</div>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm text-center">
          <div className="text-xs text-gray-500">Wavelength</div>
          <div className="text-lg font-bold text-orange-600">{(results.lambda * 100).toFixed(2)} cm</div>
        </div>
      </div>

      {/* Doppler Spectrum Plot */}
      <PlotlyChart
        data={[{
          x: results.freqs,
          y: results.spectrum,
          type: 'scatter',
          mode: 'lines',
          fill: 'tozeroy',
          fillcolor: 'rgba(59, 130, 246, 0.2)',
          line: { color: '#3b82f6', width: 2 },
          name: 'Jakes Spectrum',
        }]}
        layout={{
          title: { text: 'Doppler Power Spectrum (Jakes Model)', font: { size: 14 } },
          xaxis: { title: 'Frequency Shift (Hz)', zeroline: true },
          yaxis: { title: 'Power Spectral Density', zeroline: true },
          height: 300,
          margin: { t: 40, b: 50, l: 60, r: 20 },
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'rgba(255,255,255,0.8)',
        }}
        config={{ responsive: true, displayModeBar: false }}
        style={{ width: '100%' }}
      />
    </div>
  );
}
