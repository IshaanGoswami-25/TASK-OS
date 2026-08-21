'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AgentProfile } from '@/lib/types';
import { getAgents } from '@/lib/storage';
import { Bot, Plus, FlaskConical, Sparkles, Database } from 'lucide-react';

interface HeaderProps {
  currentAgentId?: string;
  onSelectAgent?: (agentId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentAgentId, onSelectAgent }) => {
  const [agents, setAgents] = useState<AgentProfile[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AgentProfile | null>(null);

  useEffect(() => {
    async function loadAgents() {
      const list = await getAgents();
      setAgents(list);
      if (list.length > 0) {
        const found = list.find(a => a.id === currentAgentId) || list[0];
        setSelectedAgent(found);
      }
    }
    loadAgents();
  }, [currentAgentId]);

  return (
    <header className="h-16 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-8 flex items-center justify-between sticky top-0 z-20">
      {/* Agent Dropdown Selector */}
      <div className="flex items-center space-x-4">
        {agents.length > 0 ? (
          <div className="flex items-center space-x-3 bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-xl">
            <Bot className="w-4 h-4 text-emerald-400" />
            <select
              value={selectedAgent?.id || ''}
              onChange={(e) => {
                const target = agents.find(a => a.id === e.target.value);
                if (target) {
                  setSelectedAgent(target);
                  if (onSelectAgent) onSelectAgent(target.id);
                }
              }}
              className="bg-transparent text-slate-100 font-semibold text-sm focus:outline-none cursor-pointer pr-2"
            >
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id} className="bg-slate-900 text-slate-100">
                  {agent.name} ({agent.environment})
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="flex items-center space-x-2 text-xs font-mono text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
            <Bot className="w-4 h-4 text-slate-500" />
            <span>No Agents Configured</span>
          </div>
        )}

        {selectedAgent && (
          <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold">
            {selectedAgent.environment}
          </span>
        )}
      </div>

      {/* Quick Action Buttons */}
      <div className="flex items-center space-x-3">
        <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Dynamic Scenario Engine</span>
        </div>

        <Link
          href="/agents/new"
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-xs transition-all duration-200"
        >
          <Plus className="w-4 h-4 text-emerald-400" />
          <span>New Agent</span>
        </Link>

        {agents.length > 0 && (
          <Link
            href="/tests/new"
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition-all duration-200 shadow-lg shadow-emerald-500/20"
          >
            <FlaskConical className="w-4 h-4" />
            <span>Run Crash Test</span>
          </Link>
        )}
      </div>
    </header>
  );
};
