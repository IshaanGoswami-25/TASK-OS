'use client';

import React, { useState } from 'react';
import { isSupabaseConfigured } from '@/lib/supabase';
import { isAIConfigured } from '@/lib/ai/provider';
import { clearAllLocalData } from '@/lib/storage';
import { Settings, Database, Key, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

export default function SettingsPage() {
  const [cleared, setCleared] = useState<boolean>(false);

  const handleClear = () => {
    if (confirm('Are you sure you want to clear all local data? This will reset the application to zero agents.')) {
      clearAllLocalData();
      setCleared(true);
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <div>
        <h2 className="text-2xl font-black text-slate-100 flex items-center space-x-3">
          <Settings className="w-7 h-7 text-emerald-400" />
          <span>Platform Settings & Integrations</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">Configure Supabase credentials, AI provider keys, and database resets</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
        <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2 border-b border-slate-800 pb-3">
          <Database className="w-4 h-4 text-emerald-400" />
          <span>Database & Persistence Status</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
            <span className="text-slate-400 font-mono">Supabase Integration</span>
            <div className="flex items-center space-x-2 font-bold">
              {isSupabaseConfigured ? (
                <span className="text-emerald-400 flex items-center space-x-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Connected (Cloud PostgreSQL)</span>
                </span>
              ) : (
                <span className="text-amber-400 flex items-center space-x-1">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Zero-Setup Mode (Local Dual Sync Active)</span>
                </span>
              )}
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
            <span className="text-slate-400 font-mono">AI Provider Engine</span>
            <div className="flex items-center space-x-2 font-bold">
              {isAIConfigured ? (
                <span className="text-emerald-400 flex items-center space-x-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Google Gemini Active</span>
                </span>
              ) : (
                <span className="text-emerald-400 flex items-center space-x-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Dynamic Heuristic AI Synthesizer Active</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Clear Data Reset Button */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-200">Reset Local Database</h4>
            <p className="text-xs text-slate-500">Clears all locally stored agent profiles, test runs, and failure logs.</p>
          </div>

          <button
            onClick={handleClear}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 font-semibold text-xs transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{cleared ? 'Database Reset!' : 'Reset All Data'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
