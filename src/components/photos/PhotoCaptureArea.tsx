import { Camera, ImageOff, Upload, X } from 'lucide-react'
import { useRef, type ChangeEvent } from 'react'

interface PhotoCaptureAreaProps {
  imageData: string | undefined
  onImageSelected: (dataUrl: string) => void
  onRemove: () => void
}

function readFileAsDataUrl(file: File, onLoad: (dataUrl: string) => void) {
  const reader = new FileReader()
  reader.onload = () => onLoad(reader.result as string)
  reader.readAsDataURL(file)
}

function PhotoCaptureArea({ imageData, onImageSelected, onRemove }: PhotoCaptureAreaProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    readFileAsDataUrl(file, onImageSelected)
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <p className="mb-3 text-sm font-medium text-gray-700">Foto Area Insersi</p>

      {imageData ? (
        <div className="relative flex items-center justify-center overflow-hidden rounded-xl bg-gray-50">
          <img
            src={imageData}
            alt="Pratinjau foto area insersi"
            className="max-h-80 w-full object-contain"
          />
          <button
            type="button"
            onClick={onRemove}
            aria-label="Hapus foto"
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-600 shadow hover:text-red-600"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div className="flex h-56 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 text-gray-300">
          <ImageOff size={32} />
          <span className="text-sm">Belum ada foto dipilih</span>
        </div>
      )}

      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-teal-800 px-4 py-2 text-sm font-medium text-white hover:bg-teal-900"
        >
          <Camera size={16} />
          {imageData ? 'Ganti Foto' : 'Ambil Foto'}
        </button>
        <button
          type="button"
          onClick={() => galleryInputRef.current?.click()}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-teal-700 px-4 py-2 text-sm font-medium text-teal-800 hover:bg-teal-50"
        >
          <Upload size={16} />
          Unggah dari Galeri
        </button>
      </div>

      {/* Camera-oriented capture: falls back to a normal file picker on browsers/devices
          without camera capture support — this is standard input behavior, not a
          simulated native camera. */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}

export default PhotoCaptureArea
