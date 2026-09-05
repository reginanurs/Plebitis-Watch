import type { AssessmentComponents } from '../types/assessment'
import type { VipRulesConfig, VipScoreRule, VipSignId } from '../types/vipRules'

export type VipScoreResult =
  | { status: 'incomplete_selection'; reason: string }
  | { status: 'ok'; totalScore: number; category: string | null }

interface SignFlags {
  present: boolean
  severe: boolean
}

const EMPTY_FLAGS: SignFlags = { present: false, severe: false }

/**
 * Calculates the VIP Score (Visual Infusion Phlebitis Scale — Jackson)
 * from the selected observation options, using the hierarchical rule
 * tiers in `rules.rules`. Rules are evaluated in order; the first
 * matching tier wins (higher/more specific tiers are listed first).
 *
 * This is a criterion-based scale, not a sum of independent points —
 * e.g. a palpable venous cord alone does not add +1 to a lower score,
 * it only matters as part of the score 4/5 combinations.
 */
export function calculateVipScore(
  components: AssessmentComponents,
  rules: VipRulesConfig,
): VipScoreResult {
  const signFlags = new Map<VipSignId, SignFlags>()

  for (const componentDef of rules.components) {
    const selectedOptionId = components[componentDef.id as keyof AssessmentComponents]
    if (!selectedOptionId) {
      return { status: 'incomplete_selection', reason: `Pilihan untuk "${componentDef.label}" belum dipilih.` }
    }

    const option = componentDef.options.find((candidate) => candidate.id === selectedOptionId)
    if (!option) {
      return { status: 'incomplete_selection', reason: `Pilihan untuk "${componentDef.label}" tidak valid.` }
    }

    signFlags.set(componentDef.id, { present: option.meetsSign, severe: option.meetsSevereSign ?? false })
  }

  const getFlags = (id: VipSignId) => signFlags.get(id) ?? EMPTY_FLAGS

  const matchedRule = rules.rules.find((rule) => matchesRule(rule, getFlags))
  const totalScore = matchedRule?.score ?? 0
  const categoryRule = rules.categories.find((candidate) => candidate.score === totalScore)

  return { status: 'ok', totalScore, category: categoryRule?.label ?? null }
}

function matchesRule(rule: VipScoreRule, getFlags: (id: VipSignId) => SignFlags): boolean {
  if (rule.requires) {
    for (const [key, expected] of Object.entries(rule.requires)) {
      const actual = key === 'severePain' ? getFlags('pain').severe : getFlags(key as VipSignId).present
      if (actual !== expected) return false
    }
  }

  if (rule.countAtLeast) {
    const count = rule.countAtLeast.from.filter((id) => getFlags(id).present).length
    if (count < rule.countAtLeast.count) return false
  }

  if (rule.anyOf && !rule.anyOf.some((id) => getFlags(id).present)) {
    return false
  }

  return true
}
