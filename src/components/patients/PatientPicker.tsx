import { ChevronRight, UserX } from 'lucide-react'
import type { Patient } from '../../types/patient'
import type { Pivc } from '../../types/pivc'
import { calculateAge, getAvatarColorClass, getInitials } from '../../utils/patient'
import PivcStatusBadge from '../pivc/PivcStatusBadge'

interface PatientPickerProps {
  patients: Patient[]
  searchTerm: string
  getActivePivcByPatientId: (patientId: string) => Pivc | undefined
  onSelect: (patient: Patient) => void
}

function PatientPicker({ patients, searchTerm, getActivePivcByPatientId, onSelect }: PatientPickerProps) {
  if (patients.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-gray-200 bg-white py-12 text-center text-gray-500">
        <UserX size={28} className="text-gray-300" />
        <p>Tidak ada pasien yang cocok dengan pencarian &ldquo;{searchTerm}&rdquo;.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {patients.map((patient) => {
        const activePivc = getActivePivcByPatientId(patient.id)
        return (
          <button
            key={patient.id}
            type="button"
            onClick={() => onSelect(patient)}
            className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-4 text-left shadow-sm hover:border-teal-200 hover:bg-teal-50/40"
          >
            <div className="flex items-center gap-3">
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${getAvatarColorClass(patient.id)}`}
              >
                {getInitials(patient.name)}
              </span>
              <div>
                <p className="font-medium text-gray-900">{patient.name}</p>
                <p className="text-xs text-gray-500">
                  {patient.medicalRecordNumber} • {calculateAge(patient.dateOfBirth)} th • Ruang{' '}
                  {patient.room} / Bed {patient.bed}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {activePivc ? (
                <PivcStatusBadge status="active" />
              ) : (
                <span className="text-xs text-gray-400">Belum ada PIVC aktif</span>
              )}
              <ChevronRight size={18} className="text-gray-300" />
            </div>
          </button>
        )
      })}
    </div>
  )
}

export default PatientPicker
