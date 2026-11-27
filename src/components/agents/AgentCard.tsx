"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AgentData } from "@/data/agents";
import { AgentCodeChip, PackPill } from "@/components/ui/primitives";

/** Same anatomy as the K-Nexus AgentCard (platform spec §3.1). */
export function AgentCard({ agent, index }: { agent: AgentData; index: number }) {
  const router = useRouter();
  const proposed = agent.status === "proposed";
  const assumed = agent.status === "assumed";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      whileHover={{ y: -4 }}
      onClick={() => router.push(`/agents/${agent.id}`)}
      className={cn(
        "group flex cursor-pointer flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-card transition-shadow duration-300",
        proposed ? "opacity-60" : "hover:border-blue-200 hover:shadow-card-hover",
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <AgentCodeChip code={agent.code} />
        {proposed && <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-400">MVP+ · Proposed</span>}
        {assumed && <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">To confirm</span>}
      </div>

      <div className="flex-1">
        <h3 className="mb-1.5 text-sm font-semibold leading-snug text-slate-800">{agent.title}</h3>
        <p className="line-clamp-3 text-xs leading-relaxed text-slate-500">{agent.description}</p>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <PackPill pack={agent.pack} />
        {agent.tag && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{agent.tag}</span>}
      </div>

      <div className="mt-4 flex justify-end">
        {proposed ? (
          <span className="inline-flex cursor-not-allowed select-none items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-400">MVP+</span>
        ) : (
          <a
            href={agent.consoleHref}
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-blue px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-blue-dark"
          >
            Open in console
            <ArrowRight className="h-3 w-3" />
          </a>
        )}
      </div>
    </motion.div>
  );
}
