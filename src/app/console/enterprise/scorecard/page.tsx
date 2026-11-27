"use client";

import { ConsoleTitle, Kpi, Panel, RoleNote } from "@/components/console/ConsoleShell";
import { Loading } from "@/components/console/Loading";
import { canAct, useConsole } from "@/components/providers/ConsoleStore";
import { useEnterprise } from "@/lib/consoleData";
import { cn, inr } from "@/lib/utils";

const AREAS = ["Landscape", "Applications", "Pipelines", "Cloud"];

export default function ScorecardPage() {
  const e = useEnterprise();
  const { role, request, approvals } = useConsole();
  if (!e) return <Loading what="enterprise data" />;
  const allowed = canAct(role, "enterprise");
  const ranked = [...e.priorities].sort((a, b) => b.value_inr / b.effort - a.value_inr / a.effort);

  return (
    <>
      <ConsoleTitle eyebrow={`Scan and scorecard · E4 · ${e.enterprise.name}`} title="Four areas, 12 measures, one priority list" sub="Scored from stored results of E1 to E3, ranked by value over effort. A re-run on unchanged data gives the same ranking." />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Cloud billed (6 months)" value={inr(e.cloud.billed_6m_inr)} />
        <Kpi label="Idle non-prod" value={`${inr(e.cloud.idle_inr_month)}/mo`} sub={`${e.cloud.idle_nonprod} resources`} tone="warn" />
        <Kpi label="No owner tag" value={e.cloud.no_owner_tag} sub={`of ${e.cloud.resources} resources`} tone={e.cloud.no_owner_tag > 20 ? "bad" : "warn"} />
        <Kpi label="Median app run cost" value={inr(e.profile.median_run_cost_inr)} />
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {AREAS.map((a) => {
          const ms = e.scorecard.filter((m) => m.area === a);
          const avg = Math.round(ms.reduce((x, m) => x + m.score, 0) / ms.length);
          return (
            <Panel key={a} title={a}>
              <p className="text-3xl font-extrabold text-slate-900">{avg}<span className="text-sm font-medium text-slate-400"> / 100</span></p>
              <div className="mt-3 space-y-3">
                {ms.map((m) => (
                  <div key={m.measure}>
                    <div className="flex justify-between gap-2 text-xs"><span className="text-slate-600">{m.measure}</span><span className="font-semibold">{m.score}</span></div>
                    <div className="relative mt-1 h-1.5 rounded-full bg-slate-100">
                      <div className={cn("h-full rounded-full", m.score >= m.target ? "bg-brand-green" : "bg-brand-blue")} style={{ width: `${m.score}%` }} />
                      <div className="absolute -top-0.5 h-2.5 w-0.5 bg-slate-500" style={{ left: `${m.target}%` }} title={`target ${m.target}`} />
                    </div>
                    <p className="mt-0.5 text-[10px] text-slate-400">{m.raw}</p>
                  </div>
                ))}
              </div>
            </Panel>
          );
        })}
      </div>

      <Panel title="What to fix first · ranked by value over effort" className="mt-4">
        <div className="space-y-2">
          {ranked.map((o, i) => {
            const title = `${e.enterprise.name} — ${o.item}`;
            const req = approvals.find((a) => a.kind === "Optimization" && a.title === title);
            return (
              <div key={o.item} className="flex flex-col gap-3 rounded-lg border border-slate-100 p-3 md:flex-row md:items-center">
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-bold text-brand-blue">{i + 1}</span>
                <div className="flex-1"><p className="text-sm font-semibold text-slate-800">{o.item}</p><p className="text-xs text-slate-500">value {inr(o.value_inr)} · effort {o.effort} · ratio {inr(Math.round(o.value_inr / o.effort))} per effort point</p></div>
                <button disabled={!allowed || !!req || !o.value_inr} onClick={() => request({ kind: "Optimization", title, requestedBy: "E4", evidence: `value ${inr(o.value_inr)} / effort ${o.effort}` })} className="rounded-lg border border-brand-blue px-3 py-1.5 text-xs font-semibold text-brand-blue hover:bg-brand-soft disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400 disabled:hover:bg-transparent">{req ? req.status : "Ask owner to start"}</button>
              </div>
            );
          })}
        </div>
        <RoleNote allowed={allowed} text={`Your role (${role}) cannot start optimizations. The owner approves which optimization starts.`} />
        <p className="mt-2 text-[11px] text-slate-400">Value weights are placeholders until targets are agreed.</p>
      </Panel>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel title="Retire decided, still running">
          {e.retireNotDone.map((r) => <div key={r.app} className="flex items-center justify-between border-b border-slate-50 py-2 text-sm"><span className="font-semibold text-slate-800">{r.app}</span><span className="text-xs text-slate-500">{r.dependents} dependents · {inr(r.costInr)} / yr</span></div>)}
        </Panel>
        <Panel title="Idle non-prod cloud resources">
          <div className="max-h-64 overflow-y-auto">
            <table className="w-full text-sm"><tbody>{e.cloud.idle.map((c) => <tr key={c.id} className="border-t border-slate-100"><td className="py-1.5 font-mono text-xs">{c.id}</td><td className="text-xs">{c.service} · {c.env}</td><td className="text-xs text-slate-500">{c.app} · {c.owner}</td><td className="text-xs">CPU {c.cpu}%</td><td className="text-xs font-semibold">{inr(c.monthlyInr)}/mo</td></tr>)}</tbody></table>
          </div>
        </Panel>
      </div>
    </>
  );
}
