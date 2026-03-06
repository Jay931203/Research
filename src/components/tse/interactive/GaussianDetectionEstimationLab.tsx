'use client';

import { useMemo, useState } from 'react';
import { InlineMath } from 'react-katex';
import Slider from 'rc-slider';
import PlotlyChart from './PlotlyChart';

function erf(x: number) {
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * ax);
  const y =
    1 -
    (((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t) *
      Math.exp(-ax * ax);
  return sign * y;
}

function normalCdf(x: number) {
  return 0.5 * (1 + erf(x / Math.SQRT2));
}

function qFunc(x: number) {
  return 1 - normalCdf(x);
}

export default function GaussianDetectionEstimationLab() {
  const [snrDb, setSnrDb] = useState(10);
  const [priorP1, setPriorP1] = useState(0.5);
  const [pilotCount, setPilotCount] = useState(8);
  const [channelNorm, setChannelNorm] = useState(4);

  const data = useMemo(() => {
    const snrLin = Math.pow(10, snrDb / 10);
    const A = 1;
    const sigma2 = A * A / Math.max(snrLin, 1e-9);
    const sigma = Math.sqrt(sigma2);

    const p1 = Math.min(0.95, Math.max(0.05, priorP1));
    const threshold = (sigma2 / (2 * A)) * Math.log((1 - p1) / p1);

    const pFalseAlarm = qFunc((threshold + A) / sigma);
    const pMiss = normalCdf((threshold - A) / sigma);
    const bayesError = p1 * pMiss + (1 - p1) * pFalseAlarm;

    const mlError = qFunc(A / sigma);

    const snrAxis: number[] = [];
    const mlCurve: number[] = [];
    const mapCurve: number[] = [];

    for (let s = -5; s <= 30; s += 0.5) {
      const g = 10 ** (s / 10);
      const sig2 = A * A / Math.max(g, 1e-9);
      const sig = Math.sqrt(sig2);

      const eta = (sig2 / (2 * A)) * Math.log((1 - p1) / p1);
      const pFa = qFunc((eta + A) / sig);
      const pM = normalCdf((eta - A) / sig);
      const pErr = p1 * pM + (1 - p1) * pFa;

      snrAxis.push(s);
      mlCurve.push(Math.max(qFunc(A / sig), 1e-8));
      mapCurve.push(Math.max(pErr, 1e-8));
    }

    const pilotAxis = Array.from({ length: 32 }, (_, i) => i + 1);
    const mmsePilot = pilotAxis.map((n) => 1 / (1 + n * snrLin));
    const mmseCurrent = 1 / (1 + pilotCount * snrLin);

    const mmseSnrAxis: number[] = [];
    const mmseSnrCurve: number[] = [];
    for (let s = -5; s <= 30; s += 0.5) {
      const g = 10 ** (s / 10);
      mmseSnrAxis.push(s);
      mmseSnrCurve.push(1 / (1 + channelNorm * g));
    }

    const gammaEff = snrLin / (1 + snrLin * mmseCurrent);

    return {
      snrLin,
      threshold,
      pFalseAlarm,
      pMiss,
      bayesError,
      mlError,
      snrAxis,
      mlCurve,
      mapCurve,
      pilotAxis,
      mmsePilot,
      mmseCurrent,
      mmseSnrAxis,
      mmseSnrCurve,
      gammaEff,
    };
  }, [snrDb, priorP1, pilotCount, channelNorm]);

  return (
    <div className="my-8 p-6 bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-200 rounded-xl">
      <h3 className="text-xl font-bold text-indigo-800 mb-2">Appendix A Detection & Estimation Lab</h3>
      <p className="text-sm text-slate-600 mb-4">
        A.2(검출)과 A.3(추정)을 분리해서 확인합니다. 같은 SNR에서도 임계값 정책과 추정 오차가
        실제 링크 신뢰도에 어떤 차이를 만드는지 수치로 확인할 수 있습니다.
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <div className="bg-white p-3 rounded-lg">
          <label className="block text-xs font-medium text-slate-600 mb-1">
            평균 SNR: <span className="text-indigo-700 font-bold">{snrDb} dB</span>
          </label>
          <Slider
            min={-5}
            max={30}
            step={1}
            value={snrDb}
            onChange={(v) => setSnrDb(v as number)}
            trackStyle={{ backgroundColor: '#4f46e5' }}
            handleStyle={{ borderColor: '#4f46e5' }}
          />
        </div>

        <div className="bg-white p-3 rounded-lg">
          <label className="block text-xs font-medium text-slate-600 mb-1">
            사전확률 P(H1): <span className="text-indigo-700 font-bold">{priorP1.toFixed(2)}</span>
          </label>
          <Slider
            min={0.05}
            max={0.95}
            step={0.05}
            value={priorP1}
            onChange={(v) => setPriorP1(v as number)}
            trackStyle={{ backgroundColor: '#4f46e5' }}
            handleStyle={{ borderColor: '#4f46e5' }}
          />
        </div>

        <div className="bg-white p-3 rounded-lg">
          <label className="block text-xs font-medium text-slate-600 mb-1">
            파일럿 수 N_p: <span className="text-indigo-700 font-bold">{pilotCount}</span>
          </label>
          <Slider
            min={1}
            max={32}
            step={1}
            value={pilotCount}
            onChange={(v) => setPilotCount(v as number)}
            trackStyle={{ backgroundColor: '#4f46e5' }}
            handleStyle={{ borderColor: '#4f46e5' }}
          />
        </div>

        <div className="bg-white p-3 rounded-lg">
          <label className="block text-xs font-medium text-slate-600 mb-1">
            ||h||^2 (벡터 모형): <span className="text-indigo-700 font-bold">{channelNorm.toFixed(1)}</span>
          </label>
          <Slider
            min={1}
            max={16}
            step={0.5}
            value={channelNorm}
            onChange={(v) => setChannelNorm(v as number)}
            trackStyle={{ backgroundColor: '#4f46e5' }}
            handleStyle={{ borderColor: '#4f46e5' }}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-3 mb-5 text-sm">
        <div className="bg-white p-3 rounded-lg border border-indigo-100">
          <div className="text-slate-500">MAP 임계값</div>
          <div className="text-lg font-bold text-indigo-700">{data.threshold.toFixed(3)}</div>
        </div>
        <div className="bg-white p-3 rounded-lg border border-indigo-100">
          <div className="text-slate-500">P(false alarm)</div>
          <div className="text-lg font-bold text-indigo-700">{(data.pFalseAlarm * 100).toFixed(2)}%</div>
        </div>
        <div className="bg-white p-3 rounded-lg border border-indigo-100">
          <div className="text-slate-500">Bayes error</div>
          <div className="text-lg font-bold text-indigo-700">{(data.bayesError * 100).toFixed(2)}%</div>
        </div>
        <div className="bg-white p-3 rounded-lg border border-indigo-100">
          <div className="text-slate-500">MMSE(N_p, SNR)</div>
          <div className="text-lg font-bold text-indigo-700">{data.mmseCurrent.toFixed(4)}</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-3 border border-indigo-100">
          <PlotlyChart
            data={[
              {
                x: data.snrAxis,
                y: data.mlCurve,
                type: 'scatter',
                mode: 'lines',
                name: 'ML (equal prior)',
                line: { color: '#2563eb', width: 2.2 },
              },
              {
                x: data.snrAxis,
                y: data.mapCurve,
                type: 'scatter',
                mode: 'lines',
                name: `MAP (P(H1)=${priorP1.toFixed(2)})`,
                line: { color: '#7c3aed', width: 2.2 },
              },
            ]}
            layout={{
              title: { text: 'A.2 Detection Error vs SNR', font: { size: 13 } },
              xaxis: { title: 'SNR (dB)' },
              yaxis: { title: 'Error probability', type: 'log', range: [-6, 0] },
              height: 300,
              margin: { t: 34, b: 45, l: 55, r: 15 },
              legend: { x: 0.02, y: 0.98 },
              paper_bgcolor: 'transparent',
              plot_bgcolor: 'rgba(248,250,252,0.7)',
            }}
            config={{ responsive: true, displayModeBar: false }}
            style={{ width: '100%' }}
          />
          <p className="text-xs text-slate-500 mt-2">
            요점: 사전확률이 치우치면 MAP 임계값이 이동하며, 같은 SNR에서도 오검출/미검출 균형이 달라집니다.
          </p>
        </div>

        <div className="bg-white rounded-xl p-3 border border-indigo-100">
          <PlotlyChart
            data={[
              {
                x: data.pilotAxis,
                y: data.mmsePilot,
                type: 'scatter',
                mode: 'lines+markers',
                name: `MMSE vs N_p @ ${snrDb} dB`,
                line: { color: '#0f766e', width: 2.2 },
                marker: { size: 5 },
              },
            ]}
            layout={{
              title: { text: 'A.3 MMSE vs Pilot Count', font: { size: 13 } },
              xaxis: { title: 'Pilot count N_p' },
              yaxis: { title: 'Normalized MMSE', type: 'log', range: [-4, 0.2] },
              height: 300,
              margin: { t: 34, b: 45, l: 55, r: 15 },
              paper_bgcolor: 'transparent',
              plot_bgcolor: 'rgba(248,250,252,0.7)',
            }}
            config={{ responsive: true, displayModeBar: false }}
            style={{ width: '100%' }}
          />
          <p className="text-xs text-slate-500 mt-2">
            요점: Appendix A.3 식의 형태 그대로 <InlineMath math={String.raw`\text{MMSE} = \frac{1}{1+N_p\gamma}`} />가 나타나며,
            파일럿 증가 시 오차가 급감합니다.
          </p>
        </div>
      </div>

      <div className="mt-4 bg-white rounded-lg p-3 border border-indigo-100 text-sm text-slate-700">
        현재 설정에서 추정 오차를 반영한 유효 SNR은 <strong>{(10 * Math.log10(data.gammaEff)).toFixed(2)} dB</strong>입니다
        (이상적 SNR {snrDb} dB 대비 손실 {(snrDb - 10 * Math.log10(data.gammaEff)).toFixed(2)} dB).
      </div>
    </div>
  );
}
