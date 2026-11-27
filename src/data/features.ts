/**
 * Feature tables. Source: "DC side features", "Enterprise features",
 * "Features both packs share".
 */

export interface Feature {
  id: string;
  area?: string;
  title: string;
  gets: string;
  agents: string[]; // agent codes / service names
  services?: string;
  provenWhen: string;
  consoleHref?: string;
  todo?: boolean;
}

export const dcFeatures: Feature[] = [
  {
    id: "ceo-command-view",
    title: "CEO command view",
    gets: "One screen with facility health, live incident queue, SLA exposure in INR, capacity headroom with stranded capacity, PUE trend and an AI brief; every tile drills to its records",
    agents: ["ORCH"],
    services: "Orchestrator, KPI engine, portal, Looker",
    provenWhen: "Every tile is computed from the dataset and carries an as-of date",
    consoleHref: "/console/dc/command",
  },
  {
    id: "digital-twin",
    title: "Digital twin and capacity planner",
    gets: 'A navigable 3D view of hall, row and rack with colour overlays; a fit check such as "2 MW at 60 kW per rack"; an upgrade plan with components to change, outage impact and best order',
    agents: ["D2"],
    services: "D2, capacity engine, 3D scene",
    provenWhen: "Reference fit checks match; a no-fit gives an ordered upgrade plan",
    consoleHref: "/console/dc/twin",
  },
  {
    id: "predictive-maintenance",
    title: "Proactive monitoring and predictive maintenance",
    gets: "Drift flagged before any alarm with an act-by date; an end-of-life score and replace-by date; a ranked watchlist with the evidence",
    agents: ["D3"],
    services: "D3, risk engine, BigQuery ML",
    provenWhen: "A drifting asset is flagged first; a battery reaches the watchlist with a replace-by date",
    consoleHref: "/console/dc/risk",
  },
  {
    id: "facility",
    title: "Facility",
    gets: "Halls, racks, components, tenants",
    agents: [],
    services: "Spanner",
    provenWhen: "The downstream set",
    todo: true,
  },
  {
    id: "knowledge-graph",
    title: "Knowledge graph",
    gets: "Contracts, alerts and runbooks as one graph; upstream and downstream, path, tenant and redundancy-peer queries as a service; a graph view and GQL for ad hoc questions",
    agents: [],
    services: "Graph, graph tools",
    provenWhen: "Matches the expected result for all 148 components",
    consoleHref: "/console/dc/graph",
  },
  {
    id: "event-correlation",
    title: "Event correlation",
    gets: "Alerts grouped into one incident with ranked causes, a confidence indication, blast radius and the next runbook step with owner and time limit",
    agents: ["D1", "S1"],
    services: "D1 (asks S1)",
    provenWhen: "The seeded alert storm resolves to one root cause with the right tenants and SLA clocks",
    consoleHref: "/console/dc/incidents",
  },
  {
    id: "switchover-planner",
    title: "Switchover planner",
    gets: "For a planned change to one asset: affected loads, redundant, single-path or lost status, SLA exposure, ranked windows over 14 days, a GO, GO WITH CONDITIONS or NO-GO verdict and a runbook with rollback; it simulates only",
    agents: ["D4", "D3", "S1"],
    services: "D4 (asks D3, S1), switchover engine",
    provenWhen: '"Feed A to Feed B" lists the UPS pairs left on a single path, the tenants, the safest window, the verdict and a runbook; same input, same output',
    consoleHref: "/console/dc/switchover",
  },
  {
    id: "incident-command",
    title: "Incident command",
    gets: "Acknowledge and assign incidents; an SLA clock per tenant with time to threshold and penalty exposure; an analyst brief; state kept across sessions",
    agents: ["D1"],
    services: "D1, incident-clock service",
    provenWhen: "Every action is written to the audit log",
    consoleHref: "/console/dc/incidents",
  },
  {
    id: "ai-briefing",
    title: "AI briefing and copilot",
    gets: 'A daily brief, incident, risk and switchover briefs, and a question box such as "What depends on UPS-1?"',
    agents: ["ORCH"],
    services: "Orchestrator, Gemini Pro and Flash",
    provenWhen: "A template answer appears with Gemini off; any stray number is rejected",
    consoleHref: "/console/dc/copilot",
  },
  {
    id: "platform-access",
    title: "Platform, access and audit",
    gets: "Email and Microsoft sign-in, four roles enforced on every server route, an audit log exportable to CSV and model usage by user and feature",
    agents: [],
    services: "Identity Platform, Cloud Run, Secret Manager, Cloud Monitoring",
    provenWhen: "Each role sees and does only what it should",
    consoleHref: "/console/audit",
  },
  {
    id: "semantic-search",
    title: "Semantic search",
    gets: '"Battery getting hot" returns ranked runbooks and incidents, each with a reason and a link; the copilot reuses the index',
    agents: ["S1"],
    services: "S1, Gemini Embedding, pgvector",
    provenWhen: "The right runbooks come back, with reasons",
    consoleHref: "/console/dc/copilot",
  },
  {
    id: "advisory-grounding",
    title: "Advisory grounding",
    gets: "Public advisories for a component's make and model, with source link and date, labelled external",
    agents: ["S1"],
    services: "S1, Grounding with Google Search",
    provenWhen: "Built only after every Must item passes acceptance",
  },
];

