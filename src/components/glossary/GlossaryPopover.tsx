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
  const [popPos, setPopPos] = useState<{ top: number; left: number } | null>(null);
  const containerRef = useRef<HTMLSpanElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => setIsOpen(false), []);

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => {
      if (!prev && triggerRef.current) {
        const r = triggerRef.current.getBoundingClientRect();
        const popupH = 270;
        const popupW = 288;
        const spaceBelow = window.innerHeight - r.bottom;
        const top = spaceBelow > popupH + 10
          ? r.bottom + 6
          : Math.max(8, r.top - popupH - 6);
        const left = Math.max(8, Math.min(r.left, window.innerWidth - popupW - 8));
        setPopPos({ top, left });
      }
      return !prev;
    });
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };

    const handleScroll = () => close();

    document.addEventListener('keydown', handleEsc);
    window.addEventListener('scroll', handleScroll, { passive: true, capture: true });
    return () => {
      document.removeEventListener('keydown', handleEsc);
      window.removeEventListener('scroll', handleScroll, { capture: true });
    };
  }, [isOpen, close]);

  const color = CATEGORY_COLORS[term.category];
  const description = term.description.length > 180
    ? `${term.description.slice(0, 177)}...`
    : term.description;

  return (
    <span ref={containerRef} className="inline">
      <button
        ref={triggerRef}
        onClick={handleToggle}
        className="cursor-pointer rounded px-0.5 font-medium underline decoration-dotted decoration-1 underline-offset-2 transition hover:bg-blue-50 dark:hover:bg-blue-900/20"
        style={{ color }}
      >
        {children}
      </button>

      {isOpen && popPos && (
        <>
        {/* Backdrop: catches clicks outside the popup so navigation links behind it still work after closing */}
        <span className="fixed inset-0 z-[9998]" onClick={close} />
        <span
          className="fixed z-[9999] block w-72 animate-scale-in rounded-xl border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-700 dark:bg-gray-800"
          style={{ top: popPos.top, left: popPos.left }}
        >
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
        </>
      )}
    </span>
  );
}
