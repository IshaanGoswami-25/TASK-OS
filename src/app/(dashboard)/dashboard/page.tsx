'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AgentProfile, AgentVersion, FailureRecord, TestRun, TrustScore } from '@/lib/types';
import { getAgents, getAgentVersions, getFailuresForTestRun, getTestRuns, getTrustScore } from '@/lib/storage';
import { EmptyState } from '@/components/ui/EmptyState';
import { TrustScoreGauge } from '@/components/scoring/TrustScoreGauge';
import { getTrustLevel, getTrustBadgeColor } from '@/lib/scoring';
import { explainTestResults } from '@/lib/ai/evaluator';
import { 
  Bot, 
  FlaskConical, 
  ShieldAlert, 
  ArrowRight, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles,
  GitBranch,
  RefreshCw,
  FileText,
  Code2
} from 'lucide-react';

export default function DashboardPage() {
  const [agents, setAgents] = useState<AgentProfile[]>([]);
  const [activeAgent, setActiveAgent] = useState<AgentProfile | null>(null);
  const [activeVersion, setActiveVersion] = useState<AgentVersion | null>(null);
  const [latestTestRun, setLatestTestRun] = useState<TestRun | null>(null);
  const [trustScore, setTrustScore] = useState<TrustScore | null>(null);
  const [failures, setFailures] = useState<FailureRecord[]>([]);
  const [aiExplanation, setAiExplanation] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      const agentList = await getAgents();
      setAgents(agentList);

      if (agentList.length > 0) {
        const agent = agentList[0];
        setActiveAgent(agent);

        const versions = await getAgentVersions(agent.id);
        if (versions.length > 0) {
          const version = versions.find(v => v.id === agent.current_version_id) || versions[0];
          setActiveVersion(version);

          const runs = await getTestRuns(version.id);
          if (runs.length > 0) {
            const latest = runs[0];
            setLatestTestRun(latest);

            const score = await getTrustScore(latest.id);
            setTrustScore(score);

            const fails = await getFailuresForTestRun(latest.id);
            setFailures(fails);

            if (score) {
              const exp = await explainTestResults(agent.name, latest, score, fails);
              setAiExplanation(exp);
            }
          }
        }
      }
      setLoading(false);
    }
    loadDashboardData();
  }, []);

  // 1. Zero Agents Empty State
  if (!loading && agents.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-black text-slate-100">TRUSTOS Reliability Engine</h2>
          <p className="text-sm text-slate-400">Continuous AI Agent Crash-Testing & Failure Diagnostics</p>
        </div>
        <EmptyState
          icon={Bot}
          title="No agents created yet"
          description="Create your first AI agent profile by defining its objectives, tools, and safety rules to begin evaluation."
          actionLabel="Create Your First AI Agent →"
          actionHref="/agents/new"
        />
      </div>
    );
  }

  // 2. Zero Test Runs Empty State
  if (!loading && activeAgent && !latestTestRun) {
    return (
      <div className="space-y-8">
        {/* Agent Banner */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-slate-100">{activeAgent.name}</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-mono">
                  {activeAgent.environment}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-xl truncate">{activeAgent.objective}</p>
            </div>
          </div>

          <Link
            href="/tests/new"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/20"
          >
            <FlaskConical className="w-4 h-4" />
            <span>Run Your First Crash Test →</span>
          </Link>
        </div>

        <EmptyState
          icon={FlaskConical}
          title="No evaluation has been performed yet"
          description={`Your agent "${activeAgent.name}" has been configured with custom tools and safety policies, but has not undergone adversarial stress testing.`}
          actionLabel="Run Your First Crash Test →"
          actionHref="/tests/new"
        />
      </div>
    );
  }

  const level = trustScore ? getTrustLevel(trustScore.overall_score) : 'NOT EVALUATED';
  const badgeClass = getTrustBadgeColor(level);

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner: Agent Header Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-start space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center text-emerald-400 shadow-md shrink-0">
            <Bot className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-3 flex-wrap gap-y-1">
              <h2 className="text-2xl font-extrabold text-slate-100">{activeAgent?.name}</h2>
              <span className="px-2.5 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono">
                {activeVersion?.version_name || 'v1.0'}
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold">
                {activeAgent?.environment}
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl">{activeAgent?.purpose}</p>
          </div>
        </div>

        <div className="flex items-center space-x-4 shrink-0">
          <div className="text-right">
            <span className="text-[10px] font-mono uppercase text-slate-500 block font-semibold">Last Evaluation</span>
            <span className="text-xs font-mono text-slate-300 font-medium">
              {latestTestRun ? new Date(latestTestRun.started_at).toLocaleString() : 'N/A'}
            </span>
          </div>

          <Link
            href="/tests/new"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/20"
          >
            <FlaskConical className="w-4 h-4" />
            <span>Run New Crash Test</span>
          </Link>
        </div>
      </div>

      {/* Main Grid: Score Gauge & Failures Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Trust Score Gauge & 8 Dimensions */}
        <div className="lg:col-span-2 space-y-6">
          <TrustScoreGauge score={trustScore} />

          {/* AI Synthesis Explanation Card */}
          {aiExplanation && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3 shadow-xl">
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-slate-100 text-sm">AI Result Diagnosis & Explanation</h3>
              </div>
              <div className="text-xs text-slate-300 leading-relaxed space-y-2 whitespace-pre-wrap font-sans">
                {aiExplanation}
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Critical Failures & Quick Next Step */}
        <div className="space-y-6">
          {/* Critical Issues Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                <h3 className="font-bold text-slate-100 text-sm">Critical Failure Modes</h3>
              </div>
              <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 font-mono text-xs font-bold">
                {failures.length} Detected
              </span>
            </div>

            {failures.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <p>No failures detected in this evaluation.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {failures.slice(0, 4).map((fail) => (
                  <div key={fail.id} className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-1.5 hover:border-slate-700 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-200 truncate max-w-[200px]">
                        {fail.title}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 text-[10px] font-mono uppercase font-bold">
                        {fail.severity}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{fail.root_cause}</p>
                    <Link
                      href={`/failures?id=${fail.id}`}
                      className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold inline-flex items-center space-x-1 pt-1"
                    >
                      <span>View Failure DNA</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                ))}

                {failures.length > 4 && (
                  <Link
                    href="/failures"
                    className="block text-center text-xs text-slate-400 hover:text-slate-200 py-2 font-mono"
                  >
                    + View All {failures.length} Failure Mode Records →
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Recommended Next Step Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-emerald-500/30 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center space-x-2 text-emerald-400">
              <Sparkles className="w-5 h-5" />
              <h3 className="font-bold text-sm text-slate-100">Recommended Next Step</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {failures.length > 0
                ? "Enforce human confirmation before calling high-risk tools, then retest failed scenarios to measure score improvement."
                : "Your agent passed current test scenarios. Consider running an Extreme or Adaptive Red Team evaluation."}
            </p>
            {failures.length > 0 && (
              <Link
                href={`/tests/new?agentId=${activeAgent?.id}&retest=true`}
                className="w-full inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition-all shadow-md"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retest Failed Scenarios</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
