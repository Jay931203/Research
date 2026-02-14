import type { PaperRelationship, PaperWithNote } from '@/types';
import { FAMILIARITY_LABELS } from '@/lib/visualization/graphUtils';

const RELATIONSHIP_LABELS: Record<string, string> = {
  extends: '확장',
  builds_on: '기반',
  compares_with: '비교',
  inspired_by: '영감 받음',
  inspires: '영감 줌',
  challenges: '도전',
  applies: '적용',
  related: '관련',
};

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  URL.revokeObjectURL(url);
}

function dateStamp(): string {
  return new Date().toISOString().split('T')[0];
}

export function exportSinglePaperToMarkdown(paper: PaperWithNote): string {
  const lines: string[] = [];

  lines.push(`## ${paper.title} (${paper.year})`);
  lines.push('');
  lines.push(`**저자**: ${paper.authors.join(', ')}`);
  if (paper.venue) lines.push(`**학회/저널**: ${paper.venue}`);
  lines.push(`**카테고리**: ${paper.category}`);
  lines.push(
    `**이해도**: ${FAMILIARITY_LABELS[paper.familiarity_level ?? 'not_started']}`
  );
  lines.push('');

  if (paper.abstract) {
    lines.push('### 초록');
    lines.push(paper.abstract);
    lines.push('');
  }

  if (paper.key_contributions?.length) {
    lines.push('### 주요 기여');
    paper.key_contributions.forEach((item) => lines.push(`- ${item}`));
    lines.push('');
  }

  if (paper.algorithms?.length) {
    lines.push('### 핵심 방법');
    paper.algorithms.forEach((item) => lines.push(`- ${item}`));
    lines.push('');
  }

  if (paper.key_equations?.length) {
    lines.push('### 핵심 수식');
    paper.key_equations.forEach((equation) => {
      lines.push(`- **${equation.name}**: \`${equation.latex}\``);
      if (equation.description) lines.push(`  - ${equation.description}`);
    });
    lines.push('');
  }

  if (paper.tags?.length) {
    lines.push(`**태그**: ${paper.tags.join(', ')}`);
    lines.push('');
  }

  if (paper.note_content) {
    lines.push('### 개인 노트');
    lines.push(paper.note_content);
    lines.push('');
  }

  const links: string[] = [];
  if (paper.pdf_url) links.push(`[PDF](${paper.pdf_url})`);
  if (paper.code_url) links.push(`[Code](${paper.code_url})`);
  if (links.length) {
    lines.push(`**링크**: ${links.join(' | ')}`);
    lines.push('');
  }

  lines.push('---');
  lines.push('');

  return lines.join('\n');
}

export function exportToMarkdown(
  papers: PaperWithNote[],
  relationships: PaperRelationship[]
) {
  const lines: string[] = [];
  const sortedPapers = [...papers].sort((a, b) => a.year - b.year);
  const paperMap = new Map(papers.map((paper) => [paper.id, paper.title]));

  lines.push('# CSI Research Notes');
  lines.push('');
  lines.push(`> Export Date: ${dateStamp()}`);
  lines.push(`> Papers: ${papers.length}, Relationships: ${relationships.length}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  sortedPapers.forEach((paper) => {
    lines.push(exportSinglePaperToMarkdown(paper));
  });

  if (relationships.length) {
    lines.push('## 논문 관계 요약');
    lines.push('');
    relationships.forEach((relationship) => {
      const from = paperMap.get(relationship.from_paper_id) ?? relationship.from_paper_id;
      const to = paperMap.get(relationship.to_paper_id) ?? relationship.to_paper_id;
      const label =
        RELATIONSHIP_LABELS[relationship.relationship_type] ?? relationship.relationship_type;

      lines.push(
        `- **${from}** -> **${to}** (${label}, 강도 ${relationship.strength}/10${
          relationship.description ? `, ${relationship.description}` : ''
        })`
      );
    });
    lines.push('');
  }

  const markdown = lines.join('\n');
  downloadFile(markdown, `csi-research-notes-${dateStamp()}.md`, 'text/markdown;charset=utf-8');
}

export function exportToJSON(
  papers: PaperWithNote[],
  relationships: PaperRelationship[]
) {
  const payload = {
    exportDate: dateStamp(),
    papers,
    relationships,
  };
  const json = JSON.stringify(payload, null, 2);
  downloadFile(json, `csi-research-export-${dateStamp()}.json`, 'application/json;charset=utf-8');
}

