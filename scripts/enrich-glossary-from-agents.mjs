import fs from 'node:fs/promises';

const GLOSSARY_PATH = 'public/data/glossary.json';
const BATCH_PATHS = [
  'tmp/glossary_enrich_a.json',
  'tmp/glossary_enrich_b.json',
];

function stripBom(text) {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

function normalizeText(value) {
  return String(value ?? '')
    .replace(/\r\n?/g, '\n')
    .replace(/\u00a0/g, ' ')
    .trim();
}

function isCleanAlias(alias) {
  if (typeof alias !== 'string') return false;
  const trimmed = alias.trim();
  if (!trimmed) return false;
  if (!/[A-Za-z0-9]/.test(trimmed)) return false;
  return /^[\x20-\x7E]+$/.test(trimmed);
}

function sanitizeAliases(term) {
  const aliases = Array.isArray(term.aliases) ? term.aliases : [];
  const cleaned = aliases
    .filter(isCleanAlias)
    .map((alias) => alias.replace(/\s+/g, ' ').trim());

  if (cleaned.length === 0) return [term.name];
  return [...new Set(cleaned)];
}

function sanitizeHierarchy(term) {
  const hierarchy = Array.isArray(term.hierarchy) ? term.hierarchy : [];
  const cleaned = hierarchy
    .filter((item) => typeof item === 'string')
    .map((item) => item.replace(/\s+/g, ' ').trim())
    .filter((item) => item.length > 0 && item.length <= 80)
    .filter((item) => /^[A-Za-z0-9가-힣 _\-()/.+]+$/.test(item));

  if (cleaned.length > 0) return cleaned;

  if (term.category === 'architecture') return ['Architecture', 'Core Models', term.name];
  if (term.category === 'technique') return ['Technique', 'Methods', term.name];
  if (term.category === 'metric') return ['Metric', 'Evaluation', term.name];
  if (term.category === 'domain') return ['Domain', 'Problem Setup', term.name];
  return ['Training', 'Optimization', term.name];
}

async function loadBatchMap() {
  const merged = new Map();

  for (const filePath of BATCH_PATHS) {
    const raw = await fs.readFile(filePath, 'utf8');
    const parsed = JSON.parse(stripBom(raw));
    if (!Array.isArray(parsed)) {
      throw new Error(`${filePath} is not an array`);
    }

    for (const entry of parsed) {
      if (!entry?.id) continue;
      merged.set(entry.id, {
        description: normalizeText(entry.description),
        details_markdown: normalizeText(entry.details_markdown),
      });
    }
  }

  return merged;
}

async function main() {
  const glossaryRaw = await fs.readFile(GLOSSARY_PATH, 'utf8');
  const terms = JSON.parse(stripBom(glossaryRaw));
  if (!Array.isArray(terms)) {
    throw new Error(`${GLOSSARY_PATH} must be an array`);
  }

  const updates = await loadBatchMap();
  const missingIds = terms
    .map((term) => term.id)
    .filter((id) => !updates.has(id));

  if (missingIds.length > 0) {
    throw new Error(`Missing updates for ids: ${missingIds.join(', ')}`);
  }

  const nextTerms = terms.map((term) => {
    const update = updates.get(term.id);
    return {
      ...term,
      aliases: sanitizeAliases(term),
      hierarchy: sanitizeHierarchy(term),
      description: update.description,
      details_markdown: update.details_markdown,
    };
  });

  await fs.writeFile(GLOSSARY_PATH, `${JSON.stringify(nextTerms, null, 2)}\n`, 'utf8');
  console.log(`Updated ${nextTerms.length} glossary terms`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
