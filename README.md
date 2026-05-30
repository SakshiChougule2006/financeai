# FinanceAI — Smart Personal Finance Manager

A full-stack SaaS web app built with Next.js, Supabase, Tailwind CSS, and Recharts.

🌐 **Live Demo**: https://financeai-cglq.vercel.app

---

## ✨ Features

- 📊 **Dashboard** — Real-time budget overview with bar & pie charts
- ➕ **Add Expense** — Log income and expenses with categories
- 💰 **Budget Tracker** — Set and monitor monthly category budgets
- 🤖 **AI Insights** — Personalized spending analysis
- 🎆 **Festival Budget Planner** — Plan budgets for Diwali, Holi, weddings & more
- 🔥 **No Spend Day Streaks** — Track days you didn't spend with fire animations
- 👥 **Group Expense Splitting** — Split bills with friends like Splitwise
- 🔐 **Secure Auth** — Login/Signup with Supabase Auth
- 📱 **Mobile Friendly** — Works on all devices

---

## ⚡ Quick Start

### Step 1 — Prerequisites
Make sure these are installed:
- **Node.js** (v18+): https://nodejs.org
- **VS Code**: https://code.visualstudio.com
- **Git**: https://git-scm.com

Check in terminal:
```bash
node -v
npm -v
```

---

### Step 2 — Open Project in VS Code
1. Copy the `financeai` folder to your Desktop
2. Open VS Code → **File → Open Folder** → select `financeai`
3. Open terminal: **Ctrl + `**

---

### Step 3 — Install Dependencies
```bash
npm install
```

---

### Step 4 — Set Up Supabase

1. Go to **https://supabase.com** → Sign up → New Project
2. Go to **Settings → API** → copy:
   - **Project URL**
   - **anon public key**
3. Go to **SQL Editor** → run this SQL:

```sql
-- Expenses table
CREATE TABLE expenses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  description text NOT NULL,
  amount numeric NOT NULL,
  category text NOT NULL,
  type text NOT NULL,
  date date NOT NULL,
  created_at timestamp DEFAULT now()
);

-- Budgets table
CREATE TABLE budgets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  total_budget numeric DEFAULT 20000,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  UNIQUE(user_id)
);

-- Festival budgets table
CREATE TABLE festival_budgets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  festival_name text NOT NULL,
  festival_date date NOT NULL,
  total_budget numeric DEFAULT 0,
  categories jsonb DEFAULT '[]',
  created_at timestamp DEFAULT now()
);

-- Groups table
CREATE TABLE groups (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  name text NOT NULL,
  members jsonb DEFAULT '[]',
  created_at timestamp DEFAULT now()
);

-- Group expenses table
CREATE TABLE group_expenses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE,
  description text NOT NULL,
  amount numeric NOT NULL,
  paid_by text NOT NULL,
  split_among jsonb DEFAULT '[]',
  created_at timestamp DEFAULT now()
);

-- No spend days table
CREATE TABLE no_spend_days (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  date date NOT NULL,
  created_at timestamp DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable Row Level Security
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE festival_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE no_spend_days ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can only see own expenses" ON expenses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only see own budget" ON budgets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only see own festivals" ON festival_budgets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only see own groups" ON groups FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only see own no spend days" ON no_spend_days FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can see expenses of own groups" ON group_expenses FOR ALL USING (
  EXISTS (SELECT 1 FROM groups WHERE groups.id = group_expenses.group_id AND groups.user_id = auth.uid())
);
```

---

### Step 5 — Configure Environment Variables

Create `.env.local` in project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

### Step 6 — Run the App
```bash
npm run dev
```

Open: **http://localhost:3000** 🎉

---

## 📁 Folder Structure

```
financeai/
│
├── app/
│   ├── (app)/                  ← Main app pages (with sidebar)
│   │   ├── layout.tsx
│   │   ├── add-expense/
│   │   │   └── page.tsx        ← Add expense form
│   │   ├── budget/
│   │   │   └── page.tsx        ← Budget tracker
│   │   ├── insights/
│   │   │   └── page.tsx        ← AI insights page
│   │   ├── festivals/
│   │   │   └── page.tsx        ← Festival budget planner
│   │   ├── streaks/
│   │   │   └── page.tsx        ← No spend day streaks
│   │   └── groups/
│   │       └── page.tsx        ← Group expense splitting
│   ├── api/
│   │   ├── ai-tips/
│   │   │   └── route.ts        ← AI tips API
│   │   └── insights/
│   │       └── route.ts        ← AI insights API
│   ├── dashboard/
│   │   └── page.tsx            ← Main dashboard
│   ├── login/
│   │   └── page.tsx            ← Login/Signup page
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── Sidebar.tsx             ← Navigation sidebar + mobile nav
│   └── Topbar.tsx              ← Page header
│
├── lib/
│   └── supabase.ts             ← Supabase client
│
├── .env.local                  ← 🔑 Secret keys (never share!)
├── tailwind.config.js
├── tsconfig.json
├── next.config.js
└── package.json
```

---

## 🎨 Pages

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/dashboard` | Overview with charts & budget |
| Add Expense | `/add-expense` | Log income or expenses |
| Budget | `/budget` | Category budget tracking |
| AI Insights | `/insights` | Spending analysis |
| Festivals | `/festivals` | Festival budget planner |
| No Spend | `/streaks` | No spend day streaks 🔥 |
| Groups | `/groups` | Split bills with friends |

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 14 | Frontend framework |
| Supabase | Database + Authentication |
| Tailwind CSS | Styling |
| Recharts | Charts & graphs |
| Vercel | Deployment |

---

## 🚀 Deployment

1. Push to GitHub
2. Go to **https://vercel.com** → Import project
3. Add environment variables in Vercel settings
4. Deploy! ✅

---

## 🛠️ Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Run production build |

---

## ❓ Troubleshooting

**"Failed to fetch" on login**
→ Your Supabase project may be paused. Go to supabase.com and click "Resume project"

**"Module not found" error**
→ Run `npm install` again

**Blank page / no styles**
→ Stop server (Ctrl+C) and run `npm run dev` again

**Budget showing wrong value**
→ Update budget on dashboard and it will save to Supabase

---

Built with ❤️ using Next.js · Supabase · Tailwind CSS · Recharts
