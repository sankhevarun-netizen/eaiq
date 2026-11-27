"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { GROUP_COLOR, TYPE_GROUP, schema } from "@/data/ontology";
import { cn } from "@/lib/utils";

const W = 980;
const COL_X = { dc: 170, shared: 490, enterprise: 810 };

/** Type-level ontology map: 28 node types, 41 edge types. Hover to trace, click to lock. */
export function SchemaGraph() {
  const [hover, setHover] = useState<string | null>(null);
  const [lock, setLock] = useState<string | null>(null);
  const active = lock ?? hover;

  const { pos, H } = useMemo(() => {
    const cols: Record<string, string[]> = { dc: [], shared: [], enterprise: [] };
    for (const n of schema.nodeTypes) cols[TYPE_GROUP[n.type] ?? "shared"].push(n.type);
    const rows = Math.max(...Object.values(cols).map((c) => c.length));
    const H = rows * 44 + 60;
    const pos: Record<string, { x: number; y: number }> = {};
    for (const [g, list] of Object.entries(cols)) {
      const gap = (H - 60) / list.length;
      list.forEach((t, i) => (pos[t] = { x: COL_X[g as keyof typeof COL_X], y: 50 + gap * i + gap / 2 }));
    }
    return { pos, H };
  }, []);

  const links = useMemo(
    () => schema.edgeTypes.flatMap((e) => e.ends.filter((x) => pos[x.from] && pos[x.to]).map((x) => ({ type: e.type, from: x.from, to: x.to, n: x.n }))),
    [pos],
  );
  const linked = (t: string) => !active || t === active || links.some((l) => (l.from === active && l.to === t) || (l.to === active && l.from === t));
  const sel = schema.nodeTypes.find((n) => n.type === active);
  const selEdges = schema.edgeTypes.filter((e) => e.ends.some((x) => x.from === active || x.to === active));

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_340px]">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
        <div className="mb-2 flex items-center justify-between px-2">
          <p className="text-xs text-slate-400">Hover any type to trace it, click to lock.</p>
          {lock && (
            <button onClick={() => setLock(null)} className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2.5 py-1 text-xs font-semibold text-brand-blue">
              Locked: {lock} <X className="h-3 w-3" />
            </button>
          )}
        </div>
        <div className="no-scrollbar overflow-x-auto">
          <svg viewBox={`0 0 ${W} ${H}`} className="min-w-[760px]">
            {(["dc", "shared", "enterprise"] as const).map((g) => (
              <text key={g} x={COL_X[g]} y={22} textAnchor="middle" fontSize="11" fontWeight={700} letterSpacing="1.5" fill={GROUP_COLOR[g]}>
                {g === "dc" ? "FACILITY" : g === "shared" ? "SHARED" : "ESTATE"}
              </text>
            ))}
            {links.map((l, i) => {
              const a = pos[l.from], b = pos[l.to];
              const on = active && (l.from === active || l.to === active);
              if (l.from === l.to) return null;
              const mx = (a.x + b.x) / 2 + (a.x === b.x ? 70 : 0);
              return (
                <path
                  key={i}
                  d={`M${a.x},${a.y} Q${mx},${(a.y + b.y) / 2} ${b.x},${b.y}`}
                  fill="none"
                  stroke={on ? "#1a3a8f" : "#cbd5e1"}
                  strokeOpacity={active && !on ? 0.15 : on ? 0.9 : 0.6}
                  strokeWidth={on ? 1.8 : 1}
                />
              );
            })}
            {schema.nodeTypes.map((n) => {
              const p = pos[n.type];
              const g = TYPE_GROUP[n.type] ?? "shared";
              const lit = linked(n.type);
              return (
                <g
                  key={n.type}
                  className="cursor-pointer"
                  opacity={lit ? 1 : 0.25}
                  onMouseEnter={() => setHover(n.type)}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => setLock((l) => (l === n.type ? null : n.type))}
                >
                  <rect x={p.x - 78} y={p.y - 15} width={156} height={30} rx={15} fill={active === n.type ? GROUP_COLOR[g] : "#fff"} stroke={GROUP_COLOR[g]} strokeOpacity={0.6} />
                  <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize="11.5" fontWeight={600} fill={active === n.type ? "#fff" : "#1e293b"}>
                    {n.type} <tspan fill={active === n.type ? "#e2e8f0" : "#94a3b8"} fontWeight={500}>{n.count.toLocaleString("en-IN")}</tspan>
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
        {sel ? (
          <>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: GROUP_COLOR[TYPE_GROUP[sel.type] ?? "shared"] }}>Node type</p>
            <h3 className="mt-1 text-xl font-extrabold tracking-tight text-slate-900">{sel.type}</h3>
            <p className="text-sm text-slate-500">{sel.count.toLocaleString("en-IN")} rows</p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Properties</p>
            <div className="mt-2 flex flex-wrap gap-1.5">{sel.props.map((p) => <code key={p} className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-600">{p}</code>)}</div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Edges ({selEdges.length})</p>
            <ul className="mt-2 max-h-72 space-y-1.5 overflow-y-auto">
              {selEdges.map((e) => (
                <li key={e.type} className="text-xs text-slate-600">
                  <span className="font-semibold text-brand-blue">{e.type}</span> · {e.ends.filter((x) => x.from === sel.type || x.to === sel.type).map((x) => `${x.from} → ${x.to}`).join(", ")} <span className="text-slate-400">({e.count})</span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-blue">Schema map</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">Facility types on the left, estate types on the right, incidents and regulations shared between them. Hover a type to see what it connects to; click to lock it and read its properties and edges.</p>
            <div className="mt-4 space-y-1.5 text-xs">
              {(["dc", "shared", "enterprise"] as const).map((g) => (
                <p key={g} className={cn("flex items-center gap-2 text-slate-600")}><span className="h-3 w-3 rounded-full border-2" style={{ borderColor: GROUP_COLOR[g] }} />{g === "dc" ? "Facility (DC pack)" : g === "shared" ? "Shared" : "Estate (Enterprise pack)"}</p>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
