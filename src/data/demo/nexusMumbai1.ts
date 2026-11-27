/**
 * Nexus Mumbai-1 — the pre-seeded reference site.
 * 148 components, 220 links (asserted below). Everything in the console reads from here,
 * so numbers stay consistent across screens.
 */

export const SITE = {
  name: "Nexus Mumbai-1",
  asOf: "27 Nov 2026, 09:00 IST",
  halls: 2,
};

export type CompType =
  | "Feed" | "Switchgear" | "Transformer" | "Genset" | "UPS" | "Battery" | "PDU"
  | "Chiller" | "CRAH" | "Hall" | "Row" | "Rack" | "CoreSwitch" | "AggSwitch" | "Sensor";

export interface Component {
  id: string;
  type: CompType;
  label: string;
  side?: "A" | "B";
  hall?: number;
  row?: number;
  tenant?: string;
  kw?: number; // rack draw
  make?: string;
}

export interface Link {
  source: string;
  target: string;
  kind: "power" | "cooling" | "contains" | "network" | "monitors";
}

/* ---------------- Tenants ---------------- */

export interface Tenant {
  id: string;
  name: string;
  rows: number[];
  slaMinutes: number; // time to SLA threshold once service is lost
  penaltyPerHour: number; // INR
  tier: "Platinum" | "Gold" | "Silver";
}

export const tenants: Tenant[] = [
  { id: "t1", name: "Aarohan Bank", rows: [1], slaMinutes: 15, penaltyPerHour: 1800000, tier: "Platinum" },
  { id: "t2", name: "Veda Cloud", rows: [2], slaMinutes: 30, penaltyPerHour: 950000, tier: "Gold" },
  { id: "t3", name: "Konark Telecom", rows: [3], slaMinutes: 20, penaltyPerHour: 1400000, tier: "Platinum" },
  { id: "t4", name: "Saffron Retail", rows: [4], slaMinutes: 60, penaltyPerHour: 420000, tier: "Silver" },
  { id: "t5", name: "Indus Health", rows: [5], slaMinutes: 15, penaltyPerHour: 1600000, tier: "Platinum" },
  { id: "t6", name: "Meridian Media", rows: [6], slaMinutes: 45, penaltyPerHour: 520000, tier: "Silver" },
  { id: "t7", name: "Nilgiri Insurance", rows: [7], slaMinutes: 30, penaltyPerHour: 880000, tier: "Gold" },
  { id: "t8", name: "Trident GCC", rows: [8], slaMinutes: 30, penaltyPerHour: 760000, tier: "Gold" },
];

export function tenantForRow(row: number) {
  return tenants.find((t) => t.rows.includes(row))!;
}

/* ---------------- Components & links (deterministic) ---------------- */

const comps: Component[] = [];
const links: Link[] = [];
const add = (c: Component) => comps.push(c);
const link = (source: string, target: string, kind: Link["kind"]) => links.push({ source, target, kind });

