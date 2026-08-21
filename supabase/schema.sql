-- TRUSTOS DATABASE SCHEMA (SUPABASE POSTGRESQL)
-- Run this in your Supabase SQL Editor to set up tables and RLS policies.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  organization TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. AGENTS
CREATE TABLE IF NOT EXISTS public.agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  purpose TEXT NOT NULL,
  objective TEXT NOT NULL,
  environment TEXT NOT NULL DEFAULT 'Development',
  current_version_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. AGENT VERSIONS
CREATE TABLE IF NOT EXISTS public.agent_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  version_name TEXT NOT NULL,
  system_instructions TEXT NOT NULL,
  connection_type TEXT NOT NULL DEFAULT 'simulated_agent',
  endpoint TEXT,
  configuration JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add Foreign key constraint to current_version_id after table creation
ALTER TABLE public.agents 
  DROP CONSTRAINT IF EXISTS fk_current_version,
  ADD CONSTRAINT fk_current_version FOREIGN KEY (current_version_id) REFERENCES public.agent_versions(id) ON DELETE SET NULL;

-- 4. TOOLS
CREATE TABLE IF NOT EXISTS public.tools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_version_id UUID NOT NULL REFERENCES public.agent_versions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'Custom',
  endpoint TEXT,
  method TEXT DEFAULT 'POST',
  input_schema TEXT,
  output_schema TEXT,
  risk_level TEXT NOT NULL DEFAULT 'LOW',
  is_read_only BOOLEAN DEFAULT true,
  is_destructive BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SAFETY POLICIES
CREATE TABLE IF NOT EXISTS public.safety_policies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_version_id UUID NOT NULL REFERENCES public.agent_versions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'MEDIUM',
  human_confirmation_required BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. SUCCESS CRITERIA
CREATE TABLE IF NOT EXISTS public.success_criteria (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_version_id UUID NOT NULL REFERENCES public.agent_versions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'required_behavior',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TEST RUNS
CREATE TABLE IF NOT EXISTS public.test_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_version_id UUID NOT NULL REFERENCES public.agent_versions(id) ON DELETE CASCADE,
  test_type TEXT NOT NULL DEFAULT 'Standard',
  difficulty TEXT NOT NULL DEFAULT 'Moderate',
  scenario_count INT NOT NULL DEFAULT 10,
  selected_categories JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  overall_score NUMERIC(5,2)
);

-- 8. SCENARIOS
CREATE TABLE IF NOT EXISTS public.scenarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_run_id UUID NOT NULL REFERENCES public.test_runs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'Moderate',
  risk_level TEXT NOT NULL DEFAULT 'LOW',
  initial_context TEXT NOT NULL,
  user_prompt TEXT NOT NULL,
  expected_behavior TEXT NOT NULL,
  potential_failure_conditions TEXT NOT NULL,
  required_tools JSONB DEFAULT '[]'::jsonb,
  evaluation_criteria TEXT NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. TEST EXECUTIONS
CREATE TABLE IF NOT EXISTS public.test_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scenario_id UUID NOT NULL REFERENCES public.scenarios(id) ON DELETE CASCADE,
  agent_version_id UUID NOT NULL REFERENCES public.agent_versions(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  final_result TEXT,
  score NUMERIC(5,2)
);

-- 10. EXECUTION EVENTS
CREATE TABLE IF NOT EXISTS public.execution_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  execution_id UUID NOT NULL REFERENCES public.test_executions(id) ON DELETE CASCADE,
  sequence_number INT NOT NULL,
  event_type TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  input_data TEXT,
  output_data TEXT,
  tool_name TEXT,
  latency_ms INT DEFAULT 0
);

-- 11. FAILURES
CREATE TABLE IF NOT EXISTS public.failures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  execution_id UUID NOT NULL REFERENCES public.test_executions(id) ON DELETE CASCADE,
  scenario_id UUID NOT NULL REFERENCES public.scenarios(id) ON DELETE CASCADE,
  failure_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'HIGH',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  evidence TEXT NOT NULL,
  root_cause TEXT NOT NULL,
  detected_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. FAILURE DNA
CREATE TABLE IF NOT EXISTS public.failure_dna (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  failure_id UUID NOT NULL REFERENCES public.failures(id) ON DELETE CASCADE,
  nodes JSONB NOT NULL DEFAULT '[]'::jsonb,
  relationships JSONB NOT NULL DEFAULT '[]'::jsonb,
  explanation TEXT NOT NULL
);

-- 13. RECOMMENDATIONS
CREATE TABLE IF NOT EXISTS public.recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  failure_id UUID NOT NULL REFERENCES public.failures(id) ON DELETE CASCADE,
  recommendation TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'HIGH',
  explanation TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. TRUST SCORES
CREATE TABLE IF NOT EXISTS public.trust_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_run_id UUID NOT NULL REFERENCES public.test_runs(id) ON DELETE CASCADE,
  reliability NUMERIC(5,2) NOT NULL,
  safety NUMERIC(5,2) NOT NULL,
  goal_adherence NUMERIC(5,2) NOT NULL,
  tool_discipline NUMERIC(5,2) NOT NULL,
  robustness NUMERIC(5,2) NOT NULL,
  consistency NUMERIC(5,2) NOT NULL,
  error_recovery NUMERIC(5,2) NOT NULL,
  policy_compliance NUMERIC(5,2) NOT NULL,
  overall_score NUMERIC(5,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. REGRESSION RESULTS
CREATE TABLE IF NOT EXISTS public.regression_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  previous_version_id UUID NOT NULL REFERENCES public.agent_versions(id) ON DELETE CASCADE,
  new_version_id UUID NOT NULL REFERENCES public.agent_versions(id) ON DELETE CASCADE,
  scenario_id UUID NOT NULL REFERENCES public.scenarios(id) ON DELETE CASCADE,
  scenario_title TEXT NOT NULL,
  previous_result TEXT NOT NULL,
  new_result TEXT NOT NULL,
  regression_detected BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.success_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_runs ENABLE ROW LEVEL SECURITY;

-- Helper RLS Policies for Owner Access
CREATE POLICY "Users access own profile" ON public.profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own agents" ON public.agents FOR ALL USING (auth.uid() = user_id);

-- Version policies via parent agent
CREATE POLICY "Users access own agent versions" ON public.agent_versions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.agents WHERE agents.id = agent_versions.agent_id AND agents.user_id = auth.uid())
);
CREATE POLICY "Users access own tools" ON public.tools FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.agent_versions av 
    JOIN public.agents a ON a.id = av.agent_id 
    WHERE av.id = tools.agent_version_id AND a.user_id = auth.uid()
  )
);
CREATE POLICY "Users access own safety policies" ON public.safety_policies FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.agent_versions av 
    JOIN public.agents a ON a.id = av.agent_id 
    WHERE av.id = safety_policies.agent_version_id AND a.user_id = auth.uid()
  )
);
CREATE POLICY "Users access own success criteria" ON public.success_criteria FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.agent_versions av 
    JOIN public.agents a ON a.id = av.agent_id 
    WHERE av.id = success_criteria.agent_version_id AND a.user_id = auth.uid()
  )
);
CREATE POLICY "Users access own test runs" ON public.test_runs FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.agent_versions av 
    JOIN public.agents a ON a.id = av.agent_id 
    WHERE av.id = test_runs.agent_version_id AND a.user_id = auth.uid()
  )
);
