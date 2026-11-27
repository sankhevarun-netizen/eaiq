/** Source: "EAiQ: Solution Blueprint" + DC / Enterprise architecture pages. */

export type BoxKind = "dc" | "enterprise" | "shared" | "person" | "neutral" | "sor";

export interface BBox {
  title: string;
  sub?: string;
  kind?: BoxKind;
  link?: string; // agent id
}

export interface BLayer {
  id: string;
  title: string;
  note?: string;
  boxes: BBox[];
  /** connector label shown under the layer */
  arrow?: string;
}

export const blueprintIntro = {
  eyebrow: "EAiQ: Solution Blueprint",
  title: "Holistic blueprint built on Google Stack",
  sub: "One platform and one front door serve both the DC and the Enterprise pack",
};

export const trustBoxes: BBox[] = [
  { title: "Identity", sub: "IAP, IAM, agent IDs" },
  { title: "Agent registry", sub: "approved agents, tools" },
  { title: "Call policy", sub: "Gateway, Model Armor" },
  { title: "Perimeter", sub: "VPC Service Controls" },
  { title: "Keys and secrets", sub: "KMS, Secret Manager" },
  { title: "Data protection", sub: "scan before storage" },
  { title: "Audit", sub: "Cloud Audit Logs" },
  { title: "Evaluate and trace", sub: "gate; outside VPC-SC" },
];

export const experienceBoxes: BBox[] = [
  { title: "EAiQ portal", sub: "React on Cloud Run" },
  { title: "Gemini Enterprise app", sub: "chat, optional Workspace" },
  { title: "Looker", sub: "scorecards and dashboards" },
];

/** Per-side detailed architecture ("6 agents paired with 6 engines, 1 gate"). */
export const sides = {
  dc: {
    label: "DC architecture",
    caption: "DC architecture · 6 agents paired with 6 engines, 1 gate",
    intelligenceNote: "ADK agents on Agent Runtime; Sessions and Memory Bank keep state; Gemini Pro plans, Flash writes.",
    pairs: [
      { agent: { title: "D1 Correlation", sub: "and incident", link: "d1-correlation-and-incident" }, engine: { title: "Correlation", sub: "engine" }, kind: "dc" as BoxKind },
      { agent: { title: "D2 Capacity", sub: "and twin", link: "d2-capacity-and-twin" }, engine: { title: "Twin", sub: "engine" }, kind: "dc" as BoxKind },
      { agent: { title: "D3 Risk", sub: "hourly scan", link: "d3-risk" }, engine: { title: "Risk", sub: "engine" }, kind: "dc" as BoxKind },
      { agent: { title: "D4 Change", sub: "and switchover", link: "d4-change-and-switchover" }, engine: { title: "Switchover", sub: "engine" }, kind: "dc" as BoxKind },
      { agent: { title: "S1 Knowledge", sub: "shared", link: "s1-knowledge" }, engine: { title: "Retrieval", sub: "on pgvector" }, kind: "shared" as BoxKind },
      { agent: { title: "S2 Graph", sub: "curator, shared", link: "s2-graph-curator" }, engine: { title: "Loader and", sub: "link checks" }, kind: "shared" as BoxKind },
    ],
    gate: "Workflows waits for a person, then an ITSM incident or change is raised. Nothing runs on the facility.",
    data: [
      { title: "Spanner Graph", sub: "148 components, 220 links · Nexus Mumbai-1 reference set" },
      { title: "BigQuery, BigQuery ML", sub: "telemetry and alarm history, risk forecasts" },
      { title: "AlloyDB with pgvector", sub: "decision log and audit, document search" },
    ],
    ingest: [
      { title: "Apigee, Connectors", sub: "read-only DCIM, ITSM" },
      { title: "Pub/Sub, Dataflow", sub: "alarms and telemetry" },
      { title: "Document AI, Storage", sub: "manuals and drawings" },
      { title: "Loader on Cloud Run", sub: "maps data to the graph" },
    ],
    sor: [
      { title: "DCIM", sub: "assets, capacity" },
      { title: "BMS/EMS", sub: "cooling, power" },
      { title: "EPMS", sub: "power chain" },
      { title: "NMS", sub: "network health" },
      { title: "ITSM", sub: "after approval", kind: "person" as BoxKind },
    ],
  },
  enterprise: {
    label: "Enterprise architecture",
    caption: "Enterprise architecture · 6 agents paired with 6 engines, 1 gate",
    intelligenceNote: "ADK agents on Agent Runtime; Sessions and Memory Bank keep state; Gemini Pro plans, Flash writes.",
    pairs: [
      { agent: { title: "E1 Portfolio", sub: "and architecture", link: "e1-portfolio-and-architecture" }, engine: { title: "7R and TOGAF", sub: "engines" }, kind: "enterprise" as BoxKind },
      { agent: { title: "E2 Code and", sub: "dependency", link: "e2-code-and-dependency" }, engine: { title: "Dependency", sub: "engine" }, kind: "enterprise" as BoxKind, assumed: true },
      { agent: { title: "E3 Pipeline", sub: "support", link: "e3-pipeline-support" }, engine: { title: "Gates and", sub: "metrics engines" }, kind: "enterprise" as BoxKind },
      { agent: { title: "E4 Estate scan", sub: "optimization", link: "e4-estate-scan-and-optimization" }, engine: { title: "Scan engine", sub: "12 measures" }, kind: "enterprise" as BoxKind },
      { agent: { title: "S1 Knowledge", sub: "shared", link: "s1-knowledge" }, engine: { title: "Document AI", sub: "and pgvector" }, kind: "shared" as BoxKind },
      { agent: { title: "S2 Graph", sub: "curator, shared", link: "s2-graph-curator" }, engine: { title: "Link checks", sub: "review queue" }, kind: "shared" as BoxKind },
    ],
    gate: "Workflows waits for a person; then a pull request, ITSM change or rollback goes out.",
    data: [
      { title: "Spanner Graph", sub: "applications, components, pipelines, infrastructure" },
      { title: "BigQuery, BigQuery ML", sub: "delivery, cost and billing, trend and anomaly models" },
      { title: "AlloyDB with pgvector", sub: "decision log and audit, standards search" },
    ],
    ingest: [
      { title: "Apigee, Connectors", sub: "read-only CMDB, ITSM" },
      { title: "Pub/Sub, Datastream", sub: "events, change capture" },
      { title: "Asset Inventory", sub: "billing, monitoring" },
      { title: "Code adapter", sub: "partner engine export" },
    ],
    sor: [
      { title: "CMDB", sub: "apps, owners" },
      { title: "Repos", sub: "pull request", kind: "person" as BoxKind },
      { title: "CI/CD", sub: "runs, gates" },
      { title: "Cloud", sub: "inventory, spend" },
      { title: "ITSM", sub: "after approval", kind: "person" as BoxKind },
    ],
  },
};

