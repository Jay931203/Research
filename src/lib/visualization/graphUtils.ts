import type { RelationshipType } from '@/types';

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

export const FAMILIARITY_COLORS: Record<string, string> = {
  not_started: '#9ca3af',
  difficult: '#ef4444',
  moderate: '#f59e0b',
  familiar: '#10b981',
  expert: '#2563eb',
};

export const FAMILIARITY_LABELS: Record<string, string> = {
  not_started: '미시작',
  difficult: '어려움',
  moderate: '보통',
  familiar: '익숙함',
  expert: '전문가',
};

export function getEdgeStrokeWidth(strength: number): number {
  return Math.max(1, Math.min(4, strength / 3));
}

