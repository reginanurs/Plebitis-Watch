import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Assessment, AssessmentComponents, AssessmentInput } from '../types/assessment'

interface AssessmentRow {
  id: string
  patient_id: string
  pivc_id: string
  date: string
  time: string
  assessed_by: string
  components: AssessmentComponents
  total_score: number | null
  category: string | null
  notes: string | null
  photo_id: string | null
}

function rowToAssessment(row: AssessmentRow): Assessment {
  return {
    id: row.id,
    patientId: row.patient_id,
    pivcId: row.pivc_id,
    date: row.date,
    time: row.time,
    assessedBy: row.assessed_by,
    components: row.components,
    totalScore: row.total_score,
    category: row.category,
    notes: row.notes ?? undefined,
    photoId: row.photo_id ?? undefined,
  }
}

function assessmentToRow(input: AssessmentInput) {
  return {
    patient_id: input.patientId,
    pivc_id: input.pivcId,
    date: input.date,
    time: input.time,
    assessed_by: input.assessedBy,
    components: input.components,
    total_score: input.totalScore,
    category: input.category,
    notes: input.notes ?? null,
    photo_id: input.photoId ?? null,
  }
}

export function useAssessments() {
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    supabase
      .from('assessments')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!isMounted) return
        if (error) {
          console.error('Failed to load assessments:', error)
        } else {
          setAssessments((data as AssessmentRow[]).map(rowToAssessment))
        }
        setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const addAssessment = useCallback(async (input: AssessmentInput): Promise<Assessment> => {
    const { data, error } = await supabase
      .from('assessments')
      .insert({ id: crypto.randomUUID(), ...assessmentToRow(input) })
      .select()
      .single()

    if (error) throw error

    const newAssessment = rowToAssessment(data as AssessmentRow)
    setAssessments((prev) => [newAssessment, ...prev])
    return newAssessment
  }, [])

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
    isLoading,
    addAssessment,
    getAssessmentById,
    getAssessmentsByPatientId,
    getAssessmentsByPivcId,
  }
}