// Power chain
add({ id: "FEED-A", type: "Feed", label: "Feed A", side: "A" });
add({ id: "FEED-B", type: "Feed", label: "Feed B", side: "B" });
add({ id: "SG-A", type: "Switchgear", label: "MV Switchgear A", side: "A" });
add({ id: "SG-B", type: "Switchgear", label: "MV Switchgear B", side: "B" });
link("FEED-A", "SG-A", "power");
link("FEED-B", "SG-B", "power");
["T1", "T2", "T3", "T4"].forEach((t, i) => {
  const side = i < 2 ? "A" : "B";
  add({ id: t, type: "Transformer", label: `Transformer ${t}`, side, make: "Siemens GEAFOL 2.5 MVA" });
  link(`SG-${side}`, t, "power");
});
["G1", "G2", "G3", "G4"].forEach((g, i) => {
  const side = i < 2 ? "A" : "B";
  add({ id: g, type: "Genset", label: `Genset ${g}`, side, make: "Cummins C2000 D5" });
  link(g, `SG-${side}`, "power");
});
// UPS: odd = A side, even = B side. Pairs (1,2) (3,4) (5,6) (7,8)
const upsTrafo: Record<number, string> = { 1: "T1", 3: "T1", 5: "T2", 7: "T2", 2: "T3", 4: "T3", 6: "T4", 8: "T4" };
for (let u = 1; u <= 8; u++) {
  const side = u % 2 ? "A" : "B";
  add({ id: `UPS-${u}`, type: "UPS", label: `UPS-${u}`, side, make: "Vertiv Liebert EXL S1 250 kVA" });
  add({ id: `BATT-${u}`, type: "Battery", label: `Battery string ${u}`, side, make: "Exide VRLA 12V 200Ah" });
  link(upsTrafo[u], `UPS-${u}`, "power");
  link(`BATT-${u}`, `UPS-${u}`, "power");
}
// Halls, rows, PDUs, racks
for (let h = 1; h <= 2; h++) add({ id: `HALL-${h}`, type: "Hall", label: `Hall ${h}`, hall: h });
const rowKw = [11.2, 9.6, 14.1, 7.4, 12.8, 8.1, 10.9, 13.5];
for (let r = 1; r <= 8; r++) {
  const hall = r <= 4 ? 1 : 2;
  add({ id: `ROW-${r}`, type: "Row", label: `Row ${r}`, hall, row: r });
  link(`ROW-${r}`, `HALL-${hall}`, "contains");
  const pair = Math.ceil(r / 2) * 2; // even UPS of pair
  const upsA = `UPS-${pair - 1}`;
  const upsB = `UPS-${pair}`;
  add({ id: `PDU-${r}A`, type: "PDU", label: `PDU-${r}A`, side: "A", hall, row: r, make: "Schneider APDU 63A" });
  add({ id: `PDU-${r}B`, type: "PDU", label: `PDU-${r}B`, side: "B", hall, row: r, make: "Schneider APDU 63A" });
  link(upsA, `PDU-${r}A`, "power");
  link(upsB, `PDU-${r}B`, "power");
  const tenant = tenantForRow(r);
  for (let k = 1; k <= 8; k++) {
    const id = `R${r}-${String(k).padStart(2, "0")}`;
    const kw = Math.round((rowKw[r - 1] + ((k * 7 + r * 3) % 5) - 2) * 10) / 10;
    add({ id, type: "Rack", label: `Rack ${id}`, hall, row: r, tenant: tenant.name, kw });
    link(`PDU-${r}A`, id, "power");
    link(`PDU-${r}B`, id, "power");
  }
}
// Cooling
for (let c = 1; c <= 4; c++) add({ id: `CH-${c}`, type: "Chiller", label: `Chiller CH-${c}`, make: "Carrier AquaForce 30XW" });
for (let c = 1; c <= 12; c++) {
  add({ id: `CRAH-${c}`, type: "CRAH", label: `CRAH-${c}`, make: "Stulz CyberAir 3PRO" });
  link(`CH-${Math.ceil(c / 3)}`, `CRAH-${c}`, "cooling");
}
// CRAH → rows: 12 links (rows 1..8, rows 1-4 get a 2nd CRAH)
const crahRow: [number, number][] = [[1, 1], [2, 1], [3, 2], [4, 3], [5, 3], [6, 4], [7, 5], [8, 6], [9, 7], [10, 8], [11, 2], [12, 4]];
crahRow.forEach(([c, r]) => link(`CRAH-${c}`, `ROW-${r}`, "cooling"));
// Network
add({ id: "CORE-1", type: "CoreSwitch", label: "Core switch 1", make: "Arista 7800R3" });
add({ id: "CORE-2", type: "CoreSwitch", label: "Core switch 2", make: "Arista 7800R3" });
for (let a = 1; a <= 6; a++) {
  add({ id: `AGG-${a}`, type: "AggSwitch", label: `Aggregation ${a}`, make: "Arista 7280R3" });
  link("CORE-1", `AGG-${a}`, "network");
  link("CORE-2", `AGG-${a}`, "network");
}
// Sensors
for (let s = 1; s <= 6; s++) {
  add({ id: `SNS-${s}`, type: "Sensor", label: `Env sensor bank ${s}` });
  link(`SNS-${s}`, `CRAH-${s + 3}`, "monitors");
}

