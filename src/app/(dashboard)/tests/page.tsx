'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { TestRun } from '@/lib/types';
import { getTestRuns } from '@/lib/storage';
import { EmptyState } from '@/components/ui/EmptyState';
import { FlaskConical, Plus, ArrowRight, Shield } from 'lucide-react';

export default function TestsHistoryPage() {
  const [testRuns, setTestRuns] = useState<TestRun[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function load() {
      const list = await getTestRuns();
      setTestRuns(list);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="space-y-8 pb-16">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-100 flex items-center space-x-3">
            <FlaskConical className="w-7 h-7 text-emerald-400" />
            <span>Crash Tests History</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">Audit log of all executed adversarial stress evaluations</p>
        </div>

        <Link
          href="/tests/new"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Crash Test</span>
        </Link>
      </div>

      {!loading && testRuns.length === 0 ? (
        <EmptyState
          icon={FlaskConical}
          title="No evaluation has been performed yet"
          description="Run your first crash test to evaluate your agent against dynamic adversarial scenarios."
          actionLabel="Run Your First Crash Test →"
          actionHref="/tests/new"
        />
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-4">Test ID / Type</th>
                <th className="p-4">Difficulty</th>
                <th className="p-4">Scenarios</th>
                <th className="p-4">Executed Date</th>
                <th className="p-4">Trust Score</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {testRuns.map((run) => (
                <tr key={run.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 font-mono font-semibold text-slate-100">
                    <div>#{run.id.substring(3, 9)}</div>
                    <span className="text-[10px] text-emerald-400 font-normal">{run.test_type}</span>
                  </td>
                  <td className="p-4 font-mono">
                    <span className="px-2.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      {run.difficulty}
                    </span>
                  </td>
                  <td className="p-4 font-mono">{run.scenario_count} Scenarios</td>
                  <td className="p-4 font-mono text-slate-400">{new Date(run.started_at).toLocaleString()}</td>
                  <td className="p-4 font-mono font-bold text-slate-100">
                    {run.overall_score !== undefined ? `${run.overall_score} / 100` : 'Evaluating...'}
                  </td>
                  <td className="p-4 text-right">
                    <Link
                      href={`/tests/${run.id}`}
                      className="text-emerald-400 hover:text-emerald-300 font-semibold inline-flex items-center space-x-1"
                    >
                      <span>View Trace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
