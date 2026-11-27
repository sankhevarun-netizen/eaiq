import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { CtaGradient, PageHero, Reveal, Section, Takeaway } from "@/components/ui/primitives";
import { roadmap } from "@/data/story";
import { cn } from "@/lib/utils";

const head = ["bg-brand-blue text-white", "bg-[#2546c4] text-white", "bg-brand-navy text-white"];

export default function PathToValuePage() {
  return (
    <>
      <PageHero
        crumb={<Breadcrumb items={[{ label: "Why EAiQ", href: "/problem" }, { label: "Path to value" }]} />}
        eyebrow={roadmap.eyebrow}
        title={roadmap.title}
        intro="Seven layers, three phases. What is live today, what lands in the upcoming weeks, and the fully autonomous target state."
      />
      <Section alt>
        <Reveal>
          <div className="no-scrollbar overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-card">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr>
                  <th className="bg-brand-navy px-5 py-3 text-left text-xs font-bold uppercase tracking-widest text-white">Layer</th>
                  {roadmap.phases.map((p, i) => (
                    <th key={p.key} className={cn("px-5 py-3 text-left text-xs font-bold uppercase tracking-wider", head[i])}>
                      {p.label} <span className="font-semibold normal-case tracking-normal opacity-80">· {p.sub}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {roadmap.rows.map((r) => (
                  <tr key={r.layer} className="border-t border-slate-100">
                    <td className="bg-slate-50 px-5 py-4 font-semibold text-slate-800">{r.layer}</td>
                    {[r.mvp, r.plus, r.target].map((v, i) => (
                      <td key={i} className="px-5 py-4 align-top text-slate-600">
                        {v === "-" ? <span className="text-slate-300">—</span> : (
                          <span className="inline-flex items-start gap-2">
                            <span className={cn("mt-1.5 h-2 w-2 flex-shrink-0 rounded-full", i === 0 ? "bg-brand-green" : i === 1 ? "bg-brand-blue" : "bg-slate-300")} />
                            {v}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-brand-green" /> Live today</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-brand-blue" /> Upcoming weeks</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-slate-300" /> Target state</span>
        </div>
        <Takeaway>{roadmap.takeaway}</Takeaway>
      </Section>
      <CtaGradient
        eyebrow="MVP · Live today"
        title="The MVP is running on Nexus Mumbai-1"
        body="Unified view, twin and capacity planner, L1 AI Ops with root-cause analysis, RBAC and an audit log."
        pills={["Command view", "Digital twin", "RCA", "Audit log"]}
        cta={{ label: "Open Console", href: "/console/dc/command" }}
      />
    </>
  );
}
