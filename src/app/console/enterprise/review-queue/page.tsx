"use client";

import { useState } from "react";
import { ConsoleTitle, Panel, RoleNote } from "@/components/console/ConsoleShell";
import { Loading } from "@/components/console/Loading";
import { canAct, useConsole } from "@/components/providers/ConsoleStore";
import { useEnterprise } from "@/lib/consoleData";
import { cn } from "@/lib/utils";

export default function ReviewQueuePage() {
  const e = useEnterprise();
  const { role, log } = useConsole();
  const [decided, setDecided] = useState<Record<string, "Confirmed" | "Rejected">>({});
  if (!e) return <Loading what="enterprise data" />;
  const allowed = canAct(role, "enterprise");
  const decide = (id: string, v: "Confirmed" | "Rejected", conf: number) => {
    setDecided((d) => ({ ...d, [id]: v }));
    log(`${v} graph link (S2)`, id, `confidence=${conf}`);
  };
  const left = e.weakLinks.filter((l) => !decided[l.id]).length;

  return (
    <>
      <ConsoleTitle eyebrow={`Link review queue · S2 Graph curator (MVP+ · proposed) · ${e.enterprise.name}`} title="Low-confidence links, reviewed — not trusted silently" sub="S2 only proposes. Link checks rate each link before review, and an architect confirms each link before it is used." />
      <Panel title={`${left} links awaiting an architect`}>
        <RoleNote allowed={allowed} text={`Your role (${role}) can view the queue; only an architect confirms links.`} />
        <div className="mt-2 space-y-2">
          {e.weakLinks.map((l) => (
            <div key={l.id} className="flex flex-col gap-3 rounded-lg border border-slate-100 p-3 md:flex-row md:items-center">
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800">{l.from} <span className="text-slate-400">({l.fromApp})</span> → {l.to} <span className="text-slate-400">({l.toApp})</span></p>
                <p className="text-xs text-slate-500">{l.protocol} · evidence {l.evidence.replace("_", " ")} · confidence <span className="font-semibold text-amber-600">{l.confidence.toFixed(2)}</span></p>
              </div>
              {decided[l.id] ? (
                <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", decided[l.id] === "Confirmed" ? "bg-green-50 text-brand-green-dark" : "bg-slate-100 text-slate-500")}>{decided[l.id]}</span>
              ) : (
                <div className="flex gap-2">
                  <button disabled={!allowed} onClick={() => decide(l.id, "Confirmed", l.confidence)} className="rounded-lg bg-brand-blue px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-blue-dark disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400">Confirm</button>
                  <button disabled={!allowed} onClick={() => decide(l.id, "Rejected", l.confidence)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300">Reject</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}
