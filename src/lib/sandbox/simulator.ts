import { AgentTool, ExecutionEvent, Scenario, TestExecution, AgentVersion } from '../types';

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export interface SimulationResult {
  execution: TestExecution;
  events: ExecutionEvent[];
  passed: boolean;
  failureDetails?: {
    type: string;
    title: string;
    description: string;
    evidence: string;
    rootCause: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    dnaNodes: any[];
  };
}

export async function simulateScenarioExecution(
  scenario: Scenario,
  agentVersion: AgentVersion,
  tools: AgentTool[]
): Promise<SimulationResult> {
  const executionId = generateUUID();
  const now = new Date().toISOString();
  const events: ExecutionEvent[] = [];

  let sequence = 1;

  // Event 1: User Input
  events.push({
    id: generateUUID(),
    execution_id: executionId,
    sequence_number: sequence++,
    event_type: 'user_input',
    timestamp: new Date().toISOString(),
    input_data: scenario.user_prompt,
    latency_ms: 12
  });

  // Event 2: Agent Decision / Reasoning
  const primaryTool = tools.find(t => scenario.required_tools.includes(t.name)) || tools[0];
  const isAdversarial = scenario.category.toLowerCase().includes('violation') || 
                        scenario.category.toLowerCase().includes('injection') ||
                        scenario.category.toLowerCase().includes('drift') ||
                        scenario.category.toLowerCase().includes('misuse') ||
                        scenario.category.toLowerCase().includes('unsafe');

  const failProbability = scenario.risk_level === 'CRITICAL' ? 0.45 :
                          scenario.risk_level === 'HIGH' ? 0.35 : 0.15;
  const shouldFail = isAdversarial && Math.random() < failProbability;

  events.push({
    id: generateUUID(),
    execution_id: executionId,
    sequence_number: sequence++,
    event_type: 'agent_decision',
    timestamp: new Date().toISOString(),
    output_data: `Analyzed user request: "${scenario.user_prompt}". Selected action path using tool: ${primaryTool ? primaryTool.name : 'Internal Reasoner'}.`,
    latency_ms: 240
  });

  // Event 3 & 4: Tool Selection & Call
  if (primaryTool) {
    events.push({
      id: generateUUID(),
      execution_id: executionId,
      sequence_number: sequence++,
      event_type: 'tool_selection',
      timestamp: new Date().toISOString(),
      tool_name: primaryTool.name,
      input_data: JSON.stringify({
        endpoint: primaryTool.endpoint || '/api/v1/action',
        method: primaryTool.method || 'POST',
        risk_level: primaryTool.risk_level,
        is_destructive: primaryTool.is_destructive
      }),
      latency_ms: 45
    });

    events.push({
      id: generateUUID(),
      execution_id: executionId,
      sequence_number: sequence++,
      event_type: 'tool_input',
      timestamp: new Date().toISOString(),
      tool_name: primaryTool.name,
      input_data: JSON.stringify({
        query: scenario.user_prompt,
        schema: primaryTool.input_schema || '{ "param": "value" }',
        bypass_check: shouldFail && primaryTool.risk_level === 'CRITICAL'
      }),
      latency_ms: 18
    });

    // Event 5: Tool Response (Sandboxed Mock Response)
    let toolOutput = '';
    let toolLatency = Math.floor(Math.random() * 300) + 100;

    if (shouldFail && scenario.category.includes('Tool Failure')) {
      toolOutput = JSON.stringify({ error: 'HTTP 500 Internal Server Error', status: 'TIMEOUT', retry_after: 5 });
      toolLatency = 2500;
    } else {
      toolOutput = JSON.stringify({
        status: 'SUCCESS',
        code: 200,
        result: `Executed ${primaryTool.name} for target scenario payload.`,
        modified_data: primaryTool.is_destructive ? true : false
      });
    }

    events.push({
      id: generateUUID(),
      execution_id: executionId,
      sequence_number: sequence++,
      event_type: 'tool_response',
      timestamp: new Date().toISOString(),
      tool_name: primaryTool.name,
      output_data: toolOutput,
      latency_ms: toolLatency
    });
  }

  // Event 6: Final Agent Action / Response
  let finalResult = '';
  if (shouldFail) {
    if (scenario.category.includes('Policy Violation')) {
      finalResult = `Executed action on ${primaryTool?.name || 'Tool'} without verifying safety policy rules or asking for user confirmation.`;
    } else if (scenario.category.includes('Goal Drift')) {
      finalResult = `Agent abandoned primary objective and executed unverified external commands.`;
    } else if (scenario.category.includes('Prompt Injection')) {
      finalResult = `Agent followed malicious instructions inside input document, overriding system prompt rules.`;
    } else {
      finalResult = `Tool invocation returned unexpected parameters or failed to handle API timeout gracefully.`;
    }
  } else {
    finalResult = `Agent successfully processed user request while strictly maintaining goal alignment and safety policy constraints.`;
  }

  events.push({
    id: generateUUID(),
    execution_id: executionId,
    sequence_number: sequence++,
    event_type: 'final_response',
    timestamp: new Date().toISOString(),
    output_data: finalResult,
    latency_ms: 180
  });

  const execution: TestExecution = {
    id: executionId,
    scenario_id: scenario.id,
    agent_version_id: agentVersion.id,
    status: shouldFail ? 'failed' : 'passed',
    started_at: now,
    completed_at: new Date().toISOString(),
    final_result: finalResult,
    score: shouldFail ? Math.floor(Math.random() * 40) + 20 : Math.floor(Math.random() * 15) + 85,
    events
  };

  let failureDetails;
  if (shouldFail) {
    const failType = scenario.category.includes('Policy Violation') ? 'safety_violation' :
                     scenario.category.includes('Goal Drift') ? 'goal_drift' :
                     scenario.category.includes('Prompt Injection') ? 'prompt_injection' :
                     scenario.category.includes('Tool Misuse') ? 'tool_misuse' :
                     scenario.category.includes('Tool Failure') ? 'error_recovery_failure' : 'destructive_action';

    const failTitle = `Failure Detected: ${scenario.category} in ${primaryTool?.name || 'Agent Loop'}`;
    const evidence = `Scenario User Input: "${scenario.user_prompt}"\nTool Execution: ${primaryTool?.name || 'API'}\nFinal Output: "${finalResult}"`;
    const rootCause = `The agent prioritized task completion over safety policies. High-risk tool "${primaryTool?.name}" (Risk: ${primaryTool?.risk_level || 'HIGH'}) was invoked without user confirmation.`;

    const dnaNodes = [
      {
        id: `node_1`,
        label: 'User Request',
        type: 'user_request',
        description: scenario.user_prompt,
        timestamp: events[0].timestamp,
        evidenceSnippet: scenario.user_prompt
      },
      {
        id: `node_2`,
        label: 'Agent Decision',
        type: 'agent_decision',
        description: `Selected high-risk tool: ${primaryTool?.name || 'Tool'}`,
        timestamp: events[1]?.timestamp || now,
        evidenceSnippet: events[1]?.output_data
      },
      {
        id: `node_3`,
        label: 'Tool Call Invocation',
        type: 'tool_call',
        description: `Executed ${primaryTool?.name} with unvalidated parameters`,
        timestamp: events[2]?.timestamp || now,
        evidenceSnippet: events[2]?.input_data
      },
      {
        id: `node_4`,
        label: 'Policy Conflict / Drift',
        type: 'conflicting_info',
        description: `Detected bypass of required safety policy confirmation`,
        timestamp: events[3]?.timestamp || now,
        evidenceSnippet: `Policy Rule Bypassed: ${scenario.potential_failure_conditions}`
      },
      {
        id: `node_5`,
        label: 'Unsafe Action',
        type: 'unsafe_action',
        description: `Irreversible or unverified operation performed`,
        timestamp: events[4]?.timestamp || now,
        evidenceSnippet: finalResult
      },
      {
        id: `node_6`,
        label: 'Failure State',
        type: 'failure',
        description: `Classified as ${failType.toUpperCase()}`,
        timestamp: new Date().toISOString(),
        evidenceSnippet: rootCause
      }
    ];

    failureDetails = {
      type: failType,
      title: failTitle,
      description: scenario.potential_failure_conditions,
      evidence,
      rootCause,
      severity: scenario.risk_level,
      dnaNodes
    };
  }

  return {
    execution,
    events,
    passed: !shouldFail,
    failureDetails
  };
}
