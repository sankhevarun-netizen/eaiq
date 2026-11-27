import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { AgentCard } from "@/components/agents/AgentCard";
import { Icon } from "@/components/ui/Icon";
import { CtaSoft, Reveal, Section, SectionHeader } from "@/components/ui/primitives";
import { segments } from "@/data/story";
import { agents } from "@/data/agents";

export function generateStaticParams() {
  return segments.map((s) => ({ id: s.id }));
}

export default async function SegmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = segments.find((x) => x.id === id);
  if (!s) notFound();
  const packAgents = agents.filter((a) => a.pack === s.pack || (s.pack !== "Future" && a.pack === "Shared"));

  return (
    <>
      <section className="border-b border-slate-100 bg-white px-6 pb-12 pt-10">
        <div className="mx-auto max-w-7xl">
          <Breadcrumb items={[{ label: "Who it's for", href: "/segments" }, { label: s.title }]} />
          <Link href="/segments" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-blue">
            <ArrowLeft className="h-4 w-4" /> See all cohorts
          </Link>
          <div className="mt-6 max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-blue">
              {s.future ? "Indicative future proposition" : s.pack === "DC" ? "DC pack" : "Enterprise pack"}
            </p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">{s.title}</h1>
            <p className="mt-4 text-base italic leading-relaxed text-slate-500">
              <span className="font-semibold not-italic text-slate-800">{s.valueLead}</span>
              {s.valueRest}
            </p>
          </div>
        </div>
      </section>

      <Section alt>
        <SectionHeader eyebrow="Key platform capabilities" title="What you can do" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {s.capabilities.map((c, i) => (
            <Reveal key={c} index={i}>
              <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-card">
                <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-green" />
                <p className="text-sm font-semibold text-slate-800">{c}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeader eyebrow="Priority customer targets" title="Who we serve" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {s.targets.map((t, i) => (
            <Reveal key={t.name} index={i}>
              <div className="flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white p-6 text-center shadow-card">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-soft"><Icon name={t.icon} className="h-6 w-6 text-brand-blue" /></div>
                <p className="text-sm font-semibold text-slate-800">{t.name}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="mt-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Business model</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {s.businessModel.map((b) => (
              <span key={b} className="rounded-full bg-brand-soft px-3.5 py-1.5 text-sm font-semibold text-brand-blue">{b}</span>
            ))}
          </div>
        </div>
      </Section>

      {packAgents.length > 0 && (
        <Section alt>
          <SectionHeader eyebrow="Agents" title={`Agents (${packAgents.length})`} sub="The following agents are included with this pack." />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {packAgents.map((a, i) => <AgentCard key={a.id} agent={a} index={i} />)}
          </div>
        </Section>
      )}

      <CtaSoft title={`Want to talk through ${s.title}?`} body="Talk to us about bringing EAiQ into your operations — or explore the agents already built to support it." cta={{ label: "Talk to an expert", href: "mailto:eaiq@kpmg.com" }} />
    </>
  );
}
