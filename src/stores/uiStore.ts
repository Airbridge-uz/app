'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ActivePanel = 'chat' | 'saved-trips' | 'flights';
export type RightPanelContent = 'flight-search' | 'flight-results' | 'saved-trips' | null;

interface UIState {
    // Left sidebar panel selection
    activePanel: ActivePanel;
    setActivePanel: (panel: ActivePanel) => void;

    // Right panel content
    rightPanelContent: RightPanelContent;
    setRightPanelContent: (content: RightPanelContent) => void;

    // Sidebar collapsed state (persisted)
    isSidebarCollapsed: boolean;
    toggleSidebar: () => void;
    setSidebarCollapsed: (collapsed: boolean) => void;

    // Chat history sidebar (legacy - now integrated)
    historySidebarOpen: boolean;
    toggleHistorySidebar: () => void;
    setHistorySidebarOpen: (open: boolean) => void;

    // Travel date picker modal
    isDatePickerOpen: boolean;
    openDatePicker: () => void;
    closeDatePicker: () => void;
}

export const useUIStore = create<UIState>()(
    persist(
        (set) => ({
            // Default to chat panel
            activePanel: 'chat',
            setActivePanel: (panel) => set({
                activePanel: panel,
                // When switching panels, update right panel content accordingly
                rightPanelContent: panel === 'flights' ? 'flight-search' :
                    panel === 'saved-trips' ? 'saved-trips' : null
            }),

            // Right panel starts empty (shows itinerary when available)
            rightPanelContent: null,
            setRightPanelContent: (content) => set({ rightPanelContent: content }),

            // Sidebar collapsed state (default: expanded)
            isSidebarCollapsed: false,
            toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
            setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),

            // Chat history sidebar (legacy)
            historySidebarOpen: false,
            toggleHistorySidebar: () => set((state) => ({ historySidebarOpen: !state.historySidebarOpen })),
            setHistorySidebarOpen: (open) => set({ historySidebarOpen: open }),

            // Travel date picker modal
            isDatePickerOpen: false,
            openDatePicker: () => set({ isDatePickerOpen: true }),
            closeDatePicker: () => set({ isDatePickerOpen: false }),
        }),
        {
            name: 'skysearch-ui-preferences',
            partialize: (state) => ({ isSidebarCollapsed: state.isSidebarCollapsed }),
        }
    )
);
