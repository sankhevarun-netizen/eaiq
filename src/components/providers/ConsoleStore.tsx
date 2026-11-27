"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export const ROLES = ["Executive", "DC operator", "Architect", "Auditor"] as const;
export type Role = (typeof ROLES)[number];

export interface AuditEntry { id: string; time: string; user: string; role: Role; action: string; target: string; facts: string }
export interface Approval {
  id: string;
  kind: "ITSM change" | "ITSM incident" | "Pull request" | "Rollback" | "Maintenance ticket" | "Optimization" | "7R path" | "Graph link";
  title: string;
  requestedBy: string;
  evidence: string;
  status: "Pending" | "Approved" | "Rejected";
}
export interface IncidentState { status: "Open" | "Acknowledged" | "Assigned" | "Resolved"; owner?: string }

const seedAudit: AuditEntry[] = [
  { id: "AU-9004", time: "27 Nov 13:15", user: "R. Kulkarni", role: "DC operator", action: "Viewed incident", target: "INC-D-OPEN-MUM1", facts: "root=MUM1-PDU-H1-B2; alerts=12" },
  { id: "AU-9003", time: "27 Nov 13:16", user: "S. Iyer", role: "DC operator", action: "Viewed incident", target: "INC-D-OPEN-CHN1", facts: "root=CHN1-CHWP-H1-2; alerts=10" },
  { id: "AU-9002", time: "26 Nov 17:05", user: "A. Rao", role: "Architect", action: "Opened decision", target: "DEC-001 LegacyGL retire", facts: "status=not_executed; evidence=EVD-001" },
];

const seedApprovals: Approval[] = [
  { id: "AP-311", kind: "ITSM change", title: "MUM1-PDU-H1-A2 maintenance — after B2 repair (01 Dec 13:00)", requestedBy: "D4", evidence: "40 racks single-path; 40 lost while B2 is open · Bharat Mercantile Bank ₹8,75,000", status: "Pending" },
  { id: "AP-310", kind: "Maintenance ticket", title: "Replace MUM1-BATT-H1-A1-S2 (lot LOT-7731)", requestedBy: "D3", evidence: "+7.5 °C vs peers, z 8.5 · 160 racks behind it", status: "Pending" },
  { id: "AP-309", kind: "Maintenance ticket", title: "Replace HYD1-BATT-H1-A1-S2 (lot LOT-7731)", requestedBy: "D3", evidence: "+7.4 °C vs peers, z 8.4 · 96 racks, 5 tenants", status: "Pending" },
  { id: "AP-308", kind: "7R path", title: "LegacyGL → Retire (DEC-001, not executed)", requestedBy: "E1", evidence: "Still costing ₹1,36,41,709 per year · 3 dependents", status: "Pending" },
  { id: "AP-307", kind: "Optimization", title: "Zenith Commerce — idle non-prod cloud", requestedBy: "E4", evidence: "16 idle resources · ₹11,07,270 per month", status: "Pending" },
];

interface Store {
  role: Role; setRole: (r: Role) => void; user: string;
  siteId: string; setSiteId: (s: string) => void;
  entId: string; setEntId: (e: string) => void;
  incidentState: Record<string, IncidentState>; setIncident: (id: string, s: IncidentState) => void;
  audit: AuditEntry[]; log: (action: string, target: string, facts?: string) => void;
  approvals: Approval[]; decide: (id: string, status: "Approved" | "Rejected") => void; request: (a: Omit<Approval, "id" | "status">) => void;
}

const Ctx = createContext<Store | null>(null);
const KEY = "eaiq-console-v2";
const USERS: Record<Role, string> = { Executive: "N. Shah (COO)", "DC operator": "R. Kulkarni", Architect: "A. Rao", Auditor: "L. Fernandes" };

function now() {
  const d = new Date();
  return `${d.getDate()} ${d.toLocaleString("en-GB", { month: "short" })} ${d.toTimeString().slice(0, 5)}`;
}

export function ConsoleStoreProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("Executive");
  const [siteId, setSiteId] = useState("MUM1");
  const [entId, setEntId] = useState("ENT-BANK");
  const [incidentState, setIncidentState] = useState<Record<string, IncidentState>>({});
  const [audit, setAudit] = useState<AuditEntry[]>(seedAudit);
  const [approvals, setApprovals] = useState<Approval[]>(seedApprovals);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (s.role) setRole(s.role);
        if (s.siteId) setSiteId(s.siteId);
        if (s.entId) setEntId(s.entId);
        if (s.incidentState) setIncidentState(s.incidentState);
        if (s.audit) setAudit(s.audit);
        if (s.approvals) setApprovals(s.approvals);
      }
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(KEY, JSON.stringify({ role, siteId, entId, incidentState, audit, approvals })); } catch {}
  }, [loaded, role, siteId, entId, incidentState, audit, approvals]);

  const user = USERS[role];
  const log = useCallback(
    (action: string, target: string, facts = "—") => setAudit((a) => [{ id: `AU-${9005 + a.length}`, time: now(), user, role, action, target, facts }, ...a]),
    [user, role],
  );
  const setIncident = useCallback((id: string, s: IncidentState) => setIncidentState((m) => ({ ...m, [id]: s })), []);
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
    () => ({ role, setRole, user, siteId, setSiteId, entId, setEntId, incidentState, setIncident, audit, log, approvals, decide, request }),
    [role, user, siteId, entId, incidentState, setIncident, audit, log, approvals, decide, request],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useConsole() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useConsole outside provider");
  return c;
}

export function canAct(role: Role, area: "dc" | "enterprise" | "approve-dc" | "approve-ent") {
  if (role === "Auditor") return false;
  if (role === "Executive") return area === "approve-dc" || area === "approve-ent";
  if (role === "DC operator") return area === "dc" || area === "approve-dc";
  if (role === "Architect") return area === "enterprise" || area === "approve-ent";
  return false;
}
