"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { experienceBoxes, holistic, sides, trustBoxes, type BoxKind } from "@/data/blueprint";

const kindCls: Record<BoxKind, string> = {
  dc: "border-brand-blue/50 bg-brand-soft/60",
  enterprise: "border-brand-green/50 bg-green-50/70",
  shared: "border-amber-300 bg-amber-50/60",
  person: "border-dashed border-orange-400 bg-orange-50/40",
  neutral: "border-slate-200 bg-white",
  sor: "border-dashed border-slate-300 bg-white",
};

function Box({ title, sub, kind = "neutral", dim, onEnter, onLeave, onClick, active, href }: { title: string; sub?: string; kind?: BoxKind; dim?: boolean; onEnter?: () => void; onLeave?: () => void; onClick?: () => void; active?: boolean; href?: string }) {
  const inner = (
    <div
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onClick={onClick}
      className={cn("h-full rounded-lg border px-3 py-2 text-center transition-all", kindCls[kind], dim && "opacity-25", active && "ring-2 ring-brand-blue", (onClick || href) && "cursor-pointer")}
    >
      <p className="text-xs font-semibold text-slate-800">{title}</p>
      {sub && <p className="mt-0.5 text-[11px] leading-snug text-slate-500">{sub}</p>}
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

function Layer({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
      <p className="text-sm font-semibold text-slate-800">{title}</p>
      {note && <p className="text-xs text-slate-500">{note}</p>}
      <div className="mt-3">{children}</div>
    </div>
  );
}

function Arrow({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center gap-1.5 py-2 text-xs text-slate-500">
      <ArrowUpDown className="h-3.5 w-3.5" /> {label}
    </div>
  );
}

function Legend({ items }: { items: { k: BoxKind; l: string }[] }) {
  return (
    <div className="flex flex-wrap gap-4">
      {items.map((i) => (
        <span key={i.l} className="inline-flex items-center gap-1.5 text-xs text-slate-600">
          <span className={cn("h-3 w-3 rounded border", kindCls[i.k])} /> {i.l}
        </span>
      ))}
    </div>
  );
}

const VIEWS = ["Holistic", "DC side", "Enterprise side"] as const;
type View = (typeof VIEWS)[number];

export function Blueprint() {
  const [view, setView] = useState<View>("Holistic");
  const [hover, setHover] = useState<number | null>(null);
  const [lock, setLock] = useState<number | null>(null);
  const active = lock ?? hover;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card lg:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-1.5">
          {VIEWS.map((v) => (
            <button key={v} onClick={() => { setView(v); setLock(null); }} className={cn("rounded-full px-4 py-2 text-sm font-medium transition-all", view === v ? "bg-brand-blue text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>
              {v}
            </button>
          ))}
        </div>
        {view === "Holistic" ? (
          <Legend items={[{ k: "dc", l: "DC pack" }, { k: "enterprise", l: "Enterprise pack" }, { k: "shared", l: "Shared by both" }, { k: "person", l: "A person decides" }]} />
        ) : (
          <Legend items={[{ k: "neutral", l: "Agent" }, { k: view === "DC side" ? "dc" : "enterprise", l: "Engine on Cloud Run" }, { k: "person", l: "A person decides" }, { k: "shared", l: "Assumed agent: confirm its scope" }]} />
        )}
      </div>

      <div className="space-y-1">
        <Layer title="Trust: on every call and every layer">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {trustBoxes.map((b) => <Box key={b.title} {...b} />)}
          </div>
        </Layer>
        <Layer title="Experience: people and channels">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {experienceBoxes.map((b) => <Box key={b.title} {...b} />)}
          </div>
        </Layer>
        <Arrow label="one front door" />

        {view === "Holistic" ? (
          <>
            <Layer title="Intelligence: one orchestrator, two packs, two shared agents">
              <div className="rounded-lg border-2 border-slate-700 bg-white px-3 py-2 text-center">
                <p className="text-sm font-bold text-slate-900">{holistic.orchestrator.title}</p>
                <p className="text-xs text-slate-500">{holistic.orchestrator.sub}</p>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="rounded-lg border-2 border-brand-blue/50 p-3">
                  <p className="mb-2 text-xs font-bold text-slate-800">{holistic.dcPack.title}</p>
                  <div className="space-y-1.5">{holistic.dcPack.items.map((t) => <Box key={t} title={t} kind="dc" />)}</div>
                </div>
                <div className="p-3">
                  <p className="mb-2 text-xs font-bold text-slate-800">{holistic.shared.title}</p>
                  <div className="space-y-1.5">{holistic.shared.items.map((t) => <Box key={t.t} title={t.t} sub={t.s} kind="shared" />)}</div>
                </div>
                <div className="rounded-lg border-2 border-brand-green/50 p-3">
                  <p className="mb-2 text-xs font-bold text-slate-800">{holistic.entPack.title}</p>
                  <div className="space-y-1.5">{holistic.entPack.items.map((t) => <Box key={t} title={t} kind="enterprise" />)}</div>
                </div>
              </div>
              <div className="mt-3"><Box title={holistic.gate.title} sub={holistic.gate.sub} kind="person" /></div>
            </Layer>
            <Arrow label="ask engines for every figure backed by deterministic logics" />
            <Layer title="Engines on Cloud Run: every figure is computed here">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">{holistic.engines.map((b) => <Box key={b.title} {...b} />)}</div>
            </Layer>
            <Arrow label="engines read the data" />
            <Layer title="Data: one graph, one warehouse, one log">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">{holistic.data.map((b) => <Box key={b.title} {...b} />)}</div>
            </Layer>
            <Arrow label="normalise and load" />
            <Layer title="Ingest: read-only, normalise once">
              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">{holistic.ingest.map((b) => <Box key={b.title} {...b} />)}</div>
            </Layer>
          </>
        ) : (
          (() => {
            const s = view === "DC side" ? sides.dc : sides.enterprise;
            return (
              <>
                <Layer title="Intelligence: one orchestrator and six agents" note={s.intelligenceNote}>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Hover an agent to trace it to its engine, click to lock.</span>
                    {lock !== null && <button onClick={() => setLock(null)} className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-semibold text-brand-blue">Unlock <X className="h-3 w-3" /></button>}
                  </div>
                  <div className="rounded-lg border-2 border-slate-700 bg-white px-3 py-2 text-center">
                    <p className="text-sm font-bold text-slate-900">Orchestrator: the only door</p>
                    <p className="text-xs text-slate-500">checks every figure against engine facts; the template answer is the fallback</p>
                  </div>
                  <div className="no-scrollbar mt-3 overflow-x-auto">
                    <div className="grid min-w-[720px] grid-cols-6 gap-2">
                      {s.pairs.map((p, i) => (
                        <Box key={p.agent.title} title={p.agent.title} sub={p.agent.sub} kind={"assumed" in p && p.assumed ? "shared" : p.kind === "shared" ? "shared" : "neutral"} href={`/agents/${p.agent.link}`} dim={active !== null && active !== i} active={active === i} onEnter={() => setHover(i)} onLeave={() => setHover(null)} />
                      ))}
                      {s.pairs.map((p, i) => (
                        <Box key={p.engine.title + i} title={p.engine.title} sub={p.engine.sub} kind={p.kind === "shared" ? "shared" : view === "DC side" ? "dc" : "enterprise"} dim={active !== null && active !== i} active={active === i} onEnter={() => setHover(i)} onLeave={() => setHover(null)} onClick={() => setLock((l) => (l === i ? null : i))} />
                      ))}
                    </div>
                  </div>
                  <div className="mt-3"><Box title="Executor and human gate" sub={s.gate} kind="person" /></div>
                </Layer>
                <Arrow label="engines read the data" />
                <Layer title="Data: one graph, one warehouse, one log">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">{s.data.map((b) => <Box key={b.title} {...b} />)}</div>
                </Layer>
                <Arrow label="normalise and load" />
                <Layer title="Ingest: read-only, normalise once">
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-4">{s.ingest.map((b) => <Box key={b.title} {...b} />)}</div>
                </Layer>
                <Arrow label="read only" />
                <Layer title="Client systems of record: read-only access">
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-5">{s.sor.map((b) => <Box key={b.title} title={b.title} sub={b.sub} kind={b.kind ?? "sor"} />)}</div>
                </Layer>
                <p className="pt-4 text-base text-slate-700">{s.caption}</p>
              </>
            );
          })()
        )}
      </div>
    </div>
  );
}
