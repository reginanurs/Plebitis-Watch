/**
 * Configuration schema for the VIP Score scoring engine.
 *
 * Source: Visual Infusion Phlebitis Scale (Jackson). The scale is
 * criterion-based and hierarchical — a score is reached by a specific
 * combination of signs being present, not by summing independent
 * point values per field. See `src/utils/vipScore.ts` for how `rules`
 * below is evaluated.
 */
export type VipSignId = 'pain' | 'erythema' | 'swelling' | 'induration' | 'venousCord' | 'pyrexia'

export interface VipOption {
  id: string
  label: string
  /** Does selecting this option mean the sign is clinically present at the IV site? */
  meetsSign: boolean
  /** Pain only: does this option meet the stricter "along path of cannula" tier? */
  meetsSevereSign?: boolean
}

export interface VipComponent {
  id: VipSignId
  label: string
  order: number
  options: VipOption[]
  /** Optional short clarifying line shown under the label (e.g. plain-language meaning of a clinical term). */
  helperText?: string
}

/**
 * A single score tier, evaluated top-down; the first rule whose
 * condition is satisfied wins. Exactly one of `requires` /
 * `countAtLeast` / `anyOf` should be set — a rule with none of them
 * always matches (used for the score-0 fallback).
 */
export interface VipScoreRule {
  score: number
  /** ALL listed flags must equal the given boolean. */
  requires?: Partial<Record<'severePain' | VipSignId, boolean>>
  /** COUNT >= n of the listed signs must be present. */
  countAtLeast?: { count: number; from: VipSignId[] }
  /** ANY of the listed signs must be present. */
  anyOf?: VipSignId[]
}

export interface VipCategoryRule {
  score: number
  label: string
  color?: string
}

export type VipRulesClinicalStatus = 'pending' | 'confirmed'

export interface VipRulesConfig {
  clinicalStatus: VipRulesClinicalStatus
  source: string
  scale: string
  maxScore: number
  note?: string
  components: VipComponent[]
  rules: VipScoreRule[]
  categories: VipCategoryRule[]
}
