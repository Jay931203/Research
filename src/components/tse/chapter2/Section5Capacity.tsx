'use client';

import { BlockMath, InlineMath } from 'react-katex';
import { useMemo, useState } from 'react';
import Slider from 'rc-slider';
import CapacityComparison from '@/components/tse/interactive/CapacityComparison';
import DiversityGainVisualizer from '@/components/tse/interactive/DiversityGainVisualizer';

interface Section5Props {
  onNavigate: (id: string) => void;
}

function formatFreq(hz: number) {
  if (hz >= 1e6) return `${(hz / 1e6).toFixed(2)} MHz`;
  if (hz >= 1e3) return `${(hz / 1e3).toFixed(2)} kHz`;
  return `${hz.toFixed(2)} Hz`;
}

function formatTime(s: number) {
  if (s >= 1) return `${s.toFixed(3)} s`;
  if (s >= 1e-3) return `${(s * 1e3).toFixed(3)} ms`;
  return `${(s * 1e6).toFixed(3)} us`;
}

export default function Section5Capacity({ onNavigate }: Section5Props) {
  const [delaySpreadUs, setDelaySpreadUs] = useState(1);
  const [dopplerSpreadHz, setDopplerSpreadHz] = useState(300);
  const [signalBwMHz, setSignalBwMHz] = useState(20);
  const [appDelayMs, setAppDelayMs] = useState(10);
  const [showCapacityPreview, setShowCapacityPreview] = useState(false);

  const summary = useMemo(() => {
    const td = delaySpreadUs * 1e-6;
    const ds = Math.max(1e-6, dopplerSpreadHz);

    const wc = 1 / td;
    const tc = 1 / ds;

    const w = signalBwMHz * 1e6;
    const appDelay = appDelayMs * 1e-3;

    const freqSelective = w > wc;
    const fastVsApp = tc < appDelay;
    const underspreadRatio = td / tc;

    const designNote = [
      freqSelective ? '주파수 선택적 채널: OFDM/등화 필요' : 'Flat 채널: 단일 탭 근사 가능',
      fastVsApp ? '앱 요구 지연 대비 채널이 빠르게 변함: 추정 주기 단축 필요' : '앱 지연 시간 안에서 채널이 비교적 안정적',
      underspreadRatio < 0.1 ? 'Underspread 성질 강함: 탭 모델/파일럿 설계가 안정적' : 'Underspread 성질 약함: 시간-주파수 추적 복잡도 증가',
    ];

    return {
      wc,
      tc,
      underspreadRatio,
      designNote,
    };
  }, [delaySpreadUs, dopplerSpreadHz, signalBwMHz, appDelayMs]);

  return (
    <section id="main-plot" className="section-card transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <span className="badge badge-red">Advanced</span>
        <span className="text-sm text-slate-400">Section 6</span>
      </div>

      <h2 className="text-3xl font-bold text-slate-900 mb-4">2.5 Chapter 2: The Main Plot</h2>

      <p className="text-lg text-slate-600 leading-relaxed mb-6">
        Chapter 2의 결론은 "복잡한 전파를 소수의 파라미터와 탭 통계로 요약해 설계 가능하게 만든다"는 것입니다.
        물리 모델 → I/O 모델 → 코히런스 → 통계 모델의 네 축을 하나의 그림으로 연결하면,
        임의의 무선 시나리오에 대해 어떤 수신기 구조가 필요한지 빠르게 판단할 수 있습니다.
        아래에서 실제 파라미터를 넣어보며 직접 확인해보세요.
      </p>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <div className="concept-card">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Large-scale fading</h3>
          <BlockMath math={String.raw`P_r \propto d^{-2}\text{ (free space)},\quad P_r \propto d^{-4}\text{ (ground reflection)}`} />
          <p className="text-sm text-slate-600 dark:text-slate-400">
            거리와 지형이 평균 감쇠를 결정합니다.
            셀 반경과 전력 예산(link budget) 설계의 기초이며,
            섀도잉이 추가로 수 dB의 랜덤 변동을 만듭니다.
          </p>
          <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
            <div className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">왜 중요한가</div>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              기지국 배치 간격을 정하는 첫 번째 기준입니다.
              <InlineMath math="d^{-2}" /> vs <InlineMath math="d^{-4}" />에 따라 셀 반경이 수 배 달라지며,
              섀도잉 마진을 6-12 dB 더 잡아야 안정적 커버리지를 확보할 수 있습니다.
            </p>
          </div>
        </div>
        <div className="concept-card">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Small-scale fading</h3>
          <BlockMath math={String.raw`D_s \leftrightarrow T_c \sim 1/D_s,\quad T_d \leftrightarrow W_c \sim 1/T_d`} />
          <p className="text-sm text-slate-600 dark:text-slate-400">
            시간/주파수 선택성이 코히런스 파라미터로 요약됩니다.
            이 네 값이 flat/selective, slow/fast 판정을 결정하며,
            수신기 복잡도와 파일럿 오버헤드의 하한을 정합니다.
          </p>
          <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
            <div className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">직관적 이해</div>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              <InlineMath math="D_s" />가 크다는 것은 채널이 빨리 변한다는 뜻이고,
              <InlineMath math="T_d" />가 크다는 것은 주파수에 따라 채널이 많이 달라진다는 뜻입니다.
              이 두 축이 수신기 복잡도를 결정합니다.
            </p>
          </div>
        </div>
        <div className="concept-card">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">I/O model</h3>
          <BlockMath math={String.raw`y[m]=\sum_{\ell} h_\ell[m]x[m-\ell]+w[m]`} />
          <p className="text-sm text-slate-600 dark:text-slate-400">
            연속 전파를 탭 기반 baseband FIR 필터로 변환하여 수신기를 설계합니다.
            탭 수 <InlineMath math={String.raw`L`} />는 <InlineMath math={String.raw`T_d \cdot W`} />에 비례하며,
            이것이 등화기와 OFDM CP 길이를 결정합니다.
          </p>
          <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
            <div className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">핵심 통찰</div>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              이 단순한 FIR 필터가 수십억 개의 EM 산란 경로를 <InlineMath math="L" />개의 탭으로 요약한 것입니다.
              <InlineMath math="L=1" />이면 단순 곱셈, <InlineMath math="L" />이 크면 OFDM이나 등화기가 필요합니다.
            </p>
          </div>
        </div>
        <div className="concept-card">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Statistical model</h3>
          <BlockMath math={String.raw`h_\ell[m]\sim\mathcal{CN}(0,\sigma_\ell^2)\text{ (Rayleigh)},\quad K\text{-factor for Rician}`} />
          <p className="text-sm text-slate-600 dark:text-slate-400">
            탭 분포와 시간 상관함수가 outage 확률, 다이버시티 이득, 채널 추정 오차를 결정합니다.
            K-factor가 클수록 채널이 안정적이고, Rayleigh에서는 deep fade가 빈번합니다.
          </p>
          <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
            <div className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">설계 관점</div>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              탭의 정확한 값은 모르지만 분포를 알면 평균적 성능(ergodic capacity)과
              최악의 성능(outage)을 모두 예측할 수 있습니다.
              이것이 시스템 설계의 핵심 도구입니다.
            </p>
          </div>
        </div>
      </div>

      <div className="concept-card mb-8" id="main-plot-lab">
        <h3 className="font-bold text-lg text-slate-800 mb-4">Main Plot Synthesizer: 내 시나리오를 TSE 파라미터로 요약</h3>

        <div className="grid md:grid-cols-4 gap-4 mb-4">
          <div className="bg-white p-3 rounded-lg">
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Delay spread <InlineMath math="T_d" />: <span className="text-blue-700 font-bold">{delaySpreadUs.toFixed(2)} us</span>
            </label>
            <Slider
              min={0.02}
              max={20}
              step={0.02}
              value={delaySpreadUs}
              onChange={(v) => setDelaySpreadUs(v as number)}
              trackStyle={{ backgroundColor: '#2563eb' }}
              handleStyle={{ borderColor: '#2563eb' }}
            />
          </div>
          <div className="bg-white p-3 rounded-lg">
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Doppler spread <InlineMath math="D_s" />: <span className="text-blue-700 font-bold">{dopplerSpreadHz.toFixed(0)} Hz</span>
            </label>
            <Slider
              min={1}
              max={2000}
              step={1}
              value={dopplerSpreadHz}
              onChange={(v) => setDopplerSpreadHz(v as number)}
              trackStyle={{ backgroundColor: '#2563eb' }}
              handleStyle={{ borderColor: '#2563eb' }}
            />
          </div>
          <div className="bg-white p-3 rounded-lg">
            <label className="block text-xs font-medium text-slate-600 mb-1">
              신호 대역폭 <InlineMath math="W" />: <span className="text-blue-700 font-bold">{signalBwMHz.toFixed(1)} MHz</span>
            </label>
            <Slider
              min={0.2}
              max={100}
              step={0.1}
              value={signalBwMHz}
              onChange={(v) => setSignalBwMHz(v as number)}
              trackStyle={{ backgroundColor: '#2563eb' }}
              handleStyle={{ borderColor: '#2563eb' }}
            />
          </div>
          <div className="bg-white p-3 rounded-lg">
            <label className="block text-xs font-medium text-slate-600 mb-1">
              앱 지연 요구: <span className="text-blue-700 font-bold">{appDelayMs.toFixed(1)} ms</span>
            </label>
            <Slider
              min={1}
              max={200}
              step={1}
              value={appDelayMs}
              onChange={(v) => setAppDelayMs(v as number)}
              trackStyle={{ backgroundColor: '#2563eb' }}
              handleStyle={{ borderColor: '#2563eb' }}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-3 text-sm mb-4">
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
            <div className="text-slate-500">Coherence bandwidth W_c</div>
            <div className="text-lg font-bold text-blue-700">{formatFreq(summary.wc)}</div>
          </div>
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
            <div className="text-slate-500">Coherence time T_c</div>
            <div className="text-lg font-bold text-emerald-700">{formatTime(summary.tc)}</div>
          </div>
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-100">
            <div className="text-slate-500">Underspread ratio T_d/T_c</div>
            <div className="text-lg font-bold text-amber-700">{summary.underspreadRatio.toExponential(2)}</div>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          {summary.designNote.map((note, idx) => (
            <div key={idx} className="p-2 rounded bg-slate-50 border border-slate-200 text-slate-700">{note}</div>
          ))}
        </div>
      </div>

      <div className="insight mt-8">
        <div className="insight-title">Chapter 3으로 넘어가기 전 체크</div>
        <ul className="text-sm text-amber-900 list-disc list-inside space-y-1">
          <li>주어진 시나리오의 <InlineMath math="(T_d,D_s,W_c,T_c)" />를 근사 계산할 수 있는가?</li>
          <li>Flat/Selective, Slow/Fast 판정을 근거와 함께 설명할 수 있는가?</li>
          <li>Rayleigh/Rician과 K-factor가 링크 신뢰도에 주는 영향을 설명할 수 있는가?</li>
        </ul>
      </div>

      <div className="mt-8 p-4 rounded-xl border border-slate-200 bg-slate-50">
        <button
          onClick={() => setShowCapacityPreview((prev) => !prev)}
          className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-sm text-slate-700 hover:bg-slate-100"
        >
          {showCapacityPreview ? 'Capacity Preview 숨기기' : 'Capacity Preview 보기 (Chapter 5 연결)'}
        </button>
        <p className="text-xs text-slate-500 mt-2">
          아래 내용은 TSE Chapter 2 범위를 넘어선 확장 미리보기입니다.
        </p>
      </div>

      {showCapacityPreview && (
        <div className="mt-4 space-y-4">
          <CapacityComparison />
          <DiversityGainVisualizer />
        </div>
      )}

      <div className="insight mt-8 mb-0">
        <div className="insight-title">Appendix로 연결</div>
        <p className="text-sm text-amber-900">
          Main Plot이 채널 자체를 요약했다면, 마지막은 수신기 관점입니다.
          <button onClick={() => onNavigate('appendix-a')} className="cross-ref !text-xs ml-1">Appendix A.1~A.3</button>
          에서 검출/추정의 핵심 수학을 정리하고 실습으로 연결합니다.
        </p>
      </div>
    </section>
  );
}
