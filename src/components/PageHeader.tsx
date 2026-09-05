import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  showBackButton?: boolean
  children?: ReactNode
}

function PageHeader({ title, description, showBackButton = true, children }: PageHeaderProps) {
  const navigate = useNavigate()

  return (
    <div className="mb-6">
      <div className="flex items-center gap-3">
        {showBackButton && (
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Kembali"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <h1 className="text-2xl font-bold text-teal-900">{title}</h1>
      </div>
      {description && <p className="mt-2 text-gray-500">{description}</p>}
      {children}
    </div>
  )
}

export default PageHeader
