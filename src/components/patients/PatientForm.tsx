import { Info } from 'lucide-react'
import { useEffect, useId, useState, type FormEvent } from 'react'
import type { Gender, Patient, PatientInput } from '../../types/patient'
import { calculateAge } from '../../utils/patient'

const GENDER_OPTIONS: Gender[] = ['Perempuan', 'Laki-laki']

const ROOM_OPTIONS = [
  'Mawar 1',
  'Mawar 2',
  'Mawar 3',
  'Melati 1',
  'Melati 2',
  'Anggrek 1',
  'Anggrek 2',
  'Anggrek 3',
]

interface PatientFormProps {
  initialPatient?: Patient
  onSave: (input: PatientInput) => void
  onCancel: () => void
}

interface FormState {
  name: string
  medicalRecordNumber: string
  dateOfBirth: string
  gender: Gender
  room: string
  bed: string
  address: string
  notes: string
}

const EMPTY_FORM: FormState = {
  name: '',
  medicalRecordNumber: '',
  dateOfBirth: '',
  gender: 'Perempuan',
  room: '',
  bed: '',
  address: '',
  notes: '',
}

function toFormState(patient?: Patient): FormState {
  if (!patient) return EMPTY_FORM
  return {
    name: patient.name,
    medicalRecordNumber: patient.medicalRecordNumber,
    dateOfBirth: patient.dateOfBirth,
    gender: patient.gender,
    room: patient.room,
    bed: patient.bed,
    address: patient.address ?? '',
    notes: patient.notes ?? '',
  }
}

type FormErrors = Partial<Record<keyof FormState, string>>

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {}
  if (!form.name.trim()) errors.name = 'Nama/Inisial pasien wajib diisi.'
  if (!form.medicalRecordNumber.trim()) errors.medicalRecordNumber = 'No. rekam medis wajib diisi.'
  if (!form.dateOfBirth) errors.dateOfBirth = 'Tanggal lahir wajib diisi.'
  if (!form.room) errors.room = 'Ruangan wajib dipilih.'
  if (!form.bed.trim()) errors.bed = 'Nomor tempat tidur wajib diisi.'
  return errors
}

