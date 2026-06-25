import { create } from "zustand";

export interface StreamTab {
  id: string; // The Job ID
  title: string;
  entityId?: number;
  type: "company" | "contact" | "scoring" | "global";
}

interface StreamPanelState {
  isOpen: boolean;
  isExpanded: boolean; // For full-screen view
  activeTabId: string | null;
  tabs: StreamTab[];
  unreadCounts: Record<string, number>;
  
  // Actions
  openPanel: () => void;
  closePanel: () => void;
  toggleExpanded: () => void;
  addTab: (tab: StreamTab) => void;
  removeTab: (id: string) => void;
  setActiveTab: (id: string | null) => void;
  incrementUnread: (id: string) => void;
  clearUnread: (id: string) => void;
  closeAllExcept: (id: string) => void;
}

export const useStreamPanelStore = create<StreamPanelState>()((set, _get) => ({
  isOpen: false,
  isExpanded: false,
  activeTabId: null,
  tabs: [],
  unreadCounts: {},

  openPanel: () => set({ isOpen: true }),
  
  closePanel: () => set({ isOpen: false }),
  
  toggleExpanded: () => set((state) => ({ isExpanded: !state.isExpanded })),

  addTab: (tab) =>
    set((state) => {
      const exists = state.tabs.some((t) => t.id === tab.id);
      if (exists) {
        return {
          activeTabId: tab.id,
          isOpen: true,
          unreadCounts: { ...state.unreadCounts, [tab.id]: 0 },
        };
      }

      return {
        tabs: [...state.tabs, tab],
        activeTabId: tab.id,
        isOpen: true,
        unreadCounts: { ...state.unreadCounts, [tab.id]: 0 },
      };
    }),

  removeTab: (id) =>
    set((state) => {
      const newTabs = state.tabs.filter((t) => t.id !== id);
      
      // Select another tab if we closed the active one
      let newActiveTabId = state.activeTabId;
      if (state.activeTabId === id) {
        newActiveTabId = newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null;
      }
      
      const newUnreadCounts = { ...state.unreadCounts };
      delete newUnreadCounts[id];

      return {
        tabs: newTabs,
        activeTabId: newActiveTabId,
        isOpen: newTabs.length > 0 ? state.isOpen : false,
        unreadCounts: newUnreadCounts,
      };
    }),

  setActiveTab: (id) =>
    set((state) => ({
      activeTabId: id,
      unreadCounts: id ? { ...state.unreadCounts, [id]: 0 } : state.unreadCounts,
    })),

  incrementUnread: (id) =>
    set((state) => {
      if (state.activeTabId === id && state.isOpen) {
        return state; // Don't increment if currently viewing
      }
      return {
        unreadCounts: {
          ...state.unreadCounts,
          [id]: (state.unreadCounts[id] || 0) + 1,
        },
      };
    }),

  clearUnread: (id) =>
    set((state) => ({
      unreadCounts: { ...state.unreadCounts, [id]: 0 },
    })),

  closeAllExcept: (id) =>
    set((state) => {
      const tabToKeep = state.tabs.find((t) => t.id === id);
      if (!tabToKeep) return state;

      const newUnreadCounts = { [id]: state.unreadCounts[id] || 0 };

      return {
        tabs: [tabToKeep],
        activeTabId: id,
        unreadCounts: newUnreadCounts,
      };
    }),
}));
