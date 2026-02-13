import { supabase } from './client';
import type {
  PaperRelationship,
  RelationshipInsert,
  RelationshipUpdate,
  RelationshipWithPapers,
} from '@/types';

/**
 * 모든 관계 조회
 */
export async function getAllRelationships(): Promise<PaperRelationship[]> {
  const { data, error } = await supabase
    .from('paper_relationships')
    .select('*')
    .order('strength', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching relationships:', error);
    throw error;
  }

  return data || [];
}

/**
 * 특정 논문의 모든 관계 조회 (from + to)
 */
export async function getRelationshipsByPaperId(
  paperId: string
): Promise<PaperRelationship[]> {
  const { data, error } = await supabase
    .from('paper_relationships')
    .select('*')
    .or(`from_paper_id.eq.${paperId},to_paper_id.eq.${paperId}`)
    .order('strength', { ascending: false });

  if (error) {
    console.error(`Error fetching relationships for paper ${paperId}:`, error);
    throw error;
  }

  return data || [];
}

/**
 * 그래프 뷰 조회 (논문 정보 포함)
 */
export async function getRelationshipGraph(): Promise<RelationshipWithPapers[]> {
  const { data, error } = await supabase.from('relationship_graph').select('*');

  if (error) {
    console.error('Error fetching relationship graph:', error);
    throw error;
  }

  return data || [];
}

/**
 * 관계 생성
 */
export async function createRelationship(
  relationship: RelationshipInsert
): Promise<PaperRelationship | null> {
  const { data, error } = await supabase
    .from('paper_relationships')
    .insert(relationship)
    .select()
    .single();

  if (error) {
    console.error('Error creating relationship:', error);
    throw error;
  }

  return data;
}

/**
 * 관계 수정
 */
export async function updateRelationship(
  id: string,
  updates: RelationshipUpdate
): Promise<PaperRelationship | null> {
  const { data, error } = await supabase
    .from('paper_relationships')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating relationship ${id}:`, error);
    throw error;
  }

  return data;
}

/**
 * 관계 삭제
 */
export async function deleteRelationship(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('paper_relationships')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting relationship ${id}:`, error);
    return false;
  }

  return true;
}
