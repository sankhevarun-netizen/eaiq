"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { ConsoleTitle, Panel, RoleNote } from "@/components/console/ConsoleShell";
import { canAct, useConsole } from "@/components/providers/ConsoleStore";
import { switchoverScenarios, type SwitchoverScenario } from "@/data/demo/nexusMumbai1";
import { cn, inr } from "@/lib/utils";

const verdictCls = {
  GO: "bg-green-50 text-brand-green-dark border-green-200",
  "GO WITH CONDITIONS": "bg-amber-50 text-amber-700 border-amber-200",
  "NO-GO": "bg-red-50 text-red-600 border-red-200",
};

export default function SwitchoverPage() {
  const { role, request, log } = useConsole();
  const [pick, setPick] = useState(switchoverScenarios[0].id);
  const [run, setRun] = useState<SwitchoverScenario | null>(null);
  const [runs, setRuns] = useState(0);
  const allowed = canAct(role, "dc");

  const simulate = () => {
    const s = switchoverScenarios.find((x) => x.id === pick)!;
    setRun(s);
    setRuns((r) => r + 1);
    log("Simulated switchover (D4)", s.label, `verdict=${s.verdict}`);
  };

  return (
    <>
      <ConsoleTitle eyebrow="Switchover planner · D4" title="Is this planned change safe, and when?" sub="Affected loads, redundant, single-path or lost status, SLA exposure, ranked windows over 14 days, a verdict and a runbook with rollback. It simulates only." />

      <Panel title="Planned change" asOf={false}>
        <div className="flex flex-col gap-3 sm:flex-row">
          <select value={pick} onChange={(e) => setPick(e.target.value)} className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-blue">
            {switchoverScenarios.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
          <button onClick={simulate} className="rounded-lg bg-brand-blue px-5 py-2 text-sm font-semibold text-white hover:bg-brand-blue-dark">Simulate</button>
        </div>
        {runs > 1 && <p className="mt-2 inline-flex items-center gap-1 text-xs text-slate-500"><RotateCcw className="h-3 w-3" /> Run {runs} — the switchover engine sets the verdict, so the same input gives the same output.</p>}
      </Panel>

      {run && (
        <>
          <div className={cn("mt-4 rounded-xl border p-5", verdictCls[run.verdict])}>
            <p className="text-xs font-semibold uppercase tracking-widest opacity-80">Verdict · {run.label}</p>
            <p className="mt-1 text-2xl font-extrabold tracking-tight">{run.verdict}</p>
            {run.conditions.length > 0 && (
              <ul className="mt-3 space-y-1">{run.conditions.map((c) => <li key={c} className="text-sm">• {c}</li>)}</ul>
            )}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
            <Panel title="Affected loads" className="xl:col-span-2">
              <div className="space-y-2">
                {run.loads.map((l) => (
                  <div key={l.asset} className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-100 p-3">
                    <p className="min-w-[160px] text-sm font-semibold text-slate-800">{l.asset}</p>
                    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-bold", l.status === "Redundant" ? "bg-green-50 text-brand-green-dark" : l.status === "Single-path" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-600")}>{l.status}</span>
                    <div className="flex flex-wrap gap-1.5">{l.tenants.map((t) => <span key={t} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{t}</span>)}</div>
                  </div>
                ))}
              </div>
            </Panel>
            <Panel title="SLA exposure">
              <p className="text-3xl font-extrabold text-slate-900">{inr(run.exposure)}</p>
              <p className="text-xs text-slate-500">if a single-path load fails during the window (1 hour)</p>
            </Panel>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
            <Panel title="Ranked windows · next 14 days">
              <div className="space-y-2">
                {run.windows.map((w, i) => (
                  <div key={w.date + w.time} className={cn("flex items-center gap-3 rounded-lg border p-3", i === 0 ? "border-brand-blue/30 bg-brand-soft/50" : "border-slate-100")}>
                    <span className="w-10 text-center text-lg font-extrabold text-brand-blue">{w.score}</span>
                    <div><p className="text-sm font-semibold text-slate-800">{w.date} · {w.time}{i === 0 && <span className="ml-2 text-xs font-semibold text-brand-green">Safest</span>}</p><p className="text-xs text-slate-500">{w.reason}</p></div>
                  </div>
                ))}
              </div>
            </Panel>
            <Panel title="Runbook with rollback">
              <ol className="space-y-2.5">
                {run.runbook.map((s, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">{i + 1}</span>
                    <div><p className="text-sm text-slate-800">{s.step}</p>{s.rollback && <p className="text-xs text-orange-600">Rollback: {s.rollback}</p>}</div>
                  </li>
                ))}
              </ol>
              <p className="mt-3 text-[11px] text-slate-400">D4 asks D3 for weak equipment on the path and S1 for runbook steps.</p>
            </Panel>
          </div>

          <div className="mt-4 flex flex-col gap-2 rounded-xl border border-orange-200 bg-orange-50/60 p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-700">An approver signs before any ITSM change. EAiQ itself changes nothing.</p>
            <div>
              <button
                disabled={!allowed || run.verdict === "NO-GO"}
                onClick={() => request({ kind: "ITSM change", title: `${run.label} — ${run.windows[0].date} ${run.windows[0].time}`, requestedBy: "D4", evidence: `Verdict ${run.verdict} · window score ${run.windows[0].score}` })}
                className="rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white hover:bg-brand-blue-dark disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
              >Request approval</button>
              <RoleNote allowed={allowed} text={`Your role (${role}) cannot request changes.`} />
            </div>
          </div>
        </>
      )}
    </>
  );
}
