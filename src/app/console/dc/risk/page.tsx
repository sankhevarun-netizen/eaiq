"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { ConsoleTitle, Kpi, Panel, RoleNote } from "@/components/console/ConsoleShell";
import { Loading } from "@/components/console/Loading";
import { canAct, useConsole } from "@/components/providers/ConsoleStore";
import { useSite } from "@/lib/consoleData";
import { cn, inr } from "@/lib/utils";

function Risk() {
  const sp = useSearchParams();
  const s = useSite();
  const { role, request, approvals } = useConsole();
  const [id, setId] = useState<string | null>(sp.get("id"));
  useEffect(() => { if (s && (!id || !s.watchlist.some((w) => w.id === id))) setId(s.watchlist[0]?.id ?? null); }, [s, id]);
  if (!s) return <Loading />;
  const sel = s.watchlist.find((w) => w.id === id);
  const allowed = canAct(role, "dc");
  const requested = sel && approvals.some((a) => a.kind === "Maintenance ticket" && a.title.includes(sel.id));
  const drifting = s.watchlist.filter((w) => w.riseC);
  const chart = sel?.temps.length ? sel.temps.map((t, i) => ({ i, asset: t, peers: s.peerTemps[i] })) : [];

  return (
    <>
      <ConsoleTitle eyebrow={`Proactive monitoring and predictive maintenance · D3 · ${s.site.id}`} title="Drift flagged before any alarm" sub="The risk engine and BigQuery ML score drift against peers and end of life against design life; D3 holds back where data is too thin." />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="On watchlist" value={s.watchlist.length} tone={s.watchlist.length ? "warn" : "good"} />
        <Kpi label="Drifting vs peers" value={drifting.length} sub={drifting.map((d) => d.lot).filter(Boolean).join(", ") || "none"} tone={drifting.length ? "bad" : "good"} />
        <Kpi label="Past design life" value={s.watchlist.filter((w) => w.ageRatio >= 1).length} tone="warn" />
        <Kpi label="Replacement value" value={inr(s.watchlist.reduce((x, w) => x + (w.cost ?? 0), 0))} sub="for every asset listed" />
      </div>

      {s.watchlist.length === 0 ? (
        <Panel className="mt-4"><p className="text-sm text-slate-500">No assets at {s.site.id} are drifting or near end of life.</p></Panel>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
          <Panel title="Ranked watchlist" className="xl:col-span-2">
            <div className="no-scrollbar max-h-[560px] overflow-auto">
              <table className="w-full min-w-[680px] text-sm">
                <thead className="sticky top-0 bg-white"><tr className="text-left text-xs uppercase tracking-wider text-slate-400"><th className="py-2">#</th><th>Asset</th><th>Signal</th><th>Life used</th><th>Racks</th><th>Act by</th><th>Score</th></tr></thead>
                <tbody>
                  {s.watchlist.map((w, i) => (
                    <tr key={w.id} onClick={() => setId(w.id)} className={cn("cursor-pointer border-t border-slate-100 hover:bg-slate-50", id === w.id && "bg-brand-soft/50")}>
                      <td className="py-2.5 text-slate-400">{i + 1}</td>
                      <td><p className="font-semibold text-slate-800">{w.id}</p><p className="text-xs text-slate-500">{w.type.replace("_", " ")}{w.lot ? ` · ${w.lot}` : ""}</p></td>
                      <td className="text-slate-600">{w.riseC ? <span className="font-semibold text-red-600">+{w.riseC} °C (z {w.z})</span> : "age"}</td>
                      <td><div className="flex items-center gap-2"><div className="h-1.5 w-14 overflow-hidden rounded-full bg-slate-100"><div className={cn("h-full", w.ageRatio >= 1 ? "bg-red-500" : w.ageRatio >= 0.9 ? "bg-amber-500" : "bg-brand-blue")} style={{ width: `${Math.min(100, w.ageRatio * 100)}%` }} /></div><span className="text-xs">{Math.round(w.ageRatio * 100)}%</span></div></td>
                      <td>{w.racks}</td>
                      <td className="font-semibold">{w.actBy}</td>
                      <td className="font-bold text-brand-blue">{w.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
          {sel && (
            <Panel title={`${sel.id} · evidence`}>
              <dl className="space-y-3 text-sm">
                <Row k="Make / model" v={sel.make || "—"} />
                <Row k="Installed" v={`${sel.install} · ${sel.lifeY}-year design life`} />
                <Row k="Replace by" v={sel.replaceBy} />
                {sel.riseC && <Row k="Drift" v={`+${sel.riseC} °C vs site peers (z ${sel.z})`} red />}
                <Row k="Replacement" v={sel.cost ? `${inr(sel.cost)} · ${sel.leadDays} days lead time` : "—"} />
                <Row k="Exposed if it fails" v={`${sel.racks} racks downstream`} />
              </dl>
              <div className="mt-3 flex flex-wrap gap-1.5">{sel.tenants.map((t) => <span key={t} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">{t}</span>)}</div>
              {chart.length > 0 && (
                <div className="mt-4 h-36">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chart} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                      <XAxis dataKey="i" hide />
                      <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} domain={["dataMin - 1", "dataMax + 1"]} />
                      <Tooltip contentStyle={{ borderRadius: 10, fontSize: 11 }} formatter={(v: number) => `${v} °C`} labelFormatter={() => "Battery temperature"} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Line dataKey="asset" name={sel.id} stroke="#dc2626" strokeWidth={2} dot={false} />
                      <Line dataKey="peers" name="Site peer mean" stroke="#94a3b8" strokeWidth={1.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
              {sel.maint.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Maintenance history</p>
                  {sel.maint.map((m) => <p key={m.on + m.kind} className="mt-1 text-xs text-slate-600">{m.on} · {m.kind} · {m.outcome}{m.reading ? ` · ${m.reading}` : ""}</p>)}
                </div>
              )}
              <button disabled={!allowed || !!requested} onClick={() => request({ kind: "Maintenance ticket", title: `Replace ${sel.id}${sel.lot ? ` (lot ${sel.lot})` : ""}`, requestedBy: "D3", evidence: `${sel.riseC ? `+${sel.riseC} °C vs peers · ` : ""}${Math.round(sel.ageRatio * 100)}% life · ${sel.racks} racks` })} className="mt-5 w-full rounded-lg bg-brand-blue py-2 text-sm font-semibold text-white hover:bg-brand-blue-dark disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400">{requested ? "Approval requested" : "Request maintenance ticket"}</button>
              <RoleNote allowed={allowed} text={`Your role (${role}) cannot request tickets.`} />
              <p className="mt-2 text-[11px] text-slate-400">Maintenance ticket only after approval.</p>
            </Panel>
          )}
        </div>
      )}
    </>
  );
}

function Row({ k, v, red }: { k: string; v: string; red?: boolean }) {
  return <div><dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">{k}</dt><dd className={cn("mt-0.5", red ? "font-semibold text-red-600" : "text-slate-700")}>{v}</dd></div>;
}

export default function RiskPage() {
  return <Suspense fallback={<Loading />}><Risk /></Suspense>;
}
