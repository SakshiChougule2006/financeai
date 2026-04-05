'use client'
import { useState } from 'react'
import Topbar from '@/components/Topbar'
import { Sparkles, TrendingUp, TrendingDown, AlertCircle, Lightbulb, RefreshCw, ChevronRight } from 'lucide-react'

const staticInsights = [
  {
    type: 'warning',
    icon: TrendingUp,
    color: '#fbbf24',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.2)',
    title: 'Food spending 22% above average',
    text: 'You spent ₹5,200 on food this month vs your 3-month avg of ₹4,260. Try cooking at home 2 extra days/week to save ~₹940.',
    tag: 'Food & Grocery',
  },
  {
    type: 'success',
    icon: TrendingUp,
    color: '#00c878',
    bg: 'rgba(0,200,120,0.06)',
    border: 'rgba(0,200,120,0.15)',
    title: 'Excellent savings rate this month!',
    text: "You've saved 59% of your income — well above the recommended 20%. At this rate you'll hit your ₹1L savings goal in about 2 months.",
    tag: 'Savings',
  },
  {
    type: 'danger',
    icon: AlertCircle,
    color: '#f87171',
    bg: 'rgba(248,113,113,0.06)',
    border: 'rgba(248,113,113,0.2)',
    title: 'Entertainment budget nearly exhausted',
    text: '₹1,849 of ₹2,000 entertainment budget used (92%). Consider pausing an OTT subscription or moving ₹500 from your shopping budget.',
    tag: 'Entertainment',
  },
  {
    type: 'tip',
    icon: Lightbulb,
    color: '#a78bfa',
    bg: 'rgba(139,92,246,0.06)',
    border: 'rgba(139,92,246,0.15)',
    title: 'Best day to shop: Tuesdays',
    text: 'Your average Tuesday spend is ₹320 — the lowest of any weekday. Big purchases on weekends cost you 3× more on average.',
    tag: 'Smart Habit',
  },
]

export default function Insights() {
  const [aiResponse, setAiResponse]   = useState('')
  const [aiLoading,  setAiLoading]    = useState(false)
  const [question,   setQuestion]     = useState('')

  const askAI = async (q?: string) => {
    const prompt = q || question
    if (!prompt.trim()) return
    setAiLoading(true)
    setAiResponse('')

    try {
      const res  = await fetch('/api/insights', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ question: prompt }),
      })
      const data = await res.json()
      setAiResponse(data.answer || 'No response received.')
    } catch {
      setAiResponse('Could not reach AI. Check your API key in .env.local.')
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
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(0,200,120,0.15)' }}>
            <Sparkles size={15} color="#00c878" />
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ fontFamily: 'var(--font-display)' }}>Ask your AI advisor</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Powered by Grok AI</p>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <input className="input flex-1" placeholder="e.g. How can I save more money next month?"
            value={question} onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && askAI()} />
          <button className="btn-primary px-4 py-2 text-sm" onClick={() => askAI()} disabled={aiLoading}>
            {aiLoading ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {aiLoading ? 'Thinking...' : 'Ask AI'}
          </button>
        </div>

        {/* Quick questions */}
        <div className="flex flex-wrap gap-2 mb-4">
          {quickQuestions.map(q => (
            <button key={q} onClick={() => { setQuestion(q); askAI(q) }}
              className="text-xs px-3 py-1.5 rounded-xl transition-all"
              style={{ background: 'var(--bg-base)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,200,120,0.4)'; e.currentTarget.style.color = '#00c878' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}>
              {q}
            </button>
          ))}
        </div>

        {/* AI Response */}
        {aiLoading && (
          <div className="p-4 rounded-xl ai-shimmer" style={{ border: '1px solid rgba(0,200,120,0.15)' }}>
            <div className="flex items-center gap-2">
              <Sparkles size={14} color="#00c878" />
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Grok is analyzing your finances...</span>
            </div>
          </div>
        )}
        {aiResponse && !aiLoading && (
          <div className="p-4 rounded-xl animate-fade-in" style={{ background: 'var(--bg-base)', border: '1px solid rgba(0,200,120,0.15)' }}>
            <div className="flex items-start gap-2">
              <Sparkles size={14} color="#00c878" className="mt-0.5 flex-shrink-0" />
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                {aiResponse}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Static Insights */}
      <p className="text-xs font-medium uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>
        This month's analysis
      </p>
      <div className="grid grid-cols-2 gap-4">
        {staticInsights.map((ins, i) => (
          <div key={i} className="card transition-all cursor-pointer group"
            style={{ background: ins.bg, border: `1px solid ${ins.border}` }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: `${ins.color}18` }}>
                <ins.icon size={16} color={ins.color} />
              </div>
              <span className="badge text-xs" style={{ background: `${ins.color}15`, color: ins.color }}>
                {ins.tag}
              </span>
            </div>
            <p className="font-semibold text-sm mb-2" style={{ fontFamily: 'var(--font-display)', color: ins.color }}>
              {ins.title}
            </p>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {ins.text}
            </p>
            <div className="flex items-center gap-1 mt-3 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: ins.color }}>
              <span>Ask AI about this</span>
              <ChevronRight size={12} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
