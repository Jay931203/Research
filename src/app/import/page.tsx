'use client';

import { useState } from 'react';
import { createPaper, getAllPapers } from '@/lib/supabase/papers';
import { createRelationship } from '@/lib/supabase/relationships';
import type { PaperInsert, RelationshipInsert, RelationshipType } from '@/types';

interface ImportPaper {
  title: string;
  authors: string[];
  year: number;
  venue?: string | null;
  doi?: string | null;
  arxiv_id?: string | null;
  abstract?: string | null;
  key_contributions?: string[];
  algorithms?: string[];
  key_equations?: PaperInsert['key_equations'];
  category:
    | 'csi_compression'
    | 'autoencoder'
    | 'quantization'
    | 'transformer'
    | 'cnn'
    | 'other';
  tags?: string[];
  pdf_url?: string | null;
  code_url?: string | null;
  color_hex?: string | null;
}

interface ImportRelationship {
  from_title: string;
  to_title: string;
  relationship_type: RelationshipType | 'inspires';
  description?: string | null;
  strength?: number;
}

interface ImportPayload {
  papers: ImportPaper[];
  relationships: ImportRelationship[];
}

const VALID_REL_TYPES = new Set<RelationshipType>([
  'extends',
  'builds_on',
  'compares_with',
  'inspired_by',
  'inspires',
  'challenges',
  'applies',
  'related',
]);

function paperKey(title: string, year: number): string {
  return `${title.trim().toLowerCase()}::${year}`;
}

function normalizeRelationship(
  relationship: ImportRelationship,
  fromId: string,
  toId: string
): RelationshipInsert {
  // "inspires" means "A inspires B".
  // We store it as "B inspired_by A" for directional consistency with other rows.
  if (relationship.relationship_type === 'inspires') {
    return {
      from_paper_id: toId,
      to_paper_id: fromId,
      relationship_type: 'inspired_by',
      description: relationship.description ?? undefined,
      strength: relationship.strength ?? 5,
    };
  }

  return {
    from_paper_id: fromId,
    to_paper_id: toId,
    relationship_type: relationship.relationship_type,
    description: relationship.description ?? undefined,
    strength: relationship.strength ?? 5,
  };
}

export default function ImportPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (log: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${log}`]);
  };

  const importData = async () => {
    setStatus('loading');
    setMessage('');
    setLogs([]);
    addLog('데이터 import 시작');

    try {
      const response = await fetch('/data/initial-papers.json');
      if (!response.ok) {
        throw new Error(`데이터 파일 조회 실패: ${response.status}`);
      }

      const payload = (await response.json()) as ImportPayload;
      addLog(`파일 로드 완료: papers=${payload.papers.length}, relationships=${payload.relationships.length}`);

      const existingPapers = await getAllPapers();
      const paperIdByTitleYear = new Map<string, string>();
      const paperIdByTitle = new Map<string, string>();

      for (const paper of existingPapers) {
        const key = paperKey(paper.title, paper.year);
        paperIdByTitleYear.set(key, paper.id);
        paperIdByTitle.set(paper.title.trim().toLowerCase(), paper.id);
      }

      let createdPaperCount = 0;
      let skippedPaperCount = 0;

      for (const paper of payload.papers) {
        const key = paperKey(paper.title, paper.year);
        if (paperIdByTitleYear.has(key)) {
          skippedPaperCount += 1;
          continue;
        }

        const paperData: PaperInsert = {
          title: paper.title,
          authors: paper.authors,
          year: paper.year,
          venue: paper.venue ?? undefined,
          doi: paper.doi ?? undefined,
          arxiv_id: paper.arxiv_id ?? undefined,
          abstract: paper.abstract ?? undefined,
          key_contributions: paper.key_contributions ?? [],
          algorithms: paper.algorithms ?? [],
          key_equations: paper.key_equations ?? [],
          category: paper.category,
          tags: paper.tags ?? [],
          pdf_url: paper.pdf_url ?? undefined,
          code_url: paper.code_url ?? undefined,
          color_hex: paper.color_hex ?? '#6366f1',
        };

        const createdPaper = await createPaper(paperData);
        if (!createdPaper) continue;

        createdPaperCount += 1;
        paperIdByTitleYear.set(key, createdPaper.id);
        paperIdByTitle.set(createdPaper.title.trim().toLowerCase(), createdPaper.id);
      }

      addLog(`논문 처리 완료: 신규 ${createdPaperCount}개, 기존 ${skippedPaperCount}개`);

      let createdRelationshipCount = 0;
      let skippedRelationshipCount = 0;
      let invalidTypeCount = 0;
      let unresolvedPaperCount = 0;

      for (const relationship of payload.relationships) {
        if (!VALID_REL_TYPES.has(relationship.relationship_type as RelationshipType)) {
          invalidTypeCount += 1;
          continue;
        }

        const fromId = paperIdByTitle.get(relationship.from_title.trim().toLowerCase());
        const toId = paperIdByTitle.get(relationship.to_title.trim().toLowerCase());

        if (!fromId || !toId) {
          unresolvedPaperCount += 1;
          continue;
        }

        try {
          const normalized = normalizeRelationship(relationship, fromId, toId);
          await createRelationship(normalized);
          createdRelationshipCount += 1;
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : '';
          if (message.includes('duplicate key value')) {
            skippedRelationshipCount += 1;
            continue;
          }
          throw error;
        }
      }

      addLog(
        `관계 처리 완료: 신규 ${createdRelationshipCount}개, 중복 ${skippedRelationshipCount}개, 미매핑 ${unresolvedPaperCount}개`
      );

      setStatus('success');
      setMessage(
        [
          'Import 완료',
          `- 논문: 신규 ${createdPaperCount}, 기존 ${skippedPaperCount}`,
          `- 관계: 신규 ${createdRelationshipCount}, 중복 ${skippedRelationshipCount}`,
          `- 관계 타입 오류: ${invalidTypeCount}`,
          `- 제목 매핑 실패: ${unresolvedPaperCount}`,
        ].join('\n')
      );
      addLog('모든 작업 완료');
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      setStatus('error');
      setMessage(`Import 실패\n${errorMessage}`);
      addLog(`오류: ${errorMessage}`);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-3xl font-bold">초기 데이터 Import</h1>

        <div className="mb-6 rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
          <p className="mb-4 text-gray-600 dark:text-gray-300">
            <code>public/data/initial-papers.json</code> 파일을 DB에 병합합니다.
            이미 있는 논문/관계는 자동으로 건너뜁니다.
          </p>

          <button
            onClick={importData}
            disabled={status === 'loading'}
            className={`w-full rounded-lg px-6 py-3 font-medium transition ${
              status === 'loading'
                ? 'cursor-not-allowed bg-gray-300'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {status === 'loading' ? 'Import 중...' : 'Import 시작'}
          </button>
        </div>

        {!!message && (
          <div
            className={`mb-6 rounded-lg p-4 ${
              status === 'success'
                ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-200'
                : status === 'error'
                  ? 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-200'
                  : 'bg-blue-50 dark:bg-blue-900/20'
            }`}
          >
            <pre className="whitespace-pre-wrap text-sm">{message}</pre>
          </div>
        )}

        {!!logs.length && (
          <div className="max-h-96 overflow-auto rounded-lg bg-gray-900 p-4 font-mono text-sm text-green-400">
            {logs.map((log) => (
              <div key={log}>{log}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
