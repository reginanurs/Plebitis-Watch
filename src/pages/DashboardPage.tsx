import {
  BellRing,
  Camera,
  Camera as PhotoIcon,
  ClipboardList,
  ClipboardPlus,
  Droplet,
  FolderClock,
  Info,
  UserPlus,
  UserRound,
  Users,
} from 'lucide-react'
import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from 'recharts'
import PageHeader from '../components/PageHeader'
import PageLoadingState from '../components/PageLoadingState'
import PivcStatusBadge from '../components/pivc/PivcStatusBadge'
import ReminderStatusBadge from '../components/reminders/ReminderStatusBadge'
import vipRulesData from '../data/vipRules.json'
import { useAssessments } from '../hooks/useAssessments'
import { useAuth } from '../hooks/useAuth'
import { useNotifications } from '../hooks/useNotifications'
import { usePatients } from '../hooks/usePatients'
import { usePhotos } from '../hooks/usePhotos'
import { usePivcs } from '../hooks/usePivcs'
import { useReminders } from '../hooks/useReminders'
import type { ReminderStatus } from '../types/reminder'
import type { VipRulesConfig } from '../types/vipRules'
import { formatRelativeTimestamp } from '../utils/datetime'
import { calculateAge, formatDateID, getAvatarColorClass, getInitials } from '../utils/patient'
import { getReminderStatus, getTimeRemainingLabel } from '../utils/reminder'

const vipRules = vipRulesData as VipRulesConfig

const ATTENTION_LIMIT = 4
const RECENT_MONITORING_LIMIT = 5
const CHART_POINTS_LIMIT = 8
const RECENT_NOTIFICATION_LIMIT = 3
const RECENT_PATIENTS_LIMIT = 4

const STATUS_PRIORITY: Record<ReminderStatus, number> = { overdue: 0, due_soon: 1, today: 2, scheduled: 3 }

interface ChartPoint {
  label: string
  fullLabel: string
  patientName: string
  category: string | null
  score: number
}

function ChartTooltip({ active, payload }: TooltipContentProps) {
  if (!active || !payload || payload.length === 0) return null
  const point = payload[0].payload as ChartPoint
  return (
    <div className="rounded-lg border border-gray-100 bg-white p-3 text-xs shadow-lg">
      <p className="mb-1 font-medium text-gray-800">{point.fullLabel}</p>
      <p className="text-gray-500">Pasien: {point.patientName}</p>
      <p className="text-gray-500">VIP Score: {point.score}</p>
      {point.category && <p className="text-gray-500">Kategori: {point.category}</p>}
    </div>
  )
}

function SummaryCard({
  icon: Icon,
  iconClass,
  value,
  label,
}: {
  icon: typeof Users
  iconClass: string
  value: number
  label: string
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4">
      <div className={`mb-2 flex h-9 w-9 items-center justify-center rounded-full ${iconClass}`}>
        <Icon size={18} />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  )
}

function SectionCard({ title, cta, children }: { title: string; cta?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {cta}
      </div>
      {children}
    </div>
  )
}

function EmptySection({ text }: { text: string }) {
  return <p className="py-6 text-center text-sm text-gray-400">{text}</p>
}

