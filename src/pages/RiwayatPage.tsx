import { ClipboardList, Download } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import MonitoringHistoryTable from '../components/history/MonitoringHistoryTable'
import PageHeader from '../components/PageHeader'
import PatientSearchInput from '../components/patients/PatientSearchInput'
import { useAssessments } from '../hooks/useAssessments'
import { usePatients } from '../hooks/usePatients'
import { usePhotos } from '../hooks/usePhotos'
import { usePivcs } from '../hooks/usePivcs'
import type { Patient } from '../types/patient'
import { buildCsv, downloadCsv } from '../utils/csv'
import { isWithinPeriod, type PeriodFilter } from '../utils/datetime'
import { formatDateID } from '../utils/patient'

const PENDING_CATEGORY = '__pending__'

const PERIOD_OPTIONS: { value: PeriodFilter; label: string }[] = [
  { value: 'all', label: 'Semua' },
  { value: 'today', label: 'Hari Ini' },
  { value: '7d', label: '7 Hari Terakhir' },
  { value: '30d', label: '30 Hari Terakhir' },
]

function RiwayatPage() {
  const { assessments } = useAssessments()
  const { patients } = usePatients()
  const { getPivcById } = usePivcs()
  const { getPhotosByAssessmentId } = usePhotos()
  const navigate = useNavigate()

  const [searchTerm, setSearchTerm] = useState('')
  const [patientFilter, setPatientFilter] = useState('')
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')

  const rows = useMemo(
    () =>
      assessments.map((assessment) => ({
        assessment,
        patient: patients.find((item) => item.id === assessment.patientId),
        pivc: getPivcById(assessment.pivcId),
        photo: getPhotosByAssessmentId(assessment.id)[0],
        timestamp: new Date(`${assessment.date}T${assessment.time}`).getTime(),
      })),
    [assessments, patients, getPivcById, getPhotosByAssessmentId],
  )

  const monitoringCountByPivcId = useMemo(() => {
    const counts = new Map<string, number>()
    for (const row of rows) counts.set(row.assessment.pivcId, (counts.get(row.assessment.pivcId) ?? 0) + 1)
    return counts
  }, [rows])

  const patientsWithHistory = useMemo(() => {
    const map = new Map<string, Patient>()
    for (const row of rows) if (row.patient) map.set(row.patient.id, row.patient)
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name))
  }, [rows])

  const availableCategories = useMemo(() => {
    const set = new Set<string>()
    for (const row of rows) if (row.assessment.category) set.add(row.assessment.category)
    return [...set].sort()
  }, [rows])

  const filteredRows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    const now = new Date()

    return rows.filter(({ assessment, patient, timestamp }) => {
      const matchesSearch =
        !term || (patient && [patient.name, patient.medicalRecordNumber].join(' ').toLowerCase().includes(term))
      const matchesPatient = !patientFilter || assessment.patientId === patientFilter
      const matchesPeriod = isWithinPeriod(timestamp, periodFilter, now)
      const matchesCategory =
        !categoryFilter ||
        (categoryFilter === PENDING_CATEGORY ? assessment.category === null : assessment.category === categoryFilter)

      return matchesSearch && matchesPatient && matchesPeriod && matchesCategory
    })
  }, [rows, searchTerm, patientFilter, periodFilter, categoryFilter])

  const sortedRows = useMemo(
    () =>
      [...filteredRows].sort((a, b) => (sortOrder === 'newest' ? b.timestamp - a.timestamp : a.timestamp - b.timestamp)),
    [filteredRows, sortOrder],
  )

  const hasAnyAssessments = assessments.length > 0
  const hasActiveFilters = Boolean(searchTerm || patientFilter || periodFilter !== 'all' || categoryFilter)

  function handleExportCsv() {
    const headers = [
      'Tanggal',
      'Waktu',
      'Nama Pasien',
      'No. Rekam Medis',
      'PIVC',
      'Lokasi',
      'VIP Score',
      'Kategori',
      'Dinilai Oleh',
      'Foto',
      'Catatan',
    ]

    const csvRows = sortedRows.map(({ assessment, patient, pivc, photo }) => [
      formatDateID(assessment.date),
      assessment.time,
      patient?.name ?? 'Data pasien tidak ditemukan',
      patient?.medicalRecordNumber ?? '-',
      pivc ? `${pivc.insertionSite} / ${pivc.extremitySide}` : 'Data PIVC tidak ditemukan',
      pivc?.insertionSite ?? '-',
      assessment.totalScore !== null ? String(assessment.totalScore) : 'Belum tersedia',
      assessment.category ?? 'Belum tersedia',
      assessment.assessedBy,
      photo ? 'Ada' : '-',
      assessment.notes ?? '',
    ])

    const csvContent = buildCsv(headers, csvRows)
    downloadCsv(`riwayat-monitoring-${todayForFilename()}.csv`, csvContent)
  }

  function todayForFilename() {
    return new Date().toISOString().slice(0, 10)
  }

  return (
    <div>
      <PageHeader
        title="Riwayat Monitoring"
        description="Rekam pemantauan pasien dan PIVC"
        showBackButton={false}
      >
        <p className="mt-4 text-sm text-gray-500">{assessments.length} Riwayat Monitoring</p>
      </PageHeader>

      {!hasAnyAssessments ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center text-gray-500">
          <ClipboardList size={32} className="text-gray-300" />
          <p className="font-medium text-gray-600">Belum ada riwayat monitoring</p>
          <p className="max-w-sm text-sm text-gray-400">
            Riwayat akan muncul di sini setelah dilakukan penilaian VIP Score pada pasien.
          </p>
          <Link
            to="/penilaian"
            className="rounded-lg bg-teal-800 px-4 py-2 text-sm font-medium text-white hover:bg-teal-900"
          >
            Lakukan Penilaian
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
            <PatientSearchInput value={searchTerm} onChange={setSearchTerm} />

            <select
              value={patientFilter}
              onChange={(event) => setPatientFilter(event.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700 lg:w-52"
            >
              <option value="">Semua Pasien</option>
              {patientsWithHistory.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name}
                </option>
              ))}
            </select>

            <select
              value={periodFilter}
              onChange={(event) => setPeriodFilter(event.target.value as PeriodFilter)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700 lg:w-48"
            >
              {PERIOD_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700 lg:w-48"
            >
              <option value="">Semua Hasil</option>
              <option value={PENDING_CATEGORY}>Belum Tersedia</option>
              {availableCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value as 'newest' | 'oldest')}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700 lg:w-40"
            >
              <option value="newest">Terbaru</option>
              <option value="oldest">Terlama</option>
            </select>

            <button
              type="button"
              onClick={handleExportCsv}
              disabled={sortedRows.length === 0}
              className="flex items-center justify-center gap-2 rounded-lg border border-teal-700 px-4 py-2 text-sm font-medium text-teal-800 hover:bg-teal-50 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400 disabled:hover:bg-transparent lg:ml-auto"
            >
              <Download size={16} />
              Export Riwayat
            </button>
          </div>

          {hasActiveFilters && (
            <p className="mb-4 text-xs text-gray-400">
              Export data yang sedang ditampilkan ({sortedRows.length} dari {assessments.length} total riwayat).
            </p>
          )}

          <MonitoringHistoryTable
            rows={sortedRows}
            hasActiveFilters={hasActiveFilters}
            monitoringCountByPivcId={monitoringCountByPivcId}
            onViewDetail={(assessmentId) => navigate(`/hasil-penilaian/${assessmentId}`)}
          />
        </>
      )}
    </div>
  )
}

export default RiwayatPage
