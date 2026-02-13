import type { PaperWithNote, PaperRelationship } from '@/types';

const FAMILIARITY_KO: Record<string, string> = {
  not_started: '미시작',
  difficult: '어려움',
  moderate: '보통',
  familiar: '익숙',
  expert: '전문가',
};

const RELATIONSHIP_KO: Record<string, string> = {
  extends: '확장',
  builds_on: '기반',
  compares_with: '비교',
  inspired_by: '영감',
  challenges: '도전',
  applies: '적용',
  related: '관련',
};

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function getDateStr(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * 단일 논문을 Markdown으로 변환
 */
export function exportSinglePaperToMarkdown(paper: PaperWithNote): string {
  const lines: string[] = [];

  lines.push(`## ${paper.title} (${paper.year})`);
  lines.push('');
  lines.push(`**저자**: ${paper.authors.join(', ')}`);
  if (paper.venue) lines.push(`**학회/저널**: ${paper.venue}`);
  lines.push(`**카테고리**: ${paper.category}`);
  if (paper.familiarity_level) {
    lines.push(`**이해도**: ${FAMILIARITY_KO[paper.familiarity_level] || paper.familiarity_level}`);
  }
  lines.push('');

  if (paper.abstract) {
    lines.push('### 초록');
    lines.push(paper.abstract);
    lines.push('');
  }

  if (paper.key_contributions && paper.key_contributions.length > 0) {
    lines.push('### 주요 기여');
    paper.key_contributions.forEach((c) => lines.push(`- ${c}`));
    lines.push('');
  }

  if (paper.algorithms && paper.algorithms.length > 0) {
    lines.push('### 알고리즘');
    paper.algorithms.forEach((a) => lines.push(`- ${a}`));
    lines.push('');
  }

  if (paper.key_equations && paper.key_equations.length > 0) {
    lines.push('### 핵심 수식');
    paper.key_equations.forEach((eq) => {
      lines.push(`- **${eq.name}**: \`${eq.latex}\``);
      if (eq.description) lines.push(`  - ${eq.description}`);
    });
    lines.push('');
  }

  if (paper.tags && paper.tags.length > 0) {
    lines.push(`**태그**: ${paper.tags.join(', ')}`);
    lines.push('');
  }

  if (paper.note_content) {
    lines.push('### 개인 메모');
    lines.push(paper.note_content);
    lines.push('');
  }

  const links: string[] = [];
  if (paper.pdf_url) links.push(`[PDF](${paper.pdf_url})`);
  if (paper.code_url) links.push(`[Code](${paper.code_url})`);
  if (links.length > 0) {
    lines.push(`**링크**: ${links.join(' | ')}`);
    lines.push('');
  }

  lines.push('---');
  lines.push('');

  return lines.join('\n');
}

/**
 * 전체 데이터를 Markdown 파일로 Export
 */
export function exportToMarkdown(
  papers: PaperWithNote[],
  relationships: PaperRelationship[]
) {
  const lines: string[] = [];
  const sorted = [...papers].sort((a, b) => a.year - b.year);

  lines.push('# CSI AutoEncoder 연구 노트');
  lines.push('');
  lines.push(`> 내보내기 날짜: ${getDateStr()}`);
  lines.push(`> 총 ${papers.length}편의 논문, ${relationships.length}개의 관계`);
  lines.push('');
  lines.push('---');
  lines.push('');

  sorted.forEach((paper) => {
    lines.push(exportSinglePaperToMarkdown(paper));
  });

  if (relationships.length > 0) {
    lines.push('## 논문 간 관계');
    lines.push('');
    const paperMap = new Map(papers.map((p) => [p.id, p.title]));
    relationships.forEach((rel) => {
      const from = paperMap.get(rel.from_paper_id) || rel.from_paper_id;
      const to = paperMap.get(rel.to_paper_id) || rel.to_paper_id;
      const type = RELATIONSHIP_KO[rel.relationship_type] || rel.relationship_type;
      lines.push(`- **${from}** → ${to} (${type}${rel.description ? ': ' + rel.description : ''})`);
    });
    lines.push('');
  }

  const content = lines.join('\n');
  downloadFile(content, `csi-research-notes-${getDateStr()}.md`, 'text/markdown;charset=utf-8');
}

/**
 * 전체 데이터를 JSON 파일로 Export
 */
export function exportToJSON(
  papers: PaperWithNote[],
  relationships: PaperRelationship[]
) {
  const data = {
    exportDate: getDateStr(),
    papers,
    relationships,
  };
  const content = JSON.stringify(data, null, 2);
  downloadFile(content, `csi-research-export-${getDateStr()}.json`, 'application/json;charset=utf-8');
}
