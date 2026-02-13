'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Save, Star, Tag, X } from 'lucide-react';
import type { FamiliarityLevel } from '@/types';
import { upsertNote } from '@/lib/supabase/notes';
import FamiliaritySelector from './FamiliaritySelector';

interface NoteEditorProps {
  paperId: string;
  initialContent?: string;
  initialFamiliarity?: FamiliarityLevel;
  initialFavorite?: boolean;
  initialImportance?: number;
  initialTags?: string[];
  onSave?: () => void;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'modified';

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
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setContent(initialContent);
    setFamiliarity(initialFamiliarity);
    setIsFavorite(initialFavorite);
    setImportance(initialImportance);
    setPersonalTags(initialTags);
    setSaveStatus('idle');
  }, [
    paperId,
    initialContent,
    initialFamiliarity,
    initialFavorite,
    initialImportance,
    initialTags,
  ]);

  const doSave = useCallback(
    async (data: Record<string, unknown>) => {
      setSaveStatus('saving');

      try {
        await upsertNote(paperId, {
          note_content: (data.note_content as string) ?? content,
          familiarity_level: (data.familiarity_level as FamiliarityLevel) ?? familiarity,
          is_favorite: (data.is_favorite as boolean) ?? isFavorite,
          importance_rating: (data.importance_rating as number) ?? importance,
          personal_tags: (data.personal_tags as string[]) ?? personalTags,
          last_read_at: new Date().toISOString(),
        });

        setSaveStatus('saved');
        onSave?.();
        setTimeout(() => setSaveStatus('idle'), 1800);
      } catch (error) {
        console.error('Note save error:', error);
        setSaveStatus('modified');
      }
    },
    [paperId, content, familiarity, isFavorite, importance, personalTags, onSave]
  );

  const autoSave = useCallback(
    (data: Record<string, unknown>) => {
      setSaveStatus('modified');
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => doSave(data), 1400);
    },
    [doSave]
  );

  const handleContentChange = (value: string) => {
    setContent(value);
    autoSave({ note_content: value });
  };

  const handleFamiliarityChange = (level: FamiliarityLevel) => {
    setFamiliarity(level);
    void doSave({ familiarity_level: level });
  };

  const handleFavoriteToggle = () => {
    const next = !isFavorite;
    setIsFavorite(next);
    void doSave({ is_favorite: next });
  };

  const handleImportanceChange = (rating: number) => {
    setImportance(rating);
    void doSave({ importance_rating: rating });
  };

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (!tag || personalTags.includes(tag)) return;

    const next = [...personalTags, tag];
    setPersonalTags(next);
    setTagInput('');
    void doSave({ personal_tags: next });
  };

  const handleRemoveTag = (tag: string) => {
    const next = personalTags.filter((item) => item !== tag);
    setPersonalTags(next);
    void doSave({ personal_tags: next });
  };

  const statusText: Record<SaveStatus, string> = {
    idle: '',
    saving: '저장 중...',
    saved: '저장 완료',
    modified: '수정됨',
  };

  const statusClass: Record<SaveStatus, string> = {
    idle: '',
    saving: 'text-amber-500',
    saved: 'text-emerald-500',
    modified: 'text-orange-500',
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
        <div className="mb-2 flex items-center justify-between">
          <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">
            개인 노트
          </label>
          {saveStatus !== 'idle' && (
            <span className={`text-xs ${statusClass[saveStatus]}`}>
              {saveStatus === 'saving' && <Save className="mr-1 inline h-3 w-3 animate-spin" />}
              {statusText[saveStatus]}
            </span>
          )}
        </div>
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
              <button onClick={() => handleRemoveTag(tag)} aria-label={`${tag} 태그 삭제`}>
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

