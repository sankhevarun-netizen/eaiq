"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, BookOpen, CheckCircle2, UserPlus } from "lucide-react";
import { ConsoleTitle, Panel, RoleNote } from "@/components/console/ConsoleShell";
import { SlaClock } from "@/components/console/SlaClock";
import { canAct, useConsole } from "@/components/providers/ConsoleStore";
import { alarmStorm, tenants } from "@/data/demo/nexusMumbai1";
import { cn } from "@/lib/utils";

function Incidents() {
  const sp = useSearchParams();
  const { incidents, updateIncident, log, role, user, request } = useConsole();
  const [id, setId] = useState(sp.get("id") ?? "INC-2611");
  useEffect(() => { const q = sp.get("id"); if (q) setId(q); }, [sp]);
  const inc = incidents.find((i) => i.id === id) ?? incidents[0];
  const allowed = canAct(role, "dc");
  const brief = `${inc.id}: ${inc.alarms} alarm${inc.alarms > 1 ? "s" : ""} grouped into one incident. Top cause ${inc.rootCause} at confidence ${inc.confidence.toFixed(2)}. Blast radius ${inc.blast.racks} racks${inc.blast.tenants.length ? `, tenants ${inc.blast.tenants.join(" and ")}` : ""}. Next: ${inc.nextStep.step}.`;

  return (
    <>
      <ConsoleTitle eyebrow="Event correlation and incident command · D1" title="One incident, ranked causes, the next step" sub="Alerts grouped into one incident with a confidence indication, blast radius and the next runbook step with owner and time limit." />

      <div className="mb-4 flex flex-wrap gap-2">
        {incidents.map((i) => (
          <button key={i.id} onClick={() => setId(i.id)} className={cn("rounded-full px-4 py-2 text-sm font-medium transition-all", i.id === inc.id ? "bg-brand-blue text-white" : "bg-white text-slate-600 shadow-card hover:bg-slate-100")}>
            {i.severity} · {i.id} <span className="opacity-70">({i.status})</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <Panel
            title={`${inc.id} · ${inc.title}`}
            action={
              <div className="flex gap-2">
                <button
                  disabled={!allowed || inc.status !== "Open"}
                  onClick={() => { updateIncident(inc.id, { status: "Acknowledged" }); log("Acknowledged incident", inc.id); }}
                  className="inline-flex items-center gap-1 rounded-lg bg-brand-blue px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-blue-dark disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                ><CheckCircle2 className="h-3.5 w-3.5" /> Acknowledge</button>
                <button
                  disabled={!allowed || inc.status === "Assigned" || inc.status === "Resolved"}
                  onClick={() => { updateIncident(inc.id, { status: "Assigned", owner: user }); log("Assigned incident", inc.id, `owner=${user}`); }}
                  className="inline-flex items-center gap-1 rounded-lg border border-brand-blue px-3 py-1.5 text-xs font-semibold text-brand-blue hover:bg-brand-soft disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400 disabled:hover:bg-transparent"
                ><UserPlus className="h-3.5 w-3.5" /> Assign to me</button>
              </div>
            }
          >
            <RoleNote allowed={allowed} text={`Your role (${role}) can view incidents but not act on them.`} />
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Ranked causes</p>
            <div className="mt-2 space-y-2">
              {inc.causes.map((c, i) => (
                <div key={c.cause} className={cn("rounded-lg border p-3", i === 0 ? "border-brand-blue/30 bg-brand-soft/50" : "border-slate-100")}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-800">{i + 1}. {c.cause}</p>
                    <span className="text-sm font-bold text-brand-blue">{c.confidence.toFixed(2)}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-brand-blue" style={{ width: `${c.confidence * 100}%` }} /></div>
                  <p className="mt-1.5 text-xs text-slate-500">{c.evidence}</p>
                </div>
              ))}
            </div>
            {!inc.certain && (
              <div className="mt-3 flex items-start gap-2 rounded-lg bg-orange-50 px-3 py-2 text-xs text-orange-700">
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                Top cause is not certain enough. The on-call engineer takes uncertain causes; an ITSM incident is raised only after confirmation.
              </div>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                disabled={!allowed}
                onClick={() => request({ kind: "ITSM incident", title: `Raise ITSM incident for ${inc.id} — ${inc.rootCause}`, requestedBy: "D1", evidence: `confidence ${inc.confidence.toFixed(2)} · ${inc.alarms} alarms` })}
                className="rounded-lg border border-orange-300 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700 hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-50"
              >Confirm cause → request ITSM incident</button>
            </div>
          </Panel>

          <Panel title="Next runbook step">
            <div className="flex gap-3">
              <BookOpen className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-blue" />
              <div>
                <p className="text-sm font-semibold text-slate-800">{inc.nextStep.step}</p>
                <p className="mt-1 text-xs text-slate-500">Owner: <span className="font-semibold text-slate-700">{inc.owner ?? inc.nextStep.owner}</span> · Due by {inc.nextStep.due} · {inc.nextStep.source}</p>
              </div>
            </div>
          </Panel>

          {inc.id === "INC-2611" && (
            <Panel title={`Alarm storm · ${alarmStorm.length} alarms → 1 incident`}>
              <div className="no-scrollbar overflow-x-auto">
                <table className="w-full min-w-[640px] text-sm">
                  <thead><tr className="text-left text-xs uppercase tracking-wider text-slate-400"><th className="py-2">Time</th><th>Source</th><th>Asset</th><th>Message</th><th>Role</th></tr></thead>
                  <tbody>
                    {alarmStorm.map((a) => (
                      <tr key={a.id} className="border-t border-slate-100">
                        <td className="py-2 font-mono text-xs">{a.time}</td>
                        <td><span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold text-slate-600">{a.source}</span></td>
                        <td className="font-semibold">{a.asset}</td>
                        <td className="text-slate-600">{a.message}</td>
                        <td>{a.role === "cause" ? <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-600">Cause</span> : <span className="text-xs text-slate-400">Symptom</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          )}
        </div>

        <div className="space-y-4">
          <Panel title="Blast radius">
            <p className="text-3xl font-extrabold text-slate-900">{inc.blast.racks} <span className="text-sm font-medium text-slate-500">racks</span></p>
            <p className="text-sm text-slate-500">{inc.blast.rows.length ? `Rows ${inc.blast.rows.join(", ")}` : "No rack impact"}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">{inc.blast.tenants.map((t) => <span key={t} className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-600">{t}</span>)}</div>
          </Panel>
          <Panel title="SLA clocks per tenant">
            <div className="space-y-2">
              {inc.blast.tenants.length ? inc.blast.tenants.map((t, i) => {
                const ten = tenants.find((x) => x.name === t)!;
                return <SlaClock key={t} tenant={t} minutes={ten.slaMinutes} penalty={ten.penaltyPerHour} startOffsetMin={inc.id === "INC-2611" ? 7 - i * 2 : 0} />;
              }) : <p className="text-sm text-slate-500">No tenant SLA clocks running.</p>}
            </div>
          </Panel>
          <Panel title="Analyst brief">
            <p className="text-sm leading-relaxed text-slate-700">{brief}</p>
            <p className="mt-2 text-[11px] text-slate-400">Written by the orchestrator around engine facts.</p>
          </Panel>
        </div>
      </div>
    </>
  );
}

export default function IncidentsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-slate-400">Loading…</p>}>
      <Incidents />
    </Suspense>
  );
}
