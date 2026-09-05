import { UserPlus } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ConfirmDialog from '../components/ConfirmDialog'
import PageHeader from '../components/PageHeader'
import PatientForm from '../components/patients/PatientForm'
import PatientSearchInput from '../components/patients/PatientSearchInput'
import PatientTable from '../components/patients/PatientTable'
import Toast from '../components/Toast'
import { usePatients } from '../hooks/usePatients'
import type { Patient, PatientInput } from '../types/patient'

type FormState = { mode: 'create' } | { mode: 'edit'; patient: Patient } | null

function DataPasienPage() {
  const { patients, addPatient, updatePatient, deletePatient } = usePatients()
  const navigate = useNavigate()

  const [searchTerm, setSearchTerm] = useState('')
  const [formState, setFormState] = useState<FormState>(null)
  const [deleteTarget, setDeleteTarget] = useState<Patient | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const formSectionRef = useRef<HTMLDivElement>(null)

  const filteredPatients = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return patients
    return patients.filter((patient) =>
      [patient.name, patient.medicalRecordNumber, patient.room, patient.bed]
        .join(' ')
        .toLowerCase()
        .includes(term),
    )
  }, [patients, searchTerm])

  function openCreateForm() {
    setFormState({ mode: 'create' })
    requestAnimationFrame(() => formSectionRef.current?.scrollIntoView({ behavior: 'smooth' }))
  }

  function openEditForm(patient: Patient) {
    setFormState({ mode: 'edit', patient })
    requestAnimationFrame(() => formSectionRef.current?.scrollIntoView({ behavior: 'smooth' }))
  }

  function closeForm() {
    setFormState(null)
  }

  function handleSave(input: PatientInput) {
    if (formState?.mode === 'edit') {
      updatePatient({ ...input, id: formState.patient.id })
      setToastMessage('Data pasien berhasil diperbarui.')
    } else {
      addPatient(input)
      setToastMessage('Pasien baru berhasil ditambahkan.')
    }
    setFormState(null)
  }

  function handleConfirmDelete() {
    if (!deleteTarget) return
    deletePatient(deleteTarget.id)
    setToastMessage('Data pasien berhasil dihapus.')
    setDeleteTarget(null)
  }

  return (
    <div>
      <PageHeader
        title="Data Pasien"
        description="Kelola informasi pasien yang akan dilakukan pemantauan PIVC."
        showBackButton={false}
      >
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <PatientSearchInput value={searchTerm} onChange={setSearchTerm} />
          <button
            type="button"
            onClick={openCreateForm}
            className="flex items-center justify-center gap-2 rounded-lg bg-teal-800 px-4 py-2 text-sm font-medium text-white hover:bg-teal-900"
          >
            <UserPlus size={18} />
            Pasien Baru
          </button>
        </div>
      </PageHeader>

      <div className="mb-6">
        <PatientTable
          patients={filteredPatients}
          searchTerm={searchTerm}
          onViewDetail={(patient) => navigate(`/pasien/${patient.id}`)}
          onEdit={openEditForm}
          onDelete={setDeleteTarget}
        />
      </div>

      {formState && (
        <div ref={formSectionRef}>
          <PatientForm
            initialPatient={formState.mode === 'edit' ? formState.patient : undefined}
            onSave={handleSave}
            onCancel={closeForm}
          />
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Hapus data pasien?"
        description={
          deleteTarget
            ? `Data pasien "${deleteTarget.name}" (${deleteTarget.medicalRecordNumber}) akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.`
            : ''
        }
        confirmLabel="Hapus"
        destructive
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {toastMessage && <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />}
    </div>
  )
}

export default DataPasienPage
