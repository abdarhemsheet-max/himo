-- =============================================================================
-- HIMO — Public RLS: Full Anon Access on All Tables
-- Run this in Supabase SQL Editor to guarantee all CRUD operations work.
-- These policies allow SELECT / INSERT / UPDATE / DELETE for the anon role
-- without authentication (single-user personal app).
-- =============================================================================

-- ── Helper: drop existing policies so this script is idempotent ─────────────

DO $$ BEGIN
  -- Workspace
  DROP POLICY IF EXISTS "public_all" ON companies;       DROP POLICY IF EXISTS "public_select" ON companies;
  DROP POLICY IF EXISTS "public_insert" ON companies;     DROP POLICY IF EXISTS "public_update" ON companies;
  DROP POLICY IF EXISTS "public_delete" ON companies;
  DROP POLICY IF EXISTS "public_all" ON clients;          DROP POLICY IF EXISTS "public_select" ON clients;
  DROP POLICY IF EXISTS "public_insert" ON clients;       DROP POLICY IF EXISTS "public_update" ON clients;
  DROP POLICY IF EXISTS "public_delete" ON clients;
  DROP POLICY IF EXISTS "public_all" ON tasks;            DROP POLICY IF EXISTS "public_select" ON tasks;
  DROP POLICY IF EXISTS "public_insert" ON tasks;         DROP POLICY IF EXISTS "public_update" ON tasks;
  DROP POLICY IF EXISTS "public_delete" ON tasks;
  -- Finance
  DROP POLICY IF EXISTS "public_all" ON wallets;          DROP POLICY IF EXISTS "public_select" ON wallets;
  DROP POLICY IF EXISTS "public_insert" ON wallets;       DROP POLICY IF EXISTS "public_update" ON wallets;
  DROP POLICY IF EXISTS "public_delete" ON wallets;
  DROP POLICY IF EXISTS "public_all" ON incomes;          DROP POLICY IF EXISTS "public_select" ON incomes;
  DROP POLICY IF EXISTS "public_insert" ON incomes;       DROP POLICY IF EXISTS "public_update" ON incomes;
  DROP POLICY IF EXISTS "public_delete" ON incomes;
  DROP POLICY IF EXISTS "public_all" ON expenses;         DROP POLICY IF EXISTS "public_select" ON expenses;
  DROP POLICY IF EXISTS "public_insert" ON expenses;      DROP POLICY IF EXISTS "public_update" ON expenses;
  DROP POLICY IF EXISTS "public_delete" ON expenses;
  DROP POLICY IF EXISTS "public_all" ON subscriptions;    DROP POLICY IF EXISTS "public_select" ON subscriptions;
  DROP POLICY IF EXISTS "public_insert" ON subscriptions; DROP POLICY IF EXISTS "public_update" ON subscriptions;
  DROP POLICY IF EXISTS "public_delete" ON subscriptions;
  DROP POLICY IF EXISTS "public_all" ON debts;            DROP POLICY IF EXISTS "public_select" ON debts;
  DROP POLICY IF EXISTS "public_insert" ON debts;         DROP POLICY IF EXISTS "public_update" ON debts;
  DROP POLICY IF EXISTS "public_delete" ON debts;
  -- Quran
  DROP POLICY IF EXISTS "public_all" ON quran_memorizations;       DROP POLICY IF EXISTS "public_select" ON quran_memorizations;
  DROP POLICY IF EXISTS "public_insert" ON quran_memorizations;    DROP POLICY IF EXISTS "public_update" ON quran_memorizations;
  DROP POLICY IF EXISTS "public_delete" ON quran_memorizations;
  -- Courses
  DROP POLICY IF EXISTS "public_all" ON courses;          DROP POLICY IF EXISTS "public_select" ON courses;
  DROP POLICY IF EXISTS "public_insert" ON courses;       DROP POLICY IF EXISTS "public_update" ON courses;
  DROP POLICY IF EXISTS "public_delete" ON courses;
  -- Habits
  DROP POLICY IF EXISTS "public_all" ON habits;           DROP POLICY IF EXISTS "public_select" ON habits;
  DROP POLICY IF EXISTS "public_insert" ON habits;        DROP POLICY IF EXISTS "public_update" ON habits;
  DROP POLICY IF EXISTS "public_delete" ON habits;
  DROP POLICY IF EXISTS "public_all" ON daily_todos;      DROP POLICY IF EXISTS "public_select" ON daily_todos;
  DROP POLICY IF EXISTS "public_insert" ON daily_todos;   DROP POLICY IF EXISTS "public_update" ON daily_todos;
  DROP POLICY IF EXISTS "public_delete" ON daily_todos;
  -- Documents
  DROP POLICY IF EXISTS "public_all" ON documents;        DROP POLICY IF EXISTS "public_select" ON documents;
  DROP POLICY IF EXISTS "public_insert" ON documents;     DROP POLICY IF EXISTS "public_update" ON documents;
  DROP POLICY IF EXISTS "public_delete" ON documents;
