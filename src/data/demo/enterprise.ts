/** Pre-seeded Enterprise estate for the Enterprise console. */

export type SevenR = "Retire" | "Retain" | "Rehost" | "Replatform" | "Repurchase" | "Refactor" | "Relocate";

export interface App {
  id: string;
  name: string;
  capability: string;
  owner: string;
  stack: string[];
  hosting: string;
  dataStores: string[];
  costYear: number; // INR
  scores: { fit: number; cost: number; risk: number; debt: number };
  path: SevenR;
  wave: number;
  approved: boolean;
  togafFails: string[];
  unsupported?: string;
}

export const apps: App[] = [
  { id: "core-banking-gw", name: "Core Banking Gateway", capability: "Payments", owner: "A. Rao", stack: ["Java 8", "Spring 4", "IBM MQ"], hosting: "On-prem VM", dataStores: ["Oracle 12c"], costYear: 21000000, scores: { fit: 72, cost: 58, risk: 81, debt: 77 }, path: "Replatform", wave: 2, approved: true, togafFails: ["T-04 Unsupported runtime (Java 8)", "D-02 No data owner registered"], unsupported: "Oracle 12c (support ended)" },
  { id: "loan-origination", name: "Loan Origination", capability: "Lending", owner: "M. Iyer", stack: [".NET Framework 4.6", "WCF"], hosting: "On-prem VM", dataStores: ["SQL Server 2014"], costYear: 14500000, scores: { fit: 48, cost: 66, risk: 74, debt: 82 }, path: "Refactor", wave: 3, approved: false, togafFails: ["A-07 Point-to-point integrations (11)", "T-04 Unsupported runtime"], unsupported: "SQL Server 2014" },
  { id: "crm-legacy", name: "CRM (legacy)", capability: "Customer 360", owner: "S. Das", stack: ["Siebel 8.1"], hosting: "On-prem", dataStores: ["Oracle 11g"], costYear: 18800000, scores: { fit: 31, cost: 79, risk: 68, debt: 90 }, path: "Repurchase", wave: 2, approved: true, togafFails: ["B-03 Duplicates capability of Salesforce CRM"], unsupported: "Siebel 8.1" },
  { id: "salesforce-crm", name: "Salesforce CRM", capability: "Customer 360", owner: "S. Das", stack: ["Salesforce"], hosting: "SaaS", dataStores: ["Salesforce"], costYear: 9600000, scores: { fit: 88, cost: 42, risk: 22, debt: 18 }, path: "Retain", wave: 0, approved: true, togafFails: [] },
  { id: "hr-portal", name: "HR Self-Service Portal", capability: "Workforce", owner: "K. Nair", stack: ["PHP 5.6", "jQuery"], hosting: "On-prem VM", dataStores: ["MySQL 5.5"], costYear: 2400000, scores: { fit: 22, cost: 35, risk: 62, debt: 88 }, path: "Retire", wave: 1, approved: true, togafFails: ["T-04 Unsupported runtime (PHP 5.6)"], unsupported: "PHP 5.6" },
  { id: "data-warehouse", name: "Enterprise Data Warehouse", capability: "Analytics", owner: "R. Jain", stack: ["Teradata", "Informatica"], hosting: "On-prem appliance", dataStores: ["Teradata"], costYear: 32000000, scores: { fit: 66, cost: 91, risk: 45, debt: 63 }, path: "Replatform", wave: 3, approved: false, togafFails: ["D-05 No lineage for 40% of feeds"] },
  { id: "mobile-api", name: "Mobile Banking API", capability: "Digital channels", owner: "V. Pillai", stack: ["Node 18", "Express"], hosting: "GKE", dataStores: ["Cloud SQL Postgres"], costYear: 6100000, scores: { fit: 91, cost: 38, risk: 28, debt: 21 }, path: "Retain", wave: 0, approved: true, togafFails: [] },
  { id: "doc-mgmt", name: "Document Management", capability: "Content", owner: "L. Thomas", stack: ["FileNet 5.2"], hosting: "On-prem", dataStores: ["DB2"], costYear: 7300000, scores: { fit: 55, cost: 61, risk: 52, debt: 70 }, path: "Rehost", wave: 1, approved: true, togafFails: ["T-09 Not on approved hosting list"] },
  { id: "fraud-engine", name: "Fraud Scoring Engine", capability: "Risk", owner: "A. Rao", stack: ["Python 3.11", "FastAPI"], hosting: "GKE", dataStores: ["BigQuery"], costYear: 5200000, scores: { fit: 86, cost: 33, risk: 31, debt: 24 }, path: "Retain", wave: 0, approved: true, togafFails: [] },
  { id: "branch-dr", name: "Branch Apps DR site", capability: "Resilience", owner: "N. Gupta", stack: ["Mixed"], hosting: "Colo DC-2", dataStores: ["Mixed"], costYear: 11200000, scores: { fit: 58, cost: 72, risk: 49, debt: 55 }, path: "Relocate", wave: 2, approved: false, togafFails: [] },
];

