/**
 * The EAiQ agents. Source: "DC sub-agents" and "Enterprise sub-agents" pages and the
 * Solution Blueprint. Every field is transcribed from those pages.
 */

export type Pack = "DC" | "Enterprise" | "Shared" | "Core";
export type AgentStatus = "live" | "assumed" | "proposed";

export interface AgentData {
  id: string;
  code: string; // D1, E2, S1, ORCH
  title: string;
  pack: Pack;
  /** Short line under the title on cards. */
  description: string;
  does: string;
  engine: string;
  engineName: string;
  asks: string;
  person: string;
  /** Badge at top-right of the spec card, e.g. "SoW 4.5, 4.7". */
  tag?: string;
  status: AgentStatus;
  consoleHref: string;
}

export const agents: AgentData[] = [
  {
    id: "orchestrator",
    code: "ORCH",
    title: "Orchestrator",
    pack: "Core",
    description:
      "The only door for people and other agents. Plans each request, calls the agents, checks every number, writes the answer.",
    does: "Plans each request, calls the agents, checks every number, writes the answer.",
    engine: "Checks every figure against engine facts; the template answer is the fallback.",
    engineName: "Agent Runtime, ADK, Agent Registry",
    asks: "D1–D4, E1–E4, S1 and S2. Specialists never call it back and no request goes past two agents.",
    person: "A person approves in Workflows first, then a critical change or pull request goes out.",
    tag: "One front door",
    status: "live",
    consoleHref: "/console/dc/copilot",
  },
  {
    id: "d1-correlation-and-incident",
    code: "D1",
    title: "Correlation and incident",
    pack: "DC",
    description: "Decides if alarms are one incident and if the top cause is certain enough.",
    does: "Decides if alarms are one incident and if the top cause is certain enough",
    engine: "Correlation engine ranks causes, with tenants and SLA clocks",
    engineName: "Correlation engine",
    asks: "S1 for the next runbook step",
    person: "On-call engineer takes uncertain causes; ITSM incident only after confirmation",
    tag: "SoW 4.5, 4.7",
    status: "live",
    consoleHref: "/console/dc/incidents",
  },
  {
    id: "d2-capacity-and-twin",
    code: "D2",
    title: "Capacity and twin",
    pack: "DC",
    description: "Turns a request into kW, density, racks; asks for what is missing.",
    does: "Turns a request into kW, density, racks; asks for what is missing",
    engine: "Capacity engine; the 3D scene shows the fit",
    engineName: "Twin engine",
    asks: "D3 Risk",
    person: "None; a no-fit returns an upgrade plan",
    tag: "SoW 4.2",
    status: "live",
    consoleHref: "/console/dc/twin",
  },
  {
    id: "d3-risk",
    code: "D3",
    title: "Risk",
    pack: "DC",
    description: "Chooses which assets to scan each hour; holds back when data is too thin.",
    does: "Chooses which assets to scan each hour; holds back when data is too thin",
    engine: "Risk engine and BigQuery ML score drift and end of life",
    engineName: "Risk engine",
    asks: "No agent; reads telemetry and history",
    person: "Maintenance ticket only after approval",
    tag: "SoW 4.3",
    status: "live",
    consoleHref: "/console/dc/risk",
  },
  {
    id: "d4-change-and-switchover",
    code: "D4",
    title: "Change and switchover",
    pack: "DC",
    description: "Finds what a change touches, whom to consult and when to stop at NO-GO.",
    does: "Finds what a change touches, whom to consult and when to stop at NO-GO",
    engine: "Switchover engine sets the verdict, so every run gives the same answer",
    engineName: "Switchover engine",
    asks: "D3 for weak equipment on the path; S1 for runbook steps",
    person: "An approver signs before any ITSM change",
    tag: "SoW 4.6",
    status: "live",
    consoleHref: "/console/dc/switchover",
  },
  {
    id: "e1-portfolio-and-architecture",
    code: "E1",
    title: "Portfolio and architecture",
    pack: "Enterprise",
    description: "Gives each application a 7R path and compares its stack with TOGAF.",
    does: "Gives each application a 7R path and compares its stack with TOGAF",
    engine: "7R scores from fit, cost, risk and debt; TOGAF rule checks",
    engineName: "7R and TOGAF engines",
    asks: "Reads the graph E2 builds; S1 for standards",
    person: "Architect approves each path and each TOGAF exception",
    tag: "7R and TOGAF",
    status: "live",
    consoleHref: "/console/enterprise/portfolio",
  },
  {
    id: "e2-code-and-dependency",
    code: "E2",
    title: "Code and dependency",
    pack: "Enterprise",
    description: "Builds the verified map of components, calls and data flows from code.",
    does: "Builds the verified map of components, calls and data flows from code",
    engine: "Dependency engine: impact sets, coupling, confidence per link, via the adapter",
    engineName: "Dependency engine",
    asks: "No agent; E1, E3 and E4 read its graph",
    person: "Architect confirms low-confidence links through the S2 review queue",
    tag: "Assumed, to confirm",
    status: "assumed",
    consoleHref: "/console/enterprise/dependencies",
  },
  {
    id: "e3-pipeline-support",
    code: "E3",
    title: "Pipeline support",
    pack: "Enterprise",
    description: "Gates releases from commit to production and ties incidents to the change.",
    does: "Gates releases from commit to production and ties incidents to the change",
    engine: "Gate and metrics engines: pass or block, lead time, failure rate, time to restore",
    engineName: "Gates and metrics engines",
    asks: "No agent; reads the E2 graph for reach",
    person: "Owner signs off a release, a pipeline change or a rollback",
    tag: "2 flows: SDLC, production",
    status: "live",
    consoleHref: "/console/enterprise/releases",
  },
  {
    id: "e4-estate-scan-and-optimization",
    code: "E4",
    title: "Estate scan and optimization",
    pack: "Enterprise",
    description: "Scores landscape, applications, pipelines, cloud; ranks what to fix first.",
    does: "Scores landscape, applications, pipelines, cloud; ranks what to fix first",
    engine: "Scan engine: 12 measures, ranked by value over effort",
    engineName: "Scan engine",
    asks: "No agent; reads stored results of E1 to E3",
    person: "Owner approves which optimization starts",
    tag: "12 measures",
    status: "live",
    consoleHref: "/console/enterprise/scorecard",
  },
  {
    id: "s1-knowledge",
    code: "S1",
    title: "Knowledge",
    pack: "Shared",
    description:
      "Picks the best source; says so when no match is good enough. Reads standards, ADRs and drawings into records.",
    does:
      "DC: picks the best source; says so when no match is good enough. Enterprise: reads standards, ADRs and drawings into records, and answers from them",
    engine:
      "Gemini Embedding and pgvector search; Google Search for equipment advisories (DC). Document AI and pgvector search (Enterprise)",
    engineName: "Retrieval on pgvector",
    asks: "No agent. Web lookup sends make and model only, nothing else; the web lookup is off on the Enterprise side",
    person: "None",
    tag: "SoW 4.11, 4.12 · shared",
    status: "live",
    consoleHref: "/console/dc/copilot",
  },
  {
    id: "s2-graph-curator",
    code: "S2",
    title: "Graph curator",
    pack: "Shared",
    description: "Finds where an unmapped tag or a new document belongs; only proposes.",
    does:
      "Finds where an unmapped tag or a new document belongs; only proposes. Sends low-confidence links from E2 to one review queue",
    engine: "Document AI and graph link checks; link checks rate each link before review",
    engineName: "Loader and link checks",
    asks: "No agent",
    person: "A DC expert approves every link; an architect confirms each link",
    tag: "MVP+ · shared, proposed",
    status: "proposed",
    consoleHref: "/console/enterprise/review-queue",
  },
];

export const agentFilters = ["All", "DC", "Enterprise", "Shared"] as const;
export type AgentFilter = (typeof agentFilters)[number];

export function getAgent(id: string) {
  return agents.find((a) => a.id === id);
}

export function agentByCode(code: string) {
  return agents.find((a) => a.code === code);
}

export const packLabel: Record<Pack, string> = {
  DC: "DC pack · the facility",
  Enterprise: "Enterprise pack · the estate",
  Shared: "Shared by both",
  Core: "Intelligence core",
};
