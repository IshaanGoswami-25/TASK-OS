'use client';

import React from 'react';
import { ExecutionEvent } from '@/lib/types';
import { Terminal, Clock, CheckCircle, AlertCircle, Cpu, ArrowRight, User, ShieldAlert } from 'lucide-react';

interface ExecutionTraceViewerProps {
  events: ExecutionEvent[];
  scenarioTitle?: string;
}

export const ExecutionTraceViewer: React.FC<ExecutionTraceViewerProps> = ({ events, scenarioTitle }) => {
  const getEventBadge = (type: ExecutionEvent['event_type']) => {
    switch (type) {
      case 'user_input':
        return { label: 'User Input', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30', icon: User };
      case 'agent_decision':
        return { label: 'Agent Reasoning', bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30', icon: Cpu };
      case 'tool_selection':
        return { label: 'Tool Selection', bg: 'bg-purple-500/10 text-purple-400 border-purple-500/30', icon: Terminal };
      case 'tool_input':
        return { label: 'Tool Input Payload', bg: 'bg-purple-500/10 text-purple-300 border-purple-500/30', icon: Terminal };
      case 'tool_response':
        return { label: 'Tool Response', bg: 'bg-teal-500/10 text-teal-400 border-teal-500/30', icon: CheckCircle };
      case 'final_response':
        return { label: 'Final Output', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', icon: CheckCircle };
      default:
        return { label: type, bg: 'bg-slate-800 text-slate-400 border-slate-700', icon: Clock };
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
            <Terminal className="w-5 h-5 text-emerald-400" />
            <span>Agent Execution Trace</span>
          </h3>
          {scenarioTitle && (
            <p className="text-xs text-slate-400 mt-1">Scenario: {scenarioTitle}</p>
          )}
        </div>
        <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-mono text-xs">
          {events.length} Events Logged
        </span>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
        {events.map((event, idx) => {
          const badge = getEventBadge(event.event_type);
          const Icon = badge.icon;

          return (
            <div key={event.id || idx} className="relative group">
              {/* Timeline marker node */}
              <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-slate-900 border-2 border-emerald-500 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
              </div>

              <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 transition-all duration-200 hover:border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2.5 py-0.5 rounded-md border text-xs font-mono font-semibold flex items-center space-x-1.5 ${badge.bg}`}>
                      <Icon className="w-3.5 h-3.5" />
                      <span>{badge.label}</span>
                    </span>
                    {event.tool_name && (
                      <span className="text-xs font-mono font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                        [{event.tool_name}]
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-3 text-xs text-slate-500 font-mono">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{event.latency_ms}ms</span>
                    </span>
                    <span>{new Date(event.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>

                {event.input_data && (
                  <div className="mt-2 font-mono text-xs text-slate-300 bg-slate-900/90 p-2.5 rounded-lg border border-slate-800/60 overflow-x-auto whitespace-pre-wrap">
                    <span className="text-slate-500 select-none">&gt; Input: </span>
                    {event.input_data}
                  </div>
                )}

                {event.output_data && (
                  <div className="mt-2 font-mono text-xs text-emerald-300/90 bg-slate-900/90 p-2.5 rounded-lg border border-slate-800/60 overflow-x-auto whitespace-pre-wrap">
                    <span className="text-slate-500 select-none">&gt; Output: </span>
                    {event.output_data}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
