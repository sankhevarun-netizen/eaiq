"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import { useMemo, useState } from "react";
import { components, rowCapacity, type Component } from "@/data/demo/nexusMumbai1";

export type Overlay = "load" | "thermal" | "tenant";

const TENANT_COLORS = ["#1a3a8f", "#16a34a", "#8b5cf6", "#0ea5e9", "#f59e0b", "#ef4444", "#14b8a6", "#64748b"];
const HOT = new Set(["R3-04", "R3-05", "R3-07", "R4-02", "R4-06"]);

function colorFor(r: Component, overlay: Overlay) {
  if (overlay === "tenant") return TENANT_COLORS[(r.row ?? 1) - 1];
  if (overlay === "thermal") return HOT.has(r.id) ? "#ef4444" : r.row === 3 || r.row === 4 ? "#f59e0b" : "#22c55e";
  const kw = r.kw ?? 0;
  const lim = Math.min(rowCapacity[(r.row ?? 1) - 1].coolingLimitKw / 8, 30);
  const pct = kw / lim;
  return pct > 0.85 ? "#ef4444" : pct > 0.65 ? "#f59e0b" : "#22c55e";
}

export function Twin3D({ overlay, onSelect, selected }: { overlay: Overlay; onSelect: (c: Component) => void; selected?: string }) {
  const racks = useMemo(() => components.filter((c) => c.type === "Rack"), []);
  const [hover, setHover] = useState<string | null>(null);

  return (
    <Canvas camera={{ position: [14, 16, 18], fov: 42 }} dpr={[1, 2]}>
      <color attach="background" args={["#f8fafc"]} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[10, 20, 10]} intensity={0.8} />
      {/* Halls floor */}
      {[1, 2].map((h) => (
        <group key={h} position={[h === 1 ? -6.5 : 6.5, 0, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
            <planeGeometry args={[12, 14]} />
            <meshStandardMaterial color="#e2e8f0" />
          </mesh>
          <Text position={[0, 0.02, -7.6]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.7} color="#475569">{`Hall ${h}`}</Text>
        </group>
      ))}
      {racks.map((r) => {
        const row = r.row!;
        const k = Number(r.id.split("-")[1]);
        const hallX = row <= 4 ? -6.5 : 6.5;
        const rowIdx = (row - 1) % 4;
        const x = hallX - 4.2 + (k - 1) * 1.2;
        const z = -5 + rowIdx * 3.2;
        const h = 1.4 + (r.kw ?? 10) / 20;
        const isSel = selected === r.id;
        const isHover = hover === r.id;
        return (
          <mesh
            key={r.id}
            position={[x, h / 2, z]}
            onClick={(e) => { e.stopPropagation(); onSelect(r); }}
            onPointerOver={(e) => { e.stopPropagation(); setHover(r.id); document.body.style.cursor = "pointer"; }}
            onPointerOut={() => { setHover(null); document.body.style.cursor = "auto"; }}
          >
            <boxGeometry args={[0.9, h, 1.6]} />
            <meshStandardMaterial color={colorFor(r, overlay)} emissive={isSel || isHover ? "#1a3a8f" : "#000000"} emissiveIntensity={isSel ? 0.5 : isHover ? 0.25 : 0} />
          </mesh>
        );
      })}
      {[1, 2, 3, 4, 5, 6, 7, 8].map((row) => {
        const hallX = row <= 4 ? -6.5 : 6.5;
        const z = -5 + ((row - 1) % 4) * 3.2;
        return <Text key={row} position={[hallX - 5.6, 0.05, z]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.45} color="#64748b">{`R${row}`}</Text>;
      })}
      <OrbitControls enablePan maxPolarAngle={Math.PI / 2.2} minDistance={8} maxDistance={45} />
    </Canvas>
  );
}
