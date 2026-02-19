import type { FamiliarityLevel, PaperWithNote } from '@/types';
import { inferResearchTopic } from '@/lib/visualization/graphUtils';

export interface PaperSearchFilters {
  searchText: string;
  categories: string[];
  yearRange: [number, number];
  familiarityLevels: FamiliarityLevel[];
  importanceRatings: number[];
}

function normalizeFamiliarityLevel(level: FamiliarityLevel | undefined): FamiliarityLevel {
  if (level === 'expert') return 'familiar';
  return level ?? 'not_started';
}

export function filterPapersBySearchFilters<T extends PaperWithNote>(
  papers: T[],
  filters: PaperSearchFilters
): T[] {
  return papers.filter((paper) => {
    if (filters.searchText.trim()) {
      const query = filters.searchText.toLowerCase().trim();
      const inTitle = paper.title.toLowerCase().includes(query);
      const inAuthors = paper.authors.some((author) => author.toLowerCase().includes(query));
      const inTags = (paper.tags ?? []).some((tag) => tag.toLowerCase().includes(query));

      if (!inTitle && !inAuthors && !inTags) return false;
    }

    if (filters.categories.length) {
      const matchesRawCategory = filters.categories.includes(paper.category);
      const isRepresentationCategory = filters.categories.includes('representation_learning');
      const matchesRepresentationTopic =
        isRepresentationCategory && inferResearchTopic(paper) === 'representation_learning';

      if (!matchesRawCategory && !matchesRepresentationTopic) {
        return false;
      }
    }

    if (paper.year < filters.yearRange[0] || paper.year > filters.yearRange[1]) {
      return false;
    }

    if (filters.familiarityLevels.length) {
      const level = normalizeFamiliarityLevel(paper.familiarity_level);
      if (!filters.familiarityLevels.includes(level)) return false;
    }

    if (filters.importanceRatings.length) {
      const importance = paper.importance_rating ?? 0;
      if (!filters.importanceRatings.includes(importance)) return false;
    }

    return true;
  });
}
