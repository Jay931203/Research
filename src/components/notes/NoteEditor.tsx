'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Star, Tag, X } from 'lucide-react';
import type { FamiliarityLevel } from '@/types';
import { upsertNote } from '@/lib/supabase/notes';
import { useToastStore } from '@/store/useToastStore';
import FamiliaritySelector from './FamiliaritySelector';

interface NoteEditorProps {
  paperId: string;
  initialContent?: string;
  initialFamiliarity?: FamiliarityLevel;
  initialFavorite?: boolean;
  initialImportance?: number;
  initialTags?: string[];
  onSave?: () => void | Promise<void>;
}

type SavePatch = Record<string, unknown>;

interface LocalNoteState {
  content: string;
  familiarity: FamiliarityLevel;
  isFavorite: boolean;
  importance: number;
  personalTags: string[];
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function NoteEditor({
  paperId,
  initialContent = '',
  initialFamiliarity = 'not_started',
  initialFavorite = false,
  initialImportance = 0,
  initialTags = [],
  onSave,
}: NoteEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [familiarity, setFamiliarity] = useState<FamiliarityLevel>(initialFamiliarity);
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [importance, setImportance] = useState(initialImportance);
  const [personalTags, setPersonalTags] = useState<string[]>(initialTags);
  const [tagInput, setTagInput] = useState('');

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savingRef = useRef(false);
  const queuedPatchRef = useRef<SavePatch | null>(null);
  const latestStateRef = useRef<LocalNoteState>({
    content: initialContent,
    familiarity: initialFamiliarity,
    isFavorite: initialFavorite,
    importance: initialImportance,
    personalTags: initialTags,
  });

  const addToast = useToastStore((s) => s.addToast);

  useEffect(() => {
    setContent(initialContent);
    setFamiliarity(initialFamiliarity);
    setIsFavorite(initialFavorite);
    setImportance(initialImportance);
    setPersonalTags(initialTags);
    latestStateRef.current = {
      content: initialContent,
      familiarity: initialFamiliarity,
      isFavorite: initialFavorite,
      importance: initialImportance,
      personalTags: initialTags,
    };
  }, [
    paperId,
    initialContent,
    initialFamiliarity,
    initialFavorite,
    initialImportance,
    initialTags,
  ]);

  useEffect(() => {
    latestStateRef.current = {
      content,
      familiarity,
      isFavorite,
      importance,
      personalTags,
    };
  }, [content, familiarity, isFavorite, importance, personalTags]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const buildPayload = useCallback((patch: SavePatch) => {
    const latest = latestStateRef.current;
    const nextImportance = (patch.importance_rating as number | undefined) ?? latest.importance;
    const sanitizedImportance =
      typeof nextImportance === 'number' && nextImportance >= 1 && nextImportance <= 5
        ? nextImportance
        : undefined;

    return {
      note_content: (patch.note_content as string | undefined) ?? latest.content,
      familiarity_level:
        (patch.familiarity_level as FamiliarityLevel | undefined) ?? latest.familiarity,
      is_favorite: (patch.is_favorite as boolean | undefined) ?? latest.isFavorite,
      importance_rating: sanitizedImportance,
      personal_tags: (patch.personal_tags as string[] | undefined) ?? latest.personalTags,
      last_read_at: new Date().toISOString(),
    };
  }, []);

  const saveWithRetry = useCallback(
    async (patch: SavePatch) => {
      let lastError: unknown;
      for (let attempt = 1; attempt <= 3; attempt += 1) {
        try {
          await upsertNote(paperId, buildPayload(patch));
          return;
        } catch (error) {
          lastError = error;
          if (attempt < 3) {
            await sleep(250 * attempt);
          }
        }
      }
      throw lastError;
    },
    [paperId, buildPayload]
  );

  const runSaveQueue = useCallback(async () => {
    if (savingRef.current) return;
    if (!queuedPatchRef.current) return;

    savingRef.current = true;
    try {
      while (queuedPatchRef.current) {
        const patch = queuedPatchRef.current;
        queuedPatchRef.current = null;

        try {
          await saveWithRetry(patch);
          addToast('success', '노트 저장 완료');
          if (onSave) {
            try {
              await Promise.resolve(onSave());
            } catch (refreshError) {
              console.warn('Note saved but post-save refresh failed:', refreshError);
            }
          }
        } catch (error) {
          console.error('Note save error:', error);
          // Put failed patch back and retry later.
          queuedPatchRef.current = {
            ...(patch ?? {}),
            ...(queuedPatchRef.current ?? {}),
          };
          addToast('error', '저장 실패, 재시도합니다');
          setTimeout(() => {
            void runSaveQueue();
          }, 1200);
          return;
        }
      }
    } finally {
      savingRef.current = false;
    }
  }, [saveWithRetry, addToast, onSave]);

  const enqueueSave = useCallback(
    (patch: SavePatch, immediate = false) => {
      queuedPatchRef.current = {
        ...(queuedPatchRef.current ?? {}),
        ...patch,
      };

      if (immediate) {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        void runSaveQueue();
        return;
      }

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        void runSaveQueue();
      }, 1400);
    },
    [runSaveQueue]
  );