export const holistic = {
  orchestrator: { title: "Orchestrator: the only door for people and other agents", sub: "plans each request, calls the agents, checks every number, writes the answer" },
  dcPack: { title: "DC pack: the facility", items: ["D1 Correlation and incident", "D2 Capacity and digital twin", "D3 Risk", "D4 Change and switchover"] },
  shared: { title: "Shared by both", items: [{ t: "S1 Knowledge", s: "docs, standards, manuals, runbooks" }, { t: "S2 Graph curator", s: "proposes links; a person approves" }] },
  entPack: { title: "Enterprise pack: the estate", items: ["E1 Portfolio and architecture", "E2 Code and dependency", "E3 Pipeline support", "E4 Estate scan and optimization"] },
  gate: { title: "Executor and human gate", sub: "A person approves in Workflows first, then a critical change or pull request goes out." },
  engines: [
    { title: "DC engines", sub: "correlation, capacity, cooling, power chain, switchover", kind: "dc" as BoxKind },
    { title: "Shared engines", sub: "graph impact, scoring, ranking, rules, gates", kind: "shared" as BoxKind },
    { title: "Enterprise engines", sub: "7R paths, dependency coupling, delivery metrics, scan measures", kind: "enterprise" as BoxKind },
  ],
  data: [
    { title: "Spanner Graph", sub: "DC and enterprise ontologies" },
    { title: "BigQuery, BigQuery ML", sub: "telemetry, cost, delivery" },
    { title: "AlloyDB with pgvector", sub: "decision log, audit, search" },
  ],
  ingest: [
    { title: "Apigee, Connectors" },
    { title: "Pub/Sub, Dataflow" },
    { title: "Datastream" },
    { title: "Document AI, Storage" },
  ],
};