export const enterpriseFeatures: Feature[] = [
  {
    id: "portfolio-rationalization",
    area: "Applications",
    title: "Portfolio rationalization",
    gets: "A 7R path per application (retire, retain, rehost, replatform, repurchase, refactor, relocate) from fit, cost, risk and debt, then approved paths ordered into waves by dependency and cost",
    agents: ["E1"],
    provenWhen: "An architect can open any path and see the stack facts, failed TOGAF checks and 7R scores behind it",
    consoleHref: "/console/enterprise/portfolio",
  },
  {
    id: "stack-analysis",
    area: "Architecture",
    title: "Stack analysis and TOGAF comparison",
    gets: "Each application's languages, frameworks, hosting, data stores and integrations, checked against TOGAF across business, data, application and technology",
    agents: ["E1", "S1"],
    provenWhen: "Every number in the answer traces to an engine fact ID",
    consoleHref: "/console/enterprise/architecture",
  },
  {
    id: "dependency-map",
    area: "Code",
    title: "Dependency map and impact sets",
    gets: "A verified map of components, calls and data flows, with the reach of any change and a confidence rating on each link",
    agents: ["E2", "S2"],
    provenWhen: "The impact set matches a reference tool's call graph for the same application",
    consoleHref: "/console/enterprise/dependencies",
  },
  {
    id: "gated-releases",
    area: "Delivery",
    title: "Gated releases",
    gets: "Automated checks from commit to production; the engine alone passes or blocks, and fixes arrive only as pull requests",
    agents: ["E3"],
    provenWhen: "A person merges every fix; the owner sees each gate verdict with its run data",
    consoleHref: "/console/enterprise/releases",
  },
  {
    id: "production-support",
    area: "Delivery",
    title: "Production support",
    gets: "An alert shown with its most likely change, the evidence and the blast radius, plus a proposed rollback",
    agents: ["E3"],
    provenWhen: "No rollback starts without the on-call person's approval",
    consoleHref: "/console/enterprise/releases",
  },
  {
    id: "scan-and-scorecard",
    area: "Estate",
    title: "Scan and scorecard",
    gets: "Four areas scored on 12 measures from stored results, ranked by value over effort, with trend until targets are agreed",
    agents: ["E4"],
    provenWhen: "A re-run on unchanged data gives the same ranking",
    consoleHref: "/console/enterprise/scorecard",
  },
  {
    id: "link-review-queue",
    area: "Estate",
    title: "Link review queue",
    gets: "Low-confidence dependency links sent to one review queue instead of trusted silently",
    agents: ["S2"],
    provenWhen: "An architect confirms each link before it is used",
    consoleHref: "/console/enterprise/review-queue",
  },
];

export const enterpriseIntro =
  "The Enterprise pack delivers seven features across applications, architecture, code, delivery and the whole estate. Each stays one request deep from the person, and E2 is assumed from the Enterprise note until you confirm it.";

export const enterpriseDecisionPoints =
  "People decide at four points: the architect on each path and TOGAF exception, the owner on a release or rollback, the owner on which optimization to start, and the architect on low-confidence links.";

export interface SharedFeature {
  title: string;
  does: string;
  builtOn: string;
}

export const sharedFeaturesIntro =
  "Six platform features come once and apply to both packs, so a vendor builds them one time.";

export const sharedFeatures: SharedFeature[] = [
  {
    title: "Guarded answers",
    does: "Engines compute every figure, Gemini writes around fact IDs, stray numbers are rejected and a template answer is the fallback",
    builtOn: "Cloud Run engines, Gemini Pro and Flash",
  },
  {
    title: "One front door",
    does: "People and other agents reach the platform only through the orchestrator; specialists never call it back and no request goes past two agents",
    builtOn: "Agent Runtime, ADK, Agent Registry",
  },
  {
    title: "Approval before action",
    does: "A person approves in a workflow before an ITSM change, pull request or rollback goes out; EAiQ itself changes nothing",
    builtOn: "Workflows, Apigee, Integration Connectors",
  },
  {
    title: "Decision log and audit",
    does: "Every decision is stored with its inputs, fact IDs, approver and time, and exported as the audit record",
    builtOn: "AlloyDB, Cloud Audit Logs",
  },
  {
    title: "Role-based access",
    does: "Each user sees only their own sites or applications; each agent has its own identity and approved tools",
    builtOn: "IAP, IAM, Agent Identity, Agent Gateway",
  },
  {
    title: "Quality gate",
    does: "Golden test sets gate every release; traces flag anomalies",
    builtOn: "Agent Evaluation, Agent Observability",
  },
];
