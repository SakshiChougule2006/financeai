'use client'
import { useState, useEffect } from 'react'
import Topbar from '@/components/Topbar'
import { supabase } from '@/lib/supabase'
import { PlusCircle, Trash2, ChevronDown, ChevronUp, Users, Receipt } from 'lucide-react'

export default function Groups() {
  const [groups, setGroups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [showAddGroup, setShowAddGroup] = useState(false)
  const [showAddExpense, setShowAddExpense] = useState<string | null>(null)

  // New group form
  const [groupName, setGroupName] = useState('')
  const [members, setMembers] = useState('')
  const [savingGroup, setSavingGroup] = useState(false)

  // New expense form
  const [expDesc, setExpDesc] = useState('')
  const [expAmount, setExpAmount] = useState('')
  const [expPaidBy, setExpPaidBy] = useState('')
  const [expSplitAmong, setExpSplitAmong] = useState<string[]>([])
  const [savingExp, setSavingExp] = useState(false)

  useEffect(() => { loadGroups() }, [])

  const loadGroups = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const { data: groupData } = await supabase
      .from('groups')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (!groupData) { setLoading(false); return }

    // Load expenses for each group
    const withExpenses = await Promise.all(groupData.map(async g => {
      const { data: expenses } = await supabase
        .from('group_expenses')
        .select('*')
        .eq('group_id', g.id)
        .order('created_at', { ascending: false })
      return { ...g, expenses: expenses || [] }
    }))

    setGroups(withExpenses)
    setLoading(false)
  }

  const handleAddGroup = async () => {
    if (!groupName || !members) return
    setSavingGroup(true)
    const { data: { session } } = await supabase.auth.getSession()
    const memberList = members.split(',').map(m => m.trim()).filter(Boolean)
    await supabase.from('groups').insert({
      user_id: session?.user.id,
      name: groupName,
      members: memberList,
    })
    setGroupName('')
    setMembers('')
    setShowAddGroup(false)
    setSavingGroup(false)
    loadGroups()
  }

  const handleAddExpense = async (group: any) => {
    if (!expDesc || !expAmount || !expPaidBy || expSplitAmong.length === 0) return
    setSavingExp(true)
    const perPerson = parseFloat(expAmount) / expSplitAmong.length
    const splitData = expSplitAmong.map(m => ({
      name: m,
      owes: m === expPaidBy ? -(parseFloat(expAmount) - perPerson) : perPerson,
    }))
    await supabase.from('group_expenses').insert({
      group_id: group.id,
      description: expDesc,
      amount: parseFloat(expAmount),
      paid_by: expPaidBy,
      split_among: splitData,
    })
    setExpDesc('')
    setExpAmount('')
    setExpPaidBy('')
    setExpSplitAmong([])
    setShowAddExpense(null)
    setSavingExp(false)
    loadGroups()
  }

  const handleDeleteGroup = async (id: string) => {
    await supabase.from('groups').delete().eq('id', id)
    loadGroups()
  }

  const handleDeleteExpense = async (id: string) => {
    await supabase.from('group_expenses').delete().eq('id', id)
    loadGroups()
  }

  // Calculate balances for a group
  const getBalances = (group: any) => {
    const balances: Record<string, number> = {}
    group.members.forEach((m: string) => balances[m] = 0)
    group.expenses.forEach((exp: any) => {
      exp.split_among.forEach((s: any) => {
        balances[s.name] = (balances[s.name] || 0) + s.owes
      })
    })
    return balances
  }

  return (
    <div>
      <Topbar title="Group Expense Splitting" subtitle="Split bills with friends and family" />

      {/* Add Group Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <button className="btn-primary" onClick={() => setShowAddGroup(true)}>
          <PlusCircle size={15} /> New Group
        </button>
      </div>

      {/* Add Group Form */}
      {showAddGroup && (
        <div className="card mb-6" style={{ border: '1px solid #334155' }}>
          <p className="font-semibold mb-4">Create New Group</p>
          <div className="mb-4">
            <label className="label">Group Name</label>
            <input className="input" placeholder="e.g. Goa Trip, Office Lunch"
              value={groupName} onChange={e => setGroupName(e.target.value)} />
          </div>
          <div className="mb-5">
            <label className="label">Members (comma separated)</label>
            <input className="input" placeholder="e.g. Rahul, Priya, Amit, You"
              value={members} onChange={e => setMembers(e.target.value)} />
            <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>
              Include yourself in the list!
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn-primary flex-1 justify-center" onClick={handleAddGroup} disabled={savingGroup}>
              {savingGroup ? 'Creating...' : <><Users size={15} /> Create Group</>}
            </button>
            <button className="btn-ghost px-4" onClick={() => setShowAddGroup(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Groups List */}
      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
      ) : groups.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>👥</div>
          <p style={{ fontWeight: '600', marginBottom: '8px' }}>No groups yet!</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '16px' }}>
            Create a group to start splitting expenses with friends.
          </p>
          <button className="btn-primary" onClick={() => setShowAddGroup(true)}>
            <PlusCircle size={15} /> Create First Group
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {groups.map(group => {
            const isExpanded = expanded === group.id
            const totalExp = group.expenses.reduce((s: number, e: any) => s + e.amount, 0)
            const balances = getBalances(group)

            return (
              <div key={group.id} className="card">
                {/* Group Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#22c55e20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={18} color="#22c55e" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', fontSize: '16px' }}>{group.name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                      {group.members.join(', ')}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: '700', fontSize: '16px', color: '#22c55e' }}>₹{totalExp.toLocaleString()}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{group.expenses.length} expenses</div>
                  </div>
                  <button onClick={() => setExpanded(isExpanded ? null : group.id)}
                    style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                  <button onClick={() => handleDeleteGroup(group.id)}
                    style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Balances */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  {Object.entries(balances).map(([name, amount]) => (
                    <div key={name} style={{
                      padding: '4px 10px', borderRadius: '20px', fontSize: '12px',
                      background: amount < -0.01 ? '#22c55e15' : amount > 0.01 ? '#ef444415' : '#334155',
                      color: amount < -0.01 ? '#22c55e' : amount > 0.01 ? '#ef4444' : '#94a3b8',
                      border: `1px solid ${amount < -0.01 ? '#22c55e30' : amount > 0.01 ? '#ef444430' : '#334155'}`,
                    }}>
                      {name}: {amount < -0.01 ? `gets back ₹${Math.abs(amount).toFixed(0)}` : amount > 0.01 ? `owes ₹${amount.toFixed(0)}` : 'settled'}
                    </div>
                  ))}
                </div>

                {/* Add Expense Button */}
                <button
                  onClick={() => { setShowAddExpense(group.id); setExpSplitAmong(group.members) }}
                  style={{ width: '100%', padding: '8px', background: '#22c55e15', color: '#22c55e', border: '1px dashed #22c55e40', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', marginBottom: isExpanded ? '16px' : '0' }}>
                  <PlusCircle size={13} style={{ display: 'inline', marginRight: '4px' }} />
                  Add Expense
                </button>

                {/* Add Expense Form */}
                {showAddExpense === group.id && (
                  <div style={{ background: 'var(--bg-base)', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="label text-xs">Description</label>
                        <input className="input text-sm py-2" placeholder="e.g. Hotel, Dinner"
                          value={expDesc} onChange={e => setExpDesc(e.target.value)} />
                      </div>
                      <div>
                        <label className="label text-xs">Amount (₹)</label>
                        <input className="input text-sm py-2" type="number" placeholder="0"
                          value={expAmount} onChange={e => setExpAmount(e.target.value)} />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="label text-xs">Paid By</label>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {group.members.map((m: string) => (
                          <button key={m} onClick={() => setExpPaidBy(m)}
                            style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer',
                              background: expPaidBy === m ? '#22c55e20' : 'var(--bg-card)',
                              color: expPaidBy === m ? '#22c55e' : 'var(--text-muted)',
                              border: `1px solid ${expPaidBy === m ? '#22c55e' : 'var(--border)'}` }}>
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="label text-xs">Split Among</label>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {group.members.map((m: string) => (
                          <button key={m}
                            onClick={() => setExpSplitAmong(p => p.includes(m) ? p.filter(x => x !== m) : [...p, m])}
                            style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer',
                              background: expSplitAmong.includes(m) ? '#3b82f620' : 'var(--bg-card)',
                              color: expSplitAmong.includes(m) ? '#3b82f6' : 'var(--text-muted)',
                              border: `1px solid ${expSplitAmong.includes(m) ? '#3b82f6' : 'var(--border)'}` }}>
                            {m}
                          </button>
                        ))}
                      </div>
                      {expAmount && expSplitAmong.length > 0 && (
                        <p style={{ color: '#3b82f6', fontSize: '12px', marginTop: '6px' }}>
                          ₹{(parseFloat(expAmount) / expSplitAmong.length).toFixed(0)} per person
                        </p>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn-primary flex-1 justify-center text-sm"
                        onClick={() => handleAddExpense(group)} disabled={savingExp}>
                        {savingExp ? 'Adding...' : <><Receipt size={13} /> Add Expense</>}
                      </button>
                      <button className="btn-ghost text-sm px-3" onClick={() => setShowAddExpense(null)}>Cancel</button>
                    </div>
                  </div>
                )}

                {/* Expenses List */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Expenses
                    </p>
                    {group.expenses.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', padding: '20px 0' }}>No expenses yet. Add one above!</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {group.expenses.map((exp: any) => (
                          <div key={exp.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: 'var(--bg-base)', borderRadius: '8px' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: '500', fontSize: '14px' }}>{exp.description}</div>
                              <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                                Paid by <span style={{ color: '#22c55e' }}>{exp.paid_by}</span> · Split {exp.split_among.length} ways
                              </div>
                            </div>
                            <div style={{ fontWeight: '600', color: '#22c55e' }}>₹{exp.amount.toLocaleString()}</div>
                            <button onClick={() => handleDeleteExpense(exp.id)}
                              style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
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
