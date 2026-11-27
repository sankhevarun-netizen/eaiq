/**
 * Deterministic DC engines over a site's graph (same input, same output).
 * Power: an asset is down when it fails, or when every supply/backup feeder into it is down.
 * A rack is lost when both its A and B RPPs are down, single-path when one is.
 */
import type { Runbook, SiteData } from "@/lib/consoleData";

export function graphIndex(s: SiteData) {
  const into = new Map<string, string[]>();
  const supplyInto = new Map<string, string[]>(); // batteries bridge minutes, not a maintenance window
  const outOf = new Map<string, string[]>();
  const rackFeeds = new Map<string, { rpp: string; side: string }[]>();
  const rowCrah = new Map<string, string[]>();
  for (const [a, b, t, side] of s.links) {
    if (t === "FEEDS" || t === "BACKUP" || t === "COOLS") {
      (into.get(b) ?? into.set(b, []).get(b)!).push(a);
      if (t !== "BACKUP") (supplyInto.get(b) ?? supplyInto.set(b, []).get(b)!).push(a);
      (outOf.get(a) ?? outOf.set(a, []).get(a)!).push(b);
    } else if (t === "POWERS_RACK") {
      (rackFeeds.get(b) ?? rackFeeds.set(b, []).get(b)!).push({ rpp: a, side: side ?? "" });
      (outOf.get(a) ?? outOf.set(a, []).get(a)!).push(b);
    } else if (t === "COOLS_ROW") {
      (rowCrah.get(b) ?? rowCrah.set(b, []).get(b)!).push(a);
      (outOf.get(a) ?? outOf.set(a, []).get(a)!).push(b);
    }
  }
  return { into, supplyInto, outOf, rackFeeds, rowCrah };
}

export function downAssets(s: SiteData, failed: string[]) {
  const { supplyInto: into } = graphIndex(s);
  const down = new Set(failed);
  let changed = true;
  while (changed) {
    changed = false;
    for (const a of s.assets) {
      if (down.has(a.id)) continue;
      const src = into.get(a.id);
      if (src && src.length && src.every((x) => down.has(x))) { down.add(a.id); changed = true; }
    }
  }
  return down;
}

export function downstream(s: SiteData, id: string) {
  const { outOf } = graphIndex(s);
  const seen = new Set<string>(), st = [id];
  while (st.length) { const c = st.pop()!; for (const n of outOf.get(c) ?? []) if (!seen.has(n)) { seen.add(n); st.push(n); } }
  return [...seen];
}

export function upstream(s: SiteData, id: string) {
  const { into, rackFeeds } = graphIndex(s);
  const seen = new Set<string>(), st = [id];
  while (st.length) {
    const c = st.pop()!;
    const ups = [...(into.get(c) ?? []), ...(rackFeeds.get(c) ?? []).map((r) => r.rpp)];
    for (const n of ups) if (!seen.has(n)) { seen.add(n); st.push(n); }
  }
  return [...seen];
}

export interface TenantImpact { tenant: string; lost: number; single: number; notifyMin: number | null; penaltyInr: number }
export interface SwitchResult {
  asset: string;
  verdict: "GO" | "GO WITH CONDITIONS" | "NO-GO";
  lostAlone: number; singlePath: number; lostWithAlerts: number;
  blockingAlerts: string[];
  tenants: TenantImpact[];
  exposureInr: number;
  coolingRows: { row: string; remaining: number; total: number }[];
  conditions: string[];
  windows: { start: string; score: number; reason: string }[];
  runbook: Runbook | null;
}

const OUTAGE_HOURS = 4;

