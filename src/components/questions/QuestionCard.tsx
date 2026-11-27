import Link from "next/link";
import type { Question } from "@/data/questions";
import { agentByCode } from "@/data/agents";
import { AgentCodeChip, Card } from "@/components/ui/primitives";

export function QuestionCard({ q, compact }: { q: Question; compact?: boolean }) {
  return (
    <Card className="flex h-full flex-col p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-bold text-brand-blue">{q.n}</span>
        <h3 className="text-sm font-semibold leading-snug text-slate-800">{q.question}</h3>
      </div>
      {!compact && (
        <dl className="mt-4 space-y-2 text-xs">
          <div>
            <dt className="font-semibold uppercase tracking-wider text-slate-400">Systems it joins</dt>
            <dd className="mt-0.5 text-slate-600">{q.systems}</dd>
          </div>
          <div>
            <dt className="font-semibold uppercase tracking-wider text-slate-400">Why tools alone fail</dt>
            <dd className="mt-0.5 text-slate-600">{q.whyFail}</dd>
          </div>
        </dl>
      )}
      <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-4">
        <Link href={`/ontology/answers#q${q.n}`} className="mr-auto text-xs font-semibold text-brand-blue hover:underline">
          Answer on the dataset →
        </Link>
        {q.agents.map((c) => {
          const a = agentByCode(c);
          return a ? (
            <Link key={c} href={`/agents/${a.id}`}>
              <AgentCodeChip code={c} />
            </Link>
          ) : (
            <AgentCodeChip key={c} code={c} />
          );
        })}
      </div>
    </Card>
  );
}
