/** Source: "EAiQ: Top Questions No Single Tool Can Answer". */

export type QuestionScope = "DC" | "Enterprise" | "Bridge";

export interface Question {
  n: number;
  question: string;
  systems: string;
  whyFail: string;
  agents: string[];
  scope: QuestionScope;
  todo?: boolean;
}

export const questionsTitle = "Top Questions No Single Tool Can Answer";
export const questionsIntro =
  "A question earns a place here when it needs facts from several systems that nobody joins, asks about a future state, or needs an auditable reason. These 20 meet that test, questions a single tool already answers, such as a UPS load or a build status, are left out.";

export const questions: Question[] = [
  { n: 1, question: "If this feed or UPS fails, which tenants lose service, which SLA clocks start and what is the penalty in INR?", systems: "DCIM power path, tenant contracts, ITSM", whyFail: "The power path and the contracts sit in different systems", agents: ["D1", "D4"], scope: "DC" },
  { n: 2, question: "Of these alarms, which is the cause and which are symptoms?", systems: "BMS, NMS, DCIM alarms, graph", whyFail: "Each tool sees only its own slice of the chain", agents: ["D1"], scope: "DC" },
  { n: 3, question: "Is this planned change safe, and what is the safest window?", systems: "Graph, contracts, bookings, open alerts, runbooks", whyFail: "Today it is expert memory and a spreadsheet; here it is repeatable and names its reasons", agents: ["D4"], scope: "DC" },
  { n: 4, question: "How much capacity is stranded, paid for but unusable because another component limits it?", systems: "DCIM ratings, BMS cooling, power chain", whyFail: "Tools show rated capacity, not the binding constraint along the chain", agents: ["D2"], scope: "DC" },
  { n: 5, question: "Can we take this customer's load, and if not, what is the minimum upgrade and in what order?", systems: "Rack space, power and cooling path, derating rules", whyFail: "The sales promise is checked against engineering reality only by hand", agents: ["D2"], scope: "DC" },
  { n: 6, question: "Which assets are drifting against their peers before any alarm, and what is exposed if they fail?", systems: "Telemetry, maintenance history, graph", whyFail: "Alarm thresholds are static and blind to impact", agents: ["D3"], scope: "DC" },
  { n: 7, question: "If a facility power event hits this rack, which business applications and services are affected?", systems: "DC graph, CMDB, ITSM", whyFail: "The assets-to-boardroom question; it needs links from applications to the racks that power them", agents: ["ORCH", "D1", "E2"], scope: "Bridge" },
  { n: 8, question: "If we change this component, what breaks downstream, and how sure are we?", systems: "Code analysis, estate graph", whyFail: "Tools list dependencies without rating how certain each link is", agents: ["E2"], scope: "Enterprise" },
  { n: 9, question: "Which change caused this incident?", systems: "CI/CD runs, deploy records, ITSM incidents", whyFail: "Pipeline and incident tools are not tied to each other", agents: ["E3"], scope: "Enterprise" },
  { n: 10, question: "What does each application really cost, and which ones duplicate a capability?", systems: "Billing export, CMDB, estate graph", whyFail: "Billing is by cloud resource, not by application", agents: ["E4", "E1"], scope: "Enterprise" },
  { n: 11, question: "What should we fix first across landscape, applications, pipelines and cloud?", systems: "Inventory, spend, pipeline and application results", whyFail: "Four teams give four priority lists; here one repeatable rule gives one", agents: ["E4"], scope: "Enterprise" },
  { n: 12, question: "Why did we decide this, on what evidence, and who approved it?", systems: "Decision log, fact IDs, approvals", whyFail: "Decisions live in email and meetings, without their inputs", agents: ["All"], scope: "Bridge" },
  { n: 13, question: "During this change, which loads drop to a single path and are one failure from an outage?", systems: "Graph, redundancy rules, open alerts on the peer asset", whyFail: "Tools show each device's status, not the redundancy left across the chain", agents: ["D4"], scope: "DC" },
  { n: 14, question: "What should we replace this year, in what order, and what does deferring each item expose?", systems: "Maintenance history, telemetry, graph, replacement cost and lead time", whyFail: "Replacement lists are by age, not by the racks and tenants behind each asset", agents: ["D3"], scope: "DC" },
  { n: 15, question: "What would a chain drop cost in penalties, against the upgrade that prevents it?", systems: "Contracts, capacity plan, replacement cost", whyFail: "Finance and engineering hold the two numbers separately", agents: ["D2", "D4"], scope: "DC" },
  { n: 16, question: "Which components run on unsupported technology, and which business capabilities depend on them?", systems: "Component versions, vendor support dates, estate graph", whyFail: "Version lists carry no business dependency", agents: ["E4", "E2"], scope: "Enterprise" },
  { n: 17, question: "In what order can we retire or move applications without breaking others?", systems: "7R paths, dependency graph, cost", whyFail: "A path chosen per application ignores what depends on it", agents: ["E1", "E2"], scope: "Enterprise" },
  { n: 18, question: "Which release gates catch real failures, and which only add delay?", systems: "Gate results, test history, deploy and incident records", whyFail: "Gate results are never compared with what later failed in production", agents: ["E3"], scope: "Enterprise" },
  { n: 19, question: "Which cloud resources are idle or unowned, and which application and owner do they belong to?", systems: "Asset inventory, utilization, tags, estate graph", whyFail: "Inventory shows resources, not who owns them or why they exist", agents: ["E4"], scope: "Enterprise" },
  { n: 20, question: "Where do we deviate from our own architecture standards, and which deviations carry the most risk?", systems: "Standards catalogue, technology inventory, graph", whyFail: "Standards sit in documents and are checked by review, not against the estate", agents: ["E1", "S1"], scope: "Enterprise" },
];

export function questionsForAgent(code: string) {
  return questions.filter((q) => q.agents.includes(code) || q.agents.includes("All"));
}
