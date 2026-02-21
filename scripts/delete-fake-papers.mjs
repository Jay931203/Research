#!/usr/bin/env node
/**
 * Delete confirmed fake / unverifiable papers from Supabase.
 * Run: node scripts/delete-fake-papers.mjs
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

// ── Papers to delete ────────────────────────────────────────────────────────
// Verified via Crossref, DBLP, IEEE Xplore, arXiv on 2026-02-21
// Reason codes:
//   FAKE_DOI   – DOI resolves to nothing in Crossref
//   WRONG_DOI  – DOI resolves to a completely different paper
//   FABRICATED – No DOI, concept known but this specific paper not found anywhere
//   UNCERTAIN  – DOI unresolvable + could not confirm via title search either

const TO_DELETE = [
  // === CONFIRMED FAKE (DOI resolves to nothing) ===
  { id: 'f7b136c9-0921-43c7-93af-3cb3a1843f24', title: 'Vector Quantized CSI Feedback with Learned Codebook',                                      reason: 'FAKE_DOI – 10.1109/LSP.2023.3289234 does not exist' },
  { id: 'c2613f7a-b252-4b57-b3f9-a76aaea0bf14', title: 'Generative Diffusion Model-Enhanced CSI Feedback',                                          reason: 'FAKE_DOI – 10.1109/TWC.2024.3378901 does not exist' },
  { id: 'a1d157c1-5fab-4857-acf4-020b13287ff9', title: 'CsiNet-LSTM: A Deep Learning Architecture for Compressive CSI Estimation and Feedback in FDD Massive MIMO', reason: 'FAKE_DOI – 10.1109/TWC.2020.3006080 does not exist; real paper is IEEE WCL 2019' },
  { id: '03eee0a8-7c5f-4816-b8e9-147283c85099', title: 'CRNet: A Deep-Learning Framework for CSI Feedback in Massive MIMO',                          reason: 'WRONG_DOI – real CRNet is ICC 2020 conference paper (10.1109/ICC40277.2020.9149229), not TWC journal' },
  { id: '9c0a6384-5ef8-4151-824c-6287e6fef87f', title: 'DS-NLCsiNet: Exploiting Non-Local Neural Networks for Massive MIMO CSI Feedback',            reason: 'FAKE_DOI – 10.1109/LCOMM.2021.3073475 does not exist; real DOI is 10.1109/LCOMM.2020.3019653 (2020)' },
  { id: '4ffeb89f-5b53-4d08-96e2-4a2860de55a9', title: 'Binarized Neural Network for CSI Feedback in Massive MIMO Systems',                          reason: 'FAKE_DOI – 10.1109/LWC.2021.3088837 does not exist; real DOI is 10.1109/LWC.2021.3064963' },
  { id: '54dbf30d-b8b2-42a0-8818-f2a8ce7e79e0', title: 'Ternary Neural Network for Extreme-Efficient CSI Feedback',                                  reason: 'FABRICATED – DOI 10.1109/LCOMM.2023.3301234 does not exist; paper not found anywhere' },
  { id: 'baa25ef0-3ac5-46c4-a7f4-5b3a158c3922', title: 'TransNet: Full Attention Network for CSI Feedback in FDD Massive MIMO',                       reason: 'FAKE_DOI – 10.1109/LWC.2021.3132629 does not exist; real DOI is 10.1109/LWC.2022.3149416' },
  { id: '48406e2e-59a1-4f9e-8dd4-9b631ee08880', title: 'ENet: Efficient CSI Feedback for Massive MIMO Communications',                                reason: 'WRONG_DOI – real paper is IEEE WCL 2021 (10.1109/LWC.2021.3083331), not IEEE Access 2020' },
  { id: 'cd1ad44c-1607-44b0-92d3-dabbb54ea026', title: 'Pruning Deep Neural Networks for Efficient CSI Feedback',                                     reason: 'FABRICATED – DOI 10.1109/LCOMM.2023.3245112 does not exist; paper not found anywhere' },
  { id: '22e6da1b-a5f2-4d18-a308-555a47c66387', title: 'ACRNet: Aggregation Cross-Domain Network for CSI Feedback in Massive MIMO',                  reason: 'FAKE_DOI – 10.1109/TWC.2022.3183226 resolves to unrelated paper; real ACRNet DOI is 10.1109/TWC.2022.3141653 (already in DB as BAQ paper)' },
  { id: '4dc6d7f6-25e9-4f77-8699-02d69ee0fab8', title: 'CSI-GPT: Integrating Generative Pre-Trained Transformer with Federated-Tuning for Channel Estimation in Massive MIMO', reason: 'WRONG_DOI – real paper is IEEE TVT (10.1109/TVT.2024.3493463), not TWC' },
  { id: 'ee49cab7-aab5-4767-ae7f-89500170b172', title: 'Deep Learning Based CSI Feedback Approach for Time-Varying Massive MIMO Channels',            reason: 'FAKE_DOI – 10.1109/LWC.2021.3073474 does not exist; real paper is IEEE WCL 2019 (10.1109/LWC.2018.2874264)' },
  { id: '423a1669-714a-4ba0-820e-d109f7b36963', title: 'Lightweight and Effective CSI Feedback for Massive MIMO Systems',                              reason: 'FAKE_DOI – 10.1109/TWC.2021.3130271 does not resolve to any CSI feedback paper' },

  // === MISMATCH DOI (resolves to a completely different paper) ===
  { id: 'd2be3d99-d476-4aed-bd3b-9f14c0a1d0d6', title: 'Attention Mechanism-Based CSI Feedback Network for Massive MIMO Systems',                     reason: 'WRONG_DOI – 10.1049/cmu2.12155 is a sensor node localization paper (Singh & Mittal, IET Comms 2021)' },
  { id: 'b40014fd-5d5d-4f6f-9ed2-09c3b379675b', title: 'Joint Compression and Quantization for Practical CSI Feedback',                              reason: 'WRONG_DOI – 10.1109/JSAC.2024.3389123 is "Self-Optimizing Near and Far-Field MIMO Transmit Waveforms" (completely unrelated)' },

  // === UNCERTAIN (DOI unresolvable; could not confirm via any source) ===
  { id: 'fb5b8db1-7520-4806-b2e1-82eea1d2810e', title: 'ShuffleCsiNet: Lightweight CSI Feedback Network Based on ShuffleNet Architecture',            reason: 'UNCERTAIN – DOI 10.1109/TVT.2023.3256789 unresolvable; paper not confirmed in IEEE or arXiv' },
  { id: 'c0658d2f-342c-4341-b87f-c176f0df35b4', title: 'Adaptive Bit Allocation for Deep Learning-Based CSI Feedback',                               reason: 'UNCERTAIN – DOI 10.1109/LWC.2023.3278125 unresolvable; paper not confirmed anywhere' },
  { id: '41028611-80ee-4b59-a3bd-55accff8dba0', title: 'Knowledge Distillation-Based DNN for CSI Feedback in Massive MIMO Systems',                   reason: 'UNCERTAIN – DOI 10.1109/TVT.2022.3165837 unresolvable; paper not confirmed anywhere' },
  { id: 'be746364-1b4e-47bf-b32d-841d8a5997ba', title: 'Quantization of Deep Neural Networks for Accurate CSI Feedback',                             reason: 'UNCERTAIN – DOI 10.1109/LWC.2022.3159168 unresolvable; paper not confirmed anywhere' },
  { id: '1ad6c247-6284-4df9-bc38-f8bc7b24fcc6', title: 'Deep Learning-Based CSI Feedback with Variable Length Codewords for Adaptive FDD Massive MIMO', reason: 'UNCERTAIN – DOI 10.1109/LWC.2019.2921137 unresolvable; paper not confirmed anywhere' },
  { id: '59d741c5-d62f-41f8-a7e3-90cf52d79922', title: 'LVM4CF: CSI Feedback with Offline Large Vision Models',                                      reason: 'UNCERTAIN – exact paper not confirmed; similar but different papers exist (arXiv:2505.08566)' },
];

async function main() {
  const env = loadEnv(ENV_PATH);
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const ids = TO_DELETE.map(p => p.id);

  console.log(`\nDeleting ${ids.length} fake/unverifiable papers...\n`);

  // 1. Delete relationships (both directions)
  const { error: relErr } = await supabase
    .from('paper_relationships')
    .delete()
    .or(`from_paper_id.in.(${ids.map(id => `"${id}"`).join(',')}),to_paper_id.in.(${ids.map(id => `"${id}"`).join(',')})`);
  if (relErr) {
    // Try split deletes if the combined OR syntax fails
    const { error: e1 } = await supabase.from('paper_relationships').delete().in('from_paper_id', ids);
    const { error: e2 } = await supabase.from('paper_relationships').delete().in('to_paper_id', ids);
    if (e1) console.warn('Warning (from_paper_id):', e1.message);
    if (e2) console.warn('Warning (to_paper_id):', e2.message);
  }
  console.log('✓ Cleared related paper_relationships');

  // 2. Delete notes
  const { error: noteErr } = await supabase.from('user_notes').delete().in('paper_id', ids);
  if (noteErr) console.warn('Warning (user_notes):', noteErr.message);
  else console.log('✓ Cleared related user_notes');

  // 3. Delete papers
  const { data, error: paperErr } = await supabase.from('papers').delete().in('id', ids).select('id, title');
  if (paperErr) {
    console.error('ERROR deleting papers:', paperErr.message);
    process.exit(1);
  }

  console.log(`\n✅ Deleted ${data?.length ?? 0} papers:\n`);
  for (const p of TO_DELETE) {
    const deleted = data?.find(d => d.id === p.id);
    console.log(`  ${deleted ? '✓' : '✗ NOT FOUND'} ${p.title}`);
    console.log(`    → ${p.reason}\n`);
  }

  // 4. Count remaining
  const { count } = await supabase.from('papers').select('*', { count: 'exact', head: true });
  console.log(`\n📊 Remaining papers in DB: ${count}`);
}

main().catch(err => { console.error(err); process.exit(1); });
