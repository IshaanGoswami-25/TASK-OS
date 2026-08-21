'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createAgentWithDetails } from '@/lib/storage';
import { RiskLevel, ToolType, ConnectionType } from '@/lib/types';
import { 
  Bot, 
  Code2, 
  Wrench, 
  ShieldCheck, 
  CheckCircle2, 
  Plug, 
  ArrowRight, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Sparkles,
  AlertTriangle
} from 'lucide-react';

export default function NewAgentWizard() {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [saving, setSaving] = useState<boolean>(false);

  // Form State
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [purpose, setPurpose] = useState<string>('');
  const [objective, setObjective] = useState<string>('');
  const [environment, setEnvironment] = useState<'Development' | 'Staging' | 'Production'>('Development');
  const [versionName, setVersionName] = useState<string>('v1.0');

  // Step 2: Instructions
  const [instructions, setInstructions] = useState<string>('');

  // Step 3: Tools
  const [tools, setTools] = useState<Array<{
    name: string;
    description: string;
    type: ToolType;
    endpoint: string;
    method: string;
    input_schema: string;
    output_schema: string;
    risk_level: RiskLevel;
    is_read_only: boolean;
    is_destructive: boolean;
  }>>([]);

  // Step 4: Safety Policies
  const [policies, setPolicies] = useState<Array<{
    title: string;
    description: string;
    severity: RiskLevel;
    human_confirmation_required: boolean;
  }>>([]);

  // Step 5: Success Criteria
  const [criteria, setCriteria] = useState<Array<{
    title: string;
    description: string;
    type: 'required_behavior' | 'forbidden_behavior' | 'output_requirement' | 'tool_use_requirement' | 'confirmation_requirement' | 'escalation_requirement';
  }>>([]);

  // Step 6: Connection
  const [connectionType, setConnectionType] = useState<ConnectionType>('simulated_agent');
  const [endpointUrl, setEndpointUrl] = useState<string>('');

  // Helper adders
  const addTool = () => {
    setTools([
      ...tools,
      {
        name: '',
        description: '',
        type: 'API',
        endpoint: '/api/v1/tool',
        method: 'POST',
        input_schema: '{\n  "query": "string"\n}',
        output_schema: '{\n  "status": "string"\n}',
        risk_level: 'MEDIUM',
        is_read_only: false,
        is_destructive: false,
      }
    ]);
  };

  const removeTool = (idx: number) => {
    setTools(tools.filter((_, i) => i !== idx));
  };

  const addPolicy = () => {
    setPolicies([
      ...policies,
      {
        title: '',
        description: '',
        severity: 'HIGH',
        human_confirmation_required: true,
      }
    ]);
  };

  const removePolicy = (idx: number) => {
    setPolicies(policies.filter((_, i) => i !== idx));
  };

  const addCriterion = () => {
    setCriteria([
      ...criteria,
      {
        title: '',
        description: '',
        type: 'required_behavior',
      }
    ]);
  };

  const removeCriterion = (idx: number) => {
    setCriteria(criteria.filter((_, i) => i !== idx));
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      await createAgentWithDetails({
        profile: {
          user_id: 'user_default',
          name,
          description,
          purpose,
          objective,
          environment,
        },
        version: {
          version_name: versionName,
          system_instructions: instructions,
          connection_type: connectionType,
          endpoint: endpointUrl,
          configuration: {},
        },
        tools,
        policies,
        criteria,
      });

      window.location.href = '/dashboard';
    } catch (e) {
      console.error('Error creating agent:', e);
      setSaving(false);
    }
  };

  const steps = [
    { num: 1, name: 'About', icon: Bot },
    { num: 2, name: 'Instructions', icon: Code2 },
    { num: 3, name: 'Tools', icon: Wrench },
    { num: 4, name: 'Safety', icon: ShieldCheck },
    { num: 5, name: 'Success Criteria', icon: CheckCircle2 },
    { num: 6, name: 'Connect', icon: Plug },
    { num: 7, name: 'Review', icon: Sparkles },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Step Stepper Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-100">Create AI Agent Profile</h2>
        <p className="text-xs text-slate-400 mt-1">Configure evaluation parameters for dynamic scenario crash-testing</p>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {steps.map((s) => {
          const Icon = s.icon;
          const isActive = step === s.num;
          const isDone = step > s.num;

          return (
            <div
              key={s.num}
              onClick={() => setStep(s.num)}
              className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all ${
                isActive
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-md'
                  : isDone
                  ? 'bg-slate-900 border-slate-700 text-slate-300'
                  : 'bg-slate-950 border-slate-800 text-slate-600'
              }`}
            >
              <Icon className="w-4 h-4 mx-auto mb-1" />
              <span className="text-[10px] font-mono font-semibold uppercase block truncate">{s.name}</span>
            </div>
          );
        })}
      </div>

      {/* Step Contents */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
        {/* STEP 1: ABOUT */}
        {step === 1 && (
          <div className="space-y-5">
            <h3 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
              <Bot className="w-5 h-5 text-emerald-400" />
              <span>Step 1 — About Your AI Agent</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-mono font-semibold text-slate-300">Agent Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Customer Support Refund Bot"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono font-semibold text-slate-300">Version Name *</label>
                <input
                  type="text"
                  value={versionName}
                  onChange={(e) => setVersionName(e.target.value)}
                  placeholder="v1.0"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono font-semibold text-slate-300">Environment</label>
              <select
                value={environment}
                onChange={(e) => setEnvironment(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="Development">Development</option>
                <option value="Staging">Staging</option>
                <option value="Production">Production</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono font-semibold text-slate-300">Agent Purpose *</label>
              <input
                type="text"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Brief summary of role (e.g. Automating customer order cancellations)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono font-semibold text-slate-300">Primary Objective *</label>
              <textarea
                rows={4}
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                placeholder="Describe the primary objective of your AI agent..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        )}

        {/* STEP 2: INSTRUCTIONS */}
        {step === 2 && (
          <div className="space-y-5">
            <h3 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
              <Code2 className="w-5 h-5 text-emerald-400" />
              <span>Step 2 — Agent System Instructions</span>
            </h3>
            <p className="text-xs text-slate-400">
              Provide the exact system prompt or instructions followed by your AI agent.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-mono font-semibold text-slate-300">System Instructions / Prompt</label>
              <textarea
                rows={10}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="You are an autonomous AI agent responsible for..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-200 focus:outline-none focus:border-emerald-500 leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* STEP 3: TOOLS */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
                  <Wrench className="w-5 h-5 text-emerald-400" />
                  <span>Step 3 — Agent Dynamic Tool Manager</span>
                </h3>
                <p className="text-xs text-slate-400">Add the tools and APIs your agent can invoke.</p>
              </div>

              <button
                onClick={addTool}
                className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold text-xs hover:bg-emerald-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Tool</span>
              </button>
            </div>

            {tools.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-slate-800 rounded-xl text-xs text-slate-500">
                No tools added yet. Click <strong>+ Add Tool</strong> to define tool capabilities.
              </div>
            ) : (
              <div className="space-y-4">
                {tools.map((tool, idx) => (
                  <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4 relative">
                    <button
                      onClick={() => removeTool(idx)}
                      className="absolute top-4 right-4 text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[11px] font-mono text-slate-400">Tool Name</label>
                        <input
                          type="text"
                          value={tool.name}
                          onChange={(e) => {
                            const updated = [...tools];
                            updated[idx].name = e.target.value;
                            setTools(updated);
                          }}
                          placeholder="e.g. Refund API"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-mono text-slate-400">Tool Type</label>
                        <select
                          value={tool.type}
                          onChange={(e) => {
                            const updated = [...tools];
                            updated[idx].type = e.target.value as any;
                            setTools(updated);
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100"
                        >
                          <option value="API">API</option>
                          <option value="Database">Database</option>
                          <option value="Search">Search</option>
                          <option value="FileSystem">FileSystem</option>
                          <option value="Email">Email</option>
                          <option value="Payment">Payment</option>
                          <option value="Calendar">Calendar</option>
                          <option value="Custom">Custom</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-mono text-slate-400">Risk Level</label>
                        <select
                          value={tool.risk_level}
                          onChange={(e) => {
                            const updated = [...tools];
                            updated[idx].risk_level = e.target.value as any;
                            setTools(updated);
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100"
                        >
                          <option value="LOW">LOW (Read-only)</option>
                          <option value="MEDIUM">MEDIUM (Non-critical edit)</option>
                          <option value="HIGH">HIGH (External consequence)</option>
                          <option value="CRITICAL">CRITICAL (Irreversible/destructive)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-slate-400">Description</label>
                      <input
                        type="text"
                        value={tool.description}
                        onChange={(e) => {
                          const updated = [...tools];
                          updated[idx].description = e.target.value;
                          setTools(updated);
                        }}
                        placeholder="What does this tool do?"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 4: SAFETY POLICIES */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>Step 4 — Safety Policies & Boundaries</span>
                </h3>
                <p className="text-xs text-slate-400">Define what your AI agent must NEVER do.</p>
              </div>

              <button
                onClick={addPolicy}
                className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold text-xs hover:bg-emerald-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Safety Rule</span>
              </button>
            </div>

            {policies.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-slate-800 rounded-xl text-xs text-slate-500">
                No safety policies added yet. Click <strong>+ Add Safety Rule</strong> to enforce rules.
              </div>
            ) : (
              <div className="space-y-4">
                {policies.map((pol, idx) => (
                  <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3 relative">
                    <button
                      onClick={() => removePolicy(idx)}
                      className="absolute top-4 right-4 text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[11px] font-mono text-slate-400">Policy Title</label>
                        <input
                          type="text"
                          value={pol.title}
                          onChange={(e) => {
                            const updated = [...policies];
                            updated[idx].title = e.target.value;
                            setPolicies(updated);
                          }}
                          placeholder="e.g. No Unconfirmed Payments"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-mono text-slate-400">Severity</label>
                        <select
                          value={pol.severity}
                          onChange={(e) => {
                            const updated = [...policies];
                            updated[idx].severity = e.target.value as any;
                            setPolicies(updated);
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100"
                        >
                          <option value="LOW">LOW</option>
                          <option value="MEDIUM">MEDIUM</option>
                          <option value="HIGH">HIGH</option>
                          <option value="CRITICAL">CRITICAL</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-slate-400">Policy Constraint Description</label>
                      <input
                        type="text"
                        value={pol.description}
                        onChange={(e) => {
                          const updated = [...policies];
                          updated[idx].description = e.target.value;
                          setPolicies(updated);
                        }}
                        placeholder="The agent must never execute transactions over $100 without human approval."
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 5: SUCCESS CRITERIA */}
        {step === 5 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>Step 5 — Expected Behavior & Success Criteria</span>
                </h3>
                <p className="text-xs text-slate-400">Define what a successful action looks like.</p>
              </div>

              <button
                onClick={addCriterion}
                className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold text-xs hover:bg-emerald-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Criterion</span>
              </button>
            </div>

            {criteria.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-slate-800 rounded-xl text-xs text-slate-500">
                No success criteria defined yet. Click <strong>+ Add Criterion</strong>.
              </div>
            ) : (
              <div className="space-y-4">
                {criteria.map((crit, idx) => (
                  <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3 relative">
                    <button
                      onClick={() => removeCriterion(idx)}
                      className="absolute top-4 right-4 text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[11px] font-mono text-slate-400">Criterion Title</label>
                        <input
                          type="text"
                          value={crit.title}
                          onChange={(e) => {
                            const updated = [...criteria];
                            updated[idx].title = e.target.value;
                            setCriteria(updated);
                          }}
                          placeholder="e.g. Verify Order ID Format"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-mono text-slate-400">Criterion Type</label>
                        <select
                          value={crit.type}
                          onChange={(e) => {
                            const updated = [...criteria];
                            updated[idx].type = e.target.value as any;
                            setCriteria(updated);
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100"
                        >
                          <option value="required_behavior">Required Behavior</option>
                          <option value="forbidden_behavior">Forbidden Behavior</option>
                          <option value="output_requirement">Output Requirement</option>
                          <option value="tool_use_requirement">Tool-Use Requirement</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 6: CONNECT */}
        {step === 6 && (
          <div className="space-y-5">
            <h3 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
              <Plug className="w-5 h-5 text-emerald-400" />
              <span>Step 6 — Agent Connection Setup</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { id: 'simulated_agent', label: 'Simulated Agent Sandbox', desc: 'TRUSTOS evaluates agent logic in a controlled simulation environment.' },
                { id: 'api_endpoint', label: 'API Endpoint Integration', desc: 'Connect live deployed agent REST endpoint.' },
                { id: 'webhook', label: 'Webhook Receiver', desc: 'Receive live agent execution events over webhooks.' },
                { id: 'custom_adapter', label: 'Custom SDK Adapter', desc: 'Connect custom agent framework adapter.' },
              ].map((item) => (
                <div
                  key={item.id}
                  onClick={() => setConnectionType(item.id as ConnectionType)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    connectionType === item.id
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="font-bold text-sm text-slate-100 block mb-1">{item.label}</span>
                  <p className="text-xs text-slate-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 7: REVIEW */}
        {step === 7 && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <span>Step 7 — Review Agent Configuration</span>
            </h3>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 border-b border-slate-800 pb-3">
                <div>
                  <span className="text-slate-500 uppercase font-mono">Agent Name:</span>
                  <p className="font-bold text-slate-100">{name || 'Unnamed Agent'}</p>
                </div>
                <div>
                  <span className="text-slate-500 uppercase font-mono">Environment:</span>
                  <p className="font-bold text-emerald-400">{environment}</p>
                </div>
              </div>

              <div>
                <span className="text-slate-500 uppercase font-mono block mb-1">Tools Configured ({tools.length}):</span>
                {tools.length === 0 ? (
                  <p className="text-slate-500 italic">No tools defined.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {tools.map((t, i) => (
                      <span key={i} className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
                        {t.name} ({t.risk_level})
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <span className="text-slate-500 uppercase font-mono block mb-1">Safety Policies ({policies.length}):</span>
                {policies.length === 0 ? (
                  <p className="text-slate-500 italic">No safety policies defined.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {policies.map((p, i) => (
                      <span key={i} className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-amber-300">
                        {p.title}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Wizard Controls */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-6">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-800"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
          ) : <div />}

          {step < 7 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20"
            >
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={saving}
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-sm shadow-xl shadow-emerald-500/25"
            >
              <span>{saving ? 'Creating Agent...' : 'Create Agent & Save to Supabase'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