export const components = comps;
export const graphLinks = links;
export const COMPONENT_COUNT = comps.length; // 148
export const LINK_COUNT = links.length; // 220

export function getComponent(id: string) {
  return comps.find((c) => c.id === id);
}

/** Downstream closure along power/cooling/contains edges. */
export function downstream(id: string): string[] {
  const out = new Set<string>();
  const stack = [id];
  while (stack.length) {
    const cur = stack.pop()!;
    for (const l of links) {
      if (l.source === cur && l.kind !== "contains" && !out.has(l.target)) {
        out.add(l.target);
        stack.push(l.target);
      }
    }
  }
  return [...out];
}

export function upstream(id: string): string[] {
  const out = new Set<string>();
  const stack = [id];
  while (stack.length) {
    const cur = stack.pop()!;
    for (const l of links) {
      if (l.target === cur && l.kind !== "contains" && !out.has(l.source)) {
        out.add(l.source);
        stack.push(l.source);
      }
    }
  }
  return [...out];
}

/* ---------------- Capacity ---------------- */

export interface RowCapacity {
  row: number;
  hall: number;
  ratedPowerKw: number; // PDU pair rating
  coolingLimitKw: number; // CRAH-limited
  usedKw: number;
  maxDensityKw: number; // per rack, air cooled
}

export const rowCapacity: RowCapacity[] = Array.from({ length: 8 }, (_, i) => {
  const r = i + 1;
  const used = comps.filter((c) => c.type === "Rack" && c.row === r).reduce((s, c) => s + (c.kw ?? 0), 0);
  const ratedPowerKw = 160;
  const coolingLimitKw = [1, 2, 3, 4].includes(r) ? 150 : [5, 6].includes(r) ? 128 : 120;
  return { row: r, hall: r <= 4 ? 1 : 2, ratedPowerKw, coolingLimitKw, usedKw: Math.round(used * 10) / 10, maxDensityKw: 30 };
});

export const capacity = (() => {
  const rated = rowCapacity.reduce((s, r) => s + r.ratedPowerKw, 0);
  const usable = rowCapacity.reduce((s, r) => s + Math.min(r.ratedPowerKw, r.coolingLimitKw), 0);
  const used = rowCapacity.reduce((s, r) => s + r.usedKw, 0);
  return {
    ratedKw: rated,
    usableKw: usable,
    usedKw: Math.round(used),
    headroomKw: Math.round(usable - used),
    strandedKw: rated - usable,
  };
})();

export interface FitResult {
  fits: boolean;
  requestKw: number;
  densityKw: number;
  racksNeeded: number;
  reasons: string[];
  plan: { step: number; title: string; detail: string; outage: string }[];
}

/** Deterministic fit check — same input, same output. */
export function fitCheck(requestKw: number, densityKw: number): FitResult {
  const racksNeeded = Math.ceil(requestKw / densityKw);
  const reasons: string[] = [];
  if (densityKw > 30) reasons.push(`${densityKw} kW per rack exceeds the 30 kW air-cooled limit of every CRAH-served row`);
  if (requestKw > capacity.headroomKw) reasons.push(`${requestKw.toLocaleString("en-IN")} kW exceeds usable headroom of ${capacity.headroomKw} kW`);
  const freeRacks = 0;
  if (racksNeeded > freeRacks + 16) reasons.push(`${racksNeeded} racks needed; Hall 2 rows 7–8 can be re-planned for 16`);
  const fits = reasons.length === 0;
  const plan = fits
    ? []
    : [
        { step: 1, title: "Install CDUs and rear-door heat exchangers, Hall 2 rows 7–8", detail: "Liquid-assisted cooling lifts rack density from 30 kW to 60 kW", outage: "No tenant outage; works behind containment" },
        { step: 2, title: "Add chiller CH-5 (1.2 MW) on the Hall 2 loop", detail: `Removes the cooling constraint stranding ${capacity.strandedKw} kW today`, outage: "None; parallel loop tie-in in a planned window" },
        { step: 3, title: "Replace PDU-7A/7B, PDU-8A/8B with 125A 3-phase units", detail: "Raises row rating from 160 kW to 480 kW", outage: "Single-path for Nilgiri Insurance and Trident GCC during swap" },
        { step: 4, title: "Add two 500 kVA UPS modules to the UPS-7/UPS-8 pair", detail: "Keeps N+N redundancy at the new load", outage: "None; modular hot-add" },
        { step: 5, title: "New 2.5 MVA transformer T5 from Feed B and T6 from Feed A", detail: "Brings the 2 MW block onto both feeds", outage: "Feed switchover needed — run through D4" },
      ];
  return { fits, requestKw, densityKw, racksNeeded, reasons, plan };
}

