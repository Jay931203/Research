import {
  getLocalPaperById,
  getLocalPapers,
  searchLocalPapers,
} from '@/lib/localSeedData';
import { isSupabaseConfigured, supabase } from './client';
import type { Paper, PaperInsert, PaperUpdate } from '@/types';

function normalizePaperCategoryForDb<
  T extends { category?: string | null; tags?: string[] | null }
>(payload: T): T {
  if (payload.category !== 'representation_learning') return payload;

  const normalizedTags = Array.from(
    new Set([...(payload.tags ?? []), 'representation_learning'])
  );

  return {
    ...payload,
    category: 'other',
    tags: normalizedTags,
  };
}

/**
 * 모든 논문 조회
 */
export async function getAllPapers(): Promise<Paper[]> {
  if (!isSupabaseConfigured) return getLocalPapers();

  const { data, error } = await supabase
    .from('papers')
    .select('*')
    .order('year', { ascending: false });

  if (error) {
    console.warn('Error fetching papers; using local seed data:', error);
    return getLocalPapers();
  }

  return data || [];
}

/**
 * ID로 논문 조회
 */
export async function getPaperById(id: string): Promise<Paper | null> {
  if (!isSupabaseConfigured) return getLocalPaperById(id);

  const { data, error } = await supabase
    .from('papers')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.warn(`Error fetching paper ${id}; using local seed data:`, error);
    return getLocalPaperById(id);
  }

  return data;
}

/**
 * 논문 생성
 */
export async function createPaper(paper: PaperInsert): Promise<Paper | null> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured; paper writes are disabled.');
  }

  const normalizedPaper = normalizePaperCategoryForDb(paper);
  const { data, error } = await supabase
    .from('papers')
    .insert(normalizedPaper)
    .select()
    .single();

  if (error) {
    console.error('Error creating paper:', error);
    throw error;
  }

  return data;
}

/**
 * 논문 수정
 */
export async function updatePaper(
  id: string,
  updates: PaperUpdate
): Promise<Paper | null> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured; paper writes are disabled.');
  }

  const normalizedUpdates = normalizePaperCategoryForDb(updates);
  const { data, error } = await supabase
    .from('papers')
    .update(normalizedUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating paper ${id}:`, error);
    throw error;
  }

  return data;
}

/**
 * 논문 삭제
 */
export async function deletePaper(id: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  const { error } = await supabase.from('papers').delete().eq('id', id);

  if (error) {
    console.error(`Error deleting paper ${id}:`, error);
    return false;
  }

  return true;
}

/**
 * 검색 및 필터링
 */
export interface PaperFilters {
  searchText?: string;
  categories?: string[];
  yearRange?: [number, number];
  tags?: string[];
}

export async function searchPapers(filters: PaperFilters): Promise<Paper[]> {
  if (!isSupabaseConfigured) return searchLocalPapers(filters);

  let query = supabase.from('papers').select('*');

  // 검색 텍스트 (제목, 저자)
  if (filters.searchText) {
    const escaped = filters.searchText.replace(/[%_]/g, '\\$&');
    query = query.or(
      `title.ilike.%${escaped}%,authors.cs.{${escaped}}`
    );
  }

  // 카테고리 필터
  if (filters.categories && filters.categories.length > 0) {
    query = query.in('category', filters.categories);
  }

  // 연도 범위
  if (filters.yearRange) {
    query = query
      .gte('year', filters.yearRange[0])
      .lte('year', filters.yearRange[1]);
  }

  // 태그 필터
  if (filters.tags && filters.tags.length > 0) {
    query = query.overlaps('tags', filters.tags);
  }

  const { data, error } = await query.order('year', { ascending: false });

  if (error) {
    console.warn('Error searching papers; using local seed data:', error);
    return searchLocalPapers(filters);
  }

  return data || [];
}