END $$;

-- ── Recreate granular policies for every table ─────────────────────────────

CREATE POLICY "public_select" ON companies FOR SELECT USING (true);
CREATE POLICY "public_insert" ON companies FOR INSERT WITH CHECK (true);
CREATE POLICY "public_update" ON companies FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "public_delete" ON companies FOR DELETE USING (true);

CREATE POLICY "public_select" ON clients FOR SELECT USING (true);
CREATE POLICY "public_insert" ON clients FOR INSERT WITH CHECK (true);
CREATE POLICY "public_update" ON clients FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "public_delete" ON clients FOR DELETE USING (true);

CREATE POLICY "public_select" ON tasks FOR SELECT USING (true);
CREATE POLICY "public_insert" ON tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "public_update" ON tasks FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "public_delete" ON tasks FOR DELETE USING (true);

CREATE POLICY "public_select" ON wallets FOR SELECT USING (true);
CREATE POLICY "public_insert" ON wallets FOR INSERT WITH CHECK (true);
CREATE POLICY "public_update" ON wallets FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "public_delete" ON wallets FOR DELETE USING (true);

CREATE POLICY "public_select" ON incomes FOR SELECT USING (true);
CREATE POLICY "public_insert" ON incomes FOR INSERT WITH CHECK (true);
CREATE POLICY "public_update" ON incomes FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "public_delete" ON incomes FOR DELETE USING (true);

CREATE POLICY "public_select" ON expenses FOR SELECT USING (true);
CREATE POLICY "public_insert" ON expenses FOR INSERT WITH CHECK (true);
CREATE POLICY "public_update" ON expenses FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "public_delete" ON expenses FOR DELETE USING (true);

CREATE POLICY "public_select" ON subscriptions FOR SELECT USING (true);
CREATE POLICY "public_insert" ON subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "public_update" ON subscriptions FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "public_delete" ON subscriptions FOR DELETE USING (true);

CREATE POLICY "public_select" ON debts FOR SELECT USING (true);
CREATE POLICY "public_insert" ON debts FOR INSERT WITH CHECK (true);
CREATE POLICY "public_update" ON debts FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "public_delete" ON debts FOR DELETE USING (true);

CREATE POLICY "public_select" ON quran_memorizations FOR SELECT USING (true);
CREATE POLICY "public_insert" ON quran_memorizations FOR INSERT WITH CHECK (true);
CREATE POLICY "public_update" ON quran_memorizations FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "public_delete" ON quran_memorizations FOR DELETE USING (true);

CREATE POLICY "public_select" ON courses FOR SELECT USING (true);
CREATE POLICY "public_insert" ON courses FOR INSERT WITH CHECK (true);
CREATE POLICY "public_update" ON courses FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "public_delete" ON courses FOR DELETE USING (true);

CREATE POLICY "public_select" ON habits FOR SELECT USING (true);
CREATE POLICY "public_insert" ON habits FOR INSERT WITH CHECK (true);
CREATE POLICY "public_update" ON habits FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "public_delete" ON habits FOR DELETE USING (true);

CREATE POLICY "public_select" ON daily_todos FOR SELECT USING (true);
CREATE POLICY "public_insert" ON daily_todos FOR INSERT WITH CHECK (true);
CREATE POLICY "public_update" ON daily_todos FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "public_delete" ON daily_todos FOR DELETE USING (true);

CREATE POLICY "public_select" ON documents FOR SELECT USING (true);
CREATE POLICY "public_insert" ON documents FOR INSERT WITH CHECK (true);
CREATE POLICY "public_update" ON documents FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "public_delete" ON documents FOR DELETE USING (true);
