"use client";

import { useEffect, useState } from "react";
import { useConsole } from "@/components/providers/ConsoleStore";

/* ---------- types (mirror scripts/build-console.mjs) ---------- */
export interface Hall { id: string; name: string; designKw: number; rackKw: number; racks: number; leased: number; vacant: number; soldKw: number; measuredKw: number; limitKw: number; binding: string; strandedKw: number; headroomKw: number }
export interface Rack { id: string; hall: string; row: string; pos: number; kw: number; load: number; tenant: string | null; status: string; zone: string }
export interface Asset { id: string; type: string; hall: string | null; chain: string; kw: number | null; status: string; group: string | null; install: string; lifeY: number | null; lot: string | null; model: string }
export interface Contract { id: string; uptime: number; thresholdH: number; ratePerH: number; notifyMin: number; priceKwMonth: number }
export interface Tenant { id: string; name: string; tier: string; kind: string; enterprise: string | null; racks: number; contract: Contract | null }
export interface Alert { id: string; target: string; targetType: string; severity: string; message: string; cls: string; raisedAt: string; status: string; role: "cause" | "symptom" | "upstream consequence" | "unrelated" }
export interface DcIncident { id: string; severity: number; openedAt: string; resolvedAt: string | null; durationMin: number | null; rootCause: string; rootAsset: string; status: string; runbook: string | null }
export interface WatchItem { id: string; type: string; hall: string; lot: string | null; install: string; lifeY: number; ageRatio: number; replaceBy: string; actBy: string; riseC: number | null; z: number | null; score: number; racks: number; tenants: string[]; cost: number | null; leadDays: number | null; make: string; temps: number[]; maint: { on: string; kind: string; outcome: string; reading: string }[] }
export type Link = [src: string, dst: string, type: string, side?: string];
export interface SiteData {
  site: { id: string; name: string; city: string; kind: string; operator: string; tier: string; year: number; grid: string; dualFeed: boolean };
  asOf: string;
  kpis: { racks: number; leased: number; leasedPct: number; itLoadKw: number; soldKw: number; limitKw: number; strandedKw: number; headroomKw: number; assets: number; inService: number };
  halls: Hall[]; rows: { id: string; hall: string; no: number }[]; racks: Rack[]; assets: Asset[]; links: Link[];
  tenants: Tenant[]; alerts: Alert[]; incidents: DcIncident[];
  bookings: { id: string; asset: string; start: string; end: string; purpose: string }[];
  pue: { month: string; pue: number; it: number }[];
  watchlist: WatchItem[]; peerTemps: number[];
}
export interface Runbook { id: string; title: string; type: string; team: string; limit: number; keywords: string; steps: { seq: number; kind: string; text: string; team: string; limit: number }[] }

export type SevenR = "Retire" | "Retain" | "Rehost" | "Replatform" | "Repurchase" | "Refactor" | "Relocate";
export interface EntApp {
  id: string; name: string; owner: string; tier: string; hosting: string; model: string; dataClass: string; costInr: number; infraInr: number | null; users: number | null;
  lifecycle: string; rtoH: number | null; primary: string | null; dr: string | null; capability: string; components: number;
  techs: { id: string; name: string; product: string; eol: string; status: string; past: boolean }[]; eolTechs: number; vulnLibs: string[]; regs: string[];
  decision: { id: string; forum: string; on: string; decision: string; rationale: string; approver: string; evidence: string; status: string } | null;
  path: SevenR; scores: { fit: number; cost: number; risk: number; debt: number }; wave: number; dependents: number;
}
export interface EntData {
  enterprise: { id: string; name: string; kind: string; hq: string; story: string };
  apps: EntApp[];
  appLinks: { from: string; to: string; calls: number; minConf: number; avgConf: number; evidence: Record<string, number> }[];
  weakLinks: { id: string; from: string; fromApp: string; to: string; toApp: string; protocol: string; evidence: string; confidence: number }[];
  standards: { id: string; name: string; framework: string; product: string; governs: string[]; deviations: number | null }[];
  pipelines: { runs: number; fail_rate: number; test_gate_failures: number; flaky_pipelines: number; corr_with_prod_incident: number; recent: { id: string; pipeline: string; app: string; stages: string[]; result: string; failedStage: string | null; at: string; durationMin: number; commit: string }[] };
  deployments: { id: string; app: string; component: string; env: string; at: string; causedIncident: boolean; rolledBack: boolean }[];
  incidents: { id: string; severity: number; openedAt: string; durationMin: number | null; rootCause: string; status: string; app: string; deployment: { id: string; component: string; at: string; rolledBack: boolean; commit: string } | null }[];
  traced: { incidents: number; traced: number; share: number };
  cloud: { resources: number; idle_nonprod: number; idle_inr_month: number; no_owner_tag: number; no_app_tag: number; billed_6m_inr: number; tag_attributable_pct: number; graph_attributable_pct: number; idle: { id: string; service: string; env: string; region: string; cpu: number; monthlyInr: number; app: string; owner: string }[] };
  scorecard: { area: string; measure: string; score: number; target: number; raw: string }[];
  priorities: { item: string; value_inr: number; effort: number }[];
  retireNotDone: { app: string; dependents: number; costInr: number }[];
  hotspots: { name: string; direct_callers: number; all_callers: number; applications: number; tier1: number; weak_links: number }[];
  residency: { app: string; region: string; data: string }[];
  crossBorder: { app: string; region: string }[];
  dr: { singlePathDr: string[]; sharedGrid: string[]; noDr: string[] };
  profile: { applications: number; on_prem_pct: number; cloud_pct: number; median_run_cost_inr: number; tier1: number; eol_app_pct: number; pipeline_fail_rate: number; incidents: number };
}

export const SITES = [
  { id: "MUM1", name: "Nexus Mumbai-1" },
  { id: "MUM2", name: "Nexus Navi Mumbai-2" },
  { id: "CHN1", name: "SouthGrid Chennai-1" },
  { id: "HYD1", name: "SouthGrid Hyderabad-1" },
  { id: "PUN1", name: "Halden GCC Pune" },
  { id: "NOI1", name: "Bharat Mercantile Bank DR Noida" },
];
export const ENTERPRISES = [
  { id: "ENT-BANK", name: "Bharat Mercantile Bank" },
  { id: "ENT-GCC", name: "Halden Global Services India" },
  { id: "ENT-ZEN", name: "Zenith Commerce" },
];

/* ---------- loaders ---------- */
const cache = new Map<string, Promise<unknown>>();
function load<T>(file: string): Promise<T> {
  if (!cache.has(file)) cache.set(file, fetch(`/console/${file}`).then((r) => r.json()));
  return cache.get(file) as Promise<T>;
}
function useJson<T>(file: string | null) {
  const [data, setData] = useState<{ file: string; v: T } | null>(null);
  useEffect(() => {
    if (!file) return;
    let live = true;
    load<T>(file).then((v) => live && setData({ file, v }));
    return () => { live = false; };
  }, [file]);
  return data && data.file === file ? data.v : null;
}
export function useSite() {
  const { siteId } = useConsole();
  return useJson<SiteData>(`site-${siteId}.json`);
}
export function useEnterprise() {
  const { entId } = useConsole();
  return useJson<EntData>(`ent-${entId}.json`);
}
export function useRunbooks() {
  return useJson<Runbook[]>("runbooks.json");
}

export function tenantName(s: SiteData, id: string | null) {
  return s.tenants.find((t) => t.id === id)?.name ?? id ?? "Vacant";
}
export const fmtTime = (iso: string) => new Date(iso).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" });
