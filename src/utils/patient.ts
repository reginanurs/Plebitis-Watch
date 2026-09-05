const NAME_PREFIX_PATTERN = /^(Ny\.|Tn\.|Nn\.|Sdr\.|Sdri\.)\s*/i

const AVATAR_COLOR_CLASSES = [
  'bg-emerald-100 text-emerald-700',
  'bg-blue-100 text-blue-700',
  'bg-purple-100 text-purple-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-cyan-100 text-cyan-700',
]

export function calculateAge(dateOfBirth: string, referenceDate: Date = new Date()): number {
  const dob = new Date(dateOfBirth)
  if (Number.isNaN(dob.getTime())) return 0

  let age = referenceDate.getFullYear() - dob.getFullYear()
  const hasHadBirthdayThisYear =
    referenceDate.getMonth() > dob.getMonth() ||
    (referenceDate.getMonth() === dob.getMonth() && referenceDate.getDate() >= dob.getDate())
  if (!hasHadBirthdayThisYear) age -= 1

  return Math.max(age, 0)
}

export function getInitials(name: string, maxLetters = 2): string {
  const cleanedName = name.replace(NAME_PREFIX_PATTERN, '').trim()
  const words = cleanedName.split(/\s+/).filter(Boolean)
  const initials = words
    .slice(0, maxLetters)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('')
  return initials || '?'
}

export function getAvatarColorClass(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  }
  return AVATAR_COLOR_CLASSES[hash % AVATAR_COLOR_CLASSES.length]
}

export function formatDateID(dateStr: string): string {
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