/* ---------------- KPIs ---------------- */

export const pueTrend = [
  { d: "Nov 01", pue: 1.52 }, { d: "Nov 04", pue: 1.51 }, { d: "Nov 07", pue: 1.49 }, { d: "Nov 10", pue: 1.5 },
  { d: "Nov 13", pue: 1.48 }, { d: "Nov 16", pue: 1.47 }, { d: "Nov 19", pue: 1.49 }, { d: "Nov 22", pue: 1.46 },
  { d: "Nov 25", pue: 1.47 }, { d: "Nov 27", pue: 1.48 },
];

/* ---------------- Alarms & incidents ---------------- */

export interface Alarm {
  id: string;
  time: string;
  source: "BMS" | "DCIM" | "NMS" | "EPMS";
  asset: string;
  message: string;
  severity: "Critical" | "Major" | "Minor";
  role: "cause" | "symptom";
}

export const alarmStorm: Alarm[] = [
  { id: "A-4401", time: "08:41:07", source: "BMS", asset: "CH-2", message: "Compressor 1 trip — high discharge pressure", severity: "Critical", role: "cause" },
  { id: "A-4402", time: "08:41:52", source: "BMS", asset: "CRAH-4", message: "Chilled water supply temp high (14.8 °C)", severity: "Major", role: "symptom" },
  { id: "A-4403", time: "08:42:10", source: "BMS", asset: "CRAH-5", message: "Chilled water supply temp high (15.1 °C)", severity: "Major", role: "symptom" },
  { id: "A-4404", time: "08:42:31", source: "BMS", asset: "CRAH-6", message: "Supply air temp high (24.9 °C)", severity: "Major", role: "symptom" },
  { id: "A-4405", time: "08:43:02", source: "DCIM", asset: "R3-04", message: "Rack inlet temp 29.1 °C over 27 °C threshold", severity: "Major", role: "symptom" },
  { id: "A-4406", time: "08:43:05", source: "DCIM", asset: "R3-05", message: "Rack inlet temp 28.7 °C over 27 °C threshold", severity: "Major", role: "symptom" },
  { id: "A-4407", time: "08:43:19", source: "DCIM", asset: "R4-02", message: "Rack inlet temp 28.2 °C over 27 °C threshold", severity: "Minor", role: "symptom" },
  { id: "A-4408", time: "08:43:44", source: "DCIM", asset: "R4-06", message: "Rack inlet temp 27.9 °C over 27 °C threshold", severity: "Minor", role: "symptom" },
  { id: "A-4409", time: "08:44:10", source: "NMS", asset: "AGG-3", message: "Fan tray speed at 100% — thermal", severity: "Minor", role: "symptom" },
  { id: "A-4410", time: "08:44:26", source: "EPMS", asset: "PDU-3A", message: "Branch current rising (server fans ramping)", severity: "Minor", role: "symptom" },
  { id: "A-4411", time: "08:44:31", source: "EPMS", asset: "PDU-3B", message: "Branch current rising (server fans ramping)", severity: "Minor", role: "symptom" },
  { id: "A-4412", time: "08:45:03", source: "DCIM", asset: "R3-07", message: "Rack inlet temp 28.4 °C over 27 °C threshold", severity: "Major", role: "symptom" },
  { id: "A-4413", time: "08:45:40", source: "BMS", asset: "SNS-1", message: "Hall 1 cold aisle 3 humidity drift", severity: "Minor", role: "symptom" },
  { id: "A-4414", time: "08:46:12", source: "NMS", asset: "AGG-4", message: "Optic temp warning port 12", severity: "Minor", role: "symptom" },
];

