import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { SolutionFlow } from "@/components/story/SolutionFlow";
import { CtaGradient, PageHero, Section, Takeaway } from "@/components/ui/primitives";
import { solution } from "@/data/story";

export default function SolutionPage() {
  return (
    <>
      <PageHero
        crumb={<Breadcrumb items={[{ label: "Story" }, { label: "Our solution" }]} />}
        eyebrow={solution.eyebrow}
        title={solution.title}
        intro="Every system of record is mapped once into a knowledge graph. The EAiQ AI Brain orchestrates specialist agents over it, and the executor recommends and records each change — hover any node to trace it, click to lock."
      />
      <Section alt>
        <SolutionFlow />
        <Takeaway>{solution.takeaway}</Takeaway>
      </Section>
      <CtaGradient
        eyebrow="How it works"
        title="One intelligent reasoning layer across systems"
        body="Follow a signal from the estate through the systems of record, the knowledge graph and the decision, to a governed execution."
        pills={["Sense", "Connect", "Correlate", "Predict", "Decide", "Control"]}
        cta={{ label: "See how it works", href: "/how-it-works" }}
      />
    </>
  );
}
