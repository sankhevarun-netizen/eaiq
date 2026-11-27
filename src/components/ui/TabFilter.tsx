"use client";

import { cn } from "@/lib/utils";

export function TabFilter<T extends string>({ tabs, active, onChange }: { tabs: readonly T[]; active: T; onChange: (t: T) => void }) {
  return (
    <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-1">
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={cn(
            "whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
            active === t ? "bg-brand-blue text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900",
          )}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
