import { Info } from 'lucide-react'
import { useId, useState, type FormEvent } from 'react'
import { INSERTION_SITE_OPTIONS } from '../../data/pivcOptions'
import type { Assessment } from '../../types/assessment'
import { formatDateID } from '../../utils/patient'
import { nowTimeString, todayDateString } from '../../utils/datetime'
import PhotoCaptureArea from './PhotoCaptureArea'

export interface PhotoFormValues {
  imageData: string
  date: string
  time: string
  insertionSite: string
  assessmentId?: string
  vipScore: number | null
  vipCategory: string | null
  note?: string
  createdBy: string
}

interface PhotoFormProps {
  defaultInsertionSite: string
  assessments: Assessment[]
  onSave: (values: PhotoFormValues) => void
  onCancel?: () => void
}

interface FormState {
  imageData: string | undefined
  date: string
  time: string
  insertionSite: string
  assessmentId: string
  note: string
  createdBy: string
}

type FormErrors = Partial<Record<'image' | 'date' | 'time' | 'insertionSite' | 'createdBy', string>>

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {}
  if (!form.imageData) errors.image = 'Foto area insersi wajib dipilih.'
  if (!form.date) errors.date = 'Tanggal foto wajib diisi.'
  if (!form.time) errors.time = 'Waktu foto wajib diisi.'
  if (!form.insertionSite) errors.insertionSite = 'Lokasi pemasangan PIVC wajib dipilih.'
  if (!form.createdBy.trim()) errors.createdBy = 'Nama pendokumentasi wajib diisi.'
  return errors
}

