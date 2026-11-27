import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { PainCard } from "@/components/story/PainCard";
import { CtaSoft, PageHero, Reveal, Section, Takeaway } from "@/components/ui/primitives";
import { problem } from "@/data/story";

export default function ProblemPage() {
  return (
    <>
      <PageHero
        crumb={<Breadcrumb items={[{ label: "Why EAiQ", href: "/problem" }, { label: "The problem" }]} />}
        eyebrow={problem.eyebrow}
        title={problem.title}
        intro="Operators and enterprises each see their own systems clearly. What neither can see is how a signal in one system turns into impact in another."
      />
      {problem.groups.map((g, gi) => (
        <Section key={g.label} alt={gi === 0}>
          <div className="mb-8 border-b border-slate-200 pb-3">
            <h2 className="text-sm font-extrabold uppercase tracking-widest text-slate-800">
              {g.label} <span className="ml-2 text-xs font-medium normal-case italic tracking-normal text-slate-400">({g.sub})</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {g.pains.map((p, i) => (
              <Reveal key={p.title} index={i}>
                <PainCard pain={p} accent={gi === 0 ? "blue" : "green"} />
              </Reveal>
            ))}
          </div>
          {gi === 1 && <Takeaway>{problem.takeaway}</Takeaway>}
        </Section>
      ))}
      <CtaSoft title="Want to see how EAiQ closes the gap?" body="One agentic layer converts signals across every system of record into grounded, auditable decisions." cta={{ label: "See our solution", href: "/solution" }} />
    </>
  );
}
