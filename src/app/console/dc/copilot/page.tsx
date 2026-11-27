"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Search, Send, Sparkles } from "lucide-react";
import { ConsoleTitle, Panel } from "@/components/console/ConsoleShell";
import { useConsole } from "@/components/providers/ConsoleStore";
import { copilotAnswer, dailyBrief, incidents, searchIndex, switchoverScenarios, watchlist } from "@/data/demo/nexusMumbai1";
import { cn } from "@/lib/utils";

const BRIEFS = {
  Daily: dailyBrief,
  Incident: [`${incidents[0].id}: ${incidents[0].alarms} alarms grouped into one incident; top cause ${incidents[0].rootCause} (${incidents[0].confidence}).`, `Blast radius rows ${incidents[0].blast.rows.join(", ")}, ${incidents[0].blast.racks} racks, ${incidents[0].blast.tenants.join(" and ")}.`, `Next step: ${incidents[0].nextStep.step} — owner ${incidents[0].nextStep.owner}, due ${incidents[0].nextStep.due}.`],
  Risk: watchlist.slice(0, 3).map((w) => `${w.asset}: ${w.drift}; EoL ${w.eolScore}; act by ${w.actBy}. Exposure: ${w.exposure}.`),
  Switchover: [`${switchoverScenarios[0].label}: ${switchoverScenarios[0].verdict}.`, ...switchoverScenarios[0].conditions, `Safest window ${switchoverScenarios[0].windows[0].date} ${switchoverScenarios[0].windows[0].time}.`],
};

const SUGGEST = ["What depends on UPS-1?", "What depends on Feed A?", "How much capacity is stranded?", "Explain the open incident"];

export default function CopilotPage() {
  const { log } = useConsole();
  const [brief, setBrief] = useState<keyof typeof BRIEFS>("Daily");
  const [input, setInput] = useState("");
  const [chat, setChat] = useState<{ q: string; a: string; facts: string[] }[]>([]);
  const [search, setSearch] = useState("Battery getting hot");
  const hits = searchIndex.find((s) => search.toLowerCase().includes(s.q.split(" ")[0]))?.results ?? [];

  const ask = (q: string) => {
    if (!q.trim()) return;
    const r = copilotAnswer(q);
    setChat((c) => [...c, { q, a: r.text, facts: r.facts }]);
    setInput("");
    log("Asked copilot", q, r.facts.join("; "));
  };

  return (
    <>
      <ConsoleTitle eyebrow="AI briefing and copilot · Orchestrator" title="Briefs and answers, every figure from an engine" sub="Gemini Pro plans and Flash writes around fact IDs. Any stray number is rejected and a template answer is the fallback." />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel title="Briefs" action={
          <div className="flex gap-1">{(Object.keys(BRIEFS) as (keyof typeof BRIEFS)[]).map((b) => <button key={b} onClick={() => setBrief(b)} className={cn("rounded-full px-3 py-1 text-xs font-medium", brief === b ? "bg-brand-blue text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>{b}</button>)}</div>
        }>
          <ul className="space-y-3">{BRIEFS[brief].map((b, i) => <li key={i} className="flex gap-2 text-sm leading-relaxed text-slate-700"><span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-blue" />{b}</li>)}</ul>
        </Panel>

        <Panel title="Ask EAiQ" asOf={false} action={<span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-semibold text-brand-blue"><Sparkles className="h-3 w-3" /> Guarded answers</span>}>
          <div className="max-h-72 min-h-[120px] space-y-3 overflow-y-auto">
            {chat.length === 0 && <div className="flex flex-wrap gap-2">{SUGGEST.map((s) => <button key={s} onClick={() => ask(s)} className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:border-brand-blue hover:bg-brand-soft hover:text-brand-blue"><Sparkles className="h-3 w-3 text-brand-violet" />{s}</button>)}</div>}
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
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder='e.g. "What depends on UPS-1?"' className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-blue focus:shadow-[0_0_0_3px_rgba(26,58,143,0.12)]" />
            <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-blue text-white hover:scale-105"><Send className="h-4 w-4" /></button>
          </form>
        </Panel>
      </div>

      <Panel title="Semantic search · S1" className="mt-4" action={<span className="text-[11px] text-slate-400">Gemini Embedding · pgvector — the copilot reuses this index</span>}>
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 focus-within:border-brand-blue">
          <Search className="h-4 w-4 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 bg-transparent text-sm outline-none" />
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          {hits.length ? hits.map((h, i) => (
            <Link key={h.title} href={h.href} className="group rounded-lg border border-slate-200 p-3 hover:border-blue-200 hover:shadow-card-hover">
              <div className="flex items-center gap-2"><span className="text-xs font-bold text-slate-400">{i + 1}</span><span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", h.kind === "External advisory" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600")}>{h.kind}</span></div>
              <p className="mt-1.5 text-sm font-semibold text-slate-800">{h.title}</p>
              <p className="mt-0.5 text-xs text-slate-500">Why: {h.reason}</p>
              <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand-blue">Open <ArrowRight className="h-3 w-3" /></span>
            </Link>
          )) : <p className="text-sm text-slate-500">No match is good enough — S1 says so rather than guessing. Try “battery getting hot” or “chiller trip”.</p>}
        </div>
      </Panel>
    </>
  );
}
