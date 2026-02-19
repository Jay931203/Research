#!/usr/bin/env node

/**
 * Verify papers in Supabase against primary metadata sources.
 *
 * Sources:
 * - Crossref (DOI lookup, title search)
 * - DBLP (title lookup)
 *
 * Output:
 * - docs/paper-verification-report.json
 * - docs/paper-verification-report.md
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { createClient } from '@supabase/supabase-js';

const ROOT = process.cwd();
const ENV_PATH = path.join(ROOT, '.env.local');
const REPORT_JSON = path.join(ROOT, 'docs', 'paper-verification-report.json');
const REPORT_MD = path.join(ROOT, 'docs', 'paper-verification-report.md');

function loadEnv(filePath) {
  const env = {};
  if (!fs.existsSync(filePath)) return env;

  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    if (!line || line.trim().startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx < 0) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

function normalizeTitle(value) {
  return (value || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function diceCoefficient(a, b) {
  const x = normalizeTitle(a);
  const y = normalizeTitle(b);
  if (!x || !y) return 0;
  if (x === y) return 1;
  if (x.length < 2 || y.length < 2) return x === y ? 1 : 0;

  const bigramsX = new Map();
  for (let i = 0; i < x.length - 1; i += 1) {
    const bg = x.slice(i, i + 2);
    bigramsX.set(bg, (bigramsX.get(bg) || 0) + 1);
  }

  let overlap = 0;
  for (let i = 0; i < y.length - 1; i += 1) {
    const bg = y.slice(i, i + 2);
    const count = bigramsX.get(bg) || 0;
    if (count > 0) {
      overlap += 1;
      bigramsX.set(bg, count - 1);
    }
  }

  return (2 * overlap) / (x.length - 1 + (y.length - 1));
}

function parseCrossrefYear(item) {
  const candidates = [
    item?.published?.['date-parts']?.[0]?.[0],
    item?.issued?.['date-parts']?.[0]?.[0],
    item?.['published-print']?.['date-parts']?.[0]?.[0],
    item?.['published-online']?.['date-parts']?.[0]?.[0],
    item?.created?.['date-parts']?.[0]?.[0],
  ].filter((v) => typeof v === 'number');

  return candidates[0] ?? null;
}

function parseCrossrefVenue(item) {
  return (
    item?.['container-title']?.[0] ||
    item?.['short-container-title']?.[0] ||
    null
  );
}

function parseCrossrefAuthors(item) {
  if (!Array.isArray(item?.author)) return [];
  return item.author
    .map((author) => {
      const given = author?.given || '';
      const family = author?.family || '';
      return `${given} ${family}`.trim();
    })
    .filter(Boolean);
}

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'csiautoencoder-verifier/1.0 (local script)',
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    return { ok: false, status: res.status, body };
  }
  return { ok: true, data: await res.json() };
}

async function verifyViaDoi(doi) {
  const encoded = encodeURIComponent(doi);
  const url = `https://api.crossref.org/works/${encoded}`;
  const response = await fetchJson(url);
  if (!response.ok) {
    return {
      found: false,
      source: 'crossref_doi',
      statusCode: response.status,
    };
  }

  const item = response.data?.message;
  if (!item) {
    return {
      found: false,
      source: 'crossref_doi',
      statusCode: 200,
    };
  }

  return {
    found: true,
    source: 'crossref_doi',
    title: item?.title?.[0] || null,
    doi: item?.DOI || null,
    year: parseCrossrefYear(item),
    venue: parseCrossrefVenue(item),
    authors: parseCrossrefAuthors(item),
  };
}

async function verifyViaDblpTitle(title) {
  const quoted = `"${title}"`;
  const url = `https://dblp.org/search/publ/api?q=${encodeURIComponent(
    quoted
  )}&h=5&format=json`;
  const response = await fetchJson(url);
  if (!response.ok) {
    return { found: false, source: 'dblp_title', statusCode: response.status };
  }

  const hits = response.data?.result?.hits?.hit || [];
  const items = Array.isArray(hits) ? hits : [hits];
  if (!items.length) return { found: false, source: 'dblp_title', statusCode: 200 };

  let best = null;
  for (const hit of items) {
    const info = hit?.info || {};
    const hitTitle = info?.title || '';
    const score = diceCoefficient(title, hitTitle);
    if (!best || score > best.score) {
      best = {
        score,
        title: hitTitle || null,
        doi: info?.doi || null,
        year: info?.year ? Number(info.year) : null,
        venue: info?.venue || null,
      };
    }
  }

  if (!best) return { found: false, source: 'dblp_title', statusCode: 200 };
  return {
    found: true,
    source: 'dblp_title',
    ...best,
  };
}

async function verifyViaCrossrefTitle(title) {
  const url = `https://api.crossref.org/works?query.title=${encodeURIComponent(
    title
  )}&rows=5`;
  const response = await fetchJson(url);
  if (!response.ok) {
    return {
      found: false,
      source: 'crossref_title',
      statusCode: response.status,
    };
  }

  const items = response.data?.message?.items || [];
  if (!items.length) {
    return {
      found: false,
      source: 'crossref_title',
      statusCode: 200,
    };
  }

  let best = null;
  for (const item of items) {
    const hitTitle = item?.title?.[0] || '';
    const score = diceCoefficient(title, hitTitle);
    if (!best || score > best.score) {
      best = {
        score,
        title: hitTitle || null,
        doi: item?.DOI || null,
        year: parseCrossrefYear(item),
        venue: parseCrossrefVenue(item),
        authors: parseCrossrefAuthors(item),
      };
    }
  }

  if (!best) {
    return {
      found: false,
      source: 'crossref_title',
      statusCode: 200,
    };
  }

  return {
    found: true,
    source: 'crossref_title',
    ...best,
  };
}

function chooseStatus(row, match) {
  const hasDoi = !!row.doi;
  if (!match.found) {
    return hasDoi ? 'unverified_doi' : 'unverified_title';
  }

  const score = match.score ?? diceCoefficient(row.title, match.title || '');
  const yearDelta =
    typeof row.year === 'number' && typeof match.year === 'number'
      ? Math.abs(row.year - match.year)
      : null;

  if (hasDoi) {
    if (score >= 0.92 && (yearDelta === null || yearDelta <= 1)) {
      return 'verified_doi_strong';
    }
    if (score >= 0.75) {
      return 'verified_doi_weak';
    }
    return 'mismatch_doi';
  }

  if (score >= 0.92 && (yearDelta === null || yearDelta <= 1)) {
    return 'verified_title_strong';
  }
  if (score >= 0.80) {
    return 'verified_title_weak';
  }
  return 'unverified_title';
}

function buildMarkdownReport(report) {
  const lines = [];
  lines.push('# Paper Verification Report');
  lines.push('');
  lines.push(`Generated at: ${report.generated_at}`);
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(`- Total papers: ${report.summary.total}`);
  lines.push(`- Strongly verified: ${report.summary.strong_verified}`);
  lines.push(`- Weakly verified: ${report.summary.weak_verified}`);
  lines.push(`- DOI mismatches: ${report.summary.mismatch_doi}`);
  lines.push(`- Unverified: ${report.summary.unverified}`);
  lines.push(`- Auto-fix candidates: ${report.summary.auto_fix_candidates}`);
  lines.push('');
  lines.push('## Auto-Fix Candidates');
  lines.push('');

  if (!report.auto_fix_candidates.length) {
    lines.push('- None');
  } else {
    for (const item of report.auto_fix_candidates) {
      lines.push(
        `- ${item.title} -> ${item.suggested_title} (DOI: ${item.suggested_doi || 'n/a'})`
      );
    }
  }

  lines.push('');
  lines.push('## Unverified Papers');
  lines.push('');
  if (!report.unverified.length) {
    lines.push('- None');
  } else {
    for (const item of report.unverified) {
      lines.push(`- ${item.title} (${item.year ?? 'n/a'})`);
    }
  }

  lines.push('');
  lines.push('## Detailed Results');
  lines.push('');
  lines.push('| Title | Year | DOI | Status | Source | Score | Matched Title | Matched DOI |');
  lines.push('|---|---:|---|---|---|---:|---|---|');
  for (const item of report.results) {
    lines.push(
      `| ${item.title.replace(/\|/g, '\\|')} | ${item.year ?? ''} | ${
        item.doi ?? ''
      } | ${item.status} | ${item.source ?? ''} | ${(item.score ?? 0).toFixed(
        3
      )} | ${(item.matched_title ?? '').replace(/\|/g, '\\|')} | ${
        item.matched_doi ?? ''
      } |`
    );
  }

  lines.push('');
  lines.push('## Sources');
  lines.push('');
  lines.push('- https://api.crossref.org');
  lines.push('- https://dblp.org/search/publ/api');
  lines.push('');

  return lines.join('\n');
}

async function main() {
  const env = loadEnv(ENV_PATH);
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  const supabase = createClient(url, anon);
  const { data: papers, error } = await supabase
    .from('papers')
    .select('id,title,year,venue,doi,authors,arxiv_id');

  if (error) {
    throw new Error(`Failed to fetch papers: ${error.message}`);
  }

  const results = [];
  const autoFixCandidates = [];
  const unverified = [];

  for (let i = 0; i < papers.length; i += 1) {
    const row = papers[i];
    let match = null;

    if (row.doi) {
      match = await verifyViaDoi(row.doi);
    } else {
      const dblpMatch = await verifyViaDblpTitle(row.title);
      if (dblpMatch.found && dblpMatch.score >= 0.80) {
        match = dblpMatch;
      } else {
        match = await verifyViaCrossrefTitle(row.title);
      }
    }

    const score = match?.score ?? diceCoefficient(row.title, match?.title || '');
    const status = chooseStatus(row, match || { found: false });

    const item = {
      id: row.id,
      title: row.title,
      year: row.year,
      doi: row.doi,
      status,
      source: match?.source || null,
      score,
      matched_title: match?.title || null,
      matched_doi: match?.doi || null,
      matched_year: match?.year || null,
      matched_venue: match?.venue || null,
      matched_authors: match?.authors || null,
    };
    results.push(item);

    if (
      (status === 'mismatch_doi' ||
        status === 'verified_doi_weak' ||
        status === 'verified_title_strong' ||
        status === 'verified_title_weak') &&
      match?.found &&
      match?.doi &&
      (match.doi !== row.doi || score < 0.99)
    ) {
      autoFixCandidates.push({
        id: row.id,
        title: row.title,
        suggested_title: match.title,
        suggested_doi: match.doi,
        suggested_year: match.year,
        suggested_venue: match.venue,
        suggested_authors: match.authors || [],
        score,
        source: match.source,
      });
    }

    if (status.startsWith('unverified')) {
      unverified.push({
        id: row.id,
        title: row.title,
        year: row.year,
        doi: row.doi,
      });
    }

    // Keep API pressure moderate.
    await new Promise((resolve) => setTimeout(resolve, 120));
  }

  const summary = {
    total: results.length,
    strong_verified: results.filter(
      (item) => item.status === 'verified_doi_strong' || item.status === 'verified_title_strong'
    ).length,
    weak_verified: results.filter(
      (item) => item.status === 'verified_doi_weak' || item.status === 'verified_title_weak'
    ).length,
    mismatch_doi: results.filter((item) => item.status === 'mismatch_doi').length,
    unverified: unverified.length,
    auto_fix_candidates: autoFixCandidates.length,
  };

  const report = {
    generated_at: new Date().toISOString(),
    summary,
    auto_fix_candidates: autoFixCandidates,
    unverified,
    results: results.sort((a, b) => a.title.localeCompare(b.title)),
  };

  fs.mkdirSync(path.dirname(REPORT_JSON), { recursive: true });
  fs.writeFileSync(REPORT_JSON, JSON.stringify(report, null, 2), 'utf8');
  fs.writeFileSync(REPORT_MD, buildMarkdownReport(report), 'utf8');

  console.log(`Verified ${summary.total} papers`);
  console.log(JSON.stringify(summary, null, 2));
  console.log(`JSON report: ${path.relative(ROOT, REPORT_JSON)}`);
  console.log(`Markdown report: ${path.relative(ROOT, REPORT_MD)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

