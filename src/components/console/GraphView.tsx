"use client";

import ForceGraph2D from "react-force-graph-2d";
import { useEffect, useMemo, useRef, useState } from "react";
import type { SiteData } from "@/lib/consoleData";

import { TYPE_COLOR } from "@/components/console/graphColors";

export function GraphView({ site, highlight, onPick, showRacks }: { site: SiteData; highlight: Set<string>; onPick: (id: string) => void; showRacks: boolean }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(800);
  useEffect(() => {
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    if (wrap.current) ro.observe(wrap.current);
    return () => ro.disconnect();
  }, []);

  const data = useMemo(() => {
    const nodes = [
      ...site.assets.map((a) => ({ id: a.id, type: a.type })),
      ...(showRacks ? site.racks.map((r) => ({ id: r.id, type: "rack" })) : []),
    ];
    const ids = new Set(nodes.map((n) => n.id));
    const links = site.links.filter(([a, b, t]) => t !== "COOLS_ROW" && t !== "REDUNDANT_WITH" && ids.has(a) && ids.has(b)).map(([a, b, t]) => ({ source: a, target: b, kind: t }));
    return { nodes, links };
  }, [site, showRacks]);
  const any = highlight.size > 0;

  return (
    <div ref={wrap} className="h-[500px] w-full">
      <ForceGraph2D
        graphData={data}
        width={w}
        height={500}
        backgroundColor="#ffffff"
        cooldownTicks={140}
        linkColor={(l) => {
          const s = typeof l.source === "object" ? (l.source as { id: string }).id : (l.source as string);
          const t = typeof l.target === "object" ? (l.target as { id: string }).id : (l.target as string);
          return any && highlight.has(s) && highlight.has(t) ? "rgba(26,58,143,0.85)" : any ? "rgba(203,213,225,0.2)" : "rgba(148,163,184,0.4)";
        }}
        nodeCanvasObject={(node, ctx, scale) => {
          const n = node as { id: string; x: number; y: number; type: string };
          const lit = !any || highlight.has(n.id);
          const r = n.type === "rack" ? 2 : n.type === "feed" || n.type === "ats" ? 6 : 4;
          ctx.beginPath();
          ctx.arc(n.x, n.y, r, 0, 2 * Math.PI);
          ctx.fillStyle = lit ? TYPE_COLOR[n.type] ?? "#94a3b8" : "#eef2f7";
          ctx.fill();
          if (n.type !== "rack" && scale > 1.6 && lit) {
            ctx.font = `${9 / scale}px Inter, sans-serif`;
            ctx.fillStyle = "#334155";
            ctx.fillText(n.id.replace(`${site.site.id}-`, ""), n.x + r + 1, n.y + 3 / scale);
          }
        }}
        onNodeClick={(n) => onPick((n as { id: string }).id)}
      />
    </div>
  );
}
