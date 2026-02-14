import { supabase } from './client';
import type { Paper, PaperInsert, PaperUpdate } from '@/types';

/**
 * 모든 논문 조회
 */
export async function getAllPapers(): Promise<Paper[]> {
  const { data, error } = await supabase
    .from('papers')
    .select('*')
    .order('year', { ascending: false });

  if (error) {
    console.error('Error fetching papers:', error);
    throw error;
  }

  return data || [];
}

/**
 * ID로 논문 조회
 */
export async function getPaperById(id: string): Promise<Paper | null> {
  const { data, error } = await supabase
    .from('papers')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching paper ${id}:`, error);
    return null;
  }

  return data;
}

/**
 * 논문 생성
 */
export async function createPaper(paper: PaperInsert): Promise<Paper | null> {
  const { data, error } = await supabase
    .from('papers')
    .insert(paper)
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
  const { data, error } = await supabase
    .from('papers')
    .update(updates)
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
    console.error('Error searching papers:', error);
    throw error;
  }

  return data || [];
}
