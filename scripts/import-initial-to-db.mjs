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

function normalizeCategory(category, tags) {
  if (category !== 'representation_learning') {
    return { category, tags: tags ?? [] };
  }
  return {
    category: 'other',
    tags: Array.from(new Set([...(tags ?? []), 'representation_learning'])),
  };
}

function normalizeRelationship(fromId, toId, relationshipType, description, strength) {
  if (relationshipType === 'inspires') {
    return {
      from_paper_id: toId,
      to_paper_id: fromId,
      relationship_type: 'inspired_by',
      description,
      strength: strength ?? 5,
    };
  }
  return {
    from_paper_id: fromId,
    to_paper_id: toId,
    relationship_type: relationshipType,
    description,
    strength: strength ?? 5,
  };
}

const root = process.cwd();
const env = loadEnv(path.join(root, '.env.local'));
if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('Missing Supabase env vars in .env.local');
  process.exit(1);
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const payload = JSON.parse(
  fs.readFileSync(path.join(root, 'public', 'data', 'initial-papers.json'), 'utf8')
);

const ALLOWED_PAPER_COLUMNS = new Set([
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

const existingPapersRes = await supabase
  .from('papers')
  .select('id,title,year');
if (existingPapersRes.error) {
  console.error(existingPapersRes.error);
  process.exit(1);
}

const paperIdByTitleYear = new Map();
const paperIdByTitle = new Map();
for (const paper of existingPapersRes.data ?? []) {
  paperIdByTitleYear.set(paperKey(paper.title, paper.year), paper.id);
  paperIdByTitle.set(paper.title.trim().toLowerCase(), paper.id);
}

let addedPapers = 0;
let skippedPapers = 0;
let failedPapers = 0;

for (const paper of payload.papers ?? []) {
  const key = paperKey(paper.title, paper.year);
  if (paperIdByTitleYear.has(key)) {
    skippedPapers += 1;
    continue;
  }

  const normalized = normalizeCategory(paper.category, paper.tags);
  const insertPayloadRaw = {
    ...paper,
    category: normalized.category,
    tags: normalized.tags,
  };
  const insertPayload = Object.fromEntries(
    Object.entries(insertPayloadRaw).filter(([key]) => ALLOWED_PAPER_COLUMNS.has(key))
  );

  const { data, error } = await supabase
    .from('papers')
    .insert(insertPayload)
    .select('id,title,year')
    .single();

  if (error) {
    console.error(`Paper insert failed: ${paper.title}`, error.message);
    failedPapers += 1;
    continue;
  }

  addedPapers += 1;
  paperIdByTitleYear.set(key, data.id);
  paperIdByTitle.set(data.title.trim().toLowerCase(), data.id);
}

const existingRelsRes = await supabase
  .from('paper_relationships')
  .select('from_paper_id,to_paper_id,relationship_type');
if (existingRelsRes.error) {
  console.error(existingRelsRes.error);
  process.exit(1);
}

const relKey = (item) =>
  `${item.from_paper_id}::${item.to_paper_id}::${item.relationship_type}`;
const existingRelKeys = new Set((existingRelsRes.data ?? []).map(relKey));

let addedRelationships = 0;
let skippedRelationships = 0;
let unresolvedRelationships = 0;

for (const relationship of payload.relationships ?? []) {
  const fromId = paperIdByTitle.get(relationship.from_title.trim().toLowerCase());
  const toId = paperIdByTitle.get(relationship.to_title.trim().toLowerCase());

  if (!fromId || !toId) {
    unresolvedRelationships += 1;
    continue;
  }

  const normalized = normalizeRelationship(
    fromId,
    toId,
    relationship.relationship_type,
    relationship.description ?? undefined,
    relationship.strength
  );

  const key = relKey(normalized);
  if (existingRelKeys.has(key)) {
    skippedRelationships += 1;
    continue;
  }

  const { error } = await supabase.from('paper_relationships').insert(normalized);
  if (error) {
    if (error.message?.includes('duplicate key')) {
      skippedRelationships += 1;
      continue;
    }
    console.error('Relationship insert failed:', relationship.from_title, '->', relationship.to_title, error.message);
    continue;
  }

  existingRelKeys.add(key);
  addedRelationships += 1;
}

console.log(
  JSON.stringify(
    {
      addedPapers,
      skippedPapers,
      failedPapers,
      addedRelationships,
      skippedRelationships,
      unresolvedRelationships,
    },
    null,
    2
  )
);
