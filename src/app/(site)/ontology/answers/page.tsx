import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { AnswerValue } from "@/components/ontology/AnswerView";
import { AgentCodeChip, CtaSoft, PageHero, Section, Takeaway } from "@/components/ui/primitives";
import { EXTRA_ANSWER_TITLES, answers, ontologyIntro } from "@/data/ontology";
import { questions } from "@/data/questions";

export default function AnswersPage() {
  const keys = Object.keys(answers).sort((a, b) => Number(a) - Number(b));
  return (
    <>
      <PageHero
        crumb={<Breadcrumb items={[{ label: "Ontology", href: "/ontology" }, { label: "Answers" }]} />}
        eyebrow="Answers on the dataset"
        title="The questions, answered from the graph"
        intro="Each question no single tool can answer, run against the six data centres and three enterprises in the graph. Every figure comes from the dataset; node IDs link to the explorer."
      />
      <Section alt>
        <nav className="mb-8 flex flex-wrap gap-1.5">
          {keys.map((k) => <a key={k} href={`#q${k}`} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-card hover:bg-brand-soft hover:text-brand-blue">{k}</a>)}
        </nav>
        <div className="space-y-6">
          {keys.map((k) => {
            const q = questions.find((x) => String(x.n) === k);
            return (
              <article key={k} id={`q${k}`} className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm font-bold text-brand-blue">{k}</span>
                  <div className="flex-1">
                    <h2 className="text-base font-semibold leading-snug text-slate-800">{q?.question ?? EXTRA_ANSWER_TITLES[k] ?? `Question ${k}`}</h2>
                    {q ? (
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-400">Joins {q.systems} · {q.agents.map((a) => <AgentCodeChip key={a} code={a} />)}</div>
                    ) : (
                      <p className="mt-1 text-xs text-slate-400">Additional question in the dataset</p>
                    )}
                  </div>
                </div>
                <div className="mt-5"><AnswerValue value={answers[k]} /></div>
              </article>
            );
          })}
        </div>
        <Takeaway>{ontologyIntro.synthetic}</Takeaway>
      </Section>
      <CtaSoft title="Want to trace an answer yourself?" body="Open any node in the explorer and follow its edges." cta={{ label: "Open the explorer", href: "/ontology/explorer" }} />
    </>
  );
}
