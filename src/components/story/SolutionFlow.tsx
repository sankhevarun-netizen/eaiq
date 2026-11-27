"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowDown, ArrowRight, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { solution } from "@/data/story";
import { agentByCode } from "@/data/agents";

/** Slide 5 as an interactive graph — hover an agent or output to trace, click to lock. */
export function SolutionFlow() {
  const [hover, setHover] = useState<string | null>(null);
  const [lock, setLock] = useState<string | null>(null);
  const active = lock ?? hover;

  const outputLit = (o: (typeof solution.outputs)[number]) => !active || o.title === active || o.from.includes(active);
  const agentLit = (name: string) =>
    !active || name === active || solution.outputs.some((o) => o.title === active && o.from.includes(name));

  const bind = (key: string) => ({
    onMouseEnter: () => setHover(key),
    onMouseLeave: () => setHover(null),
    onClick: () => setLock((l) => (l === key ? null : key)),
  });

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card lg:p-8">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs text-slate-400">Hover any agent or outcome to trace it, click to lock.</p>
        {lock && (
          <button onClick={() => setLock(null)} className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2.5 py-1 text-xs font-semibold text-brand-blue">
            Locked: {lock} <X className="h-3 w-3" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-[1fr_auto_1.5fr_auto_1fr]">
        {/* Inputs */}
        <div className="text-center">
          <p className="mb-3 text-sm font-semibold text-slate-800">{solution.systemsLabel}</p>
          <div className="flex flex-wrap justify-center gap-2">
            {solution.systemsTop.map((s) => (
              <span key={s} className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">{s}</span>
            ))}
          </div>
          <X className="mx-auto my-2 h-4 w-4 text-slate-400" />
          <div className="flex flex-wrap justify-center gap-2">
            {solution.systemsBottom.map((s) => (
              <span key={s} className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">{s}</span>
            ))}
          </div>
          <p className="mt-4 text-sm font-semibold text-slate-800">{solution.liveLabel}</p>
          <p className="mt-1 text-xs italic text-slate-500">{solution.liveSub}</p>
        </div>

        <ArrowRight className="mx-auto hidden h-5 w-5 text-slate-400 lg:block" />
        <ArrowDown className="mx-auto h-5 w-5 text-slate-400 lg:hidden" />

        {/* Brain */}
        <div className="space-y-3">
          <div className="rounded-xl border border-slate-300 px-4 py-3 text-center">
            <p className="text-sm font-bold text-slate-900">{solution.brain.title}</p>
            <p className="text-xs text-slate-500">{solution.brain.sub}</p>
          </div>
          <div className="rounded-xl border border-slate-300 p-4">
            <p className="mb-3 text-center text-xs font-bold uppercase tracking-widest text-brand-blue">AI Agents</p>
            <div className="grid grid-cols-2 gap-2">
              {solution.agents.map((a) => {
                const ag = agentByCode(a.code);
                return (
                  <button
                    key={a.name}
                    {...bind(a.name)}
                    className={cn(
                      "rounded-lg border px-3 py-2 text-sm transition-all",
                      agentLit(a.name) ? "border-brand-blue/30 bg-brand-soft text-brand-blue" : "border-slate-200 bg-slate-50 text-slate-300",
                      active === a.name && "ring-2 ring-brand-blue",
                    )}
                    title={ag ? `${ag.code} ${ag.title}` : undefined}
                  >
                    {a.name}
                  </button>
                );
              })}
            </div>
            <div className="mt-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-center text-sm font-semibold text-brand-green-dark">{solution.graph}</div>
          </div>
          <ArrowDown className="mx-auto h-4 w-4 text-slate-400" />
          <div className="rounded-xl border border-slate-300 px-4 py-3 text-center">
            <p className="text-sm font-bold text-slate-900">{solution.executor.title}</p>
            <p className="text-xs text-slate-500">{solution.executor.sub}</p>
          </div>
        </div>

        <ArrowRight className="mx-auto hidden h-5 w-5 text-slate-400 lg:block" />
        <ArrowDown className="mx-auto h-5 w-5 text-slate-400 lg:hidden" />

        {/* Outputs */}
        <div className="space-y-2">
          {solution.outputs.map((o) => (
            <button
              key={o.title}
              {...bind(o.title)}
              className={cn(
                "w-full rounded-r-lg border-l-4 px-4 py-2.5 text-left text-sm font-medium transition-all",
                outputLit(o) ? "border-brand-blue bg-brand-soft text-slate-800" : "border-slate-200 bg-slate-50 text-slate-300",
                active === o.title && "ring-2 ring-brand-blue",
              )}
            >
              {o.title}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mt-8 grid grid-cols-1 items-center gap-4 border-t border-slate-100 pt-6 md:grid-cols-[auto_1fr_auto]">
        <div className="rounded-xl bg-slate-100 px-4 py-3 text-center text-sm font-semibold text-slate-700">{solution.connects}</div>
        <div className="flex flex-wrap justify-center gap-6">
          {solution.pillars.map((p) => (
            <span key={p} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-800">
              <Check className="h-4 w-4 text-brand-green" /> {p}
            </span>
          ))}
        </div>
        <div className="rounded-xl bg-slate-100 px-4 py-3 text-center text-sm font-semibold text-slate-700">{solution.result}</div>
      </div>

      <p className="mt-6 text-xs text-slate-400">
        Agent names map to the specialists: Correlation → <Link href="/agents/d1-correlation-and-incident" className="text-brand-blue">D1</Link>, Capacity →{" "}
        <Link href="/agents/d2-capacity-and-twin" className="text-brand-blue">D2</Link>, Predictive risk → <Link href="/agents/d3-risk" className="text-brand-blue">D3</Link>, Simulation and Change →{" "}
        <Link href="/agents/d4-change-and-switchover" className="text-brand-blue">D4</Link>, Impact → shared graph-impact engine and{" "}
        <Link href="/agents/e2-code-and-dependency" className="text-brand-blue">E2</Link>.
      </p>
    </div>
  );
}
