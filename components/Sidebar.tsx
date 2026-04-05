'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard,
  PlusCircle,
  Target,
  Sparkles,
  LogOut,
  Wallet,
  PartyPopper,
  Flame,
  Users,
  Menu,
  X,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

const navItems = [
  { href: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard'   },
  { href: '/add-expense', icon: PlusCircle,       label: 'Add Expense' },
  { href: '/budget',      icon: Target,           label: 'Budget'      },
  { href: '/insights',    icon: Sparkles,         label: 'AI Insights' },
  { href: '/festivals',   icon: PartyPopper,      label: 'Festivals'   },
  { href: '/streaks',     icon: Flame,            label: 'No Spend'    },
  { href: '/groups',      icon: Users,            label: 'Groups'      },
]

// Bottom nav shows only 5 most important items on mobile
const bottomNavItems = [
  { href: '/dashboard',   icon: LayoutDashboard, label: 'Home'     },
  { href: '/add-expense', icon: PlusCircle,       label: 'Add'      },
  { href: '/budget',      icon: Target,           label: 'Budget'   },
  { href: '/insights',    icon: Sparkles,         label: 'AI'       },
  { href: '/streaks',     icon: Flame,            label: 'Streaks'  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) setUser(data.session.user)
    }
    getUser()
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : '??'

  return (
    <>
      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-60 flex-col z-50"
        style={{ background: 'var(--bg-card)', borderRight: '1px solid var(--border)' }}>

        {/* Logo */}
        <div className="p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--green)', boxShadow: '0 0 20px var(--green-glow)' }}>
              <Wallet size={18} color="#000" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-sm leading-tight" style={{ fontWeight: 700 }}>FinanceAI</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Smart Money</p>
            </div>
          </div>
        </div>

        <div className="mx-4 mb-4" style={{ height: 1, background: 'var(--border)' }} />

        {/* Nav */}
        <nav className="flex-1 px-3 flex flex-col gap-1 overflow-y-auto">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = pathname === href
            return (
              <Link key={href} href={href}
                className={`nav-item ${active ? 'active' : ''}`}>
                <Icon size={17} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Bottom user section */}
        <div className="p-4">
          <div className="rounded-xl p-3 flex items-center gap-3"
            style={{ background: 'var(--bg-base)', border: '1px solid var(--border)' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: 'rgba(0,200,120,0.15)', color: 'var(--green)' }}>
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.email?.split('@')[0] || 'User'}</p>
              <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user?.email || ''}</p>
            </div>
            <button onClick={handleLogout} className="opacity-50 hover:opacity-100 transition-opacity">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── MOBILE TOP BAR ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3"
        style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--green)' }}>
            <Wallet size={16} color="#000" strokeWidth={2.5} />
          </div>
          <p className="text-sm font-bold">FinanceAI</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: 'rgba(0,200,120,0.15)', color: 'var(--green)' }}>
            {initials}
          </div>
          <button onClick={() => setMobileOpen(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}>
            <Menu size={22} />
          </button>
        </div>
      </div>

      {/* ── MOBILE DRAWER ── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-[100]" onClick={() => setMobileOpen(false)}>
          {/* Backdrop */}
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />

          {/* Drawer */}
          <div className="absolute right-0 top-0 h-full w-72 flex flex-col"
            style={{ background: 'var(--bg-card)', borderLeft: '1px solid var(--border)' }}
            onClick={e => e.stopPropagation()}>

            {/* Drawer header */}
            <div className="flex items-center justify-between p-4"
              style={{ borderBottom: '1px solid var(--border)' }}>
              <p className="font-semibold">Menu</p>
              <button onClick={() => setMobileOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}>
                <X size={20} />
              </button>
            </div>

            {/* Nav items */}
            <nav className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto">
              {navItems.map(({ href, icon: Icon, label }) => {
                const active = pathname === href
                return (
                  <Link key={href} href={href}
                    className={`nav-item ${active ? 'active' : ''}`}
                    style={{ padding: '12px 16px', fontSize: '15px' }}>
                    <Icon size={19} />
                    {label}
                  </Link>
                )
              })}
            </nav>

            {/* User + logout */}
            <div className="p-4" style={{ borderTop: '1px solid var(--border)' }}>
              <div className="rounded-xl p-3 flex items-center gap-3 mb-3"
                style={{ background: 'var(--bg-base)', border: '1px solid var(--border)' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: 'rgba(0,200,120,0.15)', color: 'var(--green)' }}>
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user?.email?.split('@')[0] || 'User'}</p>
                  <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user?.email || ''}</p>
                </div>
              </div>
              <button onClick={handleLogout}
                style={{ width: '100%', padding: '10px', background: '#ef444420', color: '#ef4444', border: '1px solid #ef444440', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 py-2"
        style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)' }}>
        {bottomNavItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href
          return (
            <Link key={href} href={href}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
                padding: '6px 12px', borderRadius: '10px', textDecoration: 'none',
                background: active ? 'rgba(0,200,120,0.1)' : 'transparent',
                color: active ? 'var(--green)' : 'var(--text-muted)',
                minWidth: '56px' }}>
              <Icon size={20} />
              <span style={{ fontSize: '10px', fontWeight: active ? '600' : '400' }}>{label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
