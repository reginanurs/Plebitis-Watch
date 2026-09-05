import { NavLink } from 'react-router-dom'
import { navItems } from '../data/navigation'

interface SidebarProps {
  onNavigate?: () => void
}

function Sidebar({ onNavigate }: SidebarProps) {
  return (
    <nav className="flex h-full flex-col gap-1 overflow-y-auto bg-white p-3">
      {navItems.map(({ path, label, sublabel, icon: Icon }) => (
        <NavLink
          key={path}
          to={path}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors duration-150 ${
              isActive
                ? 'bg-teal-800 text-white'
                : 'text-gray-600 hover:bg-teal-50 hover:text-teal-800'
            }`
          }
        >
          <Icon size={20} className="shrink-0" />
          <span className="leading-tight">
            {label}
            {sublabel && <span className="block text-xs opacity-80">{sublabel}</span>}
          </span>
        </NavLink>
      ))}
    </nav>
  )
}

export default Sidebar
