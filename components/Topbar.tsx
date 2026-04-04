'use client'
import { Bell, Search } from 'lucide-react'

interface TopbarProps {
  title: string
  subtitle?: string
}

export default function Topbar({ title, subtitle }: TopbarProps) {
  return (
    <header className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.03em' }}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <button className="btn-ghost p-2.5">
          <Search size={16} />
        </button>
        <button className="btn-ghost p-2.5 relative">
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: 'var(--green)' }} />
        </button>
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ml-1"
          style={{ background: 'rgba(0,200,120,0.15)', color: 'var(--green)', border: '1px solid rgba(0,200,120,0.3)' }}>
          AK
        </div>
      </div>
    </header>
  )
}
