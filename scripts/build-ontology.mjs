// Build-time: turn the EAiQ dataset (nodes/, edges/, metadata) into static JSON under public/ontology.
// Usage: node scripts/build-ontology.mjs data-src/eaiq_dataset_v2_4
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const src = process.argv[2];
if (!src || !fs.existsSync(src)) {
  console.error("Pass the extracted dataset folder, e.g. data-src/eaiq_dataset_v2_4");
  process.exit(1);
}
const out = path.join(process.cwd(), "public", "ontology");
fs.mkdirSync(out, { recursive: true });

function parseCsv(text) {
  const rows = [];
  let row = [], cell = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') q = false;
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n") { row.push(cell.replace(/\r$/, "")); rows.push(row); row = []; cell = ""; }
    else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const [head, ...body] = rows.filter((r) => r.length > 1 || r[0]);
  return { head, body };
}
const readCsv = (p) => parseCsv(fs.readFileSync(p, "utf8"));
const num = (v) => (v !== "" && !isNaN(Number(v)) && !/^0\d/.test(v) ? Number(v) : v);

/* ---------- nodes ---------- */
const LABEL_KEYS = ["name", "title", "hostname", "product_title", "message"];
const nodes = [];
const typeOf = new Map();
const nodeTypes = [];
for (const f of fs.readdirSync(path.join(src, "nodes")).sort()) {
  const type = f.replace(/\.csv$/, "");
  const { head, body } = readCsv(path.join(src, "nodes", f));
  nodeTypes.push({ type, count: body.length, props: head });
  for (const r of body) {
    const props = {};
    head.forEach((h, i) => { if (r[i] !== "" && r[i] !== undefined) props[h] = num(r[i]); });
    const id = r[0];
    let label = id;
    for (const k of LABEL_KEYS) if (props[k]) { label = type === "Technology" ? `${props.product_title} ${props.cycle}` : String(props[k]); break; }
    delete props.id;
    typeOf.set(id, type);
    nodes.push([id, type, label, props.site_id ?? props.enterprise_id ?? "", props]);
  }
}

/* ---------- edges ---------- */
const edges = [];
const edgeTypes = [];
for (const f of fs.readdirSync(path.join(src, "edges")).sort()) {
  const type = f.replace(/\.csv$/, "");
  const { head, body } = readCsv(path.join(src, "edges", f));
  const pairs = {};
  for (const r of body) {
    const props = {};
    head.slice(2).forEach((h, i) => { if (r[i + 2] !== "") props[h] = num(r[i + 2]); });
    edges.push(Object.keys(props).length ? [r[0], r[1], type, props] : [r[0], r[1], type]);
    const k = `${typeOf.get(r[0]) ?? "?"}>${typeOf.get(r[1]) ?? "?"}`;
    pairs[k] = (pairs[k] ?? 0) + 1;
  }
  const ends = Object.entries(pairs).sort((a, b) => b[1] - a[1]).map(([k, n]) => ({ from: k.split(">")[0], to: k.split(">")[1], n }));
  edgeTypes.push({ type, count: body.length, props: head.slice(2), ends, example: body[0] ? `${body[0][0]} > ${body[0][1]}` : "" });
}

/* ---------- metadata ---------- */
const stats = JSON.parse(fs.readFileSync(path.join(src, "stats.json"), "utf8"));
const volume = JSON.parse(fs.readFileSync(path.join(src, "volume_counts.json"), "utf8"));
const ontologyMd = fs.readFileSync(path.join(src, "ONTOLOGY.md"), "utf8");

// Fact tables: parse the markdown table under "## Fact tables"
const factSection = ontologyMd.split("## Fact tables")[1] ?? "";
const factTables = factSection
  .split("\n")
  .filter((l) => l.startsWith("| ") && !l.startsWith("| Table") && !l.startsWith("|---"))
  .map((l) => l.split("|").slice(1, -1).map((s) => s.trim()))
  .map(([table, rows, columns, links]) => ({ table, rows: Number(rows.replace(/,/g, "")), columns: columns.split(",").map((s) => s.trim()), links }));
const factNote = (factSection.split("\n").find((l) => l.startsWith("Derived")) ?? "").trim();
const keptNote = (factSection.split("\n").find((l) => l.startsWith("Original")) ?? "").trim();

