import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Global store for tracking automation processes
 * Used to show notification indicators in the top bar and process queue
 * Persists to localStorage so state survives page navigation
 */

const PROCESS_MAX_AGE_MS = 6 * 60 * 1000 // 6 minutes – any process older than this is considered dead

function isStale(process) {
    if (!process.startedAt) return true
    return Date.now() - new Date(process.startedAt).getTime() > PROCESS_MAX_AGE_MS
}

export const useAutomationStore = create(
    persist(
        (set, get) => ({
            // Active automation processes array
            // Each process: { id, processType, userName, userId, startedAt }
            activeProcesses: [],

            // ROM Generator automation state (for backward compatibility)
            isRomAutomationRunning: false,
            romAutomationStartedAt: null,

            // Purge any processes whose startedAt is older than 6 minutes.
            // Called on store rehydration (page load) and periodically from the
            // Process Queue page so zombie entries never persist.
            purgeStaleProcesses: () => {
                const { activeProcesses } = get()
                const alive = activeProcesses.filter(p => !isStale(p))
                const hadRom = activeProcesses.some(p => p.processType === 'ROM Generator')
                const hasRom = alive.some(p => p.processType === 'ROM Generator')

                set({
                    activeProcesses: alive,
                    ...(hadRom && !hasRom ? { isRomAutomationRunning: false, romAutomationStartedAt: null } : {})
                })
            },

            // Start a ROM automation process
            startRomAutomation: (userName = 'Guest', userId = null, metadata = {}) => {
                const processId = `rom_${Date.now()}`
                const newProcess = {
                    id: processId,
                    processType: 'ROM Generator',
                    userName,
                    userId: userId || `user_${Math.random().toString(36).substr(2, 9)}`,
                    startedAt: new Date().toISOString(),
                    progress: 0,
                    currentStep: '',
                    waitingFiles: metadata.waitingFiles || []
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
            startCoverageAutomation: (userName = 'Guest', userId = null, metadata = {}) => {
                const processId = `coverage_${Date.now()}`
                const newProcess = {
                    id: processId,
                    processType: 'Coverage Plot',
                    userName,
                    userId: userId || `user_${Math.random().toString(36).substr(2, 9)}`,
                    startedAt: new Date().toISOString(),
                    progress: 0,
                    currentStep: '',
                    waitingFiles: metadata.waitingFiles || []
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

            // Update progress for a running process (called from automation providers)
            updateProcessProgress: (processType, progress, currentStep) => {
                set((state) => ({
                    activeProcesses: state.activeProcesses.map(p =>
                        p.processType === processType
                            ? { ...p, progress, currentStep }
                            : p
                    )
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
            }),
            onRehydrateStorage: () => (state) => {
                // Runs once when the store is rehydrated from localStorage.
                // Immediately purge any zombie processes left from a previous session.
                if (state) {
                    state.purgeStaleProcesses()
                }
            }
        }
    )
)
