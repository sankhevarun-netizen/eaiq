import Link from "next/link";
import { ArrowRight, Building2, MessagesSquare, Network, Search } from "lucide-react";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { SchemaGraph } from "@/components/ontology/SchemaGraph";
import { Card, CtaGradient, PageHero, Reveal, Section, SectionHeader, StatTile, Takeaway } from "@/components/ui/primitives";
import { GROUP_COLOR, TYPE_GROUP, ontologyIntro, schema } from "@/data/ontology";

const n = (x: number) => x.toLocaleString("en-IN");

export default function OntologyPage() {
  const s = schema.stats;
  return (
    <>
      <PageHero crumb={<Breadcrumb items={[{ label: "Ontology" }]} />} eyebrow={ontologyIntro.eyebrow} title={ontologyIntro.title} intro={ontologyIntro.intro}>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
          <StatTile value={s.nodeTables} label="Node types" />
          <StatTile value={s.edgeTables} label="Edge types" />
          <StatTile value={n(s.nodes)} label="Nodes" />
          <StatTile value={n(s.edges)} label="Edges" />
          <StatTile value={`${(s.factRows / 1e6).toFixed(2)}M`} label="Fact rows" sub="13 time-series and event tables" />
          <StatTile value={s.violations} label="Violations" sub={`${n(s.checks)} integrity checks`} />
        </div>
      </PageHero>

      <Section alt>
        <SectionHeader eyebrow="Schema map" title="How the facility connects to the estate" sub="Hover any node type to trace it, click to lock." />
        <SchemaGraph />
      </Section>

      <Section>
        <SectionHeader eyebrow="Explore" title="Go deeper into the graph" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { href: "/ontology/explorer", icon: Search, t: "Node explorer", d: "Search any of 7,202 nodes and walk its edges." },
            { href: "/ontology/schema", icon: Network, t: "Schema reference", d: "Every node and edge table with its properties." },
            { href: "/ontology/estate", icon: Building2, t: "The estate", d: "Six data centres and three enterprises." },
            { href: "/ontology/answers", icon: MessagesSquare, t: "Answers on the dataset", d: "The 20 questions answered from the graph." },
          ].map((c, i) => (
            <Reveal key={c.href} index={i}>
              <Link href={c.href} className="group block h-full">
                <Card className="h-full p-6">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand-blue"><c.icon className="h-5 w-5" /></div>
                  <h3 className="text-base font-semibold text-slate-800">{c.t}</h3>
                  <p className="mt-1 text-sm text-slate-500">{c.d}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand-blue group-hover:gap-2.5">Open <ArrowRight className="h-3.5 w-3.5" /></span>
                </Card>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section alt>
        <SectionHeader eyebrow="Fact tables" title={`Time series and events, ${(s.factRows / 1e6).toFixed(2)}M rows`} sub={schema.factNote} />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {schema.factTables.map((f) => (
            <div key={f.table} className="rounded-xl border border-slate-200 bg-white p-4 shadow-card">
              <div className="flex items-baseline justify-between gap-3">
                <code className="text-sm font-semibold text-slate-800">{f.table}</code>
                <span className="text-xs font-bold text-brand-blue">{n(f.rows)} rows</span>
              </div>
              <p className="mt-1.5 text-xs text-slate-500">{f.columns.join(", ")}</p>
              <p className="mt-1 text-[11px] text-slate-400">{f.links}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-slate-400">{schema.keptNote}</p>
        <Takeaway>{ontologyIntro.synthetic}</Takeaway>
        <div className="mt-6 flex flex-wrap gap-3 text-xs text-slate-500">
          {(["dc", "shared", "enterprise"] as const).map((g) => (
            <span key={g} className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: GROUP_COLOR[g] }} />{schema.nodeTypes.filter((t) => TYPE_GROUP[t.type] === g).length} {g === "dc" ? "facility" : g} types</span>
          ))}
        </div>
      </Section>

      <CtaGradient eyebrow="Node explorer" title="Walk the graph from a rack to the boardroom" body="Start at the planted MUM1 PDU trip and follow its edges to the racks, servers, applications and tenants it reaches." pills={["Spanner Graph", "GQL", "7,202 nodes", "17,901 edges"]} cta={{ label: "Open the explorer", href: "/ontology/explorer?id=MUM1-PDU-H1-B2" }} />
    </>
  );
}
