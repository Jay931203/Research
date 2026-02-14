import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(readFileSync(resolve(__dirname, '../public/data/initial-papers.json'), 'utf-8'));
const korean = /[\uAC00-\uD7AF]/;

data.papers.forEach((p, i) => {
  if (!korean.test(p.title)) console.log(`[${i+1}] TITLE: ${p.title}`);
  (p.key_equations || []).forEach(eq => {
    if (!korean.test(eq.name)) console.log(`  EQ: ${eq.name}`);
  });
  if (!p.architecture_detail) console.log(`  ARCH MISSING: paper ${i+1}`);
});
