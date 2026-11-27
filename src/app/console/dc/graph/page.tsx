"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { ConsoleTitle, Kpi, Panel } from "@/components/console/ConsoleShell";
import { TYPE_COLOR } from "@/components/console/GraphView";
import { COMPONENT_COUNT, LINK_COUNT, components, downstream, getComponent, graphLinks, tenantForRow, upstream, type CompType } from "@/data/demo/nexusMumbai1";
import { cn } from "@/lib/utils";

const GraphView = dynamic(() => import("@/components/console/GraphView").then((m) => m.GraphView), {
  ssr: false,
  loading: () => <div className="flex h-[480px] items-center justify-center text-sm text-slate-400">Loading graph…</div>,
});

const QUERIES = ["Downstream", "Upstream", "Tenants", "Redundancy peer"] as const;
type Q = (typeof QUERIES)[number];

export default function GraphPage() {
  const [node, setNode] = useState("UPS-3");
  const [q, setQ] = useState<Q>("Downstream");
  const [gql, setGql] = useState("MATCH (u:UPS {id:'UPS-3'})-[:POWERS*]->(r:Rack) RETURN r.tenant, count(r)");
  const [gqlOut, setGqlOut] = useState<string | null>(null);

  const result = useMemo(() => {
    const c = getComponent(node);
    if (!c) return { ids: [] as string[], lines: ["Unknown component"] };
    if (q === "Downstream") { const d = downstream(node); return { ids: [node, ...d], lines: [`${d.length} components downstream of ${node}`] }; }
    if (q === "Upstream") { const u = upstream(node); return { ids: [node, ...u], lines: [`${u.length} components upstream of ${node}`, u.join(" ← ")] }; }
    if (q === "Tenants") {
      const racks = [node, ...downstream(node)].map(getComponent).filter((x) => x?.type === "Rack");
      const rows = [...new Set(racks.map((r) => r!.row!))];
      return { ids: [node, ...racks.map((r) => r!.id)], lines: rows.length ? rows.map((r) => `${tenantForRow(r).name} · row ${r} · ${racks.filter((x) => x!.row === r).length} racks`) : ["No tenant racks downstream"] };
    }
    // Redundancy peer
    if (c.type === "UPS" || c.type === "PDU" || c.type === "Feed" || c.type === "Battery") {
      let peerId = node;
      if (c.type === "Feed") peerId = node === "FEED-A" ? "FEED-B" : "FEED-A";
      else if (c.type === "PDU") peerId = node.endsWith("A") ? node.slice(0, -1) + "B" : node.slice(0, -1) + "A";
      else {
        const n = Number(node.split("-")[1]);
        peerId = `${node.split("-")[0]}-${n % 2 ? n + 1 : n - 1}`;
      }
      return { ids: [node, peerId], lines: [`Redundancy peer of ${node}: ${peerId}`, `${c.side}-side; loads fall to a single path on ${peerId} if ${node} is out`] };
    }
    return { ids: [node], lines: ["Redundancy peers are defined for feeds, UPS, batteries and PDUs"] };
  }, [node, q]);

  const highlight = useMemo(() => new Set(result.ids), [result]);
  const types = Object.keys(TYPE_COLOR) as CompType[];

  const runGql = () => {
    const m = gql.match(/id:'([^']+)'/);
    const id = m?.[1] ?? node;
    const racks = downstream(id).map(getComponent).filter((x) => x?.type === "Rack");
    const byT = racks.reduce<Record<string, number>>((a, r) => { a[r!.tenant!] = (a[r!.tenant!] ?? 0) + 1; return a; }, {});
    setGqlOut(Object.keys(byT).length ? Object.entries(byT).map(([t, n]) => `${t.padEnd(20)} | ${n}`).join("\n") : "0 rows");
    setNode(id); setQ("Tenants");
  };

  return (
    <>
      <ConsoleTitle eyebrow="Knowledge graph · Spanner Graph" title="Contracts, alerts and runbooks as one graph" sub="Upstream and downstream, path, tenant and redundancy-peer queries as a service; a graph view and GQL for ad hoc questions." />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Components" value={COMPONENT_COUNT} />
        <Kpi label="Links" value={LINK_COUNT} />
        <Kpi label="Reference set" value="Nexus Mumbai-1" />
        <Kpi label="Acceptance" value="148 / 148" sub="match expected result" tone="good" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Panel title="Graph view" className="xl:col-span-2" action={<span className="text-[11px] text-slate-400">Click a node to query it</span>}>
          <GraphView highlight={highlight} onPick={setNode} />
          <div className="mt-3 flex flex-wrap gap-3">
            {types.map((t) => <span key={t} className="inline-flex items-center gap-1 text-[11px] text-slate-500"><span className="h-2.5 w-2.5 rounded-full" style={{ background: TYPE_COLOR[t] }} />{t}</span>)}
          </div>
        </Panel>
        <div className="space-y-4">
          <Panel title="Query" asOf={false}>
            <label className="text-xs font-semibold text-slate-500">Component
              <select value={node} onChange={(e) => setNode(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-blue">
                {components.filter((c) => c.type !== "Rack").map((c) => <option key={c.id} value={c.id}>{c.id} · {c.type}</option>)}
              </select>
            </label>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {QUERIES.map((x) => <button key={x} onClick={() => setQ(x)} className={cn("rounded-full px-3 py-1 text-xs font-medium", q === x ? "bg-brand-blue text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>{x}</button>)}
            </div>
            <div className="mt-4 space-y-1 rounded-lg bg-slate-50 p-3">
              {result.lines.map((l, i) => <p key={i} className="break-words text-xs text-slate-700">{l}</p>)}
            </div>
          </Panel>
          <Panel title="GQL" asOf={false}>
            <textarea value={gql} onChange={(e) => setGql(e.target.value)} rows={3} className="w-full rounded-lg border border-slate-200 p-2 font-mono text-xs outline-none focus:border-brand-blue" />
            <button onClick={runGql} className="mt-2 rounded-lg bg-brand-blue px-4 py-1.5 text-xs font-semibold text-white hover:bg-brand-blue-dark">Run</button>
            {gqlOut && <pre className="mt-3 overflow-x-auto rounded-lg bg-brand-navy p-3 text-[11px] text-slate-200">{`tenant               | racks\n${gqlOut}`}</pre>}
          </Panel>
          <p className="px-1 text-[11px] text-slate-400">{graphLinks.filter((l) => l.kind === "power").length} power, {graphLinks.filter((l) => l.kind === "cooling").length} cooling, {graphLinks.filter((l) => l.kind === "network").length} network links.</p>
        </div>
      </div>
    </>
  );
}
