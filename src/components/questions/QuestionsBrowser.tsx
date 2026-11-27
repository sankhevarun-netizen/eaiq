"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { questions } from "@/data/questions";
import { QuestionCard } from "@/components/questions/QuestionCard";
import { TabFilter } from "@/components/ui/TabFilter";
import { Reveal } from "@/components/ui/primitives";

const TABS = ["All", "DC", "Enterprise", "Assets to boardroom"] as const;
type Tab = (typeof TABS)[number];
const fromParam = (s: string | null): Tab => (s === "DC" ? "DC" : s === "Enterprise" ? "Enterprise" : s === "Bridge" ? "Assets to boardroom" : "All");

export function QuestionsBrowser() {
  const sp = useSearchParams();
  const [tab, setTab] = useState<Tab>(fromParam(sp.get("scope")));
  useEffect(() => setTab(fromParam(sp.get("scope"))), [sp]);

  const list = questions.filter((q) => tab === "All" || (tab === "Assets to boardroom" ? q.scope === "Bridge" : q.scope === tab));
  return (
    <>
      <TabFilter tabs={TABS} active={tab} onChange={setTab} />
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((q, i) => (
          <Reveal key={q.n} index={i % 6}>
            <QuestionCard q={q} />
          </Reveal>
        ))}
      </div>
    </>
  );
}
