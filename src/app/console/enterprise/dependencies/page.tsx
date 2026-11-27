"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { ConsoleTitle, Kpi, Panel } from "@/components/console/ConsoleShell";
import { Loading } from "@/components/console/Loading";
import { useEnterprise } from "@/lib/consoleData";
import { cn } from "@/lib/utils";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

export default function DependenciesPage() {
  const e = useEnterprise();
  const [sel, setSel] = useState<string | null>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(700);
  useEffect(() => { const ro = new ResizeObserver(([x]) => setW(x.contentRect.width)); if (wrap.current) ro.observe(wrap.current); return () => ro.disconnect(); }, [e]);
  useEffect(() => { if (e) setSel([...e.apps].sort((a, b) => b.dependents - a.dependents)[0]?.id ?? null); }, [e]);

  const impact = useMemo(() => {
    const out = new Set<string>();
    if (!e || !sel) return out;
    const st = [sel];
    while (st.length) { const c = st.pop()!; for (const l of e.appLinks) if (l.to === c && !out.has(l.from)) { out.add(l.from); st.push(l.from); } }
    return out;
  }, [e, sel]);
  const data = useMemo(() => (e ? { nodes: e.apps.map((a) => ({ id: a.id, name: a.name, tier: a.tier })), links: e.appLinks.map((l) => ({ source: l.from, target: l.to, conf: l.minConf })) } : { nodes: [], links: [] }), [e]);
  if (!e) return <Loading what="enterprise data" />;
  const name = (id: string) => e.apps.find((a) => a.id === id)?.name ?? id;
  const app = e.apps.find((a) => a.id === sel);

  return (
    <>
      <ConsoleTitle eyebrow={`Dependency map and impact sets · E2 (assumed, to confirm) · ${e.enterprise.name}`} title="If we change this, what breaks — and how sure are we?" sub="A verified map of components, calls and data flows, with the reach of any change and a confidence rating on each link. Low-confidence links go to the S2 review queue." />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="App-to-app links" value={e.appLinks.length} />
        <Kpi label="Weak links (< 0.6)" value={e.weakLinks.length} tone="warn" />
        <Kpi label="Runtime-trace evidence" value={e.appLinks.reduce((x, l) => x + (l.evidence.runtime_trace ?? 0), 0)} sub="component calls" />
        <Kpi label="Most depended-on" value={name([...e.apps].sort((a, b) => b.dependents - a.dependents)[0]?.id ?? "")} sub={`${[...e.apps].sort((a, b) => b.dependents - a.dependents)[0]?.dependents ?? 0} calling apps`} />
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Panel title="Dependency map" className="xl:col-span-2" action={<span className="text-[11px] text-slate-400">Click an application to compute its impact set</span>}>
          <div ref={wrap}>
            <ForceGraph2D
              key={e.enterprise.id}
              graphData={data}
              width={w}
              height={480}
              backgroundColor="#ffffff"
              cooldownTicks={120}
              linkDirectionalArrowLength={3}
              linkDirectionalArrowRelPos={1}
              linkColor={(l) => {
                const s = typeof l.source === "object" ? (l.source as { id: string }).id : (l.source as string);
                const t = typeof l.target === "object" ? (l.target as { id: string }).id : (l.target as string);
                if (impact.has(s) && (t === sel || impact.has(t))) return "rgba(26,58,143,0.9)";
                return (l as { conf: number }).conf < 0.6 ? "rgba(245,158,11,0.6)" : "rgba(148,163,184,0.35)";
              }}
              nodeCanvasObject={(n, ctx, scale) => {
                const x = n as { id: string; name: string; tier: string; x: number; y: number };
                const r = x.tier === "tier1" ? 5 : 3.5;
                ctx.beginPath(); ctx.arc(x.x, x.y, r, 0, 2 * Math.PI);
                ctx.fillStyle = x.id === sel ? "#1a3a8f" : impact.has(x.id) ? "#60a5fa" : "#cbd5e1"; ctx.fill();
                if (scale > 1.3 || x.id === sel || impact.has(x.id)) { ctx.font = `${9 / scale}px Inter, sans-serif`; ctx.fillStyle = "#334155"; ctx.fillText(x.name, x.x + r + 1, x.y + 3 / scale); }
              }}
              onNodeClick={(n) => setSel((n as { id: string }).id)}
            />
          </div>
          <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-5 bg-slate-300" /> Link</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-5 bg-amber-500" /> Weakest call &lt; 0.6</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-brand-blue" /> Selected · <span className="h-2.5 w-2.5 rounded-full bg-blue-400" /> impacted</span>
          </div>
        </Panel>
        <Panel title={`Impact set · ${app?.name ?? "—"}`}>
          <p className="text-3xl font-extrabold text-slate-900">{impact.size} <span className="text-sm font-medium text-slate-500">applications reached</span></p>
          <div className="mt-3 max-h-80 space-y-1.5 overflow-y-auto">
            {[...impact].map((id) => {
              const l = e.appLinks.find((x) => x.from === id && (x.to === sel || impact.has(x.to)));
              return <div key={id} className="flex items-center justify-between rounded-lg border border-slate-100 p-2"><span className="text-sm text-slate-700">{name(id)}</span>{l && <span className={cn("text-xs font-bold", l.minConf >= 0.8 ? "text-brand-green" : l.minConf >= 0.6 ? "text-slate-600" : "text-amber-600")}>{l.minConf.toFixed(2)}</span>}</div>;
            })}
            {impact.size === 0 && <p className="text-sm text-slate-500">Nothing calls this application.</p>}
          </div>
          {e.hotspots.length > 0 && (
            <div className="mt-4 rounded-lg bg-brand-soft/60 p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-blue">Hotspot</p>
              {e.hotspots.map((h) => <p key={h.name} className="text-xs text-slate-700"><span className="font-semibold">{h.name}</span>: {h.direct_callers} direct callers, {h.all_callers} in total across {h.applications} apps ({h.tier1} tier-1), {h.weak_links} weak links</p>)}
            </div>
          )}
          <p className="mt-3 text-[11px] text-slate-400">E2 asks no agent; E1, E3 and E4 read its graph.</p>
        </Panel>
      </div>
    </>
  );
}
