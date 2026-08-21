'use client';

import React, { useEffect, useState } from 'react';
import { AgentProfile, AgentVersion, RegressionResult, TestRun, TrustScore } from '@/lib/types';
import { getAgents, getAgentVersions, getRegressionsForVersion, getTestRuns, getTrustScore } from '@/lib/storage';
import { compareAgentVersions, VersionComparison } from '@/lib/versioning';
import { EmptyState } from '@/components/ui/EmptyState';
import { GitBranch, AlertTriangle, ArrowUpRight, ArrowDownRight, CheckCircle2 } from 'lucide-react';

export default function VersionsPage() {
  const [agents, setAgents] = useState<AgentProfile[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [versions, setVersions] = useState<AgentVersion[]>([]);
  const [comparison, setComparison] = useState<VersionComparison | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      const list = await getAgents();
      setAgents(list);

      if (list.length > 0) {
        setSelectedAgentId(list[0].id);
        const vers = await getAgentVersions(list[0].id);
        setVersions(vers);

        if (vers.length >= 2) {
          const prevVer = vers[vers.length - 2];
          const newVer = vers[vers.length - 1];
          const prevRuns = await getTestRuns(prevVer.id);
          const newRuns = await getTestRuns(newVer.id);

          if (prevRuns.length > 0 && newRuns.length > 0) {
            const comp = await compareAgentVersions(prevVer, newVer, prevRuns[0], newRuns[0]);
            setComparison(comp);
          }
        }
      }
      setLoading(false);
    }
    loadData();
  }, []);

  return (
    <div className="space-y-8 pb-16">
      <div>
        <h2 className="text-2xl font-black text-slate-100 flex items-center space-x-3">
          <GitBranch className="w-7 h-7 text-emerald-400" />
          <span>Version Comparison & Regression Tracking</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">Track Trust Score deltas and detect regressions across agent iterations</p>
      </div>

      {!loading && versions.length < 2 ? (
        <EmptyState
          icon={GitBranch}
          title="Multiple versions required for comparison"
          description="Create at least 2 agent versions to compare Trust Score improvements and detect regressions."
          actionLabel="Create New Agent Version →"
          actionHref="/agents/new"
        />
      ) : comparison ? (
        <div className="space-y-8">
          {/* Regression Banner */}
          {comparison.regressions.length > 0 && (
            <div className="bg-rose-500/10 border-2 border-rose-500/50 rounded-2xl p-6 space-y-3 shadow-2xl">
              <div className="flex items-center space-x-3 text-rose-400">
                <AlertTriangle className="w-6 h-6 animate-bounce" />
                <h3 className="text-lg font-bold">⚠ Regression Detected!</h3>
              </div>
              <p className="text-xs text-slate-300">
                The new version failed scenario test cases that successfully passed in the previous version.
              </p>
              <div className="space-y-2 pt-2">
                {comparison.regressions.map((reg) => (
                  <div key={reg.id} className="bg-slate-950 border border-rose-500/30 rounded-xl p-3 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{reg.scenario_title}</span>
                    <span className="font-mono text-rose-400 font-bold">{reg.previous_result.toUpperCase()} ➔ {reg.new_result.toUpperCase()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Side by Side Comparison Matrix */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
            <h3 className="text-base font-bold text-slate-100 border-b border-slate-800 pb-3">
              Version Delta Matrix: {comparison.prevVersion.version_name} vs {comparison.newVersion.version_name}
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <span className="text-xs text-slate-400 font-mono block">Previous Trust Score</span>
                <span className="text-2xl font-extrabold text-slate-200 font-mono">
                  {comparison.prevScore?.overall_score || 'N/A'}
                </span>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <span className="text-xs text-slate-400 font-mono block">New Trust Score</span>
                <span className="text-2xl font-extrabold text-emerald-400 font-mono">
                  {comparison.newScore?.overall_score || 'N/A'}
                </span>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <span className="text-xs text-slate-400 font-mono block">Score Delta</span>
                <span className={`text-2xl font-extrabold font-mono flex items-center justify-center space-x-1 ${
                  comparison.scoreDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {comparison.scoreDelta >= 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                  <span>{comparison.scoreDelta > 0 ? `+${comparison.scoreDelta}` : comparison.scoreDelta}</span>
                </span>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <span className="text-xs text-slate-400 font-mono block">Regressions Count</span>
                <span className="text-2xl font-extrabold text-rose-400 font-mono">
                  {comparison.newFailuresCount}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-16 text-center text-slate-400 font-mono text-xs">
          Run evaluations on multiple versions to view comparison data.
        </div>
      )}
    </div>
  );
}
