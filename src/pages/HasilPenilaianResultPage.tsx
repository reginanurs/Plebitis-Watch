import { Info, Printer, Share2, ZoomIn } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import DetailField from '../components/DetailField'
import PageHeader from '../components/PageHeader'
import PageLoadingState from '../components/PageLoadingState'
import PatientContextCard from '../components/PatientContextCard'
import PhotoDetailModal from '../components/photos/PhotoDetailModal'
import PivcContextSummary from '../components/pivc/PivcContextSummary'
import RecommendationPanel from '../components/recommendations/RecommendationPanel'
import VipScorePendingNotice from '../components/vip/VipScorePendingNotice'
import Toast from '../components/Toast'
import vipRules from '../data/vipRules.json'
import { useAssessments } from '../hooks/useAssessments'
import { usePatients } from '../hooks/usePatients'
import { usePhotos } from '../hooks/usePhotos'
import { usePivcs } from '../hooks/usePivcs'
import type { AssessmentComponents } from '../types/assessment'
import type { VipRulesConfig } from '../types/vipRules'
import { calculatePivcDay } from '../utils/datetime'
import { formatDateID } from '../utils/patient'

const rules = vipRules as VipRulesConfig

function resolveCategoryColorClass(categoryLabel: string | null): string {
  if (categoryLabel === null) return 'bg-gray-100 text-gray-500'
  const matchedRule = rules.categories.find((rule) => rule.label === categoryLabel)
  if (!matchedRule?.color) return 'bg-gray-100 text-gray-700'
  return matchedRule.color
}

