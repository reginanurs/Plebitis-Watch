import { Bell, ClipboardPlus, Home, User, UserRound } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const items = [
  { path: '/dashboard', label: 'Dashboard', icon: Home },
  { path: '/pasien', label: 'Pasien', icon: User },
]

const trailingItems = [
  { path: '/notifikasi', label: 'Notifikasi', icon: Bell },
  { path: '/pengaturan', label: 'Akun', icon: UserRound },
]

function BottomNavLink({ path, label, icon: Icon }: (typeof items)[number]) {
  return (
    <NavLink
      to={path}
      className={({ isActive }) =>
        `flex flex-col items-center gap-1 px-2 py-1 text-xs ${
          isActive ? 'text-teal-800' : 'text-gray-500'
        }`
      }
    >
      <Icon size={22} />
      {label}
    </NavLink>
  )
}

function MobileBottomNav() {
  return (
    <nav className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-2 md:hidden">
      {items.map((item) => (
        <BottomNavLink key={item.path} {...item} />
      ))}

      <NavLink
        to="/penilaian"
        className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-teal-800 text-white shadow-lg"
        aria-label="Penilaian VIP Score"
      >
        <ClipboardPlus size={26} />
      </NavLink>

      {trailingItems.map((item) => (
        <BottomNavLink key={item.path} {...item} />
      ))}
    </nav>
  )
}

export default MobileBottomNav
