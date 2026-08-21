'use client';

import React, { useState } from 'react';
import { DNANode, FailureDNA } from '@/lib/types';
import { ArrowRight, AlertTriangle, CheckCircle2, FileText, Terminal, ShieldAlert, Cpu, Activity, X } from 'lucide-react';

interface FailureDNAGraphProps {
  dna: FailureDNA;
  onClose?: () => void;
}

export const FailureDNAGraph: React.FC<FailureDNAGraphProps> = ({ dna, onClose }) => {
  const [selectedNode, setSelectedNode] = useState<DNANode | null>(dna.nodes[0] || null);

  const getNodeColor = (type: DNANode['type']) => {
    switch (type) {
      case 'user_request':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30 hover:border-blue-400';
      case 'agent_decision':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30 hover:border-indigo-400';
      case 'tool_call':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30 hover:border-purple-400';
      case 'conflicting_info':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:border-amber-400';
      case 'goal_drift':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/30 hover:border-orange-400';
      case 'unsafe_action':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:border-rose-400';
      case 'failure':
        return 'bg-red-600/20 text-red-400 border-red-500/50 hover:border-red-400 font-bold shadow-lg shadow-red-500/10';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getNodeIcon = (type: DNANode['type']) => {
    switch (type) {
      case 'user_request': return <FileText className="w-4 h-4" />;
      case 'agent_decision': return <Cpu className="w-4 h-4" />;
      case 'tool_call': return <Terminal className="w-4 h-4" />;
      case 'conflicting_info': return <AlertTriangle className="w-4 h-4" />;
      case 'goal_drift': return <Activity className="w-4 h-4" />;
      case 'unsafe_action': return <ShieldAlert className="w-4 h-4" />;
      case 'failure': return <AlertTriangle className="w-4 h-4 text-red-400" />;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono font-bold uppercase">
              Failure DNA Trace
            </span>
            <h3 className="text-lg font-bold text-slate-100">Root-Cause Timeline Analysis</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Click any node below to inspect execution evidence and evaluator reasoning.
          </p>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Node Flow Chain Visualizer */}
      <div className="overflow-x-auto pb-4">
        <div className="flex items-center space-x-3 min-w-max py-3 px-2">
          {dna.nodes.map((node, index) => {
            const isSelected = selectedNode?.id === node.id;
            return (
              <React.Fragment key={node.id}>
                <button
                  onClick={() => setSelectedNode(node)}
                  className={`flex items-center space-x-2.5 px-4 py-3 rounded-xl border transition-all duration-200 cursor-pointer ${getNodeColor(node.type)} ${
                    isSelected ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-slate-900 scale-105 shadow-xl' : 'opacity-90'
                  }`}
                >
                  <div className="p-1.5 rounded-lg bg-slate-950/40">
                    {getNodeIcon(node.type)}
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-mono font-semibold uppercase tracking-wider opacity-75">
                      {node.type.replace('_', ' ')}
                    </div>
                    <div className="text-sm font-medium">{node.label}</div>
                  </div>
                </button>
                {index < dna.nodes.length - 1 && (
                  <ArrowRight className="w-5 h-5 text-slate-600 shrink-0 animate-pulse" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Node Evidence Inspection Panel */}
      {selectedNode && (
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                {getNodeIcon(selectedNode.type)}
              </div>
              <h4 className="font-semibold text-slate-200 text-sm">
                Node Evidence: <span className="text-slate-100">{selectedNode.label}</span>
              </h4>
            </div>
            <span className="text-xs font-mono text-slate-500">
              {new Date(selectedNode.timestamp).toLocaleTimeString()}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 space-y-1">
              <span className="text-slate-400 font-mono font-semibold uppercase">Description</span>
              <p className="text-slate-200">{selectedNode.description}</p>
            </div>
            {selectedNode.evidenceSnippet && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 space-y-1">
                <span className="text-slate-400 font-mono font-semibold uppercase">Trace Output / Payload</span>
                <pre className="font-mono text-emerald-300 text-xs overflow-x-auto whitespace-pre-wrap">
                  {selectedNode.evidenceSnippet}
                </pre>
              </div>
            )}
          </div>

          <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-lg p-3">
            <span className="text-emerald-400 font-semibold text-xs block mb-1">Evaluator Explanation:</span>
            <p className="text-slate-300 text-xs leading-relaxed">{dna.explanation}</p>
          </div>
        </div>
      )}
    </div>
  );
};
