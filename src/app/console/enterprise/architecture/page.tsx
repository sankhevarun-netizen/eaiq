"use client";

import { Check, X } from "lucide-react";
import { ConsoleTitle, Kpi, Panel } from "@/components/console/ConsoleShell";
import { apps } from "@/data/demo/enterprise";

const DOMAINS = [
  { k: "Business", code: "B" },
  { k: "Data", code: "D" },
  { k: "Application", code: "A" },
  { k: "Technology", code: "T" },
];

export default function ArchitecturePage() {
  return (
    <>
      <ConsoleTitle eyebrow="Stack analysis and TOGAF comparison · E1 (asks S1)" title="Every application checked against TOGAF" sub="Languages, frameworks, hosting, data stores and integrations, checked across business, data, application and technology. Every number traces to an engine fact ID." />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {DOMAINS.map((d) => {
          const fails = apps.reduce((s, a) => s + a.togafFails.filter((f) => f.startsWith(d.code + "-")).length, 0);
          return <Kpi key={d.k} label={`${d.k} fails`} value={fails} tone={fails ? "warn" : "good"} />;
        })}
      </div>
      <Panel title="Stack vs TOGAF" className="mt-4">
        <div className="no-scrollbar overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead><tr className="text-left text-xs uppercase tracking-wider text-slate-400"><th className="py-2">Application</th><th>Languages / frameworks</th><th>Hosting</th><th>Data stores</th>{DOMAINS.map((d) => <th key={d.k} className="text-center">{d.k}</th>)}</tr></thead>
            <tbody>
              {apps.map((a, i) => (
                <tr key={a.id} className="border-t border-slate-100">
                  <td className="py-2.5 font-semibold text-slate-800">{a.name}</td>
                  <td className="text-slate-600">{a.stack.join(", ")}</td>
                  <td className="text-slate-600">{a.hosting}</td>
                  <td className="text-slate-600">{a.dataStores.join(", ")}{a.unsupported && <span className="ml-1 rounded bg-red-50 px-1 text-[10px] font-semibold text-red-600">unsupported</span>}</td>
                  {DOMAINS.map((d, j) => {
                    const f = a.togafFails.find((x) => x.startsWith(d.code + "-"));
                    return <td key={d.k} className="text-center" title={f ? `${f} · fact F-${1000 + i * 10 + j}` : undefined}>{f ? <X className="mx-auto h-4 w-4 text-red-500" /> : <Check className="mx-auto h-4 w-4 text-brand-green" />}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[11px] text-slate-400">Hover a failed check to see its rule and engine fact ID. Standards are read by S1 from the standards catalogue, ADRs and drawings.</p>
      </Panel>
    </>
  );
}
