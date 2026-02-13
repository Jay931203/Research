import useSWR from 'swr';
import { getNoteByPaperId, getPapersWithNotes } from '@/lib/supabase/notes';
import type { UserNote, PaperWithNote } from '@/types';

/**
 * 특정 논문의 노트 조회 훅
 */
export function useNote(paperId: string | null, sessionId?: string) {
  const { data, error, mutate, isLoading } = useSWR<UserNote | null>(
    paperId ? `note-${paperId}` : null,
    () => (paperId ? getNoteByPaperId(paperId, sessionId) : null),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    note: data,
    isLoading,
    isError: !!error,
    error,
    refresh: mutate,
  };
}

/**
 * 논문 + 노트 통합 조회 훅
 */
export function usePapersWithNotes() {
  const { data, error, mutate, isLoading } = useSWR<PaperWithNote[]>(
    'papers-with-notes',
    getPapersWithNotes,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
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
