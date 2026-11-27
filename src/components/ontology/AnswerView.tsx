import Link from "next/link";
import { cn } from "@/lib/utils";

/** Readable rendering of an arbitrary question_results value: objects → cards/rows, arrays of objects → tables. */

function fmt(key: string, v: unknown): string {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "number") {
    if (/inr/i.test(key)) return `₹${Math.round(v).toLocaleString("en-IN")}`;
    if (/pct/i.test(key)) return `${v}%`;
    if (/share|rate|corr/i.test(key) && v <= 1) return `${Math.round(v * 1000) / 10}%`;
    return v.toLocaleString("en-IN");
  }
  if (typeof v === "boolean") return v ? "Yes" : "No";
  return String(v);
}
const human = (k: string) => k.replace(/_/g, " ").replace(/\binr\b/gi, "(INR)").replace(/\bpct\b/gi, "%");
const isPlain = (v: unknown) => v === null || ["string", "number", "boolean"].includes(typeof v);
const NODE_ID = /^(MUM1|MUM2|CHN1|HYD1|PUN1|NOI1|APP|DEC|T|ENT|AL|INC|COMP|RB)-/;

function Val({ k, v }: { k: string; v: unknown }) {
  if (typeof v === "string" && NODE_ID.test(v)) return <Link href={`/ontology/explorer?id=${encodeURIComponent(v)}`} className="font-medium text-brand-blue hover:underline">{v}</Link>;
  return <>{fmt(k, v)}</>;
}

export function AnswerValue({ value, k = "", depth = 0 }: { value: unknown; k?: string; depth?: number }) {
  if (isPlain(value)) return <span className="text-sm text-slate-700"><Val k={k} v={value} /></span>;

  if (Array.isArray(value)) {
    if (value.every(isPlain)) {
      return <div className="flex flex-wrap gap-1.5">{value.map((x, i) => <span key={i} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700"><Val k={k} v={x} /></span>)}</div>;
    }
    if (value.every((x) => Array.isArray(x))) {
      return (
        <div className="no-scrollbar overflow-x-auto"><table className="w-full text-sm"><tbody>
          {(value as unknown[][]).map((row, i) => <tr key={i} className="border-t border-slate-100">{row.map((c, j) => <td key={j} className="py-1.5 pr-4 text-slate-700">{fmt(j === row.length - 1 && typeof c === "number" && c > 100000 ? "inr" : "", c)}</td>)}</tr>)}
        </tbody></table></div>
      );
    }
    const cols = [...new Set((value as Record<string, unknown>[]).flatMap((o) => Object.keys(o)))];
    return (
      <div className="no-scrollbar overflow-x-auto">
        <table className="w-full min-w-[480px] text-sm">
          <thead><tr className="text-left text-[11px] uppercase tracking-wider text-slate-400">{cols.map((c) => <th key={c} className="py-1.5 pr-4 font-semibold">{human(c)}</th>)}</tr></thead>
          <tbody>
            {(value as Record<string, unknown>[]).map((o, i) => (
              <tr key={i} className="border-t border-slate-100 align-top">
                {cols.map((c) => <td key={c} className="py-1.5 pr-4 text-slate-700">{isPlain(o[c]) ? <Val k={c} v={o[c]} /> : <AnswerValue value={o[c]} k={c} depth={depth + 1} />}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  const entries = Object.entries(value as Record<string, unknown>);
  const flat = entries.every(([, v]) => isPlain(v));
  if (flat) {
    return (
      <dl className={cn("grid gap-2", entries.length > 3 ? "grid-cols-2 md:grid-cols-4" : "grid-cols-1 sm:grid-cols-3")}>
        {entries.map(([kk, v]) => (
          <div key={kk} className="rounded-lg bg-slate-50 px-3 py-2">
            <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{human(kk)}</dt>
            <dd className="mt-0.5 text-sm font-bold text-slate-800"><Val k={kk} v={v} /></dd>
          </div>
        ))}
      </dl>
    );
  }
  return (
    <div className={cn("space-y-3", depth > 0 && "pl-0")}>
      {entries.map(([kk, v]) => (
        <div key={kk} className={cn(depth === 0 ? "rounded-xl border border-slate-100 p-4" : "")}>
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-brand-blue">{NODE_ID.test(kk) ? <Val k="" v={kk} /> : human(kk)}</p>
          <AnswerValue value={v} k={kk} depth={depth + 1} />
        </div>
      ))}
    </div>
  );
}
