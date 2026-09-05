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

  purpose?: string
  additionalNotes?: string

  insertionDifficulty: boolean
  insertedByAnotherNurse: boolean

  initialPhotoId?: string

  status: PivcStatus
}

export type PivcInput = Omit<Pivc, 'id' | 'status'>