function HasilPenilaianResultPage() {
  const { assessmentId } = useParams<{ assessmentId: string }>()
  const { getAssessmentById, isLoading: isAssessmentsLoading } = useAssessments()
  const { patients, isLoading: isPatientsLoading } = usePatients()
  const { getPivcById, isLoading: isPivcsLoading } = usePivcs()
  const { getPhotosByAssessmentId } = usePhotos()
  const navigate = useNavigate()
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false)

  if (isAssessmentsLoading || isPatientsLoading || isPivcsLoading) return <PageLoadingState />

  const assessment = assessmentId ? getAssessmentById(assessmentId) : undefined

  if (!assessment) {
    return (
      <div>
        <PageHeader
          title="Hasil Penilaian Tidak Ditemukan"
          description="Data penilaian VIP Score yang dicari tidak tersedia."
        />
        <Link
          to="/hasil-penilaian"
          className="inline-flex items-center gap-2 rounded-lg border border-teal-700 px-4 py-2 text-sm font-medium text-teal-800 hover:bg-teal-50"
        >
          Kembali ke Hasil Penilaian
        </Link>
      </div>
    )
  }

  const patient = patients.find((item) => item.id === assessment.patientId)

  if (!patient) {
    return (
      <div>
        <PageHeader title="Data Tidak Konsisten" description="Terjadi masalah integritas data." />
        <div className="rounded-2xl border border-dashed border-red-200 bg-red-50 p-6 text-center text-red-700">
          Data pasien yang terkait dengan penilaian ini tidak dapat ditemukan. Data tidak akan
          ditampilkan untuk mencegah informasi yang keliru.
        </div>
      </div>
    )
  }

  const pivc = getPivcById(assessment.pivcId)
  const linkedPhoto = getPhotosByAssessmentId(assessment.id)[0]

  const orderedComponents = [...rules.components].sort((a, b) => a.order - b.order)

  function handlePrint() {
    window.print()
  }

  async function handleShare() {
    const shareText = [
      `Hasil Penilaian VIP Score - ${patient!.name}`,
      `VIP Score: ${assessment!.totalScore !== null ? assessment!.totalScore : 'Belum tersedia'}`,
      `Kategori: ${assessment!.category ?? 'Belum tersedia'}`,
      `Tanggal: ${formatDateID(assessment!.date)} ${assessment!.time}`,
    ].join('\n')

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Hasil Penilaian VIP Score', text: shareText })
      } catch {
        // user cancelled the share sheet — no action needed
      }
    } else {
      setToastMessage('Fitur berbagi tidak didukung di perangkat/browser ini. Gunakan Cetak/PDF sebagai alternatif.')
    }
  }

  function handleSaveToHistory() {
    setToastMessage('Penilaian ini sudah tersimpan di riwayat pasien.')
  }

  return (
    <div>
      <PageHeader
        title="Hasil Penilaian VIP Score"
        description="Ringkasan hasil pengkajian kondisi area insersi PIVC."
      />

      <div className="mb-6">
        <PatientContextCard patient={patient} onViewDetail={() => navigate(`/pasien/${patient.id}`)} />
      </div>

      {pivc ? (
        <div className="mb-6">
          <PivcContextSummary pivc={pivc} title="Konteks PIVC" />
        </div>
      ) : (
        <div className="mb-6 rounded-2xl border border-dashed border-gray-200 bg-white p-4 text-sm text-gray-500">
          Data PIVC tidak ditemukan.
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Hasil Penilaian</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-gray-50 p-4 text-center">
              <p className="text-xs uppercase tracking-wide text-gray-400">VIP Score</p>
              <p className={`text-4xl font-bold ${assessment.totalScore !== null ? 'text-teal-800' : 'text-gray-300'}`}>
                {assessment.totalScore !== null ? assessment.totalScore : '—'}
              </p>
            </div>
            <div className={`rounded-lg p-4 text-center ${resolveCategoryColorClass(assessment.category)}`}>
              <p className="text-xs uppercase tracking-wide opacity-70">Kategori</p>
              <p className="text-lg font-semibold">{assessment.category ?? 'Belum tersedia'}</p>
            </div>
            <DetailField label="Tanggal Penilaian" value={formatDateID(assessment.date)} />
            <DetailField label="Waktu Penilaian" value={assessment.time} />
            <DetailField label="Dinilai Oleh" value={assessment.assessedBy} />
            {pivc && (
              <DetailField
                label="Lama Pemasangan PIVC"
                value={`Hari ke-${calculatePivcDay(pivc.installationDate, assessment.date)}`}
              />
            )}
          </div>

          {assessment.totalScore === null && (
            <div className="mt-4">
              <VipScorePendingNotice reason="Skor VIP Score belum tersedia karena aturan perhitungan klinis masih menunggu konfigurasi. Data observasi di bawah tetap tersimpan apa adanya." />
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Dokumentasi Foto</h2>
          {linkedPhoto ? (
            <div className="flex flex-col gap-3">
              <img
                src={linkedPhoto.imageData}
                alt="Foto area insersi saat penilaian"
                className="h-48 w-full rounded-xl bg-gray-50 object-contain"
              />
              <div className="grid grid-cols-2 gap-3">
                <DetailField label="Tanggal Foto" value={formatDateID(linkedPhoto.date)} />
                <DetailField label="Waktu Foto" value={linkedPhoto.time} />
                <DetailField label="Lokasi" value={linkedPhoto.insertionSite} />
                {linkedPhoto.vipScore !== null && (
                  <DetailField
                    label="VIP Score Saat Foto"
                    value={`${linkedPhoto.vipScore} (${linkedPhoto.vipCategory ?? '-'})`}
                  />
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsPhotoModalOpen(true)}
                className="flex items-center justify-center gap-2 self-start rounded-lg border border-teal-700 px-4 py-2 text-sm font-medium text-teal-800 hover:bg-teal-50"
              >
                <ZoomIn size={16} />
                Lihat Foto Lebih Besar
              </button>
            </div>
          ) : (
            <div className="flex h-48 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-gray-200 text-gray-400">
              <p className="text-sm">Tidak ada foto yang dikaitkan dengan penilaian ini.</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Komponen Penilaian</h2>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {orderedComponents.map((componentDef) => {
            const selectedOptionId = assessment.components[componentDef.id as keyof AssessmentComponents]
            const option = componentDef.options.find((candidate) => candidate.id === selectedOptionId)
            return (
              <DetailField
                key={componentDef.id}
                label={`${componentDef.order}. ${componentDef.label}`}
                value={option ? option.label : 'Pilihan tidak tersedia'}
              />
            )
          })}
        </dl>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold text-gray-900">Catatan Perawat</h2>
        <p className="text-sm text-gray-700">{assessment.notes || 'Tidak ada catatan tambahan.'}</p>
      </div>

      <div className="mt-6">
        <RecommendationPanel score={assessment.totalScore} />
      </div>

      <div className="mt-6 flex items-start gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
        <Info size={18} className="mt-0.5 shrink-0" />
        <p>
          Hasil penilaian merupakan data pendukung. Interpretasi kondisi pasien tetap memerlukan
          pengkajian klinis dan pertimbangan profesional tenaga kesehatan.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap justify-end gap-3 print:hidden">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          Kembali
        </button>
        <button
          type="button"
          onClick={handleShare}
          className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          <Share2 size={16} />
          Bagikan
        </button>
        <button
          type="button"
          onClick={handlePrint}
          className="flex items-center gap-2 rounded-lg border border-teal-700 px-4 py-2 text-sm font-medium text-teal-800 hover:bg-teal-50"
        >
          <Printer size={16} />
          Cetak / PDF
        </button>
        <button
          type="button"
          onClick={handleSaveToHistory}
          className="rounded-lg bg-teal-800 px-4 py-2 text-sm font-medium text-white hover:bg-teal-900"
        >
          Simpan ke Riwayat
        </button>
      </div>

      <PhotoDetailModal
        photo={isPhotoModalOpen ? (linkedPhoto ?? null) : null}
        patient={patient}
        onClose={() => setIsPhotoModalOpen(false)}
      />

      {toastMessage && <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />}
    </div>
  )
}

export default HasilPenilaianResultPage
