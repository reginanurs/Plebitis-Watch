import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Patient, PatientInput } from '../types/patient'

interface PatientRow {
  id: string
  medical_record_number: string
  name: string
  date_of_birth: string
  gender: Patient['gender']
  room: string
  bed: string
  address: string | null
  notes: string | null
}

function rowToPatient(row: PatientRow): Patient {
  return {
    id: row.id,
    medicalRecordNumber: row.medical_record_number,
    name: row.name,
    dateOfBirth: row.date_of_birth,
    gender: row.gender,
    room: row.room,
    bed: row.bed,
    address: row.address ?? undefined,
    notes: row.notes ?? undefined,
  }
}

function patientToRow(input: PatientInput) {
  return {
    medical_record_number: input.medicalRecordNumber,
    name: input.name,
    date_of_birth: input.dateOfBirth,
    gender: input.gender,
    room: input.room,
    bed: input.bed,
    address: input.address ?? null,
    notes: input.notes ?? null,
  }
}

export function usePatients() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    supabase
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!isMounted) return
        if (error) {
          console.error('Failed to load patients:', error)
        } else {
          setPatients((data as PatientRow[]).map(rowToPatient))
        }
        setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const addPatient = useCallback(async (input: PatientInput): Promise<Patient> => {
    const { data, error } = await supabase
      .from('patients')
      .insert({ id: crypto.randomUUID(), ...patientToRow(input) })
      .select()
      .single()

    if (error) throw error

    const newPatient = rowToPatient(data as PatientRow)
    setPatients((prev) => [newPatient, ...prev])
    return newPatient
  }, [])

  const updatePatient = useCallback(async (updated: Patient) => {
    const { error } = await supabase.from('patients').update(patientToRow(updated)).eq('id', updated.id)
    if (error) throw error
    setPatients((prev) => prev.map((patient) => (patient.id === updated.id ? updated : patient)))
  }, [])

  const deletePatient = useCallback(async (id: string) => {
    const { error } = await supabase.from('patients').delete().eq('id', id)
    if (error) throw error
    setPatients((prev) => prev.filter((patient) => patient.id !== id))
  }, [])

  return { patients, isLoading, addPatient, updatePatient, deletePatient }
}
