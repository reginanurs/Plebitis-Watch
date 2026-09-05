import { Activity, AlertTriangle, BookOpen, Droplet, type LucideIcon } from 'lucide-react'

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  PIVC: Droplet,
  Phlebitis: AlertTriangle,
  Monitoring: Activity,
  'Penggunaan Aplikasi': BookOpen,
}

export function getCategoryIcon(category: string): LucideIcon {
  return CATEGORY_ICONS[category] ?? BookOpen
}