export interface Incident {
  id: string;
  title: string;
  opened: string;
  status: "Open" | "Acknowledged" | "Assigned" | "Resolved";
  severity: "P1" | "P2" | "P3";
  alarms: number;
  rootCause: string;
  confidence: number;
  causes: { cause: string; confidence: number; evidence: string }[];
  blast: { rows: number[]; racks: number; tenants: string[] };
  nextStep: { step: string; owner: string; due: string; source: string };
  owner?: string;
  certain: boolean;
}

export const incidents: Incident[] = [
  {
    id: "INC-2611",
    title: "Hall 1 cooling degradation — rows 3–4",
    opened: "08:41",
    status: "Open",
    severity: "P1",
    alarms: 14,
    rootCause: "Chiller CH-2 compressor 1 trip",
    confidence: 0.86,
    certain: true,
    causes: [
      { cause: "Chiller CH-2 compressor 1 trip", confidence: 0.86, evidence: "First alarm in the storm; CRAH-4/5/6 all fed by CH-2 (graph); CHW supply temp rose 3.1 °C within 70 s" },
      { cause: "CRAH-5 fan failure", confidence: 0.09, evidence: "CRAH-5 fan current normal; only supply temp deviates" },
      { cause: "Sensor bank SNS-1 fault", confidence: 0.05, evidence: "Humidity drift only; temperatures confirmed by 6 rack sensors" },
    ],
    blast: { rows: [3, 4], racks: 16, tenants: ["Konark Telecom", "Saffron Retail"] },
    nextStep: { step: "Start standby chiller CH-1 lag pump and stage compressor 2 on CH-2 (Runbook RB-CH-07, step 3)", owner: "Facilities on-call — R. Kulkarni", due: "08:58", source: "S1 · Runbook RB-CH-07 rev 4" },
  },
  {
    id: "INC-2608",
    title: "UPS-6 output harmonic distortion",
    opened: "06:12",
    status: "Acknowledged",
    severity: "P2",
    alarms: 3,
    rootCause: "Uncertain — inverter IGBT or upstream THD",
    confidence: 0.54,
    certain: false,
    causes: [
      { cause: "Inverter IGBT degradation", confidence: 0.54, evidence: "THD trend up 0.4%/week (BigQuery ML drift)" },
      { cause: "Upstream THD on Feed B", confidence: 0.38, evidence: "Feed B THD 4.1% vs 2.9% on Feed A" },
      { cause: "Measurement error", confidence: 0.08, evidence: "Single meter only" },
    ],
    blast: { rows: [5, 6], racks: 16, tenants: ["Indus Health", "Meridian Media"] },
    nextStep: { step: "On-call engineer to confirm cause before ITSM incident is raised", owner: "Electrical on-call — S. Menon", due: "10:12", source: "S1 · Runbook RB-UPS-12 rev 2" },
    owner: "S. Menon",
  },
  {
    id: "INC-2603",
    title: "Core switch 2 PSU redundancy lost",
    opened: "Yesterday 22:30",
    status: "Assigned",
    severity: "P3",
    alarms: 1,
    rootCause: "PSU-2 failed on CORE-2",
    confidence: 0.97,
    certain: true,
    causes: [{ cause: "PSU-2 failed on CORE-2", confidence: 0.97, evidence: "NMS PSU status + vendor trap" }],
    blast: { rows: [], racks: 0, tenants: [] },
    nextStep: { step: "Replace PSU under vendor RMA #A-88213", owner: "Network NOC — P. Shah", due: "Today 18:00", source: "S1 · Arista advisory (external)" },
    owner: "P. Shah",
  },
];

