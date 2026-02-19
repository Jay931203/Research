import { create } from 'zustand';
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

  isReviewQueueOpen: boolean;
  toggleReviewQueue: () => void;
}

export const useAppStore = create<AppState>((set) => ({
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

  isReviewQueueOpen: false,
  toggleReviewQueue: () => set((state) => ({ isReviewQueueOpen: !state.isReviewQueueOpen })),
}));
