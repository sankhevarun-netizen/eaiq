import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Cpu, MessageCircleQuestion, UserCheck, Workflow } from "lucide-react";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { AgentCard } from "@/components/agents/AgentCard";
import { QuestionCard } from "@/components/questions/QuestionCard";
import { AgentCodeChip, CtaSoft, PackPill, Section, SectionHeader } from "@/components/ui/primitives";
import { agents, getAgent, packLabel } from "@/data/agents";
import { dcFeatures, enterpriseFeatures } from "@/data/features";
import { questionsForAgent } from "@/data/questions";

export function generateStaticParams() {
  return agents.map((a) => ({ id: a.id }));
}

export default async function AgentDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const agent = getAgent(id);
  if (!agent) notFound();

  const features = [...dcFeatures, ...enterpriseFeatures].filter((f) => f.agents.includes(agent.code) && !f.todo);
  const qs = questionsForAgent(agent.code);
  const related = agents.filter((a) => a.id !== agent.id && (a.pack === agent.pack || a.pack === "Shared")).slice(0, 4);
  const proposed = agent.status === "proposed";

  const rows = [
    { icon: Workflow, label: "Does", value: agent.does },
    { icon: Cpu, label: "Engine", value: agent.engine },
    { icon: MessageCircleQuestion, label: "Asks", value: agent.asks },
    { icon: UserCheck, label: "Person", value: agent.person, person: true },
  ];

  return (
    <>
      <section className="border-b border-slate-100 bg-white px-6 pb-12 pt-10">
        <div className="mx-auto max-w-7xl">
          <Breadcrumb items={[{ label: "Agents", href: "/agents" }, { label: `${agent.code === "ORCH" ? "" : agent.code + " "}${agent.title}` }]} />
          <Link href="/agents" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-blue">
            <ArrowLeft className="h-4 w-4" /> See all agents
          </Link>

          <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand-blue">Agent</span>
                <AgentCodeChip code={agent.code} />
                {proposed && <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-400">MVP+ · Proposed</span>}
                {agent.status === "assumed" && <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">Assumed, to confirm</span>}
              </div>
              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">{agent.title}</h1>
              <p className="mt-3 text-base leading-relaxed text-slate-500">{agent.description}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-slate-700">Pack:</span>
                <PackPill pack={agent.pack} />
                {agent.tag && <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">{agent.tag}</span>}
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                {proposed ? (
                  <span title="Arrives in MVP+" className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-400">Open in console</span>
                ) : (
                  <Link href={agent.consoleHref} className="group inline-flex items-center gap-2 rounded-xl bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-blue-dark">
                    Open in console <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                )}
                <a href="mailto:eaiq@kpmg.com" className="inline-flex items-center gap-2 rounded-xl border border-brand-blue px-5 py-2.5 text-sm font-semibold text-brand-blue hover:bg-brand-soft">
                  Contact Us
                </a>
              </div>

              <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-card">
                <h2 className="mb-4 text-base font-bold text-slate-800">Agent specification</h2>
                <dl className="divide-y divide-slate-100">
                  {rows.map((r) => (
                    <div key={r.label} className="grid grid-cols-[110px_1fr] gap-4 py-3">
                      <dt className={`flex items-center gap-2 text-sm font-semibold ${r.person ? "text-orange-600" : "text-slate-500"}`}>
                        <r.icon className="h-4 w-4" /> {r.label}
                      </dt>
                      <dd className="text-sm leading-relaxed text-slate-700">{r.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>

            {/* Right rail — ScopeCards */}
            <aside className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Pack</p>
                <p className="mt-2 text-lg font-extrabold text-slate-900">{packLabel[agent.pack]}</p>
                <p className="mt-1 text-sm text-slate-500">Paired engine: <span className="font-semibold text-slate-700">{agent.engineName}</span></p>
              </div>
              <div className="rounded-xl border border-orange-200 bg-orange-50/50 p-5 shadow-card">
                <p className="text-xs font-semibold uppercase tracking-widest text-orange-600">Human gate</p>
                <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-800">{agent.person}</p>
                <p className="mt-2 text-xs text-slate-500">EAiQ itself changes nothing. A person approves in Workflows before an ITSM change, pull request or rollback goes out.</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Guarded answers</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">Engines compute every figure; Gemini writes around fact IDs; stray numbers are rejected and a template answer is the fallback.</p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {features.length > 0 && (
        <Section alt>
          <SectionHeader eyebrow="Features" title="What the user gets" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {features.map((f) => (
              <div key={f.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-semibold text-slate-800">{f.title}</h3>
                  {f.area && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{f.area}</span>}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{f.gets}</p>
                <div className="mt-4 flex items-start gap-2 rounded-lg bg-green-50 px-3 py-2">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-green" />
                  <p className="text-xs leading-relaxed text-slate-700"><span className="font-semibold">Proven when:</span> {f.provenWhen}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {qs.length > 0 && (
        <Section alt={features.length === 0}>
          <SectionHeader eyebrow="Questions it answers" title={`Questions no single tool can answer (${qs.length})`} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {qs.map((q) => <QuestionCard key={q.n} q={q} />)}
          </div>
        </Section>
      )}

      <Section alt={((features.length > 0 ? 1 : 0) + (qs.length > 0 ? 1 : 0)) % 2 === 0}>
        <SectionHeader title="Related Agents" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((a, i) => <AgentCard key={a.id} agent={a} index={i} />)}
        </div>
      </Section>

      <CtaSoft title={`Ready to put ${agent.code === "ORCH" ? "the orchestrator" : agent.code} to work?`} body="Talk to us about running this agent on your own systems of record — read-only by default." cta={{ label: "Talk to an expert", href: "mailto:eaiq@kpmg.com" }} />
    </>
  );
}
