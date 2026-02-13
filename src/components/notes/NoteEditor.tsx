'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Star, Save, Tag, X } from 'lucide-react';
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

  // initialContent 변경 시 동기화
  useEffect(() => {
    setContent(initialContent);
    setFamiliarity(initialFamiliarity);
    setIsFavorite(initialFavorite);
    setImportance(initialImportance);
    setPersonalTags(initialTags);
  }, [paperId, initialContent, initialFamiliarity, initialFavorite, initialImportance, initialTags]);

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
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (err) {
        console.error('Note save error:', err);
        setSaveStatus('modified');
      }
    },
    [paperId, content, familiarity, isFavorite, importance, personalTags, onSave]
  );

  // 자동 저장 (debounce 1.5초)
  const autoSave = useCallback(
    (data: Record<string, unknown>) => {
      setSaveStatus('modified');
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => doSave(data), 1500);
    },
    [doSave]
  );

  const handleContentChange = (val: string) => {
    setContent(val);
    autoSave({ note_content: val });
  };

  const handleFamiliarityChange = (level: FamiliarityLevel) => {
    setFamiliarity(level);
    doSave({ familiarity_level: level });
  };

  const handleFavoriteToggle = () => {
    const next = !isFavorite;
    setIsFavorite(next);
    doSave({ is_favorite: next });
  };

  const handleImportanceChange = (rating: number) => {
    setImportance(rating);
    doSave({ importance_rating: rating });
  };

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !personalTags.includes(tag)) {
      const next = [...personalTags, tag];
      setPersonalTags(next);
      setTagInput('');
      doSave({ personal_tags: next });
    }
  };

  const handleRemoveTag = (tag: string) => {
    const next = personalTags.filter((t) => t !== tag);
    setPersonalTags(next);
    doSave({ personal_tags: next });
  };

  const statusText: Record<SaveStatus, string> = {
    idle: '',
    saving: '저장 중...',
    saved: '저장됨',
    modified: '수정됨',
  };

  const statusColor: Record<SaveStatus, string> = {
    idle: '',
    saving: 'text-yellow-500',
    saved: 'text-green-500',
    modified: 'text-orange-500',
  };

  return (
    <div className="space-y-4">
      {/* 이해도 */}
      <div>
        <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 block">
          이해도
        </label>
        <FamiliaritySelector value={familiarity} onChange={handleFamiliarityChange} />
      </div>

      {/* 즐겨찾기 + 중요도 */}
      <div className="flex items-center gap-6">
        <button
          onClick={handleFavoriteToggle}
          className="flex items-center gap-1.5 text-sm transition"
        >
          <Star
            className={`w-5 h-5 ${
              isFavorite ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'
            }`}
          />
          <span className="text-xs text-gray-600 dark:text-gray-400">즐겨찾기</span>
        </button>

        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-600 dark:text-gray-400 mr-1">중요도</span>
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} onClick={() => handleImportanceChange(n)}>
              <Star
                className={`w-4 h-4 transition ${
                  n <= importance
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-gray-300 dark:text-gray-600'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* 메모 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">
            개인 메모
          </label>
          <div className="flex items-center gap-2">
            {saveStatus !== 'idle' && (
              <span className={`text-xs ${statusColor[saveStatus]}`}>
                {saveStatus === 'saving' && <Save className="w-3 h-3 inline mr-1 animate-spin" />}
                {statusText[saveStatus]}
              </span>
            )}
          </div>
        </div>
        <textarea
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="메모를 입력하세요... (Markdown 지원)"
          rows={6}
          className="w-full px-3 py-2 text-sm border rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
        />
      </div>

      {/* 개인 태그 */}
      <div>
        <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 block">
          개인 태그
        </label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {personalTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full"
            >
              <Tag className="w-3 h-3" />
              {tag}
              <button onClick={() => handleRemoveTag(tag)}>
                <X className="w-3 h-3 hover:text-red-500" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
            placeholder="태그 입력 후 Enter"
            className="flex-1 px-3 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 dark:border-gray-700"
          />
        </div>
      </div>
    </div>
  );
}
