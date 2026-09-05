import { CheckSquare, ImageIcon, Info, Lightbulb, Printer } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import DetailField from '../components/DetailField'
import PageHeader from '../components/PageHeader'
import PatientContextCard from '../components/PatientContextCard'
import PivcContextSummary from '../components/pivc/PivcContextSummary'
import Toast from '../components/Toast'
import VipScorePendingNotice from '../components/vip/VipScorePendingNotice'
import recommendationsConfig from '../data/recommendations.json'
import { useAssessments } from '../hooks/useAssessments'
import { usePatients } from '../hooks/usePatients'
import { usePhotos } from '../hooks/usePhotos'
import { usePivcs } from '../hooks/usePivcs'
import type { RecommendationConfig } from '../types/recommendation'
import { formatDateID } from '../utils/patient'
import { getRecommendationForAssessment } from '../utils/recommendation'

const config = recommendationsConfig as RecommendationConfig

function RekomendasiResultPage() {
  const { assessmentId } = useParams<{ assessmentId: string }>()
  const { getAssessmentById } = useAssessments()
  const { patients } = usePatients()
  const { getPivcById } = usePivcs()
  const { getPhotosByAssessmentId } = usePhotos()
  const navigate = useNavigate()
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const assessment = assessmentId ? getAssessmentById(assessmentId) : undefined

  if (!assessment) {
    return (
      <div>
        <PageHeader
          title="Rekomendasi Tidak Ditemukan"
          description="Data penilaian VIP Score yang dicari tidak tersedia."
        />
        <Link
          to="/rekomendasi"
          className="inline-flex items-center gap-2 rounded-lg border border-teal-700 px-4 py-2 text-sm font-medium text-teal-800 hover:bg-teal-50"
        >
          Kembali ke Rekomendasi Tindak Lanjut
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
  const recommendationResult = getRecommendationForAssessment(assessment, config)

  function handlePrint() {
    window.print()
  }

  function handleSaveToHistory() {
    setToastMessage('Rekomendasi ini mengacu pada penilaian yang sudah tersimpan di riwayat pasien.')
  }

  return (
    <div>
      <PageHeader
        title="Rekomendasi Tindak Lanjut"
        description="Rekomendasi tindak lanjut berdasarkan hasil penilaian VIP Score."
      />

      <div className="mb-6">
        <PatientContextCard patient={patient} onViewDetail={() => navigate(`/pasien/${patient.id}`)} />
      </div>

      {pivc && (
        <div className="mb-6">
          <PivcContextSummary pivc={pivc} title="Konteks PIVC" />
        </div>
      )}

      <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Ringkasan Hasil Penilaian</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg bg-gray-50 p-4 text-center">
            <p className="text-xs uppercase tracking-wide text-gray-400">VIP Score</p>
            <p className={`text-3xl font-bold ${assessment.totalScore !== null ? 'text-teal-800' : 'text-gray-300'}`}>
              {assessment.totalScore !== null ? assessment.totalScore : '—'}
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4 text-center">
            <p className="text-xs uppercase tracking-wide text-gray-400">Kategori</p>
            <p className="text-lg font-semibold text-gray-700">{assessment.category ?? 'Belum tersedia'}</p>
          </div>
          <DetailField label="Tanggal Penilaian" value={formatDateID(assessment.date)} />
          <DetailField label="Waktu Penilaian" value={assessment.time} />
        </div>

        {assessment.totalScore === null && (
          <div className="mt-4">
            <VipScorePendingNotice reason="Skor VIP Score pada penilaian ini belum tersedia karena aturan perhitungan klinis masih menunggu konfigurasi." />
          </div>
        )}
      </div>

      {linkedPhoto && (
        <Link
          to={`/hasil-penilaian/${assessment.id}`}
          className="mb-6 flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm hover:border-teal-200 hover:bg-teal-50/40"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-400">
            <ImageIcon size={20} />
          </span>
          <p className="text-sm text-gray-600">
            Dokumentasi foto tersedia untuk penilaian ini.{' '}
            <span className="font-medium text-teal-800">Lihat Hasil Penilaian &amp; Foto</span>
          </p>
        </Link>
      )}

      <div className="mb-6 rounded-2xl bg-amber-50 p-5">
        <div className="mb-3 flex items-center gap-2 text-amber-800">
          <Lightbulb size={20} />
          <h2 className="text-lg font-semibold">Rekomendasi</h2>
        </div>

        {recommendationResult.status === 'ok' ? (
          <div className="flex flex-col gap-4">
            <div>
              <p className="font-medium text-amber-900">{recommendationResult.rule.title}</p>
              {recommendationResult.rule.description && (
                <p className="mt-1 text-sm text-amber-800">{recommendationResult.rule.description}</p>
              )}
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-amber-800">
                Tindak Lanjut yang Direkomendasikan
              </p>
              <ul className="flex flex-col gap-3">
                {recommendationResult.rule.actions.map((action) => (
                  <li key={action.id} className="flex items-start gap-2">
                    <CheckSquare size={18} className="mt-0.5 shrink-0 text-amber-700" />
                    <div>
                      <p className="text-sm font-medium text-amber-900">{action.title}</p>
                      {action.description && <p className="text-sm text-amber-700">{action.description}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-xs text-amber-700">
              Sumber SOP/protokol: {recommendationResult.rule.source || 'Belum dikonfigurasi'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="font-medium text-amber-900">Rekomendasi tindak lanjut belum dikonfigurasi.</p>
            <p className="text-sm text-amber-800">
              Aturan rekomendasi perlu disesuaikan dengan kategori VIP Score dan SOP/protokol fasilitas
              pelayanan kesehatan.
            </p>
            <p className="text-xs text-amber-700">Sumber SOP/protokol: Belum dikonfigurasi</p>
          </div>
        )}
      </div>

      <div className="mb-6 flex items-start gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
        <Info size={18} className="mt-0.5 shrink-0" />
        <div>
          <p>
            Rekomendasi ini berfungsi sebagai pendukung keputusan klinis, bukan sebagai pengganti
            keputusan profesional perawat atau dokter.
          </p>
          <p className="mt-1">Selalu sesuaikan dengan kondisi klinis pasien dan kebijakan fasilitas kesehatan.</p>
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-3 print:hidden">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          Kembali
        </button>
        <button
          type="button"
          onClick={handlePrint}
          className="flex items-center gap-2 rounded-lg border border-teal-700 px-4 py-2 text-sm font-medium text-teal-800 hover:bg-teal-50"
        >
          <Printer size={16} />
          Cetak Rekomendasi
        </button>
        <button
          type="button"
          onClick={handleSaveToHistory}
          className="rounded-lg bg-teal-800 px-4 py-2 text-sm font-medium text-white hover:bg-teal-900"
        >
          Simpan ke Riwayat
        </button>
      </div>

      {toastMessage && <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />}
    </div>
  )
}

export default RekomendasiResultPage
