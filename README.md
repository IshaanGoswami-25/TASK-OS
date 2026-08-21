# TRUSTOS — AI Agent Crash-Test, Evaluation & Reliability Platform

> **OOSOC 2026 — IIIT Allahabad | Hackathon Problem Statement 4**

TRUSTOS is a production-grade AI Agent Evaluation and Reliability Platform designed to answer one central question: **“Can I trust this AI agent in the real world?”**

It automatically generates realistic and adversarial test scenarios based on user-defined agent objectives, tools, and safety policies, executes tests in a controlled sandboxed environment, detects complex failure modes, visualizes interactive **Failure DNA** node timelines, calculates a dynamic 8-dimensional **Trust Score**, tracks regressions across agent versions, and produces printable reliability reports.

---

## 🌟 Key Features

* **Dynamic Scenario Generation**: AI-powered synthesis of realistic and adversarial scenarios based on agent objectives, risk levels, and safety policies.
* **7-Step Agent Onboarding Wizard**: Profile details, multiline instructions, dynamic Tool Manager with risk levels (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), Safety Policies, Success Criteria, and Connection Setup.
* **Sandboxed Execution & Adaptive Red Team**: Simulates mock tool responses (`success`, `timeout`, `500 error`, `unauthorized`, `duplicate payload`). Adaptive Red Team escalates to harder variants on pass and targeted variants on failure.
* **Interactive Failure DNA Graph**: Node diagram tracing root-cause failure timelines with clickable evidence drawers (`USER REQUEST` ➔ `AGENT DECISION` ➔ `TOOL CALL` ➔ `CONFLICTING INFO` ➔ `GOAL DRIFT` ➔ `UNSAFE ACTION` ➔ `FAILURE`).
* **Dynamic 8-Dimensional Trust Score**: Transparent scoring across Reliability, Safety, Goal Adherence, Tool Discipline, Robustness, Consistency, Error Recovery, Policy Compliance, and Trust Level classification (`TRUSTED`, `SUPERVISION REQUIRED`, `HIGH RISK`, `DO NOT DEPLOY`).
* **Version Management & Regression Detection**: Side-by-side v1 vs v2 matrix with `⚠ Regression Detected` warnings.
* **Executive Evaluation Report Export**: Downloadable/printable reliability report.
* **Zero Hardcoded Data / Database-First**: Clean empty states (`No agents created yet`, `No evaluation has been performed yet`).

---

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router, TypeScript)
- **Styling**: Tailwind CSS, Lucide Icons, Framer Motion
- **Database**: Supabase PostgreSQL + Row Level Security (RLS) + Dual Local Storage Sync
- **AI Integration**: Google Gemini API (`@google/generative-ai`) + Fallback Heuristic AI Engine
- **Deployment**: Vercel Ready

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment (Optional)

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Vercel Deployment Instructions

1. Push code repository to GitHub.
2. Import project into Vercel.
3. Set environment variables from `.env.example` in Vercel settings.
4. Deploy!
