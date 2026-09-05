export interface PhotoRecord {
  id: string
  patientId: string
  pivcId: string

  assessmentId?: string

  imageData: string

  date: string
  time: string

  insertionSite: string

  vipScore: number | null
  vipCategory: string | null

  note?: string

  createdBy: string
}

export type PhotoRecordInput = Omit<PhotoRecord, 'id'>
