"use client";

import { useEffect, useMemo, useState } from "react";
import { ConsoleTitle, Kpi, Panel, RoleNote } from "@/components/console/ConsoleShell";
import { Loading } from "@/components/console/Loading";
import { canAct, useConsole } from "@/components/providers/ConsoleStore";
import { useEnterprise, type SevenR } from "@/lib/consoleData";
import { cn, inr } from "@/lib/utils";

const sevenRColors: Record<SevenR, string> = {
  Retire: "bg-slate-100 text-slate-600", Retain: "bg-green-50 text-green-700", Rehost: "bg-sky-50 text-sky-700",
  Replatform: "bg-brand-soft text-brand-blue", Repurchase: "bg-violet-50 text-violet-700", Refactor: "bg-amber-50 text-amber-700", Relocate: "bg-teal-50 text-teal-700",
};
const PATHS: (SevenR | "All")[] = ["All", "Retire", "Retain", "Rehost", "Replatform", "Repurchase", "Refactor", "Relocate"];

export default function PortfolioPage() {
  const e = useEnterprise();
  const { role, request, approvals } = useConsole();
  const [selId, setSelId] = useState<string | null>(null);
  const [f, setF] = useState<SevenR | "All">("All");
  useEffect(() => { setSelId(null); setF("All"); }, [e?.enterprise.id]);
  const list = useMemo(() => (e ? e.apps.filter((a) => f === "All" || a.path === f).sort((a, b) => (a.tier > b.tier ? 1 : -1) || b.costInr - a.costInr) : []), [e, f]);
  if (!e) return <Loading what="enterprise data" />;
  const sel = e.apps.find((a) => a.id === selId) ?? list[0];
  const allowed = canAct(role, "enterprise");
  const pending = sel && approvals.some((a) => a.kind === "7R path" && a.title.startsWith(sel.name));
  const counts = Object.fromEntries(PATHS.slice(1).map((p) => [p, e.apps.filter((a) => a.path === p).length]));

  return (
    <>
      <ConsoleTitle eyebrow={`Portfolio rationalization · E1 · ${e.enterprise.name}`} title="A 7R path per application, ordered into waves" sub="7R scores from fit, cost, risk and debt; TOGAF rule checks. The architect approves each path and each TOGAF exception." />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Kpi label="Applications" value={e.apps.length} sub={`${e.profile.tier1} tier-1 · ${e.profile.on_prem_pct}% on-prem`} />
        <Kpi label="Run cost / year" value={inr(e.apps.reduce((x, a) => x + a.costInr, 0))} />
        <Kpi label="On end-of-life tech" value={`${e.profile.eol_app_pct}%`} tone="warn" />
        <Kpi label="Retire decided, still running" value={e.retireNotDone.length} sub={inr(e.retireNotDone.reduce((x, r) => x + r.costInr, 0)) + " / yr"} tone="bad" />
        <Kpi label="Residency breaches" value={e.residency.length} tone={e.residency.length ? "bad" : "good"} sub={e.residency.map((r) => r.app).join(", ")} />
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {PATHS.map((p) => <button key={p} onClick={() => setF(p)} className={cn("rounded-full px-3.5 py-1.5 text-xs font-medium", f === p ? "bg-brand-blue text-white" : "bg-white text-slate-600 shadow-card hover:bg-slate-100")}>{p}{p !== "All" && ` (${counts[p]})`}</button>)}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Panel title={`Applications (${list.length})`} className="xl:col-span-2">
          <div className="no-scrollbar max-h-[560px] overflow-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead className="sticky top-0 bg-white"><tr className="text-left text-xs uppercase tracking-wider text-slate-400"><th className="py-2">Application</th><th>Tier</th><th>Hosting</th><th>7R path</th><th>Wave</th><th>Cost / yr</th><th>EOL</th></tr></thead>
              <tbody>
                {list.map((a) => (
                  <tr key={a.id} onClick={() => setSelId(a.id)} className={cn("cursor-pointer border-t border-slate-100 hover:bg-slate-50", sel?.id === a.id && "bg-brand-soft/50")}>
                    <td className="py-2 font-semibold text-slate-800">{a.name}<p className="text-[11px] font-normal text-slate-400">{a.capability}</p></td>
                    <td>{a.tier}</td>
                    <td className="text-slate-600">{a.hosting}{a.primary ? ` · ${a.primary}` : ""}</td>
                    <td><span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", sevenRColors[a.path])}>{a.path}</span></td>
                    <td>{a.wave || "—"}</td>
                    <td>{inr(a.costInr)}</td>
                    <td className={a.eolTechs ? "font-semibold text-red-600" : "text-slate-300"}>{a.eolTechs || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
        {sel && (
          <Panel title={`${sel.name} · why ${sel.path}`}>
            <p className="text-xs text-slate-500">{sel.owner} · {sel.tier} · {sel.hosting} ({sel.model}) · {sel.components} components · DR {sel.dr ?? "none"}</p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-400">7R scores</p>
            <div className="mt-2 space-y-2">
              {Object.entries(sel.scores).map(([k, v]) => <div key={k}><div className="flex justify-between text-xs text-slate-600"><span className="capitalize">{k}</span><span className="font-semibold">{v}</span></div><div className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-brand-blue" style={{ width: `${v}%` }} /></div></div>)}
            </div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Stack facts</p>
            <div className="mt-1.5 flex flex-wrap gap-1">{sel.techs.map((t) => <span key={t.id} title={`EOL ${t.eol || "—"}`} className={cn("rounded px-1.5 py-0.5 text-[11px]", t.past ? "bg-red-50 font-semibold text-red-600" : "bg-slate-100 text-slate-600")}>{t.name}</span>)}</div>
            {sel.vulnLibs.length > 0 && <><p className="mt-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Vulnerable libraries</p>{sel.vulnLibs.map((v) => <p key={v} className="text-xs text-red-600">• {v}</p>)}</>}
            {sel.regs.length > 0 && <p className="mt-3 text-xs text-slate-500"><span className="font-semibold">Subject to:</span> {sel.regs.join("; ")}</p>}
            {sel.decision && <div className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">{sel.decision.id} ({sel.decision.forum}, {sel.decision.on}): {sel.decision.decision} — {sel.decision.rationale}. Status <span className="font-semibold">{sel.decision.status.replace("_", " ")}</span>; approver {sel.decision.approver}; evidence {sel.decision.evidence}.</div>}
            <button disabled={!allowed || !!pending} onClick={() => request({ kind: "7R path", title: `${sel.name} → ${sel.path} (wave ${sel.wave})`, requestedBy: "E1", evidence: `fit ${sel.scores.fit} · risk ${sel.scores.risk} · debt ${sel.scores.debt} · ${sel.eolTechs} EOL techs` })} className="mt-5 w-full rounded-lg bg-brand-blue py-2 text-sm font-semibold text-white hover:bg-brand-blue-dark disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400">{pending ? "Sent to architect" : "Send path for architect approval"}</button>
            <RoleNote allowed={allowed} text={`Your role (${role}) cannot submit paths.`} />
          </Panel>
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {[1, 2, 3].map((w) => (
          <Panel key={w} title={`Wave ${w}`} asOf={false}>
            <p className="mb-2 text-[11px] text-slate-400">{w === 1 ? "No dependents — move first" : w === 2 ? "1–3 dependents" : "Many dependents — move last"}</p>
            <div className="max-h-56 space-y-1.5 overflow-y-auto">{e.apps.filter((a) => a.wave === w).map((a) => <div key={a.id} className="flex items-center justify-between gap-2"><span className="truncate text-sm text-slate-700">{a.name}</span><span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", sevenRColors[a.path])}>{a.path}</span></div>)}</div>
          </Panel>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Data residency">
          {e.residency.map((r) => <p key={r.app} className="text-sm text-slate-700"><span className="font-semibold text-red-600">{r.app}</span> — {r.data} data in {r.region}</p>)}
          {e.crossBorder.map((r) => <p key={r.app} className="text-sm text-slate-700"><span className="font-semibold text-amber-600">{r.app}</span> — personal data in {r.region}, review</p>)}
          {!e.residency.length && !e.crossBorder.length && <p className="text-sm text-slate-500">No residency issues found.</p>}
          <p className="mt-2 text-[11px] text-slate-400">Regulation nodes are labels — confirm wording with compliance.</p>
        </Panel>
        <Panel title="Disaster recovery gaps">
          <D t="DR site is single-path" l={e.dr.singlePathDr} />
          <D t="DR shares the primary's utility grid" l={e.dr.sharedGrid} />
          <D t="No DR" l={e.dr.noDr} />
        </Panel>
      </div>
    </>
  );
}

function D({ t, l }: { t: string; l: string[] }) {
  return <div className="mb-2"><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t} ({l.length})</p><p className="text-sm text-slate-700">{l.join(", ") || "—"}</p></div>;
}
