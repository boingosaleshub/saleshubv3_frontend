import { create } from 'zustand'

/**
 * Global store for tracking automation processes
 * Used to show notification indicators in the top bar
 */
export const useAutomationStore = create((set) => ({
    // ROM Generator automation state
    isRomAutomationRunning: false,
    romAutomationStartedAt: null,
    
    // Actions
    startRomAutomation: () => set({ 
        isRomAutomationRunning: true, 
        romAutomationStartedAt: new Date().toISOString() 
    }),
    
    stopRomAutomation: () => set({ 
        isRomAutomationRunning: false, 
        romAutomationStartedAt: null 
    }),
}))
