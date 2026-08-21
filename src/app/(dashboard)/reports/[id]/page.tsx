'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AgentProfile, AgentVersion, FailureRecord, Scenario, TestExecution, TestRun, TrustScore } from '@/lib/types';
import { getAgentById, getAgentVersion, getExecutions, getFailuresForTestRun, getScenarios, getTestRunById, getTrustScore } from '@/lib/storage';
import { getTrustLevel } from '@/lib/scoring';
import { Shield, Printer, ArrowLeft, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import Link from 'next/link';

export default function EvaluationReportPage() {
  const params = useParams();
  const testRunId = params.id as string;

  const [testRun, setTestRun] = useState<TestRun | null>(null);
  const [agentVersion, setAgentVersion] = useState<AgentVersion | null>(null);
  const [agentProfile, setAgentProfile] = useState<AgentProfile | null>(null);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [executions, setExecutions] = useState<TestExecution[]>([]);
  const [failures, setFailures] = useState<FailureRecord[]>([]);
  const [trustScore, setTrustScore] = useState<TrustScore | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!testRunId) return;
      const run = await getTestRunById(testRunId);
      if (run) {
        setTestRun(run);
        const ver = await getAgentVersion(run.agent_version_id);
        if (ver) {
          setAgentVersion(ver);
          const prof = await getAgentById(ver.agent_id);
          setAgentProfile(prof);
        }

        const scens = await getScenarios(run.id);
        setScenarios(scens);

        const execs = await getExecutions(run.id);
        setExecutions(execs);

        const fails = await getFailuresForTestRun(run.id);
        setFailures(fails);

        const score = await getTrustScore(run.id);
        setTrustScore(score);
      }
    }
    loadData();
  }, [testRunId]);

  if (!testRun || !agentProfile) {
    return <div className="py-16 text-center text-slate-400 font-mono">Generating Evaluation Report...</div>;
  }

  const handlePrint = () => {
    if (typeof window !== 'undefined') window.print();
  };

  const level = trustScore ? getTrustLevel(trustScore.overall_score) : 'NOT EVALUATED';
  const passedCount = executions.filter(e => e.status === 'passed').length;

  return (
    <div className="space-y-8 pb-16">
      {/* Header Controls */}
      <div className="flex items-center justify-between print:hidden">
        <Link href={`/tests/${testRun.id}`} className="text-xs text-emerald-400 hover:underline flex items-center space-x-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Test Execution</span>
        </Link>

        <button
          onClick={handlePrint}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-lg transition-all"
        >
          <Printer className="w-4 h-4" />
          <span>Download / Print PDF Report</span>
        </button>
      </div>

      {/* Report Document Sheet */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 space-y-8 shadow-2xl print:bg-white print:text-black print:p-0 print:border-none print:shadow-none">
        {/* Header Branding */}
        <div className="flex items-center justify-between border-b border-slate-800 print:border-gray-200 pb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black font-mono tracking-wider print:text-black">
                TRUST<span className="text-emerald-400 print:text-emerald-600">OS</span>
              </h1>
              <span className="text-xs font-mono text-slate-400 print:text-gray-500 uppercase block font-semibold">
                Autonomous AI Agent Reliability Report
              </span>
            </div>
          </div>

          <div className="text-right font-mono text-xs text-slate-400 print:text-gray-500">
            <div>Report ID: #{testRun.id.substring(3, 10).toUpperCase()}</div>
            <div>Generated: {new Date().toLocaleDateString()}</div>
          </div>
        </div>

        {/* Executive Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-slate-950 print:bg-gray-50 border border-slate-800 print:border-gray-200 rounded-xl p-4">
            <span className="text-[11px] font-mono text-slate-400 print:text-gray-500 uppercase block">Overall Trust Score</span>
            <span className="text-3xl font-black text-emerald-400 print:text-emerald-600 font-mono">{trustScore?.overall_score || 0}/100</span>
          </div>

          <div className="bg-slate-950 print:bg-gray-50 border border-slate-800 print:border-gray-200 rounded-xl p-4">
            <span className="text-[11px] font-mono text-slate-400 print:text-gray-500 uppercase block">Trust Level</span>
            <span className="text-sm font-bold text-slate-100 print:text-black font-mono">{level}</span>
          </div>

          <div className="bg-slate-950 print:bg-gray-50 border border-slate-800 print:border-gray-200 rounded-xl p-4">
            <span className="text-[11px] font-mono text-slate-400 print:text-gray-500 uppercase block">Pass Rate</span>
            <span className="text-3xl font-black text-slate-100 print:text-black font-mono">
              {scenarios.length > 0 ? Math.round((passedCount / scenarios.length) * 100) : 0}%
            </span>
          </div>

          <div className="bg-slate-950 print:bg-gray-50 border border-slate-800 print:border-gray-200 rounded-xl p-4">
            <span className="text-[11px] font-mono text-slate-400 print:text-gray-500 uppercase block">Failures Detected</span>
            <span className="text-3xl font-black text-rose-400 print:text-red-600 font-mono">{failures.length}</span>
          </div>
        </div>

        {/* Agent Metadata */}
        <div className="bg-slate-950/60 print:bg-gray-50 border border-slate-800 print:border-gray-200 rounded-xl p-5 space-y-2 text-xs">
          <h3 className="font-bold text-slate-200 print:text-black uppercase font-mono text-xs">Target Agent Parameters</h3>
          <div className="grid grid-cols-2 gap-4">
            <div><span className="text-slate-500">Agent Name:</span> <strong className="text-slate-200 print:text-black">{agentProfile.name}</strong></div>
            <div><span className="text-slate-500">Version:</span> <strong className="text-slate-200 print:text-black">{agentVersion?.version_name}</strong></div>
            <div><span className="text-slate-500">Environment:</span> <strong className="text-emerald-400">{agentProfile.environment}</strong></div>
            <div><span className="text-slate-500">Objective:</span> <strong className="text-slate-300 print:text-black">{agentProfile.objective}</strong></div>
          </div>
        </div>

        {/* Failures Taxonomy Table */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-200 print:text-black text-sm border-b border-slate-800 pb-2">
            Detected Failure Taxonomy ({failures.length})
          </h3>
          {failures.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No failures detected in this evaluation run.</p>
          ) : (
            <div className="space-y-3">
              {failures.map((f) => (
                <div key={f.id} className="bg-slate-950 print:bg-gray-50 border border-slate-800 print:border-gray-200 rounded-xl p-4 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200 print:text-black">{f.title}</span>
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-mono text-[10px] uppercase font-bold">{f.severity}</span>
                  </div>
                  <p className="text-slate-400 print:text-gray-700">{f.root_cause}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
