# TRUSTOS — Supabase Setup & Migration Guide

TRUSTOS uses Supabase PostgreSQL as its primary database layer with Row Level Security (RLS) policies for multi-tenant user isolation.

---

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and create a new project.
2. Go to **Project Settings -> API** and copy:
   - `Project URL`
   - `anon / public API key`

---

## 2. Configure Environment Variables

Create `.env.local` in your root project directory:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_GEMINI_API_KEY=your-gemini-key-here # Optional
```

---

## 3. Execute Database Schema SQL

Open the **SQL Editor** in your Supabase Dashboard and run the complete schema script located at:

`supabase/schema.sql`

This script creates:
- `profiles`
- `agents`
- `agent_versions`
- `tools` (With risk level classification: LOW, MEDIUM, HIGH, CRITICAL)
- `safety_policies`
- `success_criteria`
- `test_runs`
- `scenarios`
- `test_executions`
- `execution_events`
- `failures`
- `failure_dna`
- `recommendations`
- `trust_scores`
- `regression_results`
- RLS Policies for secure multi-tenant access.

---

## 4. Dual-Sync Zero-Setup Mode

If Supabase environment variables are not specified, TRUSTOS automatically operates in **Zero-Setup Mode**, storing state dynamically in client storage while providing 100% of evaluation capabilities out of the box!