export const sevenRColors: Record<SevenR, string> = {
  Retire: "bg-slate-100 text-slate-600",
  Retain: "bg-green-50 text-green-700",
  Rehost: "bg-sky-50 text-sky-700",
  Replatform: "bg-brand-soft text-brand-blue",
  Repurchase: "bg-violet-50 text-violet-700",
  Refactor: "bg-amber-50 text-amber-700",
  Relocate: "bg-teal-50 text-teal-700",
};

export interface DepLink {
  from: string;
  to: string;
  kind: "call" | "data";
  confidence: number;
  verified: boolean;
}

export const depLinks: DepLink[] = [
  { from: "mobile-api", to: "core-banking-gw", kind: "call", confidence: 0.98, verified: true },
  { from: "core-banking-gw", to: "fraud-engine", kind: "call", confidence: 0.95, verified: true },
  { from: "loan-origination", to: "core-banking-gw", kind: "call", confidence: 0.91, verified: true },
  { from: "loan-origination", to: "doc-mgmt", kind: "data", confidence: 0.62, verified: false },
  { from: "crm-legacy", to: "data-warehouse", kind: "data", confidence: 0.88, verified: true },
  { from: "salesforce-crm", to: "data-warehouse", kind: "data", confidence: 0.94, verified: true },
  { from: "hr-portal", to: "doc-mgmt", kind: "call", confidence: 0.41, verified: false },
  { from: "data-warehouse", to: "fraud-engine", kind: "data", confidence: 0.57, verified: false },
  { from: "crm-legacy", to: "loan-origination", kind: "call", confidence: 0.83, verified: true },
  { from: "branch-dr", to: "core-banking-gw", kind: "data", confidence: 0.49, verified: false },
];

export interface Release {
  id: string;
  app: string;
  commit: string;
  gates: { name: string; verdict: "pass" | "block"; data: string }[];
  status: "Awaiting owner" | "Released" | "Blocked";
}

export const releases: Release[] = [
  { id: "REL-1042", app: "Mobile Banking API", commit: "a91f3c2", status: "Awaiting owner", gates: [
    { name: "Unit tests", verdict: "pass", data: "1,284 / 1,284" }, { name: "SAST", verdict: "pass", data: "0 high" }, { name: "Contract tests", verdict: "pass", data: "42 / 42" }, { name: "Perf p95", verdict: "pass", data: "212 ms (target 300)" }] },
  { id: "REL-1041", app: "Fraud Scoring Engine", commit: "77be010", status: "Blocked", gates: [
    { name: "Unit tests", verdict: "pass", data: "612 / 612" }, { name: "SAST", verdict: "block", data: "1 high: SQL injection in /score" }, { name: "Model drift", verdict: "pass", data: "PSI 0.04" }, { name: "Perf p95", verdict: "pass", data: "88 ms" }] },
  { id: "REL-1039", app: "Core Banking Gateway", commit: "c02d9ab", status: "Released", gates: [
    { name: "Unit tests", verdict: "pass", data: "2,031 / 2,031" }, { name: "SAST", verdict: "pass", data: "0 high" }, { name: "Contract tests", verdict: "pass", data: "88 / 88" }, { name: "Perf p95", verdict: "pass", data: "145 ms" }] },
];

