'use client'
import { useState, useEffect } from 'react'
import Topbar from '@/components/Topbar'
import { supabase } from '@/lib/supabase'
import { PlusCircle, Calendar, Trash2, ChevronDown, ChevronUp } from 'lucide-react'

const FESTIVALS = [
  { name: 'Diwali',      date: '2026-10-20', icon: '🪔', color: '#f59e0b', categories: ['Gifts', 'Clothes', 'Sweets', 'Decoration', 'Firecrackers'] },
  { name: 'Holi',        date: '2027-03-01', icon: '🎨', color: '#ec4899', categories: ['Colors', 'Clothes', 'Food', 'Party'] },
  { name: 'Eid',         date: '2026-03-31', icon: '🌙', color: '#22c55e', categories: ['Clothes', 'Gifts', 'Food', 'Charity'] },
  { name: 'Christmas',   date: '2026-12-25', icon: '🎄', color: '#ef4444', categories: ['Gifts', 'Decoration', 'Food', 'Travel'] },
  { name: 'Navratri',    date: '2026-10-09', icon: '💃', color: '#8b5cf6', categories: ['Clothes', 'Decoration', 'Food', 'Events'] },
  { name: 'Ganesh Chaturthi', date: '2026-08-22', icon: '🐘', color: '#f97316', categories: ['Decoration', 'Sweets', 'Pooja Items', 'Food'] },
  { name: 'Wedding',     date: '',           icon: '💍', color: '#06b6d4', categories: ['Clothes', 'Gifts', 'Travel', 'Stay', 'Shopping'] },
  { name: 'Custom',      date: '',           icon: '🎉', color: '#94a3b8', categories: ['Category 1', 'Category 2', 'Category 3'] },
]

