import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TRUSTOS — AI Agent Crash-Test, Evaluation & Reliability Platform',
  description: 'Stress-test AI agents in a controlled environment, discover hidden failure modes, visualize Failure DNA, and track reliability across versions.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen selection:bg-emerald-500 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
