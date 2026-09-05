export interface RecommendationAction {
  id: string
  title: string
  description?: string
}

export interface RecommendationRule {
  id: string
  category: string
  title: string
  description?: string
  actions: RecommendationAction[]
  source?: string
  status: 'pending' | 'active'
}

export type RecommendationClinicalStatus = 'pending' | 'confirmed'

export interface RecommendationConfig {
  clinicalStatus: RecommendationClinicalStatus
  rules: RecommendationRule[]
  note?: string
}
