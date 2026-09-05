import { AlertTriangle, ArrowLeft, ClipboardList } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from 'recharts'
import MonitoringHistoryTable, { type MonitoringHistoryRow } from '../components/history/MonitoringHistoryTable'
import PageHeader from '../components/PageHeader'
import PatientContextCard from '../components/PatientContextCard'
import PatientPicker from '../components/patients/PatientPicker'
import PatientSearchInput from '../components/patients/PatientSearchInput'
import PivcContextSummary from '../components/pivc/PivcContextSummary'
import { useAssessments } from '../hooks/useAssessments'
import { usePatients } from '../hooks/usePatients'
import { usePhotos } from '../hooks/usePhotos'
import { usePivcs } from '../hooks/usePivcs'
import type { Patient } from '../types/patient'
import type { Pivc } from '../types/pivc'
import { isWithinPeriod, type PeriodFilter } from '../utils/datetime'
import { formatDateID } from '../utils/patient'

const PERIOD_OPTIONS: { value: PeriodFilter; label: string }[] = [
  { value: 'all', label: 'Semua' },
  { value: '7d', label: '7 Hari' },
  { value: '30d', label: '30 Hari' },
  { value: '90d', label: '90 Hari' },
]

const LINE_COLORS = ['#0f766e', '#b45309', '#7c3aed', '#be123c', '#1d4ed8']

function resolvePivcLabel(pivc: Pivc | undefined): string {
  if (!pivc) return 'Data PIVC tidak ditemukan'
  return `${pivc.insertionSite} / ${pivc.extremitySide}${pivc.status === 'removed' ? ' (Dilepas)' : ''}`
}

interface ChartPoint {
  label: string
  fullLabel: string
  timestamp: number
  category: string | null
  pivcLabel: string
  [scoreKey: string]: string | number | null
}

function ChartTooltip({ active, payload }: TooltipContentProps) {
  if (!active || !payload || payload.length === 0) return null
  const point = payload[0].payload as ChartPoint
  return (
    <div className="rounded-lg border border-gray-100 bg-white p-3 text-xs shadow-lg">
      <p className="mb-1 font-medium text-gray-800">{point.fullLabel}</p>
      <p className="text-gray-500">PIVC: {point.pivcLabel}</p>
      <p className="text-gray-500">VIP Score: {payload[0].value}</p>
      {point.category && <p className="text-gray-500">Kategori: {point.category}</p>}
    </div>
  )
}

