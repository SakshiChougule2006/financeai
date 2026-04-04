'use client'
import { useState } from 'react'
import Topbar from '@/components/Topbar'
import { CheckCircle, PlusCircle, MinusCircle } from 'lucide-react'
import { supabase, CATEGORIES } from '@/lib/supabase'

const defaultForm = {
  description: '',
  amount: '',
  category: 'Food & Grocery',
  type: 'expense' as 'expense' | 'income',
  date: new Date().toISOString().split('T')[0],
  notes: '',
}

export default function AddExpense() {
  const [form, setForm]       = useState(defaultForm)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError]     = useState('')

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.description || !form.amount) return
    setLoading(true)
    setError('')

    const { data: { session } } = await supabase.auth.getSession()

    const { error: dbError } = await supabase.from('expenses').insert({
      description: form.description,
      amount:      parseFloat(form.amount),
      category:    form.category,
      type:        form.type,
      date:        form.date,
      user_id:     session?.user.id,
    })

    setLoading(false)

    if (dbError) {
      setError(dbError.message)
      return
    }

    setSuccess(true)
    setForm(defaultForm)
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <div>
      <Topbar title="Add Transaction" subtitle="Record a new income or expense" />

      <div className="grid grid-cols-2 gap-6 max-w-3xl">
        {/* Form */}
        <div className="card" style={{ gridColumn: '1 / 2' }}>
          {success && (
            <div className="flex items-center gap-2 p-3 rounded-xl mb-5 text-sm font-medium animate-fade-in"
              style={{ background: 'rgba(0,200,120,0.1)', color: '#00c878', border: '1px solid rgba(0,200,120,0.2)' }}>
              <CheckCircle size={16} />
              Transaction added successfully!
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl mb-5 text-sm font-medium"
              style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}>
              ❌ {error}
            </div>
          )}

          {/* Type toggle */}
          <div className="flex gap-2 mb-6 p-1 rounded-xl" style={{ background: 'var(--bg-base)' }}>
            {(['expense', 'income'] as const).map(t => (
              <button key={t} onClick={() => set('type', t)}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all capitalize flex items-center justify-center gap-2"
                style={{
                  background: form.type === t ? (t === 'expense' ? '#f87171' : '#00c878') : 'transparent',
                  color: form.type === t ? '#000' : 'var(--text-secondary)',
                  boxShadow: form.type === t ? '0 0 20px rgba(0,200,120,0.2)' : 'none',
                }}>
                {t === 'expense' ? <MinusCircle size={14} /> : <PlusCircle size={14} />}
                {t}
              </button>
            ))}
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="label">Description</label>
            <input className="input" placeholder="e.g. Grocery shopping, EMI, Salary..."
              value={form.description} onChange={e => set('description', e.target.value)} />
          </div>

          {/* Amount */}
          <div className="mb-4">
            <label className="label">Amount (₹)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold"
                style={{ color: 'var(--text-muted)' }}>₹</span>
              <input className="input pl-7" type="number" placeholder="0.00"
                value={form.amount} onChange={e => set('amount', e.target.value)} />
            </div>
          </div>

          {/* Category */}
          <div className="mb-4">
            <label className="label">Category</label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map(cat => (
                <button key={cat.name} onClick={() => set('category', cat.name)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all"
                  style={{
                    background: form.category === cat.name ? `${cat.color}18` : 'var(--bg-base)',
                    border: `1px solid ${form.category === cat.name ? cat.color + '60' : 'var(--border)'}`,
                    color: form.category === cat.name ? cat.color : 'var(--text-secondary)',
                  }}>
                  <span>{cat.icon}</span>
                  <span className="text-xs font-medium truncate">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div className="mb-5">
            <label className="label">Date</label>
            <input className="input" type="date"
              value={form.date} onChange={e => set('date', e.target.value)} />
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="label">Notes (optional)</label>
            <textarea className="input resize-none" rows={2} placeholder="Any extra details..."
              value={form.notes} onChange={e => set('notes', e.target.value)} />
          </div>

          <button className="btn-primary w-full justify-center text-sm"
            onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : (
              <><PlusCircle size={15} /> Add Transaction</>
            )}
          </button>
        </div>

        {/* Preview card */}
        <div>
          <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
            Preview
          </p>
          <div className="card" style={{ border: `1px solid ${form.type === 'expense' ? '#f8717130' : '#00c87830'}` }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-lg"
                style={{ background: form.type === 'expense' ? '#f8717118' : '#00c87818' }}>
                {CATEGORIES.find(c => c.name === form.category)?.icon || '📦'}
              </div>
              <div>
                <p className="font-semibold text-sm">{form.description || 'Transaction name'}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{form.category} · {form.date}</p>
              </div>
            </div>
            <div className="divider" />
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {form.type === 'expense' ? 'Expense' : 'Income'}
              </span>
              <span className="text-xl font-bold metric-value"
                style={{ color: form.type === 'expense' ? '#f87171' : '#00c878' }}>
                {form.type === 'expense' ? '-' : '+'}₹{form.amount || '0'}
              </span>
            </div>
          </div>

          {/* Tips */}
          <div className="card mt-4" style={{ background: 'rgba(0,200,120,0.04)', border: '1px solid rgba(0,200,120,0.12)' }}>
            <p className="text-xs font-semibold mb-2" style={{ color: 'var(--green)' }}>💡 Quick Tips</p>
            <ul className="text-xs space-y-1.5" style={{ color: 'var(--text-secondary)' }}>
              <li>• Categorize properly for better AI insights</li>
              <li>• Add notes to remember why you spent</li>
              <li>• Log expenses daily for accuracy</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
