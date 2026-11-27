"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { ConsoleTitle, Kpi, Panel } from "@/components/console/ConsoleShell";
import { Loading } from "@/components/console/Loading";
import { TYPE_COLOR } from "@/components/console/GraphView";
import { tenantName, useSite } from "@/lib/consoleData";
import { downstream, upstream } from "@/lib/dcEngine";
import { cn } from "@/lib/utils";

const GraphView = dynamic(() => import("@/components/console/GraphView").then((m) => m.GraphView), {
  ssr: false,
  loading: () => <div className="flex h-[500px] items-center justify-center text-sm text-slate-400">Loading graph…</div>,
});
const QUERIES = ["Downstream", "Upstream", "Tenants", "Redundancy peers"] as const;
type Q = (typeof QUERIES)[number];

export default function GraphPage() {
  const s = useSite();
  const [node, setNode] = useState("");
  const [q, setQ] = useState<Q>("Downstream");
  const [racks, setRacks] = useState(false);
  const [gql, setGql] = useState("");
  const [gqlOut, setGqlOut] = useState<string | null>(null);

  useEffect(() => {
    if (!s) return;
    const root = s.alerts.find((a) => a.role === "cause")?.target ?? s.assets.find((a) => a.type === "ups")?.id ?? s.assets[0].id;
    setNode(root);
    setGql(`MATCH (a:Asset {id:'${root}'})-[:FEEDS|POWERS_RACK*]->(r:Rack)<-[:LEASES]-(t:Tenant)\nRETURN t.name, count(r)`);
    setGqlOut(null);
  }, [s]);

  const result = useMemo(() => {
    if (!s || !node) return { ids: [] as string[], lines: [] as string[] };
    if (q === "Downstream") { const d = downstream(s, node); return { ids: [node, ...d], lines: [`${d.length} components downstream of ${node}`, `${d.filter((x) => x.includes("RACK")).length} racks`] }; }
    if (q === "Upstream") { const u = upstream(s, node); return { ids: [node, ...u], lines: [`${u.length} components upstream of ${node}`, u.slice(0, 12).join(" ← ") + (u.length > 12 ? " …" : "")] }; }
    if (q === "Tenants") {
      const rs = new Set(downstream(s, node).filter((x) => x.includes("RACK")));
      const by = new Map<string, number>();
      for (const r of s.racks) if (rs.has(r.id)) by.set(tenantName(s, r.tenant), (by.get(tenantName(s, r.tenant)) ?? 0) + 1);
      return { ids: [node, ...rs], lines: by.size ? [...by.entries()].sort((a, b) => b[1] - a[1]).map(([t, n]) => `${t} · ${n} racks`) : ["No tenant racks downstream"] };
    }
    const peers = s.links.filter(([a, b, t]) => t === "REDUNDANT_WITH" && (a === node || b === node)).map(([a, b]) => (a === node ? b : a));
    return { ids: [node, ...peers], lines: peers.length ? [`Redundancy peers of ${node}: ${peers.join(", ")}`] : ["No redundancy group recorded for this asset"] };
  }, [s, node, q]);
  const highlight = useMemo(() => new Set(result.ids), [result]);
  if (!s) return <Loading />;

  const runGql = () => {
    const id = gql.match(/id:'([^']+)'/)?.[1] ?? node;
    const rs = new Set(downstream(s, id).filter((x) => x.includes("RACK")));
    const by = new Map<string, number>();
    for (const r of s.racks) if (rs.has(r.id) && r.tenant) by.set(tenantName(s, r.tenant), (by.get(tenantName(s, r.tenant)) ?? 0) + 1);
    setGqlOut(by.size ? [...by.entries()].map(([t, n]) => `${t.padEnd(30)} | ${n}`).join("\n") : "0 rows");
    setNode(id); setQ("Tenants");
  };
  const types = [...new Set(s.assets.map((a) => a.type))];

  return (
    <>
      <ConsoleTitle eyebrow={`Knowledge graph · Spanner Graph · ${s.site.id}`} title="The facility as one graph" sub="Upstream and downstream, tenant and redundancy-peer queries as a service; a graph view and GQL for ad hoc questions." right={<Link href={`/ontology/explorer?id=${node}`} className="text-sm font-semibold text-brand-blue">Open in ontology explorer →</Link>} />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Assets" value={s.assets.length} />
        <Kpi label="Racks" value={s.racks.length} />
        <Kpi label="Links" value={s.links.length.toLocaleString("en-IN")} />
        <Kpi label="Tenants" value={s.tenants.length} />
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Panel title="Graph view" className="xl:col-span-2" action={
          <label className="flex items-center gap-2 text-xs text-slate-500"><input type="checkbox" checked={racks} onChange={(e) => setRacks(e.target.checked)} /> Show racks</label>
        }>
          <GraphView key={s.site.id + racks} site={s} highlight={highlight} onPick={setNode} showRacks={racks} />
          <div className="mt-3 flex flex-wrap gap-3">{types.map((t) => <span key={t} className="inline-flex items-center gap-1 text-[11px] text-slate-500"><span className="h-2.5 w-2.5 rounded-full" style={{ background: TYPE_COLOR[t] }} />{t.replace("_", " ")}</span>)}</div>
        </Panel>
        <div className="space-y-4">
          <Panel title="Query" asOf={false}>
            <label className="text-xs font-semibold text-slate-500">Asset
              <select value={node} onChange={(e) => setNode(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-blue">
                {s.assets.map((a) => <option key={a.id} value={a.id}>{a.id} · {a.type}</option>)}
              </select>
            </label>
            <div className="mt-3 flex flex-wrap gap-1.5">{QUERIES.map((x) => <button key={x} onClick={() => setQ(x)} className={cn("rounded-full px-3 py-1 text-xs font-medium", q === x ? "bg-brand-blue text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>{x}</button>)}</div>
            <div className="mt-4 max-h-48 space-y-1 overflow-y-auto rounded-lg bg-slate-50 p-3">{result.lines.map((l, i) => <p key={i} className="break-words text-xs text-slate-700">{l}</p>)}</div>
          </Panel>
          <Panel title="GQL" asOf={false}>
            <textarea value={gql} onChange={(e) => setGql(e.target.value)} rows={4} className="w-full rounded-lg border border-slate-200 p-2 font-mono text-xs outline-none focus:border-brand-blue" />
            <button onClick={runGql} className="mt-2 rounded-lg bg-brand-blue px-4 py-1.5 text-xs font-semibold text-white hover:bg-brand-blue-dark">Run</button>
            {gqlOut && <pre className="mt-3 overflow-x-auto rounded-lg bg-brand-navy p-3 text-[11px] text-slate-200">{`tenant                         | racks\n${gqlOut}`}</pre>}
          </Panel>
        </div>
      </div>
    </>
  );
}
