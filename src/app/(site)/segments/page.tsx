import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { SegmentCard } from "@/components/segments/SegmentCard";
import { CtaSoft, PageHero, Reveal, Section, Takeaway } from "@/components/ui/primitives";
import { segments, segmentsIntro } from "@/data/story";

export default function SegmentsPage() {
  return (
    <>
      <PageHero crumb={<Breadcrumb items={[{ label: "Who it's for" }]} />} eyebrow={segmentsIntro.eyebrow} title={segmentsIntro.title} />
      <Section alt>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {segments.map((s, i) => (
            <Reveal key={s.id} index={i}>
              <SegmentCard s={s} />
            </Reveal>
          ))}
        </div>
        <Takeaway>{segmentsIntro.takeaway}</Takeaway>
        <ol className="mt-4 space-y-1 text-xs text-slate-400">
          {segmentsIntro.notes.map((n, i) => (
            <li key={i}>{i + 1} – {n}</li>
          ))}
        </ol>
      </Section>
      <CtaSoft title="Which cohort are you in?" body="Talk to us about the value proposition and business model that fits your estate." cta={{ label: "Talk to an expert", href: "mailto:eaiq@kpmg.com" }} />
    </>
  );
}
