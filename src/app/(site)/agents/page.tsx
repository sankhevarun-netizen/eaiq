import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { AgentGrid } from "@/components/home/AgentGrid";
import { CtaSoft, PageHero, Section, StatTile } from "@/components/ui/primitives";

export default function AgentsPage() {
  return (
    <>
      <PageHero
        crumb={<Breadcrumb items={[{ label: "Agents" }]} />}
        eyebrow="Intelligence: one orchestrator, two packs, two shared agents"
        title="One job, one engine each, at most two agents deep"
        intro="Gemini explains in each; the orchestrator writes every answer and specialists never call it back. Every figure is computed by an engine on Cloud Run, and a person approves before anything changes."
      >
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatTile value="4" label="DC specialists" sub="D1–D4 · the facility" />
          <StatTile value="4" label="Enterprise specialists" sub="E1–E4 · the estate" />
          <StatTile value="2" label="Shared agents" sub="S1 Knowledge, S2 Graph curator" />
          <StatTile value="1" label="Human gate" sub="Workflows waits for a person" />
        </div>
      </PageHero>
      <Section alt>
        <AgentGrid />
      </Section>
      <CtaSoft title="Want to see the agents at work?" body="Every agent is wired into the console on the Nexus Mumbai-1 reference set." cta={{ label: "Open Console", href: "/console/dc/command" }} />
    </>
  );
}
