/**
 * Deck content: cover, problem, solution, how it works, stack, where to sell, path to value.
 * Transcribed from the slides; only typos are corrected.
 */

export const cover = {
  eyebrow: "Connected. Intelligent. Resilient.",
  titleLead: "The AI orchestration layer",
  titleAccent: "for managing IT Assets",
  body: "One knowledge graph grounded, auditable view of every asset, risk and change. Empowering decision from the assets to the boardroom.",
};

/* ---------------- Problem (slide 3) ---------------- */

export interface Pain {
  title: string;
  body: string;
  tags: string[];
  icon: string;
}

export const problem = {
  eyebrow: "The problem at hand",
  title: "Visibility across systems, blindness across integrated impact",
  groups: [
    {
      label: "DC Operators",
      sub: "Infrastructure, assets and build programmes",
      pains: [
        { title: "AI workload densification", body: "Enterprise facilities are not designed for rapidly rising GPU power and heat loads.", tags: ["Power", "Rack density", "Thermal limits"], icon: "Cpu" },
        { title: "Utilities constraints and bottlenecks", body: "Grid access, UPS capacity and cooling architecture constrain time-to-capacity.", tags: ["Capacity", "Cooling", "Time to power"], icon: "Zap" },
        { title: "Fragmented multi-site estate", body: "Capacity, alarms and dependencies remain distributed across locations and tools.", tags: ["Siloed sites", "Siloed tools", "Inconsistent data"], icon: "Network" },
      ] as Pain[],
    },
    {
      label: "Enterprises",
      sub: "Running 24×7 IT and business operations",
      pains: [
        { title: "Suboptimal correlated operating view", body: "DCIM, BMS, ITSM, network and app signals are assessed and analyzed in isolation.", tags: ["Silos", "Alarm noise", "Missed context"], icon: "Layers" },
        { title: "IT Infrastructure Modernization gaps", body: "Legacy apps and infra need to be modernized or replaced before AI can scale.", tags: ["Audit", "Access", "Control drift"], icon: "Server" },
        { title: "Reactive incident response", body: "With services running 24×7, any AI adoption has to be seamless.", tags: ["Firefighting", "Hand-offs", "Downtime"], icon: "Siren" },
      ] as Pain[],
    },
  ],
  takeaway:
    "Both sides share one common gap, data spread across disconnected systems, managed reactively, with missing correlation and no single view of risk and cost.",
};

/* ---------------- Solution (slide 5) ---------------- */

export const solution = {
  eyebrow: "Our proposed solution",
  title: "An agentic layer converting signals into smart decisions without any blind spot",
  systemsTop: ["Power", "Cooling", "Racks", "Tenants"],
  systemsBottom: ["BMS", "DCIM", "ITSM", "Telemetry"],
  systemsLabel: "Multiple systems of record",
  liveLabel: "Live data and change history",
  liveSub: "Mapped once into a knowledge graph with relationships",
  brain: { title: "EAiQ - AI Brain", sub: "Orchestrates for risk and uptime - (Built on Gemini Enterprise)" },
  agents: [
    { name: "Capacity", code: "D2" },
    { name: "Impact", code: "E2" },
    { name: "Correlation", code: "D1" },
    { name: "Predictive risk", code: "D3" },
    { name: "Simulation", code: "D4" },
    { name: "Change", code: "D4" },
  ],
  graph: "Knowledge Graph + Domain Ontology",
  executor: { title: "Executor", sub: "Recommends and records the change" },
  outputs: [
    { title: "Observability & Risk Tracking", from: ["Predictive risk", "Correlation"] },
    { title: "Impact and blast radius", from: ["Impact", "Correlation"] },
    { title: "Simulation and what-if", from: ["Simulation", "Capacity"] },
    { title: "Switchover go or no-go", from: ["Change", "Simulation"] },
    { title: "Change plan with evidence", from: ["Change", "Capacity"] },
  ],
  pillars: ["Grounded Insights", "Traceable", "Auditable"],
  connects: "Connects to every system of record",
  result: "Interdependent decisions, backed by evidence",
  takeaway:
    "EAiQ is an agentic AI orchestration layer that correlates and turns every asset signal into a grounded, predictive business decision",
};

/* ---------------- How it works (slide 6) ---------------- */

