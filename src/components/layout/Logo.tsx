import { cn } from "@/lib/utils";

/** Canonical two-tone lockup: dark "E" + brand-blue "AiQ" (design system §6.1). */
export function Logo({ className, dark = false }: { className?: string; dark?: boolean }) {
  return (
    <span className={cn("font-extrabold tracking-tight", dark ? "text-white" : "text-slate-900", className)}>
      E<span className={dark ? "text-blue-400" : "text-brand-blue"}>AiQ</span>
    </span>
  );
}
