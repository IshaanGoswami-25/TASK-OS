'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { TestRun } from '@/lib/types';
import { getTestRuns } from '@/lib/storage';
import { EmptyState } from '@/components/ui/EmptyState';
import { FileText, ArrowRight } from 'lucide-react';

export default function ReportsIndexPage() {
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
      <div>
        <h2 className="text-2xl font-black text-slate-100 flex items-center space-x-3">
          <FileText className="w-7 h-7 text-emerald-400" />
          <span>Evaluation Reports</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">Exportable PDF evaluation reliability reports</p>
      </div>

      {!loading && testRuns.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No evaluation reports generated yet"
          description="Run a crash test to automatically generate a downloadable PDF evaluation report."
          actionLabel="Run First Crash Test →"
          actionHref="/tests/new"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testRuns.map((run) => (
            <div key={run.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-slate-700 transition-all shadow-xl">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-slate-100">Report #{run.id.substring(3, 9)}</span>
                <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
                  Score: {run.overall_score || 0}/100
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                {run.test_type} • {run.difficulty} Difficulty • {new Date(run.started_at).toLocaleDateString()}
              </p>
              <div className="pt-2 border-t border-slate-800 flex justify-end">
                <Link
                  href={`/reports/${run.id}`}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold inline-flex items-center space-x-1"
                >
                  <span>View PDF Report</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
