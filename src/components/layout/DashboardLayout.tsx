import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, AlertTriangle, Bell, MessageSquareWarning, Users, LogOut } from 'lucide-react'
import { useAuth } from '@/context/auth'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', label: 'Vue d\u2019ensemble', icon: LayoutDashboard, end: true },
  { to: '/errors', label: 'Erreurs', icon: AlertTriangle },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/comments', label: 'Commentaires signalés', icon: MessageSquareWarning },
  { to: '/users', label: 'Utilisateurs', icon: Users },
]

export function DashboardLayout() {
  const { logout } = useAuth()

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-surface p-4">
        <div className="mb-6 px-2">
          <h1 className="text-lg font-bold text-white">Nuvel Admin</h1>
          <p className="text-xs text-gray-500">Console créateurs</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 transition-colors hover:bg-surface-hover hover:text-gray-100',
                  isActive && 'bg-primary/10 text-primary'
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={logout}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 transition-colors hover:bg-surface-hover hover:text-gray-100"
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </button>
      </aside>
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  )
}
