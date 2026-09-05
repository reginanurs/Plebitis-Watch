import { Info } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { getCategoryIcon } from '../data/educationCategories'
import educationDataRaw from '../data/education.json'
import type { EducationItem } from '../types/education'
import { formatDateID } from '../utils/patient'

const educationData = educationDataRaw as EducationItem[]

function EdukasiDetailPage() {
  const { id } = useParams<{ id: string }>()
  const item = educationData.find((candidate) => candidate.id === id)

  if (!item) {
    return (
      <div>
        <PageHeader title="Materi Tidak Ditemukan" description="Materi edukasi yang dicari tidak tersedia." />
        <Link
          to="/edukasi"
          className="inline-flex items-center gap-2 rounded-lg border border-teal-700 px-4 py-2 text-sm font-medium text-teal-800 hover:bg-teal-50"
        >
          Kembali ke Edukasi
        </Link>
      </div>
    )
  }

  const Icon = getCategoryIcon(item.category)

  return (
    <div>
      <PageHeader title={item.title} description={item.summary} />

      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
          <Icon size={20} />
        </span>
        <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-teal-700">
          {item.category}
        </span>
        {item.lastUpdated && (
          <span className="text-xs text-gray-400">Diperbarui {formatDateID(item.lastUpdated)}</span>
        )}
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        {item.sections.map((section, index) => (
          <div key={section.heading} className={index > 0 ? 'mt-6 border-t border-gray-100 pt-6' : ''}>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">{section.heading}</h2>
            {section.paragraphs?.map((paragraph) => (
              <p key={paragraph} className="mb-2 max-w-3xl leading-relaxed text-gray-700">
                {paragraph}
              </p>
            ))}
            {section.bullets && (
              <ul className="mt-2 list-disc space-y-1 pl-5 text-gray-700">
                {section.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      {item.relatedLinks && item.relatedLinks.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-3">
          {item.relatedLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="rounded-lg bg-teal-800 px-4 py-2 text-sm font-medium text-white hover:bg-teal-900"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}

      <div className="mt-6 flex items-start gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
        <Info size={18} className="mt-0.5 shrink-0" />
        <p>
          Materi dalam prototype ini bersifat informasi pendukung. Penggunaan klinis tetap mengikuti
          SOP, kebijakan, dan prosedur fasilitas pelayanan kesehatan yang berlaku.
        </p>
      </div>

      <Link
        to="/edukasi"
        className="mt-6 inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
      >
        Kembali ke Edukasi
      </Link>
    </div>
  )
}

export default EdukasiDetailPage
