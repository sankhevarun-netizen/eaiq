import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Segment } from "@/data/story";
import { Icon } from "@/components/ui/Icon";
import { Card } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

export function SegmentCard({ s }: { s: Segment }) {
  return (
    <Card className={cn("flex h-full flex-col overflow-hidden", s.future && "opacity-90")}>
      <div className={cn("px-5 py-3 text-center text-sm font-bold text-white", s.future ? "bg-slate-600" : "bg-brand-blue")}>
        {s.title}
        {s.future && <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">Future proposition</span>}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-sm italic leading-relaxed text-slate-600">
          <span className="font-semibold not-italic text-slate-800">{s.valueLead}</span>
          {s.valueRest}
        </p>
        <ul className="mt-4 space-y-1.5">
          {s.capabilities.map((c) => (
            <li key={c} className="flex gap-2 text-sm text-slate-600">
              <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-slate-400" /> {c}
            </li>
          ))}
        </ul>
        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {s.targets.map((t) => (
            <div key={t.name} className="flex flex-col items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-2 py-3 text-center">
              <Icon name={t.icon} className="h-5 w-5 text-brand-blue" />
              <span className="text-xs leading-tight text-slate-600">{t.name}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 flex-1 border-t border-slate-100 pt-4">
          {s.businessModel.map((b) => (
            <p key={b} className="text-xs text-slate-600">› {b}</p>
          ))}
        </div>
        <Link href={`/segments/${s.id}`} className="group mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-blue">
          Explore <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </Card>
  );
}
