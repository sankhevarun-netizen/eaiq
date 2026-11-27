"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { incidents as seedIncidents, type Incident } from "@/data/demo/nexusMumbai1";

export const ROLES = ["Executive", "DC operator", "Architect", "Auditor"] as const;
export type Role = (typeof ROLES)[number];

export interface AuditEntry {
  id: string;
  time: string;
  user: string;
  role: Role;
  action: string;
  target: string;
  facts: string;
}

export interface Approval {
  id: string;
  kind: "ITSM change" | "ITSM incident" | "Pull request" | "Rollback" | "Maintenance ticket" | "Optimization" | "7R path" | "Graph link";
  title: string;
  requestedBy: string; // agent code
  evidence: string;
  status: "Pending" | "Approved" | "Rejected";
}

const seedAudit: AuditEntry[] = [
  { id: "AU-9001", time: "27 Nov 08:47", user: "R. Kulkarni", role: "DC operator", action: "Viewed incident", target: "INC-2611", facts: "correlation.rank[0]=0.86" },
  { id: "AU-9000", time: "27 Nov 06:20", user: "S. Menon", role: "DC operator", action: "Acknowledged incident", target: "INC-2608", facts: "—" },
  { id: "AU-8998", time: "26 Nov 22:41", user: "P. Shah", role: "DC operator", action: "Assigned incident", target: "INC-2603", facts: "—" },
  { id: "AU-8990", time: "26 Nov 17:05", user: "A. Rao", role: "Architect", action: "Approved 7R path", target: "Core Banking Gateway → Replatform", facts: "7r.score=72, togaf.fails=2" },
];

const seedApprovals: Approval[] = [
  { id: "AP-311", kind: "ITSM change", title: "Feed A maintenance switchover — Sun 06 Dec 02:00", requestedBy: "D4", evidence: "Verdict GO WITH CONDITIONS · 3 conditions · window score 94", status: "Pending" },
  { id: "AP-310", kind: "Maintenance ticket", title: "Replace BATT-4 (Exide VRLA string)", requestedBy: "D3", evidence: "EoL score 88 · cell temp +6.2 °C vs peers", status: "Pending" },
  { id: "AP-309", kind: "Rollback", title: "Roll back Core Banking Gateway to b81e44f", requestedBy: "E3", evidence: "5xx 4.2% · likely change REL-1039 (0.81)", status: "Pending" },
  { id: "AP-308", kind: "7R path", title: "Loan Origination → Refactor (wave 3)", requestedBy: "E1", evidence: "fit 48 · debt 82 · 2 TOGAF fails", status: "Pending" },
  { id: "AP-307", kind: "Optimization", title: "Delete 214 idle cloud resources with no owner", requestedBy: "E4", evidence: "value 7 / effort 2 · ₹68 L per year", status: "Pending" },
];

interface Store {
  role: Role;
  setRole: (r: Role) => void;
  user: string;
  incidents: Incident[];
  updateIncident: (id: string, patch: Partial<Incident>) => void;
  audit: AuditEntry[];
  log: (action: string, target: string, facts?: string) => void;
  approvals: Approval[];
  decide: (id: string, status: "Approved" | "Rejected") => void;
  request: (a: Omit<Approval, "id" | "status">) => void;
}

const Ctx = createContext<Store | null>(null);
const KEY = "eaiq-console-v1";

const USERS: Record<Role, string> = {
  Executive: "N. Shah (COO)",
  "DC operator": "R. Kulkarni",
  Architect: "A. Rao",
  Auditor: "L. Fernandes",
};

function now() {
  const d = new Date();
  return `${d.getDate()} ${d.toLocaleString("en-GB", { month: "short" })} ${d.toTimeString().slice(0, 5)}`;
}

export function ConsoleStoreProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("Executive");
  const [incidents, setIncidents] = useState<Incident[]>(seedIncidents);
  const [audit, setAudit] = useState<AuditEntry[]>(seedAudit);
  const [approvals, setApprovals] = useState<Approval[]>(seedApprovals);
  const [loaded, setLoaded] = useState(false);

  // "State kept across sessions" — persisted per browser.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (s.role) setRole(s.role);
        if (s.incidents) setIncidents(s.incidents);
        if (s.audit) setAudit(s.audit);
        if (s.approvals) setApprovals(s.approvals);
      }
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(KEY, JSON.stringify({ role, incidents, audit, approvals }));
    } catch {}
  }, [loaded, role, incidents, audit, approvals]);

  const user = USERS[role];

  const log = useCallback(
    (action: string, target: string, facts = "—") =>
      setAudit((a) => [{ id: `AU-${9002 + a.length}`, time: now(), user, role, action, target, facts }, ...a]),
    [user, role],
  );

  const updateIncident = useCallback((id: string, patch: Partial<Incident>) => {
    setIncidents((list) => list.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }, []);

  const decide = useCallback(
    (id: string, status: "Approved" | "Rejected") => {
      setApprovals((list) => list.map((a) => (a.id === id ? { ...a, status } : a)));
      const a = approvals.find((x) => x.id === id);
      if (a) log(`${status} ${a.kind}`, a.title, a.evidence);
    },
    [approvals, log],
  );

  const request = useCallback(
    (a: Omit<Approval, "id" | "status">) => {
      setApprovals((list) => [{ ...a, id: `AP-${312 + list.length}`, status: "Pending" }, ...list]);
      log(`Requested approval (${a.kind})`, a.title, a.evidence);
    },
    [log],
  );

  const value = useMemo(
    () => ({ role, setRole, user, incidents, updateIncident, audit, log, approvals, decide, request }),
    [role, user, incidents, updateIncident, audit, log, approvals, decide, request],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useConsole() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useConsole outside provider");
  return c;
}

/** Which roles may act on which areas — "each role sees and does only what it should". */
export function canAct(role: Role, area: "dc" | "enterprise" | "approve-dc" | "approve-ent") {
  if (role === "Auditor") return false;
  if (role === "Executive") return area === "approve-dc" || area === "approve-ent";
  if (role === "DC operator") return area === "dc" || area === "approve-dc";
  if (role === "Architect") return area === "enterprise" || area === "approve-ent";
  return false;
}
