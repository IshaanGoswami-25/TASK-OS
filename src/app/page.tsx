import React from 'react';
import Link from 'next/link';
import { 
  Shield, 
  ArrowRight, 
  Sparkles, 
  AlertTriangle, 
  Cpu, 
  Terminal, 
  Activity, 
  GitBranch, 
  CheckCircle2, 
  ShieldAlert,
  Zap
} from 'lucide-react';
import { TrustOSLogo } from '@/components/ui/TrustOSLogo';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-slate-950">
      {/* Navbar */}
      <header className="border-b border-slate-800/80 px-8 py-5 flex items-center justify-between sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md">
        <div className="flex items-center space-x-4">
          <Link href="/" className="block">
            <TrustOSLogo iconClassName="w-9 h-10" textClassName="text-2xl font-black text-white font-sans tracking-wide" />
          </Link>
          <span className="hidden md:inline-block h-4 w-px bg-slate-800" />
          <span className="hidden md:inline-block text-xs font-mono text-slate-400">
            Developed by <span className="text-emerald-400 font-semibold">CodingTrio</span> — Ishaan, Eshika &amp; Hardik
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <Link 
            href="/dashboard" 
            className="text-xs font-semibold text-slate-300 hover:text-emerald-400 transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/agents/new"
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition-all duration-200 shadow-lg shadow-emerald-500/20"
          >
            <span>Start Testing</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-24 max-w-5xl mx-auto text-center space-y-8 relative overflow-hidden">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Continuous Integration & Crash-Testing for Autonomous AI Agents</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-100 leading-tight">
          Can You Trust Your <br />
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            AI Agent in the Real World?
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
          TRUSTOS stress-tests AI agents in a controlled environment, discovers hidden failure modes, 
          explains why they happen, visualizes Failure DNA, and tracks reliability across versions.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/agents/new"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-base transition-all duration-200 shadow-xl shadow-emerald-500/25"
          >
            <span>Start Crash Testing</span>
            <ArrowRight className="w-5 h-5" />
          </Link>

          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-base transition-all duration-200"
          >
            <span>Open Dashboard</span>
          </Link>
        </div>
      </section>

      {/* Why AI Agents Fail Section */}
      <section className="py-20 border-t border-slate-800/80 bg-slate-950/50">
        <div className="max-w-6xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-4xl font-bold text-slate-100">
              Why AI Agents Fail in Production
            </h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              Autonomous agents can fail unpredictably when faced with edge cases, tool failures, or adversarial inputs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Tool Misuse & Unsafe Actions',
                desc: 'Agents calling wrong tools, submitting invalid parameter schemas, or executing destructive database mutations without authorization.',
                icon: ShieldAlert,
                color: 'text-rose-400 bg-rose-500/10 border-rose-500/30'
              },
              {
                title: 'Goal Drift & Context Misdirection',
                desc: 'Agents abandoning their primary objective mid-execution when exposed to ambiguous instructions or user distractions.',
                icon: Activity,
                color: 'text-amber-400 bg-amber-500/10 border-amber-500/30'
              },
              {
                title: 'Indirect Prompt Injection',
                desc: 'Untrusted document payloads or search outputs hijacking the system instructions and overriding safety policies.',
                icon: AlertTriangle,
                color: 'text-purple-400 bg-purple-500/10 border-purple-500/30'
              },
              {
                title: 'Silent Failures & Hallucination',
                desc: 'Confidently outputting incorrect or fabricated information without raising errors or flagging uncertainty.',
                icon: Cpu,
                color: 'text-blue-400 bg-blue-500/10 border-blue-500/30'
              },
              {
                title: 'Error Recovery Failure',
                desc: 'Entering infinite retry loops or crashing silently when external APIs return HTTP 500 or network timeouts.',
                icon: Terminal,
                color: 'text-teal-400 bg-teal-500/10 border-teal-500/30'
              },
              {
                title: 'Version Regressions',
                desc: 'New prompt or tool updates breaking safety behaviors that passed in previous versions.',
                icon: GitBranch,
                color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
              }
            ].map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.title} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-slate-700 transition-all">
                  <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${card.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-100">{card.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{card.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How TRUSTOS Works Section */}
      <section id="how-it-works" className="py-20 border-t border-slate-800/80">
        <div className="max-w-5xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-4xl font-bold text-slate-100">
              How TRUSTOS Evaluation Engine Works
            </h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              A 5-step continuous reliability workflow built for AI agent engineering teams.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            {[
              { step: '01', title: 'Configure', desc: 'Define objectives, tools, & safety policies' },
              { step: '02', title: 'Generate', desc: 'AI synthesizes realistic & adversarial scenarios' },
              { step: '03', title: 'Sandbox', desc: 'Replay in safe mock tool sandbox environment' },
              { step: '04', title: 'Diagnose', desc: 'Map root cause using Failure DNA timeline' },
              { step: '05', title: 'Retest', desc: 'Track Trust Score improvement across versions' },
            ].map((item) => (
              <div key={item.step} className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-center space-y-2">
                <span className="text-xs font-mono font-bold text-emerald-400 block">{item.step}</span>
                <h4 className="font-bold text-slate-100 text-sm">{item.title}</h4>
                <p className="text-[11px] text-slate-400 leading-snug">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 py-8 px-6 text-center text-xs text-slate-500">
        <p>TRUSTOS — AI Agent Crash-Test & Evaluation Platform • OOSOC 2026 IIIT Allahabad</p>
      </footer>
    </div>
  );
}