  const handleContentChange = (value: string) => {
    setContent(value);
    enqueueSave({ note_content: value });
  };

  const handleFamiliarityChange = (level: FamiliarityLevel) => {
    setFamiliarity(level);
    enqueueSave({ familiarity_level: level }, true);
  };

  const handleFavoriteToggle = () => {
    const next = !isFavorite;
    setIsFavorite(next);
    enqueueSave({ is_favorite: next }, true);
  };

  const handleImportanceChange = (rating: number) => {
    setImportance(rating);
    enqueueSave({ importance_rating: rating }, true);
  };

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (!tag || personalTags.includes(tag)) return;

    const next = [...personalTags, tag];
    setPersonalTags(next);
    setTagInput('');
    enqueueSave({ personal_tags: next }, true);
  };

  const handleRemoveTag = (tag: string) => {
    const next = personalTags.filter((item) => item !== tag);
    setPersonalTags(next);
    enqueueSave({ personal_tags: next }, true);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-2 block text-xs font-semibold text-gray-600 dark:text-gray-400">
          이해도
        </label>
        <FamiliaritySelector value={familiarity} onChange={handleFamiliarityChange} />
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <button
          onClick={handleFavoriteToggle}
          className="inline-flex items-center gap-1.5 text-sm transition"
        >
          <Star
            className={`h-5 w-5 ${
              isFavorite ? 'fill-yellow-500 text-yellow-500' : 'text-gray-400'
            }`}
          />
          <span className="text-xs text-gray-600 dark:text-gray-400">즐겨찾기</span>
        </button>

        <div className="flex items-center gap-1">
          <span className="mr-1 text-xs text-gray-600 dark:text-gray-400">중요도</span>
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              onClick={() => handleImportanceChange(value)}
              aria-label={`중요도 ${value}`}
            >
              <Star
                className={`h-4 w-4 transition ${
                  value <= importance
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-gray-300 dark:text-gray-600'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-xs font-semibold text-gray-600 dark:text-gray-400">
          개인 노트
        </label>
        <textarea
          value={content}
          onChange={(event) => handleContentChange(event.target.value)}
          placeholder="핵심 아이디어, 실험 인사이트, 다음 액션을 자유롭게 기록하세요. (Markdown 지원)"
          rows={6}
          className="w-full resize-y rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
        />
      </div>

      <div>
        <label className="mb-2 block text-xs font-semibold text-gray-600 dark:text-gray-400">
          개인 태그
        </label>
        <div className="mb-2 flex flex-wrap gap-1.5">
          {personalTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
            >
              <Tag className="h-3 w-3" />
              {tag}
              <button onClick={() => handleRemoveTag(tag)} aria-label={`${tag} 태그 제거`}>
                <X className="h-3 w-3 transition hover:text-red-500" />
              </button>
            </span>
          ))}
        </div>
        <input
          type="text"
          value={tagInput}
          onChange={(event) => setTagInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== 'Enter') return;
            event.preventDefault();
            handleAddTag();
          }}
          placeholder="태그 입력 후 Enter"
          className="w-full rounded-lg border bg-white px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
        />
      </div>
    </div>
  );
}
