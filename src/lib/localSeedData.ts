import seedData from '../../public/data/initial-papers.json';
import type {
  FamiliarityLevel,
  NoteUpsert,
  Paper,
  PaperCategory,
  PaperRelationship,
  PaperWithNote,
  RelationshipType,
  RelationshipWithPapers,
  UserNote,
} from '@/types';

const LOCAL_TIMESTAMP = '2026-01-01T00:00:00.000Z';
const LOCAL_NOTE_STORAGE_KEY = 'research.localSeedNotes.v1';

const PAPER_CATEGORIES: PaperCategory[] = [
  'csi_compression',
  'autoencoder',
  'quantization',
  'transformer',
  'cnn',
  'representation_learning',
  'wireless_communication',
  '3gpp_spec',
  'mas',
  'other',
];

const RELATIONSHIP_TYPES: RelationshipType[] = [
  'extends',
  'builds_on',
  'compares_with',
  'inspired_by',
  'inspires',
  'challenges',
  'applies',
  'related',
];

interface SeedPaper {
  title: string;
  authors?: string[];
  year?: number;
  venue?: string | null;
  doi?: string | null;
  arxiv_id?: string | null;
  abstract?: string | null;
  key_contributions?: string[];
  algorithms?: string[];
  key_equations?: Paper['key_equations'];
  architecture_detail?: string | null;
  category?: string;
  tags?: string[];
  pdf_url?: string | null;
  code_url?: string | null;
  color_hex?: string | null;
  difficulty_level?: string | null;
  prerequisites?: string[];
  learning_objectives?: string[];
  self_check_questions?: string[];
}

interface SeedRelationship {
  from_title: string;
  to_title: string;
  relationship_type?: string;
  description?: string | null;
  delta_claim?: string | null;
  strength?: number;
}

interface SeedData {
  papers?: SeedPaper[];
  relationships?: SeedRelationship[];
}

type LocalNotePatch = Partial<UserNote> & Pick<UserNote, 'paper_id' | 'session_id'>;

const rawSeedData = seedData as SeedData;

function optionalString(value: string | null | undefined): string | undefined {
  return value && value.trim() ? value : undefined;
}

function optionalStringArray(value: string[] | undefined): string[] | undefined {
  return value?.length ? [...value] : undefined;
}

function normalizeCategory(category: string | undefined): PaperCategory {
  return PAPER_CATEGORIES.includes(category as PaperCategory)
    ? (category as PaperCategory)
    : 'other';
}

function normalizeRelationshipType(type: string | undefined): RelationshipType {
  return RELATIONSHIP_TYPES.includes(type as RelationshipType)
    ? (type as RelationshipType)
    : 'related';
}

function normalizeDifficulty(
  level: string | null | undefined
): Paper['difficulty_level'] {
  if (level === 'beginner' || level === 'intermediate' || level === 'advanced') {
    return level;
  }
  return undefined;
}

function slugifyTitle(title: string, index: number): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

  return slug || `paper-${index + 1}`;
}

function clonePaper(paper: Paper): Paper {
  return {
    ...paper,
    authors: [...paper.authors],
    key_contributions: optionalStringArray(paper.key_contributions),
    algorithms: optionalStringArray(paper.algorithms),
    key_equations: paper.key_equations?.map((equation) => ({ ...equation })),
    tags: optionalStringArray(paper.tags),
    prerequisites: optionalStringArray(paper.prerequisites),
    learning_objectives: optionalStringArray(paper.learning_objectives),
    self_check_questions: optionalStringArray(paper.self_check_questions),
  };
}

const titleToId = new Map<string, string>();
const usedIds = new Set<string>();