/* ---------- estate ---------- */
const byType = (t) => nodes.filter((n) => n[1] === t);
const pue = readCsv(path.join(src, "tables", "pue_monthly.csv"));
const pueBySite = {};
for (const r of pue.body) (pueBySite[r[0]] ??= []).push({ month: r[1].slice(0, 7), pue: Number(r[4]), it: Number(r[2]) });

// Alert events per site / class (stream the gz once)
const alerts = parseCsv(zlib.gunzipSync(fs.readFileSync(path.join(src, "tables", "alert_events.csv.gz"))).toString("utf8"));
const ai = (h) => alerts.head.indexOf(h);
const alertsBySite = {};
for (const r of alerts.body) {
  const s = (alertsBySite[r[ai("site_id")]] ??= { total: 0, bySeverity: {} });
  s.total++;
  s.bySeverity[r[ai("severity")]] = (s.bySeverity[r[ai("severity")]] ?? 0) + 1;
}

const SITE_NOTES = {
  MUM1: "93% leased, bad battery lot, planted PDU trip",
  MUM2: "New, AI tenants at 12-15 kW, cooling underbuilt",
  CHN1: "Ageing batteries, planted pump trip and thermal event",
  HYD1: "GCC DR racks, bad battery lot",
  PUN1: "GCC primary, 2014 build",
  NOI1: "Bank DR centre, 2009 build",
};
const sites = byType("Site").map(([id, , label, , p]) => {
  const racks = byType("Rack").filter((r) => r[4].site_id === id);
  const leased = racks.filter((r) => r[4].status === "leased").length;
  return {
    id, name: label, city: p.city, kind: p.kind, operator: p.operator, tier: p.tier_design, year: p.year_commissioned,
    grid: p.utility_grid, dualFeed: p.dual_feed === "True",
    halls: byType("Hall").filter((h) => h[4].site_id === id).length,
    racks: racks.length, leasedPct: racks.length ? Math.round((leased / racks.length) * 100) : 0,
    assets: byType("Asset").filter((a) => a[4].site_id === id).length,
    incidents: byType("Incident").filter((i) => i[4].site_id === id).length,
    tenants: [...new Set(racks.map((r) => r[4].tenant_id).filter(Boolean))].length,
    alerts: alertsBySite[id] ?? { total: 0, bySeverity: {} },
    pue: pueBySite[id] ?? [],
    note: SITE_NOTES[id] ?? "",
  };
});
const enterprises = byType("Enterprise").map(([id, , label, , p]) => {
  const apps = byType("Application").filter((a) => a[4].enterprise_id === id);
  return {
    id, name: label, kind: p.kind, hq: p.hq_country, story: p.story,
    apps: apps.length,
    tier1: apps.filter((a) => a[4].criticality === "tier1").length,
    components: byType("Component").filter((c) => c[4].enterprise_id === id).length,
    cloudResources: byType("CloudResource").filter((c) => c[4].enterprise_id === id).length,
    capabilities: byType("Capability").filter((c) => c[4].enterprise_id === id).length,
    runCostInr: apps.reduce((s, a) => s + (Number(a[4].annual_run_cost_inr) || 0), 0),
  };
});

/* ---------- checks ---------- */
if (nodes.length !== stats.nodes || edges.length !== stats.edges || nodeTypes.length !== stats.node_tables || edgeTypes.length !== stats.edge_tables) {
  console.error(`Count mismatch: nodes ${nodes.length}/${stats.nodes}, edges ${edges.length}/${stats.edges}, node tables ${nodeTypes.length}/${stats.node_tables}, edge tables ${edgeTypes.length}/${stats.edge_tables}`);
  process.exit(1);
}

const write = (n, o) => fs.writeFileSync(path.join(out, n), JSON.stringify(o));
write("graph.json", { nodes, edges });
write("schema.json", {
  stats: { nodeTables: stats.node_tables, edgeTables: stats.edge_tables, nodes: stats.nodes, edges: stats.edges, checks: stats.checks, violations: stats.violations, factRows: volume.total },
  nodeTypes, edgeTypes, factTables, factNote, keptNote,
});
write("estate.json", { sites, enterprises });
fs.copyFileSync(path.join(src, "question_results.json"), path.join(out, "answers.json"));

console.log(`ok: ${nodeTypes.length} node tables, ${edgeTypes.length} edge tables, ${nodes.length} nodes, ${edges.length} edges, ${volume.total} fact rows`);
for (const f of fs.readdirSync(out)) console.log(`  ${f}  ${(fs.statSync(path.join(out, f)).size / 1024).toFixed(0)} KB`);
