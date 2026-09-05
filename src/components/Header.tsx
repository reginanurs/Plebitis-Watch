import { Bell, ChevronDown, LogOut, Menu, UserRound } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useMountTransition } from '../hooks/useMountTransition'
import NotificationDropdown from './notifications/NotificationDropdown'
import type { Notification } from '../types/notification'

const DROPDOWN_TRANSITION_MS = 200

interface HeaderProps {
  onMenuClick: () => void
  notificationCount?: number
  recentNotifications?: Notification[]
  onNotificationClick?: (notification: Notification) => void
  onMarkAllNotificationsAsRead?: () => void
  onViewAllNotifications?: () => void
  userName?: string
  userRole?: string
  onLogout?: () => void
}

function Header({
  onMenuClick,
  notificationCount = 0,
  recentNotifications = [],
  onNotificationClick,
  onMarkAllNotificationsAsRead,
  onViewAllNotifications,
  userName = 'Pengguna',
  userRole,
  onLogout,
}: HeaderProps) {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const shouldRenderNotification = useMountTransition(isNotificationOpen, DROPDOWN_TRANSITION_MS)
  const shouldRenderUserMenu = useMountTransition(isUserMenuOpen, DROPDOWN_TRANSITION_MS)
  const notificationRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isNotificationOpen && !isUserMenuOpen) return

    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsNotificationOpen(false)
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isNotificationOpen, isUserMenuOpen])

  return (
    <header className="flex items-center justify-between gap-2 bg-teal-800 px-3 py-3 text-white sm:gap-4 sm:px-4 md:px-6">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Buka menu navigasi"
          className="shrink-0 rounded-lg p-2 hover:bg-teal-700 active:scale-[0.97] md:hidden"
        >
          <Menu size={22} />
        </button>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center">
          <img src="/logo.png" alt="Logo PLEBITIS WATCH" className="h-full w-full object-contain" />
        </div>
        <div className="min-w-0 leading-tight">
          <p className="whitespace-nowrap text-base font-bold sm:text-lg sm:tracking-wide">
            PLEBITIS WATCH
          </p>
          <p className="truncate text-xs text-teal-100">Monitor Flebitis, Cegah Komplikasi</p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1 sm:gap-4">
        <div className="relative" ref={notificationRef}>
          <button
            type="button"
            onClick={() => setIsNotificationOpen((prev) => !prev)}
            aria-label="Notifikasi"
            aria-expanded={isNotificationOpen}
            className="relative rounded-full p-2 hover:bg-teal-700 active:scale-[0.97]"
          >
            <Bell size={22} />
            {notificationCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-semibold">
                {notificationCount}
              </span>
            )}
          </button>
          {shouldRenderNotification && (
            <NotificationDropdown
              isOpen={isNotificationOpen}
              notifications={recentNotifications}
              onItemClick={(notification) => {
                setIsNotificationOpen(false)
                onNotificationClick?.(notification)
              }}
              onMarkAllAsRead={() => onMarkAllNotificationsAsRead?.()}
              onViewAll={() => {
                setIsNotificationOpen(false)
                onViewAllNotifications?.()
              }}
            />
          )}
        </div>
        <div className="relative" ref={userMenuRef}>
          <button
            type="button"
            onClick={() => setIsUserMenuOpen((prev) => !prev)}
            aria-label="Menu pengguna"
            aria-expanded={isUserMenuOpen}
            className="flex items-center gap-2 rounded-lg p-1 hover:bg-teal-700 active:scale-[0.97]"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-teal-700">
              <UserRound size={18} />
            </span>
            <span className="hidden text-sm font-medium sm:inline">{userName}</span>
            <ChevronDown size={16} className="hidden sm:block" />
          </button>

          {shouldRenderUserMenu && (
            <div
              className={`absolute right-0 top-full z-50 mt-2 w-56 origin-top-right overflow-hidden rounded-xl border border-gray-100 bg-white text-gray-800 shadow-xl transition duration-200 ease-out ${
                isUserMenuOpen ? 'translate-y-0 scale-100 opacity-100' : '-translate-y-1 scale-[0.98] opacity-0'
              }`}
            >
              <div className="border-b border-gray-100 px-4 py-3">
                <p className="text-sm font-semibold text-gray-900">{userName}</p>
                {userRole && <p className="text-xs text-gray-500">{userRole}</p>}
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsUserMenuOpen(false)
                  onLogout?.()
                }}
                className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut size={16} />
                Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
