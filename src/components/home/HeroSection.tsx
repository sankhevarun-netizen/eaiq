"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Search, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { cover } from "@/data/story";
import { HeroNetwork } from "@/components/home/HeroNetwork";

const CHIPS = [
  "What depends on UPS-1?",
  "Battery getting hot",
  "Which change caused this incident?",
  "Stranded capacity",
  "Feed A to Feed B",
  "What should we fix first?",
];

export function HeroSection() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [focus, setFocus] = useState(false);
  const go = (v: string) => router.push(`/search?q=${encodeURIComponent(v)}`);

  return (
    <section className="hero-gradient relative overflow-hidden px-6 pb-32 pt-24">
      <HeroNetwork />
      <div className="relative mx-auto max-w-3xl text-center">
        <div className="animate-fade-in motion-reduce:animate-none">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-blue/15 bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-brand-blue shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-blue opacity-60 motion-reduce:hidden" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-blue" />
            </span>
            {cover.eyebrow}
          </span>
        </div>

        <h1
          className="mt-6 animate-fade-in text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-900 motion-reduce:animate-none sm:text-5xl lg:text-6xl"
          style={{ animationDelay: "60ms" }}
        >
          {cover.titleLead} <span className="text-brand-blue">{cover.titleAccent}</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl animate-fade-in text-base leading-relaxed text-slate-500 motion-reduce:animate-none" style={{ animationDelay: "120ms" }}>
          {cover.body}
        </p>

        <div className="mt-10 animate-fade-in motion-reduce:animate-none" style={{ animationDelay: "180ms" }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (q.trim()) go(q.trim());
            }}
            className={cn(
              "mx-auto flex max-w-2xl items-center gap-3 rounded-2xl border bg-white px-4 py-3 shadow-card transition-all duration-200",
              focus ? "scale-[1.01] border-brand-blue shadow-[0_0_0_3px_rgba(26,58,143,0.12)]" : "border-slate-200",
            )}
          >
            <Search className="h-5 w-5 flex-shrink-0 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onFocus={() => setFocus(true)}
              onBlur={() => setFocus(false)}
              placeholder="Ask a question no single tool can answer"
              className="flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
            />
            <button type="submit" aria-label="Search" className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-blue text-white transition-transform hover:scale-105">
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {CHIPS.map((c) => (
              <button
                key={c}
                onClick={() => go(c)}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-600 transition-all hover:-translate-y-0.5 hover:border-brand-blue hover:bg-brand-soft hover:text-brand-blue motion-reduce:hover:translate-y-0"
              >
                <Sparkles className="h-3 w-3 text-brand-violet" />
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
