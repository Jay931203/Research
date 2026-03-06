#!/usr/bin/env node
/**
 * Add CsiFBNet paper to the Supabase database and create relationships.
 *
 * Paper: "Deep Learning-Based CSI Feedback for Beamforming in Single-
 *         and Multi-cell Massive MIMO Systems"
 * Authors: Jiajia Guo, Chao-Kai Wen, Shi Jin
 * Venue:  IEEE JSAC, vol. 39, no. 7, pp. 1872-1884, Jul. 2021
 * arXiv:  2011.06099
 *
 * Run: node scripts/add-csifbnet.mjs
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

// ── CsiFBNet Paper ─────────────────────────────────────────────────────────

const PAPER = {
  title: 'Deep Learning-Based CSI Feedback for Beamforming in Single- and Multi-cell Massive MIMO Systems',
  authors: ['Jiajia Guo', 'Chao-Kai Wen', 'Shi Jin'],
  year: 2021,
  venue: 'IEEE Journal on Selected Areas in Communications (JSAC), vol. 39, no. 7, pp. 1872-1884',
  arxiv_id: '2011.06099',
  abstract: 'FDD Massive MIMO에서 기지국(BS)의 빔포밍(BF) 성능은 사용자로부터 피드백되는 CSI의 품질에 좌우된다. 기존 딥러닝 기반 CSI 피드백 연구(CsiNet 등)는 채널 복원 정확도(MSE)만을 최적화하고, 이후의 빔포밍 모듈에 대한 영향을 무시한다. 본 논문은 피드백 정확도가 아닌 빔포밍 성능 이득을 직접 최대화하는 DL 기반 CSI 피드백 프레임워크 CsiFBnet을 제안한다. 단일 셀 시스템용 CsiFBnet-s는 사용자 측 인코더가 CSI를 압축하고, 기지국 측 디코더가 빔포밍 벡터를 직접 생성하는 오토인코더 구조이다. 다중 셀 시스템용 CsiFBnet-m은 원하는 채널 CSI와 간섭 채널 CSI를 동시에 피드백한다. 비지도 학습 전략으로 전체 네트워크를 종단간 학습하며, 시뮬레이션 결과 기존 DL 기반 CSI 피드백 방법 대비 큰 성능 향상과 복잡도 감소를 보인다.',
  key_contributions: [
    '빔포밍 성능 이득을 직접 최대화하는 새로운 CSI 피드백 프레임워크 CsiFBnet 제안 - 피드백 정확도가 아닌 최종 태스크(빔포밍) 성능을 최적화하는 패러다임 전환',
    '단일 셀(CsiFBnet-s)과 다중 셀(CsiFBnet-m) 두 가지 시나리오를 위한 구체적 네트워크 아키텍처 설계',
    '비지도 학습 기반 종단간 학습 전략: 레이블 없이 빔포밍 이득을 손실 함수로 사용하여 인코더-디코더를 공동 최적화',
    'CsiFBnet-m에서 원하는 채널과 간섭 채널의 CSI를 동시에 피드백하는 다중 셀 확장 설계',
    '기존 DL 기반 CSI 피드백(CsiNet + ZF) 대비 현저한 빔포밍 성능 향상과 계산 복잡도 감소를 실증',
  ],
  algorithms: ['CsiFBnet-s', 'CsiFBnet-m', 'Unsupervised E2E Training', 'BF-Gain Maximization Loss'],
  key_equations: [
    {
      name: '빔포밍 이득 최대화 손실 함수 (BF-Gain Loss)',
      latex: '\\mathcal{L}(\\theta) = -\\mathbb{E}\\!\\left[\\frac{|\\mathbf{h}^H \\hat{\\mathbf{w}}(\\theta)|^2}{\\|\\mathbf{h}\\|^2}\\right]',
      description: 'CsiFBnet의 핵심 손실 함수. 채널 벡터 h와 네트워크가 출력한 빔포밍 벡터 w-hat 사이의 정규화된 빔포밍 이득을 최대화한다. MSE가 아닌 빔포밍 이득을 직접 최적화함으로써, 프리코딩에 필요한 방향 정보에 집중하여 학습한다.',
    },
    {
      name: 'CsiFBnet-s 오토인코더 구조',
      latex: '\\hat{\\mathbf{w}} = f_{\\text{dec}}\\!\\left(f_{\\text{enc}}(\\mathbf{H};\\,\\theta_e);\\,\\theta_d\\right), \\quad \\|\\hat{\\mathbf{w}}\\| = 1',
      description: '단일 셀 CsiFBnet-s의 인코더-디코더 파이프라인. UE 인코더 f_enc는 채널 행렬 H를 압축 표현으로 변환하고, BS 디코더 f_dec는 빔포밍 벡터를 직접 출력한다. 출력은 단위 노름으로 정규화된다. CsiNet과 달리 디코더가 채널을 복원하지 않고 빔포밍 벡터를 바로 생성한다.',
    },
    {
      name: '다중 셀 SINR (CsiFBnet-m 목적함수)',
      latex: '\\text{SINR}_k = \\frac{|\\mathbf{h}_{k,k}^H \\mathbf{w}_k|^2}{\\sum_{j \\neq k} |\\mathbf{h}_{k,j}^H \\mathbf{w}_j|^2 + \\sigma^2}',
      description: '다중 셀 시나리오에서 k번째 사용자의 SINR. h_{k,k}는 서빙 셀에서 k번째 사용자로의 원하는 채널, h_{k,j}는 j번째 셀에서의 간섭 채널. CsiFBnet-m은 원하는 CSI와 간섭 CSI를 모두 피드백하여 셀 간 간섭을 고려한 빔포밍 벡터를 생성한다.',
    },
  ],
  architecture_detail: 'CsiFBnet의 핵심 아키텍처: (1) CsiFBnet-s (단일 셀): UE 측 인코더(FC + Conv 레이어)가 채널 행렬 H를 저차원 특징 벡터로 압축 → 피드백 링크 전송 → BS 측 디코더(FC + Conv 레이어)가 압축 표현으로부터 빔포밍 벡터 w를 직접 출력. CsiNet과의 핵심 차이는 디코더 출력이 복원된 채널이 아닌 빔포밍 벡터라는 점. (2) CsiFBnet-m (다중 셀): UE가 서빙 셀 채널(desired CSI)과 간섭 셀 채널(interfering CSI)을 각각 별도의 인코더로 압축하여 피드백. BS는 두 피드백을 결합하여 셀 간 간섭을 고려한 빔포밍 벡터를 생성. (3) 학습 전략: 빔포밍 이득(또는 SINR)을 손실 함수로 사용하는 비지도 학습. 라벨(최적 빔포밍 벡터)이 필요 없이 채널 샘플만으로 학습 가능. 채널 모델은 COST 2100 실내/실외 시나리오 사용.',
  category: 'csi_compression',
  tags: ['csi_feedback', 'beamforming', 'massive_MIMO', 'autoencoder', 'task_oriented', 'unsupervised_learning', 'multi_cell', 'deep_learning', 'FDD'],
  pdf_url: 'https://arxiv.org/pdf/2011.06099',
  code_url: 'https://github.com/gjjustc/Deep-Learning-Based-CSI-Feedback-for-Beamforming-in-Single--and-Multi-cell-Massive-MIMO-Systems',
  color_hex: '#3b82f6',
  difficulty_level: 'advanced',
  prerequisites: [
    'Massive MIMO 시스템과 FDD 모드에서의 CSI 피드백 개념',
    '빔포밍(Beamforming) 기본 원리와 SINR 개념',
    '딥러닝 오토인코더 구조 (인코더-디코더)',
    '기존 DL 기반 CSI 피드백 연구(CsiNet) 이해',
    '다중 셀 MIMO 간섭 관리 기초',
  ],
  learning_objectives: [
    '기존 MSE 기반 CSI 피드백과 CsiFBnet의 빔포밍 이득 기반 피드백의 근본적 차이를 설명할 수 있다',
    'CsiFBnet-s의 오토인코더 구조와 빔포밍 벡터 직접 출력 메커니즘을 이해하고 설명할 수 있다',
    'CsiFBnet-m에서 원하는 CSI와 간섭 CSI를 동시에 피드백하는 다중 셀 확장의 필요성과 설계를 이해한다',
    '비지도 학습 전략으로 빔포밍 이득을 직접 최적화하는 종단간 학습 과정을 설명할 수 있다',
    'CsiFBnet과 Carpi(2023)의 프리코딩 지향 접근의 유사점과 차이점을 비교 분석할 수 있다',
  ],
  self_check_questions: [
    'CsiFBnet이 MSE가 아닌 빔포밍 이득을 손실 함수로 사용하는 이유는? MSE 최적화와 빔포밍 성능 최적화가 다른 결과를 낳는 구체적 시나리오를 설명하라.',
    'CsiFBnet-s와 CsiNet의 디코더 출력이 다른 점이 시스템 전체 성능에 미치는 영향을 분석하라.',
    'CsiFBnet-m에서 간섭 CSI를 별도로 피드백하는 것이 단일 셀 구조 대비 어떤 추가 이점을 제공하는가?',
    '비지도 학습 전략이 지도 학습(최적 빔포밍 벡터를 라벨로 사용) 대비 장단점은 무엇인가?',
  ],
};

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('CsiFBNet 논문 추가 시작...\n');

  // 1. Find existing related paper IDs
  const { data: allPapers } = await supabase
    .from('papers')
    .select('id, title, arxiv_id')
    .order('title');

  if (!allPapers) {
    console.error('기존 논문 목록 조회 실패');
    process.exit(1);
  }

  console.log(`기존 논문 수: ${allPapers.length}`);

  // Helper to find paper ID by partial title match or arxiv_id
  const findPaper = (keyword) => {
    const found = allPapers.find(p =>
      p.title.toLowerCase().includes(keyword.toLowerCase()) ||
      (p.arxiv_id && p.arxiv_id === keyword)
    );
    return found ? { id: found.id, title: found.title } : null;
  };

  const EXISTING = {
    CSINET:       findPaper('CsiNet') || findPaper('Deep Learning for Massive MIMO CSI'),
    CARPI:        findPaper('Precoding-oriented'),
    JINDAL:       findPaper('Broadcast Channels With Finite'),
    LOVE_HEATH:   findPaper('Grassmannian'),
    TRANSNET:     findPaper('TransNet'),
    DEEPCMC:      findPaper('DeepCMC'),
  };

  console.log('기존 관련 논문:', JSON.stringify(EXISTING, null, 2), '\n');

  // 2. Insert paper
  // Check if already exists
  const { data: existing } = await supabase
    .from('papers')
    .select('id, title')
    .eq('arxiv_id', '2011.06099');

  if (existing && existing.length > 0) {
    console.log(`이미 존재: ${existing[0].title.substring(0, 60)}... (id: ${existing[0].id})`);
    var CSIFBNET_ID = existing[0].id;
  } else {
    const { data, error } = await supabase
      .from('papers')
      .insert(PAPER)
      .select('id, title')
      .single();

    if (error) {
      console.error('삽입 실패:', error.message);
      process.exit(1);
    }

    console.log(`추가: ${data.title.substring(0, 60)}... (id: ${data.id})`);
    var CSIFBNET_ID = data.id;
  }

  if (!CSIFBNET_ID) {
    console.error('CsiFBNet ID를 얻지 못했습니다.');
    return;
  }

  console.log('\n관계 추가 시작...\n');

  // 3. Insert relationships
  const RELATIONSHIPS = [];

  // CsiFBNet challenges CsiNet (MSE is suboptimal for BF)
  if (EXISTING.CSINET) {
    RELATIONSHIPS.push({
      from_paper_id: CSIFBNET_ID,
      to_paper_id: EXISTING.CSINET.id,
      relationship_type: 'challenges',
      description: 'CsiFBnet은 CsiNet의 MSE 기반 채널 복원이 빔포밍 최적이 아님을 보인다. CsiNet이 채널 H를 정확히 복원하는 데 집중하는 반면, CsiFBnet은 빔포밍 벡터를 직접 출력하여 최종 빔포밍 이득을 최대화한다.',
      strength: 9,
    });
  }

  // CsiFBNet builds_on CsiNet (uses autoencoder structure)
  if (EXISTING.CSINET) {
    RELATIONSHIPS.push({
      from_paper_id: CSIFBNET_ID,
      to_paper_id: EXISTING.CSINET.id,
      relationship_type: 'builds_on',
      description: 'CsiFBnet은 CsiNet이 개척한 DL 기반 CSI 피드백 오토인코더 구조를 기반으로 하되, 디코더 출력을 복원된 채널에서 빔포밍 벡터로 변경하고 손실 함수를 MSE에서 빔포밍 이득으로 교체한다.',
      strength: 9,
    });
  }

  // Carpi builds_on CsiFBNet (extends task-oriented approach)
  if (EXISTING.CARPI) {
    RELATIONSHIPS.push({
      from_paper_id: EXISTING.CARPI.id,
      to_paper_id: CSIFBNET_ID,
      relationship_type: 'extends',
      description: 'Carpi(2023)의 프리코딩 지향 피드백은 CsiFBnet(2021)의 태스크 지향 접근을 더 발전시킨다. CsiFBnet이 빔포밍 이득을 최적화했다면, Carpi는 Sum-Rate를 직접 최적화하고 학습된 파일럿까지 포함하는 완전한 E2E 시스템을 제안한다.',
      strength: 8,
    });
  }

  // CsiFBNet inspires from Jindal's feedback framework
  if (EXISTING.JINDAL) {
    RELATIONSHIPS.push({
      from_paper_id: EXISTING.JINDAL.id,
      to_paper_id: CSIFBNET_ID,
      relationship_type: 'inspires',
      description: 'Jindal의 유한 피드백 분석은 피드백 비트 수와 빔포밍 성능 사이의 관계를 이론적으로 확립하여 CsiFBnet의 태스크 지향 CSI 피드백 설계의 이론적 동기를 제공한다.',
      strength: 7,
    });
  }

  // Love & Heath inspires CsiFBNet
  if (EXISTING.LOVE_HEATH) {
    RELATIONSHIPS.push({
      from_paper_id: EXISTING.LOVE_HEATH.id,
      to_paper_id: CSIFBNET_ID,
      relationship_type: 'inspires',
      description: 'Love & Heath의 코드북 기반 빔포밍 양자화는 CsiFBnet이 DNN으로 대체하는 고전적 기준선이다. Grassmannian 코드북이 고정 구조라면 CsiFBnet의 인코더-디코더는 학습 가능한 비선형 코드북 역할을 한다.',
      strength: 6,
    });
  }

  let relOk = 0;
  for (const rel of RELATIONSHIPS) {
    const { error } = await supabase
      .from('paper_relationships')
      .insert(rel);

    if (error) {
      if (error.message?.includes('duplicate') || error.code === '23505') {
        console.log(`  이미 존재하는 관계: ${rel.description.substring(0, 50)}...`);
      } else {
        console.error(`관계 삽입 실패:`, error.message);
      }
    } else {
      relOk++;
      console.log(`  관계 추가: ${rel.relationship_type} (strength ${rel.strength})`);
    }
  }

  console.log(`\n완료! CsiFBNet 논문 1개, 관계 ${relOk}/${RELATIONSHIPS.length}개 추가.`);
  console.log(`CsiFBNet ID: ${CSIFBNET_ID}`);
}

main().catch(console.error);