/* ---------------- Risk watchlist (D3) ---------------- */

export interface RiskItem {
  asset: string;
  type: string;
  drift: string;
  eolScore: number; // 0–100, higher = closer to end of life
  actBy: string;
  replaceBy: string;
  exposure: string;
  tenants: string[];
  evidence: string;
  peerDelta: string;
}

export const watchlist: RiskItem[] = [
  { asset: "BATT-4", type: "Battery string", drift: "Cell temp +6.2 °C vs peers", eolScore: 88, actBy: "04 Dec 2026", replaceBy: "15 Jan 2027", exposure: "Rows 3–4 lose B-side ride-through", tenants: ["Konark Telecom", "Saffron Retail"], evidence: "Internal resistance +18% in 60 days; 2 cells over 40 °C", peerDelta: "+6.2 °C" },
  { asset: "UPS-6", type: "UPS", drift: "Output THD +0.4%/week", eolScore: 71, actBy: "12 Dec 2026", replaceBy: "Q2 2027", exposure: "Rows 5–6 single-path if UPS-6 trips", tenants: ["Indus Health", "Meridian Media"], evidence: "THD 3.9% vs peer mean 2.1%", peerDelta: "+1.8 pts" },
  { asset: "CRAH-7", type: "CRAH", drift: "Fan vibration 7.1 mm/s", eolScore: 64, actBy: "20 Dec 2026", replaceBy: "Mar 2027", exposure: "Row 5 cooling margin −22 kW", tenants: ["Indus Health"], evidence: "Vibration doubled since Sep; bearing noise signature", peerDelta: "+3.4 mm/s" },
  { asset: "CH-3", type: "Chiller", drift: "kW/TR +9% vs peers", eolScore: 52, actBy: "10 Jan 2027", replaceBy: "FY28", exposure: "PUE +0.02; rows 7–8 cooling margin", tenants: ["Nilgiri Insurance", "Trident GCC"], evidence: "Condenser approach temp up 2.3 °C", peerDelta: "+9%" },
  { asset: "PDU-5B", type: "PDU", drift: "Breaker temp +11 °C", eolScore: 47, actBy: "18 Jan 2027", replaceBy: "Inspect", exposure: "Row 5 B-side", tenants: ["Indus Health"], evidence: "IR scan + EPMS thermal point", peerDelta: "+11 °C" },
  { asset: "G3", type: "Genset", drift: "Start time 11.8 s vs 8 s", eolScore: 39, actBy: "31 Jan 2027", replaceBy: "Service", exposure: "Feed B backup start window", tenants: ["All B-side"], evidence: "Last 4 monthly tests trending up", peerDelta: "+3.8 s" },
];

/* ---------------- Switchover (D4) ---------------- */

export interface SwitchoverScenario {
  id: string;
  label: string;
  asset: string;
  verdict: "GO" | "GO WITH CONDITIONS" | "NO-GO";
  conditions: string[];
  loads: { asset: string; status: "Redundant" | "Single-path" | "Lost"; tenants: string[] }[];
  exposure: number; // INR if the single path fails during window
  windows: { date: string; time: string; score: number; reason: string }[];
  runbook: { step: string; rollback?: string }[];
}

