import { UserRound } from 'lucide-react'
import type { Patient } from '../types/patient'
import { calculateAge, getAvatarColorClass, getInitials } from '../utils/patient'

interface PatientContextCardProps {
  patient: Patient
  onViewDetail?: () => void
}

function PatientContextCard({ patient, onViewDetail }: PatientContextCardProps) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span
          className={`flex h-12 w-12 items-center justify-center rounded-full text-lg font-semibold ${getAvatarColorClass(patient.id)}`}
        >
          {getInitials(patient.name)}
        </span>
        <div>
          <p className="font-semibold text-gray-900">{patient.name}</p>
          <p className="text-sm text-gray-500">
            {patient.medicalRecordNumber} • {patient.gender}, {calculateAge(patient.dateOfBirth)} Tahun
          </p>
          <p className="text-sm text-gray-500">
            Ruang {patient.room} • Bed {patient.bed}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onViewDetail}
        className="flex items-center justify-center gap-2 self-start rounded-lg border border-teal-700 px-4 py-2 text-sm font-medium text-teal-800 hover:bg-teal-50 sm:self-auto"
      >
        <UserRound size={16} />
        Lihat Detail Pasien
      </button>
    </div>
  )
}

export default PatientContextCard
