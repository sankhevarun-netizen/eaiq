"use client";

import { useMemo, useState } from "react";
import { ConsoleTitle, Panel } from "@/components/console/ConsoleShell";
import { apps, depLinks } from "@/data/demo/enterprise";
import { cn } from "@/lib/utils";

function impactSet(id: string) {
  const out = new Set<string>();
  const stack = [id];
  while (stack.length) {
    const cur = stack.pop()!;
    depLinks.filter((l) => l.to === cur).forEach((l) => {
      if (!out.has(l.from)) { out.add(l.from); stack.push(l.from); }
    });
  }
  return out;
}

const POS: Record<string, [number, number]> = {
  "mobile-api": [90, 60], "core-banking-gw": [300, 60], "fraud-engine": [520, 60],
  "loan-origination": [300, 200], "doc-mgmt": [90, 200], "hr-portal": [90, 330],
  "crm-legacy": [520, 200], "salesforce-crm": [710, 200], "data-warehouse": [610, 330], "branch-dr": [300, 330],
};

export default function DependenciesPage() {
  const [sel, setSel] = useState("core-banking-gw");
  const impact = useMemo(() => impactSet(sel), [sel]);
  const name = (id: string) => apps.find((a) => a.id === id)?.name ?? id;

  return (
    <>
      <ConsoleTitle eyebrow="Dependency map and impact sets · E2 (assumed, to confirm)" title="If we change this component, what breaks?" sub="A verified map of components, calls and data flows, with the reach of any change and a confidence rating on each link. Low-confidence links go to the S2 review queue." />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Panel title="Dependency map" className="xl:col-span-2" action={<span className="text-[11px] text-slate-400">Click an application to compute its impact set</span>}>
          <div className="no-scrollbar overflow-x-auto">
            <svg viewBox="0 0 800 390" className="min-w-[640px]">
              {depLinks.map((l, i) => {
                const [x1, y1] = POS[l.from];
                const [x2, y2] = POS[l.to];
                const lit = impact.has(l.from) && (l.to === sel || impact.has(l.to));
                return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={lit ? "#1a3a8f" : l.verified ? "#cbd5e1" : "#f59e0b"} strokeWidth={lit ? 2.5 : 1.5} strokeDasharray={l.verified ? undefined : "5 4"} />;
              })}
              {depLinks.map((l, i) => {
                const [x1, y1] = POS[l.from];
                const [x2, y2] = POS[l.to];
                return <text key={"t" + i} x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 4} fontSize="10" fill="#64748b" textAnchor="middle">{l.confidence.toFixed(2)}</text>;
              })}
              {Object.entries(POS).map(([id, [x, y]]) => (
                <g key={id} onClick={() => setSel(id)} className="cursor-pointer">
                  <rect x={x - 72} y={y - 18} width={144} height={36} rx={10} fill={id === sel ? "#1a3a8f" : impact.has(id) ? "#eaf1ff" : "#ffffff"} stroke={id === sel || impact.has(id) ? "#1a3a8f" : "#e2e8f0"} />
                  <text x={x} y={y + 4} fontSize="11" fontWeight={600} textAnchor="middle" fill={id === sel ? "#ffffff" : "#1e293b"}>{name(id)}</text>
                </g>
              ))}
            </svg>
          </div>
          <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-5 bg-slate-300" /> Verified link</span>
            <span className="inline-flex items-center gap-1.5"><span className="w-5 border-t-2 border-dashed border-amber-500" /> Low confidence, in review queue</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-5 bg-brand-blue" /> Impact path</span>
          </div>
        </Panel>
        <Panel title={`Impact set · ${name(sel)}`}>
          <p className="text-3xl font-extrabold text-slate-900">{impact.size} <span className="text-sm font-medium text-slate-500">applications reached</span></p>
          <div className="mt-3 space-y-2">
            {[...impact].map((id) => {
              const link = depLinks.find((l) => l.from === id);
              return (
                <div key={id} className="flex items-center justify-between rounded-lg border border-slate-100 p-2.5">
                  <span className="text-sm text-slate-700">{name(id)}</span>
                  {link && <span className={cn("text-xs font-bold", link.confidence >= 0.8 ? "text-brand-green" : "text-amber-600")}>{link.confidence.toFixed(2)}</span>}
                </div>
              );
            })}
            {impact.size === 0 && <p className="text-sm text-slate-500">Nothing depends on this application.</p>}
          </div>
          <p className="mt-4 text-[11px] text-slate-400">E2 asks no agent; E1, E3 and E4 read its graph. Proven when the impact set matches a reference tool&apos;s call graph for the same application.</p>
        </Panel>
      </div>
    </>
  );
}
