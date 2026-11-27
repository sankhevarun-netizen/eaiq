"use client";

import { AlertTriangle, Check, X } from "lucide-react";
import { ConsoleTitle, Kpi, Panel, RoleNote } from "@/components/console/ConsoleShell";
import { canAct, useConsole } from "@/components/providers/ConsoleStore";
import { deliveryMetrics, productionAlert, releases } from "@/data/demo/enterprise";
import { cn } from "@/lib/utils";

export default function ReleasesPage() {
  const { role, request, approvals } = useConsole();
  const allowed = canAct(role, "enterprise");
  const rb = approvals.find((a) => a.kind === "Rollback" && a.title.includes("b81e44f"));

  return (
    <>
      <ConsoleTitle eyebrow="Gated releases and production support · E3" title="From commit to production, and back if needed" sub="The engine alone passes or blocks, and fixes arrive only as pull requests. A person merges every fix; no rollback starts without the on-call person's approval." />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Lead time" value={`${deliveryMetrics.leadTimeDays} d`} />
        <Kpi label="Change failure rate" value={`${Math.round(deliveryMetrics.failureRate * 100)}%`} tone="warn" />
        <Kpi label="Time to restore" value={`${deliveryMetrics.timeToRestoreHrs} h`} />
        <Kpi label="Deploys / week" value={deliveryMetrics.deploysPerWeek} />
      </div>

      <Panel title="Production support" className="mt-4">
        <div className="flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50/60 p-4 md:flex-row md:items-start">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 text-red-600" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-800">{productionAlert.alert} <span className="font-normal text-slate-500">since {productionAlert.since}</span></p>
            <p className="mt-2 text-sm text-slate-700">Most likely change: <span className="font-semibold">{productionAlert.likelyChange}</span> · confidence {productionAlert.confidence}</p>
            <ul className="mt-2 space-y-0.5">{productionAlert.evidence.map((e) => <li key={e} className="text-xs text-slate-600">• {e}</li>)}</ul>
            <p className="mt-2 text-xs text-slate-600">Blast radius: {productionAlert.blast.join(", ")}</p>
          </div>
          <div className="flex-shrink-0">
            <button disabled={!allowed || !!rb} onClick={() => request({ kind: "Rollback", title: productionAlert.rollback, requestedBy: "E3", evidence: `5xx 4.2% · likely change REL-1039 (${productionAlert.confidence})` })} className="rounded-lg border border-orange-300 bg-white px-3 py-2 text-xs font-semibold text-orange-700 hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50">
              {rb ? `Rollback ${rb.status.toLowerCase()}` : "Propose rollback"}
            </button>
            <RoleNote allowed={allowed} text={`Role ${role} cannot propose.`} />
          </div>
        </div>
      </Panel>

      <div className="mt-4 space-y-4">
        {releases.map((r) => (
          <Panel key={r.id} title={`${r.id} · ${r.app} · ${r.commit}`} action={<span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", r.status === "Blocked" ? "bg-red-50 text-red-600" : r.status === "Released" ? "bg-green-50 text-brand-green-dark" : "bg-amber-50 text-amber-700")}>{r.status}</span>}>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              {r.gates.map((g) => (
                <div key={g.name} className={cn("rounded-lg border p-3", g.verdict === "pass" ? "border-green-200 bg-green-50/40" : "border-red-200 bg-red-50/50")}>
                  <div className="flex items-center gap-1.5">{g.verdict === "pass" ? <Check className="h-4 w-4 text-brand-green" /> : <X className="h-4 w-4 text-red-600" />}<p className="text-sm font-semibold text-slate-800">{g.name}</p></div>
                  <p className="mt-1 text-xs text-slate-600">{g.data}</p>
                </div>
              ))}
            </div>
            {r.status === "Awaiting owner" && (
              <button disabled={!allowed} onClick={() => request({ kind: "Pull request", title: `Release ${r.id} ${r.app} ${r.commit}`, requestedBy: "E3", evidence: "All gates pass" })} className="mt-3 rounded-lg bg-brand-blue px-4 py-2 text-xs font-semibold text-white hover:bg-brand-blue-dark disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400">Send to owner for sign-off</button>
            )}
            {r.status === "Blocked" && <p className="mt-3 text-xs text-slate-500">A fix will arrive as a pull request; a person merges it.</p>}
          </Panel>
        ))}
      </div>
    </>
  );
}
