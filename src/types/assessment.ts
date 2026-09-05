/**
 * Observation inputs for the Visual Infusion Phlebitis (VIP) Scale.
 * Each field holds the selected option id from the matching
 * `VipComponent` in `vipRules.json` — the scoring engine reads these
 * ids, it never reads UI labels.
 */
export interface AssessmentComponents {
  pain: string
  erythema: string
  swelling: string
  venousCord: string
  pyrexia: string
}

export interface Assessment {
  id: string
  patientId: string
  pivcId: string

  date: string
  time: string
  assessedBy: string

  components: AssessmentComponents

  totalScore: number | null
  category: string | null

  notes?: string
  photoId?: string
}

export type AssessmentInput = Omit<Assessment, 'id'>
