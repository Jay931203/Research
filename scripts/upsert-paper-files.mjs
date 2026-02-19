#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
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

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: node scripts/upsert-paper-files.mjs <paper_json_path> [<paper_json_path> ...]');
  process.exit(1);
}

const root = process.cwd();
const env = loadEnv(path.join(root, '.env.local'));
if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const ALLOWED_COLUMNS = new Set([
  'id',
  'title',
  'authors',
  'year',
  'venue',
  'doi',
  'arxiv_id',
  'abstract',
  'key_contributions',
  'algorithms',
  'key_equations',
  'category',
  'tags',
  'pdf_url',
  'code_url',
  'notes_summary',
  'color_hex',
  'icon_name',
  'architecture_detail',
]);

for (const argPath of args) {
  const filePath = path.isAbsolute(argPath) ? argPath : path.join(root, argPath);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${argPath}`);
    process.exitCode = 1;
    continue;
  }

  const rawPayload = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const payload = Object.fromEntries(
    Object.entries(rawPayload).filter(([key]) => ALLOWED_COLUMNS.has(key))
  );
  if (!payload.id) {
    console.error(`Missing id in file: ${argPath}`);
    process.exitCode = 1;
    continue;
  }

  const { data, error } = await supabase
    .from('papers')
    .upsert(payload, { onConflict: 'id' })
    .select('id,title,year,venue,updated_at')
    .single();

  if (error) {
    console.error(`Upsert failed (${argPath}): ${error.message}`);
    process.exitCode = 1;
    continue;
  }

  console.log(JSON.stringify(data));
}
