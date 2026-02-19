#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { createClient } from '@supabase/supabase-js';

function loadEnv(filePath) {
  const env = {};
  if (!fs.existsSync(filePath)) return env;
  for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    if (!line || line.trim().startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx < 0) continue;
    env[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  return env;
}

const [, , paperId, contentFileArg] = process.argv;

if (!paperId || !contentFileArg) {
  console.error(
    'Usage: node scripts/apply-paper-content.mjs <paper_id> <content_json_path>'
  );
  process.exit(1);
}

const root = process.cwd();
const contentPath = path.isAbsolute(contentFileArg)
  ? contentFileArg
  : path.join(root, contentFileArg);

if (!fs.existsSync(contentPath)) {
  console.error(`Content file not found: ${contentPath}`);
  process.exit(1);
}

const env = loadEnv(path.join(root, '.env.local'));
if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const payload = JSON.parse(fs.readFileSync(contentPath, 'utf8'));

const { data, error } = await supabase
  .from('papers')
  .update(payload)
  .eq('id', paperId)
  .select('id,title,updated_at')
  .single();

if (error) {
  console.error('Update failed:', error);
  process.exit(1);
}

console.log(JSON.stringify(data, null, 2));
