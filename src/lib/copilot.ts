/** Orchestrator templates: every figure comes from site data / engines; no match → template fallback. */
import type { Runbook, SiteData } from "@/lib/consoleData";
import { tenantName } from "@/lib/consoleData";
import { downstream, simulateChange } from "@/lib/dcEngine";

function findAsset(s: SiteData, q: string) {
  const up = q.toUpperCase();
  const tokens = up.match(/[A-Z0-9]+(?:-[A-Z0-9]+)+/g) ?? [];
  for (const t of tokens) {
    const exact = s.assets.find((a) => a.id === t || a.id === `${s.site.id}-${t}`);
    if (exact) return exact;
    const part = s.assets.find((a) => a.id.endsWith(t) || a.id.includes(t));
    if (part) return part;
  }
  return null;
}

export function answer(s: SiteData, q: string, runbooks: Runbook[] | null): { text: string; facts: string[] } {
  const l = q.toLowerCase();
  const a = findAsset(s, q);
  if (a && /(depend|feed|behind|downstream|affect)/.test(l)) {
    const ds = downstream(s, a.id);
    const racks = ds.filter((x) => x.includes("RACK"));
    const by = new Map<string, number>();
    for (const r of s.racks) if (racks.includes(r.id)) by.set(tenantName(s, r.tenant), (by.get(tenantName(s, r.tenant)) ?? 0) + 1);
    const ts = [...by.entries()].sort((x, y) => y[1] - x[1]);
    return {
      text: `${a.id} (${a.type.replace("_", " ")}) has ${ds.length} components downstream, including ${racks.length} racks. Tenants behind it: ${ts.map(([t, n]) => `${t} (${n})`).join(", ") || "none"}. Racks are dual-fed, so losing ${a.id} alone puts them on one path rather than down — run the switchover planner for the exact verdict.`,
      facts: [`graph.downstream(${a.id})=${ds.length}`, `racks=${racks.length}`, `tenants=${ts.length}`],
    };
  }
  if (a && /(switch|change|maintenance|take .* out|safe)/.test(l)) {
    const r = simulateChange(s, a.id, runbooks);
    return { text: `Taking ${a.id} out: ${r.verdict}. ${r.singlePath} racks drop to one path, ${r.lostWithAlerts} would be lost given open alerts. ${r.conditions[0] ?? ""}`, facts: [`switchover.verdict=${r.verdict}`, `single=${r.singlePath}`, `lostWithAlerts=${r.lostWithAlerts}`] };
  }
  if (/stranded|capacity|headroom/.test(l)) {
    const h = s.halls.filter((x) => x.strandedKw > 0);
    return { text: `${s.kpis.strandedKw} kW is stranded at ${s.site.id}: ${h.map((x) => `${x.name} ${x.strandedKw} kW (${x.binding}-bound)`).join(", ") || "none"}. Measured headroom is ${s.kpis.headroomKw} kW.`, facts: [`kpis.strandedKw=${s.kpis.strandedKw}`, `kpis.headroomKw=${s.kpis.headroomKw}`] };
  }
  if (/incident|alert|alarm|outage|root/.test(l)) {
    const open = s.incidents.filter((i) => i.status === "open");
    const cause = s.alerts.find((x) => x.role === "cause");
    if (!open.length) return { text: `No open incidents at ${s.site.id}. ${s.incidents.length} recorded; the latest was ${s.incidents[0]?.id ?? "—"} (${s.incidents[0]?.rootCause ?? "—"}).`, facts: [`incidents.open=0`] };
    return { text: `${open.map((i) => i.id).join(", ")}: ${s.alerts.length} alerts grouped into one incident. Root cause ${cause?.target} — ${cause?.message}. ${s.alerts.filter((x) => x.role === "symptom").length} symptoms, ${s.alerts.filter((x) => x.role === "unrelated").length} unrelated.`, facts: [`alerts=${s.alerts.length}`, `root=${cause?.target}`] };
  }
  if (/battery|drift|risk|replace|watchlist/.test(l)) {
    const w = s.watchlist.slice(0, 3);
    return { text: w.length ? w.map((x) => `${x.id}: ${x.riseC ? `+${x.riseC} °C vs peers (lot ${x.lot})` : `${Math.round(x.ageRatio * 100)}% of design life`}, ${x.racks} racks, act by ${x.actBy}`).join(". ") + "." : `Nothing on the watchlist at ${s.site.id}.`, facts: w.map((x) => `risk.score(${x.id})=${x.score}`) };
  }
  return { text: `Template answer: ask about dependencies (“What depends on ${s.assets.find((x) => x.type === "ups")?.id}?”), stranded capacity, the open incident, battery drift or a switchover. Every figure comes from an engine fact.`, facts: ["template.fallback"] };
}

/** S1 semantic search over runbooks and incidents (keyword overlap, ranked, with a reason). */
export function search(s: SiteData, q: string, runbooks: Runbook[] | null) {
  const words = q.toLowerCase().split(/\W+/).filter((w) => w.length > 2);
  const syn: Record<string, string[]> = { hot: ["overheating", "thermal", "temperature"], getting: [], power: ["ups", "pdu", "feed"], cooling: ["crah", "chiller", "pump"], down: ["trip", "loss", "failure"] };
  const terms = [...new Set(words.flatMap((w) => [w, ...(syn[w] ?? [])]))];
  const score = (t: string) => terms.filter((w) => t.toLowerCase().includes(w)).length;
  const rb = (runbooks ?? []).map((r) => ({ r, n: score(`${r.title} ${r.keywords}`) })).filter((x) => x.n > 0).sort((a, b) => b.n - a.n).slice(0, 4)
    .map(({ r, n }) => ({ kind: "Runbook", title: `${r.id} · ${r.title}`, reason: `${n} matching terms in title and keywords; ${r.steps.length} steps, owner ${r.team}`, href: "/console/dc/incidents" }));
  const inc = s.incidents.map((i) => ({ i, n: score(`${i.rootCause} ${i.rootAsset}`) })).filter((x) => x.n > 0).sort((a, b) => b.n - a.n).slice(0, 3)
    .map(({ i }) => ({ kind: "Incident", title: `${i.id} · ${i.rootCause}`, reason: `Root asset ${i.rootAsset}${i.runbook ? `; resolved with ${i.runbook}` : ""}`, href: `/console/dc/incidents?id=${i.id}` }));
  return [...rb, ...inc];
}
