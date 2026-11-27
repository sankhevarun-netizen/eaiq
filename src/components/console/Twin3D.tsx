"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import { useMemo, useState } from "react";
import type { Rack, SiteData } from "@/lib/consoleData";

export type Overlay = "load" | "power" | "tenant";

const PALETTE = ["#1a3a8f", "#16a34a", "#8b5cf6", "#0ea5e9", "#f59e0b", "#ef4444", "#14b8a6", "#64748b", "#ec4899", "#84cc16", "#a16207", "#0f766e"];
const PITCH = 0.75, ROW_GAP = 2.6, HALL_GAP = 4;

export function Twin3D({ site, overlay, onSelect, selected, singlePath }: { site: SiteData; overlay: Overlay; onSelect: (r: Rack) => void; selected?: string; singlePath: Set<string> }) {
  const [hover, setHover] = useState<string | null>(null);

  const layout = useMemo(() => {
    const tenantIdx = new Map(site.tenants.map((t, i) => [t.id, i]));
    let x0 = 0;
    const halls = site.halls.map((h) => {
      const rows = site.rows.filter((r) => r.hall === h.id).sort((a, b) => a.no - b.no);
      const maxPos = Math.max(1, ...site.racks.filter((r) => r.hall === h.id).map((r) => r.pos));
      const w = maxPos * PITCH + 1.5, d = rows.length * ROW_GAP + 1.5;
      const out = { h, rows, x0, w, d };
      x0 += w + HALL_GAP;
      return out;
    });
    const total = x0 - HALL_GAP;
    const rowZ = new Map<string, number>();
    const hallX = new Map<string, number>();
    for (const hl of halls) {
      hallX.set(hl.h.id, hl.x0 - total / 2);
      hl.rows.forEach((r, i) => rowZ.set(r.id, -hl.d / 2 + 1 + i * ROW_GAP));
    }
    return { halls, total, rowZ, hallX, tenantIdx };
  }, [site]);

  const color = (r: Rack) => {
    if (overlay === "tenant") return r.tenant ? PALETTE[(layout.tenantIdx.get(r.tenant) ?? 0) % PALETTE.length] : "#e2e8f0";
    if (overlay === "power") return singlePath.has(r.id) ? "#ef4444" : r.status === "leased" ? "#22c55e" : "#e2e8f0";
    if (r.status !== "leased") return "#e2e8f0";
    const pct = r.load / r.kw;
    return pct > 0.85 ? "#ef4444" : pct > 0.65 ? "#f59e0b" : "#22c55e";
  };

  const span = Math.max(layout.total, 20);
  return (
    <Canvas camera={{ position: [0, span * 0.55, span * 0.75], fov: 42 }} dpr={[1, 2]}>
      <color attach="background" args={["#f8fafc"]} />
      <ambientLight intensity={0.75} />
      <directionalLight position={[10, 30, 10]} intensity={0.8} />
      {layout.halls.map((hl) => (
        <group key={hl.h.id}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[hl.x0 - layout.total / 2 + hl.w / 2, -0.01, 0]}>
            <planeGeometry args={[hl.w, hl.d]} />
            <meshStandardMaterial color="#e2e8f0" />
          </mesh>
          <Text position={[hl.x0 - layout.total / 2 + hl.w / 2, 0.02, -hl.d / 2 - 0.9]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.8} color="#475569">{hl.h.name}</Text>
        </group>
      ))}
      {site.racks.map((r) => {
        const x = (layout.hallX.get(r.hall) ?? 0) + 0.75 + (r.pos - 0.5) * PITCH;
        const z = layout.rowZ.get(r.row) ?? 0;
        const h = 1 + (r.kw / 15) * 1.6;
        const sel = selected === r.id, hov = hover === r.id;
        return (
          <mesh
            key={r.id}
            position={[x, h / 2, z]}
            onClick={(e) => { e.stopPropagation(); onSelect(r); }}
            onPointerOver={(e) => { e.stopPropagation(); setHover(r.id); document.body.style.cursor = "pointer"; }}
            onPointerOut={() => { setHover(null); document.body.style.cursor = "auto"; }}
          >
            <boxGeometry args={[0.6, h, 1.1]} />
            <meshStandardMaterial color={color(r)} emissive={sel || hov ? "#1a3a8f" : "#000000"} emissiveIntensity={sel ? 0.55 : hov ? 0.3 : 0} />
          </mesh>
        );
      })}
      <OrbitControls enablePan maxPolarAngle={Math.PI / 2.2} minDistance={6} maxDistance={span * 2} />
    </Canvas>
  );
}
