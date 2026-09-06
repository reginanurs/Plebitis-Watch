import { Camera, ClipboardList, LineChart } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import PatientContextCard from '../components/PatientContextCard'
import PivcStatusBadge from '../components/pivc/PivcStatusBadge'
import { useAssessments } from '../hooks/useAssessments'
import { usePatients } from '../hooks/usePatients'
import { usePhotos } from '../hooks/usePhotos'
import { usePivcs } from '../hooks/usePivcs'
import { calculateAge, formatDateID } from '../utils/patient'

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-gray-400">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-gray-800">{value}</dd>
    </div>
  )
}

function SummaryCard({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof ClipboardList
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700">
          <Icon size={16} />
        </span>
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      </div>
      {children}
    </div>
  )
}

function PatientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { patients } = usePatients()
  const { getActivePivcByPatientId } = usePivcs()
  const { getAssessmentsByPatientId } = useAssessments()
  const { getPhotosByPatientId } = usePhotos()
  const patient = patients.find((item) => item.id === id)
  const activePivc = patient ? getActivePivcByPatientId(patient.id) : undefined

  if (!patient) {
    return (
      <div>
        <PageHeader title="Pasien Tidak Ditemukan" description="Data pasien yang dicari tidak tersedia." />
        <Link
          to="/pasien"
          className="inline-flex items-center gap-2 rounded-lg border border-teal-700 px-4 py-2 text-sm font-medium text-teal-800 hover:bg-teal-50"
        >
          Kembali ke Data Pasien
        </Link>
      </div>
    )
  }

  const patientAssessments = [...getAssessmentsByPatientId(patient.id)].sort((a, b) =>
    `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`),
  )
  const latestAssessment = patientAssessments[0]
  const patientPhotos = getPhotosByPatientId(patient.id)

  return (
    <div>
      <PageHeader title="Detail Pasien" description="Informasi lengkap dan riwayat pemantauan pasien." />

      <div className="mb-6">
        <PatientContextCard patient={patient} />
      </div>

      <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Informasi Pasien</h2>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <DetailField label="No. Rekam Medis" value={patient.medicalRecordNumber} />
          <DetailField label="Jenis Kelamin" value={patient.gender} />
          <DetailField label="Tanggal Lahir" value={formatDateID(patient.dateOfBirth)} />
          <DetailField label="Usia" value={`${calculateAge(patient.dateOfBirth)} Tahun`} />
          <DetailField label="Ruangan" value={patient.room} />
          <DetailField label="Bed" value={patient.bed} />
          <DetailField label="Alamat" value={patient.address || '-'} />
          <div className="sm:col-span-2 lg:col-span-3">
            <DetailField label="Catatan" value={patient.notes || '-'} />
          </div>
        </dl>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Informasi PIVC</h2>
            {activePivc && <PivcStatusBadge status={activePivc.status} />}
          </div>
          {activePivc ? (
            <div className="flex flex-col gap-2 text-sm text-gray-600">
              <p>
                <span className="text-gray-400">Lokasi Insersi:</span> {activePivc.insertionSite} (
                {activePivc.extremitySide})
              </p>
              <p>
                <span className="text-gray-400">Tanggal Pemasangan:</span>{' '}
                {formatDateID(activePivc.installationDate)}
              </p>
              <Link
                to={`/pivc/${patient.id}`}
                className="mt-2 inline-flex w-fit items-center gap-2 rounded-lg border border-teal-700 px-4 py-2 text-sm font-medium text-teal-800 hover:bg-teal-50"
              >
                Kelola Data PIVC
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-gray-500">Pasien ini belum memiliki data PIVC aktif.</p>
              <Link
                to={`/pivc/${patient.id}`}
                className="inline-flex w-fit items-center gap-2 rounded-lg bg-teal-800 px-4 py-2 text-sm font-medium text-white hover:bg-teal-900"
              >
                Pasang PIVC Baru
              </Link>
            </div>
          )}
        </div>

        <SummaryCard icon={LineChart} title="VIP Score Terbaru">
          {latestAssessment ? (
            <div className="flex flex-col gap-2 text-sm text-gray-600">
              <p>
                <span className="text-gray-400">Skor:</span>{' '}
                <span className="font-semibold text-gray-800">
                  {latestAssessment.totalScore !== null ? latestAssessment.totalScore : 'Belum tersedia'}
                </span>{' '}
                {latestAssessment.category && <span>({latestAssessment.category})</span>}
              </p>
              <p>
                <span className="text-gray-400">Tanggal:</span> {formatDateID(latestAssessment.date)} {latestAssessment.time}
              </p>
              <Link
                to={`/hasil-penilaian/${latestAssessment.id}`}
                className="mt-1 inline-flex w-fit items-center gap-2 rounded-lg border border-teal-700 px-4 py-2 text-sm font-medium text-teal-800 hover:bg-teal-50"
              >
                Lihat Hasil Penilaian
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-gray-500">Belum ada penilaian VIP Score untuk pasien ini.</p>
              <Link
                to={`/penilaian/${patient.id}`}
                className="inline-flex w-fit items-center gap-2 rounded-lg bg-teal-800 px-4 py-2 text-sm font-medium text-white hover:bg-teal-900"
              >
                Lakukan Penilaian
              </Link>
            </div>
          )}
        </SummaryCard>

        <SummaryCard icon={ClipboardList} title="Riwayat Pemantauan">
          {patientAssessments.length > 0 ? (
            <div className="flex flex-col gap-2 text-sm text-gray-600">
              <p>
                <span className="font-semibold text-gray-800">{patientAssessments.length}</span> kali penilaian
                tercatat untuk pasien ini.
              </p>
              <Link
                to="/riwayat"
                className="mt-1 inline-flex w-fit items-center gap-2 rounded-lg border border-teal-700 px-4 py-2 text-sm font-medium text-teal-800 hover:bg-teal-50"
              >
                Lihat Riwayat
              </Link>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Belum ada riwayat pemantauan untuk pasien ini.</p>
          )}
        </SummaryCard>

        <SummaryCard icon={Camera} title="Dokumentasi Foto">
          {patientPhotos.length > 0 ? (
            <div className="flex flex-col gap-2 text-sm text-gray-600">
              <p>
                <span className="font-semibold text-gray-800">{patientPhotos.length}</span> foto dokumentasi
                tersimpan untuk pasien ini.
              </p>
              <Link
                to={`/dokumentasi-foto/${patient.id}`}
                className="mt-1 inline-flex w-fit items-center gap-2 rounded-lg border border-teal-700 px-4 py-2 text-sm font-medium text-teal-800 hover:bg-teal-50"
              >
                Lihat Dokumentasi Foto
              </Link>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Belum ada dokumentasi foto untuk pasien ini.</p>
          )}
        </SummaryCard>
      </div>
    </div>
  )
}

export default PatientDetailPage
