"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Activity, AlertTriangle, Boxes, Building2, CheckSquare, ClipboardList, GitBranch, GitPullRequest,
  LayoutDashboard, Menu, MessageSquare, Network, Repeat, ScrollText, Share2, Target, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/layout/Logo";
import { ROLES, useConsole } from "@/components/providers/ConsoleStore";
import { ENTERPRISES, SITES } from "@/lib/consoleData";

const SITE = { asOf: "27 Nov 2026, 13:15 IST" };

const GROUPS = [
  {
    label: "DC pack · the facility",
    links: [
      { href: "/console/dc/command", label: "Command view", icon: LayoutDashboard },
      { href: "/console/dc/twin", label: "Digital twin", icon: Boxes },
      { href: "/console/dc/incidents", label: "Incident command", icon: AlertTriangle },
      { href: "/console/dc/risk", label: "Predictive maintenance", icon: Activity },
      { href: "/console/dc/switchover", label: "Switchover planner", icon: Repeat },
      { href: "/console/dc/graph", label: "Knowledge graph", icon: Share2 },
      { href: "/console/dc/copilot", label: "AI briefing & copilot", icon: MessageSquare },
    ],
  },
  {
    label: "Enterprise pack · the estate",
    links: [
      { href: "/console/enterprise/portfolio", label: "Portfolio (7R)", icon: Building2 },
      { href: "/console/enterprise/architecture", label: "Stack & TOGAF", icon: ClipboardList },
      { href: "/console/enterprise/dependencies", label: "Dependencies", icon: Network },
      { href: "/console/enterprise/releases", label: "Releases & support", icon: GitPullRequest },
      { href: "/console/enterprise/scorecard", label: "Estate scorecard", icon: Target },
      { href: "/console/enterprise/review-queue", label: "Link review queue", icon: GitBranch },
    ],
  },
  {
    label: "Shared",
    links: [
      { href: "/console/approvals", label: "Approvals", icon: CheckSquare },
      { href: "/console/audit", label: "Decision log & audit", icon: ScrollText },
    ],
  },
];

export function ConsoleShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { role, setRole, user, approvals, siteId, setSiteId, entId, setEntId } = useConsole();
  const isEnt = pathname.startsWith("/console/enterprise");
  const [open, setOpen] = useState(false);
  const pending = approvals.filter((a) => a.status === "Pending").length;

  const nav = (
    <nav className="space-y-6">
      {GROUPS.map((g) => (
        <div key={g.label}>
          <p className="mb-2 px-3 text-[0.68rem] font-bold uppercase tracking-wider text-slate-400">{g.label}</p>
          <ul className="space-y-0.5">
            {g.links.map((l) => {
              const active = pathname === l.href;
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                      active ? "bg-brand-soft font-semibold text-brand-blue" : "font-medium text-slate-600 hover:bg-slate-100 hover:text-brand-blue",
                    )}
                  >
                    <l.icon className="h-4 w-4 flex-shrink-0" />
                    {l.label}
                    {l.href === "/console/approvals" && pending > 0 && (
                      <span className="ml-auto rounded-full bg-orange-100 px-1.5 text-[11px] font-bold text-orange-700">{pending}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-slate-50/70">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setOpen((v) => !v)} aria-label="Toggle sidebar" className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden">
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Link href="/"><Logo className="text-xl" /></Link>
            {isEnt ? (
              <select value={entId} onChange={(e) => setEntId(e.target.value)} aria-label="Enterprise" className="hidden rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 outline-none focus:border-brand-blue sm:block">
                {ENTERPRISES.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            ) : (
              <select value={siteId} onChange={(e) => setSiteId(e.target.value)} aria-label="Site" className="hidden rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 outline-none focus:border-brand-blue sm:block">
                {SITES.map((s) => <option key={s.id} value={s.id}>{s.id} · {s.name}</option>)}
              </select>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-slate-400 md:inline">As of {SITE.asOf}</span>
            <label className="flex items-center gap-2 text-xs text-slate-500">
              <span className="hidden sm:inline">Role</span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as (typeof ROLES)[number])}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-brand-blue"
              >
                {ROLES.map((r) => <option key={r}>{r}</option>)}
              </select>
            </label>
            <span className="hidden h-8 w-8 items-center justify-center rounded-full bg-brand-blue text-xs font-bold text-white sm:flex" title={user}>
              {user.split(" ").map((p) => p[0]).slice(0, 2).join("")}
            </span>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 flex-shrink-0 overflow-y-auto border-r border-slate-200 bg-white px-3 py-6 lg:block">{nav}</aside>
        {open && <div className="fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto bg-white px-3 py-6 lg:hidden">{nav}</div>}
        <main className="min-w-0 flex-1 px-4 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}

export function ConsoleTitle({ eyebrow, title, sub, right }: { eyebrow: string; title: string; sub?: string; right?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl animate-fade-in motion-reduce:animate-none">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-blue">{eyebrow}</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">{title}</h1>
        {sub && <p className="mt-1 text-sm text-slate-500">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

export function Panel({ title, asOf = true, action, children, className }: { title?: string; asOf?: boolean; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-xl border border-slate-200 bg-white p-5 shadow-card", className)}>
      {(title || action) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-sm font-semibold text-slate-800">{title}</h2>}
            {asOf && <p className="text-[11px] text-slate-400">As of {SITE.asOf}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

export function Kpi({ label, value, sub, tone = "default", href }: { label: string; value: React.ReactNode; sub?: string; tone?: "default" | "bad" | "warn" | "good"; href?: string }) {
  const toneCls = { default: "text-slate-900", bad: "text-red-600", warn: "text-amber-600", good: "text-brand-green" }[tone];
  const body = (
    <div className={cn("h-full rounded-xl border border-slate-200 bg-white p-5 shadow-card", href && "transition-all hover:-translate-y-1 hover:border-blue-200 hover:shadow-card-hover motion-reduce:hover:translate-y-0")}>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      <p className={cn("mt-2 text-2xl font-extrabold tracking-tight", toneCls)}>{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
      <p className="mt-2 text-[10px] text-slate-300">As of {SITE.asOf}</p>
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

export function RoleNote({ allowed, text }: { allowed: boolean; text: string }) {
  if (allowed) return null;
  return <p className="mt-2 text-xs text-slate-400">{text}</p>;
}
