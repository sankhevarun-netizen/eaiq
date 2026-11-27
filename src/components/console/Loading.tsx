export function Loading({ what = "site data" }: { what?: string }) {
  return <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-400 shadow-card">Loading {what}…</div>;
}
