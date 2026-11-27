"use client";

import { useEffect, useState } from "react";
import { cn, inr } from "@/lib/utils";

/** Per-tenant SLA clock: minutes to threshold, counting down live. */
export function SlaClock({ tenant, minutes, penalty, startOffsetMin = 0 }: { tenant: string; minutes: number; penalty: number; startOffsetMin?: number }) {
  const [left, setLeft] = useState(Math.max(0, minutes - startOffsetMin) * 60);
  useEffect(() => {
    const t = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  const mm = Math.floor(left / 60);
  const ss = String(left % 60).padStart(2, "0");
  const pct = left / (minutes * 60);
  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-800">{tenant}</p>
        <p className={cn("font-mono text-sm font-bold", pct < 0.3 ? "text-red-600" : pct < 0.6 ? "text-amber-600" : "text-slate-700")}>{mm}:{ss}</p>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div className={cn("h-full rounded-full", pct < 0.3 ? "bg-red-500" : pct < 0.6 ? "bg-amber-500" : "bg-brand-blue")} style={{ width: `${pct * 100}%` }} />
      </div>
      <p className="mt-1.5 text-[11px] text-slate-500">Time to threshold · penalty exposure {inr(penalty)}/h</p>
    </div>
  );
}
