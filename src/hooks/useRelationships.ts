import useSWR from 'swr';
import {
  getAllRelationships,
  getRelationshipsByPaperId,
  getRelationshipGraph,
} from '@/lib/supabase/relationships';
import type { PaperRelationship, RelationshipWithPapers } from '@/types';

/**
 * 모든 관계 조회 훅
 */
export function useRelationships() {
  const { data, error, mutate, isLoading } = useSWR<PaperRelationship[]>(
    'relationships',
    getAllRelationships,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  return {
    relationships: data || [],
    isLoading,
    isError: !!error,
    error,
    refresh: mutate,
  };
}

/**
 * 특정 논문의 관계 조회 훅
 */
export function usePaperRelationships(paperId: string | null) {
  const { data, error, mutate, isLoading } = useSWR<PaperRelationship[]>(
    paperId ? `relationships-${paperId}` : null,
    () => (paperId ? getRelationshipsByPaperId(paperId) : Promise.resolve([])),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    relationships: data || [],
    isLoading,
    isError: !!error,
    error,
    refresh: mutate,
  };
}

/**
 * 관계 그래프 뷰 조회 훅 (논문 정보 포함)
 */
export function useRelationshipGraph() {
  const { data, error, mutate, isLoading } = useSWR<RelationshipWithPapers[]>(
    'relationship-graph',
    getRelationshipGraph,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  return {
    graph: data || [],
    isLoading,
    isError: !!error,
    error,
    refresh: mutate,
  };
}
