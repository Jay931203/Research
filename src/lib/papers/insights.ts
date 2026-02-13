import type {
  FamiliarityLevel,
  PaperRelationship,
  PaperWithNote,
  RelationshipType,
} from '@/types';

export interface PaperCoreSnapshot {
  oneLiner: string;
  methods: string[];
  rememberPoints: string[];
}

export interface PaperConnection {
  relationship: PaperRelationship;
  otherPaper: PaperWithNote;
  direction: 'outgoing' | 'incoming';
}

export interface BridgeRecommendation {
  paper: PaperWithNote;
  score: number;
  reasons: string[];
}

const DEFAULT_ONE_LINER = '핵심 요약을 위해 초록 또는 기여 포인트를 추가해보세요.';

const FAMILIARITY_PRIORITY: Record<FamiliarityLevel, number> = {
  not_started: 0,
  difficult: 1,
  moderate: 2,
  familiar: 3,
  expert: 4,
};

function getFirstSentence(text?: string): string | null {
  if (!text) return null;

  const compact = text.replace(/\s+/g, ' ').trim();
  if (!compact) return null;

  const sentenceEnd = compact.search(/[.!?]\s/);
  if (sentenceEnd >= 0) {
    return compact.slice(0, sentenceEnd + 1);
  }

  return compact.length > 180 ? `${compact.slice(0, 177)}...` : compact;
}

function safeArray(values?: string[]): string[] {
  if (!values?.length) return [];
  return values.map((value) => value.trim()).filter(Boolean);
}

export function buildPaperCoreSnapshot(paper: PaperWithNote): PaperCoreSnapshot {
  const contributions = safeArray(paper.key_contributions);
  const algorithms = safeArray(paper.algorithms);
  const equationNames = (paper.key_equations ?? [])
    .map((equation: { name?: string }) => equation?.name?.trim())
    .filter(Boolean) as string[];

  const oneLiner =
    contributions[0] ??
    getFirstSentence(paper.abstract) ??
    DEFAULT_ONE_LINER;

  const methods = [...algorithms, ...equationNames].slice(0, 4);

  const rememberPoints = [
    ...contributions.slice(0, 3),
    ...equationNames.slice(0, Math.max(0, 3 - contributions.length)),
  ].slice(0, 3);

  return {
    oneLiner,
    methods,
    rememberPoints,
  };
}

export function buildPaperConnections(
  paperId: string,
  papers: PaperWithNote[],
  relationships: PaperRelationship[]
): PaperConnection[] {
  const paperMap = new Map(papers.map((paper) => [paper.id, paper]));

  return relationships
    .filter((relationship) => {
      return relationship.from_paper_id === paperId || relationship.to_paper_id === paperId;
    })
    .map((relationship) => {
      const direction =
        relationship.from_paper_id === paperId ? 'outgoing' : 'incoming';
      const otherId =
        direction === 'outgoing' ? relationship.to_paper_id : relationship.from_paper_id;
      const otherPaper = paperMap.get(otherId);

      if (!otherPaper) return null;

      return {
        relationship,
        otherPaper,
        direction,
      };
    })
    .filter((item): item is PaperConnection => item !== null)
    .sort((a, b) => {
      if (b.relationship.strength !== a.relationship.strength) {
        return b.relationship.strength - a.relationship.strength;
      }
      return b.otherPaper.year - a.otherPaper.year;
    });
}

function buildAdjacency(
  relationships: PaperRelationship[]
): Map<string, Set<string>> {
  const adjacency = new Map<string, Set<string>>();

  for (const relationship of relationships) {
    if (!adjacency.has(relationship.from_paper_id)) {
      adjacency.set(relationship.from_paper_id, new Set());
    }
    if (!adjacency.has(relationship.to_paper_id)) {
      adjacency.set(relationship.to_paper_id, new Set());
    }

    adjacency.get(relationship.from_paper_id)?.add(relationship.to_paper_id);
    adjacency.get(relationship.to_paper_id)?.add(relationship.from_paper_id);
  }

  return adjacency;
}

