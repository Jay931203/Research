import useSWR from 'swr';
import type { GlossaryTerm } from '@/types';

const fetcher = async (): Promise<GlossaryTerm[]> => {
  const res = await fetch('/data/glossary.json');
  if (!res.ok) throw new Error('Failed to fetch glossary');
  return res.json();
};

/**
 * 용어집 데이터 훅
 */
export function useGlossary() {
  const { data, error, isLoading } = useSWR<GlossaryTerm[]>(
    'glossary',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5분
    }
  );

  return {
    terms: data || [],
    isLoading,
    isError: !!error,
  };
}

/**
 * 특정 논문 제목에 해당하는 용어집 항목 필터링
 */
export function getTermsForPaper(terms: GlossaryTerm[], paperTitle: string): GlossaryTerm[] {
  return terms.filter((term) =>
    term.related_paper_titles.some(
      (t) => t.toLowerCase() === paperTitle.toLowerCase()
    )
  );
}
