'use client';

import { useState, useCallback } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import type { PaperCategory } from '@/types';
import { createPaper, updatePaper, deletePaper } from '@/lib/supabase/papers';

interface PaperFormData {
  title: string;
  authors: string[];
  year: number;
  venue: string;
  abstract: string;
  key_contributions: string[];
  algorithms: string[];
  category: PaperCategory;
  tags: string[];
  pdf_url: string;
  code_url: string;
  color_hex: string;
}

interface PaperFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  editData?: { id: string } & Partial<PaperFormData>;
}

const CATEGORIES: { value: PaperCategory; label: string }[] = [
  { value: 'csi_compression', label: 'CSI Compression' },
  { value: 'autoencoder', label: 'AutoEncoder' },
  { value: 'quantization', label: 'Quantization' },
  { value: 'transformer', label: 'Transformer' },
  { value: 'cnn', label: 'CNN' },
  { value: 'representation_learning', label: 'Representation Learning' },
  { value: 'other', label: 'Other' },
];

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#6366f1'];

const emptyForm: PaperFormData = {
  title: '',
  authors: [''],
  year: new Date().getFullYear(),
  venue: '',
  abstract: '',
  key_contributions: [''],
  algorithms: [''],
  category: 'csi_compression',
  tags: [],
  pdf_url: '',
  code_url: '',
  color_hex: '#3b82f6',
};

