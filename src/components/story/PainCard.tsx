import type { Pain } from "@/data/story";
import { Card } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/Icon";

export function PainCard({ pain, accent = "blue" }: { pain: Pain; accent?: "blue" | "green" }) {
  return (
    <Card className="flex h-full flex-col p-6">
      <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${accent === "blue" ? "bg-brand-soft text-brand-blue" : "bg-green-50 text-brand-green-dark"}`}>
        <Icon name={pain.icon} className="h-5 w-5" />
      </div>
      <h3 className="text-base font-semibold leading-snug text-slate-800">{pain.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-500">{pain.body}</p>
      <div className="mt-4 flex flex-wrap gap-1.5 border-t border-slate-100 pt-4">
        {pain.tags.map((t) => (
          <span key={t} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
            {t}
          </span>
        ))}
      </div>
    </Card>
  );
}
