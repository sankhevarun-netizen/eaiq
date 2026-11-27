import { cn } from "@/lib/utils";

/** KPMG mark: four outlined boxes over the italic wordmark. */
export function KpmgMark({ className, dark = false }: { className?: string; dark?: boolean }) {
  const c = dark ? "#ffffff" : "#25569A";
  return (
    <svg viewBox="50 400 1180 475" className={cn("h-9 w-auto", className)} role="img" aria-label="KPMG">
      {[124, 406, 688, 969].map((x) => (
        <rect key={x} x={x} y={412} width={254} height={359} fill={c} />
      ))}
      <text
        x={62}
        y={856}
        textLength={1090}
        lengthAdjust="spacingAndGlyphs"
        fontFamily="Arial Black, Arial, Helvetica, sans-serif"
        fontWeight={900}
        fontStyle="italic"
        fontSize={330}
        fill={dark ? "#00338D" : "#ffffff"}
        stroke={c}
        strokeWidth={14}
        paintOrder="stroke"
      >
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
