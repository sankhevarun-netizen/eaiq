"use client";

import ForceGraph2D from "react-force-graph-2d";
import { useEffect, useMemo, useRef, useState } from "react";
import { components, graphLinks, type CompType } from "@/data/demo/nexusMumbai1";

export const TYPE_COLOR: Record<CompType, string> = {
  Feed: "#0f172a", Switchgear: "#334155", Transformer: "#475569", Genset: "#64748b",
  UPS: "#1a3a8f", Battery: "#2546c4", PDU: "#3b82f6", Rack: "#93c5fd",
  Chiller: "#16a34a", CRAH: "#4ade80", Hall: "#8b5cf6", Row: "#c4b5fd",
  CoreSwitch: "#f59e0b", AggSwitch: "#fbbf24", Sensor: "#14b8a6",
};

export function GraphView({ highlight, onPick }: { highlight: Set<string>; onPick: (id: string) => void }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(800);
  useEffect(() => {
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    if (wrap.current) ro.observe(wrap.current);
    return () => ro.disconnect();
  }, []);

  const data = useMemo(
    () => ({
      nodes: components.map((c) => ({ id: c.id, label: c.label, type: c.type })),
      links: graphLinks.map((l) => ({ source: l.source, target: l.target, kind: l.kind })),
    }),
    [],
  );
  const any = highlight.size > 0;

  return (
    <div ref={wrap} className="h-[480px] w-full">
      <ForceGraph2D
        graphData={data}
        width={w}
        height={480}
        backgroundColor="#ffffff"
        cooldownTicks={120}
        nodeRelSize={4}
        linkColor={(l) => {
          const s = typeof l.source === "object" ? (l.source as { id: string }).id : (l.source as string);
          const t = typeof l.target === "object" ? (l.target as { id: string }).id : (l.target as string);
          return any && highlight.has(s) && highlight.has(t) ? "rgba(26,58,143,0.8)" : any ? "rgba(203,213,225,0.25)" : "rgba(148,163,184,0.45)";
        }}
        nodeCanvasObject={(node, ctx, scale) => {
          const n = node as { id: string; x: number; y: number; type: CompType };
          const lit = !any || highlight.has(n.id);
          const r = n.type === "Rack" ? 2.5 : n.type === "Row" || n.type === "Hall" ? 4 : 5;
          ctx.beginPath();
          ctx.arc(n.x, n.y, r, 0, 2 * Math.PI);
          ctx.fillStyle = lit ? TYPE_COLOR[n.type] : "#e2e8f0";
          ctx.fill();
          if (n.type !== "Rack" && scale > 1.2 && lit) {
            ctx.font = `${10 / scale}px Inter, sans-serif`;
            ctx.fillStyle = "#334155";
            ctx.fillText(n.id, n.x + r + 1, n.y + 3 / scale);
          }
        }}
        onNodeClick={(n) => onPick((n as { id: string }).id)}
      />
    </div>
  );
}
