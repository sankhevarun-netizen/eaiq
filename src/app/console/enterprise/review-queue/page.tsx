"use client";

import { useState } from "react";
import { ConsoleTitle, Panel, RoleNote } from "@/components/console/ConsoleShell";
import { canAct, useConsole } from "@/components/providers/ConsoleStore";
import { apps, depLinks } from "@/data/demo/enterprise";
import { cn } from "@/lib/utils";

export default function ReviewQueuePage() {
  const { role, log } = useConsole();
  const allowed = canAct(role, "enterprise");
  const [decided, setDecided] = useState<Record<number, "Confirmed" | "Rejected">>({});
  const name = (id: string) => apps.find((a) => a.id === id)?.name ?? id;
  const queue = depLinks.map((l, i) => ({ ...l, i })).filter((l) => !l.verified);

  const decide = (i: number, v: "Confirmed" | "Rejected") => {
    setDecided((d) => ({ ...d, [i]: v }));
    const l = depLinks[i];
    log(`${v} graph link (S2)`, `${name(l.from)} → ${name(l.to)}`, `confidence=${l.confidence}`);
  };

  return (
    <>
      <ConsoleTitle eyebrow="Link review queue · S2 Graph curator (MVP+ · proposed)" title="Low-confidence links, reviewed — not trusted silently" sub="S2 only proposes. Link checks rate each link before review, and an architect confirms each link before it is used." />
      <Panel title={`${queue.length - Object.keys(decided).length} links awaiting an architect`}>
        <RoleNote allowed={allowed} text={`Your role (${role}) can view the queue; only an architect confirms links.`} />
        <div className="mt-2 space-y-2">
          {queue.map((l) => (
            <div key={l.i} className="flex flex-col gap-3 rounded-lg border border-slate-100 p-3 md:flex-row md:items-center">
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800">{name(l.from)} → {name(l.to)}</p>
                <p className="text-xs text-slate-500">{l.kind === "call" ? "Call" : "Data flow"} · proposed by E2 code adapter · link check confidence <span className="font-semibold text-amber-600">{l.confidence.toFixed(2)}</span></p>
              </div>
              {decided[l.i] ? (
                <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", decided[l.i] === "Confirmed" ? "bg-green-50 text-brand-green-dark" : "bg-slate-100 text-slate-500")}>{decided[l.i]}</span>
              ) : (
                <div className="flex gap-2">
                  <button disabled={!allowed} onClick={() => decide(l.i, "Confirmed")} className="rounded-lg bg-brand-blue px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-blue-dark disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400">Confirm</button>
                  <button disabled={!allowed} onClick={() => decide(l.i, "Rejected")} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300">Reject</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}
