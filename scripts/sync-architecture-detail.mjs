/**
 * 기존 DB 논문에 architecture_detail + 한국어 설명을 동기화하는 스크립트
 */
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read .env.local manually
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
for (const line of envContent.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx > 0) {
    env[trimmed.substring(0, eqIdx).trim()] = trimmed.substring(eqIdx + 1).trim();
  }
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const jsonPath = path.join(__dirname, '..', 'public', 'data', 'initial-papers.json');
  const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

  const { data: dbPapers, error } = await supabase
    .from('papers')
    .select('id, title, year')
    .order('year', { ascending: false });

  if (error) {
    console.error('Error fetching papers:', error);
    process.exit(1);
  }

  console.log(`DB papers: ${dbPapers.length}, JSON papers: ${jsonData.papers.length}`);

  let updated = 0;
  let skipped = 0;
  let notFound = 0;

  for (const jsonPaper of jsonData.papers) {
    const dbPaper = dbPapers.find(
      (p) => p.title.trim().toLowerCase() === jsonPaper.title.trim().toLowerCase() && p.year === jsonPaper.year
    );

    if (!dbPaper) {
      console.log(`  NOT FOUND: ${jsonPaper.title.substring(0, 50)}`);
      notFound++;
      continue;
    }

    const updateData = {
      architecture_detail: jsonPaper.architecture_detail || null,
      abstract: jsonPaper.abstract || null,
      key_contributions: jsonPaper.key_contributions || [],
      algorithms: jsonPaper.algorithms || [],
      key_equations: jsonPaper.key_equations || [],
    };

    const { error: updateError } = await supabase
      .from('papers')
      .update(updateData)
      .eq('id', dbPaper.id);

    if (updateError) {
      console.error(`  ERROR: ${jsonPaper.title.substring(0, 50)}: ${updateError.message}`);
    } else {
      updated++;
      console.log(`  OK: ${jsonPaper.title.substring(0, 60)}`);
    }
  }

  console.log(`\nDone: updated=${updated}, skipped=${skipped}, notFound=${notFound}`);
}

main().catch(console.error);
