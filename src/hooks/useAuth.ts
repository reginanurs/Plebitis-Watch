import { useCallback } from 'react'
import usersSeed from '../data/users.json'
import type { AuthSession } from '../types/auth'
import type { User } from '../types/user'
import { useLocalStorageState } from './useLocalStorageState'

const STORAGE_KEY = 'plebitis-watch.auth'
const users = usersSeed as User[]

/**
 * Front-end login simulation only — checks the submitted credentials
 * against the local demo user list and stores a minimal session flag
 * in localStorage. There is no backend, token, or password hashing
 * involved; this only gates which routes the prototype UI shows.
 */
export function useAuth() {
  const [session, setSession] = useLocalStorageState<AuthSession | null>(STORAGE_KEY, null)

  const currentUser: User | undefined = session
    ? users.find((candidate) => candidate.id === session.userId)
    : undefined

  const login = useCallback(
    (username: string, password: string): boolean => {
      const matchedUser = users.find(
        (candidate) => candidate.username === username.trim() && candidate.password === password,
      )
      if (!matchedUser) return false

      setSession({ isAuthenticated: true, userId: matchedUser.id, loginAt: new Date().toISOString() })
      return true
    },
    [setSession],
  )

  const logout = useCallback(() => {
    setSession(null)
  }, [setSession])

  return {
    isAuthenticated: Boolean(session?.isAuthenticated && currentUser),
    currentUser,
    login,
    logout,
  }
}
