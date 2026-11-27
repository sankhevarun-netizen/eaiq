import { cn } from "@/lib/utils";

/** The official KPMG logo file (public/kpmg-logo.png), cropped to the mark. */
export function KpmgMark({ className, dark = false }: { className?: string; dark?: boolean }) {
  return (
    <span className={cn("inline-flex items-center", dark && "rounded-md bg-white px-1.5 py-1", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/kpmg-logo.png" alt="KPMG" className="h-8 w-[80px] object-cover object-center" />
    </span>
  );
}

/** Lockup: KPMG logo | two-tone EAiQ wordmark (design system §6.1). */
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
