import { Pencil, Undo2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ConfirmDialog from '../components/ConfirmDialog'
import PageHeader from '../components/PageHeader'
import PatientContextCard from '../components/PatientContextCard'
import PivcForm, { type PivcFormValues } from '../components/pivc/PivcForm'
import PivcStatusBadge from '../components/pivc/PivcStatusBadge'
import PivcSummary from '../components/pivc/PivcSummary'
import Toast from '../components/Toast'
import { usePatients } from '../hooks/usePatients'
import { usePivcs } from '../hooks/usePivcs'
import { formatDateID } from '../utils/patient'

function PivcPatientPage() {
  const { patientId } = useParams<{ patientId: string }>()
  const { patients } = usePatients()
  const { addPivc, updatePivc, markAsRemoved, getActivePivcByPatientId, getPivcsByPatientId } = usePivcs()
  const navigate = useNavigate()

  const [isEditingActive, setIsEditingActive] = useState(false)
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const patient = patients.find((item) => item.id === patientId)

  if (!patient) {
    return (
      <div>
        <PageHeader title="Pasien Tidak Ditemukan" description="Data pasien yang dicari tidak tersedia." />
        <Link
          to="/pivc"
          className="inline-flex items-center gap-2 rounded-lg border border-teal-700 px-4 py-2 text-sm font-medium text-teal-800 hover:bg-teal-50"
        >
          Kembali ke Data PIVC
        </Link>
      </div>
    )
  }

  const activePivc = getActivePivcByPatientId(patient.id)
  const history = getPivcsByPatientId(patient.id).filter((pivc) => pivc.status === 'removed')
  const showForm = !activePivc || isEditingActive

  function handleCreate(values: PivcFormValues) {
    addPivc({ ...values, patientId: patient!.id })
    setToastMessage('Data pemasangan PIVC berhasil disimpan.')
  }

  function handleUpdate(values: PivcFormValues) {
    if (!activePivc) return
    updatePivc({ ...activePivc, ...values })
    setToastMessage('Data pemasangan PIVC berhasil diperbarui.')
    setIsEditingActive(false)
  }

  function handleConfirmRemove() {
    if (!activePivc) return
    markAsRemoved(activePivc.id)
    setToastMessage('PIVC ditandai sebagai dilepas.')
    setConfirmRemoveOpen(false)
  }

  return (
    <div>
      <PageHeader
        title="Data Pemasangan PIVC"
        description="Lengkapi informasi pemasangan kateter intravena perifer pasien."
      />

      <div className="mb-6">
        <PatientContextCard patient={patient} onViewDetail={() => navigate(`/pasien/${patient.id}`)} />
      </div>

      {showForm ? (
        <PivcForm
          initialPivc={isEditingActive ? activePivc : undefined}
          onSave={isEditingActive ? handleUpdate : handleCreate}
          onCancel={() => (isEditingActive ? setIsEditingActive(false) : navigate('/pivc'))}
        />
      ) : (
        activePivc && (
          <>
            <PivcSummary pivc={activePivc} />
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setIsEditingActive(true)}
                className="flex items-center gap-2 rounded-lg border border-teal-700 px-4 py-2 text-sm font-medium text-teal-800 hover:bg-teal-50"
              >
                <Pencil size={16} />
                Edit Data PIVC
              </button>
              <button
                type="button"
                onClick={() => setConfirmRemoveOpen(true)}
                className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                <Undo2 size={16} />
                Tandai Dilepas
              </button>
              <Link
                to={`/pivc/detail/${activePivc.id}`}
                className="flex items-center gap-2 rounded-lg bg-teal-800 px-4 py-2 text-sm font-medium text-white hover:bg-teal-900"
              >
                Lihat Detail Lengkap
              </Link>
            </div>
          </>
        )
      )}

      {history.length > 0 && (
        <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-base font-semibold text-gray-900">Riwayat PIVC Sebelumnya</h2>
          <ul className="divide-y divide-gray-100">
            {history.map((pivc) => (
              <li key={pivc.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <div>
                  <p className="font-medium text-gray-800">
                    {formatDateID(pivc.installationDate)} • {pivc.insertionSite} ({pivc.extremitySide})
                  </p>
                  <p className="text-xs text-gray-500">{pivc.catheterType}</p>
                </div>
                <div className="flex items-center gap-3">
                  <PivcStatusBadge status={pivc.status} />
                  <Link
                    to={`/pivc/detail/${pivc.id}`}
                    className="text-sm font-medium text-teal-800 hover:underline"
                  >
                    Lihat Detail
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ConfirmDialog
        open={confirmRemoveOpen}
        title="Tandai PIVC sebagai dilepas?"
        description={
          activePivc
            ? `PIVC pada lokasi "${activePivc.insertionSite}" (dipasang ${formatDateID(activePivc.installationDate)}) akan ditandai dilepas. Anda dapat memasang PIVC baru setelahnya.`
            : ''
        }
        confirmLabel="Tandai Dilepas"
        onConfirm={handleConfirmRemove}
        onCancel={() => setConfirmRemoveOpen(false)}
      />

      {toastMessage && <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />}
    </div>
  )
}

export default PivcPatientPage
