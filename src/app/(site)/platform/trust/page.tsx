import { DoorOpen, FileCheck2, ScrollText, ShieldCheck, UserCheck, Users } from "lucide-react";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Card, CtaSoft, PageHero, Reveal, Section, SectionHeader } from "@/components/ui/primitives";
import { enterpriseDecisionPoints, sharedFeatures, sharedFeaturesIntro } from "@/data/features";
import { trustBoxes } from "@/data/blueprint";

const ICONS = [ShieldCheck, DoorOpen, UserCheck, ScrollText, Users, FileCheck2];

export default function TrustPage() {
  return (
    <>
      <PageHero
        crumb={<Breadcrumb items={[{ label: "Platform", href: "/platform" }, { label: "Trust & governance" }]} />}
        eyebrow="Features both packs share"
        title="EAiQ itself changes nothing"
        intro={sharedFeaturesIntro}
      />
      <Section alt>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sharedFeatures.map((f, i) => {
            const I = ICONS[i];
            return (
              <Reveal key={f.title} index={i}>
                <Card className="flex h-full flex-col p-6">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand-blue"><I className="h-5 w-5" /></div>
                  <h3 className="text-base font-semibold text-slate-800">{f.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-500">{f.does}</p>
                  <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-400"><span className="font-semibold uppercase tracking-wider">Built on</span> · {f.builtOn}</p>
                </Card>
              </Reveal>
            );
          })}
        </div>
      </Section>
      <Section>
        <SectionHeader eyebrow="Trust: on every call and every layer" title="Controls that wrap every agent" sub="Identity: IAP, IAM, Agent Identity. Every call passes Agent Registry, Agent Gateway and Model Armor. Perimeter: VPC Service Controls, KMS, Secret Manager. Audit Logs. Agent Evaluation gates each release." />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {trustBoxes.map((b) => (
            <div key={b.title} className="rounded-xl border border-slate-200 bg-white p-4 shadow-card">
              <p className="text-sm font-semibold text-slate-800">{b.title}</p>
              <p className="mt-0.5 text-xs text-slate-500">{b.sub}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 rounded-xl border border-orange-200 bg-orange-50/50 p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-orange-600">Where people decide</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">{enterpriseDecisionPoints}</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">On the DC side: the on-call engineer on uncertain causes, an approver before any ITSM change, approval before a maintenance ticket, and a DC expert on every proposed graph link.</p>
        </div>
      </Section>
      <CtaSoft title="Want to see the audit trail?" body="Every decision is stored with its inputs, fact IDs, approver and time." cta={{ label: "Open the audit log", href: "/console/audit" }} />
    </>
  );
}
