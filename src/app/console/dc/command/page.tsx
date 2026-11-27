"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ConsoleTitle, Kpi, Panel } from "@/components/console/ConsoleShell";
import { useConsole } from "@/components/providers/ConsoleStore";
import { capacity, components, dailyBrief, pueTrend, rowCapacity, tenants, watchlist } from "@/data/demo/nexusMumbai1";
import { cn, inr } from "@/lib/utils";

export default function CommandView() {
  const { incidents } = useConsole();
  const open = incidents.filter((i) => i.status !== "Resolved");
  const p1 = incidents.find((i) => i.id === "INC-2611")!;
  const exposureTenants = tenants.filter((t) => open.some((i) => i.blast.tenants.includes(t.name)));
  const slaExposure = exposureTenants.reduce((s, t) => s + t.penaltyPerHour, 0);
  const healthy = components.length - watchlist.length - open.reduce((s, i) => s + (i.alarms > 5 ? 4 : 1), 0);
  const health = Math.round((healthy / components.length) * 100);

  return (
    <>
      <ConsoleTitle eyebrow="CEO command view" title="Nexus Mumbai-1 at a glance" sub="Every tile is computed from the dataset and drills to its records." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Kpi label="Facility health" value={`${health}%`} sub={`${healthy} of ${components.length} components nominal`} tone={health > 90 ? "good" : "warn"} href="/console/dc/graph" />
        <Kpi label="Open incidents" value={open.length} sub={`${open.filter((i) => i.severity === "P1").length} P1 · ${open.reduce((s, i) => s + i.alarms, 0)} alarms grouped`} tone="bad" href="/console/dc/incidents" />
        <Kpi label="SLA exposure" value={inr(slaExposure)} sub={`per hour · ${exposureTenants.length} tenants`} tone="warn" href="/console/dc/incidents" />
        <Kpi label="Capacity headroom" value={`${capacity.headroomKw} kW`} sub={`${capacity.usedKw} of ${capacity.usableKw} kW usable in use`} href="/console/dc/twin" />
        <Kpi label="Stranded capacity" value={`${capacity.strandedKw} kW`} sub="paid for, limited by cooling" tone="warn" href="/console/dc/twin" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Panel title="AI brief" className="xl:col-span-1" action={<span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-semibold text-brand-blue"><Sparkles className="h-3 w-3" /> Orchestrator</span>}>
          <ul className="space-y-3">
            {dailyBrief.map((b, i) => (
              <li key={i} className="flex gap-2 text-sm leading-relaxed text-slate-700">
                <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-blue" />
                {b}
              </li>
            ))}
          </ul>
          <Link href="/console/dc/copilot" className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-blue">Ask the copilot <ArrowRight className="h-3.5 w-3.5" /></Link>
        </Panel>

        <Panel title="Live incident queue" className="xl:col-span-2" action={<Link href="/console/dc/incidents" className="text-xs font-semibold text-brand-blue">Open incident command →</Link>}>
          <div className="divide-y divide-slate-100">
            {open.map((i) => (
              <Link key={i.id} href={`/console/dc/incidents?id=${i.id}`} className="flex items-center gap-3 py-3 hover:bg-slate-50">
                <span className={cn("rounded-md px-2 py-0.5 text-xs font-bold", i.severity === "P1" ? "bg-red-50 text-red-600" : i.severity === "P2" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600")}>{i.severity}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">{i.id} · {i.title}</p>
                  <p className="truncate text-xs text-slate-500">{i.rootCause} · confidence {i.confidence.toFixed(2)} · {i.alarms} alarms</p>
                </div>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{i.status}</span>
              </Link>
            ))}
          </div>
        </Panel>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Panel title="PUE trend · November" className="xl:col-span-2">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={pueTrend} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="d" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis domain={[1.4, 1.56]} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Line type="monotone" dataKey="pue" stroke="#1a3a8f" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Capacity by row" action={<Link href="/console/dc/twin" className="text-xs font-semibold text-brand-blue">Twin →</Link>}>
          <div className="space-y-2.5">
            {rowCapacity.map((r) => {
              const lim = Math.min(r.ratedPowerKw, r.coolingLimitKw);
              return (
                <div key={r.row}>
                  <div className="flex justify-between text-xs text-slate-500"><span>Row {r.row}</span><span>{Math.round(r.usedKw)} / {lim} kW</span></div>
                  <div className="relative mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-brand-blue" style={{ width: `${(r.usedKw / r.ratedPowerKw) * 100}%` }} />
                    <div className="absolute top-0 h-full w-0.5 bg-amber-500" style={{ left: `${(lim / r.ratedPowerKw) * 100}%` }} title="cooling limit" />
                  </div>
                </div>
              );
            })}
            <p className="pt-1 text-[11px] text-slate-400">Amber mark = cooling limit; beyond it is stranded.</p>
          </div>
        </Panel>
      </div>

      <Panel title="D3 watchlist — top risks" className="mt-4" action={<Link href="/console/dc/risk" className="text-xs font-semibold text-brand-blue">All risks →</Link>}>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {watchlist.slice(0, 3).map((w) => (
            <Link key={w.asset} href="/console/dc/risk" className="rounded-lg border border-slate-200 p-3 hover:border-blue-200">
              <div className="flex justify-between"><p className="text-sm font-semibold text-slate-800">{w.asset}</p><span className="text-xs font-bold text-red-600">EoL {w.eolScore}</span></div>
              <p className="text-xs text-slate-500">{w.drift}</p>
              <p className="mt-1 text-xs text-slate-600">Act by <span className="font-semibold">{w.actBy}</span></p>
            </Link>
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-400">SLA exposure is the hourly penalty for tenants inside an open incident&apos;s blast radius ({p1.blast.tenants.join(", ")} and others).</p>
      </Panel>
    </>
  );
}
