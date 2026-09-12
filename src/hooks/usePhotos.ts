import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { PhotoRecord, PhotoRecordInput } from '../types/photo'

const BUCKET = 'photos'
const SIGNED_URL_TTL_SECONDS = 3600

interface PhotoRow {
  id: string
  patient_id: string
  pivc_id: string
  assessment_id: string | null
  storage_path: string
  date: string
  time: string
  insertion_site: string
  vip_score: number | null
  vip_category: string | null
  note: string | null
  created_by: string
}

function rowToPhoto(row: PhotoRow, signedUrl: string): PhotoRecord {
  return {
    id: row.id,
    patientId: row.patient_id,
    pivcId: row.pivc_id,
    assessmentId: row.assessment_id ?? undefined,
    imageData: signedUrl,
    storagePath: row.storage_path,
    date: row.date,
    time: row.time,
    insertionSite: row.insertion_site,
    vipScore: row.vip_score,
    vipCategory: row.vip_category,
    note: row.note ?? undefined,
    createdBy: row.created_by,
  }
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const response = await fetch(dataUrl)
  return response.blob()
}

function extensionFromDataUrl(dataUrl: string): string {
  const match = /^data:image\/(\w+)/.exec(dataUrl)
  const subtype = match?.[1] ?? 'jpeg'
  return subtype === 'svg+xml' ? 'svg' : subtype
}

export function usePhotos() {
  const [photos, setPhotos] = useState<PhotoRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function load() {
      const { data, error } = await supabase.from('photos').select('*').order('created_at', { ascending: false })
      if (!isMounted) return
      if (error) {
        console.error('Failed to load photos:', error)
        setIsLoading(false)
        return
      }

      const rows = data as PhotoRow[]
      if (rows.length === 0) {
        setPhotos([])
        setIsLoading(false)
        return
      }

      const { data: signedUrls, error: signError } = await supabase.storage
        .from(BUCKET)
        .createSignedUrls(
          rows.map((row) => row.storage_path),
          SIGNED_URL_TTL_SECONDS,
        )
      if (!isMounted) return
      if (signError) {
        console.error('Failed to sign photo URLs:', signError)
        setIsLoading(false)
        return
      }

      setPhotos(rows.map((row, index) => rowToPhoto(row, signedUrls[index]?.signedUrl ?? '')))
      setIsLoading(false)
    }

    load()

    return () => {
      isMounted = false
    }
  }, [])

  const addPhoto = useCallback(async (input: PhotoRecordInput): Promise<PhotoRecord> => {
    const blob = await dataUrlToBlob(input.imageData)
    const storagePath = `${input.patientId}/${input.pivcId}/${crypto.randomUUID()}.${extensionFromDataUrl(input.imageData)}`

    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(storagePath, blob, {
      contentType: blob.type || 'image/jpeg',
    })
    if (uploadError) throw uploadError

    const { data, error: insertError } = await supabase
      .from('photos')
      .insert({
        id: crypto.randomUUID(),
        patient_id: input.patientId,
        pivc_id: input.pivcId,
        assessment_id: input.assessmentId ?? null,
        storage_path: storagePath,
        date: input.date,
        time: input.time,
        insertion_site: input.insertionSite,
        vip_score: input.vipScore,
        vip_category: input.vipCategory,
        note: input.note ?? null,
        created_by: input.createdBy,
      })
      .select()
      .single()

    if (insertError) {
      await supabase.storage.from(BUCKET).remove([storagePath])
      throw insertError
    }

    const { data: signedUrlData, error: signError } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(storagePath, SIGNED_URL_TTL_SECONDS)
    if (signError) throw signError

    const newPhoto = rowToPhoto(data as PhotoRow, signedUrlData.signedUrl)
    setPhotos((prev) => [newPhoto, ...prev])
    return newPhoto
  }, [])

  // Not called anywhere in the app yet (no UI edits a photo's metadata after
  // capture) — only updates DB columns, does not support replacing the image.
  const updatePhoto = useCallback(async (updated: PhotoRecord) => {
    const { error } = await supabase
      .from('photos')
      .update({
        assessment_id: updated.assessmentId ?? null,
        date: updated.date,
        time: updated.time,
        insertion_site: updated.insertionSite,
        vip_score: updated.vipScore,
        vip_category: updated.vipCategory,
        note: updated.note ?? null,
      })
      .eq('id', updated.id)
    if (error) throw error
    setPhotos((prev) => prev.map((photo) => (photo.id === updated.id ? updated : photo)))
  }, [])

  const removePhoto = useCallback(
    async (id: string) => {
      const target = photos.find((photo) => photo.id === id)
      const { error } = await supabase.from('photos').delete().eq('id', id)
      if (error) throw error
      if (target) await supabase.storage.from(BUCKET).remove([target.storagePath])
      setPhotos((prev) => prev.filter((photo) => photo.id !== id))
    },
    [photos],
  )

  const getPhotoById = useCallback((id: string) => photos.find((photo) => photo.id === id), [photos])

  const getPhotosByPatientId = useCallback(
    (patientId: string) => photos.filter((photo) => photo.patientId === patientId),
    [photos],
  )

  const getPhotosByPivcId = useCallback(
    (pivcId: string) => photos.filter((photo) => photo.pivcId === pivcId),
    [photos],
  )

  const getPhotosByAssessmentId = useCallback(
    (assessmentId: string) => photos.filter((photo) => photo.assessmentId === assessmentId),
    [photos],
  )

  return {
    photos,
    isLoading,
    addPhoto,
    updatePhoto,
    removePhoto,
    getPhotoById,
    getPhotosByPatientId,
    getPhotosByPivcId,
    getPhotosByAssessmentId,
  }
}
