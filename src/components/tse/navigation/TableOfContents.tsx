'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

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
  const activeRef = useRef<HTMLButtonElement | null>(null);
  const isNavigatingRef = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Skip observer updates while user is clicking a TOC item
        if (isNavigatingRef.current) return;

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

  // Auto-scroll TOC to keep active item visible (only within TOC container)
  useEffect(() => {
    if (activeRef.current && !isNavigatingRef.current) {
      activeRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [activeId]);

  const navigateTo = useCallback((id: string) => {
    // Temporarily suppress observer to prevent scroll fighting
    isNavigatingRef.current = true;
    setActiveId(id);

    if (onNavigate) {
      onNavigate(id);
    } else {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }

    // Re-enable observer after scroll settles
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 1000);
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

  // Find active item's parent section index for progress indicator
  const activeIndex = items.findIndex(item => item.id === activeId);
  const totalSections = items.filter(item => item.level === 1).length;
  const activeSectionIndex = (() => {
    for (let i = activeIndex; i >= 0; i--) {
      if (items[i]?.level === 1) {
        return items.filter((it, idx) => it.level === 1 && idx <= i).length;
      }
    }
    return 0;
  })();

  return (
    <nav className="space-y-0.5 relative">
      {items.map((item, index) => {
        const isLevel1 = item.level === 1;
        const isActive = activeId === item.id;
        const sectionActive = isLevel1 && isSectionActive(index);

        return (
          <button
            key={item.id}
            ref={isActive ? activeRef : undefined}
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
      {/* Section progress at bottom */}
      {totalSections > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 px-3">
          <div className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
            Section {activeSectionIndex} / {totalSections}
          </div>
        </div>
      )}
    </nav>
  );
}
