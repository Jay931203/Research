'use client';

import { useState, useMemo, useCallback } from 'react';
import Slider from 'rc-slider';
import PlotlyChart from './PlotlyChart';

export default function FadingSimulator() {
  const [fdMax, setFdMax] = useState(50); // Hz
  const [numPaths, setNumPaths] = useState(20);
  const [seed, setSeed] = useState(42);
  const [activeTab, setActiveTab] = useState<'time' | 'spectrum'>('time');

  // Simple seeded random
  const seededRandom = useCallback((s: number) => {
    let state = s;
    return () => {
      state = (state * 1664525 + 1013904223) & 0xffffffff;
      return (state >>> 0) / 0xffffffff;
    };
  }, []);

  const data = useMemo(() => {
    const rng = seededRandom(seed);
    const duration = 0.1; // seconds
    const dt = 0.0001;
    const numSamples = Math.floor(duration / dt);

    const phases: number[] = [];
    const angles: number[] = [];
    for (let n = 0; n < numPaths; n++) {
      phases.push(rng() * 2 * Math.PI);
      angles.push((2 * Math.PI * n) / numPaths);
    }

    const time: number[] = [];
    const amplitude: number[] = [];
    const amplitudeDb: number[] = [];
    const iComp: number[] = [];
    const qComp: number[] = [];

    for (let i = 0; i < numSamples; i++) {
      const t = i * dt;
      time.push(t * 1000); // ms

      let re = 0;
      let im = 0;
      for (let n = 0; n < numPaths; n++) {
        const dopplerShift = fdMax * Math.cos(angles[n]);
        const phase = 2 * Math.PI * dopplerShift * t + phases[n];
        re += Math.cos(phase) / Math.sqrt(numPaths);
        im += Math.sin(phase) / Math.sqrt(numPaths);
      }

      iComp.push(re);
      qComp.push(im);
      const amp = Math.sqrt(re * re + im * im);
      amplitude.push(amp);
      amplitudeDb.push(20 * Math.log10(Math.max(amp, 1e-10)));
    }

    // Histogram for distribution comparison
    const bins = 50;
    const maxAmp = Math.max(...amplitude);
    const binWidth = maxAmp / bins;
    const hist: number[] = new Array(bins).fill(0);
    const binCenters: number[] = [];

    for (let i = 0; i < bins; i++) {
      binCenters.push((i + 0.5) * binWidth);
    }
    for (const a of amplitude) {
      const idx = Math.min(Math.floor(a / binWidth), bins - 1);
      hist[idx]++;
    }
    // Normalize
    const total = amplitude.length * binWidth;
    const histNorm = hist.map(h => h / total);

    // Theoretical Rayleigh (sigma^2 = 0.5 since we normalized by sqrt(N))
    const sigma2 = 0.5;
    const rayleighTheory = binCenters.map(r =>
      (r / sigma2) * Math.exp(-r * r / (2 * sigma2))
    );

    // Clarke's Doppler spectrum S(f) = 2a²/Ds / sqrt(1-(2f/Ds)²), |f| < Ds/2
    // Ds = 2 * fdMax (two-sided spread)
    const Ds = 2 * fdMax;
    const numFreqPoints = 400;
    const specFreq: number[] = [];
    const specPower: number[] = [];
    // avoid singularity at |f|=Ds/2 by stopping slightly before
    for (let i = 0; i < numFreqPoints; i++) {
      const f = -Ds / 2 + (Ds / numFreqPoints) * (i + 0.5);
      const arg = 2 * f / Ds;
      const denom = Math.sqrt(Math.max(1 - arg * arg, 1e-6));
      specFreq.push(f);
      specPower.push(1 / (Math.PI * fdMax * denom));
    }

    // autocorrelation R0[n] = J0(n * pi * Ds / W) for n in samples
    // we compute for time lag up to 100 ms
    const dtAc = 0.001; // 1ms steps
    const numAc = 150;
    const acTime: number[] = [];
    const acR: number[] = [];
    for (let n = 0; n < numAc; n++) {
      const tau = n * dtAc; // seconds
      const arg2 = 2 * Math.PI * fdMax * tau;
      // J0 approximation (standard Bessel series)
      let j0 = 0;
      let term = 1;
      for (let k = 1; k <= 20; k++) {
        j0 += term;
        term *= -(arg2 * arg2) / (4 * k * k);
      }
      acTime.push(tau * 1000); // ms
      acR.push(j0);
    }

    return { time, amplitude, amplitudeDb, iComp, qComp, binCenters, histNorm, rayleighTheory, specFreq, specPower, Ds, acTime, acR };
  }, [fdMax, numPaths, seed, seededRandom]);

  return (
    <div className="my-8 p-6 bg-gradient-to-br from-rose-50 to-orange-50 border border-rose-200 rounded-xl">
      <h3 className="text-xl font-bold text-rose-800 mb-4">Clarke/Jakes Fading Simulator</h3>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Doppler (f_d): <span className="text-rose-600 font-bold">{fdMax} Hz</span>
          </label>
          <Slider
            min={1} max={500} value={fdMax}
            onChange={(v) => setFdMax(v as number)}
            trackStyle={{ backgroundColor: '#e11d48' }}
            handleStyle={{ borderColor: '#e11d48' }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            경로 수 (N): <span className="text-rose-600 font-bold">{numPaths}</span>
          </label>
          <Slider
            min={4} max={100} value={numPaths}
            onChange={(v) => setNumPaths(v as number)}
            trackStyle={{ backgroundColor: '#e11d48' }}
            handleStyle={{ borderColor: '#e11d48' }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Random Seed
          </label>
          <button
            onClick={() => setSeed(Math.floor(Math.random() * 10000))}
            className="px-4 py-2 bg-rose-600 text-white rounded hover:bg-rose-700 transition text-sm"
          >
            New Realization
          </button>
        </div>
      </div>

      {/* Tab selector */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('time')}
          aria-pressed={activeTab === 'time'}
          className={`px-3 py-1.5 rounded-lg text-sm border transition ${activeTab === 'time' ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-slate-600 border-slate-300'}`}
        >
          Time Domain
        </button>
        <button
          onClick={() => setActiveTab('spectrum')}
          aria-pressed={activeTab === 'spectrum'}
          className={`px-3 py-1.5 rounded-lg text-sm border transition ${activeTab === 'spectrum' ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-slate-600 border-slate-300'}`}
        >
          Doppler Spectrum
        </button>
      </div>

      {activeTab === 'time' ? (
        <>
          {/* Time-domain fading */}
          <PlotlyChart
            data={[{
              x: data.time,
              y: data.amplitudeDb,
              type: 'scatter',
              mode: 'lines',
              name: 'Envelope (dB)',
              line: { color: '#e11d48', width: 1.5 },
            }]}
            layout={{
              title: { text: 'Rayleigh Fading Envelope (dB)', font: { size: 14 } },
              xaxis: { title: 'Time (ms)' },
              yaxis: { title: 'Amplitude (dB)', range: [-40, 10] },
              height: 280,
              margin: { t: 40, b: 50, l: 60, r: 20 },
              shapes: [{
                type: 'line', x0: data.time[0], x1: data.time[data.time.length - 1],
                y0: -10, y1: -10,
                line: { color: 'gray', width: 1, dash: 'dash' },
              }],
              annotations: [{
                x: data.time[data.time.length - 1] * 0.95,
                y: -10, text: '-10 dB threshold',
                showarrow: false, font: { size: 10, color: 'gray' },
              }],
              paper_bgcolor: 'transparent',
              plot_bgcolor: 'rgba(255,255,255,0.8)',
            }}
            config={{ responsive: true, displayModeBar: false }}
            style={{ width: '100%' }}
          />

          {/* Distribution comparison */}
          <PlotlyChart
            data={[
              {
                x: data.binCenters,
                y: data.histNorm,
                type: 'bar',
                name: 'Simulated',
                marker: { color: 'rgba(225, 29, 72, 0.5)' },
              },
              {
                x: data.binCenters,
                y: data.rayleighTheory,
                type: 'scatter',
                mode: 'lines',
                name: 'Rayleigh Theory',
                line: { color: '#1d4ed8', width: 2.5 },
              },
            ]}
            layout={{
              title: { text: 'Amplitude Distribution: Simulated vs Rayleigh Theory', font: { size: 14 } },
              xaxis: { title: 'Amplitude' },
              yaxis: { title: 'PDF' },
              height: 280,
              margin: { t: 40, b: 50, l: 60, r: 20 },
              legend: { x: 0.6, y: 0.95 },
              barmode: 'overlay',
              paper_bgcolor: 'transparent',
              plot_bgcolor: 'rgba(255,255,255,0.8)',
            }}
            config={{ responsive: true, displayModeBar: false }}
            style={{ width: '100%' }}
          />
        </>
      ) : (
        <>
          <p className="text-xs text-slate-500 mb-3">
            Clarke 모델(eq. 2.61)의 도플러 스펙트럼 <strong>S(f)</strong>와 자기상관함수 <strong>R₀[n]</strong>입니다.
            f_d를 바꾸면 스펙트럼 폭과 자기상관 감쇠 속도가 모두 변하는 것을 확인하세요.
          </p>

          {/* Doppler Spectrum S(f) */}
          <PlotlyChart
            data={[{
              x: data.specFreq,
              y: data.specPower,
              type: 'scatter',
              mode: 'lines',
              name: `S(f), Ds=${data.Ds} Hz`,
              line: { color: '#e11d48', width: 2.5 },
              fill: 'tozeroy',
              fillcolor: 'rgba(225,29,72,0.12)',
            }]}
            layout={{
              title: { text: `Clarke Doppler Spectrum S(f)  [Ds = ${data.Ds} Hz]`, font: { size: 14 } },
              xaxis: { title: 'Doppler frequency f (Hz)', zeroline: true },
              yaxis: { title: 'S(f)  [normalized]' },
              height: 280,
              margin: { t: 44, b: 50, l: 65, r: 20 },
              annotations: [
                {
                  x: data.Ds / 2 * 0.92,
                  y: 0,
                  text: `+D_s/2 = ${(data.Ds / 2).toFixed(0)} Hz`,
                  showarrow: true,
                  arrowhead: 2,
                  ax: 0,
                  ay: -30,
                  font: { size: 10, color: '#0f766e' },
                },
                {
                  x: -data.Ds / 2 * 0.92,
                  y: 0,
                  text: `-D_s/2`,
                  showarrow: true,
                  arrowhead: 2,
                  ax: 0,
                  ay: -30,
                  font: { size: 10, color: '#0f766e' },
                },
              ],
              paper_bgcolor: 'transparent',
              plot_bgcolor: 'rgba(255,255,255,0.8)',
            }}
            config={{ responsive: true, displayModeBar: false }}
            style={{ width: '100%' }}
          />

          {/* Autocorrelation R0[n] */}
          <PlotlyChart
            data={[{
              x: data.acTime,
              y: data.acR,
              type: 'scatter',
              mode: 'lines',
              name: `R₀(τ) = J₀(2π·f_d·τ)`,
              line: { color: '#7c3aed', width: 2 },
            }]}
            layout={{
              title: { text: `Tap Autocorrelation R₀(τ) = J₀(2π · ${fdMax} Hz · τ)`, font: { size: 14 } },
              xaxis: { title: 'Time lag τ (ms)', zeroline: true },
              yaxis: { title: 'R₀(τ)  [normalized]', range: [-0.5, 1.05] },
              height: 280,
              margin: { t: 44, b: 50, l: 65, r: 20 },
              shapes: [{
                type: 'line',
                x0: 0, x1: data.acTime[data.acTime.length - 1],
                y0: 0.05, y1: 0.05,
                line: { color: '#94a3b8', width: 1, dash: 'dot' },
              }],
              annotations: [{
                x: data.acTime[data.acTime.length - 1] * 0.8,
                y: 0.08,
                text: 'R = 0.05 (Tc 기준)',
                showarrow: false,
                font: { size: 10, color: '#64748b' },
              }],
              paper_bgcolor: 'transparent',
              plot_bgcolor: 'rgba(255,255,255,0.8)',
            }}
            config={{ responsive: true, displayModeBar: false }}
            style={{ width: '100%' }}
          />

          <div className="mt-3 p-3 bg-white rounded-lg border border-rose-100 text-xs text-slate-600">
            <strong className="text-rose-700">Clarke 모델 핵심 결과 (Example 2.2):</strong>
            {' '}S(f)는 ±D_s/2 바깥에서 0이며, 가장자리에서 무한히 발산하는 U자형입니다.
            이 형태는 수평면의 산란체가 균일하게 분포할 때 나타나며,
            자기상관함수와 스펙트럼은 Fourier 변환 쌍을 이룹니다(Wiener–Khinchin theorem).
            코히런스 시간은 <strong>R₀(τ)가 0.05로 감쇠하는 시점</strong>인
            {' '}T_c = J₀⁻¹(0.05) / (πD_s) ≈ 1/(4D_s) 로 정의됩니다.
          </div>
        </>
      )}
    </div>
  );
}
