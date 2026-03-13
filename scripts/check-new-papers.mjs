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

async function main() {
  // Check for duplicates
  const { data: precoding } = await supabase.from('papers').select('id, title, year').ilike('title', '%Precoding%');
  console.log('Precoding papers:', JSON.stringify(precoding, null, 2));

  const { data: grass } = await supabase.from('papers').select('id, title, year').ilike('title', '%Grassmannian%');
  console.log('Grassmannian papers:', JSON.stringify(grass, null, 2));

  const { data: jindal } = await supabase.from('papers').select('id, title, year').ilike('title', '%Broadcast%');
  console.log('Broadcast papers:', JSON.stringify(jindal, null, 2));

  const { data: vqvae } = await supabase.from('papers').select('id, title, year').or('title.ilike.%VQ-VAE%,title.ilike.%Vector Quantized%');
  console.log('VQ-VAE papers:', JSON.stringify(vqvae, null, 2));
}

main().catch(console.error);
