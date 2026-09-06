import { Camera, ImageOff, Info, X } from 'lucide-react'
import { useEffect, useId, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import {
  CATHETER_OPTIONS,
  EXTREMITY_SIDE_OPTIONS,
  INSERTION_SITE_OPTIONS,
  THERAPY_OPTIONS,
} from '../../data/pivcOptions'
import type { Pivc, PivcInput } from '../../types/pivc'
import { nowTimeString, todayDateString } from '../../utils/datetime'
import { getPhoto, removePhoto, savePhoto } from '../../utils/photoStorage'

export type PivcFormValues = Omit<PivcInput, 'patientId'>

interface PivcFormProps {
  initialPivc?: Pivc
  onSave: (values: PivcFormValues) => void
  onCancel: () => void
}

/** Sentinel select value that reveals the free-text "custom therapy" input. */
const THERAPY_OTHER_VALUE = '__other__'

interface FormState {
  installationDate: string
  installationTime: string
  insertionSite: string
  extremitySide: string
  catheterType: string
  therapy: string
  therapyOther: string
  insertedBy: string
  purpose: string
  additionalNotes: string
}

function toFormState(pivc?: Pivc): FormState {
  if (!pivc) {
    return {
      installationDate: todayDateString(),
      installationTime: nowTimeString(),
      insertionSite: '',
      extremitySide: '',
      catheterType: '',
      therapy: '',
      therapyOther: '',
      insertedBy: 'Perawat',
      purpose: '',
      additionalNotes: '',
    }
  }
  const isCustomTherapy = Boolean(pivc.therapy) && !THERAPY_OPTIONS.includes(pivc.therapy)
  return {
    installationDate: pivc.installationDate,
    installationTime: pivc.installationTime,
    insertionSite: pivc.insertionSite,
    extremitySide: pivc.extremitySide,
    catheterType: pivc.catheterType,
    therapy: isCustomTherapy ? THERAPY_OTHER_VALUE : pivc.therapy,
    therapyOther: isCustomTherapy ? pivc.therapy : '',
    insertedBy: pivc.insertedBy ?? 'Perawat',
    purpose: pivc.purpose ?? '',
    additionalNotes: pivc.additionalNotes ?? '',
  }
}

type FormErrors = Partial<
  Record<
    'installationDate' | 'installationTime' | 'insertionSite' | 'extremitySide' | 'catheterType' | 'therapy' | 'therapyOther' | 'insertedBy',
    string
  >
>

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {}
  if (!form.installationDate) errors.installationDate = 'Tanggal pemasangan wajib diisi.'
  if (!form.installationTime) errors.installationTime = 'Waktu pemasangan wajib diisi.'
  if (!form.insertionSite) errors.insertionSite = 'Lokasi insersi wajib dipilih.'
  if (!form.extremitySide) errors.extremitySide = 'Sisi ekstremitas wajib dipilih.'
  if (!form.catheterType) errors.catheterType = 'Jenis/ukuran kateter wajib dipilih.'
  if (!form.therapy) errors.therapy = 'Jenis terapi/cairan wajib dipilih.'
  if (form.therapy === THERAPY_OTHER_VALUE && !form.therapyOther.trim()) {
    errors.therapyOther = 'Nama terapi/cairan wajib diisi.'
  }
  if (!form.insertedBy.trim()) errors.insertedBy = 'Nama pemasang wajib diisi.'
  return errors
}

