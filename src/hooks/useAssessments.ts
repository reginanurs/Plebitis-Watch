import { useCallback } from 'react'
import assessmentsSeed from '../data/assessments.json'
import type { Assessment, AssessmentInput } from '../types/assessment'
import { useLocalStorageState } from './useLocalStorageState'

const STORAGE_KEY = 'plebitis-watch.assessments'

export function useAssessments() {
  const [assessments, setAssessments] = useLocalStorageState<Assessment[]>(
    STORAGE_KEY,
    assessmentsSeed as Assessment[],
  )

  const addAssessment = useCallback(
    (input: AssessmentInput): Assessment => {
      const newAssessment: Assessment = { ...input, id: crypto.randomUUID() }
      setAssessments((prev) => [newAssessment, ...prev])
      return newAssessment
    },
    [setAssessments],
  )

  const getAssessmentById = useCallback(
    (id: string) => assessments.find((assessment) => assessment.id === id),
    [assessments],
  )

  const getAssessmentsByPatientId = useCallback(
    (patientId: string) => assessments.filter((assessment) => assessment.patientId === patientId),
    [assessments],
  )

  const getAssessmentsByPivcId = useCallback(
    (pivcId: string) => assessments.filter((assessment) => assessment.pivcId === pivcId),
    [assessments],
  )

  return {
    assessments,
    addAssessment,
    getAssessmentById,
    getAssessmentsByPatientId,
    getAssessmentsByPivcId,
  }
}
