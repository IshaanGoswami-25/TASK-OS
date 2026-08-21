import React from 'react';
import { Shield, Sparkles } from 'lucide-react';

interface LoadingOverlayProps {
  message?: string;
  subMessage?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  message = 'Processing agent stress test...',
  subMessage = 'Evaluating behavior against safety policies and tools',
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
      <div className="flex flex-col items-center max-w-sm p-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-center">
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 animate-pulse">
            <Shield className="w-8 h-8" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
          </div>
        </div>
        <h4 className="text-lg font-bold text-slate-100 mb-2">{message}</h4>
        <p className="text-xs text-slate-400 mb-6">{subMessage}</p>
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full w-2/3 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};
