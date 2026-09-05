import { Search } from 'lucide-react'

interface PatientSearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  ariaLabel?: string
}

function PatientSearchInput({
  value,
  onChange,
  placeholder = 'Cari pasien...',
  ariaLabel = 'Cari pasien',
}: PatientSearchInputProps) {
  return (
    <div className="relative w-full sm:max-w-xs">
      <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
      />
    </div>
  )
}

export default PatientSearchInput
