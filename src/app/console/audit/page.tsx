"use client";

import { Download } from "lucide-react";
import { ConsoleTitle, Panel } from "@/components/console/ConsoleShell";
import { useConsole } from "@/components/providers/ConsoleStore";

export default function AuditPage() {
  const { audit } = useConsole();

  const exportCsv = () => {
    const rows = [["id", "time", "user", "role", "action", "target", "facts"], ...audit.map((a) => [a.id, a.time, a.user, a.role, a.action, a.target, a.facts])];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const el = document.createElement("a");
    el.href = url;
    el.download = "eaiq-audit-log.csv";
    el.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <ConsoleTitle
        eyebrow="Decision log and audit"
        title="Why did we decide this, on what evidence, and who approved it?"
        sub="Every decision is stored with its inputs, fact IDs, approver and time, and exported as the audit record."
        right={<button onClick={exportCsv} className="inline-flex items-center gap-1.5 rounded-lg border border-brand-blue px-4 py-2 text-sm font-semibold text-brand-blue hover:bg-brand-soft"><Download className="h-4 w-4" /> Export CSV</button>}
      />
      <Panel title={`${audit.length} entries`}>
        <div className="no-scrollbar overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead><tr className="text-left text-xs uppercase tracking-wider text-slate-400"><th className="py-2">ID</th><th>Time</th><th>User</th><th>Role</th><th>Action</th><th>Target</th><th>Fact IDs</th></tr></thead>
            <tbody>
              {audit.map((a) => (
                <tr key={a.id} className="border-t border-slate-100">
                  <td className="py-2.5 font-mono text-xs text-slate-400">{a.id}</td>
                  <td className="whitespace-nowrap text-slate-600">{a.time}</td>
                  <td className="font-semibold text-slate-800">{a.user}</td>
                  <td><span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">{a.role}</span></td>
                  <td className="text-slate-700">{a.action}</td>
                  <td className="text-slate-600">{a.target}</td>
                  <td><code className="text-[11px] text-slate-500">{a.facts}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
