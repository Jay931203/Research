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
  'inspires',
  'challenges',
  'compares_with',
  'applies',
  'related',
];

export const DEFAULT_GRAPH_FILTER_SETTINGS: GraphFilterSettings = {
  minStrength: 4,
  enabledRelationshipTypes: CORE_RELATIONSHIP_TYPES,
  useFamiliarityOpacity: false,
};

type MapSelection = string[] | null;

interface SetMapPaperIdsOptions {
  recordHistory?: boolean;
}

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
  mapServerHydrated: boolean;
  mapHistoryPast: MapSelection[];
  mapHistoryFuture: MapSelection[];
  canUndoMapSelection: boolean;
  canRedoMapSelection: boolean;
  setMapSelectionHydrated: (hydrated: boolean) => void;
  setMapServerHydrated: (hydrated: boolean) => void;
  setMapPaperIds: (paperIds: string[] | null, options?: SetMapPaperIdsOptions) => void;
  addMapPaper: (paperId: string) => void;
  addMapPapers: (paperIds: string[]) => void;
  removeMapPaper: (paperId: string) => void;
  toggleMapPaper: (paperId: string) => void;
  undoMapSelection: () => void;
  redoMapSelection: () => void;

  isReviewQueueOpen: boolean;
  toggleReviewQueue: () => void;
}

interface PersistedAppState {
  mapPaperIds: string[] | null;
  mapHistoryPast: MapSelection[];
  mapHistoryFuture: MapSelection[];
  canUndoMapSelection: boolean;
  canRedoMapSelection: boolean;
}

function normalizeMapPaperIds(paperIds: string[]): string[] {
  return Array.from(new Set(paperIds.filter((paperId) => !!paperId))).sort();
}

function normalizeMapSelection(selection: MapSelection): MapSelection {
  if (selection === null) return null;
  return normalizeMapPaperIds(selection);
}

function cloneMapSelection(selection: MapSelection): MapSelection {
  if (selection === null) return null;
  return [...selection];
}

function isSameMapSelection(left: MapSelection, right: MapSelection): boolean {
  if (left === null || right === null) {
    return left === right;
  }
  if (left.length !== right.length) return false;
  return left.every((paperId, index) => paperId === right[index]);
}

const MAP_HISTORY_LIMIT = 100;

