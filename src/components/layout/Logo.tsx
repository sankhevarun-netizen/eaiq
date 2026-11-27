import { cn } from "@/lib/utils";

/** KPMG mark: four outlined boxes over the italic wordmark. */
export function KpmgMark({ className, dark = false }: { className?: string; dark?: boolean }) {
  const c = dark ? "#ffffff" : "#00338D";
  return (
    <svg viewBox="0 0 120 56" className={cn("h-7 w-auto", className)} role="img" aria-label="KPMG">
      {[2, 30, 58, 86].map((x) => (
        <rect key={x} x={x + 2} y={2} width={24} height={34} fill="none" stroke={c} strokeWidth={1.6} />
      ))}
      <text x={60} y={50} textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontWeight={900} fontStyle="italic" fontSize={30} letterSpacing={-1} fill={c}>
        KPMG
      </text>
    </svg>
  );
}

/** Lockup: KPMG mark | two-tone EAiQ wordmark (design system §6.1). */
export function Logo({ className, dark = false }: { className?: string; dark?: boolean }) {
  return (
    <span className="inline-flex items-center gap-3">
      <KpmgMark dark={dark} />
      <span className={cn("h-6 w-px", dark ? "bg-white/25" : "bg-slate-300")} />
      <span className={cn("font-extrabold tracking-tight", dark ? "text-white" : "text-slate-900", className)}>
        E<span className={dark ? "text-blue-400" : "text-brand-blue"}>AiQ</span>
      </span>
    </span>
  );
}
