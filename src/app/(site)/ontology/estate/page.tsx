import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { PueSpark } from "@/components/ontology/PueSpark";
import { Card, CtaSoft, PageHero, Reveal, Section, SectionHeader, Takeaway } from "@/components/ui/primitives";
import { estate, ontologyIntro } from "@/data/ontology";
import { inr } from "@/lib/utils";

export default function EstatePage() {
  return (
    <>
      <PageHero
        crumb={<Breadcrumb items={[{ label: "Ontology", href: "/ontology" }, { label: "Estate" }]} />}
        eyebrow="The estate in the graph"
        title="Six data centres, three enterprises"
        intro="Four colocation sites run by two operators, two captive sites owned by the enterprises themselves, and three enterprises with very different footprints — a regulated bank, a global capability centre and a digital-native commerce company."
      />
      <Section alt>
        <SectionHeader eyebrow="Data centres" title="Where the facility lives" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {estate.sites.map((s, i) => (
            <Reveal key={s.id} index={i}>
              <Card className="flex h-full flex-col p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-brand-blue">{s.id} · {s.kind}</p>
                    <h3 className="mt-1 text-base font-semibold text-slate-800">{s.name}</h3>
                    <p className="text-xs text-slate-500">{s.operator} · {s.city} · {s.tier}, {s.year}{s.dualFeed ? "" : " · single feed"}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm italic text-slate-600">{s.note}</p>
                <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
                  {[["Halls", s.halls], ["Racks", s.racks], ["Leased", `${s.leasedPct}%`], ["Assets", s.assets], ["Tenants", s.tenants], ["Incidents", s.incidents]].map(([k, v]) => (
                    <div key={k as string} className="rounded-lg bg-slate-50 py-2">
                      <dd className="text-base font-extrabold text-slate-900">{v}</dd>
                      <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{k}</dt>
                    </div>
                  ))}
                </dl>
                <div className="mt-4"><PueSpark data={s.pue} /></div>
                <p className="mt-2 text-[11px] text-slate-400">{s.alerts.total.toLocaleString("en-IN")} alert events · {s.alerts.bySeverity.major ?? 0} major</p>
                <Link href={`/ontology/explorer?id=${s.id}`} className="group mt-auto inline-flex items-center gap-1.5 pt-4 text-xs font-semibold uppercase tracking-wider text-brand-blue">Explore in graph <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" /></Link>
              </Card>
            </Reveal>
          ))}
        </div>
      </Section>
      <Section>
        <SectionHeader eyebrow="Enterprises" title="Who runs on it" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {estate.enterprises.map((e, i) => (
            <Reveal key={e.id} index={i}>
              <Card className="flex h-full flex-col p-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-brand-green-dark">{e.kind}</p>
                <h3 className="mt-1 text-base font-semibold text-slate-800">{e.name}</h3>
                <p className="text-xs text-slate-500">HQ {e.hq}</p>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">{e.story}</p>
                <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
                  {[["Apps", e.apps], ["Tier-1", e.tier1], ["Components", e.components], ["Capabilities", e.capabilities], ["Cloud res.", e.cloudResources], ["Run / yr", inr(e.runCostInr)]].map(([k, v]) => (
                    <div key={k as string} className="rounded-lg bg-slate-50 py-2">
                      <dd className="text-sm font-extrabold text-slate-900">{v}</dd>
                      <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{k}</dt>
                    </div>
                  ))}
                </dl>
                <Link href={`/ontology/explorer?id=${e.id}`} className="group mt-4 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand-blue">Explore in graph <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" /></Link>
              </Card>
            </Reveal>
          ))}
        </div>
        <Takeaway>{ontologyIntro.synthetic}</Takeaway>
      </Section>
      <CtaSoft title="Want to see what the graph can answer?" body="The 20 questions no single tool can answer, run against this estate." cta={{ label: "See the answers", href: "/ontology/answers" }} />
    </>
  );
}
