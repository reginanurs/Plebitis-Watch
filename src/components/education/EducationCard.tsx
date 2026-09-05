import { useNavigate } from 'react-router-dom'
import { getCategoryIcon } from '../../data/educationCategories'
import type { EducationItem } from '../../types/education'

interface EducationCardProps {
  item: EducationItem
}

function EducationCard({ item }: EducationCardProps) {
  const navigate = useNavigate()
  const Icon = getCategoryIcon(item.category)

  return (
    <div className="flex h-full flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
        <Icon size={22} />
      </span>
      <span className="mb-1 text-xs font-semibold uppercase tracking-wide text-teal-700">{item.category}</span>
      <h3 className="mb-2 text-base font-semibold text-gray-900">{item.title}</h3>
      <p className="mb-4 flex-1 text-sm text-gray-500">{item.summary}</p>
      <button
        type="button"
        onClick={() => navigate(`/edukasi/${item.id}`)}
        className="self-start rounded-lg border border-teal-700 px-4 py-2 text-sm font-medium text-teal-800 hover:bg-teal-50"
      >
        Baca Materi
      </button>
    </div>
  )
}

export default EducationCard
