'use client';

import { BlockMath, InlineMath } from 'react-katex';
import GaussianDetectionEstimationLab from '@/components/tse/interactive/GaussianDetectionEstimationLab';

interface Section5Props {
  onNavigate: (id: string) => void;
}

export default function Section5ChannelUncertainty({ onNavigate }: Section5Props) {
  return (
    <section id="channel-uncertainty" className="section-card transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <span className="badge badge-red">Advanced</span>
        <span className="text-sm text-slate-400">Section 5</span>
      </div>

      <h2 className="text-3xl font-bold text-slate-900 mb-4">3.5 Impact of Channel Uncertainty</h2>
      <p className="text-lg text-slate-600 leading-relaxed mb-6">
        앞선 절의 코히어런트 검출 성능은 CSI(Channel State Information)가 정확하다는 가정 위에 있습니다.
        현실에서는 채널 추정에 자원(파일럿)을 써야 하고, 추정 오차가 반드시 존재합니다.
        이 절에서는 CSI 품질이 검출 성능에 미치는 영향을 정량화하고,
        코히어런트/비코히어런트 검출 선택의 기준을 정리합니다.
      </p>

      <div className="concept-card mb-6" id="pilot-estimation">
        <h4 className="font-semibold text-slate-800 mb-2">3.5.1 파일럿 기반 채널 추정</h4>
        <p className="text-sm text-slate-600 mb-3">
          수신기가 채널을 추정하려면 송신 측에서 알려진 심볼(파일럿)을 보내야 합니다.
          파일럿 개수 <InlineMath math="N_p" />와 파일럿 SNR <InlineMath math={String.raw`\gamma_p`} />가
          추정 품질을 결정합니다.
        </p>
        <BlockMath math={String.raw`y_p = h\, x_p + w_p`} />
        <div className="formula-block !my-4 !p-4">
          <h4 className="font-semibold text-blue-800 mb-2">추정 오차 분산</h4>
          <BlockMath math={String.raw`\sigma_e^2 \approx \frac{1}{1 + N_p \gamma_p}`} />
          <p className="text-sm text-slate-600 mt-2">
            파일럿 수가 많거나 파일럿 SNR이 높을수록 추정 오차가 줄어듭니다.
            다만 파일럿에 쓰는 자원은 데이터 전송에 쓸 수 없으므로 오버헤드가 발생합니다.
          </p>
        </div>
        <div className="formula-block !my-4 !p-4">
          <h4 className="font-semibold text-blue-800 mb-2">파일럿 오버헤드 비율 설계</h4>
          <BlockMath math={String.raw`\alpha_p = \frac{N_p}{N_p + N_d} \;\gtrsim\; \frac{1}{T_c \cdot W}`} />
          <p className="text-sm text-slate-600 mt-2">
            채널이 빠를수록 (<InlineMath math="T_c" /> 짧을수록) 더 자주 파일럿을 전송해야 합니다.
            주파수 선택적 채널에서는 추가로 <InlineMath math="W/W_c" />개 이상의 파일럿 위치가 필요합니다.
            오버헤드 <InlineMath math={String.raw`\alpha_p`} />가 크면 데이터 처리율이 <InlineMath math={String.raw`(1-\alpha_p)`} /> 배로 줄어드는 비용이 발생합니다.
          </p>
        </div>
      </div>

      <div className="concept-card mb-6" id="effective-snr">
        <h4 className="font-semibold text-slate-800 mb-2">3.5.2 유효 SNR 페널티</h4>
        <p className="text-sm text-slate-600 mb-3">
          채널 추정 오차가 있으면, 데이터 구간의 nominal SNR이 높아도 실제 성능은 이에 미치지 못합니다.
          유효 SNR은 다음과 같이 감소합니다.
        </p>
        <div className="formula-block !my-4 !p-4">
          <h4 className="font-semibold text-blue-800 mb-2">Effective SNR</h4>
          <BlockMath math={String.raw`\gamma_{\text{eff}} \approx \frac{\gamma_d}{1 + \gamma_d \sigma_e^2}`} />
          <p className="text-sm text-slate-600 mt-2">
            <InlineMath math={String.raw`\gamma_d`} />가 아무리 커져도,{' '}
            <InlineMath math={String.raw`\gamma_{\text{eff}}`} />는{' '}
            <InlineMath math={String.raw`1/\sigma_e^2`} />에서 포화됩니다.
            즉 추정 오차가 성능 상한을 결정합니다.
          </p>
        </div>
        <div className="p-4 bg-red-50 rounded-lg border border-red-200 mt-3">
          <p className="text-sm text-red-800">
            <strong>핵심 메시지:</strong> nominal SNR을 올리는 것은 좋은 채널 추정이 뒷받침될 때만 효과적입니다.
            추정 오차가 크면 전력을 아무리 올려도 성능이 정체됩니다.
          </p>
        </div>
      </div>

      <div className="compare-grid mb-6" id="coherent-vs-noncoherent">
        <div className="compare-item border-blue-200 bg-blue-50/50">
          <h3 className="font-bold text-lg text-blue-800 mb-2">코히어런트 검출</h3>
          <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
            <li>잠재 성능이 높음 (거리 기반 판정)</li>
            <li>파일럿 오버헤드가 필요함</li>
            <li>빠른 채널에서 추적 주기를 맞춰야 함</li>
          </ul>
          <p className="text-xs text-slate-500 mt-2">
            적합: 안정적 채널 + 충분한 파일럿 예산
          </p>
        </div>
        <div className="compare-item border-emerald-200 bg-emerald-50/50">
          <h3 className="font-bold text-lg text-emerald-800 mb-2">비코히어런트 검출</h3>
          <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
            <li>채널 추정 부담이 적음</li>
            <li>거리 기반 검출 이득 미활용</li>
            <li>에너지 기반이라 성능 열위</li>
          </ul>
          <p className="text-xs text-slate-500 mt-2">
            적합: 빠른 채널 + 파일럿 예산 부족
          </p>
        </div>
      </div>

      <GaussianDetectionEstimationLab />

      <div className="insight mt-8 mb-6">
        <div className="insight-title">권장 실험</div>
        <ol className="text-sm text-amber-900 list-decimal list-inside space-y-1">
          <li>파일럿 수를 바꿔 추정 MSE 변화를 확인합니다.</li>
          <li>MSE 변화를 effective SNR 변화로 환산해봅니다.</li>
          <li>같은 nominal SNR에서 결정 경계 차이를 비교합니다.</li>
        </ol>
      </div>

      <div className="concept-card mb-6" id="csi-design-rules">
        <h4 className="font-semibold text-slate-800 mb-2">3.5.4 설계 규칙</h4>
        <div className="space-y-2 text-sm">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="font-bold text-slate-700">규칙 1:</span>{' '}
            <span className="text-slate-600">채널이 빠를수록 파일럿 밀도 또는 추적 정밀도를 높여야 합니다.</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="font-bold text-slate-700">규칙 2:</span>{' '}
            <span className="text-slate-600">파일럿 오버헤드는 처리율 목표와 함께 최적화해야 합니다.</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="font-bold text-slate-700">규칙 3:</span>{' '}
            <span className="text-slate-600">
              알고리즘 선택은 이상적 CSI가 아니라 달성 가능한 CSI 품질 기준으로 해야 합니다.
            </span>
          </div>
        </div>
      </div>

      <div className="insight">
        <div className="insight-title">Chapter 3 통합으로</div>
        <p className="text-sm text-amber-900">
          검출(3.1), 시간(3.2), 공간(3.3), 주파수(3.4) 다이버시티, 그리고 채널 불확실성(3.5)까지 다루었습니다.{' '}
          <button onClick={() => onNavigate('ch3-main-plot')} className="cross-ref !text-xs">
            3.6 메인 플롯
          </button>
          에서 이 모든 것을 하나의 설계 체크리스트로 통합합니다.
        </p>
      </div>
    </section>
  );
}
