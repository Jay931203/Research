'use client';

import { useMemo } from 'react';
import type { GlossaryTerm } from '@/types';
import GlossaryPopover from './GlossaryPopover';

interface GlossaryHighlighterProps {
  text: string;
  terms: GlossaryTerm[];
}

export default function GlossaryHighlighter({ text, terms }: GlossaryHighlighterProps) {
  const { pattern, termMap } = useMemo(() => {
    if (!terms.length) return { pattern: null, termMap: new Map<string, GlossaryTerm>() };

    const entries: { key: string; term: GlossaryTerm }[] = [];

    for (const term of terms) {
      entries.push({ key: term.name, term });
      for (const alias of term.aliases) {
        entries.push({ key: alias, term });
      }
    }

    // Sort by length descending so longer names match first
    entries.sort((a, b) => b.key.length - a.key.length);

    const map = new Map<string, GlossaryTerm>();
    const escapedKeys: string[] = [];

    for (const entry of entries) {
      const lower = entry.key.toLowerCase();
      if (!map.has(lower)) {
        map.set(lower, entry.term);
        escapedKeys.push(entry.key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
      }
    }

    if (!escapedKeys.length) return { pattern: null, termMap: map };

    const regex = new RegExp(`(${escapedKeys.join('|')})`, 'gi');
    return { pattern: regex, termMap: map };
  }, [terms]);

  if (!pattern || !terms.length) {
    return <>{text}</>;
  }

  const parts = text.split(pattern);
  const matched = new Set<string>();

  return (
    <>
      {parts.map((part, index) => {
        const lower = part.toLowerCase();
        const term = termMap.get(lower);

        if (term && !matched.has(term.id)) {
          matched.add(term.id);
          return (
            <GlossaryPopover key={index} term={term}>
              {part}
            </GlossaryPopover>
          );
        }

        return <span key={index}>{part}</span>;
      })}
    </>
  );
}
