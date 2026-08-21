'use client';

import React, { useEffect, useState } from 'react';
import { FailureDNA, FailureRecord } from '@/lib/types';
import { getAllFailures, getFailureDNA, getRecommendations } from '@/lib/storage';
import { EmptyState } from '@/components/ui/EmptyState';
import { FailureDNAGraph } from '@/components/failure-dna/FailureDNAGraph';
import { AlertTriangle, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

export default function FailuresPage() {
  const [failures, setFailures] = useState<FailureRecord[]>([]);
  const [selectedFailure, setSelectedFailure] = useState<FailureRecord | null>(null);
  const [selectedDNA, setSelectedDNA] = useState<FailureDNA | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function load() {
      const list = await getAllFailures();
      setFailures(list);
      if (list.length > 0) {
        setSelectedFailure(list[0]);
        const dna = await getFailureDNA(list[0].id);
        setSelectedDNA(dna);
      }
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="space-y-8 pb-16">
      <div>
        <h2 className="text-2xl font-black text-slate-100 flex items-center space-x-3">
          <AlertTriangle className="w-7 h-7 text-rose-400" />
          <span>Failure Mode Diagnostics & Failure DNA</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">Deep-dive root cause timelines and evidence traces</p>
      </div>

      {!loading && failures.length === 0 ? (
        <EmptyState
          icon={AlertTriangle}
          title="No failures detected yet"
          description="Run an evaluation against your AI agent to discover hidden failure modes and unsafe behaviors."
          actionLabel="Run Evaluation →"
          actionHref="/tests/new"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Failure List */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-100 border-b border-slate-800 pb-3">
              Detected Failures ({failures.length})
            </h3>
            <div className="space-y-2.5">
              {failures.map((f) => {
                const isSelected = selectedFailure?.id === f.id;
                return (
                  <div
                    key={f.id}
                    onClick={async () => {
                      setSelectedFailure(f);
                      const dna = await getFailureDNA(f.id);
                      setSelectedDNA(dna);
                    }}
                    className={`p-4 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-800 border-rose-500/50 text-slate-100 shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-[10px] uppercase font-bold text-rose-400">
                        {f.failure_type.replace('_', ' ')}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-mono text-[10px]">
                        {f.severity}
                      </span>
                    </div>
                    <div className="font-bold text-slate-200 truncate mb-1">{f.title}</div>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{f.root_cause}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Interactive DNA Graph & Evidence */}
          <div className="lg:col-span-2 space-y-6">
            {selectedDNA ? (
              <FailureDNAGraph dna={selectedDNA} />
            ) : (
              <div className="py-16 text-center text-slate-500 text-xs font-mono">
                Select a failure record to view Failure DNA node tree.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
