import Link from "next/link";
import { ArrowRight, LayoutGrid, ShieldCheck } from "lucide-react";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { StackVisualizer } from "@/components/platform/StackVisualizer";
import { Card, CtaGradient, PageHero, Reveal, Section, SectionHeader, Takeaway } from "@/components/ui/primitives";
import { stack } from "@/data/story";

export default function PlatformPage() {
  return (
    <>
      <PageHero crumb={<Breadcrumb items={[{ label: "Platform" }]} />} eyebrow={stack.eyebrow} title={stack.title} intro="Five layers, each with what it does and the Google Cloud technologies that enable it." />
      <Section alt>
        <StackVisualizer />
        <Takeaway>{stack.takeaway}</Takeaway>
      </Section>
      <Section>
        <SectionHeader eyebrow="Go deeper" title="How the stack is put together" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            { href: "/platform/blueprint", icon: LayoutGrid, t: "Solution blueprint", d: "One platform and one front door serve both the DC and the Enterprise pack." },
            { href: "/platform/trust", icon: ShieldCheck, t: "Trust & governance", d: "Six platform features come once and apply to both packs." },
          ].map((c, i) => (
            <Reveal key={c.href} index={i}>
              <Link href={c.href} className="group block">
                <Card className="p-6">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand-blue"><c.icon className="h-5 w-5" /></div>
                  <h3 className="text-base font-semibold text-slate-800">{c.t}</h3>
                  <p className="mt-1 text-sm text-slate-500">{c.d}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand-blue group-hover:gap-2.5">Explore <ArrowRight className="h-3.5 w-3.5" /></span>
                </Card>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>
      <CtaGradient eyebrow="Built on Google Cloud" title="See the stack running" body="The EAiQ portal on Cloud Run, agents on Agent Runtime, the graph on Spanner — open the console on Nexus Mumbai-1." pills={["Gemini Enterprise", "Spanner Graph", "BigQuery ML", "AlloyDB"]} cta={{ label: "Open Console", href: "/console/dc/command" }} />
    </>
  );
}
