import { useEffect } from 'react';
import { create } from 'zustand';

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: 'system',
  setTheme: (theme: Theme) => set({ theme }),
}));

/**
 * 다크모드를 관리하는 훅 - layout에서 한 번 호출
 */
export function useDarkMode() {
  const { theme, setTheme } = useThemeStore();

  useEffect(() => {
    // localStorage에서 복원
    const saved = localStorage.getItem('theme') as Theme | null;
    if (saved) setTheme(saved);
  }, [setTheme]);

  useEffect(() => {
    localStorage.setItem('theme', theme);

    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      // system
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [theme]);

  // system 모드일 때 미디어 쿼리 변화 감지
  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      if (e.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  return { theme, setTheme };
}
