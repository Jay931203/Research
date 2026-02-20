import { supabase } from './client';
import type { UserNote, NoteUpsert, PaperWithNote } from '@/types';

// Default session id for anonymous/local usage
const DEFAULT_SESSION_ID = 'default_user';
export const MAP_HIDDEN_TAG = '__research_map_hidden__';

function normalizeTagList(tags: string[] | null | undefined): string[] {
  return Array.from(new Set((tags ?? []).filter((tag) => !!tag)));
}

export function hasMapHiddenTag(tags: string[] | null | undefined): boolean {
  return normalizeTagList(tags).includes(MAP_HIDDEN_TAG);
}

export function withMapHiddenTag(
  tags: string[] | null | undefined,
  hidden: boolean
): string[] {
  const base = normalizeTagList(tags).filter((tag) => tag !== MAP_HIDDEN_TAG);
  if (!hidden) return base;
  return [...base, MAP_HIDDEN_TAG];
}

interface PaperTagUpsertInput {
  paperId: string;
  personalTags: string[];
}

/**
 * Fetch a single note by paper id
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
    .maybeSingle();

  if (error) {
    console.error(`Error fetching note for paper ${paperId}:`, error);
    return null;
  }

  return data ?? null;
}

/**
 * Create or update a note (upsert)
 */
export async function upsertNote(
  paperId: string,
  noteData: Partial<NoteUpsert>,
  sessionId: string = DEFAULT_SESSION_ID
): Promise<UserNote | null> {
  const upsertData: Partial<NoteUpsert> &
    Pick<NoteUpsert, 'paper_id' | 'session_id'> = {
    paper_id: paperId,
    session_id: sessionId,
  };

  if (noteData.familiarity_level !== undefined) {
    upsertData.familiarity_level = noteData.familiarity_level;
  }
  if (noteData.is_favorite !== undefined) {
    upsertData.is_favorite = noteData.is_favorite;
  }
  if (noteData.note_content !== undefined) {
    upsertData.note_content = noteData.note_content;
  }
  if (noteData.personal_tags !== undefined) {
    upsertData.personal_tags = noteData.personal_tags;
  }
  if (noteData.last_read_at !== undefined) {
    upsertData.last_read_at = noteData.last_read_at;
  }
  if (
    noteData.importance_rating !== undefined &&
    noteData.importance_rating >= 1 &&
    noteData.importance_rating <= 5
  ) {
    upsertData.importance_rating = noteData.importance_rating;
  }

  const { error } = await supabase.from('user_notes').upsert(upsertData, {
    onConflict: 'paper_id,session_id',
  });

  if (error) {
    console.error(`Error upserting note for paper ${paperId}:`, error);
    throw error;
  }

  // If readback fails due temporary/select policy issues, keep save as success.
  const { data, error: fetchError } = await supabase
    .from('user_notes')
    .select('*')
    .eq('paper_id', paperId)
    .eq('session_id', sessionId)
    .maybeSingle();

  if (fetchError) {
    console.warn(`Upsert succeeded but note fetch failed for paper ${paperId}:`, fetchError);
    return null;
  }

  return data ?? null;
}

/**
 * Delete a note
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
 * Fetch integrated papers + notes (using papers_with_notes view)
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
 * Fetch favorite notes
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

/**
 * Upsert personal tag updates for multiple papers
 */
export async function upsertPaperPersonalTags(
  updates: PaperTagUpsertInput[],
  sessionId: string = DEFAULT_SESSION_ID
): Promise<void> {
  if (!updates.length) return;

  const payload = updates
    .filter((update) => !!update.paperId)
    .map((update) => ({
      paper_id: update.paperId,
      session_id: sessionId,
      personal_tags: normalizeTagList(update.personalTags),
    }));

  if (!payload.length) return;

  const { error } = await supabase.from('user_notes').upsert(payload, {
    onConflict: 'paper_id,session_id',
  });

  if (error) {
    console.error('Error upserting map personal tags:', error);
    throw error;
  }
}
