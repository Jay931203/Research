'use client';

import { useMemo, useState } from 'react';
import Slider from 'rc-slider';
import PlotlyChart from './PlotlyChart';

function logspace(start: number, end: number, n: number) {
  const a = Math.log10(start);
  const b = Math.log10(end);
  return Array.from({ length: n }, (_, i) => 10 ** (a + ((b - a) * i) / (n - 1)));
}

export default function TwoRayGroundReflectionLab() {
  const [frequencyGHz, setFrequencyGHz] = useState(2.0);
  const [txHeight, setTxHeight] = useState(30);
  const [rxHeight, setRxHeight] = useState(1.5);
  const [maxDistance, setMaxDistance] = useState(3000);
  const [reflectionCoeff, setReflectionCoeff] = useState(-1);

  const data = useMemo(() => {
    const c = 3e8;
    const fc = frequencyGHz * 1e9;
    const lambda = c / fc;
    const ht = txHeight;
    const hr = rxHeight;

    const distances = logspace(10, Math.max(50, maxDistance), 450);

    const freeSpacePower: number[] = [];
    const twoRayPower: number[] = [];
    const asymptoticPower: number[] = [];

    for (const d of distances) {
      const dLos = Math.sqrt(d * d + (ht - hr) * (ht - hr));
      const dRef = Math.sqrt(d * d + (ht + hr) * (ht + hr));
      const phase = (2 * Math.PI * (dRef - dLos)) / lambda;

      const losAmp = 1 / dLos;
      const refAmp = Math.abs(reflectionCoeff) / dRef;

      const re = losAmp + reflectionCoeff * Math.cos(phase) / dRef;
      const im = reflectionCoeff * Math.sin(phase) / dRef;

      const pFs = losAmp * losAmp;
      const pTwo = re * re + im * im;
      const pAsym = ((ht * hr) / (d * d)) ** 2;

      freeSpacePower.push(Math.max(pFs, 1e-20));
      twoRayPower.push(Math.max(pTwo, 1e-20));
      asymptoticPower.push(Math.max(pAsym, 1e-20));
    }

    const normalizeToDb = (arr: number[]) => {
      const ref = arr[0];
      return arr.map((v) => 10 * Math.log10(v / ref));
    };

    const fsDb = normalizeToDb(freeSpacePower);
    const twoRayDb = normalizeToDb(twoRayPower);
    const asymDb = normalizeToDb(asymptoticPower);

    const crossoverDistance = (4 * Math.PI * ht * hr) / lambda;

    const i1 = Math.floor(distances.length * 0.75);
    const i2 = distances.length - 1;
    const slopeDbPerDecade =
      (twoRayDb[i2] - twoRayDb[i1]) /
      (Math.log10(distances[i2]) - Math.log10(distances[i1]));

    const probes = [100, 500, 1000, 2000]
      .filter((d) => d <= maxDistance)
      .map((target) => {
        const idx = distances.findIndex((d) => d >= target);
        const i = idx < 0 ? distances.length - 1 : idx;
        return {
          d: target,
          fs: fsDb[i],
          twoRay: twoRayDb[i],
          gain: twoRayDb[i] - fsDb[i],
        };
      });

    return {
      lambda,
      distances,
      fsDb,
      twoRayDb,
      asymDb,
      crossoverDistance,
      slopeDbPerDecade,
      probes,
    };
  }, [frequencyGHz, txHeight, rxHeight, maxDistance, reflectionCoeff]);

  return (
    <div className="my-8 p-6 bg-gradient-to-br from-sky-50 to-cyan-50 border border-sky-200 rounded-xl">
      <h3 className="text-xl font-bold text-sky-800 mb-2">Two-Ray Ground Reflection Lab</h3>
      <p className="text-sm text-slate-600 mb-4">
        TSE 2.1.5의 핵심인 지면 반사 모델을 직접 확인합니다. 근거리에서는 자유공간 법칙에 가깝고,
        원거리로 갈수록 평균 경향이 <strong>d^-4</strong>로 바뀌는 구간이 나타납니다.
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 mb-5">
        <div className="bg-white p-3 rounded-lg">
          <label className="block text-xs font-medium text-slate-600 mb-1">
            반송파: <span className="text-sky-700 font-bold">{frequencyGHz.toFixed(1)} GHz</span>
          </label>
          <Slider
            min={0.7}
            max={6}
            step={0.1}
            value={frequencyGHz}
            onChange={(v) => setFrequencyGHz(v as number)}
            trackStyle={{ backgroundColor: '#0284c7' }}
            handleStyle={{ borderColor: '#0284c7' }}
          />
        </div>

        <div className="bg-white p-3 rounded-lg">
          <label className="block text-xs font-medium text-slate-600 mb-1">
            송신 안테나 높이 h_t: <span className="text-sky-700 font-bold">{txHeight.toFixed(1)} m</span>
          </label>
          <Slider
            min={5}
            max={80}
            step={0.5}
            value={txHeight}
            onChange={(v) => setTxHeight(v as number)}
            trackStyle={{ backgroundColor: '#0284c7' }}
            handleStyle={{ borderColor: '#0284c7' }}
          />
        </div>

        <div className="bg-white p-3 rounded-lg">
          <label className="block text-xs font-medium text-slate-600 mb-1">
            수신 안테나 높이 h_r: <span className="text-sky-700 font-bold">{rxHeight.toFixed(1)} m</span>
          </label>
          <Slider
            min={1}
            max={10}
            step={0.1}
            value={rxHeight}
            onChange={(v) => setRxHeight(v as number)}
            trackStyle={{ backgroundColor: '#0284c7' }}
            handleStyle={{ borderColor: '#0284c7' }}
          />
        </div>

        <div className="bg-white p-3 rounded-lg">
          <label className="block text-xs font-medium text-slate-600 mb-1">
            최대 거리: <span className="text-sky-700 font-bold">{maxDistance} m</span>
          </label>
          <Slider
            min={500}
            max={5000}
            step={100}
            value={maxDistance}
            onChange={(v) => setMaxDistance(v as number)}
            trackStyle={{ backgroundColor: '#0284c7' }}
            handleStyle={{ borderColor: '#0284c7' }}
          />
        </div>

        <div className="bg-white p-3 rounded-lg">
          <label className="block text-xs font-medium text-slate-600 mb-1">
            반사계수 Γ: <span className="text-sky-700 font-bold">{reflectionCoeff.toFixed(2)}</span>
          </label>
          <Slider
            min={-1}
            max={0}
            step={0.05}
            value={reflectionCoeff}
            onChange={(v) => setReflectionCoeff(v as number)}
            trackStyle={{ backgroundColor: '#0284c7' }}
            handleStyle={{ borderColor: '#0284c7' }}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-3 mb-5">
        <div className="bg-white p-3 rounded-lg border border-sky-100">
          <div className="text-xs text-slate-500">파장 λ</div>
          <div className="text-lg font-bold text-sky-700">{(data.lambda * 100).toFixed(2)} cm</div>
        </div>
        <div className="bg-white p-3 rounded-lg border border-sky-100">
          <div className="text-xs text-slate-500">교차 거리 (대략)</div>
          <div className="text-lg font-bold text-sky-700">{data.crossoverDistance.toFixed(0)} m</div>
        </div>
        <div className="bg-white p-3 rounded-lg border border-sky-100">
          <div className="text-xs text-slate-500">원거리 기울기 (dB/dec)</div>
          <div className="text-lg font-bold text-sky-700">{data.slopeDbPerDecade.toFixed(1)}</div>
        </div>
      </div>

      <PlotlyChart
        data={[
          {
            x: data.distances,
            y: data.fsDb,
            type: 'scatter',
            mode: 'lines',
            name: 'Free-space (~d^-2)',
            line: { color: '#2563eb', width: 2 },
          },
          {
            x: data.distances,
            y: data.twoRayDb,
            type: 'scatter',
            mode: 'lines',
            name: 'Two-ray exact',
            line: { color: '#0284c7', width: 2.5 },
          },
          {
            x: data.distances,
            y: data.asymDb,
            type: 'scatter',
            mode: 'lines',
            name: 'Two-ray asymptotic (~d^-4)',
            line: { color: '#0f766e', width: 2, dash: 'dash' },
          },
        ]}
        layout={{
          title: { text: 'Received Power Trend vs Distance (normalized)', font: { size: 14 } },
          xaxis: { title: 'Distance (m)', type: 'log' },
          yaxis: { title: 'Relative Power (dB)' },
          height: 360,
          margin: { t: 70, b: 50, l: 60, r: 20 },
          legend: { orientation: 'h' as const, x: 0.5, xanchor: 'center' as const, y: 1.15 },
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'rgba(255,255,255,0.85)',
        }}
        config={{ responsive: true, displayModeBar: false }}
        style={{ width: '100%' }}
      />

      <div className="mt-4 grid md:grid-cols-4 gap-2 text-xs">
        {data.probes.map((probe) => (
          <div key={probe.d} className="bg-white rounded-lg p-2 border border-sky-100 text-slate-600">
            <div className="font-semibold text-slate-700">d = {probe.d} m</div>
            <div>Free-space: {probe.fs.toFixed(1)} dB</div>
            <div>Two-ray: {probe.twoRay.toFixed(1)} dB</div>
            <div className={probe.gain >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
              차이: {probe.gain >= 0 ? '+' : ''}{probe.gain.toFixed(1)} dB
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
