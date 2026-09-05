import type { Assessment } from '../types/assessment'
import type { RecommendationConfig, RecommendationRule } from '../types/recommendation'

export type RecommendationResult =
  | { status: 'pending_category'; reason: string }
  | { status: 'pending_rules'; reason: string }
  | { status: 'ok'; rule: RecommendationRule }

/**
 * Resolves the recommendation for a saved assessment using ONLY the
 * configured rules — it never calculates, infers, or falls back to a
 * default recommendation. If the assessment's category is null, or no
 * active rule is configured for that category, this returns a
 * pending state instead of guessing.
 */
export function getRecommendationForAssessment(
  assessment: Assessment,
  config: RecommendationConfig,
): RecommendationResult {
  if (assessment.category === null) {
    return {
      status: 'pending_category',
      reason: 'Kategori VIP Score belum tersedia, sehingga rekomendasi belum dapat ditentukan.',
    }
  }

  if (config.clinicalStatus !== 'confirmed') {
    return { status: 'pending_rules', reason: 'Rekomendasi tindak lanjut belum dikonfigurasi.' }
  }

  const matchedRule = config.rules.find(
    (rule) => rule.category === assessment.category && rule.status === 'active',
  )

  if (!matchedRule) {
    return { status: 'pending_rules', reason: 'Rekomendasi tindak lanjut belum dikonfigurasi.' }
  }

  return { status: 'ok', rule: matchedRule }
}
