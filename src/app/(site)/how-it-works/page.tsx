import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { PipelineSteps, ReasoningFlow } from "@/components/story/ReasoningFlow";
import { CtaSoft, PageHero, Section, Takeaway } from "@/components/ui/primitives";
import { howItWorks } from "@/data/story";

export default function HowItWorksPage() {
  return (
    <>
      <PageHero
        crumb={<Breadcrumb items={[{ label: "Why EAiQ", href: "/problem" }, { label: "How it works" }]} />}
        eyebrow={howItWorks.eyebrow}
        title={howItWorks.title}
        intro="From estate components through the systems of record, into the EAiQ knowledge graph, to a prioritized and governed decision — hover any stage to trace it, click to lock."
      />
      <Section alt>
        <ReasoningFlow />
      </Section>
      <Section>
        <PipelineSteps />
        <Takeaway>{howItWorks.takeaway}</Takeaway>
        <p className="mt-4 text-xs italic text-slate-400">Note: {howItWorks.note}</p>
      </Section>
      <CtaSoft title="Want to see the stack behind it?" body="Five Google Cloud layers turn EAiQ into operational intelligence." cta={{ label: "Explore the platform", href: "/platform" }} />
    </>
  );
}
