import { AlertTriangle } from 'lucide-react'
import { useEffect } from 'react'
import { useMountTransition } from '../hooks/useMountTransition'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  onConfirm: () => void
  onCancel: () => void
}

const TRANSITION_MS = 180

function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Konfirmasi',
  cancelLabel = 'Batal',
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const shouldRender = useMountTransition(open, TRANSITION_MS)

  useEffect(() => {
    if (!open) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onCancel])

  if (!shouldRender) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        className={`fixed inset-0 bg-black/40 transition-opacity duration-[180ms] ease-out ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onCancel}
        aria-hidden="true"
      />
      <div
        className={`relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl transition-all duration-[180ms] ease-out ${
          open ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-1 scale-[0.98] opacity-0'
        }`}
      >
        <div className="flex items-start gap-3">
          {destructive && (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
              <AlertTriangle size={20} />
            </span>
          )}
          <div>
            <h2 id="confirm-dialog-title" className="text-lg font-semibold text-gray-900">
              {title}
            </h2>
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 active:scale-[0.98]"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            autoFocus
            onClick={onConfirm}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white active:scale-[0.98] ${
              destructive ? 'bg-red-600 hover:bg-red-700' : 'bg-teal-800 hover:bg-teal-900'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
