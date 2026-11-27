"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { ConsoleTitle, Kpi, Panel } from "@/components/console/ConsoleShell";
import type { Overlay } from "@/components/console/Twin3D";
import { capacity, downstream, fitCheck, rowCapacity, tenantForRow, upstream, type Component, type FitResult } from "@/data/demo/nexusMumbai1";
import { useConsole } from "@/components/providers/ConsoleStore";
import { cn } from "@/lib/utils";

const Twin3D = dynamic(() => import("@/components/console/Twin3D").then((m) => m.Twin3D), {
  ssr: false,
  loading: () => <div className="flex h-full items-center justify-center text-sm text-slate-400">Loading 3D scene…</div>,
});

const OVERLAYS: { k: Overlay; l: string }[] = [{ k: "load", l: "Load vs limit" }, { k: "thermal", l: "Thermal" }, { k: "tenant", l: "Tenant" }];

export default function TwinPage() {
  const { log } = useConsole();
  const [overlay, setOverlay] = useState<Overlay>("load");
  const [sel, setSel] = useState<Component | null>(null);
  const [mw, setMw] = useState("2");
  const [density, setDensity] = useState("60");
  const [fit, setFit] = useState<FitResult | null>(null);

  const run = () => {
    const r = fitCheck(Math.round(parseFloat(mw) * 1000), parseFloat(density));
    setFit(r);
    log("Ran fit check (D2)", `${mw} MW at ${density} kW per rack`, `fits=${r.fits}, racks=${r.racksNeeded}`);
  };

  return (
    <>
      <ConsoleTitle eyebrow="Digital twin and capacity planner · D2" title="Hall, row and rack — with the fit" sub="Drag to orbit, scroll to zoom, click a rack to see what powers and cools it." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Rated IT power" value={`${capacity.ratedKw} kW`} sub="8 rows × 160 kW PDU pairs" />
        <Kpi label="Usable (cooling-bound)" value={`${capacity.usableKw} kW`} />
        <Kpi label="Headroom" value={`${capacity.headroomKw} kW`} tone="good" />
        <Kpi label="Stranded" value={`${capacity.strandedKw} kW`} tone="warn" sub="paid for but unusable" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Panel
          title="3D scene · Nexus Mumbai-1"
          className="xl:col-span-2"
          action={
            <div className="flex gap-1">
              {OVERLAYS.map((o) => (
                <button key={o.k} onClick={() => setOverlay(o.k)} className={cn("rounded-full px-3 py-1 text-xs font-medium", overlay === o.k ? "bg-brand-blue text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>{o.l}</button>
              ))}
            </div>
          }
        >
          <div className="h-[420px] overflow-hidden rounded-lg border border-slate-100">
            <Twin3D overlay={overlay} onSelect={setSel} selected={sel?.id} />
          </div>
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
            {overlay !== "tenant" ? (
              <>
                <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-green-500" />{overlay === "load" ? "< 65% of limit" : "Normal"}</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-amber-500" />{overlay === "load" ? "65–85%" : "Elevated"}</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-red-500" />{overlay === "load" ? "> 85%" : "Over threshold"}</span>
              </>
            ) : <span>One colour per tenant (rows 1–8)</span>}
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel title={sel ? sel.label : "Select a rack"} asOf={!!sel}>
            {sel ? (
              <dl className="space-y-2 text-sm">
                <Row k="Tenant" v={tenantForRow(sel.row!).name} />
                <Row k="Row / Hall" v={`Row ${sel.row} · Hall ${sel.hall}`} />
                <Row k="Draw" v={`${sel.kw} kW`} />
                <Row k="Fed by" v={upstream(sel.id).filter((u) => u.startsWith("PDU") || u.startsWith("UPS") || u.startsWith("FEED")).join(", ")} />
                <Row k="Downstream" v={`${downstream(sel.id).length} components`} />
              </dl>
            ) : (
              <p className="text-sm text-slate-500">Click any rack in the scene to see its power path, tenant and draw.</p>
            )}
          </Panel>

          <Panel title="Fit check" asOf={false}>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs font-semibold text-slate-500">Load (MW)
                <input value={mw} onChange={(e) => setMw(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-brand-blue" />
              </label>
              <label className="text-xs font-semibold text-slate-500">kW per rack
                <input value={density} onChange={(e) => setDensity(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-brand-blue" />
              </label>
            </div>
            <button onClick={run} className="mt-3 w-full rounded-lg bg-brand-blue py-2 text-sm font-semibold text-white hover:bg-brand-blue-dark">Check fit</button>
            {fit && (
              <div className="mt-4">
                <div className={cn("flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold", fit.fits ? "bg-green-50 text-brand-green-dark" : "bg-red-50 text-red-600")}>
                  {fit.fits ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                  {fit.fits ? "Fits" : "No fit"} · {fit.racksNeeded} racks needed
                </div>
                {fit.reasons.map((r) => <p key={r} className="mt-2 text-xs text-slate-600">• {r}</p>)}
              </div>
            )}
          </Panel>
        </div>
      </div>

      {fit && !fit.fits && (
        <Panel title="Upgrade plan · components to change, outage impact and best order" className="mt-4">
          <ol className="space-y-3">
            {fit.plan.map((p) => (
              <li key={p.step} className="flex gap-3 rounded-lg border border-slate-100 p-3">
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-brand-blue text-xs font-bold text-white">{p.step}</span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{p.title}</p>
                  <p className="text-xs text-slate-500">{p.detail}</p>
                  <p className="mt-1 text-xs text-orange-600">Outage impact: {p.outage}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-xs text-slate-400">D2 asks D3 for weak equipment on the path. No person is needed for a fit check; a no-fit returns this ordered plan.</p>
        </Panel>
      )}

      <Panel title="Row capacity" className="mt-4">
        <div className="no-scrollbar overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm">
            <thead><tr className="text-left text-xs uppercase tracking-wider text-slate-400"><th className="py-2">Row</th><th>Tenant</th><th>Rated</th><th>Cooling limit</th><th>Used</th><th>Stranded</th></tr></thead>
            <tbody>
              {rowCapacity.map((r) => (
                <tr key={r.row} className="border-t border-slate-100">
                  <td className="py-2 font-semibold">Row {r.row}</td>
                  <td>{tenantForRow(r.row).name}</td>
                  <td>{r.ratedPowerKw} kW</td>
                  <td>{r.coolingLimitKw} kW</td>
                  <td>{Math.round(r.usedKw)} kW</td>
                  <td className="text-amber-600">{Math.max(0, r.ratedPowerKw - r.coolingLimitKw)} kW</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-slate-500">{k}</dt>
      <dd className="text-right font-medium text-slate-800">{v}</dd>
    </div>
  );
}
