import { createContext, useContext } from 'react';
import type { GlossaryTerm } from '@/types';

export const GlossaryTermsContext = createContext<GlossaryTerm[]>([]);

export function useGlossaryTerms(): GlossaryTerm[] {
  return useContext(GlossaryTermsContext);
}
