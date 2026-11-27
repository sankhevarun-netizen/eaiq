import { Suspense } from "react";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { NodeExplorer } from "@/components/ontology/NodeExplorer";
import { PageHero, Section } from "@/components/ui/primitives";

export default function ExplorerPage() {
  return (
    <>
      <PageHero
        crumb={<Breadcrumb items={[{ label: "Ontology", href: "/ontology" }, { label: "Explorer" }]} />}
        eyebrow="Node explorer"
        title="Walk the graph, one edge at a time"
        intro="Search any node, read its properties, and follow its edges — from a PDU to the racks it powers, the servers in them, the applications they run and the tenants who lease them."
      />
      <Section alt>
        <Suspense fallback={<p className="text-sm text-slate-400">Loading…</p>}>
          <NodeExplorer />
        </Suspense>
      </Section>
    </>
  );
}