export const switchoverScenarios: SwitchoverScenario[] = [
  {
    id: "feed-a-to-b",
    label: "Feed A to Feed B",
    asset: "FEED-A",
    verdict: "GO WITH CONDITIONS",
    conditions: [
      "BATT-4 is on the D3 watchlist (cell temp +6.2 °C); replace or bypass-test before the window",
      "Genset G3 start time 11.8 s — run a load bank test 48 h before",
      "Notify Aarohan Bank, Konark Telecom and Indus Health (Platinum, 15–20 min SLA)",
    ],
    loads: [
      { asset: "UPS-1 / UPS-2", status: "Single-path", tenants: ["Aarohan Bank", "Veda Cloud"] },
      { asset: "UPS-3 / UPS-4", status: "Single-path", tenants: ["Konark Telecom", "Saffron Retail"] },
      { asset: "UPS-5 / UPS-6", status: "Single-path", tenants: ["Indus Health", "Meridian Media"] },
      { asset: "UPS-7 / UPS-8", status: "Single-path", tenants: ["Nilgiri Insurance", "Trident GCC"] },
      { asset: "Chillers CH-1–CH-4", status: "Redundant", tenants: [] },
      { asset: "Core network", status: "Redundant", tenants: [] },
    ],
    exposure: 8350000,
    windows: [
      { date: "Sun 06 Dec", time: "02:00–05:00", score: 94, reason: "Lowest load (61%); no tenant change freezes; BATT-4 replaced by then" },
      { date: "Sun 13 Dec", time: "02:00–05:00", score: 88, reason: "Low load; Veda Cloud maintenance overlaps 03:00" },
      { date: "Sat 05 Dec", time: "23:00–02:00", score: 81, reason: "Aarohan Bank batch window ends 23:30" },
      { date: "Wed 09 Dec", time: "01:00–04:00", score: 63, reason: "Weekday; Konark Telecom change freeze" },
      { date: "Fri 04 Dec", time: "02:00–05:00", score: 41, reason: "BATT-4 still on watchlist" },
    ],
    runbook: [
      { step: "Confirm all B-side UPS on normal mode and batteries > 90% (EPMS)", rollback: "Abort; no change made" },
      { step: "Start gensets G3 and G4 on Feed B, hold at no-load 5 min", rollback: "Stop gensets" },
      { step: "Transfer SG-A load to tie breaker; open Feed A incomer", rollback: "Close Feed A incomer; open tie" },
      { step: "Verify A-side UPS on battery then on B-side source within 30 s", rollback: "Return to Feed A per step 3 rollback" },
      { step: "Perform Feed A maintenance (HT cable termination)" },
      { step: "Close Feed A incomer; open tie; return SG-A to Feed A", rollback: "Hold on tie; escalate to utility" },
      { step: "Confirm both paths redundant; close change in ITSM after approval" },
    ],
  },
  {
    id: "ups-3-maintenance",
    label: "UPS-3 maintenance bypass",
    asset: "UPS-3",
    verdict: "NO-GO",
    conditions: [
      "Peer UPS-4 carries BATT-4 on the watchlist — rows 3–4 would be one failure from an outage",
      "INC-2611 open on rows 3–4 cooling",
    ],
    loads: [
      { asset: "PDU-3A / PDU-4A", status: "Single-path", tenants: ["Konark Telecom", "Saffron Retail"] },
      { asset: "Rows 3–4 (16 racks)", status: "Single-path", tenants: ["Konark Telecom", "Saffron Retail"] },
    ],
    exposure: 1820000,
    windows: [
      { date: "Sun 20 Dec", time: "02:00–04:00", score: 72, reason: "After BATT-4 replacement and INC-2611 closure" },
      { date: "Sun 27 Dec", time: "02:00–04:00", score: 69, reason: "Low load" },
    ],
    runbook: [
      { step: "Replace BATT-4 first (D3 watchlist)" },
      { step: "Close INC-2611" },
      { step: "Re-run D4 switchover check" },
    ],
  },
  {
    id: "crah-7-swap",
    label: "CRAH-7 fan replacement",
    asset: "CRAH-7",
    verdict: "GO",
    conditions: [],
    loads: [{ asset: "Row 5", status: "Redundant", tenants: ["Indus Health"] }],
    exposure: 0,
    windows: [
      { date: "Tue 01 Dec", time: "10:00–12:00", score: 91, reason: "Row 5 cooling margin 34 kW with CRAH-7 off" },
      { date: "Thu 03 Dec", time: "10:00–12:00", score: 89, reason: "Same margin; vendor available" },
    ],
    runbook: [
      { step: "Set CRAH-8 to lead; confirm row 5 inlet < 25 °C", rollback: "Return CRAH-7 to lead" },
      { step: "Isolate CRAH-7 and replace fan assembly" },
      { step: "Commission and return to rotation" },
    ],
  },
];

/* ---------------- Copilot templates (S1 / Orchestrator) ---------------- */

