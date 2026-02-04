import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Global store for tracking automation processes
 * Used to show notification indicators in the top bar and process queue
 * Persists to localStorage so state survives page navigation
 */
export const useAutomationStore = create(
    persist(
        (set, get) => ({
            // Active automation processes array
            // Each process: { id, processType, userName, userId, startedAt }
            activeProcesses: [],

            // ROM Generator automation state (for backward compatibility)
            isRomAutomationRunning: false,
            romAutomationStartedAt: null,

            // Start a ROM automation process
            startRomAutomation: (userName = 'Guest', userId = null) => {
                const processId = `rom_${Date.now()}`
                const newProcess = {
                    id: processId,
                    processType: 'ROM Generator',
                    userName,
                    userId: userId || `user_${Math.random().toString(36).substr(2, 9)}`,
                    startedAt: new Date().toISOString()
                }
                set((state) => ({
                    isRomAutomationRunning: true,
                    romAutomationStartedAt: newProcess.startedAt,
                    activeProcesses: [...state.activeProcesses.filter(p => p.processType !== 'ROM Generator'), newProcess]
                }))
                return processId
            },

            // Stop ROM automation process
            stopRomAutomation: () => {
                set((state) => ({
                    isRomAutomationRunning: false,
                    romAutomationStartedAt: null,
                    activeProcesses: state.activeProcesses.filter(p => p.processType !== 'ROM Generator')
                }))
            },

            // Start a Coverage Plot automation process
            startCoverageAutomation: (userName = 'Guest', userId = null) => {
                const processId = `coverage_${Date.now()}`
                const newProcess = {
                    id: processId,
                    processType: 'Coverage Plot',
                    userName,
                    userId: userId || `user_${Math.random().toString(36).substr(2, 9)}`,
                    startedAt: new Date().toISOString()
                }
                set((state) => ({
                    activeProcesses: [...state.activeProcesses.filter(p => p.processType !== 'Coverage Plot'), newProcess]
                }))
                return processId
            },

            // Stop Coverage Plot automation process
            stopCoverageAutomation: () => {
                set((state) => ({
                    activeProcesses: state.activeProcesses.filter(p => p.processType !== 'Coverage Plot')
                }))
            },

            // Get all active processes
            getActiveProcesses: () => get().activeProcesses,

            // Check if any automation is running
            hasActiveAutomation: () => get().activeProcesses.length > 0,

            // Clear all processes (for cleanup)
            clearAllProcesses: () => set({
                activeProcesses: [],
                isRomAutomationRunning: false,
                romAutomationStartedAt: null
            })
        }),
        {
            name: 'automation-processes', // localStorage key
            partialize: (state) => ({
                activeProcesses: state.activeProcesses,
                isRomAutomationRunning: state.isRomAutomationRunning,
                romAutomationStartedAt: state.romAutomationStartedAt
            })
        }
    )
)
