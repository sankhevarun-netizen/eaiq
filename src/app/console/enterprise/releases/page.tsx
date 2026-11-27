"use client";

import { AlertTriangle, Check, X } from "lucide-react";
import { ConsoleTitle, Kpi, Panel, RoleNote } from "@/components/console/ConsoleShell";
import { Loading } from "@/components/console/Loading";
import { canAct, useConsole } from "@/components/providers/ConsoleStore";
import { fmtTime, useEnterprise } from "@/lib/consoleData";
import { cn } from "@/lib/utils";

export default function ReleasesPage() {
  const e = useEnterprise();
  const { role, request, approvals } = useConsole();
  if (!e) return <Loading what="enterprise data" />;
  const allowed = canAct(role, "enterprise");
  const latest = e.incidents.find((i) => i.deployment);
  const rbTitle = latest?.deployment ? `Roll back ${latest.deployment.component} (${latest.deployment.id}) for ${latest.app}` : "";
  const rb = approvals.find((a) => a.kind === "Rollback" && a.title === rbTitle);

  return (
    <>
      <ConsoleTitle eyebrow={`Gated releases and production support · E3 · ${e.enterprise.name}`} title="From commit to production, and back if needed" sub="The engine alone passes or blocks, and fixes arrive only as pull requests. A person merges every fix; no rollback starts without the on-call person's approval." />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Kpi label="Pipeline runs" value={e.pipelines.runs.toLocaleString("en-IN")} />
        <Kpi label="Failure rate" value={`${Math.round(e.pipelines.fail_rate * 1000) / 10}%`} tone="warn" />
        <Kpi label="Test-gate failures" value={e.pipelines.test_gate_failures} />
        <Kpi label="Flaky pipelines" value={e.pipelines.flaky_pipelines} tone="warn" />
        <Kpi label="Incidents traced to a change" value={`${e.traced.traced} / ${e.traced.incidents}`} sub={`${Math.round(e.traced.share * 100)}%`} />
      </div>

      {latest && (
        <Panel title="Production support · latest change-caused incident" className="mt-4">
          <div className="flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50/60 p-4 md:flex-row md:items-start">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 text-red-600" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-800">{latest.id} · {latest.app} · {latest.rootCause} <span className="font-normal text-slate-500">· S{latest.severity} · {fmtTime(latest.openedAt)} · {latest.durationMin} min</span></p>
              <p className="mt-2 text-sm text-slate-700">Most likely change: <span className="font-semibold">{latest.deployment!.id}</span> — {latest.deployment!.component} deployed {fmtTime(latest.deployment!.at)} (commit {latest.deployment!.commit})</p>
              <p className="mt-1 text-xs text-slate-600">Evidence: incident opened after the deployment; the component belongs to the affected application (CAUSED_BY_DEPLOYMENT).{latest.deployment!.rolledBack ? " Already rolled back." : ""}</p>
            </div>
            <div className="flex-shrink-0">
              <button disabled={!allowed || !!rb || latest.deployment!.rolledBack} onClick={() => request({ kind: "Rollback", title: rbTitle, requestedBy: "E3", evidence: `${latest.id} · ${latest.rootCause}` })} className="rounded-lg border border-orange-300 bg-white px-3 py-2 text-xs font-semibold text-orange-700 hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50">{rb ? `Rollback ${rb.status.toLowerCase()}` : "Propose rollback"}</button>
              <RoleNote allowed={allowed} text={`Role ${role} cannot propose.`} />
            </div>
          </div>
        </Panel>
      )}

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel title="Recent pipeline runs · gate verdicts">
          <div className="max-h-[520px] space-y-2 overflow-y-auto">
            {e.pipelines.recent.map((r) => (
              <div key={r.id} className="rounded-lg border border-slate-100 p-3">
                <div className="flex items-center justify-between gap-2"><p className="text-sm font-semibold text-slate-800">{r.pipeline} <span className="text-xs font-normal text-slate-400">· {r.app}</span></p><span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", r.result === "passed" ? "bg-green-50 text-brand-green-dark" : "bg-red-50 text-red-600")}>{r.result}</span></div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {r.stages.map((st) => {
                    const idx = r.failedStage ? r.stages.indexOf(r.failedStage) : -1;
                    const i = r.stages.indexOf(st);
                    const state = r.failedStage ? (i < idx ? "pass" : i === idx ? "block" : "skip") : "pass";
                    return <span key={st} className={cn("inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-medium", state === "pass" ? "bg-green-50 text-green-700" : state === "block" ? "bg-red-100 text-red-700" : "bg-slate-50 text-slate-300")}>{state === "pass" ? <Check className="h-2.5 w-2.5" /> : state === "block" ? <X className="h-2.5 w-2.5" /> : null}{st}</span>;
                  })}
                </div>
                <p className="mt-1.5 text-[11px] text-slate-400">{fmtTime(r.at)} · {r.durationMin} min · {r.commit}</p>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Recent deployments">
          <div className="max-h-[520px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white"><tr className="text-left text-xs uppercase tracking-wider text-slate-400"><th className="py-2">When</th><th>Component</th><th>Env</th><th>Outcome</th></tr></thead>
              <tbody>{e.deployments.map((d) => (
                <tr key={d.id} className="border-t border-slate-100"><td className="py-2 whitespace-nowrap text-xs text-slate-500">{fmtTime(d.at)}</td><td><p className="font-semibold text-slate-800">{d.component}</p><p className="text-[11px] text-slate-400">{d.app}</p></td><td>{d.env}</td><td>{d.causedIncident ? <span className="text-xs font-semibold text-red-600">caused incident{d.rolledBack ? " · rolled back" : ""}</span> : <span className="text-xs text-brand-green">clean</span>}</td></tr>
              ))}</tbody>
            </table>
          </div>
          <button disabled={!allowed} onClick={() => request({ kind: "Pull request", title: `Fix flaky pipelines (${e.pipelines.flaky_pipelines}) — ${e.enterprise.name}`, requestedBy: "E3", evidence: `fail rate ${Math.round(e.pipelines.fail_rate * 1000) / 10}%` })} className="mt-3 rounded-lg bg-brand-blue px-4 py-2 text-xs font-semibold text-white hover:bg-brand-blue-dark disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400">Raise fix as pull request</button>
        </Panel>
      </div>
    </>
  );
}
