import { ArrowLeft, ChevronRight, ClipboardList } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../PageHeader'
import PatientPicker from '../patients/PatientPicker'
import PatientSearchInput from '../patients/PatientSearchInput'
import { useAssessments } from '../../hooks/useAssessments'
import { usePatients } from '../../hooks/usePatients'
import { usePivcs } from '../../hooks/usePivcs'
import type { Assessment } from '../../types/assessment'
import type { Patient } from '../../types/patient'
import { formatDateID } from '../../utils/patient'

interface AssessmentPickerProps {
  title: string
  pickerDescription: string
  listDescriptionPrefix: string
  emptyStateMessage: string
  buildAssessmentPath: (assessment: Assessment) => string
}

function AssessmentPicker({
  title,
  pickerDescription,
  listDescriptionPrefix,
  emptyStateMessage,
  buildAssessmentPath,
}: AssessmentPickerProps) {
  const { patients } = usePatients()
  const { getActivePivcByPatientId } = usePivcs()
  const { getAssessmentsByPatientId } = useAssessments()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)

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

  if (!selectedPatient) {
    return (
      <div>
        <PageHeader title={title} description={pickerDescription} showBackButton={false}>
          <div className="mt-4">
            <PatientSearchInput value={searchTerm} onChange={setSearchTerm} />
          </div>
        </PageHeader>

        <PatientPicker
          patients={filteredPatients}
          searchTerm={searchTerm}
          getActivePivcByPatientId={getActivePivcByPatientId}
          onSelect={setSelectedPatient}
        />
      </div>
    )
  }

  const assessments = [...getAssessmentsByPatientId(selectedPatient.id)].sort((a, b) =>
    `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`),
  )

  return (
    <div>
      <div className="mb-6">
        <button
          type="button"
          onClick={() => setSelectedPatient(null)}
          className="mb-3 flex items-center gap-2 text-sm font-medium text-teal-800 hover:underline"
        >
          <ArrowLeft size={16} />
          Pilih pasien lain
        </button>
        <h1 className="text-2xl font-bold text-teal-900">{title}</h1>
        <p className="mt-2 text-gray-500">
          {listDescriptionPrefix} <span className="font-medium text-gray-700">{selectedPatient.name}</span>.
        </p>
      </div>

      {assessments.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-gray-200 bg-white py-12 text-center text-gray-500">
          <ClipboardList size={28} className="text-gray-300" />
          <p>{emptyStateMessage}</p>
          <Link
            to={`/penilaian/${selectedPatient.id}`}
            className="rounded-lg bg-teal-800 px-4 py-2 text-sm font-medium text-white hover:bg-teal-900"
          >
            Lakukan Penilaian VIP Score
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {assessments.map((assessment) => (
            <Link
              key={assessment.id}
              to={buildAssessmentPath(assessment)}
              className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm hover:border-teal-200 hover:bg-teal-50/40"
            >
              <div>
                <p className="font-medium text-gray-900">
                  {formatDateID(assessment.date)} <span className="text-gray-400">{assessment.time}</span>
                </p>
                <p className="text-xs text-gray-500">Dinilai oleh {assessment.assessedBy}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">
                  {assessment.totalScore !== null
                    ? `Skor ${assessment.totalScore} (${assessment.category})`
                    : 'Skor belum tersedia'}
                </span>
                <ChevronRight size={18} className="text-gray-300" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default AssessmentPicker
