"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { stack } from "@/data/story";

/** Slide 7 — stacked-layer visualizer (same idiom as the K-Nexus AI Stack page). */
export function StackVisualizer() {
  const [active, setActive] = useState(0);
  const layer = stack.layers[active];

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr_1fr]">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand-blue">EAiQ Stack</span>
          <span className="text-xs text-slate-400">Hover or tap a layer to explore →</span>
        </div>
        <div className="space-y-2">
          {stack.layers.map((l, i) => (
            <button
              key={l.name}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
              className={cn(
                "grid w-full grid-cols-[150px_1fr] overflow-hidden rounded-xl border text-left transition-all duration-200",
                active === i ? "border-transparent shadow-card-hover" : "border-slate-200 shadow-card hover:-translate-y-0.5",
              )}
            >
              <span className="flex items-center px-4 py-4 text-sm font-bold uppercase tracking-wider text-white" style={{ background: l.color }}>
                {l.n} · {l.name}
              </span>
              <span className={cn("flex items-center px-4 text-sm", active === i ? "bg-white text-slate-800" : "bg-white text-slate-500")}>{l.does}</span>
            </button>
          ))}
        </div>
      </div>

      <motion.div
        key={layer.name}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="self-start rounded-2xl border border-slate-200 bg-white p-6 shadow-card"
      >
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: layer.color }}>Layer {layer.n}</p>
        <h3 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">{layer.name}</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">{layer.does}</p>
        <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-slate-400">Enabling technologies</p>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {layer.tech.map((t) => (
            <div key={t} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-center text-sm font-semibold text-slate-700">{t}</div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
