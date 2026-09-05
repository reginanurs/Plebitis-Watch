import AssessmentPicker from '../components/assessments/AssessmentPicker'

function HasilPenilaianPage() {
  return (
    <AssessmentPicker
      title="Hasil Penilaian VIP Score"
      pickerDescription="Pilih pasien untuk melihat riwayat hasil penilaian VIP Score."
      listDescriptionPrefix="Daftar penilaian VIP Score milik"
      emptyStateMessage="Pasien ini belum memiliki penilaian VIP Score."
      buildAssessmentPath={(assessment) => `/hasil-penilaian/${assessment.id}`}
    />
  )
}

export default HasilPenilaianPage
