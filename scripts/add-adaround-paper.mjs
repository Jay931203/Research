#!/usr/bin/env node
/**
 * Add Nagel et al. 2020 "Up or Down? Adaptive Rounding for Post-Training Quantization"
 * to the Supabase database and create relationships.
 *
 * Run: node scripts/add-adaround-paper.mjs
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
  console.error('Missing Supabase URL/Key in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const PAPER = {
  title: 'Up or Down? Adaptive Rounding for Post-Training Quantization',
  authors: ['Markus Nagel', 'Rana Ali Amjad', 'Mart van Baalen', 'Christos Louizos', 'Tijmen Blankevoort'],
  year: 2020,
  venue: 'ICML 2020 (Proceedings of the 37th International Conference on Machine Learning)',
  arxiv_id: '2004.10568',
  abstract: 'Post-Training Quantization(PTQ)에서 가중치를 단순히 최근접 정수로 반올림(nearest rounding)하는 것이 최적이 아님을 이론적·실험적으로 증명하고, 이를 대체하는 적응적 반올림(Adaptive Rounding, AdaRound) 알고리즘을 제안한 핵심 논문. 각 레이어의 양자화 반올림 방향(올림/내림)을 연속 최적화 문제로 정식화하여, 소량의 미라벨 교정 데이터만으로 최적의 반올림 구성을 학습한다. Stretched Sigmoid 연속 완화와 정규화 항을 통해 이산 최적화를 효율적으로 근사하며, 레이어별 독립 최적화로 계산 비용을 최소화한다. ResNet, MobileNet, EfficientNet 등에서 4비트 양자화 시 nearest rounding 대비 정확도를 크게 회복하며, 이후 BRECQ, QDrop, GPTQ 등 후속 PTQ 연구의 이론적 기반이 되었다.',
  key_contributions: [
    'Nearest rounding이 PTQ에서 최적이 아님을 이론적으로 증명 (반례 구성)',
    '레이어별 재구성 오차 최소화로 최적 반올림 방향을 학습하는 AdaRound 알고리즘 제안',
    'Stretched Sigmoid 연속 완화 + 정규화 항으로 이산 최적화를 효율적으로 근사',
    '레이어별 독립 최적화로 계산 비용 최소화 (전체 fine-tuning 불필요)',
    '4비트 PTQ에서 nearest rounding 대비 정확도를 크게 회복 (ResNet-18: 1.15% gap → 69.86%)',
    '후속 PTQ 연구(BRECQ, QDrop, GPTQ)의 이론적 기반 수립',
  ],
  algorithms: ['AdaRound', 'Stretched Sigmoid Relaxation', 'Layer-wise Reconstruction', 'Regularized Rounding Optimization'],
  key_equations: [
    {
      name: '레이어별 재구성 오차 목적함수',
      latex: '\\arg\\min_{\\mathbf{V}} \\| \\mathbf{W}\\mathbf{x} - \\tilde{\\mathbf{W}}\\mathbf{x} \\|_F^2',
      description: '각 레이어에서 양자화 전후의 출력 차이를 최소화하는 최적 반올림 변수 V를 찾는 문제',
    },
    {
      name: 'AdaRound 양자화 가중치',
      latex: '\\tilde{\\mathbf{W}} = s \\cdot \\text{clamp}\\left(\\lfloor \\mathbf{W}/s \\rceil + h(\\mathbf{V}), n, p\\right)',
      description: 'h(V)는 soft 반올림 함수로, 학습 시 stretched sigmoid, 추론 시 이진 결정',
    },
    {
      name: 'Stretched Sigmoid 연속 완화',
      latex: 'h(\\mathbf{V}) = \\text{clamp}\\left(\\sigma(\\mathbf{V})(\\zeta - \\gamma) + \\gamma, 0, 1\\right)',
      description: '이산적 올림/내림 결정을 연속 변수로 완화. ζ=1.1, γ=-0.1이 기본값.',
    },
    {
      name: '정규화 항',
      latex: 'f_{\\text{reg}}(\\mathbf{V}) = \\sum_i 1 - |2h(V_i) - 1|^\\beta',
      description: 'h(V)를 0 또는 1로 수렴시키는 정규화. β는 학습 중 점진적으로 증가.',
    },
  ],
  architecture_detail: 'AdaRound의 핵심 구조: (1) 사전 학습된 모델의 각 레이어에 대해 독립적으로 최적화 수행. (2) 소량의 교정 데이터(~1000장)로 레이어 입력 x를 수집. (3) 각 가중치에 대해 학습 가능한 연속 변수 V를 도입하여 반올림 방향을 결정. (4) Stretched Sigmoid σ(V)(ζ-γ)+γ으로 이산 결정을 연속 완화. (5) 재구성 오차 ‖Wx - W̃x‖² + λf_reg(V)를 최소화. (6) 정규화 β를 점진적으로 증가시켜 최종적으로 이진 결정으로 수렴. (7) 레이어 순서대로 진행하며 이전 레이어의 양자화 결과를 반영.',
  category: 'quantization',
  tags: ['post_training_quantization', 'adaptive_rounding', 'weight_quantization', 'layer_wise_optimization', 'PTQ', 'rounding_optimization', 'stretched_sigmoid', 'reconstruction_error'],
  pdf_url: 'https://arxiv.org/abs/2004.10568',
  code_url: null,
  color_hex: '#10b981',
  difficulty_level: 'intermediate',
  prerequisites: ['양자화 기본 개념 (uniform quantization)', '신경망 추론 파이프라인 이해', '최적화 이론 기초 (SGD, continuous relaxation)'],
  learning_objectives: [
    'Nearest rounding이 왜 PTQ에서 최적이 아닌지 설명할 수 있다',
    'AdaRound의 레이어별 재구성 오차 최소화 접근법을 이해한다',
    'Stretched Sigmoid 연속 완화와 정규화 항의 역할을 설명할 수 있다',
    '레이어별 독립 최적화의 장단점을 분석할 수 있다',
    'AdaRound가 후속 PTQ 연구(BRECQ, QDrop, GPTQ)에 미친 영향을 논할 수 있다',
  ],
  self_check_questions: [
    'Nearest rounding이 최적이 아닌 구체적인 반례를 설명할 수 있는가?',
    'AdaRound에서 stretched sigmoid의 ζ=1.1, γ=-0.1은 어떤 역할을 하는가?',
    '정규화 항의 β를 점진적으로 증가시키는 이유는 무엇인가?',
    '레이어별 독립 최적화가 전체 네트워크 최적화보다 실용적인 이유는?',
  ],
};

async function main() {
  console.log('📄 Adding Nagel et al. 2020 AdaRound...');

  // Check if paper already exists
  const { data: existing } = await supabase
    .from('papers')
    .select('id')
    .eq('arxiv_id', PAPER.arxiv_id)
    .maybeSingle();

  let paperId;

  if (existing) {
    console.log('  ⚠️  Paper already exists (id:', existing.id, '). Updating...');
    const { error } = await supabase.from('papers').update(PAPER).eq('id', existing.id);
    if (error) { console.error('Update error:', error); process.exit(1); }
    paperId = existing.id;
  } else {
    const { data, error } = await supabase.from('papers').insert(PAPER).select('id').single();
    if (error) { console.error('Insert error:', error); process.exit(1); }
    paperId = data.id;
    console.log('  ✅ Inserted paper (id:', paperId, ')');
  }

  // Find related papers for relationships
  const relatedIds = {};
  for (const arxivId of ['2102.05426', '2011.10680', '1811.08886']) {
    const { data } = await supabase.from('papers').select('id').eq('arxiv_id', arxivId).maybeSingle();
    if (data) relatedIds[arxivId] = data.id;
  }

  console.log('  Found related papers:', Object.keys(relatedIds).length);

  // Create relationships
  const relationships = [];

  if (relatedIds['2102.05426']) {
    relationships.push({
      from_paper_id: relatedIds['2102.05426'],
      to_paper_id: paperId,
      relationship_type: 'extends',
      strength: 10,
      description: 'BRECQ는 AdaRound의 레이어별 재구성 오차 최소화를 블록 단위로 확장. 레이어 간 의존성을 고려한 블록 재구성으로 성능 향상.',
    });
  }

  if (relatedIds['2011.10680']) {
    relationships.push({
      from_paper_id: relatedIds['2011.10680'],
      to_paper_id: paperId,
      relationship_type: 'builds_on',
      strength: 7,
      description: 'HAWQ-V3는 혼합 정밀도 양자화에서 AdaRound의 적응적 반올림 기법을 활용. 비트 할당과 반올림 최적화의 결합.',
    });
  }

  if (relatedIds['1811.08886']) {
    relationships.push({
      from_paper_id: paperId,
      to_paper_id: relatedIds['1811.08886'],
      relationship_type: 'related',
      strength: 6,
      description: 'HAQ는 RL 기반 혼합 정밀도, AdaRound는 반올림 최적화. 상호 보완적 접근으로 PTQ 품질 향상에 기여.',
    });
  }

  if (relationships.length > 0) {
    for (const rel of relationships) {
      const { data: existing } = await supabase
        .from('paper_relationships')
        .select('id')
        .eq('from_paper_id', rel.from_paper_id)
        .eq('to_paper_id', rel.to_paper_id)
        .maybeSingle();

      if (existing) {
        console.log('  ⚠️  Relationship already exists, skipping');
        continue;
      }

      const { error } = await supabase.from('paper_relationships').insert(rel);
      if (error) {
        console.error('  ❌ Relationship insert error:', error);
      } else {
        console.log('  ✅ Added relationship:', rel.relationship_type, 'to', rel.to_paper_id);
      }
    }
  }

  console.log('\n✅ Done!');
}

main().catch(console.error);
