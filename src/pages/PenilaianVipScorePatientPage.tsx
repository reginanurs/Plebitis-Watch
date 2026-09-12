import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import PageLoadingState from '../components/PageLoadingState'
import PatientContextCard from '../components/PatientContextCard'
import PivcContextSummary from '../components/pivc/PivcContextSummary'
import Toast from '../components/Toast'
import VipAssessmentForm, { type AssessmentFormValues } from '../components/vip/VipAssessmentForm'
import vipRules from '../data/vipRules.json'
import { useAssessments } from '../hooks/useAssessments'
import { usePatients } from '../hooks/usePatients'
import { usePhotos } from '../hooks/usePhotos'
import { usePivcs } from '../hooks/usePivcs'
import { useReminders } from '../hooks/useReminders'
import { useReminderSettings } from '../hooks/useReminderSettings'
import { todayDateString } from '../utils/datetime'
import type { VipRulesConfig } from '../types/vipRules'
import type { VipScoreResult } from '../utils/vipScore'

const rules = vipRules as VipRulesConfig

function PenilaianVipScorePatientPage() {
  const { patientId } = useParams<{ patientId: string }>()
  const { patients, isLoading } = usePatients()
  const { getActivePivcByPatientId } = usePivcs()
  const { addAssessment } = useAssessments()
  const { addPhoto } = usePhotos()
  const { scheduleNextForPivc } = useReminders()
  const { settings: reminderSettings } = useReminderSettings()
  const navigate = useNavigate()
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const patient = patients.find((item) => item.id === patientId)

  if (isLoading) return <PageLoadingState />

  if (!patient) {
    return (
      <div>
        <PageHeader title="Pasien Tidak Ditemukan" description="Data pasien yang dicari tidak tersedia." />
        <Link
          to="/penilaian"
          className="inline-flex items-center gap-2 rounded-lg border border-teal-700 px-4 py-2 text-sm font-medium text-teal-800 hover:bg-teal-50"
        >
          Kembali ke Penilaian VIP Score
        </Link>
      </div>
    )
  }

  const activePivc = getActivePivcByPatientId(patient.id)

  function handleSave(values: AssessmentFormValues, scoreResult: VipScoreResult) {
    if (!activePivc) return
    const totalScore = scoreResult.status === 'ok' ? scoreResult.totalScore : null

    const newAssessment = addAssessment({
      patientId: patient!.id,
      pivcId: activePivc.id,
      date: values.date,
      time: values.time,
      assessedBy: values.assessedBy,
      components: values.components,
      totalScore,
      category: scoreResult.status === 'ok' ? scoreResult.category : null,
      notes: values.notes,
    })

    // The photo (if captured via the "Tambah Foto" shortcut) can only be
    // permanently linked once the assessment exists and has a real id.
    let photoSaved = false
    if (values.photoImageData) {
      addPhoto({
        patientId: patient!.id,
        pivcId: activePivc.id,
        assessmentId: newAssessment.id,
        imageData: values.photoImageData,
        date: values.date,
        time: values.time,
        insertionSite: activePivc.insertionSite,
        vipScore: totalScore,
        vipCategory: scoreResult.status === 'ok' ? scoreResult.category : null,
        createdBy: values.assessedBy,
      })
      photoSaved = true
    }

    // VIP-Score-aware monitoring interval: score 0/1 reschedule the routine
    // reminder using the configured prototype intervals; score >= 2 does
    // NOT auto-schedule routine monitoring — the recommendation shown on
    // the result becomes the primary next step instead. Falls back to the
    // existing flat default when the score itself is unavailable.
    if (reminderSettings.enabled) {
      const scoreIntervalMinutes =
        totalScore === 0
          ? reminderSettings.scoreBasedIntervals?.score0Minutes
          : totalScore === 1
            ? reminderSettings.scoreBasedIntervals?.score1Minutes
            : undefined

      const shouldSkipRoutineReminder = totalScore !== null && totalScore >= 2

      if (!shouldSkipRoutineReminder) {
        const intervalMinutes = scoreIntervalMinutes ?? reminderSettings.defaultIntervalMinutes
        const source =
          totalScore === 0
            ? 'Prototype — interval per shift berdasarkan VIP Score 0'
            : totalScore === 1
              ? 'Prototype — interval 4 jam berdasarkan VIP Score 1'
              : reminderSettings.source

        if (intervalMinutes !== null && intervalMinutes !== undefined) {
          scheduleNextForPivc({
            patientId: patient!.id,
            pivcId: activePivc.id,
            basedOnAssessmentId: newAssessment.id,
            fromAt: `${values.date}T${values.time}:00`,
            intervalMinutes,
            source,
            triggerType: 'vip_score',
          })
        }
      }
    }

    const assessmentMessage =
      scoreResult.status === 'ok'
        ? 'Penilaian VIP Score berhasil disimpan.'
        : 'Data observasi berhasil disimpan. Skor belum dapat dihitung karena masih ada komponen yang belum dipilih.'
    setToastMessage(photoSaved ? `${assessmentMessage} Foto monitoring turut disimpan.` : assessmentMessage)
  }

  return (
    <div>
      <PageHeader
        title="Penilaian VIP Score"
        description="Lakukan observasi pada area insersi PIVC dan pilih kondisi yang sesuai pada setiap kategori."
      />

      <div className="mb-6">
        <PatientContextCard patient={patient} onViewDetail={() => navigate(`/pasien/${patient.id}`)} />
      </div>

      {!activePivc ? (
        <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50 p-6 text-center text-amber-800">
          <p className="mb-3">
            Pasien ini belum memiliki PIVC aktif. Penilaian VIP Score memerlukan konteks PIVC yang
            sedang terpasang.
          </p>
          <Link
            to={`/pivc/${patient.id}`}
            className="inline-flex items-center gap-2 rounded-lg bg-teal-800 px-4 py-2 text-sm font-medium text-white hover:bg-teal-900"
          >
            Pasang PIVC Baru
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <PivcContextSummary pivc={activePivc} referenceDate={todayDateString()} />
          </div>
          <VipAssessmentForm rules={rules} onSave={handleSave} />
        </>
      )}

      {toastMessage && <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />}
    </div>
  )
}

export default PenilaianVipScorePatientPage
