import { CheckCircle2 } from 'lucide-react'
import { useId, useMemo, useState, type FormEvent } from 'react'
import PhotoCaptureArea from '../photos/PhotoCaptureArea'
import type { AssessmentComponents } from '../../types/assessment'
import type { VipRulesConfig } from '../../types/vipRules'
import { nowTimeString, todayDateString } from '../../utils/datetime'
import { calculateVipScore, type VipScoreResult } from '../../utils/vipScore'
import VipAssessmentSection from './VipAssessmentSection'
import VipScoreSummary from './VipScoreSummary'

export interface AssessmentFormValues {
  date: string
  time: string
  assessedBy: string
  components: AssessmentComponents
  notes?: string
  /** Captured inline via the "Tambah Foto" shortcut — held here until the assessment is saved. */
  photoImageData?: string
}

interface VipAssessmentFormProps {
  rules: VipRulesConfig
  onSave: (values: AssessmentFormValues, scoreResult: VipScoreResult) => void
}

interface FormState {
  date: string
  time: string
  assessedBy: string
  components: AssessmentComponents
  notes: string
  photoImageData: string | undefined
}

const EMPTY_COMPONENTS: AssessmentComponents = {
  pain: '',
  erythema: '',
  swelling: '',
  induration: '',
  venousCord: '',
  pyrexia: '',
}

function defaultFormState(): FormState {
  return {
    date: todayDateString(),
    time: nowTimeString(),
    assessedBy: 'Perawat',
    components: { ...EMPTY_COMPONENTS },
    notes: '',
    photoImageData: undefined,
  }
}

type FormErrors = Partial<Record<'date' | 'time' | 'assessedBy', string>> & Record<string, string | undefined>

function validate(form: FormState, rules: VipRulesConfig): FormErrors {
  const errors: FormErrors = {}
  if (!form.date) errors.date = 'Tanggal penilaian wajib diisi.'
  if (!form.time) errors.time = 'Waktu penilaian wajib diisi.'
  if (!form.assessedBy.trim()) errors.assessedBy = 'Nama penilai wajib diisi.'

  for (const componentDef of rules.components) {
    const value = form.components[componentDef.id as keyof AssessmentComponents]
    if (!value) errors[componentDef.id] = 'Wajib dipilih.'
  }

  return errors
}

function VipAssessmentForm({ rules, onSave }: VipAssessmentFormProps) {
  const [form, setForm] = useState<FormState>(defaultFormState)
  const [errors, setErrors] = useState<FormErrors>({})
  const formId = useId()

  const liveResult = useMemo(() => calculateVipScore(form.components, rules), [form.components, rules])

  function updateComponent(componentId: keyof AssessmentComponents, optionId: string) {
    setForm((prev) => ({ ...prev, components: { ...prev.components, [componentId]: optionId } }))
    setErrors((prev) => ({ ...prev, [componentId]: undefined }))
  }

  function updateField<K extends 'date' | 'time' | 'assessedBy' | 'notes'>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  function updatePhoto(dataUrl: string | undefined) {
    setForm((prev) => ({ ...prev, photoImageData: dataUrl }))
  }

  function handleReset() {
    setForm(defaultFormState())
    setErrors({})
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const validationErrors = validate(form, rules)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    onSave(
      {
        date: form.date,
        time: form.time,
        assessedBy: form.assessedBy.trim(),
        components: form.components,
        notes: form.notes.trim() || undefined,
        photoImageData: form.photoImageData,
      },
      liveResult,
    )
  }

  const fieldId = (name: string) => `${formId}-${name}`
  const inputClass = (hasError: boolean) =>
    `w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
      hasError
        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
        : 'border-gray-200 focus:border-teal-700 focus:ring-teal-700'
    }`

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-2"
      >
        <h2 className="mb-1 text-lg font-semibold text-gray-900">Komponen Penilaian VIP Score</h2>
        <p className="mb-4 text-sm text-gray-500">
          VIP Score dihitung berdasarkan hasil observasi sesuai skala VIP (Visual Infusion Phlebitis Scale
          — Jackson).
        </p>

        <div className="flex flex-col gap-5">
          {rules.components.map((componentDef) => (
            <VipAssessmentSection
              key={componentDef.id}
              component={componentDef}
              selectedOptionId={form.components[componentDef.id as keyof AssessmentComponents]}
              onSelect={(optionId) => updateComponent(componentDef.id as keyof AssessmentComponents, optionId)}
              error={errors[componentDef.id]}
            />
          ))}
        </div>

        <div className="mt-6 border-t border-gray-100 pt-5">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">Tambah Foto (Opsional)</p>
            {form.photoImageData && (
              <span className="flex items-center gap-1 text-xs font-medium text-teal-700">
                <CheckCircle2 size={14} />
                Foto ditambahkan
              </span>
            )}
          </div>
          <p className="mb-3 text-xs text-gray-500">
            Ambil atau unggah foto monitoring area insersi untuk dikaitkan langsung dengan penilaian ini.
          </p>
          <PhotoCaptureArea imageData={form.photoImageData} onImageSelected={updatePhoto} onRemove={() => updatePhoto(undefined)} />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 border-t border-gray-100 pt-5 sm:grid-cols-3">
          <div>
            <label htmlFor={fieldId('date')} className="mb-1 block text-sm font-medium text-gray-700">
              Tanggal Penilaian <span className="text-red-500">*</span>
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
              Waktu Penilaian <span className="text-red-500">*</span>
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

          <div>
            <label htmlFor={fieldId('assessedBy')} className="mb-1 block text-sm font-medium text-gray-700">
              Dinilai Oleh <span className="text-red-500">*</span>
            </label>
            <input
              id={fieldId('assessedBy')}
              type="text"
              value={form.assessedBy}
              onChange={(event) => updateField('assessedBy', event.target.value)}
              aria-invalid={Boolean(errors.assessedBy)}
              className={inputClass(Boolean(errors.assessedBy))}
            />
            {errors.assessedBy && <p className="mt-1 text-xs text-red-600">{errors.assessedBy}</p>}
          </div>
        </div>

        <div className="mt-4">
          <label htmlFor={fieldId('notes')} className="mb-1 block text-sm font-medium text-gray-700">
            Catatan (Opsional)
          </label>
          <textarea
            id={fieldId('notes')}
            value={form.notes}
            onChange={(event) => updateField('notes', event.target.value)}
            placeholder="Masukkan catatan hasil observasi..."
            rows={3}
            className={inputClass(false)}
          />
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 active:scale-[0.98]"
          >
            Reset
          </button>
          <button
            type="submit"
            className="rounded-lg bg-teal-800 px-4 py-2 text-sm font-medium text-white hover:bg-teal-900 active:scale-[0.98]"
          >
            Simpan Penilaian
          </button>
        </div>
      </form>

      <div className="lg:col-span-1">
        <VipScoreSummary result={liveResult} />
      </div>
    </div>
  )
}

export default VipAssessmentForm
