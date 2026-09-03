import { type ReactNode } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { Kanban, Sun, Moon, LogOut } from 'lucide-react'

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-base)' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-5 h-14"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-default)',
          backdropFilter: 'blur(12px)',
        }}
      >
        {/* Left: Logo */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: 'var(--primary)', color: '#fff' }}
          >
            <Kanban size={15} />
          </div>
          <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
            Kanban
          </span>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2">
          <span
            className="text-sm px-3 py-1 rounded-full hidden sm:block"
            style={{
              backgroundColor: 'var(--primary-subtle)',
              color: 'var(--primary-text)',
              fontWeight: 500,
            }}
          >
            {user?.username}
          </span>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg transition-colors"
            title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
            style={{
              color: 'var(--text-secondary)',
              backgroundColor: 'transparent',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-column)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            onClick={logout}
            className="p-2 rounded-lg transition-colors"
            title="Sair"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-column)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  )
}
