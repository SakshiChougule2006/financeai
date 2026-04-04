# FinanceAI — AI Personal Finance Assistant

A full-stack SaaS web app built with Next.js 14, Supabase, and Claude AI.

---

## ⚡ Quick Start (Step-by-Step for VS Code)

### Step 1 — Prerequisites
Make sure these are installed on your computer:
- **Node.js** (v18+): https://nodejs.org → download LTS version
- **VS Code**: https://code.visualstudio.com
- **Git**: https://git-scm.com

To check, open VS Code terminal (Ctrl + `) and run:
```bash
node -v       # should show v18 or higher
npm -v        # should show 9 or higher
```

---

### Step 2 — Open Project in VS Code
1. Copy the `financeai` folder to your Desktop (or anywhere you like)
2. Open VS Code
3. Click **File → Open Folder** → select the `financeai` folder
4. Open the terminal: **Terminal → New Terminal** (or press Ctrl + `)

---

### Step 3 — Install Dependencies
In the VS Code terminal, run:
```bash
npm install
```
This downloads all packages (takes 1-2 minutes). You'll see a `node_modules` folder appear.

---

### Step 4 — Set Up Supabase (Free Database)

1. Go to **https://supabase.com** → Sign up for free
2. Click **New Project** → give it a name like `financeai` → set a password → Create
3. Wait 1-2 minutes for your project to be ready
4. Go to **Settings → API** (left sidebar)
5. Copy:
   - **Project URL** (looks like: https://xxxx.supabase.co)
   - **anon public** key (long string starting with `eyJ...`)

6. Go to **SQL Editor** (left sidebar) → **New Query**
7. Open the file `supabase-schema.sql` from this project
8. Copy all the SQL code and paste it into the editor → Click **Run**
9. You should see "Success" — your tables are created!

---

### Step 5 — Set Up Anthropic API (Claude AI)

1. Go to **https://console.anthropic.com** → Sign up
2. Click **API Keys** → **Create Key**
3. Copy the key (starts with `sk-ant-...`)

---

### Step 6 — Configure Environment Variables
1. In VS Code, open the file `.env.local`
2. Replace the placeholder values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
ANTHROPIC_API_KEY=sk-ant-api03-...
```

Save the file (Ctrl + S).

---

### Step 7 — Run the App
```bash
npm run dev
```

Open your browser and go to: **http://localhost:3000**

You should see the FinanceAI dashboard! 🎉

---

## 📁 Folder Structure

```
financeai/
│
├── app/                        ← Next.js App Router
│   ├── (app)/                  ← Main app pages (with sidebar)
│   │   ├── layout.tsx          ← App layout with sidebar
│   │   ├── dashboard/
│   │   │   └── page.tsx        ← Dashboard page
│   │   ├── add-expense/
│   │   │   └── page.tsx        ← Add expense form
│   │   ├── budget/
│   │   │   └── page.tsx        ← Budget tracker
│   │   └── insights/
│   │       └── page.tsx        ← AI insights page
│   ├── api/
│   │   └── insights/
│   │       └── route.ts        ← Backend API: calls Claude AI
│   ├── globals.css             ← Global styles & design system
│   ├── layout.tsx              ← Root HTML layout
│   └── page.tsx                ← Root redirect to /dashboard
│
├── components/
│   ├── Sidebar.tsx             ← Left sidebar navigation
│   └── Topbar.tsx              ← Page header with search & bell
│
├── lib/
│   └── supabase.ts             ← Supabase client + types
│
├── .env.local                  ← 🔑 Your secret API keys (never share!)
├── .gitignore                  ← Files Git will ignore
├── supabase-schema.sql         ← Database tables SQL
├── tailwind.config.js          ← Tailwind CSS config
├── tsconfig.json               ← TypeScript config
├── next.config.js              ← Next.js config
└── package.json                ← Project dependencies
```

---

## 🛠️ Available Commands

| Command         | What it does                        |
|-----------------|-------------------------------------|
| `npm run dev`   | Start development server (port 3000)|
| `npm run build` | Build for production                |
| `npm start`     | Run production build                |

---

## 🎨 Pages

| Page          | Route          | Description                          |
|---------------|----------------|--------------------------------------|
| Dashboard     | `/dashboard`   | Overview, charts, recent transactions|
| Add Expense   | `/add-expense` | Form to log income or expenses       |
| Budget        | `/budget`      | Set and track category budgets       |
| AI Insights   | `/insights`    | Ask Claude AI questions about money  |

---

## 🔌 Connecting Real Data (Supabase)

Currently the app uses sample data. To connect real Supabase data,
replace the sample arrays in each page with Supabase queries like:

```typescript
import { supabase } from '@/lib/supabase'

// Fetch expenses
const { data, error } = await supabase
  .from('expenses')
  .select('*')
  .order('date', { ascending: false })
  .limit(10)
```

---

## 🚀 Deployment (after completing the prototype)
We'll cover Vercel deployment in the next step.
It's as simple as: push to GitHub → connect to Vercel → done!

---

## ❓ Troubleshooting

**"Module not found" error**
→ Run `npm install` again

**Blank page / no styles**
→ Make sure you saved all files. Try stopping (Ctrl+C) and rerunning `npm run dev`

**AI not working**
→ Check your `ANTHROPIC_API_KEY` in `.env.local` is correct and has no spaces

**Supabase error**
→ Double-check your URL and key in `.env.local`. Make sure the SQL schema was run.

---

Built with ❤️ using Next.js · Supabase · Claude AI · Tailwind CSS
