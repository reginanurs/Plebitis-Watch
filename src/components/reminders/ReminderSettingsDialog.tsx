import { useEffect, useId, useState, type FormEvent } from 'react'
import type { ReminderIntervalUnit, ReminderSettings } from '../../types/reminderSettings'
import { convertFromMinutes, convertToMinutes } from '../../utils/reminder'

interface ReminderSettingsDialogProps {
  open: boolean
  settings: ReminderSettings
  onSave: (settings: ReminderSettings) => void
  onCancel: () => void
}

const UNIT_OPTIONS: { value: ReminderIntervalUnit; label: string }[] = [
  { value: 'minutes', label: 'Menit' },
  { value: 'hours', label: 'Jam' },
  { value: 'days', label: 'Hari' },
]

function ReminderSettingsDialog({ open, settings, onSave, onCancel }: ReminderSettingsDialogProps) {
  const initialSplit = convertFromMinutes(settings.defaultIntervalMinutes ?? 240)
  const [enabled, setEnabled] = useState(settings.enabled)
  const [value, setValue] = useState(String(initialSplit.value))
  const [unit, setUnit] = useState<ReminderIntervalUnit>(initialSplit.unit)
  const [source, setSource] = useState(settings.source ?? '')
  const [error, setError] = useState<string | null>(null)
  const formId = useId()

  useEffect(() => {
    if (!open) return
    const split = convertFromMinutes(settings.defaultIntervalMinutes ?? 240)
    setEnabled(settings.enabled)
    setValue(String(split.value))
    setUnit(split.unit)
    setSource(settings.source ?? '')
    setError(null)
  }, [open, settings])

  useEffect(() => {
    if (!open) return
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onCancel])

  if (!open) return null

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const numericValue = Number(value)

    if (!Number.isFinite(numericValue) || numericValue <= 0) {
      setError('Nilai interval harus berupa angka lebih dari 0.')
      return
    }

    const trimmedSource = source.trim()

    onSave({
      enabled,
      defaultIntervalMinutes: convertToMinutes(numericValue, unit),
      intervalUnit: unit,
      source: trimmedSource || null,
      clinicalStatus: trimmedSource ? 'confirmed' : 'pending',
    })
  }

  return (
    <div role="dialog" aria-modal="true" aria-labelledby={`${formId}-title`} className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onCancel} aria-hidden="true" />
      <form
        onSubmit={handleSubmit}
        noValidate
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
      >
        <h2 id={`${formId}-title`} className="mb-1 text-lg font-semibold text-gray-900">
          Pengaturan Reminder
        </h2>
        <p className="mb-4 text-sm text-gray-500">
          Atur interval pemantauan sesuai kebijakan dan kondisi pasien.
        </p>

        <label className="mb-4 flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(event) => setEnabled(event.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-teal-700 focus:ring-teal-700"
          />
          Aktifkan reminder monitoring
        </label>

        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label htmlFor={`${formId}-value`} className="mb-1 block text-sm font-medium text-gray-700">
              Interval
            </label>
            <input
              id={`${formId}-value`}
              type="number"
              min="1"
              step="1"
              value={value}
              onChange={(event) => {
                setValue(event.target.value)
                setError(null)
              }}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
            />
          </div>
          <div>
            <label htmlFor={`${formId}-unit`} className="mb-1 block text-sm font-medium text-gray-700">
              Satuan
            </label>
            <select
              id={`${formId}-unit`}
              value={unit}
              onChange={(event) => setUnit(event.target.value as ReminderIntervalUnit)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
            >
              {UNIT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && <p className="mb-4 text-xs text-red-600">{error}</p>}

        <div className="mb-2">
          <label htmlFor={`${formId}-source`} className="mb-1 block text-sm font-medium text-gray-700">
            Sumber / Konteks Interval (Opsional)
          </label>
          <input
            id={`${formId}-source`}
            type="text"
            value={source}
            onChange={(event) => setSource(event.target.value)}
            placeholder="Contoh: SOP Unit, kebijakan fasilitas, pengaturan pasien"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
          />
          <p className="mt-1 text-xs text-gray-400">
            Interval ini bukan standar klinis universal — sesuaikan dengan kondisi pasien dan
            kebijakan fasilitas.
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
    </div>
  )
}

export default ReminderSettingsDialog
