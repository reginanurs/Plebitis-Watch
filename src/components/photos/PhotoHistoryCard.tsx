import type { PhotoRecord } from '../../types/photo'
import { formatDateID } from '../../utils/patient'

interface PhotoHistoryCardProps {
  photo: PhotoRecord
  isLatest: boolean
  onViewDetail: () => void
}

function PhotoHistoryCard({ photo, isLatest, onViewDetail }: PhotoHistoryCardProps) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="relative">
        <img src={photo.imageData} alt="Dokumentasi area insersi" className="h-36 w-full object-cover" />
        {isLatest && (
          <span className="absolute left-2 top-2 rounded-full bg-teal-800 px-2 py-0.5 text-xs font-semibold text-white">
            TERBARU
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="text-sm font-medium text-gray-800">
          {formatDateID(photo.date)} <span className="text-gray-400">{photo.time}</span>
        </p>
        <p className="text-xs text-gray-500">
          VIP Score:{' '}
          {photo.vipScore !== null ? `${photo.vipScore} (${photo.vipCategory ?? '-'})` : 'Belum tersedia'}
        </p>
        {photo.note && <p className="line-clamp-2 text-xs text-gray-500">{photo.note}</p>}
        <button
          type="button"
          onClick={onViewDetail}
          className="mt-auto self-start rounded-lg border border-teal-700 px-3 py-1.5 text-xs font-medium text-teal-800 hover:bg-teal-50"
        >
          Lihat Detail
        </button>
      </div>
    </div>
  )
}

export default PhotoHistoryCard
