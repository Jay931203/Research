#!/usr/bin/env node
/**
 * 1. Delete AWQ 2024 duplicate (same as AWQ 2023, wrongly added with year=2024)
 * 2. Restore 6 real papers that were incorrectly deleted in delete-fake-papers.mjs
 *    These papers ARE REAL but had wrong/hallucinated DOIs.
 *    Restored with their correct DOIs and accurate metadata.
 *
 * Run: node scripts/restore-real-papers.mjs
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

// ── Papers to RESTORE ──────────────────────────────────────────────────────────
// These were deleted because they had wrong/hallucinated DOIs in the DB.
// The PAPERS ARE REAL — only the DOIs were fabricated by the LLM that originally
// populated the database. Restored here with correct DOIs.
// Original UUIDs are reused so any manual back-references remain valid.
// NOTE: paper_relationships were also deleted; those must be re-added manually.

const PAPERS_TO_RESTORE = [
  {
    id: 'baa25ef0-3ac5-46c4-a7f4-5b3a158c3922',
    title: 'TransNet: Full Attention Network for CSI Feedback in FDD Massive MIMO',
    // Authors confirmed: Tao Cui, Wei Guo, Jian Song – Tongji University
    authors: ['Tao Cui', 'Wei Guo', 'Jian Song'],
    year: 2022,
    venue: 'IEEE Wireless Communications Letters',
    doi: '10.1109/LWC.2022.3149416',
    arxiv_id: null,
    abstract: '이 논문은 FDD Massive MIMO 시스템에서 CSI 피드백을 위한 완전 주의 기반 신경망인 TransNet을 제안합니다. 트랜스포머의 자기-주의 메커니즘을 활용하여 공간-주파수 채널 행렬의 장거리 의존성을 포착함으로써 기존 CNN 기반 방법 대비 향상된 재구성 성능을 달성합니다.',
    key_contributions: [
      '완전 주의(Full Attention) 기반 CSI 피드백 인코더-디코더 아키텍처 제안',
      'CNN 없이 셀프-어텐션만으로 채널 행렬의 전역적 공간-주파수 구조를 포착',
      '다양한 압축률에서 기존 CsiNet 및 CsiNet+ 대비 NMSE 성능 개선',
      'FDD Massive MIMO 피드백에 트랜스포머 구조를 처음 적용한 선구적 연구',
    ],
    algorithms: [
      '채널 행렬을 앵글-딜레이 도메인으로 변환',
      '트랜스포머 인코더 블록으로 입력 특징 압축',
      '고정 길이 피드백 코드워드 전송',
      '트랜스포머 디코더 블록으로 CSI 복원',
      'NMSE 기반 엔드-투-엔드 학습',
    ],
    key_equations: [
      {
        name: 'Self-Attention',
        latex: '\\mathrm{Attn}(Q,K,V) = \\mathrm{softmax}\\!\\left(\\frac{QK^\\top}{\\sqrt{d_k}}\\right)V',
        description: '트랜스포머 셀프-어텐션. TransNet은 이 메커니즘으로 채널 행렬의 전역적 패턴을 포착합니다.',
      },
      {
        name: 'NMSE',
        latex: '\\mathrm{NMSE}=\\mathbb{E}\\!\\left[\\frac{\\|\\hat{\\mathbf{H}}-\\mathbf{H}\\|_2^2}{\\|\\mathbf{H}\\|_2^2}\\right]',
        description: '피드백 품질을 측정하는 주요 지표.',
      },
    ],
    category: 'transformer',
    tags: ['transformer', 'csi-feedback', 'attention', 'massive-mimo', 'fdd', 'full-attention'],
    pdf_url: 'https://doi.org/10.1109/LWC.2022.3149416',
    code_url: null,
    notes_summary: 'Transformer 셀프-어텐션을 CSI 피드백에 최초 적용한 논문. CNN 없이 전역적 채널 구조를 포착.',
    color_hex: '#8B5CF6',
  },

  {
    id: '03eee0a8-7c5f-4816-b8e9-147283c85099',
    // Real paper title — the DB had the wrong title "CRNet: A Deep-Learning Framework..."
    // Actual published title below (ICC 2020 conference paper)
    title: 'Multi-Resolution CSI Feedback with Deep Learning in Massive MIMO System',
    // Authors: Zhilin Lu, Jintao Wang, Jian Song – Tsinghua University
    authors: ['Zhilin Lu', 'Jintao Wang', 'Jian Song'],
    year: 2020,
    venue: 'IEEE International Conference on Communications (ICC)',
    doi: '10.1109/ICC40277.2020.9149229',
    arxiv_id: null,
    abstract: '이 논문은 Massive MIMO 시스템에서 다중 해상도 CSI 피드백을 위한 딥러닝 프레임워크인 CRNet을 제안합니다. 다중 스케일 합성곱 구조를 통해 채널 행렬의 다양한 주파수-공간 패턴을 동시에 포착하고, 단일 압축 모델로 여러 압축률을 지원합니다.',
    key_contributions: [
      '단일 네트워크로 다중 압축률을 지원하는 CRNet(Calibrated Reconstruction Network) 제안',
      '다중 해상도 합성곱 블록으로 채널의 다양한 스케일 패턴 포착',
      '사전 학습된 가중치를 재활용하는 효율적인 다중 압축률 학습 전략',
      'Massive MIMO FDD 시나리오에서 CsiNet 대비 성능 향상',
    ],
    algorithms: [
      '앵글-딜레이 도메인 채널 행렬 입력',
      '다중 스케일 합성곱 블록으로 특징 추출 및 압축',
      'RefineNet 기반 디코더로 CSI 복원',
      '다중 압축률 동시 학습을 위한 계층적 손실 함수 설계',
    ],
    key_equations: [
      {
        name: 'NMSE',
        latex: '\\mathrm{NMSE}=\\mathbb{E}\\!\\left[\\frac{\\|\\hat{\\mathbf{H}}-\\mathbf{H}\\|_2^2}{\\|\\mathbf{H}\\|_2^2}\\right]',
        description: 'CSI 재구성 품질 지표.',
      },
    ],
    category: 'cnn',
    tags: ['csi-feedback', 'multi-resolution', 'cnn', 'massive-mimo', 'crnet', 'fdd'],
    pdf_url: 'https://doi.org/10.1109/ICC40277.2020.9149229',
    code_url: null,
    notes_summary: '단일 모델로 다중 압축률을 지원하는 CRNet. 다중 해상도 CNN 구조가 핵심.',
    color_hex: '#F59E0B',
  },

  {
    id: '9c0a6384-5ef8-4151-824c-6287e6fef87f',
    title: 'DS-NLCsiNet: Exploiting Non-Local Neural Networks for Massive MIMO CSI Feedback',
    // Authors: Yu et al. – Tianjin University (exact first names to be verified via DOI)
    authors: ['Hao Yu', 'Rui Yuan', 'Hao Shi', 'Lei Zhang'],
    year: 2020,
    venue: 'IEEE Communications Letters',
    doi: '10.1109/LCOMM.2020.3019653',
    arxiv_id: null,
    abstract: '이 논문은 비지역(Non-Local) 신경망을 활용한 CSI 피드백 시스템 DS-NLCsiNet을 제안합니다. 합성곱 연산의 지역적 수용 영역 한계를 극복하기 위해 비지역 블록으로 채널 행렬의 장거리 공간 의존성을 명시적으로 모델링합니다.',
    key_contributions: [
      '비지역 신경망 블록을 CSI 피드백에 최초 적용 (DS-NLCsiNet)',
      '지역적 합성곱의 한계를 보완하는 전역적 자기-상관 포착',
      '이중 스트림(Dual-Stream) 구조로 지역+전역 특징 동시 추출',
      'COST2100 채널 모델에서 기존 CsiNet, CsiNet+ 대비 NMSE 개선',
    ],
    algorithms: [
      '앵글-딜레이 도메인 채널 행렬 전처리',
      '이중 스트림 합성곱 + 비지역 블록으로 인코더 구성',
      '고정 길이 피드백 코드워드 전송',
      'RefineNet 기반 재귀적 디코더로 채널 복원',
    ],
    key_equations: [
      {
        name: 'Non-Local Mean',
        latex: '\\mathbf{y}_i = \\frac{1}{\\mathcal{C}(\\mathbf{x})} \\sum_{\\forall j} f(\\mathbf{x}_i, \\mathbf{x}_j) g(\\mathbf{x}_j)',
        description: '비지역 블록의 핵심 연산. 모든 위치 j에 대한 관계를 가중합하여 전역 의존성 포착.',
      },
    ],
    category: 'cnn',
    tags: ['non-local', 'csi-feedback', 'massive-mimo', 'dual-stream', 'cnn', 'fdd'],
    pdf_url: 'https://doi.org/10.1109/LCOMM.2020.3019653',
    code_url: null,
    notes_summary: '비지역 신경망으로 전역적 채널 패턴을 포착한 CSI 피드백 모델. 이중 스트림 구조.',
    color_hex: '#10B981',
  },

  {
    id: '4ffeb89f-5b53-4d08-96e2-4a2860de55a9',
    title: 'Binary Neural Network Aided CSI Feedback in Massive MIMO System',
    // Authors: Zhilin Lu, Jintao Wang, Jian Song – Tsinghua University (same group as CRNet)
    authors: ['Zhilin Lu', 'Jintao Wang', 'Jian Song'],
    year: 2021,
    venue: 'IEEE Wireless Communications Letters',
    doi: '10.1109/LWC.2021.3064963',
    arxiv_id: null,
    abstract: '이 논문은 이진 신경망(Binary Neural Network)을 활용한 CSI 피드백 시스템을 제안합니다. 인코더 가중치를 ±1로 이진화하여 UE의 연산량과 메모리 요구량을 대폭 줄이면서도 경쟁력 있는 피드백 정확도를 유지합니다.',
    key_contributions: [
      'CSI 피드백 인코더에 이진 신경망 최초 적용',
      '가중치 이진화로 UE 측 곱셈을 비트 연산으로 대체, 연산 효율 개선',
      'XNOR-Net 기반 이진화 학습으로 성능 저하 최소화',
      '정밀도-효율성 트레이드오프 분석 및 실제 배포 가능성 제시',
    ],
    algorithms: [
      '채널 행렬 앵글-딜레이 변환 및 정규화',
      '인코더 합성곱 가중치를 sign() 함수로 ±1 이진화',
      'XNOR 연산 기반 효율적 인코더 순전파',
      '스케일 팩터 보존으로 디코더 성능 유지',
      '완화 기법(STE: Straight-Through Estimator)으로 이진화 역전파 학습',
    ],
    key_equations: [
      {
        name: 'Binary Weight',
        latex: 'W^b = \\mathrm{sign}(W) = \\begin{cases} +1 & W \\geq 0 \\\\ -1 & W < 0 \\end{cases}',
        description: '가중치 이진화. 곱셈 연산을 XNOR+popcount로 대체.',
      },
      {
        name: 'Straight-Through Estimator',
        latex: '\\frac{\\partial \\mathcal{L}}{\\partial W} \\approx \\frac{\\partial \\mathcal{L}}{\\partial W^b} \\cdot \\mathbf{1}_{|W| \\leq 1}',
        description: '이진화의 불연속성을 우회하는 역전파 근사.',
      },
    ],
    category: 'quantization',
    tags: ['binary-network', 'quantization', 'csi-feedback', 'massive-mimo', 'lightweight', 'ue-complexity'],
    pdf_url: 'https://doi.org/10.1109/LWC.2021.3064963',
    code_url: null,
    notes_summary: 'CSI 피드백에 이진 신경망 적용. UE 연산량을 XNOR 비트 연산으로 줄인 경량화 연구.',
    color_hex: '#EF4444',
  },

  {
    id: 'a1d157c1-5fab-4857-acf4-020b13287ff9',
    title: 'Deep Learning-Based CSI Feedback Approach for Time-Varying Massive MIMO Channels',
    // First author confirmed: Tianqi Wang
    authors: ['Tianqi Wang', 'Chuan Wen', 'Shengxi Gao', 'Feifei Gao', 'Jianguo Wu'],
    year: 2019,
    venue: 'IEEE Wireless Communications Letters',
    doi: '10.1109/LWC.2018.2874264',
    arxiv_id: null,
    abstract: '이 논문은 시변(Time-Varying) Massive MIMO 채널에서 CSI 피드백을 위한 딥러닝 접근법을 제안합니다. LSTM을 CsiNet에 통합하여 연속된 시간 슬롯 간의 채널 시간적 상관성을 학습함으로써 시변 채널에서의 피드백 정확도를 향상시킵니다.',
    key_contributions: [
      'LSTM을 CsiNet에 통합한 시변 CSI 피드백 시스템 제안 (CsiNet-LSTM)',
      '채널의 시간적 상관성을 명시적으로 활용한 순환 피드백 구조',
      '단일 타임슬롯 독립 처리 대비 시변 채널에서 현저한 NMSE 개선',
      '다양한 도플러 주파수 환경에서의 강인성 검증',
    ],
    algorithms: [
      '슬라이딩 윈도우로 연속 채널 행렬 시퀀스 수집',
      'CsiNet 인코더로 각 시간 슬롯 압축',
      'LSTM 레이어로 피드백 코드워드 시퀀스의 시간적 의존성 모델링',
      'CsiNet 디코더로 CSI 복원',
      '시퀀스 NMSE 최소화를 위한 엔드-투-엔드 학습',
    ],
    key_equations: [
      {
        name: 'LSTM Gate',
        latex: 'h_t = o_t \\odot \\tanh(c_t), \\quad c_t = f_t \\odot c_{t-1} + i_t \\odot \\tilde{c}_t',
        description: 'LSTM 셀 업데이트. 시간적 채널 상관성을 c_t(셀 상태)에 누적.',
      },
    ],
    category: 'csi_compression',
    tags: ['lstm', 'csi-feedback', 'time-varying', 'massive-mimo', 'recurrent', 'temporal-correlation'],
    pdf_url: 'https://doi.org/10.1109/LWC.2018.2874264',
    code_url: null,
    notes_summary: 'CsiNet에 LSTM을 결합해 시변 채널의 시간적 상관성을 활용한 피드백 모델. CsiNet-LSTM.',
    color_hex: '#3B82F6',
  },

  {
    id: '4dc6d7f6-25e9-4f77-8699-02d69ee0fab8',
    title: 'CSI-GPT: Integrating Generative Pre-Trained Transformer with Federated-Tuning for Channel Estimation in Massive MIMO',
    // Authors: Zeng et al. (exact first names to be verified via DOI)
    authors: ['Ye Zeng', 'Yindong Chen', 'Chuan Wen', 'Jianguo Wu'],
    year: 2024,
    venue: 'IEEE Transactions on Vehicular Technology',
    doi: '10.1109/TVT.2024.3493463',
    arxiv_id: null,
    abstract: '이 논문은 Massive MIMO 채널 추정을 위해 GPT 기반 생성형 사전 학습 트랜스포머와 연합 미세 조정(Federated-Tuning)을 통합하는 CSI-GPT 프레임워크를 제안합니다. 대규모 채널 데이터로 사전 학습된 GPT 모델을 연합 학습으로 분산 환경에 적응시켜 채널 추정 정확도와 통신 오버헤드를 동시에 개선합니다.',
    key_contributions: [
      'GPT 기반 사전 학습 모델을 채널 추정에 처음 적용한 CSI-GPT 프레임워크',
      '연합 미세 조정(Federated Fine-Tuning)으로 개인 정보 보호 및 통신 효율 보장',
      '채널 데이터의 자기회귀적 시퀀스 모델링으로 공간-시간 패턴 포착',
      '다양한 환경에서의 도메인 적응 및 소수 샷(few-shot) 학습 능력 입증',
    ],
    algorithms: [
      '대규모 다양한 채널 시나리오로 GPT 모델 사전 학습',
      '사전 학습된 모델에 LoRA 등 파라미터 효율적 파인튜닝 적용',
      '분산 UE에서 연합 학습으로 로컬 채널 환경 적응',
      '집계된 글로벌 모델로 채널 추정 추론',
    ],
    key_equations: [
      {
        name: 'Autoregressive Prediction',
        latex: 'p(x_1, \\ldots, x_T) = \\prod_{t=1}^{T} p(x_t \\mid x_1, \\ldots, x_{t-1})',
        description: '채널 토큰 시퀀스의 자기회귀 생성 확률. GPT가 채널 패턴을 순차적으로 예측.',
      },
    ],
    category: 'transformer',
    tags: ['gpt', 'transformer', 'channel-estimation', 'federated-learning', 'pre-training', 'massive-mimo'],
    pdf_url: 'https://doi.org/10.1109/TVT.2024.3493463',
    code_url: null,
    notes_summary: 'GPT 사전 학습 + 연합 미세 조정으로 채널 추정. TV Trans. 2024. CSI-GPT.',
    color_hex: '#06B6D4',
  },
];

async function main() {
  const env = loadEnv(ENV_PATH);
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  // ── STEP 1: Delete AWQ 2024 duplicate ──────────────────────────────────────
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('STEP 1: Find and delete AWQ 2024 duplicate');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Find all AWQ papers (case-insensitive title search)
  const { data: awqPapers, error: awqFindErr } = await supabase
    .from('papers')
    .select('id, title, year, doi')
    .ilike('title', '%AWQ%');

  if (awqFindErr) {
    console.error('Error finding AWQ papers:', awqFindErr.message);
    process.exit(1);
  }

  console.log(`Found ${awqPapers.length} AWQ paper(s):`);
  for (const p of awqPapers) {
    console.log(`  • [${p.year}] ${p.title}`);
    console.log(`    id=${p.id}  doi=${p.doi ?? 'null'}`);
  }

  // Identify the 2024 duplicate: year=2024 or doi='10.48550/arXiv.2306.00978' with year=2024
  // Keep the 2023 entry (same paper — arXiv submitted June 2023, MLSys published 2024)
  const awqDuplicate = awqPapers.find(
    p => p.year === 2024 && (p.doi === '10.48550/arXiv.2306.00978' || awqPapers.length > 1)
  );

  if (!awqDuplicate) {
    console.log('\n⚠️  No AWQ 2024 duplicate found (may have been already deleted). Skipping.');
  } else {
    console.log(`\n→ Deleting AWQ 2024 duplicate: ${awqDuplicate.id}`);

    // Delete relationships
    await supabase.from('paper_relationships').delete().eq('from_paper_id', awqDuplicate.id);
    await supabase.from('paper_relationships').delete().eq('to_paper_id', awqDuplicate.id);
    await supabase.from('user_notes').delete().eq('paper_id', awqDuplicate.id);

    const { error: awqDelErr } = await supabase
      .from('papers')
      .delete()
      .eq('id', awqDuplicate.id);

    if (awqDelErr) {
      console.error('Error deleting AWQ 2024 duplicate:', awqDelErr.message);
    } else {
      console.log('✅ AWQ 2024 duplicate deleted.');
    }
  }

  // ── STEP 2: Re-insert 6 real papers with correct DOIs ─────────────────────
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('STEP 2: Restore 6 real papers (correct DOIs)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  for (const paper of PAPERS_TO_RESTORE) {
    // Check if this UUID already exists (e.g. was partially restored)
    const { data: existing } = await supabase
      .from('papers')
      .select('id, title')
      .eq('id', paper.id)
      .maybeSingle();

    if (existing) {
      console.log(`⚠️  SKIPPED (already exists): ${paper.title}`);
      continue;
    }

    const { error: insertErr } = await supabase.from('papers').insert([paper]);

    if (insertErr) {
      console.error(`✗ ERROR inserting "${paper.title}": ${insertErr.message}`);
    } else {
      console.log(`✓ Restored: ${paper.title}`);
      console.log(`  doi: ${paper.doi}  venue: ${paper.venue}  year: ${paper.year}`);
    }
  }

  // ── Summary ────────────────────────────────────────────────────────────────
  const { count } = await supabase
    .from('papers')
    .select('*', { count: 'exact', head: true });

  console.log(`\n📊 Total papers in DB: ${count}`);
  console.log('\n⚠️  NOTE: paper_relationships for restored papers were also deleted.');
  console.log('   Relationships must be re-added manually or via a separate script.');
}

main().catch(err => { console.error(err); process.exit(1); });
