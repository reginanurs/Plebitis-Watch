export interface PhotoRecord {
  id: string
  patientId: string
  pivcId: string

  assessmentId?: string

  /**
   * Context-dependent: on `PhotoRecordInput` (write), this is the raw
   * base64 data URL captured from the camera/file input, uploaded to
   * Supabase Storage by `usePhotos`. On `PhotoRecord` (read), it has
   * already been replaced with a resolved signed URL pointing at that
   * stored object — components should just render it as an `<img src>`
   * either way and never assume which form it's in.
   */
  imageData: string

  /** Storage object path (bucket `photos`), used internally by `usePhotos` for update/delete — not for display. */
  storagePath: string

  date: string
  time: string

  insertionSite: string

  vipScore: number | null
  vipCategory: string | null

  note?: string

  createdBy: string
}

export type PhotoRecordInput = Omit<PhotoRecord, 'id' | 'storagePath'>
