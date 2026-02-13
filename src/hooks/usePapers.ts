import useSWR from 'swr';
import { getAllPapers, getPaperById } from '@/lib/supabase/papers';
import type { Paper } from '@/types';

/**
 * 모든 논문 조회 훅
 */
export function usePapers() {
  const { data, error, mutate, isLoading } = useSWR<Paper[]>(
    'papers',
    getAllPapers,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // 1분
    }
  );

  return {
    papers: data || [],
    isLoading,
    isError: !!error,
    error,
    refresh: mutate,
  };
}

/**
 * 특정 논문 조회 훅
 */
export function usePaper(id: string | null) {
  const { data, error, mutate, isLoading } = useSWR<Paper | null>(
    id ? `paper-${id}` : null,
    () => (id ? getPaperById(id) : null),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    paper: data,
    isLoading,
    isError: !!error,
    error,
    refresh: mutate,
  };
}
