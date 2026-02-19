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

function paperKey(title, year) {
  return `${title.trim().toLowerCase()}::${year}`;
}

const root = process.cwd();
const env = loadEnv(path.join(root, '.env.local'));
if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('Missing Supabase env vars');
  process.exit(1);
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const payload = JSON.parse(
  fs.readFileSync(path.join(root, 'public', 'data', 'initial-papers.json'), 'utf8')
);

const repPapers = (payload.papers ?? []).filter(
  (paper) =>
    paper.category === 'representation_learning' ||
    (paper.tags ?? []).includes('representation_learning')
);

const dbRowsRes = await supabase
  .from('papers')
  .select('id,title,year,tags')
  .contains('tags', ['representation_learning']);

if (dbRowsRes.error) {
  console.error(dbRowsRes.error);
  process.exit(1);
}

const idByKey = new Map();
for (const row of dbRowsRes.data ?? []) {
  idByKey.set(paperKey(row.title, row.year), row.id);
}

let updated = 0;
let missing = 0;
let failed = 0;

for (const paper of repPapers) {
  const id = idByKey.get(paperKey(paper.title, paper.year));
  if (!id) {
    missing += 1;
    continue;
  }

  const normalizedTags = Array.from(
    new Set([...(paper.tags ?? []), 'representation_learning'])
  );

  const updatePayload = {
    abstract: paper.abstract,
    key_contributions: paper.key_contributions,
    algorithms: paper.algorithms,
    key_equations: paper.key_equations,
    architecture_detail: paper.architecture_detail,
    tags: normalizedTags,
    category: 'other',
    color_hex: paper.color_hex ?? '#0f766e',
  };

  const { error } = await supabase
    .from('papers')
    .update(updatePayload)
    .eq('id', id);

  if (error) {
    failed += 1;
    console.error(`update failed: ${paper.title}`, error.message);
    continue;
  }
  updated += 1;
}

console.log(
  JSON.stringify(
    {
      target: repPapers.length,
      updated,
      missing,
      failed,
    },
    null,
    2
  )
);
