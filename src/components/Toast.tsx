import { CheckCircle2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface ToastProps {
  message: string
  onDismiss: () => void
  durationMs?: number
}

const EXIT_TRANSITION_MS = 180

function Toast({ message, onDismiss, durationMs = 2500 }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  const hasEnteredRef = useRef(false)

  useEffect(() => {
    const enterFrame = requestAnimationFrame(() => setIsVisible(true))
    const dismissTimer = window.setTimeout(() => setIsVisible(false), durationMs)
    return () => {
      cancelAnimationFrame(enterFrame)
      window.clearTimeout(dismissTimer)
    }
  }, [durationMs])

  useEffect(() => {
    if (isVisible) {
      hasEnteredRef.current = true
      return
    }
    // Ignore the initial pre-enter frame — only a real dismiss (after having
    // been visible) should schedule the exit-then-unmount callback.
    if (!hasEnteredRef.current) return
    const exitTimer = window.setTimeout(onDismiss, EXIT_TRANSITION_MS)
    return () => window.clearTimeout(exitTimer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible])

  return (
    <div role="status" className="fixed inset-x-0 bottom-20 z-50 flex justify-center px-4 md:bottom-6">
      <div
        className={`flex items-center gap-2 rounded-lg bg-teal-900 px-4 py-3 text-sm font-medium text-white shadow-lg transition-all duration-200 ease-out ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
        }`}
      >
        <CheckCircle2 size={18} className="text-emerald-300" />
        {message}
      </div>
    </div>
  )
}

export default Toast
