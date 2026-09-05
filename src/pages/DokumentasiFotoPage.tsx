import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import PatientPicker from '../components/patients/PatientPicker'
import PatientSearchInput from '../components/patients/PatientSearchInput'
import { usePatients } from '../hooks/usePatients'
import { usePivcs } from '../hooks/usePivcs'

function DokumentasiFotoPage() {
  const { patients } = usePatients()
  const { getActivePivcByPatientId } = usePivcs()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')

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

  return (
    <div>
      <PageHeader
        title="Dokumentasi Foto Area Insersi"
        description="Pilih pasien untuk mendokumentasikan foto area insersi PIVC."
        showBackButton={false}
      >
        <div className="mt-4">
          <PatientSearchInput value={searchTerm} onChange={setSearchTerm} />
        </div>
      </PageHeader>

      <PatientPicker
        patients={filteredPatients}
        searchTerm={searchTerm}
        getActivePivcByPatientId={getActivePivcByPatientId}
        onSelect={(patient) => navigate(`/dokumentasi-foto/${patient.id}`)}
      />
    </div>
  )
}

export default DokumentasiFotoPage
