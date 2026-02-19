#!/usr/bin/env node

/**
 * Enrich strongly-verified representative papers with learner-focused content.
 *
 * Scope:
 * - 6 papers verified as strong matches in docs/paper-verification-report.json
 * - Updates only existing columns in the current remote DB schema
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { createClient } from '@supabase/supabase-js';

function loadEnv(filePath) {
  const env = {};
  if (!fs.existsSync(filePath)) return env;

  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    if (!line || line.trim().startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx < 0) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    env[key] = value;
  }
  return env;
}

const ROOT = process.cwd();
const env = loadEnv(path.join(ROOT, '.env.local'));

if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('Missing Supabase environment variables in .env.local');
  process.exit(1);
}

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const updates = [
  {
    id: '56dcc22a-13d8-4034-831b-17d2262b079a',
    update: {
      notes_summary:
        'CSI 피드백을 end-to-end 압축/복원 문제로 바꾼 출발점 논문. 이후 계열 연구의 기준선.',
      abstract:
        `이 논문은 FDD Massive MIMO에서 CSI 피드백 오버헤드를 줄이기 위해, CSI 복원을 "최적화 기반 역문제"가 아니라 "신경망 기반 표현 학습"으로 재정의한다.\n\n` +
        `UE는 CSI를 저차원 코드워드로 압축해 전송하고, BS는 디코더와 RefineNet으로 이를 복원한다. 즉, 송신단은 경량 인코더, 수신단은 상대적으로 강한 디코더를 쓰는 비대칭 구조다.\n\n` +
        `핵심 메시지는 같은 피드백 비트에서도 더 낮은 NMSE를 달성할 수 있다는 점이며, 이후 CsiNet-LSTM/CRNet/Transformer 계열 연구의 기준선을 제공했다.`,
      key_contributions: [
        'CSI 피드백 문제를 "희소 복원"에서 "학습 기반 압축-복원"으로 전환했다.',
        'UE 경량 인코더 + BS 고성능 디코더의 비대칭 배치를 통해 실제 시스템 제약을 반영했다.',
        'Coarse reconstruction 후 RefineNet으로 잔차를 보정하는 2단계 복원 구조를 제시했다.',
        '압축비 변화에 따른 성능-오버헤드 트레이드오프를 명확히 보여 주었다.',
        '후속 CSI 피드백 딥러닝 연구가 공통으로 비교하는 출발점(benchmark)을 만들었다.',
      ],
      algorithms: [
        'Angular-delay domain 변환으로 채널 구조를 정렬',
        'UE 인코더(Conv + FC)로 CSI를 저차원 코드워드로 압축',
        '코드워드만 제한된 피드백 링크로 전송',
        'BS 디코더(FC)로 coarse CSI 복원',
        'RefineNet으로 잔차를 보정해 최종 CSI 복원',
      ],
      key_equations: [
        {
          name: 'CSI 압축(인코더)',
          latex:
            '\\mathbf{s}=f_{\\mathrm{enc}}(\\mathbf{H}_a),\\quad \\mathbf{s}\\in\\mathbb{R}^{M},\\quad M=\\lfloor N_tN_c/\\gamma\\rfloor',
          description:
            'CSI를 길이 M 코드워드로 압축한다. 압축비 gamma가 커질수록 피드백 비트는 줄지만 복원 난도는 올라간다.',
        },
        {
          name: 'CSI 복원(디코더)',
          latex:
            '\\hat{\\mathbf{H}}_a=f_{\\mathrm{dec}}(\\mathbf{s})',
          description:
            'BS 디코더는 전송된 코드워드만으로 CSI를 복원하며, RefineNet이 이 복원 결과를 추가 보정한다.',
        },
        {
          name: '정규화 MSE(NMSE)',
          latex:
            '\\mathrm{NMSE}=\\mathbb{E}\\left[\\frac{\\|\\mathbf{H}_a-\\hat{\\mathbf{H}}_a\\|_2^2}{\\|\\mathbf{H}_a\\|_2^2}\\right]',
          description:
            '채널 크기 차이를 정규화한 복원 지표다. 값이 작을수록 복원이 정확하다.',
        },
      ],
      architecture_detail:
        `1) 문제 설정\n` +
        `FDD Massive MIMO에서는 UE가 다운링크 CSI를 BS로 올려야 한다. 원시 CSI를 그대로 전송하면 피드백 오버헤드가 커서 비실용적이다.\n\n` +
        `2) 핵심 구조\n` +
        `- UE: 경량 인코더로 CSI를 저차원 코드워드로 압축\n` +
        `- BS: 디코더로 복원 후 RefineNet으로 세부 패턴 보정\n` +
        `즉, 연산 부담을 BS에 더 두는 비대칭 설계다.\n\n` +
        `3) 왜 중요한가\n` +
        `기존 CS 방식은 반복 복원 최적화가 필요했고 환경 변화에 민감했다. CsiNet은 데이터 기반 매핑으로 이 과정을 대체해 실시간 배치 가능성을 높였다.\n\n` +
        `4) 학습 포인트\n` +
        `- 압축비(gamma)와 NMSE 사이의 트레이드오프\n` +
        `- RefineNet이 coarse 복원 오차를 어떻게 줄이는지\n` +
        `- UE/BS 연산 분리 설계가 실제 시스템 제약과 어떻게 맞물리는지`,
      tags: [
        'csinet',
        'autoencoder',
        'csi-feedback',
        'massive-mimo',
        'fdd',
        'foundational',
      ],
    },
  },
  {
    id: '940a456d-5c1b-4281-b716-4d4ceb6b0a7b',
    update: {
      notes_summary:
        '레이어별 민감도에 맞춰 비트를 다르게 주는 혼합정밀 양자화 CSI 피드백 프레임워크.',
      abstract:
        `이 논문은 CSI 피드백 모델을 실제 디바이스에 배포하기 위한 혼합 정밀도 양자화 전략을 제안한다.\n\n` +
        `핵심은 모든 레이어를 같은 비트폭으로 양자화하지 않고, 성능 민감도가 높은 레이어에는 높은 비트를, 덜 민감한 레이어에는 낮은 비트를 할당하는 것이다.\n\n` +
        `이로써 모델 크기와 연산량을 줄이면서도 NMSE 저하를 제한해, "성능-효율-하드웨어 제약"을 동시에 맞추는 실용적 설계를 제공한다.`,
      key_contributions: [
        'CSI 피드백 네트워크에 레이어별 비트폭을 다르게 두는 mixed-precision 설계를 도입했다.',
        '레이어 민감도 분석을 통해 "어디에 비트를 써야 이득이 큰지"를 정량화했다.',
        '하드웨어 제약(메모리/연산 예산)을 포함한 비트 할당 탐색 절차를 제시했다.',
        '고정 비트 양자화 대비 더 나은 NMSE-복잡도 트레이드오프를 보여 주었다.',
        '실서비스 배포 관점에서 양자화 설계와 모델 선택을 연결했다.',
      ],
      algorithms: [
        'FP32 기준 모델 학습',
        '레이어 민감도 측정 및 우선순위화',
        '비트 예산 하에서 레이어별 비트폭 탐색',
        '양자화 적용 후 미세조정(필요 시 QAT/STE)',
        '타깃 하드웨어 기준 성능-지연-메모리 평가',
      ],
      key_equations: [
        {
          name: '비트 예산 제약 최적화',
          latex:
            '\\min_{\\{b_l\\}}\\ \\mathrm{NMSE}(\\{b_l\\})\\ \\text{s.t.}\\ \\sum_{l=1}^{L} n_l b_l\\le B_{\\mathrm{budget}}',
          description:
            '레이어 l의 파라미터 수 n_l와 비트폭 b_l를 고려해 총 비트 예산 안에서 NMSE를 최소화한다.',
        },
        {
          name: '레이어 민감도 근사',
          latex:
            'S_l\\approx \\mathrm{NMSE}(b_l^{\\mathrm{high}})-\\mathrm{NMSE}(b_l^{\\mathrm{low}})',
          description:
            '특정 레이어 비트를 낮췄을 때 NMSE가 얼마나 악화되는지 측정해, 고비트 유지 필요도를 추정한다.',
        },
      ],
      architecture_detail:
        `1) 기본 아이디어\n` +
        `모든 레이어를 동일 비트로 양자화하면 구현은 단순하지만 성능 손실이 커질 수 있다. 이 논문은 "레이어별 중요도"를 기준으로 비트를 다르게 배정한다.\n\n` +
        `2) 실행 절차\n` +
        `- 민감도 분석으로 중요한 레이어를 먼저 식별\n` +
        `- 전체 메모리/연산 예산 내에서 비트폭 조합 탐색\n` +
        `- 양자화 후 필요 시 미세조정으로 성능 회복\n\n` +
        `3) 실무 관점 포인트\n` +
        `- 동일 모델이라도 비트 배치에 따라 NMSE와 지연이 크게 달라진다.\n` +
        `- "앞/뒤 레이어 고비트 + 중간 레이어 저비트" 같은 비균일 설계가 자주 유효하다.\n` +
        `- 배포 목표(메모리 제한, 지연 제한)에 따라 최적 조합이 바뀐다.`,
      tags: [
        'mixed-precision',
        'quantization',
        'bit-allocation',
        'hardware-aware',
        'csi-feedback',
      ],
    },
  },
  {
    id: '1485e090-8f6f-45c8-b799-57e9f230c527',
    update: {
      venue: 'CoRR (arXiv)',
      doi: '10.48550/ARXIV.2210.17323',
      notes_summary:
        '대규모 LLM을 재학습 없이 3~4bit로 낮추는 대표 PTQ. 2차 근사 기반 오차 보정이 핵심.',
      abstract:
        `GPTQ는 대규모 생성형 트랜스포머를 위한 사후 학습 양자화(PTQ) 방법이다. 추가 재학습 없이도 3~4비트 수준의 가중치 양자화를 수행해 메모리와 추론 비용을 크게 줄인다.\n\n` +
        `핵심은 양자화 대상 가중치 하나를 처리할 때, 해당 오차가 다른 가중치로 전이되는 효과를 2차 근사(역헤시안 기반)로 보정하는 것이다.\n\n` +
        `결과적으로 매우 큰 모델에서도 실용적인 시간 안에 양자화를 수행하고, 정확도 저하를 제한할 수 있다.`,
      key_contributions: [
        'LLM용 고정밀 재학습 없이 동작하는 실용적 PTQ 파이프라인을 제시했다.',
        '가중치 양자화 오차 전파를 2차 정보로 보정하는 업데이트 규칙을 도입했다.',
        '열/블록 단위 처리로 대규모 모델에 대한 계산 가능성을 확보했다.',
        '초거대 파라미터 모델까지 확장 가능한 속도-정확도 균형을 보여 주었다.',
        '후속 LLM 양자화 연구에서 기본 기준선으로 널리 사용된다.',
      ],
      algorithms: [
        '캘리브레이션 데이터로 레이어 통계 수집',
        '레이어별(또는 블록별) 가중치 순차 양자화',
        '역헤시안 근사 기반 잔여 가중치 보정',
        '양자화 순서/블록 크기 튜닝으로 오차 누적 제어',
        '최종 퍼플렉시티/다운스트림 성능 점검',
      ],
      key_equations: [
        {
          name: '국소 2차 근사 목적식',
          latex:
            '\\min_{\\hat{\\mathbf{w}}}\\ (\\mathbf{w}-\\hat{\\mathbf{w}})^\\top \\mathbf{H}(\\mathbf{w}-\\hat{\\mathbf{w}}),\\ \\hat{\\mathbf{w}}\\in\\mathcal{Q}',
          description:
            '양자화 가능한 집합 Q 내에서, 2차 근사 오차를 최소화하는 가중치를 찾는 관점이다.',
        },
        {
          name: '오차 보정 업데이트',
          latex:
            '\\delta\\mathbf{w}= -\\frac{w_q-\\mathrm{quant}(w_q)}{[\\mathbf{H}^{-1}]_{qq}}\\,(\\mathbf{H}^{-1})_{:,q}',
          description:
            '한 가중치의 양자화 오차를 나머지 가중치에 분산 보정해 전체 레이어 오차 누적을 줄인다.',
        },
      ],
      architecture_detail:
        `1) 어디가 어려운가\n` +
        `LLM은 파라미터가 매우 커서 QAT를 다시 돌리기 어렵다. PTQ만으로 정확도를 유지해야 한다.\n\n` +
        `2) GPTQ의 핵심\n` +
        `- 가중치를 순차적으로 양자화\n` +
        `- 각 단계에서 2차 근사로 오차 전이를 계산\n` +
        `- 남은 가중치를 즉시 보정해 누적 손실을 억제\n\n` +
        `3) 실무 체크리스트\n` +
        `- 캘리브레이션 데이터 분포가 실제 사용 분포와 맞는지\n` +
        `- 블록 크기/그룹 크기 설정이 하드웨어 커널과 맞는지\n` +
        `- 3bit와 4bit의 품질/속도 경계가 서비스 기준을 만족하는지`,
      tags: [
        'gptq',
        'post-training',
        'second-order',
        'llm',
        'quantization',
        'foundational',
      ],
    },
  },
  {
    id: 'e3fe0b77-8e76-4e75-9aca-7af0e3117015',
    update: {
      venue: 'CoRR (arXiv)',
      doi: '10.48550/ARXIV.2306.00978',
      notes_summary:
        '활성화 기반 중요 채널 보호로 4bit 가중치 양자화 정확도를 높인 실전형 LLM 양자화 방법.',
      abstract:
        `AWQ는 LLM 가중치 양자화에서 "모든 채널이 동등하게 중요하지 않다"는 관찰을 활용한다. 중요한 소수 채널을 보호하고 나머지를 저비트로 양자화해 정확도 손실을 줄인다.\n\n` +
        `핵심은 가중치 절대값이 아니라 활성화 통계 기반으로 중요 채널을 찾는 점이다. 즉, 실제 입력 분포에서 민감한 경로를 우선 보존한다.\n\n` +
        `이 방식은 추가 재학습 없이도 높은 품질을 유지하며, 다양한 하드웨어 백엔드에 배치하기 좋은 실용적 PTQ 흐름을 제공한다.`,
      key_contributions: [
        '활성화 기반 중요도 추정으로 양자화 민감 채널을 식별했다.',
        '소수 핵심 채널 보호 + 전체 저비트화의 결합으로 정확도/효율 균형을 맞췄다.',
        '추가 학습 없이 동작하는 PTQ 절차로 실제 배포 비용을 낮췄다.',
        '다양한 LLM 및 디바이스에서 일관된 속도 이점을 보여 주었다.',
        '실전 배치 엔진(TinyChat 등)과 연결 가능한 하드웨어 친화성을 강조했다.',
      ],
      algorithms: [
        '캘리브레이션 샘플로 활성화 분포 수집',
        '채널별 중요도(activation-aware saliency) 계산',
        '중요 채널 보호를 위한 스케일 재조정',
        '가중치 저비트 양자화 적용',
        '추론 엔진 기준 실제 지연/메모리/품질 평가',
      ],
      key_equations: [
        {
          name: '활성화 인식 스케일링',
          latex:
            'Q(\\mathbf{W}\\,\\mathrm{diag}(\\mathbf{s}))\\,\\mathrm{diag}(\\mathbf{s})^{-1}\\mathbf{X}\\approx \\mathbf{W}\\mathbf{X}',
          description:
            '양자화 전에 채널 스케일을 조정해 중요한 채널에서 발생하는 양자화 손실을 줄인다.',
        },
        {
          name: '스케일 선택 목적식',
          latex:
            '\\mathbf{s}^*=\\arg\\min_{\\mathbf{s}}\\ \\|Q(\\mathbf{W}\\,\\mathrm{diag}(\\mathbf{s}))\\,\\mathrm{diag}(\\mathbf{s})^{-1}\\mathbf{X}-\\mathbf{W}\\mathbf{X}\\|',
          description:
            '양자화 후 출력 오차를 최소화하는 채널 스케일을 선택한다.',
        },
      ],
      architecture_detail:
        `1) 문제 정의\n` +
        `LLM을 4bit 수준으로 낮추면 메모리/지연은 좋아지지만, 일부 민감 채널에서 품질이 크게 떨어질 수 있다.\n\n` +
        `2) AWQ의 해법\n` +
        `- 입력 활성화 통계로 민감 채널을 식별\n` +
        `- 민감 채널은 스케일로 보호, 나머지는 강하게 압축\n` +
        `- 추가 학습 없이 PTQ 절차로 빠르게 적용\n\n` +
        `3) 학습 포인트\n` +
        `- "큰 가중치"보다 "큰 활성화와 곱해지는 경로"가 더 중요할 수 있다.\n` +
        `- 채널 스케일링은 혼합정밀 하드웨어 없이도 효과적인 보호 수단이다.\n` +
        `- PTQ 캘리브레이션 데이터 품질이 최종 성능을 크게 좌우한다.`,
      tags: [
        'awq',
        'activation-aware',
        'weight-quantization',
        'low-bit',
        'llm',
        'hardware-friendly',
      ],
    },
  },
  {
    id: 'd1d66a0c-366e-4b26-a7a7-450e91a57f38',
    update: {
      venue: 'IEEE Wireless Communications Letters',
      doi: '10.1109/LWC.2025.3570965',
      notes_summary:
        'CSI 피드백 코드워드에 비트를 비균일 배분해 양자화 손실과 NMSE를 동시에 낮추는 설계.',
      abstract:
        `이 논문은 딥러닝 기반 CSI 피드백에서 "코드워드 모든 원소를 같은 비트로 양자화"하는 방식의 비효율을 지적한다.\n\n` +
        `대신 원소별 중요도와 분산 특성에 맞춰 비트를 다르게 배정하고, 복원 손실(NMSE)과 양자화 왜곡을 함께 고려하는 결합 손실로 학습한다.\n\n` +
        `결과적으로 동일 비트 예산에서 더 낮은 복원 오차를 달성하며, CSI 전용 양자화 설계의 실용적 기준을 제시한다.`,
      key_contributions: [
        '코드워드 원소별 중요도에 따른 비균일 비트 할당 전략을 제시했다.',
        '복원 정확도와 양자화 왜곡을 함께 다루는 결합 목적식을 설계했다.',
        '고정 비트 양자화 대비 동일 예산에서 더 나은 NMSE를 달성했다.',
        'CSI 피드백 파이프라인에 바로 연결 가능한 양자화 절차를 제안했다.',
        '비트 배치 설계가 모델 자체 성능만큼 중요함을 실험으로 보여 주었다.',
      ],
      algorithms: [
        '코드워드 통계 분석으로 원소별 중요도 추정',
        '비트 예산 하 비균일 비트 배분',
        '양자화 모듈 포함 end-to-end 결합 학습',
        '복원/NMSE와 양자화 오차를 함께 모니터링',
        '압축비별 비트 설계 재탐색 및 검증',
      ],
      key_equations: [
        {
          name: '결합 학습 손실',
          latex:
            '\\mathcal{L}=\\alpha\\log(1+\\mathrm{NMSE})+(1-\\alpha)\\|\\mathbf{s}-Q(\\mathbf{s})\\|_2^2',
          description:
            '복원 품질과 양자화 왜곡을 동시에 최소화해 한쪽만 최적화할 때 생기는 불균형을 줄인다.',
        },
        {
          name: '비균일 비트 할당 규칙(예시)',
          latex:
            'b_i^*=\\mathrm{round}\\left(\\bar b+\\tfrac{1}{2}\\log_2\\frac{\\sigma_i^2}{(\\prod_j\\sigma_j^2)^{1/M}}\\right)',
          description:
            '분산이 큰(정보량이 큰) 원소에 더 많은 비트를 배정해 전체 왜곡을 줄이는 직관을 수식화한다.',
        },
      ],
      architecture_detail:
        `1) 왜 필요한가\n` +
        `CSI 코드워드 각 원소의 분포는 균일하지 않다. 같은 비트폭을 일괄 적용하면 중요한 원소가 과소표현될 수 있다.\n\n` +
        `2) 제안 흐름\n` +
        `- 코드워드 통계로 원소 중요도/분산 추정\n` +
        `- 총 비트 예산 안에서 비균일 비트 배정\n` +
        `- 양자화 포함 결합 손실로 모델 재적응\n\n` +
        `3) 실무 적용 포인트\n` +
        `- 링크 예산이 바뀌면 비트 배치도 재최적화해야 한다.\n` +
        `- NMSE만 보지 말고 양자화 왜곡/지연도 함께 봐야 한다.\n` +
        `- 코드워드 분포가 바뀌는 환경에서는 캘리브레이션 갱신이 필요하다.`,
      tags: [
        'quantization-design',
        'bit-allocation',
        'adaptive-loss',
        'csi-feedback',
        'wireless-letters',
      ],
    },
  },
  {
    id: '098aaa64-69c4-432a-8feb-2beb2cd4f776',
    update: {
      authors: ['Kangzhi Lou', 'Han Ji', 'Xiping Wu'],
      venue: '2025 IEEE Wireless Communications and Networking Conference (WCNC)',
      doi: '10.1109/WCNC61545.2025.10978653',
      notes_summary:
        '로컬 어텐션을 오토인코더에 주입해 CSI 압축 성능과 환경 일반화를 동시에 노린 최신 계열.',
      abstract:
        `AiANet은 CSI 압축을 위한 오토인코더에 로컬 인식 셀프 어텐션을 결합한 모델이다. 합성곱의 지역 패턴 포착 능력과 어텐션의 적응적 가중을 결합해 복원 품질을 높인다.\n\n` +
        `특히 실내/실외 등 데이터 분포가 달라지는 환경에서 일반화 성능을 개선하기 위해 혼합 학습 전략을 사용한다.\n\n` +
        `핵심은 "어떤 위치/채널 정보를 더 보존해야 하는지"를 모델이 스스로 학습하게 만드는 것이며, 기존 CNN 기반 CSI 모델 대비 품질 개선을 보고한다.`,
      key_contributions: [
        'CSI 오토인코더에 local-aware self-attention을 통합했다.',
        '채널/공간 중요도를 동적으로 반영해 특징 추출의 선택성을 높였다.',
        '혼합 도메인 학습으로 환경 변화에 대한 일반화 성능을 강화했다.',
        '기존 기준 모델 대비 복원 정확도 향상 가능성을 제시했다.',
        '차세대 CSI 피드백 모델에서 attention 모듈 설계 방향을 제공했다.',
      ],
      algorithms: [
        'CNN 기반 기본 인코더 블록으로 초기 특징 추출',
        'Local-aware self-attention으로 중요 위치/채널 재가중',
        '저차원 코드워드 생성 및 피드백 전송',
        '디코더에서 attention-보강 특징으로 CSI 복원',
        '실내/실외 혼합 학습으로 도메인 일반화 향상',
      ],
      key_equations: [
        {
          name: 'Local-aware self-attention',
          latex:
            '\\mathrm{Attn}(\\mathbf{Q},\\mathbf{K},\\mathbf{V})=\\mathrm{softmax}\\left(\\frac{\\mathbf{Q}\\mathbf{K}^\\top}{\\sqrt{d_k}}+\\mathbf{M}_{\\mathrm{local}}\\right)\\mathbf{V}',
          description:
            '전역 attention에 지역 마스크를 더해 CSI에서 중요한 인접 구조를 강조한다.',
        },
        {
          name: '복원 손실(NMSE 기반)',
          latex:
            '\\mathcal{L}_{\\mathrm{rec}}=\\|\\mathbf{H}-\\hat{\\mathbf{H}}\\|_2^2\\ /\\ \\|\\mathbf{H}\\|_2^2',
          description:
            '채널 크기를 정규화한 복원 손실로 압축비 변화에서도 일관된 비교를 가능하게 한다.',
        },
      ],
      architecture_detail:
        `1) 핵심 문제\n` +
        `CSI 패턴은 위치/채널마다 중요도가 다르다. 고정 커널 중심 CNN만으로는 중요한 상호작용을 놓칠 수 있다.\n\n` +
        `2) AiANet 설계\n` +
        `- CNN 블록으로 기본 지역 특징 추출\n` +
        `- Local-aware attention으로 중요 위치/채널을 동적 강조\n` +
        `- 인코더/디코더 양쪽에서 attention 보강 표현 활용\n\n` +
        `3) 왜 학습에 도움이 되나\n` +
        `- CNN과 attention의 역할 분담을 비교 학습하기 좋다.\n` +
        `- 일반화 이슈(환경 전이)를 모델 구조와 학습 데이터 관점에서 함께 볼 수 있다.\n` +
        `- 압축비, attention 범위, 도메인 혼합 비율의 상호작용을 실험 설계로 연결하기 쉽다.`,
      tags: [
        'attention',
        'autoencoder',
        'generalization',
        'mixed-training',
        'csi-feedback',
        'wcnc-2025',
      ],
    },
  },
];

const results = [];
for (const item of updates) {
  const { data, error } = await supabase
    .from('papers')
    .update(item.update)
    .eq('id', item.id)
    .select('id,title,updated_at')
    .single();

  if (error) {
    results.push({
      id: item.id,
      ok: false,
      error: error.message,
    });
    continue;
  }

  results.push({
    id: item.id,
    ok: true,
    title: data.title,
    updated_at: data.updated_at,
  });
}

const okCount = results.filter((r) => r.ok).length;
const failCount = results.length - okCount;

console.log(`Updated papers: ${okCount}/${results.length}`);
if (failCount > 0) {
  console.log('Failures:');
  for (const row of results.filter((r) => !r.ok)) {
    console.log(`- ${row.id}: ${row.error}`);
  }
}

fs.writeFileSync(
  path.join(ROOT, 'docs', 'representative-enrichment-result.json'),
  `${JSON.stringify({ generated_at: new Date().toISOString(), results }, null, 2)}\n`,
  'utf8'
);
console.log('Wrote docs/representative-enrichment-result.json');
