import { useEffect, useState } from 'react'

export function useLocalStorageState<T>(key: string, initialValue: T | (() => T)) {
  const [state, setState] = useState<T>(() => {
    try {
      const stored = window.localStorage.getItem(key)
      if (stored !== null) return JSON.parse(stored) as T
    } catch {
      // ignore corrupt/inaccessible storage and fall back to initialValue
    }
    return initialValue instanceof Function ? initialValue() : initialValue
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state))
    } catch {
      // storage may be full or unavailable (e.g. private browsing) — fail silently
    }
  }, [key, state])

  return [state, setState] as const
}
