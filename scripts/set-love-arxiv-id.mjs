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
  // Set a custom arxiv_id for Love & Heath (no actual arXiv, use DOI-based identifier)
  const { error } = await supabase
    .from('papers')
    .update({ arxiv_id: 'love-heath-2003' })
    .eq('id', 'a95c1f02-2f8d-4d49-b36b-830a490f034b');

  if (error) console.error('Error:', error.message);
  else console.log('Set arxiv_id for Love & Heath to "love-heath-2003"');
}

main().catch(console.error);
