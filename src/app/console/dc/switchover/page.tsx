"use client";

import { useEffect, useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import { ConsoleTitle, Panel, RoleNote } from "@/components/console/ConsoleShell";
import { Loading } from "@/components/console/Loading";
import { canAct, useConsole } from "@/components/providers/ConsoleStore";
import { fmtTime, useRunbooks, useSite } from "@/lib/consoleData";
import { simulateChange, type SwitchResult } from "@/lib/dcEngine";
import { cn, inr } from "@/lib/utils";

const verdictCls = {
  GO: "bg-green-50 text-brand-green-dark border-green-200",
  "GO WITH CONDITIONS": "bg-amber-50 text-amber-700 border-amber-200",
  "NO-GO": "bg-red-50 text-red-600 border-red-200",
};
const TYPES = ["pdu", "ups", "rpp", "ats", "transformer", "feed", "generator", "crah", "pump", "chiller"];
const SUGGESTED: Record<string, string> = { MUM1: "MUM1-PDU-H1-A2", CHN1: "CHN1-CHWP-H1-1", NOI1: "NOI1-UPS-H1-A1" };

export default function SwitchoverPage() {
  const s = useSite();
  const runbooks = useRunbooks();
  const { role, request, log } = useConsole();
  const [pick, setPick] = useState("");
  const [run, setRun] = useState<SwitchResult | null>(null);
  const [runs, setRuns] = useState(0);
  const allowed = canAct(role, "dc");

  const options = useMemo(() => (s ? s.assets.filter((a) => TYPES.includes(a.type)).sort((a, b) => TYPES.indexOf(a.type) - TYPES.indexOf(b.type) || a.id.localeCompare(b.id)) : []), [s]);
  useEffect(() => { if (s) { const sug = SUGGESTED[s.site.id];
      setPick(sug && options.some((o) => o.id === sug) ? sug : options[0]?.id ?? ""); setRun(null); setRuns(0); } }, [s, options]);
  if (!s) return <Loading />;

  const simulate = () => {
    const r = simulateChange(s, pick, runbooks);
    setRun(r);
    setRuns((n) => n + 1);
    log("Simulated switchover (D4)", `${s.site.id} ${pick}`, `verdict=${r.verdict}; single=${r.singlePath}; lostWithAlerts=${r.lostWithAlerts}`);
  };

  return (
    <>
      <ConsoleTitle eyebrow={`Switchover planner · D4 · ${s.site.id}`} title="Is this planned change safe, and when?" sub="Affected loads, redundant, single-path or lost status, SLA exposure, ranked windows over 14 days, a verdict and a runbook with rollback. It simulates only." />

      <Panel title="Planned change" asOf={false}>
        <div className="flex flex-col gap-3 sm:flex-row">
          <select value={pick} onChange={(e) => setPick(e.target.value)} className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-blue">
            {options.map((a) => <option key={a.id} value={a.id}>{a.id} · {a.type}{s.alerts.some((x) => x.target === a.id && x.status === "open") ? " · open alert" : ""}</option>)}
          </select>
          <button onClick={simulate} className="rounded-lg bg-brand-blue px-5 py-2 text-sm font-semibold text-white hover:bg-brand-blue-dark">Simulate</button>
        </div>
        {runs > 1 && <p className="mt-2 inline-flex items-center gap-1 text-xs text-slate-500"><RotateCcw className="h-3 w-3" /> Run {runs} — the switchover engine sets the verdict, so the same input gives the same output.</p>}
      </Panel>

      {run && (
        <>
          <div className={cn("mt-4 rounded-xl border p-5", verdictCls[run.verdict])}>
            <p className="text-xs font-semibold uppercase tracking-widest opacity-80">Verdict · {run.asset} out of service</p>
            <p className="mt-1 text-2xl font-extrabold tracking-tight">{run.verdict}</p>
            {run.conditions.length > 0 && <ul className="mt-3 space-y-1">{run.conditions.map((c) => <li key={c} className="text-sm">• {c}</li>)}</ul>}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Stat label="Lost if alone" v={run.lostAlone} bad={run.lostAlone > 0} />
            <Stat label="Newly single-path" v={run.singlePath} warn={run.singlePath > 0} />
            <Stat label="Lost given open alerts" v={run.lostWithAlerts} bad={run.lostWithAlerts > 0} />
            <Stat label="SLA exposure (4 h)" v={inr(run.exposureInr)} />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
            <Panel title="Affected tenants" className="xl:col-span-2">
              {run.tenants.length ? (
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-xs uppercase tracking-wider text-slate-400"><th className="py-2">Tenant</th><th>Lost</th><th>Single-path</th><th>Notice</th><th>Penalty (4 h)</th></tr></thead>
                  <tbody>{run.tenants.map((t) => <tr key={t.tenant} className="border-t border-slate-100"><td className="py-2 font-semibold">{t.tenant}</td><td className={t.lost ? "font-bold text-red-600" : ""}>{t.lost}</td><td className={t.single ? "text-amber-600" : ""}>{t.single}</td><td>{t.notifyMin ? `${t.notifyMin} min` : "—"}</td><td>{t.penaltyInr ? inr(t.penaltyInr) : "—"}</td></tr>)}</tbody>
                </table>
              ) : <p className="text-sm text-slate-500">No tenant rack loses a power path.</p>}
              {run.coolingRows.length > 0 && <p className="mt-3 text-xs text-slate-600">Cooling: {run.coolingRows.map((r) => `${r.row} ${r.remaining}/${r.total} CRAHs`).join(" · ")}</p>}
              <p className="mt-3 text-[11px] text-slate-400">Penalty = rate × max(0, 4 h − contract threshold); captive sites carry an internal SLA with no penalty.</p>
            </Panel>
            <Panel title="Ranked windows · next 14 days">
              <div className="space-y-2">
                {run.windows.map((w, i) => (
                  <div key={w.start} className={cn("flex items-center gap-3 rounded-lg border p-2.5", i === 0 ? "border-brand-blue/30 bg-brand-soft/50" : "border-slate-100")}>
                    <span className="w-9 text-center text-lg font-extrabold text-brand-blue">{w.score}</span>
                    <div><p className="text-sm font-semibold text-slate-800">{fmtTime(w.start)}{i === 0 && <span className="ml-2 text-xs font-semibold text-brand-green">Safest</span>}</p><p className="text-xs text-slate-500">{w.reason}</p></div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          <Panel title={run.runbook ? `Runbook with rollback · ${run.runbook.id} ${run.runbook.title}` : "Runbook"} className="mt-4">
            {run.runbook ? (
              <ol className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {run.runbook.steps.map((x) => (
                  <li key={x.seq} className={cn("flex gap-3 rounded-lg border p-2.5", x.kind === "rollback" ? "border-orange-200 bg-orange-50/50" : "border-slate-100")}>
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">{x.seq}</span>
                    <div><p className="text-sm text-slate-800">{x.text}</p><p className={cn("text-xs", x.kind === "rollback" ? "text-orange-600" : "text-slate-400")}>{x.kind} · {x.team} · {x.limit} min</p></div>
                  </li>
                ))}
              </ol>
            ) : <p className="text-sm text-slate-500">No runbook for this asset type.</p>}
            <p className="mt-3 text-[11px] text-slate-400">D4 asks D3 for weak equipment on the path and S1 for runbook steps.</p>
          </Panel>

          <div className="mt-4 flex flex-col gap-2 rounded-xl border border-orange-200 bg-orange-50/60 p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-700">An approver signs before any ITSM change. EAiQ itself changes nothing.</p>
            <div>
              <button disabled={!allowed || run.verdict === "NO-GO"} onClick={() => request({ kind: "ITSM change", title: `${run.asset} maintenance — ${fmtTime(run.windows[0].start)}`, requestedBy: "D4", evidence: `${run.verdict} · ${run.singlePath} single-path · exposure ${inr(run.exposureInr)}` })} className="rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white hover:bg-brand-blue-dark disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400">Request approval</button>
              <RoleNote allowed={allowed} text={`Your role (${role}) cannot request changes.`} />
              {run.verdict === "NO-GO" && <p className="mt-1 text-xs text-red-600">NO-GO — resolve the conditions first.</p>}
            </div>
          </div>
        </>
      )}
    </>
  );
}

function Stat({ label, v, bad, warn }: { label: string; v: React.ReactNode; bad?: boolean; warn?: boolean }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-card">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      <p className={cn("mt-1 text-2xl font-extrabold", bad ? "text-red-600" : warn ? "text-amber-600" : "text-slate-900")}>{v}</p>
    </div>
  );
}