const LOCAL_PAPERS: Paper[] = (rawSeedData.papers ?? []).map((paper, index) => {
  const title = paper.title?.trim() || `Untitled Paper ${index + 1}`;
  const baseId = slugifyTitle(title, index);
  let id = baseId;
  let suffix = 2;

  while (usedIds.has(id)) {
    id = `${baseId}-${suffix}`;
    suffix += 1;
  }

  usedIds.add(id);
  titleToId.set(title.toLowerCase(), id);

  return {
    id,
    title,
    authors: paper.authors?.length ? [...paper.authors] : ['Unknown'],
    year: Number.isFinite(paper.year) ? Number(paper.year) : 0,
    venue: optionalString(paper.venue),
    doi: optionalString(paper.doi),
    arxiv_id: optionalString(paper.arxiv_id),
    abstract: optionalString(paper.abstract),
    key_contributions: optionalStringArray(paper.key_contributions),
    algorithms: optionalStringArray(paper.algorithms),
    key_equations: paper.key_equations?.map((equation) => ({ ...equation })),
    architecture_detail: optionalString(paper.architecture_detail),
    category: normalizeCategory(paper.category),
    tags: optionalStringArray(paper.tags),
    pdf_url: optionalString(paper.pdf_url),
    code_url: optionalString(paper.code_url),
    color_hex: optionalString(paper.color_hex) ?? '#6b7280',
    difficulty_level: normalizeDifficulty(paper.difficulty_level),
    prerequisites: optionalStringArray(paper.prerequisites),
    learning_objectives: optionalStringArray(paper.learning_objectives),
    self_check_questions: optionalStringArray(paper.self_check_questions),
    created_at: LOCAL_TIMESTAMP,
    updated_at: LOCAL_TIMESTAMP,
  };
});

const paperById = new Map(LOCAL_PAPERS.map((paper) => [paper.id, paper]));

const LOCAL_RELATIONSHIPS: PaperRelationship[] = (rawSeedData.relationships ?? [])
  .map((relationship, index): PaperRelationship | null => {
    const fromId = titleToId.get(relationship.from_title.trim().toLowerCase());
    const toId = titleToId.get(relationship.to_title.trim().toLowerCase());

    if (!fromId || !toId) return null;

    return {
      id: `local-rel-${index + 1}`,
      from_paper_id: fromId,
      to_paper_id: toId,
      relationship_type: normalizeRelationshipType(relationship.relationship_type),
      description: optionalString(relationship.description),
      delta_claim: optionalString(relationship.delta_claim),
      strength: relationship.strength ?? 5,
      created_at: LOCAL_TIMESTAMP,
    };
  })
  .filter((relationship): relationship is PaperRelationship => relationship !== null);

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function noteKey(paperId: string, sessionId: string): string {
  return `${sessionId}::${paperId}`;
}

function readLocalNotes(): Record<string, LocalNotePatch> {
  if (!isBrowser()) return {};

  try {
    const raw = window.localStorage.getItem(LOCAL_NOTE_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, LocalNotePatch>) : {};
  } catch (error) {
    console.warn('Failed to read local seed notes:', error);
    return {};
  }
}

function writeLocalNotes(notes: Record<string, LocalNotePatch>): void {
  if (!isBrowser()) return;

  try {
    window.localStorage.setItem(LOCAL_NOTE_STORAGE_KEY, JSON.stringify(notes));
  } catch (error) {
    console.warn('Failed to write local seed notes:', error);
  }
}

function toUserNote(note: LocalNotePatch): UserNote {
  const now = new Date().toISOString();
  return {
    id: `local-note-${note.session_id}-${note.paper_id}`,
    paper_id: note.paper_id,
    session_id: note.session_id,
    familiarity_level: note.familiarity_level ?? 'not_started',
    is_favorite: note.is_favorite ?? false,
    last_read_at: note.last_read_at,
    note_content: note.note_content,
    importance_rating: note.importance_rating,
    personal_tags: note.personal_tags,
    created_at: note.created_at ?? now,
    updated_at: note.updated_at ?? now,
  };
}

function mergePaperWithNote(paper: Paper, note?: UserNote | null): PaperWithNote {
  return {
    ...clonePaper(paper),
    familiarity_level: note?.familiarity_level ?? 'not_started',
    is_favorite: note?.is_favorite ?? false,
    note_content: note?.note_content,
    importance_rating: note?.importance_rating,
    personal_tags: note?.personal_tags ? [...note.personal_tags] : undefined,
    last_read_at: note?.last_read_at,
    note_updated_at: note?.updated_at,
  };
}

export function getLocalPapers(): Paper[] {
  return LOCAL_PAPERS.map(clonePaper).sort((a, b) => b.year - a.year);
}

export function getLocalPaperById(id: string): Paper | null {
  const paper = paperById.get(id);
  return paper ? clonePaper(paper) : null;
}

