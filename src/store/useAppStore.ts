import { create } from 'zustand';

interface AppState {
  // Sidebar UI state
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Paper IDs visible under sidebar filters. `null` means not hydrated yet.
  sidebarVisiblePaperIds: string[] | null;
  setSidebarVisiblePaperIds: (paperIds: string[] | null) => void;

  // Review queue modal state
  isReviewQueueOpen: boolean;
  toggleReviewQueue: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Sidebar UI state
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),

  // Sidebar filtered paper IDs
  sidebarVisiblePaperIds: null,
  setSidebarVisiblePaperIds: (paperIds: string[] | null) =>
    set({ sidebarVisiblePaperIds: paperIds }),

  // Review queue modal state
  isReviewQueueOpen: false,
  toggleReviewQueue: () => set((state) => ({ isReviewQueueOpen: !state.isReviewQueueOpen })),
}));