function daysUntil(dateStr: string) {
  if (!dateStr) return null
  const diff = new Date(dateStr).getTime() - new Date().getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export default function Festivals() {
  const [myFestivals, setMyFestivals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)

  // Add form state
  const [selectedFestival, setSelectedFestival] = useState(FESTIVALS[0])
  const [customName, setCustomName] = useState('')
  const [customDate, setCustomDate] = useState('')
  const [totalBudget, setTotalBudget] = useState('')
  const [catBudgets, setCatBudgets] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadFestivals()
  }, [])

  useEffect(() => {
    // Reset cat budgets when festival changes
    const defaults: Record<string, string> = {}
    selectedFestival.categories.forEach(c => defaults[c] = '')
    setCatBudgets(defaults)
  }, [selectedFestival])

  const loadFestivals = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const { data } = await supabase
      .from('festival_budgets')
      .select('*')
      .eq('user_id', session.user.id)
      .order('festival_date', { ascending: true })
    setMyFestivals(data || [])
    setLoading(false)
  }

  const handleAdd = async () => {
    const name = selectedFestival.name === 'Custom' ? customName : selectedFestival.name
    const date = selectedFestival.name === 'Wedding' || selectedFestival.name === 'Custom'
      ? customDate : selectedFestival.date
    if (!name || !date || !totalBudget) return
    setSaving(true)

    const categories = selectedFestival.categories.map(cat => ({
      name: cat,
      budget: parseFloat(catBudgets[cat] || '0'),
      spent: 0,
    }))

    const { data: { session } } = await supabase.auth.getSession()
    await supabase.from('festival_budgets').insert({
      user_id: session?.user.id,
      festival_name: name,
      festival_date: date,
      total_budget: parseFloat(totalBudget),
      categories,
    })

    setSaving(false)
    setShowAdd(false)
    setTotalBudget('')
    setCustomName('')
    setCustomDate('')
    loadFestivals()
  }

  const handleDelete = async (id: string) => {
    await supabase.from('festival_budgets').delete().eq('id', id)
    loadFestivals()
  }

  const updateSpent = async (festival: any, catName: string, spent: string) => {
    const updated = festival.categories.map((c: any) =>
      c.name === catName ? { ...c, spent: parseFloat(spent) || 0 } : c
    )
    await supabase.from('festival_budgets').update({ categories: updated }).eq('id', festival.id)
    loadFestivals()
  }

  return (
    <div>
      <Topbar title="Festival Budget Planner" subtitle="Plan and track your festival spending" />

      {/* Upcoming festivals suggestion */}
      <div className="card mb-6">
        <p className="font-semibold mb-4" style={{ color: 'var(--text-secondary)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Upcoming Festivals
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {FESTIVALS.filter(f => f.date && daysUntil(f.date) !== null && daysUntil(f.date)! > 0 && daysUntil(f.date)! < 180).map(f => (
            <div key={f.name}
              onClick={() => { setSelectedFestival(f); setShowAdd(true) }}
              style={{ background: `${f.color}15`, border: `1px solid ${f.color}40`, borderRadius: '12px', padding: '12px 16px', cursor: 'pointer', minWidth: '120px' }}>
              <div style={{ fontSize: '24px', marginBottom: '4px' }}>{f.icon}</div>
              <div style={{ fontWeight: '600', fontSize: '13px' }}>{f.name}</div>
              <div style={{ color: f.color, fontSize: '12px' }}>{daysUntil(f.date)} days left</div>
            </div>
          ))}
          <div onClick={() => setShowAdd(true)}
            style={{ background: '#1e293b', border: '1px dashed #334155', borderRadius: '12px', padding: '12px 16px', cursor: 'pointer', minWidth: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            <PlusCircle size={20} color="#94a3b8" />
            <div style={{ color: '#94a3b8', fontSize: '13px' }}>Add Festival</div>
          </div>
        </div>
      </div>

      {/* Add Festival Form */}
      {showAdd && (
        <div className="card mb-6" style={{ border: '1px solid #334155' }}>
          <p className="font-semibold mb-4">Plan a Festival Budget</p>

          {/* Festival selector */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
            {FESTIVALS.map(f => (
              <button key={f.name}
                onClick={() => setSelectedFestival(f)}
                style={{ padding: '6px 12px', borderRadius: '20px', border: `1px solid ${selectedFestival.name === f.name ? f.color : '#334155'}`, background: selectedFestival.name === f.name ? `${f.color}20` : 'transparent', color: selectedFestival.name === f.name ? f.color : '#94a3b8', fontSize: '13px', cursor: 'pointer' }}>
                {f.icon} {f.name}
              </button>
            ))}
          </div>

          {/* Custom name */}
          {(selectedFestival.name === 'Custom' || selectedFestival.name === 'Wedding') && (
            <div className="mb-4">
              <label className="label">{selectedFestival.name === 'Wedding' ? 'Wedding Name/Occasion' : 'Festival Name'}</label>
              <input className="input" placeholder="e.g. My cousin's wedding"
                value={customName} onChange={e => setCustomName(e.target.value)} />
            </div>
          )}

          {/* Date */}
          {(selectedFestival.name === 'Wedding' || selectedFestival.name === 'Custom') && (
            <div className="mb-4">
              <label className="label">Date</label>
              <input className="input" type="date" value={customDate} onChange={e => setCustomDate(e.target.value)} />
            </div>
          )}

          {/* Total budget */}
          <div className="mb-4">
            <label className="label">Total Budget (₹)</label>
            <input className="input" type="number" placeholder="e.g. 15000"
              value={totalBudget} onChange={e => setTotalBudget(e.target.value)} />
          </div>

          {/* Category budgets */}
          <div className="mb-5">
            <label className="label">Budget by Category (optional)</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {selectedFestival.categories.map(cat => (
                <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-base)', borderRadius: '8px', padding: '8px 12px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)', flex: 1 }}>{cat}</span>
                  <input type="number" placeholder="₹0"
                    value={catBudgets[cat] || ''}
                    onChange={e => setCatBudgets(p => ({ ...p, [cat]: e.target.value }))}
                    style={{ width: '80px', padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '13px' }} />
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn-primary flex-1 justify-center" onClick={handleAdd} disabled={saving}>
              {saving ? 'Saving...' : <><PlusCircle size={15} /> Add Festival Plan</>}
            </button>
            <button className="btn-ghost px-4" onClick={() => setShowAdd(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* My Festival Plans */}
      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
      ) : myFestivals.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎆</div>
          <p style={{ fontWeight: '600', marginBottom: '8px' }}>No festival plans yet!</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '16px' }}>Click an upcoming festival above to start planning.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {myFestivals.map(f => {
            const days = daysUntil(f.festival_date)
            const totalSpent = f.categories.reduce((s: number, c: any) => s + c.spent, 0)
            const pct = Math.min(Math.round((totalSpent / f.total_budget) * 100), 100)
            const festival = FESTIVALS.find(x => x.name === f.festival_name) || FESTIVALS[7]
            const isExpanded = expanded === f.id

            return (
              <div key={f.id} className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ fontSize: '28px' }}>{festival.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: '600', fontSize: '16px' }}>{f.festival_name}</span>
                      {days !== null && days > 0 && (
                        <span style={{ background: days < 30 ? '#ef444420' : '#22c55e20', color: days < 30 ? '#ef4444' : '#22c55e', padding: '2px 8px', borderRadius: '20px', fontSize: '12px' }}>
                          {days} days left
                        </span>
                      )}
                      {days !== null && days <= 0 && (
                        <span style={{ background: '#94a3b820', color: '#94a3b8', padding: '2px 8px', borderRadius: '20px', fontSize: '12px' }}>Past</span>
                      )}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                      <Calendar size={12} style={{ display: 'inline', marginRight: '4px' }} />
                      {new Date(f.festival_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: '700', fontSize: '18px', color: festival.color }}>₹{f.total_budget.toLocaleString()}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>₹{totalSpent.toLocaleString()} spent</div>
                  </div>
                  <button onClick={() => setExpanded(isExpanded ? null : f.id)} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                  <button onClick={() => handleDelete(f.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Progress bar */}
                <div style={{ background: '#334155', borderRadius: '999px', height: '8px', marginBottom: '8px' }}>
                  <div style={{ width: `${pct}%`, background: festival.color, height: '8px', borderRadius: '999px' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginBottom: isExpanded ? '16px' : '0' }}>
                  <span>{pct}% used</span>
                  <span>₹{(f.total_budget - totalSpent).toLocaleString()} remaining</span>
                </div>

                {/* Expanded category breakdown */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category Breakdown</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {f.categories.map((cat: any) => {
                        const catPct = cat.budget > 0 ? Math.min(Math.round((cat.spent / cat.budget) * 100), 100) : 0
                        return (
                          <div key={cat.name}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                              <span style={{ fontSize: '13px' }}>{cat.name}</span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Budget: ₹{cat.budget.toLocaleString()}</span>
                                <input type="number" placeholder="Spent"
                                  defaultValue={cat.spent || ''}
                                  onBlur={e => updateSpent(f, cat.name, e.target.value)}
                                  style={{ width: '90px', padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-base)', color: 'var(--text-primary)', fontSize: '12px' }} />
                              </div>
                            </div>
                            {cat.budget > 0 && (
                              <div style={{ background: '#334155', borderRadius: '999px', height: '4px' }}>
                                <div style={{ width: `${catPct}%`, background: festival.color, height: '4px', borderRadius: '999px' }} />
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
