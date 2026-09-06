import AssessmentPicker from '../components/assessments/AssessmentPicker'

function RekomendasiPage() {
  return (
    <AssessmentPicker
      title="Rekomendasi Tindak Lanjut"
      pickerDescription="Pilih pasien untuk melihat rekomendasi tindak lanjut berdasarkan hasil penilaian VIP Score."
      listDescriptionPrefix="Pilih hasil penilaian untuk melihat rekomendasi milik"
      emptyStateMessage="Pasien ini belum memiliki penilaian VIP Score untuk direkomendasikan."
      buildAssessmentPath={(assessment) => `/hasil-penilaian/${assessment.id}`}
    />
  )
}

export default RekomendasiPage