export const howItWorks = {
  eyebrow: "How it works",
  title: "One intelligent reasoning layer across systems, deciding with confidence",
  columns: [
    {
      n: 1,
      title: "Estate Components",
      items: [
        { title: "Business services", sub: "Owners | SLAs | Tenants" },
        { title: "Applications", sub: "Apps | APIs | Databases" },
        { title: "IT Infrastructure", sub: "Servers | Cloud | Network" },
        { title: "Facility", sub: "Racks | Room | Sensors" },
        { title: "Power + Cooling", sub: "UPS | PDU | Chillers" },
      ],
    },
    {
      n: 2,
      title: "Systems of Record",
      items: [
        { title: "ITSM / CSDM", sub: "Business services, ownership, SLAs" },
        { title: "NMS / APM", sub: "Network, compute & application health" },
        { title: "DCIM", sub: "Physical assets, power paths and capacity" },
        { title: "BMS / EMS", sub: "Cooling, power & environmental signals" },
      ],
    },
    {
      n: 3,
      title: "EAiQ Intelligence",
      items: [
        { title: "Build relationships", sub: "Map physical-to-business dependencies" },
        { title: "Correlate", sub: "Group live signals into one event" },
        { title: "Predict", sub: "Assess severity and business impact" },
        { title: "Simulate", sub: "Compare all recovery and scale-up options" },
        { title: "Decide", sub: "Select evidence-led response" },
      ],
    },
    {
      n: 4,
      title: "Decision",
      items: [
        { title: "PRIORITIZE", sub: "Big issue or small issue?", detail: "Business impact | Urgency | Confidence" },
        { title: "GOVERN", sub: "Recommend or Automate?", detail: "Policy | Approvals | Proven Audit Trails" },
      ],
    },
    {
      n: 5,
      title: "Execution + Outcome",
      items: [
        { title: "ITSM Workflow", sub: "Incident | Change | Approvals" },
        { title: "DCIM / BMS Action", sub: "Operator-controlled infrastructure action" },
        { title: "Automated Orchestration", sub: "Approved runbook or recovery plan" },
        { title: "Business Outcome", sub: "Faster Resolution | Resilience | Auditability" },
      ],
    },
  ],
  connectors: ["Connectors", "MCP", "APIs"],
  flow: [
    { n: 1, title: "Sense", sub: "Read-only", eaiq: false },
    { n: 2, title: "Connect", sub: "Normalize", eaiq: false },
    { n: 3, title: "Correlate", sub: "KG + events", eaiq: true },
    { n: 4, title: "Predict", sub: "Impact", eaiq: true },
    { n: 5, title: "Decide", sub: "Evidence", eaiq: true },
    { n: 6, title: "Control", sub: "Automate", eaiq: true },
  ],
  takeaway:
    "EAiQ reads existing systems of record (read only access by default), reasons across them and turns signals into prioritized, actionable and governed insights",
  note: "EAiQ retrieves data from relevant systems of record through governed APIs, connectors, MCP interfaces and other approved integration mechanisms.",
};

/* ---------------- Stack (slide 7) ---------------- */

export const stack = {
  eyebrow: "What powers the platform",
  title: 'Google powers the tech "stack", turning EAiQ into operational intelligence',
  layers: [
    { n: 1, name: "Experience", color: "#1a3a8f", does: "Delivers role-based insights, copilots, dashboards and operational workflows", tech: ["Gemini Enterprise", "Looker", "EAiQ Portal (React)"] },
    { n: 2, name: "Intelligence", color: "#6d4fd8", does: "Generates recommendations, predictions, root-cause analysis and autonomous agents", tech: ["Gemini & ADK", "Vertex AI", "Gemini Embedding"] },
    { n: 3, name: "Data", color: "#16a34a", does: "Creates a unified operational graph and analytics layer across enterprise systems", tech: ["Spanner Graph", "BigQuery", "Cloud SQL or AlloyDB"] },
    { n: 4, name: "Ingest", color: "#2546c4", does: "Collects, normalizes and streams telemetry, logs, configurations and code data", tech: ["Pub/Sub & Dataflow", "On-site agent", "Code assessment"] },
    { n: 5, name: "Trust", color: "#0f172a", does: "Enforces identity, security, encryption, governance and data sovereignty controls", tech: ["Identity Platform", "Cloud KMS", "VPC Service Controls"] },
  ],
  takeaway:
    "EAiQ leverages the Google Cloud stack to accelerate development, strengthen security and scalability, and deliver enterprise-grade operational intelligence",
};

/* ---------------- Where to sell (slide 8) ---------------- */

export interface Segment {
  id: string;
  title: string;
  future?: boolean;
  valueLead: string;
  valueRest: string;
  capabilities: string[];
  targets: { name: string; icon: string }[];
  businessModel: string[];
  pack: string;
}

