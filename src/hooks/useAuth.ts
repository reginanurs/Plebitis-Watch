import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Profile } from '../types/profile'

export function useAuth() {
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string | undefined>(undefined)
  const [currentUser, setCurrentUser] = useState<Profile | undefined>(undefined)

  const loadProfile = useCallback(async (id: string) => {
    const { data } = await supabase.from('profiles').select('id, name, role').eq('id', id).maybeSingle()
    setCurrentUser(data ?? undefined)
  }, [])

  useEffect(() => {
    let isMounted = true

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return
      setUserId(session?.user.id)
      if (session?.user.id) {
        loadProfile(session.user.id).finally(() => {
          if (isMounted) setIsLoading(false)
        })
      } else {
        setIsLoading(false)
      }
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return
      setUserId(session?.user.id)
      if (session?.user.id) {
        loadProfile(session.user.id)
      } else {
        setCurrentUser(undefined)
      }
    })

    return () => {
      isMounted = false
      subscription.subscription.unsubscribe()
    }
  }, [loadProfile])

  const login = useCallback(async (email: string, password: string): Promise<string | null> => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    return error ? error.message : null
  }, [])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  return {
    isLoading,
    isAuthenticated: Boolean(userId),
    currentUser,
    login,
    logout,
  }
}
