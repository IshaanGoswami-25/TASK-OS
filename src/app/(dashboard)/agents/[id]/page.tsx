'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { AgentProfile, AgentTool, AgentVersion, SafetyPolicy, SuccessCriteria } from '@/lib/types';
import { getAgentById, getAgentTools, getAgentVersions, getSafetyPolicies, getSuccessCriteria } from '@/lib/storage';
import { Bot, Code2, Wrench, ShieldCheck, CheckCircle2, ArrowLeft, FlaskConical } from 'lucide-react';

export default function AgentDetailPage() {
  const params = useParams();
  const agentId = params.id as string;

  const [agent, setAgent] = useState<AgentProfile | null>(null);
  const [versions, setVersions] = useState<AgentVersion[]>([]);
  const [activeVersion, setActiveVersion] = useState<AgentVersion | null>(null);
  const [tools, setTools] = useState<AgentTool[]>([]);
  const [policies, setPolicies] = useState<SafetyPolicy[]>([]);
  const [criteria, setCriteria] = useState<SuccessCriteria[]>([]);

  useEffect(() => {
    async function load() {
      if (!agentId) return;
      const ag = await getAgentById(agentId);
      if (ag) {
        setAgent(ag);
        const vers = await getAgentVersions(ag.id);
        setVersions(vers);
        const current = vers.find(v => v.id === ag.current_version_id) || vers[0];
        if (current) {
          setActiveVersion(current);
          const t = await getAgentTools(current.id);
          setTools(t);
          const p = await getSafetyPolicies(current.id);
          setPolicies(p);
          const c = await getSuccessCriteria(current.id);
          setCriteria(c);
        }
      }
    }
    load();
  }, [agentId]);

  if (!agent) {
    return <div className="py-16 text-center text-slate-400 font-mono">Loading Agent Profile...</div>;
  }

  return (
    <div className="space-y-8 pb-16">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/agents" className="text-xs text-emerald-400 hover:underline flex items-center space-x-1 mb-2">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Agents Portfolio</span>
          </Link>
          <h2 className="text-2xl font-black text-slate-100 flex items-center space-x-3">
            <Bot className="w-6 h-6 text-emerald-400" />
            <span>{agent.name}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">{agent.purpose}</p>
        </div>

        <Link
          href={`/tests/new?agentId=${agent.id}`}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-emerald-500/20"
        >
          <FlaskConical className="w-4 h-4" />
          <span>Launch Crash Test</span>
        </Link>
      </div>

      {/* System Prompt Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2 border-b border-slate-800 pb-3">
          <Code2 className="w-4 h-4 text-emerald-400" />
          <span>System Instructions ({activeVersion?.version_name || 'v1.0'})</span>
        </h3>
        <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 overflow-x-auto whitespace-pre-wrap">
          {activeVersion?.system_instructions || 'No system prompt defined.'}
        </pre>
      </div>

      {/* Tools & Safety Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Configured Tools */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-slate-100 flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="flex items-center space-x-2">
              <Wrench className="w-4 h-4 text-emerald-400" />
              <span>Tools ({tools.length})</span>
            </span>
          </h3>

          {tools.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No tools configured for this version.</p>
          ) : (
            <div className="space-y-3">
              {tools.map((t) => (
                <div key={t.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200 text-xs">{t.name}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      t.risk_level === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400' :
                      t.risk_level === 'HIGH' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {t.risk_level}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">{t.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Safety Policies */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2 border-b border-slate-800 pb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Safety Policies ({policies.length})</span>
          </h3>

          {policies.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No safety policies defined.</p>
          ) : (
            <div className="space-y-3">
              {policies.map((p) => (
                <div key={p.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300 text-xs">{p.title}</span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] font-mono font-bold uppercase">
                      {p.severity}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">{p.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
