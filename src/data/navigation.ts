import {
  BarChart3,
  Bell,
  BellRing,
  BookOpen,
  Camera,
  ClipboardList,
  Droplet,
  FolderClock,
  Home,
  Lightbulb,
  LineChart,
  Settings,
  User,
} from 'lucide-react'
import type { NavItem } from '../types/navigation'

export const navItems: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: Home },
  { path: '/pasien', label: 'Data Pasien', icon: User },
  { path: '/pivc', label: 'Data PIVC', sublabel: 'Pemasangan & Pemantauan', icon: Droplet },
  { path: '/penilaian', label: 'Penilaian VIP Score', icon: ClipboardList },
  { path: '/dokumentasi-foto', label: 'Dokumentasi Foto', sublabel: 'Area Insersi', icon: Camera },
  { path: '/hasil-penilaian', label: 'Hasil Penilaian', icon: BarChart3 },
  { path: '/rekomendasi', label: 'Rekomendasi Tindak Lanjut', icon: Lightbulb },
  { path: '/riwayat', label: 'Riwayat', icon: FolderClock },
  { path: '/grafik', label: 'Grafik', icon: LineChart },
  { path: '/reminder', label: 'Reminder Monitoring', icon: BellRing },
  { path: '/notifikasi', label: 'Notifikasi', icon: Bell },
  { path: '/edukasi', label: 'Edukasi', icon: BookOpen },
  { path: '/pengaturan', label: 'Pengaturan', icon: Settings },
]
