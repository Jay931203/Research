import type { FamiliarityLevel, RelationshipType } from '@/types';

export const RELATIONSHIP_STYLES: Record<
  RelationshipType,
  { color: string; label: string; strokeDasharray?: string }
> = {
  extends: { color: '#2563eb', label: '확장' },
  builds_on: { color: '#16a34a', label: '기반' },
  compares_with: { color: '#f59e0b', label: '비교', strokeDasharray: '6 3' },
  inspired_by: { color: '#8b5cf6', label: '영감 받음', strokeDasharray: '3 3' },
  inspires: { color: '#9333ea', label: '영감 줌', strokeDasharray: '3 3' },
  challenges: { color: '#ef4444', label: '도전', strokeDasharray: '8 4' },
  applies: { color: '#0891b2', label: '적용' },
  related: { color: '#6b7280', label: '관련', strokeDasharray: '4 4' },
};

export const CATEGORY_COLORS: Record<string, string> = {
  csi_compression: '#2563eb',
  autoencoder: '#7c3aed',
  quantization: '#dc2626',
  transformer: '#8b5cf6',
  cnn: '#10b981',
  other: '#6b7280',
};

export const CATEGORY_LABELS: Record<string, string> = {
  csi_compression: 'CSI Compression',
  autoencoder: 'AutoEncoder',
  quantization: 'Quantization',
  transformer: 'Transformer',
  cnn: 'CNN',
  other: 'Other',
};

export const FAMILIARITY_SELECTABLE_LEVELS: FamiliarityLevel[] = [
  'not_started',
  'difficult',
  'moderate',
  'familiar',
];

export type FamiliarityStarScore = 0 | 1 | 2 | 3;

const FAMILIARITY_STAR_MAP: Record<FamiliarityLevel, FamiliarityStarScore> = {
  not_started: 0,
  difficult: 1,
  moderate: 2,
  familiar: 3,
  expert: 3, // Legacy compatibility
};

export const FAMILIARITY_COLORS: Record<FamiliarityLevel, string> = {
  not_started: '#cbd5e1',
  difficult: '#f59e0b',
  moderate: '#0ea5e9',
  familiar: '#1d4ed8',
  expert: '#1d4ed8',
};

export const FAMILIARITY_LABELS: Record<FamiliarityLevel, string> = {
  not_started: '별 0개',
  difficult: '별 1개',
  moderate: '별 2개',
  familiar: '별 3개',
  expert: '별 3개',
};

export const FAMILIARITY_OPACITY_BY_STAR: Record<FamiliarityStarScore, number> = {
  0: 0,
  1: 0.35,
  2: 0.7,
  3: 1,
};

export function getFamiliarityStarScore(level?: FamiliarityLevel): FamiliarityStarScore {
  if (!level) return 0;
  return FAMILIARITY_STAR_MAP[level] ?? 0;
}

export function getFamiliarityOpacity(level?: FamiliarityLevel): number {
  return FAMILIARITY_OPACITY_BY_STAR[getFamiliarityStarScore(level)];
}

export function getEdgeStrokeWidth(strength: number): number {
  return Math.max(1, Math.min(4, strength / 3));
}

export type ResearchTopic =
  | 'csi_architecture'
  | 'csi_quantization'
  | 'general_quantization'
  | 'state_space'
  | 'other';

export const RESEARCH_TOPIC_ORDER: ResearchTopic[] = [
  'csi_architecture',
  'csi_quantization',
  'general_quantization',
  'state_space',
  'other',
];

export const RESEARCH_TOPIC_LABELS: Record<ResearchTopic, string> = {
  csi_architecture: 'CSI Architecture',
  csi_quantization: 'CSI Quantization',
  general_quantization: 'General Quantization',
  state_space: 'State-Space',
  other: 'Other',
};

export const RESEARCH_TOPIC_COLORS: Record<ResearchTopic, string> = {
  csi_architecture: '#2563eb',
  csi_quantization: '#059669',
  general_quantization: '#dc2626',
  state_space: '#7c3aed',
  other: '#6b7280',
};

interface ResearchTopicInput {
  title: string;
  category?: string | null;
  tags?: string[] | null;
}

const CSI_DOMAIN_KEYWORDS = [
  'csi',
  'csinet',
  'massive mimo',
  'fdd',
  'mimo feedback',
  'channel state information',
  'channel estimation',
  'beamforming',
  'pilot',
  'wireless foundation model',
];

const QUANTIZATION_KEYWORDS = [
  'quantization',
  'quantized',
  'low-bit',
  'bit-level',
  'bitwidth',
  'binarized',
  'ternary',
  'vector quantization',
  'vq-vae',
  'gptq',
  'awq',
  'hawq',
  'brecq',
  'fsq',
];

const STATE_SPACE_PHRASES = ['state-space', 'state space', 'state-space model'];
const STATE_SPACE_TOKENS = ['ssm', 'mamba', 's4'];

function containsAny(text: string, keywords: string[]): boolean {
  return keywords.some((keyword) => text.includes(keyword));
}

export function inferResearchTopic(input: ResearchTopicInput): ResearchTopic {
  const title = (input.title ?? '').toLowerCase();
  const tags = (input.tags ?? []).join(' ').toLowerCase();
  const category = (input.category ?? '').toLowerCase();
  const haystack = [title, tags, category].join(' ');
  const tokenSet = new Set(haystack.split(/[^a-z0-9]+/).filter(Boolean));

  const hasStateSpace =
    containsAny(haystack, STATE_SPACE_PHRASES) ||
    STATE_SPACE_TOKENS.some((token) => tokenSet.has(token));
  const hasCSI = containsAny(haystack, CSI_DOMAIN_KEYWORDS);
  const hasQuantization = containsAny(haystack, QUANTIZATION_KEYWORDS);

  if (hasStateSpace) return 'state_space';
  if (hasCSI && hasQuantization) return 'csi_quantization';
  if (hasQuantization) return 'general_quantization';
  if (hasCSI) return 'csi_architecture';

  if (category === 'quantization') return 'general_quantization';
  if (
    category === 'autoencoder' ||
    category === 'cnn' ||
    category === 'transformer' ||
    category === 'csi_compression'
  ) {
    return 'csi_architecture';
  }

  return 'other';
}
