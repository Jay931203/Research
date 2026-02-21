#!/usr/bin/env node
/**
 * Re-add paper_relationships for the 6 real papers that were incorrectly
 * deleted in delete-fake-papers.mjs and restored in restore-real-papers.mjs.
 *
 * Relationships are based on established academic citations and thematic
 * connections within the CSI feedback / quantization literature.
 *
 * Run: node scripts/add-restored-paper-relationships.mjs
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

// ── Paper IDs ──────────────────────────────────────────────────────────────
const ID = {
  // ── Restored papers ────────────────────────────────────────────────────
  CSINET_LSTM:   'a1d157c1-5fab-4857-acf4-020b13287ff9', // CsiNet-LSTM (Time-Varying, 2019)
  CRNET:         '03eee0a8-7c5f-4816-b8e9-147283c85099', // CRNet Multi-Resolution (ICC 2020)
  DS_NLCSINET:   '9c0a6384-5ef8-4151-824c-6287e6fef87f', // DS-NLCsiNet (2020)
  BINARY_NN:     '4ffeb89f-5b53-4d08-96e2-4a2860de55a9', // Binary NN CSI (2021)
  TRANSNET:      'baa25ef0-3ac5-46c4-a7f4-5b3a158c3922', // TransNet (2022)
  CSI_GPT:       '4dc6d7f6-25e9-4f77-8699-02d69ee0fab8', // CSI-GPT (2024)

  // ── Existing papers (linked to) ────────────────────────────────────────
  CSINET:        '56dcc22a-13d8-4034-831b-17d2262b079a', // CsiNet (original, 2018)
  ATTENTION:     '291958e7-6c38-4f68-9e1e-c80bc5ddcde9', // Attention Is All You Need (2017)
  BAQ:           '940a456d-5c1b-4281-b716-4d4ceb6b0a7b', // BAQ Binarized+Quantization (2022)
  CLNET:         '91820fc5-ea91-4cad-b21d-da9c47a68b67', // CLNet (2021)
  LIGHTWEIGHT:   '9c6faf30-583b-415d-83f9-50fc60a1d205', // Lightweight Deep Network (2021)
  SCANET:        '92065b57-23ff-44a9-a011-1bef0ef836b8', // SCANet (2024)
  QUANT_ADAPT:   '1481d5bc-b3d3-4f9a-83be-54ba5584edd6', // Quantization Adaptor (2024)
  QUANT_DESIGN:  'd1d66a0c-366e-4b26-a7a7-450e91a57f38', // Quantization Design (2025)
  WIFO_CF:       '13188490-246b-4e8a-b829-a2d272b474c6', // WiFo-CF Foundation Model (2025)
  SEMCSINET:     '7bce599c-393a-4977-80ee-b35451f79f49', // SemCSINet (2025)
  SLATE:         'd673c34d-9197-4e17-a40c-c91ceb352d24', // SLATE SwinLSTM (2025)
  AIANET:        '098aaa64-69c4-432a-8feb-2beb2cd4f776', // AiANet (2025)
  EGCSINET:      '0c663dda-8358-45c5-ae65-bef294ad0106', // EG-CsiNet (2025)
};

// ── Relationships ──────────────────────────────────────────────────────────
// Format: { from, to, relationship_type, description, strength }
// Types: extends | builds_on | compares_with | inspired_by | inspires | challenges | applies | related

const RELATIONSHIPS = [
  // ── CsiNet-LSTM (Time-Varying, 2019) ─────────────────────────────────
  {
    from: ID.CSINET_LSTM, to: ID.CSINET,
    relationship_type: 'builds_on',
    description: 'CsiNet-LSTM은 CsiNet 인코더-디코더 구조를 그대로 계승하면서 LSTM 레이어를 추가해 시변 채널의 시간적 상관성을 활용합니다.',
    strength: 9,
  },
  {
    from: ID.SLATE, to: ID.CSINET_LSTM,
    relationship_type: 'builds_on',
    description: 'SLATE는 SwinLSTM으로 시공간-주파수 압축을 다루며, CsiNet-LSTM이 개척한 LSTM 기반 시변 CSI 피드백 접근법을 발전시킵니다.',
    strength: 6,
  },
  {
    from: ID.CSINET_LSTM, to: ID.EGCSINET,
    relationship_type: 'related',
    description: '두 논문 모두 다양한 채널 환경에서의 CSI 피드백 강인성을 다룹니다. CsiNet-LSTM은 시변성, EG-CsiNet은 환경 일반화에 초점을 맞춥니다.',
    strength: 4,
  },

  // ── CRNet / Multi-Resolution CSI (ICC 2020) ──────────────────────────
  {
    from: ID.CRNET, to: ID.CSINET,
    relationship_type: 'builds_on',
    description: 'CRNet은 CsiNet의 단일 스케일 압축 구조를 다중 해상도 합성곱 블록으로 확장해 다양한 압축률을 단일 모델로 처리합니다.',
    strength: 9,
  },
  {
    from: ID.CRNET, to: ID.CLNET,
    relationship_type: 'related',
    description: '두 논문 모두 CNN 기반 CSI 피드백에서 아키텍처 효율성을 탐구하며, 다중 스케일/복소수 입력 등 서로 다른 방향으로 CsiNet을 개선합니다.',
    strength: 6,
  },
  {
    from: ID.CRNET, to: ID.LIGHTWEIGHT,
    relationship_type: 'related',
    description: '두 논문 모두 Massive MIMO CSI 피드백에서 경량화 CNN 구조를 추구하며, 비슷한 시기에 서로 다른 접근법으로 복잡도-성능 트레이드오프를 탐구합니다.',
    strength: 6,
  },
  {
    from: ID.CRNET, to: ID.DS_NLCSINET,
    relationship_type: 'compares_with',
    description: '두 논문 모두 2020년 발표된 CsiNet 이후 세대 CSI 피드백 모델로, 다중 해상도(CRNet)와 비지역 패턴(DS-NLCsiNet)이라는 서로 다른 접근법을 제시합니다.',
    strength: 5,
  },

  // ── DS-NLCsiNet (IEEE Comms Letters 2020) ────────────────────────────
  {
    from: ID.DS_NLCSINET, to: ID.CSINET,
    relationship_type: 'builds_on',
    description: 'DS-NLCsiNet은 CsiNet 기반 구조에 비지역(Non-Local) 블록을 결합한 이중 스트림 아키텍처로, 지역적 합성곱의 수용 영역 한계를 극복합니다.',
    strength: 8,
  },
  {
    from: ID.DS_NLCSINET, to: ID.TRANSNET,
    relationship_type: 'related',
    description: '두 논문 모두 CSI 행렬의 장거리/전역적 의존성 포착을 목표로 합니다. DS-NLCsiNet은 비지역 블록, TransNet은 트랜스포머 셀프-어텐션을 사용합니다.',
    strength: 6,
  },

  // ── Binary NN CSI Feedback (IEEE WCL 2021) ───────────────────────────
  {
    from: ID.BINARY_NN, to: ID.CSINET,
    relationship_type: 'builds_on',
    description: 'Binary NN은 CsiNet 인코더의 가중치를 이진화(±1)하여 UE 측 연산량을 XNOR 연산으로 대폭 줄이면서 CSI 피드백 정확도를 유지합니다.',
    strength: 8,
  },
  {
    from: ID.BINARY_NN, to: ID.BAQ,
    relationship_type: 'related',
    description: '두 논문 모두 Tsinghua University 연구 그룹(Lu, Wang, Song)의 작업으로, 이진화(Binary NN)와 이진화+양자화(BAQ)를 통한 CSI 피드백 경량화를 탐구합니다.',
    strength: 8,
  },
  {
    from: ID.BINARY_NN, to: ID.QUANT_ADAPT,
    relationship_type: 'related',
    description: '두 논문 모두 CSI 피드백에 양자화를 적용합니다. Binary NN은 가중치 이진화, Quantization Adaptor는 피드백 비트 할당 최적화에 초점을 맞춥니다.',
    strength: 7,
  },
  {
    from: ID.BINARY_NN, to: ID.QUANT_DESIGN,
    relationship_type: 'related',
    description: '두 논문 모두 CSI 피드백 파이프라인에서의 양자화 설계를 다룹니다.',
    strength: 6,
  },

  // ── TransNet (IEEE WCL 2022) ─────────────────────────────────────────
  {
    from: ID.TRANSNET, to: ID.CSINET,
    relationship_type: 'builds_on',
    description: 'TransNet은 CsiNet의 CNN 인코더-디코더를 완전 트랜스포머 셀프-어텐션으로 교체하여 채널 행렬의 전역적 공간-주파수 패턴을 포착합니다.',
    strength: 8,
  },
  {
    from: ID.TRANSNET, to: ID.ATTENTION,
    relationship_type: 'inspired_by',
    description: 'TransNet은 "Attention Is All You Need"의 멀티헤드 셀프-어텐션 메커니즘을 CSI 피드백에 직접 적용하여 장거리 의존성을 모델링합니다.',
    strength: 9,
  },
  {
    from: ID.TRANSNET, to: ID.DS_NLCSINET,
    relationship_type: 'related',
    description: '두 논문 모두 CSI 채널 행렬의 전역적 패턴 포착을 목표로 합니다. DS-NLCsiNet은 비지역 블록, TransNet은 트랜스포머 어텐션을 사용합니다.',
    strength: 6,
  },
  {
    from: ID.SEMCSINET, to: ID.TRANSNET,
    relationship_type: 'builds_on',
    description: 'SemCSINet은 TransNet 등 트랜스포머 기반 CSI 피드백 연구의 흐름을 이어, 의미론적 인식(Semantic-Aware) 어텐션을 추가합니다.',
    strength: 6,
  },
  {
    from: ID.AIANET, to: ID.TRANSNET,
    relationship_type: 'related',
    description: '두 논문 모두 어텐션 메커니즘을 CSI 압축에 적용한 트랜스포머 계열 피드백 모델입니다.',
    strength: 6,
  },
  {
    from: ID.WIFO_CF, to: ID.TRANSNET,
    relationship_type: 'builds_on',
    description: 'WiFo-CF는 TransNet 등 트랜스포머 기반 CSI 연구를 기반으로, 무선 통신 파운데이션 모델로 스케일업합니다.',
    strength: 5,
  },

  // ── CSI-GPT (IEEE TVT 2024) ──────────────────────────────────────────
  {
    from: ID.CSI_GPT, to: ID.ATTENTION,
    relationship_type: 'inspired_by',
    description: 'CSI-GPT는 트랜스포머 셀프-어텐션을 기반으로 한 GPT 아키텍처를 채널 추정에 적용하며, "Attention Is All You Need"에서 도입된 아키텍처가 핵심입니다.',
    strength: 7,
  },
  {
    from: ID.CSI_GPT, to: ID.TRANSNET,
    relationship_type: 'related',
    description: '두 논문 모두 트랜스포머 아키텍처를 무선 채널 처리에 적용합니다. TransNet은 CSI 압축 피드백, CSI-GPT는 채널 추정 + 연합 학습을 다룹니다.',
    strength: 6,
  },
  {
    from: ID.CSI_GPT, to: ID.WIFO_CF,
    relationship_type: 'related',
    description: '두 논문 모두 GPT/파운데이션 모델을 무선 채널 문제에 적용합니다. CSI-GPT는 연합 미세 조정, WiFo-CF는 대규모 사전 학습 기반 피드백을 탐구합니다.',
    strength: 8,
  },
  {
    from: ID.CSI_GPT, to: ID.SEMCSINET,
    relationship_type: 'related',
    description: '두 논문 모두 트랜스포머/GPT 기반의 지능형 무선 채널 처리를 다루며, 채널 추정과 CSI 피드백이라는 서로 다른 방향에서 접근합니다.',
    strength: 5,
  },
];

async function main() {
  const env = loadEnv(ENV_PATH);
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  console.log(`\nAdding ${RELATIONSHIPS.length} relationships for restored papers...\n`);

  let added = 0;
  let skipped = 0;
  let errors = 0;

  for (const rel of RELATIONSHIPS) {
    const { error } = await supabase.from('paper_relationships').insert([{
      from_paper_id: rel.from,
      to_paper_id: rel.to,
      relationship_type: rel.relationship_type,
      description: rel.description,
      strength: rel.strength,
    }]);

    if (error) {
      if (error.code === '23505') {
        // Duplicate (UNIQUE constraint) — already exists
        console.log(`  ⚠  SKIP (already exists): ${rel.from.slice(0,8)} → ${rel.to.slice(0,8)} [${rel.relationship_type}]`);
        skipped++;
      } else {
        console.error(`  ✗  ERROR: ${rel.from.slice(0,8)} → ${rel.to.slice(0,8)}: ${error.message}`);
        errors++;
      }
    } else {
      console.log(`  ✓  ${rel.from.slice(0,8)} → ${rel.to.slice(0,8)} [${rel.relationship_type}] (strength ${rel.strength})`);
      added++;
    }
  }

  // Summary
  const { count } = await supabase
    .from('paper_relationships')
    .select('*', { count: 'exact', head: true });

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✅ Added: ${added}  ⚠ Skipped: ${skipped}  ✗ Errors: ${errors}`);
  console.log(`📊 Total relationships in DB: ${count}`);
}

main().catch(err => { console.error(err); process.exit(1); });
