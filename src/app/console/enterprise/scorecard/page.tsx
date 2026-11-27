"use client";

import { ConsoleTitle, Panel, RoleNote } from "@/components/console/ConsoleShell";
import { canAct, useConsole } from "@/components/providers/ConsoleStore";
import { optimizations, scorecard } from "@/data/demo/enterprise";
import { cn, inr } from "@/lib/utils";

const AREAS = ["Landscape", "Applications", "Pipelines", "Cloud"];

function Spark({ data }: { data: number[] }) {
  const min = Math.min(...data) - 2, max = Math.max(...data) + 2;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 60},${20 - ((v - min) / (max - min)) * 20}`).join(" ");
  return <svg width="60" height="20"><polyline points={pts} fill="none" stroke="#1a3a8f" strokeWidth="1.5" /></svg>;
}

export default function ScorecardPage() {
  const { role, request, approvals } = useConsole();
  const allowed = canAct(role, "enterprise");
  return (
    <>
      <ConsoleTitle eyebrow="Scan and scorecard · E4" title="Four areas, 12 measures, one priority list" sub="Scored from stored results of E1 to E3, ranked by value over effort, with trend until targets are agreed. A re-run on unchanged data gives the same ranking." />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {AREAS.map((a) => {
          const ms = scorecard.filter((m) => m.area === a);
          const avg = Math.round(ms.reduce((s, m) => s + m.score, 0) / ms.length);
          return (
            <Panel key={a} title={a}>
              <p className="text-3xl font-extrabold text-slate-900">{avg}<span className="text-sm font-medium text-slate-400"> / 100</span></p>
              <div className="mt-3 space-y-3">
                {ms.map((m) => (
                  <div key={m.measure}>
                    <div className="flex items-center justify-between gap-2"><span className="text-xs text-slate-600">{m.measure}</span><Spark data={m.trend} /></div>
                    <div className="relative mt-1 h-1.5 rounded-full bg-slate-100">
                      <div className={cn("h-full rounded-full", m.score >= m.target ? "bg-brand-green" : "bg-brand-blue")} style={{ width: `${m.score}%` }} />
                      <div className="absolute -top-0.5 h-2.5 w-0.5 bg-slate-500" style={{ left: `${m.target}%` }} title={`target ${m.target}`} />
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          );
        })}
      </div>

      <Panel title="What to fix first · ranked by value over effort" className="mt-4">
        <div className="space-y-2">
          {optimizations.map((o, i) => {
            const req = approvals.find((a) => a.kind === "Optimization" && a.title === o.title);
            return (
              <div key={o.title} className="flex flex-col gap-3 rounded-lg border border-slate-100 p-3 md:flex-row md:items-center">
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-bold text-brand-blue">{i + 1}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800">{o.title}</p>
                  <p className="text-xs text-slate-500">{o.area} · value {o.value} / effort {o.effort} · ratio {(o.value / o.effort).toFixed(2)}{o.saving ? ` · ${inr(o.saving)} per year` : ""}</p>
                </div>
                <button disabled={!allowed || !!req} onClick={() => request({ kind: "Optimization", title: o.title, requestedBy: "E4", evidence: `value ${o.value} / effort ${o.effort}` })} className="rounded-lg border border-brand-blue px-3 py-1.5 text-xs font-semibold text-brand-blue hover:bg-brand-soft disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400 disabled:hover:bg-transparent">
                  {req ? req.status : "Ask owner to start"}
                </button>
              </div>
            );
          })}
        </div>
        <RoleNote allowed={allowed} text={`Your role (${role}) cannot start optimizations. The owner approves which optimization starts.`} />
      </Panel>
    </>
  );
}
