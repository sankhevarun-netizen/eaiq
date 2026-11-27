"use client";

import { ConsoleTitle, Kpi, Panel } from "@/components/console/ConsoleShell";
import { Loading } from "@/components/console/Loading";
import { useEnterprise } from "@/lib/consoleData";
import { cn } from "@/lib/utils";

export default function ArchitecturePage() {
  const e = useEnterprise();
  if (!e) return <Loading what="enterprise data" />;
  const allTech = new Map<string, { name: string; eol: string; past: boolean; apps: string[] }>();
  for (const a of e.apps) for (const t of a.techs) {
    const x = allTech.get(t.id) ?? { name: t.name, eol: t.eol, past: t.past, apps: [] };
    x.apps.push(a.name);
    allTech.set(t.id, x);
  }
  const eol = [...allTech.values()].filter((t) => t.past).sort((a, b) => b.apps.length - a.apps.length);
  const devTotal = e.standards.reduce((x, s) => x + (s.deviations ?? 0), 0);

  return (
    <>
      <ConsoleTitle eyebrow={`Stack analysis and TOGAF comparison · E1 (asks S1) · ${e.enterprise.name}`} title="Every application checked against its standards" sub="Languages, frameworks, hosting and data stores, checked against the enterprise's own technology standards and real end-of-life dates (endoflife.date)." />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Standards" value={e.standards.length} />
        <Kpi label="Deviations" value={devTotal} tone={devTotal ? "warn" : "good"} />
        <Kpi label="End-of-life versions in use" value={eol.length} tone="bad" />
        <Kpi label="Apps on EOL tech" value={e.apps.filter((a) => a.eolTechs).length} sub={`of ${e.apps.length}`} tone="warn" />
      </div>

      <Panel title="Standards and deviations" className="mt-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {e.standards.map((s) => (
            <div key={s.id} className="rounded-lg border border-slate-200 p-4">
              <p className="text-sm font-semibold text-slate-800">{s.name}</p>
              <p className="text-[11px] text-slate-400">{s.framework}</p>
              <p className={cn("mt-3 text-2xl font-extrabold", s.deviations ? "text-amber-600" : "text-brand-green")}>{s.deviations ?? 0}</p>
              <p className="text-xs text-slate-500">applications not conforming</p>
              {s.governs.length > 0 && <p className="mt-2 text-[11px] text-slate-500">Governs: {s.governs.join(", ")}</p>}
            </div>
          ))}
        </div>
      </Panel>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel title="End-of-life versions and who runs them">
          <div className="no-scrollbar max-h-[480px] overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white"><tr className="text-left text-xs uppercase tracking-wider text-slate-400"><th className="py-2">Version</th><th>EOL date</th><th>Apps</th></tr></thead>
              <tbody>{eol.map((t) => <tr key={t.name} className="border-t border-slate-100 align-top"><td className="py-2 font-semibold text-red-600">{t.name}</td><td className="whitespace-nowrap text-slate-600">{t.eol}</td><td className="text-xs text-slate-600">{t.apps.slice(0, 6).join(", ")}{t.apps.length > 6 ? ` +${t.apps.length - 6}` : ""}</td></tr>)}</tbody>
            </table>
          </div>
        </Panel>
        <Panel title="Applications by debt">
          <div className="no-scrollbar max-h-[480px] overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white"><tr className="text-left text-xs uppercase tracking-wider text-slate-400"><th className="py-2">Application</th><th>Tier</th><th>Stack</th><th>Debt</th></tr></thead>
              <tbody>{[...e.apps].sort((a, b) => b.scores.debt - a.scores.debt).slice(0, 40).map((a) => (
                <tr key={a.id} className="border-t border-slate-100 align-top"><td className="py-2 font-semibold text-slate-800">{a.name}</td><td>{a.tier}</td><td className="text-xs text-slate-500">{a.techs.map((t) => t.name).slice(0, 4).join(", ")}</td><td className={cn("font-bold", a.scores.debt > 50 ? "text-red-600" : a.scores.debt ? "text-amber-600" : "text-brand-green")}>{a.scores.debt}%</td></tr>
              ))}</tbody>
            </table>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">Debt = share of an application&apos;s technology versions past end of life. Every number traces to an engine fact.</p>
        </Panel>
      </div>
    </>
  );
}
