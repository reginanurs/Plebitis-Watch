import { useCallback } from 'react'
import pivcSeed from '../data/pivc.json'
import type { Pivc, PivcInput } from '../types/pivc'
import { useLocalStorageState } from './useLocalStorageState'

const STORAGE_KEY = 'plebitis-watch.pivcs'

export function usePivcs() {
  const [pivcs, setPivcs] = useLocalStorageState<Pivc[]>(STORAGE_KEY, pivcSeed as Pivc[])

  const addPivc = useCallback(
    (input: PivcInput): Pivc => {
      const newPivc: Pivc = { ...input, id: crypto.randomUUID(), status: 'active' }
      setPivcs((prev) => [newPivc, ...prev])
      return newPivc
    },
    [setPivcs],
  )

  const updatePivc = useCallback(
    (updated: Pivc) => {
      setPivcs((prev) => prev.map((pivc) => (pivc.id === updated.id ? updated : pivc)))
    },
    [setPivcs],
  )

  const markAsRemoved = useCallback(
    (id: string) => {
      setPivcs((prev) => prev.map((pivc) => (pivc.id === id ? { ...pivc, status: 'removed' } : pivc)))
    },
    [setPivcs],
  )

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
    addPivc,
    updatePivc,
    markAsRemoved,
    getPivcById,
    getPivcsByPatientId,
    getActivePivcByPatientId,
  }
}
