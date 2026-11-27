"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { ConsoleTitle, Kpi, Panel } from "@/components/console/ConsoleShell";
import { Loading } from "@/components/console/Loading";
import type { Overlay } from "@/components/console/Twin3D";
import { useConsole } from "@/components/providers/ConsoleStore";
import { tenantName, useSite, type Rack } from "@/lib/consoleData";
import { downAssets, fitCheck, graphIndex } from "@/lib/dcEngine";
import { cn } from "@/lib/utils";

const Twin3D = dynamic(() => import("@/components/console/Twin3D").then((m) => m.Twin3D), {
  ssr: false,
  loading: () => <div className="flex h-full items-center justify-center text-sm text-slate-400">Loading 3D scene…</div>,
});
const OVERLAYS: { k: Overlay; l: string }[] = [{ k: "load", l: "Load vs rating" }, { k: "power", l: "Power paths" }, { k: "tenant", l: "Tenant" }];

export default function TwinPage() {
  const s = useSite();
  const { log } = useConsole();
  const [overlay, setOverlay] = useState<Overlay>("load");
  const [sel, setSel] = useState<Rack | null>(null);
  const [n, setN] = useState("20");
  const [kw, setKw] = useState("10");
  const [fit, setFit] = useState<ReturnType<typeof fitCheck> | null>(null);

  const single = useMemo(() => {
    if (!s) return new Set<string>();
    const outage = s.alerts.filter((a) => a.status === "open" && a.cls === "outage" && a.targetType === "Asset").map((a) => a.target);
    const down = downAssets(s, outage);
    const { rackFeeds } = graphIndex(s);
    return new Set(s.racks.filter((r) => (rackFeeds.get(r.id) ?? []).some((f) => down.has(f.rpp))).map((r) => r.id));
  }, [s]);
  const feedsOf = useMemo(() => (s ? graphIndex(s).rackFeeds : new Map()), [s]);
  if (!s) return <Loading />;

  const run = () => {
    const r = fitCheck(s, parseInt(n), parseFloat(kw));
    setFit(r);
    log("Ran fit check (D2)", `${s.site.id}: ${n} racks at ${kw} kW`, `fits=${r.fits}; need=${r.need} kW`);
  };

  return (
    <>
      <ConsoleTitle eyebrow={`Digital twin and capacity planner · D2 · ${s.site.id}`} title="Hall, row and rack — with the fit" sub={`${s.kpis.racks} racks across ${s.halls.length} halls. Drag to orbit, scroll to zoom, click a rack to see what powers it.`} />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Sold (rated)" value={`${s.kpis.soldKw} kW`} sub={`${s.kpis.leased} leased racks`} />
        <Kpi label="Binding limit" value={`${s.kpis.limitKw} kW`} />
        <Kpi label="Measured headroom" value={`${s.kpis.headroomKw} kW`} tone="good" />
        <Kpi label="Stranded" value={`${s.kpis.strandedKw} kW`} tone={s.kpis.strandedKw ? "warn" : "good"} sub="sold beyond the binding limit" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Panel title={`3D scene · ${s.site.name}`} className="xl:col-span-2" action={
          <div className="flex flex-wrap gap-1">{OVERLAYS.map((o) => <button key={o.k} onClick={() => setOverlay(o.k)} className={cn("rounded-full px-3 py-1 text-xs font-medium", overlay === o.k ? "bg-brand-blue text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>{o.l}</button>)}</div>
        }>
          <div className="h-[440px] overflow-hidden rounded-lg border border-slate-100">
            <Twin3D key={s.site.id} site={s} overlay={overlay} onSelect={setSel} selected={sel?.id} singlePath={single} />
          </div>
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
            {overlay === "load" && <><L c="bg-green-500" t="< 65% of rating" /><L c="bg-amber-500" t="65–85%" /><L c="bg-red-500" t="> 85%" /><L c="bg-slate-200" t="vacant" /></>}
            {overlay === "power" && <><L c="bg-green-500" t="both paths" /><L c="bg-red-500" t={`single path (${single.size})`} /><L c="bg-slate-200" t="vacant" /></>}
            {overlay === "tenant" && <span>One colour per tenant · {s.tenants.length} tenants</span>}
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel title={sel ? sel.id : "Select a rack"} asOf={!!sel}>
            {sel ? (
              <dl className="space-y-2 text-sm">
                <R k="Tenant" v={tenantName(s, sel.tenant)} />
                <R k="Hall / row" v={`${sel.hall.split("-").pop()} · ${sel.row.split("-").pop()} · pos ${sel.pos}`} />
                <R k="Rated / load" v={`${sel.kw} kW / ${sel.load} kW`} />
                <R k="Density zone" v={sel.zone} />
                <R k="Fed by" v={(feedsOf.get(sel.id) ?? []).map((f: { rpp: string; side: string }) => `${f.side}: ${f.rpp.split("-").slice(2).join("-")}`).join(" · ")} />
                <R k="Power" v={single.has(sel.id) ? "single path (open outage)" : "both paths"} />
              </dl>
            ) : <p className="text-sm text-slate-500">Click any rack to see its tenant, load and power path.</p>}
          </Panel>
          <Panel title="Fit check" asOf={false}>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs font-semibold text-slate-500">Racks<input value={n} onChange={(e) => setN(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-brand-blue" /></label>
              <label className="text-xs font-semibold text-slate-500">kW per rack<input value={kw} onChange={(e) => setKw(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-brand-blue" /></label>
            </div>
            <button onClick={run} className="mt-3 w-full rounded-lg bg-brand-blue py-2 text-sm font-semibold text-white hover:bg-brand-blue-dark">Check fit</button>
            {fit && (
              <div className={cn("mt-4 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold", fit.fits ? "bg-green-50 text-brand-green-dark" : "bg-red-50 text-red-600")}>
                {fit.fits ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                {fit.fits ? `Fits in ${fit.rows.filter((r) => r.fits).map((r) => r.hall.name).join(", ")}` : `No fit · ${fit.need} kW needed`}
              </div>
            )}
          </Panel>
        </div>
      </div>

      {fit && (
        <Panel title={fit.fits ? "Halls checked" : "No fit — ordered upgrade plan"} className="mt-4">
          {!fit.fits && (
            <ol className="mb-4 space-y-3">
              {fit.plan.map((p, i) => (
                <li key={p.title} className="flex gap-3 rounded-lg border border-slate-100 p-3">
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-brand-blue text-xs font-bold text-white">{i + 1}</span>
                  <div><p className="text-sm font-semibold text-slate-800">{p.title}</p><p className="text-xs text-slate-500">{p.detail}</p><p className="mt-1 text-xs text-orange-600">Outage impact: {p.outage}</p></div>
                </li>
              ))}
            </ol>
          )}
          <div className="space-y-1.5">
            {fit.rows.map((r) => <p key={r.hall.id} className="text-xs text-slate-600"><span className={cn("font-semibold", r.fits ? "text-brand-green" : "text-slate-800")}>{r.hall.name}</span> — {r.fits ? "fits" : r.reasons.join("; ")}</p>)}
          </div>
          <p className="mt-3 text-[11px] text-slate-400">D2 asks D3 for weak equipment on the path. A no-fit returns an ordered upgrade plan.</p>
        </Panel>
      )}

      <Panel title="Hall capacity" className="mt-4">
        <div className="no-scrollbar overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead><tr className="text-left text-xs uppercase tracking-wider text-slate-400"><th className="py-2">Hall</th><th>Rack kW</th><th>Racks</th><th>Vacant</th><th>Sold</th><th>Limit</th><th>Binding</th><th>Measured</th><th>Stranded</th></tr></thead>
            <tbody>{s.halls.map((h) => (
              <tr key={h.id} className="border-t border-slate-100"><td className="py-2 font-semibold">{h.name}</td><td>{h.rackKw}</td><td>{h.racks}</td><td>{h.vacant}</td><td>{h.soldKw} kW</td><td>{h.limitKw} kW</td><td>{h.binding}</td><td>{h.measuredKw} kW</td><td className={h.strandedKw ? "font-semibold text-amber-600" : ""}>{h.strandedKw} kW</td></tr>
            ))}</tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}

function L({ c, t }: { c: string; t: string }) {
  return <span className="inline-flex items-center gap-1.5"><span className={`h-2.5 w-2.5 rounded-sm ${c}`} />{t}</span>;
}
function R({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between gap-3"><dt className="text-slate-500">{k}</dt><dd className="text-right font-medium text-slate-800">{v}</dd></div>;
}
