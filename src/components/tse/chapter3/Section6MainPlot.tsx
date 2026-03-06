'use client';

import { BlockMath, InlineMath } from 'react-katex';
import { useState, useMemo } from 'react';
import CapacityComparison from '@/components/tse/interactive/CapacityComparison';
import DiversityGainVisualizer from '@/components/tse/interactive/DiversityGainVisualizer';

interface Section6Props {
  onNavigate: (id: string) => void;
}

type DetectionType = 'coherent' | 'noncoherent';
type DivAxis = 'time' | 'space' | 'freq';
type CsiStrategy = 'pilot-dense' | 'pilot-moderate' | 'blind';

export default function Section6MainPlot({ onNavigate }: Section6Props) {
  const [detection, setDetection] = useState<DetectionType>('coherent');
  const [divAxes, setDivAxes] = useState<Set<DivAxis>>(new Set<DivAxis>(['space']));
  const [csiStrategy, setCsiStrategy] = useState<CsiStrategy>('pilot-moderate');

  const toggleAxis = (axis: DivAxis) => {
    setDivAxes(prev => {
      const next = new Set(prev);
      if (next.has(axis)) next.delete(axis);
      else next.add(axis);
      return next;
    });
  };

  const recommendation = useMemo(() => {
    const axes = Array.from(divAxes);
    const notes: string[] = [];

    if (detection === 'coherent') {
      notes.push('코히어런트 검출 → 파일럿 기반 채널 추정 필수');
    } else {
      notes.push('비코히어런트 검출 → 파일럿 오버헤드 최소화, 에너지 기반 판정');
    }

    if (axes.length === 0) {
      notes.push('다이버시티 축이 없음 → L=1, 고 SNR 기울기 1/SNR');
    } else {
      const axisLabels = axes.map(a => a === 'time' ? '시간' : a === 'space' ? '공간' : '주파수');
      notes.push(`다이버시티 축: ${axisLabels.join(' × ')} → 총 L = L_${axes.join(' · L_')}`);
    }

    if (axes.includes('time')) notes.push('시간축 선택 → 인터리빙 깊이 ≫ Tc 필요, 지연 제약 확인');
    if (axes.includes('space')) notes.push('공간축 선택 → 안테나/RF 체인 하드웨어 비용');
    if (axes.includes('freq')) notes.push('주파수축 선택 → W > Wc 필요, 등화 또는 OFDM 구조');

    if (csiStrategy === 'pilot-dense') {
      notes.push('파일럿 밀도 높음 → 추정 오차 최소, 처리율 감소');
    } else if (csiStrategy === 'pilot-moderate') {
      notes.push('파일럿 밀도 적정 → 추정/처리율 균형');
    } else {
      notes.push('블라인드/반블라인드 → 파일럿 최소, 수렴 지연 가능');
    }

    return notes;
  }, [detection, divAxes, csiStrategy]);

  return (
    <section id="ch3-main-plot" className="section-card transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <span className="badge badge-red">Advanced</span>
        <span className="text-sm text-slate-400">Section 6</span>
      </div>

      <h2 className="text-3xl font-bold text-slate-900 mb-4">3.6 Chapter 3: The Main Plot</h2>
      <p className="text-lg text-slate-600 leading-relaxed mb-6">
        Chapter 3을 한 줄로 요약하면 다음입니다.
        "검출 성능은 페이딩 통계와 CSI 품질의 곱으로 결정되고,
        신뢰도는 시간/공간/주파수 다이버시티 배분으로 만들며,
        최종 운영점은 지연·대역폭·안테나·파일럿 오버헤드 제약 하에서 정해진다."
        아래에서 이 흐름을 5단계로 정리합니다.
      </p>

      <div className="concept-card mb-8" id="five-step-chain">
        <h3 className="font-bold text-lg text-slate-800 mb-4">5단계 설계 체인</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
            <span className="w-7 h-7 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">1</span>
            <div>
              <div className="font-bold text-emerald-800 text-sm">검출 가정 선택</div>
              <div className="text-sm text-slate-600">코히어런트 vs 비코히어런트. CSI 확보 가능성에 따라 결정.</div>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <span className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">2</span>
            <div>
              <div className="font-bold text-blue-800 text-sm">다이버시티 자원 파악</div>
              <div className="text-sm text-slate-600">시간(코히어런스 시간), 안테나(하드웨어), 주파수(대역폭) 각 축의 예산.</div>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
            <span className="w-7 h-7 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">3</span>
            <div>
              <div className="font-bold text-indigo-800 text-sm">결합/코딩 전략 선택</div>
              <div className="text-sm text-slate-600">반복, 인터리빙, Alamouti, OFDM+코딩 등 구체적 방식 결정.</div>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
            <span className="w-7 h-7 bg-amber-600 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">4</span>
            <div>
              <div className="font-bold text-amber-800 text-sm">CSI 확보 전략</div>
              <div className="text-sm text-slate-600">파일럿 밀도, 추적 주기, 추정 오차 관리.</div>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
            <span className="w-7 h-7 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">5</span>
            <div>
              <div className="font-bold text-red-800 text-sm">최종 검증</div>
              <div className="text-sm text-slate-600">목표 오류율/처리율/복잡도 동시 만족 여부를 확인.</div>
            </div>
          </div>
        </div>
      </div>

      <div className="concept-card mb-8" id="decision-template">
        <h3 className="font-bold text-lg text-slate-800 mb-3">빠른 의사결정 템플릿</h3>
        <ol className="text-sm text-slate-600 list-decimal list-inside space-y-2">
          <li>시나리오에서 코히어런스 시간 <InlineMath math="T_c" />과 대역폭 <InlineMath math="W_c" />를 먼저 추정합니다.</li>
          <li>지연 제약과 하드웨어 제약에 맞는 주 다이버시티 축을 정합니다.</li>
          <li>파일럿 예산을 배정해 effective SNR 하한을 확보합니다.</li>
          <li>현실적 CSI 가정에서 outage/오류율을 재검증합니다.</li>
        </ol>
      </div>

      {/* Design Chain Synthesizer - inline interactive */}
      <div className="concept-card mb-8" id="design-chain-synthesizer">
        <h3 className="font-bold text-lg text-slate-800 mb-4">Design Chain Synthesizer: 내 시나리오를 설계 체인으로 요약</h3>
        <p className="text-sm text-slate-600 mb-4">
          5단계 설계 체인의 각 항목을 선택하면, 선택에 따른 설계 노트가 자동 생성됩니다.
        </p>

        <div className="space-y-4 mb-4">
          {/* Step 1: Detection */}
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <label className="block text-xs font-medium text-slate-600 mb-2">Step 1: 검출 가정</label>
            <div className="flex gap-2">
              <button
                onClick={() => setDetection('coherent')}
                aria-pressed={detection === 'coherent'}
                className={`px-3 py-1.5 rounded-lg text-sm border ${detection === 'coherent' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-300'}`}
              >
                코히어런트
              </button>
              <button
                onClick={() => setDetection('noncoherent')}
                aria-pressed={detection === 'noncoherent'}
                className={`px-3 py-1.5 rounded-lg text-sm border ${detection === 'noncoherent' ? 'bg-amber-600 text-white border-amber-600' : 'bg-white text-slate-600 border-slate-300'}`}
              >
                비코히어런트
              </button>
            </div>
          </div>

          {/* Step 2: Diversity Axes */}
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <label className="block text-xs font-medium text-slate-600 mb-2">Step 2: 다이버시티 축 (복수 선택 가능)</label>
            <div className="flex gap-2">
              {(['time', 'space', 'freq'] as DivAxis[]).map(axis => (
                <button
                  key={axis}
                  onClick={() => toggleAxis(axis)}
                  aria-pressed={divAxes.has(axis)}
                  className={`px-3 py-1.5 rounded-lg text-sm border ${divAxes.has(axis) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-300'}`}
                >
                  {axis === 'time' ? '시간' : axis === 'space' ? '공간' : '주파수'}
                </button>
              ))}
            </div>
          </div>

          {/* Step 4: CSI Strategy */}
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <label className="block text-xs font-medium text-slate-600 mb-2">Step 4: CSI 확보 전략</label>
            <div className="flex gap-2">
              {([['pilot-dense', '파일럿 밀집'], ['pilot-moderate', '파일럿 적정'], ['blind', '블라인드']] as [CsiStrategy, string][]).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setCsiStrategy(val)}
                  aria-pressed={csiStrategy === val}
                  className={`px-3 py-1.5 rounded-lg text-sm border ${csiStrategy === val ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-300'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Computed Recommendations */}
        <div className="space-y-2 text-sm">
          {recommendation.map((note) => (
            <div key={note} className="p-2 rounded bg-slate-50 border border-slate-200 text-slate-700">{note}</div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <div className="concept-card">
          <h3 className="font-bold text-slate-800 mb-2">다이버시티 축 요약</h3>
          <BlockMath math={String.raw`L_{\text{total}} = L_{\text{time}} \cdot L_{\text{space}} \cdot L_{\text{freq}}`} />
          <p className="text-sm text-slate-600 mt-2">
            세 축의 다이버시티 차수가 곱으로 결합됩니다.
            한 축이 제한되면 다른 축으로 보충할 수 있습니다.
          </p>
        </div>
        <div className="concept-card">
          <h3 className="font-bold text-slate-800 mb-2">유효 성능 공식</h3>
          <BlockMath math={String.raw`P_e \approx c \cdot \gamma_{\text{eff}}^{-L_{\text{total}}}`} />
          <p className="text-sm text-slate-600 mt-2">
            최종 오류 확률은 유효 SNR과 전체 다이버시티 차수로 결정됩니다.
            CSI 품질이 나쁘면 <InlineMath math={String.raw`\gamma_{\text{eff}}`} />가 낮아져 모든 다이버시티 이득이 감소합니다.
          </p>
        </div>
      </div>

      <DiversityGainVisualizer />

      <CapacityComparison />

      <div className="concept-card mb-6 mt-8" id="ch3-completion-check">
        <h3 className="font-bold text-lg text-slate-800 mb-3">Chapter 3 완료 체크리스트</h3>
        <ul className="text-sm text-slate-700 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">&#10003;</span>
            <span>고 SNR에서 diversity order가 왜 오류율 기울기를 정하는지 설명할 수 있는가</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">&#10003;</span>
            <span>시간/공간/주파수 다이버시티의 비용과 제약을 각각 설명할 수 있는가</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">&#10003;</span>
            <span>CSI 예산 기준으로 코히어런트/비코히어런트 선택을 정당화할 수 있는가</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">&#10003;</span>
            <span>시스템 제약(지연/대역폭/안테나 수)을 구체적 다이버시티 전략으로 바꿀 수 있는가</span>
          </li>
        </ul>
      </div>

      <div className="insight">
        <div className="insight-title">Appendix B 연결</div>
        <p className="text-sm text-amber-900">
          Main Plot이 수신기 설계를 요약했다면,{' '}
          <button onClick={() => onNavigate('appendix-b')} className="cross-ref !text-xs">
            Appendix B.1~B.5
          </button>
          에서는 이후 용량/코딩 논의를 위한 정보이론 배경을 정리합니다.
          DMC에서 출발해 AWGN 용량까지, 각 단계를 순서대로 따라갑니다.
        </p>
      </div>
    </section>
  );
}
