import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { RelationshipType } from '@/types';

export interface GraphFilterSettings {
  minStrength: number;
  enabledRelationshipTypes: RelationshipType[];
  useFamiliarityOpacity: boolean;
}

export const CORE_RELATIONSHIP_TYPES: RelationshipType[] = [
  'extends',
  'builds_on',
  'inspired_by',
];

export const DEFAULT_GRAPH_FILTER_SETTINGS: GraphFilterSettings = {
  minStrength: 4,
  enabledRelationshipTypes: CORE_RELATIONSHIP_TYPES,
  useFamiliarityOpacity: false,
};

interface AppState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  sidebarVisiblePaperIds: string[] | null;
  setSidebarVisiblePaperIds: (paperIds: string[] | null) => void;

  graphFilterSettings: GraphFilterSettings;
  setGraphFilterSettings: (settings: GraphFilterSettings) => void;
  resetGraphFilterSettings: () => void;

  mapPaperIds: string[] | null;
  mapSelectionHydrated: boolean;
  setMapSelectionHydrated: (hydrated: boolean) => void;
  setMapPaperIds: (paperIds: string[] | null) => void;
  addMapPaper: (paperId: string) => void;
  addMapPapers: (paperIds: string[]) => void;
  removeMapPaper: (paperId: string) => void;
  toggleMapPaper: (paperId: string) => void;

  isReviewQueueOpen: boolean;
  toggleReviewQueue: () => void;
}

interface PersistedAppState {
  mapPaperIds: string[] | null;
}

function normalizeMapPaperIds(paperIds: string[]): string[] {
  return Array.from(new Set(paperIds.filter((paperId) => !!paperId)));
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),

      sidebarVisiblePaperIds: null,
      setSidebarVisiblePaperIds: (paperIds: string[] | null) =>
        set({ sidebarVisiblePaperIds: paperIds }),

      graphFilterSettings: DEFAULT_GRAPH_FILTER_SETTINGS,
      setGraphFilterSettings: (settings: GraphFilterSettings) =>
        set({ graphFilterSettings: settings }),
      resetGraphFilterSettings: () =>
        set({ graphFilterSettings: DEFAULT_GRAPH_FILTER_SETTINGS }),

      mapPaperIds: null,
      mapSelectionHydrated: false,
      setMapSelectionHydrated: (hydrated: boolean) =>
        set({ mapSelectionHydrated: hydrated }),
      setMapPaperIds: (paperIds: string[] | null) =>
        set({
          mapPaperIds: paperIds === null ? null : normalizeMapPaperIds(paperIds),
        }),
      addMapPaper: (paperId: string) =>
        set((state) => {
          if (!paperId) return {};
          const base = state.mapPaperIds ?? [];
          if (base.includes(paperId)) return {};
          return { mapPaperIds: [...base, paperId] };
        }),
      addMapPapers: (paperIds: string[]) =>
        set((state) => {
          const incoming = normalizeMapPaperIds(paperIds);
          if (!incoming.length) return {};
          const next = normalizeMapPaperIds([...(state.mapPaperIds ?? []), ...incoming]);
          if (
            state.mapPaperIds &&
            next.length === state.mapPaperIds.length &&
            next.every((id, index) => id === state.mapPaperIds?.[index])
          ) {
            return {};
          }
          return { mapPaperIds: next };
        }),
      removeMapPaper: (paperId: string) =>
        set((state) => {
          if (!paperId || state.mapPaperIds === null) return {};
          const next = state.mapPaperIds.filter((id) => id !== paperId);
          if (next.length === state.mapPaperIds.length) return {};
          return { mapPaperIds: next };
        }),
      toggleMapPaper: (paperId: string) =>
        set((state) => {
          if (!paperId) return {};
          const base = state.mapPaperIds ?? [];
          if (base.includes(paperId)) {
            return { mapPaperIds: base.filter((id) => id !== paperId) };
          }
          return { mapPaperIds: [...base, paperId] };
        }),

      isReviewQueueOpen: false,
      toggleReviewQueue: () => set((state) => ({ isReviewQueueOpen: !state.isReviewQueueOpen })),
    }),
    {
      name: 'research-map-state-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state): PersistedAppState => ({
        mapPaperIds: state.mapPaperIds,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Failed to hydrate app store:', error);
        }
        state?.setMapSelectionHydrated(true);
      },
    }
  )
);
