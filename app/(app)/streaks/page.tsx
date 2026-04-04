'use client'
import { useState, useEffect } from 'react'
import Topbar from '@/components/Topbar'
import { supabase } from '@/lib/supabase'

function getDateStr(date: Date) {
  return date.toISOString().split('T')[0]
}

function getLast30Days() {
  const days = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(getDateStr(d))
  }
  return days
}

export default function Streaks() {
  const [noSpendDays, setNoSpendDays] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [marking, setMarking] = useState(false)
  const [showFirework, setShowFirework] = useState(false)

  const today = getDateStr(new Date())
  const last30 = getLast30Days()

  useEffect(() => {
    loadDays()
  }, [])

  const loadDays = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const { data } = await supabase
      .from('no_spend_days')
      .select('date')
      .eq('user_id', session.user.id)
    setNoSpendDays((data || []).map((d: any) => d.date))
    setLoading(false)
  }

  const toggleToday = async () => {
    setMarking(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const isNoSpend = noSpendDays.includes(today)

    if (isNoSpend) {
      await supabase.from('no_spend_days')
        .delete()
        .eq('user_id', session.user.id)
        .eq('date', today)
      setNoSpendDays(p => p.filter(d => d !== today))
    } else {
      await supabase.from('no_spend_days').insert({
        user_id: session.user.id,
        date: today,
      })
      setNoSpendDays(p => [...p, today])
      setShowFirework(true)
      setTimeout(() => setShowFirework(false), 3000)
    }
    setMarking(false)
  }

  // Calculate current streak
  const getCurrentStreak = () => {
    let streak = 0
    const d = new Date()
    while (true) {
      const dateStr = getDateStr(d)
      if (noSpendDays.includes(dateStr)) {
        streak++
        d.setDate(d.getDate() - 1)
      } else break
    }
    return streak
  }

  // Calculate longest streak
  const getLongestStreak = () => {
    if (noSpendDays.length === 0) return 0
    const sorted = [...noSpendDays].sort()
    let longest = 1, current = 1
    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(sorted[i - 1])
      const curr = new Date(sorted[i])
      const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
      if (diff === 1) {
        current++
        longest = Math.max(longest, current)
      } else {
        current = 1
      }
    }
    return longest
  }

  const currentStreak = getCurrentStreak()
  const longestStreak = getLongestStreak()
  const totalNoSpendDays = noSpendDays.length
  const todayIsNoSpend = noSpendDays.includes(today)

  const getFlameSize = (streak: number) => {
    if (streak >= 30) return '🔥🔥🔥'
    if (streak >= 14) return '🔥🔥'
    if (streak >= 3) return '🔥'
    return '✨'
  }

  const getDayOfWeek = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', { weekday: 'short' }).slice(0, 1)
  }

  const getMonthDay = (dateStr: string) => {
    return new Date(dateStr).getDate()
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Firework animation */}
      {showFirework && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none', zIndex: 999,
        }}>
          <div style={{ fontSize: '80px', animation: 'bounce 0.5s ease infinite alternate' }}>
            🔥
          </div>
          <style>{`
            @keyframes bounce {
              from { transform: scale(1) rotate(-10deg); }
              to { transform: scale(1.3) rotate(10deg); }
            }
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
          <div style={{
            position: 'absolute', top: '30%', fontSize: '24px', fontWeight: 'bold',
            color: '#f59e0b', animation: 'fadeIn 0.5s ease',
            textShadow: '0 0 20px rgba(245,158,11,0.8)'
          }}>
            No Spend Day! {getFlameSize(currentStreak + 1)}
          </div>
        </div>
      )}

      <Topbar title="No Spend Day Streaks" subtitle="Track days you didn't spend any money" />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          {
            label: 'Current Streak',
            value: currentStreak,
            suffix: 'days',
            color: currentStreak >= 3 ? '#f59e0b' : '#00c878',
            icon: getFlameSize(currentStreak),
          },
          {
            label: 'Longest Streak',
            value: longestStreak,
            suffix: 'days',
            color: '#8b5cf6',
            icon: '🏆',
          },
          {
            label: 'Total No-Spend Days',
            value: totalNoSpendDays,
            suffix: 'days',
            color: '#3b82f6',
            icon: '📅',
          },
        ].map(stat => (
          <div key={stat.label} className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '28px', marginBottom: '4px' }}>{stat.icon}</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Today's button */}
      <div className="card mb-6" style={{ textAlign: 'center', padding: '32px' }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>
          {todayIsNoSpend ? '🔥' : '💸'}
        </div>
        <p style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
          {todayIsNoSpend ? `You're on a ${currentStreak}-day streak!` : "Did you spend money today?"}
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>
          {todayIsNoSpend
            ? 'Amazing! Keep it going 💪'
            : "Mark today as a No Spend Day if you didn't spend anything!"}
        </p>
        <button
          onClick={toggleToday}
          disabled={marking}
          style={{
            padding: '14px 32px',
            borderRadius: '12px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: 'bold',
            background: todayIsNoSpend ? '#ef444420' : '#f59e0b',
            color: todayIsNoSpend ? '#ef4444' : '#000',
            transition: 'all 0.2s',
          }}>
          {marking ? 'Saving...' : todayIsNoSpend ? '❌ Unmark Today' : '🔥 Mark as No Spend Day!'}
        </button>
      </div>

      {/* Last 30 days calendar */}
      <div className="card mb-6">
        <p className="font-semibold mb-4">Last 30 Days</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '8px' }}>
          {last30.map(date => {
            const isNoSpend = noSpendDays.includes(date)
            const isToday = date === today
            return (
              <div key={date}
                title={date}
                style={{
                  aspectRatio: '1',
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isNoSpend ? '#f59e0b20' : '#1e293b',
                  border: isToday ? '2px solid #f59e0b' : isNoSpend ? '1px solid #f59e0b60' : '1px solid #334155',
                  cursor: 'default',
                  fontSize: '11px',
                }}>
                <span style={{ color: isNoSpend ? '#f59e0b' : '#64748b', fontSize: '14px' }}>
                  {isNoSpend ? '🔥' : '·'}
                </span>
                <span style={{ color: isToday ? '#f59e0b' : '#64748b', fontSize: '10px' }}>
                  {getMonthDay(date)}
                </span>
              </div>
            )
          })}
        </div>
        <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
          <span>🔥 No spend day</span>
          <span style={{ border: '2px solid #f59e0b', borderRadius: '4px', padding: '0 4px' }}>Today</span>
          <span>· Spent money</span>
        </div>
      </div>

      {/* Streak milestones */}
      <div className="card">
        <p className="font-semibold mb-4">Streak Milestones</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { days: 3,  icon: '🌱', label: 'Getting Started',  desc: '3-day streak' },
            { days: 7,  icon: '⚡', label: 'One Week Warrior', desc: '7-day streak' },
            { days: 14, icon: '💪', label: 'Two Week Champion', desc: '14-day streak' },
            { days: 30, icon: '👑', label: 'Monthly Master',   desc: '30-day streak' },
          ].map(m => {
            const achieved = longestStreak >= m.days
            return (
              <div key={m.days} style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px',
                borderRadius: '10px',
                background: achieved ? '#f59e0b10' : '#1e293b',
                border: `1px solid ${achieved ? '#f59e0b40' : '#334155'}`,
                opacity: achieved ? 1 : 0.5,
              }}>
                <div style={{ fontSize: '24px' }}>{m.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', fontSize: '14px', color: achieved ? '#f59e0b' : 'var(--text-secondary)' }}>{m.label}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{m.desc}</div>
                </div>
                {achieved
                  ? <span style={{ background: '#f59e0b20', color: '#f59e0b', padding: '4px 10px', borderRadius: '20px', fontSize: '12px' }}>✓ Achieved!</span>
                  : <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{m.days - currentStreak > 0 ? `${m.days - currentStreak} days to go` : 'Almost!'}</span>
                }
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
