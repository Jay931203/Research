'use client';

import { useDarkMode } from '@/hooks/useDarkMode';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  useDarkMode();
  return <>{children}</>;
}
