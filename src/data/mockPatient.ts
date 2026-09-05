import type { Patient } from '../types/patient'

/**
 * UI-demo-only sample patient, matching the reference screenshots,
 * used to preview the shared shell components. Not persisted app data.
 */
export const mockPatient: Patient = {
  id: 'demo-1',
  name: 'Ny. Siti Aisyah',
  medicalRecordNumber: 'RM00012345',
  gender: 'Perempuan',
  dateOfBirth: '1994-03-12',
  room: 'Mawar 2',
  bed: '05',
}
