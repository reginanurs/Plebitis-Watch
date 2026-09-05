import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import PatientPicker from '../components/patients/PatientPicker'
import PatientSearchInput from '../components/patients/PatientSearchInput'
import { usePatients } from '../hooks/usePatients'
import { usePivcs } from '../hooks/usePivcs'

function PenilaianVipScorePage() {
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
        title="Penilaian VIP Score"
        description="Pilih pasien untuk melakukan penilaian VIP Score pada PIVC yang sedang aktif."
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
        onSelect={(patient) => navigate(`/penilaian/${patient.id}`)}
      />
    </div>
  )
}

export default PenilaianVipScorePage
