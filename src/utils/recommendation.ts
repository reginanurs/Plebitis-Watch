import type { Assessment } from '../types/assessment'
import type { RecommendationConfig, RecommendationRule } from '../types/recommendation'

export type RecommendationResult =
  | { status: 'pending_category'; reason: string }
  | { status: 'pending_rules'; reason: string }
  | { status: 'ok'; rule: RecommendationRule }

/**
 * Resolves the recommendation for a given VIP Score using ONLY the
 * configured rules — it never calculates, infers, or falls back to a
 * default recommendation. If `score` is null, or no active rule is
 * configured for that exact score, this returns a pending state
 * instead of guessing.
 *
 * This is the single source of truth for recommendation matching —
 * both the live preview shown while an assessment is being filled in
 * and the saved Result page call this with the same score value.
 */
export function getRecommendationForScore(
  score: number | null,
  config: RecommendationConfig,
): RecommendationResult {
  if (score === null) {
    return {
      status: 'pending_category',
      reason: 'VIP Score belum tersedia, sehingga rekomendasi belum dapat ditentukan.',
    }
  }

  if (config.clinicalStatus === 'pending') {
    return { status: 'pending_rules', reason: 'Rekomendasi tindak lanjut belum dikonfigurasi.' }
  }

  const matchedRule = config.rules.find((rule) => rule.score === score && rule.status === 'active')

  if (!matchedRule) {
    return { status: 'pending_rules', reason: 'Rekomendasi tindak lanjut belum dikonfigurasi.' }
  }

  return { status: 'ok', rule: matchedRule }
}

/** Convenience wrapper for a saved assessment — reads its stored `totalScore`, never recalculates. */
export function getRecommendationForAssessment(
  assessment: Assessment,
  config: RecommendationConfig,
): RecommendationResult {
  return getRecommendationForScore(assessment.totalScore, config)
}
