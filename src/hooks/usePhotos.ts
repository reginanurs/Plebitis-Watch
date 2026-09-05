import { useCallback } from 'react'
import photosSeed from '../data/photos.json'
import type { PhotoRecord, PhotoRecordInput } from '../types/photo'
import { useLocalStorageState } from './useLocalStorageState'

const STORAGE_KEY = 'plebitis-watch.photoRecords'

export function usePhotos() {
  const [photos, setPhotos] = useLocalStorageState<PhotoRecord[]>(STORAGE_KEY, photosSeed as PhotoRecord[])

  const addPhoto = useCallback(
    (input: PhotoRecordInput): PhotoRecord => {
      const newPhoto: PhotoRecord = { ...input, id: crypto.randomUUID() }
      setPhotos((prev) => [newPhoto, ...prev])
      return newPhoto
    },
    [setPhotos],
  )

  const updatePhoto = useCallback(
    (updated: PhotoRecord) => {
      setPhotos((prev) => prev.map((photo) => (photo.id === updated.id ? updated : photo)))
    },
    [setPhotos],
  )

  const removePhoto = useCallback(
    (id: string) => {
      setPhotos((prev) => prev.filter((photo) => photo.id !== id))
    },
    [setPhotos],
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
    addPhoto,
    updatePhoto,
    removePhoto,
    getPhotoById,
    getPhotosByPatientId,
    getPhotosByPivcId,
    getPhotosByAssessmentId,
  }
}
