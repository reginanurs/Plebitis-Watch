import { Link, useParams } from 'react-router-dom'
import ComingSoonCard from '../components/ComingSoonCard'
import PageHeader from '../components/PageHeader'
import PatientContextCard from '../components/PatientContextCard'
import PivcSummary from '../components/pivc/PivcSummary'
import { usePatients } from '../hooks/usePatients'
import { usePivcs } from '../hooks/usePivcs'

function PivcDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { patients } = usePatients()
  const { getPivcById } = usePivcs()

  const pivc = id ? getPivcById(id) : undefined
  const patient = pivc ? patients.find((item) => item.id === pivc.patientId) : undefined

  if (!pivc || !patient) {
    return (
      <div>
        <PageHeader title="Data PIVC Tidak Ditemukan" description="Data pemasangan PIVC yang dicari tidak tersedia." />
        <Link
          to="/pivc"
          className="inline-flex items-center gap-2 rounded-lg border border-teal-700 px-4 py-2 text-sm font-medium text-teal-800 hover:bg-teal-50"
        >
          Kembali ke Data PIVC
        </Link>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Detail PIVC" description="Informasi lengkap pemasangan dan status PIVC pasien." />

      <div className="mb-6">
        <PatientContextCard patient={patient} />
      </div>

      <div className="mb-6">
        <PivcSummary pivc={pivc} />
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-base font-semibold text-gray-900">Informasi Monitoring Berikutnya</h2>
        <ComingSoonCard />
      </div>
    </div>
  )
}

export default PivcDetailPage