export function searchLocalPapers(filters: {
  searchText?: string;
  categories?: string[];
  yearRange?: [number, number];
  tags?: string[];
}): Paper[] {
  const query = filters.searchText?.trim().toLowerCase();

  return getLocalPapers().filter((paper) => {
    if (query) {
      const inTitle = paper.title.toLowerCase().includes(query);
      const inAuthors = paper.authors.some((author) =>
        author.toLowerCase().includes(query)
      );
      const inTags = (paper.tags ?? []).some((tag) =>
        tag.toLowerCase().includes(query)
      );

      if (!inTitle && !inAuthors && !inTags) return false;
    }

    if (filters.categories?.length && !filters.categories.includes(paper.category)) {
      return false;
    }

    if (filters.yearRange) {
      const [minYear, maxYear] = filters.yearRange;
      if (paper.year < minYear || paper.year > maxYear) return false;
    }

    if (filters.tags?.length) {
      const tagSet = new Set(paper.tags ?? []);
      if (!filters.tags.some((tag) => tagSet.has(tag))) return false;
    }

    return true;
  });
}

export function getLocalRelationships(): PaperRelationship[] {
  return LOCAL_RELATIONSHIPS.map((relationship) => ({ ...relationship }));
}

export function getLocalRelationshipsByPaperId(paperId: string): PaperRelationship[] {
  return getLocalRelationships().filter(
    (relationship) =>
      relationship.from_paper_id === paperId || relationship.to_paper_id === paperId
  );
}

export function getLocalRelationshipGraph(): RelationshipWithPapers[] {
  return getLocalRelationships()
    .map((relationship): RelationshipWithPapers | null => {
      const fromPaper = paperById.get(relationship.from_paper_id);
      const toPaper = paperById.get(relationship.to_paper_id);

      if (!fromPaper || !toPaper) return null;

      return {
        ...relationship,
        from_title: fromPaper.title,
        from_year: fromPaper.year,
        from_category: fromPaper.category,
        from_color: fromPaper.color_hex,
        to_title: toPaper.title,
        to_year: toPaper.year,
        to_category: toPaper.category,
        to_color: toPaper.color_hex,
      };
    })
    .filter((relationship): relationship is RelationshipWithPapers => relationship !== null);
}

export function getLocalNoteByPaperId(
  paperId: string,
  sessionId: string
): UserNote | null {
  const note = readLocalNotes()[noteKey(paperId, sessionId)];
  return note ? toUserNote(note) : null;
}

export function upsertLocalNote(
  paperId: string,
  noteData: Partial<NoteUpsert>,
  sessionId: string
): UserNote | null {
  if (!paperById.has(paperId)) return null;

  const notes = readLocalNotes();
  const key = noteKey(paperId, sessionId);
  const now = new Date().toISOString();
  const previous = notes[key];

  notes[key] = {
    ...previous,
    paper_id: paperId,
    session_id: sessionId,
    familiarity_level:
      noteData.familiarity_level ??
      previous?.familiarity_level ??
      ('not_started' as FamiliarityLevel),
    is_favorite: noteData.is_favorite ?? previous?.is_favorite ?? false,
    note_content: noteData.note_content ?? previous?.note_content,
    importance_rating: noteData.importance_rating ?? previous?.importance_rating,
    personal_tags: noteData.personal_tags ?? previous?.personal_tags,
    last_read_at: noteData.last_read_at ?? previous?.last_read_at,
    created_at: previous?.created_at ?? now,
    updated_at: now,
  };

  writeLocalNotes(notes);
  return toUserNote(notes[key]);
}

export function deleteLocalNote(paperId: string, sessionId: string): boolean {
  const notes = readLocalNotes();
  delete notes[noteKey(paperId, sessionId)];
  writeLocalNotes(notes);
  return true;
}

export function getLocalPapersWithNotes(
  sessionId: string = 'default_user'
): PaperWithNote[] {
  const notes = readLocalNotes();

  return getLocalPapers().map((paper) => {
    const note = notes[noteKey(paper.id, sessionId)];
    return mergePaperWithNote(paper, note ? toUserNote(note) : null);
  });
}

export function getLocalFavoritePapers(sessionId: string): UserNote[] {
  return Object.values(readLocalNotes())
    .filter((note) => note.session_id === sessionId && note.is_favorite)
    .map(toUserNote);
}

export function upsertLocalPaperPersonalTags(
  updates: Array<{ paperId: string; personalTags: string[] }>,
  sessionId: string
): void {
  for (const update of updates) {
    upsertLocalNote(
      update.paperId,
      { personal_tags: update.personalTags },
      sessionId
    );
  }
}
