"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import { agents } from "@/data/agents";
import { questions } from "@/data/questions";
import { dcFeatures, enterpriseFeatures } from "@/data/features";
import { copilotAnswer, searchIndex } from "@/data/demo/nexusMumbai1";
import { AgentCodeChip } from "@/components/ui/primitives";

function score(text: string, terms: string[]) {
  const t = text.toLowerCase();
  return terms.reduce((s, w) => s + (t.includes(w) ? 1 : 0), 0);
}

export function SearchResults() {
  const sp = useSearchParams();
  const router = useRouter();
  const q = sp.get("q") ?? "";
  const [input, setInput] = useState(q);
  const terms = q.toLowerCase().split(/\W+/).filter((w) => w.length > 2);

  const rank = <T,>(items: T[], text: (x: T) => string) =>
    terms.length ? items.map((x) => ({ x, s: score(text(x), terms) })).filter((r) => r.s > 0).sort((a, b) => b.s - a.s).map((r) => r.x) : [];

  const ag = rank(agents, (a) => `${a.code} ${a.title} ${a.description} ${a.does} ${a.engine}`);
  const qs = rank(questions, (x) => `${x.question} ${x.systems} ${x.whyFail}`);
  const fs = rank([...dcFeatures, ...enterpriseFeatures], (f) => `${f.title} ${f.gets}`);
  const sem = searchIndex.find((s) => q.toLowerCase().includes(s.q.split(" ")[0]))?.results ?? [];
  const answer = q ? copilotAnswer(q) : null;

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          router.push(`/search?q=${encodeURIComponent(input)}`);
        }}
        className="flex max-w-2xl items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-card focus-within:border-brand-blue focus-within:shadow-[0_0_0_3px_rgba(26,58,143,0.12)]"
      >
        <Search className="h-5 w-5 text-slate-400" />
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Search agents, features and questions" className="flex-1 bg-transparent text-sm outline-none" />
        <button className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-blue text-white hover:scale-105"><ArrowRight className="h-4 w-4" /></button>
      </form>

      {q && answer && answer.facts[0] !== "template.fallback" && (
        <div className="mt-8 rounded-xl border border-brand-blue/20 bg-brand-soft/60 p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-blue">EAiQ answer</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-800">{answer.text}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">{answer.facts.map((f) => <code key={f} className="rounded bg-white px-1.5 py-0.5 text-[11px] text-slate-500">{f}</code>)}</div>
        </div>
      )}

      {q && (
        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-2">
          {sem.length > 0 && (
            <ResultGroup title="Runbooks and incidents">
              {sem.map((r) => (
                <Link key={r.title} href={r.href} className="block rounded-xl border border-slate-200 bg-white p-4 shadow-card hover:border-blue-200 hover:shadow-card-hover">
                  <div className="flex items-center gap-2"><span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">{r.kind}</span><p className="text-sm font-semibold text-slate-800">{r.title}</p></div>
                  <p className="mt-1 text-xs text-slate-500">{r.reason}</p>
                </Link>
              ))}
            </ResultGroup>
          )}
          <ResultGroup title={`Agents (${ag.length})`}>
            {ag.map((a) => (
              <Link key={a.id} href={`/agents/${a.id}`} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-card hover:border-blue-200 hover:shadow-card-hover">
                <AgentCodeChip code={a.code} />
                <div><p className="text-sm font-semibold text-slate-800">{a.title}</p><p className="mt-0.5 text-xs text-slate-500">{a.description}</p></div>
              </Link>
            ))}
          </ResultGroup>
          <ResultGroup title={`Questions (${qs.length})`}>
            {qs.map((x) => (
              <Link key={x.n} href="/questions" className="block rounded-xl border border-slate-200 bg-white p-4 shadow-card hover:border-blue-200 hover:shadow-card-hover">
                <p className="text-sm font-semibold text-slate-800">{x.n}. {x.question}</p>
              </Link>
            ))}
          </ResultGroup>
          <ResultGroup title={`Features (${fs.length})`}>
            {fs.map((f) => (
              <Link key={f.id} href={f.consoleHref ?? "/agents"} className="block rounded-xl border border-slate-200 bg-white p-4 shadow-card hover:border-blue-200 hover:shadow-card-hover">
                <p className="text-sm font-semibold text-slate-800">{f.title}</p>
                <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{f.gets}</p>
              </Link>
            ))}
          </ResultGroup>
        </div>
      )}
    </div>
  );
}

function ResultGroup({ title, children }: { title: string; children: React.ReactNode }) {
  const arr = Array.isArray(children) ? children : [children];
  return (
    <div>
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">{title}</h2>
      <div className="space-y-3">{arr.length ? children : <p className="text-sm text-slate-400">No matches.</p>}</div>
    </div>
  );
}
