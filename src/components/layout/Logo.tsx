import { cn } from "@/lib/utils";

/** KPMG mark: four outlined boxes over the italic wordmark. */
export function KpmgMark({ className, dark = false }: { className?: string; dark?: boolean }) {
  const c = dark ? "#ffffff" : "#00338D";
  return (
    <svg viewBox="0 0 200 100" className={cn("h-9 w-auto", className)} role="img" aria-label="KPMG">
      {[22, 66, 110, 154].map((x) => (
        <rect key={x} x={x} y={2} width={42} height={74} fill="none" stroke={c} strokeWidth={3.5} />
      ))}
      <text x={2} y={96} textLength={196} lengthAdjust="spacingAndGlyphs" fontFamily="Arial Black, Arial, Helvetica, sans-serif" fontWeight={900} fontStyle="italic" fontSize={64} fill={c}>
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
