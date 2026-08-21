'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AgentVersion, FailureDNA, FailureRecord, Scenario, TestExecution, TestRun, TrustScore } from '@/lib/types';
import { getExecutions, getFailureDNA, getFailuresForTestRun, getScenarios, getTestRunById, getTrustScore } from '@/lib/storage';
import { TrustScoreGauge } from '@/components/scoring/TrustScoreGauge';
import { ExecutionTraceViewer } from '@/components/execution/ExecutionTraceViewer';
import { FailureDNAGraph } from '@/components/failure-dna/FailureDNAGraph';
import { FlaskConical, CheckCircle2, AlertTriangle, Terminal, ArrowLeft, RefreshCw, FileText } from 'lucide-react';
import Link from 'next/link';

export default function CrashTestDetailPage() {
  const params = useParams();
  const testRunId = params.id as string;

  const [testRun, setTestRun] = useState<TestRun | null>(null);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [executions, setExecutions] = useState<TestExecution[]>([]);
  const [failures, setFailures] = useState<FailureRecord[]>([]);
  const [trustScore, setTrustScore] = useState<TrustScore | null>(null);

  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [selectedExecution, setSelectedExecution] = useState<TestExecution | null>(null);
  const [selectedDNA, setSelectedDNA] = useState<FailureDNA | null>(null);

  useEffect(() => {
    async function loadTestRunData() {
      if (!testRunId) return;
      const run = await getTestRunById(testRunId);
      if (run) {
        setTestRun(run);

        const scens = await getScenarios(run.id);
        setScenarios(scens);

        const execs = await getExecutions(run.id);
        setExecutions(execs);

        const fails = await getFailuresForTestRun(run.id);
        setFailures(fails);

        const score = await getTrustScore(run.id);
        setTrustScore(score);

        if (scens.length > 0) {
          setSelectedScenario(scens[0]);
          const matchingExec = execs.find(e => e.scenario_id === scens[0].id);
          setSelectedExecution(matchingExec || null);

          const matchingFail = fails.find(f => f.scenario_id === scens[0].id);
          if (matchingFail) {
            const dna = await getFailureDNA(matchingFail.id);
            setSelectedDNA(dna);
          }
        }
      }
    }
    loadTestRunData();
  }, [testRunId]);

  if (!testRun) {
    return (
      <div className="py-16 text-center text-slate-400 font-mono">
        Loading Crash Test Evaluation Data...
      </div>
    );
  }

  const passedCount = executions.filter(e => e.status === 'passed').length;
  const failedCount = executions.filter(e => e.status === 'failed').length;

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Link href="/tests" className="text-xs text-emerald-400 hover:underline flex items-center space-x-1 mb-2">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Crash Tests</span>
          </Link>
          <h2 className="text-2xl font-black text-slate-100 flex items-center space-x-3">
            <FlaskConical className="w-6 h-6 text-emerald-400" />
            <span>Crash Test Evaluation #{testRun.id.substring(3, 8)}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {testRun.test_type} • {testRun.difficulty} Difficulty • Executed {new Date(testRun.started_at).toLocaleString()}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href={`/reports/${testRun.id}`}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-semibold hover:bg-slate-800"
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>View PDF Report</span>
          </Link>
        </div>
      </div>

      {/* Trust Score & Stats Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TrustScoreGauge score={trustScore} />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4">
          <div>
            <span className="text-xs font-mono uppercase text-slate-500 block mb-2 font-semibold">Test Execution Summary</span>
            <div className="text-3xl font-extrabold text-slate-100">{scenarios.length} Scenarios</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-950/80 border border-emerald-500/20 rounded-xl p-4 text-center">
              <span className="text-2xl font-bold text-emerald-400 font-mono">{passedCount}</span>
              <span className="text-[11px] font-mono text-slate-400 block">Passed</span>
            </div>

            <div className="bg-slate-950/80 border border-rose-500/20 rounded-xl p-4 text-center">
              <span className="text-2xl font-bold text-rose-400 font-mono">{failedCount}</span>
              <span className="text-[11px] font-mono text-slate-400 block">Failed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scenario Inspector Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Scenarios Selector List */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center justify-between border-b border-slate-800 pb-3">
            <span>Generated Scenarios ({scenarios.length})</span>
            <span className="text-xs font-mono text-slate-500">Click to Inspect</span>
          </h3>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {scenarios.map((scen, idx) => {
              const exec = executions.find(e => e.scenario_id === scen.id);
              const isPassed = exec?.status === 'passed';
              const isSelected = selectedScenario?.id === scen.id;

              return (
                <div
                  key={scen.id}
                  onClick={async () => {
                    setSelectedScenario(scen);
                    setSelectedExecution(exec || null);

                    const matchingFail = failures.find(f => f.scenario_id === scen.id);
                    if (matchingFail) {
                      const dna = await getFailureDNA(matchingFail.id);
                      setSelectedDNA(dna);
                    } else {
                      setSelectedDNA(null);
                    }
                  }}
                  className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-800 border-emerald-500/50 text-slate-100 shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-[10px] text-slate-400 font-semibold uppercase">
                      #{idx + 1} {scen.category}
                    </span>
                    {exec && (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                        isPassed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {isPassed ? 'PASS' : 'FAIL'}
                      </span>
                    )}
                  </div>
                  <div className="font-semibold text-slate-200 truncate">{scen.title}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Execution Trace & Failure DNA */}
        <div className="lg:col-span-2 space-y-6">
          {selectedDNA && (
            <FailureDNAGraph dna={selectedDNA} />
          )}

          {selectedExecution?.events && (
            <ExecutionTraceViewer events={selectedExecution.events} scenarioTitle={selectedScenario?.title} />
          )}
        </div>
      </div>
    </div>
  );
}
