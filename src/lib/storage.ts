import { 
  AgentProfile, 
  AgentVersion, 
  AgentTool, 
  SafetyPolicy, 
  SuccessCriteria, 
  TestRun, 
  Scenario, 
  TestExecution, 
  ExecutionEvent, 
  FailureRecord, 
  FailureDNA, 
  FixRecommendation, 
  TrustScore, 
  RegressionResult 
} from './types';
import { supabase, isSupabaseConfigured } from './supabase';

const STORAGE_KEYS = {
  AGENTS: 'trustos_agents',
  VERSIONS: 'trustos_versions',
  TOOLS: 'trustos_tools',
  POLICIES: 'trustos_policies',
  CRITERIA: 'trustos_criteria',
  TEST_RUNS: 'trustos_test_runs',
  SCENARIOS: 'trustos_scenarios',
  EXECUTIONS: 'trustos_executions',
  EVENTS: 'trustos_events',
  FAILURES: 'trustos_failures',
  FAILURE_DNA: 'trustos_failure_dna',
  RECOMMENDATIONS: 'trustos_recommendations',
  TRUST_SCORES: 'trustos_trust_scores',
  REGRESSIONS: 'trustos_regressions',
};

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Local storage helper
function getLocalItem<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error(`Error reading ${key} from localStorage:`, e);
    return [];
  }
}

