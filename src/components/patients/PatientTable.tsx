import { UserX } from 'lucide-react'
import type { Patient } from '../../types/patient'
import { calculateAge, formatDateID, getAvatarColorClass, getInitials } from '../../utils/patient'
import PatientActionMenu from './PatientActionMenu'

interface PatientTableProps {
  patients: Patient[]
  searchTerm: string
  onViewDetail: (patient: Patient) => void
  onEdit: (patient: Patient) => void
  onDelete: (patient: Patient) => void
}

function PatientIdentity({ patient }: { patient: Patient }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${getAvatarColorClass(patient.id)}`}
      >
        {getInitials(patient.name, 1)}
      </span>
      <div>
        <p className="font-medium text-gray-900">{patient.name}</p>
        <p className="text-xs text-gray-500">
          {formatDateID(patient.dateOfBirth)} ({calculateAge(patient.dateOfBirth)} th)
        </p>
      </div>
    </div>
  )
}

function EmptyState({ searchTerm }: { searchTerm: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-gray-200 bg-white py-12 text-center text-gray-500">
      <UserX size={28} className="text-gray-300" />
      {searchTerm ? (
        <p>
          Tidak ada pasien yang cocok dengan pencarian &ldquo;{searchTerm}&rdquo;.
        </p>
      ) : (
        <p>Belum ada data pasien. Klik &ldquo;Pasien Baru&rdquo; untuk menambahkan.</p>
      )}
    </div>
  )
}

function PatientTable({ patients, searchTerm, onViewDetail, onEdit, onDelete }: PatientTableProps) {
  if (patients.length === 0) {
    return <EmptyState searchTerm={searchTerm} />
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-x-auto rounded-2xl border border-gray-100 bg-white md:block">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Nama Pasien</th>
              <th className="px-4 py-3 font-medium">No. RM</th>
              <th className="px-4 py-3 font-medium">Ruangan/Bed</th>
              <th className="px-4 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {patients.map((patient) => (
              <tr key={patient.id} className="transition-colors hover:bg-gray-50">
                <td className="px-4 py-3">
                  <PatientIdentity patient={patient} />
                </td>
                <td className="px-4 py-3 text-gray-600">{patient.medicalRecordNumber}</td>
                <td className="px-4 py-3 text-gray-600">
                  {patient.room} / {patient.bed}
                </td>
                <td className="px-4 py-3">
                  <PatientActionMenu
                    onViewDetail={() => onViewDetail(patient)}
                    onEdit={() => onEdit(patient)}
                    onDelete={() => onDelete(patient)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {patients.map((patient) => (
          <div key={patient.id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <PatientIdentity patient={patient} />
              <PatientActionMenu
                onViewDetail={() => onViewDetail(patient)}
                onEdit={() => onEdit(patient)}
                onDelete={() => onDelete(patient)}
              />
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 border-t border-gray-100 pt-3 text-xs text-gray-500">
              <div>
                <dt className="uppercase tracking-wide">No. RM</dt>
                <dd className="mt-0.5 font-medium text-gray-700">{patient.medicalRecordNumber}</dd>
              </div>
              <div>
                <dt className="uppercase tracking-wide">Ruangan/Bed</dt>
                <dd className="mt-0.5 font-medium text-gray-700">
                  {patient.room} / {patient.bed}
                </dd>
              </div>
            </dl>
          </div>
        ))}
      </div>
    </>
  )
}

export default PatientTable
