"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, BookOpen, CheckCircle2, UserPlus } from "lucide-react";
import { ConsoleTitle, Panel, RoleNote } from "@/components/console/ConsoleShell";
import { Loading } from "@/components/console/Loading";
import { SlaClock } from "@/components/console/SlaClock";
import { canAct, useConsole } from "@/components/providers/ConsoleStore";
import { fmtTime, useRunbooks, useSite } from "@/lib/consoleData";
import { downAssets, graphIndex } from "@/lib/dcEngine";
import { cn } from "@/lib/utils";

const ROLE_STYLE: Record<string, string> = {
  cause: "bg-red-50 text-red-600",
  symptom: "bg-slate-100 text-slate-600",
  "upstream consequence": "bg-amber-50 text-amber-700",
  unrelated: "bg-slate-50 text-slate-400",
};

function Incidents() {
  const sp = useSearchParams();
  const s = useSite();
  const runbooks = useRunbooks();
  const { incidentState, setIncident, log, role, user, request } = useConsole();
  const [id, setId] = useState<string | null>(sp.get("id"));
  useEffect(() => { const q = sp.get("id"); if (q) setId(q); }, [sp]);
  useEffect(() => { if (s && (!id || !s.incidents.some((i) => i.id === id))) setId(s.incidents[0]?.id ?? null); }, [s, id]);

  const analysis = useMemo(() => {
    if (!s) return null;
    const alerts = s.alerts;
    const total = alerts.length || 1;
    const cause = alerts.find((a) => a.role === "cause");
    const explained = alerts.filter((a) => a.role !== "unrelated").length;
    const causes = [
      cause && { asset: cause.target, conf: explained / total, evidence: `First critical alarm (${cause.message}); ${explained - 1} other alerts sit downstream of it in the power or cooling chain` },
      ...alerts.filter((a) => a.role === "upstream consequence").map((a) => ({ asset: a.target, conf: 1 / total, evidence: `${a.message} — upstream of the root, a consequence of the load moving` })),
      ...alerts.filter((a) => a.role === "unrelated").map((a) => ({ asset: a.target, conf: 0.5 / total, evidence: `${a.message} — not on the root's chain` })),
    ].filter(Boolean) as { asset: string; conf: number; evidence: string }[];
    const sum = causes.reduce((x, c) => x + c.conf, 0) || 1;
    causes.forEach((c) => (c.conf = Math.round((c.conf / sum) * 100) / 100));
    const outage = alerts.filter((a) => a.cls === "outage" && a.targetType === "Asset" && a.status === "open").map((a) => a.target);
    const down = downAssets(s, outage);
    const { rackFeeds } = graphIndex(s);
    const racks = s.racks.filter((r) => (rackFeeds.get(r.id) ?? []).some((f) => down.has(f.rpp)));
    const rows = [...new Set(racks.map((r) => r.row))];
    const tenants = [...new Set(racks.map((r) => r.tenant).filter(Boolean))].map((t) => s.tenants.find((x) => x.id === t)!).filter(Boolean);
    return { causes, racks, rows, tenants };
  }, [s]);

  if (!s || !analysis) return <Loading />;
  const inc = s.incidents.find((i) => i.id === id);
  const st = inc ? incidentState[inc.id]?.status ?? (inc.status === "open" ? "Open" : "Resolved") : "Resolved";
  const isOpen = inc?.status === "open";
  const allowed = canAct(role, "dc");
  const rootType = s.assets.find((a) => a.id === inc?.rootAsset)?.type;
  const rb = inc?.runbook ? runbooks?.find((r) => r.id === inc.runbook) : runbooks?.find((r) => r.type === rootType && /trip|loss|fault|failure|overload/i.test(r.title)) ?? runbooks?.find((r) => r.type === rootType);
  const next = rb?.steps.find((x) => x.kind !== "rollback");
  const top = analysis.causes[0];

  return (
    <>
      <ConsoleTitle eyebrow={`Event correlation and incident command · D1 · ${s.site.id}`} title="One incident, ranked causes, the next step" sub="Alerts grouped into one incident with a confidence indication, blast radius and the next runbook step with owner and time limit." />

      <div className="mb-4 flex flex-wrap gap-2">
        {s.incidents.slice(0, 10).map((i) => (
          <button key={i.id} onClick={() => setId(i.id)} className={cn("rounded-full px-3.5 py-1.5 text-xs font-medium transition-all", i.id === id ? "bg-brand-blue text-white" : "bg-white text-slate-600 shadow-card hover:bg-slate-100")}>
            {i.id} <span className="opacity-70">({incidentState[i.id]?.status ?? (i.status === "open" ? "Open" : "Resolved")})</span>
          </button>
        ))}
        {s.incidents.length === 0 && <p className="text-sm text-slate-500">No incidents recorded at {s.site.id}.</p>}
      </div>

      {inc && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <div className="space-y-4 xl:col-span-2">
            <Panel
              title={`${inc.id} · ${inc.rootCause}`}
              action={isOpen ? (
                <div className="flex gap-2">
                  <button disabled={!allowed || st !== "Open"} onClick={() => { setIncident(inc.id, { status: "Acknowledged" }); log("Acknowledged incident", inc.id); }} className="inline-flex items-center gap-1 rounded-lg bg-brand-blue px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-blue-dark disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"><CheckCircle2 className="h-3.5 w-3.5" /> Acknowledge</button>
                  <button disabled={!allowed || st === "Assigned"} onClick={() => { setIncident(inc.id, { status: "Assigned", owner: user }); log("Assigned incident", inc.id, `owner=${user}`); }} className="inline-flex items-center gap-1 rounded-lg border border-brand-blue px-3 py-1.5 text-xs font-semibold text-brand-blue hover:bg-brand-soft disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"><UserPlus className="h-3.5 w-3.5" /> Assign to me</button>
                </div>
              ) : <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">Resolved · {inc.durationMin} min</span>}
            >
              <RoleNote allowed={allowed || !isOpen} text={`Your role (${role}) can view incidents but not act on them.`} />
              <p className="text-xs text-slate-500">Severity S{inc.severity} · opened {fmtTime(inc.openedAt)} · root asset <span className="font-semibold text-slate-700">{inc.rootAsset}</span>{incidentState[inc.id]?.owner ? ` · owner ${incidentState[inc.id]?.owner}` : ""}</p>
              {isOpen && (
                <>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Ranked causes</p>
                  <div className="mt-2 space-y-2">
                    {analysis.causes.map((c, i) => (
                      <div key={c.asset} className={cn("rounded-lg border p-3", i === 0 ? "border-brand-blue/30 bg-brand-soft/50" : "border-slate-100")}>
                        <div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold text-slate-800">{i + 1}. {c.asset}</p><span className="text-sm font-bold text-brand-blue">{c.conf.toFixed(2)}</span></div>
                        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-brand-blue" style={{ width: `${c.conf * 100}%` }} /></div>
                        <p className="mt-1.5 text-xs text-slate-500">{c.evidence}</p>
                      </div>
                    ))}
                  </div>
                  {top && top.conf < 0.7 && <div className="mt-3 flex items-start gap-2 rounded-lg bg-orange-50 px-3 py-2 text-xs text-orange-700"><AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />Top cause is not certain enough — the on-call engineer takes it.</div>}
                  <button disabled={!allowed} onClick={() => request({ kind: "ITSM incident", title: `Raise ITSM incident for ${inc.id} — ${inc.rootCause} on ${inc.rootAsset}`, requestedBy: "D1", evidence: `confidence ${top?.conf.toFixed(2)} · ${s.alerts.length} alerts · ${analysis.racks.length} racks single-path` })} className="mt-4 rounded-lg border border-orange-300 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700 hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-50">Confirm cause → request ITSM incident</button>
                </>
              )}
            </Panel>

            <Panel title={rb ? `${isOpen ? "Next runbook step" : "Runbook used"} · ${rb.id} ${rb.title}` : "Runbook"}>
              {rb ? (
                isOpen ? (
                  <div className="flex gap-3">
                    <BookOpen className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-blue" />
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Step {next?.seq}: {next?.text}</p>
                      <p className="mt-1 text-xs text-slate-500">Owner: <span className="font-semibold text-slate-700">{next?.team}</span> · time limit {next?.limit} min · S1 · {rb.steps.length} steps, runbook limit {rb.limit} min</p>
                    </div>
                  </div>
                ) : (
                  <ol className="space-y-1.5">{rb.steps.map((x) => <li key={x.seq} className="text-sm text-slate-700"><span className="mr-2 text-xs font-bold text-slate-400">{x.seq}</span>{x.text} <span className="text-xs text-slate-400">· {x.kind}</span></li>)}</ol>
                )
              ) : <p className="text-sm text-slate-500">No runbook matched — S1 says so rather than guessing.</p>}
            </Panel>

            {isOpen && (
              <Panel title={`Alert storm · ${s.alerts.length} alerts → 1 incident`}>
                <div className="no-scrollbar overflow-x-auto">
                  <table className="w-full min-w-[640px] text-sm">
                    <thead><tr className="text-left text-xs uppercase tracking-wider text-slate-400"><th className="py-2">Raised</th><th>ID</th><th>Target</th><th>Message</th><th>Class</th></tr></thead>
                    <tbody>
                      {s.alerts.map((a) => (
                        <tr key={a.id} className="border-t border-slate-100">
                          <td className="py-2 font-mono text-xs">{fmtTime(a.raisedAt)}</td>
                          <td className="font-mono text-xs text-slate-400">{a.id}</td>
                          <td className="font-semibold">{a.target}</td>
                          <td className="text-slate-600">{a.message}</td>
                          <td><span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", ROLE_STYLE[a.role])}>{a.role}</span></td>
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
              <p className="text-3xl font-extrabold text-slate-900">{isOpen ? analysis.racks.length : "—"} <span className="text-sm font-medium text-slate-500">racks on one path</span></p>
              <p className="text-sm text-slate-500">{isOpen ? `${analysis.rows.length} rows` : "Incident resolved"}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">{isOpen && analysis.tenants.map((t) => <span key={t.id} className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-600">{t.name}</span>)}</div>
            </Panel>
            {isOpen && (
              <Panel title="Notification clocks per tenant">
                <div className="space-y-2">
                  {analysis.tenants.filter((t) => t.contract).map((t, i) => (
                    <SlaClock key={t.id} tenant={t.name} minutes={t.contract!.notifyMin} penalty={t.contract!.ratePerH} startOffsetMin={3 + i} />
                  ))}
                  {analysis.tenants.length === 0 && <p className="text-sm text-slate-500">No tenant racks affected.</p>}
                </div>
                <p className="mt-2 text-[11px] text-slate-400">Contract notice window; penalty applies after {analysis.tenants[0]?.contract?.thresholdH ?? "—"} h of lost service.</p>
              </Panel>
            )}
            <Panel title="Analyst brief">
              <p className="text-sm leading-relaxed text-slate-700">
                {isOpen
                  ? `${inc.id}: ${s.alerts.length} alerts grouped into one incident. Top cause ${top?.asset} at confidence ${top?.conf.toFixed(2)}. ${analysis.racks.length} racks across ${analysis.rows.length} rows are on a single power path; tenants ${analysis.tenants.map((t) => t.name).join(", ") || "none"}. Next: ${next?.text ?? "—"}.`
                  : `${inc.id}: ${inc.rootCause} on ${inc.rootAsset}, resolved in ${inc.durationMin} min${inc.runbook ? ` using ${inc.runbook}` : ""}.`}
              </p>
              <p className="mt-2 text-[11px] text-slate-400">Written by the orchestrator around engine facts.</p>
            </Panel>
          </div>
        </div>
      )}
    </>
  );
}

export default function IncidentsPage() {
  return <Suspense fallback={<Loading />}><Incidents /></Suspense>;
}
