import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { SchemaGraph } from "@/components/ontology/SchemaGraph";
import { CtaSoft, PageHero, Section, SectionHeader } from "@/components/ui/primitives";
import { GROUP_COLOR, TYPE_GROUP, schema } from "@/data/ontology";

export default function SchemaPage() {
  return (
    <>
      <PageHero
        crumb={<Breadcrumb items={[{ label: "Ontology", href: "/ontology" }, { label: "Schema" }]} />}
        eyebrow="Schema reference"
        title={`${schema.stats.nodeTables} node tables, ${schema.stats.edgeTables} edge tables`}
        intro="Every node and edge table in the EAiQ property graph, with its row count and properties — hover any type on the map to trace it, click to lock."
      />
      <Section alt>
        <SchemaGraph />
      </Section>
      <Section>
        <SectionHeader eyebrow="Node tables" title="What the graph holds" />
        <div className="no-scrollbar overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-card">
          <table className="w-full min-w-[720px] text-sm">
            <thead><tr className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-400"><th className="px-4 py-3">Node</th><th>Rows</th><th>Properties</th></tr></thead>
            <tbody>
              {schema.nodeTypes.map((t) => (
                <tr key={t.type} className="border-t border-slate-100 align-top">
                  <td className="px-4 py-2.5"><span className="inline-flex items-center gap-2 font-semibold text-slate-800"><span className="h-2 w-2 rounded-full" style={{ background: GROUP_COLOR[TYPE_GROUP[t.type] ?? "shared"] }} />{t.type}</span></td>
                  <td className="py-2.5 pr-4 font-semibold text-brand-blue">{t.count.toLocaleString("en-IN")}</td>
                  <td className="py-2.5 pr-4 text-xs text-slate-500">{t.props.join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
      <Section alt>
        <SectionHeader eyebrow="Edge tables" title="How it connects" />
        <div className="no-scrollbar overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-card">
          <table className="w-full min-w-[760px] text-sm">
            <thead><tr className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-400"><th className="px-4 py-3">Edge</th><th>Rows</th><th>From → To</th><th>Example</th><th>Properties</th></tr></thead>
            <tbody>
              {schema.edgeTypes.map((e) => (
                <tr key={e.type} className="border-t border-slate-100 align-top">
                  <td className="px-4 py-2.5 font-mono text-xs font-semibold text-slate-800">{e.type}</td>
                  <td className="py-2.5 pr-4 font-semibold text-brand-blue">{e.count.toLocaleString("en-IN")}</td>
                  <td className="py-2.5 pr-4 text-xs text-slate-600">{e.ends.map((x) => `${x.from} → ${x.to}`).join(", ")}</td>
                  <td className="py-2.5 pr-4 font-mono text-[11px] text-slate-400">{e.example}</td>
                  <td className="py-2.5 pr-4 text-xs text-slate-500">{e.props.join(", ") || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
      <CtaSoft title="Want to see a node in context?" body="Search any of the 7,202 nodes and walk its edges in the explorer." cta={{ label: "Open the explorer", href: "/ontology/explorer" }} />
    </>
  );
}
