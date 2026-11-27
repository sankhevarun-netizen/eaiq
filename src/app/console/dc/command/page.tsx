"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ConsoleTitle, Kpi, Panel } from "@/components/console/ConsoleShell";
import { Loading } from "@/components/console/Loading";
import { useConsole } from "@/components/providers/ConsoleStore";
import { fmtTime, useSite } from "@/lib/consoleData";
import { downAssets, graphIndex } from "@/lib/dcEngine";
import { cn, inr } from "@/lib/utils";

export default function CommandView() {
  const s = useSite();
  const { incidentState } = useConsole();
  if (!s) return <Loading />;

  const open = s.incidents.filter((i) => (incidentState[i.id]?.status ?? (i.status === "open" ? "Open" : "Resolved")) !== "Resolved");
  const openAlerts = s.alerts.filter((a) => a.status === "open");
  const outage = openAlerts.filter((a) => a.cls === "outage" && a.targetType === "Asset").map((a) => a.target);
  const down = downAssets(s, outage);
  const { rackFeeds } = graphIndex(s);
  const affected = s.racks.filter((r) => (rackFeeds.get(r.id) ?? []).some((f) => down.has(f.rpp)));
  const tenantsHit = [...new Set(affected.map((r) => r.tenant).filter(Boolean))].map((id) => s.tenants.find((t) => t.id === id)!).filter(Boolean);
  const exposure = tenantsHit.reduce((x, t) => x + (t.contract?.ratePerH ?? 0), 0);
  const health = Math.round(((s.kpis.assets - down.size - s.watchlist.filter((w) => w.riseC).length) / s.kpis.assets) * 100);
  const latestPue = s.pue[s.pue.length - 1];
  const brief = [
    open.length
      ? `${open.length} open incident${open.length > 1 ? "s" : ""}: ${open.map((i) => `${i.id} — ${i.rootCause} on ${i.rootAsset}`).join("; ")}. ${openAlerts.length} open alerts at ${s.site.id}.`
      : `No open incidents at ${s.site.id}. ${openAlerts.length} open alert${openAlerts.length === 1 ? "" : "s"}.`,
    affected.length ? `${affected.length} racks have lost one power path; tenants exposed: ${tenantsHit.map((t) => t.name).join(", ")}.` : "Every rack is on both power paths.",
    s.watchlist[0] ? `Top risk: ${s.watchlist[0].id}${s.watchlist[0].riseC ? ` running +${s.watchlist[0].riseC} °C vs peers (lot ${s.watchlist[0].lot})` : ` at ${Math.round(s.watchlist[0].ageRatio * 100)}% of design life`}; act by ${s.watchlist[0].actBy}.` : "No assets on the D3 watchlist.",
    `${s.kpis.strandedKw} kW is stranded and ${s.kpis.headroomKw} kW of measured headroom remains across ${s.halls.length} halls.`,
  ];

  return (
    <>
      <ConsoleTitle eyebrow={`CEO command view · ${s.site.id}`} title={`${s.site.name} at a glance`} sub={`${s.site.operator} · ${s.site.tier} · ${s.site.city} · ${s.site.kind === "captive" ? "captive" : "colocation"}. Every tile is computed from the dataset and drills to its records.`} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Kpi label="Facility health" value={`${health}%`} sub={`${s.kpis.assets} assets · ${down.size} down`} tone={health > 95 ? "good" : "warn"} href="/console/dc/graph" />
        <Kpi label="Open incidents" value={open.length} sub={`${openAlerts.length} open alerts`} tone={open.length ? "bad" : "good"} href="/console/dc/incidents" />
        <Kpi label="SLA exposure" value={exposure ? `${inr(exposure)}/h` : "₹0"} sub={`${tenantsHit.length} tenants on a single path`} tone={exposure ? "warn" : "good"} href="/console/dc/incidents" />
        <Kpi label="Measured headroom" value={`${s.kpis.headroomKw} kW`} sub={`IT load ${s.kpis.itLoadKw} kW · ${s.kpis.leasedPct}% leased`} href="/console/dc/twin" />
        <Kpi label="Stranded capacity" value={`${s.kpis.strandedKw} kW`} sub="sold beyond the binding limit" tone={s.kpis.strandedKw ? "warn" : "good"} href="/console/dc/twin" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Panel title="AI brief" action={<span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-semibold text-brand-blue"><Sparkles className="h-3 w-3" /> Orchestrator</span>}>
          <ul className="space-y-3">
            {brief.map((b, i) => <li key={i} className="flex gap-2 text-sm leading-relaxed text-slate-700"><span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-blue" />{b}</li>)}
          </ul>
          <Link href="/console/dc/copilot" className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-blue">Ask the copilot <ArrowRight className="h-3.5 w-3.5" /></Link>
        </Panel>

        <Panel title="Live incident queue" className="xl:col-span-2" action={<Link href="/console/dc/incidents" className="text-xs font-semibold text-brand-blue">Open incident command →</Link>}>
          <div className="divide-y divide-slate-100">
            {s.incidents.slice(0, 6).map((i) => {
              const st = incidentState[i.id]?.status ?? (i.status === "open" ? "Open" : "Resolved");
              return (
                <Link key={i.id} href={`/console/dc/incidents?id=${i.id}`} className="flex items-center gap-3 py-3 hover:bg-slate-50">
                  <span className={cn("rounded-md px-2 py-0.5 text-xs font-bold", i.severity <= 2 ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-600")}>S{i.severity}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">{i.id} · {i.rootCause}</p>
                    <p className="truncate text-xs text-slate-500">{i.rootAsset} · opened {fmtTime(i.openedAt)}{i.durationMin ? ` · ${i.durationMin} min` : ""}</p>
                  </div>
                  <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", st === "Resolved" ? "bg-slate-100 text-slate-500" : "bg-red-50 text-red-600")}>{st}</span>
                </Link>
              );
            })}
            {s.incidents.length === 0 && <p className="py-3 text-sm text-slate-500">No incidents recorded at this site.</p>}
          </div>
        </Panel>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Panel title={`PUE trend · latest ${latestPue?.pue ?? "—"} (${latestPue?.month ?? ""})`} className="xl:col-span-2">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={s.pue} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} interval={3} />
                <YAxis domain={["dataMin - 0.03", "dataMax + 0.03"]} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => Number(v).toFixed(2)} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Line type="monotone" dataKey="pue" stroke="#1a3a8f" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Capacity by hall" action={<Link href="/console/dc/twin" className="text-xs font-semibold text-brand-blue">Twin →</Link>}>
          <div className="space-y-3">
            {s.halls.map((h) => (
              <div key={h.id}>
                <div className="flex justify-between text-xs text-slate-500"><span>{h.name}</span><span>{h.measuredKw} / {h.limitKw} kW</span></div>
                <div className="relative mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-brand-blue" style={{ width: `${Math.min(100, (h.measuredKw / Math.max(h.soldKw, h.limitKw)) * 100)}%` }} />
                  <div className="absolute top-0 h-full w-0.5 bg-amber-500" style={{ left: `${(h.limitKw / Math.max(h.soldKw, h.limitKw)) * 100}%` }} />
                </div>
                {h.strandedKw > 0 && <p className="mt-0.5 text-[11px] text-amber-600">{h.strandedKw} kW stranded · {h.binding}-bound</p>}
              </div>
            ))}
            <p className="pt-1 text-[11px] text-slate-400">Bar = measured load. Amber mark = binding limit.</p>
          </div>
        </Panel>
      </div>

      <Panel title="D3 watchlist — top risks" className="mt-4" action={<Link href="/console/dc/risk" className="text-xs font-semibold text-brand-blue">All risks →</Link>}>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {s.watchlist.slice(0, 3).map((w) => (
            <Link key={w.id} href={`/console/dc/risk?id=${w.id}`} className="rounded-lg border border-slate-200 p-3 hover:border-blue-200">
              <div className="flex justify-between gap-2"><p className="truncate text-sm font-semibold text-slate-800">{w.id}</p><span className="text-xs font-bold text-red-600">{w.score}</span></div>
              <p className="text-xs text-slate-500">{w.riseC ? `+${w.riseC} °C vs peers · lot ${w.lot}` : `${Math.round(w.ageRatio * 100)}% of design life`}</p>
              <p className="mt-1 text-xs text-slate-600">{w.racks} racks · act by <span className="font-semibold">{w.actBy}</span></p>
            </Link>
          ))}
          {s.watchlist.length === 0 && <p className="text-sm text-slate-500">Nothing on the watchlist at this site.</p>}
        </div>
      </Panel>
    </>
  );
}