function DashboardPage() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const { patients, isLoading: isPatientsLoading } = usePatients()
  const { pivcs, getPivcById, isLoading: isPivcsLoading } = usePivcs()
  const { assessments, isLoading: isAssessmentsLoading } = useAssessments()
  const { getPhotosByAssessmentId } = usePhotos()
  const { reminders, isLoading: isRemindersLoading } = useReminders()
  const { notifications, isLoading: isNotificationsLoading } = useNotifications()

  const activePivcCount = useMemo(() => pivcs.filter((pivc) => pivc.status === 'active').length, [pivcs])

  const activePivcCountByPatientId = useMemo(() => {
    const map = new Map<string, number>()
    for (const pivc of pivcs) {
      if (pivc.status === 'active') map.set(pivc.patientId, (map.get(pivc.patientId) ?? 0) + 1)
    }
    return map
  }, [pivcs])

  // "Relevant" reminders mirror ReminderPage's definition exactly: enabled,
  // with a resolvable patient, and linked to a still-active PIVC — so the
  // Dashboard count always matches what /reminder shows.
  const relevantReminderRows = useMemo(() => {
    return reminders
      .map((reminder) => {
        const patient = patients.find((item) => item.id === reminder.patientId)
        const pivc = getPivcById(reminder.pivcId)
        if (!reminder.enabled || !patient || !pivc || pivc.status !== 'active') return null
        return { reminder, patient, pivc, status: getReminderStatus(reminder.nextMonitoringAt) }
      })
      .filter((row): row is { reminder: (typeof reminders)[number]; patient: (typeof patients)[number]; pivc: NonNullable<ReturnType<typeof getPivcById>>; status: ReminderStatus } => row !== null)
  }, [reminders, patients, getPivcById])

  const attentionRows = useMemo(
    () =>
      [...relevantReminderRows]
        .sort(
          (a, b) =>
            STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status] ||
            new Date(a.reminder.nextMonitoringAt).getTime() - new Date(b.reminder.nextMonitoringAt).getTime(),
        )
        .slice(0, ATTENTION_LIMIT),
    [relevantReminderRows],
  )

  const sortedAssessments = useMemo(
    () => [...assessments].sort((a, b) => `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`)),
    [assessments],
  )

  const recentAssessments = useMemo(() => sortedAssessments.slice(0, RECENT_MONITORING_LIMIT), [sortedAssessments])

  const chartData: ChartPoint[] = useMemo(() => {
    const numeric = sortedAssessments.filter((assessment) => assessment.totalScore !== null)
    return numeric
      .slice(0, CHART_POINTS_LIMIT)
      .reverse()
      .map((assessment) => {
        const patient = patients.find((item) => item.id === assessment.patientId)
        return {
          label: `${formatDateID(assessment.date).slice(0, 5)} ${assessment.time}`,
          fullLabel: `${formatDateID(assessment.date)} ${assessment.time}`,
          patientName: patient?.name ?? 'Data pasien tidak ditemukan',
          category: assessment.category,
          score: assessment.totalScore as number,
        }
      })
  }, [sortedAssessments, patients])

  const unreadNotifications = useMemo(() => notifications.filter((item) => !item.read), [notifications])
  const latestUnread = useMemo(
    () =>
      [...unreadNotifications].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, RECENT_NOTIFICATION_LIMIT),
    [unreadNotifications],
  )

  const recentPatients = useMemo(() => patients.slice(0, RECENT_PATIENTS_LIMIT), [patients])

  if (isPatientsLoading || isPivcsLoading || isAssessmentsLoading || isRemindersLoading || isNotificationsLoading) {
    return <PageLoadingState />
  }

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description={
          currentUser ? `Selamat datang, ${currentUser.name}. Ringkasan pemantauan PIVC pasien.` : 'Ringkasan pemantauan PIVC pasien'
        }
        showBackButton={false}
      />

      {/* Summary cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard icon={Users} iconClass="bg-blue-100 text-blue-600" value={patients.length} label="Total Pasien" />
        <SummaryCard icon={Droplet} iconClass="bg-teal-100 text-teal-700" value={activePivcCount} label="PIVC Aktif" />
        <SummaryCard
          icon={ClipboardList}
          iconClass="bg-purple-100 text-purple-600"
          value={assessments.length}
          label="Monitoring"
        />
        <SummaryCard
          icon={BellRing}
          iconClass="bg-amber-100 text-amber-600"
          value={relevantReminderRows.length}
          label="Reminder Aktif"
        />
      </div>

      <div className="flex flex-col gap-6">
        {/* Perlu Perhatian */}
        <SectionCard
          title="Perlu Perhatian"
          cta={
            <Link to="/reminder" className="shrink-0 text-sm font-medium text-teal-800 hover:underline">
              Lihat Reminder
            </Link>
          }
        >
          {attentionRows.length === 0 ? (
            <EmptySection text="Tidak ada reminder saat ini" />
          ) : (
            <div className="flex flex-col gap-3">
              {attentionRows.map(({ reminder, patient, pivc, status }) => (
                <div
                  key={reminder.id}
                  className="flex flex-col gap-2 rounded-xl border border-gray-100 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${getAvatarColorClass(patient.id)}`}
                    >
                      {getInitials(patient.name, 1)}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{patient.name}</p>
                      <p className="text-xs text-gray-500">
                        {pivc.insertionSite} / {pivc.extremitySide}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-1">
                    <ReminderStatusBadge status={status} />
                    <p className="text-xs text-gray-500">
                      {formatDateID(reminder.nextMonitoringAt)}{' '}
                      {new Date(reminder.nextMonitoringAt).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      ({getTimeRemainingLabel(reminder.nextMonitoringAt)})
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Monitoring Terbaru */}
        <SectionCard
          title="Monitoring Terbaru"
          cta={
            <Link to="/riwayat" className="shrink-0 text-sm font-medium text-teal-800 hover:underline">
              Lihat Semua Riwayat
            </Link>
          }
        >
          {recentAssessments.length === 0 ? (
            <EmptySection text="Belum ada monitoring" />
          ) : (
            <div className="flex flex-col gap-3">
              {recentAssessments.map((assessment) => {
                const patient = patients.find((item) => item.id === assessment.patientId)
                const pivc = getPivcById(assessment.pivcId)
                const hasPhoto = getPhotosByAssessmentId(assessment.id).length > 0
                return (
                  <div
                    key={assessment.id}
                    className="flex flex-col gap-2 rounded-xl border border-gray-100 p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium text-gray-900">
                          {patient ? patient.name : <span className="text-red-600">Data pasien tidak ditemukan</span>}
                        </p>
                        {hasPhoto && (
                          <span className="flex items-center gap-1 text-xs text-teal-800">
                            <Camera size={14} />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {formatDateID(assessment.date)} {assessment.time} •{' '}
                        {pivc ? `${pivc.insertionSite} / ${pivc.extremitySide}` : 'Data PIVC tidak ditemukan'}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 sm:shrink-0">
                      <div className="text-right">
                        <p className="text-xs uppercase tracking-wide text-gray-400">VIP Score</p>
                        <p className="text-sm font-semibold text-gray-800">
                          {assessment.totalScore !== null ? assessment.totalScore : 'Belum tersedia'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs uppercase tracking-wide text-gray-400">Kategori</p>
                        <p className="text-sm font-medium text-gray-700">{assessment.category ?? 'Belum tersedia'}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate(`/hasil-penilaian/${assessment.id}`)}
                        className="rounded-lg border border-teal-700 px-3 py-1.5 text-xs font-medium text-teal-800 hover:bg-teal-50"
                      >
                        Lihat Detail
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </SectionCard>

        {/* VIP Score Overview */}
        <SectionCard title="VIP Score Overview">
          {chartData.length === 0 ? (
            <EmptySection text="Belum ada data VIP Score" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} domain={[0, vipRules.maxScore]} tick={{ fontSize: 11 }} width={28} />
                <Tooltip content={ChartTooltip} />
                <Line type="monotone" dataKey="score" stroke="#0f766e" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </SectionCard>

        {/* Notifikasi */}
        <SectionCard
          title="Notifikasi"
          cta={
            <Link to="/notifikasi" className="shrink-0 text-sm font-medium text-teal-800 hover:underline">
              Lihat Semua
            </Link>
          }
        >
          <p className="mb-3 text-sm text-gray-500">
            Belum dibaca: <span className="font-semibold text-gray-800">{unreadNotifications.length}</span>
          </p>
          {latestUnread.length === 0 ? (
            <EmptySection text="Tidak ada notifikasi baru" />
          ) : (
            <div className="flex flex-col gap-3">
              {latestUnread.map((notification) => (
                <div key={notification.id} className="flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50/60 p-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                    <BellRing size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900">{notification.title}</p>
                    <p className="truncate text-sm text-gray-600">{notification.message}</p>
                    <p className="mt-1 text-xs text-gray-400">{formatRelativeTimestamp(notification.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Quick Actions */}
        <SectionCard title="Aksi Cepat">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Link
              to="/pasien"
              className="flex flex-col items-center gap-2 rounded-xl border border-gray-100 p-4 text-center transition-transform hover:-translate-y-0.5 hover:border-teal-200 hover:bg-teal-50/40"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <UserPlus size={20} />
              </span>
              <span className="text-sm font-medium text-gray-700">Tambah Pasien</span>
            </Link>
            <Link
              to="/penilaian"
              className="flex flex-col items-center gap-2 rounded-xl border border-gray-100 p-4 text-center transition-transform hover:-translate-y-0.5 hover:border-teal-200 hover:bg-teal-50/40"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                <ClipboardPlus size={20} />
              </span>
              <span className="text-sm font-medium text-gray-700">Penilaian VIP Score</span>
            </Link>
            <Link
              to="/dokumentasi-foto"
              className="flex flex-col items-center gap-2 rounded-xl border border-gray-100 p-4 text-center transition-transform hover:-translate-y-0.5 hover:border-teal-200 hover:bg-teal-50/40"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                <PhotoIcon size={20} />
              </span>
              <span className="text-sm font-medium text-gray-700">Dokumentasi Foto</span>
            </Link>
            <Link
              to="/riwayat"
              className="flex flex-col items-center gap-2 rounded-xl border border-gray-100 p-4 text-center transition-transform hover:-translate-y-0.5 hover:border-teal-200 hover:bg-teal-50/40"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <FolderClock size={20} />
              </span>
              <span className="text-sm font-medium text-gray-700">Lihat Riwayat</span>
            </Link>
          </div>
        </SectionCard>

        {/* Pasien Terbaru */}
        <SectionCard
          title="Pasien Terbaru"
          cta={
            <Link to="/pasien" className="shrink-0 text-sm font-medium text-teal-800 hover:underline">
              Lihat Pasien
            </Link>
          }
        >
          {recentPatients.length === 0 ? (
            <EmptySection text="Belum ada pasien" />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {recentPatients.map((patient) => (
                <div
                  key={patient.id}
                  className="flex flex-col gap-3 rounded-xl border border-gray-100 p-3 transition-shadow hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${getAvatarColorClass(patient.id)}`}
                    >
                      {getInitials(patient.name)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">{patient.name}</p>
                      <p className="text-xs text-gray-500">
                        {patient.medicalRecordNumber} • {calculateAge(patient.dateOfBirth)} th
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      Ruang {patient.room} • Bed {patient.bed}
                    </span>
                    <span className="flex items-center gap-1">
                      {(activePivcCountByPatientId.get(patient.id) ?? 0) > 0 ? (
                        <PivcStatusBadge status="active" />
                      ) : (
                        <span className="text-gray-400">Tidak ada PIVC aktif</span>
                      )}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(`/pasien/${patient.id}`)}
                    className="flex items-center justify-center gap-2 rounded-lg border border-teal-700 px-3 py-1.5 text-xs font-medium text-teal-800 hover:bg-teal-50"
                  >
                    <UserRound size={14} />
                    Lihat Pasien
                  </button>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <div className="mt-6 flex items-start gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
        <Info size={18} className="mt-0.5 shrink-0" />
        <p>
          Dashboard menampilkan ringkasan data pemantauan. Interpretasi klinis dan tindak lanjut tetap
          mengikuti penilaian tenaga kesehatan serta SOP fasilitas yang berlaku.
        </p>
      </div>
    </div>
  )
}

export default DashboardPage
