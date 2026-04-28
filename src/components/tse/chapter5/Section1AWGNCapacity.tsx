'use client';

import { BlockMath, InlineMath } from 'react-katex';
import { useState, useMemo } from 'react';
import Slider from 'rc-slider';

interface Section1Props {
  onNavigate: (id: string) => void;
}

export default function Section1AWGNCapacity({ onNavigate }: Section1Props) {
  const [snrDb, setSnrDb] = useState(10);
  const [bandwidthMHz, setBandwidthMHz] = useState(20);

  const computed = useMemo(() => {
    const snrLinear = Math.pow(10, snrDb / 10);
    const capacityBps = bandwidthMHz * 1e6 * Math.log2(1 + snrLinear);
    const capacityMbps = capacityBps / 1e6;
    const spectralEfficiency = Math.log2(1 + snrLinear);
    return { snrLinear, capacityBps, capacityMbps, spectralEfficiency };
  }, [snrDb, bandwidthMHz]);

  return (
    <section id="awgn-capacity" className="section-card transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <span className="badge badge-amber">Intermediate</span>
        <span className="text-sm text-slate-400">Section 1</span>
      </div>

      <h2 className="text-3xl font-bold text-slate-900 mb-4">5.1 AWGN Channel Capacity</h2>
      <p className="text-lg text-slate-600 leading-relaxed mb-6">
        AWGN 채널에서의 Shannon capacity는 주어진 전력과 대역폭에서 달성 가능한 최대 전송률을 규정합니다.
        채널 용량은 무선 시스템 설계에서 이론적 기준선이 되며,
        모든 실용적 부호화 기법의 성능을 이 한계와 비교하여 평가합니다.
      </p>

      <div className="grid md:grid-cols-2 gap-4 mb-7">
        <div className="concept-card" id="repetition-coding-cap">
          <div className="text-xs font-semibold text-purple-600 mb-1">5.1.1 Repetition Coding</div>
          <h3 className="font-bold text-slate-800 mb-2">반복 부호화 (Repetition Coding)</h3>
          <p className="text-sm text-slate-600 mb-2">
            같은 비트를 <InlineMath math="N" />번 반복 전송하여 수신 SNR을 높이는 가장 단순한 방법입니다.
            그러나 전송률이 <InlineMath math="1/N" />으로 감소하기 때문에,
            SNR 이득과 전송률 손실 사이의 근본적인 트레이드오프가 존재합니다.
          </p>
          <BlockMath math={String.raw`R = \frac{1}{N}, \quad \text{SNR}_{\text{eff}} = N \cdot \text{SNR}`} />
        </div>
        <div className="concept-card">
          <div className="text-xs font-semibold text-violet-600 mb-1">5.1.2 Sphere Packing</div>
          <h3 className="font-bold text-slate-800 mb-2">구 패킹 논증 (Sphere Packing)</h3>
          <p className="text-sm text-slate-600 mb-2">
            <InlineMath math="N" />차원 공간에서 잡음 구(noise sphere)와 신호 구(signal sphere)의
            부피 비를 이용하여 채널 용량을 유도합니다.
            핵심 아이디어는 잡음 구가 차지하는 공간 대비 전체 신호 공간의 크기로부터
            구별 가능한 코드워드 수를 결정하는 것입니다.
          </p>
          <BlockMath math={String.raw`2^{NR} \lesssim \frac{\left(\sqrt{N(P+\sigma^2)}\right)^N}{\left(\sqrt{N\sigma^2}\right)^N}`} />
        </div>
      </div>

      <div className="concept-card mb-6">
        <div className="text-xs font-semibold text-purple-600 mb-1">5.1.1 Detail</div>
        <h4 className="font-semibold text-slate-800 mb-3">BPSK, repetition, and M-PAM comparison</h4>
        <p className="text-sm text-slate-600 mb-3">
          원고의 출발점은 두 신호점 <InlineMath math={String.raw`x_A`} />,{' '}
          <InlineMath math={String.raw`x_B`} />를 AWGN 속에서 얼마나 멀리 떨어뜨릴 수 있는가입니다.
          반복 부호는 거리를 <InlineMath math={String.raw`\sqrt{N}`} />배 키우지만,
          그 대가로 한 비트를 <InlineMath math="N" />번의 channel use에 씁니다.
        </p>
        <div className="grid md:grid-cols-3 gap-3">
          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <div className="font-semibold text-slate-700 text-sm mb-2">Uncoded BPSK</div>
            <BlockMath math={String.raw`P_e = Q\!\left(\sqrt{\frac{P}{\sigma^2}}\right), \quad R=1`} />
          </div>
          <div className="p-3 bg-white rounded-lg border border-purple-200">
            <div className="font-semibold text-purple-700 text-sm mb-2">Repetition code</div>
            <BlockMath math={String.raw`P_e = Q\!\left(\frac{\|x_A-x_B\|}{2\sigma}\right)=Q\!\left(\sqrt{\frac{NP}{\sigma^2}}\right), \quad R=\frac{1}{N}`} />
          </div>
          <div className="p-3 bg-white rounded-lg border border-violet-200">
            <div className="font-semibold text-violet-700 text-sm mb-2">M-PAM extension</div>
            <BlockMath math={String.raw`P_e \approx Q\!\left(\frac{\sqrt{NP}}{(M-1)\sigma}\right), \quad R=\frac{\log_2 M}{N}`} />
          </div>
        </div>
        <p className="text-sm text-slate-600 mt-3">
          <InlineMath math="M" />을 키워 더 많은 메시지를 넣으려 해도 오류를 작게 유지하려면
          <InlineMath math={String.raw`M`} />의 증가가 제한됩니다. 반복 구조에서는
          <InlineMath math={String.raw`R < \log_2\sqrt{N}/N \to 0`} />가 되어,
          신뢰성은 얻지만 양의 rate를 유지하지 못합니다.
        </p>
      </div>

      <div className="formula-block mb-6" id="sphere-packing-cap">
        <h4 className="font-semibold text-blue-800 mb-3">Sphere packing에서 Shannon Capacity로</h4>
        <BlockMath math={String.raw`\frac{1}{N}\log_2 \frac{\left(\sqrt{N(P+\sigma^2)}\right)^N}{\left(\sqrt{N\sigma^2}\right)^N}
= \frac{1}{2}\log_2\!\left(1+\frac{P}{\sigma^2}\right)`} />
        <div className="text-sm text-slate-600 mt-2 mb-4">
          잡음 벡터는 법칙의 큰수에 의해 반지름 <InlineMath math={String.raw`\sqrt{N\sigma^2}`} /> 근처의
          전형적 구에 놓입니다. 전체 수신 공간은 반지름{' '}
          <InlineMath math={String.raw`\sqrt{N(P+\sigma^2)}`} />의 구로 볼 수 있으므로,
          그 부피 비가 구별 가능한 코드워드 수의 지수 성장을 결정합니다.
        </div>
        <BlockMath math={String.raw`C = W \log_2\!\left(1 + \frac{P}{N_0 W}\right)`} />
        <div className="text-sm text-slate-600 mt-2">
          <InlineMath math="W" />는 대역폭(Hz), <InlineMath math="P" />는 신호 전력(W),{' '}
          <InlineMath math="N_0" />는 잡음 전력 스펙트럼 밀도입니다.
          이 공식은 AWGN 채널에서의 이론적 최대 전송률을 나타내며,
          구 패킹 논증과 랜덤 코딩 논증 모두에서 동일한 결과로 도달합니다.
        </div>
      </div>

      <div className="concept-card mb-6" id="capacity-achieving-codes">
        <div className="text-xs font-semibold text-purple-600 mb-1">Discussion 5.1</div>
        <h4 className="font-semibold text-slate-800 mb-3">Capacity-achieving code가 말해주는 것</h4>
        <p className="text-sm text-slate-600 mb-3">
          구 패킹 논증은 많은 코드워드를 넣을 수 있음을 보여주지만, 실제로 어떤 코드북을 어떻게 만들고
          디코딩할지는 알려주지 않습니다. Shannon의 랜덤 코딩도 존재성 증명에 가깝기 때문에,
          실용 시스템에는 encoding/decoding 복잡도까지 고려한 별도의 설계가 필요합니다.
        </p>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="p-3 bg-purple-50 rounded-lg border border-purple-100 text-sm">
            <div className="font-bold text-purple-700 mb-1">Geometric principle</div>
            <p className="text-slate-600">
              ML decoding은 수신 벡터에서 가장 가까운 코드워드를 고르는 nearest-neighbor 문제입니다.
              따라서 코드워드는 고차원 공간에서 서로 멀리 떨어져야 합니다.
            </p>
          </div>
          <div className="p-3 bg-violet-50 rounded-lg border border-violet-100 text-sm">
            <div className="font-bold text-violet-700 mb-1">Practical breakthrough</div>
            <p className="text-slate-600">
              Turbo code와 LDPC code는 완전한 ML 디코딩 대신 반복 디코딩을 사용해
              Shannon 한계에 가까운 성능과 구현 가능성을 동시에 확보합니다.
            </p>
          </div>
        </div>
      </div>

      <div className="concept-card mb-6" id="reliable-rate-summary">
        <div className="text-xs font-semibold text-violet-600 mb-1">Summary 5.1</div>
        <h4 className="font-semibold text-slate-800 mb-3">Reliable rate and capacity</h4>
        <p className="text-sm text-slate-600 mb-3">
          Rate <InlineMath math="R" />이 reliable하다는 말은 충분히 긴 block length에서 오류확률을
          임의로 작게 만들 수 있는 코드열이 존재한다는 뜻입니다. 반복 부호는 잡음을 평균화하지만
          rate가 0으로 가고, 좋은 고차원 코드는 같은 averaging 효과를 유지하면서 자유도를 효율적으로 씁니다.
        </p>
        <div className="formula-block !my-0 !p-4">
          <BlockMath math={String.raw`C = \sup\{R:\; R \text{ is reliable}\}, \qquad
C_{\text{real AWGN}}=\frac{1}{2}\log_2\!\left(1+\frac{P}{\sigma^2}\right)`} />
        </div>
      </div>

      <div className="formula-block mb-6">
        <h4 className="font-semibold text-blue-800 mb-3">SNR 표현</h4>
        <BlockMath math={String.raw`C = W \log_2(1 + \text{SNR}), \quad \text{SNR} = \frac{P}{N_0 W}`} />
        <div className="text-sm text-slate-600 mt-2">
          SNR이 높을수록 용량이 증가하지만, 로그 관계로 인해 수확 체감(diminishing returns) 현상이 나타납니다.
          SNR을 두 배로 올려도 용량은 약 1 bit/s/Hz만 증가합니다.
        </div>
      </div>

      {/* Capacity Calculator - inline interactive */}
      <div className="concept-card mb-6" id="capacity-calculator">
        <h3 className="font-bold text-lg text-slate-800 mb-4">
          Capacity Calculator: SNR과 대역폭이 용량에 미치는 영향
        </h3>
        <p className="text-sm text-slate-600 mb-4">
          SNR과 대역폭을 조절하여 AWGN 채널 용량의 변화를 직접 확인할 수 있습니다.
          로그 관계로 인해 SNR 증가의 효과가 점차 줄어드는 현상을 관찰합니다.
        </p>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="bg-white p-3 rounded-lg">
            <label className="block text-xs font-medium text-slate-600 mb-1">
              SNR: <span className="text-purple-700 font-bold">{snrDb} dB</span>
            </label>
            <Slider
              min={0}
              max={30}
              step={1}
              value={snrDb}
              onChange={(v) => setSnrDb(typeof v === 'number' ? v : v[0])}
              styles={{ track: { backgroundColor: '#7c3aed' }, handle: { borderColor: '#7c3aed' } }}
              aria-label="SNR in dB"
            />
          </div>
          <div className="bg-white p-3 rounded-lg">
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Bandwidth <InlineMath math="W" />: <span className="text-purple-700 font-bold">{bandwidthMHz} MHz</span>
            </label>
            <Slider
              min={1}
              max={100}
              step={1}
              value={bandwidthMHz}
              onChange={(v) => setBandwidthMHz(typeof v === 'number' ? v : v[0])}
              styles={{ track: { backgroundColor: '#7c3aed' }, handle: { borderColor: '#7c3aed' } }}
              aria-label="Bandwidth in MHz"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-3 text-sm mb-4">
          <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
            <div className="text-slate-500">채널 용량</div>
            <div className="text-lg font-bold text-purple-700">{computed.capacityMbps.toFixed(1)} Mbps</div>
          </div>
          <div className="p-3 rounded-lg bg-violet-50 border border-violet-200">
            <div className="text-slate-500">스펙트럼 효율</div>
            <div className="text-lg font-bold text-violet-700">{computed.spectralEfficiency.toFixed(2)} bits/s/Hz</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div className="text-slate-500">SNR (선형)</div>
            <div className="text-lg font-bold text-slate-700">{computed.snrLinear.toFixed(1)}</div>
          </div>
        </div>
      </div>

      <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 mb-6">
        <p className="text-sm text-amber-900">
          <strong>권장 실험:</strong> SNR을 0 dB에서 30 dB로 올릴 때 용량 변화를 관찰합니다.
          10 dB 증가마다 용량이 약 3.32 bits/s/Hz 증가하는 것을 확인할 수 있습니다.
        </p>
      </div>

      <div className="insight mt-8">
        <div className="insight-title">AWGN에서 페이딩으로</div>
        <p className="text-sm text-amber-900">
          AWGN 채널 용량은 이상적인 기준선입니다.
          실제 무선 채널에서는 페이딩으로 인해 달성 가능한 전송률이 시간에 따라 변동하며,
          이를 어떻게 다루느냐에 따라 시스템 설계가 달라집니다.{' '}
          <button onClick={() => onNavigate('resources')} className="cross-ref !text-xs">
            5.2 자원 분석
          </button>{' '}
          에서는 전력과 대역폭의 할당 문제를, {' '}
          <button onClick={() => onNavigate('fading-capacity')} className="cross-ref !text-xs">
            5.4 페이딩 채널 용량
          </button>
          에서는 페이딩이 존재할 때의 용량을 다룹니다.
        </p>
      </div>
    </section>
  );
}
