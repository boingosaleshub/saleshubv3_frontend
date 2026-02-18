import { create } from 'zustand'
import { createClient } from '@/utils/supabase/client'
import { clearIdleTimestamp } from '@/hooks/useIdleTimeout'

export const useAuthStore = create((set) => ({
  user: null,
  session: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setIsLoading: (isLoading) => set({ isLoading }),
  signOut: async () => {
    try {
      clearIdleTimestamp()
      const supabase = createClient()
      await supabase.auth.signOut()
      set({ user: null, session: null })
      window.location.href = '/login'
    } catch (error) {
      console.error('Error signing out:', error)
    }
  },
}))
