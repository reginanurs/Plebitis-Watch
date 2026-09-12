import { useEffect, useMemo, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import MobileBottomNav from '../components/MobileBottomNav'
import Sidebar from '../components/Sidebar'
import { useAuth } from '../hooks/useAuth'
import { useMountTransition } from '../hooks/useMountTransition'
import { useNotifications } from '../hooks/useNotifications'
import { useReminderNotificationSync } from '../hooks/useReminderNotificationSync'
import type { Notification } from '../types/notification'

const RECENT_NOTIFICATIONS_LIMIT = 5
const DRAWER_TRANSITION_MS = 250

function AppLayout() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const shouldRenderDrawer = useMountTransition(isDrawerOpen, DRAWER_TRANSITION_MS)
  const navigate = useNavigate()
  const location = useLocation()

  useReminderNotificationSync()
  const { notifications, markAsRead, markAllAsRead } = useNotifications()
  const { currentUser, logout } = useAuth()

  function closeDrawer() {
    setIsDrawerOpen(false)
  }

  useEffect(() => {
    if (!isDrawerOpen) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') closeDrawer()
    }
    window.addEventListener('keydown', handleKeyDown)

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [isDrawerOpen])

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  const recentNotifications = useMemo(
    () => [...notifications].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, RECENT_NOTIFICATIONS_LIMIT),
    [notifications],
  )
  const unreadCount = notifications.filter((notification) => !notification.read).length

  function handleNotificationClick(notification: Notification) {
    markAsRead(notification.id).catch((error) => console.error('Failed to mark notification as read:', error))
    if (notification.actionPath) navigate(notification.actionPath)
  }

  function handleMarkAllNotificationsAsRead() {
    markAllAsRead().catch((error) => console.error('Failed to mark all as read:', error))
  }

  return (
    <div className="flex h-svh flex-col bg-gray-50">
      <Header
        onMenuClick={() => setIsDrawerOpen(true)}
        notificationCount={unreadCount}
        recentNotifications={recentNotifications}
        onNotificationClick={handleNotificationClick}
        onMarkAllNotificationsAsRead={handleMarkAllNotificationsAsRead}
        onViewAllNotifications={() => navigate('/notifikasi')}
        userName={currentUser?.name}
        userRole={currentUser?.role}
        onLogout={handleLogout}
      />

      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden w-64 shrink-0 border-r border-gray-100 md:block">
          <Sidebar />
        </aside>

        {shouldRenderDrawer && (
          <div className={`fixed inset-0 z-40 flex md:hidden ${isDrawerOpen ? '' : 'pointer-events-none'}`}>
            <div
              className={`fixed inset-0 bg-black/40 transition-opacity duration-[250ms] ease-out ${
                isDrawerOpen ? 'opacity-100' : 'opacity-0'
              }`}
              onClick={closeDrawer}
              aria-hidden="true"
            />
            <div
              className={`relative z-50 h-full w-64 shadow-xl transition-transform duration-[250ms] ease-out ${
                isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
              }`}
            >
              <Sidebar onNavigate={closeDrawer} />
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div key={location.pathname} className="animate-fade-in-up">
            <Outlet />
          </div>
        </main>
      </div>

      <MobileBottomNav />
    </div>
  )
}

export default AppLayout
