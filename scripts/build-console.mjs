// Build-time: per-site and per-enterprise console data from the EAiQ dataset.
// Usage: node scripts/build-console.mjs data-src/eaiq_dataset_v2_4
import fs from "node:fs";
import path from "node:path";

const src = process.argv[2];
if (!src || !fs.existsSync(src)) { console.error("Pass the extracted dataset folder"); process.exit(1); }
const out = path.join(process.cwd(), "public", "console");
fs.mkdirSync(out, { recursive: true });
const TODAY = new Date("2026-11-27T09:00:00Z");

function parseCsv(text) {
  const rows = []; let row = [], cell = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; } else if (c === '"') q = false; else cell += c; }
    else if (c === '"') q = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n") { row.push(cell.replace(/\r$/, "")); rows.push(row); row = []; cell = ""; }
    else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const [head, ...body] = rows.filter((r) => r.length > 1 || r[0]);
  return body.map((r) => Object.fromEntries(head.map((h, i) => [h, r[i] ?? ""])));
}
const N = (f) => parseCsv(fs.readFileSync(path.join(src, "nodes", f + ".csv"), "utf8"));
const E = (f) => parseCsv(fs.readFileSync(path.join(src, "edges", f + ".csv"), "utf8"));
const T = (f) => parseCsv(fs.readFileSync(path.join(src, "tables", f + ".csv"), "utf8"));
const num = (v) => (v === "" || v === undefined ? null : Number(v));
const answers = JSON.parse(fs.readFileSync(path.join(src, "question_results.json"), "utf8"));
const write = (n, o) => fs.writeFileSync(path.join(out, n), JSON.stringify(o));

/* ================= shared ================= */
const runbooks = N("Runbook").map((r) => ({ id: r.id, title: r.title, type: r.applies_to_asset_type, team: r.owner_team, limit: num(r.time_limit_min), keywords: r.keywords }));
const steps = N("RunbookStep");
for (const rb of runbooks) rb.steps = steps.filter((s) => s.runbook_id === rb.id).sort((a, b) => a.seq - b.seq).map((s) => ({ seq: num(s.seq), kind: s.kind, text: s.text, team: s.owner_team, limit: num(s.time_limit_min) }));
write("runbooks.json", runbooks);

/* ================= DC ================= */
const sites = N("Site"), halls = N("Hall"), rowsN = N("Row"), racks = N("Rack"), assets = N("Asset"), tenants = N("Tenant");
const contracts = N("Contract"), alerts = N("Alert"), incidents = N("Incident"), bookings = N("Booking"), models = N("AssetModel");
const maint = N("MaintenanceRecord");
const feeds = E("FEEDS"), powers = E("POWERS_RACK"), cools = E("COOLS_ROW"), redundant = E("REDUNDANT_WITH");
const pue = T("pue_monthly");
const telemetry = T("telemetry");
const modelById = Object.fromEntries(models.map((m) => [m.id, m]));
const tenantById = Object.fromEntries(tenants.map((t) => [t.id, t]));

// downstream racks of an asset (any path)
const outFeeds = {};
for (const f of feeds) if (f.normally_open !== "True" && f.kind !== "tie") (outFeeds[f.src_id] ??= []).push(f.dst_id);
const rackOf = {};
for (const p of powers) (rackOf[p.src_id] ??= []).push(p.dst_id);
function downstreamRacks(id) {
  const seen = new Set([id]), st = [id], rs = new Set();
  while (st.length) { const c = st.pop(); for (const r of rackOf[c] ?? []) rs.add(r); for (const n of outFeeds[c] ?? []) if (!seen.has(n)) { seen.add(n); st.push(n); } }
  return [...rs];
}
const rackById = Object.fromEntries(racks.map((r) => [r.id, r]));
const ageRatio = (a) => { const d = (TODAY - new Date(a.install_date)) / (365.25 * 864e5); return a.design_life_years ? d / Number(a.design_life_years) : 0; };
const addYears = (d, y) => { const x = new Date(d); x.setFullYear(x.getFullYear() + Math.floor(y)); x.setMonth(x.getMonth() + Math.round((y % 1) * 12)); return x.toISOString().slice(0, 10); };

