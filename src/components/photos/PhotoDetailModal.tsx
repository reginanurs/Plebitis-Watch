import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useMountTransition } from '../../hooks/useMountTransition'
import type { Patient } from '../../types/patient'
import type { PhotoRecord } from '../../types/photo'
import { formatDateID } from '../../utils/patient'

interface PhotoDetailModalProps {
  photo: PhotoRecord | null
  patient: Patient
  onClose: () => void
}

const TRANSITION_MS = 180

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-gray-400">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-gray-800">{value}</dd>
    </div>
  )
}

function PhotoDetailModal({ photo, patient, onClose }: PhotoDetailModalProps) {
  const isOpen = photo !== null
  const shouldRender = useMountTransition(isOpen, TRANSITION_MS)

  // Keep showing the last non-null photo while the exit animation plays,
  // since `photo` itself flips to null the instant the modal starts
  // closing. Adjusting state during render like this (rather than in an
  // effect) is the React-recommended way to derive state from a prop.
  const [displayedPhoto, setDisplayedPhoto] = useState(photo)
  if (photo && photo !== displayedPhoto) {
    setDisplayedPhoto(photo)
  }

  useEffect(() => {
    if (!isOpen) return
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!shouldRender || !displayedPhoto) return null

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className={`fixed inset-0 bg-black/50 transition-opacity duration-[180ms] ease-out ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-y-auto rounded-2xl bg-white shadow-xl transition-all duration-[180ms] ease-out ${
          isOpen ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-1 scale-[0.98] opacity-0'
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-100 p-4">
          <h2 className="text-lg font-semibold text-gray-900">Detail Dokumentasi Foto</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 active:scale-[0.97]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4">
          <img
            src={displayedPhoto.imageData}
            alt="Foto area insersi"
            className="max-h-96 w-full rounded-xl bg-gray-50 object-contain"
          />

          <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DetailRow label="Pasien" value={patient.name} />
            <DetailRow label="Lokasi PIVC" value={displayedPhoto.insertionSite} />
            <DetailRow label="Tanggal" value={formatDateID(displayedPhoto.date)} />
            <DetailRow label="Waktu" value={displayedPhoto.time} />
            <DetailRow
              label="VIP Score"
              value={
                displayedPhoto.vipScore !== null
                  ? `${displayedPhoto.vipScore} (${displayedPhoto.vipCategory ?? '-'})`
                  : 'Belum tersedia'
              }
            />
            <DetailRow label="Didokumentasikan Oleh" value={displayedPhoto.createdBy} />
            <div className="sm:col-span-2">
              <DetailRow label="Catatan" value={displayedPhoto.note || '-'} />
            </div>
          </dl>

          <div className="mt-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
            Foto berfungsi sebagai dokumentasi visual dan data pendukung pemantauan, bukan sebagai alat
            diagnosis otomatis.
          </div>
        </div>
      </div>
    </div>
  )
}

export default PhotoDetailModal
