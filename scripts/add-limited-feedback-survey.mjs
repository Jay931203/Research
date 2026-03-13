#!/usr/bin/env node
/**
 * Add Love et al. 2008 "An Overview of Limited Feedback in Wireless Communication Systems"
 * to the Supabase database and create relationships.
 *
 * Run: node scripts/add-limited-feedback-survey.mjs
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
  title: 'An Overview of Limited Feedback in Wireless Communication Systems',
  authors: ['David J. Love', 'Robert W. Heath Jr.', 'Vincent K. N. Lau', 'David Gesbert', 'Bhaskar D. Rao', 'Matthew Andrews'],
  year: 2008,
  venue: 'IEEE Journal on Selected Areas in Communications, vol. 26, no. 8, pp. 1341-1365',
  arxiv_id: 'love-heath-2008-survey',
  abstract: 'MIMO 무선 통신에서 제한된 피드백(limited feedback)의 가치와 설계 원칙을 체계적으로 정리한 종합 서베이 논문. 단일 사용자 빔포밍, 공간 다중화(프리코딩), 다중 사용자 MIMO, OFDM 시스템에서 제한된 피드백의 정보 이론적 한계와 코드북 설계 기법을 다룬다. Grassmann 다양체 기반 코드북 설계, CDI/CQI 분리 피드백, 주파수 선택적 채널에서의 비트 할당, MU-MIMO에서의 스케일링 법칙 등 핵심 결과를 통합적으로 제시한다. 소수의 잘 설계된 피드백 비트만으로도 완전 CSI 성능의 대부분을 달성할 수 있음을 보이며, 이후 LTE/5G NR 코드북 표준과 딥러닝 기반 CSI 피드백 연구의 이론적 기반이 되었다.',
  key_contributions: [
    'SU/MU/OFDM 시나리오별 제한된 피드백의 정보 이론적 한계를 통합적으로 정리',
    'Grassmannian 코드북, DFT 코드북, VQ 기반 코드북 등 설계 기법의 체계적 비교',
    'CDI(Channel Direction Information) + CQI(Channel Quality Indicator) 분리 피드백 프레임워크 정립',
    '단일 사용자 vs 다중 사용자 MIMO의 피드백 스케일링 법칙 차이를 명확히 구분',
    'OFDM에서 주파수 선택적 채널의 서브밴드별 비트 할당 최적화 가이드라인 제시',
    'LTE/5G NR 코드북 표준 설계의 이론적 근간 제공',
  ],
  algorithms: ['Grassmannian Line Packing', 'DFT Codebook', 'Lloyd-Max VQ', 'CDI/CQI Feedback', 'Progressive Subspace Feedback'],
  key_equations: [
    {
      name: '코드북 빔포밍 선택',
      latex: '\\hat{\\mathbf{w}} = \\arg\\max_{\\mathbf{c}_i \\in \\mathcal{C}} |\\mathbf{h}^H \\mathbf{c}_i|^2',
      description: '수신기가 채널과 내적이 최대인 코드워드를 선택하여 B비트 인덱스로 피드백',
    },
    {
      name: 'SU 빔포밍 용량 손실',
      latex: '\\mathbb{E}[\\Delta C] \\leq \\log_2\\left(1 + \\frac{P}{N_0} \\cdot t \\cdot 2^{-B/(t-1)}\\right)',
      description: 'B비트 피드백 빔포밍의 평균 용량 손실 상한. SNR에 무관한 상수 bound.',
    },
    {
      name: 'MU-MIMO 스케일링 법칙',
      latex: 'B \\geq (t-1) \\log_2(\\mathrm{SNR})',
      description: '다중 사용자 ZF 빔포밍에서 rate loss를 유한하게 유지하기 위한 최소 피드백 비트. Jindal (2006).',
    },
  ],
  architecture_detail: 'MIMO 제한된 피드백 시스템의 통합 프레임워크: (1) 수신기(UE)가 채널을 추정하고, 사전 공유된 코드북에서 최적 코드워드의 인덱스(B비트)를 역방향 링크로 피드백. (2) 송신기(BS)는 인덱스에 해당하는 코드워드를 빔포밍/프리코딩에 사용. (3) SU-MISO: G(t,1) 위의 패킹으로 코드북 설계, 손실 ∝ 2^{-B/(t-1)}. (4) SU-MIMO rank-r: G(t,r) 위의 패킹, 손실 ∝ 2^{-B/(r(t-r))}. (5) MU-MIMO: ZF 프리코딩에서 잔여 간섭이 SNR에 비례하므로 B ∝ (t-1)log₂(SNR)으로 스케일링 필요. (6) OFDM: 서브밴드별 비트 할당 최적화, 주파수 상관 활용한 차분 피드백.',
  category: 'csi_compression',
  tags: ['limited_feedback', 'survey', 'codebook_design', 'MIMO_beamforming', 'spatial_multiplexing', 'multi_user_MIMO', 'OFDM', 'scaling_law', 'Grassmannian', 'CDI_CQI'],
  pdf_url: 'https://ieeexplore.ieee.org/document/4641946',
  code_url: null,
  color_hex: '#14b8a6',
  difficulty_level: 'intermediate',
  prerequisites: ['MIMO 시스템 기본', '선형대수 (특이값 분해)', '정보 이론 기초 (용량, 율-왜곡)'],
  learning_objectives: [
    '제한된 피드백의 핵심 동기(대역폭/지연/에너지 제약)를 설명할 수 있다',
    'SU-MIMO vs MU-MIMO 피드백 스케일링 법칙의 근본 차이를 이해한다',
    '코드북 설계의 세 가지 접근(Grassmannian, DFT, VQ)의 장단점을 비교할 수 있다',
    'CDI + CQI 분리 피드백 프레임워크를 설명할 수 있다',
    '이 서베이의 결과가 LTE/5G NR 표준과 DL 기반 피드백 연구에 미친 영향을 논할 수 있다',
  ],
  self_check_questions: [
    'SU-MIMO에서 B가 SNR과 무관하게 고정되어도 되는 이유는?',
    'MU-MIMO에서 B가 SNR에 비례해야 하는 이유는?',
    'Grassmannian 코드북과 DFT 코드북의 핵심 차이는?',
    'CDI와 CQI를 분리하여 피드백하는 이점은?',
  ],
};

async function main() {
  console.log('📄 Adding Love et al. 2008 Limited Feedback Survey...');

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
  for (const arxivId of ['love-heath-2003', 'cs/0603065', '2302.11526', '2011.06099']) {
    const { data } = await supabase.from('papers').select('id').eq('arxiv_id', arxivId).maybeSingle();
    if (data) relatedIds[arxivId] = data.id;
  }

  console.log('  Found related papers:', Object.keys(relatedIds).length);

  // Create relationships
  const relationships = [];

  if (relatedIds['love-heath-2003']) {
    relationships.push({
      from_paper_id: paperId,
      to_paper_id: relatedIds['love-heath-2003'],
      relationship_type: 'extends',
      strength: 10,
      description: '동일 저자(Love & Heath)의 Grassmannian 코드북 연구를 서베이에서 확장/정리. 코드북 설계 이론의 통합적 관점 제시.',
    });
  }

  if (relatedIds['cs/0603065']) {
    relationships.push({
      from_paper_id: paperId,
      to_paper_id: relatedIds['cs/0603065'],
      relationship_type: 'builds_on',
      strength: 9,
      description: 'Jindal의 MU-MIMO 스케일링 법칙을 서베이에 통합. SU vs MU 피드백 차이를 체계적으로 정리.',
    });
  }

  if (relatedIds['2302.11526']) {
    relationships.push({
      from_paper_id: relatedIds['2302.11526'],
      to_paper_id: paperId,
      relationship_type: 'builds_on',
      strength: 7,
      description: 'Carpi의 태스크 지향 접근은 이 서베이가 정리한 코드북 피드백의 근본 한계를 극복하려는 시도.',
    });
  }

  if (relatedIds['2011.06099']) {
    relationships.push({
      from_paper_id: relatedIds['2011.06099'],
      to_paper_id: paperId,
      relationship_type: 'builds_on',
      strength: 6,
      description: 'CsiFBNet의 빔포밍 이득 기반 피드백은 이 서베이의 CDI 피드백 프레임워크를 DL로 확장한 것.',
    });
  }

  if (relationships.length > 0) {
    // Check for existing relationships to avoid duplicates
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
