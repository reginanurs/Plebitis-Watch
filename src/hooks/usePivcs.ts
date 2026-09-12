import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Pivc, PivcInput, PivcStatus } from '../types/pivc'

interface PivcRow {
  id: string
  patient_id: string
  installation_date: string
  installation_time: string
  insertion_site: string
  extremity_side: string
  catheter_type: string
  therapy: string
  inserted_by: string | null
  purpose: string | null
  additional_notes: string | null
  initial_photo_id: string | null
  status: PivcStatus
}

function rowToPivc(row: PivcRow): Pivc {
  return {
    id: row.id,
    patientId: row.patient_id,
    installationDate: row.installation_date,
    installationTime: row.installation_time,
    insertionSite: row.insertion_site,
    extremitySide: row.extremity_side,
    catheterType: row.catheter_type,
    therapy: row.therapy,
    insertedBy: row.inserted_by ?? undefined,
    purpose: row.purpose ?? undefined,
    additionalNotes: row.additional_notes ?? undefined,
    initialPhotoId: row.initial_photo_id ?? undefined,
    status: row.status,
  }
}

function pivcToRow(input: PivcInput) {
  return {
    patient_id: input.patientId,
    installation_date: input.installationDate,
    installation_time: input.installationTime,
    insertion_site: input.insertionSite,
    extremity_side: input.extremitySide,
    catheter_type: input.catheterType,
    therapy: input.therapy,
    inserted_by: input.insertedBy ?? null,
    purpose: input.purpose ?? null,
    additional_notes: input.additionalNotes ?? null,
    initial_photo_id: input.initialPhotoId ?? null,
  }
}

export function usePivcs() {
  const [pivcs, setPivcs] = useState<Pivc[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    supabase
      .from('pivcs')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!isMounted) return
        if (error) {
          console.error('Failed to load PIVCs:', error)
        } else {
          setPivcs((data as PivcRow[]).map(rowToPivc))
        }
        setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const addPivc = useCallback(async (input: PivcInput): Promise<Pivc> => {
    const { data, error } = await supabase
      .from('pivcs')
      .insert({ id: crypto.randomUUID(), ...pivcToRow(input), status: 'active' })
      .select()
      .single()

    if (error) throw error

    const newPivc = rowToPivc(data as PivcRow)
    setPivcs((prev) => [newPivc, ...prev])
    return newPivc
  }, [])

  const updatePivc = useCallback(async (updated: Pivc) => {
    const { error } = await supabase
      .from('pivcs')
      .update({ ...pivcToRow(updated), status: updated.status })
      .eq('id', updated.id)
    if (error) throw error
    setPivcs((prev) => prev.map((pivc) => (pivc.id === updated.id ? updated : pivc)))
  }, [])

  const markAsRemoved = useCallback(async (id: string) => {
    const { error } = await supabase.from('pivcs').update({ status: 'removed' }).eq('id', id)
    if (error) throw error
    setPivcs((prev) => prev.map((pivc) => (pivc.id === id ? { ...pivc, status: 'removed' } : pivc)))
  }, [])

  const getPivcById = useCallback((id: string) => pivcs.find((pivc) => pivc.id === id), [pivcs])

  const getPivcsByPatientId = useCallback(
    (patientId: string) => pivcs.filter((pivc) => pivc.patientId === patientId),
    [pivcs],
  )

  const getActivePivcByPatientId = useCallback(
    (patientId: string) => pivcs.find((pivc) => pivc.patientId === patientId && pivc.status === 'active'),
    [pivcs],
  )

  return {
    pivcs,
    isLoading,
    addPivc,
    updatePivc,
    markAsRemoved,
    getPivcById,
    getPivcsByPatientId,
    getActivePivcByPatientId,
  }
}
