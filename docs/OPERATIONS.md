# Operations Guide

This guide covers practical Git and database management for this project.

## Git Workflow

1. Initialize repository once (if `.git` is missing):
   - `git init`
   - `git add .`
   - `git commit -m "chore: bootstrap CSI AutoEncoder research workspace"`
2. Work in small topic branches:
   - `git checkout -b feat/mindmap-focus-panel`
   - `git checkout -b fix/import-relationship-normalization`
3. Keep commits small and reviewable:
   - `feat:` UI or behavior changes
   - `fix:` bug fixes
   - `chore:` maintenance scripts/docs
   - `db:` migration updates
4. Push often and protect `main` with PR review.

## Database Change Workflow

1. Add schema changes only through migration files in `supabase/migrations`.
2. Name migrations in sequence:
   - `006_<short_description>.sql`
3. Keep migration files idempotent when possible:
   - `CREATE INDEX IF NOT EXISTS ...`
   - `CREATE OR REPLACE VIEW ...`
4. Apply migrations in order using Supabase SQL Editor.
5. After migration, verify:
   - `papers_with_notes`
   - `paper_graph_stats`
   - `paper_memory_cards`
   - `paper_related_recommendations`

## Data Import Safety

1. Import from `public/data/initial-papers.json`.
2. Import logic now:
   - skips existing papers by `title + year`
   - normalizes `inspires` relations to `inspired_by`
   - skips duplicate relationships without failing the whole run
3. Always check import log output after a run.

## Backup and Recovery

1. Export app data regularly from the header:
   - Markdown snapshot for review
   - JSON snapshot for backup
2. Keep migration files in Git so schema history is reproducible.
3. Before large imports, create a Supabase backup snapshot.