export function buildBridgeRecommendations(
  paperId: string,
  papers: PaperWithNote[],
  relationships: PaperRelationship[],
  limit = 5
): BridgeRecommendation[] {
  const target = papers.find((paper) => paper.id === paperId);
  if (!target) return [];

  const paperMap = new Map(papers.map((paper) => [paper.id, paper]));
  const adjacency = buildAdjacency(relationships);
  const directNeighbors = adjacency.get(paperId) ?? new Set<string>();
  const targetTags = new Set(safeArray(target.tags));

  const recommendations: BridgeRecommendation[] = [];

  for (const candidate of papers) {
    if (candidate.id === paperId) continue;
    if (directNeighbors.has(candidate.id)) continue;

    const candidateNeighbors = adjacency.get(candidate.id) ?? new Set<string>();
    const sharedNeighbors = Array.from(directNeighbors).filter((id) =>
      candidateNeighbors.has(id)
    );

    const candidateTags = safeArray(candidate.tags);
    const sharedTags = candidateTags.filter((tag) => targetTags.has(tag));

    let score = 0;
    const reasons: string[] = [];

    if (sharedNeighbors.length > 0) {
      score += sharedNeighbors.length * 4;
      reasons.push(`공통 연결 ${sharedNeighbors.length}개`);
    }

    if (candidate.category === target.category) {
      score += 3;
      reasons.push('같은 카테고리');
    }

    if (sharedTags.length > 0) {
      score += Math.min(3, sharedTags.length);
      reasons.push(`공통 태그: ${sharedTags.slice(0, 2).join(', ')}`);
    }

    const yearGap = Math.abs(candidate.year - target.year);
    if (yearGap <= 2) {
      score += 1;
      reasons.push('연도 근접');
    }

    if (score <= 0) continue;

    recommendations.push({
      paper: candidate,
      score,
      reasons,
    });
  }

  return recommendations
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.paper.year - a.paper.year;
    })
    .slice(0, limit);
}

export function buildReviewQueue(
  papers: PaperWithNote[],
  limit = 6
): PaperWithNote[] {
  return [...papers]
    .sort((a, b) => {
      const levelA = a.familiarity_level ?? 'not_started';
      const levelB = b.familiarity_level ?? 'not_started';
      const familiarityGap =
        FAMILIARITY_PRIORITY[levelA] - FAMILIARITY_PRIORITY[levelB];

      if (familiarityGap !== 0) return familiarityGap;

      const importanceA = a.importance_rating ?? 0;
      const importanceB = b.importance_rating ?? 0;
      if (importanceB !== importanceA) return importanceB - importanceA;

      return b.year - a.year;
    })
    .slice(0, limit);
}

export function countRecentPapers(
  papers: PaperWithNote[],
  years = 2
): number {
  const currentYear = new Date().getFullYear();
  return papers.filter((paper) => paper.year >= currentYear - years).length;
}

export function countPapersNeedingReview(papers: PaperWithNote[]): number {
  return papers.filter((paper) => {
    const level = paper.familiarity_level ?? 'not_started';
    return level === 'not_started' || level === 'difficult';
  }).length;
}

export function getRelationshipTypeCount(
  relationships: PaperRelationship[]
): Record<RelationshipType, number> {
  return relationships.reduce(
    (acc, relationship) => {
      acc[relationship.relationship_type] += 1;
      return acc;
    },
    {
      extends: 0,
      builds_on: 0,
      compares_with: 0,
      inspired_by: 0,
      inspires: 0,
      challenges: 0,
      applies: 0,
      related: 0,
    } satisfies Record<RelationshipType, number>
  );
}

export function getMostConnectedPaper(
  papers: PaperWithNote[],
  relationships: PaperRelationship[]
): PaperWithNote | null {
  if (!papers.length) return null;

  const degree = new Map<string, number>();

  for (const relationship of relationships) {
    degree.set(
      relationship.from_paper_id,
      (degree.get(relationship.from_paper_id) ?? 0) + 1
    );
    degree.set(
      relationship.to_paper_id,
      (degree.get(relationship.to_paper_id) ?? 0) + 1
    );
  }

  let bestPaper: PaperWithNote | null = null;
  let bestScore = -1;

  for (const paper of papers) {
    const score = degree.get(paper.id) ?? 0;
    if (score > bestScore) {
      bestScore = score;
      bestPaper = paper;
    }
  }

  return bestPaper;
}

export function summarizeRelationship(
  type: RelationshipType,
  direction: 'outgoing' | 'incoming'
): string {
  if (direction === 'outgoing') {
    if (type === 'extends') return '확장';
    if (type === 'builds_on') return '기반';
    if (type === 'inspires') return '영감 제공';
    return '연결';
  }

  if (type === 'inspired_by') return '영감 받음';
  if (type === 'extends') return '후속 확장';
  if (type === 'builds_on') return '후속 기반';
  return '연결됨';
}

export function getPaperById(
  paperId: string,
  papers: PaperWithNote[]
): PaperWithNote | null {
  return papers.find((paper) => paper.id === paperId) ?? null;
}

export function getPaperTitleMap(papers: PaperWithNote[]): Map<string, string> {
  return new Map(papers.map((paper) => [paper.id, paper.title]));
}

export function getPaperMap(
  papers: PaperWithNote[]
): Map<string, PaperWithNote> {
  return new Map(papers.map((paper) => [paper.id, paper]));
}

export function getStrongestRelationshipLabel(
  connections: PaperConnection[]
): string {
  if (!connections.length) return '연결 정보 없음';
  const strongest = connections[0];
  return `${strongest.relationship.relationship_type} (${strongest.relationship.strength}/10)`;
}

export function getConnectionPreview(
  paperId: string,
  papers: PaperWithNote[],
  relationships: PaperRelationship[],
  limit = 4
): PaperConnection[] {
  return buildPaperConnections(paperId, papers, relationships).slice(0, limit);
}

