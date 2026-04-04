'use client'
import { useState, useEffect } from 'react'
import Topbar from '@/components/Topbar'
import { AlertTriangle, CheckCircle, Edit3 } from 'lucide-react'
import { supabase, CATEGORIES } from '@/lib/supabase'

const DEFAULT_LIMITS: Record<string, number> = {
  'Food & Grocery':    6000,
  'Bills & Utilities': 4000,
  'Transport':         3000,
  'Entertainment':     2000,
  'Health':            2000,
  'Shopping':          3000,
  'Education':         2000,
  'Other':             2000,
}

const COLORS: Record<string, string> = {
  'Food & Grocery':    '#00c878',
  'Bills & Utilities': '#3b82f6',
  'Transport':         '#f59e0b',
  'Entertainment':     '#8b5cf6',
  'Health':            '#06b6d4',
  'Shopping':          '#ec4899',
  'Education':         '#f97316',
  'Other':             '#94a3b8',
}

export default function Budget() {
  const [budgets, setBudgets] = useState<any[]>([])
  const [totalBudget, setTotalBudget] = useState<number>(20000)
  const [budgetInput, setBudgetInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [editCat, setEditCat] = useState('')
  const [editVal, setEditVal] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      // Load saved budget
      const { data: budgetData } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', session.user.id)
        .single()
      if (budgetData) setTotalBudget(budgetData.total_budget)

      // Load expenses
      const { data: expenses } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('type', 'expense')

      const grouped = Object.keys(DEFAULT_LIMITS).map(cat => ({
        category: cat,
        limit: DEFAULT_LIMITS[cat],
        spent: (expenses || []).filter(e => e.category === cat).reduce((s, e) => s + Number(e.amount), 0),
        color: COLORS[cat] || '#94a3b8',
      })).filter(b => b.spent > 0)

      setBudgets(grouped)
      setLoading(false)
    }
    load()
  }, [])

  const saveBudget = async () => {
    const val = parseFloat(budgetInput)
    if (!val || val <= 0) return
    const { data: { session } } = await supabase.auth.getSession()
    await supabase.from('budgets').upsert({
      user_id: session?.user.id,
      total_budget: val,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
    setTotalBudget(val)
    setBudgetInput('')
  }

  const totalSpent = budgets.reduce((a, b) => a + b.spent, 0)
  const totalLeft  = totalBudget - totalSpent
  const overallPct = Math.min(Math.round((totalSpent / totalBudget) * 100), 100)

  const saveEdit = (cat: string) => {
    const v = parseFloat(editVal)
    if (!v || v <= 0) return
    setBudgets(b => b.map(x => x.category === cat ? { ...x, limit: v } : x))
    setEditCat('')
    setEditVal('')
  }

  if (loading) return (
    <div>
      <Topbar title="Budget Tracker" subtitle="Set and monitor your monthly limits" />
      <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
    </div>
  )

  return (
    <div>
      <Topbar title="Budget Tracker" subtitle="Set and monitor your monthly limits" />

      {/* Budget update bar */}
      <div className="card mb-6" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Monthly Budget: <strong style={{ color: '#00c878' }}>₹{totalBudget.toLocaleString()}</strong>
        </span>
        <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
          <input type="number" placeholder="Update budget..."
            value={budgetInput} onChange={e => setBudgetInput(e.target.value)}
            className="input text-sm py-1.5 px-3 w-40" />
          <button className="btn-primary text-sm px-4 py-1.5" onClick={saveBudget} disabled={!budgetInput}>
            Update
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Budget', value: `₹${totalBudget.toLocaleString()}`, color: '#00c878' },
          { label: 'Total Spent',  value: `₹${totalSpent.toLocaleString()}`,  color: '#f87171' },
          { label: 'Remaining',    value: `₹${totalLeft.toLocaleString()}`,   color: totalLeft < 0 ? '#f87171' : '#00c878' },
        ].map(m => (
          <div key={m.label} className="card">
            <p className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>{m.label}</p>
            <p className="metric-value" style={{ color: m.color }}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Overall progress */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="font-semibold">Overall Budget Usage</p>
          <span className={`badge ${overallPct > 90 ? 'badge-red' : overallPct > 70 ? 'badge-amber' : 'badge-green'}`}>
            {overallPct}% used
          </span>
        </div>
        <div className="progress-track mb-2" style={{ height: 10 }}>
          <div className="progress-fill" style={{
            width: `${overallPct}%`,
            background: overallPct > 90 ? '#f87171' : overallPct > 70 ? '#fbbf24' : '#00c878',
          }} />
        </div>
        <div className="flex justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
          <span>₹{totalSpent.toLocaleString()} spent</span>
          <span>₹{totalBudget.toLocaleString()} total</span>
        </div>
      </div>

      {/* Category Budgets */}
      <div className="card">
        <p className="font-semibold mb-5">Category Budgets</p>
        {budgets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '16px', marginBottom: '8px' }}>No expenses yet!</p>
            <p style={{ fontSize: '14px' }}>Add expenses to see your budget usage here.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {budgets.map((b) => {
              const pct    = Math.min(Math.round((b.spent / b.limit) * 100), 100)
              const over   = b.spent > b.limit
              const warn   = pct >= 80
              const barClr = over ? '#f87171' : warn ? '#fbbf24' : b.color
              const catIcon = CATEGORIES.find(c => c.name === b.category)?.icon || '📦'
              const isEditing = editCat === b.category

              return (
                <div key={b.category}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span>{catIcon}</span>
                      <span className="text-sm font-medium">{b.category}</span>
                      {over && <span className="badge badge-red text-xs"><AlertTriangle size={10} /> Over budget</span>}
                      {!over && warn && <span className="badge badge-amber text-xs"><AlertTriangle size={10} /> Near limit</span>}
                      {!over && !warn && <span className="badge badge-green text-xs"><CheckCircle size={10} /> On track</span>}
                    </div>
                    <div className="flex items-center gap-3">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input className="input text-xs py-1 px-2 w-24" type="number"
                            value={editVal} onChange={e => setEditVal(e.target.value)}
                            placeholder="New limit" autoFocus />
                          <button className="btn-primary text-xs px-3 py-1.5" onClick={() => saveEdit(b.category)}>Save</button>
                          <button className="btn-ghost text-xs px-3 py-1.5" onClick={() => setEditCat('')}>Cancel</button>
                        </div>
                      ) : (
                        <>
                          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            ₹{b.spent.toLocaleString()} <span style={{ color: 'var(--text-muted)' }}>/ ₹{b.limit.toLocaleString()}</span>
                          </span>
                          <button className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }}
                            onClick={() => { setEditCat(b.category); setEditVal(String(b.limit)) }}>
                            <Edit3 size={13} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${pct}%`, background: barClr }} />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{pct}% used</span>
                    {over
                      ? <span className="text-xs" style={{ color: '#f87171' }}>₹{(b.spent - b.limit).toLocaleString()} over</span>
                      : <span className="text-xs" style={{ color: 'var(--text-muted)' }}>₹{(b.limit - b.spent).toLocaleString()} left</span>
                    }
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
