'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'

const CATEGORY_ICONS: Record<string, string> = {
  'Food & Grocery': '🛒',
  'Bills & Utilities': '⚡',
  'Transport': '🚗',
  'Entertainment': '🎬',
  'Shopping': '🛍️',
  'Health': '💊',
  'Education': '📚',
  'Other': '📦',
}

const CATEGORY_COLORS: Record<string, string> = {
  'Food & Grocery': '#00c878',
  'Bills & Utilities': '#3b82f6',
  'Transport': '#f59e0b',
  'Entertainment': '#8b5cf6',
  'Shopping': '#ec4899',
  'Health': '#06b6d4',
  'Education': '#f97316',
  'Other': '#94a3b8',
}

const CATEGORY_BUDGETS: Record<string, number> = {
  'Food & Grocery': 6000,
  'Bills & Utilities': 4000,
  'Transport': 3000,
  'Entertainment': 2000,
  'Shopping': 5000,
  'Health': 2000,
  'Education': 2000,
  'Other': 2000,
}

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [expenses, setExpenses] = useState<any[]>([])
  const [totalBudget, setTotalBudget] = useState<number>(20000)
  const [budgetInput, setBudgetInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [aiTips, setAiTips] = useState('')
  const [loadingTips, setLoadingTips] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) { router.push('/login'); return }
      setUser(data.session.user)
      const userId = data.session.user.id

      const { data: exp } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', userId)
        .eq('type', 'expense')
      setExpenses(exp || [])

      const { data: budgetData } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId)
        .single()
      if (budgetData) setTotalBudget(budgetData.total_budget)

      setLoading(false)
    }
    init()
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

  const getAiTips = async () => {
    if (expenses.length === 0) return
    setLoadingTips(true)
    setAiTips('')

    const summary = categoryData
      .map(c => `${c.category}: ₹${c.spent} spent of ₹${c.budget} budget`)
      .join(', ')

    try {
      const res = await fetch('/api/ai-tips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalSpent,
          totalBudget,
          summary,
        }),
      })
      const data = await res.json()
      setAiTips(data.tips)
    } catch (e) {
      setAiTips('Could not load tips. Please try again.')
    }
    setLoadingTips(false)
  }

  // Category data
  const categoryData = Object.keys(CATEGORY_BUDGETS).map(cat => ({
    category: cat,
    spent: expenses.filter(e => e.category === cat).reduce((s, e) => s + Number(e.amount), 0),
    budget: CATEGORY_BUDGETS[cat],
    icon: CATEGORY_ICONS[cat],
    color: CATEGORY_COLORS[cat],
  })).filter(c => c.spent > 0)

  // Monthly data for bar chart
  const monthlyData = (() => {
    const months: Record<string, number> = {}
    expenses.forEach(e => {
      const month = new Date(e.date).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })
      months[month] = (months[month] || 0) + Number(e.amount)
    })
    return Object.entries(months).map(([month, amount]) => ({ month, amount })).slice(-6)
  })()

  const totalSpent = expenses.reduce((s, e) => s + Number(e.amount), 0)
  const remaining = totalBudget - totalSpent
  const overallPct = Math.min(Math.round((totalSpent / totalBudget) * 100), 100)
  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : '??'

  const navItems = [
    { name: 'Dashboard', icon: '📊', path: '/dashboard' },
    { name: 'Add Expense', icon: '➕', path: '/add-expense' },
    { name: 'Budget', icon: '💰', path: '/budget' },
    { name: 'AI Insights', icon: '🤖', path: '/insights' },
    { name: 'Festivals', icon: '🎆', path: '/festivals' },
    { name: 'No Spend', icon: '🔥', path: '/streaks' },
    { name: 'Groups', icon: '👥', path: '/groups' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0f172a', color: 'white', fontFamily: 'sans-serif' }}>

      {/* Sidebar */}
      <div style={{ width: '220px', minHeight: '100vh', background: '#1e293b', padding: '24px 16px', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0, overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
          <div style={{ background: '#22c55e', borderRadius: '8px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>💰</div>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '15px' }}>FinanceAI</div>
            <div style={{ color: '#94a3b8', fontSize: '11px' }}>Smart Money</div>
          </div>
        </div>
        {navItems.map(item => (
          <div key={item.name} onClick={() => router.push(item.path)}
            style={{ padding: '10px 12px', borderRadius: '8px', marginBottom: '4px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px',
              background: item.name === 'Dashboard' ? '#22c55e22' : 'transparent',
              color: item.name === 'Dashboard' ? '#22c55e' : '#94a3b8' }}>
            <span style={{ fontSize: '16px' }}>{item.icon}</span>
            <span style={{ fontSize: '14px' }}>{item.name}</span>
          </div>
        ))}
        <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid #334155' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>{initials}</div>
            <div style={{ fontSize: '12px', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>{user?.email}</div>
          </div>
          <button onClick={() => supabase.auth.signOut().then(() => router.push('/login'))}
            style={{ width: '100%', padding: '8px', background: '#ef444420', color: '#ef4444', border: '1px solid #ef444440', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>
            Logout
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, marginLeft: '220px', padding: '32px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px' }}>Dashboard</h1>
            <p style={{ color: '#94a3b8', margin: 0, fontSize: '14px' }}>Welcome back! Here's your financial overview.</p>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input type="number" placeholder={`Budget: ₹${totalBudget.toLocaleString()}`}
              value={budgetInput} onChange={e => setBudgetInput(e.target.value)}
              style={{ width: '160px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #334155', background: '#1e293b', color: 'white', fontSize: '13px' }} />
            <button onClick={saveBudget} disabled={!budgetInput}
              style={{ padding: '8px 16px', background: budgetInput ? '#22c55e' : '#334155', color: budgetInput ? 'black' : '#94a3b8', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>
              Update
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ color: '#94a3b8' }}>Loading your data...</div>
        ) : (
          <>
            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
              {[
                { label: 'TOTAL BUDGET', value: `₹${totalBudget.toLocaleString()}`, color: '#22c55e', icon: '💰' },
                { label: 'TOTAL SPENT', value: `₹${totalSpent.toLocaleString()}`, color: '#ef4444', icon: '💸' },
                { label: 'REMAINING', value: `₹${remaining.toLocaleString()}`, color: remaining >= 0 ? '#22c55e' : '#ef4444', icon: '🏦' },
              ].map(card => (
                <div key={card.label} style={{ background: '#1e293b', borderRadius: '12px', padding: '24px', border: '1px solid #334155' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ color: '#94a3b8', fontSize: '12px', letterSpacing: '0.05em' }}>{card.label}</div>
                    <span style={{ fontSize: '20px' }}>{card.icon}</span>
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: card.color }}>{card.value}</div>
                </div>
              ))}
            </div>

            {/* Charts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>

              {/* Bar Chart */}
              <div style={{ background: '#1e293b', borderRadius: '12px', padding: '24px', border: '1px solid #334155' }}>
                <h2 style={{ margin: '0 0 20px', fontSize: '16px' }}>Monthly Spending</h2>
                {monthlyData.length === 0 ? (
                  <div style={{ color: '#94a3b8', textAlign: 'center', padding: '40px 0', fontSize: '14px' }}>No data yet</div>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={monthlyData}>
                      <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
                      <Tooltip
                        contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                        labelStyle={{ color: 'white' }}
                        formatter={(v: any) => [`₹${v.toLocaleString()}`, 'Spent']}
                      />
                      <Bar dataKey="amount" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Pie Chart */}
              <div style={{ background: '#1e293b', borderRadius: '12px', padding: '24px', border: '1px solid #334155' }}>
                <h2 style={{ margin: '0 0 20px', fontSize: '16px' }}>Spending by Category</h2>
                {categoryData.length === 0 ? (
                  <div style={{ color: '#94a3b8', textAlign: 'center', padding: '40px 0', fontSize: '14px' }}>No data yet</div>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={categoryData} dataKey="spent" nameKey="category" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                        {categoryData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                        formatter={(v: any) => [`₹${v.toLocaleString()}`, 'Spent']}
                      />
                      <Legend formatter={(value) => <span style={{ color: '#94a3b8', fontSize: '12px' }}>{value}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* AI Tips */}
            <div style={{ background: '#1e293b', borderRadius: '12px', padding: '24px', marginBottom: '24px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ margin: 0, fontSize: '16px' }}>🤖 AI Spending Tips</h2>
                <button onClick={getAiTips} disabled={loadingTips || expenses.length === 0}
                  style={{ padding: '8px 16px', background: loadingTips ? '#334155' : '#8b5cf6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>
                  {loadingTips ? '⏳ Analyzing...' : '✨ Get AI Tips'}
                </button>
              </div>
              {aiTips ? (
                <div style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>{aiTips}</div>
              ) : (
                <div style={{ color: '#94a3b8', fontSize: '14px', textAlign: 'center', padding: '20px 0' }}>
                  {expenses.length === 0 ? 'Add expenses first to get AI tips!' : 'Click "Get AI Tips" to get personalized spending advice!'}
                </div>
              )}
            </div>

            {/* Overall Bar */}
            <div style={{ background: '#1e293b', borderRadius: '12px', padding: '24px', marginBottom: '24px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontWeight: '600' }}>Overall Budget Usage</span>
                <span style={{ background: '#f59e0b22', color: '#f59e0b', padding: '2px 10px', borderRadius: '20px', fontSize: '12px' }}>{overallPct}% used</span>
              </div>
              <div style={{ background: '#334155', borderRadius: '999px', height: '10px', marginBottom: '8px' }}>
                <div style={{ width: `${overallPct}%`, background: overallPct > 90 ? '#ef4444' : '#f59e0b', height: '10px', borderRadius: '999px', transition: 'width 0.5s ease' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#94a3b8' }}>
                <span>₹{totalSpent.toLocaleString()} spent</span>
                <span>₹{totalBudget.toLocaleString()} total</span>
              </div>
            </div>

            {/* Category Budgets */}
            <div style={{ background: '#1e293b', borderRadius: '12px', padding: '24px', border: '1px solid #334155' }}>
              <h2 style={{ margin: '0 0 20px', fontSize: '16px' }}>Category Budgets</h2>
              {categoryData.length === 0 ? (
                <div style={{ color: '#94a3b8', textAlign: 'center', padding: '40px 0' }}>
                  <p style={{ fontSize: '16px', marginBottom: '8px' }}>No expenses yet!</p>
                  <p style={{ fontSize: '14px' }}>Click <strong style={{ color: '#22c55e' }}>Add Expense</strong> to record your first transaction.</p>
                </div>
              ) : (
                categoryData.map(exp => {
                  const pct = Math.min(Math.round((exp.spent / exp.budget) * 100), 100)
                  const nearLimit = pct >= 85
                  const color = exp.color
                  return (
                    <div key={exp.category} style={{ marginBottom: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>{exp.icon}</span>
                          <span style={{ fontSize: '14px' }}>{exp.category}</span>
                          <span style={{ background: nearLimit ? '#f59e0b22' : '#22c55e22', color: nearLimit ? '#f59e0b' : '#22c55e', padding: '2px 8px', borderRadius: '20px', fontSize: '11px' }}>
                            {nearLimit ? '⚠ Near limit' : '✓ On track'}
                          </span>
                        </div>
                        <span style={{ fontSize: '14px', color: '#94a3b8' }}>₹{exp.spent.toLocaleString()} / ₹{exp.budget.toLocaleString()}</span>
                      </div>
                      <div style={{ background: '#334155', borderRadius: '999px', height: '8px' }}>
                        <div style={{ width: `${pct}%`, background: color, height: '8px', borderRadius: '999px', transition: 'width 0.5s ease' }} />
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '4px' }}>{pct}% used · ₹{(exp.budget - exp.spent).toLocaleString()} left</div>
                    </div>
                  )
                })
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
