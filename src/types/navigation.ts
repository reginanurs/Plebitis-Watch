import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  path: string
  label: string
  sublabel?: string
  icon: LucideIcon
}
