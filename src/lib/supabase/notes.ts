import { supabase } from './client';
import type { UserNote, NoteUpsert, PaperWithNote } from '@/types';

// 기본 세션 ID
const DEFAULT_SESSION_ID = 'default_user';

/**
 * 특정 논문의 노트 조회
 */
export async function getNoteByPaperId(
  paperId: string,
  sessionId: string = DEFAULT_SESSION_ID
): Promise<UserNote | null> {
  const { data, error } = await supabase
    .from('user_notes')
    .select('*')
    .eq('paper_id', paperId)
    .eq('session_id', sessionId)
    .single();

  if (error) {
    // 노트가 없는 경우는 에러가 아님
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error(`Error fetching note for paper ${paperId}:`, error);
    return null;
  }

  return data;
}

/**
 * 노트 생성 또는 수정 (Upsert)
 */
export async function upsertNote(
  paperId: string,
  noteData: Partial<NoteUpsert>,
  sessionId: string = DEFAULT_SESSION_ID
): Promise<UserNote | null> {
  const upsertData: NoteUpsert = {
    paper_id: paperId,
    session_id: sessionId,
    familiarity_level: noteData.familiarity_level || 'not_started',
    is_favorite: noteData.is_favorite || false,
    ...noteData,
  };

  const { data, error } = await supabase
    .from('user_notes')
    .upsert(upsertData, {
      onConflict: 'paper_id,session_id',
    })
    .select()
    .single();

  if (error) {
    console.error(`Error upserting note for paper ${paperId}:`, error);
    throw error;
  }

  return data;
}

/**
 * 노트 삭제
 */
export async function deleteNote(
  paperId: string,
  sessionId: string = DEFAULT_SESSION_ID
): Promise<boolean> {
  const { error } = await supabase
    .from('user_notes')
    .delete()
    .eq('paper_id', paperId)
    .eq('session_id', sessionId);

  if (error) {
    console.error(`Error deleting note for paper ${paperId}:`, error);
    return false;
  }

  return true;
}

/**
 * 논문 + 노트 통합 조회 (papers_with_notes 뷰 사용)
 */
export async function getPapersWithNotes(): Promise<PaperWithNote[]> {
  const { data, error } = await supabase
    .from('papers_with_notes')
    .select('*')
    .order('year', { ascending: false });

  if (error) {
    console.error('Error fetching papers with notes:', error);
    throw error;
  }

  return data || [];
}

/**
 * 즐겨찾기 논문 조회
 */
export async function getFavoritePapers(
  sessionId: string = DEFAULT_SESSION_ID
): Promise<UserNote[]> {
  const { data, error } = await supabase
    .from('user_notes')
    .select('*')
    .eq('session_id', sessionId)
    .eq('is_favorite', true);

  if (error) {
    console.error('Error fetching favorite papers:', error);
    throw error;
  }

  return data || [];
}
