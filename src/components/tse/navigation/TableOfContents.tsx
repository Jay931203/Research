'use client';

import { useState, useEffect, useCallback } from 'react';

export interface TocItem {
  id: string;
  label: string;
  level: number; // 1 = section, 2 = subsection
}

interface TableOfContentsProps {
  items: TocItem[];
  onNavigate?: (id: string) => void;
}

export default function TableOfContents({ items, onNavigate }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top)
          );
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 }
    );

    items.forEach(item => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    if (items[0]) {
      setActiveId(items[0].id);
    }

    return () => observer.disconnect();
  }, [items]);

  const navigateTo = useCallback((id: string) => {
    if (onNavigate) {
      onNavigate(id);
      return;
    }

    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }, [onNavigate]);

  // Check if a section's children include the active item
  const isSectionActive = useCallback((index: number) => {
    if (items[index].level !== 1) return false;
    if (activeId === items[index].id) return true;
    for (let i = index + 1; i < items.length; i++) {
      if (items[i].level === 1) break;
      if (activeId === items[i].id) return true;
    }
    return false;
  }, [items, activeId]);

  return (
    <nav className="space-y-0.5">
      {items.map((item, index) => {
        const isLevel1 = item.level === 1;
        const isActive = activeId === item.id;
        const sectionActive = isLevel1 && isSectionActive(index);

        return (
          <button
            key={item.id}
            onClick={() => navigateTo(item.id)}
            aria-current={isActive ? 'location' : undefined}
            className={[
              'toc-item w-full text-left',
              isLevel1 ? 'toc-section' : 'toc-subsection',
              isActive ? 'active' : '',
              !isActive && sectionActive ? 'section-highlight' : '',
            ].filter(Boolean).join(' ')}
          >
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
