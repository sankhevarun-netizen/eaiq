"use client";

import { useState } from "react";
import { ConsoleTitle, Kpi, Panel, RoleNote } from "@/components/console/ConsoleShell";
import { canAct, useConsole } from "@/components/providers/ConsoleStore";
import { apps, sevenRColors, type App } from "@/data/demo/enterprise";
import { cn, inr } from "@/lib/utils";

export default function PortfolioPage() {
  const { role, request, approvals } = useConsole();
  const [sel, setSel] = useState<App>(apps[0]);
  const allowed = canAct(role, "enterprise");
  const waves = [1, 2, 3].map((w) => ({ w, apps: apps.filter((a) => a.wave === w) }));
  const pending = approvals.some((a) => a.kind === "7R path" && a.title.startsWith(sel.name) && a.status === "Pending");

  return (
    <>
      <ConsoleTitle eyebrow="Portfolio rationalization · E1" title="A 7R path per application, ordered into waves" sub="7R scores from fit, cost, risk and debt; TOGAF rule checks. The architect approves each path and each TOGAF exception." />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Applications" value={apps.length} />
        <Kpi label="Approved paths" value={apps.filter((a) => a.approved).length} tone="good" />
        <Kpi label="Run cost / year" value={inr(apps.reduce((s, a) => s + a.costYear, 0))} />
        <Kpi label="TOGAF failures" value={apps.reduce((s, a) => s + a.togafFails.length, 0)} tone="warn" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Panel title="Applications" className="xl:col-span-2">
          <div className="no-scrollbar overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead><tr className="text-left text-xs uppercase tracking-wider text-slate-400"><th className="py-2">Application</th><th>Capability</th><th>7R path</th><th>Wave</th><th>Cost / yr</th><th>Status</th></tr></thead>
              <tbody>
                {apps.map((a) => (
                  <tr key={a.id} onClick={() => setSel(a)} className={cn("cursor-pointer border-t border-slate-100 hover:bg-slate-50", sel.id === a.id && "bg-brand-soft/50")}>
                    <td className="py-2.5 font-semibold text-slate-800">{a.name}</td>
                    <td className="text-slate-600">{a.capability}</td>
                    <td><span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", sevenRColors[a.path])}>{a.path}</span></td>
                    <td>{a.wave || "—"}</td>
                    <td>{inr(a.costYear)}</td>
                    <td className={a.approved ? "text-xs font-semibold text-brand-green" : "text-xs font-semibold text-amber-600"}>{a.approved ? "Approved" : "Awaiting architect"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
        <Panel title={`${sel.name} · why ${sel.path}`}>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">7R scores</p>
          <div className="mt-2 space-y-2">
            {Object.entries(sel.scores).map(([k, v]) => (
              <div key={k}><div className="flex justify-between text-xs text-slate-600"><span className="capitalize">{k}</span><span className="font-semibold">{v}</span></div><div className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-brand-blue" style={{ width: `${v}%` }} /></div></div>
            ))}
          </div>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Stack facts</p>
          <p className="mt-1 text-sm text-slate-700">{sel.stack.join(", ")} · {sel.hosting} · {sel.dataStores.join(", ")}</p>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Failed TOGAF checks</p>
          {sel.togafFails.length ? sel.togafFails.map((t) => <p key={t} className="mt-1 text-sm text-red-600">• {t}</p>) : <p className="mt-1 text-sm text-brand-green">None</p>}
          {!sel.approved && (
            <button disabled={!allowed || pending} onClick={() => request({ kind: "7R path", title: `${sel.name} → ${sel.path} (wave ${sel.wave})`, requestedBy: "E1", evidence: `fit ${sel.scores.fit} · debt ${sel.scores.debt} · ${sel.togafFails.length} TOGAF fails` })} className="mt-5 w-full rounded-lg bg-brand-blue py-2 text-sm font-semibold text-white hover:bg-brand-blue-dark disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400">{pending ? "Sent to architect" : "Send path for architect approval"}</button>
          )}
          <RoleNote allowed={allowed} text={`Your role (${role}) cannot submit paths.`} />
        </Panel>
      </div>

      <Panel title="Waves · ordered by dependency and cost" className="mt-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {waves.map((w) => (
            <div key={w.w} className="rounded-lg border border-slate-200 p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-brand-blue">Wave {w.w}</p>
              {w.apps.map((a) => <div key={a.id} className="mt-2 flex items-center justify-between gap-2"><span className="text-sm text-slate-700">{a.name}</span><span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", sevenRColors[a.path])}>{a.path}</span></div>)}
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}
