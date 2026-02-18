'use client'

import { useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useAuthStore } from '@/store/useAuthStore'
import { useIdleTimeout } from '@/hooks/useIdleTimeout'

export const AuthProvider = ({ children }) => {
  const supabase = createClient()
  const { setUser, setSession, setIsLoading, signOut, session } = useAuthStore()

  const handleIdleTimeout = useCallback(() => {
    signOut()
  }, [signOut])

  useIdleTimeout(handleIdleTimeout, !!session)

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          setUser(session.user)
          setSession(session)
        }
      } catch (error) {
        console.error('Error checking auth session:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUser(session.user)
        setSession(session)
      } else {
        setUser(null)
        setSession(null)
      }
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [setUser, setSession, setIsLoading, supabase])

  return <>{children}</>
}
