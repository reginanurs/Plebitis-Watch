import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import PatientContextCard from '../components/PatientContextCard'
import PhotoDetailModal from '../components/photos/PhotoDetailModal'
import PhotoForm, { type PhotoFormValues } from '../components/photos/PhotoForm'
import PhotoHistoryCard from '../components/photos/PhotoHistoryCard'
import PivcContextSummary from '../components/pivc/PivcContextSummary'
import Toast from '../components/Toast'
import { useAssessments } from '../hooks/useAssessments'
import { usePatients } from '../hooks/usePatients'
import { usePhotos } from '../hooks/usePhotos'
import { usePivcs } from '../hooks/usePivcs'
import type { PhotoRecord } from '../types/photo'

function DokumentasiFotoPatientPage() {
  const { patientId } = useParams<{ patientId: string }>()
  const { patients } = usePatients()
  const { getActivePivcByPatientId } = usePivcs()
  const { getAssessmentsByPivcId } = useAssessments()
  const { addPhoto, getPhotosByPivcId } = usePhotos()
  const navigate = useNavigate()

  const [formResetKey, setFormResetKey] = useState(0)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [detailPhoto, setDetailPhoto] = useState<PhotoRecord | null>(null)

  const patient = patients.find((item) => item.id === patientId)
  const activePivc = patient ? getActivePivcByPatientId(patient.id) : undefined
  const assessmentsForPivc = activePivc ? getAssessmentsByPivcId(activePivc.id) : []
  const photosForPivc = activePivc ? getPhotosByPivcId(activePivc.id) : []

  // Called unconditionally (Rules of Hooks) — must run before the `!patient`
  // early return below, falling back to an empty result until then.
  const sortedPhotos = useMemo(
    () => [...photosForPivc].sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`)),
    [photosForPivc],
  )

  if (!patient) {
    return (
      <div>
        <PageHeader title="Pasien Tidak Ditemukan" description="Data pasien yang dicari tidak tersedia." />
        <Link
          to="/dokumentasi-foto"
          className="inline-flex items-center gap-2 rounded-lg border border-teal-700 px-4 py-2 text-sm font-medium text-teal-800 hover:bg-teal-50"
        >
          Kembali ke Dokumentasi Foto
        </Link>
      </div>
    )
  }

  function handleSave(values: PhotoFormValues) {
    if (!activePivc) return
    addPhoto({
      patientId: patient!.id,
      pivcId: activePivc.id,
      assessmentId: values.assessmentId,
      imageData: values.imageData,
      date: values.date,
      time: values.time,
      insertionSite: values.insertionSite,
      vipScore: values.vipScore,
      vipCategory: values.vipCategory,
      note: values.note,
      createdBy: values.createdBy,
    })
    setToastMessage('Foto area insersi berhasil disimpan.')
  }

  return (
    <div>
      <PageHeader
        title="Dokumentasi Foto Area Insersi"
        description="Ambil atau unggah foto kondisi area insersi PIVC."
      />

      <div className="mb-6">
        <PatientContextCard patient={patient} onViewDetail={() => navigate(`/pasien/${patient.id}`)} />
      </div>

      {!activePivc ? (
        <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50 p-6 text-center text-amber-800">
          <p className="mb-3">
            Pasien ini belum memiliki PIVC aktif. Dokumentasi foto memerlukan konteks PIVC yang sedang
            terpasang.
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
            <PivcContextSummary pivc={activePivc} />
          </div>

          <PhotoForm
            key={formResetKey}
            defaultInsertionSite={activePivc.insertionSite}
            assessments={assessmentsForPivc}
            onSave={handleSave}
            onCancel={() => setFormResetKey((key) => key + 1)}
          />

          <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-base font-semibold text-gray-900">Riwayat Foto Area Insersi</h2>
            {sortedPhotos.length === 0 ? (
              <p className="text-sm text-gray-500">Belum ada dokumentasi foto untuk PIVC ini.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {sortedPhotos.map((photo, index) => (
                  <PhotoHistoryCard
                    key={photo.id}
                    photo={photo}
                    isLatest={index === 0}
                    onViewDetail={() => setDetailPhoto(photo)}
                  />
                ))}
              </div>
            )}
            <p className="mt-4 text-xs text-gray-400">
              Dokumentasi longitudinal: foto yang diambil pada waktu berbeda dapat membantu
              membandingkan perubahan kondisi area insersi dari waktu ke waktu.
            </p>
          </div>
        </>
      )}

      <PhotoDetailModal photo={detailPhoto} patient={patient} onClose={() => setDetailPhoto(null)} />

      {toastMessage && <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />}
    </div>
  )
}

export default DokumentasiFotoPatientPage