export const segmentsIntro = {
  eyebrow: "Where to sell",
  title: "Tailored value propositions for data center operators and enterprise customers",
  takeaway:
    "Operators need resilient infrastructure while enterprises need uninterrupted services. EAiQ facilitates the delivery for both Cohorts.",
  notes: [
    "Primary customer segments within enterprise include GCCs, BFSI organizations, digital service providers, digital-native companies and large enterprises with wider IT footprint.",
    "Indicative future proposition, with capabilities to be developed and introduced as the platform evolves.",
  ],
};

export const segments: Segment[] = [
  {
    id: "dc-service-providers",
    title: "Data Center Service Providers",
    valueLead: "Unified multi-DC operations",
    valueRest: " to prevent failures, accelerate root-cause analysis and improve infrastructure utilization.",
    capabilities: [
      "Cross-System Event Correlation",
      "Predictive Maintenance & Failure Prevention",
      "AI-Powered Root Cause Analysis (RCA)",
      "Automated Issue Resolution & Remediation",
    ],
    targets: [
      { name: "Colocation Providers", icon: "Building2" },
      { name: "Data Center Operators", icon: "Cog" },
    ],
    businessModel: ["On-premises platform subscription", "Outcome-Based Managed Service"],
    pack: "DC",
  },
  {
    id: "enterprise-customers",
    title: "Enterprise Customers",
    valueLead: "End-to-end IT visibility",
    valueRest: " to reduce disruption, modernize infrastructure and optimize technology spend.",
    capabilities: [
      "IT Asset Monitoring & Code Modernization Insights",
      "Infrastructure Health Monitoring",
      "IT Operations Optimization",
      "Service Cost & Resource Optimization",
    ],
    targets: [
      { name: "GCCs", icon: "Boxes" },
      { name: "BFSI", icon: "Landmark" },
      { name: "DSPs", icon: "MonitorSmartphone" },
      { name: "Large Enterprises", icon: "Factory" },
    ],
    businessModel: ["SaaS based Platform Subscription", "Enterprise Platform Licensing"],
    pack: "Enterprise",
  },
  {
    id: "new-dc-entrants",
    title: "New Data Center Entrants",
    future: true,
    valueLead: "End-to-end DC planning",
    valueRest: " to evaluate site feasibility, define design & investment requirements, ensure compliance & mitigate risks.",
    capabilities: [
      "Site Feasibility & Location Assessment",
      "Conceptual Design & Capacity Planning",
      "Regulatory & Compliance Assessment",
      "BOQ, Investment & Supply Chain Risk Planning",
    ],
    targets: [
      { name: "Real estate developers", icon: "Building" },
      { name: "Construction companies", icon: "Construction" },
      { name: "Sovereign & PE Funds", icon: "Banknote" },
    ],
    businessModel: ["Outcome-Based Managed Service"],
    pack: "Future",
  },
];

/* ---------------- Path to value (slide 9) ---------------- */

export const roadmap = {
  eyebrow: "Path to value",
  title: "From a live MVP to governed, semi-autonomous operations",
  phases: [
    { key: "mvp", label: "MVP", sub: "Live Today" },
    { key: "plus", label: "MVP+", sub: "Upcoming weeks" },
    { key: "target", label: "Target state", sub: "Fully autonomous" },
  ],
  rows: [
    { layer: "Command view and twin", mvp: "Unified view, twin, capacity planner", plus: "Persona specific views", target: "Digital Twin built from documents" },
    { layer: "Intelligence engines", mvp: "6 engines built, 2 enabled*", plus: "Expert-reviewed rules, Predictive risk", target: "Simulation view, Green field compliances" },
    { layer: "Knowledge graph", mvp: "In-process graph, demo site", plus: "Bigger graph and ontology", target: "Graph optimization" },
    { layer: "AI layer", mvp: "L1 AI Ops: RCA, Gemini explains", plus: "More autonomous agent", target: "L2 Semi-autonomous: recommends" },
    { layer: "Data and connectors", mvp: "Reference data, simulated feed", plus: "Connector design: MCP & custom APIs", target: "More file types support" },
    { layer: "Platform and trust", mvp: "RBAC, audit log, local run", plus: "GCP deploy, CI/CD, SSO", target: "Security review" },
    { layer: "Modernisation", mvp: "-", plus: "-", target: "Scope with pilot clients" },
  ],
  takeaway:
    "EAiQ will evolve from a live MVP to governed, semi-autonomous operations, with each phase validated through client use cases and pilot deployments.",
};
