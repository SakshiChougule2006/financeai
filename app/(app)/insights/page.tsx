'use client'
import { useState, useEffect } from 'react'
import Topbar from '@/components/Topbar'
import { Sparkles, TrendingUp, TrendingDown, AlertCircle, Lightbulb, RefreshCw, ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function Insights() {
  const [aiResponse, setAiResponse] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [question, setQuestion] = useState('')
  const [expenses, setExpenses] = useState<any[]>([])
  const [insights, setInsights] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const { data } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('type', 'expense')
      const exp = data || []
      setExpenses(exp)
      generateInsights(exp)
      setLoading(false)
    }
    load()
  }, [])

  const generateInsights = (exp: any[]) => {
    if (exp.length === 0) { setInsights([]); return }

    const result: any[] = []

    // Group by category
    const byCategory: Record<string, number> = {}
    exp.forEach(e => {
      byCategory[e.category] = (byCategory[e.category] || 0) + Number(e.amount)
    })

    const BUDGETS: Record<string, number> = {
      'Food & Grocery': 6000, 'Bills & Utilities': 4000,
      'Transport': 3000, 'Entertainment': 2000,
      'Shopping': 5000, 'Health': 2000, 'Education': 2000, 'Other': 2000,
    }

    // Check over budget categories
    Object.entries(byCategory).forEach(([cat, spent]) => {
      const budget = BUDGETS[cat] || 2000
      const pct = Math.round((spent / budget) * 100)
      if (pct >= 90) {
        result.push({
          type: 'danger',
          icon: AlertCircle,
          color: '#f87171',
          bg: 'rgba(248,113,113,0.06)',
          border: 'rgba(248,113,113,0.2)',
          title: `${cat} budget ${pct > 100 ? 'exceeded' : 'nearly exhausted'}`,
          text: `₹${spent.toLocaleString()} of ₹${budget.toLocaleString()} ${cat} budget used (${pct}%). Consider reducing ${cat} spending this month.`,
          tag: cat,
        })
      } else if (pct < 50) {
        result.push({
          type: 'success',
          icon: TrendingDown,
          color: '#00c878',
          bg: 'rgba(0,200,120,0.06)',
          border: 'rgba(0,200,120,0.15)',
          title: `Great control on ${cat}!`,
          text: `You've only used ${pct}% of your ${cat} budget (₹${spent.toLocaleString()} of ₹${budget.toLocaleString()}). Keep it up!`,
          tag: cat,
        })
      }
    })

    // Top spending category
    const topCat = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0]
    if (topCat) {
      result.push({
        type: 'warning',
        icon: TrendingUp,
        color: '#fbbf24',
        bg: 'rgba(245,158,11,0.08)',
        border: 'rgba(245,158,11,0.2)',
        title: `Highest spending: ${topCat[0]}`,
        text: `Your biggest expense category is ${topCat[0]} at ₹${Number(topCat[1]).toLocaleString()}. Look for ways to reduce this for better savings.`,
        tag: 'Top Spend',
      })
    }

    // Total spent insight
    const total = exp.reduce((s, e) => s + Number(e.amount), 0)
    result.push({
      type: 'tip',
      icon: Lightbulb,
      color: '#a78bfa',
      bg: 'rgba(139,92,246,0.06)',
      border: 'rgba(139,92,246,0.15)',
      title: `Total spending: ₹${total.toLocaleString()}`,
      text: `You have ${exp.length} transactions recorded. Regular tracking helps you save 20% more on average. Keep logging your expenses!`,
      tag: 'Smart Habit',
    })

    setInsights(result.slice(0, 4))
  }

  const askAI = async (q?: string) => {
    const prompt = q || question
    if (!prompt.trim()) return
    setAiLoading(true)
    setAiResponse('')

    // Build expense summary
    const byCategory: Record<string, number> = {}
    expenses.forEach(e => {
      byCategory[e.category] = (byCategory[e.category] || 0) + Number(e.amount)
    })
    const summary = Object.entries(byCategory).map(([k, v]) => `${k}: ₹${v}`).join(', ')
    const total = expenses.reduce((s, e) => s + Number(e.amount), 0)

    try {
      const res = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: prompt, summary, total }),
      })
      const data = await res.json()
      setAiResponse(data.answer || 'No response received.')
    } catch {
      setAiResponse('Could not reach AI. Please try again.')
    } finally {
      setAiLoading(false)
    }
  }

  const quickQuestions = [
    'How can I reduce my food expenses?',
    'Am I saving enough for retirement?',
    'Where am I wasting the most money?',
    'Give me a budget plan for next month',
  ]

  return (
    <div>
      <Topbar title="AI Insights" subtitle="Powered by Grok — your personal finance advisor" />

      {/* AI Chat Box */}
      <div className="card mb-6" style={{ border: '1px solid rgba(0,200,120,0.2)', background: 'rgba(0,200,120,0.03)' }}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0,200,120,0.15)' }}>
            <Sparkles size={15} color="#00c878" />
          </div>
          <div>
            <p className="font-semibold text-sm">Ask your AI advisor</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Powered by Grok AI</p>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <input className="input flex-1" placeholder="e.g. How can I save more money next month?"
            value={question} onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && askAI()} />
          <button className="btn-primary px-4 py-2 text-sm" onClick={() => askAI()} disabled={aiLoading}>
            {aiLoading ? <RefreshCw size={14} /> : <Sparkles size={14} />}
            {aiLoading ? 'Thinking...' : 'Ask AI'}
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {quickQuestions.map(q => (
            <button key={q} onClick={() => { setQuestion(q); askAI(q) }}
              className="text-xs px-3 py-1.5 rounded-xl transition-all"
              style={{ background: 'var(--bg-base)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
              {q}
            </button>
          ))}
        </div>

        {aiLoading && (
          <div className="p-4 rounded-xl" style={{ border: '1px solid rgba(0,200,120,0.15)' }}>
            <div className="flex items-center gap-2">
              <Sparkles size={14} color="#00c878" />
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Grok is analyzing your finances...</span>
            </div>
          </div>
        )}
        {aiResponse && !aiLoading && (
          <div className="p-4 rounded-xl" style={{ background: 'var(--bg-base)', border: '1px solid rgba(0,200,120,0.15)' }}>
            <div className="flex items-start gap-2">
              <Sparkles size={14} color="#00c878" />
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                {aiResponse}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Real Insights */}
      <p className="text-xs font-medium uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>
        This month's analysis
      </p>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading your insights...</p>
      ) : insights.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📊</div>
          <p style={{ fontWeight: '600', marginBottom: '8px' }}>No insights yet!</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Add some expenses to get personalized insights.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {insights.map((ins, i) => (
            <div key={i} className="card transition-all cursor-pointer group"
              style={{ background: ins.bg, border: `1px solid ${ins.border}` }}
              onClick={() => { setQuestion(ins.title); askAI(ins.title) }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${ins.color}18` }}>
                  <ins.icon size={16} color={ins.color} />
                </div>
                <span className="badge text-xs" style={{ background: `${ins.color}15`, color: ins.color }}>{ins.tag}</span>
              </div>
              <p className="font-semibold text-sm mb-2" style={{ color: ins.color }}>{ins.title}</p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{ins.text}</p>
              <div className="flex items-center gap-1 mt-3 text-xs opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: ins.color }}>
                <span>Ask AI about this</span>
                <ChevronRight size={12} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