function GrafikPage() {
  const { assessments } = useAssessments()
  const { patients } = usePatients()
  const { getActivePivcByPatientId, getPivcsByPatientId, getPivcById } = usePivcs()
  const { getPhotosByAssessmentId } = usePhotos()
  const navigate = useNavigate()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [pivcFilter, setPivcFilter] = useState('')
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all')

  // All hooks are called unconditionally on every render (Rules of Hooks) —
  // the `selectedPatient` branch only affects what JSX is returned below,
  // never whether a hook runs. Each memo falls back to an empty result
  // when no patient is selected yet.

  const filteredPatients = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return patients
    return patients.filter((patient) =>
      [patient.name, patient.medicalRecordNumber, patient.room, patient.bed].join(' ').toLowerCase().includes(term),
    )
  }, [patients, searchTerm])

  const patientPivcs = useMemo(
    () => (selectedPatient ? getPivcsByPatientId(selectedPatient.id) : []),
    [selectedPatient, getPivcsByPatientId],
  )

  const selectedPivc = pivcFilter ? getPivcById(pivcFilter) : undefined

  const patientAssessments = useMemo(
    () => (selectedPatient ? assessments.filter((assessment) => assessment.patientId === selectedPatient.id) : []),
    [assessments, selectedPatient],
  )

  const withTimestamp = useMemo(
    () =>
      patientAssessments.map((assessment) => ({
        assessment,
        timestamp: new Date(`${assessment.date}T${assessment.time}`).getTime(),
      })),
    [patientAssessments],
  )

  const filtered = useMemo(() => {
    const now = new Date()
    return withTimestamp.filter(
      ({ assessment, timestamp }) =>
        (!pivcFilter || assessment.pivcId === pivcFilter) && isWithinPeriod(timestamp, periodFilter, now),
    )
  }, [withTimestamp, pivcFilter, periodFilter])

  const sortedOldestFirst = useMemo(() => [...filtered].sort((a, b) => a.timestamp - b.timestamp), [filtered])
  const sortedNewestFirst = useMemo(() => [...filtered].sort((a, b) => b.timestamp - a.timestamp), [filtered])

  const chartable = useMemo(
    () => sortedOldestFirst.filter(({ assessment }) => assessment.totalScore !== null),
    [sortedOldestFirst],
  )

  const distinctPivcIds = useMemo(
    () => [...new Set(chartable.map(({ assessment }) => assessment.pivcId))],
    [chartable],
  )

  const chartData: ChartPoint[] = useMemo(
    () =>
      chartable.map(({ assessment, timestamp }) => ({
        label: `${formatDateID(assessment.date).slice(0, 5)} ${assessment.time}`,
        fullLabel: `${formatDateID(assessment.date)} ${assessment.time}`,
        timestamp,
        category: assessment.category,
        pivcLabel: resolvePivcLabel(getPivcById(assessment.pivcId)),
        [`score__${assessment.pivcId}`]: assessment.totalScore,
      })),
    [chartable, getPivcById],
  )

  const monitoringCountByPivcId = useMemo(() => {
    const counts = new Map<string, number>()
    for (const { assessment } of filtered) {
      counts.set(assessment.pivcId, (counts.get(assessment.pivcId) ?? 0) + 1)
    }
    return counts
  }, [filtered])

  const timelineRows: MonitoringHistoryRow[] = useMemo(
    () =>
      sortedNewestFirst.map(({ assessment, timestamp }) => ({
        assessment,
        patient: selectedPatient ?? undefined,
        pivc: getPivcById(assessment.pivcId),
        photo: getPhotosByAssessmentId(assessment.id)[0],
        timestamp,
      })),
    [sortedNewestFirst, selectedPatient, getPivcById, getPhotosByAssessmentId],
  )

  const latestAssessment = sortedNewestFirst[0]?.assessment
  const latestNonNullScoreAssessment = sortedNewestFirst.find(({ assessment }) => assessment.totalScore !== null)?.assessment

  function handleBackToPicker() {
    setSelectedPatient(null)
    setPivcFilter('')
    setPeriodFilter('all')
  }

  if (!selectedPatient) {
    return (
      <div>
        <PageHeader
          title="Grafik Monitoring"
          description="Perkembangan hasil pemantauan pasien dan PIVC"
          showBackButton={false}
        />
        <p className="mb-4 text-sm font-medium text-gray-600">Silakan pilih pasien</p>
        <div className="mb-4">
          <PatientSearchInput value={searchTerm} onChange={setSearchTerm} />
        </div>
        <PatientPicker
          patients={filteredPatients}
          searchTerm={searchTerm}
          getActivePivcByPatientId={getActivePivcByPatientId}
          onSelect={setSelectedPatient}
        />
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Grafik Monitoring"
        description="Perkembangan hasil pemantauan pasien dan PIVC"
        showBackButton={false}
      />

      <button
        type="button"
        onClick={handleBackToPicker}
        className="mb-3 flex items-center gap-2 text-sm font-medium text-teal-800 hover:underline"
      >
        <ArrowLeft size={16} />
        Pilih pasien lain
      </button>

      <div className="mb-6">
        <PatientContextCard patient={selectedPatient} onViewDetail={() => navigate(`/pasien/${selectedPatient.id}`)} />
      </div>

      {patientAssessments.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center text-gray-500">
          <ClipboardList size={32} className="text-gray-300" />
          <p className="font-medium text-gray-600">Belum ada data monitoring</p>
          <p className="max-w-sm text-sm text-gray-400">Belum tersedia penilaian untuk pasien ini.</p>
          <Link
            to={`/penilaian/${selectedPatient.id}`}
            className="rounded-lg bg-teal-800 px-4 py-2 text-sm font-medium text-white hover:bg-teal-900"
          >
            Lakukan Penilaian
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <select
              value={pivcFilter}
              onChange={(event) => setPivcFilter(event.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700 sm:w-64"
            >
              <option value="">Semua PIVC</option>
              {patientPivcs.map((pivc) => (
                <option key={pivc.id} value={pivc.id}>
                  {resolvePivcLabel(pivc)}
                </option>
              ))}
            </select>

            <select
              value={periodFilter}
              onChange={(event) => setPeriodFilter(event.target.value as PeriodFilter)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700 sm:w-40"
            >
              {PERIOD_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {selectedPivc && (
            <div className="mb-6">
              <PivcContextSummary pivc={selectedPivc} title="Konteks PIVC" />
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-gray-200 bg-white py-12 text-center text-gray-500">
              <ClipboardList size={28} className="text-gray-300" />
              <p className="font-medium text-gray-600">Data monitoring tidak ditemukan</p>
              <p className="text-sm text-gray-400">Coba ubah periode atau PIVC yang dipilih.</p>
            </div>
          ) : (
            <>
              <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <div className="rounded-2xl border border-gray-100 bg-white p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-400">Jumlah Monitoring</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">{filtered.length}</p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-white p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-400">Assessment Terakhir</p>
                  <p className="mt-1 text-base font-semibold text-gray-800">
                    {formatDateID(latestAssessment!.date)} {latestAssessment!.time}
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-white p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-400">VIP Score Terakhir</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {latestNonNullScoreAssessment ? latestNonNullScoreAssessment.totalScore : 'Belum tersedia'}
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-white p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-400">Kategori Terakhir</p>
                  <p className="mt-1 text-base font-semibold text-gray-800">
                    {latestAssessment!.category ?? 'Belum tersedia'}
                  </p>
                </div>
              </div>

              <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">Grafik VIP Score</h2>
                {chartable.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-gray-200 py-10 text-center text-gray-500">
                    <AlertTriangle size={24} className="text-amber-400" />
                    <p className="font-medium text-gray-600">Grafik VIP Score belum tersedia</p>
                    <p className="max-w-sm text-sm text-gray-400">
                      Nilai VIP Score belum tersedia pada data penilaian saat ini.
                    </p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12 }} width={32} />
                      <Tooltip content={ChartTooltip} />
                      {distinctPivcIds.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
                      {distinctPivcIds.map((pivcId, index) => (
                        <Line
                          key={pivcId}
                          type="monotone"
                          dataKey={`score__${pivcId}`}
                          name={resolvePivcLabel(getPivcById(pivcId))}
                          stroke={LINE_COLORS[index % LINE_COLORS.length]}
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          connectNulls={false}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div>
                <h2 className="mb-3 text-lg font-semibold text-gray-900">Timeline Monitoring</h2>
                <MonitoringHistoryTable
                  rows={timelineRows}
                  hasActiveFilters={false}
                  monitoringCountByPivcId={monitoringCountByPivcId}
                  onViewDetail={(assessmentId) => navigate(`/hasil-penilaian/${assessmentId}`)}
                />
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

export default GrafikPage