const q2 = answers["2"], q4 = answers["4"].halls_with_stranded_capacity, q5 = answers["5"].candidates, q6 = answers["6"].top, q14 = answers["14"].top;

for (const s of sites) {
  const sid = s.id;
  const sRacks = racks.filter((r) => r.site_id === sid);
  const sAssets = assets.filter((a) => a.site_id === sid);
  const sHalls = halls.filter((h) => h.site_id === sid);
  const hallIds = new Set(sHalls.map((h) => h.id));
  const sRows = rowsN.filter((r) => hallIds.has(r.hall_id));
  const ids = new Set([...sAssets.map((a) => a.id), ...sRacks.map((r) => r.id)]);

  const hallsOut = sHalls.map((h) => {
    const hr = sRacks.filter((r) => r.hall_id === h.id);
    const leased = hr.filter((r) => r.status === "leased");
    const stat = q4.find((x) => x.hall === h.id) ?? q5.find((x) => x.hall === h.id);
    const sold = leased.reduce((t, r) => t + Number(r.rated_kw), 0);
    const measured = Math.round(hr.reduce((t, r) => t + Number(r.current_load_kw || 0), 0));
    const limit = stat?.limit_kw ?? Number(h.design_it_kw);
    return {
      id: h.id, name: h.name, designKw: Number(h.design_it_kw), rackKw: Number(h.rack_kw), racks: hr.length,
      leased: leased.length, vacant: hr.length - leased.length, soldKw: Math.round(sold), measuredKw: measured,
      limitKw: limit, binding: stat?.binding ?? "design", strandedKw: stat?.stranded_kw ?? Math.max(0, Math.round(sold - limit)),
      headroomKw: Math.round(limit - measured),
    };
  });

  const siteTenants = [...new Set(sRacks.map((r) => r.tenant_id).filter(Boolean))].map((tid) => {
    const t = tenantById[tid];
    const c = contracts.find((x) => x.tenant_id === tid && x.site_id === sid);
    return {
      id: tid, name: t?.name ?? tid, tier: t?.tier ?? "", kind: t?.kind ?? "", enterprise: t?.enterprise_id || null,
      racks: sRacks.filter((r) => r.tenant_id === tid).length,
      contract: c ? { id: c.id, uptime: Number(c.uptime_target_pct), thresholdH: Number(c.penalty_threshold_hours), ratePerH: s.kind === "captive" ? 0 : Number(c.penalty_inr_per_hour), notifyMin: Number(c.notification_minutes), priceKwMonth: Number(c.price_inr_per_kw_month) } : null,
    };
  }).sort((a, b) => b.racks - a.racks);

  // alerts with correlation classes (D1)
  const sAlerts = alerts.filter((a) => a.site_id === sid);
  const qa = q2[sid];
  const upstreamOfRoot = new Set();
  if (qa) { const st = [qa.root]; while (st.length) { const c = st.pop(); for (const f of feeds) if (f.dst_id === c && !upstreamOfRoot.has(f.src_id)) { upstreamOfRoot.add(f.src_id); st.push(f.src_id); } } }
  const alertsOut = sAlerts.map((a) => ({
    id: a.id, target: a.target_id, targetType: a.target_type, severity: a.severity, message: a.message, cls: a.alert_class, raisedAt: a.raised_at, status: a.status,
    role: !qa ? "unrelated" : a.target_id === qa.root ? "cause" : qa.unrelated.includes(a.id) ? "unrelated" : upstreamOfRoot.has(a.target_id) ? "upstream consequence" : "symptom",
  }));

  const sInc = incidents.filter((i) => i.site_id === sid && i.domain === "dc").sort((a, b) => (a.opened_at < b.opened_at ? 1 : -1)).map((i) => ({
    id: i.id, severity: Number(i.severity), openedAt: i.opened_at, resolvedAt: i.resolved_at || null, durationMin: num(i.duration_min),
    rootCause: i.root_cause, rootAsset: i.root_cause_asset_id, status: i.status, runbook: i.used_runbook_id || null,
  }));

  // watchlist (D3): drift (Q6) + age (Q14) + age ratio >= 0.85
  const drift = Object.fromEntries(q6.map((x) => [x.asset, x]));
  const q14m = Object.fromEntries(q14.map((x) => [x.asset, x]));
  const watch = sAssets
    .map((a) => ({ a, ar: ageRatio(a) }))
    .filter(({ a, ar }) => drift[a.id] || q14m[a.id] || ar >= 0.85)
    .map(({ a, ar }) => {
      const rs = downstreamRacks(a.id);
      const ts = [...new Set(rs.map((r) => rackById[r]?.tenant_id).filter(Boolean))].map((t) => tenantById[t]?.name ?? t);
      const d = drift[a.id];
      const replaceBy = addYears(a.install_date, Number(a.design_life_years));
      const actBy = d ? new Date(TODAY.getTime() + (d.z > 6 ? 7 : 21) * 864e5).toISOString().slice(0, 10) : replaceBy;
      const m = modelById[a.model_id];
      const score = Math.round(Math.min(100, (d ? 40 + d.z * 6 : 0) + ar * 50));
      const temps = telemetry.filter((t) => t.asset_id === a.id && t.metric === "battery_temp_c").map((t) => Number(t.value));
      return {
        id: a.id, type: a.asset_type, hall: a.hall_id, lot: a.battery_lot || null, install: a.install_date, lifeY: Number(a.design_life_years),
        ageRatio: Math.round(ar * 100) / 100, replaceBy, actBy, riseC: d?.rise_c ?? null, z: d?.z ?? null, score,
        racks: rs.length, tenants: ts, cost: m ? Number(m.replacement_cost_inr) : null, leadDays: m ? Number(m.lead_time_days) : null,
        make: m ? `${m.make} ${m.model}` : "", temps: temps.filter((_, i) => i % 4 === 0),
        maint: maint.filter((x) => x.asset_id === a.id).map((x) => ({ on: x.performed_on, kind: x.kind, outcome: x.outcome, reading: x.reading_value ? `${x.reading_name} ${x.reading_value}` : "" })),
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 25);

  // peer mean battery temp (same site) for the drift chart
  const bt = telemetry.filter((t) => t.metric === "battery_temp_c" && t.asset_id.startsWith(sid + "-"));
  const byTs = {};
  for (const t of bt) (byTs[t.ts] ??= []).push(Number(t.value));
  const peerTemps = Object.keys(byTs).sort().map((k) => Math.round((byTs[k].reduce((x, y) => x + y, 0) / byTs[k].length) * 10) / 10).filter((_, i) => i % 4 === 0);

  const links = [
    ...feeds.filter((f) => ids.has(f.src_id) && ids.has(f.dst_id)).map((f) => [f.src_id, f.dst_id, f.kind === "tie" || f.normally_open === "True" ? "TIE" : f.kind === "backup" ? "BACKUP" : f.chain === "cooling" ? "COOLS" : "FEEDS"]),
    ...powers.filter((p) => ids.has(p.src_id)).map((p) => [p.src_id, p.dst_id, "POWERS_RACK", p.side]),
    ...cools.filter((c) => ids.has(c.src_id)).map((c) => [c.src_id, c.dst_id, "COOLS_ROW"]),
    ...redundant.filter((r) => ids.has(r.src_id)).map((r) => [r.src_id, r.dst_id, "REDUNDANT_WITH"]),
  ];

  const leased = sRacks.filter((r) => r.status === "leased").length;
  const siteOut = {
    site: { id: sid, name: s.name, city: s.city, kind: s.kind, operator: s.operator, tier: s.tier_design, year: Number(s.year_commissioned), grid: s.utility_grid, dualFeed: s.dual_feed === "True" },
    asOf: "27 Nov 2026, 09:00 IST",
    kpis: {
      racks: sRacks.length, leased, leasedPct: Math.round((leased / sRacks.length) * 100),
      itLoadKw: Math.round(sRacks.reduce((t, r) => t + Number(r.current_load_kw || 0), 0)),
      soldKw: hallsOut.reduce((t, h) => t + h.soldKw, 0), limitKw: hallsOut.reduce((t, h) => t + h.limitKw, 0),
      strandedKw: hallsOut.reduce((t, h) => t + h.strandedKw, 0), headroomKw: hallsOut.reduce((t, h) => t + Math.max(0, h.headroomKw), 0),
      assets: sAssets.length, inService: sAssets.filter((a) => a.status === "in_service").length,
    },
    halls: hallsOut,
    rows: sRows.map((r) => ({ id: r.id, hall: r.hall_id, no: Number(r.row_no) })),
    racks: sRacks.map((r) => ({ id: r.id, hall: r.hall_id, row: r.row_id, pos: Number(r.position), kw: Number(r.rated_kw), load: Number(r.current_load_kw || 0), tenant: r.tenant_id || null, status: r.status, zone: r.density_zone })),
    assets: sAssets.map((a) => ({ id: a.id, type: a.asset_type, hall: a.hall_id || null, chain: a.chain, kw: num(a.rated_kw), status: a.status, group: a.redundancy_group || null, install: a.install_date, lifeY: num(a.design_life_years), lot: a.battery_lot || null, model: modelById[a.model_id] ? `${modelById[a.model_id].make} ${modelById[a.model_id].model}` : "" })),
    links, tenants: siteTenants, alerts: alertsOut, incidents: sInc,
    bookings: bookings.filter((b) => b.site_id === sid).map((b) => ({ id: b.id, asset: b.asset_id, start: b.starts_at, end: b.ends_at, purpose: b.purpose })),
    pue: pue.filter((p) => p.site_id === sid).map((p) => ({ month: p.month.slice(0, 7), pue: Number(p.pue), it: Number(p.it_kw_avg) })),
    watchlist: watch, peerTemps,
  };
  write(`site-${sid}.json`, siteOut);
}
write("sites.json", sites.map((s) => ({ id: s.id, name: s.name, kind: s.kind })));

/* ================= Enterprise ================= */
const ents = N("Enterprise"), apps = N("Application"), comps = N("Component"), techs = N("Technology"), caps = N("Capability");
const decisions = N("Decision"), standards = N("Standard"), cres = N("CloudResource"), libs = N("Library"), regs = N("Regulation");
const builtWith = E("BUILT_WITH"), calls = E("CALLS"), supports = E("SUPPORTS_CAPABILITY"), subjectTo = E("SUBJECT_TO"), usesLib = E("USES_LIBRARY"), governs = E("GOVERNS_PRODUCT");
const deployments = T("deployments"), runs = T("pipeline_runs"), pipelines = N("Pipeline"), repos = N("Repo");
const techById = Object.fromEntries(techs.map((t) => [t.id, t]));
const compById = Object.fromEntries(comps.map((c) => [c.id, c]));
const appById = Object.fromEntries(apps.map((a) => [a.id, a]));
const libById = Object.fromEntries(libs.map((l) => [l.id, l]));
const isEol = (t) => t && t.eol_date && new Date(t.eol_date) < TODAY;

for (const e of ents) {
  const eid = e.id;
  const eApps = apps.filter((a) => a.enterprise_id === eid);
  const eComps = comps.filter((c) => c.enterprise_id === eid);
  const appCalls = {};
  for (const c of calls) {
    const s = compById[c.src_id], d = compById[c.dst_id];
    if (!s || !d || s.enterprise_id !== eid) continue;
    if (s.app_id === d.app_id) continue;
    const k = `${s.app_id}>${d.app_id}`;
    const x = (appCalls[k] ??= { from: s.app_id, to: d.app_id, calls: 0, minConf: 1, sumConf: 0, evidence: {} });
    x.calls++; x.minConf = Math.min(x.minConf, Number(c.confidence)); x.sumConf += Number(c.confidence); x.evidence[c.evidence] = (x.evidence[c.evidence] ?? 0) + 1;
  }
  const appLinks = Object.values(appCalls).map((x) => ({ from: x.from, to: x.to, calls: x.calls, minConf: Math.round(x.minConf * 100) / 100, avgConf: Math.round((x.sumConf / x.calls) * 100) / 100, evidence: x.evidence }));
  const dependents = {};
  for (const l of appLinks) dependents[l.to] = (dependents[l.to] ?? 0) + 1;

  const costs = eApps.map((a) => Number(a.annual_run_cost_inr)).sort((a, b) => a - b);
  const pct = (v) => Math.round((costs.filter((c) => c <= v).length / costs.length) * 100);

  const appsOut = eApps.map((a) => {
    const ac = eComps.filter((c) => c.app_id === a.id);
    const acIds = new Set(ac.map((c) => c.id));
    const tl = [...new Map(builtWith.filter((b) => acIds.has(b.src_id)).map((b) => techById[b.dst_id]).filter(Boolean).map((t) => [t.id, t])).values()];
    const eol = tl.filter(isEol);
    const libsV = [...new Set(usesLib.filter((u) => acIds.has(u.src_id)).map((u) => libById[u.dst_id]).filter((l) => l && l.vulnerable === "True").map((l) => `${l.name} ${l.version} — ${l.advisory}`))];
    const dec = decisions.find((d) => d.app_id === a.id);
    const cap = supports.find((s) => s.src_id === a.id);
    const tier = a.criticality;
    const debt = tl.length ? Math.round((eol.length / tl.length) * 100) : 0;
    const risk = Math.min(100, (tier === "tier1" ? 55 : tier === "tier2" ? 35 : 20) + eol.length * 10 + libsV.length * 10 + (a.dr_site_id ? 0 : tier === "tier1" ? 15 : 0));
    const cost = pct(Number(a.annual_run_cost_inr));
    const fit = Math.max(0, Math.min(100, 100 - debt * 0.6 - (a.lifecycle === "retire_decided" ? 50 : 0) - (a.hosting === "on_prem" ? 10 : 0)));
    let path7 = "Retain";
    if (a.lifecycle === "retire_decided" || dec?.decision === "retire") path7 = "Retire";
    else if (a.hosting === "saas") path7 = eol.length ? "Repurchase" : "Retain";
    else if (a.hosting === "cloud") path7 = eol.length >= 2 ? "Refactor" : "Retain";
    else if (eol.length >= 2 && tier === "tier1") path7 = "Replatform";
    else if (eol.length >= 2) path7 = "Repurchase";
    else if (eol.length === 1) path7 = "Refactor";
    else if (a.dr_site_id && a.primary_site_id && a.hosting_model === "colo") path7 = "Rehost";
    else path7 = "Relocate";
    const dep = dependents[a.id] ?? 0;
    const wave = path7 === "Retain" ? 0 : path7 === "Retire" ? (dep ? 2 : 1) : dep > 3 ? 3 : dep > 0 ? 2 : 1;
    return {
      id: a.id, name: a.name, owner: a.owner, tier, hosting: a.hosting, model: a.hosting_model, dataClass: a.data_class, costInr: Number(a.annual_run_cost_inr), infraInr: num(a.infra_cost_inr),
      users: num(a.users), lifecycle: a.lifecycle, rtoH: num(a.rto_hours), primary: a.primary_site_id || null, dr: a.dr_site_id || null,
      capability: cap ? caps.find((c) => c.id === cap.dst_id)?.name ?? "" : "",
      components: ac.length, techs: tl.map((t) => ({ id: t.id, name: `${t.product_title} ${t.cycle}`, product: t.product, eol: t.eol_date, status: t.status, past: isEol(t) })),
      eolTechs: eol.length, vulnLibs: libsV, regs: subjectTo.filter((s) => s.src_id === a.id).map((s) => regs.find((r) => r.id === s.dst_id)?.name ?? s.dst_id),
      decision: dec ? { id: dec.id, forum: dec.forum, on: dec.decided_on, decision: dec.decision, rationale: dec.rationale, approver: dec.approver, evidence: dec.evidence_ref, status: dec.status } : null,
      path: path7, scores: { fit: Math.round(fit), cost, risk, debt }, wave, dependents: dep,
    };
  });

  const appName = Object.fromEntries(eApps.map((a) => [a.id, a.name]));
  const weakLinks = calls.filter((c) => compById[c.src_id]?.enterprise_id === eid && Number(c.confidence) < 0.6).sort((a, b) => a.confidence - b.confidence).slice(0, 40).map((c) => ({
    id: `${c.src_id}>${c.dst_id}`, from: compById[c.src_id]?.name, fromApp: appName[compById[c.src_id]?.app_id], to: compById[c.dst_id]?.name, toApp: appName[compById[c.dst_id]?.app_id] ?? compById[c.dst_id]?.app_id,
    protocol: c.protocol, evidence: c.evidence, confidence: Number(c.confidence),
  }));

  const eStd = standards.filter((s) => s.enterprise_id === eid).map((s) => ({
    id: s.id, name: s.name, framework: s.framework, product: s.mandates_product,
    governs: governs.filter((g) => g.src_id === s.id).map((g) => techById[g.dst_id] ? `${techById[g.dst_id].product_title} ${techById[g.dst_id].cycle}` : g.dst_id),
    deviations: answers["20"][eid]?.[s.name] ?? (Object.entries(answers["20"][eid] ?? {}).find(([k]) => k.startsWith(s.name))?.[1] ?? null),
  }));

  const eRuns = runs.filter((r) => r.enterprise_id === eid);
  const plById = Object.fromEntries(pipelines.map((p) => [p.id, p]));
  const repoById = Object.fromEntries(repos.map((r) => [r.id, r]));
  const eDeps = deployments.filter((d) => d.enterprise_id === eid).sort((a, b) => (a.deployed_at < b.deployed_at ? 1 : -1));
  const runById = Object.fromEntries(eRuns.map((r) => [r.id, r]));
  const eInc = incidents.filter((i) => i.enterprise_id === eid && i.domain !== "dc").sort((a, b) => (a.opened_at < b.opened_at ? 1 : -1));
  const depById = Object.fromEntries(eDeps.map((d) => [d.id, d]));
  const incOut = eInc.slice(0, 30).map((i) => {
    const d = depById[i.caused_by_deployment];
    return { id: i.id, severity: Number(i.severity), openedAt: i.opened_at, durationMin: num(i.duration_min), rootCause: i.root_cause, status: i.status, app: appName[i.app_id] ?? i.app_id, deployment: d ? { id: d.id, component: compById[d.component_id]?.name, at: d.deployed_at, rolledBack: d.rolled_back === "True", commit: runById[d.run_id]?.commit_sha ?? "" } : null };
  });
  const recentRuns = eRuns.sort((a, b) => (a.started_at < b.started_at ? 1 : -1)).slice(0, 25).map((r) => {
    const pl = plById[r.pipeline_id];
    const comp = pl ? compById[repoById[pl.repo_id]?.component_id] : null;
    return { id: r.id, pipeline: pl?.name ?? r.pipeline_id, app: comp ? appName[comp.app_id] : "", stages: pl?.stages.split(";") ?? [], result: r.result, failedStage: r.failed_stage || null, at: r.started_at, durationMin: Number(r.duration_min), commit: r.commit_sha };
  });

  const eRes = cres.filter((c) => c.enterprise_id === eid);
  const idle = eRes.filter((c) => Number(c.avg_cpu_pct) < 5 && c.environment !== "prod").sort((a, b) => b.monthly_base_inr - a.monthly_base_inr).slice(0, 15)
    .map((c) => ({ id: c.id, service: c.service_name, env: c.environment, region: c.region, cpu: Number(c.avg_cpu_pct), monthlyInr: Number(c.monthly_base_inr), app: c.tag_application || "—", owner: c.tag_owner || "—" }));

  // Scorecard: 4 areas x 3 measures, each scored 0-100 (higher is better)
  const p25 = answers["25"][eid], q16 = answers["16"][eid], q18 = answers["18"][eid], q19 = answers["19"][eid], q10 = answers["10"][eid];
  const devTotal = Object.values(answers["20"][eid] ?? {}).reduce((s, v) => s + v, 0);
  const retireOpen = (answers["17"][eid] ?? []).length;
  const tier1NoDr = appsOut.filter((a) => a.tier === "tier1" && !a.dr && a.hosting !== "saas").length;
  const clamp = (v) => Math.max(0, Math.min(100, Math.round(v)));
  const scorecard = [
    { area: "Landscape", measure: "Apps free of end-of-life tech", score: clamp(100 - p25.eol_app_pct), target: 85, raw: `${p25.eol_app_pct}% of apps on EOL tech` },
    { area: "Landscape", measure: "Standards conformance", score: clamp(100 - (devTotal / eApps.length) * 100), target: 80, raw: `${devTotal} deviations` },
    { area: "Landscape", measure: "Unsupported components", score: clamp(100 - (q16.components / eComps.length) * 100), target: 90, raw: `${q16.components} of ${eComps.length} components` },
    { area: "Applications", measure: "Retire decisions executed", score: clamp(100 - retireOpen * 15), target: 100, raw: `${retireOpen} still running` },
    { area: "Applications", measure: "Tier-1 apps with DR", score: clamp(100 - (tier1NoDr / Math.max(1, p25.tier1)) * 100), target: 100, raw: `${tier1NoDr} tier-1 without DR` },
    { area: "Applications", measure: "Vulnerable libraries", score: clamp(100 - (appsOut.filter((a) => a.vulnLibs.length).length / eApps.length) * 100), target: 95, raw: `${appsOut.filter((a) => a.vulnLibs.length).length} apps affected` },
    { area: "Pipelines", measure: "Pipeline success rate", score: clamp(100 - q18.fail_rate * 100), target: 92, raw: `${Math.round(q18.fail_rate * 1000) / 10}% failed` },
    { area: "Pipelines", measure: "Stable pipelines", score: clamp(100 - q18.flaky_pipelines * 4), target: 90, raw: `${q18.flaky_pipelines} flaky` },
    { area: "Pipelines", measure: "Incidents traced to a change", score: clamp(answers["9"][eid].share * 100), target: 90, raw: `${answers["9"][eid].traced} of ${answers["9"][eid].incidents}` },
    { area: "Cloud", measure: "Owner-tagged resources", score: clamp(100 - (q19.no_owner_tag / q19.resources) * 100), target: 95, raw: `${q19.no_owner_tag} untagged of ${q19.resources}` },
    { area: "Cloud", measure: "Cost attributable by tag", score: clamp(q10.tag_attributable_pct), target: 95, raw: `${q10.tag_attributable_pct}% by tag` },
    { area: "Cloud", measure: "Non-prod utilisation", score: clamp(100 - (q19.idle_nonprod / q19.resources) * 400), target: 90, raw: `${q19.idle_nonprod} idle non-prod` },
  ];

  const filt = (arr, key = "enterprise") => (arr ?? []).filter((x) => x[key] === eid);
  write(`ent-${eid}.json`, {
    enterprise: { id: eid, name: e.name, kind: e.kind, hq: e.hq_country, story: e.story },
    apps: appsOut, appLinks, weakLinks, standards: eStd,
    pipelines: { ...q18, recent: recentRuns }, deployments: eDeps.slice(0, 20).map((d) => ({ id: d.id, app: appName[d.app_id], component: compById[d.component_id]?.name, env: d.env, at: d.deployed_at, causedIncident: d.caused_incident === "True", rolledBack: d.rolled_back === "True" })),
    incidents: incOut, traced: answers["9"][eid],
    cloud: { ...q19, ...q10, idle }, scorecard, priorities: answers["11"][eid],
    retireNotDone: (answers["17"][eid] ?? []).map(([app, dependents, cost]) => ({ app, dependents, costInr: cost })),
    hotspots: Object.entries(answers["8"]).filter(([name]) => eComps.some((c) => c.name.toLowerCase() === name.toLowerCase() || appsOut.some((a) => a.name === name))).map(([name, v]) => ({ name, ...v })),
    residency: filt(answers["21"].breaches), crossBorder: filt(answers["21"].cross_border_personal_data_to_review),
    dr: { singlePathDr: answers["22"].dr_site_single_path.apps.filter((x) => eApps.some((a) => x.startsWith(a.name + " "))), sharedGrid: answers["22"].dr_shares_utility_grid.apps.filter((x) => eApps.some((a) => x.startsWith(a.name + " "))), noDr: answers["22"].no_dr.apps.filter((x) => eApps.some((a) => x.startsWith(a.name + " "))) },
    profile: p25,
  });
}
write("enterprises.json", ents.map((e) => ({ id: e.id, name: e.name, kind: e.kind })));

for (const f of fs.readdirSync(out)) console.log(`  ${f}  ${(fs.statSync(path.join(out, f)).size / 1024).toFixed(0)} KB`);
console.log("ok: console data built");
