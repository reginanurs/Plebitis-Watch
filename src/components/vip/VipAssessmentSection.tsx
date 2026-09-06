import type { VipComponent } from '../../types/vipRules'
import VipOptionButton from './VipOptionButton'

interface VipAssessmentSectionProps {
  component: VipComponent
  selectedOptionId: string
  onSelect: (optionId: string) => void
  error?: string
}

function VipAssessmentSection({ component, selectedOptionId, onSelect, error }: VipAssessmentSectionProps) {
  return (
    <div>
      <p className="mb-1 text-sm font-medium text-gray-700">
        {component.order}. {component.label}
      </p>
      {component.helperText && <p className="mb-2 text-xs text-gray-400">{component.helperText}</p>}
      <div className="flex flex-wrap gap-2">
        {component.options.map((option) => (
          <VipOptionButton
            key={option.id}
            label={option.label}
            selected={selectedOptionId === option.id}
            onSelect={() => onSelect(option.id)}
          />
        ))}
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

export default VipAssessmentSection
