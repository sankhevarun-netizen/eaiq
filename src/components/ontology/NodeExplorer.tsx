"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Search } from "lucide-react";
import { GROUP_COLOR, PRESETS, TYPE_GROUP, loadGraph, type Graph, type GraphNode } from "@/data/ontology";
import { cn } from "@/lib/utils";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

interface Indexed { byId: Map<string, GraphNode>; adj: Map<string, { type: string; other: string; out: boolean; props?: Record<string, string | number> }[]> }

function index(g: Graph): Indexed {
  const byId = new Map(g.nodes.map((n) => [n[0], n]));
  const adj = new Map<string, Indexed["adj"] extends Map<string, infer V> ? V : never>();
  for (const [s, d, t, p] of g.edges) {
    (adj.get(s) ?? adj.set(s, []).get(s)!).push({ type: t, other: d, out: true, props: p });
    (adj.get(d) ?? adj.set(d, []).get(d)!).push({ type: t, other: s, out: false, props: p });
  }
  return { byId, adj };
}

export function NodeExplorer() {
  const sp = useSearchParams();
  const router = useRouter();
  const [ix, setIx] = useState<Indexed | null>(null);
  const [id, setId] = useState(sp.get("id") ?? PRESETS[0].id);
  const [trail, setTrail] = useState<string[]>([]);
  const [q, setQ] = useState("");
  const wrap = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(600);

  useEffect(() => { loadGraph().then((g) => setIx(index(g))); }, []);
  useEffect(() => { const x = sp.get("id"); if (x) setId(x); }, [sp]);
  useEffect(() => {
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    if (wrap.current) ro.observe(wrap.current);
    return () => ro.disconnect();
  }, [ix]);

  const go = (next: string) => {
    setTrail((t) => [...t, id].slice(-8));
    setId(next);
    router.replace(`/ontology/explorer?id=${encodeURIComponent(next)}`, { scroll: false });
  };

  const node = ix?.byId.get(id);
  const nbrs = useMemo(() => ix?.adj.get(id) ?? [], [ix, id]);
  const grouped = useMemo(() => {
    const m = new Map<string, typeof nbrs>();
    for (const n of nbrs) {
      const k = `${n.out ? "→" : "←"} ${n.type}`;
      (m.get(k) ?? m.set(k, []).get(k)!).push(n);
    }
    return [...m.entries()];
  }, [nbrs]);

  const results = useMemo(() => {
    if (!ix || q.trim().length < 2) return [];
    const s = q.toLowerCase();
    const out: GraphNode[] = [];
    for (const n of ix.byId.values()) {
      if (n[0].toLowerCase().includes(s) || n[2].toLowerCase().includes(s)) out.push(n);
      if (out.length >= 12) break;
    }
    return out;
  }, [ix, q]);

  const fg = useMemo(() => {
    if (!ix || !node) return { nodes: [], links: [] };
    const show = nbrs.slice(0, 60);
    const ids = new Set([id, ...show.map((n) => n.other)]);
    return {
      nodes: [...ids].map((x) => { const n = ix.byId.get(x); return { id: x, type: n?.[1] ?? "?", label: n?.[2] ?? x }; }),
      links: show.map((n) => ({ source: n.out ? id : n.other, target: n.out ? n.other : id, type: n.type })),
    };
  }, [ix, node, nbrs, id]);

  if (!ix) return <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-400 shadow-card">Loading 7,202 nodes and 17,901 edges…</div>;

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-card focus-within:border-brand-blue focus-within:shadow-[0_0_0_3px_rgba(26,58,143,0.12)]">
          <Search className="h-5 w-5 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search any node by id or name — e.g. FinCore, MUM1-UPS, LOT-7731" className="flex-1 bg-transparent text-sm outline-none" />
        </div>
        {results.length > 0 && (
          <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card-hover">
            {results.map((n) => (
              <button key={n[0]} onClick={() => { go(n[0]); setQ(""); }} className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm hover:bg-brand-soft">
                <TypeChip type={n[1]} /><span className="font-semibold text-slate-800">{n[2]}</span><span className="text-xs text-slate-400">{n[0]}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button key={p.id} onClick={() => go(p.id)} title={p.why} className={cn("rounded-full border px-3 py-1.5 text-xs font-medium transition-all hover:-translate-y-0.5", id === p.id ? "border-brand-blue bg-brand-soft text-brand-blue" : "border-slate-200 bg-white text-slate-600 hover:border-brand-blue hover:text-brand-blue")}>
            {p.id}
          </button>
        ))}
      </div>

      {!node ? (
        <p className="text-sm text-slate-500">No node with id “{id}”.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1.2fr]">
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
              {trail.length > 0 && (
                <button onClick={() => { const t = [...trail]; const prev = t.pop()!; setTrail(t); setId(prev); }} className="mb-3 inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-brand-blue">
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to {trail[trail.length - 1]}
                </button>
              )}
              <TypeChip type={node[1]} />
              <h2 className="mt-2 text-xl font-extrabold tracking-tight text-slate-900">{node[2]}</h2>
              <p className="font-mono text-xs text-slate-400">{node[0]}</p>
              <dl className="mt-4 grid grid-cols-1 gap-x-4 gap-y-1.5 sm:grid-cols-2">
                {Object.entries(node[4]).map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3 border-b border-slate-50 py-1 text-xs">
                    <dt className="text-slate-400">{k}</dt>
                    <dd className="truncate text-right font-medium text-slate-700" title={String(v)}>
                      {typeof v === "string" && ix.byId.has(v) ? <button onClick={() => go(v)} className="text-brand-blue hover:underline">{v}</button> : String(v)}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
              <p className="text-sm font-semibold text-slate-800">Neighbours ({nbrs.length})</p>
              <div className="mt-3 max-h-[420px] space-y-4 overflow-y-auto pr-1">
                {grouped.map(([k, list]) => (
                  <div key={k}>
                    <p className="text-xs font-semibold uppercase tracking-wider text-brand-blue">{k} <span className="text-slate-400">({list.length})</span></p>
                    <ul className="mt-1.5 space-y-1">
                      {list.slice(0, 40).map((n, i) => {
                        const o = ix.byId.get(n.other);
                        return (
                          <li key={n.other + i}>
                            <button onClick={() => go(n.other)} className="group flex w-full items-center gap-2 rounded-lg px-2 py-1 text-left text-xs hover:bg-brand-soft">
                              <TypeChip type={o?.[1] ?? "?"} small />
                              <span className="truncate font-medium text-slate-700">{o?.[2] ?? n.other}</span>
                              {n.props && <span className="truncate text-slate-400">{Object.entries(n.props).map(([a, b]) => `${a}=${b}`).join(" ")}</span>}
                              <ArrowRight className="ml-auto h-3 w-3 flex-shrink-0 text-slate-300 group-hover:text-brand-blue" />
                            </button>
                          </li>
                        );
                      })}
                      {list.length > 40 && <li className="px-2 text-[11px] text-slate-400">+ {list.length - 40} more</li>}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div ref={wrap} className="rounded-2xl border border-slate-200 bg-white p-2 shadow-card">
            <p className="px-3 pt-2 text-xs text-slate-400">1-hop neighbourhood{nbrs.length > 60 ? " (first 60)" : ""} — click a node to traverse.</p>
            <ForceGraph2D
              key={id}
              graphData={fg}
              width={Math.max(300, w - 16)}
              height={560}
              backgroundColor="#ffffff"
              cooldownTicks={80}
              linkColor={() => "rgba(148,163,184,0.6)"}
              linkDirectionalArrowLength={3}
              linkDirectionalArrowRelPos={1}
              nodeCanvasObject={(n, ctx, scale) => {
                const nn = n as { id: string; type: string; label: string; x: number; y: number };
                const c = GROUP_COLOR[TYPE_GROUP[nn.type] ?? "shared"];
                const r = nn.id === id ? 8 : 5;
                ctx.beginPath(); ctx.arc(nn.x, nn.y, r, 0, 2 * Math.PI);
                ctx.fillStyle = nn.id === id ? c : "#fff"; ctx.fill();
                ctx.lineWidth = 2 / scale; ctx.strokeStyle = c; ctx.stroke();
                if (scale > 0.9 || nn.id === id) {
                  ctx.font = `${(nn.id === id ? 11 : 9) / scale}px Inter, sans-serif`;
                  ctx.fillStyle = "#334155";
                  ctx.fillText(nn.label.slice(0, 28), nn.x + r + 2, nn.y + 3 / scale);
                }
              }}
              onNodeClick={(n) => { const x = (n as { id: string }).id; if (x !== id) go(x); }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function TypeChip({ type, small }: { type: string; small?: boolean }) {
  const c = GROUP_COLOR[TYPE_GROUP[type] ?? "shared"];
  return (
    <span className={cn("inline-flex flex-shrink-0 items-center rounded-full font-semibold", small ? "px-1.5 py-0 text-[10px]" : "px-2.5 py-0.5 text-xs")} style={{ color: c, background: `${c}14` }}>
      {type}
    </span>
  );
}
