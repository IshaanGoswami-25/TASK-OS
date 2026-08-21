'use client';

import React from 'react';
import { TrustScore } from '@/lib/types';
import { getTrustLevel, getTrustBadgeColor } from '@/lib/scoring';
import { Shield, ShieldAlert, CheckCircle2, AlertTriangle, Activity } from 'lucide-react';

interface TrustScoreGaugeProps {
  score: TrustScore | null;
}

export const TrustScoreGauge: React.FC<TrustScoreGaugeProps> = ({ score }) => {
  if (!score) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 mx-auto">
          <Shield className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-300">Not Evaluated Yet</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Run your first Crash Test to generate a real-time multi-dimensional Trust Score.
        </p>
      </div>
    );
  }

  const level = getTrustLevel(score.overall_score);
  const badgeClass = getTrustBadgeColor(level);

  const dimensions = [
    { label: 'Reliability', value: score.reliability, weight: '20%' },
    { label: 'Safety', value: score.safety, weight: '20%' },
    { label: 'Goal Adherence', value: score.goal_adherence, weight: '15%' },
    { label: 'Tool Discipline', value: score.tool_discipline, weight: '15%' },
    { label: 'Policy Compliance', value: score.policy_compliance, weight: '15%' },
    { label: 'Robustness', value: score.robustness, weight: '10%' },
    { label: 'Consistency', value: score.consistency, weight: '5%' },
    { label: 'Error Recovery', value: score.error_recovery, weight: '5%' },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
      {/* Overall Score Badge Banner */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-slate-950/80 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center space-x-6">
          <div className="relative flex items-center justify-center w-24 h-24 rounded-full border-4 border-slate-800 bg-slate-900 shadow-inner">
            <div className="text-center">
              <span className="text-3xl font-extrabold text-slate-100 font-mono tracking-tight">
                {score.overall_score}
              </span>
              <span className="text-[10px] block font-mono text-slate-500 font-semibold uppercase">
                / 100
              </span>
            </div>
          </div>
          <div>
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Overall Agent Trust Score
            </span>
            <div className={`inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full border font-bold text-xs font-mono tracking-wide ${badgeClass}`}>
              <Shield className="w-4 h-4" />
              <span>{level}</span>
            </div>
          </div>
        </div>

        <div className="text-right sm:border-l border-slate-800 sm:pl-6 space-y-1">
          <span className="text-[11px] font-mono text-slate-500 uppercase block">Evaluation Status</span>
          <span className="text-xs font-semibold text-emerald-400 flex items-center justify-end space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Dynamic Multi-Vector Verified</span>
          </span>
        </div>
      </div>

      {/* 8 Dimension Breakdown Progress Bars */}
      <div>
        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-4">
          Reliability Dimension Breakdown
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dimensions.map((dim) => (
            <div key={dim.label} className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-slate-300">{dim.label}</span>
                <span className="font-mono text-slate-100 font-bold">{dim.value}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    dim.value >= 85
                      ? 'bg-emerald-500'
                      : dim.value >= 70
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${dim.value}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
