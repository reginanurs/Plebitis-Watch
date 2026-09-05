import { useCallback } from 'react'
import patientsSeed from '../data/patients.json'
import type { Patient, PatientInput } from '../types/patient'
import { useLocalStorageState } from './useLocalStorageState'

const STORAGE_KEY = 'plebitis-watch.patients'

export function usePatients() {
  const [patients, setPatients] = useLocalStorageState<Patient[]>(STORAGE_KEY, patientsSeed as Patient[])

  const addPatient = useCallback(
    (input: PatientInput): Patient => {
      const newPatient: Patient = { ...input, id: crypto.randomUUID() }
      setPatients((prev) => [newPatient, ...prev])
      return newPatient
    },
    [setPatients],
  )

  const updatePatient = useCallback(
    (updated: Patient) => {
      setPatients((prev) => prev.map((patient) => (patient.id === updated.id ? updated : patient)))
    },
    [setPatients],
  )

  const deletePatient = useCallback(
    (id: string) => {
      setPatients((prev) => prev.filter((patient) => patient.id !== id))
    },
    [setPatients],
  )

  return { patients, addPatient, updatePatient, deletePatient }
}
