#!/usr/bin/env node
/**
 * Add relationships for the 3 CSI quantization/feedback papers.
 * Run after add-quantization-feedback-papers.mjs
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
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function main() {
  // Find paper IDs by searching titles
  const { data: allPapers } = await supabase.from('papers').select('id, title');
  const find = (kw) => {
    const p = allPapers.find(p => p.title.toLowerCase().includes(kw.toLowerCase()));
    return p ? p.id : null;
  };

  const LOVE_ID   = find('Grassmannian Beamforming');
  const JINDAL_ID = find('MIMO Broadcast Channels');
  const CARPI_ID  = find('Precoding-oriented');
  const CSINET_ID = find('CsiNet');
  const VQ_VAE_ID = find('VQ-VAE') || find('Vector Quantized');

  console.log('Paper IDs:');
  console.log('  Love & Heath:', LOVE_ID);
  console.log('  Jindal:', JINDAL_ID);
  console.log('  Carpi:', CARPI_ID);
  console.log('  CsiNet:', CSINET_ID);
  console.log('  VQ-VAE:', VQ_VAE_ID);

  if (!LOVE_ID || !JINDAL_ID || !CARPI_ID) {
    console.error('Cannot find all 3 new papers. Aborting.');
    return;
  }

  const RELATIONSHIPS = [
    {
      from_paper_id: LOVE_ID,
      to_paper_id: JINDAL_ID,
      relationship_type: 'inspires',
      description: 'Jindal의 MIMO BC 유한 피드백 분석은 Love & Heath의 Grassmannian 코드북 설계를 다중사용자 시나리오로 확장한다. 코드북 기반 채널 방향 양자화의 오차 모델을 브로드캐스트 채널의 레이트 손실 분석에 활용.',
      strength: 9,
    },
    {
      from_paper_id: JINDAL_ID,
      to_paper_id: CARPI_ID,
      relationship_type: 'inspires',
      description: 'Carpi의 프리코딩 지향 피드백은 Jindal이 밝힌 "피드백 비트 대비 레이트 손실" 트레이드오프를 딥러닝으로 최적화하려는 시도. Jindal의 스케일링 법칙은 DL 기반 피드백의 성능 기준선으로 활용된다.',
      strength: 8,
    },
    {
      from_paper_id: LOVE_ID,
      to_paper_id: CARPI_ID,
      relationship_type: 'inspires',
      description: 'Carpi의 연구는 Love & Heath의 코드북 기반 고정 구조 양자화를 학습 기반 적응적 양자화로 대체한다. Grassmannian 코드북이 고정된 구조적 코드북이라면, DNN 인코더는 채널 통계에 적응하는 학습된 코드북에 해당.',
      strength: 7,
    },
  ];

  // CsiNet relationship
  if (CSINET_ID) {
    RELATIONSHIPS.push({
      from_paper_id: CARPI_ID,
      to_paper_id: CSINET_ID,
      relationship_type: 'challenges',
      description: 'Carpi는 CsiNet의 MSE 기반 채널 복원이 프리코딩 최적이 아님을 보인다. 합산 전송률을 직접 최적화하는 종단간 접근이 특히 낮은 피드백에서 우수.',
      strength: 8,
    });
    RELATIONSHIPS.push({
      from_paper_id: CSINET_ID,
      to_paper_id: LOVE_ID,
      relationship_type: 'builds_on',
      description: 'CsiNet은 Love & Heath의 코드북 기반 채널 양자화를 오토인코더 기반 비선형 학습 압축으로 대체한다. Grassmannian 코드북이 고정 구조적 코드북이라면, CsiNet은 채널 통계에 적응하는 학습된 코드북.',
      strength: 7,
    });
  }

  // VQ-VAE relationship
  if (VQ_VAE_ID) {
    RELATIONSHIPS.push({
      from_paper_id: LOVE_ID,
      to_paper_id: VQ_VAE_ID,
      relationship_type: 'related',
      description: 'Love & Heath의 Grassmannian 코드북은 고전적 구조적 양자화이고, VQ-VAE는 학습 기반 벡터 양자화. 둘 다 채널 정보를 이산 코드워드로 양자화하는 문제를 다룸.',
      strength: 6,
    });
  }

  let ok = 0;
  for (const rel of RELATIONSHIPS) {
    const { error } = await supabase.from('paper_relationships').insert(rel);
    if (error) {
      if (error.message?.includes('duplicate') || error.code === '23505') {
        console.log('  Already exists:', rel.description.substring(0, 50));
      } else {
        console.error('  Insert failed:', error.message);
      }
    } else {
      ok++;
      console.log('  Added:', rel.relationship_type, '(strength', rel.strength + ')');
    }
  }
  console.log(`\nDone: ${ok}/${RELATIONSHIPS.length} relationships added.`);
}

main().catch(console.error);
