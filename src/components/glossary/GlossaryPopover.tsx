'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { GlossaryTerm } from '@/types';

const CATEGORY_COLORS: Record<GlossaryTerm['category'], string> = {
  architecture: '#3b82f6',
  technique: '#8b5cf6',
  metric: '#10b981',
  domain: '#f59e0b',
  training: '#ef4444',
};

const CATEGORY_LABELS: Record<GlossaryTerm['category'], string> = {
  architecture: '아키텍처',
  technique: '기법',
  metric: '지표',
  domain: '도메인',
  training: '학습',
};

interface GlossaryPopoverProps {
  term: GlossaryTerm;
  children: React.ReactNode;
}

export default function GlossaryPopover({ term, children }: GlossaryPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        close();
      }
    };

    document.addEventListener('keydown', handleEsc);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, close]);

  const color = CATEGORY_COLORS[term.category];
  const description = term.description.length > 150
    ? `${term.description.slice(0, 147)}...`
    : term.description;

  return (
    <span ref={ref} className="relative inline">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="cursor-pointer rounded px-0.5 font-medium underline decoration-dotted decoration-1 underline-offset-2 transition hover:bg-blue-50 dark:hover:bg-blue-900/20"
        style={{ color }}
      >
        {children}
      </button>

      {isOpen && (
        <span className="absolute left-0 top-full z-50 mt-1.5 block w-72 animate-scale-in rounded-xl border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <span className="mb-2 flex items-center gap-2">
            <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{term.name}</span>
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
              style={{ backgroundColor: `${color}15`, color }}
            >
              {CATEGORY_LABELS[term.category]}
            </span>
          </span>

          {term.aliases.length > 0 && (
            <span className="mb-2 block text-[11px] text-gray-400 dark:text-gray-500">
              {term.aliases.join(' · ')}
            </span>
          )}

          <span className="mb-3 block text-xs leading-relaxed text-gray-600 dark:text-gray-400">
            {description}
          </span>

          <Link
            href={`/glossary?q=${encodeURIComponent(term.name)}`}
            onClick={close}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 transition hover:text-blue-700 dark:text-blue-400"
          >
            용어집에서 더 보기
            <ChevronRight className="h-3 w-3" />
          </Link>
        </span>
      )}
    </span>
  );
}