function PatientForm({ initialPatient, onSave, onCancel }: PatientFormProps) {
  const [form, setForm] = useState<FormState>(() => toFormState(initialPatient))
  const [errors, setErrors] = useState<FormErrors>({})
  const formId = useId()

  useEffect(() => {
    setForm(toFormState(initialPatient))
    setErrors({})
  }, [initialPatient])

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const validationErrors = validate(form)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    onSave({
      name: form.name.trim(),
      medicalRecordNumber: form.medicalRecordNumber.trim(),
      dateOfBirth: form.dateOfBirth,
      gender: form.gender,
      room: form.room,
      bed: form.bed.trim(),
      address: form.address.trim() || undefined,
      notes: form.notes.trim() || undefined,
    })
  }

  const age = form.dateOfBirth ? calculateAge(form.dateOfBirth) : null

  const fieldId = (name: string) => `${formId}-${name}`
  const inputClass = (hasError: boolean) =>
    `w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
      hasError
        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
        : 'border-gray-200 focus:border-teal-700 focus:ring-teal-700'
    }`

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
    >
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Formulir Data Pasien</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={fieldId('name')} className="mb-1 block text-sm font-medium text-gray-700">
            Nama / Inisial Pasien <span className="text-red-500">*</span>
          </label>
          <input
            id={fieldId('name')}
            type="text"
            value={form.name}
            onChange={(event) => updateField('name', event.target.value)}
            placeholder="Ny. Siti Aisyah"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? fieldId('name-error') : undefined}
            className={inputClass(Boolean(errors.name))}
          />
          {errors.name && (
            <p id={fieldId('name-error')} className="mt-1 text-xs text-red-600">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label htmlFor={fieldId('mrn')} className="mb-1 block text-sm font-medium text-gray-700">
            No. Rekam Medis / ID <span className="text-red-500">*</span>
          </label>
          <input
            id={fieldId('mrn')}
            type="text"
            value={form.medicalRecordNumber}
            onChange={(event) => updateField('medicalRecordNumber', event.target.value)}
            placeholder="RM00012345"
            aria-invalid={Boolean(errors.medicalRecordNumber)}
            aria-describedby={errors.medicalRecordNumber ? fieldId('mrn-error') : undefined}
            className={inputClass(Boolean(errors.medicalRecordNumber))}
          />
          {errors.medicalRecordNumber && (
            <p id={fieldId('mrn-error')} className="mt-1 text-xs text-red-600">
              {errors.medicalRecordNumber}
            </p>
          )}
        </div>

        <div>
          <label htmlFor={fieldId('dob')} className="mb-1 block text-sm font-medium text-gray-700">
            Tanggal Lahir <span className="text-red-500">*</span>
          </label>
          <input
            id={fieldId('dob')}
            type="date"
            value={form.dateOfBirth}
            onChange={(event) => updateField('dateOfBirth', event.target.value)}
            aria-invalid={Boolean(errors.dateOfBirth)}
            aria-describedby={errors.dateOfBirth ? fieldId('dob-error') : undefined}
            className={inputClass(Boolean(errors.dateOfBirth))}
          />
          {errors.dateOfBirth && (
            <p id={fieldId('dob-error')} className="mt-1 text-xs text-red-600">
              {errors.dateOfBirth}
            </p>
          )}
        </div>

        <div>
          <label htmlFor={fieldId('age')} className="mb-1 block text-sm font-medium text-gray-700">
            Usia
          </label>
          <input
            id={fieldId('age')}
            type="text"
            readOnly
            value={age !== null ? `${age} Tahun` : ''}
            placeholder="Otomatis dari tanggal lahir"
            className="w-full rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-500"
          />
        </div>

        <div>
          <label htmlFor={fieldId('gender')} className="mb-1 block text-sm font-medium text-gray-700">
            Jenis Kelamin <span className="text-red-500">*</span>
          </label>
          <select
            id={fieldId('gender')}
            value={form.gender}
            onChange={(event) => updateField('gender', event.target.value as Gender)}
            className={inputClass(false)}
          >
            {GENDER_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={fieldId('room')} className="mb-1 block text-sm font-medium text-gray-700">
            Ruangan <span className="text-red-500">*</span>
          </label>
          <select
            id={fieldId('room')}
            value={form.room}
            onChange={(event) => updateField('room', event.target.value)}
            aria-invalid={Boolean(errors.room)}
            aria-describedby={errors.room ? fieldId('room-error') : undefined}
            className={inputClass(Boolean(errors.room))}
          >
            <option value="">Pilih ruangan</option>
            {ROOM_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {errors.room && (
            <p id={fieldId('room-error')} className="mt-1 text-xs text-red-600">
              {errors.room}
            </p>
          )}
        </div>

        <div>
          <label htmlFor={fieldId('bed')} className="mb-1 block text-sm font-medium text-gray-700">
            Nomor Tempat Tidur <span className="text-red-500">*</span>
          </label>
          <input
            id={fieldId('bed')}
            type="text"
            value={form.bed}
            onChange={(event) => updateField('bed', event.target.value)}
            placeholder="05"
            aria-invalid={Boolean(errors.bed)}
            aria-describedby={errors.bed ? fieldId('bed-error') : undefined}
            className={inputClass(Boolean(errors.bed))}
          />
          {errors.bed && (
            <p id={fieldId('bed-error')} className="mt-1 text-xs text-red-600">
              {errors.bed}
            </p>
          )}
        </div>

        <div>
          <label htmlFor={fieldId('address')} className="mb-1 block text-sm font-medium text-gray-700">
            Alamat (Opsional)
          </label>
          <input
            id={fieldId('address')}
            type="text"
            value={form.address}
            onChange={(event) => updateField('address', event.target.value)}
            placeholder="Jl. Melati No. 10, Bandung"
            className={inputClass(false)}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor={fieldId('notes')} className="mb-1 block text-sm font-medium text-gray-700">
            Catatan (Opsional)
          </label>
          <textarea
            id={fieldId('notes')}
            value={form.notes}
            onChange={(event) => updateField('notes', event.target.value)}
            placeholder="Masukkan catatan tambahan tentang pasien..."
            rows={3}
            className={inputClass(false)}
          />
        </div>
      </div>

      <div className="mt-5 flex items-start gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
        <Info size={18} className="mt-0.5 shrink-0" />
        <p>
          Data pasien akan digunakan untuk menghubungkan data PIVC, hasil VIP Score, foto area
          insersi, catatan, dan riwayat pemantauan.
        </p>
      </div>

      <div className="mt-5 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          Batal
        </button>
        <button
          type="submit"
          className="rounded-lg bg-teal-800 px-4 py-2 text-sm font-medium text-white hover:bg-teal-900"
        >
          Simpan
        </button>
      </div>
    </form>
  )
}

export default PatientForm
