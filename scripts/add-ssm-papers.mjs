#!/usr/bin/env node
/**
 * Add 3 foundational SSM papers (HiPPO, S4, Mamba) to the Supabase database
 * and create relationships between them and existing papers.
 *
 * Run: node scripts/add-ssm-papers.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const ROOT = process.cwd();
const ENV_PATH = path.join(ROOT, '.env.local');

function loadEnv(filePath) {
  const env = {};
  if (!fs.existsSync(filePath)) return env;
  for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    if (!line || line.trim().startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx < 0) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

const env = loadEnv(ENV_PATH);
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ .env.local에서 Supabase URL/Key를 찾을 수 없습니다.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Existing paper IDs ─────────────────────────────────────────────────────
const EXISTING = {
  ATTENTION:   '291958e7-6c38-4f68-9e1e-c80bc5ddcde9', // Attention Is All You Need
  CSINET_LSTM: 'a1d157c1-5fab-4857-acf4-020b13287ff9', // CsiNet-LSTM
  TRANSNET:    'baa25ef0-3ac5-46c4-a7f4-5b3a158c3922', // TransNet
  SLATE:       'd673c34d-9197-4e17-a40c-c91ceb352d24', // SLATE
  AIANET:      '098aaa64-69c4-432a-8feb-2beb2cd4f776', // AiANet
};

// ── 3 New SSM papers ───────────────────────────────────────────────────────
const PAPERS = [
  {
    title: 'HiPPO: Recurrent Memory with Optimal Polynomial Projections',
    authors: ['Albert Gu', 'Tri Dao', 'Stefano Ermon', 'Atri Rudra', 'Christopher Ré'],
    year: 2020,
    venue: 'NeurIPS 2020 (Spotlight)',
    arxiv_id: '2008.07669',
    abstract: '연속 입력 신호의 이력을 고정 크기 N차원 상태로 최적 압축하는 HiPPO(High-order Polynomial Projection Operators) 프레임워크를 제안한다. 핵심 아이디어는 입력 이력을 직교 다항식 기저(Legendre, Laguerre 등)에 사영하고, 이 사영 계수의 시간 미분이 선형 ODE dc/dt = A(t)c(t) + B(t)f(t)를 만족함을 보인 것이다. 측도 선택에 따라 다른 메모리 특성(전체 이력 기억, 슬라이딩 윈도우, 지수 감쇠)을 얻으며, HiPPO-LegS 행렬은 그래디언트를 다항적으로만 감쇠시켜 장거리 의존성 학습에 결정적인 역할을 한다. 이 행렬은 S4, Mamba 등 모든 현대 SSM의 초기화 기반이 되었다.',
    key_contributions: [
      '입력 이력의 최적 다항식 사영 계수가 선형 ODE를 만족함을 증명',
      'HiPPO-LegS, LegT, LagT 세 가지 변형과 각각의 메모리 특성 도출',
      'HiPPO-LegS 행렬: 그래디언트 다항 감쇠 (지수 감쇠가 아닌) → 장거리 의존성 학습 가능',
      'GRU/LSTM의 게이팅이 HiPPO-LagT (N=1)의 특수 사례임을 보임',
      'sequential MNIST에서 A 행렬 초기화만으로 60% → 98% 도약',
    ],
    algorithms: ['HiPPO-LegS', 'HiPPO-LegT', 'HiPPO-LagT'],
    key_equations: [
      {
        name: 'HiPPO ODE',
        latex: '\\frac{d\\mathbf{c}(t)}{dt} = \\mathbf{A}(t)\\,\\mathbf{c}(t) + \\mathbf{B}(t)\\,f(t)',
        description: '최적 다항식 사영 계수의 시간 미분 = 선형 상태 공간 모델',
      },
      {
        name: 'HiPPO-LegS 행렬',
        latex: 'A_{nk} = \\begin{cases} -\\sqrt{(2n+1)(2k+1)} & n > k \\\\ -(n+1) & n = k \\\\ 0 & n < k \\end{cases}',
        description: 'Scaled Legendre 측도에서 도출된 하삼각 상태 행렬 (고유값: {1,2,...,N})',
      },
      {
        name: '그래디언트 경계',
        latex: '\\|dc(t_1)/df(t_0)\\| = \\Theta(1/t_1)',
        description: 'HiPPO-LegS의 그래디언트는 다항적으로만 감쇠 (LSTM: 지수 감쇠)',
      },
    ],
    architecture_detail: 'HiPPO는 아키텍처가 아닌 수학적 프레임워크이다. 연속 입력 f(t)를 측도 μ(t)에 대한 N차 직교 다항식으로 사영할 때, 사영 계수 c(t)∈R^N의 시간 미분이 선형 ODE를 만족함을 증명한다. 측도 선택에 따라: (1) LegS: μ=(1/t)·1_{[0,t]}, 전체 이력 균등 기억, 시변 시스템; (2) LegT: μ=(1/θ)·1_{[t-θ,t]}, 고정 슬라이딩 윈도우, 시불변; (3) LagT: μ=e^{-(t-x)}, 지수 감쇠, 시불변. A 행렬의 구조가 메모리 동역학을 완전히 결정한다.',
    category: 'other',
    tags: ['ssm', 'state_space_model', 'sequence_modeling', 'hippo', 'polynomial_projection', 'long_range_dependency', 'recurrent_memory'],
    pdf_url: 'https://arxiv.org/pdf/2008.07669',
    code_url: 'https://github.com/HazyResearch/hippo-code',
    color_hex: '#e11d48',
    difficulty_level: 'advanced',
    prerequisites: [
      '선형대수 (고유값 분해, 행렬 노름)',
      '직교 다항식 (Legendre, Laguerre)',
      '상미분방정식 (ODE)',
      '함수 해석학 (L2 사영, 측도론 기초)',
    ],
    learning_objectives: [
      'HiPPO 프레임워크의 핵심 정리 이해: 최적 사영 계수가 선형 ODE를 만족',
      'HiPPO-LegS 행렬의 구조와 물리적 의미 파악',
      '측도 선택 → 메모리 특성 결정 관계 이해',
      'LSTM/GRU 게이팅과 HiPPO-LagT의 수학적 연결 이해',
      '장거리 의존성에서 다항 vs 지수 그래디언트 감쇠의 차이 이해',
    ],
    self_check_questions: [
      'HiPPO-LegS 행렬의 A_{nk} 공식을 n>k, n=k, n<k 경우로 나누어 적으시오.',
      'HiPPO-LegS와 HiPPO-LagT의 메모리 특성 차이를 설명하시오.',
      'HiPPO-LagT에서 N=1인 경우가 GRU의 게이팅과 동치인 이유를 설명하시오.',
      'HiPPO-LegS의 그래디언트가 다항 감쇠인 것이 LSTM 대비 어떤 장점을 주는가?',
    ],
  },
  {
    title: 'Efficiently Modeling Long Sequences with Structured State Spaces (S4)',
    authors: ['Albert Gu', 'Karan Goel', 'Christopher Ré'],
    year: 2022,
    venue: 'ICLR 2022 (Oral)',
    arxiv_id: '2111.00396',
    abstract: 'HiPPO 기반 상태 공간 모델(SSM)을 실용적으로 만든 핵심 논문. 연속 SSM x\'(t)=Ax(t)+Bu(t), y(t)=Cx(t)+Du(t)를 이산화하면 순환(추론용, O(N)/스텝)과 컨볼루션(학습용, O(L log L) via FFT) 두 가지 모드로 동작할 수 있음을 보인다. A 행렬을 NPLR(Normal Plus Low-Rank) 형태로 분해하고 Woodbury 항등식 + Cauchy 커널을 적용하여 커널 계산을 O(N²L)에서 Õ(N+L)로 줄인다. HiPPO-LegS로 A를 초기화하면 16K 길이의 Path-X를 최초로 해결하는 등 Long Range Arena에서 평균 86%를 달성한다.',
    key_contributions: [
      '순환(추론) + 컨볼루션(학습) 이중 계산 모드 활용',
      'NPLR 분해: A = VΛV* - PQ^T → Woodbury + Cauchy 커널로 Õ(N+L) 달성',
      'LSSL 대비 30배 속도 향상, 400배 메모리 절감',
      'Long Range Arena 전 태스크 SOTA (평균 86%, Path-X 88% — 최초 해결)',
      'Transformer 대비 60배 빠른 자기회귀 생성',
    ],
    algorithms: ['S4', 'NPLR', 'DPLR', 'Cauchy kernel'],
    key_equations: [
      {
        name: 'Bilinear 이산화',
        latex: '\\bar{A} = \\left(I - \\frac{\\Delta}{2}A\\right)^{-1}\\left(I + \\frac{\\Delta}{2}A\\right)',
        description: '연속 → 이산 변환. 안정성 보존 (좌반면 → 단위원 내부).',
      },
      {
        name: 'SSM 컨볼루션 커널',
        latex: '\\bar{K} = (C\\bar{B},\\; C\\bar{A}\\bar{B},\\; \\ldots,\\; C\\bar{A}^{L-1}\\bar{B})',
        description: 'L길이 컨볼루션 커널. FFT로 O(L log L) 계산.',
      },
      {
        name: 'NPLR 분해',
        latex: 'A = V\\Lambda V^* - PQ^T',
        description: 'Normal + Low-Rank 분해. Woodbury 항등식으로 resolvent를 Cauchy 커널로 변환.',
      },
    ],
    architecture_detail: 'S4 레이어는 하나의 SSM을 래핑한다. 학습 시에는 HiPPO-LegS 초기화된 A를 NPLR로 분해한 후, 생성함수를 단위근에서 평가하여 Cauchy 커널 4회 + IFFT로 컨볼루션 커널 K를 구하고, FFT 기반 컨볼루션으로 출력을 병렬 계산한다. 추론 시에는 이산화된 (Ā,B̄,C)로 x_k = Āx_{k-1} + B̄u_k 순환을 실행하여 스텝당 O(N). 학습 가능 파라미터는 (Λ, P, Q, B, C, Δ)이며, Δ는 채널별 학습 가능한 스텝 크기로 해상도 적응을 가능하게 한다.',
    category: 'other',
    tags: ['ssm', 'state_space_model', 'sequence_modeling', 's4', 'long_range', 'nplr', 'cauchy_kernel', 'hippo'],
    pdf_url: 'https://arxiv.org/pdf/2111.00396',
    code_url: 'https://github.com/state-spaces/s4',
    color_hex: '#7c3aed',
    difficulty_level: 'advanced',
    prerequisites: [
      'HiPPO 프레임워크 (HiPPO-LegS 행렬)',
      '선형 시스템 이론 (상태 공간, 이산화, z-변환)',
      'FFT / 컨볼루션 정리',
      'Woodbury 행렬 항등식',
    ],
    learning_objectives: [
      'SSM의 순환 모드와 컨볼루션 모드가 등가인 이유 이해',
      'Bilinear 이산화가 안정성을 보존하는 원리 파악',
      'NPLR 분해가 커널 계산을 어떻게 Cauchy 커널로 변환하는지 이해',
      'HiPPO 초기화가 왜 결정적인지 설명할 수 있어야 함',
      'Long Range Arena에서 Transformer 대비 S4의 우위 원인 분석',
    ],
    self_check_questions: [
      'Bilinear 이산화 공식에서 Ā와 B̄를 A, B, Δ로 표현하시오.',
      'SSM 컨볼루션 커널 K̄의 i번째 원소가 CĀ^iB̄인 이유를 순환 전개로 보이시오.',
      'NPLR 분해 후 Woodbury 항등식을 적용하면 왜 Cauchy 커널이 등장하는가?',
      'S4가 Path-X (16K 시퀀스)를 해결하고 Transformer가 실패하는 근본 원인은?',
    ],
  },
  {
    title: 'Mamba: Linear-Time Sequence Modeling with Selective State Spaces',
    authors: ['Albert Gu', 'Tri Dao'],
    year: 2024,
    venue: 'ICLR 2024',
    arxiv_id: '2312.00752',
    abstract: 'S4의 시불변(LTI) 한계를 극복하는 선택적 상태 공간 모델(S6)을 제안한다. 핵심 혁신은 SSM 파라미터 B, C, Δ를 입력의 함수로 만들어 토큰 단위로 기억/망각을 결정하는 선택(selection) 메커니즘이다. 이로써 LTI 시스템의 컨볼루션 모드는 사용할 수 없게 되지만, FlashAttention에서 영감을 받은 하드웨어 인식 병렬 스캔 알고리즘으로 효율적 학습을 달성한다. Transformer의 Attention+MLP를 단일 Mamba 블록으로 대체하는 간결한 아키텍처를 제시하며, 언어 모델링에서 Mamba-3B가 Transformer-3B를 능가하고 Transformer-7B에 필적하는 성능을 Transformer 대비 5배 빠른 추론 속도로 달성한다.',
    key_contributions: [
      '선택적 SSM: B, C, Δ를 입력 의존적으로 만든 content-aware 추론',
      'Δ가 기억/망각 게이트 역할: 큰 Δ → 리셋, 작은 Δ → 유지',
      '하드웨어 인식 선택적 스캔: 커널 퓨전 + 병렬 결합 스캔 + 역방향 재계산',
      'Mamba 블록 = Attention + MLP 통합 (단일 동질 블록)',
      'Transformer 대비 5배 추론 처리량, O(L) 스케일링 (vs O(L²))',
      'Mamba-2.8B ≈ Transformer-6.9B (언어, 오디오, DNA 다중 모달리티)',
    ],
    algorithms: ['Selective SSM (S6)', 'Selective Scan', 'Parallel Associative Scan'],
    key_equations: [
      {
        name: '선택적 파라미터',
        latex: 'B_t = S_B(x_t),\\; C_t = S_C(x_t),\\; \\Delta_t = \\text{softplus}(S_\\Delta(x_t))',
        description: 'B, C, Δ가 입력 x_t의 함수 (Linear projection)',
      },
      {
        name: '선택적 SSM 순환',
        latex: 'h_t = \\bar{A}_t\\,h_{t-1} + \\bar{B}_t\\,x_t,\\quad y_t = C_t\\,h_t',
        description: '시변 순환. Ā_t = exp(Δ_t A), B̄_t ≈ Δ_t B_t (ZOH 이산화)',
      },
      {
        name: 'GRU 동치 (N=1)',
        latex: 'g_t = \\sigma(\\text{Linear}(x_t)),\\; h_t = (1-g_t)h_{t-1} + g_t x_t',
        description: 'N=1, A=-1, B=1일 때 선택적 SSM = GRU 게이팅',
      },
    ],
    architecture_detail: 'Mamba 블록: 입력 x(B,L,D)를 두 가지 경로로 분기. 경로1: Linear(D→2D) → Conv1d(k=4, causal) → SiLU → Selective SSM → 곱셈. 경로2: Linear(D→2D) → SiLU → 곱셈. 합류 후 Linear(2D→D) → 출력. 확장 비율 E=2, 상태 차원 N=16. Transformer의 Attention+MLP 두 블록을 단일 블록으로 대체. 하드웨어 인식 선택적 스캔: (1) 이산화+순환+출력을 GPU SRAM에서 단일 커널로 퓨전 (HBM 접근 O(N)배 감소); (2) 병렬 결합(prefix) 스캔으로 GPU 병렬화; (3) 역방향에서 중간 상태 재계산 (FlashAttention 방식).',
    category: 'other',
    tags: ['ssm', 'state_space_model', 'sequence_modeling', 'mamba', 'selective_ssm', 'hardware_aware', 'linear_time', 'language_model'],
    pdf_url: 'https://arxiv.org/pdf/2312.00752',
    code_url: 'https://github.com/state-spaces/mamba',
    color_hex: '#d97706',
    difficulty_level: 'advanced',
    prerequisites: [
      'S4: 구조화된 상태 공간 모델',
      'HiPPO 프레임워크 (A 행렬 초기화)',
      'GPU 메모리 계층 (HBM vs SRAM)',
      'Transformer 아키텍처 (비교 대상)',
    ],
    learning_objectives: [
      '선택 메커니즘이 왜 LTI SSM의 한계를 극복하는지 이해',
      'Δ의 크기가 기억/망각을 제어하는 원리 파악',
      'LTI 깨짐 → 컨볼루션 불가 → 하드웨어 인식 스캔으로 해결하는 흐름 이해',
      'Mamba 블록이 Attention+MLP를 어떻게 대체하는지 설명',
      'Selective Copying과 Induction Heads 태스크에서 LTI 실패 원인 분석',
    ],
    self_check_questions: [
      'S4에서 B, C, Δ가 고정인 것과 Mamba에서 입력 의존적인 것의 차이를 설명하시오.',
      'Δ가 클 때와 작을 때 각각 은닉 상태 h_t에 어떤 효과가 있는지 수식으로 보이시오.',
      '선택적 SSM이 컨볼루션 모드를 사용할 수 없는 이유는 무엇인가?',
      'Mamba의 하드웨어 인식 알고리즘에서 커널 퓨전이 왜 20-40배 가속을 주는가?',
    ],
  },
];

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  console.log('🚀 SSM 논문 3개 추가 시작...\n');

  // 1. Insert papers
  const insertedIds = {};
  for (const paper of PAPERS) {
    // Check if already exists
    const { data: existing } = await supabase
      .from('papers')
      .select('id, title')
      .ilike('title', `%${paper.title.substring(0, 30)}%`);

    if (existing && existing.length > 0) {
      console.log(`⏭️  이미 존재: ${existing[0].title.substring(0, 60)}... (id: ${existing[0].id})`);
      insertedIds[paper.arxiv_id] = existing[0].id;
      continue;
    }

    const { data, error } = await supabase
      .from('papers')
      .insert(paper)
      .select('id, title')
      .single();

    if (error) {
      console.error(`❌ 삽입 실패: ${paper.title.substring(0, 50)}...`, error.message);
      continue;
    }

    console.log(`✅ 추가: ${data.title.substring(0, 60)}... (id: ${data.id})`);
    insertedIds[paper.arxiv_id] = data.id;
  }

  const HIPPO_ID = insertedIds['2008.07669'];
  const S4_ID = insertedIds['2111.00396'];
  const MAMBA_ID = insertedIds['2312.00752'];

  if (!HIPPO_ID || !S4_ID || !MAMBA_ID) {
    console.error('❌ 일부 논문 ID를 얻지 못했습니다. 관계 추가를 건너뜁니다.');
    console.log('IDs:', { HIPPO_ID, S4_ID, MAMBA_ID });
    return;
  }

  console.log('\n📎 관계 추가 시작...\n');

  // 2. Insert relationships
  const RELATIONSHIPS = [
    // HiPPO → S4
    {
      from_paper_id: HIPPO_ID,
      to_paper_id: S4_ID,
      relationship_type: 'inspires',
      description: 'S4는 HiPPO-LegS 행렬로 A를 초기화하며, HiPPO의 최적 메모리 이론을 실용적 딥러닝 레이어로 변환한다. NPLR 분해로 HiPPO 행렬의 특수 구조를 활용해 효율적 계산을 달성.',
      strength: 10,
    },
    // S4 → Mamba
    {
      from_paper_id: S4_ID,
      to_paper_id: MAMBA_ID,
      relationship_type: 'inspires',
      description: 'Mamba는 S4의 SSM 구조를 계승하되, 시불변(LTI) 제약을 제거하고 B, C, Δ를 입력 의존적으로 만든 선택적 SSM으로 발전시킨다. HiPPO 초기화는 유지.',
      strength: 10,
    },
    // HiPPO → Mamba
    {
      from_paper_id: HIPPO_ID,
      to_paper_id: MAMBA_ID,
      relationship_type: 'inspires',
      description: 'Mamba의 A 행렬 초기화는 여전히 HiPPO에 기반한다. HiPPO의 최적 메모리 이론이 선택적 SSM에서도 장거리 의존성의 기반이 된다.',
      strength: 7,
    },
    // Attention Is All You Need → S4 (S4 challenges attention)
    {
      from_paper_id: S4_ID,
      to_paper_id: EXISTING.ATTENTION,
      relationship_type: 'challenges',
      description: 'S4는 Self-Attention의 O(L²) 복잡도 없이 16K 길이 시퀀스(Path-X)를 최초로 해결하며, 장거리 시퀀스 모델링에서 Transformer의 대안을 제시한다.',
      strength: 8,
    },
    // Mamba → Attention Is All You Need (challenges)
    {
      from_paper_id: MAMBA_ID,
      to_paper_id: EXISTING.ATTENTION,
      relationship_type: 'challenges',
      description: 'Mamba는 Attention 없이 언어 모델링에서 Transformer에 필적하는 성능을 5배 빠른 추론 속도로 달성하며, Transformer 아키텍처의 필수성에 의문을 제기한다.',
      strength: 9,
    },
    // Mamba → SLATE (related: SSM for CSI temporal modeling)
    {
      from_paper_id: MAMBA_ID,
      to_paper_id: EXISTING.SLATE,
      relationship_type: 'related',
      description: 'SLATE는 SwinLSTM으로 시변 CSI의 시간적 상관성을 모델링한다. Mamba의 선택적 SSM은 LSTM/RNN 계열의 시퀀스 모델링을 발전시킨 것으로, CSI 시변 피드백에 적용 가능한 대안 아키텍처이다.',
      strength: 5,
    },
    // Mamba → TransNet (related: sequence modeling comparison)
    {
      from_paper_id: MAMBA_ID,
      to_paper_id: EXISTING.TRANSNET,
      relationship_type: 'related',
      description: 'TransNet은 CSI 피드백에 Transformer(Self-Attention)를 적용한다. Mamba는 Attention 없이 동등 이상의 시퀀스 모델링을 제공하며, CSI 피드백에서 Transformer 대비 효율적 대안이 될 수 있다.',
      strength: 5,
    },
  ];

  let relOk = 0;
  for (const rel of RELATIONSHIPS) {
    const { error } = await supabase
      .from('paper_relationships')
      .insert(rel);

    if (error) {
      if (error.message?.includes('duplicate') || error.code === '23505') {
        console.log(`⏭️  이미 존재하는 관계: ${rel.description.substring(0, 50)}...`);
      } else {
        console.error(`❌ 관계 삽입 실패:`, error.message);
      }
    } else {
      relOk++;
      console.log(`✅ 관계: ${rel.relationship_type} (strength ${rel.strength})`);
    }
  }

  console.log(`\n🎉 완료! 논문 3개, 관계 ${relOk}/${RELATIONSHIPS.length}개 추가.`);
  console.log('\n📋 추가된 논문 ID:');
  console.log(`   HiPPO: ${HIPPO_ID}`);
  console.log(`   S4:    ${S4_ID}`);
  console.log(`   Mamba: ${MAMBA_ID}`);
}

main().catch(console.error);