function setLocalItem<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving ${key} to localStorage:`, e);
  }
}

// AGENT OPERATIONS
export async function getAgents(): Promise<AgentProfile[]> {
  const localAgents = getLocalItem<AgentProfile>(STORAGE_KEYS.AGENTS);
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('agents').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        const remoteIds = new Set(data.map(a => a.id));
        const missingLocals = localAgents.filter(l => !remoteIds.has(l.id));
        return [...(data as AgentProfile[]), ...missingLocals];
      }
    } catch (e) {
      console.warn('Supabase fetch agents error:', e);
    }
  }
  return localAgents;
}

export async function getAgentById(id: string): Promise<AgentProfile | null> {
  const agents = await getAgents();
  return agents.find(a => a.id === id) || null;
}

export async function createAgentWithDetails(data: {
  profile: Omit<AgentProfile, 'id' | 'created_at' | 'updated_at'>;
  version: Omit<AgentVersion, 'id' | 'agent_id' | 'created_at'>;
  tools: Omit<AgentTool, 'id' | 'agent_version_id' | 'created_at'>[];
  policies: Omit<SafetyPolicy, 'id' | 'agent_version_id' | 'created_at'>[];
  criteria: Omit<SuccessCriteria, 'id' | 'agent_version_id' | 'created_at'>[];
}): Promise<{ agent: AgentProfile; version: AgentVersion }> {
  const now = new Date().toISOString();
  const agentId = generateUUID();
  const versionId = generateUUID();

  const newVersion: AgentVersion = {
    ...data.version,
    id: versionId,
    agent_id: agentId,
    created_at: now,
  };

  const newAgent: AgentProfile = {
    ...data.profile,
    id: agentId,
    current_version_id: versionId,
    created_at: now,
    updated_at: now,
  };

  const newTools: AgentTool[] = data.tools.map(t => ({
    ...t,
    id: generateUUID(),
    agent_version_id: versionId,
    created_at: now,
  }));

  const newPolicies: SafetyPolicy[] = data.policies.map(p => ({
    ...p,
    id: generateUUID(),
    agent_version_id: versionId,
    created_at: now,
  }));

  const newCriteria: SuccessCriteria[] = data.criteria.map(c => ({
    ...c,
    id: generateUUID(),
    agent_version_id: versionId,
    created_at: now,
  }));

  // Save to LocalStorage first
  const agents = getLocalItem<AgentProfile>(STORAGE_KEYS.AGENTS);
  setLocalItem(STORAGE_KEYS.AGENTS, [newAgent, ...agents]);

  const versions = getLocalItem<AgentVersion>(STORAGE_KEYS.VERSIONS);
  setLocalItem(STORAGE_KEYS.VERSIONS, [newVersion, ...versions]);

  const tools = getLocalItem<AgentTool>(STORAGE_KEYS.TOOLS);
  setLocalItem(STORAGE_KEYS.TOOLS, [...newTools, ...tools]);

  const policies = getLocalItem<SafetyPolicy>(STORAGE_KEYS.POLICIES);
  setLocalItem(STORAGE_KEYS.POLICIES, [...newPolicies, ...policies]);

  const criteria = getLocalItem<SuccessCriteria>(STORAGE_KEYS.CRITERIA);
  setLocalItem(STORAGE_KEYS.CRITERIA, [...newCriteria, ...criteria]);

  // Sync to Supabase if configured
  if (isSupabaseConfigured && supabase) {
    try {
      // Omit non-database keys or user_id mismatch if not authenticated
      const supabaseAgentPayload = {
        id: newAgent.id,
        name: newAgent.name,
        description: newAgent.description,
        purpose: newAgent.purpose,
        objective: newAgent.objective,
        environment: newAgent.environment,
        created_at: newAgent.created_at,
        updated_at: newAgent.updated_at
      };

      const supabaseVersionPayload = {
        id: newVersion.id,
        agent_id: newVersion.agent_id,
        version_name: newVersion.version_name,
        system_instructions: newVersion.system_instructions,
        connection_type: newVersion.connection_type,
        endpoint: newVersion.endpoint,
        configuration: newVersion.configuration,
        created_at: newVersion.created_at
      };

      const agentRes = await supabase.from('agents').insert(supabaseAgentPayload);
      const versionRes = await supabase.from('agent_versions').insert(supabaseVersionPayload);

      if (newTools.length) await supabase.from('tools').insert(newTools);
      if (newPolicies.length) await supabase.from('safety_policies').insert(newPolicies);
      if (newCriteria.length) await supabase.from('success_criteria').insert(newCriteria);

      if (!agentRes.error && !versionRes.error) {
        await supabase.from('agents').update({ current_version_id: versionId }).eq('id', agentId);
      }
    } catch (err) {
      console.warn('Supabase sync warning:', err);
    }
  }

  return { agent: newAgent, version: newVersion };
}

// VERSION & CONFIG DETAILS
export async function getAgentVersion(versionId: string): Promise<AgentVersion | null> {
  const versions = getLocalItem<AgentVersion>(STORAGE_KEYS.VERSIONS);
  return versions.find(v => v.id === versionId) || null;
}

export async function getAgentVersions(agentId: string): Promise<AgentVersion[]> {
  const versions = getLocalItem<AgentVersion>(STORAGE_KEYS.VERSIONS);
  return versions.filter(v => v.agent_id === agentId);
}

export async function getAgentTools(versionId: string): Promise<AgentTool[]> {
  const tools = getLocalItem<AgentTool>(STORAGE_KEYS.TOOLS);
  return tools.filter(t => t.agent_version_id === versionId);
}

export async function getSafetyPolicies(versionId: string): Promise<SafetyPolicy[]> {
  const policies = getLocalItem<SafetyPolicy>(STORAGE_KEYS.POLICIES);
  return policies.filter(p => p.agent_version_id === versionId);
}

export async function getSuccessCriteria(versionId: string): Promise<SuccessCriteria[]> {
  const criteria = getLocalItem<SuccessCriteria>(STORAGE_KEYS.CRITERIA);
  return criteria.filter(c => c.agent_version_id === versionId);
}

// TEST RUNS & SCENARIOS
export async function getTestRuns(versionId?: string): Promise<TestRun[]> {
  const localRuns = getLocalItem<TestRun>(STORAGE_KEYS.TEST_RUNS);
  if (versionId) return localRuns.filter(r => r.agent_version_id === versionId);
  return localRuns.sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());
}

export async function getTestRunById(id: string): Promise<TestRun | null> {
  const runs = await getTestRuns();
  return runs.find(r => r.id === id) || null;
}

export async function createTestRun(run: Omit<TestRun, 'id' | 'started_at'>): Promise<TestRun> {
  const now = new Date().toISOString();
  const id = generateUUID();
  const newRun: TestRun = { ...run, id, started_at: now };

  const runs = getLocalItem<TestRun>(STORAGE_KEYS.TEST_RUNS);
  setLocalItem(STORAGE_KEYS.TEST_RUNS, [newRun, ...runs]);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('test_runs').insert(newRun);
    } catch (e) {
      console.warn('Supabase test run insert error:', e);
    }
  }
  return newRun;
}

export async function updateTestRun(id: string, updates: Partial<TestRun>): Promise<void> {
  const runs = getLocalItem<TestRun>(STORAGE_KEYS.TEST_RUNS);
  const updated = runs.map(r => r.id === id ? { ...r, ...updates } : r);
  setLocalItem(STORAGE_KEYS.TEST_RUNS, updated);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('test_runs').update(updates).eq('id', id);
    } catch (e) {}
  }
}

export async function saveScenarios(scenarios: Scenario[]): Promise<void> {
  const existing = getLocalItem<Scenario>(STORAGE_KEYS.SCENARIOS);
  setLocalItem(STORAGE_KEYS.SCENARIOS, [...scenarios, ...existing]);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('scenarios').insert(scenarios);
    } catch (e) {}
  }
}

export async function getScenarios(testRunId: string): Promise<Scenario[]> {
  const scenarios = getLocalItem<Scenario>(STORAGE_KEYS.SCENARIOS);
  return scenarios.filter(s => s.test_run_id === testRunId);
}

// EXECUTIONS & FAILURES
export async function saveTestExecution(execution: TestExecution, events: ExecutionEvent[]): Promise<void> {
  const executions = getLocalItem<TestExecution>(STORAGE_KEYS.EXECUTIONS);
  setLocalItem(STORAGE_KEYS.EXECUTIONS, [execution, ...executions.filter(e => e.id !== execution.id)]);

  const allEvents = getLocalItem<ExecutionEvent>(STORAGE_KEYS.EVENTS);
  setLocalItem(STORAGE_KEYS.EVENTS, [...events, ...allEvents]);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('test_executions').insert(execution);
      if (events.length) await supabase.from('execution_events').insert(events);
    } catch (e) {}
  }
}

export async function getExecutions(testRunId: string): Promise<TestExecution[]> {
  const scenarios = await getScenarios(testRunId);
  const scenarioIds = new Set(scenarios.map(s => s.id));
  const executions = getLocalItem<TestExecution>(STORAGE_KEYS.EXECUTIONS);
  const events = getLocalItem<ExecutionEvent>(STORAGE_KEYS.EVENTS);

  return executions
    .filter(e => scenarioIds.has(e.scenario_id))
    .map(e => ({
      ...e,
      events: events.filter(ev => ev.execution_id === e.id).sort((a,b) => a.sequence_number - b.sequence_number)
    }));
}

export async function saveFailureRecord(failure: FailureRecord, dna?: FailureDNA, recs?: FixRecommendation[]): Promise<void> {
  const failures = getLocalItem<FailureRecord>(STORAGE_KEYS.FAILURES);
  setLocalItem(STORAGE_KEYS.FAILURES, [failure, ...failures]);

  if (dna) {
    const dnas = getLocalItem<FailureDNA>(STORAGE_KEYS.FAILURE_DNA);
    setLocalItem(STORAGE_KEYS.FAILURE_DNA, [dna, ...dnas]);
  }

  if (recs && recs.length) {
    const recommendations = getLocalItem<FixRecommendation>(STORAGE_KEYS.RECOMMENDATIONS);
    setLocalItem(STORAGE_KEYS.RECOMMENDATIONS, [...recs, ...recommendations]);
  }

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('failures').insert(failure);
      if (dna) await supabase.from('failure_dna').insert(dna);
      if (recs) await supabase.from('recommendations').insert(recs);
    } catch (e) {}
  }
}

export async function getFailuresForTestRun(testRunId: string): Promise<FailureRecord[]> {
  const scenarios = await getScenarios(testRunId);
  const scenarioIds = new Set(scenarios.map(s => s.id));
  const failures = getLocalItem<FailureRecord>(STORAGE_KEYS.FAILURES);
  return failures.filter(f => scenarioIds.has(f.scenario_id));
}

export async function getAllFailures(): Promise<FailureRecord[]> {
  return getLocalItem<FailureRecord>(STORAGE_KEYS.FAILURES);
}

export async function getFailureDNA(failureId: string): Promise<FailureDNA | null> {
  const dnas = getLocalItem<FailureDNA>(STORAGE_KEYS.FAILURE_DNA);
  return dnas.find(d => d.failure_id === failureId) || null;
}

export async function getRecommendations(failureId: string): Promise<FixRecommendation[]> {
  const recs = getLocalItem<FixRecommendation>(STORAGE_KEYS.RECOMMENDATIONS);
  return recs.filter(r => r.failure_id === failureId);
}

// TRUST SCORES
export async function saveTrustScore(score: TrustScore): Promise<void> {
  const scores = getLocalItem<TrustScore>(STORAGE_KEYS.TRUST_SCORES);
  setLocalItem(STORAGE_KEYS.TRUST_SCORES, [score, ...scores]);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('trust_scores').insert(score);
    } catch (e) {}
  }
}

export async function getTrustScore(testRunId: string): Promise<TrustScore | null> {
  const scores = getLocalItem<TrustScore>(STORAGE_KEYS.TRUST_SCORES);
  return scores.find(s => s.test_run_id === testRunId) || null;
}

// REGRESSIONS
export async function saveRegressions(regressions: RegressionResult[]): Promise<void> {
  const existing = getLocalItem<RegressionResult>(STORAGE_KEYS.REGRESSIONS);
  setLocalItem(STORAGE_KEYS.REGRESSIONS, [...regressions, ...existing]);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('regression_results').insert(regressions);
    } catch (e) {}
  }
}

export async function getRegressionsForVersion(versionId: string): Promise<RegressionResult[]> {
  const regs = getLocalItem<RegressionResult>(STORAGE_KEYS.REGRESSIONS);
  return regs.filter(r => r.new_version_id === versionId || r.previous_version_id === versionId);
}

export function clearAllLocalData(): void {
  if (typeof window === 'undefined') return;
  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
}
