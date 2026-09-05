export type Gender = 'Laki-laki' | 'Perempuan'

export interface Patient {
  id: string
  medicalRecordNumber: string
  name: string
  dateOfBirth: string
  gender: Gender
  room: string
  bed: string
  address?: string
  notes?: string
}

export type PatientInput = Omit<Patient, 'id'>