/** D4 switchover engine. */
export function simulateChange(s: SiteData, assetId: string, runbooks: Runbook[] | null): SwitchResult {
  const { rackFeeds, rowCrah } = graphIndex(s);
  const openOutage = s.alerts.filter((a) => a.status === "open" && a.cls === "outage" && a.targetType === "Asset" && a.target !== assetId).map((a) => a.target);
  const alone = downAssets(s, [assetId]);
  const withAlerts = downAssets(s, [assetId, ...openOutage]);
  const baseline = downAssets(s, openOutage);

  let lostAlone = 0, single = 0, lostWith = 0;
  const per = new Map<string, TenantImpact>();
  for (const r of s.racks) {
    const f = rackFeeds.get(r.id) ?? [];
    if (!f.length) continue;
    const dA = f.filter((x) => alone.has(x.rpp)).length;
    const dW = f.filter((x) => withAlerts.has(x.rpp)).length;
    const dB = f.filter((x) => baseline.has(x.rpp)).length;
    const isLostAlone = dA === f.length;
    const isLostWith = dW === f.length && dB < f.length;
    const isSingle = !isLostAlone && dA > 0;
    if (isLostAlone) lostAlone++;
    if (isLostWith) lostWith++;
    if (isSingle) single++;
    if ((isLostWith || isSingle) && r.tenant) {
      const t = s.tenants.find((x) => x.id === r.tenant);
      const k = t?.name ?? r.tenant;
      const cur = per.get(k) ?? { tenant: k, lost: 0, single: 0, notifyMin: t?.contract?.notifyMin ?? null, penaltyInr: 0 };
      if (isLostWith) cur.lost++;
      else cur.single++;
      per.set(k, cur);
    }
  }
  for (const t of per.values()) {
    const c = s.tenants.find((x) => x.name === t.tenant)?.contract;
    if (c && t.lost) t.penaltyInr = c.ratePerH * Math.max(0, OUTAGE_HOURS - c.thresholdH);
  }

  const coolingRows: SwitchResult["coolingRows"] = [];
  for (const [row, crahs] of rowCrah) {
    const d = crahs.filter((c) => alone.has(c)).length;
    if (d) coolingRows.push({ row, remaining: crahs.length - d, total: crahs.length });
  }

  const tenants = [...per.values()].sort((a, b) => b.lost - a.lost || b.single - a.single);
  const exposureInr = tenants.reduce((x, t) => x + t.penaltyInr, 0);
  const blockingAlerts = lostWith > lostAlone ? openOutage : [];
  const conditions: string[] = [];
  const watch = s.watchlist.filter((w) => downstream(s, w.id).length && single + lostWith > 0).slice(0, 2);
  if (blockingAlerts.length) conditions.push(`Open outage on ${blockingAlerts.join(", ")} — ${lostWith} racks would be lost if this change runs now; repair it first`);
  if (single) conditions.push(`${single} racks drop to a single path for the window`);
  for (const w of watch) if (w.riseC) conditions.push(`${w.id} is on the D3 watchlist (+${w.riseC} °C vs peers) on the remaining path`);
  if (coolingRows.some((r) => r.remaining === 0)) conditions.push("Rows lose all cooling — not permitted");
  for (const t of tenants.filter((t) => t.notifyMin)) conditions.push(`Notify ${t.tenant} at least ${t.notifyMin} min before (contract)`);

  const verdict: SwitchResult["verdict"] = lostAlone > 0 || lostWith > 0 || coolingRows.some((r) => r.remaining === 0) ? "NO-GO" : single > 0 || coolingRows.length ? "GO WITH CONDITIONS" : "GO";

  // Windows over the next 14 days: nights 01:00 IST, after any booking/repair on the blocking assets
  const blockEnd = s.bookings.filter((b) => blockingAlerts.includes(b.asset)).map((b) => +new Date(b.end)).sort().pop() ?? 0;
  const busy = s.bookings.filter((b) => b.asset !== assetId);
  const windows: SwitchResult["windows"] = [];
  const start = new Date("2026-11-27T19:30:00Z");
  for (let d = 1; d <= 14; d++) {
    const w = new Date(start.getTime() + d * 864e5);
    const day = new Date(w.getTime() + 5.5 * 36e5).getUTCDay();
    let score = 90 - (day === 0 || day === 6 ? 0 : 8) - d;
    const reasons: string[] = [day === 0 || day === 6 ? "weekend night, lowest load" : "weekday night"];
    if (+w < blockEnd) { score -= 60; reasons.push("before the blocking repair completes"); }
    const clash = busy.find((b) => Math.abs(+new Date(b.start) - +w) < 864e5);
    if (clash) { score -= 25; reasons.push(`overlaps ${clash.purpose} on ${clash.asset}`); }
    windows.push({ start: w.toISOString(), score: Math.max(5, score), reason: reasons.join("; ") });
  }
  windows.sort((a, b) => b.score - a.score);

  const type = s.assets.find((a) => a.id === assetId)?.type ?? "";
  const rb = runbooks?.find((r) => r.type === type && /maintenance|bypass|switchover|transfer/i.test(r.title)) ?? runbooks?.find((r) => r.type === type) ?? null;

  return { asset: assetId, verdict, lostAlone, singlePath: single, lostWithAlerts: lostWith, blockingAlerts, tenants, exposureInr, coolingRows, conditions, windows: windows.slice(0, 5), runbook: rb };
}

/** D2 fit check: N racks at K kW. Candidates are halls whose rack rating, vacancy and measured headroom allow it. */
export function fitCheck(s: SiteData, racks: number, kwPerRack: number) {
  const need = racks * kwPerRack;
  const rows = s.halls.map((h) => {
    const reasons: string[] = [];
    if (h.rackKw < kwPerRack) reasons.push(`rack rating ${h.rackKw} kW < ${kwPerRack} kW`);
    if (h.vacant < racks) reasons.push(`${h.vacant} vacant racks < ${racks}`);
    if (h.headroomKw < need) reasons.push(`measured headroom ${h.headroomKw} kW < ${need} kW`);
    if (h.limitKw - h.soldKw < need) reasons.push(`sold ${h.soldKw} kW of ${h.limitKw} kW (${h.binding}-bound)`);
    return { hall: h, fits: reasons.length === 0, reasons };
  });
  const fits = rows.filter((r) => r.fits);
  const best = [...rows].sort((a, b) => a.reasons.length - b.reasons.length || b.hall.headroomKw - a.hall.headroomKw)[0];
  const plan = fits.length ? [] : [
    best.hall.rackKw < kwPerRack && { title: `Re-rate ${best.hall.name} racks to ${kwPerRack} kW`, detail: "Rear-door or in-row cooling and higher-rated rack PDUs for the target rows", outage: "Row-by-row, tenants stay dual-fed" },
    best.hall.binding === "cooling" && { title: `Add CRAH capacity in ${best.hall.name}`, detail: "Cooling is the binding constraint on this hall", outage: "None — parallel install" },
    (best.hall.binding === "rpp" || best.hall.binding === "ups") && { title: `Upgrade ${best.hall.binding.toUpperCase()} capacity serving ${best.hall.name}`, detail: `${best.hall.binding.toUpperCase()} is the binding constraint (${best.hall.strandedKw} kW stranded)`, outage: "Single-path during swap — run through D4" },
    best.hall.vacant < racks && { title: `Reclaim or build ${racks - best.hall.vacant} rack positions`, detail: `${best.hall.vacant} vacant today`, outage: "None" },
  ].filter(Boolean) as { title: string; detail: string; outage: string }[];
  return { need, rows, fits: fits.length > 0, best, plan };
}
