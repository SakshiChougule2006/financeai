import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Expense = {
  id: string
  user_id: string
  description: string
  amount: number
  category: string
  type: 'expense' | 'income'
  date: string
  created_at: string
}

export type Budget = {
  id: string
  user_id: string
  category: string
  limit_amount: number
  month: string
}

export const CATEGORIES = [
  { name: 'Food & Grocery',     color: '#00c878', icon: '🛒' },
  { name: 'Bills & Utilities',  color: '#3b82f6', icon: '⚡' },
  { name: 'Transport',          color: '#f59e0b', icon: '🚗' },
  { name: 'Entertainment',      color: '#8b5cf6', icon: '🎬' },
  { name: 'Health',             color: '#06b6d4', icon: '💊' },
  { name: 'Shopping',           color: '#ec4899', icon: '🛍️' },
  { name: 'Education',          color: '#14b8a6', icon: '📚' },
  { name: 'Other',              color: '#6b7280', icon: '📦' },
]
