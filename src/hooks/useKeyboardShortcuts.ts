'use client';

import { useEffect, useState, useCallback } from 'react';

interface KeyboardShortcutsState {
  isHelpOpen: boolean;
  isCommandPaletteOpen: boolean;
  openHelp: () => void;
  closeHelp: () => void;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
}

export function useKeyboardShortcuts(): KeyboardShortcutsState {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  const openHelp = useCallback(() => setIsHelpOpen(true), []);
  const closeHelp = useCallback(() => setIsHelpOpen(false), []);
  const openCommandPalette = useCallback(() => setIsCommandPaletteOpen(true), []);
  const closeCommandPalette = useCallback(() => setIsCommandPaletteOpen(false), []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable;

      // Ctrl/Cmd+K: command palette
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }

      // Esc: close overlays
      if (e.key === 'Escape') {
        if (isCommandPaletteOpen) {
          setIsCommandPaletteOpen(false);
          return;
        }
        if (isHelpOpen) {
          setIsHelpOpen(false);
          return;
        }
        return;
      }

      // Skip shortcuts below when focused on input
      if (isInput) return;

      // ?: help overlay
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        setIsHelpOpen((prev) => !prev);
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isHelpOpen, isCommandPaletteOpen]);

  return {
    isHelpOpen,
    isCommandPaletteOpen,
    openHelp,
    closeHelp,
    openCommandPalette,
    closeCommandPalette,
  };
}