function pushMapHistory(past: MapSelection[], current: MapSelection): MapSelection[] {
  const nextPast = [...past, cloneMapSelection(current)];
  if (nextPast.length <= MAP_HISTORY_LIMIT) return nextPast;
  return nextPast.slice(nextPast.length - MAP_HISTORY_LIMIT);
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
      mapServerHydrated: false,
      mapHistoryPast: [],
      mapHistoryFuture: [],
      canUndoMapSelection: false,
      canRedoMapSelection: false,
      setMapSelectionHydrated: (hydrated: boolean) =>
        set({ mapSelectionHydrated: hydrated }),
      setMapServerHydrated: (hydrated: boolean) =>
        set({ mapServerHydrated: hydrated }),
      setMapPaperIds: (paperIds: string[] | null, options?: SetMapPaperIdsOptions) =>
        set((state) => {
          const current = normalizeMapSelection(state.mapPaperIds);
          const next = normalizeMapSelection(paperIds);
          if (isSameMapSelection(current, next)) return {};

          const shouldRecordHistory = options?.recordHistory ?? true;
          if (!shouldRecordHistory) {
            return { mapPaperIds: cloneMapSelection(next) };
          }

          const nextPast = pushMapHistory(state.mapHistoryPast, current);
          return {
            mapPaperIds: cloneMapSelection(next),
            mapHistoryPast: nextPast,
            mapHistoryFuture: [],
            canUndoMapSelection: nextPast.length > 0,
            canRedoMapSelection: false,
          };
        }),
      addMapPaper: (paperId: string) =>
        set((state) => {
          if (!paperId) return {};
          const base = state.mapPaperIds ?? [];
          if (base.includes(paperId)) return {};
          const next = normalizeMapPaperIds([...base, paperId]);
          const nextPast = pushMapHistory(state.mapHistoryPast, state.mapPaperIds);
          return {
            mapPaperIds: next,
            mapHistoryPast: nextPast,
            mapHistoryFuture: [],
            canUndoMapSelection: nextPast.length > 0,
            canRedoMapSelection: false,
          };
        }),
      addMapPapers: (paperIds: string[]) =>
        set((state) => {
          const incoming = normalizeMapPaperIds(paperIds);
          if (!incoming.length) return {};
          const next = normalizeMapPaperIds([...(state.mapPaperIds ?? []), ...incoming]);
          if (state.mapPaperIds && isSameMapSelection(state.mapPaperIds, next)) {
            return {};
          }
          const nextPast = pushMapHistory(state.mapHistoryPast, state.mapPaperIds);
          return {
            mapPaperIds: next,
            mapHistoryPast: nextPast,
            mapHistoryFuture: [],
            canUndoMapSelection: nextPast.length > 0,
            canRedoMapSelection: false,
          };
        }),
      removeMapPaper: (paperId: string) =>
        set((state) => {
          if (!paperId || state.mapPaperIds === null) return {};
          const next = state.mapPaperIds.filter((id) => id !== paperId);
          if (next.length === state.mapPaperIds.length) return {};
          const nextPast = pushMapHistory(state.mapHistoryPast, state.mapPaperIds);
          return {
            mapPaperIds: next,
            mapHistoryPast: nextPast,
            mapHistoryFuture: [],
            canUndoMapSelection: nextPast.length > 0,
            canRedoMapSelection: false,
          };
        }),
      toggleMapPaper: (paperId: string) =>
        set((state) => {
          if (!paperId) return {};
          const base = state.mapPaperIds ?? [];
          const nextPast = pushMapHistory(state.mapHistoryPast, state.mapPaperIds);
          if (base.includes(paperId)) {
            return {
              mapPaperIds: base.filter((id) => id !== paperId),
              mapHistoryPast: nextPast,
              mapHistoryFuture: [],
              canUndoMapSelection: nextPast.length > 0,
              canRedoMapSelection: false,
            };
          }
          return {
            mapPaperIds: normalizeMapPaperIds([...base, paperId]),
            mapHistoryPast: nextPast,
            mapHistoryFuture: [],
            canUndoMapSelection: nextPast.length > 0,
            canRedoMapSelection: false,
          };
        }),
      undoMapSelection: () =>
        set((state) => {
          if (!state.mapHistoryPast.length) return {};

          const previous = state.mapHistoryPast[state.mapHistoryPast.length - 1];
          const nextPast = state.mapHistoryPast.slice(0, -1);
          const nextFuture = [cloneMapSelection(state.mapPaperIds), ...state.mapHistoryFuture];

          return {
            mapPaperIds: cloneMapSelection(previous),
            mapHistoryPast: nextPast,
            mapHistoryFuture: nextFuture,
            canUndoMapSelection: nextPast.length > 0,
            canRedoMapSelection: nextFuture.length > 0,
          };
        }),
      redoMapSelection: () =>
        set((state) => {
          if (!state.mapHistoryFuture.length) return {};

          const [nextSelection, ...remainingFuture] = state.mapHistoryFuture;
          const nextPast = pushMapHistory(state.mapHistoryPast, state.mapPaperIds);

          return {
            mapPaperIds: cloneMapSelection(nextSelection),
            mapHistoryPast: nextPast,
            mapHistoryFuture: remainingFuture,
            canUndoMapSelection: nextPast.length > 0,
            canRedoMapSelection: remainingFuture.length > 0,
          };
        }),

      isReviewQueueOpen: false,
      toggleReviewQueue: () => set((state) => ({ isReviewQueueOpen: !state.isReviewQueueOpen })),
    }),
    {
      name: 'research-map-state-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state): PersistedAppState => ({
        mapPaperIds: state.mapPaperIds,
        mapHistoryPast: state.mapHistoryPast,
        mapHistoryFuture: state.mapHistoryFuture,
        canUndoMapSelection: state.canUndoMapSelection,
        canRedoMapSelection: state.canRedoMapSelection,
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
