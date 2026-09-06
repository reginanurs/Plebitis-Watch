export interface RecommendationAction {
  id: string
  title: string
  description?: string
}

export interface RecommendationRule {
  id: string
  /** Primary match key — the exact VIP Score (0-5) this rule applies to. */
  score: number
  /** VIP Score category label, kept for display only; not used for matching. */
  category: string
  title: string
  description?: string
  actions: RecommendationAction[]
  source?: string
  /** True when this rule still requires confirmation against a real facility SOP/protocol. */
  facilitySopRequired?: boolean
  status: 'pending' | 'active'
}

/**
 * "pending": no rules configured at all.
 * "prototype": rules exist but are a prototype/demo proposal, not a
 * clinically validated or facility-confirmed protocol.
 * "confirmed": rules have been explicitly sourced from a real facility
 * SOP/protocol.
 */
export type RecommendationClinicalStatus = 'pending' | 'prototype' | 'confirmed'

export interface RecommendationConfig {
  clinicalStatus: RecommendationClinicalStatus
  rules: RecommendationRule[]
  note?: string
}
