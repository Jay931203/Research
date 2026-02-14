import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf-8');
const env = {};
for (const line of envContent.split(/\r?\n/)) {
  const t = line.trim();
  if (!t || t.startsWith('#')) continue;
  const i = t.indexOf('=');
  if (i > 0) env[t.substring(0, i).trim()] = t.substring(i + 1).trim();
}

const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const { data, error } = await sb.from('papers_with_notes').select('title, architecture_detail').limit(3);
if (error) { console.error('Error:', error.message); process.exit(1); }
data.forEach(p => {
  console.log('Title:', p.title.substring(0, 55));
  console.log('Arch:', (p.architecture_detail || 'NULL').substring(0, 100));
  console.log();
});
console.log('View works correctly with architecture_detail column.');
