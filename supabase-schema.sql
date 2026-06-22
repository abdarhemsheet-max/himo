-- =============================================================================
-- HIMO — Life OS: Supabase Schema
-- Run this SQL in the Supabase SQL Editor to create all tables + RLS policies.
-- All tables use UUID PKs, snake_case columns, and public RLS (no auth).
-- =============================================================================

-- ── Workspace Module ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('حكومي', 'خاص')),
  email TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  monthly_value NUMERIC DEFAULT 0,
  recurring_services TEXT[] DEFAULT '{}',
  active_tasks_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  company TEXT DEFAULT '',
  email TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  active_contracts INTEGER DEFAULT 0,
  total_revenue NUMERIC DEFAULT 0,
  projects JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'archived')),
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  due_date TEXT DEFAULT '',
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  billable_hours NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── Finance Module ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('bank', 'cash', 'crypto', 'freelance', 'digital')),
  balance NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'SAR',
  icon TEXT DEFAULT '💳',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS incomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount NUMERIC NOT NULL,
  client TEXT DEFAULT '',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'received')),
  date TEXT NOT NULL,
  wallet_id UUID REFERENCES wallets(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount NUMERIC NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('software', 'life', 'hardware', 'food', 'transport', 'entertainment', 'other')),
  tags TEXT[] DEFAULT '{}',
  description TEXT DEFAULT '',
  date TEXT NOT NULL,
  wallet_id UUID REFERENCES wallets(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  cost NUMERIC DEFAULT 0,
  renewal_date TEXT DEFAULT '',
  category TEXT DEFAULT '',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS debts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creditor TEXT NOT NULL,
  amount NUMERIC DEFAULT 0,
  remaining NUMERIC DEFAULT 0,
  due_date TEXT DEFAULT '',
  type TEXT DEFAULT 'other' CHECK (type IN ('loan', 'credit', 'personal', 'other')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── Quran Module ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS quran_memorizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  surah_id INTEGER NOT NULL,
  from_ayah INTEGER NOT NULL,
  to_ayah INTEGER NOT NULL,
  date_memorized TEXT NOT NULL,
  last_reviewed_date TEXT DEFAULT '',
  next_review_date TEXT DEFAULT '',
  interval INTEGER DEFAULT 1,
  status TEXT DEFAULT 'memorized' CHECK (status IN ('memorized', 'needs-review')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── Courses Module ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  platform TEXT DEFAULT '',
  cover_image TEXT DEFAULT '',
  total_lessons INTEGER DEFAULT 0,
  completed_lessons INTEGER DEFAULT 0,
  total_time_spent INTEGER DEFAULT 0,
  cost NUMERIC DEFAULT 0,
  lessons JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── Habits Module ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('morning', 'evening', 'anytime')),
  streak INTEGER DEFAULT 0,
  completed_dates TEXT[] DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS daily_todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  date TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Documents Module ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  issue_date TEXT DEFAULT '',
  expiry_date TEXT DEFAULT '',
  file_url TEXT DEFAULT '',
  size TEXT DEFAULT '0 B',
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── Row Level Security (public — no auth) ───────────────────────────────────

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE incomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quran_memorizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Single permissive policy for each table (public read/write — single-user app)
CREATE POLICY "public_all" ON companies FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON wallets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON incomes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON subscriptions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON debts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON quran_memorizations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON courses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON habits FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON daily_todos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON documents FOR ALL USING (true) WITH CHECK (true);
