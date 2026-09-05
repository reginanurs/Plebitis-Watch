import { useEffect, useState } from 'react'

/**
 * Keeps a conditionally-rendered element mounted for `durationMs` after
 * `isOpen` flips to false, so its CSS exit transition can play instead
 * of the element disappearing instantly. Consumers toggle their own
 * open/closed class names off `isOpen`; this hook only controls mount.
 */
export function useMountTransition(isOpen: boolean, durationMs = 200): boolean {
  const [shouldRender, setShouldRender] = useState(isOpen)

  useEffect(() => {
    let timeoutId: number | undefined

    if (isOpen) {
      setShouldRender(true)
    } else {
      timeoutId = window.setTimeout(() => setShouldRender(false), durationMs)
    }

    return () => window.clearTimeout(timeoutId)
  }, [isOpen, durationMs])

  return shouldRender
}