function PhotoForm({ defaultInsertionSite, assessments, onSave, onCancel }: PhotoFormProps) {
  const [form, setForm] = useState<FormState>({
    imageData: undefined,
    date: todayDateString(),
    time: nowTimeString(),
    insertionSite: defaultInsertionSite,
    assessmentId: '',
    note: '',
    createdBy: 'Perawat',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const formId = useId()

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const selectedAssessment = assessments.find((assessment) => assessment.id === form.assessmentId)
  const vipScore = selectedAssessment ? selectedAssessment.totalScore : null
  const vipCategory = selectedAssessment ? selectedAssessment.category : null

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const validationErrors = validate(form)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    onSave({
      imageData: form.imageData!,
      date: form.date,
      time: form.time,
      insertionSite: form.insertionSite,
      assessmentId: form.assessmentId || undefined,
      vipScore,
      vipCategory,
      note: form.note.trim() || undefined,
      createdBy: form.createdBy.trim(),
    })

    setForm({
      imageData: undefined,
      date: todayDateString(),
      time: nowTimeString(),
      insertionSite: defaultInsertionSite,
      assessmentId: '',
      note: '',
      createdBy: 'Perawat',
    })
  }

  const fieldId = (name: string) => `${formId}-${name}`
  const inputClass = (hasError: boolean) =>
    `w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
      hasError
        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
        : 'border-gray-200 focus:border-teal-700 focus:ring-teal-700'
    }`

  return (
    <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div>
        <PhotoCaptureArea
          imageData={form.imageData}
          onImageSelected={(dataUrl) => updateField('imageData', dataUrl)}
          onRemove={() => updateField('imageData', undefined)}
        />
        {errors.image && <p className="mt-1 text-xs text-red-600">{errors.image}</p>}
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Informasi Foto</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor={fieldId('date')} className="mb-1 block text-sm font-medium text-gray-700">
              Tanggal Foto <span className="text-red-500">*</span>
            </label>
            <input
              id={fieldId('date')}
              type="date"
              value={form.date}
              onChange={(event) => updateField('date', event.target.value)}
              aria-invalid={Boolean(errors.date)}
              className={inputClass(Boolean(errors.date))}
            />
            {errors.date && <p className="mt-1 text-xs text-red-600">{errors.date}</p>}
          </div>

          <div>
            <label htmlFor={fieldId('time')} className="mb-1 block text-sm font-medium text-gray-700">
              Waktu Foto <span className="text-red-500">*</span>
            </label>
            <input
              id={fieldId('time')}
              type="time"
              value={form.time}
              onChange={(event) => updateField('time', event.target.value)}
              aria-invalid={Boolean(errors.time)}
              className={inputClass(Boolean(errors.time))}
            />
            {errors.time && <p className="mt-1 text-xs text-red-600">{errors.time}</p>}
          </div>

          <div className="sm:col-span-2">
            <label htmlFor={fieldId('site')} className="mb-1 block text-sm font-medium text-gray-700">
              Lokasi Pemasangan PIVC <span className="text-red-500">*</span>
            </label>
            <select
              id={fieldId('site')}
              value={form.insertionSite}
              onChange={(event) => updateField('insertionSite', event.target.value)}
              aria-invalid={Boolean(errors.insertionSite)}
              className={inputClass(Boolean(errors.insertionSite))}
            >
              <option value="">Pilih lokasi insersi</option>
              {INSERTION_SITE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors.insertionSite && <p className="mt-1 text-xs text-red-600">{errors.insertionSite}</p>}
          </div>

          <div className="sm:col-span-2">
            <label htmlFor={fieldId('assessment')} className="mb-1 block text-sm font-medium text-gray-700">
              Kaitkan dengan Penilaian VIP Score (Opsional)
            </label>
            <select
              id={fieldId('assessment')}
              value={form.assessmentId}
              onChange={(event) => updateField('assessmentId', event.target.value)}
              className={inputClass(false)}
            >
              <option value="">Tidak terkait dengan penilaian</option>
              {assessments.map((assessment) => (
                <option key={assessment.id} value={assessment.id}>
                  {formatDateID(assessment.date)} {assessment.time} —{' '}
                  {assessment.totalScore !== null
                    ? `Skor ${assessment.totalScore} (${assessment.category})`
                    : 'Skor belum tersedia'}
                </option>
              ))}
            </select>
            <div className="mt-2 rounded-lg bg-gray-50 p-3 text-sm">
              <span className="text-gray-500">VIP Score Saat Foto: </span>
              <span className="font-medium text-gray-800">
                {vipScore !== null ? `${vipScore} (${vipCategory ?? '-'})` : 'Belum tersedia'}
              </span>
            </div>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor={fieldId('createdBy')} className="mb-1 block text-sm font-medium text-gray-700">
              Didokumentasikan Oleh <span className="text-red-500">*</span>
            </label>
            <input
              id={fieldId('createdBy')}
              type="text"
              value={form.createdBy}
              onChange={(event) => updateField('createdBy', event.target.value)}
              aria-invalid={Boolean(errors.createdBy)}
              className={inputClass(Boolean(errors.createdBy))}
            />
            {errors.createdBy && <p className="mt-1 text-xs text-red-600">{errors.createdBy}</p>}
          </div>

          <div className="sm:col-span-2">
            <label htmlFor={fieldId('note')} className="mb-1 block text-sm font-medium text-gray-700">
              Catatan / Keterangan Hasil Pengkajian (Opsional)
            </label>
            <textarea
              id={fieldId('note')}
              value={form.note}
              onChange={(event) => updateField('note', event.target.value)}
              placeholder="Tidak ada tanda kemerahan, tidak nyeri, tidak ada pembengkakan."
              rows={3}
              className={inputClass(false)}
            />
          </div>
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
          <Info size={18} className="mt-0.5 shrink-0" />
          <p>
            Foto berfungsi sebagai dokumentasi visual dan data pendukung pemantauan, bukan sebagai
            alat diagnosis otomatis.
          </p>
        </div>

        <div className="mt-5 flex justify-end gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Batal
            </button>
          )}
          <button
            type="submit"
            className="rounded-lg bg-teal-800 px-4 py-2 text-sm font-medium text-white hover:bg-teal-900"
          >
            Simpan Foto
          </button>
        </div>
      </div>
    </form>
  )
}

export default PhotoForm