export default function PaperFormModal({
  isOpen,
  onClose,
  onSaved,
  editData,
}: PaperFormModalProps) {
  const isEdit = !!editData?.id;

  const [form, setForm] = useState<PaperFormData>(() => {
    if (editData) {
      const normalizedCategory =
        editData.category === 'other' &&
        editData.tags?.includes('representation_learning')
          ? 'representation_learning'
          : editData.category;

      return {
        ...emptyForm,
        ...editData,
        category: (normalizedCategory ?? emptyForm.category) as PaperCategory,
        authors: editData.authors?.length ? editData.authors : [''],
        key_contributions: editData.key_contributions?.length ? editData.key_contributions : [''],
        algorithms: editData.algorithms?.length ? editData.algorithms : [''],
      };
    }
    return { ...emptyForm };
  });

  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const updateField = <K extends keyof PaperFormData>(key: K, value: PaperFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateArrayItem = (key: 'authors' | 'key_contributions' | 'algorithms', idx: number, value: string) => {
    setForm((prev) => {
      const arr = [...prev[key]];
      arr[idx] = value;
      return { ...prev, [key]: arr };
    });
  };

  const addArrayItem = (key: 'authors' | 'key_contributions' | 'algorithms') => {
    setForm((prev) => ({ ...prev, [key]: [...prev[key], ''] }));
  };

  const removeArrayItem = (key: 'authors' | 'key_contributions' | 'algorithms', idx: number) => {
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].filter((_, i) => i !== idx),
    }));
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !form.tags.includes(tag)) {
      updateField('tags', [...form.tags, tag]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    updateField('tags', form.tags.filter((t) => t !== tag));
  };

  const handleSubmit = useCallback(async () => {
    if (!form.title.trim()) {
      setError('논문 제목을 입력해주세요.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const data = {
        title: form.title.trim(),
        authors: form.authors.filter((a) => a.trim()),
        year: form.year,
        venue: form.venue.trim() || undefined,
        abstract: form.abstract.trim() || undefined,
        key_contributions: form.key_contributions.filter((c) => c.trim()),
        algorithms: form.algorithms.filter((a) => a.trim()),
        category: form.category,
        tags: form.tags,
        pdf_url: form.pdf_url.trim() || undefined,
        code_url: form.code_url.trim() || undefined,
        color_hex: form.color_hex,
      };

      if (isEdit && editData?.id) {
        await updatePaper(editData.id, data);
      } else {
        await createPaper(data as any);
      }

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || '저장 실패');
    } finally {
      setSaving(false);
    }
  }, [form, isEdit, editData, onSaved, onClose]);

  const handleDelete = useCallback(async () => {
    if (!editData?.id || !confirm('이 논문을 삭제하시겠습니까?')) return;
    setSaving(true);
    try {
      await deletePaper(editData.id);
      onSaved();
      onClose();
    } catch {
      setError('삭제 실패');
    } finally {
      setSaving(false);
    }
  }, [editData, onSaved, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed top-0 right-0 z-50 h-full w-full max-w-lg bg-white dark:bg-gray-900 shadow-2xl overflow-hidden animate-slide-in-right">
        {/* Header */}
        <div className="sticky top-0 z-10 px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex items-center justify-between">
          <h2 className="text-lg font-bold">{isEdit ? '논문 수정' : '논문 추가'}</h2>
          <div className="flex items-center gap-2">
            {isEdit && (
              <button
                onClick={handleDelete}
                disabled={saving}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="overflow-y-auto h-[calc(100%-130px)] px-6 py-5 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {/* 제목 */}
          <Field label="제목 *">
            <input
              type="text"
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
              className="input-base"
              placeholder="논문 제목"
            />
          </Field>

          {/* 저자 */}
          <Field label="저자">
            {form.authors.map((author, i) => (
              <div key={i} className="flex gap-2 mb-1.5">
                <input
                  type="text"
                  value={author}
                  onChange={(e) => updateArrayItem('authors', i, e.target.value)}
                  className="input-base flex-1"
                  placeholder={`저자 ${i + 1}`}
                />
                {form.authors.length > 1 && (
                  <button onClick={() => removeArrayItem('authors', i)} className="text-gray-400 hover:text-red-500">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button onClick={() => addArrayItem('authors')} className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1">
              <Plus className="w-3 h-3" /> 저자 추가
            </button>
          </Field>

          {/* 연도 & venue */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="연도">
              <input
                type="number"
                value={form.year}
                onChange={(e) => updateField('year', parseInt(e.target.value) || 2024)}
                className="input-base"
              />
            </Field>
            <Field label="학회/저널">
              <input
                type="text"
                value={form.venue}
                onChange={(e) => updateField('venue', e.target.value)}
                className="input-base"
                placeholder="IEEE TWC"
              />
            </Field>
          </div>

          {/* 카테고리 & 색상 */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="카테고리">
              <select
                value={form.category}
                onChange={(e) => updateField('category', e.target.value as PaperCategory)}
                className="input-base"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </Field>
            <Field label="노드 색상">
              <div className="flex gap-1.5 flex-wrap">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => updateField('color_hex', c)}
                    className={`w-7 h-7 rounded-full border-2 transition ${
                      form.color_hex === c ? 'border-gray-900 dark:border-white scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </Field>
          </div>

          {/* 초록 */}
          <Field label="초록">
            <textarea
              value={form.abstract}
              onChange={(e) => updateField('abstract', e.target.value)}
              className="input-base resize-y"
              rows={4}
              placeholder="논문 초록"
            />
          </Field>

          {/* 주요 기여 */}
          <Field label="주요 기여">
            {form.key_contributions.map((c, i) => (
              <div key={i} className="flex gap-2 mb-1.5">
                <input
                  type="text"
                  value={c}
                  onChange={(e) => updateArrayItem('key_contributions', i, e.target.value)}
                  className="input-base flex-1"
                  placeholder={`기여 ${i + 1}`}
                />
                {form.key_contributions.length > 1 && (
                  <button onClick={() => removeArrayItem('key_contributions', i)} className="text-gray-400 hover:text-red-500">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button onClick={() => addArrayItem('key_contributions')} className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1">
              <Plus className="w-3 h-3" /> 기여 추가
            </button>
          </Field>

          {/* 알고리즘 */}
          <Field label="알고리즘">
            {form.algorithms.map((a, i) => (
              <div key={i} className="flex gap-2 mb-1.5">
                <input
                  type="text"
                  value={a}
                  onChange={(e) => updateArrayItem('algorithms', i, e.target.value)}
                  className="input-base flex-1"
                  placeholder={`알고리즘 ${i + 1}`}
                />
                {form.algorithms.length > 1 && (
                  <button onClick={() => removeArrayItem('algorithms', i)} className="text-gray-400 hover:text-red-500">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button onClick={() => addArrayItem('algorithms')} className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1">
              <Plus className="w-3 h-3" /> 알고리즘 추가
            </button>
          </Field>

          {/* 태그 */}
          <Field label="태그">
            <div className="flex flex-wrap gap-1.5 mb-2">
              {form.tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 rounded-full">
                  #{tag}
                  <button onClick={() => removeTag(tag)}><X className="w-3 h-3 hover:text-red-500" /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="input-base flex-1"
                placeholder="태그 입력 후 Enter"
              />
            </div>
          </Field>

          {/* 링크 */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="PDF URL">
              <input
                type="url"
                value={form.pdf_url}
                onChange={(e) => updateField('pdf_url', e.target.value)}
                className="input-base"
                placeholder="https://..."
              />
            </Field>
            <Field label="Code URL">
              <input
                type="url"
                value={form.code_url}
                onChange={(e) => updateField('code_url', e.target.value)}
                className="input-base"
                placeholder="https://..."
              />
            </Field>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition"
          >
            {saving ? '저장 중...' : isEdit ? '수정' : '추가'}
          </button>
        </div>
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 block">
        {label}
      </label>
      {children}
    </div>
  );
}