function PivcForm({ initialPivc, onSave, onCancel }: PivcFormProps) {
  const [form, setForm] = useState<FormState>(() => toFormState(initialPivc))
  const [errors, setErrors] = useState<FormErrors>({})
  const [photoId, setPhotoId] = useState<string | undefined>(initialPivc?.initialPhotoId)
  const [photoPreview, setPhotoPreview] = useState<string | undefined>(() =>
    getPhoto(initialPivc?.initialPhotoId),
  )
  const fileInputRef = useRef<HTMLInputElement>(null)
  const formId = useId()

  useEffect(() => {
    setForm(toFormState(initialPivc))
    setErrors({})
    setPhotoId(initialPivc?.initialPhotoId)
    setPhotoPreview(getPhoto(initialPivc?.initialPhotoId))
  }, [initialPivc])

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  function handlePhotoSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      const previousPhotoId = photoId
      const newPhotoId = savePhoto(dataUrl)
      if (previousPhotoId) removePhoto(previousPhotoId)
      setPhotoId(newPhotoId)
      setPhotoPreview(dataUrl)
    }
    reader.readAsDataURL(file)
  }

  function handleRemovePhoto() {
    if (photoId) removePhoto(photoId)
    setPhotoId(undefined)
    setPhotoPreview(undefined)
  }

  function handleCancel() {
    if (photoId && photoId !== initialPivc?.initialPhotoId) removePhoto(photoId)
    onCancel()
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const validationErrors = validate(form)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    onSave({
      installationDate: form.installationDate,
      installationTime: form.installationTime,
      insertionSite: form.insertionSite,
      extremitySide: form.extremitySide,
      catheterType: form.catheterType,
      therapy: form.therapy === THERAPY_OTHER_VALUE ? form.therapyOther.trim() : form.therapy,
      insertedBy: form.insertedBy.trim(),
      purpose: form.purpose.trim() || undefined,
      additionalNotes: form.additionalNotes.trim() || undefined,
      initialPhotoId: photoId,
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
    <form onSubmit={handleSubmit} noValidate className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Informasi Pemasangan</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={fieldId('date')} className="mb-1 block text-sm font-medium text-gray-700">
            Tanggal Pemasangan <span className="text-red-500">*</span>
          </label>
          <input
            id={fieldId('date')}
            type="date"
            value={form.installationDate}
            onChange={(event) => updateField('installationDate', event.target.value)}
            aria-invalid={Boolean(errors.installationDate)}
            aria-describedby={errors.installationDate ? fieldId('date-error') : undefined}
            className={inputClass(Boolean(errors.installationDate))}
          />
          {errors.installationDate && (
            <p id={fieldId('date-error')} className="mt-1 text-xs text-red-600">
              {errors.installationDate}
            </p>
          )}
        </div>

        <div>
          <label htmlFor={fieldId('time')} className="mb-1 block text-sm font-medium text-gray-700">
            Waktu Pemasangan <span className="text-red-500">*</span>
          </label>
          <input
            id={fieldId('time')}
            type="time"
            value={form.installationTime}
            onChange={(event) => updateField('installationTime', event.target.value)}
            aria-invalid={Boolean(errors.installationTime)}
            aria-describedby={errors.installationTime ? fieldId('time-error') : undefined}
            className={inputClass(Boolean(errors.installationTime))}
          />
          {errors.installationTime && (
            <p id={fieldId('time-error')} className="mt-1 text-xs text-red-600">
              {errors.installationTime}
            </p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor={fieldId('site')} className="mb-1 block text-sm font-medium text-gray-700">
            Lokasi Insersi <span className="text-red-500">*</span>
          </label>
          <select
            id={fieldId('site')}
            value={form.insertionSite}
            onChange={(event) => updateField('insertionSite', event.target.value)}
            aria-invalid={Boolean(errors.insertionSite)}
            aria-describedby={errors.insertionSite ? fieldId('site-error') : undefined}
            className={inputClass(Boolean(errors.insertionSite))}
          >
            <option value="">Pilih lokasi insersi</option>
            {INSERTION_SITE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {errors.insertionSite && (
            <p id={fieldId('site-error')} className="mt-1 text-xs text-red-600">
              {errors.insertionSite}
            </p>
          )}
        </div>

        <div>
          <label htmlFor={fieldId('side')} className="mb-1 block text-sm font-medium text-gray-700">
            Sisi Ekstremitas <span className="text-red-500">*</span>
          </label>
          <select
            id={fieldId('side')}
            value={form.extremitySide}
            onChange={(event) => updateField('extremitySide', event.target.value)}
            aria-invalid={Boolean(errors.extremitySide)}
            aria-describedby={errors.extremitySide ? fieldId('side-error') : undefined}
            className={inputClass(Boolean(errors.extremitySide))}
          >
            <option value="">Pilih sisi</option>
            {EXTREMITY_SIDE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {errors.extremitySide && (
            <p id={fieldId('side-error')} className="mt-1 text-xs text-red-600">
              {errors.extremitySide}
            </p>
          )}
        </div>

        <div>
          <label htmlFor={fieldId('catheter')} className="mb-1 block text-sm font-medium text-gray-700">
            Jenis/Ukuran Kateter <span className="text-red-500">*</span>
          </label>
          <select
            id={fieldId('catheter')}
            value={form.catheterType}
            onChange={(event) => updateField('catheterType', event.target.value)}
            aria-invalid={Boolean(errors.catheterType)}
            aria-describedby={errors.catheterType ? fieldId('catheter-error') : undefined}
            className={inputClass(Boolean(errors.catheterType))}
          >
            <option value="">Pilih jenis/ukuran kateter</option>
            {CATHETER_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {errors.catheterType && (
            <p id={fieldId('catheter-error')} className="mt-1 text-xs text-red-600">
              {errors.catheterType}
            </p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor={fieldId('therapy')} className="mb-1 block text-sm font-medium text-gray-700">
            Jenis Terapi / Cairan yang Diberikan <span className="text-red-500">*</span>
          </label>
          <select
            id={fieldId('therapy')}
            value={form.therapy}
            onChange={(event) => updateField('therapy', event.target.value)}
            aria-invalid={Boolean(errors.therapy)}
            aria-describedby={errors.therapy ? fieldId('therapy-error') : undefined}
            className={inputClass(Boolean(errors.therapy))}
          >
            <option value="">Pilih jenis terapi/cairan</option>
            {THERAPY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
            <option value={THERAPY_OTHER_VALUE}>Lainnya</option>
          </select>
          {errors.therapy && (
            <p id={fieldId('therapy-error')} className="mt-1 text-xs text-red-600">
              {errors.therapy}
            </p>
          )}
          {form.therapy === THERAPY_OTHER_VALUE && (
            <div className="mt-2">
              <label htmlFor={fieldId('therapy-other')} className="mb-1 block text-sm font-medium text-gray-700">
                Nama Terapi/Cairan <span className="text-red-500">*</span>
              </label>
              <input
                id={fieldId('therapy-other')}
                type="text"
                value={form.therapyOther}
                onChange={(event) => updateField('therapyOther', event.target.value)}
                placeholder="Cairan lain..."
                aria-invalid={Boolean(errors.therapyOther)}
                className={inputClass(Boolean(errors.therapyOther))}
              />
              {errors.therapyOther && <p className="mt-1 text-xs text-red-600">{errors.therapyOther}</p>}
            </div>
          )}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor={fieldId('insertedBy')} className="mb-1 block text-sm font-medium text-gray-700">
            Dipasang Oleh <span className="text-red-500">*</span>
          </label>
          <input
            id={fieldId('insertedBy')}
            type="text"
            value={form.insertedBy}
            onChange={(event) => updateField('insertedBy', event.target.value)}
            aria-invalid={Boolean(errors.insertedBy)}
            className={inputClass(Boolean(errors.insertedBy))}
          />
          {errors.insertedBy && <p className="mt-1 text-xs text-red-600">{errors.insertedBy}</p>}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor={fieldId('purpose')} className="mb-1 block text-sm font-medium text-gray-700">
            Tujuan Pemasangan (Opsional)
          </label>
          <input
            id={fieldId('purpose')}
            type="text"
            value={form.purpose}
            onChange={(event) => updateField('purpose', event.target.value)}
            placeholder="Terapi cairan dan antibiotik"
            className={inputClass(false)}
          />
        </div>
      </div>

      <h2 className="mb-4 mt-6 border-t border-gray-100 pt-5 text-lg font-semibold text-gray-900">
        Informasi Tambahan
      </h2>

      <div>
        <label htmlFor={fieldId('notes')} className="mb-1 block text-sm font-medium text-gray-700">
          Keterangan Tambahan (Opsional)
        </label>
        <textarea
          id={fieldId('notes')}
          value={form.additionalNotes}
          onChange={(event) => updateField('additionalNotes', event.target.value)}
          placeholder="Insersi mudah, darah balik lancar, fiksasi dengan transparent dressing."
          rows={3}
          className={inputClass(false)}
        />
      </div>

      <div className="mt-5 rounded-lg border border-gray-100 bg-gray-50 p-4">
        <p className="mb-3 text-sm font-medium text-gray-700">Dokumentasi Awal</p>
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          {photoPreview ? (
            <div className="relative">
              <img
                src={photoPreview}
                alt="Pratinjau foto awal area insersi"
                className="h-24 w-24 rounded-lg border border-gray-200 object-cover"
              />
              <button
                type="button"
                onClick={handleRemovePhoto}
                aria-label="Hapus foto"
                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white text-gray-500 shadow hover:text-red-600"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-lg border border-dashed border-gray-300 text-gray-300">
              <ImageOff size={24} />
            </div>
          )}

          <div className="flex-1">
            <p className="text-sm text-gray-500">
              Ambil atau unggah foto kondisi awal area insersi setelah pemasangan.
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 flex items-center gap-2 rounded-lg border border-teal-700 px-4 py-2 text-sm font-medium text-teal-800 hover:bg-teal-50"
            >
              <Camera size={16} />
              {photoPreview ? 'Ganti Foto' : 'Ambil Foto'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoSelected}
              className="hidden"
            />
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-start gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
        <Info size={18} className="mt-0.5 shrink-0" />
        <p>Foto berfungsi sebagai dokumentasi visual, bukan sebagai alat diagnosis otomatis.</p>
      </div>

      <div className="mt-5 flex justify-end gap-3">
        <button
          type="button"
          onClick={handleCancel}
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          Batal
        </button>
        <button
          type="submit"
          className="rounded-lg bg-teal-800 px-4 py-2 text-sm font-medium text-white hover:bg-teal-900"
        >
          Simpan Data Pemasangan
        </button>
      </div>
    </form>
  )
}

export default PivcForm
