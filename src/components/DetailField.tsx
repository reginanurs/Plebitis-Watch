interface DetailFieldProps {
  label: string
  value: string
}

function DetailField({ label, value }: DetailFieldProps) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-gray-400">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-gray-800">{value}</dd>
    </div>
  )
}

export default DetailField
