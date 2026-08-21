'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AgentProfile } from '@/lib/types';
import { getAgents } from '@/lib/storage';
import { EmptyState } from '@/components/ui/EmptyState';
import { Bot, Plus, ArrowRight, ShieldCheck, Wrench, Code2 } from 'lucide-react';

export default function AgentsPage() {
  const [agents, setAgents] = useState<AgentProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function load() {
      const list = await getAgents();
      setAgents(list);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="space-y-8 pb-16">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-100 flex items-center space-x-3">
            <Bot className="w-7 h-7 text-emerald-400" />
            <span>AI Agents Portfolio</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">Manage agent profiles, tools, safety policies, and version history</p>
        </div>

        <Link
          href="/agents/new"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create New Agent</span>
        </Link>
      </div>

      {!loading && agents.length === 0 ? (
        <EmptyState
          icon={Bot}
          title="No agents created yet"
          description="Create your first AI agent profile to begin scenario generation and failure diagnostics."
          actionLabel="Create Your First AI Agent →"
          actionHref="/agents/new"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {agents.map((agent) => (
            <div key={agent.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-slate-700 transition-all shadow-xl">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100 text-lg">{agent.name}</h3>
                    <span className="px-2.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px]">
                      {agent.environment}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{agent.purpose}</p>

              <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 text-xs space-y-1">
                <span className="text-slate-500 font-mono uppercase text-[10px]">Primary Objective:</span>
                <p className="text-slate-300 truncate">{agent.objective}</p>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                <span className="text-[11px] font-mono text-slate-500">
                  Created {new Date(agent.created_at).toLocaleDateString()}
                </span>

                <Link
                  href={`/agents/${agent.id}`}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold inline-flex items-center space-x-1"
                >
                  <span>Manage Profile</span>
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
