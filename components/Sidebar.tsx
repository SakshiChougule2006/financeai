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

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) setUser(data.session.user)
    }
    getUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : '??'

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 flex flex-col z-50"
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
  )
}
