"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Search, Send, Sparkles } from "lucide-react";
import { ConsoleTitle, Panel } from "@/components/console/ConsoleShell";
import { Loading } from "@/components/console/Loading";
import { useConsole } from "@/components/providers/ConsoleStore";
import { useRunbooks, useSite } from "@/lib/consoleData";
import { answer, search } from "@/lib/copilot";
import { simulateChange } from "@/lib/dcEngine";
import { cn } from "@/lib/utils";

type Brief = "Daily" | "Incident" | "Risk" | "Switchover";

export default function CopilotPage() {
  const s = useSite();
  const runbooks = useRunbooks();
  const { log } = useConsole();
  const [brief, setBrief] = useState<Brief>("Daily");
  const [input, setInput] = useState("");
  const [chat, setChat] = useState<{ q: string; a: string; facts: string[] }[]>([]);
  const [q, setQ] = useState("Battery getting hot");
  useEffect(() => setChat([]), [s?.site.id]);

  const briefs = useMemo(() => {
    if (!s) return null;
    const cause = s.alerts.find((a) => a.role === "cause");
    const open = s.incidents.filter((i) => i.status === "open");
    const peerLink = cause && s.links.find(([a, b, t]) => t === "REDUNDANT_WITH" && (a === cause.target || b === cause.target));
    const peer = peerLink ? (peerLink[0] === cause!.target ? peerLink[1] : peerLink[0]) : cause?.target;
    const sw = peer ? simulateChange(s, peer, runbooks) : null;
    return {
      Daily: [
        open.length ? `${open.length} open incident: ${open[0].id}, ${open[0].rootCause} on ${open[0].rootAsset}.` : `No open incidents at ${s.site.id}.`,
        s.watchlist[0] ? `D3 top risk: ${s.watchlist[0].id}${s.watchlist[0].riseC ? `, +${s.watchlist[0].riseC} °C vs peers` : ""}; act by ${s.watchlist[0].actBy}.` : "No drifting assets.",
        `${s.kpis.leasedPct}% leased; ${s.kpis.headroomKw} kW measured headroom; ${s.kpis.strandedKw} kW stranded.`,
        `PUE ${s.pue[s.pue.length - 1]?.pue ?? "—"} for ${s.pue[s.pue.length - 1]?.month ?? "—"}.`,
      ],
      Incident: cause ? [`${s.alerts.length} alerts → 1 incident. Root ${cause.target}: ${cause.message}.`, `${s.alerts.filter((a) => a.role === "symptom").length} symptoms, ${s.alerts.filter((a) => a.role === "upstream consequence").length} upstream consequence, ${s.alerts.filter((a) => a.role === "unrelated").length} unrelated.`] : ["No active alert storm."],
      Risk: s.watchlist.slice(0, 4).map((w) => `${w.id}: ${w.riseC ? `+${w.riseC} °C` : `${Math.round(w.ageRatio * 100)}% life`}; ${w.racks} racks; replace by ${w.replaceBy}.`),
      Switchover: sw ? [`Peer of the failed asset (${sw.asset}) out of service: ${sw.verdict}.`, `${sw.singlePath} racks single-path; ${sw.lostWithAlerts} lost given open alerts.`, ...sw.conditions.slice(0, 2)] : ["No switchover pending."],
    } as Record<Brief, string[]>;
  }, [s, runbooks]);

  if (!s || !briefs) return <Loading />;
  const ups = s.assets.find((a) => a.type === "ups")?.id;
  const SUGGEST = [`What depends on ${ups}?`, "How much capacity is stranded?", "Explain the open incident", "Which batteries are drifting?"];
  const ask = (text: string) => {
    if (!text.trim()) return;
    const r = answer(s, text, runbooks);
    setChat((c) => [...c, { q: text, a: r.text, facts: r.facts }]);
    setInput("");
    log("Asked copilot", `${s.site.id}: ${text}`, r.facts.join("; "));
  };
  const hits = search(s, q, runbooks);

  return (
    <>
      <ConsoleTitle eyebrow={`AI briefing and copilot · Orchestrator · ${s.site.id}`} title="Briefs and answers, every figure from an engine" sub="Gemini Pro plans and Flash writes around fact IDs. Any stray number is rejected and a template answer is the fallback." />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel title="Briefs" action={<div className="flex flex-wrap gap-1">{(Object.keys(briefs) as Brief[]).map((b) => <button key={b} onClick={() => setBrief(b)} className={cn("rounded-full px-3 py-1 text-xs font-medium", brief === b ? "bg-brand-blue text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>{b}</button>)}</div>}>
          <ul className="space-y-3">{briefs[brief].map((b, i) => <li key={i} className="flex gap-2 text-sm leading-relaxed text-slate-700"><span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-blue" />{b}</li>)}</ul>
        </Panel>
        <Panel title="Ask EAiQ" asOf={false} action={<span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-semibold text-brand-blue"><Sparkles className="h-3 w-3" /> Guarded answers</span>}>
          <div className="max-h-72 min-h-[120px] space-y-3 overflow-y-auto">
            {chat.length === 0 && <div className="flex flex-wrap gap-2">{SUGGEST.map((x) => <button key={x} onClick={() => ask(x)} className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:border-brand-blue hover:bg-brand-soft hover:text-brand-blue"><Sparkles className="h-3 w-3 text-brand-violet" />{x}</button>)}</div>}
            {chat.map((c, i) => (
              <div key={i}>
                <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-brand-blue px-3 py-2 text-sm text-white">{c.q}</p>
                <div className="mt-2 max-w-[90%] rounded-2xl rounded-bl-sm bg-slate-100 px-3 py-2">
                  <p className="text-sm text-slate-800">{c.a}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1">{c.facts.map((f) => <code key={f} className="rounded bg-white px-1.5 py-0.5 text-[10px] text-slate-500">{f}</code>)}</div>
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); ask(input); }} className="mt-4 flex gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={`e.g. "What depends on ${ups}?"`} className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-blue focus:shadow-[0_0_0_3px_rgba(26,58,143,0.12)]" />
            <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-blue text-white hover:scale-105"><Send className="h-4 w-4" /></button>
          </form>
        </Panel>
      </div>
      <Panel title="Semantic search · S1" className="mt-4" action={<span className="text-[11px] text-slate-400">Runbooks and incidents · the copilot reuses this index</span>}>
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 focus-within:border-brand-blue"><Search className="h-4 w-4 text-slate-400" /><input value={q} onChange={(e) => setQ(e.target.value)} className="flex-1 bg-transparent text-sm outline-none" /></div>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          {hits.length ? hits.map((h, i) => (
            <Link key={h.title} href={h.href} className="rounded-lg border border-slate-200 p-3 hover:border-blue-200 hover:shadow-card-hover">
              <div className="flex items-center gap-2"><span className="text-xs font-bold text-slate-400">{i + 1}</span><span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">{h.kind}</span></div>
              <p className="mt-1.5 text-sm font-semibold text-slate-800">{h.title}</p>
              <p className="mt-0.5 text-xs text-slate-500">Why: {h.reason}</p>
              <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand-blue">Open <ArrowRight className="h-3 w-3" /></span>
            </Link>
          )) : <p className="text-sm text-slate-500">No match is good enough — S1 says so rather than guessing.</p>}
        </div>
      </Panel>
    </>
  );
}
