"use client";

import { Check, X } from "lucide-react";
import { ConsoleTitle, Panel } from "@/components/console/ConsoleShell";
import { AgentCodeChip } from "@/components/ui/primitives";
import { canAct, useConsole } from "@/components/providers/ConsoleStore";
import { cn } from "@/lib/utils";

export default function ApprovalsPage() {
  const { approvals, decide, role } = useConsole();
  const may = (code: string) => canAct(role, code.startsWith("D") ? "approve-dc" : "approve-ent");

  return (
    <>
      <ConsoleTitle eyebrow="Executor and human gate · Workflows" title="Approval before action" sub="A person approves in a workflow before an ITSM change, pull request or rollback goes out. EAiQ itself changes nothing; every decision goes to the audit log." />
      <Panel title={`${approvals.filter((a) => a.status === "Pending").length} pending`}>
        <div className="space-y-2">
          {approvals.map((a) => (
            <div key={a.id} className="flex flex-col gap-3 rounded-lg border border-slate-100 p-3 md:flex-row md:items-center">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-slate-400">{a.id}</span>
                <AgentCodeChip code={a.requestedBy} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800">{a.title}</p>
                <p className="text-xs text-slate-500"><span className="font-semibold">{a.kind}</span> · {a.evidence}</p>
              </div>
              {a.status === "Pending" ? (
                <div className="flex items-center gap-2">
                  <button disabled={!may(a.requestedBy)} onClick={() => decide(a.id, "Approved")} className="inline-flex items-center gap-1 rounded-lg bg-brand-blue px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-blue-dark disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"><Check className="h-3.5 w-3.5" /> Approve</button>
                  <button disabled={!may(a.requestedBy)} onClick={() => decide(a.id, "Rejected")} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"><X className="h-3.5 w-3.5" /> Reject</button>
                  {!may(a.requestedBy) && <span className="text-[11px] text-slate-400" title="Not available for this role">Not for {role}</span>}
                </div>
              ) : (
                <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", a.status === "Approved" ? "bg-green-50 text-brand-green-dark" : "bg-slate-100 text-slate-500")}>{a.status}</span>
              )}
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}
