import { Suspense } from "react";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { QuestionsBrowser } from "@/components/questions/QuestionsBrowser";
import { CtaSoft, PageHero, Section } from "@/components/ui/primitives";
import { questionsIntro, questionsTitle } from "@/data/questions";

export default function QuestionsPage() {
  return (
    <>
      <PageHero crumb={<Breadcrumb items={[{ label: "Questions" }]} />} eyebrow="EAiQ" title={questionsTitle} intro={questionsIntro} />
      <Section alt>
        <Suspense fallback={<p className="text-sm text-slate-400">Loading questions…</p>}>
          <QuestionsBrowser />
        </Suspense>
      </Section>
      <CtaSoft title="Have a question of your own?" body="Ask the EAiQ copilot — every figure in the answer traces to an engine fact." cta={{ label: "Ask the copilot", href: "/console/dc/copilot" }} />
    </>
  );
}
