import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Blueprint } from "@/components/platform/Blueprint";
import { CtaSoft, PageHero, Section } from "@/components/ui/primitives";
import { blueprintIntro } from "@/data/blueprint";

export default function BlueprintPage() {
  return (
    <>
      <PageHero
        crumb={<Breadcrumb items={[{ label: "Platform", href: "/platform" }, { label: "Solution blueprint" }]} />}
        eyebrow={blueprintIntro.eyebrow}
        title={blueprintIntro.title}
        intro={`${blueprintIntro.sub}. Switch between the holistic view and each side; on a side view, hover any agent to trace it to its engine, click to lock.`}
      />
      <Section alt>
        <Blueprint />
      </Section>
      <CtaSoft title="Want to talk through the architecture?" body="Each side is six agents paired with six engines and one gate — read-only against your systems of record." cta={{ label: "Talk to an expert", href: "mailto:eaiq@kpmg.com" }} />
    </>
  );
}