export const productionAlert = {
  alert: "Mobile Banking API — 5xx rate 4.2% (threshold 1%)",
  since: "09:12",
  likelyChange: "REL-1039 · Core Banking Gateway c02d9ab (deployed 08:55)",
  confidence: 0.81,
  evidence: ["5xx started 17 min after deploy", "Errors are timeouts on /accounts → core-banking-gw (E2 link, confidence 0.98)", "No other change in the reach set in the last 24 h"],
  blast: ["Mobile Banking API", "Loan Origination"],
  rollback: "Roll back Core Banking Gateway to b81e44f",
};

export const deliveryMetrics = { leadTimeDays: 3.4, failureRate: 0.12, timeToRestoreHrs: 1.6, deploysPerWeek: 14 };

export interface ScoreMeasure { area: string; measure: string; score: number; target: number; trend: number[] }

export const scorecard: ScoreMeasure[] = [
  { area: "Landscape", measure: "Duplicate capabilities", score: 58, target: 80, trend: [49, 52, 55, 58] },
  { area: "Landscape", measure: "Unsupported technology", score: 44, target: 85, trend: [40, 41, 43, 44] },
  { area: "Landscape", measure: "Standards conformance", score: 63, target: 80, trend: [60, 61, 62, 63] },
  { area: "Applications", measure: "Technical debt", score: 51, target: 75, trend: [47, 48, 50, 51] },
  { area: "Applications", measure: "Cost per capability", score: 60, target: 75, trend: [55, 57, 59, 60] },
  { area: "Applications", measure: "Modernization readiness", score: 57, target: 70, trend: [50, 53, 55, 57] },
  { area: "Pipelines", measure: "Lead time", score: 72, target: 85, trend: [64, 68, 70, 72] },
  { area: "Pipelines", measure: "Change failure rate", score: 66, target: 85, trend: [61, 63, 65, 66] },
  { area: "Pipelines", measure: "Time to restore", score: 74, target: 85, trend: [70, 71, 73, 74] },
  { area: "Cloud", measure: "Idle resources", score: 48, target: 85, trend: [41, 44, 46, 48] },
  { area: "Cloud", measure: "Unowned resources", score: 55, target: 95, trend: [50, 52, 53, 55] },
  { area: "Cloud", measure: "Commitment coverage", score: 69, target: 80, trend: [62, 65, 67, 69] },
];

export interface Optimization { title: string; area: string; value: number; effort: number; saving: number }

export const optimizations: Optimization[] = [
  { title: "Retire HR Self-Service Portal (duplicate of SuccessFactors)", area: "Applications", value: 8, effort: 2, saving: 2400000 },
  { title: "Delete 214 idle cloud resources with no owner", area: "Cloud", value: 7, effort: 2, saving: 6800000 },
  { title: "Consolidate CRM onto Salesforce", area: "Landscape", value: 9, effort: 6, saving: 18800000 },
  { title: "Raise commitment coverage to 80%", area: "Cloud", value: 6, effort: 3, saving: 4100000 },
  { title: "Add contract tests to Loan Origination pipeline", area: "Pipelines", value: 5, effort: 3, saving: 0 },
  { title: "Upgrade Oracle 12c to 19c on Core Banking", area: "Landscape", value: 8, effort: 7, saving: 0 },
].sort((a, b) => b.value / b.effort - a.value / a.effort);
