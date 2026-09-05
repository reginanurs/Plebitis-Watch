/**
 * Prototype-safe storage for demo photo data.
 *
 * There is no backend, so "storing a photo" means keeping its data URL in
 * localStorage under a generated id, and only that id is referenced from
 * other records (e.g. Pivc.initialPhotoId). This keeps the data model
 * future-compatible with a real photo entity/service without building one
 * now. Because data URLs are large, this is only appropriate for a small
 * number of demo images — not a real photo history system.
 */
const PHOTO_STORAGE_KEY = 'plebitis-watch.photos'

function readPhotoMap(): Record<string, string> {
  try {
    const raw = window.localStorage.getItem(PHOTO_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Record<string, string>) : {}
  } catch {
    return {}
  }
}

function writePhotoMap(map: Record<string, string>) {
  try {
    window.localStorage.setItem(PHOTO_STORAGE_KEY, JSON.stringify(map))
  } catch {
    // storage may be full — data-URL photos are large; fail silently for this prototype
  }
}

export function savePhoto(dataUrl: string): string {
  const id = crypto.randomUUID()
  const map = readPhotoMap()
  map[id] = dataUrl
  writePhotoMap(map)
  return id
}

export function getPhoto(id: string | undefined): string | undefined {
  if (!id) return undefined
  return readPhotoMap()[id]
}

export function removePhoto(id: string | undefined) {
  if (!id) return
  const map = readPhotoMap()
  delete map[id]
  writePhotoMap(map)
}
