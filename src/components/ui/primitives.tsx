"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, MessageSquare } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Pack } from "@/data/agents";

/** Upward entrance, once, staggered by index (design system §5). */
export function Reveal({ children, index = 0, className }: { children: ReactNode; index?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Zebra section. `alt` = bg-slate-50/70. */
export function Section({ children, alt, id, className }: { children: ReactNode; alt?: boolean; id?: string; className?: string }) {
  return (
    <section id={id} className={cn("px-6 py-20", alt ? "bg-slate-50/70" : "bg-white", className)}>
      <div className="mx-auto max-w-7xl">{children}</div>
    </section>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("text-xs font-semibold uppercase tracking-widest text-brand-blue", className)}>{children}</p>;
}

export function SectionHeader({ eyebrow, title, sub, className }: { eyebrow?: string; title: string; sub?: string; className?: string }) {
  return (
    <div className={cn("mb-10 max-w-3xl", className)}>
      {eyebrow && <Eyebrow className="mb-2">{eyebrow}</Eyebrow>}
      <h2 className="text-2xl font-bold tracking-tight text-slate-800">{title}</h2>
      {sub && <p className="mt-2 text-sm leading-relaxed text-slate-500">{sub}</p>}
    </div>
  );
}

/** Page-level hero for sub pages: breadcrumb slot + eyebrow + H1 + intro. */
export function PageHero({ crumb, eyebrow, title, intro, children }: { crumb?: ReactNode; eyebrow?: string; title: string; intro?: string; children?: ReactNode }) {
  return (
    <section className="border-b border-slate-100 bg-white px-6 pb-12 pt-10">
      <div className="mx-auto max-w-7xl">
        {crumb}
        <div className="mt-6 max-w-3xl animate-fade-in motion-reduce:animate-none">
          {eyebrow && <Eyebrow className="mb-3">{eyebrow}</Eyebrow>}
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">{title}</h1>
          {intro && <p className="mt-4 text-base leading-relaxed text-slate-500">{intro}</p>}
        </div>
        {children}
      </div>
    </section>
  );
}

export function Pill({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600", className)}>{children}</span>;
}

export const packStyle: Record<Pack | "Future", string> = {
  DC: "bg-brand-soft text-brand-blue",
  Enterprise: "bg-green-50 text-brand-green-dark",
  Shared: "bg-slate-100 text-slate-600",
  Core: "bg-indigo-50 text-indigo-700",
  Future: "bg-amber-50 text-amber-700",
};

export function PackPill({ pack, className }: { pack: Pack | "Future"; className?: string }) {
  const label = pack === "Core" ? "Orchestrator" : pack === "Future" ? "Future" : pack === "Shared" ? "Shared" : `${pack} pack`;
  return <Pill className={cn(packStyle[pack], "font-semibold", className)}>{label}</Pill>;
}

export function StatTile({ value, label, sub, className }: { value: ReactNode; label: string; sub?: string; className?: string }) {
  return (
    <div className={cn("rounded-xl border border-slate-200 bg-white p-5 shadow-card", className)}>
      <p className="text-3xl font-extrabold tracking-tight text-slate-900">{value}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      {sub && <p className="mt-2 text-xs leading-relaxed text-slate-500">{sub}</p>}
    </div>
  );
}

/** Deck takeaway callout — blue left rule over a tinted band, as on every slide. */
export function Takeaway({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("mt-10 rounded-r-xl border-l-4 border-brand-blue bg-brand-soft/70 px-6 py-4", className)}>
      <p className="text-sm font-medium leading-relaxed text-slate-700 sm:text-base">{children}</p>
    </div>
  );
}

/** CTA pattern 1: gradient banner (design system §6.5). */
export function CtaGradient({ eyebrow, title, body, pills, cta }: { eyebrow: string; title: string; body: string; pills?: string[]; cta: { label: string; href: string } }) {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-blue via-[#1e4db7] to-brand-navy px-8 py-10 md:px-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/50">{eyebrow}</p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">{title}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/70">{body}</p>
            {pills && (
              <div className="mt-5 flex flex-wrap gap-2">
                {pills.map((p) => (
                  <span key={p} className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
                    {p}
                  </span>
                ))}
              </div>
            )}
            <Link
              href={cta.href}
              className="group mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-brand-blue transition-all hover:gap-2.5"
            >
              {cta.label}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/** CTA pattern 2: soft card (design system §6.5). */
export function CtaSoft({ title, body, cta }: { title: string; body: string; cta: { label: string; href: string } }) {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <div className="flex flex-col gap-6 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-8 shadow-card md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-brand-blue">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold tracking-tight text-slate-900">{title}</h3>
                <p className="mt-1 text-sm text-slate-500">{body}</p>
              </div>
            </div>
            <Link
              href={cta.href}
              className="group inline-flex flex-shrink-0 items-center gap-2 self-start rounded-full bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white transition-all hover:gap-2.5 hover:bg-brand-blue-dark md:self-center"
            >
              {cta.label}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function Card({ children, className, hover = true }: { children: ReactNode; className?: string; hover?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white shadow-card",
        hover && "transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-card-hover motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function AgentCodeChip({ code, className }: { code: string; className?: string }) {
  const tone = code.startsWith("D")
    ? "bg-brand-soft text-brand-blue"
    : code.startsWith("E")
      ? "bg-green-50 text-brand-green-dark"
      : code.startsWith("S")
        ? "bg-slate-100 text-slate-700"
        : "bg-indigo-50 text-indigo-700";
  return <span className={cn("inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-bold", tone, className)}>{code === "ORCH" ? "Orchestrator" : code}</span>;
}
