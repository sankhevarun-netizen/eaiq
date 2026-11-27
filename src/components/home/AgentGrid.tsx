"use client";

import { useState } from "react";
import { agentFilters, agents, type AgentFilter } from "@/data/agents";
import { AgentCard } from "@/components/agents/AgentCard";
import { TabFilter } from "@/components/ui/TabFilter";

export function AgentGrid({ initial = "All" as AgentFilter }: { initial?: AgentFilter }) {
  const [tab, setTab] = useState<AgentFilter>(initial);
  const list = agents.filter((a) => tab === "All" || a.pack === tab || (tab === "Shared" && a.pack === "Core"));
  return (
    <>
      <TabFilter tabs={agentFilters} active={tab} onChange={setTab} />
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {list.map((a, i) => (
          <AgentCard key={a.id} agent={a} index={i} />
        ))}
      </div>
    </>
  );
}
