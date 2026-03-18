import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

import pg from 'pg';
import fs from 'fs';
import path from 'path';

const { Client } = pg;

// Supabase direct DB connection
const client = new Client({
  host: '2406:da1c:f42:ae09:bdb3:3307:90f:504f',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'JCZtxJuSZgzqzmz9',
  ssl: { rejectUnauthorized: false }
});

console.log('Connecting via IPv6...');

async function runMigration(filePath) {
  const sql = fs.readFileSync(filePath, 'utf-8');
  const fileName = path.basename(filePath);
  console.log(`\n>>> Running: ${fileName}`);
  try {
    await client.query(sql);
    console.log(`✓ ${fileName} — success`);
  } catch (err) {
    console.error(`✗ ${fileName} — error:`, err.message);
    throw err;
  }
}

async function main() {
  await client.connect();
  console.log('Connected to Supabase DB');

  try {
    await runMigration('supabase/migrations/014_add_3gpp_and_mas_categories.sql');
    await runMigration('supabase/migrations/015_seed_3gpp_and_mas_papers.sql');
  } finally {
    await client.end();
    console.log('\nConnection closed');
  }
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
