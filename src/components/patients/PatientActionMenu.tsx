import { Eye, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useMountTransition } from '../../hooks/useMountTransition'

interface PatientActionMenuProps {
  onViewDetail: () => void
  onEdit: () => void
  onDelete: () => void
}

const TRANSITION_MS = 150

function PatientActionMenu({ onViewDetail, onEdit, onDelete }: PatientActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const shouldRender = useMountTransition(isOpen, TRANSITION_MS)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  function runAction(action: () => void) {
    setIsOpen(false)
    action()
  }

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Aksi pasien"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 active:scale-[0.97]"
      >
        <MoreVertical size={18} />
      </button>

      {shouldRender && (
        <div
          role="menu"
          className={`absolute right-0 z-10 mt-2 w-44 origin-top-right overflow-hidden rounded-lg border border-gray-100 bg-white py-1 shadow-lg transition duration-150 ease-out ${
            isOpen ? 'translate-y-0 scale-100 opacity-100' : '-translate-y-1 scale-[0.98] opacity-0'
          }`}
        >
          <button
            role="menuitem"
            type="button"
            onClick={() => runAction(onViewDetail)}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <Eye size={16} /> Lihat Detail
          </button>
          <button
            role="menuitem"
            type="button"
            onClick={() => runAction(onEdit)}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <Pencil size={16} /> Edit
          </button>
          <button
            role="menuitem"
            type="button"
            onClick={() => runAction(onDelete)}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            <Trash2 size={16} /> Hapus
          </button>
        </div>
      )}
    </div>
  )
}

export default PatientActionMenu
