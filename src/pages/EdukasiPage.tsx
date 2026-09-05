import { BookOpen, Info, SearchX } from 'lucide-react'
import { useMemo, useState } from 'react'
import EducationCard from '../components/education/EducationCard'
import PageHeader from '../components/PageHeader'
import PatientSearchInput from '../components/patients/PatientSearchInput'
import educationDataRaw from '../data/education.json'
import type { EducationItem } from '../types/education'

const educationData = educationDataRaw as EducationItem[]

function EdukasiPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  const categories = useMemo(() => [...new Set(educationData.map((item) => item.category))], [])

  const filteredItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return educationData.filter((item) => {
      const matchesSearch =
        !term || [item.title, item.summary, item.category].join(' ').toLowerCase().includes(term)
      const matchesCategory = !categoryFilter || item.category === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [searchTerm, categoryFilter])

  const hasActiveFilters = Boolean(searchTerm || categoryFilter)

  return (
    <div>
      <PageHeader
        title="Edukasi"
        description="Informasi dan panduan penggunaan PLEBITIS WATCH"
        showBackButton={false}
      />

      <div className="mb-6 flex items-start gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
        <Info size={18} className="mt-0.5 shrink-0" />
        <p>
          Materi dalam prototype ini bersifat informasi pendukung. Penggunaan klinis tetap mengikuti
          SOP, kebijakan, dan prosedur fasilitas pelayanan kesehatan yang berlaku.
        </p>
      </div>

      {educationData.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center text-gray-500">
          <BookOpen size={32} className="text-gray-300" />
          <p className="font-medium text-gray-600">Belum ada materi edukasi</p>
          <p className="text-sm text-gray-400">Materi edukasi belum tersedia.</p>
        </div>
      ) : (
        <>
          <h2 className="mb-3 text-lg font-semibold text-gray-900">Materi Edukasi</h2>

          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <PatientSearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Cari materi edukasi..."
              ariaLabel="Cari materi edukasi"
            />

            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700 sm:w-56"
            >
              <option value="">Semua</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-gray-200 bg-white py-12 text-center text-gray-500">
              <SearchX size={28} className="text-gray-300" />
              {hasActiveFilters ? (
                <>
                  <p className="font-medium text-gray-600">Materi tidak ditemukan</p>
                  <p className="text-sm text-gray-400">Silakan coba kata kunci lain.</p>
                </>
              ) : (
                <p>Belum ada materi yang cocok.</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredItems.map((item) => (
                <EducationCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default EdukasiPage