export const dailyBrief = [
  "One P1 is open: INC-2611, Hall 1 cooling on rows 3–4, root cause Chiller CH-2 compressor 1 trip (confidence 0.86). Konark Telecom's SLA clock has 13 min to threshold.",
  "D3 flagged BATT-4 before any alarm: cell temperature +6.2 °C against peers, act by 04 Dec.",
  `Usable headroom is ${capacity.headroomKw} kW; ${capacity.strandedKw} kW is stranded by cooling limits.`,
  "The Feed A maintenance switchover is GO WITH CONDITIONS; safest window Sun 06 Dec 02:00–05:00.",
];

export const searchIndex = [
  { q: "battery getting hot", results: [
    { title: "RB-BATT-03 · VRLA thermal runaway response", kind: "Runbook", reason: "Matches 'battery' + 'temperature rise'; step 2 isolates the string", href: "/console/dc/risk" },
    { title: "INC-2214 · BATT-2 cell over-temperature (Mar 2026)", kind: "Incident", reason: "Same make and model; resolved by string replacement", href: "/console/dc/incidents" },
    { title: "RB-UPS-09 · Battery string bypass", kind: "Runbook", reason: "Needed if the string is taken out under load", href: "/console/dc/switchover" },
    { title: "Exide VRLA 12V 200Ah — thermal advisory", kind: "External advisory", reason: "Public advisory for this make and model · exide.com · Aug 2026", href: "#" },
  ]},
  { q: "chiller trip", results: [
    { title: "RB-CH-07 · Chiller compressor trip recovery", kind: "Runbook", reason: "Exact match to CH-2 alarm text", href: "/console/dc/incidents" },
    { title: "INC-2477 · CH-1 high discharge pressure (Jul 2026)", kind: "Incident", reason: "Same alarm code; condenser fouling", href: "/console/dc/incidents" },
  ]},
];

export function copilotAnswer(input: string): { text: string; facts: string[] } {
  const q = input.toLowerCase();
  const m = q.match(/(ups|pdu|crah|ch|batt|feed|g)[- ]?(\w+)/);
  if (q.includes("depend") && m) {
    const id = `${m[1].toUpperCase()}-${m[2].toUpperCase()}`.replace("FEED-", "FEED-");
    const comp = getComponent(id);
    if (comp) {
      const ds = downstream(id);
      const racks = ds.filter((d) => d.startsWith("R") && d.includes("-") && !d.startsWith("ROW"));
      const rows = [...new Set(racks.map((r) => Number(r.slice(1, r.indexOf("-")))))];
      const ts = rows.map((r) => tenantForRow(r).name);
      return {
        text: `${comp.label} feeds ${ds.length} downstream components: ${racks.length} racks across row${rows.length > 1 ? "s" : ""} ${rows.join(", ")}. Tenants: ${ts.join(", ")}. Each rack is dual-fed, so losing ${comp.label} alone leaves these racks on a single path rather than down.`,
        facts: [`graph.downstream(${id}) = ${ds.length}`, `racks = ${racks.length}`, `tenants = ${ts.length}`],
      };
    }
  }
  if (q.includes("stranded")) {
    return { text: `${capacity.strandedKw} kW is stranded: paid for in PDU ratings but unusable because CRAH cooling limits every row below its 160 kW power rating.`, facts: [`capacity.strandedKw = ${capacity.strandedKw}`] };
  }
  if (q.includes("incident") || q.includes("alarm")) {
    return { text: `INC-2611 groups 14 alarms into one incident. Top cause: Chiller CH-2 compressor 1 trip (confidence 0.86). Blast radius: rows 3–4, 16 racks, Konark Telecom and Saffron Retail.`, facts: ["incident.INC-2611", "correlation.rank[0] = 0.86"] };
  }
  return {
    text: "Template answer: I can answer questions about dependencies (\"What depends on UPS-1?\"), stranded capacity, open incidents and switchover plans for Nexus Mumbai-1. Every figure comes from an engine fact.",
    facts: ["template.fallback"],
  };
}
