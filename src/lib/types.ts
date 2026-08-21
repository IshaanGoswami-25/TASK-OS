export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type EnvironmentType = 'Development' | 'Staging' | 'Production';
export type ToolType = 'API' | 'Database' | 'Search' | 'FileSystem' | 'Email' | 'Payment' | 'Calendar' | 'Custom';
export type ConnectionType = 'api_endpoint' | 'webhook' | 'custom_adapter' | 'simulated_agent';

export interface AgentProfile {
  id: string;
  user_id: string;
  name: string;
  description: string;
  purpose: string;
  objective: string;
  organization?: string;
  environment: EnvironmentType;
  current_version_id?: string;
  created_at: string;
  updated_at: string;
}

export interface AgentVersion {
  id: string;
  agent_id: string;
  version_name: string;
  system_instructions: string;
  connection_type: ConnectionType;
  endpoint?: string;
  configuration: Record<string, any>;
  created_at: string;
}

export interface AgentTool {
  id: string;
  agent_version_id: string;
  name: string;
  description: string;
  type: ToolType;
  endpoint?: string;
  method?: string;
  input_schema?: string;
  output_schema?: string;
  risk_level: RiskLevel;
  is_read_only: boolean;
  is_destructive: boolean;
  created_at: string;
}

export interface SafetyPolicy {
  id: string;
  agent_version_id: string;
  title: string;
  description: string;
  severity: RiskLevel;
  human_confirmation_required: boolean;
  created_at: string;
}

export interface SuccessCriteria {
  id: string;
  agent_version_id: string;
  title: string;
  description: string;
  type: 'required_behavior' | 'forbidden_behavior' | 'output_requirement' | 'tool_use_requirement' | 'confirmation_requirement' | 'escalation_requirement';
  created_at: string;
}

export type TestType = 'Standard' | 'Adversarial' | 'Safety' | 'Tool Reliability' | 'Goal Adherence' | 'Custom';
export type TestDifficulty = 'Basic' | 'Moderate' | 'Hard' | 'Extreme' | 'Adaptive';
export type TestStatus = 'pending' | 'generating' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface TestRun {
  id: string;
  agent_version_id: string;
  test_type: TestType;
  difficulty: TestDifficulty;
  scenario_count: number;
  selected_categories: string[];
  status: TestStatus;
  started_at: string;
  completed_at?: string;
  overall_score?: number;
}

export interface Scenario {
  id: string;
  test_run_id: string;
  title: string;
  description: string;
  category: string;
  difficulty: TestDifficulty;
  risk_level: RiskLevel;
  initial_context: string;
  user_prompt: string;
  expected_behavior: string;
  potential_failure_conditions: string;
  required_tools: string[];
  evaluation_criteria: string;
  generated_at: string;
}

export interface ExecutionEvent {
  id: string;
  execution_id: string;
  sequence_number: number;
  event_type: 'user_input' | 'agent_decision' | 'tool_selection' | 'tool_input' | 'tool_response' | 'agent_next_action' | 'final_response' | 'policy_check';
  timestamp: string;
  input_data?: string;
  output_data?: string;
  tool_name?: string;
  latency_ms: number;
}

export interface TestExecution {
  id: string;
  scenario_id: string;
  agent_version_id: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  started_at: string;
  completed_at?: string;
  final_result?: string;
  score?: number;
  events?: ExecutionEvent[];
}

export type FailureType = 
  | 'goal_drift'
  | 'tool_misuse'
  | 'tool_loop'
  | 'hallucination'
  | 'safety_violation'
  | 'destructive_action'
  | 'prompt_injection'
  | 'contradiction_handling_failure'
  | 'error_recovery_failure'
  | 'silent_failure'
  | 'other';

export interface FailureRecord {
  id: string;
  execution_id: string;
  scenario_id: string;
  failure_type: FailureType;
  severity: RiskLevel;
  title: string;
  description: string;
  evidence: string;
  root_cause: string;
  detected_at: string;
}

export interface DNANode {
  id: string;
  label: string;
  type: 'user_request' | 'agent_decision' | 'tool_call' | 'conflicting_info' | 'goal_drift' | 'unsafe_action' | 'failure';
  description: string;
  timestamp: string;
  evidenceSnippet?: string;
}

export interface FailureDNA {
  id: string;
  failure_id: string;
  nodes: DNANode[];
  relationships: { source: string; target: string }[];
  explanation: string;
}

export interface FixRecommendation {
  id: string;
  failure_id: string;
  recommendation: string;
  priority: RiskLevel;
  explanation: string;
  created_at: string;
}

export interface TrustScore {
  id: string;
  test_run_id: string;
  reliability: number;
  safety: number;
  goal_adherence: number;
  tool_discipline: number;
  robustness: number;
  consistency: number;
  error_recovery: number;
  policy_compliance: number;
  overall_score: number;
  created_at: string;
}

export interface RegressionResult {
  id: string;
  previous_version_id: string;
  new_version_id: string;
  scenario_id: string;
  scenario_title: string;
  previous_result: 'passed' | 'failed';
  new_result: 'passed' | 'failed';
  regression_detected: boolean;
  created_at: string;
}

export type TrustLevel = 'TRUSTED' | 'SUPERVISION REQUIRED' | 'HIGH RISK' | 'DO NOT DEPLOY' | 'NOT EVALUATED';
