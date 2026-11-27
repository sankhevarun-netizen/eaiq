import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-xs text-slate-400">
      <Link href="/" className="hover:text-brand-blue">
        EAiQ
      </Link>
      {items.map((it) => (
        <span key={it.label} className="flex items-center gap-1">
          <ChevronRight className="h-3 w-3" />
          {it.href ? (
            <Link href={it.href} className="hover:text-brand-blue">
              {it.label}
            </Link>
          ) : (
            <span className="text-slate-600">{it.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
