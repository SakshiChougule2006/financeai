-- ============================================================
-- FinanceAI — Supabase Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. EXPENSES TABLE
create table if not exists expenses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade,
  description text not null,
  amount      numeric(12,2) not null,
  category    text not null,
  type        text not null check (type in ('expense','income')),
  date        date not null default current_date,
  notes       text,
  created_at  timestamptz default now()
);

-- 2. BUDGETS TABLE
create table if not exists budgets (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade,
  category     text not null,
  limit_amount numeric(12,2) not null,
  month        text not null,   -- format: "2026-03"
  created_at   timestamptz default now(),
  unique(user_id, category, month)
);

-- 3. Row Level Security (RLS) — users can only see their own data
alter table expenses enable row level security;
alter table budgets  enable row level security;

create policy "Users see own expenses"
  on expenses for all
  using (auth.uid() = user_id);

create policy "Users see own budgets"
  on budgets for all
  using (auth.uid() = user_id);

-- ============================================================
-- Done! Your tables are ready.
-- ============================================================
