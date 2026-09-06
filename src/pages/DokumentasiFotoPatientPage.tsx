import { Camera, ImageIcon, ZoomIn } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import PatientContextCard from '../components/PatientContextCard'
import PhotoDetailModal from '../components/photos/PhotoDetailModal'
import PhotoForm, { type PhotoFormValues } from '../components/photos/PhotoForm'
import PivcContextSummary from '../components/pivc/PivcContextSummary'
import Toast from '../components/Toast'
import { useAssessments } from '../hooks/useAssessments'
import { usePatients } from '../hooks/usePatients'
import { usePhotos } from '../hooks/usePhotos'
import { usePivcs } from '../hooks/usePivcs'
import type { PhotoRecord } from '../types/photo'
import { calculatePivcDay } from '../utils/datetime'
import { formatDateID } from '../utils/patient'
import { getPhoto } from '../utils/photoStorage'

interface TimelineEntry {
  key: string
  type: 'initial' | 'monitoring'
  imageData: string
  date: string
  time: string
  vipScore: number | null
  vipCategory: string | null
  note?: string
  photo?: PhotoRecord
}

function TimelineCard({ entry, dayLabel, onViewDetail }: { entry: TimelineEntry; dayLabel: string; onViewDetail?: () => void }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="relative">
        <img src={entry.imageData} alt="Dokumentasi area insersi" className="h-36 w-full object-cover" />
        <span
          className={`absolute left-2 top-2 flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold text-white ${
            entry.type === 'initial' ? 'bg-blue-700' : 'bg-teal-800'
          }`}
        >
          {entry.type === 'initial' ? <ImageIcon size={12} /> : <Camera size={12} />}
          {entry.type === 'initial' ? 'Insersi Awal' : 'Monitoring'}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{dayLabel}</p>
        <p className="text-sm font-medium text-gray-800">
          {formatDateID(entry.date)} <span className="text-gray-400">{entry.time}</span>
        </p>
        <p className="text-xs text-gray-500">
          VIP Score:{' '}
          {entry.type === 'initial'
            ? 'Belum ada penilaian'
            : entry.vipScore !== null
              ? `${entry.vipScore} (${entry.vipCategory ?? '-'})`
              : 'Belum tersedia'}
        </p>
        {entry.note && <p className="line-clamp-2 text-xs text-gray-500">{entry.note}</p>}
        {onViewDetail && (
          <button
            type="button"
            onClick={onViewDetail}
            className="mt-auto flex items-center gap-2 self-start rounded-lg border border-teal-700 px-3 py-1.5 text-xs font-medium text-teal-800 hover:bg-teal-50"
          >
            <ZoomIn size={14} />
            Lihat Detail
          </button>
        )}
      </div>
    </div>
  )
}

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
  const initialPhotoUrl = activePivc ? getPhoto(activePivc.initialPhotoId) : undefined

  // Called unconditionally (Rules of Hooks) — must run before the `!patient`
  // early return below, falling back to an empty result until then.
  const timelineEntries = useMemo<TimelineEntry[]>(() => {
    const entries: TimelineEntry[] = []
    if (activePivc && initialPhotoUrl) {
      entries.push({
        key: 'initial-photo',
        type: 'initial',
        imageData: initialPhotoUrl,
        date: activePivc.installationDate,
        time: activePivc.installationTime,
        vipScore: null,
        vipCategory: null,
      })
    }
    for (const photo of photosForPivc) {
      entries.push({
        key: photo.id,
        // A photo not tied to any assessment is general/initial documentation
        // (e.g. taken right after insertion); one tied to an assessment is
        // definitively a monitoring photo from that specific check.
        type: photo.assessmentId ? 'monitoring' : 'initial',
        imageData: photo.imageData,
        date: photo.date,
        time: photo.time,
        vipScore: photo.vipScore,
        vipCategory: photo.vipCategory,
        note: photo.note,
        photo,
      })
    }
    return entries.sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`))
  }, [activePivc, initialPhotoUrl, photosForPivc])

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
        description="Rekap dokumentasi visual area insersi PIVC — foto insersi awal dan foto monitoring dari waktu ke waktu."
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

          <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-base font-semibold text-gray-900">Riwayat Dokumentasi Foto</h2>
            {timelineEntries.length === 0 ? (
              <p className="text-sm text-gray-500">
                Belum ada dokumentasi foto untuk PIVC ini. Foto insersi awal dapat ditambahkan saat
                pemasangan PIVC, dan foto monitoring dapat ditambahkan dari halaman Penilaian VIP Score
                atau formulir di bawah.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {timelineEntries.map((entry) => (
                  <TimelineCard
                    key={entry.key}
                    entry={entry}
                    dayLabel={`Hari ke-${calculatePivcDay(activePivc.installationDate, entry.date)}`}
                    onViewDetail={entry.photo ? () => setDetailPhoto(entry.photo!) : undefined}
                  />
                ))}
              </div>
            )}
            <p className="mt-4 text-xs text-gray-400">
              Dokumentasi longitudinal: foto yang diambil pada waktu berbeda dapat membantu
              membandingkan perubahan kondisi area insersi dari waktu ke waktu. Skor VIP Score yang
              ditampilkan berasal dari penilaian terkait, bukan hasil analisis otomatis terhadap foto.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="mb-1 text-base font-semibold text-gray-900">Tambah Foto Tambahan (Opsional)</h2>
            <p className="mb-4 text-sm text-gray-500">
              Foto monitoring biasanya ditambahkan langsung dari halaman Penilaian VIP Score. Gunakan
              formulir ini untuk menambahkan dokumentasi tambahan di luar alur tersebut.
            </p>
            <PhotoForm
              key={formResetKey}
              defaultInsertionSite={activePivc.insertionSite}
              assessments={assessmentsForPivc}
              onSave={handleSave}
              onCancel={() => setFormResetKey((key) => key + 1)}
            />
          </div>
        </>
      )}

      <PhotoDetailModal photo={detailPhoto} patient={patient} onClose={() => setDetailPhoto(null)} />

      {toastMessage && <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />}
    </div>
  )
}

export default DokumentasiFotoPatientPage
