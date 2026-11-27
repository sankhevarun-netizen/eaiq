/** Single source of truth for the header navigation. */

export type NavLink = { label: string; href: string; external?: boolean };
export type NavGroup = { label?: string; links: NavLink[] };
export type NavItem = { label: string; href: string; groups?: NavGroup[] };

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Story",
    href: "/problem",
    groups: [
      {
        label: "The case for EAiQ",
        links: [
          { label: "The problem", href: "/problem" },
          { label: "Our solution", href: "/solution" },
          { label: "How it works", href: "/how-it-works" },
          { label: "Path to value", href: "/path-to-value" },
        ],
      },
    ],
  },
  {
    label: "Agents",
    href: "/agents",
    groups: [
      {
        label: "DC pack",
        links: [
          { label: "D1 Correlation and incident", href: "/agents/d1-correlation-and-incident" },
          { label: "D2 Capacity and twin", href: "/agents/d2-capacity-and-twin" },
          { label: "D3 Risk", href: "/agents/d3-risk" },
          { label: "D4 Change and switchover", href: "/agents/d4-change-and-switchover" },
        ],
      },
      {
        label: "Enterprise pack",
        links: [
          { label: "E1 Portfolio and architecture", href: "/agents/e1-portfolio-and-architecture" },
          { label: "E2 Code and dependency", href: "/agents/e2-code-and-dependency" },
          { label: "E3 Pipeline support", href: "/agents/e3-pipeline-support" },
          { label: "E4 Estate scan and optimization", href: "/agents/e4-estate-scan-and-optimization" },
        ],
      },
      {
        label: "Shared",
        links: [
          { label: "Orchestrator", href: "/agents/orchestrator" },
          { label: "S1 Knowledge", href: "/agents/s1-knowledge" },
          { label: "S2 Graph curator", href: "/agents/s2-graph-curator" },
          { label: "All agents", href: "/agents" },
        ],
      },
    ],
  },
  {
    label: "Platform",
    href: "/platform",
    groups: [
      {
        links: [
          { label: "Google stack", href: "/platform" },
          { label: "Solution blueprint", href: "/platform/blueprint" },
          { label: "Trust & governance", href: "/platform/trust" },
        ],
      },
    ],
  },
  {
    label: "Questions",
    href: "/questions",
    groups: [
      {
        links: [
          { label: "All 20 questions", href: "/questions" },
          { label: "DC questions", href: "/questions?scope=DC" },
          { label: "Enterprise questions", href: "/questions?scope=Enterprise" },
          { label: "Assets to boardroom", href: "/questions?scope=Bridge" },
        ],
      },
    ],
  },
  {
    label: "Ontology",
    href: "/ontology",
    groups: [
      {
        label: "Knowledge graph",
        links: [
          { label: "Overview", href: "/ontology" },
          { label: "Schema map", href: "/ontology/schema" },
          { label: "Node explorer", href: "/ontology/explorer" },
        ],
      },
      {
        label: "Dataset",
        links: [
          { label: "The estate", href: "/ontology/estate" },
          { label: "Answers on the dataset", href: "/ontology/answers" },
        ],
      },
    ],
  },
  {
    label: "Who it's for",
    href: "/segments",
    groups: [
      {
        links: [
          { label: "Data Center Service Providers", href: "/segments/dc-service-providers" },
          { label: "Enterprise Customers", href: "/segments/enterprise-customers" },
          { label: "New Data Center Entrants", href: "/segments/new-dc-entrants" },
        ],
      },
    ],
  },
  {
    label: "Console",
    href: "/console",
    groups: [
      {
        label: "DC console",
        links: [
          { label: "Command view", href: "/console/dc/command" },
          { label: "Digital twin", href: "/console/dc/twin" },
          { label: "Incident command", href: "/console/dc/incidents" },
          { label: "Switchover planner", href: "/console/dc/switchover" },
        ],
      },
      {
        label: "Enterprise console",
        links: [
          { label: "Portfolio", href: "/console/enterprise/portfolio" },
          { label: "Dependencies", href: "/console/enterprise/dependencies" },
          { label: "Releases", href: "/console/enterprise/releases" },
          { label: "Scorecard", href: "/console/enterprise/scorecard" },
        ],
      },
    ],
  },
];

export function isActive(pathname: string, href: string) {
  const path = href.split(/[#?]/)[0];
  if (path === "/") return pathname === "/";
  return pathname === path || pathname.startsWith(`${path}/`);
}
