'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AgentProfile, AgentTool, AgentVersion, SafetyPolicy, SuccessCriteria, TestDifficulty, TestType } from '@/lib/types';
import { getAgents, getAgentTools, getAgentVersion, getAgentVersions, getSafetyPolicies, getSuccessCriteria, createTestRun, saveScenarios } from '@/lib/storage';
import { generateScenarios } from '@/lib/ai/scenarioGenerator';
import { runCrashTest } from '@/lib/sandbox/runner';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import { FlaskConical, Bot, Sparkles, Shield, ArrowRight } from 'lucide-react';

function NewCrashTestForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [agents, setAgents] = useState<AgentProfile[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [testType, setTestType] = useState<TestType>('Adversarial');
  const [difficulty, setDifficulty] = useState<TestDifficulty>('Adaptive');
  const [scenarioCount, setScenarioCount] = useState<number>(10);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMsg, setLoadingMsg] = useState<string>('Generating adversarial scenarios...');

  const availableCategories = [
    'Ambiguous instructions',
    'Conflicting instructions',
    'Goal drift',
    'Tool misuse',
    'Tool failure',
    'Hallucination',
    'Prompt injection',
    'Policy violation',
    'Unsafe action',
    'Destructive action',
    'Repeated tool calls',
    'API failure',
    'Timeout',
    'Contradictory information'
  ];

  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'Goal drift',
    'Tool misuse',
    'Prompt injection',
    'Policy violation',
    'Unsafe action',
    'API failure'
  ]);

  useEffect(() => {
    async function loadData() {
      const list = await getAgents();
      setAgents(list);
      const qpAgent = searchParams.get('agentId');
      if (qpAgent && list.some(a => a.id === qpAgent)) {
        setSelectedAgentId(qpAgent);
      } else if (list.length > 0) {
        setSelectedAgentId(list[0].id);
      }
    }
    loadData();
  }, [searchParams]);

  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter(c => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const handleStartTest = async () => {
    if (!selectedAgentId) return;
    setLoading(true);

    try {
      const agent = agents.find(a => a.id === selectedAgentId)!;
      const versions = await getAgentVersions(agent.id);
      const version = versions.find(v => v.id === agent.current_version_id) || versions[0];
      const tools = await getAgentTools(version.id);
      const policies = await getSafetyPolicies(version.id);
      const criteria = await getSuccessCriteria(version.id);

      // 1. Create Test Run record
      const testRun = await createTestRun({
        agent_version_id: version.id,
        test_type: testType,
        difficulty: difficulty,
        scenario_count: scenarioCount,
        selected_categories: selectedCategories,
        status: 'generating',
      });

      // 2. Generate Scenarios
      setLoadingMsg('Generating realistic & adversarial test scenarios...');
      const scenarios = await generateScenarios({
        agentName: agent.name,
        agentObjective: agent.objective,
        agentInstructions: version.system_instructions,
        tools,
        policies,
        criteria,
        testType,
        difficulty,
        categories: selectedCategories,
        count: scenarioCount,
        testRunId: testRun.id
      });
      await saveScenarios(scenarios);

      // 3. Execute Sandboxed Replay & Adaptive Red Team
      setLoadingMsg('Executing sandboxed replay & crash-testing agent...');
      await runCrashTest(testRun, scenarios, version, tools);

      setLoading(false);
      router.push(`/tests/${testRun.id}`);
    } catch (err) {
      console.error('Error starting crash test:', err);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {loading && <LoadingOverlay message={loadingMsg} subMessage="Evaluating tool boundaries, safety rules, and failure modes" />}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-100 flex items-center space-x-3">
            <FlaskConical className="w-7 h-7 text-emerald-400" />
            <span>Configure AI Agent Crash Test</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">Select test parameters, difficulty load, and target failure categories</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-8">
        {/* Agent Selector */}
        <div className="space-y-2">
          <label className="text-xs font-mono font-semibold text-slate-300 flex items-center space-x-2">
            <Bot className="w-4 h-4 text-emerald-400" />
            <span>Select Target AI Agent *</span>
          </label>
          <select
            value={selectedAgentId}
            onChange={(e) => setSelectedAgentId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
          >
            {agents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.environment}) — Objective: {a.objective.substring(0, 40)}...
              </option>
            ))}
          </select>
        </div>

        {/* Test Type & Difficulty */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-mono font-semibold text-slate-300">Test Vector Type</label>
            <select
              value={testType}
              onChange={(e) => setTestType(e.target.value as TestType)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
            >
              <option value="Adversarial">Adversarial Stress Test</option>
              <option value="Safety">Safety & Policy Verification</option>
              <option value="Tool Reliability">Tool Reliability & Schema Test</option>
              <option value="Goal Adherence">Goal Adherence & Context Drift</option>
              <option value="Standard">Standard Evaluation</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono font-semibold text-slate-300">Difficulty Load</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as TestDifficulty)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
            >
              <option value="Adaptive">Adaptive Red Team (Learns & Escalates)</option>
              <option value="Basic">Basic (Standard Prompts)</option>
              <option value="Moderate">Moderate (Edge Cases)</option>
              <option value="Hard">Hard (Obfuscated Inputs)</option>
              <option value="Extreme">Extreme (Multi-vector Stress)</option>
            </select>
          </div>
        </div>

        {/* Number of Scenarios */}
        <div className="space-y-2">
          <label className="text-xs font-mono font-semibold text-slate-300">Number of Scenarios to Generate</label>
          <div className="flex items-center space-x-3">
            {[5, 10, 25, 50].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setScenarioCount(num)}
                className={`px-5 py-2.5 rounded-xl border text-xs font-mono font-bold transition-all ${
                  scenarioCount === num
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                {num} Scenarios
              </button>
            ))}
          </div>
        </div>

        {/* Evaluation Categories Multi-select */}
        <div className="space-y-3">
          <label className="text-xs font-mono font-semibold text-slate-300">Target Evaluation Categories</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {availableCategories.map((cat) => {
              const isSelected = selectedCategories.includes(cat);
              return (
                <div
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer font-medium transition-all ${
                    isSelected
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                      : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="truncate block">{cat}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={handleStartTest}
            className="inline-flex items-center space-x-2.5 px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-sm transition-all shadow-xl shadow-emerald-500/25"
          >
            <Sparkles className="w-5 h-5" />
            <span>Generate Scenarios & Launch Crash Test</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function NewCrashTestPage() {
  return (
    <Suspense fallback={<div className="py-16 text-center text-slate-400 font-mono">Loading Crash Test Configuration...</div>}>
      <NewCrashTestForm />
    </Suspense>
  );
}
