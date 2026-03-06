'use client';

import { useState, useMemo } from 'react';
import Slider from 'rc-slider';

export default function ChannelParameterExplorer() {
  const [delaySpread, setDelaySpread] = useState(1); // μs
  const [speed, setSpeed] = useState(100); // km/h
  const [carrierFreq, setCarrierFreq] = useState(2); // GHz
  const [signalBw, setSignalBw] = useState(20); // MHz
  const [symbolPeriod, setSymbolPeriod] = useState(66.7); // μs (LTE OFDM symbol)

  const results = useMemo(() => {
    const tauD = delaySpread * 1e-6; // seconds
    const Bc = 1 / (5 * tauD); // Hz
    const v = speed / 3.6; // m/s
    const fc = carrierFreq * 1e9;
    const fdMax = (v * fc) / 3e8;
    const Bd = 2 * fdMax;
    const Tc = Bd > 0 ? 1 / Bd : Infinity;

    const W = signalBw * 1e6;
    const Ts = symbolPeriod * 1e-6;

    const isFreqSelective = W > Bc;
    const isFastFading = Ts > Tc;

    return { Bc, fdMax, Bd, Tc, W, Ts, isFreqSelective, isFastFading };
  }, [delaySpread, speed, carrierFreq, signalBw, symbolPeriod]);

  const formatFreq = (hz: number) => {
    if (hz >= 1e6) return `${(hz / 1e6).toFixed(1)} MHz`;
    if (hz >= 1e3) return `${(hz / 1e3).toFixed(1)} kHz`;
    return `${hz.toFixed(1)} Hz`;
  };

  const formatTime = (s: number) => {
    if (!isFinite(s)) return '∞';
    if (s >= 1) return `${s.toFixed(2)} s`;
    if (s >= 1e-3) return `${(s * 1e3).toFixed(2)} ms`;
    if (s >= 1e-6) return `${(s * 1e6).toFixed(2)} μs`;
    return `${(s * 1e9).toFixed(2)} ns`;
  };

  return (
    <div className="my-8 p-6 bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-xl">
      <h3 className="text-xl font-bold text-amber-800 mb-4">Channel Parameter Explorer</h3>
      <p className="text-sm text-gray-600 mb-6">파라미터를 조절하여 Flat/Frequency-selective, Slow/Fast fading 판정을 실시간으로 확인하세요.</p>

      {/* Input Sliders */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-3 rounded-lg">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Delay Spread (τ_d): <span className="text-amber-600 font-bold">{delaySpread} μs</span>
          </label>
          <Slider min={0.01} max={20} step={0.01} value={delaySpread}
            onChange={(v) => setDelaySpread(v as number)}
            trackStyle={{ backgroundColor: '#d97706' }}
            handleStyle={{ borderColor: '#d97706' }}
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>실내(0.01)</span><span>도시(1)</span><span>산악(20)</span>
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            이동 속도: <span className="text-amber-600 font-bold">{speed} km/h</span>
          </label>
          <Slider min={0} max={500} step={1} value={speed}
            onChange={(v) => setSpeed(v as number)}
            trackStyle={{ backgroundColor: '#d97706' }}
            handleStyle={{ borderColor: '#d97706' }}
          />
        </div>

        <div className="bg-white p-3 rounded-lg">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            반송파 주파수: <span className="text-amber-600 font-bold">{carrierFreq} GHz</span>
          </label>
          <Slider min={0.7} max={28} step={0.1} value={carrierFreq}
            onChange={(v) => setCarrierFreq(v as number)}
            trackStyle={{ backgroundColor: '#d97706' }}
            handleStyle={{ borderColor: '#d97706' }}
          />
        </div>

        <div className="bg-white p-3 rounded-lg">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            신호 대역폭 (W): <span className="text-amber-600 font-bold">{signalBw} MHz</span>
          </label>
          <Slider min={0.2} max={100} step={0.1} value={signalBw}
            onChange={(v) => setSignalBw(v as number)}
            trackStyle={{ backgroundColor: '#d97706' }}
            handleStyle={{ borderColor: '#d97706' }}
          />
        </div>

        <div className="bg-white p-3 rounded-lg">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            심볼 주기 (T_s): <span className="text-amber-600 font-bold">{symbolPeriod} μs</span>
          </label>
          <Slider min={0.1} max={1000} step={0.1} value={symbolPeriod}
            onChange={(v) => setSymbolPeriod(v as number)}
            trackStyle={{ backgroundColor: '#d97706' }}
            handleStyle={{ borderColor: '#d97706' }}
          />
        </div>
      </div>

      {/* Computed Parameters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-white p-3 rounded-lg shadow-sm text-center border-2 border-blue-200 overflow-hidden">
          <div className="text-xs text-gray-500">Coherence BW (B_c)</div>
          <div className="text-lg font-bold text-blue-600 truncate">{formatFreq(results.Bc)}</div>
          <div className="text-xs text-gray-400">= 1/(5τ_d)</div>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm text-center border-2 border-purple-200 overflow-hidden">
          <div className="text-xs text-gray-500">Max Doppler (f_d)</div>
          <div className="text-lg font-bold text-purple-600 truncate">{results.fdMax.toFixed(1)} Hz</div>
          <div className="text-xs text-gray-400">= v·f_c/c</div>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm text-center border-2 border-green-200 overflow-hidden">
          <div className="text-xs text-gray-500">Doppler Spread (B_D)</div>
          <div className="text-lg font-bold text-green-600 truncate">{results.Bd.toFixed(1)} Hz</div>
          <div className="text-xs text-gray-400">= 2f_d</div>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm text-center border-2 border-orange-200 overflow-hidden">
          <div className="text-xs text-gray-500">Coherence Time (T_c)</div>
          <div className="text-lg font-bold text-orange-600 truncate">{formatTime(results.Tc)}</div>
          <div className="text-xs text-gray-400">= 1/B_D</div>
        </div>
      </div>

      {/* Fading Classification */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className={`p-4 rounded-lg border-2 ${results.isFreqSelective ? 'border-red-400 bg-red-50' : 'border-green-400 bg-green-50'}`}>
          <div className="font-bold text-lg mb-2">
            {results.isFreqSelective ? '⚡ Frequency-Selective Fading' : '✅ Flat Fading'}
          </div>
          <div className="text-sm overflow-x-auto">
            W = {formatFreq(results.W)} {results.isFreqSelective ? '>' : '<'} B_c = {formatFreq(results.Bc)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {results.isFreqSelective
              ? 'OFDM이나 Equalizer가 필요합니다'
              : '단순 수신기로 충분합니다'}
          </div>
        </div>

        <div className={`p-4 rounded-lg border-2 ${results.isFastFading ? 'border-red-400 bg-red-50' : 'border-green-400 bg-green-50'}`}>
          <div className="font-bold text-lg mb-2">
            {results.isFastFading ? '⚡ Fast Fading' : '✅ Slow Fading'}
          </div>
          <div className="text-sm overflow-x-auto">
            T_s = {formatTime(results.Ts)} {results.isFastFading ? '>' : '<'} T_c = {formatTime(results.Tc)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {results.isFastFading
              ? '빠른 채널 추정이 필요합니다'
              : '심볼 기간 동안 채널이 일정합니다'}
          </div>
        </div>
      </div>
    </div>
  );
}
