import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HeroSection } from "@/components/home/HeroSection";
import { AgentGrid } from "@/components/home/AgentGrid";
import { PainCard } from "@/components/story/PainCard";
import { QuestionCard } from "@/components/questions/QuestionCard";
import { CtaGradient, CtaSoft, Reveal, Section, SectionHeader, StatTile, Takeaway } from "@/components/ui/primitives";
import { problem, solution } from "@/data/story";
import { questions, questionsIntro } from "@/data/questions";
import { COMPONENT_COUNT, LINK_COUNT } from "@/data/demo/nexusMumbai1";

const featured = [1, 7, 4, 9, 12, 17];

export default function HomePage() {
  return (
    <>
      <HeroSection />

      {/* Stat row */}
      <Section alt className="py-12">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { v: "2", l: "Packs, one front door", s: "DC pack for the facility, Enterprise pack for the estate" },
            { v: "10", l: "Specialist agents", s: "4 DC, 4 Enterprise, 2 shared — each paired with one engine" },
            { v: `${COMPONENT_COUNT}`, l: "Components in the graph", s: `${LINK_COUNT} links, Nexus Mumbai-1 reference set` },
            { v: "20", l: "Questions no single tool can answer", s: "Each one joins systems nobody joins today" },
          ].map((s, i) => (
            <Reveal key={s.l} index={i}>
              <StatTile value={s.v} label={s.l} sub={s.s} />
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Problem */}
      <Section>
        <SectionHeader eyebrow={problem.eyebrow} title={problem.title} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {problem.groups.flatMap((g, gi) =>
            g.pains.map((p, i) => (
              <Reveal key={p.title} index={gi * 3 + i}>
                <PainCard pain={p} accent={gi === 0 ? "blue" : "green"} />
              </Reveal>
            )),
          )}
        </div>
        <Takeaway>{problem.takeaway}</Takeaway>
        <Link href="/problem" className="group mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-blue">
          See the problem in detail <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </Section>

      {/* Agents */}
      <Section alt>
        <SectionHeader
          eyebrow="One orchestrator, two packs, two shared agents"
          title="Browse the agents"
          sub="One job, one engine each, at most two agents deep. Gemini explains in each; the orchestrator writes every answer and specialists never call it back."
        />
        <AgentGrid />
      </Section>

      <CtaGradient
        eyebrow="EAiQ console — Nexus Mumbai-1"
        title="See every asset, risk and change on one screen"
        body={solution.takeaway + "."}
        pills={solution.pillars}
        cta={{ label: "Open Console", href: "/console/dc/command" }}
      />

      {/* Questions */}
      <Section alt>
        <SectionHeader eyebrow="Questions no single tool can answer" title="Twenty questions that need EAiQ" sub={questionsIntro} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {questions
            .filter((q) => featured.includes(q.n))
            .map((q, i) => (
              <Reveal key={q.n} index={i}>
                <QuestionCard q={q} />
              </Reveal>
            ))}
        </div>
        <Link href="/questions" className="group mt-8 inline-flex items-center gap-1.5 rounded-xl border border-brand-blue px-4 py-2 text-sm font-semibold text-brand-blue transition-colors hover:bg-brand-soft">
          View all 20 questions <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </Section>

      <CtaSoft
        title="Ready to close the blind spot?"
        body="Talk to us about bringing EAiQ to your facilities or your estate — starting with a pilot on your own systems of record."
        cta={{ label: "Talk to an expert", href: "mailto:eaiq@kpmg.com" }}
      />
    </>
  );
}
