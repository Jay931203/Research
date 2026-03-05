#!/usr/bin/env node
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
    env[line.slice(0, idx).trim()] = line.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
  }
  return env;
}
const env = loadEnv(ENV_PATH);
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// Known IDs
const LOVE_ID   = 'a95c1f02-2f8d-4d49-b36b-830a490f034b';
const JINDAL_ID = '850ab0ab-c425-49e4-be8c-6038c23efd57';
const CARPI_ID  = 'd7f5443d-72f7-4cc3-9fbf-541d81968c7f';
const VQVAE_PRECODING_ID = 'c30301c0-da07-4000-8945-b65cd0891f65'; // MI-Regularized VQ-VAE
const VQVAE_ORIG_ID = 'ad25f2b0-b438-4868-a801-8a563b00e9f0'; // Neural Discrete VQ-VAE
const FSQ_ID = 'c4cc3d9d-2739-4012-a8bb-03421cb48870'; // FSQ

async function main() {
  // 1. Delete the wrong Love→c30301c0 relationship (it was meant for real VQ-VAE, not the precoding VQ-VAE)
  const { error: delErr } = await supabase
    .from('paper_relationships')
    .delete()
    .eq('from_paper_id', LOVE_ID)
    .eq('to_paper_id', VQVAE_PRECODING_ID);
  console.log('Deleted wrong relationship:', delErr ? delErr.message : 'OK');

  // 2. Add correct additional relationships
  const RELS = [
    // Carpi 2023 → VQ-VAE Precoding 2026 (inspires)
    {
      from_paper_id: CARPI_ID,
      to_paper_id: VQVAE_PRECODING_ID,
      relationship_type: 'inspires',
      description: 'Carpi의 프리코딩 지향 CSI 피드백 프레임워크를 MI-Regularized VQ-VAE가 VQ 기반 이산 양자화로 발전시킨다. 태스크 지향 손실 함수 아이디어를 계승.',
      strength: 9,
    },
    // Jindal → VQ-VAE Precoding (inspires)
    {
      from_paper_id: JINDAL_ID,
      to_paper_id: VQVAE_PRECODING_ID,
      relationship_type: 'inspires',
      description: 'Jindal의 피드백 비트 스케일링 법칙이 VQ-VAE 기반 프리코딩 지향 피드백의 이론적 동기와 성능 기준선을 제공.',
      strength: 7,
    },
    // Love & Heath → FSQ (related: codebook quantization lineage)
    {
      from_paper_id: LOVE_ID,
      to_paper_id: FSQ_ID,
      relationship_type: 'related',
      description: 'Love & Heath의 Grassmannian 코드북은 다양체 위의 구조적 양자화, FSQ는 스칼라 양자화로 코드북 학습을 단순화. 둘 다 CSI를 이산 코드워드로 표현하는 양자화 문제를 다룸.',
      strength: 5,
    },
  ];

  let ok = 0;
  for (const rel of RELS) {
    const { error } = await supabase.from('paper_relationships').insert(rel);
    if (error) {
      if (error.code === '23505') console.log('  Already exists:', rel.description.substring(0, 50));
      else console.error('  Failed:', error.message);
    } else {
      ok++;
      console.log('  Added:', rel.relationship_type, rel.strength);
    }
  }
  console.log(`Done: ${ok}/${RELS.length} added.`);
}

main().catch(console.error);
