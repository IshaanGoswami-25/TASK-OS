'use client';

import React, { useEffect, useState } from 'react';
import { AgentProfile, TestRun, TrustScore } from '@/lib/types';
import { getAgents, getTestRuns, getTrustScore } from '@/lib/storage';
import { EmptyState } from '@/components/ui/EmptyState';
import { BarChart3, TrendingUp, ShieldCheck, Activity } from 'lucide-react';

export default function AnalyticsPage() {
  const [runs, setRuns] = useState<TestRun[]>([]);
  const [scores, setScores] = useState<TrustScore[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function load() {
      const list = await getTestRuns();
      setRuns(list);

      const scorePromises = list.map(r => getTrustScore(r.id));
      const loadedScores = await Promise.all(scorePromises);
      setScores(loadedScores.filter(s => s !== null) as TrustScore[]);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="space-y-8 pb-16">
      <div>
        <h2 className="text-2xl font-black text-slate-100 flex items-center space-x-3">
          <BarChart3 className="w-7 h-7 text-emerald-400" />
          <span>Reliability & Risk Analytics</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">Cross-test evaluation trends, vector heatmaps, and performance history</p>
      </div>

      {!loading && runs.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="No analytics data available"
          description="Run evaluations to view dynamic performance trends and vector heatmaps."
          actionLabel="Run First Crash Test →"
          actionHref="/tests/new"
        />
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-2 shadow-xl">
              <span className="text-xs text-slate-400 font-mono">Total Evaluated Scenarios</span>
              <div className="text-3xl font-extrabold text-slate-100 font-mono">
                {runs.reduce((acc, r) => acc + r.scenario_count, 0)}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-2 shadow-xl">
              <span className="text-xs text-slate-400 font-mono">Average Trust Score</span>
              <div className="text-3xl font-extrabold text-emerald-400 font-mono">
                {scores.length > 0
                  ? Math.round(scores.reduce((acc, s) => acc + s.overall_score, 0) / scores.length)
                  : 'N/A'}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-2 shadow-xl">
              <span className="text-xs text-slate-400 font-mono">Completed Evaluations</span>
              <div className="text-3xl font-extrabold text-slate-100 font-mono">{runs.length}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
