import { Link, useParams } from 'react-router-dom'
import ComingSoonCard from '../components/ComingSoonCard'
import PageHeader from '../components/PageHeader'
import PatientContextCard from '../components/PatientContextCard'
import PivcStatusBadge from '../components/pivc/PivcStatusBadge'
import { usePatients } from '../hooks/usePatients'
import { usePivcs } from '../hooks/usePivcs'
import { calculateAge, formatDateID } from '../utils/patient'

const FUTURE_SECTIONS = [{ title: 'VIP Score Terbaru' }, { title: 'Riwayat Pemantauan' }, { title: 'Dokumentasi Foto' }]

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-gray-400">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-gray-800">{value}</dd>
    </div>
  )
}

function PatientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { patients } = usePatients()
  const { getActivePivcByPatientId } = usePivcs()
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

        {FUTURE_SECTIONS.map((section) => (
          <div key={section.title} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-base font-semibold text-gray-900">{section.title}</h2>
            <ComingSoonCard />
          </div>
        ))}
      </div>
    </div>
  )
}

export default PatientDetailPage
