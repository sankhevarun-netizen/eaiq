"use client";

import { useState } from "react";
import { ConsoleTitle, Kpi, Panel, RoleNote } from "@/components/console/ConsoleShell";
import { canAct, useConsole } from "@/components/providers/ConsoleStore";
import { watchlist } from "@/data/demo/nexusMumbai1";
import { cn } from "@/lib/utils";

export default function RiskPage() {
  const { role, request, approvals } = useConsole();
  const [sel, setSel] = useState(watchlist[0]);
  const allowed = canAct(role, "dc");
  const requested = approvals.some((a) => a.title.includes(sel.asset) && a.kind === "Maintenance ticket");

  return (
    <>
      <ConsoleTitle eyebrow="Proactive monitoring and predictive maintenance · D3" title="Drift flagged before any alarm" sub="D3 chooses which assets to scan each hour and holds back when data is too thin. The risk engine and BigQuery ML score drift and end of life." />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Assets on watchlist" value={watchlist.length} tone="warn" />
        <Kpi label="Act within 14 days" value={watchlist.filter((w) => w.actBy.includes("Dec")).length} tone="bad" />
        <Kpi label="Scanned this hour" value="38" sub="of 148 · thin-data assets held back: 4" />
        <Kpi label="Last scan" value="09:00" sub="hourly" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Panel title="Ranked watchlist" className="xl:col-span-2">
          <div className="no-scrollbar overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead><tr className="text-left text-xs uppercase tracking-wider text-slate-400"><th className="py-2">#</th><th>Asset</th><th>Drift vs peers</th><th>EoL score</th><th>Act by</th><th>Replace by</th></tr></thead>
              <tbody>
                {watchlist.map((w, i) => (
                  <tr key={w.asset} onClick={() => setSel(w)} className={cn("cursor-pointer border-t border-slate-100 hover:bg-slate-50", sel.asset === w.asset && "bg-brand-soft/50")}>
                    <td className="py-2.5 text-slate-400">{i + 1}</td>
                    <td><p className="font-semibold text-slate-800">{w.asset}</p><p className="text-xs text-slate-500">{w.type}</p></td>
                    <td className="text-slate-600">{w.drift}</td>
                    <td>
                      <div className="flex items-center gap-2"><div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100"><div className={cn("h-full", w.eolScore > 75 ? "bg-red-500" : w.eolScore > 55 ? "bg-amber-500" : "bg-brand-blue")} style={{ width: `${w.eolScore}%` }} /></div><span className="text-xs font-bold">{w.eolScore}</span></div>
                    </td>
                    <td className="font-semibold">{w.actBy}</td>
                    <td className="text-slate-600">{w.replaceBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
        <Panel title={`${sel.asset} · evidence`}>
          <dl className="space-y-3 text-sm">
            <div><dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">Evidence</dt><dd className="mt-0.5 text-slate-700">{sel.evidence}</dd></div>
            <div><dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">Peer delta</dt><dd className="mt-0.5 font-semibold text-red-600">{sel.peerDelta}</dd></div>
            <div><dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">Exposed if it fails</dt><dd className="mt-0.5 text-slate-700">{sel.exposure}</dd></div>
            <div><dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tenants behind it</dt><dd className="mt-1 flex flex-wrap gap-1.5">{sel.tenants.map((t) => <span key={t} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">{t}</span>)}</dd></div>
          </dl>
          <button
            disabled={!allowed || requested}
            onClick={() => request({ kind: "Maintenance ticket", title: `Maintenance for ${sel.asset} (${sel.type})`, requestedBy: "D3", evidence: `EoL ${sel.eolScore} · ${sel.drift}` })}
            className="mt-5 w-full rounded-lg bg-brand-blue py-2 text-sm font-semibold text-white hover:bg-brand-blue-dark disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
          >{requested ? "Approval requested" : "Request maintenance ticket"}</button>
          <RoleNote allowed={allowed} text={`Your role (${role}) cannot request tickets.`} />
          <p className="mt-2 text-[11px] text-slate-400">Maintenance ticket only after approval.</p>
        </Panel>
      </div>
    </>
  );
}
