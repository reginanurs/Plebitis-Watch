interface VipOptionButtonProps {
  label: string
  selected: boolean
  onSelect: () => void
}

function VipOptionButton({ label, selected, onSelect }: VipOptionButtonProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-1 ${
        selected
          ? 'border-teal-700 bg-teal-50 text-teal-800'
          : 'border-gray-200 text-gray-600 hover:border-teal-200 hover:bg-teal-50/40'
      }`}
    >
      <span
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
          selected ? 'border-teal-700' : 'border-gray-300'
        }`}
      >
        <span
          className={`h-2 w-2 rounded-full bg-teal-700 transition-all duration-150 ${
            selected ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
          }`}
        />
      </span>
      {label}
    </button>
  )
}

export default VipOptionButton
