export type PivcStatus = 'active' | 'removed'

export interface Pivc {
  id: string
  patientId: string

  installationDate: string
  installationTime: string

  insertionSite: string
  extremitySide: string

  catheterType: string
  therapy: string

  /** Who performed the PIVC insertion — distinct from an assessment's "assessedBy" (who did the monitoring). */
  insertedBy?: string

  purpose?: string
  additionalNotes?: string

  initialPhotoId?: string

  status: PivcStatus
}

export type PivcInput = Omit<Pivc, 'id' | 'status'>
