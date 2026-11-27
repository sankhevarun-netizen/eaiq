"use client";

import { useState } from "react";
import { ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { howItWorks } from "@/data/story";

/**
 * Slide 6. Hovering a column highlights that column and its neighbours (the
 * signal path); clicking locks it. Column 3 is the dark EAiQ knowledge-graph panel.
 */
export function ReasoningFlow() {
  const [hover, setHover] = useState<number | null>(null);
  const [lock, setLock] = useState<number | null>(null);
  const active = lock ?? hover;
  const lit = (n: number) => active === null || Math.abs(active - n) <= 1;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card lg:p-8">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs text-slate-400">Hover any column to trace the signal path, click to lock.</p>
        {lock !== null && (
          <button onClick={() => setLock(null)} className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2.5 py-1 text-xs font-semibold text-brand-blue">
            Locked: {howItWorks.columns[lock - 1].title} <X className="h-3 w-3" />
          </button>
        )}
      </div>

      <div className="no-scrollbar overflow-x-auto">
        <div className="grid min-w-[980px] grid-cols-5 gap-4">
          {howItWorks.columns.map((col) => {
            const isEaiq = col.n === 3;
            return (
              <div
                key={col.n}
                onMouseEnter={() => setHover(col.n)}
                onMouseLeave={() => setHover(null)}
                onClick={() => setLock((l) => (l === col.n ? null : col.n))}
                className={cn("cursor-pointer transition-opacity", lit(col.n) ? "opacity-100" : "opacity-30")}
              >
                <div className="mb-3 flex items-center gap-2">
                  <span className={cn("flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white", isEaiq ? "bg-brand-violet" : "bg-brand-navy")}>{col.n}</span>
                  <p className={cn("text-sm font-bold", isEaiq ? "text-brand-violet" : "text-slate-800")}>{col.title}</p>
                </div>

                {isEaiq ? (
                  <div className="rounded-xl bg-brand-navy p-4 text-white">
                    <p className="text-lg font-extrabold">EAiQ</p>
                    <p className="mb-3 text-sm font-semibold text-blue-300">Knowledge Graph</p>
                    <ol className="space-y-2.5">
                      {col.items.map((it, i) => (
                        <li key={it.title} className="flex gap-2">
                          <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand-blue text-[10px] font-bold">{i + 1}</span>
                          <div>
                            <p className="text-xs font-semibold text-blue-200">{it.title}</p>
                            <p className="text-[11px] italic leading-snug text-slate-300">{it.sub}</p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {col.items.map((it) => (
                      <div key={it.title} className={cn("rounded-xl border border-slate-200 bg-white p-3", col.n === 1 && "border-0 border-b bg-transparent px-0 pt-0")}>
                        <p className="text-sm font-semibold text-slate-800">{it.title}</p>
                        <p className={cn("mt-0.5 text-xs leading-snug", col.n === 4 ? "italic text-brand-blue" : "italic text-slate-500")}>{it.sub}</p>
                        {"detail" in it && it.detail && <p className="mt-1 text-xs text-slate-600">{it.detail as string}</p>}
                      </div>
                    ))}
                    {col.n === 2 && (
                      <div className="flex gap-1.5 pt-1">
                        {howItWorks.connectors.map((c) => (
                          <span key={c} className="rounded-md border border-sky-200 bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-700">{c}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-400 lg:hidden">Scroll horizontally to explore the full flow →</p>
    </div>
  );
}

export function PipelineSteps() {
  return (
    <div>
      <p className="mb-4 text-sm font-semibold text-slate-800">How intelligence flows</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {howItWorks.flow.map((s, i) => (
          <div key={s.n} className="relative">
            <div className={cn("flex items-center gap-3 rounded-xl border p-3", s.eaiq ? "border-brand-blue/20 bg-brand-soft" : "border-slate-200 bg-slate-50")}>
              <span className={cn("flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white", s.eaiq ? "bg-brand-blue" : "bg-slate-400")}>{s.n}</span>
              <div>
                <p className="text-sm font-semibold text-slate-800">{s.title}</p>
                <p className="text-xs text-slate-500">{s.sub}</p>
              </div>
            </div>
            {i < howItWorks.flow.length - 1 && <ChevronRight className="absolute -right-3 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-brand-blue lg:block" />}
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-4 rounded-sm bg-brand-blue" /> EAiQ-led intelligence stages</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-4 rounded-sm bg-slate-400" /> Source / integration stages</span>
      </div>
    </div>
  );
}
