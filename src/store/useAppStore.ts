import { create } from 'zustand';

interface AppState {
  // 논문 상세 모달
  selectedPaperId: string | null;
  isDetailModalOpen: boolean;
  openPaperDetail: (paperId: string) => void;
  closePaperDetail: () => void;

  // 사이드바
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // 논문 상세 모달
  selectedPaperId: null,
  isDetailModalOpen: false,
  openPaperDetail: (paperId: string) =>
    set({ selectedPaperId: paperId, isDetailModalOpen: true }),
  closePaperDetail: () =>
    set({ selectedPaperId: null, isDetailModalOpen: false }),

  // 사이드바
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
}));
